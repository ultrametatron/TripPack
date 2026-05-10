import { useMemo, useState } from "react";
import type { Bag, Item, ItemStatus, Trip } from "../../types";
import { useStore } from "../../store";
import { SectionHeader, EmptyState, Modal, Badge } from "../ui";
import { STATUS_LABEL } from "../../types";
import { STATUS_TONE } from "../ui";
import { navigate } from "../../App";

const NEEDS_ATTENTION = new Set<ItemStatus>([
  "planned",
  "packed",
  "packed_from_home",
  "bought_during_trip",
  "brought_back",
  "laundry_dirty",
  "moved_between_bags",
]);

const RESOLVED = new Set<ItemStatus>([
  "unpacked",
  "consumed",
  "gifted",
  "thrown_away",
  "left_at_destination",
  "restock_needed",
]);

export default function UnpackTab({
  trip,
  bags,
  items,
}: {
  trip: Trip;
  bags: Bag[];
  items: Item[];
}) {
  const { setItemStatus, setItemsStatus, deleteTrip, saveTripAsModule } = useStore();
  const [confirmClear, setConfirmClear] = useState(false);
  const [savingModule, setSavingModule] = useState(false);
  const [moduleName, setModuleName] = useState(trip.name + " template");

  const lost = useMemo(
    () => items.filter((i) => i.status === "lost_unaccounted_for"),
    [items]
  );
  const restock = useMemo(
    () => items.filter((i) => i.status === "restock_needed"),
    [items]
  );
  const attention = useMemo(
    () => items.filter((i) => NEEDS_ATTENTION.has(i.status)),
    [items]
  );
  const resolved = useMemo(
    () => items.filter((i) => RESOLVED.has(i.status) && i.status !== "restock_needed"),
    [items]
  );

  const bagGroups = useMemo(() => groupByBag(attention, bags), [attention, bags]);
  const empty = attention.length + lost.length + restock.length === 0;

  return (
    <div className="space-y-3 pb-6">
      <div className="card p-3 bg-ok-50 border-ok-100 dark:bg-ok-500/15 dark:border-ok-500/30">
        <div className="text-sm font-semibold text-ok-600 dark:text-ok-500">Unpack &amp; reset</div>
        <div className="text-xs text-ok-600/80 dark:text-ok-500/80">
          Mark a whole bag unpacked or laundered with one tap. Per-item actions
          are still available below each item.
        </div>
      </div>

      {empty && (
        <EmptyState
          title="Nothing to unpack"
          body="Save the trip as a module or clear it when you're done."
        />
      )}

      {bagGroups.length > 0 && (
        <section>
          <SectionHeader title="By bag" count={attention.length} />
          <div className="space-y-4">
            {bagGroups.map(({ bag, list }) => (
              <BagBlock
                key={bag?.id ?? "unassigned"}
                bag={bag}
                list={list}
                onUnpackAll={(ids) => setItemsStatus(ids, "unpacked")}
                onLaundryAll={(ids) => setItemsStatus(ids, "laundry_dirty")}
                onSetStatus={setItemStatus}
              />
            ))}
          </div>
        </section>
      )}

      {lost.length > 0 && (
        <section>
          <SectionHeader title="Lost / unaccounted" count={lost.length} tone="danger" />
          <ul className="space-y-2">
            {lost.map((it) => (
              <li key={it.id} className="card p-3">
                <ItemHead item={it} bags={bags} />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <button
                    className="chip text-xs bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                    onClick={() => setItemStatus(it.id, "left_at_destination")}
                  >
                    Confirm left
                  </button>
                  <button
                    className="chip text-xs bg-ok-500 border-ok-500 text-white"
                    onClick={() => setItemStatus(it.id, "unpacked")}
                  >
                    Found / unpacked
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {restock.length > 0 && (
        <section>
          <SectionHeader title="Restock needed" count={restock.length} tone="warn" />
          <ul className="space-y-2">
            {restock.map((it) => (
              <li key={it.id} className="card p-3">
                <ItemHead item={it} bags={bags} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {resolved.length > 0 && (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {resolved.length} item{resolved.length === 1 ? "" : "s"} already resolved
          this trip.
        </p>
      )}

      <div className="card p-3 mt-4">
        <div className="text-base font-semibold text-slate-900 dark:text-slate-100">Reuse this trip</div>
        <p className="text-xs text-slate-500 mt-1 mb-3 dark:text-slate-400">
          Save the current item list as a module to reuse on future trips, or clear the trip when
          you're done.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            className="btn-secondary"
            disabled={items.length === 0}
            onClick={() => setSavingModule(true)}
          >
            Save as module
          </button>
          <button className="btn-danger" onClick={() => setConfirmClear(true)}>
            Clear trip
          </button>
        </div>
      </div>

      <Modal
        open={savingModule}
        onClose={() => setSavingModule(false)}
        title="Save trip as module"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setSavingModule(false)}>
              Cancel
            </button>
            <button
              className="btn-primary"
              disabled={!moduleName.trim()}
              onClick={() => {
                saveTripAsModule(trip.id, moduleName.trim(), `Saved from ${trip.name}`);
                setSavingModule(false);
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
      </Modal>

      <Modal
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        title="Clear trip?"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setConfirmClear(false)}>
              Cancel
            </button>
            <button
              className="btn-danger"
              onClick={() => {
                deleteTrip(trip.id);
                navigate({ name: "home" });
              }}
            >
              Clear
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          This deletes the trip and its items. Save it as a module first if you want to reuse it.
        </p>
      </Modal>
    </div>
  );
}

function BagBlock({
  bag,
  list,
  onUnpackAll,
  onLaundryAll,
  onSetStatus,
}: {
  bag: Bag | null;
  list: Item[];
  onUnpackAll: (itemIds: string[]) => void;
  onLaundryAll: (itemIds: string[]) => void;
  onSetStatus: (itemId: string, status: ItemStatus) => void;
}) {
  const ids = list.map((i) => i.id);
  const title = bag ? bag.name : "Unassigned";
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <h3 className="flex-1 min-w-0 truncate text-base font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </h3>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium tabular-nums">
          {list.length}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        <button
          className="chip !py-1 !min-h-0 bg-ok-500 border-ok-500 text-white text-xs"
          onClick={() => onUnpackAll(ids)}
        >
          Unpack all
        </button>
        <button
          className="chip !py-1 !min-h-0 bg-warn-500 border-warn-500 text-white text-xs"
          onClick={() => onLaundryAll(ids)}
        >
          All to laundry
        </button>
      </div>
      <ul className="space-y-2">
        {list.map((it) => (
          <li key={it.id} className="card p-3">
            <ItemHead item={it} bags={bag ? [bag] : []} />
            <div className="mt-2 flex flex-wrap gap-1.5">
              <button
                className="chip text-xs bg-ok-500 border-ok-500 text-white"
                onClick={() => onSetStatus(it.id, "unpacked")}
              >
                Mark unpacked
              </button>
              <button
                className="chip text-xs bg-warn-500 border-warn-500 text-white"
                onClick={() => onSetStatus(it.id, "laundry_dirty")}
              >
                Laundry
              </button>
              {it.journeyRole === "consumable" && (
                <button
                  className="chip text-xs bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                  onClick={() => onSetStatus(it.id, "restock_needed")}
                >
                  Restock
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ItemHead({ item, bags }: { item: Item; bags: Bag[] }) {
  const bag = bags.find((b) => b.id === item.bagId);
  return (
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <div className="text-base font-medium text-slate-900 truncate dark:text-slate-100">
          {item.name}
          {item.quantity > 1 && (
            <span className="ml-1 text-slate-400 font-normal dark:text-slate-500">
              ×{item.quantity}
            </span>
          )}
        </div>
        {bag && (
          <div className="text-xs text-slate-500 truncate dark:text-slate-400">{bag.name}</div>
        )}
      </div>
      <Badge tone={STATUS_TONE[item.status]}>{STATUS_LABEL[item.status]}</Badge>
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
  return result;
}
