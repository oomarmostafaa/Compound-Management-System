import React, { useEffect, useState } from 'react';
import { apiPrivate } from '../../services/api';
import Loader from '../../components/Loader';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, AlertCircle, Edit2, Search, ChevronLeft, ChevronRight, X, User, Phone, CheckCircle, ShieldAlert, UserCheck, Calendar, Clipboard } from 'lucide-react';

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Pagination & Filter States
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(''); // '', 'OPEN', 'IN_PROGRESS', 'COMPLETED', 'CLOSED'
  const [type, setType] = useState(''); // '', 'MAINTENANCE', 'COMPLAINT'
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Modal States
  const [assignModal, setAssignModal] = useState(false);
  const [selectedReqId, setSelectedReqId] = useState(null);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [assigning, setAssigning] = useState(false);

  const [statusModal, setStatusModal] = useState(false);
  const [statusReqId, setStatusReqId] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchRequests = async () => {
    try {
      const res = await apiPrivate.get('/api/requests', {
        params: { search, status, type, page, limit }
      });
      setRequests(res.data.data);
      setTotalPages(res.data.totalPages || 1);
      setTotal(res.data.total || 0);
    } catch (err) {
      setError('Failed to fetch request tickets.');
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await apiPrivate.get('/api/staff', {
        params: { limit: 1000 }
      });
      setStaff(res.data.data);
    } catch (err) {
      console.error('Failed to fetch staff directory.');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchRequests(), fetchStaff()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, [search, status, type, page, limit]);

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setAssigning(true);
    try {
      await apiPrivate.post(`/api/requests/${selectedReqId}/assign`, {
        assignedStaffId: selectedStaffId
      });
      setAssignModal(false);
      setSelectedReqId(null);
      setSelectedStaffId('');
      fetchRequests();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to assign staff');
    } finally {
      setAssigning(false);
    }
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setUpdatingStatus(true);
    try {
      await apiPrivate.patch(`/api/requests/${statusReqId}/status`, {
        status: newStatus
      });
      setStatusModal(false);
      setStatusReqId(null);
      setNewStatus('');
      fetchRequests();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update request status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading && page === 1 && search === '') return <Loader />;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gradient tracking-tight">Support Requests</h1>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1.5">Assign workforce technicians, track maintenance tasks, and update complaints status.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/30 border border-red-900/40 text-red-400 text-xs font-semibold flex gap-2">
          <ShieldAlert size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filters, Types, Search & Limit Selector */}
      <div className="flex flex-col xl:flex-row gap-6 xl:items-center justify-between">
        {/* Status Tab list */}
        <div className="flex items-center gap-1.5 bg-slate-900/20 border border-slate-900 p-1 rounded-2xl w-fit overflow-x-auto max-w-full">
          {[
            { label: 'All', value: '' },
            { label: 'Open', value: 'OPEN' },
            { label: 'In Progress', value: 'IN_PROGRESS' },
            { label: 'Completed', value: 'COMPLETED' },
            { label: 'Closed', value: 'CLOSED' }
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
          {/* Request Type dropdown */}
          <div className="w-full sm:w-40">
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
              className="glass-input w-full py-2.5 px-3 text-xs font-semibold bg-slate-900 border border-slate-700/80 rounded-xl"
            >
              <option value="" className="bg-slate-950 text-slate-400">All Categories</option>
              <option value="MAINTENANCE" className="bg-slate-950 text-slate-200">Maintenance</option>
              <option value="COMPLAINT" className="bg-slate-950 text-slate-200">Complaint</option>
            </select>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:max-w-xs">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search title, desc, email..."
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

      {/* Grid Cards Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {requests.map((req) => {
          const isOpen = req.status === 'OPEN';
          const isInProgress = req.status === 'IN_PROGRESS';
          const isCompleted = req.status === 'COMPLETED';
          const isClosed = req.status === 'CLOSED';

          return (
            <motion.div
              key={req.id}
              whileHover={{ y: -4, scale: 1.01 }}
              className="glass-card rounded-3xl p-6 border border-slate-800 flex flex-col justify-between min-h-[320px] transition-all duration-300 relative overflow-hidden"
            >
              <div className="space-y-4">
                {/* Header Labels */}
                <div className="flex justify-between items-center">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border ${
                    req.type === 'MAINTENANCE'
                      ? 'bg-blue-950/30 border-blue-500/20 text-blue-400'
                      : 'bg-rose-950/30 border-rose-500/20 text-rose-400'
                  }`}>
                    {req.type}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border ${
                    isOpen ? 'bg-red-950/30 border-red-500/20 text-red-400' :
                    isInProgress ? 'bg-amber-950/30 border-amber-500/20 text-amber-400' :
                    isCompleted ? 'bg-emerald-950/30 border-emerald-500/20 text-emerald-400' :
                    'bg-slate-950/30 border-slate-700/20 text-slate-400'
                  }`}>
                    {req.status?.replace('_', ' ')}
                  </span>
                </div>

                {/* Ticket Details */}
                <div>
                  <h3 className="text-base font-bold text-slate-100 tracking-tight">{req.title}</h3>
                  <p className="text-slate-400 text-xs mt-2 leading-relaxed line-clamp-3" title={req.description}>
                    {req.description}
                  </p>
                </div>

                {/* Image Attachments if any */}
                {req.image && (
                  <div className="rounded-2xl overflow-hidden border border-slate-900 max-h-40 relative group cursor-pointer bg-slate-950">
                    <img 
                      src={req.image} 
                      alt="Complaint attachment" 
                      loading="lazy" 
                      className="w-full h-40 object-cover opacity-80 group-hover:opacity-100 transition-all duration-300"
                    />
                  </div>
                )}
              </div>

              {/* Assignment Details and Actions */}
              <div className="mt-6 pt-4 border-t border-slate-900/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1.5 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold uppercase tracking-wider text-[8px] text-slate-500">Applicant:</span>
                    <span className="font-semibold text-slate-350">{req.resident?.user?.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold uppercase tracking-wider text-[8px] text-slate-500">Staff Assigned:</span>
                    {req.assignedStaff ? (
                      <span className="font-bold text-primary-400">
                        {req.assignedStaff.user?.email} ({req.assignedStaff.jobTitle})
                      </span>
                    ) : (
                      <span className="font-extrabold text-red-400 tracking-wider text-[9px] uppercase">
                        Unassigned
                      </span>
                    )}
                  </div>
                </div>

                {/* Buttons Action */}
                <div className="flex gap-2 self-end sm:self-auto shrink-0">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setSelectedReqId(req.id);
                      setSelectedStaffId(req.assignedStaffId || '');
                      setAssignModal(true);
                    }}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold py-2 px-3.5 rounded-xl text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-all"
                  >
                    <UserCheck size={13} />
                    Assign
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setStatusReqId(req.id);
                      setNewStatus(req.status);
                      setStatusModal(true);
                    }}
                    className="btn-primary text-white font-bold py-2 px-3.5 rounded-xl text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-all"
                  >
                    <CheckCircle size={13} />
                    Status
                  </motion.button>
                </div>
              </div>
            </motion.div>
          );
        })}

        {requests.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-500 font-semibold uppercase tracking-wider text-xs border border-dashed border-slate-900 rounded-3xl">
            No support requests found.
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

      {/* Assign Staff Modal Dialog */}
      <AnimatePresence>
        {assignModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAssignModal(false)}
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
                  Assign Technician
                </h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setAssignModal(false)}
                  className="text-slate-500 hover:text-slate-300 p-1.5 rounded-lg"
                >
                  <X size={18} />
                </motion.button>
              </div>

              <form onSubmit={handleAssignSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-450 mb-1.5">Select Compound Employee</label>
                  <select
                    required
                    value={selectedStaffId}
                    onChange={(e) => setSelectedStaffId(e.target.value)}
                    className="glass-input w-full bg-slate-900 border border-slate-700/80 rounded-xl py-3 px-4 text-xs font-semibold text-slate-200"
                  >
                    <option value="" className="bg-slate-950 text-slate-450">Choose Technician</option>
                    {staff.map((s) => (
                      <option key={s.id} value={s.id} className="bg-slate-950 text-slate-200">
                        {s.user?.email || 'N/A'} ({s.jobTitle || 'No Title'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="button"
                    onClick={() => setAssignModal(false)}
                    className="flex-1 bg-slate-900 border border-slate-900 text-slate-400 font-bold py-3 rounded-xl text-xs uppercase tracking-widest"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={assigning}
                    className="flex-1 btn-primary py-3 rounded-xl text-xs font-bold uppercase tracking-widest"
                  >
                    {assigning ? 'Assigning...' : 'Assign Staff'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Change Status Modal Dialog */}
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
                  <CheckCircle size={18} className="text-primary-400" />
                  Change Request Status
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
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-450 mb-1.5">Select Ticket Status</label>
                  <select
                    required
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="glass-input w-full bg-slate-900 border border-slate-700/80 rounded-xl py-3 px-4 text-xs font-semibold text-slate-200"
                  >
                    <option value="OPEN" className="bg-slate-950 text-slate-200">OPEN</option>
                    <option value="IN_PROGRESS" className="bg-slate-950 text-slate-200">IN PROGRESS</option>
                    <option value="COMPLETED" className="bg-slate-950 text-slate-200">COMPLETED</option>
                    <option value="CLOSED" className="bg-slate-950 text-slate-200">CLOSED</option>
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
                    disabled={updatingStatus}
                    className="flex-1 btn-primary py-3 rounded-xl text-xs font-bold uppercase tracking-widest"
                  >
                    {updatingStatus ? 'Updating...' : 'Update Status'}
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

export default Requests;
