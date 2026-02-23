<template>
  <SeasonalThemeProvider :enable-scanlines="true" :enable-particles="false" :enable-animations="true">
    <Arcade1942Background :scroll-speed="0.5" :opacity="0.35" />
    <div :style="appStyles">
      <!-- Header -->
      <header :style="headerStyles">
        <router-link to="/" style="text-decoration: none; color: inherit; display: flex; align-items: center; gap: 0.5rem;">
          <img src="/qca.png" alt="QCA" :style="logoStyles" />
        </router-link>
        <div style="flex: 1;">
          <h1 class="nes-text" :style="titleStyles">Operation Darrentan</h1>
          <div :style="subtitleStyles">{{ currentDate }}</div>
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
          <span v-if="tab.id === 'ops' && incompleteTasks.length > 0" :style="badgeStyles">
            {{ incompleteTasks.length }}
          </span>
          <span v-if="tab.id === 'recon' && fin.knownUnknowns.value.length > 0" :style="badgeStyles">
            {{ fin.knownUnknowns.value.length }}
          </span>
        </button>
      </div>

      <!-- Main Content -->
      <main :style="mainStyles">
        <!-- Error Banners -->
        <div v-if="error" :style="errorStyles">
          {{ error }}
          <button class="nes-btn is-error" style="margin-left: 1rem; font-size: 0.6rem;" @click="error = null">X</button>
        </div>
        <div v-if="fin.error.value" :style="errorStyles">
          {{ fin.error.value }}
          <button class="nes-btn is-error" style="margin-left: 1rem; font-size: 0.6rem;" @click="fin.error.value = null">X</button>
        </div>

        <!-- HQ TAB — Overview -->
        <section v-if="activeTab === 'hq'">
          <!-- Decision Gate Progress -->
          <div :style="cardStyles" v-if="fin.gates.value.length > 0">
            <h3 :style="cardTitleStyles">Decision Gates</h3>
            <div :style="progressContainerStyles">
              <div :style="progressBarStyles">
                <div :style="progressFillStyles(fin.gateProgress.value)"></div>
              </div>
              <span :style="progressTextStyles">{{ fin.gates.value.filter(g => g.status === 'completed').length }}/{{ fin.gates.value.length }} gates</span>
            </div>
            <div style="margin-top: 0.5rem;">
              <div v-for="gate in fin.gates.value" :key="gate.id" :style="gateListItem(gate)">
                <span :style="gateStatusIcon(gate)">{{ gate.status === 'completed' ? '\u2705' : gate.status === 'blocked' ? '\u26D4' : gate.depsReady === false && gate.dependencies.length > 0 ? '\uD83D\uDD12' : '\u2B1C' }}</span>
                <span :style="gateListLabel">{{ gate.label }}</span>
                <span :style="gateListStatus(gate)">{{ gate.status === 'not-started' && !gate.depsReady && gate.dependencies.length > 0 ? 'LOCKED' : gate.status.replace('-', ' ').toUpperCase() }}</span>
              </div>
            </div>
          </div>
          <div v-else :style="cardStyles">
            <h3 :style="cardTitleStyles">Decision Gates</h3>
            <p :style="emptyInlineStyles">No gates configured.</p>
            <button class="nes-btn is-primary" :style="actionBtnStyles" @click="handleSeedGates">Seed Default Gates</button>
          </div>

          <!-- Active Phase -->
          <div :style="cardStyles">
            <h3 :style="cardTitleStyles">Active Phase</h3>
            <PhaseTimeline
              :active-phase="fin.activePhase.value"
              :milestones="fin.milestones.value"
              :accent-color="OPS_GREEN"
              :gold-color="OPS_GOLD"
            />
          </div>

          <!-- Task summary -->
          <div :style="cardStyles">
            <h3 :style="cardTitleStyles">Mission Status</h3>
            <div :style="progressContainerStyles">
              <div :style="progressBarStyles">
                <div :style="progressFillStyles(taskProgress)"></div>
              </div>
              <span :style="progressTextStyles">{{ completedTasks.length }}/{{ tasks.length }} tasks</span>
            </div>
          </div>

          <!-- High priority tasks -->
          <div :style="cardStyles" v-if="highPriorityTasks.length > 0">
            <h3 :style="cardTitleStyles">Priority Intel</h3>
            <div v-for="task in highPriorityTasks" :key="task.id" :style="quickTaskStyles">
              <span :style="priorityBadgeStyles(task.priority)">P{{ task.priority }}</span>
              <span :style="quickTaskNameStyles">{{ task.summary }}</span>
              <span v-if="task.due" :style="dueDateStyles">{{ formatDate(task.due) }}</span>
            </div>
          </div>

          <!-- Upcoming events -->
          <div :style="cardStyles" v-if="upcomingEvents.length > 0">
            <h3 :style="cardTitleStyles">Incoming Transmissions</h3>
            <div v-for="event in upcomingEvents.slice(0, 5)" :key="event.id" :style="eventItemStyles">
              <span :style="eventDateStyles">{{ formatDate(event.startDate) }}</span>
              <span :style="eventTitleStyles">{{ event.title }}</span>
            </div>
          </div>

          <!-- Supply Lines summary (from server goals) -->
          <div :style="cardStyles" v-if="fin.goals.value.length > 0">
            <h3 :style="cardTitleStyles">Supply Lines</h3>
            <div v-for="goal in fin.goals.value" :key="goal.id" :style="goalSummaryStyles">
              <span :style="goalLabelStyles">{{ goal.label }}</span>
              <div :style="progressBarStyles">
                <div :style="progressFillStyles(goal.target ? Math.round((goal.current / goal.target) * 100) : 0, goal.color)"></div>
              </div>
              <span :style="goalValueStyles">${{ goal.current.toLocaleString() }} / ${{ goal.target.toLocaleString() }}</span>
            </div>
          </div>

          <!-- Quick Links -->
          <div :style="cardStyles">
            <h3 :style="cardTitleStyles">Quick Links</h3>
            <ProjectQuickLinks :links="quickLinks" />
          </div>
        </section>

        <!-- OPS TAB — Tasks -->
        <section v-if="activeTab === 'ops'">
          <!-- Category filter -->
          <div :style="filterBarStyles" v-if="allCategories.length > 0">
            <button
              class="nes-btn"
              :class="categoryFilter === '' ? 'is-primary' : ''"
              :style="filterBtnStyles"
              @click="categoryFilter = ''"
            >All</button>
            <button
              v-for="cat in allCategories"
              :key="cat"
              class="nes-btn"
              :class="categoryFilter === cat ? 'is-primary' : ''"
              :style="filterBtnStyles"
              @click="categoryFilter = cat"
            >{{ cat }}</button>
          </div>

          <!-- Status toggle -->
          <div :style="filterBarStyles">
            <button
              class="nes-btn"
              :class="taskStatusFilter === 'incomplete' ? 'is-warning' : ''"
              :style="filterBtnStyles"
              @click="taskStatusFilter = 'incomplete'; fetchTasks(taskStatusFilter)"
            >Active</button>
            <button
              class="nes-btn"
              :class="taskStatusFilter === 'completed' ? 'is-success' : ''"
              :style="filterBtnStyles"
              @click="taskStatusFilter = 'completed'; fetchTasks(taskStatusFilter)"
            >Completed</button>
            <button
              class="nes-btn"
              :class="taskStatusFilter === 'all' ? 'is-primary' : ''"
              :style="filterBtnStyles"
              @click="taskStatusFilter = 'all'; fetchTasks(taskStatusFilter)"
            >All</button>
          </div>

          <div v-if="isLoading && filteredTasks.length === 0" :style="emptyStyles">
            <p class="nes-text">Loading missions...</p>
          </div>

          <ProjectTaskList
            v-else
            :tasks="filteredTasks"
            :show-add-form="true"
            :show-priority="true"
            add-placeholder="New mission objective..."
            :accent-color="OPS_GREEN"
            :bg-color="OPS_NAVY"
            @add="handleAddTask"
            @toggle="handleToggleTask"
            @delete="handleDeleteTask"
          >
            <template #empty>
              <p class="nes-text">No missions found. Add your first objective above.</p>
            </template>
          </ProjectTaskList>
        </section>

        <!-- INTEL TAB — Timeline / Calendar -->
        <section v-if="activeTab === 'intel'">
          <!-- Phase timeline -->
          <div :style="cardStyles">
            <h3 :style="cardTitleStyles">Master Timeline</h3>
            <PhaseTimeline
              :active-phase="fin.activePhase.value"
              :milestones="fin.milestones.value"
              :accent-color="OPS_GREEN"
              :gold-color="OPS_GOLD"
            />
          </div>

          <!-- Decision Gates detail -->
          <div :style="cardStyles" v-if="fin.gates.value.length > 0">
            <h3 :style="cardTitleStyles">Decision Gates</h3>
            <DecisionGateCard
              v-for="gate in fin.gates.value"
              :key="gate.id"
              :gate="gate"
              :all-gates="fin.gates.value"
              :accent-color="OPS_GREEN"
              :bg-color="OPS_NAVY"
              @update="handleUpdateGate"
            />
          </div>

          <!-- Calendar events -->
          <ProjectTimelineView
            :events="events"
            :accent-color="OPS_GREEN"
            :gold-color="OPS_GOLD"
          >
            <template #empty>
              <p class="nes-text">No intel available. Events from Nextcloud will appear here.</p>
            </template>
          </ProjectTimelineView>
        </section>

        <!-- SUPPLY TAB — Goals / Scenarios / Expenses -->
        <section v-if="activeTab === 'supply'">
          <!-- Supply sub-tab toggle -->
          <div :style="filterBarStyles" style="margin-bottom: 0.75rem;">
            <button class="nes-btn" :class="supplyView === 'scenarios' ? 'is-primary' : ''" :style="filterBtnStyles" @click="supplyView = 'scenarios'">Scenarios</button>
            <button class="nes-btn" :class="supplyView === 'revenue' ? 'is-primary' : ''" :style="filterBtnStyles" @click="supplyView = 'revenue'">Revenue</button>
            <button class="nes-btn" :class="supplyView === 'goals' ? 'is-primary' : ''" :style="filterBtnStyles" @click="supplyView = 'goals'">Goals</button>
            <button class="nes-btn" :class="supplyView === 'expenses' ? 'is-primary' : ''" :style="filterBtnStyles" @click="supplyView = 'expenses'">Expenses</button>
          </div>

          <!-- SCENARIOS VIEW -->
          <template v-if="supplyView === 'scenarios'">
            <div v-if="fin.scenarios.value.length === 0" :style="cardStyles">
              <h3 :style="cardTitleStyles">Scenario Planning</h3>
              <p :style="emptyInlineStyles">No scenarios configured.</p>
              <button class="nes-btn is-primary" :style="actionBtnStyles" @click="handleSeedScenarios">Seed Defaults</button>
            </div>
            <template v-else>
              <!-- Projection Chart -->
              <div :style="cardStyles">
                <h3 :style="cardTitleStyles">12-Month Cash Flow Projection</h3>
                <ScenarioChart
                  :projections="fin.projections.value"
                  :scenarios="fin.scenarios.value"
                  :accent-color="OPS_GREEN"
                  :bg-color="OPS_NAVY"
                />
              </div>

              <!-- Scenario list -->
              <div :style="cardStyles">
                <h3 :style="cardTitleStyles">Scenarios</h3>
                <div v-for="s in fin.scenarios.value" :key="s.id" :style="scenarioItemStyles">
                  <span :style="scenarioDotStyle(s.color)"></span>
                  <div style="flex: 1; min-width: 0;">
                    <span :style="scenarioNameStyle">{{ s.name }}</span>
                    <span :style="scenarioDescStyle">{{ s.description }}</span>
                  </div>
                  <span :style="scenarioMetaStyle">{{ s.streamIds.length }} streams</span>
                  <span :style="scenarioMetaStyle">{{ (s.taxRate * 100).toFixed(0) }}% tax</span>
                  <span :style="scenarioMetaStyle">${{ s.monthlyExpenses.toLocaleString() }}/mo exp</span>
                </div>
              </div>
            </template>
          </template>

          <!-- REVENUE VIEW -->
          <template v-if="supplyView === 'revenue'">
            <div v-if="fin.revenueStreams.value.length === 0" :style="cardStyles">
              <h3 :style="cardTitleStyles">Revenue Streams</h3>
              <p :style="emptyInlineStyles">No revenue streams defined.</p>
              <button class="nes-btn is-primary" :style="actionBtnStyles" @click="handleSeedRevenue">Seed Defaults</button>
            </div>
            <template v-else>
              <div :style="cardStyles">
                <h3 :style="cardTitleStyles">Revenue Streams</h3>
                <div v-for="stream in fin.revenueStreams.value" :key="stream.id" :style="revenueCardStyles(stream)">
                  <div :style="revenueHeader">
                    <span :style="revenueDot(stream.color)"></span>
                    <span :style="revenueName">{{ stream.name }}</span>
                    <span :style="revenueType">{{ stream.type }}</span>
                    <span :style="revenueProbability(stream.probability)">{{ (stream.probability * 100).toFixed(0) }}%</span>
                  </div>
                  <div :style="revenueDetails">
                    <span :style="revenueAmount">${{ stream.monthlyAmount.toLocaleString() }}/mo</span>
                    <span v-if="stream.hourlyRate" :style="revenueMetaStyle">${{ stream.hourlyRate }}/hr x {{ stream.hoursPerMonth }}hrs</span>
                    <span :style="revenueMetaStyle">{{ stream.startMonth || '?' }} - {{ stream.endMonth || 'ongoing' }}</span>
                  </div>
                  <div v-if="stream.notes" :style="revenueNotes">{{ stream.notes }}</div>
                  <!-- Inline edit: probability + monthly amount -->
                  <div :style="revenueEditRow">
                    <label :style="revenueEditLabel">$/mo</label>
                    <input
                      :value="stream.monthlyAmount"
                      type="number"
                      class="nes-input"
                      :style="tinyInputStyles"
                      @change="handleUpdateRevenue(stream.id, { monthlyAmount: Number(($event.target as HTMLInputElement).value) })"
                    />
                    <label :style="revenueEditLabel">Prob</label>
                    <input
                      :value="stream.probability"
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      class="nes-input"
                      :style="tinyInputStyles"
                      @change="handleUpdateRevenue(stream.id, { probability: Number(($event.target as HTMLInputElement).value) })"
                    />
                  </div>
                </div>
              </div>

              <!-- Add revenue stream form -->
              <div :style="cardStyles">
                <h3 :style="cardTitleStyles">Add Revenue Stream</h3>
                <div :style="expenseFormStyles">
                  <input v-model="newRevName" placeholder="Name" class="nes-input" :style="inputStyles" />
                  <select v-model="newRevType" class="nes-select" :style="selectInputStyles">
                    <option value="hourly">Hourly</option>
                    <option value="retainer">Retainer</option>
                    <option value="project">Project</option>
                  </select>
                  <input v-model.number="newRevMonthly" type="number" placeholder="$/mo" class="nes-input" :style="smallInputStyles" />
                  <input v-model.number="newRevProb" type="number" step="0.1" min="0" max="1" placeholder="Prob" class="nes-input" :style="tinyInputStyles" />
                  <input v-model="newRevStart" type="month" class="nes-input" :style="smallInputStyles" />
                  <button class="nes-btn is-success" :style="actionBtnStyles" @click="handleAddRevenue" :disabled="!newRevName.trim() || !newRevMonthly">Add</button>
                </div>
              </div>
            </template>
          </template>

          <!-- GOALS VIEW -->
          <template v-if="supplyView === 'goals'">
            <div :style="addGoalFormStyles">
              <input v-model="newGoalLabel" placeholder="Goal name (e.g. Monthly Revenue)" class="nes-input" :style="inputStyles" />
              <input v-model.number="newGoalTarget" type="number" placeholder="Target $" class="nes-input" :style="smallInputStyles" />
              <input v-model.number="newGoalCurrent" type="number" placeholder="Current $" class="nes-input" :style="smallInputStyles" />
              <button class="nes-btn is-success" :style="actionBtnStyles" @click="handleAddGoal" :disabled="!newGoalLabel.trim() || !newGoalTarget">
                Add
              </button>
            </div>

            <div v-if="fin.goals.value.length === 0" :style="emptyStyles">
              <p class="nes-text">No supply lines tracked. Add revenue goals above.</p>
            </div>

            <div v-else :style="goalsGridStyles">
              <ProjectGoalCard
                v-for="goal in fin.goals.value"
                :key="goal.id"
                :goal="goal"
                :accent-color="OPS_GREEN"
                :bg-color="OPS_NAVY"
                @delete="handleRemoveGoal"
              >
                <template #edit>
                  <div :style="goalEditStyles">
                    <input
                      :value="goal.current"
                      type="number"
                      class="nes-input"
                      :style="smallInputStyles"
                      @change="handleUpdateGoalCurrent(goal.id, ($event.target as HTMLInputElement).valueAsNumber)"
                    />
                    <span :style="goalEditLabelStyles">current {{ goal.unit || '$' }}</span>
                  </div>
                </template>
              </ProjectGoalCard>
            </div>
          </template>

          <!-- EXPENSES VIEW -->
          <template v-if="supplyView === 'expenses'">
            <!-- Expense Entry -->
            <div :style="cardStyles">
              <h3 :style="cardTitleStyles">Add Expense</h3>
              <div :style="expenseFormStyles">
                <input v-model.number="newExpenseAmount" type="number" step="0.01" placeholder="Amount" class="nes-input" :style="smallInputStyles" />
                <select v-model="newExpenseCategory" class="nes-select" :style="selectInputStyles">
                  <option v-for="cat in fin.categories.value" :key="cat.id" :value="cat.id">{{ cat.icon }} {{ cat.label }}</option>
                </select>
                <select v-model="newExpenseClassification" class="nes-select" :style="selectInputStyles">
                  <option value="personal">Personal</option>
                  <option value="business">Business</option>
                  <option value="mixed">Mixed</option>
                </select>
                <input v-model="newExpenseDesc" placeholder="Description" class="nes-input" :style="inputStyles" />
                <input v-model="newExpenseVendor" placeholder="Vendor" class="nes-input" :style="smallInputStyles" />
                <select v-model="newExpenseCard" class="nes-select" :style="selectInputStyles">
                  <option :value="null">No card</option>
                  <option value="costco-citi">Costco Citi</option>
                  <option value="costco-executive">Costco Executive</option>
                  <option value="microcenter">Microcenter</option>
                </select>
                <button class="nes-btn is-success" :style="actionBtnStyles" @click="handleAddExpense" :disabled="!newExpenseAmount">
                  Log
                </button>
              </div>
            </div>

            <!-- Monthly expense summary -->
            <div :style="cardStyles" v-if="fin.expenses.value.length > 0">
              <h3 :style="cardTitleStyles">Expense Summary</h3>
              <div :style="expenseSummaryRow">
                <div :style="expenseStat">
                  <span :style="expenseStatLabel">Total</span>
                  <span :style="expenseStatValue">${{ fin.expenseTotals.value.total.toLocaleString(undefined, { minimumFractionDigits: 2 }) }}</span>
                </div>
                <div :style="expenseStat">
                  <span :style="expenseStatLabel">Business</span>
                  <span :style="expenseStatValueBiz">${{ fin.expenseTotals.value.businessTotal.toLocaleString(undefined, { minimumFractionDigits: 2 }) }}</span>
                </div>
                <div :style="expenseStat">
                  <span :style="expenseStatLabel">Personal</span>
                  <span :style="expenseStatValuePersonal">${{ fin.expenseTotals.value.personalTotal.toLocaleString(undefined, { minimumFractionDigits: 2 }) }}</span>
                </div>
              </div>
              <!-- Recent expenses list -->
              <div v-for="exp in fin.expenses.value.slice(0, 10)" :key="exp.id" :style="expenseRowStyles">
                <span :style="expenseDateCol">{{ exp.date }}</span>
                <span :style="expenseDescCol">{{ exp.description || exp.category }}</span>
                <span :style="expenseClassBadge(exp.classification)">{{ exp.classification.slice(0, 3).toUpperCase() }}</span>
                <span :style="expenseAmountCol">${{ exp.amount.toFixed(2) }}</span>
              </div>
            </div>

            <!-- Rewards estimate -->
            <div :style="cardStyles" v-if="fin.rewards.value">
              <h3 :style="cardTitleStyles">Rewards Estimate</h3>
              <div :style="expenseSummaryRow">
                <div :style="expenseStat">
                  <span :style="expenseStatLabel">Actual</span>
                  <span :style="expenseStatValueBiz">${{ fin.rewards.value.totalRewards.toFixed(2) }}</span>
                </div>
                <div :style="expenseStat">
                  <span :style="expenseStatLabel">Annualized</span>
                  <span :style="expenseStatValueBiz">${{ fin.rewards.value.annualizedRewards.toFixed(2) }}</span>
                </div>
              </div>
              <div v-for="est in fin.rewards.value.estimates" :key="est.card" :style="expenseRowStyles">
                <span :style="expenseDescCol">{{ est.name }}</span>
                <span :style="expenseAmountCol">${{ est.spending.toFixed(2) }} spent</span>
                <span :style="rewardAmtStyle">${{ est.reward.toFixed(2) }} back</span>
              </div>
            </div>
          </template>
        </section>

        <!-- RECON TAB — Risk Board -->
        <section v-if="activeTab === 'recon'">
          <div v-if="fin.risks.value.length === 0" :style="cardStyles">
            <h3 :style="cardTitleStyles">Risk Board</h3>
            <p :style="emptyInlineStyles">No risks tracked yet.</p>
            <button class="nes-btn is-primary" :style="actionBtnStyles" @click="handleSeedRisks">Seed Default Risks</button>
          </div>
          <RiskKanbanBoard
            v-else
            :risks="fin.risks.value"
            :accent-color="OPS_GREEN"
            :bg-color="OPS_NAVY"
            @move="handleMoveRisk"
            @add="handleAddRisk"
          />
        </section>
      </main>
    </div>
  </SeasonalThemeProvider>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import SeasonalThemeProvider from '../components/themes/retro/SeasonalThemeProvider.vue'
