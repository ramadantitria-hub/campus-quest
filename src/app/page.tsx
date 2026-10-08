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
  Info
} from 'lucide-react';

function CampusQuestApp() {
  const {
    activeRole,
    activeTab,
    setActiveTab,
    quests,
    selectedQuestId,
    setSelectedQuestId
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 pb-20 md:pb-8">
      {/* Top Navbar */}
      <Navbar
        onOpenKtmModal={() => setIsKtmModalOpen(true)}
        onOpenWalletModal={() => setIsWalletModalOpen(true)}
      />

      {/* Desktop Sub Navigation Tabs */}
      <div className="hidden md:block bg-slate-900/60 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-12">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'home'
                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Beranda ({activeRole === 'customer' ? 'Customer' : 'Runner'})
            </button>
            <button
              onClick={() => setActiveTab('quests')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'quests'
                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Eksplorasi Quest ({quests.length})
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'map'
                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Radar Peta Kampus
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeRole === 'customer' && (
              <button
                onClick={() => handleOpenCreateQuest('JASTAP')}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
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
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Compass className="w-5 h-5 text-sky-400" />
                  Semua Quest Mahasiswa
                </h2>
                <p className="text-xs text-slate-400">
                  Daftar permintaan JASTAP &amp; JARVIS di lingkungan kampus
                </p>
              </div>

              {activeRole === 'customer' && (
                <button
                  onClick={() => handleOpenCreateQuest('JASTAP')}
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 self-start cursor-pointer shadow-lg shadow-sky-500/20"
                >
                  <PlusCircle className="w-4 h-4" /> Buat Quest
                </button>
              )}
            </div>

            {/* Search and Filters Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari makanan, print tugas, servis laptop, lokasi..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto">
                <button
                  onClick={() => setFilterCategory('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    filterCategory === 'ALL'
                      ? 'bg-slate-800 text-white border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setFilterCategory('JASTAP')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                    filterCategory === 'JASTAP'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'text-slate-400 hover:text-emerald-400'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" /> JASTAP
                </button>
                <button
                  onClick={() => setFilterCategory('JARVIS')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                    filterCategory === 'JARVIS'
                      ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                      : 'text-slate-400 hover:text-violet-400'
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
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-all shadow-lg cursor-pointer flex flex-col justify-between group hover:-translate-y-0.5"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          quest.category === 'JASTAP'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                        }`}
                      >
                        {quest.category}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        {quest.status}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors line-clamp-1">
                      {quest.title}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                      {quest.description}
                    </p>

                    <div className="mt-3 p-2 bg-slate-950/60 rounded-xl space-y-1 text-[11px] text-slate-400">
                      <div className="flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                        <span className="truncate">{quest.origin_address}</span>
                      </div>
                      <div className="flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-sky-400 shrink-0" />
                        <span className="truncate">{quest.destination_address}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 block font-semibold">Bounty Jasa</span>
                      <span className="text-sm font-extrabold text-amber-400 font-mono">
                        Rp {quest.bounty_fee.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-sky-400 group-hover:translate-x-1 transition-transform">
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
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-sky-400" />
                Radar Peta Kampus Terpadu
              </h2>
              <p className="text-xs text-slate-400">
                Visualisasi titik-titik kumpul mahasiswa, tracking runner, dan titik penjemputan barang
              </p>
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
