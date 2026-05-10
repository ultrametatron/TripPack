# Changelog

All notable changes to TripPack are documented here. Newest entries first.

The project does not yet publish versioned releases — entries are grouped by
the commit batch (and date) that introduced them.

## 2026-05-10 — Rename to PacTrac, polish + typography pass

Round of polish in response to a thorough mobile test pass. Includes a brand
rename, eight functional fixes, and an end-to-end typography hierarchy sweep.

### Renamed
- **TripPack → PacTrac** across the UI: `<title>`, Home header, PIN screen,
  How-it-works copy, Settings about copy, JSON export error message, and the
  exported filename (`pactrac-YYYY-MM-DD.json`). README intro and headings
  updated.
- `package.json` `name` field updated to `pactrac`.
- localStorage keys (`trippack:v1`, `trippack:theme`, `trippack:pin_hash`),
  the export-envelope key (`trippack_export_version`), and the internal
  `trippack:pin-changed` event name **stay as-is** so existing users' data
  and previously-exported JSON files continue to work.
- Repo URL and `vite.config.ts` `base: "/TripPack/"` are unchanged — they
  depend on the GitHub repo name; renaming the repo is a separate decision.

### Added
- **Journey role editor in `ItemRow`** — when a trip item is expanded, the
  journey role is now editable alongside status, bag, and qty. Previously
  this could only be changed in the Modules tab.
- **Module preview in apply flows** — new `src/components/ModulePickerRow.tsx`
  used by both Create Trip's module-picker step and the Plan tab's "Apply
  modules" modal. Tap a module's body to expand a list of its items with
  critical / journey-role chips. Checkbox toggles selection independently.
- **`BULK_ADD_BAGS` reducer action** — supports lazy bag creation in
  `applyModulesToTrip`.

### Changed
- **Lifecycle stage labels** simplified: `Plan / Pack / During / Repack / Unpack`
  (was `Plan / Pack / During trip / Return pack / Unpack / reset`). Internal
  `LifecyclePhase` enum values are unchanged so existing trips load fine.
- **No default bags on new trips.** Trips now start with an empty `bagIds: []`.
  `applyModulesToTrip` lazily creates only the bag types that the applied
  modules reference. Empty trips can also have bags added via "Add bag".
- **Bag rename** in Plan now requires a **Rename button** (matches the
  ItemRow pattern). The always-live input is gone; rename writes on Enter
  / blur and cancels on Escape.
- **Edit Trip dates** stack vertically on mobile (mirrors the Create Trip
  fix from the prior iteration).
- **Removed** the "Cooler bag item placeholder" item from the Road Trip
  Food seed module. Existing users who already seeded it can delete it
  manually; no migration logic.
- **Typography hierarchy pass.** Established a clear scale across the app:
  - Page titles (h1) → `text-2xl font-bold tracking-tight` (was mixed
    `text-xl` / `text-2xl`).
  - Modal titles (h2) → `text-lg font-semibold` (previously had no explicit
    size).
  - Section titles (h3, in `SectionHeader`) → `text-base font-semibold`
    sentence case (was `text-sm font-bold uppercase tracking-wide` —
    read smaller than body, like an overline).
  - Stats group header and Settings section labels follow the same rule.
  - Inner stat-card titles → `text-sm font-semibold` sentence case.
  - Item names in lists → `text-base font-medium` (was `font-medium` with
    no size).
  - Trip card name on Home → `text-lg font-semibold` for clearer hierarchy.
  - Form-field `.label` keeps the small uppercase treatment — input labels
    are intentionally small and stylized.

### Internal
- Removed the `DEFAULT_BAGS` constant from `src/store.ts`; `addTrip` no
  longer eagerly creates bags.
- New `src/components/ModulePickerRow.tsx`.
- No new runtime dependencies. No localStorage migration.

---

## 2026-05-09 — Iteration 2: dates, toggles, How-it-works prominence

Smaller follow-up after live-testing on a phone.

### Changed
- **Date inputs** in Create Trip now stack vertically on mobile (`grid-cols-1 sm:grid-cols-2`) and use `gap-3`. Eliminates the overlapping-border look reported on phones; iOS Safari date inputs render naturally at full width.
- **Remote work / Gifts toggle cards** are slimmer:
  - The whole row is now the click target (single `<button role="switch">`), so the inline toggle indicator can be smaller (w-9 h-5 instead of w-12 h-7) and no longer needs the 44px `.tap` height.
  - Tighter shell: `rounded-xl border px-3 py-2` instead of `card p-3` (which was rounded-2xl). Reads as a control, not a chunky card.
