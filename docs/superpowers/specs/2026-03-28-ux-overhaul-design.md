# UX Overhaul Design Spec

**Date:** 2026-03-28
**Branch target:** new branch from `ab-angular-upgrade` (after merge to master)
**Status:** Approved — ready for implementation planning

---

## Overview

A full UX overhaul of RetroMatic to move away from the dated Angular Material 2 demo look. The app runs Angular 20 with Material M3 already active but unstyled for it. This spec covers the visual redesign, routing architecture change, layout system replacement, and theming simplification.

**Users affected:** All — owners, logged-in participants, and anonymous guests.

---

## 1. Architecture & Routing

### Routing change

Replace the current flat route structure with a shell-based layout:

**Before:**
```
/login           → LoginComponent
/register        → RegisterComponent
/resetpassword   → ResetPasswordComponent
/home            → MyDashboardComponent   ← removed
/retroboard/:id  → RetroBoardComponent
/                → redirects to /home
/**              → PageNotFoundComponent
```

**After:**
```
/login           → LoginComponent          (no shell)
/register        → RegisterComponent       (no shell)
/resetpassword   → ResetPasswordComponent  (no shell)

/app             → AppShellComponent       (AuthGuard here)
  /app/retro/:id   → RetroBoardComponent   (child route)
  /app             → WelcomeComponent      (empty state)

/                → redirects to /app
/**              → PageNotFoundComponent
```

- `AuthGuard` is applied once at `/app`, not on individual child routes.
- `/home` route and `MyDashboardComponent` are deleted entirely. Add an explicit `{ path: 'home', redirectTo: '/app', pathMatch: 'full' }` redirect to preserve any existing bookmarks.
- `WelcomeComponent` is a minimal empty state shown when no retro is active — a centred prompt with a "Create Retrospective" button.
- The shell redirect: navigating to `/` redirects to `/app`.

### New components

| Component | Purpose |
|---|---|
| `AppShellComponent` | Layout wrapper: sidebar + `<router-outlet>`. Reads auth state to decide sidebar variant. |
| `SidebarComponent` | The sidebar itself. Three variants driven by auth/ownership state. |
| `WelcomeComponent` | Empty state inside the shell for users with no active retro. |

### Deleted components / services

| Item | Reason |
|---|---|
| `MyDashboardComponent` | Replaced by sidebar + welcome state |
| `ThemePickerComponent` | Replaced by dark/light toggle in header |
| `StyleManager` | No longer needed — M3 theming via CSS class on `<html>` |
| `ThemeStorage` | Replaced by a simple `localStorage` key (`rm-color-scheme: dark|light`) |
| `ThemePickerModule` | Deleted with the above |

---

## 2. Layout System Replacement

Remove `@ngbracket/ngx-layout` (`FlexLayoutModule`) entirely. Replace all `fxLayout`, `fxFlex`, `fxHide`, `fxLayoutAlign`, `fxLayoutGap`, and `ngStyle.lt-md` directives with native CSS (flexbox/grid + `@media` queries).

**Files affected:** every component template and stylesheet. Changes are mechanical — no logic change, only markup.

**Package removal:** delete `@ngbracket/ngx-layout` from `package.json` and remove `FlexLayoutModule` from `app.module.ts` imports.

### Mobile breakpoints

Use a single breakpoint: `max-width: 768px` (md). This maps to the existing `lt-md` usage.

| Pattern | Replacement |
|---|---|
| `fxLayout="row"` | `display: flex; flex-direction: row` |
| `fxLayout="column"` | `display: flex; flex-direction: column` |
| `fxLayout.lt-md="column"` | `@media (max-width: 768px) { flex-direction: column }` |
| `fxFlex="33%"` | `flex: 0 0 33%` |
| `fxFlex` (spacer) | `flex: 1` |
| `fxHide.lt-md` | `@media (max-width: 768px) { display: none }` |
| `fxHide.gt-sm` | `@media (min-width: 769px) { display: none }` |
| `fxLayoutAlign="center center"` | `align-items: center; justify-content: center` |
| `fxLayoutGap="5px"` | `gap: 5px` |

---

## 3. Visual System

### M3 Theme

Angular Material 20 uses M3 by default. Define a single M3 theme with violet as the seed colour.

**Seed colour:** `#7C3AED` (violet)

M3 generates all tonal palettes (surface, container, on-*, state layers) from this seed. No manual colour tokens needed beyond the seed.

**Dark mode (default):**
- Background: `#13132A`
- Surface: `#1E1E38`
- Surface variant: `#2D2D44`
- Primary: `#A78BFA` (M3 on-dark primary)
- On-surface: `#E2E8F0`

**Light mode:**
- M3 auto-generates lighter tonal surfaces from the same seed.

### Light/Dark toggle

- Replace `ThemePickerComponent` with a single toggle button in `TheHeaderComponent`.
- Toggle adds/removes the `dark` CSS class on `<html>`. Angular Material M3 theming uses `@media (prefers-color-scheme)` by default, but can be overridden with a class-based selector on the theme definition (`.dark { @include mat.theme(...) }`). The implementation should use this class-based override so the toggle is explicit and not dependent on OS preference.
- Preference persisted to `localStorage` under key `rm-color-scheme`.
- Default: `dark`. On init, read `localStorage` first; fall back to `dark` if not set.

### Bucket accent colours

