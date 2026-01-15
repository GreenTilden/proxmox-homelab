<template>
  <div class="ellabot-page">
    <!-- Header -->
    <header class="page-header">
      <div class="header-left">
        <router-link to="/" class="nes-btn is-warning back-btn">
          ← Back
        </router-link>
        <h1 class="nes-text is-primary page-title">
          <span class="bot-icon">🤖</span>
          EllaBot AI Assistant
        </h1>
      </div>
      <div class="header-center">
        <button
          class="nes-btn tab-btn"
          :class="{ 'is-primary': activeTab === 'chat' }"
          @click="activeTab = 'chat'"
        >
          💬 Chat
        </button>
        <button
          class="nes-btn tab-btn"
          :class="{ 'is-primary': activeTab === 'digest' }"
          @click="activeTab = 'digest'"
        >
          📋 Digest
        </button>
      </div>
      <div class="header-right">
        <span class="status-indicator" :class="{ online: isOnline, offline: !isOnline }">
          {{ isOnline ? '● Online' : '○ Offline' }}
        </span>
      </div>
    </header>

    <!-- Main Content -->
    <div class="page-content">
      <!-- Chat Tab -->
      <template v-if="activeTab === 'chat'">
      <!-- Sidebar -->
      <aside class="sidebar nes-container is-dark">
        <div class="sidebar-section">
          <h3 class="section-title">📊 Stats</h3>
          <div class="stat-item">
            <span class="stat-label">Documents:</span>
            <span class="stat-value nes-text is-success">{{ docCount.toLocaleString() }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Collections:</span>
            <span class="stat-value nes-text is-primary">{{ Object.keys(collections).length }}</span>
          </div>
        </div>

        <div class="sidebar-section">
          <h3 class="section-title">📚 Collections</h3>
          <div class="collection-list">
            <div
              v-for="(info, name) in collections"
              :key="name"
              class="collection-item"
              :class="{ active: selectedCollections.includes(name as string) }"
              @click="toggleCollection(name as string)"
            >
              <span class="collection-name">{{ name }}</span>
              <span class="collection-count nes-text is-disabled">{{ info.count }}</span>
            </div>
          </div>
        </div>

        <div class="sidebar-section">
          <h3 class="section-title">⚙️ Options</h3>
          <label class="nes-checkbox-label">
            <input type="checkbox" class="nes-checkbox" v-model="useRag" />
            <span>Use RAG Context</span>
          </label>
          <label class="nes-checkbox-label">
            <input type="checkbox" class="nes-checkbox" v-model="showSources" />
            <span>Show Sources</span>
          </label>
        </div>

        <div class="sidebar-section">
          <h3 class="section-title">🎮 Model</h3>
          <div class="model-info">
            <span class="nes-text is-primary">{{ currentModel || 'auto' }}</span>
          </div>
        </div>

        <div class="sidebar-section">
          <button class="nes-btn is-error clear-btn" @click="clearChat">
            🗑️ Clear Chat
          </button>
        </div>
      </aside>

      <!-- Chat Area -->
      <main class="chat-area">
        <div class="chat-container nes-container is-dark">
          <!-- Messages -->
          <div class="messages-wrapper" ref="messagesContainer">
            <!-- Welcome Message -->
            <div v-if="messages.length === 0" class="welcome-section">
              <div class="welcome-box nes-container is-rounded">
                <h2 class="nes-text is-primary">Welcome to EllaBot!</h2>
                <p>I'm your AI-powered homelab assistant with access to your documentation.</p>
                <div class="capabilities">
                  <div class="capability-item">
                    <span class="capability-icon">🐳</span>
                    <span>Docker & Containers</span>
                  </div>
                  <div class="capability-item">
                    <span class="capability-icon">📦</span>
                    <span>Proxmox VMs & LXCs</span>
                  </div>
                  <div class="capability-item">
                    <span class="capability-icon">🔧</span>
                    <span>Configuration Help</span>
                  </div>
                  <div class="capability-item">
                    <span class="capability-icon">📚</span>
                    <span>Documentation Search</span>
                  </div>
                </div>
                <p class="hint nes-text is-disabled">Try asking about your services, configs, or troubleshooting!</p>
              </div>
            </div>

            <!-- Chat Messages -->
            <div
              v-for="(msg, index) in messages"
              :key="index"
              class="message-row"
              :class="msg.role"
            >
              <div class="message-bubble nes-container" :class="msg.role === 'user' ? 'is-rounded' : 'is-dark'">
                <div class="message-header">
                  <span class="message-icon">{{ msg.role === 'user' ? '👤' : '🤖' }}</span>
                  <span class="message-role">{{ msg.role === 'user' ? 'You' : 'EllaBot' }}</span>
                </div>
                <div class="message-content" v-html="formatMessage(msg.content)"></div>

                <!-- Sources -->
                <div v-if="showSources && msg.sources && msg.sources.length > 0" class="message-sources">
                  <details>
                    <summary class="nes-text is-primary">📚 Sources ({{ msg.sources.length }})</summary>
                    <ul class="source-list">
                      <li v-for="(source, i) in msg.sources" :key="i" class="source-item">
                        <span class="source-collection">{{ source.collection }}</span>
                        <span class="source-file" v-if="source.metadata?.source">
                          {{ source.metadata.source }}
                        </span>
                      </li>
                    </ul>
                  </details>
                </div>
              </div>
            </div>

            <!-- Loading Indicator -->
            <div v-if="isLoading" class="message-row assistant">
              <div class="message-bubble nes-container is-dark">
                <div class="message-header">
                  <span class="message-icon">🤖</span>
                  <span class="message-role">EllaBot</span>
                </div>
                <div class="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          </div>

          <!-- Input Area -->
          <div class="input-area">
            <div class="input-wrapper">
              <input
                v-model="inputText"
                type="text"
                class="nes-input"
                placeholder="Ask EllaBot anything about your homelab..."
                @keyup.enter="sendMessage"
                :disabled="isLoading"
              />
              <button
                class="nes-btn is-primary send-btn"
                @click="sendMessage"
                :disabled="isLoading || !inputText.trim()"
              >
                {{ isLoading ? '...' : 'Send ➤' }}
              </button>
            </div>
          </div>
        </div>
      </main>
      </template>

      <!-- Digest Tab -->
      <div v-if="activeTab === 'digest'" class="digest-container">
        <div class="digest-panel nes-container is-dark">
          <h2 class="nes-text is-primary">📋 Claude Code Digest</h2>
          <p class="digest-description">
            Paste raw Claude Code conversation text to clean up formatting and save to Obsidian.
          </p>

          <!-- Input Area -->
          <div class="digest-input-section">
            <label class="nes-text is-primary">Raw Text:</label>
            <textarea
              v-model="digestInput"
              class="nes-textarea digest-textarea"
              placeholder="Paste your Claude Code conversation here..."
              rows="10"
            ></textarea>
          </div>

          <!-- Optional Title -->
          <div class="digest-title-section">
            <label class="nes-text is-primary">Title (optional):</label>
            <input
              v-model="digestTitle"
              type="text"
              class="nes-input"
              placeholder="Auto-generated if blank"
            />
          </div>

          <!-- Actions -->
          <div class="digest-actions">
            <button
              class="nes-btn"
              @click="previewDigest"
              :disabled="!digestInput.trim() || digestProcessing"
            >
              👁️ Preview
            </button>
            <button
              class="nes-btn is-primary"
              @click="saveDigest"
              :disabled="!digestInput.trim() || digestProcessing"
            >
              {{ digestProcessing ? '...' : '💾 Save to Vault' }}
            </button>
          </div>

          <!-- Preview/Result -->
          <div v-if="digestPreviewText" class="digest-preview nes-container">
            <div class="preview-header">
              <span class="nes-text is-success">Cleaned Preview</span>
              <span class="reduction-badge" v-if="digestReduction">
                -{{ digestReduction }}% smaller
              </span>
            </div>
            <pre class="preview-text">{{ digestPreviewText }}</pre>
          </div>

          <!-- Success Link -->
          <div v-if="digestResult" class="digest-result nes-container is-rounded">
            <p class="nes-text is-success">✓ Saved successfully!</p>
            <p class="result-file">📄 {{ digestResult.filename }}</p>
            <a
              :href="digestResult.obsidian_uri"
              class="nes-btn is-success obsidian-link"
              target="_blank"
            >
              📖 Open in Obsidian
            </a>
          </div>

          <!-- Error -->
          <div v-if="digestError" class="digest-error nes-container is-dark">
            <p class="nes-text is-error">⚠️ {{ digestError }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Scanline Overlay -->
    <div class="scanline-overlay"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue'
import * as ellabotApi from '../services/ellabotApi'
import type { ChatMessage, CollectionStats, DigestSaveResponse } from '../services/ellabotApi'

interface DisplayMessage extends ChatMessage {
  sources?: Array<{ collection: string; metadata: Record<string, unknown>; snippet: string }>
}

// Tab state
const activeTab = ref<'chat' | 'digest'>('chat')

// Chat State
const isLoading = ref(false)
const isOnline = ref(false)
const inputText = ref('')
const useRag = ref(true)
const showSources = ref(true)
const messages = ref<DisplayMessage[]>([])
const messagesContainer = ref<HTMLElement | null>(null)
const docCount = ref(0)
const collections = ref<CollectionStats>({})
const selectedCollections = ref<string[]>([])
const currentModel = ref('')

// Load saved messages from localStorage
const loadSavedMessages = () => {
  try {
    const saved = localStorage.getItem('ellabot-messages')
    if (saved) {
      messages.value = JSON.parse(saved)
    }
  } catch (e) {
    console.error('Failed to load saved messages:', e)
  }
}

// Save messages to localStorage
const saveMessages = () => {
  try {
    // Keep only last 50 messages to avoid storage limits
    const toSave = messages.value.slice(-50)
    localStorage.setItem('ellabot-messages', JSON.stringify(toSave))
  } catch (e) {
    console.error('Failed to save messages:', e)
  }
}

// Check health and load stats
const checkHealth = async () => {
  try {
    const health = await ellabotApi.getHealth()
    isOnline.value = health.status === 'ok'

    const collectionsData = await ellabotApi.getCollections()
    collections.value = collectionsData.collections
    docCount.value = Object.values(collectionsData.collections).reduce((sum, c) => sum + c.count, 0)
  } catch {
    isOnline.value = false
  }
}

const toggleCollection = (name: string) => {
  const idx = selectedCollections.value.indexOf(name)
  if (idx >= 0) {
    selectedCollections.value.splice(idx, 1)
  } else {
    selectedCollections.value.push(name)
  }
}

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const formatMessage = (text: string): string => {
  return text
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="code-block"><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
}

const sendMessage = async () => {
  const text = inputText.value.trim()
  if (!text || isLoading.value) return

  messages.value.push({ role: 'user', content: text })
  inputText.value = ''
  isLoading.value = true
  scrollToBottom()

  try {
    const history = messages.value.slice(-10).map(m => ({
      role: m.role,
      content: m.content
    }))

    const response = await ellabotApi.chat(text, {
      useRag: useRag.value,
      history: history.slice(0, -1)
    })

    if (response.success) {
      currentModel.value = response.model_used
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
      content: '⚠️ Could not connect to EllaBot. Please check if the service is running on CT 120.'
    })
  } finally {
    isLoading.value = false
    saveMessages()
    scrollToBottom()
  }
}

const clearChat = () => {
  messages.value = []
  localStorage.removeItem('ellabot-messages')
}

// Digest State
const digestInput = ref('')
const digestTitle = ref('')
const digestProcessing = ref(false)
const digestPreviewText = ref('')
const digestReduction = ref(0)
const digestResult = ref<DigestSaveResponse | null>(null)
const digestError = ref('')

const previewDigest = async () => {
  if (!digestInput.value.trim()) return

  digestProcessing.value = true
  digestError.value = ''
  digestResult.value = null

  try {
    const result = await ellabotApi.digestPreview(digestInput.value)
    if (result.success) {
      digestPreviewText.value = result.cleaned_text
      digestReduction.value = result.reduction_percent
    } else {
      digestError.value = 'Preview failed'
    }
  } catch (error) {
    digestError.value = `Error: ${error}`
  } finally {
    digestProcessing.value = false
  }
}

const saveDigest = async () => {
  if (!digestInput.value.trim()) return

  digestProcessing.value = true
  digestError.value = ''
  digestResult.value = null

  try {
    const result = await ellabotApi.digestSave(
      digestInput.value,
      digestTitle.value || undefined
    )
    if (result.success) {
      digestResult.value = result
      digestPreviewText.value = result.cleaned_text
      digestReduction.value = Math.round((1 - result.cleaned_length / result.original_length) * 100)
      // Clear input after successful save
      digestInput.value = ''
      digestTitle.value = ''
    } else {
      digestError.value = result.error || 'Save failed'
    }
  } catch (error) {
    digestError.value = `Error: ${error}`
  } finally {
    digestProcessing.value = false
  }
}

onMounted(() => {
  loadSavedMessages()
  checkHealth()
  setInterval(checkHealth, 30000)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

.ellabot-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%);
  font-family: 'Press Start 2P', monospace;
  position: relative;
  overflow: hidden;
}

/* Scanline overlay */
.scanline-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.1) 0px,
    rgba(0, 0, 0, 0.1) 1px,
    transparent 1px,
    transparent 2px
  );
  pointer-events: none;
  z-index: 1000;
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: rgba(26, 26, 46, 0.95);
  border-bottom: 4px solid #4a9eff;
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  font-size: 8px !important;
}

