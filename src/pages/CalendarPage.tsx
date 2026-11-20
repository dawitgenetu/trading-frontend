import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  X,
  Clock,
  Eye,
} from 'lucide-react';
import { useAccount } from '../context/AccountContext';
import { api } from '../services/api';
import type { Trade } from '../types';

export const CalendarPage: React.FC = () => {
  const { selectedAccount, formatCurrency } = useAccount();

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [allTrades, setAllTrades] = useState<Trade[]>([]);
  const [selectedDayTrades, setSelectedDayTrades] = useState<{ date: string; trades: Trade[] } | null>(null);

  const fetchCalendar = async () => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const start = `${year}-${String(month).padStart(2, '0')}-01`;
      const end = new Date(year, month, 0).toISOString().split('T')[0];

      const [resDash, resTrades] = await Promise.all([
        api.getDashboard({
          accountId: selectedAccount?.id,
          range: 'custom',
          startDate: start,
          endDate: end,
        }),
        api.getTrades({
          accountId: selectedAccount?.id,
          startDate: start,
          endDate: end,
          limit: 100,
        }),
      ]);

      setDailyData(resDash.calendarDays || []);
      setAllTrades(resTrades.trades || []);
    } catch (err) {
      console.error('Failed to load calendar data:', err);
    }
  };

  useEffect(() => {
    fetchCalendar();
  }, [selectedAccount?.id, currentDate]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const handleDayClick = (dateStr: string) => {
    const dayTrades = allTrades.filter((t) => t.tradeDate === dateStr);
    if (dayTrades.length > 0) {
      setSelectedDayTrades({ date: dateStr, trades: dayTrades });
    }
  };

  // Month total summary
  const monthTotalNet = dailyData.reduce((acc, d) => acc + (d.pnl || 0), 0);
  const monthTradesCount = dailyData.reduce((acc, d) => acc + (d.trades || 0), 0);
  const monthWins = dailyData.reduce((acc, d) => acc + (d.wins || 0), 0);
  const monthWinRate = monthTradesCount > 0 ? Math.round((monthWins / monthTradesCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Trading Calendar
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Monthly P/L heatmap, trade frequency, daily win rates, and journal day inspection
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-800 shadow-sm">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs sm:text-sm font-bold text-slate-900 dark:text-white whitespace-nowrap">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Month Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-card shadow-sm font-mono text-center">
        <div>
          <span className="text-[10px] text-slate-400 uppercase block font-sans">Month Net P/L</span>
          <span className={`text-lg font-bold ${monthTotalNet >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {monthTotalNet >= 0 ? '+' : ''}{formatCurrency(monthTotalNet)}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase block font-sans">Total Trades</span>
          <span className="text-lg font-bold text-slate-900 dark:text-white">{monthTradesCount}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase block font-sans">Win Rate</span>
          <span className={`text-lg font-bold ${monthWinRate >= 50 ? 'text-emerald-500' : 'text-slate-300'}`}>
            {monthWinRate}%
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase block font-sans">Winning Days</span>
          <span className="text-lg font-bold text-indigo-400">
            {dailyData.filter((d) => d.pnl > 0).length} / {dailyData.length}
          </span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-card shadow-sm overflow-hidden p-4">
        {/* Day of Week Headers */}
        <div className="grid grid-cols-7 gap-1.5 mb-2 text-center text-xs font-bold text-slate-400 uppercase">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Calendar Cells */}
        <div className="grid grid-cols-7 gap-1.5">
          {/* Empty cells before month start */}
          {Array.from({ length: firstDayIndex }).map((_, index) => (
            <div
              key={`empty-${index}`}
              className="h-20 sm:h-24 rounded-xl border border-dashed border-slate-100 dark:border-slate-800/40 bg-slate-50/20 dark:bg-slate-950/20"
            />
          ))}

          {/* Days in Month */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const dayNum = index + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const dataForDay = dailyData.find((d) => d.date === dateStr);
            const hasTrades = dataForDay && dataForDay.trades > 0;
            const isProfit = hasTrades && dataForDay.pnl > 0;
            const isLoss = hasTrades && dataForDay.pnl < 0;

            return (
              <div
                key={dateStr}
                onClick={() => handleDayClick(dateStr)}
                className={`h-20 sm:h-24 p-2 rounded-xl border transition-all flex flex-col justify-between cursor-pointer ${
                  isProfit
                    ? 'border-emerald-500/40 bg-emerald-500/10 hover:border-emerald-500'
                    : isLoss
                    ? 'border-red-500/40 bg-red-500/10 hover:border-red-500'
                    : hasTrades
                    ? 'border-slate-700 bg-slate-800/40'
                    : 'border-slate-200 dark:border-slate-800/70 bg-white dark:bg-slate-900/30 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className={hasTrades ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-400'}>
                    {dayNum}
                  </span>
                  {hasTrades && (
                    <span className="text-[10px] px-1 rounded bg-slate-950/60 text-slate-300">
                      {dataForDay.trades}T
                    </span>
                  )}
                </div>

                {hasTrades ? (
                  <div className="font-mono text-center">
                    <div className={`text-xs sm:text-sm font-bold ${isProfit ? 'text-emerald-500' : isLoss ? 'text-red-500' : 'text-slate-300'}`}>
                      {isProfit ? '+' : ''}${Math.round(dataForDay.pnl)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans">
                      {dataForDay.wins}W - {dataForDay.losses}L ({dataForDay.winRate}%)
                    </div>
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-600 dark:text-slate-700 text-center font-mono">
                    —
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Trades Drawer / Modal */}
      {selectedDayTrades && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-xl p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Trades for {selectedDayTrades.date}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedDayTrades.trades.length} recorded execution{selectedDayTrades.trades.length > 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => setSelectedDayTrades(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 font-mono">
              {selectedDayTrades.trades.map((t) => (
                <div
                  key={t.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">{t.symbol}</span>
                      <span
                        className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                          t.direction === 'BUY' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                        }`}
                      >
                        {t.direction}
                      </span>
                      <span className="text-xs text-slate-400 font-sans">{t.timeframe} • {t.session}</span>
                    </div>
                    <div className="text-xs text-slate-500 font-sans mt-1">
                      Entry: {t.entryPrice} • Exit: {t.exitPrice || 'Open'} • Size: {t.positionSize} Lots
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`text-base font-bold ${t.netPnl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {t.netPnl >= 0 ? '+' : ''}{formatCurrency(t.netPnl)}
                    </div>
                    <div className="text-[11px] text-indigo-400">
                      {t.actualRMultiple ? `${t.actualRMultiple}R` : '—'}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedDayTrades(null)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
