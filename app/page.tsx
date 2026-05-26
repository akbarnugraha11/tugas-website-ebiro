'use client';

import { useState } from 'react';
import { useEPinjam, Role } from '@/lib/state-context';
import Sidebar from '@/components/sidebar';
import LoginView from '@/components/login-view';
import StudentDashboard from '@/components/student-dashboard';
import AdminDashboard from '@/components/admin-dashboard';
import BookingForm from '@/components/booking-form';
import HistoryView from '@/components/history-view';
import InventoryView from '@/components/inventory-view';
import ToastContainer from '@/components/toast-container';
import { 
  StudentProfileView, 
  StudentAvailableCalendarView,
  AdminUsersView,
  AdminReportsView,
  AdminSettingsView 
} from '@/components/additional-views';
import { Bell, Moon, Sun, Projector, User, LogOut } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';

export default function Page() {
  const { 
    currentUser, 
    activeRole, 
    currentTab, 
    setCurrentTab, 
    isLoggedIn, 
    logout,
    loans,
    addToast
  } = useEPinjam();

  // Selected historic loan ID (synchronized across student dashboard and details drawers)
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  
  // Simulated dark / light UI mode
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Notifications dropdown simulation
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  // If the user is not authenticated, load PAGE 1: LOGIN split-screen
  if (!isLoggedIn || !currentUser) {
    return (
      <>
        <LoginView />
        <ToastContainer />
      </>
    );
  }

  // Admin and student notifications log trigger
  const mockNotifications = activeRole === 'admin' 
    ? [
        { id: '1', text: 'Agus Hermawan mengajukan booking INF-002', time: '10m lalu' },
        { id: '2', text: 'Stok InFocus BenQ MX550 diset ke Maintenance', time: '1j lalu' }
      ]
    : [
        { id: '1', text: 'Peminjaman INF-001 Anda disetujui untuk besok', time: '30m lalu' },
        { id: '2', text: 'Sistem mengenakan denda penalti Budi jika telat', time: '3j lalu' }
      ];

  const handleToggleNotifDropdown = () => {
    setNotifDropdownOpen(!notifDropdownOpen);
  };

  const clearNotifications = () => {
    addToast('Seluruh notifikasi berhasil ditandai telah dibaca.', 'success');
    setNotifDropdownOpen(false);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
    }`} id="main-scaffolding">
      
      {/* BACKGROUND DECORATIVE GLOW SPHERE FOR GLASSY LOOK */}
      <div className="fixed top-[15%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-indigo-600/5 blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[15%] right-[20%] w-[30vw] h-[30vw] rounded-full bg-teal-500/5 blur-[120px] pointer-events-none z-0" />

      {/* RENDER TOAST ALERTS OVERLAY */}
      <ToastContainer />

      {/* MASTER SIDEBAR COMPONENT */}
      <Sidebar />

      {/* MAIN CONTENT PORTAL EXCLUDING FIXED SIDEBAR RANGE (240px) */}
      <div className="md:pl-60 min-h-screen pb-20 md:pb-8 flex flex-col relative z-20" id="content-container-outer">
        
        {/* TOP COHESIVE HEADER BAR */}
        <header className="sticky top-0 z-30 h-16 bg-slate-950/40 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 md:px-8" id="top-header-bar">
          
          {/* Dynamic screen Title */}
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-400 bg-indigo-500/5 py-1 px-3 rounded-full border border-indigo-500/10">
              {activeRole === 'mahasiswa' ? 'Portal Mahasiswa' : 'Sistem Biro Sarpras'}
            </span>
            <div className="h-4 w-px bg-slate-800 hidden sm:block" />
            <h2 className="text-sm font-bold text-white hidden sm:block">
              {currentTab}
            </h2>
          </div>

          {/* Quick actions: Notifications, user info */}
          <div className="flex items-center gap-4" id="header-right-actions">
            
            {/* Quick Dark Mode indicator toggle */}
            <motion.button
              whileTap={{ scale: 0.88 }}
              whileHover={{ scale: 1.08 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18 }}
              onClick={() => {
                setIsDarkMode(!isDarkMode);
                addToast(`Mencoba mengubah preferensi kecerahan tampilan layar.`, 'success');
              }}
              className="p-2 rounded-xl bg-slate-900/60 border border-white/5 hover:border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer btn-press-flash"
              title="Toggle View Mode"
              id="btn-toggle-darkmode"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </motion.button>

            {/* Notification bell trigger with unread badge */}
            <div className="relative">
              <motion.button
                whileTap={{ scale: 0.88 }}
                whileHover={{ scale: 1.08 }}
                transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                onClick={handleToggleNotifDropdown}
                className="p-2 rounded-xl bg-slate-900/60 border border-white/5 hover:border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer relative btn-press-flash"
                id="btn-bell-notif"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-slate-950 animate-bounce" />
              </motion.button>

              {/* Notification card panel dropdown dropdown list */}
              <AnimatePresence>
                {notifDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    className="absolute right-0 mt-3 w-72 custom-glassmorphism bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-4 divide-y divide-white/5 space-y-3 z-50 text-xs" 
                    id="notifications-panel-list"
                  >
                    <div className="flex justify-between items-center pb-1">
                      <span className="font-extrabold text-white">Notifikasi Baru</span>
                      <button 
                        onClick={clearNotifications}
                        className="text-[10px] text-indigo-400 font-bold hover:underline"
                      >
                        Baca Semua
                      </button>
                    </div>
                    <div className="space-y-3 pt-2">
                      {mockNotifications.map((notif, idx) => (
                        <motion.div
                          key={notif.id}
                          initial={{ opacity: 0, x: 12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.06, duration: 0.25 }}
                          className="flex flex-col gap-0.5"
                          id={`notif-item-${notif.id}`}
                        >
                          <p className="text-slate-200 leading-tight font-medium">{notif.text}</p>
                          <span className="text-[9px] font-mono text-slate-500 mt-0.5">{notif.time}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick User Avatar segment */}
            <div className="flex items-center gap-2.5 bg-slate-950/60 pl-2.5 pr-3 py-1.5 rounded-xl border border-white/5" id="header-user-badge">
              <div className="relative w-7 h-7 rounded-full overflow-hidden border border-indigo-500/20">
                <Image 
                  src={currentUser.avatarUrl} 
                  alt={currentUser.name} 
                  fill 
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="hidden lg:flex flex-col items-start min-w-[70px]">
                <span className="text-[10px] font-bold text-white max-w-[90px] truncate leading-none">{currentUser.name}</span>
                <span className="text-[8px] font-mono text-slate-500 leading-none mt-1">{currentUser.nimOrId}</span>
              </div>
            </div>

          </div>
        </header>

        {/* CONTAINER WORKSPACE FOR CORE GRAPHICS AND VIEWS */}
        <main className="flex-1 p-6 md:p-8" id="view-viewport-main">
          <AnimatePresence mode="wait" initial={false}>

            {/* STUDENT AREA ROUTING VIEWS */}
            {activeRole === 'mahasiswa' && (
              <motion.div
                key={`mhs-${currentTab}`}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                id="mhs-routing-viewport"
              >
                {currentTab === 'Dashboard' && (
                  <StudentDashboard 
                    onOpenDetail={(loanId) => {
                      setSelectedLoanId(loanId);
                      setCurrentTab('Riwayat Pinjaman');
                    }} 
                  />
                )}
                {currentTab === 'Buat Peminjaman' && (
                  <BookingForm />
                )}
                {currentTab === 'Riwayat Pinjaman' && (
                  <HistoryView 
                    selectedLoanId={selectedLoanId} 
                    onCloseDetail={() => setSelectedLoanId(null)}
                    onOpenDetail={(id) => setSelectedLoanId(id)}
                  />
                )}
                {currentTab === 'Jadwal Tersedia' && (
                  <StudentAvailableCalendarView />
                )}
                {currentTab === 'Profil Saya' && (
                  <StudentProfileView />
                )}
              </motion.div>
            )}

            {/* ADMIN AREA ROUTING VIEWS */}
            {activeRole === 'admin' && (
              <motion.div
                key={`admin-${currentTab}`}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                id="admin-routing-viewport"
              >
                {currentTab === 'Dashboard' && (
                  <AdminDashboard />
                )}
                {currentTab === 'Kelola Pengajuan' && (
                  <AdminDashboard />
                )}
                {currentTab === 'Kelola Inventaris' && (
                  <InventoryView />
                )}
                {currentTab === 'Kelola Pengguna' && (
                  <AdminUsersView />
                )}
                {currentTab === 'Laporan & Statistik' && (
                  <AdminReportsView />
                )}
                {currentTab === 'Pengaturan' && (
                  <AdminSettingsView />
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </main>

      </div>
    </div>
  );
}
