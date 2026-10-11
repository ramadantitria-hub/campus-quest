'use client';

import React, { useState } from 'react';
import { useCampusQuest } from '@/context/CampusQuestContext';
import { CAMPUS_LANDMARKS } from '@/lib/mock-data';
import { ServiceCategory, PaymentMethod } from '@/types/campus-quest';
import {
  X,
  ArrowLeft,
  ShoppingBag,
  Wrench,
  Plus,
  Minus,
  MapPin,
  Coins,
  FileText,
  CreditCard,
  QrCode,
  DollarSign,
  Sparkles,
  HelpCircle,
  CheckCircle
} from 'lucide-react';

interface CreateQuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: ServiceCategory;
}

export default function CreateQuestModal({
  isOpen,
  onClose,
  defaultCategory = 'JASTAP'
}: CreateQuestModalProps) {
  const { createQuest } = useCampusQuest();

  const [category, setCategory] = useState<ServiceCategory>(defaultCategory);

  // Common & Jastap fields
  const [title, setTitle] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('porsi');
  const [originAddress, setOriginAddress] = useState(CAMPUS_LANDMARKS[0].name);
  const [destinationAddress, setDestinationAddress] = useState(CAMPUS_LANDMARKS[4].name);
  const [notes, setNotes] = useState('');
  const [bountyFee, setBountyFee] = useState(15000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('QRIS');

  // Jarvis specific fields
  const [deviceSpecs, setDeviceSpecs] = useState('');
  const [serviceIssue, setServiceIssue] = useState('');

  if (!isOpen) return null;

  // Preset suggestions for rapid filling
  const loadPreset = (presetType: string) => {
    if (presetType === 'makan') {
      setTitle('Nasi Ayam Geprek Sambal Bawang Kantin Geugeut + Es Jeruk');
      setQuantity(1);
      setUnit('porsi');
      setOriginAddress('Kantin Geugeut FPTK UPI');
      setDestinationAddress('Asrama Mahasiswa UPI Gedung B');
      setNotes('Sambal level 3 dipisah tolong ya. Nanti ketemu di lobi asrama.');
      setBountyFee(12000);
    } else if (presetType === 'print') {
      setTitle('Print Tugas Makalah 25 Lembar & Jilid Mika Gegerkalong');
      setQuantity(25);
      setUnit('lembar');
      setOriginAddress('Percetakan & Fotokopi Gegerkalong UPI');
      setDestinationAddress('Gedung Isola (Rektorat UPI)');
      setNotes('File PDF dikirim lewat chat ya. Butuh jam 13:00 untuk kumpul tugas.');
      setBountyFee(15000);
    } else if (presetType === 'windows') {
      setTitle('Install Ulang Windows 11 + Software Praktikum Teknik UPI');
      setQuantity(1);
      setUnit('perangkat');
      setDeviceSpecs('Laptop Lenovo ThinkPad E14 Gen 4');
      setServiceIssue('Windows lambat dan sering blue screen setelah update');
      setOriginAddress('Lab Komputer FPMIPA & FPTK UPI');
      setDestinationAddress('Perpustakaan Pusat UPI');
      setNotes('Mohon backup folder Dokumen di drive D');
      setBountyFee(65000);
    } else if (presetType === 'thermal') {
      setTitle('Bersihkan Debu Kipas Laptop & Ganti Thermal Paste Asus');
      setQuantity(1);
      setUnit('perangkat');
      setDeviceSpecs('Asus TUF Gaming FX505');
      setServiceIssue('Suhu GPU sampai 92 derajat saat rendering tugas akhir');
      setOriginAddress('Asrama Mahasiswa UPI Gedung A');
      setDestinationAddress('FPTK & Lab Komputer FPMIPA UPI');
      setNotes('Bawa pasta pendingin kualitas bagus ya bro');
      setBountyFee(55000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Mohon isi judul / nama pesanan');
      return;
    }

    const questDescription =
      category === 'JARVIS'
        ? `Perangkat: ${deviceSpecs || 'Laptop/Komputer Mahasiswa'}\nKeluhan: ${serviceIssue || title}\nCatatan: ${notes}`
        : `${notes || 'Tidak ada catatan tambahan'}`;

    createQuest({
      category,
      title: title.trim(),
      description: questDescription,
      quantity,
      unit,
      origin_address: originAddress,
      destination_address: destinationAddress,
      bounty_fee: bountyFee,
      payment_method: paymentMethod,
      notes,
      landmark_origin: originAddress,
      landmark_destination: destinationAddress
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
      <div className="bg-[#FAF7F2] border-t sm:border border-[#E8DFD1] max-w-lg w-full rounded-t-3xl sm:rounded-3xl text-[#2C2224] shadow-2xl relative max-h-[88vh] sm:max-h-[92vh] flex flex-col animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-200">
        {/* Mobile Drag Indicator Pill */}
        <div className="w-12 h-1 bg-[#D5C7B5] rounded-full mx-auto my-2.5 sm:hidden shrink-0" />

        {/* Modal Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-3.5 bg-white border-b border-[#E8DFD1] flex items-center justify-between shrink-0 rounded-t-3xl">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center shadow-xs shrink-0 ${
                category === 'JASTAP'
                  ? 'bg-[#E8F6F3] border border-[#A5DDD3] text-[#2D8D84]'
                  : 'bg-[#FBF0F2] border border-[#F1CCD3] text-[#7A1E34]'
              }`}
            >
              {category === 'JASTAP' ? (
                <ShoppingBag className="w-4.5 h-4.5" />
              ) : (
                <Wrench className="w-4.5 h-4.5" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-extrabold text-[#2C2224] truncate">
                {category === 'JASTAP' ? 'Buat Titipan JASTAP' : 'Panggil Teknisi JARVIS'}
              </h3>
              <p className="text-[10px] text-[#7E7074] truncate">
                Upah mandiri ala inDrive • Mahasiswa UPI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F2EBE0] text-[#4A3D41] hover:text-[#2C2224] text-xs font-bold border border-[#E8DFD1] transition-all cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#8E7F83]" />
              <span className="hidden sm:inline">Kembali</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-[#8E7F83] hover:text-[#2C2224] p-1.5 rounded-xl hover:bg-[#F2EBE0] transition-colors cursor-pointer"
              title="Tutup & Batal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Form Container with Scrollable Body and Sticky Action Bar */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-4 py-3 sm:px-6 sm:py-4 space-y-3.5">
            {/* Category Switcher Tabs */}
            <div className="flex p-1 bg-[#F2EBE0] rounded-2xl border border-[#E3D7C6] shadow-inner">
              <button
                type="button"
                onClick={() => setCategory('JASTAP')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  category === 'JASTAP'
                    ? 'bg-[#2D8D84] text-white shadow-md shadow-[#2D8D84]/25'
                    : 'text-[#6E6265] hover:text-[#2C2224]'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>JASTAP (The Agent)</span>
              </button>
              <button
                type="button"
                onClick={() => setCategory('JARVIS')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  category === 'JARVIS'
                    ? 'bg-[#7A1E34] text-white shadow-md shadow-[#7A1E34]/25'
                    : 'text-[#6E6265] hover:text-[#2C2224]'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>JARVIS (The Machinist)</span>
              </button>
            </div>

            {/* Quick Template Chips */}
            <div>
              <span className="text-[10px] sm:text-[11px] text-[#7E7074] block mb-1.5 flex items-center gap-1 font-bold">
                <Sparkles className="w-3 h-3 text-[#2D8D84]" /> Contoh Cepat 1-Klik:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                {category === 'JASTAP' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => loadPreset('makan')}
                      className="px-2.5 py-1 rounded-xl bg-white hover:bg-[#FAF7F2] text-[11px] text-[#4A3D41] border border-[#E8DFD1] shrink-0 whitespace-nowrap cursor-pointer transition-colors shadow-2xs font-medium"
                    >
                      🍗 Ayam Geprek &amp; Es Teh
                    </button>
                    <button
                      type="button"
                      onClick={() => loadPreset('print')}
                      className="px-2.5 py-1 rounded-xl bg-white hover:bg-[#FAF7F2] text-[11px] text-[#4A3D41] border border-[#E8DFD1] shrink-0 whitespace-nowrap cursor-pointer transition-colors shadow-2xs font-medium"
                    >
                      🖨️ Print Tugas &amp; Jilid
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => loadPreset('windows')}
                      className="px-2.5 py-1 rounded-xl bg-white hover:bg-[#FAF7F2] text-[11px] text-[#4A3D41] border border-[#E8DFD1] shrink-0 whitespace-nowrap cursor-pointer transition-colors shadow-2xs font-medium"
                    >
                      💻 Install Windows &amp; Office
                    </button>
                    <button
                      type="button"
                      onClick={() => loadPreset('thermal')}
                      className="px-2.5 py-1 rounded-xl bg-white hover:bg-[#FAF7F2] text-[11px] text-[#4A3D41] border border-[#E8DFD1] shrink-0 whitespace-nowrap cursor-pointer transition-colors shadow-2xs font-medium"
                    >
                      ❄️ Bersih Kipas + Ganti Pasta
                    </button>
                  </>
                )}
              </div>
            </div>

            {category === 'JASTAP' ? (
              /* JASTAP specific fields */
              <>
                <div>
                  <label className="block text-xs font-bold text-[#4A3D41] mb-1">
                    Nama Barang / Pesanan Titip
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-[#E8DFD1] text-xs text-[#2C2224] placeholder:text-[#8E7F83] focus:outline-none focus:border-[#2D8D84] shadow-2xs"
                    placeholder="Contoh: Titip Nasi Padang Rendang + Es Jeruk"
                    required
                  />
                </div>

                {/* Quantity Counter & Unit */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#4A3D41] mb-1">
                      Jumlah / Kuantiti
                    </label>
                    <div className="flex items-center bg-white border border-[#E8DFD1] rounded-2xl p-1 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F2EBE0] text-[#4A3D41] transition-colors cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="flex-1 text-center font-black text-sm text-[#2C2224] font-mono">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                        className="p-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F2EBE0] text-[#4A3D41] transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4A3D41] mb-1">
                      Satuan
                    </label>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full px-3 py-2 rounded-2xl bg-white border border-[#E8DFD1] text-xs text-[#2C2224] focus:outline-none focus:border-[#2D8D84] shadow-2xs"
                    >
                      <option value="porsi">Porsi</option>
                      <option value="pcs">Pcs / Buah</option>
                      <option value="lembar">Lembar (Print/Kopi)</option>
                      <option value="bungkus">Bungkus</option>
                      <option value="cup">Cup / Botol</option>
                      <option value="paket">Paket</option>
                    </select>
                  </div>
                </div>
              </>
            ) : (
              /* JARVIS specific fields */
              <>
                <div>
                  <label className="block text-xs font-bold text-[#4A3D41] mb-1">
                    Nama Masalah / Judul Servis
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-[#E8DFD1] text-xs text-[#2C2224] placeholder:text-[#8E7F83] focus:outline-none focus:border-[#7A1E34] shadow-2xs"
                    placeholder="Contoh: Install Ulang Windows &amp; Bersihkan Kipas"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A3D41] mb-1">
                    Jenis &amp; Tipe Perangkat
                  </label>
                  <input
                    type="text"
                    value={deviceSpecs}
                    onChange={(e) => setDeviceSpecs(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-[#E8DFD1] text-xs text-[#2C2224] placeholder:text-[#8E7F83] focus:outline-none focus:border-[#7A1E34] shadow-2xs"
                    placeholder="Contoh: Laptop Asus Vivobook / MacBook Air M1"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A3D41] mb-1">
                    Keluhan / Gejala Kerusakan
                  </label>
                  <input
                    type="text"
                    value={serviceIssue}
                    onChange={(e) => setServiceIssue(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-[#E8DFD1] text-xs text-[#2C2224] placeholder:text-[#8E7F83] focus:outline-none focus:border-[#7A1E34] shadow-2xs"
                    placeholder="Contoh: Suhu panas tinggi, kipas berisik, sering freeze"
                  />
                </div>
              </>
            )}

            {/* Locations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#4A3D41] mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#2D8D84]" />
                  {category === 'JASTAP' ? 'Titik Ambil / Toko' : 'Lokasi Ambil Perangkat'}
                </label>
                <select
                  value={originAddress}
                  onChange={(e) => setOriginAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-2xl bg-white border border-[#E8DFD1] text-xs text-[#2C2224] focus:outline-none focus:border-[#2D8D84] shadow-2xs"
                >
                  {CAMPUS_LANDMARKS.map((lm) => (
                    <option key={lm.id} value={lm.name}>
                      {lm.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A3D41] mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#7A1E34]" />
                  {category === 'JASTAP' ? 'Titik Antar (Tujuan Anda)' : 'Lokasi Antar / Servis'}
                </label>
                <select
                  value={destinationAddress}
                  onChange={(e) => setDestinationAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-2xl bg-white border border-[#E8DFD1] text-xs text-[#2C2224] focus:outline-none focus:border-[#7A1E34] shadow-2xs"
                >
                  {CAMPUS_LANDMARKS.map((lm) => (
                    <option key={lm.id} value={lm.name}>
                      {lm.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-[#4A3D41] mb-1">
                Catatan Tambahan untuk Runner
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-2xl bg-white border border-[#E8DFD1] text-xs text-[#2C2224] placeholder:text-[#8E7F83] focus:outline-none focus:border-[#7A1E34] resize-none shadow-2xs"
                placeholder="Contoh: Mohon sambal dipisah, ketemu di lobi depan."
              />
            </div>

            {/* Bounty Fee (inDrive Style Price Suggestion) */}
            <div className="bg-white p-4 rounded-3xl border border-[#E8DFD1] shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-extrabold text-[#2C2224] flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-[#7A1E34]" />
                  Penawaran Bounty Jasa Anda (inDrive Style)
                </label>
                <span className="text-[11px] text-[#7A1E34] font-black font-mono">
                  Rp {bountyFee.toLocaleString('id-ID')}
                </span>
              </div>

              <p className="text-[11px] text-[#6E6265] mb-2.5">
                Tentukan sendiri upah jasa yang pantas. Semakin kompetitif, semakin cepat runner menerima!
              </p>

              {/* Quick Bounty Chips */}
              <div className="flex flex-wrap gap-2 mb-2">
                {(category === 'JASTAP'
                  ? [8000, 12000, 15000, 20000, 25000]
                  : [35000, 50000, 65000, 80000, 100000]
                ).map((val) => (
                  <button
                    type="button"
                    key={val}
                    onClick={() => setBountyFee(val)}
                    className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                      bountyFee === val
                        ? 'bg-[#7A1E34] text-white shadow-xs'
                        : 'bg-[#FAF7F2] border border-[#E8DFD1] text-[#4A3D41] hover:border-[#7A1E34]'
                    }`}
                  >
                    Rp {val.toLocaleString('id-ID')}
                  </button>
                ))}
              </div>

              <div className="relative mt-2">
                <span className="absolute left-3.5 top-2.5 text-xs text-[#8E7F83] font-bold">Rp</span>
                <input
                  type="number"
                  value={bountyFee}
                  onChange={(e) => setBountyFee(parseInt(e.target.value, 10) || 0)}
                  className="w-full pl-10 pr-3 py-2 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD1] text-sm text-[#7A1E34] font-black focus:outline-none focus:border-[#7A1E34] font-mono"
                  step={1000}
                  min={3000}
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-bold text-[#4A3D41] mb-1.5">
                Metode Pembayaran
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('QRIS')}
                  className={`py-2 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                    paymentMethod === 'QRIS'
                      ? 'bg-[#E8F6F3] border-[#A5DDD3] text-[#1F6F67]'
                      : 'bg-white border-[#E8DFD1] text-[#6E6265]'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>QRIS / Transfer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`py-2 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                    paymentMethod === 'CASH'
                      ? 'bg-[#FBF0F2] border-[#F1CCD3] text-[#7A1E34]'
                      : 'bg-white border-[#E8DFD1] text-[#6E6265]'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Uang Tunai (Cash)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sticky Bottom Action Bar */}
          <div className="px-4 py-3 sm:px-6 sm:py-3.5 bg-white border-t border-[#E8DFD1] flex items-center gap-2.5 shrink-0 rounded-b-3xl">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl bg-[#FAF7F2] hover:bg-[#F2EBE0] text-[#4A3D41] font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-[#E8DFD1] shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kembali</span>
            </button>
            <button
              type="submit"
              className={`flex-1 py-2.5 px-4 rounded-2xl font-black text-xs text-white shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 ${
                category === 'JASTAP'
                  ? 'bg-[#2D8D84] hover:bg-[#247D75] shadow-[#2D8D84]/25'
                  : 'bg-[#7A1E34] hover:bg-[#6E1C2F] shadow-[#7A1E34]/25'
              }`}
            >
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span className="truncate">Publikasikan ({category}) • Rp {bountyFee.toLocaleString('id-ID')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
