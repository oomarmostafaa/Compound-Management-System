import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, Loader } from 'lucide-react';

const Activate = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('activating'); // activating, success, error
  const [message, setMessage] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    const activateUser = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Activation token is missing. Please check your email link.');
        return;
      }

      try {
        const response = await api.get(`/api/auth/activate?token=${token}`);
        setStatus('success');
        setMessage(response.data.message || 'Your account has been activated successfully!');
      } catch (error) {
        console.error(error);
        setStatus('error');
        setMessage(error?.response?.data?.message || 'Activation failed. The link may have expired or is invalid.');
      }
    };

    activateUser();
  }, [token]);

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
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Account Activation</h2>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1.5">Processing registration request</p>
        </div>

        <div className="glass-panel rounded-3xl p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            {status === 'activating' && (
              <>
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 rounded-full border-4 border-slate-900"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-t-primary-500 animate-spin"></div>
                </div>
                <h2 className="text-xl font-bold text-slate-100">Activating Account</h2>
                <p className="text-slate-400 text-sm">Please wait while we verify your activation link...</p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="w-16 h-16 rounded-full bg-green-950/30 border border-green-800/40 flex items-center justify-center text-green-400 mb-2">
                  <ShieldCheck size={36} />
                </div>
                <h2 className="text-2xl font-bold text-green-400">Success!</h2>
                <p className="text-slate-300 text-sm leading-relaxed">{message}</p>
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="w-full">
                  <Link
                    to="/login"
                    className="w-full mt-6 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transition-all duration-300 block uppercase text-xs tracking-widest"
                  >
                    Sign In Now
                  </Link>
                </motion.div>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="w-16 h-16 rounded-full bg-red-950/30 border border-red-800/40 flex items-center justify-center text-red-400 mb-2">
                  <ShieldAlert size={36} />
                </div>
                <h2 className="text-2xl font-bold text-red-400">Failed</h2>
                <p className="text-slate-300 text-sm leading-relaxed">{message}</p>
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="w-full">
                  <Link
                    to="/login"
                    className="w-full mt-6 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold py-3.5 px-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all duration-300 block uppercase text-xs tracking-widest"
                  >
                    Go to Login
                  </Link>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Activate;
