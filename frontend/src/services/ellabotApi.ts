/**
 * EllaBot API Service
 * Client for the EllaBot RAG API on CT 120
 */

const ELLABOT_API_URL = 'http://192.168.0.120:5010'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatResponse {
  success: boolean
  response: string
  sources: Array<{
    collection: string
    metadata: Record<string, unknown>
    snippet: string
  }>
  model_used: string
  tokens: {
    prompt: number
    completion: number
  }
}

export interface QueryResponse {
  success: boolean
  answer: string
  sources: Array<{
    collection: string
    metadata: Record<string, unknown>
    snippet: string
  }>
  model_used: string
}

export interface CollectionStats {
  [key: string]: {
    count: number
    description: string
  }
}

export interface HealthStatus {
  status: string
  service: string
  version: string
  uptime_since: string
}

export interface DigestPreviewResponse {
  success: boolean
  original_length: number
  cleaned_length: number
  cleaned_text: string
  reduction_percent: number
}

export interface DigestSaveResponse {
  success: boolean
  original_length: number
  cleaned_length: number
  cleaned_text: string
  filename?: string
  filepath?: string
  obsidian_uri?: string
  webdav_url?: string
  error?: string
}

/**
 * Send a chat message to EllaBot with optional RAG context
 */
export async function chat(
  message: string,
  options: {
    useRag?: boolean
    history?: ChatMessage[]
    model?: string
  } = {}
): Promise<ChatResponse> {
  const { useRag = true, history = [], model = 'auto' } = options

  const response = await fetch(`${ELLABOT_API_URL}/api/ellabot/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      use_rag: useRag,
      history,
      model
    })
  })

  if (!response.ok) {
    throw new Error(`EllaBot API error: ${response.status}`)
  }

  return response.json()
}

/**
 * Direct RAG query - search docs and generate answer
 */
export async function query(
  question: string,
  collections?: string[]
): Promise<QueryResponse> {
  const response = await fetch(`${ELLABOT_API_URL}/api/ellabot/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question,
      collections
    })
  })

  if (!response.ok) {
    throw new Error(`EllaBot API error: ${response.status}`)
  }

  return response.json()
}

/**
 * Get collection statistics
 */
export async function getCollections(): Promise<{ success: boolean; collections: CollectionStats }> {
  const response = await fetch(`${ELLABOT_API_URL}/api/ellabot/collections`)
  if (!response.ok) {
    throw new Error(`EllaBot API error: ${response.status}`)
  }
  return response.json()
}

/**
 * Health check
 */
export async function getHealth(): Promise<HealthStatus> {
  const response = await fetch(`${ELLABOT_API_URL}/api/ellabot/health`)
  if (!response.ok) {
    throw new Error(`EllaBot API error: ${response.status}`)
  }
  return response.json()
}

/**
 * Get available models
 */
export async function getModels(): Promise<{ success: boolean; models: unknown[]; routing: Record<string, string> }> {
  const response = await fetch(`${ELLABOT_API_URL}/api/ellabot/models`)
  if (!response.ok) {
    throw new Error(`EllaBot API error: ${response.status}`)
  }
  return response.json()
}

/**
 * Preview digest - clean text without saving
 */
export async function digestPreview(text: string): Promise<DigestPreviewResponse> {
  const response = await fetch(`${ELLABOT_API_URL}/api/ellabot/digest/preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  })
  if (!response.ok) {
    throw new Error(`EllaBot API error: ${response.status}`)
  }
  return response.json()
}

/**
 * Digest and save to Obsidian vault
 */
export async function digestSave(text: string, title?: string): Promise<DigestSaveResponse> {
  const response = await fetch(`${ELLABOT_API_URL}/api/ellabot/digest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, title, save: true })
  })
  if (!response.ok) {
    throw new Error(`EllaBot API error: ${response.status}`)
  }
  return response.json()
}

export default {
  chat,
  query,
  getCollections,
  getHealth,
  getModels,
  digestPreview,
  digestSave
}
