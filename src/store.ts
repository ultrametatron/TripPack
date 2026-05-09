import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import type {
  AppState,
  Bag,
  BagType,
  Item,
  ItemStatus,
  LifecyclePhase,
  Module,
  ModuleItem,
  Trip,
} from "./types";
import { loadState, saveState, uid } from "./storage";
import { buildSeedModules } from "./seedData";

const DEFAULT_BAGS: { type: BagType; name: string }[] = [
  { type: "shoulder_bag", name: "Shoulder bag" },
  { type: "suitcase", name: "Suitcase" },
  { type: "backpack", name: "Backpack" },
  { type: "laptop_bag", name: "Laptop bag" },
  { type: "toiletry_pouch", name: "Toiletry pouch" },
  { type: "cooler_bag", name: "Cooler bag" },
  { type: "gift_bag", name: "Gift bag" },
];

const initial: AppState = { trips: [], bags: [], items: [], modules: [], seeded: false };

type Action =
  | { type: "HYDRATE"; payload: AppState }
  | { type: "SET"; payload: AppState }
  | { type: "ADD_TRIP"; trip: Trip; bags: Bag[] }
  | { type: "UPDATE_TRIP"; trip: Trip }
  | { type: "DELETE_TRIP"; tripId: string }
  | { type: "CLONE_TRIP"; sourceTripId: string; newName: string }
  | { type: "SET_PHASE"; tripId: string; phase: LifecyclePhase }
  | { type: "ADD_BAG"; bag: Bag }
  | { type: "UPDATE_BAG"; bag: Bag }
  | { type: "DELETE_BAG"; bagId: string }
  | { type: "ADD_ITEM"; item: Item }
  | { type: "UPDATE_ITEM"; item: Item }
  | { type: "DELETE_ITEM"; itemId: string }
  | { type: "BULK_ADD_ITEMS"; items: Item[] }
  | { type: "ADD_MODULE"; module: Module }
  | { type: "UPDATE_MODULE"; module: Module }
  | { type: "DELETE_MODULE"; moduleId: string };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "HYDRATE":
    case "SET":
      return action.payload;
    case "ADD_TRIP":
      return {
        ...state,
        trips: [action.trip, ...state.trips],
        bags: [...state.bags, ...action.bags],
      };
    case "UPDATE_TRIP":
      return {
        ...state,
        trips: state.trips.map((t) => (t.id === action.trip.id ? action.trip : t)),
      };
    case "DELETE_TRIP":
      return {
        ...state,
        trips: state.trips.filter((t) => t.id !== action.tripId),
        bags: state.bags.filter((b) => b.tripId !== action.tripId),
        items: state.items.filter((i) => i.tripId !== action.tripId),
      };
    case "CLONE_TRIP": {
      const src = state.trips.find((t) => t.id === action.sourceTripId);
      if (!src) return state;
      const now = Date.now();
      const newTripId = uid("trip");
      const bagIdMap: Record<string, string> = {};
      const newBags: Bag[] = state.bags
        .filter((b) => b.tripId === src.id)
        .map((b) => {
          const nb: Bag = { ...b, id: uid("bag"), tripId: newTripId };
          bagIdMap[b.id] = nb.id;
          return nb;
        });
      const newItems: Item[] = state.items
        .filter((i) => i.tripId === src.id)
        .map((i) => ({
          ...i,
          id: uid("item"),
          tripId: newTripId,
          bagId: i.bagId ? bagIdMap[i.bagId] : undefined,
          status: "planned",
          createdAt: now,
          updatedAt: now,
        }));
      const cloned: Trip = {
        ...src,
        id: newTripId,
        name: action.newName,
        currentPhase: "plan",
        bagIds: newBags.map((b) => b.id),
        itemIds: newItems.map((i) => i.id),
        createdAt: now,
        updatedAt: now,
      };
      return {
        ...state,
        trips: [cloned, ...state.trips],
        bags: [...state.bags, ...newBags],
        items: [...state.items, ...newItems],
      };
    }
    case "SET_PHASE":
      return {
        ...state,
        trips: state.trips.map((t) =>
          t.id === action.tripId ? { ...t, currentPhase: action.phase, updatedAt: Date.now() } : t
        ),
      };
    case "ADD_BAG":
      return {
        ...state,
        bags: [...state.bags, action.bag],
        trips: state.trips.map((t) =>
          t.id === action.bag.tripId ? { ...t, bagIds: [...t.bagIds, action.bag.id] } : t
        ),
      };
    case "UPDATE_BAG":
      return {
        ...state,
        bags: state.bags.map((b) => (b.id === action.bag.id ? action.bag : b)),
      };
    case "DELETE_BAG":
      return {
        ...state,
        bags: state.bags.filter((b) => b.id !== action.bagId),
        items: state.items.map((i) =>
          i.bagId === action.bagId ? { ...i, bagId: undefined, updatedAt: Date.now() } : i
        ),
        trips: state.trips.map((t) => ({ ...t, bagIds: t.bagIds.filter((id) => id !== action.bagId) })),
      };
    case "ADD_ITEM":
      return {
        ...state,
        items: [...state.items, action.item],
        trips: state.trips.map((t) =>
          t.id === action.item.tripId ? { ...t, itemIds: [...t.itemIds, action.item.id] } : t
        ),
      };
    case "BULK_ADD_ITEMS": {
      const tripId = action.items[0]?.tripId;
      return {
        ...state,
        items: [...state.items, ...action.items],
        trips: state.trips.map((t) =>
          tripId && t.id === tripId
            ? { ...t, itemIds: [...t.itemIds, ...action.items.map((i) => i.id)] }
            : t
        ),
      };
    }
    case "UPDATE_ITEM":
      return {
        ...state,
        items: state.items.map((i) => (i.id === action.item.id ? action.item : i)),
      };
    case "DELETE_ITEM":
      return {
        ...state,
        items: state.items.filter((i) => i.id !== action.itemId),
        trips: state.trips.map((t) => ({ ...t, itemIds: t.itemIds.filter((id) => id !== action.itemId) })),
      };
    case "ADD_MODULE":
      return { ...state, modules: [...state.modules, action.module] };
    case "UPDATE_MODULE":
      return {
        ...state,
        modules: state.modules.map((m) => (m.id === action.module.id ? action.module : m)),
      };
    case "DELETE_MODULE":
      return { ...state, modules: state.modules.filter((m) => m.id !== action.moduleId) };
    default:
      return state;
  }
}

