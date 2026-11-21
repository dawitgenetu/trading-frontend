import React, { useState, useEffect } from 'react';
import {
  Save,
  ArrowLeft,
  AlertCircle,
  TrendingUp,
  DollarSign,
  ShieldAlert,
} from 'lucide-react';
import { useAccount } from '../context/AccountContext';
import { api } from '../services/api';
import type { Trade, Strategy, TradeDirection, TradeStatus, MarketType, TradingSession, Timeframe } from '../types';

interface AddTradePageProps {
  initialTrade?: Trade | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddTradePage: React.FC<AddTradePageProps> = ({ initialTrade, onSuccess, onCancel }) => {
  const { accounts, selectedAccount, formatCurrency } = useAccount();

  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Core Form State
  const [accountId, setAccountId] = useState<string>(initialTrade?.accountId || selectedAccount?.id || '');
  const [symbol, setSymbol] = useState<string>(initialTrade?.symbol || 'XAUUSD');
  const [marketType, setMarketType] = useState<MarketType>(initialTrade?.marketType || 'Commodities');
  const [direction, setDirection] = useState<TradeDirection>(initialTrade?.direction || 'BUY');
  const [status, setStatus] = useState<TradeStatus>(initialTrade?.status || 'Open');
  const [session, setSession] = useState<TradingSession>(initialTrade?.session || 'London');
  const [timeframe, setTimeframe] = useState<Timeframe>(initialTrade?.timeframe || 'M15');
  const [tradeDate, setTradeDate] = useState<string>(initialTrade?.tradeDate || new Date().toISOString().split('T')[0]);

  // Pricing & Lots
  const [entryPrice, setEntryPrice] = useState<string>(initialTrade?.entryPrice ? String(initialTrade.entryPrice) : '2700.00');
  const [stopLoss, setStopLoss] = useState<string>(initialTrade?.stopLoss ? String(initialTrade.stopLoss) : '2690.00');
  const [takeProfit, setTakeProfit] = useState<string>(initialTrade?.takeProfit ? String(initialTrade.takeProfit) : '2720.00');
  const [exitPrice, setExitPrice] = useState<string>(initialTrade?.exitPrice ? String(initialTrade.exitPrice) : '');
  const [positionSize, setPositionSize] = useState<string>(initialTrade?.positionSize ? String(initialTrade.positionSize) : '0.1');

  // Leverage & Specs
  const [leverage, setLeverage] = useState<number>(initialTrade?.leverage || 100);
  const [contractSize, setContractSize] = useState<string>(initialTrade?.contractSize ? String(initialTrade.contractSize) : '100');
  const [pipOrTickValue, setPipOrTickValue] = useState<string>(initialTrade?.pipOrTickValue ? String(initialTrade.pipOrTickValue) : '1');

  // Strategy & Notes
  const [strategyId, setStrategyId] = useState<string>(initialTrade?.strategyId || '');
  const [notes, setNotes] = useState<string>(initialTrade?.detailedNotes || initialTrade?.entryReason || '');

  // Live Calculations Preview
  const [liveCalc, setLiveCalc] = useState<{
    riskAmount: number;
    riskPercent: number;
    plannedReward: number;
    plannedRr: number;
    marginRequired: number;
    notionalValue: number;
    potentialPnl: number;
  }>({
    riskAmount: 0,
    riskPercent: 0,
    plannedReward: 0,
    plannedRr: 0,
    marginRequired: 0,
    notionalValue: 0,
    potentialPnl: 0,
  });

  // Auto-sync account when accounts are available
  useEffect(() => {
    if (!accountId) {
      if (selectedAccount?.id) {
        setAccountId(selectedAccount.id);
      } else if (accounts.length > 0) {
        setAccountId(accounts[0].id);
      }
    }
  }, [selectedAccount, accounts, accountId]);

  // Load Strategies
  useEffect(() => {
    api.getStrategies().then((res) => {
      setStrategies(res.strategies || []);
    }).catch(console.error);
  }, []);

  // Quick Preset Symbol Selector
  const selectInstrument = (sym: string, defEntry: string, defSl: string, defTp: string, defLots: string) => {
    const s = sym.toUpperCase().trim();
    setSymbol(s);
    setEntryPrice(defEntry);
    setStopLoss(defSl);
    setTakeProfit(defTp);
    setPositionSize(defLots);

    if (s === 'XAUUSD' || s === 'GOLD') {
      setMarketType('Commodities');
      setContractSize('100');
      setPipOrTickValue('1');
    } else if (s === 'BTCUSD' || s === 'ETHUSD') {
      setMarketType('Crypto');
      setContractSize('1');
      setPipOrTickValue('1');
    } else if (s === 'US30' || s === 'NAS100') {
      setMarketType('Indices');
      setContractSize('1');
      setPipOrTickValue('1');
    } else {
      setMarketType('Forex');
      setContractSize('100000');
      setPipOrTickValue('10');
    }
  };

  // Recalculate Live Metrics
  useEffect(() => {
    const ep = parseFloat(entryPrice) || 0;
    const sl = parseFloat(stopLoss) || 0;
    const tp = parseFloat(takeProfit) || 0;
    const xp = parseFloat(exitPrice) || 0;
    const lots = parseFloat(positionSize) || 0;
    const cSize = parseFloat(contractSize) || (symbol.includes('XAU') ? 100 : 100000);
    const tVal = parseFloat(pipOrTickValue) || (symbol.includes('XAU') ? 1 : 10);

    const currentAcc = accounts.find((a) => a.id === accountId) || selectedAccount;
    const balance = currentAcc?.currentBalance || 10000;

    let riskAmount = 0;
    let riskPercent = 0;
    let plannedReward = 0;
    let plannedRr = 0;
    let potentialPnl = 0;

    const tickSize = symbol.includes('XAU') ? 0.01 : symbol.includes('JPY') ? 0.01 : 0.0001;

    if (ep > 0 && sl > 0 && lots > 0) {
      const slDist = Math.abs(ep - sl);
      const lossPerLot = tickSize > 0 ? (slDist / tickSize) * tVal : slDist * cSize;
      riskAmount = lossPerLot * lots;
      riskPercent = balance > 0 ? (riskAmount / balance) * 100 : 0;

      if (tp > 0) {
        const tpDist = Math.abs(tp - ep);
        const rewardPerLot = tickSize > 0 ? (tpDist / tickSize) * tVal : tpDist * cSize;
        plannedReward = rewardPerLot * lots;
        plannedRr = slDist > 0 ? tpDist / slDist : 0;
      }
    }

    if (status === 'Closed' && ep > 0 && xp > 0 && lots > 0) {
      const pDiff = direction === 'BUY' ? xp - ep : ep - xp;
      potentialPnl = tickSize > 0 ? (pDiff / tickSize) * tVal * lots : pDiff * lots * cSize;
    }

    const notional = lots * cSize * ep;
    const marginReq = leverage > 0 ? notional / leverage : notional;

    setLiveCalc({
      riskAmount: Math.round(riskAmount * 100) / 100,
      riskPercent: Math.round(riskPercent * 100) / 100,
      plannedReward: Math.round(plannedReward * 100) / 100,
      plannedRr: Math.round(plannedRr * 100) / 100,
      marginRequired: Math.round(marginReq * 100) / 100,
      notionalValue: Math.round(notional * 100) / 100,
      potentialPnl: Math.round(potentialPnl * 100) / 100,
    });
  }, [entryPrice, stopLoss, takeProfit, exitPrice, positionSize, contractSize, pipOrTickValue, direction, status, accountId, symbol, leverage, accounts, selectedAccount]);

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const activeAccId = accountId || (accounts.length > 0 ? accounts[0].id : '');
    if (!activeAccId) {
      setErrorMsg('Please select or create a trading account first in Accounts.');
      return;
    }

    if (!symbol.trim()) {
      setErrorMsg('Please enter a valid symbol (e.g., XAUUSD, EURUSD, GBPUSD).');
      return;
    }

    const ep = parseFloat(entryPrice);
    if (!ep || ep <= 0) {
      setErrorMsg('Valid entry price is required.');
      return;
    }

    if (status === 'Closed') {
      const xp = parseFloat(exitPrice);
      if (!xp || xp <= 0) {
        setErrorMsg('Exit price is required for closed trades.');
        return;
      }
    }

    try {
      setLoading(true);

      const tradePayload: Partial<Trade> = {
        accountId: activeAccId,
        symbol: symbol.toUpperCase().trim(),
        marketType,
        direction,
        session,
        timeframe,
        status,
        tradeDate,
        entryTime: new Date().toISOString(),
        exitTime: status === 'Closed' ? new Date().toISOString() : null,
        entryPrice: ep,
        stopLoss: stopLoss ? parseFloat(stopLoss) : null,
        takeProfit: takeProfit ? parseFloat(takeProfit) : null,
        exitPrice: status === 'Closed' && exitPrice ? parseFloat(exitPrice) : null,
        positionSize: parseFloat(positionSize) || 0.1,
        contractSize: parseFloat(contractSize) || (symbol.includes('XAU') ? 100 : 100000),
        pipOrTickValue: parseFloat(pipOrTickValue) || (symbol.includes('XAU') ? 1 : 10),
        strategyId: strategyId || null,
        detailedNotes: notes,
        entryReason: notes,
        leverage: leverage || 100,
        marginRequired: liveCalc.marginRequired,
      };

      if (initialTrade?.id) {
        await api.updateTrade(initialTrade.id, tradePayload);
      } else {
        await api.createTrade(tradePayload);
      }

      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save trade. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-display font-bold tracking-tight text-slate-900 dark:text-brand-goldLight">
              {initialTrade ? 'Edit Trade' : 'Record New Trade'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Rapid manual trade entry with live pip, risk, & margin valuation
            </p>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Account Warning if no accounts exist */}
      {accounts.length === 0 && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs flex items-center justify-between">
          <span>⚠️ No trading account found. Please create an account in the Accounts tab before recording trades.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* CARD 1: SETUP & DIRECTION */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-brand-tealBorder bg-white dark:bg-brand-tealSurface shadow-md space-y-4">
          <h2 className="text-xs font-bold text-brand-gold uppercase tracking-wider">
            1. Trade Setup
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Account */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Trading Account *
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-brand-tealBorder bg-slate-50 dark:bg-dark-bg/80 text-slate-900 dark:text-white focus:outline-none focus:border-brand-gold"
                required
              >
                {accounts.length === 0 ? (
                  <option value="" disabled>No accounts found</option>
                ) : (
                  accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({formatCurrency(a.currentBalance, a.currency)})
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Symbol with 1-click presets */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Symbol *
                </label>
                <div className="flex gap-1.5 text-[10px]">
                  <button
                    type="button"
                    onClick={() => selectInstrument('XAUUSD', '2700.00', '2690.00', '2720.00', '0.10')}
                    className={`px-2.5 py-0.5 rounded-lg font-bold transition-all ${
                      symbol === 'XAUUSD'
                        ? 'bg-brand-gold text-brand-tealDark shadow-sm shadow-brand-gold/25'
                        : 'bg-brand-gold/15 text-brand-gold border border-brand-gold/30 hover:bg-brand-gold/25'
                    }`}
                  >
                    Gold
                  </button>
                  <button
                    type="button"
                    onClick={() => selectInstrument('EURUSD', '1.08500', '1.08200', '1.09100', '0.50')}
                    className={`px-2.5 py-0.5 rounded-lg font-bold transition-all ${
                      symbol === 'EURUSD'
                        ? 'bg-brand-gold text-brand-tealDark shadow-sm shadow-brand-gold/25'
                        : 'bg-brand-gold/15 text-brand-gold border border-brand-gold/30 hover:bg-brand-gold/25'
                    }`}
                  >
                    EURUSD
                  </button>
                  <button
                    type="button"
                    onClick={() => selectInstrument('GBPUSD', '1.29500', '1.29100', '1.30300', '0.50')}
                    className={`px-2.5 py-0.5 rounded-lg font-bold transition-all ${
                      symbol === 'GBPUSD'
                        ? 'bg-brand-gold text-brand-tealDark shadow-sm shadow-brand-gold/25'
                        : 'bg-brand-gold/15 text-brand-gold border border-brand-gold/30 hover:bg-brand-gold/25'
                    }`}
                  >
                    GBPUSD
                  </button>
                </div>
              </div>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="e.g. XAUUSD, EURUSD"
                className="w-full px-3 py-2 text-xs font-mono font-bold uppercase rounded-xl border border-slate-200 dark:border-brand-tealBorder bg-slate-50 dark:bg-dark-bg/80 text-slate-900 dark:text-white focus:outline-none focus:border-brand-gold"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
            {/* Direction BUY / SELL */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Direction *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDirection('BUY')}
                  className={`py-2 text-xs font-bold rounded-xl transition-all ${
                    direction === 'BUY'
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                      : 'bg-slate-100 dark:bg-dark-bg/80 border border-slate-200 dark:border-brand-tealBorder text-slate-400 hover:text-emerald-400'
                  }`}
                >
                  BUY / LONG
                </button>
                <button
                  type="button"
                  onClick={() => setDirection('SELL')}
                  className={`py-2 text-xs font-bold rounded-xl transition-all ${
                    direction === 'SELL'
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25'
                      : 'bg-slate-100 dark:bg-dark-bg/80 border border-slate-200 dark:border-brand-tealBorder text-slate-400 hover:text-rose-400'
                  }`}
                >
                  SELL / SHORT
                </button>
              </div>
            </div>

            {/* Status (Open / Closed) */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Trade Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TradeStatus)}
                className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-brand-tealBorder bg-slate-50 dark:bg-dark-bg/80 text-slate-900 dark:text-white focus:outline-none focus:border-brand-gold"
              >
                <option value="Open">Open (Active)</option>
                <option value="Closed">Closed (Realized)</option>
                <option value="Planned">Planned</option>
              </select>
            </div>

            {/* Trade Date */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Date
              </label>
              <input
                type="date"
                value={tradeDate}
                onChange={(e) => setTradeDate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* CARD 2: PRICES, POSITION SIZE & LEVERAGE */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-card shadow-sm space-y-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            2. Prices, Lots & Leverage
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Entry Price *
              </label>
              <input
                type="number"
                step="any"
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
                placeholder="2700.00"
                className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-red-500 mb-1">
                Stop Loss (SL)
              </label>
              <input
                type="number"
                step="any"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
                placeholder="2690.00"
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-red-500/30 bg-red-500/5 text-slate-900 dark:text-white focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-emerald-500 mb-1">
                Take Profit (TP)
              </label>
              <input
                type="number"
                step="any"
                value={takeProfit}
                onChange={(e) => setTakeProfit(e.target.value)}
                placeholder="2720.00"
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-slate-900 dark:text-white focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Lot Size *
              </label>
              <input
                type="number"
                step="0.01"
                value={positionSize}
                onChange={(e) => setPositionSize(e.target.value)}
                placeholder="0.10"
                className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white focus:border-indigo-500"
                required
              />
            </div>
          </div>

          {/* Exit Price if Closed */}
          {status === 'Closed' && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80">
              <div className="sm:w-1/2">
                <label className="block text-xs font-medium text-indigo-400 mb-1">
                  Exit Price (Realized Close) *
                </label>
                <input
                  type="number"
                  step="any"
                  value={exitPrice}
                  onChange={(e) => setExitPrice(e.target.value)}
                  placeholder="Exit price when trade closed"
                  className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-indigo-500/40 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  required={status === 'Closed'}
                />
              </div>
            </div>
          )}

          {/* Leverage Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Leverage
              </label>
              <span className="text-[11px] font-mono text-indigo-400">
                Selected: 1:{leverage}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[30, 50, 100, 200, 500, 1000].map((lev) => (
                <button
                  key={lev}
                  type="button"
                  onClick={() => setLeverage(lev)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                    leverage === lev
                      ? 'bg-brand-gold text-brand-tealDark shadow-md shadow-brand-gold/25'
                      : 'bg-slate-100 dark:bg-dark-bg/80 border border-slate-200 dark:border-brand-tealBorder text-slate-600 dark:text-slate-300 hover:border-brand-gold/40'
                  }`}
                >
                  1:{lev}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CARD 3: STRATEGY & NOTES (OPTIONAL) */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-brand-tealBorder bg-white dark:bg-brand-tealSurface shadow-md space-y-4">
          <h2 className="text-xs font-bold text-brand-gold uppercase tracking-wider">
            3. Strategy & Notes (Optional)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Strategy
              </label>
              <select
                value={strategyId}
                onChange={(e) => setStrategyId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-brand-tealBorder bg-slate-50 dark:bg-dark-bg/80 text-slate-900 dark:text-white focus:outline-none focus:border-brand-gold"
              >
                <option value="">No Strategy Selected</option>
                {strategies.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Session
              </label>
              <select
                value={session}
                onChange={(e) => setSession(e.target.value as TradingSession)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-brand-tealBorder bg-slate-50 dark:bg-dark-bg/80 text-slate-900 dark:text-white focus:outline-none focus:border-brand-gold"
              >
                <option value="London">London</option>
                <option value="New York">New York</option>
                <option value="Asian">Asian</option>
                <option value="Sydney">Sydney</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Timeframe
              </label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as Timeframe)}
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-brand-tealBorder bg-slate-50 dark:bg-dark-bg/80 text-slate-900 dark:text-white focus:outline-none focus:border-brand-gold"
              >
                <option value="M1">M1</option>
                <option value="M5">M5</option>
                <option value="M15">M15</option>
                <option value="M30">M30</option>
                <option value="H1">H1</option>
                <option value="H4">H4</option>
                <option value="D1">D1</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Trade Notes & Reason
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Key notes, setup reason, or entry thoughts..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-brand-tealBorder bg-slate-50 dark:bg-dark-bg/80 text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-gold"
            />
          </div>
        </div>

        {/* LIVE CALCULATION METRICS BAR */}
        {parseFloat(entryPrice) > 0 && parseFloat(stopLoss) > 0 && (
          <div className="p-4 rounded-2xl bg-brand-tealSurface border border-brand-tealBorder space-y-2 font-mono shadow-md">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-sans font-semibold">Risk Amount</span>
                <span className="font-bold text-rose-400 text-sm sm:text-base">
                  -${liveCalc.riskAmount} ({liveCalc.riskPercent}%)
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-sans font-semibold">Planned Reward</span>
                <span className="font-bold text-emerald-400 text-sm sm:text-base">
                  +${liveCalc.plannedReward}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-sans font-semibold">Risk / Reward</span>
                <span className="font-bold text-brand-gold text-sm sm:text-base">
                  {liveCalc.plannedRr}R
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-sans font-semibold">Required Margin</span>
                <span className="font-bold text-brand-goldLight text-sm sm:text-base">
                  ${liveCalc.marginRequired} <span className="text-[10px] text-slate-400 font-normal">@ 1:{leverage}</span>
                </span>
              </div>
            </div>

            {status === 'Closed' && parseFloat(exitPrice) > 0 && (
              <div className="pt-2 border-t border-brand-tealBorder flex items-center justify-between text-xs">
                <span className="text-slate-300 font-sans">Net Realized Result:</span>
                <span className={`text-base font-bold ${liveCalc.potentialPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {liveCalc.potentialPnl >= 0 ? '+' : ''}${liveCalc.potentialPnl}
                </span>
              </div>
            )}
          </div>
        )}

        {/* SUBMIT BUTTONS */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-brand-tealBorder text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-brand-tealHover transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-gold hover:bg-brand-goldLight text-brand-tealDark font-bold text-xs sm:text-sm shadow-lg shadow-brand-gold/25 transition-all disabled:opacity-50 active:scale-95"
          >
            <Save className="w-4 h-4 stroke-[2.5]" />
            <span>{loading ? 'Saving Trade...' : initialTrade ? 'Save Changes' : 'Record Trade'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
