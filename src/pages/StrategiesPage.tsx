import React, { useState, useEffect } from 'react';
import {
  Compass,
  Plus,
  Edit2,
  Trash2,
  Award,
  AlertTriangle,
  TrendingUp,
  Target,
  Clock,
  Layers,
} from 'lucide-react';
import { useAccount } from '../context/AccountContext';
import { api } from '../services/api';
import type { Strategy } from '../types';

export const StrategiesPage: React.FC = () => {
  const { formatCurrency } = useAccount();

  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingStrat, setEditingStrat] = useState<Strategy | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [entryRules, setEntryRules] = useState('');
  const [exitRules, setExitRules] = useState('');
  const [confirmationConditions, setConfirmationConditions] = useState('');
  const [preferredTimeframes, setPreferredTimeframes] = useState('M15, H1');
  const [preferredSymbols, setPreferredSymbols] = useState('EURUSD, XAUUSD');
  const [submitting, setSubmitting] = useState(false);

  const fetchStrategies = async () => {
    try {
      setLoading(true);
      const res = await api.getStrategies();
      setStrategies(res.strategies || []);
      setSummary(res.summary);
    } catch (err) {
      console.error('Failed to load strategies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStrategies();
  }, []);

  const openCreateModal = () => {
    setEditingStrat(null);
    setName('');
    setDescription('');
    setEntryRules('');
    setExitRules('');
    setConfirmationConditions('');
    setPreferredTimeframes('M15, H1');
    setPreferredSymbols('EURUSD, XAUUSD');
    setModalOpen(true);
  };

  const openEditModal = (s: Strategy) => {
    setEditingStrat(s);
    setName(s.name);
    setDescription(s.description || '');
    setEntryRules(s.entryRules || '');
    setExitRules(s.exitRules || '');
    setConfirmationConditions(s.confirmationConditions || '');
    setPreferredTimeframes(s.preferredTimeframes?.join(', ') || 'M15, H1');
    setPreferredSymbols(s.preferredSymbols?.join(', ') || 'EURUSD, XAUUSD');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSubmitting(true);
      const tfList = preferredTimeframes.split(',').map((t) => t.trim()).filter(Boolean);
      const symList = preferredSymbols.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean);

      const payload = {
        name,
        description,
        entryRules,
        exitRules,
        confirmationConditions,
        preferredTimeframes: tfList,
        preferredSymbols: symList,
      };

      if (editingStrat) {
        await api.updateStrategy(editingStrat.id, payload);
      } else {
        await api.createStrategy(payload);
      }
      setModalOpen(false);
      await fetchStrategies();
    } catch (err: any) {
      alert(err.message || 'Error saving strategy');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this strategy?')) return;
    try {
      await api.deleteStrategy(id);
      await fetchStrategies();
    } catch (err) {
      alert('Failed to delete strategy');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-brand-goldLight">
            Strategy Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Define edge models, rules of engagement, confirmation conditions, and track strategy statistical performance
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-gold hover:bg-brand-goldLight text-brand-tealDark font-bold text-xs sm:text-sm shadow-md shadow-brand-gold/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Strategy</span>
        </button>
      </div>

      {/* Best & Worst Strategy Banners */}
      {summary && (summary.bestStrategy || summary.worstStrategy) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {summary.bestStrategy && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">
                    Best Performing Strategy
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{summary.bestStrategy.name}</h4>
                  <div className="text-xs text-slate-400">
                    Win Rate: <span className="font-bold text-emerald-400">{summary.bestStrategy.winRate}%</span>
                  </div>
                </div>
              </div>
              <div className="text-right font-mono font-bold text-emerald-400 text-base">
                +{formatCurrency(summary.bestStrategy.netProfit)}
              </div>
            </div>
          )}

          {summary.worstStrategy && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
                    Needs Refinement
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{summary.worstStrategy.name}</h4>
                  <div className="text-xs text-slate-400">
                    Win Rate: <span className="font-bold text-amber-400">{summary.worstStrategy.winRate}%</span>
                  </div>
                </div>
              </div>
              <div className="text-right font-mono font-bold text-amber-400 text-base">
                {formatCurrency(summary.worstStrategy.netProfit)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Strategies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {strategies.map((strat) => (
          <div
            key={strat.id}
            className="p-5 rounded-2xl border border-slate-200 dark:border-brand-tealBorder bg-white dark:bg-brand-tealSurface shadow-md flex flex-col justify-between space-y-4 hover:border-brand-gold/30 transition-all"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{strat.name}</h3>
                  {strat.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                      {strat.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(strat)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(strat.id)}
                    className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-red-500/10"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Statistics Pill Grid */}
              <div className="grid grid-cols-4 gap-2 my-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 font-mono text-center">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Trades</span>
                  <span className="text-sm font-bold text-slate-200">{strat.totalTrades || 0}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Win Rate</span>
                  <span className={`text-sm font-bold ${(strat.winRate || 0) >= 50 ? 'text-emerald-500' : 'text-slate-300'}`}>
                    {strat.winRate || 0}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">PF</span>
                  <span className="text-sm font-bold text-indigo-400">{strat.profitFactor || 0}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Net P/L</span>
                  <span className={`text-sm font-bold ${(strat.netProfit || 0) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {(strat.netProfit || 0) >= 0 ? '+' : ''}{formatCurrency(strat.netProfit || 0)}
                  </span>
                </div>
              </div>

              {/* Rules Preview */}
              <div className="space-y-2 text-xs">
                {strat.entryRules && (
                  <div className="p-2.5 rounded-lg bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Entry Rules:</span>
                    <p className="text-slate-600 dark:text-slate-300 line-clamp-2">{strat.entryRules}</p>
                  </div>
                )}
                {strat.exitRules && (
                  <div className="p-2.5 rounded-lg bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Exit & Invalidation:</span>
                    <p className="text-slate-600 dark:text-slate-300 line-clamp-2">{strat.exitRules}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Badges for Symbols and Timeframes */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-1 overflow-hidden">
                <span className="text-[11px] text-slate-500">TF:</span>
                {(strat.preferredTimeframes || []).map((tf, i) => (
                  <span key={i} className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-300">
                    {tf}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1 overflow-hidden">
                <span className="text-[11px] text-slate-500">Symbols:</span>
                {(strat.preferredSymbols || []).slice(0, 3).map((sym, i) => (
                  <span key={i} className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-[10px] font-mono text-indigo-300">
                    {sym}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Strategy Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {editingStrat ? 'Edit Strategy Model' : 'Define New Strategy'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Strategy Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. ICT Fair Value Gap, Liquidity Sweep"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Overview / Model Concept
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief summary of edge and institutional thesis"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Step-by-Step Entry Rules
                </label>
                <textarea
                  rows={2}
                  value={entryRules}
                  onChange={(e) => setEntryRules(e.target.value)}
                  placeholder="1. Sweep session high. 2. MSS with displacement. 3. Enter on FVG tap."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Exit & Stop Loss Rules
                </label>
                <textarea
                  rows={2}
                  value={exitRules}
                  onChange={(e) => setExitRules(e.target.value)}
                  placeholder="Stop loss placed 2 pips beyond high. TP at opposing swing liquidity or 2.5R."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Preferred Timeframes (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={preferredTimeframes}
                    onChange={(e) => setPreferredTimeframes(e.target.value)}
                    placeholder="M5, M15, H1"
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Preferred Symbols (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={preferredSymbols}
                    onChange={(e) => setPreferredSymbols(e.target.value)}
                    placeholder="EURUSD, XAUUSD, US30"
                    className="w-full px-3 py-2 text-xs font-mono uppercase rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
                >
                  {submitting ? 'Saving...' : editingStrat ? 'Save Changes' : 'Create Strategy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