.page-title {
  font-size: 14px;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  text-shadow: 0 0 10px #4a9eff;
}

.bot-icon {
  font-size: 24px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.status-indicator {
  font-size: 10px;
  padding: 8px 16px;
  border-radius: 4px;
  border: 2px solid;
}

.status-indicator.online {
  color: #4ade80;
  border-color: #4ade80;
  background: rgba(74, 222, 128, 0.1);
  text-shadow: 0 0 8px #4ade80;
}

.status-indicator.offline {
  color: #f87171;
  border-color: #f87171;
  background: rgba(248, 113, 113, 0.1);
}

/* Main Content Layout */
.page-content {
  display: flex;
  height: calc(100vh - 80px);
  padding: 16px;
  gap: 16px;
}

/* Sidebar */
.sidebar {
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  background: rgba(15, 15, 26, 0.9) !important;
  border-color: #4a9eff !important;
}

.sidebar-section {
  padding-bottom: 12px;
  border-bottom: 2px dashed rgba(74, 158, 255, 0.3);
}

.sidebar-section:last-child {
  border-bottom: none;
}

.section-title {
  font-size: 9px;
  color: #4a9eff;
  margin: 0 0 12px 0;
  text-shadow: 0 0 5px #4a9eff;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  font-size: 8px;
  margin-bottom: 8px;
}

.stat-label {
  color: #a0a0a0;
}

/* Collection List */
.collection-list {
  max-height: 150px;
  overflow-y: auto;
}

.collection-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 8px;
  font-size: 7px;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 3px;
  margin-bottom: 4px;
  transition: all 0.2s;
}

