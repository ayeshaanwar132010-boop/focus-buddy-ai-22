import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
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
  updateProfile: (p: Partial<StudentProfile>) => void;
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
  signedIn: boolean;
  signIn: (email: string) => void;
  signOut: () => void;
}

const StudyContext = createContext<StudyStore | null>(null);

let counter = 100;
const nextId = (prefix: string) => `${prefix}${++counter}`;

export function StudyProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<StudentProfile>(mockProfile);
  const [subjects, setSubjects] = useState<Subject[]>(mockSubjects);
  const [tasks, setTasks] = useState<StudyTask[]>(mockTasks);
  const [signedIn, setSignedIn] = useState(true);

  const value = useMemo<StudyStore>(
    () => ({
      profile,
      updateProfile: (p) => setProfile((prev) => ({ ...prev, ...p })),
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
      signedIn,
      signIn: (email) => {
        setSignedIn(true);
        setProfile((prev) => ({ ...prev, email }));
      },
      signOut: () => setSignedIn(false),
    }),
    [profile, subjects, tasks, signedIn],
  );

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
}

export function useStudy() {
  const ctx = useContext(StudyContext);
  if (!ctx) throw new Error("useStudy must be used inside StudyProvider");
  return ctx;
}
