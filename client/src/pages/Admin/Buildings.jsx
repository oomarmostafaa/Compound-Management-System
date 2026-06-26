import React, { useEffect, useState } from 'react';
import { apiPrivate } from '../../services/api';
import Loader from '../../components/Loader';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, AlertCircle, Edit2, Search, ChevronLeft, ChevronRight, X } from 'lucide-react';

const Buildings = () => {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Pagination States
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Form & Modal States
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [activeBuildingId, setActiveBuildingId] = useState(null);
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchBuildings = async () => {
    try {
      const res = await apiPrivate.get('/api/buildings', {
        params: { search, page, limit }
      });
      setBuildings(res.data.data);
      setTotalPages(res.data.totalPages || 1);
      setTotal(res.data.total || 0);
    } catch (err) {
      setError('Failed to fetch buildings list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuildings();
  }, [search, page, limit]);

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setActiveBuildingId(null);
    setName('');
    setNumber('');
    setError('');
    setShowModal(true);
  };

  const handleOpenEditModal = (building) => {
    setModalMode('edit');
    setActiveBuildingId(building.id);
    setName(building.name);
    setNumber(building.number);
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (modalMode === 'create') {
        await apiPrivate.post('/api/buildings', { name, number });
      } else {
        await apiPrivate.put(`/api/buildings/${activeBuildingId}`, { name, number });
      }
      setName('');
      setNumber('');
      setShowModal(false);
      fetchBuildings();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to submit form');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this building? This will remove all associated apartments.')) return;
    try {
      await apiPrivate.delete(`/api/buildings/${id}`);
      fetchBuildings();
    } catch (err) {
      setError('Failed to delete building');
    }
  };

  if (loading && page === 1 && search === '') return <Loader />;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gradient tracking-tight">Manage Buildings</h1>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1.5">Add, edit, or remove structural compound blocks.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleOpenCreateModal}
          className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest self-start sm:self-auto"
        >
          <Plus size={16} />
          Add Building
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
            placeholder="Search name or number..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // Reset page on query change
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

      {/* Buildings list card */}
      <div className="glass-card rounded-2xl p-6 overflow-x-auto border-slate-800">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
              <th className="py-3.5 px-4">Building Name</th>
              <th className="py-3.5 px-4">Building Number</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-xs">
            {buildings.map((b) => (
              <tr key={b.id} className="border-b border-slate-900/60 hover:bg-slate-900/10 transition-all">
                <td className="py-4.5 px-4 font-bold text-slate-200">{b.name}</td>
                <td className="py-4.5 px-4 font-semibold text-slate-400">{b.number}</td>
                <td className="py-4.5 px-4 text-right flex items-center justify-end gap-1">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleOpenEditModal(b)}
                    className="text-primary-400 hover:text-primary-300 p-2.5 rounded-xl hover:bg-primary-950/20 border border-transparent hover:border-primary-900/20 transition-all"
                  >
                    <Edit2 size={16} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(b.id)}
                    className="text-red-400 hover:text-red-350 p-2.5 rounded-xl hover:bg-red-950/20 border border-transparent hover:border-red-950/20 transition-all"
                  >
                    <Trash2 size={16} />
                  </motion.button>
                </td>
              </tr>
            ))}
            {buildings.length === 0 && (
              <tr>
                <td colSpan="3" className="py-12 text-center text-slate-500 font-semibold uppercase tracking-wider text-xs">
                  No buildings registered.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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

      {/* Action Dialog Modal */}
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
                  {modalMode === 'create' ? 'Add New Building' : 'Edit Building details'}
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
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-450 mb-1.5">Building Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Block C"
                    className="glass-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-450 mb-1.5">Building Number</label>
                  <input
                    type="text"
                    required
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    placeholder="e.g. 103"
                    className="glass-input w-full"
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
                    {submitting ? 'Saving...' : modalMode === 'create' ? 'Add Block' : 'Save Changes'}
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

export default Buildings;
