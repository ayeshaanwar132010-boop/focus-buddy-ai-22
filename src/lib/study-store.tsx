import type { Session, User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { supabase } from "@/integrations/supabase/client";
import {
  mockProfile,
  mockSubjects,
  mockTasks,
  type StudentProfile,
  type StudyTask,
  type Subject,
  type TaskStatus,
} from "./study-data";

interface StudyStore {
  profile: StudentProfile;
  updateProfile: (p: Partial<StudentProfile>) => Promise<void>;
  subjects: Subject[];
  addSubject: (s: Omit<Subject, "id">) => void;
  updateSubject: (id: string, s: Omit<Subject, "id">) => void;
  deleteSubject: (id: string) => void;
  tasks: StudyTask[];
  addTask: (t: Omit<StudyTask, "id">) => void;
  updateTask: (id: string, t: Omit<StudyTask, "id">) => void;
  deleteTask: (id: string) => void;
  setTaskStatus: (id: string, status: TaskStatus) => void;
  taskCountBySubject: (subjectId: string) => number;
  user: User | null;
  loadingAuth: boolean;
  signedIn: boolean;
  signOut: () => Promise<void>;
}

const StudyContext = createContext<StudyStore | null>(null);

let counter = 100;
const nextId = (prefix: string) => `${prefix}${++counter}`;

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
  const [tasks, setTasks] = useState<StudyTask[]>(mockTasks);

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
  const profile = useMemo(() => profileFromUser(user), [user]);

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
      deleteSubject: (id) => {
        setSubjects((prev) => prev.filter((item) => item.id !== id));
        setTasks((prev) => prev.filter((t) => t.subjectId !== id));
      },
      tasks,
      addTask: (t) => setTasks((prev) => [...prev, { ...t, id: nextId("t") }]),
      updateTask: (id, t) => setTasks((prev) => prev.map((item) => (item.id === id ? { ...item, ...t } : item))),
      deleteTask: (id) => setTasks((prev) => prev.filter((item) => item.id !== id)),
      setTaskStatus: (id, status) =>
        setTasks((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item))),
      taskCountBySubject: (subjectId) => tasks.filter((t) => t.subjectId === subjectId).length,
      user,
      loadingAuth,
      signedIn: !!user,
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [profile, subjects, tasks, user, loadingAuth],
  );

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
}

export function useStudy() {
  const ctx = useContext(StudyContext);
  if (!ctx) throw new Error("useStudy must be used inside StudyProvider");
  return ctx;
}
