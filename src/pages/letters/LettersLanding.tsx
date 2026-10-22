import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Lock,
  Mail,
  ShieldCheck,
  Bot,
  Users,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { FaqSection } from "@/components/common/FaqSection";

const EASE = [0.22, 1, 0.36, 1] as const;
const VIEWPORT = { once: true, amount: 0.25 } as const;

const HERO_CHECKS = [
  "Excel in → branded PDFs out",
  "Your Outlook or Gmail sends",
  "AI drafts, humans approve",
] as const;

const STEPS = [
  {
    n: "01",
    title: "Design the letter",
    body: "Pick a starter (increment, offer, confirmation…) or ask AI to draft. Insert fields like {{Employee_Name}} — no Word macros.",
  },
  {
    n: "02",
    title: "Import & map Excel",
    body: "Upload a spreadsheet, map messy columns (CTC_New → New_CTC), validate blanks and duplicates before anything generates.",
  },
  {
    n: "03",
    title: "Generate & send",
    body: "Approve a sample, queue password-protected PDFs, then create drafts or send from your connected Outlook or Gmail.",
  },
] as const;

const FEATURES = [
  {
    icon: FileText,
    title: "Brand Letter Studio",
    body: "Logo, letterhead, signatory, and TipTap editing with reusable blocks.",
  },
  {
    icon: FileSpreadsheet,
    title: "Excel-ready batches",
    body: "Column detection, mapping, validation, and row-level Ready / Warning / Blocked.",
  },
  {
    icon: Mail,
    title: "Your mailbox sends",
    body: "Microsoft Graph or Gmail OAuth — drafts by default, send-now only with confirmation.",
  },
  {
    icon: Bot,
    title: "AI that stays optional",
    body: "Draft, polish, smart mapping, anomaly flags — never auto-approve or auto-send.",
  },
  {
    icon: Users,
    title: "Org & roles",
    body: "Invite HR and finance with Owner / Admin / HR Manager / Viewer access.",
  },
  {
    icon: ShieldCheck,
    title: "Org-scoped & audited",
    body: "Every batch stays in your org. PDF passwords never appear in logs or API responses.",
  },
] as const;

