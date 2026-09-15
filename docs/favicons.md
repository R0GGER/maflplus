# Favicons

## Table of Contents

- [Service Icons](#service-icons)
  - [Icon configuration](#icon-configuration)
- [Favicon API](#favicon-api)
  - [Self-hosted Favicon API](#self-hosted-favicon-api)
  - [Server-side proxy cache](#server-side-proxy-cache)
- [Custom App Favicons (PWA)](#custom-app-favicons-pwa)
  - [Upload via /admin (recommended)](#upload-via-admin-recommended)
  - [Logo creation](#logo-creation)
  - [Mount the favicons volume](#mount-the-favicons-volume)


## Service Icons

MAFL+ supports multiple icon sources for services:

| Type | Description | Example |
|------|-------------|---------|
| [Iconify](https://icon-sets.iconify.design/) | 200,000+ open-source vector icons | `name: simple-icons:github` |
| Emoji | Any valid emoji character | `name: 🏠` |
| URL | Direct URL to an image | `url: https://cdn.example.com/icon.svg` |
| Local | Image file stored in the data volume | `url: /api/assets/icon.png` |
| Favicon | Auto-fetched by domain name via the configured favicon API | `favicon: github.com` |

### Icon configuration

```yaml
icon:
  name: simple-icons:github    # Iconify name or emoji
  color: '#ffffff'             # Icon color (Iconify only)
  wrap: true                   # Show background circle
```

```yaml
icon:
  url: https://cdn.jsdelivr.net/gh/selfhst/icons@main/svg/proton.svg
  wrap: true
```

```yaml
icon:
  favicon: github.com
```

## Favicon API

Set a global favicon API base URL in your `config.yml`. When a service uses `icon.favicon`, the domain is passed to this API to fetch the icon automatically. The default is [faviconapi.com](https://faviconapi.com); you can replace it with any other endpoint, or [create a Custom URL](https://faviconapi.com/#tools) that encodes your preferred provider, fallbacks and minimum icon size.

```yaml
faviconApi: https://faviconapi.com
```

Then reference a domain in any service:

```yaml
icon:
  favicon: github.com
```

The domain is always appended after the last slash of `faviconApi`, so the value may include a path prefix. This makes it compatible with Custom URLs from [faviconapi.com](https://faviconapi.com/#tools):

```yaml
faviconApi: https://faviconapi.com/WzEsInNjcmFwZXIiLFsic2NyYXBlciIsInNlbGZoc3QiLCJzdmdsIiwiZ29vZ2xldjIiXSwxMjhd
```

With the config above, a service using `icon.favicon: reddit.com` is resolved to `https://faviconapi.com/WzEs.../reddit.com`. A trailing slash on `faviconApi` is optional (it is stripped automatically).

### Self-hosted Favicon API

Instead of using the default public API, you can run your own instance of the [Favicon API](https://github.com/vemetric/favicon-api) using Docker:

```yaml
services:
  favicon-api:
    image: vemetric/favicon-api
    restart: unless-stopped
    ports:
      - '3003:3000'
```

Once running, update `faviconApi` in your `config.yml` (or via the config-builder) to point to your own instance:

```yaml
faviconApi: http://favicon-api:3003
```

> If both containers share the same Docker network you can use the service name (`favicon-api`) as hostname. Otherwise use the host IP/domain and the mapped port (e.g. `http://192.168.1.100:3003/`).

You can also expose the API via a reverse proxy such as [Caddy](https://caddyserver.com/):

```text
favicon-api.your-domain.tld {
    reverse_proxy favicon-api:3003
}
```

Then set `faviconApi` to the public URL:

```yaml
faviconApi: https://favicon-api.your-domain.tld/
```

See the [Favicon API Quick Start](https://github.com/vemetric/favicon-api#quick-start) for all configuration options and deployment methods.

### Server-side proxy cache

Favicon requests are proxied through the MAFL+ server with disk caching. The external favicon API is called only once per domain per 7 days. Benefits:

- **Privacy** — The client never contacts the favicon API directly
- **Performance** — Cached favicons are served instantly from disk
- **Offline support** — Favicons are cached by the Service Worker for offline access
- **Reduced API calls** — Each domain is fetched only once per week

The cache is stored in `./data/.favicon-cache/` inside the container.

## Custom App Favicons (PWA)

You can personalize the app icon (shown in browser tabs and when installed as a PWA) in two ways: upload one source image via the admin panel (recommended), or pre-generate a favicon package and mount it as a volume.

### Upload via /admin (recommended)

The admin panel has an **App Favicon** section that accepts a single PNG or SVG and automatically generates every variant the app needs:

| Generated file | Size | Purpose |
|----------------|------|---------|
| `favicon.ico` | 16, 32, 48 (multi-res) | Classic browser tab icon |
| `favicon-16x16.png`, `favicon-32x32.png` | 16, 32 | Modern browsers |
| `apple-touch-icon.png` | 180x180 | iOS home screen |
| `pwa-192x192.png`, `pwa-512x512.png` | 192, 512 | PWA manifest icons |
| `android-chrome-192x192.png`, `android-chrome-512x512.png` | 192, 512 | Android home screen |

Tips for the source image:

- **SVG** gives the cleanest result because every variant is rasterized at its target size.
- **PNG** should be square and at least **512&times;512** to avoid upscaling artifacts. Non-square images are letterboxed onto a transparent canvas.
- Max upload size: **5 MB**.

Generated files are written to `./data/favicons/` inside the container (the same volume that already holds your `config.yml`), so no extra Docker mount is needed. The server serves these files at `/favicons/<name>`; if none has been uploaded yet, it falls back to the legacy `/app/public/favicons/` mount described below.

A cache-busting `?v=<timestamp>` query is automatically appended to all favicon links in the HTML head and the web manifest, so browsers pick up the new icons after a save.

Use the **Reset to default** button in the same section to delete the uploaded favicons and revert to the bundled / mounted defaults.

### Logo creation

If you prefer to generate the favicons yourself (instead of using `/admin`), create an SVG or PNG icon (at the highest possible resolution) and use [Favicon Generator](https://realfavicongenerator.net/) to create a favicon package.

Once generated, download the ZIP and use the `android-*` icons for `pwa-*`:
* `android-chrome-192x192.png` → `pwa-192x192.png`
* `android-chrome-512x512.png` → `pwa-512x512.png`
* `apple-touch-icon.png`
* `favicon.ico`

### Mount the favicons volume

Add the volume to your `docker-compose.yml`:

```yaml
services:
  mafl:
    image: ghcr.io/r0gger/maflplus
    restart: unless-stopped
    ports:
      - '3000:3000'
    volumes:
      - ./mafl/:/app/data/
      - ./mafl/favicons:/app/public/favicons
```

File structure:

```text
./mafl/favicons/
├── apple-touch-icon.png
├── favicon.ico
├── pwa-192x192.png
└── pwa-512x512.png
```
