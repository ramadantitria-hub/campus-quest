'use client';

import React from 'react';
import { useCampusQuest } from '@/context/CampusQuestContext';
import { Home, Compass, MapPin, Wallet, UserCheck } from 'lucide-react';

interface BottomNavProps {
  onOpenKtmModal: () => void;
  onOpenWalletModal: () => void;
}

export default function BottomNav({ onOpenKtmModal, onOpenWalletModal }: BottomNavProps) {
  const { activeTab, setActiveTab, activeRole } = useCampusQuest();

  const handleTabClick = (tab: 'home' | 'quests' | 'map' | 'wallet' | 'profile') => {
    if (tab === 'wallet') {
      onOpenWalletModal();
      return;
    }
    if (tab === 'profile') {
      onOpenKtmModal();
      return;
    }
    setActiveTab(tab);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/90 px-2 py-2">
      <div className="flex items-center justify-around">
        <button
          onClick={() => handleTabClick('home')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
            activeTab === 'home'
              ? activeRole === 'customer'
                ? 'text-sky-400 font-semibold'
                : 'text-amber-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Beranda</span>
        </button>

        <button
          onClick={() => handleTabClick('quests')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
            activeTab === 'quests'
              ? activeRole === 'customer'
                ? 'text-sky-400 font-semibold'
                : 'text-amber-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px]">
            {activeRole === 'customer' ? 'Pesanan' : 'Quest Board'}
          </span>
        </button>

        <button
          onClick={() => handleTabClick('map')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
            activeTab === 'map'
              ? activeRole === 'customer'
                ? 'text-sky-400 font-semibold'
                : 'text-amber-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MapPin className="w-5 h-5" />
          <span className="text-[10px]">Radar Peta</span>
        </button>

        <button
          onClick={() => handleTabClick('wallet')}
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-slate-400 hover:text-slate-200 transition-colors"
        >
          <Wallet className="w-5 h-5" />
          <span className="text-[10px]">Saldo</span>
        </button>

        <button
          onClick={() => handleTabClick('profile')}
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-slate-400 hover:text-slate-200 transition-colors"
        >
          <UserCheck className="w-5 h-5" />
          <span className="text-[10px]">Profil &amp; KTM</span>
        </button>
      </div>
    </nav>
  );
}
