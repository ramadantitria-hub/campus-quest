'use client';

import React, { useState, useRef } from 'react';
import { useCampusQuest } from '@/context/CampusQuestContext';
import { addKtmWatermark } from '@/lib/watermark';
import {
  X,
  ShieldCheck,
  Upload,
  Lock,
  Camera,
  CheckCircle,
  FileText,
  User,
  Phone,
  Hash,
  Sparkles,
  Info
} from 'lucide-react';

interface KtmVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KtmVerificationModal({ isOpen, onClose }: KtmVerificationModalProps) {
  const { profile, updateProfile, updateKtm } = useCampusQuest();

  const [fullName, setFullName] = useState(profile.full_name);
  const [nim, setNim] = useState(profile.nim);
  const [phone, setPhone] = useState(profile.phone);
  const [specialties, setSpecialties] = useState(profile.runner_specialty);

  const [previewOriginal, setPreviewOriginal] = useState<string | null>(null);
  const [previewWatermarked, setPreviewWatermarked] = useState<string | null>(profile.ktm_url || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successNotice, setSuccessNotice] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      // Create local preview of original
      const origUrl = URL.createObjectURL(file);
      setPreviewOriginal(origUrl);

      // Generate watermark automatically
      const watermarked = await addKtmWatermark(file, nim || 'MAHASISWA');
      setPreviewWatermarked(watermarked);
    } catch (err) {
      alert('Gagal memproses gambar KTM. Pastikan format file adalah JPG/PNG.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = () => {
    updateProfile({
      full_name: fullName,
      nim,
      phone,
      runner_specialty: specialties
    });

    if (previewWatermarked && previewWatermarked !== profile.ktm_url) {
      updateKtm(previewWatermarked);
    }

    setSuccessNotice(true);
    setTimeout(() => {
      setSuccessNotice(false);
      onClose();
    }, 1500);
  };

  const toggleSpecialty = (spec: 'JASTAP' | 'JARVIS') => {
    if (specialties.includes(spec)) {
      if (specialties.length > 1) {
        setSpecialties(specialties.filter((s) => s !== spec));
      }
    } else {
      setSpecialties([...specialties, spec]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2C2224]/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
      <div className="bg-[#FAF7F2] border-t sm:border border-[#E8DFD1] max-w-lg w-full rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 text-[#2C2224] shadow-2xl relative max-h-[88vh] sm:max-h-[92vh] flex flex-col overflow-y-auto animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-200">
        {/* Mobile Drag Indicator Pill */}
        <div className="w-12 h-1 bg-[#D8CEBF] rounded-full mx-auto mb-2.5 sm:hidden shrink-0" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8C7E83] hover:text-[#2C2224] p-1.5 rounded-xl hover:bg-[#F2EBE0] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#7A1E34] to-[#A32847] flex items-center justify-center shadow-md shadow-[#7A1E34]/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-[#2C2224] flex items-center gap-2">
              Verifikasi KTM &amp; Profil
              {profile.is_verified && (
                <span className="text-[11px] font-bold bg-[#E8F6F3] text-[#2D8D84] border border-[#A5DDD3] px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Terverifikasi
                </span>
              )}
            </h3>
            <p className="text-xs text-[#8C7E83]">
              Validasi mahasiswa resmi untuk ekosistem aman CampusQuest UPI
            </p>
          </div>
        </div>

        {/* Input Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#2C2224] mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#7A1E34]" />
              Nama Lengkap (Sesuai KTM UPI)
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-[#E8DFD1] text-sm text-[#2C2224] placeholder-[#B5A99F] focus:outline-none focus:border-[#7A1E34] focus:ring-2 focus:ring-[#7A1E34]/15 transition-all shadow-inner"
              placeholder="Contoh: Bima Arya Prasetya"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2C2224] mb-1.5 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-[#7A1E34]" />
                NIM UPI (7-Digit)
              </label>
              <input
                type="text"
                value={nim}
                onChange={(e) => setNim(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-[#E8DFD1] text-sm text-[#2C2224] placeholder-[#B5A99F] focus:outline-none focus:border-[#7A1E34] focus:ring-2 focus:ring-[#7A1E34]/15 transition-all shadow-inner"
                placeholder="2201945"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2C2224] mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#2D8D84]" />
                Nomor WhatsApp Aktif
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-[#E8DFD1] text-sm text-[#2C2224] placeholder-[#B5A99F] focus:outline-none focus:border-[#2D8D84] focus:ring-2 focus:ring-[#2D8D84]/15 transition-all shadow-inner"
                placeholder="081298765432"
              />
            </div>
          </div>

          {/* Runner Specialty Toggles */}
          <div className="bg-[#F2EBE0] p-3.5 rounded-2xl border border-[#E8DFD1]">
            <label className="block text-xs font-bold text-[#2C2224] mb-2">
              Keahlian Runner (Untuk Mode Runner):
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => toggleSpecialty('JASTAP')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  specialties.includes('JASTAP')
                    ? 'bg-[#2D8D84] border-[#2D8D84] text-white shadow-md shadow-[#2D8D84]/20'
                    : 'bg-white border-[#E8DFD1] text-[#6E6265] hover:border-[#2D8D84]/50'
                }`}
              >
                🎒 JASTAP (The Agent)
              </button>
              <button
                type="button"
                onClick={() => toggleSpecialty('JARVIS')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  specialties.includes('JARVIS')
                    ? 'bg-[#7A1E34] border-[#7A1E34] text-white shadow-md shadow-[#7A1E34]/20'
                    : 'bg-white border-[#E8DFD1] text-[#6E6265] hover:border-[#7A1E34]/50'
                }`}
              >
                ⚙️ JARVIS (The Machinist)
              </button>
            </div>
          </div>

          {/* KTM Upload & Watermark Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#2C2224] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#7A1E34]" />
                Foto Kartu Tanda Mahasiswa (KTM UPI)
              </label>
              <span className="text-[10px] text-[#2D8D84] font-semibold flex items-center gap-1">
                <Lock className="w-3 h-3" /> Auto-Watermark Aktif
              </span>
            </div>

            {/* Privacy notice info banner */}
            <div className="bg-[#E8F6F3] border border-[#A5DDD3] rounded-2xl p-2.5 mb-3 flex items-start gap-2 text-[11px] text-[#195C56]">
              <Info className="w-4 h-4 text-[#2D8D84] shrink-0 mt-0.5" />
              <span>
                <strong>Perlindungan Privasi UPI:</strong> Sistem otomatis membubuhkan watermark permanen{' '}
                <em>&quot;HANYA UNTUK VERIFIKASI AKUN CAMPUS QUEST UPI&quot;</em> secara diagonal sebelum foto disimpan.
              </span>
            </div>

            {/* Upload or Preview Box */}
            <div className="relative border-2 border-dashed border-[#D8CEBF] hover:border-[#2D8D84] rounded-2xl p-4 text-center transition-colors bg-white">
              {previewWatermarked ? (
                <div className="relative group">
                  <div className="w-full h-44 rounded-xl overflow-hidden border border-[#E8DFD1] relative bg-[#FAF7F2]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewWatermarked}
                      alt="Watermarked KTM"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-[#2C2224]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-1.5 bg-[#FAF7F2] text-[#2C2224] text-xs font-bold rounded-xl shadow-md hover:bg-white flex items-center gap-1.5 cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5 text-[#7A1E34]" /> Ganti Foto KTM
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 text-left flex items-center justify-between text-[11px] text-[#2D8D84]">
                    <span className="flex items-center gap-1 font-bold">
                      <CheckCircle className="w-3.5 h-3.5" /> Watermark &amp; Kompresi Diterapkan
                    </span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[#7A1E34] font-bold hover:underline"
                    >
                      Unggah Ulang
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer py-6 flex flex-col items-center justify-center gap-2"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#E8F6F3] text-[#2D8D84] flex items-center justify-center shadow-inner">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-[#2C2224]">
                    Klik atau Seret Foto KTM ke Sini
                  </p>
                  <p className="text-[11px] text-[#8C7E83]">
                    Mendukung format JPG, PNG (Max 5MB)
                  </p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-2xl border border-[#E8DFD1] hover:bg-[#F2EBE0] text-[#6E6265] text-xs font-bold transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-[#7A1E34] to-[#8E223D] hover:from-[#6E1C2F] hover:to-[#7A1E34] text-white text-xs font-extrabold transition-all shadow-md shadow-[#7A1E34]/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              'Memproses Watermark...'
            ) : successNotice ? (
              <>
                <CheckCircle className="w-4 h-4 text-[#A5DDD3]" /> Tersimpan!
              </>
            ) : (
              'Simpan &amp; Verifikasi Akun'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
