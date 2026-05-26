'use client';

import { useState } from 'react';
import { useEPinjam } from '@/lib/state-context';
import { getStatusStyles } from '@/lib/utils';
import { 
  History, 
  Box, 
  CheckCircle2, 
  AlertOctagon, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Megaphone,
  Clock,
  ArrowRight,
  PlusCircle,
  XCircle,
  ShieldAlert,
  Send,
  Wrench,
  ChevronDown
} from 'lucide-react';
import { motion } from 'motion/react';

interface StudentDashboardProps {
  onOpenDetail: (loanId: string) => void;
}

export default function StudentDashboard({ onOpenDetail }: StudentDashboardProps) {
  const { 
    currentUser, 
    loans, 
    announcements, 
    setCurrentTab,
    addToast,
    cancelBooking,
    requestExtension,
    reportDamage,
    completeReturnWithCondition
  } = useEPinjam();

  // Selected time slot state for "Jadwal Tersedia Hari Ini"
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // Interaction Dialog States
  const [cancelingLoanId, setCancelingLoanId] = useState<string | null>(null);
  
  const [extendingLoanId, setExtendingLoanId] = useState<string | null>(null);
  const [extendHours, setExtendHours] = useState('2');
  const [extendReason, setExtendReason] = useState('');

  const [damagingLoanId, setDamagingLoanId] = useState<string | null>(null);
  const [returningLoanId, setReturningLoanId] = useState<string | null>(null);
  const [damageNotes, setDamageNotes] = useState('');

  if (!currentUser) return null;

  // Filter student's loans
  const studentLoans = loans.filter(l => l.nim === currentUser.nimOrId);

  // Stats calculation
  const totalPinjaman = studentLoans.length;
  const sedangDipinjam = studentLoans.filter(l => l.status === 'Dipinjam').length;
  const selesaiCount = studentLoans.filter(l => l.status === 'Selesai').length;
  const hasPenalti = studentLoans.some(l => l.status === 'Terlambat' || l.penaltiActive);

  // Daily Slots definitions for Sat, 23 May 2026 (today)
  const timeSlots = [
    { label: '07:00 - 09:00', state: 'available' },
    { label: '09:00 - 11:00', state: 'booked' }, // Booked by Budi L-101
    { label: '11:00 - 13:00', state: 'available' },
    { label: '13:00 - 15:00', state: 'booked' }, // Booked by Budi L-102
    { label: '15:00 - 17:00', state: 'available' },
  ];

  const handleBookingRedirect = () => {
    if (!selectedSlot) {
      addToast('Silakan pilih salah satu slot waktu yang tersedia terlebih dahulu.', 'warning');
      return;
    }
    // Save selected slot in sessionStorage to pre-populate Step 2
    sessionStorage.setItem('pre_selected_slot', selectedSlot);
    sessionStorage.setItem('pre_selected_date', '2026-05-23');
    setCurrentTab('Buat Peminjaman');
    addToast(`Slot ${selectedSlot} dipilih. Silakan selesaikan formulir booking!`, 'success');
  };

  const executeCancel = () => {
    if (cancelingLoanId) {
      cancelBooking(cancelingLoanId);
      setCancelingLoanId(null);
    }
  };

  const executeExtend = (e: React.FormEvent) => {
    e.preventDefault();
    if (extendingLoanId) {
      if (!extendReason.trim()) {
        addToast('Alasan perpanjangan wajib diisi.', 'warning');
        return;
      }
      requestExtension(extendingLoanId, extendHours, extendReason);
      setExtendingLoanId(null);
      setExtendReason('');
    }
  };

  const executeReportDamage = (e: React.FormEvent) => {
    e.preventDefault();
    if (damagingLoanId) {
      if (!damageNotes.trim()) {
        addToast('Keterangan kondisi kerusakan wajib ditulis.', 'warning');
        return;
      }
      reportDamage(damagingLoanId, damageNotes);
      setDamagingLoanId(null);
      setDamageNotes('');
    }
  };

  const handleStudentQuickReturn = async (loanId: string) => {
    try {
      await completeReturnWithCondition(loanId, 'Baik', 'Diserahkan oleh mahasiswa (Selesai)');
      addToast('Pengembalian InFocus berhasil diselesaikan', 'success');
      if (typeof onOpenDetail === 'function') {
        onOpenDetail(loanId);
      }
    } catch (e) {
      console.error(e);
      addToast('Gagal menyelesaikan pengembalian', 'error');
    }
  };

  return (
    <div className="space-y-6" id="student-dashboard-root">
      
      {/* Welcome banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4" id="welcome-header">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Halo, {currentUser.name}! 👋
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Gunakan portal E-Pinjam untuk melakukan reservasi unit proyektor (InFocus) secara cepat dan transparan.
          </p>
        </div>
        <button
          onClick={() => setCurrentTab('Buat Peminjaman')}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          id="btn-fast-loan"
        >
          <span>Buat Peminjaman Baru</span>
          <PlusCircle className="w-4 h-4" />
        </button>
      </div>

      {/* Row 1 - 4 summary stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="student-stat-cards">
        {/* Card 1: Total Pinjaman */}
        <div className="glass-card p-4 rounded-xl flex items-center justify-between border-l-4 border-l-indigo-500 overflow-hidden relative">
          <div className="absolute right-[-10px] top-[-10px] text-indigo-500/10 pointer-events-none">
            <History className="w-24 h-24 stroke-[1.5]" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Pinjaman</p>
            <h3 className="text-2xl font-extrabold text-white mt-1">{totalPinjaman}</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Seluruh Riwayat</p>
          </div>
          <div className="p-2 w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400">
            <History className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Sedang Dipinjam */}
        <div className="glass-card p-4 rounded-xl flex items-center justify-between border-l-4 border-l-orange-500 overflow-hidden relative">
          <div className="absolute right-[-10px] top-[-10px] text-orange-500/10 pointer-events-none">
            <Box className="w-24 h-24 stroke-[1.5]" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sedang Aktif</p>
            <h3 className="text-2xl font-extrabold text-orange-400 mt-1">{sedangDipinjam}</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Wajib Dikembalikan</p>
          </div>
          <div className="p-2 w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20 text-orange-400">
            <Box className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Selesai */}
        <div className="glass-card p-4 rounded-xl flex items-center justify-between border-l-4 border-l-emerald-500 overflow-hidden relative">
          <div className="absolute right-[-10px] top-[-10px] text-emerald-500/10 pointer-events-none">
            <CheckCircle2 className="w-24 h-24 stroke-[1.5]" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Selesai Pinjam</p>
            <h3 className="text-2xl font-extrabold text-emerald-400 mt-1">{selesaiCount}</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Unit Telah Kembali</p>
          </div>
          <div className="p-2 w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Status Penalti */}
        <div className={`glass-card p-4 rounded-xl flex items-center justify-between border-l-4 overflow-hidden relative ${
          hasPenalti ? 'border-l-rose-500' : 'border-l-teal-500'
        }`}>
          <div className={`absolute right-[-10px] top-[-10px] pointer-events-none ${
            hasPenalti ? 'text-rose-500/10' : 'text-teal-500/10'
          }`}>
            <AlertOctagon className="w-24 h-24 stroke-[1.5]" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status Denda</p>
            <h3 className={`text-sm font-extrabold mt-1.5 ${hasPenalti ? 'text-rose-400' : 'text-teal-400'}`}>
              {hasPenalti ? 'Ada Tunggakan Penalti' : 'Aman ✓ Tidak Ada'}
            </h3>
            <p className="text-[10px] text-slate-500 mt-1">
              {hasPenalti ? 'Akun Ditangguhkan!' : 'Akun Aktif & Bebas'}
            </p>
          </div>
          <div className={`p-2 w-9 h-9 rounded-lg flex items-center justify-center border ${
            hasPenalti 
              ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
              : 'bg-teal-500/10 border-teal-500/20 text-teal-400'
          }`}>
            <AlertOctagon className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Row 2 - Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6" id="dashboard-main-columns">
        {/* Left Column (60% equivalent -> 3/5 cols) */}
        <div className="lg:col-span-3 space-y-4" id="active-rentals-container">
          <div className="flex justify-between items-center bg-slate-900/20 p-2 rounded-xl border border-white/5">
            <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5 px-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              Peminjaman Aktif Saya
            </h2>
            <button
              onClick={() => setCurrentTab('Riwayat Pinjaman')}
              className="px-2.5 py-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 cursor-pointer hover:bg-indigo-500/10 rounded transition-colors"
            >
              Lihat Semua
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3" id="active-loans-list">
            {studentLoans.filter(l => l.status !== 'Selesai' && l.status !== 'Ditolak').length === 0 ? (
              <div className="glass-card p-8 rounded-xl text-center border-dashed border-white/10" id="empty-active-state">
                <Box className="w-10 h-10 mx-auto text-slate-500 mb-2 stroke-[1.5]" />
                <h4 className="text-xs font-semibold text-slate-300">Belum Ada Peminjaman Aktif</h4>
                <p className="text-[10px] text-slate-500 mt-1 max-w-xs mx-auto">
                  Anda tidak memiliki transaksi peminjaman yang sedang diproses atau digunakan saat ini.
                </p>
                <button
                  onClick={() => setCurrentTab('Buat Peminjaman')}
                  className="mt-3.5 px-3.5 py-1.5 bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-[10px] font-semibold hover:bg-indigo-600/50 cursor-pointer transition-all"
                >
                  Buat Pinjaman Pertama
                </button>
              </div>
            ) : (
              studentLoans
                .filter(l => l.status !== 'Selesai' && l.status !== 'Ditolak')
                .map((loan) => {
                  const statusStyles = getStatusStyles(loan.status);
                  // Left border color determination based on status styles
                  let lBorderColor = 'border-l-amber-500';
                  if (loan.status === 'Disetujui') lBorderColor = 'border-l-blue-500';
                  if (loan.status === 'Dipinjam') lBorderColor = 'border-l-orange-500';
                  if (loan.status === 'Terlambat') lBorderColor = 'border-l-red-600';

                  return (
                    <div 
                      key={loan.id}
                      className={`glass-card p-4 rounded-xl border-l-4 ${lBorderColor} flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 relative`}
                      id={`active-loan-${loan.id}`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white tracking-tight">{loan.itemName}</h4>
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-950/60 px-1.5 py-0.5 rounded border border-white/5">
                            {loan.itemCode}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-[10px] text-slate-400">
                          <p className="flex items-center gap-1">
                            <span className="text-slate-500 font-semibold">Tgl:</span> {loan.date}
                          </p>
                          <p className="flex items-center gap-1">
                            <span className="text-slate-500 font-semibold">Jam:</span> {loan.timeSlot}
                          </p>
                          <p className="col-span-2 flex items-center gap-1 truncate max-w-xs mt-0.5">
                            <span className="text-slate-500 font-semibold">Gedung / Aula:</span> {loan.location}
                          </p>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-end gap-2 w-full sm:w-auto mt-2 sm:mt-0 justify-between sm:justify-start border-t border-white/5 sm:border-0 pt-2 sm:pt-0">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-semibold tracking-wide flex items-center gap-1 ${statusStyles.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusStyles.dot}`} />
                          {statusStyles.label}
                        </span>
                        
                        <div className="flex sm:flex-col gap-1.5 w-full sm:w-auto items-end">
                          <button
                            onClick={() => onOpenDetail(loan.id)}
                            className="px-3 py-1 text-[10px] font-bold text-slate-300 hover:text-white border border-slate-700/80 hover:border-slate-500/80 rounded-lg hover:bg-white/5 transition-all cursor-pointer w-full sm:w-auto text-center"
                            id={`btn-detail-loan-${loan.id}`}
                          >
                            Lihat Detail
                          </button>

                          {/* Cancellation for Menunggu */}
                          {loan.status === 'Menunggu' && (
                            <button
                              onClick={() => setCancelingLoanId(loan.id)}
                              className="px-3 py-1 text-[10px] font-bold text-rose-400 hover:text-white border border-rose-950 hover:bg-rose-950/20 rounded-lg transition-all cursor-pointer w-full sm:w-auto text-center"
                              id={`btn-cancel-loan-${loan.id}`}
                            >
                              Batalkan
                            </button>
                          )}

                          {/* Extension Statuses */}
                          {loan.status === 'Dipinjam' && loan.extendRequest === 'pending' && (
                            <span className="text-[8.5px] font-mono font-bold text-amber-400 bg-amber-950/20 px-2 py-0.5 rounded border border-amber-500/20 text-center w-full animate-pulse">
                              Ext. Menunggu
                            </span>
                          )}
                          {loan.status === 'Dipinjam' && loan.extendRequest === 'approved' && (
                            <span className="text-[8.5px] font-mono font-bold text-emerald-400 bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-500/20 text-center w-full">
                              Ext. Disetujui ✓
                            </span>
                          )}
                          {loan.status === 'Dipinjam' && loan.extendRequest === 'rejected' && (
                            <span className="text-[8.5px] font-mono font-bold text-rose-400 bg-rose-950/20 px-2 py-0.5 rounded border border-rose-500/20 text-center w-full">
                              Ext. Ditolak ✗
                            </span>
                          )}

                          {/* Actions for Dipinjam */}
                          {loan.status === 'Dipinjam' && (!loan.extendRequest || loan.extendRequest === 'none' || loan.extendRequest === 'rejected') && (
                            <button
                              onClick={() => {
                                setExtendingLoanId(loan.id);
                                setExtendHours('2');
                              }}
                              className="px-3 py-1 text-[10px] font-bold text-indigo-400 hover:text-white border border-indigo-950 hover:bg-indigo-950/20 rounded-lg transition-all cursor-pointer w-full sm:w-auto text-center"
                              id={`btn-extend-loan-${loan.id}`}
                            >
                              Perpanjang
                            </button>
                          )}

                          {loan.status === 'Dipinjam' && !loan.damageReported && (
                            <button
                              onClick={() => setDamagingLoanId(loan.id)}
                              className="px-3 py-1 text-[10px] font-bold text-amber-500 hover:text-amber-400 border border-amber-950 hover:bg-amber-950/10 rounded-lg transition-all cursor-pointer w-full sm:w-auto text-center"
                              id={`item-report-damage-${loan.id}`}
                            >
                              Lapor Rusak
                            </button>
                          )}
                          {loan.status === 'Dipinjam' && (
                            <button
                              onClick={() => handleStudentQuickReturn(loan.id)}
                              className="px-3 py-1 text-[10px] font-bold text-indigo-400 hover:text-white border border-indigo-950 hover:bg-indigo-950/20 rounded-lg transition-all cursor-pointer w-full sm:w-auto text-center"
                              id={`btn-complete-return-${loan.id}`}
                            >
                              Selesai
                            </button>
                          )}

                          {loan.damageReported && (
                            <span className="text-[8.5px] font-mono font-bold text-rose-400 bg-rose-950/20 px-2 py-0.5 rounded border border-rose-500/20 text-center truncate max-w-[120px]">
                              Rusak Dilaporkan
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>

        {/* Right Column (40% equivalent -> 2/5 cols) */}
        <div className="lg:col-span-2 space-y-4" id="timetable-slots-container">
          <div className="bg-slate-900/20 p-2 rounded-xl border border-white/5">
            <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5 px-2">
              <span className="w-2 h-2 rounded-full bg-teal-500" />
              Jadwal Tersedia Hari Ini
            </h2>
          </div>

          <div className="glass-card p-4 rounded-xl space-y-4" id="quick-booking-card">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-[10px] text-slate-400 font-medium">Sabtu, 23 Mei 2026 (Hari ini)</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">TERSEDIA</span>
            </div>

            {/* Timetable slots listing */}
            <div className="grid grid-cols-1 gap-2" id="slot-grid">
              {timeSlots.map((slot) => {
                const isBooked = slot.state === 'booked';
                const isSelected = selectedSlot === slot.label;

                return (
                  <button
                    key={slot.label}
                    disabled={isBooked}
                    onClick={() => setSelectedSlot(isSelected ? null : slot.label)}
                    className={`w-full py-2.5 px-3 rounded-lg text-xs font-semibold border transition-all text-left flex items-center justify-between cursor-pointer ${
                      isBooked 
                        ? 'bg-slate-950/60 border-slate-900 text-slate-600 line-through cursor-not-allowed' 
                        : isSelected
                        ? 'bg-indigo-600 border-indigo-500 text-white font-bold shadow shadow-indigo-600/30'
                        : 'border-white/10 text-slate-300 bg-slate-950/20 hover:bg-slate-950/50 hover:border-slate-800'
                    }`}
                    id={`btn-time-slot-${slot.label.split(' ')[0]}`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 opacity-60" />
                      {slot.label}
                    </span>
                    
                    <span>
                      {isBooked ? (
                        <span className="text-[9px] bg-slate-900 text-slate-500 py-0.5 px-1.5 rounded border border-white/5 font-semibold">Penuh</span>
                      ) : isSelected ? (
                        <span className="text-[9px] bg-black/20 text-white py-0.5 px-2 rounded-full font-bold">Terpilih</span>
                      ) : (
                        <span className="text-[9px] text-emerald-400 py-0.5 px-1.5 rounded border border-emerald-500/10 bg-emerald-500/5 font-mono">Tersedia</span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleBookingRedirect}
              disabled={!selectedSlot}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 disabled:shadow-none text-white rounded-lg text-xs font-semibold shadow-md shadow-indigo-500/10 cursor-pointer transition-all flex items-center justify-center gap-1.5"
              id="btn-confirm-quick-time"
            >
              <span>Booking Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Row 3 - "Pengumuman Biro" (Horizontal scroll list) */}
      <div className="space-y-4" id="announcements-container">
        <div className="bg-slate-900/20 p-2 rounded-xl border border-white/5">
          <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5 px-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Pengumuman Biro Kampus
          </h2>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin snap-x snap-mandatory" id="announcement-row">
          {announcements.map((ann) => {
            let borderStyle = 'border-t-indigo-500';
            let iconColor = 'text-indigo-400';
            
            if (ann.type === 'warning') {
              borderStyle = 'border-t-amber-500';
              iconColor = 'text-amber-400';
            } else if (ann.type === 'success') {
              borderStyle = 'border-t-emerald-500';
              iconColor = 'text-emerald-400';
            }

            return (
              <div
                key={ann.id}
                className={`glass-card p-4 rounded-xl border-t-4 ${borderStyle} snap-start min-w-[280px] md:min-w-[340px] max-w-sm flex-shrink-0 flex gap-3 relative`}
                id={`announcement-card-${ann.id}`}
              >
                <div className={`p-2 h-9 w-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center ${iconColor} flex-shrink-0`}>
                  <Megaphone className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="text-xs font-bold text-slate-100 truncate">{ann.title}</h4>
                    <span className="text-[9px] font-semibold text-slate-500">{ann.date}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {ann.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 1. MODAL CONFIRM CANCEL BOOKING (STUDENT) */}
      {cancelingLoanId && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in" id="student-cancel-dialog">
          <div className="glass-card p-6 rounded-2xl border border-white/10 max-w-sm w-full text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Konfirmasi Pembatalan</h4>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                Apakah Anda yakin ingin membatalkan pengajuan booking proyektor ini? Tindakan ini bersifat destruktif dan slot waktu akan ditarik kembali secara real-time.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCancelingLoanId(null)}
                className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 border border-white/5 text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={executeCancel}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow shadow-rose-600/10 transition-all cursor-pointer"
              >
                Ya, Batalkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. MODAL REQUEST EXTENSION */}
      {extendingLoanId && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in" id="student-extend-dialog">
          <form onSubmit={executeExtend} className="glass-card p-6 rounded-2xl border border-white/10 max-w-sm w-full space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h4 className="text-white font-bold text-sm flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-400" />
                Ajukan Perpanjangan Pinjam
              </h4>
              <button
                type="button"
                onClick={() => setExtendingLoanId(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-[11px] text-slate-400 leading-normal">
              Pengajuan perpanjangan memerlukan persetujuan dari BAAK Kampus pada dasbor admin.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-300 text-[10px] font-bold uppercase mb-1">Durasi Tambahan</label>
                <select
                  value={extendHours}
                  onChange={(e) => setExtendHours(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 text-white rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="1">1 Jam Pelajaran</option>
                  <option value="2">2 Jam Pelajaran</option>
                  <option value="4">Setengah Hari (4 Jam)</option>
                  <option value="8">Satu Hari Penuh (8 Jam)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 text-[10px] font-bold uppercase mb-1">Alasan Mendesak</label>
                <textarea
                  value={extendReason}
                  onChange={(e) => setExtendReason(e.target.value)}
                  placeholder="Contoh: Dosen pengampu memperpanjang sesi pembelajaran materi akhir semester..."
                  rows={3}
                  className="w-full bg-slate-950 border border-white/10 text-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setExtendingLoanId(null)}
                className="flex-1 py-2 bg-slate-900 border border-white/5 text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <span>Ajukan</span>
                <Send className="w-3 h-3" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. MODAL REPORT DAMAGE */}
      {damagingLoanId && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in" id="student-damage-dialog">
          <form onSubmit={executeReportDamage} className="glass-card p-6 rounded-2xl border border-white/10 max-w-sm w-full space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h4 className="text-white font-bold text-sm flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-amber-500" />
                Laporkan Kerusakan Proyektor
              </h4>
              <button
                type="button"
                onClick={() => setDamagingLoanId(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-[11px] text-slate-400 leading-normal">
              Silakan tuliskan dengan jujur kendala kondisi proyektor atau aksesoris (kabel, remote) saat diterima / digunakan untuk dicatat Sarpras demi ketertiban bersama.
            </p>

            <div>
              <label className="block text-slate-300 text-[10px] font-bold uppercase mb-1">Keterangan Kendala / Kerusakan</label>
              <textarea
                value={damageNotes}
                onChange={(e) => setDamageNotes(e.target.value)}
                placeholder="Contoh: Lampu redup banget / Kabel HDMI agak longgar harus ditekuk / Kaki tumpuan proyektor patah sebelah..."
                rows={4}
                className="w-full bg-slate-950 border border-white/10 text-white rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDamagingLoanId(null)}
                className="flex-1 py-2 bg-slate-900 border border-white/5 text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <span>Kirim Laporan</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
