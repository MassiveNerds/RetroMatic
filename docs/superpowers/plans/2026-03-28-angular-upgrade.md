# Angular v6 → Latest Upgrade Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade RetroMatic from Angular 6 to the latest stable Angular, modernizing the full stack including Angular Material, AngularFire, and Firebase SDK.

**Architecture:** Step through each Angular major version using `ng update` schematics. AngularFire upgrades are bundled at two natural checkpoints: v8→v9 (AF5→AF6) and v12→v13 (AF6→AF7 compat). The Firebase namespace API is preserved via compat mode at v13, deferring the modular API rewrite to a separate effort. `@angular/flex-layout` is replaced with the drop-in community fork `@ngbracket/ngx-layout` before v16 where the original stops working.

**Tech Stack:** Angular, Angular Material, AngularFire 7 (compat), Firebase 9, TypeScript, GitHub Actions, Firebase Hosting

---

## Pre-flight

Before touching anything, confirm the current build is clean.

- [ ] Run `npm install --legacy-peer-deps --ignore-scripts`
- [ ] Run `npm run build` — confirm it succeeds with no errors
- [ ] Commit anything uncommitted

---

## Phase 1: Angular 6 → 8

These two bumps are mechanical — `ng update` schematics handle virtually everything.

### Task 1: Angular 6 → 7

**Files touched by schematics:** `package.json`, `tsconfig.json`, possibly some component `.ts` files

- [ ] **Step 1: Run ng update**

```bash
npx @angular/cli@7 update @angular/core@7 @angular/cli@7 @angular/material@7 @angular/cdk@7 @angular/flex-layout@7 --force --allow-dirty
npm install --legacy-peer-deps --ignore-scripts
```

- [ ] **Step 2: Fix build**

```bash
npm run build
```

Common v7 issues:
- `DOCUMENT` token: if imported from `@angular/platform-browser`, change to `@angular/common`
- `HammerGestureConfig`: moved to `@angular/platform-browser`

Fix any TypeScript errors reported, then re-run `npm run build` until clean.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: upgrade Angular 6 → 7"
```

---

### Task 2: Angular 7 → 8

- [ ] **Step 1: Run ng update**

```bash
npx @angular/cli@8 update @angular/core@8 @angular/cli@8 @angular/material@8 @angular/cdk@8 --force --allow-dirty
npm install --legacy-peer-deps --ignore-scripts
```

Schematics will migrate string-based lazy routes to dynamic `import()` syntax if any exist. This project has no lazy routes, so it should be a no-op.

- [ ] **Step 2: Fix build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: upgrade Angular 7 → 8"
```

---

## Phase 2: AngularFire 5 → 6 + Firebase 5 → 8 + Angular 8 → 9 (Ivy)

AngularFire 5 does not support Angular 9+. Upgrade it before enabling Ivy.

### Task 3: Upgrade AngularFire 5 → 6 and Firebase 5 → 8

**Files:**
- Modify: `package.json`

AngularFire 6 keeps the exact same import paths and API as v5. This upgrade is mostly a version bump.

- [ ] **Step 1: Install new versions**

```bash
npm install @angular/fire@^6.1.5 firebase@^8.10.1 --legacy-peer-deps --save
```

- [ ] **Step 2: Fix build**

```bash
npm run build
```

Firebase 8 is still the namespace API (same as v5). Expect zero code changes. Fix any unexpected type errors.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: upgrade AngularFire 5 → 6, Firebase 5 → 8"
```

---

### Task 4: Angular 8 → 9 (Ivy)

Ivy becomes the default renderer. The main manual cleanup is `entryComponents` and a `tsconfig.json` addition.

**Files:**
- Modify: `package.json`, `tsconfig.json`, `src/app/app.module.ts`

- [ ] **Step 1: Run ng update**

```bash
npx @angular/cli@9 update @angular/core@9 @angular/cli@9 @angular/material@9 @angular/cdk@9 --force --allow-dirty
npm install --legacy-peer-deps --ignore-scripts
```

Schematics update TypeScript to ~3.8 and add `"enableIvy": true` to `tsconfig.app.json`.

- [ ] **Step 2: Remove entryComponents from AppModule**

`entryComponents` is a no-op in Ivy. Open `src/app/app.module.ts` and delete the line:
```typescript
// DELETE this entire line:
entryComponents: [GlobalErrorHandlerModalComponent, CreateUpdateRetroModalComponent],
```

- [ ] **Step 3: Fix build**

```bash
npm run build
```

Common Ivy issues:
- Components that aren't declared in a module but are used dynamically — check for compile errors mentioning "not found in any NgModule"
- Template errors that View Engine ignored but Ivy enforces strictly

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: upgrade Angular 8 → 9 (Ivy), remove entryComponents"
```

