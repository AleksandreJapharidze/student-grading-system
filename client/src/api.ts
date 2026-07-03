const BASE = "https://student-grading-system-nxfc.onrender.com/api";

const getToken = () => localStorage.getItem("token") || "";

const clearSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("userId");
};

const authFetch = (url: string, options: RequestInit = {}) => {
  const token = getToken();
  if (!token) {
    clearSession();
    window.location.href = "/login";
    return Promise.reject(new Error("Not authenticated"));
  }

  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  }).then(async r => {
    if (r.status === 401) {
      clearSession();
      window.location.href = "/login";
      throw new Error("Session expired. Please sign in again.");
    }
    return r;
  });
};

const authFormFetch = (url: string, options: RequestInit = {}) => {
  const token = getToken();
  if (!token) {
    clearSession();
    window.location.href = "/login";
    return Promise.reject(new Error("Not authenticated"));
  }

  return fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  }).then(async r => {
    if (r.status === 401) {
      clearSession();
      window.location.href = "/login";
      throw new Error("Session expired. Please sign in again.");
    }
    return r;
  });
};

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
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
  getStudents: () => authFetch(`${BASE}/students`).then(r => r.json()),

  // Teachers
  getTeachers: () => authFetch(`${BASE}/teachers`).then(r => r.json()),

  // Classroom
  getClassroom: () => authFetch(`${BASE}/classroom`).then(r => {
    if (!r.ok) throw new Error("No classroom");
    return r.json();
  }),
  createClassroom: (name: string) =>
    authFetch(`${BASE}/classroom`, {
      method: "POST",
      body: JSON.stringify({ name }),
    }).then(r => r.json()),
  getClassroomStudents: () => authFetch(`${BASE}/classroom/students`).then(r => r.json()),
  getClassroomTeachers: () => authFetch(`${BASE}/classroom/teachers`).then(r => r.json()),
  addStudentToClassroom: (id: number) =>
    authFetch(`${BASE}/classroom/students/${id}`, { method: "PATCH" }).then(r => r.text()),
  removeStudentFromClassroom: (id: number) =>
    authFetch(`${BASE}/classroom/students/${id}`, { method: "DELETE" }).then(r => r.text()),
  addTeacherToClassroom: (id: number) =>
    authFetch(`${BASE}/classroom/teachers/${id}`, { method: "PATCH" }).then(r => r.text()),
  removeTeacherFromClassroom: (id: number) =>
    authFetch(`${BASE}/classroom/teachers/${id}`, { method: "DELETE" }).then(r => r.text()),

  // Assignments
  getAssignments: () => authFetch(`${BASE}/classroom/assignments`).then(r => r.json()),
  createAssignment: (data: { task: string; deadline: string; minScore?: number; maxScore: number }) =>
    authFetch(`${BASE}/assignments`, {
      method: "POST",
      body: JSON.stringify(data),
    }).then(async r => {
      const body = await r.json();
      if (!r.ok) throw new Error(body.message || "Could not create assignment");
      return body;
    }),
  deleteAssignment: (id: number) =>
    authFetch(`${BASE}/assignments/${id}`, { method: "DELETE" }),

  // Submissions — files must use multipart/form-data with key "files"
  submitAssignment: async (assignmentId: number, data: { content?: string; files?: File[] }) => {
    const content = data.content?.trim() ?? "";
    const files = data.files ?? [];

    if (!content && files.length === 0) {
      throw new Error("Write something, attach a file, or both before submitting.");
    }

    let response: Response;

    if (files.length > 0) {
      const formData = new FormData();
      for (const file of files) {
        formData.append("files", file);
      }
      if (content) {
        formData.append("content", content);
      }
      response = await authFormFetch(`${BASE}/assignments/${assignmentId}/submissions`, {
        method: "POST",
        body: formData,
      });
    } else {
      response = await authFetch(`${BASE}/assignments/${assignmentId}/submissions`, {
        method: "POST",
        body: JSON.stringify({ content }),
      });
    }

    const body = await response.json();
    if (!response.ok) throw new Error(body.message || "Submission failed");
    return body;
  },
  getSubmissions: (assignmentId: number) =>
    authFetch(`${BASE}/assignments/${assignmentId}/submissions`).then(r => r.json()),
  getMySubmission: async (assignmentId: number, studentId: number) => {
    const token = getToken();
    if (!token) {
      clearSession();
      window.location.href = "/login";
      throw new Error("Not authenticated");
    }

    const r = await fetch(
      `${BASE}/assignments/${assignmentId}/submissions?studentId=${studentId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (r.status === 401) {
      clearSession();
      window.location.href = "/login";
      throw new Error("Session expired. Please sign in again.");
    }

    const body = await r.json();
    if (!r.ok) throw new Error(body.message || "Could not load submission");

    if (body === null || body.submission === null) return null;
    return body.submission ?? body;
  },
  gradeSubmission: async (assignmentId: number, submissionId: number, grade: number) => {
    const r = await authFetch(`${BASE}/assignments/${assignmentId}/submissions/${submissionId}/grade`, {
      method: "PATCH",
      body: JSON.stringify({ grade }),
    });
    const body = await r.json();
    if (!r.ok) throw new Error(body.message || "Could not save grade");
    return body;
  },
  getMySubmissions: (studentId: number) =>
    authFetch(`${BASE}/students/${studentId}/submissions`).then(r => r.json()),

  // Progress
  getStudentProgress: (studentId: number) =>
    authFetch(`${BASE}/students/${studentId}/progress`).then(r => r.json()),
};