const LETTERS_FAQS = [
  {
    q: "What types of letters can I generate with Vigodesk Letter Studio?",
    a: "Letter Studio is designed for professional business and HR communications at scale. You can design and automate offer letters, annual increment notices, bonus letters, promotion letters, experience certificates, contract renewals, and customized employee agreements.",
  },
  {
    q: "How does the Excel spreadsheet import and column mapping work?",
    a: "Simply upload your standard .xlsx or .csv file. Vigodesk analyzes your column headers and maps them to placeholders like {{Employee_Name}}, {{New_CTC}}, or {{Department}}. Our built-in validation engine inspects every row, flagging blank values, duplicate entries, and syntax issues before anything is generated.",
  },
  {
    q: "Can generated letters be password-protected automatically?",
    a: "Yes. You can configure row-level PDF passwords using employee attributes (such as first letters of name + date of birth or employee ID). Each PDF is compiled with 128-bit or 256-bit encryption, keeping sensitive compensation details confidential.",
  },
  {
    q: "How does email dispatch work with Gmail or Microsoft Outlook?",
    a: "Connect your company email using standard Microsoft Graph or Google Workspace OAuth. Vigodesk creates draft messages directly in your mailbox with personalized letters attached. You can inspect drafts manually or dispatch them automatically with rate-limited delivery.",
  },
  {
    q: "How does role-based access work for HR and Finance teams?",
    a: "You can create organization workspaces and invite team members with specific permission tiers (Owner, Admin, HR Manager, Viewer). All templates, brand assets, and generated batch records stay securely compartmentalized within your organization.",
  },
  {
    q: "Is sensitive payroll and employee data kept private?",
    a: "Absolutely. All batch processing is org-scoped with AES-256 encryption. Passwords and payroll numbers never appear in logs or public responses. Vigodesk never uses your private HR data to train artificial intelligence models.",
  },
];

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function LettersLanding() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start end", "end start"],
  });
  const mockY = useTransform(scrollYProgress, [0, 1], [14, -14]);

  const studioPath = token ? "/letters/studio" : "/login";
  const ctaLabel = token ? "Open Letter Studio" : "Start free";

  return (
    <div className="flex w-full flex-col overflow-x-hidden bg-[#F7F9FC] text-slate-900">
      {/* ── Hero — Home Style with Vigodesk Letter Studio Theme ──────────────── */}
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
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/25 bg-indigo-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-indigo-700 shadow-xs mb-5 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-400">
                <FileText className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>vigodesk.com · Letter Studio</span>
                <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-normal">
                  HR &amp; Stationery
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="font-heading text-balance text-4xl font-black tracking-tight text-slate-900 sm:text-5xl sm:leading-[1.1] lg:text-[3.35rem] xl:text-[3.75rem] dark:text-white">
                Automate Corporate Stationery &amp; <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">Bulk Employee Letters</span>
              </h1>

              {/* Subheading */}
              <p className="mt-5 max-w-xl text-pretty text-base font-normal leading-relaxed text-slate-600 sm:text-lg sm:leading-relaxed dark:text-slate-300">
                Design branded templates once, map messy Excel columns in seconds, and compile hundreds of password-protected PDFs sent directly from your connected Outlook or Gmail.
              </p>

              {/* Dual Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-3.5 sm:gap-4">
                <Button
                  size="lg"
                  className="group relative h-13 cursor-pointer overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-7 sm:px-8 text-sm sm:text-base font-bold text-white shadow-xl shadow-blue-600/30 transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-600/40 hover:scale-[1.02] active:scale-[0.98]"
                  onClick={() => navigate(studioPath)}
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
                  Free includes a 5-row trial batch. Upgrade to PRO to send via Outlook/Gmail.
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
                  className="absolute -right-4 -bottom-6 top-6 h-[88%] w-[96%] rounded-[45%_55%_48%_52%/40%_45%_55%_60%] bg-gradient-to-tr from-indigo-600 via-blue-600 to-sky-400 shadow-[0_30px_90px_-20px_rgba(79,70,229,0.45)] sm:-right-8"
                />

                {/* Secondary ambient glow */}
                <div
                  aria-hidden
                  className="absolute right-8 -top-4 h-56 w-56 rounded-full bg-gradient-to-br from-indigo-400/40 to-blue-500/10 blur-2xl"
                />

                {/* 2. Main Live Mockup */}
                <div className="relative z-10 w-full pt-4">
                  <LettersStudioMock />
                </div>

                {/* 3. Floating Card 1: Column Mapping Tag (Top Left) */}
                <motion.div
                  className="absolute left-0 top-10 sm:-left-6 sm:top-12 z-20 flex items-center gap-3 rounded-2xl border border-white/90 bg-white/95 p-3 px-4 shadow-[0_20px_45px_-12px_rgba(15,23,42,0.22)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <FileSpreadsheet className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Excel Mapped</span>
                      <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.2 text-[8px] font-bold text-emerald-600">
                        182 Rows
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500">Auto-detected 9 columns</p>
                  </div>
                </motion.div>

                {/* 4. Floating Card 2: Password Encryption Badge (Bottom Right) */}
                <motion.div
                  className="absolute -bottom-4 right-0 sm:-bottom-6 sm:right-2 z-20 flex items-center gap-3 rounded-2xl border border-white/90 bg-white/95 p-3.5 px-4 shadow-[0_25px_65px_-15px_rgba(15,23,42,0.28)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.65, delay: 0.45 }}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">AES Encrypted</span>
                      <span className="rounded-full bg-indigo-500/10 px-1.5 py-0.2 text-[8px] font-bold text-indigo-600">
                        Per-Row
                      </span>
                    </div>
                    <p className="font-mono text-[10px] text-slate-500">Formula: DOB + Emp_ID</p>
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
              Three steps from spreadsheet to signed-off letters
            </h2>
          </motion.div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.n}
                className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEWPORT}
                transition={{ duration: 0.45, delay: i * 0.08, ease: EASE }}
              >
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
              Everything HR needs — without leaving the spreadsheet workflow
            </h2>
          </motion.div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={VIEWPORT}
                  transition={{ duration: 0.4, delay: i * 0.05, ease: EASE }}
                >
                  <span className="flex size-10 items-center justify-center rounded-xl bg-blue-500/20 text-sky-300 ring-1 ring-sky-400/20">
                    <Icon className="size-4" />
                  </span>
                  <h3 className="mt-4 text-sm font-semibold">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{f.body}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Letters & Batch FAQs ── */}
      <FaqSection
        badge="Letters & Batches"
        title="Frequently asked questions about Letter Studio"
        subtitle="Everything you need to know about bulk templates, Excel column mapping, encrypted PDFs, and email delivery."
        faqs={LETTERS_FAQS}
      />

      <section className="border-t border-slate-200/70 py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Ready for your next increment cycle?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-base text-slate-500">
            Create an org, invite your HR team, and run your first batch in minutes.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              size="lg"
              className="h-12 cursor-pointer rounded-xl bg-blue-600 px-8 font-semibold text-white hover:bg-blue-700"
              onClick={() => navigate(studioPath)}
            >
              {ctaLabel}
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 cursor-pointer rounded-xl px-8 font-semibold"
              onClick={() => navigate("/billing")}
            >
              View plans
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function LettersStudioMock() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_40px_100px_-30px_rgba(15,23,42,0.35)] ring-1 ring-slate-900/5">
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/90 px-3 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
        <span className="ml-2 truncate text-[11px] font-medium text-slate-500">
          Letter Studio · Increment batch
        </span>
      </div>
      <div className="grid gap-0 sm:grid-cols-[140px_1fr]">
        <div className="hidden space-y-2 border-r border-slate-100 bg-slate-50/50 p-3 sm:block">
          {["Only you", "Brand", "Template", "Excel", "Validate"].map((label, i) => (
            <div
              key={label}
              className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold ${
                i === 3 ? "bg-blue-600 text-white" : "text-slate-600"
              }`}
            >
              {label}
            </div>
          ))}
        </div>
        <div className="space-y-3 p-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-slate-900">Column mapping</p>
              <p className="text-[10px] text-slate-500">182 rows · AI suggested 9 fields</p>
            </div>
            <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[9px] font-bold text-violet-700">
              AI
            </span>
          </div>
          <div className="space-y-1.5 rounded-xl border border-slate-100 bg-slate-50/80 p-2 text-[10px]">
            {[
              ["CTC_New", "New_CTC"],
              ["Emp Name", "Employee_Name"],
              ["Mail ID", "Employee_Email"],
            ].map(([from, to]) => (
              <div key={from} className="flex items-center justify-between gap-2 rounded-lg bg-white px-2 py-1.5 ring-1 ring-slate-100">
                <span className="font-medium text-slate-600">{from}</span>
                <ArrowRight className="size-3 text-slate-300" />
                <span className="font-semibold text-blue-700">{to}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Ready", n: "168", tone: "text-emerald-700 bg-emerald-50" },
              { label: "Warning", n: "11", tone: "text-amber-700 bg-amber-50" },
              { label: "Blocked", n: "3", tone: "text-rose-700 bg-rose-50" },
            ].map((s) => (
              <div key={s.label} className={`rounded-xl px-2 py-2 text-center ${s.tone}`}>
                <div className="text-sm font-bold">{s.n}</div>
                <div className="text-[9px] font-semibold uppercase tracking-wide opacity-80">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
