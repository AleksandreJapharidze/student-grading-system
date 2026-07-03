# Example Requests and Responses

This document provides example JSON requests and responses for all 29 endpoints of the Student Grading System API.

---

## 1. Authentication

### POST /api/auth/login
**Purpose:** Authenticate user and receive JWT token.

**Request:**
```json
{
  "email": "student@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJzdHVkZW50QGV4YW1wbGUuY29tIiwicm9sZSI6InN0dWRlbnQiLCJpYXQiOjE2OTkwMDAwMDAsImV4cCI6MTY5OTAwMzAwMH0.xyz123abc"
}
```

**Response (401 Unauthorized - Invalid Email):**
```json
{
  "status": "error",
  "message": "Invalid email. User not found"
}
```

**Response (401 Unauthorized - Invalid Password):**
```json
{
  "status": "error",
  "message": "Invalid password"
}
```

**Response (400 Validation Error):**
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "email must be valid",
      "location": "body",
      "value": "invalid-email"
    }
  ]
}
```

---

## 2. Student Registration & Management

### POST /api/students/register
**Purpose:** Register a new student user.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

**Response (201 Created):**
```json
{
  "message": "Student registered successfully"
}
```

**Response (400 Validation Error):**
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "email is required",
      "location": "body",
      "value": ""
    }
  ]
}
```

---

### GET /api/students
**Purpose:** List all students (public endpoint).

**Request:** No body required.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "student"
  },
  {
    "id": 2,
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "role": "student"
  }
]
```

---

### GET /api/students/:studentId
**Purpose:** Return student details. Requires authentication; students can only fetch their own record.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john.doe@example.com",
  "role": "student"
}
```

**Response (401 Unauthorized):**
```json
{
  "status": "error",
  "message": "Unauthorized"
}
```

**Response (403 Forbidden - Accessing another student's data):**
```json
{
  "status": "error",
  "message": "Access denied. You are not authorized to access this resource."
}
```

**Response (404 Not Found):**
```json
{
  "status": "error",
  "message": "Student not found"
}
```

---

### GET /api/students/:studentId/final-grade
**Purpose:** Generates and returns a PDF report with the student's total/final grade. Only "teacher" can access this.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```
Content-Type: application/pdf

[Binary PDF data containing the final grade report]
```

**Response (401 Unauthorized):**
```json
{
  "status": "error",
  "message": "Unauthorized"
}
```

**Response (403 Forbidden):**
```json
{
  "status": "error",
  "message": "Access denied. You are not authorized to access this resource."
}
```

---

## 3. Teacher Registration & Management

### POST /api/teachers/register
**Purpose:** Register a new teacher user.

**Request:**
```json
{
  "name": "Dr. Smith",
  "email": "dr.smith@example.com",
  "password": "teacherPassword123"
}
```

**Response (201 Created):**
```json
{
  "message": "Teacher registered successfully"
}
```

**Response (400 Validation Error):**
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "name is required",
      "location": "body",
      "value": ""
    }
  ]
}
```

---

### GET /api/teachers
**Purpose:** List all teachers (public endpoint).

**Request:** No body required.

**Response (200 OK):**
```json
[
  {
    "id": 3,
    "name": "Dr. Smith",
    "email": "dr.smith@example.com",
    "role": "teacher"
  },
  {
    "id": 4,
    "name": "Prof. Johnson",
    "email": "prof.johnson@example.com",
    "role": "teacher"
  }
]
```

---

### GET /api/teachers/:teacherId
**Purpose:** Get teacher details. Authentication required; teachers can only fetch their own record.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": 3,
  "name": "Dr. Smith",
  "email": "dr.smith@example.com",
  "role": "teacher"
}
```

**Response (401 Unauthorized):**
```json
{
  "status": "error",
  "message": "Unauthorized"
}
```

**Response (403 Forbidden - Accessing another teacher's data):**
```json
{
  "status": "error",
  "message": "Access denied. You are not authorized to access this resource."
}
```

**Response (404 Not Found):**
```json
{
  "status": "error",
  "message": "Teacher not found"
}
```

---

## 4. Classroom Management

### GET /api/classroom
**Purpose:** Get the (single) classroom record. Returns 404 if none exist.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Advanced JavaScript - Section A"
}
```

