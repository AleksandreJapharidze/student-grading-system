# Project API Documentation

**Overview**

 - **Base URL:** `http://<host>:<port>/api` (example: `http://localhost:3000/api`)
 - **Authentication:** Most endpoints require a JSON Web Token (JWT) passed in the `Authorization` header as `Bearer <token>`. Tokens are short-lived (issued for 5 minutes by the server).
 - **Error format:** All errors are returned with a JSON body in the shape: `{ status: "error", message: string, errors?: any }`. Validation errors include an `errors` array with `{ field, message, location, value }` entries.

**Authentication header**

 - **Header:** `Authorization: Bearer <token>`

---

**Routes summary**

 - `POST /api/auth/login` — Authenticate and receive a token
 - `POST /api/students/register` — Register a new student
 - `POST /api/teachers/register` — Register a new teacher
 - `GET /api/students` — List students
 - `GET /api/students/:studentId` — Get a student's details (authenticated)
 - `GET /api/students/:studentId/final-grade` — Generate a student's final grade PDF (authenticated)
 - `GET /api/teachers` — List teachers
 - `GET /api/teachers/:teacherId` — Get a teacher's details (authenticated)
 - `GET /api/classroom` — Get classroom info
 - `POST /api/classroom` — Create classroom (admin/teacher)
 - `DELETE /api/classroom` — Delete all classrooms
 - `GET /api/classroom/students` — List students in classroom
 - `GET /api/classroom/teachers` — List teachers in classroom
 - `PATCH /api/classroom/students/:studentId` — Add student to classroom (admin/teacher)
 - `DELETE /api/classroom/students/:studentId` — Remove student from classroom (admin/teacher)
 - `PATCH /api/classroom/teachers/:teacherId` — Add teacher to classroom (admin/teacher)
 - `DELETE /api/classroom/teachers/:teacherId` — Remove teacher from classroom (admin/teacher)
 - `GET /api/classroom/assignments` — List assignments for classroom (authenticated)
 - `POST /api/assignments` — Create assignment (teacher)
 - `GET /api/assignments/:assignmentId` — Get assignment by id
 - `DELETE /api/assignments/:assignmentId` — Delete assignment (teacher)
 - `GET /api/assignments/:assignmentId/submissions` — List submissions for assignment (teacher)
 - `GET /api/assignments/:assignmentId/submissions?studentId=<id>` — Get a single submission for assignment by student (student)
 - `POST /api/assignments/:assignmentId/submissions` — Submit assignment files (student)
 - `DELETE /api/assignments/:assignmentId/submissions/:submissionId` — Delete a submission (student)
 - `PATCH /api/assignments/:assignmentId/submissions/:submissionId/grade` — Grade a submission (teacher)
 - `GET /api/files/:fileName` — Download a submission file (authenticated)
 - `GET /api/users/:userId/classroom` — Get classroom for a user (authenticated)

---

**Detailed endpoints**

**Authentication**

- **POST /api/auth/login**
  - **Purpose:** Login user and receive JWT token.
  - **Body:** `application/json`
    - `email` (string, required) — valid email
    - `password` (string, required)
  - **Responses:**
    - `200 OK` `{ message: "Login successful", token: "<jwt>" }`
    - `400 Validation` `{ status: "error", message: "Validation failed", errors: [...] }`
    - `401 Unauthorized` `{ status: "error", message: "Invalid email. User not found" }` or `{ status: "error", message: "Invalid password" }`

**Student registration & management**

- **POST /api/students/register**
  - **Purpose:** Register a new student user.
  - **Body:** `application/json`
    - `name` (string, required)
    - `email` (string, required, valid email)
    - `password` (string, required)
  - **Responses:**
    - `201 Created` `{ message: "Student registered successfully" }`
    - `400 Validation` when missing fields or email already registered

- **GET /api/students**
  - **Purpose:** List all students (public).
  - **Responses:**
    - `200 OK` — array of students: `[{ id, name, email, role }, ...]`

- **GET /api/students/:studentId**
  - **Purpose:** Return student details. Requires authentication; students can only fetch their own record.
  - **Params:** `studentId` (integer, required)
  - **Responses:**
    - `200 OK` — student object
    - `401 Unauthorized` if token missing/invalid
    - `403 Forbidden` if accessing another student's data
    - `404 Not Found` if student doesn't exist

