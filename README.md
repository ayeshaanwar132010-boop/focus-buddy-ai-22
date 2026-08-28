# AI Study Focus

A student-focused study planner for **SDLC Project — Assignment 1**. It lets a student organize
subjects, manage study tasks with due dates and priorities, and track completion progress on a
clean dashboard — all driven by **realistic static mock data and temporary frontend state**.

> **Stage:** Frontend skeleton only. No backend, database, Supabase, or external API is used at
> this stage. Authentication and persistence are mocked in memory and reset on refresh.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Pages & Routes](#pages--routes)
- [Data Model & Mock Data](#data-model--mock-data)
- [State Management](#state-management)
- [Responsiveness](#responsiveness)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [What's Intentionally Out of Scope](#whats-intentionally-out-of-scope)

---

## Features

- **Landing Page** with hero, feature highlights, and clear calls to action.
- **Sign Up** with client-side validation (name length, email format, password complexity, and
  confirm-password match).
- **Sign In** with a mocked temporary session.
- **Dashboard** with four stat cards (Total / Completed / Pending / Completion Rate), a recent
  tasks list, and per-subject progress bars.
- **Subjects** with full CRUD — add, edit, and delete via dialogs, each card showing its live task
  count.
- **Study Tasks** with search, status tabs, priority/subject filters, sorting, and a responsive
  table (desktop) / card list (mobile). Mark-complete, edit, and delete are all supported.
- **Profile** with an editable student info form and a study summary.
- **Empty states** on Dashboard, Subjects, and Tasks; **confirm dialogs** on every delete action.
- **Responsive navigation** — fixed sidebar on desktop, slide-in drawer on mobile.

---

## Tech Stack

| Concern        | Choice                                            |
| -------------- | ------------------------------------------------- |
| Framework      | TanStack Start v1 (React 19, SSR/SSG-ready)        |
| Build tool     | Vite 8                                            |
| Styling        | Tailwind CSS v4 (semantic design tokens, no `tailwind.config.js`) |
| UI components  | shadcn/ui primitives on Radix UI + Lucide icons   |
| Notifications  | Sonner (toasts)                                   |
| State          | React Context (`StudyProvider`) — in-memory only  |
| TypeScript     | Strict, across the whole project                   |

---

## Pages & Routes

All routes are file-based under `src/routes/` and use TanStack Router. Every page has its own
`head()` metadata (title, description, Open Graph tags).

| Route        | File                       | Description                                                         |
| ------------ | -------------------------- | ------------------------------------------------------------------ |
| `/`          | `src/routes/index.tsx`     | Landing page — hero, feature cards, CTAs to Sign Up / Sign In.     |
| `/signup`    | `src/routes/signup.tsx`    | Account creation with full client-side validation.                 |
| `/signin`    | `src/routes/signin.tsx`    | Mock sign-in that sets a temporary in-memory session.             |
| `/dashboard` | `src/routes/dashboard.tsx` | Stat cards, recent pending tasks, and per-subject progress bars.  |
| `/subjects`  | `src/routes/subjects.tsx`  | Subject CRUD with add/edit dialogs and delete confirmation.       |
| `/tasks`     | `src/routes/tasks.tsx`     | Task list with search, filter, sort, status tabs, and CRUD.       |
| `/profile`   | `src/routes/profile.tsx`   | Editable student profile + study summary card.                    |

Unknown paths render the **404 Not Found** page — there are no dead links or blank screens.

---

## Data Model & Mock Data

Defined in `src/lib/study-data.ts`:

```ts
type TaskStatus   = "todo" | "in-progress" | "completed";
type TaskPriority = "low" | "medium" | "high";

interface Subject {
  id: string;
  name: string;
  description: string;
}

interface StudyTask {
  id: string;
  title: string;
  subjectId: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string; // ISO date, e.g. "2026-09-02"
}

interface StudentProfile {
  fullName: string;
  email: string;
  program: string;
}
```

Seed data ships with **5 subjects** and **12 study tasks** spanning realistic courses
(Software Engineering, Data Structures, Database Systems, Operating Systems, Linear Algebra)
with a mix of statuses, priorities, and due dates — enough to exercise every filter, sort, and
dashboard metric out of the box.

---

## State Management

All state lives in `src/lib/study-store.tsx` via a React Context provider (`StudyProvider`),
wrapped around the app in `src/routes/__root.tsx`.

The store exposes:

- `profile` + `updateProfile`
- `subjects` + `addSubject` / `updateSubject` / `deleteSubject` / `taskCountBySubject`
- `tasks` + `addTask` / `updateTask` / `deleteTask` / `setTaskStatus`
- `signedIn` + `signIn` / `signOut`

Deleting a subject also removes its tasks. IDs are generated with a simple in-memory counter.
**Nothing is persisted** — state resets when the page reloads, which is intentional for this
frontend-only stage.

---

## Responsiveness

The layout is built around an `AppShell` (`src/components/AppShell.tsx`):

- **Desktop (≥ `lg`):** fixed 256px sidebar with navigation and the signed-in profile footer.
- **Tablet & mobile (< `lg`):** top header with a hamburger that opens a slide-in `Sheet` drawer
  containing the same navigation.

Page-level responsive choices:

- Dashboard stat cards: 1 → 2 → 4 columns.
- Subjects grid: 1 → 2 → 3 columns.
- Tasks: a `<Table>` on desktop, a stacked card list on mobile; filter controls reflow into a
  responsive grid.
- Auth forms are single-column and centered.
- Dialogs and confirm dialogs scroll internally and stack their footer buttons on narrow screens.

---

## Getting Started

```sh
git clone <this-repository-url>
cd <repository-name>
npm install
npm run dev
```

Then open the local URL printed by Vite (default `http://localhost:8080`).

### Scripts

| Script             | Purpose                              |
| ------------------ | ----------------------------------- |
| `npm run dev`      | Start the dev server with HMR.       |
| `npm run build`    | Production build.                    |
| `npm run build:dev`| Development build.                   |
| `npm run preview`  | Preview the production build.        |
| `npm run lint`     | Run ESLint.                          |
| `npm run format`   | Format with Prettier.               |

---

## Project Structure

```text
src/
├── components/
│   ├── AppShell.tsx          # Sidebar + mobile drawer layout
│   ├── StatusBadge.tsx       # Reusable status & priority badges
│   └── ui/                   # shadcn/ui primitives (button, card, dialog, table, …)
├── lib/
│   ├── study-data.ts         # Types, mock data, and label/format helpers
│   ├── study-store.tsx       # React Context provider (in-memory state)
│   └── utils.ts              # cn() class merge helper
├── routes/
│   ├── __root.tsx            # Root layout, providers (QueryClient, StudyProvider, Toaster)
│   ├── index.tsx             # Landing page          → /
│   ├── signin.tsx            # Sign in               → /signin
│   ├── signup.tsx            # Sign up               → /signup
│   ├── dashboard.tsx         # Dashboard             → /dashboard
│   ├── subjects.tsx          # Subjects CRUD         → /subjects
│   ├── tasks.tsx             # Study Tasks CRUD      → /tasks
│   └── profile.tsx           # Profile               → /profile
├── styles.css                # Tailwind v4 theme tokens (colors, fonts, status tokens)
└── router.tsx               # TanStack Router setup
```

---

## What's Intentionally Out of Scope

This is **Assignment 1 — frontend skeleton**. The following are deliberately **not** implemented
and will be added in later assignments:

- No backend or server-side logic.
- No Supabase or other database.
- No real authentication or session persistence.
- No external API calls.
- No `localStorage` / `sessionStorage` persistence.

All data is static mock data held in temporary React state, exactly as required for this stage.
