import type { Service } from '~/types/services'

export interface CardStyle {
  backgroundColor?: string
  opacity?: number
  blur?: string
  borderWidth?: string
  borderStyle?: 'none' | 'solid' | 'dashed' | 'dotted' | 'double'
  borderColor?: string
  borderRadius?: string
  padding?: string
}

export interface ServicesGroup {
  title?: string
  hideTitle?: boolean
  display?: 'grid' | 'list'
  card?: CardStyle
  items: Service[]
}

export interface Tag {
  name: string
  color: 'red' | 'orange' | 'amber' | 'yellow' | 'lime' | 'green' | 'emerald' | 'teal' | 'cyan' | 'sky' | 'blue' | 'indigo' | 'violet' | 'purple' | 'fuchsia' | 'pink' | 'rose'
}

export interface Behaviour {
  target?: '_blank' | '_self' | '_parent' | '_top'
}

export interface LayoutSpacing {
  group?: string
  gridGap?: string
  listGapX?: string
  listGapY?: string
}

export interface LayoutGrid {
  small: number
  medium: number
  large: number
  xlarge: number
  iconSize?: string
  itemPadding?: string
}

export interface Layout {
  grid: LayoutGrid
  list?: LayoutGrid
  spacing?: LayoutSpacing
}

export interface TextStyle {
  fontFamily?: string
  fontSize?: string
  fontWeight?: string | number
  fontStyle?: string
  textDecoration?: string
  color?: string
}

export interface Styles {
  category?: TextStyle
  title?: TextStyle
  description?: TextStyle
  card?: CardStyle
}

export interface BackgroundOverlay {
  color?: string
  opacity?: number
}

export interface Tab {
  name: string
  icon?: string
  hidden?: boolean
  services: ServicesGroup[]
}

export interface LogoText {
  type: 'text'
  text: string
  fontSize?: string
  fontWeight?: string | number
  fontFamily?: string
  color?: string
  backgroundColor?: string
  borderRadius?: string
  padding?: string
}

export interface LogoImage {
  type: 'image'
  image: string
}

export interface LogoBoth {
  type: 'both'
  image: string
  text: string
  fontSize?: string
  fontWeight?: string | number
  fontFamily?: string
  color?: string
  backgroundColor?: string
  borderRadius?: string
  padding?: string
}

export type LogoConfig = string | LogoImage | LogoText | LogoBoth

export interface Footer {
  text?: string
  html?: string
}

export interface UptimeKumaConfig {
  url?: string
  slug?: string
}

export interface MetaOg {
  title?: string
  description?: string
  image?: string
  type?: string
}

export interface Meta {
  description?: string
  keywords?: string
  author?: string
  robots?: string
  og?: MetaOg
}

export interface Config {
  title?: string
  lang?: 'en' | 'ru' | 'zh' | 'hi' | 'es' | 'ar' | 'pl' | 'fr' | 'de' | 'gr'
  theme?: 'system' | 'light' | 'dark' | 'deep' | 'sepia' | 'bluer'
  logo?: LogoConfig
  background?: string
  backgroundOverlay?: BackgroundOverlay
  faviconApi?: string
  styles?: Styles
  layout?: Layout
  behaviour?: Behaviour
  searchProvider?: 'google' | 'duckduckgo'
  searchWebradio?: boolean
  searchWebradioCountryCode?: string
  uptimeKuma?: UptimeKumaConfig
  tags: Tag[]
  services: ServicesGroup[]
  tabs?: Tab[]
  checkUpdates: boolean
  footer?: Footer
  meta?: Meta
  robotsTxt?: boolean
}

export type CompleteConfig = Required<Config> & {
  error?: string
}
