import React, { useEffect, useState } from 'react';
import { apiPrivate } from '../../services/api';
import Loader from '../../components/Loader';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, AlertCircle, Edit2, Search, ChevronLeft, ChevronRight, X, User, Phone, CheckCircle, ShieldAlert, UserCheck, Calendar } from 'lucide-react';

const Visitors = () => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Pagination & Filter States
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(''); // '', 'PENDING', 'APPROVED', 'REJECTED'
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Status Change States
  const [statusModal, setStatusModal] = useState(false);
  const [selectedVisitorId, setSelectedVisitorId] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchVisitors = async () => {
    try {
      const res = await apiPrivate.get('/api/visitors', {
        params: { search, status, page, limit }
      });
      setVisitors(res.data.data);
      setTotalPages(res.data.totalPages || 1);
      setTotal(res.data.total || 0);
    } catch (err) {
      setError('Failed to fetch visitor logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, [search, status, page, limit]);

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setUpdating(true);
    try {
      await apiPrivate.patch(`/api/visitors/${selectedVisitorId}/status`, {
        status: newStatus
      });
      setStatusModal(false);
      setSelectedVisitorId(null);
      setNewStatus('');
      fetchVisitors();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update visitor status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading && page === 1 && search === '') return <Loader />;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gradient tracking-tight">Visitor Logs</h1>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1.5">Compound security registry, visitor pre-checks, and verification logs.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/30 border border-red-900/40 text-red-400 text-xs font-semibold flex gap-2">
          <ShieldAlert size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filters, Search & Limit Selector */}
      <div className="flex flex-col xl:flex-row gap-6 xl:items-center justify-between">
        {/* Status Tab list */}
        <div className="flex items-center gap-1.5 bg-slate-900/20 border border-slate-900 p-1 rounded-2xl w-fit">
          {[
            { label: 'All Logs', value: '' },
            { label: 'Pending', value: 'PENDING' },
            { label: 'Approved', value: 'APPROVED' },
            { label: 'Rejected', value: 'REJECTED' }
          ].map((tab) => {
            const isTabActive = status === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => {
                  setStatus(tab.value);
                  setPage(1);
                }}
                className={`relative px-4 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-colors duration-200 ${
                  isTabActive 
                    ? 'text-white font-bold bg-gradient-to-r from-primary-600/90 to-indigo-700/90 border border-primary-500/20 shadow-md' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center w-full xl:w-auto">
          {/* Search bar */}
          <div className="relative w-full sm:max-w-xs">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search visitor or host..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="glass-input w-full !pl-11 py-2.5 text-xs font-semibold border-slate-700/80 bg-slate-950/80 shadow-md"
            />
          </div>

          {/* Limit size */}
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Show:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(parseInt(e.target.value));
                setPage(1);
              }}
              className="glass-input py-1.5 px-3 text-xs font-bold bg-slate-900 border border-slate-700/80 rounded-xl"
            >
              <option value={4}>4 per page</option>
              <option value={8}>8 per page</option>
              <option value={12}>12 per page</option>
              <option value={24}>24 per page</option>
            </select>
          </div>
        </div>
      </div>

      {/* Visitor Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {visitors.map((v) => {
          const isApproved = v.status === 'APPROVED';
          const isRejected = v.status === 'REJECTED';
          const isPending = v.status === 'PENDING';

          return (
            <motion.div
              key={v.id}
              whileHover={{ y: -4, scale: 1.01 }}
              className={`glass-card rounded-3xl p-6 border ${
                isApproved ? 'border-emerald-500/10 hover:border-emerald-500/30' :
                isRejected ? 'border-red-500/10 hover:border-red-500/30' :
                'border-slate-800 hover:border-slate-700'
              } flex flex-col justify-between h-64 transition-all duration-300 relative overflow-hidden`}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 flex items-center gap-1">
                    <Calendar size={10} />
                    {new Date(v.visitDate).toLocaleDateString()}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                    isApproved ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400' :
                    isRejected ? 'bg-red-950/20 border-red-500/30 text-red-400' :
                    'bg-amber-950/20 border-amber-500/30 text-amber-400'
                  }`}>
                    {v.status}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-slate-200 tracking-tight truncate" title={v.name}>
                    {v.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Phone size={12} className="text-slate-500" />
                    <span className="font-semibold">{v.phone}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-900/60 text-[10px] text-slate-400 space-y-1">
                  <div>
                    <span className="font-bold uppercase text-[8px] text-slate-500 block">Resident Host:</span>
                    <span className="font-semibold text-slate-300 truncate block max-w-full" title={v.resident?.user?.email}>
                      {v.resident?.user?.email || 'N/A'}
                    </span>
                  </div>
                  {v.resident?.apartment && (
                    <div className="text-[9px] font-bold text-primary-400 uppercase tracking-wide">
                      Apt {v.resident.apartment.number} (Bldg {v.resident.apartment.building?.number})
                    </div>
                  )}
                </div>
              </div>

              {/* Status Update Button for Admin/Staff */}
              <div className="pt-4 border-t border-slate-900/60 flex items-center justify-end mt-auto">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setSelectedVisitorId(v.id);
                    setNewStatus(v.status);
                    setStatusModal(true);
                  }}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold py-2 px-3.5 rounded-xl text-[9px] uppercase tracking-widest flex items-center gap-1 transition-all"
                >
                  <UserCheck size={12} />
                  Verify Status
                </motion.button>
              </div>
            </motion.div>
          );
        })}
        {visitors.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-500 font-semibold uppercase tracking-wider text-xs border border-dashed border-slate-900 rounded-3xl">
            No visitor logs matched the parameters.
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

      {/* Status Verification Dialog Modal */}
      <AnimatePresence>
        {statusModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setStatusModal(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="glass-panel w-full max-w-md rounded-3xl p-8 z-10 space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <UserCheck size={18} className="text-primary-400" />
                  Verify Visitor Entrance
                </h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setStatusModal(false)}
                  className="text-slate-500 hover:text-slate-300 p-1.5 rounded-lg"
                >
                  <X size={18} />
                </motion.button>
              </div>

              <form onSubmit={handleStatusSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-450 mb-1.5">Gate Access Decision</label>
                  <select
                    required
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="glass-input w-full bg-slate-900 border border-slate-700/80 rounded-xl py-3 px-4 text-xs font-semibold text-slate-200"
                  >
                    <option value="PENDING" className="bg-slate-950 text-slate-200">PENDING</option>
                    <option value="APPROVED" className="bg-slate-950 text-slate-200">APPROVED (Grant Entry)</option>
                    <option value="REJECTED" className="bg-slate-950 text-slate-200">REJECTED (Deny Entry)</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="button"
                    onClick={() => setStatusModal(false)}
                    className="flex-1 bg-slate-900 border border-slate-900 text-slate-400 font-bold py-3 rounded-xl text-xs uppercase tracking-widest"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={updating}
                    className="flex-1 btn-primary py-3 rounded-xl text-xs font-bold uppercase tracking-widest"
                  >
                    {updating ? 'Updating...' : 'Save Decision'}
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
