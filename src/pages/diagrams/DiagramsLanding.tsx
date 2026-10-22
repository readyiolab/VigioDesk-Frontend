import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Download,
  GitBranch,
  LayoutTemplate,
  Monitor,
  Share2,
  ShieldCheck,
  Shapes,
  Bot,
  Wand2,
  WifiOff,
  KeyRound,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { OFFLINE_PRODUCTS } from "@/lib/pricing";
import { FaqSection } from "@/components/common/FaqSection";

const EASE = [0.22, 1, 0.36, 1] as const;
const VIEWPORT = { once: true, amount: 0.25 } as const;

const HERO_CHECKS = [
  "Full shape library & connectors",
  "AI generate, edit, and image-to-diagram",
  "Share view or edit links",
] as const;

const STEPS = [
  {
    n: "01",
    title: "Open a blank canvas",
    body: "Start from Diagram Studio with a draw.io-style editor — menus, toolbar, grid paper, and page tabs ready to go.",
  },
  {
    n: "02",
    title: "Build or ask AI",
    body: "Drag flowchart, UML, and network shapes, or describe the diagram in plain language and let AI draft the structure.",
  },
  {
    n: "03",
    title: "Export or share",
    body: "Save versions, export PNG / SVG / PDF, or send a view-only or editable share link to your team.",
  },
] as const;

const FEATURES = [
  {
    icon: LayoutTemplate,
    title: "Draw.io-style canvas",
    body: "Grid paper, zoom, pan, undo/redo, align, and auto-layout — familiar controls without leaving the product.",
  },
  {
    icon: Shapes,
    title: "Shape libraries",
    body: "General, Flowchart, UML, Entity Relation, Network/Cloud and more — searchable with More Shapes…",
  },
  {
    icon: Wand2,
    title: "AI-assisted diagrams",
    body: "Text-to-diagram, conversational edits, and image-to-diagram using your existing OpenAI setup.",
  },
  {
    icon: Download,
    title: "Export anywhere",
    body: "Download the current page as PNG, SVG, or PDF, or print straight from the editor.",
  },
  {
    icon: Share2,
    title: "Share links",
    body: "Create view or edit tokens so collaborators open the diagram without hunting for the studio.",
  },
  {
    icon: ShieldCheck,
    title: "Org-scoped",
    body: "Diagrams live under your organization with the same roles you already use for Letters and teams.",
  },
] as const;

