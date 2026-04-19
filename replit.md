# D-Tect Workspace

## Overview

D-Tect is a Definition & Terminology (DT) exam platform for academic use. It allows faculty (admins) to create, manage, and grade definition/terminology exams, and allows students to study resources and take exams using secret codes.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + TailwindCSS
- **State**: Zustand (role/auth state in localStorage)
- **Theme**: next-themes (light/dark mode)

## Artifacts

- `artifacts/api-server` — Express 5 API server (port auto-assigned, path: /api)
- `artifacts/d-tect` — React + Vite frontend (port auto-assigned, path: /)

## Key Features

- **Landing page** (`/`): D-Tect logo + role selection (Admin or Student)
- **Admin panel** (`/admin/*`): Dashboard stats, exam management (MCQ/Q&A), question editing, secret code generation, student performance grading, study resource management
- **Student panel** (`/student/*`): Study resources by exam, secret code entry to join exams, fullscreen exam mode, results view
- **Profile page** (`/profile`): Session info display
- **Light/dark mode**: Toggle in nav header, persisted to localStorage
- **Fullscreen exam enforcement**: Uses Fullscreen API, blocks exam if user exits fullscreen

## Roles / Auth

No credentials — user picks "Admin" or "Student" at the landing page. Role + student profile (name, roll number, department) stored in localStorage via Zustand.

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Database Schema

- `exams` — exam records (title, description, type: mcq|qa, status: draft|active|past, secretCode)
- `questions` — exam questions (examId, questionText, type, options array, correctAnswer, orderIndex)
- `students` — student records (name, rollNumber unique, department)
- `submissions` — exam submissions (examId, studentId, answers JSONB, score 0-5)
- `resources` — study resources (examId, title, content, type: note|link|pdf, url)

## API Routes

All under `/api`:
- `GET/POST /exams` — list/create exams
- `GET/PATCH/DELETE /exams/:id` — exam CRUD
- `POST /exams/:id/generate-code` — generate 6-char secret code
- `POST /exams/join` — join exam by code
- `GET/POST /questions` — list/create questions (by examId)
- `DELETE /questions/:id` — delete question
- `GET/POST /submissions` — list/create submissions
- `PATCH /submissions/:id/score` — assign score (0-5)
- `GET/POST /resources` — list/create resources
- `DELETE /resources/:id` — delete resource
- `GET/POST /students` — list/register students
- `GET /stats/overview` — dashboard stats
- `GET /stats/student-performance` — all student performance data

## Notes

- The orval codegen script patches `lib/api-zod/src/index.ts` after generation to avoid duplicate exports
- Do NOT change the OpenAPI info.title (it's "Api" — controls generated filenames)
