import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, BookOpen, GraduationCap, ListChecks } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Study Focus — Organize Subjects & Track Study Progress" },
      {
        name: "description",
        content:
          "A simple study planner for students: organize subjects, manage study tasks and track completion progress on one clean dashboard.",
      },
      { property: "og:title", content: "AI Study Focus — Student Study Planner" },
      {
        property: "og:description",
        content: "Organize subjects, manage study tasks and track your study progress.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: BookOpen,
    title: "Organize subjects",
    body: "Keep every course in one place with a short description and its own task count.",
  },
  {
    icon: ListChecks,
    title: "Manage study tasks",
    body: "Add tasks with due dates, priorities and status, then filter, search and sort them.",
  },
  {
    icon: BarChart3,
    title: "Track progress",
    body: "See total, completed and pending tasks plus your completion rate at a glance.",
  },
];

function Landing() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="truncate font-display text-base font-semibold sm:text-lg">
              AI Study <span className="text-primary">Focus</span>
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {signedIn ? (
              <Button size="sm" asChild>
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
                  <Link to="/signin">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>

        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-24">
          <span className="inline-flex items-center rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
            SDLC Project · Assignment 1 · Frontend skeleton
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-3xl font-bold leading-tight sm:text-5xl">
            Organize your subjects, manage study tasks, and track your progress
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
            AI Study Focus gives students one calm workspace to plan every course, break studying
            into clear tasks with due dates and priorities, and see how much is actually done.
          </p>
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
              <Link to="/signin">Sign In</Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Demo build — explore the{" "}
            <Link to="/dashboard" className="font-medium text-primary underline-offset-4 hover:underline">
              dashboard
            </Link>{" "}
            with sample student data.
          </p>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <div className="grid gap-5 md:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title} className="border-border/70 shadow-sm">
                <CardHeader>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <f.icon className="h-5 w-5" />
                  </span>
                  <CardTitle className="mt-3 text-lg">{f.title}</CardTitle>
                  <CardDescription>{f.body}</CardDescription>
                </CardHeader>
                <CardContent />
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© 2026 AI Study Focus. Built for an SDLC course project.</p>
          <div className="flex gap-4">
            <Link to="/signin" className="hover:text-foreground">
              Sign In
            </Link>
            <Link to="/signup" className="hover:text-foreground">
              Sign Up
            </Link>
            <Link to="/dashboard" className="hover:text-foreground">
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
