<template>
  <div class="nyt-page" :style="{ '--nyt-headline-font': selectedHeadlineFont, '--nyt-body-font': selectedBodyFont }">
    <!-- Hand-drawn SVG filter definitions — used by all annotation components -->
    <HandDrawnFilter />

    <!-- WeatherBug -->
    <WeatherBug :weather="weather" :icon="weatherIcon" :description="weatherDescription" />

    <!-- Font Picker (v0.5 — remove later) -->
    <div class="nyt-font-picker" v-if="showFontPicker">
      <div class="nyt-font-picker-inner">
        <h3 class="nyt-font-picker-title">FONT SPECIMENS — PICK ONE</h3>
        <div class="nyt-font-picker-grid">
          <div v-for="font in headlineFonts" :key="font.name"
            class="nyt-font-option"
            :class="{ 'nyt-font-option--active': selectedHeadlineFont === font.value }"
            @click="selectedHeadlineFont = font.value"
          >
            <span class="nyt-font-sample" :style="{ fontFamily: font.value }">The Wetzel-Arney News</span>
            <span class="nyt-font-name">{{ font.name }}</span>
          </div>
        </div>
        <p class="nyt-font-picker-note">Body: {{ selectedBodyFont }}</p>
        <button @click="showFontPicker = false" class="nyt-font-close">&times; close</button>
      </div>
    </div>
    <button v-else class="nyt-font-toggle" @click="showFontPicker = true">fonts</button>

    <!-- Masthead -->
    <header class="nyt-masthead">
      <div class="nyt-masthead-inner">
        <div class="nyt-masthead-left">
          <span class="nyt-meta">{{ formattedDate }}</span>
        </div>
        <div class="nyt-masthead-center">
          <h1 class="nyt-title">{{ newspaperName }}</h1>
          <p class="nyt-motto">"Vertically Integrated Since 1929"</p>
        </div>
        <div class="nyt-masthead-right">
          <span class="nyt-meta" v-if="habitSummaryText">
            {{ habitSummaryText }} · {{ weeklyHabitRate }}% week
          </span>
          <span class="nyt-meta" v-else>Indianapolis Edition</span>
        </div>
      </div>
      <!-- Staff Box -->
      <div class="nyt-staff">
        <span v-for="(member, i) in staff" :key="member.name" class="nyt-staff-member">
          <span class="nyt-staff-title">{{ member.title }}</span> {{ member.name }}
          <span v-if="i < staff.length - 1" class="nyt-staff-sep">·</span>
        </span>
      </div>
      <div class="nyt-rule-double"></div>
    </header>

    <!-- Breaking News Banner -->
    <div class="nyt-breaking">
      <span class="nyt-breaking-label">BREAKING</span>
      <span class="nyt-breaking-text"><HighlightMark :rotation="-0.3">{{ breakingNews }}</HighlightMark></span>
      <button class="nyt-breaking-refresh" @click="rotateBreaking">&circlearrowright;</button>
    </div>

    <div class="nyt-content">
      <!-- Navigation to other pages -->
      <nav class="nyt-nav">
        <router-link to="/nanit" class="nyt-nav-link">Baby Cam</router-link>
        <span class="nyt-nav-sep">&middot;</span>
        <router-link to="/retro" class="nyt-nav-link">Dashboard</router-link>
        <span class="nyt-nav-sep">&middot;</span>
        <router-link to="/ops" class="nyt-nav-link">Ops</router-link>
        <span class="nyt-nav-sep">&middot;</span>
        <router-link to="/weather" class="nyt-nav-link">Weather</router-link>
        <span class="nyt-nav-sep">&middot;</span>
        <router-link to="/health" class="nyt-nav-link">Health</router-link>
        <span class="nyt-nav-sep">&middot;</span>
        <router-link to="/ellabot" class="nyt-nav-link">Ellabot</router-link>
      </nav>
      <div class="nyt-rule"></div>

      <!-- Oliver's Almanac -->
      <section class="nyt-almanac" v-if="oliverQuote?.quote">
        <h2 class="nyt-section-header">OLIVER'S ALMANAC</h2>
        <blockquote class="nyt-almanac-quote">
          "{{ oliverQuote.quote }}"
        </blockquote>
        <p class="nyt-almanac-attr">— Oliver, {{ oliverQuote.date }}</p>
        <div class="nyt-rule"></div>
      </section>

      <!-- House Birthday -->
      <section class="nyt-house-birthday">
        <div class="nyt-house-inner">
          <h2 class="nyt-section-header" style="color: #666;">THE LITTLE CASTLE IN BETWEEN</h2>
          <div class="nyt-house-age">
            <span class="nyt-house-years">{{ houseAge }}</span>
            <span class="nyt-house-label">years old</span>
          </div>
          <p class="nyt-house-date">
            Est. c. October 29, 1929
            <span class="nyt-house-note">— the day the market crashed</span>
          </p>
          <p class="nyt-house-next">
            <HighlightMark :active="daysUntilHouseBirthday <= 14" :rotation="0.5">
              {{ daysUntilHouseBirthday }} days until birthday #{{ houseAge + 1 }}
            </HighlightMark>
          </p>
        </div>
      </section>

      <!-- Baby Countdown -->
      <section class="nyt-countdown-section">
        <h2 class="nyt-section-header">BABY SISTER WATCH</h2>
        <div class="nyt-countdown">
          <div class="nyt-countdown-number">
            <CircleMark :active="daysRemaining <= 7" :rotation="-3" :thickness="3">{{ daysRemaining }}</CircleMark>
          </div>
          <div class="nyt-countdown-label">days until due date</div>
          <div class="nyt-countdown-date">March 19, 2026</div>
        </div>
        <div class="nyt-balloon-grid">
          <span v-for="day in totalDays" :key="day" class="nyt-balloon"
            :class="{ 'nyt-balloon--popped': day <= daysPassed }">{{ day <= daysPassed ? '·' : '•' }}</span>
        </div>
        <!-- Baby Bulletin — escalating urgency -->
        <article class="nyt-baby-bulletin">
          <h3 class="nyt-bulletin-hed">{{ babyBulletin.headline }}</h3>
          <p class="nyt-bulletin-text">{{ babyBulletin.text }}</p>
          <p class="nyt-bulletin-attr">— Family Affairs Correspondent</p>
        </article>
        <div class="nyt-rule"></div>
      </section>

      <!-- Main Grid -->
      <div class="nyt-grid">
        <!-- Lead Story -->
        <article class="nyt-lead">
          <h2 class="nyt-headline-lead">{{ leadStory.headline }}</h2>
          <p class="nyt-byline">By {{ leadStory.byline }} <span class="nyt-ts">{{ leadStory.time }}</span></p>
          <p class="nyt-body" v-for="(p, i) in leadStory.body" :key="i">{{ p }}</p>
        </article>

        <!-- Sidebar -->
        <aside class="nyt-sidebar">
          <div v-for="(story, i) in sidebarStories" :key="i" class="nyt-sidebar-story">
            <h3 class="nyt-headline-side">{{ story.headline }}</h3>
            <p class="nyt-byline-small">{{ story.byline }}</p>
            <p class="nyt-summary">{{ story.summary }}</p>
            <div class="nyt-rule-light" v-if="i < sidebarStories.length - 1"></div>
          </div>
        </aside>
      </div>

      <!-- Active Tasks -->
      <section class="nyt-tasks" v-if="topTasks.length > 0">
        <div class="nyt-rule"></div>
        <h2 class="nyt-section-header">THE TASK BOARD</h2>
        <div class="nyt-tasks-list">
          <div v-for="task in topTasks" :key="task.uid" class="nyt-task-item">
            <span class="nyt-task-priority" v-if="task.priority && task.priority <= 3">!</span>
            <span class="nyt-task-text">{{ task.summary }}</span>
            <span class="nyt-task-due" v-if="task.due">{{ task.due.slice(0, 10) }}</span>
          </div>
        </div>
      </section>

      <!-- This Day In History -->
      <section class="nyt-history">
        <div class="nyt-rule"></div>
        <h2 class="nyt-section-header">THIS DAY IN HISTORY</h2>
        <p class="nyt-section-sub">Labor · Abolition · Feminism · Presidents</p>
        <div class="nyt-history-entries" v-if="todayInHistory.length > 0">
          <div v-for="entry in todayInHistory" :key="entry.year" class="nyt-history-entry">
            <span class="nyt-history-year">{{ entry.year }}</span>
            <span class="nyt-history-cat">{{ entry.category }}</span>
            <p class="nyt-history-text">{{ entry.event }}</p>
          </div>
        </div>
        <p v-else class="nyt-history-none">No entries for today yet — the archive grows.</p>
      </section>

      <!-- The Morning Paper — media links -->
      <section class="nyt-morning-paper">
        <div class="nyt-rule"></div>
        <h2 class="nyt-section-header">THE MORNING PAPER</h2>
        <p class="nyt-section-sub">Start the day right.</p>
        <div class="nyt-media-links">
          <a v-for="link in mediaLinks" :key="link.name" :href="link.url" target="_blank" rel="noopener" class="nyt-media-link">
            <span class="nyt-media-name">{{ link.name }}</span>
            <span class="nyt-media-desc">{{ link.description }}</span>
          </a>
        </div>
      </section>

      <!-- Notes to Alissa -->
      <section class="nyt-notes">
        <div class="nyt-rule"></div>
        <div class="nyt-notes-header">
          <h2 class="nyt-section-header">THINGS I FORGOT TO TELL YOU</h2>
          <MarginNote text="read these when you get a sec" position="right" :rotate="-2" />
        </div>
        <p class="nyt-section-sub">A running list of things Darren wanted to mention, got distracted, and is now recording here as proof of effort.</p>
        <div class="nyt-notes-list">
          <div v-for="(note, idx) in notesForAlissa" :key="note.date" class="nyt-note">
            <span class="nyt-note-date">{{ note.date }}</span>
            <HighlightMark :active="isRecentNote(idx)" :rotation="idx % 2 === 0 ? 0.3 : -0.2">
              <p class="nyt-note-text">{{ note.text }}</p>
            </HighlightMark>
          </div>
        </div>
      </section>

      <!-- Home Office Updates -->
      <section class="nyt-updates">
        <div class="nyt-rule"></div>
        <h2 class="nyt-section-header">FROM THE HOME OFFICE</h2>
        <div class="nyt-updates-grid">
          <div v-for="(u, i) in projectUpdates" :key="i" class="nyt-update">
            <h4 class="nyt-headline-small">{{ u.headline }}</h4>
            <p class="nyt-update-body">{{ u.body }}</p>
            <p class="nyt-update-meta">{{ u.section }} · {{ u.date }}</p>
          </div>
        </div>
      </section>

      <!-- Comics -->
      <section class="nyt-comics">
        <div class="nyt-rule"></div>
        <h2 class="nyt-section-header">THE FUNNIES</h2>
        <p class="nyt-section-sub">Amp &amp; Pavlov will appear here once they exist. For now, imagine two poorly-drawn Eastern Bloc cartoon characters staring at you.</p>
      </section>
    </div>

    <!-- Footer -->
    <footer class="nyt-footer">
      <div class="nyt-rule-double"></div>
      <p class="nyt-footer-text">
        © {{ new Date().getFullYear() }} Little Castle in Between, Indianapolis
        · Name pending Oliver's approval
        · Est. February 2026
      </p>
    </footer>
  </div>
