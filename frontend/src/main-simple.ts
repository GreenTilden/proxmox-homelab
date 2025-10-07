import { createApp } from 'vue'

// Simple test app without any complex imports
const app = createApp({
  template: `
    <div style="padding: 2rem; background: #1a1a1a; color: white; min-height: 100vh;">
      <h1>Simple Vue App Working on Port 3002!</h1>
      <p>Current time: {{ currentTime }}</p>
      <p>Counter: {{ counter }}</p>
      <button @click="counter++" style="padding: 0.5rem; margin: 0.5rem;">Increment</button>
    </div>
  `,
  data() {
    return {
      counter: 0,
      currentTime: new Date().toLocaleTimeString()
    }
  },
  mounted() {
    setInterval(() => {
      this.currentTime = new Date().toLocaleTimeString()
    }, 1000)
  }
})

document.title = 'Simple Test - Port 3002'
app.mount('#app')