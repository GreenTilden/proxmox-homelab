<template>
  <!-- Router view renders appropriate component based on route -->
  <router-view />
</template>

<script setup lang="ts">
// No need for manual component loading - router handles it now
</script>

<style>
/* Global styles - minimal since everything is props-driven */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: 'Segoe UI', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
  overflow-x: hidden;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .grid-responsive {
    grid-template-columns: 1fr;
  }
}
</style>