# UX Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign RetroMatic with a dark-first M3 Material theme, collapsible sidebar replacing the dashboard, native CSS layout, and light/dark toggle replacing the 4-theme picker.

**Architecture:** Introduce an `AppShellComponent` as a parent route that hosts `SidebarComponent` + `<router-outlet>`. A new `RetroStateService` bridges the current retro from `RetroBoardComponent` to the sidebar. All `fxLayout` directives are replaced with CSS. The M2 theme system (`_app-theme.scss`, `ThemePickerComponent`, `StyleManager`, `ThemeStorage`) is deleted and replaced by a single M3 theme + `ThemeService`.

**Tech Stack:** Angular 20, Angular Material 20 (M3), AngularFire 20, Firebase 11, RxJS 7, Karma/Jasmine

---

## File Map

### Created
| File | Responsibility |
|---|---|
| `src/app/components/app-shell/app-shell.component.ts` | Layout host: sidebar + router-outlet, decides sidebar vs guest top-bar |
| `src/app/components/app-shell/app-shell.component.html` | Shell template |
| `src/app/components/app-shell/app-shell.component.scss` | Shell layout CSS |
| `src/app/components/sidebar/sidebar.component.ts` | Retro list, favorites, per-retro actions |
| `src/app/components/sidebar/sidebar.component.html` | Sidebar template |
| `src/app/components/sidebar/sidebar.component.scss` | Sidebar styles |
| `src/app/components/welcome/welcome.component.ts` | Empty state for authenticated users with no active retro |
| `src/app/components/welcome/welcome.component.html` | Welcome template |
| `src/app/components/welcome/welcome.component.scss` | Welcome styles |
| `src/app/services/theme.service.ts` | Dark/light toggle, localStorage persistence |
| `src/app/services/theme.service.spec.ts` | Unit tests for ThemeService |
| `src/app/services/retro-state.service.ts` | BehaviorSubject bridging current retro to sidebar |

### Modified
| File | Change |
|---|---|
| `src/styles.scss` | Replace M2 theme with M3 dark/light definitions |
| `src/app/app.module.ts` | Shell routing, new components, remove FlexLayoutModule + ThemePickerModule |
| `src/app/components/the-header/the-header.component.ts` | Inject ThemeService, add toggle method |
| `src/app/components/the-header/the-header.component.html` | Dark/light toggle button, remove theme-picker |
| `src/app/components/the-header/the-header.component.scss` | Header styles |
| `src/app/components/retroboard/retroboard.component.html` | New note cards, remove action bar, add bucket accent classes |
| `src/app/components/retroboard/retroboard.component.scss` | New card styles |
| `src/app/components/retroboard/retroboard.component.ts` | Inject RetroStateService, fix `/home` nav → `/app`, remove export/delete/edit/favorite methods (move to sidebar) |
| `src/app/components/login/login.component.html` | Split-screen layout |
| `src/app/components/login/login.component.scss` | Split-screen styles |
| `src/app/components/register/register.component.html` | Remove fxLayout, dark card |
| `src/app/components/register/register.component.scss` | Dark card styles |
| `src/app/components/reset-password/reset-password.component.html` | Remove fxLayout, dark card |
| `src/app/components/reset-password/reset-password.component.scss` | Dark card styles |
| `src/app/components/create-update-retro-modal/create-update-retro-modal.component.html` | Remove fxLayout |
| `src/app/components/create-update-retro-modal/create-update-retro-modal.component.scss` | Minimal cleanup |
| `src/app/app.component.html` | Remove fxLayout from root |
| `src/app/app.component.scss` | Root layout |
| `angular.json` | Remove 4 lazy CSS theme bundles |
| `package.json` | Remove `@ngbracket/ngx-layout` |

### Deleted
| File | Reason |
|---|---|
| `src/_app-theme.scss` | Replaced by M3 theme in styles.scss |
| `src/app/components/my-dashboard/` (4 files) | Replaced by sidebar + WelcomeComponent |
| `src/app/components/theme-picker/` (all files incl. theme-storage/) | Replaced by ThemeService |
| `src/app/components/style-manager/` (2 files) | No longer needed |
| `src/assets/deeppurple-amber.css` | Lazy theme removed |
| `src/assets/indigo-pink.css` | Lazy theme removed |
| `src/assets/pink-bluegrey.css` | Lazy theme removed |
| `src/assets/purple-green.css` | Lazy theme removed |

---

## Task 1: Remove @ngbracket/ngx-layout

**Files:**
- Modify: `package.json`
- Modify: `src/app/app.module.ts`
- Modify: `src/app/app.component.html`
- Modify: `src/app/components/the-header/the-header.component.html`
- Modify: `src/app/components/login/login.component.html`
- Modify: `src/app/components/login/login.component.scss`
- Modify: `src/app/components/register/register.component.html`
- Modify: `src/app/components/register/register.component.scss`
- Modify: `src/app/components/reset-password/reset-password.component.html`
- Modify: `src/app/components/reset-password/reset-password.component.scss`
- Modify: `src/app/components/retroboard/retroboard.component.html`
- Modify: `src/app/components/my-dashboard/my-dashboard.component.html`
- Modify: `src/app/components/create-update-retro-modal/create-update-retro-modal.component.html`

- [ ] **Step 1.1: Remove the package**

```bash
npm uninstall @ngbracket/ngx-layout
```

Expected: `package.json` no longer contains `@ngbracket/ngx-layout`.

- [ ] **Step 1.2: Remove FlexLayoutModule from app.module.ts**

Remove the import line and the `FlexLayoutModule` entry from the `imports` array in `src/app/app.module.ts`:

```typescript
// DELETE these two lines:
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
// and remove FlexLayoutModule from the imports array
```

- [ ] **Step 1.3: Update app.component.html**

Replace:
```html
<div class="app-container" fxLayout="column">
  <app-the-header class="the-header"></app-the-header>
  <div fxFlex>
    <router-outlet></router-outlet>
  </div>
</div>
```

With:
```html
<div class="app-container">
  <app-the-header class="the-header"></app-the-header>
  <div class="app-container__content">
    <router-outlet></router-outlet>
  </div>
</div>
```

Update `src/app/app.component.scss`:
```scss
.app-container {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;

  .the-header {
    z-index: 2;
    flex-shrink: 0;
  }

  .app-container__content {
    flex: 1;
    overflow: auto;
  }
}
```

- [ ] **Step 1.4: Update the-header.component.html**

Replace `fxHide.lt-md` / `fxHide.gt-sm` with CSS classes. Replace:
```html
<mat-toolbar class="the-header" color="primary">
  <span [ngStyle.lt-md]="{ 'font-size.px': 40 }" class="title">RetroMatic</span>
  <span fxFlex class="spacer"></span>
  <span fxHide.lt-md>
    ...desktop nav...
  </span>
  <span fxHide.gt-sm>
    ...mobile nav...
  </span>
</mat-toolbar>
```

With:
```html
<mat-toolbar class="the-header" color="primary">
  <span class="title">RetroMatic</span>
  <span class="spacer"></span>
  <span class="the-header__desktop-nav">
    <button *ngIf="authService.isLoggedIn()" mat-button [routerLink]="['/home']">My Dashboard</button>
    <app-theme-picker></app-theme-picker>
    <a mat-button href="https://github.com/wordythebyrd/RetroMatic" target="_blank" aria-label="GitHub Repository">
      <img class="the-header__github-logo" src="../../assets/github-circle-white-transparent.svg" alt="github" />
      GitHub
    </a>
    <button *ngIf="authService.isLoggedIn()" mat-button (click)="logout()">Log out</button>
  </span>
  <span class="the-header__mobile-nav">
    <button mat-icon-button [matMenuTriggerFor]="appMenu">
      <mat-icon>more_vert</mat-icon>
    </button>
    <mat-menu #appMenu="matMenu">
      <button *ngIf="authService.isLoggedIn()" mat-menu-item [routerLink]="['/home']">My Dashboard</button>
      <a mat-menu-item href="https://github.com/wordythebyrd/RetroMatic" target="_blank">GitHub</a>
      <button *ngIf="authService.isLoggedIn()" mat-menu-item (click)="logout()">Log out</button>
    </mat-menu>
  </span>
</mat-toolbar>
```

Update `src/app/components/the-header/the-header.component.scss`:
```scss
.the-header {
  .title {
    font-size: 20px;
  }
  .spacer {
    flex: 1;
  }
  .the-header__github-logo {
    height: 20px;
    margin-right: 4px;
    vertical-align: middle;
  }
  .the-header__mobile-nav {
    display: none;
  }
  @media (max-width: 768px) {
    .the-header__desktop-nav {
      display: none;
    }
    .the-header__mobile-nav {
      display: block;
    }
    .title {
      font-size: 40px;
    }
  }
}
```

- [ ] **Step 1.5: Update login.component.html**

Replace:
```html
<form
  class="login-page topography-svg-bg"
  fxLayout="row"
  fxLayoutGap="20px"
  fxLayoutAlign="center center"
  [formGroup]="loginForm"
  (ngSubmit)="login()"
>
  <mat-card
    class="mat-elevation-z6"
    fxFlex.gt-lg="1 1 20%"
    fxFlex.lg="1 1 30%"
    fxFlex.md="1 1 40%"
    fxFlex.sm="1 1 70%"
    fxFlex.lt-sm="1 1 90%"
  >
    <mat-card-content fxLayout="column">
```

