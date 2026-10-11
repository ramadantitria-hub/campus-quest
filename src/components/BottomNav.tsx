'use client';

import React from 'react';
import { useCampusQuest } from '@/context/CampusQuestContext';
import { Home, Compass, MapPin, Wallet, UserCheck } from 'lucide-react';

interface BottomNavProps {
  onOpenKtmModal: () => void;
  onOpenWalletModal: () => void;
  onOpenLoginModal?: () => void;
}

export default function BottomNav({
  onOpenKtmModal,
  onOpenWalletModal,
  onOpenLoginModal
}: BottomNavProps) {
  const { activeTab, setActiveTab, activeRole, isLoggedIn } = useCampusQuest();

  const handleTabClick = (tab: 'home' | 'quests' | 'map' | 'wallet' | 'profile') => {
    if (tab === 'wallet') {
      onOpenWalletModal();
      return;
    }
    if (tab === 'profile') {
      if (!isLoggedIn && onOpenLoginModal) {
        onOpenLoginModal();
      } else {
        onOpenKtmModal();
      }
      return;
    }
    setActiveTab(tab);
  };

  return (
    <nav className="md:hidden fixed bottom-3 left-4 right-4 z-30 bg-white/95 backdrop-blur-xl border border-[#E8DFD1] shadow-[0_10px_25px_-5px_rgba(44,34,36,0.12)] rounded-3xl px-3 py-2">
      <div className="flex items-center justify-around">
        <button
          onClick={() => handleTabClick('home')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'home'
              ? activeRole === 'admin'
                ? 'text-[#2C2224] font-black bg-[#F2EBE0]'
                : activeRole === 'customer'
                ? 'text-[#2D8D84] font-extrabold bg-[#E8F6F3]'
                : 'text-[#7A1E34] font-extrabold bg-[#FBF0F2]'
              : 'text-[#8E7F83] hover:text-[#2C2224]'
          }`}
        >
          <Home className="w-4.5 h-4.5" />
          <span className="text-[10px]">{activeRole === 'admin' ? 'Admin' : 'Beranda'}</span>
        </button>

        <button
          onClick={() => handleTabClick('quests')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'quests'
              ? activeRole === 'admin'
                ? 'text-[#2C2224] font-black bg-[#F2EBE0]'
                : activeRole === 'customer'
                ? 'text-[#2D8D84] font-extrabold bg-[#E8F6F3]'
                : 'text-[#7A1E34] font-extrabold bg-[#FBF0F2]'
              : 'text-[#8E7F83] hover:text-[#2C2224]'
          }`}
        >
          <Compass className="w-4.5 h-4.5" />
          <span className="text-[10px]">
            {activeRole === 'customer'
              ? 'Pesanan'
              : activeRole === 'admin'
              ? 'Semua Quest'
              : 'Quest Baru'}
          </span>
        </button>

        <button
          onClick={() => handleTabClick('map')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'map'
              ? activeRole === 'customer'
                ? 'text-[#2D8D84] font-extrabold bg-[#E8F6F3]'
                : 'text-[#7A1E34] font-extrabold bg-[#FBF0F2]'
              : 'text-[#8E7F83] hover:text-[#2C2224]'
          }`}
        >
          <MapPin className="w-4.5 h-4.5" />
          <span className="text-[10px]">Radar Peta</span>
        </button>

        <button
          onClick={() => handleTabClick('wallet')}
          className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-2xl text-[#8E7F83] hover:text-[#2C2224] transition-all cursor-pointer"
        >
          <Wallet className="w-4.5 h-4.5 text-[#2D8D84]" />
          <span className="text-[10px] font-semibold">Saldo</span>
        </button>

        <button
          onClick={() => handleTabClick('profile')}
          className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-2xl text-[#8E7F83] hover:text-[#2C2224] transition-all cursor-pointer"
        >
          <UserCheck className="w-4.5 h-4.5 text-[#7A1E34]" />
          <span className="text-[10px] font-semibold">{isLoggedIn ? 'Profil' : 'KTM'}</span>
        </button>
      </div>
    </nav>
  );
}
