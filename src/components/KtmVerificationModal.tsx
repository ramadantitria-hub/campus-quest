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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 max-w-lg w-full rounded-2xl p-6 text-white shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Verifikasi KTM &amp; Profil
              {profile.is_verified && (
                <span className="text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Terverifikasi
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">
              Validasi mahasiswa resmi untuk ekosistem aman CampusQuest
            </p>
          </div>
        </div>

        {/* Input Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-sky-400" />
              Nama Lengkap (Sesuai KTM)
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors"
              placeholder="Contoh: Bima Arya Prasetya"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-sky-400" />
                NIM (Nomor Induk Mahasiswa)
              </label>
              <input
                type="text"
                value={nim}
                onChange={(e) => setNim(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors"
                placeholder="2206123891"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                Nomor WhatsApp Aktif
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="081298765432"
              />
            </div>
          </div>

          {/* Runner Specialty Toggles */}
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
            <label className="block text-xs font-semibold text-slate-200 mb-2">
              Keahlian Runner (Untuk Mode Runner):
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => toggleSpecialty('JASTAP')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                  specialties.includes('JASTAP')
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                🎒 JASTAP (The Agent)
              </button>
              <button
                type="button"
                onClick={() => toggleSpecialty('JARVIS')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                  specialties.includes('JARVIS')
                    ? 'bg-violet-500/20 border-violet-500/50 text-violet-300 shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                ⚙️ JARVIS (The Machinist)
              </button>
            </div>
          </div>

          {/* KTM Upload & Watermark Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-sky-400" />
                Foto Kartu Tanda Mahasiswa (KTM)
              </label>
              <span className="text-[10px] text-sky-400 font-mono flex items-center gap-1">
                <Lock className="w-3 h-3" /> Auto-Watermark Aktif
              </span>
            </div>

            {/* Privacy notice info banner */}
            <div className="bg-sky-950/40 border border-sky-500/30 rounded-xl p-2.5 mb-3 flex items-start gap-2 text-[11px] text-sky-200">
              <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <span>
                <strong>Perlindungan Privasi (Page 8 Spec):</strong> Sistem otomatis membubuhkan watermark permanen{' '}
                <em>&quot;HANYA UNTUK VERIFIKASI AKUN CAMPUS QUEST&quot;</em> secara diagonal sebelum foto disimpan.
              </span>
            </div>

            {/* Upload or Preview Box */}
            <div className="relative border-2 border-dashed border-slate-700 hover:border-sky-500/60 rounded-xl p-4 text-center transition-colors bg-slate-950/60">
              {previewWatermarked ? (
                <div className="relative group">
                  <div className="w-full h-44 rounded-lg overflow-hidden border border-slate-700 relative bg-slate-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewWatermarked}
                      alt="Watermarked KTM"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-sky-500 text-slate-950 text-xs font-semibold rounded-lg shadow-md hover:bg-sky-400 flex items-center gap-1 cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" /> Ganti Foto KTM
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 text-left flex items-center justify-between text-[11px] text-emerald-400">
                    <span className="flex items-center gap-1 font-medium">
                      <CheckCircle className="w-3.5 h-3.5" /> Watermark &amp; Kompresi Diterapkan
                    </span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-sky-400 hover:underline"
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
                  <div className="w-12 h-12 rounded-full bg-slate-800 text-sky-400 flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-semibold text-slate-200">
                    Klik atau Seret Foto KTM ke Sini
                  </p>
                  <p className="text-[11px] text-slate-400">
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
            className="flex-1 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-sky-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              'Memproses Watermark...'
            ) : successNotice ? (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-300" /> Tersimpan!
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
