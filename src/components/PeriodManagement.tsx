/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Calendar, Plus, Library, Power, ToggleLeft, CheckSquare, Clock } from 'lucide-react';
import { Period } from '../types';

interface PeriodManagementProps {
  periods: Period[];
  onAddPeriod: (period: Omit<Period, 'id'>) => void;
  onClosePeriod: (id: string) => void;
  onSetPeriodActive: (id: string) => void;
}

const BULAN_LIST = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export default function PeriodManagement({ 
  periods, onAddPeriod, onClosePeriod, onSetPeriodActive 
}: PeriodManagementProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [namaPeriode, setNamaPeriode] = useState('');
  const [bulan, setBulan] = useState('Januari');
  const [tahun, setTahun] = useState(new Date().getFullYear());

  const handleCreatePeriod = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = namaPeriode.trim() || `Arisan DWP ${bulan} ${tahun}`;
    onAddPeriod({
      namaPeriode: finalName,
      bulan,
      tahun: Number(tahun),
      status: 'Aktif'
    });
    setNamaPeriode('');
    setIsAddOpen(false);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header and description banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 backdrop-blur-xl bg-white/5 p-6 rounded-2xl border border-white/10 shadow-lg text-white">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2 font-display">
            <Calendar className="w-6 h-6 text-blue-400" />
            Pengelolaan Periode Arisan
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Mengatur pembagian arisan mingguan/bulanan serta membatasi jangkauan pengundian pemenang
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 border border-white/15 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Tambah Siklus Periode
        </button>
      </div>

      {/* Main cycles cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {periods.map(p => (
          <div 
            key={p.id}
            className={`backdrop-blur-xl bg-white/5 rounded-2xl border p-6 shadow-lg transition-all relative overflow-hidden flex flex-col justify-between min-h-[180px] ${
              p.status === 'Aktif' 
                ? 'border-blue-500/50 ring-2 ring-blue-500/10' 
                : 'border-white/10 opacity-90'
            }`}
          >
            {/* Status corner ribbon */}
            <div className="absolute top-4 right-4 text-xs font-bold font-mono">
              {p.status === 'Aktif' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-teal-600 text-white font-bold text-[10px] border border-white/10">
                  <Power className="w-3.5 h-3.5 animate-pulse" />
                  Aktif
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[10px]">
                  <CheckSquare className="w-3.5 h-3.5" />
                  Selesai
                </span>
              )}
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold tracking-widest text-[#94a3b8] uppercase font-mono">Periode ID: {p.id}</span>
              <h3 className="text-base font-extrabold text-white pr-16 leading-tight">{p.namaPeriode}</h3>
              <p className="text-xs text-slate-300 font-medium">
                Waktu Pelaksanaan: {p.bulan} {p.tahun}
              </p>
            </div>

            <div className="pt-6 border-t border-white/5 mt-4 flex items-center justify-between gap-2">
              <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Dibuat Otomatis
              </span>

              <div className="space-x-1">
                {p.status === 'Aktif' ? (
                  <button
                    onClick={() => onClosePeriod(p.id)}
                    className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-extrabold text-[10px] rounded-lg transition-all border border-white/10 cursor-pointer"
                  >
                    Tandai Selesai
                  </button>
                ) : (
                  <button
                    onClick={() => onSetPeriodActive(p.id)}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] rounded-lg border border-white/10 transition-colors cursor-pointer"
                  >
                    Aktifkan Kembali
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Adding Period Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="backdrop-blur-xl bg-slate-900 border border-white/10 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden select-none text-white">
            <div className="bg-white/5 border-b border-white/10 p-6">
              <h3 className="text-md font-extrabold text-white">Buat Siklus Periode Baru</h3>
              <p className="text-xs text-slate-400 mt-1">Dharma Wanita Persatuan PUPR Sumenep</p>
            </div>

            <form onSubmit={handleCreatePeriod} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Nama Periode</label>
                <input
                  type="text"
                  placeholder={`Contoh: Arisan DWP ${bulan} ${tahun}`}
                  value={namaPeriode}
                  onChange={(e) => setNamaPeriode(e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/25 text-xs text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Bulan Pelaksanaan</label>
                  <select
                    value={bulan}
                    onChange={(e) => setBulan(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/25 text-xs text-slate-200 font-bold cursor-pointer"
                  >
                    {BULAN_LIST.map(b => (
                      <option key={b} value={b} className="bg-slate-905 text-white">{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Tahun Pelaksanaan</label>
                  <input
                    type="number"
                    required
                    value={tahun}
                    onChange={(e) => setTahun(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/25 text-xs font-mono text-white"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 flex items-center justify-end gap-3 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-xl cursor-pointer"
                >
                  Urungkan
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white border border-white/10 rounded-xl cursor-pointer"
                >
                  Tambahkan Saja
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
