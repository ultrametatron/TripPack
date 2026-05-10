import { Modal } from "./ui";

const STEPS: { title: string; body: string }[] = [
  {
    title: "Create a trip",
    body: "Give it a name, dates, type, and transport. Trips live on your Trips tab.",
  },
  {
    title: "Apply modules",
    body: "Modules are reusable item lists (Toiletries, Remote Work, Winter Clothing, …). Pick one or more to seed your packing list, then edit freely.",
  },
  {
    title: "Plan & Pack",
    body: "Group items into bags in the Plan tab. Switch to Pack and check items off as they go in. Filters help focus on critical or unassigned items.",
  },
  {
    title: "During the trip",
    body: "Quickly mark items consumed, gifted, bought, or lost — one tap per chip. Move items between bags as you reorganise.",
  },
  {
    title: "Return Pack",
    body: "A distinct mode that highlights what must come home, what stays behind, and what's missing. One-tap actions confirm each item.",
  },
  {
    title: "Unpack & reset",
    body: "Mark laundry done, restock consumables, and save the trip as a module so next time is faster.",
  },
  {
    title: "You",
    body: "Open the You tab to switch theme, set a PIN, or Export / Import your data as JSON. Your trips live in this browser only — Export to back them up or move to another device.",
  },
];

export default function HowItWorks({ onClose }: { onClose: () => void }) {
  return (
    <Modal
      open
      onClose={onClose}
      title="How it works"
      footer={
        <button className="btn-primary" onClick={onClose}>
          Got it
        </button>
      }
    >
      <ol className="space-y-3">
        {STEPS.map((s, i) => (
          <li
            key={s.title}
            className="card p-3 flex gap-3 items-start"
          >
            <div className="shrink-0 h-7 w-7 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300 flex items-center justify-center text-sm font-semibold">
              {i + 1}
            </div>
            <div className="min-w-0">
              <div className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {s.title}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">
                {s.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
        PacTrac stores everything locally. No accounts, no servers — your data
        stays in this browser unless you Export it.
      </p>
    </Modal>
  );
}
