import { createFileRoute } from "@tanstack/react-router";
import { Check, ListChecks, Pencil, Plus, Search, Trash2 } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  formatDate,
  type StudyTask,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/study-data";
import { useStudy } from "@/lib/study-store";

export const Route = createFileRoute("/tasks")({
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
  subjectId: "",
  status: "todo" as TaskStatus,
  priority: "medium" as TaskPriority,
  dueDate: "",
};

const priorityRank: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 };

function TasksPage() {
  const { tasks, subjects, addTask, updateTask, deleteTask, setTaskStatus } = useStudy();

  const [query, setQuery] = useState("");
  const [statusTab, setStatusTab] = useState<"all" | TaskStatus>("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | TaskPriority>("all");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("due-asc");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<StudyTask | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<{
    title?: string | undefined;
    subjectId?: string | undefined;
    dueDate?: string | undefined;
  }>({});
  const [deleteTarget, setDeleteTarget] = useState<StudyTask | null>(null);

  const subjectName = (id: string) => subjects.find((s) => s.id === id)?.name ?? "Unassigned";

  const visible = useMemo(() => {
    const filtered = tasks.filter((t) => {
      if (statusTab !== "all" && t.status !== statusTab) return false;
      if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
      if (subjectFilter !== "all" && t.subjectId !== subjectFilter) return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        if (!t.title.toLowerCase().includes(q) && !subjectName(t.subjectId).toLowerCase().includes(q))
          return false;
      }
      return true;
    });
    return filtered.sort((a, b) => {
      if (sort === "due-asc") return a.dueDate.localeCompare(b.dueDate);
      if (sort === "due-desc") return b.dueDate.localeCompare(a.dueDate);
      if (sort === "title") return a.title.localeCompare(b.title);
      return priorityRank[a.priority] - priorityRank[b.priority];
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, subjects, statusTab, priorityFilter, subjectFilter, query, sort]);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyForm, subjectId: subjects[0]?.id ?? "" });
    setErrors({});
    setDialogOpen(true);
  };

  const openEdit = (task: StudyTask) => {
    setEditing(task);
    setForm({
      title: task.title,
      subjectId: task.subjectId,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
    });
    setErrors({});
    setDialogOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!form.title.trim()) next.title = "Task title is required.";
    else if (form.title.trim().length > 120) next.title = "Keep the title under 120 characters.";
    if (!form.subjectId) next.subjectId = "Choose a subject for this task.";
    if (!form.dueDate) next.dueDate = "A due date is required.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const payload = {
      title: form.title.trim(),
      subjectId: form.subjectId,
      status: form.status,
      priority: form.priority,
      dueDate: form.dueDate,
    };
    if (editing) {
      updateTask(editing.id, payload);
      toast.success("Task updated");
    } else {
      addTask(payload);
      toast.success("Task added");
    }
    setDialogOpen(false);
  };

  const resetFilters = () => {
    setQuery("");
    setStatusTab("all");
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
        <Tabs value={statusTab} onValueChange={(v) => setStatusTab(v as typeof statusTab)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="todo">To do</TabsTrigger>
            <TabsTrigger value="in-progress">In progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>

        <Card>
          <CardContent className="grid gap-3 pt-6 md:grid-cols-2 xl:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search tasks or subjects…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
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
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All subjects</SelectItem>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="due-asc">Due date (earliest)</SelectItem>
                <SelectItem value="due-desc">Due date (latest)</SelectItem>
                <SelectItem value="priority">Priority (high first)</SelectItem>
                <SelectItem value="title">Title (A–Z)</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            {visible.length === 0 ? (
              <div className="p-12 text-center">
                <ListChecks className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-3 font-medium">No tasks match your filters</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try clearing the search and filters, or add a new study task.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <Button variant="outline" onClick={resetFilters}>
                    Clear filters
                  </Button>
                  <Button onClick={openAdd}>
                    <Plus className="mr-1.5 h-4 w-4" /> Add Task
                  </Button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
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
                          {subjectName(t.subjectId)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={t.status} />
                        </TableCell>
                        <TableCell>
                          <PriorityBadge priority={t.priority} />
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {formatDate(t.dueDate)}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Mark complete"
                              disabled={t.status === "completed"}
                              onClick={() => {
                                setTaskStatus(t.id, "completed");
                                toast.success("Task completed");
                              }}
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
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
                <Label className={errors.subjectId ? "text-destructive" : undefined}>Subject</Label>
                <Select
                  value={form.subjectId}
                  onValueChange={(v) => {
                    setForm((p) => ({ ...p, subjectId: v }));
                    setErrors((p) => ({ ...p, subjectId: undefined }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.subjectId ? (
                  <p className="text-xs font-medium text-destructive">{errors.subjectId}</p>
                ) : null}
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
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editing ? "Save changes" : "Add task"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteTarget !== null} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this task?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deleteTarget?.title}” will be removed from this demo session.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) {
                  deleteTask(deleteTarget.id);
                  toast.success("Task deleted");
                }
                setDeleteTarget(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