.collection-item:hover {
  background: rgba(74, 158, 255, 0.1);
  border-color: rgba(74, 158, 255, 0.3);
}

.collection-item.active {
  background: rgba(74, 158, 255, 0.2);
  border-color: #4a9eff;
}

.collection-name {
  color: #e0e0e0;
}

/* Options */
.nes-checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 7px;
  color: #a0a0a0;
  margin-bottom: 8px;
  cursor: pointer;
}

.nes-checkbox {
  transform: scale(0.7);
}

/* Model Info */
.model-info {
  font-size: 8px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
}

.clear-btn {
  width: 100%;
  font-size: 8px !important;
}

/* Chat Area */
.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(15, 15, 26, 0.9) !important;
  border-color: #4a9eff !important;
  overflow: hidden;
}

.messages-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  scroll-behavior: smooth;
}

/* Welcome Section */
.welcome-section {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.welcome-box {
  max-width: 500px;
  text-align: center;
  background: rgba(26, 26, 46, 0.8) !important;
}

.welcome-box h2 {
  font-size: 14px;
  margin-bottom: 16px;
}

.welcome-box p {
  font-size: 9px;
  line-height: 1.8;
  color: #a0a0a0;
  margin-bottom: 16px;
}

.capabilities {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin: 20px 0;
}

.capability-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 8px;
  color: #e0e0e0;
  padding: 8px;
  background: rgba(74, 158, 255, 0.1);
  border-radius: 4px;
  border: 1px solid rgba(74, 158, 255, 0.2);
}

