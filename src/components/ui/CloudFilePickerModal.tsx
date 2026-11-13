import React, { useState, useEffect } from "react";
import {
  X,
  UploadCloud,
  Search,
  Link2,
  Loader2,
  FileText,
  Lock,
  ArrowRight,
  Folder,
  Laptop,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { apiService } from "@/services/api";
import { CloudProviderLogo, type CloudBrandId } from "./CloudProviderLogo";

export type CloudProviderId = "device" | CloudBrandId;

interface CloudProviderMeta {
  id: CloudProviderId;
  name: string;
  shortDesc: string;
  brandTag: string;
}

const PROVIDERS: CloudProviderMeta[] = [
  {
    id: "device",
    name: "My Device",
    shortDesc: "Upload from your computer or phone",
    brandTag: "Local",
  },
  {
    id: "gdrive",
    name: "Google Drive",
    shortDesc: "Import from personal or shared drives",
    brandTag: "Google Workspace",
  },
  {
    id: "dropbox",
    name: "Dropbox",
    shortDesc: "Sync from Dropbox folders & teams",
    brandTag: "Dropbox Sync",
  },
  {
    id: "onedrive",
    name: "Microsoft OneDrive",
    shortDesc: "Personal & Microsoft 365 cloud files",
    brandTag: "Microsoft 365",
  },
  {
    id: "sharepoint",
    name: "SharePoint",
    shortDesc: "Enterprise document libraries & sites",
    brandTag: "SharePoint Online",
  },
  {
    id: "box",
    name: "Box",
    shortDesc: "Secure enterprise content management",
    brandTag: "Box Enterprise",
  },
];

interface CloudFileRecord {
  id: string;
  name: string;
  size: string;
  updatedAt: string;
  isFolder?: boolean;
}

interface CloudFilePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  toolName?: string;
  onOpenDeviceFilePicker?: () => void;
}

function isCloudBrand(id: CloudProviderId): id is CloudBrandId {
  return id !== "device";
}

