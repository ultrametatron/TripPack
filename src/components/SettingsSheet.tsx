import { useState } from "react";
import { useStore } from "../store";
import { useTheme, type ThemeMode } from "../theme";
import { exportData, importData, todayStamp } from "../storage";
import { hasPin, setPin as authSetPin, clearPin, verifyPin } from "../auth";
import { notifyPinChanged } from "./PinGate";
import { Modal } from "./ui";

type Dialog =
  | { kind: "none" }
  | { kind: "import-confirm"; importedSummary: string; parsedJson: string }
  | { kind: "import-error"; message: string }
  | { kind: "clear-confirm" }
  | { kind: "set-pin" }
  | { kind: "remove-pin" }
  | { kind: "forget-pin" };

export default function SettingsSheet({ onClose }: { onClose: () => void }) {
  const { state, replaceAll, clearAll } = useStore();
  const { mode, setMode } = useTheme();
  const [dialog, setDialog] = useState<Dialog>({ kind: "none" });
  const [importBusy, setImportBusy] = useState(false);
  const pinPresent = hasPin();

  const triggerExport = () => {
    const json = exportData(state);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trippack-${todayStamp()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const onPickFile = async (file: File) => {
    setImportBusy(true);
    try {
      const text = await file.text();
      const parsed = importData(text);
      const summary = `${parsed.trips.length} trips, ${parsed.items.length} items, ${parsed.bags.length} bags, ${parsed.modules.length} modules`;
      setDialog({
        kind: "import-confirm",
        importedSummary: summary,
        parsedJson: JSON.stringify(parsed),
      });
    } catch (e) {
      setDialog({
        kind: "import-error",
        message: e instanceof Error ? e.message : "Could not import file.",
      });
    } finally {
      setImportBusy(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="You" footer={<button className="btn-primary" onClick={onClose}>Done</button>}>
      <div className="space-y-5">
        <Section title="Appearance">
          <div className="grid grid-cols-3 gap-2">
            {(["auto", "light", "dark"] as ThemeMode[]).map((m) => {
              const sel = mode === m;
              const labels = { auto: "Auto", light: "Light", dark: "Dark" };
              return (
                <button
                  key={m}
                  className={`chip justify-center ${
                    sel
                      ? "bg-brand-50 border-brand-500 text-brand-700 dark:bg-brand-500/20 dark:border-brand-500 dark:text-brand-300"
                      : "bg-white border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                  }`}
                  onClick={() => setMode(m)}
                >
                  {labels[m]}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Auto follows your device setting.
          </p>
        </Section>

        <Section title="Data">
          <div className="space-y-2">
            <button className="btn-secondary w-full justify-start" onClick={triggerExport}>
              ⬇️ Export all data (JSON)
            </button>
            <p className="text-xs text-slate-500 dark:text-slate-400 -mt-1">
              Save a backup of all trips, modules, and bags. Send the JSON to your
              other device or to someone else to share data.
            </p>

            <label className="btn-secondary w-full justify-start cursor-pointer">
              ⬆️ Import data (JSON)
              <input
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void onPickFile(f);
                  e.currentTarget.value = "";
                }}
                disabled={importBusy}
              />
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400 -mt-1">
              Imports replace the current contents of this browser. Export first
              if you want to keep what you have.
            </p>

            <button
              className="btn-ghost text-danger-600 w-full justify-start"
              onClick={() => setDialog({ kind: "clear-confirm" })}
            >
              Clear all data
            </button>
          </div>
        </Section>

        <Section title="Passcode">
          <div className="space-y-2">
            {pinPresent ? (
              <>
                <button
                  className="btn-secondary w-full justify-start"
                  onClick={() => setDialog({ kind: "set-pin" })}
                >
                  🔒 Change PIN
                </button>
                <button
                  className="btn-secondary w-full justify-start"
                  onClick={() => setDialog({ kind: "remove-pin" })}
                >
                  Remove PIN
                </button>
                <button
                  className="btn-ghost text-danger-600 w-full justify-start"
                  onClick={() => setDialog({ kind: "forget-pin" })}
                >
                  Forget PIN (wipes all data)
                </button>
              </>
            ) : (
              <button
                className="btn-secondary w-full justify-start"
                onClick={() => setDialog({ kind: "set-pin" })}
              >
                🔒 Set a PIN
              </button>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Locks this browser only. Not an account — anyone with file-system
              access to this device can still read the data. Use Export to back
              up your trips.
            </p>
          </div>
        </Section>

        <Section title="About">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            TripPack stores everything locally in your browser. Trips and modules
            are not shared between visitors of the site or across your devices —
            use Export to move data manually.
          </p>
        </Section>
      </div>

      {dialog.kind === "import-confirm" && (
        <Modal
          open
          onClose={() => setDialog({ kind: "none" })}
          title="Replace current data?"
          footer={
            <>
              <button className="btn-secondary" onClick={() => setDialog({ kind: "none" })}>
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  const next = JSON.parse(dialog.parsedJson);
                  replaceAll(next);
                  setDialog({ kind: "none" });
                }}
              >
                Replace
              </button>
            </>
          }
        >
          <p className="text-sm">
            This will replace everything currently in this browser with:
          </p>
          <p className="text-sm font-semibold mt-2">{dialog.importedSummary}</p>
        </Modal>
      )}

      {dialog.kind === "import-error" && (
        <Modal
          open
          onClose={() => setDialog({ kind: "none" })}
          title="Could not import"
          footer={
            <button className="btn-primary" onClick={() => setDialog({ kind: "none" })}>
              OK
            </button>
          }
        >
          <p className="text-sm text-danger-600">{dialog.message}</p>
        </Modal>
      )}

      {dialog.kind === "clear-confirm" && (
        <Modal
          open
          onClose={() => setDialog({ kind: "none" })}
          title="Clear all data?"
          footer={
            <>
              <button className="btn-secondary" onClick={() => setDialog({ kind: "none" })}>
                Cancel
              </button>
              <button
                className="btn-danger"
                onClick={() => {
                  clearAll();
                  setDialog({ kind: "none" });
                }}
              >
                Clear
              </button>
            </>
          }
        >
          <p className="text-sm">
            This deletes all trips, items, bags, and modules from this browser.
            Default modules will be re-seeded.
          </p>
        </Modal>
      )}

      {dialog.kind === "set-pin" && (
        <SetPinDialog
          onClose={() => setDialog({ kind: "none" })}
          onDone={() => setDialog({ kind: "none" })}
        />
      )}

      {dialog.kind === "remove-pin" && (
        <RemovePinDialog
          onClose={() => setDialog({ kind: "none" })}
          onDone={() => setDialog({ kind: "none" })}
        />
      )}

      {dialog.kind === "forget-pin" && (
        <ForgetPinDialog
          onClose={() => setDialog({ kind: "none" })}
          onConfirm={() => {
            clearPin();
            clearAll();
            notifyPinChanged();
            setDialog({ kind: "none" });
            // reload so the gate state re-evaluates from a clean slate
            setTimeout(() => window.location.reload(), 50);
          }}
        />
      )}
    </Modal>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">
        {title}
      </h3>
      {children}
    </section>
  );
}

function SetPinDialog({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [err, setErr] = useState("");
  const valid = a.length >= 4 && a.length <= 6 && /^\d+$/.test(a);
  const match = a === b;
  return (
    <Modal
      open
      onClose={onClose}
      title={hasPin() ? "Change PIN" : "Set a PIN"}
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-primary"
            disabled={!valid || !match}
            onClick={async () => {
              try {
                await authSetPin(a);
                notifyPinChanged();
                onDone();
              } catch (e) {
                setErr(e instanceof Error ? e.message : "Failed to set PIN.");
              }
            }}
          >
            Save
          </button>
        </>
      }
    >
      <label className="label">New PIN (4–6 digits)</label>
      <input
        className="input"
        value={a}
        inputMode="numeric"
        pattern="\d*"
        autoFocus
        onChange={(e) => setA(e.target.value.replace(/\D/g, "").slice(0, 6))}
      />
      <label className="label mt-3">Confirm</label>
      <input
        className="input"
        value={b}
        inputMode="numeric"
        pattern="\d*"
        onChange={(e) => setB(e.target.value.replace(/\D/g, "").slice(0, 6))}
      />
      {!match && b.length > 0 && (
        <p className="text-xs text-danger-600 mt-2">PINs don't match.</p>
      )}
      {err && <p className="text-xs text-danger-600 mt-2">{err}</p>}
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
        Locks this browser only. Not an account.
      </p>
    </Modal>
  );
}

function RemovePinDialog({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [pin, setPinValue] = useState("");
  const [err, setErr] = useState("");
  return (
    <Modal
      open
      onClose={onClose}
      title="Remove PIN"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-danger"
            disabled={pin.length < 4}
            onClick={async () => {
              const ok = await verifyPin(pin);
              if (!ok) {
                setErr("Wrong PIN.");
                return;
              }
              clearPin();
              notifyPinChanged();
              onDone();
            }}
          >
            Remove
          </button>
        </>
      }
    >
      <label className="label">Enter current PIN</label>
      <input
        className="input"
        value={pin}
        inputMode="numeric"
        pattern="\d*"
        autoFocus
        onChange={(e) => {
          setErr("");
          setPinValue(e.target.value.replace(/\D/g, "").slice(0, 6));
        }}
      />
      {err && <p className="text-xs text-danger-600 mt-2">{err}</p>}
    </Modal>
  );
}

function ForgetPinDialog({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [confirmText, setConfirmText] = useState("");
  return (
    <Modal
      open
      onClose={onClose}
      title="Forget PIN?"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-danger"
            disabled={confirmText !== "WIPE"}
            onClick={onConfirm}
          >
            Wipe data
          </button>
        </>
      }
    >
      <p className="text-sm">
        There's no recovery for a forgotten PIN. To remove it, all trips, items,
        bags, and modules in this browser must be deleted. Type{" "}
        <span className="font-mono font-semibold">WIPE</span> to confirm.
      </p>
      <input
        className="input mt-3"
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
        placeholder="WIPE"
      />
    </Modal>
  );
}
