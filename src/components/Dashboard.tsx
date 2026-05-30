/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Users, UserCheck, Calendar, Trophy, ChevronRight, Sparkles, Printer, UserPlus } from 'lucide-react';
import { Member, Period, Winner } from '../types';

interface DashboardProps {
  members: Member[];
  periods: Period[];
  winners: Winner[];
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ members, periods, winners, onNavigate }: DashboardProps) {
  const activeMembersCount = members.filter(m => m.status === 'Aktif').length;
  const activePeriod = periods.find(p => p.status === 'Aktif') || periods[periods.length - 1];
  const lastWinner = winners[winners.length - 1];

  // Group members by Department (Bidang) for inline chart
  const bidangCounts = members.reduce((acc, m) => {
    if (m.status === 'Aktif') {
      acc[m.bidang] = (acc[m.bidang] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const bidangEntries = Object.entries(bidangCounts);
  const totalActives = activeMembersCount || 1;

  // Modern soft pastel color scheme for divisions
  const colorMap: Record<string, string> = {
    'Sekretariat': '#f59e0b', // amber
    'Bina Marga': '#3b82f6',  // blue
    'Cipta Karya': '#06b6d4',  // cyan
    'Sumber Daya Air': '#10b981', // emerald
    'Tata Ruang': '#8b5cf6', // violet
    'Jasa Konstruksi': '#ec4899' // pink
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* Hero Welcome banner */}
      <div className="relative backdrop-blur-xl bg-white/5 rounded-2xl p-6 md:p-8 text-white shadow-xl overflow-hidden border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-teal-600/10 to-transparent mix-blend-color-dodge" />
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-display">
              Selamat Datang di Portal <span className="text-blue-400">SIARIS</span>
            </h1>
            <p className="text-sm text-slate-300 max-w-xl font-normal leading-relaxed">
              Platform Manajemen Arisan Dharma Wanita Persatuan Dinas Pekerjaan Umum dan Tata Ruang (PUTR) Kabupaten Sumenep. Kelola data dan lakukan undian secara mandiri.
            </p>
          </div>
          <div className="inline-flex self-stretch md:self-auto gap-3 items-center">
            <button
              onClick={() => onNavigate('online')}
              className="px-5 py-3 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 border border-white/15 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-blue-300" />
              Undian Online
            </button>
            <button
              onClick={() => onNavigate('offline')}
              className="px-5 py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 border border-white/10 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-300" />
              Cetak Offline
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Anggota */}
        <div
          onClick={() => onNavigate('anggota')}
          className="backdrop-blur-xl bg-white/5 p-6 rounded-2xl shadow-lg border border-white/10 hover:border-blue-500/50 hover:bg-white/10 transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Anggota</p>
              <h3 className="text-3xl font-extrabold text-white group-hover:text-blue-400 transition-colors">{members.length}</h3>
              <p className="text-xs text-slate-400 mt-2">
                Seluruh pengurus & anggota terdaftar
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 shadow-sm border border-white/5">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Anggota Aktif */}
        <div
          onClick={() => onNavigate('anggota')}
          className="backdrop-blur-xl bg-white/5 p-6 rounded-2xl shadow-lg border border-white/10 hover:border-teal-500/50 hover:bg-white/10 transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Anggota Aktif</p>
              <h3 className="text-3xl font-extrabold text-white group-hover:text-teal-400 transition-colors">{activeMembersCount}</h3>
              <p className="text-xs text-teal-400 mt-2 flex items-center gap-1 font-medium">
                • {members.length - activeMembersCount} nonaktif
              </p>
            </div>
            <div className="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center text-teal-400 shadow-sm border border-white/5">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Periode Aktif */}
        <div
          onClick={() => onNavigate('periode')}
          className="backdrop-blur-xl bg-white/5 p-6 rounded-2xl shadow-lg border border-white/10 hover:border-indigo-500/50 hover:bg-white/10 transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Periode Berjalan</p>
              <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors truncate max-w-[160px]">
                {activePeriod ? activePeriod.namaPeriode : 'Tidak Ada'}
              </h3>
              <p className="text-xs text-slate-400 mt-2">
                Tahun {activePeriod?.tahun || 2026} • {periods.filter(p => p.status === 'Selesai').length} Selesai
              </p>
            </div>
            <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 shadow-sm border border-white/5">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Pemenang Terakhir */}
        <div
          onClick={() => onNavigate('riwayat')}
          className="backdrop-blur-xl bg-gradient-to-br from-blue-500/20 to-teal-500/20 p-6 rounded-2xl border border-white/15 text-white hover:border-white/25 hover:shadow-lg transition-all cursor-pointer relative overflow-hidden"
        >
          <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-teal-400 rounded-full opacity-10 pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Pemenang Terakhir</p>
              {lastWinner ? (
                <>
                  <h3 className="text-md font-bold truncate max-w-[150px] text-white">{lastWinner.memberName}</h3>
                  <p className="text-xs font-semibold bg-white/10 text-teal-300 px-2 py-0.5 rounded-full inline-block border border-white/5 mt-1">
                    {lastWinner.memberBidang}
                  </p>
                  <p className="text-[10px] text-slate-400 block mt-1">
                    Periode: {lastWinner.periodName}
                  </p>
                </>
              ) : (
                <p className="text-xs font-medium text-slate-300">Belum ada undian</p>
              )}
            </div>
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-amber-400 border border-white/10">
              <Trophy className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Analytical visual breakdown & Quick logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Distribution of Members inside PUPR departments */}
        <div className="backdrop-blur-xl bg-white/5 p-6 rounded-2xl border border-white/10 lg:col-span-8 flex flex-col shadow-lg">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
            <div>
              <h4 className="text-base font-bold text-white leading-tight">Sebaran Anggota per Bidang</h4>
              <p className="text-xs text-slate-400 mt-1">Representasi proporsi staf perempuan per divisi DWP PUTR Sumenep</p>
            </div>
            <span className="text-xs font-bold text-white bg-white/10 border border-white/10 px-3 py-1 rounded-full">
              {activeMembersCount} Aktif
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center flex-1">
            {/* Visual Bar Breakdown Chart */}
            <div className="md:col-span-3 space-y-4">
              {bidangEntries.map(([bidang, count]) => {
                const percentage = Math.round((count / totalActives) * 100);
                const color = colorMap[bidang] || '#64748b';
                return (
                  <div key={bidang} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300">{bidang}</span>
                      <span className="font-bold text-white">{count} anggota ({percentage}%)</span>
                    </div>
                    <div className="h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: color
                        }}
                      />
                    </div>
                  </div>
                );
              })}
              {bidangEntries.length === 0 && (
                <p className="text-sm text-slate-400 italic text-center">Data anggota kosong / nonaktif.</p>
              )}
            </div>

            {/* Custom crafted circular visual KPI */}
            <div className="md:col-span-2 flex flex-col items-center justify-center p-4 border border-white/10 rounded-xl bg-white/5">
              <svg className="w-28 h-28 transform -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r="45"
                  className="stroke-white/5"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="56"
                  cy="56"
                  r="45"
                  className="stroke-blue-500"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - activeMembersCount / (members.length || 1))}`}
                />
              </svg>
              <div className="text-center mt-3">
                <span className="text-xl font-black text-white block">
                  {Math.round((activeMembersCount / (members.length || 1)) * 100)}%
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                  Rasio Keaktifan
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action Pane */}
        <div className="backdrop-blur-xl bg-white/5 p-6 rounded-2xl border border-white/10 lg:col-span-4 space-y-6 shadow-lg">
          <div>
            <h4 className="text-base font-bold text-white">Aksi Pintar Pengurus</h4>
            <p className="text-xs text-slate-400 mt-1">Menu pintas pengoperasian sistem</p>
          </div>

          <div className="space-y-3">
            {[
              { title: 'Undian Online', desc: 'Mulai putar pengundian acak digital', icon: Sparkles, tab: 'online', hoverBorder: 'hover:border-blue-500/50 hover:bg-white/10' },
              { title: 'Cetak Nama Offline', desc: 'Mempersiapkan potongan arisan manual', icon: Printer, tab: 'offline', hoverBorder: 'hover:border-teal-500/50 hover:bg-white/10' },
              { title: 'Pendaftaran Anggota', desc: 'Menambahkan anggota secara manual/massal', icon: UserPlus, tab: 'anggota', hoverBorder: 'hover:border-indigo-500/50 hover:bg-white/10' },
            ].map((act, i) => (
              <button
                key={i}
                onClick={() => onNavigate(act.tab)}
                className={`w-full p-4 rounded-xl bg-white/5 border border-white/10 text-left transition-all flex items-center justify-between group cursor-pointer ${act.hoverBorder}`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-blue-400 group-hover:text-teal-400 transition-colors">
                    <act.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-sm">{act.title}</h5>
                    <p className="text-xs text-slate-400 mt-0.5">{act.desc}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-white/10 text-center">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block">
              Dinas Pekerjaan Umum & Tata Ruang
            </span>
            <span className="text-[9px] text-slate-500 block mt-0.5">
              Kabupaten Sumenep, Jawa Timur
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
