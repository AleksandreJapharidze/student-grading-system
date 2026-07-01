const BASE = "http://localhost:3001/api";

const getToken = () => localStorage.getItem("token") || "";
const authHeaders = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${getToken()}`
});

export const api = {
  // Auth
  login: (email: string, password: string) =>
    fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }).then(r => r.json()),

  registerStudent: (data: { name: string; email: string; password: string }) =>
    fetch(`${BASE}/students/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  registerTeacher: (data: { name: string; email: string; password: string }) =>
    fetch(`${BASE}/teachers/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  // Students
  getStudents: () => fetch(`${BASE}/students`, { headers: authHeaders() }).then(r => r.json()),

  // Teachers
  getTeachers: () => fetch(`${BASE}/teachers`, { headers: authHeaders() }).then(r => r.json()),

  // Classroom
  getClassroom: () => fetch(`${BASE}/classroom`, { headers: authHeaders() }).then(r => {
    if (!r.ok) throw new Error("No classroom");
    return r.json();
  }),
  createClassroom: (name: string) =>
    fetch(`${BASE}/classroom`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ name }),
    }).then(r => r.json()),
  getClassroomStudents: () => fetch(`${BASE}/classroom/students`, { headers: authHeaders() }).then(r => r.json()),
  getClassroomTeachers: () => fetch(`${BASE}/classroom/teachers`, { headers: authHeaders() }).then(r => r.json()),
  addStudentToClassroom: (id: number) =>
    fetch(`${BASE}/classroom/students/${id}`, { method: "PATCH", headers: authHeaders() }).then(r => r.text()),
  removeStudentFromClassroom: (id: number) =>
    fetch(`${BASE}/classroom/students/${id}`, { method: "DELETE", headers: authHeaders() }).then(r => r.text()),
  addTeacherToClassroom: (id: number) =>
    fetch(`${BASE}/classroom/teachers/${id}`, { method: "PATCH", headers: authHeaders() }).then(r => r.text()),
  removeTeacherFromClassroom: (id: number) =>
    fetch(`${BASE}/classroom/teachers/${id}`, { method: "DELETE", headers: authHeaders() }).then(r => r.text()),

  // Assignments
  getAssignments: () => fetch(`${BASE}/classroom/assignments`, { headers: authHeaders() }).then(r => r.json()),
  createAssignment: (data: { task: string; deadline: string; classroomId: number }) =>
    fetch(`${BASE}/assignments`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    }).then(r => r.json()),
  deleteAssignment: (id: number) =>
    fetch(`${BASE}/assignments/${id}`, { method: "DELETE", headers: authHeaders() }),

  // Submissions
  submitAssignment: (assignmentId: number, content: string) =>
    fetch(`${BASE}/assignments/${assignmentId}/submissions`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ content }),
    }).then(r => r.json()),
  getSubmissions: (assignmentId: number) =>
    fetch(`${BASE}/assignments/${assignmentId}/submissions`, { headers: authHeaders() }).then(r => r.json()),
  gradeSubmission: (assignmentId: number, submissionId: number, grade: number) =>
    fetch(`${BASE}/assignments/${assignmentId}/submissions/${submissionId}/grade`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ grade }),
    }).then(r => r.json()),
  getMySubmissions: (studentId: number) =>
    fetch(`${BASE}/students/${studentId}/submissions`, { headers: authHeaders() }).then(r => r.json()),
};