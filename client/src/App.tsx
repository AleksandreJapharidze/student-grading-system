import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { BookOpen, ClipboardList, Home, LogOut, School, UserCheck, Users } from "lucide-react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Teachers from "./pages/Teachers";
import Classroom from "./pages/Classroom";
import Assignments from "./pages/Assignments";
import SidebarLink from "./components/SidebarLink";

function isStaff(role: string | undefined) {
  return role === "teacher" || role === "admin";
}

function getUser() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      localStorage.clear();
      return null;
    }
    return { role: payload.role, id: Number(payload.id) };
  } catch {
    localStorage.clear();
    return null;
  }
}

function Layout({ children }: { children: React.ReactNode }) {
  const user = getUser();
  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-logo" aria-hidden>
            <BookOpen size={18} strokeWidth={2} />
          </span>
          <h1>Gradebook</h1>
        </div>

        <nav className="sidebar-nav">
          <span className="sidebar-label">Navigate</span>
          <SidebarLink to="/" icon={Home} label="Home" />
          {isStaff(user?.role) && <SidebarLink to="/students" icon={Users} label="Students" />}
          {isStaff(user?.role) && <SidebarLink to="/teachers" icon={UserCheck} label="Colleagues" />}
          {isStaff(user?.role) && <SidebarLink to="/classroom" icon={School} label="Classroom" />}
          <SidebarLink to="/assignments" icon={ClipboardList} label="Assignments" />
        </nav>

        <div className="sidebar-footer">
          <span className="sidebar-label">Account</span>
          {user && <span className="sidebar-role">{user.role}</span>}
          <button onClick={logout} className="btn btn-secondary btn-block">
            <LogOut size={15} strokeWidth={2} aria-hidden />
            Sign out
          </button>
        </div>
      </aside>
      <main className="main-content">{children}</main>
    </div>
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
