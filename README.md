# Decisio — Weighted Decision Maker

A mobile-first Progressive Web App that helps you make better decisions by
scoring options against weighted criteria. Local-first, offline-capable, no
accounts, no tracking.

> **Stop deliberating. Start ranking.**
> Add the things you're choosing between, weight what matters, score each
> option, and Decisio computes a transparent weighted ranking — entirely on
> your device.

---

## Features

- **Weighted multi-criteria decisions** — define options, criteria, and
  per-criterion weights from 1 (nice to have) to 10 (deal breaker).
- **Live ranking** — every score change recomputes the normalized result
  instantly with a clear visual leaderboard.
- **Mobile-first PWA** — designed for phones first, installable to your home
  screen, works offline once visited.
- **Local-first persistence** — everything is stored in your browser's
  `localStorage`. No backend, no telemetry, no third-party requests.
- **Export / import JSON** — back up or move your decisions between devices.
- **Reset all data** — one tap to wipe everything you've stored.
- **Accessible** — semantic HTML, keyboard friendly, screen-reader labels,
  honors `prefers-reduced-motion` and `prefers-color-scheme`.
- **No fake data** — opens with an honest empty state. You define your own
  decisions.

## Screenshots

> Run `npm run dev` and visit `http://localhost:5173` to see the app live.
> Screenshots will be added once the first GitHub Pages deploy is live.

```
docs/screenshots/empty.png
docs/screenshots/list.png
docs/screenshots/score.png
docs/screenshots/result.png
```

## Tech stack

- [Vite](https://vitejs.dev/) + [React 18](https://react.dev/) + TypeScript
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) for the manifest and
  service worker
- [Vitest](https://vitest.dev/) + Testing Library for unit tests
- ESLint + typescript-eslint for linting
- Plain CSS with custom properties for theming — no UI framework

## Local setup

Requirements: Node.js 18+ and npm.

```bash
npm install
node scripts/generate-icons.mjs   # one-time: build PWA icon PNGs
npm run dev                       # http://localhost:5173
```

## Build & test

```bash
npm run typecheck   # tsc -b
npm run test        # unit tests for the scoring math
npm run lint        # eslint
npm run build       # production bundle in dist/
npm run preview     # serve the built bundle locally
```

## Deploy to GitHub Pages

1. Push this repo to GitHub (`main` branch).
2. In **Settings → Pages**, set **Source** to **GitHub Actions**.
3. The included [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)
   workflow will build, test, and publish on every push to `main`.

The Vite config sets `base` automatically when `GITHUB_PAGES=true`, using
`/<repo-name>/` so the app works at `https://<user>.github.io/<repo-name>/`.

To preview a Pages-style build locally:

```bash
GITHUB_PAGES=true GITHUB_REPOSITORY=you/decisio npm run build
npm run preview
```

(On Windows PowerShell: `$env:GITHUB_PAGES = 'true'; $env:GITHUB_REPOSITORY = 'you/decisio'; npm run build`)

## How the math works

Each criterion has a weight `w ∈ [1, 10]`. Each option gets a score per
criterion `s ∈ [0, 10]`. The normalized score for an option is:

```
normalized = Σ(s × w) / Σ(w)
```

This keeps results comparable across decisions with different numbers of
criteria. Ranks are assigned by sorted normalized score; ties share a rank.

## Project structure

```
src/
  App.tsx                  Top-level view switcher
  main.tsx                 React entry
  types.ts                 Shared types and bounds
  state/
    decisionsContext.tsx   React context + persistence wiring
    decisionsReducer.ts    Pure reducer for all mutations
  storage/
    localStore.ts          load / save / export / import
  utils/
    score.ts               Ranking math
    score.test.ts          Vitest unit tests
    id.ts                  ID generator
  components/              UI building blocks
  styles/global.css        Mobile-first design tokens & layout
public/                    Static assets, PWA icons, favicon
scripts/generate-icons.mjs Builds icon PNGs (no native deps)
.github/workflows/deploy.yml  GH Pages build + deploy
```

## Roadmap

These are explicitly **not** implemented yet — only what's checked above is
in the current build:

- [ ] Per-option notes / pros & cons fields
- [ ] Drag to reorder options & criteria
- [ ] Sensitivity analysis (which weight changes flip the winner?)
- [ ] CSV export of the score matrix
- [ ] Optional cloud sync via WebDAV / iCloud Drive folder
- [ ] Multilingual UI

## Contributing

Issues and PRs welcome. Please run `npm run lint && npm test && npm run build`
before submitting.

## License

[MIT](LICENSE)
