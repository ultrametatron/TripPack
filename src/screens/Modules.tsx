import { useMemo, useState } from "react";
import { useStore } from "../store";
import { navigate } from "../App";
import { Modal, EmptyState } from "../components/ui";
import {
  BAG_TYPE_LABEL,
  CATEGORY_LABEL,
  JOURNEY_LABEL,
  type BagType,
  type Category,
  type JourneyRole,
  type Module,
  type ModuleItem,
} from "../types";
import { uid } from "../storage";

export default function Modules() {
  const { state, addModule, updateModule, deleteModule, duplicateModule } = useStore();
  const [openId, setOpenId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [creatingName, setCreatingName] = useState("");
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState("");

  const modules = useMemo(
    () => [...state.modules].sort((a, b) => a.name.localeCompare(b.name)),
    [state.modules]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? modules.filter(
          (m) =>
            m.name.toLowerCase().includes(q) ||
            (m.description && m.description.toLowerCase().includes(q))
        )
      : modules;
  }, [modules, query]);

  const openModule = openId ? state.modules.find((m) => m.id === openId) ?? null : null;

  return (
    <div className="px-4 pt-4">
      <header className="flex items-center justify-between mb-3">
        <div>
          <button className="btn-ghost mb-1 -ml-2" onClick={() => navigate({ name: "home" })}>
            ← Trips
          </button>
          <h1 className="text-xl font-bold">Modules</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Reusable groups of items.</p>
        </div>
        <button className="btn-primary" onClick={() => setCreating(true)}>
          + New
        </button>
      </header>

      {modules.length > 0 && (
        <div className="relative mb-3">
          <input
            className="input pr-9"
            placeholder="Search modules"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query.length > 0 && (
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 tap text-slate-400 dark:text-slate-500 px-2"
              onClick={() => setQuery("")}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {modules.length === 0 ? (
        <EmptyState
          title="No modules yet"
          body="Create a module to reuse across trips."
          action={
            <button className="btn-primary" onClick={() => setCreating(true)}>
              + Create module
            </button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No matches"
          body={`Nothing matched "${query}".`}
          action={
            <button className="btn-secondary" onClick={() => setQuery("")}>
              Clear search
            </button>
          }
        />
      ) : (
        <ul className="space-y-2">
          {filtered.map((m) => (
            <li key={m.id} className="card p-3">
              <button className="w-full text-left" onClick={() => setOpenId(m.id)}>
                <div className="font-semibold text-slate-900 dark:text-slate-100">{m.name}</div>
                {m.description && (
                  <div className="text-xs text-slate-500 mt-0.5 dark:text-slate-400">{m.description}</div>
                )}
                <div className="text-xs text-slate-400 mt-1 dark:text-slate-500">
                  {m.defaultItems.length} item{m.defaultItems.length === 1 ? "" : "s"}
                </div>
              </button>
              <div className="mt-2 flex gap-2 justify-end border-t border-slate-100 pt-2 dark:border-slate-700">
                <button className="btn-ghost" onClick={() => duplicateModule(m.id)}>
                  Duplicate
                </button>
                <button
                  className="btn-ghost text-danger-600"
                  onClick={() => setConfirmDeleteId(m.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={creating}
        onClose={() => {
          setCreating(false);
          setCreatingName("");
        }}
        title="New module"
        footer={
          <>
            <button
              className="btn-secondary"
              onClick={() => {
                setCreating(false);
                setCreatingName("");
              }}
            >
              Cancel
            </button>
            <button
              className="btn-primary"
              disabled={!creatingName.trim()}
              onClick={() => {
                const m = addModule(creatingName.trim());
                setCreating(false);
                setCreatingName("");
                setOpenId(m.id);
              }}
            >
              Create
            </button>
          </>
        }
      >
        <label className="label">Name</label>
        <input
          className="input"
          autoFocus
          value={creatingName}
          onChange={(e) => setCreatingName(e.target.value)}
          placeholder="e.g. Cold Weather Clothes"
        />
      </Modal>

      <Modal
        open={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        title="Delete module?"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setConfirmDeleteId(null)}>
              Cancel
            </button>
            <button
              className="btn-danger"
              onClick={() => {
                if (confirmDeleteId) deleteModule(confirmDeleteId);
                setConfirmDeleteId(null);
              }}
            >
              Delete
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">This cannot be undone.</p>
      </Modal>

      {openModule && (
        <ModuleEditor
          module={openModule}
          onClose={() => setOpenId(null)}
          onSave={(m) => updateModule(m)}
        />
      )}
    </div>
  );
}

function ModuleEditor({
  module,
  onClose,
  onSave,
}: {
  module: Module;
  onClose: () => void;
  onSave: (m: Module) => void;
}) {
  const [name, setName] = useState(module.name);
  const [description, setDescription] = useState(module.description);
  const [items, setItems] = useState<ModuleItem[]>(module.defaultItems);
  const [editingId, setEditingId] = useState<string | null>(null);

  const update = (next: Partial<Module>) => onSave({ ...module, name, description, defaultItems: items, ...next });

  const addBlank = () => {
    const blank: ModuleItem = {
      id: uid("mi"),
      name: "New item",
      quantity: 1,
      category: "miscellaneous",
      journeyRole: "bring_both_ways",
      returnExpected: true,
      critical: false,
    };
    const next = [...items, blank];
    setItems(next);
    setEditingId(blank.id);
    onSave({ ...module, name, description, defaultItems: next });
  };

  const removeItem = (id: string) => {
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    onSave({ ...module, name, description, defaultItems: next });
  };

  return (
    <Modal
      open={true}
      onClose={onClose}
      title="Edit module"
      footer={<button className="btn-primary" onClick={onClose}>Done</button>}
    >
      <div className="space-y-3">
        <div>
          <label className="label">Name</label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => update({})}
          />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea
            className="input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => update({})}
          />
        </div>

        <div className="flex items-center justify-between mt-1">
          <label className="label !mb-0">Items</label>
          <button className="btn-secondary !py-1.5" onClick={addBlank}>
            + Add item
          </button>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No items yet.</p>
        ) : (
          <ul className="space-y-2">
            {items.map((it) => (
              <li key={it.id} className="card p-2">
                {editingId === it.id ? (
                  <ModuleItemForm
                    item={it}
                    onChange={(next) => {
                      const updated = items.map((i) => (i.id === next.id ? next : i));
                      setItems(updated);
                      onSave({ ...module, name, description, defaultItems: updated });
                    }}
                    onClose={() => setEditingId(null)}
                    onDelete={() => removeItem(it.id)}
                  />
                ) : (
                  <button
                    className="w-full text-left"
                    onClick={() => setEditingId(it.id)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-medium text-slate-900 truncate dark:text-slate-100">
                          {it.name}{" "}
                          {it.quantity > 1 && (
                            <span className="text-slate-400 font-normal dark:text-slate-500">×{it.quantity}</span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 dark:text-slate-400">
                          {CATEGORY_LABEL[it.category]}
                          {it.defaultBagType && ` · ${BAG_TYPE_LABEL[it.defaultBagType]}`}
                          {` · ${JOURNEY_LABEL[it.journeyRole]}`}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {it.critical && (
                          <span className="badge bg-danger-100 text-danger-600 dark:bg-danger-500/20 dark:text-danger-500">Critical</span>
                        )}
                        {!it.returnExpected && (
                          <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">No return</span>
                        )}
                      </div>
                    </div>
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
}

function ModuleItemForm({
  item,
  onChange,
  onClose,
  onDelete,
}: {
  item: ModuleItem;
  onChange: (next: ModuleItem) => void;
  onClose: () => void;
  onDelete: () => void;
}) {
  const set = (patch: Partial<ModuleItem>) => onChange({ ...item, ...patch });
  return (
    <div className="space-y-2">
      <input
        className="input"
        value={item.name}
        onChange={(e) => set({ name: e.target.value })}
        autoFocus
      />
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label">Qty</label>
          <input
            type="number"
            min={1}
            className="input"
            value={item.quantity}
            onChange={(e) => set({ quantity: Math.max(1, Number(e.target.value) || 1) })}
          />
        </div>
        <div>
          <label className="label">Category</label>
          <select
            className="input"
            value={item.category}
            onChange={(e) => set({ category: e.target.value as Category })}
          >
            {Object.entries(CATEGORY_LABEL).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label">Default bag</label>
          <select
            className="input"
            value={item.defaultBagType ?? ""}
            onChange={(e) =>
              set({ defaultBagType: (e.target.value || undefined) as BagType | undefined })
            }
          >
            <option value="">— none —</option>
            {Object.entries(BAG_TYPE_LABEL).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Journey role</label>
          <select
            className="input"
            value={item.journeyRole}
            onChange={(e) => set({ journeyRole: e.target.value as JourneyRole })}
          >
            {Object.entries(JOURNEY_LABEL).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex gap-3 flex-wrap text-sm">
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={item.critical}
            onChange={(e) => set({ critical: e.target.checked })}
          />
          Critical
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={item.returnExpected}
            onChange={(e) => set({ returnExpected: e.target.checked })}
          />
          Return expected
        </label>
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <button className="btn-ghost text-danger-600" onClick={onDelete}>
          Delete
        </button>
        <button className="btn-primary" onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  );
}
