import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Mail, ArrowLeft } from "lucide-react";

const PUBLISHED_ORIGIN = "https://smilz-dental-treatment-facility.lovable.app";

const getPasswordResetRedirectUrl = () => {
  const origin = window.location.origin;

  if (
    origin.includes("localhost") ||
    origin.includes("127.0.0.1") ||
    (origin.includes("lovable.app") && origin !== PUBLISHED_ORIGIN)
  ) {
    return `${PUBLISHED_ORIGIN}/?reset=1`;
  }

  return `${origin}/?reset=1`;
};

const AdminLogin = () => {
  const { user, loading, signIn } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState<"login" | "forgot">("login");

  useEffect(() => {
    const search = new URLSearchParams(location.search);

    if (search.get("reset") === "success") {
      setMode("login");
      setError("");
      setSuccess("Password updated successfully. Sign in with your new password.");
    }
  }, [location.search]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (user) return <Navigate to="/admin" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    const { error } = await signIn(email, password);
    if (error) setError(error.message);
    setSubmitting(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getPasswordResetRedirectUrl(),
    });
    if (error) {
      setError(error.message);
    } else {
      setSuccess("Password reset link sent! Check your email inbox.");
    }
    setSubmitting(false);
  };

  const title = mode === "login" ? "Admin Login" : "Reset Password";
  const subtitle = mode === "login" ? "Smilz CMS Dashboard" : "Enter your email to receive a reset link";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
            <Lock className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        </div>

        {mode === "login" && (
          <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 shadow-card border border-border space-y-4">
            {error && <div className="bg-destructive/10 text-destructive text-sm px-4 py-2 rounded-lg">{error}</div>}
            {success && <div className="bg-accent/50 text-accent-foreground text-sm px-4 py-2 rounded-lg">{success}</div>}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" placeholder="admin@smilz.net" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" placeholder="••••••••" />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Signing in..." : "Sign In"}
            </Button>
            <button type="button" onClick={() => { setMode("forgot"); setError(""); setSuccess(""); }} className="w-full text-sm text-muted-foreground hover:text-primary transition-colors">
              Forgot password?
            </button>
          </form>
        )}

        {mode === "forgot" && (
          <form onSubmit={handleForgotPassword} className="bg-card rounded-2xl p-6 shadow-card border border-border space-y-4">
            {error && <div className="bg-destructive/10 text-destructive text-sm px-4 py-2 rounded-lg">{error}</div>}
            {success && <div className="bg-accent/50 text-accent-foreground text-sm px-4 py-2 rounded-lg">{success}</div>}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" placeholder="admin@smilz.net" />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Sending..." : "Send Reset Link"}
            </Button>
            <button type="button" onClick={() => { setMode("login"); setError(""); setSuccess(""); }} className="w-full text-sm text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1">
              <ArrowLeft className="h-3 w-3" /> Back to login
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default AdminLogin;
