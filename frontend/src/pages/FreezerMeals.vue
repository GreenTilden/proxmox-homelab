<template>
  <SeasonalThemeProvider :enable-scanlines="true" :enable-particles="false" :enable-animations="true">
    <div :style="appStyles">
      <!-- Header -->
      <header :style="headerStyles">
        <router-link to="/" style="text-decoration: none; color: inherit; display: flex; align-items: center; gap: 0.5rem;">
          <img src="/qca.png" alt="QCA" :style="logoStyles" />
        </router-link>
        <div>
          <h1 class="nes-text is-primary" :style="titleStyles">Freezer Meal Prep</h1>
        </div>
      </header>

      <!-- Tab Navigation -->
      <div :style="tabBarStyles">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="nes-btn"
          :class="activeTab === tab.id ? 'is-primary' : ''"
          :style="tabButtonStyles"
          @click="activeTab = tab.id"
        >
          <span class="tab-emoji">{{ tab.icon }}</span>
          <span class="tab-label">{{ tab.label }}</span>
          <span v-if="tab.id === 'shopping' && totalShoppingItems > 0" :style="badgeStyles">
            {{ checkedShoppingItems }}/{{ totalShoppingItems }}
          </span>
        </button>
      </div>

      <!-- Main Content -->
      <main :style="mainStyles">
        <!-- Error Banner -->
        <div v-if="error" :style="errorStyles">
          {{ error }}
          <button class="nes-btn is-error" style="margin-left: 1rem; font-size: 0.6rem;" @click="error = null">X</button>
        </div>

        <!-- RECIPES TAB -->
        <section v-if="activeTab === 'recipes'">
          <div :style="importBarStyles">
            <input
              v-model="importUrl"
              placeholder="Paste recipe URL to import..."
              class="nes-input"
              :style="inputStyles"
              @keyup.enter="handleImport"
            />
            <button class="nes-btn is-success" :style="actionBtnStyles" @click="handleImport" :disabled="isLoading || !importUrl">
              {{ isLoading ? 'Importing...' : 'Import' }}
            </button>
          </div>

          <div v-if="isLoading && recipes.length === 0" :style="centerStyles">
            <p class="nes-text">Loading recipes...</p>
          </div>

          <div v-else :style="gridStyles">
            <div
              v-for="recipe in recipes"
              :key="recipe.id"
              :style="recipeCardStyles"
              @click="showRecipeDetail(recipe)"
              class="recipe-card"
            >
              <div :style="recipeImageStyles">
                <img v-if="recipe.image" :src="recipe.image" :alt="recipe.name" :style="recipeImgStyles" />
                <div v-else :style="recipePlaceholderStyles">🍲</div>
              </div>
              <div :style="recipeInfoStyles">
                <h3 :style="recipeNameStyles">{{ recipe.name }}</h3>
                <div :style="recipeMetaStyles">
                  <span v-if="recipe.servings">{{ recipe.servings }} servings</span>
                  <span v-if="recipe.working_time">{{ recipe.working_time }}min</span>
                </div>
                <div :style="tagRowStyles">
                  <span v-for="kw in (recipe.keywords || []).slice(0, 3)" :key="kw.id" :style="tagStyles">{{ kw.name }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="!isLoading && recipes.length === 0" :style="emptyStyles">
            <p class="nes-text">No recipes yet. Paste a URL above to import one!</p>
          </div>
        </section>

        <!-- PLAN TAB (was "Prep Session") -->
        <section v-if="activeTab === 'plan'">
          <p :style="hintStyles">Check the recipes you want to make and set batch sizes.</p>

          <div v-if="recipes.length === 0" :style="emptyStyles">
            <p>No recipes yet. Go to Recipes tab to import some first.</p>
          </div>
          <div v-else :style="recipePickerStyles">
            <div
              v-for="recipe in recipes"
              :key="recipe.id"
              :style="pickerItemStyles(isRecipeSelected(recipe.id))"
              class="picker-item"
              @click="toggleRecipeInSession(recipe)"
            >
              <div :style="pickerRowStyles">
                <div :style="checkboxStyles(isRecipeSelected(recipe.id))">
                  <span v-if="isRecipeSelected(recipe.id)">✓</span>
                </div>
                <div :style="pickerInfoStyles">
                  <span :style="pickerNameStyles">{{ recipe.name }}</span>
                  <span :style="pickerMetaStyles">{{ recipe.servings || '?' }} servings per batch</span>
                </div>
              </div>
              <div v-if="isRecipeSelected(recipe.id)" :style="multiplierStyles" @click.stop>
                <button class="nes-btn is-warning" :style="multiBtnStyles" @click="changeMultiplier(recipe.id, -1)">-</button>
                <span :style="multiplierValueStyles">{{ getMultiplier(recipe.id) }}x</span>
                <button class="nes-btn is-success" :style="multiBtnStyles" @click="changeMultiplier(recipe.id, 1)">+</button>
                <span :style="portionInfoStyles">= {{ (recipe.servings || 1) * getMultiplier(recipe.id) }} portions</span>
              </div>
            </div>
          </div>

          <!-- Summary + Generate -->
          <div v-if="selectedRecipeCount > 0" :style="generateSectionStyles">
            <div :style="summaryStyles">
              {{ selectedRecipeCount }} recipe{{ selectedRecipeCount > 1 ? 's' : '' }} selected, {{ totalPortions }} total portions
            </div>
            <button
              class="nes-btn is-success"
              :style="generateBtnStyles"
              @click="handleGenerateList"
              :disabled="isLoading"
            >
              {{ isLoading ? 'Generating...' : 'Generate Shopping List' }}
            </button>
          </div>
        </section>

        <!-- SHOPPING LIST TAB -->
        <section v-if="activeTab === 'shopping'">
          <div v-if="Object.keys(shoppingList).length === 0" :style="emptyStyles">
            <p class="nes-text">No shopping list yet.</p>
            <button class="nes-btn is-primary" style="margin-top: 1rem; font-size: 0.7rem;" @click="activeTab = 'plan'">
              Pick recipes to make
            </button>
          </div>
          <div v-else>
            <!-- Prep Guide -->
            <details v-if="prepGuide" :style="prepGuideDetailsStyles" open>
              <summary :style="prepGuideSummaryStyles">Prep Guide</summary>
              <div :style="prepGuideContentStyles">
                <!-- Shared prep (ingredients used in multiple recipes) -->
                <div v-if="prepGuide.sharedPrep && prepGuide.sharedPrep.length > 0" :style="sharedPrepStyles">
                  <h4 :style="prepSectionTitleStyles">Shared Prep</h4>
                  <p :style="prepHintStyles">These ingredients are used in multiple recipes &mdash; prep them together.</p>
                  <div v-for="item in prepGuide.sharedPrep" :key="item.ingredient" :style="sharedItemStyles">
                    <span :style="sharedItemNameStyles">{{ item.totalAmount }} {{ item.unit }} {{ item.ingredient }}</span>
                    <span :style="sharedItemBreakdownStyles">{{ item.breakdown.join(' \u00b7 ') }}</span>
                  </div>
                </div>

                <!-- Per-recipe instructions -->
                <div v-for="recipe in prepGuide.recipes" :key="recipe.name" :style="recipeGuideStyles">
                  <h4 :style="recipeGuideTitleStyles">{{ recipe.name }} <span :style="portionBadgeStyles">{{ recipe.portions }} portions</span></h4>
                  <div :style="recipeGuideIngredientsStyles">
                    <span v-for="(ing, i) in recipe.ingredients" :key="i" :style="recipeGuideIngStyles">
                      {{ ing.amount }} {{ ing.unit }} {{ ing.name }}<span v-if="i < recipe.ingredients.length - 1">, </span>
                    </span>
                  </div>
                  <div v-for="(inst, idx) in recipe.instructions" :key="idx" :style="recipeGuideInstStyles" v-html="inst.replace(/\n/g, '<br>')"></div>
                </div>
              </div>
            </details>

            <!-- Progress bar -->
            <div :style="progressContainerStyles">
              <div :style="progressBarStyles">
                <div :style="progressFillStyles"></div>
              </div>
              <span :style="progressTextStyles">
                {{ checkedShoppingItems }}/{{ totalShoppingItems }}
              </span>
            </div>

            <!-- Category groups -->
            <div v-for="(items, category) in shoppingList" :key="category" :style="categoryGroupStyles">
              <h3 :style="categoryTitleStyles">
                {{ getCategoryIcon(category) }} {{ category.charAt(0).toUpperCase() + category.slice(1) }}
              </h3>
              <div :style="shoppingItemsStyles">
                <div
                  v-for="item in items"
                  :key="item.id"
                  :style="shoppingItemStyles(item.checked)"
                  @click="handleToggleCheck(item.id)"
                  class="shopping-item"
                >
                  <div :style="checkboxAreaStyles">
                    <div :style="checkboxStyles(item.checked)">
                      <span v-if="item.checked">✓</span>
                    </div>
                  </div>
                  <div :style="itemDetailStyles">
                    <span :style="itemNameStyles(item.checked)">{{ item.name }}</span>
                    <span :style="itemAmountStyles">
                      {{ formatAmount(item.toBuy) }} {{ item.unit }}
                      <span v-if="item.recipes && item.recipes.length" :style="recipeTagStyles">({{ item.recipes.join(', ') }})</span>
                      <span v-if="item.onHand > 0" :style="onHandStyles">({{ formatAmount(item.onHand) }} on hand)</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Charts (collapsed by default) -->
            <details :style="chartDetailsStyles">
              <summary :style="chartSummaryStyles">Prep Overview</summary>
              <div :style="chartsRowStyles">
                <div :style="chartCardStyles">
                  <canvas ref="donutCanvas" width="260" height="260"></canvas>
                </div>
                <div :style="chartCardStyles">
                  <canvas ref="barCanvas" width="380" height="260"></canvas>
                </div>
              </div>
            </details>
          </div>
        </section>

        <!-- PANTRY TAB -->
        <section v-if="activeTab === 'pantry'">
          <p :style="hintStyles">Track what you already have. Items here get subtracted from shopping lists.</p>

          <div :style="addItemFormStyles">
            <input v-model="newItem.name" placeholder="Item name" class="nes-input" :style="inputStyles" @keyup.enter="handleAddItem" />
            <input v-model.number="newItem.quantity" type="number" placeholder="Qty" class="nes-input" :style="smallInputStyles" />
            <input v-model="newItem.unit" placeholder="Unit" class="nes-input" :style="smallInputStyles" />
            <select v-model="newItem.location" class="nes-select" :style="smallSelectStyles">
              <option value="pantry">Pantry</option>
              <option value="fridge">Fridge</option>
              <option value="freezer">Freezer</option>
            </select>
            <button class="nes-btn is-success" :style="actionBtnStyles" @click="handleAddItem" :disabled="!newItem.name">Add</button>
          </div>

          <div v-if="inventory.length === 0" :style="emptyStyles">
            <p>No items tracked yet. Add items above and they'll be subtracted from your shopping list.</p>
          </div>

          <!-- Only show locations that have items -->
          <div v-for="loc in locationsWithItems" :key="loc" :style="inventoryGroupStyles">
            <h3 :style="categoryTitleStyles">{{ getLocationIcon(loc) }} {{ loc.charAt(0).toUpperCase() + loc.slice(1) }}</h3>
            <div :style="inventoryListStyles">
              <div v-for="item in inventoryByLocation(loc)" :key="item.name" :style="inventoryItemStyles">
                <span :style="invItemNameStyles">{{ item.name }}</span>
                <span :style="invItemQtyStyles">{{ item.quantity }} {{ item.unit }}</span>
                <button class="nes-btn is-error" style="padding: 0.1rem 0.4rem; font-size: 0.6rem;" @click="handleRemoveItem(item.name)">X</button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <!-- Recipe Detail Modal -->
      <div v-if="selectedRecipe" :style="modalOverlayStyles" @click.self="selectedRecipe = null">
        <div :style="modalStyles">
          <div :style="modalHeaderStyles">
            <h2 :style="modalTitleStyles">{{ selectedRecipe.name }}</h2>
            <button class="nes-btn" style="font-size: 0.6rem;" @click="selectedRecipe = null">X</button>
          </div>
          <div :style="modalBodyStyles">
            <div v-if="selectedRecipe.description" :style="descStyles">{{ selectedRecipe.description }}</div>
            <div :style="recipeMetaStyles">
              <span v-if="selectedRecipe.servings">{{ selectedRecipe.servings }} servings</span>
              <span v-if="selectedRecipe.working_time">{{ selectedRecipe.working_time }} min prep</span>
              <span v-if="selectedRecipe.waiting_time">{{ selectedRecipe.waiting_time }} min cook</span>
            </div>
            <div v-for="(step, idx) in (selectedRecipe.steps || [])" :key="idx" :style="stepStyles">
              <h4 :style="stepTitleStyles">Ingredients</h4>
              <div v-if="step.ingredients?.length" :style="ingredientListStyles">
                <div v-for="(ing, i) in step.ingredients" :key="i" :style="ingredientStyles">
                  <span :style="ingAmountStyles">{{ ing.amount || '' }} {{ ing.unit?.name || '' }}</span>
                  <span :style="ingNameStyles">{{ ing.food?.name || '' }}</span>
                  <span v-if="ing.note" :style="ingNoteStyles">({{ ing.note }})</span>
                </div>
              </div>
              <h4 v-if="step.instruction" :style="stepTitleStyles">Instructions</h4>
              <p v-if="step.instruction" :style="instructionStyles" v-html="step.instruction.replace(/\n/g, '<br>')"></p>
            </div>
          </div>
          <div :style="modalFooterStyles">
            <button class="nes-btn is-error" style="font-size: 0.65rem;" @click="handleDeleteRecipe(selectedRecipe.id)">Delete Recipe</button>
          </div>
        </div>
      </div>
    </div>
  </SeasonalThemeProvider>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import SeasonalThemeProvider from '../components/themes/retro/SeasonalThemeProvider.vue'
import { useFreezerMeals } from '../composables/useFreezerMeals'
import { useChartTheme } from '../composables/useChartTheme'

Chart.register(...registerables)

// Set page favicon to cooking emoji
const originalFavicon = document.querySelector('link[rel="icon"]')?.getAttribute('href') || ''
function setFavicon(emoji: string) {
  const link = document.querySelector('link[rel="icon"]') as HTMLLinkElement
  if (link) link.href = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${emoji}</text></svg>`
}
setFavicon('🍳')
onUnmounted(() => {
  const link = document.querySelector('link[rel="icon"]') as HTMLLinkElement
  if (link) link.href = originalFavicon
})

const {
  recipes, selectedRecipe, sessions, activeSession, inventory,
  shoppingList, prepGuide, isLoading, error,
  totalShoppingItems, checkedShoppingItems, shoppingProgress,
  fetchRecipes, fetchRecipeDetail, importRecipeUrl, deleteRecipe,
  fetchSessions, createSession, updateSession, deleteSession,
  generateShoppingList, toggleCheckItem,
  fetchInventory, addInventoryItem, removeInventoryItem,
} = useFreezerMeals()

const { colors } = useChartTheme()

const activeTab = ref('recipes')
const importUrl = ref('')
const donutCanvas = ref<HTMLCanvasElement | null>(null)
const barCanvas = ref<HTMLCanvasElement | null>(null)

let donutChart: Chart | null = null
let barChart: Chart | null = null

const tabs = [
  { id: 'recipes', label: 'Recipes', icon: '📖' },
  { id: 'plan', label: 'Plan', icon: '🍳' },
  { id: 'shopping', label: 'Shop', icon: '🛒' },
  { id: 'pantry', label: 'Pantry', icon: '🏪' },
]

const newItem = ref({ name: '', quantity: 1, unit: '', location: 'pantry' as const })

// --- Init ---
onMounted(async () => {
  await Promise.all([fetchRecipes(), fetchSessions(), fetchInventory()])
  // Auto-select or create a session
  await ensureSession()
})

// Auto-manage a single working session
async function ensureSession() {
  if (sessions.value.length > 0) {
    activeSession.value = sessions.value[0]
    if (activeSession.value?.shoppingList) {
      shoppingList.value = activeSession.value.shoppingList
    }
    if (activeSession.value?.prepGuide) {
      prepGuide.value = activeSession.value.prepGuide
    }
  } else {
    await createSession('Freezer Prep', [])
  }
}

// --- Recipe selection ---
function isRecipeSelected(recipeId: number): boolean {
  return activeSession.value?.recipes.some(r => r.recipeId === recipeId) ?? false
}

function getMultiplier(recipeId: number): number {
  return activeSession.value?.recipes.find(r => r.recipeId === recipeId)?.multiplier ?? 1
}

function toggleRecipeInSession(recipe: any) {
  if (!activeSession.value) return
  const idx = activeSession.value.recipes.findIndex(r => r.recipeId === recipe.id)
  if (idx >= 0) {
    activeSession.value.recipes.splice(idx, 1)
  } else {
    activeSession.value.recipes.push({ recipeId: recipe.id, multiplier: 1, recipeName: recipe.name })
  }
  saveSessionRecipes()
}

function changeMultiplier(recipeId: number, delta: number) {
  if (!activeSession.value) return
  const entry = activeSession.value.recipes.find(r => r.recipeId === recipeId)
  if (entry) {
    entry.multiplier = Math.max(1, entry.multiplier + delta)
    saveSessionRecipes()
  }
}

async function saveSessionRecipes() {
  if (!activeSession.value) return
  await updateSession(activeSession.value.id, { recipes: activeSession.value.recipes })
}

const selectedRecipeCount = computed(() => activeSession.value?.recipes.length ?? 0)

const totalPortions = computed(() => {
  if (!activeSession.value) return 0
  return activeSession.value.recipes.reduce((sum, r) => {
    const recipe = recipes.value.find(rec => rec.id === r.recipeId)
    return sum + (recipe?.servings || 1) * r.multiplier
  }, 0)
})

// Only show pantry locations that have items
const locationsWithItems = computed(() => {
  const locs = ['pantry', 'fridge', 'freezer']
  return locs.filter(loc => inventory.value.some(i => i.location === loc))
})

// --- Handlers ---
async function handleImport() {
  if (!importUrl.value) return
  try {
    await importRecipeUrl(importUrl.value)
    importUrl.value = ''
  } catch {}
}

async function handleGenerateList() {
  if (!activeSession.value) return
  await generateShoppingList(activeSession.value.id)
  activeTab.value = 'shopping'
  // Render charts after switching tab
  await nextTick()
  setTimeout(renderCharts, 100)
}

function handleToggleCheck(itemId: string) {
  if (!activeSession.value) return
  toggleCheckItem(activeSession.value.id, itemId)
}

async function handleDeleteRecipe(id: number) {
  await deleteRecipe(id)
  selectedRecipe.value = null
}

async function showRecipeDetail(recipe: any) {
  await fetchRecipeDetail(recipe.id)
}

async function handleAddItem() {
  if (!newItem.value.name) return
  await addInventoryItem(newItem.value)
  newItem.value = { name: '', quantity: 1, unit: '', location: 'pantry' }
}

async function handleRemoveItem(name: string) {
  await removeInventoryItem(name)
}

function inventoryByLocation(loc: string) {
  return inventory.value.filter(i => i.location === loc)
}

function formatAmount(n: number): string {
  if (n === 0) return '0'
  if (n % 1 === 0) return String(n)
  return n.toFixed(1)
}

function getCategoryIcon(cat: string): string {
  const icons: Record<string, string> = {
    produce: '🥬', dairy: '🧈', canned: '🥫', frozen: '🧊',
    spices: '🧂', pantry: '🏪', other: '📦'
  }
  return icons[cat] || '📦'
}

function getLocationIcon(loc: string): string {
  const icons: Record<string, string> = { pantry: '🏪', fridge: '🧊', freezer: '❄️' }
  return icons[loc] || '📦'
}

// --- Charts ---
function renderCharts() {
  if (!activeSession.value || activeSession.value.recipes.length === 0) return

  if (donutCanvas.value) {
    if (donutChart) donutChart.destroy()
    const labels = activeSession.value.recipes.map(r => {
      const recipe = recipes.value.find(rec => rec.id === r.recipeId)
      return recipe?.name || `Recipe ${r.recipeId}`
    })
    const portions = activeSession.value.recipes.map(r => {
      const recipe = recipes.value.find(rec => rec.id === r.recipeId)
      return (recipe?.servings || 1) * r.multiplier
    })
    const chartColors = [
      colors.value.primary, colors.value.secondary, colors.value.success,
      colors.value.warning, colors.value.error, colors.value.info
    ]

    donutChart = new Chart(donutCanvas.value, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: portions,
          backgroundColor: chartColors.slice(0, labels.length),
          borderColor: colors.value.cardBackground,
          borderWidth: 2
        }]
      },
      options: {
        responsive: false,
        plugins: {
          legend: { position: 'bottom', labels: { color: colors.value.text, font: { size: 10 } } },
          title: {
            display: true,
            text: `${portions.reduce((a, b) => a + b, 0)} total portions`,
            color: colors.value.text,
            font: { size: 12 }
          }
        }
      }
    })
  }

  if (barCanvas.value && Object.keys(shoppingList.value).length > 0) {
    if (barChart) barChart.destroy()
    const categories = Object.keys(shoppingList.value)
    const haveData = categories.map(cat =>
      shoppingList.value[cat].reduce((sum, item) => sum + (item.onHand || 0), 0)
    )
    const needData = categories.map(cat =>
      shoppingList.value[cat].reduce((sum, item) => sum + (item.toBuy || 0), 0)
    )

    barChart = new Chart(barCanvas.value, {
      type: 'bar',
      data: {
        labels: categories.map(c => c.charAt(0).toUpperCase() + c.slice(1)),
        datasets: [
          { label: 'Have', data: haveData, backgroundColor: colors.value.success + '99', borderColor: colors.value.success, borderWidth: 1 },
          { label: 'Need', data: needData, backgroundColor: colors.value.warning + '99', borderColor: colors.value.warning, borderWidth: 1 }
        ]
      },
      options: {
        responsive: false,
        indexAxis: 'y',
        scales: {
          x: { stacked: true, ticks: { color: colors.value.textMuted }, grid: { color: colors.value.grid } },
          y: { stacked: true, ticks: { color: colors.value.textMuted }, grid: { color: colors.value.grid } }
        },
        plugins: { legend: { labels: { color: colors.value.text, font: { size: 10 } } } }
      }
    })
  }
}

// --- Styles ---
const appStyles = computed(() => ({ minHeight: '100vh', padding: '0', margin: '0' }))

const headerStyles = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-md)',
  padding: 'var(--space-md) var(--space-lg)',
  background: 'var(--bg-surface)',
  borderBottom: '4px solid var(--color-primary-3)',
  position: 'sticky' as const,
  top: '0',
  zIndex: '50',
}))

const titleStyles = computed(() => ({
  fontSize: '1.2rem',
  fontWeight: '700',
  color: 'var(--text-bright)',
  margin: '0',
}))

const logoStyles = computed(() => ({ width: '28px', height: '28px', borderRadius: '50%' }))

const tabBarStyles = computed(() => ({
  display: 'flex',
  gap: '0.25rem',
  padding: '0.5rem var(--space-lg)',
  background: 'var(--bg-card)',
  borderBottom: '2px solid var(--color-primary-2)',
  overflowX: 'auto' as const,
}))

const tabButtonStyles = computed(() => ({
  fontSize: '0.6rem',
  padding: '0.35rem 0.7rem',
  whiteSpace: 'nowrap' as const,
  display: 'flex',
  alignItems: 'center',
  gap: '0.3rem',
}))

const badgeStyles = computed(() => ({
  fontSize: '0.55rem',
  background: 'var(--color-primary-3)',
  color: 'var(--bg-surface)',
  padding: '0.1rem 0.3rem',
  borderRadius: '8px',
  fontWeight: '700',
}))

const mainStyles = computed(() => ({
  padding: 'var(--space-lg)',
  maxWidth: '800px',
  margin: '0 auto',
}))

const errorStyles = computed(() => ({
  background: 'rgba(239, 68, 68, 0.15)',
  border: '2px solid rgba(239, 68, 68, 0.5)',
  borderRadius: '4px',
  padding: '0.5rem 0.75rem',
  marginBottom: '1rem',
  color: '#ff6b6b',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  fontSize: '0.75rem',
}))

const hintStyles = computed(() => ({
  fontSize: '0.75rem',
  color: 'var(--text-muted)',
  marginBottom: '1rem',
}))

const importBarStyles = computed(() => ({
  display: 'flex',
  gap: '0.5rem',
  marginBottom: '1rem',
}))

const inputStyles = computed(() => ({
  flex: '1',
  minWidth: '150px',
  fontSize: '0.75rem',
  padding: '0.4rem',
  background: 'var(--bg-card)',
  color: 'var(--text-bright)',
  border: '2px solid var(--color-primary-2)',
}))

const smallInputStyles = computed(() => ({
  width: '70px',
  fontSize: '0.75rem',
  padding: '0.4rem',
  background: 'var(--bg-card)',
  color: 'var(--text-bright)',
  border: '2px solid var(--color-primary-2)',
}))

const smallSelectStyles = computed(() => ({
  width: '90px',
  fontSize: '0.7rem',
  padding: '0.4rem',
  background: 'var(--bg-card)',
  color: 'var(--text-bright)',
  border: '2px solid var(--color-primary-2)',
}))

const actionBtnStyles = computed(() => ({
  fontSize: '0.65rem',
  padding: '0.35rem 0.7rem',
  whiteSpace: 'nowrap' as const,
}))

const centerStyles = computed(() => ({ display: 'flex', justifyContent: 'center', padding: '3rem' }))

const gridStyles = computed(() => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
  gap: '0.75rem',
}))

const recipeCardStyles = computed(() => ({
  background: 'var(--bg-card)',
  border: '2px solid var(--color-primary-2)',
  borderRadius: '4px',
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'border-color 0.2s, transform 0.2s',
}))

const recipeImageStyles = computed(() => ({ height: '120px', overflow: 'hidden', background: 'var(--bg-surface)' }))
const recipeImgStyles = computed(() => ({ width: '100%', height: '100%', objectFit: 'cover' as const }))
const recipePlaceholderStyles = computed(() => ({ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }))
const recipeInfoStyles = computed(() => ({ padding: '0.5rem' }))
const recipeNameStyles = computed(() => ({ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-bright)', margin: '0 0 0.3rem 0', lineHeight: '1.3' }))
const recipeMetaStyles = computed(() => ({ display: 'flex', gap: '0.5rem', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }))
const tagRowStyles = computed(() => ({ display: 'flex', gap: '0.2rem', flexWrap: 'wrap' as const }))
const tagStyles = computed(() => ({ fontSize: '0.55rem', padding: '0.1rem 0.3rem', background: 'var(--color-primary-1)', color: 'var(--color-primary-4)', borderRadius: '2px' }))
const emptyStyles = computed(() => ({ textAlign: 'center' as const, padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }))

// Plan tab styles
const recipePickerStyles = computed(() => ({ display: 'flex', flexDirection: 'column' as const, gap: '0.5rem' }))

const pickerItemStyles = (selected: boolean) => ({
  background: selected ? 'rgba(34, 197, 94, 0.08)' : 'var(--bg-card)',
  border: `2px solid ${selected ? 'var(--color-primary-3)' : 'var(--color-primary-1)'}`,
  borderRadius: '4px',
  padding: '0.75rem',
  cursor: 'pointer',
  transition: 'all 0.2s',
})

const pickerRowStyles = computed(() => ({ display: 'flex', alignItems: 'center', gap: '0.75rem' }))
const pickerInfoStyles = computed(() => ({ display: 'flex', flexDirection: 'column' as const, gap: '0.15rem' }))
const pickerNameStyles = computed(() => ({ fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-bright)' }))
const pickerMetaStyles = computed(() => ({ fontSize: '0.65rem', color: 'var(--text-muted)' }))

const multiplierStyles = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  marginTop: '0.5rem',
  paddingLeft: '2.25rem',
}))

const multiBtnStyles = computed(() => ({ padding: '0.15rem 0.45rem', fontSize: '0.65rem' }))
const multiplierValueStyles = computed(() => ({ fontSize: '0.9rem', fontWeight: '700', color: 'var(--color-primary-4)', minWidth: '1.5rem', textAlign: 'center' as const }))
const portionInfoStyles = computed(() => ({ fontSize: '0.65rem', color: 'var(--text-muted)', marginLeft: '0.25rem' }))

const generateSectionStyles = computed(() => ({
  marginTop: '1.25rem',
  padding: '0.75rem',
  background: 'var(--bg-card)',
  border: '2px solid var(--color-primary-2)',
  borderRadius: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap' as const,
  gap: '0.5rem',
}))

const summaryStyles = computed(() => ({ fontSize: '0.8rem', color: 'var(--text-bright)' }))
const generateBtnStyles = computed(() => ({ fontSize: '0.75rem', padding: '0.5rem 1rem' }))

// Shopping list styles
const progressContainerStyles = computed(() => ({ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }))
const progressBarStyles = computed(() => ({ flex: '1', height: '16px', background: 'var(--bg-card)', border: '2px solid var(--color-primary-2)', borderRadius: '2px', overflow: 'hidden' }))
const progressFillStyles = computed(() => ({
  height: '100%',
  width: `${shoppingProgress.value}%`,
  background: shoppingProgress.value === 100 ? 'var(--color-primary-4)' : 'linear-gradient(90deg, var(--color-primary-3), var(--color-primary-4))',
  transition: 'width 0.3s ease',
}))
const progressTextStyles = computed(() => ({ fontSize: '0.75rem', color: 'var(--text-bright)', whiteSpace: 'nowrap' as const }))

const categoryGroupStyles = computed(() => ({ marginBottom: '1rem' }))
const categoryTitleStyles = computed(() => ({ fontSize: '0.85rem', color: 'var(--text-bright)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }))

const shoppingItemsStyles = computed(() => ({ display: 'flex', flexDirection: 'column' as const, gap: '2px' }))

const shoppingItemStyles = (checked: boolean) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.65rem 0.75rem',
  background: checked ? 'rgba(34, 197, 94, 0.05)' : 'var(--bg-card)',
  border: `1px solid ${checked ? 'rgba(34, 197, 94, 0.2)' : 'var(--color-primary-1)'}`,
  borderRadius: '2px',
  cursor: 'pointer',
  transition: 'all 0.15s',
  opacity: checked ? '0.5' : '1',
  minHeight: '44px',
})

const checkboxAreaStyles = computed(() => ({ flexShrink: '0', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }))

const checkboxStyles = (checked: boolean) => ({
  width: '22px',
  height: '22px',
  border: `3px solid ${checked ? '#22c55e' : 'var(--color-primary-3)'}`,
  borderRadius: '2px',
  background: checked ? '#22c55e' : 'transparent',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontWeight: '700',
  fontSize: '12px',
  flexShrink: '0',
})

const itemDetailStyles = computed(() => ({ flex: '1', display: 'flex', flexDirection: 'column' as const, gap: '0.1rem' }))
const itemNameStyles = (checked: boolean) => ({ fontSize: '0.8rem', color: checked ? 'var(--text-muted)' : 'var(--text-bright)', textDecoration: checked ? 'line-through' : 'none', fontWeight: '500' })
const itemAmountStyles = computed(() => ({ fontSize: '0.7rem', color: 'var(--text-muted)' }))
const onHandStyles = computed(() => ({ color: '#22c55e', fontWeight: '500' }))
const recipeTagStyles = computed(() => ({ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.65rem' }))

// Prep guide styles
const prepGuideDetailsStyles = computed(() => ({ marginBottom: '1rem', border: '2px solid var(--color-primary-2)', borderRadius: '4px', background: 'var(--bg-card)' }))
const prepGuideSummaryStyles = computed(() => ({ padding: '0.6rem 0.75rem', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-bright)', fontWeight: '600' }))
const prepGuideContentStyles = computed(() => ({ padding: '0 0.75rem 0.75rem' }))
const sharedPrepStyles = computed(() => ({ marginBottom: '1rem', padding: '0.6rem', background: 'rgba(34, 197, 94, 0.06)', border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: '4px' }))
const prepSectionTitleStyles = computed(() => ({ fontSize: '0.75rem', color: '#22c55e', margin: '0 0 0.25rem 0', fontWeight: '600' }))
const prepHintStyles = computed(() => ({ fontSize: '0.65rem', color: 'var(--text-muted)', margin: '0 0 0.5rem 0' }))
const sharedItemStyles = computed(() => ({ marginBottom: '0.35rem', display: 'flex', flexDirection: 'column' as const, gap: '0.1rem' }))
const sharedItemNameStyles = computed(() => ({ fontSize: '0.75rem', color: 'var(--text-bright)', fontWeight: '500' }))
const sharedItemBreakdownStyles = computed(() => ({ fontSize: '0.65rem', color: 'var(--text-muted)', paddingLeft: '0.5rem' }))
const recipeGuideStyles = computed(() => ({ marginBottom: '1rem', padding: '0.6rem', background: 'var(--bg-surface)', border: '1px solid var(--color-primary-1)', borderRadius: '4px' }))
const recipeGuideTitleStyles = computed(() => ({ fontSize: '0.8rem', color: 'var(--color-primary-4)', margin: '0 0 0.4rem 0', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }))
const portionBadgeStyles = computed(() => ({ fontSize: '0.6rem', background: 'var(--color-primary-1)', color: 'var(--color-primary-4)', padding: '0.1rem 0.4rem', borderRadius: '8px', fontWeight: '500' }))
const recipeGuideIngredientsStyles = computed(() => ({ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem', lineHeight: '1.6' }))
const recipeGuideIngStyles = computed(() => ({}))
const recipeGuideInstStyles = computed(() => ({ fontSize: '0.72rem', color: 'var(--text-bright)', lineHeight: '1.7', marginTop: '0.4rem' }))

// Charts (collapsible)
const chartDetailsStyles = computed(() => ({ marginTop: '1.5rem', border: '2px solid var(--color-primary-2)', borderRadius: '4px', background: 'var(--bg-card)' }))
const chartSummaryStyles = computed(() => ({ padding: '0.6rem 0.75rem', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' }))
const chartsRowStyles = computed(() => ({ display: 'flex', gap: '0.75rem', padding: '0.75rem', flexWrap: 'wrap' as const }))
const chartCardStyles = computed(() => ({ flex: '1', minWidth: '250px', display: 'flex', justifyContent: 'center' }))

// Pantry styles
const addItemFormStyles = computed(() => ({ display: 'flex', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap' as const, alignItems: 'center' }))
const inventoryGroupStyles = computed(() => ({ marginBottom: '1rem' }))
const inventoryListStyles = computed(() => ({ display: 'flex', flexDirection: 'column' as const, gap: '2px' }))
const inventoryItemStyles = computed(() => ({ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.6rem', background: 'var(--bg-card)', border: '1px solid var(--color-primary-1)', borderRadius: '2px' }))
const invItemNameStyles = computed(() => ({ flex: '1', fontSize: '0.8rem', color: 'var(--text-bright)' }))
const invItemQtyStyles = computed(() => ({ fontSize: '0.75rem', color: 'var(--text-muted)' }))

// Modal styles
const modalOverlayStyles = computed(() => ({ position: 'fixed' as const, top: '0', left: '0', right: '0', bottom: '0', background: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: '100', padding: '1rem' }))
const modalStyles = computed(() => ({ background: 'var(--bg-surface)', border: '3px solid var(--color-primary-3)', borderRadius: '4px', maxWidth: '600px', width: '100%', maxHeight: '85vh', overflow: 'auto' }))
const modalHeaderStyles = computed(() => ({ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '0.75rem 1rem', borderBottom: '2px solid var(--color-primary-2)' }))
const modalTitleStyles = computed(() => ({ fontSize: '1rem', color: 'var(--text-bright)', margin: '0' }))
const modalBodyStyles = computed(() => ({ padding: '0.75rem 1rem' }))
const modalFooterStyles = computed(() => ({ padding: '0.5rem 1rem', borderTop: '2px solid var(--color-primary-2)', display: 'flex', justifyContent: 'flex-end' }))
const descStyles = computed(() => ({ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem', lineHeight: '1.5' }))
const stepStyles = computed(() => ({ marginBottom: '1rem' }))
const stepTitleStyles = computed(() => ({ fontSize: '0.8rem', color: 'var(--color-primary-4)', marginBottom: '0.4rem', marginTop: '0.75rem' }))
const ingredientListStyles = computed(() => ({ padding: '0.4rem', background: 'var(--bg-card)', borderRadius: '2px' }))
const ingredientStyles = computed(() => ({ display: 'flex', gap: '0.4rem', padding: '0.15rem 0', fontSize: '0.75rem' }))
const ingAmountStyles = computed(() => ({ color: 'var(--color-primary-3)', minWidth: '55px' }))
const ingNameStyles = computed(() => ({ color: 'var(--text-bright)', fontWeight: '500' }))
const ingNoteStyles = computed(() => ({ color: 'var(--text-muted)', fontStyle: 'italic' }))
const instructionStyles = computed(() => ({ fontSize: '0.75rem', color: 'var(--text-bright)', lineHeight: '1.6' }))
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

.recipe-card:hover { border-color: var(--color-primary-3) !important; transform: translateY(-2px); }
.shopping-item:hover { background: rgba(var(--color-primary-3), 0.05) !important; }
.picker-item:hover { border-color: var(--color-primary-3) !important; }

.tab-emoji { font-size: 0.8rem; }

@media (max-width: 640px) {
  .tab-label { display: none; }
  .tab-emoji { font-size: 1.1rem; }
}

:deep(.nes-btn) { font-family: "Press Start 2P", monospace !important; }
:deep(.nes-input), :deep(.nes-select) { font-family: "Press Start 2P", monospace !important; }
</style>
