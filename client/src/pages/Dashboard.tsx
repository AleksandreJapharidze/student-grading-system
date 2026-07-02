import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ClipboardList, Plus, Users } from "lucide-react";
import { api } from "../api";
import EmptyState from "../components/EmptyState";

type Assignment = { id: number; task: string; deadline: string };
type Person = { id: number; name: string; email: string };

function isOverdue(deadline: string) {
  return new Date(deadline) < new Date();
}

function isDueThisWeek(deadline: string) {
  const now = new Date();
  const due = new Date(deadline);
  const weekEnd = new Date(now);
  weekEnd.setDate(weekEnd.getDate() + 7);
  return due >= now && due <= weekEnd;
}

function dueStatus(deadline: string): "overdue" | "soon" | "later" {
  if (isOverdue(deadline)) return "overdue";
  const days = (new Date(deadline).getTime() - Date.now()) / 86_400_000;
  if (days <= 3) return "soon";
  return "later";
}

function formatDue(deadline: string) {
  return new Date(deadline).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: new Date(deadline).getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
}

function daysUntil(deadline: string) {
  const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86_400_000);
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `${days}d`;
}

function buildSummary(
  isTeacher: boolean,
  classroom: { name: string } | null,
  students: Person[],
  teachers: Person[],
  assignments: Assignment[],
) {
  const parts: string[] = [];

  if (isTeacher && students.length > 0) {
    parts.push(`${students.length} student${students.length === 1 ? "" : "s"}`);
  }
  if (isTeacher && teachers.length > 1) {
    parts.push(`${teachers.length} teachers`);
  }
  if (assignments.length > 0) {
    parts.push(`${assignments.length} assignment${assignments.length === 1 ? "" : "s"}`);
    const overdue = assignments.filter(a => isOverdue(a.deadline)).length;
    const thisWeek = assignments.filter(a => isDueThisWeek(a.deadline)).length;
    if (overdue > 0) parts.push(`${overdue} overdue`);
    else if (thisWeek > 0) parts.push(`${thisWeek} due this week`);
  } else if (classroom) {
    parts.push("No assignments yet");
  }

  return parts.length > 0 ? parts.join(" · ") : null;
}

const STATUS_LABEL = { overdue: "Overdue", soon: "Due soon", later: "Upcoming" } as const;

export default function Dashboard() {
  const [students, setStudents] = useState<Person[]>([]);
  const [teachers, setTeachers] = useState<Person[]>([]);
  const [classroom, setClassroom] = useState<{ id: number; name: string } | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const role = localStorage.getItem("role");
  const isTeacher = role === "teacher";

  useEffect(() => {
    api.getStudents().then(d => Array.isArray(d) ? setStudents(d) : {}).catch(() => {});
    api.getTeachers().then(d => Array.isArray(d) ? setTeachers(d) : {}).catch(() => {});
    api.getClassroom().then(setClassroom).catch(() => {});
    api.getAssignments().then(d => Array.isArray(d) ? setAssignments(d) : {}).catch(() => {});
  }, []);

  const summary = buildSummary(isTeacher, classroom, students, teachers, assignments);

  const sortedAssignments = [...assignments].sort(
    (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
  );

  const upcoming = sortedAssignments
    .filter(a => !isOverdue(a.deadline))
    .slice(0, 4);

  const overdueCount = assignments.filter(a => isOverdue(a.deadline)).length;

  return (
    <div className="dash">
      <div className="dash-body">
        <header className="dash-header">
          <div className="dash-header__main">
            <h1 className="dash-title">{classroom?.name ?? "Gradebook"}</h1>
            {summary && <p className="dash-summary">{summary}</p>}
          </div>
          {isTeacher && (
            <Link to="/assignments" className="btn btn-primary btn-sm">
              <Plus size={15} strokeWidth={2.5} aria-hidden />
              New assignment
            </Link>
          )}
        </header>

        <div className={`dash-grid${isTeacher ? " dash-grid--split" : ""}`}>
          <section className="panel panel--assignments">
            <div className="panel-head panel-head--indigo">
              <h2 className="panel-title">Assignments</h2>
              <Link to="/assignments" className="btn btn-ghost btn-sm">View all</Link>
            </div>

            {sortedAssignments.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title="No assignments yet"
                description={
                  isTeacher
                    ? "Post your first assignment to get students started."
                    : "Your teacher has not posted anything yet."
                }
                tone="accent"
              >
                {isTeacher && (
                  <Link to="/assignments" className="btn btn-primary">
                    <Plus size={15} strokeWidth={2.5} aria-hidden />
                    Create assignment
                  </Link>
                )}
              </EmptyState>
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="col-task">Task</th>
                      <th className="col-date">Due</th>
                      <th className="col-status">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedAssignments.map(a => {
                      const status = dueStatus(a.deadline);
                      return (
                        <tr key={a.id} className="data-table__row--clickable">
                          <td className="col-task">
                            <span className="cell-primary">{a.task}</span>
                          </td>
                          <td className="col-date">
                            <span className="tabular">{formatDue(a.deadline)}</span>
                          </td>
                          <td className="col-status">
                            <span className={`badge badge--${status}`}>
                              {STATUS_LABEL[status]}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {isTeacher && (
            <aside className="panel panel--roster">
              <div className="panel-head panel-head--teal">
                <h2 className="panel-title">Roster</h2>
                <span className="panel-meta tabular">{students.length}</span>
              </div>

              {students.length === 0 ? (
                <EmptyState icon={Users} title="No students" compact tone="teal">
                  <Link to="/students" className="btn btn-ghost btn-sm btn-block">
                    Add students
                  </Link>
                </EmptyState>
              ) : (
                <div className="table-wrap">
                  <table className="data-table data-table--compact">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th className="col-email">Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map(s => (
                        <tr key={s.id}>
                          <td><span className="cell-primary">{s.name}</span></td>
                          <td className="col-email muted">{s.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {!classroom && (
                <div className="panel-callout panel-callout--teal">
                  <Link to="/classroom" className="link-accent link-with-icon">
                    Set up classroom
                    <ChevronRight size={14} strokeWidth={2} aria-hidden />
                  </Link>
                </div>
              )}
            </aside>
          )}
        </div>

        {assignments.length > 0 && (
          <section className="panel panel--upcoming">
            <div className="panel-head panel-head--amber">
              <h2 className="panel-title">Coming up</h2>
              {overdueCount > 0 && (
                <span className="badge badge--overdue">{overdueCount} overdue</span>
              )}
            </div>
            <ul className="due-list">
              {upcoming.length === 0 ? (
                <li className="due-list__empty muted">All caught up. Nothing due ahead.</li>
              ) : (
                upcoming.map(a => (
                  <li key={a.id} className="due-list__item">
                    <span className="due-list__task">{a.task}</span>
                    <span className={`badge badge--${dueStatus(a.deadline)} badge--sm`}>
                      {daysUntil(a.deadline)}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
