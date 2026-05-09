# TripPack

A mobile-first MVP for a single-traveller smart packing planner. Plan, pack,
track items during the trip, do return packing, and unpack with confidence.

## Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- localStorage for persistence (no backend, no login)

## Run locally

```bash
npm install
npm run dev
```

Open the printed URL on a phone (or use the device toolbar in your browser).
The app is mobile-first; the layout caps at `max-w-screen-sm` so it looks fine
on desktop too.

## Build

```bash
npm run build      # type-check + production build
npm run preview    # serve the production build
npm run typecheck  # standalone type check
```

## Data

All state is persisted under the localStorage key `trippack:v1`. To reset, open
DevTools and run:

```js
localStorage.removeItem("trippack:v1");
```

The app seeds default modules (Base Travel Kit, Remote Work Kit, Toiletries,
Contact Lens / Glasses Kit, Warm Weather Clothes, Gym / Rehab Kit, Road Trip
Food, Family Gifts, Flight Shoulder Bag Essentials) on first run.

## App structure

```
src/
  App.tsx              hash-based router + bottom nav
  main.tsx             entry point
  store.ts             reducer-backed context store
  storage.ts           localStorage + uid()
  seedData.ts          default modules
  types.ts             data model + label maps
  utils/
    tripSummary.ts     packing progress + date helpers
  screens/
    Home.tsx           trip list, clone/delete
    CreateTrip.tsx     trip wizard + module picker
    Modules.tsx        module CRUD + item editor
    TripDetail.tsx     header, lifecycle tabs, edit
  components/
    ui.tsx             Badge, Modal, ProgressBar, EmptyState
    ItemRow.tsx        checkbox + status/bag editor
    AddItemBar.tsx     quick-add bar
    tabs/
      PlanTab.tsx
      PackTab.tsx
      DuringTripTab.tsx
      ReturnPackTab.tsx
      UnpackTab.tsx
```

## Acceptance criteria coverage

- Create / clone / delete trips — Home screen
- Create / edit / duplicate / delete modules — Modules screen
- Apply modules to a trip — Create Trip screen and Plan tab
- Manually add / edit / delete trip items — Plan, Pack, During Trip tabs
- Create bags and assign items — Plan tab + ItemRow + Move bag dialog
- Mark items packed — Pack tab checkbox
- Track item statuses during the trip — During Trip tab quick statuses
- Return Pack mode — distinctive grouping (must bring back, not expected,
  bought, dirty, lost, needs bag)
- Unpack / Reset mode — unpack, laundry, restock, save as module, clear trip
- Persists in localStorage and works on mobile viewports
