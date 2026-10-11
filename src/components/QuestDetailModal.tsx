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
  ArrowLeft,
  KeyRound,
  FileText,
  Phone,
  User,
  Navigation,
  Send,
  Check,
  Ban,
  AlertCircle
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
    submitReview,
    cancelQuest,
    increaseBounty
  } = useCampusQuest();

  // Cancel & Bounty Increase feedback
  const [cancelFeedback, setCancelFeedback] = useState<string | null>(null);
  const [bountyFeedback, setBountyFeedback] = useState<string | null>(null);

  // Item cost input for runner
  const [itemCostInput, setItemCostInput] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [isCompressingReceipt, setIsCompressingReceipt] = useState(false);
  const [notaMessage, setNotaMessage] = useState<string | null>(null);
  const [runnerFeedback, setRunnerFeedback] = useState<string | null>(null);

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
  const handleAcceptInModal = () => {
    acceptQuest(quest.id);
    setRunnerFeedback('✓ Quest berhasil Anda ambil! Segera persiapkan perjalanan.');
  };

  const handleUpdateStatusInModal = (nextStatus: QuestStatus) => {
    updateQuestStatus(quest.id, nextStatus);
    const labelMap: Record<QuestStatus, string> = {
      OPEN: 'Quest dibuka kembali',
      ACCEPTED: 'Quest siap dikerjakan',
      ON_THE_WAY: 'Status diperbarui: OTW menuju lokasi penjemputan/belanja!',
      IN_PROGRESS: 'Status diperbarui: Sedang belanja/servis pesanan!',
      DELIVERING: 'Status diperbarui: Sedang menuju titik temu pemesan!',
      COMPLETED: 'Status: Transaksi selesai!',
      CANCELLED: 'Status: Dibatalkan'
    };
    setRunnerFeedback(labelMap[nextStatus] || 'Status berhasil diperbarui!');
  };

  const handleSaveItemCost = (e?: React.FormEvent, andAdvanceToDelivering = false) => {
    if (e) e.preventDefault();
    setNotaMessage(null);
    const cost = parseInt(itemCostInput, 10);
    if (isNaN(cost) || cost < 0) {
      setNotaMessage('⚠️ Masukkan nominal nota belanja yang valid (angka positif).');
      return;
    }
    updateItemCost(quest.id, cost, receiptImage || undefined);
    setItemCostInput('');
    if (andAdvanceToDelivering) {
      updateQuestStatus(quest.id, 'DELIVERING');
      setRunnerFeedback(`✓ Nota Rp ${cost.toLocaleString('id-ID')} disimpan & status beralih: Sedang OTW ke Pemesan!`);
    } else {
      setNotaMessage(`✓ Biaya nota Rp ${cost.toLocaleString('id-ID')} & bukti foto berhasil disimpan ke tagihan!`);
    }
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
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
        <div className="bg-[#FAF7F2] border-t sm:border border-[#E8DFD1] max-w-2xl w-full rounded-t-3xl sm:rounded-3xl text-[#2C2224] shadow-2xl relative max-h-[88vh] sm:max-h-[92vh] flex flex-col animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-200">
          {/* Mobile Drag Indicator Pill */}
          <div className="w-12 h-1 bg-[#E8DFD1] rounded-full mx-auto my-2.5 sm:hidden shrink-0" />

          {/* Header */}
          <div className="p-4 sm:p-5 bg-white/90 border-b border-[#E8DFD1] flex items-start justify-between shrink-0 rounded-t-3xl">
            <div className="flex items-start gap-3 min-w-0 pr-2">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                  quest.category === 'JASTAP'
                    ? 'bg-gradient-to-tr from-[#195C56] to-[#2D8D84] text-white shadow-[#2D8D84]/20'
                    : 'bg-gradient-to-tr from-[#6E1C2F] to-[#7A1E34] text-white shadow-[#7A1E34]/20'
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
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      quest.category === 'JASTAP'
                        ? 'bg-[#E8F6F3] text-[#2D8D84] border border-[#A5DDD3]'
                        : 'bg-[#FBF0F2] text-[#7A1E34] border border-[#F1CCD3]'
                    }`}
                  >
                    {quest.category === 'JASTAP' ? 'JASTAP (The Agent)' : 'JARVIS (The Machinist)'}
                  </span>
                  <span className="text-[10px] text-[#6E6265] font-mono">
                    ID: {quest.id}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#2C2224] mt-1 break-words">
                  {quest.title}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#F2EBE0] text-[#6E6265] hover:text-[#2C2224] text-xs font-semibold border border-[#E8DFD1] transition-all cursor-pointer group shadow-sm"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#6E6265] group-hover:-translate-x-0.5 transition-transform" />
                <span className="hidden sm:inline">Kembali</span>
              </button>
              <button
                onClick={onClose}
                className="text-[#6E6265] hover:text-[#2C2224] p-1.5 rounded-xl hover:bg-[#F2EBE0] transition-colors cursor-pointer"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Status Stepper Timeline */}
            <div className="bg-white p-4 rounded-2xl border border-[#E8DFD1] shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-[#6E6265] uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#2D8D84]" />
                  Status Progress Transaksi
                </h4>
                <span
                  className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    quest.status === 'COMPLETED'
                      ? 'bg-[#E8F6F3] text-[#2D8D84] border border-[#A5DDD3]'
                      : quest.status === 'OPEN'
                      ? 'bg-[#FBF0F2] text-[#7A1E34] border border-[#F1CCD3]'
                      : 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
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
                        className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold transition-all ${
                          isCurrent
                            ? 'bg-[#2D8D84] text-white ring-2 sm:ring-4 ring-[#2D8D84]/25 font-extrabold scale-105 sm:scale-110 shadow-sm'
                            : isDone
                            ? 'bg-[#7A1E34] text-white font-bold'
                            : 'bg-[#F2EBE0] text-[#8C7E81] border border-[#E8DFD1]'
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <span
                        className={`text-[8px] sm:text-[10px] font-semibold mt-1 leading-tight line-clamp-1 ${
                          isCurrent ? 'text-[#2D8D84] font-bold' : isDone ? 'text-[#2C2224]' : 'text-[#8C7E81]'
                        }`}
                      >
                        {st.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 1. KARTU IDENTITAS PEMESAN (CUSTOMER UPI) */}
            <div className="p-4 bg-white rounded-2xl border border-[#E8DFD1] space-y-3.5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#FBF0F2] border border-[#F1CCD3] text-[#7A1E34] flex items-center justify-center font-bold text-xs">
                    UPI
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#2C2224] uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#7A1E34]" />
                      Identitas Pemesan (Customer UPI)
                    </h4>
                    <p className="text-[10px] text-[#6E6265]">Civitas Akademika Universitas Pendidikan Indonesia</p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#E8F6F3] text-[#2D8D84] border border-[#A5DDD3] flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#2D8D84]" /> Terverifikasi UPI
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-[#FDFBF7] rounded-xl border border-[#E8DFD1]">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        quest.customer_avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(quest.customer_name)}&background=7A1E34&color=fff&size=100`
                      }
                      alt={quest.customer_name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#A5DDD3]"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#2D8D84] rounded-full border-2 border-white" />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-sm font-bold text-[#2C2224] truncate">{quest.customer_name}</h5>
                    <div className="flex items-center gap-2 text-[11px] text-[#6E6265] mt-0.5 flex-wrap">
                      {quest.customer_nim && (
                        <span className="font-mono bg-[#FBF0F2] px-1.5 py-0.5 rounded border border-[#F1CCD3] text-[#7A1E34] font-bold">
                          NIM: {quest.customer_nim}
                        </span>
                      )}
                      <span className="truncate">{quest.customer_major || 'Mahasiswa UPI'}</span>
                    </div>
                    {quest.customer_phone && (
                      <span className="text-[10px] text-[#6E6265] block mt-0.5 font-mono">
                        No. HP / WA: {quest.customer_phone}
                      </span>
                    )}
                  </div>
                </div>

                {/* Direct Contact Buttons */}
                <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E8DFD1] shrink-0">
                  {quest.customer_phone && (
                    <a
                      href={`https://wa.me/62${quest.customer_phone.replace(/^0/, '').replace(/\D/g, '')}?text=${encodeURIComponent(
                        `Halo Kak ${quest.customer_name}, saya runner CampusQuest UPI yang menerima pesanan "${quest.title}". Saya ingin konfirmasi titik penjemputan & kebutuhan pesanan.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  )}
                  <button
                    onClick={() => onOpenChat(quest.id)}
                    className="px-3 py-2 rounded-xl bg-[#7A1E34] hover:bg-[#6E1C2F] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm shadow-[#7A1E34]/20 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Chat Internal</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 2. PANDUAN RUTE PENJEMPUTAN & PENGANTARAN (TITIK AMBIL & ANTAR) */}
            <div className="p-4 bg-white rounded-2xl border border-[#E8DFD1] space-y-3.5 shadow-sm">
              <h4 className="text-xs font-bold text-[#6E6265] uppercase tracking-wider flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-[#7A1E34]" />
                Panduan Lokasi Titik Ambil &amp; Titik Antar
              </h4>

              <div className="relative pl-7 space-y-4 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-[#7A1E34] before:to-[#2D8D84]">
                {/* Titik Ambil */}
                <div className="relative">
                  <div className="absolute -left-7 top-0.5 w-4 h-4 rounded-full bg-[#7A1E34] border-2 border-white flex items-center justify-center shadow" />
                  <div className="bg-[#FDFBF7] p-3 rounded-xl border border-[#E8DFD1]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#FBF0F2] text-[#7A1E34] border border-[#F1CCD3]">
                        1. Titik Ambil / Pembelian
                      </span>
                      {quest.landmark_origin && (
                        <span className="text-[11px] text-[#7A1E34] font-medium">
                          Patokan: {quest.landmark_origin}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-[#2C2224] mt-1.5 break-words">{quest.origin_address}</p>
                  </div>
                </div>

                {/* Titik Antar */}
                <div className="relative">
                  <div className="absolute -left-7 top-0.5 w-4 h-4 rounded-full bg-[#2D8D84] border-2 border-white flex items-center justify-center shadow" />
                  <div className="bg-[#FDFBF7] p-3 rounded-xl border border-[#E8DFD1]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#E8F6F3] text-[#2D8D84] border border-[#A5DDD3]">
                        2. Titik Antar / Lokasi Temu Pemesan
                      </span>
                      {quest.landmark_destination && (
                        <span className="text-[11px] text-[#2D8D84] font-medium">
                          Patokan: {quest.landmark_destination}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-[#2C2224] mt-1.5 break-words">{quest.destination_address}</p>
                  </div>
                </div>
              </div>

              {quest.notes && (
                <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E8DFD1] text-xs text-[#2C2224] space-y-1">
                  <strong className="text-[#7A1E34] block font-semibold">Catatan Khusus Pemesan:</strong>
                  <p className="text-[#6E6265] break-words">{quest.notes}</p>
                </div>
              )}
            </div>

            {/* Quest Description & Notes */}
            <div className="p-3.5 bg-white rounded-xl border border-[#E8DFD1] space-y-1.5 text-xs shadow-sm">
              <div className="flex items-center justify-between text-[#6E6265]">
                <span className="font-semibold text-[#2C2224]">Deskripsi Rincian Kebutuhan:</span>
                <span>
                  Jumlah: <strong className="text-[#2C2224]">{quest.quantity} {quest.unit}</strong>
                </span>
              </div>
              <p className="text-[#6E6265] whitespace-pre-wrap leading-relaxed">{quest.description}</p>
            </div>

            {/* Financial Breakdown (Transparansi Saldo, Pajak 10% Ongkir & Poin) */}
            <div className="p-4 bg-white rounded-2xl border border-[#E8DFD1] space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#6E6265] uppercase tracking-wider flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-[#2D8D84]" />
                  Rincian Biaya &amp; Total Tagihan
                </h4>
                <span className="text-[10px] text-[#7A1E34] bg-[#FBF0F2] border border-[#F1CCD3] px-2.5 py-0.5 rounded-full font-semibold">
                  Pajak 10% dari Ongkir
                </span>
              </div>

              {(() => {
                const platformFee = Math.round(quest.bounty_fee * 0.1);
                const netBounty = quest.bounty_fee - platformFee;
                const itemReimbursement = quest.item_cost || 0;
                const runnerTotalPayout = netBounty + itemReimbursement;
                const pointsEarned = Math.floor(quest.bounty_fee / 1000);

                return (
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[#6E6265] flex items-center gap-1 min-w-0">
                        <Coins className="w-3.5 h-3.5 text-[#7A1E34] shrink-0" />
                        <span className="truncate sm:overflow-visible">Ongkir / Upah Jasa (Bounty):</span>
                      </span>
                      <span className="font-bold font-mono text-[#7A1E34] shrink-0">
                        Rp {quest.bounty_fee.toLocaleString('id-ID')}
                      </span>
                    </div>

                    {/* Breakdown Kotak Pajak 10% & Poin */}
                    <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DFD1] space-y-1 text-[11px]">
                      <div className="flex items-center justify-between text-[#6E6265]">
                        <span>• Pajak Platform (10% dari ongkir):</span>
                        <span className="font-mono text-[#7A1E34] font-semibold">
                          -Rp {platformFee.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[#2D8D84]">
                        <span>• Hak Bersih Runner (90% ongkir):</span>
                        <span className="font-mono font-bold">
                          Rp {netBounty.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[#2D8D84] pt-0.5 border-t border-[#E8DFD1]">
                        <span>• Reward Poin Mahasiswa:</span>
                        <span className="font-mono font-bold">
                          +{pointsEarned} CQ Poin
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[#6E6265] flex items-center gap-1 min-w-0">
                        <Receipt className="w-3.5 h-3.5 text-[#2D8D84] shrink-0" />
                        <div>
                          <span className="truncate sm:overflow-visible block text-[#2C2224]">Talangan Belanjaan / Nota Riil:</span>
                          <span className="text-[10px] text-[#2D8D84] font-medium">100% Utuh Tanpa Potongan Pajak</span>
                        </div>
                      </span>
                      <span className="font-bold font-mono text-[#2D8D84] shrink-0">
                        Rp {itemReimbursement.toLocaleString('id-ID')}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-[#E8DFD1] space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-bold text-[#2C2224]">Total Tagihan Pemesan (Customer):</span>
                        <span className="text-base font-extrabold font-mono text-[#7A1E34]">
                          Rp {totalBill.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-[#6E6265]">
                        <span>Estimasi Masuk Saldo Runner:</span>
                        <span className="font-mono font-semibold text-[#2D8D84]">
                          Rp {runnerTotalPayout.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Physical Receipt Photo if available */}
              {quest.receipt_image_url && (
                <div className="pt-2 border-t border-[#E8DFD1]">
                  <span className="text-[11px] text-[#2C2224] font-semibold block mb-1.5">
                    Bukti Nota Belanja / Sparepart:
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={quest.receipt_image_url}
                    alt="Nota belanja"
                    className="w-full max-h-48 object-cover rounded-xl border border-[#E8DFD1] cursor-pointer"
                    onClick={() => window.open(quest.receipt_image_url, '_blank')}
                  />
                </div>
              )}
            </div>

            {/* RUNNER SPECIFIC CONTROLS */}
            {activeRole === 'runner' && (
              <div className="p-4 bg-white border border-[#E8DFD1] rounded-2xl space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#2D8D84] uppercase tracking-wider flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-[#2D8D84]" />
                    Panel Kendali Misi Runner (Interactive Control)
                  </h4>
                  <span className="text-[10px] text-[#2D8D84] bg-[#E8F6F3] border border-[#A5DDD3] px-2 py-0.5 rounded-full font-mono font-bold">
                    Mode Runner
                  </span>
                </div>

                {/* Inline Feedback Banner */}
                {runnerFeedback && (
                  <div className="p-3 bg-[#E8F6F3] border border-[#A5DDD3] rounded-xl text-xs text-[#1F6F67] flex items-center justify-between gap-2 animate-fadeIn font-semibold">
                    <span>{runnerFeedback}</span>
                    <button
                      onClick={() => setRunnerFeedback(null)}
                      className="text-[#1F6F67] hover:text-[#2C2224] text-xs font-bold"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* If Quest is OPEN: Accept or Decline */}
                {quest.status === 'OPEN' && (
                  <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E8DFD1] space-y-3">
                    <p className="text-xs text-[#2C2224]">
                      Ambil pesanan ini dengan harga upah jasa (bounty){' '}
                      <strong className="text-[#7A1E34]">Rp {quest.bounty_fee.toLocaleString('id-ID')}</strong>?
                    </p>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={handleAcceptInModal}
                        className="flex-1 py-2.5 rounded-xl bg-[#2D8D84] hover:bg-[#247D75] text-white font-bold text-xs shadow-md shadow-[#2D8D84]/20 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle className="w-4 h-4" /> Terima &amp; Kerjakan Quest Ini
                      </button>
                      <button
                        onClick={() => {
                          declineQuest(quest.id);
                          onClose();
                        }}
                        className="py-2.5 px-4 rounded-xl border border-[#E8DFD1] bg-white hover:bg-[#F2EBE0] text-[#6E6265] text-xs font-semibold cursor-pointer"
                      >
                        Tolak
                      </button>
                    </div>
                  </div>
                )}

                {/* Stepper Status Buttons when In-Progress */}
                {quest.status !== 'OPEN' && quest.status !== 'COMPLETED' && (
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-[#2C2224] block">
                      Perbarui Tahap Pengerjaan Anda (1-Klik Interaktif):
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleUpdateStatusInModal('ON_THE_WAY')}
                        className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          quest.status === 'ON_THE_WAY'
                            ? 'bg-[#2D8D84] border-[#2D8D84] text-white font-bold shadow-md shadow-[#2D8D84]/20'
                            : 'bg-white border-[#E8DFD1] text-[#6E6265] hover:border-[#2D8D84] hover:text-[#2C2224]'
                        }`}
                      >
                        1. 🚀 OTW ke Lokasi
                      </button>
                      <button
                        onClick={() => handleUpdateStatusInModal('IN_PROGRESS')}
                        className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          quest.status === 'IN_PROGRESS'
                            ? 'bg-[#2D8D84] border-[#2D8D84] text-white font-bold shadow-md shadow-[#2D8D84]/20'
                            : 'bg-white border-[#E8DFD1] text-[#6E6265] hover:border-[#2D8D84] hover:text-[#2C2224]'
                        }`}
                      >
                        2. 🛒 Belanja / Servis
                      </button>
                      <button
                        onClick={() => handleUpdateStatusInModal('DELIVERING')}
                        className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          quest.status === 'DELIVERING'
                            ? 'bg-[#2D8D84] border-[#2D8D84] text-white font-bold shadow-md shadow-[#2D8D84]/20'
                            : 'bg-white border-[#E8DFD1] text-[#6E6265] hover:border-[#2D8D84] hover:text-[#2C2224]'
                        }`}
                      >
                        3. 🛵 Menuju Pemesan
                      </button>
                    </div>

                    {/* Input nota & foto struk */}
                    <div className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#E8DFD1] space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-[#2C2224] block">
                          Input Biaya Nota Belanja / Sparepart:
                        </label>
                        <span className="text-[11px] text-[#2D8D84] font-mono font-bold">
                          Nota saat ini: Rp {(quest.item_cost || 0).toLocaleString('id-ID')}
                        </span>
                      </div>

                      {notaMessage && (
                        <div className="p-2.5 rounded-xl bg-[#E8F6F3] border border-[#A5DDD3] text-xs font-medium text-[#1F6F67]">
                          {notaMessage}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={itemCostInput}
                          onChange={(e) => setItemCostInput(e.target.value)}
                          placeholder="Nominal nota (contoh: 25000)"
                          className="flex-1 px-3 py-2 bg-white border border-[#E8DFD1] rounded-xl text-xs text-[#2C2224] focus:outline-none focus:border-[#2D8D84] font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => receiptFileRef.current?.click()}
                          className="px-3 py-2 bg-white hover:bg-[#F2EBE0] rounded-xl text-xs font-semibold text-[#2C2224] border border-[#E8DFD1] flex items-center gap-1 cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5 text-[#2D8D84]" />
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
                        <div className="p-2 bg-white rounded-lg flex items-center justify-between text-xs text-[#2D8D84] border border-[#A5DDD3]">
                          <span>✓ Foto nota terlampir (Auto Compressed)</span>
                          <button
                            type="button"
                            onClick={() => setReceiptImage(null)}
                            className="text-[#6E6265] hover:text-[#2C2224]"
                          >
                            Hapus
                          </button>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={(e) => handleSaveItemCost(e, false)}
                          className="py-2.5 px-3 bg-white hover:bg-[#F2EBE0] text-[#2C2224] font-bold text-xs rounded-xl transition-colors cursor-pointer border border-[#E8DFD1]"
                        >
                          Simpan Nota Saja
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleSaveItemCost(e, true)}
                          className="py-2.5 px-3 bg-[#2D8D84] hover:bg-[#247D75] text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-md shadow-[#2D8D84]/20"
                        >
                          ⚡ Simpan &amp; Lanjut Antar ke Pemesan
                        </button>
                      </div>
                    </div>

                    {/* Display OTP for Runner to tell Customer */}
                    <div className="p-3.5 bg-[#FBF0F2] border border-[#F1CCD3] rounded-xl text-center">
                      <span className="text-xs text-[#7A1E34] block font-semibold">
                        KODE OTP PENYELESAIAN (Tunjukkan ke Pemesan Saat Barang Tiba):
                      </span>
                      <div className="text-2xl font-black font-mono tracking-widest text-[#7A1E34] mt-1 select-all">
                        {quest.completion_otp}
                      </div>
                      <span className="text-[10px] text-[#6E6265] block mt-1">
                        Customer akan memasukkan kode ini di aplikasinya untuk menyelesaikan pesanan &amp; mencairkan saldo Anda.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CUSTOMER SPECIFIC CONTROLS */}
            {activeRole === 'customer' && (
              <div className="p-4 bg-white border border-[#E8DFD1] rounded-2xl space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#7A1E34] uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#7A1E34]" />
                    Panel Pembayaran &amp; Verifikasi OTP
                  </h4>
                  <span className="text-[10px] text-[#7A1E34] bg-[#FBF0F2] border border-[#F1CCD3] px-2 py-0.5 rounded-full font-mono font-bold">
                    Mode Customer
                  </span>
                </div>

                {/* 1. Status Antrean, Timeout & Batalkan Quest */}
                {quest.status === 'OPEN' && !quest.runner_id && (() => {
                  const createdTime = new Date(quest.created_at).getTime();
                  const elapsedMs = Math.max(0, Date.now() - createdTime);
                  const isJastap = quest.category === 'JASTAP';
                  const timeoutLimitMs = isJastap ? 5 * 60 * 1000 : 24 * 60 * 60 * 1000;
                  const isTimeout = elapsedMs >= timeoutLimitMs;
                  const remainingSec = Math.max(0, Math.floor((timeoutLimitMs - elapsedMs) / 1000));
                  const remMin = Math.floor(remainingSec / 60);
                  const remSec = remainingSec % 60;

                  return (
                    <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#E8DFD1] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#2C2224] flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#7A1E34]" />
                          Status Antrean Menunggu Runner
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isTimeout 
                            ? 'bg-[#FBF0F2] text-[#7A1E34] border border-[#F1CCD3] animate-pulse'
                            : 'bg-[#E8F6F3] text-[#2D8D84] border border-[#A5DDD3]'
                        }`}>
                          {isTimeout ? '⚠️ Batas Waktu Terlewati' : `⏳ Sisa: ${remMin}m ${remSec < 10 ? '0' : ''}${remSec}s`}
                        </span>
                      </div>

                      {/* Warning Banner if Timeout */}
                      {isTimeout && (
                        <div className="p-3 bg-[#FBF0F2] border border-[#F1CCD3] rounded-xl text-xs text-[#7A1E34] space-y-1">
                          <div className="font-bold flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            <span>
                              {isJastap 
                                ? 'Pesanan JASTAP belum diambil setelah 5 menit!'
                                : 'Pesanan JARVIS belum diambil setelah 24 jam!'}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#6E6265]">
                            Runner di sekitar Anda mungkin sedang sibuk. Anda dapat menaikkan upah bounty jasa agar lebih menarik, atau membatalkan pesanan.
                          </p>
                        </div>
                      )}

                      {/* Feedback banner */}
                      {cancelFeedback && (
                        <div className="p-2.5 bg-[#E8F6F3] border border-[#A5DDD3] rounded-xl text-xs text-[#2D8D84] flex items-center gap-1.5 font-semibold">
                          <CheckCircle className="w-4 h-4" />
                          <span>{cancelFeedback}</span>
                        </div>
                      )}

                      {bountyFeedback && (
                        <div className="p-2.5 bg-[#E8F6F3] border border-[#A5DDD3] rounded-xl text-xs text-[#2D8D84] flex items-center gap-1.5 font-semibold">
                          <CheckCircle className="w-4 h-4" />
                          <span>{bountyFeedback}</span>
                        </div>
                      )}

                      {/* Action Buttons: Batalkan Quest & Naikkan Bounty */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Batalkan quest ini sekarang? Pesanan akan dihapus dari antrean runner.')) {
                              const res = cancelQuest(quest.id);
                              if (res.success) {
                                setCancelFeedback(res.message);
                                setTimeout(() => onClose(), 1200);
                              } else {
                                alert(res.message);
                              }
                            }
                          }}
                          className="flex-1 py-2 px-3 rounded-xl bg-white hover:bg-[#FBF0F2] border border-[#F1CCD3] text-[#7A1E34] font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>Batalkan Quest</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const res = increaseBounty(quest.id, 2000);
                            setBountyFeedback(res.message);
                            setTimeout(() => setBountyFeedback(null), 3000);
                          }}
                          className="flex-1 py-2 px-3 rounded-xl bg-[#2D8D84] hover:bg-[#247D75] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-[#2D8D84]/20"
                        >
                          <Coins className="w-3.5 h-3.5" />
                          <span>+ Naikkan Bounty Rp 2.000</span>
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* Info if Quest already CANCELLED */}
                {quest.status === 'CANCELLED' && (
                  <div className="p-3 bg-[#FBF0F2] border border-[#F1CCD3] rounded-xl text-xs text-[#7A1E34] flex items-center gap-2">
                    <Ban className="w-4 h-4 shrink-0" />
                    <span>Pesanan ini telah dibatalkan oleh pemesan dan tidak lagi aktif.</span>
                  </div>
                )}

                {/* Payment Action */}
                <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#E8DFD1] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-[#2C2224] font-semibold block">
                        Metode Bayar: <strong>{quest.payment_method}</strong>
                      </span>
                      <span className="text-[11px] text-[#6E6265]">
                        Status: <strong className={quest.payment_status === 'PAID' ? 'text-[#2D8D84]' : 'text-[#7A1E34]'}>
                          {quest.payment_status === 'PAID' ? 'LUNAS (PAID)' : 'MENUNGGU PEMBAYARAN'}
                        </strong>
                      </span>
                    </div>

                    <button
                      onClick={() => setShowQrisModal(true)}
                      className="px-3.5 py-2 rounded-xl bg-[#7A1E34] hover:bg-[#6E1C2F] text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-[#7A1E34]/20"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      Bayar via QRIS / Bank
                    </button>
                  </div>
                </div>

                {/* OTP Completion Input Box */}
                {quest.status !== 'COMPLETED' && (
                  <form onSubmit={handleVerifyOtp} className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#E8DFD1] space-y-2.5">
                    <label className="text-xs font-bold text-[#2C2224] block flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4 text-[#7A1E34]" />
                      Masukkan Kode OTP dari Runner untuk Menyelesaikan Transaksi:
                    </label>
                    <p className="text-[11px] text-[#6E6265]">
                      Minta kode 6 digit dari Runner saat barang sudah Anda terima / servis selesai dengan baik.
                    </p>

                    {otpError && (
                      <div className="p-2.5 bg-[#FBF0F2] border border-[#F1CCD3] rounded-xl text-xs text-[#7A1E34]">
                        {otpError}
                      </div>
                    )}
                    {otpSuccess && (
                      <div className="p-2.5 bg-[#E8F6F3] border border-[#A5DDD3] rounded-xl text-xs text-[#2D8D84] flex items-center gap-2">
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
                        className="flex-1 px-3 py-2 bg-white border border-[#E8DFD1] rounded-xl text-sm text-center font-mono font-bold tracking-widest text-[#2C2224] focus:outline-none focus:border-[#2D8D84]"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#2D8D84] hover:bg-[#247D75] text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-sm shadow-[#2D8D84]/20"
                      >
                        Verifikasi OTP
                      </button>
                    </div>
                  </form>
                )}

                {/* Rating & Review Section after Completed */}
                {quest.status === 'COMPLETED' && (
                  <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#E8DFD1] space-y-3">
                    <h5 className="text-xs font-bold text-[#2D8D84] uppercase tracking-wider flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-amber-500" />
                      Ulasan &amp; Rating Runner
                    </h5>

                    {reviewSubmitted ? (
                      <p className="text-xs text-[#2D8D84] font-medium">
                        ✓ Terima kasih atas ulasan Anda! Rating telah tersimpan ke profil runner.
                      </p>
                    ) : (
                      <form onSubmit={handleReviewSubmit} className="space-y-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-[#6E6265]">Beri Bintang:</span>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              className="p-1 text-slate-300 hover:text-amber-500"
                            >
                              <Star
                                className={`w-5 h-5 ${
                                  star <= rating
                                    ? 'text-amber-500 fill-amber-500'
                                    : 'text-slate-300'
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
                          className="w-full px-3 py-2 bg-white border border-[#E8DFD1] rounded-xl text-xs text-[#2C2224] focus:outline-none focus:border-[#2D8D84] resize-none"
                          required
                        />

                        <button
                          type="submit"
                          className="w-full py-2 bg-[#2D8D84] hover:bg-[#247D75] text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-sm shadow-[#2D8D84]/20"
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
          <div className="p-4 bg-white/90 border-t border-[#E8DFD1] flex items-center justify-between shrink-0 rounded-b-3xl">
            <button
              onClick={() => onOpenChat(quest.id)}
              className="px-4 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#F2EBE0] text-[#7A1E34] text-xs font-semibold flex items-center gap-2 border border-[#E8DFD1] transition-colors cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-[#7A1E34]" />
              <span>Buka Live Chat</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#E8DFD1] bg-white hover:bg-[#F2EBE0] text-[#6E6265] text-xs font-semibold transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>

      {/* QRIS & Bank Transfer Payment Modal */}
      {showQrisModal && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FAF7F2] border border-[#E8DFD1] max-w-sm w-full rounded-3xl p-5 text-[#2C2224] shadow-2xl relative my-6">
            <button
              onClick={() => setShowQrisModal(false)}
              className="absolute top-4 right-4 text-[#6E6265] hover:text-[#2C2224] p-1 rounded-xl hover:bg-[#F2EBE0]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-4">
              <h3 className="text-base font-bold text-[#2C2224] flex items-center justify-center gap-2">
                <QrCode className="w-5 h-5 text-[#7A1E34]" />
                Pembayaran QRIS Statis
              </h3>
              <p className="text-xs text-[#6E6265]">Scan melalui BCA, GoPay, OVO, ShopeePay, DANA</p>
            </div>

            {/* Simulated QRIS Code SVG Box */}
            <div className="bg-white p-4 rounded-2xl mx-auto w-48 h-48 flex flex-col items-center justify-center shadow-md border border-[#E8DFD1]">
              <div className="w-36 h-36 bg-[#2C2224] p-2 rounded-xl flex items-center justify-center relative">
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
                <div className="absolute w-8 h-8 rounded-lg bg-[#7A1E34] text-white font-extrabold text-[10px] flex items-center justify-center shadow">
                  CQ
                </div>
              </div>
              <span className="text-[10px] text-[#6E6265] font-bold mt-1">NMID: ID10293847582</span>
            </div>

            {/* Total to Pay */}
            <div className="my-4 text-center">
              <span className="text-xs text-[#6E6265] block">Total Nominal Transfer:</span>
              <span className="text-2xl font-black text-[#7A1E34] font-mono">
                Rp {totalBill.toLocaleString('id-ID')}
              </span>
              <div className="mt-2 p-2.5 bg-white rounded-xl border border-[#E8DFD1] text-[11px] text-[#6E6265]">
                <span>Bank Mandiri Rekening Kampus:</span>
                <strong className="block text-[#2C2224] font-mono">157-00-0982314-1 (CampusQuest UPI)</strong>
              </div>
            </div>

            {/* Upload Transfer Proof */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#2C2224] block">
                Unggah Foto Bukti Transfer:
              </label>

              <button
                type="button"
                onClick={() => paymentProofFileRef.current?.click()}
                className="w-full py-2.5 px-3 bg-white hover:bg-[#F2EBE0] rounded-xl border border-[#E8DFD1] text-xs font-semibold text-[#2C2224] flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Upload className="w-4 h-4 text-[#2D8D84]" />
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
                <div className="p-2 bg-[#E8F6F3] border border-[#A5DDD3] rounded-xl text-xs text-[#2D8D84] flex items-center justify-between font-semibold">
                  <span>✓ Bukti terlampir (Auto Compressed)</span>
                  <button
                    type="button"
                    onClick={() => setPaymentProofImg(null)}
                    className="text-[#6E6265] hover:text-[#2C2224]"
                  >
                    Batal
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={handleConfirmProof}
                className="w-full py-2.5 bg-[#2D8D84] hover:bg-[#247D75] text-white font-bold text-xs rounded-xl shadow-md shadow-[#2D8D84]/20 cursor-pointer"
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