With:
```html
<form
  class="login-page topography-svg-bg"
  [formGroup]="loginForm"
  (ngSubmit)="login()"
>
  <mat-card class="login-page__card mat-elevation-z6">
    <mat-card-content class="login-page__card-content">
```

Update `src/app/components/login/login.component.scss`:
```scss
.login-page {
  height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;

  &__card {
    width: clamp(280px, 40vw, 420px);
  }

  &__card-content {
    display: flex;
    flex-direction: column;
  }
}

.error-text {
  color: tomato;
}

.login__reset-password-button {
  font-weight: 400;
}

.login__lower-options {
  text-align: center;
}
```

- [ ] **Step 1.6: Update register.component.html**

Replace `fxLayout` / `fxFlex` attributes on the form and card:
```html
<form
  class="register-page topography-svg-bg"
  [formGroup]="registerForm"
  (ngSubmit)="register()"
>
  <mat-card class="register-page__card mat-elevation-z6">
    <mat-card-content class="register-page__card-content">
      <!-- rest unchanged -->
    </mat-card-content>
```

Update `src/app/components/register/register.component.scss`:
```scss
.register-page {
  height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;

  &__card {
    width: clamp(280px, 40vw, 420px);
  }

  &__card-content {
    display: flex;
    flex-direction: column;
  }
}

.error-text {
  color: tomato;
}
```

- [ ] **Step 1.7: Update reset-password.component.html**

Same pattern as register (same template structure, same `fxLayout` usage):
```html
<form
  class="register-page topography-svg-bg"
  [formGroup]="resetPasswordForm"
  (ngSubmit)="resetPassword()"
>
  <mat-card class="register-page__card mat-elevation-z6">
    <mat-card-content class="register-page__card-content">
      <!-- rest unchanged -->
    </mat-card-content>
```

No new `.scss` needed — it shares `.register-page` styles via the class name (existing pattern).

- [ ] **Step 1.8: Update retroboard.component.html — remove fxLayout only**

Remove only the layout directives. Do not change the structure yet (that comes in Task 6).

Replace every `fxLayout`, `fxFlex`, `fxLayoutGap`, `fxLayoutAlign` attribute in the template with CSS class equivalents. Full replacement:

```html
<div class="page-container mat-typography">
  <div class="primary-header">
    <h1>{{ retroboard?.name }}</h1>
  </div>
  <div class="retroboard__columns">
    <mat-card *ngFor="let bucket of buckets$ | async">
      <mat-card-header>
        <mat-card-title class="retroboard__bucket-title">{{ bucket.name }}</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <mat-list>
          <app-transition-group class="retro__notes">
            <mat-list-item
              appTransitionGroupItem
              class="retroboard__note-item"
              *ngFor="let note of bucket.notes$ | async; trackBy: trackByFn"
            >
              <div class="retroboard__note-item-inner">
                <button
                  [ngClass]="{ 'mat-accent': hasVoted(note.votes, true) }"
                  mat-icon-button
                  title="Vote Up"
                  aria-label="Vote Up"
                  (click)="upvote(bucket, note)"
                >
                  <mat-icon aria-hidden="true">keyboard_arrow_up</mat-icon>
                </button>
                <button
                  [ngClass]="{ 'mat-warn': hasVoted(note.votes, false) }"
                  mat-icon-button
                  title="Vote Down"
                  aria-label="Vote Down"
                  (click)="downvote(bucket, note)"
                >
                  <mat-icon aria-hidden="true">keyboard_arrow_down</mat-icon>
                </button>
              </div>
              <button
                id="noteButton"
                [matBadge]="note.voteCount"
                [matBadgeHidden]="!note.voteCount || note.voteCount === 0"
                mat-button
                class="retroboard__note mat-elevation-z2 retroboard__note--full"
                (click)="openModal(edittemplate, bucket, note)"
              >
                <span class="retroboard__note-button-text">{{ note.message }}</span>
              </button>
            </mat-list-item>
            <mat-list-item>
              <button
                mat-button
                class="add-new-button add-new-button--full"
                title="Add entry to {{ bucket.name }}"
                aria-label="Add entry"
                [class.success]="bucket.type === 'success'"
                [class.danger]="bucket.type === 'danger'"
                [class.info]="bucket.type === 'info'"
                (click)="openModal(addtemplate, bucket)"
              >
                <mat-icon aria-hidden="true">add</mat-icon>
              </button>
            </mat-list-item>
          </app-transition-group>
        </mat-list>
      </mat-card-content>
    </mat-card>
  </div>
  <mat-toolbar class="retroboard__action-bar">
    <div class="retroboard__action-bar-spacer"></div>
    <button *ngIf="isFavorite$ | async; else notFavorite" title="Remove from favorites" aria-label="Remove from favorites" mat-stroked-button color="accent" (click)="toggleFavorite()">
      <mat-icon>favorite</mat-icon>
      Favorite
    </button>
    <ng-template #notFavorite>
      <button mat-stroked-button title="Add to favorites" aria-label="Add to favorites" color="accent" (click)="toggleFavorite()">
        <mat-icon>favorite_border</mat-icon>
        Favorite
      </button>
    </ng-template>
    <button mat-raised-button color="accent" (click)="openExportModal(exporttemplate)">
      <mat-icon>save_alt</mat-icon>
      Export
    </button>
    <button
      [disabled]="retroboard?.creatorId !== userDetails?.uid"
      mat-raised-button color="accent"
      (click)="deleteRetro(deleteConfirmDialog)"
    >
      <mat-icon>delete</mat-icon>
      Delete
    </button>
    <button
      [disabled]="retroboard?.creatorId !== userDetails?.uid"
      mat-raised-button color="accent"
      (click)="openRetroboardDetailsModal()"
    >
      <mat-icon>edit</mat-icon>
      Edit
    </button>
  </mat-toolbar>
  <!-- Keep all ng-template dialogs unchanged -->
  ...
</div>
```

Add to `src/app/components/retroboard/retroboard.component.scss`:
```scss
.retroboard__columns {
  display: flex;
  flex-direction: row;
  gap: 5px;

  mat-card {
    flex: 1 1 33%;
  }

  @media (max-width: 768px) {
    flex-direction: column;
  }
}

.retroboard__note-item-inner {
  display: flex;
  flex-direction: column;
}

.retroboard__note--full,
.add-new-button--full {
  flex: 1;
  width: 100%;
}

.retroboard__action-bar-spacer {
  flex: 1;
}
```

- [ ] **Step 1.9: Update my-dashboard.component.html**

Replace `fxLayout` / `fxFlex` / `fxLayoutAlign` throughout:
```html
<div class="my-dashboard mat-typography">
  <div class="primary-header">
    <h1 *ngIf="displayName">{{ displayName }}'s Dashboard</h1>
  </div>
  <div class="my-dashboard__content">
    <mat-card class="my-dashboard__retrospectives">
      <mat-card-header class="my-dashboard__card-header">
        <mat-card-title class="card-title">My Retrospectives</mat-card-title>
        <div class="spacer"></div>
        <button mat-icon-button color="accent" (click)="openRetroBoardDetailsModal()"
          title="Create Retrospective" aria-label="Create Retrospective">
          <mat-icon>add_circle</mat-icon>
        </button>
      </mat-card-header>
      <mat-card-content class="my-dashboard__retrospectives-content">
        <ng-container *ngIf="retroboards; else loadingRetros">
          <mat-nav-list class="my-dashboard__nav-list" *ngIf="retroboards.length; else noRetros">
            <a mat-list-item *ngFor="let retroboard of retroboards; last as last"
              [routerLink]="['/retroboard/', retroboard.key]">
              <mat-icon mat-list-icon color="primary">note</mat-icon>
              <h4 mat-line>{{ retroboard.name }}</h4>
              <p mat-line>{{ retroboard.dateCreated | date }}</p>
              <mat-divider *ngIf="!last"></mat-divider>
            </a>
          </mat-nav-list>
          <mat-paginator [length]="total" [pageSize]="pageSize" [pageSizeOptions]="pageSizeOptions"
            (page)="handlePaginatorData($event)">
          </mat-paginator>
        </ng-container>
      </mat-card-content>
    </mat-card>
    <mat-card class="my-dashboard__favorites">
      <mat-card-header class="my-dashboard__card-header">
        <mat-card-title class="card-title">My Favorites</mat-card-title>
      </mat-card-header>
      <mat-card-content class="my-dashboard__favorites-content">
        <ng-container *ngIf="favorites; else loadingRetros">
          <mat-nav-list class="my-dashboard__nav-list" *ngIf="favorites.length; else noFavorites">
            <a mat-list-item *ngFor="let favorite of favorites; last as last"
              [routerLink]="['/retroboard/', favorite.key]">
              <mat-icon mat-list-icon color="primary">favorite</mat-icon>
              <h4 mat-line>{{ favorite.name }}</h4>
              <p mat-line>{{ favorite.dateCreated | date }}</p>
              <mat-divider *ngIf="!last"></mat-divider>
            </a>
          </mat-nav-list>
          <mat-paginator [length]="favoritesTotal" [pageSize]="favoritesPageSize"
            [pageSizeOptions]="favoritesPageSizeOptions" (page)="handleFavoritesPaginatorData($event)">
          </mat-paginator>
        </ng-container>
      </mat-card-content>
    </mat-card>
  </div>
</div>
<ng-template #loadingRetros>
  <div class="my-dashboard__loading-retros">
    <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
  </div>
</ng-template>
<ng-template #noRetros>
  <mat-list><mat-list-item>You have no retrospectives</mat-list-item></mat-list>
</ng-template>
<ng-template #noFavorites>
  <mat-list><mat-list-item>You have no favorites</mat-list-item></mat-list>
</ng-template>
```

