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
  subjectId: string;
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

export const mockTasks: StudyTask[] = [
  { id: "t1", title: "Write Assignment 1 SRS document", subjectId: "s1", status: "in-progress", priority: "high", dueDate: "2026-09-02" },
  { id: "t2", title: "Revise SDLC models for quiz", subjectId: "s1", status: "todo", priority: "medium", dueDate: "2026-09-05" },
  { id: "t3", title: "Implement AVL tree rotations", subjectId: "s2", status: "completed", priority: "high", dueDate: "2026-08-20" },
  { id: "t4", title: "Solve graph traversal problem set", subjectId: "s2", status: "todo", priority: "medium", dueDate: "2026-08-29" },
  { id: "t5", title: "Practice complexity proofs", subjectId: "s2", status: "completed", priority: "low", dueDate: "2026-08-18" },
  { id: "t6", title: "Normalize library schema to 3NF", subjectId: "s3", status: "in-progress", priority: "high", dueDate: "2026-08-27" },
  { id: "t7", title: "SQL joins lab exercises", subjectId: "s3", status: "completed", priority: "medium", dueDate: "2026-08-15" },
  { id: "t8", title: "Read chapter on indexing", subjectId: "s3", status: "todo", priority: "low", dueDate: "2026-09-08" },
  { id: "t9", title: "CPU scheduling numericals", subjectId: "s4", status: "todo", priority: "high", dueDate: "2026-08-26" },
  { id: "t10", title: "Summarize paging vs segmentation", subjectId: "s4", status: "completed", priority: "medium", dueDate: "2026-08-14" },
  { id: "t11", title: "Eigenvalue practice sheet", subjectId: "s5", status: "todo", priority: "medium", dueDate: "2026-09-01" },
  { id: "t12", title: "Matrix decomposition notes", subjectId: "s5", status: "completed", priority: "low", dueDate: "2026-08-12" },
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
