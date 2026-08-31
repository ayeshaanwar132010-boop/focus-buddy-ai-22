import type { Session, User } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { supabase } from "@/integrations/supabase/client";
import {
  mockProfile,
  mockSubjects,
  type StudentProfile,
  type StudyTask,
  type Subject,
  type TaskPriority,
  type TaskStatus,
} from "./study-data";

export type TaskInput = Omit<StudyTask, "id">;

interface StudyStore {
  profile: StudentProfile;
  updateProfile: (p: Partial<StudentProfile>) => Promise<void>;
  subjects: Subject[];
  addSubject: (s: Omit<Subject, "id">) => void;
  updateSubject: (id: string, s: Omit<Subject, "id">) => void;
  deleteSubject: (id: string) => void;
  tasks: StudyTask[];
  tasksLoading: boolean;
  tasksError: string | null;
  refreshTasks: () => Promise<void>;
  addTask: (t: TaskInput) => Promise<void>;
  updateTask: (id: string, t: TaskInput) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  setTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
  taskCountBySubject: (subjectName: string) => number;
  user: User | null;
  loadingAuth: boolean;
  signedIn: boolean;
  signOut: () => Promise<void>;
}

const StudyContext = createContext<StudyStore | null>(null);

let counter = 100;
const nextId = (prefix: string) => `${prefix}${++counter}`;

type TaskRow = {
  id: string;
  title: string;
  subject: string | null;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
};

function rowToTask(row: TaskRow): StudyTask {
  return {
    id: row.id,
    title: row.title,
    subject: row.subject ?? "",
    description: row.description ?? "",
    status: (row.status as TaskStatus) ?? "todo",
    priority: (row.priority as TaskPriority) ?? "medium",
    dueDate: row.due_date ?? "",
  };
}

function taskToRow(t: TaskInput) {
  return {
    title: t.title,
    subject: t.subject,
    description: t.description ?? "",
    status: t.status,
    priority: t.priority,
    due_date: t.dueDate ? t.dueDate : null,
  };
}

function profileFromUser(user: User | null): StudentProfile {
  if (!user) return { fullName: "", email: "", program: "" };
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const fullName =
    (typeof meta['full_name'] === "string" && meta['full_name']) ||
    (typeof meta['name'] === "string" && meta['name']) ||
    user.email?.split("@")[0] ||
    "Student";
  const program =
    typeof meta['program'] === "string" && meta['program'] ? meta['program'] : mockProfile.program;
  return { fullName: fullName as string, email: user.email ?? "", program };
}

export function StudyProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>(mockSubjects);
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState<string | null>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoadingAuth(false);
    });
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoadingAuth(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const user = session?.user ?? null;
  const userId = user?.id ?? null;
  const profile = useMemo(() => profileFromUser(user), [user]);

  const refreshTasks = useCallback(async () => {
    if (!userId) {
      setTasks([]);
      setTasksLoading(false);
      return;
    }
    setTasksLoading(true);
    const { data, error } = await supabase
      .from("study_tasks")
      .select("id, title, subject, description, status, priority, due_date")
      .order("created_at", { ascending: false });
    if (error) {
      setTasksError(error.message);
      setTasks([]);
    } else {
      setTasksError(null);
      setTasks((data as TaskRow[]).map(rowToTask));
    }
    setTasksLoading(false);
  }, [userId]);

  useEffect(() => {
    void refreshTasks();
  }, [refreshTasks]);

  const value = useMemo<StudyStore>(
    () => ({
      profile,
      updateProfile: async (p) => {
        const data: Record<string, string> = {};
        if (p.fullName !== undefined) data['full_name'] = p.fullName;
        if (p.program !== undefined) data['program'] = p.program;
        const { error } = await supabase.auth.updateUser({
          ...(p.email !== undefined && p.email !== profile.email ? { email: p.email } : {}),
          data,
        });
        if (error) throw error;
      },
      subjects,
      addSubject: (s) => setSubjects((prev) => [...prev, { ...s, id: nextId("s") }]),
      updateSubject: (id, s) =>
        setSubjects((prev) => prev.map((item) => (item.id === id ? { ...item, ...s } : item))),
      deleteSubject: (id) => setSubjects((prev) => prev.filter((item) => item.id !== id)),
      tasks,
      tasksLoading,
      tasksError,
      refreshTasks,
      addTask: async (t) => {
        if (!userId) throw new Error("You need to be signed in to add a task.");
        const { data, error } = await supabase
          .from("study_tasks")
          .insert({ ...taskToRow(t), user_id: userId })
          .select("id, title, subject, description, status, priority, due_date")
          .single();
        if (error) throw error;
        setTasks((prev) => [rowToTask(data as TaskRow), ...prev]);
      },
      updateTask: async (id, t) => {
        const { data, error } = await supabase
          .from("study_tasks")
          .update(taskToRow(t))
          .eq("id", id)
          .select("id, title, subject, description, status, priority, due_date")
          .single();
        if (error) throw error;
        const updated = rowToTask(data as TaskRow);
        setTasks((prev) => prev.map((item) => (item.id === id ? updated : item)));
      },
      deleteTask: async (id) => {
        const { error } = await supabase.from("study_tasks").delete().eq("id", id);
        if (error) throw error;
        setTasks((prev) => prev.filter((item) => item.id !== id));
      },
      setTaskStatus: async (id, status) => {
        const { error } = await supabase.from("study_tasks").update({ status }).eq("id", id);
        if (error) throw error;
        setTasks((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
      },
      taskCountBySubject: (subjectName) => tasks.filter((t) => t.subject === subjectName).length,
      user,
      loadingAuth,
      signedIn: !!user,
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [profile, subjects, tasks, tasksLoading, tasksError, refreshTasks, user, userId, loadingAuth],
  );

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
}

export function useStudy() {
  const ctx = useContext(StudyContext);
  if (!ctx) throw new Error("useStudy must be used inside StudyProvider");
  return ctx;
}
