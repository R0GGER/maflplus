import {
  assertValidDataImage,
  BACKGROUND_WEBP_QUALITY,
  DATA_IMAGE_MAX_BYTES,
  optimizeBackgroundImage,
  writeDataImage,
} from '~/server/utils/dataImages'

function partText(parts: { name?: string; data?: Buffer }[] | undefined, name: string): string {
  const part = parts?.find(p => p.name === name && p.data)
  return part?.data?.toString('utf-8').trim() || ''
}

export default defineEventHandler(async (event) => {
  await requireAdminSession(event)

  const parts = await readMultipartFormData(event)
  const filePart = parts?.find(p => p.name === 'file' && p.data)

  if (!filePart || !filePart.data) {
    throw createError({ statusCode: 400, statusMessage: 'No file uploaded (expected field "file")' })
  }

  if (filePart.data.length > DATA_IMAGE_MAX_BYTES) {
    throw createError({
      statusCode: 413,
      statusMessage: `File too large (max ${DATA_IMAGE_MAX_BYTES / 1024 / 1024}MB)`,
    })
  }

  const purpose = partText(parts, 'purpose')
  const optimizeBackground = purpose === 'background'

  try {
    const { filename } = assertValidDataImage({
      buffer: filePart.data,
      originalName: filePart.filename || '',
      mime: filePart.type,
    })

    let outBuffer = filePart.data
    let outName = filename
    let originalSize = filePart.data.length
    let optimized = false
    let format = filename.split('.').pop() || ''

    if (optimizeBackground) {
      const result = await optimizeBackgroundImage(filePart.data, filename)
      outBuffer = result.buffer
      outName = result.filename
      originalSize = result.originalSize
      optimized = result.optimized
      format = result.format
    }

    const saved = await writeDataImage(outName, outBuffer)
    return {
      ok: true,
      ...saved,
      originalSize,
      optimized,
      format,
      quality: optimized ? BACKGROUND_WEBP_QUALITY : undefined,
    }
  }
  catch (e: any) {
    const message = e?.message || 'Failed to save image'
    if (/too large/i.test(message)) {
      throw createError({ statusCode: 413, statusMessage: message })
    }
    const known = /unsupported|empty|extension|contents|filename|optimize/i.test(message)
    throw createError({
      statusCode: known ? 400 : 422,
      statusMessage: message,
    })
  }
})
