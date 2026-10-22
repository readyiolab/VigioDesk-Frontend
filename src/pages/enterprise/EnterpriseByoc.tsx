import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Cloud,
  HeartPulse,
  Landmark,
  Scale,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ByocFlowDiagram } from "@/components/byoc/ByocFlowDiagram";
import { ProviderChips } from "@/components/byoc/ProviderChips";
import { AnimatedChecks } from "@/components/byoc/AnimatedChecks";
import {
  BYOC_EASE,
  BYOC_FADE_UP,
  BYOC_STAGGER,
  BYOC_VIEWPORT,
  PROVIDER_CHIPS,
  type ProviderLogoId,
} from "@/components/byoc/motion";
import { ProviderLogo } from "@/components/byoc/ProviderLogo";
import { cn } from "@/lib/utils";
import { FaqSection } from "@/components/common/FaqSection";

const ENTERPRISE_FAQS = [
  {
    q: "Which cloud storage providers does Vigodesk Enterprise support?",
    a: "Vigodesk currently supports native Bring Your Own Cloud (BYOC) integration with Amazon Web Services (AWS S3), Microsoft Azure Blob Storage, Cloudflare R2, Google Cloud Storage (GCS), and self-hosted S3-compatible systems like MinIO.",
  },
  {
    q: "How does Bring Your Own Cloud (BYOC) ensure document privacy?",
    a: "Under BYOC, your browser uploads and downloads PDF files directly to and from your own private cloud bucket using short-lived signed URLs. Vigodesk servers orchestrate the workflow metadata and cryptographic verification, but never store or inspect your raw document bytes.",
  },
  {
    q: "How is CORS verified between the browser and our private bucket?",
    a: "During bucket setup under Settings → Cloud storage, our automated probe checks reachability, write permissions, and browser Cross-Origin Resource Sharing (CORS). Configuration cannot be saved until CORS is proven working, ensuring zero broken uploads.",
  },
  {
    q: "Can we enforce our own data retention, encryption keys, and residency policies?",
    a: "Yes, completely. Because files reside in your cloud bucket, your organization retains full control over KMS/SSE encryption keys, lifecycle auto-deletion rules, legal holds, and geographical region compliance (e.g. EU data residency).",
  },
  {
    q: "Can we switch cloud storage providers in the future?",
    a: "Yes. You can switch or rebind storage providers at any time. Existing completed jobs and past eSign certificates remain accessible under immutable reference links.",
  },
  {
    q: "Does Vigodesk provide custom SLAs and enterprise support?",
    a: "Yes. Enterprise accounts include a 99.95% uptime service level agreement (SLA), priority ticket routing with sub-hour emergency response times, and a dedicated technical account manager.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Connect your bucket",
    body: "Enter AWS, Azure, R2, GCS, or MinIO credentials under Settings → Cloud storage. Keys are encrypted at rest — operators never see them.",
  },
  {
    n: "02",
    title: "Test + CORS check",
    body: "We probe reachability, write access, and browser CORS for your app origin. Save stays blocked until CORS is correct — first upload just works.",
  },
  {
    n: "03",
    title: "Save and go live",
    body: "A new immutable storage binding is created. New uploads, eSign PDFs, and job outputs land in your bucket under org-{id}/…",
  },
];

const USE_CASES = [
  {
    icon: Scale,
    title: "Legal & counsel",
    body: "Keep signed agreements in a firm-controlled bucket with your retention and eDiscovery policies.",
  },
  {
    icon: HeartPulse,
    title: "Healthcare",
    body: "Store clinical PDFs in a region and account you designate — metadata stays with us for workflow only.",
  },
  {
    icon: Landmark,
    title: "Financial services",
    body: "Least-privilege IAM on a dedicated bucket; rotate credentials by saving a new binding without orphaning history.",
  },
  {
    icon: Building2,
    title: "Public sector",
    body: "Meet data-residency rules by pointing storage at a bucket in your approved cloud region.",
  },
];

const PROVIDER_MATRIX: Array<{
  id: ProviderLogoId;
  name: string;
  endpoint: string;
  creds: string;
}> = [
  {
    id: "AWS",
    name: "Amazon S3",
    endpoint: "Empty (regional) or custom VPC endpoint",
    creds: "Access key ID + secret access key",
  },
  {
    id: "Azure",
    name: "Azure Blob",
    endpoint: "Built from account name (or BlobEndpoint in connection string)",
    creds: "Account key or full connection string",
  },
  {
    id: "R2",
    name: "Cloudflare R2",
    endpoint: "https://<accountid>.r2.cloudflarestorage.com",
    creds: "R2 API token (S3-compatible)",
  },
  {
    id: "GCS",
    name: "Google Cloud Storage",
    endpoint: "https://storage.googleapis.com",
    creds: "HMAC access key + secret (S3 interop)",
  },
  {
    id: "MinIO",
    name: "MinIO",
    endpoint: "Your https:// host (path-style)",
    creds: "Access key + secret",
  },
];

