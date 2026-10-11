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

  // Quests belonging to this customer profile specifically (Customer lain TIDAK melihat quest customer lain)
  const isMyQuest = (q: Quest) =>
    q.customer_id === profile.id ||
    (Boolean(profile.nim) && q.customer_nim === profile.nim);

  const activeQuests = quests.filter(
    (q) => isMyQuest(q) && q.status !== 'COMPLETED' && q.status !== 'CANCELLED'
  );
  const completedQuests = quests.filter(
    (q) => isMyQuest(q) && q.status === 'COMPLETED'
  );
  const cancelledQuests = quests.filter(
    (q) => isMyQuest(q) && q.status === 'CANCELLED'
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
      {/* Hero Welcome Banner - Tactile Clay Maroon Gradient */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#6E1C2F] via-[#7A1E34] to-[#8E223D] border border-white/20 p-5 sm:p-7 shadow-xl text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/30 text-[#D4EFEA] text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#A5DDD3]" />
              <span>CampusQuest untuk Mahasiswa UPI</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
              Halo, {profile.full_name}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-stone-200 mt-1 max-w-xl">
              Butuh titip beli makan, print berkas, atau laptop bermasalah? Tentukan sendiri upah jasamu dan mahasiswa UPI lain siap membantu!
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onOpenCreateQuest('JASTAP')}
              className="px-4.5 py-2.5 rounded-2xl bg-[#2D8D84] hover:bg-[#247D75] text-white font-extrabold text-xs shadow-md shadow-black/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Titip JASTAP</span>
            </button>
            <button
              onClick={() => onOpenCreateQuest('JARVIS')}
              className="px-4.5 py-2.5 rounded-2xl bg-[#FAF7F2] hover:bg-[#F2EBE0] text-[#7A1E34] font-extrabold text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <Wrench className="w-4 h-4" />
              <span>Panggil JARVIS</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Notification Banner for 5 min (JASTAP) / 24 hr (JARVIS) timeout */}
      {activeNotification && (
        <div className="p-4 bg-gradient-to-r from-[#FBF0F2] via-white to-[#FBF0F2] border border-[#F1CCD3] rounded-3xl shadow-md flex items-start justify-between gap-3 animate-fadeIn">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#FBF0F2] border border-[#F1CCD3] text-[#7A1E34] flex items-center justify-center shrink-0 mt-0.5">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h4 className="text-xs font-black text-[#7A1E34] uppercase tracking-wider">
                {activeNotification.category === 'JASTAP' ? '⏰ Notifikasi 5 Menit: Titipan JASTAP Belum Diambil' : '⏰ Notifikasi 24 Jam: Permintaan JARVIS Belum Diambil'}
              </h4>
              <p className="text-xs text-[#2C2224] mt-0.5">
                Pesanan <strong>&ldquo;{activeNotification.title}&rdquo;</strong> belum ada yang mengambil. Anda dapat menaikkan bounty tawaran atau membatalkan pesanan.
              </p>
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => handleQuickIncreaseBounty(activeNotification.id)}
                  className="px-3 py-1.5 rounded-xl bg-[#2D8D84] hover:bg-[#247D75] text-white font-bold text-[11px] flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <Coins className="w-3 h-3" />
                  + Naikkan Bounty Rp 2.000
                </button>
                <button
                  onClick={() => handleCancelQuest(activeNotification.id, activeNotification.title)}
                  className="px-3 py-1.5 rounded-xl bg-[#FBF0F2] hover:bg-[#F6E1E5] text-[#7A1E34] border border-[#F1CCD3] font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <Ban className="w-3 h-3" />
                  Batalkan Pesanan
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveNotification(null)}
            className="text-[#8E7F83] hover:text-[#2C2224] p-1 cursor-pointer"
            title="Tutup Notifikasi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Action feedback toast banner */}
      {actionFeedback && (
        <div className="p-3 bg-[#E8F6F3] border border-[#A5DDD3] rounded-2xl text-xs text-[#1F6F67] font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-[#2D8D84] shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Two Core Services: JASTAP & JARVIS Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* JASTAP Card - Soft Tosca Clay */}
        <div className="group relative overflow-hidden rounded-3xl bg-white border border-[#A5DDD3] hover:border-[#2D8D84] p-5.5 transition-all shadow-sm hover:shadow-md">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl bg-[#E8F6F3] border border-[#A5DDD3] flex items-center justify-center text-[#2D8D84] shadow-xs">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-[#E8F6F3] border border-[#A5DDD3] text-[#1F6F67]">
              The Agent
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-black text-[#2C2224] mt-4 group-hover:text-[#2D8D84] transition-colors">
            JASTAP (Jasa Titip Mahasiswa)
          </h3>
          <p className="text-xs text-[#6E6265] mt-1 leading-relaxed">
            Titip antar-jemput makanan kantin, print skripsi &amp; makalah kilat, fotokopi buku, dan belanja kebutuhan kamar asrama.
          </p>

          <div className="mt-4 pt-4 border-t border-[#E8DFD1] flex items-center justify-between">
            <span className="text-[11px] text-[#8E7F83] font-semibold">Bounty mulai Rp 5.000</span>
            <button
              onClick={() => onOpenCreateQuest('JASTAP')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2D8D84] hover:text-[#1F6F67] group-hover:translate-x-0.5 transition-transform cursor-pointer"
            >
              Buat Titipan <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* JARVIS Card - Soft Maroon Clay */}
        <div className="group relative overflow-hidden rounded-3xl bg-white border border-[#F1CCD3] hover:border-[#7A1E34] p-5.5 transition-all shadow-sm hover:shadow-md">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl bg-[#FBF0F2] border border-[#F1CCD3] flex items-center justify-center text-[#7A1E34] shadow-xs">
              <Wrench className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-[#FBF0F2] border border-[#F1CCD3] text-[#7A1E34]">
              The Machinist
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-black text-[#2C2224] mt-4 group-hover:text-[#7A1E34] transition-colors">
            JARVIS (Teknisi &amp; Servis Mahasiswa)
          </h3>
          <p className="text-xs text-[#6E6265] mt-1 leading-relaxed">
            Servis laptop lemot/panas, install ulang Windows/Linux, ganti thermal paste &amp; bersihkan kipas, service tombol tablet/HP.
          </p>

          <div className="mt-4 pt-4 border-t border-[#E8DFD1] flex items-center justify-between">
            <span className="text-[11px] text-[#8E7F83] font-semibold">Bounty mulai Rp 35.000</span>
            <button
              onClick={() => onOpenCreateQuest('JARVIS')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7A1E34] hover:text-[#5C1626] group-hover:translate-x-0.5 transition-transform cursor-pointer"
            >
              Panggil Teknisi <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Running Quests (Ongoing) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-[#2C2224] uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#2D8D84]" />
            Quest Berjalan ({activeQuests.length})
          </h2>
          <button
            onClick={onOpenMap}
            className="text-xs text-[#2D8D84] hover:underline flex items-center gap-1 font-bold cursor-pointer"
          >
            Pantau di Radar Map <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {activeQuests.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-[#E8DFD1] text-[#8E7F83] shadow-xs">
            <ShoppingBag className="w-8 h-8 mx-auto text-[#D5C7B5] mb-2" />
            <p className="text-xs font-bold text-[#2C2224]">Belum ada pesanan aktif</p>
            <p className="text-[11px] text-[#8E7F83] mt-0.5">
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
                  className="bg-white border border-[#E8DFD1] hover:border-[#2D8D84] rounded-3xl p-4.5 transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
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
                        {quest.category}
                      </span>
                      <span className="text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-[#F2EBE0] text-[#6E6265]">
                        {quest.status}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-[#2C2224] line-clamp-2 break-words">{quest.title}</h4>
                    <p className="text-xs text-[#6E6265] line-clamp-2 break-words mt-1">{quest.description}</p>

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 text-[11px] text-[#4A3D41]">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <MapPin className="w-3.5 h-3.5 text-[#2D8D84] shrink-0" />
                        <span className="truncate">{quest.origin_address}</span>
                      </div>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <MapPin className="w-3.5 h-3.5 text-[#7A1E34] shrink-0" />
                        <span className="truncate">{quest.destination_address}</span>
                      </div>
                    </div>

                    {/* Timeout Warning or Live Countdown for Unclaimed Quests */}
                    {isOpenUnclaimed && (
                      <div className="mt-3 space-y-2">
                        {isOverdue ? (
                          <div className="p-2.5 rounded-2xl bg-[#FBF0F2] border border-[#F1CCD3] text-[11px] text-[#7A1E34] flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-[#7A1E34] shrink-0 mt-0.5 animate-pulse" />
                            <div>
                              <span className="font-bold block">
                                {quest.category === 'JASTAP' ? 'Belum diambil (> 5 Menit)!' : 'Belum diambil (> 24 Jam)!'}
                              </span>
                              <span className="text-[#6E6265] text-[10px] block mt-0.5">
                                Belum ada runner yang merespons. Naikkan bounty atau batalkan pesanan.
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="px-3 py-1.5 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD1] text-[11px] flex items-center justify-between text-[#2C2224]">
                            <div className="flex items-center gap-1.5 text-[#2D8D84] font-semibold">
                              <Clock className="w-3.5 h-3.5 animate-spin" />
                              <span>Mencari Runner...</span>
                            </div>
                            <span className="text-[10px] font-mono text-[#8E7F83]">
                              Sisa waktu respons: {quest.category === 'JASTAP' ? `${remainingMins}m ${remainingSecs}s` : `${remainingHours}j ${remainingMins}m`}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => handleCancelQuest(quest.id, quest.title)}
                            className="flex-1 py-1.5 px-2.5 rounded-xl bg-[#FBF0F2] hover:bg-[#F6E1E5] text-[#7A1E34] border border-[#F1CCD3] text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                            title="Batalkan pesanan sebelum diambil runner"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            Batalkan Quest
                          </button>
                          <button
                            onClick={() => handleQuickIncreaseBounty(quest.id)}
                            className="flex-1 py-1.5 px-2.5 rounded-xl bg-[#E8F6F3] hover:bg-[#D4EFEA] text-[#1F6F67] border border-[#A5DDD3] text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                            title="Naikkan bounty Rp 2.000 agar cepat diambil"
                          >
                            <Coins className="w-3.5 h-3.5 text-[#2D8D84]" />
                            + Rp 2.000 Bounty
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E8DFD1] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#8E7F83] block font-semibold">Total Tagihan:</span>
                      <span className="text-sm font-black text-[#7A1E34] font-mono">
                        Rp {(quest.bounty_fee + (quest.item_cost || 0)).toLocaleString('id-ID')}
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
                        className="px-3.5 py-1.5 rounded-2xl bg-[#7A1E34] hover:bg-[#6E1C2F] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
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
          <h2 className="text-sm font-extrabold text-[#2C2224] uppercase tracking-wider flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#2D8D84]" />
            Riwayat Selesai ({completedQuests.length})
          </h2>

          <div className="space-y-2">
            {completedQuests.slice(0, 3).map((quest) => (
              <div
                key={quest.id}
                onClick={() => onOpenQuestDetail(quest.id)}
                className="p-3 bg-white hover:bg-[#FAF7F2] border border-[#E8DFD1] rounded-2xl flex items-center justify-between text-xs cursor-pointer transition-colors shadow-xs"
              >
                <div className="min-w-0 pr-3">
                  <p className="font-bold text-[#2C2224] line-clamp-2 break-words">{quest.title}</p>
                  <span className="text-[10px] text-[#8E7F83]">
                    Selesai • OTP Valid • Bounty Rp {quest.bounty_fee.toLocaleString('id-ID')}
                  </span>
                </div>
                <span className="text-[#2D8D84] font-bold font-mono shrink-0 flex items-center gap-1">
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
          <h2 className="text-sm font-extrabold text-[#8E7F83] uppercase tracking-wider flex items-center gap-2">
            <Ban className="w-4 h-4 text-[#7A1E34]" />
            Riwayat Dibatalkan ({cancelledQuests.length})
          </h2>

          <div className="space-y-2">
            {cancelledQuests.slice(0, 3).map((quest) => (
              <div
                key={quest.id}
                onClick={() => onOpenQuestDetail(quest.id)}
                className="p-3 bg-[#FAF7F2] hover:bg-white border border-[#E8DFD1] rounded-2xl flex items-center justify-between text-xs cursor-pointer transition-colors shadow-xs opacity-85 hover:opacity-100"
              >
                <div className="min-w-0 pr-3">
                  <p className="font-semibold text-[#6E6265] line-clamp-1">{quest.title}</p>
                  <span className="text-[10px] text-[#8E7F83]">
                    {quest.category} • Dibatalkan sebelum diterima runner
                  </span>
                </div>
                <span className="text-[#7A1E34] font-bold text-[11px] shrink-0 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FBF0F2] border border-[#F1CCD3]">
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