import Arcade1942Background from '../components/themes/arcade1942/Arcade1942Background.vue'
import ProjectTaskList from '../components/project/ProjectTaskList.vue'
import ProjectGoalCard from '../components/project/ProjectGoalCard.vue'
import ProjectTimelineView from '../components/project/ProjectTimelineView.vue'
import ProjectQuickLinks from '../components/project/ProjectQuickLinks.vue'
import DecisionGateCard from '../components/project/DecisionGateCard.vue'
import PhaseTimeline from '../components/project/PhaseTimeline.vue'
import RiskKanbanBoard from '../components/project/RiskKanbanBoard.vue'
import ScenarioChart from '../components/project/ScenarioChart.vue'
import type { QuickLink } from '../components/project/ProjectQuickLinks.vue'
import { useProjectHub } from '../composables/useProjectHub'
import { useFinancials } from '../composables/useFinancials'
import type { DecisionGate, RiskItem, RevenueStream } from '../composables/useFinancials'

// Set page favicon
const originalFavicon = document.querySelector('link[rel="icon"]')?.getAttribute('href') || ''
function setFavicon(emoji: string) {
  const link = document.querySelector('link[rel="icon"]') as HTMLLinkElement
  if (link) link.href = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${emoji}</text></svg>`
}
setFavicon('\uD83C\uDFAF')
onUnmounted(() => {
  const link = document.querySelector('link[rel="icon"]') as HTMLLinkElement
  if (link) link.href = originalFavicon
})

// --- Project Hub (tasks, events) ---
const {
  tasks, events, isLoading, error,
  incompleteTasks, completedTasks, highPriorityTasks, upcomingEvents, taskProgress,
  fetchTasks, createTask, toggleTaskComplete, deleteTask,
  fetchProjectEvents,
} = useProjectHub({
  taskCalendar: 'tasks',
  eventCalendar: 'personal',
  goalsStorageKey: 'darrentan-goals',
})

// --- Financials (gates, timeline, goals, risks, expenses) ---
const fin = useFinancials()

const activeTab = ref('hq')
const categoryFilter = ref('')
const taskStatusFilter = ref('incomplete')
const newGoalLabel = ref('')
const newGoalTarget = ref<number>(0)
const newGoalCurrent = ref<number>(0)

// Supply sub-view
const supplyView = ref<'scenarios' | 'revenue' | 'goals' | 'expenses'>('scenarios')

// Expense form state
const newExpenseAmount = ref<number>(0)
const newExpenseCategory = ref('other')
const newExpenseClassification = ref<'business' | 'personal' | 'mixed'>('personal')
const newExpenseDesc = ref('')
const newExpenseVendor = ref('')
const newExpenseCard = ref<string | null>(null)

// Revenue form state
const newRevName = ref('')
const newRevType = ref<'hourly' | 'retainer' | 'project'>('retainer')
const newRevMonthly = ref<number>(0)
const newRevProb = ref<number>(0.5)
const newRevStart = ref('')

const tabs = [
  { id: 'hq', label: 'HQ', icon: '\uD83C\uDFDB\uFE0F' },
  { id: 'ops', label: 'Ops', icon: '\u2694\uFE0F' },
  { id: 'intel', label: 'Intel', icon: '\uD83D\uDCE1' },
  { id: 'supply', label: 'Supply', icon: '\uD83D\uDCB0' },
  { id: 'recon', label: 'Recon', icon: '\uD83D\uDD0D' },
]

const quickLinks: QuickLink[] = [
  { label: 'Nextcloud', url: 'https://nextcloud.darrenarney.com', emoji: '\u2601\uFE0F', color: '#3a7bd5' },
  { label: 'Tandoor', url: 'https://tandoor.darrenarney.com', emoji: '\uD83C\uDF73', color: '#e8a838' },
  { label: 'n8n', url: 'https://n8n.darrenarney.com', emoji: '\u26A1', color: '#ff6d5a' },
  { label: 'Vault', url: '/vault', emoji: '\uD83D\uDD10', color: '#6a9fb5' },
]

const currentDate = computed(() => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
})

const allCategories = computed(() => {
  const cats = new Set<string>()
  tasks.value.forEach((t) => t.categories.forEach((c) => cats.add(c)))
  return Array.from(cats).sort()
})

const filteredTasks = computed(() => {
  let list = tasks.value
  if (categoryFilter.value) {
    list = list.filter((t) => t.categories.includes(categoryFilter.value))
  }
  return list
})

// --- Init ---
onMounted(async () => {
  // Init financials (gates, timeline, goals, risks, expenses, revenue, scenarios)
  await fin.init()
  // Migrate localStorage goals to server
  fin.migrateGoalsFromLocalStorage('darrentan-goals')
  // Fetch rewards estimate
  fin.fetchRewards()
  // Init project hub (tasks, events)
  await Promise.all([fetchTasks(), fetchProjectEvents()])
})

// --- Task Handlers ---
async function handleAddTask(summary: string, priority: number) {
  if (!summary) return
  await createTask({ summary, priority: priority || undefined })
}

async function handleToggleTask(uid: string) {
  await toggleTaskComplete(uid)
}

async function handleDeleteTask(uid: string) {
  await deleteTask(uid)
}

// --- Goal Handlers (server-persisted via financials) ---
async function handleAddGoal() {
  if (!newGoalLabel.value.trim() || !newGoalTarget.value) return
  await fin.addGoal({
    id: Date.now().toString(),
    label: newGoalLabel.value.trim(),
    target: newGoalTarget.value,
    current: newGoalCurrent.value || 0,
    unit: '$',
    color: '#4a6741',
  })
  newGoalLabel.value = ''
  newGoalTarget.value = 0
  newGoalCurrent.value = 0
}

async function handleUpdateGoalCurrent(id: string, value: number) {
  await fin.updateGoal(id, { current: value || 0 })
}

async function handleRemoveGoal(id: string) {
  await fin.removeGoal(id)
}

// --- Gate Handlers ---
async function handleUpdateGate(id: string, updates: Partial<DecisionGate>) {
  await fin.updateGate(id, updates)
}

async function handleSeedGates() {
  await fin.seedDefaultGates()
}

// --- Risk Handlers ---
async function handleMoveRisk(id: string, column: RiskItem['column']) {
  await fin.moveRisk(id, column)
}

async function handleAddRisk(risk: Partial<RiskItem>) {
  await fin.addRisk(risk)
}

async function handleSeedRisks() {
  await fin.seedDefaultRisks()
}

// --- Revenue Handlers ---
async function handleAddRevenue() {
  if (!newRevName.value.trim() || !newRevMonthly.value) return
  await fin.addRevenueStream({
    name: newRevName.value.trim(),
    type: newRevType.value,
    monthlyAmount: newRevMonthly.value,
    probability: newRevProb.value || 0.5,
    startMonth: newRevStart.value || undefined,
  } as Partial<RevenueStream>)
  newRevName.value = ''
  newRevMonthly.value = 0
  newRevProb.value = 0.5
  newRevStart.value = ''
}

async function handleUpdateRevenue(id: string, updates: Partial<RevenueStream>) {
  await fin.updateRevenueStream(id, updates)
  // Re-fetch projections when revenue changes
  await fin.fetchAllProjections()
}

async function handleSeedRevenue() {
  await fin.seedDefaultRevenue()
}

// --- Scenario Handlers ---
async function handleSeedScenarios() {
  // Seed revenue first if needed, then scenarios
  if (fin.revenueStreams.value.length === 0) {
    await fin.seedDefaultRevenue()
  }
  await fin.seedDefaultScenarios()
  await fin.fetchAllProjections()
}

// --- Expense Handlers ---
async function handleAddExpense() {
  if (!newExpenseAmount.value) return
  await fin.addExpense({
    amount: newExpenseAmount.value,
    category: newExpenseCategory.value,
    classification: newExpenseClassification.value,
    description: newExpenseDesc.value,
    vendor: newExpenseVendor.value,
    rewardCard: newExpenseCard.value,
  })
  newExpenseAmount.value = 0
  newExpenseDesc.value = ''
  newExpenseVendor.value = ''
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return dateStr
  }
}

// --- Styles ---
const OPS_GREEN = '#4a6741'
const OPS_GOLD = '#c4a747'
const OPS_NAVY = '#1a2a3a'

const appStyles = computed(() => ({ minHeight: '100vh', padding: '0', margin: '0', position: 'relative' as const, zIndex: '2' }))

const headerStyles = computed(() => ({
  display: 'flex', alignItems: 'center', gap: 'var(--space-md)',
  padding: 'var(--space-md) var(--space-lg)',
  background: `linear-gradient(135deg, ${OPS_NAVY}, ${OPS_NAVY}dd)`,
  borderBottom: `4px solid ${OPS_GREEN}`,
  position: 'sticky' as const, top: '0', zIndex: '50', backdropFilter: 'blur(8px)',
}))

const titleStyles = computed(() => ({ fontSize: '1.1rem', fontWeight: '700', color: OPS_GOLD, margin: '0', letterSpacing: '1px' }))
const subtitleStyles = computed(() => ({ fontSize: '0.6rem', color: 'rgba(196, 167, 71, 0.6)', marginTop: '0.15rem' }))
const logoStyles = computed(() => ({ width: '28px', height: '28px', borderRadius: '50%' }))

const tabBarStyles = computed(() => ({
  display: 'flex', gap: '0.25rem', padding: '0.5rem var(--space-lg)',
  background: `${OPS_NAVY}ee`, borderBottom: `2px solid ${OPS_GREEN}66`,
  overflowX: 'auto' as const, backdropFilter: 'blur(8px)',
}))
const tabButtonStyles = computed(() => ({ fontSize: '0.6rem', padding: '0.35rem 0.7rem', whiteSpace: 'nowrap' as const, display: 'flex', alignItems: 'center', gap: '0.3rem' }))
const badgeStyles = computed(() => ({ fontSize: '0.55rem', background: OPS_GREEN, color: '#fff', padding: '0.1rem 0.3rem', borderRadius: '8px', fontWeight: '700' }))

const mainStyles = computed(() => ({ padding: 'var(--space-lg)', maxWidth: '900px', margin: '0 auto' }))

const errorStyles = computed(() => ({
  background: 'rgba(239, 68, 68, 0.15)', border: '2px solid rgba(239, 68, 68, 0.5)',
  borderRadius: '4px', padding: '0.5rem 0.75rem', marginBottom: '1rem', color: '#ff6b6b',
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem',
}))

const emptyStyles = computed(() => ({ textAlign: 'center' as const, padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }))
const emptyInlineStyles = { fontSize: '0.7rem', color: 'var(--text-muted)', margin: '0 0 0.5rem 0' }

// --- Card Styles ---
const cardStyles = computed(() => ({
  background: `${OPS_NAVY}cc`, border: `2px solid ${OPS_GREEN}55`,
  borderRadius: '4px', padding: '0.75rem', marginBottom: '0.75rem', backdropFilter: 'blur(4px)',
}))
const cardTitleStyles = computed(() => ({
  fontSize: '0.75rem', color: OPS_GOLD, margin: '0 0 0.5rem 0',
  fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase' as const,
}))

// --- Progress Bar ---
const progressContainerStyles = computed(() => ({ display: 'flex', alignItems: 'center', gap: '0.75rem' }))
const progressBarStyles = computed(() => ({
  flex: '1', height: '12px', background: OPS_NAVY,
  border: `2px solid ${OPS_GREEN}44`, borderRadius: '2px', overflow: 'hidden',
}))
const progressFillStyles = (pct: number, color?: string) => ({
  height: '100%', width: `${Math.min(100, Math.max(0, pct))}%`,
  background: pct >= 100 ? '#22c55e' : `linear-gradient(90deg, ${color || OPS_GREEN}, ${color || OPS_GREEN}cc)`,
  transition: 'width 0.3s ease',
})
const progressTextStyles = computed(() => ({ fontSize: '0.7rem', color: OPS_GOLD, whiteSpace: 'nowrap' as const }))

// --- HQ gate list ---
function gateListItem(gate: DecisionGate) {
  return {
    display: 'flex', alignItems: 'center', gap: '0.4rem',
    padding: '0.25rem 0',
    borderBottom: `1px solid ${OPS_GREEN}15`,
    opacity: gate.status === 'completed' ? '0.6' : '1',
  }
}
function gateStatusIcon(_gate: DecisionGate) {
  return { fontSize: '0.7rem' }
}
const gateListLabel = { flex: '1', fontSize: '0.7rem', color: 'var(--text-bright)' }
function gateListStatus(gate: DecisionGate) {
  const color = gate.status === 'completed' ? '#22c55e'
    : gate.status === 'in-progress' ? '#f59e0b'
    : gate.status === 'blocked' ? '#ef4444'
    : 'var(--text-muted)'
  return { fontSize: '0.5rem', color, fontWeight: '600', textTransform: 'uppercase' as const }
}

// --- HQ task summary styles ---
const quickTaskStyles = computed(() => ({ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0', borderBottom: `1px solid ${OPS_GREEN}22` }))
const quickTaskNameStyles = computed(() => ({ flex: '1', fontSize: '0.75rem', color: 'var(--text-bright)' }))
const priorityBadgeStyles = (priority: number) => ({
  fontSize: '0.55rem', padding: '0.1rem 0.3rem', borderRadius: '2px', fontWeight: '700',
  background: priority <= 1 ? '#ef4444' : priority <= 3 ? '#f59e0b' : '#6b7280', color: '#fff',
})
const dueDateStyles = computed(() => ({ fontSize: '0.6rem', color: 'var(--text-muted)' }))

// --- HQ events ---
const eventItemStyles = computed(() => ({ display: 'flex', gap: '0.75rem', padding: '0.35rem 0', borderBottom: `1px solid ${OPS_GREEN}22`, alignItems: 'baseline' }))
const eventDateStyles = computed(() => ({ fontSize: '0.65rem', color: OPS_GOLD, minWidth: '3.5rem' }))
const eventTitleStyles = computed(() => ({ fontSize: '0.75rem', color: 'var(--text-bright)' }))

// --- HQ goals summary ---
const goalSummaryStyles = computed(() => ({ marginBottom: '0.5rem' }))
const goalLabelStyles = computed(() => ({ fontSize: '0.7rem', color: 'var(--text-bright)', marginBottom: '0.2rem', display: 'block' }))
const goalValueStyles = computed(() => ({ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '0.15rem', display: 'block' }))

// --- Ops tab filters ---
const filterBarStyles = computed(() => ({ display: 'flex', gap: '0.25rem', marginBottom: '0.5rem', flexWrap: 'wrap' as const }))
const filterBtnStyles = computed(() => ({ fontSize: '0.55rem', padding: '0.2rem 0.5rem' }))

// --- Supply tab ---
const inputStyles = computed(() => ({
  flex: '1', minWidth: '150px', fontSize: '0.75rem', padding: '0.4rem',
  background: OPS_NAVY, color: 'var(--text-bright)', border: `2px solid ${OPS_GREEN}66`,
}))
const smallInputStyles = computed(() => ({
  width: '90px', fontSize: '0.75rem', padding: '0.4rem',
  background: OPS_NAVY, color: 'var(--text-bright)', border: `2px solid ${OPS_GREEN}66`,
}))
const selectInputStyles = computed(() => ({
  fontSize: '0.65rem', padding: '0.3rem',
  background: OPS_NAVY, color: 'var(--text-bright)', border: `2px solid ${OPS_GREEN}66`,
  width: 'auto',
}))
const actionBtnStyles = computed(() => ({ fontSize: '0.65rem', padding: '0.35rem 0.7rem', whiteSpace: 'nowrap' as const }))
const addGoalFormStyles = computed(() => ({ display: 'flex', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap' as const, alignItems: 'center' }))
const goalsGridStyles = computed(() => ({ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }))
const goalEditStyles = computed(() => ({
  display: 'flex', alignItems: 'center', gap: '0.4rem',
  marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: `1px solid ${OPS_GREEN}33`,
}))
const goalEditLabelStyles = computed(() => ({ fontSize: '0.6rem', color: 'var(--text-muted)' }))

// --- Expense styles ---
const expenseFormStyles = computed(() => ({
  display: 'flex', gap: '0.3rem', flexWrap: 'wrap' as const, alignItems: 'center',
}))
const expenseSummaryRow = computed(() => ({
  display: 'flex', gap: '1rem', marginBottom: '0.5rem', flexWrap: 'wrap' as const,
}))
const expenseStat = { textAlign: 'center' as const }
const expenseStatLabel = { fontSize: '0.55rem', color: 'var(--text-muted)', display: 'block' }
const expenseStatValue = { fontSize: '1rem', fontWeight: '700', color: 'var(--text-bright)', display: 'block' }
const expenseStatValueBiz = { fontSize: '1rem', fontWeight: '700', color: '#22c55e', display: 'block' }
const expenseStatValuePersonal = { fontSize: '1rem', fontWeight: '700', color: '#3a7bd5', display: 'block' }
const expenseRowStyles = computed(() => ({
  display: 'flex', alignItems: 'center', gap: '0.5rem',
  padding: '0.25rem 0', borderBottom: `1px solid ${OPS_GREEN}15`,
  fontSize: '0.65rem',
}))
const expenseDateCol = { color: 'var(--text-muted)', minWidth: '4.5rem', fontFamily: 'monospace', fontSize: '0.55rem' }
const expenseDescCol = { flex: '1', color: 'var(--text-bright)', fontSize: '0.65rem' }
const expenseAmountCol = { fontWeight: '700', color: 'var(--text-bright)', fontSize: '0.7rem' }
function expenseClassBadge(classification: string) {
  const colors: Record<string, string> = { business: '#22c55e', personal: '#3a7bd5', mixed: '#f59e0b' }
  return {
    fontSize: '0.4rem', padding: '0.1rem 0.2rem', borderRadius: '2px', fontWeight: '700',
    background: (colors[classification] || '#6b7280') + '33',
    color: colors[classification] || '#6b7280',
  }
}
const rewardAmtStyle = { fontWeight: '700', color: '#22c55e', fontSize: '0.65rem' }

// --- Scenario styles ---
const scenarioItemStyles = computed(() => ({
  display: 'flex', alignItems: 'center', gap: '0.4rem',
  padding: '0.35rem 0', borderBottom: `1px solid ${OPS_GREEN}15`,
}))
function scenarioDotStyle(color?: string) {
  return { width: '8px', height: '8px', borderRadius: '50%', background: color || OPS_GREEN, flexShrink: '0' }
}
const scenarioNameStyle = { fontSize: '0.7rem', fontWeight: '600', color: OPS_GOLD, display: 'block' }
const scenarioDescStyle = { fontSize: '0.55rem', color: 'var(--text-muted)', display: 'block' }
const scenarioMetaStyle = { fontSize: '0.5rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' as const }

// --- Revenue styles ---
function revenueCardStyles(stream: RevenueStream) {
  return {
    background: `${OPS_NAVY}88`, border: `1px solid ${stream.color || OPS_GREEN}44`,
    borderRadius: '3px', padding: '0.5rem', marginBottom: '0.4rem',
  }
}
const revenueHeader = { display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.2rem' }
function revenueDot(color?: string) {
  return { width: '8px', height: '8px', borderRadius: '50%', background: color || OPS_GREEN, flexShrink: '0' }
}
const revenueName = { fontSize: '0.7rem', fontWeight: '600', color: OPS_GOLD, flex: '1' }
const revenueType = { fontSize: '0.45rem', padding: '0.1rem 0.25rem', borderRadius: '2px', background: `${OPS_GREEN}33`, color: 'var(--text-muted)' }
function revenueProbability(prob: number) {
  const color = prob >= 0.7 ? '#22c55e' : prob >= 0.4 ? '#f59e0b' : '#ef4444'
  return { fontSize: '0.5rem', fontWeight: '700', color }
}
const revenueDetails = { display: 'flex', gap: '0.5rem', alignItems: 'baseline', marginBottom: '0.2rem' }
const revenueAmount = { fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-bright)' }
const revenueMetaStyle = { fontSize: '0.5rem', color: 'var(--text-muted)' }
const revenueNotes = { fontSize: '0.5rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '0.15rem' }
const revenueEditRow = {
  display: 'flex', gap: '0.3rem', alignItems: 'center', marginTop: '0.3rem',
  paddingTop: '0.3rem', borderTop: `1px solid ${OPS_GREEN}22`,
}
const revenueEditLabel = { fontSize: '0.5rem', color: 'var(--text-muted)' }
const tinyInputStyles = computed(() => ({
  width: '70px', fontSize: '0.65rem', padding: '0.25rem',
  background: OPS_NAVY, color: 'var(--text-bright)', border: `1px solid ${OPS_GREEN}66`,
}))
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

.tab-emoji { font-size: 0.8rem; }

@media (max-width: 640px) {
  .tab-label { display: none; }
  .tab-emoji { font-size: 1.1rem; }
}

:deep(.nes-btn) { font-family: "Press Start 2P", monospace !important; }
:deep(.nes-input), :deep(.nes-select) { font-family: "Press Start 2P", monospace !important; }
</style>
