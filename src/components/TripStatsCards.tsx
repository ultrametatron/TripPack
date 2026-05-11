import {
  CATEGORY_LABEL,
  JOURNEY_LABEL,
  STATUS_LABEL,
  type Category,
  type ItemStatus,
  type JourneyRole,
  type LifecyclePhase,
} from "../types";
import { Badge, JOURNEY_TONE, ProgressBar, STATUS_TONE } from "./ui";
import { packedCompletionLabel, type TripSummary } from "../utils/tripSummary";

export default function TripStatsCards({
  summary,
  phase,
}: {
  summary: TripSummary;
  phase: LifecyclePhase;
}) {
  if (summary.total === 0) return null;

  const topStatuses = (Object.entries(summary.byStatus) as [ItemStatus, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);
  const topCategories = (Object.entries(summary.byCategory) as [Category, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  const topJourney = (Object.entries(summary.byJourneyRole) as [JourneyRole, number][])
    .sort((a, b) => b[1] - a[1]);
  const topBags = summary.byBag.slice(0, 3);

  return (
    <section className="mt-6">
      <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3 px-1">
        Trip stats
      </h2>
      <div className="grid grid-cols-2 gap-3">
        <Card title={packedCompletionLabel(phase) === "packed" ? "Packed" : "Accounted"} full>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tabular-nums">
              {summary.packed}
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              / {summary.total}
            </span>
          </div>
          <div className="mt-2">
            <ProgressBar value={summary.packed} max={summary.total || 1} />
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            {Math.round((summary.packed / summary.total) * 100)}% {packedCompletionLabel(phase)}
          </div>
        </Card>

        <Card title="Critical" full>
          {summary.criticalTotal === 0 ? (
            <div className="text-sm text-slate-500 dark:text-slate-400">
              No items marked critical.
            </div>
          ) : (
            <>
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-3xl font-bold tabular-nums ${
                    summary.criticalMissing > 0
                      ? "text-danger-600 dark:text-danger-500"
                      : "text-ok-600 dark:text-ok-500"
                  }`}
                >
                  {summary.criticalPacked}
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  / {summary.criticalTotal}
                </span>
              </div>
              {summary.criticalMissing > 0 && (
                <div className="text-xs text-danger-600 dark:text-danger-500 font-semibold mt-1">
                  {summary.criticalMissing} still to {packedCompletionLabel(phase)}
                </div>
              )}
              {summary.criticalMissing === 0 && (
                <div className="text-xs text-ok-600 dark:text-ok-500 mt-1">
                  All critical items are accounted for.
                </div>
              )}
            </>
          )}
        </Card>

        {topBags.length > 0 && (
          <Card title="By bag" wide>
            <div className="space-y-2">
              {topBags.map((b) => {
                const pct = b.total === 0 ? 0 : Math.round((b.packed / b.total) * 100);
                return (
                  <div key={b.bagId || b.bagName}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium truncate text-slate-700 dark:text-slate-200">
                        {b.bagName}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 tabular-nums">
                        {b.packed}/{b.total}
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden dark:bg-slate-700">
                      <div
                        className="h-full bg-brand-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        <Card title="Return">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tabular-nums">{summary.returnExpected}</span>
            <span className="text-sm text-slate-500 dark:text-slate-400">expected back</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {summary.notReturning} not returning
          </div>
        </Card>

        <Card title="Statuses">
          {topStatuses.length === 0 ? (
            <span className="text-xs text-slate-500 dark:text-slate-400">No items.</span>
          ) : (
            <ul className="space-y-1.5">
              {topStatuses.map(([status, count]) => (
                <li key={status} className="flex items-center justify-between gap-2">
                  <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>
                  <span className="text-sm font-semibold tabular-nums">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {topCategories.length > 0 && (
          <Card title="Top categories">
            <ul className="space-y-1.5">
              {topCategories.map(([cat, count]) => (
                <li key={cat} className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-slate-700 dark:text-slate-200 truncate">
                    {CATEGORY_LABEL[cat]}
                  </span>
                  <span className="font-semibold tabular-nums">{count}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {topJourney.length > 0 && (
          <Card title="Journey roles" wide>
            <div className="flex flex-wrap gap-1.5">
              {topJourney.map(([role, count]) => (
                <span
                  key={role}
                  className={`badge ${JOURNEY_TONE_CLASSES[JOURNEY_TONE[role]]}`}
                >
                  {JOURNEY_LABEL[role]}: {count}
                </span>
              ))}
            </div>
          </Card>
        )}

        {(summary.bought > 0 || summary.laundry > 0 || summary.lost > 0) && (
          <Card title="On the trip" wide>
            <div className="grid grid-cols-3 gap-3 text-center">
              <Stat label="Bought" value={summary.bought} tone="brand" />
              <Stat label="Laundry" value={summary.laundry} tone="warn" />
              <Stat label="Lost" value={summary.lost} tone="danger" />
            </div>
          </Card>
        )}
      </div>
    </section>
  );
}

const JOURNEY_TONE_CLASSES: Record<string, string> = {
  ok: "bg-ok-100 text-ok-600 dark:bg-ok-500/20 dark:text-ok-500",
  warn: "bg-warn-100 text-warn-600 dark:bg-warn-500/20 dark:text-warn-500",
  danger: "bg-danger-100 text-danger-600 dark:bg-danger-500/20 dark:text-danger-500",
  brand: "bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300",
  neutral: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
};

function Card({
  title,
  children,
  full,
  wide,
}: {
  title: string;
  children: React.ReactNode;
  full?: boolean;
  wide?: boolean;
}) {
  return (
    <div className={`card p-3 ${full || wide ? "col-span-2" : ""}`}>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "brand" | "warn" | "danger";
}) {
  const colorMap: Record<string, string> = {
    brand: "text-brand-600 dark:text-brand-300",
    warn: "text-warn-600 dark:text-warn-500",
    danger: "text-danger-600 dark:text-danger-500",
  };
  return (
    <div>
      <div className={`text-2xl font-bold tabular-nums ${colorMap[tone]}`}>{value}</div>
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
    </div>
  );
}
