# DailyFootsteps 👣

A daily language-practice web app. Pick something from your own world, **describe it or tell
its story** (by writing or speaking), and an AI coach reviews it, scores it, and turns it into
a personal vocabulary list. Come back every day to grow your trail of footsteps.

Languages at launch: **German 🇩🇪** and **English 🇬🇧**.

> See [PRD.md](PRD.md) — the living product doc (vision, epics, decisions, roadmap).

## Status: Prototype (Phase 0)

This is a clickable prototype to validate the end-to-end experience.

- **Vanilla HTML/CSS/JS** — no build step.
- **Design system:** [amies_design_system](https://github.com/AmySalami/amies_design_system), tokens vendored in `vendor/amies-design-system.css`. No hardcoded colors/sizes.
- **Storage:** everything lives in your browser's `localStorage` (key `df_state`).
- **AI is mocked** — `mockReview()` in `assets/app.js` returns heuristic feedback/score/vocab so the whole flow works before the real backend proxy exists.
- **Voice** uses the browser Web Speech API (best in Chrome/Edge).

## Run it

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000` (serve over http — voice + fonts don't like `file://`).

## The flow

Hub (pick a language) → Exercise (a random workspace item, *describe* or *story*) → write or
speak → **mock AI review + score + vocabulary table** → footsteps streak grows.
Manage your items under **Workspace**; browse saved words under **Vocabulary**.

## Structure

```
index.html                     # app shell + nav
assets/app.css                 # prototype styles (tokens only)
assets/app.js                  # router, state, mock AI, all views
vendor/amies-design-system.css # design tokens (synced from the DS repo)
PRD.md                         # living product doc
```

## Reset

Clear your data from the browser console:

```js
localStorage.removeItem('df_state'); location.reload();
```
