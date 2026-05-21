const BASE = "http://localhost:3000/api";

export const api = {
  getStudents: () => fetch(`${BASE}/students`).then(r => r.json()),
  createStudent: (data: { name: string; email: string }) =>
    fetch(`${BASE}/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, role: "student" }),
    }).then(r => r.json()),

  getTeachers: () => fetch(`${BASE}/teachers`).then(r => r.json()),
  createTeacher: (data: { name: string; email: string }) =>
    fetch(`${BASE}/teachers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, role: "teacher" }),
    }).then(r => r.json()),

  getClassroom: () => fetch(`${BASE}/classroom`).then(r => {
    if (!r.ok) throw new Error("No classroom");
    return r.json();
  }),
  createClassroom: (name: string) =>
    fetch(`${BASE}/classroom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    }).then(r => r.json()),
  getClassroomStudents: () => fetch(`${BASE}/classroom/students`).then(r => r.json()),
  getClassroomTeachers: () => fetch(`${BASE}/classroom/teachers`).then(r => r.json()),
  addStudentToClassroom: (id: number) =>
    fetch(`${BASE}/classroom/students/${id}`, { method: "PATCH" }).then(r => r.text()),
  removeStudentFromClassroom: (id: number) =>
    fetch(`${BASE}/classroom/students/${id}`, { method: "DELETE" }).then(r => r.text()),
  addTeacherToClassroom: (id: number) =>
    fetch(`${BASE}/classroom/teachers/${id}`, { method: "PATCH" }).then(r => r.text()),
  removeTeacherFromClassroom: (id: number) =>
    fetch(`${BASE}/classroom/teachers/${id}`, { method: "DELETE" }).then(r => r.text()),
};