import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { TOOLS, TOOL_CATEGORIES, getToolRoute } from "@/lib/design-tokens";
import {
  ArrowRight,
  ChevronDown,
  Cloud,
  FileSignature,
  FileText,
  GitBranch,
  GitMerge,
  Hash,
  KeyRound,
  Lock,
  Mail,
  Minimize2,
  Monitor,
  Scissors,
  ShieldCheck,
  Bot,
  Users,
  WifiOff,
  Check,
  PenTool,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ByocFlowDiagram } from "@/components/byoc/ByocFlowDiagram";
import { ProviderChips } from "@/components/byoc/ProviderChips";
import { AnimatedChecks } from "@/components/byoc/AnimatedChecks";
import { BYOC_EASE, BYOC_VIEWPORT } from "@/components/byoc/motion";
import { DesktopAppMock } from "@/components/desktop/DesktopAppMock";
import {
  DESKTOP_EASE,
  DESKTOP_VIEWPORT,
  DOWNLOAD_MAILTO,
} from "@/components/desktop/motion";
import { EsignStatusMock } from "@/components/esign/EsignStatusMock";
import { ONLINE_PLANS } from "@/lib/pricing";
import { prefetchRoute } from "@/lib/routePrefetch";
import { FaqSection } from "@/components/common/FaqSection";

const FAQS = [
  {
    q: "What document solutions does Vigodesk offer?",
    a: "Vigodesk offers a complete, browser-first document platform. It brings together 25+ PDF productivity tools (converting, merging, splitting, compressing, and OCR), legally binding eSignatures with audit trails, AES-256 password security, and generative AI for instant document summaries and Q&A.",
  },
  {
    q: "What are the main features of Vigodesk PDF?",
    a: "Vigodesk PDF provides full lifecycle document processing: bidirectional conversion between PDF and Office formats (Word, Excel, PowerPoint, JPG, PNG), page organization, crisp compression, watermark overlays, metadata cleanup, and password encryption — all without installing heavy desktop software.",
  },
  {
    q: "What AI tools does Vigodesk offer for PDF & eSign workflows?",
    a: "Vigodesk AI tools include AI Summarize (instant executive briefs and action items), Ask PDF (grounded conversational Q&A on contracts and reports), Explain PDF (translating dense clauses into plain language), and high-accuracy OCR scanning that turns scanned paperwork into editable text.",
  },
  {
    q: "How does Vigodesk keep my data private and secure?",
    a: "We believe privacy should be non-negotiable. Client-side tools execute directly inside your browser sandbox so files never leave your device. For server-accelerated tasks, documents are encrypted with AES-256 in transit and at rest, guarded by short-lived signed tokens, and automatically deleted after 60 minutes.",
  },
  {
    q: "What compliance and legal standards does Vigodesk meet?",
    a: "Vigodesk eSign signatures are legally binding under the US ESIGN Act, UETA, and European eIDAS regulations. Every signed agreement includes a cryptographic SHA-256 seal, timestamp, and tamper-evident audit trail certificate. Enterprise plans also support custom cloud storage (AWS S3, Azure, Cloudflare R2, GCP) for complete data residency compliance.",
  },
  {
    q: "Can my team use Vigodesk without installing software?",
    a: "Yes. Vigodesk runs seamlessly across modern desktop and mobile browsers (Chrome, Edge, Safari, Firefox). For teams working in air-gapped environments or requiring offline local processing, a lightweight Vigodesk Desktop companion app is also available.",
  },
];

const HOME_CATEGORIES = ["All", ...TOOL_CATEGORIES.filter((c) => c !== "All")];

const ease = [0.22, 1, 0.36, 1] as const;