Update `src/app/components/my-dashboard/my-dashboard.component.scss`:
```scss
.my-dashboard {
  overflow: hidden;

  .card-title {
    text-transform: uppercase;
    font-weight: 500;
    font-size: 14px;
    color: hsl(0, 0%, 45%);
    margin: 0;
  }

  .my-dashboard__loading-retros {
    min-height: 150px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .my-dashboard__content {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-evenly;
    align-items: flex-start;
  }

  .my-dashboard__card-header {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .spacer { flex: 1; }

  .my-dashboard__nav-list {
    display: flex;
    flex-direction: column;
  }
}

.my-dashboard__favorites,
.my-dashboard__retrospectives {
  margin: 20px 0;
}
```

- [ ] **Step 1.10: Update create-update-retro-modal — remove fxLayout**

Read the file first, then remove all `fxLayout`/`fxFlex`/`fxLayoutAlign` attributes, replacing with equivalent CSS classes. The modal uses a column form layout — add `class="modal-form-content"` to `mat-card-content` and add to its `.scss`:
```scss
.modal-form-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
```

- [ ] **Step 1.11: Verify build passes**

```bash
npx ng build --configuration=production 2>&1 | tail -20
```

Expected: `Build at:` line, no errors about `fxLayout` / `FlexLayoutModule`. Warnings about budget are acceptable.

- [ ] **Step 1.12: Commit**

```bash
git add -p
git commit -m "refactor: replace @ngbracket/ngx-layout with native CSS flex"
```

---

## Task 2: M3 Theme + ThemeService + Toggle

**Files:**
- Replace: `src/styles.scss`
- Delete: `src/_app-theme.scss`
- Create: `src/app/services/theme.service.ts`
- Create: `src/app/services/theme.service.spec.ts`
- Modify: `src/app/components/the-header/the-header.component.ts`
- Modify: `src/app/components/the-header/the-header.component.html`
- Modify: `angular.json`

- [ ] **Step 2.1: Write the failing ThemeService test**

Create `src/app/services/theme.service.spec.ts`:
```typescript
import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('light');
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
  });

  it('should default to dark mode when localStorage is empty', () => {
    expect(service.isDark).toBeTrue();
    expect(document.documentElement.classList.contains('light')).toBeFalse();
  });

  it('should restore light mode from localStorage', () => {
    localStorage.setItem('rm-color-scheme', 'light');
    // Re-create service to trigger constructor logic
    service = new ThemeService();
    expect(service.isDark).toBeFalse();
    expect(document.documentElement.classList.contains('light')).toBeTrue();
  });

  it('should toggle from dark to light', () => {
    expect(service.isDark).toBeTrue();
    service.toggle();
    expect(service.isDark).toBeFalse();
    expect(document.documentElement.classList.contains('light')).toBeTrue();
    expect(localStorage.getItem('rm-color-scheme')).toBe('light');
  });

  it('should toggle from light to dark', () => {
    service.toggle(); // dark → light
    service.toggle(); // light → dark
    expect(service.isDark).toBeTrue();
    expect(document.documentElement.classList.contains('light')).toBeFalse();
    expect(localStorage.getItem('rm-color-scheme')).toBe('dark');
  });
});
```

- [ ] **Step 2.2: Run test to verify it fails**

```bash
npx ng test --include='**/theme.service.spec.ts' --watch=false 2>&1 | tail -20
```

Expected: FAILED — `ThemeService` not found.

- [ ] **Step 2.3: Implement ThemeService**

Create `src/app/services/theme.service.ts`:
```typescript
import { Injectable } from '@angular/core';

const STORAGE_KEY = 'rm-color-scheme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  isDark: boolean;

  constructor() {
    const stored = localStorage.getItem(STORAGE_KEY);
    this.isDark = stored !== 'light';
    this._apply();
  }

  toggle(): void {
    this.isDark = !this.isDark;
    localStorage.setItem(STORAGE_KEY, this.isDark ? 'dark' : 'light');
    this._apply();
  }

  private _apply(): void {
    if (this.isDark) {
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
    }
  }
}
```

- [ ] **Step 2.4: Run test to verify it passes**

```bash
npx ng test --include='**/theme.service.spec.ts' --watch=false 2>&1 | tail -20
```

Expected: 4 specs, 0 failures.

- [ ] **Step 2.5: Replace styles.scss with M3 theme**

Overwrite `src/styles.scss`:
```scss
@use '@angular/material' as mat;

@include mat.core();

// Dark theme (default) — violet seed
$rm-dark: mat.define-theme((
  color: (
    theme-type: dark,
    primary: mat.$violet-palette,
  ),
));

// Light theme — same seed, different type
$rm-light: mat.define-theme((
  color: (
    theme-type: light,
    primary: mat.$violet-palette,
  ),
));

// Apply dark theme globally
html {
  @include mat.all-component-themes($rm-dark);

  // Override M3 surface tokens with our custom dark palette
  --mat-sys-background: #13132a;
  --mat-sys-surface: #1e1e38;
  --mat-sys-surface-variant: #2d2d44;
  --mat-sys-on-surface: #e2e8f0;
  --mat-sys-on-surface-variant: #94a3b8;
}

// Switch to light theme with .light class on <html>
html.light {
  @include mat.all-component-colors($rm-light);

  --mat-sys-background: #f8fafc;
  --mat-sys-surface: #ffffff;
  --mat-sys-surface-variant: #f1f5f9;
  --mat-sys-on-surface: #1e293b;
  --mat-sys-on-surface-variant: #64748b;
}

// Global base styles
body {
  margin: 0;
  font-family: Roboto, 'Helvetica Neue', sans-serif;
  background-color: var(--mat-sys-background);
  color: var(--mat-sys-on-surface);
}

// Primary header (retro title bar)
.primary-header {
  background-color: var(--mat-sys-surface);
  height: 64px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--mat-sys-surface-variant);

  h1 {
    flex: 1;
    font-weight: 500;
    font-size: 20px;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--mat-sys-on-surface);
  }
}

// Dialog container
.custom-dialog-container .mat-mdc-dialog-container {
  padding: 0;
}
```

> **Note:** If `mat.$violet-palette` causes a Sass compile error, check the available palettes in `node_modules/@angular/material/core/theming/_palettes.scss` and substitute the closest purple — likely `mat.$deep-purple-palette`.

- [ ] **Step 2.6: Delete the M2 theme file**

```bash
rm src/_app-theme.scss
```

- [ ] **Step 2.7: Remove the 4 lazy theme bundles from angular.json**

In `angular.json`, under `projects.agile-retrospective.architect.build.options.styles`, remove the four objects for `pink-bluegrey`, `deeppurple-amber`, `indigo-pink`, and `purple-green`, leaving only:
```json
"styles": [
  {
    "input": "src/styles.scss"
  }
]
```

- [ ] **Step 2.8: Delete the 4 CSS theme asset files**

```bash
rm src/assets/deeppurple-amber.css src/assets/indigo-pink.css src/assets/pink-bluegrey.css src/assets/purple-green.css
```

- [ ] **Step 2.9: Add dark/light toggle to TheHeaderComponent**

Update `src/app/components/the-header/the-header.component.ts` — inject `ThemeService`:
```typescript
import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  standalone: false,
  selector: 'app-the-header',
  templateUrl: './the-header.component.html',
  styleUrls: ['./the-header.component.scss'],
})
export class TheHeaderComponent {
  constructor(public authService: AuthService, public themeService: ThemeService) {}

  logout() {
    this.authService.logout();
  }
}
```

- [ ] **Step 2.10: Update the-header.component.html — add toggle, remove theme-picker**

Replace the desktop nav `<span>` content:
```html
<mat-toolbar class="the-header" color="primary">
  <span class="title">RetroMatic</span>
  <span class="spacer"></span>
  <span class="the-header__desktop-nav">
    <button *ngIf="authService.isLoggedIn()" mat-button [routerLink]="['/home']">My Dashboard</button>
    <button mat-icon-button (click)="themeService.toggle()" [title]="themeService.isDark ? 'Switch to light mode' : 'Switch to dark mode'" aria-label="Toggle colour scheme">
      <mat-icon>{{ themeService.isDark ? 'light_mode' : 'dark_mode' }}</mat-icon>
    </button>
    <a mat-button href="https://github.com/wordythebyrd/RetroMatic" target="_blank" aria-label="GitHub Repository">
      <img class="the-header__github-logo" src="../../assets/github-circle-white-transparent.svg" alt="github" />
      GitHub
    </a>
    <button *ngIf="authService.isLoggedIn()" mat-button (click)="logout()">Log out</button>
  </span>
  <span class="the-header__mobile-nav">
    <button mat-icon-button (click)="themeService.toggle()" aria-label="Toggle colour scheme">
      <mat-icon>{{ themeService.isDark ? 'light_mode' : 'dark_mode' }}</mat-icon>
    </button>
    <button mat-icon-button [matMenuTriggerFor]="appMenu">
      <mat-icon>more_vert</mat-icon>
    </button>
    <mat-menu #appMenu="matMenu">
      <button *ngIf="authService.isLoggedIn()" mat-menu-item [routerLink]="['/home']">My Dashboard</button>
      <a mat-menu-item href="https://github.com/wordythebyrd/RetroMatic" target="_blank">GitHub</a>
      <button *ngIf="authService.isLoggedIn()" mat-menu-item (click)="logout()">Log out</button>
    </mat-menu>
  </span>
</mat-toolbar>
```

