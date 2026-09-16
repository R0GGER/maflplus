import { existsSync } from 'node:fs'
import { mkdir, readdir, stat, writeFile } from 'node:fs/promises'
import { basename, extname, posix, resolve } from 'node:path'
import sharp from 'sharp'

export const DATA_ROOT = resolve('./data')

export const DATA_IMAGE_EXTS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.svg',
  '.avif',
  '.ico',
])

/** Formats we accept for new uploads (served by `/api/assets`). */
export const DATA_IMAGE_UPLOAD_EXTS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.svg',
  '.avif',
])

export const DATA_IMAGE_MAX_BYTES = 10 * 1024 * 1024

const MIME_TO_EXT_KIND: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpeg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
  'image/avif': 'avif',
}

const EXT_TO_KIND: Record<string, string> = {
  '.png': 'png',
  '.jpg': 'jpeg',
  '.jpeg': 'jpeg',
  '.gif': 'gif',
  '.webp': 'webp',
  '.svg': 'svg',
  '.avif': 'avif',
}

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])

const MAX_DEPTH = 2
const MAX_ENTRIES = 500

export interface DataImage {
  /** File name only, e.g. `logo.png`. */
  name: string
  /** Path relative to `./data/`, e.g. `favicons/source.png`. Suitable as-is
   *  for the `logo` / `background` YAML fields and for `/api/assets/`. */
  path: string
  size: number
  mtime: number
}

function looksLikePng(buf: Buffer): boolean {
  return buf.length >= 8 && buf.subarray(0, 8).equals(PNG_MAGIC)
}

function looksLikeJpeg(buf: Buffer): boolean {
  return buf.length >= 3 && buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF
}

function looksLikeGif(buf: Buffer): boolean {
  if (buf.length < 6) return false
  const head = buf.subarray(0, 6).toString('ascii')
  return head === 'GIF87a' || head === 'GIF89a'
}

function looksLikeWebp(buf: Buffer): boolean {
  return buf.length >= 12
    && buf.subarray(0, 4).toString('ascii') === 'RIFF'
    && buf.subarray(8, 12).toString('ascii') === 'WEBP'
}

function looksLikeAvif(buf: Buffer): boolean {
  if (buf.length < 12) return false
  if (buf.subarray(4, 8).toString('ascii') !== 'ftyp') return false
  const head = buf.subarray(0, Math.min(buf.length, 64)).toString('ascii')
  return head.includes('avif') || head.includes('avis')
}

function looksLikeSvg(buf: Buffer): boolean {
  const head = buf.subarray(0, Math.min(buf.length, 1024)).toString('utf-8').trimStart()
  return head.startsWith('<?xml') || head.startsWith('<svg') || head.includes('<svg')
}

function looksLikeKind(buf: Buffer, kind: string): boolean {
  switch (kind) {
    case 'png': return looksLikePng(buf)
    case 'jpeg': return looksLikeJpeg(buf)
    case 'gif': return looksLikeGif(buf)
    case 'webp': return looksLikeWebp(buf)
    case 'avif': return looksLikeAvif(buf)
    case 'svg': return looksLikeSvg(buf)
    default: return false
  }
}

/**
 * Turn an uploaded original name into a safe basename that can live next to
 * `config.yml` in `./data/`. Rejects path separators, hidden names, and
 * unknown extensions.
 */
function fallbackUploadName(mime?: string): string {
  const kind = MIME_TO_EXT_KIND[(mime || '').toLowerCase()]
  if (kind === 'jpeg') return 'upload.jpg'
  if (kind) return `upload.${kind}`
  return 'upload.png'
}

export function sanitizeDataImageFilename(original: string, mime?: string): string {
  const base = original.replace(/\\/g, '/').split('/').pop()?.trim() || fallbackUploadName(mime)
  const ext = extname(base).toLowerCase()
  if (!DATA_IMAGE_UPLOAD_EXTS.has(ext)) {
    throw new Error('Unsupported image type. Use PNG, JPG, GIF, WebP, SVG or AVIF.')
  }

  let stem = base.slice(0, -ext.length)
  stem = stem.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^[.-]+|[.-]+$/g, '')
  if (!stem) stem = 'upload'
  return `${stem}${ext}`
}

