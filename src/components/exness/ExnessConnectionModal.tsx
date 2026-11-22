import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Link2,
  X,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Power,
  Zap,
  Lock,
  Server,
  DollarSign,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { api } from '../../services/api';
import type { ExnessAccountInfo } from '../../types';

interface ExnessConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const POPULAR_SERVERS = [
  'Exness-Real',
  'Exness-Real2',
  'Exness-Real3',
  'Exness-Real4',
  'Exness-Real5',
  'Exness-Real6',
  'Exness-Real7',
  'Exness-Real8',
  'Exness-Real9',
  'Exness-Real10',
  'Exness-Trial',
  'Exness-Trial2',
];

export const ExnessConnectionModal: React.FC<ExnessConnectionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'connect' | 'sync' | 'security'>('connect');

  // Form State
  const [accountNumber, setAccountNumber] = useState('');
  const [server, setServer] = useState('Exness-Real');
  const [customServer, setCustomServer] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [tradingPassword, setTradingPassword] = useState('');
  const [balance, setBalance] = useState('');
  const [equity, setEquity] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [leverage, setLeverage] = useState('500');
  const [apiEndpoint, setApiEndpoint] = useState('https://www.exness-api.com');
  const [autoTradingEnabled, setAutoTradingEnabled] = useState(false);
  const [defaultLotSize, setDefaultLotSize] = useState('0.01');
  const [maxSlippagePips, setMaxSlippagePips] = useState('3');

  // UI state
  const [isConnected, setIsConnected] = useState(false);
  const [existingConn, setExistingConn] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ pingMs?: number; account?: ExnessAccountInfo } | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      loadConnection();
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const loadConnection = async () => {
    try {
      setLoading(true);
      const res = await api.getExnessConnection();
      setIsConnected(res.isConnected);
      if (res.connection) {
        setExistingConn(res.connection);
        setAccountNumber(res.connection.accountNumber || '');
        setServer(res.connection.server || 'Exness-Real');
        setApiEndpoint(res.connection.apiEndpoint || 'https://www.exness-api.com');
        setAutoTradingEnabled(Boolean(res.connection.autoTradingEnabled));
        setDefaultLotSize(String(res.connection.defaultLotSize || '0.01'));
        setMaxSlippagePips(String(res.connection.maxSlippagePips || '3'));
        if (res.connection.balance !== undefined && res.connection.balance !== null) setBalance(String(res.connection.balance));
        if (res.connection.equity !== undefined && res.connection.equity !== null) setEquity(String(res.connection.equity));
        if (res.connection.currency) setCurrency(res.connection.currency);
        if (res.connection.leverage) setLeverage(String(res.connection.leverage));
      }
    } catch (err: any) {
      console.warn('Could not load Exness connection:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeServer = customServer.trim() || server;

  const handleTest = async () => {
    setStatusMsg(null);
    setTestResult(null);
    if (!accountNumber.trim()) {
      setStatusMsg({ type: 'error', text: 'Please enter your Exness Account Number.' });
      return;
    }

    try {
      setTestLoading(true);
      const res = await api.testExnessConnection({
        accountNumber: accountNumber.trim(),
        server: activeServer,
        apiKey: apiKey.trim() || undefined,
        apiSecret: apiSecret.trim() || undefined,
        apiEndpoint: apiEndpoint.trim() || undefined,
        balance: balance ? parseFloat(balance) : undefined,
        equity: equity ? parseFloat(equity) : undefined,
        leverage: parseInt(leverage) || 500,
        currency,
      });

      if (res.success) {
        setTestResult({ pingMs: res.pingMs, account: res.accountInfo });
        if (res.accountInfo?.balance !== undefined && !balance) {
          setBalance(String(res.accountInfo.balance));
          setEquity(String(res.accountInfo.equity));
        }
        setStatusMsg({
          type: 'success',
          text: `Verified! Exness server responded (${res.pingMs}ms). Balance: $${res.accountInfo?.balance.toFixed(2)} ${res.accountInfo?.currency || 'USD'}.`,
        });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Exness connection test failed.' });
    } finally {
      setTestLoading(false);
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (!accountNumber.trim()) {
      setStatusMsg({ type: 'error', text: 'Exness Account Number is required.' });
      return;
    }

    try {
      setLoading(true);
      const res = await api.connectExness({
        accountNumber: accountNumber.trim(),
        server: activeServer,
        apiKey: apiKey.trim() || undefined,
        apiSecret: apiSecret.trim() || undefined,
        tradingPassword: tradingPassword.trim() || undefined,
        apiEndpoint: apiEndpoint.trim() || undefined,
        autoTradingEnabled,
        defaultLotSize: parseFloat(defaultLotSize) || 0.01,
        maxSlippagePips: parseFloat(maxSlippagePips) || 3,
        balance: balance ? parseFloat(balance) : undefined,
        equity: equity ? parseFloat(equity) : undefined,
        leverage: parseInt(leverage) || 500,
        currency,
      });

      setIsConnected(true);
      setStatusMsg({
        type: 'success',
        text: res.message || 'Exness account connected and synchronized successfully!',
      });
      await loadConnection();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to connect Exness account.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Disconnect this Exness account? Your historical journal entries will be safely preserved.')) {
      return;
    }

    try {
      setLoading(true);
      await api.disconnectExness();
      setIsConnected(false);
      setExistingConn(null);
      setAccountNumber('');
      setApiKey('');
      setApiSecret('');
      setTradingPassword('');
      setStatusMsg({ type: 'success', text: 'Exness account disconnected successfully.' });
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to disconnect account.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSyncNow = async () => {
    try {
      setSyncLoading(true);
      setStatusMsg(null);
      const res = await api.syncExness();
      setStatusMsg({
        type: 'success',
        text: `Sync complete! Synced ${res.syncedTradesCount} new trade(s). Live Balance: $${res.account.currentBalance?.toFixed(2)} USD.`,
      });
      await loadConnection();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Sync failed.' });
    } finally {
      setSyncLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-mono">
      <div className="relative w-full max-w-2xl p-6 sm:p-7 rounded-3xl border border-brand-tealBorder bg-brand-tealSurface/98 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-brand-tealHover transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-brand-gold/15 text-brand-gold border border-brand-gold/30 shadow-lg shadow-brand-gold/10">
            <Link2 className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white">Exness API Account Connection</h2>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isConnected
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-700/60 text-slate-400 border border-slate-600/40'
                }`}
              >
                {isConnected ? 'Connected 🟢' : 'Not Connected ⚪'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live account data, automatic trade synchronization, and authorized automated execution
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-brand-tealBorder/80 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('connect')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'connect'
                ? 'bg-brand-gold text-brand-tealDark shadow-md shadow-brand-gold/20'
                : 'text-slate-400 hover:text-white hover:bg-brand-tealHover'
            }`}
          >
            Credentials & Setup
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sync')}
            disabled={!isConnected}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all disabled:opacity-40 ${
              activeTab === 'sync'
                ? 'bg-brand-gold text-brand-tealDark shadow-md shadow-brand-gold/20'
                : 'text-slate-400 hover:text-white hover:bg-brand-tealHover'
            }`}
          >
            Live Sync Status
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'security'
                ? 'bg-brand-gold text-brand-tealDark shadow-md shadow-brand-gold/20'
                : 'text-slate-400 hover:text-white hover:bg-brand-tealHover'
            }`}
          >
            Security & Docs
          </button>
        </div>

        {/* Status Alert */}
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

        {/* TAB 1: CONNECT FORM */}
        {activeTab === 'connect' && (
          <form onSubmit={handleConnect} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Exness Account Number *
                </label>
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="e.g. 18492049"
                  className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-brand-tealBorder bg-dark-bg/90 text-white placeholder-slate-600 focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Exness Server *
                </label>
                <select
                  value={server}
                  onChange={(e) => setServer(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-brand-tealBorder bg-dark-bg/90 text-white focus:outline-none focus:border-brand-gold"
                >
                  {POPULAR_SERVERS.map((srv) => (
                    <option key={srv} value={srv}>
                      {srv}
                    </option>
                  ))}
                  <option value="Custom">Custom Server Name...</option>
                </select>
              </div>
            </div>

            {server === 'Custom' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Custom Server Name
                </label>
                <input
                  type="text"
                  value={customServer}
                  onChange={(e) => setCustomServer(e.target.value)}
                  placeholder="e.g. Exness-Real11 or Exness-MT5Real8"
                  className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-brand-tealBorder bg-dark-bg/90 text-white placeholder-slate-600 focus:outline-none focus:border-brand-gold"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Exness API Key / Token
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={existingConn?.apiKeyMasked ? `Saved: ${existingConn.apiKeyMasked}` : 'Exness API Key'}
                  className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-brand-tealBorder bg-dark-bg/90 text-white placeholder-slate-600 focus:outline-none focus:border-brand-gold"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">Stored with AES-256 backend encryption</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  API Secret / Private Key
                </label>
                <input
                  type="password"
                  value={apiSecret}
                  onChange={(e) => setApiSecret(e.target.value)}
                  placeholder={existingConn?.hasApiSecret ? '******** (Saved)' : 'Optional API Secret'}
                  className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-brand-tealBorder bg-dark-bg/90 text-white placeholder-slate-600 focus:outline-none focus:border-brand-gold"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">Never exposed in client code</span>
              </div>
            </div>

            {/* Trading Password for Execution */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Trading Account Password (Optional for Execution)
              </label>
              <input
                type="password"
                value={tradingPassword}
                onChange={(e) => setTradingPassword(e.target.value)}
                placeholder={existingConn?.hasTradingPassword ? '******** (Encrypted on Server)' : 'Required only for live trade execution'}
                className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-brand-tealBorder bg-dark-bg/90 text-white placeholder-slate-600 focus:outline-none focus:border-brand-gold"
              />
            </div>

            {/* Actual Exness Account Metrics */}
            <div className="p-4 rounded-2xl bg-dark-bg/70 border border-brand-tealBorder/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-brand-gold" />
                  <span>Actual Exness Account Metrics</span>
                </div>
                <span className="text-[10px] text-brand-gold bg-brand-gold/10 px-2 py-0.5 rounded-full border border-brand-gold/30">
                  Exact MT4/MT5 Sync
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Enter your live Exness account balance, equity, and leverage so the dashboard and journal reflect your real broker figures immediately.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Balance ({currency})
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    placeholder="e.g. 500.00"
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-brand-tealBorder bg-dark-bg text-white placeholder-slate-600 focus:outline-none focus:border-brand-gold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Live Equity ({currency})
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={equity}
                    onChange={(e) => setEquity(e.target.value)}
                    placeholder="e.g. 500.00"
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-brand-tealBorder bg-dark-bg text-white placeholder-slate-600 focus:outline-none focus:border-brand-gold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-brand-tealBorder bg-dark-bg text-white focus:outline-none focus:border-brand-gold"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="AUD">AUD (A$)</option>
                    <option value="CAD">CAD (C$)</option>
                    <option value="JPY">JPY (¥)</option>
                    <option value="USDT">USDT (₮)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Leverage (1:X)
                  </label>
                  <select
                    value={leverage}
                    onChange={(e) => setLeverage(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-brand-tealBorder bg-dark-bg text-white focus:outline-none focus:border-brand-gold"
                  >
                    <option value="100">1:100</option>
                    <option value="200">1:200</option>
                    <option value="400">1:400</option>
                    <option value="500">1:500</option>
                    <option value="1000">1:1000</option>
                    <option value="2000">1:2000</option>
                    <option value="9999">Unlimited (1:∞)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Safety Switch: Automated Trade Execution */}
            <div className="p-4 rounded-2xl bg-dark-bg/70 border border-brand-tealBorder space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-brand-gold" />
                    <span>Automated Trade Execution</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Disabled by default. When authorized, allows executing BUY/SELL orders directly on Exness.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoTradingEnabled}
                    onChange={(e) => setAutoTradingEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {autoTradingEnabled && (
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-brand-tealBorder/60">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Default Lot Size</label>
                    <input
                      type="number"
                      step="0.01"
                      value={defaultLotSize}
                      onChange={(e) => setDefaultLotSize(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-brand-tealBorder bg-dark-bg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Max Slippage (Pips)</label>
                    <input
                      type="number"
                      value={maxSlippagePips}
                      onChange={(e) => setMaxSlippagePips(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-brand-tealBorder bg-dark-bg text-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handleTest}
                disabled={testLoading || !accountNumber.trim()}
                className="flex-1 py-2.5 rounded-xl border border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10 text-xs font-bold transition-all disabled:opacity-40 flex items-center justify-center gap-1.5"
              >
                {testLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Server className="w-3.5 h-3.5" />
                )}
                <span>Test Connection</span>
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-brand-gold hover:bg-brand-goldLight text-brand-tealDark text-xs font-bold shadow-md shadow-brand-gold/20 active:scale-[0.99] transition-all flex items-center justify-center gap-1.5"
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                <span>{isConnected ? 'Update & Re-Sync' : 'Connect Exness Account'}</span>
              </button>

              {isConnected && (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  disabled={loading}
                  className="py-2.5 px-4 rounded-xl border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>Disconnect</span>
                </button>
              )}
            </div>
          </form>
        )}

        {/* TAB 2: LIVE SYNC STATUS */}
        {activeTab === 'sync' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-dark-bg/80 border border-brand-tealBorder space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Connected Account:</span>
                <span className="text-white font-bold font-mono">#{existingConn?.accountNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Server:</span>
                <span className="text-brand-gold font-bold font-mono">{existingConn?.server}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Last Synchronized:</span>
                <span className="text-slate-300 font-mono">
                  {existingConn?.lastSyncAt ? new Date(existingConn.lastSyncAt).toLocaleString() : 'Never'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Automated Trading:</span>
                <span className={existingConn?.autoTradingEnabled ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                  {existingConn?.autoTradingEnabled ? 'Authorized 🟢' : 'Disabled ⚪'}
                </span>
              </div>
            </div>

            <button
              onClick={handleSyncNow}
              disabled={syncLoading}
              className="w-full py-3 rounded-2xl bg-brand-gold hover:bg-brand-goldLight text-brand-tealDark font-bold text-xs shadow-md shadow-brand-gold/20 flex items-center justify-center gap-2 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${syncLoading ? 'animate-spin' : ''}`} />
              <span>{syncLoading ? 'Synchronizing with Exness...' : 'Synchronize Trades & Live Balance Now'}</span>
            </button>
          </div>
        )}

        {/* TAB 3: SECURITY & DOCS */}
        {activeTab === 'security' && (
          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-4 rounded-2xl bg-dark-bg/80 border border-brand-tealBorder space-y-2">
              <div className="font-bold text-brand-gold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Security & Private Key Architecture</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                All Exness API keys and trading credentials are encrypted with <b>AES-256-CBC</b> prior to database persistence. Private signing keys are strictly executed on backend proxy pipelines and never exposed in client bundle code.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-dark-bg/80 border border-brand-tealBorder space-y-2">
              <div className="font-bold text-white flex items-center gap-1.5">
                <ExternalLink className="w-4 h-4 text-sky-400" />
                <span>Exness Trader API Reference</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Refer to official documentation at <a href="https://www.exness-api.com/" target="_blank" rel="noopener noreferrer" className="text-brand-gold underline">https://www.exness-api.com/</a> to generate your API keys inside your Exness Personal Area under <i>Settings → API Management</i>.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
