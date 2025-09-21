<template>
  <div id="app">
    <h1>Test Dashboard</h1>
    <p>If you can see this, Vue is working!</p>
    <div class="test-card">
      <h2>Basic Test</h2>
      <p>Current time: {{ currentTime }}</p>
      <button @click="updateTime">Update Time</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const currentTime = ref(new Date().toLocaleTimeString())

const updateTime = () => {
  currentTime.value = new Date().toLocaleTimeString()
}
</script>

<style scoped>
#app {
  padding: 2rem;
  font-family: Arial, sans-serif;
}

h1 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.test-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
  background: #f9f9f9;
}

button {
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #0056b3;
}
</style>