</template>

<!--
  ┌─────────────────────────────────────────────────────────────────┐
  │ STYLE GUIDE — THE WETZEL-ARNEY NEWS                            │
  │                                                                 │
  │ Voice: Jack Donaghy. Dead-serious corporate newspaper.          │
  │                                                                 │
  │ 1. Treat the household like a Fortune 500 company.              │
  │    Family = stakeholders. Dinner = evening ops review.          │
  │    Oliver = department head (title pending).                    │
  │                                                                 │
  │ 2. Corporate jargon delivered completely straight-faced.        │
  │    Jack Donaghy does not know he is funny.                      │
  │                                                                 │
  │ 3. Escalate seriousness. Toddler refusing carrots = supply     │
  │    chain disruption. Baby arrival = major product launch.       │
  │                                                                 │
  │ 4. Indianapolis heritage is real, not mocked. The house,        │
  │    Meridian-Kessler, Society of Indiana Pioneers, Alissa's     │
  │    work — genuine. Mock the FRAME (corporate/newspaper),        │
  │    not the SUBJECT.                                             │
  │                                                                 │
  │ 5. Annotations are personal, not institutional. Terse margin    │
  │    notes in Darren's voice: "check this", "ask Alissa",        │
  │    "still open".                                                │
  │                                                                 │
  │ 6. Financial data privacy rules still apply per global          │
  │    CLAUDE.md. Never surface private financial data here.        │
  │                                                                 │
  │ Motto: "Vertically Integrated Since 1929"                       │
  │ — "Vertically integrated" = peak Donaghy buzzword applied       │
  │   to a house that literally has two floors.                     │
  │ — "Since 1929" = real. The house was built that year.           │
  │   (Oct 29, Black Tuesday.)                                      │
  └─────────────────────────────────────────────────────────────────┘
