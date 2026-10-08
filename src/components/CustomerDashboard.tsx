'use client';

import React from 'react';
import { useCampusQuest } from '@/context/CampusQuestContext';
import { ServiceCategory } from '@/types/campus-quest';
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
  MessageSquare
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
  const { profile, quests } = useCampusQuest();

  // Quests belonging to customer or overall
  const activeQuests = quests.filter((q) => q.status !== 'COMPLETED' && q.status !== 'CANCELLED');
  const completedQuests = quests.filter((q) => q.status === 'COMPLETED');

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
            {activeQuests.map((quest) => (
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

                  <h4 className="text-sm font-bold text-white line-clamp-1">{quest.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">{quest.description}</p>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1 truncate">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">{quest.origin_address}</span>
                    </div>
                    <div className="flex items-center gap-1 truncate">
                      <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span className="truncate">{quest.destination_address}</span>
                    </div>
                  </div>
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
            ))}
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
                  <p className="font-semibold text-white truncate">{quest.title}</p>
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
    </div>
  );
}
