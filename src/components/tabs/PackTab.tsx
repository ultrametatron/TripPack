import { useMemo, useState } from "react";
import type { Bag, Item, Trip } from "../../types";
import { CATEGORY_LABEL } from "../../types";
import { ItemRow } from "../ItemRow";
import { EmptyState, SectionHeader, Badge } from "../ui";
import AddItemBar from "../AddItemBar";

type Filter = "all" | "critical" | "unpacked" | "unassigned";

export default function PackTab({ trip, bags, items }: { trip: Trip; bags: Bag[]; items: Item[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [groupBy, setGroupBy] = useState<"bag" | "category">("bag");

  const filtered = useMemo(() => {
    return items.filter((i) => {
      if (filter === "critical") return i.critical;
      if (filter === "unpacked")
        return i.status !== "packed" && i.status !== "packed_from_home" && i.status !== "brought_back";
      if (filter === "unassigned") return !i.bagId;
      return true;
    });
  }, [items, filter]);

  const groups = useMemo(() => {
    if (groupBy === "bag") {
      const byBag: { key: string; label: string; items: Item[] }[] = bags.map((b) => ({
        key: b.id,
        label: b.name,
        items: filtered.filter((i) => i.bagId === b.id),
      }));
      const unassigned = filtered.filter((i) => !i.bagId);
      if (unassigned.length) byBag.push({ key: "_un", label: "Unassigned", items: unassigned });
      return byBag.filter((g) => g.items.length > 0);
    }
    const byCat: Record<string, Item[]> = {};
    for (const it of filtered) {
      byCat[it.category] = byCat[it.category] ?? [];
      byCat[it.category].push(it);
    }
    return Object.entries(byCat).map(([cat, list]) => ({
      key: cat,
      label: CATEGORY_LABEL[cat as keyof typeof CATEGORY_LABEL] ?? cat,
      items: list,
    }));
  }, [filtered, bags, groupBy]);

  return (
    <div className="space-y-3 pb-6">
      <FilterBar
        filter={filter}
        onFilter={setFilter}
        groupBy={groupBy}
        onGroupBy={setGroupBy}
        items={items}
      />

      <AddItemBar tripId={trip.id} bags={bags} />

      {groups.length === 0 ? (
        <EmptyState title="Nothing to show" body="Adjust filters or add items." />
      ) : (
        groups.map((g) => {
          const packed = g.items.filter((i) => i.status === "packed" || i.status === "packed_from_home").length;
          return (
            <section key={g.key}>
              <div className="flex items-center justify-between mt-3 mb-2">
                <SectionHeader title={g.label} />
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {packed}/{g.items.length} packed
                </span>
              </div>
              <div className="space-y-2">
                {g.items.map((it) => (
                  <ItemRow key={it.id} item={it} bags={bags} />
                ))}
              </div>
            </section>
          );
        })
      )}
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
  filter: "all" | "critical" | "unpacked" | "unassigned";
  onFilter: (f: "all" | "critical" | "unpacked" | "unassigned") => void;
  groupBy: "bag" | "category";
  onGroupBy: (g: "bag" | "category") => void;
  items: Item[];
}) {
  const criticalMissing = items.filter(
    (i) => i.critical && i.status !== "packed" && i.status !== "packed_from_home"
  ).length;
  const unassigned = items.filter((i) => !i.bagId).length;
  const unpacked = items.filter((i) => i.status === "planned").length;

  const Tab = ({
    val,
    label,
    badge,
    tone,
  }: {
    val: typeof filter;
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
      {badge !== undefined && badge > 0 && (
        <Badge tone={tone ?? "neutral"}>{badge}</Badge>
      )}
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
