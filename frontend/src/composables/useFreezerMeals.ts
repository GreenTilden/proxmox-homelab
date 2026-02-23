import { ref, computed, reactive } from 'vue'

const API_BASE = '/cmd-api/freezer'

function authHeaders(extra: Record<string, string> = {}) {
  return {
    'Content-Type': 'application/json',
    ...extra
  }
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const url = `${API_BASE}${path}`
  const res = await fetch(url, {
    ...options,
    headers: authHeaders(options.headers as Record<string, string> || {})
  })
  if (!res.ok && res.status !== 201) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || `API error ${res.status}`)
  }
  return res.json()
}

export interface TandoorRecipe {
  id: number
  name: string
  description: string
  image: string | null
  servings: number
  servings_text: string
  working_time: number
  waiting_time: number
  keywords: { id: number; name: string }[]
  steps: {
    instruction: string
    ingredients: {
      amount: number
      unit: { name: string } | null
      food: { name: string } | null
      note: string
    }[]
  }[]
}

export interface PrepSession {
  id: string
  name: string
  recipes: { recipeId: number; multiplier: number; recipeName?: string }[]
  shoppingList: Record<string, ShoppingItem[]> | null
  prepGuide: any
  createdAt: string
  status: string
}

export interface ShoppingItem {
  id: string
  name: string
  amount: number
  unit: string
  category: string
  recipes: string[]
  onHand: number
  toBuy: number
  checked: boolean
}

export interface InventoryItem {
  name: string
  quantity: number
  unit: string
  location: 'fridge' | 'freezer' | 'pantry'
  addedAt?: string
  updatedAt?: string
}

