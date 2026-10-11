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
      {/* Runner Stats Bar Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950 via-slate-900 to-orange-950 border border-amber-500/20 p-5 sm:p-7 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-2">
              <Zap className="w-3.5 h-3.5" />
              <span>Mode Runner Aktif • Eksekutor Kampus</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Runner Hub: {profile.full_name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Cari quest di sekitarmu, terima pesanan langsung tanpa tawar-menawar, dan dapatkan penghasilan instan ke dompet!
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={onOpenWallet}
              className="p-3 bg-slate-950/80 rounded-2xl border border-amber-500/30 text-left hover:border-amber-400 transition-colors"
            >
              <span className="text-[10px] text-slate-400 block font-semibold">Saldo Runner</span>
              <span className="text-base font-extrabold text-emerald-400 font-mono">
                Rp {profile.wallet_balance.toLocaleString('id-ID')}
              </span>
            </button>

            <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-left">
              <span className="text-[10px] text-slate-400 block font-semibold">Rating Mahasiswa</span>
              <span className="text-base font-extrabold text-amber-400 flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400" /> {profile.rating}
              </span>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-left hidden sm:block">
              <span className="text-[10px] text-slate-400 block font-semibold">Quest Selesai</span>
              <span className="text-base font-extrabold text-white">
                {profile.total_completed_orders}x
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Runner Mode Switcher Tabs (Board vs My Running) */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800">
          <button
            onClick={() => setTabView('board')}
            className={`py-2 px-4 rounded-lg text-xs font-bold transition-all ${
              tabView === 'board'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Quest Board ({openQuests.length})
          </button>
          <button
            onClick={() => setTabView('running')}
            className={`py-2 px-4 rounded-lg text-xs font-bold transition-all ${
              tabView === 'running'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sedang Dikerjakan ({myRunningQuests.length})
          </button>
        </div>

        {/* Category Filters for Quest Board */}
        {tabView === 'board' && (
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-xs text-slate-400 mr-1 flex items-center gap-1 font-semibold">
              <Filter className="w-3 h-3" /> Filter:
            </span>
            <button
              onClick={() => setCategoryFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                categoryFilter === 'ALL'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setCategoryFilter('JASTAP')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                categoryFilter === 'JASTAP'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              <ShoppingBag className="w-3 h-3" /> JASTAP
            </button>
            <button
              onClick={() => setCategoryFilter('JARVIS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                categoryFilter === 'JARVIS'
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                  : 'text-slate-400 hover:text-violet-400'
              }`}
            >
              <Wrench className="w-3 h-3" /> JARVIS
            </button>
          </div>
        )}
      </div>

      {/* VIEW 1: QUEST BOARD (OPEN QUESTS AVAILABLE TO ACCEPT) */}
      {tabView === 'board' && (
        <div className="space-y-4">
          {openQuests.length === 0 ? (
            <div className="p-10 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400">
              <Clock className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="text-xs font-semibold text-slate-300">Belum ada quest terbuka untuk filter ini</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Quest baru dari mahasiswa lain akan muncul secara otomatis secara realtime.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {openQuests.map((quest) => (
                <div
                  key={quest.id}
                  className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-4 transition-all shadow-xl flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          quest.category === 'JASTAP'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                        }`}
                      >
                        {quest.category === 'JASTAP' ? 'JASTAP (The Agent)' : 'JARVIS (The Machinist)'}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {quest.quantity} {quest.unit}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2 break-words">
                      {quest.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 break-words">{quest.description}</p>

                    {/* Customer Identity Preview */}
                    <div className="flex items-center gap-2 my-2.5 p-2 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-300">
                      <User className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span className="font-bold text-white truncate">{quest.customer_name}</span>
                      <span className="text-slate-500 shrink-0">•</span>
                      <span className="text-slate-400 truncate min-w-0">{quest.customer_major || 'Mahasiswa UPI'}</span>
                      {quest.customer_nim && (
                        <span className="font-mono text-[10px] text-sky-400 shrink-0">({quest.customer_nim})</span>
                      )}
                    </div>

                    <div className="mt-2.5 p-2.5 bg-slate-950/70 rounded-xl border border-slate-800/80 space-y-1.5 text-[11px]">
                      <div className="flex items-start gap-1.5 text-slate-300 min-w-0">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span className="font-semibold text-slate-400 shrink-0">Ambil:</span>
                        <span className="break-words line-clamp-1 sm:line-clamp-2 min-w-0">
                          {quest.origin_address} {quest.landmark_origin ? `(Patokan: ${quest.landmark_origin})` : ''}
                        </span>
                      </div>
                      <div className="flex items-start gap-1.5 text-slate-300 min-w-0">
                        <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                        <span className="font-semibold text-slate-400 shrink-0">Antar:</span>
                        <span className="break-words line-clamp-1 sm:line-clamp-2 min-w-0">
                          {quest.destination_address} {quest.landmark_destination ? `(Patokan: ${quest.landmark_destination})` : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Upah Jasa (Bounty):</span>
                      <span className="text-base font-black text-amber-400 font-mono">
                        Rp {quest.bounty_fee.toLocaleString('id-ID')}
                      </span>
                      <span className="text-[10px] text-emerald-400 block font-mono">
                        Bersih 90%: Rp {Math.round(quest.bounty_fee * 0.9).toLocaleString('id-ID')} • +{Math.floor(quest.bounty_fee / 1000)} Poin
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenQuestDetail(quest.id)}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                      >
                        Rincian
                      </button>
                      <button
                        onClick={() => handleAcceptQuest(quest.id)}
                        className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md shadow-amber-400/20 transition-all cursor-pointer flex items-center gap-1"
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
            <div className="p-10 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400">
              <Zap className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="text-xs font-semibold text-slate-300">Tidak ada quest yang sedang Anda kerjakan</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Buka tab &quot;Quest Board&quot; untuk mengambil pesanan baru dari mahasiswa UPI.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myRunningQuests.map((quest) => (
                <div
                  key={quest.id}
                  className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4 shadow-xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono animate-pulse">
                        {quest.status}
                      </span>
                      {quest.customer_phone && (
                        <a
                          href={`https://wa.me/62${quest.customer_phone.replace(/^0/, '').replace(/\D/g, '')}?text=${encodeURIComponent(
                            `Halo Kak ${quest.customer_name}, saya runner CampusQuest UPI untuk pesanan "${quest.title}".`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm transition-colors"
                        >
                          <Phone className="w-3 h-3" /> Hubungi WA
                        </a>
                      )}
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-white line-clamp-2 break-words">{quest.title}</h3>

                    {/* Customer Identity Card in Running Quest */}
                    <div className="my-2.5 p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-sky-600/30 border border-sky-500/40 flex items-center justify-center text-xs font-bold text-sky-300 shrink-0">
                          {quest.customer_name ? quest.customer_name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{quest.customer_name}</p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {quest.customer_major || 'Mahasiswa UPI'} {quest.customer_nim ? `• NIM ${quest.customer_nim}` : ''}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1 text-[11px] mb-3">
                      <div className="flex items-start gap-1 text-slate-300 min-w-0">
                        <MapPin className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                        <span className="text-slate-400 shrink-0">Ambil:</span>
                        <span className="truncate">{quest.origin_address}</span>
                      </div>
                      <div className="flex items-start gap-1 text-slate-300 min-w-0">
                        <MapPin className="w-3 h-3 text-sky-400 shrink-0 mt-0.5" />
                        <span className="text-slate-400 shrink-0">Antar:</span>
                        <span className="truncate">{quest.destination_address}</span>
                      </div>
                    </div>

                    <div className="my-2 p-3 bg-amber-950/30 border border-amber-500/20 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-amber-300 uppercase font-bold flex items-center gap-1">
                          <KeyRound className="w-3 h-3" /> Kode OTP untuk Pemesan:
                        </span>
                        <span className="text-lg font-black font-mono text-amber-400 tracking-widest block mt-0.5">
                          {quest.completion_otp}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 sm:text-right max-w-full sm:max-w-[130px]">
                        Tunjukkan ke pemesan saat serah terima
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Bounty Jasa:</span>
                      <span className="text-sm font-bold text-amber-400 font-mono">
                        Rp {quest.bounty_fee.toLocaleString('id-ID')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenChat(quest.id)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 transition-colors"
                        title="Buka Chat"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onOpenQuestDetail(quest.id)}
                        className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
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
