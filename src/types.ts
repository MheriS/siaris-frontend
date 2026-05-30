/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Member {
  id: string; // Keep as string (UUID or numeric string) for easy client-side management
  namaLengkap: string;
  nip?: string;
  jabatan: string;
  bidang: string; // e.g. "Cipta Karya", "Bina Marga", "Sumber Daya Air", "Tata Ruang", "Sekretariat"
  nomorHp: string;
  status: 'Aktif' | 'Nonaktif';
  tanggalBergabung: string;
}

export interface Period {
  id: string;
  namaPeriode: string;
  bulan: string;
  tahun: number;
  status: 'Aktif' | 'Selesai';
}

export interface Winner {
  id: string;
  periodId: string;
  periodName: string;
  memberId: string;
  memberName: string;
  memberBidang: string;
  tanggalUndian: string;
  jenisUndian: 'Online' | 'Offline';
}

export interface Stats {
  totalAnggota: number;
  aktifAnggota: number;
  nonaktifAnggota: number;
  totalPeriode: number;
  periodeAktifName: string;
  pemenangTerakhirName: string;
}