-->

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useFamilyReport } from '@/composables/useFamilyReport'
import WeatherBug from '@/components/dashboard/WeatherBug.vue'
import HandDrawnFilter from '@/components/annotations/HandDrawnFilter.vue'
import HighlightMark from '@/components/annotations/HighlightMark.vue'
import CircleMark from '@/components/annotations/CircleMark.vue'
import MarginNote from '@/components/annotations/MarginNote.vue'

// --- Live data ---
const {
  weather, oliverQuote, topTasks,
  weatherDescription, weatherIcon, habitSummaryText, weeklyHabitRate,
  init, startWeatherRefresh, stopWeatherRefresh,
} = useFamilyReport()

onMounted(async () => {
  await init()
  startWeatherRefresh()
})

onUnmounted(() => {
  stopWeatherRefresh()
})

// Font picker
const showFontPicker = ref(false)
const selectedHeadlineFont = ref("'Playfair Display', Georgia, serif")
const selectedBodyFont = ref("'Libre Franklin', 'Open Sans', Arial, sans-serif")

const headlineFonts = [
  { name: 'Playfair Display', value: "'Playfair Display', Georgia, serif" },
  { name: 'Georgia (Classic)', value: "Georgia, 'Times New Roman', serif" },
  { name: 'Lora', value: "'Lora', Georgia, serif" },
  { name: 'Source Serif 4', value: "'Source Serif 4', Georgia, serif" },
  { name: 'Libre Baskerville', value: "'Libre Baskerville', Georgia, serif" },
  { name: 'Merriweather', value: "'Merriweather', Georgia, serif" },
  { name: 'DM Serif Display', value: "'DM Serif Display', Georgia, serif" },
  { name: 'Cormorant Garamond', value: "'Cormorant Garamond', Georgia, serif" },
]

const newspaperName = 'The Wetzel-Arney News' // Placeholder until Oliver names it

const staff = [
  { title: 'Mommy', name: 'Alissa' },
  { title: 'Daddy', name: 'Darren' },
  { title: 'TBD', name: 'Oliver' },  // Oliver picks his own title
  { title: 'Incoming', name: 'Baby Sister' },  // She doesn't work here yet
]

const formattedDate = computed(() =>
  new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
)

// House birthday — built c. October 29, 1929 (day of Black Tuesday)
const houseBirthDate = new Date('1929-10-29')
const houseAge = computed(() => {
  const now = new Date()
  let age = now.getFullYear() - 1929
  if (now.getMonth() < 9 || (now.getMonth() === 9 && now.getDate() < 29)) age--
  return age
})
const daysUntilHouseBirthday = computed(() => {
  const now = new Date()
  let next = new Date(now.getFullYear(), 9, 29) // October 29
  if (next.getTime() <= now.getTime()) next = new Date(now.getFullYear() + 1, 9, 29)
  return Math.ceil((next.getTime() - now.getTime()) / 86400000)
})

// Baby countdown
const dueDate = new Date('2026-03-19')
const startDate = new Date('2026-02-24')
const totalDays = Math.ceil((dueDate.getTime() - startDate.getTime()) / 86400000)
const daysRemaining = computed(() => Math.max(0, Math.ceil((dueDate.getTime() - Date.now()) / 86400000)))
const daysPassed = computed(() => totalDays - daysRemaining.value)

// Baby bulletin — escalates as due date approaches
const babyBulletin = computed(() => {
  const d = daysRemaining.value
  if (d > 20) return {
    headline: 'BULLETIN',
    text: `Sources confirm Baby Sister is expected in ${d} days. The household reports it is "ready," though this claim has not been independently verified. Father seen measuring crib slats with a tape measure for the third time.`,
  }
  if (d > 14) return {
    headline: 'BULLETIN — SITUATION DEVELOPING',
    text: `With ${d} days remaining, preparations have entered what officials describe as "the serious phase." The nursery is complete. The hospital bag is packed. Father has been observed pacing the hallway and muttering about car seat installation angles.`,
  }
  if (d > 7) return {
    headline: 'EXTRA! EXTRA!',
    text: `BABY SISTER IN ${d} DAYS. Hospital bag packed. Car seat installed. Father has checked both three times. Mother remains calm. Oliver has been briefed. This is not a drill.`,
  }
  if (d > 3) return {
    headline: 'SPECIAL EDITION — ALL HANDS ON DECK',
    text: `${d} DAYS. Sources say the household is in a state of "controlled pandemonium." Father reportedly "fine" but was seen googling "how to swaddle" at 3 AM. The dog knows something is up.`,
  }
  if (d > 0) return {
    headline: '!!! IMMINENT !!!',
    text: `${d} DAY${d === 1 ? '' : 'S'}. THIS IS NOT A TEST. Father has refreshed the hospital website four times since you started reading this. Mother says "stop refreshing the hospital website."`,
  }
  return {
    headline: 'SHE IS HERE',
    text: 'Baby Sister has arrived. All previous headlines are now irrelevant. Every word written before this moment was just killing time.',
  }
})

