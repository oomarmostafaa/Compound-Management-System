import React, { useEffect, useState } from 'react';
import { apiPrivate } from '../../services/api';
import Loader from '../../components/Loader';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, AlertCircle, Edit2, Search, ChevronLeft, ChevronRight, X, User, Phone, CreditCard, Home } from 'lucide-react';

const Residents = () => {
  const [residents, setResidents] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Pagination States
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Form & Modal States
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [activeResidentId, setActiveResidentId] = useState(null);

  // Form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [apartmentId, setApartmentId] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const fetchResidents = async () => {
    try {
      const res = await apiPrivate.get('/api/residents', {
        params: { search, page, limit }
      });
      setResidents(res.data.data);
      setTotalPages(res.data.totalPages || 1);
      setTotal(res.data.total || 0);
    } catch (err) {
      setError('Failed to fetch residents.');
    }
  };

  const fetchApartments = async () => {
    try {
      const res = await apiPrivate.get('/api/apartments', {
        params: { limit: 1000 } // Fetch all apartments for allocation
      });
      setApartments(res.data.data);
    } catch (err) {
      console.error('Failed to fetch apartments list');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchResidents(), fetchApartments()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchResidents();
  }, [search, page, limit]);

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setActiveResidentId(null);
    setEmail('');
    setPassword('');
    setPhone('');
    setNationalId('');
    setApartmentId('');
    setError('');
    setShowModal(true);
  };

  const handleOpenEditModal = (resident) => {
    setModalMode('edit');
    setActiveResidentId(resident.id);
    setEmail(resident.user.email); // Read-only on edit
    setPassword(''); // Not editable via this endpoint
    setPhone(resident.phone || '');
    setNationalId(resident.nationalId || '');
    setApartmentId(resident.apartmentId || '');
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (modalMode === 'create') {
        await apiPrivate.post('/api/residents', {
          email,
          password,
          phone,
          nationalId,
          apartmentId: apartmentId || undefined
        });
      } else {
        await apiPrivate.put(`/api/residents/${activeResidentId}`, {
          phone,
          nationalId,
          apartmentId: apartmentId || null
        });
      }
      setShowModal(false);
      fetchResidents();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to submit form');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resident? This will deactivate their user account.')) return;
    try {
      await apiPrivate.delete(`/api/residents/${id}`);
      fetchResidents();
    } catch (err) {
      setError('Failed to delete resident');
    }
  };

  if (loading && page === 1 && search === '') return <Loader />;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gradient tracking-tight">Residents Directory</h1>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1.5">Manage compound occupants, contact credentials, and apartments.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleOpenCreateModal}
          className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest self-start sm:self-auto"
        >
          <Plus size={16} />
          Register Resident
        </motion.button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/30 border border-red-900/40 text-red-400 text-xs font-semibold flex gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filters & Search Row */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search email, phone, or ID..."
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

      {/* Residents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {residents.map((r) => {
          const hasApartment = !!r.apartment;
          return (
            <motion.div
              key={r.id}
              whileHover={{ y: -4, scale: 1.01 }}
              className="glass-card rounded-3xl p-6 border border-slate-800 flex flex-col justify-between h-56 transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary-500/20 to-indigo-600/20 border border-primary-500/20 flex items-center justify-center font-bold text-gradient text-sm shadow-inner">
                      {r.user.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="text-sm font-bold text-slate-200 truncate max-w-[160px]" title={r.user.email}>
                        {r.user.email}
                      </h3>
                      <span className="text-[9px] uppercase font-extrabold tracking-widest text-primary-400">
                        Resident
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-1 text-slate-400 text-xs">
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-slate-500" />
                    <span className="font-semibold">{r.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard size={14} className="text-slate-500" />
                    <span className="font-semibold">{r.nationalId || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Home size={14} className="text-slate-500" />
                    {hasApartment ? (
                      <span className="font-bold text-emerald-400 text-[10px] uppercase tracking-wider">
                        {r.apartment.building?.name} - {r.apartment.number}
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                        No Apt Assigned
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-slate-900/60 flex items-center justify-end gap-1 mt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleOpenEditModal(r)}
                  className="text-primary-400 hover:text-primary-350 p-2.5 rounded-xl hover:bg-primary-950/20 border border-transparent hover:border-primary-900/20 transition-all"
                >
                  <Edit2 size={16} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDelete(r.id)}
                  className="text-red-400 hover:text-red-350 p-2.5 rounded-xl hover:bg-red-950/20 border border-transparent hover:border-red-950/20 transition-all"
                >
                  <Trash2 size={16} />
                </motion.button>
              </div>
            </motion.div>
          );
        })}
        {residents.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-500 font-semibold uppercase tracking-wider text-xs border border-dashed border-slate-900 rounded-3xl">
            No residents found.
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

      {/* Modal Dialog */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
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
                  <User size={18} className="text-primary-400" />
                  {modalMode === 'create' ? 'Register Resident' : 'Edit Resident Details'}
                </h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setShowModal(false)}
                  className="text-slate-500 hover:text-slate-300 p-1.5 rounded-lg"
                >
                  <X size={18} />
                </motion.button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {modalMode === 'create' ? (
                  <>
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-450 mb-1.5">Email Address</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@gmail.com"
                        className="glass-input w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-450 mb-1.5">Account Password</label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="glass-input w-full"
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-450 mb-1.5">Email Address (Read-only)</label>
                    <input
                      type="text"
                      disabled
                      value={email}
                      className="glass-input w-full opacity-60 cursor-not-allowed"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-450 mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 0100203040"
                    className="glass-input w-full"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-450 mb-1.5">National ID</label>
                  <input
                    type="text"
                    required
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    placeholder="14-digit National ID"
                    className="glass-input w-full"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-450 mb-1.5">Assigned Apartment (Optional)</label>
                  <select
                    value={apartmentId}
                    onChange={(e) => setApartmentId(e.target.value)}
                    className="glass-input w-full bg-slate-900 border border-slate-700/80 rounded-xl py-3 px-4 text-xs font-semibold"
                  >
                    <option value="" className="bg-slate-950 text-slate-400">None / Unassigned</option>
                    {apartments.map((apt) => (
                      <option key={apt.id} value={apt.id} className="bg-slate-950 text-slate-200">
                        {apt.building?.name || 'Block'} - {apt.number} ({apt.status})
                      </option>
                    ))}
                  </select>
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
                    {submitting ? 'Saving...' : modalMode === 'create' ? 'Register' : 'Save Changes'}
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

export default Residents;