const DIAGRAMS_FAQS = [
  {
    q: "What types of diagrams can I design in Diagram Studio?",
    a: "Diagram Studio supports the full spectrum of technical and visual modeling: system architecture, cloud topology (AWS, Azure, Google Cloud, Kubernetes), flowcharts, UML class and sequence diagrams, ER databases, mind maps, network infrastructure, and wireframes.",
  },
  {
    q: "How does AI text-to-diagram generation work?",
    a: "Simply describe your workflow or infrastructure in plain natural language (e.g., 'A microservices auth flow with Redis session caching and PostgreSQL'). AI automatically arranges the shapes, labels, and smart connectors. You can also chat to modify nodes, add decision branches, or convert sketch images into editable diagrams.",
  },
  {
    q: "Which file formats can I export my diagrams to?",
    a: "You can export single pages or complete canvas workspaces to high-resolution PNG (with optional transparency), scalable vector graphics (SVG), or printable vector PDF. You can also export raw XML to backup or migrate your diagrams.",
  },
  {
    q: "Can I share diagrams with external clients or colleagues?",
    a: "Yes. Vigodesk allows you to generate secure view-only or collaborative editing links. Anyone with the link can view or edit directly in their browser without installing plugins, and you can revoke access at any time.",
  },
  {
    q: "Can I import existing Draw.io (.drawio) or XML diagram files?",
    a: "Yes. Diagram Studio uses standard open XML schema compatible with popular diagramming platforms like draw.io and diagrams.net, allowing you to drag and drop existing XML diagrams and resume work instantly.",
  },
  {
    q: "Are my proprietary diagrams and architectural designs kept private?",
    a: "All diagrams are encrypted with AES-256 and scoped strictly to your authenticated workspace or organization. Vigodesk never shares your system schematics or trains public AI models on your private designs.",
  },
];

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function DiagramsLanding() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start end", "end start"],
  });
  const mockY = useTransform(scrollYProgress, [0, 1], [14, -14]);

  const studioPath = token ? "/diagrams/studio" : "/login";
  const ctaLabel = token ? "Open Diagram Studio" : "Start free";

  return (
    <div className="flex w-full flex-col overflow-x-hidden bg-[#F7F9FC] text-slate-900">
      {/* ── Hero — Home Style with Vigodesk Diagram Studio Theme ──────────────── */}
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
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-700 shadow-xs mb-5 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400">
                <Shapes className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>vigodesk.com · Diagram Studio</span>
                <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-normal">
                  Architecture &amp; Flowcharts
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="font-heading text-balance text-4xl font-black tracking-tight text-slate-900 sm:text-5xl sm:leading-[1.1] lg:text-[3.35rem] xl:text-[3.75rem] dark:text-white">
                Design, Generate &amp; Export <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">Technical Architecture</span> &amp; Flowcharts
              </h1>

              {/* Subheading */}
              <p className="mt-5 max-w-xl text-pretty text-base font-normal leading-relaxed text-slate-600 sm:text-lg sm:leading-relaxed dark:text-slate-300">
                A fluid, draw.io-compatible canvas powered by AI text-to-diagram prompting, comprehensive cloud shape libraries, and high-fidelity vector PDF &amp; SVG export.
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
                  className="absolute -right-4 -bottom-6 top-6 h-[88%] w-[96%] rounded-[45%_55%_48%_52%/40%_45%_55%_60%] bg-gradient-to-tr from-blue-600 via-sky-600 to-indigo-600 shadow-[0_30px_90px_-20px_rgba(37,99,235,0.45)] sm:-right-8"
                />

                {/* Secondary ambient glow */}
                <div
                  aria-hidden
                  className="absolute right-8 -top-4 h-56 w-56 rounded-full bg-gradient-to-br from-sky-400/40 to-blue-500/10 blur-2xl"
                />

                {/* 2. Main Live Mockup */}
                <div className="relative z-10 w-full pt-4">
                  <DiagramStudioMock />
                </div>

                {/* 3. Floating Card 1: AI Prompt Chip (Top Left) */}
                <motion.div
                  className="absolute left-0 top-10 sm:-left-6 sm:top-12 z-20 flex items-center gap-3 rounded-2xl border border-white/90 bg-white/95 p-3 px-4 shadow-[0_20px_45px_-12px_rgba(15,23,42,0.22)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600 ring-1 ring-violet-500/20 dark:bg-violet-500/10 dark:text-violet-400">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">AI Flow Generation</span>
                      <span className="rounded-full bg-violet-500/10 px-1.5 py-0.2 text-[8px] font-bold text-violet-600">
                        1.4s
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500">Auto-routes connectors &amp; nodes</p>
                  </div>
                </motion.div>

                {/* 4. Floating Card 2: Vector PDF & SVG Badge (Bottom Right) */}
                <motion.div
                  className="absolute -bottom-4 right-0 sm:-bottom-6 sm:right-2 z-20 flex items-center gap-3 rounded-2xl border border-white/90 bg-white/95 p-3.5 px-4 shadow-[0_25px_65px_-15px_rgba(15,23,42,0.28)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.65, delay: 0.45 }}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">
                    <Download className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Vector Export</span>
                      <span className="rounded-full bg-blue-500/10 px-1.5 py-0.2 text-[8px] font-bold text-blue-600">
                        HD Vector
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500">PDF, SVG &amp; Transparent PNG</p>
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
              From blank page to shared diagram in three steps
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
              Everything you need to diagram — without a separate tool
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

      {/* Offline Diagram Studio */}
      <section
        id="offline"
        className="relative scroll-mt-20 overflow-hidden border-t border-slate-200/70 bg-white py-20 sm:py-24"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 55% 45% at 90% 20%, rgba(37,99,235,0.08), transparent 55%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <p className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-200">
                <WifiOff className="h-3.5 w-3.5" />
                Offline · Windows
              </p>
              <h2 className="font-heading mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Diagram Studio on your desktop
              </h2>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-500 sm:text-lg">
                Prefer diagrams that never leave your machine? License Diagram Studio Desktop —
                draw.io-style canvas, shapes, and export, offline after activation.
              </p>
              <ul className="mt-7 space-y-2.5">
                {[
                  { icon: Monitor, text: "Native Windows app — no browser required" },
                  { icon: WifiOff, text: "Works offline once licensed" },
                  { icon: KeyRound, text: "Activate with a license key; team seats available" },
                ].map((row) => {
                  const Icon = row.icon;
                  return (
                    <li
                      key={row.text}
                      className="flex items-start gap-2.5 text-sm font-medium text-slate-600"
                    >
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                      {row.text}
                    </li>
                  );
                })}
              </ul>
              <div className="mt-9 flex flex-wrap gap-3">
                <Button
                  asChild
                  size="lg"
                  className="h-12 cursor-pointer rounded-full bg-blue-600 px-7 font-semibold text-white hover:bg-blue-700"
                >
                  <a href={OFFLINE_PRODUCTS[1].downloadMailto}>Download for Windows</a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 cursor-pointer rounded-full border-slate-200 px-7 font-semibold"
                  onClick={() => navigate("/desktop")}
                >
                  Explore desktop
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  size="lg"
                  className="h-12 cursor-pointer rounded-full px-5 font-semibold text-slate-600"
                >
                  <a href={OFFLINE_PRODUCTS[1].licenseMailto}>Get license</a>
                </Button>
              </div>
            </motion.div>

            <motion.div
              className="rounded-3xl border border-slate-200 bg-[#F8FAFC] p-6 shadow-sm sm:p-8"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT}
              transition={{ duration: 0.5, delay: 0.08, ease: EASE }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
                Also available
              </p>
              <h3 className="mt-2 text-xl font-bold text-slate-900">PDF Toolkit Desktop</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Pair diagrams with the full PDF toolkit offline — merge, protect, convert, and more
                on the same Windows license workflow.
              </p>
              <Button
                className="mt-6 rounded-full"
                variant="outline"
                onClick={() => navigate("/desktop")}
              >
                See PDF desktop tools
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Diagrams & Architecture FAQs ── */}
      <FaqSection
        badge="Diagrams & Canvas"
        title="Frequently asked questions about Diagram Studio"
        subtitle="Common questions about visual diagramming, AI structure generation, format export, and secure collaboration."
        faqs={DIAGRAMS_FAQS}
      />

      <section className="border-t border-slate-200/70 py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Ready to sketch your next architecture?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-base text-slate-500">
            Open Diagram Studio, drop shapes or prompt AI, and share a clean diagram with your team.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              size="lg"
              className="h-12 cursor-pointer rounded-full bg-blue-600 px-8 font-semibold text-white hover:bg-blue-700"
              onClick={() => navigate(studioPath)}
            >
              {ctaLabel}
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 cursor-pointer rounded-full px-8 font-semibold"
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

