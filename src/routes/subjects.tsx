import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import type { Subject } from "@/lib/study-data";
import { useStudy } from "@/lib/study-store";

export const Route = createFileRoute("/subjects")({
  head: () => ({
    meta: [
      { title: "Subjects — AI Study Focus" },
      {
        name: "description",
        content: "Add, edit and remove the subjects you are studying this semester.",
      },
      { property: "og:title", content: "Subjects — AI Study Focus" },
      { property: "og:description", content: "Organize every course in one place." },
    ],
  }),
  component: Subjects,
});

function Subjects() {
  const { subjects, addSubject, updateSubject, deleteSubject, taskCountBySubject } = useStudy();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Subject | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Subject | null>(null);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", description: "" });
    setError(null);
    setDialogOpen(true);
  };

  const openEdit = (subject: Subject) => {
    setEditing(subject);
    setForm({ name: subject.name, description: subject.description });
    setError(null);
    setDialogOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Subject name is required.");
      return;
    }
    if (form.name.trim().length > 60) {
      setError("Subject name must be 60 characters or fewer.");
      return;
    }
    const payload = { name: form.name.trim(), description: form.description.trim() };
    if (editing) {
      updateSubject(editing.id, payload);
      toast.success("Subject updated");
    } else {
      addSubject(payload);
      toast.success("Subject added");
    }
    setDialogOpen(false);
  };

  return (
    <AppShell
      title="Subjects"
      description="Every course you are tracking this semester"
      actions={
        <Button size="sm" onClick={openAdd}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Subject
        </Button>
      }
    >
      {subjects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center sm:p-12">
          <BookOpen className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 font-medium">No subjects yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add your first subject to start planning study tasks.
          </p>
          <Button className="mt-5" onClick={openAdd}>
            <Plus className="mr-1.5 h-4 w-4" /> Add Subject
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {subjects.map((subject) => (
            <Card key={subject.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="min-w-0 break-words text-base">{subject.name}</CardTitle>
                  <Badge variant="secondary" className="shrink-0 whitespace-nowrap">{taskCountBySubject(subject.id)} tasks</Badge>
                </div>
                <CardDescription>
                  {subject.description || "No description added yet."}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => openEdit(subject)}>
                  <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(subject)}>
                  <Trash2 className="mr-1.5 h-3.5 w-3.5 text-destructive" /> Delete
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <form onSubmit={submit}>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit subject" : "Add subject"}</DialogTitle>
              <DialogDescription>
                {editing
                  ? "Update the subject details below."
                  : "Give the subject a name and a short description."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label className={error ? "text-destructive" : undefined}>Subject name</Label>
                <Input
                  value={form.name}
                  placeholder="e.g. Software Engineering"
                  onChange={(e) => {
                    setForm((p) => ({ ...p, name: e.target.value }));
                    setError(null);
                  }}
                />
                {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea
                  rows={3}
                  value={form.description}
                  placeholder="What does this subject cover?"
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editing ? "Save changes" : "Add subject"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteTarget !== null} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{deleteTarget?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              This also removes its study tasks from this demo session. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) {
                  deleteSubject(deleteTarget.id);
                  toast.success("Subject deleted");
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
