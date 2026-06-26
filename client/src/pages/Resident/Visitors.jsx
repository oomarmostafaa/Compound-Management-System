import React, { useEffect, useState } from 'react';
import { apiPrivate } from '../../services/api';
import Loader from '../../components/Loader';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, UserCheck, AlertCircle, Search, ChevronLeft, ChevronRight, X, Users, Clock, CheckCircle, XCircle, Phone, Calendar } from 'lucide-react';

const Visitors = () => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Pagination States
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Form States
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchVisitors = async () => {
    try {
      const response = await apiPrivate.get('/api/visitors', {
        params: { search, page, limit }
      });
      setVisitors(response.data.data);
      setTotalPages(response.data.totalPages || 1);
      setTotal(response.data.total || 0);
    } catch (err) {
      setError('Failed to fetch visitor registry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, [search, page, limit]);

  const handleOpenModal = () => {
    setName('');
    setPhone('');
    setVisitDate('');
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await apiPrivate.post('/api/visitors', { name, phone, visitDate });
      setName('');
      setPhone('');
      setVisitDate('');
      setShowModal(false);
      fetchVisitors();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to register visitor');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'APPROVED') return <CheckCircle size={12} className="inline mr-1" />;
    if (status === 'REJECTED') return <XCircle size={12} className="inline mr-1" />;
    return <Clock size={12} className="inline mr-1" />;
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: 'bg-amber-950/40 border-amber-900/50 text-amber-400',
      APPROVED: 'bg-emerald-950/40 border-emerald-900/50 text-emerald-400',
      REJECTED: 'bg-red-950/40 border-red-900/50 text-red-400'
    };
    return styles[status] || styles.PENDING;
  };

  if (loading && page === 1 && search === '') return <Loader />;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gradient tracking-tight">Pre-check Visitors</h1>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1.5">Pre-register visitors to expedite security entry.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleOpenModal}
          className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest self-start sm:self-auto"
        >
          <Plus size={16} />
          Add Visitor
        </motion.button>
      </div>

      {/* Search & Filters Row */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="glass-input w-full !pl-11 py-2.5 text-xs font-semibold border-slate-700/80 bg-slate-950/80 shadow-md"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Show:</span>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(parseInt(e.target.value));
              setPage(1);
            }}
            className="glass-input py-1.5 px-3 text-xs font-bold bg-slate-900 border border-slate-700/80 rounded-xl"
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
      </div>

      {/* Visitors list */}
      <div className="space-y-4">
        {visitors.map((v) => (
          <motion.div
            key={v.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-6 border-slate-800"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-800/80 flex items-center justify-center shrink-0">
                  <Users size={20} className="text-primary-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">{v.name}</h3>
                  <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Phone size={11} />
                      {v.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />
                      {new Date(v.visitDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(v.status)}`}>
                  {getStatusIcon(v.status)}
                  {v.status}
                </span>
              </div>
            </div>
          </motion.div>
        ))}

        {visitors.length === 0 && (
          <div className="text-center py-16 text-slate-500 font-semibold glass-card rounded-2xl border-slate-800">
            <Users size={40} className="mx-auto mb-4 text-slate-700" />
            <p className="text-sm">No visitors pre-registered yet.</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleOpenModal}
              className="mt-4 btn-primary inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest"
            >
              <Plus size={14} />
              Pre-register Your First Visitor
            </motion.button>
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            Showing Page {page} of {totalPages} ({total} total)
          </span>
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="glass-input p-2 rounded-xl border border-slate-700 hover:border-slate-650 disabled:opacity-40 bg-slate-900"
            >
              <ChevronLeft size={16} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              className="glass-input p-2 rounded-xl border border-slate-700 hover:border-slate-650 disabled:opacity-40 bg-slate-900"
            >
              <ChevronRight size={16} />
            </motion.button>
          </div>
        </div>
      )}

      {/* Pre-register Visitor Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="glass-panel w-full max-w-md rounded-3xl p-8 z-10 space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Plus size={18} className="text-primary-400" />
                  Pre-register Guest
                </h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setShowModal(false)}
                  className="text-slate-500 hover:text-slate-300 p-1.5 rounded-lg"
                >
                  <X size={18} />
                </motion.button>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-950/30 border border-red-900/40 text-red-400 text-xs font-semibold flex gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-450 mb-1.5">Guest Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="glass-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-450 mb-1.5">Guest Phone Number</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 0101010101"
                    className="glass-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-450 mb-1.5">Expected Visit Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="glass-input w-full text-slate-300"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-slate-900 border border-slate-900 text-slate-400 font-bold py-3 rounded-xl text-xs uppercase tracking-widest"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={submitting}
                    className="flex-1 btn-primary py-3 rounded-xl text-xs font-bold uppercase tracking-widest"
                  >
                    {submitting ? 'Registering...' : 'Register Visitor'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Visitors;