interface StoreApi {
  state: AppState;
  // trips
  addTrip(input: Omit<Trip, "id" | "createdAt" | "updatedAt" | "bagIds" | "itemIds" | "currentPhase">): Trip;
  updateTrip(trip: Trip): void;
  deleteTrip(tripId: string): void;
  cloneTrip(sourceTripId: string, newName: string): void;
  setPhase(tripId: string, phase: LifecyclePhase): void;
  // bags
  addBag(tripId: string, name: string, type: BagType): Bag;
  updateBag(bag: Bag): void;
  deleteBag(bagId: string): void;
  // items
  addItem(item: Omit<Item, "id" | "createdAt" | "updatedAt">): Item;
  updateItem(item: Item): void;
  deleteItem(itemId: string): void;
  setItemStatus(itemId: string, status: ItemStatus): void;
  setItemBag(itemId: string, bagId: string | undefined): void;
  // modules
  addModule(name: string, description?: string): Module;
  updateModule(mod: Module): void;
  deleteModule(moduleId: string): void;
  duplicateModule(moduleId: string): void;
  applyModulesToTrip(tripId: string, moduleIds: string[]): number;
  saveTripAsModule(tripId: string, name: string, description: string): Module | null;
  // bulk
  replaceAll(state: AppState): void;
  clearAll(): void;
}

const StoreContext = createContext<StoreApi | null>(null);

