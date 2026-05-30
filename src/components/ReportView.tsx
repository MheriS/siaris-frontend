/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FileText, Printer, CheckCircle, Info, Calendar, Users, Briefcase, Database, Download, Code2, Terminal } from 'lucide-react';
import { Member, Period, Winner } from '../types';
import LogoSumenep from '../assets/Sumenep.png';

interface ReportViewProps {
  members: Member[];
  periods: Period[];
  winners: Winner[];
}

export default function ReportView({ members, periods, winners }: ReportViewProps) {
  const [reportType, setReportType] = useState<'anggota' | 'pemenang' | 'sqlite'>('anggota');
  const [filterYear, setFilterYear] = useState<string>('2026');

  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.status === 'Aktif').length;
  const nonactiveMembers = totalMembers - activeMembers;

  // Breakdown of members per bidang
  const bidangDistribution = members.reduce((acc, m) => {
    acc[m.bidang] = (acc[m.bidang] || { total: 0, aktif: 0 });
    acc[m.bidang].total += 1;
    if (m.status === 'Aktif') {
      acc[m.bidang].aktif += 1;
    }
    return acc;
  }, {} as Record<string, { total: number; aktif: number }>);

  // Group winners by year
  const winnerYears = Array.from(new Set(winners.map(w => new Date(w.tanggalUndian).getFullYear())));

  // Dynamic SQLite script generator and exporter
  const handleDownloadSqlDump = () => {
    let sql = `-- =====================================================================\n`;
    sql += `-- DATABASE DUMP FOR SIARIS DWP PUPR SUMENEP (SQLITE/SQL COMPATIBLE)\n`;
    sql += `-- Generated on ${new Date().toISOString()} (UTC)\n`;
    sql += `-- Compatible with Laravel Eloquent Models and migrations\n`;
    sql += `-- =====================================================================\n\n`;

    sql += `PRAGMA foreign_keys = ON;\n\n`;

    // Create members table schema
    sql += `-- 1. Table structure for table 'members'\n`;
    sql += `DROP TABLE IF EXISTS members;\n`;
    sql += `CREATE TABLE members (\n`;
    sql += `  id VARCHAR(255) PRIMARY KEY,\n`;
    sql += `  namaLengkap VARCHAR(255) NOT NULL,\n`;
    sql += `  nip VARCHAR(50) NULL,\n`;
    sql += `  jabatan VARCHAR(255) NOT NULL,\n`;
    sql += `  bidang VARCHAR(255) NOT NULL,\n`;
    sql += `  nomorHp VARCHAR(255) NOT NULL,\n`;
    sql += `  status VARCHAR(50) CHECK(status IN ('Aktif', 'Nonaktif')) DEFAULT 'Aktif',\n`;
    sql += `  tanggalBergabung DATE NOT NULL,\n`;
    sql += `  created_at TIMESTAMP NULL,\n`;
    sql += `  updated_at TIMESTAMP NULL\n`;
    sql += `);\n\n`;

    sql += `-- Pre-seeding data for table 'members' from active state\n`;
    members.forEach(m => {
      const escapedNama = m.namaLengkap.replace(/'/g, "''");
      const escapedJabatan = m.jabatan.replace(/'/g, "''");
      const escapedBidang = m.bidang.replace(/'/g, "''");
      const nipVal = m.nip ? `'${m.nip}'` : "NULL";
      sql += `INSERT INTO members (id, namaLengkap, nip, jabatan, bidang, nomorHp, status, tanggalBergabung, created_at, updated_at) VALUES ('${m.id}', '${escapedNama}', ${nipVal}, '${escapedJabatan}', '${escapedBidang}', '${m.nomorHp}', '${m.status}', '${m.tanggalBergabung}', DATETIME('now'), DATETIME('now'));\n`;
    });
    sql += `\n`;

    // Create periods table schema
    sql += `-- 2. Table structure for table 'periods'\n`;
    sql += `DROP TABLE IF EXISTS periods;\n`;
    sql += `CREATE TABLE periods (\n`;
    sql += `  id VARCHAR(255) PRIMARY KEY,\n`;
    sql += `  namaPeriode VARCHAR(255) NOT NULL,\n`;
    sql += `  bulan VARCHAR(255) NOT NULL,\n`;
    sql += `  tahun INTEGER NOT NULL,\n`;
    sql += `  status VARCHAR(255) CHECK(status IN ('Aktif', 'Selesai')) DEFAULT 'Selesai',\n`;
    sql += `  created_at TIMESTAMP NULL,\n`;
    sql += `  updated_at TIMESTAMP NULL\n`;
    sql += `);\n\n`;

    sql += `-- Pre-seeding data for table 'periods' from active state\n`;
    periods.forEach(p => {
      const escapedNama = p.namaPeriode.replace(/'/g, "''");
      sql += `INSERT INTO periods (id, namaPeriode, bulan, tahun, status, created_at, updated_at) VALUES ('${p.id}', '${escapedNama}', '${p.bulan}', ${p.tahun}, '${p.status}', DATETIME('now'), DATETIME('now'));\n`;
    });
    sql += `\n`;

    // Create winners table schema
    sql += `-- 3. Table structure for table 'winners'\n`;
    sql += `DROP TABLE IF EXISTS winners;\n`;
    sql += `CREATE TABLE winners (\n`;
    sql += `  id VARCHAR(255) PRIMARY KEY,\n`;
    sql += `  periodId VARCHAR(255) NOT NULL,\n`;
    sql += `  periodName VARCHAR(255) NOT NULL,\n`;
    sql += `  memberId VARCHAR(255) NOT NULL,\n`;
    sql += `  memberName VARCHAR(255) NOT NULL,\n`;
    sql += `  memberBidang VARCHAR(255) NOT NULL,\n`;
    sql += `  tanggalUndian DATE NOT NULL,\n`;
    sql += `  jenisUndian VARCHAR(255) CHECK(jenisUndian IN ('Online', 'Offline')) NOT NULL,\n`;
    sql += `  created_at TIMESTAMP NULL,\n`;
    sql += `  updated_at TIMESTAMP NULL,\n`;
    sql += `  FOREIGN KEY (periodId) REFERENCES periods (id) ON DELETE CASCADE,\n`;
    sql += `  FOREIGN KEY (memberId) REFERENCES members (id) ON DELETE CASCADE\n`;
    sql += `);\n\n`;

    sql += `-- Pre-seeding data for table 'winners' from active state\n`;
    winners.forEach(w => {
      const escapedPeriod = w.periodName.replace(/'/g, "''");
      const escapedMember = w.memberName.replace(/'/g, "''");
      const escapedBidang = w.memberBidang.replace(/'/g, "''");
      sql += `INSERT INTO winners (id, periodId, periodName, memberId, memberName, memberBidang, tanggalUndian, jenisUndian, created_at, updated_at) VALUES ('${w.id}', '${w.periodId}', '${escapedPeriod}', '${w.memberId}', '${escapedMember}', '${escapedBidang}', '${w.tanggalUndian}', '${w.jenisUndian}', DATETIME('now'), DATETIME('now'));\n`;
    });

    const blob = new Blob([sql], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `siaris_dwp_sumenep_sqlite_dump.sql`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Print utility styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
            background: white !important;
            color: black !important;
          }
          #print-report-sheet, #print-report-sheet * {
            visibility: visible;
          }
          #print-report-sheet {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
            margin: 0;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Control panel & Menu */}
      <div className="backdrop-blur-xl bg-white/5 p-6 rounded-2xl border border-white/10 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6 no-print text-white">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2 font-display">
            <FileText className="w-6 h-6 text-blue-400" />
            Laporan & Rekapitusasi
          </h2>
          <p className="text-xs text-slate-400">
            Membuka, meninjau, serta mencetak lembar data audit arisan bulanan
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Report Category Switcher */}
          <div className="inline-flex bg-slate-900 border border-white/10 p-1 rounded-xl">
            <button
              onClick={() => setReportType('anggota')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${reportType === 'anggota'
                ? 'bg-gradient-to-r from-blue-600 to-teal-600 border border-white/10 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
                }`}
            >
              Laporan Anggota
            </button>
            <button
              onClick={() => setReportType('pemenang')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${reportType === 'pemenang'
                ? 'bg-gradient-to-r from-blue-600 to-teal-600 border border-white/10 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
                }`}
            >
              Laporan Pemenang
            </button>
            <button
              onClick={() => setReportType('sqlite')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${reportType === 'sqlite'
                ? 'bg-gradient-to-r from-blue-600 to-teal-600 border border-white/10 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
                }`}
            >
              Integrasi Laravel SQLite
            </button>
          </div>

          {reportType !== 'sqlite' ? (
            <button
              onClick={() => window.print()}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 border border-white/15 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-white" />
              Cetak Laporan PDF
            </button>
          ) : (
            <button
              onClick={handleDownloadSqlDump}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 border border-white/15 cursor-pointer animate-pulse"
              title="Unduh dataset aktif sebagai database SQL"
            >
              <Download className="w-4 h-4 text-white" />
              Unduh SQL Dump SQLite
            </button>
          )}
        </div>
      </div>

      {/* Actual Rendering Sheet */}
      {reportType !== 'sqlite' ? (
        /* ================= Physical Paper Report Layout ================= */
        <div
          id="print-report-sheet"
          className="bg-white rounded-3xl border-2 border-dashed border-white/10 p-10 shadow-2xl max-w-4xl mx-auto space-y-8 text-slate-900 min-h-[500px]"
        >
          {/* Document Header Logo & Title */}
          <div className="text-center pb-6 border-b-4 border-double border-slate-900 space-y-2 relative">
            {/* Embedded Mini Logo in Header Sheet */}
            <div className="absolute left-0 top-0 w-20 h-20 hidden sm:block">
              <img
                src={LogoSumenep}
                alt="Logo Sumenep"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="text-[10px] font-extrabold tracking-widest text-slate-500 uppercase block">
              DHARMA WANITA PERSATUAN (DWP) KABUPATEN SUMENEP
            </span>
            <h1 className="text-lg md:text-xl font-black text-slate-900 uppercase tracking-tight">
              DINAS PEKERJAAN UMUM DAN TATA RUANG (PUTR)
            </h1>
            <p className="text-xs text-slate-500">
              Alamat: Jl. Dr. Soetomo No. 3 Pajagalan, Sumenep, Jawa Timur • Kode Pos: -
            </p>
          </div>

          {/* Report subtitle & metadata block */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
            <div>
              <span className="text-slate-400 font-bold block uppercase text-[9px] tracking-wider">Jenis Dokumen</span>
              <span className="text-sm font-extrabold text-slate-800 uppercase">
                {reportType === 'anggota' ? 'Laporan Detil Sebaran & Keaktifan Anggota' : 'Laporan Rekapitulasi Riwayat Pemenang'}
              </span>
            </div>
            <div className="sm:text-right">
              <span className="text-slate-400 font-bold block uppercase text-[9px] tracking-wider">Tanggal Cetak</span>
              <span className="font-mono text-slate-800 font-bold">
                {new Date().toISOString().split('T')[0]}
              </span>
            </div>
          </div>

          {/* CONTENT BLOCK 1: MEMBER REPORT LAYOUT */}
          {reportType === 'anggota' && (
            <div className="space-y-6">
              {/* Quick KPIs Grid */}
              <div className="grid grid-cols-3 gap-4 border border-slate-200 rounded-2xl p-6 bg-slate-50/50">
                <div className="text-center">
                  <span className="text-slate-400 block font-bold text-[9px] uppercase tracking-wider mb-1">Total Anggota</span>
                  <span className="text-2xl font-black text-slate-900">{totalMembers}</span>
                </div>
                <div className="text-center border-l border-slate-200">
                  <span className="text-slate-400 block font-bold text-[9px] uppercase tracking-wider mb-1">Anggota Aktif</span>
                  <span className="text-2xl font-black text-emerald-600">{activeMembers}</span>
                </div>
                <div className="text-center border-l border-slate-200">
                  <span className="text-slate-400 block font-bold text-[9px] uppercase tracking-wider mb-1">Anggota Nonaktif</span>
                  <span className="text-2xl font-black text-slate-400">{nonactiveMembers}</span>
                </div>
              </div>

              {/* Division sebaran Table */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                  1. Distribusi Anggota Berdasarkan Bidang Organisasi
                </h3>
                <table className="w-full text-left border border-slate-200 text-xs">
                  <thead>
                    <tr className="bg-slate-50 font-bold border-b border-slate-200">
                      <th className="px-4 py-2.5">Nama Bidang Kerja</th>
                      <th className="px-4 py-2.5 text-center">Anggota Aktif</th>
                      <th className="px-4 py-2.5 text-center">Total Anggota</th>
                      <th className="px-4 py-2.5 text-right">Rasio Partisipasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 text-slate-700">
                    {Object.entries(bidangDistribution).map(([bidang, counts]) => (
                      <tr key={bidang}>
                        <td className="px-4 py-2.5 font-bold">{bidang}</td>
                        <td className="px-4 py-2.5 text-center text-emerald-600 font-bold">{counts.aktif}</td>
                        <td className="px-4 py-2.5 text-center">{counts.total}</td>
                        <td className="px-4 py-2.5 text-right font-mono font-bold">
                          {Math.round((counts.aktif / counts.total) * 100)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Members Directory complete list */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                  2. Lampiran Seluruh Daftar Anggota Aktif DWP
                </h3>
                <table className="w-full text-left border border-slate-200 text-[10px]">
                  <thead>
                    <tr className="bg-slate-50 font-bold border-b border-slate-200 uppercase">
                      <th className="px-4 py-2">ID</th>
                      <th className="px-4 py-2">Nama Lengkap</th>
                      <th className="px-4 py-2">Bidang</th>
                      <th className="px-4 py-2">Jabatan</th>
                      <th className="px-4 py-2">HP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 text-slate-700">
                    {members.filter(m => m.status === 'Aktif').map((m) => (
                      <tr key={m.id}>
                        <td className="px-4 py-1.5 font-mono font-bold text-slate-400">{m.id}</td>
                        <td className="px-4 py-1.5 font-bold text-slate-900">{m.namaLengkap}</td>
                        <td className="px-4 py-1.5">{m.bidang}</td>
                        <td className="px-4 py-1.5">{m.jabatan || 'Anggota'}</td>
                        <td className="px-4 py-1.5 font-mono">{m.nomorHp || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CONTENT BLOCK 2: WINNER REPORT LAYOUT */}
          {reportType === 'pemenang' && (
            <div className="space-y-6">
              {/* Quick stats for winners */}
              <div className="grid grid-cols-2 gap-4 border border-slate-200 rounded-2xl p-6 bg-slate-50/50">
                <div className="text-center">
                  <span className="text-slate-400 block font-bold text-[9px] uppercase tracking-wider mb-1">Total Pemenang Tercatat</span>
                  <span className="text-2xl font-black text-slate-900">{winners.length}</span>
                </div>
                <div className="text-center border-l border-slate-200">
                  <span className="text-slate-400 block font-bold text-[9px] uppercase tracking-wider mb-1">Sisa Anggota Belum Menang</span>
                  <span className="text-2xl font-black text-amber-600">
                    {Math.max(0, activeMembers - winners.length)}
                  </span>
                </div>
              </div>

              {/* List of winners in detail table */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                  1. Daftar Pemenang Arisan Terurut Berdasarkan Tanggal Pengundian
                </h3>
                <table className="w-full text-left border border-slate-200 text-xs">
                  <thead>
                    <tr className="bg-slate-50 font-bold border-b border-slate-200">
                      <th className="px-4 py-2.5">ID</th>
                      <th className="px-4 py-2.5">Siklus Periode</th>
                      <th className="px-4 py-2.5">Nama Pemenang</th>
                      <th className="px-4 py-2.5">Bidang Kerja</th>
                      <th className="px-4 py-2.5 text-center">Metode</th>
                      <th className="px-4 py-2.5 text-right">Tanggal Menang</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 text-slate-700">
                    {winners.map((win) => (
                      <tr key={win.id}>
                        <td className="px-4 py-2.5 font-mono font-bold text-slate-400">#{win.id}</td>
                        <td className="px-4 py-2.5 font-bold text-slate-800">{win.periodName}</td>
                        <td className="px-4 py-2.5 font-bold text-slate-900">{win.memberName}</td>
                        <td className="px-4 py-2.5">{win.memberBidang}</td>
                        <td className="px-4 py-2.5 text-center font-bold text-[10px]">
                          {win.jenisUndian === 'Online' ? '💻 ONLINE' : '🎟️ OFFLINE'}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono">{win.tanggalUndian}</td>
                      </tr>
                    ))}
                    {winners.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-8 italic text-slate-400">
                          Belum ada pemenang yang terdata.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Paper Footer Signature Box (Critical for legal physical forms) */}
          <div className="pt-12 flex justify-between text-xs font-sans">
            <div className="text-left space-y-12">
              <div>
                <p className="text-slate-400">Diketahui oleh</p>
                <p className="font-extrabold text-slate-800">Ketua DWP PUPR Sumenep</p>
              </div>
              <div>
                <p className="font-extrabold underline text-slate-900">Ny. Hj. Sri Wahyuni Erianto</p>
                <p className="text-[10px] text-slate-500 font-mono">Dinas Jayalah PUPR Sumenep</p>
              </div>
            </div>

            <div className="text-right space-y-12">
              <div>
                <p className="text-slate-400">Diuji/Disusun oleh</p>
                <p className="font-extrabold text-slate-800">Bendahara / Sekretaris</p>
              </div>
              <div>
                <div className="inline-block border-b-2 border-slate-900 w-44 h-5" />
                <p className="text-[10px] text-slate-400">Tanda Tangan & Cap Organisasi</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ================= Modern Interactive Laravel & SQLite DBMS Workspace ================= */
        <div className="backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10 p-6 md:p-8 space-y-8 select-none text-white max-w-4xl mx-auto animate-fade-in shadow-2xl">
          {/* Header Showcase with Sumenep branding */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-16 shrink-0">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/3/30/Lambang_Kabupaten_Sumenep.png"
                  alt="Urusan Pemda Sumenep"
                  className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(59,130,246,0.3)] animate-bounce"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white">Database Relasional & Skema Laravel</h3>
                <p className="text-xs text-slate-400 mt-1">Struktur SQLite murni yang terintegrasi penuh untuk Dinas PUPR Sumenep</p>
              </div>
            </div>

            <button
              onClick={handleDownloadSqlDump}
              className="w-full md:w-auto px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/15 cursor-pointer border border-white/10"
            >
              <Download className="w-4 h-4 text-white" />
              Unduh SQL DBMS Dump (.sql)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {/* Database Overview */}
              <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-6 space-y-4">
                <h4 className="text-sm font-bold text-blue-450 uppercase tracking-wider flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-400" />
                  Rincian Desain Relasi SQLite
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Database SQLite menyimpan 3 tabel utama yang dirancang untuk menjaga integritas data arisan. Anggota hanya dapat memenangkan arisan <strong>sekali</strong>, dan seluruh pemenang wajib memiliki relasi valid dengan anggota yang aktif serta siklus periode arisan.
                </p>

                {/* DB Diagram visualization */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
                    <span className="font-bold text-white block">📁 members</span>
                    <hr className="border-white/10" />
                    <span className="text-[10px] text-slate-400 block">• id (PK)</span>
                    <span className="text-[10px] text-slate-400 block">• namaLengkap</span>
                    <span className="text-[10px] text-slate-400 block">• bidang, jabatan</span>
                    <span className="text-[10px] text-slate-500 block">• status</span>
                  </div>
                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
                    <span className="font-bold text-white block">📁 periods</span>
                    <hr className="border-white/10" />
                    <span className="text-[10px] text-slate-400 block">• id (PK)</span>
                    <span className="text-[10px] text-slate-400 block">• namaPeriode</span>
                    <span className="text-[10px] text-slate-400 block">• bulan, tahun</span>
                    <span className="text-[10px] text-slate-500 block">• status</span>
                  </div>
                  <div className="p-3 bg-blue-900/10 border border-blue-500/20 rounded-xl space-y-1">
                    <span className="font-bold text-blue-300 block">📁 winners</span>
                    <hr className="border-blue-500/10" />
                    <span className="text-[10px] text-slate-300 block">• id (PK)</span>
                    <span className="text-[10px] text-blue-400 block">• periodId (FK)</span>
                    <span className="text-[10px] text-blue-400 block">• memberId (FK)</span>
                    <span className="text-[10px] text-slate-300 block">• jenisUndian</span>
                  </div>
                </div>
              </div>

              {/* Laravel commands instructions */}
              <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-6 space-y-4">
                <h4 className="text-sm font-bold text-teal-400 uppercase tracking-wider flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-teal-400" />
                  Langkah Penerapan Laravel Migration
                </h4>

                <div className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <p className="font-semibold text-white">1. Inisialisasi Database SQLite di .env</p>
                    <pre className="p-3 bg-slate-900 rounded-xl text-teal-300 overflow-x-auto text-[10px] font-mono border border-white/5">
                      DB_CONNECTION=sqlite
                    </pre>
                  </div>

                  <div className="space-y-1.5">
                    <p className="font-semibold text-white">2. Eksekusi Migrate & Seed</p>
                    <p className="text-[11px] text-slate-400 leading-normal">Salin file yang telah kami sediakan di folder <code className="text-white bg-white/10 px-1 py-0.5 rounded font-mono">/laravel-backend</code> ke dalam proyek Laravel Anda, lalu jalankan:</p>
                    <pre className="p-3 bg-slate-900 rounded-xl text-teal-300 overflow-x-auto text-[10px] font-mono border border-white/5">
                      {"# Buat file database SQLite kosong\ntouch database/database.sqlite\n\n# Migrasikan dan seeding data bawaan SIARIS\nphp artisan migrate --seed"}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Code files sidebar explorer */}
            <div className="space-y-6">
              <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-5 space-y-4 h-full">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-blue-400" />
                  Struktur File Terbuat
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Kami telah membuatkan berkas backend Laravel & SQLite murni siap guna di dalam folder proyek Anda:
                </p>

                <div className="space-y-2 text-xs font-mono">
                  <div className="p-2.5 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-between border border-white/5 transition-colors">
                    <div>
                      <span className="text-white block font-bold text-[10px]">app/Models/</span>
                      <span className="text-[9px] text-slate-400">Member, Period, Winner</span>
                    </div>
                    <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">Model</span>
                  </div>

                  <div className="p-2.5 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-between border border-white/5 transition-colors">
                    <div>
                      <span className="text-white block font-bold text-[10px]">database/migrations/</span>
                      <span className="text-[9px] text-slate-400">3 File Struktur Tabel</span>
                    </div>
                    <span className="text-[9px] bg-teal-500/20 text-teal-400 px-1.5 py-0.5 rounded">Migrasi</span>
                  </div>

                  <div className="p-2.5 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-between border border-white/5 transition-colors">
                    <div>
                      <span className="text-white block font-bold text-[10px]">database/seeders/</span>
                      <span className="text-[9px] text-slate-400">ArisanSeeder.php</span>
                    </div>
                    <span className="text-[9px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded">Seeder</span>
                  </div>

                  <div className="p-2.5 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-between border border-white/5 transition-colors">
                    <div>
                      <span className="text-white block font-bold text-[10px]">app/Http/Controllers/</span>
                      <span className="text-[9px] text-slate-400">REST API Controllers</span>
                    </div>
                    <span className="text-[9px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded">API</span>
                  </div>

                  <div className="p-2.5 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-between border border-white/5 transition-colors">
                    <div>
                      <span className="text-white block font-bold text-[10px]">routes/api.php</span>
                      <span className="text-[9px] text-slate-400">REST api endpoints map</span>
                    </div>
                    <span className="text-[9px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded">Route</span>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[10px] text-slate-350 leading-relaxed">
                    🌟 <strong>Pro-Tip:</strong> File <code className="text-white font-mono bg-white/10 px-0.5 rounded">README.md</code> di folder <code className="text-white font-mono bg-white/10 px-0.5 rounded">/laravel-backend</code> memuat panduan lengkap konfigurasi dan integrasi ini.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

