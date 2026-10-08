'use client';

import React, { useState } from 'react';
import { useCampusQuest } from '@/context/CampusQuestContext';
import { CAMPUS_LANDMARKS } from '@/lib/mock-data';
import { ServiceCategory, PaymentMethod } from '@/types/campus-quest';
import {
  X,
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
      setTitle('Nasi Ayam Geprek Sambal Bawang + Es Jeruk');
      setQuantity(1);
      setUnit('porsi');
      setOriginAddress('Kantin Pusat / Vokasi');
      setDestinationAddress('Asrama Mahasiswa Gedung B');
      setNotes('Sambal level 3 dipisah tolong ya. Nanti ketemu di lobi.');
      setBountyFee(12000);
    } else if (presetType === 'print') {
      setTitle('Print Tugas Makalah 25 Lembar & Jilid Mika');
      setQuantity(25);
      setUnit('lembar');
      setOriginAddress('Fotokopi & Percetakan Barokah');
      setDestinationAddress('Gedung Rektorat');
      setNotes('File PDF dikirim lewat chat ya. Butuh jam 13:00.');
      setBountyFee(15000);
    } else if (presetType === 'windows') {
      setTitle('Install Ulang Windows 11 + Software Office & CAD');
      setQuantity(1);
      setUnit('perangkat');
      setDeviceSpecs('Laptop Lenovo ThinkPad E14 Gen 4');
      setServiceIssue('Windows lambat dan sering blue screen setelah update');
      setOriginAddress('Lab Komputer Fakultas Teknik');
      setDestinationAddress('Perpustakaan Pusat Gazebo Belakang');
      setNotes('Mohon backup folder Dokumen di drive D');
      setBountyFee(65000);
    } else if (presetType === 'thermal') {
      setTitle('Bersihkan Debu Kipas Laptop & Ganti Thermal Paste');
      setQuantity(1);
      setUnit('perangkat');
      setDeviceSpecs('Asus TUF Gaming FX505');
      setServiceIssue('Suhu GPU sampai 92 derajat saat rendering');
      setOriginAddress('Asrama Mahasiswa Gedung A');
      setDestinationAddress('Fakultas Teknik & Lab Komputer');
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 max-w-lg w-full rounded-2xl p-6 text-white shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
              category === 'JASTAP'
                ? 'bg-gradient-to-tr from-emerald-500 to-teal-600 shadow-emerald-500/20'
                : 'bg-gradient-to-tr from-violet-500 to-purple-600 shadow-violet-500/20'
            }`}
          >
            {category === 'JASTAP' ? (
              <ShoppingBag className="w-5 h-5 text-white" />
            ) : (
              <Wrench className="w-5 h-5 text-white" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Buat Quest Baru</h3>
            <p className="text-xs text-slate-400">Tentukan harga jasa (bounty) Anda sendiri ala inDrive</p>
          </div>
        </div>

        {/* Category Switcher Tabs */}
        <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800 mb-4">
          <button
            type="button"
            onClick={() => setCategory('JASTAP')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              category === 'JASTAP'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>JASTAP (The Agent)</span>
          </button>
          <button
            type="button"
            onClick={() => setCategory('JARVIS')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              category === 'JARVIS'
                ? 'bg-violet-500 text-white shadow-md shadow-violet-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>JARVIS (The Machinist)</span>
          </button>
        </div>

        {/* Quick Template Chips */}
        <div className="mb-4">
          <span className="text-[11px] text-slate-400 block mb-1.5 flex items-center gap-1 font-medium">
            <Sparkles className="w-3 h-3 text-amber-400" /> Contoh Cepat 1-Klik:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {category === 'JASTAP' ? (
              <>
                <button
                  type="button"
                  onClick={() => loadPreset('makan')}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 border border-slate-700/60"
                >
                  🍗 Ayam Geprek &amp; Es Teh
                </button>
                <button
                  type="button"
                  onClick={() => loadPreset('print')}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 border border-slate-700/60"
                >
                  🖨️ Print Tugas &amp; Jilid
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => loadPreset('windows')}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 border border-slate-700/60"
                >
                  💻 Install Windows &amp; Office
                </button>
                <button
                  type="button"
                  onClick={() => loadPreset('thermal')}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 border border-slate-700/60"
                >
                  ❄️ Bersih Kipas + Ganti Pasta
                </button>
              </>
            )}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {category === 'JASTAP' ? (
            /* JASTAP specific fields */
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Barang / Pesanan Titip
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Contoh: Titip Nasi Padang Rendang + Es Jeruk"
                  required
                />
              </div>

              {/* Quantity Counter & Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Jumlah / Kuantiti
                  </label>
                  <div className="flex items-center bg-slate-950 border border-slate-700 rounded-xl p-1">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="flex-1 text-center font-bold text-sm text-white font-mono">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Satuan
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
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
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Masalah / Judul Servis
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-violet-500"
                  placeholder="Contoh: Install Ulang Windows &amp; Bersihkan Kipas"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Jenis &amp; Tipe Perangkat
                </label>
                <input
                  type="text"
                  value={deviceSpecs}
                  onChange={(e) => setDeviceSpecs(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-violet-500"
                  placeholder="Contoh: Laptop Asus Vivobook / MacBook Air M1"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Keluhan / Gejala Kerusakan
                </label>
                <input
                  type="text"
                  value={serviceIssue}
                  onChange={(e) => setServiceIssue(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-violet-500"
                  placeholder="Contoh: Suhu panas tinggi, kipas berisik, sering freeze"
                />
              </div>
            </>
          )}

          {/* Locations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-400" />
                {category === 'JASTAP' ? 'Titik Ambil / Toko' : 'Lokasi Ambil Perangkat'}
              </label>
              <select
                value={originAddress}
                onChange={(e) => setOriginAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
              >
                {CAMPUS_LANDMARKS.map((lm) => (
                  <option key={lm.id} value={lm.name}>
                    {lm.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-sky-400" />
                {category === 'JASTAP' ? 'Titik Antar (Tujuan Anda)' : 'Lokasi Antar / Servis'}
              </label>
              <select
                value={destinationAddress}
                onChange={(e) => setDestinationAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
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
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Catatan Tambahan untuk Runner
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500 resize-none"
              placeholder="Contoh: Mohon sambal dipisah, ketemu di lobi depan."
            />
          </div>

          {/* Bounty Fee (inDrive Style Price Suggestion) */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-sky-500/30">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-400" />
                Penawaran Bounty Jasa Anda (inDrive Style)
              </label>
              <span className="text-[11px] text-amber-400 font-bold font-mono">
                Rp {bountyFee.toLocaleString('id-ID')}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mb-2.5">
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
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                    bountyFee === val
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  Rp {val.toLocaleString('id-ID')}
                </button>
              ))}
            </div>

            <div className="relative mt-2">
              <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-semibold">Rp</span>
              <input
                type="number"
                value={bountyFee}
                onChange={(e) => setBountyFee(parseInt(e.target.value, 10) || 0)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-400 font-mono"
                step={1000}
                min={3000}
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Metode Pembayaran
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('QRIS')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                  paymentMethod === 'QRIS'
                    ? 'bg-sky-500/20 border-sky-500 text-sky-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>QRIS / Bank Transfer</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('CASH')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                  paymentMethod === 'CASH'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Uang Tunai (Cash)</span>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className={`w-full py-3 rounded-xl font-bold text-sm text-slate-950 shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                category === 'JASTAP'
                  ? 'bg-emerald-400 hover:bg-emerald-300 shadow-emerald-400/20'
                  : 'bg-violet-400 hover:bg-violet-300 shadow-violet-400/20'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>Publikasikan Quest ke Board Mahasiswa</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
