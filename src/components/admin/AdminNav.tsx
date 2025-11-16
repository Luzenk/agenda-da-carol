"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Calendar, 
  Users, 
  Package, 
  Settings,
  BarChart3
} from 'lucide-react';

export default function AdminNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { href: '/admin', icon: Home, label: 'Dashboard' },
    { href: '/admin/agenda', icon: Calendar, label: 'Agenda' },
    { href: '/admin/clientes', icon: Users, label: 'Clientes' },
    { href: '/admin/servicos', icon: Package, label: 'Serviços' },
    { href: '/admin/relatorios', icon: BarChart3, label: 'Relatórios' },
    { href: '/admin/config', icon: Settings, label: 'Configurações' },
  ];

  const isActive = (href: string) => {
    if (!mounted) return false;
    return pathname === href || (href !== '/admin' && pathname.startsWith(href));
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-purple-900 text-white">
        <div className="p-6 border-b border-purple-800">
          <h1 className="text-2xl font-bold">Agenda da Carol</h1>
          <p className="text-sm text-purple-200">Área Admin</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  active 
                    ? 'bg-purple-800 text-white' 
                    : 'text-purple-100 hover:bg-purple-800/50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
        <div className="flex justify-around items-center h-16">
          {navItems.slice(0, 5).map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  active 
                    ? 'text-purple-600 bg-purple-50' 
                    : 'text-gray-500'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 bg-purple-900 text-white px-4 py-3 z-40">
        <h1 className="font-bold text-lg">Agenda da Carol</h1>
      </header>
    </>
  );
}