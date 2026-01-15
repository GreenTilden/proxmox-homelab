<template>
  <div class="ellabot-container" :class="{ 'is-open': isOpen, 'is-minimized': isMinimized }">
    <!-- Toggle Button -->
    <button
      v-if="!isOpen"
      class="ellabot-toggle nes-btn is-primary"
      @click="openChat"
    >
      <span class="bot-icon">🤖</span>
      <span class="bot-label">EllaBot</span>
    </button>

    <!-- Chat Window -->
    <div v-if="isOpen" class="ellabot-window nes-container is-dark">
      <!-- Header -->
      <div class="ellabot-header">
        <div class="header-title">
          <span class="bot-icon">🤖</span>
          <span>EllaBot</span>
          <span v-if="isOnline" class="status-dot online" title="Online"></span>
          <span v-else class="status-dot offline" title="Offline"></span>
        </div>
        <div class="header-actions">
          <button class="action-btn" @click="toggleMinimize" :title="isMinimized ? 'Expand' : 'Minimize'">
            {{ isMinimized ? '⬆️' : '⬇️' }}
          </button>
          <button class="action-btn" @click="closeChat" title="Close">✕</button>
        </div>
      </div>

      <!-- Messages (hidden when minimized) -->
      <div v-show="!isMinimized" class="ellabot-messages" ref="messagesContainer">
        <!-- Welcome Message -->
        <div v-if="messages.length === 0" class="welcome-message">
          <p>👋 Hi! I'm EllaBot, your homelab assistant.</p>
          <p>I have access to your documentation and can help with:</p>
          <ul>
            <li>🐳 Docker containers & services</li>
            <li>📦 Proxmox VMs & LXCs</li>
            <li>🔧 Configuration & troubleshooting</li>
            <li>📚 Finding docs & runbooks</li>
          </ul>
          <p class="stats" v-if="docCount > 0">
            📄 {{ docCount.toLocaleString() }} documents indexed
          </p>
        </div>

        <!-- Chat Messages -->
        <div
          v-for="(msg, index) in messages"
          :key="index"
          class="message"
          :class="msg.role"
        >
          <div class="message-content">
            <span class="message-icon">{{ msg.role === 'user' ? '👤' : '🤖' }}</span>
            <div class="message-text" v-html="formatMessage(msg.content)"></div>
          </div>
          <div v-if="msg.sources && msg.sources.length > 0" class="message-sources">
            <details>
              <summary>📚 Sources ({{ msg.sources.length }})</summary>
              <ul>
                <li v-for="(source, i) in msg.sources" :key="i">
                  {{ source.metadata?.source || source.collection }}
                </li>
              </ul>
            </details>
          </div>
        </div>

        <!-- Loading indicator -->
        <div v-if="isLoading" class="message assistant loading">
          <div class="message-content">
            <span class="message-icon">🤖</span>
            <div class="message-text typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Input (hidden when minimized) -->
      <div v-show="!isMinimized" class="ellabot-input">
        <input
          v-model="inputText"
          type="text"
          class="nes-input"
          placeholder="Ask about your homelab..."
          @keyup.enter="sendMessage"
          :disabled="isLoading"
        />
        <button
          class="nes-btn is-primary send-btn"
          @click="sendMessage"
          :disabled="isLoading || !inputText.trim()"
        >
          {{ isLoading ? '...' : '➤' }}
        </button>
      </div>

      <!-- RAG Toggle -->
      <div v-show="!isMinimized" class="ellabot-options">
        <label>
          <input type="checkbox" class="nes-checkbox" v-model="useRag" />
          <span>Use docs context</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue'
import * as ellabotApi from '../../services/ellabotApi'
import type { ChatMessage } from '../../services/ellabotApi'

interface DisplayMessage extends ChatMessage {
  sources?: Array<{ collection: string; metadata: Record<string, unknown>; snippet: string }>
}

const isOpen = ref(false)
const isMinimized = ref(false)
const isLoading = ref(false)
const isOnline = ref(false)
const inputText = ref('')
const useRag = ref(true)
const messages = ref<DisplayMessage[]>([])
const messagesContainer = ref<HTMLElement | null>(null)
const docCount = ref(0)

// Check if EllaBot is online
const checkHealth = async () => {
  try {
    const health = await ellabotApi.getHealth()
    isOnline.value = health.status === 'ok'

    // Get doc count
    const collections = await ellabotApi.getCollections()
    docCount.value = Object.values(collections.collections).reduce((sum, c) => sum + c.count, 0)
  } catch {
    isOnline.value = false
  }
}

const openChat = () => {
  isOpen.value = true
  isMinimized.value = false
}

const closeChat = () => {
  isOpen.value = false
}

