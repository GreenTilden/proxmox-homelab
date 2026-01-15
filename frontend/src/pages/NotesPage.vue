<template>
  <div class="notes-page">
    <header class="notes-header">
      <router-link to="/" class="back-link">
        <span>&larr;</span> Dashboard
      </router-link>
      <h1 class="notes-title">Homelab Notes</h1>
      <div class="sync-status" :class="{ connected: isConnected }">
        <span class="sync-icon">{{ isConnected ? '🟢' : '🔴' }}</span>
        <span class="sync-text">{{ isConnected ? 'CouchDB Connected' : 'Disconnected' }}</span>
      </div>
    </header>

    <div class="notes-content">
      <aside class="notes-sidebar">
        <h3 class="sidebar-title">Documents</h3>
        <nav class="notes-nav">
          <button
            v-for="doc in documents"
            :key="doc.id"
            @click="selectDocument(doc)"
            class="nav-link"
            :class="{ active: selectedDoc?.id === doc.id }"
          >
            {{ doc.title }}
          </button>
        </nav>

        <div class="sync-info">
          <h4>Obsidian Sync</h4>
          <p>Server: sync.darrenarney.com</p>
          <p>Database: obsidian-vault</p>
          <button @click="refreshDocs" class="refresh-btn">
            🔄 Refresh
          </button>
        </div>
      </aside>

      <main class="notes-main">
        <div v-if="isLoading" class="loading">
          Loading documents...
        </div>
        <div v-else-if="selectedDoc" class="document-view">
          <h2 class="doc-title">{{ selectedDoc.title }}</h2>
          <div class="doc-content" v-html="renderedContent"></div>
        </div>
        <div v-else class="no-selection">
          <p>Select a document from the sidebar to view</p>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface Document {
  id: string
  title: string
  content: string
}

const documents = ref<Document[]>([])
const selectedDoc = ref<Document | null>(null)
const isLoading = ref(true)
const isConnected = ref(false)

// Simple markdown to HTML converter
const renderMarkdown = (md: string): string => {
  let html = md
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Code blocks
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
    // Tables
    .replace(/^\|(.+)\|$/gm, (match) => {
      const cells = match.split('|').filter(c => c.trim())
      const isHeader = cells.some(c => /^[\s-:]+$/.test(c))
      if (isHeader) return ''
      const tag = 'td'
      return '<tr>' + cells.map(c => `<${tag}>${c.trim()}</${tag}>`).join('') + '</tr>'
    })
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    // List items
    .replace(/^- (.*$)/gim, '<li>$1</li>')

  // Wrap in paragraph
  html = '<p>' + html + '</p>'
  // Clean up empty paragraphs
  html = html.replace(/<p><\/p>/g, '')
  // Wrap lists
  html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
  html = html.replace(/<\/ul>\s*<ul>/g, '')
  // Wrap tables
  html = html.replace(/(<tr>.*<\/tr>)/gs, '<table>$1</table>')
  html = html.replace(/<\/table>\s*<table>/g, '')

  return html
}

const renderedContent = computed(() => {
  if (!selectedDoc.value) return ''
  return renderMarkdown(selectedDoc.value.content)
})

const selectDocument = (doc: Document) => {
  selectedDoc.value = doc
}

