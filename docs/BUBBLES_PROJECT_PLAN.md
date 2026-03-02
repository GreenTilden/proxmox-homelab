# Bubbles — Wear OS Productivity + Wellness + Game App

**Status**: Planning (brainstorm sessions Feb 23-24, 2026)
**Existing codebase**: `~/projects/bubble-watch/` — working Wear OS Compose app (Kotlin, ambient mode, vibration, canvas)
**Priority**: Nights & weekends sprint. Ship MVP before baby (Mar 19). Does NOT block DArnTech or LornaCo.

## The Name

It's **Bubbles**. It was always Bubbles. Oliver's toddler toy becomes the shell for the whole thing.

## Vision

One app, three reinforcing modules. Your devices should serve your intent, not hijack your attention.

**Distribution angles**: Productivity, Wellness/Mental Health, Game — three Play Store categories from one app.

Open source. Freemium in the most unintrusive way possible. Patreon / Buy Me a Coffee. No ads. No dark patterns.

## Characters

Two geometric companions — angel and devil on your shoulders. Which is which is always the point.

- **Imp** — your terminal/orchestrator buddy. Monitors sessions, pushes notifications, schedules work windows.
- **Pavlov** — your discipline buddy. Phantom buzzes, gentle callouts, pattern awareness training.

Design bible: "intentionally ugly like Atari ET" to start. Pivot once it works.
Contextual states: working = hard hat, DND = sleeping cap, caught checking = side-eye.
Inspired by Claude's seasonal mascot hats (birthday candle, pumpkin, snowflake, fireworks).

## Modules

### Game Layer (Bubbles — the core)
- Inherits directly from bubble-watch (Oliver's toddler toy)
- Imp and Pavlov live in bubbles, interact with tap/pop mechanics
- "Bring your watch to the toilet and play a game like a modern gentleman"
- "Stick around for a little while" — gentle engagement, no attention demands
- The thing that makes someone download it

### Imp (Terminal + Orchestrator)
- Claude Code session monitoring from watch
- Push notifications on task/build completion
- Quick status checks without pulling out laptop/phone
- Work window scheduling (integrates with HA, Android DND, Tasker-style)
- Links to Claude Code tutorials, community support, how-to-build guides

### Pavlov (Discipline + Awareness)
- Phantom buzzes during DND/focus windows
- When you react (look at wrist): gentle, slightly cheeky callout
- "You checked because your brain told you to, not because anything happened"
- NOT gamified, NOT competitive, NOT a prank tool
- Tone: warm, slightly too-knowing, like a friend who sees through you
- Configurable intervals, different training modes
- Core principle: teach people their brains are doing things they don't think they are, and they can chill

### Product Principles
- Fun must be gentle and well-considered
- No gamification or scoring that enables using it as a prank device
- Effective and potentially lightly insulting in notification content — but kind
- Don't accidentally create more anxiety loops

## Architecture (Preliminary)

```
Watch App (Wear OS Compose — from bubble-watch)
├── Bubbles Game (canvas rendering, tap mechanics, characters)
├── Imp Module
│   ├── WebSocket/polling to command server API
│   ├── Claude Code session status
│   ├── Push notifications (FCM)
│   └── HA / Android system integration
├── Pavlov Module
│   ├── Phantom buzz scheduler
│   ├── Reaction detection (screen wake / tap)
│   ├── Gentle notification content engine
│   └── DND integration
└── Shared (ambient mode, vibration engine, settings)

Phone Companion App (Android Compose)
├── Full terminal view (bigger screen)
├── Orchestrator config (work windows, HA)
├── Pavlov training history / insights
└── Sync with watch
```

## Business Model

- **Open source** — full repo public
- **Freemium** — non-intrusive. No ads. No dark patterns.
- **Community**: Links to Claude Code tutorials, community orgs, open source guides
- **Revenue**: Patreon / Buy Me a Coffee / premium cosmetic hats (maybe)
- **Future**: 501(c)(3) or similar nonprofit — pillar 2, AFTER DArnTech + LornaCo
- **iOS**: Needs macOS VM on Proxmox — good excuse to finally set that up

## Anthropic Connection

Angle: "Ethical AI utility app that promotes healthy device relationships. Built on Claude. Demonstrates AI can make you use technology *less* instead of more."

Research submission routes post-MVP:
- Anthropic partner program / marketplace
- Claude API showcase / case study
- Direct outreach with working demo

## Timeline

- **Week 1** (Feb 24-Mar 2): Evolve bubble-watch into Bubbles. Module structure. Get Imp showing real status from command server on watch.
- **Week 2** (Mar 3-9): Push notifications via FCM. Pavlov phantom buzz prototype. Phone companion scaffolded.
- **Week 3** (Mar 10-16): Polish. Character states. Basic Pavlov training mode.
- **Mar 19**: Baby arrives. MVP should be on watch and functional.
- **Post-baby**: Iterate when energy allows. iOS when macOS VM is up.

## Tech Notes

- bubble-watch already has: Wear OS manifest, Compose UI, ambient lifecycle, vibration, canvas rendering, toddler-proof input
- Package: `com.darney.bubblewatch` — rename to `com.darney.bubbles`
- Kotlin + Jetpack Compose for Wear OS
- Phone companion: standard Android Compose (not Wear)

## The Microsoft Commercial Thing

"It's that Microsoft commercial where he talks about living in the future we always dreamed of."

That's the vibe. Bring your watch to the toilet like the olden days. Play a game like modern man. One of these little dudes has your back. Everybody's happy.
