<template>
  <ClientOnly>
    <Component :is="component" v-bind="props" />

    <template #fallback>
      <ServicePlaceholder :animate="false" />
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import ServicePlaceholder from './service/Placeholder.vue'
import type { Service } from '~/types'

const props = defineProps<Service>()

// At the moment there is a "flash" problem with the component.
// It is necessary to fix it and remove manual mapping
function resolveByTypeComponent(type: string) {
  // const name = capitalize(camelize(type))
  // return defineAsyncComponent({
  //   loader: () => import(`~/components/service/${name}.vue`),
  //   loadingComponent: ServicePlaceholder,
  //   suspensible: false,
  // })

  if (type === 'ip-api') {
    return resolveComponent('ServiceIpApi')
  }

  if (type === 'openweathermap') {
    return resolveComponent('ServiceOpenWeatherMap')
  }

  if (type === 'time' || type === 'timezone') {
    return resolveComponent('ServiceTimezone')
  }

  if (type === 'datetime-weather') {
    return resolveComponent('ServiceDatetimeWeather')
  }

  if (type === 'greeting') {
    return resolveComponent('ServiceGreeting')
  }

  if (type === 'custom-html') {
    return resolveComponent('ServiceCustomHtml')
  }

  if (type === 'tomtom-eta') {
    return resolveComponent('ServiceTomtomEta')
  }

  if (type === 'tomtom-eta-map') {
    return resolveComponent('ServiceTomtomEtaMap')
  }

  if (type === 'tomtom-traffic-map') {
    return resolveComponent('ServiceTomtomTrafficMap')
  }

  if (type === 'web-radio') {
    return resolveComponent('ServiceWebRadio')
  }

  if (type === 'uptime-kuma') {
    return resolveComponent('ServiceUptimeKuma')
  }

  return resolveComponent('ServiceBase')
}

const component = props.type
  ? resolveByTypeComponent(props.type)
  : resolveComponent('ServiceBase')
</script>
