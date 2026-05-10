import { useEffect, useState } from "react";
import { hasPin, verifyPin } from "../auth";

const MAX = 6;

export function PinGate({ children }: { children: React.ReactNode }) {
  const [needsPin, setNeedsPin] = useState<boolean>(() => hasPin());
  const [unlocked, setUnlocked] = useState<boolean>(() => !hasPin());
  const [pin, setPin] = useState<string>("");
  const [shake, setShake] = useState(false);
  const [busy, setBusy] = useState(false);

  // Listen for changes in case Settings clears or sets a PIN.
  useEffect(() => {
    const recheck = () => {
      const has = hasPin();
      setNeedsPin(has);
      if (!has) setUnlocked(true);
    };
    window.addEventListener("storage", recheck);
    window.addEventListener("trippack:pin-changed", recheck);
    return () => {
      window.removeEventListener("storage", recheck);
      window.removeEventListener("trippack:pin-changed", recheck);
    };
  }, []);

  if (!needsPin || unlocked) return <>{children}</>;

  const onDigit = (d: string) => {
    if (busy) return;
    if (pin.length >= MAX) return;
    const next = pin + d;
    setPin(next);
  };

  const onBackspace = () => {
    if (busy) return;
    setPin((p) => p.slice(0, -1));
  };

  const tryUnlock = async (candidate: string) => {
    if (candidate.length < 4) return;
    setBusy(true);
    const ok = await verifyPin(candidate);
    if (ok) {
      setUnlocked(true);
    } else {
      setShake(true);
      setPin("");
      setTimeout(() => setShake(false), 400);
    }
    setBusy(false);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void tryUnlock(pin);
  };

  return (
    <div className="min-h-full flex items-center justify-center p-6 bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className={`w-full max-w-sm ${shake ? "shake" : ""}`}>
        <div className="text-center mb-6">
          <div className="text-2xl mb-1">🧳</div>
          <h1 className="text-2xl font-bold tracking-tight">PacTrac</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Enter your PIN to unlock.
          </p>
        </div>
        <form onSubmit={onSubmit}>
          <div className="flex justify-center gap-2 mb-6">
            {Array.from({ length: MAX }).map((_, i) => (
              <span
                key={i}
                className={`h-3 w-3 rounded-full ${
                  i < pin.length
                    ? "bg-brand-600 dark:bg-brand-500"
                    : "bg-slate-200 dark:bg-slate-700"
                }`}
              />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
              <button
                key={d}
                type="button"
                className="tap rounded-2xl border border-slate-200 bg-white text-2xl font-semibold py-4 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                onClick={() => onDigit(d)}
              >
                {d}
              </button>
            ))}
            <button
              type="button"
              className="tap rounded-2xl text-sm font-medium py-4 text-slate-500 dark:text-slate-400"
              onClick={onBackspace}
            >
              ⌫
            </button>
            <button
              type="button"
              className="tap rounded-2xl border border-slate-200 bg-white text-2xl font-semibold py-4 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
              onClick={() => onDigit("0")}
            >
              0
            </button>
            <button
              type="submit"
              disabled={pin.length < 4 || busy}
              className="tap rounded-2xl text-sm font-semibold py-4 bg-brand-600 text-white disabled:opacity-50"
            >
              Unlock
            </button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-6">
            Forgot your PIN? Open the app on a device where you're still signed in
            to export your data, or you'll need to clear it from your browser to
            reset.
          </p>
        </form>
      </div>
    </div>
  );
}

export function notifyPinChanged() {
  window.dispatchEvent(new Event("trippack:pin-changed"));
}
