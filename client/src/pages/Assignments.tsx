import { useEffect, useState } from "react";
import { api } from "../api";

export default function Assignments() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [task, setTask] = useState("");
  const [deadline, setDeadline] = useState("");
  const [message, setMessage] = useState("");
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [submitContent, setSubmitContent] = useState("");
  const [gradeInputs, setGradeInputs] = useState<{ [key: number]: string }>({});

  const role = localStorage.getItem("role");

  const load = () => {
    api.getAssignments().then(d => Array.isArray(d) ? setAssignments(d) : {}).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!task || !deadline) return setMessage("Please fill in all fields.");
    const classroom = await api.getClassroom().catch(() => null);
    if (!classroom) return setMessage("No classroom found.");
    const res = await api.createAssignment({ task, deadline, classroomId: classroom.id });
    if (res.message === "Assignment created successfully") {
      setTask("");
      setDeadline("");
      setMessage("Assignment created!");
      load();
    } else {
      setMessage(res.message || "Failed to create assignment.");
    }
  };

  const handleDelete = async (id: number) => {
    await api.deleteAssignment(id);
    load();
  };

  const handleViewSubmissions = async (assignment: any) => {
    setSelectedAssignment(assignment);
    const subs = await api.getSubmissions(assignment.id);
    Array.isArray(subs) ? setSubmissions(subs) : setSubmissions([]);
  };

  const handleSubmit = async (assignmentId: number) => {
    const res = await api.submitAssignment(assignmentId, submitContent);
    setMessage(res.message || "Submitted!");
    setSubmitContent("");
    load();
  };

  const handleGrade = async (assignmentId: number, submissionId: number) => {
    const grade = Number(gradeInputs[submissionId]);
    if (isNaN(grade) || grade < 0 || grade > 10) return setMessage("Grade must be 0-10.");
    const res = await api.gradeSubmission(assignmentId, submissionId, grade);
    setMessage(res.message || "Graded!");
    handleViewSubmissions(selectedAssignment);
  };

  return (
    <div>
      <h2>Assignments</h2>

      {role === "teacher" && (
        <div className="form">
          <label>Task Description</label>
          <input value={task} onChange={e => setTask(e.target.value)} placeholder="Write a report on..." />
          <label>Deadline</label>
          <input type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)} />
          {message && <p className="success">{message}</p>}
          <button className="btn btn-primary" onClick={handleCreate}>Create Assignment</button>
        </div>
      )}

      {assignments.length === 0 && <p className="empty">No assignments yet.</p>}

      {assignments.map(a => (
        <div key={a.id} style={{ marginBottom: "1rem" }}>
          <div className="card">
            <div className="card-info">
              <h3>{a.task}</h3>
              <p>Deadline: {new Date(a.deadline).toLocaleString()}</p>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {role === "teacher" && (
                <>
                  <button className="btn btn-primary" onClick={() => handleViewSubmissions(a)}>Submissions</button>
                  <button className="btn btn-danger" onClick={() => handleDelete(a.id)}>Delete</button>
                </>
              )}
              {role === "student" && (
                <button className="btn btn-success" onClick={() => setSelectedAssignment(a)}>Submit</button>
              )}
            </div>
          </div>

          {selectedAssignment?.id === a.id && role === "student" && (
            <div className="card" style={{ flexDirection: "column", alignItems: "flex-start" }}>
              <label style={{ marginBottom: "0.5rem", color: "#94a3b8" }}>Your submission</label>
              <textarea value={submitContent} onChange={e => setSubmitContent(e.target.value)} placeholder="Write your answer here..." style={{ width: "100%", marginBottom: "0.8rem" }} />
              {message && <p className="success">{message}</p>}
              <button className="btn btn-primary" onClick={() => handleSubmit(a.id)}>Submit</button>
            </div>
          )}

          {selectedAssignment?.id === a.id && role === "teacher" && (
            <div style={{ paddingLeft: "1rem" }}>
              {submissions.length === 0 && <p className="empty">No submissions yet.</p>}
              {submissions.map(s => (
                <div className="card" key={s.id} style={{ flexDirection: "column", alignItems: "flex-start" }}>
                  <div className="card-info" style={{ marginBottom: "0.8rem" }}>
                    <h3>{s.student?.name}</h3>
                    <p>{s.content || "No content submitted"}</p>
                    <p style={{ marginTop: "0.3rem" }}>
                      Grade: <span className="tag">{s.grade ?? "Not graded"}</span>
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <input
                      style={{ width: "80px", marginBottom: 0 }}
                      type="number"
                      min="0"
                      max="10"
                      placeholder="0-10"
                      value={gradeInputs[s.id] || ""}
                      onChange={e => setGradeInputs(prev => ({ ...prev, [s.id]: e.target.value }))}
                    />
                    <button className="btn btn-primary" onClick={() => handleGrade(a.id, s.id)}>Grade</button>
                  </div>
                </div>
              ))}
              {message && <p className="success">{message}</p>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}