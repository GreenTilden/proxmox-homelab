import { ref, computed } from 'vue'
import { apiFetch } from '@/services/apiClient'

// --- Types ---

export interface DecisionGate {
  id: string
  label: string
  description: string
  status: 'not-started' | 'in-progress' | 'blocked' | 'completed'
  phase: string
  dependencies: string[]
  evidence: string | null
  sortOrder: number
  depsReady?: boolean
}

export interface Milestone {
  id: string
  label: string
  description: string
  phase: string
  targetDate: string | null
  status: 'upcoming' | 'active' | 'completed'
  sortOrder: number
}

export interface FinancialGoal {
  id: string
  label: string
  target: number
  current: number
  unit: string
  color?: string
}

export interface RiskItem {
  id: string
  title: string
  description: string
  column: 'known-known' | 'known-unknown' | 'mitigated'
  phase: string
  impact: 'high' | 'medium' | 'low'
  mitigation: string | null
  linkedGateId: string | null
}

export interface Expense {
  id: string
  date: string
  amount: number
  category: string
  classification: 'business' | 'personal' | 'mixed'
  description: string
  vendor: string
  rewardCard: string | null
}

export interface ExpenseCategory {
  id: string
  label: string
  icon: string
}

export interface RevenueStream {
  id: string
  name: string
  type: 'hourly' | 'retainer' | 'project'
  monthlyAmount: number
  hourlyRate: number | null
  hoursPerMonth: number | null
  startMonth: string | null
  endMonth: string | null
  probability: number
  color?: string
  notes: string
}

export interface Scenario {
  id: string
  name: string
  description: string
  streamIds: string[]
  monthlyExpenses: number
  taxRate: number
  color?: string
}

export interface ProjectionMonth {
  month: string
  grossRevenue: number
  taxes: number
  netRevenue: number
  expenses: number
  netCashFlow: number
  cumulative: number
  streams: { id: string; name: string; amount: number }[]
}

export interface ScenarioProjection {
  scenario: string
  scenarioId: string
  months: ProjectionMonth[]
  totalGrossRevenue: number
  totalNetCashFlow: number
  breakEvenMonth: string | null
  annualizedGross: number
}

export interface RewardsEstimate {
  estimates: { card: string; name: string; spending: number; reward: number }[]
  totalRewards: number
  annualizedRewards: number
}

// --- Phase definitions ---

export const PHASES = [
  { id: 'foundation', label: 'Foundation', description: 'Pre-baby prep' },
  { id: 'paternity', label: 'Paternity', description: 'Mar-May 2026' },
  { id: 'transition', label: 'Transition', description: 'Notice & handoff' },
  { id: 'launch', label: 'Launch', description: 'First clients' },
  { id: 'steady-state', label: 'Steady State', description: 'Full independence' },
]

// --- Composable ---

