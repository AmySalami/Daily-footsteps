# PRD — DailyFootsteps

> **Living document.** Update this whenever scope, epics, flow, or decisions change.
> Keep the *Change Log* at the bottom current. This is the single source of truth for
> what we are building and why.

- **Product:** DailyFootsteps — a daily language-practice web app
- **Owner:** Amy
- **Status:** Prototype phase
- **Last updated:** 2026-08-08
- **Design system:** [amies_design_system](https://github.com/AmySalami/amies_design_system) (tokens are the single source of truth — no hardcoded colors/sizes)
- **Repo:** https://github.com/AmySalami/Daily-footsteps.git

---

## 1. Vision

A calm, daily habit for improving language skills through **active production**, not passive
drills. Every day the learner picks something from their own world (their "workspace") and
**describes it or tells a story about it** — by writing or speaking. An AI coach reviews the
work, corrects it, scores it, and turns it into a personal vocabulary list. Consistency is
rewarded with a growing trail of **footsteps**.

**Languages at launch:** German 🇩🇪 and English 🇬🇧.

**Core belief:** you learn a language faster by *producing* it about things you actually care
about, and by coming back every single day.

---

## 2. Target user

- Self-directed learners improving German and/or English.
- Comfortable with a browser; want a low-friction daily ritual (2–10 min).
- Motivated by streaks and visible progress.

---

## 3. Core user flow

1. Open the web → land **directly on the writing page** (no language picking required first).
2. The user **names their topic** in a Title field (their own "stuff"), or taps **🎲 Shuffle** to pull a random item from their **workspace** when they don't know what to write about.
3. The user **writes or speaks** freely — describing the topic or telling a story about it.
4. Language is set by tapping a **language tag**, or — if none is chosen — **auto-detected from the text** on submit.
5. On finish, the **AI coach reviews**: corrections + suggestions.
6. AI gives a **score** and generates a **vocabulary table** (word · meaning · how to use · type · example sentence).
7. Completing the day extends the **cat-paw footsteps** streak for that language.

All learner data lives in **local storage** (workspace, exercises, scores, vocab, streaks).
The only server component is a thin AI proxy (production phase).

---

## 4. Epics

| # | Epic | Delivers |
|---|------|----------|
| **E1** | Foundation & Design System | Scaffold, amies design-system tokens wired in, layout shell, local-storage service |
| **E2** | Home = Practice page | Writing-first landing; compact per-language streak chips that double as language tags; language auto-detected on submit if not chosen |
| **E3** | Workspace ("my stuff") | Add / edit / remove the items **Shuffle** draws from |
| **E4** | Exercise Engine | User names the topic (Title); optional **🎲 Shuffle** pulls a workspace item; write freely (describe or story) |
| **E5** | Writing & Speaking Input | Text editor + Web Speech API voice input + submit |
| **E6** | AI Review & Scoring | Corrections, suggestions, and a score; persisted locally |
| **E7** | Vocabulary Builder | AI vocab table (word · meaning · usage · type · example), saved & reviewable per language |
| **E8** | Streak & Progress (Footsteps) | **Cat-paw** footprints visual + streak logic per language |
| **E9** | Backend AI Proxy | Thin server holding the API key, forwarding review/vocab requests (the only server piece) |

**Engine is built once and parameterized by language** (E4–E7). Only prompts and labels differ
between DE and EN — no duplicated logic.

---

## 5. Decisions (locked)

| Decision | Choice | Notes |
|----------|--------|-------|
| AI backend | **Thin backend proxy** | Holds the API key; forwards review/vocab calls. Only server piece. |
| Launch languages | **German + English** | Both from day one, shared engine. |
| Data storage | **Local storage** | All learner data client-side. |
| Prototype AI | **Mocked** | Canned/heuristic responses so the full flow is clickable before the proxy exists. |
| Production stack | **React + TypeScript + Vite** | Component-based, typed, hash-routed SPA; consumes DS CSS tokens; env-driven proxy base URL. |

## 6. Open questions

- Workspace items: text-only, or images too? (Prototype = text + optional emoji/photo slot.)
- Voice: Web Speech API is strong in Chrome/Edge, weak in Firefox/Safari — acceptable for now.
- Scoring rubric: what dimensions (grammar, vocabulary range, fluency)? To be defined with real AI.
- Auth / multi-device sync: out of scope until after local-storage MVP.

---

## 7. Phasing

### Phase 0 — Prototype (current)
Clickable, single-page, vanilla HTML/CSS/JS. Design-system tokens. **Mock AI.** Local storage.
Goal: *feel the end-to-end experience* and validate the flow before committing to production build.

Prototype covers: Language Hub → Workspace → Exercise (describe/story) → write **or** speak →
mock review + score → vocab table → footsteps streak.

### Phase 1+ — Production
Build each epic properly. Introduce the E9 AI proxy, real review/scoring/vocab, hardened
storage, and polish. Sequenced roughly: E1 → E9 (stub) → E3 → E4 → E5 → E6 → E7 → E2 → E8.
A dedicated **UI polish pass** happens after E9 (not a new epic — a phase).

**Progress:**
- ✅ **E1 — Foundation & Design System** — React + TS + Vite scaffold; DS tokens + fonts wired; typed
  `localStorage` layer with seeding + versioning/migration (`src/lib/storage.ts`); hash router + app
  shell; reusable UI primitives (`Button`, `Card`, `Badge`, `Tag`, `Paw`, `PawTrail`); env-driven
  proxy config (`VITE_API_BASE`). Prototype preserved under `/prototype`.
- ✅ **E3 — Workspace CRUD** — add / edit (inline) / remove workspace items per language, persisted via
  storage mutations (`addWorkspaceItem` / `updateWorkspaceItem` / `removeWorkspaceItem`); shared
  `ItemForm` (add + edit) with emoji picker; reusable `toast` + `Toaster`. Verified: CRUD, persistence
  across reload, per-language isolation.

---

## 8. Success signals (early)

- Learner returns on consecutive days (streak length).
- Exercises completed per week.
- Vocabulary entries saved and revisited.

---

## Change Log

- **2026-08-08** — **E3 (Workspace CRUD) built.** Add / edit / remove workspace items per language through typed storage mutations; shared add/edit form with emoji picker; reusable toast. Verified in-browser (CRUD, persistence, language isolation).
- **2026-08-08** — **E1 (Foundation) built.** Production stack locked: **React + TypeScript + Vite**. Scaffold, design-system wiring, typed storage layer (seed + versioning), hash routing, app shell, and reusable UI primitives in place and building clean (`tsc` + `vite build`). Prototype moved to `/prototype`.
- **2026-08-08** — Flow revision after prototype review: home is now the **writing page** (no upfront language choice); user **names the topic** in a Title (🎲 Shuffle pulls from workspace); language chosen via **tag or auto-detected** on submit; streak visual changed to **cat-paw footprints** with a compact horizontal per-language layout.
- **2026-08-08** — Initial PRD. Epics E1–E9 defined. Decisions locked: thin AI proxy, DE+EN at launch, local storage, mocked AI for the prototype. Prototype phase started.
