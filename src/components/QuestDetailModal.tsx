'use client';

import React, { useState, useRef } from 'react';
import { useCampusQuest } from '@/context/CampusQuestContext';
import { Quest, QuestStatus, PaymentMethod } from '@/types/campus-quest';
import { compressImage } from '@/lib/image-compressor';
import {
  X,
  ShoppingBag,
  Wrench,
  Clock,
  MapPin,
  Coins,
  Receipt,
  QrCode,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  ShieldCheck,
  Star,
  Camera,
  Upload,
  ArrowRight,
  Sparkles,
  KeyRound,
  FileText
} from 'lucide-react';

interface QuestDetailModalProps {
  questId: string;
  isOpen: boolean;
  onClose: () => void;
  onOpenChat: (questId: string) => void;
}

export default function QuestDetailModal({
  questId,
  isOpen,
  onClose,
  onOpenChat
}: QuestDetailModalProps) {
  const {
    quests,
    activeRole,
    acceptQuest,
    declineQuest,
    updateQuestStatus,
    updateItemCost,
    verifyOtpAndComplete,
    submitPaymentProof,
    confirmPaymentReceived,
    submitReview
  } = useCampusQuest();

  // Item cost input for runner
  const [itemCostInput, setItemCostInput] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [isCompressingReceipt, setIsCompressingReceipt] = useState(false);

  // OTP input for customer
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');

  // Payment proof for customer
  const [showQrisModal, setShowQrisModal] = useState(false);
  const [paymentProofImg, setPaymentProofImg] = useState<string | null>(null);
  const [isCompressingProof, setIsCompressingProof] = useState(false);

  // Review modal
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const receiptFileRef = useRef<HTMLInputElement>(null);
  const paymentProofFileRef = useRef<HTMLInputElement>(null);

  const quest = quests.find((q) => q.id === questId);
  if (!isOpen || !quest) return null;

  // Status timeline steps
  const steps: { key: QuestStatus; label: string; desc: string }[] = [
    { key: 'OPEN', label: 'Quest Dibuat', desc: 'Menunggu Runner menerima' },
    { key: 'ACCEPTED', label: 'Diterima Runner', desc: 'Runner bersiap' },
    { key: 'ON_THE_WAY', label: 'Agent OTW', desc: 'Runner menuju lokasi' },
    { key: 'IN_PROGRESS', label: quest.category === 'JASTAP' ? 'Belanja Barang' : 'Servis Perangkat', desc: 'Eksekusi pesanan' },
    { key: 'DELIVERING', label: 'Pengantaran', desc: 'Menuju titik temu pemesan' },
    { key: 'COMPLETED', label: 'Selesai', desc: 'OTP Terverifikasi' }
  ];

  const getStepIndex = (status: QuestStatus) => {
    switch (status) {
      case 'OPEN': return 0;
      case 'ACCEPTED': return 1;
      case 'ON_THE_WAY': return 2;
      case 'IN_PROGRESS': return 3;
      case 'DELIVERING': return 4;
      case 'COMPLETED': return 5;
      default: return 0;
    }
  };

  const currentStepIdx = getStepIndex(quest.status);
  const totalBill = quest.bounty_fee + (quest.item_cost || 0);

  // Handlers for Runner
  const handleSaveItemCost = (e: React.FormEvent) => {
    e.preventDefault();
    const cost = parseInt(itemCostInput, 10);
    if (isNaN(cost) || cost < 0) {
      alert('Masukkan nominal nota yang valid');
      return;
    }
    updateItemCost(quest.id, cost, receiptImage || undefined);
    setItemCostInput('');
    alert('Biaya nota belanja & foto bukti berhasil diperbarui!');
  };

  const handleReceiptFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCompressingReceipt(true);
    try {
      const res = await compressImage(file, 1000, 1000, 0.75);
      setReceiptImage(res.dataUrl);
    } catch {
      alert('Gagal mengompres foto nota');
    } finally {
      setIsCompressingReceipt(false);
    }
  };

  // Handlers for Customer
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    setOtpSuccess('');

    const res = verifyOtpAndComplete(quest.id, otpInput);
    if (!res.success) {
      setOtpError(res.message);
    } else {
      setOtpSuccess(res.message);
      setOtpInput('');
    }
  };

  const handlePaymentProofFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCompressingProof(true);
    try {
      const res = await compressImage(file, 900, 900, 0.75);
      setPaymentProofImg(res.dataUrl);
    } catch {
      alert('Gagal mengompres bukti transfer');
    } finally {
      setIsCompressingProof(false);
    }
  };

  const handleConfirmProof = () => {
    if (!paymentProofImg) {
      alert('Unggah foto bukti transfer terlebih dahulu');
      return;
    }
    submitPaymentProof(quest.id, paymentProofImg, 'QRIS');
    setShowQrisModal(false);
    alert('Bukti pembayaran berhasil diunggah!');
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitReview(quest.id, rating, reviewComment);
    setReviewSubmitted(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <div className="bg-slate-900 border border-slate-700 max-w-2xl w-full rounded-2xl text-white shadow-2xl relative my-6 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-4 sm:p-5 bg-slate-950/80 border-b border-slate-800 flex items-start justify-between shrink-0">
            <div className="flex items-start gap-3 min-w-0 pr-2">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
                  quest.category === 'JASTAP'
                    ? 'bg-gradient-to-tr from-emerald-500 to-teal-600 shadow-emerald-500/20'
                    : 'bg-gradient-to-tr from-violet-500 to-purple-600 shadow-violet-500/20'
                }`}
              >
                {quest.category === 'JASTAP' ? (
                  <ShoppingBag className="w-5 h-5 text-white" />
                ) : (
                  <Wrench className="w-5 h-5 text-white" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      quest.category === 'JASTAP'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                    }`}
                  >
                    {quest.category === 'JASTAP' ? 'JASTAP (The Agent)' : 'JARVIS (The Machinist)'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ID: {quest.id}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mt-1 break-words">
                  {quest.title}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Status Stepper Timeline */}
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-sky-400" />
                  Status Progress Transaksi
                </h4>
                <span
                  className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    quest.status === 'COMPLETED'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : quest.status === 'OPEN'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                  }`}
                >
                  {quest.status}
                </span>
              </div>

              {/* Step indicator bar */}
              <div className="grid grid-cols-6 gap-1 sm:gap-2">
                {steps.map((st, idx) => {
                  const isDone = idx <= currentStepIdx;
                  const isCurrent = idx === currentStepIdx;
                  return (
                    <div key={st.key} className="flex flex-col items-center text-center">
                      <div
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isCurrent
                            ? 'bg-sky-500 text-slate-950 ring-4 ring-sky-500/30 font-extrabold scale-110'
                            : isDone
                            ? 'bg-emerald-500 text-slate-950 font-bold'
                            : 'bg-slate-800 text-slate-500 border border-slate-700'
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <span
                        className={`text-[9px] sm:text-[10px] font-semibold mt-1.5 leading-tight line-clamp-1 ${
                          isCurrent ? 'text-sky-300 font-bold' : isDone ? 'text-slate-200' : 'text-slate-600'
                        }`}
                      >
                        {st.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 block font-semibold">Titik Ambil / Lokasi Barang</span>
                  <span className="text-xs font-medium text-white break-words">{quest.origin_address}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 block font-semibold">Titik Antar / Lokasi Temu</span>
                  <span className="text-xs font-medium text-white break-words">{quest.destination_address}</span>
                </div>
              </div>
            </div>

            {/* Quest Description & Notes */}
            <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-semibold text-slate-300">Deskripsi Kebutuhan:</span>
                <span>
                  Jumlah: <strong className="text-white">{quest.quantity} {quest.unit}</strong>
                </span>
              </div>
              <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">{quest.description}</p>
            </div>

            {/* Financial Breakdown (inDrive model) */}
            <div className="p-4 bg-gradient-to-br from-slate-950 to-slate-900 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-emerald-400" />
                Rincian Biaya &amp; Total Tagihan
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    Biaya Jasa (Bounty Penawaran Customer)
                  </span>
                  <span className="font-bold font-mono text-amber-300">
                    Rp {quest.bounty_fee.toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Receipt className="w-3.5 h-3.5 text-sky-400" />
                    Biaya Aktual Belanjaan / Sparepart (Nota Fisik)
                  </span>
                  <span className="font-bold font-mono text-sky-300">
                    Rp {(quest.item_cost || 0).toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-sm">
                  <span className="font-bold text-white">Total Tagihan Final:</span>
                  <span className="text-base font-extrabold font-mono text-emerald-400">
                    Rp {totalBill.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Physical Receipt Photo if available */}
              {quest.receipt_image_url && (
                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-[11px] text-slate-300 font-semibold block mb-1.5">
                    Bukti Nota Belanja / Sparepart:
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={quest.receipt_image_url}
                    alt="Nota belanja"
                    className="w-full max-h-48 object-cover rounded-xl border border-slate-700 cursor-pointer"
                    onClick={() => window.open(quest.receipt_image_url, '_blank')}
                  />
                </div>
              )}
            </div>

            {/* RUNNER SPECIFIC CONTROLS */}
            {activeRole === 'runner' && (
              <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-amber-400" />
                    Panel Aksi Runner (Eksekusi Pesanan)
                  </h4>
                  <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full font-mono">
                    Mode Runner
                  </span>
                </div>

                {/* If Quest is OPEN: Accept or Decline (page 8 spec) */}
                {quest.status === 'OPEN' && (
                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-2">
                    <p className="text-xs text-slate-300">
                      Ambil pesanan ini dengan harga bounty <strong>Rp {quest.bounty_fee.toLocaleString('id-ID')}</strong>?
                    </p>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => acceptQuest(quest.id)}
                        className="flex-1 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md shadow-amber-400/20 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle className="w-4 h-4" /> Terima Quest (Accept)
                      </button>
                      <button
                        onClick={() => {
                          declineQuest(quest.id);
                          onClose();
                        }}
                        className="py-2.5 px-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-400 text-xs font-semibold"
                      >
                        Tolak (Decline)
                      </button>
                    </div>
                  </div>
                )}

                {/* Stepper Status Buttons when In-Progress */}
                {quest.status !== 'OPEN' && quest.status !== 'COMPLETED' && (
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-slate-200 block">
                      Perbarui Tahap Pengerjaan Anda:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <button
                        onClick={() => updateQuestStatus(quest.id, 'ON_THE_WAY')}
                        className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all ${
                          quest.status === 'ON_THE_WAY'
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        1. OTW ke Lokasi
                      </button>
                      <button
                        onClick={() => updateQuestStatus(quest.id, 'IN_PROGRESS')}
                        className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all ${
                          quest.status === 'IN_PROGRESS'
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        2. Belanja / Servis
                      </button>
                      <button
                        onClick={() => updateQuestStatus(quest.id, 'DELIVERING')}
                        className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all ${
                          quest.status === 'DELIVERING'
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        3. Menuju Pemesan
                      </button>
                    </div>

                    {/* Input nota & foto struk */}
                    <form onSubmit={handleSaveItemCost} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5">
                      <label className="text-xs font-bold text-slate-300 block flex items-center justify-between">
                        <span>Input Biaya Nota Belanja / Sparepart:</span>
                        <span className="text-[11px] text-sky-400 font-mono">
                          Saat ini: Rp {(quest.item_cost || 0).toLocaleString('id-ID')}
                        </span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={itemCostInput}
                          onChange={(e) => setItemCostInput(e.target.value)}
                          placeholder="Nominal nota (contoh: 25000)"
                          className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => receiptFileRef.current?.click()}
                          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-1 cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5 text-sky-400" />
                          Foto Nota
                        </button>
                        <input
                          ref={receiptFileRef}
                          type="file"
                          accept="image/*"
                          onChange={handleReceiptFile}
                          className="hidden"
                        />
                      </div>

                      {receiptImage && (
                        <div className="p-2 bg-slate-900 rounded-lg flex items-center justify-between text-xs text-emerald-400">
                          <span>✓ Foto nota terlampir (Auto Compressed)</span>
                          <button
                            type="button"
                            onClick={() => setReceiptImage(null)}
                            className="text-slate-400 hover:text-white"
                          >
                            Hapus
                          </button>
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                      >
                        Simpan Biaya Nota ke Transaksi
                      </button>
                    </form>

                    {/* Display OTP for Runner to tell Customer */}
                    <div className="p-3.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 rounded-xl text-center">
                      <span className="text-xs text-amber-200 block font-semibold">
                        KODE OTP PENYELESAIAN (Tunjukkan ke Pemesan Saat Barang Tiba):
                      </span>
                      <div className="text-2xl font-black font-mono tracking-widest text-amber-400 mt-1 select-all">
                        {quest.completion_otp}
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        Customer akan memasukkan kode ini di aplikasinya untuk mencairkan saldo Anda.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CUSTOMER SPECIFIC CONTROLS */}
            {activeRole === 'customer' && (
              <div className="p-4 bg-sky-950/20 border border-sky-500/30 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-sky-400" />
                    Panel Pembayaran &amp; Verifikasi OTP
                  </h4>
                  <span className="text-[10px] text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full font-mono">
                    Mode Customer
                  </span>
                </div>

                {/* Payment Action */}
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-300 font-semibold block">
                        Metode Bayar: <strong>{quest.payment_method}</strong>
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Status: <strong className={quest.payment_status === 'PAID' ? 'text-emerald-400' : 'text-amber-400'}>
                          {quest.payment_status === 'PAID' ? 'LUNAS (PAID)' : 'MENUNGGU PEMBAYARAN'}
                        </strong>
                      </span>
                    </div>

                    <button
                      onClick={() => setShowQrisModal(true)}
                      className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-sky-500/20"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      Bayar via QRIS / Bank
                    </button>
                  </div>
                </div>

                {/* OTP Completion Input Box (Page 2 & 7 spec) */}
                {quest.status !== 'COMPLETED' && (
                  <form onSubmit={handleVerifyOtp} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
                    <label className="text-xs font-bold text-white block flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4 text-amber-400" />
                      Masukkan Kode OTP dari Runner untuk Menyelesaikan Transaksi:
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Minta kode 6 digit dari Runner saat barang sudah Anda terima / servis selesai dengan baik.
                    </p>

                    {otpError && (
                      <div className="p-2.5 bg-rose-950/60 border border-rose-500/50 rounded-xl text-xs text-rose-300">
                        {otpError}
                      </div>
                    )}
                    {otpSuccess && (
                      <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" /> {otpSuccess}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value)}
                        placeholder="6 Digit OTP (contoh: 419582)"
                        className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-center font-mono font-bold tracking-widest text-white focus:outline-none focus:border-amber-400"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                      >
                        Verifikasi OTP
                      </button>
                    </div>
                  </form>
                )}

                {/* Rating & Review Section after Completed */}
                {quest.status === 'COMPLETED' && (
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
                    <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-amber-400" />
                      Ulasan &amp; Rating Runner
                    </h5>

                    {reviewSubmitted ? (
                      <p className="text-xs text-emerald-300">
                        ✓ Terima kasih atas ulasan Anda! Rating telah tersimpan ke profil runner.
                      </p>
                    ) : (
                      <form onSubmit={handleReviewSubmit} className="space-y-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-slate-400">Beri Bintang:</span>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              className="p-1 text-slate-600 hover:text-amber-400"
                            >
                              <Star
                                className={`w-5 h-5 ${
                                  star <= rating
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-slate-600'
                                }`}
                              />
                            </button>
                          ))}
                        </div>

                        <textarea
                          rows={2}
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Tulis ulasan performa runner..."
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
                          required
                        />

                        <button
                          type="submit"
                          className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                        >
                          Kirim Ulasan Bintang {rating}
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Modal Footer Toolbar */}
          <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between shrink-0">
            <button
              onClick={() => onOpenChat(quest.id)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-sky-400" />
              <span>Buka Live Chat</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>

      {/* QRIS & Bank Transfer Payment Modal */}
      {showQrisModal && (
        <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 max-w-sm w-full rounded-2xl p-5 text-white shadow-2xl relative my-6">
            <button
              onClick={() => setShowQrisModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-4">
              <h3 className="text-base font-bold text-white flex items-center justify-center gap-2">
                <QrCode className="w-5 h-5 text-sky-400" />
                Pembayaran QRIS Statis
              </h3>
              <p className="text-xs text-slate-400">Scan melalui BCA, GoPay, OVO, ShopeePay, DANA</p>
            </div>

            {/* Simulated QRIS Code SVG Box */}
            <div className="bg-white p-4 rounded-2xl mx-auto w-48 h-48 flex flex-col items-center justify-center shadow-lg">
              <div className="w-36 h-36 bg-slate-950 p-2 rounded-xl flex items-center justify-center relative">
                {/* Visual SVG QR */}
                <svg viewBox="0 0 100 100" className="w-full h-full fill-white">
                  <rect x="0" y="0" width="30" height="30" fill="white" />
                  <rect x="5" y="5" width="20" height="20" fill="black" />
                  <rect x="10" y="10" width="10" height="10" fill="white" />

                  <rect x="70" y="0" width="30" height="30" fill="white" />
                  <rect x="75" y="5" width="20" height="20" fill="black" />
                  <rect x="80" y="10" width="10" height="10" fill="white" />

                  <rect x="0" y="70" width="30" height="30" fill="white" />
                  <rect x="5" y="75" width="20" height="20" fill="black" />
                  <rect x="10" y="80" width="10" height="10" fill="white" />

                  <rect x="40" y="10" width="10" height="10" fill="white" />
                  <rect x="40" y="30" width="20" height="10" fill="white" />
                  <rect x="40" y="50" width="10" height="20" fill="white" />
                  <rect x="60" y="60" width="20" height="10" fill="white" />
                  <rect x="80" y="80" width="10" height="10" fill="white" />
                  <rect x="20" y="45" width="10" height="10" fill="white" />
                </svg>
                <div className="absolute w-8 h-8 rounded-lg bg-sky-500 text-white font-extrabold text-[10px] flex items-center justify-center">
                  CQ
                </div>
              </div>
              <span className="text-[10px] text-slate-800 font-bold mt-1">NMID: ID10293847582</span>
            </div>

            {/* Total to Pay */}
            <div className="my-4 text-center">
              <span className="text-xs text-slate-400 block">Total Nominal Transfer:</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">
                Rp {totalBill.toLocaleString('id-ID')}
              </span>
              <div className="mt-2 p-2 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-300">
                <span>Bank Mandiri Rekening Kampus:</span>
                <strong className="block text-white font-mono">157-00-0982314-1 (CampusQuest UI)</strong>
              </div>
            </div>

            {/* Upload Transfer Proof */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                Unggah Foto Bukti Transfer:
              </label>

              <button
                type="button"
                onClick={() => paymentProofFileRef.current?.click()}
                className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4 text-sky-400" />
                {paymentProofImg ? 'Ganti Foto Bukti' : 'Pilih Foto Bukti Transfer'}
              </button>
              <input
                ref={paymentProofFileRef}
                type="file"
                accept="image/*"
                onChange={handlePaymentProofFile}
                className="hidden"
              />

              {paymentProofImg && (
                <div className="p-2 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
                  <span>✓ Bukti terlampir (Auto Compressed)</span>
                  <button
                    type="button"
                    onClick={() => setPaymentProofImg(null)}
                    className="text-slate-400 hover:text-white"
                  >
                    Batal
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={handleConfirmProof}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                Kirim Bukti Pembayaran
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
