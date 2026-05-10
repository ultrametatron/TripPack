import { useMemo, useState } from "react";
import type { Bag, Item, ItemStatus, Trip } from "../../types";
import { useStore } from "../../store";
import { ItemRow } from "../ItemRow";
import { Modal, EmptyState, SectionHeader, Badge } from "../ui";
import AddItemBar from "../AddItemBar";

const QUICK_STATUSES: { value: ItemStatus; label: string; tone: "ok" | "warn" | "danger" | "brand" | "neutral" }[] = [
  { value: "consumed", label: "Consumed", tone: "neutral" },
  { value: "gifted", label: "Gifted", tone: "neutral" },
  { value: "laundry_dirty", label: "Laundry", tone: "warn" },
  { value: "thrown_away", label: "Trashed", tone: "neutral" },
  { value: "left_at_destination", label: "Left", tone: "neutral" },
  { value: "lost_unaccounted_for", label: "Lost", tone: "danger" },
];

export default function DuringTripTab({
  trip,
  bags,
  items,
}: {
  trip: Trip;
  bags: Bag[];
  items: Item[];
}) {
  const { setItemStatus, setItemBag, addItem } = useStore();
  const [filter, setFilter] = useState<"all" | "active" | "lost" | "laundry" | "bought">("active");
  const [movingItemId, setMovingItemId] = useState<string | null>(null);
  const [boughtOpen, setBoughtOpen] = useState(false);
  const [boughtName, setBoughtName] = useState("");
  const [boughtBag, setBoughtBag] = useState<string | undefined>(bags[0]?.id);
  const [boughtReturn, setBoughtReturn] = useState(true);

  const visible = useMemo(() => {
    return items.filter((i) => {
      if (filter === "lost") return i.status === "lost_unaccounted_for";
      if (filter === "laundry") return i.status === "laundry_dirty";
      if (filter === "bought") return i.status === "bought_during_trip";
      if (filter === "active") {
        return (
          i.status !== "consumed" &&
          i.status !== "thrown_away" &&
          i.status !== "left_at_destination" &&
          i.status !== "gifted"
        );
      }
      return true;
    });
  }, [items, filter]);

  const movingItem = movingItemId ? items.find((i) => i.id === movingItemId) : null;

  return (
    <div className="space-y-3 pb-6">
      <div className="flex flex-wrap gap-2">
        <button className="btn-primary" onClick={() => setBoughtOpen(true)}>
          + Bought item
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        <FilterChip current={filter} v="active" onSelect={setFilter} label="Active" />
        <FilterChip
          current={filter}
          v="bought"
          onSelect={setFilter}
          label="Bought"
          count={items.filter((i) => i.status === "bought_during_trip").length}
        />
        <FilterChip
          current={filter}
          v="laundry"
          onSelect={setFilter}
          label="Laundry"
          tone="warn"
          count={items.filter((i) => i.status === "laundry_dirty").length}
        />
        <FilterChip
          current={filter}
          v="lost"
          onSelect={setFilter}
          label="Lost"
          tone="danger"
          count={items.filter((i) => i.status === "lost_unaccounted_for").length}
        />
        <FilterChip current={filter} v="all" onSelect={setFilter} label="All" />
      </div>

      <AddItemBar tripId={trip.id} bags={bags} placeholder="Quick add (assumed packed_from_home)" defaultStatus="packed_from_home" />

      {visible.length === 0 ? (
        <EmptyState title="Nothing here" body="Try a different filter." />
      ) : (
        <>
          <SectionHeader title="Items" count={visible.length} />
          <ul className="space-y-2">
            {visible.map((item) => (
              <li key={item.id} className="card p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-base font-medium text-slate-900 truncate dark:text-slate-100">
                      {item.name}
                      {item.quantity > 1 && (
                        <span className="ml-1 text-slate-400 font-normal dark:text-slate-500">×{item.quantity}</span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 truncate dark:text-slate-400">
                      {bags.find((b) => b.id === item.bagId)?.name ?? "Unassigned"}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {item.critical && <Badge tone="danger">Critical</Badge>}
                    <Badge tone={item.status === "lost_unaccounted_for" ? "danger" : "neutral"}>
                      {item.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {QUICK_STATUSES.map((q) => {
                    const active = item.status === q.value;
                    return (
                      <button
                        key={q.value}
                        className={`chip text-xs ${
                          active
                            ? "bg-brand-600 border-brand-600 text-white"
                            : "bg-white border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                        }`}
                        onClick={() => setItemStatus(item.id, q.value)}
                      >
                        {q.label}
                      </button>
                    );
                  })}
                  <button
                    className="chip text-xs bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                    onClick={() => setMovingItemId(item.id)}
                  >
                    Move bag
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <Modal
        open={!!movingItem}
        onClose={() => setMovingItemId(null)}
        title="Move to bag"
        footer={<button className="btn-secondary" onClick={() => setMovingItemId(null)}>Close</button>}
      >
        <ul className="space-y-2">
          {bags.map((b) => (
            <li key={b.id}>
              <button
                className={`btn-secondary w-full justify-start ${
                  movingItem?.bagId === b.id ? "border-brand-500 text-brand-700" : ""
                }`}
                onClick={() => {
                  if (movingItem) setItemBag(movingItem.id, b.id);
                  setMovingItemId(null);
                }}
              >
                {b.name}
              </button>
            </li>
          ))}
          <li>
            <button
              className={`btn-secondary w-full justify-start ${
                movingItem && !movingItem.bagId ? "border-brand-500 text-brand-700" : ""
              }`}
              onClick={() => {
                if (movingItem) setItemBag(movingItem.id, undefined);
                setMovingItemId(null);
              }}
            >
              Unassigned
            </button>
          </li>
        </ul>
      </Modal>

      <Modal
        open={boughtOpen}
        onClose={() => {
          setBoughtOpen(false);
          setBoughtName("");
        }}
        title="Add bought item"
        footer={
          <>
            <button
              className="btn-secondary"
              onClick={() => {
                setBoughtOpen(false);
                setBoughtName("");
              }}
            >
              Cancel
            </button>
            <button
              className="btn-primary"
              disabled={!boughtName.trim()}
              onClick={() => {
                addItem({
                  tripId: trip.id,
                  name: boughtName.trim(),
                  quantity: 1,
                  category: "miscellaneous",
                  bagId: boughtBag,
                  status: "bought_during_trip",
                  journeyRole: boughtReturn ? "bring_both_ways" : "bought_on_trip",
                  returnExpected: boughtReturn,
                  critical: false,
                });
                setBoughtName("");
                setBoughtOpen(false);
              }}
            >
              Add
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="label">Item</label>
            <input
              className="input"
              autoFocus
              value={boughtName}
              onChange={(e) => setBoughtName(e.target.value)}
              placeholder="What did you buy?"
            />
          </div>
          <div>
            <label className="label">Bag</label>
            <select
              className="input"
              value={boughtBag ?? ""}
              onChange={(e) => setBoughtBag(e.target.value || undefined)}
            >
              <option value="">Unassigned</option>
              {bags.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={boughtReturn}
              onChange={(e) => setBoughtReturn(e.target.checked)}
            />
            Bringing this back home
          </label>
        </div>
      </Modal>
    </div>
  );
}

function FilterChip<T extends string>({
  current,
  v,
  onSelect,
  label,
  count,
  tone,
}: {
  current: T;
  v: T;
  onSelect: (v: T) => void;
  label: string;
  count?: number;
  tone?: "warn" | "danger" | "neutral";
}) {
  const active = current === v;
  return (
    <button
      className={`chip whitespace-nowrap ${
        active
          ? "bg-brand-50 border-brand-500 text-brand-700 dark:bg-brand-500/20 dark:border-brand-500 dark:text-brand-300"
          : "bg-white border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
      }`}
      onClick={() => onSelect(v)}
    >
      {label}
      {count !== undefined && count > 0 && <Badge tone={tone ?? "neutral"}>{count}</Badge>}
    </button>
  );
}
