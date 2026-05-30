/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sparkles, Trophy, Shuffle, RefreshCw, Calendar, Volume2, VolumeX, CheckCircle, Flame } from 'lucide-react';
import { Member, Period, Winner } from '../types';
import { drawLottery } from '../utils/api';

interface OnlineLotteryProps {
  members: Member[];
  periods: Period[];
  winners: Winner[];
  onSaveWinner: (winner: Omit<Winner, 'id'>) => Promise<any>;
  onRefreshWinners: () => Promise<void>;
}

export default function OnlineLottery({ members, periods, winners, onSaveWinner, onRefreshWinners }: OnlineLotteryProps) {
  const activePeriods = periods.filter(p => p.status === 'Aktif');
  const [selectedPeriodId, setSelectedPeriodId] = useState(activePeriods[0]?.id || periods[0]?.id || '');

  // Sound effects toggle
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Lottery process states
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnWinner, setDrawnWinner] = useState<Member | null>(null);
  const [rollingName, setRollingName] = useState('PILIH PERIODE & MULAI');
  const [candidates, setCandidates] = useState<Member[]>([]);
  const [winnerSaved, setWinnerSaved] = useState(false);

  // Confetti particles local state
  const [showConfetti, setShowConfetti] = useState(false);

  // Pre-load candidates on period change
  useEffect(() => {
    if (!selectedPeriodId) return;

    // Candidates: must be AKTIF
    const activeCandidates = members.filter(m => m.status === 'Aktif');

    // And must NOT have won already
    const wonMemberIds = winners.map(w => w.memberId);
    const availableCandidates = activeCandidates.filter(m => !wonMemberIds.includes(m.id));

    setCandidates(availableCandidates);
    setDrawnWinner(null);
    setRollingName(availableCandidates.length > 0 ? '🎰 Siap Mengocok Arisan' : '❌ Semua Anggota Sudah Menang');
    setWinnerSaved(false);
  }, [selectedPeriodId, members, winners]);

  const triggerBeep = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) { }
  };

  const triggerCelebrateSfx = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const notes = [440, 554, 659, 880];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.15);
        gain.gain.setValueAtTime(0.06, ctx.currentTime + idx * 0.15);
        osc.start(ctx.currentTime + idx * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.15 + 0.3);
        osc.stop(ctx.currentTime + idx * 0.15 + 0.35);
      });
    } catch (e) { }
  };

  const startDrawing = async () => {
    if (isDrawing || candidates.length === 0) return;

    setIsDrawing(true);
    setDrawnWinner(null);
    setShowConfetti(false);
    setWinnerSaved(false);

    // Start the rolling visual animation while the API call runs in background
    const duration = 3000;
    const intervalTime = 60;
    const startTime = Date.now();
    let apiResult: any = null;
    let apiError: string | null = null;

    // Kick off API call immediately
    const apiPromise = drawLottery(selectedPeriodId)
      .then(res => { apiResult = res; })
      .catch(err => { apiError = err.message; });

    const roll = () => {
      const elapsed = Date.now() - startTime;

      if (elapsed >= duration) {
        // Animation is done — check if API result is ready
        const finalize = () => {
          if (apiError) {
            setRollingName('❌ Gagal: ' + apiError);
            setIsDrawing(false);
            return;
          }

          if (!apiResult) {
            // API still loading, wait a bit more
            setTimeout(finalize, 200);
            return;
          }

          const winnerData = apiResult.winner;
          const finalWinnerMember = members.find(m => m.id === winnerData.memberId);

          if (finalWinnerMember) {
            setDrawnWinner(finalWinnerMember);
            setRollingName(finalWinnerMember.namaLengkap);
          } else {
            setRollingName(winnerData.memberName);
          }

          setIsDrawing(false);
          setShowConfetti(true);
          setWinnerSaved(true);
          triggerCelebrateSfx();

          // Refresh winners data from backend
          onRefreshWinners();
        };

        // Wait for API if still pending
        apiPromise.then(finalize);
      } else {
        // Continue rolling names
        const tempIdx = Math.floor(Math.random() * candidates.length);
        setRollingName(candidates[tempIdx].namaLengkap);
        triggerBeep();

        const nextInterval = 60 + Math.pow(elapsed / duration, 3) * 350;
        setTimeout(roll, nextInterval);
      }
    };

    setTimeout(roll, intervalTime);
  };

  const activePeriodObj = periods.find(p => p.id === selectedPeriodId);

  return (
    <div className="space-y-6 font-sans">
      <style>{`
        @keyframes rainbowBorder {
          0% { border-color: #3b82f6; }
          50% { border-color: #14b8a6; }
          100% { border-color: #6366f1; }
        }
        @keyframes bounceShort {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-10px) scale(1.02); }
        }
        .anim-rainbow {
          animation: rainbowBorder 3s linear infinite;
        }
        .animate-bounce-short {
          animation: bounceShort 0.5s ease-out 1;
        }
      `}</style>

      {/* Primary configuration banner */}
      <div className="backdrop-blur-xl bg-white/5 p-6 rounded-2xl border border-white/10 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-white">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Shuffle className="w-6 h-6 text-blue-400" />
            Pengundian Arisan Online (Digital)
          </h2>
          <p className="text-xs text-slate-400">
            Mengundi nama secara acak melalui server — hasil final dari database
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border transition-colors flex items-center justify-center cursor-pointer ${soundEnabled ? 'bg-blue-600/20 border-blue-500/30 text-blue-400' : 'bg-white/5 border-white/10 text-slate-400'
              }`}
            title={soundEnabled ? 'Matikan Suara' : 'Aktifkan Suara'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <div className="flex items-center gap-2 bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 w-full sm:w-auto">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              value={selectedPeriodId}
              onChange={(e) => setSelectedPeriodId(e.target.value)}
              disabled={isDrawing}
              className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none cursor-pointer"
            >
              {periods.map(p => (
                <option key={p.id} value={p.id} className="bg-slate-905 text-white">
                  [{p.status}] {p.namaPeriode}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Main interactive visual machine screen */}
        <div className="backdrop-blur-xl bg-white/5 p-8 rounded-3xl border border-white/10 shadow-lg lg:col-span-8 flex flex-col items-center justify-center min-h-[420px] text-center relative overflow-hidden text-white">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

          {showConfetti && (
            <div className="absolute inset-0 z-10 pointer-events-none flex flex-wrap gap-1 justify-around overflow-hidden p-4">
              {[...Array(24)].map((_, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full animate-bounce"
                  style={{
                    backgroundColor: ['#3b82f6', '#14b8a6', '#6366f1', '#10b981', '#a855f7'][i % 5],
                    animationDelay: `${i * 0.15}s`,
                    opacity: 0.8
                  }}
                />
              ))}
            </div>
          )}

          <div className={`w-full max-w-xl p-8 rounded-3xl bg-slate-950/85 text-white shadow-2xl relative border-4 flex flex-col justify-between min-h-[280px] ${isDrawing ? 'anim-rainbow' : 'border-white/10'
            }`}>
            <div className="flex items-center justify-between pb-4 border-b border-white/10 text-xs font-mono tracking-widest text-slate-400">
              <span className="flex items-center gap-1.5 uppercase font-bold text-[10px]">
                <Flame className={`w-3.5 h-3.5 ${isDrawing ? 'text-blue-400 animate-pulse' : 'text-slate-500'}`} />
                {activePeriodObj ? activePeriodObj.namaPeriode : 'Siklus Arisan'}
              </span>
              <span className="text-[10px] font-bold text-slate-500">
                TOTAL: {candidates.length} CANDIDATES
              </span>
            </div>

            <div className="py-8 my-auto select-none">
              <div className={`text-xl md:text-3xl font-extrabold tracking-tight transition-all duration-75 truncate max-w-full px-4 ${isDrawing
                ? 'text-blue-400 scale-95 opacity-80'
                : drawnWinner
                  ? 'text-teal-350 scale-100 drop-shadow-[0_0_12px_rgba(20,184,166,0.3)]'
                  : 'text-slate-300'
                }`}>
                {rollingName}
              </div>

              {drawnWinner && (
                <div className="mt-3 text-xs font-bold uppercase tracking-widest text-[#94a3b8] flex items-center justify-center gap-1">
                  <span className="bg-teal-500/20 text-teal-300 px-3 py-1 rounded-full border border-teal-500/30">
                    Bidang: {drawnWinner.bidang}
                  </span>
                </div>
              )}
            </div>

            {winnerSaved && drawnWinner && (
              <div className="px-4 py-2 bg-teal-500/10 border border-teal-500/30 rounded-xl text-[11px] text-teal-350 font-bold max-w-sm mx-auto flex items-center justify-center gap-1.5 animate-pulse">
                <CheckCircle className="w-3.5 h-3.5 text-teal-400" />
                Data Pemenang Tersimpan di Database Server!
              </div>
            )}

            <div className="pt-4 border-t border-white/5 text-[9px] text-slate-500 font-mono tracking-widest uppercase">
              SIARIS DW-PUPR Sumenep Engine • Server-Side Draw
            </div>
          </div>

          {/* New Animated Winner Announcement Modal */}
          {winnerSaved && drawnWinner && (
            <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in pointer-events-none">
              <div className="bg-slate-900 border border-white/10 p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-lg w-full transform transition-all animate-bounce-short pointer-events-auto">

                <div className="w-20 h-20 bg-teal-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(20,184,166,0.3)]">
                  <Trophy className="w-10 h-10 text-teal-400" />
                </div>

                <h3 className="text-xl font-bold text-slate-300 uppercase tracking-widest mb-2 font-display text-center">
                  Selamat Kepada
                </h3>

                <div className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-blue-400 text-center mb-4 leading-tight py-2 drop-shadow-md">
                  {drawnWinner.namaLengkap}
                </div>

                <p className="px-4 py-1.5 rounded-full bg-white/10 text-white font-bold text-sm border border-white/20 mb-8">
                  Bidang: {drawnWinner.bidang}
                </p>

                <div className="flex w-full gap-3">
                  <button
                    onClick={() => {
                      setWinnerSaved(false);
                      setShowConfetti(false);
                      setDrawnWinner(null);
                    }}
                    className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Tutup
                  </button>
                  <button
                    onClick={startDrawing}
                    disabled={candidates.length === 0}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50"
                  >
                    Kocok Lagi
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col items-center gap-3 w-full max-w-xs font-sans">
            <button
              onClick={startDrawing}
              disabled={isDrawing || candidates.length === 0}
              className={`w-full py-4 text-sm font-bold tracking-wider rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg border cursor-pointer ${candidates.length === 0
                ? 'bg-white/5 text-slate-500 border-white/10 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white border-white/15 shadow-blue-500/10'
                }`}
            >
              <Shuffle className={`w-5 h-5 ${isDrawing ? 'animate-spin' : ''}`} />
              {isDrawing ? 'Mengacak Undian...' : 'MULAI UNDIAN SEKARANG'}
            </button>
            <p className="text-[10px] text-slate-500">
              * Hanya mengacak anggota aktif yang belum pernah menang arisan
            </p>
          </div>
        </div>

        {/* Candidate pool roster pane right */}
        <div className="backdrop-blur-xl bg-white/5 p-6 rounded-3xl border border-white/10 shadow-lg lg:col-span-4 flex flex-col max-h-[420px] text-white">
          <div className="border-b border-white/15 pb-4 mb-4 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white">Daftar Nomine ({candidates.length})</h4>
              <p className="text-[10px] text-slate-400">Anggota aktif yang belum menang</p>
            </div>
            <button
              onClick={onRefreshWinners}
              className="p-1.5 text-slate-400 hover:text-white border border-white/10 hover:bg-white/5 rounded-lg cursor-pointer"
              title="Perbarui data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-y-auto space-y-2 flex-1 pr-1 text-xs">
            {candidates.map((cand) => (
              <div
                key={cand.id}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 flex items-center justify-between text-white"
              >
                <div>
                  <h5 className="font-bold text-slate-200">{cand.namaLengkap}</h5>
                  <span className="text-[10px] text-slate-400 font-mono">{cand.nip || 'Non-NIP'}</span>
                </div>
                <span className="text-[10px] font-bold bg-white/10 text-slate-300 px-2.5 py-0.5 rounded-full border border-white/10">
                  {cand.bidang}
                </span>
              </div>
            ))}

            {candidates.length === 0 && (
              <div className="text-center py-12 text-slate-400 italic">
                Tidak ada anggota aktif yang tersisa untuk dikocok pada periode ini.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
