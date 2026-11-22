import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Scale,
  Award,
  AlertTriangle,
  BarChart2,
  PieChart as PieIcon,
  Calendar,
  Filter,
  Send,
  Bot,
} from 'lucide-react';
import { TelegramSettingsModal } from '../components/common/TelegramSettingsModal';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { useAccount } from '../context/AccountContext';
import { api } from '../services/api';
import { MetricCard } from '../components/common/MetricCard';

export const DashboardPage: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { selectedAccount, formatCurrency } = useAccount();

  const [dateRange, setDateRange] = useState<string>('30d');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  const [telegramModalOpen, setTelegramModalOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboard({
        accountId: selectedAccount?.id,
        range: dateRange,
        startDate: customStart,
        endDate: customEnd,
      });
      setData(res);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [selectedAccount?.id, dateRange, customStart, customEnd]);

  const stats = data?.stats || {
    initialBalance: selectedAccount?.initialBalance || 10000,
    currentBalance: selectedAccount?.currentBalance || 10000,
    currentEquity: selectedAccount?.currentBalance || 10000,
    netProfit: 0,
    grossProfit: 0,
    grossLoss: 0,
    totalTrades: 0,
    winningTrades: 0,
    losingTrades: 0,
    winRate: 0,
    profitFactor: 0,
    averageRr: 0,
    averageWin: 0,
    averageLoss: 0,
    maxDrawdownAmount: 0,
    maxDrawdownPercentage: 0,
  };

  const equityCurve = data?.equityCurve || [];
  const dailyPnl = data?.dailyPnl || [];
  const monthlyPnl = data?.monthlyPnl || [];
  const sessionPerf = data?.sessionPerformance || [];
  const strategyPerf = data?.strategyPerformance || [];
  const calendarDays = data?.calendarDays || [];

  const winLossData = [
    { name: 'Winning Trades', value: stats.winningTrades, color: '#34D399' },
    { name: 'Losing Trades', value: stats.losingTrades, color: '#F87171' },
    { name: 'Break Even', value: stats.breakEvenTrades || 0, color: '#DFD6AE' },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Top Header & Date Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-brand-tealBorder/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-slate-900 dark:text-brand-goldLight">
            Performance Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time quantitative analytics • <span className="text-brand-gold font-medium">{selectedAccount?.name || 'All Accounts'}</span>
          </p>
        </div>

        {/* Date Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'today', label: 'Today' },
            { id: '7d', label: '7D' },
            { id: '30d', label: '30D' },
            { id: 'this_month', label: 'This Month' },
            { id: 'last_month', label: 'Last Month' },
            { id: 'this_year', label: 'This Year' },
            { id: 'all', label: 'All' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setDateRange(pill.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                dateRange === pill.id
                  ? 'bg-brand-gold text-brand-tealDark font-bold shadow-md shadow-brand-gold/25'
                  : 'bg-white dark:bg-brand-tealSurface border border-slate-200 dark:border-brand-tealBorder text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-brand-tealHover'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard
          label="Current Balance"
          value={formatCurrency(stats.currentBalance)}
          subValue={`Init: ${formatCurrency(stats.initialBalance)}`}
          icon={DollarSign}
          variant="gold"
        />
        <MetricCard
          label="Total Net Profit"
          value={formatCurrency(stats.netProfit)}
          subValue={stats.netProfit >= 0 ? 'Profitable' : 'Drawdown'}
          icon={stats.netProfit >= 0 ? TrendingUp : TrendingDown}
          variant={stats.netProfit >= 0 ? 'profit' : 'loss'}
        />
        <MetricCard
          label="Win Rate"
          value={`${stats.winRate}%`}
          subValue={`${stats.winningTrades}W / ${stats.losingTrades}L`}
          icon={Award}
          variant={stats.winRate >= 50 ? 'profit' : 'default'}
        />
        <MetricCard
          label="Profit Factor"
          value={stats.profitFactor}
          subValue={stats.profitFactor >= 1.5 ? 'Excellent' : stats.profitFactor >= 1 ? 'Positive' : 'Negative'}
          icon={Scale}
          variant={stats.profitFactor >= 1.5 ? 'profit' : stats.profitFactor < 1 ? 'loss' : 'default'}
        />
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-brand-tealBorder bg-white dark:bg-brand-tealSurface shadow-sm">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Gross Profit</div>
          <div className="text-base sm:text-lg font-bold font-mono text-emerald-400 mt-1">
            {formatCurrency(stats.grossProfit)}
          </div>
        </div>
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-brand-tealBorder bg-white dark:bg-brand-tealSurface shadow-sm">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Gross Loss</div>
          <div className="text-base sm:text-lg font-bold font-mono text-rose-400 mt-1">
            {formatCurrency(stats.grossLoss)}
          </div>
        </div>
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-brand-tealBorder bg-white dark:bg-brand-tealSurface shadow-sm">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Average Win</div>
          <div className="text-base sm:text-lg font-bold font-mono text-emerald-400 mt-1">
            {formatCurrency(stats.averageWin)}
          </div>
        </div>
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-brand-tealBorder bg-white dark:bg-brand-tealSurface shadow-sm">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Average Loss</div>
          <div className="text-base sm:text-lg font-bold font-mono text-rose-400 mt-1">
            {formatCurrency(stats.averageLoss)}
          </div>
        </div>
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-brand-tealBorder bg-white dark:bg-brand-tealSurface shadow-sm">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Avg Risk/Reward</div>
          <div className="text-base sm:text-lg font-bold font-mono text-brand-gold mt-1">
            {stats.averageRr ? `${stats.averageRr}R` : '0R'}
          </div>
        </div>
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-brand-tealBorder bg-white dark:bg-brand-tealSurface shadow-sm">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Max Drawdown</div>
          <div className="text-base sm:text-lg font-bold font-mono text-brand-goldDark mt-1">
            {stats.maxDrawdownPercentage}%
          </div>
        </div>
      </div>

      {/* Main Charts: Equity Curve & Daily P/L */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equity Curve (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl border border-slate-200 dark:border-brand-tealBorder bg-white dark:bg-brand-tealSurface shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-brand-goldLight">Equity Curve</h2>
              <p className="text-xs text-slate-400">Cumulative account growth over time</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-gold"></span>
              <span className="text-xs text-brand-gold font-mono">Realized Equity</span>
            </div>
          </div>

          <div className="h-72 w-full">
            {equityCurve.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={equityCurve} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#DFD6AE" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#274245" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    stroke="#8B9DA0"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(str) => str.substring(5)}
                  />
                  <YAxis
                    stroke="#8B9DA0"
                    fontSize={11}
                    tickLine={false}
                    domain={['dataMin - 100', 'dataMax + 100']}
                    tickFormatter={(val) => `$${val}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#122022',
                      borderColor: '#2e4f53',
                      borderRadius: '12px',
                      color: '#DFD6AE',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => [`$${Number(val).toFixed(2)}`, 'Equity']}
                  />
                  <Area
                    type="monotone"
                    dataKey="equity"
                    stroke="#DFD6AE"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#equityGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-slate-500">
                No closed trades in selected period
              </div>
            )}
          </div>
        </div>

        {/* Win/Loss Distribution (1 col) */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-brand-tealBorder bg-white dark:bg-brand-tealSurface shadow-md flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-brand-goldLight">Win vs Loss Outcome</h2>
            <p className="text-xs text-slate-400">Trade distribution ratio</p>
          </div>

          <div className="h-56 w-full my-auto flex items-center justify-center">
            {stats.totalTrades > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={winLossData}
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {winLossData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#122022',
                      borderColor: '#2e4f53',
                      borderRadius: '12px',
                      color: '#DFD6AE',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-sm text-slate-500">No trades yet</div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-brand-tealBorder">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-emerald-400"></span>
              <span className="text-xs text-slate-300">Wins ({stats.winningTrades})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-rose-400"></span>
              <span className="text-xs text-slate-300">Losses ({stats.losingTrades})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Daily P/L Bar Chart & Session Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily P&L */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-brand-tealBorder bg-white dark:bg-brand-tealSurface shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-brand-goldLight">Daily Profit & Loss</h2>
              <p className="text-xs text-slate-400">Net realized P/L per calendar day</p>
            </div>
            <span className="text-xs text-brand-gold font-mono">{dailyPnl.length} Trading Days</span>
          </div>

          <div className="h-64 w-full">
            {dailyPnl.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyPnl} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="date"
                    stroke="#8B9DA0"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(str) => str.substring(5)}
                  />
                  <YAxis stroke="#8B9DA0" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#122022',
                      borderColor: '#2e4f53',
                      borderRadius: '12px',
                      color: '#DFD6AE',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => [`$${Number(val).toFixed(2)}`, 'Net P/L']}
                  />
                  <Bar dataKey="netPnl" radius={[4, 4, 0, 0]}>
                    {dailyPnl.map((entry: any, index: number) => (
                      <Cell
                        key={`bar-${index}`}
                        fill={entry.netPnl >= 0 ? '#34D399' : '#F87171'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-slate-500">
                No daily data recorded yet
              </div>
            )}
          </div>
        </div>

        {/* Session Performance */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-brand-tealBorder bg-white dark:bg-brand-tealSurface shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-brand-goldLight">Session Performance</h2>
              <p className="text-xs text-slate-400">Asian, London, New York, Sydney</p>
            </div>
            <button
              onClick={() => onNavigate('analytics')}
              className="text-xs text-brand-gold hover:text-brand-goldLight font-semibold"
            >
              View Analytics →
            </button>
          </div>

          <div className="space-y-3 pt-2">
            {['London', 'New York', 'Asian', 'Sydney'].map((sessName) => {
              const match = sessionPerf.find((s: any) => s.session === sessName) || {
                tradesCount: 0,
                netPnl: 0,
                winRate: 0,
              };

              return (
                <div key={sessName} className="p-3 rounded-xl bg-slate-50 dark:bg-dark-bg/60 border border-slate-200/60 dark:border-brand-tealBorder/60 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">{sessName} Session</div>
                    <div className="text-[11px] text-slate-400">
                      {match.tradesCount} Trades • {match.winRate}% Win Rate
                    </div>
                  </div>
                  <div className={`text-sm font-bold font-mono ${match.netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {match.netPnl >= 0 ? '+' : ''}{formatCurrency(match.netPnl)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mini Trading Calendar Heatmap Preview */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-brand-tealBorder bg-white dark:bg-brand-tealSurface shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-gold" />
            <h2 className="text-base font-bold text-slate-900 dark:text-brand-goldLight">Recent Trading Days Heatmap</h2>
          </div>
          <button
            onClick={() => onNavigate('calendar')}
            className="text-xs text-brand-gold hover:text-brand-goldLight font-semibold"
          >
            Open Full Calendar →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 pt-2">
          {calendarDays.slice(-14).map((day: any) => (
            <div
              key={day.date}
              onClick={() => onNavigate('calendar')}
              className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all hover:scale-105 ${
                day.pnl > 0
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : day.pnl < 0
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  : 'bg-brand-tealSurface/80 border-brand-tealBorder/80 text-slate-400'
              }`}
            >
              <div className="text-[10px] text-slate-400">{day.date.substring(5)}</div>
              <div className="text-xs font-bold font-mono my-0.5">
                {day.pnl >= 0 ? '+' : ''}${Math.round(day.pnl)}
              </div>
              <div className="text-[10px] opacity-80">{day.trades} trade{day.trades > 1 ? 's' : ''}</div>
            </div>
          ))}
          {calendarDays.length === 0 && (
            <div className="col-span-full py-6 text-center text-sm text-slate-400">
              No recent trade activity recorded. Click "+ Add Trade" above to log your first trade!
            </div>
          )}
        </div>
      </div>

      {/* Telegram Discipline & Notifications Banner Card */}
      <div className="p-4 sm:p-5 rounded-2xl border border-sky-500/30 bg-gradient-to-r from-sky-950/30 via-brand-tealSurface/90 to-brand-tealSurface/90 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-sky-500/15 text-sky-400 border border-sky-500/30 flex-shrink-0">
            <Send className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white">Telegram Discipline & Notifications Bot</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                Discipline Bridge
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Instant alerts for trade entries, closed trades with calm-down tips, and 2-trades daily limit lockout.
            </p>
          </div>
        </div>

        <button
          onClick={() => setTelegramModalOpen(true)}
          className="w-full md:w-auto px-4 py-2.5 text-xs font-bold rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 border border-sky-500/30 transition-all flex items-center justify-center gap-2 whitespace-nowrap active:scale-95 shadow-sm"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Configure Bot & Test</span>
        </button>
      </div>

      {/* Telegram Bot Settings Modal */}
      <TelegramSettingsModal
        isOpen={telegramModalOpen}
        onClose={() => setTelegramModalOpen(false)}
      />
    </div>
  );
};
