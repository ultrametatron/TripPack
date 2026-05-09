import type {
  Bag,
  Category,
  Item,
  ItemStatus,
  JourneyRole,
  Trip,
} from "../types";

export interface BagBreakdown {
  bagId: string;
  bagName: string;
  total: number;
  packed: number;
}

export interface TripSummary {
  total: number;
  packed: number;
  unassigned: number;
  lost: number;
  unresolved: number;
  criticalMissing: number;
  criticalTotal: number;
  criticalPacked: number;
  bought: number;
  laundry: number;
  broughtBack: number;
  consumables: number;
  returnExpected: number;
  notReturning: number;
  byStatus: Partial<Record<ItemStatus, number>>;
  byCategory: Partial<Record<Category, number>>;
  byJourneyRole: Partial<Record<JourneyRole, number>>;
  byBag: BagBreakdown[];
}

const PACKED_STATUSES = new Set<ItemStatus>(["packed", "packed_from_home"]);

export function summarizeTrip(trip: Trip, items: Item[], bags: Bag[] = []): TripSummary {
  const total = items.length;
  let packed = 0;
  let unassigned = 0;
  let lost = 0;
  let criticalMissing = 0;
  let criticalTotal = 0;
  let criticalPacked = 0;
  let bought = 0;
  let laundry = 0;
  let broughtBack = 0;
  let consumables = 0;
  let returnExpected = 0;
  let notReturning = 0;

  const byStatus: Partial<Record<ItemStatus, number>> = {};
  const byCategory: Partial<Record<Category, number>> = {};
  const byJourneyRole: Partial<Record<JourneyRole, number>> = {};
  const bagMap: Record<string, BagBreakdown> = {};
  for (const b of bags) {
    bagMap[b.id] = { bagId: b.id, bagName: b.name, total: 0, packed: 0 };
  }
  const unassignedBreakdown: BagBreakdown = {
    bagId: "",
    bagName: "Unassigned",
    total: 0,
    packed: 0,
  };

  for (const i of items) {
    const isPacked = PACKED_STATUSES.has(i.status);
    if (isPacked) packed++;
    if (!i.bagId && i.status !== "consumed" && i.status !== "thrown_away") unassigned++;
    if (i.status === "lost_unaccounted_for") lost++;
    if (i.critical) {
      criticalTotal++;
      if (isPacked || i.status === "brought_back") criticalPacked++;
      else criticalMissing++;
    }
    if (i.status === "bought_during_trip") bought++;
    if (i.status === "laundry_dirty") laundry++;
    if (i.status === "brought_back") broughtBack++;
    if (i.journeyRole === "consumable") consumables++;
    if (i.returnExpected) returnExpected++;
    else notReturning++;

    byStatus[i.status] = (byStatus[i.status] ?? 0) + 1;
    byCategory[i.category] = (byCategory[i.category] ?? 0) + 1;
    byJourneyRole[i.journeyRole] = (byJourneyRole[i.journeyRole] ?? 0) + 1;

    if (i.bagId && bagMap[i.bagId]) {
      bagMap[i.bagId].total++;
      if (isPacked) bagMap[i.bagId].packed++;
    } else if (!i.bagId) {
      unassignedBreakdown.total++;
      if (isPacked) unassignedBreakdown.packed++;
    }
  }

  const byBag: BagBreakdown[] = [...Object.values(bagMap)];
  if (unassignedBreakdown.total > 0) byBag.push(unassignedBreakdown);
  byBag.sort((a, b) => b.total - a.total);

  const returnIssues = items.filter(
    (i) => i.returnExpected && i.status !== "brought_back" && i.status !== "lost_unaccounted_for"
  ).length;
  const unresolved =
    lost +
    unassigned +
    (trip.currentPhase === "return" || trip.currentPhase === "unpack" ? returnIssues : 0);

  return {
    total,
    packed,
    unassigned,
    lost,
    unresolved,
    criticalMissing,
    criticalTotal,
    criticalPacked,
    bought,
    laundry,
    broughtBack,
    consumables,
    returnExpected,
    notReturning,
    byStatus,
    byCategory,
    byJourneyRole,
    byBag,
  };
}

export function formatDateRange(start: string, end: string): string {
  if (!start && !end) return "";
  const fmt = (s: string) => {
    if (!s) return "";
    try {
      const d = new Date(s + "T00:00:00");
      return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    } catch {
      return s;
    }
  };
  if (start && end) {
    if (start === end) return fmt(start);
    return `${fmt(start)} – ${fmt(end)}`;
  }
  return fmt(start || end);
}

export function tripDurationDays(start: string, end: string): number | null {
  if (!start || !end) return null;
  try {
    const a = new Date(start + "T00:00:00").getTime();
    const b = new Date(end + "T00:00:00").getTime();
    if (isNaN(a) || isNaN(b)) return null;
    const diff = Math.round((b - a) / (24 * 60 * 60 * 1000)) + 1;
    return diff > 0 ? diff : null;
  } catch {
    return null;
  }
}
