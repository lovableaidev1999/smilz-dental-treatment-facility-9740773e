import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Lock } from "lucide-react";

const parseHashParams = (hash: string) => new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);

const AdminResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(true);

  const incomingError = useMemo(() => {
    const search = new URLSearchParams(location.search);
    const hash = parseHashParams(location.hash);

    return search.get("error_description") || hash.get("error_description") || search.get("error") || hash.get("error") || "";
  }, [location.hash, location.search]);

  useEffect(() => {
    let cancelled = false;

    const establishRecoverySession = async () => {
      if (incomingError) {
        if (!cancelled) {
          setError(incomingError);
          setVerifying(false);
        }
        return;
      }

      const search = new URLSearchParams(location.search);
      const hash = parseHashParams(location.hash);
      let sessionError = "";

      if (search.get("code")) {
        const { error } = await supabase.auth.exchangeCodeForSession(search.get("code")!);
        if (error) sessionError = error.message;
      } else if (search.get("token_hash") && search.get("type") === "recovery") {
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: search.get("token_hash")!,
          type: "recovery",
        });

        if (error) {
          sessionError = error.message;
        } else if (data.session) {
          const { error: setSessionError } = await supabase.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          });

          if (setSessionError) sessionError = setSessionError.message;
        }
      } else if (hash.get("access_token") && hash.get("refresh_token")) {
        const { error } = await supabase.auth.setSession({
          access_token: hash.get("access_token")!,
          refresh_token: hash.get("refresh_token")!,
        });

        if (error) sessionError = error.message;
      } else {
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          sessionError = "This reset link is invalid or has expired. Please request a new one.";
        }
      }

      if (cancelled) return;

      if (sessionError) {
        setError(sessionError);
        setVerifying(false);
        return;
      }

      if (location.search || location.hash) {
        navigate("/admin/reset-password", { replace: true });
      }

      setVerifying(false);
    };

    void establishRecoverySession();

    return () => {
      cancelled = true;
    };
  }, [incomingError, location.hash, location.search, navigate]);

  const handleResetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });

    if (updateError) {
      setError(updateError.message);
      setSubmitting(false);
      return;
    }

    await supabase.auth.signOut();
    navigate("/admin/login?reset=success", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
            <Lock className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Set New Password</h1>
          <p className="text-sm text-muted-foreground mt-1">Create a new password for the admin account.</p>
        </div>

        <form onSubmit={handleResetPassword} className="bg-card rounded-2xl p-6 shadow-card border border-border space-y-4">
          {error && <div className="bg-destructive/10 text-destructive text-sm px-4 py-2 rounded-lg">{error}</div>}

          {verifying ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="password" required value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="pl-10" placeholder="••••••••" disabled={!!error} />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="password" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="pl-10" placeholder="••••••••" disabled={!!error} />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={submitting || !!error}>
                {submitting ? "Updating..." : "Update Password"}
              </Button>
            </>
          )}

          <Link to="/admin/login" className="w-full text-sm text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1">
            <ArrowLeft className="h-3 w-3" /> Back to login
          </Link>
        </form>
      </div>
    </div>
  );
};

export default AdminResetPassword;