'use client';

import React, { useState } from 'react';
import { useCampusQuest } from '@/context/CampusQuestContext';
import {
  ShieldCheck,
  Lock,
  User,
  KeyRound,
  X,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  GraduationCap
} from 'lucide-react';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminAuthModal({ isOpen, onClose }: AdminAuthModalProps) {
  const { loginAsAdmin } = useCampusQuest();

  const [nimInput, setNimInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const result = loginAsAdmin(nimInput, passwordInput);
    if (result.success) {
      setSuccessMsg(result.message);
      setTimeout(() => {
        setSuccessMsg(null);
        setNimInput('');
        setPasswordInput('');
        onClose();
      }, 700);
    } else {
      setErrorMsg(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2C2224]/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-[#FAF7F2] border border-[#E8DFD1] rounded-3xl p-6 sm:p-7 text-[#2C2224] max-w-md w-full shadow-2xl relative animate-in zoom-in-95">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-2xl bg-white border border-[#E8DFD1] text-[#6E6265] hover:text-[#2C2224] hover:bg-[#F2EBE0] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-[#7A1E34] to-[#9B2444] text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-[#7A1E34]/25 border border-white/30">
            <ShieldCheck className="w-7 h-7 text-[#A5DDD3]" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FBF0F2] border border-[#F1CCD3] text-[#7A1E34] text-[11px] font-black mb-1.5">
            <Lock className="w-3 h-3 text-[#7A1E34]" />
            <span>Hak Akses Terbatas Admin</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-[#2C2224]">
            Portal Admin
          </h2>
          <p className="text-xs text-[#6E6265] mt-1">
            Hanya Administrator Resmi yang Berhak Mengakses Pengawasan dan Moderasi Sistem.
          </p>
        </div>

        {/* Error / Success Feedback */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-[#FBF0F2] border border-[#F1CCD3] text-[#7A1E34] text-xs font-semibold flex items-start gap-2 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-[#E8F6F3] border border-[#A5DDD3] text-[#1F6F67] text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-bold text-[#2C2224] block mb-1">
              Nomor Induk Mahasiswa (NIM):
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#8E7F83] absolute left-3 top-3" />
              <input
                type="text"
                value={nimInput}
                onChange={(e) => {
                  setNimInput(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="Contoh: 2502895"
                required
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#E8DFD1] rounded-2xl text-xs font-mono font-bold text-[#2C2224] placeholder:text-[#8E7F83] focus:outline-none focus:border-[#7A1E34]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#2C2224] block mb-1">
              Password Administrator:
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-[#8E7F83] absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="Masukkan password admin..."
                required
                className="w-full pl-9 pr-10 py-2.5 bg-white border border-[#E8DFD1] rounded-2xl text-xs font-mono text-[#2C2224] placeholder:text-[#8E7F83] focus:outline-none focus:border-[#7A1E34]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-[#8E7F83] hover:text-[#2C2224]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-[#8E7F83] mt-1">
              Password default admin: <span className="font-mono font-bold text-[#7A1E34]">123</span>
            </p>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-2xl bg-white border border-[#E8DFD1] hover:bg-[#F2EBE0] text-[#6E6265] text-xs font-bold transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-[#7A1E34] to-[#9B2444] hover:from-[#6E1C2F] hover:to-[#8A203C] text-white text-xs font-black shadow-md shadow-[#7A1E34]/25 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-[#A5DDD3]" />
              <span>Verifikasi &amp; Masuk</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
