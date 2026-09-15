# Modules

MAFL+ includes several built-in service modules that can be added to your dashboard via `config.yml`. Each module is configured using `type` and optional `options`.

## Table of Contents

* [Overview](#overview)
* [Time](#time)
* [Datetime Weather](#datetime-weather)
* [OpenWeatherMap](#openweathermap)
* [IP API](#ip-api)
* [Greeting](#greeting)
* [Custom HTML](#custom-html)
* [TomTom](#tomtom)
  * [Getting a TomTom API Key](#getting-a-tomtom-api-key)
  * [TomTom ETA](#tomtom-eta)
  * [TomTom ETA Map](#tomtom-eta-map)
  * [TomTom Traffic Map](#tomtom-traffic-map)
* [Web Radio](#web-radio)
* [Uptime Kuma](#uptime-kuma)
* [Grid Span](#grid-span)
* [Grid Stack](#grid-stack)
* [Date Formats](#date-formats)

---

## Overview

| Module | Type | Description |
|--------|------|-------------|
| [Time](#time) | `time` | Live clock with date for any IANA timezone |
| [Datetime Weather](#datetime-weather) | `datetime-weather` | Combined clock and weather widget (OpenWeatherMap) |
| [OpenWeatherMap](#openweathermap) | `openweathermap` | Current weather for a given location |
| [IP API](#ip-api) | `ip-api` | Public IP address information with country flag |
| [Greeting](#greeting) | `greeting` | Custom greeting message with optional subtitle |
| [Custom HTML](#custom-html) | `custom-html` | Render arbitrary HTML content (including scripts) |
| [TomTom ETA](#tomtom-eta) | `tomtom-eta` | Estimated time of arrival for a route using TomTom |
| [TomTom ETA Map](#tomtom-eta-map) | `tomtom-eta-map` | Route map with traffic flow and incidents using TomTom |
| [TomTom Traffic Map](#tomtom-traffic-map) | `tomtom-traffic-map` | Traffic map centered on a location without route |
| [Web Radio](#web-radio) | `web-radio` | Internet radio station with on-site streaming via Radio Browser |
| [Uptime Kuma](#uptime-kuma) | `uptime-kuma` | Status, uptime, ping and heartbeat history from an Uptime Kuma instance |

All modules support common service properties like `span`, `icon` and `tags`. See [Configuration](configuration.md#service-item-properties) for the full list.

---

## Time

Displays a live clock with the current time and date for a specific timezone.

> **Backward compatibility:** `type: timezone` is accepted as an alias for `type: time`.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `timezone` | `string` | *required* | IANA timezone identifier (e.g. `Europe/Amsterdam`, `America/New_York`) |
| `locationName` | `string` | value of `timezone` | Display name shown in the widget |
| `country` | `string` | — | Two-letter country code for a flag icon (e.g. `nl`, `us`). If omitted, a clock icon is shown. |
| `timeFormat` | `string` | `24h` | Time format: `24h` or `12h` |
| `dateFormat` | `string` | `medium` | Date format (see [Date Formats](#date-formats)) |

### Examples

#### Basic usage

```yaml
services:
  - type: time
    options:
      timezone: Europe/Amsterdam
```

#### With flag icon and EU date format

```yaml
services:
  - type: time
    options:
      timezone: Europe/Amsterdam
      locationName: Amsterdam
      country: nl
      dateFormat: eu
      timeFormat: 24h
```

#### Multiple time widgets

```yaml
services:
  - type: time
    options:
      timezone: Europe/Amsterdam
      country: nl
  - type: time
    options:
      timezone: America/New_York
      country: us
      timeFormat: 12h
  - type: time
    options:
      timezone: Asia/Tokyo
      country: jp
```

---

## Datetime Weather

Combines a live clock with weather data from [OpenWeatherMap](https://openweathermap.org/). Requires an API key.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `lat` | `number` | *required* | Latitude of the location |
| `lon` | `number` | *required* | Longitude of the location |
| `timezone` | `string` | *required* | IANA timezone identifier |
| `units` | `string` | `metric` | Temperature units: `metric`, `imperial`, or `standard` |
| `timeFormat` | `string` | `24h` | Time format: `24h` or `12h` |
| `dateFormat` | `string` | `medium` | Date format (see [Date Formats](#date-formats)) |

### Secrets

| Secret | Type | Description |
|--------|------|-------------|
| `apiKey` | `string` | OpenWeatherMap API key ([get one here](https://home.openweathermap.org/api_keys)) |

### Examples

#### Basic usage

```yaml
services:
  - type: datetime-weather
    options:
      lat: 52.370216
      lon: 4.895168
      timezone: Europe/Amsterdam
    secrets:
      apiKey: your-api-key
```

#### With EU date format and metric units

```yaml
services:
  - type: datetime-weather
    options:
      lat: 52.370216
      lon: 4.895168
      timezone: Europe/Amsterdam
      units: metric
      dateFormat: eu
      timeFormat: 24h
    secrets:
      apiKey: your-api-key
```

---

## OpenWeatherMap

Displays the current weather for a given location using [OpenWeatherMap](https://openweathermap.org/). Shows temperature and weather condition. Requires an API key.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `lat` | `number` | *required* | Latitude of the location |
| `lon` | `number` | *required* | Longitude of the location |
| `units` | `string` | `metric` | Temperature units: `metric` (°C), `imperial` (°F), or `standard` (K) |

### Secrets

| Secret | Type | Description |
|--------|------|-------------|
| `apiKey` | `string` | OpenWeatherMap API key ([get one here](https://home.openweathermap.org/api_keys)) |

### Examples

#### Basic usage

```yaml
services:
  - type: openweathermap
    options:
      lat: 52.370216
      lon: 4.895168
      units: metric
    secrets:
      apiKey: your-api-key
```

#### Imperial units

```yaml
services:
  - type: openweathermap
    options:
      lat: 40.712776
      lon: -74.005974
      units: imperial
    secrets:
      apiKey: your-api-key
```

---

## IP API

Shows information about your public IP address, including a country flag icon based on your location.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `locationName` | `string` | — | Custom location name to display. When omitted, the location is auto-detected from the IP address. |
| `flagIcon` | `boolean` | `true` | Show the country flag icon. When `false`, the configured icon is used instead. |

### Examples

#### Basic usage

```yaml
services:
  - type: ip-api
```

#### With custom location name

```yaml
services:
  - type: ip-api
    options:
      locationName: Home Office
```

#### With custom icon instead of flag

```yaml
services:
  - type: ip-api
    options:
      flagIcon: false
    icon:
      name: oui:token-ip
```

---

## Greeting

Displays a custom greeting message on your dashboard.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `text` | `string` | *required* | Main greeting text |
| `subtitle` | `string` | — | Secondary text shown below the greeting |

### Examples

#### Basic usage

```yaml
services:
  - type: greeting
    options:
      text: Hello R0GGER!
      subtitle: Welcome to your dashboard!
```

#### With custom icon

```yaml
services:
  - type: greeting
    icon:
      name: mdi:home
    options:
      text: Welcome Home
      subtitle: Have a great day
```

---

## Custom HTML

Renders custom HTML content inside a service card. Useful for embedding widgets, links, analytics snippets or tracking pixels.

`<script>` tags are fully supported and will execute correctly.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `html` | `string` | *required* | HTML content to render (including `<script>` tags) |
| `hidden` | `boolean` | `false` | When `true`, the card is invisible (HTML is still rendered) |

### Examples

#### Visible card with custom content

```yaml
services:
  - type: custom-html
    title: Links
    options:
      html: '<a href="https://example.com" style="color:white;">Visit Example</a>'
```

#### Hidden (e.g. for tracking pixels or analytics)

```yaml
services:
  - type: custom-html
    options:
      hidden: true
      html: '<img src="https://analytics.example.com/pixel.gif" />'
```

#### Embedded script

```yaml
services:
  - type: custom-html
    options:
      hidden: true
      html: '<script src="https://example.com/widget.js"></script>'
```

---

## TomTom

MAFL+ integrates with the [TomTom](https://www.tomtom.com/) platform to provide real-time traffic information, route calculations and interactive maps on your dashboard. Three TomTom modules are available:

| Module | Type | Description |
|--------|------|-------------|
| [TomTom ETA](#tomtom-eta) | `tomtom-eta` | Estimated arrival time, travel duration, traffic delay and distance for a route |
| [TomTom ETA Map](#tomtom-eta-map) | `tomtom-eta-map` | Interactive map showing a calculated route with traffic flow and incidents |
| [TomTom Traffic Map](#tomtom-traffic-map) | `tomtom-traffic-map` | Interactive traffic map centered on a city, region or area (no route) |

All three modules require a **TomTom API key** (see below). The same key works for all modules.

**Key features across all TomTom modules:**
- Locations can be specified as **coordinates** (latitude/longitude) or as an **address** — the server geocodes addresses automatically via the TomTom Search API
- If both coordinates and an address are provided, coordinates take priority
- Route calculations and geocoding are performed **server-side** (privacy-friendly)
- API responses are cached to reduce the number of requests (geocoding: 24 hours, routing: 2 minutes)
- Map modules support three map styles: `standard`, `dark` and `satellite`

> **Privacy note:** The ETA module (without map) performs all requests server-side. The map modules load map tiles directly from TomTom CDN in the browser — this is inherent to interactive maps.

### Getting a TomTom API Key

All TomTom modules require an API key. TomTom offers a free tier with 2,500 daily transactions — more than enough for a personal dashboard.

1. Go to the [TomTom Developer Portal](https://developer.tomtom.com/) and click **Register** (or sign in if you already have an account)
2. After signing in, go to the [Dashboard](https://developer.tomtom.com/user/me/apps)
3. Click **+ Add new Key** (or use the default key that was created with your account)
4. Give your key a name (e.g. `MAFL+ Dashboard`)
5. Make sure the following products are enabled for the key:
   - **Map Display API** — required for map tiles (ETA Map and Traffic Map)
   - **Routing API** — required for route calculations (ETA and ETA Map)
   - **Traffic API** — required for traffic flow and incidents (ETA Map and Traffic Map)
   - **Search API** — required for address geocoding (when using `address` instead of coordinates)
6. Click **Create Key** and copy the API key
7. Paste the key in the `secrets.apiKey` field of your TomTom module in `config.yml`

> **Tip:** You can use the same API key for all TomTom modules on your dashboard.

---

### TomTom ETA

Displays the estimated time of arrival, travel time, traffic delay and distance for a configured route. The widget shows a compact card with:
- The route name and arrival time (e.g. "Amsterdam - Eindhoven: 14:32")
- Travel duration, traffic delay and distance (e.g. "1h 23min · +12 min delay · 125 km")
- An icon that matches the travel mode (car, truck, bicycle or pedestrian)

Route data is fetched from the [TomTom Routing API](https://developer.tomtom.com/routing-api/documentation/tomtom-maps/calculate-route) with live traffic enabled.

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `originLat` | `number` | — | Latitude of the origin |
| `originLon` | `number` | — | Longitude of the origin |
| `originAddress` | `string` | — | Origin address (geocoded automatically) |
| `destLat` | `number` | — | Latitude of the destination |
| `destLon` | `number` | — | Longitude of the destination |
| `destAddress` | `string` | — | Destination address (geocoded automatically) |
| `routeName` | `string` | auto-generated | Display name for the route |
| `travelMode` | `string` | `car` | Travel mode: `car`, `truck`, `bicycle`, or `pedestrian` |
| `timeFormat` | `string` | `24h` | Time format: `24h` or `12h` |

#### Secrets

| Secret | Type | Description |
|--------|------|-------------|
| `apiKey` | `string` | TomTom API key ([how to get one](#getting-a-tomtom-api-key)) |

#### Examples

##### With coordinates

```yaml
services:
  - type: tomtom-eta
    options:
      originLat: 52.370216
      originLon: 4.895168
      destLat: 51.441643
      destLon: 5.469722
      routeName: "Amsterdam - Eindhoven"
    secrets:
      apiKey: your-tomtom-api-key
```

##### With addresses

```yaml
services:
  - type: tomtom-eta
    options:
      originAddress: "Amsterdam Centraal"
      destAddress: "Eindhoven Centraal"
      routeName: "Amsterdam - Eindhoven"
      travelMode: car
    secrets:
      apiKey: your-tomtom-api-key
```

##### Home-to-work commute

```yaml
services:
  - type: tomtom-eta
    options:
      originAddress: "Kalverstraat 1, Amsterdam"
      destAddress: "Strijp-S, Eindhoven"
      routeName: "Home - Work"
      travelMode: car
    secrets:
      apiKey: your-tomtom-api-key
```

##### Bicycle route with 12h time format

```yaml
services:
  - type: tomtom-eta
    options:
      originAddress: "Central Park, New York"
      destAddress: "Brooklyn Bridge, New York"
      routeName: "Park to Bridge"
      travelMode: bicycle
      timeFormat: 12h
    secrets:
      apiKey: your-tomtom-api-key
```

---

### TomTom ETA Map

Displays an interactive map with a calculated route, real-time traffic flow and traffic incidents. Combines the ETA information from [TomTom ETA](#tomtom-eta) with a visual map rendered using [Leaflet](https://leafletjs.com/) and TomTom raster tiles.

The widget shows:
- **Above the map:** route name, arrival time, travel duration, traffic delay and distance
- **On the map:** the route as a colored polyline, with green (start) and red (destination) markers
- **Traffic flow overlay:** color-coded road segments (green = free flow, orange = slow, red = congestion)
- **Traffic incidents overlay:** jams, accidents, road works, lane closures

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `originLat` | `number` | — | Latitude of the origin |
| `originLon` | `number` | — | Longitude of the origin |
| `originAddress` | `string` | — | Origin address (geocoded automatically) |
| `destLat` | `number` | — | Latitude of the destination |
| `destLon` | `number` | — | Longitude of the destination |
| `destAddress` | `string` | — | Destination address (geocoded automatically) |
| `routeName` | `string` | auto-generated | Display name for the route |
| `travelMode` | `string` | `car` | Travel mode: `car`, `truck`, `bicycle`, or `pedestrian` |
| `timeFormat` | `string` | `24h` | Time format: `24h` or `12h` |
| `showTrafficFlow` | `boolean` | `true` | Show traffic flow color overlay on the map |
| `showIncidents` | `boolean` | `true` | Show traffic incident markers on the map |
| `mapStyle` | `string` | `standard` | Map style: `standard`, `dark`, or `satellite` |
| `mapHeight` | `number` | `300` | Map height in pixels |

#### Secrets

| Secret | Type | Description |
|--------|------|-------------|
| `apiKey` | `string` | TomTom API key ([how to get one](#getting-a-tomtom-api-key)) |

#### Examples

##### Route map with traffic

```yaml
services:
  - type: tomtom-eta-map
    span: 3
    options:
      originAddress: "Amsterdam Centraal"
      destAddress: "Rotterdam Centraal"
      routeName: "Amsterdam - Rotterdam"
      showTrafficFlow: true
      showIncidents: true
      mapHeight: 350
    secrets:
      apiKey: your-tomtom-api-key
```

##### Satellite map with coordinates

```yaml
services:
  - type: tomtom-eta-map
    span: 2
    options:
      originLat: 52.370216
      originLon: 4.895168
      destLat: 51.441643
      destLon: 5.469722
      routeName: "Amsterdam - Eindhoven"
      mapStyle: satellite
      mapHeight: 400
    secrets:
      apiKey: your-tomtom-api-key
```

##### Dark map, traffic flow only

```yaml
services:
  - type: tomtom-eta-map
    span: 2
    options:
      originAddress: "Utrecht Centraal"
      destAddress: "Den Haag Centraal"
      routeName: "Utrecht - Den Haag"
      mapStyle: dark
      showIncidents: false
    secrets:
      apiKey: your-tomtom-api-key
```

---

### TomTom Traffic Map

Displays an interactive traffic map centered on a city, region or area — without calculating a route. Ideal for monitoring traffic conditions around your home, workplace or any location of interest.

The map shows:
- **Traffic flow:** color-coded road segments showing current speeds (green = free flow, orange = slow, red = congestion)
- **Traffic incidents:** jams, accidents, road works, closures and other events

Use the `zoom` level to control the area visible on the map: lower values show a wider area (country or region), higher values zoom in to street level.

| Zoom | Area |
|------|------|
| `6` | Country |
| `8` | Region / province |
| `10` | City and surroundings |
| `12` | City center (default) |
| `14` | Neighborhood |
| `16`–`18` | Street level |

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `lat` | `number` | — | Latitude of the map center |
| `lon` | `number` | — | Longitude of the map center |
| `address` | `string` | — | Address or place name (geocoded automatically) |
| `zoom` | `number` | `12` | Map zoom level (1 = world, 18 = street level) |
| `showTrafficFlow` | `boolean` | `true` | Show traffic flow color overlay |
| `showIncidents` | `boolean` | `true` | Show traffic incident markers |
| `mapStyle` | `string` | `standard` | Map style: `standard`, `dark`, or `satellite` |
| `mapHeight` | `number` | `300` | Map height in pixels |

#### Secrets

| Secret | Type | Description |
|--------|------|-------------|
| `apiKey` | `string` | TomTom API key ([how to get one](#getting-a-tomtom-api-key)) |

#### Examples

##### Traffic around a city

```yaml
services:
  - type: tomtom-traffic-map
    span: 3
    options:
      address: "Amsterdam"
      zoom: 12
      showTrafficFlow: true
      showIncidents: true
    secrets:
      apiKey: your-tomtom-api-key
```

##### Country overview with satellite view

```yaml
services:
  - type: tomtom-traffic-map
    span: 3
    options:
      address: "Nederland"
      zoom: 8
      mapStyle: satellite
      mapHeight: 400
    secrets:
      apiKey: your-tomtom-api-key
```

##### Dark map centered on coordinates

```yaml
services:
  - type: tomtom-traffic-map
    span: 2
    options:
      lat: 51.9225
      lon: 4.4792
      zoom: 13
      mapStyle: dark
    secrets:
      apiKey: your-tomtom-api-key
```

##### Neighborhood view, incidents only

```yaml
services:
  - type: tomtom-traffic-map
    span: 2
    options:
      address: "Zuidas, Amsterdam"
      zoom: 15
      showTrafficFlow: false
      showIncidents: true
      mapHeight: 250
    secrets:
      apiKey: your-tomtom-api-key
```

---

## Web Radio

Stream internet radio stations directly in your browser using the free [Radio Browser API](https://api.radio-browser.info/). Each station is a **separate grid item** — add multiple stations in one group, each with the station logo as its icon.

### Playback

- **Grid card** — click a station to start or pause playback
- **Mini player** — a fixed bar at the bottom of the page shows the current station with play/pause, volume and stop
- **Search bar** — enable global [`searchWebradio`](configuration.md#search) to search live stations from the homepage (independent of grid widgets). Saved `web-radio` items also appear under **Bookmarks** and start playback instead of opening a link

No API key required. Streams use HTML5 audio with `url_resolved` from Radio Browser (redirects and playlists resolved server-side).

### Admin

In the Config Builder, add **Media → Web Radio** to a grid group. Use the built-in station search to find a station by name — **title**, **icon URL** (station logo) and **station UUID** are filled in automatically. You can also paste a UUID manually.

Enable **Include Webradio stations in search results** under Global Settings → Search Provider to add live Radio Browser search to the search bar.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `stationUuid` | `string` | *required* | Radio Browser station UUID |
| `countryCode` | `string` | `NL` | Country filter when searching stations in the admin Config Builder |

### Icon

Set the station logo with `icon.url` (recommended). If omitted, the API favicon is used at runtime; if that is also missing, a default radio icon is shown.

```yaml
icon:
  url: https://www.radio538.nl/favicon.ico
```

### Examples

#### Multiple stations in one group

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

      - type: web-radio
        title: Sky Radio
        options:
          stationUuid: your-station-uuid-here
```

#### Inside a tab

```yaml
tabs:
  - name: Home
    icon: mdi:home
    services:
      Radio:
        display: grid
        items:
          - type: web-radio
            title: Radio 538
            options:
              stationUuid: your-station-uuid-here
```

### Notes

- Only one stream plays at a time; selecting another station switches playback
- Stream URLs are refreshed from Radio Browser when playback starts
- Some community-listed streams may be offline — try another station or search again
- Search bar Webradio section requires `searchWebradio: true` in config (see [Search](configuration.md#search)); filter country via `searchWebradioCountryCode`
- See also [Configuration — Web Radio](configuration.md#web-radio)

---

## Uptime Kuma

Show the state of your services from an existing [Uptime Kuma](https://github.com/louislam/uptime-kuma) instance. The widget lists one or more monitors with their current status, uptime percentage, response time, optional certificate expiry and a row of heartbeat bars.

All data is fetched server-side, so the Kuma URL may be an internal LAN address that your browser cannot reach. No API key is needed.

> **Requirement:** Uptime Kuma only publishes monitor data for monitors that belong to a **published status page**. Add the monitors to a status page in Kuma and publish it, otherwise Kuma reports them as `N/A`.

> **Tip:** To put a Kuma status dot on your regular bookmark tiles instead of (or in addition to) this widget, use [`status.monitor`](configuration.md#status-from-uptime-kuma).

### Data sources

The module picks its source automatically:

| `slug` set? | Source | What you get |
|---|---|---|
| Yes | Status page API | All public monitors in two cached requests, including monitor names, current status, response time, 24h uptime and heartbeat history |
| No | Badge API | Only the monitors listed in `monitors`, with a free choice of uptime window, but no heartbeat history |

Using a `slug` is recommended: it is both richer and cheaper, since one request covers every monitor.

### Admin

In the Config Builder, add **Monitoring → Uptime Kuma** to a grid group. The instance URL and status page slug default to the global [Uptime Kuma settings](configuration.md#uptime-kuma), so per widget you usually only fill in the monitor list.

The **Monitors** field is a comma separated list. Use a plain `id`, or `id:Label` to override the name Kuma reports:

```
1, 4:Mailserver, 9
```

Leave the field empty to show every public monitor of the status page.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `url` | `string` | value of global [`uptimeKuma.url`](configuration.md#uptime-kuma) | Base URL of the Uptime Kuma instance |
| `slug` | `string` | value of global [`uptimeKuma.slug`](configuration.md#uptime-kuma) | Slug of a published status page. Enables heartbeat history. |
| `monitors` | `array` | all public monitors | Monitor IDs to show. In status page mode this filters the page; without a `slug` it is required. Accepts plain IDs or `{ id, name }` objects. |
| `uptimeDuration` | `string` | `24h` | Uptime window, e.g. `24h`, `168h` (7d) or `720h` (30d). Badge mode only; the status page API always reports 24h. |
| `heartbeatCount` | `number` | `30` | Number of heartbeat bars to show (Kuma keeps the last 100) |
| `heartbeatWidth` | `number` \| `string` | — | Width of one heartbeat bar, e.g. `4` or `4px`. Without it the bars stretch to fill the row, so their thickness follows from `heartbeatCount`. With it the width is fixed and the leftover space is spread over the gaps, keeping the row flush with the card. |
| `showHeartbeat` | `boolean` | `true` | Show the heartbeat bars |
| `showUptime` | `boolean` | `true` | Show the uptime percentage |
| `showPing` | `boolean` | `true` | Show the response time |
| `showCertExp` | `boolean` | `false` | Show the remaining days of the TLS certificate |

### Secrets

| Secret | Type | Description |
|--------|------|-------------|
| `url` | `string` | Same as `options.url`, but stripped from everything the browser receives. Use this if the instance URL should not be exposed. |

### Icon

Works like any other service item: set `icon.name`, `icon.url` or `icon.favicon`. Without an icon a default `mdi:heart-pulse` is used; set [`icon.hidden`](configuration.md#no-icon) to drop the icon entirely.

### Examples

#### All monitors of a status page

```yaml
uptimeKuma:
  url: http://192.168.1.10:3001
  slug: default

services:
  Monitoring:
    display: grid
    items:
      - type: uptime-kuma
        span: 2
        title: Home Lab
        icon:
          favicon: uptime.kuma.pet
          wrap: true
        options:
          showCertExp: true
          heartbeatCount: 40
```

#### Selected monitors, compact

```yaml
services:
  Monitoring:
    display: grid
    items:
      - type: uptime-kuma
        title: Critical
        options:
          url: http://192.168.1.10:3001
          slug: default
          monitors:
            - 1
            - 4
          showHeartbeat: false
```

#### Badge mode with a 30-day uptime window

Without a `slug` the module reads the badge API, which allows any uptime window but has no heartbeat history.

```yaml
services:
  Monitoring:
    display: grid
    items:
      - type: uptime-kuma
        title: Public services
        options:
          url: http://192.168.1.10:3001
          uptimeDuration: 720h
          showCertExp: true
          monitors:
            - id: 1
              name: example.com
            - id: 7
              name: mail.example.com
```

#### Private instance URL

```yaml
services:
  Monitoring:
    display: grid
    items:
      - type: uptime-kuma
        title: Servers
        options:
          slug: default
        secrets:
          url: http://192.168.1.10:3001
```

### Status colours

| Monitor state | Dot and heartbeat bar |
|---|---|
| Up | Green |
| Down | Red |
| Pending | Amber |
| Maintenance | Blue |
| Unknown or not published | Grey |

The card description summarises the group, for example `Degraded · 3/4 up`. Maintenance takes precedence over everything else, matching Kuma's own status page.

### Notes

- Uptime Kuma caches badges for 5 minutes and status page heartbeats for 1 minute, so polling faster than the default 60 seconds gains nothing. MAFL+ caches upstream responses as well.
- Certificate expiry always comes from the badge API, because the status page API does not expose it. It therefore costs one extra request per monitor; leave `showCertExp` off if you do not need it.
- Configuration problems and an unreachable instance are shown on the card itself and logged server-side, rather than leaving the card empty.
- The widget renders a list below the card header, so it belongs in a group with `display: grid`. In `display: list` mode only the title and status dot are shown.
- See also [Configuration — Uptime Kuma](configuration.md#uptime-kuma)

---

## Grid Span

By default every module occupies a single column in the grid. With the `span` property you can make a module stretch across multiple columns, giving wider widgets like clocks or weather more room to breathe.

```yaml
services:
  Widgets:
    display: grid
    items:
      - type: datetime-weather
        span: 2
        options:
          lat: 52.370216
          lon: 4.895168
          timezone: Europe/Amsterdam
        secrets:
          apiKey: your-api-key
      - type: time
        span: 1
        options:
          timezone: America/New_York
          country: us
```

| Value | Behaviour |
|-------|-----------|
| `1` | Default — occupies one grid column |
| `2` | Spans two columns — useful for datetime-weather, greeting or custom-html widgets that benefit from extra width |
| `3` | Spans three columns — useful for wide custom-html embeds or a prominent greeting |

The maximum useful value depends on how many columns your [layout](configuration.md#layout) defines at the current breakpoint. A span larger than the column count will simply fill the entire row.

`span` is not limited to modules — it works on any service item (bookmarks, links, etc.).

---

## Grid Stack

With `stack` you can place multiple modules vertically (on top of each other) inside a single grid cell. This is useful when you want to combine smaller widgets in one column while a larger widget spans the remaining columns.

A stack item has a `stack` array containing the child items and an optional `span` to control column width.

### Example: ETA + clock next to a route map

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
              apiKey: your-tomtom-api-key
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
          apiKey: your-tomtom-api-key
```

This places the ETA text widget and the clock stacked vertically in one column, with the route map spanning the other two columns.

### Example: stack spanning two columns

```yaml
services:
  Widgets:
    display: grid
    items:
      - stack:
          - type: greeting
            options:
              text: Welcome Home
              subtitle: Have a great day
          - type: ip-api
        span: 2
      - type: time
        options:
          timezone: Europe/Amsterdam
          country: nl
```

Any service item can be placed inside a `stack` — modules, bookmarks, links, etc. The children are rendered top-to-bottom with the same gap as regular grid items.

`stack` only works in groups with `display: grid`. It has no effect in `display: list` mode.

---

## Date Formats

The `time` and `datetime-weather` modules support a `dateFormat` option. The date language is determined by the `lang` setting in your `config.yml`.

| Format | Example (EN) | Example (NL) |
|--------|--------------|--------------|
| `short` | 5/16/2026 | 16-5-2026 |
| `medium` | May 16, 2026 | 16 mei 2026 |
| `long` | Saturday, May 16, 2026 | zaterdag 16 mei 2026 |
| `eu` | Sat 16 May 2026 | za 16 mei 2026 |
| `compact` | Sat 16 May | za 16 mei |
| `short-eu` | 16-05-2026 | 16-05-2026 |
| `iso` | 2026-05-16 | 2026-05-16 |