function DiagramStudioMock() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_40px_100px_-30px_rgba(15,23,42,0.35)] ring-1 ring-slate-900/5">
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/90 px-3 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
        <span className="ml-2 truncate text-[11px] font-medium text-slate-500">
          Diagram Studio · Untitled Diagram
        </span>
        <span className="ml-auto rounded bg-rose-500 px-1.5 py-0.5 text-[9px] font-semibold text-white">
          Unsaved
        </span>
      </div>

      <div className="grid grid-cols-[88px_1fr] gap-0 sm:grid-cols-[110px_1fr_96px]">
        <div className="space-y-2 border-r border-slate-100 bg-[#f5f7fa] p-2">
          <div className="rounded border border-slate-200 bg-white px-1.5 py-1 text-[8px] text-slate-400">
            Search shapes
          </div>
          <div className="grid grid-cols-2 gap-1">
            {[
              "rounded-sm",
              "rounded-full",
              "rotate-45 rounded-sm",
              "rounded-md",
            ].map((cls, i) => (
              <div
                key={i}
                className={`mx-auto size-7 border border-[#6c8ebf] bg-[#dae8fc] ${cls}`}
              />
            ))}
          </div>
          <p className="pt-1 text-[8px] font-semibold uppercase tracking-wide text-slate-400">
            General
          </p>
        </div>

        <div className="relative min-h-[200px] bg-[#e5e7eb] p-3 sm:min-h-[240px]">
          <div
            className="absolute inset-3 rounded-sm bg-white shadow-sm"
            style={{
              backgroundImage:
                "linear-gradient(#cfe2f5 1px, transparent 1px), linear-gradient(90deg, #cfe2f5 1px, transparent 1px)",
              backgroundSize: "12px 12px",
            }}
          >
            <div className="absolute left-6 top-8 flex w-[72px] flex-col items-center rounded-lg border border-[#6c8ebf] bg-[#dae8fc] px-2 py-2 text-center text-[9px] font-semibold text-slate-700 shadow-sm">
              Login
            </div>
            <div className="absolute left-[110px] top-[52px] h-px w-10 bg-slate-400" />
            <div className="absolute left-[150px] top-6 flex w-[84px] flex-col items-center rounded-full border border-[#6c8ebf] bg-[#dae8fc] px-2 py-2 text-center text-[9px] font-semibold text-slate-700 shadow-sm">
              Auth API
            </div>
            <div className="absolute left-[178px] top-[52px] h-8 w-px bg-slate-400" />
            <div className="absolute left-[140px] top-[84px] flex w-[100px] items-center justify-center border border-[#6c8ebf] bg-[#dae8fc] px-2 py-2 text-center text-[9px] font-semibold text-slate-700 shadow-sm [clip-path:polygon(50%_0,100%_50%,50%_100%,0_50%)]">
              Valid?
            </div>
            <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-white/90 px-1.5 py-0.5 text-[8px] font-medium text-slate-500 ring-1 ring-slate-200">
              <Bot className="size-2.5 text-blue-600" />
              AI ready
            </div>
          </div>
        </div>

        <div className="hidden space-y-2 border-l border-slate-100 bg-[#f5f7fa] p-2 sm:block">
          <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">Format</p>
          <div className="space-y-1.5 text-[9px] text-slate-600">
            <div className="flex items-center justify-between rounded bg-white px-1.5 py-1 ring-1 ring-slate-100">
              <span>Grid</span>
              <span className="h-2 w-4 rounded-full bg-blue-500" />
            </div>
            <div className="flex items-center justify-between rounded bg-white px-1.5 py-1 ring-1 ring-slate-100">
              <span>Page</span>
              <span className="h-2 w-4 rounded-full bg-blue-500" />
            </div>
            <div className="rounded bg-white px-1.5 py-1 ring-1 ring-slate-100">A4 Portrait</div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 border-t border-slate-100 bg-[#eef2f7] px-2 py-1.5">
        <span className="rounded-t bg-white px-2 py-0.5 text-[9px] font-medium text-slate-800 shadow-sm">
          Page-1
        </span>
        <span className="px-2 py-0.5 text-[9px] text-slate-500">Page-2</span>
      </div>
    </div>
  );
}
