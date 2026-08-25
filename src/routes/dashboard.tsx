import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, CheckCircle2, Clock, ListChecks, Plus, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

import { PriorityBadge, StatusBadge } from "@/components/StatusBadge";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/study-data";
import { useStudy } from "@/lib/study-store";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — AI Study Focus" },
      {
        name: "description",
        content: "Study dashboard with total, completed and pending tasks plus your completion rate.",
      },
      { property: "og:title", content: "Dashboard — AI Study Focus" },
      { property: "og:description", content: "Track your study progress at a glance." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { profile, tasks, subjects } = useStudy();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const pending = total - completed;
  const rate = total === 0 ? 0 : Math.round((completed / total) * 100);
  const recent = [...tasks]
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .filter((t) => t.status !== "completed")
    .slice(0, 5);

  const stats = [
    { label: "Total Tasks", value: total, icon: ListChecks, tone: "text-primary" },
    { label: "Completed Tasks", value: completed, icon: CheckCircle2, tone: "text-success" },
    { label: "Pending Tasks", value: pending, icon: Clock, tone: "text-warning" },
    { label: "Completion Rate", value: `${rate}%`, icon: TrendingUp, tone: "text-info" },
  ];

  const perSubject = subjects.map((s) => {
    const subjectTasks = tasks.filter((t) => t.subjectId === s.id);
    const done = subjectTasks.filter((t) => t.status === "completed").length;
    return {
      ...s,
      total: subjectTasks.length,
      done,
      pct: subjectTasks.length === 0 ? 0 : Math.round((done / subjectTasks.length) * 100),
    };
  });

  return (
    <AppShell
      title="Dashboard"
      description="Your study snapshot for this week"
      actions={
        <Button size="sm" asChild>
          <Link to="/tasks">
            <Plus className="mr-1.5 h-4 w-4" />
            New task
          </Link>
        </Button>
      }
    >
      <div className="space-y-6">
        <Card className="border-border/70 bg-surface shadow-none">
          <CardHeader>
            <CardTitle className="text-xl">
              Welcome back, {profile.fullName.split(" ")[0]} 👋
            </CardTitle>
            <CardDescription>
              You have {pending} task{pending === 1 ? "" : "s"} still open across {subjects.length}{" "}
              subjects. Keep going — you're {rate}% through your plan.
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => (
            <Card key={s.label}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription>{s.label}</CardDescription>
                  <s.icon className={`h-4 w-4 ${s.tone}`} />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-3xl font-semibold">{s.value}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-base">Recent Tasks</CardTitle>
              <CardDescription>Nearest due dates that still need work.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <>
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                </>
              ) : recent.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-8 text-center">
                  <p className="text-sm font-medium">All caught up</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    No pending tasks. Add a new one to keep the momentum.
                  </p>
                  <Button size="sm" variant="outline" className="mt-4" asChild>
                    <Link to="/tasks">Go to Study Tasks</Link>
                  </Button>
                </div>
              ) : (
                recent.map((t) => (
                  <div
                    key={t.id}
                    className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{t.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {subjects.find((s) => s.id === t.subjectId)?.name ?? "No subject"} · due{" "}
                        {formatDate(t.dueDate)}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <PriorityBadge priority={t.priority} />
                      <StatusBadge status={t.status} />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Study Progress</CardTitle>
                <CardDescription>Completion by subject.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </>
                ) : perSubject.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No subjects yet — add one to see progress.
                  </p>
                ) : (
                  perSubject.map((s) => (
                    <div key={s.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="truncate pr-2 font-medium">{s.name}</span>
                        <span className="shrink-0 text-muted-foreground">
                          {s.done}/{s.total}
                        </span>
                      </div>
                      <Progress value={s.pct} />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                <Button variant="outline" className="justify-start" asChild>
                  <Link to="/tasks">
                    <Plus className="mr-2 h-4 w-4" /> Add study task
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link to="/subjects">
                    <BookOpen className="mr-2 h-4 w-4" /> Manage subjects
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link to="/tasks" search={{}}>
                    <ListChecks className="mr-2 h-4 w-4" /> Review all tasks
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
