import { useEffect, useRef, useState } from "react";
import { ClipboardList, Eye, FileText, Paperclip, Plus, Send, Trash2, X } from "lucide-react";
import { api } from "../api";
import EmptyState from "../components/EmptyState";

function formatDeadline(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function gradeTagClass(grade: number | null | undefined, maxScore: number, minScore = 0) {
  if (grade == null) return "tag-yellow";
  const range = maxScore - minScore;
  const pct = range > 0 ? (grade - minScore) / range : 0;
  if (pct >= 0.7) return "tag-green";
  if (pct >= 0.4) return "tag-yellow";
  return "tag-red";
}

function getMinScore(assignment: { minScore?: number | null }) {
  return assignment.minScore ?? 0;
}

function formatGradeRange(assignment: { minScore?: number | null; maxScore: number }) {
  const min = getMinScore(assignment);
  return min > 0 ? `${min}–${assignment.maxScore}` : `0–${assignment.maxScore}`;
}

function fileDisplayName(path: string) {
  const name = path.split("/").pop() ?? "Attached file";
  return name.replace(/^\d+-/, "");
}

function getFileUrl(file: { path?: string; filePath?: string }) {
  return file.path ?? file.filePath ?? "";
}

function SubmissionFiles({ files, showEmpty = false }: { files: { id: number; path?: string; filePath?: string }[]; showEmpty?: boolean }) {
  const visibleFiles = files.filter(file => getFileUrl(file));

  if (!visibleFiles.length && !showEmpty) return null;

  return (
    <div className="submission-files">
      <p className="submission-files__label">
        <FileText size={14} strokeWidth={2} aria-hidden />
        Attached files ({visibleFiles.length})
      </p>
      {visibleFiles.length === 0 ? (
        <p className="submission-files__empty">No files attached.</p>
      ) : (
        <ul className="file-list file-list--links">
          {visibleFiles.map(file => {
            const url = getFileUrl(file);
            return (
              <li key={file.id}>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  {fileDisplayName(url)}
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function getUserId() {
  const stored = localStorage.getItem("userId");
  if (stored) return Number(stored);

  const token = localStorage.getItem("token");
  if (!token) return 0;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return Number(payload.id);
  } catch {
    return 0;
  }
}

export default function Assignments() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [task, setTask] = useState("");
  const [deadline, setDeadline] = useState("");
  const [minScore, setMinScore] = useState("");
  const [maxScore, setMaxScore] = useState("");
  const [message, setMessage] = useState("");
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [pendingContent, setPendingContent] = useState<Record<number, string>>({});
  const [pendingFiles, setPendingFiles] = useState<Record<number, File[]>>({});
  const [mySubmissions, setMySubmissions] = useState<Record<number, any>>({});
  const [panelMode, setPanelMode] = useState<Record<number, "loading" | "form" | "view">>({});
  const [gradeInputs, setGradeInputs] = useState<{ [key: number]: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeAssignmentIdRef = useRef<number | null>(null);

  const role = localStorage.getItem("role");
  const userId = getUserId();
  const isTeacher = role === "teacher";

  const getPendingFiles = (assignmentId: number) => pendingFiles[assignmentId] ?? [];

  const load = () => {
    api.getAssignments().then(d => Array.isArray(d) ? setAssignments(d) : {}).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const loadMySubmission = async (assignmentId: number) => {
    if (isTeacher || !userId) return null;
    setPanelMode(prev => ({ ...prev, [assignmentId]: "loading" }));
    try {
      const sub = await api.getMySubmission(assignmentId, userId);
      if (sub) {
        setMySubmissions(prev => ({ ...prev, [assignmentId]: sub }));
        setPanelMode(prev => ({ ...prev, [assignmentId]: "view" }));
      } else {
        setMySubmissions(prev => ({ ...prev, [assignmentId]: null }));
        setPanelMode(prev => ({ ...prev, [assignmentId]: "form" }));
      }
      return sub;
    } catch {
      setMySubmissions(prev => ({ ...prev, [assignmentId]: null }));
      setPanelMode(prev => ({ ...prev, [assignmentId]: "form" }));
      return null;
    }
  };

  const openStudentAssignment = async (assignment: any) => {
    setSelectedAssignment(assignment);
    setMessage("");
    activeAssignmentIdRef.current = assignment.id;
    await loadMySubmission(assignment.id);
  };

  const handleCreate = async () => {
    if (!task || !deadline) return setMessage("Add a description and a due date for the assignment.");
    if (!maxScore) return setMessage("Add a maximum score for the assignment.");

    const max = Number(maxScore);
    const min = minScore === "" ? undefined : Number(minScore);

    if (isNaN(max) || max <= 0) return setMessage("Maximum score must be a positive number.");
    if (min !== undefined && (isNaN(min) || min < 0 || min >= max)) {
      return setMessage("Minimum score must be less than maximum score.");
    }

    try {
      await api.createAssignment({ task, deadline, minScore: min, maxScore: max });
      setTask("");
      setDeadline("");
      setMinScore("");
      setMaxScore("");
      setMessage("Assignment posted. Your students can see it now.");
      load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not create the assignment. Please try again.");
    }
  };

  const handleDelete = async (id: number) => {
    await api.deleteAssignment(id);
    if (selectedAssignment?.id === id) setSelectedAssignment(null);
    load();
  };

  const handleViewSubmissions = async (assignment: any) => {
    setSelectedAssignment(assignment);
    const subs = await api.getSubmissions(assignment.id);
    Array.isArray(subs) ? setSubmissions(subs) : setSubmissions([]);
  };

  const handleSubmit = async (assignmentId: number) => {
    const content = pendingContent[assignmentId] ?? "";
    const files = getPendingFiles(assignmentId);

    if (!content.trim() && files.length === 0) {
      return setMessage("Write something, attach a file, or both before submitting.");
    }
    try {
      await api.submitAssignment(assignmentId, { content, files });
      // Fetch submission via GET so we get Supabase file links from the API
      await loadMySubmission(assignmentId);
      setMessage("Submitted. Nice work!");
      setPanelMode(prev => ({ ...prev, [assignmentId]: "view" }));
      setPendingContent(prev => ({ ...prev, [assignmentId]: "" }));
      setPendingFiles(prev => ({ ...prev, [assignmentId]: [] }));
      load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not submit. Please try again.");
    }
  };

  const handleAddFiles = (assignmentId: number, fileList: FileList | null) => {
    if (!fileList?.length) return;
    const picked = Array.from(fileList);
    setPendingFiles(prev => ({
      ...prev,
      [assignmentId]: [...(prev[assignmentId] ?? []), ...picked],
    }));
    setMessage(`Added ${picked.length} file${picked.length === 1 ? "" : "s"}.`);
  };

  const openFilePicker = (assignmentId: number) => {
    activeAssignmentIdRef.current = assignmentId;
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (fileList: FileList | null) => {
    const assignmentId = activeAssignmentIdRef.current;
    if (!assignmentId || !fileList?.length) return;
    handleAddFiles(assignmentId, fileList);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveFile = (assignmentId: number, index: number) => {
    setPendingFiles(prev => ({
      ...prev,
      [assignmentId]: (prev[assignmentId] ?? []).filter((_, i) => i !== index),
    }));
  };

  const handleGrade = async (assignment: any, submissionId: number) => {
    const min = getMinScore(assignment);
    const max = assignment.maxScore;
    const grade = Number(gradeInputs[submissionId]);

    if (isNaN(grade) || grade < min || grade > max) {
      return setMessage(`Grades go from ${min} to ${max}.`);
    }

    try {
      const res = await api.gradeSubmission(assignment.id, submissionId, grade);
      setMessage(res.message || "Grade saved.");
      handleViewSubmissions(assignment);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not save grade.");
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="file-picker__input"
        onChange={e => handleFileInputChange(e.target.files)}
      />

      <div className="page-header page-header--indigo">
        <h2>Assignments</h2>
        <p>
          {isTeacher
            ? "Create assignments, review submissions, and leave grades."
            : "See what is due and turn in your work here."}
        </p>
      </div>

      {isTeacher && (
        <div className="form">
          <p className="form-title">Post a new assignment</p>
          <label>What should students do?</label>
          <input value={task} onChange={e => setTask(e.target.value)} placeholder="e.g. Read chapter 4 and write a one-page summary" />
          <label>Due date</label>
          <input type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)} />
          <label>Minimum score (optional)</label>
          <input
            type="number"
            min="0"
            value={minScore}
            onChange={e => setMinScore(e.target.value)}
            placeholder="e.g. 0"
          />
          <label>Maximum score</label>
          <input
            type="number"
            min="1"
            value={maxScore}
            onChange={e => setMaxScore(e.target.value)}
            placeholder="e.g. 20"
          />
          {message && !selectedAssignment && <p className="success">{message}</p>}
          <button className="btn btn-primary" onClick={handleCreate}>
            <Plus size={15} strokeWidth={2.5} aria-hidden />
            Post assignment
          </button>
        </div>
      )}

      {assignments.length === 0 && (
        <EmptyState
          icon={ClipboardList}
          title="No assignments yet"
          description={
            isTeacher
              ? "Post your first one using the form above."
              : "Nothing assigned yet. Check back later."
          }
          tone="accent"
        />
      )}

      {assignments.map(a => (
        <div key={a.id} className="card-stack">
          <div className="card">
            <div className="card-info">
              <h3>
                {a.task}
                {!isTeacher && mySubmissions[a.id] && (
                  <span className="tag tag-green">Submitted</span>
                )}
              </h3>
              <p>Due {formatDeadline(a.deadline)} · Score {formatGradeRange(a)}</p>
            </div>
            <div className="btn-group">
              {isTeacher && (
                <>
                  <button className="btn btn-primary" onClick={() => handleViewSubmissions(a)}>
                    <Eye size={15} strokeWidth={2} aria-hidden />
                    View submissions
                  </button>
                  <button className="btn btn-danger" onClick={() => handleDelete(a.id)}>
                    <Trash2 size={15} strokeWidth={2} aria-hidden />
                    Delete
                  </button>
                </>
              )}
              {!isTeacher && (
                <button className="btn btn-success" onClick={() => openStudentAssignment(a)}>
                  <Send size={15} strokeWidth={2} aria-hidden />
                  {mySubmissions[a.id] ? "View submission" : "Turn in work"}
                </button>
              )}
            </div>
          </div>

          {selectedAssignment?.id === a.id && !isTeacher && panelMode[a.id] === "loading" && (
            <div className="card-panel">
              <p className="submission-meta">Loading your submission...</p>
            </div>
          )}

          {selectedAssignment?.id === a.id && !isTeacher && panelMode[a.id] === "view" && mySubmissions[a.id] && (
            <div className="card-panel">
              <p className="card-panel-title">Your submission</p>
              <p className="submission-meta">
                Turned in {new Date(mySubmissions[a.id].turnInDate).toLocaleString()}
              </p>
              {mySubmissions[a.id].content?.trim() ? (
                <p className="submission-content">{mySubmissions[a.id].content}</p>
              ) : (
                <p className="submission-content muted">No written response.</p>
              )}
              <SubmissionFiles files={mySubmissions[a.id].submissionFilePaths ?? []} showEmpty />
              {mySubmissions[a.id].grade != null && (
                <p style={{ marginTop: "0.75rem" }}>
                  Grade:{" "}
                  <span className={`tag ${gradeTagClass(mySubmissions[a.id].grade, a.maxScore, getMinScore(a))}`}>
                    {mySubmissions[a.id].grade} / {a.maxScore}
                  </span>
                </p>
              )}
            </div>
          )}

          {selectedAssignment?.id === a.id && !isTeacher && panelMode[a.id] === "form" && (
            <div className="card-panel">
              <p className="card-panel-title">Your submission</p>
              <textarea
                value={pendingContent[a.id] ?? ""}
                onChange={e => setPendingContent(prev => ({ ...prev, [a.id]: e.target.value }))}
                placeholder="Type your answer here. Take your time."
              />

              <div className="selected-files">
                <div className="selected-files__head">
                  <p className="selected-files__title">Files to upload</p>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => openFilePicker(a.id)}
                  >
                    <Paperclip size={15} strokeWidth={2} aria-hidden />
                    Add file
                  </button>
                </div>

                {getPendingFiles(a.id).length === 0 ? (
                  <p className="selected-files__empty">No files selected yet. Use “Add file” to attach a PDF or document.</p>
                ) : (
                  <ul className="file-list">
                    {getPendingFiles(a.id).map((file, index) => (
                      <li key={`${file.name}-${file.size}-${index}`} className="file-list__item">
                        <span className="file-list__name">
                          <FileText size={14} strokeWidth={2} aria-hidden />
                          {file.name}
                        </span>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleRemoveFile(a.id, index)}
                          aria-label={`Remove ${file.name}`}
                        >
                          <X size={14} strokeWidth={2} aria-hidden />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {message && selectedAssignment?.id === a.id && (
                <p className={message.includes("Could not") || message.includes("Write something") ? "error" : "success"}>
                  {message}
                </p>
              )}
              <button className="btn btn-primary" onClick={() => handleSubmit(a.id)}>
                <Send size={15} strokeWidth={2} aria-hidden />
                Submit my work
              </button>
            </div>
          )}

          {selectedAssignment?.id === a.id && isTeacher && (
            <div className="card-panel">
              <p className="card-panel-title">Student submissions</p>
              {submissions.length === 0 && (
                <EmptyState
                  icon={ClipboardList}
                  title="No submissions yet"
                  description="No one has turned this in yet."
                  compact
                  tone="amber"
                />
              )}
              {submissions.map(s => (
                <div className="card" key={s.id} style={{ flexDirection: "column", alignItems: "flex-start" }}>
                  <div className="card-info" style={{ marginBottom: "0.8rem", width: "100%" }}>
                    <h3>{s.student?.name ?? "Unknown student"}</h3>
                    <p>{s.content?.trim() || "No written response submitted."}</p>
                    <SubmissionFiles files={s.submissionFilePaths ?? []} showEmpty />
                    <p style={{ marginTop: "0.4rem" }}>
                      Grade:{" "}
                      <span className={`tag ${gradeTagClass(s.grade, a.maxScore, getMinScore(a))}`}>
                        {s.grade != null ? `${s.grade} / ${a.maxScore}` : "Not graded yet"}
                      </span>
                    </p>
                  </div>
                  <div className="btn-group" style={{ alignItems: "center" }}>
                    <input
                      style={{ width: "90px", marginBottom: 0 }}
                      type="number"
                      min={getMinScore(a)}
                      max={a.maxScore}
                      placeholder={`${getMinScore(a)}–${a.maxScore}`}
                      value={gradeInputs[s.id] || ""}
                      onChange={e => setGradeInputs(prev => ({ ...prev, [s.id]: e.target.value }))}
                    />
                    <button className="btn btn-primary" onClick={() => handleGrade(a, s.id)}>
                      Save grade
                    </button>
                  </div>
                </div>
              ))}
              {message && <p className="success">{message}</p>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
