<template>
  <Component :is="isLink ? 'a' : 'div'" :href="link" :target="target" class="flex items-center gap-2 py-1.5 px-2 hover:bg-fg/5 dark:hover:bg-fg/9 rounded-lg transition-all">
    <ServiceBaseStatus v-if="status && status.enabled && statusPosition === 'left'" :ping="{ ...data?.ping, animation: status?.animation }" class="flex-shrink-0" />
    <div v-if="!icon?.hidden" class="flex-shrink-0 w-5 h-5 overflow-hidden">
      <ServiceBaseIcon v-if="icon" v-bind="{ ...icon, wrap: false }" />
    </div>
    <span class="text-sm line-clamp-1" :style="titleStyle">{{ title }}</span>
    <ServiceBaseStatus v-if="status && status.enabled && statusPosition === 'right'" :ping="{ ...data?.ping, animation: status?.animation }" class="ml-auto flex-shrink-0" />
  </Component>
</template>

<script setup lang="ts">
import type { Service, ServiceClient, TextStyle } from '~/types'

const props = defineProps<ServiceClient<Service>>()

const { $settings } = useNuxtApp()
const isLink = computed(() => isUrl(props.link || ''))
const target = computed(() => props.target || $settings.behaviour.target)

function toCSS(style?: TextStyle): Record<string, string | undefined> {
  if (!style) return {}
  return {
    fontFamily: style.fontFamily,
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
    fontStyle: style.fontStyle,
    textDecoration: style.textDecoration,
    color: style.color,
  }
}

const titleStyle = computed(() => toCSS($settings.styles?.title))
const statusPosition = computed(() => props.status?.position ?? 'right')

const immediate = computed(() => props.status?.enabled || !!props.type || false)
const { data, pauseUpdate } = useServiceData<Service>(props, {
  immediate: immediate.value,
})

onBeforeUnmount(pauseUpdate)
</script>
