<template>
  <div>
    <ServiceBase v-bind="props">
      <template #icon>
        <ServiceBaseIcon v-if="hasCustomIcon" v-bind="props.icon" />
        <ServiceBaseIcon v-else name="mdi:heart-pulse" v-bind="iconProps" />
      </template>
      <template #title="{ service }">
        {{ props.title || service?.data?.title || 'Uptime Kuma' }}
      </template>
      <template #description="{ service }">
        {{ props.description || summary(service?.data) }}
      </template>
    </ServiceBase>

    <div v-if="monitors.length" class="flex flex-col" :class="iconHidden ? 'gap-0.5' : ''" :style="listStyle">
      <div
        v-for="monitor in monitors"
        :key="monitor.id"
        class="flex flex-col"
        :class="iconHidden ? 'gap-0.5 py-0.5' : 'gap-1 py-1'"
      >
        <div class="flex items-baseline gap-2">
          <span class="h-2.5 w-2.5 flex-shrink-0 self-center rounded-full" :class="statusColor(monitor.status)" />
          <span class="text-sm truncate">{{ monitor.name }}</span>
          <span class="ml-auto text-xs text-fg-dimmed whitespace-nowrap">{{ metrics(monitor) }}</span>
        </div>
        <div
          v-if="showHeartbeat && monitor.heartbeats.length"
          class="flex h-3 items-stretch gap-0.5"
          :class="{ 'justify-between': !!heartbeatWidth }"
        >
          <span
            v-for="(beat, index) in monitor.heartbeats"
            :key="index"
            class="min-w-px rounded-[1px]"
            :class="[statusColor(beatStatus(beat)), heartbeatWidth ? 'flex-none' : 'flex-1']"
            :style="beatStyle"
            :title="beatTitle(beat)"
          />
        </div>
      </div>
    </div>

    <p v-else-if="data" class="text-sm text-fg-dimmed" :style="listStyle">
      {{ data.data?.error || emptyMessage }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type { ServiceClient, UptimeKumaHeartbeat, UptimeKumaMonitor, UptimeKumaService, UptimeKumaStatus } from '~/types'

const props = defineProps<ServiceClient<UptimeKumaService>>()

const STATUS_COLORS: Record<UptimeKumaStatus, string> = {
  up: 'bg-green-400',
  down: 'bg-red-400',
  pending: 'bg-amber-400',
  maintenance: 'bg-blue-400',
  unknown: 'bg-neutral-400',
}

const OVERALL_LABELS: Record<UptimeKumaService['server']['overall'], string> = {
  up: 'Operational',
  degraded: 'Degraded',
  down: 'Down',
  maintenance: 'Maintenance',
  unknown: 'No data',
}

const { itemPadding, noIconPadding } = useGridItemStyle()

const { data } = useServiceData<UptimeKumaService>(props, {
  immediate: !!props.type,
})

const monitors = computed<UptimeKumaMonitor[]>(() => data.value?.data?.monitors || [])
const showHeartbeat = computed(() => props.options?.showHeartbeat !== false)
const iconHidden = computed(() => !!props.icon?.hidden)

// Without a width the bars stretch to fill the row, so their thickness follows
// from the beat count. A fixed width instead spreads the slack over the gaps,
// which keeps the row flush with the card at any span.
const heartbeatWidth = computed(() => {
  const width = props.options?.heartbeatWidth

  if (width == null || width === '') {
    return ''
  }

  return typeof width === 'number' ? `${width}px` : String(width)
})

const beatStyle = computed(() => heartbeatWidth.value ? { width: heartbeatWidth.value } : {})

// ServiceBaseIcon prefers "name" over "url" and "favicon", so the default icon
// may only be applied when no icon of any kind was configured.
const hasCustomIcon = computed(() => {
  return !!(props.icon?.name || props.icon?.url || props.icon?.favicon)
})

// Align the monitor list with the card content on the same horizontal inset
// as the group title. With icon.hidden only the vertical rhythm is denser —
// never shift the list left, or it drifts past the group heading.
const listStyle = computed(() => {
  const bottom = iconHidden.value ? noIconPadding.value : itemPadding.value

  return {
    padding: `0 ${itemPadding.value} ${bottom}`,
  }
})

const emptyMessage = computed(() => {
  return props.options?.slug
    ? 'No public monitors on this status page'
    : 'No monitor data available'
})

const iconProps = computed(() => {
  if (!props.icon) {
    return {}
  }

  const { name: _, ...rest } = props.icon

  return rest
})

function statusColor(status: UptimeKumaStatus): string {
  return STATUS_COLORS[status] || STATUS_COLORS.unknown
}

function beatStatus(beat: UptimeKumaHeartbeat): UptimeKumaStatus {
  const statuses: UptimeKumaStatus[] = ['down', 'up', 'pending', 'maintenance']

  return statuses[beat.status] || 'unknown'
}

function beatTitle(beat: UptimeKumaHeartbeat): string {
  const parts = [beatStatus(beat)]

  if (beat.time) {
    parts.push(new Date(beat.time).toLocaleString())
  }

  if (beat.ping != null) {
    parts.push(`${Math.round(beat.ping)} ms`)
  }

  return parts.join(' · ')
}

function metrics(monitor: UptimeKumaMonitor): string {
  const parts: string[] = []

  if (props.options?.showUptime !== false && monitor.uptime != null) {
    parts.push(`${Number(monitor.uptime.toFixed(2))}%`)
  }

  if (props.options?.showPing !== false && monitor.ping != null) {
    parts.push(`${Math.round(monitor.ping)} ms`)
  }

  if (monitor.certExpiryDays != null) {
    parts.push(`cert ${monitor.certExpiryDays}d`)
  }

  return parts.join(' · ')
}

function summary(serviceData?: UptimeKumaService['server']): string {
  if (serviceData?.error) {
    return 'Unavailable'
  }

  if (!serviceData?.monitors?.length) {
    return OVERALL_LABELS.unknown
  }

  const total = serviceData.monitors.length
  const up = serviceData.monitors.filter(monitor => monitor.status === 'up').length

  return `${OVERALL_LABELS[serviceData.overall]} · ${up}/${total} up`
}
</script>
