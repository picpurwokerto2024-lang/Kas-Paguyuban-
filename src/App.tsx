import React, { useState } from 'react';
import { useKasStore } from './hooks/useKasStore';
import { TabType } from './types';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { OfflineIndicator } from './components/OfflineIndicator';
import { DashboardView } from './components/DashboardView';
import { WaliMuridView } from './components/WaliMuridView';
import { JimpitanView } from './components/JimpitanView';
import { BukuKasView } from './components/BukuKasView';
import { SiswaView } from './components/SiswaView';
import { SavingsGoalView } from './components/SavingsGoalView';
import { LaporanView } from './components/LaporanView';
import { SettingsView } from './components/SettingsView';
import { PinModal } from './components/PinModal';
import { Eye, ShieldCheck } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [initialKasModal, setInitialKasModal] = useState<'income' | 'expense' | null>(null);
  const [previewWaliMurid, setPreviewWaliMurid] = useState(false);

  // Admin PIN Protection State
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('KAS_ADMIN_UNLOCKED') === 'true';
    }
    return false;
  });
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinModalTitle, setPinModalTitle] = useState('Masukkan PIN Pengurus');
  const [pinModalDesc, setPinModalDesc] = useState(
    'Akses khusus Admin & Bendahara untuk mencatat atau mengubah data kas.'
  );
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const {
    state,
    totals,
    studentMetrics,
    toggleJimpitanStatus,
    toggleMonthlyJimpitanStatus,
    setJimpitanRecord,
    markAllPaidForDate,
    markAllPaidForMonth,
    resetRecordsForDate,
    resetRecordsForMonth,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addStudent,
    updateStudent,
    deleteStudent,
    bulkImportStudents,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    updateConfig,
    exportBackupJSON,
    importBackupJSON,
    resetToSampleData,
    clearAllData,
    syncStatus,
    lastSyncedAt,
    triggerManualSync,
  } = useKasStore();

  const currentAdminPin = state?.classConfig?.adminPin || '1234';

  const unlockAdmin = () => {
    setIsAdminUnlocked(true);
    setPreviewWaliMurid(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('KAS_ADMIN_UNLOCKED', 'true');
    }
  };

  const lockAdmin = () => {
    setIsAdminUnlocked(false);
    setPreviewWaliMurid(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('KAS_ADMIN_UNLOCKED');
    }
    setActiveTab('dashboard');
  };

  const requireAdmin = (action: () => void, title?: string, desc?: string) => {
    if (isAdminUnlocked) {
      action();
    } else {
      setPendingAction(() => action);
      if (title) setPinModalTitle(title);
      else setPinModalTitle('Masukkan PIN Pengurus');
      if (desc) setPinModalDesc(desc);
      else setPinModalDesc('Akses khusus Admin & Bendahara untuk mencatat atau mengubah data kas.');
      setIsPinModalOpen(true);
    }
  };

  const handlePinSuccess = () => {
    unlockAdmin();
    if (pendingAction) {
      const act = pendingAction;
      setPendingAction(null);
      setTimeout(() => {
        act();
      }, 60);
    }
  };

  const handleOpenSettings = () => {
    requireAdmin(
      () => setActiveTab('settings'),
      'Buka Pengaturan Kelas',
      'Masukkan PIN Admin / Bendahara untuk membuka dan mengubah pengaturan kas, nominal, & identitas kelas.'
    );
  };

  const handleSelectTab = (tab: TabType) => {
    if (tab === 'settings') {
      handleOpenSettings();
    } else {
      setActiveTab(tab);
    }
  };

  const isShowingWaliMuridView = !isAdminUnlocked || previewWaliMurid;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans antialiased selection:bg-teal-200 selection:text-teal-900">
      {/* Offline Status Bar */}
      <OfflineIndicator />

      {/* Main Header with Real-Time Cloud Sync State */}
      <Header
        classConfig={state?.classConfig}
        isAdminUnlocked={isAdminUnlocked}
        onLockAdmin={lockAdmin}
        onRequestUnlock={() =>
          requireAdmin(
            () => {},
            'Buka Akses Pengurus',
            'Masukkan PIN Admin & Bendahara untuk mengaktifkan mode pengisian data kas.'
          )
        }
        onOpenSettings={handleOpenSettings}
        syncStatus={syncStatus}
        onManualSync={triggerManualSync}
      />

      {/* Admin Quick Switch Preview Bar */}
      {isAdminUnlocked && (
        <div className="bg-emerald-800 text-white px-3 sm:px-6 py-1.5 flex items-center justify-between text-xs shadow-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span className="font-semibold">
              Mode Pengurus Aktif {previewWaliMurid ? '(Sedang Melihat Tampilan Wali Murid)' : ''}
            </span>
          </div>

          <button
            onClick={() => setPreviewWaliMurid(!previewWaliMurid)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white font-medium text-[11px] transition active:scale-95"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{previewWaliMurid ? 'Kembali ke Menu Pengurus' : 'Lihat Tampilan Wali Murid'}</span>
          </button>
        </div>
      )}

      {/* Desktop & Mobile Navigation Bar (Only for Unlocked Admin Mode) */}
      {isAdminUnlocked && !previewWaliMurid && (
        <Navigation
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          unpaidCountToday={totals.todayUnpaidCount}
          classConfig={state?.classConfig}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-5">
        {/* If in Public / Wali Murid Mode: Show the dedicated transparent dashboard */}
        {isShowingWaliMuridView ? (
          <WaliMuridView
            state={state}
            totals={totals}
            studentMetrics={studentMetrics}
            onRequestAdminLogin={() =>
              requireAdmin(
                () => {},
                'Login Pengurus Kelas',
                'Masukkan PIN Admin / Bendahara untuk mengelola iuran dan pembukuan.'
              )
            }
            syncStatus={syncStatus}
            lastSyncedAt={lastSyncedAt}
          />
        ) : (
          /* Admin / Treasurer Full Management Views */
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                state={state}
                totals={totals}
                onNavigateTab={handleSelectTab}
                onOpenAddTransaction={(type) => {
                  requireAdmin(() => {
                    setInitialKasModal(type);
                    setActiveTab('kas');
                  });
                }}
                onMarkAllPaidToday={() => {
                  requireAdmin(() => {
                    markAllPaidForDate(new Date().toISOString().split('T')[0]);
                  });
                }}
              />
            )}

            {activeTab === 'jimpitan' && (
              <JimpitanView
                state={state}
                studentMetrics={studentMetrics}
                onToggleStatus={(studentId, date, customAmt, method) => {
                  requireAdmin(() => toggleJimpitanStatus(studentId, date, customAmt, method));
                }}
                onToggleMonthlyStatus={(studentId, month, customAmt, method) => {
                  requireAdmin(() => toggleMonthlyJimpitanStatus(studentId, month, customAmt, method));
                }}
                onSetRecord={(rec) => {
                  requireAdmin(() => setJimpitanRecord(rec));
                }}
                onMarkAllPaid={(date, method) => {
                  requireAdmin(() => markAllPaidForDate(date, method));
                }}
                onMarkAllPaidMonth={(month, method) => {
                  requireAdmin(() => markAllPaidForMonth(month, method));
                }}
                onResetDate={(date) => {
                  requireAdmin(() => resetRecordsForDate(date));
                }}
                onResetMonth={(month) => {
                  requireAdmin(() => resetRecordsForMonth(month));
                }}
              />
            )}

            {activeTab === 'kas' && (
              <BukuKasView
                state={state}
                onAddTransaction={(tx) => requireAdmin(() => addTransaction(tx))}
                onUpdateTransaction={(id, updates) => requireAdmin(() => updateTransaction(id, updates))}
                onDeleteTransaction={(id) => requireAdmin(() => deleteTransaction(id))}
                initialOpenModal={initialKasModal}
                onCloseInitialModal={() => setInitialKasModal(null)}
              />
            )}

            {activeTab === 'siswa' && (
              <SiswaView
                state={state}
                studentMetrics={studentMetrics}
                onAddStudent={(s) => requireAdmin(() => addStudent(s))}
                onUpdateStudent={(id, updates) => requireAdmin(() => updateStudent(id, updates))}
                onDeleteStudent={(id) => requireAdmin(() => deleteStudent(id))}
                onBulkImport={(names) => requireAdmin(() => bulkImportStudents(names))}
              />
            )}

            {activeTab === 'celengan' && (
              <SavingsGoalView
                state={state}
                totals={totals}
                onAddGoal={(g) => requireAdmin(() => addSavingsGoal(g))}
                onUpdateGoal={(id, updates) => requireAdmin(() => updateSavingsGoal(id, updates))}
                onDeleteGoal={(id) => requireAdmin(() => deleteSavingsGoal(id))}
              />
            )}

            {activeTab === 'laporan' && (
              <LaporanView
                state={state}
                totals={totals}
                studentMetrics={studentMetrics}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                state={state}
                onUpdateConfig={updateConfig}
                onExportBackup={exportBackupJSON}
                onImportBackup={importBackupJSON}
                onResetToSample={resetToSampleData}
                onClearAll={clearAllData}
              />
            )}
          </>
        )}
      </main>

      {/* Security PIN Modal */}
      <PinModal
        isOpen={isPinModalOpen}
        onClose={() => {
          setIsPinModalOpen(false);
          setPendingAction(null);
        }}
        onSuccess={handlePinSuccess}
        correctPin={currentAdminPin}
        title={pinModalTitle}
        description={pinModalDesc}
      />
    </div>
  );
}

export default App;


