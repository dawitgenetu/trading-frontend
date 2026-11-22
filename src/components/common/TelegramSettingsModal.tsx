import React, { useState, useEffect } from 'react';
import {
  Send,
  X,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Bot,
  Bell,
  RefreshCw,
} from 'lucide-react';
import { api } from '../../services/api';

interface TelegramSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TelegramSettingsModal: React.FC<TelegramSettingsModalProps> = ({ isOpen, onClose }) => {
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');
  const [notifyOnTradeOpen, setNotifyOnTradeOpen] = useState(true);
  const [notifyOnTradeClose, setNotifyOnTradeClose] = useState(true);
  const [notifyOnDailyLimit, setNotifyOnDailyLimit] = useState(true);

  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await api.getTelegramSettings();
      if (res.settings) {
        setBotToken(res.settings.botToken || '');
        setChatId(res.settings.chatId || '');
        setNotifyOnTradeOpen(res.settings.notifyOnTradeOpen ?? true);
        setNotifyOnTradeClose(res.settings.notifyOnTradeClose ?? true);
        setNotifyOnDailyLimit(res.settings.notifyOnDailyLimit ?? true);
      }
      setIsConfigured(res.isConfigured);
    } catch (err: any) {
      console.warn('Failed to load telegram settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setStatusMsg(null);
    try {
      setLoading(true);
      const res = await api.saveTelegramSettings({
        botToken,
        chatId,
        notifyOnTradeOpen,
        notifyOnTradeClose,
        notifyOnDailyLimit,
      });
      setIsConfigured(res.isConfigured);
      setStatusMsg({ type: 'success', text: 'Telegram notification settings saved successfully!' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to save settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    setStatusMsg(null);
    try {
      setTestLoading(true);
      const res = await api.testTelegram(botToken, chatId);
      setStatusMsg({ type: 'success', text: res.message || 'Test notification delivered to Telegram!' });
      setIsConfigured(true);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to deliver test message. Check token and chat ID.' });
    } finally {
      setTestLoading(false);
    }
  };

  if (!isOpen) return null;

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

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#229ED9]/15 text-[#229ED9] border border-[#229ED9]/30 shadow-lg shadow-[#229ED9]/10">
            <Send className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white">Telegram Notifications</h2>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isConfigured
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-700/60 text-slate-400 border border-slate-600/40'
                }`}
              >
                {isConfigured ? 'Connected 🟢' : 'Not Configured ⚪'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Instant alerts for trades, P&L, 2-trades daily limit & calm-down tips
            </p>
          </div>
        </div>

        {/* Feedback Alert */}
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

        {/* Instructions */}
        <div className="p-4 rounded-2xl bg-dark-bg/80 border border-brand-tealBorder space-y-2 text-xs text-slate-300">
          <div className="font-bold text-brand-gold flex items-center gap-1.5">
            <Bot className="w-4 h-4" />
            <span>How to setup in 1 minute:</span>
          </div>
          <ol className="list-decimal pl-5 space-y-1 text-[11px] text-slate-400">
            <li>
              Message <span className="text-brand-gold font-mono">@BotFather</span> on Telegram to create a bot and copy your <b className="text-white">Bot Token</b>.
            </li>
            <li>
              Start your bot, then message <span className="text-brand-gold font-mono">@userinfobot</span> to get your numerical <b className="text-white">Chat ID</b>.
            </li>
            <li>Enter them below and click <b className="text-white">"Send Test Notification"</b>.</li>
          </ol>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Telegram Bot Token
            </label>
            <input
              type="text"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              placeholder="e.g. 7123456789:AAHfk39..."
              className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-brand-tealBorder bg-dark-bg/90 text-white placeholder-slate-600 focus:outline-none focus:border-brand-gold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Telegram Chat ID
            </label>
            <input
              type="text"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              placeholder="e.g. 123456789 or -100123456789"
              className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-brand-tealBorder bg-dark-bg/90 text-white placeholder-slate-600 focus:outline-none focus:border-brand-gold"
            />
          </div>

          {/* Notification Preferences */}
          <div className="p-4 rounded-2xl bg-dark-bg/60 border border-brand-tealBorder space-y-2.5">
            <div className="text-xs font-bold text-slate-300">Notification Alerts:</div>

            <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
              <span>Notify when a new trade is logged</span>
              <input
                type="checkbox"
                checked={notifyOnTradeOpen}
                onChange={(e) => setNotifyOnTradeOpen(e.target.checked)}
                className="w-4 h-4 rounded text-brand-gold focus:ring-0 bg-dark-bg border-brand-tealBorder"
              />
            </label>

            <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
              <span>Notify on Trade Close + Calm-down psychology tips</span>
              <input
                type="checkbox"
                checked={notifyOnTradeClose}
                onChange={(e) => setNotifyOnTradeClose(e.target.checked)}
                className="w-4 h-4 rounded text-brand-gold focus:ring-0 bg-dark-bg border-brand-tealBorder"
              />
            </label>

            <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
              <span>Notify when 2-trades daily limit is reached</span>
              <input
                type="checkbox"
                checked={notifyOnDailyLimit}
                onChange={(e) => setNotifyOnDailyLimit(e.target.checked)}
                className="w-4 h-4 rounded text-brand-gold focus:ring-0 bg-dark-bg border-brand-tealBorder"
              />
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={handleTest}
              disabled={testLoading || !botToken || !chatId}
              className="flex-1 py-2.5 rounded-xl border border-[#229ED9]/50 text-[#229ED9] hover:bg-[#229ED9]/10 text-xs font-bold transition-all disabled:opacity-40 flex items-center justify-center gap-1.5"
            >
              {testLoading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Send Test Notification</span>
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-brand-gold hover:bg-brand-goldLight text-brand-tealDark text-xs font-bold shadow-md shadow-brand-gold/20 active:scale-[0.99] transition-all flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Save Configuration</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
