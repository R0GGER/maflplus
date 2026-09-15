<template>
  <div class="space-y-2 text-xs">
    <!-- Bookmark fields -->
    <template v-if="item.serviceType === 'bookmark'">
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="admin-label">Title</label>
          <input v-model="item.title" type="text" class="admin-input w-full">
        </div>
        <div>
          <label class="admin-label">Link</label>
          <input v-model="item.link" type="text" class="admin-input w-full" placeholder="https://...">
        </div>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="admin-label">Description</label>
          <input v-model="item.description" type="text" class="admin-input w-full">
        </div>
        <div>
          <label class="admin-label">Target (override)</label>
          <select v-model="item.target" class="admin-input w-full">
            <option value="">-- (use global)</option>
            <option value="_blank">_blank</option>
            <option value="_self">_self</option>
            <option value="_parent">_parent</option>
            <option value="_top">_top</option>
          </select>
        </div>
      </div>
    </template>

    <!-- OpenWeatherMap -->
    <template v-if="item.serviceType === 'openweathermap'">
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="admin-label">Latitude</label>
          <input v-model="item.owmLat" type="text" class="admin-input w-full" placeholder="51.5085">
        </div>
        <div>
          <label class="admin-label">Longitude</label>
          <input v-model="item.owmLon" type="text" class="admin-input w-full" placeholder="-0.1257">
        </div>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="admin-label">Units</label>
          <select v-model="item.owmUnits" class="admin-input w-full">
            <option value="metric">metric</option>
            <option value="imperial">imperial</option>
            <option value="standard">standard</option>
          </select>
        </div>
        <div>
          <label class="admin-label">API Key</label>
          <input v-model="item.owmApiKey" type="text" class="admin-input w-full" placeholder="your-api-key">
        </div>
      </div>
      <div>
        <label class="admin-label">Show weather type</label>
        <select v-model="item.owmShowDescription" class="admin-input w-full">
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
      </div>
    </template>

    <!-- IP-API -->
    <template v-if="item.serviceType === 'ip-api'">
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="admin-label">Location Name</label>
          <input v-model="item.ipapiLocationName" type="text" class="admin-input w-full" placeholder="(auto-detect from IP)">
        </div>
        <div>
          <label class="admin-label">Flag Icon</label>
          <select v-model="item.ipapiFlagIcon" class="admin-input w-full">
            <option value="true">true</option>
            <option value="false">false</option>
          </select>
        </div>
      </div>
    </template>

    <!-- Time -->
    <template v-if="item.serviceType === 'time'">
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="admin-label">Timezone</label>
          <input v-model="item.tzTimezone" type="text" class="admin-input w-full" placeholder="Europe/Amsterdam">
        </div>
        <div>
          <label class="admin-label">Location Name</label>
          <input v-model="item.tzLocationName" type="text" class="admin-input w-full" placeholder="Amsterdam">
        </div>
      </div>
      <div class="grid grid-cols-3 gap-2">
        <div>
          <label class="admin-label">Country Code</label>
          <input v-model="item.tzCountry" type="text" class="admin-input w-full" placeholder="nl" maxlength="2">
        </div>
        <div>
          <label class="admin-label">Time Format</label>
          <select v-model="item.tzTimeFormat" class="admin-input w-full">
            <option value="24h">24h</option>
            <option value="12h">12h</option>
          </select>
        </div>
        <div>
          <label class="admin-label">Date Format</label>
          <select v-model="item.tzDateFormat" class="admin-input w-full">
            <option v-for="f in dateFormats" :key="f" :value="f">{{ f }}</option>
          </select>
        </div>
      </div>
    </template>

    <!-- DateTime Weather -->
    <template v-if="item.serviceType === 'datetime-weather'">
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="admin-label">Latitude</label>
          <input v-model="item.dtwLat" type="text" class="admin-input w-full" placeholder="52.370216">
        </div>
        <div>
          <label class="admin-label">Longitude</label>
          <input v-model="item.dtwLon" type="text" class="admin-input w-full" placeholder="4.895168">
        </div>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="admin-label">Timezone</label>
          <input v-model="item.dtwTimezone" type="text" class="admin-input w-full" placeholder="Europe/Amsterdam">
        </div>
        <div>
          <label class="admin-label">API Key</label>
          <input v-model="item.dtwApiKey" type="text" class="admin-input w-full" placeholder="your-api-key">
        </div>
      </div>
      <div class="grid grid-cols-3 gap-2">
        <div>
          <label class="admin-label">Units</label>
          <select v-model="item.dtwUnits" class="admin-input w-full">
            <option value="metric">metric</option>
            <option value="imperial">imperial</option>
            <option value="standard">standard</option>
          </select>
        </div>
        <div>
          <label class="admin-label">Time Format</label>
          <select v-model="item.dtwTimeFormat" class="admin-input w-full">
            <option value="24h">24h</option>
            <option value="12h">12h</option>
          </select>
        </div>
        <div>
          <label class="admin-label">Date Format</label>
          <select v-model="item.dtwDateFormat" class="admin-input w-full">
            <option v-for="f in dateFormats" :key="f" :value="f">{{ f }}</option>
          </select>
        </div>
      </div>
    </template>

    <!-- Greeting -->
    <template v-if="item.serviceType === 'greeting'">
      <div>
        <label class="admin-label">Text</label>
        <AdminHtmlEditor v-model="item.greetText" placeholder="Hello!" :min-height="72" />
      </div>
      <div>
        <label class="admin-label">Subtitle</label>
        <AdminHtmlEditor v-model="item.greetSubtitle" placeholder="Welcome to your dashboard" :min-height="56" />
      </div>
    </template>

    <!-- Web Radio -->
    <template v-if="item.serviceType === 'web-radio'">
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="admin-label">Title</label>
          <input v-model="item.title" type="text" class="admin-input w-full" placeholder="Radio 538">
        </div>
        <div>
          <label class="admin-label">Country Code</label>
          <input v-model="item.wrCountryCode" type="text" class="admin-input w-full" placeholder="NL" maxlength="2">
        </div>
      </div>
      <div>
        <label class="admin-label">Description</label>
        <input v-model="item.description" type="text" class="admin-input w-full" placeholder="pop, hits">
      </div>
      <div>
        <label class="admin-label">Search station</label>
        <input
          v-model="wrSearchQuery"
          type="text"
          class="admin-input w-full"
          :placeholder="`Search Radio Browser (${wrCountryCodeEffective})...`"
          @input="debouncedWrSearch"
        >
      </div>
      <div v-if="wrSearchLoading" class="text-[10px] text-fg-dimmed">Searching...</div>
      <div v-else-if="wrSearchResults.length" class="max-h-40 overflow-y-auto border border-fg/10 rounded-lg">
        <button
          v-for="station in wrSearchResults"
          :key="station.stationuuid"
          type="button"
          class="w-full flex items-center gap-2 px-2 py-1.5 text-left hover:bg-fg/5 transition-colors text-xs"
          @click="selectWrStation(station)"
        >
          <img
            v-if="station.favicon"
            :src="station.favicon"
            alt=""
            class="w-5 h-5 rounded object-cover flex-shrink-0"
          >
          <Icon v-else name="mdi:radio" class="w-5 h-5 flex-shrink-0 text-fg-dimmed" />
          <span class="truncate">{{ station.name }}</span>
        </button>
      </div>
      <div>
        <label class="admin-label">Station UUID</label>
        <input v-model="item.wrStationUuid" type="text" class="admin-input w-full font-mono text-[11px]" placeholder="stationuuid">
      </div>
    </template>

    <!-- TomTom (all types) -->
    <template v-if="isTomtom">
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="admin-label">TomTom Module</label>
          <select v-model="item.serviceType" class="admin-input w-full">
            <option value="tomtom-eta">ETA (arrival time)</option>
            <option value="tomtom-eta-map">Route Map</option>
            <option value="tomtom-traffic-map">Traffic Map</option>
          </select>
        </div>
        <div>
          <label class="admin-label">API Key</label>
          <input v-model="tomtomApiKey" type="text" class="admin-input w-full" placeholder="your-tomtom-api-key">
        </div>
      </div>

      <!-- ETA / Route Map fields -->
      <template v-if="item.serviceType !== 'tomtom-traffic-map'">
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="admin-label">Origin Address</label>
            <input v-model="item.ttOriginAddress" type="text" class="admin-input w-full" placeholder="Amsterdam">
          </div>
          <div>
            <label class="admin-label">Dest Address</label>
            <input v-model="item.ttDestAddress" type="text" class="admin-input w-full" placeholder="Paris">
          </div>
        </div>
        <div class="grid grid-cols-4 gap-2">
          <div>
            <label class="admin-label">Origin Lat</label>
            <input v-model="item.ttOriginLat" type="text" class="admin-input w-full" placeholder="52.3791">
          </div>
          <div>
            <label class="admin-label">Origin Lon</label>
            <input v-model="item.ttOriginLon" type="text" class="admin-input w-full" placeholder="4.9003">
          </div>
          <div>
            <label class="admin-label">Dest Lat</label>
            <input v-model="item.ttDestLat" type="text" class="admin-input w-full" placeholder="48.8566">
          </div>
          <div>
            <label class="admin-label">Dest Lon</label>
            <input v-model="item.ttDestLon" type="text" class="admin-input w-full" placeholder="2.3522">
          </div>
        </div>
        <div class="mt-1 text-[10px] text-fg-dimmed">Use address OR coordinates. Coordinates take priority if both are set.</div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="admin-label">Route Name</label>
            <input v-model="item.ttRouteName" type="text" class="admin-input w-full" placeholder="Home - Work">
          </div>
          <div>
            <label class="admin-label">Travel Mode</label>
            <select v-model="item.ttTravelMode" class="admin-input w-full">
              <option value="car">car</option>
              <option value="truck">truck</option>
              <option value="bicycle">bicycle</option>
              <option value="pedestrian">pedestrian</option>
            </select>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="admin-label">Time Format</label>
            <select v-model="item.ttTimeFormat" class="admin-input w-full">
              <option value="24h">24h</option>
              <option value="12h">12h</option>
            </select>
          </div>
        </div>
      </template>

      <!-- Traffic Map fields -->
      <template v-if="item.serviceType === 'tomtom-traffic-map'">
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="admin-label">Address / Place</label>
            <input v-model="item.ttmAddress" type="text" class="admin-input w-full" placeholder="Amsterdam">
          </div>
          <div>
            <label class="admin-label">Zoom (1-18)</label>
            <input v-model="item.ttmZoom" type="number" min="1" max="18" class="admin-input w-full" placeholder="12">
          </div>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="admin-label">Latitude</label>
            <input v-model="item.ttmLat" type="text" class="admin-input w-full" placeholder="52.3676">
          </div>
          <div>
            <label class="admin-label">Longitude</label>
            <input v-model="item.ttmLon" type="text" class="admin-input w-full" placeholder="4.9041">
          </div>
        </div>
        <div class="mt-1 text-[10px] text-fg-dimmed">Use address OR coordinates. Coordinates take priority if both are set.</div>
      </template>

      <!-- Map options (Route Map & Traffic Map) -->
      <template v-if="item.serviceType !== 'tomtom-eta'">
        <div class="grid grid-cols-3 gap-2">
          <div>
            <label class="admin-label">Map Style</label>
            <select v-model="tomtomMapStyle" class="admin-input w-full">
              <option value="standard">Standard</option>
              <option value="dark">Dark</option>
              <option value="satellite">Satellite</option>
            </select>
          </div>
          <div>
            <label class="admin-label">Map Height (px)</label>
            <input v-model="tomtomMapHeight" type="number" min="150" max="800" class="admin-input w-full" placeholder="300">
          </div>
          <div />
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div class="flex items-end">
            <label class="inline-flex items-center gap-1 text-fg-dimmed admin-input cursor-pointer">
              <input v-model="tomtomShowTrafficFlow" type="checkbox" style="accent-color: #69a870"> Traffic Flow
            </label>
          </div>
          <div class="flex items-end">
            <label class="inline-flex items-center gap-1 text-fg-dimmed admin-input cursor-pointer">
              <input v-model="tomtomShowIncidents" type="checkbox" style="accent-color: #69a870"> Incidents
            </label>
          </div>
        </div>
      </template>
    </template>

    <!-- Custom HTML -->
    <template v-if="item.serviceType === 'custom-html'">
      <div>
        <label class="admin-label">HTML Content</label>
        <input v-model="item.customHtml" type="text" class="admin-input w-full" placeholder="<p>Custom HTML</p>">
      </div>
      <div>
        <label class="inline-flex items-center gap-1 text-fg-dimmed">
          <input v-model="item.customHidden" type="checkbox"> Hidden
        </label>
      </div>
    </template>

    <!-- Uptime Kuma -->
    <template v-if="item.serviceType === 'uptime-kuma'">
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="admin-label">Title</label>
          <input v-model="item.title" type="text" class="admin-input w-full" placeholder="Services">
        </div>
        <div>
          <label class="admin-label">Link (optional)</label>
          <input v-model="item.link" type="text" class="admin-input w-full" placeholder="https://kuma.example.com/status/default">
        </div>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="admin-label">Kuma URL (override)</label>
          <input v-model="item.ukUrl" type="text" class="admin-input w-full" placeholder="-- (use global)">
        </div>
        <div>
          <label class="admin-label">Status page slug</label>
          <input v-model="item.ukSlug" type="text" class="admin-input w-full" placeholder="-- (use global)">
        </div>
      </div>
      <p class="text-[10px] text-fg-dimmed">
        The slug is the last part of your Kuma status page address:
        <span class="font-mono">https://kuma.example.com/status/<span class="text-fg">default</span></span>
      </p>
      <div>
        <label class="admin-label">Monitors (comma separated, "id" or "id:Label")</label>
        <input v-model="item.ukMonitors" type="text" class="admin-input w-full" placeholder="1, 4:Mailserver">
      </div>
      <div
        class="rounded border px-2 py-1.5 text-[10px] leading-relaxed text-fg-dimmed"
        :class="ukStatusPageMode ? 'border-green-500/30 bg-green-500/5' : 'border-amber-500/30 bg-amber-500/5'"
      >
        <template v-if="ukStatusPageMode">
          <span class="text-fg font-medium">Status page mode{{ !item.ukSlug ? ' (slug from Global Settings)' : '' }}.</span>
          One request returns every public monitor of the page, so you get names, status, response time, 24h
          uptime <span class="text-fg">and heartbeat bars</span>. Leave Monitors empty to show the whole page.
        </template>
        <template v-else>
          <span class="text-fg font-medium">Badge mode - no heartbeat bars.</span>
          Without a slug each monitor is read separately through Kuma's badge API, which returns single values
          and no history. Monitors is required here, and the uptime window is free to choose.
        </template>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="admin-label">Uptime window (badge mode)</label>
          <select v-model="item.ukUptimeDuration" class="admin-input w-full">
            <option value="24h">24 hours</option>
            <option value="168h">7 days</option>
            <option value="720h">30 days</option>
          </select>
        </div>
        <div>
          <label class="admin-label">Heartbeat bars</label>
          <input v-model="item.ukHeartbeatCount" type="number" min="1" max="100" class="admin-input w-full" placeholder="30">
        </div>
      </div>
      <div>
        <label class="admin-label">Bar width</label>
        <input v-model="item.ukHeartbeatWidth" type="text" class="admin-input w-full" placeholder="-- (stretch to fit)">
        <p class="mt-1 text-[10px] text-fg-dimmed">
          Empty stretches the bars across the card, so more bars means thinner bars. A value such as
          <span class="font-mono">4px</span> fixes the width and spreads the remaining space over the gaps.
        </p>
      </div>
      <div class="flex flex-wrap gap-3">
        <label class="inline-flex items-center gap-1 text-fg-dimmed admin-input cursor-pointer">
          <input v-model="item.ukShowUptime" type="checkbox" style="accent-color: #69a870"> uptime
        </label>
        <label class="inline-flex items-center gap-1 text-fg-dimmed admin-input cursor-pointer">
          <input v-model="item.ukShowPing" type="checkbox" style="accent-color: #69a870"> ping
        </label>
        <label class="inline-flex items-center gap-1 text-fg-dimmed admin-input cursor-pointer">
          <input v-model="item.ukShowHeartbeat" type="checkbox" style="accent-color: #69a870"> heartbeat
        </label>
        <label class="inline-flex items-center gap-1 text-fg-dimmed admin-input cursor-pointer">
          <input v-model="item.ukShowCertExp" type="checkbox" style="accent-color: #69a870"> cert expiry
        </label>
      </div>
    </template>

    <!-- Span (all types) -->
    <div class="grid grid-cols-2 gap-2">
      <div>
        <label class="admin-label">Span (columns)</label>
        <input v-model="item.span" type="number" min="1" max="12" class="admin-input w-full" placeholder="1">
      </div>
    </div>

    <!-- Icon (not for time module) -->
    <div v-if="!['time', 'tomtom-eta', 'tomtom-eta-map', 'tomtom-traffic-map'].includes(item.serviceType)" class="border-t border-fg/10 pt-2">
      <label class="admin-label block mb-1">Icon Type</label>
      <div class="flex gap-3 mb-2">
        <label class="inline-flex items-center gap-1 text-fg-dimmed">
          <input v-model="item.iconType" type="radio" value="favicon"> favicon
        </label>
        <label class="inline-flex items-center gap-1 text-fg-dimmed">
          <input v-model="item.iconType" type="radio" value="url"> url
        </label>
        <label class="inline-flex items-center gap-1 text-fg-dimmed">
          <input v-model="item.iconType" type="radio" value="name"> name
        </label>
        <label class="inline-flex items-center gap-1 text-fg-dimmed">
          <input v-model="item.iconType" type="radio" value="none"> none
        </label>
      </div>

      <p v-if="item.iconType === 'none'" class="text-[10px] text-fg-dimmed">
        No icon, and the space reserved for it is dropped so the title starts at the edge of the card. Also
        suppresses the default icon of a module.
      </p>

      <div v-else-if="item.iconType === 'favicon'">
        <div class="flex gap-2 items-end">
          <div class="flex-1">
            <label class="admin-label">Domain</label>
            <input v-model="item.iconFavicon" type="text" class="admin-input w-full" placeholder="example.com">
          </div>
          <div>
            <label class="admin-label">&nbsp;</label>
            <button
              type="button"
              class="admin-input inline-flex items-center gap-1 text-red-400 border-red-400/30 hover:bg-red-400/10 transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap"
              :disabled="faviconCacheClearing || !item.iconFavicon"
              title="Clear the cached favicon for this domain so it is re-downloaded"
              @click="clearFaviconCache"
            >
              <Icon name="ph:trash" class="w-3.5 h-3.5" />
              {{ faviconCacheClearing ? 'Clearing...' : 'Clear cache' }}
            </button>
          </div>
          <div>
            <label class="admin-label">&nbsp;</label>
            <label class="inline-flex items-center gap-1 text-fg-dimmed admin-input cursor-pointer">
              <input v-model="item.iconWrap" type="checkbox" style="accent-color: #69a870"> wrap
            </label>
          </div>
        </div>
        <div v-if="faviconCacheMessage" class="mt-1 text-[10px]" :class="faviconCacheError ? 'text-red-400' : 'text-fg-dimmed'">
          {{ faviconCacheMessage }}
        </div>
      </div>
      <div v-else-if="item.iconType === 'url'">
        <div class="flex gap-2 items-end">
          <div class="flex-1">
            <label class="admin-label">URL</label>
            <input v-model="item.iconUrl" type="text" class="admin-input w-full" placeholder="https://...">
          </div>
          <div>
            <label class="admin-label">&nbsp;</label>
            <label class="inline-flex items-center gap-1 text-fg-dimmed admin-input cursor-pointer">
              <input v-model="item.iconWrap" type="checkbox" style="accent-color: #69a870"> wrap
            </label>
          </div>
        </div>
        <div class="mt-1 text-[10px] text-fg-dimmed">
          Browse icons:
          <a href="https://selfh.st/icons/" target="_blank" class="hover:underline" style="color: rgb(124 180 132)">selfh.st/icons</a>
          ·
          <a href="https://dashboardicons.com/icons" target="_blank" class="hover:underline" style="color: rgb(124 180 132)">dashboardicons.com</a>
        </div>
      </div>
      <div v-else>
        <div class="flex gap-2 items-end">
          <div class="flex-1">
            <label class="admin-label">Name</label>
            <input v-model="item.iconName" type="text" class="admin-input w-full" placeholder="mdi:home">
          </div>
          <div>
            <label class="admin-label">Color</label>
            <input v-model="item.iconColor" type="text" class="admin-input w-20" placeholder="#hex">
          </div>
          <div>
            <label class="admin-label">&nbsp;</label>
            <label class="inline-flex items-center gap-1 text-fg-dimmed admin-input cursor-pointer">
              <input v-model="item.iconWrap" type="checkbox" style="accent-color: #69a870"> wrap
            </label>
          </div>
        </div>
        <div class="mt-1 text-[10px] text-fg-dimmed">
          Browse icons:
          <a href="https://icon-sets.iconify.design/" target="_blank" class="hover:underline" style="color: rgb(124 180 132)">iconify.design</a>
          ·
          <a href="https://getemoji.com/" target="_blank" class="hover:underline" style="color: rgb(124 180 132)">getemoji.com</a>
        </div>
      </div>
    </div>

    <!-- Status & Tags (bookmark only) -->
    <div v-if="item.serviceType === 'bookmark'" class="border-t border-fg/10 pt-2 space-y-2">
      <label class="inline-flex items-center gap-1 text-fg-dimmed cursor-pointer">
        Uptime monitoring
        <label class="inline-flex items-center gap-1 text-fg-dimmed admin-input cursor-pointer">
          <input v-model="item.statusEnabled" type="checkbox" style="accent-color: #69a870">
        </label>
      </label>
      <div v-if="item.statusEnabled">
        <label class="admin-label">Uptime Kuma monitor (optional)</label>
        <input v-model="item.statusMonitor" type="text" class="admin-input w-full" placeholder="e.g. 4 or Mailserver">
        <p class="mt-1 text-[10px] text-fg-dimmed">
          Leave empty to ping the link directly. Fill in a monitor ID, or its name when a global status page
          slug is set, to take the status dot straight from Uptime Kuma.
        </p>
      </div>
      <div>
        <label class="admin-label">Tags (comma separated)</label>
        <input
          :value="item.tags.join(', ')"
          type="text"
          class="admin-input w-full"
          placeholder="tag1, tag2"
          @input="item.tags = ($event.target as HTMLInputElement).value.split(',').map(s => s.trim()).filter(Boolean)"
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BuilderItem } from '~/composables/useConfigBuilder'

