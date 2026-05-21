import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Teachers from "./pages/Teachers";
import Classroom from "./pages/Classroom";

export default function App() {
  return (
    <BrowserRouter>
      <nav>
        <h1>🎓 Grading System</h1>
        <NavLink to="/">Dashboard</NavLink>
        <NavLink to="/students">Students</NavLink>
        <NavLink to="/teachers">Teachers</NavLink>
        <NavLink to="/classroom">Classroom</NavLink>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/students" element={<Students />} />
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/classroom" element={<Classroom />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}