'use client';

import React, { useState } from 'react';
import { useCampusQuest } from '@/context/CampusQuestContext';
import { ServiceCategory, Quest } from '@/types/campus-quest';
import {
  Zap,
  ShoppingBag,
  Wrench,
  Coins,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Wallet,
  Star,
  Award,
  MessageSquare,
  KeyRound,
  Phone,
  User
} from 'lucide-react';

interface RunnerDashboardProps {
  onOpenQuestDetail: (questId: string) => void;
  onOpenChat: (questId: string) => void;
  onOpenWallet: () => void;
}

export default function RunnerDashboard({
  onOpenQuestDetail,
  onOpenChat,
  onOpenWallet
}: RunnerDashboardProps) {
  const { profile, quests, acceptQuest, declineQuest, isLoggedIn, openLoginModal } = useCampusQuest();

  const [categoryFilter, setCategoryFilter] = useState<'ALL' | ServiceCategory>('ALL');
  const [tabView, setTabView] = useState<'board' | 'running'>('board');

  const handleAcceptQuest = (questId: string) => {
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }
    acceptQuest(questId);
    setTabView('running');
    onOpenQuestDetail(questId);
  };

  // Filter available open quests for the board
  const openQuests = quests.filter((q) => {
    if (q.status !== 'OPEN') return false;
    if (categoryFilter === 'ALL') return true;
    return q.category === categoryFilter;
  });

  // Quests being run by THIS specific runner profile
  const myRunningQuests = quests.filter(
    (q) => q.runner_id === profile.id && q.status !== 'OPEN' && q.status !== 'COMPLETED' && q.status !== 'CANCELLED'
  );

  return (
    <div className="space-y-6">
      {/* Runner Stats Bar Header - Tactile Tosca Gradient */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#195C56] via-[#247D75] to-[#2D8D84] border border-white/20 p-5 sm:p-7 shadow-xl text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/30 text-[#D4EFEA] text-xs font-bold mb-2">
              <Zap className="w-3.5 h-3.5 text-[#A5DDD3]" />
              <span>Mode Runner Aktif • Eksekutor Kampus UPI</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
              Runner Hub: {profile.full_name}
            </h1>
            <p className="text-xs sm:text-sm text-stone-200 mt-1 max-w-xl">
              Cari quest di sekitarmu, terima pesanan langsung tanpa tawar-menawar, dan dapatkan penghasilan instan ke dompet!
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={onOpenWallet}
              className="p-3 bg-white/15 rounded-2xl border border-white/25 text-left hover:bg-white/25 transition-all cursor-pointer backdrop-blur-md shadow-xs"
            >
              <span className="text-[10px] text-stone-200 block font-semibold">Saldo Runner</span>
              <span className="text-base font-black text-[#A5DDD3] font-mono">
                Rp {profile.wallet_balance.toLocaleString('id-ID')}
              </span>
            </button>

            <div className="p-3 bg-white/15 rounded-2xl border border-white/25 text-left backdrop-blur-md shadow-xs">
              <span className="text-[10px] text-stone-200 block font-semibold">Rating Mahasiswa</span>
              <span className="text-base font-black text-amber-300 flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-300 text-amber-300" /> {profile.rating}
              </span>
            </div>

            <div className="p-3 bg-white/15 rounded-2xl border border-white/25 text-left hidden sm:block backdrop-blur-md shadow-xs">
              <span className="text-[10px] text-stone-200 block font-semibold">Quest Selesai</span>
              <span className="text-base font-black text-white">
                {profile.total_completed_orders}x
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Runner Mode Switcher Tabs (Board vs My Running) */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex p-1 bg-[#F2EBE0] rounded-2xl border border-[#E3D7C6] shadow-inner">
          <button
            onClick={() => setTabView('board')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              tabView === 'board'
                ? 'bg-[#7A1E34] text-white shadow-md shadow-[#7A1E34]/25'
                : 'text-[#6E6265] hover:text-[#2C2224]'
            }`}
          >
            Quest Board ({openQuests.length})
          </button>
          <button
            onClick={() => setTabView('running')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              tabView === 'running'
                ? 'bg-[#2D8D84] text-white shadow-md shadow-[#2D8D84]/25'
                : 'text-[#6E6265] hover:text-[#2C2224]'
            }`}
          >
            Sedang Dikerjakan ({myRunningQuests.length})
          </button>
        </div>

        {/* Category Filters for Quest Board */}
        {tabView === 'board' && (
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-xs text-[#8E7F83] mr-1 flex items-center gap-1 font-semibold">
              <Filter className="w-3 h-3" /> Filter:
            </span>
            <button
              onClick={() => setCategoryFilter('ALL')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                categoryFilter === 'ALL'
                  ? 'bg-[#7A1E34] text-white shadow-xs'
                  : 'text-[#6E6265] hover:text-[#2C2224] bg-[#F2EBE0]'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setCategoryFilter('JASTAP')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                categoryFilter === 'JASTAP'
                  ? 'bg-[#2D8D84] text-white shadow-xs'
                  : 'bg-[#E8F6F3] text-[#1F6F67] border border-[#A5DDD3]'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" /> JASTAP
            </button>
            <button
              onClick={() => setCategoryFilter('JARVIS')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                categoryFilter === 'JARVIS'
                  ? 'bg-[#7A1E34] text-white shadow-xs'
                  : 'bg-[#FBF0F2] text-[#7A1E34] border border-[#F1CCD3]'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" /> JARVIS
            </button>
          </div>
        )}
      </div>

      {/* VIEW 1: QUEST BOARD (OPEN QUESTS AVAILABLE TO ACCEPT) */}
      {tabView === 'board' && (
        <div className="space-y-4">
          {openQuests.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-3xl border border-[#E8DFD1] text-[#8E7F83] shadow-xs">
              <Clock className="w-8 h-8 mx-auto text-[#D5C7B5] mb-2" />
              <p className="text-xs font-bold text-[#2C2224]">Belum ada quest terbuka untuk filter ini</p>
              <p className="text-[11px] text-[#8E7F83] mt-0.5">
                Quest baru dari mahasiswa UPI lain akan muncul secara otomatis secara realtime.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {openQuests.map((quest) => (
                <div
                  key={quest.id}
                  className="bg-white border border-[#E8DFD1] hover:border-[#2D8D84] rounded-3xl p-4.5 transition-all shadow-sm hover:shadow-md flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          quest.category === 'JASTAP'
                            ? 'bg-[#E8F6F3] text-[#1F6F67] border border-[#A5DDD3]'
                            : 'bg-[#FBF0F2] text-[#7A1E34] border border-[#F1CCD3]'
                        }`}
                      >
                        {quest.category === 'JASTAP' ? 'JASTAP (The Agent)' : 'JARVIS (The Machinist)'}
                      </span>
                      <span className="text-[11px] font-mono text-[#8E7F83]">
                        {quest.quantity} {quest.unit}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-[#2C2224] group-hover:text-[#7A1E34] transition-colors line-clamp-2 break-words">
                      {quest.title}
                    </h3>
                    <p className="text-xs text-[#6E6265] mt-1 line-clamp-2 break-words">{quest.description}</p>

                    {/* Customer Identity Preview */}
                    <div className="flex items-center gap-2 my-2.5 p-2 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD1] text-[11px] text-[#4A3D41]">
                      <User className="w-3.5 h-3.5 text-[#2D8D84] shrink-0" />
                      <span className="font-bold text-[#2C2224] truncate">{quest.customer_name}</span>
                      <span className="text-[#D5C7B5] shrink-0">•</span>
                      <span className="text-[#6E6265] truncate min-w-0">{quest.customer_major || 'Mahasiswa UPI'}</span>
                      {quest.customer_nim && (
                        <span className="font-mono text-[10px] text-[#7A1E34] shrink-0">({quest.customer_nim})</span>
                      )}
                    </div>

                    <div className="mt-2.5 p-2.5 bg-[#FAF7F2] rounded-2xl border border-[#E8DFD1]/70 space-y-1.5 text-[11px]">
                      <div className="flex items-start gap-1.5 text-[#4A3D41] min-w-0">
                        <MapPin className="w-3.5 h-3.5 text-[#2D8D84] shrink-0 mt-0.5" />
                        <span className="font-bold text-[#7E7074] shrink-0">Ambil:</span>
                        <span className="break-words line-clamp-1 sm:line-clamp-2 min-w-0">
                          {quest.origin_address} {quest.landmark_origin ? `(Patokan: ${quest.landmark_origin})` : ''}
                        </span>
                      </div>
                      <div className="flex items-start gap-1.5 text-[#4A3D41] min-w-0">
                        <MapPin className="w-3.5 h-3.5 text-[#7A1E34] shrink-0 mt-0.5" />
                        <span className="font-bold text-[#7E7074] shrink-0">Antar:</span>
                        <span className="break-words line-clamp-1 sm:line-clamp-2 min-w-0">
                          {quest.destination_address} {quest.landmark_destination ? `(Patokan: ${quest.landmark_destination})` : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E8DFD1] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#8E7F83] block font-semibold">Upah Jasa (Bounty):</span>
                      <span className="text-base font-black text-[#7A1E34] font-mono">
                        Rp {quest.bounty_fee.toLocaleString('id-ID')}
                      </span>
                      <span className="text-[10px] text-[#2D8D84] block font-mono font-bold">
                        Bersih 90%: Rp {Math.round(quest.bounty_fee * 0.9).toLocaleString('id-ID')} • +{Math.floor(quest.bounty_fee / 1000)} Poin
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenQuestDetail(quest.id)}
                        className="px-3 py-2 rounded-2xl bg-[#FAF7F2] hover:bg-[#F2EBE0] text-[#4A3D41] text-xs font-bold border border-[#E8DFD1] transition-colors cursor-pointer"
                      >
                        Rincian
                      </button>
                      <button
                        onClick={() => handleAcceptQuest(quest.id)}
                        className="px-4 py-2 rounded-2xl bg-[#2D8D84] hover:bg-[#247D75] text-white font-extrabold text-xs shadow-md shadow-[#2D8D84]/25 transition-all cursor-pointer flex items-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Ambil Quest
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: ACTIVE QUESTS BEING RUN */}
      {tabView === 'running' && (
        <div className="space-y-4">
          {myRunningQuests.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-3xl border border-[#E8DFD1] text-[#8E7F83] shadow-xs">
              <Zap className="w-8 h-8 mx-auto text-[#D5C7B5] mb-2" />
              <p className="text-xs font-bold text-[#2C2224]">Tidak ada quest yang sedang Anda kerjakan</p>
              <p className="text-[11px] text-[#8E7F83] mt-0.5">
                Buka tab &quot;Quest Board&quot; untuk mengambil pesanan baru dari mahasiswa UPI.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myRunningQuests.map((quest) => (
                <div
                  key={quest.id}
                  className="bg-white border border-[#2D8D84]/40 rounded-3xl p-4.5 shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#E8F6F3] text-[#1F6F67] border border-[#A5DDD3] font-mono animate-pulse">
                        {quest.status}
                      </span>
                      {quest.customer_phone && (
                        <a
                          href={`https://wa.me/62${quest.customer_phone.replace(/^0/, '').replace(/\D/g, '')}?text=${encodeURIComponent(
                            `Halo Kak ${quest.customer_name}, saya runner CampusQuest UPI untuk pesanan "${quest.title}".`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-xl bg-[#2D8D84] hover:bg-[#247D75] text-white text-[10px] font-bold flex items-center gap-1 shadow-xs transition-colors"
                        >
                          <Phone className="w-3 h-3" /> Hubungi WA
                        </a>
                      )}
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-[#2C2224] line-clamp-2 break-words">{quest.title}</h3>

                    {/* Customer Identity Card in Running Quest */}
                    <div className="my-2.5 p-2.5 bg-[#FAF7F2] rounded-2xl border border-[#E8DFD1] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-[#E8F6F3] border border-[#A5DDD3] flex items-center justify-center text-xs font-bold text-[#2D8D84] shrink-0">
                          {quest.customer_name ? quest.customer_name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#2C2224] truncate">{quest.customer_name}</p>
                          <p className="text-[10px] text-[#6E6265] truncate">
                            {quest.customer_major || 'Mahasiswa UPI'} {quest.customer_nim ? `• NIM ${quest.customer_nim}` : ''}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 bg-[#FAF7F2] rounded-2xl border border-[#E8DFD1]/70 space-y-1 text-[11px] mb-3 text-[#4A3D41]">
                      <div className="flex items-start gap-1 min-w-0">
                        <MapPin className="w-3.5 h-3.5 text-[#2D8D84] shrink-0 mt-0.5" />
                        <span className="text-[#8E7F83] shrink-0">Ambil:</span>
                        <span className="truncate">{quest.origin_address}</span>
                      </div>
                      <div className="flex items-start gap-1 min-w-0">
                        <MapPin className="w-3.5 h-3.5 text-[#7A1E34] shrink-0 mt-0.5" />
                        <span className="text-[#8E7F83] shrink-0">Antar:</span>
                        <span className="truncate">{quest.destination_address}</span>
                      </div>
                    </div>

                    <div className="my-2 p-3 bg-[#FBF0F2] border border-[#F1CCD3] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-[#7A1E34] uppercase font-bold flex items-center gap-1">
                          <KeyRound className="w-3 h-3" /> Kode OTP untuk Pemesan:
                        </span>
                        <span className="text-lg font-black font-mono text-[#7A1E34] tracking-widest block mt-0.5">
                          {quest.completion_otp}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#8E7F83] sm:text-right max-w-full sm:max-w-[130px]">
                        Tunjukkan ke pemesan saat serah terima
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-[#E8DFD1] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#8E7F83] block font-semibold">Bounty Jasa:</span>
                      <span className="text-sm font-bold text-[#7A1E34] font-mono">
                        Rp {quest.bounty_fee.toLocaleString('id-ID')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenChat(quest.id)}
                        className="p-2 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD1] hover:bg-[#F2EBE0] text-[#2D8D84] transition-colors cursor-pointer"
                        title="Buka Chat"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onOpenQuestDetail(quest.id)}
                        className="px-3.5 py-2 rounded-2xl bg-[#7A1E34] hover:bg-[#6E1C2F] text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
                      >
                        Kelola Progres &amp; Nota
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


