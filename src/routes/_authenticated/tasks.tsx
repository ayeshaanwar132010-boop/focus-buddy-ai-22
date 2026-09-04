import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Check, ListChecks, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { PriorityBadge, StatusBadge } from "@/components/StatusBadge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  formatDate,
  type StudyTask,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/study-data";
import { useStudy } from "@/lib/study-store";

export const Route = createFileRoute("/_authenticated/tasks")({
  head: () => ({
    meta: [
      { title: "Study Tasks — AI Study Focus" },
      {
        name: "description",
        content:
          "Search, filter and sort your study tasks by subject, status, priority and due date.",
      },
      { property: "og:title", content: "Study Tasks — AI Study Focus" },
      { property: "og:description", content: "Manage every study task in one list." },
    ],
  }),
  component: TasksPage,
});

type SortKey = "due-asc" | "due-desc" | "priority" | "title";

const emptyForm = {
  title: "",
  subject: "",
  description: "",
  status: "todo" as TaskStatus,
  priority: "medium" as TaskPriority,
  dueDate: "",
};

const priorityRank: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 };

const showDate = (iso: string) => (iso ? formatDate(iso) : "No due date");

function errorMessage(e: unknown) {
  return e instanceof Error ? e.message : "Something went wrong. Please try again.";
}

