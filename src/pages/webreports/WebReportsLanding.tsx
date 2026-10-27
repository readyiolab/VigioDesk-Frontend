import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Gauge,
  ScanSearch,
  Search,
  Share2,
  ShieldCheck,
  Bot,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { FaqSection } from "@/components/common/FaqSection";

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
    icon: Bot,
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

const WEBREPORT_FAQS = [
  {
    q: "What metrics are measured during a Web Report audit?",
    a: "Each audit runs simulated lab and field checks for both mobile and desktop profiles: Core Web Vitals (Largest Contentful Paint, Cumulative Layout Shift, Interaction to Next Paint), page payload size, server response time, technical SEO tags, and AI search engine discoverability.",
  },
  {
    q: "What is the AI-Search Readiness audit?",
    a: "AI-Search readiness assesses how effectively generative AI agents (like ChatGPT, Perplexity, Claude, and Gemini) can discover and interpret your site. We audit robots.txt bot directives, llms.txt declarations, structured schema markup, and JavaScript rendering dependencies.",
  },
  {
    q: "Can I share audit reports with clients or external teams?",
    a: "Yes. You can generate a secure read-only public share link for any completed audit report. Recipients can interact with the performance graphs, recommendations, and diagnostic breakdowns without having to log in.",
  },
  {
    q: "How many daily site scans are included in my plan?",
    a: "Free accounts can run up to 3 site audits per day. Pro plans include 30 daily scans with deeper crawl depth and priority queues. Enterprise plans include up to 100 daily scans with scheduled monitoring.",
  },
  {
    q: "Can I scan password-protected pages or localhost staging sites?",
    a: "No. For security and anti-abuse safeguards, our automated cloud scanners only inspect publicly accessible HTTP and HTTPS URLs. Requests pointing to private IP addresses (RFC 1918), localhost servers, or cloud metadata endpoints are rejected before any crawl.",
  },
  {
    q: "How do I fix the issues highlighted in my Web Report?",
    a: "Each report ranks issues by practical impact and provides concrete guidance: image compression recommendations, caching header improvements, unused CSS/JS reduction, and meta tag corrections.",
  },
];

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
      {/* ── Hero — Home Style with Vigodesk WebReports Theme ──────────────── */}
      <section
        ref={heroRef}
        className="relative w-full overflow-hidden bg-gradient-to-b from-[#EEF4FB] via-[#F7F9FC] to-[#F7F9FC] pt-5 pb-14 sm:pt-7 sm:pb-16 lg:pt-8 lg:pb-20 border-b border-slate-200/70"
      >
        {/* Subtle grid pattern background */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.25]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(59,130,246,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.12) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(ellipse 70% 60% at 50% 30%, black, transparent 75%)",
          }}
        />

        <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">

            {/* LEFT COLUMN: Copy & CTA Buttons */}
            <motion.div
              className="relative z-10 lg:col-span-6 xl:col-span-6"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: EASE }}
            >
              {/* Pill Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700 shadow-xs mb-5 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">
                <Gauge className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>zuvigo.com · WebReports</span>
                <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-normal">
                  SEO &amp; Performance
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="font-heading text-balance text-4xl font-black tracking-tight text-slate-900 sm:text-5xl sm:leading-[1.1] lg:text-[3.35rem] xl:text-[3.75rem] dark:text-white">
                Turn Any Public URL into an <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-emerald-400">Executive Audit Report</span>
              </h1>

              {/* Subheading */}
              <p className="mt-5 max-w-xl text-pretty text-base font-normal leading-relaxed text-slate-600 sm:text-lg sm:leading-relaxed dark:text-slate-300">
                Inspect Core Web Vitals, technical SEO health, and generative AI search crawler indexability in seconds. Get prioritized fixes and share read-only links with stakeholders.
              </p>

              {/* Dual Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-3.5 sm:gap-4">
                <Button
                  size="lg"
                  className="group relative h-13 cursor-pointer overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-7 sm:px-8 text-sm sm:text-base font-bold text-white shadow-xl shadow-blue-600/30 transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-600/40 hover:scale-[1.02] active:scale-[0.98]"
                  onClick={() => navigate(scanPath)}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <span>{ctaLabel}</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="h-13 cursor-pointer rounded-xl border-2 border-slate-900 bg-transparent px-7 text-sm sm:text-base font-bold text-slate-900 shadow-xs transition-all hover:bg-slate-900/5 active:scale-95 dark:border-white dark:text-white dark:hover:bg-white/10"
                  onClick={() => navigate("/billing")}
                >
                  Plans &amp; pricing
                </Button>
              </div>

              {/* Checkmark Highlights */}
              <ul className="mt-9 space-y-3">
                {HERO_CHECKS.map((item, i) => (
                  <motion.li
                    key={item}
                    className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-200"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.28 + i * 0.07, duration: 0.4, ease: EASE }}
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-xs shadow-blue-600/25">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
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

            {/* RIGHT COLUMN: Elevated Visual Composition with Swooping Wave & Live Mock */}
            <motion.div
              className="relative lg:col-span-6 xl:col-span-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.75, delay: 0.15, ease: EASE }}
            >
              <div className="relative mx-auto flex w-full max-w-[560px] items-center justify-center">

                {/* 1. Organic Swooping Wave Background */}
                <div
                  aria-hidden
                  className="absolute -right-4 -bottom-6 top-6 h-[88%] w-[96%] rounded-[45%_55%_48%_52%/40%_45%_55%_60%] bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 shadow-[0_30px_90px_-20px_rgba(16,185,129,0.35)] sm:-right-8"
                />

                {/* Secondary ambient glow */}
                <div
                  aria-hidden
                  className="absolute right-8 -top-4 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-400/40 to-blue-500/10 blur-2xl"
                />

                {/* 2. Main Live Mockup */}
                <div className="relative z-10 w-full pt-4">
                  <ReportMock />
                </div>

                {/* 3. Floating Card 1: Score Badge (Top Left) */}
                <motion.div
                  className="absolute left-0 top-10 sm:-left-6 sm:top-12 z-20 flex items-center gap-3 rounded-2xl border border-white/90 bg-white/95 p-3 px-4 shadow-[0_20px_45px_-12px_rgba(15,23,42,0.22)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <Gauge className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Audit Score</span>
                      <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.2 text-[8px] font-bold text-emerald-600">
                        88 / 100
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500">Mobile 80 · Desktop 90</p>
                  </div>
                </motion.div>

                {/* 4. Floating Card 2: AI Bots Allowed Badge (Bottom Right) */}
                <motion.div
                  className="absolute -bottom-4 right-0 sm:-bottom-6 sm:right-2 z-20 flex items-center gap-3 rounded-2xl border border-white/90 bg-white/95 p-3.5 px-4 shadow-[0_25px_65px_-15px_rgba(15,23,42,0.28)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.65, delay: 0.45 }}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">AI Crawlers Ready</span>
                      <span className="rounded-full bg-blue-500/10 px-1.5 py-0.2 text-[8px] font-bold text-blue-600">
                        Verified
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500">GPTBot, ClaudeBot &amp; Perplexity</p>
                  </div>
                </motion.div>

              </div>
            </motion.div>

          </div>
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

      {/* ── Web Reports & SEO/Performance FAQs ── */}
      <FaqSection
        badge="Web Audits & SEO"
        title="Frequently asked questions about Web Reports"
        subtitle="Learn more about performance metrics, Core Web Vitals, AI-search crawlers, and report sharing."
        faqs={WEBREPORT_FAQS}
      />

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
                className="h-12 cursor-pointer rounded-xl bg-white px-8 font-semibold text-slate-950 hover:bg-slate-100"
                onClick={() => navigate(scanPath)}
              >
                {ctaLabel}
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 cursor-pointer rounded-xl border-white/20 bg-white/5 px-8 font-semibold text-white hover:bg-white/10 hover:text-white"
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
