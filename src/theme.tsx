import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type ThemeMode = "auto" | "light" | "dark";

const KEY = "trippack:theme";

interface ThemeApi {
  mode: ThemeMode;
  resolved: "light" | "dark";
  setMode(mode: ThemeMode): void;
  cycle(): void;
}

const ThemeContext = createContext<ThemeApi | null>(null);

function readMode(): ThemeMode {
  try {
    const v = localStorage.getItem(KEY);
    if (v === "light" || v === "dark" || v === "auto") return v;
  } catch {
    // ignore
  }
  return "auto";
}

function systemPrefersDark(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function apply(resolved: "light" | "dark") {
  const root = document.documentElement;
  if (resolved === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => readMode());
  const [systemDark, setSystemDark] = useState<boolean>(() => systemPrefersDark());

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const resolved: "light" | "dark" = mode === "auto" ? (systemDark ? "dark" : "light") : mode;

  useEffect(() => {
    apply(resolved);
  }, [resolved]);

  const api = useMemo<ThemeApi>(
    () => ({
      mode,
      resolved,
      setMode(next) {
        setModeState(next);
        try {
          localStorage.setItem(KEY, next);
        } catch {
          // ignore
        }
      },
      cycle() {
        const order: ThemeMode[] = ["auto", "light", "dark"];
        const idx = order.indexOf(mode);
        const next = order[(idx + 1) % order.length];
        setModeState(next);
        try {
          localStorage.setItem(KEY, next);
        } catch {
          // ignore
        }
      },
    }),
    [mode, resolved]
  );

  return React.createElement(ThemeContext.Provider, { value: api }, children);
}

export function useTheme(): ThemeApi {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
