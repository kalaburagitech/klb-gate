'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  ClipboardList, 
  ShieldAlert, 
  MapPin,
  Settings,
  LogOut,
  Menu
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const NAV_ITEMS = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', roles: ['SUPER_ADMIN', 'ORG_ADMIN', 'TENANT_ADMIN', 'OFFICER'] },
  { name: 'Organizations', icon: Building2, href: '/organizations', roles: ['SUPER_ADMIN'] },
  { name: 'Service Regions', icon: MapPin, href: '/regions', roles: ['SUPER_ADMIN', 'ORG_ADMIN', 'TENANT_ADMIN'] },
  { name: 'Managed Societies', icon: Building2, href: '/tenants', roles: ['SUPER_ADMIN', 'ORG_ADMIN', 'TENANT_ADMIN'] },
  { name: 'Users', icon: Users, href: '/users', roles: ['SUPER_ADMIN', 'ORG_ADMIN', 'TENANT_ADMIN'] },
  { name: 'Entry Logs', icon: ClipboardList, href: '/entries', roles: ['TENANT_ADMIN', 'OFFICER', 'GUARD'] },
  { name: 'Security', icon: ShieldAlert, href: '/security', roles: ['SUPER_ADMIN', 'ORG_ADMIN', 'TENANT_ADMIN'] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout, isLoading } = useAuth();

  if (isLoading) return <div className="w-64 bg-white border-r h-screen" />;

  const filteredNav = NAV_ITEMS.filter(item => 
    !item.roles || (user ? item.roles.includes(user.role) : true) // Allow viewing all in Dev/Guest mode
  );

  return (
    <aside className="w-64 bg-white dark:bg-dark-bg border-r border-nature-forest/10 dark:border-white/5 h-screen flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-nature-forest rounded-xl flex items-center justify-center shadow-lg shadow-nature-forest/20">
          <span className="text-white font-bold text-xl">K</span>
        </div>
        <span className="font-bold text-xl text-nature-forest tracking-tight">KLB Connect</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {filteredNav.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-nature-forest text-white shadow-md shadow-nature-forest/20' 
                  : 'text-gray-500 dark:text-gray-400 hover:bg-nature-light dark:hover:bg-nature-900/30 hover:text-nature-forest'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-nature-light dark:border-white/5">
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
