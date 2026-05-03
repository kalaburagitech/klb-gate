'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Search, Building2, MoreVertical, X, CheckCircle, ArrowRight } from 'lucide-react';
import axios from 'axios';

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newOrg, setNewOrg] = useState({ name: '', slug: '' });

  const [editingOrg, setEditingOrg] = useState<any>(null);

  const fetchOrgs = async () => {
    try {
      const token = localStorage.getItem('klb_token');
      const res = await axios.get('http://127.0.0.1:5001/api/admin/organizations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setOrganizations(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('klb_token');
      if (editingOrg) {
        await axios.put(`http://127.0.0.1:5001/api/admin/organizations/${editingOrg.id}`, newOrg, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        await axios.post('http://127.0.0.1:5001/api/admin/organizations', newOrg, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
      setIsModalOpen(false);
      setNewOrg({ name: '', slug: '' });
      setEditingOrg(null);
      fetchOrgs();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Action failed';
      alert(message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure? All data for this org will be affected.')) return;
    try {
      const token = localStorage.getItem('klb_token');
      await axios.delete(`http://127.0.0.1:5001/api/admin/organizations/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchOrgs();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete');
    }
  };

  const openEditModal = (org: any) => {
    setEditingOrg(org);
    setNewOrg({ name: org.name, slug: org.slug });
    setIsModalOpen(true);
  };

  const filtered = organizations.filter(o => 
    o.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-nature-forest neon-text">Organizations</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage global security partners and high-level groups.</p>
        </div>
        <button 
          onClick={() => {
            setEditingOrg(null);
            setNewOrg({ name: '', slug: '' });
            setIsModalOpen(true);
          }}
          className="btn-primary flex items-center gap-2 h-12 px-6 shadow-xl shadow-nature-forest/20"
        >
          <Plus size={20} />
          <span>New Organization</span>
        </button>
      </div>

      {/* Filters Section */}
      <div className="flex items-center gap-4 bg-white dark:bg-dark-card p-4 rounded-2xl shadow-soft neon-border">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search organizations..."
            className="w-full pl-12 pr-4 py-3 bg-nature-light dark:bg-nature-900/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-nature-forest/20 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grid Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-64 bg-gray-100 dark:bg-white/5 animate-pulse rounded-3xl" />)
        ) : filtered.map((org) => (
          <div key={org.id} className="card-base p-6 group hover:border-nature-forest/30 transition-all relative">
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 bg-nature-light dark:bg-nature-900/20 rounded-2xl flex items-center justify-center text-nature-forest">
                <Building2 size={28} />
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => openEditModal(org)}
                  className="p-2 hover:bg-nature-light rounded-lg text-nature-forest transition-colors"
                >
                  <ArrowRight size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(org.id)}
                  className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{org.name}</h3>
            <p className="text-sm text-gray-500 mb-6 flex items-center gap-1">
              <span className="bg-nature-light dark:bg-nature-900/30 text-nature-forest px-2 py-0.5 rounded text-xs font-mono lowercase">
                {org.slug}
              </span>
            </p>

            <div className="flex items-center justify-between pt-6 border-t border-nature-light dark:border-white/5">
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 uppercase tracking-widest">Active Tenants</span>
                <span className="text-lg font-bold text-nature-forest">{org._count?.tenants || 0}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs text-gray-400 uppercase tracking-widest">Status</span>
                <span className="text-sm font-bold text-green-500 uppercase tracking-tighter">Verified</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-nature-950 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-white/10">
            <div className="p-8 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white tracking-tighter">
                {editingOrg ? 'Update Partner' : 'New Partner'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleCreateOrUpdate} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Organization Name</label>
                <input 
                  required
                  className="w-full bg-nature-light dark:bg-white/5 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-nature-forest/20"
                  placeholder="e.g. KLB Global Security"
                  value={newOrg.name}
                  onChange={e => setNewOrg({...newOrg, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Unique Slug (URL)</label>
                <input 
                  required
                  className="w-full bg-nature-light dark:bg-white/5 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-nature-forest/20 font-mono"
                  placeholder="e.g. klb-global"
                  value={newOrg.slug}
                  onChange={e => setNewOrg({...newOrg, slug: e.target.value.toLowerCase().replace(/ /g, '-')})}
                />
              </div>
              <button type="submit" className="btn-primary w-full h-14 flex items-center justify-center gap-3 text-lg">
                <CheckCircle size={22} />
                {editingOrg ? 'Update Organization' : 'Register Organization'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