---

## Phase 3: Angular 9 → 12

Three mechanical bumps. The only manual change is replacing the `--prod` flag at v12.

### Task 5: Angular 9 → 10

- [ ] **Step 1: Run ng update**

```bash
npx @angular/cli@10 update @angular/core@10 @angular/cli@10 @angular/material@10 @angular/cdk@10 --force --allow-dirty
npm install --legacy-peer-deps --ignore-scripts
```

- [ ] **Step 2: Fix build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: upgrade Angular 9 → 10"
```

---

### Task 6: Angular 10 → 11

- [ ] **Step 1: Run ng update**

```bash
npx @angular/cli@11 update @angular/core@11 @angular/cli@11 @angular/material@11 @angular/cdk@11 --force --allow-dirty
npm install --legacy-peer-deps --ignore-scripts
```

- [ ] **Step 2: Fix build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: upgrade Angular 10 → 11"
```

---

### Task 7: Angular 11 → 12 + replace --prod flag

v12 deprecates `ng build --prod`. The `--prod` flag still works but prints a warning. Swap it now so CI stays clean.

**Files:**
- Modify: `package.json`
- Modify: `.github/workflows/deploy.yml`

- [ ] **Step 1: Run ng update**

```bash
npx @angular/cli@12 update @angular/core@12 @angular/cli@12 @angular/material@12 @angular/cdk@12 --force --allow-dirty
npm install --legacy-peer-deps --ignore-scripts
```

- [ ] **Step 2: Update the build script in package.json**

Change:
```json
"build": "npm run config -- --environment=prod && npm run build-themes && ng build --prod"
```
To:
```json
"build": "npm run config -- --environment=prod && npm run build-themes && ng build --configuration=production"
```

- [ ] **Step 3: Fix build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: upgrade Angular 11 → 12, replace --prod with --configuration=production"
```

---

## Phase 4: Fix @angular/material barrel import

This **must** happen before Angular 15, which removes the `@angular/material` barrel entirely. The project currently has one barrel import in `app.module.ts`:

```typescript
import { MatInputModule } from '@angular/material';  // line 23 — BROKEN in v15
```

All other Material imports already use specific paths (`@angular/material/toolbar`, etc.).

### Task 8: Fix the barrel import

**Files:**
- Modify: `src/app/app.module.ts`

- [ ] **Step 1: Replace the barrel import**

Open `src/app/app.module.ts` and change line 23 from:
```typescript
import { MatInputModule } from '@angular/material';
```
To:
```typescript
import { MatInputModule } from '@angular/material/input';
```

- [ ] **Step 2: Fix build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/app/app.module.ts
git commit -m "fix: replace @angular/material barrel import with specific path"
```

---

## Phase 5: AngularFire 6 → 7 (compat) + Firebase 8 → 9 + Angular 12 → 13

Angular 13 requires AngularFire 7+. AngularFire 7 uses the Firebase 9 modular SDK internally but exposes `/compat` import paths that keep the existing API unchanged. This avoids a full service-layer rewrite now.

### Task 9: Upgrade AngularFire 6 → 7 (compat) and Firebase 8 → 9

**Files:**
- Modify: `package.json`
- Modify: `src/app/app.module.ts` (3 import paths)
- Modify: `src/app/services/auth.service.ts` (1 import path)
- Modify: `src/app/services/retroboard.service.ts` (1 import path)

- [ ] **Step 1: Install new versions**

```bash
npm install @angular/fire@^7.6.1 firebase@^9.23.0 --legacy-peer-deps --save
```

- [ ] **Step 2: Update app.module.ts imports to compat paths**

Open `src/app/app.module.ts` and change the three AngularFire imports:
```typescript
// Before:
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFireAuthModule } from '@angular/fire/auth';

// After:
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
```

- [ ] **Step 3: Update auth.service.ts import**

Open `src/app/services/auth.service.ts` and change:
```typescript
// Before:
import { AngularFireAuth } from '@angular/fire/auth';

// After:
import { AngularFireAuth } from '@angular/fire/compat/auth';
```

- [ ] **Step 4: Update retroboard.service.ts import**

