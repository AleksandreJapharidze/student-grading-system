# Student Grading System — Assignment Feature To-Do

## Current State (Already Implemented)

The following is already working in the backend (`server/`):

- [x] **Authentication** — student/teacher registration and login via JWT (`/api/auth/login`, `/api/students/register`, `/api/teachers/register`)
- [x] **Classrooms** — create, get, and delete classrooms (`/api/classroom`)
- [x] **Classroom membership** — students and teachers can join/leave a classroom (`/api/classroom/students/:studentId`, `/api/classroom/teachers/:teacherId`)
- [x] **User management** — list/get students and teachers
- [x] **Database models** — `AssignmentEntity` and `AssignmentSubmissionEntity` exist in TypeORM and are registered in `type-orm-config.ts`

What is **missing**: API endpoints, services, repositories, and business logic for assignments, submissions, and grading. No assignment routes exist in `index.ts` yet.

---

## Database Schema Reference

### `assignment`
| Column         | Type     | Description                                      |
|----------------|----------|--------------------------------------------------|
| `id`           | INTEGER  | Primary key (auto-generated)                     |
| `task`         | TEXT     | Description/instructions of the assignment       |
| `deadline`     | DATETIME | Due date and time for the assignment             |
| `classroom_id` | INTEGER  | FK → classroom the assignment belongs to         |

### `assignment_submission`
| Column          | Type     | Description                                      |
|-----------------|----------|--------------------------------------------------|
| `id`            | INTEGER  | Primary key (auto-generated)                     |
| `content`       | TEXT     | The student's submitted work (plain text; **nullable**) |
| `turn_in_date`  | DATETIME | Timestamp when the student turned it in          |
| `assignment_id` | INTEGER  | FK → which assignment this submission is for     |
| `student_id`    | INTEGER  | FK → which student submitted it                  |
| `grade`         | INTEGER  | Teacher-assigned score **0–10** (nullable until graded) |

### `user`
| Column         | Type     | Description                          |
|----------------|----------|--------------------------------------|
| `id`           | INTEGER  | Primary key                          |
| `name`         | VARCHAR  | User's name                          |
| `email`        | VARCHAR  | User's email                         |
| `password`     | VARCHAR  | Hashed password                      |
| `role`         | VARCHAR  | `"student"` or `"teacher"`           |
| `classroom_id` | INTEGER  | FK → classroom (nullable)            |

### `classroom`
| Column | Type    | Description        |
|--------|---------|--------------------|
| `id`   | INTEGER | Primary key        |
| `name` | VARCHAR | Classroom name     |

---

## Phase 0 — Entity Updates (Prerequisites)

Before building the API, align the existing TypeORM models with the schema above.

### 0.1 `assignment_submission` entity
- [ ] Make `content` **nullable** (`nullable: true`) — student may turn in without content initially, or content is optional per schema
- [ ] Add **`grade`** column — nullable until the teacher grades the submission
  - type: `number` (0–10) 
- [ ] Keep `turnInDate` as auto-set on create (`@CreateDateColumn` or explicit set on submit)
- [ ] Ensure FKs: `assignmentId` → assignment, `studentId` → user

### 0.2 Verify related entities
- [ ] `assignment.entity.ts` — `task`, `deadline`, `classroomId` (FK to classroom)
- [ ] `user.entity.ts` — `classroom_id` (correct spelling, nullable)
- [ ] Sync schema (TypeORM synchronize or migration)

---

## Phase 1 — Teacher Creates an Assignment

Teachers create assignments tied to a specific classroom.

### 1.1 Repository
- [ ] Create `server/src/database/repositories/assignment.repository.ts`
- [ ] Follow the pattern used in `classroom.repository.ts` and `user.repository.ts`

### 1.2 Service — `createAssignment`
- [ ] Create `server/src/services/assignment.service.ts`
- [ ] Require JWT via `verifyToken`; caller role must be `"teacher"`
- [ ] Request body: `{ task: string, deadline: string | Date, classroomId: number }`
  - **`task`** — assignment description/instructions
  - **`deadline`** — due date/time
  - **`classroomId`** — which classroom this assignment belongs to
- [ ] Validate classroom exists
- [ ] Optionally verify teacher belongs to that classroom
- [ ] Save `AssignmentEntity` and return `201` with created assignment

### 1.3 Read/delete endpoints (recommended)
- [ ] `GET /api/classroom/assignments` — list assignments for a classroom
- [ ] `GET /api/assignments/:assignmentId` — get one assignment
- [ ] `DELETE /api/assignments/:assignmentId` — teacher deletes assignment (optional)