function TasksPage() {
  const {
    tasks,
    tasksLoading,
    tasksError,
    refreshTasks,
    subjects,
    addTask,
    updateTask,
    deleteTask,
    setTaskStatus,
  } = useStudy();

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed">("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | TaskPriority>("all");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("due-asc");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<StudyTask | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{
    title?: string | undefined;
    subject?: string | undefined;
    dueDate?: string | undefined;
  }>({});
  const [deleteTarget, setDeleteTarget] = useState<StudyTask | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const subjectOptions = useMemo(() => {
    const names = new Set<string>(subjects.map((s) => s.name));
    tasks.forEach((t) => t.subject && names.add(t.subject));
    return [...names].sort((a, b) => a.localeCompare(b));
  }, [subjects, tasks]);

  const visible = useMemo(() => {
    const filtered = tasks.filter((t) => {
      if (statusFilter === "completed" && t.status !== "completed") return false;
      if (statusFilter === "pending" && t.status === "completed") return false;
      if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
      if (subjectFilter !== "all" && t.subject !== subjectFilter) return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        if (
          !t.title.toLowerCase().includes(q) &&
          !t.subject.toLowerCase().includes(q) &&
          !(t.description ?? "").toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
    return [...filtered].sort((a, b) => {
      if (sort === "due-asc") return (a.dueDate || "9999").localeCompare(b.dueDate || "9999");
      if (sort === "due-desc") return (b.dueDate || "").localeCompare(a.dueDate || "");
      if (sort === "title") return a.title.localeCompare(b.title);
      return priorityRank[a.priority] - priorityRank[b.priority];
    });
  }, [tasks, statusFilter, priorityFilter, subjectFilter, query, sort]);

  const hasFilters =
    query.trim() !== "" ||
    statusFilter !== "all" ||
    priorityFilter !== "all" ||
    subjectFilter !== "all" ||
    sort !== "due-asc";

  const chips: { key: string; label: string; clear: () => void }[] = [];
  if (query.trim())
    chips.push({ key: "q", label: `Search: “${query.trim()}”`, clear: () => setQuery("") });
  if (statusFilter !== "all")
    chips.push({
      key: "status",
      label: statusFilter === "pending" ? "Status: Pending" : "Status: Completed",
      clear: () => setStatusFilter("all"),
    });
  if (subjectFilter !== "all")
    chips.push({
      key: "subject",
      label: `Subject: ${subjectFilter}`,
      clear: () => setSubjectFilter("all"),
    });
  if (priorityFilter !== "all")
    chips.push({
      key: "priority",
      label: `Priority: ${priorityFilter}`,
      clear: () => setPriorityFilter("all"),
    });
  if (sort !== "due-asc")
    chips.push({
      key: "sort",
      label:
        sort === "due-desc"
          ? "Sort: Due date (newest)"
          : sort === "title"
            ? "Sort: Title (A–Z)"
            : "Sort: Priority",
      clear: () => setSort("due-asc"),
    });

  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyForm, subject: subjects[0]?.name ?? "" });
    setErrors({});
    setDialogOpen(true);
  };

  const openEdit = (task: StudyTask) => {
    setEditing(task);
    setForm({
      title: task.title,
      subject: task.subject,
      description: task.description ?? "",
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
    });
    setErrors({});
    setDialogOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    const next: typeof errors = {};
    if (!form.title.trim()) next.title = "Task title is required.";
    else if (form.title.trim().length > 120) next.title = "Keep the title under 120 characters.";
    if (!form.subject.trim()) next.subject = "Choose a subject for this task.";
    if (!form.dueDate) next.dueDate = "A due date is required.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const payload = {
      title: form.title.trim(),
      subject: form.subject,
      description: form.description.trim(),
      status: form.status,
      priority: form.priority,
      dueDate: form.dueDate,
    };

    setSaving(true);
    try {
      if (editing) {
        await updateTask(editing.id, payload);
        toast.success("Task updated");
      } else {
        await addTask(payload);
        toast.success("Task added");
      }
      await refreshTasks();
      setDialogOpen(false);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    try {
      await deleteTask(deleteTarget.id);
      toast.success("Task deleted");
      await refreshTasks();
      setDeleteTarget(null);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const complete = async (task: StudyTask) => {
    if (busyId) return;
    setBusyId(task.id);
    try {
      await setTaskStatus(task.id, "completed");
      toast.success("Task completed");
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const resetFilters = () => {
    setQuery("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setSubjectFilter("all");
    setSort("due-asc");
  };

  return (
    <AppShell
      title="Study Tasks"
      description="Search, filter and sort everything on your plate"
      actions={
        <Button size="sm" onClick={openAdd}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Task
        </Button>
      }
    >
      <div className="space-y-5">
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <div className="relative sm:col-span-2 xl:col-span-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search tasks or subjects…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All subjects</SelectItem>
                  {subjectOptions.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as typeof priorityFilter)}>
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="due-asc">Due date — oldest first</SelectItem>
                  <SelectItem value="due-desc">Due date — newest first</SelectItem>
                  <SelectItem value="priority">Priority (high first)</SelectItem>
                  <SelectItem value="title">Title (A–Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {visible.length} {visible.length === 1 ? "task" : "tasks"} found
                </span>
                {chips.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={chip.clear}
                    className="inline-flex max-w-full items-center gap-1 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <span className="truncate">{chip.label}</span>
                    <X className="h-3 w-3 shrink-0" />
                  </button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="sm:shrink-0"
                disabled={!hasFilters}
                onClick={resetFilters}
              >
                Reset filters
              </Button>
            </div>
          </CardContent>
        </Card>


        <Card>
          <CardContent className="p-0">
            {tasksLoading ? (
              <div className="space-y-3 p-4 sm:p-6">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                ))}
              </div>
            ) : tasksError ? (
              <div className="p-8 text-center sm:p-12">
                <AlertTriangle className="mx-auto h-8 w-8 text-destructive" />
                <p className="mt-3 font-medium">We couldn’t load your tasks</p>
                <p className="mt-1 break-words text-sm text-muted-foreground">{tasksError}</p>
                <Button className="mt-5" variant="outline" onClick={() => void refreshTasks()}>
                  Try again
                </Button>
              </div>
            ) : visible.length === 0 ? (
              <div className="p-8 text-center sm:p-12">
                <ListChecks className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-3 font-medium">
                  {hasFilters ? "No tasks match your filters" : "No study tasks yet"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {hasFilters
                    ? "Try clearing the search and filters, or add a new study task."
                    : "Add your first task and it will be saved to your account."}
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {hasFilters ? (
                    <Button variant="outline" onClick={resetFilters}>
                      Clear filters
                    </Button>
                  ) : null}
                  <Button onClick={openAdd}>
                    <Plus className="mr-1.5 h-4 w-4" /> Add Task
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <ul className="divide-y divide-border md:hidden">
                  {visible.map((t) => (
                    <li key={t.id} className="space-y-3 p-4">
                      <div>
                        <p className="break-words text-sm font-medium">{t.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {t.subject || "Unassigned"} · {showDate(t.dueDate)}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={t.status} />
                        <PriorityBadge priority={t.priority} />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={t.status === "completed" || busyId === t.id}
                          onClick={() => void complete(t)}
                        >
                          <Check className="mr-1.5 h-3.5 w-3.5 text-success" /> Complete
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => openEdit(t)}>
                          <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(t)}>
                          <Trash2 className="mr-1.5 h-3.5 w-3.5 text-destructive" /> Delete
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="hidden overflow-x-auto md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Due date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visible.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="max-w-[18rem] font-medium">{t.title}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {t.subject || "Unassigned"}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={t.status} />
                        </TableCell>
                        <TableCell>
                          <PriorityBadge priority={t.priority} />
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {showDate(t.dueDate)}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Mark complete"
                              disabled={t.status === "completed" || busyId === t.id}
                              onClick={() => void complete(t)}
                            >
                              <Check className="h-4 w-4 text-success" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Edit task"
                              onClick={() => openEdit(t)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Delete task"
                              onClick={() => setDeleteTarget(t)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(o) => !saving && setDialogOpen(o)}>
        <DialogContent>
          <form onSubmit={submit}>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit task" : "Add study task"}</DialogTitle>
              <DialogDescription>
                Give the task a title, subject, due date and priority.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label className={errors.title ? "text-destructive" : undefined}>Title</Label>
                <Input
                  value={form.title}
                  placeholder="e.g. Revise SDLC models"
                  onChange={(e) => {
                    setForm((p) => ({ ...p, title: e.target.value }));
                    setErrors((p) => ({ ...p, title: undefined }));
                  }}
                />
                {errors.title ? (
                  <p className="text-xs font-medium text-destructive">{errors.title}</p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label className={errors.subject ? "text-destructive" : undefined}>Subject</Label>
                <Select
                  value={form.subject}
                  onValueChange={(v) => {
                    setForm((p) => ({ ...p, subject: v }));
                    setErrors((p) => ({ ...p, subject: undefined }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjectOptions.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.subject ? (
                  <p className="text-xs font-medium text-destructive">{errors.subject}</p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label>Notes (optional)</Label>
                <Textarea
                  rows={3}
                  value={form.description}
                  placeholder="What exactly needs to be done?"
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(v) => setForm((p) => ({ ...p, status: v as TaskStatus }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To do</SelectItem>
                      <SelectItem value="in-progress">In progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Priority</Label>
                  <Select
                    value={form.priority}
                    onValueChange={(v) => setForm((p) => ({ ...p, priority: v as TaskPriority }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className={errors.dueDate ? "text-destructive" : undefined}>Due date</Label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, dueDate: e.target.value }));
                    setErrors((p) => ({ ...p, dueDate: undefined }));
                  }}
                />
                {errors.dueDate ? (
                  <p className="text-xs font-medium text-destructive">{errors.dueDate}</p>
                ) : null}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={saving}
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
                {editing ? "Save changes" : "Add task"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && !deleting && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this task?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deleteTarget?.title}” will be permanently removed from your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(e) => {
                e.preventDefault();
                void confirmDelete();
              }}
            >
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
