import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Tenders from "../pages/Tenders";
import MyTenders from "../pages/MyTenders";
import Unauthorized from "../pages/Unauthorized";
import ProtectedRoute from "../components/ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin", "vendor"]}>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/tenders"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Tenders />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-tenders"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <MyTenders />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Login />} />
    </Routes>
  );
};

export default AppRoutes;
