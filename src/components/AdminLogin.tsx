/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, Lock, User, Mail, KeyRound, UserPlus, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { apiLogin, apiRegister, apiForgotPassword, apiResetPassword } from '../utils/api';

interface AdminLoginProps {
  onLoginSuccess: (user: any) => void;
}

type AuthView = 'login' | 'register' | 'forgot' | 'reset';

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [view, setView] = useState<AuthView>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');

  // Forgot/Reset state
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiLogin(email, password);
      onLoginSuccess(res.data?.user);
    } catch (err: any) {
      setError(err.message || 'Login gagal.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (regPassword !== regConfirm) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }
    setLoading(true);
    try {
      const res = await apiRegister(regName, regEmail, regPassword, regConfirm);
      onLoginSuccess(res.data?.user);
    } catch (err: any) {
      setError(err.message || 'Registrasi gagal.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiForgotPassword(forgotEmail);
      setSuccessMsg(`Kode reset: ${res.reset_code} (berlaku 30 menit)`);
      setResetEmail(forgotEmail);
      setView('reset');
    } catch (err: any) {
      setError(err.message || 'Gagal mengirim kode reset.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword !== newPasswordConfirm) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }
    setLoading(true);
    try {
      await apiResetPassword(resetEmail, resetCode, newPassword, newPasswordConfirm);
      setSuccessMsg('Password berhasil direset! Silakan login.');
      setView('login');
    } catch (err: any) {
      setError(err.message || 'Reset gagal.');
    } finally {
      setLoading(false);
    }
  };

  const switchView = (v: AuthView) => {
    setView(v);
    setError('');
    setSuccessMsg('');
  };

  const renderBackButton = (target: AuthView, label: string) => (
    <button
      type="button"
      onClick={() => switchView(target)}
      className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer mb-4 transition-colors"
    >
      <ArrowLeft className="w-3.5 h-3.5" />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden font-sans">

      {/* Background Mesh Gradients */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/15 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-600/15 blur-[120px]" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-indigo-600/10 blur-[100px]" />
      </div>

      <div className="w-full max-w-md backdrop-blur-xl bg-white/5 rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-10 relative">
        {/* Banner */}
        <div className="relative bg-[#1e293b]/40 text-white px-6 py-10 text-center overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-teal-600/10 mix-blend-multiply" />
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-teal-500/10 rounded-full blur-2xl" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-20 mb-4 flex items-center justify-center">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/3/30/Lambang_Kabupaten_Sumenep.png"
                alt="Logo Pemda Sumenep"
                className="w-full h-full object-contain filter drop-shadow-[0_4px_10px_rgba(59,130,246,0.3)] animate-pulse"
                referrerPolicy="no-referrer"
              />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">SIARIS</h1>
            <p className="text-xs text-slate-300 mt-2 font-medium">Sistem Arisan Dharma Wanita Persatuan DWP PUPR Sumenep</p>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-8">
          {/* Error Message */}
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm px-4 py-3 rounded-xl flex items-start gap-2 mb-6">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="bg-teal-500/10 border border-teal-500/20 text-teal-300 text-sm px-4 py-3 rounded-xl flex items-start gap-2 mb-6">
              <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ═══════════ LOGIN VIEW ═══════════ */}
          {view === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Email</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="admin@siaris.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all text-sm text-white placeholder-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Kata Sandi</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all text-sm text-white placeholder-slate-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white font-bold rounded-xl tracking-wide shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/10 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                {loading ? 'Memproses...' : 'Masuk Antarmuka Admin'}
              </button>

              <div className="flex items-center justify-between text-xs pt-2">
                <button type="button" onClick={() => switchView('forgot')} className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer transition-colors">
                  Lupa Password?
                </button>
                <button type="button" onClick={() => switchView('register')} className="text-teal-400 hover:text-teal-300 font-semibold cursor-pointer transition-colors">
                  Buat Akun Baru
                </button>
              </div>

              {/* Default credentials hint */}
              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="inline-block bg-white/5 rounded-xl p-4 border border-white/10 text-left w-full">
                  <span className="text-xs font-bold text-blue-400 block mb-1">🔑 Kredensial Bawaan:</span>
                  <div className="text-xs text-slate-300 font-mono space-y-0.5">
                    <div>Email: <span className="font-bold text-white">admin@siaris.id</span></div>
                    <div>Password: <span className="font-bold text-white">admin123</span></div>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* ═══════════ REGISTER VIEW ═══════════ */}
          {view === 'register' && (
            <div>
              {renderBackButton('login', 'Kembali ke Login')}
              <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-teal-400" />
                Buat Akun Baru
              </h3>
              <p className="text-xs text-slate-400 mb-6">Daftarkan akun admin baru untuk mengakses SIARIS</p>

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Nama Lengkap</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><User className="w-4 h-4" /></span>
                    <input type="text" required placeholder="Nama lengkap Anda" value={regName} onChange={(e) => setRegName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-sm text-white placeholder-slate-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Email</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><Mail className="w-4 h-4" /></span>
                    <input type="email" required placeholder="email@example.com" value={regEmail} onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-sm text-white placeholder-slate-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Password</label>
                    <input type="password" required minLength={6} placeholder="Min 6 karakter" value={regPassword} onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-sm text-white placeholder-slate-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Konfirmasi</label>
                    <input type="password" required minLength={6} placeholder="Ulangi password" value={regConfirm} onChange={(e) => setRegConfirm(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-sm text-white placeholder-slate-500" />
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-500 hover:to-blue-500 text-white font-bold rounded-xl tracking-wide shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/10 disabled:opacity-50">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
                </button>
              </form>
            </div>
          )}

          {/* ═══════════ FORGOT PASSWORD VIEW ═══════════ */}
          {view === 'forgot' && (
            <div>
              {renderBackButton('login', 'Kembali ke Login')}
              <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-400" />
                Lupa Password
              </h3>
              <p className="text-xs text-slate-400 mb-6">Masukkan email terdaftar untuk mendapatkan kode reset</p>

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Email Terdaftar</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><Mail className="w-4 h-4" /></span>
                    <input type="email" required placeholder="email@example.com" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm text-white placeholder-slate-500" />
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold rounded-xl tracking-wide shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/10 disabled:opacity-50">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                  {loading ? 'Mengirim...' : 'Kirim Kode Reset'}
                </button>
              </form>
            </div>
          )}

          {/* ═══════════ RESET PASSWORD VIEW ═══════════ */}
          {view === 'reset' && (
            <div>
              {renderBackButton('forgot', 'Kembali')}
              <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                <Lock className="w-5 h-5 text-teal-400" />
                Reset Password
              </h3>
              <p className="text-xs text-slate-400 mb-6">Masukkan kode reset dan password baru Anda</p>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Kode Reset (6 digit)</label>
                  <input type="text" required maxLength={6} placeholder="123456" value={resetCode} onChange={(e) => setResetCode(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-sm text-white placeholder-slate-500 font-mono tracking-[0.5em] text-center text-lg" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Password Baru</label>
                    <input type="password" required minLength={6} placeholder="Min 6 karakter" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-sm text-white placeholder-slate-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Konfirmasi</label>
                    <input type="password" required minLength={6} placeholder="Ulangi password" value={newPasswordConfirm} onChange={(e) => setNewPasswordConfirm(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-sm text-white placeholder-slate-500" />
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-500 hover:to-blue-500 text-white font-bold rounded-xl tracking-wide shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/10 disabled:opacity-50">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  {loading ? 'Mereset...' : 'Reset Password'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
