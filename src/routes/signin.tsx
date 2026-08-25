import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthLayout, Field } from "@/routes/signup";
import { useStudy } from "@/lib/study-store";

export const Route = createFileRoute("/signin")({
  head: () => ({
    meta: [
      { title: "Sign in — AI Study Focus" },
      {
        name: "description",
        content: "Sign in to AI Study Focus to view your subjects, study tasks and progress.",
      },
      { property: "og:title", content: "Sign in — AI Study Focus" },
      { property: "og:description", content: "Access your study dashboard." },
    ],
  }),
  component: SignIn,
});

function SignIn() {
  const navigate = useNavigate();
  const { signIn } = useStudy();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{ email?: string | undefined; password?: string | undefined }>({});
  const [loading, setLoading] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: { email?: string | undefined; password?: string | undefined } = {};
    if (!form.email.trim()) next.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim()))
      next.email = "Enter a valid email address.";
    if (!form.password) next.password = "Password is required.";
    else if (form.password.length < 6) next.password = "Password must be at least 6 characters.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    setTimeout(() => {
      signIn(form.email.trim());
      setLoading(false);
      toast.success("Signed in", { description: "Temporary frontend session — no backend yet." });
      navigate({ to: "/dashboard" });
    }, 600);
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue with your study plan."
      footer={
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/signup" className="font-medium text-primary underline-offset-4 hover:underline">
            Sign up
          </Link>
        </p>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {Object.keys(errors).length > 0 ? (
          <Alert variant="destructive">
            <AlertDescription>Check your details and try again.</AlertDescription>
          </Alert>
        ) : null}
        <Field label="Email" error={errors.email}>
          <Input
            type="email"
            value={form.email}
            placeholder="name@university.edu"
            onChange={(e) => {
              setForm((p) => ({ ...p, email: e.target.value }));
              setErrors((p) => ({ ...p, email: undefined }));
            }}
          />
        </Field>
        <Field label="Password" error={errors.password}>
          <Input
            type="password"
            value={form.password}
            placeholder="Your password"
            onChange={(e) => {
              setForm((p) => ({ ...p, password: e.target.value }));
              setErrors((p) => ({ ...p, password: undefined }));
            }}
          />
        </Field>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {loading ? "Signing in…" : "Sign In"}
        </Button>
      </form>
    </AuthLayout>
  );
}