- [ ] **Step 2.11: Verify build and visual**

```bash
npx ng build --configuration=production 2>&1 | tail -20
```

Then run `npm start` and verify:
- App loads with dark background
- Toggle icon appears in header
- Clicking toggle switches to light theme and back
- Preference survives page refresh

- [ ] **Step 2.12: Commit**

```bash
git add src/styles.scss src/_app-theme.scss src/app/services/theme.service.ts src/app/services/theme.service.spec.ts src/app/components/the-header/ angular.json src/assets/
git commit -m "feat: replace M2 theme system with M3 dark/light toggle"
```

---

## Task 3: RetroStateService

**Files:**
- Create: `src/app/services/retro-state.service.ts`

This service is a thin bridge so `RetroBoardComponent` can inform `SidebarComponent` (which lives in the parent shell) of the currently active retro.

- [ ] **Step 3.1: Create RetroStateService**

Create `src/app/services/retro-state.service.ts`:
```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Retroboard } from '../types';

@Injectable({ providedIn: 'root' })
export class RetroStateService {
  private _retroboard = new BehaviorSubject<Retroboard | null>(null);
  readonly retroboard$ = this._retroboard.asObservable();

  setRetroboard(retro: Retroboard | null): void {
    this._retroboard.next(retro);
  }
}
```

- [ ] **Step 3.2: Wire RetroStateService into RetroBoardComponent**

In `src/app/components/retroboard/retroboard.component.ts`:

Add import: `import { RetroStateService } from '../../services/retro-state.service';`

Add to constructor: `private retroStateService: RetroStateService`

In `getRetroboard()`, after `this.retroboard = retroboard;` add:
```typescript
this.retroStateService.setRetroboard(retroboard);
```

In `ngOnDestroy()`, after `this.ngUnsubscribe.next(null);` add:
```typescript
this.retroStateService.setRetroboard(null);
```

- [ ] **Step 3.3: Fix delete navigation — /home → /app**

In `retroboard.component.ts`, find `deleteRetro`:
```typescript
deleteRetro(template: TemplateRef<any>) {
  const dialogRef = this.dialog.open(template);
  dialogRef.afterClosed().subscribe(confirmed => {
    if (confirmed) {
      this.retroboardService.deleteRetroboard(this.retroboard).then(() => this.router.navigate(['/app']));
    }
  });
}
```

- [ ] **Step 3.4: Commit**

```bash
git add src/app/services/retro-state.service.ts src/app/components/retroboard/retroboard.component.ts
git commit -m "feat: add RetroStateService; fix delete navigation /home → /app"
```

---

## Task 4: AppShellComponent + Routing Refactor

**Files:**
- Create: `src/app/components/app-shell/app-shell.component.ts|html|scss`
- Modify: `src/app/app.module.ts`

- [ ] **Step 4.1: Create AppShellComponent**

Create `src/app/components/app-shell/app-shell.component.ts`:
```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { RetroStateService } from '../../services/retro-state.service';
import { Retroboard } from '../../types';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  standalone: false,
  selector: 'app-shell',
  templateUrl: './app-shell.component.html',
  styleUrls: ['./app-shell.component.scss'],
})
export class AppShellComponent implements OnInit, OnDestroy {
  sidebarCollapsed = false;
  currentRetroboard: Retroboard | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    public authService: AuthService,
    private retroStateService: RetroStateService,
  ) {}

  ngOnInit() {
    this.retroStateService.retroboard$
      .pipe(takeUntil(this.destroy$))
      .subscribe(retro => (this.currentRetroboard = retro));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
}
```

Create `src/app/components/app-shell/app-shell.component.html`:
```html
<div class="app-shell" [class.app-shell--guest]="!authService.isLoggedIn()">
  <ng-container *ngIf="authService.isLoggedIn(); else guestLayout">
    <!-- Authenticated layout: sidebar + content -->
    <app-sidebar
      [collapsed]="sidebarCollapsed"
      [currentRetroboard]="currentRetroboard"
      (toggleCollapse)="toggleSidebar()"
    ></app-sidebar>
    <main class="app-shell__content" [class.app-shell__content--collapsed]="sidebarCollapsed">
      <router-outlet></router-outlet>
    </main>
  </ng-container>

  <ng-template #guestLayout>
    <!-- Guest layout: slim top bar + full-width content -->
    <header class="app-shell__guest-bar">
      <span class="app-shell__guest-title">RetroMatic</span>
      <span class="app-shell__guest-retro-name">{{ currentRetroboard?.name }}</span>
      <button mat-icon-button (click)="themeService.toggle()"
        *ngIf="false"><!-- ThemeService not injected here yet; toggle is in header -->
      </button>
    </header>
    <main class="app-shell__content app-shell__content--full">
      <router-outlet></router-outlet>
    </main>
  </ng-template>
</div>
```

> **Note:** The guest layout's dark/light toggle is handled by `TheHeaderComponent` which still renders above the shell. The guest bar is supplemental — retro name only. If you want to fully remove TheHeaderComponent for guests, that is a later refinement.

Create `src/app/components/app-shell/app-shell.component.scss`:
```scss
.app-shell {
  display: flex;
  height: 100%;
  overflow: hidden;

  &__content {
    flex: 1;
    overflow: auto;
    transition: margin-left 0.2s ease;

    &--full {
      width: 100%;
    }
  }

  &__guest-bar {
    display: none; // handled by TheHeaderComponent for now
  }
}
```

- [ ] **Step 4.2: Update routing in app.module.ts**

Replace `appRoutes` in `src/app/app.module.ts`:
```typescript
const appRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'resetpassword', component: ResetPasswordComponent },
  {
    path: 'app',
    component: AppShellComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'retro/:id', component: RetroBoardComponent },
      { path: '', component: WelcomeComponent },
    ],
  },
  // Legacy redirects
  { path: 'home', redirectTo: '/app', pathMatch: 'full' },
  { path: 'retroboard/:id', redirectTo: '/app/retro/:id', pathMatch: 'full' },
  { path: '', redirectTo: '/app', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent },
];
```

Add to `declarations` in the `@NgModule`: `AppShellComponent`, `WelcomeComponent`

Add to imports: `MatSidenavModule` (for potential future use), and ensure `RouterModule.forRoot(appRoutes, { enableTracing: false })` is updated.

Remove `AuthGuard` from individual route entries (now on the shell).

- [ ] **Step 4.3: Verify routing works**

```bash
npm start
```

Navigate to `/app` — should see a blank shell (no sidebar yet, WelcomeComponent not created). No console errors.

- [ ] **Step 4.4: Commit**

```bash
git add src/app/components/app-shell/ src/app/app.module.ts
git commit -m "feat: add AppShellComponent and shell-based routing"
```

---

## Task 5: SidebarComponent

**Files:**
- Create: `src/app/components/sidebar/sidebar.component.ts|html|scss`
- Modify: `src/app/app.module.ts` (add SidebarComponent to declarations + add needed Material modules)

The sidebar absorbs the retro-list and favorites logic from `MyDashboardComponent`.

- [ ] **Step 5.1: Create SidebarComponent**

Create `src/app/components/sidebar/sidebar.component.ts`:
```typescript
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Database, ref, list, objectVal, query, orderByChild, equalTo, get, set } from '@angular/fire/database';
import { MatDialog } from '@angular/material/dialog';
import { Subject, Subscription } from 'rxjs';
import { filter, map, take, takeUntil } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { RetroboardService } from '../../services/retroboard.service';
import { ExportService } from '../../services/export.service';
import { Retroboard } from '../../types';
import { CreateUpdateRetroModalComponent } from '../create-update-retro-modal/create-update-retro-modal.component';

@Component({
  standalone: false,
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() collapsed = false;
  @Input() currentRetroboard: Retroboard | null = null;
  @Output() toggleCollapse = new EventEmitter<void>();

  retroboards: Retroboard[] = [];
  favorites: Retroboard[] = [];
  userDetails: any;

  private destroy$ = new Subject<void>();
  private retroSub: Subscription;
  private favSub: Subscription;

  constructor(
    public authService: AuthService,
    private retroboardService: RetroboardService,
    private exportService: ExportService,
    private db: Database,
    private dialog: MatDialog,
    private router: Router,
  ) {}

  ngOnInit() {
    this.authService.user$
      .pipe(filter(u => u != null), take(1))
      .subscribe(user => {
        this.userDetails = { uid: user.uid, email: user.email };
        this.loadRetroboards();
        this.loadFavorites();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.retroSub?.unsubscribe();
    this.favSub?.unsubscribe();
  }

  get isOwner(): boolean {
    return !!this.currentRetroboard &&
      !!this.userDetails &&
      this.currentRetroboard.creatorId === this.userDetails.uid;
  }

  get hasRetroOpen(): boolean {
    return this.currentRetroboard !== null;
  }

  loadRetroboards() {
    this.retroSub = this.retroboardService.getRetroboards()
      .pipe(takeUntil(this.destroy$))
      .subscribe(retros => {
        this.retroboards = [...retros].sort(
          (a, b) => new Date(b.dateCreated || 0).getTime() - new Date(a.dateCreated || 0).getTime()
        ).slice(0, 10);
      });
  }

  async loadFavorites() {
    const snap = await get(ref(this.db, `/users/${this.userDetails.uid}/favorites`));
    const idx: { [key: string]: boolean } = snap.val() || {};
    const favKeys = Object.keys(idx).filter(k => idx[k]);
    this.favSub = list(ref(this.db, '/retroboards'))
      .pipe(
        map(changes => changes.map(c => ({ key: c.snapshot.key, ...(c.snapshot.val() as any) }))),
        takeUntil(this.destroy$)
      )
      .subscribe(all => {
        this.favorites = all.filter(r => favKeys.includes(r.key)).slice(0, 5);
      });
  }

  openCreateModal() {
    this.dialog.open(CreateUpdateRetroModalComponent, {
      panelClass: 'custom-dialog-container',
    });
  }

  navigateTo(key: string) {
    this.router.navigate(['/app/retro', key]);
  }

  async toggleFavorite() {
    if (!this.currentRetroboard || !this.userDetails) return;
    const favRef = ref(this.db, `/users/${this.userDetails.uid}/favorites/${this.currentRetroboard.key}`);
    const snap = await get(favRef);
    await set(favRef, snap.exists() ? !snap.val() : true);
    this.loadFavorites();
  }

  openExport() {
    // ExportService requires the jsonData built by RetroBoardComponent.
    // For now, navigate — full export wiring done in Task 6.
  }

  openEdit() {
    if (!this.currentRetroboard) return;
    this.dialog.open(CreateUpdateRetroModalComponent, {
      panelClass: 'custom-dialog-container',
      data: { retroboard: this.currentRetroboard },
    });
  }
}
```