Open `src/app/services/retroboard.service.ts` and change:
```typescript
// Before:
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';

// After:
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';
```

- [ ] **Step 5: Fix build**

```bash
npm run build
```

Fix any remaining type errors. The compat layer is API-identical to v6 so most code should compile unchanged.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: upgrade AngularFire 6 → 7 compat, Firebase 8 → 9"
```

---

### Task 10: Angular 12 → 13

v13 drops ViewEngine entirely. Node 12.20+ required (CI already uses Node 14). TypeScript moves to 4.4.

- [ ] **Step 1: Run ng update**

```bash
npx @angular/cli@13 update @angular/core@13 @angular/cli@13 @angular/material@13 @angular/cdk@13 --force --allow-dirty
npm install --legacy-peer-deps --ignore-scripts
```

- [ ] **Step 2: Fix build**

```bash
npm run build
```

If you see errors about decorators or class fields, add to `tsconfig.json` under `compilerOptions`:
```json
"useDefineForClassFields": false
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: upgrade Angular 12 → 13"
```

---

## Phase 6: Angular 13 → 15

Two more mechanical bumps.

### Task 11: Angular 13 → 14

- [ ] **Step 1: Run ng update**

```bash
npx @angular/cli@14 update @angular/core@14 @angular/cli@14 @angular/material@14 @angular/cdk@14 --force --allow-dirty
npm install --legacy-peer-deps --ignore-scripts
```

- [ ] **Step 2: Fix build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: upgrade Angular 13 → 14"
```

---

### Task 12: Angular 14 → 15

- [ ] **Step 1: Run ng update**

```bash
npx @angular/cli@15 update @angular/core@15 @angular/cli@15 @angular/material@15 @angular/cdk@15 --force --allow-dirty
npm install --legacy-peer-deps --ignore-scripts
```

- [ ] **Step 2: Fix build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: upgrade Angular 14 → 15"
```

---

## Phase 7: Replace @angular/flex-layout before v16

`@angular/flex-layout` is not supported on Angular 16+. The community fork `@ngbracket/ngx-layout` is a drop-in replacement with identical API — same directives (`fxLayout`, `fxFlex`, etc.), same module name (`FlexLayoutModule`).

### Task 13: Swap @angular/flex-layout → @ngbracket/ngx-layout

**Files:**
- Modify: `package.json`
- Modify: `src/app/app.module.ts`

- [ ] **Step 1: Install the replacement**

```bash
npm uninstall @angular/flex-layout --legacy-peer-deps
npm install @ngbracket/ngx-layout --legacy-peer-deps --save
```

- [ ] **Step 2: Update the import in app.module.ts**

Open `src/app/app.module.ts` and change:
```typescript
// Before:
import { FlexLayoutModule } from '@angular/flex-layout';

// After:
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
```

The module name (`FlexLayoutModule`) and all template directives (`fxLayout`, `fxFlex`, `fxLayoutGap`, `fxLayoutAlign`) remain identical — no HTML changes needed.

- [ ] **Step 3: Fix build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: replace @angular/flex-layout with @ngbracket/ngx-layout (drop-in fork)"
```

---

## Phase 8: Angular 15 → 17 (esbuild + Vite)

Angular 16 requires Node 16+. Angular 17 switches the default builder from webpack to esbuild+Vite — significantly faster builds, and eliminates the need for `--openssl-legacy-provider`.

### Task 14: Angular 15 → 16 + CI Node bump

**Files:**
- Modify: `.github/workflows/deploy.yml`

- [ ] **Step 1: Update CI Node version from 14 to 18**

Open `.github/workflows/deploy.yml`. Change the build job:
```yaml
- name: Use Node.js 14        # Change this line:
  uses: actions/setup-node@v4
  with:
    node-version: '14'         # Change '14' to '18'
```

Also remove the `npm rebuild node-sass` step — it's a legacy workaround not needed on Node 18:
```yaml
# DELETE this entire step:
- name: Rebuild node-sass
  run: npm rebuild node-sass
```

- [ ] **Step 2: Run ng update**

```bash
npx @angular/cli@16 update @angular/core@16 @angular/cli@16 @angular/material@16 @angular/cdk@16 --force --allow-dirty
npm install --legacy-peer-deps --ignore-scripts
```

