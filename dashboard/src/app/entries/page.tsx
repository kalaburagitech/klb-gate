'use client';
import React, { useState, useEffect } from 'react';
import { Search, ClipboardList, Filter, Download, Clock, User, Home, ArrowRight, ShieldCheck, ShieldAlert } from 'lucide-react';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';

export default function EntryLogsPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchEntries = async () => {
    try {
      const res = await api.get('/entries/all', {
        headers: { 
          'x-tenant-id': user?.tenantId
        }
      });
      setEntries(res.data.data);
    } catch (error) {
      console.error('Failed to fetch entries', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const getStatusBadge = (status: string) => {
    const styles: any = {
      APPROVED: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800',
      PENDING_APPROVAL: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800',
      REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800',
      CHECKED_IN: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      CHECKED_OUT: 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-800',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[status] || styles.PENDING_APPROVAL}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const filtered = entries.filter(e => 
    e.visitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.purpose.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-nature-forest neon-text">Site Activity Logs</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Audit trail of all entries, approvals, and exits.</p>
        </div>
        <div className="flex gap-3">
          <button className="h-12 px-6 bg-[var(--card)] border border-[var(--border)] rounded-2xl text-gray-600 dark:text-gray-300 font-bold text-sm flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
            <Download size={18} />
            Export Audit
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-[var(--card)] p-4 rounded-3xl shadow-soft border border-[var(--border)]">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by visitor name, unit, or purpose..."
            className="w-full pl-12 pr-4 py-3 bg-[var(--background)] dark:bg-white/5 rounded-2xl focus:outline-none transition-all text-gray-800 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="p-3 bg-[var(--background)] dark:bg-white/5 rounded-2xl text-nature-forest">
          <Filter size={20} />
        </button>
      </div>

      <div className="card-base overflow-hidden neon-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-nature-light/30 dark:bg-white/5 border-b border-nature-forest/10 dark:border-white/5">
                <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Time & Date</th>
                <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Visitor Info</th>
                <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Destination</th>
                <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Security Node</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nature-light dark:divide-white/5">
              {loading ? (
                [1, 2, 3, 4].map(i => <tr key={i} className="animate-pulse"><td colSpan={5} className="h-20 bg-gray-50/50 dark:bg-white/5" /></tr>)
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-gray-400 font-medium italic">No activity logs found for this period.</td>
                </tr>
              ) : filtered.map((entry) => (
                <tr key={entry.id} className="hover:bg-nature-light/20 dark:hover:bg-nature-900/5 transition-all group">
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-50 dark:bg-white/5 rounded-lg text-gray-400">
                        <Clock size={16} />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-gray-800 dark:text-white block">
                          {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-nature-forest/10 flex items-center justify-center text-nature-forest font-bold text-xs">
                        {entry.visitor.name.split(' ').map((n: any) => n[0]).join('')}
                      </div>
                      <div>
                        <span className="text-sm font-bold text-gray-800 dark:text-white block">{entry.visitor.name}</span>
                        <span className="text-[10px] text-gray-500 font-medium flex items-center gap-1">
                          <ShieldCheck size={10} className="text-green-500" />
                          {entry.purpose}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Home size={14} className="text-nature-forest" />
                      <span className="text-sm font-bold">UNIT {entry.unitNumber}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    {getStatusBadge(entry.status)}
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">
                        <User size={12} className="text-gray-400" />
                      </div>
                      <span className="text-xs font-medium text-gray-500">
                        {entry.handledBy?.firstName} {entry.handledBy?.lastName || 'GATE 01'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
