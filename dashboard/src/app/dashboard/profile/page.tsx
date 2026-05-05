'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { 
  User, 
  Mail, 
  Shield, 
  Building2, 
  MapPin, 
  Sun, 
  Moon, 
  Laptop,
  CheckCircle2,
  Settings,
  Bell,
  Lock,
  LogOut
} from 'lucide-react';
import { Card } from '@/components/Card';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { themeMode, setThemeMode, resolvedTheme } = useTheme();

  if (!user) return null;

  const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'ORG_ADMIN' || user.role === 'TENANT_ADMIN';

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Column: User Card */}
        <div className="w-full md:w-1/3 space-y-6">
          <Card className="p-8 text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-nature-forest" />
            <div className="relative z-10">
              <div className="w-24 h-24 rounded-3xl bg-nature-forest/10 flex items-center justify-center text-nature-forest text-4xl font-black mx-auto mb-6 border border-nature-forest/20 shadow-xl shadow-nature-forest/5 group-hover:scale-105 transition-transform duration-500">
                {user.firstName[0]}{user.lastName[0]}
              </div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                {user.firstName} {user.lastName}
              </h1>
              <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 bg-nature-light dark:bg-nature-900/30 rounded-full border border-nature-forest/10">
                <Shield size={14} className="text-nature-forest" />
                <span className="text-[10px] font-black text-nature-forest uppercase tracking-widest">
                  {user.role.replace('_', ' ')} ACCESS
                </span>
              </div>
              
              <div className="mt-8 space-y-4 text-left border-t border-gray-100 dark:border-white/5 pt-8">
                <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                  <div className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center">
                    <Mail size={16} />
                  </div>
                  <span className="text-sm font-bold truncate">{user.email}</span>
                </div>
                {user.tenant?.name && (
                  <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                    <div className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center">
                      <Building2 size={16} />
                    </div>
                    <span className="text-sm font-bold">{user.tenant.name}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Security Compliance</h3>
            <div className="space-y-4">
              {[
                { label: 'Two-Factor Authentication', status: 'Active', color: 'text-nature-forest' },
                { label: 'Session Encryption', status: 'Verified', color: 'text-nature-forest' },
                { label: 'System Clearance', status: 'Level 1', color: 'text-nature-forest' }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-600 dark:text-gray-400">{item.label}</span>
                  <span className={`text-[10px] font-black uppercase ${item.color}`}>{item.status}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Settings */}
        <div className="flex-1 space-y-8">
          {/* Appearance Section */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Sun size={20} className="text-nature-forest" />
              <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">System Appearance</h2>
            </div>
            <Card className="p-8">
              <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">
                Customize your visual interface experience. The system will adapt instantly without requiring a refresh.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: 'LIGHT', icon: Sun, label: 'Standard Light', desc: 'High visibility mode' },
                  { id: 'SYSTEM', icon: Laptop, label: 'OS Adaptive', desc: 'Follows device state' },
                  { id: 'DARK', icon: Moon, label: 'Cinematic Dark', desc: 'Low light optimization' }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setThemeMode(mode.id as any)}
                    className={`flex flex-col items-center gap-4 p-6 rounded-3xl border-2 transition-all duration-300 group ${
                      themeMode === mode.id 
                        ? 'border-nature-forest bg-nature-forest/5 shadow-lg shadow-nature-forest/10' 
                        : 'border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 hover:border-nature-forest/30'
                    }`}
                  >
                    <div className={`p-3 rounded-2xl transition-all duration-300 ${
                      themeMode === mode.id ? 'bg-nature-forest text-white' : 'bg-white dark:bg-white/10 text-gray-400 group-hover:text-nature-forest'
                    }`}>
                      <mode.icon size={24} />
                    </div>
                    <div className="text-center">
                      <span className={`block font-black text-sm uppercase tracking-wider ${
                        themeMode === mode.id ? 'text-nature-forest' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {mode.label}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 mt-1 block">{mode.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </section>

          {/* Infrastructure Section */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Settings size={20} className="text-nature-forest" />
              <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Infrastructure Details</h2>
            </div>
            <Card className="p-1">
              <div className="grid grid-cols-1 md:grid-cols-2">
                {[
                  { icon: Mail, label: 'Primary Endpoint', value: user.email },
                  { icon: Shield, label: 'Access Protocol', value: user.role.replace('_', ' ') },
                  { icon: Building2, label: 'Assigned Estate', value: user.tenant?.name || 'Central Command' },
                  { icon: MapPin, label: 'Operational Region', value: user.tenant?.region?.name || 'Global' }
                ].map((item, i) => (
                  <div key={i} className={`p-8 flex items-center gap-6 ${i < 2 ? 'border-b' : ''} ${i % 2 === 0 ? 'border-r' : ''} border-gray-100 dark:border-white/5`}>
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-nature-forest">
                      <item.icon size={24} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">{item.label}</span>
                      <span className="text-base font-bold text-gray-900 dark:text-white">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </section>

          {/* Danger Zone */}
          <Card className="p-6 bg-red-50/50 dark:bg-red-500/5 border-red-100 dark:border-red-500/10 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-red-600 uppercase tracking-widest">Terminate Session</h3>
              <p className="text-xs font-bold text-red-400 mt-1">Exit the secure infrastructure and clear local cache.</p>
            </div>
            <button 
              onClick={logout}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-600/20 transition-all active:scale-95"
            >
              <LogOut size={16} />
              Exit System
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
}
