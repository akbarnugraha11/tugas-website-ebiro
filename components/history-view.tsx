'use client';

import { useState } from 'react';
import { useEPinjam, Loan, Status } from '@/lib/state-context';
import { getStatusStyles } from '@/lib/utils';
import { 
  Search, 
  Filter, 
  FileDown, 
  Calendar, 
  MapPin, 
  FileText, 
  ChevronRight, 
  X, 
  CheckCircle2, 
  Clock, 
  Download, 
  AlertOctagon,
  TrendingDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';

interface HistoryViewProps {
  selectedLoanId: string | null;
  onCloseDetail: () => void;
  onOpenDetail: (loanId: string) => void;
}

export default function HistoryView({ selectedLoanId, onCloseDetail, onOpenDetail }: HistoryViewProps) {
  const { 
    currentUser, 
    loans, 
    addToast 
  } = useEPinjam();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('Semua');

  if (!currentUser) return null;

  // Filter student's own loans
  const studentLoans = loans.filter((l: Loan) => l.nim === currentUser.nimOrId);

  // Apply filters
  const filteredLoans = studentLoans.filter((loan: Loan) => {
    // Search query matches eventName or itemName
    const matchesSearch = 
      loan.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.itemCode.toLowerCase().includes(searchQuery.toLowerCase());

    // Tab matches status
    if (activeTab === 'Semua') return matchesSearch;
    return matchesSearch && loan.status === activeTab;
  });

  // Safe PDF export trigger
  const handleExportPDF = () => {
    addToast('Sedang menyiapkan rekap peminjaman...', 'success');

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const primaryColor = [79, 70, 229]; // #4f46e5 (Indigo)
    const secondaryColor = [15, 23, 42]; // #0f172a (Deep Slate)
    const grayColor = [100, 116, 139]; // Slate 500
    const lightBg = [248, 250, 252]; // Slate 50

    // Header branding
    doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.rect(0, 0, 210, 42, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('E-PINJAM KAMPUS - RIWAYAT PEMINJAMAN', 15, 17);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.text('REKAP RESMI AKTIVITAS SIRKULASI INVENTARIS MAHASISWA', 15, 24);
    doc.setFontSize(8);
    doc.setTextColor(199, 210, 254);
    doc.text(`Waktu Cetak: ${new Date().toLocaleString('id-ID')} · Akses Mandiri`, 15, 30);

    doc.setFillColor(79, 70, 229, 0.4);
    doc.rect(15, 34, 180, 0.5, 'F');

    let y = 52;
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Profil dan Informasi Mahasiswa', 15, y);
    y += 5;

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(15, y, 195, y);
    y += 5;

    // Profile Metadata row
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text('NAMA LENGKAP:', 15, y);
    doc.setFont('Helvetica', 'normal');
    doc.text(currentUser.name, 45, y);

    doc.setFont('Helvetica', 'bold');
    doc.text('NIM / ID SISWA:', 115, y);
    doc.setFont('Helvetica', 'normal');
    doc.text(currentUser.nimOrId, 145, y);

    y += 6;
    doc.setFont('Helvetica', 'bold');
    doc.text('EMAIL AKUN:', 15, y);
    doc.setFont('Helvetica', 'normal');
    doc.text(`${currentUser.nimOrId.toLowerCase()}@mhs.kampus.ac.id`, 45, y);

    doc.setFont('Helvetica', 'bold');
    doc.text('TOTAL TRANSAKSI:', 115, y);
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(`${studentLoans.length} Peminjaman (${filteredLoans.length} terfilter)`, 145, y);

    y += 12;

    // Daftar Reservasi Table
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Daftar Rincian Reservasi Terfilter', 15, y);
    y += 5;
    
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(15, y, 195, y);
    y += 4;

    // Table Header
    doc.setFillColor(241, 245, 249);
    doc.rect(15, y, 180, 8, 'F');
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text('ID', 17, y + 5.5);
    doc.text('KEGIATAN / ACARA', 32, y + 5.5);
    doc.text('INFOCUS', 85, y + 5.5);
    doc.text('TANGGAL & SLOT', 122, y + 5.5);
    doc.text('LOKASI', 160, y + 5.5);
    doc.text('STATUS', 180, y + 5.5);
    y += 8;

    // Table Rows
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);

    if (filteredLoans.length === 0) {
      doc.text('Tidak ditemukan transaksi peminjaman.', 15, y + 5);
    } else {
      filteredLoans.forEach((loan, index) => {
        doc.setDrawColor(241, 245, 249);
        doc.setLineWidth(0.2);
        doc.line(15, y + 7, 195, y + 7);

        doc.text(loan.id, 17, y + 4.5);
        
        // Truncate eventName to fit inside column
        const maxLen = 30;
        const shortEvent = loan.eventName.length > maxLen 
          ? loan.eventName.substring(0, maxLen) + '...' 
          : loan.eventName;
        doc.text(shortEvent, 32, y + 4.5);

        doc.text(`${loan.itemCode}`, 85, y + 4.5);
        doc.text(`${loan.date} (${loan.timeSlot})`, 122, y + 4.5);
        doc.text(loan.location, 160, y + 4.5);
        doc.text(loan.status, 180, y + 4.5);
        y += 7.5;

        // Page breaks
        if (y > 270 && index < filteredLoans.length - 1) {
          doc.addPage();
          y = 20;
        }
      });
    }

    y += 10;
    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(15, y, 195, y);
    y += 8;

    doc.setFont('Helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text('Voucher & Status ini sah diakui oleh Universitas Teknologi Nusantara.', 15, y);

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text('Biro Administrasi Akademik & Kemahasiswaan (BAAK)', 15, y + 10);

    // Save and download PDF
    doc.save(`Recap_Peminjaman_${currentUser.nimOrId}_${new Date().toISOString().substring(0,10)}.pdf`);
    addToast('Berkas Rekap PDF Berhasil Diunduh!', 'success');
  };

  const handleDownloadTicket = (loanId: string) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) {
      addToast('Reservasi tidak ditemukan!', 'error');
      return;
    }

    addToast(`Menyiapkan Surat Ijin Digital ${loanId}...`, 'success');

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a5' // compact paper format! Perfectly fits a printable ticket / card!
    });

    const primaryColor = [79, 70, 229]; // #4f46e5 (Indigo)
    const secondaryColor = [15, 23, 42]; // #0f172a (Deep Slate)
    const grayColor = [100, 116, 139]; // Slate 500

    // Frame Border
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(1);
    doc.rect(5, 5, 138, 200, 'D');

    // Header header box
    doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.rect(5, 5, 138, 30, 'F');

    // Title text inside helper
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('E-PINJAM - KARTU IJIN PINJAM', 12, 16);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(199, 210, 254);
    doc.text('SURAT KEPUTUSAN PINJAM MANDIRI SARPRAS KAMPUS', 12, 21);
    doc.text(`KODE KELUAR: ${loan.id} · TERPERCAYA`, 12, 26);

    let y = 48;
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text('1. DATA DETAIL TRANSAKSI', 10, y);
    y += 4;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(10, y, 138, y);
    y += 6;

    // Details Grid
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('NAMA PEMINJAM:', 10, y);
    doc.setFont('Helvetica', 'normal');
    doc.text(loan.studentName, 42, y);

    y += 5.5;
    doc.setFont('Helvetica', 'bold');
    doc.text('NIM MAHASISWA:', 10, y);
    doc.setFont('Helvetica', 'normal');
    doc.text(loan.nim, 42, y);

    y += 5.5;
    doc.setFont('Helvetica', 'bold');
    doc.text('NAMA KEGIATAN:', 10, y);
    doc.setFont('Helvetica', 'normal');
    // Truncate to fit card
    const shortEvent = loan.eventName.length > 40 ? loan.eventName.substring(0, 38) + '...' : loan.eventName;
    doc.text(shortEvent, 42, y);

    y += 5.5;
    doc.setFont('Helvetica', 'bold');
    doc.text('KODE UNIT ALAT:', 10, y);
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(loan.itemCode, 42, y);

    y += 5.5;
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('PERANGKAT:', 10, y);
    doc.setFont('Helvetica', 'normal');
    doc.text(loan.itemName, 42, y);

    y += 5.5;
    doc.setFont('Helvetica', 'bold');
    doc.text('TANGGAL PINJAM:', 10, y);
    doc.setFont('Helvetica', 'normal');
    doc.text(loan.date, 42, y);

    y += 5.5;
    doc.setFont('Helvetica', 'bold');
    doc.text('SLOT JADWAL WAKTU:', 10, y);
    doc.setFont('Helvetica', 'normal');
    doc.text(loan.timeSlot, 42, y);

    y += 5.5;
    doc.setFont('Helvetica', 'bold');
    doc.text('RUANG / LOKASI:', 10, y);
    doc.setFont('Helvetica', 'normal');
    doc.text(loan.location, 42, y);

    y += 5.5;
    doc.setFont('Helvetica', 'bold');
    doc.text('STATUS TRANSAKSI:', 10, y);
    doc.setFont('Helvetica', 'bold');
    if (loan.status === 'Disetujui' || loan.status === 'Selesai') {
      doc.setTextColor(16, 185, 129); // Green
    } else if (loan.status === 'Menunggu' || loan.status === 'Dipinjam') {
      doc.setTextColor(245, 158, 11); // Orange
    } else {
      doc.setTextColor(239, 68, 68); // Red
    }
    doc.text(loan.status, 42, y);

    y += 12;

    // Terms section
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text('2. SYARAT & KETENTUAN HUKUM', 10, y);
    y += 4;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(10, y, 138, y);
    y += 5;

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(100, 116, 139);
    
    doc.text('1. Mahasiswa wajib menunjukkan Surat Ijin Digital ini kepada petugas Biro Sarpras saat serah terima.', 10, y);
    y += 4;
    doc.text('2. Kerusakan, kehilangan, atau keterlambatan pengembalian unit diluar batas toleransi dikenakan sanksi denda.', 10, y);
    y += 4;
    doc.text('3. Pengembalian unit wajib menyertakan kelengkapan bawaan (remote proyektor, kabel HDMI, tas proyektor).', 10, y);
    y += 4;
    doc.text('4. Batas maksimal toleransi keterlambatan adalah 15 menit dari jam penutupan matakuliah terkait.', 10, y);

    y += 12;

    // barcode simulator UI
    doc.setFillColor(30, 41, 59);
    doc.rect(20, y, 100, 8, 'F');
    doc.setFont('Courier', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(`* ${loan.id} - APPROVED *`, 45, y + 5.5);

    y += 20;

    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('Petugas Biro Sarpras Kampus', 85, y);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text('Universitas Teknologi Nusantara', 85, y + 4);

    doc.save(`Voucher_Pinjam_${loan.id}.pdf`);
    addToast('Surat Ijin Digital berhasil diunduh!', 'success');
  };

  // Group by month helper (since we are doing simulated data in May 2026, let's group logically)
  const groupHeaders = {
    'Mei 22026': 'Mei 2026',
  };

  // Find selected loan details for modal
  const activeLoanDetails = loans.find(l => l.id === selectedLoanId);

  return (
    <div className="space-y-6" id="history-view-root">
      
      {/* Title */}
      <div id="history-header">
        <h1 className="text-2xl font-bold text-white tracking-tight">Riwayat Peminjaman</h1>
        <p className="text-slate-400 text-sm mt-0.5">Pantau seluruh status pengajuan peminjaman InFocus aktif maupun arsip masa lalu Anda.</p>
      </div>

      {/* TOP FILTER BAR */}
      <div className="glass-panel p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between" id="filter-bar">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kegiatan atau proyektor..."
            className="w-full glass-input pl-9 pr-3 py-2 text-xs rounded-xl"
            id="input-history-search"
          />
        </div>

        {/* Action button Export */}
        <button
          onClick={handleExportPDF}
          className="w-full md:w-auto px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          id="btn-export-pdf"
        >
          <FileDown className="w-4 h-4" />
          <span>Export PDF</span>
        </button>
      </div>

      {/* STATUS TABS */}
      <div className="flex gap-1 bg-slate-950/60 p-1 rounded-xl border border-white/5 overflow-x-auto" id="filter-tabs">
        {['Semua', 'Menunggu', 'Disetujui', 'Dipinjam', 'Selesai', 'Ditolak'].map((tab) => {
          const isActive = activeTab === tab;
          const count = tab === 'Semua' 
            ? studentLoans.length 
            : studentLoans.filter((l: Loan) => l.status === tab).length;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-1.5 px-4 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                isActive 
                  ? 'bg-indigo-600 text-white font-bold' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
              id={`tab-filter-${tab.toLowerCase()}`}
            >
              <span>{tab}</span>
              {count > 0 && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-black/20 text-white' : 'bg-slate-900 text-slate-400'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* MONTH-GROUPED LISTING */}
      <div className="space-y-6" id="history-items-list-container">
        {filteredLoans.length === 0 ? (
          <div className="glass-card p-12 rounded-xl text-center border-dashed border-white/10" id="empty-history-state">
            <Filter className="w-10 h-10 mx-auto text-slate-600 mb-2 stroke-[1.5]" />
            <h4 className="text-xs font-bold text-slate-400">Peminjaman Tidak Ditemukan</h4>
            <p className="text-[10px] text-slate-500 mt-1 max-w-xs mx-auto">
              Tidak ada catatan peminjaman proyektor Anda yang cocok dengan kriteria filter aktif saat ini.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Group Header Sticky: Mei 2026 */}
            <div className="sticky top-0 bg-slate-950 z-10 py-1 border-b border-white/5 flex items-center" id="month-header">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-900/60 py-1 px-3 rounded-full border border-white/5 shadow-sm">
                Mei 2026
              </span>
            </div>

            {/* Loans list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="history-card-grid">
              {filteredLoans.map((loan) => {
                const statusStyles = getStatusStyles(loan.status);

                // Vertical left border accent determine
                let statusBorderColor = 'border-l-amber-500';
                if (loan.status === 'Disetujui') statusBorderColor = 'border-l-blue-500';
                if (loan.status === 'Dipinjam') statusBorderColor = 'border-l-orange-500';
                if (loan.status === 'Selesai') statusBorderColor = 'border-l-emerald-500';
                if (loan.status === 'Ditolak') statusBorderColor = 'border-l-rose-500';

                return (
                  <div
                    key={loan.id}
                    onClick={() => onOpenDetail(loan.id)}
                    className={`glass-card p-4 rounded-xl border-l-4 ${statusBorderColor} flex flex-col justify-between items-start gap-4 transition-all hover:bg-slate-900/40 border border-white/5 shadow cursor-pointer active:scale-[0.99]`}
                    id={`history-item-card-${loan.id}`}
                  >
                    <div className="w-full flex justify-between items-start gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-white tracking-tight">{loan.itemName}</h4>
                        <span className="text-[9px] font-mono text-indigo-400 mt-0.5 block bg-indigo-500/[0.04] w-max px-1.5 rounded border border-indigo-500/10">KODE UNIT: {loan.itemCode}</span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${statusStyles.bg} tracking-wide shrink-0`}>
                        {statusStyles.label}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-400 space-y-1.5 w-full border-t border-white/5 pt-3">
                      <p className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>Tanggal: <strong className="text-slate-200">{loan.date}</strong> | jam: <strong className="text-slate-200">{loan.timeSlot}</strong></span>
                      </p>
                      <p className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">Lokasi: <span className="text-slate-300">{loan.location}</span></span>
                      </p>
                      <p className="flex items-center gap-1.5 truncate">
                        <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">Kegiatan: <span className="text-slate-300">{loan.eventName}</span></span>
                      </p>
                    </div>

                    <div className="w-full text-right pt-1 mt-1 border-t border-white/5">
                      <span className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-0.5 cursor-pointer">
                        Lihat Detail
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* DETAIL MODAL / DRAWER SLIDE FROM RIGHT */}
      <AnimatePresence>
        {selectedLoanId && activeLoanDetails && (
          <div className="fixed inset-0 z-[1000] flex justify-end">
            
            {/* Drawer Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseDetail}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              id="drawer-backdrop"
            />

            {/* Sliding Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20, stiffness: 200 }}
              className="relative w-full max-w-md bg-slate-900 border-l border-white/10 h-full p-6 md:p-8 flex flex-col justify-between overflow-y-auto z-10 shadow-2xl"
              id="drawer-panel"
            >
              <div className="space-y-6">
                
                {/* Header block */}
                <div className="flex justify-between items-start border-b border-white/5 pb-4">
                  <div>
                    <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest">Detail Peminjaman Biro</span>
                    <h2 className="text-base font-extrabold text-white mt-1 leading-tight">{activeLoanDetails.itemName}</h2>
                    <p className="text-[10px] font-mono text-indigo-400 mt-1 uppercase">ID CODE: {activeLoanDetails.id} | UNIT: {activeLoanDetails.itemCode}</p>
                  </div>
                  <button
                    onClick={onCloseDetail}
                    className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all cursor-pointer"
                    id="btn-close-drawer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Status indicator badges */}
                <div className="flex justify-between items-center bg-slate-950/40 p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-slate-500 font-bold">STATUS TRANSAKSI</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${getStatusStyles(activeLoanDetails.status).bg}`}>
                    {getStatusStyles(activeLoanDetails.status).label}
                  </span>
                </div>

                {/* Section: Status Timeline Tracker (Live steps checker) */}
                <div className="space-y-4">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">TIMELINE FLOW STATUS</span>
                  
                  <div className="relative pl-6 space-y-4 text-xs" id="timeline-flow-drawer text-left">
                    {/* Vertical path */}
                    <div className="absolute left-2.5 top-2.5 bottom-2.5 w-px bg-slate-800" />

                    {/* Step 1: Diajukan */}
                    <div className="relative flex items-start gap-3">
                      <span className="absolute left-[-21px] w-4.5 h-4.5 rounded-full bg-indigo-600 border border-indigo-500 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                      <div>
                        <p className="font-bold text-white">Form Pengajuan Diajukan</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Senin, 19 Mei · 09:00 WIB</p>
                      </div>
                    </div>

                    {/* Step 2: Disetujui */}
                    <div className="relative flex items-start gap-3">
                      {activeLoanDetails.timelineStep >= 2 ? (
                        <span className="absolute left-[-21px] w-4.5 h-4.5 rounded-full bg-indigo-600 border border-indigo-500 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                      ) : (
                        <span className="absolute left-[-21px] w-4.5 h-4.5 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-600">2</span>
                      )}
                      <div>
                        <p className={`font-bold ${activeLoanDetails.timelineStep >= 2 ? 'text-white' : 'text-slate-600'}`}>
                          Verifikasi & Disetujui Admin
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {activeLoanDetails.timelineStep >= 2 ? 'Senin, 19 Mei · 10:30 WIB' : '(Menunggu approve)'}
                        </p>
                      </div>
                    </div>

                    {/* Step 3: Dipinjam */}
                    <div className="relative flex items-start gap-3">
                      {activeLoanDetails.timelineStep >= 3 ? (
                        <span className="absolute left-[-21px] w-4.5 h-4.5 rounded-full bg-indigo-600 border border-indigo-500 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                      ) : (
                        <span className="absolute left-[-21px] w-4.5 h-4.5 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-600">3</span>
                      )}
                      <div>
                        <p className={`font-bold ${activeLoanDetails.timelineStep >= 3 ? 'text-white' : 'text-slate-600'}`}>
                          Unit InFocus Diserahkan (Sedang Dipinjam)
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {activeLoanDetails.timelineStep >= 3 ? 'Selasa, 20 Mei · 08:00 WIB' : '(Belum diserahkan)'}
                        </p>
                      </div>
                    </div>

                    {/* Step 4: Selesai */}
                    <div className="relative flex items-start gap-3">
                      {activeLoanDetails.timelineStep >= 4 ? (
                        <span className="absolute left-[-21px] w-4.5 h-4.5 rounded-full bg-indigo-600 border border-indigo-500 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                      ) : (
                        <span className="absolute left-[-21px] w-4.5 h-4.5 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-600">4</span>
                      )}
                      <div>
                        <p className={`font-bold ${activeLoanDetails.timelineStep >= 4 ? 'text-white' : 'text-slate-600'}`}>
                          Selesai & Dikembalikan
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {activeLoanDetails.timelineStep >= 4 && activeLoanDetails.status === 'Selesai' ? 'Kamis, 22 Mei · 11:45 WIB' : '(Belum selesai)'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section: Info Peminjaman table details */}
                <div className="space-y-3.5 pt-4">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">INFORMASI PENGAJUAN</span>
                  
                  <div className="bg-slate-950/60 rounded-xl border border-white/5 text-[11px] p-4 space-y-2.5 divide-y divide-white/5" id="drawer-details">
                    <div className="pt-0 flex justify-between">
                      <span className="text-slate-500 font-medium">Nama Mahasiswa</span>
                      <span className="font-bold text-white">{activeLoanDetails.studentName}</span>
                    </div>
                    <div className="pt-2 flex justify-between">
                      <span className="text-slate-500 font-medium">NIM (Identitas)</span>
                      <strong className="font-mono text-slate-300">{activeLoanDetails.nim}</strong>
                    </div>
                    <div className="pt-2 flex justify-between">
                      <span className="text-slate-500 font-medium">Waktu Agenda</span>
                      <span className="font-semibold text-indigo-300">{activeLoanDetails.date} | {activeLoanDetails.timeSlot}</span>
                    </div>
                    <div className="pt-2 flex flex-col gap-1">
                      <span className="text-slate-500 font-medium">Kegiatan / Agenda</span>
                      <span className="font-semibold text-slate-200">{activeLoanDetails.eventName}</span>
                    </div>
                    <div className="pt-2 flex flex-col gap-1">
                      <span className="text-slate-500 font-medium">Lokasi Ruangan</span>
                      <span className="font-semibold text-slate-200">{activeLoanDetails.location}</span>
                    </div>
                    {activeLoanDetails.notes && (
                      <div className="pt-2 flex flex-col gap-1">
                        <span className="text-slate-500 font-medium font-semibold">Tanggapan / Catatan</span>
                        <span className="italic text-slate-400 font-medium">{"\"" + activeLoanDetails.notes + "\""}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* PENALTY WARNING IF ANY */}
                {activeLoanDetails.status === 'Terlambat' && (
                  <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 rounded-xl flex items-start gap-2">
                    <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-rose-400">Peringatan Keterlambatan!</p>
                      <p className="text-[10px] text-rose-400/80 mt-1">Anda terlambat mengembalikan Unit InFocus ini. Akun peminjaman Anda diblokir sementara sampai denda selesai.</p>
                    </div>
                  </div>
                )}

              </div>

              {/* PDF Tiket download button */}
              <div className="pt-6 border-t border-white/5" id="drawer-footer">
                <button
                  onClick={() => handleDownloadTicket(activeLoanDetails.id)}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  id="btn-download-ticket"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Bukti Peminjaman</span>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