export default function EnterpriseByoc() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start end", "end start"],
  });
  const diagramY = useTransform(scrollYProgress, [0, 1], [14, -14]);

  const isEnterprise = user?.plan === "ENTERPRISE";
  const primaryPath = isEnterprise ? "/settings/cloud" : "/billing";
  const primaryLabel = isEnterprise ? "Connect your bucket" : "See Enterprise plans";
  const secondaryPath = isEnterprise ? "/workspace" : "/sign";
  const secondaryLabel = isEnterprise ? "Back to workspace" : "Try eSign first";

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
          className="pointer-events-none absolute -left-20 top-20 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-12 h-96 w-96 rounded-full bg-blue-500/15 blur-3xl"
        />

        <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12 xl:gap-16">
            
            {/* LEFT COLUMN: Clean, Left-Aligned High-Impact Copy */}
            <motion.div
              className="relative z-10 lg:col-span-6 xl:col-span-6"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: BYOC_EASE }}
            >
              {/* Pill Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/25 bg-sky-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-sky-700 shadow-xs mb-5 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-400">
                <Cloud className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                <span>vigodesk.com · Cloud Storage &amp; BYOK</span>
                <span className="rounded-full bg-sky-600 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-normal">
                  Enterprise
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="font-heading text-balance text-4xl font-black tracking-tight text-slate-900 sm:text-5xl sm:leading-[1.1] lg:text-[3.25rem] xl:text-[3.65rem] dark:text-white">
                Your PDFs Stay in Your Cloud. <span className="bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 bg-clip-text text-transparent">Zero Raw File Retention.</span>
              </h1>

              {/* Subheading */}
              <p className="mt-5 max-w-xl text-pretty text-base font-normal leading-relaxed text-slate-600 sm:text-lg sm:leading-relaxed dark:text-slate-300">
                Connect AWS S3, Azure Blob, Cloudflare R2, Google Cloud Storage, or MinIO. Browser uploads stream directly to your private bucket via presigned signed URLs. Auth, jobs, and audit seals stay verified without ever caching your files.
              </p>

              {/* Dual Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-3.5 sm:gap-4">
                <Button
                  size="lg"
                  className="group relative h-13 cursor-pointer overflow-hidden rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 px-7 sm:px-8 text-sm sm:text-base font-bold text-white shadow-xl shadow-blue-600/30 transition-all duration-300 hover:from-sky-600 hover:to-indigo-700 hover:shadow-blue-600/40 hover:scale-[1.02] active:scale-[0.98]"
                  onClick={() => navigate(primaryPath)}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <span>{primaryLabel}</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="h-13 cursor-pointer rounded-xl border-2 border-slate-900 bg-transparent px-7 text-sm sm:text-base font-bold text-slate-900 shadow-xs transition-all hover:bg-slate-900/5 active:scale-95 dark:border-white dark:text-white dark:hover:bg-white/10"
                  onClick={() =>
                    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  See how it works
                </Button>
              </div>

              {/* Checkmark Highlights */}
              <ul className="mt-9 space-y-3">
                {[
                  "Presigned PUT — files never transit or touch our disks",
                  "Strict CORS pre-flight validation before activation",
                  "Customer-managed keys (AWS KMS / SSE / Azure Customer Key)",
                ].map((item, i) => (
                  <motion.li
                    key={item}
                    className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-200"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.28 + i * 0.07, duration: 0.4, ease: BYOC_EASE }}
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-600 text-white shadow-xs shadow-sky-600/25">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </span>
                    {item}
                  </motion.li>
                ))}
              </ul>

              {/* Supported Providers Rail */}
              <div className="mt-8 pt-6 border-t border-slate-200/80">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Supported Cloud Providers
                </p>
                <ProviderChips variant="light" />
              </div>
            </motion.div>

            {/* RIGHT COLUMN: Elevated Visual Composition with Swooping Wave & Live Architecture Flow */}
            <motion.div
              className="relative lg:col-span-6 xl:col-span-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.75, delay: 0.15, ease: BYOC_EASE }}
            >
              <div className="relative mx-auto flex w-full max-w-[580px] items-center justify-center">

                {/* 1. Organic Swooping Wave Background */}
                <div
                  aria-hidden
                  className="absolute -right-4 -bottom-6 top-6 h-[88%] w-[96%] rounded-[45%_55%_48%_52%/40%_45%_55%_60%] bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-700 shadow-[0_30px_90px_-20px_rgba(14,165,233,0.45)] sm:-right-8"
                />

                {/* Secondary ambient glow */}
                <div
                  aria-hidden
                  className="absolute right-8 -top-4 h-56 w-56 rounded-full bg-gradient-to-br from-sky-400/40 to-blue-500/10 blur-2xl"
                />

                {/* 2. Main Live Mockup: ByocFlowDiagram */}
                <div className="relative z-10 w-full pt-4">
                  <ByocFlowDiagram variant="light" className="shadow-[0_30px_80px_-25px_rgba(15,23,42,0.35)]" />
                </div>

                {/* 3. Floating Card 1: Direct Presigned Stream (Top Left) */}
                <motion.div
                  className="absolute left-0 top-10 sm:-left-6 sm:top-12 z-20 flex items-center gap-3 rounded-2xl border border-white/90 bg-white/95 p-3 px-4 shadow-[0_20px_45px_-12px_rgba(15,23,42,0.22)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600 ring-1 ring-sky-500/20 dark:bg-sky-500/10 dark:text-sky-400">
                    <Cloud className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Direct Presigned PUT</span>
                      <span className="rounded-full bg-sky-500/10 px-1.5 py-0.2 text-[8px] font-bold text-sky-600">
                        Zero Bytes Stored
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500">Browser → S3 / Azure direct upload</p>
                  </div>
                </motion.div>

                {/* 4. Floating Card 2: KMS / Encryption Verification (Bottom Right) */}
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
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Full Data Residency</span>
                      <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.2 text-[8px] font-bold text-emerald-600">
                        KMS / SSE
                      </span>
                    </div>
                    <p className="font-mono text-[10px] text-slate-500">Region: Customer Specified</p>
                  </div>
                </motion.div>

              </div>
            </motion.div>

          </div>
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
              Live in three steps
            </h2>
            <p className="mt-3 text-base text-slate-500 sm:text-lg">
              Same flow as Settings → Cloud storage — Test, fix CORS if needed, Save.
            </p>
          </div>

          <motion.ol
            className="mt-12 grid gap-5 md:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={BYOC_VIEWPORT}
            variants={BYOC_STAGGER}
          >
            {STEPS.map((step) => (
              <motion.li
                key={step.n}
                variants={BYOC_FADE_UP}
                className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-[#F8FAFC] p-6 shadow-sm"
              >
                <span className="font-heading text-4xl font-bold text-sky-200">{step.n}</span>
                <h3 className="mt-3 text-lg font-semibold tracking-tight text-slate-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{step.body}</p>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      </section>

      {/* Use cases */}
      <section className="w-full border-b border-slate-200/70 bg-[#F7F9FC] py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
              Built for trust
            </p>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Who this is for
            </h2>
          </div>

          <motion.div
            className="mt-12 grid gap-4 sm:grid-cols-2"
            initial="hidden"
            whileInView="visible"
            viewport={BYOC_VIEWPORT}
            variants={BYOC_STAGGER}
          >
            {USE_CASES.map((uc) => {
              const Icon = uc.icon;
              return (
                <motion.div
                  key={uc.title}
                  variants={BYOC_FADE_UP}
                  className="flex gap-4 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm transition-transform hover:-translate-y-0.5"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-[15px] font-semibold text-slate-900">{uc.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{uc.body}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Provider matrix */}
      <section className="w-full border-b border-slate-200/70 bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                Providers
              </p>
              <h2 className="font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                What you need to connect
              </h2>
              <p className="mt-3 text-base text-slate-500">
                Endpoint shape and credential type for each provider we support in production.
              </p>
            </div>
            <ProviderChips variant="light" />
          </div>

          <div className="mt-10 overflow-hidden rounded-3xl border border-slate-200/90 bg-[#F8FAFC] shadow-sm">
            <div className="hidden grid-cols-[1.1fr_1.4fr_1.3fr] gap-4 border-b border-slate-200/80 bg-white px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400 sm:grid">
              <span>Provider</span>
              <span>Endpoint</span>
              <span>Credentials</span>
            </div>
            {PROVIDER_MATRIX.map((row, i) => (
              <motion.div
                key={row.id}
                className={cn(
                  "grid gap-2 border-b border-slate-200/70 px-5 py-4 last:border-0 sm:grid-cols-[1.1fr_1.4fr_1.3fr] sm:gap-4 sm:items-center",
                  i % 2 === 1 && "bg-white/60"
                )}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={BYOC_VIEWPORT}
                transition={{ delay: i * 0.04, duration: 0.4, ease: BYOC_EASE }}
              >
                <p className="flex items-center gap-2.5 text-sm font-semibold text-slate-900">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200/80">
                    <ProviderLogo id={row.id} />
                  </span>
                  {row.name}
                </p>
                <p className="font-mono text-xs leading-relaxed text-slate-600 sm:text-[13px]">
                  <span className="mb-0.5 block text-[10px] font-sans font-semibold uppercase tracking-wide text-slate-400 sm:hidden">
                    Endpoint
                  </span>
                  {row.endpoint}
                </p>
                <p className="text-sm text-slate-600">
                  <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:hidden">
                    Credentials
                  </span>
                  {row.creds}
                </p>
              </motion.div>
            ))}
          </div>

          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500">
            {PROVIDER_CHIPS.map((p) => (
              <li key={p.id} className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                {p.tip}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="relative w-full overflow-hidden border-t border-slate-200/70">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 80% at 0% 50%, rgba(14,165,233,0.22), transparent 55%), radial-gradient(ellipse 55% 70% at 100% 40%, rgba(37,99,235,0.18), transparent 50%), linear-gradient(165deg, #0B1220 0%, #0F172A 48%, #111827 100%)",
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

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={BYOC_VIEWPORT}
            transition={{ duration: 0.55, ease: BYOC_EASE }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300/90">
              Next step
            </p>
            <h2 className="font-heading mt-3 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl sm:leading-[1.12]">
              {isEnterprise
                ? "Point PDFToolkit at your bucket — then keep working."
                : "Your files. Your cloud. Same calm workspace."}
            </h2>
            <p className="mt-4 max-w-lg text-pretty text-base leading-relaxed text-slate-300 sm:text-lg">
              {isEnterprise
                ? "Open Cloud storage, run the connection test, fix CORS if we ask, then Save. New uploads and signed PDFs write straight to you."
                : "Enterprise lets you connect AWS, Azure, R2, GCS, or MinIO so PDFs never sit in our object store — only keys and workflow metadata do."}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                className="h-12 cursor-pointer rounded-full bg-sky-400 px-7 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-400/25 hover:bg-sky-300"
                onClick={() => navigate(primaryPath)}
              >
                {primaryLabel}
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 cursor-pointer rounded-full border-slate-500/80 bg-transparent px-7 text-sm font-semibold text-slate-100 hover:bg-white/5 hover:text-white"
                onClick={() => navigate(secondaryPath)}
              >
                {secondaryLabel}
              </Button>
            </div>

            <button
              type="button"
              onClick={() => navigate("/#byoc")}
              className="mt-6 inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-slate-400 transition-colors hover:text-sky-300"
            >
              See it on the homepage
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={BYOC_VIEWPORT}
            transition={{ duration: 0.55, delay: 0.08, ease: BYOC_EASE }}
          >
            <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-sky-500/20 to-blue-600/10 blur-2xl" />
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm sm:p-7">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">Bytes stay with you</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">
                    Browser → your bucket. We keep auth, jobs, and signing status only.
                  </p>
                </div>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/30">
                  <ShieldCheck className="h-5 w-5" />
                </span>
              </div>

              <div className="mt-6 grid grid-cols-5 gap-2">
                {PROVIDER_CHIPS.map((p, i) => (
                  <motion.div
                    key={p.id}
                    title={p.label}
                    className="flex flex-col items-center gap-1.5 rounded-xl bg-white/[0.06] px-1 py-2.5 ring-1 ring-white/10"
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={BYOC_VIEWPORT}
                    transition={{ delay: 0.12 + i * 0.05, duration: 0.35, ease: BYOC_EASE }}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/95">
                      <ProviderLogo id={p.id} className="h-4 w-4" />
                    </span>
                    <span className="text-[9px] font-semibold text-slate-400">{p.id}</span>
                  </motion.div>
                ))}
              </div>

              <ul className="mt-6 space-y-2.5 border-t border-white/10 pt-5">
                {[
                  "CORS checked before you can Save",
                  "Keys encrypted — operators never see them",
                  "Switch providers without orphaning files",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Enterprise BYOC FAQs ─────────────────────────────────────────── */}
      <FaqSection
        variant="dark"
        badge="Enterprise & Cloud Storage"
        title="Frequently asked questions about BYOC"
        subtitle="Learn how Vigodesk connects securely to your private cloud bucket with strict data residency."
        faqs={ENTERPRISE_FAQS}
      />
    </div>
  );
}
