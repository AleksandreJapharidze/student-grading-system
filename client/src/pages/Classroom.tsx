import { useEffect, useState } from "react";
import { GraduationCap, School, UserCheck } from "lucide-react";
import { api } from "../api";
import EmptyState from "../components/EmptyState";

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
    if (!classroomName) return setMessage("Give your classroom a name first.");
    await api.createClassroom(classroomName);
    setClassroomName("");
    setMessage(`"${classroomName}" is ready to go!`);
    load();
  };

  return (
    <div>
      <div className="page-header page-header--indigo">
        <h2>My Classroom</h2>
        <p>This is where your students and colleagues come together.</p>
      </div>

      {!classroom ? (
        <div className="form">
          <p className="form-title">Set up your classroom</p>
          <p className="form-hint">
            You do not have a classroom yet. Pick a name and we will create one for you.
          </p>
          <label>What should we call it?</label>
          <input value={classroomName} onChange={e => setClassroomName(e.target.value)} placeholder="e.g. English 10B, Period 3" />
          {message && <p className="success">{message}</p>}
          <button className="btn btn-primary" onClick={handleCreate}>
            <School size={15} strokeWidth={2} aria-hidden />
            Create classroom
          </button>
        </div>
      ) : (
        <>
          <div className="card card--highlight">
            <div className="card-info">
              <h3>{classroom.name}</h3>
              <p>Your classroom is up and running.</p>
            </div>
          </div>

          <h3 className="section-title">Teachers ({teachers.length})</h3>
          {teachers.length === 0 && (
            <EmptyState
              icon={UserCheck}
              title="No teachers assigned"
              description="Add colleagues from the Colleagues page."
              compact
              tone="coral"
            />
          )}
          {teachers.map(t => (
            <div className="card" key={t.id}>
              <div className="card-info">
                <h3>{t.name}</h3>
                <p>{t.email}</p>
              </div>
            </div>
          ))}

          <h3 className="section-title">Students ({students.length})</h3>
          {students.length === 0 && (
            <EmptyState
              icon={GraduationCap}
              title="No students here yet"
              description="Invite them from the Students page."
              compact
              tone="teal"
            />
          )}
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
