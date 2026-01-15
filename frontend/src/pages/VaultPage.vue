<template>
  <div class="vault-page">
    <header class="vault-header">
      <router-link to="/" class="back-link">
        <span>&larr;</span> Dashboard
      </router-link>
      <h1 class="vault-title">Obsidian Vault</h1>
      <div class="sync-status" v-if="lastSync">
        <span class="sync-icon">📚</span>
        <span class="sync-text">Auto-sync active</span>
      </div>
    </header>

    <div class="vault-content">
      <aside class="vault-sidebar">
        <div class="sidebar-section">
          <h3 class="sidebar-title">Notebooks</h3>
          <div class="notebook-list">
            <a
              v-for="nb in notebooks"
              :key="nb.filename"
              :href="`http://192.168.0.250:8888/jupyter/notebooks/${nb.filename}?token=homelab2026`"
              target="_blank"
              class="notebook-link"
            >
              <span class="notebook-icon">📓</span>
              <span class="notebook-name">{{ nb.name }}</span>
            </a>
          </div>
        </div>

        <div class="sidebar-section">
          <h3 class="sidebar-title">Files</h3>
          <div class="file-tree" v-if="fileTree.length">
            <FileTreeNode
              v-for="node in fileTree"
              :key="node.path"
              :node="node"
              :selected-path="selectedPath"
              @select="selectFile"
            />
          </div>
          <div v-else class="loading">Loading...</div>
        </div>

        <div class="sidebar-section">
          <h3 class="sidebar-title">Search</h3>
          <input
            v-model="searchQuery"
            @keyup.enter="search"
            type="text"
            placeholder="Search vault..."
            class="search-input"
          />
          <div class="search-results" v-if="searchResults.length">
            <div
              v-for="result in searchResults"
              :key="result.path"
              @click="selectFile(result.path)"
              class="search-result"
            >
              {{ result.name }}
            </div>
          </div>
        </div>
      </aside>

      <main class="vault-main">
        <div v-if="loading" class="loading-content">
          <span class="spinner">⏳</span> Loading...
        </div>
        <div v-else-if="error" class="error-content">
          <span>❌</span> {{ error }}
        </div>
        <div v-else-if="selectedContent" class="markdown-content" v-html="renderedContent"></div>
        <div v-else class="welcome-content">
          <h2>📂 Select a file to view</h2>
          <p>Browse the vault using the file tree on the left, or use the search to find content.</p>

          <div class="quick-stats">
            <div class="stat-card">
              <span class="stat-icon">📄</span>
              <span class="stat-value">{{ fileCount }}</span>
              <span class="stat-label">Files</span>
            </div>
            <div class="stat-card">
              <span class="stat-icon">📓</span>
              <span class="stat-value">{{ notebooks.length }}</span>
              <span class="stat-label">Notebooks</span>
            </div>
          </div>

          <div class="recent-updates">
            <h3>Infrastructure Status</h3>
            <p>Infrastructure docs are auto-synced every 5 minutes from Proxmox.</p>
            <button @click="selectFile('Homelab/Infrastructure/README.md')" class="action-btn">
              View Infrastructure →
            </button>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h, defineComponent } from 'vue'

const VAULT_API = 'http://192.168.0.250:5002'

interface FileNode {
  name: string
  path: string
  type: 'file' | 'directory'
  extension?: string
  size?: number
  children?: FileNode[]
}

interface Notebook {
  name: string
  filename: string
  path: string
  url: string
}

const fileTree = ref<FileNode[]>([])
const notebooks = ref<Notebook[]>([])
const selectedPath = ref('')
const selectedContent = ref('')
const loading = ref(false)
const error = ref('')
const searchQuery = ref('')
const searchResults = ref<{path: string, name: string}[]>([])
const lastSync = ref(true)

