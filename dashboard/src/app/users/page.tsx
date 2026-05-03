'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Search, User, Shield, Home, MoreVertical, Smartphone, Calendar, Mail, Edit, Trash, X, CheckCircle, Building, Globe } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const [tenants, setTenants] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('klb_token');
      const res = await axios.get('http://127.0.0.1:5001/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUsers(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTenants = async () => {
    try {
      const token = localStorage.getItem('klb_token');
      const res = await axios.get('http://127.0.0.1:5001/api/admin/tenants', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setTenants(res.data.data);
    } catch (error) {
      console.error('Failed to fetch societies');
    }
  };

  const fetchUnits = async (tenantId: string) => {
    try {
      const token = localStorage.getItem('klb_token');
      const res = await axios.get(`http://127.0.0.1:5001/api/admin/units?tenantId=${tenantId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUnits(res.data.data);
    } catch (error) {
      console.error('Failed to fetch units');
    }
  };

  useEffect(() => {
    fetchUsers();
    if (currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ORG_ADMIN') {
      fetchTenants();
    }
  }, [currentUser]);

  useEffect(() => {
    // Priority 1: The specific society assigned to the user being edited
    // Priority 2: For Tenant Admins, use their own fixed society context
    const targetTenantId = editingUser?.tenantId || (currentUser?.role === 'TENANT_ADMIN' ? currentUser.tenantId : null);
    
    if (targetTenantId) {
      fetchUnits(targetTenantId);
    } else {
      setUnits([]);
    }
  }, [editingUser?.id, editingUser?.tenantId]); // Strictly depend on the user being edited

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('klb_token');
      await axios.delete(`http://127.0.0.1:5001/api/admin/users/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUsers(users.filter(u => u.id !== id));
      setShowDeleteConfirm(null);
    } catch (error) {
      alert('Failed to delete user');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('klb_token');
      await axios.put(`http://127.0.0.1:5001/api/admin/users/${editingUser.id}`, editingUser, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchUsers(); // Reload to get updated names/relations
      setEditingUser(null);
    } catch (error) {
      alert('Failed to update user');
    }
  };

  const filtered = users.filter(u => 
    u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.phoneNumber && u.phoneNumber.includes(searchTerm))
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-nature-forest neon-text">Society Personnel</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage residents, security guards, and administrative officers.</p>
        </div>
        <Link 
          href="/users/new"
          className="btn-primary flex items-center gap-2 h-12 px-6 shadow-xl shadow-nature-forest/20"
        >
          <Plus size={20} />
          <span>Onboard User</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white dark:bg-dark-card p-4 rounded-3xl shadow-soft neon-border">
        <div className="flex-1 relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, phone, or email..."
            className="w-full pl-12 pr-4 py-3 bg-nature-light dark:bg-nature-900/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-nature-forest/20 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* User Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-48 bg-gray-100 dark:bg-white/5 animate-pulse rounded-3xl" />)
        ) : filtered.map((user) => (
          <div key={user.id} className="card-base p-6 hover:border-nature-forest/30 transition-all group relative overflow-hidden">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-nature-forest rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-nature-forest/20">
                  {user.firstName[0]}{user.lastName[0]}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 dark:text-white text-lg">{user.firstName} {user.lastName}</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      user.role === 'RESIDENT' ? 'bg-blue-100 text-blue-700' : 
                      user.role === 'GUARD' ? 'bg-amber-100 text-amber-700' : 'bg-nature-light text-nature-forest'
                    }`}>
                      {user.role}
                    </span>
                    {user.unitNumber ? (
                      <div className="flex items-center gap-1.5 bg-nature-forest/10 text-nature-forest px-3 py-1 rounded-lg border border-nature-forest/20 shadow-sm">
                        <Home size={10} strokeWidth={3} />
                        <span className="text-[10px] font-black tracking-tighter">FLAT {user.unitNumber}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 bg-gray-100 text-gray-400 px-3 py-1 rounded-lg border border-gray-200">
                        <X size={10} strokeWidth={3} />
                        <span className="text-[10px] font-bold tracking-tighter italic">NO FLAT ASSIGNED</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setEditingUser({ ...user, tenantId: user.tenantId || user.tenant?.id })}
                  className="text-gray-400 hover:text-nature-forest p-1 transition-colors"
                >
                  <Edit size={18} />
                </button>
                {user.id !== currentUser?.id && (
                  <button 
                    onClick={() => setShowDeleteConfirm(user.id)}
                    className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                  >
                    <Trash size={18} />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-nature-light dark:border-white/5">
              {/* Organization and Society Info */}
              <div className="flex flex-col gap-2 mb-2">
                {user.organization && (
                  <div className="flex items-center gap-2 text-nature-forest/70">
                    <Globe size={12} />
                    <span className="text-[10px] font-black uppercase tracking-tighter">{user.organization.name}</span>
                  </div>
                )}
                {user.tenant && (
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Home size={14} className="text-nature-forest" />
                    <span className="font-medium text-gray-700">
                      {user.tenant?.name}
                      {user.tenant?.region?.name && (
                        <span className="text-gray-400 font-normal"> / {user.tenant.region.name}</span>
                      )}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                <Smartphone size={14} className="text-nature-forest" />
                <span className="text-sm font-medium">{user.phoneNumber || 'No phone'}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                <Mail size={14} className="text-nature-forest" />
                <span className="text-sm font-medium truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <Calendar size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Added {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Role Icon Overlay */}
            <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity">
              {user.role === 'RESIDENT' ? <Home size={80} /> : <Shield size={80} />}
            </div>

            {/* Delete Confirmation Overlay */}
            {showDeleteConfirm === user.id && (
              <div className="absolute inset-0 bg-red-600/95 flex flex-col items-center justify-center p-6 text-center animate-in zoom-in duration-200 z-10">
                <Trash size={40} className="text-white mb-4" />
                <p className="text-white font-bold mb-6">Terminate this user's access permanently?</p>
                <div className="flex gap-4 w-full">
                  <button 
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => handleDelete(user.id)}
                    className="flex-1 py-3 bg-white text-red-600 hover:bg-gray-100 rounded-xl font-bold transition-all shadow-lg"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-nature-950 w-full max-w-lg rounded-[40px] p-10 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-black text-nature-forest">Edit Profile</h2>
              <button onClick={() => setEditingUser(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full">
                <X size={24} />
              </button>
            </div>

            {editingUser.unitNumber && (
              <div className="flex items-center gap-2 mb-6 bg-nature-forest/10 border border-nature-forest/20 p-4 rounded-2xl">
                <div className="w-10 h-10 bg-nature-forest rounded-xl flex items-center justify-center text-white">
                  <Home size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-nature-forest uppercase tracking-widest leading-none mb-1">Currently Assigned To</p>
                  <p className="font-bold text-gray-800">Unit {editingUser.unitNumber} • {editingUser.tenant?.name || 'Selected Society'}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">First Name</label>
                  <input 
                    className="w-full bg-gray-50 dark:bg-white/5 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-nature-forest/20"
                    value={editingUser.firstName}
                    onChange={e => setEditingUser({...editingUser, firstName: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
                  <input 
                    className="w-full bg-gray-50 dark:bg-white/5 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-nature-forest/20"
                    value={editingUser.lastName}
                    onChange={e => setEditingUser({...editingUser, lastName: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Mobile Number</label>
                <input 
                  className="w-full bg-gray-50 dark:bg-white/5 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-nature-forest/20"
                  value={editingUser.phoneNumber}
                  onChange={e => setEditingUser({...editingUser, phoneNumber: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">System Role</label>
                  <select 
                    className="w-full bg-gray-50 dark:bg-white/5 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-nature-forest/20"
                    value={editingUser.role}
                    onChange={e => setEditingUser({...editingUser, role: e.target.value})}
                  >
                    <option value="RESIDENT">RESIDENT</option>
                    <option value="GUARD">GUARD</option>
                    <option value="OFFICER">OFFICER</option>
                    <option value="TENANT_ADMIN">TENANT_ADMIN</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Assigned Society</label>
                  {currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ORG_ADMIN' ? (
                    <select 
                      className="w-full bg-gray-50 dark:bg-white/5 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-nature-forest/20"
                      value={editingUser.tenantId || ''}
                      onChange={e => setEditingUser({...editingUser, tenantId: e.target.value, unitId: ''})}
                    >
                      <option value="">No Society Assigned</option>
                      {tenants.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="w-full bg-gray-100 dark:bg-white/5 p-4 rounded-2xl text-gray-500 font-bold">
                      {currentUser?.tenant?.name || 'Fixed Context'}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Assign Unit (Optional)</label>
                  <select 
                    className="w-full bg-gray-50 dark:bg-white/5 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-nature-forest/20"
                    value={editingUser.unitId || ''}
                    onChange={e => setEditingUser({...editingUser, unitId: e.target.value})}
                  >
                    <option value="">None / Unassigned</option>
                    {units.map(u => (
                      <option key={u.id} value={u.id}>
                        Unit {u.unitNumber} 
                        {u.id === editingUser.unitId ? ' • [CURRENT]' : (u.isOccupied ? ' • [OCCUPIED]' : ' • [VACANT]')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4">
                <button type="submit" className="btn-primary w-full h-16 flex items-center justify-center gap-2 text-lg shadow-xl shadow-nature-forest/20">
                  <CheckCircle size={20} />
                  Save Access Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
