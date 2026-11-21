import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Brain,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Send,
  MessageSquare,
  BarChart3,
  Target,
  CheckCircle2,
  RefreshCw,
  Lightbulb,
  Zap,
  Clock,
  Compass,
} from 'lucide-react';
import { useAccount } from '../context/AccountContext';
import { api } from '../services/api';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const CoachPage: React.FC = () => {
  const { selectedAccount, formatCurrency } = useAccount();

  const [activeTab, setActiveTab] = useState<'chat' | 'analysis' | 'recommendations'>('chat');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hello! I am your Gemini AI Trading Assistant and Risk Coach. I have analyzed your trading journal and performance metrics. Ask me anything about your trade execution, session edges, risk management, or psychological habits!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const res = await api.getCoachInsights(selectedAccount?.id);
      setData(res);
    } catch (err) {
      console.error('Failed to load coach insights:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [selectedAccount?.id]);

  useEffect(() => {
    if (activeTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage.trim();
    if (!textToSend || chatLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputMessage('');
    setChatLoading(true);

    try {
      const historyPayload = messages.slice(-5).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await api.chatWithCoach(textToSend, historyPayload, selectedAccount?.id);

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: res.reply || 'Analysis completed.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `Apologies, unable to reach Gemini right now: ${err.message || 'Please verify your network connection.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  const starterPrompts = [
    'Analyze my recent trades and highlight my mistakes',
    'What is my biggest vulnerability in risk management?',
    'Which trading session provides me the highest win rate?',
    'Give me 3 strict discipline rules for next week',
  ];

  const insights = data?.insights || [];
  const recommendations = data?.recommendations || [];
  const healthScore = data?.healthScore ?? 75;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (score >= 60) return 'text-brand-gold border-brand-gold/40 bg-brand-gold/10';
    return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
  };

  const getScoreGrade = (score: number) => {
    if (score >= 85) return 'Grade A • Disciplined Edge';
    if (score >= 70) return 'Grade B • Consistent Execution';
    if (score >= 55) return 'Grade C • Risk Tightening Needed';
    return 'Grade D • Emotional Vulnerabilities Detected';
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-brand-tealBorder">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-brand-teal text-brand-gold border border-brand-gold/30 shadow-lg shadow-brand-gold/15">
              <Bot className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-slate-900 dark:text-brand-goldLight">
                  Gemini AI Trading Assistant
                </h1>
                <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Google Gemini Active
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                AI diagnostic analytics, interactive conversational coach & recommendations
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchInsights}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-brand-tealBorder bg-white dark:bg-brand-tealSurface text-xs font-semibold hover:border-brand-gold/40 text-brand-gold transition-colors self-start sm:self-auto shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Analysis</span>
        </button>
      </div>

      {/* AI Scorecard & Executive Metrics Banner */}
      <div className="p-5 sm:p-6 rounded-3xl border border-brand-tealBorder bg-brand-tealSurface/95 backdrop-blur-md shadow-xl flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5 w-full lg:w-auto">
          <div className={`flex flex-col items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 ${getScoreColor(healthScore)} shadow-lg`}>
            <span className="text-2xl sm:text-3xl font-bold font-mono">{healthScore}</span>
            <span className="text-[10px] uppercase tracking-wider font-semibold opacity-80">Score</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-brand-gold" />
              <span className="text-xs font-bold text-brand-gold uppercase tracking-wider">
                Behavioral Audit Status
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
              {getScoreGrade(healthScore)}
            </h2>
            <p className="text-xs text-slate-400 max-w-xl mt-1 leading-relaxed">
              {data?.summary || 'Log closed trades to unlock full Gemini behavioral and execution diagnostic insights.'}
            </p>
          </div>
        </div>

        {data?.stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-brand-tealBorder lg:pl-6 text-xs">
            <div className="p-2.5 rounded-xl bg-dark-bg/60 border border-brand-tealBorder">
              <span className="text-[10px] text-slate-400 block">Sample:</span>
              <span className="font-bold text-white font-mono">{data.stats.totalTrades} Trades</span>
            </div>
            <div className="p-2.5 rounded-xl bg-dark-bg/60 border border-brand-tealBorder">
              <span className="text-[10px] text-slate-400 block">Win Rate:</span>
              <span className="font-bold text-emerald-400 font-mono">{data.stats.winRate}%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-dark-bg/60 border border-brand-tealBorder">
              <span className="text-[10px] text-slate-400 block">Profit Factor:</span>
              <span className="font-bold text-brand-gold font-mono">{data.stats.profitFactor}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-dark-bg/60 border border-brand-tealBorder">
              <span className="text-[10px] text-slate-400 block">Expectancy:</span>
              <span className="font-bold text-emerald-400 font-mono">${data.stats.expectancy}</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-brand-tealBorder pb-2">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'chat'
              ? 'bg-brand-gold text-brand-tealDark shadow-md shadow-brand-gold/20'
              : 'text-slate-400 hover:text-white hover:bg-brand-tealHover'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Interactive AI Assistant</span>
        </button>
        <button
          onClick={() => setActiveTab('analysis')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'analysis'
              ? 'bg-brand-gold text-brand-tealDark shadow-md shadow-brand-gold/20'
              : 'text-slate-400 hover:text-white hover:bg-brand-tealHover'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Diagnostic Analysis ({insights.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'recommendations'
              ? 'bg-brand-gold text-brand-tealDark shadow-md shadow-brand-gold/20'
              : 'text-slate-400 hover:text-white hover:bg-brand-tealHover'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Strategic Recommendations ({recommendations.length})</span>
        </button>
      </div>

      {/* TAB 1: INTERACTIVE AI ASSISTANT CHAT */}
      {activeTab === 'chat' && (
        <div className="flex flex-col rounded-3xl border border-brand-tealBorder bg-brand-tealSurface/95 backdrop-blur-md overflow-hidden shadow-2xl h-[580px]">
          {/* Chat Feed Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-brand-tealBorder bg-dark-bg/60 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-bold text-brand-gold">Gemini Assistant Session Active</span>
            </div>
            <span className="text-[11px] text-slate-400">Context: {selectedAccount?.name || 'All Accounts'}</span>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
            {messages.map((m) => {
              const isUser = m.role === 'user';

              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-xl flex-shrink-0 text-xs font-bold ${
                      isUser
                        ? 'bg-brand-gold text-brand-tealDark shadow-md'
                        : 'bg-brand-tealDark border border-brand-gold/40 text-brand-gold shadow-md'
                    }`}
                  >
                    {isUser ? 'ME' : <Sparkles className="w-4 h-4" />}
                  </div>

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-brand-gold text-brand-tealDark font-medium rounded-tr-none shadow-md shadow-brand-gold/15'
                        : 'bg-dark-bg/90 border border-brand-tealBorder text-slate-100 rounded-tl-none shadow-lg'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{m.content}</div>
                    <div
                      className={`text-[9px] mt-2 font-mono ${
                        isUser ? 'text-brand-tealDark/70 text-right' : 'text-slate-500'
                      }`}
                    >
                      {m.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}

            {chatLoading && (
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-brand-tealDark border border-brand-gold/40 text-brand-gold">
                  <Sparkles className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-3.5 rounded-2xl rounded-tl-none bg-dark-bg/80 border border-brand-tealBorder text-xs text-brand-gold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-gold animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-brand-gold animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-brand-gold animate-bounce [animation-delay:0.4s]" />
                  <span className="ml-1 text-[11px] text-slate-400">Gemini is analyzing your journal...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Starter Chips */}
          <div className="px-4 py-2 border-t border-brand-tealBorder/60 bg-dark-bg/40 flex items-center gap-2 overflow-x-auto text-[11px]">
            <span className="text-slate-500 whitespace-nowrap flex items-center gap-1">
              <Lightbulb className="w-3 h-3 text-brand-gold" />
              Ask:
            </span>
            {starterPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                disabled={chatLoading}
                className="px-3 py-1 rounded-lg border border-brand-tealBorder bg-brand-tealSurface hover:border-brand-gold/50 text-slate-300 hover:text-white transition-all whitespace-nowrap text-[11px]"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 sm:p-4 border-t border-brand-tealBorder bg-dark-bg/80 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask Gemini AI Coach about your trades, risk, or setup..."
              disabled={chatLoading}
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-brand-tealBorder bg-brand-tealSurface text-white placeholder-slate-500 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/30 font-mono"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || chatLoading}
              className="flex items-center justify-center px-4 py-2.5 rounded-xl bg-brand-gold hover:bg-brand-goldLight text-brand-tealDark font-bold text-xs sm:text-sm transition-all disabled:opacity-40 shadow-md shadow-brand-gold/25"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: DIAGNOSTIC ANALYSIS */}
      {activeTab === 'analysis' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((item: any, idx: number) => {
              const isPos = item.sentiment === 'positive';
              const isWarn = item.sentiment === 'warning';

              return (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border transition-all space-y-3 ${
                    isPos
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : isWarn
                      ? 'border-brand-gold/30 bg-brand-gold/5'
                      : 'border-rose-500/30 bg-rose-500/5'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                        isPos
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : isWarn
                          ? 'bg-brand-gold/20 text-brand-gold'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {item.category.replace('_', ' ')}
                    </span>
                    {item.metric && (
                      <span className="text-xs font-mono font-bold text-slate-300">{item.metric}</span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    {isPos ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    ) : isWarn ? (
                      <AlertTriangle className="w-4 h-4 text-brand-gold flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    )}
                    <span>{item.title}</span>
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>

          {insights.length === 0 && !loading && (
            <div className="p-8 text-center rounded-2xl border border-dashed border-brand-tealBorder text-slate-400">
              <Bot className="w-8 h-8 text-brand-gold mx-auto mb-2 opacity-60" />
              <p className="text-sm font-semibold text-white">No closed trades recorded yet</p>
              <p className="text-xs mt-1">Log at least 2 closed trades in the journal to generate automatic diagnostic insights.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: STRATEGIC RECOMMENDATIONS */}
      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec: any, idx: number) => {
              const isCrit = rec.impact === 'CRITICAL';
              const isHigh = rec.impact === 'HIGH';

              return (
                <div
                  key={rec.id || idx}
                  className="p-5 rounded-2xl border border-brand-tealBorder bg-brand-tealSurface/95 backdrop-blur-md shadow-lg space-y-3 hover:border-brand-gold/40 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                        isCrit
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : isHigh
                          ? 'bg-brand-gold/20 text-brand-gold border border-brand-gold/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {rec.impact} PRIORITY
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                      {rec.category}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-brand-gold flex-shrink-0" />
                    <span>{rec.title}</span>
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {rec.action}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Compliance & Privacy Footer */}
      <div className="p-4 rounded-2xl bg-dark-bg/60 border border-brand-tealBorder text-[11px] text-slate-500 text-center space-y-1">
        <p className="font-semibold text-slate-400">Gemini AI Quantitative Transparency & Disclaimer</p>
        <p>
          The AI Trading Coach and Assistant are powered by Google Gemini and evaluate data derived solely from your manual trade records. Insights are for educational and performance improvement purposes only, and never constitute direct financial advice or trade signaling.
        </p>
      </div>
    </div>
  );
};