const toggleMinimize = () => {
  isMinimized.value = !isMinimized.value
}

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const formatMessage = (text: string): string => {
  // Basic markdown-like formatting
  return text
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
}

const sendMessage = async () => {
  const text = inputText.value.trim()
  if (!text || isLoading.value) return

  // Add user message
  messages.value.push({ role: 'user', content: text })
  inputText.value = ''
  isLoading.value = true
  scrollToBottom()

  try {
    // Build history for context
    const history = messages.value.slice(-10).map(m => ({
      role: m.role,
      content: m.content
    }))

    const response = await ellabotApi.chat(text, {
      useRag: useRag.value,
      history: history.slice(0, -1) // Exclude the message we just sent
    })

    if (response.success) {
      messages.value.push({
        role: 'assistant',
        content: response.response,
        sources: response.sources
      })
    } else {
      messages.value.push({
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request.'
      })
    }
  } catch (error) {
    console.error('EllaBot error:', error)
    messages.value.push({
      role: 'assistant',
      content: '⚠️ Could not connect to EllaBot. Please check if the service is running.'
    })
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}

onMounted(() => {
  checkHealth()
  // Refresh status periodically
  setInterval(checkHealth, 30000)
})
</script>

<style scoped>
.ellabot-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  font-family: 'Press Start 2P', monospace;
}

.ellabot-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  font-size: 10px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.bot-icon {
  font-size: 16px;
}

.ellabot-window {
  width: 380px;
  max-height: 500px;
  display: flex;
  flex-direction: column;
  background: var(--bg-card, #1a1a2e) !important;
  border: 4px solid var(--color-primary-3, #4a9eff) !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.ellabot-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: var(--color-primary-4, #2a5a9e);
  border-bottom: 2px solid var(--color-primary-3, #4a9eff);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 10px;
  color: var(--text-bright, #fff);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.status-dot.online {
  background: #4ade80;
  box-shadow: 0 0 8px #4ade80;
}

.status-dot.offline {
  background: #f87171;
}

.header-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 12px;
  padding: 4px;
  opacity: 0.8;
}

.action-btn:hover {
  opacity: 1;
}

.ellabot-messages {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  min-height: 200px;
  max-height: 300px;
  background: var(--bg-surface, #0f0f1a);
}

.welcome-message {
  font-size: 8px;
  color: var(--text-secondary, #a0a0a0);
  line-height: 1.8;
}

.welcome-message ul {
  list-style: none;
  padding: 0;
  margin: 8px 0;
}

.welcome-message li {
  margin: 4px 0;
}

.welcome-message .stats {
  margin-top: 12px;
  padding: 8px;
  background: rgba(74, 158, 255, 0.1);
  border-radius: 4px;
}

.message {
  margin-bottom: 12px;
}

.message-content {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.message-icon {
  font-size: 14px;
  flex-shrink: 0;
}

.message-text {
  font-size: 9px;
  line-height: 1.6;
  word-wrap: break-word;
  color: var(--text-primary, #e0e0e0);
}

.message.user .message-text {
  color: var(--color-accent-3, #ffd700);
}

.message-text :deep(pre) {
  background: rgba(0, 0, 0, 0.3);
  padding: 8px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 8px 0;
}

.message-text :deep(code) {
  font-family: 'Courier New', monospace;
  background: rgba(0, 0, 0, 0.2);
  padding: 2px 4px;
  border-radius: 2px;
}

.message-sources {
  margin-top: 4px;
  margin-left: 24px;
  font-size: 7px;
  color: var(--text-muted, #666);
}

.message-sources summary {
  cursor: pointer;
  color: var(--color-primary-3, #4a9eff);
}

.message-sources ul {
  list-style: none;
  padding-left: 12px;
  margin: 4px 0;
}

.typing-indicator {
  display: flex;
  gap: 4px;
}

.typing-indicator span {
  width: 6px;
  height: 6px;
  background: var(--color-primary-3, #4a9eff);
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.ellabot-input {
  display: flex;
  gap: 8px;
  padding: 8px 12px;
  border-top: 2px solid var(--color-primary-2, #2a4a7e);
}

.ellabot-input .nes-input {
  flex: 1;
  font-size: 9px;
  padding: 8px;
  font-family: inherit;
}

.send-btn {
  font-size: 12px;
  padding: 8px 12px;
}

.ellabot-options {
  padding: 4px 12px 8px;
  font-size: 7px;
  color: var(--text-muted, #666);
}

.ellabot-options label {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

.ellabot-options .nes-checkbox {
  transform: scale(0.6);
}

/* Minimized state */
.is-minimized .ellabot-window {
  max-height: auto;
}
</style>
