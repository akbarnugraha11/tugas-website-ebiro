 'use client';

// import { getMongoClient } from '@/lib/mongoClient'; // Removed for client build
import { createContext, useState, useEffect, ReactNode, useContext } from 'react';

// Test MongoDB connection on app start
// MongoDB connection test moved into provider


export type Role = 'mahasiswa' | 'admin';

export type Status = 
  | 'Menunggu' 
  | 'Disetujui' 
  | 'Dipinjam' 
  | 'Selesai' 
  | 'Ditolak' 
  | 'Terlambat' 
  | 'Tersedia' 
  | 'Maintenance';

export type Kondisi = 'Baik' | 'Rusak Ringan' | 'Rusak Berat';

export interface User {
  nimOrId: string;
  name: string;
  role: Role;
  avatarUrl: string;
}

export interface RegisteredUser {
  nimOrId: string;
  name: string;
  role: Role;
  avatarUrl: string;
  password?: string;
  dept?: string;
  email?: string;
  phone?: string;
  active?: 'Aktif' | 'Ban';
  status?: 'Clear' | 'Penalti Aktif';
  borrowsCount?: number;
}

export interface Barang {
  id: string;
  name: string;
  code: string;
  status: 'Tersedia' | 'Maintenance' | 'Dipinjam';
  kondisi: Kondisi;
  totalBorrow: number;
  active: boolean;
  quantity: number;
  imageIcon: string; // lucide icon name placeholder like 'Projector'
  maintenanceSchedule?: string; // Date or description
  conditionLogs?: Array<{
    id: string;
    date: string;
    kondisi: Kondisi;
    notes: string;
    reporter: string;
  }>;
}

export interface Loan {
  id: string;
  nim: string;
  studentName: string;
  itemId: string;
  itemName: string;
  itemCode: string;
  eventName: string;
  location: string;
  notes?: string;
  date: string;
  timeSlot: string;
  status: Status;
  createdAt: string;
  timelineStep: number; // 1 = diajukan, 2 = disetujui, 3 = dipinjam, 4 = selesai/ditolak
  penaltiActive?: boolean;
  bookingDuration?: string; // '1 Jam' | '2 Jam' | 'Setengah Hari' | 'Full Day'
  extendRequest?: 'none' | 'pending' | 'approved' | 'rejected';
  extendHours?: string;
  extendReason?: string;
  cancelReason?: string;
  damageReported?: boolean;
  damageReportNotes?: string;
  damageReportedAt?: string;
  returnCondition?: Kondisi;
  returnNotes?: string;
}

export interface Announcement {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'info' | 'warning' | 'success';
}

export interface ActivityLog {
  id: string;
  type: 'approve' | 'reject' | 'penalty' | 'submit' | 'inventory';
  text: string;
  timestamp: string;
}

interface EPinjamContextType {
  // Authentication
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  activeRole: Role;
  setActiveRole: (role: Role) => void;
  isLoggedIn: boolean;
  registeredUsers: RegisteredUser[];
  setRegisteredUsers: React.Dispatch<React.SetStateAction<RegisteredUser[]>>;
  registerStudent: (user: { name: string; nimOrId: string; password?: string; dept?: string; email?: string; phone?: string }) => Promise<boolean>;
  toggleUserStatus: (nimOrId: string) => Promise<RegisteredUser | null>;
  clearUserPenalty: (nimOrId: string) => Promise<RegisteredUser | null>;
  deleteUser: (nimOrId: string) => Promise<boolean>;
  login: (nimOrId: string, password?: string, role?: Role) => boolean;
  logout: () => void;

  // Active Screen
  currentTab: string;
  setCurrentTab: (tab: string) => void;

  // Dynamic States
  barangList: Barang[];
  setBarangList: React.Dispatch<React.SetStateAction<Barang[]>>;
  loans: Loan[];
  setLoans: React.Dispatch<React.SetStateAction<Loan[]>>;
  announcements: Announcement[];
  activityLogs: ActivityLog[];
  addActivityLog: (text: string, type: ActivityLog['type']) => void;

  // Bookings
  createBooking: (booking: Omit<Loan, 'id' | 'createdAt' | 'status' | 'timelineStep' | 'studentName'>) => string;
  approveBooking: (id: string) => void;
  rejectBooking: (id: string, reason?: string) => void;
  updateInventoryItem: (item: Barang) => void;
  addInventoryItem: (item: Omit<Barang, 'id' | 'totalBorrow'>) => void;
  
