
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Customers from "./pages/Customers";

import Plans from "./pages/Plans";
import Quotations from "./pages/Quotations";
import Subscriptions from "./pages/Subscriptions";
import Invoices from "./pages/Invoices";
import Payments from "./pages/Payments";

import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";
import { useAuth } from "./context/AuthContext";
import RoleRoute from "./components/RoleRoute";

function AuthRedirect({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <AuthRedirect>
              <Login />
            </AuthRedirect>
          }
        />

        <Route
          path="/register"
          element={
            <AuthRedirect>
              <Register />
            </AuthRedirect>
          }
        />

        {/* Protected Routes */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />

          <Route path="/customers" element={
            <RoleRoute allowedRoles={['admin', 'staff']}>
              <Customers />
            </RoleRoute>
          } />

          <Route path="/plans" element={
            <RoleRoute allowedRoles={['admin', 'staff']}>
              <Plans />
            </RoleRoute>
          } />

          <Route path="/quotations" element={
            <RoleRoute allowedRoles={['admin', 'staff']}>
              <Quotations />
            </RoleRoute>
          } />

          <Route path="/subscriptions" element={
            <RoleRoute allowedRoles={['admin', 'staff']}>
              <Subscriptions />
            </RoleRoute>
          } />

          <Route path="/invoices" element={
            <RoleRoute allowedRoles={['admin', 'staff']}>
              <Invoices />
            </RoleRoute>
          } />

          <Route path="/payments" element={
            <RoleRoute allowedRoles={['admin', 'staff']}>
              <Payments />
            </RoleRoute>
          } />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
