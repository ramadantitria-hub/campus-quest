'use client';

import React, { useState } from 'react';
import { useCampusQuest } from '@/context/CampusQuestContext';
import {
  X,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeft,
  CheckCircle,
  Building,
  Smartphone,
  CreditCard,
  History,
  AlertCircle,
  QrCode,
  Zap,
  ShoppingBag,
  Loader2
} from 'lucide-react';
import { soundFX } from '@/lib/audio';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { profile, quests, withdrawWallet, topUpWallet } = useCampusQuest();

  const [activeWalletTab, setActiveWalletTab] = useState<'topup' | 'withdraw'>('topup');

  // Top Up States
  const [topUpAmount, setTopUpAmount] = useState('50000');
  const [topUpMethod, setTopUpMethod] = useState('QRIS');
  const [isTopUpLoading, setIsTopUpLoading] = useState(false);

  // Withdraw States
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('GOPAY');
  const [accountNumber, setAccountNumber] = useState(profile.phone || '081298765432');
  const [isWithdrawLoading, setIsWithdrawLoading] = useState(false);

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const currentRole = profile.active_mode;
  const isRunner = currentRole === 'runner';
  const isAdmin = currentRole === 'admin';

  const customerBal =
    profile.customer_balance ??
    (currentRole === 'customer' ? profile.wallet_balance : 50000);
  const runnerBal =
    profile.runner_balance ??
    (currentRole === 'runner' ? profile.wallet_balance : 25000);
  const activeBal = profile.wallet_balance;

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const amt = parseInt(topUpAmount, 10);
    if (isNaN(amt) || amt <= 0) {
      setErrorMessage('Masukkan nominal top up yang valid');
      return;
    }

    if (amt < 5000) {
      setErrorMessage('Minimal nominal top up saldo adalah Rp 5.000');
      return;
    }

    setIsTopUpLoading(true);
    const res = await topUpWallet(amt, topUpMethod);
    setIsTopUpLoading(false);

    if (res.success) {
      setSuccessMessage(res.message);
      setTimeout(() => {
        setSuccessMessage('');
      }, 4000);
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const amt = parseInt(withdrawAmount, 10);
    if (isNaN(amt) || amt <= 0) {
      setErrorMessage('Masukkan nominal penarikan yang valid');
      return;
    }

    if (amt < 10000) {
      setErrorMessage('Minimal penarikan saldo adalah Rp 10.000');
      return;
    }

    if (amt > activeBal) {
      setErrorMessage(
        `Saldo ${isRunner ? 'Runner' : 'Customer'} tidak mencukupi untuk penarikan ini`
      );
      return;
    }

    setIsWithdrawLoading(true);
    const success = withdrawWallet(amt, withdrawMethod);
    setIsWithdrawLoading(false);

    if (success) {
      setSuccessMessage(
        `Berhasil mencairkan Rp ${amt.toLocaleString('id-ID')} ke ${withdrawMethod} (${accountNumber})`
      );
      setWithdrawAmount('');
      setTimeout(() => {
        setSuccessMessage('');
      }, 4000);
    } else {
      setErrorMessage('Gagal memproses penarikan saldo.');
    }
  };

  // Completed quests that generated revenue
  const completedQuests = quests.filter((q) => q.status === 'COMPLETED');

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
      <div className="bg-[#FAF7F2] border-t sm:border border-[#E8DFD1] max-w-md w-full rounded-t-3xl sm:rounded-3xl p-4 sm:p-6 text-[#2C2224] shadow-2xl relative max-h-[88vh] sm:max-h-[92vh] flex flex-col overflow-y-auto animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-200">
        {/* Mobile Drag Indicator Pill */}
        <div className="w-12 h-1 bg-[#D5C7B5] rounded-full mx-auto mb-2.5 sm:hidden shrink-0" />

        {/* Top Navigation & Back Button */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E8DFD1]">
          <button
            type="button"
            onClick={() => {
              soundFX.pop();
              onClose();
            }}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#4A3D41] hover:text-[#2C2224] bg-white hover:bg-[#F2EBE0] border border-[#E8DFD1] px-3.5 py-1.5 rounded-2xl transition-all cursor-pointer shadow-xs group"
          >
            <ArrowLeft className="w-4 h-4 text-[#2D8D84] group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Kembali ke Halaman Utama</span>
            <span className="sm:hidden">Kembali</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFX.pop();
              onClose();
            }}
            className="text-[#8E7F83] hover:text-[#2C2224] p-1.5 rounded-xl hover:bg-[#F2EBE0] transition-colors cursor-pointer"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-[#7A1E34] flex items-center justify-center shadow-md shadow-[#7A1E34]/20 text-white">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-[#2C2224]">Dompet CampusQuest</h3>
            <p className="text-xs text-[#7E7074]">Saldo reward bounty &amp; transaksi kampus UPI</p>
          </div>
        </div>

        {/* Saldo & Points Dual Card */}
        <div className="bg-white border border-[#E8DFD1] rounded-3xl p-4 sm:p-5 mb-4 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                    isRunner
                      ? 'bg-[#7A1E34]/15 text-[#7A1E34]'
                      : isAdmin
                      ? 'bg-amber-600/15 text-amber-700'
                      : 'bg-[#2D8D84]/15 text-[#2D8D84]'
                  }`}
                >
                  {isRunner
                    ? '⚡ Saldo Runner Mitra'
                    : isAdmin
                    ? '🛡️ Kas Administrator'
                    : '🏷️ Saldo Customer Mahasiswa'}
                </span>
              </div>
              <div
                className={`text-2xl sm:text-3xl font-black tracking-tight font-mono ${
                  isRunner ? 'text-[#7A1E34]' : 'text-[#2D8D84]'
                }`}
              >
                Rp {activeBal.toLocaleString('id-ID')}
              </div>
            </div>

            <div className="text-right bg-[#E8F6F3] border border-[#A5DDD3] px-3.5 py-1.5 rounded-2xl shrink-0">
              <span className="text-[10px] text-[#1F6F67] font-bold block uppercase tracking-wider">
                ⭐ Poin Ongkir
              </span>
              <span className="text-base sm:text-lg font-black text-[#2D8D84] font-mono">
                {profile.points || 0} <span className="text-xs text-[#1F6F67]">CQ Poin</span>
              </span>
            </div>
          </div>

          {/* Pemisahan Saldo Customer vs Runner Mandiri */}
          <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-[#E8DFD1]/70">
            <div
              className={`p-2 rounded-xl border text-[11px] transition-all ${
                currentRole === 'customer'
                  ? 'bg-[#E8F6F3] border-[#2D8D84]/40 font-bold'
                  : 'bg-[#FAF7F2] border-[#E8DFD1]'
              }`}
            >
              <div className="text-[10px] text-[#6E6265] flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <ShoppingBag className="w-3 h-3 text-[#2D8D84]" />
                  Customer:
                </span>
                {currentRole === 'customer' && (
                  <span className="px-1 py-0.2 bg-[#2D8D84] text-white text-[8px] rounded font-mono">
                    AKTIF
                  </span>
                )}
              </div>
              <div className="text-xs sm:text-sm font-black text-[#2D8D84] font-mono mt-0.5">
                Rp {customerBal.toLocaleString('id-ID')}
              </div>
            </div>

            <div
              className={`p-2 rounded-xl border text-[11px] transition-all ${
                currentRole === 'runner'
                  ? 'bg-[#FBF0F2] border-[#7A1E34]/40 font-bold'
                  : 'bg-[#FAF7F2] border-[#E8DFD1]'
              }`}
            >
              <div className="text-[10px] text-[#6E6265] flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-[#7A1E34]" />
                  Runner:
                </span>
                {currentRole === 'runner' && (
                  <span className="px-1 py-0.2 bg-[#7A1E34] text-white text-[8px] rounded font-mono">
                    AKTIF
                  </span>
                )}
              </div>
              <div className="text-xs sm:text-sm font-black text-[#7A1E34] font-mono mt-0.5">
                Rp {runnerBal.toLocaleString('id-ID')}
              </div>
            </div>
          </div>

          {/* Aturan Pajak & Poin Transparansi */}
          <div className="mt-3 pt-2.5 border-t border-[#E8DFD1] space-y-1 text-[10px] text-[#4A3D41]">
            <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DFD1] space-y-1">
              <div className="font-extrabold text-[#7A1E34] flex items-center gap-1">
                <span>💡 Saldo Mandiri Customer &amp; Runner:</span>
              </div>
              <p className="text-[#4A3D41] leading-relaxed">
                • Saldo <strong>Customer</strong> dan <strong>Runner</strong> terpisah mandiri di database backend. Masing-masing dapat melakukan top-up secara independen.
              </p>
              <p className="text-[#1F6F67] leading-relaxed font-semibold">
                • <strong>Pajak Platform 10%</strong> hanya dari ongkir jasa saat Runner menyelesaikan quest. Talangan nota belanja diganti 100% utuh.
              </p>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <div>
                <span className="text-[#8E7F83] block text-[10px]">Total Transaksi</span>
                <span className="font-bold text-[#2C2224]">
                  {profile.total_completed_orders} Selesai
                </span>
              </div>
              <div className="text-right">
                <span className="text-[#8E7F83] block text-[10px]">Status Dompet</span>
                <span className="font-bold text-[#2D8D84]">Sinkron Backend Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* TABS SWITCHER: TOP UP vs TARIK SALDO */}
        <div className="grid grid-cols-2 p-1 bg-[#F2EBE0] border border-[#E8DFD1] rounded-2xl mb-4 text-xs font-bold gap-1 shadow-inner">
          <button
            type="button"
            onClick={() => {
              setActiveWalletTab('topup');
              setErrorMessage('');
              setSuccessMessage('');
              soundFX.pop();
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeWalletTab === 'topup'
                ? 'bg-[#2D8D84] text-white shadow-md shadow-[#2D8D84]/25'
                : 'text-[#6E6265] hover:text-[#2C2224]'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Top Up Saldo</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveWalletTab('withdraw');
              setErrorMessage('');
              setSuccessMessage('');
              soundFX.pop();
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeWalletTab === 'withdraw'
                ? 'bg-[#7A1E34] text-white shadow-md shadow-[#7A1E34]/25'
                : 'text-[#6E6265] hover:text-[#2C2224]'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Tarik Saldo</span>
          </button>
        </div>

        {/* Feedback Messages */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-[#FBF0F2] border border-[#F1CCD3] rounded-2xl text-xs text-[#7A1E34] font-semibold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#7A1E34]" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-[#E8F6F3] border border-[#A5DDD3] rounded-2xl text-xs text-[#1F6F67] font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4 shrink-0 text-[#2D8D84]" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* TAB 1: FORM TOP UP SALDO */}
        {activeWalletTab === 'topup' && (
          <form onSubmit={handleTopUp} className="space-y-4 mb-5 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-[#2C2224] uppercase tracking-wider flex items-center gap-1.5">
                <ArrowDownLeft className="w-4 h-4 text-[#2D8D84]" />
                <span>Top Up Saldo {isRunner ? 'Runner' : 'Customer'}</span>
              </h4>
              <span className="text-[10px] text-[#2D8D84] font-bold bg-[#E8F6F3] px-2 py-0.5 rounded-lg border border-[#A5DDD3]">
                Instant 24 Jam
              </span>
            </div>

            {/* Metode Pembayaran Top Up */}
            <div>
              <label className="block text-[11px] font-bold text-[#4A3D41] mb-1.5">
                Pilih Metode Pembayaran Top Up:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'QRIS', name: 'QRIS Instant', icon: QrCode },
                  { id: 'GOPAY', name: 'GoPay', icon: Smartphone },
                  { id: 'DANA', name: 'DANA', icon: Smartphone },
                  { id: 'BCA', name: 'BCA Virtual Account', icon: Building }
                ].map((method) => {
                  const Icon = method.icon;
                  return (
                    <button
                      type="button"
                      key={method.id}
                      onClick={() => setTopUpMethod(method.id)}
                      className={`p-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer ${
                        topUpMethod === method.id
                          ? 'bg-[#2D8D84] text-white border-[#2D8D84] shadow-xs'
                          : 'bg-white border-[#E8DFD1] text-[#4A3D41] hover:border-[#2D8D84]'
                      }`}
                    >
                      <Icon
                        className={`w-3.5 h-3.5 ${
                          topUpMethod === method.id ? 'text-white' : 'text-[#2D8D84]'
                        }`}
                      />
                      <span className="truncate">{method.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Nominal Input */}
            <div>
              <label className="block text-[11px] font-bold text-[#4A3D41] mb-1">
                Nominal Top Up (Rp)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs text-[#8E7F83] font-bold">
                  Rp
                </span>
                <input
                  type="number"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 rounded-2xl bg-white border border-[#E8DFD1] text-sm text-[#2D8D84] font-black focus:outline-none focus:border-[#2D8D84] font-mono shadow-2xs"
                  placeholder="50000"
                  min={5000}
                  step={5000}
                  required
                />
              </div>

              {/* Quick Nominal Pills */}
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {[10000, 25000, 50000, 100000, 200000].map((quick) => (
                  <button
                    type="button"
                    key={quick}
                    onClick={() => setTopUpAmount(quick.toString())}
                    className={`px-2.5 py-1 rounded-xl text-[11px] border transition-colors font-mono font-bold cursor-pointer shadow-2xs ${
                      topUpAmount === quick.toString()
                        ? 'bg-[#2D8D84] text-white border-[#2D8D84]'
                        : 'bg-white hover:bg-[#FAF7F2] text-[#4A3D41] border-[#E8DFD1]'
                    }`}
                  >
                    +{quick.toLocaleString('id-ID')}
                  </button>
                ))}
              </div>
            </div>

            {/* Tombol Aksi Top Up */}
            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  soundFX.pop();
                  onClose();
                }}
                className="flex-1 py-2.5 px-3 rounded-2xl bg-[#FAF7F2] hover:bg-[#F2EBE0] text-[#4A3D41] font-bold text-xs border border-[#E8DFD1] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Batal</span>
              </button>

              <button
                type="submit"
                disabled={isTopUpLoading}
                className="flex-2 py-2.5 px-3 rounded-2xl bg-[#2D8D84] hover:bg-[#247D75] text-white font-black text-xs transition-colors shadow-md shadow-[#2D8D84]/25 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isTopUpLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowDownLeft className="w-4 h-4" />
                )}
                <span>
                  {isTopUpLoading
                    ? 'Memproses...'
                    : `Konfirmasi Top Up (${isRunner ? 'Runner' : 'Customer'})`}
                </span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: FORM TARIK SALDO */}
        {activeWalletTab === 'withdraw' && (
          <form onSubmit={handleWithdraw} className="space-y-4 mb-5 animate-in fade-in">
            <h4 className="text-xs font-black text-[#2C2224] uppercase tracking-wider flex items-center gap-1.5">
              <ArrowUpRight className="w-4 h-4 text-[#7A1E34]" />
              <span>Tarik Saldo ke E-Wallet / Bank</span>
            </h4>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'GOPAY', name: 'GoPay', icon: Smartphone },
                { id: 'OVO', name: 'OVO', icon: Smartphone },
                { id: 'DANA', name: 'DANA', icon: Smartphone },
                { id: 'BCA', name: 'Bank BCA', icon: Building }
              ].map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    type="button"
                    key={method.id}
                    onClick={() => setWithdrawMethod(method.id)}
                    className={`p-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer ${
                      withdrawMethod === method.id
                        ? 'bg-[#7A1E34] text-white border-[#7A1E34] shadow-xs'
                        : 'bg-white border-[#E8DFD1] text-[#4A3D41] hover:border-[#7A1E34]'
                    }`}
                  >
                    <Icon
                      className={`w-3.5 h-3.5 ${
                        withdrawMethod === method.id ? 'text-white' : 'text-[#7A1E34]'
                      }`}
                    />
                    <span>{method.name}</span>
                  </button>
                );
              })}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#4A3D41] mb-1">
                Nomor Akun / Rekening {withdrawMethod}
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-[#E8DFD1] text-xs text-[#2C2224] focus:outline-none focus:border-[#7A1E34] shadow-2xs"
                placeholder="081298765432 / Nomor Rekening"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#4A3D41] mb-1">
                Nominal Penarikan (Rp)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs text-[#8E7F83] font-bold">
                  Rp
                </span>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 rounded-2xl bg-white border border-[#E8DFD1] text-sm text-[#7A1E34] font-black focus:outline-none focus:border-[#7A1E34] font-mono shadow-2xs"
                  placeholder="50000"
                  min={10000}
                  step={5000}
                />
              </div>

              {/* Quick buttons */}
              <div className="flex gap-2 mt-2">
                {[25000, 50000, 100000].map((quick) => (
                  <button
                    type="button"
                    key={quick}
                    onClick={() => setWithdrawAmount(quick.toString())}
                    className="px-3 py-1 rounded-xl bg-white hover:bg-[#FAF7F2] text-[11px] text-[#4A3D41] border border-[#E8DFD1] transition-colors font-mono font-bold cursor-pointer shadow-2xs"
                  >
                    +{quick.toLocaleString('id-ID')}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setWithdrawAmount(activeBal.toString())}
                  className="px-3 py-1 rounded-xl bg-[#E8F6F3] text-[#1F6F67] hover:bg-[#D4EFEA] border border-[#A5DDD3] text-[11px] font-extrabold transition-colors cursor-pointer"
                >
                  Semua
                </button>
              </div>
            </div>

            {/* Dual Action Buttons */}
            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  soundFX.pop();
                  onClose();
                }}
                className="flex-1 py-2.5 px-3 rounded-2xl bg-[#FAF7F2] hover:bg-[#F2EBE0] text-[#4A3D41] font-bold text-xs border border-[#E8DFD1] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Batal</span>
              </button>

              <button
                type="submit"
                disabled={activeBal < 10000 || isWithdrawLoading}
                className="flex-2 py-2.5 px-3 rounded-2xl bg-[#7A1E34] hover:bg-[#6E1C2F] text-white font-black text-xs transition-colors shadow-md shadow-[#7A1E34]/25 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isWithdrawLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowUpRight className="w-4 h-4" />
                )}
                <span>
                  {isWithdrawLoading ? 'Memproses...' : 'Konfirmasi Tarik Saldo'}
                </span>
              </button>
            </div>
          </form>
        )}

        {/* History */}
        <div className="pt-3 border-t border-[#E8DFD1]">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#2C2224] mb-2">
            <History className="w-3.5 h-3.5 text-[#2D8D84]" />
            <span>Riwayat Quest Selesai</span>
          </div>
          <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
            {completedQuests.length > 0 ? (
              completedQuests.map((q) => {
                const tax = Math.round(q.bounty_fee * 0.1);
                const net = q.bounty_fee - tax;
                const item = q.item_cost || 0;
                const total = net + item;
                const pts = Math.floor(q.bounty_fee / 1000);

                return (
                  <div
                    key={q.id}
                    className="p-3 rounded-2xl bg-white border border-[#E8DFD1] flex items-center justify-between text-xs shadow-2xs"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="font-bold text-[#2C2224] truncate">{q.title}</p>
                      <div className="text-[10px] text-[#6E6265] flex items-center gap-1.5 flex-wrap mt-0.5">
                        <span className="text-[#2D8D84] font-semibold">
                          Bersih: Rp {net.toLocaleString('id-ID')}
                        </span>
                        <span className="text-[#D5C7B5]">•</span>
                        <span className="text-[#7A1E34]">
                          Pajak 10%: -Rp {tax.toLocaleString('id-ID')}
                        </span>
                        {item > 0 && (
                          <>
                            <span className="text-[#D5C7B5]">•</span>
                            <span className="text-[#2C2224] font-semibold">
                              Nota 100%: +Rp {item.toLocaleString('id-ID')}
                            </span>
                          </>
                        )}
                        <span className="text-[#D5C7B5]">•</span>
                        <span className="text-[#2D8D84] font-bold">+{pts} Poin</span>
                      </div>
                    </div>
                    <span className="text-[#2D8D84] font-black font-mono shrink-0 text-sm">
                      +Rp {total.toLocaleString('id-ID')}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-[#8E7F83] text-center py-2">
                Belum ada riwayat quest selesai
              </p>
            )}
          </div>
        </div>

        {/* Bottom Back Button */}
        <div className="mt-4 pt-3 border-t border-[#E8DFD1]">
          <button
            type="button"
            onClick={() => {
              soundFX.pop();
              onClose();
            }}
            className="w-full py-2.5 rounded-2xl bg-white hover:bg-[#FAF7F2] text-[#4A3D41] hover:text-[#2C2224] text-xs font-bold border border-[#E8DFD1] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs group"
          >
            <ArrowLeft className="w-4 h-4 text-[#2D8D84] group-hover:-translate-x-0.5 transition-transform" />
            <span>Kembali ke Halaman Utama</span>
          </button>
        </div>
      </div>
    </div>
  );
}
