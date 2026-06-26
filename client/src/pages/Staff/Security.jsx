import React, { useEffect, useState } from 'react';
import { apiPrivate } from '../../services/api';
import Loader from '../../components/Loader';
import { Search, ShieldAlert, Check, X } from 'lucide-react';

const Security = () => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchVisitors = async (query = '') => {
    try {
      const response = await apiPrivate.get(`/api/visitors?search=${query}`);
      setVisitors(response.data.data);
    } catch (err) {
      setError('Failed to query visitors registry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchVisitors(search);
  };

  const handleStatusChange = async (id, status) => {
    try {
      await apiPrivate.patch(`/api/visitors/${id}/status`, { status });
      fetchVisitors(search);
    } catch (err) {
      setError('Failed to update visitor access state.');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gradient">Security Checkpoint</h1>
        <p className="text-slate-400 text-sm mt-1">Verify pre-registered visitors and check them in or out.</p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-950/30 border border-red-900/40 text-red-400 text-sm flex gap-2">
          <ShieldAlert />
          <span>{error}</span>
        </div>
      )}

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-4 max-w-xl">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search visitor by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass-input w-full pl-11"
          />
        </div>
        <button
          type="submit"
          className="bg-primary-600 hover:bg-primary-500 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all"
        >
          Search
        </button>
      </form>

      {/* Visitors List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visitors.map((v) => (
          <div key={v.id} className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg text-slate-200">{v.name}</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  v.status === 'APPROVED' ? 'bg-emerald-950/40 border-emerald-900/50 text-emerald-400' :
                  v.status === 'REJECTED' ? 'bg-red-950/40 border-red-900/50 text-red-400' :
                  'bg-amber-950/40 border-amber-900/50 text-amber-400'
                }`}>
                  {v.status}
                </span>
              </div>
              <p className="text-sm text-slate-400">Phone: <span className="text-slate-200 font-semibold">{v.phone}</span></p>
              <p className="text-sm text-slate-400">Scheduled: <span className="text-slate-200">{new Date(v.visitDate).toLocaleString()}</span></p>
              <div className="pt-3 border-t border-slate-800 text-xs text-slate-500">
                <p>Resident host: <span className="font-semibold text-slate-400">{v.resident?.user?.email}</span></p>
                <p className="mt-0.5">Apartment: <span className="font-semibold text-primary-400">Apt {v.resident?.apartment?.number || 'Unassigned'}</span></p>
              </div>
            </div>

            {v.status === 'PENDING' && (
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => handleStatusChange(v.id, 'APPROVED')}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 text-xs transition-all"
                >
                  <Check size={14} />
                  Approve Entry
                </button>
                <button
                  onClick={() => handleStatusChange(v.id, 'REJECTED')}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 text-xs transition-all"
                >
                  <X size={14} />
                  Reject Entry
                </button>
              </div>
            )}
          </div>
        ))}

        {visitors.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-500 font-semibold">
            No visitor matches found.
          </div>
        )}
      </div>
    </div>
  );
};

export default Security;
