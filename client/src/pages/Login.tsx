import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { api } from "../api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) return setError("We need both your email and password to sign you in.");
    const res = await api.login(email, password);
    if (res.token) {
      localStorage.setItem("token", res.token);
      const payload = JSON.parse(atob(res.token.split(".")[1]));
      localStorage.setItem("role", payload.role);
      localStorage.setItem("userId", payload.id);
      navigate("/");
    } else {
      setError(res.message || "That did not work. Double check your email and password.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo" aria-hidden>
          <BookOpen size={22} strokeWidth={1.75} />
        </div>
        <h2>Welcome back</h2>
        <p className="auth-subtitle">Sign in to pick up where you left off.</p>
        <div className="form">
          <label>Your email</label>
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@school.edu"
            onKeyDown={e => e.key === "Enter" && handleLogin()}
          />
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Your password"
            onKeyDown={e => e.key === "Enter" && handleLogin()}
          />
          {error && <p className="error">{error}</p>}
          <button className="btn btn-primary btn-block" onClick={handleLogin}>
            Sign in
          </button>
        </div>
        <p className="auth-footer">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