Bucket `type` field already exists in the data model (`success` / `danger` / `info`). Map to accent colours:

| Type | Accent |
|---|---|
| `success` | `#A78BFA` (violet — "went well") |
| `danger` | `#F87171` (red — "improve") |
| `info` | `#60A5FA` (blue — "action items") |

These colours are used for: bucket header label, "Add" button tint, and voted vote-button highlight.

---

## 4. App Shell & Sidebar

### Layout

```
┌─────────────────────────────────────────────┐
│  AppShellComponent                          │
│  ┌──────────┐  ┌──────────────────────────┐ │
│  │ Sidebar  │  │   <router-outlet>         │ │
│  │ (170px)  │  │   RetroBoardComponent     │ │
│  │          │  │   or WelcomeComponent     │ │
│  └──────────┘  └──────────────────────────┘ │
└─────────────────────────────────────────────┘
```

The sidebar is collapsible on desktop (collapses to a 48px icon rail). On mobile (`max-width: 768px`) it slides off-screen and is toggled by a hamburger icon in the header.

### Sidebar variants

**Owner** (authenticated + `retroboard.creatorId === user.uid`):
- My Retros list (paginated, links to `/app/retro/:id`)
- Favorites list
- "+ New Retro" button (opens create modal)
- Divider — per-retro actions (hidden entirely when on `WelcomeComponent` / no active retro):
- Favorite toggle (filled/outline)
- Export button
- Edit retro button
- Delete retro button (red)

**Logged-in participant** (authenticated + not owner):
- My Retros list
- Favorites list
- "+ New Retro" button
- Divider — per-retro actions (hidden entirely when on `WelcomeComponent` / no active retro):
- Favorite toggle
- Export button
- Edit retro (visually disabled, `disabled` attribute)
- Delete retro (visually disabled, `disabled` attribute)

**Guest** (anonymous):
- No sidebar rendered at all.
- `AppShellComponent` renders a slim top bar instead: app name left, retro title centre, dark/light toggle right.
- Board uses full available width.

### Header (inside shell)

The `TheHeaderComponent` is simplified:
- App name / logo (left)
- Dark/light toggle (right)
- Log out button (right, authenticated only)
- Hamburger (mobile only, toggles sidebar)
- GitHub link removed from header (can go in sidebar footer if desired)

---

## 5. Retroboard Component

### Note cards

Each note is a `mat-card` (M3 filled card variant) with:
- Note text (full width, wrapping)
- Vote row at the bottom, separated by a subtle rule:
  - Upvote button with count (highlights in bucket accent colour when user has voted up)
  - Downvote button with count (highlights when user has voted down)
- Clicking anywhere on the card except the vote buttons opens the edit dialog (existing behaviour)

### Bucket columns

- Column header: bucket name (uppercase, small, bucket accent colour) + "Add" button (bucket-tinted, header-right)
- No left border stripe
- Column background slightly elevated from page background (M3 surface variant)
- Columns are equal-width flex children; on mobile they stack vertically

### Action bar

The bottom `mat-toolbar` action bar is removed entirely. All actions (Favorite, Export, Edit, Delete) move to the sidebar.

### Edit / Add dialogs

Existing `ng-template` dialogs are kept but restyled to use M3 `mat-dialog` styling. No functional change.

---

## 6. Login / Register / Reset Password Screens

### Login

Split-screen layout:
- **Left panel** (`~40%`): dark gradient background (`#2D1B69` → `#13132A`), app name, one-line tagline. Hidden on mobile.
- **Right panel** (`~60%`): dark surface, sign-in form.

Form contents (unchanged):
1. "Continue with Google" button (full width, white, prominent)
2. Divider ("or")
3. Email field
4. Password field
5. "Sign in" button (violet, full width)
6. "Reset password" · "Sign up" links
7. Divider
8. "Continue as guest" ghost button

### Register & Reset Password

Same centered-card layout as the current design, restyled to the dark M3 theme. No structural change.

---

## 7. Mobile Behaviour

| Element | Mobile behaviour |
|---|---|
| Sidebar (owner/participant) | Hidden off-screen; hamburger in header slides it in as an overlay drawer |
| Guest top bar | Already slim — works as-is |
| Bucket columns | Stack vertically (`flex-direction: column`) |
| Login split screen | Left panel hidden; right panel full width |
| Note cards | Full width within stacked column |

---

## 8. What Is Not Changing

- Firebase data model (no schema changes)
- Authentication flow logic (`auth.service.ts`)
- Retroboard business logic (`retroboard.service.ts`, `export.service.ts`)
- Note/bucket/vote CRUD operations
- `AuthGuard` logic (just moves to shell route)
- `TransitionGroupComponent` / animation on note reorder
- Google Analytics events

---

## 9. Out of Scope

- Drag-and-drop for notes between buckets
- Real-time participant presence indicators
- Any changes to the Firebase data model
- Progressive Web App / offline support
- i18n

---

## Implementation Order

1. Remove `@ngbracket/ngx-layout` — mechanical, no visual change, good warm-up
2. M3 theme + dark/light toggle — visual foundation everything else builds on
3. `AppShellComponent` + `SidebarComponent` + routing refactor — structural change
4. `WelcomeComponent` + delete `MyDashboardComponent`
5. Retroboard note card redesign
6. Login split-screen redesign
7. Register / Reset Password restyling
8. Delete `ThemePickerComponent`, `StyleManager`, `ThemeStorage`
