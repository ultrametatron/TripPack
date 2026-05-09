import { useMemo } from "react";
import type { Bag, Item, Trip } from "../../types";
import { useStore } from "../../store";
import { SectionHeader, Badge, EmptyState } from "../ui";
import { STATUS_LABEL } from "../../types";
import { STATUS_TONE } from "../ui";

export default function ReturnPackTab({
  bags,
  items,
}: {
  trip: Trip;
  bags: Bag[];
  items: Item[];
}) {
  const { setItemStatus, setItemBag } = useStore();

  const groups = useMemo(() => {
    const mustBring = items.filter(
      (i) => i.returnExpected && i.status !== "brought_back" && i.status !== "lost_unaccounted_for"
    );
    const notExpected = items.filter(
      (i) =>
        !i.returnExpected &&
        i.status !== "consumed" &&
        i.status !== "thrown_away" &&
        i.status !== "left_at_destination" &&
        i.status !== "gifted" &&
        i.status !== "brought_back"
    );
    const bought = items.filter((i) => i.status === "bought_during_trip");
    const dirty = items.filter((i) => i.status === "laundry_dirty");
    const lost = items.filter((i) => i.status === "lost_unaccounted_for");
    const needsBag = items.filter(
      (i) => !i.bagId && i.status !== "consumed" && i.status !== "thrown_away" && i.status !== "left_at_destination"
    );
    return { mustBring, notExpected, bought, dirty, lost, needsBag };
  }, [items]);

  const empty =
    groups.mustBring.length +
      groups.notExpected.length +
      groups.bought.length +
      groups.dirty.length +
      groups.lost.length +
      groups.needsBag.length ===
    0;

  return (
    <div className="space-y-3 pb-6">
      <div className="card p-3 bg-brand-50 border-brand-100">
        <div className="text-sm font-semibold text-brand-700">Return packing mode</div>
        <div className="text-xs text-brand-700/80">
          Confirm what's coming home, what stays behind, and what's missing.
        </div>
      </div>

      {empty && <EmptyState title="Nothing to resolve" body="Looks like a clean bag." />}

      <ReturnSection
        title="Must bring back"
        tone="danger"
        items={groups.mustBring}
        bags={bags}
        renderActions={(it) => (
          <>
            <ActionBtn
              label="Packed"
              tone="ok"
              onClick={() => setItemStatus(it.id, "brought_back")}
            />
            <ActionBtn label="Lost" tone="danger" onClick={() => setItemStatus(it.id, "lost_unaccounted_for")} />
          </>
        )}
      />
      <ReturnSection
        title="Not expected back"
        tone="neutral"
        items={groups.notExpected}
        bags={bags}
        renderActions={(it) => (
          <>
            <ActionBtn label="Consumed" onClick={() => setItemStatus(it.id, "consumed")} />
            <ActionBtn label="Gifted" onClick={() => setItemStatus(it.id, "gifted")} />
            <ActionBtn label="Left" onClick={() => setItemStatus(it.id, "left_at_destination")} />
            <ActionBtn label="Trash" onClick={() => setItemStatus(it.id, "thrown_away")} />
          </>
        )}
      />
      <ReturnSection
        title="Bought during trip"
        tone="brand"
        items={groups.bought}
        bags={bags}
        renderActions={(it) => (
          <>
            <ActionBtn label="Packed" tone="ok" onClick={() => setItemStatus(it.id, "brought_back")} />
            <ActionBtn label="Left" onClick={() => setItemStatus(it.id, "left_at_destination")} />
            <ActionBtn label="Lost" tone="danger" onClick={() => setItemStatus(it.id, "lost_unaccounted_for")} />
          </>
        )}
      />
      <ReturnSection
        title="Dirty / laundry"
        tone="warn"
        items={groups.dirty}
        bags={bags}
        renderActions={(it) => (
          <>
            <ActionBtn label="Packed" tone="ok" onClick={() => setItemStatus(it.id, "brought_back")} />
            <ActionBtn label="Left" onClick={() => setItemStatus(it.id, "left_at_destination")} />
          </>
        )}
      />
      <ReturnSection
        title="Lost / unaccounted"
        tone="danger"
        items={groups.lost}
        bags={bags}
        renderActions={(it) => (
          <>
            <ActionBtn label="Found / Packed" tone="ok" onClick={() => setItemStatus(it.id, "brought_back")} />
            <ActionBtn label="Confirm left" onClick={() => setItemStatus(it.id, "left_at_destination")} />
          </>
        )}
      />
      <ReturnSection
        title="Needs bag assignment"
        tone="warn"
        items={groups.needsBag}
        bags={bags}
        renderActions={(it) => (
          <select
            className="input !py-1.5 text-xs max-w-[200px]"
            value={it.bagId ?? ""}
            onChange={(e) => setItemBag(it.id, e.target.value || undefined)}
          >
            <option value="">Pick bag…</option>
            {bags.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        )}
      />

    </div>
  );
}

function ReturnSection({
  title,
  tone,
  items,
  bags,
  renderActions,
}: {
  title: string;
  tone: "warn" | "danger" | "ok" | "neutral" | "brand";
  items: Item[];
  bags: Bag[];
  renderActions: (item: Item) => React.ReactNode;
}) {
  if (items.length === 0) return null;
  return (
    <section>
      <SectionHeader
        title={title}
        count={items.length}
        tone={tone === "brand" ? "neutral" : tone}
      />
      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it.id} className="card p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-medium text-slate-900 truncate">
                  {it.name}
                  {it.quantity > 1 && (
                    <span className="ml-1 text-slate-400 font-normal">×{it.quantity}</span>
                  )}
                </div>
                <div className="text-xs text-slate-500 truncate">
                  {bags.find((b) => b.id === it.bagId)?.name ?? "Unassigned"} ·{" "}
                  {it.returnExpected ? "Return expected" : "Not expected back"}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                {it.critical && <Badge tone="danger">Critical</Badge>}
                <Badge tone={STATUS_TONE[it.status]}>{STATUS_LABEL[it.status]}</Badge>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5 items-center">{renderActions(it)}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ActionBtn({
  label,
  tone,
  onClick,
}: {
  label: string;
  tone?: "ok" | "danger";
  onClick: () => void;
}) {
  const cls =
    tone === "ok"
      ? "bg-ok-500 border-ok-500 text-white"
      : tone === "danger"
      ? "bg-danger-500 border-danger-500 text-white"
      : "bg-white border-slate-200 text-slate-700";
  return (
    <button className={`chip text-xs ${cls}`} onClick={onClick}>
      {label}
    </button>
  );
}
