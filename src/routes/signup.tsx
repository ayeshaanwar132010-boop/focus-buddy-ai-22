import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { GraduationCap, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStudy } from "@/lib/study-store";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create your account — AI Study Focus" },
      {
        name: "description",
        content: "Sign up for AI Study Focus to organize subjects and track your study tasks.",
      },
      { property: "og:title", content: "Create your account — AI Study Focus" },
      { property: "og:description", content: "Sign up to organize subjects and study tasks." },
    ],
  }),
  component: SignUp;
});

type Errors = Partial<Record<"fullName" | "email" | "password" | "confirmPassword", string>>;

function SignUp() {
  const navigate = useNavigate();
  const { signIn, updateProfile } = useStudy();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const next: Errors = {};
    if (!form.fullName.trim()) next.fullName = "Full name is required.";
    else if (form.fullName.trim().length < 3) next.fullName = "Please enter at least 3 characters.";
    if (!form.email.trim()) next.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim()))
      next.email = "Enter a valid email address, e.g. name@university.edu.";
    if (!form.password) next.password = "Password is required.";
    else if (form.password.length < 8) next.password = "Password must be at least 8 characters.";
    else if (!/[0-9]/.test(form.password)) next.password = "Include at least one number.";
    if (!form.confirmPassword) next.confirmPassword = "Please confirm your password.";
    else if (form.confirmPassword !== form.password) next.confirmPassword = "Passwords do not match.";
    return next;
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setLoading(true);
    setTimeout(() => {
      updateProfile({ fullName: form.fullName.trim(), email: form.email.trim() });
      signIn(form.email.trim());
      setLoading(false);
      toast.success("Account created", { description: "Temporary frontend account — no backend yet." });
      navigate({ to: "/dashboard" });
    }, 700);
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Set up your study workspace in a few seconds."
      footer={
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/signin" className="font-medium text-primary underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {Object.keys(errors).length > 0 ? (
          <Alert variant="destructive">
            <AlertDescription>Please fix the highlighted fields below.</AlertDescription>
          </Alert>
        ) : null}

        <Field label="Full Name" error={errors.fullName}>
          <Input value={form.fullName} onChange={set("fullName")} placeholder="Ayesha Anwar" />
        </Field>
        <Field label="Email" error={errors.email}>
          <Input type="email" value={form.email} onChange={set("email")} placeholder="name@university.edu" />
        </Field>
        <Field label="Password" error={errors.password}>
          <Input type="password" value={form.password} onChange={set("password")} placeholder="At least 8 characters" />
        </Field>
        <Field label="Confirm Password" error={errors.confirmPassword}>
          <Input
            type="password"
            value={form.confirmPassword}
            onChange={set("confirmPassword")}
            placeholder="Re-enter password"
          />
        </Field>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {loading ? "Creating account…" : "Create Account"}
        </Button>
      </form>
    </AuthLayout>
  );
}

export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className={error ? "text-destructive" : undefined}>{label}</Label>
      {children}
      {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}
    </div>
  );
}

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 py-10">
      <Link to="/" className="mb-6 flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <GraduationCap className="h-5 w-5" />
        </span>
        <span className="font-display text-lg font-semibold">
          AI Study <span className="text-primary">Focus</span>
        </span>
      </Link>
      <Card className="w-full max-w-md shadow-sm">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{subtitle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {children}
          {footer}
        </CardContent>
      </Card>
    </div>
  );
}
