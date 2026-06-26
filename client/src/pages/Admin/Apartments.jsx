import React, { useEffect, useState } from 'react';
import { apiPrivate } from '../../services/api';
import Loader from '../../components/Loader';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, UserPlus, AlertCircle, Search, Edit2, ChevronLeft, ChevronRight, X, User } from 'lucide-react';

const Apartments = () => {
  const [apartments, setApartments] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Pagination & Filter States
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [status, setStatus] = useState(''); // '', 'OCCUPIED', 'EMPTY'
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Form & Modal States
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [activeAptId, setActiveAptId] = useState(null);
  const [number, setNumber] = useState('');
  const [floor, setFloor] = useState('');
  const [buildingId, setBuildingId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Assign Resident States
  const [assignModal, setAssignModal] = useState(false);
  const [selectedAptId, setSelectedAptId] = useState(null);
  const [selectedResId, setSelectedResId] = useState('');
  const [assigning, setAssigning] = useState(false);

  const fetchApartments = async () => {
    try {
      const res = await apiPrivate.get('/api/apartments', {
        params: { search, page, limit, status }
      });
      setApartments(res.data.data);
      setTotalPages(res.data.totalPages || 1);
      setTotal(res.data.total || 0);
    } catch (err) {
      setError('Failed to fetch apartments list.');
    }
  };

  const fetchMeta = async () => {
    try {
      const [buildRes, resRes] = await Promise.all([
        apiPrivate.get('/api/buildings'),
        apiPrivate.get('/api/residents')
      ]);
      setBuildings(buildRes.data.data);
      setResidents(resRes.data.data);
    } catch (err) {
      setError('Failed to fetch auxiliary metadata.');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchApartments(), fetchMeta()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchApartments();
  }, [search, page, limit, status]);

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setActiveAptId(null);
    setNumber('');
    setFloor('');
    setBuildingId('');
    setError('');
    setShowModal(true);
  };

  const handleOpenEditModal = (apt) => {
    setModalMode('edit');
    setActiveAptId(apt.id);
    setNumber(apt.number);
    setFloor(apt.floor);
    setBuildingId(apt.buildingId);
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (modalMode === 'create') {
        await apiPrivate.post('/api/apartments', {
          number,
          floor: parseInt(floor),
          buildingId,
          status: 'EMPTY'
        });
      } else {
        await apiPrivate.put(`/api/apartments/${activeAptId}`, {
          number,
          floor: parseInt(floor),
          buildingId
        });
      }
      setNumber('');
      setFloor('');
      setBuildingId('');
      setShowModal(false);
      fetchApartments();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save apartment details');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this apartment?')) return;
    try {
      await apiPrivate.delete(`/api/apartments/${id}`);
      fetchApartments();
    } catch (err) {
      setError('Failed to delete apartment');
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setAssigning(true);
    try {
      await apiPrivate.post(`/api/apartments/${selectedAptId}/assign`, {
        residentId: selectedResId
      });
      setAssignModal(false);
      setSelectedAptId(null);
      setSelectedResId('');
      fetchApartments();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to assign resident');
    } finally {
      setAssigning(false);
    }
  };

  if (loading && page === 1 && search === '') return <Loader />;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gradient tracking-tight">Manage Apartments</h1>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1.5">Register apartments and assign residents.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleOpenCreateModal}
          className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest self-start sm:self-auto"
        >
          <Plus size={16} />
          Add Apartment
        </motion.button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/30 border border-red-900/40 text-red-400 text-xs font-semibold flex gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filters, Status Tabs & Search Bar */}
      <div className="flex flex-col xl:flex-row gap-6 xl:items-center justify-between">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-900/20 border border-slate-900 p-1 rounded-2xl w-fit">
          {[
            { label: 'All Units', value: '' },
            { label: 'Occupied', value: 'OCCUPIED' },
            { label: 'Empty/Vacant', value: 'EMPTY' }
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
                  isTabActive ? 'text-white font-bold bg-gradient-to-r from-primary-600/90 to-indigo-700/90 border border-primary-500/20 shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center w-full xl:w-auto">
          {/* Search */}
          <div className="relative w-full sm:max-w-xs">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search apartment number..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="glass-input w-full !pl-11 py-2.5 text-xs font-semibold border-slate-700/80 bg-slate-950/80 shadow-md"
            />
          </div>

          {/* Limit */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Show:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(parseInt(e.target.value));
                setPage(1);
              }}
              className="glass-input py-1.5 px-3 text-xs font-bold bg-slate-900 border border-slate-700/80 rounded-xl"
            >
              <option value={8}>8 per page</option>
              <option value={12}>12 per page</option>
              <option value={24}>24 per page</option>
              <option value={48}>48 per page</option>
            </select>
          </div>
        </div>
      </div>

      {/* Apartments professional cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {apartments.map((apt) => {
          const isOccupied = apt.status === 'OCCUPIED';
          return (
            <motion.div
              key={apt.id}
              whileHover={{ y: -4, scale: 1.01 }}
              className={`glass-card rounded-3xl p-6 border ${
                isOccupied ? 'border-primary-500/10 hover:border-primary-500/30' : 'border-emerald-500/10 hover:border-emerald-500/30'
              } flex flex-col justify-between h-52 relative overflow-hidden transition-all duration-300`}
            >
              {/* Card Header details */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500">
                    Floor {apt.floor}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                    isOccupied 
                      ? 'bg-primary-950/20 border-primary-500/30 text-primary-400' 
                      : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400'
                  }`}>
                    {isOccupied ? 'Occupied' : 'Vacant'}
                  </span>
                </div>
                <h3 className="text-2xl font-extrabold text-slate-200 mt-2 tracking-tight">
                  {apt.number}
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  {apt.building?.name || 'Unknown Block'}
                </p>
              </div>

              {/* Card Footer details */}
              <div className="pt-4 border-t border-slate-900/60 flex items-center justify-between mt-auto">
                <div className="overflow-hidden pr-2">
                  {isOccupied ? (
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-slate-950 border border-slate-900 flex items-center justify-center text-[9px] font-bold text-gradient">
                        R
                      </div>
                      <span className="text-[10px] font-bold text-slate-300 truncate max-w-[120px] block" title={apt.resident?.user?.email}>
                        {apt.resident?.user?.email}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                      Unassigned
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-0.5 shrink-0">
                  {!isOccupied && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedAptId(apt.id);
                        setAssignModal(true);
                      }}
                      title="Assign Resident"
                      className="text-emerald-400 hover:text-emerald-350 p-2 rounded-xl hover:bg-emerald-950/20 transition-all"
                    >
                      <UserPlus size={16} />
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleOpenEditModal(apt)}
                    className="text-primary-400 hover:text-primary-350 p-2 rounded-xl hover:bg-primary-950/20 transition-all"
                  >
                    <Edit2 size={16} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(apt.id)}
                    className="text-red-400 hover:text-red-350 p-2 rounded-xl hover:bg-red-950/20 transition-all"
                  >
                    <Trash2 size={16} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          );
        })}
        {apartments.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-500 font-semibold uppercase tracking-wider text-xs border border-dashed border-slate-900 rounded-3xl">
            No apartments matched the parameters.
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

      {/* Action Dialog Modal */}
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
                  <Plus size={18} className="text-primary-400" />
                  {modalMode === 'create' ? 'Add New Apartment' : 'Edit Apartment details'}
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
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-450 mb-1.5">Apartment Number</label>
                  <input
                    type="text"
                    required
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    placeholder="e.g. A-101"
                    className="glass-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-450 mb-1.5">Floor</label>
                  <input
                    type="number"
                    required
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                    placeholder="e.g. 1"
                    className="glass-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-450 mb-1.5">Select Building</label>
                  <select
                    required
                    value={buildingId}
                    onChange={(e) => setBuildingId(e.target.value)}
                    className="glass-input w-full bg-slate-900 border border-slate-700/80 rounded-xl py-3 px-4"
                  >
                    <option value="" className="bg-slate-950 text-slate-400">Choose Building</option>
                    {buildings.map((b) => (
                      <option key={b.id} value={b.id} className="bg-slate-950 text-slate-200">
                        {b.name} ({b.number})
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
                    {submitting ? 'Saving...' : modalMode === 'create' ? 'Add Apartment' : 'Save Changes'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Assign Resident Dialog Modal */}
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
                  <User size={18} className="text-primary-400" />
                  Assign Resident
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
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-450 mb-1.5">Select Resident</label>
                  <select
                    required
                    value={selectedResId}
                    onChange={(e) => setSelectedResId(e.target.value)}
                    className="glass-input w-full bg-slate-900 border border-slate-700/80 rounded-xl py-3 px-4"
                  >
                    <option value="" className="bg-slate-950 text-slate-400">Choose Resident</option>
                    {residents.map((r) => (
                      <option key={r.id} value={r.id} className="bg-slate-950 text-slate-200">
                        {r.user?.email || 'N/A'} (ID: {r.nationalId})
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
                    {assigning ? 'Assigning...' : 'Confirm Assign'}
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

export default Apartments;
