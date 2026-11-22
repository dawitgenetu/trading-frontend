import React, { useState } from 'react';
import {
  Wallet,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Building,
  DollarSign,
  ArrowRight,
  TrendingUp,
  Link2,
  RefreshCw,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import { useAccount } from '../context/AccountContext';
import { api } from '../services/api';
import type { TradingAccount, AccountType } from '../types';
import { ExnessConnectionModal } from '../components/exness/ExnessConnectionModal';

export const AccountsPage: React.FC = () => {
  const { accounts, selectedAccount, selectAccount, refreshAccounts, formatCurrency } = useAccount();

  const [modalOpen, setModalOpen] = useState(false);
  const [exnessModalOpen, setExnessModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<TradingAccount | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [brokerName, setBrokerName] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('Live');
  const [initialBalance, setInitialBalance] = useState('10000');
  const [currency, setCurrency] = useState('USD');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const openCreateModal = () => {
    setEditingAccount(null);
    setName('');
    setBrokerName('');
    setAccountType('Live');
    setInitialBalance('10000');
    setCurrency('USD');
    setDescription('');
    setModalOpen(true);
  };

  const openEditModal = (acc: TradingAccount) => {
    setEditingAccount(acc);
    setName(acc.name);
    setBrokerName(acc.brokerName || '');
    setAccountType(acc.accountType);
    setInitialBalance(String(acc.initialBalance));
    setCurrency(acc.currency);
    setDescription(acc.description || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setLoading(true);
      if (editingAccount) {
        await api.updateAccount(editingAccount.id, {
          name,
          brokerName,
          accountType,
          initialBalance: parseFloat(initialBalance) || 10000,
          currency,
          description,
        });
      } else {
        await api.createAccount({
          name,
          brokerName,
          accountType,
          initialBalance: parseFloat(initialBalance) || 10000,
          currency,
          description,
        });
      }
      setModalOpen(false);
      await refreshAccounts();
    } catch (err: any) {
      alert(err.message || 'Error saving account');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this trading account and all its associated trades?')) return;
    try {
      await api.deleteAccount(id);
      await refreshAccounts();
    } catch (err: any) {
      alert('Failed to delete account');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-slate-900 dark:text-brand-goldLight">
            Trading Accounts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Manage multiple demo and live accounts with isolated trade histories and performance statistics
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setExnessModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-gold to-amber-500 hover:from-brand-goldLight hover:to-amber-400 text-brand-tealDark font-bold text-xs sm:text-sm shadow-md shadow-brand-gold/25 transition-all"
          >
            <Link2 className="w-4 h-4 stroke-[2.5]" />
            <span>Connect Exness API</span>
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-brand-tealBorder bg-brand-tealSurface hover:bg-brand-tealHover text-slate-200 font-bold text-xs sm:text-sm transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Manual Account</span>
          </button>
        </div>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {accounts.map((acc) => {
          const isSelected = selectedAccount?.id === acc.id;
          const netPnl = (acc.currentBalance || acc.initialBalance) - acc.initialBalance;

          return (
            <div
              key={acc.id}
              className={`p-5 rounded-2xl border transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'border-brand-gold/60 bg-white dark:bg-brand-tealSurface shadow-lg shadow-brand-gold/10 ring-1 ring-brand-gold/30'
                  : 'border-slate-200 dark:border-brand-tealBorder bg-white dark:bg-brand-tealSurface shadow-sm hover:border-brand-gold/30'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${acc.accountType === 'Live'
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        }`}
                    >
                      {acc.accountType}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                      {acc.currency}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(acc)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                      title="Edit Account"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {accounts.length > 1 && (
                      <button
                        onClick={() => handleDelete(acc.id)}
                        className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-red-500/10"
                        title="Delete Account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                  {acc.name}
                </h3>
                {acc.brokerName && (
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Building className="w-3 h-3 text-slate-400" />
                    <span>{acc.brokerName}</span>
                  </p>
                )}

                {/* Exness Live Metrics vs Manual Balances */}
                {acc.isExnessConnected ? (
                  <div className="my-4 p-3.5 rounded-xl bg-dark-bg/80 border border-brand-gold/30 font-mono space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] pb-2 border-b border-brand-tealBorder">
                      <span className="text-brand-gold font-bold flex items-center gap-1">
                        <Link2 className="w-3.5 h-3.5" /> Exness Live API
                      </span>
                      <span className="text-slate-400">
                        Lev: <b className="text-white">1:{acc.leverage || 500}</b>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Balance</span>
                        <span className="text-sm font-bold text-white">
                          {formatCurrency(acc.currentBalance, acc.currency)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Live Equity</span>
                        <span className="text-sm font-bold text-emerald-400">
                          {formatCurrency(acc.equity ?? acc.currentBalance, acc.currency)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Free Margin</span>
                        <span className="text-xs font-semibold text-slate-300">
                          {formatCurrency(acc.freeMargin ?? acc.currentBalance, acc.currency)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Used Margin</span>
                        <span className="text-xs font-semibold text-slate-300">
                          {formatCurrency(acc.usedMargin ?? 0, acc.currency)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-brand-tealBorder/60 text-slate-400">
                      <span>Margin Level: <b className="text-brand-gold">{(acc.marginLevel || 100).toFixed(1)}%</b></span>
                      <span>Currency: <b className="text-white">{acc.currency || 'USD'}</b></span>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 my-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 font-mono">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Current Balance</span>
                      <span className="text-base font-bold text-slate-900 dark:text-white">
                        {formatCurrency(acc.currentBalance, acc.currency)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Initial Capital</span>
                      <span className="text-base font-bold text-slate-400">
                        {formatCurrency(acc.initialBalance, acc.currency)}
                      </span>
                    </div>
                  </div>
                )}

                {acc.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                    {acc.description}
                  </p>
                )}
              </div>

              {/* Set Active Button */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                {isSelected ? (
                  <div className="flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold text-indigo-500">
                    <CheckCircle className="w-4 h-4" />
                    <span>Active Account</span>
                  </div>
                ) : (
                  <button
                    onClick={() => selectAccount(acc)}
                    className="w-full py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Switch to this Account
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {editingAccount ? 'Edit Trading Account' : 'Create Trading Account'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Account Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. IC Markets Live Scalping"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Broker Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={brokerName}
                    onChange={(e) => setBrokerName(e.target.value)}
                    placeholder="e.g. Exness, FTMO, IC Markets"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Account Type *
                  </label>
                  <select
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value as AccountType)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white"
                  >
                    <option value="Live">Live Account</option>
                    <option value="Demo">Demo Account</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Initial Balance *
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={initialBalance}
                    onChange={(e) => setInitialBalance(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Currency *
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white font-mono"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="ETB">ETB (Br)</option>
                    <option value="CAD">CAD ($)</option>
                    <option value="AUD">AUD ($)</option>
                    <option value="JPY">JPY (¥)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Description / Strategy Focus
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Notes on account rules, max risk, etc."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-brand-tealBorder text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-brand-tealHover"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-brand-gold hover:bg-brand-goldLight text-brand-tealDark text-xs font-bold shadow-md shadow-brand-gold/25"
                >
                  {loading ? 'Saving...' : editingAccount ? 'Save Changes' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Exness Connection Modal */}
      <ExnessConnectionModal
        isOpen={exnessModalOpen}
        onClose={() => setExnessModalOpen(false)}
        onSuccess={() => refreshAccounts()}
      />
    </div>
  );
};
