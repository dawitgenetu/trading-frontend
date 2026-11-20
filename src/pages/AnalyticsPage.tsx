import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Scale,
  Award,
  Calendar,
  Layers,
  Brain,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { useAccount } from '../context/AccountContext';
import { api } from '../services/api';

export const AnalyticsPage: React.FC = () => {
  const { selectedAccount, formatCurrency } = useAccount();

  const [dateRange, setDateRange] = useState<string>('all');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.getAdvancedAnalytics({
        accountId: selectedAccount?.id,
        range: dateRange,
      });
      setData(res);
    } catch (err) {
      console.error('Failed to load advanced analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedAccount?.id, dateRange]);

  const stats = data?.overallStats || {
    winRate: 0,
    profitFactor: 0,
    expectancy: 0,
    averageRr: 0,
    maxDrawdownPercentage: 0,
    recoveryFactor: 0,
    consecutiveWins: 0,
    maxConsecutiveWins: 0,
    consecutiveLosses: 0,
    maxConsecutiveLosses: 0,
  };

  const longVsShort = data?.longVsShort || {
    long: { winRate: 0, netProfit: 0, count: 0 },
    short: { winRate: 0, netProfit: 0, count: 0 },
  };

  const symbolBreakdown = data?.symbolBreakdown || [];
  const timeframeBreakdown = data?.timeframeBreakdown || [];
  const weekdayBreakdown = data?.weekdayBreakdown || [];
  const psychology = data?.psychology || {
    fomoTradesCount: 0,
    fomoNetPnl: 0,
    revengeTradesCount: 0,
    revengeNetPnl: 0,
    planFollowedCount: 0,
    planFollowedNetPnl: 0,
    planViolatedCount: 0,
    planViolatedNetPnl: 0,
  };

  const highlights = data?.highlights || {};

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Advanced Analytics Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Expectancy modeling, mathematical edge breakdown, and psychological impact audit
          </p>
        </div>

        {/* Date Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: '30d', label: 'Last 30D' },
            { id: 'this_month', label: 'This Month' },
            { id: 'this_year', label: 'This Year' },
            { id: 'all', label: 'All Time' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setDateRange(pill.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                dateRange === pill.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Statistical Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-card">
          <div className="text-[11px] font-medium text-slate-400 uppercase">Trade Expectancy</div>
          <div className="text-lg sm:text-xl font-bold font-mono text-indigo-400 mt-1">
            {formatCurrency(stats.expectancy)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Per trade edge</div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-card">
          <div className="text-[11px] font-medium text-slate-400 uppercase">Profit Factor</div>
          <div className="text-lg sm:text-xl font-bold font-mono text-emerald-400 mt-1">
            {stats.profitFactor}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Gross Win / Gross Loss</div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-card">
          <div className="text-[11px] font-medium text-slate-400 uppercase">Recovery Factor</div>
          <div className="text-lg sm:text-xl font-bold font-mono text-indigo-400 mt-1">
            {stats.recoveryFactor}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Net Profit / Max DD</div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-card">
          <div className="text-[11px] font-medium text-slate-400 uppercase">Max Drawdown</div>
          <div className="text-lg sm:text-xl font-bold font-mono text-amber-500 mt-1">
            {stats.maxDrawdownPercentage}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Peak-to-trough drop</div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-card">
          <div className="text-[11px] font-medium text-slate-400 uppercase">Max Win Streak</div>
          <div className="text-lg sm:text-xl font-bold font-mono text-emerald-500 mt-1">
            {stats.maxConsecutiveWins} Wins
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Consecutive wins</div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-card">
          <div className="text-[11px] font-medium text-slate-400 uppercase">Max Loss Streak</div>
          <div className="text-lg sm:text-xl font-bold font-mono text-red-500 mt-1">
            {stats.maxConsecutiveLosses} Losses
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Consecutive losses</div>
        </div>
      </div>

      {/* Long vs Short Breakdown & Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Long vs Short (1 col) */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-card shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Long vs Short Performance</h2>

          <div className="space-y-3 font-mono">
            {/* Long */}
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex justify-between items-center text-xs font-bold text-emerald-400 font-sans">
                <span>BUY / LONG TRADES</span>
                <span>{longVsShort.long.count} Trades</span>
              </div>
              <div className="flex justify-between items-baseline mt-2">
                <span className="text-xs text-slate-400 font-sans">Win Rate:</span>
                <span className="text-base font-bold text-slate-200">{longVsShort.long.winRate}%</span>
              </div>
              <div className="flex justify-between items-baseline mt-1">
                <span className="text-xs text-slate-400 font-sans">Net P/L:</span>
                <span className={`text-base font-bold ${longVsShort.long.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {longVsShort.long.netProfit >= 0 ? '+' : ''}{formatCurrency(longVsShort.long.netProfit)}
                </span>
              </div>
            </div>

            {/* Short */}
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20">
              <div className="flex justify-between items-center text-xs font-bold text-red-400 font-sans">
                <span>SELL / SHORT TRADES</span>
                <span>{longVsShort.short.count} Trades</span>
              </div>
              <div className="flex justify-between items-baseline mt-2">
                <span className="text-xs text-slate-400 font-sans">Win Rate:</span>
                <span className="text-base font-bold text-slate-200">{longVsShort.short.winRate}%</span>
              </div>
              <div className="flex justify-between items-baseline mt-1">
                <span className="text-xs text-slate-400 font-sans">Net P/L:</span>
                <span className={`text-base font-bold ${longVsShort.short.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {longVsShort.short.netProfit >= 0 ? '+' : ''}{formatCurrency(longVsShort.short.netProfit)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Highlights: Best Symbol, Best Timeframe, Best Weekday (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-card shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Edge Discovery & Outliers</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-400 uppercase font-bold">Top Symbol</div>
              <div className="text-base font-bold text-slate-900 dark:text-white font-mono mt-1">
                {highlights.bestSymbol?.symbol || '—'}
              </div>
              <div className="text-xs text-emerald-400 font-mono mt-0.5">
                {highlights.bestSymbol ? `+${formatCurrency(highlights.bestSymbol.netPnl)} (${highlights.bestSymbol.winRate}%)` : 'No data'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-400 uppercase font-bold">Best Timeframe</div>
              <div className="text-base font-bold text-slate-900 dark:text-white font-mono mt-1">
                {highlights.bestTimeframe?.timeframe || '—'}
              </div>
              <div className="text-xs text-emerald-400 font-mono mt-0.5">
                {highlights.bestTimeframe ? `+${formatCurrency(highlights.bestTimeframe.netPnl)} (${highlights.bestTimeframe.winRate}%)` : 'No data'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-400 uppercase font-bold">Best Weekday</div>
              <div className="text-base font-bold text-slate-900 dark:text-white font-mono mt-1">
                {highlights.bestWeekday?.day || '—'}
              </div>
              <div className="text-xs text-emerald-400 font-mono mt-0.5">
                {highlights.bestWeekday ? `+${formatCurrency(highlights.bestWeekday.netPnl)}` : 'No data'}
              </div>
            </div>
          </div>

          {/* Psychology Cost Audit */}
          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
              <Brain className="w-4 h-4" />
              <span>Psychology & Emotional Trading Impact Audit</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono pt-1">
              <div>
                <span className="text-slate-400 font-sans block text-[11px]">FOMO Losses:</span>
                <span className={`font-bold ${psychology.fomoNetPnl < 0 ? 'text-red-400' : 'text-slate-300'}`}>
                  {formatCurrency(psychology.fomoNetPnl)} ({psychology.fomoTradesCount}T)
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-sans block text-[11px]">Revenge Losses:</span>
                <span className={`font-bold ${psychology.revengeNetPnl < 0 ? 'text-red-400' : 'text-slate-300'}`}>
                  {formatCurrency(psychology.revengeNetPnl)} ({psychology.revengeTradesCount}T)
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-sans block text-[11px]">Plan Adherence:</span>
                <span className="font-bold text-emerald-400">
                  +{formatCurrency(psychology.planFollowedNetPnl)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-sans block text-[11px]">Plan Deviations:</span>
                <span className={`font-bold ${psychology.planViolatedNetPnl < 0 ? 'text-red-400' : 'text-slate-300'}`}>
                  {formatCurrency(psychology.planViolatedNetPnl)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Symbol & Weekday Breakdown Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Symbol Breakdown */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-card shadow-sm space-y-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Performance by Symbol</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 uppercase font-sans">
                  <th className="py-2 px-3">Symbol</th>
                  <th className="py-2 px-3">Trades</th>
                  <th className="py-2 px-3">Win Rate</th>
                  <th className="py-2 px-3 text-right">Net P/L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {symbolBreakdown.map((sym: any) => (
                  <tr key={sym.symbol} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{sym.symbol}</td>
                    <td className="py-2.5 px-3 text-slate-400">{sym.tradesCount}</td>
                    <td className="py-2.5 px-3">
                      <span className={sym.winRate >= 50 ? 'text-emerald-400' : 'text-slate-400'}>
                        {sym.winRate}%
                      </span>
                    </td>
                    <td className={`py-2.5 px-3 text-right font-bold ${sym.netPnl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {sym.netPnl >= 0 ? '+' : ''}{formatCurrency(sym.netPnl)}
                    </td>
                  </tr>
                ))}
                {symbolBreakdown.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-500 font-sans">
                      No symbol records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Weekday Performance Bar Chart */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-card shadow-sm space-y-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Performance by Day of Week</h2>

          <div className="h-56 w-full">
            {weekdayBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekdayBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="day" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#F8FAFC',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => [`$${Number(val).toFixed(2)}`, 'Net P/L']}
                  />
                  <Bar dataKey="netPnl" radius={[4, 4, 0, 0]}>
                    {weekdayBreakdown.map((entry: any, index: number) => (
                      <Cell
                        key={`bar-${index}`}
                        fill={entry.netPnl >= 0 ? '#22C55E' : '#EF4444'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-slate-500">
                No weekday data available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
