import { ping } from '@network-utils/tcp-ping'
import type { H3Event } from 'h3'
import type { PingServiceData, ReturnServiceWithData, Service, ServiceWithDefaultData } from '~/types'

export async function pingService(endpoint: string): Promise<PingServiceData> {
  try {
    const url = new URL(endpoint)

    const probe = await ping({
      address: url.hostname,
      port: Number.parseInt(url.port || '80'),
      attempts: 1,
    })

    return {
      status: probe.errors.length === 0,
      time: Math.floor(probe.averageLatency),
    }
  } catch (e) {
    logger.error(e)
  }

  return {
    status: false,
    time: 0,
  }
}

export async function getService<T extends Service>(event: H3Event): Promise<T> {
  const { id } = getQuery<{ id?: string }>(event)

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID can not be null',
    })
  }

  const storage = useStorage('main')
  const services = await storage.getItem<Record<string, T>>('services')

  if (!services || !Object.hasOwn(services, id)) {
    throw createError({
      statusCode: 404,
      statusMessage: `Service with ID "${id}" does not exist`,
    })
  }

  return services[id]
}

/**
 * Resolve the status indicator of a service item. A "monitor" reference takes
 * its state from Uptime Kuma, everything else falls back to a TCP ping.
 */
async function resolveStatus<S extends Service>(service: S): Promise<PingServiceData | undefined> {
  if (!service?.status?.enabled) {
    return undefined
  }

  const monitor = service.status.monitor

  if (monitor === undefined || monitor === null || monitor === '') {
    return pingService(service.link || '')
  }

  const config = await getConfig()
  const url = normalizeKumaUrl(config?.uptimeKuma?.url)

  if (!url) {
    logger.warn(`Service "${service.title || service.id}" uses status.monitor but "uptimeKuma.url" is not configured`)

    return undefined
  }

  return getMonitorPing({ url, slug: config?.uptimeKuma?.slug }, monitor)
}

export async function getServiceWithDefaultData<S extends Service>(event: H3Event): Promise<ServiceWithDefaultData<S>> {
  const config = await getService<S>(event)
  const defaultData = {
    ping: await resolveStatus(config),
  }

  return { config, defaultData }
}

export function returnServiceWithData<
  S extends ServiceWithDefaultData<Service>,
  D extends S['config']['server'] = S['config']['server'],
>(service: S, data: D): ReturnServiceWithData<D, S['defaultData']> {
  return {
    ...service.defaultData,
    data,
  }
}
