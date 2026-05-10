import { useState } from "react";
import type { Module } from "../types";
import { JOURNEY_LABEL } from "../types";
import { Badge, JOURNEY_TONE } from "./ui";

export default function ModulePickerRow({
  module,
  checked,
  onToggle,
  recommended,
}: {
  module: Module;
  checked: boolean;
  onToggle: () => void;
  recommended?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const itemCount = module.defaultItems.length;
  return (
    <li className="card p-3">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          className="mt-1 h-5 w-5 shrink-0"
          checked={checked}
          onChange={onToggle}
          aria-label={`Select ${module.name}`}
        />
        <button
          type="button"
          className="flex-1 min-w-0 text-left"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {module.name}
            </span>
            {recommended && (
              <span className="badge bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                Recommended
              </span>
            )}
          </div>
          {module.description && (
            <div className="text-xs text-slate-500 mt-0.5 dark:text-slate-400">
              {module.description}
            </div>
          )}
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-1 dark:text-slate-500">
            <span>
              {itemCount} item{itemCount === 1 ? "" : "s"}
            </span>
            <span aria-hidden>· {expanded ? "hide" : "preview"}</span>
            <span aria-hidden className={`transition-transform ${expanded ? "rotate-180" : ""}`}>
              ▾
            </span>
          </div>
        </button>
      </div>
      {expanded && itemCount > 0 && (
        <ul className="mt-2 pl-8 space-y-1.5 border-t border-slate-100 dark:border-slate-700 pt-2">
          {module.defaultItems.map((d) => (
            <li
              key={d.id}
              className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2 flex-wrap"
            >
              <span className="truncate">
                {d.name}
                {d.quantity > 1 && (
                  <span className="ml-1 text-slate-400 dark:text-slate-500">
                    ×{d.quantity}
                  </span>
                )}
              </span>
              {d.critical && <Badge tone="danger">Critical</Badge>}
              <Badge tone={JOURNEY_TONE[d.journeyRole]}>
                {JOURNEY_LABEL[d.journeyRole]}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
