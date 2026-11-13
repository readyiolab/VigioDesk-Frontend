import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { lettersApi } from "@/services/lettersApi";
import { toast } from "sonner";
import { writeLetterOrgId } from "@/features/letters/orgHelpers";

/** Accepts ?token= from invite email. */
export default function AcceptInvitePage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      toast.error("Missing invite token");
      navigate("/letters/studio");
      return;
    }
    lettersApi
      .acceptInvite(token)
      .then((res) => {
        writeLetterOrgId(res.organization.id, {
          role: res.role,
          orgName: res.organization.name,
        });
        toast.success(`Joined ${res.organization.name}`);
        navigate("/letters/studio");
      })
      .catch((e) => {
        toast.error(e.message);
        navigate("/letters/studio");
      });
  }, [params, navigate]);

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 bg-background px-4 text-center">
      <p className="text-sm font-medium text-foreground">Accepting invitation…</p>
      <p className="text-xs text-muted-foreground">You will enter Letter Studio shortly.</p>
    </div>
  );
}