- **GET /api/students/:studentId/final-grade**
  - **Purpose:** Generates and returns a PDF report with the student's total/final grade.
  - **Params:** `studentId` (integer, required)
  - **Responses:**
    - `200 OK` — `application/pdf` stream containing a small report
    - `401/403` — if unauthorized or not permitted

**Teacher registration & management**

- **POST /api/teachers/register**
  - **Body:** `name`, `email`, `password` (all required)
  - **Responses:**
    - `201 Created` `{ message: "Teacher registered successfully" }`
    - `400 Validation` when missing fields or email already registered

- **GET /api/teachers**
  - **Purpose:** List all teachers (public).
  - **Responses:** `200 OK` — array of teachers

- **GET /api/teachers/:teacherId**
  - **Purpose:** Get teacher details. Authentication required; teachers can only fetch their own record.
  - **Params:** `teacherId` (integer)
  - **Responses:** `200 OK` | `401/403/404`

**Classroom endpoints**

- **GET /api/classroom**
  - **Purpose:** Get the (single) classroom record. Returns `404` if none exist.
  - **Responses:** `200 OK` — classroom object; `404 Not Found` if no classroom

- **POST /api/classroom**
  - **Purpose:** Create the classroom. Allowed for users with role `admin` or `teacher`.
  - **Body:** `application/json` `{ name: string }` (required)
  - **Responses:**
    - `201 Created` — saved classroom object
    - `400 Validation` — if a classroom already exists or name missing
    - `401/403` — if not authenticated or not allowed

- **DELETE /api/classroom**
  - **Purpose:** Remove all classroom records.
  - **Responses:** `204 No Content`

- **GET /api/classroom/students** and **GET /api/classroom/teachers**
  - **Purpose:** Return lists of students/teachers assigned to the classroom. No request params.
  - **Responses:** `200 OK` — arrays of users

- **PATCH /api/classroom/students/:studentId**
  - **Purpose:** Add a student to the classroom. Only `teacher` or `admin` may perform this.
  - **Params:** `studentId` (integer)
  - **Responses:**
    - `200 OK` — success message
    - `400/401/403/404` — validation, auth, permission, or not found

- **DELETE /api/classroom/students/:studentId**
  - **Purpose:** Remove a student from the classroom. Only `teacher` or `admin`.
  - **Responses:** `200 OK` or appropriate error codes

- **PATCH /api/classroom/teachers/:teacherId** and **DELETE /api/classroom/teachers/:teacherId**
  - **Purpose:** Add or remove teacher to/from classroom. Similar permissions and responses as student endpoints above.

- **GET /api/classroom/assignments**
  - **Purpose:** Returns assignments for the classroom. Requires authentication; user must belong to the classroom.
  - **Responses:** `200 OK` — array of assignments; `401/403/404` as appropriate

**Assignments & Submissions**

- **POST /api/assignments**
  - **Purpose:** Create an assignment. Only users with role `teacher` may create assignments.
  - **Body:** `application/json`
    - `task` (string, required)
    - `deadline` (string/date, required) — stored as JS Date
    - `maxScore` (integer, required)
    - `minScore` (integer, optional) — if present must be less than `maxScore`
  - **Responses:**
    - `201 Created` `{ message: "Assignment created successfully" }`
    - `400 Validation` (e.g. minScore >= maxScore)
    - `401/403/404` — unauthorized, forbidden, or no classroom/teacher errors

- **GET /api/assignments/:assignmentId**
  - **Purpose:** Fetch specific assignment by id.
  - **Params:** `assignmentId` (integer)
  - **Responses:** `200 OK` — assignment object with classroom relation; `404 Not Found` if missing

- **DELETE /api/assignments/:assignmentId**
  - **Purpose:** Delete an assignment. Only the teacher who belongs to the assignment's classroom may delete it.
  - **Responses:**
    - `204 No Content` on success
    - `401/403/404` for unauthorized, forbidden, or not found