- [ ] **Step 5.2: Create sidebar.component.html**

Create `src/app/components/sidebar/sidebar.component.html`:
```html
<nav class="sidebar" [class.sidebar--collapsed]="collapsed">
  <div class="sidebar__header">
    <span class="sidebar__logo" *ngIf="!collapsed">RetroMatic</span>
    <button mat-icon-button class="sidebar__toggle" (click)="toggleCollapse.emit()" aria-label="Toggle sidebar">
      <mat-icon>{{ collapsed ? 'menu' : 'menu_open' }}</mat-icon>
    </button>
  </div>

  <ng-container *ngIf="!collapsed">
    <div class="sidebar__section-label">My Retros</div>
    <mat-nav-list class="sidebar__nav-list">
      <a mat-list-item
        *ngFor="let retro of retroboards"
        (click)="navigateTo(retro.key)"
        [class.sidebar__nav-item--active]="retro.key === currentRetroboard?.key"
        class="sidebar__nav-item">
        <span mat-line class="sidebar__nav-item-text">{{ retro.name }}</span>
      </a>
    </mat-nav-list>
    <button mat-button class="sidebar__new-retro-btn" (click)="openCreateModal()">
      <mat-icon>add</mat-icon> New Retro
    </button>

    <div class="sidebar__section-label" *ngIf="favorites.length">Favorites</div>
    <mat-nav-list class="sidebar__nav-list" *ngIf="favorites.length">
      <a mat-list-item
        *ngFor="let fav of favorites"
        (click)="navigateTo(fav.key)"
        class="sidebar__nav-item">
        <mat-icon mat-list-icon class="sidebar__fav-icon">favorite</mat-icon>
        <span mat-line class="sidebar__nav-item-text">{{ fav.name }}</span>
      </a>
    </mat-nav-list>

    <div class="sidebar__actions" *ngIf="hasRetroOpen">
      <mat-divider></mat-divider>
      <button mat-button class="sidebar__action-btn" (click)="toggleFavorite()">
        <mat-icon>favorite_border</mat-icon> Favorite
      </button>
      <button mat-button class="sidebar__action-btn" (click)="openExport()">
        <mat-icon>save_alt</mat-icon> Export
      </button>
      <button mat-button class="sidebar__action-btn" (click)="openEdit()" [disabled]="!isOwner">
        <mat-icon>edit</mat-icon> Edit
      </button>
      <button mat-button class="sidebar__action-btn sidebar__action-btn--danger"
        [disabled]="!isOwner"
        (click)="openDelete()">
        <mat-icon>delete</mat-icon> Delete
      </button>
    </div>
  </ng-container>

  <ng-container *ngIf="collapsed">
    <button mat-icon-button (click)="openCreateModal()" title="New Retro"><mat-icon>add</mat-icon></button>
    <ng-container *ngIf="hasRetroOpen">
      <button mat-icon-button (click)="toggleFavorite()" title="Favorite"><mat-icon>favorite_border</mat-icon></button>
      <button mat-icon-button (click)="openEdit()" [disabled]="!isOwner" title="Edit"><mat-icon>edit</mat-icon></button>
    </ng-container>
  </ng-container>
</nav>
```

- [ ] **Step 5.3: Create sidebar.component.scss**

Create `src/app/components/sidebar/sidebar.component.scss`:
```scss
.sidebar {
  width: 200px;
  min-height: 100%;
  background-color: var(--mat-sys-surface);
  border-right: 1px solid var(--mat-sys-surface-variant);
  display: flex;
  flex-direction: column;
  padding: 12px 8px;
  flex-shrink: 0;
  transition: width 0.2s ease;
  overflow: hidden;

  &--collapsed {
    width: 56px;
    align-items: center;
    padding: 12px 4px;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  &__logo {
    font-weight: 800;
    font-size: 15px;
    color: var(--mdc-theme-primary, #a78bfa);
    letter-spacing: -0.5px;
    white-space: nowrap;
  }

  &__section-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: var(--mat-sys-on-surface-variant);
    padding: 8px 8px 4px;
    margin-top: 8px;
  }

  &__nav-list {
    padding: 0;
    margin-bottom: 4px;
  }

  &__nav-item {
    border-radius: 6px;
    margin-bottom: 2px;

    &--active {
      background-color: var(--mdc-theme-primary, #7c3aed) !important;
      color: #fff !important;
    }
  }

  &__nav-item-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 13px;
  }

  &__new-retro-btn {
    width: 100%;
    text-align: left;
    color: var(--mdc-theme-primary, #a78bfa);
    font-size: 12px;
    margin: 4px 0 8px;
  }

  &__fav-icon {
    font-size: 16px;
    color: var(--mdc-theme-primary, #a78bfa);
  }

  &__actions {
    margin-top: auto;
    padding-top: 8px;

    mat-divider {
      margin-bottom: 8px;
    }
  }

  &__action-btn {
    width: 100%;
    text-align: left;
    font-size: 12px;
    color: var(--mat-sys-on-surface-variant);
    border-radius: 6px;
    margin-bottom: 2px;

    mat-icon {
      font-size: 16px;
      margin-right: 6px;
    }

    &--danger {
      color: #f87171;
    }

    &:disabled {
      opacity: 0.35;
    }
  }

  @media (max-width: 768px) {
    position: fixed;
    left: 0;
    top: 64px;
    bottom: 0;
    z-index: 100;
    transform: translateX(-100%);
    transition: transform 0.2s ease;
    width: 240px !important;

    &--open {
      transform: translateX(0);
      box-shadow: 4px 0 16px rgba(0, 0, 0, 0.4);
    }
  }
}
```

- [ ] **Step 5.4: Add SidebarComponent to app.module.ts**

Add `SidebarComponent` to `declarations`. Add `MatDividerModule` and `MatSidenavModule` to `imports` if not already present.

```typescript
import { MatDividerModule } from '@angular/material/divider';
// Add MatDividerModule to imports array
```

- [ ] **Step 5.5: Add openDelete to SidebarComponent**

Add the delete method to `sidebar.component.ts` (uses a confirmation dialog inline):
```typescript
import { MatDialogRef } from '@angular/material/dialog';

openDelete() {
  if (!this.currentRetroboard || !this.isOwner) return;
  const confirmed = window.confirm(`Delete "${this.currentRetroboard.name}"? This cannot be undone.`);
  if (confirmed) {
    this.retroboardService.deleteRetroboard(this.currentRetroboard)
      .then(() => this.router.navigate(['/app']));
  }
}
```

> **Note:** Uses `window.confirm` temporarily. A proper `MatDialog` confirmation can replace this in a follow-up.

- [ ] **Step 5.6: Verify sidebar renders**

Run `npm start`. Log in, navigate to `/app`. Sidebar should render with retro list. Clicking a retro should navigate to `/app/retro/:id`.

- [ ] **Step 5.7: Commit**

```bash
git add src/app/components/sidebar/ src/app/components/app-shell/ src/app/app.module.ts
git commit -m "feat: add SidebarComponent with retro list, favorites, and per-retro actions"
```

---

## Task 6: WelcomeComponent + Delete MyDashboardComponent

**Files:**
- Create: `src/app/components/welcome/welcome.component.ts|html|scss`
- Delete: `src/app/components/my-dashboard/` (all 4 files)
- Modify: `src/app/app.module.ts`

- [ ] **Step 6.1: Create WelcomeComponent**

Create `src/app/components/welcome/welcome.component.ts`:
```typescript
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateUpdateRetroModalComponent } from '../create-update-retro-modal/create-update-retro-modal.component';

@Component({
  standalone: false,
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
})
export class WelcomeComponent {
  constructor(private dialog: MatDialog) {}

  createRetro() {
    this.dialog.open(CreateUpdateRetroModalComponent, {
      panelClass: 'custom-dialog-container',
    });
  }
}
```

Create `src/app/components/welcome/welcome.component.html`:
```html
<div class="welcome">
  <div class="welcome__icon">📋</div>
  <h2 class="welcome__title">No retrospective open</h2>
  <p class="welcome__subtitle">Select one from the sidebar or create a new one.</p>
  <button mat-raised-button color="primary" (click)="createRetro()">
    <mat-icon>add</mat-icon>
    Create Retrospective
  </button>
</div>
```

