import { useEffect, useState } from "react";
import { api } from "../api";

export default function Dashboard() {
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classroom, setClassroom] = useState<any>(null);

  useEffect(() => {
    api.getStudents().then(setStudents).catch(() => {});
    api.getTeachers().then(setTeachers).catch(() => {});
    api.getClassroom().then(setClassroom).catch(() => {});
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      <div className="stats">
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
      </div>

      <div className="card">
        <div className="card-info">
          <h3>Classroom</h3>
          <p>{classroom ? classroom.name : "No classroom created yet"}</p>
        </div>
      </div>

      <div className="card">
        <div className="card-info">
          <h3>Recent Students</h3>
          <p>{students.length === 0 ? "No students yet" : students.slice(0, 3).map(s => s.name).join(", ")}</p>
        </div>
      </div>

      <div className="card">
        <div className="card-info">
          <h3>Recent Teachers</h3>
          <p>{teachers.length === 0 ? "No teachers yet" : teachers.slice(0, 3).map(t => t.name).join(", ")}</p>
        </div>
      </div>
    </div>
  );
}