/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Trophy, Search, FileDown, Plus, X, Check, Calendar, Trash2 } from 'lucide-react';
import { Winner, Member, Period } from '../types';
import { exportWinnersToCSV } from '../utils/exportUtils';
import logoDharmawanita from '../assets/DharmaWanita.png';

interface WinnerHistoryProps {
  winners: Winner[];
  members: Member[];
  periods: Period[];
  onAddManualWinner: (winner: Omit<Winner, 'id'>) => void;
  onDeleteWinner: (id: string) => void;
}

export default function WinnerHistory({
  winners, members, periods, onAddManualWinner, onDeleteWinner
}: WinnerHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('Semua');
  const [isManualInputOpen, setIsManualInputOpen] = useState(false);

  // Manual input state
  const [formData, setFormData] = useState({
    periodId: '',
    memberId: '',
    tanggalUndian: new Date().toISOString().split('T')[0]
  });

  // Extract unique years from winner records for filtering
  const uniqueYears = Array.from(
    new Set(winners.map(w => new Date(w.tanggalUndian).getFullYear()))
  ).sort((a, b) => b - a);

  // Filters winners list
  const filteredWinners = winners.filter(w => {
    const matchesSearch =
      w.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.memberBidang.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.periodName.toLowerCase().includes(searchQuery.toLowerCase());

    const winYear = new Date(w.tanggalUndian).getFullYear();
    const matchesYear = selectedYear === 'Semua' || String(winYear) === selectedYear;

    return matchesSearch && matchesYear;
  });

  // Candidates for manual input (Active members and have NOT won already)
  const activeMembersOnly = members.filter(m => m.status === 'Aktif');
  const wonIds = winners.map(w => w.memberId);
  const eligibleMembers = activeMembersOnly.filter(m => !wonIds.includes(m.id));

  // Active periods list for manual input selection
  const selectablePeriods = periods.filter(p => p.status === 'Aktif');

  const openManualInput = () => {
    setFormData({
      periodId: selectablePeriods[0]?.id || periods[0]?.id || '',
      memberId: eligibleMembers[0]?.id || '',
      tanggalUndian: new Date().toISOString().split('T')[0]
    });
    setIsManualInputOpen(true);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedMember = members.find(m => m.id === formData.memberId);
    const selectedPeriod = periods.find(p => p.id === formData.periodId);

    if (!selectedMember || !selectedPeriod) {
      alert('Mohon pilih Anggota dan Periode yang sesuai.');
      return;
    }

    onAddManualWinner({
      periodId: formData.periodId,
      periodName: selectedPeriod.namaPeriode,
      memberId: formData.memberId,
      memberName: selectedMember.namaLengkap,
      memberBidang: selectedMember.bidang,
      tanggalUndian: formData.tanggalUndian,
      jenisUndian: 'Offline'
    });

    setIsManualInputOpen(false);
  };

  const handleDeleteWinnerRecord = (id: string, name: string) => {
    if (window.confirm(`Hapus catatan pemenang "${name}"? Tindakan ini akan mengembalikan anggota tersebut ke pool nomine.`)) {
      onDeleteWinner(id);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="no-print space-y-6">
        {/* Header operations pane */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 backdrop-blur-xl bg-white/5 p-6 rounded-2xl border border-white/10 shadow-lg text-white font-sans">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2 font-display">
              <Trophy className="w-6 h-6 text-blue-400" />
              Riwayat Riil Pemenang Arisan
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Arsip digital para pemenang, terintegrasi otomatis baik dari undian online maupun undian offline manual
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => exportWinnersToCSV(winners)}
              className="flex-1 md:flex-none px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-350 font-bold rounded-xl text-xs transition-all hover:text-white cursor-pointer flex items-center justify-center gap-2"
            >
              <FileDown className="w-4 h-4 text-slate-400" />
              Ekspor CSV
            </button>

            <button
              onClick={() => window.print()}
              className="flex-1 md:flex-none px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-350 font-bold rounded-xl text-xs transition-all hover:text-white cursor-pointer flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4 text-teal-400" />
              Cetak Penerima
            </button>

            <button
              onClick={openManualInput}
              className="w-full md:w-auto px-5 py-2.5 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 border border-white/15 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-white" />
              Input Offline Manual
            </button>
          </div>
        </div>

        {/* Filter Options */}
        <div className="backdrop-blur-xl bg-white/5 p-6 rounded-2xl border border-white/10 shadow-lg text-white font-sans">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Quick search input */}
            <div className="md:col-span-2 relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Cari nama pemenang, bidang, periode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/25 text-slate-200 font-medium placeholder-slate-500"
              />
            </div>

            {/* Year Filter */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Calendar className="w-4 h-4" />
              </span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs focus:outline-none text-slate-200 font-medium cursor-pointer"
              >
                <option value="Semua" className="bg-slate-905 text-white">Semua Tahun</option>
                {uniqueYears.map(yr => (
                  <option key={yr} value={String(yr)} className="bg-slate-905 text-white">Tahun {yr}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Main Winners Records Grid */}
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 shadow-lg overflow-hidden text-white font-sans">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="backdrop-blur-md bg-white/5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-white/10">
                  <th className="px-6 py-4">ID Undian</th>
                  <th className="px-6 py-4">Periode</th>
                  <th className="px-6 py-4">Nama Lengkap</th>
                  <th className="px-6 py-4">Bidang/Urusan</th>
                  <th className="px-6 py-4">Tanggal Menang</th>
                  <th className="px-6 py-4">Metode Undian</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                {filteredWinners.map((w, idx) => (
                  <tr key={w.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-505">#{w.id}</td>
                    <td className="px-6 py-4 text-slate-205 font-semibold">{w.periodName}</td>
                    <td className="px-6 py-4">
                      <span className="font-extrabold text-white text-sm block">
                        {w.memberName}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md font-bold bg-white/10 text-slate-350 border border-white/5">
                        {w.memberBidang}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-400">{w.tanggalUndian}</td>
                    <td className="px-6 py-4">
                      {w.jenisUndian === 'Online' ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-600/20 text-blue-300 font-bold text-[10px] border border-blue-500/30">
                          💻 Online/Digital
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-teal-650/20 text-teal-350 font-bold text-[10px] border border-teal-500/30">
                          🎟️ Offline Manual
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteWinnerRecord(w.id, w.memberName)}
                        className="p-1.5 bg-white/5 text-slate-400 rounded-lg hover:bg-red-500/20 hover:text-red-400 border border-white/5 hover:border-red-500/30 transition-all cursor-pointer inline-block"
                        title="Batalkan Undian Ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredWinners.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400 italic">
                      Belum ada riwayat pemenang yang tersimpan untuk filter kriteria ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Manual Input Offline Winner Modal */}
        {isManualInputOpen && (
          <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4 backdrop-blur-md">
            <div className="backdrop-blur-xl bg-slate-900 border border-white/10 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden select-none text-white font-sans">
              {/* Header banner */}
              <div className="bg-white/5 border-b border-white/10 p-6 relative">
                <h3 className="text-md font-extrabold text-white">Input Hasil Arisan Manual</h3>
                <p className="text-xs text-slate-400 mt-1">Dharma Wanita Persatuan PUPR Sumenep</p>
                <button
                  onClick={() => setIsManualInputOpen(false)}
                  className="absolute right-4 top-4 text-slate-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Input Form Fields */}
              <form onSubmit={handleManualSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Pilih Periode Aktif</label>
                  <select
                    required
                    value={formData.periodId}
                    onChange={(e) => setFormData({ ...formData, periodId: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900 border border-white/10 rounded-xl focus:outline-none text-xs font-bold text-slate-200 cursor-pointer"
                  >
                    <option value="" disabled className="bg-slate-905 text-white">-- Pilih Periode --</option>
                    {periods.map(p => (
                      <option key={p.id} value={p.id} className="bg-slate-905 text-white">
                        [{p.status}] {p.namaPeriode}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Pilih Pemenang</label>
                  <select
                    required
                    value={formData.memberId}
                    onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900 border border-white/10 rounded-xl focus:outline-none text-xs font-bold text-slate-200 cursor-pointer"
                  >
                    <option value="" disabled className="bg-slate-905 text-white">-- Pilih Anggota yang Menang --</option>
                    {eligibleMembers.map(m => (
                      <option key={m.id} value={m.id} className="bg-slate-905 text-white">
                        {m.namaLengkap} ({m.bidang})
                      </option>
                    ))}
                  </select>
                  {eligibleMembers.length === 0 && (
                    <p className="text-[10px] text-rose-450 mt-1 leading-normal">
                      * Semua anggota aktif telah tercatat memenangkan arisan pada daftar!
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Tanggal Pelaksanaan Undian</label>
                  <input
                    type="date"
                    required
                    value={formData.tanggalUndian}
                    onChange={(e) => setFormData({ ...formData, tanggalUndian: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none text-xs font-mono text-white"
                  />
                </div>

                {/* Action buttons */}
                <div className="pt-6 border-t border-white/10 flex items-center justify-end gap-3 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setIsManualInputOpen(false)}
                    className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-xl cursor-pointer"
                  >
                    Urungkan
                  </button>
                  <button
                    type="submit"
                    disabled={eligibleMembers.length === 0}
                    className={`px-6 py-2.5 border border-white/15 rounded-xl flex items-center gap-1.5 text-white cursor-pointer ${eligibleMembers.length === 0
                      ? 'bg-white/5 cursor-not-allowed text-slate-500 border-white/5'
                      : 'bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white'
                      }`}
                  >
                    <Check className="w-4 h-4 text-white" />
                    Simpan Catatan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* PRINT LAYOUT: DAFTAR PENERIMA ARISAN */}
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 15mm; }
          body, html, #root, #root > div { 
            background: white !important; 
            background-color: white !important;
          }
          body {
            color: black !important;
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important;
          }
          #print-winners-sheet, #print-winners-sheet * {
            visibility: visible;
          }
          #print-winners-sheet {
            display: block !important;
            padding: 0;
            margin: 0;
            width: 100%;
          }
          .no-print { display: none !important; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid black !important; padding: 6px; }
          tr { page-break-inside: avoid; }
          thead { display: table-header-group; }
          tfoot { display: table-footer-group; }
        }
      `}</style>

      <div id="print-winners-sheet" className="hidden print:block bg-white text-black p-4 text-sm font-serif">
        {/* Header Logo & Title */}
        <div className="flex items-center border-b-[3px] border-black pb-4 mb-4">
          <img
            src={logoDharmawanita}
            alt="Logo Dharma Wanita"
            className="w-24 h-24 object-contain mr-4"
          />
          <div className="text-center flex-1 pr-10">
            <h1 className="font-bold text-lg leading-tight italic">
              Dharma Wanita Persatuan
            </h1>

            <h2 className="font-extrabold text-xl leading-tight">
              Dinas Pekerjaan Umum Dan Tata Ruang
            </h2>

            <h3 className="font-extrabold text-lg leading-tight">
              Kabupaten Sumenep
            </h3>

            <p className="text-xs mt-1">
              Jl. Dr. Soetomo No.03 Pajagalan Sumenep
            </p>

            <p className="text-xs">
              Telp. (0323) 662133
            </p>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-center font-bold underline mb-8 font-serif text-lg tracking-wide uppercase">DAFTAR PENERIMA ARISAN</h3>

        {/* Table */}
        <table className="w-full border-collapse border border-black text-xs font-serif">
          <thead>
            <tr className="bg-gray-200 uppercase text-center font-bold">
              <th className="border border-black p-2 w-[5%]">NO.</th>
              <th className="border border-black p-2 w-[35%]">NAMA</th>
              <th className="border border-black p-2 w-[20%]">JABATAN</th>
              <th className="border border-black p-2 w-[40%]">TANDA TANGAN</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-gray-100 text-center font-bold">
              <td className="border border-black p-1">1</td>
              <td className="border border-black p-1">2</td>
              <td className="border border-black p-1">3</td>
              <td className="border border-black p-1">4</td>
            </tr>
            {(() => {
              const allDepts = Array.from(
                new Set(
                  members.map(m => m.bidang || 'Tanpa Bidang')
                )
              );

              const uniqueDepts = [
                'Pengurus Inti',
                ...allDepts
                  .filter(d => d !== 'Pengurus Inti')
                  .sort()
              ];

              let counter = 0;

              return uniqueDepts.map((dept) => {
                const deptMembers = members.filter(m => (m.bidang || 'Tanpa Bidang') === dept && m.status === 'Aktif');
                if (deptMembers.length === 0) return null;

                return (
                  <React.Fragment key={dept}>
                    {/* Department Subheader */}
                    {dept !== 'Pengurus Inti' && (
                      <tr className="bg-gray-50">
                        <td className="border border-black p-1"></td>
                        <td className="border border-black p-2 font-bold pt-3 uppercase" colSpan={3}>
                          {dept.toUpperCase().startsWith('UPT') || dept.toUpperCase() === 'KARYAWATI' ? dept : `BID. ${dept.replace('Bidang', '')}`}
                        </td>
                      </tr>
                    )}

                    {/* Members in Department */}
                    {deptMembers.map((mem) => {
                      counter++;
                      const globalIdx = counter;
                      return (
                        <tr key={mem.id} className="h-[3.5rem]">
                          <td className="border border-black p-1 text-center font-medium">{globalIdx}</td>
                          <td className="border border-black p-2 uppercase font-medium">{mem.namaLengkap}</td>
                          <td className="border border-black p-2 uppercase text-center font-medium">
                            {mem.jabatan || 'Anggota'}<br />
                          </td>

                          {/* Alternating Signature Cell (Merged) */}
                          <td className={`border border-black p-1 relative h-[3.5rem] ${globalIdx % 2 === 0 ? 'bg-[#fcfcfc]' : ''}`}>
                            <span className={`text-[10px] text-black absolute ${globalIdx % 2 !== 0 ? 'top-1 left-2' : 'top-5 left-1/2'}`}>
                              {globalIdx}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              });
            })()}

            {members.filter(m => m.status === 'Aktif').length === 0 && (
              <tr className="h-[3.5rem]">
                <td className="border border-black p-1"></td>
                <td className="border border-black p-2 italic text-gray-500 text-center" colSpan={2}>Tidak ada anggota aktif</td>
                <td className="border border-black p-1 relative w-[40%]"></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
