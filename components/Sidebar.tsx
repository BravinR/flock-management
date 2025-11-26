'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  ClipboardList,
  Syringe,
  ShoppingBag,
  Warehouse,
  DollarSign,
  Wallet,
  BarChart3,
  Settings,
  ChevronRight
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  description?: string;
}

const navigationItems: NavItem[] = [
  {
    name: 'Batch Registration',
    href: '/',
    icon: Home,
    description: 'Register new flocks'
  },
  {
    name: 'Daily Operations',
    href: '/daily-log',
    icon: ClipboardList,
    description: 'Feed, water & mortality log'
  },
  {
    name: 'Vaccine Tracking',
    href: '/vaccines',
    icon: Syringe,
    description: 'Vaccination schedule & records'
  },
  {
    name: 'Feed Intake',
    href: '/feed-intake',
    icon: Warehouse,
    description: 'Record feed purchases'
  },
  {
    name: 'Expense Logging',
    href: '/expenses',
    icon: DollarSign,
    description: 'Track farm expenses'
  },
  {
    name: 'Wallet & Remittances',
    href: '/wallet',
    icon: Wallet,
    description: 'Send money & view balances'
  }
];

const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-slate-900 text-white">
      {/* Logo/Header */}
      <div className="flex items-center gap-3 h-16 px-6 border-b border-slate-700">
        <div className="bg-blue-600 p-2 rounded-lg">
          <ShoppingBag size={24} />
        </div>
        <div>
          <h1 className="font-bold text-lg">Flock Manager</h1>
          <p className="text-xs text-slate-400">Poultry Farm System</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all group ${
                  active
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon
                  size={20}
                  className={active ? 'text-white' : 'text-slate-400 group-hover:text-white'}
                />
                <div className="flex-1">
                  <p className={`text-sm font-medium ${active ? 'text-white' : ''}`}>
                    {item.name}
                  </p>
                  {item.description && (
                    <p className={`text-xs ${active ? 'text-blue-100' : 'text-slate-500 group-hover:text-slate-400'}`}>
                      {item.description}
                    </p>
                  )}
                </div>
                {active && (
                  <ChevronRight size={16} className="text-white" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-700 p-4">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-sm">
            FM
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Farm Manager</p>
            <p className="text-xs text-slate-400">admin@farm.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
