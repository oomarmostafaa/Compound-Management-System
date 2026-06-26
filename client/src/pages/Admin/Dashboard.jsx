import React, { useEffect, useState } from 'react';
import { apiPrivate } from '../../services/api';
import Loader from '../../components/Loader';
import { motion } from 'framer-motion';
import { 
  Users, 
  Building2, 
  Home, 
  ClipboardList, 
  ShieldCheck, 
  AlertCircle,
  TrendingUp
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiPrivate.get('/api/dashboard/stats');
        setStats(response.data.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <Loader />;

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl bg-red-950/20 border border-red-900/30 text-red-400 flex items-center gap-3"
      >
        <AlertCircle />
        <span className="font-semibold text-sm">{error}</span>
      </motion.div>
    );
  }

  const cards = [
    {
      title: 'Total Residents',
      value: stats?.residents?.total || 0,
      icon: <Users className="text-blue-400" size={22} />,
      color: 'from-blue-600/10 to-blue-500/5',
      border: 'border-blue-500/20 hover:border-blue-500/40 hover:shadow-blue-500/5',
      trend: 'Active Accounts'
    },
    {
      title: 'Total Staff',
      value: stats?.staff?.total || 0,
      icon: <Users className="text-emerald-400" size={22} />,
      color: 'from-emerald-600/10 to-emerald-500/5',
      border: 'border-emerald-500/20 hover:border-emerald-500/40 hover:shadow-emerald-500/5',
      trend: 'On Duty'
    },
    {
      title: 'Buildings Count',
      value: stats?.buildings?.total || 0,
      icon: <Building2 className="text-indigo-400" size={22} />,
      color: 'from-indigo-600/10 to-indigo-500/5',
      border: 'border-indigo-500/20 hover:border-indigo-500/40 hover:shadow-indigo-500/5',
      trend: 'Registered Blocks'
    },
    {
      title: 'Apartments total',
      value: stats?.apartments?.total || 0,
      icon: <Home className="text-purple-400" size={22} />,
      color: 'from-purple-600/10 to-purple-500/5',
      border: 'border-purple-500/20 hover:border-purple-500/40 hover:shadow-purple-500/5',
      trend: 'Total Units'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.04 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 4 },
    show: { opacity: 1, y: 0, transition: { duration: 0.15, ease: 'easeOut' } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-extrabold text-gradient tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-450 text-xs font-semibold uppercase tracking-wider mt-1.5">Real-time statistics and analytics for the compound.</p>
      </motion.div>

      {/* Stats Cards Grid */}
      <motion.div 
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {cards.map((card, idx) => (
          <motion.div 
            key={idx}
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.01 }}
            className={`glass-card rounded-2xl p-6 border ${card.border} bg-gradient-to-tr ${card.color} flex items-center justify-between transition-all duration-300 cursor-pointer`}
          >
            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">{card.title}</p>
              <h3 className="text-3xl font-extrabold mt-2 text-white">{card.value}</h3>
              <span className="text-[9px] font-bold text-slate-500 mt-1 block uppercase tracking-wider">{card.trend}</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-950/60 flex items-center justify-center border border-slate-900 shadow-inner">
              {card.icon}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Row 2: Occupancy Rate & Request Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Apartment Occupancy */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -2 }}
          className="glass-panel rounded-2xl p-6 hover:border-slate-800/80 transition-all duration-300"
        >
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-2 mb-6">
            <Home size={18} className="text-primary-400" />
            Apartment Occupancy
          </h2>
          
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-extrabold tracking-widest">Occupancy Rate</span>
                <p className="text-4xl font-extrabold mt-2 text-primary-400">{stats?.apartments?.occupancyRate}</p>
              </div>
              <div className="text-right text-xs text-slate-400 font-bold space-y-0.5">
                <p>Occupied: <span className="text-slate-200 font-extrabold">{stats?.apartments?.occupied}</span></p>
                <p>Empty: <span className="text-slate-200 font-extrabold">{stats?.apartments?.empty}</span></p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-900 shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: stats?.apartments?.occupancyRate || '0%' }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-primary-500 to-indigo-500 rounded-full"
              ></motion.div>
            </div>
          </div>
        </motion.div>

        {/* Request Statuses */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -2 }}
          className="glass-panel rounded-2xl p-6 hover:border-slate-800/80 transition-all duration-300"
        >
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-2 mb-6">
            <ClipboardList size={18} className="text-primary-400" />
            Support Requests Lifecycle
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <motion.div whileHover={{ scale: 1.02 }} className="p-4 bg-slate-950/20 border border-slate-900/60 rounded-2xl hover:border-red-500/20 transition-all duration-300">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-red-400 block mb-1">Open Tickets</span>
              <span className="text-2xl font-extrabold text-slate-100">{stats?.requests?.open || 0}</span>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} className="p-4 bg-slate-950/20 border border-slate-900/60 rounded-2xl hover:border-amber-500/20 transition-all duration-300">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-amber-400 block mb-1">In Progress</span>
              <span className="text-2xl font-extrabold text-slate-100">{stats?.requests?.inProgress || 0}</span>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} className="p-4 bg-slate-950/20 border border-slate-900/60 rounded-2xl hover:border-emerald-500/20 transition-all duration-300">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-400 block mb-1">Completed</span>
              <span className="text-2xl font-extrabold text-slate-100">{stats?.requests?.completed || 0}</span>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} className="p-4 bg-slate-950/20 border border-slate-900/60 rounded-2xl hover:border-slate-500/20 transition-all duration-300">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 block mb-1">Closed</span>
              <span className="text-2xl font-extrabold text-slate-100">{stats?.requests?.closed || 0}</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
