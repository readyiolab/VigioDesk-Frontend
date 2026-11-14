import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { webreportsApi } from "@/services/webreportsApi";
import { safeInternalPath } from "@/lib/safeRedirect";

export default function WebReportsOAuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Connecting Google…");

  useEffect(() => {
    const code = params.get("code");
    const state = params.get("state");
    const error = params.get("error");
    const errorDescription = params.get("error_description");
    const returnTo = safeInternalPath(
      localStorage.getItem("webreports_oauth_return_to"),
      "/webreports/scan"
    );

    if (error) {
      toast.error(errorDescription || error || "Connection was cancelled");
      navigate(returnTo, { replace: true });
      return;
    }

    if (!code || !state) {
      toast.error("Missing authorization details. Try Connect again.");
      navigate(returnTo, { replace: true });
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const result = await webreportsApi.integrationsExchange(code, state);
        if (cancelled) return;
        localStorage.removeItem("webreports_oauth_return_to");
        toast.success(
          result.accountEmail
            ? `Connected ${result.accountEmail}`
            : result.provider === "google_analytics"
              ? "Google Analytics connected"
              : "Search Console connected"
        );
        setMessage("Connected. Returning to your report…");
        navigate(returnTo, { replace: true });
      } catch (e: unknown) {
        if (cancelled) return;
        toast.error(e instanceof Error ? e.message : "Could not connect Google");
        navigate(returnTo, { replace: true });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [params, navigate]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 bg-[#f4f5f9] px-4 text-center">
      <Spinner className="size-6 text-[#6b46c1]" />
      <p className="text-sm font-medium text-[#1f232b]">{message}</p>
      <p className="text-xs text-[#6b7280]">Do not close this window.</p>
    </div>
  );
}
