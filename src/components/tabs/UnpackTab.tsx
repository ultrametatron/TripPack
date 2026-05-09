import { useMemo, useState } from "react";
import type { Bag, Item, Trip } from "../../types";
import { useStore } from "../../store";
import { SectionHeader, EmptyState, Modal, Badge } from "../ui";
import { STATUS_LABEL } from "../../types";
import { STATUS_TONE } from "../ui";
import { navigate } from "../../App";

export default function UnpackTab({
  trip,
  bags,
  items,
}: {
  trip: Trip;
  bags: Bag[];
  items: Item[];
}) {
  const { setItemStatus, deleteTrip, saveTripAsModule } = useStore();
  const [confirmClear, setConfirmClear] = useState(false);
  const [savingModule, setSavingModule] = useState(false);
  const [moduleName, setModuleName] = useState(trip.name + " template");

  const groups = useMemo(() => {
    const broughtBack = items.filter((i) => i.status === "brought_back");
    const laundry = items.filter((i) => i.status === "laundry_dirty");
    const lost = items.filter((i) => i.status === "lost_unaccounted_for");
    const consumables = items.filter(
      (i) =>
        (i.journeyRole === "consumable" || i.status === "consumed") &&
        i.status !== "restock_needed"
    );
    return { broughtBack, laundry, lost, consumables };
  }, [items]);

  const empty =
    groups.broughtBack.length +
      groups.laundry.length +
      groups.lost.length +
      groups.consumables.length ===
    0;

  return (
    <div className="space-y-3 pb-6">
      <div className="card p-3 bg-ok-50 border-ok-100 dark:bg-ok-500/15 dark:border-ok-500/30">
        <div className="text-sm font-semibold text-ok-600 dark:text-ok-500">Unpack & reset</div>
        <div className="text-xs text-ok-600/80 dark:text-ok-500/80">
          Mark unpacked, finish laundry, restock consumables, or save reusable modules.
        </div>
      </div>

      {empty && (
        <EmptyState
          title="Nothing to unpack"
          body="Save the trip as a module or clear it when you're done."
        />
      )}

      <UnpackSection
        title="Brought back — to unpack"
        items={groups.broughtBack}
        bags={bags}
        renderActions={(it) => (
          <button className="chip text-xs bg-ok-500 border-ok-500 text-white" onClick={() => setItemStatus(it.id, "unpacked")}>
            Mark unpacked
          </button>
        )}
      />
      <UnpackSection
        title="Laundry"
        items={groups.laundry}
        bags={bags}
        renderActions={(it) => (
          <button className="chip text-xs bg-ok-500 border-ok-500 text-white" onClick={() => setItemStatus(it.id, "unpacked")}>
            Laundry done
          </button>
        )}
      />
      <UnpackSection
        title="Lost / unaccounted"
        items={groups.lost}
        bags={bags}
        renderActions={(it) => (
          <>
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
          </>
        )}
      />
      <UnpackSection
        title="Consumables to restock"
        items={groups.consumables}
        bags={bags}
        renderActions={(it) => (
          <button
            className="chip text-xs bg-warn-500 border-warn-500 text-white"
            onClick={() => setItemStatus(it.id, "restock_needed")}
          >
            Restock needed
          </button>
        )}
      />

      <div className="card p-3 mt-4">
        <div className="font-semibold text-slate-900 dark:text-slate-100">Reuse this trip</div>
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

function UnpackSection({
  title,
  items,
  bags,
  renderActions,
}: {
  title: string;
  items: Item[];
  bags: Bag[];
  renderActions: (item: Item) => React.ReactNode;
}) {
  if (items.length === 0) return null;
  return (
    <section>
      <SectionHeader title={title} count={items.length} />
      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it.id} className="card p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-medium text-slate-900 truncate dark:text-slate-100">
                  {it.name}
                  {it.quantity > 1 && (
                    <span className="ml-1 text-slate-400 font-normal dark:text-slate-500">×{it.quantity}</span>
                  )}
                </div>
                <div className="text-xs text-slate-500 truncate dark:text-slate-400">
                  {bags.find((b) => b.id === it.bagId)?.name ?? "Unassigned"}
                </div>
              </div>
              <Badge tone={STATUS_TONE[it.status]}>{STATUS_LABEL[it.status]}</Badge>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">{renderActions(it)}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}
