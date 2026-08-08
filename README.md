# DailyFootsteps 👣

A daily language-practice web app. Pick something from your own world, **describe it or tell
its story** (by writing or speaking), and an AI coach reviews it, scores it, and turns it into
a personal vocabulary list. Come back every day to grow your trail of cat-paw footsteps.

Languages at launch: **German 🇩🇪** and **English 🇬🇧**.

> See [PRD.md](PRD.md) — the living product doc (vision, epics, decisions, roadmap).

## Status: Production build — core app complete (E1–E9)

The full learner loop works end-to-end: Workspace, writing Practice (title + Shuffle, language
tag / auto-detect, write or speak), AI review (score, suggestions, polished text, vocabulary),
Vocabulary collection, and cat-paw streaks.

Stack: **React + TypeScript + Vite**, hash-routed SPA, all learner data in `localStorage`.
AI runs through a thin **Express + Anthropic-SDK proxy** (`server/`) that holds the API key.
Design system: [amies_design_system](https://github.com/AmySalami/amies_design_system) tokens
(vendored in `src/styles/design-system.css`) — no hardcoded colors/sizes.

## Run

```bash
npm install
npm run dev
```

Then open the URL Vite prints (default `http://localhost:5173`).

Other scripts:

```bash
npm run build      # typecheck (tsc -b) + production build to dist/
npm run preview    # serve the production build
npm run typecheck  # types only
```

## Project structure

```
src/
├── main.tsx                 # entry: mounts <App>, loads DS + app styles
├── App.tsx                  # RouterProvider
├── router.tsx               # hash routes → AppShell + pages
├── components/
│   ├── AppShell.tsx         # header (brand + nav) + <Outlet>
│   └── ui/                  # DS primitives: Button, Card, Badge, Tag, Paw, PawTrail
├── pages/                   # PracticePage, WorkspacePage, VocabularyPage
├── lib/
│   ├── types.ts             # domain model (single source of truth)
│   ├── constants.ts         # LANGS, seed workspace, paw geometry
│   ├── config.ts            # env (VITE_API_BASE), storage key/version
│   ├── storage.ts           # typed localStorage layer + pub/sub (only file touching storage)
│   └── useAppState.ts       # React hook over the store
└── styles/                  # design-system.css (vendored tokens) + app.css

├── lib/aiClient.ts          # calls the proxy when VITE_API_BASE is set; else mock
server/                      # E9 — thin AI proxy (Express + Anthropic SDK)
prototype/                   # the original clickable prototype (kept for reference)
```

## AI proxy (E9) — real feedback

The AI coach runs behind a thin proxy that holds your Anthropic API key (it never reaches the
browser). Model: `claude-opus-5` (change `MODEL` in `server/src/index.ts` for a cheaper tier).

```bash
# 1. start the proxy
cd server
npm install
cp .env.example .env        # then put your key in .env: ANTHROPIC_API_KEY=sk-ant-...
npm run dev                 # serves http://localhost:8787

# 2. point the app at it (in the project root)
cp .env.example .env        # set VITE_API_BASE=http://localhost:8787
npm run dev
```

When `VITE_API_BASE` is empty the app shows a **mock AI** badge and uses built-in heuristic
feedback. If the proxy is configured but unreachable (down, no key, network error), the app
**falls back to the mock** and says so — it never breaks.

## Reset local data

```js
localStorage.removeItem('df_state'); location.reload();
```