- [ ] **Step 3: Fix build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: upgrade Angular 15 → 16, update CI to Node 18, remove node-sass rebuild"
```

---

### Task 15: Angular 16 → 17 + remove openssl workaround

- [ ] **Step 1: Run ng update**

```bash
npx @angular/cli@17 update @angular/core@17 @angular/cli@17 @angular/material@17 @angular/cdk@17 --force --allow-dirty
npm install --legacy-peer-deps --ignore-scripts
```

The schematic migrates `angular.json` to use `@angular-devkit/build-angular:application` (esbuild+Vite).

- [ ] **Step 2: Remove --openssl-legacy-provider from package.json start script**

The `NODE_OPTIONS=--openssl-legacy-provider` was a webpack+Node 18 workaround. Esbuild doesn't need it.

Open `package.json` and change:
```json
"start": "set NODE_OPTIONS=--openssl-legacy-provider && ng serve --aot=false"
```
To:
```json
"start": "ng serve"
```

(`--aot=false` is also unnecessary — esbuild is fast enough that disabling AOT has no meaningful benefit.)

- [ ] **Step 3: Fix build**

```bash
npm run build
npm start   # verify dev server starts cleanly
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: upgrade Angular 16 → 17 (esbuild), remove openssl-legacy-provider workaround"
```

---

## Phase 9: Angular 17 → Latest

### Task 16: Angular 17 → 18

- [ ] **Step 1: Run ng update**

```bash
npx @angular/cli@18 update @angular/core@18 @angular/cli@18 @angular/material@18 @angular/cdk@18 --force --allow-dirty
npm install --legacy-peer-deps --ignore-scripts
```

- [ ] **Step 2: Fix build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: upgrade Angular 17 → 18"
```

---

### Task 17: Angular 18 → Latest

- [ ] **Step 1: Check what the current latest is**

```bash
npm info @angular/core dist-tags.latest
```

- [ ] **Step 2: Run ng update to that version**

Replace `XX` with the version number from Step 1:
```bash
npx @angular/cli@XX update @angular/core@XX @angular/cli@XX @angular/material@XX @angular/cdk@XX --force --allow-dirty
npm install --legacy-peer-deps --ignore-scripts
```

- [ ] **Step 3: Fix build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: upgrade Angular 18 → latest"
```

---

## Phase 10: Post-upgrade Cleanup

### Task 18: Remove ts-node devDependency

`ts-node` was only used by the deleted `set-env.ts`. It's now dead weight.

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Remove ts-node**

```bash
npm uninstall ts-node --save-dev --legacy-peer-deps
```

- [ ] **Step 2: Verify build still passes**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: remove unused ts-node devDependency"
```

---

### Task 19: Try dropping --legacy-peer-deps

With modern Angular, peer deps should resolve cleanly without the legacy flag.

- [ ] **Step 1: Attempt a clean install**

```bash
rm -rf node_modules package-lock.json
npm install
```

If this succeeds: proceed to Step 2.
If this fails with peer dep errors: keep `--legacy-peer-deps` in CI, note which package is causing it, and skip the rest of this task.

- [ ] **Step 2: Update CI install command**

Open `.github/workflows/deploy.yml`. Change:
```yaml
run: npm install --legacy-peer-deps --ignore-scripts
```
To:
```yaml
run: npm install
```

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "chore: remove --legacy-peer-deps from CI now that Angular peer deps resolve cleanly"
```

---

## Manual Smoke Test Checklist

Run this after each phase (no automated tests exist). Start with `npm start` and visit `http://localhost:4200`.

- [ ] App loads without console errors
- [ ] Login page renders
- [ ] Email/password login works
- [ ] Google login works
- [ ] Guest login works
- [ ] `/home` shows the board list
- [ ] Creating a new retro works (including saving a template)
- [ ] Loading a saved template works (check the dropdown shows name without "close" text)
- [ ] Opening a retro board works
- [ ] Adding a note works
- [ ] Voting on a note works
- [ ] Theme switcher works (try each theme)
- [ ] Export to Confluence works

---

## Known Deferred Work

These are intentionally out of scope for this plan:

- **AngularFire modular API migration** — the compat layer keeps `auth.service.ts` and `retroboard.service.ts` unchanged. Migrating to the modular API (`import { Auth } from '@angular/fire/auth'` etc.) is a separate effort.
- **TSLint → ESLint migration** — `tslint` and `codelyzer` are both deprecated. Separate plan needed.
- **New Angular control flow syntax** — `@if`, `@for`, `@switch` to replace `*ngIf`, `*ngFor`. Optional migration, can run `ng generate @angular/core:control-flow` after the upgrade is complete.
- **Standalone components** — optional migration away from NgModule-based architecture.
