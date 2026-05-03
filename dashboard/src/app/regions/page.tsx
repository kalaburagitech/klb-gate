'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Search, MapPin, Building2, X, CheckCircle, ArrowRight, Globe } from 'lucide-react';
import axios from 'axios';

import { useAuth } from '@/context/AuthContext';

export default function RegionsPage() {
  const { user: currentUser } = useAuth();
  const [regions, setRegions] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRegion, setNewRegion] = useState({ name: '', organizationId: '' });
  const [editingRegion, setEditingRegion] = useState<any>(null);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('klb_token');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const regionsRes = await axios.get('http://127.0.0.1:5001/api/admin/regions', { headers });
      setRegions(regionsRes.data.data);

      if (currentUser?.role === 'SUPER_ADMIN') {
        const orgsRes = await axios.get('http://127.0.0.1:5001/api/admin/organizations', { headers });
        setOrganizations(orgsRes.data.data);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if ((currentUser?.role === 'ORG_ADMIN' || currentUser?.role === 'TENANT_ADMIN') && currentUser?.organizationId) {
      setNewRegion(prev => ({ ...prev, organizationId: currentUser.organizationId || '' }));
    }
  }, [currentUser]);

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('klb_token');
      const payload = {
        ...newRegion,
        organizationId: (currentUser?.role === 'ORG_ADMIN' || currentUser?.role === 'TENANT_ADMIN') ? currentUser.organizationId : newRegion.organizationId
      };

      if (editingRegion) {
        await axios.put(`http://127.0.0.1:5001/api/admin/regions/${editingRegion.id}`, payload, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        await axios.post('http://127.0.0.1:5001/api/admin/regions', payload, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
      setIsModalOpen(false);
      setEditingRegion(null);
      setNewRegion({ name: '', organizationId: currentUser?.organizationId || '' });
      fetchData();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Action failed';
      alert(message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure? All societies in this region will be affected.')) return;
    try {
      const token = localStorage.getItem('klb_token');
      await axios.delete(`http://127.0.0.1:5001/api/admin/regions/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete');
    }
  };

  const openEditModal = (region: any) => {
    setEditingRegion(region);
    setNewRegion({ name: region.name, organizationId: region.organizationId });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-nature-forest neon-text">Service Regions</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Geographical zones for clustering apartment societies.</p>
        </div>
        {(currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ORG_ADMIN' || currentUser?.role === 'TENANT_ADMIN') && (
          <button 
            onClick={() => {
              setEditingRegion(null);
              setNewRegion({ name: '', organizationId: currentUser?.organizationId || '' });
              setIsModalOpen(true);
            }}
            className="btn-primary flex items-center gap-2 h-12 px-6 shadow-xl shadow-nature-forest/20"
          >
            <Plus size={20} />
            <span>New Region</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="h-40 card-base animate-pulse" />
          ))
        ) : regions.map((region) => (
          <div key={region.id} className="card-base p-6 hover:neon-border transition-all group relative">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-nature-light dark:bg-nature-900/20 rounded-2xl flex items-center justify-center text-nature-forest">
                <MapPin size={24} />
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => openEditModal(region)}
                  className="p-2 hover:bg-nature-light rounded-lg text-nature-forest transition-colors"
                >
                  <ArrowRight size={18} />
                </button>
                {currentUser?.role !== 'TENANT_ADMIN' && (
                  <button 
                    onClick={() => handleDelete(region.id)}
                    className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">{region.name}</h3>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Building2 size={14} />
              <span>{region.organization?.name || 'Unknown Org'}</span>
            </div>
            <div className="mt-4 pt-4 border-t border-nature-light dark:border-white/5 flex justify-between items-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Linked Assets</span>
              <span className="text-xs font-bold text-nature-forest bg-nature-light px-2 py-0.5 rounded-lg">
                {region._count?.tenants || 0} Societies
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in zoom-in duration-300">
          <div className="bg-white dark:bg-nature-950 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10">
            <div className="p-8 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-nature-light/30">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {editingRegion ? 'Update Region' : 'Add Region'}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  {editingRegion ? 'Modify region parameters.' : 'Define a new geographical cluster.'}
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-white dark:bg-white/5 p-2 rounded-full"><X size={24} /></button>
            </div>
            <form onSubmit={handleCreateOrUpdate} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Parent Organization</label>
                {currentUser?.role === 'ORG_ADMIN' || currentUser?.role === 'TENANT_ADMIN' ? (
                  <div className="w-full bg-nature-light dark:bg-white/5 p-4 rounded-2xl flex items-center gap-3">
                    <Globe size={18} className="text-nature-forest" />
                    <span className="font-bold text-gray-700 dark:text-white">
                      {currentUser.organization?.name || 'Your Organization'}
                    </span>
                  </div>
                ) : (
                  <select 
                    required
                    className="w-full bg-nature-light dark:bg-white/5 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-nature-forest/20"
                    value={newRegion.organizationId}
                    onChange={e => setNewRegion({...newRegion, organizationId: e.target.value})}
                  >
                    <option value="">Select Organization</option>
                    {organizations.map(org => <option key={org.id} value={org.id}>{org.name}</option>)}
                  </select>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Region Name</label>
                <input 
                  required
                  className="w-full bg-nature-light dark:bg-white/5 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-nature-forest/20"
                  placeholder="e.g. Bangalore North"
                  value={newRegion.name}
                  onChange={e => setNewRegion({...newRegion, name: e.target.value})}
                />
              </div>
              <button type="submit" className="btn-primary w-full h-14 flex items-center justify-center gap-3 text-lg mt-4">
                <CheckCircle size={22} />
                {editingRegion ? 'Update Region' : 'Create Region'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
