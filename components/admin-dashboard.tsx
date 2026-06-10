'use client';

import { useState } from 'react';
import { useEPinjam, Loan, Status, Barang } from '@/lib/state-context';
import { getStatusStyles } from '@/lib/utils';
import { 
  Users, 
  Clock, 
  Box, 
  CheckCircle2, 
  AlertOctagon, 
  Check, 
  X, 
  MapPin, 
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

interface AdminDashboardProps {
  onOpenDetail?: (loanId: string) => void;
}

export default function AdminDashboard({ onOpenDetail }: AdminDashboardProps = {}) {
  const { 
    loans, 
    barangList, 
    approveBooking, 
    rejectBooking, 
    activityLogs,
    addToast,
    adminCancelBooking,
    approveExtension,
    rejectExtension,
    completeReturnWithCondition
  } = useEPinjam();

  // Dialog and reject reason state
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  // States for Admin Canceling & Returning with Conditions
  const [adminCancelingId, setAdminCancelingId] = useState<string | null>(null);
  const [adminCancelReason, setAdminCancelReason] = useState('');

  const [returningId, setReturningId] = useState<string | null>(null);
  const [returnCondition, setReturnCondition] = useState<'Baik' | 'Rusak Ringan' | 'Rusak Berat'>('Baik');
  const [returnNotes, setReturnNotes] = useState('');

  // Filters / calculations
  const pendingLoans = loans.filter((l: Loan) => l.status === 'Menunggu');
  const activeBorrowed = loans.filter((l: Loan) => l.status === 'Dipinjam' || l.status === 'Disetujui' || l.status === 'Terlambat');
  const extensionRequests = loans.filter((l: Loan) => l.extendRequest === 'pending');
  const availableInFocus = barangList.filter((b: Barang) => b.status === 'Tersedia' && b.active);
  const totalArrearsCount = loans.filter((l: Loan) => l.status === 'Terlambat').length;

  // Chart data: borrowing frequency across 7 days
  const chartData = [
    { name: 'Mon', count: 5 },
    { name: 'Tue', count: 8 },
    { name: 'Wed', count: 12 },
    { name: 'Thu', count: 15 },
    { name: 'Fri', count: 9 },
    { name: 'Sat', count: 4 },
    { name: 'Sun', count: 2 },
  ];

  const handleTriggerRejectDialog = (id: string) => {
    setRejectId(id);
    setRejectReason('');
    setIsRejectDialogOpen(true);
  };

  const handleConfirmReject = () => {
    if (rejectId) {
      rejectBooking(rejectId, rejectReason);
      addToast(`Peminjaman ${rejectId} berhasil ditolak.`, 'error');
    }
    setIsRejectDialogOpen(false);
    setRejectId(null);
  };

  const handleAdminCancel = () => {
    if (adminCancelingId) {
      adminCancelBooking(adminCancelingId, adminCancelReason || 'Dibatalkan oleh administrasi BAAK');
      setAdminCancelingId(null);
      setAdminCancelReason('');
    }
  };

  const handleCompleteReturn = () => {
    if (returningId) {
      completeReturnWithCondition(returningId, returnCondition, returnNotes || 'Dikembalikan dalam kondisi baik.');
      setReturningId(null);
      setReturnCondition('Baik');
      setReturnNotes('');
    }
  };



  const handleHandover = (loanId: string) => {
    approveBooking(loanId);
    addToast('InFocus berhasil diserahkan ke mahasiswa', 'success');
    if (typeof onOpenDetail === 'function') {
      onOpenDetail(loanId);
    }
  };

  return (
    <div className="space-y-6" id="admin-dashboard-container">
      
      {/* Welcome message */}
      <div id="admin-welcome-header">
        <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard Admin</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          Kelola reservasi, pantau utilisasi unit proyektor, dan tinjau aduan kendala teknis dalam satu panel.
        </p>
      </div>

      {/* Row 1 — 5 elegant stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4" id="admin-stat-cards">
        {/* Total Pengajuan Hari Ini (Blue) */}
        <div className="glass-card p-4 rounded-xl flex items-center justify-between border-l-4 border-l-blue-500 overflow-hidden relative">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pengajuan Baru</p>
            <h3 className="text-2xl font-extrabold text-white mt-1.5">{loans.length}</h3>
            <p className="text-[10px] text-slate-500 mt-1">Total Entri</p>
          </div>
          <div className="p-2 w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Menunggu Persetujuan (Amber, pulsing dot) */}
        <div className="glass-card p-4 rounded-xl flex items-center justify-between border-l-4 border-l-amber-500 overflow-hidden relative amber-pulse">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Butuh Review</p>
            <div className="flex items-center gap-2 mt-1.5">
              <h3 className="text-2xl font-extrabold text-amber-400">{pendingLoans.length}</h3>
              <span className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Status: Menunggu</p>
          </div>
          <div className="p-2 w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-400">
            <Clock className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
        </div>

        {/* Sedang Dipinjam (Orange) */}
        <div className="glass-card p-4 rounded-xl flex items-center justify-between border-l-4 border-l-orange-500 overflow-hidden relative">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sedang Dipinjam</p>
            <h3 className="text-2xl font-extrabold text-orange-400 mt-1.5">{activeBorrowed.length}</h3>
            <p className="text-[10px] text-slate-500 mt-1">Pemakaian Aktif</p>
          </div>
          <div className="p-2 w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20 text-orange-400">
            <Box className="w-5 h-5" />
          </div>
        </div>

        {/* InFocus Tersedia (Green) */}
        <div className="glass-card p-4 rounded-xl flex items-center justify-between border-l-4 border-l-emerald-500 overflow-hidden relative">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unit Ready</p>
            <h3 className="text-2xl font-extrabold text-emerald-400 mt-1.5">{availableInFocus.length}</h3>
            <p className="text-[10px] text-slate-500 mt-1">Siap Dipinjam</p>
          </div>
          <div className="p-2 w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Penalti Aktif (Red) */}
        <div className={`glass-card p-4 rounded-xl flex items-center justify-between border-l-4 overflow-hidden relative ${
          totalArrearsCount > 0 ? 'border-l-rose-500' : 'border-l-slate-700'
        }`}>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Penalti Aktif</p>
            <h3 className={`text-2xl font-extrabold mt-1.5 ${totalArrearsCount > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-400'}`}>
              {totalArrearsCount}
            </h3>
            <p className="text-[10px] text-slate-500 mt-1">Terlambat Kembali</p>
          </div>
          <div className={`p-2 w-9 h-9 rounded-lg flex items-center justify-center border ${
            totalArrearsCount > 0 
              ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
              : 'bg-slate-500/15 border-white/5 text-slate-500'
          }`}>
            <AlertOctagon className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Row 2 — Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="admin-main-row-2">
        
        {/* Left Column (55% equivalent -> 7/12 cols): Pengajuan Terbaru - Menunggu Review */}
        <div className="lg:col-span-7 space-y-4" id="pending-applications-panel">
          <div className="bg-slate-900/20 p-2.5 rounded-xl border border-white/5 flex justify-between items-center">
            <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5 px-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              Pengajuan Terbaru — Menunggu Review
            </h2>
          </div>

          <div className="glass-card rounded-xl overflow-hidden" id="pending-loans-table-wrapper">
            {pendingLoans.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500 space-y-2" id="admin-pending-empty">
                <Box className="w-8 h-8 mx-auto text-slate-600 stroke-[1.5]" />
                <h4 className="font-semibold text-slate-400">Tidak ada pengajuan baru</h4>
                <p className="text-[10px] text-slate-600">Semua formulir pengajuan mahasiswa saat ini sudah diproses penuh.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs" id="table-pending-bookings shadow-lg">
                  <thead>
                    <tr className="bg-slate-950/60 border-b border-white/5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      <th className="p-4">Mahasiswa</th>
                      <th className="p-4">Barang</th>
                      <th className="p-4">Waktu</th>
                      <th className="p-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {pendingLoans.map((loan) => (
                      <tr 
                        key={loan.id}
                        className="hover:bg-indigo-500/[0.04] transition-colors"
                        id={`pending-row-${loan.id}`}
                      >
                        <td className="p-4">
                          <p className="font-bold text-white leading-tight">{loan.studentName}</p>
                          <p className="text-[10px] font-mono text-slate-500 mt-0.5">NIM {loan.nim}</p>
                        </td>

                        <td className="p-4">
                          <p className="font-semibold text-slate-200">{loan.itemName}</p>
                          <p className="text-[10px] font-mono text-indigo-400 mt-0.5">{loan.itemCode}</p>
                        </td>

                        <td className="p-4">
                          <p className="text-slate-300 font-medium">{loan.date}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{loan.timeSlot}</p>
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => approveBooking(loan.id)}
                              className="px-2.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/20 hover:border-emerald-500 text-emerald-400 hover:text-white rounded-lg text-[10px] font-bold transition-all flex items-center gap-0.5 cursor-pointer"
                              id={`btn-approve-row-${loan.id}`}
                            >
                              <Check className="w-3.5 h-3.5" />
                              Approve
                            </button>

                            <button
                              onClick={() => handleTriggerRejectDialog(loan.id)}
                              className="px-2.5 py-1.5 bg-rose-600/15 hover:bg-rose-600 border border-rose-500/10 hover:border-rose-500 text-rose-400 hover:text-white rounded-lg text-[10px] font-bold transition-all flex items-center gap-0.5 cursor-pointer"
                              id={`btn-reject-row-${loan.id}`}
                            >
                              <X className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (45% equivalent -> 5/12 cols): Statistik Peminjaman Minggu Ini */}
        <div className="lg:col-span-5 space-y-4" id="stats-charts-panel">
          <div className="bg-slate-900/20 p-2.5 rounded-xl border border-white/5">
            <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5 px-1">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              Statistik Peminjaman Minggu Ini
            </h2>
          </div>

          <div className="glass-card p-4 rounded-xl flex flex-col justify-between" id="bar-chart-recharts-container">
            <div className="mb-4">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Frequensi Booking</p>
              <h4 className="text-lg font-bold text-white mt-0.5">Total: 48 Kali Peminjaman</h4>
            </div>

            {/* Recharts Bar Chart Container */}
            <div className="w-full h-48 mt-2" id="chart-viewport">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="rgba(255,255,255,0.4)" 
                    fontSize={10} 
                    fontFamily="monospace"
                    tickLine={false} 
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.4)" 
                    fontSize={10} 
                    fontFamily="monospace"
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                      borderColor: 'rgba(99, 102, 241, 0.2)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '11px'
                    }} 
                    itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#4f46e5" 
                    radius={[4, 4, 0, 0]} 
                    maxBarSize={28}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <p className="text-[9px] text-slate-500 text-center mt-3 leading-tight">
              Grafik menunjukkan akumulasi total unit dipinjam per hari kerja semester genap 2026.
            </p>
          </div>
        </div>
      </div>

      {/* Row 3 — Log Aktivitas Terbaru (Timeline list) */}
      <div className="space-y-4" id="timeline-outer-container">
        <div className="bg-slate-900/20 p-2.5 rounded-xl border border-white/5">
          <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5 px-1">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
            Log Aktivitas Biro Terbaru
          </h2>
        </div>

        <div className="glass-card p-5 rounded-xl text-xs relative overflow-hidden" id="timeline-element bg-slate-900/60">
          <div className="absolute left-6.5 top-8 bottom-8 w-px bg-slate-800" />
          
          <div className="space-y-4 relative" id="timeline-list">
            {activityLogs.map((log, index) => {
              let dotColor = 'bg-blue-500 ring-blue-500/20';
              if (log.type === 'reject') dotColor = 'bg-rose-500 ring-rose-500/20';
              if (log.type === 'penalty') dotColor = 'bg-amber-500 ring-amber-500/20';
              if (log.type === 'submit') dotColor = 'bg-indigo-500 ring-indigo-500/20';
              if (log.type === 'inventory') dotColor = 'bg-teal-500 ring-teal-500/20';

              return (
                <div 
                  key={`${log.id}-${index}`}
                  className="flex items-start gap-4"
                  id={`timeline-log-${log.id}-${index}`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full ${dotColor} ring-4 mt-0.5 flex-shrink-0 z-10`} />
                  <div className="flex-1 min-w-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                    <p className="text-slate-200 font-medium tracking-tight pr-6">{log.text}</p>
                    <span className="text-[10px] text-slate-500 whitespace-nowrap font-mono">{log.timestamp}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 2.5: ACTIVE PEMAKAIAN & EXTENSION APPROVALS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="admin-main-row-2-5">
        
        {/* Left Column (Span 7): Kelola Peminjaman Aktif & Pengembalian */}
        <div className="lg:col-span-7 space-y-4" id="active-peminjaman-panel">
          <div className="bg-slate-900/20 p-2.5 rounded-xl border border-white/5 flex justify-between items-center">
            <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5 px-1 font-sans">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              Kelola Peminjaman Aktif & Catat Pengembalian ke Inventaris
            </h2>
          </div>

          <div className="glass-card rounded-xl overflow-hidden" id="active-borrowings-table-wrapper">
            {activeBorrowed.length === 0 ? (
              <div className="p-10 text-center text-xs text-slate-500 space-y-2" id="admin-active-empty">
                <Box className="w-8 h-8 mx-auto text-slate-600 stroke-[1.5]" />
                <h4 className="font-semibold text-slate-300">Belum Ada Pemakaian Aktif</h4>
                <p className="text-[10px] text-slate-600">Seluruh proyektor kampus saat ini aman tersimpan di lemari lab.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs" id="table-active-borrowings">
                  <thead>
                    <tr className="bg-slate-950/60 border-b border-white/5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      <th className="p-4">Peminjam</th>
                      <th className="p-4">Barang & Slot</th>
                      <th className="p-4">Kondisi & Durasi</th>
                      <th className="p-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {activeBorrowed.map((loan) => (
                      <tr key={loan.id} className="hover:bg-indigo-500/[0.04] transition-colors" id={`active-row-${loan.id}`}>
                        <td className="p-4">
                          <p className="font-bold text-white leading-tight">{loan.studentName}</p>
                          <p className="text-[10px] font-mono text-slate-500 mt-0.5">NIM {loan.nim}</p>
                          {loans.filter(l => l.nim === loan.nim && l.status !== 'Selesai' && l.status !== 'Ditolak').length >= 2 && (
                            <span className="text-[8px] bg-indigo-950 text-indigo-300 font-semibold px-1 py-0.5 rounded mt-1 inline-block border border-indigo-500/10">
                              Maks Borrow Limit (2 Aktif)
                            </span>
                          )}
                        </td>

                        <td className="p-4">
                          <p className="font-semibold text-slate-200">{loan.itemName}</p>
                          <p className="text-[10px] text-indigo-400 font-mono mt-0.5">{loan.itemCode} • {loan.timeSlot}</p>
                          {loan.bookingDuration && (
                            <span className="text-[9px] text-slate-400 font-medium font-sans">Durasi: {loan.bookingDuration}</span>
                          )}
                        </td>

                        <td className="p-4">
                          <div className="space-y-1">
                            {loan.damageReported ? (
                              <span className="text-[9px] font-bold text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-900 leading-none inline-block">
                                ⚠ Masalah Dilaporkan
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/20 px-1.5 py-0.5 rounded border border-emerald-500/10 leading-none inline-block">
                                Kondisi Awal Baik ✓
                              </span>
                            )}
                            {loan.damageReportNotes && (
                              <p className="text-[10px] text-amber-500 italic max-w-[160px] truncate" title={loan.damageReportNotes}>
                                {`"${loan.damageReportNotes}"`}
                              </p>
                            )}
                          </div>
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex flex-col sm:flex-row justify-end gap-1.5 items-end sm:items-center">
                            
                            {/* Actions for Dipinjam or Terlambat (Return actions) */}
                            {(loan.status === 'Dipinjam' || loan.status === 'Terlambat') && (
                              <>
                                <button
                                  onClick={() => {
                                    setReturningId(loan.id);
                                    setReturnCondition('Baik');
                                    setReturnNotes('');
                                  }}
                                  className="px-2.5 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/20 hover:border-indigo-500 text-indigo-400 hover:text-white rounded-lg text-[10px] font-bold transition-all flex items-center gap-0.5 cursor-pointer"
                                  id={`btn-complete-return-${loan.id}`}
                                >
                                  Catat Kembali
                                </button>
                              </>
                            )}

                            {/* Action for Disetujui (Handover action) */}
                            {loan.status === 'Disetujui' && (
                              <button
                                onClick={() => handleHandover(loan.id)}
                                className="px-2.5 py-1.5 bg-green-600/15 hover:bg-green-600 border border-green-500/10 hover:border-green-500 text-green-400 hover:text-white rounded-lg text-[10px] font-bold transition-all flex items-center gap-0.5 cursor-pointer"
                                id={`btn-handover-${loan.id}`}
                              >
                                Serahkan InFocus
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setAdminCancelingId(loan.id);
                                setAdminCancelReason('');
                              }}
                              className="px-2 py-1 text-[9px] font-semibold text-rose-400 hover:text-rose-300 hover:underline transition-all cursor-pointer"
                              id={`btn-admin-cancel-${loan.id}`}
                            >
                              Batal Admin
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Span 5): Review Permintaan Perpanjangan */}
        <div className="lg:col-span-5 space-y-4" id="extension-requests-panel">
          <div className="bg-slate-900/20 p-2.5 rounded-xl border border-white/5">
            <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5 px-1 font-sans">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              Review Permintaan Perpanjangan Waktu
            </h2>
          </div>

          <div className="glass-card p-4 rounded-xl space-y-4" id="extension-items-list">
            {extensionRequests.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 space-y-2" id="admin-extensions-empty">
                <Clock className="w-8 h-8 mx-auto text-slate-600 stroke-[1.5]" />
                <h4 className="font-semibold text-slate-400">Tidak ada pengajuan extend</h4>
                <p className="text-[10px] text-slate-600">Mahasiswa tertib mengembalikan unit sesuai estimasi waktu awal.</p>
              </div>
            ) : (
              extensionRequests.map((loan) => (
                <div key={loan.id} className="p-3.5 rounded-xl bg-slate-950/40 border border-white/5 space-y-3" id={`ext-item-${loan.id}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold text-white leading-tight">{loan.studentName}</h4>
                      <p className="text-[10px] font-mono text-slate-500 mt-0.5">NIM {loan.nim}</p>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/20">
                      Extend Pinjam
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-400 space-y-1 bg-slate-900/40 p-2.5 rounded-lg border border-white/5 font-sans">
                    <p><span className="text-slate-500 font-semibold">Unit:</span> {loan.itemName} ({loan.itemCode})</p>
                    <p><span className="text-slate-500 font-semibold">Slot Lama:</span> {loan.timeSlot}</p>
                    <p><span className="text-slate-500 font-semibold">Permintaan:</span> Tambah <span className="text-amber-400 font-bold">+{loan.extendHours || '2'} Jam</span></p>
                    {loan.extendReason && (
                      <p className="mt-1.5 text-[9.5px] italic text-slate-300 bg-slate-950/50 p-1.5 rounded border-l-2 border-l-indigo-500 leading-normal">
                        {`"${loan.extendReason}"`}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => {
                        rejectExtension(loan.id);
                        addToast('Permintaan perpanjangan ditolak.', 'error');
                      }}
                      className="px-2.5 py-1.5 bg-rose-600/15 hover:bg-rose-600 border border-rose-500/10 hover:border-rose-500 text-rose-400 hover:text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center"
                      id={`btn-reject-ext-${loan.id}`}
                    >
                      Tolak
                    </button>
                    <button
                      onClick={() => {
                        approveExtension(loan.id);
                        addToast('Permintaan perpanjangan disetujui.', 'success');
                      }}
                      className="px-2.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/20 hover:border-emerald-500 text-emerald-400 hover:text-white rounded-lg text-[10px] font-bold transition-all flex items-center gap-0.5 cursor-pointer flex items-center justify-center"
                      id={`btn-approve-ext-${loan.id}`}
                    >
                      Setujui
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Row 3 — Log Aktivitas Terbaru (Timeline list) */}
      <div className="space-y-4" id="timeline-outer-container">
        <div className="bg-slate-900/20 p-2.5 rounded-xl border border-white/5">
          <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5 px-1 font-sans">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
            Log Aktivitas Biro Terbaru
          </h2>
        </div>

        <div className="glass-card p-5 rounded-xl text-xs relative overflow-hidden" id="timeline-element bg-slate-900/60">
          <div className="absolute left-6.5 top-8 bottom-8 w-px bg-slate-800" />
          
          <div className="space-y-4 relative" id="timeline-list">
            {activityLogs.map((log, index) => {
              let dotColor = 'bg-blue-500 ring-blue-500/20';
              if (log.type === 'reject') dotColor = 'bg-rose-500 ring-rose-500/20';
              if (log.type === 'penalty') dotColor = 'bg-amber-500 ring-amber-500/20';
              if (log.type === 'submit') dotColor = 'bg-indigo-500 ring-indigo-500/20';
              if (log.type === 'inventory') dotColor = 'bg-teal-500 ring-teal-500/20';

              return (
                <div 
                  key={`${log.id}-${index}`}
                  className="flex items-start gap-4"
                  id={`timeline-log-${log.id}-${index}`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full ${dotColor} ring-4 mt-0.5 flex-shrink-0 z-10`} />
                  <div className="flex-1 min-w-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 font-sans">
                    <p className="text-slate-200 font-medium tracking-tight pr-6">{log.text}</p>
                    <span className="text-[10px] text-slate-500 whitespace-nowrap font-mono">{log.timestamp}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CONFIRMATION DIALOG / MODAL ON REJECT */}
      <AnimatePresence>
        {isRejectDialogOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRejectDialogOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              id="reject-modal-backdrop"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-slate-900 border border-white/10 p-6 rounded-2xl max-w-sm w-full z-10 space-y-4 shadow-2xl"
              id="confirm-reject-dialog"
            >
              <div className="w-12 h-12 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-sm font-bold text-white tracking-tight">Tolak Pengajuan Peminjaman?</h3>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Apakah Anda yakin ingin menolak pengajuan ini? Tindakan ini akan mengirimkan notifikasi penolakan ke mahasiswa.
                </p>
              </div>

              <div className="space-y-1.5 text-left font-sans">
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Alasan Penolakan (Optional)</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Contoh: Unit bertabrakan dengan jadwal ujian kuliah..."
                  rows={2}
                  className="w-full glass-input p-2 rounded-lg text-xs"
                  id="reject-reason-input"
                />
              </div>

              <div className="flex gap-2 pt-2" id="reject-modal-actions">
                <button
                  type="button"
                  onClick={() => setIsRejectDialogOpen(false)}
                  className="flex-1 py-2 text-xs font-bold text-slate-400 rounded-xl hover:text-white hover:bg-white/5 transition-all text-center border border-slate-800 cursor-pointer"
                  id="btn-cancel-reject"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold rounded-xl shadow-lg active:scale-95 transition-all cursor-pointer"
                  id="btn-confirm-reject"
                >
                  Ya, Tolak
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 1. ADMIN DIALOG: CANCEL APPROVED LOAN WITH NOTIFICATION REASON */}
      {adminCancelingId && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in" id="admin-cancel-dialog">
          <div className="glass-card p-6 rounded-2xl border border-white/10 max-w-sm w-full space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto">
              <AlertTriangle className="w-6 h-6 animate-bounce" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-sm font-extrabold text-white">Batalkan Pinjaman Aktif?</h3>
              <p className="text-slate-400 text-xs leading-normal">
                Tindakan berisiko tinggi. Anda menarik paksa hak penggunaan unit. Alasan pembatalan wajib diteruskan ke mahasiswa sebagai notifikasi resmi.
              </p>
            </div>

            <div className="space-y-1 text-left font-sans">
              <label className="block text-[10px] font-bold text-slate-400 uppercase">Alasan Penarikan / Pembatalan</label>
              <textarea
                value={adminCancelReason}
                onChange={(e) => setAdminCancelReason(e.target.value)}
                placeholder="Contoh: Unit ditarik mendadak karena akan digunakan oleh Rektorat di Aula Utama..."
                rows={3}
                className="w-full bg-slate-950 border border-white/10 text-white p-2 text-xs rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAdminCancelingId(null)}
                className="flex-1 py-2 bg-slate-900 border border-white/5 text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-850 cursor-pointer"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={handleAdminCancel}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
              >
                Ya, Batalkan & Notifikasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. ADMIN DIALOG: RECORD RETURN CONDITION LOGS */}
      {returningId && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in" id="admin-return-condition-dialog">
          <div className="glass-card p-6 rounded-2xl border border-white/10 max-w-sm w-full space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1 font-sans">
              <h3 className="text-sm font-extrabold text-white">Catat Pengembalian Proyektor</h3>
              <p className="text-slate-400 text-xs leading-normal">
                Pilih status rekam kondisi kesehatan fisik unit proyektor sesaat setelah dikembalikan oleh mahasiswa demi pemeliharaan inventaris.
              </p>
            </div>

            <div className="space-y-4 font-sans text-left">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Kondisi Pengembalian</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Baik', 'Rusak Ringan', 'Rusak Berat'] as const).map((cond) => {
                    let btnColor = 'border-white/10 text-slate-300';
                    if (returnCondition === cond) {
                      if (cond === 'Baik') btnColor = 'bg-emerald-600 border-emerald-500 text-white font-bold';
                      if (cond === 'Rusak Ringan') btnColor = 'bg-amber-600 border-amber-500 text-white font-bold';
                      if (cond === 'Rusak Berat') btnColor = 'bg-rose-600 border-rose-500 text-white font-bold';
                    }
                    return (
                      <button
                        key={cond}
                        type="button"
                        onClick={() => setReturnCondition(cond)}
                        className={`py-2 text-[10px] font-bold rounded-lg border text-center cursor-pointer transition-all ${btnColor}`}
                      >
                        {cond}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Catatan Tambahan Pengembalian</label>
                <textarea
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  placeholder="Contoh: Unit bersih lengkap kabel HDMI bawaan / Remote hilang, lapor denda..."
                  rows={2.5}
                  className="w-full bg-slate-950 border border-white/10 text-white p-2 text-xs rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setReturningId(null)}
                className="flex-1 py-2 bg-slate-900 border border-white/5 text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-850 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleCompleteReturn}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
              >
                Simpan & Tutup Buku
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
