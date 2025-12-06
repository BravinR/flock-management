'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  LayoutDashboard,
  ClipboardList,
  Syringe,
  ShoppingBag,
  Warehouse,
  DollarSign,
  Wallet,
  BarChart3,
  Settings,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  description?: string;
}

const navigationItems: NavItem[] = [
  {
    name: 'Dashboards',
    href: '/',
    icon: LayoutDashboard,
    description: 'View Summary of Batches'
  },
  {
    name: 'Batch Registration',
    href: '/batch-intake',
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Header with Hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 text-white z-50 flex items-center justify-between px-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <ShoppingBag size={20} />
          </div>
          <div>
            <h1 className="font-bold text-base">Flock Manager</h1>
            <p className="text-xs text-slate-400">Poultry Farm System</p>
          </div>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop (always visible) and Mobile (slide-in) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:flex lg:flex-col`}
      >
        {/* Logo/Header - Desktop only */}
        <div className="hidden lg:flex items-center gap-3 h-16 px-6 border-b border-slate-700">
          <div className="bg-blue-600 p-2 rounded-lg">
            <ShoppingBag size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg">Flock Manager</h1>
            <p className="text-xs text-slate-400">Poultry Farm System</p>
          </div>
        </div>

        {/* Mobile Header inside sidebar */}
        <div className="lg:hidden flex items-center justify-between h-16 px-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <ShoppingBag size={20} />
            </div>
            <div>
              <h1 className="font-bold text-base">Flock Manager</h1>
              <p className="text-xs text-slate-400">Poultry Farm System</p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
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
                  onClick={handleLinkClick}
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
    </>
  );
};

export default Sidebar;
