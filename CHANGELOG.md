# Changelog


## Favicon API defaults to faviconapi.com

### 🚀 Enhancements

- **admin:** The **Favicon API** field in Global Settings is now pre-filled with `https://faviconapi.com`. You can still replace it with any other endpoint. A link to [faviconapi.com/#tools](https://faviconapi.com/#tools) lets you build a Custom URL with your preferred provider, fallbacks and size
- **config:** The runtime default (used when `faviconApi` is omitted from `config.yml`) is now `https://faviconapi.com` as well

### Compatibility

- **config:** Existing configs that already set `faviconApi` are unchanged. Only configs without the key pick up the new default

### Changed files

| File | Change |
|------|--------|
| `src/components/admin/GlobalSettings.vue` | Pre-filled the field, updated the placeholder, and added the Custom URL help link |
| `src/composables/useConfigBuilder.ts` | Default builder state is now `https://faviconapi.com` |
| `src/server/utils/config.ts` | Runtime default matches the admin field |
| `config-builder/index.html` | Same default, placeholder and Custom URL help link |
| `docs/favicons.md` | Documented the new default and the Custom URL tools page |

---

## Finer heartbeat bars in the Uptime Kuma module

### 🚀 Enhancements

- **client:** The heartbeat bars are less chunky by default — 12px tall instead of 16px, a 2px gap instead of 1px, and a 1px corner radius instead of 2px, so they read as a row of bars rather than a row of blocks
- **client:** New `heartbeatWidth` option to set the bar width directly. Left empty the bars keep stretching across the card, in which case their thickness follows from `heartbeatCount`. Given a width they stay exactly that wide and the leftover space is distributed over the gaps through `justify-between`, so the row stays flush with the card at any `span` instead of ending ragged
- **admin:** Added the matching **Bar width** field to the Config Builder, below the bar count

### Compatibility

- **config:** `heartbeatWidth` is optional and defaults to the existing stretch behaviour. The restyled height, gap and radius do change the look of existing dashboards, but only within the space the bars already occupied

### Changed files

| File | Change |
|------|--------|
| `src/components/service/UptimeKuma.vue` | Restyled the bar row and added the `heartbeatWidth` computed plus `beatStyle`; bars switch between `flex-1` and `flex-none` depending on whether a width is set |
| `src/types/services.d.ts` | Added `heartbeatWidth` to the module options |
| `src/composables/useConfigBuilder.ts` | Added `ukHeartbeatWidth` with import and export, emitting a plain number for bare digits and a string for CSS lengths |
| `src/components/admin/ItemFields.vue` | Added the **Bar width** field and its explanation |
| `docs/modules.md` | Documented `heartbeatWidth` in the options table |

---

## Items without an icon

### 🚀 Enhancements

- **config:** New `icon.hidden` property that renders an item without an icon. Omitting `icon` already left the icon empty, but the fixed 4rem icon box (5×5 in list display) stayed reserved, so the title kept an indent it did not need. With `hidden` the whole icon area is dropped and the title starts at the edge of the card
- **config:** `icon.hidden` also suppresses the fallback icon of modules that have one, such as `uptime-kuma` (`mdi:heart-pulse`) and `web-radio` (`mdi:radio`), which could otherwise not be turned off at all
- **admin:** Added **none** as a fourth **Icon Type** in the Config Builder, next to favicon, url and name

### Compatibility

- **config:** Purely additive and off by default. Items without an `icon` key keep their reserved icon space, so no existing dashboard changes layout — only explicitly setting `hidden: true` does

### Changed files

| File | Change |
|------|--------|
| `src/components/service/base/Index.vue` | Icon area is now wrapped in `v-if="!icon?.hidden"`, which drops both the icon and the space it reserves. Because the `#icon` slot lives inside that wrapper, a module's fallback icon is suppressed along with it |
| `src/components/ListItem.vue` | Same guard on the 5×5 icon box used by list display |
| `src/types/services.d.ts` | Added `hidden` to `ServiceIcon` |
| `src/server/validations/service.ts` | Added `hidden: z.boolean().optional()` to `iconSchema` |
| `src/composables/useConfigBuilder.ts` | Added `none` to `IconType`, importing `icon.hidden` and exporting it again |
| `src/components/admin/ItemFields.vue` | Added the **none** radio option and its explanation, replacing the icon source fields when selected |
| `docs/configuration.md` | Documented `icon.hidden` in the icon properties table plus a "No icon" section explaining the difference with omitting `icon` |

---

## Uptime Kuma integration — monitoring widget and status dots on bookmarks

### 🚀 Enhancements

- **client:** New `uptime-kuma` module that shows the monitors of an existing [Uptime Kuma](https://github.com/louislam/uptime-kuma) instance as a native MAFL+ card — one row per monitor with a coloured status dot, uptime percentage, response time, optional certificate expiry, and a row of heartbeat bars for the recent history. The card description summarises the group (`Degraded · 3/4 up`), with maintenance taking precedence over everything else the way Kuma's own status page does
- **client:** Any regular bookmark can now take its [status indicator](docs/configuration.md#status-from-uptime-kuma) from Kuma instead of a TCP ping by setting `status.monitor` to a monitor ID or name. That is considerably more accurate than a port probe, since Kuma already accounts for HTTP status codes, keyword checks, certificates and retries. Up is green, down and pending are red, and maintenance stays grey so planned downtime does not look like an outage
- **config:** New global `uptimeKuma` block (`url` + `slug`) that serves both the module and the per-item status dots, so the instance only has to be configured once. Per module it can be overridden through `options.url` / `options.slug`, or through `secrets.url` when the instance URL should not reach the browser
- **server:** Two data sources, picked automatically. With a status page `slug` the module reads `/api/status-page/:slug` plus `/api/status-page/heartbeat/:slug`, which covers every monitor — names, status, response time, 24h uptime and 100 beats of history — in two cached requests. Without a slug it falls back to the badge API per monitor, which has no history but allows any uptime window (`uptimeDuration: 720h`)
- **server:** Badge values are read from the `<title>` of the generated SVG. By requesting badges with an empty `label` and `suffix` (and forced `upLabel`/`downLabel`/`pendingLabel`/`maintenanceLabel`), Kuma's own `filterAndJoin` reduces that title to a single bare, language-independent value such as `up` or `99.53`. Verified against the real `badge-maker` library across all five badge styles, including the `N/A` response for monitors that are not on a published status page
- **server:** Upstream responses are cached with `defineCachedFunction` (status page config 5 min, heartbeats 30 s, badges 60 s) and shared between the module and the status dots, so a dashboard with dozens of Kuma-backed tiles still makes one upstream request per interval instead of one per tile
- **admin:** The Config Builder covers the integration end to end — a **Monitoring → Uptime Kuma** module button, a field block for every option, the instance URL and slug under **Global Settings**, and an **Uptime Kuma monitor** field on bookmarks that appears once **Uptime monitoring** is checked
- **admin:** The `monitors[]` array is edited as a comma separated list of `id` or `id:Label` entries, so a custom monitor label survives a round trip through the flat field model instead of being dropped on import

### Compatibility

- **config:** Purely additive — `uptimeKuma` and `status.monitor` are both optional. Items without `status.monitor` keep using the existing TCP ping, so both kinds can be mixed on one dashboard
- **errors:** Misconfiguration and an unreachable instance are reported through the payload and rendered on the card ("No valid Uptime Kuma url configured", "… is unreachable") instead of as an HTTP error. `ServiceBase` shows its loading placeholder for as long as the fetch has no data, so a failing request would otherwise leave a permanent skeleton with no explanation
- **privacy:** `options.url` and `uptimeKuma.url` are part of the settings payload the frontend receives, matching how other module options behave. `secrets.url` is stripped from everything the browser sees, as with every other module's secrets
- **requirement:** Uptime Kuma only exposes data for monitors that belong to a **published status page** — this is a Kuma-side restriction that applies to both the status page API and the badge API
- **admin:** A widget without any options is kept on export as a bare `type: uptime-kuma`, since that is valid once the global `uptimeKuma` block is set — unlike other modules, which are dropped when their required option is missing. The builder writes the per-widget instance URL to `secrets.url` so it is not exposed to the browser

### Changed files

| File | Change |
|------|--------|
| `src/server/utils/uptimeKuma.ts` | New shared Uptime Kuma client — cached `fetchStatusPage` / `fetchHeartbeats` / badge fetchers, `parseBadgeValue` with a `<text>` fallback and a guard against badge-maker versions that keep the label in the title, status mapping helpers, and `getMonitorPing` which resolves a single monitor (by ID, or by case-insensitive name when a slug is set) into the `{ status, time }` shape the status indicator expects |
| `src/server/api/services/uptime-kuma.ts` | New endpoint — resolves the instance URL and slug from options, secrets and the global config, collects monitors from either the status page or the badge API, derives the overall status, and reports problems through the payload |
| `src/components/service/UptimeKuma.vue` | New display component — `ServiceBase` for the header plus a monitor list with status dots, metrics and heartbeat bars; only applies its default `mdi:heart-pulse` when no icon of any kind is configured, since `ServiceBaseIcon` prefers `name` over `url` and `favicon` |
| `src/server/utils/services.ts` | `getServiceWithDefaultData` now resolves the status indicator through a new `resolveStatus` helper, which routes `status.monitor` to Uptime Kuma and everything else to the existing `pingService` |
| `src/components/Item.vue` | Registered `uptime-kuma` → `ServiceUptimeKuma` |
| `src/types/services.d.ts` | Added `UptimeKumaService`, `UptimeKumaMonitor`, `UptimeKumaHeartbeat` and `UptimeKumaStatus`; added `monitor` to `ServiceStatus` |
| `src/types/config.d.ts` | Added `UptimeKumaConfig` and the optional `uptimeKuma` key on `Config` |
| `src/server/validations/config.ts` | Added `uptimeKumaSchema` (`url` + `slug`) to `configSchema` |
| `src/server/validations/service.ts` | Added `monitor: z.union([z.number(), z.string()])` to `statusSchema` |
| `src/composables/useConfigBuilder.ts` | Added `uptime-kuma` to `ServiceType`, the `uk*` item fields, `statusMonitor` on bookmarks, `uptimeKumaUrl` / `uptimeKumaSlug` on the builder state, import/export for all of them, and `parseMonitorList` / `formatMonitorList` for the `id:Label` notation |
| `src/components/admin/ItemFields.vue` | Added the Uptime Kuma field block and the conditional monitor field under the bookmark status checkbox |
| `src/components/admin/TabsEditor.vue` | Added the Monitoring category, the stack module entry and the `uptime-kuma` type label |
| `src/components/admin/GlobalSettings.vue` | Added the global Uptime Kuma URL and status page slug fields |
| `docs/modules.md` | Documented the module — data source comparison, admin usage, options, secrets, status colours, four config examples and caching notes |
| `docs/configuration.md` | Documented the global `uptimeKuma` block and the `status.monitor` property, including the indicator colour table and where both live in the Config Builder |

---

## Clear favicon cache per bookmark from the admin editor

### 🚀 Enhancements

- **admin:** Added a **Clear cache** button next to the **Domain** field of the **Icon Type → favicon** picker in the bookmark/item editor. Clicking it removes the cached favicon for that one domain so it is re-downloaded from the favicon API on the next load — handy when a site changed its favicon or a wrong/blank icon got cached. The button is disabled while a request is in flight or when no domain is filled in, and inline feedback reports whether a cached favicon was actually found and removed
- **server:** New `DELETE /api/admin/favicon-cache` endpoint (admin-session protected) takes a `domain` in the body, normalizes it to the same key the favicon proxy caches under (`https://example.com/foo` → `example.com`), and deletes the matching `<domain>.dat` + `<domain>.json` files from `./data/.favicon-cache`. Returns `{ ok, domain, removed }`; rejects missing or path-traversal domains with a 400

### Compatibility

- **data:** Only affects the on-disk favicon cache (`./data/.favicon-cache`), which is regenerated on demand by the existing `/api/favicon/[...domain]` proxy. No config/schema changes, and the favicon proxy's 7-day TTL behaviour is unchanged — this just lets an admin force an early refresh for a single domain

### Changed files

| File | Change |
|------|--------|
| `src/server/api/admin/favicon-cache.delete.ts` | New admin endpoint — `requireAdminSession`, reads `domain` from the body, normalizes it (strip protocol + path) the same way the favicon proxy does, validates against path traversal, and `unlinkSync`s the `.dat` / `.json` cache files in `./data/.favicon-cache`; returns `{ ok, domain, removed }` |
| `src/components/admin/ItemFields.vue` | Wrapped the favicon `Domain` row in a container and added a red **Clear cache** button (trash icon) plus inline status text; added `faviconCacheClearing` / `faviconCacheMessage` / `faviconCacheError` refs and a `clearFaviconCache()` handler that `$fetch`es the new `DELETE /api/admin/favicon-cache` endpoint and surfaces success/empty/error feedback |

---

## Greeting service — multiline HTML editor in admin

### 🚀 Enhancements

- **admin:** The **Text** and **Subtitle** fields of the **Greeting** service are no longer single-line plain text inputs — they're now full **multiline HTML editors** with a toolbar (bold, italic, underline, strikethrough, link / unlink, text color picker, manual `<br>` insert, clear formatting, and a source-view toggle). Each field stacks vertically (no longer side-by-side) so longer messages have room to breathe
- **admin:** Editor uses a native `contenteditable` div with `document.execCommand`, so there's **no new runtime dependency** — the toolbar buttons reflect the active formatting state (bold/italic/underline/strikethrough are highlighted when the caret sits inside that formatting), the color picker pre-fills from the current selection's `foreColor`, and the source-view toggle lets advanced users hand-edit the raw HTML in a monospace textarea
- **admin:** Enter inserts a `<br>` instead of a paragraph break so the height stays predictable, Shift+Enter keeps that behaviour, and pastes are sanitised to plain text (no foreign fonts/colors smuggled in from Word/Notion)
- **client:** `ServiceGreeting` now renders both `text` and `subtitle` via `v-html` so the inline formatting actually shows up on the dashboard — kept consistent with how `ServiceCustomHtml` already injects user-authored HTML
- **client:** A `:has()` selector on the parent `<h3>` / `<p>` removes the default `line-clamp-2` / `line-clamp-1` for the Greeting card only, so multi-line greetings with `<br>` aren't truncated; other services keep their existing truncation behaviour
- **client:** Anchor tags inside the greeting inherit the surrounding text color and pick up an underline so links blend with the site's chosen theme

### Compatibility

- **data:** The `options.text` / `options.subtitle` schema is unchanged — strings on disk, just allowed to contain HTML now. Existing plain-text greetings keep rendering identically (no HTML, no behaviour change), and the YAML output from the builder is unaffected
- **security:** Same trust model as the existing `custom-html` service — admin-authored content is rendered as-is. Acceptable for a self-hosted single-tenant dashboard, but worth noting since the previous `{{ }}` interpolation auto-escaped HTML

### Changed files

| File | Change |
|------|--------|
| `src/components/admin/HtmlEditor.vue` | New reusable component (auto-imported as `<AdminHtmlEditor>`) — `v-model`-compatible WYSIWYG editor with toolbar (bold / italic / underline / strikeThrough / createLink / unlink / foreColor / insert `<br>` / removeFormat / source toggle), `contenteditable` editing surface styled via the existing `admin-input` class, active-state tracking through `document.queryCommandState`, saved-selection restoration so toolbar clicks don't drop the caret, plain-text paste sanitisation, and a fallback `<textarea>` source view bound to the same `modelValue` |
| `src/components/admin/ItemFields.vue` | Replaced the two single-line `<input>`s for Greeting `Text` and `Subtitle` with stacked `<AdminHtmlEditor>` instances (`:min-height="72"` for Text, `56` for Subtitle); kept `placeholder` strings the same |
| `src/components/service/Greeting.vue` | Switched the `title` / `description` slots from `{{ ... }}` to `v-html` on a `.greeting-text` / `.greeting-subtitle` `<span>`; added an unscoped `<style>` block that targets `h3:has(> .greeting-text)` / `p:has(> .greeting-subtitle)` to disable the parent `-webkit-line-clamp` and let multi-line HTML render. Anchor tags inherit `color: inherit` and `text-decoration: underline` |

---

## Disable drag-to-move while an edit panel is open

### 🚀 Enhancements

- **admin / config-builder:** Items, stacks and groups can no longer be **dragged** while their edit panel (or any nested stack-child edit panel) is open — previously a stray drag on a row with an active editor would silently close the editor via `closeOpenEdits()` after the drop, throwing away unsaved field focus. The HTML5 `draggable` attribute is now flipped off for that exact row, so the drag never starts in the first place and the editor stays put. Move up / move down arrow buttons remain available since they are explicit, predictable clicks
- **admin / config-builder:** The drag handle (`☰`) on item, stack and group rows is hidden while that row's edit panel is open, making it visually clear that drag is unavailable for the currently-edited row. Locked-tab handling is unchanged — locked tabs still hide every drag handle regardless of edit state

### Changed files

| File | Change |
|------|--------|
| `src/components/admin/TabsEditor.vue` | Added two helpers next to `isEditing()`: `isItemBeingEdited(ti, gi, ii)` returns `true` when the item itself or any of its stack children is in `openEdits` (matches `${ti}-${gi}-${ii}` exactly or the `${ti}-${gi}-${ii}-` prefix); `isGroupBeingEdited(ti, gi)` returns `true` when any edit key starts with `${ti}-${gi}-`. The item-row `:draggable` is now `!tab.locked && !isItemBeingEdited(ti, gi, ii)`, the group-row `:draggable` is now `!tab.locked && !isGroupBeingEdited(ti, gi)`, and the three `v-if="!tab.locked"` drag handles (group header, stack header, regular-item header) gained the matching `&& !isItemBeingEdited(...)` / `&& !isGroupBeingEdited(...)` guard |

---

## Complete bundled default favicon set + Firefox cache busting

### 🐛 Bug Fixes

- **server:** Fixed `/favicons/favicon-16x16.png`, `/favicons/favicon-32x32.png` and the `android-chrome-*` PWA icons returning a JSON 404 after **Reset to default** in `/admin` — upstream MAFL only ships 4 of the 8 favicon variants (`favicon.ico`, `apple-touch-icon.png`, `pwa-192x192.png`, `pwa-512x512.png`), so the favicon middleware had nothing to fall back to once a runtime upload was removed. A new server-startup Nitro plugin now generates every missing PNG variant (plus a multi-resolution `favicon.ico` if needed) from the largest available master image (preferring `pwa-512x512.png`) into `./server/favicons-defaults/`
- **client / firefox:** Fixed the tab favicon staying blank in Firefox even after the bundled defaults were complete — the favicon plugin only appended `?v=<version>` when a *custom* upload was active, so for bundled defaults Firefox kept reusing its cached "no favicon" entry in `places.sqlite`. `getFaviconVersion()` now falls back to the mtime of `favicons-defaults/favicon.ico` (or `pwa-512x512.png`) when no custom meta exists, so the `<link>` URLs always change whenever the on-disk files change
- **server:** Added `Cache-Control: no-cache, must-revalidate` to `/manifest.webmanifest` — browsers were caching the manifest aggressively and kept referencing the previous icon `?v=` URLs after a regenerate, so the PWA icons did not update until a hard refresh

### 🚀 Enhancements

- **admin:** New **Regenerate defaults** button in the **App Favicon** status row (visible only when no custom upload is active) — forces a full rebuild of every bundled default variant from the master image on disk. Useful when files got corrupted, the startup hook couldn't write (read-only fs that later got unmounted), or after an upstream MAFL update changed the bundled master. Confirms first, surfaces a toast with the variant count + master filename (e.g. *"Regenerated 4 default favicons from pwa-512x512.png"*), and cache-busts the live preview grid via `refreshPreview(res.version)`
- **server:** Generation logic extracted to a single reusable `ensureBundledDefaults({ force })` in `src/server/utils/favicons.ts`. `force: false` (default) only fills in missing variants — used at server startup. `force: true` rewrites every variant except the chosen master itself (avoids a lossy roundtrip) — used by the admin button
- **server:** Existing files in `favicons-defaults/` are never overwritten by the startup hook, so user-mounted overrides on `/app/public/favicons` continue to take precedence. Runtime uploads in `./data/favicons/` still win at the middleware layer regardless of what lives in `favicons-defaults`
- **server:** The favicon middleware's existing `ETag` (built from `size + mtime`) means a regenerate causes browsers to re-fetch on their next conditional request within `max-age=300`, no manual refresh required for the tab icon

### Changed files

| File | Change |
|------|--------|
| `src/server/utils/favicons.ts` | Added `ensureBundledDefaults({ force })` returning `{ generated, failed, master, skipped }` — handles master-discovery (`pwa-512x512.png` → `pwa-192x192.png` → `apple-touch-icon.png`), per-variant sharp downscale into a transparent square canvas, `pngToIco` multi-res `.ico` assembly, and a skip for the chosen master to avoid re-encoding it; `getFaviconVersion()` now falls back to the mtime of `favicon.ico` (or `pwa-512x512.png`) so cache-busting `?v=` is present even for bundled defaults; imported `statSync` |
| `src/server/plugins/02.favicon-defaults.ts` | New Nitro server-startup plugin — calls `ensureBundledDefaults({ force: false })` and logs success/failure (silently no-ops in dev where `FAVICONS_PUBLIC_DIR` doesn't exist) |
| `src/server/api/admin/favicon-defaults-regenerate.post.ts` | New admin endpoint — `requireAdminSession`, calls `ensureBundledDefaults({ force: true })`, returns `{ ok, version, generated, failed, master }`; 409 in dev mode (no defaults dir), 500 when no master image found |
| `src/server/routes/manifest.webmanifest.get.ts` | Set `Cache-Control: no-cache, must-revalidate` so the PWA manifest is revalidated on every navigation and always references the latest favicon `?v=` |
| `src/components/admin/FaviconSettings.vue` | New "Regenerate defaults" button rendered in a second right-column block (`v-else-if="status"`) below the custom-upload buttons; added `regenerating` ref + `regenerateDefaults()` async handler with confirm prompt, busy state, toast feedback and `refreshPreview(res.version)` cache-bust |

---

## Logo Image picker — browse `data/` instead of typing filenames

### 🚀 Enhancements

- **admin:** The **Logo Image** field in the **Logo & Favicon** accordion is no longer a free-form text input — it's now a **dropdown picker** that lists every image present in the `data/` volume (root + one level deep). Each option shows a 32×32 thumbnail and file size, the trigger button shows the currently selected image as a 28×28 preview, and a checkmark highlights the active selection
- **admin:** **Refresh** button inside the dropdown re-scans `data/` on demand so a freshly dropped PNG/SVG shows up without a page reload, and cache-busts the thumbnail URLs so a re-uploaded file with the same name renders its new bytes
- **admin:** **Clear** button blanks the field in one click, and a **Custom path…** escape hatch falls back to a plain text input for paths that live outside the scan (e.g. deeply-nested subfolders) — the icon-only "back to picker" button returns to the dropdown without losing the typed value
- **admin:** Dropdown closes on click-outside and on `Escape`; thumbnails load lazily and use the existing `/api/assets/<path>` route so no extra static-file plumbing is needed
- **server:** New `GET /api/admin/data-images` endpoint scans `./data/` with a depth cap of 2 and an entry cap of 500, skips every entry starting with `.` (so the massive `.favicon-cache` and `.icon-url-cache` directories are ignored), filters to `.png` / `.jpg` / `.jpeg` / `.gif` / `.webp` / `.svg` / `.avif` / `.ico`, and returns each image with its name, path relative to `data/`, size, and mtime — root files are sorted before subfolder files so `logo.png` lands above `favicons/source.png`

### Changed files

| File | Change |
|------|--------|
| `src/server/api/admin/data-images.get.ts` | New admin-gated endpoint that walks `./data/` and returns the image list as `{ images: DataImage[] }`; recursion is bounded by `MAX_DEPTH = 2` and `MAX_ENTRIES = 500`, hidden entries (`.`-prefixed) are skipped, and results are sorted by path depth then alphabetically |
| `src/components/admin/ImagePicker.vue` | New reusable component (auto-imported as `<AdminImagePicker>`) — `v-model:modelValue` compatible, custom dropdown with thumbnails + file sizes, Refresh / Clear / Custom path… controls, click-outside + Escape to close, lazy image loading, and cache-busted preview URLs |
| `src/components/admin/GlobalSettings.vue` | Replaced the `Logo Image (filename in data/)` text input with `<AdminImagePicker v-model="state.logoImage" placeholder="logo.png" />`; renamed the label to **Logo Image** and added a hint paragraph explaining the picker / custom-path fallback |

---

## Drag-and-drop + in-app copy/paste for items and groups

### 🚀 Enhancements

- **admin / config-builder:** Bookmarks, widgets and whole groups (categories) can now be **dragged** between groups and across tabs. Drop on an item to insert before/after based on cursor Y, drop on the body of a group to append, drop on a tab to append the dragged group at the end of that tab. In the Vue admin, hovering an item over a collapsed tab automatically expands it so you can drop into its groups
- **admin / config-builder:** Each item, stack and group header now has an orange **copy** button that snapshots a deep clone into an in-memory clipboard slot. A matching orange **Paste item** / **Paste group** button appears next to **+ Bookmark** / **+ Add Group** while the clipboard holds a payload of the right kind — the deep clone means you can paste the same item/group repeatedly
- **admin / config-builder:** Drag handles (≡) on item and group rows make it discoverable that the row is draggable; the source row dims to `opacity: 0.45` during drag and the active drop target gets a brand-coloured ring with a top/bottom border indicating which side the item/group will be inserted
- **admin / config-builder:** **Locked tabs** stay protected against destructive operations — drag-and-drop moves, arrow re-ordering, copy from a locked tab, and delete are all blocked. **Paste into** a locked tab is allowed (explicit user-initiated insert), so you can still seed a locked tab from an unlocked one
- **admin:** Stale "edit", "card style" and "modules" panels are automatically collapsed after every move so their `tab-group-item` indexes don't leak onto a different item after re-ordering

### Changed files

| File | Change |
|------|--------|
| `src/composables/useConfigBuilder.ts` | Added `clipboard` ref + `deepClone` helper; new `copyItem` / `copyGroup` / `pasteItemInto` / `pasteGroupInto` / `moveItemTo` / `moveGroupTo` exported from the composable. Move helpers refuse when either source or destination tab is locked and use a "splice then re-insert" pattern that handles same-group, cross-group and cross-tab cases consistently |
| `src/pages/admin/index.vue` | Destructure the new helpers from `useConfigBuilder()` and pass them as props to `<AdminTabsEditor>` |
| `src/components/admin/TabsEditor.vue` | Tab outer div, group container and item card became drop targets with `@dragstart` / `@dragover` / `@drop` / `@dragend` handlers using a `dragState` ref + `dataTransfer` JSON payload; added drag handles, orange `copy` buttons (hidden on locked tabs) and orange `Paste item` / `Paste group` buttons (always visible). Inputs in group headers get `@mousedown.stop` so they don't initiate a drag. `closeOpenEdits()` clears `openEdits` / `openCards` / `openModulePanels` after every move |
| `config-builder/index.html` | Added global `clipboard` + `cloneObj` + `moveItemTo` / `moveGroupTo` / `copyItem` / `copyGroup` / `pasteItemInto` / `pasteGroupInto`; new `setupTabsDnd()` registers a single delegated `dragstart` / `dragover` / `dragleave` / `drop` listener on `#tabs-container` and reads `data-kind` / `data-ti` / `data-gi` / `data-ii` / `data-tabheader` from the closest matching ancestor; `renderTabs` / `renderGroup` / `renderItem` now emit those data attributes plus `draggable="true"`, the drag handle, orange copy buttons (hidden on locked tabs) and conditional orange paste buttons. Existing file-drop overlay (`setupDragDrop`) filters on `dataTransfer.types.includes('Files')` so internal item/group drags no longer trigger the "Drop config.yml here" overlay. New CSS classes `.tabs-dnd-dragging` (dim source), `.tabs-dnd-over` (ring), `.tabs-dnd-before` / `.tabs-dnd-after` (insert indicator) added to the `<style>` block. `closeAllEditPanels()` hides every `[id^="item-edit-"]` / `[id^="group-card-"]` before re-rendering so the old open-panel restore logic in `renderTabs` can't reopen stale panels |

---

## Global Settings accordion collapsed by default

### 🚀 Enhancements

- **admin:** The **Global Settings** accordion in `/admin` now starts collapsed by default, matching the **Logo & Favicon** accordion — reduces visual noise on page load and keeps focus on the tab/group/service editor below

### Changed files

| File | Change |
|------|--------|
| `src/components/admin/GlobalSettings.vue` | Changed `const open = ref(true)` to `const open = ref(false)` so the Global Settings section is collapsed on initial render |

---

## "Use as site logo" — sync admin form state after the patch

### 🐛 Bug Fixes

- **admin:** Clicking **Use as site logo** wrote the new `logo` block to `config.yml` on disk but the in-memory builder state was never updated, so the **Logo Image** input stayed empty, the **Logo Type** dropdown didn't switch, and the YAML preview kept showing the old value until a full page reload
- **admin:** `FaviconSettings.vue` now emits a new `logo-applied` event with the full logo object returned by the server (including any preserved `text` / `fontSize` / `color` / etc. from an upgraded `type: text` → `type: both`); `GlobalSettings.vue` consumes it and patches the `state.logoType` / `state.logoImage` / `state.logoText` / styling fields directly — using the exact same mapping as `loadConfigFromYaml()` so behaviour stays consistent

### Changed files

| File | Change |
|------|--------|
| `src/components/admin/FaviconSettings.vue` | Added `AppliedLogo` type + `logo-applied` emit; `useAsLogo()` now forwards the server's `res.logo` to the parent |
| `src/components/admin/GlobalSettings.vue` | Added `onFaviconAppliedAsLogo()` handler wired to `@logo-applied`; mutates the reactive `state` so the Logo Image input, Logo Type dropdown, and YAML preview update immediately |

---

## Admin favicon upload — auto-generates all variants and can become the site logo

### 🚀 Enhancements

- **admin:** New **App Favicon** section in `/admin` — drag-and-drop (or pick) a single PNG/SVG and the server generates the complete favicon set: `favicon.ico` (multi-resolution 16/32/48), `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png` (180×180), `pwa-192x192.png`, `pwa-512x512.png`, `android-chrome-192x192.png`, `android-chrome-512x512.png` — all written atomically to `./data/favicons/` so a half-failed render never leaves the directory in a mixed state
- **admin:** **Live preview grid** of all eight generated variants, with cache-busted `?v=<timestamp>` URLs, opacity dimming for any variant that fails to load (with auto-recovery on the next successful load), and a status header showing source filename, size, MIME, and generation timestamp
- **admin:** **Reset to default** button restores the bundled defaults that ship with the Docker image
- **admin:** **Use as site logo** button (with **Re-apply as logo** when already active) — points the `logo` config field at `favicons/source.<png|svg>`, preserves any existing logo text by upgrading a `type: text` logo to `type: both`, and uses `yaml.parseDocument` so manual comments and formatting in `config.yml` are preserved
- **admin:** **Logo & Favicon** are now grouped into one accordion in `GlobalSettings.vue` — the favicon UI is embedded inline below the logo form (no more separate accordion section)
- **server:** New Nitro middleware `server/middleware/favicons.ts` serves runtime uploads from `./data/favicons/` with the bundled defaults (snapshotted to `./server/favicons-defaults/`) as fallback — sends correct MIME type, `Cache-Control: public, max-age=300, must-revalidate`, weak ETag, 304 Not Modified support, and an `X-Favicon-Source: runtime|bundled` header for diagnostics
- **server:** `getFaviconVersion()` powers cache-busting — `<link>` tags injected via `src/plugins/favicons.ts` and the PWA `manifest.webmanifest` both append `?v=<timestamp>` so browsers fetch new icons immediately after an upload
- **server:** New endpoints — `GET /api/admin/favicon` (status + source asset path + "used as logo" flag), `POST /api/admin/favicon` (multipart upload + generation, max 5 MB, PNG/SVG only), `DELETE /api/admin/favicon` (reset), `POST /api/admin/favicon-use-as-logo` (patches `config.yml`), and `GET /api/favicon-version` (public cache-bust value)
- **deps:** Added `sharp` (^0.35.1) for image rasterization/resizing and `png-to-ico` (^3.0.1) for multi-resolution `.ico` assembly

### 🐛 Bug Fixes

- **docker:** Fixed `[500] Could not load the "sharp" module using the linuxmusl-x64 runtime` — Nitro's tree-shaker did not follow Sharp's platform-specific optional deps (`@img/sharp-linuxmusl-x64`, `@img/sharp-libvips-linuxmusl-x64`) into `.output/`, so the Dockerfile now explicitly copies `node_modules/@img/sharp-*` into `.output/server/node_modules/@img/` for the build platform
- **server:** Fixed "only 4 of the 8 favicon variants get replaced" — Nitro's static asset handler (`_wFwA8T`) is registered as the very first middleware in the handler chain (before our `/favicons` middleware) and short-circuits any URL present in the build-time public-assets manifest, so the 4 bundled defaults (`favicon.ico`, `apple-touch-icon.png`, `pwa-192x192.png`, `pwa-512x512.png`) were always served instead of the upload. The Dockerfile now (1) snapshots the bundled defaults to `.output/server/favicons-defaults/` and removes the originals from `.output/public/favicons/`, and (2) runs a Node-snippet that strips all `"/favicons/*"` keys from the public-assets manifest inside `nitro.mjs` so requests fall through to our middleware
- **admin:** Preview thumbnails that failed to load the first time stayed dimmed forever — added `missingVariants` reactive Set with `@load` / `@error` handlers and a `refreshPreview()` helper that resets the set after every upload/reset, so previews correctly recover when files become available

### 💥 Breaking Changes

- **server:** Bundled favicons no longer live at `.output/public/favicons/` in the production image. They are snapshotted to `.output/server/favicons-defaults/` during the Docker build and served via the new `/favicons/*` middleware. Bind-mounting `./mafl/favicons:/app/public/favicons` (previously commented out in `docker-compose.yml`) no longer has any effect — use the `/admin` upload flow instead, which writes to `./data/favicons/` via the existing `./mafl:/app/data` mount

### Changed files

| File | Change |
|------|--------|
| `package.json` | Added `sharp ^0.35.1` and `png-to-ico ^3.0.1` |
| `Dockerfile` | Copy Sharp's platform-specific native binaries into `.output/server/node_modules/@img/`; snapshot `.output/public/favicons/` to `.output/server/favicons-defaults/` and delete the originals; strip `/favicons/*` keys from the Nitro public-assets manifest in `nitro.mjs` so the dynamic middleware takes over |
| `src/server/utils/favicons.ts` | New utility — `FAVICONS_RUNTIME_DIR`, `FAVICONS_PUBLIC_DIR`, `FAVICON_PNG_VARIANTS`, `FAVICON_ICO_SIZES`, `mimeForFile`, `getFaviconMeta`, `getFaviconVersion`, `generateFavicons` (renders all buffers in memory first, then atomically clears + writes the runtime dir), `clearRuntimeDir`, `removeFavicons`, `listFaviconNames`, `findFaviconSourceAsset` |
| `src/server/middleware/favicons.ts` | New middleware — serves `/favicons/<name>` from `./data/favicons/` (runtime) then `./server/favicons-defaults/` (bundled), with sanitized filename check, MIME detection, weak ETag, 304 handling, and `X-Favicon-Source` debug header |
| `src/server/api/admin/favicon.get.ts` | New endpoint returning custom/bundled status, version, source meta, generated timestamp, expected variants list, source asset path, and a `usedAsLogo` flag based on the current `config.yml` |
| `src/server/api/admin/favicon.post.ts` | New multipart upload endpoint — admin-gated, validates PNG/SVG, ≤ 5 MB, calls `generateFavicons` |
| `src/server/api/admin/favicon.delete.ts` | New endpoint — admin-gated reset that clears the runtime dir |
| `src/server/api/admin/favicon-use-as-logo.post.ts` | New endpoint — patches `config.yml` via `yaml.parseDocument` (preserves comments), upgrades `type: text` logos to `type: both`, validates the patched config with the existing zod schema |
| `src/server/api/favicon-version.get.ts` | New public endpoint returning the current favicon version for client-side cache-busting |
| `src/plugins/favicons.ts` | New Nuxt plugin — injects `<link>` tags for `favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png` with `?v=<version>` query strings |
| `src/server/routes/manifest.webmanifest.get.ts` | Append `?v=<faviconVersion>` to the PWA manifest's icon `src` values |
| `nuxt.config.ts` | Removed static favicon `<link>` tags (now injected by the plugin); manifest link retained |
| `src/components/admin/FaviconSettings.vue` | New admin component — accordion (or inline) with drop zone, file picker, status header, warnings/errors, Upload & Generate, Reset to default, Use as site logo / Re-apply as logo, live 8-variant preview grid with cache-busting + missing-variant tracking; `inline` prop renders without its own accordion wrapper |
| `src/components/admin/GlobalSettings.vue` | Renamed "Logo" accordion to **"Logo & Favicon"**; embedded `<AdminFaviconSettings inline />` inside it with a divider; added `toast` event relay |
| `src/pages/admin/index.vue` | Removed the standalone `<AdminFaviconSettings>` mount; wired `@toast="onChildToast"` to `<AdminGlobalSettings>` instead |
| `docs/favicons.md` | Documented the new `/admin` upload workflow alongside the existing volume-mount approach |

---

## Editable YAML output with live syntax highlighting

### 🚀 Enhancements

- **admin:** YAML output panel now has an **Edit** toggle (pencil icon) — switch to a full textarea to edit the YAML directly, then click **Apply to Form** to parse it back into the form fields
- **admin:** **Syntax highlighting** now works in edit mode — uses a transparent textarea overlay on top of a highlighted `<pre>`, so you see colored YAML while typing
- **admin:** **Save & Apply** uses the edited YAML directly when in edit mode with unsaved changes, then syncs the form state to match
- **admin:** **Copy** and **Export** also respect manually edited YAML content
- **config-builder:** Same editable YAML + live syntax highlighting added to the standalone `config-builder/index.html`
- **config-builder:** New **syntax highlighting toggle** button (palette icon) — works in both read-only preview and edit mode

### Changed files

| File | Change |
|------|--------|
| `src/pages/admin/index.vue` | Added YAML edit mode with overlay editor (transparent textarea + highlighted backdrop), `toggleYamlEdit`, `applyYamlToForm`, `syncBackdropScroll`, debounced edit highlighting; updated `saveConfig`, `copyYaml`, `exportConfig` to use edited YAML; added `.yaml-editor-wrap` / `.yaml-editor-backdrop` / `.yaml-editor-input` scoped styles |
| `config-builder/index.html` | Added overlay editor HTML structure, `highlightYamlStr()` function, `toggleYamlEdit`, `toggleYamlHighlight`, `applyYamlToForm`, `syncYamlEditorScroll`, debounced backdrop updates; added `.yaml-editor-*` and `.yaml-hl` CSS styles |

---

## Per-tab export & import in Admin Config Builder

### 🚀 Enhancements

- **admin:** Added per-tab **Export** button (download icon) in the tab header — exports a single tab (with all its groups and services) as a standalone `.yml` file
- **admin:** Added **Import Tab…** button next to "+ Add Tab" — imports a previously exported tab `.yml` and appends it to the current configuration without overwriting existing tabs
- **config-builder:** Same export/import per tab functionality added to the standalone `config-builder/index.html`

### Changed files

| File | Change |
|------|--------|
| `src/composables/useConfigBuilder.ts` | Added `serializeTab()`, `exportTabYaml()`, and `importTabFromYaml()` functions |
| `src/components/admin/TabsEditor.vue` | Added export button per tab, import file input + button, and corresponding handler functions |
| `src/pages/admin/index.vue` | Wired new `exportTabYaml` and `importTabFromYaml` props to `AdminTabsEditor` |
| `config-builder/index.html` | Added equivalent export/import per tab (standalone HTML version) |

---

## Suppress Vue Router warnings from bot/scanner probes

### 🐛 Bug Fixes

- **server:** Eliminated `[Vue Router warn]: No match found for location with path "..."` spam in the server log caused by bot and vulnerability-scanner probes hitting paths like `/sitemap.xml`, `/bot-connect.js`, `/css/support_parent.css`, `/js/lkk_ch.js`, `/static/style/protect/index.js`, `/assets/js/qr_modal.js`, `/assets/js/auth.js`, `/assets/js/message.js`, etc. — requests that look like missing static assets now receive a fast 404 instead of being routed through the SSR renderer
- **pwa:** Removed the broken `mask-icon` link to `/favicons/logo.svg` from `nuxt.config.ts` — that file is not shipped in `src/public/favicons/` (nor documented for the custom favicons volume mount), so browsers were requesting a non-existent asset on every page load and triggering the same Vue Router warning

### 🚀 Enhancements

- **server:** New Nitro middleware `static-404.ts` short-circuits requests that match a static-asset file extension (`.js`, `.css`, `.xml`, `.svg`, `.json`, fonts, images, archives, and common probe extensions like `.env`/`.sql`/`.php`) and fall outside Nuxt-served prefixes (`/_nuxt/`, `/_ipx/`, `/api/`, `/favicons/`, `/manifest.webmanifest`, `/sw.js`, `/workbox-`, `/registerSW.js`, `/robots.txt`) — saves a full SSR cycle per probe and keeps the log readable

### Changed files

| File | Change |
|------|--------|
| `src/server/middleware/static-404.ts` | New Nitro server middleware that returns a plain `404 Not Found` for requests that look like missing static assets, before the SSR renderer (and Vue Router) is invoked |
| `nuxt.config.ts` | Removed the `mask-icon` `<link>` pointing to the non-existent `/favicons/logo.svg` |

---

## Web radio — resilient Radio Browser API client

### 🐛 Bug Fixes

- **web-radio:** Suppressed noisy `Radio Browser request failed TypeError: fetch failed ... ECONNRESET` stack traces when the upstream API is briefly unreachable — replaced with a single one-line warning rate-limited to once per minute
- **web-radio:** Click tracking failures are now silently ignored — `trackStationClick()` is best-effort analytics and should never surface as a server error
- **web-radio:** `getStationByUuid()` falls back to stale cached data (up to 24 hours) when the Radio Browser API is unreachable — playback continues working during transient upstream outages

### 🚀 Enhancements

- **web-radio:** Added `all.api.radio-browser.info` as a fourth fallback endpoint (round-robin DNS) — increases the chance of at least one server being reachable
- **web-radio:** Reduced per-server timeout from 10s to 8s and added a small jittered backoff (100–300 ms) between fallback attempts — faster failover without retry storms
- **web-radio:** Cleaner error summaries — surfaces the underlying network code (`ECONNRESET`, `ETIMEDOUT`, `HTTP 5xx`) instead of the full undici stack

### Changed files

| File | Change |
|------|--------|
| `src/server/utils/radioBrowser.ts` | Rate-limited concise error logging; added stale-while-error cache fallback (24 h); jittered backoff between server attempts; added `all.api.radio-browser.info` to the server list; silenced `trackStationClick` failures |

---

## Web radio — first-click playback reliability across all browsers

### 🐛 Bug Fixes

- **web-radio:** Fixed "Stream decode error — try an MP3 station" appearing on the first click of a station — playback now starts reliably the first time
- **web-radio:** Browser-specific playback path — Chrome/Edge/Safari connect directly to the resolved stream URL for instant playback (RadioMii-style); Firefox routes through the server-side proxy because it cannot reliably decode raw Icecast streams (`NS_ERROR_DOM_MEDIA_MEDIASINK_ERR`)
- **web-radio:** Wait for the browser `canplay` event before calling `audio.play()` when using the proxy — prevents `MEDIA_ERR_DECODE` triggered by calling `play()` on a stream that has not yet received decodable data
- **web-radio:** Server-side stream proxy now buffers at least 8 KB of upstream audio before sending response headers — the browser receives `Content-Type` together with actual decodable bytes, eliminating empty-response decode errors on slow streams
- **web-radio:** Suppressed transient `error` events fired during the startup handshake and after playback has already begun — prevents the error banner from flashing while the stream is connecting
- **pwa:** Added `skipWaiting: true` and `clientsClaim: true` to Workbox config — new builds activate immediately on the next page load instead of waiting for every tab to close, so fixes deployed to the container reach the browser without manual service-worker unregistration

### 🚀 Enhancements

- **web-radio:** Added in-memory station cache (15-minute TTL) in `getStationByUuid()` — eliminates a Radio Browser API round-trip on repeat clicks and reduces first-click latency for stations the page has already resolved
- **web-radio:** Centralized retry/error handling in the player composable — guarantees the audio element is in a clean state between attempts and reports a single, accurate error message when playback ultimately fails

### Changed files

| File | Change |
|------|--------|
| `src/composables/useWebRadioPlayer.ts` | Firefox detection via user agent; direct stream URL for other browsers; `canplay` await + `audio.load()` in the proxy path; `startingPlayback` flag and `playing.value` guard suppress spurious error events during startup |
| `src/server/api/radio-browser/stream/[uuid].get.ts` | Buffer ≥ 8 KB of upstream data before writing response headers; 502 if upstream produced no data |
| `src/server/utils/radioBrowser.ts` | Added `stationCache` (15-minute TTL) keyed by station UUID; renamed cache constant to `CACHE_TTL_MS` |
| `nuxt.config.ts` | PWA `workbox`: `skipWaiting: true` + `clientsClaim: true` so service worker updates apply immediately |

---

## Web radio — server-side stream proxy for Firefox compatibility

### 🐛 Bug Fixes

- **web-radio:** Fixed "Stream decode error" (`NS_ERROR_DOM_MEDIA_MEDIASINK_ERR`) in Firefox — all radio stations failed to play
- **web-radio:** Added server-side stream proxy (`/api/radio-browser/stream/[uuid]`) so the browser receives a same-origin audio stream, avoiding mixed-content and cross-origin issues
- **web-radio:** Proxy resolves multi-hop redirects (e.g. StreamTheWorld) server-side and upgrades HTTP to HTTPS for known streaming domains
- **web-radio:** Disabled `Icy-MetaData` in upstream requests — metadata blocks embedded in the audio stream caused Firefox's decoder to fail
- **web-radio:** Disabled chunked transfer encoding on proxy responses — Firefox's audio pipeline expects a raw bytestream like Icecast servers provide

### Changed files

| File | Change |
|------|--------|
| `src/server/api/radio-browser/stream/[uuid].get.ts` | New server-side stream proxy endpoint — fetches upstream audio, disables ICY metadata and chunked encoding, pipes raw bytes to the client |
| `src/server/utils/resolveStreamUrl.ts` | New utility to follow redirect chains and clean/normalize stream URLs server-side |
| `src/server/utils/radioBrowser.ts` | Station lookup resolves the final stream URL server-side before returning it; search results sorted by playability (MP3/HTTPS preferred) |
| `src/composables/useWebRadioPlayer.ts` | Playback uses the server-side proxy URL instead of the direct stream URL |
| `src/utils/radioStream.ts` | URL normalization and playability comparison helpers |

---

## Console errors & missing background assets

### 🐛 Bug Fixes

- **validation:** `isUrl()` no longer logs `Invalid URL` to the console for empty or non-HTTP links — fixes repeated console noise on tabs with web-radio items and other services without a `link`
- **pwa:** Removed `navigateFallback: '/'` from Workbox config — fixes `non-precached-url` service worker errors on SSR pages (hash routes such as `/#radio` are unaffected)
- **assets:** Missing `background` files in the data volume are stripped server-side before settings reach the frontend — prevents 404 requests for configured but absent images (e.g. `blossom1.jpg`)

### Changed files

| File | Change |
|------|--------|
| `src/utils/validation.ts` | `isUrl()` returns `false` silently for empty/invalid URLs |
| `nuxt.config.ts` | Removed `navigateFallback` from `workbox` and `devOptions` |
| `src/server/utils/assets.ts` | New helper `dataAssetExists()` to check data-volume asset paths |
| `src/server/utils/config.ts` | `extractSafelyConfig()` clears `background` when the file is missing |
| `src/layouts/default.vue` | Background layer only renders when a valid `background` path is set |

---

## SEO & Meta — configurable meta tags and robots.txt

### 🚀 Enhancements

- **seo:** Added `meta` section in `config.yml` for page meta tags: `description`, `keywords`, `author`, `robots`, and Open Graph (`og.title`, `og.description`, `og.image`, `og.type`)
- **seo:** Default HTML meta robots directive is `noindex, nofollow` (applied even when omitted from config)
- **seo:** Added `robotsTxt` toggle — when enabled (default), `/robots.txt` serves `Disallow: /`; when disabled, serves `Allow: /`
- **seo:** `/robots.txt` is generated dynamically from config via a server route (no static file in `public/`)
- **admin:** New **SEO & Meta** accordion with fields for meta tags, Open Graph, and the robots.txt crawler block toggle
- **pwa:** `manifest.webmanifest` uses `meta.description` when configured, otherwise falls back to the page title
- **docs:** Documented `meta` and `robotsTxt` in [configuration.md](docs/configuration.md) and [admin.md](docs/admin.md)

### Changed files

| File | Change |
|------|--------|
| `src/types/config.d.ts` | Added `Meta`, `MetaOg` interfaces; `meta` and `robotsTxt` on `Config` |
| `src/server/validations/config.ts` | Zod schema for `meta` and `robotsTxt` |
| `src/server/utils/config.ts` | Defaults: `robotsTxt: true`, `meta.robots: noindex, nofollow` |
| `src/server/routes/robots.txt.get.ts` | New dynamic `/robots.txt` endpoint driven by `robotsTxt` |
| `src/utils/pageMeta.ts` | Builds HTML `<head>` meta tags from config |
| `src/app.vue` | Applies configurable meta tags via `useHead` |
| `src/server/routes/manifest.webmanifest.get.ts` | Uses `meta.description` for PWA description |
| `src/components/admin/SeoSettings.vue` | New admin accordion for SEO settings |
| `src/pages/admin/index.vue` | Added `AdminSeoSettings` to config builder |
| `src/composables/useConfigBuilder.ts` | Import/export for `meta` and `robotsTxt` |
| `src/public/robots.txt` | Removed — replaced by dynamic server route |
| `docs/configuration.md` | SEO & Meta section |
| `docs/admin.md` | SEO & Meta feature listed |

---

## Icon URL proxy cache

### 🚀 Enhancements

- **icons:** External `icon.url` values (e.g. web-radio station logos on the RADIO tab) are proxied through `/api/icon-url` instead of loading third-party URLs directly in the browser
- **icons:** Server-side disk cache (7 days) in `./data/.icon-url-cache/` — each remote URL is fetched at most once per week
- **icons:** Browser receives `Cache-Control: public, max-age=604800` headers for local caching
- **icons:** Added Workbox `CacheFirst` runtime caching for `/api/icon-url` so proxied icons also work offline via the Service Worker
- **web-radio:** Mini player and search results use the cached icon proxy for station favicons

### Changed files

| File | Change |
|------|--------|
| `src/server/api/icon-url.get.ts` | New server-side proxy endpoint with disk cache in `./data/.icon-url-cache/` |
| `src/utils/cachedIconUrl.ts` | Helper to route external URLs through the proxy (`data:` and local paths unchanged) |
| `src/components/service/base/Icon.vue` | `icon.url` uses cached proxy for `http(s)` URLs |
| `src/components/SearchBar.vue` | Radio search favicons via cached proxy |
| `src/components/service/web-radio/MiniPlayer.vue` | Station favicon via cached proxy |
| `nuxt.config.ts` | Added Workbox `runtimeCaching` rule for icon-url endpoint |

---

## Admin — logo settings in own accordion

### 💅 Improvements

- **admin:** Logo settings moved from Global Settings into a separate **Logo** accordion (Logo Type, image, text styling, preview)
- **admin:** Global Settings now only contains general options (title, theme, search, background, favicon API, link target, overlay, footer)

### Changed files

| File | Change |
|------|--------|
| `src/components/admin/GlobalSettings.vue` | Logo fields extracted into dedicated accordion section |

---

## Groups — hide grid/list title

### 🚀 Enhancements

- **groups:** Added `hideTitle` per service group to hide the category heading on the front page while keeping the YAML group key for organisation
- **admin:** Group header — title visibility toggle (T icon) next to display mode and card style
- **config-builder:** `hideTitle` is imported from and exported to YAML

### Changed files

| File | Change |
|------|--------|
| `src/types/config.d.ts` | Added `hideTitle?: boolean` to `ServicesGroup` |
| `src/server/validations/config.ts` | Zod schema for `hideTitle` |
| `src/server/utils/config.ts` | Pass `hideTitle` when parsing service groups |
| `src/components/Group.vue` | Hide `<h2>` when `hideTitle` is set |
| `src/composables/useConfigBuilder.ts` | `BuilderGroup.hideTitle`, import/export, defaults |
| `src/components/admin/TabsEditor.vue` | Title visibility toggle per group |

---

## Layout — separate spacing for grid and list

### 🚀 Enhancements

- **layout:** Replaced single `spacing.item` with dedicated spacing properties: `spacing.gridGap`, `spacing.listGapX`, `spacing.listGapY`
- **layout:** List row gaps are now configurable instead of hardcoded Tailwind classes (`gap-6 lg:gap-8 xl:gap-12`)
- **layout:** `spacing.group` remains as vertical space between sections
- **admin:** Layout section — Spacing now shows four fields: *Between groups*, *Grid gap*, *List gap X*, *List gap Y*
- **config-builder:** Same fields in the standalone builder

### ⚠️ Breaking

- `layout.spacing.item` is removed — replace with `layout.spacing.gridGap` in existing configs

### Changed files

| File | Change |
|------|--------|
| `src/types/config.d.ts` | `LayoutSpacing` now has `gridGap`, `listGapX`, `listGapY` instead of `item` |
| `src/server/validations/config.ts` | Zod schema updated for new spacing fields |
| `src/composables/useConfigBuilder.ts` | BuilderState, defaults, import/export for new fields |
| `src/components/admin/LayoutSettings.vue` | Four spacing inputs |
| `src/components/Group.vue` | Separate `gridStyle` and `listStyle` using `gridGap` and `listGapX`/`listGapY` |
| `src/pages/index.vue` | List-row style uses `listGapX`/`listGapY` from config |
| `config-builder/index.html` | Updated spacing fields, reset, load, and example YAML |

---

## Admin — remove Color field from favicon icon type

### 🐛 Fixes

- **admin:** Removed the Color HEX field when icon type is `favicon` (CSS `color` has no effect on `<img>` elements)
- **config-builder:** Same fix in the standalone config builder
- **serializer:** No longer outputs `icon.color` for favicon entries in generated YAML

### Changed files

| File | Change |
|------|--------|
| `src/components/admin/ItemFields.vue` | Removed Color input from favicon icon section |
| `config-builder/index.html` | Removed Color input from favicon icon section |
| `src/composables/useConfigBuilder.ts` | Removed `icon.color` serialization for favicon type |

---

## Layout — configurable grid icon size

### 🚀 Enhancements

- **layout:** Added `layout.grid.iconSize` to control the width and height of service icons in grid cards (default `4rem`)
- **layout:** Added `layout.grid.itemPadding` to control inner padding of grid card items (default `1rem`)
- **layout:** `layout.spacing.item` is now applied as the gap between grid and list items (was previously ignored in favour of fixed Tailwind gaps)
- **admin:** Layout section — **Icon size** and **Item padding** fields under *Grid item size*
- **config-builder:** Same fields under Layout → *Grid item size*

### 📖 Documentation

- **configuration.md:** New *Grid item size* section; updated spacing and full layout examples
- **home.md:** Feature table and layout example updated
- **admin.md:** Layout & Styles description updated

### Changed files

| File | Change |
|------|--------|
| `src/types/config.d.ts` | Added `iconSize`, `itemPadding` to `LayoutGrid` |
| `src/server/validations/config.ts` | Validation for new grid layout options |
| `src/composables/useGridItemStyle.ts` | Shared composable for grid card icon/padding styles |
| `src/components/service/base/Index.vue` | Uses configurable icon size and item padding |
| `src/components/service/Placeholder.vue` | Matches configurable grid item sizing |
| `src/components/Group.vue` | Applies `spacing.item` as grid gap; `stackStyle()` helper |
| `src/composables/useConfigBuilder.ts` | Import/export `gridIconSize` / `gridItemPadding` |
| `src/components/admin/LayoutSettings.vue` | Icon size and item padding inputs |
| `config-builder/index.html` | Grid item size fields in Layout section |
| `docs/configuration.md` | Grid item size documentation |
| `docs/home.md` | Feature and layout docs updated |
| `docs/admin.md` | Admin layout description updated |
| `README.md` | Feature table, layout section and admin panel description updated |

---

## OpenWeatherMap — layout & optional weather type

### 🚀 Enhancements

- **openweathermap:** Updated widget layout — place name and temperature on separate lines (no colon after the city name)
- **openweathermap:** Added optional `showDescription` setting (default `true`) to hide the weather type line (e.g. "overcast clouds")
- **admin:** OpenWeatherMap module — **Show weather type** field (`true` / `false`)

### Changed files

| File | Change |
|------|--------|
| `src/components/service/OpenWeatherMap.vue` | Two-line title (place + temperature); conditional weather type in description |
| `src/components/service/base/Index.vue` | Title `line-clamp-2`; hide empty description paragraph |
| `src/types/services.d.ts` | Added `showDescription?: boolean` to OpenWeatherMap options |
| `src/components/admin/ItemFields.vue` | Show weather type select for OpenWeatherMap |
| `src/composables/useConfigBuilder.ts` | Import/export `owmShowDescription` / `showDescription` |
| `config-builder/index.html` | Show weather type field in OpenWeatherMap item editor |

---

## Web Radio — default volume

### 🚀 Enhancements

- **web-radio:** Default playback volume is 65% when starting a stream (was 100%); adjustable via the mini player slider during the session

### Changed files

| File | Change |
|------|--------|
| `src/composables/useWebRadioPlayer.ts` | Default `webRadioVolume` state set to `0.65` |

---

## Search — Webradio option & dropdown layering

### 🚀 Enhancements

- **search:** Added `searchWebradio` global setting — enable Radio Browser station search in the search bar independently of whether a `web-radio` module is on the page
- **search:** Added optional `searchWebradioCountryCode` (default `NL`) to filter live station results by country
- **admin:** Config Builder checkbox **Include Webradio stations in search results** under Global Settings → Search Provider, with country code field when enabled

### 🐛 Bug Fixes

- **search:** Fixed search results dropdown rendering behind TomTom/Leaflet map widgets — dropdown is teleported to `document.body` with a high z-index; map widgets use an isolated stacking context

### 📖 Documentation

- **configuration.md:** Documented `searchWebradio` and `searchWebradioCountryCode` in the Search section
- **modules.md:** Web Radio search bar behaviour moved to global search settings; clarified `countryCode` on web-radio items (admin station picker only)
- **home.md**, **admin.md:** Updated search and Global Settings descriptions

### Changed files

| File | Change |
|------|--------|
| `src/types/config.d.ts` | Added `searchWebradio`, `searchWebradioCountryCode` |
| `src/server/validations/config.ts` | Validation for new search settings |
| `src/server/utils/config.ts` | Default `searchWebradio: false` |
| `src/composables/useConfigBuilder.ts` | Import/export and builder state for search webradio settings |
| `src/components/admin/GlobalSettings.vue` | Checkbox and country code field under Search Provider |
| `src/components/SearchBar.vue` | Uses `$settings.searchWebradio`; Teleport + fixed positioning for dropdown |
| `src/assets/style/tailwind.css` | `.leaflet-map-widget` isolation for map stacking |
| `src/components/service/TomtomEtaMap.vue` | Map container class for stacking isolation |
| `src/components/service/TomtomTrafficMap.vue` | Same map container class |
| `docs/configuration.md` | Search section expanded |
| `docs/modules.md` | Web Radio search behaviour updated |
| `docs/home.md` | Search section updated |
| `docs/admin.md` | Global Settings description updated |

---

## Web Radio — internet radio streaming

### 🚀 Enhancements

- **module: web-radio** — Stream internet radio stations in the browser via the Radio Browser API; each station is a separate grid item with the station logo as icon
- **web-radio:** Click a station card to play; mini player bar at the bottom with play/pause, volume and stop
- **search:** Optional live Radio Browser station search in the search bar via `searchWebradio: true` (see Search section in configuration.md)
- **admin:** Web Radio module with station search picker — auto-fills title, icon URL and station UUID

### 🐛 Bug Fixes

- **web-radio:** Fixed "Audio player unavailable" when starting playback from grid cards or search bar — audio element is now shared globally instead of per-component
- **web-radio:** Refresh stream URL from Radio Browser on failed playback; clearer error messages for network/unsupported streams

### 📖 Documentation

- **modules.md:** Web Radio section expanded (playback, mini player, search via `searchWebradio`, admin, icon, tab example, notes)
- **configuration.md:** Web Radio config section; Search documents `searchWebradio` / `searchWebradioCountryCode`

### Changed files

| File | Change |
|------|--------|
| `src/server/utils/radioBrowser.ts` | Radio Browser API client with server failover and User-Agent |
| `src/server/api/radio-browser/stations/search.get.ts` | Station search proxy |
| `src/server/api/radio-browser/stations/[uuid].get.ts` | Single station lookup |
| `src/server/api/radio-browser/click/[uuid].post.ts` | Click counter for Radio Browser |
| `src/server/api/services/web-radio.ts` | Resolves `stationUuid` to stream metadata |
| `src/types/services.d.ts` | Added `WebRadioService` interface |
| `src/composables/useRadioBrowser.ts` | Client fetch helpers for Radio Browser API |
| `src/composables/useWebRadioPlayer.ts` | Shared HTML5 audio player state and playback |
| `src/components/service/WebRadio.vue` | Grid card module — click to play |
| `src/components/service/web-radio/MiniPlayer.vue` | Fixed bottom mini player bar |
| `src/components/SearchBar.vue` | Live radio search (when `searchWebradio` enabled) and play from web-radio bookmarks |
| `src/components/Item.vue` | Registered `web-radio` module type |
| `src/composables/useConfigBuilder.ts` | Parse/serialize admin fields for web-radio |
| `src/components/admin/TabsEditor.vue` | Web Radio in Media module category |
| `src/components/admin/ItemFields.vue` | Station search picker in admin |
| `src/layouts/default.vue` | Mount mini player globally |
| `docs/modules.md` | Web Radio module documentation |
| `docs/configuration.md` | Web Radio config section and search bar notes |

## Grid Stack — vertical stacking in grid view

### 🚀 Enhancements

- **layout: stack** — Multiple modules can now be stacked vertically inside a single grid cell using the `stack` property; children are rendered top-to-bottom with the same gap as regular grid items
- **layout: stack** — Stack items support `span` to control how many columns the stack occupies, just like regular items
- **admin:** Stack items are fully manageable in the Config Builder — create stacks via the "+ Stack" button in the Modules panel, add/remove/reorder children, and edit each child's settings
- **admin:** Stacks are visually distinct with a purple "Stack" badge and indented children with a violet left border

### 📖 Documentation

- **modules.md:** Added Grid Stack section with usage explanation, two YAML examples (ETA + clock next to a map, stack with span) and notes on grid-only behavior
- **configuration.md:** Added Grid Stack section with YAML example and cross-reference to modules.md; added `stack` to the Service Item Properties table

### Changed files

| File | Change |
|------|--------|
| `src/types/services.d.ts` | Added `stack?: Service[]` to the `Service` interface |
| `src/server/validations/service.ts` | Added recursive `stack` field to Zod schema using `z.lazy()` |
| `src/server/utils/config.ts` | `determineService()` recursively assigns UUIDs to stack children; `extractServicesFromConfig()` flattens stacked children into the service map |
| `src/components/Group.vue` | Grid rendering detects `item.stack` and renders children in a `flex-col` container with responsive gap; supports `span` on the stack wrapper |
| `src/composables/useConfigBuilder.ts` | Added `stack?: BuilderItem[]` to `BuilderItem`; `parseRawItem()` and `serializeItem()` handle stack recursively; added `addStack()`, `addStackChild()`, `removeStackChild()`, `moveStackChild()` functions |
| `src/components/admin/TabsEditor.vue` | Stack items render with purple badge, indented children with move/edit/delete buttons, inline add-child buttons (Bookmark + module types), and "+ Stack" button in the Modules panel under Layout category |
| `src/pages/admin/index.vue` | Destructured and passed stack management functions to `AdminTabsEditor` |
| `docs/modules.md` | Added Grid Stack section with examples |
| `docs/configuration.md` | Added Grid Stack section and `stack` property to Service Item Properties table |

---

## TomTom UX improvements

### 🐛 Bug Fixes

- **tomtom:** Fixed geocoding failing for free-form addresses like "Rubenslaan 1, Bilthoven" — switched from TomTom's structured geocoding endpoint (`/search/2/geocode/`) to the fuzzy search endpoint (`/search/2/search/`) which accepts free-form text, street addresses, place names and POIs
- **tomtom:** Route name now uses the configured address text instead of raw coordinates as fallback — e.g. "Amsterdam → Parijs" instead of "52.37,4.89 → 48.86,2.35"; coordinates are only shown when no address is provided

### 💅 Improvements

- **admin:** Consolidated three separate TomTom module buttons ("+ TomTom ETA", "+ TomTom Route", "+ TomTom Traffic") into a single "+ TomTom" button — the specific module type is selected via a dropdown inside the configuration panel
- **admin:** TomTom configuration now shows a "TomTom Module" dropdown at the top with three options: ETA (arrival time), Route Map, and Traffic Map
- **admin:** Shared fields (API key, map style, map height, traffic flow, incidents) are synced when switching between TomTom types — no need to re-enter them

### Changed files

| File | Change |
|------|--------|
| `src/server/api/services/tomtom-eta.ts` | Switched to `/search/2/search/` for geocoding; route name fallback uses address text instead of coordinates |
| `src/server/api/services/tomtom-eta-map.ts` | Same geocoding and route name fix |
| `src/server/api/services/tomtom-traffic-map.ts` | Same geocoding fix |
| `src/components/admin/TabsEditor.vue` | Replaced three TomTom buttons with single "+ TomTom" entry in Navigation category |
| `src/components/admin/ItemFields.vue` | Added TomTom Module type dropdown; unified TomTom fields with computed proxies for shared values |

---

## Fix TomTom satellite map style

### 🐛 Bug Fixes

- **tomtom:** Fixed satellite map style showing a blank/basic map instead of satellite imagery — the `hybrid/main` tile layer is only a transparent overlay with roads and labels, not actual satellite photos; satellite mode now loads `sat/main` (real satellite imagery from TomTom/Maxar) as the base layer with `hybrid/main` on top for road labels
- **tomtom-traffic-map:** Satellite style now correctly displays satellite background with traffic flow and incident overlays
- **tomtom-eta-map:** Satellite style now correctly displays satellite background with route polyline and traffic overlays

### Changed files

| File | Change |
|------|--------|
| `src/components/service/TomtomTrafficMap.vue` | Satellite mode loads `sat/main` (jpg) base + `hybrid/main` (png) overlay instead of only `hybrid/main` |
| `src/components/service/TomtomEtaMap.vue` | Same satellite tile fix applied |

---

## Fix grid alignment next to large modules

### 🐛 Bug Fixes

- **layout:** Fixed items next to large spanning modules (like TomTom maps) not aligning properly and jumping — caused by Vue fragments rendering as separate grid items instead of being contained in one cell
- **layout:** Added `items-start` to the grid so smaller items keep their natural height instead of stretching to match the tallest item in the row
- **tomtom-eta-map:** Wrapped the two root elements (`ServiceBase` + map div) in a single root `<div>` to prevent fragment breakout in CSS Grid
- **tomtom-traffic-map:** Same single-root wrapper applied

### 💅 Improvements

- **admin:** Hidden the Icon Type section (favicon / url / name) for all three TomTom modules — these modules use built-in icons (travel mode icon for ETA, no icon for maps)

### Changed files

| File | Change |
|------|--------|
| `src/components/Group.vue` | Added `items-start` to grid classes to prevent vertical stretching |
| `src/components/service/TomtomEtaMap.vue` | Wrapped template in single root `<div>` |
| `src/components/service/TomtomTrafficMap.vue` | Wrapped template in single root `<div>` |
| `src/components/admin/ItemFields.vue` | Hidden Icon Type section for `tomtom-eta`, `tomtom-eta-map` and `tomtom-traffic-map` |

---

## TomTom traffic & route modules

### 🚀 Enhancements

- **module: tomtom-eta** — Displays estimated time of arrival, travel duration, traffic delay and distance for a configured route using the TomTom Routing API; supports car, truck, bicycle and pedestrian travel modes
- **module: tomtom-eta-map** — Interactive map with the calculated route drawn as a polyline, real-time traffic flow overlay and traffic incident markers (jams, road works, closures) using Leaflet with TomTom raster tiles
- **module: tomtom-traffic-map** — Interactive traffic map centered on a city, region or area without route calculation; shows traffic flow and incidents with configurable zoom level
- **tomtom:** All three modules support location input as coordinates (lat/lon), address (geocoded server-side via TomTom Search API), or a mix of both — coordinates take priority when both are provided
- **tomtom:** Geocoding results are cached for 24 hours and route calculations for 2 minutes to reduce API calls
- **tomtom:** Map modules support three map styles: `standard`, `dark` and `satellite`
- **tomtom:** Map height is configurable via `mapHeight` option (default 300px)
- **tomtom:** Traffic flow and incident overlays can be toggled independently per module

### 🐛 Bug Fixes

- **admin:** Fixed full page reload when saving config in the admin panel — the `config:update` WebSocket event now skips `reloadNuxtApp` on `/admin` routes, preventing disruptive reloads while editing (especially noticeable with Leaflet map modules)

### 📖 Documentation

- **modules.md:** Added TomTom overview section with shared features, privacy notes and API key setup instructions
- **modules.md:** Step-by-step guide for creating a TomTom API key (register, create key, enable required products)
- **modules.md:** Detailed documentation for all three TomTom modules with options tables and YAML examples

### 📦 Dependencies

- Added `leaflet` and `@types/leaflet` for interactive map rendering

### New files

| File | Purpose |
|------|---------|
| `src/components/service/TomtomEta.vue` | ETA widget component with travel mode icon and formatted arrival time, duration, delay and distance |
| `src/components/service/TomtomEtaMap.vue` | Route map component using Leaflet with TomTom base tiles, traffic flow and incident layers |
| `src/components/service/TomtomTrafficMap.vue` | Traffic map component centered on a location with traffic overlays |
| `src/server/api/services/tomtom-eta.ts` | Server handler for route calculation with geocoding and caching |
| `src/server/api/services/tomtom-eta-map.ts` | Server handler for route calculation with geometry for map display |
| `src/server/api/services/tomtom-traffic-map.ts` | Server handler for location resolution and API key passthrough |

### Changed files

| File | Change |
|------|--------|
| `src/types/services.d.ts` | Added `TomtomEtaService`, `TomtomEtaMapService` and `TomtomTrafficMapService` interfaces |
| `src/components/Item.vue` | Added type-to-component mappings for `tomtom-eta`, `tomtom-eta-map` and `tomtom-traffic-map` |
| `src/composables/useConfigBuilder.ts` | Extended `ServiceType`, `BuilderItem`, `newItem()`, `parseRawItem()` and `serializeItem()` with TomTom module fields |
| `src/components/admin/ItemFields.vue` | Added form fields for all three TomTom module configurations |
| `src/components/admin/TabsEditor.vue` | Added TomTom ETA, TomTom Route and TomTom Traffic to module options and type labels |
| `src/plugins/settings.ts` | Skip `reloadNuxtApp` on admin routes to prevent page reload while editing |
| `package.json` | Added `leaflet` and `@types/leaflet` dependencies |
| `docs/modules.md` | TomTom modules documentation with API key guide, options and examples |

---

## Fix admin dark mode in Firefox / incognito (SSR)

### 🐛 Bug Fixes

- **admin:** Fixed admin pages (login + config builder) rendering in light mode on first visit in Firefox, incognito/private browsing, or any browser without a stored `nuxt-color-mode` cookie — the server now sends `<html class="dark" data-color-mode-forced="dark">` in the initial SSR HTML so the page is dark before any JavaScript runs
- **admin:** The `@nuxtjs/color-mode` inline script (which reads stored preferences) now respects the `data-color-mode-forced` attribute and uses dark mode regardless of what's in localStorage or cookies
- **admin:** `app.vue` no longer overrides the color mode preference on admin routes — previously it reset the admin's dark mode back to the dashboard theme on mount

### Changed files

| File | Change |
|------|--------|
| `src/pages/admin/login.vue` | Added `definePageMeta({ colorMode: 'dark' })` and `useHead({ htmlAttrs: { class: 'dark' } })` for SSR-level dark mode; added `forceColorMode()` helper that sets both `colorMode.preference` and `document.documentElement.classList` directly |
| `src/pages/admin/index.vue` | Same SSR-level dark mode approach; `forceColorMode()` used by the light/dark toggle to ensure immediate class updates |
| `src/app.vue` | Added route guard to skip `colorMode.preference` override on `/admin` routes |

---

## Optional syntax highlighting & admin performance

### ⚡ Performance

- **admin:** Eliminated `watch(state, { deep: true })` which caused Vue to traverse the entire reactive state tree on every keystroke — replaced with native DOM event bubbling (`@input.capture`, `@change.capture`, `@click.capture`) for zero-overhead change detection
- **admin:** YAML generation (`stateToYaml`) and syntax highlighting (`highlightYaml`) are now fully debounced at 400ms — neither function runs during active typing or slider movement
- **admin:** Removed `yamlOutput` computed dependency from the preview pipeline — Save, Copy and Export call `stateToYaml()` on demand instead of maintaining a reactive computed

### 💅 Improvements

- **admin:** Syntax highlighting in the YAML output panel is now optional — toggle on/off via the paint icon button next to "YAML Output"
- **admin:** Highlighting is **off by default** for maximum typing responsiveness; when enabled, a subtle "may slow input" hint is shown
- **admin:** Highlight preference is stored in `localStorage` (`mafl-admin-highlight`) and remembered between sessions
- **admin:** When highlighting is off, `highlightYaml()` is never called — the YAML is rendered as plain text with zero overhead

### Changed files

| File | Change |
|------|--------|
| `src/pages/admin/index.vue` | Added `syntaxHighlight` ref with localStorage persistence; added paint icon toggle button with info hint; conditional `<pre v-html>` (highlighted) vs `<pre>{{ plain }}</pre>` rendering; `updatePreview()` skips `highlightYaml()` when highlighting is off; replaced `watch(state, { deep: true })` with DOM event handlers; replaced `yamlOutput` computed with direct `stateToYaml(state)` calls |

---

## Config import & export in admin

### 🚀 Enhancements

- **admin:** Added Import button — upload a local `.yml` / `.yaml` file to load it into the config builder via file picker
- **admin:** Added Export button — downloads the current YAML output as `config-backup-<timestamp>.yml` for backup purposes
- **admin:** Removed "Load Current Config" button — the server config is already loaded automatically on page open, making the button redundant with the new Import functionality

### 💅 Improvements

- **admin:** Header buttons are now visually grouped with vertical dividers: `[theme] | [Import] [Export] | [Save & Apply] [Reset] | [Dashboard] [Logout]`
- **admin:** Button bar uses `flex-wrap` for better layout on narrower screens

### Changed files

| File | Change |
|------|--------|
| `src/pages/admin/index.vue` | Added Import button with hidden file input and `FileReader` handler; added Export button with `Blob` download; removed "Load Current Config" button and `configLoading` ref; grouped buttons with `<span>` dividers |

---

## Combined image + text logo

### 🚀 Enhancements

- **logo:** Image and text/letter logo can now be displayed simultaneously — select "Image + Text" as Logo Type in Global Settings
- **logo:** The image logo is automatically vertically centered relative to the text logo using flexbox `items-center`
- **admin:** New "Image + Text" option in the Logo Type dropdown shows both the image filename field and all text styling fields at once

### Config format

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

### Changed files

| File | Change |
|------|--------|
| `src/types/config.d.ts` | Added `LogoBoth` interface with `type: 'both'`, `image`, `text` and all text style properties; extended `LogoConfig` union type |
| `src/server/validations/config.ts` | Added `type: 'both'` variant to the logo Zod schema with `image` and `text` required fields |
| `src/composables/useConfigBuilder.ts` | Extended `LogoType` with `'both'`; YAML import/export handles the combined logo format |
| `src/components/admin/GlobalSettings.vue` | Added "Image + Text" option to Logo Type dropdown; image and text fields are shown simultaneously when selected |
| `src/layouts/default.vue` | Added combined logo rendering with `flex items-center` container; image logo is vertically centered next to the text logo |

---

## Remove unused dependencies and VitePress

### 🧹 Chore

- **deps:** Removed `vitepress` and `@hywax/vitepress-yandex-metrika` — VitePress documentation engine is not used by the application; docs are plain markdown files
- **deps:** Removed `h3-zod` — not imported anywhere in the codebase; Zod validation is used directly
- **deps:** Removed `@commitlint/cli` and `@commitlint/config-conventional` — no commitlint configuration exists in the project
- **deps:** Removed `husky` and `lint-staged` — no `.husky/` hooks were configured; the git hook workflow was not wired up
- **scripts:** Removed `docs:dev`, `docs:build`, `docs:preview` scripts (VitePress)
- **scripts:** Removed `"prepare": "husky"` script and `lint-staged` configuration from `package.json`
- **docker:** Added `docs` to `.dockerignore` to exclude documentation files from the build context
- **deps:** Regenerated `yarn.lock` to remove orphaned packages

### Changed files

| File | Change |
|------|--------|
| `package.json` | Removed 7 unused dependencies, 3 docs scripts, husky prepare script and lint-staged config |
| `.dockerignore` | Added `docs` to exclude documentation from Docker build context |
| `yarn.lock` | Regenerated to reflect removed packages |

---

## YAML syntax highlighting in admin editor

### 💅 Improvements

- **admin:** YAML output panel now has syntax highlighting with distinct colors for keys, string values, numbers, booleans, null, comments and punctuation
- **admin:** Highlighting colors are optimized for both dark and light mode — uses a GitHub-inspired color palette with good contrast in each theme

### 🐛 Bug Fixes

- **admin:** Moved initial `colorMode.preference = 'dark'` from `onMounted` to the setup phase — partial fix for first-visit light mode flash (fully resolved in the SSR dark mode fix above)

### New files

| File | Purpose |
|------|---------|
| `src/utils/yamlHighlight.ts` | Lightweight YAML tokenizer that converts plain YAML text to HTML with `yl-key`, `yl-str`, `yl-num`, `yl-bool`, `yl-null`, `yl-comment` and `yl-punct` spans |

### Changed files

| File | Change |
|------|--------|
| `src/pages/admin/index.vue` | Replaced `{{ yamlOutput }}` with `v-html="highlightedYaml"` using the new highlight utility; moved `colorMode.preference = 'dark'` from `onMounted` to setup phase |
| `src/pages/admin/login.vue` | Moved `colorMode.preference = 'dark'` from `onMounted` to setup phase; `onMounted` now only overrides to light if explicitly saved in localStorage |
| `src/assets/style/tailwind.css` | Added `.yaml-hl` token styles for light mode (`:root`) and dark mode (`html.dark`) |

---

## Admin dark mode with user toggle

### 💅 Improvements

- **admin:** Config Builder and login page now default to dark mode — independent of the dashboard theme setting
- **admin:** Added a light/dark toggle button (sun/moon icon) in the Config Builder header so users can switch to light mode if preferred
- **admin:** Theme preference is stored in `localStorage` (`mafl-admin-theme`) and shared between the login and config builder pages
- **admin:** When navigating back to the dashboard, the dashboard theme (`$settings.theme`) is restored automatically
- **admin:** Native form controls (checkboxes, radio buttons, number input spinners) now correctly follow the active theme via `color-scheme` — previously they were always dark even in light mode

### Changed files

| File | Change |
|------|--------|
| `src/pages/admin/index.vue` | Added `colorMode` management with `applyAdminTheme()`, `toggleAdminTheme()`, localStorage persistence, and `onUnmounted` restore; added sun/moon toggle button in header |
| `src/pages/admin/login.vue` | Added `colorMode` management to default to dark and respect stored preference; restores dashboard theme on unmount |
| `src/assets/style/tailwind.css` | Changed `color-scheme: dark` from hardcoded to theme-responsive; added rules for `html.dark`, `html.deep`, `html.bluer` to set `color-scheme: dark` on `.admin-input`, checkboxes, radios and number inputs |

---

## Fix admin login on non-localhost (HTTP)

### 🐛 Bug Fixes

- **admin:** Fixed login failing on remote/Linux hosts accessed over HTTP — the session cookie had `secure: true` based on `NODE_ENV === 'production'`, which caused browsers to reject the cookie on non-HTTPS connections. On `localhost` this worked because browsers treat it as a secure context, but accessing the app via a remote IP or hostname over HTTP silently dropped the cookie after successful password verification
- **admin:** Session cookie `secure` flag is now based on the actual request protocol (`getRequestProtocol` with `xForwardedProto` support) instead of `NODE_ENV` — works correctly for direct HTTP, direct HTTPS, and behind a reverse proxy

### Changed files

| File | Change |
|------|--------|
| `src/server/utils/auth.ts` | `getSessionConfig()` now accepts the `H3Event` and uses `getRequestProtocol(event, { xForwardedProto: true })` to set `secure: proto === 'https'` instead of `secure: process.env.NODE_ENV === 'production'` |
| `docker-compose.yml` | Quoted environment variable values to prevent YAML parser issues with `:` in hash values |

---

## Reset button confirmation with timer bar

### 💅 Improvements

- **admin:** Reset button now requires a two-step confirmation — first click shows "Click again to reset" with a 5-second countdown timer bar, second click within the timer confirms the reset
- **admin:** Visual timer bar shrinks from left to right over 5 seconds, providing clear feedback on the remaining confirmation window
- **admin:** If no second click occurs within 5 seconds, the button returns to its normal "Reset" state without any action

### Changed files

| File | Change |
|------|--------|
| `src/pages/admin/index.vue` | Replaced `confirm()` dialog with inline two-step confirmation; added `resetConfirming` state, `cancelResetConfirm()` timer logic, animated `.reset-timer-bar` CSS with `v-bind(resetTimeoutCss)` duration |

---

## Dynamic PWA manifest from app title

### 🚀 Enhancements

- **pwa:** PWA name now uses the app title configured in `/admin` (Global Settings → Title) instead of a hardcoded string — the manifest is served dynamically so changes take effect without a rebuild
- **pwa:** Created a Nitro server route at `/manifest.webmanifest` that reads the current config title and returns a complete PWA manifest with `name`, `short_name`, `start_url`, `display`, icons and theme color

### Changed files

| File | Change |
|------|--------|
| `src/server/routes/manifest.webmanifest.get.ts` | New server route that dynamically generates the PWA manifest using the configured app title from `config.yml` |
| `nuxt.config.ts` | Set `manifest: false` to disable static manifest generation; added `<link rel="manifest">` to app head pointing to the dynamic route; removed `registerWebManifestInRouteRules` |
| `src/app.vue` | Removed `<NuxtPwaManifest />` component (no longer needed since manifest link is in the head config) |

---

## Config Builder feature parity with /admin editor

### 🚀 Enhancements

- **config-builder:** Added global Card Style section to Styles — matches the admin's `styles.card` editor with background color, opacity, blur (glassmorphism), border (width, style, color, radius) and padding
- **config-builder:** Added per-group Card Style Override — each group now has a "card" toggle button that opens a collapsible panel with all card style fields and a reset button, matching the admin's per-group override
- **config-builder:** Added Tab locked/hidden toggles — each tab now shows "visible/hidden" and "lock/unlock" buttons matching the admin's eye and lock icons
- **config-builder:** Locked tabs protect their groups and items from deletion (remove buttons hidden)
- **config-builder:** Added "Browse icons" links for the name icon type — links to [iconify.design](https://icon-sets.iconify.design/) and [getemoji.com](https://getemoji.com/), matching the admin's icon browse links
- **config-builder:** Full YAML round-trip for all new fields — `locked`, `hidden`, `styles.card`, and per-group `card` are generated, imported, and reset correctly

### Changed files

| File | Change |
|------|--------|
| `config-builder/index.html` | Added `emptyCardStyle()`, `serializeCardStyle()`, `parseCardStyle()` helpers; added `renderCardStyleFields()` for global card UI; added `renderGroupCardPanel()` for per-group card override; added `toggleTabLock()`, `toggleTabHidden()`, `toggleGroupCard()`, `resetGroupCard()` functions; updated `addTab` with `locked`/`hidden`, `addGroup` with `card`; updated `renderTabs` with lock/hidden buttons, `renderGroup` with card toggle and panel, `renderItem` with locked-aware delete and icon browse links; updated `generateYaml` for `styles.card`, `tab.locked/hidden`, `group.card`; updated `loadConfig` with `parseCardStyle` and `loadCardStyleToUI`; updated `resetAll` for card state |

---

## Group card styling

### 🚀 Enhancements

- **styles:** Service groups (categories) can now be wrapped in styled cards with configurable background color, opacity, glassmorphism blur, border (width, style, color), border radius and padding
- **styles:** Global default card style via `styles.card` — applies to all groups automatically
- **styles:** Per-group card override via `card` key inside each service group — fully replaces the global default when set
- **styles:** Glassmorphism blur effect (`blur` property) using `backdrop-filter` for a frosted glass appearance over the background image
- **admin:** Global card style editor in the Styles section with color pickers, opacity slider, blur slider (0–30px), border controls, radius and padding
- **admin:** Per-group "card" toggle button in the Tabs & Services editor with collapsible card style override panel and reset button

### Config format

```yaml
# Global default (applies to all groups)
styles:
  card:
    backgroundColor: "#1a1a2e"
    opacity: 0.8
    blur: 10px
    borderWidth: "1px"
    borderStyle: solid
    borderColor: "rgba(255,255,255,0.2)"
    borderRadius: 0.5rem
    padding: 1rem

# Per-group override (replaces global for this group)
services:
  NEWS:
    display: list
    card:
      backgroundColor: "#2a2a3e"
      opacity: 0.6
    items:
      - title: NOS
        link: https://nos.nl
```

### Changed files

| File | Change |
|------|--------|
| `src/types/config.d.ts` | Added `CardStyle` interface with `backgroundColor`, `opacity`, `blur`, `borderWidth`, `borderStyle`, `borderColor`, `borderRadius`, `padding`; added `card?: CardStyle` to `ServicesGroup` and `Styles` |
| `src/server/validations/config.ts` | Added `cardStyleSchema` with Zod validators; added to `stylesSchema` and `servicesGroupSchema` |
| `src/server/utils/config.ts` | `parseRawServices()` passes `card` field through; `getDefaultConfig()` includes empty `card` in styles |
| `src/components/Group.vue` | Added card rendering with absolute-positioned background div for opacity/blur separation; `hexToRgba` conversion to avoid CSS opacity reducing blur; merge logic uses per-group override when present, otherwise global default |
| `src/composables/useConfigBuilder.ts` | Added `BuilderCardStyle` interface, `emptyCardStyle()`, `parseCardStyle()`, `serializeCardStyle()`; card fields on `BuilderGroup` and `BuilderState.styles`; YAML import/export |
| `src/components/admin/StylesSettings.vue` | Global card style editor with color pickers, opacity and blur sliders, border and padding fields |
| `src/components/admin/TabsEditor.vue` | Per-group card toggle button, collapsible override panel with all card fields, reset button to clear overrides |
| `README.md` | Documented card styling feature with YAML examples and property table |

---

## Deep linking to tabs via URL hash

### 🚀 Enhancements

- **frontpage:** Tabs can now be linked directly using a URL hash fragment (e.g. `/#personal`, `/#my-work`)
- **frontpage:** Clicking a tab updates the URL hash without page reload
- **frontpage:** Opening a URL with a tab hash automatically activates the corresponding tab
- **frontpage:** Browser back/forward navigation between tabs is supported via `hashchange` listener

### Changed files

| File | Change |
|------|--------|
| `src/layouts/default.vue` | Added `slugify`, `findTabIndexByHash`, `setTabFromHash`, and `selectTab` functions; tab click now calls `selectTab` which updates the URL hash; `onMounted` reads the hash to set the initial tab; `hashchange` event listener added |

---

## Hide tab bar when only one tab

### 🚀 Enhancements

- **frontpage:** Tab navigation bar is now automatically hidden when only a single tab is configured — the tab's services are displayed directly without unnecessary UI clutter

### Changed files

| File | Change |
|------|--------|
| `src/layouts/default.vue` | Changed `v-if="tabs.length > 0"` to `v-if="tabs.length > 1"` so the tab bar only appears with 2+ tabs |

---

## Hide tabs from frontpage

### 🚀 Enhancements

- **admin:** Tabs can now be hidden from the frontpage — they remain in the config but are not visible to users
- **admin:** Added an eye icon toggle in the Tabs & Services section (open eye = visible, crossed-out eye = hidden)
- **config:** `hidden: true` property is persisted in the YAML config and restored on load
- **frontpage:** Hidden tabs are filtered out of the tab navigation and service display

### Changed files

| File | Change |
|------|--------|
| `src/types/config.d.ts` | Added `hidden?: boolean` to the `Tab` interface |
| `src/composables/useConfigBuilder.ts` | Added `hidden` to `BuilderTab`; added `toggleTabHidden` function; YAML import/export handles `hidden` |
| `src/components/admin/TabsEditor.vue` | Added eye icon toggle button with visible/hidden states; accepts `toggleTabHidden` prop |
| `src/pages/admin/index.vue` | Destructured and passed `toggleTabHidden` to `AdminTabsEditor` |
| `src/plugins/settings.ts` | Filters hidden tabs before providing them to the app |
| `src/layouts/default.vue` | Uses only visible tabs for the tab navigation |
| `src/server/utils/config.ts` | Passes `hidden` property through when loading config from YAML |
| `src/server/validations/config.ts` | Added `hidden: z.boolean().optional()` to the tab validation schema |

---

## Simplified secret generation with maflpass

### 📖 Docs

- **admin:** Replaced manual `node:22-alpine` one-liners for generating `NUXT_ADMIN_PASSWORD_HASH` and `NUXT_SESSION_PASSWORD` with the dedicated [`maflpass`](https://github.com/R0GGER/maflpass) Docker utility — no local Node.js or OpenSSL required

### 🔧 Chore

- Added `.gitattributes` with `* text=auto eol=lf` to enforce consistent LF line endings across all platforms

### Changed files

| File | Change |
|------|--------|
| `docs/admin.md` | Steps 1 & 2 now use `ghcr.io/r0gger/maflpass` commands instead of inline Node.js scripts; removed OpenSSL alternative |
| `.gitattributes` | New file — enforces LF line endings for all text files |

---

## Tab lock & collapsible tabs

### 🚀 Enhancements

- **admin:** Tabs can now be locked to prevent accidental deletion — a locked tab hides the delete button and ignores `removeTab` calls
- **admin:** Locking a tab also protects its categories and bookmarks — delete buttons for groups and items are hidden and `removeGroup`/`removeItem` are guarded
- **admin:** Tabs are now collapsible in the Config Builder — click the ▸/▾ arrow to expand or collapse a tab's content
- **config:** `locked: true` property is persisted in the YAML config and restored on load

### Changed files

| File | Change |
|------|--------|
| `src/composables/useConfigBuilder.ts` | Added `locked` to `BuilderTab` interface; `removeTab` guards against locked tabs; added `toggleTabLock` function; YAML import/export handles `locked` |
| `src/components/admin/TabsEditor.vue` | Added collapsible tab body with ▸/▾ toggle; added minimal SVG lock icon button; hide delete button when locked; accepts `toggleTabLock` prop |
| `src/pages/admin/index.vue` | Destructured and passed `toggleTabLock` to `AdminTabsEditor` |

---

## Auto-fill favicon domain from link

### 💅 Improvements

- **admin:** When the icon type is set to "favicon", the domain field is now automatically populated from the link URL — strips `http://` / `https://` and extracts the hostname (e.g. `https://netflix.com/browse` → `netflix.com`)
- **admin:** Switching icon type to "favicon" also auto-fills the domain if a link is already present and the favicon field is empty

### Changed files

| File | Change |
|------|--------|
| `src/components/admin/ItemFields.vue` | Added `extractDomain()` helper and watchers on `item.link` and `item.iconType` to auto-populate `item.iconFavicon` |

---

## Browse icons links for name icon type

### 💅 Improvements

- **admin:** Added "Browse icons" links below the Name icon field — links to [iconify.design](https://icon-sets.iconify.design/) for Iconify icon names and [getemoji.com](https://getemoji.com/) for emoji, matching the existing link style used under the URL icon field

### Changed files

| File | Change |
|------|--------|
| `src/components/admin/ItemFields.vue` | Added browse links (iconify.design, getemoji.com) below the Name/Color/wrap row in the `name` icon type section |

---

## Reorder groups (categories)

### 🚀 Enhancements

- **admin:** Groups (categories) can now be moved up or down within a tab using ▲ / ▼ buttons, matching the existing item reorder controls
- **config-builder:** Same move up/down functionality added to the standalone Config Builder

### Changed files

| File | Change |
|------|--------|
| `src/composables/useConfigBuilder.ts` | Added `moveGroup()` function that swaps adjacent groups in the array |
| `src/pages/admin/index.vue` | Destructured `moveGroup` from composable and passed it as prop to `AdminTabsEditor` |
| `src/components/admin/TabsEditor.vue` | Added `moveGroup` prop definition and ▲ ▼ buttons to the group header row |
| `config-builder/index.html` | Added `moveGroup()` function and ▲ ▼ buttons in the standalone builder |

---

## Example config on first run

### 🚀 Enhancements

- **docker:** On first container start, if no `config.yml` exists in the data volume, the example config (`.example/config.yml`) is automatically copied as the initial config
- **docker:** Existing `config.yml` is never overwritten — only new installations receive the example

### 🐛 Bug Fixes

- **docker:** Fixed `entrypoint.sh` failing with `no such file or directory` on Alpine — the script had Windows CRLF line endings which corrupted the shebang; rewritten with LF endings and added `sed -i 's/\r$//'` in the Dockerfile as a safeguard

### New files

| File | Purpose |
|------|---------|
| `extra/entrypoint.sh` | Entrypoint script that copies the example config when `/app/data/config.yml` is missing, then starts the app |

### Changed files

| File | Change |
|------|--------|
| `Dockerfile` | Copies entrypoint script and example config into the image; uses `ENTRYPOINT` instead of `CMD` |

---

## Fix category title color opacity

### 🐛 Bug Fixes

- **styles:** Category titles in inline/list view appeared faded instead of using the exact configured color — removed hardcoded `opacity-80` Tailwind class from the `<h2>` element so the `color` from `styles.category` is rendered at full opacity

### Changed files

| File | Change |
|------|--------|
| `src/components/Group.vue` | Removed `opacity-80` class from the inline category `<h2>` element |

---

## Fix admin logout button

### 🐛 Bug Fixes

- **admin:** Fixed logout button not working — replaced client-side `navigateTo` with a hard navigation (`window.location.href`) to ensure the session cookie is properly cleared and no async context issues prevent the redirect

### Changed files

| File | Change |
|------|--------|
| `src/pages/admin/index.vue` | Changed `navigateTo('/admin/login')` to `window.location.href = '/admin/login'` in the logout function |

---

## Fix tab/content width shift

### 🐛 Bug Fixes

- **layout:** Fixed container width jumping when switching between tabs with different amounts of content
- **layout:** Added `w-full` to main container so it always takes full available width regardless of tab content
- **style:** Added `scrollbar-gutter: stable` to prevent layout shift from scrollbar appearing/disappearing

### Changed files

| File | Change |
|------|--------|
| `src/layouts/default.vue` | Added `w-full` class to container div |
| `src/assets/style/tailwind.css` | Added `scrollbar-gutter: stable` on `html` |

---

## Browse icons link styling

### 💅 Improvements

- **admin:** "Browse icons" links (`selfh.st/icons`, `dashboardicons.com`) now use a green color (`rgb(124 180 132)`) so they are clearly recognisable as clickable links

### Changed files

| File | Change |
|------|--------|
| `src/components/admin/ItemFields.vue` | Green link color for icon reference links |

---

## Timezone → Time rename

### 💅 Refactors

- **module:** Renamed service type from `timezone` to `time` — `type: timezone` still works for backward compatibility via alias in `useServiceData`
- **types:** Renamed `TimezoneService` interface to `TimeService`
- **docs:** Updated all documentation and examples to use `type: time`
- **config-builder:** Updated module type labels and serialization to use `time`

### Changed files

| File | Change |
|------|--------|
| `src/types/services.d.ts` | `TimezoneService` → `TimeService` |
| `src/components/service/Timezone.vue` | Uses `TimeService` type |
| `src/server/api/services/timezone.ts` | Uses `TimeService` type |
| `src/components/Item.vue` | Accepts both `time` and `timezone` type |
| `src/composables/useServiceData.ts` | Added `time → timezone` alias so the API route stays unchanged |
| `config-builder/index.html` | Module type updated to `time` |
| `docs/modules.md` | All `timezone` references replaced with `time` |

---

## Admin Panel

### 🚀 Enhancements

- **admin:** Built-in admin panel at `/admin` for editing `config.yml` directly from the browser — changes are saved and applied instantly
- **admin:** Secure login with scrypt password hashing and encrypted sessions via `NUXT_ADMIN_PASSWORD_HASH` and `NUXT_SESSION_PASSWORD` environment variables
- **admin:** Collapsible sections for Global Settings, Layout, Styles, Tabs, Tags and per-item editing
- **admin:** Live preview of text logo in the Global Settings section
- **admin:** Route guard middleware redirects unauthenticated users to `/admin/login`
- **admin:** PWA `navigateFallbackDenylist` updated to exclude `/admin` routes from service worker caching

### New files

| File | Purpose |
|------|---------|
| `src/pages/admin/index.vue` | Admin dashboard page with config editor |
| `src/pages/admin/login.vue` | Admin login page |
| `src/middleware/admin.ts` | Auth route guard for admin pages |
| `src/components/admin/GlobalSettings.vue` | Global settings editor (title, theme, logo, background, etc.) |
| `src/components/admin/ItemFields.vue` | Per-item editor (link, icon, status, tags, module options) |
| `src/components/admin/LayoutSettings.vue` | Grid/list layout and spacing editor |
| `src/components/admin/StylesSettings.vue` | Typography styles editor (category, title, description) |
| `src/components/admin/TabsEditor.vue` | Tabs and service groups editor |
| `src/components/admin/TagsEditor.vue` | Tags editor |
| `src/composables/useConfigBuilder.ts` | Shared composable for config state, YAML import/export |
| `src/server/api/admin/config.get.ts` | GET endpoint — reads current config |
| `src/server/api/admin/config.post.ts` | POST endpoint — validates and saves config |
| `src/server/api/admin/login.post.ts` | POST endpoint — authenticates and creates session |
| `src/server/api/admin/logout.post.ts` | POST endpoint — destroys session |
| `src/server/api/admin/session.get.ts` | GET endpoint — checks session validity |
| `src/server/utils/auth.ts` | Scrypt password verification and session helpers |
| `scripts/hash-password.mjs` | CLI script to generate password hashes |

### Changed files

| File | Change |
|------|--------|
| `nuxt.config.ts` | Added `runtimeConfig` for `adminPasswordHash` and `sessionPassword`; added `/admin` to PWA `navigateFallbackDenylist` |
| `src/assets/style/tailwind.css` | Added admin builder shared styles (`.admin-section`, `.admin-label`, `.admin-input`, `.chevron`) |
| `docker-compose.yml` | Added `NUXT_ADMIN_PASSWORD_HASH` and `NUXT_SESSION_PASSWORD` environment variables |
| `.example/docker-compose.yml` | Added environment variables with generation instructions |
| `README.md` | Added admin environment variables to the quick-start docker-compose example |
| `docs/configuration.md` | Added Admin Panel reference with link to `admin.md` |
| `docs/admin.md` | New documentation page with setup instructions |

---

## IP API: optional locationName & deduplicate place

### ✨ Features

- **ip-api:** Added optional `locationName` option — when omitted, location is auto-detected from the IP address; when set, the custom name is displayed instead

### 🐛 Bug Fixes

- **ip-api:** Fixed duplicate location display (e.g. "Utrecht, Utrecht") when city and region name are identical

### Changed files

| File | Change |
|------|--------|
| `src/types/services.d.ts` | Added `locationName?: string` to `IpApiService.options` |
| `src/server/api/services/ip-api.ts` | Use `locationName` when provided, fallback to IP-based place; deduplicate city/region |
| `src/components/admin/ItemFields.vue` | Added Location Name input field for IP API |
| `src/composables/useConfigBuilder.ts` | Added `ipapiLocationName` to builder state, import/export |
| `config-builder/index.html` | Added Location Name field + serialization logic |
| `docs/modules.md` | Documented `locationName` option with example |

---

## Favicon proxy cache

### 🚀 Enhancements

- **favicon:** Added server-side favicon proxy with disk caching — external favicon API is now called only once per domain per 7 days
- **favicon:** The `faviconApi` setting is read dynamically from the config (no more hardcoded URL in the frontend)
- **favicon:** Browser receives `Cache-Control: public, max-age=604800` headers for local caching
- **favicon:** Added Workbox `CacheFirst` runtime caching for `/api/favicon/*` so favicons also work offline via the Service Worker

### Changed files

| File | Change |
|------|--------|
| `src/server/api/favicon/[...domain].get.ts` | New server-side proxy endpoint with disk cache in `./data/.favicon-cache/` |
| `src/components/service/base/Icon.vue` | Points to `/api/favicon/{domain}` instead of the external API directly |
| `nuxt.config.ts` | Added Workbox `runtimeCaching` rule for favicon endpoint |

---

## UI improvements: Uptime monitoring, Tags & Wrap checkbox

### 🚀 Enhancements

- **admin + config-builder:** Renamed "Status enabled" to "Uptime monitoring ☐ enabled" for clarity
- **admin + config-builder:** Moved Tags input to its own row below the Uptime monitoring checkbox
- **admin + config-builder:** Wrap checkbox now matches the height of adjacent input fields (styled with border and padding)
- **admin + config-builder:** All checkboxes (Wrap, Uptime monitoring) now use the brand green accent color (`#69a870`)

### Changed files

| File | Change |
|------|--------|
| `src/components/admin/ItemFields.vue` | Renamed status checkbox, moved Tags to separate row, styled Wrap and Uptime checkboxes |
| `config-builder/index.html` | Same layout and styling changes in the standalone config builder |
| `src/assets/style/tailwind.css` | Added `accent-color` to `.admin-input` |

---

## Admin setup documentation

### 📖 Documentation

- **admin.md:** Rewrote the setup section with a summary table of required environment variables, step-by-step generation instructions, and multiple methods per step (Docker one-liner, local Node.js script, OpenSSL)
- **admin.md:** Added example output so users know what to expect from each command
- **docker-compose.yml:** Updated inline comments with copy-pasteable Docker commands for generating the password hash and session key

### Changed files

| File | Change |
|------|--------|
| `docs/admin.md` | Rewritten setup section with detailed generation instructions |
| `.example/docker-compose.yml` | Inline comments now include Docker one-liner commands |

---

## Text / letter logo support

### 🚀 Enhancements

- **logo:** Added text/letter logo as alternative to image logo — display any text string (e.g. "M+") with full typographic control
- **logo:** Text logo supports `fontSize`, `fontWeight`, `fontFamily`, `color`, `backgroundColor`, `borderRadius` and `padding`
- **logo:** Backward compatible — existing `logo: logo.png` string format continues to work as an image logo
- **config-builder:** Logo Type selector (None / Image / Text) with conditional fields in the standalone config builder (`config-builder/index.html`)
- **config-builder:** Live preview of text logo in both standalone and onsite (`/admin`) config builders
- **admin:** Logo Type dropdown with conditional image or text logo settings in the onsite admin panel

### 💅 Refactors

- **types:** Added `LogoText`, `LogoImage` interfaces and `LogoConfig` union type (`string | LogoImage | LogoText`) to `config.d.ts`
- **validation:** `logo` schema now accepts a string (backward compat), `{ type: 'image', image }` or `{ type: 'text', text, ... }` object
- **default.vue:** Logo rendering split into `logoImage` and `logoText` computed refs with conditional `<img>` or `<span>` element
- **useConfigBuilder:** `BuilderState` replaced single `logo` field with `logoType`, `logoImage`, `logoText` and font/style fields; YAML import/export handles both formats
- **config-builder:** Standalone HTML builder updated with `toggleLogoFields()` / `updateLogoPreview()` helpers and logo-aware `generateYaml()`, `loadConfig()`, `resetAll()`

### 📖 Documentation

- **configuration.md:** Logo section rewritten with separate "Image logo" and "Text / letter logo" subsections, including YAML example and property table

### Config format

```yaml
# Image logo (unchanged)
logo: logo.png

# Text logo (new)
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

### Changed files

| File | Change |
|------|--------|
| `src/types/config.d.ts` | Added `LogoText`, `LogoImage`, `LogoConfig` types |
| `src/server/validations/config.ts` | Logo schema accepts string or object |
| `src/server/utils/config.ts` | Default config unchanged (empty string = no logo) |
| `src/layouts/default.vue` | Conditional image/text logo rendering |
| `src/composables/useConfigBuilder.ts` | Logo state split into typed fields |
| `src/components/admin/GlobalSettings.vue` | Logo type selector + conditional fields + preview |
| `config-builder/index.html` | Logo type selector + fields + preview + YAML generation |
| `docs/configuration.md` | Rewritten logo documentation |

---

## Logo viewport threshold

### 🚀 Enhancements

- **logo:** Logo in the top-left corner is now only visible on screens wider than 1640px (hidden on 1640px or smaller)
- **logo:** Visibility is reactive to window resize via `window.innerWidth` listener, so the logo appears/disappears live when the browser is resized across the threshold

### 💅 Refactors

- **default.vue:** Replaced Tailwind responsive classes (`hidden sm:block`) with a JS-driven `showLogo` computed ref to ensure exact 1640px breakpoint and avoid relying on Tailwind's arbitrary breakpoint quirks
- **default.vue:** Removed responsive size utilities (`h-6 sm:h-7 md:h-8`, `top-5 left-5 sm:top-6 sm:left-6`) since the logo only renders above 1640px — uses a single `h-8`, `top-6 left-6` instead

---

## New modules, footer and config builder updates

### 🚀 Enhancements

- **module: time** — Live clock widget showing current time and date for any IANA timezone, with optional country flag icon and configurable time/date formats
- **module: datetime-weather** — Combined live clock and weather widget using OpenWeatherMap, with configurable timezone, time format and date format
- **module: greeting** — Simple widget displaying a custom greeting message with optional subtitle
- **module: custom-html** — Renders arbitrary HTML content inside a service card, with a `hidden` option for invisible elements (e.g. tracking pixels)
- **module: openweathermap** — Updated layout: title now shows `Place: Temp °C`, description shows weather only
- **layout: span** — Any service item can now span multiple grid columns via the `span` property
- **layout: footer** — Global footer section with configurable `text` and `html` content, rendered at the bottom of the page
- **composable: useDateFormat** — Shared date formatting composable with seven formats: `short`, `medium`, `long`, `eu`, `compact`, `short-eu`, `iso`
- **config-builder** — Added form fields for Time, DateTime Weather, Greeting, Custom HTML modules
- **config-builder** — Added span field to all grid service items
- **config-builder** — Added Footer section for text and HTML content
- **config-builder** — Added Wiki button linking to wiki.maflplus.eu
- **config-builder** — Updated Load Example with new module examples

### 🩹 Fixes

- **custom-html** — `<script>` tags now execute correctly; Vue's `v-html` uses `innerHTML` which browsers block from running scripts, so the component now dynamically creates script elements via `document.createElement` to ensure execution (e.g. analytics snippets)
- **time/datetime-weather** — Date and time now respect the `lang` setting from config.yml instead of using the browser locale
- **datetime-weather** — Date and time fit on a single line by defaulting to 24-hour format
- **date format: eu** — Manually constructed to ensure European day-month order (`Sat 16 May 2026`) instead of US-style (`Sat, May 16, 2026`)

### 💅 Refactors

- **types** — Added `TimeService`, `DatetimeWeatherService`, `GreetingService`, `CustomHtmlService` interfaces to `services.d.ts`
- **types** — Added `span` to the base `Service` interface
- **types** — Added `Footer` interface to `config.d.ts`
- **validation** — Extended `serviceSchema` with `span` field and `configSchema` with `footer`
- **Item.vue** — Added type-to-component mappings for `time`, `datetime-weather`, `greeting`, and `custom-html`
- **Group.vue** — Grid items with `span > 1` are wrapped in a div with `grid-column: span N`
- **default.vue** — Layout uses `flex flex-col` and renders the `Footer` component

### 📖 Documentation

- **modules.md** — New documentation page covering all modules (Time, DateTime Weather, Greeting, Custom HTML), date formats, grid span, and footer

### New files

| File | Purpose |
|------|---------|
| `src/components/service/Timezone.vue` | Time widget component |
| `src/components/service/DatetimeWeather.vue` | DateTime Weather widget component |
| `src/components/service/Greeting.vue` | Greeting widget component |
| `src/components/service/CustomHtml.vue` | Custom HTML widget component |
| `src/components/Footer.vue` | Footer component |
| `src/composables/useDateFormat.ts` | Shared date formatting composable |
| `src/server/api/services/timezone.ts` | Time API handler |
| `src/server/api/services/datetime-weather.ts` | DateTime Weather API handler (OWM) |
| `src/server/api/services/greeting.ts` | Greeting API handler |
| `src/server/api/services/custom-html.ts` | Custom HTML API handler |
| `docs/modules.md` | Module documentation |

---

## Fork and modifications

> Independent fork by [@R0GGER](https://github.com/R0GGER) — not affiliated with upstream [hywax/mafl](https://github.com/hywax/mafl).

### 🏡 Chore

- **repo:** Renamed repository from `mafl` to `maflplus` and updated references across all relevant files
- **demo:** Published live demo at [maflplus.eu](https://maflplus.eu)
- **config-builder:** Published Config Builder at [config.maflplus.eu](https://config.maflplus.eu)

### 🚀 Enhancements

- **logo:** Fixed responsive logo in the top-left corner, served from the data volume; hidden on mobile
- **layout:** Responsive grid with up to 12 columns (`small` / `medium` / `large` / `xlarge`)
- **layout:** List display mode per group with separate column configuration
- **layout:** Dynamic container width based on configured column count
- **layout:** Responsive gap scaling for grid and list views (`gap-2 lg:gap-4 xl:gap-6`)
- **layout:** Configurable spacing between groups (`group`) and items (`item`)
- **styles:** Per-element styling for category headers, titles and descriptions (`color`, `fontSize`, `fontWeight`, `fontStyle`, `fontFamily`, `textDecoration`)
- **background:** Full-screen background image served from the data volume
- **background:** Color overlay with configurable color and opacity (`backgroundOverlay`)
- **tabs:** Organise services into switchable tabs, each with its own name and icon
- **search:** Search bar that filters bookmarks across all tabs with keyboard shortcuts (`/`, `Ctrl+K`)
- **search:** Web search fallback to Google or DuckDuckGo (`searchProvider`)
- **icons:** Retrieve service icons automatically via a configurable favicon API (`faviconApi`)
- **icons:** Favicon icon type — reference a domain to auto-fetch its icon (`icon.favicon`)
- **status:** Align status indicator to `left` or `right` (default) per service (`status.position`)
- **display:** Grid and list display modes per service group (`display: grid | list`)
- **config-builder:** Logo field in General settings
- **config-builder:** List column configuration alongside grid columns
- **config-builder:** OpenWeatherMap widget support (lat, lon, units, API key)
- **config-builder:** IP API widget support (with flag icon toggle)
- **config-builder:** Load example configuration with one click
- **config-builder:** Remember open/collapsed item panels across re-renders

### 🩹 Fixes

- **assets:** Serve background images and local assets from the data volume via `/api/assets/`
- **layout:** Center content with dynamic `maxWidth` instead of fixed `max-w-screen-2xl`
- **docker:** Removed stray slash in volume mount path (`favicons://` → `favicons:/`)
- **docker:** Simplified volume mapping to mount full data directory (`./mafl:/app/data`)

### 📖 Documentation

- **logo:** Added Logo section to README and configuration docs
- **openweathermap:** Dedicated documentation page for the OpenWeatherMap widget
- **ip-api:** Dedicated documentation page for the IP API widget
- **configuration:** Improved formatting of the demo config section

### 💅 Refactors

- **config:** Extended config schema with `logo`, `background`, `backgroundOverlay`, `faviconApi`, `styles`, `layout.list`, `layout.spacing`, `searchProvider` and `tabs`
- **config:** Default layout now includes separate grid and list column defaults
- **config-builder:** Extracted `newItem()` and `parseRawItem()` helpers to reduce duplication
- **settings:** Plugin provides `$tabs`, `$activeTabIndex` and `$activeServices` for tab switching
- **layout:** Default layout renders search bar, tab navigation and section-based grid/list grouping
- **services:** `ListItem` component for compact list rows with icon, title and status

### 🏡 Chore

- **docker:** Image published to `ghcr.io/r0gger/maflplus` via GitHub Actions
- **docker:** Added local `build` block to `docker-compose.yml` for development
- **updates:** Check updates temporarily disabled

## v0.15.4

[compare changes](https://github.com/hywax/mafl/compare/v0.15.3...v0.15.4)

### 🚀 Enhancements

- Gr-GR locale ([#122](https://github.com/hywax/mafl/pull/122))
- De-DE locale ([#124](https://github.com/hywax/mafl/pull/124))

### 📖 Documentation

- **showcase:** By @crueber ([#116](https://github.com/hywax/mafl/pull/116))
- **showcase:** Crueber image ([a55b9d7](https://github.com/hywax/mafl/commit/a55b9d7))
- German and greek locale ([a2a761d](https://github.com/hywax/mafl/commit/a2a761d))

### 🏡 Chore

- Update CONTRIBUTORS ([2fc0498](https://github.com/hywax/mafl/commit/2fc0498))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))
- Gehno ([@gehno](http://github.com/gehno))
- Stratos ([@sthivaios](http://github.com/sthivaios))
- Bot ([@hywax-assistant](http://github.com/hywax-assistant))

## v0.15.3

[compare changes](https://github.com/hywax/mafl/compare/v0.15.2...v0.15.3)

### 🩹 Fixes

- Home page translation key was missing ([981e02c](https://github.com/hywax/mafl/commit/981e02c))

### 📖 Documentation

- **showcase:** By @AemonCao ([#113](https://github.com/hywax/mafl/pull/113))
- Fix image path ([4dbe8a2](https://github.com/hywax/mafl/commit/4dbe8a2))

### 🏡 Chore

- **i18n:** Update zh-CN ([#109](https://github.com/hywax/mafl/pull/109))
- Update CONTRIBUTORS ([42a3e9a](https://github.com/hywax/mafl/commit/42a3e9a))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))
- Bot ([@hywax-assistant](http://github.com/hywax-assistant))
- Aemon Cao <bot960528@gmail.com>

## v0.15.2

[compare changes](https://github.com/hywax/mafl/compare/v0.15.1...v0.15.2)

### 🚀 Enhancements

- **themes:** New theme bluer ([ca4b6c3](https://github.com/hywax/mafl/commit/ca4b6c3))
- **templates:** Unraid ([#102](https://github.com/hywax/mafl/pull/102))
- **templates:** Portainer ([4dbe901](https://github.com/hywax/mafl/commit/4dbe901))
- **templates:** Docker-compose ([dc98917](https://github.com/hywax/mafl/commit/dc98917))

### 💅 Refactors

- Rename templates folder ([89f0ded](https://github.com/hywax/mafl/commit/89f0ded))

### 📖 Documentation

- **showcase:** By @UberDudePL ([6601f4d](https://github.com/hywax/mafl/commit/6601f4d))
- Apply script style ([ac38775](https://github.com/hywax/mafl/commit/ac38775))
- **themes:** Add value bluer ([d36df53](https://github.com/hywax/mafl/commit/d36df53))

### 🏡 Chore

- Provide all lang to config ([c1ed2ce](https://github.com/hywax/mafl/commit/c1ed2ce))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.15.1

[compare changes](https://github.com/hywax/mafl/compare/v0.15.0...v0.15.1)

### 🩹 Fixes

- Healthcheck exec failed ([410ccf8](https://github.com/hywax/mafl/commit/410ccf8))

### 📖 Documentation

- Fix showcases ([49fc44d](https://github.com/hywax/mafl/commit/49fc44d))

### 📦 Build

- Change opencontainers labels ([d6c32d5](https://github.com/hywax/mafl/commit/d6c32d5))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.15.0

[compare changes](https://github.com/hywax/mafl/compare/v0.14.0...v0.15.0)

### 🚀 Enhancements

- ⚠️  Docker health check (#92, #93) ([#92](https://github.com/hywax/mafl/issues/92), [#93](https://github.com/hywax/mafl/issues/93))

### 📖 Documentation

- Proxmox file volumes ([#96](https://github.com/hywax/mafl/pull/96))
- Fix proxmox file volumes ([0891abd](https://github.com/hywax/mafl/commit/0891abd))

#### ⚠️ Breaking Changes

- ⚠️  Docker health check (#92, #93) ([#92](https://github.com/hywax/mafl/issues/92), [#93](https://github.com/hywax/mafl/issues/93))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))
- Alexander ([@hywax](http://github.com/hywax))

## v0.14.0

[compare changes](https://github.com/hywax/mafl/compare/v0.13.0...v0.14.0)

### 🚀 Enhancements

- ⚠️  Ability to change the application grid ([#49](https://github.com/hywax/mafl/pull/49), [#91](https://github.com/hywax/mafl/pull/91))

### 💅 Refactors

- Contributors format ([53dee14](https://github.com/hywax/mafl/commit/53dee14))

### 🏡 Chore

- Websocket log ([e0398c0](https://github.com/hywax/mafl/commit/e0398c0))

#### ⚠️ Breaking Changes

- ⚠️  Ability to change the application grid ([#49](https://github.com/hywax/mafl/pull/49), [#91](https://github.com/hywax/mafl/pull/91))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))
- Alexander ([@hywax](http://github.com/hywax))

## v0.13.0

[compare changes](https://github.com/hywax/mafl/compare/v0.12.0...v0.13.0)

### 🚀 Enhancements

- ⚠️  Status indicator operation for all url types ([#87](https://github.com/hywax/mafl/pull/87))

### 💅 Refactors

- Contributors format ([0b7426d](https://github.com/hywax/mafl/commit/0b7426d))

### 📖 Documentation

- Proxmox memory error ([#89](https://github.com/hywax/mafl/pull/89))

### 🏡 Chore

- Feature pull request template ([eb50f0e](https://github.com/hywax/mafl/commit/eb50f0e))

#### ⚠️ Breaking Changes

- ⚠️  Status indicator operation for all url types ([#87](https://github.com/hywax/mafl/pull/87))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.12.0

[compare changes](https://github.com/hywax/mafl/compare/v0.11.1...v0.12.0)

### 🚀 Enhancements

- ⚠️  Automatic reloading of application when config is updated ([#86](https://github.com/hywax/mafl/pull/86))

### 💅 Refactors

- Rename useServiceData composable ([d44e4cc](https://github.com/hywax/mafl/commit/d44e4cc))
- Contributors format ([fc8fdde](https://github.com/hywax/mafl/commit/fc8fdde))

### 📖 Documentation

- **showcase:** By @hywax ([a09eb18](https://github.com/hywax/mafl/commit/a09eb18))

### 📦 Build

- Change author email ([aad7406](https://github.com/hywax/mafl/commit/aad7406))

#### ⚠️ Breaking Changes

- ⚠️  Automatic reloading of application when config is updated ([#86](https://github.com/hywax/mafl/pull/86))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.11.1

[compare changes](https://github.com/hywax/mafl/compare/v0.11.0...v0.11.1)

### 🩹 Fixes

- Types releases latest ([bce1c92](https://github.com/hywax/mafl/commit/bce1c92))

### 📖 Documentation

- Update cover image ([8d9aeac](https://github.com/hywax/mafl/commit/8d9aeac))
- Status animation property ([440a296](https://github.com/hywax/mafl/commit/440a296))
- Remove duplicate contributors ([3ba24ec](https://github.com/hywax/mafl/commit/3ba24ec))
- **showcase:** By @splnut ([816e65a](https://github.com/hywax/mafl/commit/816e65a))

### 🏡 Chore

- Latest releases change check method ([9762d64](https://github.com/hywax/mafl/commit/9762d64))
- Remove margin top in title service ([d2a59b8](https://github.com/hywax/mafl/commit/d2a59b8))
- Add animation status toggle ([349e8d9](https://github.com/hywax/mafl/commit/349e8d9))
- Pwa theme color ([#72](https://github.com/hywax/mafl/pull/72))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.11.0

[compare changes](https://github.com/hywax/mafl/compare/v0.10.0...v0.11.0)

### 🩹 Fixes

- Hide gray status icon on status false ([b45aa3b](https://github.com/hywax/mafl/commit/b45aa3b))

### 💅 Refactors

- Validators are moved to a separate files ([6455c29](https://github.com/hywax/mafl/commit/6455c29))
- ⚠️  Move files to src ([#63](https://github.com/hywax/mafl/pull/63))

### 🏡 Chore

- Transform border color icon component ([28ee84d](https://github.com/hywax/mafl/commit/28ee84d))

#### ⚠️ Breaking Changes

- ⚠️  Move files to src ([#63](https://github.com/hywax/mafl/pull/63))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.10.0

[compare changes](https://github.com/hywax/mafl/compare/v0.9.5...v0.10.0)

### 🚀 Enhancements

- Service tags ([2051cee](https://github.com/hywax/mafl/commit/2051cee))

### 📖 Documentation

- Service tags ([4520240](https://github.com/hywax/mafl/commit/4520240))
- Preview docs image ([1f5a27b](https://github.com/hywax/mafl/commit/1f5a27b))
- Icons preview ([9504e9a](https://github.com/hywax/mafl/commit/9504e9a))

### 🏡 Chore

- Update CONTRIBUTORS ([f6717aa](https://github.com/hywax/mafl/commit/f6717aa))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))
- Bot ([@hywax-assistant](http://github.com/hywax-assistant))

## v0.9.5

[compare changes](https://github.com/hywax/mafl/compare/v0.9.4...v0.9.5)

### 🚀 Enhancements

- Fr-CA locale ([#59](https://github.com/hywax/mafl/pull/59))

### 🩹 Fixes

- Unnecessary spaces ([388928c](https://github.com/hywax/mafl/commit/388928c))

### 📖 Documentation

- Proxmox script create ([61fbc0f](https://github.com/hywax/mafl/commit/61fbc0f))
- France locale ([40629f7](https://github.com/hywax/mafl/commit/40629f7))

### 🏡 Chore

- Add FR locales ([ba894d0](https://github.com/hywax/mafl/commit/ba894d0))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))
- Maxim31cote ([@maxim31cote](http://github.com/maxim31cote))

## v0.9.4

[compare changes](https://github.com/hywax/mafl/compare/v0.9.3...v0.9.4)

### 🩹 Fixes

- Configuring theme ([#58](https://github.com/hywax/mafl/pull/58))

### 🏡 Chore

- Update CONTRIBUTORS ([dc5efb0](https://github.com/hywax/mafl/commit/dc5efb0))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))
- Bot ([@hywax-assistant](http://github.com/hywax-assistant))

## v0.9.3

[compare changes](https://github.com/hywax/mafl/compare/v0.9.2...v0.9.3)

### 🚀 Enhancements

- Pl-PL locale ([#57](https://github.com/hywax/mafl/pull/57))

### 🩹 Fixes

- Syntax error ([4ea2b5a](https://github.com/hywax/mafl/commit/4ea2b5a))
- Locales file import ([19ef606](https://github.com/hywax/mafl/commit/19ef606))

### 📖 Documentation

- Github link @UberDudePL ([c7d93b4](https://github.com/hywax/mafl/commit/c7d93b4))
- Rename bubble to wrap ([607f41b](https://github.com/hywax/mafl/commit/607f41b))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))
- UberDudePL

## v0.9.2

[compare changes](https://github.com/hywax/mafl/compare/v0.9.1...v0.9.2)

### 🩹 Fixes

- Remove theme static white color ([541cf32](https://github.com/hywax/mafl/commit/541cf32))

### 🏡 Chore

- The entire card is a reference ([12e3086](https://github.com/hywax/mafl/commit/12e3086))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.9.1

[compare changes](https://github.com/hywax/mafl/compare/v0.9.0...v0.9.1)

### 🩹 Fixes

- The shadow from the point animation doesn't fit ([fec99c5](https://github.com/hywax/mafl/commit/fec99c5))
- Error on optional service fields ([8aba88b](https://github.com/hywax/mafl/commit/8aba88b))

### 📖 Documentation

- Credits section ([d7e20ac](https://github.com/hywax/mafl/commit/d7e20ac))

### 🏡 Chore

- Update AUTHORS ([74d4d09](https://github.com/hywax/mafl/commit/74d4d09))
- Update contributors [skip ci] ([d020452](https://github.com/hywax/mafl/commit/d020452))

### 🤖 CI

- Contributor credits plan ([ae680fa](https://github.com/hywax/mafl/commit/ae680fa))
- Welcome plan ([bcb9850](https://github.com/hywax/mafl/commit/bcb9850))
- Change commit message on credits plan ([953ec1b](https://github.com/hywax/mafl/commit/953ec1b))
- Remove authors step on credits plan ([416e888](https://github.com/hywax/mafl/commit/416e888))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))
- Bot ([@hywax-assistant](http://github.com/hywax-assistant))

## v0.9.0

[compare changes](https://github.com/hywax/mafl/compare/v0.8.0...v0.9.0)

### 🚀 Enhancements

- Openweathermap service ([9363ae4](https://github.com/hywax/mafl/commit/9363ae4))

### 📖 Documentation

- **en:** Remove section title ([cd7e998](https://github.com/hywax/mafl/commit/cd7e998))
- **en:** Docs parts ([742588d](https://github.com/hywax/mafl/commit/742588d))
- **ru:** Docs parts ([72d22d7](https://github.com/hywax/mafl/commit/72d22d7))
- **ru:** Replace to part extends base service ([af36595](https://github.com/hywax/mafl/commit/af36595))
- **en:** Replace to part extends base service ([2e98fdf](https://github.com/hywax/mafl/commit/2e98fdf))
- Openweathermap service ([1b42cb2](https://github.com/hywax/mafl/commit/1b42cb2))
- Ignore parts files ([2c73d5b](https://github.com/hywax/mafl/commit/2c73d5b))
- Fix weather link ([62e213a](https://github.com/hywax/mafl/commit/62e213a))

### 📦 Build

- ⚠️  Remove docker arm/v7 ([224c486](https://github.com/hywax/mafl/commit/224c486))
- Bump node image ([a15b4f1](https://github.com/hywax/mafl/commit/a15b4f1))

### 🏡 Chore

- **ip-api:** Add getKey on cache ([ed06d93](https://github.com/hywax/mafl/commit/ed06d93))
- Remove vitejs plugin vue patch ([cc04d6e](https://github.com/hywax/mafl/commit/cc04d6e))

### 🤖 CI

- Refactor docs plan ([540e0a6](https://github.com/hywax/mafl/commit/540e0a6))
- Refactor ci plan ([12bf943](https://github.com/hywax/mafl/commit/12bf943))

#### ⚠️ Breaking Changes

- ⚠️  Remove docker arm/v7 ([224c486](https://github.com/hywax/mafl/commit/224c486))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.8.0

[compare changes](https://github.com/hywax/mafl/compare/v0.7.6...v0.8.0)

### 🚀 Enhancements

- Ip api service ([fe4a219](https://github.com/hywax/mafl/commit/fe4a219))

### 💅 Refactors

- Change @hywax link profile ([fb93b86](https://github.com/hywax/mafl/commit/fb93b86))
- Remove duplicate contributors ([7dd4694](https://github.com/hywax/mafl/commit/7dd4694))

### 📖 Documentation

- Change color brand-soft ([d7d2274](https://github.com/hywax/mafl/commit/d7d2274))
- Badge in version ([4a7599c](https://github.com/hywax/mafl/commit/4a7599c))
- **en:** Fix behaviour target description ([12a9dc8](https://github.com/hywax/mafl/commit/12a9dc8))
- Ip api service ([c5e70a3](https://github.com/hywax/mafl/commit/c5e70a3))

### 🏡 Chore

- Change placeholder background color ([05cb0ea](https://github.com/hywax/mafl/commit/05cb0ea))
- Provide safely config ([e38a7a5](https://github.com/hywax/mafl/commit/e38a7a5))
- ⚠️  Redesigned loading of dynamic services ([d4edb9a](https://github.com/hywax/mafl/commit/d4edb9a))
- Placeholder animate props ([c812e2a](https://github.com/hywax/mafl/commit/c812e2a))
- Create helper check valid url ([d8b9aca](https://github.com/hywax/mafl/commit/d8b9aca))
- Set option title, link ([7b849bd](https://github.com/hywax/mafl/commit/7b849bd))

### 🤖 CI

- Migrate renovate config ([34d9378](https://github.com/hywax/mafl/commit/34d9378))
- Update deploy documentation site ([4a1056e](https://github.com/hywax/mafl/commit/4a1056e))

#### ⚠️ Breaking Changes

- ⚠️  Redesigned loading of dynamic services ([d4edb9a](https://github.com/hywax/mafl/commit/d4edb9a))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.7.6

[compare changes](https://github.com/hywax/mafl/compare/v0.7.5...v0.7.6)

### 🚀 Enhancements

- New prop `target` for service ([feea7fe](https://github.com/hywax/mafl/commit/feea7fe))
- New prop `target` for config behaviour ([7a81999](https://github.com/hywax/mafl/commit/7a81999))

### 📖 Documentation

- **en:** Service target ([8cdeb6a](https://github.com/hywax/mafl/commit/8cdeb6a))
- **ru:** Service target ([a2b0b8a](https://github.com/hywax/mafl/commit/a2b0b8a))
- **en:** Config behaviour target ([e8f20f2](https://github.com/hywax/mafl/commit/e8f20f2))
- **ru:** Config behaviour target ([3ae0592](https://github.com/hywax/mafl/commit/3ae0592))

### 📦 Build

- **deps-dev:** Bump @commitlint/cli from 18.4.4 to 18.5.0 ([#21](https://github.com/hywax/mafl/pull/21))
- **deps-dev:** Bump @commitlint/config-conventional ([#22](https://github.com/hywax/mafl/pull/22))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.7.5

[compare changes](https://github.com/hywax/mafl/compare/v0.7.4...v0.7.5)

### 🚀 Enhancements

- Arabic file locale ([e64c0dd](https://github.com/hywax/mafl/commit/e64c0dd))
- Arabic language ([#20](https://github.com/hywax/mafl/pull/20))
- Dir and lang to html attrs ([35c88c1](https://github.com/hywax/mafl/commit/35c88c1))

### 📖 Documentation

- Github link @mohmadhabib ([fc9ac0a](https://github.com/hywax/mafl/commit/fc9ac0a))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))
- Mohammad Habib ([@mohmadhabib](http://github.com/mohmadhabib))

## v0.7.4

[compare changes](https://github.com/hywax/mafl/compare/v0.7.3...v0.7.4)

### 🚀 Enhancements

- Chinese language ([4557a16](https://github.com/hywax/mafl/commit/4557a16))
- Hindi language ([09b2154](https://github.com/hywax/mafl/commit/09b2154))
- Spanish language ([7d4b090](https://github.com/hywax/mafl/commit/7d4b090))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.7.3

[compare changes](https://github.com/hywax/mafl/compare/v0.7.2...v0.7.3)

### 📖 Documentation

- **getting-started:** Refactor runs ([6538a61](https://github.com/hywax/mafl/commit/6538a61))
- Themes assets ([9669e51](https://github.com/hywax/mafl/commit/9669e51))
- Basic information update ([1427b6f](https://github.com/hywax/mafl/commit/1427b6f))
- Moved themes asset ([bfa7793](https://github.com/hywax/mafl/commit/bfa7793))
- Add emoji ([98f5633](https://github.com/hywax/mafl/commit/98f5633))
- Added Yandex.Metrika for documentation ([4ec6059](https://github.com/hywax/mafl/commit/4ec6059))
- **en:** What is page ([575e0c5](https://github.com/hywax/mafl/commit/575e0c5))
- **en:** Getting started page ([093962c](https://github.com/hywax/mafl/commit/093962c))
- **en:** Configuration page ([ceba903](https://github.com/hywax/mafl/commit/ceba903))
- **en:** Icons page ([9452b99](https://github.com/hywax/mafl/commit/9452b99))
- **en:** Favicons page ([15fbe0b](https://github.com/hywax/mafl/commit/15fbe0b))
- **en:** Base service page ([b7b18e1](https://github.com/hywax/mafl/commit/b7b18e1))
- **en:** Showcase page ([923d713](https://github.com/hywax/mafl/commit/923d713))
- **en:** Development page ([478d616](https://github.com/hywax/mafl/commit/478d616))
- **en:** Contributing page ([7fda3a6](https://github.com/hywax/mafl/commit/7fda3a6))
- **ru:** Contributing page fix char ([53c830f](https://github.com/hywax/mafl/commit/53c830f))
- Change hero text on home page ([7cfdf33](https://github.com/hywax/mafl/commit/7cfdf33))
- Fix cover image url ([5674009](https://github.com/hywax/mafl/commit/5674009))

### 📦 Build

- **deps-dev:** Bump @types/node from 20.10.6 to 20.10.7 ([#12](https://github.com/hywax/mafl/pull/12))
- **deps:** Bump defu from 6.1.3 to 6.1.4 ([#11](https://github.com/hywax/mafl/pull/11))
- **deps-dev:** Bump vitepress from 1.0.0-rc.34 to 1.0.0-rc.36 ([#9](https://github.com/hywax/mafl/pull/9))
- **deps-dev:** Bump @antfu/eslint-config from 2.6.1 to 2.6.2 ([#8](https://github.com/hywax/mafl/pull/8))
- **deps:** Bump h3-zod from 0.5.2 to 0.5.3 ([#10](https://github.com/hywax/mafl/pull/10))
- **deps-dev:** @hywax/vitepress-yandex-metrika from 0.2.0 to 0.3.0 ([49ac3d9](https://github.com/hywax/mafl/commit/49ac3d9))
- **deps:** Bump @vueuse/nuxt from 10.7.1 to 10.7.2 ([#14](https://github.com/hywax/mafl/pull/14))
- **deps-dev:** Bump @types/node from 20.10.7 to 20.11.1 ([#13](https://github.com/hywax/mafl/pull/13))
- **deps-dev:** Bump @commitlint/cli from 18.4.3 to 18.4.4 ([#17](https://github.com/hywax/mafl/pull/17))
- **deps-dev:** Bump @nuxt/devtools from 1.0.6 to 1.0.8 ([#15](https://github.com/hywax/mafl/pull/15))
- **deps-dev:** Bump nuxt from 3.9.0 to 3.9.1 ([#16](https://github.com/hywax/mafl/pull/16))
- **deps:** Upgrade dependencies ([d04f20b](https://github.com/hywax/mafl/commit/d04f20b))

### 🎨 Styles

- **eslint:** Run ([64a80ae](https://github.com/hywax/mafl/commit/64a80ae))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.7.2

[compare changes](https://github.com/hywax/mafl/compare/v0.7.1...v0.7.2)

### 🚀 Enhancements

- Custom error page ([9578305](https://github.com/hywax/mafl/commit/9578305))
- Validation config ([349b546](https://github.com/hywax/mafl/commit/349b546))
- Sepia theme ([a6c38b9](https://github.com/hywax/mafl/commit/a6c38b9))

### 🩹 Fixes

- Color message ([371b778](https://github.com/hywax/mafl/commit/371b778))

### 🏡 Chore

- Immediate status service ([1d43994](https://github.com/hywax/mafl/commit/1d43994))
- Set default page title ([8009c8f](https://github.com/hywax/mafl/commit/8009c8f))
- Remove unused translations ([53f3288](https://github.com/hywax/mafl/commit/53f3288))
- Zod validation ([0089cf9](https://github.com/hywax/mafl/commit/0089cf9))
- Update locales ([a1fa9ba](https://github.com/hywax/mafl/commit/a1fa9ba))
- Immediate default false ([f41d0e1](https://github.com/hywax/mafl/commit/f41d0e1))
- Redirect to error page ([6094ba0](https://github.com/hywax/mafl/commit/6094ba0))
- Change dark background ([8d359d2](https://github.com/hywax/mafl/commit/8d359d2))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.7.1

[compare changes](https://github.com/hywax/mafl/compare/v0.7.0...v0.7.1)

### 🚀 Enhancements

- Transform services to client side render ([2a564bf](https://github.com/hywax/mafl/commit/2a564bf))

### 📖 Documentation

- Excluding pages from search ([0030ed7](https://github.com/hywax/mafl/commit/0030ed7))
- Add favicon.ico ([db884da](https://github.com/hywax/mafl/commit/db884da))

### 📦 Build

- Apply patch ([24565df](https://github.com/hywax/mafl/commit/24565df))

### 🏡 Chore

- Service placeholder ([f396116](https://github.com/hywax/mafl/commit/f396116))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.7.0

[compare changes](https://github.com/hywax/mafl/compare/v0.6.0...v0.7.0)

### 🚀 Enhancements

- ⚠️  Combine base services with ping ([e07a92e](https://github.com/hywax/mafl/commit/e07a92e))

### 📖 Documentation

- Remove base from url ([4ab2606](https://github.com/hywax/mafl/commit/4ab2606))
- **preview:** Add new links ([008b12b](https://github.com/hywax/mafl/commit/008b12b))
- Implements changelog page ([09e8176](https://github.com/hywax/mafl/commit/09e8176))
- Implements license page ([a10d9d2](https://github.com/hywax/mafl/commit/a10d9d2))
- Changelog page ru header ([39e82df](https://github.com/hywax/mafl/commit/39e82df))
- License page ru ([0fa5a03](https://github.com/hywax/mafl/commit/0fa5a03))
- Configuration page ru ([ee2f31f](https://github.com/hywax/mafl/commit/ee2f31f))
- Base service page ru ([1c77879](https://github.com/hywax/mafl/commit/1c77879))
- Create icons page ([2667041](https://github.com/hywax/mafl/commit/2667041))
- Icons page ru ([36acc2e](https://github.com/hywax/mafl/commit/36acc2e))
- What is page ru ([00c626a](https://github.com/hywax/mafl/commit/00c626a))
- Getting started page ru ([68964a6](https://github.com/hywax/mafl/commit/68964a6))
- Favicons page ru ([5ed955b](https://github.com/hywax/mafl/commit/5ed955b))
- Hidden deployment ([85752dc](https://github.com/hywax/mafl/commit/85752dc))
- Development page ru ([4db28f4](https://github.com/hywax/mafl/commit/4db28f4))
- Translate all links ru ([fccc596](https://github.com/hywax/mafl/commit/fccc596))
- Showcase page ru ([f16b4e5](https://github.com/hywax/mafl/commit/f16b4e5))
- Contributing page ru ([b94dc39](https://github.com/hywax/mafl/commit/b94dc39))
- Index page ru ([97d4c0d](https://github.com/hywax/mafl/commit/97d4c0d))
- Translate site ru ([848d58e](https://github.com/hywax/mafl/commit/848d58e))
- EditLink && lastUpdated en ([64da8c6](https://github.com/hywax/mafl/commit/64da8c6))
- Create preview service ([8913533](https://github.com/hywax/mafl/commit/8913533))
- Base service add preview ([9b8e1b8](https://github.com/hywax/mafl/commit/9b8e1b8))
- Favicons add struct files ru ([78fd48f](https://github.com/hywax/mafl/commit/78fd48f))
- **issue-template:** Bug ([3c93762](https://github.com/hywax/mafl/commit/3c93762))
- **issue-template:** Feature request ([2c61da5](https://github.com/hywax/mafl/commit/2c61da5))
- **issue-template:** Question ([1eb28a7](https://github.com/hywax/mafl/commit/1eb28a7))
- **issue-template:** Showcase ([52128d6](https://github.com/hywax/mafl/commit/52128d6))
- **issue-template:** Showcase fix options ([7839849](https://github.com/hywax/mafl/commit/7839849))
- Contributing issues links ru ([3daa235](https://github.com/hywax/mafl/commit/3daa235))
- Showcase issue link ru ([3d1e44c](https://github.com/hywax/mafl/commit/3d1e44c))

### 🏡 Chore

- Ignores into second block ([55d3bb8](https://github.com/hywax/mafl/commit/55d3bb8))
- Add example config ([3515ae5](https://github.com/hywax/mafl/commit/3515ae5))

### 🎨 Styles

- **eslint:** Run ([c478fea](https://github.com/hywax/mafl/commit/c478fea))

### 🤖 CI

- **docs:** Deploy Documentation site to GitHub Pages ([3f95640](https://github.com/hywax/mafl/commit/3f95640))

#### ⚠️ Breaking Changes

- ⚠️  Combine base services with ping ([e07a92e](https://github.com/hywax/mafl/commit/e07a92e))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.6.0

[compare changes](https://github.com/hywax/mafl/compare/v0.5.1...v0.6.0)

### 🚀 Enhancements

- ⚠️  Vitepress engine ([#7](https://github.com/hywax/mafl/pull/7))

### 🏡 Chore

- Pull no-rebase ([62f9aae](https://github.com/hywax/mafl/commit/62f9aae))

#### ⚠️ Breaking Changes

- ⚠️  Vitepress engine ([#7](https://github.com/hywax/mafl/pull/7))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.5.1

[compare changes](https://github.com/hywax/mafl/compare/v0.5.0...v0.5.1)

## v0.5.0

[compare changes](https://github.com/hywax/mafl/compare/v0.4.0...v0.5.0)

### 🚀 Enhancements

- ⚠️  Advanced customization of the service icon ([8df3d47](https://github.com/hywax/mafl/commit/8df3d47))

### 📖 Documentation

- Images for readme ([0123b36](https://github.com/hywax/mafl/commit/0123b36))
- **preview:** Content presentation ([22ec2a3](https://github.com/hywax/mafl/commit/22ec2a3))
- **preview:** Fix html ([994a7fd](https://github.com/hywax/mafl/commit/994a7fd))
- **preview:** Fix spaces ([5a8730c](https://github.com/hywax/mafl/commit/5a8730c))
- **features:** Update list ([52f1859](https://github.com/hywax/mafl/commit/52f1859))

### 🏡 Chore

- **ping-service:** Replace console to logger ([ade76a3](https://github.com/hywax/mafl/commit/ade76a3))
- **ping-service:** Change default interval from 10 to 60 sec ([58236f9](https://github.com/hywax/mafl/commit/58236f9))
- **dev-server:** Add watch from folder ([70b76b0](https://github.com/hywax/mafl/commit/70b76b0))

#### ⚠️ Breaking Changes

- ⚠️  Advanced customization of the service icon ([8df3d47](https://github.com/hywax/mafl/commit/8df3d47))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.4.0

[compare changes](https://github.com/hywax/mafl/compare/v0.3.0...v0.4.0)

### 🚀 Enhancements

- ⚠️  Added PWA support ([554efa7](https://github.com/hywax/mafl/commit/554efa7))

### 🏡 Chore

- Translations for the update block ([69fecaf](https://github.com/hywax/mafl/commit/69fecaf))
- Create favicons ([b6cc318](https://github.com/hywax/mafl/commit/b6cc318))
- Create robots.txt ([a3867d3](https://github.com/hywax/mafl/commit/a3867d3))

### 🎨 Styles

- Nested translation writing style ([2dbcb5f](https://github.com/hywax/mafl/commit/2dbcb5f))

#### ⚠️ Breaking Changes

- ⚠️  Added PWA support ([554efa7](https://github.com/hywax/mafl/commit/554efa7))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.3.0

[compare changes](https://github.com/hywax/mafl/compare/v0.2.1...v0.3.0)

### 🚀 Enhancements

- ⚠️  Automatic update check ([a25785d](https://github.com/hywax/mafl/commit/a25785d))

### 💅 Refactors

- Getting config from server ([cf53bd8](https://github.com/hywax/mafl/commit/cf53bd8))

### 🏡 Chore

- Config provide lang ([9bbfb8b](https://github.com/hywax/mafl/commit/9bbfb8b))
- Add defu ([2b64480](https://github.com/hywax/mafl/commit/2b64480))
- Brand colors ([4ad843f](https://github.com/hywax/mafl/commit/4ad843f))
- Remove nuxt-site-config module ([2fd2dc0](https://github.com/hywax/mafl/commit/2fd2dc0))
- **nuxt:** Enable ssr ([5e365a4](https://github.com/hywax/mafl/commit/5e365a4))

#### ⚠️ Breaking Changes

- ⚠️  Automatic update check ([a25785d](https://github.com/hywax/mafl/commit/a25785d))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.2.1

[compare changes](https://github.com/hywax/mafl/compare/v0.2.0...v0.2.1)

### 🚀 Enhancements

- **update-checker:** Check new versions ([d301ff6](https://github.com/hywax/mafl/commit/d301ff6))
- **update-checker:** Disabled on prerender, development ([7e29b0c](https://github.com/hywax/mafl/commit/7e29b0c))
- Use wrapper consola ([d4f5792](https://github.com/hywax/mafl/commit/d4f5792))

### 📖 Documentation

- **getting-started:** Update list ([db69de8](https://github.com/hywax/mafl/commit/db69de8))
- **getting-started:** Update list ([13979db](https://github.com/hywax/mafl/commit/13979db))

### 📦 Build

- Remove .output folder ([2865104](https://github.com/hywax/mafl/commit/2865104))

### 🏡 Chore

- Config file to storage ([cc092bd](https://github.com/hywax/mafl/commit/cc092bd))

### 🎨 Styles

- **eslint:** Run ([3e96765](https://github.com/hywax/mafl/commit/3e96765))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.2.0

[compare changes](https://github.com/hywax/mafl/compare/v0.1.7...v0.2.0)

### 🩹 Fixes

- Build step on release script ([8ab29b4](https://github.com/hywax/mafl/commit/8ab29b4))

### 📦 Build

- Test new pipe ([c985e94](https://github.com/hywax/mafl/commit/c985e94))
- Npm install ([d6088ff](https://github.com/hywax/mafl/commit/d6088ff))
- Add overrides ([b94c36d](https://github.com/hywax/mafl/commit/b94c36d))
- ⚠️  Migrate npm to yarn ([db3e428](https://github.com/hywax/mafl/commit/db3e428))
- Copy yarn.lock ([d868f91](https://github.com/hywax/mafl/commit/d868f91))

### 🤖 CI

- Rollback Extract Docker tags ([961de5b](https://github.com/hywax/mafl/commit/961de5b))
- Fix install dependencies ([bfbbaac](https://github.com/hywax/mafl/commit/bfbbaac))
- Fixed docker build for all platforms ([#6](https://github.com/hywax/mafl/pull/6))

#### ⚠️ Breaking Changes

- ⚠️  Migrate npm to yarn ([db3e428](https://github.com/hywax/mafl/commit/db3e428))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.1.7

[compare changes](https://github.com/hywax/mafl/compare/v0.1.6...v0.1.7)

### 📦 Build

- Add package lock file ([9ef811b](https://github.com/hywax/mafl/commit/9ef811b))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.1.6

[compare changes](https://github.com/hywax/mafl/compare/v0.1.5...v0.1.6)

### 📦 Build

- Remove flag production ([7e78fea](https://github.com/hywax/mafl/commit/7e78fea))
- Change platforms ([9e3c600](https://github.com/hywax/mafl/commit/9e3c600))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.1.5

[compare changes](https://github.com/hywax/mafl/compare/v0.1.4...v0.1.5)

### 📦 Build

- Npm build replace npm ci ([c60ca3b](https://github.com/hywax/mafl/commit/c60ca3b))
- Change platforms ([5cd29b0](https://github.com/hywax/mafl/commit/5cd29b0))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.1.4

[compare changes](https://github.com/hywax/mafl/compare/v0.1.3...v0.1.4)

### 📦 Build

- Bump docker/build-push-action from 4 to 5 ([de4da30](https://github.com/hywax/mafl/commit/de4da30))
- Node 18 ([3ec0e7d](https://github.com/hywax/mafl/commit/3ec0e7d))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.1.3

[compare changes](https://github.com/hywax/mafl/compare/v0.1.2...v0.1.3)

### 📦 Build

- Node 19 ([2003371](https://github.com/hywax/mafl/commit/2003371))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.1.2

[compare changes](https://github.com/hywax/mafl/compare/v0.1.1...v0.1.2)

### 📦 Build

- Final build from initial image ([a71add0](https://github.com/hywax/mafl/commit/a71add0))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.1.1

[compare changes](https://github.com/hywax/mafl/compare/v0.1.0...v0.1.1)

### 📦 Build

- Remove linux/arm/v8 ([882bedd](https://github.com/hywax/mafl/commit/882bedd))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.1.0

[compare changes](https://github.com/hywax/mafl/compare/v0.0.3...v0.1.0)

### 📖 Documentation

- **features:** Update list ([8ac3184](https://github.com/hywax/mafl/commit/8ac3184))

### 📦 Build

- Add new platform linux/arm/v8 ([48addec](https://github.com/hywax/mafl/commit/48addec))
- Change static name to env ([112c842](https://github.com/hywax/mafl/commit/112c842))
- Add opencontainers labels ([1e3e0aa](https://github.com/hywax/mafl/commit/1e3e0aa))
- ⚠️  Migrate pnpm to npm ([7cc2a1a](https://github.com/hywax/mafl/commit/7cc2a1a))

### 🤖 CI

- Add step install dependencies ([88d8aa9](https://github.com/hywax/mafl/commit/88d8aa9))

#### ⚠️ Breaking Changes

- ⚠️  Migrate pnpm to npm ([7cc2a1a](https://github.com/hywax/mafl/commit/7cc2a1a))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.0.3

[compare changes](https://github.com/hywax/mafl/compare/v0.0.2...v0.0.3)

### 🩹 Fixes

- Trigger tag signature ([a14ea3f](https://github.com/hywax/mafl/commit/a14ea3f))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.0.2

[compare changes](https://github.com/hywax/mafl/compare/v0.0.1...v0.0.2)

### 🩹 Fixes

- **typecheck:** Data.time is possibly undefined ([4ab1529](https://github.com/hywax/mafl/commit/4ab1529))

### 🎨 Styles

- **eslint:** Run ([fdf3b10](https://github.com/hywax/mafl/commit/fdf3b10))

### 🤖 CI

- Create release on push tag ([20879eb](https://github.com/hywax/mafl/commit/20879eb))
- Run linters ([7d28c01](https://github.com/hywax/mafl/commit/7d28c01))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.0.1


### 🚀 Enhancements

- **eslint:** Antfu config for eslint ([b14b95d](https://github.com/hywax/mafl/commit/b14b95d))
- **tailwindcss:** Add tailwindcss module ([bbb34e9](https://github.com/hywax/mafl/commit/bbb34e9))
- **service:** Ping ([4d38c00](https://github.com/hywax/mafl/commit/4d38c00))
- **config:** Ungrouped services ([4b2bab0](https://github.com/hywax/mafl/commit/4b2bab0))
- **lang:** Add module i18n ([23e0380](https://github.com/hywax/mafl/commit/23e0380))
- **lang:** Implements base translations ([49031e2](https://github.com/hywax/mafl/commit/49031e2))
- **lang:** Use translations ([df418e5](https://github.com/hywax/mafl/commit/df418e5))
- **lang:** Load from config ([6a07688](https://github.com/hywax/mafl/commit/6a07688))
- Husky and lint staged ([4dcee7e](https://github.com/hywax/mafl/commit/4dcee7e))
- Commit conventional ([bdef406](https://github.com/hywax/mafl/commit/bdef406))
- Add changelogen ([b7c89fa](https://github.com/hywax/mafl/commit/b7c89fa))

### 🩹 Fixes

- **patch:** Check equals objects. PR https://github.com/vitejs/vite-plugin-vue/pull/320 ([55508d6](https://github.com/hywax/mafl/commit/55508d6))
- Random jump icon ([4424647](https://github.com/hywax/mafl/commit/4424647))

### 💅 Refactors

- **deps:** Plugging some dependencies directly ([9d35bba](https://github.com/hywax/mafl/commit/9d35bba))
- **skeleton:** Service card item ([24b61b3](https://github.com/hywax/mafl/commit/24b61b3))
- **skeleton:** Service group ([c8c3ef9](https://github.com/hywax/mafl/commit/c8c3ef9))
- **skeleton:** Change screen to single ([7da6ad2](https://github.com/hywax/mafl/commit/7da6ad2))
- Transfer set title to app ([7be44a1](https://github.com/hywax/mafl/commit/7be44a1))

### 📖 Documentation

- MIT license ([2fef13e](https://github.com/hywax/mafl/commit/2fef13e))
- Base struct readme ([368c36b](https://github.com/hywax/mafl/commit/368c36b))
- **features:** Update list ([ecdf4fb](https://github.com/hywax/mafl/commit/ecdf4fb))
- **features:** Update list ([d9e67c1](https://github.com/hywax/mafl/commit/d9e67c1))
- **features:** Update list ([8244dc7](https://github.com/hywax/mafl/commit/8244dc7))
- **features:** Update list ([0635508](https://github.com/hywax/mafl/commit/0635508))

### 📦 Build

- Docker file ([3ea3e45](https://github.com/hywax/mafl/commit/3ea3e45))
- **deps-dev:** Bump @types/node from 20.10.5 to 20.10.6 ([#2](https://github.com/hywax/mafl/pull/2))
- **deps-dev:** Bump nuxt-site-config from 2.1.2 to 2.1.3 ([#5](https://github.com/hywax/mafl/pull/5))
- **deps-dev:** Bump nuxt-site-config-kit from 2.1.2 to 2.1.3 ([#3](https://github.com/hywax/mafl/pull/3))
- **deps-dev:** Bump @antfu/eslint-config from 1.2.1 to 2.6.1 ([#4](https://github.com/hywax/mafl/pull/4))

### 🏡 Chore

- Initial commit ([3e97906](https://github.com/hywax/mafl/commit/3e97906))
- Add editor config ([65a17ef](https://github.com/hywax/mafl/commit/65a17ef))
- **eslint:** Overrides vue/block-order ([cf1ca86](https://github.com/hywax/mafl/commit/cf1ca86))
- **skeleton:** Base icon component ([e8c7b7f](https://github.com/hywax/mafl/commit/e8c7b7f))
- **skeleton:** Base item component ([69aa75a](https://github.com/hywax/mafl/commit/69aa75a))
- **skeleton:** Base group component ([4dc6321](https://github.com/hywax/mafl/commit/4dc6321))
- **skeleton:** Base screen component ([366fdce](https://github.com/hywax/mafl/commit/366fdce))
- **skeleton:** Add vueuse module ([9ac8829](https://github.com/hywax/mafl/commit/9ac8829))
- **skeleton:** Add yaml parser ([d042dfd](https://github.com/hywax/mafl/commit/d042dfd))
- **nuxt:** Update nuxt ([393e082](https://github.com/hywax/mafl/commit/393e082))
- **nuxt:** Disable ssr ([ff9b0d6](https://github.com/hywax/mafl/commit/ff9b0d6))
- **eslint:** Enable Vue support ([e175f71](https://github.com/hywax/mafl/commit/e175f71))
- **skeleton:** View with layout component ([1fd6218](https://github.com/hywax/mafl/commit/1fd6218))
- **skeleton:** Add nuxt-site-config module ([1d93dab](https://github.com/hywax/mafl/commit/1d93dab))
- **skeleton:** Define site config ([2686917](https://github.com/hywax/mafl/commit/2686917))
- **skeleton:** Define base project types ([d4f6a98](https://github.com/hywax/mafl/commit/d4f6a98))
- **skeleton:** Obtaining and customizing application config ([644f690](https://github.com/hywax/mafl/commit/644f690))
- **skeleton:** Load config and provide to front&back ([c06aa53](https://github.com/hywax/mafl/commit/c06aa53))
- **skeleton:** Define global message component ([a5ceff7](https://github.com/hywax/mafl/commit/a5ceff7))
- Add padding axis X ([44da7ba](https://github.com/hywax/mafl/commit/44da7ba))
- Service base set size icon ([c3ab75b](https://github.com/hywax/mafl/commit/c3ab75b))
- Move overrides https://github.com/hywax/mafl/pull/4 ([65e33a7](https://github.com/hywax/mafl/commit/65e33a7))

### 🎨 Styles

- **eslint:** Run ([7d814db](https://github.com/hywax/mafl/commit/7d814db))
- **eslint:** Run ([5286a7b](https://github.com/hywax/mafl/commit/5286a7b))
- **eslint:** Run ([2604de7](https://github.com/hywax/mafl/commit/2604de7))
- Add rule for .vue ([03d2e36](https://github.com/hywax/mafl/commit/03d2e36))

### 🤖 CI

- Dependabot config ([001c3c1](https://github.com/hywax/mafl/commit/001c3c1))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