- **"How it works" link** on Home is now a prominent pill button (`💡 New here? See how it works →`) with `text-sm`, bold weight, brand fill, and proper margin. Visible at a glance instead of hiding as `text-xs`.

## 2026-05-09 — Cosmetic polish, three new modules, modules search, "You" tab, How-it-works onboarding

Round of polish on top of the previous post-MVP feature batch.

### Added
- **Three new seed modules** (`src/seedData.ts`):
  - **Winter Clothing** — wool socks, thermals, jumper, jacket, beanie, gloves, scarf, boots.
  - **Sports** — trainers (critical), sports socks, athletic shorts, sports tops, water bottle, sweat towel, resistance bands, sweatband.
  - **Stay-over Essentials** — pyjamas, slippers, phone charger (critical), toothbrush, toothpaste (consumable), underwear, spare socks, day-after outfit.
- **Modules search bar** (`src/screens/Modules.tsx`) — live filter by name or description, with a clear-X button. Empty state when no matches.
- **How-it-works onboarding modal** (`src/components/HowItWorks.tsx`) — 7-step walkthrough triggered from a small "How it works →" link on the Home header. Explicitly points new users to the **You** tab for theme, PIN, and Export / Import.
- **Version-aware seeding** (`src/store.ts`) — new `SEED_VERSION` constant + optional `seedVersion?: number` on `AppState`. Existing users picking up the new build get the three new modules merged in (by name match — case-insensitive) without losing their custom modules or trips.

### Changed
- **Tagline** on Home: "Smart packing for solo trips." → "Track everything you pack." (drops the solo framing).
- **Bottom-nav rename**: "Settings" tab → **You** with a person icon (`👤`). Internal hash route stays `#/settings` so any saved deep links still work.
- **`SettingsSheet` modal title** matches: "Settings" → "You".
- **Create Trip layout**:
  - Date inputs are now wrapped in `min-w-0` grid items so iOS Safari stops widening them past their column.
  - "Remote work required" + "Taking gifts or food" toggles share a single 2-column row, with shorter labels ("Remote work" / "Gifts / food").
  - `ToggleField` got `gap-2 min-w-0` and label truncation so the side-by-side layout is robust.
- **Form chips refined** (`.field-chip-on` / `.field-chip-off` in `src/index.css`) — single-select chips on Create Trip and the Edit Trip modal now use a slimmer, fill-on-select style instead of the bloated `.tap` 44px pills. Filter chips elsewhere (Pack / During Trip / Return Pack tabs, theme toggle) keep their 44px tap targets.

### Internal
- New `seedVersion` field on `AppState` is optional and backwards-compatible. Cold loads of older payloads still work; on first hydrate they pick up the new modules and persist `seedVersion: 2`.
- Tradeoff documented: if a user deleted a default seed module on purpose, this migration WILL re-add it. Tracking deleted seed names is overkill for an MVP.
- New files:
  - `src/components/HowItWorks.tsx`

---

## 2026-05-09 — Settings, dark mode, stats cards, PIN, JSON backup

Added the first round of post-MVP features.

### Added
- **Dark mode** (`src/theme.tsx`, `tailwind.config.js`)
  - Tailwind class-based dark mode (`darkMode: "class"`).
  - Three modes: `auto` (follows OS), `light`, `dark` — persisted under
    `localStorage["trippack:theme"]`.
  - Header toggle on the Trips screen and a 3-button group in Settings.
  - Live updates when the OS preference changes (only while in `auto`).
- **Per-trip summary cards** (`src/components/TripStatsCards.tsx`)
  - Rendered at the bottom of the Trip Detail screen across all lifecycle tabs.
  - Cards: Packed progress, Critical, By bag (mini bars), Statuses, Top
    categories, Journey roles, Return-expected, On-the-trip
    (bought / laundry / lost).
- **JSON export & import** (`src/storage.ts`, `src/components/SettingsSheet.tsx`)
  - `exportData()` produces a versioned envelope `{ trippack_export_version: 1, exportedAt, data }`.
  - `importData()` validates shape and version; rejects malformed files with a
    friendly message.
  - Settings → Export downloads `trippack-YYYY-MM-DD.json`.
  - Settings → Import shows a count-summary confirm before replacing data.
  - Settings → Clear all data resets the store to a freshly seeded state.
