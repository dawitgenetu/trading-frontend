import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Heart,
  ShieldAlert,
  Sparkles,
  X,
  Volume2,
  Check,
  Pause,
  Play,
  RotateCcw,
} from 'lucide-react';
import type { Trade } from '../../types';

interface PostTradeDisciplineModalProps {
  trade: Trade;
  isOpen: boolean;
  onClose: () => void;
  todayTradesCount?: number;
}

export const PostTradeDisciplineModal: React.FC<PostTradeDisciplineModalProps> = ({
  trade,
  isOpen,
  onClose,
  todayTradesCount = 1,
}) => {
  const isLoss = trade.netPnl < 0;
  const pnlAmount = Math.abs(trade.netPnl || 0);

  // 30-Minute Cooldown Timer (1800 seconds)
  const [timerSeconds, setTimerSeconds] = useState(1800);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  if (!isOpen) return null;

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-mono">
      <div className="relative w-full max-w-lg p-6 sm:p-7 rounded-3xl border border-brand-tealBorder bg-brand-tealSurface/98 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-brand-tealHover transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge & Title */}
        <div className="space-y-2 text-center pt-2">
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
              isLoss
                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
            }`}
          >
            {isLoss ? (
              <>
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Emotional Discipline Advisory</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Victory Discipline Check</span>
              </>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {isLoss ? 'Calm Down • Do Not Revenge Trade' : 'Great Win • Avoid The Euphoria Trap'}
          </h2>

          <div
            className={`text-2xl sm:text-3xl font-extrabold font-mono ${
              isLoss ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {isLoss ? `-$${pnlAmount.toFixed(2)}` : `+$${pnlAmount.toFixed(2)}`}
            {trade.actualRMultiple ? (
              <span className="text-xs ml-2 opacity-80">
                ({trade.actualRMultiple >= 0 ? '+' : ''}{trade.actualRMultiple}R)
              </span>
            ) : null}
          </div>
        </div>

        {/* Daily Trade Rule Alert */}
        <div className="p-3.5 rounded-2xl bg-dark-bg/80 border border-brand-tealBorder text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-300">
            <Clock className="w-4 h-4 text-brand-gold" />
            <span>Today's Trades: <b>{todayTradesCount}/2 Allowed</b></span>
          </div>
          {todayTradesCount >= 2 ? (
            <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30">
              ⛔ Daily Limit Reached
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md bg-brand-gold/20 text-brand-gold font-bold">
              1 Trade Remaining
            </span>
          )}
        </div>

        {/* Psychology Guidance Cards */}
        <div className="space-y-3">
          {isLoss ? (
            <>
              <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/40 space-y-1">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                  <span>1. Breathe & Disconnect from the Charts</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pl-6">
                  A loss is just a business expense. Do not enter the market looking to get your money back. The market is neutral and does not owe you anything.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-900/40 space-y-1">
                <div className="flex items-center gap-2 text-brand-gold font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>2. Zero Revenge Trades</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pl-6">
                  92% of blown accounts happen within 60 minutes of taking an emotional loss. Close your broker app right now.
                </p>
              </div>

              {/* 30-Minute Cooldown Timer */}
              <div className="p-4 rounded-2xl bg-dark-bg/90 border border-brand-tealBorder text-center space-y-2">
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                  Mandatory Screen Cooldown Timer
                </div>
                <div className="text-3xl font-extrabold font-mono text-brand-gold tracking-wider">
                  {formatTimer(timerSeconds)}
                </div>
                <div className="flex justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setTimerRunning(!timerRunning)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-gold text-brand-tealDark text-xs font-bold shadow-md hover:bg-brand-goldLight transition-all"
                  >
                    {timerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{timerRunning ? 'Pause Cooldown' : 'Start 30-Min Cooldown'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTimerRunning(false);
                      setTimerSeconds(1800);
                    }}
                    className="p-1.5 rounded-xl border border-brand-tealBorder text-slate-400 hover:text-white"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-900/40 space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <Sparkles className="w-4 h-4 flex-shrink-0" />
                  <span>1. Respect the Discipline, Not Just the Profit</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pl-6">
                  Good job executing your strategy. Take credit for following rules, not just the financial outcome.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-brand-gold/10 border border-brand-gold/25 space-y-1">
                <div className="flex items-center gap-2 text-brand-gold font-bold text-xs">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                  <span>2. Do NOT Increase Position Size</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pl-6">
                  Winning creates dopamine that leads to reckless greed. Keep your position sizing identical on the next trade.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-dark-bg/80 border border-brand-tealBorder space-y-1">
                <div className="flex items-center gap-2 text-slate-200 font-bold text-xs">
                  <Clock className="w-4 h-4 text-brand-gold flex-shrink-0" />
                  <span>3. Consider Locking in Your Daily Win</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed pl-6">
                  Walking away green is the ultimate edge. Most traders give back morning gains in the afternoon session.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-brand-gold hover:bg-brand-goldLight text-brand-tealDark font-bold text-xs sm:text-sm shadow-lg shadow-brand-gold/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4 stroke-[2.5]" />
          <span>I Understand & I Am In Full Emotional Control</span>
        </button>
      </div>
    </div>
  );
};
