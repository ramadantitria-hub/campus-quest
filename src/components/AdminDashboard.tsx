'use client';

import React, { useState } from 'react';
import { useCampusQuest } from '@/context/CampusQuestContext';
import { Quest, QuestStatus, ServiceCategory, RegisteredAccount } from '@/types/campus-quest';
import { soundFX } from '@/lib/audio';
import {
  ShieldCheck,
  ShieldAlert,
  Coins,
  ShoppingBag,
  Wrench,
  Users,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Trash2,
  Eye,
  FileText,
  DollarSign,
  TrendingUp,
  Sliders,
  ChevronRight,
  ArrowRight,
  UserCheck,
  UserX,
  CreditCard,
  Building,
  GraduationCap,
  Calendar,
  Phone,
  Hash,
  Download,
  Clock,
  Sparkles,
  Ban,
  Check,
  X,
  Database
} from 'lucide-react';

export default function AdminDashboard() {
  const {
    quests,
    registeredAccounts,
    totalPlatformFee,
    adminForceCompleteQuest,
    adminForceCancelQuest,
    adminResetQuest,
    adminVerifyUser,
    adminToggleUserStatus,
    adminDeleteQuest,
    switchRole,
    resetToDefaultData,
    isCurrentUserAdmin,
    activeRole
  } = useCampusQuest();

  // PRIVASI & KEAMANAN: Tampilan Admin TIDAK BISA DILIHAT OLEH RUNNER DAN CUSTOMER!
  if (!isCurrentUserAdmin || activeRole !== 'admin') {
    return (
      <div className="bg-white border border-[#E8DFD1] rounded-3xl p-8 text-center max-w-lg mx-auto my-12 shadow-sm">
        <ShieldAlert className="w-12 h-12 text-[#7A1E34] mx-auto mb-3" />
        <h3 className="text-lg font-bold text-[#2C2224]">Akses Administrator Dibatasi</h3>
        <p className="text-xs text-[#6E6265] mt-1 mb-4">
          Tampilan dan wewenang Administrator hanya dapat diakses oleh Administrator resmi terdaftar. Runner dan Customer tidak diizinkan mengakses panel ini.
        </p>
        <button
          onClick={() => switchRole('customer')}
          className="px-4 py-2 rounded-xl bg-[#7A1E34] text-white text-xs font-bold cursor-pointer"
        >
          Kembali ke Dashboard Utama
        </button>
      </div>
    );
  }

  const [activeAdminTab, setActiveAdminTab] = useState<'overview' | 'quests' | 'users' | 'finance' | 'settings'>('overview');
  
  // Quest Filter & Search
  const [questSearch, setQuestSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | QuestStatus>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | ServiceCategory>('ALL');

  // User Filter & Search
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'ALL' | 'customer' | 'runner'>('ALL');

  // Modals & Feedback
  const [selectedQuestForAudit, setSelectedQuestForAudit] = useState<Quest | null>(null);
  const [selectedUserForKtm, setSelectedUserForKtm] = useState<RegisteredAccount | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [cancelModalQuest, setCancelModalQuest] = useState<Quest | null>(null);
  const [cancelReasonInput, setCancelReasonInput] = useState('');

  // Overall Financial Calculations
  const completedQuests = quests.filter((q) => q.status === 'COMPLETED');
  const totalGrossVolume = quests.reduce((acc, q) => acc + q.bounty_fee + (q.item_cost || 0), 0);
  const totalCompletedGross = completedQuests.reduce((acc, q) => acc + q.bounty_fee + (q.item_cost || 0), 0);
  const activeOngoingQuests = quests.filter((q) => q.status !== 'COMPLETED' && q.status !== 'CANCELLED');

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleForceComplete = (questId: string) => {
    if (confirm('Konfirmasi: Selesaikan transaksi ini secara paksa sebagai Administrator? Dana & poin akan otomatis dibukukan.')) {
      const res = adminForceCompleteQuest(questId);
      showNotice(res.message);
    }
  };

  const handleForceCancelSubmit = () => {
    if (!cancelModalQuest) return;
    const reason = cancelReasonInput.trim() || 'Dibatalkan oleh Administrator';
    const res = adminForceCancelQuest(cancelModalQuest.id, reason);
    setCancelModalQuest(null);
    setCancelReasonInput('');
    showNotice(res.message);
  };

  const handleResetQuest = (questId: string) => {
    if (confirm('Kembalikan quest ini ke status OPEN antrean publik (menghapus runner)?')) {
      const res = adminResetQuest(questId);
      showNotice(res.message);
    }
  };

  const handleDeleteQuest = (questId: string) => {
    if (confirm('PERINGATAN: Hapus permanen quest ini dari database sistem? Tindakan tidak dapat dibatalkan.')) {
      const res = adminDeleteQuest(questId);
      showNotice(res.message);
    }
  };

  // Filtered Quests
  const filteredQuests = quests.filter((q) => {
    const matchStatus = statusFilter === 'ALL' || q.status === statusFilter;
    const matchCat = categoryFilter === 'ALL' || q.category === categoryFilter;
    const query = questSearch.toLowerCase();
    const matchQuery =
      q.title.toLowerCase().includes(query) ||
      q.customer_name.toLowerCase().includes(query) ||
      (q.runner_name && q.runner_name.toLowerCase().includes(query)) ||
      q.id.toLowerCase().includes(query);
    return matchStatus && matchCat && matchQuery;
  });

  // Filtered Users
  const filteredUsers = registeredAccounts.filter((u) => {
    const matchRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
    const query = userSearch.toLowerCase();
    const matchQuery =
      u.full_name.toLowerCase().includes(query) ||
      u.nim.toLowerCase().includes(query) ||
      (u.major && u.major.toLowerCase().includes(query));
    return matchRole && matchQuery;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner - Tactile Clay Charcoal / Maroon Gradient */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#2C2224] via-[#432A32] to-[#7A1E34] border border-[#E8DFD1] p-5 sm:p-7 shadow-xl text-white">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#2D8D84]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[#A5DDD3] text-xs font-bold mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Pusat Kendali Administrator</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
              Admin &amp; Oversight Hub
            </h1>
            <p className="text-xs sm:text-sm text-stone-200 mt-1 max-w-xl">
              Pantau seluruh aktivitas quest JASTAP &amp; JARVIS, audit kas platform fee 10%, dan kelola verifikasi identitas mahasiswa UPI.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => switchRole('customer')}
              className="px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/25 text-white font-bold text-xs backdrop-blur-md transition-all cursor-pointer shadow-sm"
            >
              Mode Customer
            </button>
            <button
              onClick={() => switchRole('runner')}
              className="px-4 py-2.5 rounded-2xl bg-[#2D8D84] hover:bg-[#247D75] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              Mode Runner
            </button>
          </div>
        </div>
      </div>

      {/* Action Notification Toast Banner */}
      {actionNotice && (
        <div className="p-3.5 bg-[#E8F6F3] border border-[#A5DDD3] rounded-2xl text-xs text-[#1F6F67] font-bold flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4.5 h-4.5 text-[#2D8D84] shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-[#1F6F67] p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4 Core Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* KPI 1: Kas Platform (10% Pajak Ongkir) */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#A5DDD3] shadow-sm relative overflow-hidden group hover:border-[#2D8D84] transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-xs font-bold text-[#6E6265]">Kas Platform (10%)</span>
            <div className="w-8 h-8 rounded-xl bg-[#E8F6F3] text-[#2D8D84] flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-black text-[#2D8D84] font-mono">
            Rp {totalPlatformFee.toLocaleString('id-ID')}
          </p>
          <span className="text-[10px] text-[#6E6265] mt-1 block">
            Dari {completedQuests.length} transaksi selesai
          </span>
        </div>

        {/* KPI 2: Total Volume Transaksi */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#F1CCD3] shadow-sm relative overflow-hidden group hover:border-[#7A1E34] transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-xs font-bold text-[#6E6265]">Omset Transaksi</span>
            <div className="w-8 h-8 rounded-xl bg-[#FBF0F2] text-[#7A1E34] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-black text-[#7A1E34] font-mono">
            Rp {totalCompletedGross.toLocaleString('id-ID')}
          </p>
          <span className="text-[10px] text-[#6E6265] mt-1 block">
            Gross nilai belanja &amp; ongkir
          </span>
        </div>

        {/* KPI 3: Total Quest & Status Aktif */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#E8DFD1] shadow-sm relative overflow-hidden group hover:border-[#2D8D84] transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-xs font-bold text-[#6E6265]">Total Quest</span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF7F2] text-[#2C2224] flex items-center justify-center border border-[#E8DFD1]">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-black text-[#2C2224] font-mono">
            {quests.length} <span className="text-xs font-semibold text-[#6E6265]">({activeOngoingQuests.length} aktif)</span>
          </p>
          <span className="text-[10px] text-[#6E6265] mt-1 block">
            {quests.filter((q) => q.category === 'JASTAP').length} Jastap • {quests.filter((q) => q.category === 'JARVIS').length} Jarvis
          </span>
        </div>

        {/* KPI 4: Mahasiswa Terdaftar */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#E8DFD1] shadow-sm relative overflow-hidden group hover:border-[#7A1E34] transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-xs font-bold text-[#6E6265]">Civitas Mahasiswa</span>
            <div className="w-8 h-8 rounded-xl bg-[#FBF0F2] text-[#7A1E34] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-black text-[#2C2224] font-mono">
            {registeredAccounts.length} <span className="text-xs font-semibold text-[#2D8D84]">Akun</span>
          </p>
          <span className="text-[10px] text-[#6E6265] mt-1 block">
            Terverifikasi via KTM UPI
          </span>
        </div>
      </div>

      {/* Admin Tab Navigation Bar */}
      <div className="bg-white border border-[#E8DFD1] rounded-3xl p-1.5 shadow-sm flex items-center gap-1.5 overflow-x-auto">
        <button
          onClick={() => setActiveAdminTab('overview')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeAdminTab === 'overview'
              ? 'bg-[#7A1E34] text-white shadow-xs'
              : 'text-[#6E6265] hover:text-[#2C2224] hover:bg-[#F2EBE0]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Ringkasan Ekosistem</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('quests')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeAdminTab === 'quests'
              ? 'bg-[#7A1E34] text-white shadow-xs'
              : 'text-[#6E6265] hover:text-[#2C2224] hover:bg-[#F2EBE0]'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Semua Quest Kampus ({quests.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('users')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeAdminTab === 'users'
              ? 'bg-[#7A1E34] text-white shadow-xs'
              : 'text-[#6E6265] hover:text-[#2C2224] hover:bg-[#F2EBE0]'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Verifikasi Mahasiswa ({registeredAccounts.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('finance')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeAdminTab === 'finance'
              ? 'bg-[#7A1E34] text-white shadow-xs'
              : 'text-[#6E6265] hover:text-[#2C2224] hover:bg-[#F2EBE0]'
          }`}
        >
          <Coins className="w-3.5 h-3.5 text-amber-300" />
          <span>Buku Besar Kas 10%</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('settings')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeAdminTab === 'settings'
              ? 'bg-[#7A1E34] text-white shadow-xs'
              : 'text-[#6E6265] hover:text-[#2C2224] hover:bg-[#F2EBE0]'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Integritas Sistem</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* VIEW: OVERVIEW / RINGKASAN */}
      {/* ========================================================================= */}
      {activeAdminTab === 'overview' && (
        <div className="space-y-5">
          {/* Ongoing Quests Monitoring Card */}
          <div className="bg-white border border-[#E8DFD1] rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-[#2C2224] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#2D8D84]" />
                  Status Radar Transaksi Kampus Saat Ini
                </h3>
                <p className="text-xs text-[#6E6265]">Pesanan yang sedang aktif di lapangan kampus UPI</p>
              </div>
              <button
                onClick={() => setActiveAdminTab('quests')}
                className="text-xs font-bold text-[#2D8D84] hover:underline flex items-center gap-1 cursor-pointer"
              >
                Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {activeOngoingQuests.length === 0 ? (
              <div className="p-8 text-center text-[#8E7F83] bg-[#FAF7F2] rounded-2xl">
                <CheckCircle className="w-8 h-8 text-[#2D8D84] mx-auto mb-2" />
                <p className="text-xs font-bold text-[#2C2224]">Semua Quest Telah Selesai</p>
                <p className="text-[11px] text-[#8E7F83]">Tidak ada quest bermasalah atau dalam antrean saat ini.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeOngoingQuests.slice(0, 4).map((quest) => (
                  <div
                    key={quest.id}
                    className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD1] flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            quest.category === 'JASTAP'
                              ? 'bg-[#E8F6F3] text-[#1F6F67] border border-[#A5DDD3]'
                              : 'bg-[#FBF0F2] text-[#7A1E34] border border-[#F1CCD3]'
                          }`}
                        >
                          {quest.category}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white border border-[#E8DFD1] text-[#6E6265] font-semibold">
                          {quest.status}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-[#2C2224] line-clamp-1">{quest.title}</h4>
                      <p className="text-[11px] text-[#6E6265] mt-0.5">
                        Pemesan: <strong className="text-[#2C2224]">{quest.customer_name}</strong>
                        {quest.runner_name && (
                          <span> • Runner: <strong className="text-[#2D8D84]">{quest.runner_name}</strong></span>
                        )}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-[#E8DFD1] flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-[#7A1E34]">
                        Rp {quest.bounty_fee.toLocaleString('id-ID')}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setSelectedQuestForAudit(quest)}
                          className="px-2.5 py-1 bg-white hover:bg-[#F2EBE0] border border-[#E8DFD1] rounded-xl text-[11px] font-bold text-[#2C2224] cursor-pointer"
                        >
                          Audit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Platform Security Rules Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4.5 rounded-3xl bg-[#E8F6F3] border border-[#A5DDD3] space-y-2">
              <div className="flex items-center gap-2 text-[#195C56]">
                <ShieldCheck className="w-5 h-5 text-[#2D8D84]" />
                <h4 className="text-xs font-black uppercase tracking-wider">Aturan Pajak Platform 10%</h4>
              </div>
              <p className="text-xs text-[#195C56] leading-relaxed">
                Platform fee 10% <strong>hanya memotong upah jasa / ongkir (bounty_fee)</strong>. Biaya nota belanja atau servis tambahan (item_cost) 100% diterima utuh oleh Runner tanpa potongan.
              </p>
            </div>

            <div className="p-4.5 rounded-3xl bg-[#FBF0F2] border border-[#F1CCD3] space-y-2">
              <div className="flex items-center gap-2 text-[#6E1C2F]">
                <AlertTriangle className="w-5 h-5 text-[#7A1E34]" />
                <h4 className="text-xs font-black uppercase tracking-wider">SLA Respons Transaksi</h4>
              </div>
              <p className="text-xs text-[#6E1C2F] leading-relaxed">
                JASTAP memiliki batas waktu respons <strong>5 Menit</strong>, sedangkan JARVIS memiliki batas waktu <strong>24 Jam</strong>. Jika belum ada runner yang mengambil, pemesan diberikan notifikasi untuk menaikkan bounty atau membatalkan pesanan.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW: SEMUA QUEST KAMPUS (QUEST OVERSIGHT) */}
      {/* ========================================================================= */}
      {activeAdminTab === 'quests' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-white border border-[#E8DFD1] rounded-3xl p-3 shadow-sm flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#8E7F83] absolute left-3.5 top-3" />
              <input
                type="text"
                value={questSearch}
                onChange={(e) => setQuestSearch(e.target.value)}
                placeholder="Cari ID quest, judul pesanan, nama customer, atau runner..."
                className="w-full pl-10 pr-3 py-2 bg-[#F7F3EC] border border-[#E8DFD1] rounded-2xl text-xs text-[#2C2224] placeholder:text-[#8E7F83] focus:outline-none focus:border-[#7A1E34]"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'ALL' | QuestStatus)}
                className="px-3 py-2 rounded-2xl bg-[#F7F3EC] border border-[#E8DFD1] text-xs font-bold text-[#2C2224] focus:outline-none"
              >
                <option value="ALL">Semua Status</option>
                <option value="OPEN">OPEN (Menunggu Runner)</option>
                <option value="ACCEPTED">ACCEPTED (Diterima)</option>
                <option value="ON_THE_WAY">ON_THE_WAY (OTW)</option>
                <option value="IN_PROGRESS">IN_PROGRESS (Dikerjakan)</option>
                <option value="DELIVERING">DELIVERING (Diantar)</option>
                <option value="COMPLETED">COMPLETED (Selesai)</option>
                <option value="CANCELLED">CANCELLED (Dibatalkan)</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as 'ALL' | ServiceCategory)}
                className="px-3 py-2 rounded-2xl bg-[#F7F3EC] border border-[#E8DFD1] text-xs font-bold text-[#2C2224] focus:outline-none"
              >
                <option value="ALL">Semua Layanan</option>
                <option value="JASTAP">🎒 JASTAP (Jasa Titip)</option>
                <option value="JARVIS">⚙️ JARVIS (Teknisi)</option>
              </select>
            </div>
          </div>

          {/* Quests Table / Cards */}
          <div className="space-y-3">
            {filteredQuests.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-[#E8DFD1]">
                <ShoppingBag className="w-10 h-10 text-[#D5C7B5] mx-auto mb-2" />
                <p className="text-sm font-bold text-[#2C2224]">Tidak Ada Quest Ditemukan</p>
                <p className="text-xs text-[#6E6265] mt-0.5">Coba sesuaikan kata kunci pencarian atau filter status.</p>
              </div>
            ) : (
              filteredQuests.map((quest) => {
                const platformFee = Math.round(quest.bounty_fee * 0.1);
                const runnerNet = quest.bounty_fee - platformFee;
                const totalBill = quest.bounty_fee + (quest.item_cost || 0);

                return (
                  <div
                    key={quest.id}
                    className="p-4 sm:p-5 bg-white border border-[#E8DFD1] hover:border-[#2D8D84] rounded-3xl shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FAF7F2] border border-[#E8DFD1] text-[#6E6265]">
                          {quest.id}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            quest.category === 'JASTAP'
                              ? 'bg-[#E8F6F3] text-[#1F6F67] border border-[#A5DDD3]'
                              : 'bg-[#FBF0F2] text-[#7A1E34] border border-[#F1CCD3]'
                          }`}
                        >
                          {quest.category}
                        </span>
                        <span
                          className={`text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full ${
                            quest.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : quest.status === 'CANCELLED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {quest.status}
                        </span>
                        <span className="text-[10px] text-[#8E7F83]">
                          {new Date(quest.created_at).toLocaleString('id-ID')}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-[#2C2224] line-clamp-1">{quest.title}</h4>
                      <p className="text-xs text-[#6E6265] line-clamp-1 mt-0.5">{quest.description}</p>

                      <div className="mt-2 flex items-center gap-4 text-[11px] text-[#4A3D41] flex-wrap">
                        <span>Pemesan: <strong className="text-[#2C2224]">{quest.customer_name}</strong> ({quest.customer_nim})</span>
                        <span>Runner: <strong className="text-[#2D8D84]">{quest.runner_name || '— Belum Ada —'}</strong></span>
                        <span>Rute: <em className="text-[#6E6265]">{quest.origin_address} → {quest.destination_address}</em></span>
                      </div>
                    </div>

                    {/* Financial Figures & Admin Action Buttons */}
                    <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#E8DFD1]">
                      <div className="text-left md:text-right">
                        <span className="text-[10px] text-[#8E7F83] block">Total Tagihan (Ongkir + Nota):</span>
                        <span className="text-base font-black text-[#7A1E34] font-mono">
                          Rp {totalBill.toLocaleString('id-ID')}
                        </span>
                        <span className="text-[10px] text-[#2D8D84] block font-semibold">
                          Platform Fee (10%): Rp {platformFee.toLocaleString('id-ID')}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          onClick={() => setSelectedQuestForAudit(quest)}
                          className="px-2.5 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F2EBE0] text-[#2C2224] border border-[#E8DFD1] text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                          title="Lihat Rincian Lengkap"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#2D8D84]" /> Audit
                        </button>

                        {quest.status !== 'COMPLETED' && (
                          <button
                            onClick={() => handleForceComplete(quest.id)}
                            className="px-2.5 py-1.5 rounded-xl bg-[#2D8D84] hover:bg-[#247D75] text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                            title="Selesaikan Transaksi Paksa"
                          >
                            <Check className="w-3.5 h-3.5" /> Selesaikan
                          </button>
                        )}

                        {quest.status !== 'CANCELLED' && quest.status !== 'COMPLETED' && (
                          <button
                            onClick={() => {
                              setCancelModalQuest(quest);
                              setCancelReasonInput('');
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-[#FBF0F2] hover:bg-[#F6E1E5] text-[#7A1E34] border border-[#F1CCD3] text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                            title="Batalkan Quest Paksa"
                          >
                            <Ban className="w-3.5 h-3.5" /> Batalkan
                          </button>
                        )}

                        {quest.status !== 'OPEN' && quest.status !== 'COMPLETED' && (
                          <button
                            onClick={() => handleResetQuest(quest.id)}
                            className="px-2 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F2EBE0] text-[#6E6265] border border-[#E8DFD1] text-[11px] font-semibold cursor-pointer"
                            title="Reset Quest ke OPEN"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteQuest(quest.id)}
                          className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 cursor-pointer"
                          title="Hapus Quest Permanen"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW: VERIFIKASI MAHASISWA & USER MANAGEMENT */}
      {/* ========================================================================= */}
      {activeAdminTab === 'users' && (
        <div className="space-y-4">
          {/* Search & Filter */}
          <div className="bg-white border border-[#E8DFD1] rounded-3xl p-3 shadow-sm flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#8E7F83] absolute left-3.5 top-3" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Cari nama mahasiswa, NIM 7-digit, atau jurusan..."
                className="w-full pl-10 pr-3 py-2 bg-[#F7F3EC] border border-[#E8DFD1] rounded-2xl text-xs text-[#2C2224] placeholder:text-[#8E7F83] focus:outline-none focus:border-[#7A1E34]"
              />
            </div>

            <select
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value as 'ALL' | 'customer' | 'runner')}
              className="px-3 py-2 rounded-2xl bg-[#F7F3EC] border border-[#E8DFD1] text-xs font-bold text-[#2C2224] focus:outline-none shrink-0"
            >
              <option value="ALL">Semua Peran</option>
              <option value="customer">Customer</option>
              <option value="runner">Runner</option>
            </select>
          </div>

          {/* User Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="p-4 rounded-3xl bg-white border border-[#E8DFD1] shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                        alt={user.full_name}
                        className="w-12 h-12 rounded-2xl object-cover border border-[#E8DFD1] shadow-xs"
                      />
                      <div>
                        <h4 className="text-sm font-extrabold text-[#2C2224]">{user.full_name}</h4>
                        <div className="flex items-center gap-1.5 text-xs text-[#6E6265]">
                          <span className="font-mono font-bold text-[#7A1E34]">NIM: {user.nim}</span>
                          <span>•</span>
                          <span className="capitalize">{user.role}</span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        user.is_verified !== false
                          ? 'bg-[#E8F6F3] text-[#2D8D84] border border-[#A5DDD3]'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {user.is_verified !== false ? '✓ Terverifikasi' : 'Pending'}
                    </span>
                  </div>

                  <div className="mt-3 p-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD1]/70 space-y-1 text-[11px] text-[#4A3D41]">
                    <p className="flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-[#7A1E34]" />
                      <span>{user.major || 'Mekatronika dan Kecerdasan Buatan (S1)'}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#2D8D84]" />
                      <span>{user.phone || '081298765432'}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-3.5 pt-3 border-t border-[#E8DFD1] flex items-center justify-between">
                  <button
                    onClick={() => setSelectedUserForKtm(user)}
                    className="text-xs text-[#7A1E34] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Lihat KTM</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        const nextVal = user.is_verified === false ? true : false;
                        adminVerifyUser(user.nim, nextVal);
                        showNotice(`Status verifikasi ${user.full_name} berhasil diubah.`);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                        user.is_verified !== false
                          ? 'bg-[#FBF0F2] text-[#7A1E34] hover:bg-[#F6E1E5]'
                          : 'bg-[#2D8D84] text-white hover:bg-[#247D75]'
                      }`}
                    >
                      {user.is_verified !== false ? 'Cabut Verifikasi' : 'Setujui Verifikasi'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW: BUKU BESAR KAS PLATFORM (10% FEE) */}
      {/* ========================================================================= */}
      {activeAdminTab === 'finance' && (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-white border border-[#E8DFD1] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-[#6E6265] uppercase tracking-wider block">Saldo Kas Terkumpul</span>
              <p className="text-3xl font-black text-[#2D8D84] font-mono mt-0.5">
                Rp {totalPlatformFee.toLocaleString('id-ID')}
              </p>
              <p className="text-xs text-[#6E6265] mt-1">
                Pajak 10% dari setiap ongkir jasa titip dan teknisi mahasiswa UPI yang selesai
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => alert(`Kas Platform sebesar Rp ${totalPlatformFee.toLocaleString('id-ID')} siap dialokasikan untuk pemeliharaan sistem atau program kemahasiswaan.`)}
                className="px-4 py-2.5 rounded-2xl bg-[#7A1E34] hover:bg-[#6E1C2F] text-white text-xs font-extrabold shadow-md transition-all cursor-pointer"
              >
                Alokasikan Kas Platform
              </button>
            </div>
          </div>

          <div className="bg-white border border-[#E8DFD1] rounded-3xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-extrabold text-[#2C2224] uppercase tracking-wider">
              Rincian Pemotongan 10% Transaksi Selesai
            </h3>

            {completedQuests.length === 0 ? (
              <p className="text-xs text-[#8E7F83] py-4 text-center">Belum ada transaksi completed yang membukukan kas platform.</p>
            ) : (
              <div className="divide-y divide-[#E8DFD1]">
                {completedQuests.map((q) => {
                  const fee = Math.round(q.bounty_fee * 0.1);
                  const net = q.bounty_fee - fee;
                  return (
                    <div key={q.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-[#2C2224] block">{q.title}</strong>
                        <span className="text-[11px] text-[#6E6265]">
                          Runner: {q.runner_name || 'Bima Arya'} • Ongkir Total: Rp {q.bounty_fee.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="text-right">
                        <strong className="text-[#2D8D84] font-mono block">+ Rp {fee.toLocaleString('id-ID')} (10%)</strong>
                        <span className="text-[10px] text-[#6E6265]">Net Runner (90%): Rp {net.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW: INTEGRITAS SISTEM & PENGATURAN */}
      {/* ========================================================================= */}
      {activeAdminTab === 'settings' && (
        <div className="bg-white border border-[#E8DFD1] rounded-3xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-extrabold text-[#2C2224] flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[#7A1E34]" />
              Integritas &amp; Pemeliharaan Sistem Kampus
            </h3>
            <p className="text-xs text-[#6E6265] mt-0.5">
              Kelola status database, reset data demo, dan kontrol keamanan ekosistem
            </p>
          </div>

          {/* Supabase Cloud Live Integration Status */}
          <div className="p-4 rounded-2xl bg-white border border-[#A5DDD3] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#E8F6F3] text-[#2D8D84] flex items-center justify-center font-bold">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#2C2224] flex items-center gap-1.5">
                    Supabase PostgreSQL Cloud
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Terhubung & Realtime Aktif
                    </span>
                  </h4>
                  <p className="text-[11px] text-[#6E6265] mt-0.5">
                    Sinkronisasi data multi-perangkat real-time untuk quest, live chat, dan profil pengguna.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-[11px]">
              <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DFD1]">
                <span className="text-[#8E7F83] block text-[10px]">Project Endpoint</span>
                <span className="font-mono font-bold text-[#2C2224] truncate block mt-0.5">
                  uognivvjfvmkhswdeqle.supabase.co
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DFD1]">
                <span className="text-[#8E7F83] block text-[10px]">Tabel Terhubung</span>
                <span className="font-bold text-[#2D8D84] block mt-0.5">
                  profiles, quests, chat_messages, reviews
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DFD1]">
                <span className="text-[#8E7F83] block text-[10px]">Mode Sinkronisasi</span>
                <span className="font-bold text-[#7A1E34] block mt-0.5">
                  Postgres Realtime Changes (Live)
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD1] flex items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-[#2C2224]">Kembalikan ke Data Awal Demo UPI</h4>
              <p className="text-[11px] text-[#6E6265] mt-0.5">
                Menghapus seluruh cache lokal dan mengembalikan profil, quest, serta riwayat ke sampel awal.
              </p>
            </div>
            <button
              onClick={() => {
                if (confirm('Apakah Anda yakin ingin mereset seluruh data kembali ke setelan pabrik demo?')) {
                  resetToDefaultData();
                  showNotice('Data berhasil di-reset ke setelan demo.');
                }
              }}
              className="px-3.5 py-2 rounded-xl bg-[#FBF0F2] hover:bg-[#F6E1E5] text-[#7A1E34] border border-[#F1CCD3] text-xs font-bold shrink-0 cursor-pointer"
            >
              Reset Data Demo
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: AUDIT DETAIL QUEST */}
      {/* ========================================================================= */}
      {selectedQuestForAudit && (
        <div className="fixed inset-0 z-50 bg-[#2C2224]/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF7F2] border border-[#E8DFD1] max-w-lg w-full rounded-3xl p-5 text-[#2C2224] shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setSelectedQuestForAudit(null)}
              className="absolute top-4 right-4 text-[#8E7F83] hover:text-[#2C2224] p-1.5 rounded-xl hover:bg-[#F2EBE0]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono font-bold text-[#7A1E34]">{selectedQuestForAudit.id}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white border border-[#E8DFD1] font-bold">
                {selectedQuestForAudit.status}
              </span>
            </div>

            <h3 className="text-base font-extrabold text-[#2C2224] mb-2">{selectedQuestForAudit.title}</h3>
            <p className="text-xs text-[#6E6265] mb-4">{selectedQuestForAudit.description}</p>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-white rounded-2xl border border-[#E8DFD1] space-y-1">
                <span className="font-bold text-[#7A1E34] block">Identitas Pemesan:</span>
                <p>Nama: <strong>{selectedQuestForAudit.customer_name}</strong></p>
                <p>NIM: <strong>{selectedQuestForAudit.customer_nim}</strong></p>
                <p>WhatsApp: <strong>{selectedQuestForAudit.customer_phone || '081298765432'}</strong></p>
              </div>

              <div className="p-3 bg-white rounded-2xl border border-[#E8DFD1] space-y-1">
                <span className="font-bold text-[#2D8D84] block">Identitas Eksekutor (Runner):</span>
                <p>Nama: <strong>{selectedQuestForAudit.runner_name || 'Belum diambil'}</strong></p>
                <p>WhatsApp: <strong>{selectedQuestForAudit.runner_phone || '—'}</strong></p>
              </div>

              <div className="p-3 bg-white rounded-2xl border border-[#E8DFD1] space-y-1">
                <span className="font-bold text-[#2C2224] block">Kalkulasi Keuangan:</span>
                <p>Bounty Jasa: Rp {selectedQuestForAudit.bounty_fee.toLocaleString('id-ID')}</p>
                <p>Nota Belanja: Rp {(selectedQuestForAudit.item_cost || 0).toLocaleString('id-ID')}</p>
                <p className="text-[#2D8D84] font-bold">Biaya Layanan Platform (10%): Rp {Math.round(selectedQuestForAudit.bounty_fee * 0.1).toLocaleString('id-ID')}</p>
                <p className="text-[#7A1E34] font-bold">Net Runner (90% + Nota): Rp {(selectedQuestForAudit.bounty_fee * 0.9 + (selectedQuestForAudit.item_cost || 0)).toLocaleString('id-ID')}</p>
              </div>

              {selectedQuestForAudit.receipt_image_url && (
                <div className="p-3 bg-white rounded-2xl border border-[#E8DFD1]">
                  <span className="font-bold text-[#2C2224] block mb-2">Foto Nota Belanja / Servis:</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedQuestForAudit.receipt_image_url}
                    alt="Nota Belanja"
                    className="w-full h-44 object-cover rounded-xl border border-[#E8DFD1]"
                  />
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedQuestForAudit(null)}
              className="mt-5 w-full py-2.5 rounded-2xl bg-[#7A1E34] hover:bg-[#6E1C2F] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Tutup Audit
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: LIHAT KTM MAHASISWA */}
      {/* ========================================================================= */}
      {selectedUserForKtm && (
        <div className="fixed inset-0 z-50 bg-[#2C2224]/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF7F2] border border-[#E8DFD1] max-w-sm w-full rounded-3xl p-5 text-[#2C2224] shadow-2xl relative text-center">
            <button
              onClick={() => setSelectedUserForKtm(null)}
              className="absolute top-4 right-4 text-[#8E7F83] hover:text-[#2C2224] p-1.5 rounded-xl hover:bg-[#F2EBE0]"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-extrabold text-[#2C2224] mb-1">Kartu Tanda Mahasiswa UPI</h3>
            <p className="text-xs text-[#6E6265] mb-3">{selectedUserForKtm.full_name} ({selectedUserForKtm.nim})</p>

            <div className="w-full h-52 rounded-2xl overflow-hidden bg-white border border-[#E8DFD1] mb-4 relative shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedUserForKtm.ktm_url || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500'}
                alt="KTM Mahasiswa"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg text-[10px] text-white font-mono">
                ✓ Auto-Watermark Perlindungan UPI Aktif
              </div>
            </div>

            <button
              onClick={() => setSelectedUserForKtm(null)}
              className="w-full py-2.5 rounded-2xl bg-[#7A1E34] hover:bg-[#6E1C2F] text-white text-xs font-bold cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: FORCE CANCEL QUEST INPUT REASON */}
      {/* ========================================================================= */}
      {cancelModalQuest && (
        <div className="fixed inset-0 z-50 bg-[#2C2224]/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF7F2] border border-[#E8DFD1] max-w-sm w-full rounded-3xl p-5 text-[#2C2224] shadow-2xl relative">
            <button
              onClick={() => setCancelModalQuest(null)}
              className="absolute top-4 right-4 text-[#8E7F83] hover:text-[#2C2224] p-1.5 rounded-xl hover:bg-[#F2EBE0]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-10 h-10 rounded-2xl bg-[#FBF0F2] text-[#7A1E34] border border-[#F1CCD3] flex items-center justify-center mb-3">
              <Ban className="w-5 h-5" />
            </div>

            <h3 className="text-base font-extrabold text-[#2C2224] mb-1">Batalkan Quest Paksa</h3>
            <p className="text-xs text-[#6E6265] mb-3">
              Alasan pembatalan untuk quest: <strong>{cancelModalQuest.title}</strong>
            </p>

            <textarea
              value={cancelReasonInput}
              onChange={(e) => setCancelReasonInput(e.target.value)}
              placeholder="Contoh: Terdeteksi pesanan duplikat atau melanggar norma kampus UPI"
              rows={3}
              className="w-full p-3 rounded-2xl bg-white border border-[#E8DFD1] text-xs text-[#2C2224] focus:outline-none focus:border-[#7A1E34] mb-4 resize-none"
            />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCancelModalQuest(null)}
                className="flex-1 py-2.5 rounded-2xl border border-[#E8DFD1] text-xs font-bold text-[#6E6265] hover:bg-[#F2EBE0]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleForceCancelSubmit}
                className="flex-1 py-2.5 rounded-2xl bg-[#7A1E34] hover:bg-[#6E1C2F] text-white text-xs font-bold shadow-md"
              >
                Eksekusi Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
