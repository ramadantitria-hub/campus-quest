'use client';

import React from 'react';
import { useCampusQuest } from '@/context/CampusQuestContext';
import {
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Wallet,
  Zap,
  ShoppingBag,
  Wrench,
  RefreshCw,
  Bell
} from 'lucide-react';

interface NavbarProps {
  onOpenKtmModal: () => void;
  onOpenWalletModal: () => void;
}

export default function Navbar({ onOpenKtmModal, onOpenWalletModal }: NavbarProps) {
  const { profile, activeRole, switchRole, resetToDefaultData } = useCampusQuest();

  return (
    <header className="sticky top-0 z-30 w-full bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-violet-600 shadow-md shadow-sky-500/20">
              <span className="text-white font-black text-xl tracking-tighter">CQ</span>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-950 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg text-white tracking-tight">
                  Campus<span className="text-sky-400">Quest</span>
                </span>
                <span className="hidden sm:inline-flex text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-sky-300">
                  inDrive Model
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                JASTAP &amp; JARVIS On-Demand Kampus
              </p>
            </div>
          </div>

          {/* Center: Dynamic Dual-Mode Switcher */}
          <div className="flex items-center">
            <div className="relative p-1 bg-slate-900 border border-slate-800 rounded-full flex items-center shadow-inner">
              <button
                onClick={() => switchRole('customer')}
                className={`relative z-10 flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                  activeRole === 'customer'
                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/25'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Customer</span>
              </button>
              <button
                onClick={() => switchRole('runner')}
                className={`relative z-10 flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                  activeRole === 'runner'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-bold shadow-md shadow-amber-500/25'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Runner</span>
              </button>
            </div>
          </div>

          {/* Right Action Icons & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Wallet button */}
            <button
              onClick={onOpenWalletModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-white text-xs font-medium transition-all group"
              title="Dompet & Saldo"
            >
              <Wallet className="w-3.5 h-3.5 text-sky-400 group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-emerald-400 hidden sm:inline">
                Rp {profile.wallet_balance.toLocaleString('id-ID')}
              </span>
            </button>

            {/* KTM Status Button */}
            <button
              onClick={onOpenKtmModal}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                profile.is_verified
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300 hover:bg-emerald-950/60'
                  : 'bg-amber-950/40 border-amber-500/30 text-amber-300 hover:bg-amber-950/60'
              }`}
              title={profile.is_verified ? 'KTM Terverifikasi' : 'Verifikasi KTM Diperlukan'}
            >
              {profile.is_verified ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden md:inline">KTM Verified</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span className="hidden md:inline">Upload KTM</span>
                </>
              )}
            </button>

            {/* Reset data helper */}
            <button
              onClick={() => {
                if (confirm('Reset ulang data demo ke kondisi awal?')) {
                  resetToDefaultData();
                }
              }}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-colors hidden lg:block"
              title="Reset data demo"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