**Response (404 Not Found):**
```json
{
  "status": "error",
  "message": "Classroom not found"
}
```

---

### POST /api/classroom
**Purpose:** Create the classroom. Allowed for users with role `admin` or `teacher`.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "name": "Introduction to Computer Science"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "name": "Introduction to Computer Science"
}
```

**Response (400 Validation Error - Missing name):**
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "name is required",
      "location": "body",
      "value": ""
    }
  ]
}
```

**Response (400 Conflict - Classroom already exists):**
```json
{
  "status": "error",
  "message": "Classroom already exists"
}
```

**Response (401 Unauthorized):**
```json
{
  "status": "error",
  "message": "Unauthorized"
}
```

**Response (403 Forbidden - User is not a teacher or admin):**
```json
{
  "status": "error",
  "message": "Access denied. You are not authorized to access this resource."
}
```

---

### DELETE /api/classroom
**Purpose:** Remove all classroom records. Only admins can delete classrooms.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response (204 No Content):**
```
(No response body)
```

**Response (401 Unauthorized):**
```json
{
  "status": "error",
  "message": "Unauthorized"
}
```

**Response (403 Forbidden):**
```json
{
  "status": "error",
  "message": "Access denied. You are not authorized to access this resource."
}
```

---

### GET /api/classroom/students
**Purpose:** Return list of students assigned to the classroom.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "student"
  },
  {
    "id": 2,
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "role": "student"
  }
]
```

---

### GET /api/classroom/teachers
**Purpose:** Return list of teachers assigned to the classroom.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
  {
    "id": 3,
    "name": "Dr. Smith",
    "email": "dr.smith@example.com",
    "role": "teacher"
  }
]
```

---

### PATCH /api/classroom/students/:studentId
**Purpose:** Add a student to the classroom. Only `teacher` or `admin` may perform this.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Student added to classroom successfully"
}
```

**Response (400 Bad Request - Student already in classroom):**
```json
{
  "status": "error",
  "message": "Student is already in this classroom"
}
```

**Response (401 Unauthorized):**
```json
{
  "status": "error",
  "message": "Unauthorized"
}
```

**Response (403 Forbidden - User is not a teacher or admin):**
```json
{
  "status": "error",
  "message": "Access denied. You are not authorized to access this resource."
}
```

**Response (404 Not Found - Student or classroom not found):**
```json
{
  "status": "error",
  "message": "Student not found"
}
```

---

### DELETE /api/classroom/students/:studentId
**Purpose:** Remove a student from the classroom. Only `teacher` or `admin`.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Student removed from classroom successfully"
}
```

**Response (401 Unauthorized):**
```json
{
  "status": "error",
  "message": "Unauthorized"
}
```

**Response (403 Forbidden - User is not a teacher or admin):**
```json
{
  "status": "error",
  "message": "Access denied. You are not authorized to access this resource."
}
```

**Response (404 Not Found):**
```json
{
  "status": "error",
  "message": "Student not found"
}
```

---

### PATCH /api/classroom/teachers/:teacherId
**Purpose:** Add a teacher to the classroom. Only `teacher` or `admin` may perform this.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Teacher added to classroom successfully"
}
```

**Response (400 Bad Request - Teacher already in classroom):**
```json
{
  "status": "error",
  "message": "Teacher is already in this classroom"
}
```

**Response (401 Unauthorized):**
```json
{
  "status": "error",
  "message": "Unauthorized"
}
```

**Response (403 Forbidden):**
```json
{
  "status": "error",
  "message": "Access denied. You are not authorized to access this resource."
}
```

**Response (404 Not Found):**
```json
{
  "status": "error",
  "message": "Teacher not found"
}
```

---

### DELETE /api/classroom/teachers/:teacherId
**Purpose:** Remove a teacher from the classroom. Only `teacher` or `admin`.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Teacher removed from classroom successfully"
}
```

