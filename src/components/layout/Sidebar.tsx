import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  Wallet,
  Compass,
  ShieldAlert,
  Calendar,
  BarChart3,
  Target,
  Bot,
  FileSpreadsheet,
  X,
  TrendingUp,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  isOpen,
  onClose,
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'journal', label: 'Trading Journal', icon: BookOpen },
    { id: 'add-trade', label: 'Add Trade', icon: PlusCircle, highlight: true },
    { id: 'accounts', label: 'Accounts', icon: Wallet },
    { id: 'strategies', label: 'Strategies', icon: Compass },
    { id: 'risk', label: 'Risk Center', icon: ShieldAlert },
    { id: 'calendar', label: 'Trading Calendar', icon: Calendar },
    { id: 'analytics', label: 'Advanced Analytics', icon: BarChart3 },
    { id: 'goals', label: 'Goals & Discipline', icon: Target },
    { id: 'coach', label: 'AI Trading Coach', icon: Bot, badge: 'AI' },
    { id: 'reports', label: 'Reports & Exports', icon: FileSpreadsheet },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-[#0B1120] border-r border-slate-700/60 text-slate-300 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo / Header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-slate-800 bg-[#0B1120]/90 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Elite Trade Logo"
              className="w-9 h-9 rounded-xl object-contain shadow-md shadow-brand/20 border border-brand/40 bg-[#0B1120] transition-transform hover:scale-105"
            />
            <div>
              <span className="font-mono font-bold tracking-wide text-brand text-base block">
                ELITE TRADE
              </span>
              <span className="block text-[9px] font-bold tracking-[0.22em] text-[#94A3B8] uppercase">
                TERMINAL
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  onClose();
                }}
                className={`flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand text-[#0B1120] font-bold shadow-md shadow-brand/25'
                    : item.highlight
                    ? 'bg-brand/15 text-brand hover:bg-brand/25 border border-brand/30'
                    : 'text-slate-400 hover:text-[#F8FAFC] hover:bg-[#1E293B]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#0B1120] stroke-[2.5]' : item.highlight ? 'text-brand' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md ${
                    isActive
                      ? 'bg-[#0B1120]/20 text-[#0B1120] border border-[#0B1120]/30'
                      : 'bg-brand/20 text-brand border border-brand/30'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 bg-[#0B1120]/60">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium text-slate-400">Trading Suite</span>
            <span className="px-2 py-0.5 rounded-full bg-brand/15 text-brand border border-brand/30 font-mono text-[10px] font-semibold">Pro v1.0</span>
          </div>
        </div>
      </aside>
    </>
  );
};
