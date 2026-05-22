import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Teachers from "./pages/Teachers";
import Classroom from "./pages/Classroom";
import Assignments from "./pages/Assignments";

function getUser() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const id = localStorage.getItem("userId");
  return token ? { role, id: Number(id) } : null;
}

function Layout({ children }: { children: React.ReactNode }) {
  const user = getUser();
  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <>
      <nav>
        <h1>🎓 Grading System</h1>
        <NavLink to="/">Dashboard</NavLink>
        {user?.role === "teacher" && <NavLink to="/students">Students</NavLink>}
        {user?.role === "teacher" && <NavLink to="/teachers">Teachers</NavLink>}
        {user?.role === "teacher" && <NavLink to="/classroom">Classroom</NavLink>}
        <NavLink to="/assignments">Assignments</NavLink>
        <button onClick={logout} className="btn btn-danger" style={{ marginTop: "auto" }}>Logout</button>
      </nav>
      <main>{children}</main>
    </>
  );
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  return getUser() ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
        <Route path="/students" element={<PrivateRoute><Layout><Students /></Layout></PrivateRoute>} />
        <Route path="/teachers" element={<PrivateRoute><Layout><Teachers /></Layout></PrivateRoute>} />
        <Route path="/classroom" element={<PrivateRoute><Layout><Classroom /></Layout></PrivateRoute>} />
        <Route path="/assignments" element={<PrivateRoute><Layout><Assignments /></Layout></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}