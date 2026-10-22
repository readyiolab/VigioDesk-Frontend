import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Check,
  FileCheck2,
  FileSignature,
  Hash,
  Link2,
  Lock,
  PenTool,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/AuthModal";
import {
  ESIGN_EASE,
  ESIGN_FADE_UP,
  ESIGN_STAGGER,
  ESIGN_VIEWPORT,
} from "@/components/esign/motion";
import { EsignStatusMock } from "@/components/esign/EsignStatusMock";
import { FaqSection } from "@/components/common/FaqSection";

const ESIGN_FAQS = [
  {
    q: "Are electronic signatures legally binding?",
    a: "Yes. Electronic signatures created with Vigodesk comply with the United States ESIGN Act, UETA, and the European Union eIDAS regulations. Completed documents receive an unalterable SHA-256 cryptographic seal and a comprehensive audit trail certificate admissible in court.",
  },
  {
    q: "Do recipients need to install software or register an account to sign?",
    a: "No. Signers receive a secure, private link via email. They can review, fill fields, and sign the document on any desktop or mobile browser without downloading any software or creating an account.",
  },
  {
    q: "What information is recorded in the audit trail certificate?",
    a: "Every document envelope records a full lifecycle log including recipient email addresses, IP addresses, exact timestamps for opens and signatures, field modifications, and the unique SHA-256 document fingerprint.",
  },
  {
    q: "Can I set a specific signing order for multiple recipients?",
    a: "Yes. You can configure sequential signing (e.g., Client signs first, then Manager approves) or parallel signing (all parties can review and sign simultaneously).",
  },
  {
    q: "What types of documents can I send for signature?",
    a: "You can upload standard PDF files or Microsoft Word documents (.docx). Vigodesk automatically converts Word files into secure PDF canvases ready for signature field placement.",
  },
  {
    q: "How are signed documents protected after completion?",
    a: "Once all parties sign, the document is permanently sealed with cryptographic hashes to prevent tampering. All signers receive a final PDF copy alongside the verified audit certificate.",
  },
];

const HERO_CHECKS = [
  "Multi-recipient signing with order control",
  "SHA-256 seal on every completed PDF",
  "Recipients sign via private link — no account needed",
] as const;

const WHY = [
  {
    icon: ShieldCheck,
    title: "Full audit trail",
    body: "Opens, declines, and signatures are logged with timestamps you can export.",
  },
  {
    icon: Users,
    title: "Sequential or parallel",
    body: "Send in a fixed order, or let everyone sign at once — your call.",
  },
  {
    icon: Link2,
    title: "Private signer links",
    body: "Each recipient gets a secure link. They do not need a PDFToolkit account.",
  },
  {
    icon: Hash,
    title: "Cryptographic seal",
    body: "Finished PDFs are sealed with a SHA-256 hash you can verify later.",
  },
] as const;

const STEPS = [
  {
    n: "01",
    title: "Invite signers",
    body: "Upload a PDF or Word document (.docx), place fields, add recipients, and set signing order.",
  },
  {
    n: "02",
    title: "Collect signatures",
    body: "Each person signs in turn (or in parallel). Opens and completions are recorded.",
  },
  {
    n: "03",
    title: "Seal & archive",
    body: "The finished PDF gets a SHA-256 seal plus an audit trail you can download.",
  },
] as const;

const CASES = [
  {
    icon: UserRound,
    title: "Just me",
    body: "Self-sign — add your signature and you are done.",
  },
  {
    icon: UserRound,
    title: "One other person",
    body: "We email them a private link to review and sign.",
  },
  {
    icon: Users,
    title: "Several people, in order",
    body: "Each person gets the email only after the one before them finishes.",
  },
  {
    icon: Users,
    title: "Several people, any order",
    body: "Everyone gets the link at once and can sign whenever they like.",
  },
] as const;

