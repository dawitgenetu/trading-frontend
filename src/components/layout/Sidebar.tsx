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
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-slate-900 dark:bg-dark-sidebar border-r border-slate-200 dark:border-brand-tealBorder text-slate-300 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo / Header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-slate-800/80 dark:border-brand-tealBorder bg-slate-950/40 dark:bg-dark-bg/60">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-teal text-brand-gold border border-brand-gold/40 shadow-lg shadow-brand-gold/15">
              <TrendingUp className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-bold tracking-tight text-white dark:text-brand-goldLight text-base">ELITE TRADE</span>
              <span className="block text-[10px] font-semibold tracking-widest text-brand-gold uppercase">JOURNAL</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 dark:hover:bg-brand-tealHover text-slate-400 hover:text-white lg:hidden"
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
                    ? 'bg-brand-gold text-brand-tealDark font-semibold shadow-md shadow-brand-gold/25'
                    : item.highlight
                    ? 'bg-brand-gold/15 text-brand-gold hover:bg-brand-gold/25 border border-brand-gold/30'
                    : 'text-slate-400 hover:text-brand-goldLight hover:bg-brand-tealHover'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-tealDark stroke-[2.5]' : item.highlight ? 'text-brand-gold' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md ${
                    isActive
                      ? 'bg-brand-tealDark/20 text-brand-tealDark border border-brand-tealDark/30'
                      : 'bg-brand-gold/20 text-brand-gold border border-brand-gold/30'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800/80 dark:border-brand-tealBorder bg-slate-950/20 dark:bg-dark-bg/40">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium text-slate-400">Trading Suite</span>
            <span className="px-2 py-0.5 rounded-full bg-brand-gold/15 text-brand-gold border border-brand-gold/30 font-mono text-[10px] font-semibold">Pro v1.0</span>
          </div>
        </div>
      </aside>
    </>
  );
};
