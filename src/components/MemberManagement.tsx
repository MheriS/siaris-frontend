/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  Plus, Search, Edit2, Trash2, Check, X, FileUp, FileDown,
  UserSquare, ArrowUpDown, Filter, Sparkles, HelpCircle
} from 'lucide-react';
import { Member } from '../types';
import { exportMembersToCSV, parseCSVToMembers } from '../utils/exportUtils';

interface MemberManagementProps {
  members: Member[];
  onAddMember: (member: Omit<Member, 'id'>) => void;
  onUpdateMember: (member: Member) => void;
  onDeleteMember: (id: string) => void;
  onBulkImport: (members: Omit<Member, 'id'>[]) => void;
}

const DEPARTMENTS = ["Sekretariat", "Bina Marga", "Cipta Karya", "Sumber Daya Air", "Tata Ruang", "Pengurus Inti", "Pendidikan", "Ekonomi", "Sosial Budaya", "Air Minum dan PLP", "Bina Jasa Kontruksi", "Penataan Bangunan dan Gedung", "UPT IPLT", "UPT Wilayah Timur", "UPT Wilayah Barat", "UPT Kepulauan II", "Karyawati"];

export default function MemberManagement({
  members, onAddMember, onUpdateMember, onDeleteMember, onBulkImport
}: MemberManagementProps) {
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBidang, setSelectedBidang] = useState('Semua');
  const [selectedStatus, setSelectedStatus] = useState('Semua');
  const [sortBy, setSortBy] = useState<'namaLengkap' | 'id' | 'tanggalBergabung'>('namaLengkap');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Form modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    namaLengkap: '',
    nip: '',
    jabatan: 'Anggota',
    bidang: 'Sekretariat',
    nomorHp: '',
    status: 'Aktif' as 'Aktif' | 'Nonaktif',
    tanggalBergabung: new Date().toISOString().split('T')[0]
  });

  // Help info state
  const [showImportHelp, setShowImportHelp] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter & Sort members
  const filteredMembers = members.filter(m => {
    const matchesSearch =
      m.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.nip && m.nip.includes(searchQuery)) ||
      (m.jabatan && m.jabatan.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesBidang = selectedBidang === 'Semua' || m.bidang === selectedBidang;
    const matchesStatus = selectedStatus === 'Semua' || m.status === selectedStatus;

    return matchesSearch && matchesBidang && matchesStatus;
  }).sort((a, b) => {
    let orderA = a[sortBy] || '';
    let orderB = b[sortBy] || '';

    if (orderA < orderB) return sortOrder === 'asc' ? -1 : 1;
    if (orderA > orderB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field: 'namaLengkap' | 'id' | 'tanggalBergabung') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      namaLengkap: '',
      nip: '',
      jabatan: 'Anggota',
      bidang: 'Sekretariat',
      nomorHp: '',
      status: 'Aktif',
      tanggalBergabung: new Date().toISOString().split('T')[0]
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (m: Member) => {
    setEditingMember(m);
    setFormData({
      namaLengkap: m.namaLengkap,
      nip: m.nip || '',
      jabatan: m.jabatan,
      bidang: m.bidang,
      nomorHp: m.nomorHp,
      status: m.status,
      tanggalBergabung: m.tanggalBergabung
    });
    setIsEditOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAddOpen) {
      onAddMember(formData);
      setIsAddOpen(false);
    } else if (isEditOpen && editingMember) {
      onUpdateMember({
        ...formData,
        id: editingMember.id
      });
      setIsEditOpen(false);
      setEditingMember(null);
    }
  };

  const handleDelete = (id: string, nama: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus anggota "${nama}"?`)) {
      onDeleteMember(id);
    }
  };

  // CSV Import handler
  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      try {
        const parsed = parseCSVToMembers(text);
        if (parsed.length === 0) {
          alert('Format dokumen tidak valid atau kosong. Mohon sertakan kolom Nama Lengkap.');
          return;
        }

        // Validate complete elements or fill placeholders
        const cleanToImport: Omit<Member, 'id'>[] = parsed.map(p => ({
          namaLengkap: p.namaLengkap || 'Anggota Tanpa Nama',
          nip: p.nip || '',
          jabatan: p.jabatan || 'Anggota',
          bidang: DEPARTMENTS.includes(p.bidang || '') ? (p.bidang as string) : 'Sekretariat',
          nomorHp: p.nomorHp || '-',
          status: p.status || 'Aktif',
          tanggalBergabung: p.tanggalBergabung || new Date().toISOString().split('T')[0]
        }));

        onBulkImport(cleanToImport);
        alert(`Berhasil mengimpor ${cleanToImport.length} data anggota baru!`);
      } catch (err) {
        alert('Gagal mendeteksi dokumen. Pastikan dokumen berekstensi CSV/Excel beralineasi standar.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset input
    }
  };

  // Helper template CSV generator and downloader
  const downloadCSVSample = () => {
    const headers = 'Nama Lengkap,NIP,Jabatan,Bidang,Nomor HP,Status\n';
    const sampleVal1 = 'Ny. Retno Widowati,198302142010022004,Koordinator,SDA,0812234567,Aktif\n';
    const sampleVal2 = 'Ny. Kusmawati,,Anggota,Bina Marga,0853344455,Aktif\n';
    const content = headers + sampleVal1 + sampleVal2;

    const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'SIARIS_Template_Import.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintAttendanceList = () => {
    window.print();
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="no-print space-y-6">
        {/* Upper header action list */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 backdrop-blur-xl bg-white/5 p-6 rounded-2xl border border-white/10 shadow-lg text-white">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <UserSquare className="w-6 h-6 text-blue-400" />
              Manajemen Anggota DWP
            </h2>
            <p className="text-xs text-slate-400 mt-1">Formulir pendaftaran, import basis data serta penyuntingan berkas anggota</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* CSV Import Hidden Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleCSVUpload}
              accept=".csv, .txt"
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 md:flex-none px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-bold rounded-xl text-xs transition-with-shadow flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileUp className="w-4 h-4 text-blue-400" />
              Import (CSV/Excel)
            </button>

            <button
              onClick={() => exportMembersToCSV(members)}
              className="flex-1 md:flex-none px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-bold rounded-xl text-xs transition-with-shadow flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileDown className="w-4 h-4 text-teal-400" />
              Ekspor Akurat
            </button>

            <button
              onClick={handlePrintAttendanceList}
              className="w-full md:w-auto px-5 py-2.5 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 border border-white/15 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-white" />
              Cetak Daftar Hadir
            </button>

            <button
              onClick={handleOpenAdd}
              className="w-full md:w-auto px-5 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 border border-white/15 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Tambah Anggota
            </button>
          </div>
        </div>

        {/* CSV template download aid */}
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-4 border border-white/10 flex items-center justify-between gap-4 text-xs text-slate-300 no-print">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-400 shrink-0" />
            <span>
              Punya berkas Excel daftar pengurus? Silakan convert ke format CSV untuk melakukan import sekaligus dengan cepat.
            </span>
          </div>
          <button
            onClick={downloadCSVSample}
            className="text-blue-400 hover:text-blue-300 font-bold shrink-0 underline decoration-dotted cursor-pointer"
          >
            Download Template CSV
          </button>
        </div>

        {/* Search and Filters pane */}
        <div className="backdrop-blur-xl bg-white/5 p-6 rounded-2xl border border-white/10 shadow-lg space-y-4 no-print">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Quick Find Search */}
            <div className="md:col-span-2 relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Cari nama anggota, NIP, jabatan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-white placeholder-slate-500"
              />
            </div>

            {/* Department Filter */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Filter className="w-4 h-4" />
              </span>
              <select
                value={selectedBidang}
                onChange={(e) => setSelectedBidang(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs focus:outline-none text-slate-200 cursor-pointer"
              >
                <option value="Semua" className="bg-slate-905 text-white">Semua Bidang</option>
                {DEPARTMENTS.map(d => (
                  <option key={d} value={d} className="bg-slate-905 text-white">{d}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Filter className="w-4 h-4" />
              </span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs focus:outline-none text-slate-200 cursor-pointer"
              >
                <option value="Semua" className="bg-slate-905 text-white">Semua Status</option>
                <option value="Aktif" className="bg-slate-905 text-white">Aktif</option>
                <option value="Nonaktif" className="bg-slate-905 text-white">Nonaktif</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Members Data Grid */}
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 shadow-lg overflow-hidden no-print">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 select-none text-xs font-semibold text-slate-300 uppercase tracking-wildest border-b border-white/10">
                  <th className="px-6 py-4 cursor-pointer" onClick={() => handleSort('id')}>
                    <div className="flex items-center gap-1.5">
                      No ID <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </th>
                  <th className="px-6 py-4 cursor-pointer" onClick={() => handleSort('namaLengkap')}>
                    <div className="flex items-center gap-1.5">
                      Nama Lengkap <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </th>
                  <th className="px-6 py-4">Bidang/Urusan</th>
                  <th className="px-6 py-4">Jabatan</th>
                  <th className="px-6 py-4">Koneksi HP</th>
                  <th className="px-6 py-4">Keanggotaan</th>
                  <th className="px-6 py-4 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                {filteredMembers.map((m, idx) => (
                  <tr key={m.id} className="hover:bg-white/5 transition-colors border-b border-white/5">
                    <td className="px-6 py-4 font-mono font-bold text-slate-400">{m.id}</td>
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <div className="font-bold text-white text-sm">{m.namaLengkap}</div>
                        {m.nip ? (
                          <div className="text-[10px] text-slate-400 font-mono">NIP: {m.nip}</div>
                        ) : (
                          <div className="text-[10px] text-slate-400">Non-PNS / Anggota Kehormatan</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md font-semibold bg-white/5 border border-white/10 text-slate-200">
                        {m.bidang}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-200">{m.jabatan || 'Anggota'}</td>
                    <td className="px-6 py-4 font-mono text-slate-300">{m.nomorHp || '-'}</td>
                    <td className="px-6 py-4">
                      {m.status === 'Aktif' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 font-bold text-[10px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10 font-bold text-[10px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(m)}
                        className="p-1.5 bg-white/5 text-slate-300 rounded-lg hover:bg-white/10 hover:text-blue-400 border border-white/10 transition-colors inline-flex cursor-pointer"
                        title="Ubah Anggota"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(m.id, m.namaLengkap)}
                        className="p-1.5 bg-white/5 text-slate-300 rounded-lg hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20 border border-white/10 transition-colors inline-flex cursor-pointer"
                        title="Hapus Anggota"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredMembers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400 italic">
                      Anggota tidak ditemukan. Ubah pencarian atau tambahkan data baru.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Slide / Modal overlay for Adding or Editing Members */}
        {(isAddOpen || isEditOpen) && (
          <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="backdrop-blur-xl bg-slate-900 border border-white/10 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden select-none flex flex-col max-h-[90vh]">
              {/* Header banner */}
              <div className="bg-white/5 border-b border-white/10 text-white p-6 relative">
                <h3 className="text-lg font-extrabold text-white">
                  {isAddOpen ? 'Formulir Registrasi Anggota' : 'Modifikasi Informasi Anggota'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">Dharma Wanita Persatuan PUTR Sumenep</p>
                <button
                  onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }}
                  className="absolute right-4 top-4 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Form layout */}
              <form onSubmit={handleFormSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Ny. Hj. Fatimah Azzahra"
                    value={formData.namaLengkap}
                    onChange={(e) => setFormData({ ...formData, namaLengkap: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/25 text-xs text-white placeholder-slate-500 font-sans"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">NIP (Opsional)</label>
                    <input
                      type="text"
                      placeholder="Contoh: 19850123..."
                      value={formData.nip}
                      onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/25 text-xs text-white placeholder-slate-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Nomor Handphone (Opsional)</label>
                    <input
                      type="text"
                      placeholder="Contoh: 081234567..."
                      value={formData.nomorHp}
                      onChange={(e) => setFormData({ ...formData, nomorHp: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/25 text-xs text-white placeholder-slate-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Jabatan di DWP</label>
                    <select
                      value={formData.jabatan}
                      onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-900 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/25 text-xs text-slate-200 cursor-pointer"
                    >
                      <option value="Ketua" className="bg-slate-905 text-white">Ketua</option>
                      <option value="Wakil Ketua" className="bg-slate-905 text-white">Wakil Ketua</option>
                      <option value="Sekretaris" className="bg-slate-905 text-white">Sekretaris</option>
                      <option value="Wakil Sekretaris" className="bg-slate-905 text-white">Wakil Sekretaris</option>
                      <option value="Bendahara I" className="bg-slate-905 text-white">Bendahara I</option>
                      <option value="Bendahara II" className="bg-slate-905 text-white">Bendahara II</option>
                      <option value="Anggota" className="bg-slate-905 text-white">Anggota</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Bidang Kerja di PUPR</label>
                    <select
                      value={formData.bidang}
                      onChange={(e) => setFormData({ ...formData, bidang: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-900 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/25 text-xs text-slate-200 cursor-pointer"
                    >
                      {DEPARTMENTS.map(d => (
                        <option key={d} value={d} className="bg-slate-905 text-white">{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Keaktifan Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Aktif' | 'Nonaktif' })}
                      className="w-full px-4 py-2 bg-slate-900 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/25 text-xs text-slate-200 font-bold cursor-pointer"
                    >
                      <option value="Aktif" className="bg-slate-905 text-white">Aktif</option>
                      <option value="Nonaktif" className="bg-slate-905 text-white">Nonaktif</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Tanggal Bergabung</label>
                    <input
                      type="date"
                      required
                      value={formData.tanggalBergabung}
                      onChange={(e) => setFormData({ ...formData, tanggalBergabung: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/25 text-xs text-white placeholder-slate-500 font-mono cursor-pointer"
                    />
                  </div>
                </div>

                {/* Action buttons */}
                <div className="pt-6 border-t border-white/10 flex items-center justify-end gap-3 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }}
                    className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-xl cursor-pointer"
                  >
                    Urungkan
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white rounded-xl flex items-center gap-1.5 border border-white/10 cursor-pointer"
                  >
                    <Check className="w-4 h-4 text-white" />
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* PRINT LAYOUT: DAFTAR HADIR ANGGOTA */}
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 15mm; }
          body, html, #root, #root > div {
            background: white !important;
            background-color: white !important;
          }
          body {
            color: black !important;
          }
          #print-attendance-sheet, #print-attendance-sheet * {
            visibility: visible;
          }
          #print-attendance-sheet table * {
            border-collapse: collapse;
          }
          #print-attendance-sheet th, #print-attendance-sheet td {
            border: 1px solid black !important;
          }
          #print-attendance-sheet {
            padding: 0;
            margin: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* PRINT LAYOUT: DAFTAR HADIR ANGGOTA */}
      <div id="print-attendance-sheet" className="hidden print:block bg-white text-black p-4 text-sm font-serif">
        {/* Header Logo & Title */}
        <div className="flex items-center border-b-2 border-black pb-4 mb-4">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/3/30/Lambang_Kabupaten_Sumenep.png"
            alt="Logo Sumenep"
            className="w-20 object-contain mr-4"
          />
          <div className="text-center w-full">
            <h1 className="font-bold text-lg leading-tight italic">Dharma Wanita Persatuan</h1>
            <h2 className="font-extrabold text-xl leading-tight">Dinas Pekerjaan Umum Dan Tata Ruang</h2>
            <h3 className="font-extrabold text-lg leading-tight">Kabupaten Sumenep</h3>
            <p className="text-xs">Jl. Dr. Soetomo No.03 Pajagalan Sumenep</p>
            <p className="text-xs">Telp. (0323) 662133</p>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-center font-bold underline mb-6">DAFTAR HADIR ANGGOTA</h3>

        {/* Info Area */}
        <div className="grid grid-cols-2 gap-4 mb-8 text-xs font-semibold">
          <div>
            <div className="grid grid-cols-[100px_4px_1fr] gap-y-2">
              <span>KEGIATAN</span><span>:</span><span>.............................................................</span>
              <span>TEMPAT</span><span>:</span><span>.............................................................</span>
              <span>KELOMPOK</span><span>:</span><span>.............................................................</span>
            </div>
          </div>
          <div>
            <div className="grid grid-cols-[60px_4px_1fr] gap-y-2">
              <span>Hari</span><span>:</span><span>........................................</span>
              <span>Tanggal</span><span>:</span><span>........................................</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <table className="w-full max-w-full border-collapse border border-black text-xs">
          <thead>
            <tr className="bg-gray-200 uppercase text-center font-bold">
              <th className="border border-black p-2 w-[6%]">NO.</th>
              <th className="border border-black p-2 w-[40%]">NAMA</th>
              <th className="border border-black p-2 w-[24%]">JABATAN</th>
              <th className="border border-black p-2 w-[30%]" colSpan={2}>DAFTAR HADIR</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-gray-100 text-center font-bold">
              <td className="border border-black p-1">1</td>
              <td className="border border-black p-1">2</td>
              <td className="border border-black p-1">3</td>
              <td className="border border-black p-1" colSpan={2}>4</td>
            </tr>
            {(() => {
              let counter = 0;
              return DEPARTMENTS.map((dept) => {
                const deptMembers = filteredMembers.filter(m => m.bidang === dept && m.status === 'Aktif');
                return (
                  <React.Fragment key={dept}>
                    {/* Department Subheader */}
                    <tr className="bg-gray-50">
                      <td className="border border-black p-1"></td>
                      <td className="border border-black p-1 font-bold pt-3 uppercase" colSpan={4}>
                        {dept.toUpperCase().startsWith('UPT') || dept.toUpperCase() === 'KARYAWATI' ? dept : `BID. ${dept.replace('Bidang', '')}`}
                      </td>
                    </tr>

                    {/* Members in Department */}
                    {deptMembers.map((mem) => {
                      counter++;
                      const globalIdx = counter;
                      return (
                        <tr key={mem.id} className="h-10">
                          <td className="border border-black p-1 text-center font-medium">{globalIdx}</td>
                          <td className="border border-black p-2 uppercase font-medium">{mem.namaLengkap}</td>
                          <td className="border border-black p-2 uppercase text-center font-medium">{mem.jabatan || 'Anggota'}</td>

                          {/* Alternating Signature Cells */}
                          {globalIdx % 2 !== 0 ? (
                            <>
                              <td className="border border-black p-2 relative h-12 w-[15%] text-left">
                                <span className="text-[10px] text-gray-800 absolute top-1 left-2">{globalIdx}</span>
                              </td>
                              <td className="border border-black p-2 relative h-12 w-[15%]"></td>
                            </>
                          ) : (
                            <>
                              <td className="border border-black p-2 relative h-12 w-[15%]"></td>
                              <td className="border border-black p-2 relative h-12 w-[15%] text-right bg-[#fcfcfc]">
                                <span className="text-[10px] text-gray-800 absolute top-5 left-2">{globalIdx}</span>
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })}

                    {deptMembers.length === 0 && (
                      <tr className="h-10">
                        <td className="border border-black p-1"></td>
                        <td className="border border-black p-2 italic text-gray-400">Tidak ada anggota aktif</td>
                        <td className="border border-black p-2"></td>
                        <td className="border border-black p-2"></td>
                        <td className="border border-black p-2"></td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              });
            })()}
          </tbody>
        </table>
      </div>

    </div>
  );
}
