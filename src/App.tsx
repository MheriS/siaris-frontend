/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles, Users, Calendar, Trophy, Printer, FileText,
  LayoutDashboard, LogOut, Menu, X, Loader2
} from 'lucide-react';

import { Member, Period, Winner } from './types';
import {
  fetchMembers, createMember, updateMember, deleteMember, bulkImportMembers,
  fetchPeriods, createPeriod, setPeriodActive, setPeriodCompleted,
  fetchWinners, createWinner, deleteWinner,
} from './utils/api';

// Component imports
import AdminLogin from './components/AdminLogin';
import Dashboard from './components/Dashboard';
import MemberManagement from './components/MemberManagement';
import PeriodManagement from './components/PeriodManagement';
import OnlineLottery from './components/OnlineLottery';
import OfflineLottery from './components/OfflineLottery';
import WinnerHistory from './components/WinnerHistory';
import ReportView from './components/ReportView';
import LogoSumenep from './assets/Sumenep.png';

export default function App() {
  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('siaris_token') !== null;
  });
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const saved = localStorage.getItem('siaris_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Database states from API
  const [members, setMembers] = useState<Member[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);

  // UI state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Load data from API
  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const [membersData, periodsData, winnersData] = await Promise.all([
        fetchMembers(),
        fetchPeriods(),
        fetchWinners(),
      ]);
      setMembers(membersData);
      setPeriods(periodsData);
      setWinners(winnersData);
    } catch (err: any) {
      console.error('Error loading data:', err);
      setLoadError(err.message || 'Gagal memuat data dari server.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch from API on login
  useEffect(() => {
    if (isLoggedIn) {
      loadAllData();
    }
  }, [isLoggedIn, loadAllData]);

  // Auth Handlers
  const handleLoginSuccess = (user: any) => {
    setIsLoggedIn(true);
    setCurrentUser(user);
    localStorage.setItem('siaris_user', JSON.stringify(user));
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem('siaris_token');
    localStorage.removeItem('siaris_user');
    setMembers([]);
    setPeriods([]);
    setWinners([]);
    setActiveTab('dashboard');
  };

  // Member CRUD Handlers
  const handleAddMember = async (newMem: Omit<Member, 'id'>) => {
    try {
      const created = await createMember(newMem);
      setMembers(prev => [...prev, created]);
      alert('Sukses menambah anggota!');
    } catch (err: any) {
      alert('Gagal menambahkan anggota: ' + err.message);
    }
  };

  const handleUpdateMember = async (updatedMem: Member) => {
    try {
      const updated = await updateMember(updatedMem);
      setMembers(prev => prev.map(m => m.id === updated.id ? updated : m));
      alert('Sukses mengubah data anggota!');
    } catch (err: any) {
      alert('Gagal mengubah anggota: ' + err.message);
    }
  };

  const handleDeleteMember = async (id: string) => {
    try {
      await deleteMember(id);
      setMembers(prev => prev.filter(m => m.id !== id));
      setWinners(prev => prev.filter(w => w.memberId !== id));
      alert('Sukses menghapus anggota!');
    } catch (err: any) {
      alert('Gagal menghapus anggota: ' + err.message);
    }
  };

  const handleBulkImport = async (newMembersList: Omit<Member, 'id'>[]) => {
    try {
      const created = await bulkImportMembers(newMembersList);
      setMembers(prev => [...prev, ...created]);
      alert('Sukses import ' + created.length + ' anggota!');
    } catch (err: any) {
      alert('Gagal import anggota: ' + err.message);
    }
  };

  // Period management handlers
  const handleAddPeriod = async (newPer: Omit<Period, 'id'>) => {
    try {
      await createPeriod(newPer);
      // Reload periods since server deactivates old ones
      const updated = await fetchPeriods();
      setPeriods(updated);
      alert('Sukses menambah periode baru!');
    } catch (err: any) {
      alert('Gagal menambah periode: ' + err.message);
    }
  };

  const handleClosePeriod = async (id: string) => {
    try {
      await setPeriodCompleted(id);
      setPeriods(prev => prev.map(p => p.id === id ? { ...p, status: 'Selesai' as const } : p));
      alert('Periode berhasil diselesaikan!');
    } catch (err: any) {
      alert('Gagal menutup periode: ' + err.message);
    }
  };

  const handleSetPeriodActive = async (id: string) => {
    try {
      await setPeriodActive(id);
      // Reload since server deactivates other active periods
      const updated = await fetchPeriods();
      setPeriods(updated);
      alert('Periode berhasil diaktifkan!');
    } catch (err: any) {
      alert('Gagal mengaktifkan periode: ' + err.message);
    }
  };

  // Winners handlers
  const handleSaveWinner = async (newWinBefore: Omit<Winner, 'id'>) => {
    try {
      const created = await createWinner(newWinBefore);
      setWinners(prev => [...prev, created]);
      if (newWinBefore.jenisUndian === 'Offline') {
        alert('Catatan pemenang manual berhasil ditambahkan!');
      }
      return created;
    } catch (err: any) {
      alert('Gagal menyimpan pemenang: ' + err.message);
      throw err;
    }
  };

  const handleDeleteWinner = async (id: string) => {
    try {
      await deleteWinner(id);
      setWinners(prev => prev.filter(w => w.id !== id));
      alert('Catatan pemenang berhasil dihapus!');
    } catch (err: any) {
      alert('Gagal menghapus pemenang: ' + err.message);
    }
  };

  // Refresh data helper (for lottery)
  const refreshWinners = async () => {
    try {
      const fresh = await fetchWinners();
      setWinners(fresh);
    } catch (err) {
      console.error('Failed to refresh winners:', err);
    }
  };

  // Routing render helper
  const renderTabContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-400" />
          <p className="text-sm font-semibold">Memuat data dari server...</p>
        </div>
      );
    }

    if (loadError) {
      return (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
          <p className="text-rose-400 text-sm font-semibold">⚠️ {loadError}</p>
          <button
            onClick={loadAllData}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs cursor-pointer"
          >
            Coba Muat Ulang
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            members={members}
            periods={periods}
            winners={winners}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        );
      case 'anggota':
        return (
          <MemberManagement
            members={members}
            onAddMember={handleAddMember}
            onUpdateMember={handleUpdateMember}
            onDeleteMember={handleDeleteMember}
            onBulkImport={handleBulkImport}
          />
        );
      case 'periode':
        return (
          <PeriodManagement
            periods={periods}
            onAddPeriod={handleAddPeriod}
            onClosePeriod={handleClosePeriod}
            onSetPeriodActive={handleSetPeriodActive}
          />
        );
      case 'online':
        return (
          <OnlineLottery
            members={members}
            periods={periods}
            winners={winners}
            onSaveWinner={handleSaveWinner}
            onRefreshWinners={refreshWinners}
          />
        );
      case 'offline':
        return (
          <OfflineLottery
            members={members}
            winners={winners}
          />
        );
      case 'riwayat':
        return (
          <WinnerHistory
            winners={winners}
            members={members}
            periods={periods}
            onAddManualWinner={handleSaveWinner}
            onDeleteWinner={handleDeleteWinner}
          />
        );
      case 'laporan':
        return (
          <ReportView
            members={members}
            periods={periods}
            winners={winners}
          />
        );
      default:
        return <div className="text-center py-12">Tab tidak ditemukan.</div>;
    }
  };

  // If unauthorized, showcase the DWP Login screen
  if (!isLoggedIn) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  const menuItems = [
    { id: 'dashboard', label: 'Monitor Dashboard', icon: LayoutDashboard },
    { id: 'anggota', label: 'Kelola Anggota', icon: Users },
    { id: 'periode', label: 'Periode Arisan', icon: Calendar },
    { id: 'online', label: 'Undian Online', icon: Sparkles },
    { id: 'offline', label: 'Cetak Tag Offline', icon: Printer },
    { id: 'riwayat', label: 'Riwayat Pemenang', icon: Trophy },
    { id: 'laporan', label: 'Laporan & Rekap', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row antialiased text-slate-100 relative overflow-hidden font-sans">

      {/* Background Mesh Gradients */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden no-print">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/15 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-600/15 blur-[120px]" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-indigo-600/10 blur-[100px]" />
      </div>

      {/* 1. SOLID SIDE NAVIGATION BAR */}
      <aside className="w-64 z-10 backdrop-blur-xl bg-white/5 border-r border-white/10 shrink-0 hidden md:flex flex-col justify-between py-8 px-4 select-none duration-300 no-print">
        <div className="space-y-8">
          {/* Brand/App Identity */}
          <div className="px-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-12 flex items-center justify-center shrink-0">
                <img
                  src={LogoSumenep}
                  alt="Logo Pemda Sumenep"
                  className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(59,130,246,0.2)]"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h1 className="text-md font-bold leading-tight text-white">
                  SIARIS
                </h1>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold font-display">DWP PUTR SUMENEP</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {menuItems.map(item => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer ${isActive
                    ? 'bg-white/10 border border-white/15 text-white shadow-md shadow-black/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <IconComp className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User profile block & logout */}
        <div className="pt-6 border-t border-white/10 px-2">
          <div className="p-4 rounded-xl bg-[#1e293b]/50 border border-white/5 flex items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px]">Admin Aktif</span>
              <span className="font-semibold text-slate-200">{currentUser?.name || 'Sekretariat DWP'}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-rose-400 bg-white/5 hover:bg-rose-500/10 rounded-lg border border-white/10 transition-all cursor-pointer"
              title="Keluar Sistem"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. RESPONSIVE MOBILE NAVIGATION DRAWER */}
      <header className="md:hidden z-20 backdrop-blur-xl bg-slate-950/80 text-white px-4 py-3 pb-4 flex items-center justify-between border-b border-white/10 no-print select-none">
        <div className="flex items-center gap-2">
          <div className="w-8 h-10 flex items-center justify-center shrink-0">
            <img
              src={LogoSumenep}
              alt="Logo Pemda Sumenep"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h1 className="text-sm font-bold">SIARIS</h1>
            <p className="text-[9px] text-slate-400">DWP PUPR Sumenep</p>
          </div>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Drawer Menu Layer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[56px] bg-slate-950/80 z-40 backdrop-blur-sm no-print select-none animate-fade-in">
          <div className="bg-slate-900 border-b border-white/10 p-4 space-y-4 shadow-xl">
            <nav className="space-y-1">
              {menuItems.map(item => {
                const IconComp = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold transition-all text-left ${isActive
                      ? 'bg-white/10 text-white border border-white/15'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    <IconComp className="w-4 h-4 text-blue-400" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <button
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              className="w-full py-3 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500 hover:text-white text-rose-300 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Keluar Sesi Admin
            </button>
          </div>
        </div>
      )}

      {/* 3. CORE PAGE CANVAS CONTAINER */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-full z-10">
        {renderTabContent()}
      </main>

    </div>
  );
}
