# Study Companion

Create a responsive frontend-only web application called "AI Study Focus".

APP PURPOSE:

AI Study Focus helps students organize their subjects and study tasks, track task completion, and understand their study progress through a simple dashboard.

This is Assignment 1 of an SDLC project.

IMPORTANT:

For this stage, create ONLY the frontend skeleton.

Do not connect Supabase.

Do not implement real authentication.

Do not connect external APIs.

Do not use permanent localStorage.

Use realistic static mock data and temporary frontend state.

PAGES AND ROUTES:

1. Landing Page

2. Sign Up Page

3. Sign In Page

4. Dashboard

5. Subjects

6. Study Tasks

7. Profile

LANDING PAGE:

Create:

- Header

- AI Study Focus logo/name

- Hero section

- Short explanation of the application

- Three feature cards

- Get Started button

- Sign In button

- Footer

Hero message should clearly explain that the app helps students organize subjects, manage study tasks, and track progress.

SIGN UP PAGE:

Create a frontend-only registration form containing:

- Full Name

- Email

- Password

- Confirm Password

- Create Account button

Add basic frontend validation and useful error messages.

SIGN IN PAGE:

Create:

- Email

- Password

- Sign In button

- Link to Sign Up

Use temporary frontend behavior only.

DASHBOARD:

Create a student dashboard containing:

- Welcome message

- Total Tasks card

- Completed Tasks card

- Pending Tasks card

- Completion Rate card

- Recent Tasks section

- Quick action buttons

- Simple study progress visualization

Use realistic mock student study data.

SUBJECTS PAGE:

Create:

- Page title

- Add Subject button

- Subject cards/table

- Subject name

- Description

- Number of tasks

- Edit button

- Delete button

Add temporary frontend interactions for adding, editing, and deleting subjects.

STUDY TASKS PAGE:

Create:

- Task list/table

- Add Task button

- Search input

- Status filter

- Priority filter

- Subject filter

- Sorting control

Each task should show:

- Title

- Subject

- Status

- Priority

- Due date

- Edit

- Delete

- Complete action

Use realistic mock data.

PROFILE PAGE:

Create:

- Full name

- Email

- Edit Profile button

- Save button

Use temporary frontend state.

NAVIGATION:

Create consistent navigation between all pages.

Desktop:

- Sidebar navigation

Mobile:

- Responsive navigation menu/drawer

Navigation items:

- Dashboard

- Subjects

- Study Tasks

- Profile

- Sign Out

For the frontend-only stage, Sign Out can be a temporary UI interaction.

DESIGN:

Use a clean, modern, student-friendly design.

Use soft professional colors and good contrast.

Use consistent typography, spacing, buttons, cards, forms, tables, badges, and dialogs.

Do not make the interface overly decorative.

RESPONSIVENESS:

The application must work properly on:

- Desktop

- Tablet

- Mobile

INTERACTIONS:

Include temporary frontend interactions for:

- Tabs where useful

- Search

- Filters

- Sorting

- Add forms

- Edit forms

- Delete confirmation dialogs

- Status changes

STATES:

Include:

- Empty states

- Validation states

- Success messages

- Error messages

- Loading-style states where appropriate

IMPORTANT:

Every navigation route must work.

Do not create blank pages.

Do not create dead links.

Do not add backend functionality yet.

Build the application as a polished frontend skeleton that can later be connected to GitHub, Supabase Authentication, and a Supabase database.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://focus-buddy-ai-22.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4833e164-595d-488f-a91b-990207d81860).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
