'use client';
import React from 'react';
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import { usePathname } from "next/navigation";
import { Shield, Building2, User, Globe, Sun, Moon, Laptop } from 'lucide-react';
import { useTheme } from "@/context/ThemeContext";

export default function DashboardWrapper({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const { themeMode, setThemeMode, resolvedTheme } = useTheme();
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoading) return (
    <div className="min-h-screen bg-nature-light flex items-center justify-center font-bold text-nature-forest animate-pulse">
      Initialising Eco-Security...
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[var(--background)] transition-colors duration-300">
      {!isLoginPage && user && <Sidebar />}
      <main className={`flex-1 transition-all duration-300 ${!isLoginPage && user ? 'ml-64 flex flex-col' : ''}`}>
        {!isLoginPage && user && (
          <header className="h-20 bg-[var(--card)] border-b border-[var(--border)] flex items-center justify-between px-8 backdrop-blur-md sticky top-0 z-40 transition-colors duration-300">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 px-3 py-1 bg-nature-light dark:bg-nature-900/30 rounded-full border border-nature-forest/10">
                <Shield size={14} className="text-nature-forest" />
                <span className="text-[10px] font-black text-nature-forest uppercase tracking-wider">{user.role}</span>
              </div>
              
              {user.tenant?.name ? (
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <Building2 size={16} className="text-nature-forest" />
                  <span className="text-sm font-bold tracking-tight">{user.tenant.name}</span>
                  {user.tenant.region?.name && (
                    <>
                      <span className="text-gray-300">/</span>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{user.tenant.region.name}</span>
                    </>
                  )}
                </div>
              ) : user.organization?.name && (
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <Globe size={16} className="text-nature-forest" />
                  <span className="text-sm font-bold tracking-tight">{user.organization.name}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center bg-gray-100 dark:bg-white/5 p-1 rounded-xl border border-gray-200 dark:border-white/10 mr-2">
                <button 
                  onClick={() => setThemeMode('LIGHT')}
                  className={`p-2 rounded-lg transition-all ${themeMode === 'LIGHT' ? 'bg-white text-nature-forest shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Sun size={16} />
                </button>
                <button 
                  onClick={() => setThemeMode('SYSTEM')}
                  className={`p-2 rounded-lg transition-all ${themeMode === 'SYSTEM' ? 'bg-white dark:bg-white/10 text-nature-forest dark:text-nature-400 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Laptop size={16} />
                </button>
                <button 
                  onClick={() => setThemeMode('DARK')}
                  className={`p-2 rounded-lg transition-all ${themeMode === 'DARK' ? 'bg-nature-forest text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Moon size={16} />
                </button>
              </div>

              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-800 dark:text-white leading-none">{user.firstName} {user.lastName}</p>
                <p className="text-[10px] text-gray-400 font-medium mt-1">{user.email}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-nature-forest/10 flex items-center justify-center text-nature-forest border border-nature-forest/20">
                <User size={20} />
              </div>
            </div>
          </header>
        )}
        <div className={!isLoginPage && user ? 'p-8' : ''}>
          {children}
        </div>
      </main>
    </div>
  );
}
