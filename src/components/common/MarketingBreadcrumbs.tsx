import { Link } from "react-router-dom";
import { breadcrumbsFor } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

type Props = {
  path: string;
  className?: string;
};

/** Visible breadcrumb trail for marketing landings (pairs with BreadcrumbList JSON-LD). */
export function MarketingBreadcrumbs({ path, className }: Props) {
  const crumbs = breadcrumbsFor(path);
  if (crumbs.length < 2) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn("text-xs text-slate-500", className)}>
      <ol className="flex flex-wrap items-center gap-1">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li key={c.path} className="inline-flex items-center gap-1">
              {i > 0 ? <ChevronRight className="size-3 text-slate-300" aria-hidden /> : null}
              {last ? (
                <span className="font-medium text-slate-700" aria-current="page">
                  {c.name}
                </span>
              ) : (
                <Link to={c.path} className="hover:text-blue-700 hover:underline">
                  {c.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
