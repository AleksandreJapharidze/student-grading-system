import { useEffect, useState } from "react";
import { api } from "../api";

export default function Teachers() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classroomTeachers, setClassroomTeachers] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const load = () => {
    api.getTeachers().then(setTeachers).catch(() => {});
    api.getClassroomTeachers().then(setClassroomTeachers).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!name || !email) return setMessage("Please fill in all fields.");
    await api.createTeacher({ name, email });
    setName("");
    setEmail("");
    setMessage("Teacher created!");
    load();
  };

  const isInClassroom = (id: number) => classroomTeachers.some(t => t.id === id);

  const handleToggle = async (teacher: any) => {
    if (isInClassroom(teacher.id)) {
      await api.removeTeacherFromClassroom(teacher.id);
    } else {
      await api.addTeacherToClassroom(teacher.id);
    }
    load();
  };

  return (
    <div>
      <h2>Teachers</h2>

      <div className="form">
        <label>Name</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Jane Smith" />
        <label>Email</label>
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@email.com" />
        {message && <p className="success">{message}</p>}
        <button className="btn btn-primary" onClick={handleCreate}>Add Teacher</button>
      </div>

      {teachers.length === 0 && <p className="empty">No teachers yet.</p>}

      {teachers.map(teacher => (
        <div className="card" key={teacher.id}>
          <div className="card-info">
            <h3>{teacher.name} <span className="tag">{isInClassroom(teacher.id) ? "In Classroom" : "Not Assigned"}</span></h3>
            <p>{teacher.email}</p>
          </div>
          <button
            className={`btn ${isInClassroom(teacher.id) ? "btn-danger" : "btn-success"}`}
            onClick={() => handleToggle(teacher)}
          >
            {isInClassroom(teacher.id) ? "Remove" : "Add to Class"}
          </button>
        </div>
      ))}
    </div>
  );
}