import { Link, useLocation } from "react-router-dom";
import {
  Layers,
  PenTool,
  FileText,
  GitBranch,
  ScanSearch,
  Bot,
  FolderOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const PRODUCTS = [
  { to: "/workspace", match: "/workspace", label: "PDF Toolkit", icon: Layers },
  { to: "/sign", match: "/sign", label: "eSign", icon: PenTool },
  { to: "/letters/studio", match: "/letters", label: "Letters", icon: FileText },
  { to: "/diagrams/studio", match: "/diagrams", label: "Diagrams", icon: GitBranch },
  { to: "/webreports/scan", match: "/webreports", label: "WebReports", icon: ScanSearch },
  { to: "/ai/summarize", match: "/ai", label: "AI", icon: Bot },
  { to: "/assets", match: "/assets", label: "Assets", icon: FolderOpen },
] as const;

function active(pathname: string, match: string) {
  if (match === "/workspace") return pathname === "/workspace" || pathname.startsWith("/workspace/");
  return pathname === match || pathname.startsWith(`${match}/`);
}

/** Compact product strip for authenticated app chrome. */
export function ProductSwitcher() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  return (
    <div className="border-b border-border/80 bg-card/70 backdrop-blur-sm">
      <nav
        className="mx-auto flex max-w-[1600px] gap-1 overflow-x-auto px-3 py-1.5 sm:px-6 lg:px-10"
        aria-label="Products"
      >
        {PRODUCTS.map((p) => {
          const Icon = p.icon;
          const isOn = active(location.pathname, p.match);
          return (
            <Link
              key={p.to}
              to={p.to}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors",
                isOn
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {p.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