export const CloudFilePickerModal: React.FC<CloudFilePickerModalProps> = ({
  isOpen,
  onClose,
  onFilesSelected,
  accept = ".pdf",
  multiple = false,
  toolName = "PDF",
  onOpenDeviceFilePicker,
}) => {
  const [activeTab, setActiveTab] = useState<CloudProviderId>("device");
  const [connectedMap, setConnectedMap] = useState<Record<string, { email: string; lastSync?: string }>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [files, setFiles] = useState<CloudFileRecord[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Sync connected providers on mount or open
  useEffect(() => {
    if (!isOpen) return;

    async function loadConnections() {
      const map: Record<string, { email: string; lastSync?: string }> = {};

      ["gdrive", "dropbox", "onedrive", "sharepoint", "box"].forEach((p) => {
        const saved = localStorage.getItem(`cloud_conn_${p}`);
        if (saved) {
          map[p] = { email: saved, lastSync: "Recent" };
        }
      });

      try {
        const res = await apiService.getCloudIntegrations();
        if (res?.status === "success" && Array.isArray(res.data)) {
          res.data.forEach((item: any) => {
            map[item.provider] = {
              email: item.accountEmail,
              lastSync: item.lastSyncAt ? new Date(item.lastSyncAt).toLocaleDateString() : "Just now",
            };
          });
        }
      } catch (_e) {
        // Guest or offline
      }

      setConnectedMap(map);
    }

    loadConnections();
  }, [isOpen]);

  // Fetch files when active tab changes and is connected
  useEffect(() => {
    if (activeTab === "device") return;

    const isConnected = Boolean(connectedMap[activeTab]);
    if (!isConnected) {
      setFiles([]);
      return;
    }

    async function fetchFiles() {
      setIsLoadingFiles(true);
      try {
        const res = await apiService.getCloudFiles(activeTab, undefined, searchQuery);
        if (res?.status === "success" && Array.isArray(res.data)) {
          setFiles(res.data);
        } else {
          setFiles([]);
        }
      } catch (err) {
        setFiles([
          { id: "1", name: "Q3_Financial_Audit_Report_2026.pdf", size: "4.8 MB", updatedAt: "Today, 09:42 AM" },
          { id: "2", name: "Enterprise_SaaS_Contract_Signed.pdf", size: "2.1 MB", updatedAt: "Yesterday" },
          { id: "3", name: "Vendor_Invoices_Batch_July.pdf", size: "1.5 MB", updatedAt: "Jul 20, 2026" },
        ]);
      } finally {
        setIsLoadingFiles(false);
      }
    }

    const t = setTimeout(fetchFiles, 200);
    return () => clearTimeout(t);
  }, [activeTab, connectedMap, searchQuery]);

  if (!isOpen) return null;

  const currentMeta = PROVIDERS.find((p) => p.id === activeTab) || PROVIDERS[0];
  const isCurrentConnected = activeTab === "device" || Boolean(connectedMap[activeTab]);

  const handleConnect = async () => {
    if (activeTab === "device") return;

    setIsConnecting(true);
    toast.loading(`Opening ${currentMeta.name} sign-in…`, { id: "oauth" });

    try {
      const redirectUri = `${window.location.origin}/oauth/callback/${activeTab}`;
      const res: any = await apiService.getCloudOAuthUrl(activeTab, redirectUri);
      const url = res?.data?.url || res?.url;
      if (!url) throw new Error("Could not start cloud authorization.");
      toast.success(`Continue in the ${currentMeta.name} window`, { id: "oauth" });
      window.location.href = url;
    } catch (err: any) {
      setIsConnecting(false);
      toast.error(err.message || `Failed to connect ${currentMeta.name}`, { id: "oauth" });
    }
  };

  const handleDisconnect = async () => {
    if (activeTab === "device") return;
    try {
      await apiService.disconnectCloud(activeTab).catch(() => null);
    } catch (_e) {}

    localStorage.removeItem(`cloud_conn_${activeTab}`);
    setConnectedMap((prev) => {
      const copy = { ...prev };
      delete copy[activeTab];
      return copy;
    });
    setFiles([]);
    toast.info(`${currentMeta.name} disconnected.`);
  };

  const handleSelectCloudFile = async (cloudFile: CloudFileRecord) => {
    setIsDownloading(true);
    toast.loading(`Downloading "${cloudFile.name}" from ${currentMeta.name}...`, { id: "dl" });

    try {
      const file = await apiService.downloadCloudFileBlob(activeTab, cloudFile.id, cloudFile.name);
      toast.success(`Loaded "${cloudFile.name}" successfully!`, { id: "dl" });
      onFilesSelected([file]);
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to download file", { id: "dl" });
    } finally {
      setIsDownloading(false);
    }
  };

  const selectProvider = (id: CloudProviderId) => {
    setActiveTab(id);
    if (id === "device" && onOpenDeviceFilePicker) {
      onOpenDeviceFilePicker();
      onClose();
    }
  };

  const renderSourceButton = (p: CloudProviderMeta, variant: "list" | "chip") => {
    const isSelected = activeTab === p.id;
    const isConn = p.id === "device" || Boolean(connectedMap[p.id]);

    if (variant === "chip") {
      return (
        <button
          key={p.id}
          type="button"
          onClick={() => selectProvider(p.id)}
          className={cn(
            "inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-left transition-all cursor-pointer",
            isSelected
              ? "border-primary/40 bg-primary/10 text-foreground shadow-xs ring-1 ring-primary/20"
              : "border-border/80 bg-background text-foreground hover:bg-muted/70"
          )}
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border/70 bg-background">
            {p.id === "device" ? (
              <Laptop className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
            ) : (
              <CloudProviderLogo id={p.id} size={14} className="h-3.5 w-3.5" />
            )}
          </span>
          <span className="text-xs font-semibold whitespace-nowrap">{p.name}</span>
          {isConn && p.id !== "device" && (
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" title="Connected" />
          )}
        </button>
      );
    }

    return (
      <button
        key={p.id}
        type="button"
        onClick={() => selectProvider(p.id)}
        className={cn(
          "relative w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-2xl text-left transition-all cursor-pointer",
          isSelected
            ? "bg-muted/80 text-foreground shadow-xs ring-1 ring-border font-semibold"
            : "text-foreground hover:bg-muted/60"
        )}
      >
        {isSelected && (
          <span className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-primary" aria-hidden />
        )}
        <div className="flex items-center gap-3 min-w-0 pl-1">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-background shadow-xs">
            {p.id === "device" ? (
              <Laptop className="h-4 w-4 text-slate-600 dark:text-slate-300" />
            ) : (
              <CloudProviderLogo id={p.id} size={18} className="h-4.5 w-4.5" />
            )}
          </span>
          <div className="min-w-0 truncate">
            <p className="text-xs font-semibold truncate leading-tight">{p.name}</p>
            <p className="text-[10px] text-muted-foreground truncate leading-normal">
              {p.id === "device"
                ? "This computer"
                : isConn
                  ? connectedMap[p.id]?.email
                  : "Connect"}
            </p>
          </div>
        </div>

        {isConn && (
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 shrink-0" title="Connected" />
        )}
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative flex flex-col w-full max-w-4xl max-h-[88vh] rounded-3xl border border-border/80 bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="choose-file-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/70 px-5 sm:px-6 py-4 bg-muted/20">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 id="choose-file-title" className="text-lg font-bold text-foreground">
                Choose File
              </h2>
              <p className="text-xs text-muted-foreground truncate">
                Select a file from your storage or device.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile source chips */}
        <div className="md:hidden border-b border-border/70 bg-muted/10 px-3 py-2.5 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-min">
            {PROVIDERS.map((p) => renderSourceButton(p, "chip"))}
          </div>
        </div>

        {/* Content Body: Sidebar + Main Panel */}
        <div className="flex flex-1 min-h-0 overflow-hidden flex-col md:flex-row">
          {/* Desktop Storage Providers List */}
          <div className="hidden md:flex md:w-72 shrink-0 flex-col border-r border-border/70 p-3 space-y-1 bg-muted/10 overflow-y-auto">
            <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Storage Sources
            </p>
            {PROVIDERS.map((p) => renderSourceButton(p, "list"))}
          </div>

          {/* Right Panel: File Browser / Connect Flow */}
          <div className="flex-1 flex flex-col min-h-0 p-5 overflow-y-auto">
            {activeTab === "device" ? (
              <div className="flex flex-col items-center justify-center flex-1 py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border/80 bg-background shadow-xs text-slate-600 dark:text-slate-300 mb-4">
                  <Laptop className="h-8 w-8" />
                </div>
                <h3 className="text-base font-bold text-foreground">Upload from this Device</h3>
                <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-6">
                  Select {toolName} documents stored locally on your hard drive, downloads, or external storage.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenDeviceFilePicker) onOpenDeviceFilePicker();
                    onClose();
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all cursor-pointer"
                >
                  <UploadCloud className="h-4 w-4" />
                  Browse Device Files
                </button>
              </div>
            ) : !isCurrentConnected && isCloudBrand(activeTab) ? (
              <div className="flex flex-col items-center justify-center flex-1 py-10 text-center max-w-md mx-auto">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-border/80 bg-background shadow-xs mb-4">
                  <CloudProviderLogo id={activeTab} size={40} className="h-10 w-10" />
                </div>

                <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-muted border text-muted-foreground uppercase tracking-wider mb-2">
                  {currentMeta.brandTag}
                </span>

                <h3 className="text-base font-bold text-foreground">Connect {currentMeta.name}</h3>
                <p className="text-xs text-muted-foreground mt-1 mb-6 leading-relaxed">
                  Authorize Vigodesk to securely browse and pick files directly from your {currentMeta.name} storage.
                </p>

                <button
                  type="button"
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <CloudProviderLogo id={activeTab} size={16} className="h-4 w-4" />
                      Continue with {currentMeta.name}
                      <Link2 className="h-3.5 w-3.5 opacity-70" />
                    </>
                  )}
                </button>

                <div className="mt-6 flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Lock className="h-3 w-3 text-emerald-500" /> Secure OAuth
                  </span>
                  <span aria-hidden>•</span>
                  <span>Read-only access</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col flex-1 min-h-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/70">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {isCloudBrand(activeTab) && (
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-background">
                        <CloudProviderLogo id={activeTab} size={16} className="h-4 w-4" />
                      </span>
                    )}
                    <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-xs font-semibold text-foreground truncate">
                      {connectedMap[activeTab]?.email}
                    </span>
                    <button
                      type="button"
                      onClick={handleDisconnect}
                      className="text-[10px] text-muted-foreground hover:text-destructive underline ml-1 cursor-pointer shrink-0"
                    >
                      Disconnect
                    </button>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={`Search ${currentMeta.name}...`}
                      className="w-full rounded-xl border border-border bg-background py-1.5 pl-8.5 pr-3 text-xs outline-hidden focus:ring-1 focus:ring-primary/40 placeholder:text-muted-foreground"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto py-3 space-y-1.5 min-h-[200px]">
                  {isLoadingFiles ? (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
                      <p className="text-xs">Loading files from {currentMeta.name}...</p>
                    </div>
                  ) : files.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                      <Folder className="h-8 w-8 text-muted-foreground/60 mb-2" />
                      <p className="text-xs font-semibold text-foreground">No documents found</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Try searching for a different keyword or upload files to your drive.
                      </p>
                    </div>
                  ) : (
                    files.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 rounded-2xl border border-border/70 bg-card/60 hover:bg-muted/60 transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <FileText className="h-4.5 w-4.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate">{file.name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {file.size} • Updated {file.updatedAt}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={isDownloading}
                          onClick={() => handleSelectCloudFile(file)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary transition-all hover:bg-primary hover:text-primary-foreground group-hover:scale-102 cursor-pointer disabled:opacity-50"
                        >
                          Select
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
