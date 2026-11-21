import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Calculator,
  AlertTriangle,
  Save,
  CheckCircle2,
  DollarSign,
  Percent,
  Sliders,
  Scale,
} from 'lucide-react';
import { useAccount } from '../context/AccountContext';
import { api } from '../services/api';
import type { RiskSettings } from '../types';

export const RiskCenterPage: React.FC = () => {
  const { selectedAccount, formatCurrency } = useAccount();

  // Calculator Inputs
  const [balanceInput, setBalanceInput] = useState<string>('10000');
  const [riskPercent, setRiskPercent] = useState<number>(1.0);
  const [customRisk, setCustomRisk] = useState<string>('');
  const [leverage, setLeverage] = useState<number>(100);
  const [customLeverage, setCustomLeverage] = useState<string>('');
  const [entryPrice, setEntryPrice] = useState<string>('1.08500');
  const [stopLoss, setStopLoss] = useState<string>('1.08300');
  const [takeProfit, setTakeProfit] = useState<string>('1.09100');
  const [symbol, setSymbol] = useState<string>('EURUSD');

  const [calcResult, setCalcResult] = useState<any>(null);
  const [calcLoading, setCalcLoading] = useState(false);

  // Advisory Settings
  const [settings, setSettings] = useState<RiskSettings>({
    userId: '',
    maxDailyLoss: 500,
    maxWeeklyLoss: 1500,
    maxAccountDrawdownPct: 5,
    maxTradesPerDay: 5,
    maxConsecutiveLosses: 3,
    defaultRiskPercentage: 1.0,
  });

  const [status, setStatus] = useState<any>(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (selectedAccount) {
      setBalanceInput(String(selectedAccount.currentBalance));
    }
  }, [selectedAccount]);

  const loadRiskData = async () => {
    try {
      const [resSettings, resStatus] = await Promise.all([
        api.getRiskSettings(selectedAccount?.id),
        api.getRiskStatus(selectedAccount?.id),
      ]);

      if (resSettings.settings) setSettings(resSettings.settings);
      if (resStatus.status) setStatus(resStatus.status);
    } catch (err) {
      console.error('Failed to load risk settings:', err);
    }
  };

  useEffect(() => {
    loadRiskData();
  }, [selectedAccount?.id]);

  // Recalculate position size & required margin
  useEffect(() => {
    const ep = parseFloat(entryPrice) || 0;
    const sl = parseFloat(stopLoss) || 0;
    const tp = parseFloat(takeProfit) || 0;
    const bal = parseFloat(balanceInput) || 10000;
    const activeRisk = customRisk ? parseFloat(customRisk) || 1.0 : riskPercent;
    const activeLev = customLeverage ? parseFloat(customLeverage) || 100 : leverage;

    if (ep > 0 && sl > 0) {
      api
        .calculateRisk({
          accountBalance: bal,
          riskPercentage: activeRisk,
          entryPrice: ep,
          stopLossPrice: sl,
          takeProfitPrice: tp > 0 ? tp : null,
          symbol,
          leverage: activeLev,
        })
        .then((res) => setCalcResult(res.result))
        .catch(console.error);
    }
  }, [balanceInput, riskPercent, customRisk, entryPrice, stopLoss, takeProfit, symbol, leverage, customLeverage]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      await api.updateRiskSettings({
        ...settings,
        accountId: selectedAccount?.id || null,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      await loadRiskData();
    } catch (err) {
      alert('Failed to save risk settings');
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-slate-900 dark:text-brand-goldLight">
          Risk Management Center
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Position sizing calculator, broker-neutral contract modeling, and advisory discipline limits
        </p>
      </div>

      {/* Advisory Status Alert Banner if breaches exist */}
      {status?.hasBreaches && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <span>Active Risk Breaches Warning:</span>
          </div>
          <div className="space-y-1 text-xs">
            {status.warnings.map((w: any, i: number) => (
              <p key={i} className="pl-7">
                • {w.message}
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Position Sizing Calculator (7 cols) */}
        <div className="lg:col-span-7 p-5 rounded-2xl border border-slate-200 dark:border-brand-tealBorder bg-white dark:bg-brand-tealSurface shadow-md space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-brand-gold" />
              <h2 className="text-base font-bold text-slate-900 dark:text-brand-goldLight">
                Advanced Position Sizing Calculator
              </h2>
            </div>
            <span className="text-[11px] font-mono text-brand-gold">Precision Math</span>
          </div>

          <div className="space-y-4">
            {/* Quick Instrument Presets */}
            <div>
              <span className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                Quick Instrument Select
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSymbol('XAUUSD');
                    setEntryPrice('2700.00');
                    setStopLoss('2690.00');
                    setTakeProfit('2720.00');
                  }}
                  className={`px-3 py-2 text-xs font-bold rounded-xl border text-center transition-all ${
                    symbol === 'XAUUSD'
                      ? 'border-brand-gold bg-brand-gold text-brand-tealDark shadow-md shadow-brand-gold/20'
                      : 'border-slate-200 dark:border-brand-tealBorder bg-slate-50 dark:bg-dark-bg/60 text-slate-600 dark:text-slate-300 hover:border-brand-gold/50'
                  }`}
                >
                  <span className="block font-mono">XAUUSD</span>
                  <span className={`text-[10px] font-normal ${symbol === 'XAUUSD' ? 'text-brand-tealDark/80' : 'text-slate-400'}`}>Gold (100oz)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSymbol('EURUSD');
                    setEntryPrice('1.08500');
                    setStopLoss('1.08200');
                    setTakeProfit('1.09100');
                  }}
                  className={`px-3 py-2 text-xs font-bold rounded-xl border text-center transition-all ${
                    symbol === 'EURUSD'
                      ? 'border-brand-gold bg-brand-gold text-brand-tealDark shadow-md shadow-brand-gold/20'
                      : 'border-slate-200 dark:border-brand-tealBorder bg-slate-50 dark:bg-dark-bg/60 text-slate-600 dark:text-slate-300 hover:border-brand-gold/50'
                  }`}
                >
                  <span className="block font-mono">EURUSD</span>
                  <span className={`text-[10px] font-normal ${symbol === 'EURUSD' ? 'text-brand-tealDark/80' : 'text-slate-400'}`}>Forex (100k)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSymbol('GBPUSD');
                    setEntryPrice('1.29500');
                    setStopLoss('1.29100');
                    setTakeProfit('1.30300');
                  }}
                  className={`px-3 py-2 text-xs font-bold rounded-xl border text-center transition-all ${
                    symbol === 'GBPUSD'
                      ? 'border-brand-gold bg-brand-gold text-brand-tealDark shadow-md shadow-brand-gold/20'
                      : 'border-slate-200 dark:border-brand-tealBorder bg-slate-50 dark:bg-dark-bg/60 text-slate-600 dark:text-slate-300 hover:border-brand-gold/50'
                  }`}
                >
                  <span className="block font-mono">GBPUSD</span>
                  <span className={`text-[10px] font-normal ${symbol === 'GBPUSD' ? 'text-brand-tealDark/80' : 'text-slate-400'}`}>Cable (100k)</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Account Balance ($)
                </label>
                <input
                  type="number"
                  step="any"
                  value={balanceInput}
                  onChange={(e) => setBalanceInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Instrument / Symbol
                </label>
                <select
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white"
                >
                  <option value="EURUSD">EURUSD (Forex - 100k)</option>
                  <option value="GBPUSD">GBPUSD (Forex - 100k)</option>
                  <option value="XAUUSD">XAUUSD (Gold - 100oz)</option>
                  <option value="USDJPY">USDJPY (Forex - 100k)</option>
                  <option value="BTCUSD">BTCUSD (Crypto - 1 BTC)</option>
                  <option value="US30">US30 (Dow Jones)</option>
                  <option value="NAS100">NAS100 (Nasdaq)</option>
                </select>
              </div>
            </div>

            {/* Leverage Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Account Leverage
                </label>
                <span className="text-[11px] font-mono text-indigo-400">
                  Active: 1:{customLeverage || leverage}
                </span>
              </div>
              <div className="flex gap-2">
                {[30, 50, 100, 200, 500, 1000].map((lev) => (
                  <button
                    key={lev}
                    type="button"
                    onClick={() => {
                      setLeverage(lev);
                      setCustomLeverage('');
                    }}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold font-mono transition-all ${
                      leverage === lev && !customLeverage
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    1:{lev}
                  </button>
                ))}
                <div className="w-24">
                  <input
                    type="number"
                    placeholder="Custom"
                    value={customLeverage}
                    onChange={(e) => setCustomLeverage(e.target.value)}
                    className={`w-full px-2 py-1.5 text-xs font-mono rounded-xl border text-center ${
                      customLeverage ? 'border-indigo-500 bg-indigo-500/10 text-white font-bold' : 'border-slate-700 bg-slate-800'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Risk Presets */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">
                Risk Percentage
              </label>
              <div className="flex gap-2">
                {[0.25, 0.5, 1.0, 2.0].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setRiskPercent(preset);
                      setCustomRisk('');
                    }}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold font-mono transition-all ${
                      riskPercent === preset && !customRisk
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {preset}%
                  </button>
                ))}
                <div className="w-24">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Custom %"
                    value={customRisk}
                    onChange={(e) => setCustomRisk(e.target.value)}
                    className={`w-full px-2 py-1.5 text-xs font-mono rounded-xl border text-center ${
                      customRisk ? 'border-indigo-500 bg-indigo-500/10 text-white font-bold' : 'border-slate-700 bg-slate-800'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Prices */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Entry Price
                </label>
                <input
                  type="number"
                  step="any"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-red-500 mb-1">Stop Loss</label>
                <input
                  type="number"
                  step="any"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-red-500/30 bg-red-500/5 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-emerald-500 mb-1">Take Profit</label>
                <input
                  type="number"
                  step="any"
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Calculation Output Box */}
          {calcResult && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3 font-mono">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-xs font-bold text-slate-400 font-sans block">RECOMMENDED LOT SIZE</span>
                  <span className="text-2xl font-bold text-indigo-400">
                    {calcResult.recommendedPositionSize} Lots
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-400 font-sans block">REQUIRED MARGIN (1:{calcResult.leverage})</span>
                  <span className={`text-xl font-bold ${calcResult.marginRequired > (parseFloat(balanceInput) || 0) ? 'text-red-400' : 'text-emerald-400'}`}>
                    ${calcResult.marginRequired}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block">Risk in Currency:</span>
                  <span className="text-red-500 font-bold">${calcResult.riskAmountCurrency}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Potential Profit:</span>
                  <span className="text-emerald-500 font-bold">
                    {calcResult.potentialProfitCurrency ? `+$${calcResult.potentialProfitCurrency}` : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Planned R:R:</span>
                  <span className="text-indigo-400 font-bold">
                    {calcResult.plannedRiskRewardRatio ? `${calcResult.plannedRiskRewardRatio}R` : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">SL Distance:</span>
                  <span className="text-slate-300 font-bold">{calcResult.pipOrPointDistance} Pips/Points</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Loss Per 1.0 Lot:</span>
                  <span className="text-slate-300 font-bold">${calcResult.dollarLossPerLot}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Notional Value:</span>
                  <span className="text-slate-300 font-bold">${calcResult.notionalValue}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Free Margin After:</span>
                  <span className={`font-bold ${calcResult.freeMarginAfterTrade < 0 ? 'text-red-400' : 'text-slate-300'}`}>
                    ${calcResult.freeMarginAfterTrade}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Effective Leverage:</span>
                  <span className="text-indigo-400 font-bold">1:{calcResult.leverage}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Instrument Spec:</span>
                  <span className="text-slate-400 font-bold">{symbol}</span>
                </div>
              </div>

              {calcResult.warnings?.length > 0 && (
                <div className="pt-2 text-[11px] text-amber-400 space-y-1 font-sans">
                  {calcResult.warnings.map((w: string, i: number) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT: Advisory Risk Settings (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-card shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-500" />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Advisory Risk Rules</h2>
              <p className="text-[11px] text-slate-500">Self-imposed journal controls and warning thresholds</p>
            </div>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">
                Max Daily Loss Limit ($)
              </label>
              <input
                type="number"
                value={settings.maxDailyLoss}
                onChange={(e) => setSettings({ ...settings, maxDailyLoss: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">
                Max Weekly Loss Limit ($)
              </label>
              <input
                type="number"
                value={settings.maxWeeklyLoss}
                onChange={(e) => setSettings({ ...settings, maxWeeklyLoss: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">
                Max Account Drawdown Limit (%)
              </label>
              <input
                type="number"
                step="0.5"
                value={settings.maxAccountDrawdownPct}
                onChange={(e) => setSettings({ ...settings, maxAccountDrawdownPct: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">
                  Max Trades / Day
                </label>
                <input
                  type="number"
                  value={settings.maxTradesPerDay}
                  onChange={(e) => setSettings({ ...settings, maxTradesPerDay: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">
                  Max Consecutive Losses
                </label>
                <input
                  type="number"
                  value={settings.maxConsecutiveLosses}
                  onChange={(e) => setSettings({ ...settings, maxConsecutiveLosses: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              {saveSuccess && (
                <span className="text-emerald-400 flex items-center gap-1 font-semibold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Settings saved!</span>
                </span>
              )}
              <button
                type="submit"
                disabled={savingSettings}
                className="ml-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingSettings ? 'Saving...' : 'Save Risk Rules'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
