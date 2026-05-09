import React from "react";
import type { ItemStatus, JourneyRole } from "../types";

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "ok" | "warn" | "danger" | "brand";
}) {
  const tones: Record<string, string> = {
    neutral: "bg-slate-100 text-slate-700",
    ok: "bg-ok-100 text-ok-600",
    warn: "bg-warn-100 text-warn-600",
    danger: "bg-danger-100 text-danger-600",
    brand: "bg-brand-100 text-brand-700",
  };
  return <span className={`badge ${tones[tone]}`}>{children}</span>;
}

export const STATUS_TONE: Record<ItemStatus, "ok" | "warn" | "danger" | "neutral" | "brand"> = {
  planned: "neutral",
  packed: "ok",
  packed_from_home: "ok",
  bought_during_trip: "brand",
  consumed: "neutral",
  gifted: "neutral",
  thrown_away: "neutral",
  left_at_destination: "neutral",
  brought_back: "ok",
  laundry_dirty: "warn",
  moved_between_bags: "brand",
  lost_unaccounted_for: "danger",
  unpacked: "ok",
  restock_needed: "warn",
};

export const JOURNEY_TONE: Record<JourneyRole, "ok" | "warn" | "danger" | "neutral" | "brand"> = {
  bring_both_ways: "brand",
  outbound_only: "neutral",
  return_only: "neutral",
  consumable: "warn",
  gift: "warn",
  discardable: "neutral",
  bought_on_trip: "brand",
  laundry: "warn",
  uncertain: "neutral",
};

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">{title}</h2>
          <button className="tap text-slate-500 px-2" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="px-4 py-3 overflow-y-auto">{children}</div>
        {footer && (
          <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex gap-2 justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card p-6 text-center">
      <div className="text-base font-semibold text-slate-900">{title}</div>
      {body && <div className="text-sm text-slate-500 mt-1">{body}</div>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function SectionHeader({
  title,
  count,
  tone,
}: {
  title: string;
  count?: number;
  tone?: "warn" | "danger" | "ok" | "neutral";
}) {
  const tones: Record<string, string> = {
    warn: "text-warn-600",
    danger: "text-danger-600",
    ok: "text-ok-600",
    neutral: "text-slate-700",
  };
  return (
    <div className="flex items-center justify-between mb-2 mt-4 first:mt-0">
      <h3 className={`text-sm font-bold uppercase tracking-wide ${tones[tone ?? "neutral"]}`}>
        {title}
      </h3>
      {typeof count === "number" && (
        <span className="text-xs text-slate-500 font-medium">{count}</span>
      )}
    </div>
  );
}

export function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
      <div
        className="h-full bg-brand-500 transition-all"
        style={{ width: `${pct}%` }}
        aria-valuenow={pct}
        aria-valuemax={100}
        aria-valuemin={0}
        role="progressbar"
      />
    </div>
  );
}
