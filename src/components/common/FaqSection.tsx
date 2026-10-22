import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface FaqItem {
  q: string;
  a: string;
}

export interface FaqSectionProps {
  badge?: string;
  title?: string;
  subtitle?: string;
  faqs: FaqItem[];
  className?: string;
  variant?: "light" | "dark";
}

export const FaqSection: React.FC<FaqSectionProps> = ({
  badge,
  title = "Frequently Asked Questions",
  subtitle,
  faqs,
  className,
  variant = "light",
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const isDark = variant === "dark";

  return (
    <section
      className={cn(
        "w-full border-t py-20 sm:py-28 transition-colors",
        isDark
          ? "border-white/10 bg-slate-950 text-white"
          : "border-slate-200/80 bg-white text-slate-900 dark:border-border/70 dark:bg-background dark:text-foreground",
        className
      )}
    >
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        
        {/* Section Header - Clean Left-Aligned UI */}
        <div className="mb-10 sm:mb-14 max-w-3xl">
          {badge && (
            <span
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-wider mb-4",
                isDark
                  ? "border border-blue-500/30 bg-blue-500/10 text-blue-400"
                  : "border border-blue-500/25 bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
              )}
            >
              {badge}
            </span>
          )}

          <h2
            className={cn(
              "font-heading text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.75rem] leading-[1.15]",
              isDark ? "text-white" : "text-slate-900 dark:text-white"
            )}
          >
            {title}
          </h2>

          {subtitle && (
            <p
              className={cn(
                "mt-4 text-base sm:text-lg font-normal leading-relaxed",
                isDark ? "text-slate-400" : "text-slate-600 dark:text-slate-300"
              )}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Accordion List with Hairline Dividers */}
        <div
          className={cn(
            "border-t",
            isDark ? "border-white/10" : "border-slate-200/90 dark:border-border/80"
          )}
        >
          {(faqs || []).map((item, i) => {
            const open = openIndex === i;
            return (
              <div
                key={item.q}
                className={cn(
                  "border-b transition-colors",
                  isDark
                    ? "border-white/10"
                    : "border-slate-200/90 dark:border-border/80"
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : i)}
                  className="group flex w-full cursor-pointer items-center justify-between gap-6 py-6 sm:py-7 text-left transition-colors"
                  aria-expanded={open}
                >
                  <span
                    className={cn(
                      "text-lg sm:text-xl font-medium transition-colors",
                      isDark
                        ? "text-white group-hover:text-blue-400"
                        : "text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400"
                    )}
                  >
                    {item.q}
                  </span>
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center transition-colors",
                      isDark ? "text-blue-400" : "text-blue-600 dark:text-blue-400"
                    )}
                  >
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 transition-transform duration-300 ease-out",
                        open && "rotate-180"
                      )}
                    />
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p
                        className={cn(
                          "pb-7 pt-1 text-base sm:text-lg leading-relaxed max-w-4xl font-normal",
                          isDark
                            ? "text-slate-300"
                            : "text-slate-600 dark:text-slate-300"
                        )}
                      >
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default FaqSection;
