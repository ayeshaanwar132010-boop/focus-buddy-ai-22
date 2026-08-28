import { createFileRoute } from "@tanstack/react-router";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStudy } from "@/lib/study-store";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — AI Study Focus" },
      {
        name: "description",
        content: "View and edit your student profile details in AI Study Focus.",
      },
      { property: "og:title", content: "Profile — AI Study Focus" },
      { property: "og:description", content: "Manage your student profile details." },
    ],
  }),
  component: Profile,
});

function Profile() {
  const { profile, updateProfile, tasks, subjects } = useStudy();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ fullName: profile.fullName, email: profile.email });
  const [errors, setErrors] = useState<{ fullName?: string | undefined; email?: string | undefined }>({});
  const [saved, setSaved] = useState(false);

  const initials = profile.fullName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const startEdit = () => {
    setForm({ fullName: profile.fullName, email: profile.email });
    setErrors({});
    setSaved(false);
    setEditing(true);
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!form.fullName.trim()) next.fullName = "Full name is required.";
    if (!form.email.trim()) next.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim()))
      next.email = "Enter a valid email address.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    updateProfile({ fullName: form.fullName.trim(), email: form.email.trim() });
    setEditing(false);
    setSaved(true);
    toast.success("Profile updated", { description: "Saved in temporary frontend state." });
  };

  const completed = tasks.filter((t) => t.status === "completed").length;

  return (
    <AppShell title="Profile" description="Your account details for this demo session">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 max-w-full items-center gap-3">
                <Avatar className="h-12 w-12 shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <CardTitle className="truncate text-base">{profile.fullName}</CardTitle>
                  <CardDescription className="break-words">{profile.program}</CardDescription>
                </div>
              </div>
              {!editing ? (
                <Button variant="outline" size="sm" className="w-full shrink-0 sm:w-auto" onClick={startEdit}>
                  <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit Profile
                </Button>
              ) : null}
            </div>
          </CardHeader>
          <CardContent>
            {saved && !editing ? (
              <Alert className="mb-5 border-success/40 bg-success/10">
                <AlertDescription className="text-success">
                  Your profile changes were saved.
                </AlertDescription>
              </Alert>
            ) : null}

            {editing ? (
              <form onSubmit={save} className="space-y-4" noValidate>
                <div className="space-y-1.5">
                  <Label className={errors.fullName ? "text-destructive" : undefined}>
                    Full Name
                  </Label>
                  <Input
                    value={form.fullName}
                    onChange={(e) => {
                      setForm((p) => ({ ...p, fullName: e.target.value }));
                      setErrors((p) => ({ ...p, fullName: undefined }));
                    }}
                  />
                  {errors.fullName ? (
                    <p className="text-xs font-medium text-destructive">{errors.fullName}</p>
                  ) : null}
                </div>
                <div className="space-y-1.5">
                  <Label className={errors.email ? "text-destructive" : undefined}>Email</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => {
                      setForm((p) => ({ ...p, email: e.target.value }));
                      setErrors((p) => ({ ...p, email: undefined }));
                    }}
                  />
                  {errors.email ? (
                    <p className="text-xs font-medium text-destructive">{errors.email}</p>
                  ) : null}
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button type="submit">Save</Button>
                  <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <dl className="grid gap-5 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Full Name
                  </dt>
                  <dd className="mt-1 text-sm font-medium">{profile.fullName}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Email
                  </dt>
                  <dd className="mt-1 truncate text-sm font-medium">{profile.email}</dd>
                </div>
              </dl>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Study summary</CardTitle>
            <CardDescription>Based on this session's data.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subjects</span>
              <span className="font-medium">{subjects.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total tasks</span>
              <span className="font-medium">{tasks.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Completed</span>
              <span className="font-medium">{completed}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