- **GET /api/assignments/:assignmentId/submissions**
  - **Purpose:** List all submissions for an assignment. Only `teacher` members of the classroom may access.
  - **Params:** `assignmentId` (integer)
  - **Responses:** `200 OK` — array of submissions including `student` relation; `401/403/404` as needed

- **GET /api/assignments/:assignmentId/submissions?studentId=<id>**
  - **Purpose:** Fetch a single submission for the given assignment and student. Only the student owner may fetch their own submission (requires authenticated student token and `studentId` equals token id).
  - **Query:** `studentId` (integer, required for this route variant)
  - **Responses:** `200 OK` — submission object; `401/403/404` as appropriate

- **POST /api/assignments/:assignmentId/submissions** (file uploads)
  - **Purpose:** Submit assignment files. This route is mounted in application entry (`index.ts`) and handled by `multer`. It expects `multipart/form-data` with files under the field name `files`.
  - **Headers:** `Content-Type: multipart/form-data` and `Authorization: Bearer <token>` (student)
  - **Params:** `assignmentId` (path)
  - **Request:** Upload one or more files (`files` field). Each uploaded file is saved to the `uploads/` directory and recorded in DB.
  - **Responses:**
    - `201 Created` `{ message: "Assignment submitted successfully" }`
    - `400 Validation` — if no files uploaded or student already submitted
    - `401/403/404` — if unauthorized, not student, or assignment/student not found

- **DELETE /api/assignments/:assignmentId/submissions/:submissionId**
  - **Purpose:** Delete a submission and its stored files. Only the submitting `student` may delete their submission.
  - **Params:** `assignmentId`, `submissionId` (both integers)
  - **Responses:**
    - `200 OK` `{ message: "Submission deleted successfully" }`
    - `401/403/404` as appropriate

- **PATCH /api/assignments/:assignmentId/submissions/:submissionId/grade**
  - **Purpose:** Grade a student's submission. Only `teacher` who belongs to the classroom may grade.
  - **Body:** `application/json` `{ grade: integer }` (required)
  - **Responses:**
    - `200 OK` `{ message: "Grade updated successfully" }`
    - `400 Validation` if grade outside allowed range or submission not turned in
    - `401/403/404` for authentication/permission/missing resources

**Files**

- **GET /api/files/:fileName**
  - **Purpose:** Download a previously uploaded submission file. Requires authentication.
  - **Params:** `fileName` (string, required)
  - **Responses:**
    - `200 OK` — raw file stream
    - `401/404` — unauthorized or file not found

**User helpers**

- **GET /api/users/:userId/classroom**
  - **Purpose:** Return classroom information for the provided user id. Requires authentication and `userId` must match the authenticated user's id.
  - **Params:** `userId` (integer)
  - **Responses:** `200 OK` — classroom object; `401/403/404`

---

**Validation & common errors**

 - **Validation errors (400)** — produced by `express-validator` and `validateRequest`, payload looks like:

```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "email is required", "location": "body", "value": "" }
  ]
}
```

 - **Unauthorized (401)** — returned when JWT missing or invalid. Example:

```json
{ "status": "error", "message": "Unauthorized" }
```

 - **Forbidden (403)** — user does not have required role or does not belong to classroom. Example:

```json
{ "status": "error", "message": "Access denied. You are not authorized to access this resource." }
```

 - **Not Found (404)** — resource missing. Example:

```json
{ "status": "error", "message": "Assignment not found" }
```

 - **Internal Server Error (500)** — unexpected error. Example:

```json
{ "status": "error", "message": "Internal server error" }
```

**Notes & implementation details**

 - JWT tokens are generated by `generateToken` and verified with `verifyToken`. Tokens must be provided in the `Authorization` header as `Bearer <token>`.
 - File uploads for submission use `multer` and are saved to the `uploads/` folder. The form field name expected is `files` (multipart/form-data).
 - The server enforces role-based permissions in many service handlers (roles: `student`, `teacher`, `admin`). Ensure the authenticated token contains `id`, `email`, and `role`.
 - The `GET /api/students/:studentId/final-grade` endpoint returns a PDF stream with content type `application/pdf`.
 - Validation rules applied by routers are implemented via `express-validator`; check router files for exact constraints (e.g. numeric param checks).

