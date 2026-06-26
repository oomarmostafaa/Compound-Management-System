import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { motion } from 'framer-motion';
import { Mail, ShieldCheck, ShieldAlert, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await api.post('/api/auth/forgot-password', { email });
      setSuccess(response.data.message || 'If this email is registered, a password reset link has been sent.');
      setEmail('');
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary-600/10 rounded-full blur-[120px] animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse-slow"></div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        <div className="flex flex-col items-center mb-10">
          <motion.div 
            whileHover={{ scale: 1.08, rotate: 8 }}
            whileTap={{ scale: 0.95 }}
            className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center font-extrabold text-2xl text-white shadow-xl shadow-primary-500/25 mb-4 cursor-pointer"
          >
            C
          </motion.div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Reset Password</h2>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1.5">Provide your email address to receive a recovery link</p>
        </div>

        <div className="glass-panel rounded-3xl p-8">
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 rounded-xl bg-red-950/30 border border-red-900/30 text-red-400 text-xs font-semibold flex items-start gap-3"
            >
              <ShieldAlert size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 rounded-xl bg-green-950/30 border border-green-900/30 text-green-400 text-xs font-semibold flex items-start gap-3"
            >
              <ShieldCheck size={18} className="shrink-0 mt-0.5" />
              <span>{success}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  required
                  placeholder="your-email@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass-input w-full pl-12"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01, y: -1 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-primary-600/20 hover:shadow-primary-500/30 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 uppercase text-xs tracking-widest"
            >
              {loading ? 'Sending link...' : 'Send Recovery Link'}
            </motion.button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-900/60 text-center">
            <Link to="/login" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 text-xs font-bold uppercase tracking-wider transition-colors">
              <ArrowLeft size={16} />
              Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
