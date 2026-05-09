import { useEffect, useState } from "react";
import Home from "./screens/Home";
import CreateTrip from "./screens/CreateTrip";
import Modules from "./screens/Modules";
import TripDetail from "./screens/TripDetail";

export type Route =
  | { name: "home" }
  | { name: "create" }
  | { name: "modules" }
  | { name: "trip"; tripId: string };

function parseHash(): Route {
  const h = (window.location.hash || "#/").replace(/^#/, "");
  if (h.startsWith("/trip/")) {
    const tripId = h.replace("/trip/", "");
    if (tripId) return { name: "trip", tripId };
  }
  if (h === "/create") return { name: "create" };
  if (h === "/modules") return { name: "modules" };
  return { name: "home" };
}

export function navigate(route: Route) {
  const map: Record<string, string> = {
    home: "#/",
    create: "#/create",
    modules: "#/modules",
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
    <div className="min-h-full bg-slate-50 text-slate-900">
      <main className="max-w-screen-sm mx-auto pb-24">
        {route.name === "home" && <Home />}
        {route.name === "create" && <CreateTrip />}
        {route.name === "modules" && <Modules />}
        {route.name === "trip" && <TripDetail tripId={route.tripId} />}
      </main>
      <BottomNav active={route.name} />
    </div>
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
        isActive ? "text-brand-600 font-semibold" : "text-slate-500"
      }`}
    >
      <span className="text-lg leading-none mb-0.5">{icon}</span>
      {label}
    </button>
  );
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-30 safe-bottom">
      <div className="max-w-screen-sm mx-auto flex">
        <Tab
          label="Trips"
          icon="🧳"
          target={() => navigate({ name: "home" })}
          isActive={active === "home" || active === "trip"}
        />
        <Tab
          label="New trip"
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
      </div>
    </nav>
  );
}