**Response (401 Unauthorized):**
```json
{
  "status": "error",
  "message": "Unauthorized"
}
```

**Response (403 Forbidden):**
```json
{
  "status": "error",
  "message": "Access denied. You are not authorized to access this resource."
}
```

**Response (404 Not Found):**
```json
{
  "status": "error",
  "message": "Teacher not found"
}
```

---

### GET /api/classroom/assignments
**Purpose:** Returns assignments for the classroom. Requires authentication; user must belong to the classroom.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "task": "Implement a calculator in JavaScript",
    "deadline": "2024-02-15T23:59:59.000Z",
    "minScore": 0,
    "maxScore": 100
  },
  {
    "id": 2,
    "task": "Build a React todo app",
    "deadline": "2024-02-28T23:59:59.000Z",
    "minScore": 10,
    "maxScore": 100
  }
]
```

**Response (401 Unauthorized):**
```json
{
  "status": "error",
  "message": "Unauthorized"
}
```

**Response (403 Forbidden - User doesn't belong to classroom):**
```json
{
  "status": "error",
  "message": "Access denied. You are not authorized to access this resource."
}
```

**Response (404 Not Found - Classroom doesn't exist):**
```json
{
  "status": "error",
  "message": "Classroom not found"
}
```

---

## 5. Assignments & Submissions

### POST /api/assignments
**Purpose:** Create an assignment. Only users with role `teacher` may create assignments.

**Request Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "task": "Implement a REST API using Node.js and Express",
  "deadline": "2024-02-20T23:59:59.000Z",
  "maxScore": 100,
  "minScore": 0
}
```

**Response (201 Created):**
```json
{
  "message": "Assignment created successfully"
}
```

**Response (400 Validation Error - minScore >= maxScore):**
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "field": "minScore",
      "message": "minScore must be less than maxScore",
      "location": "body",
      "value": 100
    }
  ]
}
```

**Response (400 Bad Request - No classroom found):**
```json
{
  "status": "error",
  "message": "Classroom not found"
}
```

**Response (401 Unauthorized):**
```json
{
  "status": "error",
  "message": "Unauthorized"
}
```

**Response (403 Forbidden - User is not a teacher):**
```json
{
  "status": "error",
  "message": "Access denied. You are not authorized to access this resource."
}
```

---

### GET /api/assignments/:assignmentId
**Purpose:** Fetch specific assignment by id.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "task": "Implement a calculator in JavaScript",
  "deadline": "2024-02-15T23:59:59.000Z",
  "minScore": 0,
  "maxScore": 100,
  "classroom": {
    "id": 1,
    "name": "Introduction to Computer Science"
  }
}
```

**Response (404 Not Found):**
```json
{
  "status": "error",
  "message": "Assignment not found"
}
```

---

### DELETE /api/assignments/:assignmentId
**Purpose:** Delete an assignment. Only the teacher who belongs to the assignment's classroom may delete it.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response (204 No Content):**
```
(No response body)
```

**Response (401 Unauthorized):**
```json
{
  "status": "error",
  "message": "Unauthorized"
}
```

