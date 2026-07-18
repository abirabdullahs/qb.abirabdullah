# PROGRESS.md — Question Bank Project Tracker

> **Rule:** Any AI agent or developer must read this file first, before
> starting any work. As soon as a task is completed, tick its checkbox
> `[x]` and update the **CURRENT STATUS** section — this file is the
> single source of truth for how far the project has progressed.

---

## 🔴 CURRENT STATUS (always read this first)

```
Last completed task  : REPO-02 (scaffold folder/file structure via GitHub Actions)
Currently in progress: none
Next task to start   : SETUP-01 (Initialize Next.js + TypeScript project)
Blocked on           : none
Last updated         : 2026-07-18
Updated by           : Abir (manual)
```

**The next agent should start from:** `SETUP-01`

---

## How to use this file (agent instructions)

1. Before starting work, read the **CURRENT STATUS** block.
2. Find the task ID listed under `Next task to start` below, and read its
   requirements and dependencies.
3. Check that all dependencies (if any) are already `[x]`. If not, do those
   first, or flag it.
4. Once the task is done:
   - Change that task's checkbox from `[ ]` to `[x]`
   - Update the **CURRENT STATUS** block (last completed, next task, date)
   - Add a one-line entry to the `## 📝 Change Log` section
5. If work gets blocked, write the reason under `Blocked on` and leave the
   task as `[ ]` — never mark an incomplete task as `[x]`.
6. Do not jump to another task before finishing the current one, unless
   explicitly marked as parallel-safe.

---

## 📦 Phase 0 — Foundation (done)

- [x] **REPO-01** — Design the SQL database schema (v2: academic +
      admission + cluster/centralized exam + LaTeX support) → `schema.sql`
- [x] **REPO-02** — Scaffold the folder/file structure in the GitHub repo
      (via GitHub Actions workflow, 119 placeholder files/folders)

---

## 📦 Phase 1 — Project Setup & Tooling

- [ ] **SETUP-01** — Initialize a Next.js (App Router) + TypeScript
      project, merged into the already-scaffolded folder structure
      - Dependency: REPO-02
- [ ] **SETUP-02** — Install core dependencies: Drizzle ORM, Zod,
      Auth.js/Better Auth, Tailwind CSS
      - Dependency: SETUP-01
- [ ] **SETUP-03** — Fill in `.env.example` (DATABASE_URL, AUTH_SECRET,
      STORAGE keys, etc. as placeholders)
      - Dependency: SETUP-02
- [ ] **SETUP-04** — Configure ESLint + Prettier + Husky pre-commit hook
      - Dependency: SETUP-01
- [ ] **SETUP-05** — Create the PostgreSQL database (UTF8 encoding),
      local or hosted
      - Dependency: none (can be done in parallel)

---

## 📦 Phase 2 — Database Layer (Drizzle Schema)

> Reference: `schema.sql` (in repo root) — every table must be converted
> into a Drizzle schema, keeping names and constraints identical.

- [ ] **DB-01** — `src/lib/db/client.ts` — Drizzle client + connection setup
      - Dependency: SETUP-02, SETUP-05
- [ ] **DB-02** — `src/lib/db/schema/academic.ts` — segments, groups,
      boards, subjects, subject_groups, chapters, topics, sub_topics
      - Dependency: DB-01
- [ ] **DB-03** — `src/lib/db/schema/admission.ts` — admission_segments,
      institutes, admission_exams, admission_units,
      admission_unit_institutes (with exam_type CHECK logic)
      - Dependency: DB-01
- [ ] **DB-04** — `src/lib/db/schema/questions.ts` — questions,
      question_options, question_sub_parts, question_boards
      - Dependency: DB-02, DB-03
- [ ] **DB-05** — `src/lib/db/schema/attachments.ts`, `tags.ts`,
      `question-sets.ts`, `stats.ts`, `users.ts`
      - Dependency: DB-04
- [ ] **DB-06** — `src/lib/db/schema/index.ts` — re-export all schemas
      - Dependency: DB-05
- [ ] **DB-07** — Configure `drizzle.config.ts` + generate and run the
      first migration
      - Dependency: DB-06
- [ ] **DB-08** — `db/seeds/` — script to load seed data (segments, boards,
      admission_segments) from the SQL seed section
      - Dependency: DB-07

---

## 📦 Phase 3 — Shared Infrastructure

- [ ] **LIB-01** — `src/components/ui/` — base components: Button, Input,
      Select, Dialog, Table, Badge, Card, Pagination, etc.
      - Dependency: SETUP-02
- [ ] **LIB-02** — `src/lib/http/api-response.ts`, `error-handler.ts` —
      standard API response envelope
      - Dependency: SETUP-01