const props = defineProps<{
  item: BuilderItem
  tabIndex: number
  groupIndex: number
  itemIndex: number
}>()

const dateFormats = ['short', 'medium', 'long', 'eu', 'compact', 'short-eu', 'iso']

const isTomtom = computed(() =>
  ['tomtom-eta', 'tomtom-eta-map', 'tomtom-traffic-map'].includes(props.item.serviceType),
)

const tomtomApiKey = computed({
  get: () => props.item.serviceType === 'tomtom-traffic-map' ? props.item.ttmApiKey : props.item.ttApiKey,
  set: (v: string) => {
    props.item.ttApiKey = v
    props.item.ttmApiKey = v
  },
})

const tomtomMapStyle = computed({
  get: () => props.item.serviceType === 'tomtom-traffic-map' ? props.item.ttmMapStyle : props.item.ttMapStyle,
  set: (v: string) => { props.item.ttMapStyle = v; props.item.ttmMapStyle = v },
})

const tomtomMapHeight = computed({
  get: () => props.item.serviceType === 'tomtom-traffic-map' ? props.item.ttmMapHeight : props.item.ttMapHeight,
  set: (v: string) => { props.item.ttMapHeight = v; props.item.ttmMapHeight = v },
})

const tomtomShowTrafficFlow = computed({
  get: () => props.item.serviceType === 'tomtom-traffic-map' ? props.item.ttmShowTrafficFlow : props.item.ttShowTrafficFlow,
  set: (v: boolean) => { props.item.ttShowTrafficFlow = v; props.item.ttmShowTrafficFlow = v },
})

