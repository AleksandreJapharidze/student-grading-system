import { useEffect, useState } from "react";
import { api } from "../api";

export default function Classroom() {
  const [classroom, setClassroom] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classroomName, setClassroomName] = useState("");
  const [message, setMessage] = useState("");

  const load = () => {
    api.getClassroom().then(setClassroom).catch(() => setClassroom(null));
    api.getClassroomStudents().then(setStudents).catch(() => {});
    api.getClassroomTeachers().then(setTeachers).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!classroomName) return setMessage("Please enter a classroom name.");
    await api.createClassroom(classroomName);
    setClassroomName("");
    setMessage("Classroom created!");
    load();
  };

  return (
    <div>
      <h2>Classroom</h2>

      {!classroom ? (
        <div className="form">
          <p className="empty" style={{ marginBottom: "1rem" }}>No classroom exists yet. Create one!</p>
          <label>Classroom Name</label>
          <input value={classroomName} onChange={e => setClassroomName(e.target.value)} placeholder="e.g. Math 101" />
          {message && <p className="success">{message}</p>}
          <button className="btn btn-primary" onClick={handleCreate}>Create Classroom</button>
        </div>
      ) : (
        <>
          <div className="card">
            <div className="card-info">
              <h3>{classroom.name}</h3>
              <p>ID: {classroom.id}</p>
            </div>
          </div>

          <h2 style={{ marginTop: "2rem" }}>Teachers ({teachers.length})</h2>
          {teachers.length === 0 && <p className="empty">No teachers assigned yet.</p>}
          {teachers.map(t => (
            <div className="card" key={t.id}>
              <div className="card-info">
                <h3>{t.name}</h3>
                <p>{t.email}</p>
              </div>
            </div>
          ))}

          <h2 style={{ marginTop: "2rem" }}>Students ({students.length})</h2>
          {students.length === 0 && <p className="empty">No students assigned yet.</p>}
          {students.map(s => (
            <div className="card" key={s.id}>
              <div className="card-info">
                <h3>{s.name}</h3>
                <p>{s.email}</p>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}