import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Zap,
  X,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  DollarSign,
  Layers,
} from 'lucide-react';
import { api } from '../../services/api';
import type { TradeDirection } from '../../types';

interface ExnessTradeExecutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (ticket: string) => void;
  accountNumber?: string;
  server?: string;
}

const COMMON_INSTRUMENTS = [
  { symbol: 'EURUSD', name: 'Euro / US Dollar', defaultSl: 20, defaultTp: 40 },
  { symbol: 'GBPUSD', name: 'Great Britain Pound', defaultSl: 25, defaultTp: 50 },
  { symbol: 'XAUUSD', name: 'Gold / US Dollar', defaultSl: 300, defaultTp: 600 },
  { symbol: 'USDJPY', name: 'US Dollar / Yen', defaultSl: 25, defaultTp: 50 },
  { symbol: 'BTCUSD', name: 'Bitcoin / US Dollar', defaultSl: 500, defaultTp: 1000 },
  { symbol: 'US30', name: 'Dow Jones Index', defaultSl: 50, defaultTp: 100 },
  { symbol: 'NAS100', name: 'Nasdaq 100 Index', defaultSl: 40, defaultTp: 80 },
];

export const ExnessTradeExecutionModal: React.FC<ExnessTradeExecutionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  accountNumber,
  server,
}) => {
  const [symbol, setSymbol] = useState('EURUSD');
  const [direction, setDirection] = useState<TradeDirection>('BUY');
  const [volume, setVolume] = useState('0.10');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT' | 'STOP'>('MARKET');
  const [confirmed, setConfirmed] = useState(false);

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleExecute = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    const lots = parseFloat(volume);
    if (!lots || lots <= 0) {
      setStatusMsg({ type: 'error', text: 'Please enter a valid lot size greater than 0.' });
      return;
    }

    if (!confirmed) {
      setStatusMsg({ type: 'error', text: 'Please check the confirmation box to authorize live trade execution.' });
      return;
    }

    try {
      setLoading(true);
      const res = await api.executeExnessOrder({
        symbol,
        direction,
        volume: lots,
        orderType,
        stopLoss: stopLoss ? parseFloat(stopLoss) : null,
        takeProfit: takeProfit ? parseFloat(takeProfit) : null,
      });

      if (res.success) {
        setStatusMsg({
          type: 'success',
          text: `Executed! ${direction} ${lots} lot(s) ${symbol}. Ticket #${res.ticket}`,
        });
        if (onSuccess && res.ticket) onSuccess(res.ticket);
        setTimeout(() => {
          onClose();
        }, 1800);
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Exness execution failed.' });
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in font-mono">
      <div className="relative w-full max-w-lg p-6 sm:p-7 rounded-3xl border border-brand-tealBorder bg-brand-tealSurface/98 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-brand-tealHover transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-brand-gold/15 text-brand-gold border border-brand-gold/30 shadow-lg shadow-brand-gold/10">
            <Zap className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white">Execute Exness Trade</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-gold/20 text-brand-gold border border-brand-gold/30">
                Direct Execution
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live automated execution on Exness #{accountNumber || 'Connected'} ({server || 'Real'})
            </p>
          </div>
        </div>

        {/* Status Feedback */}
        {statusMsg && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
              statusMsg.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
            }`}
          >
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleExecute} className="space-y-4">
          {/* Direction Toggle (BUY vs SELL) */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setDirection('BUY')}
              className={`py-3 rounded-2xl text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 border ${
                direction === 'BUY'
                  ? 'bg-emerald-500 text-brand-tealDark font-extrabold border-emerald-400 shadow-lg shadow-emerald-500/25 scale-[1.02]'
                  : 'bg-dark-bg/80 text-slate-400 border-brand-tealBorder hover:text-emerald-400'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>BUY / LONG</span>
            </button>

            <button
              type="button"
              onClick={() => setDirection('SELL')}
              className={`py-3 rounded-2xl text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 border ${
                direction === 'SELL'
                  ? 'bg-rose-500 text-white font-extrabold border-rose-400 shadow-lg shadow-rose-500/25 scale-[1.02]'
                  : 'bg-dark-bg/80 text-slate-400 border-brand-tealBorder hover:text-rose-400'
              }`}
            >
              <TrendingDown className="w-4 h-4" />
              <span>SELL / SHORT</span>
            </button>
          </div>

          {/* Symbol Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Trading Instrument / Symbol
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-2">
              {COMMON_INSTRUMENTS.map((inst) => (
                <button
                  key={inst.symbol}
                  type="button"
                  onClick={() => setSymbol(inst.symbol)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                    symbol === inst.symbol
                      ? 'bg-brand-gold text-brand-tealDark border-brand-gold shadow-sm'
                      : 'bg-dark-bg border-brand-tealBorder text-slate-400 hover:text-white'
                  }`}
                >
                  {inst.symbol}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="Or enter custom symbol (e.g. AUDUSD, ETHUSD)"
              className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-brand-tealBorder bg-dark-bg/90 text-white uppercase focus:outline-none focus:border-brand-gold"
            />
          </div>

          {/* Lot Size */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Position Size (Lots)
            </label>
            <div className="flex items-center gap-2">
              {['0.01', '0.05', '0.10', '0.25', '0.50', '1.00'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setVolume(preset)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                    volume === preset
                      ? 'bg-brand-gold/20 text-brand-gold border-brand-gold'
                      : 'bg-dark-bg border-brand-tealBorder text-slate-400'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
            <input
              type="number"
              step="0.01"
              required
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
              className="w-full mt-2 px-3.5 py-2.5 text-xs font-mono font-bold rounded-xl border border-brand-tealBorder bg-dark-bg/90 text-white focus:outline-none focus:border-brand-gold"
            />
          </div>

          {/* SL & TP */}
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-rose-400 mb-1">
                Stop Loss Price (Optional)
              </label>
              <input
                type="number"
                step="any"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
                placeholder="e.g. 1.08200"
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-rose-500/30 bg-dark-bg/90 text-white placeholder-slate-600 focus:outline-none focus:border-rose-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-400 mb-1">
                Take Profit Price (Optional)
              </label>
              <input
                type="number"
                step="any"
                value={takeProfit}
                onChange={(e) => setTakeProfit(e.target.value)}
                placeholder="e.g. 1.09200"
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-emerald-500/30 bg-dark-bg/90 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          {/* Confirmation Checkbox */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-300">
            <input
              type="checkbox"
              id="confirmTrade"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-brand-gold focus:ring-0 bg-dark-bg border-brand-tealBorder cursor-pointer"
            />
            <label htmlFor="confirmTrade" className="cursor-pointer text-[11px] leading-relaxed select-none">
              I authorize immediate execution of this <b>{direction} {volume} Lot(s) {symbol}</b> order on my connected Exness account.
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !confirmed}
            className={`w-full py-3.5 rounded-2xl font-bold text-xs sm:text-sm font-mono transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-40 ${
              direction === 'BUY'
                ? 'bg-emerald-500 hover:bg-emerald-400 text-brand-tealDark shadow-emerald-500/20'
                : 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20'
            }`}
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 fill-current" />
            )}
            <span>
              {loading
                ? 'Routing order to Exness...'
                : `Send ${direction} Order (${volume} Lots ${symbol})`}
            </span>
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
};