const tomtomShowIncidents = computed({
  get: () => props.item.serviceType === 'tomtom-traffic-map' ? props.item.ttmShowIncidents : props.item.ttShowIncidents,
  set: (v: boolean) => { props.item.ttShowIncidents = v; props.item.ttmShowIncidents = v },
})

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname
  }
  catch {
    return url.replace(/^https?:\/\//, '').split('/')[0]
  }
}

watch(() => props.item.link, (newLink) => {
  if (props.item.iconType === 'favicon' && newLink) {
    props.item.iconFavicon = extractDomain(newLink)
  }
})

watch(() => props.item.iconType, (newType) => {
  if (newType === 'favicon' && props.item.link && !props.item.iconFavicon) {
    props.item.iconFavicon = extractDomain(props.item.link)
  }
})

const faviconCacheClearing = ref(false)
const faviconCacheMessage = ref('')
const faviconCacheError = ref(false)

async function clearFaviconCache() {
  const domain = props.item.iconFavicon?.trim()
  if (!domain || faviconCacheClearing.value) return

  faviconCacheClearing.value = true
  faviconCacheMessage.value = ''
  faviconCacheError.value = false
  try {
    const res = await $fetch<{ ok: true; domain: string; removed: boolean }>(
      '/api/admin/favicon-cache',
      { method: 'DELETE', body: { domain } },
    )
    faviconCacheError.value = false
    faviconCacheMessage.value = res.removed
      ? `Cache cleared for ${res.domain}. The favicon will be re-downloaded.`
      : `No cached favicon found for ${res.domain}.`
  }
  catch (e: any) {
    faviconCacheError.value = true
    faviconCacheMessage.value = e?.data?.statusMessage || e?.statusMessage || 'Failed to clear favicon cache'
  }
  finally {
    faviconCacheClearing.value = false
  }
}

