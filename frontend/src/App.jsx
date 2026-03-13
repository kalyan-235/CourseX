import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CourseDetails from "./pages/CourseDetails";
import MyCourses from "./pages/MyCourses";
import Player from "./pages/Player";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/course/:id" element={<CourseDetails />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/my-courses"
        element={
          <ProtectedRoute>
            <MyCourses />
          </ProtectedRoute>
        }
      />

      <Route
        path="/player/:id"
        element={
          <ProtectedRoute>
            <Player />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}