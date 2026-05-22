import { useEffect, useState } from "react";
import { api } from "../api";

export default function Students() {
  const [students, setStudents] = useState<any[]>([]);
  const [classroomStudents, setClassroomStudents] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const load = () => {
    api.getStudents().then(setStudents).catch(() => {});
    api.getClassroomStudents().then(setClassroomStudents).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!name || !email) return setMessage("Please fill in all fields.");
    await api.createStudent({ name, email });
    setName("");
    setEmail("");
    setMessage("Student created!");
    load();
  };

  const isInClassroom = (id: number) => classroomStudents.some(s => s.id === id);

  const handleToggle = async (student: any) => {
    if (isInClassroom(student.id)) {
      await api.removeStudentFromClassroom(student.id);
    } else {
      await api.addStudentToClassroom(student.id);
    }
    load();
  };

  return (
    <div>
      <h2>Students</h2>

      <div className="form">
        <label>Name</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" />
        <label>Email</label>
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="john@email.com" />
        {message && <p className="success">{message}</p>}
        <button className="btn btn-primary" onClick={handleCreate}>Add Student</button>
      </div>

      {students.length === 0 && <p className="empty">No students yet.</p>}

      {students.map(student => (
        <div className="card" key={student.id}>
          <div className="card-info">
            <h3>{student.name} <span className="tag">{isInClassroom(student.id) ? "In Classroom" : "Not Assigned"}</span></h3>
            <p>{student.email}</p>
          </div>
          <button
            className={`btn ${isInClassroom(student.id) ? "btn-danger" : "btn-success"}`}
            onClick={() => handleToggle(student)}
          >
            {isInClassroom(student.id) ? "Remove" : "Add to Class"}
          </button>
        </div>
      ))}
    </div>
  );
}