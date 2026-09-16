<template>
  <div
    ref="rootRef"
    class="relative"
    @dragover.prevent="onDragOver"
    @dragleave="onDragLeave"
    @drop.prevent="onDrop"
  >
    <input
      ref="fileInput"
      type="file"
      accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml,image/avif,.png,.jpg,.jpeg,.gif,.webp,.svg,.avif"
      class="hidden"
      @change="handlePick"
    >

    <!-- Trigger button -->
    <button
      v-if="!customMode"
      type="button"
      class="admin-input w-full flex items-center gap-2 text-left"
      :class="open || dragOver ? 'ring-1 ring-brand-500' : ''"
      @click="toggle"
    >
      <span
        class="flex-shrink-0 rounded border border-fg/10 bg-background flex items-center justify-center overflow-hidden"
        :class="variant === 'wide' ? 'w-12 h-7' : 'w-7 h-7'"
      >
        <img
          v-if="previewUrl"
          :src="previewUrl"
          alt=""
          :class="variant === 'wide' ? 'w-full h-full object-cover' : 'w-full h-full object-contain'"
          @error="onPreviewError"
        >
        <Icon v-else name="ph:image" class="w-4 h-4 text-fg-dimmed" />
      </span>
      <span class="flex-1 truncate text-sm">
        <span v-if="modelValue" class="text-fg">{{ modelValue }}</span>
        <span v-else class="text-fg-dimmed">{{ placeholder || 'Select an image…' }}</span>
      </span>
      <Icon
        name="ph:caret-down-bold"
        class="w-3.5 h-3.5 text-fg-dimmed transition-transform"
        :class="open ? 'rotate-180' : ''"
      />
    </button>

    <!-- Manual entry mode -->
    <div v-else class="flex items-center gap-2">
      <input
        ref="customInputRef"
        :value="modelValue"
        type="text"
        class="admin-input flex-1"
        :placeholder="placeholder || 'filename.png'"
        @input="onCustomInput"
      >
      <button
        type="button"
        class="text-xs px-2 py-1.5 rounded border border-fg/15 text-fg hover:bg-fg/5 transition-colors whitespace-nowrap"
        :title="'Back to image picker'"
        @click="exitCustomMode"
      >
        <Icon name="ph:images" class="w-4 h-4" />
      </button>
    </div>

    <div
      v-if="variant === 'wide' && previewUrl"
      class="mt-2 rounded border border-fg/10 overflow-hidden h-24 bg-background"
    >
      <img
        :src="previewUrl"
        alt=""
        class="w-full h-full object-cover"
        @error="onPreviewError"
      >
    </div>

    <p v-if="uploadError" class="mt-1 text-xs text-red-400">{{ uploadError }}</p>
    <p v-else-if="dragOver" class="mt-1 text-xs text-brand-300">Drop to upload into data/</p>

    <!-- Dropdown panel -->
    <div
      v-show="open"
      class="absolute z-30 left-0 right-0 mt-1 border border-fg/10 rounded-md bg-background shadow-lg overflow-hidden"
    >
      <div class="flex items-center justify-between px-3 py-2 border-b border-fg/10 bg-fg/5">
        <span class="text-xs font-semibold text-fg-dimmed uppercase tracking-wide">
          Images in data/
        </span>
        <button
          type="button"
          class="text-xs text-fg-dimmed hover:text-fg flex items-center gap-1"
          :disabled="loading || uploading"
          :title="'Rescan data/ folder'"
          @click.stop="reload"
        >
          <Icon
            name="ph:arrow-clockwise-bold"
            class="w-3.5 h-3.5"
            :class="loading ? 'animate-spin' : ''"
          />
          Refresh
        </button>
      </div>

      <div class="max-h-72 overflow-y-auto">
        <div v-if="loading" class="px-3 py-4 text-xs text-fg-dimmed text-center">
          Loading…
        </div>
        <div v-else-if="loadError" class="px-3 py-3 text-xs text-red-300">
          {{ loadError }}
        </div>
        <div v-else-if="!images.length" class="px-3 py-4 text-xs text-fg-dimmed text-center">
          No images found in data/.<br>
          Upload one below, or drop a PNG, JPG, SVG, GIF or WebP here.
        </div>
        <ul v-else class="py-1">
          <li v-for="img in images" :key="img.path">
            <button
              type="button"
              class="w-full flex items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-fg/5 transition-colors"
              :class="img.path === modelValue ? 'bg-brand-500/10 text-brand-200' : 'text-fg'"
              @click.stop="select(img.path)"
            >
              <span
                class="flex-shrink-0 rounded border border-fg/10 bg-background flex items-center justify-center overflow-hidden"
                :class="variant === 'wide' ? 'w-12 h-8' : 'w-8 h-8'"
              >
                <img
                  :src="thumbUrl(img.path)"
                  :alt="img.path"
                  :class="variant === 'wide' ? 'w-full h-full object-cover' : 'w-full h-full object-contain'"
                  loading="lazy"
                >
              </span>
              <span class="flex-1 truncate">
                <span class="block truncate">{{ img.path }}</span>
                <span class="block text-[10px] text-fg-dimmed">
                  {{ formatBytes(img.size) }}
                </span>
              </span>
              <Icon
                v-if="img.path === modelValue"
                name="ph:check-bold"
                class="w-3.5 h-3.5 text-brand-300"
              />
            </button>
          </li>
        </ul>
      </div>

      <div class="border-t border-fg/10 flex items-stretch">
        <button
          type="button"
          class="px-3 py-2 text-xs text-fg-dimmed hover:bg-fg/5 hover:text-fg transition-colors flex items-center gap-1 disabled:opacity-50"
          :disabled="uploading"
          @click.stop="triggerPick"
        >
          <Icon name="ph:upload-simple-bold" class="w-3.5 h-3.5" />
          {{ uploading ? 'Uploading…' : 'Upload…' }}
        </button>
        <button
          v-if="modelValue"
          type="button"
          class="px-3 py-2 text-xs text-fg-dimmed hover:bg-fg/5 hover:text-fg transition-colors flex items-center gap-1"
          @click.stop="select('')"
        >
          <Icon name="ph:x-bold" class="w-3.5 h-3.5" />
          Clear
        </button>
        <button
          type="button"
          class="flex-1 px-3 py-2 text-xs text-fg-dimmed hover:bg-fg/5 hover:text-fg transition-colors flex items-center justify-end gap-1"
          @click.stop="enterCustomMode"
        >
          <Icon name="ph:pencil-simple-line" class="w-3.5 h-3.5" />
          Custom path…
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface DataImage {
  name: string
  path: string
  size: number
  mtime: number
}

