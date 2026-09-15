import React, { useState, useMemo } from 'react';
import { AppState } from '../types';
import { formatRupiah, formatDateIndo, formatDateShort, exportToCSV, getCategoryLabel } from '../services/utils';
import { createWeeklyKasReportMessage, openWhatsAppDirect } from '../services/whatsapp';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Share2,
  Calendar,
  Filter,
  Users,
  CheckCircle2,
  AlertCircle,
  School,
  Sparkles,
} from 'lucide-react';

interface LaporanViewProps {
  state: AppState;
  totals: {
    directIncome: number;
    jimpitanTotal: number;
    totalIncome: number;
    totalExpense: number;
    balance: number;
    allocatedSavings: number;
    unallocatedCash: number;
  };
  studentMetrics: Map<
    string,
    { totalPaid: number; paidCount: number; unpaidCount: number; unpaidTotal: number; lastPaidDate?: string }
  >;
}

export const LaporanView: React.FC<LaporanViewProps> = ({ state, totals, studentMetrics }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [reportType, setReportType] = useState<'buku_kas' | 'rekap_siswa'>('buku_kas');

  const defaultAmt = state.classConfig.defaultAmount || 2000;

  // Build combined chronological accounting entries
  const ledgerEntries = useMemo(() => {
    type LedgerRow = {
      id: string;
      date: string;
      title: string;
      category: string;
      income: number;
      expense: number;
      type: 'jimpitan' | 'income' | 'expense';
      sourceOrRecipient?: string;
    };

    const rows: LedgerRow[] = [];

    // Group jimpitan by date
    const jimpitanByDate = new Map<string, number>();
    state.jimpitanRecords
      .filter((r) => r.status === 'paid')
      .forEach((r) => {
        jimpitanByDate.set(r.date, (jimpitanByDate.get(r.date) || 0) + (r.amount || defaultAmt));
      });

    jimpitanByDate.forEach((amount, date) => {
      rows.push({
        id: `jimpitan-${date}`,
        date,
        title: `Penerimaan Iuran Kas Kelas (${state.classConfig.className})`,
        category: 'jimpitan',
        income: amount,
        expense: 0,
        type: 'jimpitan',
        sourceOrRecipient: 'Iuran Siswa',
      });
    });

    // Add general transactions
    state.transactions.forEach((tx) => {
      rows.push({
        id: tx.id,
        date: tx.date,
        title: tx.title,
        category: tx.category,
        income: tx.type === 'income' ? tx.amount : 0,
        expense: tx.type === 'expense' ? tx.amount : 0,
        type: tx.type,
        sourceOrRecipient: tx.recipientOrSource,
      });
    });

    // Sort ascending by date for cumulative balance calculation
    rows.sort((a, b) => a.date.localeCompare(b.date));

    // Calculate cumulative balance
    let runningBalance = 0;
    return rows.map((r) => {
      runningBalance += r.income - r.expense;
      return {
        ...r,
        runningBalance,
      };
    });
  }, [state.jimpitanRecords, state.transactions, state.classConfig.className, defaultAmt]);

  // Filtered ledger entries
  const filteredLedger = useMemo(() => {
    if (selectedMonth === 'all') return ledgerEntries;
    return ledgerEntries.filter((r) => r.date.startsWith(selectedMonth));
  }, [ledgerEntries, selectedMonth]);

  // Export to Excel CSV
  const handleExportCSV = () => {
    if (reportType === 'buku_kas') {
      const headers = ['No', 'Tanggal', 'Uraian Transaksi', 'Kategori', 'Pemasukan (Rp)', 'Pengeluaran (Rp)', 'Saldo Kas (Rp)'];
      const rows = filteredLedger.map((r, idx) => [
        String(idx + 1),
        r.date,
        r.title,
        r.category,
        String(r.income),
        String(r.expense),
        String(r.runningBalance),
      ]);
      exportToCSV(`Buku_Kas_${state.classConfig.className.replace(/\s+/g, '_')}.csv`, [headers, ...rows]);
    } else {
      const headers = ['No Absen', 'Nama Siswa', 'Jenis Kelamin', 'Total Iuran Disetor (Rp)', 'Jumlah Bayar', 'Status'];
      const rows = state.students.map((s) => {
        const metric = studentMetrics.get(s.id);
        return [
          s.studentNumber,
          s.name,
          s.gender,
          String(metric?.totalPaid || 0),
          String(metric?.paidCount || 0),
          s.isActive ? 'Aktif' : 'Non-Aktif',
        ];
      });
      exportToCSV(`Rekap_Siswa_${state.classConfig.className.replace(/\s+/g, '_')}.csv`, [headers, ...rows]);
    }
  };

  // Trigger Print Friendly PDF
  const handlePrint = () => {
    window.print();
  };

  // WhatsApp Message
  const handleShareWA = () => {
    const msg = createWeeklyKasReportMessage(state);
    openWhatsAppDirect('', msg);
  };

  return (
    <div className="space-y-4 pb-20 md:pb-6">
      {/* 1. Header Toolbar (Hidden in print) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-teal-700" />
            <span>Laporan & Rekap Pembukuan Kas</span>
          </h2>
          <p className="text-xs text-slate-500">
            Arus kas, rekapitulasi setoran siswa, ekspor Excel, dan cetak PDF resmi
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleShareWA}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition active:scale-95"
            title="Kirim Format Laporan WhatsApp"
          >
            <Share2 className="w-4 h-4" />
            <span>Kirim WA</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
            title="Unduh File CSV / Excel"
          >
            <Download className="w-4 h-4 text-teal-700" />
            <span>Unduh Excel</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-xs transition active:scale-95"
            title="Cetak Laporan / Simpan PDF"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak PDF</span>
          </button>
        </div>
      </div>

      {/* 2. Switcher Tab: Buku Kas vs Rekap Siswa (Hidden in print) */}
      <div className="print:hidden flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-xl">
          <button
            onClick={() => setReportType('buku_kas')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              reportType === 'buku_kas'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Buku Kas Arus Keuangan
          </button>
          <button
            onClick={() => setReportType('rekap_siswa')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              reportType === 'rekap_siswa'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Rekap Iuran per Siswa
          </button>
        </div>

        {/* Quick Month Filter for Buku Kas */}
        {reportType === 'buku_kas' && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Filter Bulan:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600/30"
            >
              <option value="all">Semua Periode</option>
              <option value="2026-09">September 2026</option>
              <option value="2026-08">Agustus 2026</option>
              <option value="2026-07">Juli 2026</option>
            </select>
          </div>
        )}
      </div>

      {/* 3. Printable Report Document Section */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-6 shadow-xs print:border-none print:shadow-none print:p-0">
        {/* Printable Official Kop Surat / Header */}
        <div className="text-center pb-4 mb-4 border-b-2 border-slate-800">
          <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-wide">
            {state.classConfig.schoolName}
          </h3>
          <h4 className="text-sm sm:text-base font-bold text-teal-900 uppercase">
            LAPORAN KEUANGAN BUKU KAS & IURAN KELAS
          </h4>
          <p className="text-xs text-slate-600 mt-0.5">
            {state.classConfig.className} • Tahun Ajaran {state.classConfig.academicYear}
          </p>
          <p className="text-[11px] text-slate-500">
            Dicetak pada: {formatDateIndo(new Date().toISOString().split('T')[0])}
          </p>
        </div>

        {/* Financial Summary Highlight Box */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-center">
          <div>
            <span className="text-[10px] sm:text-xs text-slate-500">Total Pemasukan</span>
            <div className="font-extrabold text-emerald-700 text-xs sm:text-base mt-0.5">
              {formatRupiah(totals.totalIncome)}
            </div>
          </div>
          <div>
            <span className="text-[10px] sm:text-xs text-slate-500">Total Pengeluaran</span>
            <div className="font-extrabold text-rose-700 text-xs sm:text-base mt-0.5">
              {formatRupiah(totals.totalExpense)}
            </div>
          </div>
          <div>
            <span className="text-[10px] sm:text-xs text-slate-500">Sisa Saldo Kas Akhir</span>
            <div className="font-extrabold text-teal-900 text-xs sm:text-base mt-0.5">
              {formatRupiah(totals.balance)}
            </div>
          </div>
        </div>

        {/* View A: Buku Kas Table */}
        {reportType === 'buku_kas' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 font-bold">
                  <th className="p-2.5 text-center w-10">No</th>
                  <th className="p-2.5 min-w-[95px]">Tanggal</th>
                  <th className="p-2.5 min-w-[200px]">Uraian Keterangan Transaksi</th>
                  <th className="p-2.5 text-right min-w-[100px]">Pemasukan</th>
                  <th className="p-2.5 text-right min-w-[100px]">Pengeluaran</th>
                  <th className="p-2.5 text-right min-w-[105px]">Saldo Kas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredLedger.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400">
                      Tidak ada catatan transaksi pada periode ini.
                    </td>
                  </tr>
                ) : (
                  filteredLedger.map((row, idx) => (
                    <tr key={row.id} className="hover:bg-slate-50/80">
                      <td className="p-2.5 text-center font-mono text-slate-500">{idx + 1}</td>
                      <td className="p-2.5 text-slate-700 whitespace-nowrap">
                        {formatDateShort(row.date)}
                      </td>
                      <td className="p-2.5 font-medium text-slate-900">
                        <div>{row.title}</div>
                        {row.sourceOrRecipient && (
                          <div className="text-[10px] text-slate-500">{row.sourceOrRecipient}</div>
                        )}
                      </td>
                      <td className="p-2.5 text-right font-semibold text-emerald-700">
                        {row.income > 0 ? formatRupiah(row.income) : '-'}
                      </td>
                      <td className="p-2.5 text-right font-semibold text-rose-700">
                        {row.expense > 0 ? formatRupiah(row.expense) : '-'}
                      </td>
                      <td className="p-2.5 text-right font-bold text-teal-900">
                        {formatRupiah(row.runningBalance)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                  <td colSpan={3} className="p-2.5 text-right">
                    TOTAL KAS:
                  </td>
                  <td className="p-2.5 text-right text-emerald-700 font-extrabold">
                    {formatRupiah(totals.totalIncome)}
                  </td>
                  <td className="p-2.5 text-right text-rose-700 font-extrabold">
                    {formatRupiah(totals.totalExpense)}
                  </td>
                  <td className="p-2.5 text-right text-teal-900 font-extrabold">
                    {formatRupiah(totals.balance)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* View B: Rekap Siswa Table */}
        {reportType === 'rekap_siswa' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 font-bold">
                  <th className="p-2.5 text-center w-12">Absen</th>
                  <th className="p-2.5 min-w-[180px]">Nama Siswa</th>
                  <th className="p-2.5 text-center w-14">L/P</th>
                  <th className="p-2.5 text-center min-w-[100px]">Frekuensi Bayar</th>
                  <th className="p-2.5 text-right min-w-[120px]">Total Iuran Masuk</th>
                  <th className="p-2.5 text-center min-w-[100px]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {state.students.map((student) => {
                  const metric = studentMetrics.get(student.id);
                  const totalPaid = metric?.totalPaid || 0;
                  const paidCount = metric?.paidCount || 0;
                  const isDisciplined = paidCount >= 2;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80">
                      <td className="p-2.5 text-center font-mono font-bold text-slate-600">
                        {student.studentNumber}
                      </td>
                      <td className="p-2.5 font-semibold text-slate-900">{student.name}</td>
                      <td className="p-2.5 text-center font-bold text-slate-600">{student.gender}</td>
                      <td className="p-2.5 text-center font-medium text-slate-700">
                        {paidCount} Kali Setor
                      </td>
                      <td className="p-2.5 text-right font-bold text-emerald-700">
                        {formatRupiah(totalPaid)}
                      </td>
                      <td className="p-2.5 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isDisciplined
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isDisciplined ? 'Disiplin' : 'Perlu Diingatkan'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Printable Official Signatures Footer */}
        <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-2 text-center text-xs">
          <div>
            <p className="text-slate-500">Mengetahui,</p>
            <p className="font-bold text-slate-900 mt-0.5">Wali Kelas</p>
            <div className="h-16" />
            <p className="font-bold text-slate-900 underline">{state.classConfig.homeroomTeacher}</p>
            <p className="text-[10px] text-slate-500">{state.classConfig.className}</p>
          </div>

          <div>
            <p className="text-slate-500">Purwokerto, {formatDateIndo(new Date().toISOString().split('T')[0])}</p>
            <p className="font-bold text-slate-900 mt-0.5">Bendahara Kelas</p>
            <div className="h-16" />
            <p className="font-bold text-slate-900 underline">{state.classConfig.treasurerName}</p>
            <p className="text-[10px] text-slate-500">Pengurus Kas & Iuran Kelas</p>
          </div>
        </div>
      </div>
    </div>
  );
};
