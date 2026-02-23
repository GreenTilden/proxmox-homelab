<template>
  <div :style="gridStyles">
    <component
      v-for="link in links"
      :key="link.label"
      :is="link.url.startsWith('/') ? 'router-link' : 'a'"
      :to="link.url.startsWith('/') ? link.url : undefined"
      :href="link.url.startsWith('/') ? undefined : link.url"
      :target="link.url.startsWith('/') ? undefined : '_blank'"
      class="nes-btn"
      :style="linkStyles(link.color)"
    >
      <span class="nav-emoji">{{ link.emoji }}</span> {{ link.label }}
    </component>
  </div>
</template>

<script setup lang="ts">
export interface QuickLink {
  label: string
  url: string
  emoji: string
  color: string
}

defineProps<{ links: QuickLink[] }>()

const gridStyles = { display: 'flex', flexWrap: 'wrap' as const, gap: '0.4rem' }
const linkStyles = (color: string) => ({
  fontSize: '0.6rem', padding: '0.35rem 0.6rem', background: color,
  color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem',
})
</script>
