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
  UserCheck
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
  <div className="card-base p-6 group hover:scale-[1.02] transition-all">
    <div className="flex items-start justify-between">
      <div className={`p-3 rounded-2xl ${color} bg-opacity-10 text-opacity-90`}>
        <Icon size={24} />
      </div>
      <div className="flex items-center gap-1 text-green-500 font-bold text-sm">
        <TrendingUp size={14} />
        <span>{trend}</span>
      </div>
    </div>
    <div className="mt-4">
      <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-widest">{title}</h3>
      <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{value || 0}</p>
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
        const token = localStorage.getItem('klb_token');
        const res = await axios.get('http://127.0.0.1:5001/api/admin/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setStats(res.data.data);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nature-forest" />
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-nature-forest neon-text">System Intelligence</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Real-time oversight of organizations and security nodes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {user?.role === 'SUPER_ADMIN' ? (
          <>
            <StatCard title="Organizations" value={stats?.totalOrganizations} icon={Building2} trend="+2%" color="bg-nature-forest text-nature-forest" />
            <StatCard title="Regions" value={stats?.totalRegions} icon={MapPin} trend="+5%" color="bg-blue-500 text-blue-500" />
            <StatCard title="Total Societies" value={stats?.totalSocieties} icon={ShieldCheck} trend="+8%" color="bg-purple-500 text-purple-500" />
            <StatCard title="System Entries" value={stats?.totalVisitorEntries} icon={Activity} trend="+15%" color="bg-amber-500 text-amber-500" />
          </>
        ) : user?.role === 'ORG_ADMIN' ? (
          <>
            <StatCard title="Regional Zones" value={stats?.totalRegions} icon={MapPin} trend="+4%" color="bg-nature-forest text-nature-forest" />
            <StatCard title="Assigned Societies" value={stats?.totalSocieties} icon={Building2} trend="+10%" color="bg-blue-500 text-blue-500" />
            <StatCard title="Verified Residents" value={stats?.totalResidents} icon={UserCheck} trend="+12%" color="bg-purple-500 text-purple-500" />
            <StatCard title="Security Pulse" value="Live" icon={Zap} trend="Active" color="bg-amber-500 text-amber-500" />
          </>
        ) : (
          <>
            <StatCard title="Total Users" value={stats?.totalUsers} icon={Users} trend="+3%" color="bg-nature-forest text-nature-forest" />
            <StatCard title="Total Units" value={stats?.totalUnits} icon={ShieldCheck} trend="Fixed" color="bg-blue-500 text-blue-500" />
            <StatCard title="Daily Entries" value={stats?.totalVisitorEntries} icon={Activity} trend="+25%" color="bg-purple-500 text-purple-500" />
            <StatCard title="Gate Status" value="Secure" icon={Zap} trend="Online" color="bg-amber-500 text-amber-500" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card-base p-8 neon-border">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Active Management</h2>
            <p className="text-xs text-nature-forest font-bold bg-nature-light px-3 py-1 rounded-full uppercase tracking-widest">Live Updates Enabled</p>
          </div>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-nature-light dark:bg-nature-900/10 rounded-2xl border border-transparent hover:border-nature-forest/20 transition-all cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-dark-card flex items-center justify-center font-bold text-nature-forest shadow-sm">
                  0{i}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 dark:text-white">System Synchronisation Activity</h4>
                  <p className="text-sm text-gray-500">Security node {i} successfully verified and linked to infrastructure.</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-nature-forest shadow-[0_0_8px_rgba(46,125,50,1)] animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        <div className="card-base p-8 neon-border flex flex-col justify-center items-center text-center">
          <div className="w-40 h-40 rounded-full border-8 border-nature-light dark:border-nature-900/20 border-t-nature-forest flex items-center justify-center mb-8 relative">
            <Zap size={60} className="text-nature-forest animate-bounce" />
            <div className="absolute inset-0 rounded-full border-4 border-white dark:border-nature-950 scale-105" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Ecological Power</h2>
          <p className="text-gray-500 text-sm max-w-[200px]">System running on sustainable distributed security architecture.</p>
        </div>
      </div>
    </div>
  );
}
