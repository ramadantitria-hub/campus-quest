'use client';

import React, { useState, useEffect } from 'react';
import { CampusQuestProvider, useCampusQuest } from '@/context/CampusQuestContext';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import CustomerDashboard from '@/components/CustomerDashboard';
import RunnerDashboard from '@/components/RunnerDashboard';
import CreateQuestModal from '@/components/CreateQuestModal';
import QuestDetailModal from '@/components/QuestDetailModal';
import LiveChatDrawer from '@/components/LiveChatDrawer';
import KtmVerificationModal from '@/components/KtmVerificationModal';
import KtmLoginModal from '@/components/KtmLoginModal';
import KtmLoginScreen from '@/components/KtmLoginScreen';
import WalletModal from '@/components/WalletModal';
import CampusMap from '@/components/CampusMap';
import PwaInstallBanner from '@/components/PwaInstallBanner';
import { ServiceCategory } from '@/types/campus-quest';
import {
  Compass,
  MapPin,
  PlusCircle,
  ShoppingBag,
  Wrench,
  Search,
  Filter,
  Sparkles,
  Zap,
  Info,
  GraduationCap,
  ShieldCheck,
  ArrowLeft
} from 'lucide-react';

function CampusQuestApp() {
  const {
    activeRole,
    activeTab,
    setActiveTab,
    quests,
    selectedQuestId,
    setSelectedQuestId,
    isLoginModalOpen,
    openLoginModal,
    closeLoginModal,
    isLoggedIn,
    isLoaded,
    isGuestMode
  } = useCampusQuest();

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createCategory, setCreateCategory] = useState<ServiceCategory>('JASTAP');
  const [isKtmModalOpen, setIsKtmModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [activeChatQuestId, setActiveChatQuestId] = useState<string | null>(null);

  // Search & filter in 'quests' tab
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'ALL' | ServiceCategory>('ALL');

  // Register service worker for PWA
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('CampusQuest Service Worker terdaftar:', reg.scope);
        })
        .catch((err) => {
          console.log('SW register error:', err);
        });
    }
  }, []);

  const handleOpenCreateQuest = (cat: ServiceCategory) => {
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }
    setCreateCategory(cat);
    setIsCreateModalOpen(true);
  };

  const handleOpenQuestDetail = (id: string) => {
    setSelectedQuestId(id);
  };

  const handleOpenChat = (id: string) => {
    setActiveChatQuestId(id);
  };

  // Filtered list for 'quests' tab
  const filteredQuests = quests.filter((q) => {
    const matchCat = filterCategory === 'ALL' || q.category === filterCategory;
    const matchSearch =
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.origin_address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.destination_address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  // Hydration state check
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#F7F3EC] flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#6E1C2F] via-[#7A1E34] to-[#2D8D84] flex items-center justify-center text-white shadow-xl shadow-[#7A1E34]/25 animate-pulse mb-4">
          <Sparkles className="w-8 h-8" />
        </div>
        <div className="flex items-center gap-2 text-[#7A1E34] font-bold text-sm">
          <div className="w-2.5 h-2.5 rounded-full bg-[#2D8D84] animate-ping" />
          <span>Memverifikasi Sesi Mahasiswa UPI...</span>
        </div>
      </div>
    );
  }

  // Auth gate: Visitors must authenticate with KTM before entering website dashboard (unless exploring as guest)
  if (!isLoggedIn && !isGuestMode) {
    return (
      <>
        <KtmLoginScreen />
        <PwaInstallBanner />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F3EC] text-[#2C2224] pb-24 md:pb-8">
      {/* Top Navbar */}
      <Navbar
        onOpenKtmModal={() => setIsKtmModalOpen(true)}
        onOpenWalletModal={() => setIsWalletModalOpen(true)}
        onOpenLoginModal={openLoginModal}
      />

      {/* Desktop Sub Navigation Tabs */}
      <div className="hidden md:block bg-white/80 border-b border-[#E8DFD1] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-12">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-[#7A1E34] text-white shadow-sm'
                  : 'text-[#6E6265] hover:text-[#2C2224] hover:bg-[#F2EBE0]'
              }`}
            >
              Beranda ({activeRole === 'customer' ? 'Customer' : 'Runner'})
            </button>
            <button
              onClick={() => setActiveTab('quests')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'quests'
                  ? 'bg-[#7A1E34] text-white shadow-sm'
                  : 'text-[#6E6265] hover:text-[#2C2224] hover:bg-[#F2EBE0]'
              }`}
            >
              Eksplorasi Quest ({quests.length})
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'map'
                  ? 'bg-[#7A1E34] text-white shadow-sm'
                  : 'text-[#6E6265] hover:text-[#2C2224] hover:bg-[#F2EBE0]'
              }`}
            >
              Radar Peta Kampus
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeRole === 'customer' && (
              <button
                onClick={() => handleOpenCreateQuest('JASTAP')}
                className="px-3.5 py-1.5 rounded-full bg-[#2D8D84] hover:bg-[#247D75] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Buat Quest Baru</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        {/* Banner Guest Mode if not logged in */}
        {!isLoggedIn && (
          <div className="mb-6 p-4 sm:p-5 rounded-3xl bg-white border border-[#E8DFD1] shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#7A1E34] flex items-center justify-center text-white shadow-md shadow-[#7A1E34]/20 shrink-0">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FBF0F2] border border-[#F1CCD3] text-[#7A1E34] text-[10px] font-bold mb-1">
                  <ShieldCheck className="w-3 h-3 text-[#7A1E34]" /> Verifikasi Mahasiswa Diperlukan
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-[#2C2224]">
                  Masuk Menggunakan KTM untuk Akses Penuh
                </h3>
                <p className="text-xs text-[#6E6265] mt-0.5 max-w-xl">
                  Pindai KTM Anda secara instan dengan OCR AI, masuk via SSO Kampus, atau coba salah satu akun demo mahasiswa UPI.
                </p>
              </div>
            </div>

            <button
              onClick={openLoginModal}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#7A1E34] to-[#9B2444] hover:from-[#6E1C2F] hover:to-[#8A203C] text-white font-bold text-xs shadow-md shadow-[#7A1E34]/25 transition-all shrink-0 flex items-center gap-2 cursor-pointer self-start sm:self-auto"
            >
              <ShieldCheck className="w-4 h-4 text-[#A5DDD3]" />
              <span>Login dengan KTM</span>
            </button>
          </div>
        )}

        {/* VIEW: HOME */}
        {activeTab === 'home' && (
          <>
            {activeRole === 'customer' ? (
              <CustomerDashboard
                onOpenCreateQuest={handleOpenCreateQuest}
                onOpenQuestDetail={handleOpenQuestDetail}
                onOpenChat={handleOpenChat}
                onOpenMap={() => setActiveTab('map')}
              />
            ) : (
              <RunnerDashboard
                onOpenQuestDetail={handleOpenQuestDetail}
                onOpenChat={handleOpenChat}
                onOpenWallet={() => setIsWalletModalOpen(true)}
              />
            )}
          </>
        )}

        {/* VIEW: EXPLORE QUESTS LIST */}
        {activeTab === 'quests' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('home')}
                  className="p-2.5 rounded-2xl bg-white border border-[#E8DFD1] hover:bg-[#F2EBE0] text-[#6E6265] hover:text-[#2C2224] transition-colors cursor-pointer shadow-xs"
                  title="Kembali ke Halaman Utama"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h2 className="text-xl font-extrabold text-[#2C2224] flex items-center gap-2">
                    <Compass className="w-5 h-5 text-[#2D8D84]" />
                    Semua Quest Mahasiswa
                  </h2>
                  <p className="text-xs text-[#6E6265]">
                    Daftar permintaan JASTAP &amp; JARVIS di lingkungan kampus UPI
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab('home')}
                  className="px-3.5 py-2 rounded-2xl bg-white border border-[#E8DFD1] hover:bg-[#F2EBE0] text-[#4A3D41] hover:text-[#2C2224] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Ke Halaman Utama</span>
                </button>
                {activeRole === 'customer' && (
                  <button
                    onClick={() => handleOpenCreateQuest('JASTAP')}
                    className="px-4 py-2 rounded-2xl bg-[#2D8D84] hover:bg-[#247D75] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#2D8D84]/25"
                  >
                    <PlusCircle className="w-4 h-4" /> Buat Quest
                  </button>
                )}
              </div>
            </div>

            {/* Search and Filters Bar */}
            <div className="bg-white border border-[#E8DFD1] rounded-3xl p-3 shadow-sm flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#8E7F83] absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari makanan, print tugas, servis laptop, lokasi..."
                  className="w-full pl-10 pr-3 py-2 bg-[#F7F3EC] border border-[#E8DFD1] rounded-2xl text-xs text-[#2C2224] placeholder:text-[#8E7F83] focus:outline-none focus:border-[#7A1E34]"
                />
              </div>

              <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto">
                <button
                  onClick={() => setFilterCategory('ALL')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    filterCategory === 'ALL'
                      ? 'bg-[#7A1E34] text-white shadow-xs'
                      : 'text-[#6E6265] hover:text-[#2C2224] bg-[#F2EBE0]'
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setFilterCategory('JASTAP')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    filterCategory === 'JASTAP'
                      ? 'bg-[#2D8D84] text-white shadow-xs'
                      : 'bg-[#E8F6F3] text-[#1F6F67] border border-[#A5DDD3]'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" /> JASTAP
                </button>
                <button
                  onClick={() => setFilterCategory('JARVIS')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    filterCategory === 'JARVIS'
                      ? 'bg-[#7A1E34] text-white shadow-xs'
                      : 'bg-[#FBF0F2] text-[#7A1E34] border border-[#F1CCD3]'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5" /> JARVIS
                </button>
              </div>
            </div>

            {/* Quests Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredQuests.map((quest) => (
                <div
                  key={quest.id}
                  onClick={() => handleOpenQuestDetail(quest.id)}
                  className="bg-white border border-[#E8DFD1] hover:border-[#2D8D84] rounded-3xl p-4.5 transition-all shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between group hover:-translate-y-0.5"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          quest.category === 'JASTAP'
                            ? 'bg-[#E8F6F3] text-[#1F6F67] border border-[#A5DDD3]'
                            : 'bg-[#FBF0F2] text-[#7A1E34] border border-[#F1CCD3]'
                        }`}
                      >
                        {quest.category}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F2EBE0] text-[#6E6265]">
                        {quest.status}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-[#2C2224] group-hover:text-[#7A1E34] transition-colors line-clamp-2 break-words">
                      {quest.title}
                    </h4>
                    <p className="text-xs text-[#6E6265] line-clamp-2 break-words mt-1">
                      {quest.description}
                    </p>

                    <div className="mt-3 p-2.5 bg-[#FAF7F2] rounded-2xl border border-[#E8DFD1]/70 space-y-1.5 text-[11px] text-[#4A3D41]">
                      <div className="flex items-start gap-1.5 min-w-0">
                        <MapPin className="w-3.5 h-3.5 text-[#2D8D84] shrink-0 mt-0.5" />
                        <span className="break-words line-clamp-1 min-w-0">{quest.origin_address}</span>
                      </div>
                      <div className="flex items-start gap-1.5 min-w-0">
                        <MapPin className="w-3.5 h-3.5 text-[#7A1E34] shrink-0 mt-0.5" />
                        <span className="break-words line-clamp-1 min-w-0">{quest.destination_address}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E8DFD1] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#8E7F83] block font-semibold">Bounty Jasa</span>
                      <span className="text-sm font-black text-[#7A1E34] font-mono">
                        Rp {quest.bounty_fee.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-[#2D8D84] group-hover:translate-x-1 transition-transform">
                      Detail →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW: CAMPUS RADAR MAP */}
        {activeTab === 'map' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('home')}
                  className="p-2.5 rounded-2xl bg-white border border-[#E8DFD1] hover:bg-[#F2EBE0] text-[#6E6265] hover:text-[#2C2224] transition-colors cursor-pointer shadow-xs"
                  title="Kembali ke Halaman Utama"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h2 className="text-xl font-extrabold text-[#2C2224] flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#2D8D84]" />
                    Radar Peta Kampus UPI
                  </h2>
                  <p className="text-xs text-[#6E6265]">
                    Visualisasi titik-titik kumpul mahasiswa, tracking runner, dan titik penjemputan barang
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('home')}
                className="px-3.5 py-2 rounded-2xl bg-white border border-[#E8DFD1] hover:bg-[#F2EBE0] text-[#4A3D41] hover:text-[#2C2224] font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto transition-colors cursor-pointer shadow-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Ke Halaman Utama</span>
              </button>
            </div>

            <CampusMap
              activeQuest={
                quests.find(
                  (q) => q.status === 'ON_THE_WAY' || q.status === 'DELIVERING' || q.status === 'IN_PROGRESS'
                ) || null
              }
            />
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        onOpenKtmModal={() => setIsKtmModalOpen(true)}
        onOpenWalletModal={() => setIsWalletModalOpen(true)}
        onOpenLoginModal={openLoginModal}
      />

      {/* Modals & Drawers */}
      <CreateQuestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        defaultCategory={createCategory}
      />

      {selectedQuestId && (
        <QuestDetailModal
          questId={selectedQuestId}
          isOpen={Boolean(selectedQuestId)}
          onClose={() => setSelectedQuestId(null)}
          onOpenChat={(id) => handleOpenChat(id)}
        />
      )}

      {activeChatQuestId && (
        <LiveChatDrawer
          questId={activeChatQuestId}
          isOpen={Boolean(activeChatQuestId)}
          onClose={() => setActiveChatQuestId(null)}
        />
      )}

      <KtmVerificationModal
        isOpen={isKtmModalOpen}
        onClose={() => setIsKtmModalOpen(false)}
      />

      <KtmLoginModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
      />

      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />

      {/* PWA Install Banner */}
      <PwaInstallBanner />
    </div>
  );
}

export default function Home() {
  return (
    <CampusQuestProvider>
      <CampusQuestApp />
    </CampusQuestProvider>
  );
}
