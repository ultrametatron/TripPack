import type { AppState, Bag, Module, ModuleItem, Trip, Item } from "./types";

const KEY = "trippack:v1";
export const STORAGE_KEYS = ["trippack:v1", "trippack:pin_hash", "trippack:theme"] as const;

const TRIP_TYPES = new Set(["holiday", "weekend_stay", "road_trip", "visiting_family"]);
const TRANSPORT_MODES = new Set(["flight", "car", "train", "other"]);
const LAUNDRY_ACCESS = new Set(["yes", "no", "unknown"]);
const ACTIVITIES = new Set(["beach", "hiking", "gym_rehab", "formal_event", "family_visit", "general_sightseeing"]);
const PHASES = new Set(["plan", "pack", "during", "return", "unpack"]);
const BAG_TYPES = new Set(["shoulder_bag", "suitcase", "backpack", "laptop_bag", "toiletry_pouch", "cooler_bag", "gift_bag", "custom"]);
const CATEGORIES = new Set(["travel_documents", "electronics", "remote_work", "clothes", "toiletries", "health_rehab", "food", "gifts", "shoes", "accessories", "bags", "miscellaneous"]);
const ITEM_STATUS = new Set(["planned", "packed", "packed_from_home", "bought_during_trip", "consumed", "gifted", "thrown_away", "left_at_destination", "brought_back", "laundry_dirty", "moved_between_bags", "lost_unaccounted_for", "unpacked", "restock_needed"]);
const JOURNEY_ROLES = new Set(["bring_both_ways", "outbound_only", "return_only", "consumable", "gift", "discardable", "bought_on_trip", "laundry", "uncertain"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object";
}
function assert(condition: unknown, section: string, message: string): asserts condition {
  if (!condition) throw new Error(`Invalid ${section}: ${message}`);
}
function asString(value: unknown, section: string, field: string): string {
  assert(typeof value === "string" && value.length > 0, section, `${field} must be a non-empty string.`);
  return value;
}
function asAnyString(value: unknown, section: string, field: string): string {
  assert(typeof value === "string", section, `${field} must be a string.`);
  return value;
}
function asNumber(value: unknown, section: string, field: string): number {
  assert(typeof value === "number" && Number.isFinite(value), section, `${field} must be a finite number.`);
  return value;
}
function asBoolean(value: unknown, section: string, field: string): boolean {
  assert(typeof value === "boolean", section, `${field} must be a boolean.`);
  return value;
}
function asStringArray(value: unknown, section: string, field: string): string[] {
  assert(Array.isArray(value), section, `${field} must be an array.`);
  value.forEach((entry, idx) => assert(typeof entry === "string" && entry.length > 0, section, `${field}[${idx}] must be a non-empty string.`));
  return value as string[];
}
function dedupeStrings(values: string[]): string[] {
  return Array.from(new Set(values));
}

export function loadState(): AppState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // ignore quota / serialization errors in MVP
  }
}