Create `src/app/components/welcome/welcome.component.scss`:
```scss
.welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  gap: 12px;

  &__icon {
    font-size: 48px;
    line-height: 1;
  }

  &__title {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: var(--mat-sys-on-surface);
  }

  &__subtitle {
    margin: 0;
    color: var(--mat-sys-on-surface-variant);
    font-size: 14px;
  }
}
```

- [ ] **Step 6.2: Delete MyDashboardComponent**

```bash
rm src/app/components/my-dashboard/my-dashboard.component.ts
rm src/app/components/my-dashboard/my-dashboard.component.html
rm src/app/components/my-dashboard/my-dashboard.component.scss
rmdir src/app/components/my-dashboard
```

- [ ] **Step 6.3: Update app.module.ts**

- Remove `MyDashboardComponent` from `declarations`
- Remove `import { MyDashboardComponent }` statement
- Add `WelcomeComponent` to `declarations`
- Add `import { WelcomeComponent }` statement

- [ ] **Step 6.4: Verify**

```bash
npx ng build --configuration=production 2>&1 | tail -20
```

Expected: No errors about `MyDashboardComponent`. Navigate to `/app` — WelcomeComponent renders.

- [ ] **Step 6.5: Commit**

```bash
git add src/app/components/welcome/ src/app/app.module.ts
git commit -m "feat: add WelcomeComponent; delete MyDashboardComponent"
```

---

## Task 7: Retroboard Redesign

**Files:**
- Modify: `src/app/components/retroboard/retroboard.component.html`
- Modify: `src/app/components/retroboard/retroboard.component.scss`
- Modify: `src/app/components/retroboard/retroboard.component.ts`

This replaces the existing note card + action bar layout with the approved design: vote row at bottom of card, bucket-tinted "+ Add" in column header, no action bar (actions moved to sidebar).

The sidebar handles Favorite/Export/Edit/Delete. `RetroBoardComponent` no longer needs those methods **except** `toggleFavorite` and `openExportModal` which the sidebar will call. For now we keep them in `RetroBoardComponent` and call them via the sidebar's `openExport()` / `toggleFavorite()` — the wiring is deferred. They will be dead code until Task 5's `openExport` is finished, which is fine.

- [ ] **Step 7.1: Replace retroboard.component.html**

Full replacement of `src/app/components/retroboard/retroboard.component.html`:
```html
<div class="retroboard mat-typography">
  <div class="retroboard__columns">
    <div class="retroboard__column" *ngFor="let bucket of buckets$ | async">
      <div class="retroboard__column-header" [ngClass]="'retroboard__column-header--' + bucket.type">
        <span class="retroboard__column-name">{{ bucket.name }}</span>
        <button
          mat-button
          class="retroboard__add-btn"
          [ngClass]="'retroboard__add-btn--' + bucket.type"
          (click)="openModal(addtemplate, bucket)"
          title="Add entry to {{ bucket.name }}"
          aria-label="Add entry">
          + Add
        </button>
      </div>

      <app-transition-group class="retroboard__notes">
        <div
          appTransitionGroupItem
          class="retroboard__note-card mat-elevation-z1"
          *ngFor="let note of bucket.notes$ | async; trackBy: trackByFn"
          (click)="openModal(edittemplate, bucket, note)">
          <p class="retroboard__note-text">{{ note.message }}</p>
          <div class="retroboard__vote-row" (click)="$event.stopPropagation()">
            <button
              mat-button
              class="retroboard__vote-btn"
              [ngClass]="hasVoted(note.votes, true) ? 'retroboard__vote-btn--up-active--' + bucket.type : ''"
              title="Vote Up"
              aria-label="Vote Up"
              (click)="upvote(bucket, note)">
              ▲ {{ getUpvotes(note.votes) }}
            </button>
            <button
              mat-button
              class="retroboard__vote-btn"
              [ngClass]="hasVoted(note.votes, false) ? 'retroboard__vote-btn--down-active' : ''"
              title="Vote Down"
              aria-label="Vote Down"
              (click)="downvote(bucket, note)">
              ▼ {{ getDownvotes(note.votes) }}
            </button>
          </div>
        </div>
      </app-transition-group>
    </div>
  </div>
</div>

<!-- Add note dialog -->
<ng-template #addtemplate>
  <mat-card>
    <mat-card-header style="display:flex;flex-direction:row;justify-content:space-between;align-items:flex-start;">
      <mat-card-title>Add entry to <strong>{{ activeBucket.name }}</strong></mat-card-title>
      <button mat-icon-button mat-dialog-close><mat-icon aria-label="Close">close</mat-icon></button>
    </mat-card-header>
    <mat-card-content>
      <mat-form-field style="width:100%">
        <textarea
          (keydown.shift.enter)="addNote(addmessage.value); (false)"
          matInput #addmessage cdkFocusInitial cdkTextareaAutosize></textarea>
      </mat-form-field>
    </mat-card-content>
    <mat-card-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="addNote(addmessage.value)">Add</button>
    </mat-card-actions>
  </mat-card>
</ng-template>

<!-- Edit note dialog -->
<ng-template #edittemplate>
  <mat-card>
    <mat-card-header style="display:flex;flex-direction:row;justify-content:space-between;align-items:flex-start;">
      <mat-card-title>Edit entry in <strong>{{ activeBucket.name }}</strong></mat-card-title>
      <button mat-icon-button mat-dialog-close><mat-icon aria-label="Close">close</mat-icon></button>
    </mat-card-header>
    <mat-card-content>
      <mat-form-field style="width:100%">
        <textarea
          [readonly]="activeNote?.creatorId !== userDetails?.uid && retroboard?.creatorId !== userDetails?.uid"
          (keydown.shift.enter)="updateNote(editmessage.value); (false)"
          matInput #editmessage cdkTextareaAutosize cdkFocusInitial
          [value]="activeNote.message"></textarea>
      </mat-form-field>
    </mat-card-content>
    <mat-card-actions class="retroboard__edit-actions" align="end">
      <button
        [disabled]="activeNote?.creatorId !== userDetails?.uid && retroboard?.creatorId !== userDetails?.uid"
        mat-button color="warn" (click)="deleteNote()">Delete</button>
      <button mat-button mat-dialog-close>Cancel</button>
      <button
        [disabled]="activeNote?.creatorId !== userDetails?.uid && retroboard?.creatorId !== userDetails?.uid"
        mat-raised-button color="primary" (click)="updateNote(editmessage.value)">Update</button>
    </mat-card-actions>
  </mat-card>
</ng-template>

<!-- Export dialog -->
<ng-template #exporttemplate>
  <mat-card>
    <mat-card-header style="display:flex;flex-direction:row;justify-content:space-between;align-items:flex-start;">
      <h2 mat-dialog-title>Export HTML</h2>
      <button mat-icon-button mat-dialog-close><mat-icon aria-label="Close">close</mat-icon></button>
    </mat-card-header>
    <mat-card-content>
      <div id="html-container" [innerHTML]="htmlExport"></div>
    </mat-card-content>
    <mat-card-actions align="end">
      <button mat-button mat-dialog-close color="primary">Close</button>
      <button mat-raised-button color="primary" (click)="copyText()">Copy to Clipboard</button>
    </mat-card-actions>
  </mat-card>
</ng-template>
```

- [ ] **Step 7.2: Add helper methods to retroboard.component.ts**