### 1.4 Routes
- [ ] Register in `server/src/index.ts`:
  - `POST /api/assignments` → `createAssignment`
  - `GET /api/classroom/assignments` → `getAssignmentsByClassroomId`

---

## Phase 2 — Student Submits an Assignment

Students turn in work for a specific assignment.

### 2.1 Repository
- [ ] Create `server/src/database/repositories/assignment-submission.repository.ts`

### 2.2 Service — `submitAssignment`
- [ ] Create `server/src/services/assignment-submission.service.ts`
- [ ] Require JWT; caller role must be `"student"`
- [ ] Request body: `{ content?: string, assignmentId: number }`
  - **`content`** — submitted text (optional/nullable)
  - **`assignmentId`** — which assignment this submission is for
  - **`studentId`** — from JWT (`decodedJwt.id`), **not** from request body
- [ ] Validate assignment exists
- [ ] Validate student is in the same classroom as the assignment
- [ ] Set **`turn_in_date`** automatically on submit
- [ ] Enforce **one submission per student per assignment** — reject duplicates; no resubmissions or updates
- [ ] Return `201` with created submission

### 2.3 Read endpoints (recommended)
- [ ] `GET /api/assignments/:assignmentId/submissions` — teacher views all submissions
- [ ] `GET /api/students/:studentId/submissions` — student views own submissions

### 2.4 Routes
- [ ] Register in `server/src/index.ts`:
  - `POST /api/assignments/:assignmentId/submissions` → `submitAssignment`
  - `GET /api/assignments/:assignmentId/submissions` → `getSubmissionsByAssignmentId`

---

## Phase 3 — Teacher Grades a Submission

Grading lives on **`assignment_submission.grade`**.

### 3.1 Service — `gradeSubmission`
- [ ] Add to `assignment-submission.service.ts`
- [ ] Require JWT; caller role must be `"teacher"`
- [ ] Request body: `{ grade: number }` (0–10)
- [ ] Validate `grade` is within **0–10** range
- [ ] Validate submission exists and has been turned in (`turn_in_date` set)
- [ ] Validate teacher belongs to the assignment's classroom
- [ ] Update `grade` on the submission record
- [ ] Return `200` with updated submission (including `grade`)

### 3.2 Routes
- [ ] Register in `server/src/index.ts`:
  - `PATCH /api/assignments/:assignmentId/submissions/:submissionId/grade` → `gradeSubmission`

---

## Phase 4 — Authorization Summary

| Action              | Role     | Rules |
|---------------------|----------|-------|
| Create assignment   | Teacher  | Authenticated; classroom must exist |
| Submit assignment   | Student  | Authenticated; same classroom as assignment; `studentId` from JWT |
| Grade submission    | Teacher  | Authenticated; submission exists; teacher in assignment's classroom |
| List submissions    | Teacher  | For assignments in their classroom |
| View own submission | Student  | Only their own `studentId` |

---

## Phase 5 — Testing

- [ ] Teacher login → `POST /api/assignments` with `task`, `deadline`, `classroomId`
- [ ] Student login → `POST .../submissions` with `content` (and without `content` if nullable)
- [ ] Teacher login → `PATCH .../grade` with `grade` after submission
- [ ] Reject: student creating assignments, teacher submitting, unauthenticated requests
- [ ] Edge cases: invalid IDs, duplicate submission (must reject), grade out of 0–10 range, grade before submit
- [ ] Late submission after deadline is **allowed for now** (no rejection yet)
- [ ] JWT via `Authorization: Bearer <token>` header

---

## Files to Create

| File | Purpose |
|------|---------|
| `server/src/database/repositories/assignment.repository.ts` | Assignment DB access |
| `server/src/database/repositories/assignment-submission.repository.ts` | Submission DB access |
| `server/src/services/assignment.service.ts` | Assignment CRUD |
| `server/src/services/assignment-submission.service.ts` | Submit + grade logic |

## Files to Modify

| File | Change |
|------|--------|
| `server/src/database/models/assignment-submission.entity.ts` | `content` nullable; add `grade` |
| `server/src/index.ts` | Register assignment and submission routes |

---

## Decisions

1. **Grade format** — numeric **0–10** (`number` on `assignment_submission.grade`). Validate that grades are within this range when grading.
2. **Resubmissions** — **No.** One submission per student per assignment. Reject duplicate submit attempts.
3. **Late submissions** — **Allow for now** (no rejection after `deadline`). Deadline is stored and shown only; deadline enforcement will be added later.
4. **Multiple classrooms** — **Out of scope.** Keep existing hardcoded `classroom id: 1` behavior; no multi-classroom refactor needed.