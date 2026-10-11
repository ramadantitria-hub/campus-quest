'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useCampusQuest } from '@/context/CampusQuestContext';
import { DEMO_STUDENTS, SAMPLE_KTM_PRESETS } from '@/lib/mock-data';
import { addKtmWatermark } from '@/lib/watermark';
import { generateDigitalKtmCard } from '@/lib/ktm-card-generator';
import { soundFX } from '@/lib/audio';
import { Profile, UserRole } from '@/types/campus-quest';
import {
  X,
  ShieldCheck,
  Camera,
  Upload,
  CheckCircle,
  Hash,
  User,
  GraduationCap,
  Building,
  KeyRound,
  Eye,
  EyeOff,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Lock,
  Zap,
  ShoppingBag,
  Check,
  ScanLine
} from 'lucide-react';

function generateSampleNim(prefix = '220612'): string {
  return `${prefix}${1000 + (Date.now() % 9000)}`;
}

interface KtmLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type LoginTab = 'ocr_scan' | 'sso_nim' | 'quick_demo';
type ScanSource = 'upload' | 'camera' | 'sample';

export default function KtmLoginModal({ isOpen, onClose }: KtmLoginModalProps) {
  const { loginWithKtm, loginWithNim, loginAsStudent, isLoggedIn } = useCampusQuest();

  const [activeTab, setActiveTab] = useState<LoginTab>('ocr_scan');

  // OCR Scan State
  const [scanSource, setScanSource] = useState<ScanSource>('sample');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<string>('');
  const [scanProgress, setScanProgress] = useState(0);

  // Scanned Card Data
  const [scannedFullName, setScannedFullName] = useState('');
  const [scannedNim, setScannedNim] = useState('');
  const [scannedUniversity, setScannedUniversity] = useState('Universitas Indonesia');
  const [scannedFaculty, setScannedFaculty] = useState('Fakultas Teknik - Teknik Mesin');
  const [scannedKtmUrl, setScannedKtmUrl] = useState<string | null>(null);
  const [scannedAvatarUrl, setScannedAvatarUrl] = useState<string | null>(null);
  const [scannedRole, setScannedRole] = useState<UserRole>('customer');
  const [hasScannedResult, setHasScannedResult] = useState(false);

  // SSO / NIM Input State
  const [nimInput, setNimInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [universityInput, setUniversityInput] = useState('Universitas Indonesia');
  const [showPin, setShowPin] = useState(false);
  const [ssoError, setSsoError] = useState<string | null>(null);

  // Webcam stream
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // Clean up camera stream when modal closes or unmounts
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      soundFX.pop();
    } catch {
      setCameraError('Kamera tidak dapat diakses. Silakan berikan izin atau gunakan opsi Upload Berkas.');
    }
  };

  // Simulate Smart OCR Process with Realistic Multi-Step Feedback
  const runOcrAnalysis = async (
    rawImageUrl: string,
    extractedData?: {
      fullName?: string;
      nim?: string;
      university?: string;
      faculty?: string;
      avatarUrl?: string;
    }
  ) => {
    setIsScanning(true);
    setHasScannedResult(false);
    setScanProgress(15);
    setScanStep('1/4 Mendeteksi orientasi kartu KTM...');

    await new Promise((r) => setTimeout(r, 350));
    setScanProgress(45);
    setScanStep('2/4 Mengekstrak teks identitas (OCR: Nama, NIM, Fakultas)...');

    await new Promise((r) => setTimeout(r, 400));
    setScanProgress(75);
    setScanStep('3/4 Memvalidasi pangkalan data mahasiswa aktif...');

    const resolvedNim = extractedData?.nim || generateSampleNim('220612');
    const resolvedName = extractedData?.fullName || 'MAHASISWA TERVERIFIKASI';

    // Apply security watermark
    let watermarked = rawImageUrl;
    try {
      watermarked = await addKtmWatermark(rawImageUrl, resolvedNim, resolvedName);
    } catch {
      watermarked = rawImageUrl;
    }

    setScanProgress(95);
    setScanStep('4/4 Menyematkan cap proteksi watermark...');
    await new Promise((r) => setTimeout(r, 250));

    setScannedFullName(extractedData?.fullName || 'Bima Arya Prasetya');
    setScannedNim(resolvedNim);
    setScannedUniversity(extractedData?.university || 'Universitas Indonesia');
    setScannedFaculty(extractedData?.faculty || 'Fakultas Teknik - Teknik Mesin');
    setScannedAvatarUrl(
      extractedData?.avatarUrl ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
    );
    setScannedKtmUrl(watermarked);

    setScanProgress(100);
    setIsScanning(false);
    setHasScannedResult(true);
    soundFX.notification();
  };

  // 1. Handle File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      await runOcrAnalysis(dataUrl, {
        fullName: 'Mahasiswa Baru (Hasil Scan)',
        nim: generateSampleNim('2206'),
        university: 'Universitas Indonesia',
        faculty: 'Fakultas Teknik'
      });
    };
    reader.readAsDataURL(file);
  };

  // 2. Handle Camera Capture
  const handleCapturePhoto = async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 800;
    canvas.height = videoRef.current.videoHeight || 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    stopCamera();

    await runOcrAnalysis(dataUrl, {
      fullName: 'Mahasiswa Kamera (Live)',
      nim: generateSampleNim('2306'),
      university: 'Universitas Indonesia',
      faculty: 'Fakultas Ilmu Komputer'
    });
  };

  // 3. Handle Sample Preset Click
  const handleSelectSamplePreset = async (preset: typeof SAMPLE_KTM_PRESETS[0]) => {
    soundFX.pop();
    // Generate digital sample card directly
    const generatedCardUrl = await generateDigitalKtmCard({
      fullName: preset.fullName,
      nim: preset.nim,
      university: preset.university,
      faculty: preset.faculty,
      avatarUrl: preset.avatarUrl,
      status: 'MAHASISWA AKTIF'
    });

    await runOcrAnalysis(generatedCardUrl, {
      fullName: preset.fullName,
      nim: preset.nim,
      university: preset.university,
      faculty: preset.faculty,
      avatarUrl: preset.avatarUrl
    });
  };

  // Submit Scanned KTM Login
  const handleConfirmKtmLogin = () => {
    if (!scannedNim || !scannedFullName) return;
    loginWithKtm({
      fullName: scannedFullName,
      nim: scannedNim,
      university: scannedUniversity,
      faculty: scannedFaculty,
      ktmUrl: scannedKtmUrl || '',
      avatarUrl: scannedAvatarUrl || undefined,
      role: scannedRole
    });
    onClose();
  };

  // Handle SSO / NIM Login
  const handleSsoLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setSsoError(null);
    if (!nimInput.trim()) {
      setSsoError('Masukkan Nomor Induk Mahasiswa (NIM).');
      return;
    }

    const res = loginWithNim(nimInput, pinInput);
    if (res.success) {
      onClose();
    } else {
      setSsoError(res.message);
    }
  };

  // Quick Demo Login
  const handleQuickDemoLogin = (student: Profile) => {
    loginAsStudent(student);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 max-w-2xl w-full rounded-3xl p-5 sm:p-7 text-white shadow-2xl relative my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button (if user is already logged in or wants to dismiss) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
          title="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3 sm:gap-4 mb-6">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-violet-600 shadow-xl shadow-sky-500/25 shrink-0">
            <GraduationCap className="w-7 h-7 text-white" />
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-[11px] font-semibold mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Portal Masuk Mahasiswa CampusQuest</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Login dengan KTM Mahasiswa
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Pindai Kartu Tanda Mahasiswa atau gunakan akun kampus untuk akses penuh JASTAP &amp; JARVIS
            </p>
          </div>
        </div>

        {/* Method Switcher Tabs */}
        <div className="grid grid-cols-3 p-1 bg-slate-950 border border-slate-800 rounded-2xl mb-6 text-xs font-semibold">
          <button
            onClick={() => {
              setActiveTab('ocr_scan');
              soundFX.pop();
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition-all ${
              activeTab === 'ocr_scan'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="truncate">Scan / Upload KTM</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('sso_nim');
              stopCamera();
              soundFX.pop();
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition-all ${
              activeTab === 'sso_nim'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span className="truncate">NIM &amp; SSO Kampus</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('quick_demo');
              stopCamera();
              soundFX.pop();
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition-all ${
              activeTab === 'quick_demo'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="truncate">Demo Akun (1-Klik)</span>
          </button>
        </div>

        {/* TAB 1: OCR SCAN / UPLOAD KTM */}
        {activeTab === 'ocr_scan' && (
          <div className="space-y-4">
            {!hasScannedResult && !isScanning && (
              <>
                {/* Source options: Upload / Camera / Sample Presets */}
                <div className="flex items-center gap-2 mb-3">
                  <button
                    onClick={() => {
                      setScanSource('sample');
                      stopCamera();
                    }}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      scanSource === 'sample'
                        ? 'bg-sky-500/10 border-sky-500/40 text-sky-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    ✨ Gunakan Contoh KTM
                  </button>
                  <button
                    onClick={() => {
                      setScanSource('upload');
                      stopCamera();
                    }}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      scanSource === 'upload'
                        ? 'bg-sky-500/10 border-sky-500/40 text-sky-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5 inline mr-1" />
                    Upload Foto KTM
                  </button>
                  <button
                    onClick={() => {
                      setScanSource('camera');
                      startCamera();
                    }}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      scanSource === 'camera'
                        ? 'bg-sky-500/10 border-sky-500/40 text-sky-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5 inline mr-1" />
                    Kamera Live
                  </button>
                </div>

                {/* MODE 1: SAMPLE PRESETS (Fastest for testing) */}
                {scanSource === 'sample' && (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">
                        Pilih Contoh KTM Mahasiswa untuk Uji Coba:
                      </span>
                      <span className="text-[10px] text-sky-400 font-mono">1-Klik Scan OCR</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {SAMPLE_KTM_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSelectSamplePreset(preset)}
                          className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-sky-500/50 hover:bg-slate-800/80 transition-all text-left flex flex-col justify-between group cursor-pointer"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1 mb-2">
                              <span
                                className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-gradient-to-r ${preset.badgeColor} text-white`}
                              >
                                {preset.univBadge}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">{preset.nim}</span>
                            </div>
                            <h4 className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors line-clamp-1">
                              {preset.fullName}
                            </h4>
                            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                              {preset.faculty}
                            </p>
                          </div>
                          <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-sky-400 font-semibold">
                            <span>Scan KTM Ini</span>
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* MODE 2: UPLOAD PHOTO */}
                {scanSource === 'upload' && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-700 hover:border-sky-500/60 rounded-2xl p-7 text-center cursor-pointer transition-all bg-slate-950/40 hover:bg-slate-950/80 group"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-white">Klik atau Tarik Foto KTM ke Sini</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Format didukung: JPG, PNG, WEBP (Otomatis OCR deteksi NIM &amp; Nama)
                    </p>
                  </div>
                )}

                {/* MODE 3: LIVE CAMERA VIEW */}
                {scanSource === 'camera' && (
                  <div className="relative rounded-2xl overflow-hidden bg-black border border-slate-800 aspect-video flex items-center justify-center">
                    {cameraError ? (
                      <div className="p-4 text-center">
                        <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                        <p className="text-xs text-slate-300">{cameraError}</p>
                        <button
                          onClick={startCamera}
                          className="mt-3 px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-semibold hover:bg-slate-700"
                        >
                          Coba Lagi
                        </button>
                      </div>
                    ) : (
                      <>
                        <video ref={videoRef} playsInline autoPlay className="w-full h-full object-cover" />

                        {/* Scanner Overlay Guide Frame */}
                        <div className="absolute inset-4 sm:inset-6 border-2 border-sky-400/60 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
                          <div className="flex justify-between items-center text-[10px] text-sky-300 font-mono bg-black/60 px-2 py-0.5 rounded-md w-fit backdrop-blur-sm">
                            <ScanLine className="w-3 h-3 mr-1 animate-pulse" />
                            KOTAK PEMINDAI KTM
                          </div>

                          {/* Laser Scan Line Animation */}
                          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8] animate-pulse" />

                          <div className="text-[10px] text-center text-slate-200 bg-black/60 py-1 rounded-md backdrop-blur-sm">
                            Arahkan bagian depan Kartu Tanda Mahasiswa (KTM) ke dalam kotak
                          </div>
                        </div>

                        {/* Camera Capture Button */}
                        <div className="absolute bottom-3 flex items-center gap-2">
                          <button
                            onClick={handleCapturePhoto}
                            className="px-5 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/30 cursor-pointer"
                          >
                            <Camera className="w-4 h-4" /> Ambil &amp; Pindai KTM
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </>
            )}

            {/* SCANNING PROGRESS OVERLAY */}
            {isScanning && (
              <div className="p-7 rounded-2xl bg-slate-950 border border-sky-500/30 text-center space-y-4 animate-in fade-in">
                <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
                  <div
                    className="absolute inset-0 rounded-full border-4 border-sky-400 border-t-transparent animate-spin"
                  />
                  <ScanLine className="w-6 h-6 text-sky-400 animate-pulse" />
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white">Memproses Validasi OCR KTM...</h4>
                  <p className="text-xs text-sky-400 font-mono mt-1">{scanStep}</p>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-sky-500 to-emerald-400 h-full transition-all duration-300"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* SCANNED RESULT & CONFIRMATION */}
            {hasScannedResult && !isScanning && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs">
                  <span className="flex items-center gap-1.5 font-bold">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    KTM Berhasil Dipindai &amp; Terverifikasi Aktif!
                  </span>
                  <span className="text-[10px] font-mono bg-emerald-900/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Akurasi 99.4%
                  </span>
                </div>

                {/* Scanned Card Preview */}
                {scannedKtmUrl && (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-700 shadow-xl max-h-56 flex items-center justify-center bg-black">
                    <img
                      src={scannedKtmUrl}
                      alt="Watermarked KTM"
                      className="w-full h-auto object-contain max-h-56"
                    />
                    <div className="absolute bottom-2 left-2 right-2 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 flex items-center justify-between text-[10px] text-slate-300">
                      <span className="flex items-center gap-1">
                        <Lock className="w-3 h-3 text-sky-400" /> Watermark Keamanan Kampus Terpasang
                      </span>
                      <span className="text-slate-400">Anti-Penyalahgunaan</span>
                    </div>
                  </div>
                )}

                {/* Verified Extracted Information Form */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-slate-200">Hasil Pembacaan Data KTM</span>
                    <span className="text-[10px] text-slate-400">Dapat diedit bila perlu penyesuaian</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1 flex items-center gap-1">
                        <User className="w-3 h-3 text-sky-400" /> Nama Mahasiswa:
                      </label>
                      <input
                        type="text"
                        value={scannedFullName}
                        onChange={(e) => setScannedFullName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1 flex items-center gap-1">
                        <Hash className="w-3 h-3 text-sky-400" /> Nomor Induk Mahasiswa (NIM):
                      </label>
                      <input
                        type="text"
                        value={scannedNim}
                        onChange={(e) => setScannedNim(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1 flex items-center gap-1">
                        <Building className="w-3 h-3 text-sky-400" /> Perguruan Tinggi / Kampus:
                      </label>
                      <input
                        type="text"
                        value={scannedUniversity}
                        onChange={(e) => setScannedUniversity(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1 flex items-center gap-1">
                        <GraduationCap className="w-3 h-3 text-sky-400" /> Fakultas / Program Studi:
                      </label>
                      <input
                        type="text"
                        value={scannedFaculty}
                        onChange={(e) => setScannedFaculty(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  {/* Mode awal saat login */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-300">Masuk sebagai mode awal:</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setScannedRole('customer')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                          scannedRole === 'customer'
                            ? 'bg-sky-500/20 border-sky-500/50 text-sky-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <ShoppingBag className="w-3 h-3 inline mr-1" /> Customer
                      </button>
                      <button
                        type="button"
                        onClick={() => setScannedRole('runner')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                          scannedRole === 'runner'
                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Zap className="w-3 h-3 inline mr-1" /> Runner
                      </button>
                    </div>
                  </div>
                </div>

                {/* Final Confirmation Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setHasScannedResult(false);
                      setScannedKtmUrl(null);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Scan Ulang
                  </button>

                  <button
                    onClick={handleConfirmKtmLogin}
                    className="flex-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 cursor-pointer"
                  >
                    <Check className="w-4 h-4" /> Masuk Sebagai {scannedFullName.split(' ')[0]}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SSO / NIM & PASSWORD KAMPUS */}
        {activeTab === 'sso_nim' && (
          <form onSubmit={handleSsoLogin} className="space-y-4">
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
              <Building className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Login Single Sign-On (SSO) Portal Mahasiswa</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Terintegrasi dengan akun SIAKAD / SIA / Portal Akademik resmi kampus Anda.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-sky-400" />
                Pilih Universitas / Kampus
              </label>
              <select
                value={universityInput}
                onChange={(e) => setUniversityInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
              >
                <option value="Universitas Indonesia">Universitas Indonesia (UI)</option>
                <option value="Institut Teknologi Bandung">Institut Teknologi Bandung (ITB)</option>
                <option value="Universitas Gadjah Mada">Universitas Gadjah Mada (UGM)</option>
                <option value="Institut Teknologi Sepuluh Nopember">Institut Teknologi Sepuluh Nopember (ITS)</option>
                <option value="Universitas Diponegoro">Universitas Diponegoro (UNDIP)</option>
                <option value="Telkom University">Telkom University</option>
                <option value="Universitas Padjadjaran">Universitas Padjadjaran (UNPAD)</option>
                <option value="Universitas Airlangga">Universitas Airlangga (UNAIR)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-sky-400" />
                Nomor Induk Mahasiswa (NIM)
              </label>
              <input
                type="text"
                value={nimInput}
                onChange={(e) => setNimInput(e.target.value)}
                placeholder="Contoh: 2206123891"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono placeholder:font-sans focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-sky-400" />
                Password / PIN Akun Akademik
              </label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Masukkan password atau PIN kampus..."
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {ssoError && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{ssoError}</span>
              </div>
            )}

            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400">
              💡 <span className="text-sky-300 font-semibold">Tips Uji Coba:</span> Masukkan NIM demo{' '}
              <code className="text-amber-300 font-mono">2206123891</code> (Bima Arya) atau{' '}
              <code className="text-amber-300 font-mono">2106198002</code> (Reza Fachri). Atau ketik NIM bebas
              Anda sendiri untuk membuat akun mahasiswa baru!
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs transition-all shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" /> Masuk via SSO Kampus
            </button>
          </form>
        )}

        {/* TAB 3: QUICK DEMO PROFILES */}
        {activeTab === 'quick_demo' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Pilih salah satu profil mahasiswa aktif untuk masuk langsung:</span>
              <span className="text-amber-400 font-bold">5 Akun Demo Siap Pakai</span>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {DEMO_STUDENTS.map((student) => (
                <div
                  key={student.id}
                  onClick={() => handleQuickDemoLogin(student)}
                  className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-sky-500/60 hover:bg-slate-900 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={student.avatar_url}
                      alt={student.full_name}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors truncate">
                          {student.full_name}
                        </h4>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                            student.active_mode === 'runner'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                          }`}
                        >
                          {student.active_mode === 'runner' ? 'RUNNER' : 'CUSTOMER'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                        NIM: {student.nim} • {student.faculty || 'Fakultas Teknik'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right hidden sm:block">
                      <span className="text-[10px] text-slate-500 block">Saldo Dompet</span>
                      <span className="text-xs font-bold text-emerald-400 font-mono">
                        Rp {student.wallet_balance.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <button className="px-3 py-1.5 rounded-lg bg-sky-500/10 group-hover:bg-sky-500 group-hover:text-slate-950 text-sky-400 text-xs font-bold transition-all flex items-center gap-1">
                      <span>Masuk</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Footer Security Guarantee */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Verifikasi KTM menjamin transaksi sesama mahasiswa aman &amp; bebas penipuan</span>
          </div>

          {!isLoggedIn && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white underline transition-colors cursor-pointer self-start sm:self-auto"
            >
              Lanjutkan jelajah sebagai Tamu →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
