import { reactive, computed, ref } from 'vue'
import yaml from 'yaml'

// --- Types ---

export type ServiceType = 'bookmark' | 'openweathermap' | 'ip-api' | 'time' | 'datetime-weather' | 'greeting' | 'custom-html' | 'tomtom-eta' | 'tomtom-eta-map' | 'tomtom-traffic-map' | 'web-radio' | 'uptime-kuma'
export type IconType = 'favicon' | 'url' | 'name' | 'none'

export interface BuilderItem {
  serviceType: ServiceType
  title: string
  description: string
  link: string
  target: string
  span: string
  iconType: IconType
  iconFavicon: string
  iconUrl: string
  iconName: string
  iconColor: string
  iconWrap: boolean
  statusEnabled: boolean
  statusMonitor: string
  tags: string[]
  // openweathermap
  owmLat: string
  owmLon: string
  owmUnits: string
  owmApiKey: string
  owmShowDescription: string
  // ip-api
  ipapiLocationName: string
  ipapiFlagIcon: string
  // time
  tzTimezone: string
  tzLocationName: string
  tzCountry: string
  tzTimeFormat: string
  tzDateFormat: string
  // datetime-weather
  dtwLat: string
  dtwLon: string
  dtwUnits: string
  dtwApiKey: string
  dtwTimezone: string
  dtwTimeFormat: string
  dtwDateFormat: string
  // greeting
  greetText: string
  greetSubtitle: string
  // custom-html
  customHtml: string
  customHidden: boolean
  // tomtom-eta / tomtom-eta-map
  ttOriginLat: string
  ttOriginLon: string
  ttOriginAddress: string
  ttDestLat: string
  ttDestLon: string
  ttDestAddress: string
  ttRouteName: string
  ttTravelMode: string
  ttApiKey: string
  ttTimeFormat: string
  ttShowTrafficFlow: boolean
  ttShowIncidents: boolean
  ttMapHeight: string
  ttMapStyle: string
  // tomtom-traffic-map
  ttmLat: string
  ttmLon: string
  ttmAddress: string
  ttmZoom: string
  ttmApiKey: string
  ttmShowTrafficFlow: boolean
  ttmShowIncidents: boolean
  ttmMapHeight: string
  ttmMapStyle: string
  // web-radio
  wrStationUuid: string
  wrCountryCode: string
  // uptime-kuma
  ukUrl: string
  ukSlug: string
  ukMonitors: string
  ukUptimeDuration: string
  ukHeartbeatCount: string
  ukHeartbeatWidth: string
  ukShowHeartbeat: boolean
  ukShowUptime: boolean
  ukShowPing: boolean
  ukShowCertExp: boolean
  stack?: BuilderItem[]
}

export interface BuilderCardStyle {
  backgroundColor: string
  opacity: string
  blur: string
  borderWidth: string
  borderStyle: string
  borderColor: string
  borderRadius: string
  padding: string
}

export interface BuilderGroup {
  name: string
  hideTitle: boolean
  display: 'grid' | 'list'
  card: BuilderCardStyle
  items: BuilderItem[]
}

export interface BuilderTab {
  name: string
  icon: string
  locked: boolean
  hidden: boolean
  groups: BuilderGroup[]
}

export interface BuilderTag {
  name: string
  color: string
}

export interface TextStyle {
  fontFamily: string
  fontSize: string
  fontWeight: string
  fontStyle: string
  textDecoration: string
  color: string
}

export type LogoType = 'none' | 'image' | 'text' | 'both'

export interface BuilderState {
  title: string
  lang: string
  uptimeKumaUrl: string
  uptimeKumaSlug: string
  theme: string
  logoType: LogoType
  logoImage: string
  logoText: string
  logoFontSize: string
  logoFontWeight: string
  logoFontFamily: string
  logoColor: string
  logoBackgroundColor: string
  logoBorderRadius: string
  logoPadding: string
  background: string
  faviconApi: string
  overlayColor: string
  overlayOpacity: number
  target: string
  searchProvider: string
  searchWebradio: boolean
  searchWebradioCountryCode: string
  gridSmall: number | null
  gridMedium: number | null
  gridLarge: number | null
  gridXlarge: number | null
  gridIconSize: string
  gridItemPadding: string
  listSmall: number | null
  listMedium: number | null
  listLarge: number | null
  listXlarge: number | null
  spacingGroup: string
  spacingGridGap: string
  spacingListGapX: string
  spacingListGapY: string
  styles: {
    category: TextStyle
    title: TextStyle
    description: TextStyle
    card: BuilderCardStyle
  }
  tags: BuilderTag[]
  tabs: BuilderTab[]
  footerText: string
  footerHtml: string
  metaDescription: string
  metaKeywords: string
  metaAuthor: string
  metaRobots: string
  metaOgTitle: string
  metaOgDescription: string
  metaOgImage: string
  metaOgType: string
  robotsTxt: boolean
}

export const TAG_COLORS = [
  'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal',
  'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose',
]

function emptyTextStyle(): TextStyle {
  return { fontFamily: '', fontSize: '', fontWeight: '', fontStyle: '', textDecoration: '', color: '' }
}

function emptyCardStyle(): BuilderCardStyle {
  return { backgroundColor: '', opacity: '', blur: '', borderWidth: '', borderStyle: '', borderColor: '', borderRadius: '', padding: '' }
}

function defaultState(): BuilderState {
  return {
    title: 'MAFL+',
    lang: 'en',
    uptimeKumaUrl: '',
    uptimeKumaSlug: '',
    theme: 'dark',
    logoType: 'none',
    logoImage: '',
    logoText: '',
    logoFontSize: '1.5rem',
    logoFontWeight: '700',
    logoFontFamily: '',
    logoColor: '#ffffff',
    logoBackgroundColor: '',
    logoBorderRadius: '',
    logoPadding: '',
    background: '',
    faviconApi: 'https://faviconapi.com',
    overlayColor: '#000000',
    overlayOpacity: 0.5,
    target: '_blank',
    searchProvider: 'google',
    searchWebradio: false,
    searchWebradioCountryCode: 'NL',
    gridSmall: 2,
    gridMedium: 2,
    gridLarge: 3,
    gridXlarge: 5,
    gridIconSize: '',
    gridItemPadding: '',
    listSmall: 2,
    listMedium: 3,
    listLarge: 4,
    listXlarge: 5,
    spacingGroup: '1.5rem',
    spacingGridGap: '0.25rem',
    spacingListGapX: '1.5rem',
    spacingListGapY: '0.5rem',
    styles: {
      category: emptyTextStyle(),
      title: emptyTextStyle(),
      description: emptyTextStyle(),
      card: emptyCardStyle(),
    },
    tags: [],
    tabs: [],
    footerText: '',
    footerHtml: '<p>Modified with ❤️ by <a href="https://github.com/R0GGER/mafl" style="color:white;">MAFL+</a> | <a target="_blank" href="/admin" style="color:white;">Admin</a></p>',
    metaDescription: '',
    metaKeywords: '',
    metaAuthor: '',
    metaRobots: 'noindex, nofollow',
    metaOgTitle: '',
    metaOgDescription: '',
    metaOgImage: '',
    metaOgType: '',
    robotsTxt: true,
  }
}

