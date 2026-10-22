import { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Building2,
  Check,
  Download,
  HardDrive,
  KeyRound,
  Lock,
  Monitor,
  ShieldCheck,
  WifiOff,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DesktopAppMock } from "@/components/desktop/DesktopAppMock";
import {
  DESKTOP_EASE,
  DESKTOP_FADE_UP,
  DESKTOP_STAGGER,
  DESKTOP_VIEWPORT,
  DOWNLOAD_MAILTO,
  LICENSE_MAILTO,
  SALES_MAILTO,
} from "@/components/desktop/motion";
import { FaqSection } from "@/components/common/FaqSection";

const DESKTOP_FAQS = [
  {
    q: "Does the Windows desktop app work without an internet connection?",
    a: "Yes. After a quick one-time license key activation, the desktop app works 100% offline. All conversions, page reordering, compression, and password protection execute locally on your PC with zero cloud dependency.",
  },
  {
    q: "What Windows versions are supported?",
    a: "Vigodesk Desktop supports 64-bit Windows 10 and Windows 11. It installs as a lightweight, native Windows application with no heavy third-party framework overhead.",
  },
  {
    q: "How does the desktop license work?",
    a: "Desktop licenses are purchased as a one-time payment providing a perpetual license key with 3 full years of software updates, bug fixes, and priority support.",
  },
  {
    q: "Can I transfer my license to a new PC?",
    a: "Yes. If you upgrade or replace your computer, you can deactivate the license key on your previous machine and reactivate it on your new device.",
  },
  {
    q: "Are my files completely private on my machine?",
    a: "Yes, absolutely. Unlike cloud-only web converters, the desktop app performs all processing in local device memory and writes outputs directly to your local file system.",
  },
];

const HERO_CHECKS = [
  "PDF tools + Diagram Studio",
  "Files stay on your PC",
  "Works offline after activation",
  "Windows desktop apps",
] as const;

const WHY = [
  {
    icon: ShieldCheck,
    title: "Private by default",
    body: "Files stay on your PC. Nothing is uploaded to random cloud editors.",
  },
  {
    icon: Zap,
    title: "Built for speed",
    body: "Native desktop processing — no waiting on uploads or browser tabs.",
  },
  {
    icon: WifiOff,
    title: "Works offline",
    body: "After activation, use your tools without an internet connection.",
  },
  {
    icon: HardDrive,
    title: "Your machine, your storage",
    body: "Outputs land where you choose. No third-party file retention.",
  },
] as const;

const FEATURE_GROUPS = [
  {
    title: "Organize",
    items: [
      "Merge",
      "Split",
      "Organize pages (multi-PDF)",
      "Rotate",
      "Compare",
    ],
  },
  {
    title: "Edit & Protect",
    items: [
      "Watermark",
      "Stamp",
      "Bates numbers",
      "Quicksign",
      "Compress",
      "Encrypt",
      "Decrypt",
      "Protect",
      "Redact",
    ],
  },
  {
    title: "Convert",
    items: [
      "PDF ↔ Images",
      "Images → PDF",
      "Office → PDF",
      "PDF → Word",
      "Web → PDF",
      "OCR",
      "Batch create",
      "Extract text",
    ],
  },
  {
    title: "Diagram Studio",
    items: [
      "Draw.io-style canvas",
      "Shape libraries & connectors",
      "Multi-page diagrams",
      "Export PNG / SVG / PDF",
      "Offline after license",
    ],
  },
] as const;