export function useFreezerMeals() {
  const recipes = ref<TandoorRecipe[]>([])
  const selectedRecipe = ref<TandoorRecipe | null>(null)
  const sessions = ref<PrepSession[]>([])
  const activeSession = ref<PrepSession | null>(null)
  const inventory = ref<InventoryItem[]>([])
  const shoppingList = ref<Record<string, ShoppingItem[]>>({})
  const prepGuide = ref<any>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // --- Recipes ---
  async function fetchRecipes(query?: string) {
    isLoading.value = true
    error.value = null
    try {
      const params = query ? `?query=${encodeURIComponent(query)}` : ''
      const data = await apiFetch(`/recipes${params}`)
      recipes.value = data.results || []
    } catch (e: any) {
      error.value = e.message
    } finally {
      isLoading.value = false
    }
  }

  async function fetchRecipeDetail(id: number) {
    isLoading.value = true
    error.value = null
    try {
      selectedRecipe.value = await apiFetch(`/recipes/${id}`)
    } catch (e: any) {
      error.value = e.message
    } finally {
      isLoading.value = false
    }
  }

  async function importRecipeUrl(url: string) {
    isLoading.value = true
    error.value = null
    try {
      const result = await apiFetch('/recipes/import-url', {
        method: 'POST',
        body: JSON.stringify({ url })
      })
      await fetchRecipes()
      return result
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function deleteRecipe(id: number) {
    try {
      await apiFetch(`/recipes/${id}`, { method: 'DELETE' })
      recipes.value = recipes.value.filter(r => r.id !== id)
    } catch (e: any) {
      error.value = e.message
    }
  }

  // --- Sessions ---
  async function fetchSessions() {
    try {
      const data = await apiFetch('/sessions')
      sessions.value = data.sessions || []
    } catch (e: any) {
      error.value = e.message
    }
  }

  async function createSession(name: string, recipeEntries: { recipeId: number; multiplier: number }[]) {
    try {
      const session = await apiFetch('/sessions', {
        method: 'POST',
        body: JSON.stringify({ name, recipes: recipeEntries })
      })
      sessions.value.push(session)
      activeSession.value = session
      return session
    } catch (e: any) {
      error.value = e.message
    }
  }

  async function updateSession(id: string, updates: Partial<PrepSession>) {
    try {
      const session = await apiFetch(`/sessions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      })
      const idx = sessions.value.findIndex(s => s.id === id)
      if (idx >= 0) sessions.value[idx] = session
      if (activeSession.value?.id === id) activeSession.value = session
      return session
    } catch (e: any) {
      error.value = e.message
    }
  }

  async function deleteSession(id: string) {
    try {
      await apiFetch(`/sessions/${id}`, { method: 'DELETE' })
      sessions.value = sessions.value.filter(s => s.id !== id)
      if (activeSession.value?.id === id) activeSession.value = null
    } catch (e: any) {
      error.value = e.message
    }
  }

  async function generateShoppingList(sessionId: string) {
    isLoading.value = true
    error.value = null
    try {
      const data = await apiFetch(`/sessions/${sessionId}/generate-list`, { method: 'POST' })
      shoppingList.value = data.shoppingList || {}
      prepGuide.value = data.prepGuide || null
      // Restore checked state from localStorage
      const saved = localStorage.getItem(`freezer-checks-${sessionId}`)
      if (saved) {
        const checkedIds = JSON.parse(saved) as string[]
        for (const cat of Object.keys(shoppingList.value)) {
          for (const item of shoppingList.value[cat]) {
            if (checkedIds.includes(item.id)) item.checked = true
          }
        }
      }
      return data
    } catch (e: any) {
      error.value = e.message
    } finally {
      isLoading.value = false
    }
  }

  function toggleCheckItem(sessionId: string, itemId: string) {
    for (const cat of Object.keys(shoppingList.value)) {
      for (const item of shoppingList.value[cat]) {
        if (item.id === itemId) {
          item.checked = !item.checked
          // Persist to localStorage
          const allChecked: string[] = []
          for (const c of Object.keys(shoppingList.value)) {
            for (const i of shoppingList.value[c]) {
              if (i.checked) allChecked.push(i.id)
            }
          }
          localStorage.setItem(`freezer-checks-${sessionId}`, JSON.stringify(allChecked))
          // Also persist to server (fire-and-forget)
          apiFetch(`/sessions/${sessionId}/check-item`, {
            method: 'PATCH',
            body: JSON.stringify({ itemId, checked: item.checked })
          }).catch(() => {})
          return
        }
      }
    }
  }

  // --- Inventory ---
  async function fetchInventory() {
    try {
      const data = await apiFetch('/inventory')
      inventory.value = data.items || []
    } catch (e: any) {
      error.value = e.message
    }
  }

  async function addInventoryItem(item: Partial<InventoryItem>) {
    try {
      const result = await apiFetch('/inventory', {
        method: 'POST',
        body: JSON.stringify(item)
      })
      await fetchInventory()
      return result
    } catch (e: any) {
      error.value = e.message
    }
  }

  async function removeInventoryItem(name: string) {
    try {
      await apiFetch(`/inventory/${encodeURIComponent(name)}`, { method: 'DELETE' })
      inventory.value = inventory.value.filter(i => i.name.toLowerCase() !== name.toLowerCase())
    } catch (e: any) {
      error.value = e.message
    }
  }

  // --- Computed ---
  const totalShoppingItems = computed(() =>
    Object.values(shoppingList.value).reduce((sum, items) => sum + items.length, 0)
  )

  const checkedShoppingItems = computed(() =>
    Object.values(shoppingList.value).reduce((sum, items) =>
      sum + items.filter(i => i.checked).length, 0
    , 0)
  )

  const shoppingProgress = computed(() =>
    totalShoppingItems.value > 0
      ? Math.round((checkedShoppingItems.value / totalShoppingItems.value) * 100)
      : 0
  )

  return {
    // State
    recipes,
    selectedRecipe,
    sessions,
    activeSession,
    inventory,
    shoppingList,
    prepGuide,
    isLoading,
    error,

    // Computed
    totalShoppingItems,
    checkedShoppingItems,
    shoppingProgress,

    // Actions
    fetchRecipes,
    fetchRecipeDetail,
    importRecipeUrl,
    deleteRecipe,
    fetchSessions,
    createSession,
    updateSession,
    deleteSession,
    generateShoppingList,
    toggleCheckItem,
    fetchInventory,
    addInventoryItem,
    removeInventoryItem,
  }
}
