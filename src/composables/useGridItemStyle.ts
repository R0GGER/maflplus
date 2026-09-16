export function useGridItemStyle() {
  const { $settings } = useNuxtApp()

  const iconSize = computed(() => $settings.layout?.grid?.iconSize ?? '4rem')
  const itemPadding = computed(() => $settings.layout?.grid?.itemPadding ?? '1rem')

  // Without an icon the full top padding leaves a tall empty header. Half on
  // top keeps it denser. Left/right stay full so the text still lines up with
  // the group title (which uses the same horizontal inset).
  const noIconPadding = computed(() => {
    const pad = itemPadding.value
    const match = pad.match(/^([\d.]+)(\D*)$/)
    if (!match) return pad
    return `${parseFloat(match[1]) / 2}${match[2] || 'rem'}`
  })

  const cardStyle = computed(() => ({
    padding: itemPadding.value,
    gap: itemPadding.value,
  }))

  function cardStyleFor(icon?: { hidden?: boolean }) {
    if (!icon?.hidden) {
      return cardStyle.value
    }

    const pad = itemPadding.value
    const compact = noIconPadding.value

    return {
      padding: `${compact} ${pad} ${pad} ${pad}`,
      gap: 0,
    }
  }

  const iconStyle = computed(() => ({
    width: iconSize.value,
    height: iconSize.value,
  }))

  return { iconSize, itemPadding, noIconPadding, cardStyle, cardStyleFor, iconStyle }
}