// Breaking news
const breakingHeadlines = [
  'Local Rick Moranis Dad-Alike Wins Contest; Positions Wealthy Californian for Venture Funding',
  "Man Names Company, Newspaper, Two Mascots, and Five Tool Candidates; Still Cannot Name Daughter",
  "Area Dad Reports 'Can't Stop Won't Stop' Momentum at 2 AM; Sleep Experts Disagree",
  'Loving Husband Stayed Up Way Too Late Again "Working On The Computer"',
  "Local Man Names Company After Grandmother, Claims It's \"Not A Tax Thing\"",
  'Indianapolis Engineer Builds Entire Company While Watching Podcasts',
  'Area Dad Solves Zero Problems At Actual Job, Ships 14 Logo Concepts Instead',
  "Oliver Reportedly \"Fine\" With All Of This",
  'Woman Married To Man Who Talks To Computer All Night Somehow Still In Love With Him',
  "Breaking: Local Attorney's Name Misspelled By Encyclopedia Website; Husband \"Considering\" Email",
  'Man Who Cannot Design Anything Ships Brand Identity Page, Calls It "Shitting Gold"',
  "Smith-Corona, Est. 1926 — Three Years Before This House Was Built; 'Coronado, Here We Come'",
  "Sources: Man Will 'Hold the Job Till the Job Doesn't Need Him'; HR Reportedly Unaware",
  "Andrea Requests Baby Viewing; Christmas Card List Status 'Under Review'",
  'Evil Swedes Kill Greg Again; Local Engineer Vows Revenge Via Ethical AI Startup',
  "Man Says 'OK This Is Actually The Last Thing' For Eighth Time Tonight; Sources Skeptical",
  'Local Dad Drafts Business Plan, Brand Identity, and Newspaper Before Going to Bed; Baby Due in 22 Days',
  "Storybook Ending: Engineer Completes Entire Business Groundwork Night Before Going on Paternity Leave; Wife Asleep",
]
const breakingIndex = ref(Math.floor(Math.random() * breakingHeadlines.length))
const breakingNews = computed(() => breakingHeadlines[breakingIndex.value])
function rotateBreaking() {
  breakingIndex.value = (breakingIndex.value + 1) % breakingHeadlines.length
}

const leadStory = {
  headline: 'Husband Reports "Too Much Momentum" To Stop; Wife Reportedly Asleep',
  byline: 'Staff Correspondent',
  time: '1:44 AM EST',
  body: [
    'INDIANAPOLIS — In what sources close to the situation describe as "a really productive night," a local software engineer continued building things well past any reasonable hour, citing an inability to stop having good ideas.',
    'The engineer, who asked that his name be withheld because his wife can definitely hear the keyboard from the bedroom, has reportedly shipped a brand identity page, generated 14 logo concepts using AI running on hardware in his own house, and documented an elaborate plan to name a company after his grandmother.',
    '"I\'ll go to bed after this next thing," the man said, for the fourth time since midnight.',
    'His wife, an attorney and published author whose name is consistently misspelled by the internet, was unavailable for comment, presumably because she was sleeping like a normal person.',
  ],
}

const sidebarStories = [
  {
    headline: "Encyclopedia Website Misspells Local Attorney's Name In URL",
    byline: 'Corrections Desk',
    summary: 'The Encyclopedia of Indianapolis entry for Meridian-Kessler, authored by Alissa Wetzel, correctly spells her name on the page itself — but the URL reads "/authors/alyssa-wetzel/". The author\'s husband has been asked whether he should reach out to the editors. He is reportedly "considering it."',
  },
  {
    headline: 'Society of Indiana Pioneers Gains New Generation',
    byline: 'Heritage Desk',
    summary: "Both Oliver and his forthcoming sister will be members of the Society of Indiana Pioneers, continuing a lineage their father does not qualify for. \"I married into this,\" he confirmed.",
  },
  {
    headline: 'Smith-Corona Electra XT Still Does Not Work',
    byline: 'Technology Desk',
    summary: "Despite multiple attempts at tapping the keys, the vintage typewriter belonging to Lorna continues to not function. Its owner reports he does not care. \"It's hers and that's enough,\" he said.",
  },
  {
    headline: 'House Built Day of Stock Market Crash Turns 96',
    byline: 'Real Estate & History Desk',
    summary: "The Little Castle in Between, est. c. October 29, 1929 — the same day as Black Tuesday — will celebrate its 97th birthday this fall. The home has survived the Great Depression, a World War, and a man who stays up until 2 AM building websites in it. Indianapolis's abolitionist press once operated in these same neighborhoods: the Free Labor Advocate, the Indiana American, the Philanthropist.",
  },
  {
    headline: "Local Couple Named 'George and Amal Clooney of Meridian-Kessler'",
    byline: 'Society Desk · via The Elkhart Truth',
    summary: "In what the Elkhart Truth describes as a \"generous comparison,\" a local software engineer and his attorney wife have been likened to George and Amal Clooney. The wife — a published author, Society of Indiana Pioneers member, and actual practicing attorney — reportedly found the comparison \"flattering but unnecessary.\" The husband, who bears no resemblance whatsoever to George Clooney, was unavailable for comment. Neighbors confirm he looks more like Rick Moranis. He does not dispute this.",
  },
  {
    headline: "Rick Moranis Dad-Alike Seeks Venture Capital; Names Tom Gilman as 'Key Contact'",
    byline: 'Business Desk',
    summary: "A local software engineer who bears what neighbors describe as a \"striking\" resemblance to Rick Moranis has reportedly begun positioning himself for venture funding. The man, whose previous AI project was \"killed by the Swedes,\" says he plans to hold his current job \"till the job doesn't need him\" while building an ethical voice marketplace on the side. Smith-Corona, est. 1926. The house, est. 1929. Coronado, here we come.",
  },
  {
    headline: 'Baby Sister Naming Crisis Enters Third Week',
    byline: 'Family Affairs Desk',
    summary: "The man has named a company after his grandmother, a newspaper after two families, two cartoon mascots, and five candidates for an open-source tool — but cannot name his daughter. \"I've named so many things I care about,\" he said, \"and they are obviously one eleven-trillionth of how much I'm going to care about this kid.\" The naming committee reportedly convenes nightly at 2 AM.",
  },
]