const props = withDefaults(
  defineProps<{
    modelValue: string
    placeholder?: string
    variant?: 'icon' | 'wide'
    optimize?: 'none' | 'background'
  }>(),
  {
    placeholder: '',
    variant: 'icon',
    optimize: 'none',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'toast', payload: { message: string; type: 'success' | 'error' }): void
}>()

const rootRef = ref<HTMLElement | null>(null)
const customInputRef = ref<HTMLInputElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const open = ref(false)
const customMode = ref(false)
const loading = ref(false)
const uploading = ref(false)
const dragOver = ref(false)
const loadError = ref('')
const uploadError = ref('')
const images = ref<DataImage[]>([])
const previewMissing = ref(false)

// Cache-bust the preview thumbnails when the user re-scans, so a re-uploaded
// file with the same name shows the new bytes instead of a stale cached one.
const cacheBust = ref(Date.now())

const previewUrl = computed(() => {
  if (!props.modelValue || previewMissing.value) return ''
  return thumbUrl(props.modelValue)
})

function thumbUrl(p: string) {
  const clean = p.replace(/^\/+/, '')
  return `/api/assets/${clean}?t=${cacheBust.value}`
}

function onPreviewError() {
  previewMissing.value = true
}

watch(() => props.modelValue, () => {
  previewMissing.value = false
})

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

function uploadToast(res: {
  path: string
  size: number
  overwritten?: boolean
  originalSize?: number
  optimized?: boolean
  quality?: number
}): string {
  const verb = res.overwritten ? 'Replaced' : 'Uploaded'
  if (res.optimized && res.originalSize && res.originalSize !== res.size) {
    return `${verb} ${res.path} as WebP ${res.quality || 80}% (${formatBytes(res.size)}, was ${formatBytes(res.originalSize)})`
  }
  if (res.optimized) {
    return `${verb} ${res.path} as WebP ${res.quality || 80}%`
  }
  return `${verb} ${res.path}`
}

