import { useEffect, useState } from "react";
import { api } from "../api";

export default function Dashboard() {
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classroom, setClassroom] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);

  const role = localStorage.getItem("role");

  useEffect(() => {
    api.getStudents().then(d => Array.isArray(d) ? setStudents(d) : {}).catch(() => {});
    api.getTeachers().then(d => Array.isArray(d) ? setTeachers(d) : {}).catch(() => {});
    api.getClassroom().then(setClassroom).catch(() => {});
    api.getAssignments().then(d => Array.isArray(d) ? setAssignments(d) : {}).catch(() => {});
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>

      <div className="stats">
        {role === "teacher" && (
          <>
            <div className="stat-card">
              <span>{students.length}</span>
              <p>Total Students</p>
            </div>
            <div className="stat-card">
              <span>{teachers.length}</span>
              <p>Total Teachers</p>
            </div>
            <div className="stat-card">
              <span>{classroom ? 1 : 0}</span>
              <p>Classroom</p>
            </div>
          </>
        )}
        <div className="stat-card">
          <span>{assignments.length}</span>
          <p>Assignments</p>
        </div>
      </div>

      {role === "teacher" && (
        <div className="card">
          <div className="card-info">
            <h3>Classroom</h3>
            <p>{classroom ? classroom.name : "No classroom created yet"}</p>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-info">
          <h3>Recent Assignments</h3>
          <p>{assignments.length === 0 ? "No assignments yet" : assignments.slice(0, 3).map((a: any) => a.task).join(", ")}</p>
        </div>
      </div>

      {role === "teacher" && (
        <>
          <div className="card">
            <div className="card-info">
              <h3>Recent Students</h3>
              <p>{students.length === 0 ? "No students yet" : students.slice(0, 3).map((s: any) => s.name).join(", ")}</p>
            </div>
          </div>
          <div className="card">
            <div className="card-info">
              <h3>Recent Teachers</h3>
              <p>{teachers.length === 0 ? "No teachers yet" : teachers.slice(0, 3).map((t: any) => t.name).join(", ")}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}