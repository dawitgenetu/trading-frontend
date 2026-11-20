import React, { useState } from 'react';
import {
  FileText,
  FileSpreadsheet,
  Download,
  Calendar,
  Layers,
  CheckCircle2,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useAccount } from '../context/AccountContext';
import { api } from '../services/api';

export const ReportsPage: React.FC = () => {
  const { selectedAccount, formatCurrency } = useAccount();

  const [reportType, setReportType] = useState<'comprehensive' | 'monthly' | 'strategy'>('comprehensive');
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [generatingExcel, setGeneratingExcel] = useState(false);

  const handleGeneratePdf = async () => {
    try {
      setGeneratingPdf(true);

      const [summaryRes, tradesRes] = await Promise.all([
        api.getReportSummary(selectedAccount?.id),
        api.getTrades({ accountId: selectedAccount?.id, limit: 100 }),
      ]);

      const stats = summaryRes.stats;
      const account = summaryRes.account;
      const trades = tradesRes.trades || [];

      const doc = new jsPDF();

      // Header Branding
      doc.setFillColor(11, 17, 32); // #0B1120
      doc.rect(0, 0, 210, 36, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(255, 255, 255);
      doc.text('ELITE TRADE JOURNAL', 14, 18);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(`Performance & Audit Report — Account: ${account?.name || 'All Accounts'}`, 14, 26);
      doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 140, 26);

      // Section 1: Executive KPI Summary Box
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('Executive Performance Summary', 14, 46);

      const summaryData = [
        ['Initial Balance', `$${stats.initialBalance.toFixed(2)}`, 'Current Balance', `$${stats.currentBalance.toFixed(2)}`],
        ['Total Net Profit', `$${stats.netProfit.toFixed(2)}`, 'Profit Factor', `${stats.profitFactor}`],
        ['Total Closed Trades', `${stats.totalTrades}`, 'Win Rate', `${stats.winRate}%`],
        ['Winning Trades', `${stats.winningTrades}`, 'Losing Trades', `${stats.losingTrades}`],
        ['Average Win', `$${stats.averageWin.toFixed(2)}`, 'Average Loss', `$${stats.averageLoss.toFixed(2)}`],
        ['Average Risk/Reward', `${stats.averageRr}R`, 'Max Drawdown', `${stats.maxDrawdownPercentage}% ($${stats.maxDrawdownAmount.toFixed(2)})`],
      ];

      autoTable(doc, {
        startY: 50,
        body: summaryData,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3.5 },
        columnStyles: {
          0: { fontStyle: 'bold', fillColor: [248, 250, 252] },
          2: { fontStyle: 'bold', fillColor: [248, 250, 252] },
        },
      });

      // Section 2: Trades Log Table
      const finalY = (doc as any).lastAutoTable?.finalY || 110;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('Closed Trades Log', 14, finalY + 12);

      const tradeTableRows = trades.slice(0, 35).map((t) => [
        t.tradeDate,
        t.symbol,
        t.direction,
        t.strategyName || 'Discretionary',
        t.entryPrice,
        t.exitPrice || '—',
        `${t.positionSize}L`,
        `$${t.netPnl.toFixed(2)}`,
        t.actualRMultiple ? `${t.actualRMultiple}R` : '—',
        t.followedPlan ? 'Yes' : 'No',
      ]);

      autoTable(doc, {
        startY: finalY + 16,
        head: [['Date', 'Symbol', 'Type', 'Strategy', 'Entry', 'Exit', 'Lots', 'Net P/L', 'R', 'Plan']],
        body: tradeTableRows,
        theme: 'striped',
        styles: { fontSize: 8, cellPadding: 2.5 },
        headStyles: { fillColor: [99, 102, 241] }, // Indigo
      });

      // Save PDF
      doc.save(`Elite-Trade-Journal-Report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err: any) {
      alert('Failed to generate PDF: ' + err.message);
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setGeneratingExcel(true);
      const res = await api.getTrades({ accountId: selectedAccount?.id, limit: 500 });
      const trades = res.trades || [];

      const excelRows = trades.map((t) => ({
        'Trade Date': t.tradeDate,
        'Symbol': t.symbol,
        'Market Type': t.marketType,
        'Direction': t.direction,
        'Session': t.session,
        'Timeframe': t.timeframe,
        'Status': t.status,
        'Entry Price': t.entryPrice,
        'Stop Loss': t.stopLoss,
        'Take Profit': t.takeProfit,
        'Exit Price': t.exitPrice,
        'Position Size (Lots)': t.positionSize,
        'Commission': t.commission,
        'Swap': t.swap,
        'Gross PnL': t.grossPnl,
        'Net PnL': t.netPnl,
        'Risk Amount ($)': t.riskAmount,
        'Risk (%)': t.riskPercentage,
        'Planned R:R': t.plannedRr,
        'Actual R': t.actualRMultiple,
        'Strategy': t.strategyName || 'Discretionary',
        'Followed Plan': t.followedPlan ? 'Yes' : 'No',
        'Was FOMO': t.wasFomo ? 'Yes' : 'No',
        'Was Revenge': t.wasRevenge ? 'Yes' : 'No',
        'Confidence (1-5)': t.confidenceLevel,
        'Entry Reason': t.entryReason,
        'Notes': t.detailedNotes,
        'Lesson Learned': t.lessonsLearned,
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Trades');

      XLSX.writeFile(workbook, `Elite-Trade-Journal-${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (err: any) {
      alert('Failed to export Excel: ' + err.message);
    } finally {
      setGeneratingExcel(false);
    }
  };

  const handleExportCsv = () => {
    window.open(`/api/reports/csv?accountId=${selectedAccount?.id || ''}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Reports & Exports
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Export trade logs, generate downloadable audit-ready PDF performance reports, and analyze data in Excel
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* PDF Report Card */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-card shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="p-3 w-fit rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Official PDF Performance Report
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Generates a formatted multi-page PDF document complete with branding, high-water mark metrics, win rates, drawdown, and recent trade logs.
            </p>
          </div>

          <button
            onClick={handleGeneratePdf}
            disabled={generatingPdf}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/25"
          >
            <Download className="w-4 h-4" />
            <span>{generatingPdf ? 'Generating PDF...' : 'Download PDF Report'}</span>
          </button>
        </div>

        {/* Excel Spreadsheet Card */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-card shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="p-3 w-fit rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Excel Workbook (.XLSX)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Export all trades into an organized Excel workbook with individual columns for financial metrics, risk ratios, psychology tags, and confluences.
            </p>
          </div>

          <button
            onClick={handleExportExcel}
            disabled={generatingExcel}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all shadow-md shadow-emerald-600/25"
          >
            <Download className="w-4 h-4" />
            <span>{generatingExcel ? 'Exporting Excel...' : 'Export to Excel (.xlsx)'}</span>
          </button>
        </div>

        {/* CSV Raw Data Card */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-card shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="p-3 w-fit rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Raw CSV Export
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Clean, comma-separated values file compatible with Python, R, TradingView, or third-party statistical software.
            </p>
          </div>

          <button
            onClick={handleExportCsv}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download Raw CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
};
