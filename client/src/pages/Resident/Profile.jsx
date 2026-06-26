import React, { useEffect, useState } from 'react';
import { apiPrivate } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, FileText, Camera, UploadCloud, Trash2, User, Phone, CreditCard, Home, Key, ExternalLink } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Password Change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  // File states
  const [docType, setDocType] = useState('NATIONAL_ID');
  const [docFile, setDocFile] = useState(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const fetchProfileAndDocs = async () => {
    try {
      const [profRes, docRes] = await Promise.all([
        apiPrivate.get('/api/residents/me'),
        apiPrivate.get('/api/documents')
      ]);
      
      setProfile(profRes.data.data);
      setDocuments(docRes.data.data);
    } catch (err) {
      setError('Failed to load profile resources.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfileAndDocs();
    }
  }, [user]);

  const handleProfileImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profileImage', file);

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await apiPrivate.post('/api/residents/profile-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess('Profile image updated successfully!');
      await fetchProfileAndDocs();
    } catch (err) {
      setError('Failed to upload profile image.');
      setLoading(false);
    }
  };

  const handleDocumentUpload = async (e) => {
    e.preventDefault();
    if (!docFile) return;

    setError('');
    setSuccess('');
    setUploadingDoc(true);

    const formData = new FormData();
    formData.append('type', docType);
    formData.append('file', docFile);

    try {
      await apiPrivate.post('/api/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess('Official document uploaded successfully!');
      setDocFile(null);
      // Reset input element
      e.target.reset();
      await fetchProfileAndDocs();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to upload document.');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDeleteDoc = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    setError('');
    setSuccess('');
    try {
      await apiPrivate.delete(`/api/documents/${id}`);
      setSuccess('Document deleted successfully.');
      fetchProfileAndDocs();
    } catch (err) {
      setError('Failed to delete document');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setPwLoading(true);
    try {
      await apiPrivate.post('/api/auth/change-password', {
        oldPassword,
        newPassword
      });
      setSuccess('Password updated successfully!');
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update password');
    } finally {
      setPwLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gradient tracking-tight">My Profile Portal</h1>
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1.5">Manage personal info, settings, and official residency contracts.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/30 border border-red-900/40 text-red-400 text-xs font-semibold flex gap-2">
          <ShieldAlert size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-900/40 text-emerald-400 text-xs font-semibold flex gap-2">
          <ShieldCheck size={16} className="shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Card & Password settings */}
        <div className="space-y-8 lg:col-span-1">
          {/* Profile Card */}
          <div className="glass-panel rounded-3xl p-8 border border-slate-800 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3">
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-primary-950/20 border border-primary-500/20 text-primary-400">
                Resident
              </span>
            </div>

            {/* Profile Avatar with upload trigger */}
            <div className="relative group cursor-pointer mb-6 mt-4">
              <div className="w-28 h-28 rounded-full bg-slate-900 border-2 border-slate-800 overflow-hidden flex items-center justify-center shadow-2xl relative">
                {profile?.profileImage ? (
                  <img 
                    src={profile.profileImage} 
                    alt="profile avatar" 
                    className="w-full h-full object-cover" 
                    key={profile.profileImage} // forces reload when changed
                  />
                ) : (
                  <span className="text-5xl font-extrabold text-gradient uppercase">
                    {user?.email?.charAt(0)}
                  </span>
                )}
              </div>
              <label className="absolute inset-0 bg-slate-950/80 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer border-2 border-primary-500/30">
                <Camera size={22} className="text-primary-400 mb-1" />
                <span className="text-[8px] font-extrabold uppercase tracking-widest text-slate-300">Upload</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleProfileImageChange} />
              </label>
            </div>

            <h3 className="font-extrabold text-lg text-slate-200 tracking-tight">{user?.email}</h3>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1 block">National ID: {profile?.nationalId || 'N/A'}</span>

            {/* Profile Details List */}
            <div className="w-full mt-6 pt-6 border-t border-slate-900/60 text-left text-xs space-y-4">
              <div className="flex items-center gap-3 text-slate-450">
                <Phone size={14} className="text-slate-500 shrink-0" />
                <div>
                  <span className="text-[8px] font-extrabold uppercase tracking-widest text-slate-500 block">Phone Connection</span>
                  <span className="font-semibold text-slate-300">{profile?.phone || 'N/A'}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-450">
                <Home size={14} className="text-slate-500 shrink-0" />
                <div>
                  <span className="text-[8px] font-extrabold uppercase tracking-widest text-slate-500 block">Assigned Apartment</span>
                  {profile?.apartment ? (
                    <span className="font-bold text-emerald-450">
                      Apt {profile.apartment.number} (Bldg {profile.apartment.building?.number})
                    </span>
                  ) : (
                    <span className="font-semibold text-slate-500">No apartment assigned</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Change Password settings */}
          <div className="glass-panel rounded-3xl p-8 border border-slate-800 space-y-6">
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-350 flex items-center gap-2">
              <Key size={16} className="text-primary-400" />
              Change Password
            </h3>

             <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-450 mb-1.5">Old Password</label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••"
                  className="glass-input w-full"
                />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-450 mb-1.5">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="glass-input w-full"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={pwLoading}
                className="w-full btn-primary py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest"
              >
                {pwLoading ? 'Updating...' : 'Save New Password'}
              </motion.button>
            </form>
          </div>
        </div>

        {/* Right Column: Upload documents & list */}
        <div className="lg:col-span-2 space-y-8">
          {/* Upload Document Panel */}
          <div className="glass-panel rounded-3xl p-8 border border-slate-800 space-y-6">
            <h2 className="text-lg font-bold flex items-center gap-2 text-slate-100">
              <UploadCloud size={20} className="text-primary-400" />
              Upload Document Hub
            </h2>

            <form onSubmit={handleDocumentUpload} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-450 mb-1.5">Document Type</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="glass-input w-full bg-slate-900 border border-slate-700/80 rounded-xl py-2.5 px-3 text-xs font-semibold"
                >
                  <option value="NATIONAL_ID" className="bg-slate-950 text-slate-200">National ID</option>
                  <option value="OWNERSHIP_CONTRACT" className="bg-slate-950 text-slate-200">Ownership Contract</option>
                  <option value="RENTAL_CONTRACT" className="bg-slate-950 text-slate-200">Rental Contract</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-450 mb-1.5">Select PDF/Image File</label>
                <input
                  type="file"
                  required
                  onChange={(e) => setDocFile(e.target.files[0])}
                  className="glass-input w-full text-xs text-slate-400 py-1.5 px-3"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={uploadingDoc}
                className="w-full btn-primary py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest self-end"
              >
                {uploadingDoc ? 'Uploading...' : 'Upload File'}
              </motion.button>
            </form>
          </div>

          {/* Uploaded Documents List */}
          <div className="glass-panel rounded-3xl p-8 border border-slate-800 space-y-6">
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-350 flex items-center gap-2">
              <FileText size={16} className="text-primary-400" />
              Verified Submissions
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.map((doc) => {
                return (
                  <motion.div
                    key={doc.id}
                    whileHover={{ y: -2 }}
                    className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-primary-400 shrink-0">
                        <FileText size={20} />
                      </div>
                      <div className="overflow-hidden">
                        <span className="text-[10px] font-extrabold text-primary-400 bg-primary-950/20 px-2 py-0.5 rounded border border-primary-900/10 inline-block mb-1.5">
                          {doc.type?.replace('_', ' ')}
                        </span>
                        <span className="text-[9px] text-slate-500 block font-bold uppercase">Uploaded {new Date(doc.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-slate-200 p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-750 transition-all"
                        title="View Document"
                      >
                        <ExternalLink size={14} />
                      </a>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeleteDoc(doc.id)}
                        className="text-red-400 hover:text-red-350 p-2 rounded-xl bg-red-950/10 border border-red-950/20 hover:border-red-950/30 transition-all"
                        title="Delete Document"
                      >
                        <Trash2 size={14} />
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}

              {documents.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-500 font-semibold uppercase tracking-wider text-xs border border-dashed border-slate-900 rounded-3xl">
                  No documents uploaded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
