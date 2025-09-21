<template>
  <div class="card-demo-grid">
    <!-- Option 1: Elevated Surfaces -->
    <div class="card-elevated">
      <div class="card-header-clean">
        <div>
          <h3 class="card-title-clean">Elevated Surface</h3>
          <p class="card-subtitle-clean">Material Design inspired with subtle top line</p>
        </div>
        <div class="status-badge-clean online">
          <div class="w-2 h-2 rounded-full bg-green-400"></div>
          Online
        </div>
      </div>
      <div class="card-metrics-clean">
        <div class="card-metric-row">
          <span class="card-metric-label">Uptime:</span>
          <span class="card-metric-value">99.9%</span>
        </div>
        <div class="card-metric-row">
          <span class="card-metric-label">Response:</span>
          <span class="card-metric-value">45ms</span>
        </div>
      </div>
      <div class="card-actions-clean">
        <button class="card-button-clean">
          <ExternalLink class="w-3 h-3" />
          Access
        </button>
        <button class="card-button-clean">
          <RefreshCw class="w-3 h-3" />
          Refresh
        </button>
      </div>
    </div>

    <!-- Option 2: Subtle Depth -->
    <div class="card-subtle">
      <div class="card-header-clean">
        <div>
          <h3 class="card-title-clean">Subtle Depth</h3>
          <p class="card-subtitle-clean">Glassmorphism with animated border glow</p>
        </div>
        <div class="status-badge-clean checking">
          <div class="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
          Checking
        </div>
      </div>
      <div class="card-metrics-clean">
        <div class="card-metric-row">
          <span class="card-metric-label">Load:</span>
          <span class="card-metric-value">2.3</span>
        </div>
        <div class="card-metric-row">
          <span class="card-metric-label">Memory:</span>
          <span class="card-metric-value">68%</span>
        </div>
      </div>
      <div class="card-actions-clean">
        <button class="card-button-clean">
          <ExternalLink class="w-3 h-3" />
          Access
        </button>
        <button class="card-button-clean">
          <RefreshCw class="w-3 h-3" />
          Refresh
        </button>
      </div>
    </div>

    <!-- Option 3: Clean Minimalist -->
    <div class="card-minimal">
      <div class="card-header-clean">
        <div>
          <h3 class="card-title-clean">Clean Minimal</h3>
          <p class="card-subtitle-clean">Simple borders with subtle hover glow</p>
        </div>
        <div class="status-badge-clean online">
          <div class="w-2 h-2 rounded-full bg-green-400"></div>
          Online
        </div>
      </div>
      <div class="card-metrics-clean">
        <div class="card-metric-row">
          <span class="card-metric-label">Storage:</span>
          <span class="card-metric-value">2.4TB</span>
        </div>
        <div class="card-metric-row">
          <span class="card-metric-label">Used:</span>
          <span class="card-metric-value">78%</span>
        </div>
      </div>
      <div class="card-actions-clean">
        <button class="card-button-clean">
          <ExternalLink class="w-3 h-3" />
          Access
        </button>
        <button class="card-button-clean">
          <RefreshCw class="w-3 h-3" />
          Refresh
        </button>
      </div>
    </div>

    <!-- Option 4: Soft Glow -->
    <div class="card-glow">
      <div class="card-header-clean">
        <div>
          <h3 class="card-title-clean">Soft Glow</h3>
          <p class="card-subtitle-clean">Radial glow effect on hover interaction</p>
        </div>
        <div class="status-badge-clean offline">
          <div class="w-2 h-2 rounded-full bg-red-400"></div>
          Offline
        </div>
      </div>
      <div class="card-metrics-clean">
        <div class="card-metric-row">
          <span class="card-metric-label">Last seen:</span>
          <span class="card-metric-value">2m ago</span>
        </div>
        <div class="card-metric-row">
          <span class="card-metric-label">Status:</span>
          <span class="card-metric-value">Timeout</span>
        </div>
      </div>
      <div class="card-actions-clean">
        <button class="card-button-clean">
          <ExternalLink class="w-3 h-3" />
          Access
        </button>
        <button class="card-button-clean">
          <RefreshCw class="w-3 h-3" />
          Refresh
        </button>
      </div>
    </div>

    <!-- Option 5: Flat Clean -->
    <div class="card-flat">
      <div class="card-header-clean">
        <div>
          <h3 class="card-title-clean">Flat Clean</h3>
          <p class="card-subtitle-clean">Accent border with sliding animation</p>
        </div>
        <div class="status-badge-clean online">
          <div class="w-2 h-2 rounded-full bg-green-400"></div>
          Online
        </div>
      </div>
      <div class="card-metrics-clean">
        <div class="card-metric-row">
          <span class="card-metric-label">Requests:</span>
          <span class="card-metric-value">1.2k/min</span>
        </div>
        <div class="card-metric-row">
          <span class="card-metric-label">Errors:</span>
          <span class="card-metric-value">0.1%</span>
        </div>
      </div>
      <div class="card-actions-clean">
        <button class="card-button-clean">
          <ExternalLink class="w-3 h-3" />
          Access
        </button>
        <button class="card-button-clean">
          <RefreshCw class="w-3 h-3" />
          Refresh
        </button>
      </div>
    </div>

    <!-- Current Style for Comparison -->
    <div class="service-card service-online">
      <div class="service-header">
        <div class="service-info">
          <div class="service-icon">
            <Monitor class="w-4 h-4" />
          </div>
          <div>
            <h4 class="service-name">Current Style</h4>
            <p class="service-description">Your existing ServiceHealthCard styling</p>
          </div>
        </div>
        <div class="service-status">
          <div class="status-indicator status-online">✅</div>
        </div>
      </div>
      <div class="service-metrics">
        <div class="metric-row">
          <span class="metric-label">Uptime:</span>
          <span class="metric-value">5d 12h</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Response:</span>
          <span class="metric-value">32ms</span>
        </div>
      </div>
      <div class="service-actions">
        <button class="action-button refresh-button">
          <RefreshCw class="w-3 h-3" />
          Refresh
        </button>
        <button class="action-button open-button">
          <ExternalLink class="w-3 h-3" />
          Open
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ExternalLink, RefreshCw, Monitor } from 'lucide-vue-next'
</script>

<style scoped>
.card-demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--space-6);
  padding: var(--space-6);
}

@media (max-width: 768px) {
  .card-demo-grid {
    grid-template-columns: 1fr;
    gap: var(--space-4);
    padding: var(--space-4);
  }
}
</style>