export function newItem(serviceType: ServiceType = 'bookmark'): BuilderItem {
  return {
    serviceType,
    title: '', description: '', link: '', target: '', span: '',
    iconType: 'favicon', iconFavicon: '', iconUrl: '', iconName: '', iconColor: '', iconWrap: false,
    statusEnabled: false, statusMonitor: '', tags: [],
    owmLat: '', owmLon: '', owmUnits: 'metric', owmApiKey: '', owmShowDescription: 'true',
    ipapiLocationName: '',
    ipapiFlagIcon: 'true',
    tzTimezone: '', tzLocationName: '', tzCountry: '', tzTimeFormat: '24h', tzDateFormat: 'medium',
    dtwLat: '', dtwLon: '', dtwUnits: 'metric', dtwApiKey: '', dtwTimezone: '', dtwTimeFormat: '24h', dtwDateFormat: 'medium',
    greetText: '', greetSubtitle: '',
    customHtml: '', customHidden: false,
    ttOriginLat: '', ttOriginLon: '', ttOriginAddress: '',
    ttDestLat: '', ttDestLon: '', ttDestAddress: '',
    ttRouteName: '', ttTravelMode: 'car', ttApiKey: '', ttTimeFormat: '24h',
    ttShowTrafficFlow: true, ttShowIncidents: true, ttMapHeight: '300', ttMapStyle: 'standard',
    ttmLat: '', ttmLon: '', ttmAddress: '', ttmZoom: '12', ttmApiKey: '',
    ttmShowTrafficFlow: true, ttmShowIncidents: true, ttmMapHeight: '300', ttmMapStyle: 'standard',
    wrStationUuid: '', wrCountryCode: 'NL',
    ukUrl: '', ukSlug: '', ukMonitors: '', ukUptimeDuration: '24h', ukHeartbeatCount: '30', ukHeartbeatWidth: '',
    ukShowHeartbeat: true, ukShowUptime: true, ukShowPing: true, ukShowCertExp: false,
  }
}

/**
 * Monitor lists are edited as `id` or `id:Label`, comma separated, so a custom
 * label survives a round trip through the text field.
 */
function parseMonitorList(input: string): (number | string | { id: number, name: string })[] {
  const monitors: (number | string | { id: number, name: string })[] = []

  for (const entry of input.split(',').map(s => s.trim()).filter(Boolean)) {
    const sep = entry.indexOf(':')
    const rawId = sep === -1 ? entry : entry.slice(0, sep).trim()
    const name = sep === -1 ? '' : entry.slice(sep + 1).trim()
    const id = /^\d+$/.test(rawId) ? parseInt(rawId) : rawId

    if (!name) monitors.push(id)
    else if (typeof id === 'number') monitors.push({ id, name })
    else monitors.push(id)
  }

  return monitors
}

function formatMonitorList(monitors: any[]): string {
  return monitors
    .map((m) => {
      if (m && typeof m === 'object') return m.name ? `${m.id}:${m.name}` : String(m.id)
      return String(m)
    })
    .filter(Boolean)
    .join(', ')
}

// --- YAML -> State (import) ---