const STEPS = [
  {
    n: "01",
    title: "Download",
    body: "Get the Windows installer from our team. We’ll send the link to your inbox.",
  },
  {
    n: "02",
    title: "Install",
    body: "Run the setup once. PDF Toolkit and Diagram Studio live on your desktop — no browser required.",
  },
  {
    n: "03",
    title: "Enter license key",
    body: "Activate with your key. One seat or a team pack — same calm flow.",
  },
  {
    n: "04",
    title: "Use your tools",
    body: "Merge, protect, convert, and diagram — all offline after activation.",
  },
] as const;

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function DesktopToolkit() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start end", "end start"],
  });
  const mockY = useTransform(scrollYProgress, [0, 1], [14, -14]);

  return (
    <div className="flex w-full flex-col overflow-x-hidden bg-[#F7F9FC] text-slate-900">
      {/* ── Elevated Hero — Nitro & Vigodesk Theme ── */}
      <section
        ref={heroRef}
        className="relative w-full overflow-hidden bg-gradient-to-b from-[#EEF4FB] via-[#F7F9FC] to-[#F7F9FC] pt-8 pb-16 sm:pt-10 sm:pb-20 lg:pt-12 lg:pb-24 border-b border-slate-200/70"
      >
        {/* Subtle grid background pattern with radial mask */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(100,116,139,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(100,116,139,0.18) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(ellipse 80% 65% at 50% 35%, black, transparent)",
          }}
        />

        {/* Ambient background glows */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 top-20 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-12 h-96 w-96 rounded-full bg-indigo-500/15 blur-3xl"
        />

        <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12 xl:gap-16">
            
            {/* LEFT COLUMN: Clean, Left-Aligned High-Impact Copy */}
            <motion.div
              className="relative z-10 lg:col-span-6 xl:col-span-6"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: DESKTOP_EASE }}
            >
              {/* Pill Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-700 shadow-xs mb-5 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400">
                <Monitor className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>vigodesk.com · Desktop App</span>
                <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-normal">
                  Offline Native
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="font-heading text-balance text-4xl font-black tracking-tight text-slate-900 sm:text-5xl sm:leading-[1.1] lg:text-[3.25rem] xl:text-[3.65rem] dark:text-white">
                PDF Tools &amp; Diagrams. <span className="bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 bg-clip-text text-transparent">100% Offline on Windows.</span>
              </h1>

              {/* Subheading */}
              <p className="mt-5 max-w-xl text-pretty text-base font-normal leading-relaxed text-slate-600 sm:text-lg sm:leading-relaxed dark:text-slate-300">
                Fast, private, and air-gapped ready. Install natively on Windows 10 &amp; 11, activate once with your perpetual license key, and process sensitive contracts and system architecture diagrams with zero cloud telemetry.
              </p>

              {/* Dual Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-3.5 sm:gap-4">
                <Button
                  asChild
                  size="lg"
                  className="group relative h-13 cursor-pointer overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-7 sm:px-8 text-sm sm:text-base font-bold text-white shadow-xl shadow-blue-600/30 transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-600/40 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <a href={DOWNLOAD_MAILTO}>
                    <Download className="mr-2 h-4 w-4" />
                    <span>Download for Windows</span>
                  </a>
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

              {/* Team Pack Sales Link */}
              <div className="mt-4">
                <a
                  href={SALES_MAILTO}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 transition-colors hover:text-blue-700 dark:text-slate-400 dark:hover:text-blue-400"
                >
                  Need team or enterprise site licenses?
                  <span className="text-blue-600 dark:text-blue-400 underline underline-offset-4">Contact enterprise sales</span>
                  <ArrowRight className="h-3.5 w-3.5 text-blue-600" />
                </a>
              </div>

              {/* Checkmark Highlights */}
              <ul className="mt-8 space-y-3">
                {HERO_CHECKS.map((item, i) => (
                  <motion.li
                    key={item}
                    className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-200"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.28 + i * 0.07, duration: 0.4, ease: DESKTOP_EASE }}
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-xs shadow-blue-600/25">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </span>
                    {item}
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* RIGHT COLUMN: Elevated Visual Composition with Swooping Wave & Live Desktop App Mock */}
            <motion.div
              className="relative lg:col-span-6 xl:col-span-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.75, delay: 0.15, ease: DESKTOP_EASE }}
            >
              <div className="relative mx-auto flex w-full max-w-[580px] items-center justify-center">

                {/* 1. Organic Swooping Wave Background */}
                <div
                  aria-hidden
                  className="absolute -right-4 -bottom-6 top-6 h-[88%] w-[96%] rounded-[45%_55%_48%_52%/40%_45%_55%_60%] bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 shadow-[0_30px_90px_-20px_rgba(37,99,235,0.45)] sm:-right-8"
                />

                {/* Secondary ambient glow */}
                <div
                  aria-hidden
                  className="absolute right-8 -top-4 h-56 w-56 rounded-full bg-gradient-to-br from-sky-400/40 to-blue-500/10 blur-2xl"
                />

                {/* 2. Main Live Mockup: DesktopAppMock */}
                <div className="relative z-10 w-full pt-4">
                  <DesktopAppMock variant="light" className="shadow-[0_30px_80px_-25px_rgba(15,23,42,0.35)]" />
                </div>

                {/* 3. Floating Card 1: Air-Gapped Mode Badge (Top Left) */}
                <motion.div
                  className="absolute left-0 top-10 sm:-left-6 sm:top-12 z-20 flex items-center gap-3 rounded-2xl border border-white/90 bg-white/95 p-3 px-4 shadow-[0_20px_45px_-12px_rgba(15,23,42,0.22)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">
                    <WifiOff className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">100% Offline Mode</span>
                      <span className="rounded-full bg-blue-500/10 px-1.5 py-0.2 text-[8px] font-bold text-blue-600">
                        Air-Gapped
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500">Zero cloud uploads or telemetry</p>
                  </div>
                </motion.div>

                {/* 4. Floating Card 2: Perpetual License Badge (Bottom Right) */}
                <motion.div
                  className="absolute -bottom-4 right-0 sm:-bottom-6 sm:right-2 z-20 flex items-center gap-3 rounded-2xl border border-white/90 bg-white/95 p-3.5 px-4 shadow-[0_25px_65px_-15px_rgba(15,23,42,0.28)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.65, delay: 0.45 }}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <HardDrive className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Local Drive Speed</span>
                      <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.2 text-[8px] font-bold text-emerald-600">
                        Native C++ / Go
                      </span>
                    </div>
                    <p className="font-mono text-[10px] text-slate-500">Perpetual 3-Yr Key</p>
                  </div>
                </motion.div>

              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Why desktop */}
      <section className="w-full border-b border-slate-200/70 bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
              Why desktop
            </p>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Privacy and speed without the browser
            </h2>
            <p className="mt-3 text-base text-slate-500 sm:text-lg">
              A licensed Windows app for teams that want control — not another upload portal.
            </p>
          </div>

          <motion.div
            className="mt-12 grid gap-5 sm:grid-cols-2"
            initial="hidden"
            whileInView="visible"
            viewport={DESKTOP_VIEWPORT}
            variants={DESKTOP_STAGGER}
          >
            {WHY.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  variants={DESKTOP_FADE_UP}
                  className="flex gap-4 rounded-3xl border border-slate-200/90 bg-[#F8FAFC] p-6"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-[15px] font-semibold text-slate-900">{item.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{item.body}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="w-full scroll-mt-20 border-b border-slate-200/70 bg-[#F7F9FC] py-20 sm:py-28"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
              Features
            </p>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Every tool in one place
            </h2>
            <p className="mt-3 text-base text-slate-500 sm:text-lg">
              Organize, edit, protect, convert, and diagram — without leaving your desktop.
            </p>
          </div>

          <motion.div
            className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
            initial="hidden"
            whileInView="visible"
            viewport={DESKTOP_VIEWPORT}
            variants={DESKTOP_STAGGER}
          >
            {FEATURE_GROUPS.map((group) => (
              <motion.div key={group.title} variants={DESKTOP_FADE_UP}>
                <h3 className="font-heading text-lg font-semibold tracking-tight text-slate-900">
                  {group.title}
                </h3>
                <ul className="mt-4 space-y-2.5 border-t border-slate-200/80 pt-4">
                  {group.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2.5 text-sm text-slate-600"
                    >
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="w-full border-b border-slate-200/70 bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
              How it works
            </p>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Live in four steps
            </h2>
            <p className="mt-3 text-base text-slate-500 sm:text-lg">
              Download, install, activate — then open any PDF tool you need.
            </p>
          </div>

          <motion.ol
            className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
            initial="hidden"
            whileInView="visible"
            viewport={DESKTOP_VIEWPORT}
            variants={DESKTOP_STAGGER}
          >
            {STEPS.map((step) => (
              <motion.li
                key={step.n}
                variants={DESKTOP_FADE_UP}
                className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-[#F8FAFC] p-6"
              >
                <span className="font-heading text-4xl font-bold text-blue-200">{step.n}</span>
                <h3 className="mt-3 text-lg font-semibold tracking-tight text-slate-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{step.body}</p>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      </section>

      {/* For teams */}
      <section className="w-full border-b border-slate-200/70 bg-[#F7F9FC] py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={DESKTOP_VIEWPORT}
              transition={{ duration: 0.55, ease: DESKTOP_EASE }}
            >
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                For teams
              </p>
              <h2 className="font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Organization licenses that scale with seats
              </h2>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-500 sm:text-lg">
                Multi-seat packs for departments that need the same toolkit on every workstation —
                without fake price tables.
              </p>
              <ul className="mt-7 space-y-3">
                {[
                  "Shared organization key or bulk individual keys",
                  "Admin-managed seats for your team",
                  "Same offline desktop experience per machine",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                    {line}
                  </li>
                ))}
              </ul>
              <Button
                asChild
                size="lg"
                className="mt-9 h-12 cursor-pointer rounded-full bg-blue-600 px-7 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700"
              >
                <a href={SALES_MAILTO}>
                  Contact sales
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </a>
              </Button>
              <p className="mt-4 text-sm text-slate-500">
                Prefer the cloud?{" "}
                <Link to="/billing" className="font-semibold text-blue-600 hover:text-blue-700">
                  See online plans
                </Link>{" "}
                — Free, Pro $12/mo, Enterprise.
              </p>
            </motion.div>

            <motion.div
              className="relative overflow-hidden rounded-[1.75rem] border border-slate-200/90 bg-white p-7 shadow-sm sm:p-8"
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={DESKTOP_VIEWPORT}
              transition={{ duration: 0.55, delay: 0.08, ease: DESKTOP_EASE }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Team rollout</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    One conversation with support — we set up seats and keys for your org.
                  </p>
                </div>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                  <Building2 className="h-5 w-5" />
                </span>
              </div>
              <ul className="mt-6 space-y-3 border-t border-slate-100 pt-5">
                {[
                  { icon: Lock, label: "License activation on each Windows PC" },
                  { icon: Monitor, label: "Identical toolset across seats" },
                  { icon: ShieldCheck, label: "Files never leave your network by default" },
                ].map((row) => {
                  const Icon = row.icon;
                  return (
                    <li key={row.label} className="flex items-center gap-3 text-sm text-slate-600">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-slate-700 ring-1 ring-slate-200/80">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      {row.label}
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative w-full overflow-hidden border-t border-slate-200/70">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 80% at 0% 50%, rgba(37,99,235,0.26), transparent 55%), radial-gradient(ellipse 55% 70% at 100% 40%, rgba(14,165,233,0.2), transparent 50%), linear-gradient(165deg, #0B1220 0%, #0F172A 48%, #111827 100%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(148,163,184,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.12) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(ellipse 70% 80% at 50% 50%, black, transparent)",
          }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-1/3 top-0 h-px w-1/3 bg-gradient-to-r from-transparent via-sky-400/50 to-transparent"
          initial={{ opacity: 0, scaleX: 0.4 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={DESKTOP_VIEWPORT}
          transition={{ duration: 0.8, ease: DESKTOP_EASE }}
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 text-white sm:px-6 sm:py-28 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={DESKTOP_VIEWPORT}
            transition={{ duration: 0.55, ease: DESKTOP_EASE }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300/90">
              Get started
            </p>
            <h2 className="font-heading mt-3 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl sm:leading-[1.12]">
              Ready for PDF &amp; Diagrams on Windows?
            </h2>
            <p className="mt-4 max-w-lg text-pretty text-base leading-relaxed text-slate-300 sm:text-lg">
              Request the installer or a license key. We reply from{" "}
              <a
                href="mailto:support@zuvigo.com"
                className="font-semibold text-sky-300 underline-offset-2 hover:underline"
              >
                support@zuvigo.com
              </a>
              — usually the same day. For cloud SaaS pricing,{" "}
              <Link to="/billing" className="font-semibold text-sky-300 underline-offset-2 hover:underline">
                see online plans
              </Link>
              .
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button
                asChild
                size="lg"
                className="h-12 cursor-pointer rounded-full bg-sky-400 px-7 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-400/25 transition-transform hover:scale-[1.02] hover:bg-sky-300"
              >
                <a href={DOWNLOAD_MAILTO}>
                  <Download className="mr-1.5 h-4 w-4" />
                  Download for Windows
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 cursor-pointer rounded-full border-slate-500/80 bg-transparent px-7 text-sm font-semibold text-slate-100 hover:bg-white/5 hover:text-white"
              >
                <a href={LICENSE_MAILTO}>Get a license</a>
              </Button>
            </div>

            <Link
              to="/#desktop"
              className="mt-7 inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition-colors hover:text-sky-300"
            >
              See it on the homepage
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={DESKTOP_VIEWPORT}
            transition={{ duration: 0.55, delay: 0.08, ease: DESKTOP_EASE }}
          >
            <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-sky-500/20 to-blue-600/10 blur-2xl" />
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm sm:p-7">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">Your next three emails</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">
                    Installer link, license key, and activation help — from support.
                  </p>
                </div>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/30">
                  <Monitor className="h-5 w-5" />
                </span>
              </div>

              <ol className="mt-6 space-y-3">
                {[
                  { n: "1", title: "Email us", body: "Download or license request" },
                  { n: "2", title: "Install on Windows", body: "Run setup once on your PC" },
                  { n: "3", title: "Activate & go", body: "Enter your key — tools unlock" },
                ].map((step, i) => (
                  <motion.li
                    key={step.n}
                    className="flex items-start gap-3 rounded-xl bg-white/[0.05] px-3.5 py-3 ring-1 ring-white/10"
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={DESKTOP_VIEWPORT}
                    transition={{ delay: 0.12 + i * 0.06, duration: 0.35, ease: DESKTOP_EASE }}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-500/20 text-xs font-bold text-sky-300 ring-1 ring-sky-400/25">
                      {step.n}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">{step.title}</p>
                      <p className="mt-0.5 text-xs text-slate-400">{step.body}</p>
                    </div>
                  </motion.li>
                ))}
              </ol>

              <div className="mt-5 flex items-center gap-2.5 border-t border-white/10 pt-5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/25">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </span>
                <p className="text-xs leading-relaxed text-slate-400">
                  Private by design — processing stays on your machine after activation.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Windows Desktop & Offline FAQs ───────────────────────────────── */}
      <FaqSection
        variant="dark"
        badge="Windows Desktop & Offline"
        title="Frequently asked questions about Desktop"
        subtitle="Answers on local PC processing, offline license keys, transferability, and local privacy."
        faqs={DESKTOP_FAQS}
      />
    </div>
  );
}
