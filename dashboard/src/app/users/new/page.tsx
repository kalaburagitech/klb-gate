'use client';
import React, { useState, useRef, useEffect } from 'react';
import { User, Mail, Phone, Shield, Building2, Upload, CheckCircle, Lock, X } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function CreateUserPage() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'GUARD',
    phoneNumber: '',
    unitId: '',
    idProofUrl: '',
    tenantId: '',
    organizationId: ''
  });

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const token = localStorage.getItem('klb_token');
        const res = await axios.get('http://127.0.0.1:5001/api/admin/organizations', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setOrganizations(res.data.data);
      } catch (error) {
        console.error('Failed to fetch organizations');
      }
    };
    if (currentUser?.role === 'SUPER_ADMIN') fetchOrgs();
  }, [currentUser]);

  useEffect(() => {
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

    if (currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ORG_ADMIN' || currentUser?.role === 'TENANT_ADMIN') {
      fetchTenants();
    } else if (currentUser?.tenantId) {
      setForm(f => ({ ...f, tenantId: currentUser.tenantId || '' }));
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchUnits = async () => {
      if (!form.tenantId) return;
      try {
        const token = localStorage.getItem('klb_token');
        const res = await axios.get(`http://127.0.0.1:5001/api/admin/units?tenantId=${form.tenantId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setUnits(res.data.data);
      } catch (error) {
        console.error('Failed to fetch units');
      }
    };
    fetchUnits();
  }, [form.tenantId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('klb_token');
      const res = await axios.post('http://127.0.0.1:5001/api/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': currentUser?.tenantId || form.tenantId
        }
      });
      setForm({ ...form, idProofUrl: res.data.data.id });
    } catch (error) {
      alert('File upload failed. Ensure you selected a society first if you are a Super Admin.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser?.role === 'SUPER_ADMIN' && !form.tenantId) {
      alert('Please select a society for this user');
      return;
    }

    // Role-specific validation
    if ((form.role === 'GUARD' || form.role === 'OFFICER') && !form.idProofUrl) {
      alert('ID Proof document is mandatory for Security Personnel');
      return;
    }

    if (form.role === 'RESIDENT' && !form.unitId) {
      alert('Unit assignment is mandatory for Residents');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('klb_token');
      await axios.post('http://127.0.0.1:5001/api/admin/users', form, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert('User created successfully');
      router.push('/users');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-nature-forest neon-text">Onboard Personnel</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Register new residents, officers, or security guards.</p>
        </div>

        {/* Society Selection / Display */}
        <div className="flex items-center gap-3 bg-white dark:bg-white/5 p-3 pr-6 rounded-2xl shadow-soft border border-nature-forest/10">
          <div className="w-10 h-10 bg-nature-forest/10 rounded-xl flex items-center justify-center text-nature-forest">
            <Building2 size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Target Society</p>
            {currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ORG_ADMIN' || currentUser?.role === 'TENANT_ADMIN' ? (
              <select 
                className="bg-transparent font-bold text-gray-800 dark:text-white outline-none cursor-pointer"
                value={form.tenantId}
                onChange={(e) => setForm({ ...form, tenantId: e.target.value })}
              >
                <option value="">Select Society</option>
                {tenants.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            ) : (
              <p className="font-bold text-nature-forest">{currentUser?.tenant?.name || 'Assigned Society'}</p>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Personal Info */}
        <div className="card-base p-8 space-y-6 neon-border">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <User size={20} className="text-nature-forest" />
            Identity Details
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">First Name</label>
              <input 
                required
                className="w-full bg-nature-light dark:bg-white/5 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-nature-forest/20"
                placeholder="John"
                value={form.firstName}
                onChange={(e) => setForm({...form, firstName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
              <input 
                required
                className="w-full bg-nature-light dark:bg-white/5 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-nature-forest/20"
                placeholder="Doe"
                value={form.lastName}
                onChange={(e) => setForm({...form, lastName: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Mobile Number</label>
            <div className="relative">
              <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                required
                className="w-full pl-12 bg-nature-light dark:bg-white/5 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-nature-forest/20"
                placeholder="+91 98765 43210"
                value={form.phoneNumber}
                onChange={(e) => setForm({...form, phoneNumber: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* System Access */}
        <div className="card-base p-8 space-y-6 neon-border">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Shield size={20} className="text-nature-forest" />
            Access & Role
          </h2>

          {currentUser?.role === 'SUPER_ADMIN' && (
            <div className="space-y-4 animate-in slide-in-from-top-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Parent Organization</label>
                <select 
                  required
                  className="w-full bg-nature-light dark:bg-white/5 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-nature-forest/20"
                  value={form.organizationId}
                  onChange={(e) => {
                    setForm({ ...form, organizationId: e.target.value, tenantId: '' });
                  }}
                >
                  <option value="">Select Organization</option>
                  {organizations.map(org => <option key={org.id} value={org.id}>{org.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Target Society</label>
                <select 
                  required
                  className="w-full bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-nature-forest/20"
                  value={form.tenantId}
                  onChange={(e) => setForm({...form, tenantId: e.target.value})}
                >
                  <option value="">Select Target Society</option>
                  {tenants
                    .filter(t => !form.organizationId || t.organizationId === form.organizationId)
                    .map(t => <option key={t.id} value={t.id}>{t.name}</option>)
                  }
                </select>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Account Role</label>
            <select 
              className="w-full bg-nature-light dark:bg-white/5 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-nature-forest/20"
              value={form.role}
              onChange={(e) => setForm({...form, role: e.target.value})}
            >
              <option value="GUARD">Security Guard</option>
              <option value="OFFICER">Security Officer</option>
              <option value="RESIDENT">Resident / Owner</option>
              <option value="TENANT_ADMIN">Society Admin</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email</label>
              <input 
                type="email"
                required
                className="w-full bg-nature-light dark:bg-white/5 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-nature-forest/20"
                placeholder="john.doe@example.com"
                value={form.email}
                onChange={(e) => setForm({...form, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
              <input 
                type="password"
                required
                className="w-full bg-nature-light dark:bg-white/5 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-nature-forest/20"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({...form, password: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Verification */}
        <div className="card-base p-8 md:col-span-2 space-y-6 neon-border">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Upload size={20} className="text-nature-forest" />
            Verification Documents
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed ${form.idProofUrl ? 'border-green-500 bg-green-50/10' : 'border-nature-forest/20 hover:bg-nature-light/50'} rounded-3xl p-12 flex flex-col items-center justify-center space-y-4 transition-all cursor-pointer relative overflow-hidden group`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileUpload}
                accept="image/*,.pdf"
              />
              
              {uploading ? (
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-nature-forest" />
              ) : form.idProofUrl ? (
                <>
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-500/20">
                    <CheckCircle size={32} />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-green-600">Document Securely Stored</p>
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setForm({...form, idProofUrl: ''}); }}
                      className="text-xs text-red-500 font-bold hover:underline mt-2 flex items-center gap-1 justify-center"
                    >
                      <X size={12} /> Replace File
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-nature-light dark:bg-nature-900/20 rounded-full flex items-center justify-center text-nature-forest group-hover:scale-110 transition-transform">
                    <Upload size={32} />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-gray-800 dark:text-white">Upload ID Proof</p>
                    <p className="text-sm text-gray-400">Aadhaar, PAN, or Passport (PDF/JPG)</p>
                  </div>
                </>
              )}
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Assign Unit / Flat</label>
                  <span className="text-[10px] font-bold text-nature-forest bg-nature-light px-2 py-0.5 rounded">
                    {units.length} UNITS AVAILABLE
                  </span>
                </div>
                <div className="relative">
                  <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select 
                    className="w-full pl-12 bg-nature-light dark:bg-white/5 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-nature-forest/20"
                    value={form.unitId}
                    onChange={(e) => setForm({...form, unitId: e.target.value})}
                  >
                    <option value="">Select Unit</option>
                    {units.map(u => (
                      <option key={u.id} value={u.id}>
                        Unit {u.unitNumber} {u.isOccupied ? '• [Occupied]' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <button 
                type="submit"
                disabled={loading || uploading}
                className="btn-primary w-full h-16 flex items-center justify-center gap-3 text-lg shadow-xl shadow-nature-forest/20"
              >
                {loading ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" /> : (
                  <>
                    <CheckCircle size={22} />
                    Finalize Personnel Onboarding
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
