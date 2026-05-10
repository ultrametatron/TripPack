import { useMemo, useState } from "react";
import type { Bag, BagType, Item, ItemStatus, Trip } from "../../types";
import { BAG_TYPE_LABEL, CATEGORY_LABEL } from "../../types";
import { useStore } from "../../store";
import { Modal, EmptyState, SectionHeader, Badge } from "../ui";
import { ItemRow } from "../ItemRow";
import AddItemBar from "../AddItemBar";
import ModulePickerRow from "../ModulePickerRow";
import { SwipeRow } from "../SwipeRow";

type Filter = "all" | "unpacked" | "critical" | "unassigned";
type GroupBy = "bag" | "category";

const PACKED_STATUSES = new Set<ItemStatus>(["packed", "packed_from_home"]);

export default function PlanPackTab({ trip, bags, items }: { trip: Trip; bags: Bag[]; items: Item[] }) {
  const {
    state,
    applyModulesToTrip,
    addBag,
    updateBag,
    deleteBag,
    deleteItem,
    saveTripAsModule,
    setItemsStatus,
  } = useStore();

  // Filter / grouping state (carried from the old Pack tab).
  const [filter, setFilter] = useState<Filter>("all");
  const [groupBy, setGroupBy] = useState<GroupBy>("bag");

  // Modals (carried from the old Plan tab).
  const [openApply, setOpenApply] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [newBagOpen, setNewBagOpen] = useState(false);
  const [bagName, setBagName] = useState("");
  const [bagType, setBagType] = useState<BagType>("custom");
  const [editingBagId, setEditingBagId] = useState<string | null>(null);
  const [savingModule, setSavingModule] = useState(false);
  const [moduleName, setModuleName] = useState("");
  const [collapsedBags, setCollapsedBags] = useState<Set<string>>(new Set());

  const toggleCollapsed = (id: string) =>
    setCollapsedBags((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // Filter
  const filteredItems = useMemo(() => {
    return items.filter((i) => {
      if (filter === "critical") return i.critical;
      if (filter === "unpacked")
        return i.status !== "packed" && i.status !== "packed_from_home" && i.status !== "brought_back";
      if (filter === "unassigned") return !i.bagId;
      return true;
    });
  }, [items, filter]);

  return (
    <div className="space-y-4 pb-6">
      {/* Header actions */}
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

      {/* Filter chips + group-by toggle */}
      <FilterBar
        filter={filter}
        onFilter={setFilter}
        groupBy={groupBy}
        onGroupBy={setGroupBy}
        items={items}
      />

      <AddItemBar tripId={trip.id} bags={bags} placeholder="Quick add item" />

      {items.length === 0 ? (
        <EmptyState
          title="Empty packing list"
          body="Apply a module or add items to start planning."
        />
      ) : groupBy === "bag" ? (
        <BagGroupedView
          bags={bags}
          items={filteredItems}
          collapsedBags={collapsedBags}
          editingBagId={editingBagId}
          onToggleCollapsed={toggleCollapsed}
          onStartRename={setEditingBagId}
          onCommitRename={(bag, value) => {
            const v = value.trim();
            if (v && v !== bag.name) updateBag({ ...bag, name: v });
            setEditingBagId(null);
          }}
          onCancelRename={() => setEditingBagId(null)}
          onRemoveBag={(bagId) => deleteBag(bagId)}
          onPackAll={(itemIds) => setItemsStatus(itemIds, "packed")}
          onUnpackAll={(itemIds) => setItemsStatus(itemIds, "planned")}
          onDeleteItem={(itemId) => deleteItem(itemId)}
        />
      ) : (
        <CategoryGroupedView
          bags={bags}
          items={filteredItems}
          onDeleteItem={(itemId) => deleteItem(itemId)}
        />
      )}

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

function FilterBar({
  filter,
  onFilter,
  groupBy,
  onGroupBy,
  items,
}: {
  filter: Filter;
  onFilter: (f: Filter) => void;
  groupBy: GroupBy;
  onGroupBy: (g: GroupBy) => void;
  items: Item[];
}) {
  const criticalMissing = items.filter(
    (i) => i.critical && !PACKED_STATUSES.has(i.status)
  ).length;
  const unassigned = items.filter((i) => !i.bagId).length;
  const unpacked = items.filter((i) => i.status === "planned").length;

  const Tab = ({
    val,
    label,
    badge,
    tone,
  }: {
    val: Filter;
    label: string;
    badge?: number;
    tone?: "danger" | "warn" | "neutral";
  }) => (
    <button
      onClick={() => onFilter(val)}
      className={`chip whitespace-nowrap ${
        filter === val
          ? "bg-brand-50 border-brand-500 text-brand-700 dark:bg-brand-500/20 dark:border-brand-500 dark:text-brand-300"
          : "bg-white border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
      }`}
    >
      {label}
      {badge !== undefined && badge > 0 && <Badge tone={tone ?? "neutral"}>{badge}</Badge>}
    </button>
  );

  return (
    <div className="space-y-2">
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        <Tab val="all" label="All" />
        <Tab val="unpacked" label="Unpacked" badge={unpacked} tone="warn" />
        <Tab val="critical" label="Critical" badge={criticalMissing} tone="danger" />
        <Tab val="unassigned" label="Unassigned" badge={unassigned} tone="warn" />
      </div>
      <div className="flex gap-2 text-xs">
        <span className="text-slate-500 dark:text-slate-400">Group by</span>
        <button
          className={`underline ${groupBy === "bag" ? "text-brand-600 font-semibold dark:text-brand-300" : "text-slate-500 dark:text-slate-400"}`}
          onClick={() => onGroupBy("bag")}
        >
          Bag
        </button>
        <button
          className={`underline ${groupBy === "category" ? "text-brand-600 font-semibold dark:text-brand-300" : "text-slate-500 dark:text-slate-400"}`}
          onClick={() => onGroupBy("category")}
        >
          Category
        </button>
      </div>
    </div>
  );
}

function BagGroupedView({
  bags,
  items,
  collapsedBags,
  editingBagId,
  onToggleCollapsed,
  onStartRename,
  onCommitRename,
  onCancelRename,
  onRemoveBag,
  onPackAll,
  onUnpackAll,
  onDeleteItem,
}: {
  bags: Bag[];
  items: Item[];
  collapsedBags: Set<string>;
  editingBagId: string | null;
  onToggleCollapsed: (bagId: string) => void;
  onStartRename: (bagId: string) => void;
  onCommitRename: (bag: Bag, value: string) => void;
  onCancelRename: () => void;
  onRemoveBag: (bagId: string) => void;
  onPackAll: (itemIds: string[]) => void;
  onUnpackAll: (itemIds: string[]) => void;
  onDeleteItem: (itemId: string) => void;
}) {
  const groups = useMemo(() => groupByBag(items, bags), [items, bags]);

  return (
    <div className="space-y-4">
      {groups.map(({ bag, list }) => (
        <section key={bag?.id ?? "unassigned"}>
          {bag ? (
            <BagHeader
              bag={bag}
              list={list}
              collapsed={collapsedBags.has(bag.id)}
              editing={editingBagId === bag.id}
              onToggle={() => onToggleCollapsed(bag.id)}
              onStartRename={() => onStartRename(bag.id)}
              onCommitRename={(v) => onCommitRename(bag, v)}
              onCancelRename={onCancelRename}
              onRemove={() => onRemoveBag(bag.id)}
              onPackAll={(ids) => onPackAll(ids)}
              onUnpackAll={(ids) => onUnpackAll(ids)}
            />
          ) : (
            <SectionHeader title="Unassigned" count={list.length} />
          )}
          {!(bag && collapsedBags.has(bag.id)) && (
            <div className="space-y-2">
              {list.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400">No items.</p>
              ) : (
                list.map((it) => (
                  <SwipeRow key={it.id} onAction={() => onDeleteItem(it.id)}>
                    <ItemRow item={it} bags={bags} />
                  </SwipeRow>
                ))
              )}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}

function BagHeader({
  bag,
  list,
  collapsed,
  editing,
  onToggle,
  onStartRename,
  onCommitRename,
  onCancelRename,
  onRemove,
  onPackAll,
  onUnpackAll,
}: {
  bag: Bag;
  list: Item[];
  collapsed: boolean;
  editing: boolean;
  onToggle: () => void;
  onStartRename: () => void;
  onCommitRename: (value: string) => void;
  onCancelRename: () => void;
  onRemove: () => void;
  onPackAll: (itemIds: string[]) => void;
  onUnpackAll: (itemIds: string[]) => void;
}) {
  const packableIds = list
    .filter((i) => !PACKED_STATUSES.has(i.status))
    .map((i) => i.id);
  const allPackedIds = list
    .filter((i) => PACKED_STATUSES.has(i.status))
    .map((i) => i.id);
  const allPacked = list.length > 0 && packableIds.length === 0;

  return (
    <div className="mt-5 first:mt-0 mb-2 space-y-1">
      <div className="flex items-center gap-2">
        {editing ? (
          <input
            autoFocus
            className="flex-1 min-w-0 input !py-1.5 text-base font-semibold"
            defaultValue={bag.name}
            onBlur={(e) => onCommitRename(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              if (e.key === "Escape") onCancelRename();
            }}
          />
        ) : (
          <button
            type="button"
            className="flex-1 min-w-0 flex items-center gap-2 text-left"
            onClick={onToggle}
            aria-expanded={!collapsed}
          >
            <span
              aria-hidden
              className={`text-xs text-slate-400 dark:text-slate-500 transition-transform ${
                collapsed ? "-rotate-90" : ""
              }`}
            >
              ▾
            </span>
            <h3 className="flex-1 min-w-0 truncate text-base font-semibold text-slate-900 dark:text-slate-100">
              {bag.name}
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium tabular-nums">
              {list.length}
            </span>
          </button>
        )}
        <button className="btn-ghost !py-1.5" onClick={onStartRename}>
          Rename
        </button>
        <button className="btn-ghost text-danger-600 !py-1.5" onClick={onRemove}>
          Remove
        </button>
      </div>
      {!editing && list.length > 0 && (
        <div className="flex gap-2 text-xs">
          {packableIds.length > 0 && (
            <button
              type="button"
              className="chip !py-1 !min-h-0 bg-brand-50 border-brand-500 text-brand-700 dark:bg-brand-500/20 dark:border-brand-500 dark:text-brand-300"
              onClick={() => onPackAll(packableIds)}
            >
              Pack all ({packableIds.length})
            </button>
          )}
          {allPacked && allPackedIds.length > 0 && (
            <button
              type="button"
              className="chip !py-1 !min-h-0 bg-white border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
              onClick={() => onUnpackAll(allPackedIds)}
            >
              Unpack all ({allPackedIds.length})
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function CategoryGroupedView({
  bags,
  items,
  onDeleteItem,
}: {
  bags: Bag[];
  items: Item[];
  onDeleteItem: (itemId: string) => void;
}) {
  const byCat = useMemo(() => {
    const map: Record<string, Item[]> = {};
    for (const it of items) {
      map[it.category] = map[it.category] ?? [];
      map[it.category].push(it);
    }
    return Object.entries(map).map(([cat, list]) => ({
      key: cat,
      label: CATEGORY_LABEL[cat as keyof typeof CATEGORY_LABEL] ?? cat,
      items: list,
    }));
  }, [items]);

  return (
    <div className="space-y-4">
      {byCat.map((g) => (
        <section key={g.key}>
          <SectionHeader title={g.label} count={g.items.length} />
          <div className="space-y-2">
            {g.items.map((it) => (
              <SwipeRow key={it.id} onAction={() => onDeleteItem(it.id)}>
                <ItemRow item={it} bags={bags} />
              </SwipeRow>
            ))}
          </div>
        </section>
      ))}
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
