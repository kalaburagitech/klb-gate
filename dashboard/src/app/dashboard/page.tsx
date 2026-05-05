'use client';
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Zap, 
  TrendingUp, 
  Building2,
  MapPin,
  Activity,
  UserCheck,
  ChevronRight
} from 'lucide-react';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';

const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
  <div className="card-base p-6 group hover:translate-y-[-4px] transition-all duration-300">
    <div className="flex items-start justify-between">
      <div className={`p-4 rounded-2xl ${color} bg-opacity-15 shadow-sm`}>
        <Icon size={24} />
      </div>
      <div className="flex items-center gap-1 text-nature-forest font-black text-xs bg-nature-50 dark:bg-nature-900/20 px-2 py-1 rounded-lg">
        <TrendingUp size={12} />
        <span>{trend}</span>
      </div>
    </div>
    <div className="mt-6">
      <h3 className="text-muted text-[10px] font-black uppercase tracking-[2px]">{title}</h3>
      <p className="text-3xl font-black text-foreground mt-2">{value || 0}</p>
    </div>
  </div>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        setStats(res.data.data);
      } catch (error: any) {
        console.error('Failed to fetch stats', error);
        if (error.response?.status === 401) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-nature-100 border-t-nature-forest" />
        <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-nature-forest animate-pulse" size={24} />
      </div>
      <p className="text-nature-forest font-bold animate-pulse">Syncing Environment...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tight">System <span className="text-nature-forest">Intelligence</span></h1>
          <p className="text-muted mt-2 font-medium">Real-time oversight of your security ecosystem.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {user?.role === 'SUPER_ADMIN' ? (
          <>
            <StatCard title="Organizations" value={stats?.totalOrganizations} icon={Building2} trend="+2%" color="text-nature-forest bg-nature-forest" />
            <StatCard title="Regions" value={stats?.totalRegions} icon={MapPin} trend="+5%" color="text-blue-500 bg-blue-500" />
            <StatCard title="Total Societies" value={stats?.totalSocieties} icon={ShieldCheck} trend="+8%" color="text-emerald-500 bg-emerald-500" />
            <StatCard title="System Entries" value={stats?.totalVisitorEntries} icon={Activity} trend="+15%" color="text-amber-500 bg-amber-500" />
          </>
        ) : user?.role === 'ORG_ADMIN' ? (
          <>
            <StatCard title="Regional Zones" value={stats?.totalRegions} icon={MapPin} trend="+4%" color="text-nature-forest bg-nature-forest" />
            <StatCard title="Assigned Societies" value={stats?.totalSocieties} icon={Building2} trend="+10%" color="text-blue-500 bg-blue-500" />
            <StatCard title="Verified Residents" value={stats?.totalResidents} icon={UserCheck} trend="+12%" color="text-emerald-500 bg-emerald-500" />
            <StatCard title="Security Pulse" value="Live" icon={Zap} trend="Active" color="text-amber-500 bg-amber-500" />
          </>
        ) : (
          <>
            <StatCard title="Total Users" value={stats?.totalUsers} icon={Users} trend="+3%" color="text-nature-forest bg-nature-forest" />
            <StatCard title="Total Units" value={stats?.totalUnits} icon={ShieldCheck} trend="Fixed" color="text-blue-500 bg-blue-500" />
            <StatCard title="Daily Entries" value={stats?.totalVisitorEntries} icon={Activity} trend="+25%" color="text-emerald-500 bg-emerald-500" />
            <StatCard title="Gate Status" value="Secure" icon={Zap} trend="Online" color="text-amber-500 bg-amber-500" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card-base p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-nature-forest opacity-[0.03] rounded-full -mr-32 -mt-32" />
          <div className="flex items-center justify-between mb-8 relative z-10">
            <h2 className="text-2xl font-black text-foreground">Infrastructure Nodes</h2>
            <div className="flex items-center gap-2 text-[10px] text-nature-forest font-black bg-nature-50 dark:bg-nature-900/30 px-4 py-2 rounded-full uppercase tracking-widest border border-nature-forest/10">
              <div className="w-2 h-2 rounded-full bg-nature-forest animate-ping" />
              Live Sync Active
            </div>
          </div>
          <div className="space-y-4 relative z-10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-5 p-5 bg-background dark:bg-white/5 rounded-3xl border border-transparent hover:border-nature-forest/20 hover:shadow-xl hover:shadow-nature-forest/5 transition-all cursor-pointer group">
                <div className="w-14 h-14 rounded-2xl bg-card dark:bg-white/10 flex items-center justify-center font-black text-nature-forest shadow-sm group-hover:bg-nature-forest group-hover:text-white transition-all duration-500">
                  {i}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-foreground text-lg">Node Verification Success</h4>
                  <p className="text-sm text-muted">Infrastructure point {i} successfully linked to nature-grid.</p>
                </div>
                <ChevronRight size={20} className="text-muted group-hover:text-nature-forest transition-colors" />
              </div>
            ))}
          </div>
        </div>

        <div className="card-base p-8 flex flex-col justify-center items-center text-center bg-nature-forest dark:bg-nature-900 shadow-xl shadow-nature-forest/10 border-none">
          <div className="w-48 h-48 rounded-full border-8 border-white/10 border-t-white flex items-center justify-center mb-8 relative">
            <Zap size={70} className="text-white animate-pulse" />
            <div className="absolute inset-0 rounded-full border-2 border-white/5 scale-110" />
          </div>
          <h2 className="text-2xl font-black text-white mb-3">Eco-Security</h2>
          <p className="text-white/60 text-sm max-w-[220px] font-medium leading-relaxed">System running on 100% sustainable digital architecture.</p>
          <button className="mt-8 bg-white text-nature-forest font-black px-8 py-4 rounded-2xl hover:scale-105 transition-transform">
            Optimise Node
          </button>
        </div>
      </div>
    </div>
  );
}