Add these two methods (used in the template's vote display):
```typescript
getUpvotes(votes: { [uid: string]: boolean }): number {
  if (!votes) return 0;
  return Object.values(votes).filter(v => v === true).length;
}

getDownvotes(votes: { [uid: string]: boolean }): number {
  if (!votes) return 0;
  return Object.values(votes).filter(v => v === false).length;
}
```

- [ ] **Step 7.3: Replace retroboard.component.scss**

Full replacement of `src/app/components/retroboard/retroboard.component.scss`:
```scss
.retroboard {
  padding: 16px;
  height: 100%;
  overflow: auto;

  &__columns {
    display: flex;
    flex-direction: row;
    gap: 12px;
    align-items: flex-start;

    @media (max-width: 768px) {
      flex-direction: column;
    }
  }

  &__column {
    flex: 1 1 0;
    min-width: 0;
    background-color: var(--mat-sys-surface);
    border-radius: 12px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__column-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 4px;
  }

  &__column-name {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
  }

  // Bucket type colours
  &__column-header--success &__column-name { color: #a78bfa; }
  &__column-header--danger  &__column-name { color: #f87171; }
  &__column-header--info    &__column-name { color: #60a5fa; }

  &__add-btn {
    font-size: 11px;
    padding: 2px 8px;
    min-width: 0;
    border-radius: 5px;
    line-height: 24px;

    &--success { color: #a78bfa; background: rgba(167, 139, 250, 0.1); }
    &--danger  { color: #f87171; background: rgba(248, 113, 113, 0.1); }
    &--info    { color: #60a5fa; background: rgba(96,  165, 250, 0.1); }
  }

  &__notes {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__note-card {
    background-color: var(--mat-sys-surface-variant);
    border-radius: 8px;
    padding: 10px 12px 6px;
    cursor: pointer;
    transition: box-shadow 0.15s ease;

    &:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }
  }

  &__note-text {
    margin: 0 0 8px;
    font-size: 13px;
    line-height: 1.5;
    white-space: pre-wrap;
    color: var(--mat-sys-on-surface);
  }

  &__vote-row {
    display: flex;
    align-items: center;
    gap: 4px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    padding-top: 5px;
  }

  &__vote-btn {
    font-size: 11px;
    padding: 2px 8px;
    min-width: 0;
    border-radius: 4px;
    color: var(--mat-sys-on-surface-variant);
    line-height: 22px;

    // Active upvote — colour matches bucket type (applied via ngClass)
    &--up-active--success { background: rgba(167, 139, 250, 0.2); color: #a78bfa; }
    &--up-active--danger  { background: rgba(248, 113, 113, 0.2); color: #f87171; }
    &--up-active--info    { background: rgba(96,  165, 250, 0.2); color: #60a5fa; }

    // Active downvote
    &--down-active { background: rgba(248, 113, 113, 0.15); color: #f87171; }
  }

  &__edit-actions {
    display: flex;
    flex-wrap: wrap;
  }
}

#html-container {
  border: 1px solid var(--mat-sys-surface-variant);
  border-radius: 4px;
  overflow: auto;
  height: 250px;
  font-size: 13px;
}

.retro__notes-move {
  transition: transform 1s;
}
```

- [ ] **Step 7.4: Verify retroboard renders correctly**

```bash
npm start
```

Navigate to an existing retro via the sidebar. Verify:
- Three columns render with bucket-coloured headers
- Notes show vote row at bottom
- "+ Add" button is in each column header
- Clicking a note opens the edit dialog
- Upvote/downvote changes the button colour

- [ ] **Step 7.5: Commit**

```bash
git add src/app/components/retroboard/
git commit -m "feat: redesign retroboard — M3 note cards, vote row, remove action bar"
```

---

## Task 8: Export Wiring (Sidebar → RetroBoardComponent)

The sidebar's `openExport()` is currently a stub. Wire it up by having `SidebarComponent` emit an event that `AppShellComponent` relays to `RetroBoardComponent` — OR, simpler: move the export template into a standalone dialog that `SidebarComponent` opens directly.

**Simpler approach:** Create an `ExportDialogComponent` and call it from both sidebar and retroboard directly.

- [ ] **Step 8.1: Create ExportDialogComponent**

Create `src/app/components/export-dialog/export-dialog.component.ts`:
```typescript
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  standalone: false,
  selector: 'app-export-dialog',
  template: `
    <mat-card>
      <mat-card-header style="display:flex;flex-direction:row;justify-content:space-between;align-items:flex-start;">
        <h2 mat-dialog-title>Export HTML</h2>
        <button mat-icon-button mat-dialog-close><mat-icon>close</mat-icon></button>
      </mat-card-header>
      <mat-card-content>
        <div id="html-container" [innerHTML]="data.html"></div>
      </mat-card-content>
      <mat-card-actions align="end">
        <button mat-button mat-dialog-close>Close</button>
        <button mat-raised-button color="primary" (click)="copy()">Copy to Clipboard</button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    #html-container {
      border: 1px solid var(--mat-sys-surface-variant);
      border-radius: 4px;
      overflow: auto;
      height: 250px;
      font-size: 13px;
    }
  `],
})
export class ExportDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { html: string }) {}

  copy() {
    const el = document.getElementById('html-container');
    if (!el || !window.getSelection) return;
    const range = document.createRange();
    range.selectNode(el);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand('copy');
  }
}
```

- [ ] **Step 8.2: Update SidebarComponent.openExport()**

In `sidebar.component.ts`:

Add import: `import { ExportDialogComponent } from '../export-dialog/export-dialog.component';`

Add import: `import { ExportService } from '../../services/export.service';`
(already in constructor)

Replace the stub `openExport()`:
```typescript
openExport() {
  if (!this.currentRetroboard) return;
  // jsonData is populated by RetroBoardComponent; we rely on it being in RetroStateService
  // For now, open with empty html — full wiring requires RetroStateService to carry jsonData
  // TODO: extend RetroStateService with jsonData if needed
  this.dialog.open(ExportDialogComponent, {
    panelClass: 'custom-dialog-container',
    data: { html: '<p>Open the retro first to export.</p>' },
  });
}
```

> **Note:** Full export requires `jsonData` from `RetroBoardComponent`. Extend `RetroStateService` to carry `jsonData` in a follow-up if needed, or keep the export button in the retroboard's edit dialog for now.

- [ ] **Step 8.3: Add ExportDialogComponent to app.module.ts**

Add `ExportDialogComponent` to `declarations`.

- [ ] **Step 8.4: Remove export template from retroboard.component.html**

The `#exporttemplate` `ng-template` in `retroboard.component.html` is now handled by `ExportDialogComponent`. Remove it from the template, and update `openExportModal` in `retroboard.component.ts` to open `ExportDialogComponent`:

```typescript
openExportModal() {
  (<any>window).gtag('event', 'export', {
    event_category: 'retrospective',
    event_label: 'origin',
  });
  const html = this.exportService.export(this.jsonData);
  this.dialog.open(ExportDialogComponent, {
    panelClass: 'custom-dialog-container',
    data: { html },
  });
}
```

Add import: `import { ExportDialogComponent } from '../export-dialog/export-dialog.component';`

- [ ] **Step 8.5: Commit**

```bash
git add src/app/components/export-dialog/ src/app/components/sidebar/ src/app/components/retroboard/ src/app/app.module.ts
git commit -m "feat: extract ExportDialogComponent; wire sidebar export"
```

---

## Task 9: Login Split-Screen Redesign

**Files:**
- Modify: `src/app/components/login/login.component.html`
- Modify: `src/app/components/login/login.component.scss`

- [ ] **Step 9.1: Replace login.component.html**

Full replacement:
```html
<div class="login-page">
  <div class="login-page__left" aria-hidden="true">
    <span class="login-page__brand">RetroMatic</span>
    <span class="login-page__tagline">Better retrospectives, together.</span>
  </div>

  <div class="login-page__right">
    <form class="login-page__form" [formGroup]="loginForm" (ngSubmit)="login()">
      <h2 class="login-page__form-title">Sign in</h2>

      <p *ngIf="error" class="login-page__error"><strong>Oh snap!</strong> {{ error.message }}</p>

      <button type="button" mat-raised-button class="login-page__google-btn" (click)="loginWithGoogle($event)" aria-label="Sign in with Google">
        Continue with Google
      </button>

      <div class="login-page__divider"><span>or</span></div>

      <mat-form-field appearance="outline" class="login-page__field">
        <mat-label>Email address</mat-label>
        <input type="email" matInput formControlName="emailFormControl" />
        <mat-error *ngIf="loginForm.controls['emailFormControl'].hasError('email') && !loginForm.controls['emailFormControl'].hasError('required')">
          Please enter a valid email address
        </mat-error>
        <mat-error *ngIf="loginForm.controls['emailFormControl'].hasError('required')">
          Email is <strong>required</strong>
        </mat-error>
      </mat-form-field>

      <mat-form-field appearance="outline" class="login-page__field">
        <mat-label>Password</mat-label>
        <input type="password" matInput formControlName="passwordFormControl" />
        <mat-error *ngIf="loginForm.controls['passwordFormControl'].hasError('required')">
          Password is <strong>required</strong>
        </mat-error>
      </mat-form-field>

      <button mat-raised-button color="primary" type="submit" class="login-page__submit-btn">
        Sign in
      </button>

      <div class="login-page__links">
        <button type="button" mat-button color="primary" class="login-page__link-btn" (click)="goToResetPassword()">Reset password</button>
        <span class="login-page__link-sep">·</span>
        <button type="button" mat-button color="primary" class="login-page__link-btn" (click)="goToRegister()">Sign up</button>
      </div>

      <div class="login-page__guest">
        <button type="button" mat-stroked-button (click)="loginAsGuest($event)">Continue as guest</button>
      </div>
    </form>
  </div>
</div>
```

- [ ] **Step 9.2: Replace login.component.scss**

Full replacement:
```scss
.login-page {
  display: flex;
  height: 100vh;

  &__left {
    flex: 0 0 40%;
    background: linear-gradient(135deg, #2d1b69 0%, #13132a 100%);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    padding: 48px;

    @media (max-width: 768px) {
      display: none;
    }
  }

  &__brand {
    color: #a78bfa;
    font-weight: 800;
    font-size: 28px;
    letter-spacing: -0.5px;
    margin-bottom: 12px;
  }

  &__tagline {
    color: #7c6aaa;
    font-size: 15px;
    line-height: 1.6;
  }

  &__right {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px;
    background: var(--mat-sys-background);
  }

  &__form {
    width: 100%;
    max-width: 380px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__form-title {
    margin: 0 0 8px;
    font-size: 22px;
    font-weight: 600;
    color: var(--mat-sys-on-surface);
  }

  &__error {
    color: #f87171;
    font-size: 14px;
    margin: 0;
  }

  &__google-btn {
    width: 100%;
    background: #ffffff;
    color: #1e293b;
    font-weight: 600;
  }

  &__divider {
    display: flex;
    align-items: center;
    gap: 12px;
    color: var(--mat-sys-on-surface-variant);
    font-size: 12px;

    &::before,
    &::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--mat-sys-surface-variant);
    }
  }

  &__field {
    width: 100%;
  }

  &__submit-btn {
    width: 100%;
  }

  &__links {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    font-size: 13px;
  }

  &__link-sep {
    color: var(--mat-sys-on-surface-variant);
  }

  &__link-btn {
    font-size: 13px;
    padding: 0 4px;
  }

  &__guest {
    text-align: center;
    border-top: 1px solid var(--mat-sys-surface-variant);
    padding-top: 12px;

    button {
      width: 100%;
    }
  }
}
```

