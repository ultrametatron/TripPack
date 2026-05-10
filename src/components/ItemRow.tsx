import { useState } from "react";
import type { Bag, Item, ItemStatus, JourneyRole } from "../types";
import { JOURNEY_LABEL, STATUS_LABEL } from "../types";
import { Badge, JOURNEY_TONE, STATUS_TONE } from "./ui";
import { useStore } from "../store";

const PACKED_STATUSES = new Set<ItemStatus>(["packed", "packed_from_home"]);

const STATUS_OPTIONS: { value: ItemStatus; label: string }[] = [
  { value: "planned", label: STATUS_LABEL.planned },
  { value: "packed", label: STATUS_LABEL.packed },
  { value: "packed_from_home", label: STATUS_LABEL.packed_from_home },
  { value: "bought_during_trip", label: STATUS_LABEL.bought_during_trip },
  { value: "consumed", label: STATUS_LABEL.consumed },
  { value: "gifted", label: STATUS_LABEL.gifted },
  { value: "thrown_away", label: STATUS_LABEL.thrown_away },
  { value: "left_at_destination", label: STATUS_LABEL.left_at_destination },
  { value: "brought_back", label: STATUS_LABEL.brought_back },
  { value: "laundry_dirty", label: STATUS_LABEL.laundry_dirty },
  { value: "lost_unaccounted_for", label: STATUS_LABEL.lost_unaccounted_for },
  { value: "unpacked", label: STATUS_LABEL.unpacked },
  { value: "restock_needed", label: STATUS_LABEL.restock_needed },
];

export function ItemRow({
  item,
  bags,
  showCheckbox = true,
  expandable = true,
}: {
  item: Item;
  bags: Bag[];
  showCheckbox?: boolean;
  expandable?: boolean;
}) {
  const { setItemStatus, setItemBag, updateItem, deleteItem } = useStore();
  const [open, setOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState(item.name);

  const isPacked = PACKED_STATUSES.has(item.status);
  const isCriticalMissing = item.critical && !isPacked && item.status !== "brought_back";
  const isLost = item.status === "lost_unaccounted_for";

  const togglePacked = () => {
    setItemStatus(item.id, isPacked ? "planned" : "packed");
  };

  const bag = bags.find((b) => b.id === item.bagId);

  return (
    <div
      className={`card p-3 ${
        isLost
          ? "border-danger-500/60 bg-danger-50/40 dark:bg-danger-500/10 dark:border-danger-500/40"
          : isCriticalMissing
          ? "border-warn-500/60 bg-warn-50/40 dark:bg-warn-500/10 dark:border-warn-500/40"
          : ""
      }`}
    >
      <div className="flex items-start gap-3">
        {showCheckbox && (
          <button
            type="button"
            onClick={togglePacked}
            className={`mt-0.5 h-6 w-6 rounded-md border-2 flex items-center justify-center shrink-0 ${
              isPacked
                ? "bg-ok-500 border-ok-500 text-white"
                : "bg-white border-slate-300 text-transparent dark:bg-slate-800 dark:border-slate-600"
            }`}
            aria-label={isPacked ? "Mark not packed" : "Mark packed"}
          >
            ✓
          </button>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              {editingName ? (
                <input
                  className="input !py-1.5"
                  autoFocus
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  onBlur={() => {
                    if (draftName.trim() && draftName !== item.name) {
                      updateItem({ ...item, name: draftName.trim() });
                    }
                    setEditingName(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                    if (e.key === "Escape") {
                      setDraftName(item.name);
                      setEditingName(false);
                    }
                  }}
                />
              ) : (
                <button
                  className="text-left w-full"
                  onClick={() => expandable && setOpen((o) => !o)}
                >
                  <div className="text-base font-medium text-slate-900 truncate dark:text-slate-100">
                    {item.name}
                    {item.quantity > 1 && (
                      <span className="ml-1 text-slate-400 font-normal dark:text-slate-500">×{item.quantity}</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 truncate dark:text-slate-400">
                    {bag ? bag.name : "Unassigned"}
                  </div>
                </button>
              )}
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              {item.critical && <Badge tone="danger">Critical</Badge>}
              <Badge tone={STATUS_TONE[item.status]}>{STATUS_LABEL[item.status]}</Badge>
            </div>
          </div>

          {open && expandable && (
            <div className="mt-3 space-y-2 border-t border-slate-100 pt-3 dark:border-slate-700">
              <div className="flex flex-wrap gap-2 text-xs">
                <Badge tone={JOURNEY_TONE[item.journeyRole]}>
                  {JOURNEY_LABEL[item.journeyRole]}
                </Badge>
                {item.returnExpected ? (
                  <Badge tone="brand">Return expected</Badge>
                ) : (
                  <Badge tone="neutral">No return</Badge>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="label">Status</span>
                  <select
                    className="input !py-2"
                    value={item.status}
                    onChange={(e) => setItemStatus(item.id, e.target.value as ItemStatus)}
                  >
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="label">Bag</span>
                  <select
                    className="input !py-2"
                    value={item.bagId ?? ""}
                    onChange={(e) => setItemBag(item.id, e.target.value || undefined)}
                  >
                    <option value="">Unassigned</option>
                    {bags.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="label">Journey role</span>
                  <select
                    className="input !py-2"
                    value={item.journeyRole}
                    onChange={(e) =>
                      updateItem({ ...item, journeyRole: e.target.value as JourneyRole })
                    }
                  >
                    {Object.entries(JOURNEY_LABEL).map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="label">Qty</span>
                  <input
                    type="number"
                    min={1}
                    className="input !py-2"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem({
                        ...item,
                        quantity: Math.max(1, Number(e.target.value) || 1),
                      })
                    }
                  />
                </label>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-end gap-3">
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={item.critical}
                      onChange={(e) => updateItem({ ...item, critical: e.target.checked })}
                    />
                    Critical
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={item.returnExpected}
                      onChange={(e) => updateItem({ ...item, returnExpected: e.target.checked })}
                    />
                    Return
                  </label>
                </div>
              </div>
              <div className="flex justify-between pt-1">
                <button className="btn-ghost text-danger-600" onClick={() => deleteItem(item.id)}>
                  Delete
                </button>
                <button className="btn-secondary" onClick={() => setEditingName(true)}>
                  Rename
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