export function useFinancials() {
  const gates = ref<DecisionGate[]>([])
  const milestones = ref<Milestone[]>([])
  const goals = ref<FinancialGoal[]>([])
  const risks = ref<RiskItem[]>([])
  const expenses = ref<Expense[]>([])
  const categories = ref<ExpenseCategory[]>([])
  const revenueStreams = ref<RevenueStream[]>([])
  const scenarios = ref<Scenario[]>([])
  const projections = ref<Map<string, ScenarioProjection>>(new Map())
  const rewards = ref<RewardsEstimate | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const expenseTotals = ref({ total: 0, businessTotal: 0, personalTotal: 0 })

  // --- Gates ---

  async function fetchGates() {
    try {
      const data = await apiFetch('/financials/gates')
      gates.value = data.gates || []
    } catch (e: any) {
      error.value = e.message
    }
  }

  async function updateGate(id: string, updates: Partial<DecisionGate>) {
    try {
      const result = await apiFetch(`/financials/gates/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      })
      await fetchGates()
      return result
    } catch (e: any) {
      error.value = e.message
      throw e
    }
  }

  async function seedDefaultGates() {
    try {
      await apiFetch('/financials/gates/seed', { method: 'POST' })
      await fetchGates()
    } catch (e: any) {
      error.value = e.message
    }
  }

  // --- Timeline ---

  async function fetchTimeline() {
    try {
      const data = await apiFetch('/financials/timeline')
      milestones.value = (data.milestones || []).sort(
        (a: Milestone, b: Milestone) => a.sortOrder - b.sortOrder
      )
    } catch (e: any) {
      error.value = e.message
    }
  }

  async function addMilestone(milestone: Partial<Milestone>) {
    try {
      await apiFetch('/financials/timeline', {
        method: 'POST',
        body: JSON.stringify(milestone),
      })
      await fetchTimeline()
    } catch (e: any) {
      error.value = e.message
    }
  }

  // --- Goals ---

  async function fetchGoals() {
    try {
      const data = await apiFetch('/financials/goals')
      goals.value = data.goals || []
    } catch (e: any) {
      error.value = e.message
    }
  }

  async function addGoal(goal: Partial<FinancialGoal>) {
    try {
      await apiFetch('/financials/goals', {
        method: 'POST',
        body: JSON.stringify(goal),
      })
      await fetchGoals()
    } catch (e: any) {
      error.value = e.message
    }
  }

  async function updateGoal(id: string, updates: Partial<FinancialGoal>) {
    try {
      await apiFetch(`/financials/goals/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      })
      await fetchGoals()
    } catch (e: any) {
      error.value = e.message
    }
  }

  async function removeGoal(id: string) {
    try {
      await apiFetch(`/financials/goals/${id}`, { method: 'DELETE' })
      await fetchGoals()
    } catch (e: any) {
      error.value = e.message
    }
  }

  async function seedDefaultGoals() {
    try {
      await apiFetch('/financials/goals/seed', { method: 'POST' })
      await fetchGoals()
    } catch (e: any) {
      error.value = e.message
    }
  }

  async function migrateGoalsFromLocalStorage(storageKey: string) {
    if (goals.value.length > 0) return
    try {
      const stored = localStorage.getItem(storageKey)
      if (!stored) return
      const parsed = JSON.parse(stored)
      if (!Array.isArray(parsed) || parsed.length === 0) return
      for (const g of parsed) {
        await apiFetch('/financials/goals', {
          method: 'POST',
          body: JSON.stringify({
            id: g.id,
            label: g.label,
            target: g.target,
            current: g.current,
            unit: g.unit,
            color: g.color,
          }),
        })
      }
      localStorage.removeItem(storageKey)
      await fetchGoals()
    } catch {
      // Silently fail migration — localStorage data preserved if API down
    }
  }

  // --- Risks ---

  async function fetchRisks() {
    try {
      const data = await apiFetch('/financials/risks')
      risks.value = data.risks || []
    } catch (e: any) {
      error.value = e.message
    }
  }

  async function addRisk(risk: Partial<RiskItem>) {
    try {
      await apiFetch('/financials/risks', {
        method: 'POST',
        body: JSON.stringify(risk),
      })
      await fetchRisks()
    } catch (e: any) {
      error.value = e.message
    }
  }

  async function updateRisk(id: string, updates: Partial<RiskItem>) {
    try {
      await apiFetch(`/financials/risks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      })
      await fetchRisks()
    } catch (e: any) {
      error.value = e.message
    }
  }

  async function moveRisk(id: string, column: RiskItem['column']) {
    return updateRisk(id, { column })
  }

  async function deleteRisk(id: string) {
    try {
      await apiFetch(`/financials/risks/${id}`, { method: 'DELETE' })
      await fetchRisks()
    } catch (e: any) {
      error.value = e.message
    }
  }

  async function seedDefaultRisks() {
    try {
      await apiFetch('/financials/risks/seed', { method: 'POST' })
      await fetchRisks()
    } catch (e: any) {
      error.value = e.message
    }
  }

  // --- Expenses ---

  async function fetchCategories() {
    try {
      const data = await apiFetch('/financials/categories')
      categories.value = data.categories || []
    } catch (e: any) {
      error.value = e.message
    }
  }

  async function fetchExpenses(filters?: { month?: string; category?: string; classification?: string }) {
    try {
      const params = new URLSearchParams()
      if (filters?.month) params.set('month', filters.month)
      if (filters?.category) params.set('category', filters.category)
      if (filters?.classification) params.set('classification', filters.classification)
      const qs = params.toString() ? `?${params}` : ''
      const data = await apiFetch(`/financials/expenses${qs}`)
      expenses.value = data.expenses || []
      expenseTotals.value = {
        total: data.total || 0,
        businessTotal: data.businessTotal || 0,
        personalTotal: data.personalTotal || 0,
      }
    } catch (e: any) {
      error.value = e.message
    }
  }

  async function addExpense(expense: Partial<Expense>) {
    try {
      await apiFetch('/financials/expenses', {
        method: 'POST',
        body: JSON.stringify(expense),
      })
      await fetchExpenses()
    } catch (e: any) {
      error.value = e.message
    }
  }

  // --- Revenue Streams ---

  async function fetchRevenue() {
    try {
      const data = await apiFetch('/financials/revenue')
      revenueStreams.value = data.streams || []
    } catch (e: any) {
      error.value = e.message
    }
  }

  async function addRevenueStream(stream: Partial<RevenueStream>) {
    try {
      await apiFetch('/financials/revenue', {
        method: 'POST',
        body: JSON.stringify(stream),
      })
      await fetchRevenue()
    } catch (e: any) {
      error.value = e.message
    }
  }

  async function updateRevenueStream(id: string, updates: Partial<RevenueStream>) {
    try {
      await apiFetch(`/financials/revenue/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      })
      await fetchRevenue()
    } catch (e: any) {
      error.value = e.message
    }
  }

  async function deleteRevenueStream(id: string) {
    try {
      await apiFetch(`/financials/revenue/${id}`, { method: 'DELETE' })
      await fetchRevenue()
    } catch (e: any) {
      error.value = e.message
    }
  }

  async function seedDefaultRevenue() {
    try {
      await apiFetch('/financials/revenue/seed', { method: 'POST' })
      await fetchRevenue()
    } catch (e: any) {
      error.value = e.message
    }
  }

  // --- Scenarios ---

  async function fetchScenarios() {
    try {
      const data = await apiFetch('/financials/scenarios')
      scenarios.value = data.scenarios || []
    } catch (e: any) {
      error.value = e.message
    }
  }

  async function addScenario(scenario: Partial<Scenario>) {
    try {
      await apiFetch('/financials/scenarios', {
        method: 'POST',
        body: JSON.stringify(scenario),
      })
      await fetchScenarios()
    } catch (e: any) {
      error.value = e.message
    }
  }

  async function updateScenario(id: string, updates: Partial<Scenario>) {
    try {
      await apiFetch(`/financials/scenarios/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      })
      await fetchScenarios()
    } catch (e: any) {
      error.value = e.message
    }
  }

  async function deleteScenario(id: string) {
    try {
      await apiFetch(`/financials/scenarios/${id}`, { method: 'DELETE' })
      await fetchScenarios()
      projections.value.delete(id)
    } catch (e: any) {
      error.value = e.message
    }
  }

  async function seedDefaultScenarios() {
    try {
      await apiFetch('/financials/scenarios/seed', { method: 'POST' })
      await fetchScenarios()
    } catch (e: any) {
      error.value = e.message
    }
  }

  async function fetchProjection(scenarioId: string, startMonth?: string) {
    try {
      const qs = startMonth ? `?start=${startMonth}` : ''
      const data = await apiFetch(`/financials/scenarios/${scenarioId}/projection${qs}`)
      projections.value.set(scenarioId, data)
      return data as ScenarioProjection
    } catch (e: any) {
      error.value = e.message
      return null
    }
  }

  async function fetchAllProjections(startMonth?: string) {
    const results: ScenarioProjection[] = []
    for (const s of scenarios.value) {
      const p = await fetchProjection(s.id, startMonth)
      if (p) results.push(p)
    }
    return results
  }

  // --- Rewards ---

  async function fetchRewards() {
    try {
      const data = await apiFetch('/financials/rewards/estimate')
      rewards.value = data
    } catch (e: any) {
      error.value = e.message
    }
  }

  // --- Computed ---

  const gateProgress = computed(() => {
    if (gates.value.length === 0) return 0
    const completed = gates.value.filter(g => g.status === 'completed').length
    return Math.round((completed / gates.value.length) * 100)
  })

  const activePhase = computed(() => {
    // Determine current phase from gates — first incomplete gate's phase
    const sorted = [...gates.value].sort((a, b) => a.sortOrder - b.sortOrder)
    const incomplete = sorted.find(g => g.status !== 'completed')
    return incomplete?.phase || 'steady-state'
  })

  const monthlyBurn = computed(() => expenseTotals.value.total)

  const nextMilestone = computed(() => {
    const now = new Date().toISOString().slice(0, 10)
    const upcoming = milestones.value
      .filter(m => m.targetDate && m.targetDate >= now && m.status !== 'completed')
      .sort((a, b) => (a.targetDate || '').localeCompare(b.targetDate || ''))
    return upcoming[0] || null
  })

  const knownKnowns = computed(() => risks.value.filter(r => r.column === 'known-known'))
  const knownUnknowns = computed(() => risks.value.filter(r => r.column === 'known-unknown'))
  const mitigatedRisks = computed(() => risks.value.filter(r => r.column === 'mitigated'))

  // --- Init ---

  async function init() {
    isLoading.value = true
    try {
      await Promise.all([
        fetchGates(),
        fetchTimeline(),
        fetchGoals(),
        fetchRisks(),
        fetchCategories(),
        fetchExpenses(),
        fetchRevenue(),
        fetchScenarios(),
      ])
      // Fetch projections after scenarios are loaded
      if (scenarios.value.length > 0) {
        await fetchAllProjections()
      }
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    gates, milestones, goals, risks, expenses, categories,
    revenueStreams, scenarios, projections, rewards,
    isLoading, error, expenseTotals,

    // Computed
    gateProgress, activePhase, monthlyBurn, nextMilestone,
    knownKnowns, knownUnknowns, mitigatedRisks,

    // Gate actions
    fetchGates, updateGate, seedDefaultGates,

    // Timeline actions
    fetchTimeline, addMilestone,

    // Goal actions
    fetchGoals, addGoal, updateGoal, removeGoal, seedDefaultGoals, migrateGoalsFromLocalStorage,

    // Risk actions
    fetchRisks, addRisk, updateRisk, moveRisk, deleteRisk, seedDefaultRisks,

    // Expense actions
    fetchCategories, fetchExpenses, addExpense,

    // Revenue actions
    fetchRevenue, addRevenueStream, updateRevenueStream, deleteRevenueStream, seedDefaultRevenue,

    // Scenario actions
    fetchScenarios, addScenario, updateScenario, deleteScenario, seedDefaultScenarios,
    fetchProjection, fetchAllProjections,

    // Rewards
    fetchRewards,

    // Init
    init,
  }
}