- [ ] **Step 9.3: Verify login page**

```bash
npm start
```

Navigate to `/login` (log out first). Verify:
- Split screen on desktop (left gradient panel + right form)
- Left panel hidden on mobile
- All form validation still works
- Google sign-in, guest, sign-up links all functional

- [ ] **Step 9.4: Commit**

```bash
git add src/app/components/login/
git commit -m "feat: redesign login page with split-screen layout"
```

---

## Task 10: Register + Reset Password Restyling

**Files:**
- Modify: `src/app/components/register/register.component.html`
- Modify: `src/app/components/register/register.component.scss`
- Modify: `src/app/components/reset-password/reset-password.component.html`
- Modify: `src/app/components/reset-password/reset-password.component.scss`

Both pages get the same centered dark card treatment.

- [ ] **Step 10.1: Replace register.component.html**

```html
<div class="auth-page">
  <form class="auth-page__card" [formGroup]="registerForm" (ngSubmit)="register()">
    <h2 class="auth-page__title">Create account</h2>

    <p *ngIf="error" class="auth-page__error"><strong>Oh snap!</strong> {{ error.message }}</p>

    <mat-form-field appearance="outline" class="auth-page__field">
      <mat-label>Display name</mat-label>
      <input type="text" matInput formControlName="displayNameFormControl" />
      <mat-error *ngIf="registerForm.controls['displayNameFormControl'].hasError('required')">
        Display name is <strong>required</strong>
      </mat-error>
    </mat-form-field>

    <mat-form-field appearance="outline" class="auth-page__field">
      <mat-label>Email address</mat-label>
      <input type="email" matInput formControlName="emailFormControl" />
      <mat-error *ngIf="registerForm.controls['emailFormControl'].hasError('email') && !registerForm.controls['emailFormControl'].hasError('required')">
        Please enter a valid email address
      </mat-error>
      <mat-error *ngIf="registerForm.controls['emailFormControl'].hasError('required')">
        Email is <strong>required</strong>
      </mat-error>
    </mat-form-field>

    <mat-form-field appearance="outline" class="auth-page__field">
      <mat-label>Password</mat-label>
      <input type="password" matInput formControlName="passwordFormControl" />
      <mat-error *ngIf="registerForm.controls['passwordFormControl'].hasError('required')">
        Password is <strong>required</strong>
      </mat-error>
    </mat-form-field>

    <button mat-raised-button color="primary" type="submit" class="auth-page__submit-btn">Register</button>

    <div class="auth-page__footer">
      Already have an account?
      <button type="button" mat-button color="primary" (click)="goToLogin()">Login</button>
    </div>
  </form>
</div>
```

- [ ] **Step 10.2: Replace register.component.scss**

```scss
.auth-page {
  height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: var(--mat-sys-background);

  &__card {
    width: 100%;
    max-width: 420px;
    background: var(--mat-sys-surface);
    border: 1px solid var(--mat-sys-surface-variant);
    border-radius: 14px;
    padding: 32px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__title {
    margin: 0 0 8px;
    font-size: 22px;
    font-weight: 600;
    color: var(--mat-sys-on-surface);
  }

  &__error {
    color: #f87171;
    font-size: 14px;
    margin: 0;
  }

  &__field {
    width: 100%;
  }

  &__submit-btn {
    width: 100%;
  }

  &__footer {
    text-align: center;
    font-size: 13px;
    color: var(--mat-sys-on-surface-variant);
    border-top: 1px solid var(--mat-sys-surface-variant);
    padding-top: 12px;
  }
}
```

- [ ] **Step 10.3: Replace reset-password.component.html**

```html
<div class="auth-page">
  <form class="auth-page__card" [formGroup]="resetPasswordForm" (ngSubmit)="resetPassword()">
    <h2 class="auth-page__title">Reset password</h2>

    <p *ngIf="error" class="auth-page__error"><strong>Oh snap!</strong> {{ error.message }}</p>
    <p *ngIf="isSubmitted" class="auth-page__success">Check your inbox for a reset link.</p>

    <mat-form-field appearance="outline" class="auth-page__field">
      <mat-label>Email address</mat-label>
      <input type="email" matInput formControlName="emailFormControl" />
      <mat-error *ngIf="resetPasswordForm.controls['emailFormControl'].hasError('email') && !resetPasswordForm.controls['emailFormControl'].hasError('required')">
        Please enter a valid email address
      </mat-error>
      <mat-error *ngIf="resetPasswordForm.controls['emailFormControl'].hasError('required')">
        Email is <strong>required</strong>
      </mat-error>
    </mat-form-field>

    <button mat-raised-button color="primary" type="submit" [disabled]="isSubmitted" class="auth-page__submit-btn">
      Reset Password
    </button>

    <div class="auth-page__footer">
      Already have an account?
      <button type="button" mat-button color="primary" (click)="goToLogin()">Login</button>
    </div>
  </form>
</div>
```

- [ ] **Step 10.4: Replace reset-password.component.scss**

```scss
// Reuse the same .auth-page styles via a shared class or copy:
@use '../register/register.component' as register; // not possible in Angular view encapsulation
// Instead, duplicate the same styles:
.auth-page {
  height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: var(--mat-sys-background);

  &__card {
    width: 100%;
    max-width: 420px;
    background: var(--mat-sys-surface);
    border: 1px solid var(--mat-sys-surface-variant);
    border-radius: 14px;
    padding: 32px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__title {
    margin: 0 0 8px;
    font-size: 22px;
    font-weight: 600;
    color: var(--mat-sys-on-surface);
  }

  &__error {
    color: #f87171;
    font-size: 14px;
    margin: 0;
  }

  &__success {
    color: #4ade80;
    font-size: 14px;
    margin: 0;
  }

  &__field {
    width: 100%;
  }

  &__submit-btn {
    width: 100%;
  }

  &__footer {
    text-align: center;
    font-size: 13px;
    color: var(--mat-sys-on-surface-variant);
    border-top: 1px solid var(--mat-sys-surface-variant);
    padding-top: 12px;
  }
}
```

> **Note on duplication:** The `.auth-page` styles are duplicated between register and reset-password because Angular's component-level style encapsulation prevents sharing component SCSS. This is intentional and correct for this architecture.

- [ ] **Step 10.5: Verify both pages**

```bash
npm start
```

Navigate to `/register` and `/resetpassword`. Verify:
- Centered dark card on both pages
- Forms validate correctly

- [ ] **Step 10.6: Commit**

```bash
git add src/app/components/register/ src/app/components/reset-password/
git commit -m "feat: restyle register and reset-password with dark centered card"
```

---

## Task 11: Delete Theme Picker Infrastructure

**Files:**
- Delete: `src/app/components/theme-picker/` (entire directory)
- Delete: `src/app/components/style-manager/` (entire directory)
- Modify: `src/app/app.module.ts`

- [ ] **Step 11.1: Remove from app.module.ts**

Remove these import statements and module references from `src/app/app.module.ts`:
```typescript
// DELETE these imports:
import { ThemePickerModule } from './components/theme-picker/theme-picker.component';
import { ThemeStorage } from './components/theme-picker/theme-storage/theme-storage';
import { StyleManager } from './components/style-manager';

// REMOVE from imports array:
ThemePickerModule

// REMOVE from providers array:
StyleManager,
ThemeStorage,
```

- [ ] **Step 11.2: Delete the directories**

```bash
rm -r src/app/components/theme-picker
rm -r src/app/components/style-manager
```

- [ ] **Step 11.3: Final build verification**

```bash
npx ng build --configuration=production 2>&1 | tail -30
```

Expected: Clean build, no errors. Warnings about bundle size are acceptable.

- [ ] **Step 11.4: Run tests**

```bash
npx ng test --watch=false 2>&1 | tail -20
```

Expected: ThemeService tests pass, no other failures.

- [ ] **Step 11.5: Commit**

```bash
git add -A
git commit -m "chore: delete ThemePickerComponent, StyleManager, ThemeStorage"
```

---

## Self-Review Checklist

**Spec coverage:**
- ✅ Remove @ngbracket/ngx-layout (Task 1)
- ✅ M3 theme + dark/light toggle (Task 2)
- ✅ AppShellComponent + routing (Task 4)
- ✅ RetroStateService (Task 3)
- ✅ SidebarComponent — owner/participant/guest variants (Task 5, AppShellComponent guest branch)
- ✅ WelcomeComponent + delete MyDashboardComponent (Task 6)
- ✅ Retroboard note card redesign (Task 7)
- ✅ Export dialog extracted (Task 8)
- ✅ Login split-screen (Task 9)
- ✅ Register + Reset Password restyling (Task 10)
- ✅ Delete ThemePickerComponent/StyleManager/ThemeStorage (Task 11)
- ✅ `/home` redirect preserved (routing in Task 4)
- ✅ `/retroboard/:id` legacy URL redirect (routing in Task 4)
- ✅ Per-retro actions hidden on WelcomeComponent (`hasRetroOpen` guard in Task 5)

**Type consistency:**
- `RetroStateService.setRetroboard(Retroboard | null)` — used in Tasks 3 and 5 ✅
- `SidebarComponent @Input() currentRetroboard: Retroboard | null` matches `AppShellComponent` ✅
- `ExportDialogComponent` data shape `{ html: string }` consistent across Tasks 8 ✅
- `getUpvotes` / `getDownvotes` defined in Task 7 and used in same task's template ✅