function parseRawItem(raw: any): BuilderItem {
  const sType: ServiceType = raw.type === 'timezone' ? 'time' : (raw.type || 'bookmark')
  const item = newItem(sType)

  if (raw.icon) {
    if (raw.icon.hidden) {
      item.iconType = 'none'
    }
    else if (raw.icon.favicon) {
      item.iconType = 'favicon'
      item.iconFavicon = raw.icon.favicon
      item.iconColor = raw.icon.color || ''
    }
    else if (raw.icon.url) {
      item.iconType = 'url'
      item.iconUrl = raw.icon.url
    }
    else if (raw.icon.name) {
      item.iconType = 'name'
      item.iconName = raw.icon.name
      item.iconColor = raw.icon.color || ''
    }
    item.iconWrap = raw.icon.wrap || false
  }

  if (raw.span) item.span = String(raw.span)

  if (raw.stack && Array.isArray(raw.stack)) {
    item.stack = raw.stack.map(parseRawItem)
    return item
  }

  if (sType === 'openweathermap') {
    if (raw.options?.lat != null) item.owmLat = String(raw.options.lat)
    if (raw.options?.lon != null) item.owmLon = String(raw.options.lon)
    if (raw.options?.units) item.owmUnits = raw.options.units
    if (raw.options?.showDescription === false) item.owmShowDescription = 'false'
    if (raw.secrets?.apiKey) item.owmApiKey = String(raw.secrets.apiKey)
  }
  else if (sType === 'ip-api') {
    if (raw.options?.locationName) item.ipapiLocationName = raw.options.locationName
    if (raw.options?.flagIcon === false) item.ipapiFlagIcon = 'false'
  }
  else if (sType === 'time') {
    if (raw.options?.timezone) item.tzTimezone = raw.options.timezone
    if (raw.options?.locationName) item.tzLocationName = raw.options.locationName
    if (raw.options?.country) item.tzCountry = raw.options.country
    if (raw.options?.timeFormat) item.tzTimeFormat = raw.options.timeFormat
    if (raw.options?.dateFormat) item.tzDateFormat = raw.options.dateFormat
  }
  else if (sType === 'datetime-weather') {
    if (raw.options?.lat != null) item.dtwLat = String(raw.options.lat)
    if (raw.options?.lon != null) item.dtwLon = String(raw.options.lon)
    if (raw.options?.timezone) item.dtwTimezone = raw.options.timezone
    if (raw.options?.units) item.dtwUnits = raw.options.units
    if (raw.options?.timeFormat) item.dtwTimeFormat = raw.options.timeFormat
    if (raw.options?.dateFormat) item.dtwDateFormat = raw.options.dateFormat
    if (raw.secrets?.apiKey) item.dtwApiKey = String(raw.secrets.apiKey)
  }
  else if (sType === 'greeting') {
    if (raw.options?.text) item.greetText = raw.options.text
    if (raw.options?.subtitle) item.greetSubtitle = raw.options.subtitle
  }
  else if (sType === 'custom-html') {
    if (raw.options?.html) item.customHtml = raw.options.html
    if (raw.options?.hidden) item.customHidden = true
  }
  else if (sType === 'web-radio') {
    item.title = raw.title || ''
    item.description = raw.description || ''
    if (raw.options?.stationUuid) item.wrStationUuid = raw.options.stationUuid
    if (raw.options?.countryCode) item.wrCountryCode = raw.options.countryCode
  }
  else if (sType === 'uptime-kuma') {
    item.title = raw.title || ''
    item.description = raw.description || ''
    item.link = raw.link || ''
    if (raw.options?.url) item.ukUrl = raw.options.url
    if (raw.secrets?.url) item.ukUrl = raw.secrets.url
    if (raw.options?.slug) item.ukSlug = raw.options.slug
    if (Array.isArray(raw.options?.monitors)) item.ukMonitors = formatMonitorList(raw.options.monitors)
    if (raw.options?.uptimeDuration) item.ukUptimeDuration = raw.options.uptimeDuration
    if (raw.options?.heartbeatCount != null) item.ukHeartbeatCount = String(raw.options.heartbeatCount)
    if (raw.options?.heartbeatWidth != null) item.ukHeartbeatWidth = String(raw.options.heartbeatWidth)
    if (raw.options?.showHeartbeat === false) item.ukShowHeartbeat = false
    if (raw.options?.showUptime === false) item.ukShowUptime = false
    if (raw.options?.showPing === false) item.ukShowPing = false
    if (raw.options?.showCertExp) item.ukShowCertExp = true
  }
  else if (sType === 'tomtom-traffic-map') {
    if (raw.options?.lat != null) item.ttmLat = String(raw.options.lat)
    if (raw.options?.lon != null) item.ttmLon = String(raw.options.lon)
    if (raw.options?.address) item.ttmAddress = raw.options.address
    if (raw.options?.zoom != null) item.ttmZoom = String(raw.options.zoom)
    if (raw.options?.showTrafficFlow === false) item.ttmShowTrafficFlow = false
    if (raw.options?.showIncidents === false) item.ttmShowIncidents = false
    if (raw.options?.mapHeight != null) item.ttmMapHeight = String(raw.options.mapHeight)
    if (raw.options?.mapStyle) item.ttmMapStyle = raw.options.mapStyle
    if (raw.secrets?.apiKey) item.ttmApiKey = String(raw.secrets.apiKey)
  }
  else if (sType === 'tomtom-eta' || sType === 'tomtom-eta-map') {
    if (raw.options?.originLat != null) item.ttOriginLat = String(raw.options.originLat)
    if (raw.options?.originLon != null) item.ttOriginLon = String(raw.options.originLon)
    if (raw.options?.originAddress) item.ttOriginAddress = raw.options.originAddress
    if (raw.options?.destLat != null) item.ttDestLat = String(raw.options.destLat)
    if (raw.options?.destLon != null) item.ttDestLon = String(raw.options.destLon)
    if (raw.options?.destAddress) item.ttDestAddress = raw.options.destAddress
    if (raw.options?.routeName) item.ttRouteName = raw.options.routeName
    if (raw.options?.travelMode) item.ttTravelMode = raw.options.travelMode
    if (raw.options?.timeFormat) item.ttTimeFormat = raw.options.timeFormat
    if (raw.secrets?.apiKey) item.ttApiKey = String(raw.secrets.apiKey)
    if (sType === 'tomtom-eta-map') {
      if (raw.options?.showTrafficFlow === false) item.ttShowTrafficFlow = false
      if (raw.options?.showIncidents === false) item.ttShowIncidents = false
      if (raw.options?.mapHeight != null) item.ttMapHeight = String(raw.options.mapHeight)
      if (raw.options?.mapStyle) item.ttMapStyle = raw.options.mapStyle
    }
  }
  else {
    item.title = raw.title || ''
    item.description = raw.description || ''
    item.link = raw.link || ''
    item.target = raw.target || ''
    if (raw.status?.enabled) item.statusEnabled = true
    if (raw.status?.monitor != null) item.statusMonitor = String(raw.status.monitor)
    if (raw.tags && Array.isArray(raw.tags)) {
      item.tags = raw.tags.map((t: any) => typeof t === 'string' ? t : t.name || '')
    }
  }

  return item
}

function parseCardStyle(raw: any): BuilderCardStyle {
  const card = emptyCardStyle()
  if (!raw || typeof raw !== 'object') return card
  if (raw.backgroundColor) card.backgroundColor = raw.backgroundColor
  if (raw.opacity != null) card.opacity = String(raw.opacity)
  if (raw.blur) card.blur = raw.blur
  if (raw.borderWidth) card.borderWidth = raw.borderWidth
  if (raw.borderStyle) card.borderStyle = raw.borderStyle
  if (raw.borderColor) card.borderColor = raw.borderColor
  if (raw.borderRadius) card.borderRadius = raw.borderRadius
  if (raw.padding) card.padding = raw.padding
  return card
}

function parseServiceGroups(services: any): BuilderGroup[] {
  const groups: BuilderGroup[] = []
  if (typeof services === 'object' && !Array.isArray(services)) {
    for (const [groupName, groupData] of Object.entries(services)) {
      const group: BuilderGroup = { name: groupName, hideTitle: false, display: 'list', card: emptyCardStyle(), items: [] }
      let items: any[] = []
      if (groupData && typeof groupData === 'object' && !Array.isArray(groupData)) {
        group.display = (groupData as any).display || 'list'
        if ((groupData as any).hideTitle) group.hideTitle = true
        if ((groupData as any).card) group.card = parseCardStyle((groupData as any).card)
        items = (groupData as any).items || []
      }
      else if (Array.isArray(groupData)) {
        items = groupData
      }
      group.items = items.map(parseRawItem)
      groups.push(group)
    }
  }
  else if (Array.isArray(services)) {
    const group: BuilderGroup = { name: 'Services', hideTitle: false, display: 'list', card: emptyCardStyle(), items: [] }
    group.items = services.map(parseRawItem)
    groups.push(group)
  }
  return groups
}

