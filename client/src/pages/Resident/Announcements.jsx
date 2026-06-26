import React, { useEffect, useState } from 'react';
import { apiPrivate } from '../../services/api';
import Loader from '../../components/Loader';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, AlertCircle, Calendar, User, Search, ChevronLeft, ChevronRight, X, ArrowUpDown, Filter } from 'lucide-react';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter & Sort States
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      const params = {
        sortBy,
        sortOrder,
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      };

      const response = await apiPrivate.get('/api/announcements', { params });
      setAnnouncements(response.data.data);
    } catch (err) {
      setError('Failed to fetch notices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [sortBy, sortOrder, startDate, endDate]);

  if (loading) return <Loader />;

  const handleSearch = () => {
    // Search is handled client-side since we have all data
    fetchAnnouncements();
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gradient tracking-tight">Community Board</h1>
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1.5">Stay updated with the latest notifications and compound broadcast messages.</p>
      </div>

      {/* Search Bar */}
      <div className="relative w-full sm:max-w-xs">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
          <Search size={16} />
        </span>
        <input
          type="text"
          placeholder="Search by title or content..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="glass-input w-full !pl-11 py-2.5 text-xs font-semibold border-slate-700/80 bg-slate-950/80 shadow-md"
        />
      </div>

      {/* Filters Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest bg-slate-800/50 border border-slate-700/80 text-slate-300 hover:border-primary-500/50 transition-all"
      >
        <Filter size={16} />
        Filters
      </motion.button>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-panel rounded-2xl p-6 border-slate-800 overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Sort By */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-450 mb-1.5">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="glass-input w-full"
                >
                  <option value="createdAt">Date</option>
                  <option value="title">Title</option>
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-450 mb-1.5">Order</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="glass-input w-full"
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-450 mb-1.5">From Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="glass-input w-full"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-450 mb-1.5">To Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="glass-input w-full"
                />
              </div>
            </div>

            {/* Clear Filters Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSortBy('createdAt');
                setSortOrder('desc');
                setStartDate('');
                setEndDate('');
              }}
              className="mt-4 text-xs font-bold text-primary-400 hover:text-primary-300 transition-colors"
            >
              Clear All Filters
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="p-3 rounded-xl bg-red-950/30 border border-red-900/40 text-red-400 text-xs font-semibold flex gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Announcements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {announcements.map((ann, index) => (
            <motion.div
              key={ann.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="glass-card rounded-2xl p-6 border-slate-800 hover:border-primary-500/30 transition-all duration-300 group"
            >
              {/* Header with icon and date */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-600/10 border border-primary-500/30 flex items-center justify-center text-primary-400 shrink-0 group-hover:scale-110 transition-transform">
                  <Megaphone size={22} />
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold">
                  <Calendar size={11} />
                  {new Date(ann.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
              </div>

              {/* Content */}
              <div className="space-y-3">
                <h3 className="text-base font-bold text-slate-100 leading-tight group-hover:text-primary-400 transition-colors">
                  {ann.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed line-clamp-3">
                  {ann.content}
                </p>
              </div>

              {/* Footer with author */}
              {ann.createdBy && (
                <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center gap-2 text-[10px] text-slate-500">
                  <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center">
                    <User size={10} className="text-slate-400" />
                  </div>
                  <span className="font-semibold">Posted by {ann.createdBy.email}</span>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {announcements.length === 0 && (
          <div className="col-span-full text-center py-16 text-slate-500 font-semibold glass-card rounded-2xl border-slate-800">
            <Megaphone size={40} className="mx-auto mb-4 text-slate-700" />
            <p className="text-sm">No announcements at the moment.</p>
            <p className="text-xs text-slate-600 mt-1">Check back later for updates!</p>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
        Showing {announcements.length} announcement{announcements.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};

export default Announcements;