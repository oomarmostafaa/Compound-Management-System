import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import Login from './pages/Auth/Login';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';

// Admin Pages
import AdminDashboard from './pages/Admin/Dashboard';
import AdminBuildings from './pages/Admin/Buildings';
import AdminApartments from './pages/Admin/Apartments';
import AdminResidents from './pages/Admin/Residents';
import AdminStaff from './pages/Admin/Staff';
import AdminRequests from './pages/Admin/Requests';
import AdminVisitors from './pages/Admin/Visitors';
import AdminAnnouncements from './pages/Admin/Announcements';

// Resident Pages
import ResidentProfile from './pages/Resident/Profile';
import ResidentRequests from './pages/Resident/Requests';
import ResidentVisitors from './pages/Resident/Visitors';
import ResidentAnnouncements from './pages/Resident/Announcements';

// Staff Pages
import StaffTasks from './pages/Staff/Tasks';
import StaffSecurity from './pages/Staff/Security';

function App() {
  return (
    <Router>
      <AuthProvider>
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
      </AuthProvider>
    </Router>
  );
}

export default App;