**Response (403 Forbidden - User is not a teacher or doesn't belong to classroom):**
```json
{
  "status": "error",
  "message": "Access denied. You are not authorized to access this resource."
}
```

**Response (404 Not Found):**
```json
{
  "status": "error",
  "message": "Assignment not found"
}
```

---

### GET /api/assignments/:assignmentId/submissions
**Purpose:** List all submissions for an assignment. Only `teacher` members of the classroom may access.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "turnInDate": "2024-02-14T18:30:00.000Z",
    "grade": 95,
    "submissionFilePaths": [
      {
        "id": 1,
        "filePath": "https://<project>.supabase.co/storage/v1/object/public/students-submissions/1705318200000-homework.pdf"
      }
    ],
    "student": {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "student"
    }
  },
  {
    "id": 2,
    "turnInDate": "2024-02-15T12:00:00.000Z",
    "grade": null,
    "submissionFilePaths": [
      {
        "id": 2,
        "filePath": "https://<project>.supabase.co/storage/v1/object/public/students-submissions/1705395600000-homework.png"
      },
      {
        "id": 3,
        "filePath": "https://<project>.supabase.co/storage/v1/object/public/students-submissions/1705395600001-tests.txt"
      }
    ],
    "student": {
      "id": 2,
      "name": "Jane Smith",
      "email": "jane.smith@example.com",
      "role": "student"
    }
  }
]
```

**Response (401 Unauthorized):**
```json
{
  "status": "error",
  "message": "Unauthorized"
}
```

**Response (403 Forbidden - User is not a teacher or doesn't belong to classroom):**
```json
{
  "status": "error",
  "message": "Access denied. You are not authorized to access this resource."
}
```

**Response (404 Not Found):**
```json
{
  "status": "error",
  "message": "Assignment not found"
}
```

---

### GET /api/assignments/:assignmentId/submissions?studentId=<id>
**Purpose:** Fetch a single submission for the given assignment and student. Only the student owner may fetch their own submission.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "turnInDate": "2024-02-14T18:30:00.000Z",
  "grade": 95,
  "submissionFilePaths": [
    {
      "id": 1,
      "filePath": "https://<project>.supabase.co/storage/v1/object/public/students-submissions/1705318200000-homework.pdf"
    }
  ]
}
```

**Response (401 Unauthorized):**
```json
{
  "status": "error",
  "message": "Unauthorized"
}
```

**Response (403 Forbidden - Student accessing another student's submission):**
```json
{
  "status": "error",
  "message": "Access denied. You are not authorized to access this resource."
}
```

**Response (404 Not Found):**
```json
{
  "status": "error",
  "message": "Submission not found"
}
```

---

### POST /api/assignments/:assignmentId/submissions
**Purpose:** Submit assignment files. Expects `multipart/form-data` with files under the field name `files`. Only `student` belonging to the classroom may submit files.

**Request Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Form Data:**
```
Field Name: files
Files: [homework.pdf, homework.png]
```

**Response (201 Created):**
```json
{
  "message": "Assignment submitted successfully"
}
```

**Response (400 Validation Error - No files provided):**
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "field": "files",
      "message": "At least one file is required",
      "location": "files"
    }
  ]
}
```

**Response (400 Conflict - Student already submitted):**
```json
{
  "status": "error",
  "message": "You have already submitted this assignment"
}
```

**Response (401 Unauthorized):**
```json
{
  "status": "error",
  "message": "Unauthorized"
}
```

**Response (403 Forbidden - User is not a student or doesn't belong to classroom):**
```json
{
  "status": "error",
  "message": "Access denied. You are not authorized to access this resource."
}
```

**Response (404 Not Found):**
```json
{
  "status": "error",
  "message": "Assignment not found"
}
```

**Response (422 Unprocessable Entity):**
```json
{
  "status": "error",
  "message": "Assignment deadline has passed"
}
```

---

### DELETE /api/assignments/:assignmentId/submissions/:submissionId
**Purpose:** Delete a submission and its stored files. Only the submitting `student` may delete their submission.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Submission deleted successfully"
}
```

**Response (401 Unauthorized):**
```json
{
  "status": "error",
  "message": "Unauthorized"
}
```

**Response (403 Forbidden - User is not the submission owner):**
```json
{
  "status": "error",
  "message": "Access denied. You are not authorized to access this resource."
}
```

**Response (404 Not Found):**
```json
{
  "status": "error",
  "message": "Submission not found"
}
```

**Response (422 Unprocessable Entity):**
```json
{
  "status": "error",
  "message": "Assignment deadline has passed. You cannot delete this submission."
}
```

---

