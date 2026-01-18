/**
 * Pixelated emoji icon mappings for retro dashboard aesthetic
 */

// Quick Action emoji mappings (keyed by action icon name)
export const quickActionEmoji: Record<string, string> = {
  RefreshCw: '🎬',      // Plex Scan
  Lightbulb: '💡',      // Cync Lights
  RotateCw: '🔄',       // Refresh All
  Moon: '🌙',           // Evening Mode
  Tv: '📺',             // Movie Time
  Download: '⬇️',       // Torrents
  Archive: '💾',        // Backup
  Wrench: '🔧',         // Toolbox
  Play: '▶️',           // Play
  Settings: '⚙️',       // Settings
  Power: '🔌',          // Power
  Wifi: '📶',           // WiFi
  Cloud: '☁️',          // Cloud
}

// Service card emoji mappings (keyed by service id)
export const serviceEmoji: Record<string, string> = {
  'plex': '🎬',
  'grafana': '📊',
  'prometheus': '🔥',
  'qbittorrent': '⬇️',
  'filebrowser': '📁',
  'proxmox': '🖥️',
  'node-exporter': '📈',
  'cadvisor': '🐳',
  'zfs-exporter': '💿',
  'qbittorrent-exporter': '📥',
}

// Navigation link emoji mappings (keyed by route or identifier)
export const navEmoji: Record<string, string> = {
  'toolbox': '🧰',
  'files': '📁',
  'file-manager': '📁',
  'weather': '🌤️',
  'docs': '📚',
  'vault': '🔐',
  'nanit': '👶',
  'baby-cam': '👶',
  'adguard': '🛡️',
  'yt-dlp': '📹',
  'dev-box': '💻',
  'cloud': '☁️',
  'nextcloud': '☁️',
  'ellabot': '🤖',
}

// CSS class for pixelated emoji rendering
export const pixelEmojiClass = 'pixel-emoji'

// CSS styles for pixelated emoji (to be added inline or via class)
export const pixelEmojiStyles = {
  fontFamily: 'Segoe UI Emoji, Apple Color Emoji, Noto Color Emoji, sans-serif',
  imageRendering: 'auto' as const,
  fontSize: '1.25em',
  filter: 'contrast(1.05)',
  display: 'inline-block',
  textAlign: 'center' as const,
  lineHeight: 1,
}

/**
 * Get emoji for a quick action by its icon name
 */
export function getActionEmoji(iconName: string): string | null {
  return quickActionEmoji[iconName] || null
}

/**
 * Get emoji for a service by its id
 */
export function getServiceEmoji(serviceId: string): string | null {
  return serviceEmoji[serviceId] || null
}

/**
 * Get emoji for a navigation link by its route/identifier
 */
export function getNavEmoji(routeOrId: string): string | null {
  return navEmoji[routeOrId.toLowerCase()] || null
}
