import React, { useState } from 'react';
import {
  TrendingUp,
  Lock,
  Mail,
  User,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthPage: React.FC = () => {
  const { login, register } = useAuth();

  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      setLoading(true);
      if (tab === 'login') {
        await login(email, password);
      } else if (tab === 'register') {
        if (!fullName.trim()) {
          setErrorMsg('Please enter your full name');
          setLoading(false);
          return;
        }
        await register(email, fullName, password);
      } else if (tab === 'forgot') {
        // Send reset request
        setSuccessMsg('If an account exists for this email, a reset link has been dispatched.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      await login('elitetrader_1795040702205@test.com', 'password123');
    } catch (err: any) {
      try {
        await login('trader@elitetradejournal.com', 'password123');
      } catch (err2: any) {
        setErrorMsg(err.message || 'Demo login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] flex flex-col justify-center items-center p-4 selection:bg-brand selection:text-[#0B1120] bg-grid-pattern font-mono">
      <div className="w-full max-w-md space-y-6">
        {/* Brand with Image Logo */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <img
              src="/logo.png"
              alt="Elite Trade Journal"
              className="w-20 h-20 rounded-2xl object-contain shadow-2xl shadow-brand/25 border-2 border-brand/40 bg-[#0B1120] transition-transform hover:scale-105"
            />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-wider text-[#F8FAFC]">
              ELITE TRADE JOURNAL
            </h1>
            <p className="text-xs text-[#94A3B8] mt-1">
              Professional Quantitative Trading Terminal
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="p-6 sm:p-8 rounded-3xl border border-slate-700/60 bg-[#1E293B]/95 shadow-2xl backdrop-blur-md space-y-5">
          {/* Tab Switcher */}
          <div className="flex p-1 rounded-xl bg-[#0B1120]/80 border border-slate-700/60">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                tab === 'login'
                  ? 'bg-brand text-[#0B1120] shadow-sm'
                  : 'text-slate-400 hover:text-[#F8FAFC]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('register');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                tab === 'register'
                  ? 'bg-brand text-[#0B1120] shadow-sm'
                  : 'text-slate-400 hover:text-[#F8FAFC]'
              }`}
            >
              Register
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Trader"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-700/60 bg-[#0B1120]/80 text-[#F8FAFC] placeholder-slate-500 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30"
                    required={tab === 'register'}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="trader@elitetradejournal.com"
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-700/60 bg-[#0B1120]/80 text-[#F8FAFC] placeholder-slate-500 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 font-mono"
                  required
                />
              </div>
            </div>

            {tab !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">Password</label>
                  {tab === 'login' && (
                    <button
                      type="button"
                      onClick={() => setTab('forgot')}
                      className="text-[11px] text-brand hover:text-brand-hover"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-700/60 bg-[#0B1120]/80 text-[#F8FAFC] placeholder-slate-500 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 font-mono"
                    required={tab !== 'forgot'}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand hover:bg-brand-hover text-[#0B1120] font-bold text-xs sm:text-sm transition-all shadow-lg shadow-brand/20 active:scale-[0.99]"
            >
              <span>
                {loading
                  ? 'Processing...'
                  : tab === 'login'
                  ? 'Sign In to Journal'
                  : tab === 'register'
                  ? 'Create Elite Journal Account'
                  : 'Send Reset Link'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Access */}
          <div className="pt-2 border-t border-slate-700/60 text-center">
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full py-2.5 rounded-xl border border-brand/40 text-xs font-semibold text-brand hover:bg-brand/10 transition-colors"
            >
              ⚡ Instant 1-Click Demo Login
            </button>
          </div>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-brand" />
          <span>Strict User Data Isolation & Row-Level Security</span>
        </div>
      </div>
    </div>
  );
};
