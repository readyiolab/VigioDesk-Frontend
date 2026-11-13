import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { lettersApi } from "@/services/lettersApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  ISSUE_LABELS,
  autoMapHeaders,
  unmappedRequired,
  type MappingSource,
} from "@/lib/letterMapping";
import { cn } from "@/lib/utils";
import { ensureLetterOrgId, readLetterOrgId, writeLetterOrgId } from "@/features/letters/orgHelpers";
import { StudioStepRail, StudioStatusChip, StudioSkeleton } from "@/components/letters/StudioPageHeader";
import { ChevronDown } from "lucide-react";

function orgId() {
  return readLetterOrgId();
}

type Step = "setup" | "map" | "validate" | "generate" | "send";

function severityPlain(severity: string): string {
  if (severity === "BLOCKED") return "Can't send";
  if (severity === "REVIEW") return "Needs a look";
  return "Needs a look";
}

/** Human labels for system letter fields shown in mapping UI. */
function fieldLabel(field: string): string {
  const map: Record<string, string> = {
    Employee_ID: "Employee ID",
    Employee_Name: "Employee name",
    Employee_Email: "Employee email",
    Designation: "Job title",
    Department: "Department",
    Effective_Date: "Effective date",
    Current_Salary: "Current salary",
    New_Salary: "New salary",
    Increment_Amount: "Raise amount",
    Increment_Percent: "Raise %",
    Old_CTC: "Current CTC",
    New_CTC: "New CTC",
    PDF_Password: "PDF password",
  };
  return map[field] || field.replace(/_/g, " ");
}

const MappingRow = memo(function MappingRow({
  header,
  value,
  source,
  systemFields,
  onChange,
}: {
  header: string;
  value: string;
  source: MappingSource;
  systemFields: string[];
  onChange: (header: string, field: string) => void;
}) {
  return (
    <tr className="border-t border-border [content-visibility:auto]">
      <td className="px-3 py-2">
        <span className="font-medium text-foreground">{header}</span>
        {source === "ai" && (
          <span className="ml-2 rounded-full bg-violet-500/15 px-1.5 py-0.5 text-[10px] font-medium text-violet-700">
            AI suggested
          </span>
        )}
        {(source === "auto" || source === "exact") && (
          <span className="ml-2 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
            Auto
          </span>
        )}
      </td>
      <td className="px-3 py-2">
        <select
          className="h-8 w-full rounded-lg border border-border bg-card px-2 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-ring/40"
          value={value}
          onChange={(e) => onChange(header, e.target.value)}
        >
          <option value="">— skip —</option>
          {systemFields.map((f) => (
            <option key={f} value={f}>
              {fieldLabel(f)}
            </option>
          ))}
        </select>
      </td>
    </tr>
  );
});

