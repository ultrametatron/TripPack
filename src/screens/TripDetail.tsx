import { useMemo, useState } from "react";
import { useStore, useTrip } from "../store";
import { navigate } from "../App";
import { Modal, ProgressBar, Badge, EmptyState } from "../components/ui";
import {
  PHASE_LABEL,
  TRIP_TYPE_LABEL,
  type LifecyclePhase,
  type Activity,
  ACTIVITY_LABEL,
} from "../types";
import {
  formatDateRange,
  packedCompletionLabel,
  summarizeTrip,
  tripDurationDays,
} from "../utils/tripSummary";
import PlanTab from "../components/tabs/PlanTab";
import PackTab from "../components/tabs/PackTab";
import DuringTripTab from "../components/tabs/DuringTripTab";
import ReturnPackTab from "../components/tabs/ReturnPackTab";
import UnpackTab from "../components/tabs/UnpackTab";
import TripStatsCards from "../components/TripStatsCards";

const PHASES: LifecyclePhase[] = ["plan", "pack", "during", "return", "unpack"];

export default function TripDetail({ tripId }: { tripId: string }) {
  const data = useTrip(tripId);
  const { setPhase, deleteTrip } = useStore();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!data) {
    return (
      <div className="px-4 pt-4">
        <button className="btn-ghost mb-2 -ml-2" onClick={() => navigate({ name: "home" })}>
          ← Trips
        </button>
        <EmptyState title="Trip not found" />
      </div>
    );
  }
  const { trip, bags, items } = data;
  const summary = summarizeTrip(trip, items, bags);
  const days = tripDurationDays(trip.startDate, trip.endDate);

  return (
    <div>
      <div className="px-4 pt-4">
        <button className="btn-ghost mb-2 -ml-2" onClick={() => navigate({ name: "home" })}>
          ← Trips
        </button>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-xl font-bold truncate">{trip.name}</h1>
            <div className="text-sm text-slate-500 truncate dark:text-slate-400">
              {trip.destination}
              {(trip.startDate || trip.endDate) && (
                <span> · {formatDateRange(trip.startDate, trip.endDate)}</span>
              )}
              {days && <span> · {days}d</span>}
            </div>
          </div>
          <button className="btn-secondary" onClick={() => setEditing(true)}>
            Edit
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          <Badge tone="brand">{PHASE_LABEL[trip.currentPhase]}</Badge>
          <Badge tone="neutral">{TRIP_TYPE_LABEL[trip.tripType]}</Badge>
          {trip.remoteWorkRequired && <Badge tone="neutral">Remote work</Badge>}
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1 dark:text-slate-400">
            <span>
              {summary.packed} / {summary.total} {packedCompletionLabel(trip.currentPhase)}
            </span>
            {summary.criticalMissing > 0 && (
              <span className="text-danger-600 font-semibold dark:text-danger-500">
                {summary.criticalMissing} critical missing
              </span>
            )}
          </div>
          <ProgressBar value={summary.packed} max={summary.total || 1} />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {summary.lost > 0 && <Badge tone="danger">Lost: {summary.lost}</Badge>}
            {summary.unassigned > 0 && (
              <Badge tone="warn">Unassigned: {summary.unassigned}</Badge>
            )}
            {summary.unresolved > 0 && (
              <Badge tone="warn">Unresolved: {summary.unresolved}</Badge>
            )}
            {summary.bought > 0 && <Badge tone="brand">Bought: {summary.bought}</Badge>}
            {summary.laundry > 0 && <Badge tone="warn">Laundry: {summary.laundry}</Badge>}
          </div>
        </div>
      </div>

      <PhaseTabs current={trip.currentPhase} onChange={(p) => setPhase(trip.id, p)} />

      <div className="px-4 pt-3">
        {trip.currentPhase === "plan" && <PlanTab trip={trip} bags={bags} items={items} />}
        {trip.currentPhase === "pack" && <PackTab trip={trip} bags={bags} items={items} />}
        {trip.currentPhase === "during" && <DuringTripTab trip={trip} bags={bags} items={items} />}
        {trip.currentPhase === "return" && <ReturnPackTab trip={trip} bags={bags} items={items} />}
        {trip.currentPhase === "unpack" && <UnpackTab trip={trip} bags={bags} items={items} />}

        <TripStatsCards summary={summary} phase={trip.currentPhase} />
      </div>

      {editing && (
        <EditTripModal
          tripId={trip.id}
          onClose={() => setEditing(false)}
          onDelete={() => {
            setEditing(false);
            setConfirmDelete(true);
          }}
        />
      )}

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete trip?"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setConfirmDelete(false)}>
              Cancel
            </button>
            <button
              className="btn-danger"
              onClick={() => {
                deleteTrip(trip.id);
                navigate({ name: "home" });
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

    </div>
  );
}

function PhaseTabs({
  current,
  onChange,
}: {
  current: LifecyclePhase;
  onChange: (p: LifecyclePhase) => void;
}) {
  return (
    <div className="sticky top-0 z-20 bg-slate-50/95 backdrop-blur supports-[backdrop-filter]:bg-slate-50/80 border-b border-slate-200 mt-3 dark:bg-slate-950/90 dark:supports-[backdrop-filter]:bg-slate-950/70 dark:border-slate-700">
      <div className="max-w-screen-sm mx-auto overflow-x-auto no-scrollbar">
        <div className="flex">
          {PHASES.map((p) => {
            const active = p === current;
            return (
              <button
                key={p}
                onClick={() => onChange(p)}
                className={`tap flex-1 min-w-[80px] py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  active
                    ? "border-brand-500 text-brand-700 dark:text-brand-300"
                    : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                {PHASE_LABEL[p]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function EditTripModal({
  tripId,
  onClose,
  onDelete,
}: {
  tripId: string;
  onClose: () => void;
  onDelete: () => void;
}) {
  const { state, updateTrip } = useStore();
  const trip = state.trips.find((t) => t.id === tripId);
  const [name, setName] = useState(trip?.name ?? "");
  const [destination, setDestination] = useState(trip?.destination ?? "");
  const [startDate, setStartDate] = useState(trip?.startDate ?? "");
  const [endDate, setEndDate] = useState(trip?.endDate ?? "");
  const [activities, setActivities] = useState<Activity[]>(trip?.activities ?? []);
  const [notes, setNotes] = useState(trip?.notes ?? "");

  const allActs = useMemo(() => Object.entries(ACTIVITY_LABEL) as [Activity, string][], []);

  if (!trip) return null;

  return (
    <Modal
      open
      onClose={onClose}
      title="Edit trip"
      footer={
        <>
          <button className="btn-ghost text-danger-600" onClick={onDelete}>
            Delete
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              updateTrip({ ...trip, name, destination, startDate, endDate, activities, notes });
              onClose();
            }}
          >
            Save
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <div>
          <label className="label">Name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="label">Destination</label>
          <input
            className="input"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="label">Start</label>
            <input
              type="date"
              className="input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="label">End</label>
            <input
              type="date"
              className="input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="label">Activities</label>
          <div className="flex flex-wrap gap-2">
            {allActs.map(([v, l]) => {
              const sel = activities.includes(v);
              return (
                <button
                  type="button"
                  key={v}
                  onClick={() =>
                    setActivities((prev) =>
                      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
                    )
                  }
                  className={sel ? "field-chip-on" : "field-chip-off"}
                >
                  {l}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <label className="label">Notes</label>
          <textarea
            className="input"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
}
