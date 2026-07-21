import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Tenders from "../pages/Tenders";
import TenderDetail from "../pages/TenderDetail";
import MyTenders from "../pages/MyTenders";
import TenderFormPage from "../pages/TenderFormPage";
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
          <ProtectedRoute allowedRoles={["admin", "vendor"]}>
            <Tenders />
          </ProtectedRoute>
        }
      />

      <Route
        path="/tenders/:id"
        element={
          <ProtectedRoute allowedRoles={["admin", "vendor"]}>
            <TenderDetail />
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

      <Route
        path="/my-tenders/new"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <TenderFormPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-tenders/:id/edit"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <TenderFormPage />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Login />} />
    </Routes>
  );
};

export default AppRoutes;
