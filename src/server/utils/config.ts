import crypto from 'node:crypto'
import yaml from 'yaml'
import defu from 'defu'
import { ZodError } from 'zod'
import type { CompleteConfig, Service, ServicesGroup, Tab, Tag } from '~/types'
import { dataAssetExists } from '~/server/utils/assets'
import { configSchema } from '~/server/validations'

type DraftService = Omit<Service, 'id'>

type TagMap = Map<Tag['name'], Tag>

const logger = useLogger('config')

function determineService(items: DraftService[], tags: TagMap): Service[] {
  return items.map((item) => {
    const service: Service = {
      ...item,
      id: crypto.randomUUID(),
      tags: (item.tags || []).map((tag): Tag => {
        if (typeof tag === 'string') {
          return tags.get(tag) || {
            name: tag,
            color: 'blue',
          }
        }

        return tag
      }),
    }

    if (item.stack && Array.isArray(item.stack)) {
      service.stack = determineService(item.stack as DraftService[], tags)
    }

    return service
  })
}

export const configFileName = 'config.yml'

export function getDefaultConfig(): CompleteConfig {
  return {
    title: 'Mafl Home Page',
    lang: 'en',
    theme: 'system',
    logo: '',
    background: '',
    backgroundOverlay: {
      color: '#000000',
      opacity: 0.5,
    },
    faviconApi: 'https://faviconapi.com',
    styles: {
      category: {},
      title: {},
      description: {},
      card: {},
    },
    checkUpdates: true,
    layout: {
      grid: {
        small: 2,
        medium: 2,
        large: 3,
        xlarge: 4,
      },
      list: {
        small: 2,
        medium: 3,
        large: 4,
        xlarge: 5,
      },
      spacing: {
        group: '2.5rem',
        item: '0.5rem',
      },
    },
    behaviour: {
      target: '_blank',
    },
    searchProvider: 'google',
    searchWebradio: false,
    robotsTxt: true,
    meta: {
      robots: 'noindex, nofollow',
    },
    tags: [],
    services: [],
    tabs: [],
  }
}

function parseRawServices(raw: unknown, tags: TagMap): ServicesGroup[] {
  const services: ServicesGroup[] = []

  if (Array.isArray(raw)) {
    services.push({
      items: determineService(raw as DraftService[], tags),
    })
  } else if (raw && typeof raw === 'object') {
    const entries = Object.entries(raw)

    for (const [title, value] of entries) {
      if (Array.isArray(value)) {
        services.push({
          title,
          items: determineService(value as DraftService[], tags),
        })
      } else {
        const group = value as { display?: 'grid' | 'list'; hideTitle?: boolean; card?: any; items: DraftService[] }
        services.push({
          title,
          display: group.display,
          ...(group.hideTitle ? { hideTitle: true } : {}),
          ...(group.card ? { card: group.card } : {}),
          items: determineService(group.items, tags),
        })
      }
    }
  }

  return services
}

function createTagMap(tags: Tag[]): TagMap {
  return tags.reduce((acc, tag) => {
    acc.set(tag.name, tag)

    return acc
  }, new Map())
}

/**
 * Load config from storage
 */
export async function loadConfig(): Promise<CompleteConfig> {
  const defaultConfig = getDefaultConfig()
  const storage = useStorage('data')

  try {
    if (!await storage.hasItem(configFileName)) {
      throw new Error('Config not found')
    }

    const raw = await storage.getItem<string>(configFileName)
    const config = yaml.parse(raw || '') || {}
    const tags: TagMap = createTagMap(config.tags || [])

    configSchema.parse(config)

    let services: ServicesGroup[] = []
    let tabs: Tab[] = []

    if (Array.isArray(config.tabs) && config.tabs.length > 0) {
      tabs = config.tabs.map((tab: { name: string; icon?: string; hidden?: boolean; services: unknown }) => ({
        name: tab.name,
        icon: tab.icon,
        hidden: tab.hidden || false,
        services: parseRawServices(tab.services, tags),
      }))
      services = tabs[0].services
    } else {
      services = parseRawServices(config.services, tags)
    }

    return defu({ ...config, services, tabs }, defaultConfig)
  } catch (e) {
    logger.error(e)

    if (e instanceof Error) {
      defaultConfig.error = e.message
    }

    if (e instanceof ZodError) {
      defaultConfig.error = JSON.stringify(
        e.format(),
        (key, val) => (key === '_errors' && !val.length) ? undefined : val,
        ' ',
      )
    }
  }

  return defaultConfig
}

/**
 * Save config to memory storage
 */
export async function setConfig(config: CompleteConfig): Promise<void> {
  const storage = useStorage('main')

  await storage.setItem('config', config)
  await storage.setItem('services', extractServicesFromConfig(config))

  logger.success('Set "main" config')
}

/**
 * Get config from memory storage
 */
export async function getConfig(): Promise<CompleteConfig | null> {
  const storage = useStorage('main')
  await storage.getKeys()

  return storage.getItem<CompleteConfig>('config')
}

/**
 * Safely retrieves a list of services for frontend.
 * Omit "secrets" fields.
 */
export function extractSafelyConfig(config: CompleteConfig) {
  const safe = JSON.parse(JSON.stringify(
    config, (key, val) => key === 'secrets' ? undefined : val,
  )) as CompleteConfig

  if (safe.background && !dataAssetExists(safe.background)) {
    logger.warn(`Background asset not found, skipping: ${safe.background}`)
    safe.background = ''
  }

  return safe
}

/**
 * Create Map services
 */
export function extractServicesFromConfig(config: CompleteConfig): Record<string, Service> {
  const allGroups = config.tabs && config.tabs.length > 0
    ? config.tabs.flatMap(tab => tab.services)
    : config.services

  function registerServices(items: Service[], acc: Record<string, Service>) {
    for (const item of items) {
      acc[item.id] = item
      if (item.stack) {
        registerServices(item.stack, acc)
      }
    }
  }

  return allGroups.reduce<Record<string, Service>>((acc, group) => {
    registerServices(group.items, acc)
    return acc
  }, {})
}