function isAiTool(id: string) {
  return id === "summarize" || id === "chatpdf" || id === "explain" || id === "ocr";
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export const Home: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [toolCategory, setToolCategory] = useState("All");
  const byocSectionRef = useRef<HTMLElement>(null);
  const desktopSectionRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: byocSectionRef,
    offset: ["start end", "end start"],
  });
  const { scrollYProgress: desktopScrollY } = useScroll({
    target: desktopSectionRef,
    offset: ["start end", "end start"],
  });
  const { scrollYProgress: heroScrollY } = useScroll({
    target: heroRef,
    offset: ["start end", "end start"],
  });
  const diagramY = useTransform(scrollYProgress, [0, 1], [18, -18]);
  const desktopMockY = useTransform(desktopScrollY, [0, 1], [18, -18]);
  const heroStageY = useTransform(heroScrollY, [0, 1], [16, -16]);

  const primaryCta = user ? "Open workspace" : "Start free";
  const primaryPath = "/workspace";
  const warmNav = (path: string) => () => prefetchRoute(path);
  const byocPath = user?.plan === "ENTERPRISE" ? "/settings/cloud" : "/enterprise";
  const byocCta = user?.plan === "ENTERPRISE" ? "Open cloud storage" : "Use your own cloud";

  const filteredTools = useMemo(
    () =>
      TOOLS.filter(
        (tool) => toolCategory === "All" || tool.categories.includes(toolCategory)
      ),
    [toolCategory]
  );

  return (
    <div className="flex w-full flex-col overflow-x-hidden bg-[#F7F9FC] text-slate-900">
      {/* ── Hero — Nitro style with Vigodesk Theme ──────────────── */}
      <section
        ref={heroRef}
        className="relative w-full overflow-hidden bg-gradient-to-b from-[#EEF4FB] via-[#F7F9FC] to-[#F7F9FC] pt-5 pb-14 sm:pt-7 sm:pb-16 lg:pt-8 lg:pb-20"
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
              transition={{ duration: 0.65, ease }}
            >


              {/* Main Headline */}
              <h1 className="font-heading text-balance text-4xl font-black tracking-tight text-slate-900 sm:text-5xl sm:leading-[1.1] lg:text-[3.5rem] xl:text-[4rem] dark:text-white">
                Work Smarter with Every <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">Document, Contract</span> &amp; PDF
              </h1>

              {/* Subheading */}
              <p className="mt-5 max-w-xl text-pretty text-base font-normal leading-relaxed text-slate-600 sm:text-lg sm:leading-relaxed dark:text-slate-300">
                Effortlessly convert, edit, eSign, and extract AI intelligence in one unified workspace. Built for professionals and teams who demand speed, simplicity, and rock-solid privacy.
              </p>

              {/* CTA Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-3.5 sm:gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-13 cursor-pointer rounded-xl border-2 border-slate-900 bg-transparent px-7 text-sm sm:text-base font-bold text-slate-900 shadow-xs transition-all hover:bg-slate-900/5 active:scale-95 dark:border-white dark:text-white dark:hover:bg-white/10"
                  onClick={() => navigate("/billing")}
                  onMouseEnter={warmNav("/billing")}
                >
                  Plans & pricing
                </Button>

                <Button
                  size="lg"
                  className="group relative h-13 cursor-pointer overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-7 sm:px-8 text-sm sm:text-base font-bold text-white shadow-xl shadow-blue-600/30 transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-600/40 hover:scale-[1.02] active:scale-[0.98]"
                  onClick={() => navigate(primaryPath)}
                  onMouseEnter={warmNav(primaryPath)}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <span>Start your free trial</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Button>
              </div>




            </motion.div>

            {/* RIGHT COLUMN: Visual Composition matching Nitro (Blue Theme) */}
            <motion.div
              className="relative lg:col-span-6 xl:col-span-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.75, delay: 0.15, ease }}
            >
              <div className="relative mx-auto flex w-full max-w-[560px] items-center justify-center">

                {/* 1. Organic Swooping Wave Background (Theme Royal Blue & Indigo) */}
                <div
                  aria-hidden
                  className="absolute -right-4 -bottom-6 top-6 h-[88%] w-[96%] rounded-[45%_55%_48%_52%/40%_45%_55%_60%] bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 shadow-[0_30px_90px_-20px_rgba(37,99,235,0.45)] sm:-right-8"
                />

                {/* Secondary accent wave curve for depth */}
                <div
                  aria-hidden
                  className="absolute right-8 -top-4 h-56 w-56 rounded-full bg-gradient-to-br from-sky-400/40 to-blue-500/10 blur-2xl"
                />

                {/* 2. Hero Professional Image */}
                <div className="relative z-10 w-full  pt-4">
                  <img
                    src="/images/hero-character.jpg"
                    alt="vigodesk.com - Modern Document Productivity"
                    className="relative z-10 mx-auto w-full max-w-[480px] lg:max-w-[520px] object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.18)] select-none mix-blend-multiply dark:mix-blend-normal"
                  />
                </div>

                {/* 3. Floating UI Card: eSign Signature Badge (Top Left) */}
                <motion.div
                  className="absolute left-0 top-12 sm:-left-6 sm:top-16 z-20 flex items-center gap-3.5 rounded-2xl border border-white/90 bg-white/95 p-3 px-4 shadow-[0_20px_45px_-12px_rgba(15,23,42,0.22)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="h-2 w-14 rounded-full bg-slate-200 dark:bg-slate-700" />
                    <div className="h-1.5 w-9 rounded-full bg-slate-200 dark:bg-slate-700" />
                  </div>
                  <div className="h-7 w-px bg-slate-200 dark:bg-slate-700" />
                  <div className="flex items-center gap-1.5 font-heading text-lg font-bold italic text-blue-600 dark:text-blue-400">
                    <span>Jane</span>
                    <PenTool className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                </motion.div>



                {/* 5. Floating UI Card: Document Editor & Annotation (Bottom Right) */}
                <motion.div
                  className="absolute -bottom-4 right-0 sm:-bottom-6 sm:right-2 z-20 w-64 sm:w-76 rounded-2xl border border-white/90 bg-white/95 p-3.5 shadow-[0_25px_65px_-15px_rgba(15,23,42,0.28)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.65, delay: 0.45 }}
                >
                  <div className="relative rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-950/70">

                    {/* Bounding box selection */}
                    <div className="relative rounded-lg border-2 border-orange-500 bg-orange-500/5 p-2">
                      <span className="absolute -left-1 -top-1 h-2 w-2 rounded-xs bg-orange-500" />
                      <span className="absolute -right-1 -top-1 h-2 w-2 rounded-xs bg-orange-500" />
                      <span className="absolute -bottom-1 -left-1 h-2 w-2 rounded-xs bg-orange-500" />
                      <span className="absolute -bottom-1 -right-1 h-2 w-2 rounded-xs bg-orange-500" />

                      {/* Yellow Note Tag */}
                      <div className="absolute -left-2 -top-5 flex items-center gap-1 rounded-md bg-amber-400 px-2 py-0.5 text-[9px] font-extrabold text-slate-950 shadow-md">
                        <span>Contract terms approved</span>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        <div className="h-1.5 w-full rounded-full bg-slate-300 dark:bg-slate-600" />
                        <div className="h-1.5 w-4/5 rounded-full bg-slate-300 dark:bg-slate-600" />
                        <div className="h-1.5 w-2/3 rounded-full bg-slate-300 dark:bg-slate-600" />
                      </div>

                      {/* Cursor pointer icon */}
                      <div className="absolute -bottom-2 -right-2 text-slate-900 dark:text-white drop-shadow-md">
                        <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                          <path d="M4 0l16 12.279-6.951 1.17 4.325 8.817-3.596 1.734-4.35-8.879-5.428 5.879z" />
                        </svg>
                      </div>
                    </div>

                    <div className="mt-2.5 space-y-1">
                      <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800" />
                      <div className="h-1.5 w-3/5 rounded-full bg-slate-200 dark:bg-slate-800" />
                    </div>
                  </div>
                </motion.div>



              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── Document Capabilities / Pillars (Nitro-style 4 Cards) ────── */}
      <section className="relative w-full border-t border-slate-200/70 bg-[#F7F9FC] py-16 sm:py-20 lg:py-24 dark:border-border/60 dark:bg-background">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">

          {/* Section Header */}
          <div className="max-w-3xl mb-12 sm:mb-16">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15] dark:text-white">
              Every document capability you need, in one platform
            </h2>
            <p className="mt-4 text-base font-normal leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300">
              Vigodesk brings PDF editing, eSign, redaction, and intelligent automation together in one platform, so you spend less time managing tools and more time getting work done.
            </p>
          </div>

          {/* 4 Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Card 1: PDF Tools Suite */}
            <div className="group flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-8 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-xl dark:border-border/70 dark:bg-card">
              <div>
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-500/15 transition-transform duration-300 group-hover:scale-110 dark:bg-blue-500/15 dark:text-blue-400">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-xl font-bold text-slate-900 dark:text-white mb-3">
                  Vigodesk PDF Tools
                </h3>
                <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  Complete browser-first PDF suite to merge, split, compress, convert Office &amp; images, watermark, and protect documents.
                </p>
              </div>
              <div className="pt-8">
                <button
                  type="button"
                  onClick={() => scrollToId("tools")}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 transition-all duration-200 group-hover:gap-2.5 group-hover:text-blue-700 dark:text-blue-400 cursor-pointer"
                >
                  <span>Explore PDF Tools</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Card 2: Vigodesk Sign */}
            <div className="group flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-8 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-xl dark:border-border/70 dark:bg-card">
              <div>
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-500/15 transition-transform duration-300 group-hover:scale-110 dark:bg-indigo-500/15 dark:text-indigo-400">
                  <FileSignature className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-xl font-bold text-slate-900 dark:text-white mb-3">
                  Vigodesk Sign
                </h3>
                <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  Simple, secure eSigning for contracts and NDAs. Send documents, collect signatures, and download verified SHA-256 audit trails.
                </p>
              </div>
              <div className="pt-8">
                <Link
                  to="/esign"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 transition-all duration-200 group-hover:gap-2.5 group-hover:text-blue-700 dark:text-blue-400"
                >
                  <span>Explore Vigodesk Sign</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Card 3: AI Document Intelligence */}
            <div className="group flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-8 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-xl dark:border-border/70 dark:bg-card">
              <div>
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-fuchsia-50 text-fuchsia-600 ring-1 ring-fuchsia-500/15 transition-transform duration-300 group-hover:scale-110 dark:bg-fuchsia-500/15 dark:text-fuchsia-400">
                  <Bot className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-xl font-bold text-slate-900 dark:text-white mb-3">
                  Vigodesk AI Suite
                </h3>
                <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  Summarize dense reports, chat directly with long contracts, and explain complex clauses in simple plain language with AI.
                </p>
              </div>
              <div className="pt-8">
                <Link
                  to="/ai/summarize"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 transition-all duration-200 group-hover:gap-2.5 group-hover:text-blue-700 dark:text-blue-400"
                >
                  <span>Explore AI Tools</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Card 4: Cloud & BYOC Storage */}
            <div className="group flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-8 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-xl dark:border-border/70 dark:bg-card">
              <div>
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 ring-1 ring-sky-500/15 transition-transform duration-300 group-hover:scale-110 dark:bg-sky-500/15 dark:text-sky-400">
                  <Cloud className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-xl font-bold text-slate-900 dark:text-white mb-3">
                  Cloud &amp; BYOC Storage
                </h3>
                <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  Connect Google Drive, Dropbox, and OneDrive, or point Vigodesk to your private AWS S3 and Azure Blob buckets for complete data control.
                </p>
              </div>
              <div className="pt-8">
                <Link
                  to="/enterprise"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 transition-all duration-200 group-hover:gap-2.5 group-hover:text-blue-700 dark:text-blue-400"
                >
                  <span>Explore Cloud &amp; BYOC</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

          </div>

        </div>
      </section>





      {/* ── Workflow Productivity Benchmark (Data & Time Lost Section) ── */}
      <section className="relative w-full overflow-hidden bg-slate-950 py-20 sm:py-28 text-white">
        {/* Ambient atmospheric gradients */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 80% 30%, rgba(37,99,235,0.25), transparent 60%), radial-gradient(ellipse 50% 60% at 20% 80%, rgba(79,70,229,0.2), transparent 50%)",
          }}
        />

        <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">

            {/* LEFT COLUMN: Vigodesk Problem & Solution Framing */}
            <div className="lg:col-span-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-400 mb-5">
                Workflow Productivity Audit
              </span>
              <h2 className="font-heading text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-[2.65rem] lg:leading-[1.15]">
                How much time is your team spending on repetitive PDF tasks?
              </h2>
              <p className="mt-5 text-base sm:text-lg leading-relaxed text-slate-300 font-normal">
                Manual document handoffs, switching between single-purpose converters, and chasing signatures slow down high-performing teams. Vigodesk gives you 25+ browser-first tools to edit, convert, redact, and eSign in seconds.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Button
                  size="lg"
                  className="h-12 cursor-pointer rounded-xl bg-blue-600 px-7 text-sm sm:text-base font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-500 active:scale-95"
                  onClick={() => scrollToId("tools")}
                >
                  Explore All 25+ Tools
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 cursor-pointer rounded-xl border border-white/20 bg-white/5 px-6 text-sm sm:text-base font-medium text-white transition-all hover:bg-white/10 active:scale-95"
                  onClick={() => scrollToId("esign")}
                >
                  See eSign Demo
                </Button>
              </div>
            </div>

            {/* CENTER COLUMN: Vertical Stacked Percentage Bar */}
            <div className="lg:col-span-3 flex items-center justify-center">
              <div className="flex items-stretch gap-4 sm:gap-6 w-full max-w-xs">

                {/* The Stacked Bar Pillar */}
                <div className="relative flex flex-col w-12 sm:w-14 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 shrink-0 h-[360px] sm:h-[400px]">
                  {/* Segment 1: 9% */}
                  <div className="h-[9%] w-full bg-slate-700 transition-colors hover:brightness-125" title="9% - Under 2 hours weekly" />
                  {/* Segment 2: 25% */}
                  <div className="h-[25%] w-full bg-slate-600 transition-colors hover:brightness-125" title="25% - 3 to 5 hours weekly" />
                  {/* Segment 3: 31% - Highlighted Primary */}
                  <div className="h-[31%] w-full bg-gradient-to-b from-blue-500 to-indigo-600 relative transition-colors hover:brightness-125" title="31% - 6 to 10 hours weekly (Most Common Bottleneck)">
                    <span className="absolute inset-0 bg-white/15 animate-pulse pointer-events-none" />
                  </div>
                  {/* Segment 4: 17% */}
                  <div className="h-[17%] w-full bg-blue-700 transition-colors hover:brightness-125" title="17% - 11 to 15 hours weekly" />
                  {/* Segment 5: 14% */}
                  <div className="h-[18%] w-full bg-indigo-900 transition-colors hover:brightness-125" title="14% - 16+ hours weekly" />
                </div>

                {/* Tick Indicators & Labels */}
                <div className="flex flex-col justify-between py-1 text-xs select-none">
                  {/* Tick 1 */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-4 h-px bg-slate-500" />
                    <div>
                      <p className="font-extrabold text-white text-sm">9%</p>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Under 2 hrs / wk</p>
                    </div>
                  </div>
                  {/* Tick 2 */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-4 h-px bg-slate-500" />
                    <div>
                      <p className="font-extrabold text-white text-sm">25%</p>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">3–5 hrs / wk</p>
                    </div>
                  </div>
                  {/* Tick 3 - Highlighted */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-0.5 bg-blue-500" />
                    <div className="rounded-lg bg-blue-500/20 px-2.5 py-1 border border-blue-500/40">
                      <p className="font-extrabold text-blue-400 text-base leading-none">31%</p>
                      <p className="text-[10px] uppercase tracking-wider text-blue-200 font-bold mt-0.5">6–10 hrs (Average)</p>
                    </div>
                  </div>
                  {/* Tick 4 */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-4 h-px bg-slate-500" />
                    <div>
                      <p className="font-extrabold text-white text-sm">17%</p>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">11–15 hrs / wk</p>
                    </div>
                  </div>
                  {/* Tick 5 */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-4 h-px bg-slate-500" />
                    <div>
                      <p className="font-extrabold text-white text-sm">14%</p>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">16+ hrs / wk</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* RIGHT COLUMN: The Vigodesk Value Card */}
            <div className="lg:col-span-4">
              <div className="relative rounded-3xl border border-blue-500/30 bg-gradient-to-br from-blue-950/80 via-slate-900/90 to-slate-950 p-7 sm:p-9 shadow-2xl backdrop-blur-xl">

                {/* Stat Highlight */}
                <div className="mb-4">
                  <span className="font-serif text-4xl sm:text-5xl font-black text-white tracking-tight">
                    5+ hours
                  </span>
                  <span className="block font-serif text-2xl sm:text-3xl text-blue-400 font-normal mt-1">
                    saved per user / week
                  </span>
                </div>

                <p className="text-sm sm:text-base leading-relaxed text-slate-300 font-normal">
                  Teams using Vigodesk eliminate app-switching and cumbersome desktop installs. Convert, compress, extract text with OCR, and sign agreements directly in your browser.
                </p>

                {/* Vigodesk Core Advantages */}
                <div className="mt-6 space-y-2.5 border-t border-white/10 pt-5 text-xs text-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 font-bold text-[11px]">✓</span>
                    <span><strong>Instant Processing:</strong> Zero queue client-side speed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 font-bold text-[11px]">✓</span>
                    <span><strong>Legally Binding eSign:</strong> Complete audits &amp; signature logs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 font-bold text-[11px]">✓</span>
                    <span><strong>Zero Data Retention:</strong> Strict privacy &amp; auto-deletion</span>
                  </div>
                </div>

                {/* Footnote */}
                <div className="mt-6 border-t border-white/10 pt-4 text-[11px] text-slate-400">
                  <p className="font-semibold text-slate-300">Measured across active Vigodesk productivity workflows</p>
                  <p className="text-slate-400 mt-0.5">Vigodesk Efficiency Benchmark, 2026</p>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── eSign highlight ───────────────────────────────────────────────── */}
      <section
        id="esign"
        className="relative w-full overflow-hidden border-t border-slate-200/70 bg-[#F7F9FC] py-20 sm:py-28"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 85% 40%, rgba(37,99,235,0.12), transparent 55%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, ease }}
            >
              <p className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                <FileSignature className="h-3.5 w-3.5" />
                eSign
              </p>
              <h2 className="font-heading mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Send, sign, and verify with a full audit trail
              </h2>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-500 sm:text-lg">
                Collect legally binding signatures without leaving PDFToolkit. Recipients sign in
                order, every open and signature is logged, and the finished PDF is sealed with a
                SHA-256 hash you can verify later.
              </p>
              <ul className="mt-7 space-y-3.5">
                {[
                  "Multi-recipient signing order with reminders",
                  "Cryptographic SHA-256 seal on every completed PDF",
                  "Private encrypted storage for in-flight documents",
                  "Reusable templates, self-sign, and completion emails",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-sm font-medium text-slate-700"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm shadow-blue-600/25">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-9 flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="h-12 cursor-pointer rounded-xl bg-blue-600 px-7 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700"
                  onClick={() => navigate("/esign")}
                  onMouseEnter={warmNav("/esign")}
                  onFocus={warmNav("/esign")}
                >
                  Explore eSign
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 cursor-pointer rounded-xl border-slate-200 bg-white px-7 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  onClick={() => navigate(user ? "/sign" : "/esign")}
                  onMouseEnter={warmNav(user ? "/sign" : "/esign")}
                  onFocus={warmNav(user ? "/sign" : "/esign")}
                >
                  {user ? "Open eSign" : "See how it works"}
                </Button>
              </div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.08, ease }}
            >
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-blue-600/10 to-sky-400/10 blur-2xl" />
              <EsignStatusMock className="relative" />
            </motion.div>
          </div>

          <motion.div
            className="mt-14 grid gap-4 sm:grid-cols-3"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease }}
          >
            {[
              {
                icon: Users,
                title: "1. Invite signers",
                body: "Add recipients, set signing order, and send from the same workspace.",
              },
              {
                icon: FileSignature,
                title: "2. Collect signatures",
                body: "Each person signs in turn. Opens, declines, and completions are recorded.",
              },
              {
                icon: ShieldCheck,
                title: "3. Seal & archive",
                body: "Finished PDFs get a SHA-256 seal plus an audit trail you can download.",
              },
            ].map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                    <Icon className="h-4 w-4" />
                  </span>
                  <h3 className="mt-4 text-sm font-semibold text-slate-900">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{step.body}</p>
                </div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── BYOC deep dive ─────────────────────────────────────────────────── */}
      <section
        id="byoc"
        ref={byocSectionRef}
        className="relative w-full overflow-hidden border-t border-slate-200/70 bg-slate-950 py-20 text-white sm:py-28"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 12% 20%, rgba(14,165,233,0.28), transparent 55%), radial-gradient(ellipse 50% 40% at 88% 70%, rgba(37,99,235,0.22), transparent 50%), linear-gradient(180deg, #0B1220 0%, #0F172A 100%)",
          }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-1/3 top-0 h-px w-1/3 bg-gradient-to-r from-transparent via-sky-400/50 to-transparent"
          initial={{ opacity: 0, scaleX: 0.4 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={BYOC_VIEWPORT}
          transition={{ duration: 0.8, ease: BYOC_EASE }}
        />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={BYOC_VIEWPORT}
              transition={{ duration: 0.55, ease: BYOC_EASE }}
            >
              <p className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/15 px-3 py-1 text-xs font-semibold text-sky-300 ring-1 ring-sky-400/30">
                <Cloud className="h-3.5 w-3.5" />
                Enterprise · Your cloud
              </p>
              <h2 className="font-heading mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Keep files in your cloud — AWS, Azure, R2, GCS, or MinIO
              </h2>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-300 sm:text-lg">
                Connect your own cloud storage on Enterprise. Uploads, eSign PDFs, and tool outputs
                write to your bucket over a presigned PUT. We keep auth, jobs, and signing metadata —
                never the file bytes in our object store.
              </p>
              <AnimatedChecks
                className="mt-7"
                variant="dark"
                items={[
                  "Browser uploads go straight to your bucket",
                  "CORS self-check before you can Save",
                  "Provider switches never orphan old files",
                  "Keys encrypted at rest — operators never see them",
                ]}
              />
              <div className="mt-9 flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="h-12 cursor-pointer rounded-xl bg-sky-500 px-7 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/25 hover:bg-sky-400"
                  onClick={() => navigate(byocPath)}
                >
                  {byocCta}
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 cursor-pointer rounded-xl border-slate-600 bg-transparent px-7 text-sm font-semibold text-slate-100 hover:bg-white/5 hover:text-white"
                  onClick={() => navigate("/billing")}
                  onMouseEnter={warmNav("/billing")}
                  onFocus={warmNav("/billing")}
                >
                  View plans
                </Button>
              </div>
            </motion.div>

            <motion.div className="relative" style={{ y: diagramY }}>
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-sky-500/20 to-blue-600/10 blur-2xl" />
              <ByocFlowDiagram variant="dark" className="relative" />
              <ProviderChips variant="dark" className="relative mt-4" />
            </motion.div>
          </div>

          <motion.div
            className="mt-14 grid gap-4 sm:grid-cols-3"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={BYOC_VIEWPORT}
            transition={{ duration: 0.5, ease: BYOC_EASE }}
          >
            {[
              {
                icon: KeyRound,
                title: "1. Connect your bucket",
                body: "Enter AWS, Azure, R2, GCS, or MinIO credentials under Cloud storage. Keys stay encrypted.",
              },
              {
                icon: ShieldCheck,
                title: "2. Pass CORS & health",
                body: "We verify reachability, write access, and browser CORS for your app origin before Save unlocks.",
              },
              {
                icon: Cloud,
                title: "3. Go live",
                body: "New uploads and signed PDFs land under org-{id}/… in your bucket. Switch providers without orphans.",
              },
            ].map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/25">
                    <Icon className="h-4 w-4" />
                  </span>
                  <h3 className="mt-4 text-sm font-semibold text-white">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{step.body}</p>
                </div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── Letter Studio deep dive ─────────────────────────────────────────── */}
      <section
        id="letters"
        className="relative w-full scroll-mt-20 overflow-hidden border-t border-slate-200/70 bg-[#F7F9FC] py-20 sm:py-28"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 55% 45% at 12% 30%, rgba(99,102,241,0.1), transparent 55%), radial-gradient(ellipse 45% 40% at 90% 70%, rgba(37,99,235,0.08), transparent 50%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={BYOC_VIEWPORT}
              transition={{ duration: 0.55, ease: BYOC_EASE }}
            >
              <p className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-500/20">
                <FileText className="h-3.5 w-3.5" />
                Letter Studio · HR & Finance
              </p>
              <h2 className="font-heading mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Branded employee letters from Excel — generate, protect, send
              </h2>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-500 sm:text-lg">
                Design once with field tokens, map messy spreadsheets, validate every row, then
                queue password-protected PDFs. Send drafts from your own Outlook or Gmail —
                AI suggests, humans approve.
              </p>
              <ul className="mt-7 space-y-2.5">
                {[
                  "TipTap letter editor with {{Employee_Name}} tokens",
                  "Excel import, mapping & Ready / Warning / Blocked",
                  "Bulk PDFs + your mailbox (never a shared sender)",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm font-medium text-slate-600">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">
                      <Check className="h-3 w-3" strokeWidth={2.75} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-9 flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="h-12 cursor-pointer rounded-xl bg-indigo-600 px-7 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-700"
                  onClick={() => navigate("/letters")}
                  onMouseEnter={warmNav("/letters")}
                  onFocus={warmNav("/letters")}
                >
                  Explore Letter Studio
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 cursor-pointer rounded-xl border-slate-200 bg-white px-7 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  onClick={() => navigate(user ? "/letters/studio" : "/login")}
                  onMouseEnter={warmNav(user ? "/letters/studio" : "/login")}
                  onFocus={warmNav(user ? "/letters/studio" : "/login")}
                >
                  {user ? "Open studio" : "Start free"}
                </Button>
              </div>
            </motion.div>

            <motion.div
              className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xl shadow-slate-900/10"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={BYOC_VIEWPORT}
              transition={{ duration: 0.55, delay: 0.08, ease: BYOC_EASE }}
            >
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm font-semibold text-slate-900">Increment batch · Q1</span>
                </div>
                <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-bold text-violet-700">
                  AI mapped
                </span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  { label: "Ready", n: "168", className: "bg-emerald-50 text-emerald-800" },
                  { label: "Warning", n: "11", className: "bg-amber-50 text-amber-800" },
                  { label: "Blocked", n: "3", className: "bg-rose-50 text-rose-800" },
                ].map((s) => (
                  <div key={s.label} className={`rounded-xl px-3 py-3 text-center ${s.className}`}>
                    <div className="text-xl font-bold">{s.n}</div>
                    <div className="text-[10px] font-semibold uppercase tracking-wide opacity-80">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2 text-xs text-slate-600">
                <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <span>CTC_New</span>
                  <ArrowRight className="h-3 w-3 text-slate-300" />
                  <span className="font-semibold text-indigo-700">New_CTC</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <span>Emp Name</span>
                  <ArrowRight className="h-3 w-3 text-slate-300" />
                  <span className="font-semibold text-indigo-700">Employee_Name</span>
                </div>
              </div>
              <p className="mt-4 text-[11px] leading-relaxed text-slate-500">
                Human approval before generate. Send via your connected Outlook or Gmail only.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Desktop PDF Toolkit ─────────────────────────────────────────────── */}
      <section
        id="desktop"
        ref={desktopSectionRef}
        className="relative w-full scroll-mt-20 overflow-hidden border-t border-slate-200/70 bg-white py-20 sm:py-28"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 85% 20%, rgba(37,99,235,0.08), transparent 55%), radial-gradient(ellipse 40% 35% at 10% 80%, rgba(14,165,233,0.06), transparent 50%)",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={DESKTOP_VIEWPORT}
              transition={{ duration: 0.55, ease: DESKTOP_EASE }}
            >
              <p className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-200">
                <Monitor className="h-3.5 w-3.5" />
                Desktop · Windows
              </p>
              <h2 className="font-heading mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Desktop apps — PDF &amp; Diagrams
              </h2>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-500 sm:text-lg">
                Run PDF Toolkit and Diagram Studio on Windows — fast, private, and offline-ready
                after activation. Files stay on your PC.
              </p>
              <ul className="mt-7 space-y-2.5">
                {[
                  { icon: ShieldCheck, text: "Private local processing — no random cloud uploads" },
                  { icon: WifiOff, text: "Works offline once licensed" },
                  { icon: KeyRound, text: "Activate with a license key; team seats available" },
                  { icon: GitBranch, text: "Diagram Studio desktop for offline draw.io-style work" },
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
                  size="lg"
                  className="h-12 cursor-pointer rounded-xl bg-blue-600 px-7 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700"
                  onClick={() => navigate("/desktop")}
                  onMouseEnter={warmNav("/desktop")}
                  onFocus={warmNav("/desktop")}
                >
                  Explore desktop
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-12 cursor-pointer rounded-xl border-slate-200 bg-white px-7 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <a href={DOWNLOAD_MAILTO}>Download for Windows</a>
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  className="h-12 cursor-pointer rounded-xl px-5 text-sm font-semibold text-slate-600"
                  onClick={() => navigate("/diagrams")}
                  onMouseEnter={warmNav("/diagrams")}
                  onFocus={warmNav("/diagrams")}
                >
                  Diagram Studio online
                </Button>
              </div>
            </motion.div>

            <motion.div className="relative" style={{ y: desktopMockY }}>
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-blue-500/15 to-sky-400/10 blur-2xl" />
              <DesktopAppMock variant="light" className="relative" />
            </motion.div>
          </div>
        </div>
      </section>



      {/* ── FAQs about Vigodesk (Minimal Clean Line-Divided Accordion) ── */}
      <FaqSection
        badge="General & Product"
        title="FAQs about Vigodesk"
        subtitle="Quick answers about Vigodesk PDF tools, eSign legal compliance, generative AI, and enterprise data privacy."
        faqs={FAQS}
      />

      {/* ── Next Steps / Choose Your Path (3 Cards CTA Section) ─────────── */}
      <section className="relative w-full border-t border-slate-200/80 bg-gradient-to-b from-white via-slate-50/50 to-blue-50/30 py-20 sm:py-28 dark:border-border/70 dark:bg-background">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">

          {/* Section Header */}
          <div className="mx-auto max-w-2xl text-center mb-12 sm:mb-16">
            <h2 className=" text-3xl sm:text-4xl lg:text-[2.85rem] font-bold tracking-tight text-slate-900 dark:text-white">
              See what Vigodesk can do for you
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal">
              Take the next step toward friction-free, secure document workflows today.
            </p>
          </div>

          {/* 3 Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">

            {/* Card 1: Contact Sales */}
            <div className="group flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-8 sm:p-9 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-xl dark:border-border/70 dark:bg-card">
              <div>
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-500/15 transition-transform duration-300 group-hover:scale-110 dark:bg-blue-500/15 dark:text-blue-400">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-slate-900 dark:text-white mb-3">
                  Contact sales
                </h3>
                <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">
                  Talk to our document specialists about enterprise volume, custom API integrations, and private BYOC cloud storage tailored to your team.
                </p>
              </div>
              <div className="pt-8">
                <Link
                  to="/enterprise"
                  className="inline-flex items-center gap-1.5 text-base font-bold text-blue-600 transition-all duration-200 group-hover:gap-2.5 group-hover:text-blue-700 dark:text-blue-400"
                >
                  <span>Get in touch</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Card 2: Free Trial */}
            <div className="group flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-8 sm:p-9 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-xl dark:border-border/70 dark:bg-card">
              <div>
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-500/15 transition-transform duration-300 group-hover:scale-110 dark:bg-indigo-500/15 dark:text-indigo-400">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-slate-900 dark:text-white mb-3">
                  Free trial
                </h3>
                <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">
                  Try Vigodesk's full PDF and eSign capabilities to convert, compress, redact, and sign contracts effortlessly — free for 14 days!
                </p>
              </div>
              <div className="pt-8">
                <Link
                  to="/billing"
                  className="inline-flex items-center gap-1.5 text-base font-bold text-blue-600 transition-all duration-200 group-hover:gap-2.5 group-hover:text-blue-700 dark:text-blue-400"
                >
                  <span>Start your free trial</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Card 3: Become a Partner */}
            <div className="group flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-8 sm:p-9 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-xl dark:border-border/70 dark:bg-card">
              <div>
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 ring-1 ring-sky-500/15 transition-transform duration-300 group-hover:scale-110 dark:bg-sky-500/15 dark:text-sky-400">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-slate-900 dark:text-white mb-3">
                  Become a partner
                </h3>
                <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">
                  Explore OEM, reseller, and solution partner opportunities to embed Vigodesk's high-speed document tools directly into your platforms.
                </p>
              </div>
              <div className="pt-8">
                <Link
                  to="/enterprise"
                  className="inline-flex items-center gap-1.5 text-base font-bold text-blue-600 transition-all duration-200 group-hover:gap-2.5 group-hover:text-blue-700 dark:text-blue-400"
                >
                  <span>Partner with Vigodesk today</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── High-Impact Conversion CTA Section ───────────────────────────── */}
      <section className="relative w-full overflow-hidden bg-slate-950 py-20 sm:py-24 text-white">
        {/* Glow & Atmospheric ambient backdrop */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(37,99,235,0.32), transparent 70%), radial-gradient(ellipse 40% 40% at 20% 20%, rgba(79,70,229,0.22), transparent 60%)",
          }}
        />

        <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
          <div className="relative mx-auto max-w-4xl text-center">



            <h2 className="font-heading text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl lg:leading-[1.15]">
              Ready to simplify your document workflows?
            </h2>

            <p className="mt-5 text-base sm:text-lg leading-relaxed text-slate-300 max-w-2xl mx-auto font-normal">
              Experience the fastest way to edit, convert, eSign, and protect contracts and PDFs. Join modern teams working smarter with Vigodesk.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <Button
                size="lg"
                className="h-13 cursor-pointer rounded-xl bg-blue-600 px-8 text-base font-bold text-white shadow-xl shadow-blue-600/35 transition-all hover:bg-blue-500 hover:scale-[1.02] active:scale-95"
                onClick={() => scrollToId("tools")}
              >
                Start Using Tools Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-13 cursor-pointer rounded-xl border-2 border-white/20 bg-white/5 px-8 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white hover:text-slate-950 active:scale-95"
                onClick={() => navigate("/enterprise")}
              >
                Talk to Sales
              </Button>
            </div>



          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
