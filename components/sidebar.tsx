'use client';

import { useEPinjam, Role } from '@/lib/state-context';
import { 
  Home, 
  PlusCircle, 
  History, 
  Calendar, 
  User, 
  LogOut, 
  FolderLock, 
  Package, 
  Users, 
  BarChart3, 
  Settings, 
  Projector,
  Bell
} from 'lucide-react';
import Image from 'next/image';

export default function Sidebar() {
  const { 
    currentUser, 
    activeRole, 
    currentTab, 
    setCurrentTab, 
    logout,
    loans
  } = useEPinjam();

  if (!currentUser) return null;

  // Count pending applications for Admin badge
  const pendingCount = loans.filter(l => l.status === 'Menunggu').length;

  const studentMenuItems = [
    { name: 'Dashboard', icon: Home },
    { name: 'Buat Peminjaman', icon: PlusCircle },
    { name: 'Riwayat Pinjaman', icon: History },
    { name: 'Jadwal Tersedia', icon: Calendar },
    { name: 'Profil Saya', icon: User },
  ];

  const adminMenuItems = [
    { name: 'Dashboard', icon: Home },
    { name: 'Kelola Pengajuan', icon: FolderLock, badge: pendingCount > 0 ? pendingCount : undefined },
    { name: 'Kelola Inventaris', icon: Package },
    { name: 'Kelola Pengguna', icon: Users },
    { name: 'Laporan & Statistik', icon: BarChart3 },
    { name: 'Pengaturan', icon: Settings },
  ];

  const menuItems = (activeRole === 'admin' ? adminMenuItems : studentMenuItems) as { name: string; icon: any; badge?: any }[];

  return (
    <>
      {/* DESKTOP SIDEBAR - 240px wide */}
      <aside 
        className="hidden md:flex flex-col w-60 fixed top-0 bottom-0 left-0 bg-slate-900/60 border-r border-white/5 backdrop-blur-xl z-30 justify-between"
        id="desktop-sidebar"
      >
        <div className="flex flex-col pt-6 px-4">
          {/* Brand header */}
          <div className="flex items-center gap-2.5 px-3 mb-6" id="sidebar-logo-header">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/20 flex items-center justify-center">
              <Projector className="w-5 h-5 text-indigo-400" />
            </div>
            <span className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              E-PINJAM BIRO
            </span>
          </div>

          {/* User profile card */}
          <div className="flex items-center gap-3 p-3 bg-slate-950/40 rounded-xl border border-white/5 mb-6" id="sidebar-user-card">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-indigo-500/20">
              <Image 
                src={currentUser.avatarUrl} 
                alt={currentUser.name}
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-white truncate">{currentUser.name}</h4>
              <p className="text-[10px] font-mono text-slate-400 truncate">{currentUser.nimOrId}</p>
            </div>
          </div>

          {/* Menu items */}
          <span className="text-[10px] font-semibold text-slate-500 px-3 uppercase tracking-wider mb-2">MENU BIRO</span>
          <nav className="space-y-1.5" id="sidebar-navigation">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => setCurrentTab(item.name)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium tracking-wide transition-all duration-200 cursor-pointer ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10 border-indigo-500/30 font-semibold' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                  id={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="bg-amber-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full animate-bounce">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom logout block */}
        <div className="p-4" id="sidebar-footer">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 hover:border-rose-500/20 border border-transparent transition-all cursor-pointer"
            id="btn-logout"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Akun</span>
          </button>
        </div>
      </aside>

      {/* MOBILE COLLAPSIBLE BOTTOM NAV */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-950/90 backdrop-blur-md border-t border-white/5 px-2 py-1 flex justify-around items-center z-50 shadow-2xl"
        id="mobile-navigation"
      >
        {menuItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.name;
          return (
            <button
              key={item.name + '-mobile'}
              onClick={() => setCurrentTab(item.name)}
              className={`flex flex-col items-center justify-center p-1.5 rounded-lg transition-all flex-1 cursor-pointer relative ${
                isActive ? 'text-indigo-400 font-bold' : 'text-slate-500 hover:text-slate-300'
              }`}
              id={`nav-mob-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[9px] tracking-tight truncate max-w-[56px]">{item.name}</span>
              {item.badge !== undefined && (
                <span className="absolute top-0 right-4 bg-amber-500 text-slate-950 text-[8px] font-extrabold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
}