export function loadConfigFromYaml(state: BuilderState, yamlStr: string) {
  const config = yaml.parse(yamlStr)
  if (!config || typeof config !== 'object') return

  if (config.title) state.title = config.title
  if (config.lang) state.lang = config.lang
  if (config.theme) state.theme = config.theme
  if (config.logo) {
    if (typeof config.logo === 'string') {
      state.logoType = 'image'
      state.logoImage = config.logo
    } else if (config.logo.type === 'image') {
      state.logoType = 'image'
      state.logoImage = config.logo.image || ''
    } else if (config.logo.type === 'text') {
      state.logoType = 'text'
      state.logoText = config.logo.text || ''
      if (config.logo.fontSize) state.logoFontSize = config.logo.fontSize
      if (config.logo.fontWeight != null) state.logoFontWeight = String(config.logo.fontWeight)
      if (config.logo.fontFamily) state.logoFontFamily = config.logo.fontFamily
      if (config.logo.color) state.logoColor = config.logo.color
      if (config.logo.backgroundColor) state.logoBackgroundColor = config.logo.backgroundColor
      if (config.logo.borderRadius) state.logoBorderRadius = config.logo.borderRadius
      if (config.logo.padding) state.logoPadding = config.logo.padding
    } else if (config.logo.type === 'both') {
      state.logoType = 'both'
      state.logoImage = config.logo.image || ''
      state.logoText = config.logo.text || ''
      if (config.logo.fontSize) state.logoFontSize = config.logo.fontSize
      if (config.logo.fontWeight != null) state.logoFontWeight = String(config.logo.fontWeight)
      if (config.logo.fontFamily) state.logoFontFamily = config.logo.fontFamily
      if (config.logo.color) state.logoColor = config.logo.color
      if (config.logo.backgroundColor) state.logoBackgroundColor = config.logo.backgroundColor
      if (config.logo.borderRadius) state.logoBorderRadius = config.logo.borderRadius
      if (config.logo.padding) state.logoPadding = config.logo.padding
    }
  }
  if (config.background) state.background = config.background
  if (config.faviconApi) state.faviconApi = config.faviconApi
  if (config.searchProvider) state.searchProvider = config.searchProvider
  if (config.searchWebradio != null) state.searchWebradio = config.searchWebradio
  if (config.searchWebradioCountryCode) state.searchWebradioCountryCode = config.searchWebradioCountryCode
  if (config.behaviour?.target) state.target = config.behaviour.target
  if (config.uptimeKuma) {
    if (config.uptimeKuma.url) state.uptimeKumaUrl = config.uptimeKuma.url
    if (config.uptimeKuma.slug) state.uptimeKumaSlug = config.uptimeKuma.slug
  }

  if (config.backgroundOverlay) {
    if (config.backgroundOverlay.color) state.overlayColor = config.backgroundOverlay.color
    if (config.backgroundOverlay.opacity != null) state.overlayOpacity = config.backgroundOverlay.opacity
  }

  if (config.layout?.grid) {
    if (config.layout.grid.small != null) state.gridSmall = config.layout.grid.small
    if (config.layout.grid.medium != null) state.gridMedium = config.layout.grid.medium
    if (config.layout.grid.large != null) state.gridLarge = config.layout.grid.large
    if (config.layout.grid.xlarge != null) state.gridXlarge = config.layout.grid.xlarge
    if (config.layout.grid.iconSize) state.gridIconSize = config.layout.grid.iconSize
    if (config.layout.grid.itemPadding) state.gridItemPadding = config.layout.grid.itemPadding
  }
  if (config.layout?.list) {
    if (config.layout.list.small != null) state.listSmall = config.layout.list.small
    if (config.layout.list.medium != null) state.listMedium = config.layout.list.medium
    if (config.layout.list.large != null) state.listLarge = config.layout.list.large
    if (config.layout.list.xlarge != null) state.listXlarge = config.layout.list.xlarge
  }
  if (config.layout?.spacing) {
    if (config.layout.spacing.group) state.spacingGroup = config.layout.spacing.group
    if (config.layout.spacing.gridGap) state.spacingGridGap = config.layout.spacing.gridGap
    if (config.layout.spacing.listGapX) state.spacingListGapX = config.layout.spacing.listGapX
    if (config.layout.spacing.listGapY) state.spacingListGapY = config.layout.spacing.listGapY
  }

  if (config.styles) {
    for (const el of ['category', 'title', 'description'] as const) {
      const s = config.styles[el]
      if (!s) continue
      const target = state.styles[el]
      if (s.fontFamily) target.fontFamily = s.fontFamily
      if (s.fontSize) target.fontSize = s.fontSize
      if (s.fontWeight != null) target.fontWeight = String(s.fontWeight)
      if (s.fontStyle) target.fontStyle = s.fontStyle
      if (s.textDecoration) target.textDecoration = s.textDecoration
      if (s.color) target.color = s.color
    }
    if (config.styles.card) {
      state.styles.card = parseCardStyle(config.styles.card)
    }
  }

  if (config.footer) {
    if (config.footer.text) state.footerText = config.footer.text
    if (config.footer.html) state.footerHtml = config.footer.html
  }

  if (config.meta) {
    if (config.meta.description) state.metaDescription = config.meta.description
    if (config.meta.keywords) state.metaKeywords = config.meta.keywords
    if (config.meta.author) state.metaAuthor = config.meta.author
    if (config.meta.robots) state.metaRobots = config.meta.robots
    if (config.meta.og) {
      if (config.meta.og.title) state.metaOgTitle = config.meta.og.title
      if (config.meta.og.description) state.metaOgDescription = config.meta.og.description
      if (config.meta.og.image) state.metaOgImage = config.meta.og.image
      if (config.meta.og.type) state.metaOgType = config.meta.og.type
    }
  }

  if (config.robotsTxt != null) state.robotsTxt = config.robotsTxt

  state.tags = []
  if (config.tags && Array.isArray(config.tags)) {
    for (const t of config.tags) {
      state.tags.push({ name: t.name || '', color: t.color || 'blue' })
    }
  }

  state.tabs = []
  if (config.tabs && Array.isArray(config.tabs)) {
    for (const tab of config.tabs) {
      state.tabs.push({
        name: tab.name || '',
        icon: tab.icon || '',
        locked: tab.locked || false,
        hidden: tab.hidden || false,
        groups: parseServiceGroups(tab.services),
      })
    }
  }
  else if (config.services) {
    state.tabs.push({
      name: '',
      icon: '',
      locked: false,
      hidden: false,
      groups: parseServiceGroups(config.services),
    })
  }
}

// --- State -> YAML (export) ---

