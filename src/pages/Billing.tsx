import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { apiService } from "../services/api";
import { Button } from "../components/ui/button";
import { Spinner } from "../components/ui/spinner";
import {
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Crown,
  FileSignature,
  FileText,
  Minus,
  Shield,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { FaqSection } from "@/components/common/FaqSection";

interface CompareRow {
  name: string;
  free: boolean | string;
  pro: boolean | string;
  enterprise: boolean | string;
}

interface CompareCategory {
  title: string;
  rows: CompareRow[];
}

const REAL_COMPARISON_CATEGORIES: CompareCategory[] = [
  {
    title: "Core PDF Tools",
    rows: [
      { name: "Merge & Combine multiple PDFs", free: true, pro: true, enterprise: true },
      { name: "Split PDF by page ranges", free: true, pro: true, enterprise: true },
      { name: "Compress PDF file size (Keep text sharp)", free: true, pro: true, enterprise: true },
      { name: "Rotate PDF pages & reorder", free: true, pro: true, enterprise: true },
      { name: "Password Protect & Encrypt PDF (AES-256)", free: true, pro: true, enterprise: true },
      { name: "Add Watermark (Text & Image stamps)", free: true, pro: true, enterprise: true },
      { name: "Client-side private processing (No external file leaks)", free: true, pro: true, enterprise: true },
    ],
  },
  {
    title: "File Conversions & OCR",
    rows: [
      { name: "Microsoft Word (.docx) to PDF", free: true, pro: true, enterprise: true },
      { name: "Microsoft Excel (.xlsx) to PDF", free: true, pro: true, enterprise: true },
      { name: "Microsoft PowerPoint (.pptx) to PDF", free: true, pro: true, enterprise: true },
      { name: "Images (JPG, PNG, WebP) to PDF", free: true, pro: true, enterprise: true },
      { name: "PDF to JPG image extraction", free: true, pro: true, enterprise: true },
      { name: "High-accuracy OCR (Searchable text from scans)", free: "Basic (10 pgs)", pro: "Unlimited", enterprise: "Unlimited" },
    ],
  },
  {
    title: "AI Document Intelligence",
    rows: [
      { name: "AI Summarize (Instant executive brief)", free: "20 credits/mo", pro: "500 credits/mo", enterprise: "Unlimited" },
      { name: "Chat with PDF (Ask questions grounded in document)", free: "20 credits/mo", pro: "500 credits/mo", enterprise: "Unlimited" },
      { name: "Explain PDF (Simplify complex clauses into plain English)", free: "20 credits/mo", pro: "500 credits/mo", enterprise: "Unlimited" },
      { name: "Zero AI model training on your private files", free: true, pro: true, enterprise: true },
    ],
  },
  {
    title: "eSign & Digital Signatures",
    rows: [
      { name: "Sign documents electronically", free: true, pro: true, enterprise: true },
      { name: "Send documents for multi-party signatures", free: "3 / month", pro: "Unlimited", enterprise: "Unlimited" },
      { name: "Legally binding SHA-256 cryptographic seal", free: true, pro: true, enterprise: true },
      { name: "Tamper-evident Audit Trail certificate", free: false, pro: true, enterprise: true },
      { name: "Automated recipient email reminders", free: false, pro: true, enterprise: true },
    ],
  },
  {
    title: "Storage & Limits",
    rows: [
      { name: "Daily operation limit", free: "5 operations / day", pro: "Unlimited", enterprise: "Unlimited" },
      { name: "Maximum file size limit", free: "10 MB", pro: "100 MB", enterprise: "500 MB+" },
      { name: "Document job history retention", free: "7 days", pro: "30 days", enterprise: "Custom retention" },
      { name: "Cloud drive sync (Google Drive, Dropbox, OneDrive)", free: false, pro: true, enterprise: true },
      { name: "Bring Your Own Cloud (AWS S3, Azure Blob, R2)", free: false, pro: false, enterprise: true },
      { name: "Offline Windows Desktop App license", free: false, pro: false, enterprise: true },
      { name: "Customer Support", free: "Community", pro: "Priority Email", enterprise: "Dedicated 24/7 & SLA" },
    ],
  },
];

const BILLING_FAQS = [
  {
    q: "Can I cancel or switch my plan at any time?",
    a: "Yes. You can upgrade, downgrade, or cancel your subscription at any time directly from your account settings. There are no long-term lock-ins or cancellation penalties, and you will retain access through the end of your billing cycle.",
  },
  {
    q: "How does the 14-day free trial work?",
    a: "When you start a Pro trial, you get full, unrestricted access to all 25+ PDF tools, AI summarization, and unlimited eSignatures for 14 days without entering a credit card. If you choose not to upgrade, your account automatically reverts to the Free tier.",
  },
  {
    q: "What happens if I exceed the daily operations limit on the Free plan?",
    a: "The Free plan includes 5 operations every 24 hours. Your limit resets automatically each day at midnight UTC. If you need urgent access to process more files without waiting, you can upgrade to Vigodesk Pro for instant, unlimited operations.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit and debit cards (Visa, Mastercard, American Express), UPI, and net banking via our secure PCI-DSS compliant checkout. Enterprise accounts also support invoice billing via bank transfer / ACH.",
  },
  {
    q: "Do you offer team volume discounts?",
    a: "Yes! Teams purchasing 5 or more seats qualify for volume pricing discounts. Contact our enterprise sales team to receive a tailored quote for your organization.",
  },
  {
    q: "How does Bring Your Own Cloud (BYOC) work for Enterprise?",
    a: "With BYOC, your documents are uploaded directly from the browser to your organization's private AWS S3, Azure Blob, or Cloudflare R2 bucket. Vigodesk only handles workflow orchestration and never retains your files on external servers.",
  },
];

export const Billing: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (planName: string) => {
    if (planName === "ENTERPRISE") {
      navigate("/enterprise");
      return;
    }

    if (planName === "FREE") {
      if (!user) {
        navigate("/register");
        return;
      }
      toast.info("You are already on the Free tier.");
      return;
    }

    if (!user) {
      toast.info("Please sign in or create an account to activate your subscription.");
      navigate("/register");
      return;
    }

    setLoadingPlan(planName);
    try {
      const data = await apiService.initiateCheckout("plan_N1234abc");

      const options = {
        key: data.razorpayKey,
        subscription_id: data.subscriptionId,
        name: "vigodesk.com",
        description: "Vigodesk Pro Subscription",
        handler: async function (_response: unknown) {
          toast.success("Payment successful! Upgrading your account...");
          await new Promise((resolve) => setTimeout(resolve, 2000));
          await refreshProfile();
          toast.success("Welcome to Vigodesk Pro!");
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: "#2563EB",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (_response: unknown) {
        toast.error("Payment failed. Please try again.");
      });
      rzp.open();
    } catch (err: any) {
      toast.error(err.message || "Failed to initiate checkout.");
    } finally {
      setLoadingPlan(null);
    }
  };

  const scrollToCompare = () => {
    document.getElementById("compare")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-[#FDFDFE] pb-24 text-slate-900 selection:bg-blue-500/20 selection:text-blue-900 dark:bg-background dark:text-foreground">
      
      {/* ── 1. HERO HEADER ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-14 pb-16 sm:pt-18 sm:pb-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-20"
          style={{
            background:
              "radial-gradient(ellipse 70% 40% at 50% 10%, rgba(37,99,235,0.12), transparent 70%)",
          }}
        />

        <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-5">
            Transparent &amp; Predictable Pricing
          </span>
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.25rem] dark:text-white">
            Find the Best Plan for You or Your Team
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal">
            Start free with essential PDF tools. Upgrade to Pro for unlimited conversions, full AI intelligence, and legally binding eSignatures.
          </p>
        </div>
      </section>

      {/* ── 2. THE 3 REAL PRICING CARDS ───────────────────────────────────── */}
      <section className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          
          {/* Card 1: Free Plan */}
          <div className="flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-8 sm:p-9 shadow-xs transition-all duration-300 hover:border-blue-500/40 hover:shadow-xl dark:border-border/70 dark:bg-card">
            <div>
              <span className="inline-block rounded-full bg-slate-100 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                Individual Starter
              </span>
              
              <h3 className="font-heading mt-4 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Vigodesk Free
              </h3>
              
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                Core browser PDF tools and light AI usage for everyday document tasks.
              </p>

              {/* Price block */}
              <div className="mt-7 border-t border-slate-100 pt-6 dark:border-border/60">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    $0
                  </span>
                  <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                    forever free
                  </span>
                </div>
                <p className="mt-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                  No credit card required
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">Instant browser access</p>
              </div>

              {/* Action button */}
              <div className="mt-7">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 w-full cursor-pointer rounded-xl border border-slate-300 bg-white text-base font-bold text-slate-800 transition-all hover:bg-slate-50 dark:border-border dark:bg-transparent dark:text-white"
                  onClick={() => handleSubscribe("FREE")}
                >
                  Get Started Free
                </Button>
              </div>

              {/* Features List */}
              <div className="mt-8 border-t border-slate-100 pt-6 dark:border-border/60">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
                  What's Included:
                </p>
                <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  {[
                    "12 Core PDF tools (Merge, Split, Compress, Rotate)",
                    "Convert Word, Excel, PowerPoint, & JPG to PDF",
                    "5 document operations per day",
                    "Max 10 MB file size limit",
                    "20 AI credits / month (Summarize, Chat, Explain)",
                    "Basic eSign (Sign and download documents)",
                    "Private client-side browser processing",
                  ].map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Card 2: Pro Plan (HIGHLIGHTED) */}
          <div className="relative flex flex-col justify-between rounded-3xl border-2 border-blue-600 bg-white p-8 sm:p-9 shadow-xl shadow-blue-600/10 transition-all duration-300 hover:shadow-2xl dark:bg-card">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-1 text-xs font-extrabold uppercase tracking-wider text-white shadow-md">
              Most Popular
            </div>

            <div>
              <div className="h-2" />
              <span className="inline-block rounded-full bg-blue-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                For Professionals &amp; Teams
              </span>
              
              <h3 className="font-heading mt-4 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Vigodesk Pro
              </h3>
              
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                Unlimited document capabilities, full AI intelligence, and legally-binding eSignatures.
              </p>

              {/* Price block */}
              <div className="mt-7 border-t border-slate-100 pt-6 dark:border-border/60">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    $12
                  </span>
                  <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                    per user/month
                  </span>
                </div>
                <p className="mt-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                  $144.00 billed annually ($16/mo billed monthly)
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">Tax calculated at checkout</p>
              </div>

              {/* Action button */}
              <div className="mt-7">
                <Button
                  size="lg"
                  className="h-12 w-full cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-base font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:brightness-110 active:scale-95"
                  onClick={() => handleSubscribe("PRO")}
                  disabled={loadingPlan === "PRO"}
                >
                  {loadingPlan === "PRO" ? <Spinner className="mr-2 h-5 w-5" /> : null}
                  Upgrade to Pro
                  {!loadingPlan && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </div>

              {/* Features List */}
              <div className="mt-8 border-t border-slate-100 pt-6 dark:border-border/60">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-2">
                  Everything in Free, plus:
                </p>
                <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  {[
                    "Unlimited PDF operations & batch file processing",
                    "Large files up to 100 MB per document",
                    "Unlimited eSignatures with SHA-256 audit trail certificates",
                    "500 AI credits / month (AI Summarize, Chat with PDF, Explain)",
                    "High-accuracy OCR text extraction for scanned documents",
                    "Cloud storage integration (Google Drive, Dropbox, OneDrive)",
                    "30-day document job history & priority queue processing",
                  ].map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Card 3: Enterprise Plan */}
          <div className="flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-8 sm:p-9 shadow-xs transition-all duration-300 hover:border-blue-500/40 hover:shadow-xl dark:border-border/70 dark:bg-card">
            <div>
              <span className="inline-block rounded-full bg-slate-100 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                Organizations &amp; Custom Volume
              </span>
              
              <h3 className="font-heading mt-4 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Vigodesk Enterprise
              </h3>
              
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                Custom seat volume, Bring Your Own Cloud (BYOC) storage, and dedicated SLA support.
              </p>

              {/* Price block */}
              <div className="mt-7 border-t border-slate-100 pt-6 dark:border-border/60">
                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Custom Pricing
                </span>
                <p className="mt-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                  Volume seat discounts starting at 5+ users
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">Flexible monthly or annual billing</p>
              </div>

              {/* Action button */}
              <div className="mt-7">
                <Button
                  size="lg"
                  className="h-12 w-full cursor-pointer rounded-xl bg-slate-900 text-base font-bold text-white shadow-md transition-all hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 active:scale-95"
                  onClick={() => navigate("/enterprise")}
                >
                  Contact Sales
                </Button>
              </div>

              {/* Features List */}
              <div className="mt-8 border-t border-slate-100 pt-6 dark:border-border/60">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-2">
                  Everything in Pro, plus:
                </p>
                <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  {[
                    "Bring Your Own Cloud (BYOC) — AWS S3, Azure Blob, Cloudflare R2",
                    "Custom document size limits (500 MB+ files)",
                    "Unlimited AI credits & high-volume OCR pipelines",
                    "Centralized team admin console & seat reassignment",
                    "Offline Windows Desktop App licenses included",
                    "Custom data retention policies & compliance guarantees",
                    "Dedicated account manager & 99.95% uptime SLA",
                  ].map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── 3. FEATURE COMPARISON TABLE (ACCURATE TO OUR SOFTWARE) ─────────── */}
      <section id="compare" className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 mt-24 sm:mt-32 scroll-mt-24">
        
        {/* Section Title */}
        <div className="mb-10 sm:mb-14 text-center">
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-[2.65rem] font-bold tracking-tight text-slate-900 dark:text-white">
            Compare Features
          </h2>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            A transparent breakdown of capabilities available in Free, Pro, and Enterprise.
          </p>
        </div>

        {/* Comparison Matrix Table */}
        <div className="overflow-x-auto rounded-3xl border border-slate-200/90 bg-white shadow-sm dark:border-border/80 dark:bg-card">
          <table className="w-full min-w-[720px] text-left text-sm">
            
            {/* Table Header */}
            <thead>
              <tr className="border-b border-slate-200/90 bg-slate-50/80 dark:border-border/80 dark:bg-card">
                <th className="w-2/5 p-5 sm:p-6 text-base font-bold text-slate-900 dark:text-white">
                  Capability
                </th>
                <th className="w-1/5 p-5 sm:p-6 text-center">
                  <p className="font-heading text-base font-bold text-slate-900 dark:text-white">
                    Free
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 h-8 w-full rounded-xl text-xs font-bold"
                    onClick={() => handleSubscribe("FREE")}
                  >
                    Get Free
                  </Button>
                </th>
                <th className="w-1/5 p-5 sm:p-6 text-center bg-blue-50/40 dark:bg-blue-950/20">
                  <p className="font-heading text-base font-bold text-blue-600 dark:text-blue-400">
                    Pro
                  </p>
                  <Button
                    size="sm"
                    className="mt-2 h-8 w-full rounded-xl bg-blue-600 text-xs font-bold text-white hover:bg-blue-500"
                    onClick={() => handleSubscribe("PRO")}
                  >
                    Upgrade
                  </Button>
                </th>
                <th className="w-1/5 p-5 sm:p-6 text-center">
                  <p className="font-heading text-base font-bold text-slate-900 dark:text-white">
                    Enterprise
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 h-8 w-full rounded-xl text-xs font-bold"
                    onClick={() => navigate("/enterprise")}
                  >
                    Contact
                  </Button>
                </th>
              </tr>
            </thead>

            {/* Categorized Rows */}
            {REAL_COMPARISON_CATEGORIES.map((cat) => (
              <tbody key={cat.title} className="divide-y divide-slate-100 dark:divide-border/60">
                {/* Category Header Row */}
                <tr className="bg-slate-100/60 dark:bg-slate-800/40">
                  <td
                    colSpan={4}
                    className="px-5 py-3.5 text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white"
                  >
                    {cat.title}
                  </td>
                </tr>

                {/* Items in Category */}
                {cat.rows.map((row) => (
                  <tr
                    key={row.name}
                    className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/20"
                  >
                    <td className="p-4 sm:px-6 font-medium text-slate-800 dark:text-slate-200">
                      {row.name}
                    </td>
                    <td className="p-4 text-center">
                      <MatrixCell value={row.free} />
                    </td>
                    <td className="p-4 text-center bg-blue-50/25 dark:bg-blue-950/10">
                      <MatrixCell value={row.pro} highlight />
                    </td>
                    <td className="p-4 text-center">
                      <MatrixCell value={row.enterprise} />
                    </td>
                  </tr>
                ))}
              </tbody>
            ))}

          </table>
        </div>

      </section>

      {/* ── 4. PRICING & BILLING FAQS ──────────────────────────────────── */}
      <FaqSection
        badge="Pricing & Billing"
        title="Frequently asked questions about plans"
        subtitle="Everything you need to know about subscriptions, trials, limits, and enterprise licensing."
        faqs={BILLING_FAQS}
      />

      {/* ── 5. FOOTNOTE LEGAL DISCLAIMER ─────────────────────────────────── */}
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 mt-16 text-center text-xs text-slate-400">
        <p>
          All prices in USD. Cloud subscriptions automatically renew unless canceled before the billing cycle.
          Stateless document files are automatically deleted after 60 minutes.
        </p>
      </div>

    </div>
  );
};

function MatrixCell({
  value,
  highlight,
}: {
  value: boolean | string;
  highlight?: boolean;
}) {
  if (value === true) {
    return (
      <div className="flex justify-center">
        <div
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-full",
            highlight
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
          )}
        >
          <Check className="h-4 w-4 stroke-[2.5]" />
        </div>
      </div>
    );
  }

  if (value === false) {
    return (
      <div className="flex justify-center text-slate-300 dark:text-slate-600">
        <Minus className="h-4 w-4 stroke-[2.5]" />
      </div>
    );
  }

  return (
    <span
      className={cn(
        "inline-block rounded-md px-2.5 py-1 text-xs font-bold",
        highlight
          ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"
          : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
      )}
    >
      {value}
    </span>
  );
}

export default Billing;
