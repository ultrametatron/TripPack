import { useState } from "react";
import type { Bag, BagType, Item, Trip } from "../../types";
import { BAG_TYPE_LABEL } from "../../types";
import { useStore } from "../../store";
import { Modal, EmptyState, SectionHeader } from "../ui";
import { ItemRow } from "../ItemRow";
import AddItemBar from "../AddItemBar";
import ModulePickerRow from "../ModulePickerRow";

export default function PlanTab({ trip, bags, items }: { trip: Trip; bags: Bag[]; items: Item[] }) {
  const { state, applyModulesToTrip, addBag, updateBag, deleteBag, saveTripAsModule } = useStore();
  const [openApply, setOpenApply] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [newBagOpen, setNewBagOpen] = useState(false);
  const [bagName, setBagName] = useState("");
  const [bagType, setBagType] = useState<BagType>("custom");
  const [editingBagId, setEditingBagId] = useState<string | null>(null);
  const [savingModule, setSavingModule] = useState(false);
  const [moduleName, setModuleName] = useState("");

  const itemsByBag = groupByBag(items, bags);

  return (
    <div className="space-y-4 pb-6">
      <div className="flex flex-wrap gap-2">
        <button className="btn-primary" onClick={() => setOpenApply(true)}>
          + Apply modules
        </button>
        <button className="btn-secondary" onClick={() => setNewBagOpen(true)}>
          + Add bag
        </button>
        <button
          className="btn-secondary"
          disabled={items.length === 0}
          onClick={() => setSavingModule(true)}
        >
          Save as module
        </button>
      </div>

      <AddItemBar tripId={trip.id} bags={bags} placeholder="Quick add item" />

      {items.length === 0 && (
        <EmptyState
          title="Empty packing list"
          body="Apply a module or add items to start planning."
        />
      )}

      {itemsByBag.map(({ bag, list }) => (
        <section key={bag?.id ?? "unassigned"}>
          <SectionHeader title={bag ? bag.name : "Unassigned"} count={list.length} />
          {bag && (
            <div className="flex items-center gap-2 mb-2">
              {editingBagId === bag.id ? (
                <input
                  autoFocus
                  className="input !py-1.5 text-sm"
                  defaultValue={bag.name}
                  onBlur={(e) => {
                    const v = e.target.value.trim();
                    if (v && v !== bag.name) updateBag({ ...bag, name: v });
                    setEditingBagId(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                    if (e.key === "Escape") setEditingBagId(null);
                  }}
                />
              ) : (
                <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                  {bag.name}
                </span>
              )}
              <button
                className="btn-ghost !py-1.5"
                onClick={() => setEditingBagId(bag.id)}
              >
                Rename
              </button>
              <button
                className="btn-ghost text-danger-600 !py-1.5"
                onClick={() => deleteBag(bag.id)}
              >
                Remove
              </button>
            </div>
          )}
          <div className="space-y-2">
            {list.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">No items.</p>
            ) : (
              list.map((it) => <ItemRow key={it.id} item={it} bags={bags} />)
            )}
          </div>
        </section>
      ))}

      <Modal
        open={openApply}
        onClose={() => {
          setOpenApply(false);
          setSelected([]);
        }}
        title="Apply modules"
        footer={
          <>
            <button
              className="btn-secondary"
              onClick={() => {
                setOpenApply(false);
                setSelected([]);
              }}
            >
              Cancel
            </button>
            <button
              className="btn-primary"
              disabled={selected.length === 0}
              onClick={() => {
                applyModulesToTrip(trip.id, selected);
                setOpenApply(false);
                setSelected([]);
              }}
            >
              Apply ({selected.length})
            </button>
          </>
        }
      >
        <ul className="space-y-2">
          {state.modules.map((m) => (
            <ModulePickerRow
              key={m.id}
              module={m}
              checked={selected.includes(m.id)}
              onToggle={() =>
                setSelected((prev) =>
                  prev.includes(m.id) ? prev.filter((x) => x !== m.id) : [...prev, m.id]
                )
              }
            />
          ))}
        </ul>
      </Modal>

      <Modal
        open={newBagOpen}
        onClose={() => setNewBagOpen(false)}
        title="Add bag"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setNewBagOpen(false)}>
              Cancel
            </button>
            <button
              className="btn-primary"
              disabled={!bagName.trim()}
              onClick={() => {
                addBag(trip.id, bagName.trim(), bagType);
                setBagName("");
                setBagType("custom");
                setNewBagOpen(false);
              }}
            >
              Add
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="label">Bag name</label>
            <input
              className="input"
              value={bagName}
              onChange={(e) => setBagName(e.target.value)}
              placeholder="e.g. Tech pouch"
              autoFocus
            />
          </div>
          <div>
            <label className="label">Type</label>
            <select
              className="input"
              value={bagType}
              onChange={(e) => setBagType(e.target.value as BagType)}
            >
              {Object.entries(BAG_TYPE_LABEL).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Modal>

      <Modal
        open={savingModule}
        onClose={() => {
          setSavingModule(false);
          setModuleName("");
        }}
        title="Save trip items as module"
        footer={
          <>
            <button
              className="btn-secondary"
              onClick={() => {
                setSavingModule(false);
                setModuleName("");
              }}
            >
              Cancel
            </button>
            <button
              className="btn-primary"
              disabled={!moduleName.trim()}
              onClick={() => {
                saveTripAsModule(trip.id, moduleName.trim(), `Saved from ${trip.name}`);
                setSavingModule(false);
                setModuleName("");
              }}
            >
              Save
            </button>
          </>
        }
      >
        <label className="label">Module name</label>
        <input
          className="input"
          value={moduleName}
          onChange={(e) => setModuleName(e.target.value)}
          autoFocus
        />
        <p className="text-xs text-slate-500 mt-2 dark:text-slate-400">
          Items become defaults for future trips. Statuses and bag IDs aren't copied.
        </p>
      </Modal>
    </div>
  );
}

function groupByBag(items: Item[], bags: Bag[]) {
  const groups: { bag: Bag | null; list: Item[] }[] = bags.map((b) => ({ bag: b, list: [] }));
  const unassigned: { bag: Bag | null; list: Item[] } = { bag: null, list: [] };
  for (const it of items) {
    const g = groups.find((x) => x.bag?.id === it.bagId);
    if (g) g.list.push(it);
    else unassigned.list.push(it);
  }
  const result = groups.filter((g) => g.list.length > 0);
  if (unassigned.list.length > 0) result.push(unassigned);
  // Empty bags shown after non-empty
  const empty = groups.filter((g) => g.list.length === 0);
  return [...result, ...empty];
}
