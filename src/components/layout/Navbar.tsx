import React, { useState, useEffect } from 'react';
import {
  Menu,
  Sun,
  Moon,
  Plus,
  ShieldAlert,
  ChevronDown,
  User,
  Wallet,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAccount } from '../../context/AccountContext';
import { api } from '../../services/api';

interface NavbarProps {
  onToggleSidebar: () => void;
  onOpenAddTrade: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, onOpenAddTrade }) => {
  const { user, theme, toggleTheme } = useAuth();
  const { accounts, selectedAccount, selectAccount, formatCurrency } = useAccount();

  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [riskBreaches, setRiskBreaches] = useState<any[]>([]);

  // Fetch risk alert status
  useEffect(() => {
    let mounted = true;
    const checkRisk = async () => {
      try {
        const res = await api.getRiskStatus(selectedAccount?.id);
        if (mounted && res.status?.warnings) {
          setRiskBreaches(res.status.warnings);
        }
      } catch {
        // silent
      }
    };
    checkRisk();
    const interval = setInterval(checkRisk, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [selectedAccount?.id]);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 lg:px-8 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-dark-card/90 backdrop-blur-md transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 text-slate-500 rounded-lg lg:hidden hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Account Selector */}
        <div className="relative">
          <button
            onClick={() => setAccountMenuOpen(!accountMenuOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
          >
            <Wallet className="w-4 h-4 text-indigo-500" />
            <div className="flex flex-col text-left">
              <span className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[120px] sm:max-w-[180px]">
                {selectedAccount?.name || 'Select Account'}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                {selectedAccount ? formatCurrency(selectedAccount.currentBalance) : '$0.00'}
              </span>
            </div>
            {selectedAccount && (
              <span
                className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                  selectedAccount.accountType === 'Live'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                }`}
              >
                {selectedAccount.accountType}
              </span>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {accountMenuOpen && (
            <div className="absolute left-0 mt-2 w-64 p-1.5 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 z-50">
              <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Trading Accounts
              </div>
              {accounts.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => {
                    selectAccount(acc);
                    setAccountMenuOpen(false);
                  }}
                  className={`flex items-center justify-between w-full px-3 py-2 text-xs rounded-lg transition-colors ${
                    selectedAccount?.id === acc.id
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex flex-col text-left">
                    <span>{acc.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {formatCurrency(acc.currentBalance, acc.currency)} ({acc.accountType})
                    </span>
                  </div>
                  {acc.brokerName && (
                    <span className="text-[10px] text-slate-400 truncate max-w-[70px]">{acc.brokerName}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Add Trade Button */}
        <button
          onClick={onOpenAddTrade}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs sm:text-sm shadow-md shadow-indigo-600/25 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden sm:inline">Add Trade</span>
        </button>

        {/* Risk Alerts Indicator */}
        {riskBreaches.length > 0 && (
          <div className="relative group">
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-semibold cursor-pointer">
              <ShieldAlert className="w-4 h-4" />
              <span>{riskBreaches.length} Alert{riskBreaches.length > 1 ? 's' : ''}</span>
            </div>
            <div className="absolute right-0 hidden group-hover:block mt-2 w-80 p-3 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-red-500/30 z-50">
              <div className="text-xs font-bold text-red-500 mb-1.5">Advisory Risk Limit Warnings:</div>
              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                {riskBreaches.map((b, idx) => (
                  <p key={idx} className="p-1.5 rounded bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50">
                    {b.message}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Single-User Profile Badge */}
        <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-500 font-bold text-xs border border-indigo-500/30">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-200 leading-tight">
              {user?.fullName || 'Master Trader'}
            </span>
            <span className="text-[10px] text-emerald-500 font-mono font-medium leading-tight">
              Personal Journal
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
