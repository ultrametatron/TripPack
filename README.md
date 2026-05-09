# TripPack

A mobile-first smart packing planner for one traveller. Plan, pack, track
items during the trip, do return packing, and unpack with confidence.

> **Heads up:** TripPack is a fully client-side app with no backend or
> authentication. Each browser keeps its own data. Multiple users visiting the
> same URL get isolated copies — see [Sharing model](#sharing-model) below. Use
> **Settings → Export** to back up or move data between devices.

## Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS (with class-based dark mode)
- localStorage for persistence

## Run locally

```bash
npm install
npm run dev
```

Open the printed URL on a phone (or use the device toolbar in your browser).
The app is mobile-first; the layout caps at `max-w-screen-sm` so it looks
sensible on desktop too.

## Build

```bash
npm run build      # type-check + production build
npm run preview    # serve the production build
npm run typecheck  # standalone type check
```

## Live demo

Pushes to the feature branch deploy automatically via GitHub Actions
(`.github/workflows/deploy.yml`) to:

> **https://ultrametatron.github.io/TripPack/**

To enable Pages on a fresh repo: **Settings → Pages → Source → Deploy from a
branch → `gh-pages` / `(root)`** and re-run the workflow.

## Features

| Area | What you can do |
| --- | --- |
| **Trips** | Create, clone, edit, delete. Cards show progress, critical-missing, lost / unassigned / unresolved counts. |
| **Modules** | Reusable item bundles. Create / rename / duplicate / delete; per-item editor for qty, category, default bag, journey role, critical, return-expected. Nine seeded by default. |
| **Lifecycle** | Five tabs per trip: Plan → Pack → During Trip → Return Pack → Unpack / Reset. |
| **Plan** | Apply one or more modules, add bags (custom names), quick-add items, save the current item list as a new module. |
| **Pack** | Checklist view with one-tap packed toggle. Filters: All / Unpacked / Critical / Unassigned. Group by bag or category. |
| **During trip** | Quick status chips: Consumed / Gifted / Laundry / Trashed / Left / Lost. Move-bag dialog. Add bought items with a return-expected toggle. |
| **Return pack** | Distinct mode with sections for Must bring back / Not expected / Bought / Dirty / Lost / Needs bag, each with one-tap actions. |
| **Unpack** | Mark unpacked / laundry-done / restock-needed; save as module; clear trip. |
| **Stats** | Per-trip summary cards at the bottom of every tab: packed progress, critical, by bag (mini bars), statuses, top categories, journey roles, return-expected, on-the-trip totals. |
| **Settings** | Theme toggle (Auto / Light / Dark), JSON Export / Import, Clear all, PIN set / change / remove / forget. |

## Settings

Open via the **Settings** tab in the bottom nav. Sections:

- **Appearance** — three-state theme (Auto / Light / Dark). Auto follows your
  device's `prefers-color-scheme`. Persisted under
  `localStorage["trippack:theme"]`.
- **Data**
  - **Export** downloads `trippack-YYYY-MM-DD.json` (versioned envelope).
  - **Import** validates the file, shows a count summary, and replaces the
    current contents on confirm.
  - **Clear all data** wipes trips, items, bags, and modules and re-seeds the
    defaults.
- **Passcode** — see below.

## Passcode

A 4–6 digit numeric PIN, hashed in the browser with Web Crypto SHA-256 and
stored under `localStorage["trippack:pin_hash"]` (separate from app data). On
startup the keypad gates app render; wrong entries shake and clear the input.

It is **not real authentication.** It locks one browser only — anyone with
file-system access to the device can still read the unencrypted data. Use
Export to back up your trips before forgetting a PIN. The "Forget PIN" flow
requires typing `WIPE` and erases all data, since there is no backend recovery.

## Sharing model

Because there is no backend:

- Every browser is a separate, isolated TripPack. Visitors to the deployed URL
  do not share trips.
- One person on two devices (phone + laptop) gets two separate datasets.
  Bridge them by exporting JSON from one device and importing on the other.
- The PIN gates one browser; it doesn't authenticate against anything.

## Data

Local-only. Stored under three keys:

| Key | Contents |
| --- | --- |
| `trippack:v1` | App state: trips, bags, items, modules, seeded flag |
| `trippack:theme` | `"auto" \| "light" \| "dark"` |
| `trippack:pin_hash` | SHA-256 hex of the PIN (only present if a PIN is set) |

To reset everything from DevTools:

```js
["trippack:v1", "trippack:theme", "trippack:pin_hash"].forEach((k) => localStorage.removeItem(k));
```

Or use **Settings → Clear all data** plus **Forget PIN** for the same effect
from the UI.

## App structure

```
src/
  App.tsx                    hash router, BottomNav, ThemeToggle
  main.tsx                   entry point: ThemeProvider → PinGate → StoreProvider → App
  theme.tsx                  ThemeProvider, useTheme(), Auto/Light/Dark
  auth.ts                    hashPin / setPin / verifyPin / clearPin
  store.ts                   reducer-backed context store + replaceAll/clearAll
  storage.ts                 localStorage helpers, exportData, importData
  seedData.ts                default modules
  types.ts                   data model + label maps
  utils/
    tripSummary.ts           summarizeTrip + date helpers
  screens/
    Home.tsx                 trip list, clone/delete
    CreateTrip.tsx           trip wizard + module picker
    Modules.tsx              module CRUD + item editor
    TripDetail.tsx           header, sticky lifecycle tabs, edit, stats cards
  components/
    ui.tsx                   Badge, Modal, ProgressBar, EmptyState, SectionHeader
    ItemRow.tsx              checkbox + status/bag editor
    AddItemBar.tsx           quick-add bar
    PinGate.tsx              keypad lock screen
    SettingsSheet.tsx        Settings modal (theme, data, PIN)
    TripStatsCards.tsx       per-trip summary card grid
    tabs/
      PlanTab.tsx
      PackTab.tsx
      DuringTripTab.tsx
      ReturnPackTab.tsx
      UnpackTab.tsx
```

## Acceptance criteria coverage

- ✅ Create / clone / delete trips — Home screen
- ✅ Create / edit / duplicate / delete modules — Modules screen
- ✅ Apply modules to a trip — Create Trip screen and Plan tab
- ✅ Manually add / edit / delete trip items — Plan, Pack, During Trip tabs
- ✅ Create bags and assign items — Plan tab + ItemRow + Move-bag dialog
- ✅ Mark items packed — Pack tab checkbox
- ✅ Track item statuses during the trip — During Trip tab quick statuses
- ✅ Return Pack mode — distinct grouping with one-tap actions
- ✅ Unpack / Reset mode — unpack, laundry, restock, save as module, clear
- ✅ Persists in localStorage and works on mobile viewports
- ✅ Dark mode (Auto / Light / Dark)
- ✅ Per-trip summary cards
- ✅ JSON export / import
- ✅ Optional PIN lock

## Changelog

See [CHANGELOG.md](CHANGELOG.md).
