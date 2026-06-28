import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Loader from './components/Loader';

// Auth Pages
const Login = lazy(() => import('./pages/Auth/Login'));
const ForgotPassword = lazy(() => import('./pages/Auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/Auth/ResetPassword'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/Admin/Dashboard'));
const AdminBuildings = lazy(() => import('./pages/Admin/Buildings'));
const AdminApartments = lazy(() => import('./pages/Admin/Apartments'));
const AdminResidents = lazy(() => import('./pages/Admin/Residents'));
const AdminStaff = lazy(() => import('./pages/Admin/Staff'));
const AdminRequests = lazy(() => import('./pages/Admin/Requests'));
const AdminVisitors = lazy(() => import('./pages/Admin/Visitors'));
const AdminAnnouncements = lazy(() => import('./pages/Admin/Announcements'));

// Resident Pages
const ResidentProfile = lazy(() => import('./pages/Resident/Profile'));
const ResidentRequests = lazy(() => import('./pages/Resident/Requests'));
const ResidentVisitors = lazy(() => import('./pages/Resident/Visitors'));
const ResidentAnnouncements = lazy(() => import('./pages/Resident/Announcements'));

// Staff Pages
const StaffTasks = lazy(() => import('./pages/Staff/Tasks'));
const StaffSecurity = lazy(() => import('./pages/Staff/Security'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-950">
    <Loader />
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Admin Restricted Portal */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/buildings" element={<AdminBuildings />} />
              <Route path="/admin/apartments" element={<AdminApartments />} />
              <Route path="/admin/residents" element={<AdminResidents />} />
              <Route path="/admin/staff" element={<AdminStaff />} />
              <Route path="/admin/requests" element={<AdminRequests />} />
              <Route path="/admin/visitors" element={<AdminVisitors />} />
              <Route path="/admin/announcements" element={<AdminAnnouncements />} />
            </Route>

            {/* Resident Restricted Portal */}
            <Route element={<ProtectedRoute allowedRoles={['RESIDENT']} />}>
              <Route path="/resident/profile" element={<ResidentProfile />} />
              <Route path="/resident/requests" element={<ResidentRequests />} />
              <Route path="/resident/visitors" element={<ResidentVisitors />} />
              <Route path="/resident/announcements" element={<ResidentAnnouncements />} />
            </Route>

            {/* Staff Restricted Portal */}
            <Route element={<ProtectedRoute allowedRoles={['STAFF']} />}>
              <Route path="/staff/tasks" element={<StaffTasks />} />
              <Route path="/staff/security" element={<StaffSecurity />} />
            </Route>

            {/* Default Route */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
}

export default App;
