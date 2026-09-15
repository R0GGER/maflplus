import type { PingServiceData, UptimeKumaHeartbeat, UptimeKumaStatus } from '~/types'

const log = useLogger('uptime-kuma')

/**
 * Heartbeat status codes as stored by Uptime Kuma.
 */
export const STATUS_MAP: Record<number, UptimeKumaStatus> = {
  0: 'down',
  1: 'up',
  2: 'pending',
  3: 'maintenance',
}

/**
 * Badge labels our requests force, so the parsed value is machine readable
 * regardless of the language or labels configured in Uptime Kuma.
 */
export const BADGE_STATUS_MAP: Record<string, UptimeKumaStatus> = {
  up: 'up',
  down: 'down',
  pending: 'pending',
  maintenance: 'maintenance',
}

export const BADGE_STATUS_QUERY = 'label=&upLabel=up&downLabel=down&pendingLabel=pending&maintenanceLabel=maintenance'
export const BADGE_VALUE_QUERY = 'label=&suffix='

export interface StatusPageResponse {
  config?: {
    title?: string
  }
  publicGroupList?: {
    name?: string
    monitorList?: {
      id: number
      name?: string
      url?: string
      sendUrl?: number
    }[]
  }[]
}

export interface HeartbeatResponse {
  heartbeatList?: Record<string, UptimeKumaHeartbeat[]>
  uptimeList?: Record<string, number>
}

export interface UptimeKumaSource {
  url: string
  slug?: string
}

/**
 * Nitro strips every non-word character from cache keys, so separators have to
 * survive that to keep the keys of different monitors apart.
 */
function keyPart(value: string | number): string {
  return String(value).replace(/\W+/g, '_')
}

/**
 * Normalize a configured instance url, or return an empty string when it is
 * missing or unusable.
 */
export function normalizeKumaUrl(value?: string): string {
  const url = String(value || '').trim().replace(/\/+$/, '')

  return /^https?:\/\/\S+$/.test(url) ? url : ''
}

export const fetchStatusPage = defineCachedFunction(async (baseUrl: string, slug: string) => {
  return await $fetch<StatusPageResponse>(`${baseUrl}/api/status-page/${encodeURIComponent(slug)}`, {
    timeout: 8000,
  })
}, {
  maxAge: 60 * 5,
  name: 'uptime-kuma-status-page',
  getKey: (baseUrl: string, slug: string) => `${keyPart(baseUrl)}_${keyPart(slug)}`,
})

export const fetchHeartbeats = defineCachedFunction(async (baseUrl: string, slug: string) => {
  return await $fetch<HeartbeatResponse>(`${baseUrl}/api/status-page/heartbeat/${encodeURIComponent(slug)}`, {
    timeout: 8000,
  })
}, {
  maxAge: 30,
  name: 'uptime-kuma-heartbeat',
  getKey: (baseUrl: string, slug: string) => `${keyPart(baseUrl)}_${keyPart(slug)}`,
})

const fetchBadge = defineCachedFunction(async (baseUrl: string, path: string, query: string) => {
  return await $fetch<string>(`${baseUrl}/api/badge/${path}?${query}`, {
    responseType: 'text',
    timeout: 8000,
  })
}, {
  maxAge: 60,
  name: 'uptime-kuma-badge',
  getKey: (baseUrl: string, path: string, query: string) => `${keyPart(baseUrl)}_${keyPart(path)}_${keyPart(query)}`,
})

/**
 * Read the value out of a badge-maker SVG. Requesting badges with an empty
 * "label" and "suffix" makes the accessible <title> a single bare value.
 */
export function parseBadgeValue(svg: string): string | null {
  let raw: string | null = null

  const title = svg.match(/<title>([^<]*)<\/title>/)

  if (title) {
    raw = title[1]
  } else {
    const texts = [...svg.matchAll(/<text[^>]*>([^<]*)<\/text>/g)]

    if (texts.length) {
      raw = texts[texts.length - 1][1]
    }
  }

  if (raw === null) {
    return null
  }

  // Guard against badge-maker versions that keep the label in the title.
  const separator = raw.lastIndexOf(': ')
  const value = (separator === -1 ? raw : raw.slice(separator + 2)).trim()

  return value || null
}

export async function fetchBadgeValue(baseUrl: string, path: string, query: string): Promise<string | null> {
  try {
    return parseBadgeValue(await fetchBadge(baseUrl, path, query))
  } catch (e) {
    log.warn(`Badge request failed for "${path}": ${e instanceof Error ? e.message : e}`)

    return null
  }
}

export function toNumber(value: string | null): number | null {
  if (value === null) {
    return null
  }

  const parsed = Number.parseFloat(value)

  return Number.isFinite(parsed) ? parsed : null
}

export function badgeStatus(value: string | null): UptimeKumaStatus {
  return BADGE_STATUS_MAP[(value || '').toLowerCase()] || 'unknown'
}

export function heartbeatStatus(beat?: UptimeKumaHeartbeat): UptimeKumaStatus {
  return beat ? STATUS_MAP[beat.status] ?? 'unknown' : 'unknown'
}

/**
 * Translate a monitor status into the shape the status indicator expects.
 * "maintenance" and "unknown" stay undefined so the dot turns grey rather than
 * claiming the service is down.
 */
export function statusToPing(status: UptimeKumaStatus, ping?: number | null): PingServiceData | undefined {
  if (status === 'up') {
    return { status: true, time: Math.round(ping ?? 0) }
  }

  if (status === 'down' || status === 'pending') {
    return { status: false, time: 0 }
  }

  return undefined
}

/**
 * Resolve a single monitor for the status indicator of a regular service item.
 * With a status page slug one cached request covers every item on the
 * dashboard; without one we fall back to that monitor's status badge.
 */
export async function getMonitorPing(
  source: UptimeKumaSource,
  monitor: number | string,
): Promise<PingServiceData | undefined> {
  const reference = String(monitor).trim()

  if (!reference) {
    return undefined
  }

  try {
    if (source.slug) {
      const [page, beats] = await Promise.all([
        fetchStatusPage(source.url, source.slug),
        fetchHeartbeats(source.url, source.slug),
      ])

      const available = (page.publicGroupList || []).flatMap(group => group.monitorList || [])
      const match = available.find((entry) => {
        return String(entry.id) === reference
          || (entry.name || '').toLowerCase() === reference.toLowerCase()
      })

      if (!match) {
        log.warn(`Monitor "${reference}" is not published on status page "${source.slug}"`)

        return undefined
      }

      const heartbeats = beats.heartbeatList?.[String(match.id)] || []
      const last = heartbeats[heartbeats.length - 1]

      return statusToPing(heartbeatStatus(last), last?.ping)
    }

    if (!/^\d+$/.test(reference)) {
      log.warn(`Monitor "${reference}" needs a status page "slug" to be resolved by name`)

      return undefined
    }

    const status = badgeStatus(await fetchBadgeValue(source.url, `${reference}/status`, BADGE_STATUS_QUERY))

    return statusToPing(status)
  } catch (e) {
    log.error(`Could not resolve monitor "${reference}" at ${source.url}: ${e instanceof Error ? e.message : e}`)

    return undefined
  }
}
