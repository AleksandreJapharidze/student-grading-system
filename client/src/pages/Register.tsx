import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { api } from "../api";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!name || !email || !password) return setError("Please fill in your name, email, and a password.");
    setError("");
    setSuccess("");
    try {
      const res = role === "student"
        ? await api.registerStudent({ name, email, password })
        : await api.registerTeacher({ name, email, password });

      if (res.message === "Student registered successfully" || res.message === "Teacher registered successfully") {
        setSuccess("You are all set. Taking you to sign in.");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setError(res.message || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Could not reach the server. Make sure the API is running (npm run dev in server/, port 4000).");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo auth-logo--coral" aria-hidden>
          <UserPlus size={22} strokeWidth={1.75} />
        </div>
        <h2>Join Gradebook</h2>
        <p className="auth-subtitle">It only takes a minute to get started.</p>
        <div className="role-toggle">
          <button className={role === "student" ? "active" : ""} onClick={() => setRole("student")}>
            I am a student
          </button>
          <button className={role === "teacher" ? "active" : ""} onClick={() => setRole("teacher")}>
            I am a teacher
          </button>
        </div>
        <div className="form">
          <label>Full name</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="What should we call you?" />
          <label>Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@school.edu" />
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Pick something you will remember" />
          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}
          <button className="btn btn-primary btn-block" onClick={handleRegister}>
            Create my account
          </button>
        </div>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