.capability-icon {
  font-size: 16px;
}

.hint {
  font-size: 7px !important;
  font-style: italic;
}

/* Messages */
.message-row {
  margin-bottom: 16px;
  display: flex;
}

.message-row.user {
  justify-content: flex-end;
}

.message-row.assistant {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 70%;
  padding: 12px 16px !important;
}

.message-row.user .message-bubble {
  background: rgba(74, 158, 255, 0.2) !important;
  border-color: #4a9eff !important;
}

.message-row.assistant .message-bubble {
  background: rgba(26, 26, 46, 0.9) !important;
  border-color: #666 !important;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 8px;
}

.message-icon {
  font-size: 16px;
}

.message-role {
  color: #4a9eff;
  font-weight: bold;
}

.message-row.user .message-role {
  color: #ffd700;
}

.message-content {
  font-size: 10px;
  line-height: 1.8;
  color: #e0e0e0;
  word-wrap: break-word;
}

.message-content :deep(.code-block) {
  background: rgba(0, 0, 0, 0.4);
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 8px 0;
  border: 1px solid rgba(74, 158, 255, 0.3);
}

.message-content :deep(.inline-code) {
  background: rgba(74, 158, 255, 0.2);
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
}

/* Sources */
.message-sources {
  margin-top: 12px;
  padding-top: 8px;
  border-top: 1px dashed rgba(74, 158, 255, 0.3);
}