- [ ] **LIB-03** — `src/lib/utils/` — cn, slugify, pagination helpers
      - Dependency: SETUP-01
- [ ] **LIB-04** — `src/lib/auth/` — Auth.js/Better Auth setup + role
      permission helper (admin/moderator/teacher/contributor)
      - Dependency: DB-05, SETUP-02
- [ ] **LIB-05** — `src/components/layout/` — Navbar, Sidebar,
      DashboardShell
      - Dependency: LIB-01

---

## 📦 Phase 4 — Content Domain (LaTeX/Rich Text)

- [ ] **CONTENT-01** — `RichTextEditor.tsx` + `MathEditor.tsx` — support
      for Bangla text mixed with inline LaTeX
      - Dependency: LIB-01
- [ ] **CONTENT-02** — `LatexRenderer.tsx` — render via KaTeX/MathJax,
      conditionally loaded based on the `has_math` flag
      - Dependency: CONTENT-01
- [ ] **CONTENT-03** — `detect-math.ts` — utility that auto-sets
      `has_math = true` when text contains `$...$` / `$$...$$`
      - Dependency: CONTENT-01

---

## 📦 Phase 5 — Academic Domain

- [ ] **ACAD-01** — `academic.repository.ts` — CRUD query functions for
      segments/groups/boards/subjects/chapters/topics
      - Dependency: DB-06
- [ ] **ACAD-02** — `academic.service.ts` — business logic (validation,
      duplicate name checks, cascade rules)
      - Dependency: ACAD-01
- [ ] **ACAD-03** — `academic.schema.ts` — zod validation schemas
      - Dependency: ACAD-01
- [ ] **ACAD-04** — `CurriculumTree.tsx` — subject → chapter → topic
      picker component
      - Dependency: ACAD-02, LIB-01
- [ ] **ACAD-05** — Dashboard pages: `taxonomy/subjects`, `chapters`,
      `topics` (list + create + edit)
      - Dependency: ACAD-04

---

## 📦 Phase 6 — Admission Domain

- [ ] **ADM-01** — `admission.repository.ts` — CRUD for institutes,
      admission_exams, admission_units, unit_institutes
      - Dependency: DB-06
- [ ] **ADM-02** — `admission.service.ts` — **critical**: exam_type
      branching logic (single_institute → institute required;
      cluster → units required; centralized → neither)
      - Dependency: ADM-01
- [ ] **ADM-03** — `admission.schema.ts` — zod `.refine()` to enforce
      exam_type rules
      - Dependency: ADM-01
- [ ] **ADM-04** — `ExamTypeSelector.tsx` + `ClusterUnitBuilder.tsx` +
      `InstituteSelector.tsx`
      - Dependency: ADM-02, LIB-01
- [ ] **ADM-05** — Dashboard pages: `admissions/exams`, `units`,
      `institutes`
      - Dependency: ADM-04

---

## 📦 Phase 7 — Question Domain (core, the largest phase)

- [ ] **Q-01** — `question.repository.ts` — base CRUD for the questions
      table
      - Dependency: DB-06
- [ ] **Q-02** — `duplicate-hash.ts` — generate a hash from normalized
      question_text
      - Dependency: Q-01
- [ ] **Q-03** — `question.schema.ts` — base fields + academic/admission
      branch validation (mirroring the CHECK constraints in schema.sql)
      - Dependency: Q-01
- [ ] **Q-04** — MCQ: `mcq.schema.ts`, `MCQEditor.tsx`, `MCQOptionList.tsx`
      (enforce min 2 – max 5 options, single/multi correct answer)
      - Dependency: Q-03, CONTENT-01
- [ ] **Q-05** — CQ: `cq.schema.ts`, `CQEditor.tsx`, `CQSubPartList.tsx`
      (stimulus + ক/খ/গ/ঘ sub-parts, cognitive_level, marks)
      - Dependency: Q-03, CONTENT-01
- [ ] **Q-06** — Written: `WrittenEditor.tsx`
      - Dependency: Q-03, CONTENT-01
- [ ] **Q-07** — `QuestionForm.tsx` — segment/subject/chapter/topic
      selection, conditional academic vs admission fields (from the
      ACAD/ADM domains)
      - Dependency: Q-04, Q-05, Q-06, ACAD-04, ADM-04
- [ ] **Q-08** — `question.service.ts` — create flow: insert question +
      options/sub_parts + tags + attachments together inside a transaction
      - Dependency: Q-07, DB-06
- [ ] **Q-09** — `question.queries.ts` — filtered + paginated fetch
      (segment/subject/chapter/topic/type/year/board/difficulty)
      - Dependency: Q-01
