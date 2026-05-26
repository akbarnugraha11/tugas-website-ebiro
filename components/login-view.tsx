'use client';

import { useState, useEffect } from 'react';
import { useEPinjam } from '@/lib/state-context';
import { User, Lock, Eye, EyeOff, Projector, Mail, Phone, BookOpen, KeyRound, UserPlus } from 'lucide-react';
import { motion } from 'motion/react';

export default function LoginView() {
  const { login, registerStudent } = useEPinjam();
  const [mounted, setMounted] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Login form state
  const [nimOrId, setNimOrId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Registration form state
  const [regNim, setRegNim] = useState('');
  const [regName, setRegName] = useState('');
  const [regDept, setRegDept] = useState('Informatika');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  useEffect(() => {
    let active = true;
    requestAnimationFrame(() => {
      if (active) {
        setMounted(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const handleQuickFill = (idVal: string, passVal: string) => {
    setNimOrId(idVal);
    setPassword(passVal);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      const success = login(nimOrId.trim(), password.trim());
      setIsSubmitting(false);
    }, 800);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (regPassword !== regConfirmPassword) {
      alert('Konfirmasi sandi Anda tidak cocok dengan kata sandi yang diisi!');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const success = registerStudent({
        name: regName.trim(),
        nimOrId: regNim.trim(),
        password: regPassword,
        dept: regDept,
        email: regEmail.trim(),
        phone: regPhone.trim()
      });
      setIsSubmitting(false);
      if (success) {
        // Switch to login mode and autopopulate credentials
        setNimOrId(regNim.trim());
        setPassword(regPassword);
        setIsRegisterMode(false);
        // Clear registration states
        setRegNim('');
        setRegName('');
        setRegEmail('');
        setRegPhone('');
        setRegPassword('');
        setRegConfirmPassword('');
      }
    }, 800);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden" id="login-container">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-900/5 blur-[120px] pointer-events-none" />
        
        <div className="flex flex-col items-center gap-3 relative z-10">
          <div className="p-3 bg-indigo-600/10 rounded-2xl border border-indigo-500/20 animate-pulse">
            <Projector className="w-8 h-8 text-indigo-400" />
          </div>
          <span className="font-bold tracking-tight text-xl text-indigo-200 mt-2">Memuat E-Pinjam...</span>
          <div className="w-5 h-5 border-2 border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin mt-1" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden" id="login-container">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-[-20%] left-[20%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[20%] w-[40%] h-[40%] rounded-full bg-teal-950/20 blur-[120px] pointer-events-none" />

      {/* SINGLE CENTERED LOGIN/REGISTER CARD CARD */}
      <motion.div
        key={isRegisterMode ? 'register' : 'login'}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-lg bg-slate-900/40 p-5 sm:p-8 rounded-3xl border border-white/5 backdrop-blur-xl shadow-2xl relative"
        id="login-card"
      >
        <div className="flex flex-col items-center mb-6 text-center" id="login-header">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 mb-3">
            {isRegisterMode ? (
              <UserPlus className="w-6 h-6 text-indigo-400" />
            ) : (
              <Projector className="w-6 h-6 text-indigo-400" />
            )}
          </div>
          
          <div className="flex items-center gap-2 mb-1 justify-center" id="brand-logo-centered">
            <span className="font-bold tracking-tight text-xl bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">
              E-Pinjam Biro
            </span>
          </div>

          <p className="text-slate-400 text-xs sm:text-sm max-w-md">
            {isRegisterMode 
              ? 'Lengkapi data kemahasiswaan untuk mendaftar' 
              : 'Sistem Booking & Peminjaman InFocus — UMSU'}
          </p>
        </div>

        {!isRegisterMode ? (
          /* --- UNIFIED SINGLE LOGIN FORM --- */
          <form onSubmit={handleLoginSubmit} className="space-y-4" id="login-form">
            <div>
              <label className="block text-slate-300 text-[10px] sm:text-xs font-semibold mb-1.5 uppercase tracking-wider">
                NIM Mahasiswa atau ID Admin
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  suppressHydrationWarning={true}
                  value={nimOrId}
                  onChange={(e) => setNimOrId(e.target.value)}
                  placeholder="Masukkan NIM (contoh: 22019904) atau ID Admin"
                  className="w-full pl-9 pr-3 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm bg-slate-950/50 hover:bg-slate-950/80 focus:bg-slate-950/90 text-slate-200 outline-none transition-all border border-white/10 focus:border-indigo-500"
                  id="input-login-id"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-slate-300 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
                  Kata Sandi
                </label>
                <a
                  href="#lupa"
                  className="text-[10px] sm:text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Untuk reset password akun mahasiswa bawaan atau akun ADMIN, silakan hubungi Gedung Administrasi Sarana Prasarana.');
                  }}
                  id="link-lupa-pass"
                >
                  Lupa Password?
                </a>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  suppressHydrationWarning={true}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-9 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm bg-slate-950/50 hover:bg-slate-950/80 focus:bg-slate-950/90 text-slate-200 outline-none transition-all border border-white/10 focus:border-indigo-500"
                  id="input-login-password"
                />
                <button
                  type="button"
                  suppressHydrationWarning={true}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-200 cursor-pointer"
                  id="btn-toggle-password"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* SSO Routing Info */}
            <div className="p-3 bg-slate-950/40 rounded-xl border border-white/5 text-[10px] sm:text-xs text-slate-400 leading-normal">
              💡 <span className="text-slate-300 font-semibold">Integrasi SSO:</span> Cukup masukkan NIM atau ID Anda. Sistem akan mendeteksi peran Anda secara otomatis dan mengarahkan ke halaman <span className="text-teal-400">Admin</span> atau <span className="text-indigo-400">Mahasiswa</span> yang sesuai.
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-500/20 active:shadow-none transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-2"
              id="btn-login-submit"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Memproses...
                </>
              ) : (
                'Masuk ke Sistem'
              )}
            </button>
          </form>
        ) : (
          /* --- STUDENT REGISTRATION FORM --- */
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5" id="register-form">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-slate-300 text-[10px] sm:text-xs font-semibold mb-1.5 uppercase tracking-wider">
                  NIM Mahasiswa
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-slate-400">
                    <KeyRound className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 22019908"
                    className="w-full pl-8 pr-2.5 py-2 rounded-xl text-xs bg-slate-950/50 border border-white/10 text-slate-200 outline-none transition-all focus:border-indigo-500"
                    value={regNim}
                    onChange={(e) => setRegNim(e.target.value)}
                    id="reg-nim-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-[10px] sm:text-xs font-semibold mb-1.5 uppercase tracking-wider">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-slate-400">
                    <User className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Nama Lengkap Anda"
                    className="w-full pl-8 pr-2.5 py-2 rounded-xl text-xs bg-slate-950/50 border border-white/10 text-slate-200 outline-none transition-all focus:border-indigo-500"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    id="reg-name-input"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-[10px] sm:text-xs font-semibold mb-1.5 uppercase tracking-wider">
                Program Studi (Departemen)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-slate-400">
                  <BookOpen className="w-3.5 h-3.5" />
                </span>
                <select
                  className="w-full pl-8 pr-2.5 py-2 rounded-xl text-xs bg-slate-950 border border-white/10 text-slate-200 outline-none transition-all focus:border-indigo-500 cursor-pointer"
                  value={regDept}
                  onChange={(e) => setRegDept(e.target.value)}
                  id="reg-dept-input"
                >
                  <option value="Informatika">Informatika</option>
                  <option value="Sistem Informasi">Sistem Informasi</option>
                  <option value="Teknik Elektro">Teknik Elektro</option>
                  <option value="Teknik Kimia">Teknik Kimia</option>
                  <option value="Teknik Mesin">Teknik Mesin</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-slate-300 text-[10px] sm:text-xs font-semibold mb-1.5 uppercase tracking-wider">
                  E-Mail Kampus
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-slate-400">
                    <Mail className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="user@mhs.ugm.ac.id"
                    className="w-full pl-8 pr-2.5 py-2 rounded-xl text-xs bg-slate-950/50 border border-white/10 text-slate-200 outline-none transition-all focus:border-indigo-500"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    id="reg-email-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-[10px] sm:text-xs font-semibold mb-1.5 uppercase tracking-wider">
                  No. Handphone (WhatsApp)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-slate-400">
                    <Phone className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="0812xxxxx"
                    className="w-full pl-8 pr-2.5 py-2 rounded-xl text-xs bg-slate-950/50 border border-white/10 text-slate-200 outline-none transition-all focus:border-indigo-500"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    id="reg-phone-input"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-slate-300 text-[10px] sm:text-xs font-semibold mb-1.5 uppercase tracking-wider">
                  Kata Sandi
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-slate-400">
                    <Lock className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    placeholder="Min. 6 karakter"
                    className="w-full pl-8 pr-8 py-2 rounded-xl text-xs bg-slate-950/50 border border-white/10 text-slate-200 outline-none transition-all focus:border-indigo-500"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    id="reg-password-input"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-2 text-slate-400 hover:text-slate-200 cursor-pointer"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                  >
                    {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-[10px] sm:text-xs font-semibold mb-1.5 uppercase tracking-wider">
                  Ulangi Kata Sandi
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-slate-400">
                    <Lock className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="Ketik ulang sandi"
                    className="w-full pl-8 pr-2.5 py-2 rounded-xl text-xs bg-slate-950/50 border border-white/10 text-slate-200 outline-none transition-all focus:border-indigo-500"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    id="reg-confirm-input"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-lg shadow-emerald-500/20 active:shadow-none transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-3"
              id="btn-register-submit"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Mendaftarkan...
                </>
              ) : (
                'Daftarkan Akun Baru 📝'
              )}
            </button>
          </form>
        )}

        {/* Quick Demo Assist - Click to Autofill Credentials */}
        {!isRegisterMode && (
          <div className="mt-4 p-3 bg-indigo-950/40 rounded-xl border border-indigo-500/10 text-[10px] sm:text-xs" id="quick-login-hints">
            <p className="font-semibold text-indigo-300 mb-1 flex items-center gap-1">
              <span>💡</span> Akses Cepat Demo (Klik untuk Autofill):
            </p>
            <div className="flex flex-wrap gap-2 mt-1.5">
              <button
                type="button"
                onClick={() => handleQuickFill('22019904', 'biropinjam123')}
                className="px-2 py-1 text-[10px] bg-indigo-900/30 text-indigo-300 hover:bg-indigo-900/60 rounded border border-indigo-500/20 cursor-pointer transition-colors"
              >
                NIM Budi (Mahasiswa)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('ADMIN', 'biropinjam123')}
                className="px-2 py-1 text-[10px] bg-indigo-900/30 text-indigo-300 hover:bg-indigo-900/60 rounded border border-indigo-500/20 cursor-pointer transition-colors"
              >
                ID Admin (ADMIN)
              </button>
            </div>
          </div>
        )}

        {/* Mode Switcher footer link */}
        <div className="mt-5 text-center text-xs text-slate-400">
          {isRegisterMode ? (
            <p>
              Sudah memiliki akun?{' '}
              <button
                type="button"
                onClick={() => setIsRegisterMode(false)}
                className="text-indigo-400 font-bold hover:underline cursor-pointer"
                id="link-switch-to-login"
              >
                Masuk Sekarang
              </button>
            </p>
          ) : (
            <p>
              Belum memiliki akun Mahasiswa?{' '}
              <button
                type="button"
                onClick={() => setIsRegisterMode(true)}
                className="text-indigo-400 font-bold hover:underline cursor-pointer"
                id="link-switch-to-register"
              >
                Daftarkan Akun Baru
              </button>
            </p>
          )}
        </div>

        <div className="relative flex py-3 items-center my-3" id="divider">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-3 text-slate-500 text-[10px] sm:text-xs tracking-wider uppercase">Sistem E-Pinjam</span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        <p className="text-center text-[10px] sm:text-[11px] text-slate-500" id="footer-note">
          Portal terintegrasi langsung dengan database Sarpras UMSU.
        </p>

      </motion.div>
    </div>
  );
}