export function assertValidDataImage(opts: {
  buffer: Buffer
  originalName: string
  mime?: string
}): { filename: string } {
  const { buffer, originalName } = opts
  const mime = (opts.mime || '').toLowerCase()

  if (!buffer.length) {
    throw new Error('Uploaded file is empty')
  }
  if (buffer.length > DATA_IMAGE_MAX_BYTES) {
    throw new Error(`File too large (max ${DATA_IMAGE_MAX_BYTES / 1024 / 1024}MB)`)
  }

  const filename = sanitizeDataImageFilename(originalName || fallbackUploadName(mime), mime)
  const ext = extname(filename).toLowerCase()
  const extKind = EXT_TO_KIND[ext]
  if (!extKind) {
    throw new Error('Unsupported image type. Use PNG, JPG, GIF, WebP, SVG or AVIF.')
  }

  if (mime) {
    const mimeKind = MIME_TO_EXT_KIND[mime]
    if (mimeKind && mimeKind !== extKind) {
      throw new Error('File extension does not match the image type')
    }
  }

  if (!looksLikeKind(buffer, extKind)) {
    throw new Error('File contents do not match the image type')
  }

  return { filename }
}

export const BACKGROUND_WEBP_QUALITY = 80

export interface OptimizedBackground {
  buffer: Buffer
  filename: string
  originalSize: number
  optimized: boolean
  format: 'webp' | 'svg'
}

/**
 * Re-encode a raster background as WebP at 80% quality. SVG is left as-is
 * because rasterising a vector would only lose quality.
 */
export async function optimizeBackgroundImage(
  buffer: Buffer,
  originalFilename: string,
): Promise<OptimizedBackground> {
  const ext = extname(originalFilename).toLowerCase()
  if (ext === '.svg') {
    return {
      buffer,
      filename: originalFilename,
      originalSize: buffer.length,
      optimized: false,
      format: 'svg',
    }
  }

  const stem = originalFilename.slice(0, -ext.length) || 'background'
  const filename = `${stem}.webp`

  try {
    const out = await sharp(buffer, { animated: false, failOn: 'none' })
      .rotate()
      .webp({ quality: BACKGROUND_WEBP_QUALITY, effort: 4 })
      .toBuffer()

    if (!out.length) {
      throw new Error('Optimized image is empty')
    }

    return {
      buffer: out,
      filename,
      originalSize: buffer.length,
      optimized: true,
      format: 'webp',
    }
  }
  catch (e: any) {
    const detail = e?.message || String(e)
    throw new Error(`Failed to optimize background: ${detail}`)
  }
}

export async function writeDataImage(filename: string, buffer: Buffer): Promise<{
  path: string
  name: string
  size: number
  overwritten: boolean
}> {
  if (filename.includes('/') || filename.includes('\\') || filename.includes('..') || filename.startsWith('.')) {
    throw new Error('Invalid filename')
  }

  await mkdir(DATA_ROOT, { recursive: true })
  const abs = resolve(DATA_ROOT, filename)
  if (basename(abs) !== filename) {
    throw new Error('Invalid filename')
  }

  const overwritten = existsSync(abs)
  await writeFile(abs, buffer)

  return {
    path: filename,
    name: filename,
    size: buffer.length,
    overwritten,
  }
}

async function walk(
  dir: string,
  relPrefix: string,
  depth: number,
  out: DataImage[],
): Promise<void> {
  if (out.length >= MAX_ENTRIES) return
  if (depth > MAX_DEPTH) return

  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  }
  catch {
    return
  }

  for (const entry of entries) {
    if (out.length >= MAX_ENTRIES) break

    // Skip hidden files / folders (`.favicon-cache`, `.icon-url-cache`, dotfiles
    // like `.meta.json`, ...) - they're internal caches, not user content.
    if (entry.name.startsWith('.')) continue

    const childAbs = resolve(dir, entry.name)
    const childRel = relPrefix ? posix.join(relPrefix, entry.name) : entry.name

    if (entry.isDirectory()) {
      await walk(childAbs, childRel, depth + 1, out)
      continue
    }

    if (!entry.isFile()) continue

    const ext = extname(entry.name).toLowerCase()
    if (!DATA_IMAGE_EXTS.has(ext)) continue

    try {
      const st = await stat(childAbs)
      out.push({
        name: entry.name,
        path: childRel,
        size: st.size,
        mtime: Math.round(st.mtimeMs),
      })
    }
    catch {}
  }
}

export async function listDataImages(): Promise<DataImage[]> {
  if (!existsSync(DATA_ROOT)) {
    return []
  }

  const images: DataImage[] = []
  await walk(DATA_ROOT, '', 0, images)

  // Root files first (shorter path -> fewer slashes), then alphabetical so the
  // dropdown is predictable across reloads.
  images.sort((a, b) => {
    const da = a.path.split('/').length
    const db = b.path.split('/').length
    if (da !== db) return da - db
    return a.path.localeCompare(b.path)
  })

  return images
}
