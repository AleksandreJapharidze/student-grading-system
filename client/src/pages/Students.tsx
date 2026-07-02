import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { api } from "../api";
import EmptyState from "../components/EmptyState";

export default function Students() {
  const [students, setStudents] = useState<any[]>([]);
  const [classroomStudents, setClassroomStudents] = useState<any[]>([]);

  const load = () => {
    api.getStudents().then(setStudents).catch(() => {});
    api.getClassroomStudents().then(setClassroomStudents).catch(() => {});
  };

  useEffect(() => { load(); }, []);

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
      <div className="page-header page-header--teal">
        <h2>Students</h2>
        <p>Invite registered students into your classroom when you are ready.</p>
      </div>

      {students.length === 0 && (
        <EmptyState
          icon={Users}
          title="No students yet"
          description="Students will appear here once they register."
          tone="teal"
        />
      )}

      {students.map(student => (
        <div className="card" key={student.id}>
          <div className="card-info">
            <h3>
              {student.name}
              <span className={`tag ${isInClassroom(student.id) ? "tag-green" : "tag-muted"}`}>
                {isInClassroom(student.id) ? "In your class" : "Not in class yet"}
              </span>
            </h3>
            <p>{student.email}</p>
          </div>
          <button
            className={`btn ${isInClassroom(student.id) ? "btn-danger" : "btn-success"}`}
            onClick={() => handleToggle(student)}
          >
            {isInClassroom(student.id) ? "Remove from class" : "Add to class"}
          </button>
        </div>
      ))}
    </div>
  );
}
