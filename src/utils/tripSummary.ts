import type { Item, Trip } from "../types";

export interface TripSummary {
  total: number;
  packed: number;
  unassigned: number;
  lost: number;
  unresolved: number;
  criticalMissing: number;
  bought: number;
  laundry: number;
  broughtBack: number;
  consumables: number;
}

const PACKED_STATUSES = new Set(["packed", "packed_from_home"]);

export function summarizeTrip(trip: Trip, items: Item[]): TripSummary {
  const total = items.length;
  let packed = 0;
  let unassigned = 0;
  let lost = 0;
  let criticalMissing = 0;
  let bought = 0;
  let laundry = 0;
  let broughtBack = 0;
  let consumables = 0;
  for (const i of items) {
    if (PACKED_STATUSES.has(i.status)) packed++;
    if (!i.bagId && i.status !== "consumed" && i.status !== "thrown_away") unassigned++;
    if (i.status === "lost_unaccounted_for") lost++;
    if (i.critical && !PACKED_STATUSES.has(i.status) && i.status !== "brought_back") {
      criticalMissing++;
    }
    if (i.status === "bought_during_trip") bought++;
    if (i.status === "laundry_dirty") laundry++;
    if (i.status === "brought_back") broughtBack++;
    if (i.journeyRole === "consumable") consumables++;
  }
  // Return packing issues = items expected back but not yet brought back during return phase
  // We compute a generic "unresolved" indicator counting return-expected items not in a
  // resolved end state.
  const returnIssues = items.filter(
    (i) => i.returnExpected && i.status !== "brought_back" && i.status !== "lost_unaccounted_for"
  ).length;

  // Unresolved combines lost + unassigned + (return issues only when in return/unpack phase).
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
    bought,
    laundry,
    broughtBack,
    consumables,
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
