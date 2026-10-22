import { ShieldCheck, Code, BookOpen, Lock, FileText, CheckCircle2, ArrowRight, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FaqSection, type FaqItem } from "@/components/common/FaqSection";

interface InfoPageProps {
  type:
    | "security"
    | "developer"
    | "blog"
    | "about"
    | "privacy"
    | "terms"
    | "gdpr"
    | "docs";
}

interface PageConfig {
  badge: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  sections: Array<{ heading: string; content: string }>;
  faqs: FaqItem[];
}

const PAGE_DATA: Record<InfoPageProps["type"], PageConfig> = {
  security: {
    badge: "Security & Trust",
    title: "Bank-Grade Encryption & Data Protection",
    subtitle:
      "Your documents are protected with AES-256 bit encryption at rest and TLS 1.3 in transit.",
    icon: ShieldCheck,
    sections: [
      {
        heading: "SOC2 Type II & ISO 27001 Certified Standards",
        content:
          "Our cloud architecture follows industry-leading compliance benchmarks to safeguard sensitive files against unauthorized access.",
      },
      {
        heading: "Automated File Purging",
        content:
          "Stateless document operations are automatically deleted from memory and cloud buffers within 60 minutes.",
      },
      {
        heading: "Legally Binding eSign Audit Trails",
        content:
          "Cryptographically signed audit certificates documenting IP addresses, timestamps, and identity hashes for every signature.",
      },
    ],
    faqs: [
      {
        q: "Where are documents stored during processing?",
        a: "Documents are processed in memory and encrypted temporary cloud buffers using AES-256 bit encryption. Once conversion, signing, or compression completes, all temporary buffers are purged automatically within 60 minutes.",
      },
      {
        q: "How does Vigodesk secure data in transit?",
        a: "All browser connections, API requests, and webhooks enforce TLS 1.3 encryption with strict HSTS policies. Plain HTTP requests are immediately redirected to secure endpoints.",
      },
      {
        q: "Can enterprise clients bring their own cloud storage (BYOC)?",
        a: "Yes. Enterprise plans support Bring Your Own Cloud (BYOC), allowing direct browser-to-bucket upload to your Amazon S3, Azure Blob, Cloudflare R2, or Google Cloud Storage without intermediary retention.",
      },
      {
        q: "Are electronic signatures tamper-evident?",
        a: "Yes. Every signed document is sealed with a cryptographic SHA-256 hash. If any page or field is modified post-signature, the certificate becomes visibly invalid.",
      },
    ],
  },
  developer: {
    badge: "Developer API",
    title: "REST & Webhook Developer APIs",
    subtitle:
      "Integrate PDF compression, eSign, OCR, and AI summaries into your apps with 5 lines of code.",
    icon: Code,
    sections: [
      {
        heading: "High Throughput Conversion Endpoints",
        content:
          "Process thousands of documents programmatically with low latency and predictable rate limits.",
      },
      {
        heading: "Real-time Webhook Callbacks",
        content:
          "Receive instant HTTP notifications when recipient signatures complete or AI jobs complete.",
      },
      {
        heading: "SDKs for TypeScript, Python & Go",
        content:
          "Official client libraries with full type safety and async promise handling.",
      },
    ],
    faqs: [
      {
        q: "How do I get started with the Vigodesk API?",
        a: "Generate an API key from your workspace developer settings. You can authenticate REST endpoints with a Bearer token header and test requests using standard cURL, Postman, or our TypeScript/Python SDKs.",
      },
      {
        q: "What rate limits apply to developer API keys?",
        a: "Developer tier keys include 60 requests per minute with burst capability. Enterprise plans provide dedicated high-throughput endpoints with custom concurrency limits.",
      },
      {
        q: "Are asynchronous webhooks supported for document events?",
        a: "Yes. You can configure webhook URLs for document events such as document.completed, document.declined, and ai.summary.ready with HMAC-SHA256 signature verification.",
      },
      {
        q: "Is there a sandbox environment for testing integrations?",
        a: "Yes. You can toggle your API keys to sandbox mode to test eSign flows, PDF conversions, and webhook delivery without consuming production document allowances.",
      },
    ],
  },
  blog: {
    badge: "Engineering Blog",
    title: "Latest Insights & Engineering Tech",
    subtitle:
      "Deep dives into PDF rendering engines, web assembly OCR, and generative document AI.",
    icon: BookOpen,
    sections: [
      {
        heading: "Building Sub-second In-Browser PDF Compression",
        content:
          "How we leveraged WebAssembly and native C++ PDF utilities to compress heavy files right in the browser.",
      },
      {
        heading: "The Future of Legal Contracts with Generative AI",
        content:
          "Exploring how LLM fine-tuning speeds up contract reviews and clause extraction by 85%.",
      },
    ],
    faqs: [
      {
        q: "How frequently is the Vigodesk engineering blog published?",
        a: "Our engineering and security teams publish technical articles bi-weekly, covering browser WebAssembly optimizations, PDF specifications, cryptographic signature standards, and cloud performance.",
      },
      {
        q: "Can I contribute an article or case study to the blog?",
        a: "We welcome technical contributions and partner case studies. Reach out to our developer relations team at support@vigodesk.com to pitch an engineering topic.",
      },
      {
        q: "Where can I report security research findings?",
        a: "We run a responsible disclosure program. Please email security@vigodesk.com with reproducible steps and proof of concept for any identified vulnerabilities.",
      },
      {
        q: "How can I subscribe to release notes and updates?",
        a: "Subscribe to our engineering newsletter or follow our GitHub and developer portal for real-time changelogs and platform announcements.",
      },
    ],
  },
  about: {
    badge: "About Us",
    title: "Modernizing Document Intelligence",
    subtitle:
      "We build fast, privacy-first tools designed to streamline modern business workflows.",
    icon: FileText,
    sections: [
      {
        heading: "Our Mission",
        content:
          "To eliminate bloated desktop software and replace legacy PDF converters with an ultra-fast, intelligent enterprise web platform.",
      },
      {
        heading: "Global Operations",
        content:
          "Serving over 50,000 teams and individual professionals across 120+ countries.",
      },
    ],
    faqs: [
      {
        q: "What makes Vigodesk different from legacy PDF software?",
        a: "Unlike heavy desktop applications that require cumbersome licensing and slow installations, Vigodesk is instant, browser-first, and powered by client-side WebAssembly and modern generative AI for grounded document insights.",
      },
      {
        q: "Who is Vigodesk built for?",
        a: "Vigodesk is built for individual professionals, law firms, HR departments, real estate brokers, and enterprises who need frictionless document editing, legally compliant eSignatures, and high-volume batch generation.",
      },
      {
        q: "What is Vigodesk's approach to user privacy?",
        a: "Privacy is built into our core architecture: local browser execution whenever possible, 60-minute automatic cloud purging, and zero AI training on customer files.",
      },
      {
        q: "How can we partner with Vigodesk?",
        a: "We partner with SaaS platforms, system integrators, and reseller networks worldwide. Contact our team via sales@vigodesk.com to explore partnership opportunities.",
      },
    ],
  },
  privacy: {
    badge: "Privacy Policy",
    title: "Your Privacy is Our Core Priority",
    subtitle:
      "We do not sell your personal data or train public AI models on your private documents.",
    icon: Lock,
    sections: [
      {
        heading: "Data Retention",
        content:
          "Uploaded files for stateless jobs are permanently deleted after processing or 60 minutes, whichever comes first.",
      },
      {
        heading: "No AI Model Training",
        content:
          "Document contents submitted to AI assistants are processed in isolated memory and never used for foundation model training.",
      },
    ],
    faqs: [
      {
        q: "Does Vigodesk sell or share my documents?",
        a: "Never. We do not sell, rent, or monetize your documents, personal data, or metadata under any circumstances.",
      },
      {
        q: "How long are uploaded files retained on your servers?",
        a: "Stateless file processing jobs (merge, split, compress, convert) are automatically purged after 60 minutes. Documents stored in cloud drives remain until you delete them.",
      },
      {
        q: "Are my documents used to train AI models?",
        a: "No. All AI queries (summaries, chat, explanations) are processed with strict zero-data retention agreements with model providers. Your document content is never used to train public models.",
      },
      {
        q: "How can I request permanent account deletion?",
        a: "You can delete your account and all associated documents directly from your workspace profile settings or by emailing privacy@vigodesk.com.",
      },
    ],
  },
  terms: {
    badge: "Terms of Service",
    title: "Terms & Conditions of Service",
    subtitle:
      "Clear, transparent guidelines governing the use of our PDF platform and API services.",
    icon: FileText,
    sections: [
      {
        heading: "Acceptable Use",
        content:
          "Users agree not to upload malicious software, illicit content, or violate intellectual property rights.",
      },
      {
        heading: "Account Security",
        content:
          "You are responsible for maintaining the confidentiality of your account credentials and access keys.",
      },
    ],
    faqs: [
      {
        q: "Who owns the copyright of documents processed on Vigodesk?",
        a: "You retain 100% full ownership, intellectual property rights, and copyright over all documents and files uploaded or generated on our platform.",
      },
      {
        q: "What is your refund policy on subscription plans?",
        a: "We offer a 14-day money-back guarantee on all initial annual subscriptions. If you are not completely satisfied, contact support within 14 days for a full refund.",
      },
      {
        q: "Can I cancel my subscription at any time?",
        a: "Yes. You can cancel your subscription anytime from your billing portal with one click. Your access remains active until the end of the current billing cycle.",
      },
      {
        q: "What are the restrictions on acceptable use?",
        a: "Users may not utilize Vigodesk to distribute malware, host phishing campaigns, or process unauthorized sensitive materials in violation of local and international laws.",
      },
    ],
  },
  gdpr: {
    badge: "GDPR & Compliance",
    title: "EU General Data Protection Regulation",
    subtitle:
      "Full compliance with European data sovereignty and user privacy directives.",
    icon: CheckCircle2,
    sections: [
      {
        heading: "Data Subject Rights",
        content:
          "Users can request full export or permanent deletion of their account data at any time.",
      },
      {
        heading: "EU Server Hosting",
        content:
          "European enterprise accounts can opt for dedicated EU-only data hosting and processing regions.",
      },
    ],
    faqs: [
      {
        q: "Is Vigodesk fully GDPR compliant?",
        a: "Yes. We adhere strictly to the European General Data Protection Regulation (GDPR) standards, including data minimization, purpose limitation, and storage limitation principles.",
      },
      {
        q: "Can EU customers choose European data residency?",
        a: "Yes. Enterprise customers can designate EU cloud infrastructure (Frankfurt / Dublin) or bring their own European cloud storage buckets via BYOC.",
      },
      {
        q: "Can I sign a Data Processing Addendum (DPA)?",
        a: "Yes. We provide pre-executed DPAs containing standard contractual clauses (SCCs) for all corporate and enterprise customers upon request.",
      },
      {
        q: "How can I exercise my Right to Access or Right to Erasure?",
        a: "Submit a request to privacy@vigodesk.com or use the instant export and delete tools inside your profile settings.",
      },
    ],
  },
  docs: {
    badge: "Documentation",
    title: "Documentation & User Guides",
    subtitle:
      "Step-by-step guides for PDF tools, eSign workflows, and API integrations.",
    icon: HelpCircle,
    sections: [
      {
        heading: "Getting Started with E-Sign",
        content:
          "Learn how to create documents, assign field tags, and invite recipients for digital signature.",
      },
      {
        heading: "AI PDF Chat & Executive Summaries",
        content:
          "How to query complex documents with custom prompts and strict source citations.",
      },
    ],
    faqs: [
      {
        q: "How do I create and send an eSign envelope?",
        a: "Navigate to the eSign Studio, upload your PDF agreement, drag and drop signature and date tags onto the document, assign recipient email addresses, and click Send Envelope.",
      },
      {
        q: "How does AI Chat with PDF work?",
        a: "Upload any document to the AI Chat tool. The system indexes your document content into memory, allowing you to ask questions and receive instant answers with direct page references.",
      },
      {
        q: "What file formats can be converted to PDF?",
        a: "Vigodesk supports conversion from Microsoft Word (.docx), Excel (.xlsx), PowerPoint (.pptx), images (.jpg, .png), and text files (.txt) into standard PDF.",
      },
      {
        q: "How do I configure custom AWS S3 or Cloudflare R2 storage?",
        a: "Go to Settings > Cloud Storage, enter your bucket credentials (Endpoint, Region, Bucket Name, and Access Keys), and enable CORS permissions following our setup guide.",
      },
    ],
  },
};

