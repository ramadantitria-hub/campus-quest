'use client';

import React, { useState } from 'react';
import { useCampusQuest } from '@/context/CampusQuestContext';
import {
  X,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle,
  Building,
  Smartphone,
  CreditCard,
  History,
  AlertCircle
} from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { profile, quests, withdrawWallet } = useCampusQuest();

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('GOPAY');
  const [accountNumber, setAccountNumber] = useState(profile.phone || '081298765432');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

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

    if (amt > profile.wallet_balance) {
      setErrorMessage('Saldo tidak mencukupi untuk melakukan penarikan ini');
      return;
    }

    const success = withdrawWallet(amt, withdrawMethod);
    if (success) {
      setSuccessMessage(`Berhasil mencairkan Rp ${amt.toLocaleString('id-ID')} ke ${withdrawMethod} (${accountNumber})`);
      setWithdrawAmount('');
      setTimeout(() => {
        setSuccessMessage('');
      }, 3500);
    }
  };

  // Completed quests that generated revenue
  const completedQuests = quests.filter((q) => q.status === 'COMPLETED');

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 max-w-md w-full rounded-2xl p-6 text-white shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Dompet CampusQuest</h3>
            <p className="text-xs text-slate-400">Saldo reward bounty &amp; transaksi kampus</p>
          </div>
        </div>

        {/* Saldo Card */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-emerald-500/30 rounded-2xl p-5 mb-5 shadow-inner relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">
            Saldo Tersedia
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 tracking-tight">
            Rp {profile.wallet_balance.toLocaleString('id-ID')}
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-slate-300 pt-3 border-t border-slate-800/80">
            <div>
              <span className="text-slate-500 block text-[10px]">Total Quest Selesai</span>
              <span className="font-semibold text-white">{profile.total_completed_orders} Transaksi</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Status Akun</span>
              <span className="font-semibold text-emerald-400">Siap Ditarik (Instant)</span>
            </div>
          </div>
        </div>

        {/* Form Tarik Saldo */}
        <form onSubmit={handleWithdraw} className="space-y-4 mb-5">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            Tarik Saldo ke E-Wallet / Bank
          </h4>

          {errorMessage && (
            <div className="p-3 bg-rose-950/50 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-950/50 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

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
                  className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                    withdrawMethod === method.id
                      ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{method.name}</span>
                </button>
              );
            })}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Nomor Akun / Rekening {withdrawMethod}
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
              placeholder="081298765432 / Nomor Rekening"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Nominal Penarikan (Rp)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-semibold">Rp</span>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
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
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 transition-colors font-mono"
                >
                  +{quick.toLocaleString('id-ID')}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setWithdrawAmount(profile.wallet_balance.toString())}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-[11px] font-semibold transition-colors"
              >
                Semua
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={profile.wallet_balance < 10000}
            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Konfirmasi Tarik Saldo Sekarang
          </button>
        </form>

        {/* History */}
        <div className="pt-3 border-t border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-2">
            <History className="w-3.5 h-3.5" />
            <span>Riwayat Quest Selesai</span>
          </div>
          <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
            {completedQuests.length > 0 ? (
              completedQuests.map((q) => (
                <div
                  key={q.id}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="font-semibold text-slate-200 truncate">{q.title}</p>
                    <span className="text-[10px] text-slate-500">
                      Bounty Jasa • {new Date(q.updated_at).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  <span className="text-emerald-400 font-bold font-mono shrink-0">
                    +Rp {q.bounty_fee.toLocaleString('id-ID')}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-2">Belum ada riwayat quest selesai</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
