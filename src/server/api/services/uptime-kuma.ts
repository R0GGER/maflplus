import type { UptimeKumaMonitor, UptimeKumaService } from '~/types'
import { getServiceWithDefaultData, returnServiceWithData } from '~/server/utils/services'
import {
  BADGE_STATUS_QUERY,
  BADGE_VALUE_QUERY,
  badgeStatus,
  fetchBadgeValue,
  fetchHeartbeats,
  fetchStatusPage,
  heartbeatStatus,
  normalizeKumaUrl,
  toNumber,
} from '~/server/utils/uptimeKuma'

const log = useLogger('uptime-kuma')

const DEFAULT_HEARTBEAT_COUNT = 30

interface RequestedMonitor {
  id: number
  name?: string
}

/**
 * Normalize the "monitors" option, which accepts both plain IDs and objects
 * with an optional display name.
 */
function normalizeRequestedMonitors(input: UptimeKumaService['options']['monitors']): RequestedMonitor[] {
  if (!Array.isArray(input)) {
    return []
  }

  return input
    .map((entry) => {
      if (entry !== null && typeof entry === 'object') {
        return { id: Number(entry.id), name: entry.name }
      }

      return { id: Number(entry) }
    })
    .filter(monitor => Number.isInteger(monitor.id))
}

function normalizeDuration(input?: string): string {
  const duration = String(input || '24h').trim()

  return /^\d+$/.test(duration) ? `${duration}h` : duration
}

function deriveOverall(monitors: UptimeKumaMonitor[]): UptimeKumaService['server']['overall'] {
  if (!monitors.length) {
    return 'unknown'
  }

  const statuses = monitors.map(monitor => monitor.status)

  if (statuses.includes('maintenance')) {
    return 'maintenance'
  }

  const hasUp = statuses.includes('up')
  const hasDown = statuses.some(status => status === 'down' || status === 'pending')

  if (hasUp && !hasDown) {
    return 'up'
  }

  if (hasUp && hasDown) {
    return 'degraded'
  }

  return hasDown ? 'down' : 'unknown'
}

async function resolveCertExpiry(baseUrl: string, id: number): Promise<number | null> {
  return toNumber(await fetchBadgeValue(baseUrl, `${id}/cert-exp`, BADGE_VALUE_QUERY))
}

async function collectFromStatusPage(
  baseUrl: string,
  slug: string,
  requested: RequestedMonitor[],
  options: UptimeKumaService['options'],
): Promise<{ monitors: UptimeKumaMonitor[], title: string }> {
  const [page, beats] = await Promise.all([
    fetchStatusPage(baseUrl, slug),
    fetchHeartbeats(baseUrl, slug),
  ])

  const heartbeatCount = Math.max(1, options.heartbeatCount || DEFAULT_HEARTBEAT_COUNT)
  const names = new Map(requested.map(monitor => [monitor.id, monitor.name]))

  const available = (page.publicGroupList || []).flatMap(group => group.monitorList || [])
  const selected = requested.length
    ? available.filter(monitor => names.has(monitor.id))
    : available

  const monitors = await Promise.all(selected.map(async (monitor): Promise<UptimeKumaMonitor> => {
    const heartbeats = beats.heartbeatList?.[String(monitor.id)] || []
    const last = heartbeats[heartbeats.length - 1]
    const uptime = beats.uptimeList?.[`${monitor.id}_24`]

    return {
      id: monitor.id,
      name: names.get(monitor.id) || monitor.name || `Monitor ${monitor.id}`,
      status: heartbeatStatus(last),
      uptime: typeof uptime === 'number' ? uptime * 100 : null,
      ping: last?.ping ?? null,
      certExpiryDays: options.showCertExp ? await resolveCertExpiry(baseUrl, monitor.id) : null,
      url: monitor.sendUrl ? monitor.url : undefined,
      heartbeats: heartbeats.slice(-heartbeatCount),
    }
  }))

  return { monitors, title: page.config?.title || '' }
}

async function collectFromBadges(
  baseUrl: string,
  requested: RequestedMonitor[],
  options: UptimeKumaService['options'],
): Promise<UptimeKumaMonitor[]> {
  const duration = normalizeDuration(options.uptimeDuration)

  return Promise.all(requested.map(async (monitor): Promise<UptimeKumaMonitor> => {
    const [status, uptime, ping, certExpiryDays] = await Promise.all([
      fetchBadgeValue(baseUrl, `${monitor.id}/status`, BADGE_STATUS_QUERY),
      options.showUptime === false
        ? null
        : fetchBadgeValue(baseUrl, `${monitor.id}/uptime/${encodeURIComponent(duration)}`, BADGE_VALUE_QUERY),
      options.showPing === false
        ? null
        : fetchBadgeValue(baseUrl, `${monitor.id}/ping/${encodeURIComponent(duration)}`, BADGE_VALUE_QUERY),
      options.showCertExp ? resolveCertExpiry(baseUrl, monitor.id) : null,
    ])

    return {
      id: monitor.id,
      name: monitor.name || `Monitor ${monitor.id}`,
      status: badgeStatus(status),
      uptime: toNumber(uptime),
      ping: toNumber(ping),
      certExpiryDays,
      heartbeats: [],
    }
  }))
}

export default defineEventHandler(async (event) => {
  const service = await getServiceWithDefaultData<UptimeKumaService>(event)
  const config = await getConfig()
  const { options = {}, secrets } = service.config
  const baseUrl = normalizeKumaUrl(secrets?.url || options.url || config?.uptimeKuma?.url)
  const slug = String(options.slug ?? config?.uptimeKuma?.slug ?? '').trim()
  const requested = normalizeRequestedMonitors(options.monitors)
  const source = slug ? 'status-page' : 'badge'

  /**
   * Problems are reported through the payload rather than as an HTTP error:
   * ServiceBase renders its loading placeholder for as long as the fetch has
   * no data, so a failed request would leave a permanent skeleton instead of
   * telling anyone what is wrong.
   */
  const fail = (message: string) => {
    log.warn(`${service.config.title || 'uptime-kuma'}: ${message}`)

    return returnServiceWithData(service, {
      monitors: [],
      overall: 'unknown' as const,
      source,
      title: '',
      error: message,
    })
  }

  if (!baseUrl) {
    return fail('No valid Uptime Kuma url configured')
  }

  if (!slug && !requested.length) {
    return fail('Configure a status page "slug" or a list of "monitors"')
  }

  try {
    const { monitors, title } = slug
      ? await collectFromStatusPage(baseUrl, slug, requested, options)
      : { monitors: await collectFromBadges(baseUrl, requested, options), title: '' }

    return returnServiceWithData(service, {
      monitors,
      overall: deriveOverall(monitors),
      source,
      title,
    })
  } catch (e) {
    log.error(`Could not reach Uptime Kuma at ${baseUrl}: ${e instanceof Error ? e.message : e}`)

    return fail(`Uptime Kuma at ${baseUrl} is unreachable`)
  }
})
