<template>
  <header class="wh-header">
    <!-- Optional Banner with particles -->
    <WhitehouseBanner
      v-if="showBanner"
      :title="bannerTitle"
      :subtitle="bannerSubtitle"
      :house-image-src="houseImageSrc"
      :season="currentSeason"
      :enable-particles="enableParticles"
    />

    <div class="wh-header-main">
      <div class="wh-header-brand">
        <router-link to="/" class="wh-logo-link">
          <img
            v-if="logoSrc"
            :src="logoSrc"
            :alt="brandName"
            class="wh-logo"
          />
          <span class="wh-brand-text">{{ brandName }}</span>
        </router-link>
      </div>

      <h1 class="wh-header-title">{{ title }}</h1>

      <nav class="wh-header-nav">
        <slot name="nav">
          <router-link to="/" class="wh-header-link">
            Dashboard
          </router-link>
        </slot>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import WhitehouseBanner from './WhitehouseBanner.vue'

const props = withDefaults(defineProps<{
  title: string
  logoSrc?: string
  brandName?: string
  showBanner?: boolean
  bannerTitle?: string
  bannerSubtitle?: string
  houseImageSrc?: string
  enableParticles?: boolean
}>(), {
  brandName: 'Little Castle in Between',
  showBanner: true,
  bannerTitle: 'Little Castle in Between',
  bannerSubtitle: 'Indianapolis',
  houseImageSrc: '',
  enableParticles: true
})

// Detect current season based on month
const currentSeason = computed<'winter' | 'spring' | 'summer' | 'fall'>(() => {
  const month = new Date().getMonth()
  if (month >= 2 && month <= 4) return 'spring'
  if (month >= 5 && month <= 7) return 'summer'
  if (month >= 8 && month <= 10) return 'fall'
  return 'winter'
})
</script>

<style scoped>
.wh-header {
  background: var(--wh-navy-dark);
  box-shadow: var(--wh-shadow-md);
}

.wh-header-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--wh-space-4) var(--wh-space-6);
  max-width: 1400px;
  margin: 0 auto;
}

.wh-header-brand {
  flex-shrink: 0;
}

.wh-logo-link {
  display: flex;
  align-items: center;
  gap: var(--wh-space-3);
  text-decoration: none;
  color: var(--wh-white);
}

.wh-logo-link:hover {
  opacity: 0.9;
}

.wh-logo {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid var(--wh-gold);
  object-fit: cover;
}

.wh-brand-text {
  font-family: var(--wh-font-serif);
  font-size: var(--wh-text-lg);
  color: var(--wh-white);
  letter-spacing: 0.02em;
}

.wh-header-title {
  font-family: var(--wh-font-serif);
  font-size: var(--wh-text-2xl);
  font-weight: normal;
  color: var(--wh-white);
  margin: 0;
  text-align: center;
  letter-spacing: 0.03em;
}

.wh-header-nav {
  display: flex;
  align-items: center;
  gap: var(--wh-space-4);
}

.wh-header-link {
  font-family: var(--wh-font-sans);
  font-size: var(--wh-text-sm);
  font-weight: 600;
  color: var(--wh-white);
  text-decoration: none;
  padding: var(--wh-space-2) var(--wh-space-3);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: var(--wh-radius-sm);
  transition: all var(--wh-transition-fast);
}

.wh-header-link:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
}

/* Responsive */
@media (max-width: 768px) {
  .wh-header-main {
    padding: var(--wh-space-3) var(--wh-space-4);
  }

  .wh-brand-text {
    display: none;
  }

  .wh-header-title {
    font-size: var(--wh-text-lg);
  }

  .wh-header-link {
    font-size: var(--wh-text-xs);
    padding: var(--wh-space-1) var(--wh-space-2);
  }
}
</style>
