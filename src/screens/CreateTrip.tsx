import { useState } from "react";
import { useStore } from "../store";
import { navigate } from "../App";
import ModulePickerRow from "../components/ModulePickerRow";
import {
  ACTIVITY_LABEL,
  TRANSPORT_LABEL,
  TRIP_TYPE_LABEL,
  type Activity,
  type LaundryAccess,
  type TransportMode,
  type TripType,
} from "../types";

export default function CreateTrip() {
  const { addTrip, applyModulesToTrip, state } = useStore();

  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [tripType, setTripType] = useState<TripType>("holiday");
  const [transportMode, setTransportMode] = useState<TransportMode>("flight");
  const [remoteWorkRequired, setRemoteWorkRequired] = useState(false);
  const [laundryAccess, setLaundryAccess] = useState<LaundryAccess>("unknown");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [takingGiftsOrFood, setTakingGiftsOrFood] = useState(false);
  const [notes, setNotes] = useState("");

  const [createdTripId, setCreatedTripId] = useState<string | null>(null);
  const [selectedModuleIds, setSelectedModuleIds] = useState<string[]>([]);

  const toggleActivity = (a: Activity) =>
    setActivities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));

  const onCreate = () => {
    if (!name.trim()) return;
    const trip = addTrip({
      name: name.trim(),
      destination: destination.trim(),
      startDate,
      endDate,
      tripType,
      transportMode,
      remoteWorkRequired,
      laundryAccess,
      activities,
      takingGiftsOrFood,
      notes: notes.trim(),
    });
    setCreatedTripId(trip.id);
  };

  if (createdTripId) {
    const recommended = recommendModules(state.modules, {
      remoteWorkRequired,
      tripType,
      activities,
      transportMode,
      takingGiftsOrFood,
    });
    return (
      <div className="px-4 pt-4">
        <header className="mb-3">
          <button className="btn-ghost mb-2 -ml-2" onClick={() => navigate({ name: "home" })}>
            ← Trips
          </button>
          <h1 className="text-2xl font-bold tracking-tight">Apply modules</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Pick modules to seed your packing list. You can edit everything afterwards.
          </p>
        </header>
        <ul className="space-y-2">
          {state.modules.map((m) => (
            <ModulePickerRow
              key={m.id}
              module={m}
              checked={selectedModuleIds.includes(m.id)}
              recommended={recommended.includes(m.id)}
              onToggle={() =>
                setSelectedModuleIds((prev) =>
                  prev.includes(m.id) ? prev.filter((x) => x !== m.id) : [...prev, m.id]
                )
              }
            />
          ))}
        </ul>
        <div className="mt-4 flex gap-2 sticky bottom-20">
          <button
            className="btn-secondary flex-1"
            onClick={() => navigate({ name: "trip", tripId: createdTripId })}
          >
            Skip
          </button>
          <button
            className="btn-primary flex-1"
            onClick={() => {
              if (selectedModuleIds.length > 0) {
                applyModulesToTrip(createdTripId, selectedModuleIds);
              }
              navigate({ name: "trip", tripId: createdTripId });
            }}
          >
            Apply {selectedModuleIds.length > 0 ? `(${selectedModuleIds.length})` : ""}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4">
      <header className="mb-3">
        <button className="btn-ghost mb-2 -ml-2" onClick={() => navigate({ name: "home" })}>
          ← Trips
        </button>
        <h1 className="text-2xl font-bold tracking-tight">New trip</h1>
      </header>

      <div className="space-y-3">
        <Field label="Trip name">
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Weekend with family"
            autoFocus
          />
        </Field>
        <Field label="Destination">
          <input
            className="input"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="City or place"
          />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="min-w-0">
            <Field label="Start date">
              <input
                type="date"
                className="input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Field>
          </div>
          <div className="min-w-0">
            <Field label="End date">
              <input
                type="date"
                className="input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Field>
          </div>
        </div>

        <Field label="Trip type">
          <ChipGroup
            value={tripType}
            onChange={(v) => setTripType(v as TripType)}
            options={Object.entries(TRIP_TYPE_LABEL).map(([v, l]) => ({ value: v, label: l }))}
          />
        </Field>

        <Field label="Transport mode">
          <ChipGroup
            value={transportMode}
            onChange={(v) => setTransportMode(v as TransportMode)}
            options={Object.entries(TRANSPORT_LABEL).map(([v, l]) => ({ value: v, label: l }))}
          />
        </Field>

        <div className="grid grid-cols-2 gap-2">
          <ToggleField
            label="Remote work"
            value={remoteWorkRequired}
            onChange={setRemoteWorkRequired}
          />
          <ToggleField
            label="Gifts / food"
            value={takingGiftsOrFood}
            onChange={setTakingGiftsOrFood}
          />
        </div>

        <Field label="Laundry access">
          <ChipGroup
            value={laundryAccess}
            onChange={(v) => setLaundryAccess(v as LaundryAccess)}
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
              { value: "unknown", label: "Unknown" },
            ]}
          />
        </Field>

        <Field label="Activities">
          <div className="flex flex-wrap gap-2">
            {Object.entries(ACTIVITY_LABEL).map(([v, l]) => {
              const selected = activities.includes(v as Activity);
              return (
                <button
                  key={v}
                  type="button"
                  className={selected ? "field-chip-on" : "field-chip-off"}
                  onClick={() => toggleActivity(v as Activity)}
                >
                  {l}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Notes">
          <textarea
            className="input min-h-[80px]"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything specific to remember"
          />
        </Field>
      </div>

      <div className="mt-5 flex gap-2 sticky bottom-20">
        <button className="btn-secondary flex-1" onClick={() => navigate({ name: "home" })}>
          Cancel
        </button>
        <button className="btn-primary flex-1" onClick={onCreate} disabled={!name.trim()}>
          Create trip
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

function ToggleField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      aria-label={label}
      onClick={() => onChange(!value)}
      className="flex items-center justify-between gap-2 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left dark:bg-slate-800 dark:border-slate-700"
    >
      <span className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
        {label}
      </span>
      <span
        aria-hidden
        className={`relative shrink-0 w-9 h-5 rounded-full transition-colors ${
          value ? "bg-brand-500" : "bg-slate-300 dark:bg-slate-700"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
            value ? "translate-x-4" : ""
          }`}
        />
      </span>
    </button>
  );
}

function ChipGroup<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            className={`chip ${
              selected
                ? "bg-brand-50 border-brand-500 text-brand-700"
                : "bg-white border-slate-200 text-slate-700"
            }`}
            onClick={() => onChange(o.value as T)}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function recommendModules(
  modules: { id: string; name: string }[],
  ctx: {
    remoteWorkRequired: boolean;
    tripType: TripType;
    activities: Activity[];
    transportMode: TransportMode;
    takingGiftsOrFood: boolean;
  }
): string[] {
  const matchByName = (substr: string) =>
    modules.find((m) => m.name.toLowerCase().includes(substr))?.id;
  const ids: (string | undefined)[] = [];
  ids.push(matchByName("base travel"));
  ids.push(matchByName("toiletries"));
  ids.push(matchByName("contact lens"));
  if (ctx.remoteWorkRequired) ids.push(matchByName("remote work"));
  if (ctx.activities.includes("gym_rehab")) ids.push(matchByName("gym"));
  if (ctx.activities.includes("beach")) ids.push(matchByName("warm weather"));
  if (ctx.tripType === "road_trip") ids.push(matchByName("road trip"));
  if (ctx.transportMode === "flight") ids.push(matchByName("flight shoulder"));
  if (ctx.takingGiftsOrFood || ctx.tripType === "visiting_family")
    ids.push(matchByName("family gifts"));
  return ids.filter((x): x is string => !!x);
}
