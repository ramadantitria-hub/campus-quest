'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useCampusQuest } from '@/context/CampusQuestContext';
import {
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Wallet,
  Zap,
  ShoppingBag,
  RefreshCw,
  LogOut,
  User,
  ChevronDown,
  Camera,
  GraduationCap
} from 'lucide-react';

interface NavbarProps {
  onOpenKtmModal: () => void;
  onOpenWalletModal: () => void;
  onOpenLoginModal: () => void;
}

export default function Navbar({
  onOpenKtmModal,
  onOpenWalletModal,
  onOpenLoginModal
}: NavbarProps) {
  const { profile, isLoggedIn, activeRole, switchRole, resetToDefaultData, logout } =
    useCampusQuest();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

            {/* If NOT logged in: Show Prominent Login KTM button */}
            {!isLoggedIn ? (
              <button
                onClick={onOpenLoginModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-sky-500/25 transition-all cursor-pointer animate-pulse"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Login KTM</span>
              </button>
            ) : (
              <>
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

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 p-1 pl-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
                  >
                    <img
                      src={
                        profile.avatar_url ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
                      }
                      alt={profile.full_name}
                      className="w-7 h-7 rounded-lg object-cover border border-slate-700"
                    />
                    <div className="text-left hidden lg:block pr-1">
                      <p className="text-xs font-bold text-white line-clamp-1 max-w-[100px]">
                        {profile.full_name.split(' ')[0]}
                      </p>
                      <p className="text-[10px] text-sky-400 font-mono -mt-0.5">{profile.nim}</p>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 pr-0.5" />
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                      {/* Identity Card Header */}
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 mb-2">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={profile.avatar_url}
                            alt={profile.full_name}
                            className="w-10 h-10 rounded-xl object-cover border border-sky-500/40"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">{profile.full_name}</p>
                            <p className="text-[11px] text-sky-400 font-mono">NIM: {profile.nim}</p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {profile.university || 'Universitas Indonesia'}
                            </p>
                          </div>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> KTM Aktif
                          </span>
                          <span className="text-slate-400 font-mono">
                            {profile.faculty || 'Fakultas Teknik'}
                          </span>
                        </div>
                      </div>

                      {/* Dropdown Action Items */}
                      <div className="space-y-1 text-xs">
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            onOpenKtmModal();
                          }}
                          className="w-full px-3 py-2 rounded-xl text-left text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <GraduationCap className="w-4 h-4 text-sky-400" />
                          <span>Lihat / Edit Profil KTM</span>
                        </button>

                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            onOpenLoginModal();
                          }}
                          className="w-full px-3 py-2 rounded-xl text-left text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <Camera className="w-4 h-4 text-amber-400" />
                          <span>Ganti Akun / Login KTM Lain</span>
                        </button>

                        <div className="my-1 border-t border-slate-800" />

                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            logout();
                          }}
                          className="w-full px-3 py-2 rounded-xl text-left text-red-400 hover:text-red-300 hover:bg-red-950/30 flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Keluar dari Akun</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

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

