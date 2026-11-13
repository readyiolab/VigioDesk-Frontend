import React, { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { JsonLd } from "@/components/JsonLd";
import { faqPageSchema } from "@/lib/schema";

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
  /** When false, skip FAQPage JSON-LD (default true) */
  structuredData?: boolean;
}

export const FaqSection: React.FC<FaqSectionProps> = ({
  badge,
  title = "Frequently Asked Questions",
  subtitle,
  faqs,
  className,
  variant = "light",
  structuredData = true,
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const isDark = variant === "dark";
  const faqSchema = useMemo(
    () => (structuredData ? faqPageSchema(faqs) : null),
    [faqs, structuredData]
  );

  return (
    <section
      aria-labelledby="faq-heading"
      className={cn(
        "w-full border-t py-16 sm:py-24 transition-colors",
        isDark
          ? "border-white/10 bg-slate-950 text-white"
          : "border-slate-200/80 bg-white text-slate-900 dark:border-border/70 dark:bg-background dark:text-foreground",
        className
      )}
    >
      {faqSchema ? <JsonLd id="faq-page" data={faqSchema} /> : null}

      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <header className="mb-8 max-w-3xl sm:mb-12">
          {badge ? (
            <span
              className={cn(
                "mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider",
                isDark
                  ? "border border-blue-500/30 bg-blue-500/10 text-blue-400"
                  : "border border-blue-500/25 bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
              )}
            >
              {badge}
            </span>
          ) : null}

          <h2
            id="faq-heading"
            className={cn(
              "font-heading text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl leading-[1.15]",
              isDark ? "text-white" : "text-slate-900 dark:text-white"
            )}
          >
            {title}
          </h2>

          {subtitle ? (
            <p
              className={cn(
                "mt-3 text-base leading-relaxed sm:text-lg",
                isDark ? "text-slate-400" : "text-slate-600 dark:text-slate-300"
              )}
            >
              {subtitle}
            </p>
          ) : null}
        </header>

        <div
          className={cn(
            "divide-y border-y",
            isDark ? "divide-white/10 border-white/10" : "divide-slate-200 border-slate-200 dark:divide-border dark:border-border"
          )}
        >
          {(faqs || []).map((item, i) => {
            const open = openIndex === i;
            const qId = `faq-q-${i}`;
            const aId = `faq-a-${i}`;
            return (
              <article key={item.q} className="py-1">
                <h3 className="text-base font-semibold sm:text-lg">
                  <button
                    id={qId}
                    type="button"
                    onClick={() => setOpenIndex(open ? null : i)}
                    className="group flex w-full cursor-pointer items-center justify-between gap-4 py-4 text-left sm:py-5"
                    aria-expanded={open}
                    aria-controls={aId}
                  >
                    <span
                      className={cn(
                        "transition-colors",
                        isDark
                          ? "text-white group-hover:text-blue-400"
                          : "text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400"
                      )}
                    >
                      {item.q}
                    </span>
                    <ChevronDown
                      className={cn(
                        "size-5 shrink-0 text-blue-600 transition-transform duration-300 dark:text-blue-400",
                        open && "rotate-180"
                      )}
                      aria-hidden
                    />
                  </button>
                </h3>

                <AnimatePresence initial={false}>
                  {open ? (
                    <motion.div
                      id={aId}
                      role="region"
                      aria-labelledby={qId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p
                        className={cn(
                          "max-w-4xl pb-5 text-sm leading-relaxed sm:text-base",
                          isDark ? "text-slate-300" : "text-slate-600 dark:text-slate-300"
                        )}
                      >
                        {item.a}
                      </p>
                    </motion.div>
                  ) : (
                    /* Keep answer text in DOM for crawlers even when collapsed */
                    <p className="sr-only">{item.a}</p>
                  )}
                </AnimatePresence>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