  // Extend & Cancel robust actions
  cancelBooking: (id: string) => void;
  adminCancelBooking: (id: string, reason: string) => void;
  requestExtension: (id: string, hours: string, reason: string) => void;
  approveExtension: (id: string) => void;
  rejectExtension: (id: string) => void;
  reportDamage: (loanId: string, notes: string) => void;
  updateMaintenanceSchedule: (itemId: string, scheduleDate: string) => void;
  completeReturnWithCondition: (loanId: string, kondisi: Kondisi, notes: string) => void;

  // Toasts
  toasts: { id: string; type: 'success' | 'warning' | 'error'; message: string }[];
  addToast: (message: string, type: 'success' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
}

const EPinjamContext = createContext<EPinjamContextType | undefined>(undefined);

const INITIAL_BARANG: Barang[] = [
  { id: '1', name: 'InFocus Epson EB-X41', code: 'INF-001', status: 'Tersedia', kondisi: 'Baik', totalBorrow: 24, active: true, quantity: 1, imageIcon: 'Monitor' },
  { id: '2', name: 'InFocus Sony VPL-DX221', code: 'INF-002', status: 'Tersedia', kondisi: 'Baik', totalBorrow: 18, active: true, quantity: 1, imageIcon: 'Tv' },
  { id: '3', name: 'InFocus Panasonic PT-LB303', code: 'INF-003', status: 'Dipinjam', kondisi: 'Baik', totalBorrow: 31, active: true, quantity: 1, imageIcon: 'Laptop' },
  { id: '4', name: 'InFocus BenQ MX550', code: 'INF-004', status: 'Maintenance', kondisi: 'Rusak Ringan', totalBorrow: 12, active: true, quantity: 1, imageIcon: 'Wrench' },
  { id: '5', name: 'InFocus ViewSonic PA503W', code: 'INF-005', status: 'Tersedia', kondisi: 'Rusak Ringan', totalBorrow: 8, active: true, quantity: 1, imageIcon: 'Monitor' },
  { id: '6', name: 'InFocus Epson EB-W51', code: 'INF-006', status: 'Tersedia', kondisi: 'Baik', totalBorrow: 15, active: true, quantity: 1, imageIcon: 'Tv' },
];

const INITIAL_LOANS: Loan[] = [
  {
    id: 'L-101',
    nim: '22019904',
    studentName: 'Budi Santoso',
    itemId: '1',
    itemName: 'InFocus Epson EB-X41',
    itemCode: 'INF-001',
    eventName: 'Seminar Nasional Himpunan Teknik',
    location: 'Aula Gedung C Lantai 3',
    notes: 'Mohon dicek remote dan kabel HDMI pengganti.',
    date: '2026-05-24',
    timeSlot: '09:00 - 11:00',
    status: 'Disetujui',
    createdAt: '2026-05-22T08:30:00Z',
    timelineStep: 2,
  },
  {
    id: 'L-102',
    nim: '22019904',
    studentName: 'Budi Santoso',
    itemId: '3',
    itemName: 'InFocus Panasonic PT-LB303',
    itemCode: 'INF-003',
    eventName: 'Praktikum Jaringan Komputer II',
    location: 'Lab Komputer Baru',
    notes: 'Pinjam kabel VGA sekalian.',
    date: '2026-05-23',
    timeSlot: '13:00 - 15:00',
    status: 'Dipinjam',
    createdAt: '2026-05-23T07:15:00Z',
    timelineStep: 3,
  },
  {
    id: 'L-103',
    nim: '22019905',
    studentName: 'Siti Aminah',
    itemId: '4',
    itemName: 'InFocus BenQ MX550',
    itemCode: 'INF-004',
    eventName: 'Rapat Koordinasi BEM SF',
    location: 'Ruang Rapat Ormas',
    notes: 'Kondisi barang agak berdebu.',
    date: '2026-05-22',
    timeSlot: '10:00 - 12:00',
    status: 'Selesai',
    createdAt: '2026-05-22T09:00:00Z',
    timelineStep: 4,
  },
  {
    id: 'L-104',
    nim: '22019906',
    studentName: 'Agus Hermawan',
    itemId: '2',
    itemName: 'InFocus Sony VPL-DX221',
    itemCode: 'INF-002',
    eventName: 'Ujian Skripsi Tugas Akhir',
    location: 'Ruang Sidang Jurusan',
    notes: 'Digunakan oleh dosen penguji utama.',
    date: '2026-05-25',
    timeSlot: '08:00 - 10:00',
    status: 'Menunggu',
    createdAt: '2026-05-23T11:45:00Z',
    timelineStep: 1,
  },
  {
    id: 'L-105',
    nim: '22019907',
    studentName: 'Rina Widya',
    itemId: '6',
    itemName: 'InFocus Epson EB-W51',
    itemCode: 'INF-006',
    eventName: 'Colloquium Informatika',
    location: 'Ruang Seminar 2',
    notes: 'Dibutuhkan resolusi widescreen.',
    date: '2026-05-20',
    timeSlot: '15:00 - 17:00',
    status: 'Ditolak',
    createdAt: '2026-05-19T14:00:00Z',
    timelineStep: 4,
  },
];

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  { id: '1', title: 'Kebijakan Pengembalian Baru', description: 'Pengembalian projector yang melebihi batas waktu pinjam dikenakan denda pemblokiran akun selama 3 hari.', date: '21 Mei 2026', type: 'warning' },
  { id: '2', title: 'Penambahan Unit Epson Baru', description: 'Biro Kampus menambahkan 2 unit InFocus Epson resolusi FHD untuk keperluan ujian tesis & skripsi.', date: '18 Mei 2026', type: 'success' },
  { id: '3', title: 'Maintenance Rutin', description: 'Setiap hari Jumat pukul 16:30 seluruh unit ditarik untuk pembersihan filter dan pengecekan lampu optic.', date: '15 Mei 2026', type: 'info' }
];

