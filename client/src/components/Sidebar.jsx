import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Building2, 
  Home, 
  Users, 
  ClipboardList, 
  UserCheck, 
  Megaphone, 
  User, 
  LogOut,
  ShieldCheck
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const linksByRole = {
    ADMIN: [
      { path: '/admin/dashboard', name: 'Dashboard', icon: <LayoutDashboard size={16} /> },
      { path: '/admin/buildings', name: 'Buildings', icon: <Building2 size={16} /> },
      { path: '/admin/apartments', name: 'Apartments', icon: <Home size={16} /> },
      { path: '/admin/residents', name: 'Residents', icon: <Users size={16} /> },
      { path: '/admin/staff', name: 'Staff Directory', icon: <ShieldCheck size={16} /> },
      { path: '/admin/requests', name: 'Requests', icon: <ClipboardList size={16} /> },
      { path: '/admin/visitors', name: 'Visitors', icon: <UserCheck size={16} /> },
      { path: '/admin/announcements', name: 'Announcements', icon: <Megaphone size={16} /> },
    ],
    RESIDENT: [
      { path: '/resident/profile', name: 'My Profile', icon: <User size={16} /> },
      { path: '/resident/requests', name: 'My Requests', icon: <ClipboardList size={16} /> },
      { path: '/resident/visitors', name: 'Pre-check Visitors', icon: <UserCheck size={16} /> },
      { path: '/resident/announcements', name: 'Announcements', icon: <Megaphone size={16} /> },
    ],
    STAFF: [
      { path: '/staff/tasks', name: 'My Tasks', icon: <ClipboardList size={16} /> },
      { path: '/staff/security', name: 'Security Check', icon: <ShieldCheck size={16} /> },
    ]
  };

  const links = user ? (linksByRole[user.role] || []) : [];

  return (
    <aside className="w-64 bg-slate-950/20 backdrop-blur-xl border-r border-slate-900/60 flex flex-col h-screen sticky top-0 z-20">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-900/40 flex items-center gap-4">
        <motion.div 
          whileHover={{ scale: 1.05, rotate: 6 }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary-500 to-indigo-600 flex items-center justify-center font-extrabold text-white shadow-lg shadow-primary-500/20 cursor-pointer relative"
        >
          C
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-950"></span>
        </motion.div>
        <div>
          <h1 className="font-extrabold text-sm tracking-tight text-slate-100 uppercase">Compound</h1>
          <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest">Management Hub</span>
        </div>
      </div>

      {/* User Info */}
      <div className="mx-4 my-4 p-4 border border-slate-900 bg-slate-900/30 rounded-2xl flex items-center gap-4">
        <div className="w-9 h-9 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center font-bold text-gradient text-xs shadow-inner">
          {user?.email?.charAt(0).toUpperCase()}
        </div>
        <div className="overflow-hidden">
          <p className="text-[11px] font-bold text-slate-200 truncate leading-none">{user?.email}</p>
          <span className="text-[8px] uppercase font-extrabold tracking-widest text-primary-400 bg-primary-950/40 px-2 py-0.5 rounded border border-primary-900/20 mt-1.5 inline-block">
            {user?.role}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className="block relative"
            >
              <motion.div
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={`relative z-10 flex items-center gap-4 px-4 py-2.5 rounded-xl text-[10px] font-extrabold uppercase tracking-widest transition-all duration-200 ${
                  isActive 
                    ? 'text-white font-bold' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-gradient-to-r from-primary-600/90 to-indigo-700/90 rounded-xl -z-10 shadow-md shadow-primary-600/10 border border-primary-500/20"
                    transition={{ type: "spring", stiffness: 420, damping: 33 }}
                  />
                )}
                <span className={`transition-colors duration-200 ${isActive ? 'text-white' : 'text-slate-400'}`}>
                  {link.icon}
                </span>
                <span>{link.name}</span>
              </motion.div>
            </NavLink>
          );
        })}
      </nav>

      {/* Logout Footer */}
      <div className="p-4 border-t border-slate-900/60">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-extrabold uppercase tracking-widest text-red-400 hover:text-red-300 hover:bg-red-950/10 border border-transparent hover:border-red-950/30 transition-all duration-200"
        >
          <LogOut size={16} />
          Sign Out
        </motion.button>
      </div>
    </aside>
  );
};

export default Sidebar;