- **Passcode lock** (`src/auth.ts`, `src/components/PinGate.tsx`)
  - 4–6 digit numeric PIN, hashed with Web Crypto SHA-256.
  - Stored under `localStorage["trippack:pin_hash"]`, separate from app data.
  - Custom keypad UI with shake-on-wrong-PIN feedback.
  - Settings supports Set / Change / Remove PIN, plus a "Forget PIN" flow that
    requires typing `WIPE` and erases all data (no backend recovery possible).
  - Honest copy across the app: PIN locks one browser only, this is not real
    auth, use Export to back up.
- **Settings sheet route** (`src/components/SettingsSheet.tsx`, `src/App.tsx`)
  - New `#/settings` hash route and 4th BottomNav slot.
  - Sections: Appearance, Data, Passcode, About.

### Changed
- **Bottom nav** is now 4 slots: Trips / New / Modules / Settings.
- **`summarizeTrip`** now also accepts `bags` and returns `byStatus`,
  `byCategory`, `byJourneyRole`, `byBag`, `criticalTotal`, `criticalPacked`,
  `returnExpected`, `notReturning` for the stats cards.
- **`store.ts`** exposes `replaceAll(state)` and `clearAll()` for import/clear
  flows; reuses the existing `HYDRATE` action.
- **Component classes** in `src/index.css` (`.card`, `.btn-secondary`, `.input`,
  `.label`) now have built-in `dark:` variants. Body background uses a CSS rule
  that respects the `.dark` class.
- **Color audit**: every screen, tab, modal, badge, item row, and form chip
  now reads in both light and dark mode.

### Internal
- New files:
  - `src/theme.tsx`
  - `src/auth.ts`
  - `src/components/PinGate.tsx`
  - `src/components/SettingsSheet.tsx`
  - `src/components/TripStatsCards.tsx`
  - `CHANGELOG.md`
- New localStorage keys (added to `STORAGE_KEYS` in `src/storage.ts`):
  - `trippack:theme` — theme preference
  - `trippack:pin_hash` — hashed PIN
  - `trippack:v1` — app data (unchanged)
- No new runtime dependencies. `@types/node` was added as a dev dependency
  because `vite.config.ts` now reads `process.env.GITHUB_ACTIONS`.

### Migration notes
- Existing localStorage data is unaffected — nothing migrates.
- A fresh visit will land on the first run with the same seeded modules as
  before. The PIN feature is opt-in from Settings.

---

## 2026-05-09 — GitHub Pages deployment

### Added
- `.github/workflows/deploy.yml` builds and deploys to GitHub Pages via
  `peaceiris/actions-gh-pages` (publishes the built `dist/` to a `gh-pages`
  branch). Pages source must be set to **Branch: gh-pages / root** in repo
  settings.
- `vite.config.ts` sets `base: "/TripPack/"` when running under GitHub Actions.

---

## 2026-05-09 — Initial MVP

The first working build of TripPack: a mobile-first, single-traveller smart
packing planner.

### Added
- React 18 + TypeScript + Vite + Tailwind CSS scaffold.
- localStorage-backed reducer store (`src/store.ts`) with HYDRATE for atomic
  state replacement.
- Five-phase lifecycle on each trip: Plan → Pack → During Trip → Return Pack
  → Unpack / Reset.
- Trip CRUD with cloning (copies bags + items, resets statuses to `planned`).
- Module CRUD with editable items: create, rename, duplicate, delete; per-item
  edit of qty, category, default bag type, journey role, critical, return
  expected.
- Apply modules to a trip; "Save trip as module" snapshots the current items.
- Bag CRUD per trip (default 7 bag types seeded on trip creation).
- Item CRUD with: status, journey role, return-expected, critical flag,
  bag assignment, quick-status chips per lifecycle tab.
- Default seeded modules: Base Travel Kit, Remote Work Kit, Toiletries, Contact
  Lens / Glasses Kit, Warm Weather Clothes, Gym / Rehab Kit, Road Trip Food,
  Family Gifts, Flight Shoulder Bag Essentials.
- Distinct return-packing UI grouped by must-bring-back, not-expected, bought,
  dirty, lost, needs-bag-assignment.
- Unpack tab: mark unpacked / laundry-done / restock-needed, save-as-module,
  clear-trip.

### Stack & files
- `vite`, `@vitejs/plugin-react`, `react`, `react-dom`, `tailwindcss`,
  `postcss`, `autoprefixer`, `typescript`.
- See README.md → "App structure" for the file map.