async function loadImages() {
  loading.value = true
  loadError.value = ''
  try {
    const res = await $fetch<{ images: DataImage[] }>('/api/admin/data-images')
    images.value = res.images || []
    cacheBust.value = Date.now()
  }
  catch (e: any) {
    loadError.value = e?.statusMessage || 'Failed to load images'
  }
  finally {
    loading.value = false
  }
}

function reload() {
  loadImages()
}

function toggle() {
  open.value = !open.value
  if (open.value && images.value.length === 0 && !loading.value) {
    loadImages()
  }
}

function select(path: string) {
  emit('update:modelValue', path)
  open.value = false
}

function onCustomInput(e: Event) {
  const v = (e.target as HTMLInputElement).value
  emit('update:modelValue', v)
}

function enterCustomMode() {
  customMode.value = true
  open.value = false
  nextTick(() => customInputRef.value?.focus())
}

function exitCustomMode() {
  customMode.value = false
  // Reopen the picker so the user can immediately browse images again.
  nextTick(() => {
    open.value = true
    if (images.value.length === 0) loadImages()
  })
}

function triggerPick() {
  if (uploading.value) return
  fileInput.value?.click()
}

function validatePicked(file: File): string | null {
  const name = (file.name || '').toLowerCase()
  const mime = (file.type || '').toLowerCase()
  const okExt = /\.(png|jpe?g|gif|webp|svg|avif)$/.test(name)
  const okMime = Boolean(mime && mime.startsWith('image/'))
  if (!okExt && !okMime) return 'Only PNG, JPG, GIF, WebP, SVG or AVIF files are accepted.'
  if (file.size === 0) return 'File is empty.'
  if (file.size > 10 * 1024 * 1024) return 'File is larger than 10 MB.'
  return null
}

async function uploadFile(file: File) {
  const err = validatePicked(file)
  if (err) {
    uploadError.value = err
    emit('toast', { message: err, type: 'error' })
    return
  }

  uploading.value = true
  uploadError.value = ''
  try {
    const fd = new FormData()
    fd.append('file', file, file.name)
    if (props.optimize === 'background') {
      fd.append('purpose', 'background')
    }
    const res = await $fetch<{
      ok: true
      path: string
      size: number
      overwritten?: boolean
      originalSize?: number
      optimized?: boolean
      format?: string
      quality?: number
    }>('/api/admin/data-images', {
      method: 'POST',
      body: fd,
    })
    await loadImages()
    emit('update:modelValue', res.path)
    customMode.value = false
    open.value = false
    emit('toast', {
      message: uploadToast(res),
      type: 'success',
    })
  }
  catch (e: any) {
    const msg = e?.data?.statusMessage || e?.statusMessage || 'Failed to upload image'
    uploadError.value = msg
    emit('toast', { message: msg, type: 'error' })
  }
  finally {
    uploading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

function handlePick(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  uploadFile(file)
}

function onDragOver(e: DragEvent) {
  const types = Array.from(e.dataTransfer?.types || [])
  if (!types.includes('Files')) return
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'
  dragOver.value = true
}

function onDragLeave(e: DragEvent) {
  const next = e.relatedTarget as Node | null
  if (rootRef.value && next && rootRef.value.contains(next)) return
  dragOver.value = false
}

function onDrop(e: DragEvent) {
  dragOver.value = false
  const file = e.dataTransfer?.files?.[0]
  if (!file) return
  uploadFile(file)
}

// Click outside / Escape close the dropdown without committing anything.
useEventListener(document, 'mousedown', (e: MouseEvent) => {
  if (!open.value) return
  const target = e.target as Node | null
  if (rootRef.value && target && !rootRef.value.contains(target)) {
    open.value = false
  }
})

useEventListener(document, 'keydown', (e: KeyboardEvent) => {
  if (e.key === 'Escape' && open.value) {
    open.value = false
  }
})
</script>