function ensureSeed(state: AppState): AppState {
  if (state.seeded) return state;
  return { ...state, modules: [...state.modules, ...buildSeedModules()], seeded: true };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);

  useEffect(() => {
    const loaded = loadState();
    const next = ensureSeed(loaded ?? initial);
    dispatch({ type: "HYDRATE", payload: next });
  }, []);

  useEffect(() => {
    if (state === initial) return;
    saveState(state);
  }, [state]);

  const api = useMemo<StoreApi>(() => {
    const findBagsForTrip = (tripId: string) => state.bags.filter((b) => b.tripId === tripId);

    return {
      state,
      addTrip(input) {
        const now = Date.now();
        const tripId = uid("trip");
        const newBags: Bag[] = DEFAULT_BAGS.map((b) => ({
          id: uid("bag"),
          tripId,
          name: b.name,
          type: b.type,
        }));
        const trip: Trip = {
          ...input,
          id: tripId,
          currentPhase: "plan",
          bagIds: newBags.map((b) => b.id),
          itemIds: [],
          createdAt: now,
          updatedAt: now,
        };
        dispatch({ type: "ADD_TRIP", trip, bags: newBags });
        return trip;
      },
      updateTrip(trip) {
        dispatch({ type: "UPDATE_TRIP", trip: { ...trip, updatedAt: Date.now() } });
      },
      deleteTrip(tripId) {
        dispatch({ type: "DELETE_TRIP", tripId });
      },
      cloneTrip(sourceTripId, newName) {
        dispatch({ type: "CLONE_TRIP", sourceTripId, newName });
      },
      setPhase(tripId, phase) {
        dispatch({ type: "SET_PHASE", tripId, phase });
      },
      addBag(tripId, name, type) {
        const bag: Bag = { id: uid("bag"), tripId, name, type };
        dispatch({ type: "ADD_BAG", bag });
        return bag;
      },
      updateBag(bag) {
        dispatch({ type: "UPDATE_BAG", bag });
      },
      deleteBag(bagId) {
        dispatch({ type: "DELETE_BAG", bagId });
      },
      addItem(input) {
        const now = Date.now();
        const item: Item = { ...input, id: uid("item"), createdAt: now, updatedAt: now };
        dispatch({ type: "ADD_ITEM", item });
        return item;
      },
      updateItem(item) {
        dispatch({ type: "UPDATE_ITEM", item: { ...item, updatedAt: Date.now() } });
      },
      deleteItem(itemId) {
        dispatch({ type: "DELETE_ITEM", itemId });
      },
      setItemStatus(itemId, status) {
        const item = state.items.find((i) => i.id === itemId);
        if (!item) return;
        dispatch({ type: "UPDATE_ITEM", item: { ...item, status, updatedAt: Date.now() } });
      },
      setItemBag(itemId, bagId) {
        const item = state.items.find((i) => i.id === itemId);
        if (!item) return;
        dispatch({
          type: "UPDATE_ITEM",
          item: {
            ...item,
            bagId,
            status: item.status === "planned" ? "planned" : "moved_between_bags",
            updatedAt: Date.now(),
          },
        });
      },
      addModule(name, description = "") {
        const now = Date.now();
        const mod: Module = {
          id: uid("mod"),
          name,
          description,
          defaultItems: [],
          createdAt: now,
          updatedAt: now,
        };
        dispatch({ type: "ADD_MODULE", module: mod });
        return mod;
      },
      updateModule(mod) {
        dispatch({ type: "UPDATE_MODULE", module: { ...mod, updatedAt: Date.now() } });
      },
      deleteModule(moduleId) {
        dispatch({ type: "DELETE_MODULE", moduleId });
      },
      duplicateModule(moduleId) {
        const src = state.modules.find((m) => m.id === moduleId);
        if (!src) return;
        const now = Date.now();
        const dup: Module = {
          ...src,
          id: uid("mod"),
          name: `${src.name} (copy)`,
          defaultItems: src.defaultItems.map((d) => ({ ...d, id: uid("mi") })),
          createdAt: now,
          updatedAt: now,
        };
        dispatch({ type: "ADD_MODULE", module: dup });
      },
      applyModulesToTrip(tripId, moduleIds) {
        const trip = state.trips.find((t) => t.id === tripId);
        if (!trip) return 0;
        const tripBags = findBagsForTrip(tripId);
        const findBagId = (type?: BagType) => {
          if (!type) return undefined;
          return tripBags.find((b) => b.type === type)?.id;
        };
        const now = Date.now();
        const newItems: Item[] = [];
        for (const mid of moduleIds) {
          const mod = state.modules.find((m) => m.id === mid);
          if (!mod) continue;
          for (const def of mod.defaultItems) {
            newItems.push({
              id: uid("item"),
              tripId,
              moduleId: mod.id,
              name: def.name,
              quantity: def.quantity,
              category: def.category,
              bagId: findBagId(def.defaultBagType),
              status: "planned",
              journeyRole: def.journeyRole,
              returnExpected: def.returnExpected,
              critical: def.critical,
              notes: def.notes,
              createdAt: now,
              updatedAt: now,
            });
          }
        }
        if (newItems.length) dispatch({ type: "BULK_ADD_ITEMS", items: newItems });
        return newItems.length;
      },
      replaceAll(next) {
        dispatch({ type: "HYDRATE", payload: ensureSeed(next) });
      },
      clearAll() {
        dispatch({ type: "HYDRATE", payload: ensureSeed({ ...initial }) });
      },
      saveTripAsModule(tripId, name, description) {
        const tripItems = state.items.filter((i) => i.tripId === tripId);
        if (tripItems.length === 0) return null;
        const tripBags = state.bags.filter((b) => b.tripId === tripId);
        const now = Date.now();
        const defaultItems: ModuleItem[] = tripItems.map((i) => ({
          id: uid("mi"),
          name: i.name,
          quantity: i.quantity,
          category: i.category,
          defaultBagType: tripBags.find((b) => b.id === i.bagId)?.type,
          journeyRole: i.journeyRole,
          returnExpected: i.returnExpected,
          critical: i.critical,
          notes: i.notes,
        }));
        const mod: Module = {
          id: uid("mod"),
          name,
          description,
          defaultItems,
          createdAt: now,
          updatedAt: now,
        };
        dispatch({ type: "ADD_MODULE", module: mod });
        return mod;
      },
    };
  }, [state]);

  return React.createElement(StoreContext.Provider, { value: api }, children);
}

export function useStore(): StoreApi {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export function useTrip(tripId: string | undefined) {
  const { state } = useStore();
  return useMemo(() => {
    if (!tripId) return null;
    const trip = state.trips.find((t) => t.id === tripId) ?? null;
    if (!trip) return null;
    const bags = state.bags.filter((b) => b.tripId === tripId);
    const items = state.items.filter((i) => i.tripId === tripId);
    return { trip, bags, items };
  }, [state, tripId]);
}