function serializeItem(item: BuilderItem): Record<string, any> | null {
  if (item.stack && item.stack.length) {
    const it: Record<string, any> = {}
    if (item.span && parseInt(item.span) > 1) it.span = parseInt(item.span)
    it.stack = item.stack.map(serializeItem).filter(Boolean)
    return it.stack.length ? it : null
  }

  const sType = item.serviceType || 'bookmark'
  if (sType === 'bookmark' && !item.title && !item.link) return null
  if (sType === 'time' && !item.tzTimezone) return null
  if (sType === 'datetime-weather' && !item.dtwTimezone && !item.dtwLat) return null
  if (sType === 'greeting' && !item.greetText) return null
  if (sType === 'custom-html' && !item.customHtml) return null
  if (sType === 'web-radio' && !item.wrStationUuid) return null
  if ((sType === 'tomtom-eta' || sType === 'tomtom-eta-map') && !item.ttApiKey) return null
  if (sType === 'tomtom-traffic-map' && !item.ttmApiKey) return null

  const it: Record<string, any> = {}

  if (item.span && parseInt(item.span) > 1) it.span = parseInt(item.span)

  if (sType === 'openweathermap') {
    it.type = 'openweathermap'
    const opts: any = {}
    if (item.owmLat) opts.lat = parseFloat(item.owmLat) || item.owmLat
    if (item.owmLon) opts.lon = parseFloat(item.owmLon) || item.owmLon
    if (item.owmUnits && item.owmUnits !== 'metric') opts.units = item.owmUnits
    if (item.owmShowDescription === 'false') opts.showDescription = false
    if (Object.keys(opts).length) it.options = opts
    if (item.owmApiKey) it.secrets = { apiKey: item.owmApiKey }
  }
  else if (sType === 'ip-api') {
    it.type = 'ip-api'
    const opts: any = {}
    if (item.ipapiLocationName) opts.locationName = item.ipapiLocationName
    if (item.ipapiFlagIcon === 'false') opts.flagIcon = false
    if (Object.keys(opts).length) it.options = opts
  }
  else if (sType === 'time') {
    it.type = 'time'
    const opts: any = {}
    if (item.tzTimezone) opts.timezone = item.tzTimezone
    if (item.tzLocationName) opts.locationName = item.tzLocationName
    if (item.tzCountry) opts.country = item.tzCountry
    if (item.tzTimeFormat && item.tzTimeFormat !== '24h') opts.timeFormat = item.tzTimeFormat
    if (item.tzDateFormat && item.tzDateFormat !== 'medium') opts.dateFormat = item.tzDateFormat
    if (Object.keys(opts).length) it.options = opts
  }
  else if (sType === 'datetime-weather') {
    it.type = 'datetime-weather'
    const opts: any = {}
    if (item.dtwLat) opts.lat = parseFloat(item.dtwLat) || item.dtwLat
    if (item.dtwLon) opts.lon = parseFloat(item.dtwLon) || item.dtwLon
    if (item.dtwTimezone) opts.timezone = item.dtwTimezone
    if (item.dtwUnits && item.dtwUnits !== 'metric') opts.units = item.dtwUnits
    if (item.dtwTimeFormat && item.dtwTimeFormat !== '24h') opts.timeFormat = item.dtwTimeFormat
    if (item.dtwDateFormat && item.dtwDateFormat !== 'medium') opts.dateFormat = item.dtwDateFormat
    if (Object.keys(opts).length) it.options = opts
    if (item.dtwApiKey) it.secrets = { apiKey: item.dtwApiKey }
  }
  else if (sType === 'greeting') {
    it.type = 'greeting'
    const opts: any = {}
    if (item.greetText) opts.text = item.greetText
    if (item.greetSubtitle) opts.subtitle = item.greetSubtitle
    if (Object.keys(opts).length) it.options = opts
  }
  else if (sType === 'custom-html') {
    it.type = 'custom-html'
    const opts: any = {}
    if (item.customHtml) opts.html = item.customHtml
    if (item.customHidden) opts.hidden = true
    if (Object.keys(opts).length) it.options = opts
  }
  else if (sType === 'web-radio') {
    it.type = 'web-radio'
    if (item.title) it.title = item.title
    if (item.description) it.description = item.description
    const opts: any = { stationUuid: item.wrStationUuid }
    if (item.wrCountryCode && item.wrCountryCode !== 'NL') opts.countryCode = item.wrCountryCode
    it.options = opts
  }
  else if (sType === 'uptime-kuma') {
    it.type = 'uptime-kuma'
    if (item.title) it.title = item.title
    if (item.description) it.description = item.description
    if (item.link) it.link = item.link
    const opts: any = {}
    if (item.ukSlug) opts.slug = item.ukSlug
    const monitors = parseMonitorList(item.ukMonitors)
    if (monitors.length) opts.monitors = monitors
    if (item.ukUptimeDuration && item.ukUptimeDuration !== '24h') opts.uptimeDuration = item.ukUptimeDuration
    if (item.ukHeartbeatCount && item.ukHeartbeatCount !== '30') opts.heartbeatCount = parseInt(item.ukHeartbeatCount)
    if (item.ukHeartbeatWidth) {
      opts.heartbeatWidth = /^\d+$/.test(item.ukHeartbeatWidth.trim())
        ? parseInt(item.ukHeartbeatWidth)
        : item.ukHeartbeatWidth.trim()
    }
    if (!item.ukShowHeartbeat) opts.showHeartbeat = false
    if (!item.ukShowUptime) opts.showUptime = false
    if (!item.ukShowPing) opts.showPing = false
    if (item.ukShowCertExp) opts.showCertExp = true
    if (Object.keys(opts).length) it.options = opts
    if (item.ukUrl) it.secrets = { url: item.ukUrl }
  }
  else if (sType === 'tomtom-traffic-map') {
    it.type = 'tomtom-traffic-map'
    const opts: any = {}
    if (item.ttmLat) opts.lat = parseFloat(item.ttmLat) || item.ttmLat
    if (item.ttmLon) opts.lon = parseFloat(item.ttmLon) || item.ttmLon
    if (item.ttmAddress) opts.address = item.ttmAddress
    if (item.ttmZoom && item.ttmZoom !== '12') opts.zoom = parseInt(item.ttmZoom)
    if (!item.ttmShowTrafficFlow) opts.showTrafficFlow = false
    if (!item.ttmShowIncidents) opts.showIncidents = false
    if (item.ttmMapHeight && item.ttmMapHeight !== '300') opts.mapHeight = parseInt(item.ttmMapHeight)
    if (item.ttmMapStyle && item.ttmMapStyle !== 'standard') opts.mapStyle = item.ttmMapStyle
    if (Object.keys(opts).length) it.options = opts
    if (item.ttmApiKey) it.secrets = { apiKey: item.ttmApiKey }
  }
  else if (sType === 'tomtom-eta' || sType === 'tomtom-eta-map') {
    it.type = sType
    const opts: any = {}
    if (item.ttOriginLat) opts.originLat = parseFloat(item.ttOriginLat) || item.ttOriginLat
    if (item.ttOriginLon) opts.originLon = parseFloat(item.ttOriginLon) || item.ttOriginLon
    if (item.ttOriginAddress) opts.originAddress = item.ttOriginAddress
    if (item.ttDestLat) opts.destLat = parseFloat(item.ttDestLat) || item.ttDestLat
    if (item.ttDestLon) opts.destLon = parseFloat(item.ttDestLon) || item.ttDestLon
    if (item.ttDestAddress) opts.destAddress = item.ttDestAddress
    if (item.ttRouteName) opts.routeName = item.ttRouteName
    if (item.ttTravelMode && item.ttTravelMode !== 'car') opts.travelMode = item.ttTravelMode
    if (item.ttTimeFormat && item.ttTimeFormat !== '24h') opts.timeFormat = item.ttTimeFormat
    if (sType === 'tomtom-eta-map') {
      if (!item.ttShowTrafficFlow) opts.showTrafficFlow = false
      if (!item.ttShowIncidents) opts.showIncidents = false
      if (item.ttMapHeight && item.ttMapHeight !== '300') opts.mapHeight = parseInt(item.ttMapHeight)
      if (item.ttMapStyle && item.ttMapStyle !== 'standard') opts.mapStyle = item.ttMapStyle
    }
    if (Object.keys(opts).length) it.options = opts
    if (item.ttApiKey) it.secrets = { apiKey: item.ttApiKey }
  }
  else {
    if (item.title) it.title = item.title
    if (item.description) it.description = item.description
    if (item.link) it.link = item.link
    if (item.target) it.target = item.target
  }

  // Icon (shared across all types)
  const icon: any = {}
  if (item.iconType === 'none') {
    icon.hidden = true
  }
  else if (item.iconType === 'favicon' && item.iconFavicon) {
    icon.favicon = item.iconFavicon
    if (item.iconWrap) icon.wrap = true
  }
  else if (item.iconType === 'url' && item.iconUrl) {
    icon.url = item.iconUrl
    if (item.iconWrap) icon.wrap = true
  }
  else if (item.iconType === 'name' && item.iconName) {
    icon.name = item.iconName
    if (item.iconColor) icon.color = item.iconColor
    if (item.iconWrap) icon.wrap = true
  }
  if (Object.keys(icon).length) it.icon = icon

  if (sType === 'bookmark') {
    if (item.statusEnabled) {
      const status: any = { enabled: true }
      if (item.statusMonitor) {
        status.monitor = /^\d+$/.test(item.statusMonitor) ? parseInt(item.statusMonitor) : item.statusMonitor
      }
      it.status = status
    }
    if (item.tags && item.tags.length) it.tags = item.tags
  }

  return it
}

