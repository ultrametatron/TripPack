import { useEffect, useState } from "react";
import Home from "./screens/Home";
import CreateTrip from "./screens/CreateTrip";
import Modules from "./screens/Modules";
import TripDetail from "./screens/TripDetail";
import SettingsSheet from "./components/SettingsSheet";
import { useTheme } from "./theme";

export type Route =
  | { name: "home" }
  | { name: "create" }
  | { name: "modules" }
  | { name: "settings" }
  | { name: "trip"; tripId: string };

function parseHash(): Route {
  const h = (window.location.hash || "#/").replace(/^#/, "");
  if (h.startsWith("/trip/")) {
    const tripId = h.replace("/trip/", "");
    if (tripId) return { name: "trip", tripId };
  }
  if (h === "/create") return { name: "create" };
  if (h === "/modules") return { name: "modules" };
  if (h === "/settings") return { name: "settings" };
  return { name: "home" };
}

export function navigate(route: Route) {
  const map: Record<string, string> = {
    home: "#/",
    create: "#/create",
    modules: "#/modules",
    settings: "#/settings",
  };
  if (route.name === "trip") {
    window.location.hash = `#/trip/${route.tripId}`;
  } else {
    window.location.hash = map[route.name];
  }
}

export default function App() {
  const [route, setRoute] = useState<Route>(parseHash());

  useEffect(() => {
    const onHash = () => setRoute(parseHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return (
    <div className="min-h-full bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <main className="max-w-screen-sm mx-auto pb-24">
        {route.name === "home" && <Home />}
        {route.name === "create" && <CreateTrip />}
        {route.name === "modules" && <Modules />}
        {route.name === "trip" && <TripDetail tripId={route.tripId} />}
      </main>
      {route.name === "settings" && (
        <SettingsSheet onClose={() => navigate({ name: "home" })} />
      )}
      <BottomNav active={route.name} />
    </div>
  );
}

export function ThemeToggle({ size = "sm" }: { size?: "sm" | "md" }) {
  const { mode, cycle } = useTheme();
  const labels: Record<string, string> = { auto: "Auto", light: "Light", dark: "Dark" };
  const icons: Record<string, string> = { auto: "🌓", light: "☀️", dark: "🌙" };
  const cls =
    size === "md"
      ? "btn-secondary !py-2 !px-3"
      : "tap inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200";
  return (
    <button
      type="button"
      onClick={cycle}
      className={cls}
      aria-label={`Theme: ${labels[mode]}. Tap to cycle.`}
      title={`Theme: ${labels[mode]}`}
    >
      <span aria-hidden>{icons[mode]}</span>
      <span>{labels[mode]}</span>
    </button>
  );
}

function BottomNav({ active }: { active: Route["name"] }) {
  const Tab = ({
    label,
    icon,
    target,
    isActive,
  }: {
    label: string;
    icon: string;
    target: () => void;
    isActive: boolean;
  }) => (
    <button
      onClick={target}
      className={`tap flex-1 flex flex-col items-center justify-center py-2 text-xs ${
        isActive
          ? "text-brand-600 font-semibold dark:text-brand-500"
          : "text-slate-500 dark:text-slate-400"
      }`}
    >
      <span className="text-lg leading-none mb-0.5">{icon}</span>
      {label}
    </button>
  );
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-30 safe-bottom dark:bg-slate-900 dark:border-slate-700">
      <div className="max-w-screen-sm mx-auto flex">
        <Tab
          label="Trips"
          icon="🧳"
          target={() => navigate({ name: "home" })}
          isActive={active === "home" || active === "trip"}
        />
        <Tab
          label="New"
          icon="＋"
          target={() => navigate({ name: "create" })}
          isActive={active === "create"}
        />
        <Tab
          label="Modules"
          icon="📦"
          target={() => navigate({ name: "modules" })}
          isActive={active === "modules"}
        />
        <Tab
          label="You"
          icon="👤"
          target={() => navigate({ name: "settings" })}
          isActive={active === "settings"}
        />
      </div>
    </nav>
  );
}
