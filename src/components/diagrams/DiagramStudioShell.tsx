import { Suspense } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { LayoutGrid, Plus } from "lucide-react";
import { RouteFallback } from "@/components/RouteFallback";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/diagrams/studio", label: "My diagrams", icon: LayoutGrid, end: true },
  { to: "/diagrams/new", label: "New", icon: Plus, end: true },
];

export function DiagramStudioShell() {
  const location = useLocation();
  // List stays with the rail; editor routes are full-bleed (draw.io-like).
  const isEditor =
    location.pathname === "/diagrams/new" ||
    (/^\/diagrams\/[^/]+$/.test(location.pathname) &&
      location.pathname !== "/diagrams/studio");

  return (
    <div className="flex h-dvh min-h-0 w-full overflow-hidden bg-[#f7f9fc]">
      {!isEditor ? (
        <aside className="hidden w-14 shrink-0 flex-col border-r border-[#e2e8f0] bg-white py-3 md:flex">
          <div className="mb-4 flex justify-center">
            <NavLink
              to="/diagrams/studio"
              className="flex size-8 items-center justify-center rounded-md bg-[#f97316] text-xs font-bold text-white"
              title="My diagrams"
            >
              D
            </NavLink>
          </div>
          <nav className="flex flex-1 flex-col items-center gap-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                title={item.label}
                className={({ isActive }) =>
                  cn(
                    "flex size-10 items-center justify-center rounded-lg text-[#64748b] hover:bg-[#f1f5f9]",
                    isActive && "bg-[#eff6ff] text-[#1d4ed8]"
                  )
                }
              >
                <item.icon className="size-4" />
              </NavLink>
            ))}
          </nav>
        </aside>
      ) : null}
      <main className="min-h-0 min-w-0 flex-1">
        <Suspense fallback={<RouteFallback className="h-full min-h-0" />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
