'use client';

import { useState } from 'react';
import { useEPinjam, Loan, Barang } from '@/lib/state-context';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  Lock, 
  ShieldCheck, 
  AlertTriangle,
  Info,
  Users,
  BarChart3,
  Settings,
  X,
  ShieldAlert,
  Activity,
  Shield,
  AlertCircle,
  FileText,
  Download,
  Trash
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell
} from 'recharts';

export function StudentProfileView() {
  const { currentUser, loans } = useEPinjam();
  const [phone, setPhone] = useState('+62 812-4455-8899');
  const [email, setEmail] = useState('budi.santoso@mhs.kampus.ac.id');
  const [passData, setPassData] = useState({ old: '', new: '' });

  if (!currentUser) return null;

  const totalLogsCount = loans.filter((l: Loan) => l.nim === currentUser.nimOrId).length;

  return (
    <div className="max-w-2xl mx-auto space-y-6" id="profile-view-root">
      <div id="profile-header">
        <h1 className="text-2xl font-bold text-white tracking-tight">Profil Saya</h1>
        <p className="text-slate-400 text-sm mt-0.5">Kelola informasi kontak kemahasiswaan dan kredensial keamanan akun Anda.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="profile-grid">
        {/* Left Card: Avatar Info */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 text-center flex flex-col items-center justify-center space-y-4 md:col-span-1" id="profile-avatar-card">
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-indigo-500/20 shadow-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={currentUser.avatarUrl} 
              alt={currentUser.name} 
              className="object-cover w-full h-full"
            />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base">{currentUser.name}</h3>
            <p className="text-xs font-mono text-indigo-400 mt-1">{currentUser.nimOrId}</p>
          </div>
          <span className="text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 py-1 px-3 rounded-full font-bold">
            MAHASISWA AKTIF
          </span>
        </div>

        {/* Right Card: Contact Details Form */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-5 md:col-span-2" id="profile-details-form">
          <h3 className="text-sm font-bold text-white border-b border-white/5 pb-2">Informasi Kemahasiswaan</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">E-Mail Kampus</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500"><Mail className="w-4 h-4" /></span>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full glass-input pl-9 pr-3 py-2 text-xs rounded-xl"
                  id="profile-email-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">No. Handphone (WhatsApp)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500"><Phone className="w-4 h-4" /></span>
                <input 
                  type="text" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full glass-input pl-9 pr-3 py-2 text-xs rounded-xl"
                  id="profile-phone-input"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-500 font-semibold mb-1">Fakultas / Program Studi</label>
              <input 
                type="text" 
                disabled 
                value="Fakultas Teknik / Strata-1 Teknik Informatika" 
                className="w-full glass-input pr-3 py-2 text-xs rounded-xl bg-slate-950/40 text-slate-400 border-white/5 cursor-not-allowed"
                id="profile-study-input"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-white/5 flex justify-end">
            <button 
              onClick={() => alert('Profil berhasil diperbarui secara lokal!')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow cursor-pointer transition-all"
              id="btn-save-profile"
            >
              Simpan Profil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function StudentAvailableCalendarView() {
  const { loans, barangList, setCurrentTab, addToast } = useEPinjam();
  const [selectedDate, setSelectedDate] = useState('2026-05-25'); // default Monday May 25th

  const calendarDays = [
    { num: 24, day: 'Min', label: '2026-05-24' },
    { num: 25, day: 'Sen', label: '2026-05-25' },
    { num: 26, day: 'Sel', label: '2026-05-26' },
    { num: 27, day: 'Rab', label: '2026-05-27' },
    { num: 28, day: 'Kam', label: '2026-05-28' },
    { num: 29, day: 'Jum', label: '2026-05-29' },
    { num: 30, day: 'Sab', label: '2026-05-30' },
  ];

  const allTimeSlots = [
    '07:00 - 09:00',
    '09:00 - 11:00',
    '11:00 - 13:00',
    '13:00 - 15:00',
    '15:00 - 17:00'
  ];

  const handleQuickBook = (barangId: string, slot: string) => {
    sessionStorage.setItem('pre_selected_slot', slot);
    sessionStorage.setItem('pre_selected_date', selectedDate);
    sessionStorage.setItem('pre_selected_item_id', barangId);
    setCurrentTab('Buat Peminjaman');
    addToast(`Memulai peminjaman instan pada tanggal ${selectedDate} slot ${slot}`, 'success');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6" id="timetable-available-view">
      <div id="timetable-hdr" className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Jadwal Penggunaan InFocus</h1>
          <p className="text-slate-400 text-sm mt-0.5">Lihat timeline ketersediaan seluruh unit di biro kampus secara langsung.</p>
        </div>
        <div className="p-1 px-3 rounded-full bg-slate-900 border border-white/5 text-xs text-slate-400 font-mono">
          Mei 2026
        </div>
      </div>

      {/* Date selector bar */}
      <div className="glass-card p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-white/5 shadow-lg" id="date-selector-pane">
        <span className="text-xs font-bold text-slate-300">Pilih Tanggal Peninjauan:</span>
        <div className="grid grid-cols-7 gap-2 w-full sm:w-auto" id="calendar-days-strip">
          {calendarDays.map((day) => {
            const isSelected = selectedDate === day.label;
            return (
              <button
                key={day.label}
                type="button"
                onClick={() => setSelectedDate(day.label)}
                className={`py-1.5 px-3 rounded-lg text-center border transition-all cursor-pointer flex flex-col items-center justify-center ${
                  isSelected
                    ? 'bg-indigo-600 border-indigo-500 text-white font-bold shadow shadow-indigo-600/30'
                    : 'bg-slate-950/40 border-white/5 text-slate-400 hover:border-slate-800 hover:bg-slate-950/60'
                }`}
                id={`calendar-btn-nav-${day.num}`}
              >
                <span className="text-[8px] uppercase tracking-wider font-semibold text-slate-500">{day.day}</span>
                <span className="text-xs mt-0.5 font-extrabold">{day.num}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Schedule Board for each proyektor */}
      <div className="space-y-6" id="projector-schedule-gantt">
        {barangList.filter((b: Barang) => b.active).map((barang: Barang) => {
          return (
            <div key={barang.id} className="glass-card rounded-2xl border border-white/5 overflow-hidden shadow-xl" id={`gantt-row-${barang.id}`}>
              {/* Header inside row with status specifications */}
              <div className="p-4 bg-slate-900/40 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400 font-semibold text-xs">
                    {barang.code}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{barang.name}</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Kondisi fisik: <span className="text-teal-400 font-semibold">{barang.kondisi}</span> · Pernah dipinjam {barang.totalBorrow} kali</p>
                  </div>
                </div>
                <span className={`text-[10px] uppercase font-bold py-1 px-3 rounded-full border ${
                  barang.status === 'Tersedia' 
                    ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' 
                    : barang.status === 'Maintenance'
                    ? 'bg-amber-500/10 border-amber-500/25 text-amber-400'
                    : 'bg-orange-500/10 border-orange-500/25 text-orange-400'
                }`}>
                  {barang.status}
                </span>
              </div>

              {/* Grid of the 5 timeslots */}
              <div className="p-4 bg-slate-950/10 divide-y divide-white/5" id={`slots-container-${barang.id}`}>
                {allTimeSlots.map((slot) => {
                  // Find if there's any active loan
                  const activeLoan = loans.find((l: Loan) => 
                    l.itemId === barang.id && 
                    l.date === selectedDate && 
                    l.timeSlot === slot &&
                    (l.status === 'Disetujui' || l.status === 'Dipinjam' || l.status === 'Menunggu')
                  );

                  let blockColor = 'bg-slate-900/10';
                  let statusLabel = '';
                  let details = '';

                  if (activeLoan) {
                    if (activeLoan.status === 'Menunggu') {
                      blockColor = 'bg-amber-950/10 border-l-4 border-l-amber-500';
                      statusLabel = 'Menunggu Review';
                      details = `Direservasi oleh ${activeLoan.studentName} untuk "${activeLoan.eventName}"`;
                    } else if (activeLoan.status === 'Disetujui') {
                      blockColor = 'bg-blue-950/10 border-l-4 border-l-blue-500';
                      statusLabel = 'Dipesan';
                      details = `Dipakai ${activeLoan.studentName} (@${activeLoan.location})`;
                    } else if (activeLoan.status === 'Dipinjam') {
                      blockColor = 'bg-orange-950/20 border-l-4 border-l-orange-500';
                      statusLabel = 'Dipakai Aktif';
                      details = `Sedang digunakan ${activeLoan.studentName} (Kampus - ${activeLoan.location})`;
                    }
                  } else if (barang.status === 'Maintenance') {
                    blockColor = 'bg-slate-950/80 cursor-not-allowed';
                    statusLabel = 'Maintenance';
                    details = 'Unit proyektor sedang dalam pemeliharaan berkala';
                  }

                  return (
                    <div key={slot} className={`p-3.5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 text-xs transition-colors ${blockColor}`} id={`slot-row-${barang.id}-${slot.split(' ')[0]}`}>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <span className="font-mono font-bold text-slate-300">{slot}</span>
                      </div>

                      {activeLoan ? (
                        <div className="flex-1 min-w-0 pr-4">
                          <p className="text-slate-200 font-semibold truncate leading-normal">{details}</p>
                          <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> {statusLabel}
                          </span>
                        </div>
                      ) : barang.status === 'Maintenance' ? (
                        <p className="text-slate-500 italic flex-1 pr-4">{details}</p>
                      ) : (
                        <p className="text-emerald-500/80 font-medium flex-1 pr-4 flex items-center gap-1.5">
                          <span>✓ Slot ini kosong dan siap digunakan</span>
                        </p>
                      )}

                      {/* CTAs */}
                      <div className="self-end md:self-auto flex-shrink-0">
                        {activeLoan ? (
                          <span className="px-2.5 py-0.5 rounded text-[9px] font-extrabold uppercase font-mono tracking-wider bg-slate-900 border border-white/5 text-slate-500">
                            Booked
                          </span>
                        ) : barang.status === 'Maintenance' ? (
                          <span className="px-2.5 py-0.5 rounded text-[9px] font-extrabold uppercase font-mono tracking-wider bg-slate-900 border border-white/5 text-slate-600">
                            Locked
                          </span>
                        ) : (
                          <button
                            onClick={() => handleQuickBook(barang.id, slot)}
                            className="px-3 py-1 bg-indigo-600/10 hover:bg-indigo-600 border border-indigo-500/10 hover:border-indigo-500 text-indigo-400 hover:text-white rounded-lg text-[10px] font-bold transition-all shrink-0 cursor-pointer"
                          >
                            Pilih Sesi ➜
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AdminUsersView() {
  const { loans, addToast, registeredUsers, toggleUserStatus, clearUserPenalty, deleteUser } = useEPinjam();
  
  const users = (registeredUsers || [])
    .filter((u) => u.role === 'mahasiswa')
    .map((u) => ({
      name: u.name,
      ID: u.nimOrId,
      dept: u.dept || 'Informatika',
      active: u.active || 'Aktif',
      borrowsCount: u.borrowsCount ?? loans.filter(l => l.nim === u.nimOrId).length,
      status: u.status || 'Clear',
      email: u.email || `${u.nimOrId}@mhs.kampus.ac.id`,
      phone: u.phone || '+62 812-4455-8899'
    }));

  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const [auditLogs, setAuditLogs] = useState<Record<string, Array<{ action: string; timestamp: string; actor: string }>>>({
    '22019904': [
      { action: 'Login berhasil (Sistem SSO)', timestamp: '2026-05-23 09:12:05', actor: 'Budi Santoso' },
      { action: 'Reservasi Proyektor Unit PJ-03 Diajukan', timestamp: '2026-05-22 14:10:00', actor: 'Budi Santoso' },
      { action: 'Pemberian Akses Multi-Faktor (MFA)', timestamp: '2026-05-20 11:00:22', actor: 'Sistem Security' },
      { action: 'Reservasi Proyektor Unit PJ-01 Selesai & Dikembalikan', timestamp: '2026-05-18 16:30:11', actor: 'Biro Sarpras (Admin)' },
      { action: 'Persetujuan Peminjaman Ruang Kelas', timestamp: '2026-05-18 08:15:00', actor: 'Biro Sarpras (Admin)' },
    ],
    '22019905': [
      { action: 'Login berhasil (Sistem SSO)', timestamp: '2026-05-23 10:45:12', actor: 'Siti Aminah' },
      { action: 'Reservasi Proyektor Unit PJ-05 Diajukan', timestamp: '2026-05-23 08:30:00', actor: 'Siti Aminah' },
      { action: 'Verifikasi Berkas Peminjaman Utama', timestamp: '2026-05-21 13:20:45', actor: 'Admin Sarpras' },
      { action: 'Pendaftaran Akun Baru E-Pinjam', timestamp: '2026-05-10 09:00:00', actor: 'Siti Aminah' },
    ],
    '22019906': [
      { action: 'Login berhasil (Sistem SSO)', timestamp: '2026-05-22 13:14:15', actor: 'Agus Hermawan' },
      { action: 'Pembatalan Booking Unit PJ-02', timestamp: '2026-05-22 11:02:11', actor: 'Agus Hermawan' },
      { action: 'Perubahan Sandi Akun Mandiri', timestamp: '2026-05-19 15:40:00', actor: 'Agus Hermawan' },
    ],
    '22019907': [
      { action: 'Penalti Otomatis Teraktifkan (Keterlambatan PJ-04)', timestamp: '2026-05-22 17:00:00', actor: 'System Cron' },
      { action: 'Peringatan Terlambat Pengembalian Dikirim', timestamp: '2026-05-22 10:00:00', actor: 'Admin Sarpras' },
      { action: 'Masa Peminjaman Melewati Batas (24 Jam)', timestamp: '2026-05-21 17:00:00', actor: 'System Cron' },
      { action: 'Serah Terima Unit PJ-04 Berhasil', timestamp: '2026-05-20 13:00:00', actor: 'Biro Sarpras (Admin)' },
    ],
  });

  const addAuditLog = (userId: string, action: string, actor: string = 'Super Admin') => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setAuditLogs(prev => ({
      ...prev,
      [userId]: [
        { action, timestamp: nowStr, actor },
        ...(prev[userId] || [])
      ]
    }));
  };

  const handleToggleStatus = async (userId: string) => {
    const updated = await toggleUserStatus(userId);
    if (updated) {
      addAuditLog(userId, `Akses akun diubah menjadi: ${updated.active}`, 'Super Admin');
      if (selectedUser?.ID === userId) {
        setSelectedUser({
          name: updated.name,
          ID: updated.nimOrId,
          dept: updated.dept || 'Informatika',
          active: updated.active || 'Aktif',
          borrowsCount: updated.borrowsCount ?? loans.filter(l => l.nim === updated.nimOrId).length,
          status: updated.status || 'Clear',
          email: updated.email || `${updated.nimOrId}@mhs.kampus.ac.id`,
          phone: updated.phone || '+62 812-4455-8899'
        });
      }
    }
  };

  const handleClearPenalty = async (userId: string) => {
    const updated = await clearUserPenalty(userId);
    if (updated) {
      addAuditLog(userId, 'Sanksi denda dibersihkan', 'Super Admin');
      if (selectedUser?.ID === userId) {
        setSelectedUser({
          name: updated.name,
          ID: updated.nimOrId,
          dept: updated.dept || 'Informatika',
          active: updated.active || 'Aktif',
          borrowsCount: updated.borrowsCount ?? loans.filter(l => l.nim === updated.nimOrId).length,
          status: 'Clear',
          email: updated.email || `${updated.nimOrId}@mhs.kampus.ac.id`,
          phone: updated.phone || '+62 812-4455-8899'
        });
      }
    }
  };

  const handleSendWarning = (user: any) => {
    addToast(`Peringatan resmi terkirim ke mahasiswa ${user.name} (${user.email}).`, 'warning');
    addAuditLog(user.ID, `Peringatan resmi dikirim: ${user.email}`, 'Super Admin');
  };

  const handleDeleteUser = async (userId: string) => {
    const isConfirmed = window.confirm(`Apakah Anda yakin ingin menghapus permanen akun mahasiswa dengan NIM ${userId}? Tindakan ini juga akan menghapusnya dari database.`);
    if (!isConfirmed) return;

    const success = await deleteUser(userId);
    if (success) {
      setSelectedUser(null);
    }
  };

  return (
    <div className="space-y-6" id="admin-users-view">
      <div id="users-hdr">
        <h1 className="text-2xl font-bold text-white tracking-tight">Kelola Pengguna</h1>
        <p className="text-slate-400 text-sm mt-0.5 font-medium">Daftar mahasiswa terdaftar beserta track record peminjaman and sanksi denda.</p>
      </div>

      <div className="glass-card rounded-2xl border border-white/5 overflow-hidden" id="users-table-panel">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs" id="table-users">
            <thead>
              <tr className="bg-slate-950/60 border-b border-white/5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <th className="p-4">Nama Mahasiswa</th>
                <th className="p-4">Identitas (NIM)</th>
                <th className="p-4">Program Studi</th>
                <th className="p-4">Total Pinjam</th>
                <th className="p-4">Denda Status</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((guy) => (
                <tr key={guy.ID} className="hover:bg-indigo-500/[0.04] transition-colors" id={`usr-row-${guy.ID}`}>
                  <td className="p-4 font-bold text-white">{guy.name}</td>
                  <td className="p-4 font-mono text-slate-300">{guy.ID}</td>
                  <td className="p-4 text-slate-400">{guy.dept}</td>
                  <td className="p-4 font-bold text-slate-300">{guy.borrowsCount} Kali</td>
                  <td className="p-4 space-x-2">
                    <span className={`px-2 py-1 rounded text-[9px] font-bold ${
                      guy.status === 'Clear' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {guy.status}
                    </span>
                    <span className={`px-2 py-1 rounded text-[9px] font-bold ${
                      guy.active === 'Aktif' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {guy.active}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => setSelectedUser(guy)}
                      className="px-3 py-1 bg-indigo-600/15 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded-lg border border-indigo-500/15 hover:border-indigo-500 transition-all text-[10px] font-bold cursor-pointer"
                      id={`btn-audit-${guy.ID}`}
                    >
                      Audit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Detail Modal Backdrop with smooth transitions */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto" id="audit-modal-backdrop">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="max-w-xl w-full bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col my-8"
              id="audit-modal-container"
            >
              {/* Header */}
              <div className="p-5 bg-slate-950/60 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">Security Audit Log</h2>
                    <p className="text-[10px] text-slate-500 mt-0.5">Peninjauan hak akses, sanksi, dan riwayat peminjaman.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white border border-transparent hover:border-white/5 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5 overflow-y-auto max-h-[60vh] text-xs">
                
                {/* Personal Section */}
                <div className="p-4 bg-slate-950/40 rounded-xl border border-white/5 space-y-3">
                  <div className="flex justify-between items-start border-b border-white/5 pb-2">
                    <div>
                      <h3 className="text-sm font-bold text-white mb-0.5">{selectedUser.name}</h3>
                      <p className="font-mono text-[10px] text-indigo-400">NIM: {selectedUser.ID}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                      selectedUser.active === 'Aktif' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {selectedUser.active === 'Aktif' ? 'Akses Aktif' : 'Dilarang (Banned)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <Settings className="w-3.5 h-3.5 text-slate-500" />
                      <span>Prodi: <strong className="text-white font-medium">{selectedUser.dept}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span className="truncate">Email: <strong className="text-white font-medium">{selectedUser.email}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>Telp: <strong className="text-white font-medium">{selectedUser.phone}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-slate-500" />
                      <span>Total Reservasi: <strong className="text-white font-bold">{selectedUser.borrowsCount}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Account Governance (Interaction) */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block text-xs">ADMIN GOVERNANCE</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(selectedUser.ID)}
                      className={`py-2 px-3 rounded-lg border text-center font-bold text-[10px] transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        selectedUser.active === 'Aktif'
                          ? 'bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white border-red-500/15 hover:border-red-500'
                          : 'bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white border-emerald-500/15 hover:border-emerald-500'
                      }`}
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      {selectedUser.active === 'Aktif' ? 'Ban Pengguna' : 'Batal Ban'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleClearPenalty(selectedUser.ID)}
                      disabled={selectedUser.status === 'Clear'}
                      className={`py-2 px-3 rounded-lg border text-center font-bold text-[10px] transition-all flex items-center justify-center gap-1.5 ${
                        selectedUser.status === 'Clear'
                          ? 'bg-slate-950/20 border-white/5 text-slate-600 cursor-not-allowed'
                          : 'bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white border-indigo-500/15 hover:border-indigo-500 cursor-pointer'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Hapus Sanksi
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSendWarning(selectedUser)}
                      className="py-2 px-3 rounded-lg border bg-amber-600/10 hover:bg-amber-600 border-amber-500/15 hover:border-amber-500 text-amber-400 hover:text-white text-center font-bold text-[10px] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Kirim Alert
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteUser(selectedUser.ID)}
                      className="py-2 px-3 rounded-lg border bg-rose-600/10 hover:bg-rose-600 border-rose-500/15 hover:border-rose-500 text-rose-400 hover:text-white text-center font-bold text-[10px] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Trash className="w-3.5 h-3.5" />
                      Hapus Akun
                    </button>

                  </div>
                </div>

                {/* Audit table with Action, Timestamp, and Actor columns */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">HISTORICAL AUDIT LOGS</span>
                  <div className="glass-card rounded-xl border border-white/5 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[11px]" id="audit-log-table">
                        <thead>
                          <tr className="bg-slate-950/60 border-b border-white/5 text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                            <th className="p-3">Action</th>
                            <th className="p-3">Timestamp</th>
                            <th className="p-3">Actor</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {(auditLogs[selectedUser.ID] || []).map((log, index) => (
                            <tr key={index} className="hover:bg-indigo-500/[0.04] transition-colors">
                              <td className="p-3 font-medium text-slate-100">{log.action}</td>
                              <td className="p-3 text-slate-400 font-mono text-[10px]">{log.timestamp}</td>
                              <td className="p-3 text-indigo-300 font-semibold">{log.actor}</td>
                            </tr>
                          ))}
                          {(auditLogs[selectedUser.ID] || []).length === 0 && (
                            <tr>
                              <td colSpan={3} className="p-4 text-center text-slate-500">
                                Belum ada riwayat audit.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Associated Real-Time Loans */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">RIWAYAT AKTIVITAS PEMINJAMAN UNIT</span>
                  
                  {loans.filter(l => l.nim === selectedUser.ID).length === 0 ? (
                    <div className="p-6 bg-slate-950/20 text-center rounded-xl border border-white/5 text-slate-500">
                      <AlertCircle className="w-6 h-6 text-slate-600 mx-auto mb-1.5" />
                      <span>Tidak ada rekaman transaksi peminjaman aktif semester ini.</span>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {loans.filter(l => l.nim === selectedUser.ID).map((l) => (
                        <div key={l.id} className="p-3 bg-slate-950/60 rounded-xl border border-white/5 flex justify-between items-center gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-white/5 font-mono text-[9px] font-bold text-slate-400">{l.id}</span>
                              <h4 className="text-slate-200 font-bold text-[11px] truncate">{l.eventName}</h4>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1">{l.itemName} ({l.itemCode}) · {l.date} @{l.timeSlot}</p>
                          </div>
                          
                          <span className={`text-[9px] font-mono font-bold tracking-wider uppercase py-0.5 px-2 rounded-full border ${
                            l.status === 'Selesai' 
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                              : l.status === 'Disetujui' || l.status === 'Dipinjam'
                              ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                              : l.status === 'Menunggu'
                              ? 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                              : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                          }`}>
                            {l.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-950/40 border-t border-white/5 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-1.5 bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  Tutup Laporan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AdminReportsView() {
  const { barangList, loans, addToast } = useEPinjam();

  // 1. Compute projector borrowing counts data
  const utilizationData = barangList.map(item => ({
    name: item.code,
    full_name: item.name,
    borrow_count: item.totalBorrow
  })).sort((a, b) => b.borrow_count - a.borrow_count);

  // 2. Compute condition stats
  const conditionStats = barangList.reduce((acc: any, curr) => {
    acc[curr.kondisi] = (acc[curr.kondisi] || 0) + 1;
    return acc;
  }, { 'Baik': 0, 'Rusak Ringan': 0, 'Rusak Berat': 0 });

  const conditionData = [
    { name: 'Baik', value: conditionStats['Baik'] || 0, color: '#10b981' },
    { name: 'Rusak Ringan', value: conditionStats['Rusak Ringan'] || 0, color: '#f59e0b' },
    { name: 'Rusak Berat', value: conditionStats['Rusak Berat'] || 0, color: '#f43f5e' }
  ];

  // 3. Compute loan status pipeline
  const pipelineStats = loans.reduce((acc: any, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, { 'Menunggu': 0, 'Disetujui': 0, 'Dipinjam': 0, 'Selesai': 0, 'Ditolak': 0, 'Terlambat': 0 });

  const pipelineData = [
    { name: 'Menunggu', count: pipelineStats['Menunggu'] || 0, color: '#eab308' },
    { name: 'Disetujui', count: pipelineStats['Disetujui'] || 0, color: '#3b82f6' },
    { name: 'Dipinjam', count: pipelineStats['Dipinjam'] || 0, color: '#f97316' },
    { name: 'Selesai', count: pipelineStats['Selesai'] || 0, color: '#10b981' },
    { name: 'Ditolak', count: pipelineStats['Ditolak'] || 0, color: '#ef4444' },
    { name: 'Terlambat', count: pipelineStats['Terlambat'] || 0, color: '#ec4899' },
  ];

  const handleDownloadPDF = () => {
    addToast('Sedang memproses & mengunduh laporan PDF...', 'success');

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Dark slate and Indigo theme matching E-Pinjam UI
    const primaryColor = [79, 70, 229]; // #4f46e5 (Indigo)
    const secondaryColor = [15, 23, 42]; // #0f172a (Deep Slate)
    const grayColor = [100, 116, 139]; // Slate 500
    const lightBg = [248, 250, 252]; // Slate 50

    // Header header box
    doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.rect(0, 0, 210, 42, 'F');

    // Title text inside header
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('E-PINJAM - LAPORAN KINERJA & STATISTIK', 15, 16);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('BIRO SARANA & PRASARANA (SARPRAS) UNIVERSITAS', 15, 23);
    doc.setFontSize(8.5);
    doc.setTextColor(199, 210, 254); // indigo-200
    doc.text(`Waktu Cetak: ${new Date().toLocaleString('id-ID')} · Administrator Portal`, 15, 29);

    // Dynamic stats badges inside header
    doc.setFillColor(79, 70, 229, 0.4); // Semi-transparent Indigo
    doc.rect(15, 33, 180, 0.5, 'F'); // thin line separator

    // Body Title
    let y = 52;
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('1. RINGKASAN KPIS & STATISTIK PEMINJAMAN', 15, y);
    y += 8;

    // Draw 3 styled metadata grids / metric cards
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.3);

    // Card 1: Total Unit
    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    doc.rect(15, y, 56, 22, 'FD');
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text('TOTAL INVENTARIS INFOCUS', 19, y + 6);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`${barangList.length} Unit Perangkat`, 19, y + 15);

    // Card 2: Kondisi Layak
    const baikCount = barangList.filter(item => item.kondisi === 'Baik').length;
    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    doc.rect(77, y, 56, 22, 'FD');
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text('KONDISI LAYAK (BAIK)', 81, y + 6);
    doc.setTextColor(16, 185, 129); // emerald 500
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`${baikCount} Unit`, 81, y + 15);

    // Card 3: Reservasi Berjalan
    const activeBooking = loans.filter(l => l.status === 'Dipinjam' || l.status === 'Disetujui').length;
    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    doc.rect(139, y, 56, 22, 'FD');
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text('TOTAL PINJAM AKTIF', 143, y + 6);
    doc.setTextColor(245, 158, 11); // amber 500
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`${activeBooking} Transaksi`, 143, y + 15);

    y += 30;

    // 2. DISTRIBUTION SUMMARY
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text('RINGKASAN DISTRIBUSI & PIPELINE STATUS', 15, y);
    y += 4;
    doc.setDrawColor(241, 245, 249);
    doc.setLineWidth(0.5);
    doc.line(15, y, 195, y);
    y += 6;

    // Distribusi fisik
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text('Distribusi Fisik:', 15, y);
    doc.setFont('Helvetica', 'bold');
    doc.text(`Baik: ${baikCount} unit`, 42, y);
    doc.text(`Rusak Ringan: ${barangList.filter(i => i.kondisi === 'Rusak Ringan').length} unit`, 82, y);
    doc.text(`Rusak Berat: ${barangList.filter(i => i.kondisi === 'Rusak Berat').length} unit`, 135, y);

    y += 6;
    doc.setFont('Helvetica', 'normal');
    doc.text('Status Pipeline:', 15, y);
    doc.setFont('Helvetica', 'bold');
    doc.text(`Menunggu: ${pipelineStats['Menunggu'] || 0}`, 42, y);
    doc.text(`Disetujui: ${pipelineStats['Disetujui'] || 0}`, 75, y);
    doc.text(`Dipinjam: ${pipelineStats['Dipinjam'] || 0}`, 110, y);
    doc.text(`Selesai: ${pipelineStats['Selesai'] || 0}`, 145, y);

    y += 12;

    // 3. TABLE INVENTARIS
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('2. DETAIL UTILISASI INVENTARIS INFOCUS', 15, y);
    y += 5;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(15, y, 195, y);
    y += 4;

    // Table 2 Header
    doc.setFillColor(241, 245, 249);
    doc.rect(15, y, 180, 8, 'F');
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text('KODE', 18, y + 5.5);
    doc.text('NAMA PERANGKAT INVENTARIS', 42, y + 5.5);
    doc.text('KONDISI', 110, y + 5.5);
    doc.text('STATUS', 135, y + 5.5);
    doc.text('TOTAL PINJAM', 165, y + 5.5);
    y += 8;

    // Table 2 Rows
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);

    barangList.forEach((item, index) => {
      doc.setDrawColor(241, 245, 249);
      doc.setLineWidth(0.2);
      doc.line(15, y + 7, 195, y + 7);

      doc.text(item.code, 18, y + 4.5);
      doc.text(item.name, 42, y + 4.5);
      doc.text(item.kondisi, 110, y + 4.5);
      doc.text(item.status || 'Tersedia', 135, y + 4.5);
      doc.text(`${item.totalBorrow} kali`, 165, y + 4.5);
      y += 7.5;

      // Handle page break
      if (y > 270 && index < barangList.length - 1) {
        doc.addPage();
        y = 20;
      }
    });

    y += 8;

    // Check page space before starting Section 3
    if (y > 200) {
      doc.addPage();
      y = 20;
    }

    // 4. TABLE LOANS
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('3. RIWAYAT TRANSAKSI DAN STATUS SIRKULASI TERBARU', 15, y);
    y += 5;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(15, y, 195, y);
    y += 4;

    // Table 3 Header
    doc.setFillColor(241, 245, 249);
    doc.rect(15, y, 180, 8, 'F');
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text('ID', 18, y + 5.5);
    doc.text('NAMA PEMINJAM / NIM', 35, y + 5.5);
    doc.text('PERANGKAT', 85, y + 5.5);
    doc.text('TANGGAL & SLOT WAKTU', 130, y + 5.5);
    doc.text('STATUS', 172, y + 5.5);
    y += 8;

    // Table 3 Rows
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);

    const sortedLoans = [...loans].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 15);

    sortedLoans.forEach((l, index) => {
      doc.setDrawColor(241, 245, 249);
      doc.setLineWidth(0.2);
      doc.line(15, y + 7, 195, y + 7);

      doc.text(l.id, 18, y + 4.5);
      doc.text(`${l.studentName} (${l.nim})`, 35, y + 4.5);
      doc.text(`${l.itemCode} - ${l.itemName}`, 85, y + 4.5);
      doc.text(`${l.date} - ${l.timeSlot}`, 130, y + 4.5);
      doc.text(l.status, 172, y + 4.5);
      y += 7.5;

      // Handle page break
      if (y > 270 && index < sortedLoans.length - 1) {
        doc.addPage();
        y = 20;
      }
    });

    // Sign-off section on last page
    if (y > 230) {
      doc.addPage();
      y = 20;
    }

    y += 12;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(15, y, 195, y);
    y += 8;

    doc.setFont('Helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text('Dokumen laporan ini terinkubasi langsung oleh database internal E-Pinjam dan merupakan rekaman valid.', 15, y);
    
    y += 14;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text('Biro Sarana Prasarana & Logistik Kampus', 15, y);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text('Universitas Teknologi Nusantara', 15, y + 4.5);

    // Save and download PDF
    doc.save(`Laporan_Statistik_EPinjam_${new Date().toISOString().substring(0, 10)}.pdf`);
    addToast('Laporan PDF berhasil diunduh!', 'success');
  };

  return (
    <div className="space-y-6" id="admin-reports-view">
      <div id="reports-hdr" className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Laporan & Statistik</h1>
          <p className="text-slate-400 text-sm mt-0.5">Analisis keterpakaian perangkat LCD InFocus dan performansi pengembalian sarpras.</p>
        </div>
        <button
          onClick={handleDownloadPDF}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl border border-indigo-500/30 hover:border-indigo-400 flex items-center gap-2 text-xs font-bold transition-all shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-95 cursor-pointer"
          id="btn-download-reports-pdf"
        >
          <FileText className="w-4 h-4" />
          <span>Export PDF Laporan</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="stats-dashboard-sub">
        
        {/* Projector Usage Chart */}
        <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-4 shadow-lg" id="utilization-chart">
          <div>
            <h3 className="text-sm font-bold text-white">Utilisasi Total Per Unit InFocus</h3>
            <p className="text-[10px] text-slate-500 mt-1">Dihitung secara akumulatif sejak inisialisasi inventaris kampus.</p>
          </div>
          
          <div className="w-full h-56" id="utilization-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={utilizationData} layout="vertical" margin={{ top: 5, right: 15, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis type="number" stroke="rgba(255,255,255,0.4)" fontSize={9} fontFamily="monospace" tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.4)" fontSize={9} fontFamily="monospace" tickLine={false} width={50} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px', color: 'white' }} 
                  itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                />
                <Bar dataKey="borrow_count" fill="#4f46e5" radius={[0, 4, 4, 0]} maxBarSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Condition Distribution Chart */}
        <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-4 shadow-lg" id="condition-dist-chart">
          <div>
            <h3 className="text-sm font-bold text-white">Distribusi Kondisi Fisik Alat</h3>
            <p className="text-[10px] text-slate-500 mt-1">Rasio kelayakan perangkat proyektor yang siap dipinjamkan.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-center">
            <div className="sm:col-span-3 h-44" id="pie-chart-viewport">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={conditionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {conditionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px', color: 'white' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Legend layout to keep visual tidy */}
            <div className="sm:col-span-2 space-y-2 text-[11px] text-slate-400" id="condition-legend">
              {conditionData.map(c => {
                const count = c.value;
                return (
                  <div key={c.name} className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                      <span>{c.name}</span>
                    </span>
                    <span className="font-bold text-white font-mono">{count} unit</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Pipeline breakdown overview in bar chart form */}
        <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-4 md:col-span-2 shadow-lg" id="pipeline-breakdown-card">
          <div>
            <h3 className="text-sm font-bold text-white">Status Pipeline Pengajuan & Peminjaman</h3>
            <p className="text-[10px] text-slate-500 mt-1">Status rekapitulasi seluruh pengajuan mahasiswa saat ini.</p>
          </div>

          <div className="w-full h-44" id="pipeline-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={9} fontFamily="monospace" tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={9} fontFamily="monospace" tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px', color: 'white' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={30}>
                  {pipelineData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}

export function AdminSettingsView() {
  const [duration, setDuration] = useState('3');
  const [blockDays, setBlockDays] = useState('3');

  return (
    <div className="max-w-2xl mx-auto space-y-6" id="admin-settings-view">
      <div id="settings-hdr">
        <h1 className="text-2xl font-bold text-white tracking-tight">Pengaturan Biro</h1>
        <p className="text-slate-400 text-sm mt-0.5 font-medium">Konfigurasi limit, rentang sanksi denda, dan aturan reservasi otomatis.</p>
      </div>

      <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-5" id="settings-form">
        <h3 className="text-sm font-bold text-white border-b border-white/5 pb-2">Aturan Peminjaman Proyektor</h3>
        
        <div className="space-y-4 text-xs text-left">
          <div>
            <label className="block text-slate-400 font-semibold mb-1.5">Maksimal Durasi Peminjaman Per Sesi (Jam)</label>
            <input 
              type="text" 
              value={duration} 
              onChange={(e) => setDuration(e.target.value)}
              className="w-full glass-input px-3 py-2 text-xs rounded-xl"
              id="settings-duration-input"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1.5">Durasi Penalti Pemblokiran Akun jika Terlambat (Hari)</label>
            <input 
              type="text" 
              value={blockDays} 
              onChange={(e) => setBlockDays(e.target.value)}
              className="w-full glass-input px-3 py-2 text-xs rounded-xl"
              id="settings-blockdays-input"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-white/5 flex justify-end">
          <button 
            onClick={() => alert('Aturan biro berhasil diperbarui!')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow cursor-pointer transition-colors"
            id="btn-save-settings"
          >
            Simpan Konfigurasi
          </button>
        </div>
      </div>
    </div>
  );
}
