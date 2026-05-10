import React, { useRef, useState } from "react";

const ACTION_WIDTH = 88;
const OPEN_THRESHOLD = 40;
const SWIPE_AXIS_LOCK = 6; // px of vertical movement before we abort the horizontal gesture

/**
 * SwipeRow wraps a list-row child and reveals an action (typically delete)
 * when the user swipes left. Uses Pointer Events so it works for both
 * touch and mouse without any extra dependency.
 *
 * UX: swipe left to expose the action; tap the action to confirm; tap the
 * row again to snap closed.
 */
export function SwipeRow({
  children,
  onAction,
  actionLabel = "Delete",
  actionTone = "danger",
}: {
  children: React.ReactNode;
  onAction: () => void;
  actionLabel?: string;
  actionTone?: "danger" | "neutral";
}) {
  const [tx, setTx] = useState(0);
  const [open, setOpen] = useState(false);
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const dragging = useRef(false);
  const aborted = useRef(false);

  const onPointerDown = (e: React.PointerEvent) => {
    startX.current = e.clientX - tx;
    startY.current = e.clientY;
    dragging.current = true;
    aborted.current = false;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current || startX.current == null || startY.current == null) return;
    if (aborted.current) return;
    const dy = Math.abs(e.clientY - startY.current);
    const dx = e.clientX - startX.current;
    if (Math.abs(dx) < 4 && dy > SWIPE_AXIS_LOCK) {
      // Mostly vertical motion — let the page scroll, abort this gesture.
      aborted.current = true;
      return;
    }
    setTx(Math.min(0, Math.max(-ACTION_WIDTH, dx)));
  };

  const onPointerUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    if (aborted.current) {
      // Don't change open/closed state if we bailed out for vertical scroll.
      return;
    }
    if (tx <= -OPEN_THRESHOLD) {
      setTx(-ACTION_WIDTH);
      setOpen(true);
    } else {
      setTx(0);
      setOpen(false);
    }
    startX.current = null;
    startY.current = null;
  };

  const close = () => {
    setTx(0);
    setOpen(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (open) {
      e.preventDefault();
      e.stopPropagation();
      close();
    }
  };

  const actionBg =
    actionTone === "danger"
      ? "bg-danger-500"
      : "bg-slate-500";

  return (
    <div className={`relative overflow-hidden rounded-2xl ${actionBg}`}>
      <div
        className="absolute inset-y-0 right-0 flex items-stretch"
        style={{ width: ACTION_WIDTH }}
        aria-hidden={!open}
      >
        <button
          type="button"
          onClick={() => {
            onAction();
            close();
          }}
          className={`w-full ${actionBg} text-white font-semibold text-sm`}
          tabIndex={open ? 0 : -1}
        >
          {actionLabel}
        </button>
      </div>
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClickCapture={handleClick}
        style={{
          transform: `translateX(${tx}px)`,
          transition: dragging.current ? "none" : "transform 200ms",
          touchAction: "pan-y",
        }}
        className="relative"
      >
        {children}
      </div>
    </div>
  );
}
