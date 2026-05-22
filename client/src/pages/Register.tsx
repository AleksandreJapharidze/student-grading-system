import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
    if (!name || !email || !password) return setError("Please fill in all fields.");
    const res = role === "student"
      ? await api.registerStudent({ name, email, password })
      : await api.registerTeacher({ name, email, password });

    if (res.message === "Student registered successfully" || res.message === "Teacher registered successfully") {
      setSuccess("Registered! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } else {
      setError(res.message || "Registration failed.");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-box">
        <h2>Create Account</h2>
        <div className="role-toggle">
          <button className={role === "student" ? "active" : ""} onClick={() => setRole("student")}>Student</button>
          <button className={role === "teacher" ? "active" : ""} onClick={() => setRole("teacher")}>Teacher</button>
        </div>
        <div className="form">
          <label>Name</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" />
          <label>Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" />
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}
          <button className="btn btn-primary" style={{ width: "100%" }} onClick={handleRegister}>Register</button>
        </div>
        <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "0.85rem" }}>
          Already have an account? <Link to="/login" style={{ color: "#6366f1" }}>Login</Link>
        </p>
      </div>
    </div>
  );
}