export default function BatchWizardPage() {
  const { batchId: routeBatchId } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canSend = user?.plan !== "FREE";
  const [step, setStep] = useState<Step>("setup");
  const [templates, setTemplates] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [templateId, setTemplateId] = useState(params.get("templateId") || "");
  const [brandProfileId, setBrandProfileId] = useState("");
  const [batchId, setBatchId] = useState(routeBatchId || "");
  const [headers, setHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<Record<string, string>[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [sourceFileName, setSourceFileName] = useState("");
  const allRowsRef = useRef<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [mapSources, setMapSources] = useState<Record<string, MappingSource>>({});
  const [systemFields, setSystemFields] = useState<string[]>([]);
  const [aiNote, setAiNote] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [issues, setIssues] = useState<any[]>([]);
  const [showAllIssues, setShowAllIssues] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [approved, setApproved] = useState(false);
  const [passwordMode, setPasswordMode] = useState("NONE");
  const [progress, setProgress] = useState<any>(null);
  const [mailAccounts, setMailAccounts] = useState<any[]>([]);
  const [mailAccountId, setMailAccountId] = useState("");
  const [sendMode, setSendMode] = useState<"CREATE_DRAFTS" | "SEND_NOW" | "GENERATE_ONLY">(
    canSend ? "CREATE_DRAFTS" : "GENERATE_ONLY"
  );
  const [confirmCount, setConfirmCount] = useState<number | "">("");
  const [subject, setSubject] = useState("Your employee letter");
  const [busy, setBusy] = useState(false);
  /** True only after Make PDFs is queued — drives progress polling. */
  const [isGenerating, setIsGenerating] = useState(false);
  /** No progress for ~2 min — stop spinner and force Retry. */
  const [generateStuck, setGenerateStuck] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [zipDownloadStarted, setZipDownloadStarted] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [showFixMatches, setShowFixMatches] = useState(false);
  const [showCompanyLook, setShowCompanyLook] = useState(false);
  const [showEmailOptions, setShowEmailOptions] = useState(false);

  useEffect(() => {
    setSendMode(canSend ? "CREATE_DRAFTS" : "GENERATE_ONLY");
  }, [canSend]);

  useEffect(() => {
    const just = localStorage.getItem("letter_mail_just_connected");
    if (just) {
      localStorage.removeItem("letter_mail_just_connected");
      lettersApi
        .mailAccounts()
        .then((accounts) => {
          setMailAccounts(accounts.accounts);
          const match = accounts.accounts.find((a) => a.emailAddress === just);
          if (match) setMailAccountId(match.id);
          else if (accounts.accounts[0]) setMailAccountId(accounts.accounts[0].id);
        })
        .catch(() => undefined);
    }
  }, []);

  useEffect(() => {
    (async () => {
      if (!orgId()) {
        const boot = await lettersApi.bootstrap();
        writeLetterOrgId(boot.org.organization.id, {
          role: boot.org.role,
          orgName: boot.org.organization.name,
          userId: user?.id,
        });
      } else {
        await ensureLetterOrgId(user?.id);
      }
      const [{ templates: t }, { brands: b }] = await Promise.all([
        lettersApi.listTemplates(orgId()),
        lettersApi.listBrands(orgId()),
      ]);
      setTemplates(t);
      setBrands(b);
      if (!templateId && t[0]) setTemplateId(t[0].id);
      if (routeBatchId) {
        setBatchId(routeBatchId);
        const detail = await lettersApi.getBatch(orgId(), routeBatchId);
        const st = detail.batch.status;
        if (st === "GENERATED" || st === "SENDING" || st === "SENT") {
          setStep("send");
          const accounts = await lettersApi.mailAccounts();
          setMailAccounts(accounts.accounts);
          const p = await lettersApi.progress(orgId(), routeBatchId);
          setProgress(p);
        } else if (st === "GENERATING") {
          setStep("send");
          setIsGenerating(true);
          try {
            const p = await lettersApi.progress(orgId(), routeBatchId);
            setProgress(p);
          } catch {
            /* ignore */
          }
        } else if (st === "VALIDATED" || st === "MAPPED") {
          setStep("validate");
          try {
            const iss = await lettersApi.issues(orgId(), routeBatchId);
            setIssues(iss.issues);
            setSummary({
              ready: detail.batch.readyCount,
              warning: detail.batch.warningCount,
              blocked: detail.batch.blockedCount,
            });
          } catch {
            /* ignore */
          }
        } else if (st === "IMPORTED" || st === "DRAFT") {
          setStep("map");
        } else {
          setStep("map");
        }
      }
    })().catch((e) => toast.error(e.message));
  }, []);

  const createBatch = async () => {
    setBusy(true);
    try {
      const { batch } = await lettersApi.createBatch(orgId(), {
        templateId,
        brandProfileId: brandProfileId || null,
      });
      setBatchId(batch.id);
      navigate(`/letters/batches/${batch.id}`, { replace: true });
      toast.success("Ready — upload your spreadsheet next");
      setStep("map");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const onFile = async (file: File) => {
    if (!batchId) {
      toast.error("Start send first — choose a template and continue");
      return;
    }
    setBusy(true);
    try {
      const { apiService } = await import("@/services/api");
      const sourceFileKey = await apiService.uploadFileDirect(file);
      const parsed = await lettersApi.parseUpload(orgId(), batchId, {
        sourceFileKey,
        sourceFileName: file.name,
      });
      const fields = parsed.systemFields?.length
        ? parsed.systemFields
        : [
            "Employee_ID",
            "Employee_Name",
            "Employee_Email",
            "Designation",
            "Department",
            "Old_CTC",
            "New_CTC",
            "Increment_Percent",
            "Effective_Date",
            "PDF_Password",
            "Manager_Name",
          ];
      setHeaders(parsed.headers);
      setSystemFields(fields);
      setSourceFileName(file.name);
      setRowCount(parsed.totalRows || parsed.rows?.length || 0);
      allRowsRef.current = parsed.rows || [];
      setPreviewRows((parsed.rows || []).slice(0, 10));

      const auto = autoMapHeaders(parsed.headers, fields);
      const next = { ...auto.mapping };
      const sources = { ...auto.sources };
      setAiNote(null);
      setMapping(next);
      setMapSources(sources);
      const stillNeed = unmappedRequired(next);
      setShowFixMatches(stillNeed.length > 0);
      setStep("map");
      const n = parsed.totalRows || parsed.rows?.length || 0;
      toast.success(
        stillNeed.length
          ? `Found ${n} employees — please match a few columns`
          : `Found ${n} employees`
      );
      // Unlock UI now — AI mapping only if required fields are still missing
      setBusy(false);

      if (stillNeed.length > 0) {
        void (async () => {
          try {
            const sug = await lettersApi.aiSuggestMapping(orgId(), parsed.headers);
            setMapping((prev) => {
              const merged = { ...prev };
              const used = new Set(Object.values(merged).filter(Boolean));
              const aiHeaders: string[] = [];
              for (const [h, v] of Object.entries(sug.suggestions || {})) {
                if (!merged[h] && v && (v as any).field) {
                  const field = (v as any).field as string;
                  if (!used.has(field) && fields.includes(field)) {
                    merged[h] = field;
                    used.add(field);
                    aiHeaders.push(h);
                  }
                }
              }
              if (aiHeaders.length > 0) {
                setMapSources((s) => {
                  const nextSrc = { ...s };
                  for (const h of aiHeaders) nextSrc[h] = "ai";
                  return nextSrc;
                });
                setShowFixMatches(unmappedRequired(merged).length > 0);
                toast.message("Suggested a few more column matches");
              }
              return merged;
            });
          } catch {
            setAiNote("AI mapping unavailable — match any missing columns below.");
          }
        })();
      }
      return;
    } catch (e: any) {
      toast.error(e.message || "Failed to parse file");
    } finally {
      setBusy(false);
    }
  };

  const onMappingChange = useCallback((header: string, field: string) => {
    setMapping((m) => ({ ...m, [header]: field }));
    setMapSources((s) => ({ ...s, [header]: field ? "auto" : "" }));
  }, []);

  const missingRequired = useMemo(() => unmappedRequired(mapping), [mapping]);

  const applyMap = async () => {
    if (missingRequired.length) {
      toast.error(
        `Still need: ${missingRequired.map((f) => fieldLabel(f)).join(", ")}`
      );
      return;
    }
    setBusy(true);
    try {
      await lettersApi.applyMapping(orgId(), batchId, {
        mapping,
        rows: allRowsRef.current,
      });
      const result = await lettersApi.validate(orgId(), batchId, sendMode !== "GENERATE_ONLY");
      setSummary(result.summary);
      const iss = await lettersApi.issues(orgId(), batchId);
      setIssues(iss.issues);
      setPreview(null);
      setPreviewLoading(true);
      setStep("validate");
      toast.success("Employee list ready to review");
      setBusy(false);

      // Preview + anomalies in background — do not block Check the list
      void (async () => {
        try {
          const [prev] = await Promise.all([
            lettersApi.preview(orgId(), batchId).catch(() => null),
            lettersApi.aiAnomalies(orgId(), batchId).catch(() => null),
          ]);
          if (prev) setPreview(prev);
          try {
            const refreshed = await lettersApi.issues(orgId(), batchId);
            setIssues(refreshed.issues);
          } catch {
            /* keep first issues */
          }
        } finally {
          setPreviewLoading(false);
        }
      })();
      return;
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const startGenerate = async () => {
    setBusy(true);
    setGenerateStuck(false);
    setZipDownloadStarted(false);
    try {
      let prev = preview;
      if (!prev?.samples) {
        prev = await lettersApi.preview(orgId(), batchId);
        setPreview(prev);
      }
      setApproved(true);
      await lettersApi.generate(orgId(), batchId, {
        approved: true,
        passwordMode,
      });
      setIsGenerating(true);
      setProgress({
        status: "GENERATING",
        generated: 0,
        pending: prev?.eligibleCount || summary?.ready || 0,
        failed: 0,
        skipped: 0,
      });
      setStep("send");
      toast.success("Making your PDFs…");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  // Poll while Make PDFs is running (shown on finish / send step)
  useEffect(() => {
    if ((step !== "generate" && step !== "send") || !batchId || !isGenerating) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let delay = 1000;
    let stableTicks = 0;
    let lastKey = "";

    const tick = async () => {
      if (cancelled) return;
      if (document.visibilityState === "hidden") {
        timer = setTimeout(tick, delay);
        return;
      }
      try {
        const p = await lettersApi.progress(orgId(), batchId);
        if (cancelled) return;

        if (p.status === "VALIDATED" || p.status === "MAPPED" || p.status === "DRAFT") {
          setIsGenerating(false);
          setGenerateStuck(false);
          setProgress(null);
          toast.error("PDF creation did not start. Click Make PDFs again.");
          setStep("validate");
          return;
        }

        setProgress(p);
        const key = `${p.generated}-${p.pending}-${p.failed}-${p.status}`;
        if (key === lastKey) stableTicks += 1;
        else {
          stableTicks = 0;
          lastKey = key;
          setGenerateStuck(false);
        }

        // Failures with nothing ready — stop spinning immediately
        if (p.generated === 0 && p.failed > 0 && (p.pending === 0 || p.status === "GENERATED")) {
          setIsGenerating(false);
          setGenerateStuck(false);
          setStep("send");
          toast.error("PDFs could not be created. See the message on screen.");
          return;
        }

        if (p.status === "GENERATED" || (p.status === "GENERATING" && p.pending === 0)) {
          try {
            const sum = await lettersApi.aiSummary(orgId(), batchId);
            setProgress((prev: any) => ({ ...prev, ...p, aiSummary: sum.summary }));
          } catch {
            setProgress(p);
          }
          setIsGenerating(false);
          setGenerateStuck(false);
          if (p.generated === 0 && p.failed > 0) {
            toast.error("PDFs could not be created. See the message on screen.");
          }
          setStep("send");
          const accounts = await lettersApi.mailAccounts();
          setMailAccounts(accounts.accounts);
          return;
        }

        // ~45–60s no movement — soft warning
        if (
          stableTicks >= 12 &&
          p.status === "GENERATING" &&
          p.pending > 0 &&
          p.generated === 0
        ) {
          setProgress((prev: any) => ({
            ...prev,
            ...p,
            lastError:
              p.lastError ||
              prev?.lastError ||
              "Still preparing… If this continues, click Retry.",
          }));
        }

        // ~2 min no movement — hard stuck: stop spinner, require Retry
        if (
          stableTicks >= 24 &&
          p.status === "GENERATING" &&
          p.pending > 0 &&
          p.generated === 0
        ) {
          setGenerateStuck(true);
          setIsGenerating(false);
          setProgress((prev: any) => ({
            ...prev,
            ...p,
            lastError:
              p.lastError ||
              "PDF creation stopped responding. Click Retry, or go back and try again.",
          }));
          return;
        }
      } catch {
        /* ignore poll errors */
      }
      delay = Math.min(delay * 1.5, 5000);
      timer = setTimeout(tick, delay);
    };

    timer = setTimeout(tick, delay);
    const onVis = () => {
      if (document.visibilityState === "visible" && !cancelled) {
        delay = 1000;
        if (timer) clearTimeout(timer);
        timer = setTimeout(tick, 0);
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [step, batchId, isGenerating]);

  const doSend = async () => {
    setBusy(true);
    try {
      const mode = canSend ? sendMode : "GENERATE_ONLY";
      if (mode === "SEND_NOW") {
        const eligible = progress?.generated || preview?.eligibleCount || 0;
        if (Number(confirmCount) !== eligible) {
          toast.error(`Enter confirm count ${eligible} to send now`);
          setBusy(false);
          return;
        }
      }
      await lettersApi.send(orgId(), batchId, {
        mode,
        subject,
        bodyHtml: "<p>Please find your letter attached.</p>",
        mailAccountId: mode === "GENERATE_ONLY" ? undefined : mailAccountId,
        confirmSendCount: mode === "SEND_NOW" ? Number(confirmCount) : undefined,
      });
      toast.success(mode === "GENERATE_ONLY" ? "Done (no email)" : "Send queued");
      navigate("/letters/history");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const pct = useMemo(() => {
    if (!progress) return 0;
    const total =
      (progress.generated || 0) + (progress.pending || 0) + (progress.failed || 0) || 1;
    return Math.round(((progress.generated || 0) / total) * 100);
  }, [progress]);

  const issueGroups = useMemo(() => {
    const map = new Map<
      string,
      { code: string; label: string; severity: string; rows: number[]; messages: Set<string> }
    >();
    for (const iss of issues) {
      for (const e of iss.errors || []) {
        const key = `${e.code || e.message}|${e.severity}`;
        const cur = map.get(key) || {
          code: e.code || "OTHER",
          label: ISSUE_LABELS[e.code] || e.message || "Issue",
          severity: e.severity || "WARNING",
          rows: [] as number[],
          messages: new Set<string>(),
        };
        cur.rows.push(iss.rowIndex + 1);
        if (e.message) cur.messages.add(e.message);
        map.set(key, cur);
      }
      for (const a of iss.anomalies || []) {
        const key = `ANOMALY:${a.code || a.message}`;
        const cur = map.get(key) || {
          code: a.code || "ANOMALY",
          label: a.message || "Needs review",
          severity: "REVIEW",
          rows: [] as number[],
          messages: new Set<string>(),
        };
        cur.rows.push(iss.rowIndex + 1);
        map.set(key, cur);
      }
    }
    return Array.from(map.values()).sort((a, b) => b.rows.length - a.rows.length);
  }, [issues]);

  const causeLine = useMemo(() => {
    if (!summary) return null;
    if (summary.blocked === 0 && summary.warning === 0) {
      return null;
    }
    const top = issueGroups[0];
    if (!top) return null;
    const n = summary.blocked || top.rows.length;
    return `${n} employee${n === 1 ? "" : "s"} need attention: ${top.label}.`;
  }, [summary, issueGroups]);

  const visibleGroups = showAllIssues ? issueGroups : issueGroups.slice(0, 50);

  const nameCol = useMemo(
    () => Object.entries(mapping).find(([, f]) => f === "Employee_Name")?.[0] || null,
    [mapping]
  );
  const emailCol = useMemo(
    () => Object.entries(mapping).find(([, f]) => f === "Employee_Email")?.[0] || null,
    [mapping]
  );

  const employeePreview = useMemo(() => {
    const rows =
      allRowsRef.current.length > 0 ? allRowsRef.current.slice(0, 12) : previewRows;
    return rows.map((row, i) => ({
      name: (nameCol && row[nameCol]) || `Employee ${i + 1}`,
      email: (emailCol && row[emailCol]) || "",
    }));
  }, [previewRows, nameCol, emailCol, mapping, headers]);

  const rowName = useCallback(
    (rowNum1Based: number) => {
      const row = allRowsRef.current[rowNum1Based - 1];
      if (!row) return `Row ${rowNum1Based}`;
      return (nameCol && row[nameCol]) || `Row ${rowNum1Based}`;
    },
    [nameCol, mapping]
  );

  const columnsReady = headers.length > 0 && missingRequired.length === 0;

  // 4 plain steps for non-technical users (generate+send share "Get your letters")
  const STEP_META: { key: string; label: string }[] = [
    { key: "setup", label: "Pick a letter" },
    { key: "map", label: "Add Excel file" },
    { key: "validate", label: "Check the list" },
    { key: "finish", label: "Get your letters" },
  ];
  const stepIndex =
    step === "setup" ? 0 : step === "map" ? 1 : step === "validate" ? 2 : 3;

  const onFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) void onFile(f);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-border bg-card px-4 py-4 sm:px-6">
        <h1 className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Send letters
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick a letter, add your Excel file, check the names, then download the PDFs.
        </p>
        <StudioStepRail steps={STEP_META} activeIndex={stepIndex} className="mt-4" />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="space-y-4">
          {step === "setup" && (
            <div className="space-y-5 rounded-xl border border-border bg-card p-4 sm:p-5">
              <div>
                <Label className="text-sm font-semibold text-foreground">
                  Which letter?
                </Label>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Choose one. You can change the wording later under Letter templates.
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {templates.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTemplateId(t.id)}
                      className={cn(
                        "rounded-xl border px-3 py-3 text-left transition",
                        templateId === t.id
                          ? "border-primary/40 bg-primary/5 shadow-sm ring-1 ring-primary/20"
                          : "border-border bg-card hover:border-border"
                      )}
                    >
                      <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    </button>
                  ))}
                  {templates.length === 0 && (
                    <p className="text-sm text-muted-foreground sm:col-span-2">
                      No letters yet — open Letter templates first, then come back.
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-border">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
                  onClick={() => setShowCompanyLook((v) => !v)}
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Company look (optional)
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {brandProfileId
                        ? brands.find((b) => b.id === brandProfileId)?.name || "Selected"
                        : "Skipped — plain letter"}
                    </p>
                  </div>
                  <ChevronDown
                    className={cn(
                      "size-4 shrink-0 text-muted-foreground transition",
                      showCompanyLook && "rotate-180"
                    )}
                  />
                </button>
                {showCompanyLook && (
                  <div className="grid gap-2 border-t border-border p-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setBrandProfileId("")}
                      className={cn(
                        "rounded-xl border px-3 py-3 text-left transition",
                        !brandProfileId
                          ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
                          : "border-border hover:border-border"
                      )}
                    >
                      <p className="text-sm font-semibold text-foreground">No company look</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Plain letter — add later
                      </p>
                    </button>
                    {brands.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setBrandProfileId(b.id)}
                        className={cn(
                          "rounded-xl border px-3 py-3 text-left transition",
                          brandProfileId === b.id
                            ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
                            : "border-border hover:border-border"
                        )}
                      >
                        <p className="truncate text-sm font-semibold text-foreground">{b.name}</p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {b.signatoryName || "Who signs — not set"}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Button
                className="rounded-xl bg-primary transition-colors duration-150 hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring/40"
                disabled={busy || !templateId}
                onClick={createBatch}
              >
                {busy ? <Spinner className="mr-2 size-4" /> : null}
                {busy ? "Starting…" : "Next: add Excel file"}
              </Button>
            </div>
          )}

          {step === "map" && batchId && (
            <div className="space-y-4">
              {headers.length > 0 && (
                <div className="sticky top-0 z-10 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card/95 px-4 py-3 shadow-sm backdrop-blur">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {sourceFileName || "Uploaded file"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {columnsReady ? (
                        <>{rowCount} employees ready</>
                      ) : (
                        <span className="text-rose-600">
                          Need: {missingRequired.map((f) => fieldLabel(f)).join(", ")}
                        </span>
                      )}
                    </p>
                  </div>
                  <Button
                    className="rounded-xl bg-primary transition-colors duration-150 hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring/40"
                    disabled={busy || missingRequired.length > 0}
                    onClick={applyMap}
                  >
                    {busy ? <Spinner className="mr-2 size-4" /> : null}
                    {busy ? "Checking…" : "Looks good — continue"}
                  </Button>
                </div>
              )}

              <div className="space-y-4 rounded-xl border border-border p-4">
                <div>
                  <Label>Upload your employee Excel or CSV</Label>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Need a test file?{" "}
                    <a
                      href="/samples/letter-batch-sample.csv"
                      download="letter-batch-sample.csv"
                      className="font-semibold text-primary underline underline-offset-2"
                    >
                      Download a sample with 5 employees
                    </a>
                    , then upload it here.
                  </p>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="mt-2 block w-full text-sm text-muted-foreground file:mr-3 file:rounded-xl file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-primary hover:file:bg-primary/15"
                    onChange={onFileInput}
                  />
                </div>

                {busy && headers.length === 0 && (
                  <div className="space-y-2 rounded-xl border border-border bg-muted p-4">
                    <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200" />
                    <div className="h-3 w-2/3 animate-pulse rounded bg-slate-200" />
                    <div className="h-24 animate-pulse rounded-lg bg-slate-200" />
                  </div>
                )}

                {aiNote && showFixMatches && (
                  <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">{aiNote}</p>
                )}

                {headers.length > 0 && columnsReady && !showFixMatches && (
                  <div className="space-y-3">
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3">
                      <p className="text-sm font-semibold text-emerald-900">
                        We found {rowCount} employees and matched your columns.
                      </p>
                      <p className="mt-1 text-xs text-emerald-800">
                        Check the names below. If something looks wrong, fix the column matches.
                      </p>
                    </div>
                    <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
                      {employeePreview.map((emp, i) => (
                        <li
                          key={`${emp.name}-${i}`}
                          className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
                        >
                          <span className="font-medium text-foreground">{emp.name}</span>
                          <span className="truncate text-xs text-muted-foreground">{emp.email || "—"}</span>
                        </li>
                      ))}
                      {rowCount > employeePreview.length && (
                        <li className="px-4 py-2 text-xs text-muted-foreground">
                          +{rowCount - employeePreview.length} more employees
                        </li>
                      )}
                    </ul>
                    <button
                      type="button"
                      className="text-sm font-semibold text-primary underline-offset-2 hover:underline"
                      onClick={() => setShowFixMatches(true)}
                    >
                      Fix columns
                    </button>
                  </div>
                )}

                {headers.length > 0 && (showFixMatches || !columnsReady) && (
                  <div className="space-y-3">
                    {!columnsReady && (
                      <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">
                        Need: {missingRequired.map((f) => fieldLabel(f)).join(", ")}. Match them
                        below, then continue.
                      </p>
                    )}
                    {columnsReady && (
                      <button
                        type="button"
                        className="text-sm font-semibold text-muted-foreground underline-offset-2 hover:underline"
                        onClick={() => setShowFixMatches(false)}
                      >
                        Hide column matching
                      </button>
                    )}
                    <div className="overflow-auto rounded-xl border border-border">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-muted">
                          <tr>
                            <th className="px-3 py-2.5 font-semibold text-muted-foreground">
                              Spreadsheet column
                            </th>
                            <th className="px-3 py-2.5 font-semibold text-muted-foreground">
                              Goes into letter field
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {headers.map((h) => (
                            <MappingRow
                              key={h}
                              header={h}
                              value={mapping[h] || ""}
                              source={mapSources[h] || ""}
                              systemFields={systemFields}
                              onChange={onMappingChange}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {headers.length === 0 && !busy && (
                  <p className="rounded-xl border border-dashed border-border bg-muted px-4 py-6 text-center text-sm text-muted-foreground">
                    Upload an Excel or CSV file with your employee list.
                  </p>
                )}
              </div>
            </div>
          )}

          {step === "validate" && (
            <div className="space-y-4">
              {summary && (
                <div className="rounded-xl border border-border bg-card px-4 py-3.5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {summary.blocked === 0 && summary.warning === 0
                          ? `${summary.ready} employees validated — ready for PDFs`
                          : causeLine ||
                            `${summary.ready} ready · ${summary.warning} need review · ${summary.blocked} blocked`}
                      </p>
                      {summary.blocked === 0 && summary.warning === 0 && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Review the samples below, then Make PDFs.
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <StudioStatusChip tone="success">{summary.ready} ready</StudioStatusChip>
                      <StudioStatusChip tone={summary.warning > 0 ? "warning" : "default"}>
                        {summary.warning} review
                      </StudioStatusChip>
                      <StudioStatusChip tone={summary.blocked > 0 ? "danger" : "default"}>
                        {summary.blocked} blocked
                      </StudioStatusChip>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Sample employees
                </p>
                {previewLoading && !preview?.samples ? (
                  <div className="grid gap-3 sm:grid-cols-3">
                    <StudioSkeleton className="h-36" />
                    <StudioSkeleton className="h-36" />
                    <StudioSkeleton className="h-36" />
                  </div>
                ) : preview?.samples ? (
                  <div className="grid gap-3 sm:grid-cols-3">
                    {(
                      [
                        { key: "first" as const, meta: "First row" },
                        { key: "middle" as const, meta: "Middle row" },
                        { key: "last" as const, meta: "Last row" },
                      ] as const
                    ).map(({ key, meta }) => {
                      const sample = preview.samples?.[key];
                      const data = (sample?.employeeData || {}) as Record<string, string>;
                      return (
                        <SampleEmployeeCard
                          key={key}
                          meta={meta}
                          data={data}
                          fileName={sample?.suggestedFileName}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-xs text-muted-foreground">
                    Sample preview unavailable — you can still Make PDFs.
                  </p>
                )}
              </div>

              {(issueGroups.length > 0 || (summary && (summary.warning > 0 || summary.blocked > 0))) && (
                <div className="max-h-80 overflow-auto rounded-xl border border-border bg-card text-xs">
                  {visibleGroups.map((g) => (
                    <div
                      key={`${g.code}-${g.severity}`}
                      className="border-b border-border px-3 py-2.5 [content-visibility:auto]"
                    >
                      <div className="font-semibold text-foreground">
                        {g.label}
                        <span
                          className={cn(
                            "ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                            g.severity === "BLOCKED"
                              ? "bg-rose-500/15 text-rose-700"
                              : "bg-amber-500/15 text-amber-700"
                          )}
                        >
                          {severityPlain(g.severity)} · {g.rows.length} employee
                          {g.rows.length === 1 ? "" : "s"}
                        </span>
                      </div>
                      <p className="mt-1 text-muted-foreground">
                        {g.rows
                          .slice(0, 8)
                          .map((r) => rowName(r))
                          .join(", ")}
                        {g.rows.length > 8 ? ` +${g.rows.length - 8} more` : ""}
                      </p>
                    </div>
                  ))}
                  {issueGroups.length > 50 && !showAllIssues && (
                    <button
                      type="button"
                      className="w-full px-3 py-2.5 text-left text-xs font-semibold text-primary hover:bg-primary/10"
                      onClick={() => setShowAllIssues(true)}
                    >
                      Show more
                    </button>
                  )}
                  {issues.length === 0 && (
                    <div className="p-4 text-muted-foreground">No problems found.</div>
                  )}
                </div>
              )}

              <div className="rounded-xl border border-border bg-card px-4 py-3">
                <Label className="text-sm font-semibold text-foreground">PDF password</Label>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Needed to open the PDF (optional).
                </p>
                <select
                  className="mt-2 flex h-9 w-full rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
                  value={passwordMode}
                  onChange={(e) => setPasswordMode(e.target.value)}
                >
                  <option value="NONE">No password</option>
                  <option value="FROM_COLUMN">Use password from Excel</option>
                  <option value="EMPLOYEE_ID">Use Employee ID as password</option>
                  <option value="LAST4_ID">Use last 4 digits of Employee ID</option>
                </select>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => {
                    setShowFixMatches(true);
                    setStep("map");
                  }}
                >
                  Back to Excel
                </Button>
                <Button
                  className="rounded-xl"
                  disabled={busy || (summary && summary.ready + summary.warning === 0)}
                  onClick={() => void startGenerate()}
                >
                  {busy ? <Spinner className="mr-2 size-4" /> : null}
                  {busy ? "Starting…" : "Make PDFs"}
                </Button>
              </div>
            </div>
          )}

          {step === "send" && (isGenerating || generateStuck) && progress && (
            <div className="space-y-3 rounded-xl border border-border bg-card p-4 sm:p-5">
              <h2 className="text-sm font-semibold text-foreground">
                {generateStuck ? "PDF creation paused" : "Making PDFs…"}
              </h2>
              <Progress value={pct} />
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                {isGenerating && progress.pending > 0 && !(progress.failed > 0 && progress.generated === 0) ? (
                  <Spinner className="size-4 text-primary" />
                ) : null}
                {(() => {
                  const total =
                    (progress.generated || 0) + (progress.pending || 0) + (progress.failed || 0);
                  if (total <= 0) return "Preparing…";
                  if (progress.pending > 0 && progress.generated === 0 && !generateStuck) {
                    return `Making PDF 1 of ${total}…`;
                  }
                  if (progress.pending > 0) {
                    return `Making PDF ${Math.min((progress.generated || 0) + 1, total)} of ${total}…`;
                  }
                  return `${progress.generated} ready`;
                })()}
                {progress.failed > 0 ? ` · ${progress.failed} need a retry` : ""}
              </p>
              {(progress.lastError || generateStuck) && progress.generated === 0 && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-900">
                  <p className="font-semibold">
                    {generateStuck ? "This is taking too long" : "PDFs could not be created"}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-rose-800">
                    {progress.lastError ||
                      "Something went wrong while making the letter PDFs. Please try again."}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      className="rounded-xl bg-primary hover:bg-primary/90"
                      disabled={busy}
                      onClick={() => void startGenerate()}
                    >
                      Retry
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-xl border-rose-200"
                      disabled={busy}
                      onClick={() => {
                        setProgress(null);
                        setIsGenerating(false);
                        setGenerateStuck(false);
                        setStep("validate");
                      }}
                    >
                      Back
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === "send" && !isGenerating && !generateStuck && (
            <div className="space-y-4">
              {progress?.failed > 0 && !(progress?.generated > 0) && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
                  <p className="font-semibold">No PDFs were created</p>
                  <p className="mt-1 text-xs leading-relaxed text-rose-800">
                    {progress.lastError ||
                      "Something went wrong while creating PDFs. Please try again."}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-3 rounded-xl border-rose-200"
                    onClick={() => void startGenerate()}
                  >
                    Retry
                  </Button>
                </div>
              )}

              {progress?.generated > 0 && (
                <div className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-5">
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">
                      {progress.generated} PDF{progress.generated === 1 ? "" : "s"} ready
                      {progress.failed > 0 ? ` · ${progress.failed} failed` : ""}
                    </h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      One PDF per employee in a single ZIP file.
                    </p>
                  </div>

                  {progress.failed > 0 && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-950">
                      {Array.isArray(progress.failedEmployees) &&
                        progress.failedEmployees.length > 0 && (
                          <ul className="mb-2 list-inside list-disc text-xs text-amber-900">
                            {progress.failedEmployees.slice(0, 8).map((f: any) => (
                              <li key={f.id}>{f.name}</li>
                            ))}
                          </ul>
                        )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-xl border-amber-300"
                        disabled={busy}
                        onClick={async () => {
                          setBusy(true);
                          setGenerateStuck(false);
                          try {
                            const res = await lettersApi.retryFailedGenerate(orgId(), batchId);
                            setIsGenerating(true);
                            setStep("send");
                            setProgress({
                              status: "GENERATING",
                              generated: progress.generated,
                              pending: res.queued || progress.failed,
                              failed: 0,
                            });
                            toast.success(`Retrying ${res.queued} failed letter(s)…`);
                          } catch (e: any) {
                            toast.error(e.message);
                          } finally {
                            setBusy(false);
                          }
                        }}
                      >
                        {busy ? <Spinner className="mr-2 size-4" /> : null}
                        Retry failed only
                      </Button>
                    </div>
                  )}

                  <Button
                    type="button"
                    className="w-full rounded-xl sm:w-auto"
                    disabled={downloadingZip}
                    onClick={async () => {
                      setDownloadingZip(true);
                      try {
                        await lettersApi.downloadPdfsZip(orgId(), batchId);
                        setZipDownloadStarted(true);
                        toast.success("Download started");
                      } catch (e: any) {
                        toast.error(e.message || "Download failed");
                      } finally {
                        setDownloadingZip(false);
                      }
                    }}
                  >
                    {downloadingZip ? <Spinner className="mr-2 size-4" /> : null}
                    Download ZIP ({progress.generated})
                  </Button>
                  {zipDownloadStarted && (
                    <p className="text-xs text-muted-foreground">
                      Download started — check your browser’s downloads folder.
                    </p>
                  )}

                  {progress.aiSummary && (
                    <div className="rounded-xl border border-border bg-muted/50 px-3 py-2.5">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Batch summary
                      </p>
                      <p className="mt-1 text-sm text-foreground">{progress.aiSummary}</p>
                      <p className="mt-1.5 text-[11px] text-muted-foreground">
                        Generated automatically — confirm names and amounts before distributing.
                      </p>
                    </div>
                  )}

                  <div className="rounded-xl border border-border px-3 py-3">
                    <p className="text-xs font-semibold text-foreground">What’s next</p>
                    <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                      <li>Keep the ZIP for your records.</li>
                      <li>
                        Reopen this send anytime under{" "}
                        <Link to="/letters/history" className="font-medium text-primary underline-offset-2 hover:underline">
                          Recent sends
                        </Link>
                        .
                      </li>
                      <li>Optionally email from your Outlook or Gmail below.</li>
                    </ul>
                  </div>

                  <div className="rounded-xl border border-border bg-muted/40 px-4 py-3">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between text-left text-sm font-semibold text-foreground"
                      onClick={() => setShowEmailOptions((v) => !v)}
                    >
                      Send from Outlook or Gmail
                      <ChevronDown
                        className={cn("size-4 transition", showEmailOptions && "rotate-180")}
                      />
                    </button>
                    {showEmailOptions && (
                      <div className="mt-3 space-y-3 border-t border-border pt-3">
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          Letters send from <span className="font-medium">your</span> mailbox — not
                          Vigodesk.
                        </p>
                        {!canSend && (
                          <div className="flex flex-wrap items-center gap-2 text-xs text-amber-900">
                            <span>Email requires PRO. You can still download PDFs above.</span>
                            <Link
                              to="/billing"
                              className="font-semibold text-primary underline-offset-2 hover:underline"
                            >
                              Upgrade to PRO
                            </Link>
                          </div>
                        )}
                        {canSend && (
                          <div className="space-y-3">
                            <div className="flex flex-wrap gap-2">
                              <Button
                                type="button"
                                variant={sendMode === "CREATE_DRAFTS" ? "default" : "outline"}
                                size="sm"
                                className="rounded-xl"
                                onClick={() => setSendMode("CREATE_DRAFTS")}
                              >
                                Create drafts (safer)
                              </Button>
                              <Button
                                type="button"
                                variant={sendMode === "SEND_NOW" ? "default" : "outline"}
                                size="sm"
                                className="rounded-xl"
                                onClick={() => setSendMode("SEND_NOW")}
                              >
                                Send now
                              </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="rounded-xl"
                                disabled={busy}
                                onClick={async () => {
                                  setBusy(true);
                                  try {
                                    localStorage.setItem(
                                      "letter_mail_return_to",
                                      `/letters/batches/${batchId}`
                                    );
                                    const { url } = await lettersApi.mailAuthorize("OUTLOOK");
                                    window.location.href = url;
                                  } catch (e: any) {
                                    toast.error(e.message);
                                    setBusy(false);
                                  }
                                }}
                              >
                                Connect Outlook
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="rounded-xl"
                                disabled={busy}
                                onClick={async () => {
                                  setBusy(true);
                                  try {
                                    localStorage.setItem(
                                      "letter_mail_return_to",
                                      `/letters/batches/${batchId}`
                                    );
                                    const { url } = await lettersApi.mailAuthorize("GMAIL");
                                    window.location.href = url;
                                  } catch (e: any) {
                                    toast.error(e.message);
                                    setBusy(false);
                                  }
                                }}
                              >
                                Connect Gmail
                              </Button>
                            </div>
                            <div>
                              <Label>Send as</Label>
                              <select
                                className="mt-1 flex h-9 w-full rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
                                value={mailAccountId}
                                onChange={(e) => setMailAccountId(e.target.value)}
                              >
                                <option value="">Select connected mailbox…</option>
                                {mailAccounts.map((a) => (
                                  <option key={a.id} value={a.id}>
                                    {a.provider} · {a.emailAddress}
                                  </option>
                                ))}
                              </select>
                              {mailAccountId && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                  Sending as{" "}
                                  {mailAccounts.find((a) => a.id === mailAccountId)?.emailAddress ||
                                    "your mailbox"}
                                  .{" "}
                                  <button
                                    type="button"
                                    className="underline"
                                    onClick={async () => {
                                      try {
                                        await lettersApi.disconnectMail(mailAccountId);
                                        const accounts = await lettersApi.mailAccounts();
                                        setMailAccounts(accounts.accounts);
                                        setMailAccountId("");
                                        toast.success("Mailbox disconnected");
                                      } catch (e: any) {
                                        toast.error(e.message);
                                      }
                                    }}
                                  >
                                    Disconnect
                                  </button>
                                </p>
                              )}
                            </div>
                            <div>
                              <Label>Email subject</Label>
                              <Input
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                              />
                            </div>
                            {sendMode === "SEND_NOW" && (
                              <div>
                                <Label>
                                  Confirm recipient count (
                                  {progress?.generated || preview?.eligibleCount || "?"})
                                </Label>
                                <Input
                                  type="number"
                                  value={confirmCount}
                                  onChange={(e) =>
                                    setConfirmCount(e.target.value ? Number(e.target.value) : "")
                                  }
                                />
                              </div>
                            )}
                            <Button
                              className="rounded-xl"
                              disabled={busy || !(progress?.generated > 0)}
                              onClick={() => void doSend()}
                            >
                              {busy ? <Spinner className="mr-2 size-4" /> : null}
                              {busy
                                ? "Working…"
                                : sendMode === "SEND_NOW"
                                  ? "Confirm & send now"
                                  : "Create email drafts"}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatMoney(value: string | undefined): string | null {
  if (value == null || String(value).trim() === "") return null;
  const n = Number(String(value).replace(/,/g, ""));
  if (!Number.isFinite(n)) return String(value);
  return n.toLocaleString("en-IN");
}

function SampleEmployeeCard({
  meta,
  data,
  fileName,
}: {
  meta: string;
  data: Record<string, string>;
  fileName?: string;
}) {
  const name = data.Employee_Name || "Employee";
  const id = data.Employee_ID || "—";
  const oldCtc = formatMoney(data.Old_CTC);
  const newCtc = formatMoney(data.New_CTC);
  const hike = data.Increment_Percent ? `${data.Increment_Percent}%` : null;
  const email = data.Employee_Email || null;

  return (
    <div className="rounded-xl border border-border bg-card p-3.5">
      <p className="text-sm font-semibold text-foreground">{name}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">
        {meta} · ID {id}
      </p>
      <dl className="mt-3 space-y-1.5 text-xs">
        {email && (
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">Email</dt>
            <dd className="max-w-[65%] truncate text-right font-medium text-foreground" title={email}>
              {email}
            </dd>
          </div>
        )}
        {(oldCtc || newCtc) && (
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">Salary</dt>
            <dd className="text-right font-medium text-foreground">
              {oldCtc && newCtc ? (
                <>
                  {oldCtc} → {newCtc}
                  {hike ? ` (${hike})` : ""}
                </>
              ) : (
                newCtc || oldCtc
              )}
            </dd>
          </div>
        )}
      </dl>
      {fileName ? (
        <p
          className="mt-3 truncate border-t border-border pt-2 text-[10px] text-muted-foreground"
          title={fileName}
        >
          {fileName}
        </p>
      ) : null}
    </div>
  );
}
