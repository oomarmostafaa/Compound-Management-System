import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, ShieldAlert, ArrowRight, Building2 } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedUser = await login(email, password);
      if (loggedUser.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (loggedUser.role === 'RESIDENT') {
        navigate('/resident/profile');
      } else if (loggedUser.role === 'STAFF') {
        navigate('/staff/tasks');
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      {/* Simple Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"></div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center mb-4">
            <Building2 size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Compound Hub</h1>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
            Smart Living Management
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-panel rounded-2xl p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-950/30 border border-red-900/40 text-red-400 text-xs font-semibold flex items-start gap-2">
              <ShieldAlert size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  required
                  placeholder="name@compound.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass-input w-full pl-14 text-slate-300 placeholder-slate-600"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[10px] text-primary-400 hover:text-primary-300 font-bold transition-colors uppercase tracking-wider"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass-input w-full pl-14 text-slate-300 placeholder-slate-600"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed uppercase text-xs tracking-wider"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Signing in...
                </span>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick Login - Test Accounts */}
          <div className="mt-6 pt-6 border-t border-slate-800/60">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3 text-center">
              Quick Login — Test Accounts
            </p>
            <div className="grid grid-cols-3 gap-2">
              {/* Admin */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setEmail('admin@compound.com');
                  setPassword('admin123');
                }}
                className="p-2.5 rounded-xl bg-gradient-to-b from-indigo-950/50 to-indigo-950/20 border border-indigo-800/30 hover:border-indigo-600/50 transition-all text-center group"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center mx-auto mb-1.5">
                  <ShieldAlert size={14} className="text-white" />
                </div>
                <p className="text-[11px] font-bold text-indigo-300 group-hover:text-indigo-200 transition-colors">Admin</p>
                <p className="text-[8px] text-indigo-400/60 group-hover:text-indigo-300/80 mt-0.5">Full Access</p>
              </motion.button>

              {/* Resident */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setEmail('resident1@compound.com');
                  setPassword('resident123');
                }}
                className="p-2.5 rounded-xl bg-gradient-to-b from-emerald-950/50 to-emerald-950/20 border border-emerald-800/30 hover:border-emerald-600/50 transition-all text-center group"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center mx-auto mb-1.5">
                  <Building2 size={14} className="text-white" />
                </div>
                <p className="text-[11px] font-bold text-emerald-300 group-hover:text-emerald-200 transition-colors">Resident</p>
                <p className="text-[8px] text-emerald-400/60 group-hover:text-emerald-300/80 mt-0.5">Limited</p>
              </motion.button>

              {/* Staff */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setEmail('staff1@compound.com');
                  setPassword('staff123');
                }}
                className="p-2.5 rounded-xl bg-gradient-to-b from-amber-950/50 to-amber-950/20 border border-amber-800/30 hover:border-amber-600/50 transition-all text-center group"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center mx-auto mb-1.5">
                  <Lock size={14} className="text-white" />
                </div>
                <p className="text-[11px] font-bold text-amber-300 group-hover:text-amber-200 transition-colors">Staff</p>
                <p className="text-[8px] text-amber-400/60 group-hover:text-amber-300/80 mt-0.5">Mid Access</p>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-600 text-[10px] font-semibold uppercase tracking-wider mt-6">
          © 2026 Compound Hub. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
};

export default Login;