import React, { useState } from 'react';
import { AppState, Transaction, TotalsInfo, TabType } from '../types';
import { formatRupiah, formatDateIndo, getCategoryLabel } from '../services/utils';
import { createWeeklyKasReportMessage, openWhatsAppDirect } from '../services/whatsapp';
import { MonthlyFinanceChart } from './MonthlyFinanceChart';
import {
  TrendingUp,
  TrendingDown,
  Coins,
  ArrowUpRight,
  PlusCircle,
  Share2,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  Target,
  Image as ImageIcon,
  CheckCheck,
  CalendarDays,
} from 'lucide-react';

interface DashboardViewProps {
  state: AppState;
  totals: TotalsInfo;
  onNavigateTab: (tab: TabType) => void;
  onOpenAddTransaction: (type: 'income' | 'expense') => void;
  onMarkAllPaidToday: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  state,
  totals,
  onNavigateTab,
  onOpenAddTransaction,
  onMarkAllPaidToday,
}) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);

  const reportMessage = createWeeklyKasReportMessage(state);

  const handleShareWA = () => {
    openWhatsAppDirect('', reportMessage);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(reportMessage);
    alert('Format laporan WhatsApp berhasil disalin ke clipboard!');
  };

  const recentTransactions = state.transactions.slice(0, 5);

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 md:pb-6">
      {/* 1. Main Balance Hero Card */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 text-white p-4 sm:p-6 shadow-md border border-teal-700/50">
        {/* Background Graphic subtle accents */}
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-teal-500/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs sm:text-sm font-medium text-teal-200">
                Total Saldo Kas {state.classConfig.className}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-200 border border-teal-400/30">
                Real-Time
              </span>
            </div>
            <div className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              {formatRupiah(totals.balance)}
            </div>
            <p className="text-xs text-teal-200/80 mt-1">
              Tersedia Bebas: <strong className="text-white">{formatRupiah(totals.unallocatedCash)}</strong>
              {totals.allocatedSavings > 0 && (
                <span className="ml-2">
                  (Dialokasikan Celengan Target: {formatRupiah(totals.allocatedSavings)})
                </span>
              )}
            </p>
          </div>

          {/* Quick Action Buttons on Hero */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="hero-quick-jimpitan"
              onClick={() => onNavigateTab('jimpitan')}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-xs shadow-sm transition active:scale-95"
            >
              <Coins className="w-4 h-4" />
              <span>Setor Iuran</span>
            </button>
            <button
              id="hero-add-expense"
              onClick={() => onOpenAddTransaction('expense')}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 backdrop-blur-xs transition active:scale-95"
            >
              <TrendingDown className="w-4 h-4 text-rose-300" />
              <span>Pengeluaran</span>
            </button>
            <button
              id="hero-share-wa"
              onClick={() => setShowShareModal(true)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-xs transition active:scale-95"
              title="Kirim Laporan Kas ke WhatsApp"
            >
              <Share2 className="w-4 h-4 text-emerald-300" />
            </button>
          </div>
        </div>

        {/* Breakdown Metric Pills */}
        <div className="mt-5 pt-4 border-t border-teal-700/60 grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4 text-xs">
          <div className="bg-teal-950/40 rounded-xl p-2.5 border border-teal-700/40">
            <div className="flex items-center gap-1 text-teal-300 text-[11px]">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Total Pemasukan</span>
            </div>
            <div className="font-bold text-sm sm:text-base text-emerald-300 mt-0.5">
              {formatRupiah(totals.totalIncome)}
            </div>
            <span className="text-[10px] text-teal-300/70">
              Iuran Siswa: {formatRupiah(totals.jimpitanTotal)}
            </span>
          </div>

          <div className="bg-teal-950/40 rounded-xl p-2.5 border border-teal-700/40">
            <div className="flex items-center gap-1 text-teal-300 text-[11px]">
              <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
              <span>Total Pengeluaran</span>
            </div>
            <div className="font-bold text-sm sm:text-base text-rose-300 mt-0.5">
              {formatRupiah(totals.totalExpense)}
            </div>
            <span className="text-[10px] text-teal-300/70">
              {state.transactions.filter((t) => t.type === 'expense').length} Transaksi Keluar
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-teal-950/40 rounded-xl p-2.5 border border-teal-700/40">
            <div className="flex items-center gap-1 text-teal-300 text-[11px]">
              <CalendarDays className="w-3.5 h-3.5 text-amber-400" />
              <span>Iuran Bulan Ini</span>
            </div>
            <div className="font-bold text-sm sm:text-base text-amber-300 mt-0.5">
              {formatRupiah(totals.jimpitanThisMonth || totals.jimpitanToday)}
            </div>
            <span className="text-[10px] text-teal-300/70">
              {totals.thisMonthPaidCount ?? totals.todayPaidCount} dari {totals.activeStudentsCount} Siswa Lunas
            </span>
          </div>
        </div>
      </div>

      {/* 2. Monthly Kas Progress Banner */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span>Status Iuran Kas Bulan Ini ({totals.currentMonthLabel || 'Bulan Ini'})</span>
                {(totals.thisMonthProgress ?? totals.todayProgress) === 100 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <Sparkles className="w-3 h-3" /> 100% Lunas!
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500">
                Tarif default: {formatRupiah(state.classConfig.defaultAmount)} / bulan per siswa
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('jimpitan')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-xs transition active:scale-95"
            >
              <span>Buka Catatan Iuran</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-600 font-medium">
            <span>
              Terkumpul: <strong>{totals.thisMonthPaidCount ?? totals.todayPaidCount}</strong> dari {totals.activeStudentsCount} Siswa
              {((totals.activeStudentsCount - (totals.thisMonthPaidCount ?? totals.todayPaidCount)) > 0) && (
                <span className="text-amber-700 font-semibold ml-1.5">
                  ({totals.activeStudentsCount - (totals.thisMonthPaidCount ?? totals.todayPaidCount)} belum setor)
                </span>
              )}
            </span>
            <span className="font-bold text-teal-800">{totals.thisMonthProgress ?? totals.todayProgress}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                (totals.thisMonthProgress ?? totals.todayProgress) === 100 ? 'bg-emerald-500' : 'bg-teal-600'
              }`}
              style={{ width: `${totals.thisMonthProgress ?? totals.todayProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Quick Shortcuts Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          onClick={() => onNavigateTab('jimpitan')}
          className="flex flex-col items-start p-3.5 rounded-xl bg-white border border-slate-200 hover:border-teal-300 hover:bg-teal-50/40 shadow-xs transition group text-left"
        >
          <div className="p-2 rounded-lg bg-teal-100 text-teal-800 mb-2 group-hover:scale-105 transition">
            <Coins className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-900">Buka Catatan Iuran</span>
          <span className="text-[11px] text-slate-500 mt-0.5">Catat iuran harian & mingguan</span>
        </button>

        <button
          onClick={() => onOpenAddTransaction('expense')}
          className="flex flex-col items-start p-3.5 rounded-xl bg-white border border-slate-200 hover:border-rose-300 hover:bg-rose-50/40 shadow-xs transition group text-left"
        >
          <div className="p-2 rounded-lg bg-rose-100 text-rose-800 mb-2 group-hover:scale-105 transition">
            <TrendingDown className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-900">Catat Pengeluaran</span>
          <span className="text-[11px] text-slate-500 mt-0.5">Spidol, sapu, fotokopi, sosial</span>
        </button>

        <button
          onClick={() => onOpenAddTransaction('income')}
          className="flex flex-col items-start p-3.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 shadow-xs transition group text-left"
        >
          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 mb-2 group-hover:scale-105 transition">
            <PlusCircle className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-900">Pemasukan Lain</span>
          <span className="text-[11px] text-slate-500 mt-0.5">Donasi, saldo awal, bazar</span>
        </button>

        <button
          onClick={() => setShowShareModal(true)}
          className="flex flex-col items-start p-3.5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 shadow-xs transition group text-left"
        >
          <div className="p-2 rounded-lg bg-blue-100 text-blue-800 mb-2 group-hover:scale-105 transition">
            <Share2 className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-900">Rekap Kas WhatsApp</span>
          <span className="text-[11px] text-slate-500 mt-0.5">Format laporan siap kirim</span>
        </button>
      </div>

      {/* 4. Visualisasi Tren Keuangan Kas Bulanan (Recharts) */}
      <MonthlyFinanceChart state={state} />

      {/* 5. Active Savings Goals Preview */}
      {state.savingsGoals.length > 0 && (
        <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
                <Target className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Celengan & Target Tabungan Kelas</h3>
            </div>
            <button
              onClick={() => onNavigateTab('celengan')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              <span>Lihat Semua</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {state.savingsGoals.slice(0, 3).map((goal) => {
              const pct = Math.min(100, Math.round((goal.currentAllocatedAmount / goal.targetAmount) * 100));
              return (
                <div
                  key={goal.id}
                  onClick={() => onNavigateTab('celengan')}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 hover:border-teal-300 transition cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xl shrink-0">{goal.icon || '🎯'}</span>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-800 truncate">{goal.title}</h4>
                        <span className="text-[10px] text-slate-500">
                          {formatRupiah(goal.currentAllocatedAmount)} / {formatRupiah(goal.targetAmount)}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                        pct >= 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-teal-100 text-teal-800'
                      }`}
                    >
                      {pct}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 mt-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${pct >= 100 ? 'bg-emerald-500' : 'bg-teal-600'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Recent Transactions Feed */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">Catatan Kas Terakhir</h3>
            <span className="text-xs text-slate-400 font-normal">({state.transactions.length} total)</span>
          </div>
          <button
            onClick={() => onNavigateTab('kas')}
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
          >
            <span>Buku Kas Lengkap</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            Belum ada transaksi kas yang dicatat.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentTransactions.map((tx) => {
              const cat = getCategoryLabel(tx.category);
              const isIncome = tx.type === 'income';

              return (
                <div key={tx.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 border ${
                        isIncome
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {cat.icon}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-xs font-bold text-slate-800 truncate">{tx.title}</p>
                        {tx.receiptImage && (
                          <button
                            onClick={() => setSelectedReceipt(tx.receiptImage!)}
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100"
                            title="Lihat Bukti Nota/Kwitansi"
                          >
                            <ImageIcon className="w-2.5 h-2.5" />
                            <span>Nota</span>
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span>{formatDateIndo(tx.date)}</span>
                        {tx.recipientOrSource && <span>• {tx.recipientOrSource}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div
                      className={`text-xs font-bold ${
                        isIncome ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {isIncome ? '+' : '-'} {formatRupiah(tx.amount)}
                    </div>
                    <span className="text-[10px] text-slate-400 capitalize">{cat.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Share to WhatsApp Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                  WA
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Kirim Laporan Kas WhatsApp</h3>
                  <p className="text-[11px] text-slate-500">Format pesan rapi ke grup kelas / wali murid</p>
                </div>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="my-3 flex-1 overflow-y-auto bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono text-xs whitespace-pre-wrap text-slate-800 selection:bg-teal-200">
              {reportMessage}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 shrink-0">
              <button
                onClick={copyToClipboard}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition text-center"
              >
                📋 Salin Teks Pesan
              </button>
              <button
                onClick={handleShareWA}
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition flex items-center justify-center gap-1.5"
              >
                <Share2 className="w-4 h-4" />
                <span>Buka di WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Image Modal */}
      {selectedReceipt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4"
          onClick={() => setSelectedReceipt(null)}
        >
          <div
            className="relative max-w-md w-full bg-white rounded-2xl p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-bold text-slate-900">Bukti Nota / Kwitansi Pembelian</h4>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg text-sm"
              >
                ✕
              </button>
            </div>
            <div className="rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center max-h-[70vh]">
              <img
                src={selectedReceipt}
                alt="Bukti Nota"
                className="w-full h-auto object-contain max-h-[70vh]"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
