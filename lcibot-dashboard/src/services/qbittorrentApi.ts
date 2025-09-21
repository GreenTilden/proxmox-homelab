/**
 * qBittorrent API Client for LCiBot Dashboard
 * Provides real-time torrent monitoring with authentication handling
 */

export interface QBittorrentTorrent {
  hash: string
  name: string
  size: number
  progress: number
  dlspeed: number
  upspeed: number
  priority: number
  num_seeds: number
  num_leechs: number
  ratio: number
  eta: number
  state: string
  category: string
  tags: string
  added_on: number
  completion_on: number
  downloaded: number
  uploaded: number
}

export interface QBittorrentGlobalInfo {
  dl_info_speed: number
  up_info_speed: number
  dl_info_data: number
  up_info_data: number
  dl_rate_limit: number
  up_rate_limit: number
  dht_nodes: number
  connection_status: string
}

export interface TorrentMetrics {
  torrents: QBittorrentTorrent[]
  globalStats: QBittorrentGlobalInfo
  activeTorrents: number
  completedTorrents: number
  totalDownloadSpeed: number
  totalUploadSpeed: number
  lastUpdated: Date
}

interface CachedResponse {
  data: any
  timestamp: number
}

export class QBittorrentClient {
  private baseUrl = 'http://192.168.0.111:8112'
  private cache = new Map<string, CachedResponse>()
  private sessionId: string | null = null

  constructor(baseUrl?: string) {
    if (baseUrl) {
      this.baseUrl = baseUrl
    }
  }

  /**
   * Authenticate with qBittorrent API
   */
  private async authenticate(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v2/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'username=admin&password=', // Default credentials
        credentials: 'include'
      })

      if (response.ok) {
        // Extract session cookie if needed
        const cookies = response.headers.get('set-cookie')
        if (cookies) {
          const sidMatch = cookies.match(/SID=([^;]+)/)
          if (sidMatch) {
            this.sessionId = sidMatch[1]
          }
        }
        return true
      }
      return false
    } catch (error) {
      console.warn('qBittorrent authentication failed:', error)
      return false
    }
  }

  /**
   * Make authenticated API request
   */
  private async apiRequest(endpoint: string, useCache: boolean = true): Promise<any> {
    const cacheKey = `qbt:${endpoint}`

    // Check cache first (15 second TTL for frequent updates)
    if (useCache) {
      const cached = this.cache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < 15000) {
        return cached.data
      }
    }

    try {
      // Try request first, authenticate if needed
      let response = await fetch(`${this.baseUrl}/api/v2/${endpoint}`, {
        credentials: 'include',
        headers: this.sessionId ? { 'Cookie': `SID=${this.sessionId}` } : {}
      })

      // If unauthorized, try to authenticate and retry
      if (response.status === 403) {
        const authSuccess = await this.authenticate()
        if (authSuccess) {
          response = await fetch(`${this.baseUrl}/api/v2/${endpoint}`, {
            credentials: 'include',
            headers: this.sessionId ? { 'Cookie': `SID=${this.sessionId}` } : {}
          })
        }
      }

      if (!response.ok) {
        throw new Error(`qBittorrent API error: ${response.status}`)
      }

      const data = await response.json()

      // Cache successful response
      if (useCache) {
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now()
        })
      }

      return data
    } catch (error) {
      console.warn(`qBittorrent API request failed for ${endpoint}:`, error)
      // Return empty data structure for graceful degradation
      if (endpoint === 'torrents/info') {
        return []
      } else if (endpoint === 'transfer/info') {
        return {
          dl_info_speed: 0,
          up_info_speed: 0,
          dl_info_data: 0,
          up_info_data: 0,
          connection_status: 'disconnected'
        }
      }
      throw error
    }
  }

  /**
   * Get all torrents with their status
   */
  async getTorrents(): Promise<QBittorrentTorrent[]> {
    return await this.apiRequest('torrents/info')
  }

  /**
   * Get global transfer information
   */
  async getGlobalStats(): Promise<QBittorrentGlobalInfo> {
    return await this.apiRequest('transfer/info')
  }

  /**
   * Get comprehensive torrent metrics
   */
  async getTorrentMetrics(): Promise<TorrentMetrics> {
    try {
      const [torrents, globalStats] = await Promise.all([
        this.getTorrents(),
        this.getGlobalStats()
      ])

      // Calculate derived metrics
      const activeTorrents = torrents.filter(t =>
        t.state === 'downloading' || t.state === 'uploading' || t.state === 'stalledDL' || t.state === 'stalledUP'
      ).length

      const completedTorrents = torrents.filter(t =>
        t.state === 'completedDL' || t.progress === 1
      ).length

      const totalDownloadSpeed = torrents.reduce((sum, t) => sum + t.dlspeed, 0)
      const totalUploadSpeed = torrents.reduce((sum, t) => sum + t.upspeed, 0)

      return {
        torrents,
        globalStats,
        activeTorrents,
        completedTorrents,
        totalDownloadSpeed,
        totalUploadSpeed,
        lastUpdated: new Date()
      }
    } catch (error) {
      console.error('Failed to fetch qBittorrent metrics:', error)
      throw new Error('qBittorrent service unavailable')
    }
  }

  /**
   * Format bytes to human readable format
   */
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  /**
   * Format speed to human readable format
   */
  formatSpeed(bytesPerSecond: number): string {
    return this.formatBytes(bytesPerSecond) + '/s'
  }

  /**
   * Get torrent state display name
   */
  getTorrentStateDisplay(state: string): string {
    const stateMap: Record<string, string> = {
      'downloading': 'Downloading',
      'uploading': 'Seeding',
      'completedDL': 'Completed',
      'pausedDL': 'Paused',
      'pausedUP': 'Paused',
      'queuedDL': 'Queued',
      'queuedUP': 'Queued',
      'stalledDL': 'Stalled',
      'stalledUP': 'Stalled',
      'checkingDL': 'Checking',
      'checkingUP': 'Checking',
      'error': 'Error'
    }
    return stateMap[state] || state
  }

  /**
   * Get torrent state color for UI
   */
  getTorrentStateColor(state: string): string {
    const colorMap: Record<string, string> = {
      'downloading': 'var(--success-color)',
      'uploading': 'var(--secondary-color)',
      'completedDL': 'var(--primary-color)',
      'pausedDL': 'var(--warning-color)',
      'pausedUP': 'var(--warning-color)',
      'queuedDL': 'var(--info-color)',
      'queuedUP': 'var(--info-color)',
      'stalledDL': 'var(--warning-color)',
      'stalledUP': 'var(--warning-color)',
      'error': 'var(--error-color)'
    }
    return colorMap[state] || 'var(--text-color)'
  }
}

// Export singleton instance
export const qbittorrentService = new QBittorrentClient()