// Simple markdown to HTML converter
const renderedContent = computed(() => {
  if (!selectedContent.value) return ''

  let html = selectedContent.value
    // Escape HTML
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Headers
    .replace(/^### (.*)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*)$/gm, '<h2>$1</h2>')
    .replace(/^# (.*)$/gm, '<h1>$1</h1>')
    // Bold and italic
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
    // Lists
    .replace(/^- (.*)$/gm, '<li>$1</li>')
    // Tables (basic)
    .replace(/\|(.+)\|/g, (match) => {
      const cells = match.split('|').filter(c => c.trim())
      return '<tr>' + cells.map(c => `<td>${c.trim()}</td>`).join('') + '</tr>'
    })
    // Horizontal rules
    .replace(/^---$/gm, '<hr/>')
    // Paragraphs
    .replace(/\n\n/g, '</p><p>')

  return `<div class="md-body"><p>${html}</p></div>`
})

const fileCount = computed(() => {
  const count = (nodes: FileNode[]): number => {
    return nodes.reduce((acc, node) => {
      if (node.type === 'file') return acc + 1
      if (node.children) return acc + count(node.children)
      return acc
    }, 0)
  }
  return count(fileTree.value)
})

async function loadTree() {
  try {
    const res = await fetch(`${VAULT_API}/api/vault/tree`)
    const data = await res.json()
    if (data.success) {
      fileTree.value = data.tree
    }
  } catch (e) {
    console.error('Failed to load vault tree:', e)
  }
}

async function loadNotebooks() {
  try {
    const res = await fetch(`${VAULT_API}/api/vault/notebooks`)
    const data = await res.json()
    if (data.success) {
      notebooks.value = data.notebooks
    }
  } catch (e) {
    console.error('Failed to load notebooks:', e)
  }
}

async function selectFile(path: string) {
  selectedPath.value = path
  loading.value = true
  error.value = ''

  try {
    const res = await fetch(`${VAULT_API}/api/vault/file/${encodeURIComponent(path)}`)
    const data = await res.json()
    if (data.success) {
      selectedContent.value = data.content
    } else {
      error.value = data.error || 'Failed to load file'
    }
  } catch (e) {
    error.value = 'Failed to load file'
  } finally {
    loading.value = false
  }
}

async function search() {
  if (!searchQuery.value || searchQuery.value.length < 2) return

  try {
    const res = await fetch(`${VAULT_API}/api/vault/search?q=${encodeURIComponent(searchQuery.value)}`)
    const data = await res.json()
    if (data.success) {
      searchResults.value = data.results
    }
  } catch (e) {
    console.error('Search failed:', e)
  }
}

onMounted(() => {
  loadTree()
  loadNotebooks()
})

// Recursive file tree component
const FileTreeNode = defineComponent({
  name: 'FileTreeNode',
  props: {
    node: { type: Object as () => FileNode, required: true },
    selectedPath: { type: String, default: '' },
    depth: { type: Number, default: 0 }
  },
  emits: ['select'],
  setup(props, { emit }) {
    const expanded = ref(props.depth < 2)

    const toggle = () => {
      if (props.node.type === 'directory') {
        expanded.value = !expanded.value
      } else if (props.node.extension === '.md') {
        emit('select', props.node.path)
      }
    }

    return () => h('div', { class: 'tree-node' }, [
      h('div', {
        class: ['tree-item', {
          'is-dir': props.node.type === 'directory',
          'is-selected': props.selectedPath === props.node.path
        }],
        style: { paddingLeft: `${props.depth * 12}px` },
        onClick: toggle
      }, [
        props.node.type === 'directory'
          ? h('span', { class: 'tree-icon' }, expanded.value ? '📂' : '📁')
          : h('span', { class: 'tree-icon' }, props.node.extension === '.md' ? '📄' : '📋'),
        h('span', { class: 'tree-name' }, props.node.name)
      ]),
      props.node.type === 'directory' && expanded.value && props.node.children
        ? h('div', { class: 'tree-children' },
            props.node.children.map(child =>
              h(FileTreeNode, {
                node: child,
                selectedPath: props.selectedPath,
                depth: props.depth + 1,
                onSelect: (path: string) => emit('select', path)
              })
            )
          )
        : null
    ])
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

.vault-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0d1117 0%, #161b22 50%, #0d1117 100%);
  color: #c9d1d9;
  font-family: 'Segoe UI', sans-serif;
}

.vault-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(22, 27, 34, 0.95);
  border-bottom: 2px solid #30363d;
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-link {
  color: #58a6ff;
  text-decoration: none;
  font-family: 'Press Start 2P', monospace;
  font-size: 0.6rem;
  padding: 0.5rem 1rem;
  border: 2px solid #58a6ff;
  border-radius: 4px;
  transition: all 0.2s;
}

.back-link:hover {
  background: #58a6ff;
  color: #0d1117;
}

.vault-title {
  font-family: 'Press Start 2P', monospace;
  font-size: 0.9rem;
  color: #58a6ff;
  margin: 0;
}

.sync-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #3fb950;
  font-size: 0.8rem;
}

.vault-content {
  display: flex;
  min-height: calc(100vh - 60px);
}

.vault-sidebar {
  width: 280px;
  background: rgba(22, 27, 34, 0.8);
  padding: 1rem;
  border-right: 1px solid #30363d;
  overflow-y: auto;
  max-height: calc(100vh - 60px);
}

.sidebar-section {
  margin-bottom: 1.5rem;
}

.sidebar-title {
  font-family: 'Press Start 2P', monospace;
  font-size: 0.5rem;
  color: #8b949e;
  margin: 0 0 0.75rem 0;
  text-transform: uppercase;
}

.notebook-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.notebook-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: rgba(88, 166, 255, 0.1);
  border: 1px solid #30363d;
  border-radius: 4px;
  color: #c9d1d9;
  text-decoration: none;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.notebook-link:hover {
  border-color: #58a6ff;
  background: rgba(88, 166, 255, 0.2);
}

.file-tree {
  font-size: 0.85rem;
}

.tree-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.5rem;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.1s;
}

.tree-item:hover {
  background: rgba(88, 166, 255, 0.1);
}

.tree-item.is-selected {
  background: rgba(88, 166, 255, 0.2);
  color: #58a6ff;
}

.tree-icon {
  font-size: 0.9rem;
}

.tree-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search-input {
  width: 100%;
  padding: 0.5rem;
  background: rgba(48, 54, 61, 0.5);
  border: 1px solid #30363d;
  border-radius: 4px;
  color: #c9d1d9;
  font-size: 0.85rem;
}

.search-input:focus {
  outline: none;
  border-color: #58a6ff;
}

.search-results {
  margin-top: 0.5rem;
}

.search-result {
  padding: 0.4rem 0.5rem;
  font-size: 0.8rem;
  cursor: pointer;
  border-radius: 4px;
  color: #8b949e;
}

.search-result:hover {
  background: rgba(88, 166, 255, 0.1);
  color: #58a6ff;
}

.vault-main {
  flex: 1;
  padding: 2rem;
  max-width: 900px;
  overflow-y: auto;
}

.loading-content, .error-content {
  text-align: center;
  padding: 3rem;
  color: #8b949e;
}

.spinner {
  animation: spin 1s linear infinite;
  display: inline-block;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.welcome-content {
  text-align: center;
  padding: 2rem;
}

.welcome-content h2 {
  color: #58a6ff;
  margin-bottom: 1rem;
}

.quick-stats {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  margin: 2rem 0;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem 2rem;
  background: rgba(48, 54, 61, 0.4);
  border: 1px solid #30363d;
  border-radius: 8px;
}

.stat-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #58a6ff;
}

.stat-label {
  color: #8b949e;
  font-size: 0.8rem;
}

.recent-updates {
  margin-top: 2rem;
  padding: 1.5rem;
  background: rgba(48, 54, 61, 0.4);
  border: 1px solid #30363d;
  border-radius: 8px;
}

.recent-updates h3 {
  color: #58a6ff;
  margin: 0 0 0.5rem 0;
}

.action-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #58a6ff;
  color: #0d1117;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #79b8ff;
}

.markdown-content {
  line-height: 1.6;
}

.markdown-content :deep(h1) {
  color: #58a6ff;
  font-size: 1.75rem;
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #30363d;
}

.markdown-content :deep(h2) {
  color: #58a6ff;
  font-size: 1.4rem;
  margin: 1.5rem 0 0.75rem 0;
}

.markdown-content :deep(h3) {
  color: #79b8ff;
  font-size: 1.15rem;
  margin: 1.25rem 0 0.5rem 0;
}

.markdown-content :deep(pre) {
  background: rgba(48, 54, 61, 0.6);
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 0.85rem;
}

.markdown-content :deep(code) {
  background: rgba(88, 166, 255, 0.1);
  padding: 0.15rem 0.4rem;
  border-radius: 3px;
  font-family: 'Consolas', 'Monaco', monospace;
  color: #79b8ff;
}

.markdown-content :deep(pre code) {
  background: none;
  padding: 0;
}

.markdown-content :deep(a) {
  color: #58a6ff;
}

.markdown-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

.markdown-content :deep(td) {
  padding: 0.5rem;
  border: 1px solid #30363d;
}

.markdown-content :deep(li) {
  margin: 0.25rem 0;
}

.markdown-content :deep(hr) {
  border: none;
  border-top: 1px solid #30363d;
  margin: 1.5rem 0;
}

@media (max-width: 768px) {
  .vault-content {
    flex-direction: column;
  }

  .vault-sidebar {
    width: 100%;
    max-height: 300px;
  }
}
</style>
