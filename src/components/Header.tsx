import React from 'react';
import { ClassConfig } from '../types';
import { Calendar, School, UserCheck, Lock, Unlock, RefreshCw, CloudCheck } from 'lucide-react';
import { formatDateIndo } from '../services/utils';

interface HeaderProps {
  classConfig?: ClassConfig;
  isAdminUnlocked: boolean;
  onLockAdmin: () => void;
  onRequestUnlock: () => void;
  onOpenSettings: () => void;
  syncStatus?: 'synced' | 'syncing' | 'offline' | 'error';
  onManualSync?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  classConfig,
  isAdminUnlocked,
  onLockAdmin,
  onRequestUnlock,
  onOpenSettings,
  syncStatus = 'synced',
  onManualSync,
}) => {
  const todayStr = formatDateIndo(new Date().toISOString().split('T')[0]);
  const classNameDisplay = classConfig?.className || 'Kas Kelas';
  const schoolNameDisplay = classConfig?.schoolName || 'Kas Sekolah Mandiri';
  const treasurerShort = classConfig?.treasurerName ? classConfig.treasurerName.split(' ')[0] : 'Bendahara';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-2">
        {/* Left: Brand & Class Info */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-teal-800 to-teal-600 flex items-center justify-center text-white shadow-xs shrink-0">
            <span className="text-lg select-none" role="img" aria-label="Iuran Kas Sekolah">
              🏺
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-xs sm:text-sm font-bold text-slate-900 truncate tracking-tight">
                {classNameDisplay}
              </h1>

              {/* Real-Time Sync Indicator */}
              <button
                onClick={onManualSync}
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium border transition ${
                  syncStatus === 'synced'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : syncStatus === 'syncing'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
                title="Status Sinkronisasi Cloud Real-Time (Klik untuk sinkronkan)"
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    syncStatus === 'synced'
                      ? 'bg-emerald-500'
                      : syncStatus === 'syncing'
                      ? 'bg-blue-500 animate-spin'
                      : 'bg-amber-500'
                  }`}
                />
                <span className="hidden xs:inline">
                  {syncStatus === 'synced'
                    ? 'Live Sync'
                    : syncStatus === 'syncing'
                    ? 'Menyinkronkan...'
                    : 'Lokal (Offline)'}
                </span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 truncate">
              <span className="truncate flex items-center gap-1">
                <School className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate">{schoolNameDisplay}</span>
              </span>
              <span className="hidden sm:inline text-slate-300">•</span>
              <span className="hidden sm:inline-flex items-center gap-1 text-slate-500">
                <UserCheck className="w-3 h-3 text-slate-400" />
                {treasurerShort}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions & PWA Button */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-medium border border-slate-200">
            <Calendar className="w-3 h-3 text-teal-600" />
            <span>{todayStr}</span>
          </div>

          {/* Admin PIN Lock Status Toggle */}
          {isAdminUnlocked ? (
            <button
              onClick={onLockAdmin}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition shadow-xs active:scale-95"
              title="Klik untuk mengunci ke Mode Wali Murid / Tamu"
            >
              <Unlock className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Mode Pengurus</span>
              <span className="text-[10px] bg-emerald-200/80 px-1.5 py-0.2 rounded-md font-mono">Kunci</span>
            </button>
          ) : (
            <button
              onClick={onRequestUnlock}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs active:scale-95"
              title="Masukkan PIN untuk membuka akses edit Bendahara & Admin"
            >
              <Lock className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden xs:inline">Login</span>
              <span>Pengurus</span>
            </button>
          )}

          {isAdminUnlocked && (
            <button
              onClick={onOpenSettings}
              className="p-1.5 sm:p-2 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition border border-slate-200"
              title="Pengaturan Kas & PIN Kelas"
            >
              <span className="text-sm sm:text-base leading-none">⚙️</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};


