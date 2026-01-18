<template>
  <button
    class="quick-action-button"
    :style="buttonStyle"
    :disabled="loading"
    @click="handleClick"
    :title="action.description"
  >
    <!-- Loading spinner -->
    <div v-if="loading" :style="spinnerStyle">
      <Loader2 :size="20" class="spinning" />
    </div>

    <!-- Success checkmark -->
    <div v-else-if="showSuccess" :style="successStyle">
      <Check :size="20" />
    </div>

    <!-- Error indicator -->
    <div v-else-if="showError" :style="errorStyle">
      <X :size="20" />
    </div>

    <!-- Normal state -->
    <template v-else>
      <!-- Emoji icon (preferred) -->
      <span v-if="emojiIcon" :style="emojiStyle" class="pixel-emoji">{{ emojiIcon }}</span>
      <!-- Lucide fallback -->
      <component v-else :is="iconComponent" :size="iconSize" :style="iconStyle" />
      <span v-if="showLabel" :style="labelStyle">{{ action.name }}</span>
    </template>
  </button>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  RefreshCw, Lightbulb, RotateCw, Moon, Tv, Download, Archive, Wrench,
  Loader2, Check, X, Play, Settings, Power, Wifi, Cloud
} from 'lucide-vue-next'
import { getActionEmoji, pixelEmojiStyles } from '@/constants/emojiIcons'
import type { QuickAction } from '@/composables/useQuickActions'

interface Props {
  action: QuickAction
  loading?: boolean
  size?: 'small' | 'medium' | 'large'
  showLabel?: boolean
  variant?: 'filled' | 'outline' | 'ghost'
  lastResult?: { success: boolean; message: string } | null
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  size: 'medium',
  showLabel: true,
  variant: 'filled',
  lastResult: null
})

const emit = defineEmits<{
  click: [action: QuickAction]
}>()

const showSuccess = ref(false)
const showError = ref(false)

// Watch for result changes to show feedback
watch(() => props.lastResult, (result) => {
  if (result) {
    if (result.success) {
      showSuccess.value = true
      setTimeout(() => { showSuccess.value = false }, 1500)
    } else {
      showError.value = true
      setTimeout(() => { showError.value = false }, 2000)
    }
  }
})

const iconMap: Record<string, any> = {
  RefreshCw,
  Lightbulb,
  RotateCw,
  Moon,
  Tv,
  Download,
  Archive,
  Wrench,
  Play,
  Settings,
  Power,
  Wifi,
  Cloud
}

// Get emoji for this action (returns null if no mapping)
const emojiIcon = computed(() => getActionEmoji(props.action.icon))

const iconComponent = computed(() => iconMap[props.action.icon] || Settings)

const sizeConfig = computed(() => {
  switch (props.size) {
    case 'small': return { button: 48, icon: 18, emoji: '1em', font: '9px', gap: '4px' }
    case 'large': return { button: 72, icon: 28, emoji: '1.6em', font: '11px', gap: '8px' }
    default: return { button: 64, icon: 22, emoji: '1.3em', font: '10px', gap: '6px' }
  }
})

const iconSize = computed(() => sizeConfig.value.icon)

const buttonStyle = computed(() => {
  const base = {
    width: `${sizeConfig.value.button}px`,
    height: props.showLabel ? `${sizeConfig.value.button + 16}px` : `${sizeConfig.value.button}px`,
    borderRadius: '12px',
    border: 'none',
    cursor: props.loading ? 'wait' : 'pointer',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: sizeConfig.value.gap,
    transition: 'all 0.2s ease',
    position: 'relative' as const,
    overflow: 'hidden'
  }

  if (props.variant === 'filled') {
    return {
      ...base,
      background: `${props.action.color}20`,
      color: props.action.color,
      boxShadow: `0 2px 8px ${props.action.color}20`
    }
  } else if (props.variant === 'outline') {
    return {
      ...base,
      background: 'transparent',
      border: `2px solid ${props.action.color}40`,
      color: props.action.color
    }
  } else {
    return {
      ...base,
      background: 'transparent',
      color: props.action.color
    }
  }
})

const emojiStyle = computed(() => ({
  ...pixelEmojiStyles,
  fontSize: sizeConfig.value.emoji,
  transition: 'transform 0.2s ease'
}))

const iconStyle = computed(() => ({
  transition: 'transform 0.2s ease'
}))

const labelStyle = computed(() => ({
  fontSize: sizeConfig.value.font,
  fontWeight: 500,
  whiteSpace: 'nowrap' as const,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: '100%',
  padding: '0 4px'
}))

const spinnerStyle = computed(() => ({
  color: props.action.color
}))

const successStyle = computed(() => ({
  color: '#22c55e',
  animation: 'pop 0.3s ease'
}))

const errorStyle = computed(() => ({
  color: '#ef4444',
  animation: 'shake 0.3s ease'
}))

const handleClick = () => {
  if (!props.loading) {
    emit('click', props.action)
  }
}
</script>

<style scoped>
.quick-action-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px var(--action-color, rgba(0,0,0,0.2));
}

.quick-action-button:hover:not(:disabled) .pixel-emoji {
  transform: scale(1.15);
}

.quick-action-button:active:not(:disabled) {
  transform: translateY(0);
}

.quick-action-button:disabled {
  opacity: 0.7;
}

.pixel-emoji {
  filter: contrast(1.05);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pop {
  0% { transform: scale(0.8); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}
</style>