const TRUST = [
  {
    icon: Lock,
    title: "Encrypted in flight",
    body: "Documents stay in private encrypted storage while signing is underway.",
  },
  {
    icon: Link2,
    title: "Short-lived access",
    body: "Signer links are private and time-bound — not a public share page.",
  },
  {
    icon: FileCheck2,
    title: "Completion record",
    body: "Download the sealed PDF and certificate of completion when the flow ends.",
  },
] as const;

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function EsignLanding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [authOpen, setAuthOpen] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start end", "end start"],
  });
  const mockY = useTransform(scrollYProgress, [0, 1], [14, -14]);

  const startEsign = () => {
    if (user) {
      navigate("/sign");
      return;
    }
    setAuthOpen(true);
  };

  return (
    <div className="flex w-full flex-col overflow-x-hidden bg-[#F7F9FC] text-slate-900">
      {/* ── Hero — Home Style with Vigodesk eSign Theme ──────────────── */}
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
              transition={{ duration: 0.65, ease: ESIGN_EASE }}
            >
              {/* Pill Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-700 shadow-xs mb-5 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400">
                <FileSignature className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>vigodesk.com · eSign Studio</span>
                <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-normal">
                  Popular
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="font-heading text-balance text-4xl font-black tracking-tight text-slate-900 sm:text-5xl sm:leading-[1.1] lg:text-[3.35rem] xl:text-[3.75rem] dark:text-white">
                Legally-Binding <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">Contracts &amp; eSignatures</span> in Seconds
              </h1>

              {/* Subheading */}
              <p className="mt-5 max-w-xl text-pretty text-base font-normal leading-relaxed text-slate-600 sm:text-lg sm:leading-relaxed dark:text-slate-300">
                Collect legally enforceable digital signatures, enforce sequential signer workflows, and seal every completed agreement with an unalterable SHA-256 cryptographic audit trail. Free of per-envelope fees.
              </p>

              {/* Dual Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-3.5 sm:gap-4">
                <Button
                  size="lg"
                  className="group relative h-13 cursor-pointer overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-7 sm:px-8 text-sm sm:text-base font-bold text-white shadow-xl shadow-blue-600/30 transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-600/40 hover:scale-[1.02] active:scale-[0.98]"
                  onClick={startEsign}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <span>Start signing free</span>
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
                    transition={{ delay: 0.28 + i * 0.07, duration: 0.4, ease: ESIGN_EASE }}
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
              transition={{ duration: 0.75, delay: 0.15, ease: ESIGN_EASE }}
            >
              <div className="relative mx-auto flex w-full max-w-[560px] items-center justify-center">

                {/* 1. Organic Swooping Wave Background */}
                <div
                  aria-hidden
                  className="absolute -right-4 -bottom-6 top-6 h-[88%] w-[96%] rounded-[45%_55%_48%_52%/40%_45%_55%_60%] bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 shadow-[0_30px_90px_-20px_rgba(37,99,235,0.45)] sm:-right-8"
                />

                {/* Secondary ambient glow */}
                <div
                  aria-hidden
                  className="absolute right-8 -top-4 h-56 w-56 rounded-full bg-gradient-to-br from-sky-400/40 to-blue-500/10 blur-2xl"
                />

                {/* 2. Main Live Mockup */}
                <div className="relative z-10 w-full pt-4">
                  <EsignStatusMock className="mx-auto w-full max-w-[480px] drop-shadow-[0_20px_45px_rgba(15,23,42,0.22)]" />
                </div>

                {/* 3. Floating Card 1: Verified Signature Tag (Top Left) */}
                <motion.div
                  className="absolute left-0 top-10 sm:-left-6 sm:top-14 z-20 flex items-center gap-3.5 rounded-2xl border border-white/90 bg-white/95 p-3 px-4 shadow-[0_20px_45px_-12px_rgba(15,23,42,0.22)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95"
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

                {/* 4. Floating Card 2: Cryptographic Seal Badge (Bottom Right) */}
                <motion.div
                  className="absolute -bottom-4 right-0 sm:-bottom-6 sm:right-2 z-20 flex items-center gap-3 rounded-2xl border border-white/90 bg-white/95 p-3.5 px-4 shadow-[0_25px_65px_-15px_rgba(15,23,42,0.28)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.65, delay: 0.45 }}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">SHA-256 Tamper Sealed</span>
                      <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.2 text-[8px] font-bold text-emerald-600 dark:text-emerald-400">
                        100% Valid
                      </span>
                    </div>
                    <p className="font-mono text-[10px] text-slate-500 dark:text-slate-400">Hash: 8f4b2a9e...3d1c98</p>
                  </div>
                </motion.div>

              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Why eSign */}
      <section className="w-full border-b border-slate-200/70 bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
              Why eSign
            </p>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Signing that stays clear and verifiable
            </h2>
            <p className="mt-3 text-base text-slate-500 sm:text-lg">
              Built for agreements that need order, proof, and a calm recipient experience.
            </p>
          </div>

          <motion.div
            className="mt-12 grid gap-5 sm:grid-cols-2"
            initial="hidden"
            whileInView="visible"
            viewport={ESIGN_VIEWPORT}
            variants={ESIGN_STAGGER}
          >
            {WHY.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  variants={ESIGN_FADE_UP}
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

      {/* How it works */}
      <section
        id="how-it-works"
        className="w-full scroll-mt-20 border-b border-slate-200/70 bg-[#F7F9FC] py-20 sm:py-28"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
              How it works
            </p>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Live in three steps
            </h2>
            <p className="mt-3 text-base text-slate-500 sm:text-lg">
              Same flow as your workspace — upload, place fields, send, and seal.
            </p>
          </div>

          <motion.ol
            className="mt-12 grid gap-5 md:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={ESIGN_VIEWPORT}
            variants={ESIGN_STAGGER}
          >
            {STEPS.map((step) => (
              <motion.li
                key={step.n}
                variants={ESIGN_FADE_UP}
                className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm"
              >
                <span className="font-heading text-4xl font-bold text-blue-200">{step.n}</span>
                <h3 className="mt-3 text-lg font-semibold tracking-tight text-slate-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{step.body}</p>
              </motion.li>
            ))}
          </motion.ol>

          <div className="mt-16 max-w-2xl">
            <h3 className="font-heading text-2xl font-bold tracking-tight text-slate-900">
              Signing situations we support
            </h3>
            <p className="mt-2 text-base text-slate-500">
              Self-sign, one recipient, or a team — sequential or parallel.
            </p>
          </div>

          <motion.div
            className="mt-8 grid gap-4 sm:grid-cols-2"
            initial="hidden"
            whileInView="visible"
            viewport={ESIGN_VIEWPORT}
            variants={ESIGN_STAGGER}
          >
            {CASES.map((c) => {
              const Icon = c.icon;
              return (
                <motion.div
                  key={c.title}
                  variants={ESIGN_FADE_UP}
                  className="flex gap-4 rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{c.title}</h4>
                    <p className="mt-1 text-sm leading-relaxed text-slate-500">{c.body}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Trust */}
      <section className="w-full border-b border-slate-200/70 bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
              Trust
            </p>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Security built into the flow
            </h2>
          </div>

          <motion.div
            className="mt-12 grid gap-5 md:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={ESIGN_VIEWPORT}
            variants={ESIGN_STAGGER}
          >
            {TRUST.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  variants={ESIGN_FADE_UP}
                  className="rounded-3xl border border-slate-200/90 bg-[#F8FAFC] p-6"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-[15px] font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{item.body}</p>
                </motion.div>
              );
            })}
          </motion.div>
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

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 text-white sm:px-6 sm:py-28 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={ESIGN_VIEWPORT}
            transition={{ duration: 0.55, ease: ESIGN_EASE }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300/90">
              Get started
            </p>
            <h2 className="font-heading mt-3 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl sm:leading-[1.12]">
              Ready to send your next agreement?
            </h2>
            <p className="mt-4 max-w-lg text-pretty text-base leading-relaxed text-slate-300 sm:text-lg">
              Open eSign in your workspace, place fields, invite recipients, and seal the finished
              PDF with a verifiable hash.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                className="h-12 cursor-pointer rounded-full bg-sky-400 px-7 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-400/25 transition-transform hover:scale-[1.02] hover:bg-sky-300"
                onClick={startEsign}
              >
                Start eSign
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 cursor-pointer rounded-full border-slate-500/80 bg-transparent px-7 text-sm font-semibold text-slate-100 hover:bg-white/5 hover:text-white"
                onClick={() => navigate("/workspace")}
              >
                Open workspace
              </Button>
            </div>

            <Link
              to="/#esign"
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
            viewport={ESIGN_VIEWPORT}
            transition={{ duration: 0.55, delay: 0.08, ease: ESIGN_EASE }}
          >
            <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-sky-500/20 to-blue-600/10 blur-2xl" />
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm sm:p-7">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">What you get</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">
                    Ordered signing, audit trail, and a sealed PDF — in one workspace.
                  </p>
                </div>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/30">
                  <FileSignature className="h-5 w-5" />
                </span>
              </div>
              <ul className="mt-6 space-y-2.5 border-t border-white/10 pt-5">
                {[
                  "Self-sign or multi-recipient flows",
                  "Private links for each signer",
                  "SHA-256 seal + downloadable certificate",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── eSign FAQs ────────────────────────────────────────────────────── */}
      <FaqSection
        variant="dark"
        badge="eSign & Legal Signatures"
        title="Frequently asked questions about eSign"
        subtitle="Clear answers on electronic signature legality, security, multi-party routing, and audit records."
        faqs={ESIGN_FAQS}
      />

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        defaultTab="login"
        onSuccess={() => navigate("/sign")}
      />
    </div>
  );
}