- [ ] **Q-10** — `QuestionFilters.tsx`, `QuestionCard.tsx`,
      `QuestionRenderer.tsx` (math-aware rendering)
      - Dependency: Q-09, CONTENT-02
- [ ] **Q-11** — API routes: `api/questions/route.ts` (GET/POST),
      `api/questions/[questionId]/route.ts` (GET/PATCH/DELETE)
      - Dependency: Q-08, Q-09
- [ ] **Q-12** — Dashboard: `dashboard/questions` (list, new, edit pages)
      - Dependency: Q-11, Q-07
- [ ] **Q-13** — Public: `(public)/questions` (browse + single question
      view)
      - Dependency: Q-10, Q-11

---

## 📦 Phase 8 — Attachment (Image) Domain

- [ ] **ATT-01** — `attachment.repository.ts` — polymorphic
      attachable_type/attachable_id CRUD
      - Dependency: DB-05
- [ ] **ATT-02** — `storage.provider.ts` interface + `s3.provider.ts`
      (or a local/R2 provider)
      - Dependency: SETUP-03
- [ ] **ATT-03** — `ImageUploader.tsx`, `ImagePreview.tsx`,
      `AttachmentManager.tsx`
      - Dependency: ATT-02, LIB-01
- [ ] **ATT-04** — `api/upload/route.ts`
      - Dependency: ATT-02
- [ ] **ATT-05** — Integrate ImageUploader into every part of the question
      form (stimulus/body/option/sub_part/explanation)
      - Dependency: ATT-03, Q-07

---

## 📦 Phase 9 — Review / Approval Workflow

- [ ] **REV-01** — Add approve/reject functions to `question.service.ts`
      (status: pending → approved/rejected, set reviewed_by)
      - Dependency: Q-08, LIB-04
- [ ] **REV-02** — `ReviewQueue.tsx`, `ApproveButton.tsx`,
      `RejectButton.tsx`
      - Dependency: REV-01, LIB-01
- [ ] **REV-03** — Dashboard: `dashboard/review` page (moderator-only,
      with permission guard)
      - Dependency: REV-02, LIB-04

---

## 📦 Phase 10 — Tags

- [ ] **TAG-01** — `tag.repository.ts`, `tag.service.ts`
      - Dependency: DB-05
- [ ] **TAG-02** — `TagInput.tsx`, `TagSelector.tsx`, `TagBadge.tsx`
      - Dependency: TAG-01, LIB-01
- [ ] **TAG-03** — Integrate tags into the question form and filters
      - Dependency: TAG-02, Q-07, Q-10

---

## 📦 Phase 11 — Question Sets / Mock Tests

- [ ] **SET-01** — `question-set.repository.ts`, `.service.ts`
      - Dependency: Q-01
- [ ] **SET-02** — `QuestionSetBuilder.tsx`, `QuestionPicker.tsx`
      - Dependency: SET-01, Q-09
- [ ] **SET-03** — `MockTestPlayer.tsx` — with timer and negative marking
      (admission_exams.negative_marking / question_sets.negative_marking)
      - Dependency: SET-01
- [ ] **SET-04** — Dashboard + public pages: `question-sets`, `mock-tests`
      - Dependency: SET-02, SET-03

---

## 📦 Phase 12 — Search & Stats (add later, not at the start)

- [ ] **SEARCH-01** — Postgres `tsvector` + GIN index (question_text,
      stimulus_text, answer_text, explanation_text)
      - Dependency: Q-09 stable
- [ ] **SEARCH-02** — `SearchBar.tsx`, full-text search integration
      - Dependency: SEARCH-01
- [ ] **STAT-01** — `question_stats` update logic (attempt/correct count)
      - Dependency: SET-03
- [ ] **STAT-02** — `AttemptChart.tsx`, analytics dashboard page
      - Dependency: STAT-01

---

## 📦 Phase 13 — Polish & Deploy

- [ ] **DEPLOY-01** — Verify the production build runs correctly
      - Dependency: all core phases above (1–8)
- [ ] **DEPLOY-02** — Deploy to Vercel/hosting + set env variables
      - Dependency: DEPLOY-01
- [ ] **DEPLOY-03** — Update README.md (setup instructions, screenshots)
      - Dependency: DEPLOY-02

---

## 📝 Change Log

> Always add new entries at the **top** (newest first).

- `2026-07-18` — REPO-02 completed: scaffolded 119 folders/files via
  GitHub Actions.
- `2026-07-18` — REPO-01 completed: finalized the v2 SQL schema (academic +
  admission + cluster/centralized exam + LaTeX support).
