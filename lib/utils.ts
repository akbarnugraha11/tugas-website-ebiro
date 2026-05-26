import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type Status = 
  | 'Menunggu' 
  | 'Disetujui' 
  | 'Dipinjam' 
  | 'Selesai' 
  | 'Ditolak' 
  | 'Terlambat' 
  | 'Tersedia' 
  | 'Maintenance';

export function getStatusStyles(status: Status | string) {
  switch (status) {
    case 'Menunggu':
      return {
        bg: 'bg-amber-500/10 text-amber-300 border border-amber-500/30 font-medium',
        dot: 'bg-amber-400',
        label: 'Menunggu',
      };
    case 'Disetujui':
      return {
        bg: 'bg-blue-500/10 text-blue-300 border border-blue-500/30 font-medium',
        dot: 'bg-blue-400',
        label: 'Disetujui',
      };
    case 'Dipinjam':
      return {
        bg: 'bg-orange-500/15 text-orange-300 border border-orange-500/30 font-medium',
        dot: 'bg-orange-400',
        label: 'Dipinjam',
      };
    case 'Selesai':
      return {
        bg: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-medium',
        dot: 'bg-emerald-400',
        label: 'Selesai',
      };
    case 'Ditolak':
      return {
        bg: 'bg-rose-500/10 text-rose-400 border border-rose-500/30 font-medium',
        dot: 'bg-rose-500',
        label: 'Ditolak',
      };
    case 'Terlambat':
      return {
        bg: 'bg-red-500/20 text-red-300 border border-red-500/40 font-medium font-bold',
        dot: 'bg-red-500 animate-ping',
        label: 'Terlambat',
      };
    case 'Tersedia':
    case 'Baik':
      return {
        bg: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-medium',
        dot: 'bg-emerald-400',
        label: 'Tersedia',
      };
    case 'Maintenance':
    case 'Rusak Ringan':
      return {
        bg: 'bg-slate-500/20 text-slate-300 border border-slate-500/30 font-medium',
        dot: 'bg-slate-400',
        label: 'Maintenance',
      };
    case 'Rusak Berat':
      return {
        bg: 'bg-red-950/40 text-red-400 border border-red-500/20 font-medium',
        dot: 'bg-red-500',
        label: 'Rusak Berat',
      };
    default:
      return {
        bg: 'bg-slate-500/10 text-slate-300 border border-slate-500/20 font-medium',
        dot: 'bg-slate-400',
        label: status,
      };
  }
}
