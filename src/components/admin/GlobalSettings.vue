<template>
  <section class="admin-section">
    <button class="admin-section-header" @click="open = !open">
      <span class="font-semibold text-fg">Global Settings</span>
      <span class="chevron" :class="{ rotated: open }" />
    </button>
    <div v-show="open" class="admin-section-body">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="admin-label">Title</label>
          <input v-model="state.title" type="text" class="admin-input w-full">
        </div>
        <div>
          <label class="admin-label">Language</label>
          <select v-model="state.lang" class="admin-input w-full">
            <option value="en">English</option>
            <option value="nl">Nederlands</option>
            <option value="de">Deutsch</option>
            <option value="fr">Français</option>
            <option value="es">Español</option>
            <option value="ru">Русский</option>
            <option value="zh">中文</option>
            <option value="hi">हिंदी</option>
            <option value="ar">العربية</option>
            <option value="pl">Polski</option>
            <option value="gr">Ελληνικά</option>
          </select>
        </div>
        <div>
          <label class="admin-label">Theme</label>
          <select v-model="state.theme" class="admin-input w-full">
            <option value="system">system</option>
            <option value="light">light</option>
            <option value="dark">dark</option>
            <option value="deep">deep</option>
            <option value="sepia">sepia</option>
            <option value="bluer">bluer</option>
          </select>
        </div>
        <div>
          <label class="admin-label">Search Provider</label>
          <select v-model="state.searchProvider" class="admin-input w-full">
            <option value="google">Google</option>
            <option value="duckduckgo">DuckDuckGo</option>
          </select>
        </div>
        <div class="sm:col-span-2">
          <label class="admin-label flex items-center gap-2 cursor-pointer">
            <input v-model="state.searchWebradio" type="checkbox" class="accent-brand-500">
            Include Webradio stations in search results
          </label>
          <p class="mt-1 text-xs text-fg-dimmed">
            Search online radio stations via Radio Browser when typing in the search bar.
          </p>
        </div>
        <div v-if="state.searchWebradio">
          <label class="admin-label">Webradio country code</label>
          <input
            v-model="state.searchWebradioCountryCode"
            type="text"
            class="admin-input w-full uppercase"
            maxlength="2"
            placeholder="NL"
          >
        </div>
        <div>
          <label class="admin-label">Background (filename in data/)</label>
          <input v-model="state.background" type="text" class="admin-input w-full" placeholder="background.jpg">
        </div>
        <div class="sm:col-span-2">
          <label class="admin-label">Favicon API</label>
          <input v-model="state.faviconApi" type="text" class="admin-input w-full" placeholder="https://faviconapi.com">
          <p class="mt-1 text-xs text-fg-dimmed">
            Pre-filled with
            <a href="https://faviconapi.com" target="_blank" rel="noopener noreferrer" class="hover:underline" style="color: rgb(124 180 132)">faviconapi.com</a>
            - you can replace this with any other API. To pick providers, fallbacks and size,
            <a href="https://faviconapi.com/#tools" target="_blank" rel="noopener noreferrer" class="hover:underline" style="color: rgb(124 180 132)">create a Custom URL</a>.
          </p>
        </div>
        <div>
          <label class="admin-label">Link Target</label>
          <select v-model="state.target" class="admin-input w-full">
            <option value="_blank">_blank</option>
            <option value="_self">_self</option>
            <option value="_parent">_parent</option>
            <option value="_top">_top</option>
          </select>
        </div>
        <div>
          <label class="admin-label">Uptime Kuma URL</label>
          <input v-model="state.uptimeKumaUrl" type="text" class="admin-input w-full" placeholder="http://uptime-kuma:3001">
        </div>
        <div>
          <label class="admin-label">Uptime Kuma status page slug</label>
          <input v-model="state.uptimeKumaSlug" type="text" class="admin-input w-full" placeholder="e.g. default">
        </div>
        <div class="sm:col-span-2">
          <p class="text-xs text-fg-dimmed">
            Default instance for the Uptime Kuma module and for status dots on bookmarks. With a slug you can
            refer to monitors by name instead of by ID.
          </p>
        </div>
      </div>

      <div v-if="state.background" class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="admin-label">Overlay Color</label>
          <div class="flex gap-2 items-center">
            <input v-model="state.overlayColor" type="color" class="w-8 h-8 rounded cursor-pointer border-0">
            <input v-model="state.overlayColor" type="text" class="admin-input flex-1" placeholder="#000000">
          </div>
        </div>
        <div>
          <label class="admin-label">Overlay Opacity: {{ state.overlayOpacity }}</label>
          <input v-model.number="state.overlayOpacity" type="range" min="0" max="1" step="0.05" class="w-full accent-brand-500">
        </div>
      </div>

      <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="admin-label">Footer Text</label>
          <input v-model="state.footerText" type="text" class="admin-input w-full" placeholder="Optional footer text">
        </div>
        <div>
          <label class="admin-label">Footer HTML</label>
          <input v-model="state.footerHtml" type="text" class="admin-input w-full" placeholder="Optional footer HTML">
        </div>
      </div>
    </div>
  </section>

  <!-- Logo & Favicon accordion -->
  <section class="admin-section">
    <button class="admin-section-header" @click="openLogo = !openLogo">
      <span class="font-semibold text-fg">Logo &amp; Favicon</span>
      <span class="chevron" :class="{ rotated: openLogo }" />
    </button>
    <div v-show="openLogo" class="admin-section-body">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="admin-label">Logo Type</label>
          <select v-model="state.logoType" class="admin-input w-full">
            <option value="none">None</option>
            <option value="image">Image</option>
            <option value="text">Text / Letter</option>
            <option value="both">Image + Text</option>
          </select>
        </div>
      </div>

      <!-- Image logo fields -->
      <div v-if="state.logoType === 'image' || state.logoType === 'both'" class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="admin-label">Logo Image</label>
          <AdminImagePicker v-model="state.logoImage" placeholder="logo.png" />
          <p class="mt-1 text-xs text-fg-dimmed">
            Pick an image from your <code class="text-[11px]">data/</code> folder, or use a custom path.
          </p>
        </div>
      </div>

      <!-- Text logo fields -->
      <div v-if="state.logoType === 'text' || state.logoType === 'both'" class="mt-4 space-y-3">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="admin-label">Logo Text</label>
            <input v-model="state.logoText" type="text" class="admin-input w-full" placeholder="M+">
          </div>
          <div>
            <label class="admin-label">Font Family</label>
            <input v-model="state.logoFontFamily" type="text" class="admin-input w-full" placeholder="Inter, sans-serif">
          </div>
          <div>
            <label class="admin-label">Font Size</label>
            <input v-model="state.logoFontSize" type="text" class="admin-input w-full" placeholder="1.5rem">
          </div>
          <div>
            <label class="admin-label">Font Weight</label>
            <select v-model="state.logoFontWeight" class="admin-input w-full">
              <option value="100">100 - Thin</option>
              <option value="200">200 - Extra Light</option>
              <option value="300">300 - Light</option>
              <option value="400">400 - Normal</option>
              <option value="500">500 - Medium</option>
              <option value="600">600 - Semi Bold</option>
              <option value="700">700 - Bold</option>
              <option value="800">800 - Extra Bold</option>
              <option value="900">900 - Black</option>
            </select>
          </div>
          <div>
            <label class="admin-label">Text Color</label>
            <div class="flex gap-2 items-center">
              <input v-model="state.logoColor" type="color" class="w-8 h-8 rounded cursor-pointer border-0">
              <input v-model="state.logoColor" type="text" class="admin-input flex-1" placeholder="#ffffff">
            </div>
          </div>
          <div>
            <label class="admin-label">Background Color</label>
            <div class="flex gap-2 items-center">
              <input v-model="state.logoBackgroundColor" type="color" class="w-8 h-8 rounded cursor-pointer border-0">
              <input v-model="state.logoBackgroundColor" type="text" class="admin-input flex-1" placeholder="transparent">
            </div>
          </div>
          <div>
            <label class="admin-label">Border Radius</label>
            <input v-model="state.logoBorderRadius" type="text" class="admin-input w-full" placeholder="0.5rem">
          </div>
          <div>
            <label class="admin-label">Padding</label>
            <input v-model="state.logoPadding" type="text" class="admin-input w-full" placeholder="0.25rem 0.5rem">
          </div>
        </div>

        <!-- Preview -->
        <div v-if="state.logoText" class="flex items-center gap-3">
          <span class="admin-label mb-0">Preview:</span>
          <span
            :style="{
              fontSize: state.logoFontSize || '1.5rem',
              fontWeight: state.logoFontWeight || 700,
              fontFamily: state.logoFontFamily || 'inherit',
              color: state.logoColor || '#ffffff',
              backgroundColor: state.logoBackgroundColor || 'transparent',
              borderRadius: state.logoBorderRadius || '0',
              padding: state.logoPadding || '0',
              lineHeight: 1,
            }"
          >{{ state.logoText }}</span>
        </div>
      </div>

      <!-- App favicon (embedded; shares the same Logo & Favicon accordion) -->
      <div class="mt-6 pt-4 border-t border-fg/10">
        <div class="font-semibold text-fg text-sm mb-3">App Favicon</div>
        <AdminFaviconSettings
          inline
          @toast="(p) => emit('toast', p)"
          @logo-applied="onFaviconAppliedAsLogo"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { BuilderState } from '~/composables/useConfigBuilder'

