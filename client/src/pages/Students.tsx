import { useEffect, useState } from "react";
import { TrendingUp, Users } from "lucide-react";
import { api } from "../api";
import EmptyState from "../components/EmptyState";
import ProgressChart from "../components/ProgressChart";

export default function Students() {
  const [students, setStudents] = useState<any[]>([]);
  const [classroomStudents, setClassroomStudents] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);

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
        <div className="card-stack" key={student.id}>
          <div className="card">
            <div className="card-info">
              <h3>
                {student.name}
                <span className={`tag ${isInClassroom(student.id) ? "tag-green" : "tag-muted"}`}>
                  {isInClassroom(student.id) ? "In your class" : "Not in class yet"}
                </span>
              </h3>
              <p>{student.email}</p>
            </div>
            <div className="btn-group">
              {isInClassroom(student.id) && (
                <button
                  className="btn btn-secondary"
                  onClick={() => setExpandedId(prev => (prev === student.id ? null : student.id))}
                >
                  <TrendingUp size={15} strokeWidth={2} aria-hidden />
                  {expandedId === student.id ? "Hide progress" : "View progress"}
                </button>
              )}
              <button
                className={`btn ${isInClassroom(student.id) ? "btn-danger" : "btn-success"}`}
                onClick={() => handleToggle(student)}
              >
                {isInClassroom(student.id) ? "Remove from class" : "Add to class"}
              </button>
            </div>
          </div>

          {expandedId === student.id && (
            <div className="card-panel">
              <p className="card-panel-title">Grade trend</p>
              <ProgressChart studentId={student.id} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