### PATCH /api/assignments/:assignmentId/submissions/:submissionId/grade
**Purpose:** Grade a student's submission. Only `teacher` who belongs to the classroom may grade.

**Request Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "grade": 92
}
```

**Response (200 OK):**
```json
{
  "message": "Grade updated successfully"
}
```

**Response (400 Validation Error - Grade out of range):**
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "field": "grade",
      "message": "grade must be between 0 and 100",
      "location": "body",
      "value": 150
    }
  ]
}
```

**Response (400 Bad Request - Submission not graded yet or invalid grade):**
```json
{
  "status": "error",
  "message": "Cannot grade a submission that has not been turned in"
}
```

**Response (401 Unauthorized):**
```json
{
  "status": "error",
  "message": "Unauthorized"
}
```

**Response (403 Forbidden - User is not a teacher or doesn't belong to classroom):**
```json
{
  "status": "error",
  "message": "Access denied. You are not authorized to access this resource."
}
```

**Response (404 Not Found):**
```json
{
  "status": "error",
  "message": "Submission not found"
}
```

**Response (422 Unprocessable Entity):**
```json
{
  "status": "error",
  "message": "You are grading too early. Deadline has not passed yet."
}
```

---

## 6. User Helpers

### GET /api/users/:userId/classroom
**Purpose:** Return classroom information for the provided user id. Requires authentication and `userId` must match the authenticated user's id.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Introduction to Computer Science"
}
```

**Response (401 Unauthorized):**
```json
{
  "status": "error",
  "message": "Unauthorized"
}
```

**Response (403 Forbidden - User accessing another user's classroom):**
```json
{
  "status": "error",
  "message": "Access denied. You are not authorized to access this resource."
}
```

**Response (404 Not Found - User or classroom not found):**
```json
{
  "status": "error",
  "message": "User not found"
}
```

---

## Summary of All 27 Endpoints

| # | Method | Endpoint | Description |
|---|--------|----------|-------------|
| 1 | POST | /api/auth/login | Authenticate user and receive JWT token |
| 2 | POST | /api/students/register | Register a new student user |
| 3 | POST | /api/teachers/register | Register a new teacher user |
| 4 | GET | /api/students | List all students |
| 5 | GET | /api/students/:studentId | Get student details |
| 6 | GET | /api/students/:studentId/final-grade | Generate final grade PDF for student |
| 7 | GET | /api/teachers | List all teachers |
| 8 | GET | /api/teachers/:teacherId | Get teacher details |
| 9 | GET | /api/classroom | Get classroom info |
| 10 | POST | /api/classroom | Create classroom |
| 11 | DELETE | /api/classroom | Delete all classrooms |
| 12 | GET | /api/classroom/students | List students in classroom |
| 13 | GET | /api/classroom/teachers | List teachers in classroom |
| 14 | PATCH | /api/classroom/students/:studentId | Add student to classroom |
| 15 | DELETE | /api/classroom/students/:studentId | Remove student from classroom |
| 16 | PATCH | /api/classroom/teachers/:teacherId | Add teacher to classroom |
| 17 | DELETE | /api/classroom/teachers/:teacherId | Remove teacher from classroom |
| 18 | GET | /api/classroom/assignments | List assignments for classroom |
| 19 | POST | /api/assignments | Create assignment |
| 20 | GET | /api/assignments/:assignmentId | Get assignment by id |
| 21 | DELETE | /api/assignments/:assignmentId | Delete assignment |
| 22 | GET | /api/assignments/:assignmentId/submissions | List submissions for assignment |
| 23 | GET | /api/assignments/:assignmentId/submissions?studentId=\<id\> | Get single submission by student |
| 24 | POST | /api/assignments/:assignmentId/submissions | Submit assignment files |
| 25 | DELETE | /api/assignments/:assignmentId/submissions/:submissionId | Delete submission |
| 26 | PATCH | /api/assignments/:assignmentId/submissions/:submissionId/grade | Grade a submission |
| 27 | GET | /api/users/:userId/classroom | Get classroom for user |
