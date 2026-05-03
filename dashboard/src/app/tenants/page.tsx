'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Search, Building2, MapPin, Users, Home, X, CheckCircle, ArrowRight, Globe } from 'lucide-react';
import axios from 'axios';

import { useAuth } from '@/context/AuthContext';

export default function TenantsPage() {
  const { user: currentUser } = useAuth();
  const [tenants, setTenants] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTenant, setEditingTenant] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTenant, setNewTenant] = useState({ 
    name: '', 
    slug: '', 
    address: '', 
    organizationId: '', 
    regionId: '',
    startUnit: '',
    endUnit: ''
  });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('klb_token');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const tenantsRes = await axios.get('http://127.0.0.1:5001/api/admin/tenants', { headers });
      setTenants(tenantsRes.data.data);

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
      setNewTenant(prev => ({ ...prev, organizationId: currentUser.organizationId || '' }));
    }
  }, [currentUser, isModalOpen]);

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('klb_token');
      const payload = {
        ...newTenant,
        organizationId: (currentUser?.role === 'ORG_ADMIN' || currentUser?.role === 'TENANT_ADMIN') ? currentUser.organizationId : newTenant.organizationId
      };

      if (editingTenant) {
        await axios.put(`http://127.0.0.1:5001/api/admin/tenants/${editingTenant.id}`, payload, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        await axios.post('http://127.0.0.1:5001/api/admin/tenants', payload, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
      setIsModalOpen(false);
      setEditingTenant(null);
      setNewTenant({ 
        name: '', 
        slug: '', 
        address: '', 
        organizationId: '', 
        regionId: '',
        startUnit: '',
        endUnit: ''
      });
      fetchData();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Action failed';
      alert(message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure? This will delete all associated units.')) return;
    try {
      const token = localStorage.getItem('klb_token');
      await axios.delete(`http://127.0.0.1:5001/api/admin/tenants/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete');
    }
  };

  const openEditModal = (tenant: any) => {
    setEditingTenant(tenant);
    setNewTenant({
      name: tenant.name,
      slug: tenant.slug,
      address: tenant.address || '',
      organizationId: tenant.organizationId || '',
      regionId: tenant.regionId || '',
      startUnit: '',
      endUnit: ''
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-nature-forest neon-text">Managed Societies</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Oversee residential complexes, villas, and gated communities.</p>
        </div>
        {(currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ORG_ADMIN' || currentUser?.role === 'TENANT_ADMIN') && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center gap-2 h-12 px-6 shadow-xl shadow-nature-forest/20"
          >
            <Plus size={20} />
            <span>New Society</span>
          </button>
        )}
      </div>

      <div className="card-base overflow-hidden neon-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-nature-light/50 dark:bg-white/5 border-b border-nature-forest/10 dark:border-white/5">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Society Details</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Location</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Assets</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nature-light dark:divide-white/5">
              {loading ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="animate-pulse"><td colSpan={4} className="h-16 bg-gray-50 dark:bg-white/5" /></tr>
                ))
              ) : tenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-nature-light/30 dark:hover:bg-nature-900/5 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-nature-light dark:bg-nature-900/20 rounded-xl flex items-center justify-center text-nature-forest">
                        <Home size={20} />
                      </div>
                      <div>
                        <span className="font-bold text-gray-800 dark:text-white block">{tenant.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-400 font-mono uppercase">{tenant.slug}</span>
                          <span className="text-gray-300">•</span>
                          <span className="text-[10px] font-bold text-nature-forest uppercase tracking-tight">{tenant.organization?.name || 'Unknown Org'}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <MapPin size={16} />
                        <span className="text-sm">{tenant.address}</span>
                      </div>
                      <span className="text-[10px] font-bold text-nature-forest/60 uppercase ml-6">
                        {regions.find(r => r.id === tenant.regionId)?.name || 'No Region'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center gap-6 text-gray-400">
                      <div className="flex flex-col items-center">
                        <span className="text-lg font-bold text-gray-800 dark:text-white">{tenant._count?.units || 0}</span>
                        <span className="text-[9px] font-bold uppercase tracking-widest">Units</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-lg font-bold text-gray-800 dark:text-white">{tenant._count?.users || 0}</span>
                        <span className="text-[9px] font-bold uppercase tracking-widest">Staff</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => openEditModal(tenant)}
                        className="p-2 hover:bg-nature-light rounded-lg text-nature-forest transition-colors"
                      >
                        <ArrowRight size={16} />
                      </button>
                      {currentUser?.role !== 'TENANT_ADMIN' && (
                        <button 
                          onClick={() => handleDelete(tenant.id)}
                          className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in zoom-in duration-300">
          <div className="bg-white dark:bg-nature-950 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10">
            <div className="p-10 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-nature-light/30">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white tracking-tighter">
                  {editingTenant ? 'Update Society' : 'Deploy New Society'}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  {editingTenant ? 'Modify society parameters and associations.' : 'Connect a residential complex to the KLB Shield network.'}
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-white dark:bg-white/5 p-2 rounded-full"><X size={24} /></button>
            </div>
            <form onSubmit={handleCreateOrUpdate} className="p-10 grid grid-cols-2 gap-6">
              <div className="col-span-2 space-y-2">
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
                    value={newTenant.organizationId}
                    onChange={e => setNewTenant({...newTenant, organizationId: e.target.value})}
                  >
                    <option value="">Select Organization</option>
                    {organizations.map(org => <option key={org.id} value={org.id}>{org.name}</option>)}
                  </select>
                )}
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Region Cluster</label>
                <select 
                  required
                  className="w-full bg-nature-light dark:bg-white/5 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-nature-forest/20"
                  value={newTenant.regionId}
                  onChange={e => setNewTenant({...newTenant, regionId: e.target.value})}
                >
                  <option value="">Select Region</option>
                  {regions
                    .filter(r => !newTenant.organizationId || r.organizationId === newTenant.organizationId)
                    .map(reg => <option key={reg.id} value={reg.id}>{reg.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Society Name</label>
                <input 
                  required
                  className="w-full bg-nature-light dark:bg-white/5 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-nature-forest/20"
                  placeholder="e.g. Forest Hills"
                  value={newTenant.name}
                  onChange={e => setNewTenant({...newTenant, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Unique Identifier</label>
                <input 
                  required
                  className="w-full bg-nature-light dark:bg-white/5 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-nature-forest/20 font-mono"
                  placeholder="e.g. fh-residency"
                  value={newTenant.slug}
                  onChange={e => setNewTenant({...newTenant, slug: e.target.value.toLowerCase().replace(/ /g, '-')})}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Physical Address</label>
                <input 
                  required
                  className="w-full bg-nature-light dark:bg-white/5 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-nature-forest/20"
                  placeholder="123 Security Blvd, Green Valley, Bangalore"
                  value={newTenant.address}
                  onChange={e => setNewTenant({...newTenant, address: e.target.value})}
                />
              </div>
              {!editingTenant && (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Start Unit No.</label>
                    <input 
                      required
                      type="number"
                      className="w-full bg-nature-light dark:bg-white/5 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-nature-forest/20"
                      placeholder="1001"
                      value={newTenant.startUnit}
                      onChange={e => setNewTenant({...newTenant, startUnit: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">End Unit No.</label>
                    <input 
                      required
                      type="number"
                      className="w-full bg-nature-light dark:bg-white/5 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-nature-forest/20"
                      placeholder="1200"
                      value={newTenant.endUnit}
                      onChange={e => setNewTenant({...newTenant, endUnit: e.target.value})}
                    />
                  </div>
                </>
              )}
              <button type="submit" className="col-span-2 btn-primary w-full h-16 flex items-center justify-center gap-3 text-lg mt-4">
                <CheckCircle size={22} />
                {editingTenant ? 'Update Society Configuration' : 'Initialize Shield Network'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
