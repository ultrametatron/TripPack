import { useState } from "react";
import { useStore } from "../store";
import { navigate, ThemeToggle } from "../App";
import { ProgressBar, EmptyState, Modal, Badge } from "../components/ui";
import HowItWorks from "../components/HowItWorks";
import { TRIP_TYPE_LABEL, PHASE_LABEL } from "../types";
import { formatDateRange, summarizeTrip, tripDurationDays } from "../utils/tripSummary";

export default function Home() {
  const { state, cloneTrip, deleteTrip } = useStore();
  const [cloneSourceId, setCloneSourceId] = useState<string | null>(null);
  const [cloneName, setCloneName] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const trips = [...state.trips].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="px-4 pt-4">
      <header className="mb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight">TripPack</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Track everything you pack.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle />
            <button className="btn-primary" onClick={() => navigate({ name: "create" })}>
              + New
            </button>
          </div>
        </div>
        <button
          className="mt-3 inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold bg-brand-50 text-brand-700 border border-brand-100 active:opacity-70 dark:bg-brand-500/15 dark:text-brand-200 dark:border-brand-500/30"
          onClick={() => setShowHelp(true)}
        >
          <span aria-hidden>💡</span>
          New here? See how it works
          <span aria-hidden>→</span>
        </button>
      </header>

      {trips.length === 0 ? (
        <EmptyState
          title="No trips yet"
          body="Create your first trip and apply a packing module."
          action={
            <button className="btn-primary" onClick={() => navigate({ name: "create" })}>
              + Create trip
            </button>
          }
        />
      ) : (
        <ul className="space-y-3">
          {trips.map((trip) => {
            const items = state.items.filter((i) => i.tripId === trip.id);
            const s = summarizeTrip(trip, items);
            const days = tripDurationDays(trip.startDate, trip.endDate);
            return (
              <li key={trip.id} className="card p-4">
                <button
                  className="w-full text-left"
                  onClick={() => navigate({ name: "trip", tripId: trip.id })}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-semibold text-base text-slate-900 truncate dark:text-slate-100">
                        {trip.name || "Untitled trip"}
                      </div>
                      <div className="text-sm text-slate-500 truncate dark:text-slate-400">
                        {trip.destination || "No destination"}
                        {(trip.startDate || trip.endDate) && (
                          <span> · {formatDateRange(trip.startDate, trip.endDate)}</span>
                        )}
                        {days && <span> · {days}d</span>}
                      </div>
                    </div>
                    <Badge tone="brand">{PHASE_LABEL[trip.currentPhase]}</Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    <Badge tone="neutral">{TRIP_TYPE_LABEL[trip.tripType]}</Badge>
                    {trip.remoteWorkRequired && <Badge tone="neutral">Remote work</Badge>}
                    {trip.takingGiftsOrFood && <Badge tone="neutral">Gifts / food</Badge>}
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1 dark:text-slate-400">
                      <span>
                        {s.packed} / {s.total} packed
                      </span>
                      {s.criticalMissing > 0 && (
                        <span className="text-danger-600 font-semibold dark:text-danger-500">
                          {s.criticalMissing} critical missing
                        </span>
                      )}
                    </div>
                    <ProgressBar value={s.packed} max={s.total || 1} />
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {s.lost > 0 && <Badge tone="danger">Lost: {s.lost}</Badge>}
                      {s.unassigned > 0 && <Badge tone="warn">Unassigned: {s.unassigned}</Badge>}
                      {s.unresolved > 0 && (
                        <Badge tone="warn">Unresolved: {s.unresolved}</Badge>
                      )}
                    </div>
                  </div>
                </button>
                <div className="mt-3 flex gap-2 justify-end border-t border-slate-100 pt-3 dark:border-slate-700">
                  <button
                    className="btn-ghost"
                    onClick={() => {
                      setCloneSourceId(trip.id);
                      setCloneName(`${trip.name} (copy)`);
                    }}
                  >
                    Clone
                  </button>
                  <button
                    className="btn-ghost text-danger-600"
                    onClick={() => setConfirmDeleteId(trip.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Modal
        open={!!cloneSourceId}
        onClose={() => setCloneSourceId(null)}
        title="Clone trip"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setCloneSourceId(null)}>
              Cancel
            </button>
            <button
              className="btn-primary"
              disabled={!cloneName.trim()}
              onClick={() => {
                if (cloneSourceId && cloneName.trim()) {
                  cloneTrip(cloneSourceId, cloneName.trim());
                  setCloneSourceId(null);
                  setCloneName("");
                }
              }}
            >
              Clone
            </button>
          </>
        }
      >
        <label className="label">New trip name</label>
        <input
          className="input"
          value={cloneName}
          onChange={(e) => setCloneName(e.target.value)}
          placeholder="Trip name"
          autoFocus
        />
        <p className="text-xs text-slate-500 mt-2 dark:text-slate-400">
          Bags and items are copied; statuses reset to planned.
        </p>
      </Modal>

      <Modal
        open={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        title="Delete trip?"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setConfirmDeleteId(null)}>
              Cancel
            </button>
            <button
              className="btn-danger"
              onClick={() => {
                if (confirmDeleteId) {
                  deleteTrip(confirmDeleteId);
                  setConfirmDeleteId(null);
                }
              }}
            >
              Delete
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          This permanently removes the trip and all its items and bags.
        </p>
      </Modal>

      {showHelp && <HowItWorks onClose={() => setShowHelp(false)} />}
    </div>
  );
}