const notesForAlissa = [
  {
    date: 'Feb 25',
    text: "The URL for your Encyclopedia of Indianapolis author page misspells your name as \"Alyssa.\" The article itself gets it right. Classic web developer move. Should I email them?",
  },
  {
    date: 'Feb 25',
    text: "Your shelf looks incredible in the photos. The typewriter, the Lincoln bust, the Federal Supplements, the whole composition. You made that look like a magazine shoot without trying. It's the centerpiece of everything I'm building here.",
  },
  {
    date: 'Feb 25',
    text: "I named a company after my grandmother tonight. The logo is a typewriter. The color palette is literally sampled from the blue of her machine sitting on your shelf. Thank you for giving her a good home up there.",
  },
  {
    date: 'Feb 25',
    text: "Are we still sending Andrea a Christmas card? She's going to want to see the baby. I'm too tired to check the list right now but we should figure that out.",
  },
  {
    date: 'Feb 25',
    text: "I have named: a company, a newspaper, two mascots, five tool name candidates, and a product brand. I have not named our daughter. The storybook ending to all previous Darrens is asking Tom Gilman for venture funding because the evil Swedes killed Greg again. Coronado, here we come. Please help me name this kid.",
  },
  {
    date: 'Feb 26',
    text: "It's after 3 AM and I have built an entire business tonight. Brand identity, logo concepts, a newspaper for you, a company named after my grandmother, investment research, and a plan for what comes next. The baby is due in three weeks. The timing of all of this is the storybook ending — getting the groundwork done right before she arrives. Ultimate peace of mind before receiving the ultimate peace of mind. I'm going to bed now. For real this time.",
  },
]

// Annotation logic — highlight the most recent notes (last 2)
function isRecentNote(idx: number): boolean {
  return idx >= notesForAlissa.length - 2
}

// This Day in History — labor, abolition, feminism, presidents
interface HistoryEntry { year: number; category: string; event: string }
const historyByDate: Record<string, HistoryEntry[]> = {
  '02-25': [
    { year: 1870, category: 'Abolition', event: 'Hiram Revels of Mississippi sworn in as first Black U.S. Senator' },
    { year: 1964, category: 'Labor', event: 'Cassius Clay defeats Sonny Liston for heavyweight title; soon takes the name Muhammad Ali' },
  ],
  '02-26': [
    { year: 1869, category: 'Abolition', event: 'Congress passes 15th Amendment — voting rights regardless of race' },
    { year: 1993, category: 'Labor', event: 'Truck bomb detonates at World Trade Center; six workers killed, over a thousand injured' },
  ],
  '02-27': [
    { year: 1951, category: 'Presidents', event: '22nd Amendment ratified — presidential term limits' },
    { year: 1973, category: 'Labor', event: 'American Indian Movement begins occupation of Wounded Knee, South Dakota' },
  ],
  '02-28': [
    { year: 1854, category: 'Abolition', event: 'Anti-slavery meeting in Ripon, Wisconsin leads to founding of the Republican Party' },
    { year: 1844, category: 'Feminism', event: 'Margaret Fuller begins "Conversations" series in Boston, pioneering feminist intellectual salons' },
  ],
  '03-01': [
    { year: 1872, category: 'Presidents', event: 'President Grant signs Yellowstone into existence as first National Park' },
    { year: 1961, category: 'Presidents', event: 'President Kennedy establishes the Peace Corps by executive order' },
  ],
  '03-03': [
    { year: 1913, category: 'Feminism', event: '5,000 women march down Pennsylvania Avenue in the Woman Suffrage Parade — the day before Wilson\'s inauguration' },
    { year: 1863, category: 'Labor', event: 'Lincoln signs the first federal conscription act; sparks national debate over class and labor' },
  ],
  '03-05': [
    { year: 1770, category: 'Labor', event: 'Boston Massacre — British soldiers fire on colonial workers, Crispus Attucks among the dead' },
    { year: 1963, category: 'Abolition', event: 'Birmingham, Alabama: mass meetings begin that lead to the Children\'s Crusade' },
  ],
  '03-07': [
    { year: 1965, category: 'Abolition', event: 'Bloody Sunday — marchers beaten by state troopers on Edmund Pettus Bridge in Selma' },
  ],
  '03-08': [
    { year: 1917, category: 'Feminism', event: 'Women workers in Petrograd strike on International Women\'s Day — sparks the February Revolution' },
    { year: 1908, category: 'Labor', event: '15,000 women march through lower Manhattan demanding shorter hours, better pay, and the vote' },
  ],
  '03-12': [
    { year: 1912, category: 'Feminism', event: 'Juliette Gordon Low founds the Girl Scouts of America in Savannah, Georgia' },
  ],
  '03-15': [
    { year: 1965, category: 'Presidents', event: 'President Johnson addresses Congress on voting rights: "We shall overcome"' },
    { year: 1820, category: 'Abolition', event: 'Maine admitted as free state under the Missouri Compromise' },
  ],
  '03-19': [
    { year: 1918, category: 'Labor', event: 'Congress passes Standard Time Act, establishing time zones and daylight saving' },
    { year: 2003, category: 'Presidents', event: 'President Bush orders invasion of Iraq — shock and awe begins' },
  ],
}

