import { useEffect, useState } from "react";
import { UserCheck } from "lucide-react";
import { api } from "../api";
import EmptyState from "../components/EmptyState";

export default function Teachers() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classroomTeachers, setClassroomTeachers] = useState<any[]>([]);
  const isAdmin = localStorage.getItem("role") === "admin";

  const load = () => {
    api.getTeachers().then(setTeachers).catch(() => {});
    api.getClassroomTeachers().then(setClassroomTeachers).catch(() => {});
  };

  useEffect(() => { load(); }, []);

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
      <div className="page-header page-header--coral">
        <h2>Colleagues</h2>
        <p>
          {isAdmin
            ? "Add or remove teachers from the classroom."
            : "View the teachers who share your classroom."}
        </p>
      </div>

      {teachers.length === 0 && (
        <EmptyState
          icon={UserCheck}
          title="No colleagues yet"
          description="Colleagues will appear here once they register."
          tone="coral"
        />
      )}

      {teachers.map(teacher => (
        <div className="card" key={teacher.id}>
          <div className="card-info">
            <h3>
              {teacher.name}
              <span className={`tag ${isInClassroom(teacher.id) ? "tag-green" : "tag-muted"}`}>
                {isInClassroom(teacher.id) ? "In your class" : "Not in class yet"}
              </span>
            </h3>
            <p>{teacher.email}</p>
          </div>
          {isAdmin && (
            <button
              className={`btn ${isInClassroom(teacher.id) ? "btn-danger" : "btn-success"}`}
              onClick={() => handleToggle(teacher)}
            >
              {isInClassroom(teacher.id) ? "Remove from class" : "Add to class"}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
