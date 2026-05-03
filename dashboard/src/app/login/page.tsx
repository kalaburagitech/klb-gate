'use client';
import React, { useState } from 'react';
import { Shield, Mail, Lock, ArrowRight, TreeDeciduous } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/utils/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data.data;
      login(token, user);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-nature-light dark:bg-black flex items-center justify-center p-4">
      {/* Nature/Bio Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-nature-forest/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-nature-forest/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-lg relative animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="card-base p-12 neon-border backdrop-blur-xl bg-white/80 dark:bg-nature-950/20">
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-20 h-20 bg-nature-forest rounded-2xl flex items-center justify-center shadow-2xl shadow-nature-forest/20 mb-6 group cursor-pointer overflow-hidden relative">
              <Shield size={40} className="text-white relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-tr from-nature-forest to-nature-light opacity-0 group-hover:opacity-20 transition-opacity" />
            </div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter mb-2">
              KLB<span className="text-nature-forest">Connect</span>
            </h1>
            <p className="text-gray-400 font-medium tracking-widest text-[10px] uppercase flex items-center gap-2">
              <TreeDeciduous size={12} className="text-nature-forest" />
              Eco-Security Ecosystem
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium animate-shake">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Administrative Email</label>
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-nature-forest transition-colors" />
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@klbconnect.com"
                  className="w-full h-14 pl-12 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-nature-forest/30 focus:bg-white dark:focus:bg-nature-900/10 rounded-2xl outline-none transition-all font-medium text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Security Credentials</label>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-nature-forest transition-colors" />
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-14 pl-12 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-nature-forest/30 focus:bg-white dark:focus:bg-nature-900/10 rounded-2xl outline-none transition-all font-medium text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full h-16 bg-nature-forest hover:bg-nature-forest-dark text-white rounded-2xl font-bold text-lg shadow-xl shadow-nature-forest/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Authenticate Access
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-gray-400 text-xs font-medium">
              Protected by KLB Bio-Security • 2026 Edition
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
