'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useCampusQuest } from '@/context/CampusQuestContext';
import { ServiceCategory, Quest } from '@/types/campus-quest';
import { soundFX } from '@/lib/audio';
import {
  ShoppingBag,
  Wrench,
  PlusCircle,
  Clock,
  CheckCircle,
  MapPin,
  ChevronRight,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Receipt,
  MessageSquare,
  Ban,
  AlertTriangle,
  Coins,
  Bell,
  X
} from 'lucide-react';

interface CustomerDashboardProps {
  onOpenCreateQuest: (category: ServiceCategory) => void;
  onOpenQuestDetail: (questId: string) => void;
  onOpenChat: (questId: string) => void;
  onOpenMap: () => void;
}

export default function CustomerDashboard({
  onOpenCreateQuest,
  onOpenQuestDetail,
  onOpenChat,
  onOpenMap
}: CustomerDashboardProps) {
  const { profile, quests, cancelQuest, increaseBounty } = useCampusQuest();

  const [currentTime, setCurrentTime] = useState(Date.now());
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [activeNotification, setActiveNotification] = useState<{ id: string; title: string; category: string } | null>(null);
  const notifiedIdsRef = useRef<Set<string>>(new Set());

  // Quests belonging to this customer profile specifically
  const activeQuests = quests.filter(
    (q) => q.customer_id === profile.id && q.status !== 'COMPLETED' && q.status !== 'CANCELLED'
  );
  const completedQuests = quests.filter(
    (q) => q.customer_id === profile.id && q.status === 'COMPLETED'
  );
  const cancelledQuests = quests.filter(
    (q) => q.customer_id === profile.id && q.status === 'CANCELLED'
  );

  // Interval timer for real-time countdown & timeout alert
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setCurrentTime(now);

      // Check for unclaimed timeout quests: 5 menit (JASTAP), 24 jam (JARVIS)
      activeQuests.forEach((q) => {
        if (q.status === 'OPEN' && !q.runner_id) {
          const createdMs = new Date(q.created_at).getTime();
          const elapsedMs = now - createdMs;
          const limitMs = q.category === 'JASTAP' ? 5 * 60 * 1000 : 24 * 60 * 60 * 1000;

          if (elapsedMs >= limitMs && !notifiedIdsRef.current.has(q.id)) {
            notifiedIdsRef.current.add(q.id);
            soundFX.notification();
            setActiveNotification({
              id: q.id,
              title: q.title,
              category: q.category
            });
          }
        }
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [activeQuests]);

  const handleCancelQuest = (questId: string, questTitle: string) => {
    if (confirm(`Apakah Anda yakin ingin membatalkan pesanan "${questTitle}"? Pesanan akan dihapus dari antrean runner.`)) {
      const res = cancelQuest(questId);
      if (res.success) {
        setActionFeedback(res.message);
        setTimeout(() => setActionFeedback(null), 3500);
      } else {
        alert(res.message);
      }
    }
  };

  const handleQuickIncreaseBounty = (questId: string) => {
    const res = increaseBounty(questId, 2000);
    setActionFeedback(res.message);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 border border-sky-500/20 p-5 sm:p-7 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CampusQuest: inDrive Model untuk Mahasiswa</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Halo, {profile.full_name}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Butuh titip beli makan, print berkas, atau laptop bermasalah? Tentukan sendiri bounty harga jasamu dan mahasiswa lain siap membantu!
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onOpenCreateQuest('JASTAP')}
              className="px-4 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-400/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Titip JASTAP</span>
            </button>
            <button
              onClick={() => onOpenCreateQuest('JARVIS')}
              className="px-4 py-2.5 rounded-xl bg-violet-500 hover:bg-violet-400 text-white font-bold text-xs shadow-lg shadow-violet-500/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Wrench className="w-4 h-4" />
              <span>Panggil JARVIS</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Notification Banner for 5 min (JASTAP) / 24 hr (JARVIS) timeout */}
      {activeNotification && (
        <div className="p-4 bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border border-amber-500/50 rounded-2xl shadow-xl flex items-start justify-between gap-3 animate-fadeIn">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                {activeNotification.category === 'JASTAP' ? '⏰ Notifikasi 5 Menit: Titipan JASTAP Belum Diambil' : '⏰ Notifikasi 24 Jam: Permintaan JARVIS Belum Diambil'}
              </h4>
              <p className="text-xs text-slate-200 mt-0.5">
                Pesanan <strong>&ldquo;{activeNotification.title}&rdquo;</strong> belum ada yang mengambil. Anda dapat menaikkan bounty tawaran atau membatalkan pesanan.
              </p>
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => handleQuickIncreaseBounty(activeNotification.id)}
                  className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <Coins className="w-3 h-3" />
                  + Naikkan Bounty Rp 2.000
                </button>
                <button
                  onClick={() => handleCancelQuest(activeNotification.id, activeNotification.title)}
                  className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-500/40 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <Ban className="w-3 h-3" />
                  Batalkan Pesanan
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveNotification(null)}
            className="text-slate-400 hover:text-white p-1 cursor-pointer"
            title="Tutup Notifikasi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Action feedback toast banner */}
      {actionFeedback && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Two Core Services: JASTAP & JARVIS Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* JASTAP Card */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/30 hover:border-emerald-500/60 p-5 transition-all shadow-xl hover:shadow-emerald-500/10">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              The Agent
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-white mt-4 group-hover:text-emerald-300 transition-colors">
            JASTAP (Jasa Titip Mahasiswa)
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Titip antar-jemput makanan kantin, print skripsi &amp; makalah kilat, fotokopi buku, dan belanja kebutuhan kamar asrama.
          </p>

          <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">Bounty mulai Rp 5.000</span>
            <button
              onClick={() => onOpenCreateQuest('JASTAP')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 group-hover:translate-x-0.5 transition-transform cursor-pointer"
            >
              Buat Titipan <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* JARVIS Card */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-violet-500/30 hover:border-violet-500/60 p-5 transition-all shadow-xl hover:shadow-violet-500/10">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20 text-white">
              <Wrench className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400">
              The Machinist
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-white mt-4 group-hover:text-violet-300 transition-colors">
            JARVIS (Teknisi &amp; Servis Mahasiswa)
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Servis laptop lemot/panas, install ulang Windows/Linux, ganti thermal paste &amp; bersihkan kipas, service tombol tablet/HP.
          </p>

          <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">Bounty mulai Rp 35.000</span>
            <button
              onClick={() => onOpenCreateQuest('JARVIS')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-400 hover:text-violet-300 group-hover:translate-x-0.5 transition-transform cursor-pointer"
            >
              Panggil Teknisi <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Running Quests (Ongoing) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-400" />
            Quest Berjalan ({activeQuests.length})
          </h2>
          <button
            onClick={onOpenMap}
            className="text-xs text-sky-400 hover:underline flex items-center gap-1 font-semibold"
          >
            Pantau di Radar Map <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {activeQuests.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400">
            <ShoppingBag className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <p className="text-xs font-semibold text-slate-300">Belum ada pesanan aktif</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Klik tombol &quot;Titip JASTAP&quot; atau &quot;Panggil JARVIS&quot; di atas untuk membuat quest baru.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {activeQuests.map((quest) => {
              const isOpenUnclaimed = quest.status === 'OPEN' && !quest.runner_id;
              const createdMs = new Date(quest.created_at).getTime();
              const elapsedMs = Math.max(0, currentTime - createdMs);
              const limitMs = quest.category === 'JASTAP' ? 5 * 60 * 1000 : 24 * 60 * 60 * 1000;
              const isOverdue = elapsedMs >= limitMs;
              const remainingMs = Math.max(0, limitMs - elapsedMs);
              const remainingMins = Math.floor(remainingMs / 60000);
              const remainingSecs = Math.floor((remainingMs % 60000) / 1000);
              const remainingHours = Math.floor(remainingMs / 3600000);

              return (
                <div
                  key={quest.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-all shadow-lg flex flex-col justify-between"
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
                        {quest.category}
                      </span>
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                        {quest.status}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white line-clamp-2 break-words">{quest.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2 break-words mt-1">{quest.description}</p>

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 text-[11px] text-slate-400">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">{quest.origin_address}</span>
                      </div>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span className="truncate">{quest.destination_address}</span>
                      </div>
                    </div>

                    {/* Timeout Warning or Live Countdown for Unclaimed Quests */}
                    {isOpenUnclaimed && (
                      <div className="mt-3 space-y-2">
                        {isOverdue ? (
                          <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-[11px] text-amber-300 flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                            <div>
                              <span className="font-bold block">
                                {quest.category === 'JASTAP' ? 'Belum diambil (> 5 Menit)!' : 'Belum diambil (> 24 Jam)!'}
                              </span>
                              <span className="text-slate-300 text-[10px] block mt-0.5">
                                Belum ada runner yang merespons. Naikkan bounty atau batalkan pesanan.
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="px-2.5 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] flex items-center justify-between text-slate-300">
                            <div className="flex items-center gap-1.5 text-sky-300">
                              <Clock className="w-3.5 h-3.5 text-sky-400 animate-spin" />
                              <span>Mencari Runner...</span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400">
                              Sisa waktu respons: {quest.category === 'JASTAP' ? `${remainingMins}m ${remainingSecs}s` : `${remainingHours}j ${remainingMins}m`}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => handleCancelQuest(quest.id, quest.title)}
                            className="flex-1 py-1.5 px-2.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-500/40 text-[11px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                            title="Batalkan pesanan sebelum diambil runner"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            Batalkan Quest
                          </button>
                          <button
                            onClick={() => handleQuickIncreaseBounty(quest.id)}
                            className="flex-1 py-1.5 px-2.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                            title="Naikkan bounty Rp 2.000 agar cepat diambil"
                          >
                            <Coins className="w-3.5 h-3.5 text-amber-400" />
                            + Rp 2.000 Bounty
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Total Tagihan:</span>
                      <span className="text-sm font-extrabold text-emerald-400 font-mono">
                        Rp {(quest.bounty_fee + (quest.item_cost || 0)).toLocaleString('id-ID')}
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
                        className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
                      >
                        Pantau &amp; Detail
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Completed Quests */}
      {completedQuests.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            Riwayat Selesai ({completedQuests.length})
          </h2>

          <div className="space-y-2">
            {completedQuests.slice(0, 3).map((quest) => (
              <div
                key={quest.id}
                onClick={() => onOpenQuestDetail(quest.id)}
                className="p-3 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs cursor-pointer transition-colors"
              >
                <div className="min-w-0 pr-3">
                  <p className="font-semibold text-white line-clamp-2 break-words">{quest.title}</p>
                  <span className="text-[10px] text-slate-400">
                    Selesai • OTP Valid • Bounty Rp {quest.bounty_fee.toLocaleString('id-ID')}
                  </span>
                </div>
                <span className="text-emerald-400 font-semibold font-mono shrink-0 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Selesai
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cancelled Quests History */}
      {cancelledQuests.length > 0 && (
        <div className="space-y-3 pt-2">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Ban className="w-4 h-4 text-rose-400" />
            Riwayat Dibatalkan ({cancelledQuests.length})
          </h2>

          <div className="space-y-2">
            {cancelledQuests.slice(0, 3).map((quest) => (
              <div
                key={quest.id}
                onClick={() => onOpenQuestDetail(quest.id)}
                className="p-3 bg-slate-900/40 hover:bg-slate-900 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs cursor-pointer transition-colors opacity-75 hover:opacity-100"
              >
                <div className="min-w-0 pr-3">
                  <p className="font-semibold text-slate-300 line-clamp-1">{quest.title}</p>
                  <span className="text-[10px] text-slate-500">
                    {quest.category} • Dibatalkan sebelum diterima runner
                  </span>
                </div>
                <span className="text-rose-400 font-semibold text-[11px] shrink-0 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-950/40 border border-rose-500/30">
                  <Ban className="w-3 h-3" /> Dibatalkan
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