function serializeCardStyle(card: BuilderCardStyle): Record<string, any> | null {
  const c: Record<string, any> = {}
  if (card.backgroundColor) c.backgroundColor = card.backgroundColor
  if (card.opacity) c.opacity = parseFloat(card.opacity)
  if (card.blur) c.blur = card.blur
  if (card.borderWidth) c.borderWidth = card.borderWidth
  if (card.borderStyle) c.borderStyle = card.borderStyle
  if (card.borderColor) c.borderColor = card.borderColor
  if (card.borderRadius) c.borderRadius = card.borderRadius
  if (card.padding) c.padding = card.padding
  return Object.keys(c).length ? c : null
}

export function stateToYaml(state: BuilderState): string {
  const config: Record<string, any> = {}

  if (state.title) config.title = state.title
  if (state.lang) config.lang = state.lang
  if (state.theme) config.theme = state.theme
  if (state.logoType === 'image' && state.logoImage) {
    config.logo = state.logoImage
  } else if (state.logoType === 'text' && state.logoText) {
    const logoObj: Record<string, any> = { type: 'text', text: state.logoText }
    if (state.logoFontSize) logoObj.fontSize = state.logoFontSize
    if (state.logoFontWeight) logoObj.fontWeight = isNaN(Number(state.logoFontWeight)) ? state.logoFontWeight : parseInt(state.logoFontWeight)
    if (state.logoFontFamily) logoObj.fontFamily = state.logoFontFamily
    if (state.logoColor) logoObj.color = state.logoColor
    if (state.logoBackgroundColor) logoObj.backgroundColor = state.logoBackgroundColor
    if (state.logoBorderRadius) logoObj.borderRadius = state.logoBorderRadius
    if (state.logoPadding) logoObj.padding = state.logoPadding
    config.logo = logoObj
  } else if (state.logoType === 'both' && state.logoImage && state.logoText) {
    const logoObj: Record<string, any> = { type: 'both', image: state.logoImage, text: state.logoText }
    if (state.logoFontSize) logoObj.fontSize = state.logoFontSize
    if (state.logoFontWeight) logoObj.fontWeight = isNaN(Number(state.logoFontWeight)) ? state.logoFontWeight : parseInt(state.logoFontWeight)
    if (state.logoFontFamily) logoObj.fontFamily = state.logoFontFamily
    if (state.logoColor) logoObj.color = state.logoColor
    if (state.logoBackgroundColor) logoObj.backgroundColor = state.logoBackgroundColor
    if (state.logoBorderRadius) logoObj.borderRadius = state.logoBorderRadius
    if (state.logoPadding) logoObj.padding = state.logoPadding
    config.logo = logoObj
  }
  if (state.background) config.background = state.background
  if (state.faviconApi) config.faviconApi = state.faviconApi

  if (state.background) {
    config.backgroundOverlay = { color: state.overlayColor, opacity: state.overlayOpacity }
  }

  if (state.target) config.behaviour = { target: state.target }
  if (state.uptimeKumaUrl || state.uptimeKumaSlug) {
    const kuma: any = {}
    if (state.uptimeKumaUrl) kuma.url = state.uptimeKumaUrl
    if (state.uptimeKumaSlug) kuma.slug = state.uptimeKumaSlug
    config.uptimeKuma = kuma
  }
  if (state.searchProvider) config.searchProvider = state.searchProvider
  if (state.searchWebradio) {
    config.searchWebradio = true
    if (state.searchWebradioCountryCode && state.searchWebradioCountryCode !== 'NL') {
      config.searchWebradioCountryCode = state.searchWebradioCountryCode.toUpperCase()
    }
  }

  // Layout
  const layout: any = {}
  const grid: any = {}
  if (state.gridSmall) grid.small = state.gridSmall
  if (state.gridMedium) grid.medium = state.gridMedium
  if (state.gridLarge) grid.large = state.gridLarge
  if (state.gridXlarge) grid.xlarge = state.gridXlarge
  if (state.gridIconSize) grid.iconSize = state.gridIconSize
  if (state.gridItemPadding) grid.itemPadding = state.gridItemPadding
  if (Object.keys(grid).length) layout.grid = grid

  const list: any = {}
  if (state.listSmall) list.small = state.listSmall
  if (state.listMedium) list.medium = state.listMedium
  if (state.listLarge) list.large = state.listLarge
  if (state.listXlarge) list.xlarge = state.listXlarge
  if (Object.keys(list).length) layout.list = list

  const spacing: any = {}
  if (state.spacingGroup) spacing.group = state.spacingGroup
  if (state.spacingGridGap) spacing.gridGap = state.spacingGridGap
  if (state.spacingListGapX) spacing.listGapX = state.spacingListGapX
  if (state.spacingListGapY) spacing.listGapY = state.spacingListGapY
  if (Object.keys(spacing).length) layout.spacing = spacing
  if (Object.keys(layout).length) config.layout = layout

  // Styles
  const styles: any = {}
  for (const el of ['category', 'title', 'description'] as const) {
    const src = state.styles[el]
    const s: any = {}
    if (src.fontFamily) s.fontFamily = src.fontFamily
    if (src.fontSize) s.fontSize = src.fontSize
    if (src.fontWeight) s.fontWeight = isNaN(Number(src.fontWeight)) ? src.fontWeight : parseInt(src.fontWeight)
    if (src.fontStyle) s.fontStyle = src.fontStyle
    if (src.textDecoration) s.textDecoration = src.textDecoration
    if (src.color) s.color = src.color
    if (Object.keys(s).length) styles[el] = s
  }
  const globalCard = serializeCardStyle(state.styles.card)
  if (globalCard) styles.card = globalCard
  if (Object.keys(styles).length) config.styles = styles

  // Tags
  const validTags = state.tags.filter(t => t.name)
  if (validTags.length) config.tags = validTags.map(t => ({ name: t.name, color: t.color }))

  // Tabs
  if (state.tabs.length) {
    config.tabs = state.tabs.map((tab) => {
      const tabObj: any = {}
      if (tab.name) tabObj.name = tab.name
      if (tab.icon) tabObj.icon = tab.icon
      if (tab.locked) tabObj.locked = true
      if (tab.hidden) tabObj.hidden = true
      const services: any = {}
      for (const group of tab.groups) {
        if (!group.name) continue
        const groupObj: any = { display: group.display, items: [] }
        if (group.hideTitle) groupObj.hideTitle = true
        const groupCard = serializeCardStyle(group.card)
        if (groupCard) groupObj.card = groupCard
        for (const item of group.items) {
          const serialized = serializeItem(item)
          if (serialized) groupObj.items.push(serialized)
        }
        services[group.name] = groupObj
      }
      if (Object.keys(services).length) tabObj.services = services
      return tabObj
    })
  }

  // Footer
  if (state.footerText || state.footerHtml) {
    const footer: any = {}
    if (state.footerText) footer.text = state.footerText
    if (state.footerHtml) footer.html = state.footerHtml
    config.footer = footer
  }

  const meta: any = {}
  if (state.metaDescription) meta.description = state.metaDescription
  if (state.metaKeywords) meta.keywords = state.metaKeywords
  if (state.metaAuthor) meta.author = state.metaAuthor
  if (state.metaRobots && state.metaRobots !== 'noindex, nofollow') meta.robots = state.metaRobots

  const og: any = {}
  if (state.metaOgTitle) og.title = state.metaOgTitle
  if (state.metaOgDescription) og.description = state.metaOgDescription
  if (state.metaOgImage) og.image = state.metaOgImage
  if (state.metaOgType) og.type = state.metaOgType
  if (Object.keys(og).length) meta.og = og

  if (Object.keys(meta).length) config.meta = meta

  if (!state.robotsTxt) config.robotsTxt = false

  return yaml.stringify(config, {
    indent: 2,
    lineWidth: 0,
    defaultKeyType: 'PLAIN',
    defaultStringType: 'PLAIN',
  })
}

