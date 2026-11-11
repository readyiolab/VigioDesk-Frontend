import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FolderOpen, Trash2, Send, FileText, PenTool } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { apiService } from "@/services/api";

type SuiteAsset = {
  id: string;
  title: string;
  sourceModule: string;
  sourceId?: string | null;
  mimeType: string;
  storageKey: string;
  sizeBytes: number;
  createdAt: string;
};

export default function AssetLibraryPage() {
  const navigate = useNavigate();
  const [assets, setAssets] = useState<SuiteAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = (await apiService.listAssets()) as { assets: SuiteAsset[] };
      setAssets(data.assets || []);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Could not load assets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const remove = async (id: string) => {
    setBusyId(id);
    try {
      await apiService.deleteAsset(id);
      setAssets((prev) => prev.filter((a) => a.id !== id));
      toast.success("Asset removed");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Asset Library</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Shared PDFs and exports across Diagram Studio, WebReports, Letters, and eSign.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner className="size-8" />
        </div>
      ) : assets.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card/50 px-6 py-16 text-center">
          <FolderOpen className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="font-medium">No assets yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Export a diagram or report PDF, then send it here to reuse in eSign or Letters.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button variant="outline" onClick={() => navigate("/diagrams/studio")}>
              Diagrams
            </Button>
            <Button variant="outline" onClick={() => navigate("/webreports/scan")}>
              WebReports
            </Button>
            <Button variant="outline" onClick={() => navigate("/sign")}>
              eSign
            </Button>
          </div>
        </div>
      ) : (
        <ul className="space-y-2">
          {assets.map((asset) => (
            <li
              key={asset.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold">{asset.title}</p>
                <p className="text-xs text-muted-foreground">
                  {asset.sourceModule} · {asset.mimeType}
                  {asset.sizeBytes ? ` · ${Math.round(asset.sizeBytes / 1024)} KB` : ""}
                  {" · "}
                  {new Date(asset.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-lg"
                  onClick={() => navigate(`/sign?asset=${encodeURIComponent(asset.storageKey)}`)}
                >
                  <PenTool className="mr-1 h-3.5 w-3.5" />
                  eSign
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-lg"
                  onClick={() => navigate("/letters/studio")}
                >
                  <FileText className="mr-1 h-3.5 w-3.5" />
                  Letters
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-lg"
                  onClick={() => navigate(`/workspace?file=${encodeURIComponent(asset.storageKey)}`)}
                >
                  <Send className="mr-1 h-3.5 w-3.5" />
                  Workspace
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={busyId === asset.id}
                  onClick={() => void remove(asset.id)}
                  aria-label="Delete asset"
                >
                  {busyId === asset.id ? <Spinner className="size-4" /> : <Trash2 className="h-4 w-4" />}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Tip: from Diagram Studio, use File → Export PDF via Toolkit, then register the result here via{" "}
        <Link to="/history" className="underline">
          History
        </Link>
        .
      </p>
    </div>
  );
}
