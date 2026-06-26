import React, { useEffect, useState } from 'react';
import { apiPrivate } from '../../services/api';
import Loader from '../../components/Loader';
import { AlertCircle, CheckCircle } from 'lucide-react';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Status updates states
  const [statusModal, setStatusModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  const fetchTasks = async () => {
    try {
      const response = await apiPrivate.get('/api/requests');
      setTasks(response.data.data);
    } catch (err) {
      setError('Failed to fetch assigned tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiPrivate.patch(`/api/requests/${selectedTaskId}/status`, {
        status: newStatus
      });
      setStatusModal(false);
      setSelectedTaskId(null);
      setNewStatus('');
      fetchTasks();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update task status');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gradient">Assigned Job Tasks</h1>
        <p className="text-slate-400 text-sm mt-1">Manage and resolve maintenance complaints allocated to you.</p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-950/30 border border-red-900/40 text-red-400 text-sm flex gap-2">
          <AlertCircle />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tasks.map((task) => (
          <div key={task.id} className="glass-panel rounded-2xl p-6 border border-slate-800 bg-slate-900/35 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-blue-950/40 border-blue-900/50 text-blue-400">
                  {task.type}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  task.status === 'OPEN' ? 'bg-red-950/40 border-red-900/50 text-red-400' :
                  task.status === 'IN_PROGRESS' ? 'bg-amber-950/40 border-amber-900/50 text-amber-400' :
                  task.status === 'COMPLETED' ? 'bg-emerald-950/40 border-emerald-900/50 text-emerald-400' :
                  'bg-slate-950/40 border-slate-900/50 text-slate-400'
                }`}>
                  {task.status}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-100">{task.title}</h3>
              <p className="text-slate-400 text-sm mt-2 leading-relaxed">{task.description}</p>
              
              {task.image && (
                <div className="mt-4 rounded-lg overflow-hidden border border-slate-800 max-h-48">
                  <img src={task.image} alt="Task attachment" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex justify-between items-center text-xs text-slate-400">
              <div>
                <p>Location: <span className="font-semibold text-slate-300">Apt {task.resident?.apartment?.number || 'Unassigned'}</span></p>
                <p className="mt-1">Resident host: <span className="font-semibold text-slate-300">{task.resident?.user?.email}</span></p>
              </div>

              <button
                onClick={() => {
                  setSelectedTaskId(task.id);
                  setNewStatus(task.status);
                  setStatusModal(true);
                }}
                className="bg-primary-600 hover:bg-primary-500 text-white font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1 transition-all"
              >
                <CheckCircle size={14} />
                Update Status
              </button>
            </div>
          </div>
        ))}

        {tasks.length === 0 && (
          <div className="col-span-2 text-center py-12 text-slate-500 font-semibold glass-panel rounded-2xl">
            You don't have any assigned tasks currently.
          </div>
        )}
      </div>

      {/* Change Status Modal */}
      {statusModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4">Update Job Status</h3>
            <form onSubmit={handleStatusSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Select Status</label>
                <select
                  required
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="glass-input w-full"
                >
                  <option value="OPEN">OPEN</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setStatusModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-500 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                >
                  Confirm Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
