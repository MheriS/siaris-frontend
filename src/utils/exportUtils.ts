/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Member, Winner } from '../types';

// Helper to escape CSV cell values
function escapeCSV(val: string): string {
  if (val === undefined || val === null) return '';
  const str = String(val).replace(/"/g, '""');
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return `"${str}"`;
  }
  return str;
}

// Export Members to CSV
export function exportMembersToCSV(members: Member[]) {
  const headers = ['ID', 'Nama Lengkap', 'NIP', 'Jabatan', 'Bidang', 'Nomor HP', 'Status', 'Tanggal Bergabung'];
  const rows = members.map(m => [
    m.id,
    m.namaLengkap,
    m.nip || '-',
    m.jabatan,
    m.bidang,
    m.nomorHp,
    m.status,
    m.tanggalBergabung
  ]);

  const csvContent = [headers, ...rows]
    .map(e => e.map(val => escapeCSV(val)).join(','))
    .join('\n');

  downloadCSVFile(csvContent, 'Data_Anggota_DW_PUPR.csv');
}

// Export Winners to CSV
export function exportWinnersToCSV(winners: Winner[]) {
  const headers = ['ID_Pemenang', 'Periode', 'Nama Anggota', 'Bidang', 'Tanggal Undian', 'Metode Undian'];
  const rows = winners.map(w => [
    w.id,
    w.periodName,
    w.memberName,
    w.memberBidang,
    w.tanggalUndian,
    w.jenisUndian
  ]);

  const csvContent = [headers, ...rows]
    .map(e => e.map(val => escapeCSV(val)).join(','))
    .join('\n');

  downloadCSVFile(csvContent, 'Riwayat_Pemenang_DW_PUPR.csv');
}

// Generic file downloader
function downloadCSVFile(content: string, filename: string) {
  const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Simple Parser for uploaded CSV
export function parseCSVToMembers(text: string): Partial<Member>[] {
  const lines = text.split(/\r?\n/);
  if (lines.length <= 1) return [];

  // Parse header
  const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
  
  const parsedMembers: Partial<Member>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Split on comma supporting quotes
    const values: string[] = [];
    let currentVal = '';
    let inQuotes = false;

    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(currentVal.trim().replace(/^["']|["']$/g, ''));
        currentVal = '';
      } else {
        currentVal += char;
      }
    }
    values.push(currentVal.trim().replace(/^["']|["']$/g, ''));

    if (values.length === 0 || !values[0]) continue;

    // Map to Member object
    const member: Partial<Member> = {
      status: 'Aktif',
      tanggalBergabung: new Date().toISOString().split('T')[0]
    };

    // Try mapping headers
    for (let h = 0; h < headers.length; h++) {
      const header = headers[h];
      const val = values[h] || '';

      if (header.includes('nama') || header.includes('lengkap') || header === 'name') {
        member.namaLengkap = val;
      } else if (header.includes('nip')) {
        member.nip = val;
      } else if (header.includes('jabatan') || header === 'role') {
        member.jabatan = val;
      } else if (header.includes('bidang') || header === 'division' || header === 'department') {
        member.bidang = val;
      } else if (header.includes('hp') || header.includes('telepon') || header.includes('phone')) {
        member.nomorHp = val;
      } else if (header.includes('status')) {
        member.status = val.toLowerCase().includes('non') ? 'Nonaktif' : 'Aktif';
      } else if (header.includes('gabung') || header.includes('tanggal')) {
        member.tanggalBergabung = val || new Date().toISOString().split('T')[0];
      }
    }

    if (member.namaLengkap) {
      parsedMembers.push(member);
    }
  }

  return parsedMembers;
}
