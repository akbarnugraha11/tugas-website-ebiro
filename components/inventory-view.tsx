'use client';

import { useState } from 'react';
import { useEPinjam, Barang, Kondisi } from '@/lib/state-context';
import { getStatusStyles } from '@/lib/utils';
import { 
  Projector, 
  Search, 
  Plus, 
  Edit, 
  Trash, 
  ToggleLeft, 
  ToggleRight, 
  Monitor, 
  Tv, 
  Laptop, 
  Wrench, 
  Upload, 
  CloudUpload,
  ChevronLeft,
  ChevronRight,
  Eye,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';

export default function InventoryView() {
  const { 
    barangList, 
    updateInventoryItem, 
    addInventoryItem, 
    addToast 
  } = useEPinjam();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Barang | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    cond: 'Baik' as Kondisi,
    status: 'Tersedia' as 'Tersedia' | 'Maintenance' | 'Dipinjam',
    qty: 1,
    desc: '',
    active: true,
  });

  // Simulated drag and drop state
  const [isDragging, setIsDragging] = useState(false);

  // Sort states
  const [sortField, setSortField] = useState<'Name' | 'Total Borrow' | 'Status'>('Name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: 'Name' | 'Total Borrow' | 'Status') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filter list
  const filteredBarangList = barangList.filter((item) => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.code.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === 'Semua') return matchesSearch;
    return matchesSearch && item.status === statusFilter;
  });

  // Sort list
  const sortedBarangList = [...filteredBarangList].sort((a, b) => {
    let aVal: string | number = '';
    let bVal: string | number = '';

    if (sortField === 'Name') {
      aVal = a.name.toLowerCase();
      bVal = b.name.toLowerCase();
    } else if (sortField === 'Total Borrow') {
      aVal = a.totalBorrow;
      bVal = b.totalBorrow;
    } else if (sortField === 'Status') {
      aVal = a.status.toLowerCase();
      bVal = b.status.toLowerCase();
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Load editing values to state
  const handleOpenEdit = (item: Barang) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      code: item.code,
      cond: item.kondisi,
      status: item.status,
      qty: item.quantity,
      desc: 'Unit proyektor biro sarpras utama.',
      active: item.active,
    });
    setIsModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      code: `INF-${Math.floor(100 + Math.random() * 900)}`,
      cond: 'Baik',
      status: 'Tersedia',
      qty: 1,
      desc: '',
      active: true,
    });
    setIsModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      addToast('Nama barang dan Kode inventaris wajib diisi!', 'warning');
      return;
    }

    if (editingItem) {
      // Edit
      const updated: Barang = {
        ...editingItem,
        name: formData.name,
        code: formData.code,
        kondisi: formData.cond,
        status: formData.status,
        quantity: formData.qty,
        active: formData.active,
      };
      updateInventoryItem(updated);
    } else {
      // Create new
      const newItem: Omit<Barang, 'id' | 'totalBorrow'> = {
        name: formData.name,
        code: formData.code,
        kondisi: formData.cond,
        status: formData.status,
        quantity: formData.qty,
        active: formData.active,
        imageIcon: 'Monitor', // default placeholder
      };
      addInventoryItem(newItem);
    }

    setIsModalOpen(false);
  };

  const handleToggleState = (item: Barang) => {
    const updated: Barang = {
      ...item,
      active: !item.active
    };
    updateInventoryItem(updated);
    addToast(`Item proyektor ${item.code} diset ${updated.active ? 'Aktif' : 'Nonaktif'}`, 'success');
  };

  // Render appropriate vector placeholders instead of external random image URLs
  const renderItemThumbnail = (barangId: string) => {
    // Elegant consistent graphic inside dashboard
    return (
      <div className="w-10 h-10 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
        <Projector className="w-5 h-5" />
      </div>
    );
  };

  return (
    <div className="space-y-6" id="inventory-root-panel">
      
      {/* Top Header Block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" id="inventory-view-header">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Kelola Inventaris</h1>
          <p className="text-slate-400 text-sm mt-0.5">Edit status proyektor, ketersediaan unit, kondisi fisik, dan log pemakaian.</p>
        </div>
        
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow shadow-indigo-600/10 flex items-center gap-1.5 cursor-pointer"
          id="btn-add-inventory"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Tambah Barang</span>
        </button>
      </div>

      {/* FILTER SEARCH CRITERIA */}
      <div className="glass-panel p-4 rounded-xl flex flex-col md:flex-row gap-4 justify-between items-center" id="inventory-filter-bar">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari proyektor atau kode unit..."
            className="w-full glass-input pl-9 pr-3 py-2 text-xs rounded-xl"
            id="input-inv-search"
          />
        </div>

        {/* Status Dropdown selector */}
        <div className="flex items-center gap-2 w-full md:w-auto" id="inv-tabs-filter">
          <span className="text-xs text-slate-400">Status:</span>
          <div className="flex bg-slate-950/60 p-1 rounded-xl border border-white/5 overflow-x-auto w-full md:w-auto">
            {['Semua', 'Tersedia', 'Dipinjam', 'Maintenance'].map((flt) => (
              <button
                key={flt}
                type="button"
                onClick={() => setStatusFilter(flt)}
                className={`py-1 px-3 text-[10px] font-bold rounded-lg cursor-pointer transition-all ${
                  statusFilter === flt
                    ? 'bg-indigo-600 text-white shadow font-extrabold'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                id={`btn-flt-inv-${flt.toLowerCase()}`}
              >
                {flt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* INVENTORY TABLE PANEL */}
      <div className="glass-card rounded-2xl border border-white/5 overflow-hidden" id="inventory-table-panel">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs" id="table-inventory">
            <thead>
              <tr className="bg-slate-950/60 border-b border-white/5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <th className="p-4">Foto</th>
                <th 
                  className="p-4 cursor-pointer select-none hover:text-white transition-colors group"
                  onClick={() => handleSort('Name')}
                  id="th-sort-name"
                >
                  <div className="flex items-center gap-1">
                    <span>Nama & Kode</span>
                    <span className={`text-[9px] transition-all ${sortField === 'Name' ? 'text-indigo-400 opacity-100' : 'text-slate-600 opacity-0 group-hover:opacity-100'}`}>
                      {sortField === 'Name' ? (sortOrder === 'asc' ? '▲' : '▼') : '↕'}
                    </span>
                  </div>
                </th>
                <th className="p-4">Kondisi Fisik</th>
                <th 
                  className="p-4 cursor-pointer select-none hover:text-white transition-colors group"
                  onClick={() => handleSort('Status')}
                  id="th-sort-status"
                >
                  <div className="flex items-center gap-1">
                    <span>Status</span>
                    <span className={`text-[9px] transition-all ${sortField === 'Status' ? 'text-indigo-400 opacity-100' : 'text-slate-600 opacity-0 group-hover:opacity-100'}`}>
                      {sortField === 'Status' ? (sortOrder === 'asc' ? '▲' : '▼') : '↕'}
                    </span>
                  </div>
                </th>
                <th 
                  className="p-4 text-center cursor-pointer select-none hover:text-white transition-colors group"
                  onClick={() => handleSort('Total Borrow')}
                  id="th-sort-total-borrow"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Frequensi (Pinjam)</span>
                    <span className={`text-[9px] transition-all ${sortField === 'Total Borrow' ? 'text-indigo-400 opacity-100' : 'text-slate-600 opacity-0 group-hover:opacity-100'}`}>
                      {sortField === 'Total Borrow' ? (sortOrder === 'asc' ? '▲' : '▼') : '↕'}
                    </span>
                  </div>
                </th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sortedBarangList.map((item) => {
                const conStyles = getStatusStyles(item.kondisi);
                const staStyles = getStatusStyles(item.status);

                return (
                  <tr 
                    key={item.id}
                    className={`transition-all duration-150 relative ${
                      item.active 
                        ? 'hover:bg-indigo-500/[0.04]' 
                        : 'opacity-40 italic bg-slate-950/30'
                    }`}
                    id={`inv-row-${item.id}`}
                  >
                    <td className="p-4">
                      {renderItemThumbnail(item.id)}
                    </td>

                    <td className="p-4">
                      <p className={`font-bold ${item.active ? 'text-white' : 'text-slate-500'}`}>{item.name}</p>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">{item.code}</p>
                    </td>

                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold ${conStyles.bg}`}>
                        {conStyles.label}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1 w-max ${staStyles.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${staStyles.dot}`} />
                        {staStyles.label}
                      </span>
                    </td>

                    <td className="p-4 text-center">
                      <span className="font-mono font-bold text-slate-300">{item.totalBorrow} kali</span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700/50 hover:border-slate-600 transition-colors cursor-pointer text-[10px] font-bold flex items-center gap-1"
                          id={`btn-edit-inv-${item.id}`}
                        >
                          <Edit className="w-3.5 h-3.5" />
                          Edit
                        </button>

                        <button
                          onClick={() => handleToggleState(item)}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            item.active 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500 hover:text-white' 
                              : 'bg-slate-800 text-slate-500 border-slate-700 hover:bg-slate-700 hover:text-slate-300'
                          }`}
                          title={item.active ? 'Sembunyikan / Nonaktifkan Unit' : 'Aktifkan Unit'}
                          id={`btn-toggle-inv-${item.id}`}
                        >
                          {item.active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* PAGINATION BOX */}
        <div className="p-4 bg-slate-950/40 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs" id="pagination-panel">
          <span className="text-slate-400">Menampilkan <strong className="text-white">1 - {sortedBarangList.length}</strong> dari <strong className="text-white">{sortedBarangList.length}</strong> unit proyektor biro</span>
          
          <div className="flex gap-1.5">
            <button disabled className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button disabled className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ADD / EDIT INVENTARIS MODAL/ALERT */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              id="inv-modal-backdrop"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-slate-900 border border-white/10 p-6 md:p-8 rounded-2xl max-w-lg w-full z-10 space-y-5 shadow-2x overflow-y-auto max-h-[90vh]"
              id="add-edit-item-modal"
            >
              <div className="border-b border-white/5 pb-3">
                <h3 className="text-base font-extrabold text-white">
                  {editingItem ? `Edit Unit ${editingItem.code}` : 'Tambah Unit InFocus Baru'}
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  Isi parameter data inventaris untuk diunggah ke database biro.
                </p>
              </div>

              <form onSubmit={handleSaveItem} className="space-y-4" id="inv-form">
                
                {/* Drag and drop simulated file area */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">FOTO UNIT / GAMBAR GAMBAR (SIMULATED DRAG & DROP)</label>
                  
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => { e.preventDefault(); setIsDragging(false); addToast('Gambar berhasil diunggah secara lokal!', 'success'); }}
                    onClick={() => addToast('Pilih foto dari berkas lokal...', 'success')}
                    className={`p-5 rounded-xl border-2 border-dashed text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${
                      isDragging 
                        ? 'border-indigo-500 bg-indigo-500/5' 
                        : 'border-white/10 bg-slate-950/30 hover:border-slate-800'
                    }`}
                    id="dropzone-area"
                  >
                    <CloudUpload className="w-8 h-8 text-indigo-400 animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-200">Seret & letakkan foto di tempat ini, atau klik untuk unggah</span>
                    <span className="text-[9px] text-slate-500">Maksimal resolusi file 4MB (format JPG, PNG, WEBP)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider mb-2">Nama Barang</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Contoh: Epson EB-G7900U"
                      className="w-full glass-input px-3 py-2.5 rounded-lg text-xs"
                      id="inv-input-name"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider mb-2">Kode Inventaris</label>
                    <input
                      type="text"
                      required
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="Contoh: INF-009"
                      className="w-full glass-input px-3 py-2.5 rounded-lg text-xs uppercase"
                      id="inv-input-code"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider mb-2">Jumlah Unit (QTY)</label>
                    <input
                      type="number"
                      required
                      value={formData.qty}
                      onChange={(e) => setFormData({ ...formData, qty: parseInt(e.target.value) || 1 })}
                      className="w-full glass-input px-3 py-2 rounded-lg text-xs"
                      id="inv-input-qty"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider mb-2">Kondisi</label>
                    <select
                      value={formData.cond}
                      onChange={(e) => setFormData({ ...formData, cond: e.target.value as Kondisi })}
                      className="w-full glass-input px-2.5 py-2 rounded-lg text-xs text-white"
                      style={{ colorScheme: 'dark' }}
                      id="inv-select-cond"
                    >
                      <option className="bg-slate-900" value="Baik">Baik</option>
                      <option className="bg-slate-900" value="Rusak Ringan">Rusak Ringan</option>
                      <option className="bg-slate-900" value="Rusak Berat">Rusak Berat</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full glass-input px-2.5 py-2 rounded-lg text-xs text-white"
                      style={{ colorScheme: 'dark' }}
                      id="inv-select-status"
                    >
                      <option className="bg-slate-900" value="Tersedia">Tersedia</option>
                      <option className="bg-slate-900" value="Maintenance">Maintenance</option>
                      <option className="bg-slate-900" value="Dipinjam">Dipinjam</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider mb-2">Catatan Deskripsi</label>
                  <textarea
                    value={formData.desc}
                    onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                    placeholder="Tulis tambahan kelengkapan kabel remotes atau histori servis lensa di sini..."
                    rows={2.5}
                    className="w-full glass-input px-3 py-2 rounded-lg text-xs border border-white/10"
                    id="inv-textarea-desc"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-950/40 rounded-xl border border-white/5">
                  <span className="text-xs font-semibold text-slate-300">Unit Status Aktif</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, active: !formData.active })}
                      className="cursor-pointer"
                      id="btn-modal-active-toggle"
                    >
                      {formData.active ? (
                        <ToggleRight className="w-8 h-8 text-indigo-400" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-slate-600" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-white/5" id="inv-modal-footer">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-slate-800 hover:bg-white/5 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                    id="btn-inv-modal-cancel"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-extrabold transition-all active:scale-95 cursor-pointer shadow-lg shadow-indigo-600/15"
                    id="btn-inv-modal-save"
                  >
                    Simpan Perubahan
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
