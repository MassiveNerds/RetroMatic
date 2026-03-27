# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start           # Dev server (ng serve)
npm run build       # Production build (runs config + build-themes + ng build --prod)
npm run config      # Generate environment.ts from env vars via ts-node set-env.ts
npm run build-themes # Build custom Material theme CSS files
npm run lint        # Format code with Prettier (--write, not just check)
npm test            # Run unit tests with Karma/Jasmine
npm run e2e         # Run end-to-end tests with Protractor
```

To run a single test file, use:
```bash
npx ng test --include='**/auth.service.spec.ts'
```

### Environment Setup

Before running locally, create a `.env` file with Firebase config, then run `npm run config` to generate `src/environments/environment.ts`. See `src/environments/firebase.example.ts` for the expected shape.

## Architecture

**RetroMatic** is an Angular 6 + Firebase real-time retrospective tool. The stack is Angular Material for UI, AngularFire for Firebase bindings, and RxJS for reactive data streams.

### Data Model (Firebase Realtime Database)

```
retroboards/$id   → { creator, creatorId, name, dateCreated, timeZone, noteCount }
buckets/$id       → { retroboardId, creator, creatorId, name }
notes/$id         → { retroboardId, bucketId, creator, creatorId, message, voteCount, votes: {uid: bool} }
users/$uid        → { displayName, md5hash, favorites: [retroboardId] }
```

### Key Services

- **`auth.service.ts`** — Firebase Auth wrapper. Exposes `user$` Observable and `userDetails` cache. Handles email/password, Google OAuth, and anonymous ("guest") login. Guest users get a random Star Wars character name via `unique-names-generator`.
- **`retroboard.service.ts`** — All CRUD for retroboards/buckets/notes via AngularFire. Also fires Google Analytics events for key user actions.
- **`export.service.ts`** — Converts retroboard data to Confluence-ready HTML table format.

### Routing

Routes are defined in `app.module.ts`. `AuthGuard` protects `/home` and `/retroboard/:id`. Unauthenticated users are redirected to `/login`.

### Theme System

Four lazy-loaded Material Design themes live in `src/themes/`. `StyleManager` (in `components/style-manager/`) dynamically swaps the active stylesheet. `ThemeStorage` persists the selection to `localStorage`. The `build-themes.sh` script compiles the SCSS theme sources.

### Component Communication

Components interact primarily through services (injected) and the Firebase real-time streams — there is minimal `@Input`/`@Output` between sibling components. The `RetroBoardComponent` is the largest component (~294 lines) and manages all note/bucket interactions for a live session.
