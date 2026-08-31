export type TaskStatus = "todo" | "in-progress" | "completed";
export type TaskPriority = "low" | "medium" | "high";

export interface Subject {
  id: string;
  name: string;
  description: string;
}

export interface StudyTask {
  id: string;
  title: string;
  subject: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
}

export interface StudentProfile {
  fullName: string;
  email: string;
  program: string;
}

export const mockProfile: StudentProfile = {
  fullName: "Ayesha Anwar",
  email: "ayesha.anwar@university.edu",
  program: "BS Software Engineering — Semester 5",
};

export const mockSubjects: Subject[] = [
  { id: "s1", name: "Software Engineering", description: "SDLC models, requirements engineering, and documentation." },
  { id: "s2", name: "Data Structures", description: "Trees, graphs, hashing and complexity analysis." },
  { id: "s3", name: "Database Systems", description: "Relational modelling, SQL, normalization and indexing." },
  { id: "s4", name: "Operating Systems", description: "Processes, scheduling, memory management, file systems." },
  { id: "s5", name: "Linear Algebra", description: "Matrices, vector spaces, eigenvalues and applications." },
];


export const statusLabels: Record<TaskStatus, string> = {
  todo: "To do",
  "in-progress": "In progress",
  completed: "Completed",
};

export const priorityLabels: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export function formatDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
