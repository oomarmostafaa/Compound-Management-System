import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { motion, AnimatePresence } from 'framer-motion';

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader fullPage />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect unauthorized users to their specific homes
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'RESIDENT') return <Navigate to="/resident/profile" replace />;
    if (user.role === 'STAFF') return <Navigate to="/staff/tasks" replace />;
    return <Navigate to="/login" replace />;
  }

  const isAdmin = user.role === 'ADMIN';

  // Render Sidebar layout for admin, and top Navbar layout for resident / staff
  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 ${isAdmin ? 'flex' : 'flex flex-col'}`}>
      {isAdmin ? <Sidebar /> : <Navbar />}
      <main className={`flex-1 overflow-y-auto relative ${isAdmin ? 'max-h-screen' : ''}`}>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.12, ease: 'easeOut' }}
          className="p-8 min-h-full"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
};

export default ProtectedRoute;