const INITIAL_LOGS: ActivityLog[] = [
  { id: '1', type: 'submit', text: 'Agus Hermawan mengajukan peminjaman INF-002 untuk Sidang Jurusan', timestamp: '10 menit lalu' },
  { id: '2', type: 'approve', text: 'Peminjaman INF-001 disetujui untuk Kak Budi oleh Admin', timestamp: '30 menit lalu' },
  { id: '3', type: 'reject', text: 'Peminjaman Rina Widya ditolak karena jadwal bentrok', timestamp: '1 jam lalu' },
  { id: '4', type: 'penalty', text: 'Penalti peminjaman diberikan ke Budi Santoso karena keterlambatan', timestamp: '3 jam lalu' },
];

let globalIdCount = 9482;
function getUniqueId(prefix: string) {
  globalIdCount += 1;
  return `${prefix}-${globalIdCount}`;
}

export function EPinjamProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeRole, setActiveRole] = useState<Role>('mahasiswa');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentTab, setCurrentTab] = useState('Dashboard');
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  
  const [barangList, setBarangList] = useState<Barang[]>(INITIAL_BARANG);
  const [loans, setLoans] = useState<Loan[]>(INITIAL_LOANS);
  const [announcements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(INITIAL_LOGS);
  const [toasts, setToasts] = useState<{ id: string; type: 'success' | 'warning' | 'error'; message: string }[]>([]);

  // Load state from localStorage & MongoDB on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('epinjam_user');
    const savedRole = localStorage.getItem('epinjam_role');

    setTimeout(() => {
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
        setIsLoggedIn(true);
      }
      if (savedRole) {
        setActiveRole(savedRole as Role);
      }
    }, 0);

    // Async load all data from MongoDB API
    const loadAllFromDB = async () => {
      try {
        const [usersRes, barangRes, loansRes, logsRes] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/barang'),
          fetch('/api/loans'),
          fetch('/api/logs'),
        ]);

        if (usersRes.ok) {
          const data = await usersRes.json();
          if (data.users) setRegisteredUsers(data.users);
        }
        if (barangRes.ok) {
          const data = await barangRes.json();
          if (data.barang) setBarangList(data.barang);
        }
        if (loansRes.ok) {
          const data = await loansRes.json();
          if (data.loans) setLoans(data.loans);
        }
        if (logsRes.ok) {
          const data = await logsRes.json();
          if (data.logs) setActivityLogs(data.logs);
        }
      } catch (err) {
        console.error('Failed to load data from MongoDB:', err);
      }
    };
    loadAllFromDB();
  }, []);

  // Sync state changes to MongoDB in the background (fire-and-forget)
  const syncToMongo = (endpoint: string, payload: Record<string, any>) => {
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch((err) => console.error(`Failed to sync to ${endpoint}:`, err));
  };

  const saveToLocal = (key: string, data: any) => {
    // Sync to MongoDB based on key
    if (key === 'epinjam_barang') {
      syncToMongo('/api/barang', { barang: data });
    } else if (key === 'epinjam_loans') {
      syncToMongo('/api/loans', { loans: data });
    } else if (key === 'epinjam_logs') {
      syncToMongo('/api/logs', { logs: data });
    }
  };

  const addToast = (message: string, type: 'success' | 'warning' | 'error') => {
    const id = getUniqueId('toast');
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const registerStudent = async (user: { name: string; nimOrId: string; password?: string; dept?: string; email?: string; phone?: string }): Promise<boolean> => {
    const exists = registeredUsers.some(
      (u) => u.nimOrId.trim().toLowerCase() === user.nimOrId.trim().toLowerCase()
    );
    if (exists) {
      addToast('Gagal: NIM / ID Pengguna sudah terdaftar di sistem!', 'error');
      return false;
    }

    const newStudent: RegisteredUser = {
      nimOrId: user.nimOrId.trim(),
      name: user.name.trim(),
      role: 'mahasiswa',
      avatarUrl: `https://picsum.photos/seed/${user.nimOrId.trim()}/150/150`,
      password: user.password || 'biropinjam123',
      dept: user.dept || 'Informatika',
      email: user.email || `${user.nimOrId.trim()}@mhs.kampus.ac.id`,
      phone: user.phone || '+62 812-3456-7890',
      active: 'Aktif',
      status: 'Clear',
      borrowsCount: 0
    };

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudent),
      });

      if (!response.ok) {
        const errorData = await response.json();
        addToast(`Gagal: ${errorData.error || 'Terjadi kesalahan database'}`, 'error');
        return false;
      }

      const data = await response.json();
      const updated = [...registeredUsers, data.user];
      setRegisteredUsers(updated);

      addActivityLog(`Mahasiswa baru terdaftar: ${newStudent.name} (NIM: ${newStudent.nimOrId})`, 'submit');
      addToast('Pendaftaran akun kemahasiswaan E-Pinjam berhasil! Silakan masuk.', 'success');
      return true;
    } catch (err) {
      console.error('Error registering student:', err);
      addToast('Gagal mendaftar: Koneksi database bermasalah.', 'error');
      return false;
    }
  };

  const toggleUserStatus = async (userId: string): Promise<RegisteredUser | null> => {
    let targetUser: RegisteredUser | null = null;

    const updated = registeredUsers.map((u) => {
      if (u.nimOrId === userId) {
        const nextActive: 'Aktif' | 'Ban' = u.active === 'Aktif' ? 'Ban' : 'Aktif';
        targetUser = { ...u, active: nextActive };
        return targetUser;
      }
      return u;
    });

    if (!targetUser) return null;

    const finalUser = targetUser as RegisteredUser;
    setRegisteredUsers(updated);
    addToast(`Status ${finalUser.name} diubah menjadi ${finalUser.active}!`, finalUser.active === 'Ban' ? 'error' : 'success');

    try {
      const response = await fetch('/api/users/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nimOrId: userId,
          update: { active: finalUser.active }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update user status in database.');
      }
    } catch (err) {
      console.error('Error updating user status in DB:', err);
      addToast('Gagal menyinkronkan status ke database.', 'error');
    }

    return finalUser;
  };

  const clearUserPenalty = async (userId: string): Promise<RegisteredUser | null> => {
    let targetUser: RegisteredUser | null = null;

    const updated = registeredUsers.map((u) => {
      if (u.nimOrId === userId) {
        targetUser = { ...u, status: 'Clear' as const };
        return targetUser;
      }
      return u;
    });

    if (!targetUser) return null;

    setRegisteredUsers(updated);
    addToast(`Sanksi denda untuk ${(targetUser as RegisteredUser).name} telah dibersihkan secara administratif.`, 'success');

    try {
      const response = await fetch('/api/users/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nimOrId: userId,
          update: { status: 'Clear' }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to clear user penalty in database.');
      }
    } catch (err) {
      console.error('Error clearing user penalty in DB:', err);
      addToast('Gagal menyinkronkan pembersihan sanksi ke database.', 'error');
    }

    return targetUser;
  };

  const deleteUser = async (nimOrId: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/users/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nimOrId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        addToast(`Gagal menghapus: ${errorData.error || 'Terjadi kesalahan'}`, 'error');
        return false;
      }

      setRegisteredUsers((prev) => prev.filter((u) => u.nimOrId !== nimOrId));
      addActivityLog(`Akun pengguna dihapus oleh Admin: NIM ${nimOrId}`, 'penalty');
      addToast('Akun pengguna berhasil dihapus dari sistem dan database!', 'success');
      return true;
    } catch (err) {
      console.error('Error deleting user:', err);
      addToast('Gagal menghapus akun: Koneksi database bermasalah.', 'error');
      return false;
    }
  };

  const login = (nimOrId: string, password?: string, role?: Role): boolean => {
    if (!nimOrId.trim()) {
      addToast('Harap isikan NIM atau ID Personal Anda.', 'error');
      return false;
    }

    // Try finding in dynamic registered users list first
    let matchedUser = registeredUsers.find(
      (u) => u.nimOrId.toLowerCase() === nimOrId.trim().toLowerCase()
    );

    // Fallback if registry hasn't loaded or is empty
    if (!matchedUser) {
      // Create quick fallback objects based on credentials context
      const fallbackAdmins = ['ADMIN', 'admin', 'SASTRO'];
      if (fallbackAdmins.includes(nimOrId.trim().toUpperCase())) {
        matchedUser = {
          nimOrId: nimOrId.trim(),
          name: 'Pak Sastro Wardoyo',
          role: 'admin',
          avatarUrl: 'https://picsum.photos/seed/admin/150/150',
          password: 'biropinjam123'
        };
      } else {
        matchedUser = {
          nimOrId: nimOrId.trim(),
          name: 'Budi Santoso',
          role: 'mahasiswa',
          avatarUrl: 'https://picsum.photos/seed/student/150/150',
          password: 'biropinjam123'
        };
      }
    }

    // Validate password if supplied
    if (password && matchedUser.password && matchedUser.password !== password) {
      addToast('Kata sandi salah. Silakan coba lagi.', 'error');
      return false;
    }

    // Check if account is banned
    if (matchedUser.active === 'Ban') {
      addToast('Akses masuk ditolak! Akun Anda sedang ditangguhkan.', 'error');
      return false;
    }

    const loggedUser: User = {
      nimOrId: matchedUser.nimOrId,
      name: matchedUser.name,
      role: matchedUser.role,
      avatarUrl: matchedUser.avatarUrl,
    };

    setCurrentUser(loggedUser);
    setActiveRole(matchedUser.role);
    setIsLoggedIn(true);
    setCurrentTab('Dashboard');
    saveToLocal('epinjam_user', loggedUser);
    localStorage.setItem('epinjam_role', matchedUser.role);
    addToast(`Selamat datang kembali, ${loggedUser.name}! 👋`, 'success');
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('epinjam_user');
    localStorage.removeItem('epinjam_role');
    addToast('Anda berhasil keluar dari sistem.', 'success');
  };

  const addActivityLog = (text: string, type: ActivityLog['type']) => {
    const newLog: ActivityLog = {
      id: getUniqueId('log'),
      type,
      text,
      timestamp: 'Baru saja',
    };
    const updated = [newLog, ...activityLogs];
    setActivityLogs(updated);
    saveToLocal('epinjam_logs', updated);
  };

  const createBooking = (booking: Omit<Loan, 'id' | 'createdAt' | 'status' | 'timelineStep' | 'studentName'>): string => {
    const activeStates: Status[] = ['Menunggu', 'Disetujui', 'Dipinjam'];
    const activeCount = loans.filter((l: Loan) => l.nim === booking.nim && activeStates.includes(l.status)).length;
    
    if (activeCount >= 2) {
      addToast('Gagal: Batas maksimal pinjaman aktif terlampaui! (Maksimal 2 aktif sekaligus)', 'error');
      return '';
    }

    const newId = `L-${Math.floor(100 + (globalIdCount % 900))}`;
    getUniqueId('L'); // increment counter
    const newLoan: Loan = {
      ...booking,
      id: newId,
      studentName: currentUser?.name || 'Budi Santoso',
      createdAt: new Date().toISOString(),
      status: 'Menunggu',
      timelineStep: 1,
    };

    // Update status barang if needed (or keep it available until approved)
    // Here we can keep the item state updated
    const updatedLoans = [newLoan, ...loans];
    setLoans(updatedLoans);
    saveToLocal('epinjam_loans', updatedLoans);

    // Update total borrows count in barang list
    const updatedBarang = barangList.map(b => {
      if (b.id === booking.itemId) {
        return { ...b, totalBorrow: b.totalBorrow + 1 };
      }
      return b;
    });
    setBarangList(updatedBarang);
    saveToLocal('epinjam_barang', updatedBarang);

    addActivityLog(`${newLoan.studentName} mengajukan booking ${newLoan.itemCode} untuk ${newLoan.eventName}`, 'submit');
    addToast('Pengajuan peminjaman berhasil dibuat!', 'success');
    
    return newId;
  };

  const approveBooking = (id: string) => {
    const updatedLoans = loans.map((loan) => {
      if (loan.id === id) {
        // Find if item is available
        const item = barangList.find(b => b.id === loan.itemId);
        if (item && item.status !== 'Tersedia' && loan.status !== 'Dipinjam') {
          addToast(`Peringatan: Barang ${item.code} saat ini sedang tidak tersedia!`, 'warning');
        }
        
        // Advance to disetujui (step 2) or dipinjam (step 3) depending on current
        let nextStatus: Status = 'Disetujui';
        let step = 2;
        if (loan.status === 'Disetujui') {
          nextStatus = 'Dipinjam';
          step = 3;
        } else if (loan.status === 'Dipinjam') {
          nextStatus = 'Selesai';
          step = 4;
        }

        return { ...loan, status: nextStatus, timelineStep: step };
      }
      return loan;
    });

    setLoans(updatedLoans);
    saveToLocal('epinjam_loans', updatedLoans);

    const approvedLoan = loans.find(l => l.id === id);
    if (approvedLoan) {
      const item = barangList.find(b => b.id === approvedLoan.itemId);
      
      // Update item status accordingly
      if (approvedLoan.status === 'Menunggu') {
        // approved -> item becomes Reserved or we keep it, but if it goes to Dipinjam:
        addActivityLog(`Peminjaman ${approvedLoan.itemCode} disetujui · Admin`, 'approve');
        addToast(`Pengajuan ${id} berhasil disetujui!`, 'success');
      } else if (approvedLoan.status === 'Disetujui') {
        const updatedBarang = barangList.map(b => b.id === approvedLoan.itemId ? { ...b, status: 'Dipinjam' as const } : b);
        setBarangList(updatedBarang);
        saveToLocal('epinjam_barang', updatedBarang);
        
        addActivityLog(`InFocus ${approvedLoan.itemCode} diserahkan & sedang dipinjam oleh ${approvedLoan.studentName}`, 'approve');
        addToast(`InFocus ${approvedLoan.itemCode} telah dipinjam!`, 'success');
      } else if (approvedLoan.status === 'Dipinjam') {
        const updatedBarang = barangList.map(b => b.id === approvedLoan.itemId ? { ...b, status: 'Tersedia' as const } : b);
        setBarangList(updatedBarang);
        saveToLocal('epinjam_barang', updatedBarang);

        addActivityLog(`Peminjaman ${approvedLoan.itemCode} diselesaikan oleh ${approvedLoan.studentName}`, 'approve');
        addToast(`InFocus ${approvedLoan.itemCode} berhasil dikembalikan!`, 'success');
      }
    }
  };

  const rejectBooking = (id: string, reason?: string) => {
    const updatedLoans = loans.map((loan) => {
      if (loan.id === id) {
        return { ...loan, status: 'Ditolak' as Status, timelineStep: 4, notes: reason ? `Ditolak: ${reason}` : loan.notes };
      }
      return loan;
    });
    setLoans(updatedLoans);
    saveToLocal('epinjam_loans', updatedLoans);

    const rejectedLoan = loans.find(l => l.id === id);
    if (rejectedLoan) {
      addActivityLog(`Peminjaman ${rejectedLoan.itemCode} ditolak oleh Admin`, 'reject');
      addToast(`Pengajuan ${id} ditolak.`, 'error');
    }
  };

  const updateInventoryItem = (item: Barang) => {
    const updated = barangList.map((b) => (b.id === item.id ? item : b));
    setBarangList(updated);
    saveToLocal('epinjam_barang', updated);
    addActivityLog(`Inventaris ${item.code} diperbarui: ${item.kondisi} - ${item.status}`, 'inventory');
    addToast(`Item ${item.code} berhasil diperbarui!`, 'success');
  };

  const addInventoryItem = (item: Omit<Barang, 'id' | 'totalBorrow'>) => {
    const newId = getUniqueId('INV');
    const newBarang: Barang = {
      ...item,
      id: newId,
      totalBorrow: 0,
    };
    const updated = [...barangList, newBarang];
    setBarangList(updated);
    saveToLocal('epinjam_barang', updated);
    addActivityLog(`Barang baru ditambahkan ke inventaris: ${newBarang.name} (${newBarang.code})`, 'inventory');
    addToast(`${newBarang.name} berhasil ditambahkan!`, 'success');
  };

  // Robust features custom functions
  const cancelBooking = (id: string) => {
    const updatedLoans = loans.map((loan) => {
      if (loan.id === id) {
        return { 
          ...loan, 
          status: 'Ditolak' as Status, 
          timelineStep: 4, 
          notes: 'Dibatalkan oleh mahasiswa.' 
        };
      }
      return loan;
    });
    setLoans(updatedLoans);
    saveToLocal('epinjam_loans', updatedLoans);
    
    const cancelled = loans.find(l => l.id === id);
    if (cancelled) {
      addActivityLog(`Peminjaman ${cancelled.itemCode} dibatalkan oleh mahasiswa`, 'reject');
      addToast(`Booking ${id} berhasil dibatalkan.`, 'success');
    }
  };

  const adminCancelBooking = (id: string, reason: string) => {
    const updatedLoans = loans.map((loan) => {
      if (loan.id === id) {
        return { 
          ...loan, 
          status: 'Ditolak' as Status, 
          timelineStep: 4, 
          cancelReason: reason,
          notes: `Dibatalkan Admin: ${reason}` 
        };
      }
      return loan;
    });
    setLoans(updatedLoans);
    saveToLocal('epinjam_loans', updatedLoans);

    const cancelled = loans.find(l => l.id === id);
    if (cancelled) {
      // Revert item status to 'Tersedia' if was Dipinjam/Disetujui
      const updatedBarang = barangList.map(b => b.id === cancelled.itemId ? { ...b, status: 'Tersedia' as const } : b);
      setBarangList(updatedBarang);
      saveToLocal('epinjam_barang', updatedBarang);
      
      addActivityLog(`Peminjaman ${cancelled.itemCode} dibatalkan oleh Admin dengan alasan: ${reason}`, 'reject');
      addToast(`Booking ${id} dibatalkan dengan alasan: ${reason}`, 'error');
    }
  };

  const requestExtension = (id: string, hours: string, reason: string) => {
    const updatedLoans = loans.map((loan) => {
      if (loan.id === id) {
        return {
          ...loan,
          extendRequest: 'pending' as const,
          extendHours: hours,
          extendReason: reason
        };
      }
      return loan;
    });
    setLoans(updatedLoans);
    saveToLocal('epinjam_loans', updatedLoans);
    addToast(`Permintaan perpanjangan untuk ${id} diajukan!`, 'success');
    addActivityLog(`Mahasiswa meminta perpanjangan pinjam ${id} selama ${hours} jam`, 'submit');
  };

  const approveExtension = (id: string) => {
    const loan = loans.find(l => l.id === id);
    if (!loan) return;
    
    const additionalHoursText = loan.extendHours ? ` (+${loan.extendHours} jam)` : " (Extended)";
    
    const updatedLoans = loans.map((l) => {
      if (l.id === id) {
        return {
          ...l,
          timeSlot: `${l.timeSlot}${additionalHoursText}`,
          extendRequest: 'approved' as const
        };
      }
      return l;
    });
    setLoans(updatedLoans);
    saveToLocal('epinjam_loans', updatedLoans);
    addToast(`Perpanjangan peminjaman ${id} disetujui!`, 'success');
    addActivityLog(`Perpanjangan waktu peminjaman ${loan.itemCode} disetujui oleh Admin`, 'approve');
  };

  const rejectExtension = (id: string) => {
    const updatedLoans = loans.map((loan) => {
      if (loan.id === id) {
        return {
          ...loan,
          extendRequest: 'rejected' as const
        };
      }
      return loan;
    });
    setLoans(updatedLoans);
    saveToLocal('epinjam_loans', updatedLoans);
    addToast(`Perpanjangan peminjaman ${id} ditolak.`, 'error');
    addActivityLog(`Perpanjangan waktu peminjaman ${id} ditolak Admin`, 'reject');
  };

  const reportDamage = (loanId: string, notes: string) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) return;

    const updatedLoans = loans.map((l) => {
      if (l.id === loanId) {
        return {
          ...l,
          damageReported: true,
          damageReportNotes: notes,
          damageReportedAt: new Date().toLocaleDateString('id-ID')
        };
      }
      return l;
    });
    setLoans(updatedLoans);
    saveToLocal('epinjam_loans', updatedLoans);

    // Update the asset condition status
    const updatedBarang = barangList.map((b) => {
      if (b.id === loan.itemId) {
        const logs = b.conditionLogs || [];
        const newLog = {
          id: getUniqueId('logcond'),
          date: new Date().toLocaleDateString('id-ID'),
          kondisi: 'Rusak Ringan' as const,
          notes: `Laporan Sarpras (Mahasiswa): ${notes}`,
          reporter: currentUser?.name || 'Mahasiswa'
        };
        return {
          ...b,
          kondisi: 'Rusak Ringan' as const,
          conditionLogs: [newLog, ...logs]
        };
      }
      return b;
    });
    setBarangList(updatedBarang);
    saveToLocal('epinjam_barang', updatedBarang);

    addActivityLog(`Kerusakan dilaporkan pada ${loan.itemCode}: ${notes}`, 'inventory');
    addToast(`Laporan kerusakan ${loan.itemCode} berhasil terekam!`, 'success');
  };

  const updateMaintenanceSchedule = (itemId: string, scheduleDate: string) => {
    const updatedBarang = barangList.map((b) => {
      if (b.id === itemId) {
        return {
          ...b,
          maintenanceSchedule: scheduleDate,
          status: scheduleDate ? ('Maintenance' as const) : ('Tersedia' as const)
        };
      }
      return b;
    });
    setBarangList(updatedBarang);
    saveToLocal('epinjam_barang', updatedBarang);
    addToast(`Jadwal maintenance atau servis berhasil diperbarui!`, 'success');
  };

  const completeReturnWithCondition = (loanId: string, kondisi: Kondisi, notes: string) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) return;

    const updatedLoans = loans.map((l) => {
      if (l.id === loanId) {
        return {
          ...l,
          status: 'Selesai' as Status,
          timelineStep: 4,
          returnCondition: kondisi,
          returnNotes: notes
        };
      }
      return l;
    });
    setLoans(updatedLoans);
    saveToLocal('epinjam_loans', updatedLoans);

    const updatedBarang = barangList.map((b) => {
      if (b.id === loan.itemId) {
        const logs = b.conditionLogs || [];
        const newLog = {
          id: getUniqueId('logcond'),
          date: new Date().toLocaleDateString('id-ID'),
          kondisi: kondisi,
          notes: notes || `Pengembalian sukses dengan kondisi ${kondisi}.`,
          reporter: 'Biro Administrasi Kampus (BAAK)'
        };
        return {
          ...b,
          status: 'Tersedia' as const,
          kondisi: kondisi,
          conditionLogs: [newLog, ...logs]
        };
      }
      return b;
    });
    setBarangList(updatedBarang);
    saveToLocal('epinjam_barang', updatedBarang);

    addActivityLog(`Proyektor ${loan.itemCode} dikembalikan BAAK. Kondisi: ${kondisi}`, 'approve');
    addToast(`Proyektor ${loan.itemCode} telah dikembalikan dengan kondisi: ${kondisi}!`, 'success');
  };

  return (
    <EPinjamContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        activeRole,
        setActiveRole,
        isLoggedIn,
        registeredUsers,
        setRegisteredUsers,
        registerStudent,
        toggleUserStatus,
        clearUserPenalty,
        deleteUser,
        login,
        logout,
        currentTab,
        setCurrentTab,
        barangList,
        setBarangList,
        loans,
        setLoans,
        announcements,
        activityLogs,
        addActivityLog,
        createBooking,
        approveBooking,
        rejectBooking,
        updateInventoryItem,
        addInventoryItem,
        cancelBooking,
        adminCancelBooking,
        requestExtension,
        approveExtension,
        rejectExtension,
        reportDamage,
        updateMaintenanceSchedule,
        completeReturnWithCondition,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </EPinjamContext.Provider>
  );
}

export function useEPinjam() {
  const context = useContext(EPinjamContext);
  if (context === undefined) {
    throw new Error('useEPinjam must be used within an EPinjamProvider');
  }
  return context;
}
