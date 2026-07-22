import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Tenders from "../pages/Tenders";
import TenderDetail from "../pages/TenderDetail";
import MyTenders from "../pages/MyTenders";
import TenderFormPage from "../pages/TenderFormPage";
import MyBids from "../pages/MyBids";
import BidFormPage from "../pages/BidFormPage";
import TenderBids from "../pages/TenderBids";
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
        path="/tenders/:tenderId/bids"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <TenderBids />
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

      <Route
        path="/my-bids"
        element={
          <ProtectedRoute allowedRoles={["vendor"]}>
            <MyBids />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-bids/:id/edit"
        element={
          <ProtectedRoute allowedRoles={["vendor"]}>
            <BidFormPage />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Login />} />
    </Routes>
  );
};

export default AppRoutes;
