import React, { useState, useEffect } from 'react';
import {
  Bot,
  Brain,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Clock,
  Compass,
  CheckCircle2,
} from 'lucide-react';
import { useAccount } from '../context/AccountContext';
import { api } from '../services/api';

export const CoachPage: React.FC = () => {
  const { selectedAccount } = useAccount();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const res = await api.getCoachInsights(selectedAccount?.id);
      setData(res);
    } catch (err) {
      console.error('Failed to load coach insights:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [selectedAccount?.id]);

  const insights = data?.insights || [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              AI Trading Coach
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Data-driven behavioral analysis, session timing edges, and psychology patterns derived strictly from your manual journal
          </p>
        </div>

        <button
          onClick={fetchInsights}
          disabled={loading}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-card text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 text-indigo-400 transition-colors self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Refresh Analysis</span>
        </button>
      </div>

      {/* Main Coach Summary Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-500/30 shadow-lg space-y-3">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
          <Brain className="w-4 h-4" />
          <span>Executive Behavioral Summary</span>
        </div>
        <p className="text-sm sm:text-base text-slate-100 font-medium leading-relaxed">
          {data?.summary || 'Log at least 3-5 closed trades to unlock personalized AI behavioral analysis.'}
        </p>

        {data?.stats && (
          <div className="flex flex-wrap gap-4 pt-2 border-t border-indigo-500/20 text-xs font-mono">
            <div>
              <span className="text-slate-400 font-sans block text-[10px]">Sample Size:</span>
              <span className="font-bold text-white">{data.stats.totalTrades} Trades</span>
            </div>
            <div>
              <span className="text-slate-400 font-sans block text-[10px]">Win Rate:</span>
              <span className="font-bold text-emerald-400">{data.stats.winRate}%</span>
            </div>
            <div>
              <span className="text-slate-400 font-sans block text-[10px]">Profit Factor:</span>
              <span className="font-bold text-indigo-400">{data.stats.profitFactor}</span>
            </div>
            <div>
              <span className="text-slate-400 font-sans block text-[10px]">Expectancy / Trade:</span>
              <span className="font-bold text-emerald-400">${data.stats.expectancy}</span>
            </div>
          </div>
        )}
      </div>

      {/* Actionable Coach Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {insights.map((item: any, idx: number) => {
          const isPos = item.sentiment === 'positive';
          const isWarn = item.sentiment === 'warning';
          const isNeg = item.sentiment === 'negative' || item.sentiment === 'danger';

          return (
            <div
              key={idx}
              className={`p-5 rounded-2xl border transition-all space-y-3 ${
                isPos
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : isWarn
                  ? 'border-amber-500/30 bg-amber-500/5'
                  : 'border-red-500/30 bg-red-500/5'
              }`}
            >
              <div className="flex items-start justify-between">
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                    isPos
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : isWarn
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {item.category.replace('_', ' ')}
                </span>
                {item.metric && (
                  <span className="text-xs font-mono font-bold text-slate-300">{item.metric}</span>
                )}
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {isPos ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : isWarn ? (
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                )}
                <span>{item.title}</span>
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {item.description}
              </p>
            </div>
          );
        })}

        {insights.length === 0 && !loading && (
          <div className="col-span-full py-12 text-center text-slate-500 rounded-2xl border border-dashed border-slate-700 p-8">
            <Bot className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold">Awaiting trade history</p>
            <p className="text-xs text-slate-500 mt-1">
              Record 3-5 closed trades in your journal to allow the AI coach to uncover statistical patterns.
            </p>
          </div>
        )}
      </div>

      {/* Strict Compliance Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-500 text-center space-y-1">
        <p className="font-semibold text-slate-400">Trading Journal AI Transparency & Disclaimer</p>
        <p>
          The AI Trading Coach operates strictly as an objective statistical auditor of your manually entered journal records. It does not provide financial advice, place trades, or predict future market prices. Past performance is not indicative of future results.
        </p>
      </div>
    </div>
  );
};
