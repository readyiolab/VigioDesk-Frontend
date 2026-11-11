import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { apiService } from "@/services/api";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

/**
 * Completes consumer cloud OAuth (Drive / Dropbox / OneDrive / Box).
 * Provider redirects here with ?code=&state=
 */
export default function CloudOAuthCallbackPage() {
  const { provider = "" } = useParams<{ provider: string }>();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"working" | "success" | "error">("working");
  const [message, setMessage] = useState("Connecting your cloud account…");

  useEffect(() => {
    const code = params.get("code");
    const error = params.get("error");
    if (error) {
      setStatus("error");
      setMessage(params.get("error_description") || error);
      return;
    }
    if (!code || !provider) {
      setStatus("error");
      setMessage("Missing OAuth code or provider.");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const redirectUri = `${window.location.origin}/oauth/callback/${provider}`;
        const result: any = await apiService.exchangeCloudOAuth(provider, code, redirectUri);
        if (cancelled) return;
        const email = result?.data?.accountEmail || result?.accountEmail;
        if (email) {
          localStorage.setItem(`cloud_conn_${provider}`, email);
        }
        setStatus("success");
        setMessage(`Connected ${provider}${email ? ` (${email})` : ""}.`);
        toast.success("Cloud account connected");
        setTimeout(() => navigate("/workspace", { replace: true }), 1200);
      } catch (err: unknown) {
        if (cancelled) return;
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "OAuth exchange failed.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [params, provider, navigate]);

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      {status === "working" ? <Spinner className="size-6" /> : null}
      <p className="text-sm text-foreground">{message}</p>
      {status === "error" ? (
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/workspace">Back to workspace</Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
