# MAFL+ Wiki

**Mafl+** is a minimalistic and flexible homepage dashboard, forked from [hywax/mafl](https://github.com/hywax/mafl) with extended layout options, search, tabs and more.

**Demo:** [maflplus.eu](https://maflplus.eu)

> **Note:** This is an independent fork. It is **not** affiliated with the upstream [hywax/mafl](https://github.com/hywax/mafl) project.

---

## Features

- **Privacy** — All requests to third-party services happen server-side.
- **Secure** — No database, no tracking — your entire configuration lives in a single `config.yml` file.
- **Single config file** — One YAML file is all you need. Easy to back up, version and migrate.
- **Real-time** — Interactive service cards with live status information.
- **Search** — Filter bookmarks instantly; optional live Webradio search; fall back to Google or DuckDuckGo.
- **Tabs** — Organise services into switchable tabs with lock protection, visibility toggle and deep linking via URL hash.
- **Admin Panel** — Built-in config editor at `/admin` with secure login.
- **Backgrounds** — Full-screen background images with color overlay.
- **Themes** — Six built-in themes or full custom styling.
- **Grouping** — Grid and list display modes per group.
- **Modules** — Time, DateTime Weather, Greeting, Custom HTML, IP API, OpenWeatherMap.
- **Tags** — Add tags to your services.
- **Multi-language** — Automatic language detection with 10+ locales.
- **Easy setup** — A few lines of YAML and your homepage is ready.
- **Fast** — Powered by Nuxt 3 — everything is snappy.
- **Caching** — Server-side favicon proxy with disk cache and Service Worker offline support.
- **Docker** — Optimised container images with example config on first run.
- **PWA** — Installable as a progressive web app.
- **Config Builder** — Visual editor at [config.maflplus.eu](https://config.maflplus.eu/) for creating and editing `config.yml`.
- **Free & open source** — MIT licensed.

---

## What's Different from Upstream?

| Area | What changed |
|------|-------------|
| **Grid layout** | Responsive grid with up to 6 columns (`small` / `medium` / `large` / `xlarge`) |
| **Grid item size** | Configurable icon size and item padding for compact grid cards |
| **List layout** | Compact list display mode per group with its own column config |
| **Spacing** | Configurable spacing between groups and items |
| **Styles** | Per-element styling for category headers, titles and descriptions |
| **Card style** | Wrap groups in styled cards with background, opacity, glassmorphism blur, border and padding — globally and per group |
| **Logo** | Fixed responsive logo in the top-left corner — image, text/letter or both combined |
| **Background** | Full-screen background image with optional color overlay |
| **Tabs** | Organise services into switchable tabs with icons, lock protection, visibility toggle and deep linking via URL hash. Tab bar auto-hides with a single tab. |
| **Search** | Filter bookmarks across tabs; optional Webradio search (`searchWebradio`); web search fallback (`/`, `Ctrl+K`) |
| **Favicon API** | Auto-fetch service icons by domain name with server-side proxy cache |
| **Caching** | Server-side favicon proxy with disk cache (7 days per domain) and Service Worker offline support |
| **Status position** | Align the status indicator to `left` or `right` |
| **Admin Panel** | Built-in visual config editor at `/admin` with config import/export, YAML syntax highlighting, reorder groups/items and WebSocket hot-reload |
| **Modules** | Time, DateTime Weather, Greeting, Custom HTML, IP API, OpenWeatherMap widgets |
| **Grid span** | Any service item can span multiple grid columns |
| **Footer** | Global footer with text and/or HTML content |
| **PWA** | Dynamic manifest uses the app title from config — no rebuild needed |
| **Config Builder** | Standalone visual editor at [config.maflplus.eu](https://config.maflplus.eu/) — no server required |
| **Example config** | On first Docker run, an example `config.yml` is automatically created |

---

## Quick Start

### Docker

The image is published to the **GitHub Container Registry**.

```yaml
services:
  mafl:
    image: ghcr.io/r0gger/maflplus
    restart: unless-stopped
    ports:
      - '3000:3000'
    volumes:
      - ./mafl/:/app/data/
    environment:
      # Admin panel: generate hash with maflpass (see below)
      - NUXT_ADMIN_PASSWORD_HASH=
      # Session encryption key (min 32 chars, random string)
      - NUXT_SESSION_PASSWORD=
```

Place your `config.yml` (and optional background images) inside the `./mafl/` directory.
On first run, if no `config.yml` exists, an example configuration is automatically created for you.

### maflpass

[**maflpass**](https://github.com/R0GGER/maflpass) is a lightweight Docker utility for generating the secrets needed by the admin panel — no local Node.js or OpenSSL required.

**Generate the admin password hash:**

```bash
docker run --rm -e generate=password_hash --pull=always ghcr.io/r0gger/maflpass <your_password>
```

This outputs a scrypt hash in the format `salt:derivedKey` (hex-encoded) that you paste into the `NUXT_ADMIN_PASSWORD_HASH` environment variable.

**Generate the session password:**

```bash
docker run --rm -e generate=session_password --pull=always ghcr.io/r0gger/maflpass
```

This outputs a random 64-character hex string (≥ 32 chars) that you paste into the `NUXT_SESSION_PASSWORD` environment variable.

| Before | After |
|--------|-------|
| Required Node.js or OpenSSL installed locally | Single Docker command — no dependencies |
| Multiple steps to generate and format the hash | One command per secret |
| Easy to make formatting mistakes | Output is ready to copy-paste |

See [Admin Panel](admin.md) for full setup instructions.

### Check for updates (Watchtower)

Run once to check, update and clean up:

```bash
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock --pull=always nickfedor/watchtower --run-once --cleanup
```

---

## Configuration Overview

All settings live in a single `config.yml` file inside the data volume. See [Configuration](configuration.md) for the full reference.

### Title

```yaml
title: MAFL+
```

### Language

The app detects your browser language automatically. Override it in `config.yml`:

```yaml
lang: en
```

Supported languages: `en`, `ru`, `zh`, `hi`, `es`, `ar`, `pl`, `fr`, `de`, `gr`, `nl`

### Theme

Six built-in themes: `system`, `light`, `dark`, `deep`, `sepia`, `bluer`.

```yaml
theme: dark
```

### Layout

Control the responsive grid columns, item sizing and spacing for both grid and list display modes.

```yaml
layout:
  grid:
    small: 2      # ≥640px
    medium: 2     # ≥768px
    large: 3      # ≥1024px
    xlarge: 5     # ≥1280px
    iconSize: 2.5rem    # optional — default 4rem
    itemPadding: 0.5rem # optional — default 1rem
  list:
    small: 2
    medium: 3
    large: 4
    xlarge: 5
  spacing:
    group: 1.5rem
    item: 0.25rem
```

Column values range from `1` to `6`. Use smaller `iconSize` and `itemPadding` values together with more columns to fit more icons per row.

### Styles

Customise category headers, service titles and descriptions with `fontFamily`, `fontSize`, `fontWeight`, `fontStyle`, `textDecoration` and `color`.

```yaml
styles:
  category:
    color: '#ffffff'
    fontSize: 1.5rem
    fontWeight: 600
  title:
    color: '#ffffff'
  description:
    color: '#cccccc'
    fontStyle: italic
```

#### Card style

Wrap each service group in a styled card with background, opacity, blur, border and padding — set globally under `styles.card` and override per group.

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

### Logo

Display a logo in the top-left corner — image file or text/letter with full typographic control.

**Image logo:** place the file in your data volume:

```yaml
logo: logo.png
```

**Text logo:**

```yaml
logo:
  type: text
  text: "M+"
  fontSize: 1.5rem
  fontWeight: 700
  color: "#ffffff"
  backgroundColor: "#3b82f6"
  borderRadius: 0.5rem
  padding: 0.25rem 0.5rem
```

Supported image formats: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.svg`, `.avif`

### Background

Set a full-screen background image from your data volume, with an optional color overlay for readability.

```yaml
background: background.jpg
backgroundOverlay:
  color: '#000000'
  opacity: 0.5
```

### Tabs

Split services across multiple tabs, each with a name, optional icon and its own service groups.

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

- `locked: true` — protect a tab from accidental deletion.
- `hidden: true` — hide a tab from the frontpage (still editable in admin).
- **Deep linking** — link directly to a tab via URL hash (e.g. `/#personal`, `/#my-work`).

### Search

A search bar filters bookmarks across all tabs, optionally includes live Webradio stations (Radio Browser), and falls back to web search.

```yaml
searchProvider: google
searchWebradio: true
searchWebradioCountryCode: NL
```

| Option | Default | Description |
|--------|---------|-------------|
| `searchProvider` | `google` | Web search engine: `google` or `duckduckgo` |
| `searchWebradio` | `false` | Search live internet radio stations in the search bar |
| `searchWebradioCountryCode` | `NL` | Country filter for Webradio search results |

See [Configuration — Search](configuration.md#search) for details.

| Key | Action |
|-----|--------|
| `/` | Focus the search bar |
| `Ctrl+K` / `Cmd+K` | Focus the search bar |
| `↑` / `↓` | Navigate results |
| `Enter` | Open selected result |
| `Escape` | Clear / close |

### Display modes

Each service group can be rendered as **grid** (cards) or **list** (compact rows). Set `display: grid` or `display: list` per group.

### Favicon API

Automatically fetch service icons by domain name. The default is [faviconapi.com](https://faviconapi.com); you can replace it with any other endpoint, or [create a Custom URL](https://faviconapi.com/#tools).

```yaml
faviconApi: https://faviconapi.com
```

```yaml
icon:
  favicon: github.com
```

Favicons are cached server-side (7 days per domain). See [Favicons](favicons.md) for icon types, self-hosted API setup and PWA favicons.

### Status indicator

Enable a live ping indicator per service, aligned to `left` or `right` (default).

```yaml
- title: Home Assistant
  link: https://ha.local
  status:
    enabled: true
    position: left
    animation: true
```

### Grid span

Any service item can span multiple grid columns:

```yaml
- type: time
  span: 2
  options:
    timezone: Europe/Amsterdam
```

### Footer

Display text and/or HTML content at the bottom of every page.

```yaml
footer:
  text: "© 2026 My Dashboard"
  html: '<p>Powered by <a href="https://github.com/R0GGER/maflplus">MAFL+</a></p>'
```

---

## Services

Services are the building blocks of your dashboard. Each service can have a title, description, link, icon, status indicator, tags and an optional `span` for multi-column width.

Three ways to structure services: flat (no groups), named groups, or groups with display mode. See [Configuration](configuration.md) for full details.

### Built-in modules

| Module | Description |
|--------|-------------|
| **Time** | Live clock with date for any IANA timezone |
| **DateTime Weather** | Combined clock and weather widget (OpenWeatherMap) |
| **Greeting** | Custom greeting message with optional subtitle |
| **Custom HTML** | Render arbitrary HTML content (including scripts) |
| **OpenWeatherMap** | Current weather for a given location |
| **IP API** | Public IP address information with country flag |

See [Modules](modules.md) for options and examples.

---

## Icons

Services support multiple icon sources:

| Type | Description |
|------|-------------|
| [Iconify](https://icon-sets.iconify.design/) | 200,000+ open-source vector icons (e.g. `simple-icons:github`, `mdi:home`) |
| Emoji | Any valid emoji character |
| URL | Direct URL to an image |
| Local | Image file stored in the data volume |
| Favicon | Auto-fetched via the configured [favicon API](#favicon-api) by domain name |

See [Favicons](favicons.md) for icon configuration, self-hosted favicon API and custom PWA favicons.

---

## Tags

Add colored labels to differentiate services. Tags can be declared globally or locally per service.

```yaml
tags:
  - name: Home
    color: green
```

See [Tags](tags.md) for usage examples and available colors.

---

## Admin Panel

A built-in visual config editor at `/admin` for editing `config.yml` directly from the browser. Changes are saved and applied instantly via WebSocket hot-reload.

**Highlights:**

- Global settings, layout, styles, tabs, tags and per-item editing
- Tab lock, visibility toggle and collapsible sections
- Reorder groups and items with drag buttons
- Auto-fill favicon domain from link URL
- Browse icons links (Iconify, emoji, selfh.st, dashboardicons)
- Module configuration for all built-in widgets
- Secure login with scrypt password hashing, encrypted sessions and rate limiting

**Setup:** generate secrets with [maflpass](#maflpass) and set the `NUXT_ADMIN_PASSWORD_HASH` and `NUXT_SESSION_PASSWORD` environment variables. See [Admin Panel](admin.md) for the full guide.

---

## Config Builder

A standalone visual tool for creating and editing `config.yml` — no server or dependencies required.

**Open the [Config Builder](https://config.maflplus.eu/)** in your browser.

- Edit all global settings (title, language, theme, background, search, footer, etc.)
- Add and reorder tabs, groups and bookmarks
- Configure icons (favicon, URL or Iconify name with color)
- Configure modules (Time, DateTime Weather, Greeting, Custom HTML, IP API, OpenWeatherMap)
- Grid span setting per service item
- Import an existing `config.yml` to modify it
- Live YAML preview with one-click copy to clipboard
- Light and dark theme

---

## Wiki Pages

| Page | Description |
|------|-------------|
| [Home](https://wiki.maflplus.eu) | This page |
| [Getting Started](https://wiki.maflplus.eu/1-getting-started) | Installation and first run |
| [Configuration](https://wiki.maflplus.eu/2-configuration) | Layout, styles, logo, background, tabs, search, display modes, favicon API and status indicators |
| [Favicons](https://wiki.maflplus.eu/3-favicons) | Icon types: Iconify, emoji, URL, local images and favicon API |
| [Modules](https://wiki.maflplus.eu/4-modules) | Built-in widgets: Time, DateTime Weather, Greeting, Custom HTML, IP API |
| [Tags](https://wiki.maflplus.eu/5-tags) | Categorise services with colored labels |
| [Admin Panel](https://wiki.maflplus.eu/6-admin) | Built-in config editor with secure login |

---

## Links

- [GitHub Repository](https://github.com/R0GGER/maflplus)
- [Config Builder](https://config.maflplus.eu/)
- [Docker Image](https://github.com/R0GGER/maflplus/pkgs/container/maflplus)
- [maflpass Utility](https://github.com/R0GGER/maflpass)
- [Wiki](https://wiki.maflplus.eu/)

---

## License

Open-source software licensed under the [MIT license](https://github.com/R0GGER/maflplus/blob/main/LICENSE).
Based on [hywax/mafl](https://github.com/hywax/mafl) — thank you to the original author and all contributors.
