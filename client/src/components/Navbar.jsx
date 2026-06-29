import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  ClipboardList, 
  UserCheck, 
  Megaphone, 
  User, 
  LogOut,
  ShieldCheck
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const linksByRole = {
    RESIDENT: [
      { path: '/resident/profile', name: 'My Profile', icon: <User size={14} /> },
      { path: '/resident/requests', name: 'My Requests', icon: <ClipboardList size={14} /> },
      { path: '/resident/visitors', name: 'Pre-check Visitors', icon: <UserCheck size={14} /> },
      { path: '/resident/announcements', name: 'Announcements', icon: <Megaphone size={14} /> },
    ],
    STAFF: [
      { path: '/staff/tasks', name: 'My Tasks', icon: <ClipboardList size={14} /> },
      { path: '/staff/security', name: 'Security Check', icon: <ShieldCheck size={14} /> },
    ]
  };

  const links = user ? (linksByRole[user.role] || []) : [];

  return (
    <header className="w-full bg-slate-950/20 backdrop-blur-xl border-b border-slate-900/60 sticky top-0 z-30 px-8 py-3 flex items-center justify-between">
      {/* Brand Logo */}
      <div className="flex items-center gap-4">
        <motion.div 
          whileHover={{ scale: 1.05, rotate: 6 }}
          whileTap={{ scale: 0.95 }}
          className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-primary-500 to-indigo-600 flex items-center justify-center font-extrabold text-white shadow-lg shadow-primary-500/10 cursor-pointer relative"
        >
          C
          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-slate-950"></span>
        </motion.div>
        <div>
          <h1 className="font-extrabold text-xs tracking-tight text-slate-100 uppercase leading-none">Compound</h1>
          <span className="text-[8px] text-slate-500 font-extrabold uppercase tracking-widest mt-0.5 block">Portal</span>
        </div>
      </div>

      {/* Horizontal Navigation Links */}
      <nav className="flex items-center gap-1.5">
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className="relative block"
            >
              <motion.div
                whileHover={{ y: -0.5 }}
                whileTap={{ scale: 0.98 }}
                className={`relative z-10 flex items-center gap-3 px-4 py-2.5 rounded-xl text-[10px] font-extrabold uppercase tracking-widest transition-colors duration-300 ${
                  isActive 
                    ? 'text-white' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 bg-gradient-to-r from-primary-600/90 to-indigo-700/90 rounded-xl -z-10 shadow-md shadow-primary-600/10 border border-primary-500/20"
                    transition={{ type: "spring", stiffness: 420, damping: 33 }}
                  />
                )}
                <span>{link.icon}</span>
                <span>{link.name}</span>
              </motion.div>
            </NavLink>
          );
        })}
      </nav>

      {/* User Actions / Profile Dropdown */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-slate-900/30 border border-slate-900 px-3 py-1.5 rounded-xl">
          <div className="w-5 h-5 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center font-bold text-[9px] text-gradient">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <span className="text-[10px] font-bold text-slate-300 max-w-[100px] truncate">{user?.email}</span>
          <span className="text-[8px] uppercase font-extrabold tracking-widest text-primary-400 bg-primary-950/40 px-1.5 py-0.5 rounded border border-primary-900/20">
            {user?.role}
          </span>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-[9px] font-extrabold uppercase tracking-widest text-red-400 hover:text-red-300 hover:bg-red-950/10 border border-transparent hover:border-red-950/20 transition-all duration-200"
        >
          <LogOut size={14} />
          Sign Out
        </motion.button>
      </div>
    </header>
  );
};

export default Navbar;
