import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Lock, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { apiService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Missing reset token. Open the link from your email.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await apiService.resetPassword(token, password);
      toast.success("Password updated. Sign in with your new password.");
      navigate("/login", { replace: true });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-4 py-12">
      <Link
        to="/login"
        className="mb-6 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to sign in
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Reset password</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Choose a new password (at least 8 characters, with a letter and a number).
      </p>

      {!token ? (
        <div className="mt-6 rounded-xl border border-destructive/25 bg-destructive/10 p-4 text-sm text-destructive">
          This page needs a valid token from your reset email.{" "}
          <Link to="/forgot-password" className="font-semibold underline">
            Request a new link
          </Link>
          .
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-foreground">New password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                required
                autoComplete="new-password"
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-border bg-muted/30 py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-foreground">Confirm password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                required
                autoComplete="new-password"
                disabled={loading}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full rounded-xl border border-border bg-muted/30 py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full rounded-xl py-5">
            {loading ? <Spinner className="mr-2 size-4" /> : null}
            Update password
          </Button>
        </form>
      )}
    </div>
  );
}