export default function InfoPage({ type }: InfoPageProps) {
  const data = PAGE_DATA[type] ?? PAGE_DATA.about;
  const Icon = data.icon;

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto animate-fade-in text-left">
      {/* Page Header */}
      <div className="mb-10 pb-8 border-b border-border">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-foreground text-xs font-semibold mb-4 border border-border">
          <Icon className="size-3.5 text-foreground" />
          <span>{data.badge}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
          {data.title}
        </h1>
        <p className="text-base text-muted-foreground mt-3 max-w-2xl font-normal">
          {data.subtitle}
        </p>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-8">
        {data.sections.map((sec, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl border border-border bg-card/60 backdrop-blur-sm shadow-xs"
          >
            <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
              <span className="size-2 rounded-full bg-foreground inline-block" />
              {sec.heading}
            </h3>
            <p className="text-sm text-muted-foreground font-normal leading-relaxed">
              {sec.content}
            </p>
          </div>
        ))}
      </div>

      {/* Page Related FAQs */}
      {data.faqs && data.faqs.length > 0 && (
        <div className="mt-16">
          <FaqSection
            badge={data.badge}
            title={`Frequently Asked Questions · ${data.badge}`}
            subtitle={`Common answers and guidance regarding ${data.badge.toLowerCase()} on Vigodesk.`}
            faqs={data.faqs}
          />
        </div>
      )}

      {/* CTA Box */}
      <div className="mt-12 p-8 rounded-3xl border border-border bg-card flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div>
          <h4 className="text-lg font-semibold text-foreground">
            Ready to get started?
          </h4>
          <p className="text-xs text-muted-foreground mt-1">
            Access 15+ PDF and AI document tools in one workspace.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/workspace">
            <Button className="rounded-xl px-5 text-xs font-semibold bg-foreground text-background hover:bg-foreground/90 shadow-md">
              Open Workspace <ArrowRight className="ml-2 size-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