const fetchDocuments = async () => {
  isLoading.value = true
  try {
    // Try to fetch from CouchDB via our API proxy or directly
    const host = window.location.hostname
    const response = await fetch(`http://${host}:5984/obsidian-vault/_all_docs?include_docs=true`, {
      headers: {
        'Authorization': 'Basic ' + btoa('obsidian:sync-password-2024')
      }
    })

    if (response.ok) {
      const data = await response.json()
      isConnected.value = true

      // Parse CouchDB documents - LiveSync stores them in a specific format
      documents.value = data.rows
        .filter((row: any) => row.doc && !row.id.startsWith('_') && !row.id.startsWith('h:'))
        .map((row: any) => {
          const doc = row.doc
          // LiveSync stores content in 'data' field, title might be in path
          const title = doc.path || doc._id || 'Untitled'
          const content = doc.data || doc.content || JSON.stringify(doc, null, 2)
          return {
            id: doc._id,
            title: title.replace(/\.md$/, '').replace(/^\//, ''),
            content: content
          }
        })

      if (documents.value.length > 0) {
        selectedDoc.value = documents.value[0]
      }
    } else {
      throw new Error('Failed to fetch')
    }
  } catch (error) {
    console.error('Error fetching from CouchDB:', error)
    isConnected.value = false

    // Fallback: fetch from local vault files on server
    try {
      const host = window.location.hostname
      const files = ['Homelab Overview', 'Credentials', 'Services', 'Smart Home']
      const docs: Document[] = []

      for (const file of files) {
        try {
          const res = await fetch(`http://${host}/vault/${file}.md`)
          if (res.ok) {
            const content = await res.text()
            docs.push({ id: file, title: file, content })
          }
        } catch (e) {
          // File not found, skip
        }
      }

      if (docs.length > 0) {
        documents.value = docs
        selectedDoc.value = docs[0]
        isConnected.value = true
      }
    } catch (e) {
      console.error('Fallback also failed:', e)
    }
  }
  isLoading.value = false
}

const refreshDocs = () => {
  fetchDocuments()
}

onMounted(() => {
  fetchDocuments()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

.notes-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0d1117 0%, #161b22 50%, #0d1117 100%);
  color: #c9d1d9;
  font-family: 'Segoe UI', sans-serif;
}

.notes-header {
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

.notes-title {
  font-family: 'Press Start 2P', monospace;
  font-size: 0.9rem;
  color: #a371f7;
  margin: 0;
}

.sync-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #f85149;
  font-size: 0.8rem;
}

.sync-status.connected {
  color: #3fb950;
}

.notes-content {
  display: flex;
  min-height: calc(100vh - 60px);
}

.notes-sidebar {
  width: 250px;
  background: rgba(22, 27, 34, 0.8);
  padding: 1.5rem;
  border-right: 1px solid #30363d;
  position: sticky;
  top: 60px;
  height: calc(100vh - 60px);
  overflow-y: auto;
}

.sidebar-title {
  font-family: 'Press Start 2P', monospace;
  font-size: 0.6rem;
  color: #8b949e;
  margin: 0 0 1rem 0;
  text-transform: uppercase;
}

.notes-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.nav-link {
  background: transparent;
  border: none;
  color: #8b949e;
  text-align: left;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.nav-link:hover, .nav-link.active {
  background: rgba(163, 113, 247, 0.1);
  color: #a371f7;
}

.sync-info {
  background: rgba(48, 54, 61, 0.5);
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.8rem;
}

.sync-info h4 {
  margin: 0 0 0.5rem 0;
  color: #a371f7;
  font-size: 0.75rem;
}

.sync-info p {
  margin: 0.25rem 0;
  color: #8b949e;
}

.refresh-btn {
  margin-top: 0.75rem;
  padding: 0.5rem 1rem;
  background: rgba(163, 113, 247, 0.2);
  border: 1px solid #a371f7;
  border-radius: 4px;
  color: #a371f7;
  cursor: pointer;
  font-size: 0.75rem;
  transition: all 0.2s;
}

.refresh-btn:hover {
  background: rgba(163, 113, 247, 0.4);
}

.notes-main {
  flex: 1;
  padding: 2rem;
  max-width: 800px;
}

.loading, .no-selection {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #8b949e;
  font-style: italic;
}

.document-view {
  background: rgba(48, 54, 61, 0.4);
  border: 1px solid #30363d;
  border-radius: 8px;
  padding: 2rem;
}

.doc-title {
  font-family: 'Press Start 2P', monospace;
  font-size: 0.8rem;
  color: #a371f7;
  margin: 0 0 1.5rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #30363d;
}

.doc-content {
  line-height: 1.7;
}

.doc-content :deep(h1),
.doc-content :deep(h2),
.doc-content :deep(h3) {
  color: #58a6ff;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.doc-content :deep(h1) { font-size: 1.4rem; }
.doc-content :deep(h2) { font-size: 1.2rem; }
.doc-content :deep(h3) { font-size: 1rem; }

.doc-content :deep(p) {
  margin: 0.75rem 0;
}

.doc-content :deep(code) {
  background: rgba(88, 166, 255, 0.1);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  color: #58a6ff;
  font-family: monospace;
}

.doc-content :deep(pre) {
  background: rgba(0, 0, 0, 0.4);
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
}

.doc-content :deep(pre code) {
  background: none;
  padding: 0;
}

.doc-content :deep(a) {
  color: #58a6ff;
  text-decoration: none;
}

.doc-content :deep(a:hover) {
  text-decoration: underline;
}

.doc-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

.doc-content :deep(td),
.doc-content :deep(th) {
  padding: 0.5rem;
  border: 1px solid #30363d;
  text-align: left;
}

.doc-content :deep(tr:nth-child(odd)) {
  background: rgba(48, 54, 61, 0.3);
}

.doc-content :deep(ul),
.doc-content :deep(ol) {
  margin: 0.75rem 0;
  padding-left: 1.5rem;
}

.doc-content :deep(li) {
  margin: 0.25rem 0;
}

.doc-content :deep(strong) {
  color: #f0f6fc;
}

@media (max-width: 768px) {
  .notes-content {
    flex-direction: column;
  }

  .notes-sidebar {
    width: 100%;
    height: auto;
    position: static;
  }

  .notes-nav {
    flex-direction: row;
    flex-wrap: wrap;
  }
}
</style>
