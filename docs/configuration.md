# Configuration (config.yml)

All settings live in a single `config.yml` file inside the data volume (`./mafl/`). This page documents every available option.

**Editing tools:**

- [Config Builder](https://config.maflplus.eu/) — standalone visual editor in your browser (no server required)
- [Admin Panel](admin.md) — built-in editor at `/admin` on your running instance (changes are saved and applied instantly)

---

## Table of Contents

- [Title](#title)
- [Language](#language)
- [Theme](#theme)
- [Logo](#logo)
- [Background](#background)
- [Layout](#layout)
- [Styles](#styles)
- [Card Style](#card-style)
- [Search](#search)
- [Tabs](#tabs)
- [Services](#services)
- [Display Modes](#display-modes)
- [Grid Span](#grid-span)
- [Grid Stack](#grid-stack)
- [Web Radio](#web-radio)
- [Service Item Properties](#service-item-properties)
- [Icon](#icon)
- [Status Indicator](#status-indicator)
- [Uptime Kuma](#uptime-kuma)
- [Favicon API](#favicon-api)
- [Tags](#tags)
- [Behaviour](#behaviour)
- [Footer](#footer)
- [SEO & Meta](#seo--meta)
- [Check Updates](#check-updates-watchtower)
- [Demo config.yml](#demo-configyml)

---

## Title

The page title shown in the browser tab and used as the PWA app name.

```yaml
title: MAFL+
```

Default: `MAFL+`

---

## Language

The app detects your browser language automatically. Override it with:

```yaml
lang: en
```

Values: `en`, `ru`, `zh`, `hi`, `es`, `ar`, `pl`, `fr`, `de`, `gr`, `nl`

Default: `en`

---

## Theme

Set a fixed color theme for the dashboard.

```yaml
theme: dark
```

Values: `system`, `light`, `dark`, `deep`, `sepia`, `bluer`

Default: `system`

---

## Logo

Display a logo in the top-left corner of the homepage. Three modes are available: **image**, **text** or **both**.

> The logo is only visible on screens wider than 1640px.

### Image logo

Place the image file in the data volume (the same directory as `config.yml`), or upload it from **Logo & Favicon** in `/admin`.

```yaml
logo: logo.png
```

Supported formats: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.svg`, `.avif`

### Text / letter logo

Use a text string as your logo with full typographic control.

```yaml
logo:
  type: text
  text: "M+"
  fontSize: 1.5rem
  fontWeight: 700
  fontFamily: "Inter, sans-serif"
  color: "#ffffff"
  backgroundColor: "#3b82f6"
  borderRadius: 0.5rem
  padding: 0.25rem 0.5rem
```

### Combined image + text logo

Display both an image and a text logo side by side. The image is automatically centered vertically relative to the text.

```yaml
logo:
  type: both
  image: logo.png
  text: "MAFL+"
  fontSize: 1.5rem
  fontWeight: 700
  fontFamily: "Inter, sans-serif"
  color: "#ffffff"
  backgroundColor: transparent
  borderRadius: 0
  padding: 0
```

### Logo properties

| Property | Description | Default |
|---|---|---|
| `type` | Logo mode: `text`, `image` or `both` | — |
| `image` | Image filename (required for `image` and `both`) | — |
| `text` | Text to display (required for `text` and `both`) | — |
| `fontSize` | CSS font-size | `1.5rem` |
| `fontWeight` | CSS font-weight (100–900) | `700` |
| `fontFamily` | CSS font-family | `inherit` |
| `color` | Text color | `#ffffff` |
| `backgroundColor` | Background color behind the text | `transparent` |
| `borderRadius` | CSS border-radius | `0` |
| `padding` | CSS padding | `0` |

Default: _none_ (no logo)

---

## Background

Display a full-screen background image. Upload it from **Global Settings** in `/admin` (same picker as the logo), or place the image file in the data volume (the same directory as `config.yml`).

Admin uploads are converted to **WebP at 80% quality** — the best everyday trade-off between file size and visual quality for photographic backgrounds. SVG uploads are left unchanged. JPEG, PNG and AVIF still work if you copy them into `data/` yourself.

```yaml
background: background.webp
```

Supported formats: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.svg`, `.avif` (max 10 MB when uploading from `/admin`)

Default: _none_

### Background overlay

Add a color overlay on top of the background image to improve text readability. Only takes effect when `background` is set.

```yaml
background: background.webp
backgroundOverlay:
  color: '#000000'
  opacity: 0.5
```

| Property | Description | Default |
|---|---|---|
| `color` | Any valid CSS color (hex, rgb, named, etc) | `#000000` |
| `opacity` | Value between `0` (transparent) and `1` (opaque) | `0.5` |

---

## Layout

Controls the responsive column layout and spacing of the dashboard.

### Grid columns

Sets the number of columns for groups using `display: grid` at different screen widths.

```yaml
layout:
  grid:
    small: 2      # ≥640px
    medium: 2     # ≥768px
    large: 3      # ≥1024px
    xlarge: 5     # ≥1280px
```

Values: `1` – `6`

You can specify only the breakpoints you want to override; the rest will be set automatically.

### Grid item size

Optional settings under `layout.grid` to control the size of icons and padding inside grid cards. Use smaller values to fit more items per row — especially when combined with a higher column count.

```yaml
layout:
  grid:
    small: 2
    medium: 3
    large: 4
    xlarge: 8
    iconSize: 2.5rem
    itemPadding: 0.5rem
```

| Property | Description | Default |
|---|---|---|
| `iconSize` | Width and height of service icons in grid cards | `4rem` |
| `itemPadding` | Inner padding and gap between icon and text in each grid card | `1rem` |

Any valid CSS unit works (`rem`, `px`, `em`, etc).

### List columns

Sets the number of columns for groups using `display: list` at different screen widths.

```yaml
layout:
  list:
    small: 2      # ≥640px
    medium: 3     # ≥768px
    large: 4      # ≥1024px
    xlarge: 5     # ≥1280px
```

Values: `1` – `6`

Works exactly like grid above, but applies only to groups with `display: list`.

### Spacing

Controls the vertical spacing between groups and the gap between items.

```yaml
layout:
  spacing:
    group: 1.5rem
    item: 0.25rem
```

| Property | Description | Default |
|---|---|---|
| `group` | Vertical padding around each category group | `2.5rem` |
| `item` | Gap between items within a grid or list group | `0.5rem` |

Any valid CSS unit works (`rem`, `px`, `em`, etc).

### Full layout example

```yaml
layout:
  grid:
    small: 2
    medium: 2
    large: 3
    xlarge: 5
    iconSize: 2.5rem
    itemPadding: 0.5rem
  list:
    small: 2
    medium: 3
    large: 4
    xlarge: 5
  spacing:
    group: 1.5rem
    item: 0.25rem
```

---

## Styles

Customize the font family, size, weight, style, decoration and color for category headers, service titles and service descriptions.

```yaml
styles:
  category:
    fontFamily: 'Arial, sans-serif'
    fontSize: 1.5rem
    fontWeight: bold
    fontStyle: normal
    textDecoration: none
    color: '#ffffff'
  title:
    fontSize: 1.1rem
    fontWeight: 600
    color: '#ffffff'
  description:
    fontSize: 0.8rem
    fontStyle: italic
    color: '#cccccc'
```

All three elements (`category`, `title`, `description`) support the same properties:

| Property | Description | Examples |
|---|---|---|
| `fontFamily` | Font family | `'Arial, sans-serif'`, `'Georgia, serif'` |
| `fontSize` | Font size | `1.5rem`, `18px`, `1.2em` |
| `fontWeight` | Font weight | `bold`, `normal`, `600`, `lighter` |
| `fontStyle` | Font style | `italic`, `normal` |
| `textDecoration` | Text decoration | `underline`, `line-through`, `none` |
| `color` | Text color | `'#ffffff'`, `'rgb(255,255,255)'` |

All properties are optional — only specify what you want to customize.

Default: _inherits from theme_

---

## Card Style

Wrap each service group in a styled card with a background, opacity, glassmorphism blur, border and padding. The card style can be set globally and overridden per group.

### Global card style

Set a default card style for all groups under `styles.card`:

```yaml
styles:
  card:
    backgroundColor: '#1a1a2e'
    opacity: 0.8
    blur: 10px
    borderWidth: '1px'
    borderStyle: solid
    borderColor: 'rgba(255,255,255,0.2)'
    borderRadius: 0.5rem
    padding: 1rem
```

### Per-group card override

Override the global card style for individual groups by adding a `card` key inside the group. Per-group values override individual global defaults; omitted properties fall back to the global card style.

```yaml
services:
  NEWS:
    display: list
    card:
      backgroundColor: '#2a2a3e'
      opacity: 0.6
      borderWidth: '2px'
      borderStyle: dashed
      borderColor: '#ff0000'
    items:
      - title: NOS
        link: https://nos.nl
```

### Card style properties

| Property | Description | Default |
|---|---|---|
| `backgroundColor` | Any valid CSS color | — |
| `opacity` | `0` (transparent) – `1` (opaque) | `1` |
| `blur` | Backdrop blur for glass effect (e.g. `10px`) | — |
| `borderWidth` | CSS border width (e.g. `1px`) | — |
| `borderStyle` | `none`, `solid`, `dashed`, `dotted`, `double` | `solid` |
| `borderColor` | Any valid CSS color | — |
| `borderRadius` | CSS border radius (e.g. `0.5rem`) | — |
| `padding` | CSS padding (e.g. `1rem`) | — |

---

## Search

A search bar is displayed at the top of the page. It filters your bookmarks across all tabs as you type and offers web search as a fallback.

```yaml
searchProvider: google
searchWebradio: true
searchWebradioCountryCode: NL
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `searchProvider` | `google` \| `duckduckgo` | `google` | Web search engine shown in the “Search the web” section |
| `searchWebradio` | `boolean` | `false` | Include live internet radio stations from [Radio Browser](https://api.radio-browser.info/) in search results |
| `searchWebradioCountryCode` | `string` | `NL` | ISO country code filter for Webradio search (only when `searchWebradio` is `true`) |

When `searchWebradio` is enabled, results are grouped into **Bookmarks**, **Webradio** (live stations), and **Search the web**. Press Enter or click a station to play it in the mini player. Saved `web-radio` bookmarks also appear under **Bookmarks** and start playback instead of opening a link.

This setting is **independent** of whether you have `web-radio` modules on the page. Enable it in the [Config Builder](https://config.maflplus.eu/) or [Admin Panel](admin.md) via **Include Webradio stations in search results** (Global Settings, next to Search Provider).

### Keyboard shortcuts

| Key | Action |
|-----|--------|
| `/` | Focus the search bar |
| `Ctrl+K` / `Cmd+K` | Focus the search bar |
| `↑` / `↓` | Navigate results (bookmarks, radio, web search) |
| `Enter` | Open bookmark, play radio station, or web search |
| `Escape` | Clear / close |

For streaming stations as dashboard widgets, see [Web Radio](modules.md#web-radio).

---

## Tabs

Split your services across multiple tabs. Each tab has a name, an optional icon and its own set of service groups.

```yaml
tabs:
  - name: Personal
    icon: mdi:home
    services:
      Favorites:
        display: grid
        items:
          - title: GitHub
            link: https://github.com
  - name: Work
    icon: mdi:briefcase
    locked: true
    services:
      Tools:
        display: list
        items:
          - title: Grafana
            link: https://grafana.local
```

When `tabs` is defined the top-level `services` key is ignored.

> When only a single tab is configured, the tab navigation bar is automatically hidden.

### Tab properties

| Property | Type | Description | Default |
|---|---|---|---|
| `name` | `string` | Tab name (required) | — |
| `icon` | `string` | Iconify icon name (e.g. `mdi:home`) | — |
| `locked` | `boolean` | Protect the tab from accidental deletion | `false` |
| `hidden` | `boolean` | Hide the tab from the frontpage | `false` |
| `services` | `object` | Service groups within this tab (required) | — |

### Tab lock

Add `locked: true` to a tab to protect it from accidental deletion. A locked tab also protects its groups and items — delete buttons are hidden in the admin panel.

```yaml
tabs:
  - name: Personal
    icon: mdi:home
    locked: true
    services: ...
```

### Tab visibility

Add `hidden: true` to a tab to hide it from the frontpage. The tab remains in the config and can still be edited in the admin panel, but it will not appear in the tab navigation or display any services to users.

```yaml
tabs:
  - name: Staging
    icon: mdi:flask
    hidden: true
    services: ...
```

In the admin panel, use the eye icon toggle to show or hide a tab.

### Deep linking

Link directly to a specific tab using a URL hash fragment. The hash is based on the tab name — lowercased with spaces replaced by hyphens and special characters removed.

| Tab name | URL |
|----------|-----|
| Personal | `https://your-mafl/#personal` |
| My Work | `https://your-mafl/#my-work` |

When a user opens a URL with a tab hash, the corresponding tab is automatically activated. Clicking a tab updates the URL hash (without page reload), and browser back/forward navigation between tabs is supported.

---

## Services

The `services` key is the main building block of your dashboard. It defines **groups** of **items** (bookmarks, links, modules) that are displayed on the homepage.

```
services
  └─ Group (e.g. "Favorites", "News", "Tools")
       └─ Item (a bookmark with title, link, icon, etc.)
```

There are three ways to structure your services, from simple to advanced.

### Flat (no groups)

A simple list without group headers — all items appear in a single unnamed section.

```yaml
services:
  - title: Home Assistant
    description: Home automation
    link: https://home-assistant.home.local/
  - title: Grafana
    link: https://grafana.home.local/
```

### Named groups

Organise items under named group headers. Each group name becomes a visible category title on the dashboard.

```yaml
services:
  Favorites:
    - title: Home Assistant
      description: Home automation
      link: https://home-assistant.home.local/
  Tools:
    - title: Grafana
      link: https://grafana.home.local/
```

### Groups with display mode

Each group can choose its own display mode and optional [card style](#card-style). When using a `display` key, items must be nested under `items`:

```yaml
services:
  Favorites:
    display: grid
    items:
      - title: Home Assistant
        description: Home automation
        link: https://home-assistant.home.local/
        icon:
          name: simple-icons:homeassistant
          wrap: true
          color: '#3dbcf3'
  Tools:
    display: list
    items:
      - title: Portainer
        link: https://portainer.home.local/
        icon:
          name: simple-icons:portainer
      - title: Grafana
        link: https://grafana.home.local/
        icon:
          name: simple-icons:grafana
```

> **Note** — Either `services` or `tabs` must be provided. Without at least one of them the homepage will not render.

---

## Display Modes

Each service group can be rendered as a **grid** or a **list**. Set `display` per group.

| Value | Description |
|---|---|
| `grid` | Cards with icon, title and description (default) |
| `list` | Compact rows with small icon and title only |

The column count for each mode is configured separately in the [Layout](#layout) section (`layout.grid` and `layout.list`).

```yaml
services:
  Favorites:
    display: grid
    items:
      - title: Home Assistant
        description: Home automation
        link: https://ha.local
        icon:
          name: simple-icons:homeassistant
          wrap: true
          color: '#3dbcf3'
  Monitoring:
    display: list
    items:
      - title: Grafana
        link: https://grafana.local
        icon:
          name: simple-icons:grafana
          color: '#f46800'
```

---

## Grid Span

Any service item can span multiple grid columns using the `span` property:

```yaml
services:
  Widgets:
    display: grid
    items:
      - type: time
        span: 2
        options:
          timezone: Europe/Amsterdam
      - title: Normal item
        link: https://example.com
```

This works for all service types and modules.

---

## Grid Stack

Place multiple items vertically inside a single grid cell using the `stack` property. The children are rendered top-to-bottom with the same gap as regular grid items.

```yaml
services:
  Widgets:
    display: grid
    items:
      - stack:
          - type: tomtom-eta
            options:
              originAddress: Amsterdam
              destAddress: Paris
            secrets:
              apiKey: your-key
          - type: time
            options:
              timezone: Europe/Amsterdam
              country: nl
      - type: tomtom-eta-map
        span: 2
        options:
          originAddress: Amsterdam
          destAddress: Paris
        secrets:
          apiKey: your-key
```

A stack item supports `span` to control how many columns it occupies. `stack` only works in `display: grid` mode. See [Modules — Grid Stack](modules.md#grid-stack) for more examples.

---

## Web Radio

Add internet radio stations as grid items using `type: web-radio`. Each item is one station — place multiple items in a group to show several stations side by side. Use the station logo as the card icon via `icon.url`.

Playback starts in the browser (no external player). A mini player bar appears at the bottom with play/pause, volume and stop. Stream metadata and URLs are fetched from the free Radio Browser API — no API key required.

For full module documentation (admin station picker, troubleshooting), see [Modules — Web Radio](modules.md#web-radio). To search live stations from the homepage search bar, use [`searchWebradio`](#search) (global setting).

```yaml
services:
  Radio:
    display: grid
    items:
      - type: web-radio
        title: Radio 538
        description: pop, hits
        icon:
          url: https://www.radio538.nl/favicon.ico
        options:
          stationUuid: your-station-uuid-here
          countryCode: NL

      - type: web-radio
        title: NPO Radio 2
        icon:
          url: https://www.nporadio2.nl/static/favicon/apple-touch-icon.png
        options:
          stationUuid: your-station-uuid-here
```

### Web radio options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `stationUuid` | `string` | *required* | Radio Browser station UUID (stable identifier) |
| `countryCode` | `string` | `NL` | ISO country code; default filter when searching stations in the admin Config Builder |

Web radio items support `title`, `description`, `icon`, and `span`. They do not use `link` or `target` — clicking plays the stream on the same page.

Use the admin panel (**Media → Web Radio**) to search stations by name; title, icon URL and UUID are filled in automatically.

---

## Service Item Properties

Each service item supports the following properties:

| Property | Type | Description | Default |
|---|---|---|---|
| `title` | `string` | Service name | — |
| `description` | `string` | Short description shown below the title (grid mode only) | — |
| `link` | `string` | URL to open when clicked | — |
| `target` | `string` | Link target: `_blank`, `_self`, `_parent`, `_top` | inherits from [behaviour](#behaviour) |
| `icon` | `object` | Icon configuration (see [Icon](#icon)) | — |
| `status` | `object` | Uptime monitoring (see [Status Indicator](#status-indicator)) | — |
| `tags` | `array` | Tag names or inline tag objects (see [Tags](#tags)) | `[]` |
| `span` | `number` | Number of grid columns to span (see [Grid Span](#grid-span)) | `1` |
| `stack` | `array` | Child items to render vertically in one cell (see [Grid Stack](#grid-stack)) | — |
| `type` | `string` | Module type (see [Modules](modules.md)) | — |
| `options` | `object` | Module-specific options | — |
| `secrets` | `object` | Module-specific secrets (e.g. API keys) | — |

### Example with all properties

```yaml
- title: Home Assistant
  description: Home automation
  link: https://ha.local
  target: _blank
  icon:
    name: simple-icons:homeassistant
    wrap: true
    color: '#3dbcf3'
  status:
    enabled: true
    position: left
    animation: true
  tags:
    - Home
  span: 2
```

---

## Icon

Services support multiple icon sources. The `icon` object is configured per service item.

### Icon types

| Type | Field | Description | Example |
|---|---|---|---|
| Iconify | `name` | 200,000+ open-source vector icons | `name: simple-icons:github` |
| Emoji | `name` | Any valid emoji character | `name: 🏠` |
| URL | `url` | Direct URL to an image | `url: https://cdn.example.com/icon.svg` |
| Local | `url` | Image file from the data volume | `url: /api/assets/icon.png` |
| Favicon | `favicon` | Auto-fetched by domain via the [Favicon API](#favicon-api) | `favicon: github.com` |

### Icon properties

| Property | Type | Description | Default |
|---|---|---|---|
| `name` | `string` | Iconify icon name or emoji character | — |
| `url` | `string` | Direct URL or local path to an image | — |
| `favicon` | `string` | Domain name for auto-fetched favicon | — |
| `wrap` | `boolean` | Show a circular background behind the icon | `false` |
| `color` | `string` | Icon color (Iconify icons only) | _inherits from theme_ |
| `background` | `string` | Custom background color for the icon circle | _inherits from theme_ |
| `hidden` | `boolean` | Render the item without an icon, dropping the reserved space as well | `false` |

### No icon

Leaving `icon` out gives an item without an icon, but the space for it stays reserved, so the title keeps its indent. Modules that have a fallback icon — such as [`uptime-kuma`](modules.md#uptime-kuma) or [`web-radio`](modules.md#web-radio) — also keep showing theirs.

Set `hidden` to remove both:

```yaml
- title: Just a label
  link: https://example.com
  icon:
    hidden: true
```

In the Config Builder this is the fourth **Icon Type** option, **none**. Cards without an icon also use half the usual top padding, so the header is less tall without leftover icon space. Left and right padding stay full so the text still lines up with the group title; bottom padding stays full so the hover highlight still has margin before content below.

### Icon examples

```yaml
# Iconify icon with color and wrap
icon:
  name: simple-icons:github
  color: '#ffffff'
  wrap: true

# URL icon
icon:
  url: https://cdn.jsdelivr.net/gh/selfhst/icons@main/svg/proton.svg
  wrap: true

# Favicon (requires faviconApi to be configured)
icon:
  favicon: github.com

# Emoji
icon:
  name: 🏠
```

See [Favicons](favicons.md) for icon types, self-hosted favicon API setup and custom PWA favicons.

---

## Status Indicator

Enable a live uptime indicator per service. By default the indicator shows whether the service URL is reachable, measured with a TCP ping from the MAFL+ server.

```yaml
- title: Home Assistant
  link: https://ha.local
  status:
    enabled: true
    position: left
    animation: true
    interval: 60
```

### Status properties

| Property | Type | Description | Default |
|---|---|---|---|
| `enabled` | `boolean` | Enable the status indicator | `false` |
| `position` | `string` | Indicator position: `left` or `right` | `right` |
| `animation` | `boolean` | Show a pulsing animation on the indicator | `true` |
| `interval` | `number` | Ping interval in seconds | `60` |
| `monitor` | `number` \| `string` | Take the status from an [Uptime Kuma](#uptime-kuma) monitor instead of a TCP ping | — |

### Status from Uptime Kuma

Instead of pinging the link, the indicator can reflect the real state of an [Uptime Kuma](#uptime-kuma) monitor. This is more accurate than a TCP ping, because Kuma already knows about HTTP status codes, keywords, certificates and retries.

Configure the instance once with [`uptimeKuma`](#uptime-kuma), then point each item at a monitor with `status.monitor`:

```yaml
uptimeKuma:
  url: http://192.168.1.10:3001
  slug: default

services:
  Apps:
    display: grid
    items:
      - title: Home Assistant
        link: https://ha.local
        icon:
          favicon: home-assistant.io
        status:
          enabled: true
          monitor: 4            # Uptime Kuma monitor ID

      - title: Nextcloud
        link: https://cloud.local
        icon:
          favicon: nextcloud.com
        status:
          enabled: true
          monitor: Nextcloud    # or match on the monitor name
```

`monitor` accepts either the numeric monitor ID or the monitor name as shown on the status page. Name matching is case-insensitive and needs `uptimeKuma.slug` to be set.

Indicator colours:

| Monitor state | Indicator |
|---|---|
| Up | Green |
| Down or Pending | Red |
| Maintenance | Grey |
| Monitor not found or instance unreachable | Grey |

Maintenance deliberately shows grey rather than red, so planned downtime does not look like an outage. Items without `monitor` keep using the TCP ping, so you can mix both on one dashboard.

In the Config Builder the field appears on a bookmark as **Uptime Kuma monitor** once **Uptime monitoring** is checked. Leave it empty to keep the TCP ping.

---

## Uptime Kuma

Connect MAFL+ to an [Uptime Kuma](https://github.com/louislam/uptime-kuma) instance. One global block serves both the [`uptime-kuma` module](modules.md#uptime-kuma) and the per-item [status indicator](#status-from-uptime-kuma).

```yaml
uptimeKuma:
  url: http://192.168.1.10:3001
  slug: default
```

| Property | Type | Description | Default |
|---|---|---|---|
| `url` | `string` | Base URL of the Uptime Kuma instance, without a trailing slash | — |
| `slug` | `string` | Slug of a published status page | — |

Both values can be overridden per module through `options.url` and `options.slug`. In the Config Builder both fields live under **Global Settings**.

> **Requirement:** Uptime Kuma only exposes monitor data for monitors that belong to a **published status page**. Add the monitors you want to show to a status page in Kuma and publish it, otherwise Kuma reports them as `N/A`.

All requests are made server-side, so `url` may be an internal LAN address that is not reachable from your browser. Note that `uptimeKuma.url` is part of the settings payload the frontend receives; if you would rather not expose it, set it per module through `secrets.url` instead, which is stripped from everything the browser sees.

---

## Favicon API

Automatically fetch service icons by domain name using a favicon API. The default is [faviconapi.com](https://faviconapi.com); you can replace it with any other endpoint, or [create a Custom URL](https://faviconapi.com/#tools) that encodes providers, fallbacks and size.

```yaml
faviconApi: https://faviconapi.com
```

Then reference a domain in any service icon:

```yaml
icon:
  favicon: github.com
```

Favicons are proxied through the MAFL+ server with disk caching. The external favicon API is called only once per domain per 7 days. Benefits:

- **Privacy** — the client never contacts the favicon API directly
- **Performance** — cached favicons are served instantly from disk
- **Offline support** — favicons are cached by the Service Worker
- **Reduced API calls** — each domain is fetched only once per week

See [Favicons](favicons.md) for self-hosted favicon API setup and custom PWA favicons.

---

## Tags

Tags allow you to categorise and differentiate between services with colored labels.

```yaml
tags:
  - name: Home
    color: green
  - name: Work
    color: blue
```

Tag names must be unique. Reference tags by name in any service item:

```yaml
- title: Home Assistant
  link: https://ha.local
  tags:
    - Home
```

Available colors: `red`, `orange`, `amber`, `yellow`, `lime`, `green`, `emerald`, `teal`, `cyan`, `sky`, `blue`, `indigo`, `violet`, `purple`, `fuchsia`, `pink`, `rose`

Default color: `blue`

See [Tags](tags.md) for global vs local tag usage and more examples.

---

## Behaviour

A group of parameters responsible for the global behavior of the application.

### Target

Browser behavior when a service is clicked. This sets the default for all services; individual services can override it with their own `target` property.

```yaml
behaviour:
  target: _blank
```

| Value | Description |
|---|---|
| `_blank` | Open in a new tab (default) |
| `_self` | Open in the current tab |
| `_parent` | Open in the parent browsing context |
| `_top` | Open in the topmost browsing context |

Default: `_blank`

---

## Footer

Display content at the bottom of every page. Both fields are optional — the footer is only shown when at least one is configured. The Config Builder pre-fills `html` with the MAFL+ credit and an Admin link; existing `footer.html` values are left unchanged.

```yaml
footer:
  text: "© 2026 My Dashboard"
  html: '<p>Modified with ❤️ by <a href="https://github.com/R0GGER/mafl" style="color:white;">MAFL+</a> | <a target="_blank" href="/admin" style="color:white;">Admin</a></p>'
```

| Property | Type | Description |
|---|---|---|
| `text` | `string` | Plain text displayed in the footer |
| `html` | `string` | Custom HTML content rendered in the footer. Config Builder default: MAFL+ credit + Admin link |

---

## SEO & Meta

Configure HTML meta tags for search engines and social sharing, and control whether crawlers are blocked via `robots.txt`.

```yaml
meta:
  description: "My personal homelab dashboard"
  keywords: "homelab, dashboard, services"
  author: "John Doe"
  robots: "noindex, nofollow"
  og:
    title: "My Dashboard"
    description: "All my self-hosted services in one place"
    image: "https://example.com/og.png"
    type: website

robotsTxt: true
```

| Property | Type | Description |
|---|---|---|
| `meta.description` | `string` | Page description (also used in PWA manifest) |
| `meta.keywords` | `string` | Comma-separated keywords |
| `meta.author` | `string` | Content author |
| `meta.robots` | `string` | HTML meta robots directive. Default: `noindex, nofollow` |
| `meta.og.title` | `string` | Open Graph title (defaults to page title) |
| `meta.og.description` | `string` | Open Graph description (defaults to `meta.description`) |
| `meta.og.image` | `string` | Open Graph image URL |
| `meta.og.type` | `string` | Open Graph type (e.g. `website`) |
| `robotsTxt` | `boolean` | When `true` (default), serves `Disallow: /` to block all crawlers. Set to `false` to allow indexing. |

---

## Check Updates (Watchtower)

Run once to check for container image updates, apply them and clean up:

```bash
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock --pull=always nickfedor/watchtower --run-once --cleanup
```

---

## Demo: config.yml

A complete example configuration with two tabs, multiple groups and various display modes.

**Tab: Personal**
- 10 Favorites (grid)
- 10 Groups with 5 listed items each
- Weather widget

**Tab: Work**
- 5 Favorites (grid)
- 5 Groups with 5 listed items each

```yaml
title: bookmarks
lang: en
theme: dark
logo: logo.png
background: background1.jpg
faviconApi: https://faviconapi.com
backgroundOverlay:
  color: '#000000'
  opacity: 0.5

behaviour:
  target: _blank

searchProvider: google
searchWebradio: true
searchWebradioCountryCode: NL

layout:
  grid:
    small: 2
    medium: 2
    large: 3
    xlarge: 5
    iconSize: 2.5rem
    itemPadding: 0.5rem
  spacing:
    group: 1.5rem
    item: 0.25rem

styles:
  category:
    color: '#ffffff'
    fontSize: 1.5rem
    fontWeight: 600
  title:
    color: '#ffffff'
    fontSize: 0.875rem
  description:
    color: '#cccccc'
    fontStyle: italic

tabs:
  - name: Personal
    icon: mdi:home
    services:
      FAVORITES:
        display: grid
        items:
          - title: iperf3serverlist.net
            description: website
            link: https://iperf3serverlist.net
            icon:
              favicon: iperf3serverlist.net
              wrap: true
            status:
              enabled: true
          - title: Proton Mail
            description: mail.proton.me
            link: https://mail.proton.me
            icon:
              url: https://cdn.jsdelivr.net/gh/selfhst/icons@main/svg/proton.svg
              wrap: true
          - title: GitHub
            description: github.com
            link: https://github.com
            icon:
              name: simple-icons:github
              wrap: true

      News:
        display: list
        items:
          - title: NOS
            link: https://nos.nl
            icon:
              favicon: nos.nl
          - title: Tweakers
            link: https://tweakers.net
            icon:
              url: https://favicon-3j1.pages.dev/favicon/tweakers.net?larger=true
          - title: Ars Technica
            link: https://arstechnica.com
            icon:
              favicon: arstechnica.com

      Automation:
        display: list
        items:
          - title: Home Assistant
            link: https://ha.local
            icon:
              name: simple-icons:homeassistant
              color: '#18bcf2'
          - title: Node-RED
            link: https://nodered.local
            icon:
              name: simple-icons:nodered
              color: '#8f0000'

      WEATHER:
        display: grid
        items:
          - type: openweathermap
            options:
              lat: 52.370216
              lon: 4.895168
              units: metric
            secrets:
              apiKey: your-api-key

  - name: Work
    icon: mdi:work
    locked: true
    services:
      FAVORITES:
        display: grid
        items:
          - title: Proton Mail
            description: mail.proton.me
            link: https://mail.proton.me
            icon:
              url: https://cdn.jsdelivr.net/gh/selfhst/icons@main/svg/proton.svg
              wrap: true

      Monitoring:
        display: list
        items:
          - title: Grafana
            link: https://grafana.local
            icon:
              name: simple-icons:grafana
              color: '#f46800'
          - title: Uptime Kuma
            link: https://uptime.local
            icon:
              name: simple-icons:uptimekuma
              color: '#5cdd8b'
```
