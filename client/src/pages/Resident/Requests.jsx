import React, { useEffect, useState } from 'react';
import { apiPrivate } from '../../services/api';
import Loader from '../../components/Loader';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, AlertCircle, FileText, Search, ChevronLeft, ChevronRight, X, Image, CheckCircle, Clock, XCircle, ExternalLink, Paperclip } from 'lucide-react';

const Requests = () => {
  const [requests, setRequests] = useState([]);
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
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('MAINTENANCE');
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchRequests = async () => {
    try {
      const response = await apiPrivate.get('/api/requests', {
        params: { search, page, limit }
      });
      setRequests(response.data.data);
      setTotalPages(response.data.totalPages || 1);
      setTotal(response.data.total || 0);
    } catch (err) {
      setError('Failed to fetch request tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [search, page, limit]);

  const handleOpenModal = () => {
    setTitle('');
    setDescription('');
    setType('MAINTENANCE');
    setImage(null);
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('type', type);
    if (image) {
      formData.append('image', image);
    }

    try {
      await apiPrivate.post('/api/requests', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setTitle('');
      setDescription('');
      setImage(null);
      setShowModal(false);
      fetchRequests();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseRequest = async (id) => {
    if (!window.confirm('Are you sure you want to mark this request as CLOSED?')) return;
    try {
      await apiPrivate.patch(`/api/requests/${id}/status`, { status: 'CLOSED' });
      fetchRequests();
    } catch (err) {
      setError('Failed to close request');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      OPEN: 'bg-red-950/40 border-red-900/50 text-red-400',
      IN_PROGRESS: 'bg-amber-950/40 border-amber-900/50 text-amber-400',
      COMPLETED: 'bg-emerald-950/40 border-emerald-900/50 text-emerald-400',
      CLOSED: 'bg-slate-950/40 border-slate-900/50 text-slate-400'
    };
    return styles[status] || styles.CLOSED;
  };

  const getTypeBadge = (type) => {
    return type === 'MAINTENANCE'
      ? 'bg-blue-950/40 border-blue-900/50 text-blue-400'
      : 'bg-rose-950/40 border-rose-900/50 text-rose-400';
  };

  if (loading && page === 1 && search === '') return <Loader />;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gradient tracking-tight">Support Requests</h1>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1.5">Submit maintenance complaints or tickets directly to management.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleOpenModal}
          className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest self-start sm:self-auto"
        >
          <Plus size={16} />
          New Request
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
            placeholder="Search by title..."
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

      {/* Requests list */}
      <div className="space-y-4">
        {requests.map((req) => (
          <motion.div
            key={req.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-6 border-slate-800"
          >
            <div>
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getTypeBadge(req.type)}`}>
                  {req.type}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(req.status)}`}>
                  {req.status === 'OPEN' && <Clock size={12} className="inline mr-1" />}
                  {req.status === 'IN_PROGRESS' && <Clock size={12} className="inline mr-1" />}
                  {req.status === 'COMPLETED' && <CheckCircle size={12} className="inline mr-1" />}
                  {req.status === 'CLOSED' && <XCircle size={12} className="inline mr-1" />}
                  {req.status}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-100 break-words">{req.title}</h3>
              <p className="text-slate-400 text-sm mt-2 leading-relaxed break-words">{req.description}</p>
              
              {/* Image attachment below description */}
              {req.image && (
                <div className="mt-4 p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-lg bg-slate-800/80 flex items-center justify-center shrink-0 overflow-hidden">
                      <img src={req.image} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-200 truncate">Attachment Image</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Click to view full image</p>
                    </div>
                  </div>
                  <a
                    href={req.image}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-400 hover:text-primary-300 p-2 rounded-lg hover:bg-primary-950/20 transition-all shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(req.image, '_blank', 'noopener,noreferrer');
                    }}
                  >
                    <ExternalLink size={16} />
                  </a>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
              <span className="font-semibold">
                Submitted: {new Date(req.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
              {req.status !== 'CLOSED' && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCloseRequest(req.id)}
                  className="bg-slate-800 hover:bg-red-950/40 hover:text-red-400 border border-transparent hover:border-red-900/20 text-slate-300 font-bold py-2 px-4 rounded-xl text-[10px] uppercase tracking-widest transition-all"
                >
                  Close Ticket
                </motion.button>
              )}
            </div>
          </motion.div>
        ))}

        {requests.length === 0 && (
          <div className="text-center py-16 text-slate-500 font-semibold glass-card rounded-2xl border-slate-800">
            <FileText size={40} className="mx-auto mb-4 text-slate-700" />
            <p className="text-sm">You haven't filed any support requests yet.</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleOpenModal}
              className="mt-4 btn-primary inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest"
            >
              <Plus size={14} />
              Create Your First Request
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

      {/* Create Request Modal */}
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
                  File New Request
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
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-450 mb-1.5">Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Faucet Leakage"
                    className="glass-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-450 mb-1.5">Description</label>
                  <textarea
                    required
                    rows="3"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide details about the issue..."
                    className="glass-input w-full resize-none"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-450 mb-1.5">Request Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="glass-input w-full"
                  >
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="COMPLAINT">Complaint</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-450 mb-1.5">Optional Image Attachment</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImage(e.target.files[0])}
                      className="glass-input w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-primary-600 file:text-white file:text-[10px] file:font-bold file:uppercase file:tracking-wider"
                    />
                  </div>
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
                    {submitting ? 'Submitting...' : 'Submit Ticket'}
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