const todayKey = computed(() => {
  const now = new Date()
  return `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
})
const todayInHistory = computed(() => historyByDate[todayKey.value] || [])

// Media links — the morning paper
const mediaLinks = [
  { name: 'Means Morning News', description: 'Sam Sacks from DC. Tue–Fri.', url: 'https://means.tv/programs/mmn' },
  { name: 'Means TV', description: 'Worker-owned streaming.', url: 'https://means.tv/' },
]

const projectUpdates = [
  { headline: 'LornaCo Brand Identity Page: Live', body: 'Full visual identity with typewriter photography, color palette, typography, and logo directions.', section: 'Engineering', date: 'Feb 25' },
  { headline: '14 Logo Concepts Generated', body: 'Typewriter silhouettes, single-key marks, pixel art variants. All generated on the homelab GPU.', section: 'Design', date: 'Feb 25' },
  { headline: 'New Open-Source Tool Planned', body: 'Fork of Sprite Forge for logo and brand image generation. Name pending.', section: 'Strategy', date: 'Feb 25' },
  { headline: 'Grand Prize Goals Updated', body: 'Solar panels + battery. NYC for 5th anniversary in October.', section: 'Life Planning', date: 'Feb 25' },
]
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Playfair+Display:wght@400;700;900&family=Libre+Franklin:wght@400;600;700&family=Lora:wght@400;700&family=Source+Serif+4:wght@400;700&family=Libre+Baskerville:wght@400;700&family=Merriweather:wght@400;700&family=DM+Serif+Display&family=Cormorant+Garamond:wght@400;700&display=swap');
</style>

<style scoped>
.nyt-page {
  background: #FBF9F4;
  min-height: 100vh;
  color: #121212;
}

/* Font picker */
.nyt-font-toggle {
  position: fixed; top: 0.5rem; right: 0.5rem; z-index: 100;
  font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.1em;
  background: #121212; color: #fff; border: none; padding: 0.3rem 0.6rem;
  cursor: pointer; font-family: var(--nyt-body-font);
}
.nyt-font-picker {
  position: fixed; top: 0; right: 0; z-index: 100;
  background: #fff; border: 2px solid #121212; padding: 1rem;
  max-width: 320px; box-shadow: 0 4px 20px rgba(0,0,0,0.2);
}
.nyt-font-picker-title {
  font-family: var(--nyt-body-font); font-size: 0.65rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 0.75rem; color: #121212;
}
.nyt-font-picker-grid { display: grid; gap: 0.5rem; }
.nyt-font-option {
  padding: 0.5rem; border: 1px solid #e2e2e2; cursor: pointer; transition: all 150ms;
}
.nyt-font-option:hover { border-color: #121212; }
.nyt-font-option--active { border-color: #121212; background: #f5f5dc; }
.nyt-font-sample { font-size: 1.4rem; display: block; line-height: 1.2; }
.nyt-font-name { font-family: var(--nyt-body-font); font-size: 0.65rem; color: #999; }
.nyt-font-picker-note { font-family: var(--nyt-body-font); font-size: 0.6rem; color: #999; margin-top: 0.5rem; }
.nyt-font-close {
  position: absolute; top: 0.5rem; right: 0.5rem; background: none; border: none;
  font-size: 1.2rem; cursor: pointer; color: #999;
}

/* Masthead */
.nyt-masthead { padding: 1rem 2rem 0; max-width: 1100px; margin: 0 auto; }
.nyt-masthead-inner {
  display: flex; align-items: center; justify-content: space-between; padding-bottom: 0.5rem;
}
.nyt-masthead-left, .nyt-masthead-right {
  font-family: var(--nyt-body-font); font-size: 0.7rem; color: #666;
  min-width: 140px; text-transform: uppercase; letter-spacing: 0.05em;
}
.nyt-masthead-right { text-align: right; }
.nyt-masthead-center { text-align: center; }
.nyt-title {
  font-family: var(--nyt-headline-font); font-size: 2.75rem; font-weight: 700;
  letter-spacing: -0.02em; line-height: 1; margin: 0; color: #121212;
}
.nyt-motto { font-family: var(--nyt-headline-font); font-size: 0.7rem; font-style: italic; color: #666; margin: 0.25rem 0 0; }
.nyt-staff {
  text-align: center; padding: 0.4rem 0; font-family: var(--nyt-body-font);
  font-size: 0.65rem; color: #666; letter-spacing: 0.02em;
}
.nyt-staff-title { font-weight: 700; text-transform: uppercase; font-size: 0.55rem; letter-spacing: 0.08em; color: #999; }
.nyt-staff-sep { margin: 0 0.4rem; color: #ccc; }

/* Rules */
.nyt-rule { border: none; border-top: 1px solid #ccc; margin: 1rem 0; }
.nyt-rule-double { border: none; border-top: 3px double #121212; margin: 0.5rem 0; }
.nyt-rule-light { border: none; border-top: 1px solid #e2e2e2; margin: 0.75rem 0; }

/* Nav */
.nyt-nav {
  max-width: 1100px; margin: 0.75rem auto; padding: 0 2rem;
  text-align: center; font-family: var(--nyt-body-font); font-size: 0.8rem;
}
.nyt-nav-link { color: #121212; text-decoration: none; font-weight: 600; }
.nyt-nav-link:hover { text-decoration: underline; }
.nyt-nav-sep { color: #ccc; margin: 0 0.5rem; }

/* Breaking */
.nyt-breaking {
  background: #FFF3CD; border-bottom: 2px solid #856404;
  padding: 0.5rem 2rem; max-width: 1100px; margin: 0 auto;
  display: flex; align-items: center; gap: 0.75rem;
}
.nyt-breaking-label {
  font-family: var(--nyt-body-font); font-size: 0.6rem; font-weight: 800;
  text-transform: uppercase; letter-spacing: 0.1em; color: #856404;
  background: #FFD43B; padding: 0.15rem 0.5rem; white-space: nowrap;
}
.nyt-breaking-text { font-family: var(--nyt-headline-font); font-size: 0.9rem; font-style: italic; color: #333; flex: 1; }
.nyt-breaking-refresh { background: none; border: none; font-size: 1rem; cursor: pointer; color: #856404; }

/* Content */
.nyt-content { max-width: 1100px; margin: 0 auto; padding: 0 2rem; }

/* Section headers */
.nyt-section-header {
  font-family: var(--nyt-body-font); font-size: 0.7rem; font-weight: 800;
  text-transform: uppercase; letter-spacing: 0.12em; color: #121212; margin: 0 0 0.25rem;
}
.nyt-section-sub { font-family: var(--nyt-headline-font); font-size: 0.85rem; font-style: italic; color: #666; margin: 0 0 1rem; }

/* House Birthday */
.nyt-house-birthday {
  text-align: center; padding: 1rem 0; margin: 0.5rem 0;
  border-top: 1px solid #ccc; border-bottom: 1px solid #ccc;
  background: #f9f7f2;
}
.nyt-house-inner { max-width: 500px; margin: 0 auto; }
.nyt-house-years {
  font-family: var(--nyt-headline-font); font-size: 3rem; font-weight: 700;
  line-height: 1; color: #121212;
}
.nyt-house-label {
  font-family: var(--nyt-body-font); font-size: 0.8rem; text-transform: uppercase;
  letter-spacing: 0.1em; color: #666; margin-left: 0.5rem;
}
.nyt-house-date {
  font-family: var(--nyt-headline-font); font-size: 0.85rem; color: #666;
  font-style: italic; margin: 0.25rem 0 0;
}
.nyt-house-note { color: #999; }
.nyt-house-next {
  font-family: var(--nyt-body-font); font-size: 0.7rem; text-transform: uppercase;
  letter-spacing: 0.08em; color: #999; margin: 0.5rem 0 0;
}

/* Baby countdown */
.nyt-countdown-section { text-align: center; padding: 0.5rem 0 0; }
.nyt-countdown { margin: 1rem 0; }
.nyt-countdown-number { font-family: var(--nyt-headline-font); font-size: 4rem; font-weight: 700; line-height: 1; color: #121212; }
.nyt-countdown-label { font-family: var(--nyt-body-font); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em; color: #666; margin-top: 0.25rem; }
.nyt-countdown-date { font-family: var(--nyt-headline-font); font-size: 0.85rem; color: #999; margin-top: 0.25rem; }
.nyt-balloon-grid { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.2rem; max-width: 400px; margin: 1rem auto; font-size: 1.25rem; line-height: 1; }
.nyt-balloon { color: #2C4F5E; }
.nyt-balloon--popped { color: #ddd; }

/* Baby Bulletin */
.nyt-baby-bulletin {
  max-width: 500px; margin: 1.25rem auto 0; text-align: left;
  border: 1px solid #ccc; padding: 0.75rem 1rem; background: #fff;
}
.nyt-bulletin-hed {
  font-family: var(--nyt-body-font); font-size: 0.65rem; font-weight: 800;
  text-transform: uppercase; letter-spacing: 0.12em; color: #121212;
  margin: 0 0 0.35rem; border-bottom: 1px solid #e2e2e2; padding-bottom: 0.35rem;
}
.nyt-bulletin-text {
  font-family: var(--nyt-headline-font); font-size: 0.82rem; line-height: 1.55;
  color: #333; margin: 0;
}
.nyt-bulletin-attr {
  font-family: var(--nyt-body-font); font-size: 0.6rem; color: #999;
  font-style: italic; margin: 0.35rem 0 0; text-align: right;
}

/* Grid */
.nyt-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; margin: 1rem 0 2rem; }

/* Headlines */
.nyt-headline-lead { font-family: var(--nyt-headline-font); font-size: 2rem; font-weight: 700; line-height: 1.15; margin: 0 0 0.5rem; color: #121212; }
.nyt-headline-side { font-family: var(--nyt-headline-font); font-size: 1.1rem; font-weight: 700; line-height: 1.25; margin: 0 0 0.25rem; color: #121212; }
.nyt-headline-small { font-family: var(--nyt-headline-font); font-size: 1rem; font-weight: 700; line-height: 1.3; margin: 0 0 0.25rem; color: #121212; }

/* Text */
.nyt-byline { font-family: var(--nyt-body-font); font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.03em; color: #666; margin: 0 0 0.75rem; }
.nyt-byline-small { font-family: var(--nyt-body-font); font-size: 0.65rem; font-weight: 600; text-transform: uppercase; color: #999; margin: 0 0 0.5rem; }
.nyt-ts { font-weight: 400; text-transform: none; color: #999; }
.nyt-body { font-family: var(--nyt-headline-font); font-size: 0.95rem; line-height: 1.7; margin: 0 0 0.75rem; color: #333; }
.nyt-summary { font-family: var(--nyt-headline-font); font-size: 0.85rem; line-height: 1.6; color: #333; margin: 0; }
.nyt-meta { text-transform: uppercase; letter-spacing: 0.05em; }

/* Sidebar */
.nyt-sidebar-story { margin-bottom: 0.5rem; }

/* This Day In History */
.nyt-history { margin: 2rem 0; }
.nyt-history-entries { display: grid; gap: 1rem; }
.nyt-history-entry {
  border-left: 3px solid #856404; padding: 0.75rem 1rem; background: #FFFDF5;
}
.nyt-history-year {
  font-family: var(--nyt-headline-font); font-size: 1.5rem; font-weight: 700;
  color: #121212; margin-right: 0.5rem;
}
.nyt-history-cat {
  font-family: var(--nyt-body-font); font-size: 0.6rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.1em; color: #856404;
  background: #FFF3CD; padding: 0.1rem 0.4rem; vertical-align: middle;
}
.nyt-history-text {
  font-family: var(--nyt-headline-font); font-size: 0.9rem; line-height: 1.6;
  color: #333; margin: 0.25rem 0 0;
}
.nyt-history-none {
  font-family: var(--nyt-headline-font); font-size: 0.85rem; font-style: italic; color: #999;
}

/* The Morning Paper — media links */
.nyt-morning-paper { margin: 2rem 0; }
.nyt-media-links { display: flex; flex-wrap: wrap; gap: 1rem; }
.nyt-media-link {
  display: block; border: 2px solid #121212; padding: 0.75rem 1rem;
  text-decoration: none; color: #121212; transition: all 150ms;
  min-width: 200px; flex: 1;
}
.nyt-media-link:hover { background: #121212; color: #FBF9F4; }
.nyt-media-name {
  display: block; font-family: var(--nyt-headline-font); font-size: 1rem;
  font-weight: 700; margin-bottom: 0.25rem;
}
.nyt-media-desc {
  display: block; font-family: var(--nyt-body-font); font-size: 0.7rem;
  color: inherit; opacity: 0.7;
}

/* Notes */
.nyt-notes { margin: 2rem 0; }
.nyt-notes-header { position: relative; display: inline-block; }
.nyt-notes-list { display: grid; gap: 1rem; }
.nyt-note { border-left: 3px solid #2C4F5E; padding: 0.75rem 1rem; background: #f5f2eb; }
.nyt-note-date { font-family: var(--nyt-body-font); font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #999; }
.nyt-note-text { font-family: var(--nyt-headline-font); font-size: 0.9rem; line-height: 1.6; color: #333; margin: 0.25rem 0 0; }

/* Updates */
.nyt-updates { margin: 2rem 0; }
.nyt-updates-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
.nyt-update { border-top: 2px solid #121212; padding-top: 0.75rem; }
.nyt-update-body { font-family: var(--nyt-headline-font); font-size: 0.85rem; line-height: 1.6; color: #333; margin: 0.25rem 0; }
.nyt-update-meta { font-family: var(--nyt-body-font); font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.05em; color: #999; margin-top: 0.5rem; }

/* Comics */
.nyt-comics { margin: 2rem 0; text-align: center; padding: 2rem 0; }

/* Oliver's Almanac */
.nyt-almanac { text-align: center; padding: 1rem 0; margin: 0.5rem 0; }
.nyt-almanac-quote {
  font-family: var(--nyt-headline-font); font-size: 1.1rem; font-style: italic;
  line-height: 1.6; color: #333; margin: 0.75rem auto; max-width: 500px;
  border-left: 3px solid #2C4F5E; padding-left: 1rem; text-align: left;
}
.nyt-almanac-attr {
  font-family: var(--nyt-body-font); font-size: 0.65rem; color: #999; font-style: italic;
}

/* Task Board */
.nyt-tasks { margin: 1.5rem 0; }
.nyt-tasks-list { display: grid; gap: 0.5rem; }
.nyt-task-item {
  display: flex; align-items: baseline; gap: 0.5rem;
  padding: 0.4rem 0; border-bottom: 1px solid #e2e2e2;
  font-family: var(--nyt-body-font); font-size: 0.8rem;
}
.nyt-task-priority { color: #856404; font-weight: 800; font-size: 0.7rem; }
.nyt-task-text { flex: 1; color: #333; }
.nyt-task-due { font-size: 0.65rem; color: #999; white-space: nowrap; }

/* Footer */
.nyt-footer { max-width: 1100px; margin: 2rem auto 0; padding: 0 2rem 2rem; }
.nyt-footer-text { font-family: var(--nyt-body-font); font-size: 0.7rem; color: #999; text-align: center; margin-top: 0.75rem; }

/* === RESPONSIVE === */

/* Small phones */
@media (max-width: 600px) {
  .nyt-masthead { padding: 0.75rem 1rem 0; }
  .nyt-masthead-inner { flex-direction: column; gap: 0.25rem; }
  .nyt-masthead-left, .nyt-masthead-right { text-align: center; min-width: auto; }
  .nyt-title { font-size: 1.6rem; }
  .nyt-motto { font-size: 0.6rem; }
  .nyt-staff { font-size: 0.55rem; }

  .nyt-content { padding: 0 1rem; }
  .nyt-breaking { padding: 0.4rem 1rem; flex-wrap: wrap; }
  .nyt-breaking-text { font-size: 0.8rem; }

  .nyt-nav { font-size: 0.7rem; padding: 0 1rem; }
  .nyt-nav-sep { margin: 0 0.3rem; }

  .nyt-house-years { font-size: 2rem; }
  .nyt-countdown-number { font-size: 2.5rem; }
  .nyt-balloon-grid { max-width: 280px; font-size: 1rem; gap: 0.15rem; }

  .nyt-headline-lead { font-size: 1.4rem; }
  .nyt-headline-side { font-size: 0.95rem; }
  .nyt-body { font-size: 0.85rem; }
  .nyt-summary { font-size: 0.8rem; }

  .nyt-grid { grid-template-columns: 1fr; gap: 1rem; }
  .nyt-updates-grid { grid-template-columns: 1fr; }
  .nyt-media-links { flex-direction: column; }
  .nyt-media-link { min-width: auto; }

  .nyt-history-entry { padding: 0.5rem 0.75rem; }
  .nyt-history-year { font-size: 1.2rem; }
  .nyt-baby-bulletin { padding: 0.5rem 0.75rem; }
  .nyt-almanac-quote { font-size: 0.95rem; max-width: 100%; }

  .nyt-footer { padding: 0 1rem 1.5rem; }
}

/* Tablets */
@media (min-width: 601px) and (max-width: 1100px) {
  .nyt-masthead { padding: 1rem 1.5rem 0; }
  .nyt-title { font-size: 2.2rem; }
  .nyt-content { padding: 0 1.5rem; }
  .nyt-grid { grid-template-columns: 1fr; gap: 1.5rem; }
}
</style>