.message-sources summary {
  font-size: 8px;
  cursor: pointer;
}

.source-list {
  list-style: none;
  padding: 8px 0 0 0;
  margin: 0;
}

.source-item {
  font-size: 7px;
  padding: 4px 0;
  color: #a0a0a0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.source-collection {
  color: #4ade80;
}

.source-file {
  color: #666;
  font-size: 6px;
}

/* Typing Indicator */
.typing-indicator {
  display: flex;
  gap: 6px;
  padding: 4px 0;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: #4a9eff;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

/* Input Area */
.input-area {
  padding: 16px;
  border-top: 2px solid rgba(74, 158, 255, 0.3);
  background: rgba(15, 15, 26, 0.95);
}

.input-wrapper {
  display: flex;
  gap: 12px;
}

.input-wrapper .nes-input {
  flex: 1;
  font-size: 10px;
  font-family: inherit;
  padding: 12px;
  background: rgba(26, 26, 46, 0.9);
  border-color: #4a9eff;
  color: #e0e0e0;
}

.input-wrapper .nes-input::placeholder {
  color: #666;
}

.send-btn {
  font-size: 10px !important;
  padding: 12px 20px !important;
  white-space: nowrap;
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
}

::-webkit-scrollbar-thumb {
  background: #4a9eff;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #6ab0ff;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .page-content {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    max-height: 200px;
  }

  .message-bubble {
    max-width: 90%;
  }

  .capabilities {
    grid-template-columns: 1fr;
  }
}

/* Header Center - Tabs */
.header-center {
  display: flex;
  gap: 8px;
}

.tab-btn {
  font-size: 9px !important;
  padding: 8px 16px !important;
}

/* Digest Tab Styles */
.digest-container {
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 20px;
}

.digest-panel {
  width: 100%;
  max-width: 800px;
  background: rgba(15, 15, 26, 0.9) !important;
  border-color: #4a9eff !important;
  padding: 24px !important;
}

.digest-panel h2 {
  font-size: 14px;
  margin: 0 0 16px 0;
  text-shadow: 0 0 10px #4a9eff;
}

.digest-description {
  font-size: 9px;
  color: #a0a0a0;
  margin-bottom: 24px;
  line-height: 1.6;
}

.digest-input-section,
.digest-title-section {
  margin-bottom: 16px;
}

.digest-input-section label,
.digest-title-section label {
  display: block;
  font-size: 9px;
  margin-bottom: 8px;
}

.digest-textarea {
  width: 100%;
  font-family: 'Courier New', monospace;
  font-size: 10px;
  background: rgba(0, 0, 0, 0.3) !important;
  color: #e0e0e0 !important;
  border-color: #4a9eff !important;
  resize: vertical;
  min-height: 200px;
}

.digest-title-section .nes-input {
  font-size: 10px;
  font-family: inherit;
  background: rgba(26, 26, 46, 0.9);
  color: #e0e0e0;
  border-color: #4a9eff;
}

.digest-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.digest-actions .nes-btn {
  font-size: 9px !important;
}

.digest-preview {
  margin-bottom: 16px;
  background: rgba(0, 0, 0, 0.3) !important;
  border-color: #4ade80 !important;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 9px;
}

.reduction-badge {
  background: rgba(74, 222, 128, 0.2);
  color: #4ade80;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 8px;
}

.preview-text {
  font-family: 'Courier New', monospace;
  font-size: 9px;
  color: #e0e0e0;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 300px;
  overflow-y: auto;
  margin: 0;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.digest-result {
  background: rgba(74, 222, 128, 0.1) !important;
  border-color: #4ade80 !important;
  text-align: center;
  padding: 16px !important;
}

.digest-result p {
  font-size: 10px;
  margin: 0 0 12px 0;
}

.result-file {
  font-size: 8px;
  color: #a0a0a0;
}

.obsidian-link {
  font-size: 9px !important;
  margin-top: 8px;
}

.digest-error {
  border-color: #f87171 !important;
  padding: 12px !important;
}

.digest-error p {
  font-size: 9px;
  margin: 0;
}
</style>
