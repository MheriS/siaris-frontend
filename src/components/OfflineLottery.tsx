/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Printer, HelpCircle, FileDown, CheckSquare, Layers, Eye } from 'lucide-react';
import { Member, Winner } from '../types';

interface OfflineLotteryProps {
  members: Member[];
  winners: Winner[];
}

export default function OfflineLottery({ members, winners }: OfflineLotteryProps) {
  const [printMode, setPrintMode] = useState<'mode1' | 'mode2'>('mode1');
  const [filterMode, setFilterMode] = useState<'allActive' | 'nonWinners'>('allActive');
  const [columnsCount, setColumnsCount] = useState<number>(3);

  // Filter candidates based on settings
  const activeMembers = members.filter(m => m.status === 'Aktif');
  const wonIds = winners.map(w => w.memberId);
  const candidates = filterMode === 'allActive'
    ? activeMembers
    : activeMembers.filter(m => !wonIds.includes(m.id));

  const handleTriggerPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Dynamic styles injected specifically for clean, precise browser printing */}
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
          .no-print { display: none !important; }
          
          /* Ensures scissors boxes don't get cut in half across pages */
          .page-break-avoid { page-break-inside: avoid; }
        }
      `}</style>

      {/* Screen UI - Hidden when printing */}
      <div className="no-print space-y-6">
        {/* Main title block */}
        <div className="backdrop-blur-xl bg-white/5 p-6 rounded-2xl border border-white/10 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-white">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2 font-display">
              <Printer className="w-6 h-6 text-blue-400" />
              Cetak Nama Undian (Offline)
            </h2>
            <p className="text-xs text-slate-400">
              Cetak nama anggota ke kertas potong siap digulung ke kotak undian fisik
            </p>
          </div>

          <button
            onClick={handleTriggerPrint}
            className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 border border-white/15 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Mulai Cetak / Simpan PDF
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Control and config column */}
          <div className="backdrop-blur-xl bg-white/5 p-6 rounded-2xl border border-white/10 shadow-lg lg:col-span-4 space-y-6 self-start text-white">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider pb-3 border-b border-white/10 font-mono">
              ⚙️ Pengaturan Dokumen
            </h3>

            {/* Mode selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Format Layout Cetak</label>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => setPrintMode('mode1')}
                  className={`p-3 text-left border rounded-xl transition-all cursor-pointer ${printMode === 'mode1'
                      ? 'border-blue-500/50 bg-blue-500/10 text-white font-semibold'
                      : 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-350'
                    }`}
                >
                  <div className="text-xs font-extrabold text-white">Mode 1 - Kotak Siap Gunting</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Potongan kartu rapi agar adil saat diundi</div>
                </button>

                <button
                  onClick={() => setPrintMode('mode2')}
                  className={`p-3 text-left border rounded-xl transition-all cursor-pointer ${printMode === 'mode2'
                      ? 'border-blue-500/50 bg-blue-500/10 text-white font-semibold'
                      : 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-350'
                    }`}
                >
                  <div className="text-xs font-extrabold text-white">Mode 2 - Berurutan List</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Daftar indeks berderet per lembar</div>
                </button>
              </div>
            </div>

            {/* Filter logic */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Pilih Anggota</label>
              <select
                value={filterMode}
                onChange={(e) => setFilterMode(e.target.value as any)}
                className="w-full p-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs focus:outline-none text-slate-200 font-bold cursor-pointer"
              >
                <option value="allActive" className="bg-slate-905 text-white">Kancah Semua Anggota Aktif ({activeMembers.length})</option>
                <option value="nonWinners" className="bg-slate-905 text-white">Sisa Anggota Belum Pernah Menang ({activeMembers.length - wonIds.length})</option>
              </select>
            </div>

            {/* Mode 1 columns count */}
            {printMode === 'mode1' && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Kolom per Baris ({columnsCount})</label>
                <div className="grid grid-cols-3 gap-2">
                  {[2, 3, 4].map(num => (
                    <button
                      key={num}
                      onClick={() => setColumnsCount(num)}
                      className={`py-2 border text-xs font-bold rounded-xl text-center cursor-pointer ${columnsCount === num
                          ? 'border-white/15 bg-gradient-to-r from-blue-600 to-teal-600 text-white'
                          : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                    >
                      {num} Kolom
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-white/10 flex items-start gap-2 text-[10px] leading-relaxed text-slate-400">
              <HelpCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <span>
                Tip: Saat menu cetak browser muncul, hidupkan <b>"Background Graphics"</b> dan gunakan margin <b>"None"</b> untuk potongan potongan persegi yang presisi.
              </span>
            </div>
          </div>

          {/* Preview Panel right */}
          <div className="lg:col-span-8 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-450 uppercase tracking-widest font-mono flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-blue-400" />
                Pratinjau Halaman Cetak ({candidates.length} nama tertera)
              </span>
            </div>

            {/* Screen representation of the page */}
            <div className="w-full bg-white rounded-3xl border-2 border-dashed border-white/10 p-8 shadow-2xl text-slate-900 min-h-[500px]">
              <div className="pb-6 mb-6 border-b-2 border-slate-900 flex justify-between items-end">
                <div>
                  <h1 className="text-base font-extrabold uppercase tracking-tight text-slate-900">DHARMA WANITA PERSATUAN (DWP) PUPR</h1>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">KABUPATEN SUMENEP • DOKUMEN CETAK ARISAN OFFLINE</p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 border border-slate-300 px-3 py-1 rounded-md">
                  Mode: {printMode === 'mode1' ? 'Kotak Potong' : 'List Berindeks'}
                </span>
              </div>

              {printMode === 'mode1' && (
                <div
                  className="grid gap-4"
                  style={{ gridTemplateColumns: `repeat(${columnsCount}, minmax(0, 1fr))` }}
                >
                  {candidates.map((cand, idx) => (
                    <div
                      key={cand.id}
                      className="p-4 border-2 border-dashed border-slate-400 bg-[#FAFAFA] rounded-md text-center min-h-[90px] flex flex-col justify-center items-center relative overflow-hidden"
                    >
                      <span className="absolute top-1 left-2 text-[8px] font-mono font-bold text-slate-300">
                        {idx + 1}
                      </span>
                      <div className="text-xs font-extrabold uppercase text-slate-950 font-sans tracking-tight">
                        {cand.namaLengkap}
                      </div>
                      <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider mt-1 scale-95">
                        {cand.bidang}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {printMode === 'mode2' && (
                <div className="space-y-2 p-4 text-xs font-mono font-extrabold text-slate-900">
                  {candidates.map((cand, idx) => {
                    const sequenceIdx = String(idx + 1).padStart(3, '0');
                    return (
                      <div
                        key={cand.id}
                        className="py-2 border-b border-slate-150 flex justify-between items-center bg-slate-50/40 px-3 rounded-lg"
                      >
                        <span>
                          {sequenceIdx} - {cand.namaLengkap}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          [{cand.bidang}]
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {candidates.length === 0 && (
                <div className="text-center py-24 text-slate-400 italic">
                  Data anggota kosong. Harap penuhi keanggotaan aktif Anda terlebih dahulu.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PRINT-ONLY LAYOUT */}
      <div className="hidden print:block w-full bg-white text-slate-900 font-sans p-6">
        <div className="pb-6 mb-6 border-b-2 border-slate-900 flex justify-between items-end">
          <div>
            <h1 className="text-lg font-extrabold uppercase tracking-tight text-slate-900">DHARMA WANITA PERSATUAN (DWP) PUPR</h1>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-1">KABUPATEN SUMENEP • DOKUMEN CETAK ARISAN OFFLINE</p>
          </div>
        </div>

        {printMode === 'mode1' && (
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: `repeat(${columnsCount}, minmax(0, 1fr))` }}
          >
            {candidates.map((cand, idx) => (
              <div
                key={cand.id}
                className="page-break-avoid p-4 border-[1.5px] border-dashed border-black bg-white rounded-md text-center min-h-[100px] flex flex-col justify-center items-center relative overflow-hidden"
              >
                <span className="absolute top-1.5 left-2 text-[9px] font-mono font-bold text-slate-400">
                  {idx + 1}
                </span>
                <div className="text-xs font-extrabold uppercase text-black font-sans tracking-tight">
                  {cand.namaLengkap}
                </div>
                <div className="text-[10px] text-slate-600 uppercase font-bold tracking-wider mt-1">
                  {cand.bidang}
                </div>
              </div>
            ))}
          </div>
        )}

        {printMode === 'mode2' && (
          <div className="space-y-4 p-4 text-sm font-mono font-bold text-black">
            {candidates.map((cand, idx) => {
              const sequenceIdx = String(idx + 1).padStart(3, '0');
              return (
                <div
                  key={cand.id}
                  className="page-break-avoid py-2 border-b border-gray-300 flex justify-between items-center px-4"
                >
                  <span className="text-black">
                    {sequenceIdx}.  {cand.namaLengkap}
                  </span>
                  <span className="text-xs font-bold text-gray-500 uppercase">
                    [{cand.bidang}]
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
