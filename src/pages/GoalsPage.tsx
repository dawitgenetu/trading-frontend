import React, { useState, useEffect } from 'react';
import {
  Target,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  ShieldCheck,
  Trash2,
  Edit2,
} from 'lucide-react';
import { useAccount } from '../context/AccountContext';
import { api } from '../services/api';
import type { TradingGoal, GoalPeriod, GoalTargetType } from '../types';

export const GoalsPage: React.FC = () => {
  const { selectedAccount, formatCurrency } = useAccount();

  const [goals, setGoals] = useState<TradingGoal[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<TradingGoal | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [period, setPeriod] = useState<GoalPeriod>('MONTHLY');
  const [targetType, setTargetType] = useState<GoalTargetType>('PROFIT_AMOUNT');
  const [targetValue, setTargetValue] = useState('1000');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await api.getGoals(selectedAccount?.id);
      setGoals(res.goals || []);
    } catch (err) {
      console.error('Failed to load goals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [selectedAccount?.id]);

  const openCreateModal = () => {
    setEditingGoal(null);
    setTitle('');
    setPeriod('MONTHLY');
    setTargetType('PROFIT_AMOUNT');
    setTargetValue('1000');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
    setNotes('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetValue) return;

    try {
      setSubmitting(true);
      const payload = {
        title,
        period,
        targetType,
        targetValue: parseFloat(targetValue) || 1000,
        startDate,
        endDate,
        notes,
        accountId: selectedAccount?.id || null,
      };

      if (editingGoal) {
        await api.updateGoal(editingGoal.id, payload);
      } else {
        await api.createGoal(payload);
      }
      setModalOpen(false);
      await fetchGoals();
    } catch (err) {
      alert('Failed to save goal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this goal?')) return;
    try {
      await api.deleteGoal(id);
      await fetchGoals();
    } catch (err) {
      alert('Failed to delete goal');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Goals & Discipline Targets
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Set structured performance targets, trade limits, and process-discipline milestones
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Target</span>
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {goals.map((goal) => {
          const progress = goal.progressPercentage || 0;
          const isDone = goal.isAchieved || progress >= 100;

          return (
            <div
              key={goal.id}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-card shadow-sm flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">
                    {goal.period}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="p-1 text-slate-400 hover:text-red-400 rounded-lg hover:bg-red-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white">{goal.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Target: {goal.targetType === 'PROFIT_AMOUNT' ? formatCurrency(goal.targetValue) : `${goal.targetValue}${goal.targetType.includes('RATE') ? '%' : ''}`}
                </p>

                {/* Progress Bar */}
                <div className="my-4 space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400 font-sans">Current Progress:</span>
                    <span className="font-bold text-slate-200">
                      {goal.targetType === 'PROFIT_AMOUNT' ? formatCurrency(goal.currentValue) : goal.currentValue} ({progress}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isDone ? 'bg-emerald-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                    />
                  </div>
                </div>

                {goal.notes && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                    "{goal.notes}"
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Ends: {goal.endDate}</span>
                <span className={`font-sans font-bold ${isDone ? 'text-emerald-400' : 'text-indigo-400'}`}>
                  {isDone ? '✓ Achieved' : 'In Progress'}
                </span>
              </div>
            </div>
          );
        })}

        {goals.length === 0 && !loading && (
          <div className="col-span-full py-12 text-center text-slate-500 rounded-2xl border border-dashed border-slate-700 p-8">
            <Target className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold">No targets active</p>
            <p className="text-xs text-slate-500 mt-1">Set daily or monthly discipline targets to stay accountable.</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create Trading Target</h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Goal Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Monthly Profit Target or Max 4 Trades/Day"
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Period</label>
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value as GoalPeriod)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white"
                  >
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="YEARLY">Yearly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Target Type</label>
                  <select
                    value={targetType}
                    onChange={(e) => setTargetType(e.target.value as GoalTargetType)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white"
                  >
                    <option value="PROFIT_AMOUNT">Profit Amount ($)</option>
                    <option value="WIN_RATE">Win Rate (%)</option>
                    <option value="MAX_TRADES">Max Trade Count</option>
                    <option value="DISCIPLINE_SCORE">Discipline Score (%)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Target Value *</label>
                <input
                  type="number"
                  step="any"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  className="w-full px-3 py-2 font-mono rounded-xl border border-slate-700 bg-slate-800 text-white font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 font-mono rounded-xl border border-slate-700 bg-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 font-mono rounded-xl border border-slate-700 bg-slate-800 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Notes & Discipline Motivation</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Focus on clean execution, avoid overtrading"
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                >
                  {submitting ? 'Saving...' : 'Set Target'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
