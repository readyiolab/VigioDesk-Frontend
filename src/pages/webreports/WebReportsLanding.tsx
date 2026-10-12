import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Gauge,
  ScanSearch,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const EASE = [0.22, 1, 0.36, 1] as const;
const VIEWPORT = { once: true, amount: 0.25 } as const;

const HERO_CHECKS = [
  "Mobile and desktop performance",
  "SEO and AI-search checks",
  "Share a read-only report",
] as const;

const STEPS = [
  {
    n: "01",
    title: "Submit a public URL",
    body: "Paste an http or https address. The scan is queued and runs in the background — you can leave the page.",
  },
  {
    n: "02",
    title: "Crawl and measure",
    body: "We stay on the same site, honor robots.txt, then measure mobile and desktop performance plus SEO and AI-search readiness.",
  },
  {
    n: "03",
    title: "Read the score",
    body: "See an overall score, what could not be measured, and up to six fixes ranked by impact. Share a read-only link when you are ready.",
  },
] as const;

const FEATURES = [
  {
    icon: Gauge,
    title: "Mobile and desktop",
    body: "Lab Lighthouse scores for both devices. Field INP stays separate from lab TBT.",
  },
  {
    icon: Search,
    title: "SEO health",
    body: "Titles, descriptions, headings, canonicals, sitemap, robots, and indexability conflicts.",
  },
  {
    icon: Sparkles,
    title: "AI-search readiness",
    body: "Named AI crawlers, llms.txt, JavaScript-rendered text, structure, and trust signals.",
  },
  {
    icon: Share2,
    title: "Share links",
    body: "Send a read-only report. Revoke the link and it stops working immediately.",
  },
  {
    icon: ShieldCheck,
    title: "Public sites only",
    body: "Private networks, metadata hosts, and credentialed URLs are rejected before any crawl.",
  },
  {
    icon: ScanSearch,
    title: "Plan limits",
    body: "Free 3 scans a day, Pro 30, Enterprise 100. A recent scan of the same URL can be reused.",
  },
] as const;

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function WebReportsLanding() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start end", "end start"],
  });
  const mockY = useTransform(scrollYProgress, [0, 1], [14, -14]);

  const scanPath = token ? "/webreports/scan" : "/login";
  const ctaLabel = token ? "Start scan" : "Start free";

  return (
    <div className="flex w-full flex-col overflow-x-hidden bg-[#F7F9FC] text-slate-900">
      <section
        ref={heroRef}
        className="relative w-full min-h-[min(100svh,920px)] overflow-hidden border-b border-slate-200/70 -mt-14 sm:-mt-16"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 88% 8%, rgba(37,99,235,0.22), transparent 55%), radial-gradient(ellipse 50% 40% at 6% 90%, rgba(16,185,129,0.16), transparent 52%), radial-gradient(ellipse 40% 30% at 50% 40%, rgba(255,255,255,0.9), transparent 70%), linear-gradient(165deg, #F7F9FC 0%, #E7EEF9 48%, #F7F9FC 100%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(100,116,139,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(100,116,139,0.16) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            maskImage: "radial-gradient(ellipse 80% 70% at 50% 40%, black, transparent)",
          }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-blue-400/25 blur-3xl"
          animate={{ y: [0, 18, 0], opacity: [0.35, 0.6, 0.35] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -right-16 bottom-16 h-80 w-80 rounded-full bg-emerald-300/25 blur-3xl"
          animate={{ y: [0, -20, 0], opacity: [0.3, 0.55, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
        />

        <div className="relative mx-auto grid min-h-[min(100svh,920px)] max-w-6xl items-center gap-8 px-4 pb-14 pt-28 sm:px-6 sm:pb-16 sm:pt-32 lg:grid-cols-2 lg:gap-10 lg:px-8">
          <motion.div
            className="relative z-10 w-full"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <p className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm ring-1 ring-blue-200/80 backdrop-blur-sm">
              <ScanSearch className="h-3.5 w-3.5" />
              WebReports · Website audit
            </p>

            <h1 className="font-heading mt-6 text-balance text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl sm:leading-[1.05] lg:text-[3.25rem]">
              Audit any public website
            </h1>

            <p className="mt-4 max-w-xl text-balance text-xl font-medium tracking-tight text-slate-700 sm:text-2xl sm:leading-snug">
              Performance, SEO, and AI-search readiness in one report.
            </p>

            <p className="mt-4 max-w-lg text-pretty text-base leading-relaxed text-slate-500 sm:text-lg">
              Submit a URL and get a scored report with the fixes that matter. Missing measurements stay unavailable — they are never treated as zero.
            </p>

            <motion.div
              className="mt-8 flex flex-wrap items-center gap-3"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.18, ease: EASE }}
            >
              <Button
                size="lg"
                className="h-12 cursor-pointer rounded-full bg-blue-600 px-8 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700"
                onClick={() => navigate(scanPath)}
              >
                {ctaLabel}
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 cursor-pointer rounded-full border-slate-200/90 bg-white/80 px-8 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-sm hover:bg-white"
                onClick={() => scrollToId("how")}
              >
                See how it works
              </Button>
            </motion.div>

            <ul className="mt-8 space-y-2.5">
              {HERO_CHECKS.map((item, i) => (
                <motion.li
                  key={item}
                  className="flex items-center gap-2.5 text-sm font-medium text-slate-600"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.28 + i * 0.06, duration: 0.35, ease: EASE }}
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                    <CheckCircle2 className="h-3 w-3" strokeWidth={2.75} />
                  </span>
                  {item}
                </motion.li>
              ))}
            </ul>

            {user?.plan === "FREE" && (
              <p className="mt-6 text-xs text-slate-500">
                Free includes 3 scans a day. Upgrade to Pro for 30.
              </p>
            )}
          </motion.div>

          <motion.div className="relative mx-auto w-full max-w-lg lg:max-w-none" style={{ y: mockY }}>
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-blue-500/25 via-sky-400/10 to-emerald-400/20 blur-2xl"
            />
            <motion.div
              className="absolute -left-3 top-10 z-20 hidden rounded-2xl border border-white/80 bg-white/90 px-3 py-2 shadow-lg shadow-slate-900/10 backdrop-blur-md sm:block"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">LCP</p>
              <p className="text-sm font-bold text-emerald-600">2.1s · Good</p>
            </motion.div>
            <motion.div
              className="absolute -right-2 bottom-16 z-20 hidden rounded-2xl border border-white/80 bg-white/90 px-3 py-2 shadow-lg shadow-slate-900/10 backdrop-blur-md sm:block"
              animate={{ y: [0, 7, 0] }}
              transition={{ duration: 6.2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">AI bots</p>
              <p className="text-sm font-bold text-blue-700">GPTBot allowed</p>
            </motion.div>
            <ReportMock />
          </motion.div>
        </div>
      </section>

      <section id="how" className="relative border-b border-slate-200/70 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.55, ease: EASE }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">How it works</p>
            <h2 className="font-heading mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Three steps from URL to a scored report
            </h2>
          </motion.div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.n}
                className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-blue-900/5"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEWPORT}
                transition={{ duration: 0.45, delay: i * 0.08, ease: EASE }}
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-sky-400 to-emerald-400 opacity-80" />
                <span className="font-heading text-3xl font-bold text-blue-600/25">{step.n}</span>
                <h3 className="mt-3 text-lg font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{step.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative bg-slate-950 py-20 text-white sm:py-24">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 20% 0%, rgba(37,99,235,0.35), transparent 55%), linear-gradient(180deg, #0B1220 0%, #0F172A 100%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-sky-300">Capabilities</p>
            <h2 className="font-heading mt-2 max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">
              A full audit without treating missing data as a failure
            </h2>
          </motion.div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-colors duration-300 hover:border-sky-400/30 hover:bg-white/10"
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={VIEWPORT}
                  transition={{ duration: 0.4, delay: i * 0.05, ease: EASE }}
                >
                  <span className="flex size-10 items-center justify-center rounded-xl bg-blue-500/20 text-sky-300 ring-1 ring-sky-400/20">
                    <Icon className="size-4" />
                  </span>
                  <h3 className="mt-4 text-sm font-semibold">{feature.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{feature.body}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-16 text-center text-white shadow-2xl shadow-blue-950/20 sm:px-12">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 70% 80% at 50% 120%, rgba(37,99,235,0.45), transparent 60%), radial-gradient(ellipse 40% 50% at 90% 0%, rgba(16,185,129,0.25), transparent 55%)",
            }}
          />
          <div className="relative">
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to scan a site?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-base text-slate-300">
              Start with a homepage. The report keeps lab scores, field data, and the top fixes in one place.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button
                size="lg"
                className="h-12 cursor-pointer rounded-full bg-white px-8 font-semibold text-slate-950 hover:bg-slate-100"
                onClick={() => navigate(scanPath)}
              >
                {ctaLabel}
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 cursor-pointer rounded-full border-white/20 bg-white/5 px-8 font-semibold text-white hover:bg-white/10 hover:text-white"
                onClick={() => navigate("/billing")}
              >
                View plans
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ReportMock() {
  const scores = [
    { label: "Mobile", value: "80", tone: "text-amber-600" },
    { label: "Desktop", value: "90", tone: "text-emerald-600" },
    { label: "SEO", value: "78", tone: "text-amber-600" },
    { label: "AI", value: "84", tone: "text-blue-600" },
  ];
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const dash = (82 / 100) * circumference;

  return (
    <div className="relative overflow-hidden rounded-[1.6rem] border border-white/80 bg-white/95 shadow-[0_40px_100px_-30px_rgba(15,23,42,0.4)] ring-1 ring-slate-900/5 backdrop-blur-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/90 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
        <span className="ml-2 truncate text-[11px] font-medium text-slate-500">
          WebReports · example.com
        </span>
        <span className="ml-auto rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
          Complete
        </span>
      </div>
      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">Overall score</p>
            <p className="mt-1 text-[11px] text-slate-500">3 pages crawled · scan complete</p>
          </div>
          <svg viewBox="0 0 80 80" className="h-[4.5rem] w-[4.5rem]" role="img" aria-label="Overall score 82">
            <defs>
              <linearGradient id="webreport-score" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
            </defs>
            <circle cx="40" cy="40" r={radius} className="stroke-slate-100" strokeWidth="7" fill="none" />
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke="url(#webreport-score)"
              strokeWidth="7"
              fill="none"
              strokeDasharray={`${dash} ${circumference}`}
              strokeLinecap="round"
              transform="rotate(-90 40 40)"
            />
            <text x="40" y="45" textAnchor="middle" className="fill-slate-900 text-[16px] font-bold">
              82
            </text>
          </svg>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {scores.map((score) => (
            <div key={score.label} className="rounded-2xl bg-slate-50 px-2 py-2.5 text-center ring-1 ring-slate-100">
              <div className={`text-base font-bold ${score.tone}`}>{score.value}</div>
              <div className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">{score.label}</div>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/80 to-white p-3.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-600">Top fix</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">Rewrite short titles</p>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
            One title is too short for search results. Impact medium · effort easy.
          </p>
        </div>
      </div>
    </div>
  );
}
