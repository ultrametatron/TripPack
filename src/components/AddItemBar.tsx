import { useState } from "react";
import { useStore } from "../store";
import type { Bag, ItemStatus, JourneyRole } from "../types";

export default function AddItemBar({
  tripId,
  bags,
  defaultStatus = "planned",
  defaultJourneyRole = "bring_both_ways",
  defaultReturnExpected = true,
  defaultBagId,
  placeholder = "Add item",
}: {
  tripId: string;
  bags: Bag[];
  defaultStatus?: ItemStatus;
  defaultJourneyRole?: JourneyRole;
  defaultReturnExpected?: boolean;
  defaultBagId?: string;
  placeholder?: string;
}) {
  const { addItem } = useStore();
  const [name, setName] = useState("");
  const [bagId, setBagId] = useState<string | undefined>(defaultBagId ?? bags[0]?.id);

  const submit = () => {
    if (!name.trim()) return;
    addItem({
      tripId,
      name: name.trim(),
      quantity: 1,
      category: "miscellaneous",
      bagId: bagId,
      status: defaultStatus,
      journeyRole: defaultJourneyRole,
      returnExpected: defaultReturnExpected,
      critical: false,
    });
    setName("");
  };

  return (
    <div className="card p-2 flex items-center gap-2">
      <input
        className="input !py-2 flex-1"
        placeholder={placeholder}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
      />
      <select
        className="input !py-2 max-w-[40%]"
        value={bagId ?? ""}
        onChange={(e) => setBagId(e.target.value || undefined)}
      >
        <option value="">Unassigned</option>
        {bags.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>
      <button className="btn-primary !py-2" onClick={submit} disabled={!name.trim()}>
        Add
      </button>
    </div>
  );
}
