'use client';

import { useState, useEffect } from 'react';
import { useEPinjam, Barang, Loan } from '@/lib/state-context';
import { getStatusStyles } from '@/lib/utils';
import { 
  Monitor, 
  Tv, 
  Laptop, 
  Wrench, 
  Check, 
  Calendar, 
  Clock, 
  Info, 
  FileText, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight, 
  Map
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function BookingForm() {
  const { 
    currentUser, 
    barangList, 
    loans, 
    createBooking, 
    addToast 
  } = useEPinjam();

  const [step, setStep] = useState(1);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('2026-05-25');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [bookingDuration, setBookingDuration] = useState<string>('2 Jam');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lockingLog, setLockingLog] = useState('');
  
  // Form fields
  const [eventName, setEventName] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Success screen state
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [newBookingId, setNewBookingId] = useState('');

  // Check if there was any pre-selected slot from Dashboard click
  useEffect(() => {
    const preSlot = sessionStorage.getItem('pre_selected_slot');
    const preDate = sessionStorage.getItem('pre_selected_date');
    const preItem = sessionStorage.getItem('pre_selected_item_id');
    
    if (preItem || (preSlot && preDate)) {
      setTimeout(() => {
        if (preItem) {
          setSelectedItemId(preItem);
          sessionStorage.removeItem('pre_selected_item_id');
        }
        if (preSlot && preDate) {
          setSelectedDate(preDate);
          setSelectedTimeSlot(preSlot);
          if (preItem) {
            setStep(3); // Jump straight to detail keperluan because all are preset!
          } else {
            setStep(2); // Jump to schedule selection
          }
          sessionStorage.removeItem('pre_selected_slot');
          sessionStorage.removeItem('pre_selected_date');
        }
      }, 0);
    }
  }, []);

  const selectedItem = barangList.find(b => b.id === selectedItemId);

  // Active dates for custom calendar (Current Month: May 2026)
  const calendarDays = [
    { num: 24, day: 'Min', label: '2026-05-24', available: true },
    { num: 25, day: 'Sen', label: '2026-05-25', available: true },
    { num: 26, day: 'Sel', label: '2026-05-26', available: true },
    { num: 27, day: 'Rab', label: '2026-05-27', available: true },
    { num: 28, day: 'Kam', label: '2026-05-28', available: true },
    { num: 29, day: 'Jum', label: '2026-05-29', available: true },
    { num: 30, day: 'Sab', label: '2026-05-30', available: true },
  ];

  // Specific slots list (07:00 to 17:00)
  const allTimeSlots = [
    '07:00 - 09:00',
    '09:00 - 11:00',
    '11:00 - 13:00',
    '13:00 - 15:00',
    '15:00 - 17:00'
  ];

  // Checks if the chosen item is booked on the chosen date at the chosen timeslot (Bentrok)
  const isSlotConflict = () => {
    if (!selectedItemId || !selectedTimeSlot) return false;
    return loans.some(loan => 
      loan.itemId === selectedItemId && 
      loan.date === selectedDate && 
      loan.timeSlot.includes(selectedTimeSlot) &&
      (loan.status === 'Disetujui' || loan.status === 'Dipinjam' || loan.status === 'Menunggu')
    );
  };

  // Check if Budi has overdue items (NIM 22019904 has active "Dipinjam" / "Terlambat" is active)
  const hasPenaltyArrears = () => {
    // If user's name is Budi and selects Epson (INF-001) while having some specific mock data active
    return currentUser?.nimOrId === '22019904' && loans.some(l => l.status === 'Terlambat');
  };

  // Navigations
  const handleNext = () => {
    if (step === 1) {
      if (!selectedItemId) {
        addToast('Silakan pilih salah satu proyektor terlebih dahulu.', 'warning');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!selectedTimeSlot) {
        addToast('Silakan pilih jam peminjaman yang tersedia.', 'warning');
        return;
      }
      if (isSlotConflict()) {
        addToast('Gagal: Jadwal tersebut sudah dibooking. Silakan pilih waktu lain.', 'error');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!eventName.trim()) {
        addToast('Nama kegiatan wajib diisi.', 'warning');
        return;
      }
      if (!location.trim()) {
        addToast('Lokasi penggunaan wajib diisi.', 'warning');
        return;
      }
      if (!termsAccepted) {
        addToast('Anda wajib menyetujui syarat & ketentuan peminjaman.', 'warning');
        return;
      }
      if (hasPenaltyArrears()) {
        addToast('Pengajuan ditolak secara otomatis karena Anda memiliki tunggakan denda.', 'error');
        return;
      }
      setStep(4);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId || !selectedTimeSlot || !eventName || !location) {
      addToast('Data peminjaman tidak lengkap!', 'error');
      return;
    }

    setIsSubmitting(true);
    setLockingLog('Menghubungkan ke secure server...');

    setTimeout(() => {
      setLockingLog('Mengecek status ketersediaan proyektor aktif...');
    }, 350);

    setTimeout(() => {
      setLockingLog('Mengunci baris slot (Optimistic Lock) untuk mencegah balapan booking...');
    }, 700);

    setTimeout(() => {
      const isConflict = loans.some(loan => 
        loan.itemId === selectedItemId && 
        loan.date === selectedDate && 
        loan.timeSlot.includes(selectedTimeSlot) &&
        (loan.status === 'Disetujui' || loan.status === 'Dipinjam' || loan.status === 'Menunggu')
      );

      if (isConflict) {
        addToast('Gagal: Slot baru saja dikunci oleh mahasiswa lain! Silakan pilih slot lainnya.', 'error');
        setIsSubmitting(false);
        setLockingLog('');
        return;
      }

      const payload = {
        nim: currentUser?.nimOrId || '22019904',
        itemId: selectedItemId,
        itemName: selectedItem?.name || '',
        itemCode: selectedItem?.code || '',
        eventName,
        location,
        notes,
        date: selectedDate,
        timeSlot: `${selectedTimeSlot} [${bookingDuration}]`,
        bookingDuration,
      };

      const id = createBooking(payload);
      setIsSubmitting(false);
      setLockingLog('');

      if (id) {
        setNewBookingId(id);
        setBookingSubmitted(true);
      }
    }, 1200);
  };

  // Load appropriate Lucide Icon dynamically
  const renderItemIcon = (iconName: string) => {
    switch (iconName) {
      case 'Tv': return <Tv className="w-8 h-8 text-indigo-400" />;
      case 'Laptop': return <Laptop className="w-8 h-8 text-indigo-400" />;
      case 'Wrench': return <Wrench className="w-8 h-8 text-indigo-400" />;
      default: return <Monitor className="w-8 h-8 text-indigo-400" />;
    }
  };

  // Render checkmark icon on step headers
  const renderStepNumber = (stepNum: number) => {
    if (step > stepNum) {
      return (
        <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold border border-indigo-500">
          <Check className="w-3.5 h-3.5" />
        </span>
      );
    }
    return (
      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${
        step === stepNum 
          ? 'bg-indigo-600 text-white border-indigo-500' 
          : 'bg-slate-950 text-slate-500 border-slate-800'
      }`}>
        {stepNum}
      </span>
    );
  };

  if (bookingSubmitted) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center" id="booking-success-viewport">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="glass-card p-10 rounded-2xl border border-indigo-500/20 text-center space-y-6 relative overflow-hidden"
        >
          {/* Confetti Background Glimmer */}
          <div className="absolute inset-x-0 -top-40 h-80 bg-gradient-to-b from-indigo-500/10 to-transparent blur-3xl pointer-events-none" />
          
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-10 h-10 animate-bounce" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Pengajuan Berhasil Dikirim!</h2>
            <p className="text-sm text-slate-300">ID Kode Form: <span className="font-mono text-indigo-400 font-bold">{newBookingId}</span></p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed pt-2">
              Permohonan peminjaman proyektor Anda telah direkam ke antrean biro kampus. Menunggu persetujuan admin biro dalam kurun waktu 1x24 jam.
            </p>
          </div>

          {/* Quick status summary */}
          <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5 text-left text-xs text-slate-300 divide-y divide-white/5">
            <div className="pb-2.5 flex justify-between">
              <span className="text-slate-500">Unit Terpilih</span>
              <span className="font-semibold text-white">{selectedItem?.name} ({selectedItem?.code})</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500">Jadwal Ditentukan</span>
              <span className="font-semibold text-indigo-400">
                {selectedDate === '2026-05-23' ? 'Hari Ini' : selectedDate} | {selectedTimeSlot}
              </span>
            </div>
            <div className="pt-2.5 flex justify-between">
              <span className="text-slate-500">Nama Kegiatan</span>
              <span className="font-semibold text-white truncate max-w-[200px]">{eventName}</span>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={() => {
                // Refresh window to re-route or setTab to Riwayat
                setLocation('');
                setEventName('');
                setNotes('');
                setTermsAccepted(false);
                setSelectedItemId(null);
                setSelectedTimeSlot(null);
                setStep(1);
                setBookingSubmitted(false);
                // Redirect user to history
                const { useEPinjam: ref } = require('@/lib/state-context');
                window.location.hash = '#riwayat'; // Simulates
                window.dispatchEvent(new HashChangeEvent('hashchange'));
                // Trigger state redirect natively
                const ctx = document.getElementById('toast-wrapper');
                // Accessing Context programmatically via clicking element is standard in multi-view components
                const mhsHistTab = document.getElementById('nav-riwayat-pinjaman');
                if (mhsHistTab) mhsHistTab.click();
              }}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md active:scale-95 transition-all cursor-pointer"
              id="success-btn-redirect"
            >
              Lihat Status Pengajuan
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6" id="booking-form-wrapper">
      
      {/* 4-Step Progress indicator */}
      <div className="glass-card p-4 rounded-xl flex items-center justify-between" id="progress-indicator">
        <div className="flex items-center gap-1.5 md:gap-3 flex-1 justify-between text-[11px] md:text-xs">
          <div className="flex items-center gap-2">
            {renderStepNumber(1)}
            <span className={`font-medium ${step === 1 ? 'text-indigo-400' : 'text-slate-400'}`}>Pilih Barang</span>
          </div>
          <div className="h-px bg-slate-800 flex-1 mx-2" />

          <div className="flex items-center gap-2">
            {renderStepNumber(2)}
            <span className={`font-medium ${step === 2 ? 'text-indigo-400' : 'text-slate-400'}`}>Jadwal</span>
          </div>
          <div className="h-px bg-slate-800 flex-1 mx-2" />

          <div className="flex items-center gap-2">
            {renderStepNumber(3)}
            <span className={`font-medium ${step === 3 ? 'text-indigo-400' : 'text-slate-400'}`}>Detail Keperluan</span>
          </div>
          <div className="h-px bg-slate-800 flex-1 mx-2" />

          <div className="flex items-center gap-2">
            {renderStepNumber(4)}
            <span className={`font-medium ${step === 4 ? 'text-indigo-400' : 'text-slate-400'}`}>Konfirmasi</span>
          </div>
        </div>
      </div>

      {/* STEP CONTAINER CARD */}
      <div className="glass-card p-6 md:p-8 rounded-2xl border border-white/5 relative overflow-hidden" id="wizard-body">
        
        {isSubmitting && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center z-50 p-6 text-center animate-fade-in" id="optimistic-locking-overlay">
            <div className="relative w-16 h-16 mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-white/5 border-t-indigo-500 animate-spin" />
              <div className="absolute inset-2 rounded-full border-4 border-white/5 border-b-emerald-400 animate-pulse" />
            </div>
            <h4 className="text-white text-sm font-bold tracking-wide">Proses Transaksi Aman</h4>
            <p className="text-slate-400 text-xs max-w-sm mt-1.5 mb-5 leading-relaxed">
              Meminta token transaksi, memeriksa status bentrok waktu proyektor (race conditions), serta menerapkan Optimistic Locking...
            </p>
            <div className="bg-slate-900/80 px-4 py-2.5 rounded-xl border border-white/5 shadow-inner">
              <p className="text-[10px] font-mono text-emerald-400 flex items-center gap-1.5 justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>{lockingLog}</span>
              </p>
            </div>
          </div>
        )}

        {/* STEP 1: PILIH BARANG */}
        {step === 1 && (
          <div className="space-y-5" id="step-1-content">
            <div className="border-b border-white/5 pb-3">
              <h3 className="text-base font-bold text-white">Langkah 1 — Pilih Unit Proyektor</h3>
              <p className="text-slate-400 text-xs mt-0.5">Silakan pilih unit proyektor (InFocus) yang aktif dan berstatus tersedia.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="item-select-grid">
              {barangList
                .filter(b => b.active)
                .map((barang) => {
                  const isSelected = selectedItemId === barang.id;
                  const isDisabled = barang.status !== 'Tersedia';

                  return (
                    <button
                      key={barang.id}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => setSelectedItemId(barang.id)}
                      className={`p-4 rounded-xl border text-left flex gap-4 transition-all relative cursor-pointer ${
                        isDisabled
                          ? 'border-slate-900 bg-slate-950/60 opacity-40 cursor-not-allowed'
                          : isSelected
                          ? 'bg-indigo-950/30 border-indigo-500 shadow-md shadow-indigo-500/5'
                          : 'bg-slate-950/10 border-white/5 hover:border-slate-800 hover:bg-slate-950/30'
                      }`}
                      id={`select-barang-card-${barang.id}`}
                    >
                      <div className={`p-2.5 h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                        isSelected 
                          ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400' 
                          : 'bg-white/5 border-white/10 text-slate-400'
                      }`}>
                        {renderItemIcon(barang.imageIcon)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-1">
                          <h4 className="text-xs font-bold text-white truncate">{barang.name}</h4>
                          <span className="text-[9px] font-mono font-semibold text-indigo-300 ml-1">
                            {barang.code}
                          </span>
                        </div>

                        {/* Condition & Status badges */}
                        <div className="flex gap-2 mt-2 items-center">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium border ${
                            barang.kondisi === 'Baik' 
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/10' 
                              : 'bg-amber-500/15 text-amber-400 border-amber-500/10'
                          }`}>
                            Let: {barang.kondisi}
                          </span>

                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                            barang.status === 'Tersedia' 
                              ? 'bg-emerald-500/10 text-emerald-400' 
                              : ''
                          }`}>
                            {barang.status}
                          </span>
                        </div>

                        <p className="text-[10px] text-slate-500 mt-2">Pernah digunakan: {barang.totalBorrow} kali</p>
                      </div>

                      {/* Select indicator */}
                      {!isDisabled && (
                        <div className={`absolute top-3 right-3 w-4.5 h-4.5 rounded-full flex items-center justify-center border text-white ${
                          isSelected ? 'bg-indigo-600 border-indigo-500' : 'border-slate-800 bg-transparent'
                        }`}>
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      )}
                    </button>
                  );
                })}
            </div>
          </div>
        )}

        {/* STEP 2: PILIH JADWAL */}
        {step === 2 && (
          <div className="space-y-5" id="step-2-content">
            <div className="border-b border-white/5 pb-3">
              <h3 className="text-base font-bold text-white">Langkah 2 — Atur Hari & Jam Booking</h3>
              <p className="text-slate-400 text-xs mt-0.5">Reservasi untuk proyektor <span className="text-indigo-400 font-bold">{selectedItem?.name} ({selectedItem?.code})</span>.</p>
            </div>

            {/* Custom mini calendar selector */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Pilih Tanggal Borrows:
              </span>
              <div className="grid grid-cols-7 gap-2" id="calendar-days-select">
                {calendarDays.map((day) => {
                  const isSelected = selectedDate === day.label;
                  return (
                    <button
                      key={day.label}
                      type="button"
                      onClick={() => {
                        setSelectedDate(day.label);
                        setSelectedTimeSlot(null); // Clear selected slot to avoid leftovers
                      }}
                      className={`py-2 rounded-xl text-center border transition-all cursor-pointer flex flex-col items-center justify-center ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-500 text-white font-bold shadow'
                          : 'bg-slate-950/20 border-white/5 text-slate-400 hover:border-slate-800'
                      }`}
                      id={`calendar-btn-day-${day.num}`}
                    >
                      <span className="text-[9px] uppercase font-semibold text-slate-500">{day.day}</span>
                      <span className="text-xs mt-0.5 font-extrabold">{day.num}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Timetable slots */}
            <div className="space-y-2.5">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Pilih Jam Tersedia:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2" id="hourly-timetable-select">
                {allTimeSlots.map((slot) => {
                  // Check schedule overlap for this slot
                  const itemConflict = loans.some(loan => 
                    loan.itemId === selectedItemId && 
                    loan.date === selectedDate && 
                    loan.timeSlot.includes(slot) &&
                    (loan.status === 'Disetujui' || loan.status === 'Dipinjam' || loan.status === 'Menunggu')
                  );
                  const isSelected = selectedTimeSlot === slot;

                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={itemConflict}
                      onClick={() => setSelectedTimeSlot(slot)}
                      className={`py-2 px-3 rounded-lg border text-xs font-semibold text-left transition-all cursor-pointer flex items-center justify-between ${
                        itemConflict
                          ? 'bg-slate-950/60 border-slate-900 text-slate-600 line-through cursor-not-allowed'
                          : isSelected
                          ? 'bg-indigo-600 border-indigo-500 text-white font-bold'
                          : 'bg-slate-950/10 border-white/5 text-slate-300 hover:border-slate-800 hover:bg-slate-950/30'
                      }`}
                      id={`booking-slot-${slot.split(' ')[0]}`}
                    >
                      <span>{slot}</span>
                      {itemConflict ? (
                        <span className="text-[8px] bg-red-500/10 border border-red-500/20 text-red-400 px-1 rounded font-bold">Penuh</span>
                      ) : isSelected ? (
                        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Robust Duration Selector */}
            <div className="space-y-3 pt-4 border-t border-white/5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Pilih Durasi Peminjaman:
                </span>
                <span className="text-[10px] text-indigo-400 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 font-mono">
                  Maks. 14 Hari di Depan
                </span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" id="duration-selection-grid">
                {['1 Jam', '2 Jam', 'Setengah Hari', 'Full Day'].map((dur) => {
                  const isActive = bookingDuration === dur;
                  return (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setBookingDuration(dur)}
                      className={`py-2 px-3 text-[11px] font-bold rounded-xl border text-center transition-all cursor-pointer ${
                        isActive
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow shadow-indigo-600/20'
                          : 'bg-slate-950/10 border-white/5 text-slate-400 hover:border-slate-800'
                      }`}
                      id={`btn-dur-${dur.replace(' ', '-')}`}
                    >
                      {dur}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-500 leading-normal">
                Batas maksimum pinjam mandiri reguler mahasiswa adalah <strong>Full Day</strong> pelajaran. Segala bentuk perpanjangan wajib menyertakan alasan yang logis kepada BAAK Kampus. Jadwal aktif dirilis maksimal 14 hari ke depan.
              </p>
            </div>

            {/* Quick summary line of schedule */}
            {selectedTimeSlot && (
              <div className="p-3.5 bg-indigo-950/20 border border-indigo-500/10 rounded-xl" id="schedule-quick-line">
                <p className="text-xs text-indigo-300 font-semibold flex items-center gap-1.5 justify-center">
                  <span>📅 Terjadwal:</span>
                  <span>{selectedDate === '2026-05-23' ? 'Hari Ini (Sabtu, 23 Mei)' : selectedDate} | {selectedTimeSlot} ({bookingDuration})</span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: DETAIL KEPERLUAN */}
        {step === 3 && (
          <div className="space-y-5" id="step-3-content">
            <div className="border-b border-white/5 pb-3">
              <h3 className="text-base font-bold text-white">Langkah 3 — Pengisian Detail Keperluan</h3>
              <p className="text-slate-400 text-xs mt-0.5">Tulis detail pemakaian untuk validasi admin sarana prasarana.</p>
            </div>

            {/* BANNER WARNING PENALTY - RED IF ARREARS */}
            {hasPenaltyArrears() && (
              <div className="p-4 bg-rose-950/50 border border-rose-500/30 text-rose-300 rounded-xl flex gap-3 text-xs" id="penalty-alert">
                <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-extrabold text-rose-400">⚠ Anda Memiliki Tunggakan Aktif!</p>
                  <p className="text-[11px] text-rose-300/80 mt-1">
                    Menurut log biro, akun NIM Anda terblokir sementara karena terlambat mengembalikan InFocus pada sesi sebelumnya. Pengisian ini diblokir.
                  </p>
                </div>
              </div>
            )}

            {/* BANNER WARNING INTERFERENCE - ORANGE */}
            {isSlotConflict() && (
              <div className="p-4 bg-amber-950/50 border border-amber-500/30 text-amber-300 rounded-xl flex gap-3 text-xs" id="interference-alert">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <p className="font-extrabold text-amber-400">⚠ Jadwal Bentrok Dengan Pesanan Lain!</p>
                  <p className="text-[11px] text-amber-300/80 mt-1">
                    InFocus ini sudah dipesan di unit / waktu tersebut. Silakan klik tombol kembali dan pilih waktu lain atau pilih unit proyektor lain.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-4" id="form-inputs">
              <div>
                <label className="block text-slate-300 text-xs font-bold mb-2 uppercase tracking-wide">
                  Nama Kegiatan / Agenda Penggunaan (Required)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 pointer-events-none">
                    <FileText className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder="Contoh: Sidang Pleno BEM Fakultas / Kuliah Pengganti"
                    className="w-full glass-input pl-10 pr-4 py-3 rounded-xl text-xs"
                    id="input-booking-event"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-bold mb-2 uppercase tracking-wide">
                  Lokasi Pemakaian InFocus (Required)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 pointer-events-none">
                    <MapPin className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Contoh: Ruang Seminar 1, Gedung C Lantai 2"
                    className="w-full glass-input pl-10 pr-4 py-3 rounded-xl text-xs"
                    id="input-booking-location"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-bold mb-2 uppercase tracking-wide">
                  Keterangan Tambahan / Aksesoris (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Sangat butuh tambahan roll kabel atau pointer slide jika tersedia."
                  rows={3}
                  className="w-full glass-input px-4 py-3 rounded-xl text-xs border border-white/10"
                  id="textarea-booking-notes"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-2.5 text-slate-400 text-xs cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 rounded border border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                    id="checkbox-booking-terms"
                  />
                  <span>
                    Saya menyetujui <span className="text-indigo-400 font-semibold hover:underline">syarat & ketentuan peminjaman</span> biro, termasuk wajib mengembalikan barang tepat waktu dengan kondisi semula.
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: KONFIRMASI PEMINJAMAN */}
        {step === 4 && (
          <form onSubmit={handleSubmit} className="space-y-5" id="step-4-content">
            <div className="border-b border-white/5 pb-3">
              <h3 className="text-base font-bold text-white">Langkah 4 — Konfirmasi Detail Pengajuan</h3>
              <p className="text-slate-400 text-xs mt-0.5">Harap tinjau ringkasan pemesanan Anda sebelum mengirimkan form.</p>
            </div>

            {/* Summary details card */}
            <div className="bg-slate-950/60 rounded-xl border border-white/5 divide-y divide-white/5" id="confirm-summary-panel">
              <div className="p-4 flex gap-4 items-center">
                <div className="p-2 h-10 w-10 bg-indigo-600/20 rounded-lg flex items-center justify-center border border-indigo-500/20 text-indigo-400">
                  {renderItemIcon(selectedItem?.imageIcon || 'Monitor')}
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Barang Yang Dipilih</p>
                  <p className="text-sm font-bold text-white mt-0.5">{selectedItem?.name}</p>
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5">KODE UNIT: {selectedItem?.code}</p>
                </div>
              </div>

              <div className="p-4 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Hari / Tanggal</p>
                  <p className="font-bold text-white mt-1">{selectedDate}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Waktu Booking</p>
                  <p className="font-bold text-indigo-400 mt-1">{selectedTimeSlot}</p>
                </div>
              </div>

              <div className="p-4 space-y-3.5 text-xs">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Nama Kegiatan</p>
                  <p className="font-semibold text-white mt-1 text-[11px]">{eventName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Lokasi Penggunaan</p>
                  <p className="font-semibold text-slate-300 mt-1 text-[11px]">{location}</p>
                </div>
                {notes.trim() && (
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Keterangan Tambahan</p>
                    <p className="font-medium text-slate-400 mt-1 italic text-[11px]">{"\"" + notes + "\""}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 bg-indigo-950/10 border border-indigo-500/10 text-[10px] text-indigo-300 rounded-lg flex gap-1.5 items-center">
              <Info className="w-4 h-4 flex-shrink-0" />
              <span>Sistem akan mengirimkan notifikasi persetujuan instan beserta bukti voucher pinjam begitu Admin memproses form ini.</span>
            </div>
          </form>
        )}

        {/* BOTTOM WIZARD CONTROLS */}
        <div className="flex justify-between items-center mt-8 border-t border-white/5 pt-4" id="wizard-navigation-buttons">
          <button
            type="button"
            onClick={handleBack}
            className={`px-4 py-2 text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 transition-all cursor-pointer ${
              step === 1 ? 'opacity-0 pointer-events-none' : ''
            }`}
            id="btn-wizard-back"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Kembali</span>
          </button>

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow transition-all active:scale-95 cursor-pointer flex items-center gap-1"
              id="btn-wizard-next"
            >
              <span>Lanjutkan</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-green-600 text-white rounded-xl text-xs font-extrabold shadow transition-all active:scale-95 cursor-pointer"
              id="btn-wizard-submit"
            >
              Ajukan Peminjaman
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