export function uid(prefix = "id"): string {
  const rand = Math.random().toString(36).slice(2, 9);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

export interface ExportEnvelope {
  trippack_export_version: 1;
  exportedAt: string;
  data: AppState;
}

export function exportData(state: AppState): string {
  const env: ExportEnvelope = {
    trippack_export_version: 1,
    exportedAt: new Date().toISOString(),
    data: state,
  };
  return JSON.stringify(env, null, 2);
}

function validateTrip(trip: unknown, idx: number): Trip {
  const section = `trips[${idx}]`;
  assert(isRecord(trip), section, "entry must be an object.");
  const tripType = asString(trip.tripType, section, "tripType");
  const transportMode = asString(trip.transportMode, section, "transportMode");
  const laundryAccess = asString(trip.laundryAccess, section, "laundryAccess");
  const currentPhase = asString(trip.currentPhase, section, "currentPhase");
  assert(TRIP_TYPES.has(tripType), section, "tripType is unsupported.");
  assert(TRANSPORT_MODES.has(transportMode), section, "transportMode is unsupported.");
  assert(LAUNDRY_ACCESS.has(laundryAccess), section, "laundryAccess is unsupported.");
  assert(PHASES.has(currentPhase), section, "currentPhase is unsupported.");
  const activities = Array.isArray(trip.activities) ? trip.activities : [];
  activities.forEach((activity, aIdx) => assert(typeof activity === "string" && ACTIVITIES.has(activity), section, `activities[${aIdx}] is unsupported.`));
  return {
    id: asString(trip.id, section, "id"),
    name: asString(trip.name, section, "name"),
    destination: asAnyString(trip.destination, section, "destination"),
    startDate: asAnyString(trip.startDate, section, "startDate"),
    endDate: asAnyString(trip.endDate, section, "endDate"),
    tripType: tripType as Trip["tripType"],
    transportMode: transportMode as Trip["transportMode"],
    remoteWorkRequired: asBoolean(trip.remoteWorkRequired, section, "remoteWorkRequired"),
    laundryAccess: laundryAccess as Trip["laundryAccess"],
    activities: activities as Trip["activities"],
    takingGiftsOrFood: asBoolean(trip.takingGiftsOrFood, section, "takingGiftsOrFood"),
    notes: typeof trip.notes === "string" ? trip.notes : "",
    currentPhase: currentPhase as Trip["currentPhase"],
    bagIds: dedupeStrings(asStringArray(Array.isArray(trip.bagIds) ? trip.bagIds : [], section, "bagIds")),
    itemIds: dedupeStrings(asStringArray(Array.isArray(trip.itemIds) ? trip.itemIds : [], section, "itemIds")),
    createdAt: asNumber(trip.createdAt, section, "createdAt"),
    updatedAt: asNumber(trip.updatedAt, section, "updatedAt"),
  };
}

function validateBag(bag: unknown, idx: number): Bag {
  const section = `bags[${idx}]`;
  assert(isRecord(bag), section, "entry must be an object.");
  const type = asString(bag.type, section, "type");
  assert(BAG_TYPES.has(type), section, "type is unsupported.");
  const parentBagId = bag.parentBagId;
  assert(parentBagId === undefined || typeof parentBagId === "string", section, "parentBagId must be a string when provided.");
  const notes = bag.notes;
  assert(notes === undefined || typeof notes === "string", section, "notes must be a string when provided.");
  return {
    id: asString(bag.id, section, "id"),
    tripId: asString(bag.tripId, section, "tripId"),
    name: asString(bag.name, section, "name"),
    type: type as Bag["type"],
    parentBagId,
    notes,
  };
}

function validateItem(item: unknown, idx: number): Item {
  const section = `items[${idx}]`;
  assert(isRecord(item), section, "entry must be an object.");
  const category = asString(item.category, section, "category");
  const status = asString(item.status, section, "status");
  const journeyRole = asString(item.journeyRole, section, "journeyRole");
  assert(CATEGORIES.has(category), section, "category is unsupported.");
  assert(ITEM_STATUS.has(status), section, "status is unsupported.");
  assert(JOURNEY_ROLES.has(journeyRole), section, "journeyRole is unsupported.");
  const moduleId = item.moduleId;
  assert(moduleId === undefined || typeof moduleId === "string", section, "moduleId must be a string when provided.");
  const bagId = item.bagId;
  assert(bagId === undefined || typeof bagId === "string", section, "bagId must be a string when provided.");
  const notes = item.notes;
  assert(notes === undefined || typeof notes === "string", section, "notes must be a string when provided.");
  return {
    id: asString(item.id, section, "id"),
    tripId: asString(item.tripId, section, "tripId"),
    moduleId,
    name: asString(item.name, section, "name"),
    quantity: asNumber(item.quantity, section, "quantity"),
    category: category as Item["category"],
    bagId,
    status: status as Item["status"],
    journeyRole: journeyRole as Item["journeyRole"],
    returnExpected: asBoolean(item.returnExpected, section, "returnExpected"),
    critical: asBoolean(item.critical, section, "critical"),
    notes,
    createdAt: asNumber(item.createdAt, section, "createdAt"),
    updatedAt: asNumber(item.updatedAt, section, "updatedAt"),
  };
}

function validateModuleItem(item: unknown, section: string): ModuleItem {
  assert(isRecord(item), section, "entry must be an object.");
  const category = asString(item.category, section, "category");
  const journeyRole = asString(item.journeyRole, section, "journeyRole");
  assert(CATEGORIES.has(category), section, "category is unsupported.");
  assert(JOURNEY_ROLES.has(journeyRole), section, "journeyRole is unsupported.");
  const defaultBagType = item.defaultBagType;
  assert(defaultBagType === undefined || (typeof defaultBagType === "string" && BAG_TYPES.has(defaultBagType)), section, "defaultBagType is unsupported.");
  const notes = item.notes;
  assert(notes === undefined || typeof notes === "string", section, "notes must be a string when provided.");
  return {
    id: asString(item.id, section, "id"),
    name: asString(item.name, section, "name"),
    quantity: asNumber(item.quantity, section, "quantity"),
    category: category as ModuleItem["category"],
    defaultBagType: defaultBagType as ModuleItem["defaultBagType"],
    journeyRole: journeyRole as ModuleItem["journeyRole"],
    returnExpected: asBoolean(item.returnExpected, section, "returnExpected"),
    critical: asBoolean(item.critical, section, "critical"),
    notes,
  };
}

function validateModule(module: unknown, idx: number): Module {
  const section = `modules[${idx}]`;
  assert(isRecord(module), section, "entry must be an object.");
  const defaultItemsRaw = module.defaultItems;
  assert(Array.isArray(defaultItemsRaw), section, "defaultItems must be an array.");
  const defaultItems = defaultItemsRaw.map((item, itemIdx) => validateModuleItem(item, `${section}.defaultItems[${itemIdx}]`));
  return {
    id: asString(module.id, section, "id"),
    name: asString(module.name, section, "name"),
    description: typeof module.description === "string" ? module.description : "",
    defaultItems,
    createdAt: asNumber(module.createdAt, section, "createdAt"),
    updatedAt: asNumber(module.updatedAt, section, "updatedAt"),
  };
}

export function importData(json: string): AppState {
  let parsed: unknown;
  try { parsed = JSON.parse(json); } catch { throw new Error("Not valid JSON."); }
  if (!parsed || typeof parsed !== "object") throw new Error("File is empty or malformed.");
  const env = parsed as Partial<ExportEnvelope>;
  if (env.trippack_export_version !== 1) throw new Error("This file is not a TripPack export (or has an unsupported version).");

  const data = env.data as Partial<AppState> | undefined;
  if (!data || !Array.isArray(data.trips) || !Array.isArray(data.bags) || !Array.isArray(data.items) || !Array.isArray(data.modules)) {
    throw new Error("Backup is missing required sections.");
  }

  const trips = data.trips.map(validateTrip);
  const bags = data.bags.map(validateBag);
  const items = data.items.map(validateItem);
  const modules = data.modules.map(validateModule);

  const tripIds = new Set(trips.map((trip) => trip.id));
  const bagsByTrip = new Map<string, Set<string>>();
  bags.forEach((bag, idx) => {
    assert(tripIds.has(bag.tripId), "bags", `bags[${idx}].tripId references missing trip '${bag.tripId}'.`);
    const set = bagsByTrip.get(bag.tripId) ?? new Set<string>();
    set.add(bag.id);
    bagsByTrip.set(bag.tripId, set);
  });
  items.forEach((item, idx) => {
    assert(tripIds.has(item.tripId), "items", `items[${idx}].tripId references missing trip '${item.tripId}'.`);
    if (item.bagId) {
      const tripBagIds = bagsByTrip.get(item.tripId);
      assert(!!tripBagIds && tripBagIds.has(item.bagId), "items", `items[${idx}].bagId references missing bag '${item.bagId}' in trip '${item.tripId}'.`);
    }
  });

  const bagIdsByTrip = new Map<string, string[]>();
  const itemIdsByTrip = new Map<string, string[]>();
  bags.forEach((bag) => bagIdsByTrip.set(bag.tripId, [...(bagIdsByTrip.get(bag.tripId) ?? []), bag.id]));
  items.forEach((item) => itemIdsByTrip.set(item.tripId, [...(itemIdsByTrip.get(item.tripId) ?? []), item.id]));

  const normalizedTrips = trips.map((trip) => ({
    ...trip,
    bagIds: dedupeStrings(bagIdsByTrip.get(trip.id) ?? []),
    itemIds: dedupeStrings(itemIdsByTrip.get(trip.id) ?? []),
    notes: trip.notes ?? "",
    activities: trip.activities ?? [],
  }));

  return {
    trips: normalizedTrips,
    bags: bags.map((bag) => ({ ...bag, notes: bag.notes ?? "" })),
    items: items.map((item) => ({ ...item, notes: item.notes ?? "" })),
    modules: modules.map((module) => ({
      ...module,
      description: module.description ?? "",
      defaultItems: module.defaultItems.map((defaultItem) => ({ ...defaultItem, notes: defaultItem.notes ?? "" })),
    })),
    seeded: data.seeded ?? true,
    ...(typeof data.seedVersion === "number" ? { seedVersion: data.seedVersion } : {}),
  };
}

export function todayStamp(): string {
  return new Date().toISOString().slice(0, 10);
}
