import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  MoreVertical,
  Eye,
  Edit2,
  Copy,
  Trash2,
  Download,
  Calendar,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Send,
  Heart,
  ShieldCheck,
} from 'lucide-react';
import { useAccount } from '../context/AccountContext';
import { api } from '../services/api';
import { PostTradeDisciplineModal } from '../components/common/PostTradeDisciplineModal';
import { TelegramSettingsModal } from '../components/common/TelegramSettingsModal';
import type { Trade, TradeStatus, TradeDirection } from '../types';

interface JournalPageProps {
  onAddTrade: () => void;
  onEditTrade: (trade: Trade) => void;
}

export const JournalPage: React.FC<JournalPageProps> = ({ onAddTrade, onEditTrade }) => {
  const { selectedAccount, formatCurrency, refreshAccounts } = useAccount();

  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterDirection, setFilterDirection] = useState<string>('');
  const [filterSession, setFilterSession] = useState<string>('');
  const [filterSymbol, setFilterSymbol] = useState<string>('');

  // Pagination & Sorting
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('entryTime');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Selected trade for detail drawer
  const [activeTrade, setActiveTrade] = useState<Trade | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Quick Close Trade Modal State
  const [closingTrade, setClosingTrade] = useState<Trade | null>(null);
  const [closeExitPrice, setCloseExitPrice] = useState<string>('');
  const [closeLoading, setCloseLoading] = useState(false);

  // Post-Trade Discipline Tips & Telegram Modals
  const [closedDisciplineTrade, setClosedDisciplineTrade] = useState<Trade | null>(null);
  const [showDisciplineModal, setShowDisciplineModal] = useState<boolean>(false);
  const [telegramModalOpen, setTelegramModalOpen] = useState<boolean>(false);

  const fetchTrades = async () => {
    try {
      setLoading(true);
      const res = await api.getTrades({
        accountId: selectedAccount?.id,
        search: searchTerm,
        status: filterStatus || undefined,
        direction: filterDirection || undefined,
        session: filterSession || undefined,
        symbol: filterSymbol || undefined,
        page,
        limit: 25,
        sortBy,
        sortDir,
      });

      setTrades(res.trades || []);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (err) {
      console.error('Failed to load trades:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, [selectedAccount?.id, searchTerm, filterStatus, filterDirection, filterSession, filterSymbol, page, sortBy, sortDir]);

  const handleQuickClose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!closingTrade) return;
    const xp = parseFloat(closeExitPrice);
    if (!xp || xp <= 0) {
      alert('Please enter a valid exit price');
      return;
    }

    try {
      setCloseLoading(true);
      const res = await api.updateTrade(closingTrade.id, {
        status: 'Closed',
        exitPrice: xp,
        exitTime: new Date().toISOString(),
      });
      setClosingTrade(null);
      setCloseExitPrice('');
      if (activeTrade?.id === closingTrade.id) setActiveTrade(null);
      await fetchTrades();
      await refreshAccounts();

      // Trigger post-trade emotional discipline & calm-down advisory modal!
      if (res.trade) {
        setClosedDisciplineTrade(res.trade);
        setShowDisciplineModal(true);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to close trade');
    } finally {
      setCloseLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteTrade(id);
      setDeleteConfirmId(null);
      if (activeTrade?.id === id) setActiveTrade(null);
      await fetchTrades();
    } catch (err) {
      alert('Error deleting trade');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await api.duplicateTrade(id);
      await fetchTrades();
    } catch (err) {
      alert('Error duplicating trade');
    }
  };

  const handleExportCsv = () => {
    window.open(`/api/reports/csv?accountId=${selectedAccount?.id || ''}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-slate-900 dark:text-brand-goldLight">
            Trading Journal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Searchable trade log, strategy execution records, and execution reviews
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Daily 2-Trade Discipline Indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-brand-tealBorder bg-brand-tealSurface text-xs text-slate-300 font-semibold shadow-sm">
            <Clock className="w-3.5 h-3.5 text-brand-gold" />
            <span>Rule: <b className="text-brand-gold">Max 2 Trades/Day</b></span>
          </div>

          {/* Telegram Notifications Button */}
          <button
            onClick={() => setTelegramModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#229ED9]/40 bg-[#229ED9]/10 text-[#229ED9] text-xs font-semibold hover:bg-[#229ED9]/20 transition-colors shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Telegram Bot</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-brand-tealBorder bg-white dark:bg-brand-tealSurface text-xs font-semibold hover:border-brand-gold/40 text-brand-gold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onAddTrade}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-gold hover:bg-brand-goldLight text-brand-tealDark font-bold text-xs sm:text-sm shadow-md shadow-brand-gold/25 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Trade</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-brand-tealBorder bg-white dark:bg-brand-tealSurface shadow-md flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-goldMuted" />
          <input
            type="text"
            placeholder="Search symbol, notes, strategy..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-brand-tealBorder bg-slate-50 dark:bg-dark-bg/80 focus:outline-none focus:border-brand-gold text-slate-900 dark:text-white placeholder:text-slate-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-brand-tealBorder bg-slate-50 dark:bg-dark-bg/80 focus:outline-none focus:border-brand-gold text-slate-700 dark:text-slate-200"
          >
            <option value="">All Statuses</option>
            <option value="Closed">Closed</option>
            <option value="Open">Open</option>
            <option value="Planned">Planned</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            value={filterDirection}
            onChange={(e) => setFilterDirection(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-brand-tealBorder bg-slate-50 dark:bg-dark-bg/80 focus:outline-none focus:border-brand-gold text-slate-700 dark:text-slate-200"
          >
            <option value="">All Directions</option>
            <option value="BUY">BUY Only</option>
            <option value="SELL">SELL Only</option>
          </select>

          <select
            value={filterSession}
            onChange={(e) => setFilterSession(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-brand-tealBorder bg-slate-50 dark:bg-dark-bg/80 focus:outline-none focus:border-brand-gold text-slate-700 dark:text-slate-200"
          >
            <option value="">All Sessions</option>
            <option value="London">London</option>
            <option value="New York">New York</option>
            <option value="Asian">Asian</option>
            <option value="Sydney">Sydney</option>
          </select>

          {(filterStatus || filterDirection || filterSession || searchTerm) && (
            <button
              onClick={() => {
                setFilterStatus('');
                setFilterDirection('');
                setFilterSession('');
                setSearchTerm('');
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs"
              title="Clear Filters"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Trades Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-brand-tealBorder bg-white dark:bg-brand-tealSurface shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-brand-tealBorder bg-slate-50/50 dark:bg-dark-bg/60 text-[11px] font-semibold text-brand-gold uppercase tracking-wider">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Symbol</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Strategy</th>
                <th className="py-3 px-3">Entry</th>
                <th className="py-3 px-3">SL</th>
                <th className="py-3 px-3">TP</th>
                <th className="py-3 px-3">Exit</th>
                <th className="py-3 px-3">Lots</th>
                <th className="py-3 px-3">Net P/L</th>
                <th className="py-3 px-3">R Multiple</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {trades.map((trade) => {
                const isBuy = trade.direction === 'BUY';
                const isWin = trade.netPnl > 0.001;
                const isLoss = trade.netPnl < -0.001;

                return (
                  <tr
                    key={trade.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                    onClick={() => setActiveTrade(trade)}
                  >
                    <td className="py-3.5 px-4 font-sans text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {trade.tradeDate}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {trade.symbol}
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${
                          isBuy
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : 'bg-red-500/10 text-red-500 border border-red-500/20'
                        }`}
                      >
                        {trade.direction}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-sans text-slate-500 dark:text-slate-400 max-w-[120px] truncate">
                      {trade.strategyName || 'Discretionary'}
                    </td>

                    <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300">
                      {trade.entryPrice}
                    </td>

                    <td className="py-3.5 px-3 text-red-400/80">
                      {trade.stopLoss || '—'}
                    </td>

                    <td className="py-3.5 px-3 text-emerald-400/80">
                      {trade.takeProfit || '—'}
                    </td>

                    <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300">
                      {trade.exitPrice || '—'}
                    </td>

                    <td className="py-3.5 px-3 text-slate-500 dark:text-slate-400">
                      {trade.positionSize}
                    </td>

                    <td className="py-3.5 px-3 font-bold whitespace-nowrap">
                      {trade.status === 'Closed' ? (
                        <span className={isWin ? 'text-emerald-500' : isLoss ? 'text-red-500' : 'text-slate-400'}>
                          {isWin ? '+' : ''}{formatCurrency(trade.netPnl)}
                        </span>
                      ) : (
                        <span className="text-slate-500 font-sans text-xs">Unrealized</span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 font-bold">
                      {trade.status === 'Closed' && trade.actualRMultiple ? (
                        <span className={trade.actualRMultiple > 0 ? 'text-emerald-500' : 'text-red-500'}>
                          {trade.actualRMultiple > 0 ? '+' : ''}{trade.actualRMultiple}R
                        </span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-semibold rounded-md font-sans ${
                          trade.status === 'Closed'
                            ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            : trade.status === 'Open'
                            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {trade.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {trade.status === 'Open' && (
                          <button
                            onClick={() => {
                              setClosingTrade(trade);
                              setCloseExitPrice('');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold transition-all flex items-center gap-1 shadow-sm"
                            title="Close Trade Manually"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Close</span>
                          </button>
                        )}
                        <button
                          onClick={() => setActiveTrade(trade)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEditTrade(trade)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                          title="Edit Trade"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(trade.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                          title="Duplicate Trade"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(trade.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                          title="Delete Trade"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {trades.length === 0 && !loading && (
                <tr>
                  <td colSpan={13} className="py-12 text-center text-slate-500 font-sans">
                    No trades found matching current criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Page {page} of {totalPages}</span>
            <div className="flex gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-2.5 py-1 rounded-lg border border-slate-700 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-2.5 py-1 rounded-lg border border-slate-700 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Trade Record?</h3>
            <p className="text-sm text-slate-500">
              Are you sure you want to permanently delete this trade? If this was a closed trade, your account balance and performance statistics will be automatically recalculated.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Trade Drawer */}
      {activeTrade && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-xl h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">{activeTrade.symbol}</span>
                  <span
                    className={`px-2 py-0.5 text-xs font-bold rounded ${
                      activeTrade.direction === 'BUY' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                    }`}
                  >
                    {activeTrade.direction}
                  </span>
                  <span className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-800 text-slate-300">
                    {activeTrade.status}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {activeTrade.tradeDate} • {activeTrade.session} Session • {activeTrade.timeframe}
                </div>
              </div>
              <button
                onClick={() => setActiveTrade(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Financial Overview */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <div>
                <div className="text-[11px] text-slate-400">Net Realized P/L</div>
                <div className={`text-lg font-bold font-mono mt-0.5 ${activeTrade.netPnl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {activeTrade.netPnl >= 0 ? '+' : ''}{formatCurrency(activeTrade.netPnl)}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400">R Multiple</div>
                <div className="text-lg font-bold font-mono text-indigo-400 mt-0.5">
                  {activeTrade.actualRMultiple ? `${activeTrade.actualRMultiple}R` : '—'}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400">Position Size</div>
                <div className="text-lg font-bold font-mono text-slate-200 mt-0.5">
                  {activeTrade.positionSize} Lots
                </div>
              </div>
            </div>

            {/* Price Execution Details */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Price Execution</h4>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800 flex justify-between">
                  <span className="text-slate-500">Entry:</span>
                  <span className="text-white font-bold">{activeTrade.entryPrice}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800 flex justify-between">
                  <span className="text-slate-500">Exit:</span>
                  <span className="text-white font-bold">{activeTrade.exitPrice || 'Open'}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800 flex justify-between">
                  <span className="text-slate-500">Stop Loss:</span>
                  <span className="text-red-400 font-bold">{activeTrade.stopLoss || 'None'}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800 flex justify-between">
                  <span className="text-slate-500">Take Profit:</span>
                  <span className="text-emerald-400 font-bold">{activeTrade.takeProfit || 'None'}</span>
                </div>
              </div>
            </div>

            {/* Strategy & Analysis */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Strategy & Confluence</h4>
              <div className="p-3.5 rounded-xl bg-slate-800/30 border border-slate-800 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Strategy:</span>
                  <span className="font-semibold text-white">{activeTrade.strategyName || 'Discretionary'}</span>
                </div>
                {activeTrade.entryReason && (
                  <div>
                    <span className="text-slate-400 block mb-0.5">Entry Reason:</span>
                    <p className="text-slate-200">{activeTrade.entryReason}</p>
                  </div>
                )}
                {activeTrade.confluenceChecklist && activeTrade.confluenceChecklist.length > 0 && (
                  <div>
                    <span className="text-slate-400 block mb-1">Confluences Checked:</span>
                    <div className="flex flex-wrap gap-1">
                      {activeTrade.confluenceChecklist.map((c, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 text-[11px] border border-indigo-500/20">
                          ✓ {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Trade Psychology Review */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Trading Psychology & Discipline</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Followed Plan:</span>
                  <span className={activeTrade.followedPlan ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                    {activeTrade.followedPlan ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800 flex justify-between">
                  <span className="text-slate-400">FOMO Trade:</span>
                  <span className={activeTrade.wasFomo ? 'text-red-400 font-bold' : 'text-slate-300'}>
                    {activeTrade.wasFomo ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Revenge Trade:</span>
                  <span className={activeTrade.wasRevenge ? 'text-red-400 font-bold' : 'text-slate-300'}>
                    {activeTrade.wasRevenge ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Overtraded:</span>
                  <span className={activeTrade.didOvertrade ? 'text-red-400 font-bold' : 'text-slate-300'}>
                    {activeTrade.didOvertrade ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
              {activeTrade.lessonsLearned && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                  <span className="font-bold block mb-0.5">Lesson Learned:</span>
                  {activeTrade.lessonsLearned}
                </div>
              )}
              {activeTrade.status === 'Closed' && (
                <button
                  type="button"
                  onClick={() => {
                    setClosedDisciplineTrade(activeTrade);
                    setShowDisciplineModal(true);
                  }}
                  className="w-full mt-2 py-2 px-3 rounded-xl border border-brand-gold/40 text-brand-gold bg-brand-gold/10 hover:bg-brand-gold/20 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <Heart className="w-3.5 h-3.5" />
                  <span>View Post-Trade Discipline & Calm-Down Tips</span>
                </button>
              )}
            </div>

            {/* Screenshots */}
            {activeTrade.screenshots && activeTrade.screenshots.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chart Screenshots</h4>
                <div className="grid grid-cols-2 gap-2">
                  {activeTrade.screenshots.map((s, idx) => (
                    <div key={idx} className="rounded-xl overflow-hidden border border-slate-800">
                      <img src={s.imageUrl} alt={s.screenshotType} className="w-full h-28 object-cover" />
                      <div className="p-1.5 bg-slate-950 text-[10px] text-slate-400">{s.screenshotType}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 flex gap-2">
              {activeTrade.status === 'Open' && (
                <button
                  onClick={() => {
                    setClosingTrade(activeTrade);
                    setCloseExitPrice('');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Close This Trade</span>
                </button>
              )}
              <button
                onClick={() => {
                  onEditTrade(activeTrade);
                  setActiveTrade(null);
                }}
                className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors"
              >
                Edit Trade
              </button>
              <button
                onClick={() => setActiveTrade(null)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK CLOSE TRADE MODAL */}
      {closingTrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-2xl bg-white dark:bg-brand-tealSurface border border-slate-200 dark:border-brand-tealBorder shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-brand-tealBorder">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-brand-goldLight flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-brand-gold" />
                  <span>Close Trade Manually</span>
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {closingTrade.symbol} • {closingTrade.direction} • {closingTrade.positionSize} Lots @ {closingTrade.entryPrice}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setClosingTrade(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-brand-tealHover"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickClose} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Exit Price (Realized Close Price) *
                </label>
                <input
                  type="number"
                  step="any"
                  autoFocus
                  required
                  placeholder={closingTrade.takeProfit ? String(closingTrade.takeProfit) : String(closingTrade.entryPrice)}
                  value={closeExitPrice}
                  onChange={(e) => setCloseExitPrice(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm font-mono font-bold rounded-xl border border-brand-tealBorder bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-gold"
                />
              </div>

              {/* Live Preview */}
              {parseFloat(closeExitPrice) > 0 && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-dark-bg/60 border border-slate-200 dark:border-brand-tealBorder text-xs font-mono space-y-1.5">
                  {(() => {
                    const xp = parseFloat(closeExitPrice) || 0;
                    const ep = closingTrade.entryPrice;
                    const lots = closingTrade.positionSize;
                    const cSize = closingTrade.contractSize || (closingTrade.symbol.includes('XAU') ? 100 : 100000);
                    const tVal = closingTrade.pipOrTickValue || (closingTrade.symbol.includes('XAU') ? 1 : 10);
                    const tickSize = closingTrade.symbol.includes('XAU') ? 0.01 : closingTrade.symbol.includes('JPY') ? 0.01 : 0.0001;
                    const pDiff = closingTrade.direction === 'BUY' ? xp - ep : ep - xp;
                    const gross = tickSize > 0 ? (pDiff / tickSize) * tVal * lots : pDiff * lots * cSize;
                    const isWin = gross >= 0;

                    return (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-sans">Estimated Realized P/L:</span>
                        <span className={`text-base font-bold ${isWin ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isWin ? '+' : ''}${Math.round(gross * 100) / 100}
                        </span>
                      </div>
                    );
                  })()}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setClosingTrade(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-brand-tealBorder text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={closeLoading || !parseFloat(closeExitPrice)}
                  className="px-5 py-2 rounded-xl bg-brand-gold hover:bg-brand-goldLight text-brand-tealDark font-bold text-xs shadow-md shadow-brand-gold/30 disabled:opacity-50 transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{closeLoading ? 'Closing Trade...' : 'Confirm & Close Trade'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Post-Trade Emotional Discipline Calm-Down & Victory Advisory Modal */}
      {closedDisciplineTrade && (
        <PostTradeDisciplineModal
          trade={closedDisciplineTrade}
          isOpen={showDisciplineModal}
          onClose={() => setShowDisciplineModal(false)}
          todayTradesCount={trades.filter((t) => t.tradeDate === closedDisciplineTrade.tradeDate).length}
        />
      )}

      {/* Telegram Bot Settings Modal */}
      <TelegramSettingsModal
        isOpen={telegramModalOpen}
        onClose={() => setTelegramModalOpen(false)}
      />
    </div>
  );
};
