import React, { useState, useEffect } from 'react';
import {
  Menu,
  Sun,
  Moon,
  Plus,
  ShieldAlert,
  ChevronDown,
  User,
  LogOut,
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
  const { user, logout, theme, toggleTheme } = useAuth();
  const { accounts, selectedAccount, selectAccount, formatCurrency } = useAccount();

  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
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
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 lg:px-8 border-b border-slate-700/60 bg-[#0B1120]/90 backdrop-blur-md transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 text-slate-400 rounded-lg lg:hidden hover:bg-[#1E293B]"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Account Selector */}
        <div className="relative">
          <button
            onClick={() => setAccountMenuOpen(!accountMenuOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-xl border border-slate-700/60 bg-[#1E293B]/80 hover:bg-[#1E293B] text-[#F8FAFC] transition-all shadow-sm"
          >
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-brand/15 text-brand border border-brand/25">
              <Wallet className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-semibold text-[#F8FAFC] truncate max-w-[120px] sm:max-w-[180px]">
                {selectedAccount?.name || 'Select Account'}
              </span>
              <span className="text-[11px] text-[#94A3B8] font-mono">
                {selectedAccount ? formatCurrency(selectedAccount.currentBalance) : '$0.00'}
              </span>
            </div>
            {selectedAccount && (
              <span
                className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                  selectedAccount.accountType === 'Live'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                    : 'bg-brand/15 text-brand border border-brand/30'
                }`}
              >
                {selectedAccount.accountType}
              </span>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {accountMenuOpen && (
            <div className="absolute left-0 mt-2 w-64 p-1.5 bg-[#1E293B] rounded-xl shadow-2xl border border-slate-700/80 z-50">
              <div className="px-3 py-2 text-xs font-semibold text-brand uppercase tracking-wider font-mono">
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
                      ? 'bg-brand/15 text-brand font-semibold border border-brand/25'
                      : 'hover:bg-[#25344D] text-slate-300'
                  }`}
                >
                  <div className="flex flex-col text-left">
                    <span className="font-medium text-[#F8FAFC]">{acc.name}</span>
                    <span className="text-[10px] text-[#94A3B8] font-mono">
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

        {/* Live Market Pulse Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-700/60 bg-[#1E293B]/70 text-[11px] font-medium text-slate-300 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[#94A3B8]">Market:</span>
          <span className="text-brand font-semibold font-mono">Active</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Add Trade Button */}
        <button
          onClick={onOpenAddTrade}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand hover:bg-brand-hover text-[#0B1120] font-bold text-xs sm:text-sm shadow-md shadow-brand/25 transition-all active:scale-95"
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
            <div className="absolute right-0 hidden group-hover:block mt-2 w-80 p-3 bg-[#1E293B] rounded-xl shadow-2xl border border-red-500/30 z-50">
              <div className="text-xs font-bold text-red-400 mb-1.5">Advisory Risk Limit Warnings:</div>
              <div className="space-y-1.5 text-xs text-slate-300">
                {riskBreaches.map((b, idx) => (
                  <p key={idx} className="p-1.5 rounded bg-red-950/30 border border-red-900/50">
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
          className="p-2 text-slate-400 hover:text-brand rounded-xl hover:bg-[#1E293B] transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[#1E293B] transition-colors border border-transparent hover:border-slate-700/60"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand/20 text-brand border border-brand/40 font-bold text-xs">
              <User className="w-4 h-4" />
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-[#F8FAFC]">{user?.fullName || 'Trader'}</span>
              <span className="text-[10px] text-[#94A3B8] truncate max-w-[120px] font-mono">{user?.email || 'Active'}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {profileMenuOpen && (
            <div className="absolute right-0 mt-2 w-52 p-1.5 bg-[#1E293B] rounded-xl shadow-2xl border border-slate-700/80 z-50">
              <div className="px-3 py-2 border-b border-slate-700/60">
                <div className="text-xs font-semibold text-brand truncate font-mono">{user?.fullName || 'Elite Trader'}</div>
                <div className="text-[11px] text-[#94A3B8] truncate font-mono">{user?.email}</div>
              </div>
              <button
                onClick={() => {
                  logout();
                  setProfileMenuOpen(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 mt-1 text-xs text-red-400 hover:bg-red-950/30 rounded-lg transition-colors font-medium"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
