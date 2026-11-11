import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { apiService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await apiService.forgotPassword(email.trim());
      setSent(true);
      toast.success("If that email has an account, a reset link is on the way.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not send reset email.");
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
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Forgot password</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Enter your account email and we will send a reset link if a password login exists for it.
      </p>

      {sent ? (
        <div className="mt-6 rounded-xl border border-border bg-muted/40 p-4 text-sm text-foreground">
          Check your inbox for a reset link. It expires in 24 hours. Social-login accounts
          (Google / Microsoft) do not use passwords.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-foreground">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                required
                autoComplete="email"
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-border bg-muted/30 py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full rounded-xl py-5">
            {loading ? <Spinner className="mr-2 size-4" /> : null}
            Send reset link
          </Button>
        </form>
      )}
    </div>
  );
}
