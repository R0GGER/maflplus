import { z } from 'zod'
import { serviceSchema, tagSchema } from './service'

const backgroundOverlaySchema = z.object({
  color: z.string().optional(),
  opacity: z.number().min(0).max(1).optional(),
}).optional()

const textStyleSchema = z.object({
  fontFamily: z.string().optional(),
  fontSize: z.string().optional(),
  fontWeight: z.union([z.string(), z.number()]).optional(),
  fontStyle: z.string().optional(),
  textDecoration: z.string().optional(),
  color: z.string().optional(),
}).optional()

const cardStyleSchema = z.object({
  backgroundColor: z.string().optional(),
  opacity: z.number().min(0).max(1).optional(),
  blur: z.string().optional(),
  borderWidth: z.string().optional(),
  borderStyle: z.enum(['none', 'solid', 'dashed', 'dotted', 'double']).optional(),
  borderColor: z.string().optional(),
  borderRadius: z.string().optional(),
  padding: z.string().optional(),
}).optional()

const stylesSchema = z.object({
  category: textStyleSchema,
  title: textStyleSchema,
  description: textStyleSchema,
  card: cardStyleSchema,
}).optional()

const layoutGridSchema = z.object({
  small: z.number().optional(),
  medium: z.number().optional(),
  large: z.number().optional(),
  xlarge: z.number().optional(),
  iconSize: z.string().optional(),
  itemPadding: z.string().optional(),
})

const layoutSchema = z.object({
  grid: layoutGridSchema.optional(),
  list: layoutGridSchema.optional(),
  spacing: z.object({
    group: z.string().optional(),
    gridGap: z.string().optional(),
    listGapX: z.string().optional(),
    listGapY: z.string().optional(),
  }).optional(),
}).optional()

const servicesGroupSchema = z.object({
  display: z.enum(['grid', 'list']).optional(),
  hideTitle: z.boolean().optional(),
  card: cardStyleSchema,
  items: z.array(serviceSchema),
})

const servicesSchema = z.union([
  z.array(serviceSchema),
  z.record(z.union([z.array(serviceSchema), servicesGroupSchema])),
])

const tabSchema = z.object({
  name: z.string(),
  icon: z.string().optional(),
  hidden: z.boolean().optional(),
  services: servicesSchema,
})

const footerSchema = z.object({
  text: z.string().optional(),
  html: z.string().optional(),
}).optional()

const uptimeKumaSchema = z.object({
  url: z.string().optional(),
  slug: z.string().optional(),
}).optional()

const metaSchema = z.object({
  description: z.string().optional(),
  keywords: z.string().optional(),
  author: z.string().optional(),
  robots: z.string().optional(),
  og: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    image: z.string().optional(),
    type: z.string().optional(),
  }).optional(),
}).optional()

export const configSchema = z.object({
  title: z.string().optional(),
  lang: z.string().optional(),
  theme: z.string().optional(),
  logo: z.union([
    z.string(),
    z.object({
      type: z.literal('image'),
      image: z.string(),
    }),
    z.object({
      type: z.literal('text'),
      text: z.string(),
      fontSize: z.string().optional(),
      fontWeight: z.union([z.string(), z.number()]).optional(),
      fontFamily: z.string().optional(),
      color: z.string().optional(),
      backgroundColor: z.string().optional(),
      borderRadius: z.string().optional(),
      padding: z.string().optional(),
    }),
    z.object({
      type: z.literal('both'),
      image: z.string(),
      text: z.string(),
      fontSize: z.string().optional(),
      fontWeight: z.union([z.string(), z.number()]).optional(),
      fontFamily: z.string().optional(),
      color: z.string().optional(),
      backgroundColor: z.string().optional(),
      borderRadius: z.string().optional(),
      padding: z.string().optional(),
    }),
  ]).optional(),
  background: z.string().optional(),
  backgroundOverlay: backgroundOverlaySchema,
  faviconApi: z.string().optional(),
  styles: stylesSchema,
  layout: layoutSchema,
  checkUpdates: z.boolean().optional(),
  searchProvider: z.enum(['google', 'duckduckgo']).optional(),
  searchWebradio: z.boolean().optional(),
  searchWebradioCountryCode: z.string().max(2).optional(),
  uptimeKuma: uptimeKumaSchema,
  tags: z.array(tagSchema).optional(),
  tabs: z.array(tabSchema).optional(),
  services: servicesSchema.optional(),
  footer: footerSchema,
  meta: metaSchema,
  robotsTxt: z.boolean().optional(),
}).refine(
  data => data.services || data.tabs,
  { message: 'Either "services" or "tabs" must be provided' },
)