interface AppliedLogo {
  type: 'image' | 'both'
  image: string
  text?: string
  fontSize?: string
  fontWeight?: string | number
  fontFamily?: string
  color?: string
  backgroundColor?: string
  borderRadius?: string
  padding?: string
}

const props = defineProps<{ state: BuilderState }>()
const emit = defineEmits<{
  (e: 'toast', payload: { message: string; type: 'success' | 'error' }): void
}>()
const open = ref(false)
const openLogo = ref(false)

// Mirror what the server wrote to config.yml back into the reactive form
// state so the Logo Image input + YAML preview update without a reload.
function onFaviconAppliedAsLogo(logo: AppliedLogo) {
  const s = props.state
  s.logoType = logo.type
  s.logoImage = logo.image
  if (logo.type === 'both') {
    if (logo.text !== undefined) s.logoText = logo.text
    if (logo.fontSize !== undefined) s.logoFontSize = logo.fontSize
    if (logo.fontWeight !== undefined) s.logoFontWeight = String(logo.fontWeight)
    if (logo.fontFamily !== undefined) s.logoFontFamily = logo.fontFamily
    if (logo.color !== undefined) s.logoColor = logo.color
    if (logo.backgroundColor !== undefined) s.logoBackgroundColor = logo.backgroundColor
    if (logo.borderRadius !== undefined) s.logoBorderRadius = logo.borderRadius
    if (logo.padding !== undefined) s.logoPadding = logo.padding
  }
}
</script>