const wrCountryCodeEffective = computed(() =>
  (props.item.wrCountryCode || 'NL').toUpperCase().slice(0, 2),
)

const wrSearchQuery = ref('')
const wrSearchResults = ref<Array<{
  stationuuid: string
  name: string
  favicon: string
  tags: string
  codec: string
  bitrate: number
}>>([])
const wrSearchLoading = ref(false)

const { searchStations } = useRadioBrowser()

async function runWrSearch() {
  if (props.item.serviceType !== 'web-radio' || wrSearchQuery.value.length < 2) {
    wrSearchResults.value = []
    return
  }

  wrSearchLoading.value = true
  try {
    wrSearchResults.value = await searchStations(
      wrSearchQuery.value,
      wrCountryCodeEffective.value,
      10,
    )
  }
  catch {
    wrSearchResults.value = []
  }
  finally {
    wrSearchLoading.value = false
  }
}

const debouncedWrSearch = useDebounceFn(runWrSearch, 300)

function selectWrStation(station: typeof wrSearchResults.value[number]) {
  props.item.wrStationUuid = station.stationuuid
  props.item.title = station.name
  if (station.favicon) {
    props.item.iconType = 'url'
    props.item.iconUrl = station.favicon
  }
  const meta = [station.codec, station.bitrate ? `${station.bitrate} kbps` : ''].filter(Boolean).join(' · ')
  props.item.description = station.tags || meta
  wrSearchResults.value = []
  wrSearchQuery.value = ''
}
</script>
