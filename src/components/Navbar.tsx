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
  GraduationCap,
  Lock
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
  const {
    profile,
    isLoggedIn,
    activeRole,
    switchRole,
    resetToDefaultData,
    logout,
    isCurrentUserAdmin
  } = useCampusQuest();

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
    <header className="sticky top-0 z-30 w-full bg-[#FAF7F2]/90 backdrop-blur-xl border-b border-[#E8DFD1] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#6E1C2F] via-[#7A1E34] to-[#2D8D84] shadow-md shadow-[#7A1E34]/25 border border-white/20">
              <span className="text-white font-black text-xl tracking-tighter">CQ</span>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#39A99D] rounded-full border-2 border-[#FAF7F2] animate-pulse" />
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-lg text-[#2C2224] tracking-tight">
                Campus<span className="text-[#7A1E34]">Quest</span>
              </span>
            </div>
          </div>

          {/* Center: Dynamic Triple-Mode Switcher */}
          <div className="flex items-center">
            <div className="relative p-1 bg-[#F2EBE0] border border-[#E3D7C6] rounded-full flex items-center shadow-inner">
              <button
                onClick={() => switchRole('customer')}
                className={`relative z-10 flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
                  activeRole === 'customer'
                    ? 'bg-[#2D8D84] text-white shadow-md shadow-[#2D8D84]/30'
                    : 'text-[#6E6265] hover:text-[#2C2224]'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Customer</span>
              </button>
              <button
                onClick={() => switchRole('runner')}
                className={`relative z-10 flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
                  activeRole === 'runner'
                    ? 'bg-[#7A1E34] text-white shadow-md shadow-[#7A1E34]/30'
                    : 'text-[#6E6265] hover:text-[#2C2224]'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Runner</span>
              </button>
              {/* Tombol Admin HANYA BISA DILIHAT OLEH ADMINISTRATOR RESMI (Tidak terlihat oleh Customer & Runner) */}
              {isCurrentUserAdmin && (
                <button
                  onClick={() => switchRole('admin')}
                  className={`relative z-10 flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
                    activeRole === 'admin'
                      ? 'bg-[#2C2224] text-white shadow-md shadow-black/30'
                      : 'text-[#6E6265] hover:text-[#2C2224]'
                  }`}
                  title="Portal Admin"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Admin</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Action Icons & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Wallet button */}
            <button
              onClick={onOpenWalletModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white border border-[#E8DFD1] hover:border-[#2D8D84] text-[#2C2224] text-xs font-semibold shadow-xs transition-all group cursor-pointer"
              title="Dompet & Saldo"
            >
              <Wallet className="w-3.5 h-3.5 text-[#2D8D84] group-hover:scale-110 transition-transform" />
              <span className="font-extrabold text-[#7A1E34] hidden sm:inline font-mono">
                Rp {profile.wallet_balance.toLocaleString('id-ID')}
              </span>
            </button>

            {/* If NOT logged in: Show Prominent Login KTM button */}
            {!isLoggedIn ? (
              <button
                onClick={onOpenLoginModal}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-[#7A1E34] to-[#9B2444] hover:from-[#6E1C2F] hover:to-[#8A203C] text-white text-xs font-bold shadow-md shadow-[#7A1E34]/25 transition-all cursor-pointer animate-pulse"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Login KTM</span>
              </button>
            ) : (
              <>
                {/* KTM Status Button */}
                <button
                  onClick={onOpenKtmModal}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl text-xs font-semibold border transition-all cursor-pointer ${
                    profile.is_verified
                      ? 'bg-[#E8F6F3] border-[#A5DDD3] text-[#1F6F67] hover:bg-[#D4EFEA]'
                      : 'bg-[#FBF0F2] border-[#F1CCD3] text-[#7A1E34] hover:bg-[#F6E1E5]'
                  }`}
                  title={profile.is_verified ? 'KTM Terverifikasi' : 'Verifikasi KTM Diperlukan'}
                >
                  {profile.is_verified ? (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5 text-[#2D8D84]" />
                      <span className="hidden md:inline">KTM Verified</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-3.5 h-3.5 text-[#7A1E34] animate-pulse" />
                      <span className="hidden md:inline">Upload KTM</span>
                    </>
                  )}
                </button>

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 p-1 pl-1.5 rounded-2xl bg-white border border-[#E8DFD1] hover:border-[#7A1E34] shadow-xs transition-all cursor-pointer"
                  >
                    <img
                      src={
                        profile.avatar_url ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
                      }
                      alt={profile.full_name}
                      className="w-7 h-7 rounded-xl object-cover border border-[#E8DFD1]"
                    />
                    <div className="text-left hidden lg:block pr-1">
                      <p className="text-xs font-bold text-[#2C2224] line-clamp-1 max-w-[100px]">
                        {profile.full_name.split(' ')[0]}
                      </p>
                      <p className="text-[10px] text-[#7A1E34] font-mono -mt-0.5">{profile.nim}</p>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-[#7E7074] pr-0.5" />
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white border border-[#E8DFD1] rounded-3xl p-2.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                      {/* Identity Card Header */}
                      <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#E8DFD1] mb-2">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={profile.avatar_url}
                            alt={profile.full_name}
                            className="w-10 h-10 rounded-xl object-cover border border-[#7A1E34]/30"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[#2C2224] truncate">{profile.full_name}</p>
                            <p className="text-[11px] text-[#7A1E34] font-mono">NIM: {profile.nim}</p>
                            <p className="text-[10px] text-[#6E6265] truncate">
                              {profile.university || 'Universitas Pendidikan Indonesia (UPI)'}
                            </p>
                          </div>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-[#E8DFD1] space-y-1 text-[10px]">
                          <div className="flex items-center justify-between">
                            <span className="text-[#2D8D84] font-bold flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" /> KTM UPI Aktif
                            </span>
                            <span className="text-[#7E7074] font-mono truncate max-w-[140px]">
                              {profile.faculty || 'Kampus UPI di Purwakarta'}
                            </span>
                          </div>
                          {profile.major && (
                            <p className="text-[10px] text-[#7A1E34] font-medium truncate">
                              Prodi: {profile.major}
                            </p>
                          )}
                          <div className="flex items-center gap-1 text-[9px] text-[#2D8D84] pt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Supabase Realtime Cloud Aktif</span>
                          </div>
                        </div>
                      </div>

                      {/* Dropdown Action Items */}
                      <div className="space-y-1 text-xs">
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            onOpenKtmModal();
                          }}
                          className="w-full px-3 py-2 rounded-xl text-left text-[#4A3D41] hover:text-[#2C2224] hover:bg-[#F7F3EC] flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <GraduationCap className="w-4 h-4 text-[#2D8D84]" />
                          <span>Lihat / Edit Profil KTM</span>
                        </button>

                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            onOpenLoginModal();
                          }}
                          className="w-full px-3 py-2 rounded-xl text-left text-[#4A3D41] hover:text-[#2C2224] hover:bg-[#F7F3EC] flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <Camera className="w-4 h-4 text-[#7A1E34]" />
                          <span>Ganti Akun / Login KTM Lain</span>
                        </button>

                        <div className="my-1 border-t border-[#E8DFD1]" />

                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            logout();
                          }}
                          className="w-full px-3 py-2 rounded-xl text-left text-[#9B2444] hover:text-[#7A1E34] hover:bg-[#FBF0F2] flex items-center gap-2 transition-colors cursor-pointer font-semibold"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Keluar dari Akun</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Logout / Ganti Akun button */}
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl bg-white border border-[#E8DFD1] hover:border-[#9B2444] hover:bg-[#FBF0F2] text-[#7E7074] hover:text-[#9B2444] text-xs font-semibold shadow-xs transition-all cursor-pointer"
                  title="Keluar ke Menu Login / Ganti Akun"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">Keluar</span>
                </button>
              </>
            )}

            {/* Reset data helper */}
            <button
              onClick={() => {
                if (confirm('Reset ulang data demo ke kondisi awal?')) {
                  resetToDefaultData();
                }
              }}
              className="p-2 rounded-2xl bg-white border border-[#E8DFD1] text-[#7E7074] hover:text-[#2C2224] hover:border-[#2D8D84] transition-colors hidden lg:block cursor-pointer shadow-xs"
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

