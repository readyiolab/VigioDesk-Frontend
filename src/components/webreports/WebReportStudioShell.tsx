import { Suspense, useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Gauge, Plus, List } from "lucide-react";
import { RouteFallback } from "@/components/RouteFallback";
import { cn } from "@/lib/utils";

export function WebReportStudioShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const isReportDetail =
    /^\/webreports\/[^/]+$/.test(location.pathname) &&
    location.pathname !== "/webreports/scan";

  // Support /webreports/scan#new — focus the URL field after navigation
  useEffect(() => {
    if (location.pathname !== "/webreports/scan") return;
    if (location.hash !== "#new") return;
    const el = document.getElementById("audit-url");
    if (el instanceof HTMLElement) {
      el.focus();
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [location.pathname, location.hash]);

  return (
    <div className="flex h-dvh min-h-0 w-full overflow-hidden bg-[#f4f6f9]">
      {!isReportDetail ? (
        <aside className="hidden w-14 shrink-0 flex-col border-r border-slate-200 bg-white py-3 md:flex">
          <div className="mb-4 flex justify-center">
            <NavLink
              to="/webreports/scan"
              className="flex size-8 items-center justify-center rounded-md bg-blue-600 text-xs font-bold text-white"
              title="Web Reports"
            >
              W
            </NavLink>
          </div>
          <nav className="flex flex-1 flex-col items-center gap-1">
            <NavLink
              to="/webreports/scan"
              end
              title="Scans"
              className={({ isActive }) =>
                cn(
                  "flex size-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100",
                  isActive && !location.hash && "bg-blue-50 text-blue-700"
                )
              }
            >
              <List className="size-4" />
            </NavLink>
            <button
              type="button"
              title="New scan"
              onClick={() => navigate("/webreports/scan#new")}
              className={cn(
                "flex size-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100",
                location.hash === "#new" && "bg-blue-50 text-blue-700"
              )}
            >
              <Plus className="size-4" />
            </button>
            <div className="mt-auto flex justify-center pb-2" title="Site audit">
              <Gauge className="size-4 text-slate-300" />
            </div>
          </nav>
        </aside>
      ) : null}
      <main className="min-h-0 min-w-0 flex-1 overflow-hidden">
        <Suspense fallback={<RouteFallback className="h-full min-h-0" />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