// --- Composable ---

export function useConfigBuilder() {
  const state = reactive<BuilderState>(defaultState())

  const yamlOutput = computed(() => stateToYaml(state))

  function resetState() {
    Object.assign(state, defaultState())
  }

  function loadFromYaml(yamlStr: string) {
    resetState()
    loadConfigFromYaml(state, yamlStr)
  }

  function addTag(name = '', color = 'blue') {
    state.tags.push({ name, color })
  }

  function removeTag(index: number) {
    state.tags.splice(index, 1)
  }

  function addTab(name = '', icon = '') {
    state.tabs.push({ name, icon, locked: false, hidden: false, groups: [] })
  }

  function removeTab(index: number) {
    if (state.tabs[index]?.locked) return
    state.tabs.splice(index, 1)
  }

  function toggleTabLock(index: number) {
    state.tabs[index].locked = !state.tabs[index].locked
  }

  function toggleTabHidden(index: number) {
    state.tabs[index].hidden = !state.tabs[index].hidden
  }

  function addGroup(tabIndex: number, name = '', display: 'grid' | 'list' = 'list') {
    state.tabs[tabIndex].groups.push({ name, hideTitle: false, display, card: emptyCardStyle(), items: [] })
  }

  function removeGroup(tabIndex: number, groupIndex: number) {
    if (state.tabs[tabIndex]?.locked) return
    state.tabs[tabIndex].groups.splice(groupIndex, 1)
  }

  function addItem(tabIndex: number, groupIndex: number, serviceType: ServiceType = 'bookmark') {
    state.tabs[tabIndex].groups[groupIndex].items.push(newItem(serviceType))
  }

  function removeItem(tabIndex: number, groupIndex: number, itemIndex: number) {
    if (state.tabs[tabIndex]?.locked) return
    state.tabs[tabIndex].groups[groupIndex].items.splice(itemIndex, 1)
  }

  function moveItem(tabIndex: number, groupIndex: number, itemIndex: number, direction: -1 | 1) {
    const items = state.tabs[tabIndex].groups[groupIndex].items
    const newIndex = itemIndex + direction
    if (newIndex < 0 || newIndex >= items.length) return
    const temp = items[itemIndex]
    items[itemIndex] = items[newIndex]
    items[newIndex] = temp
  }

  function moveGroup(tabIndex: number, groupIndex: number, direction: -1 | 1) {
    const groups = state.tabs[tabIndex].groups
    const newIndex = groupIndex + direction
    if (newIndex < 0 || newIndex >= groups.length) return
    const temp = groups[groupIndex]
    groups[groupIndex] = groups[newIndex]
    groups[newIndex] = temp
  }

  function addStack(tabIndex: number, groupIndex: number) {
    const stack = newItem()
    stack.stack = []
    state.tabs[tabIndex].groups[groupIndex].items.push(stack)
  }

  function addStackChild(tabIndex: number, groupIndex: number, itemIndex: number, serviceType: ServiceType = 'bookmark') {
    const item = state.tabs[tabIndex].groups[groupIndex].items[itemIndex]
    if (!item.stack) item.stack = []
    item.stack.push(newItem(serviceType))
  }

  function removeStackChild(tabIndex: number, groupIndex: number, itemIndex: number, childIndex: number) {
    if (state.tabs[tabIndex]?.locked) return
    const item = state.tabs[tabIndex].groups[groupIndex].items[itemIndex]
    if (!item.stack) return
    item.stack.splice(childIndex, 1)
  }

  function moveStackChild(tabIndex: number, groupIndex: number, itemIndex: number, childIndex: number, direction: -1 | 1) {
    const children = state.tabs[tabIndex].groups[groupIndex].items[itemIndex].stack
    if (!children) return
    const newIndex = childIndex + direction
    if (newIndex < 0 || newIndex >= children.length) return
    const temp = children[childIndex]
    children[childIndex] = children[newIndex]
    children[newIndex] = temp
  }

  // --- Clipboard, drag-and-drop, copy/paste ---

  const clipboard = ref<{ kind: 'item' | 'group'; payload: BuilderItem | BuilderGroup } | null>(null)

  function deepClone<T>(value: T): T {
    if (typeof structuredClone === 'function') {
      try { return structuredClone(value) } catch {}
    }
    return JSON.parse(JSON.stringify(value)) as T
  }

  function isLocked(ti: number): boolean {
    return !!state.tabs[ti]?.locked
  }

  function copyItem(tabIndex: number, groupIndex: number, itemIndex: number) {
    const item = state.tabs[tabIndex]?.groups[groupIndex]?.items[itemIndex]
    if (!item) return
    clipboard.value = { kind: 'item', payload: deepClone(item) }
  }

  function copyGroup(tabIndex: number, groupIndex: number) {
    const group = state.tabs[tabIndex]?.groups[groupIndex]
    if (!group) return
    clipboard.value = { kind: 'group', payload: deepClone(group) }
  }

  function pasteItemInto(tabIndex: number, groupIndex: number, atIndex?: number) {
    if (!clipboard.value || clipboard.value.kind !== 'item') return
    const group = state.tabs[tabIndex]?.groups[groupIndex]
    if (!group) return
    const clone = deepClone(clipboard.value.payload) as BuilderItem
    const insertAt = (typeof atIndex === 'number' && atIndex >= 0 && atIndex <= group.items.length)
      ? atIndex
      : group.items.length
    group.items.splice(insertAt, 0, clone)
  }

  function pasteGroupInto(tabIndex: number, atIndex?: number) {
    if (!clipboard.value || clipboard.value.kind !== 'group') return
    const tab = state.tabs[tabIndex]
    if (!tab) return
    const clone = deepClone(clipboard.value.payload) as BuilderGroup
    const insertAt = (typeof atIndex === 'number' && atIndex >= 0 && atIndex <= tab.groups.length)
      ? atIndex
      : tab.groups.length
    tab.groups.splice(insertAt, 0, clone)
  }

  function moveItemTo(
    from: { ti: number; gi: number; ii: number },
    to: { ti: number; gi: number; index?: number },
  ) {
    if (isLocked(from.ti) || isLocked(to.ti)) return
    const srcGroup = state.tabs[from.ti]?.groups[from.gi]
    const dstGroup = state.tabs[to.ti]?.groups[to.gi]
    if (!srcGroup || !dstGroup) return
    if (from.ti === to.ti && from.gi === to.gi) {
      const items = srcGroup.items
      let target = (typeof to.index === 'number') ? to.index : items.length
      if (target < 0) target = 0
      if (target > items.length) target = items.length
      if (target === from.ii || target === from.ii + 1) return
      const [moved] = items.splice(from.ii, 1)
      if (target > from.ii) target--
      items.splice(target, 0, moved)
      return
    }
    const [moved] = srcGroup.items.splice(from.ii, 1)
    if (!moved) return
    let target = (typeof to.index === 'number') ? to.index : dstGroup.items.length
    if (target < 0) target = 0
    if (target > dstGroup.items.length) target = dstGroup.items.length
    dstGroup.items.splice(target, 0, moved)
  }

  function moveGroupTo(
    from: { ti: number; gi: number },
    to: { ti: number; index?: number },
  ) {
    if (isLocked(from.ti) || isLocked(to.ti)) return
    const srcTab = state.tabs[from.ti]
    const dstTab = state.tabs[to.ti]
    if (!srcTab || !dstTab) return
    if (from.ti === to.ti) {
      const groups = srcTab.groups
      let target = (typeof to.index === 'number') ? to.index : groups.length
      if (target < 0) target = 0
      if (target > groups.length) target = groups.length
      if (target === from.gi || target === from.gi + 1) return
      const [moved] = groups.splice(from.gi, 1)
      if (target > from.gi) target--
      groups.splice(target, 0, moved)
      return
    }
    const [moved] = srcTab.groups.splice(from.gi, 1)
    if (!moved) return
    let target = (typeof to.index === 'number') ? to.index : dstTab.groups.length
    if (target < 0) target = 0
    if (target > dstTab.groups.length) target = dstTab.groups.length
    dstTab.groups.splice(target, 0, moved)
  }

  function serializeTab(tab: BuilderTab): Record<string, any> {
    const tabObj: any = {}
    if (tab.name) tabObj.name = tab.name
    if (tab.icon) tabObj.icon = tab.icon
    if (tab.locked) tabObj.locked = true
    if (tab.hidden) tabObj.hidden = true
    const services: any = {}
    for (const group of tab.groups) {
      if (!group.name) continue
      const groupObj: any = { display: group.display, items: [] }
      if (group.hideTitle) groupObj.hideTitle = true
      const groupCard = serializeCardStyle(group.card)
      if (groupCard) groupObj.card = groupCard
      for (const item of group.items) {
        const serialized = serializeItem(item)
        if (serialized) groupObj.items.push(serialized)
      }
      services[group.name] = groupObj
    }
    if (Object.keys(services).length) tabObj.services = services
    return tabObj
  }

  function exportTabYaml(tabIndex: number): string {
    const tab = state.tabs[tabIndex]
    if (!tab) return ''
    return yaml.stringify(serializeTab(tab), {
      indent: 2,
      lineWidth: 0,
      defaultKeyType: 'PLAIN',
      defaultStringType: 'PLAIN',
    })
  }

  function importTabFromYaml(yamlStr: string): boolean {
    try {
      const data = yaml.parse(yamlStr)
      if (!data || typeof data !== 'object') return false

      let rawTabs: any[] = []
      if (Array.isArray(data)) {
        rawTabs = data
      }
      else if (Array.isArray(data.tabs)) {
        rawTabs = data.tabs
      }
      else if (data.services || data.name || data.icon) {
        rawTabs = [data]
      }
      else {
        return false
      }

      let added = 0
      for (const rawTab of rawTabs) {
        if (rawTab && typeof rawTab === 'object') {
          state.tabs.push({
            name: rawTab.name || '',
            icon: rawTab.icon || '',
            locked: rawTab.locked || false,
            hidden: rawTab.hidden || false,
            groups: parseServiceGroups(rawTab.services),
          })
          added++
        }
      }
      return added > 0
    }
    catch {
      return false
    }
  }

  return {
    state,
    yamlOutput,
    resetState,
    loadFromYaml,
    addTag,
    removeTag,
    addTab,
    removeTab,
    toggleTabLock,
    toggleTabHidden,
    addGroup,
    removeGroup,
    addItem,
    removeItem,
    moveItem,
    moveGroup,
    addStack,
    addStackChild,
    removeStackChild,
    moveStackChild,
    exportTabYaml,
    importTabFromYaml,
    clipboard,
    copyItem,
    copyGroup,
    pasteItemInto,
    pasteGroupInto,
    moveItemTo,
    moveGroupTo,
  }
}
