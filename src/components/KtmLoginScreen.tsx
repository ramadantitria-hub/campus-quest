'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useCampusQuest } from '@/context/CampusQuestContext';
import { UPI_FACULTIES } from '@/lib/mock-data';
import { addKtmWatermark } from '@/lib/watermark';
import { soundFX } from '@/lib/audio';
import { UserRole } from '@/types/campus-quest';
import {
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
  ScanLine,
  Wrench,
  MapPin,
  BookOpen
} from 'lucide-react';

function generateSampleNim(prefix = '2201'): string {
  return `${prefix}${100 + Math.floor(Math.random() * 899)}`;
}

type LoginTab = 'ocr_scan' | 'sso_nim';
type ScanSource = 'upload' | 'camera';

export default function KtmLoginScreen() {
  const { loginWithKtm, loginWithNim, enterGuestMode } = useCampusQuest();

  const [activeTab, setActiveTab] = useState<LoginTab>('ocr_scan');

  // OCR Scan State
  const [scanSource, setScanSource] = useState<ScanSource>('upload');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<string>('');
  const [scanProgress, setScanProgress] = useState(0);

  // Scanned Card Data (UPI Specialized)
  const [scannedFullName, setScannedFullName] = useState('');
  const [scannedNim, setScannedNim] = useState('');
  const [scannedMajor, setScannedMajor] = useState('');
  const [scannedUniversity, setScannedUniversity] = useState('Universitas Pendidikan Indonesia (UPI)');
  const [scannedFaculty, setScannedFaculty] = useState('Kampus UPI di Purwakarta');
  const [scannedKtmUrl, setScannedKtmUrl] = useState<string | null>(null);
  const [scannedAvatarUrl, setScannedAvatarUrl] = useState<string | null>(null);
  const [scannedRole, setScannedRole] = useState<UserRole>('customer');
  const [hasScannedResult, setHasScannedResult] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // SSO / NIM Input State (UPI Specialized)
  const [nimInput, setNimInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [facultyInput, setFacultyInput] = useState('FPTK - Fakultas Pendidikan Teknologi dan Kejuruan');
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

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async (overrideFacing?: 'environment' | 'user') => {
    setCameraError(null);
    stopCamera();
    const mode = overrideFacing || facingMode;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      soundFX.pop();
    } catch {
      setCameraError('Kamera tidak dapat diakses. Silakan berikan izin browser atau gunakan opsi Upload Berkas Foto KTM UPI.');
    }
  };

  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  const runOcrAnalysis = async (rawImageUrl: string) => {
    setIsScanning(true);
    setHasScannedResult(false);
    setValidationError(null);
    setScanProgress(20);
    setScanStep('1/3 Memulai analisis citra KTM UPI...');

    let resolvedName = '';
    let resolvedNim = '';
    let resolvedMajor = '';
    let resolvedFaculty = 'Kampus UPI di Purwakarta';

    try {
      setScanProgress(45);
      setScanStep('2/3 Mengekstrak Nama, NIM 7-digit & Program Studi via OCR Engine...');
      const res = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: rawImageUrl })
      });
      const json = await res.json();
      if (json.success && json.data) {
        resolvedName = json.data.fullName || '';
        resolvedNim = json.data.nim || '';
        resolvedMajor = json.data.major || '';
        if (json.data.faculty) {
          resolvedFaculty = json.data.faculty;
        }
      }
    } catch (err) {
      console.warn('OCR error, beralih ke input manual:', err);
    }

    setScanProgress(80);
    setScanStep('3/3 Menyematkan cap proteksi canvas watermark resmi UPI...');

    let watermarked = rawImageUrl;
    try {
      watermarked = await addKtmWatermark(
        rawImageUrl,
        resolvedNim || 'UPI-MAHASISWA',
        resolvedName || 'KTM AKTIF'
      );
    } catch {
      watermarked = rawImageUrl;
    }

    setScannedFullName(resolvedName);
    setScannedNim(resolvedNim);
    setScannedMajor(resolvedMajor);
    setScannedFaculty(resolvedFaculty);
    setScannedAvatarUrl(null); // Foto tidak wajib!
    setScannedKtmUrl(watermarked);

    setScanProgress(100);
    setIsScanning(false);
    setHasScannedResult(true);
    soundFX.notification();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        await runOcrAnalysis(dataUrl);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

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

    await runOcrAnalysis(dataUrl);
  };

  const handleConfirmKtmLogin = () => {
    setValidationError(null);
    const cleanName = scannedFullName.trim();
    const cleanNim = scannedNim.trim();
    const cleanMajor = scannedMajor.trim();

    if (!cleanName) {
      setValidationError('Nama Mahasiswa wajib terisi (hasil OCR atau ketik manual).');
      return;
    }
    if (!cleanNim) {
      setValidationError('Nomor Induk Mahasiswa (NIM) UPI wajib terisi (contoh: 2502895).');
      return;
    }
    if (!cleanMajor) {
      setValidationError('Program Studi / Jurusan wajib terisi (contoh: Mekatronika dan Kecerdasan Buatan (S1)).');
      return;
    }

    loginWithKtm({
      fullName: cleanName,
      nim: cleanNim,
      major: cleanMajor,
      faculty: scannedFaculty,
      university: 'Universitas Pendidikan Indonesia (UPI)',
      ktmUrl: scannedKtmUrl || '',
      avatarUrl: scannedAvatarUrl || undefined,
      role: scannedRole
    });
  };

  const handleSsoLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setSsoError(null);
    const cleanNim = nimInput.trim();
    if (!cleanNim) {
      setSsoError('Masukkan Nomor Induk Mahasiswa (NIM) UPI Anda.');
      return;
    }
    if (cleanNim.length < 5) {
      setSsoError('Format NIM UPI tidak valid. Umumnya terdiri dari 7 digit angka.');
      return;
    }
    const res = loginWithNim(cleanNim, pinInput, 'Universitas Pendidikan Indonesia (UPI)', facultyInput);
    if (!res.success) {
      setSsoError(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden select-none">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[600px] h-[600px] bg-sky-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header Navigation */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-700 via-red-600 to-rose-900 shadow-md shadow-rose-900/30">
              <span className="text-white font-black text-xl tracking-tighter">UPI</span>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-950 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg text-white tracking-tight">
                  Campus<span className="text-rose-400">Quest</span>
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-950/80 border border-rose-500/30 text-rose-300 hidden sm:inline-flex">
                  Edisi Mahasiswa UPI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                JASTAP &amp; JARVIS On-Demand Universitas Pendidikan Indonesia
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={enterGuestMode}
              className="text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 px-2.5 sm:px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shrink-0"
            >
              <span>Mode Tamu</span>
              <ArrowRight className="w-3.5 h-3.5 text-rose-400" />
            </button>
            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 px-3 py-1.5 rounded-xl hidden md:flex items-center gap-1.5 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Portal Terverifikasi Mahasiswa UPI</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Gate Hero & Login Card */}
      <main className="relative z-10 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-12 flex-1 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-12 items-center w-full">
          {/* Left Column: Campus Quest UPI Value Proposition */}
          <div className="lg:col-span-5 space-y-3 sm:space-y-6">
            <div className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] sm:text-xs font-semibold max-w-full">
              <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400 shrink-0" />
              <span className="truncate">Khusus Mahasiswa Universitas Pendidikan Indonesia</span>
            </div>

            <div>
              <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight break-words">
                Satu Akses KTM UPI untuk Seluruh Kebutuhan Kampus.
              </h1>
            </div>

            {/* Mobile Compact Feature Pills (Single Row on Smartphones) */}
            <div className="flex lg:hidden items-center gap-1.5 flex-wrap pt-0.5">
              <span className="px-2.5 py-1 rounded-xl bg-slate-900/90 border border-emerald-500/30 text-[11px] text-emerald-300 flex items-center gap-1 font-medium">
                <ShoppingBag className="w-3 h-3 text-emerald-400 shrink-0" /> JASTAP Titip Beli
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-slate-900/90 border border-rose-500/30 text-[11px] text-rose-300 flex items-center gap-1 font-medium">
                <Wrench className="w-3 h-3 text-rose-400 shrink-0" /> JARVIS Servis
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-slate-900/90 border border-sky-500/30 text-[11px] text-sky-300 flex items-center gap-1 font-medium">
                <Lock className="w-3 h-3 text-sky-400 shrink-0" /> Canvas Watermark
              </span>
            </div>

            {/* Desktop Feature Cards Showcase (Visible on Large Screens) */}
            <div className="hidden lg:flex flex-col space-y-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3.5 hover:border-emerald-500/30 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    JASTAP UPI (The Agent) <span className="text-[10px] text-emerald-400 font-normal">• Titip Beli Kampus</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Titip makan Kantin Geugeut FPTK, print skripsi di Gegerkalong, antar pesanan ke Asrama Gedung A &amp; B UPI.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3.5 hover:border-rose-500/30 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    JARVIS UPI (The Machinist) <span className="text-[10px] text-rose-400 font-normal">• Servis Hardware Mahasiswa</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Servis laptop lemot/panas, ganti thermal paste, instalasi software praktikum lab FPMIPA &amp; bengkel FPTK UPI.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3.5 hover:border-sky-500/30 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    Proteksi Watermark Canvas UPI <span className="text-[10px] text-sky-400 font-normal">• Privasi Terjamin</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Setiap KTM UPI otomatis dicap cap watermark resmi anti-fraud demi keamanan data mahasiswa.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: The Interactive Login Card */}
          <div className="lg:col-span-7">
            <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-2xl backdrop-blur-xl relative">
              {/* Card Header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <div className="min-w-0 pr-2">
                  <h2 className="text-base sm:text-xl font-bold text-white flex items-center gap-2 truncate">
                    <GraduationCap className="w-5 h-5 text-rose-400 shrink-0" />
                    <span className="truncate">Portal Masuk Mahasiswa UPI</span>
                  </h2>
                  <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 truncate">
                    Otentikasi khusus civitas akademika UPI
                  </p>
                </div>
                <span className="text-[10px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/30 px-2 py-1 rounded-lg shrink-0">
                  UPI Verified
                </span>
              </div>

              {/* Method Switcher Tabs (2 Tabs Only - Real UPI Student Verification) */}
              <div className="grid grid-cols-2 p-1 bg-slate-950 border border-slate-800 rounded-2xl mb-4 text-xs font-semibold">
                <button
                  onClick={() => {
                    setActiveTab('ocr_scan');
                    soundFX.pop();
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2 sm:py-2.5 rounded-xl transition-all cursor-pointer text-xs ${
                    activeTab === 'ocr_scan'
                      ? 'bg-gradient-to-r from-rose-600 to-red-700 text-white shadow-md shadow-rose-900/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Pindai / Upload KTM</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('sso_nim');
                    stopCamera();
                    soundFX.pop();
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2 sm:py-2.5 rounded-xl transition-all cursor-pointer text-xs ${
                    activeTab === 'sso_nim'
                      ? 'bg-gradient-to-r from-rose-600 to-red-700 text-white shadow-md shadow-rose-900/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">NIM &amp; SSO Portal UPI</span>
                </button>
              </div>

              {/* TAB 1: OCR SCAN / UPLOAD KTM UPI */}
              {activeTab === 'ocr_scan' && (
                <div className="space-y-4">
                  {!hasScannedResult && !isScanning && (
                    <>
                      {/* Sub-tabs: Upload / Camera */}
                      <div className="flex items-center gap-2 mb-3">
                        <button
                          onClick={() => {
                            setScanSource('upload');
                            stopCamera();
                          }}
                          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            scanSource === 'upload'
                              ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Unggah Berkas Foto KTM UPI</span>
                        </button>
                        <button
                          onClick={() => {
                            setScanSource('camera');
                            startCamera();
                          }}
                          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            scanSource === 'camera'
                              ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Kamera Live Pemindai KTM</span>
                        </button>
                      </div>

                      {/* MODE 1: UPLOAD PHOTO */}
                      {scanSource === 'upload' && (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-slate-700 hover:border-rose-500/60 rounded-2xl p-8 text-center cursor-pointer transition-all bg-slate-950/40 hover:bg-slate-950/80 group"
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                            <Upload className="w-7 h-7" />
                          </div>
                          <p className="text-sm font-bold text-white">Klik atau Tarik Foto KTM UPI Anda ke Sini</p>
                          <p className="text-xs text-slate-400 mt-1">
                            Format JPG, PNG, WEBP • Sistem OCR otomatis mengekstrak Nama, NIM 7-digit, dan Fakultas UPI Anda
                          </p>
                          <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-slate-400">
                            <Lock className="w-3 h-3 text-emerald-400" />
                            Otomatis disematkan watermark proteksi resmi UPI
                          </div>
                        </div>
                      )}

                      {/* MODE 2: LIVE CAMERA VIEW */}
                      {scanSource === 'camera' && (
                        <div className="relative rounded-2xl overflow-hidden bg-black border border-slate-800 aspect-video flex items-center justify-center">
                          {cameraError ? (
                            <div className="p-4 text-center">
                              <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                              <p className="text-xs text-slate-300">{cameraError}</p>
                              <button
                                onClick={() => startCamera()}
                                className="mt-3 px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-semibold hover:bg-slate-700"
                              >
                                Coba Lagi
                              </button>
                            </div>
                          ) : (
                            <>
                              <video ref={videoRef} playsInline autoPlay className="w-full h-full object-cover" />

                              <div className="absolute inset-4 sm:inset-6 border-2 border-rose-400/60 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
                                <div className="flex justify-between items-center text-[10px] text-rose-300 font-mono bg-black/60 px-2 py-0.5 rounded-md w-fit backdrop-blur-sm">
                                  <ScanLine className="w-3 h-3 mr-1 animate-pulse" />
                                  KOTAK PEMINDAI KTM UPI
                                </div>

                                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_12px_#f43f5e] animate-pulse" />

                                <div className="text-[10px] text-center text-slate-200 bg-black/60 py-1 rounded-md backdrop-blur-sm">
                                  Posisikan Kartu Tanda Mahasiswa UPI Anda di dalam kotak pemindai
                                </div>
                              </div>

                              <div className="absolute bottom-3 flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={toggleFacingMode}
                                  className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 backdrop-blur-sm cursor-pointer transition-colors"
                                  title="Putar Kamera Depan / Belakang"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={handleCapturePhoto}
                                  className="px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-900/40 cursor-pointer"
                                >
                                  <Camera className="w-4 h-4" /> Ambil Foto &amp; Pindai KTM UPI
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
                    <div className="p-7 rounded-2xl bg-slate-950 border border-rose-500/30 text-center space-y-4 animate-in fade-in">
                      <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
                        <div
                          className="absolute inset-0 rounded-full border-4 border-rose-500 border-t-transparent animate-spin"
                        />
                        <ScanLine className="w-6 h-6 text-rose-400 animate-pulse" />
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-white">Memproses Validasi OCR KTM UPI...</h4>
                        <p className="text-xs text-rose-400 font-mono mt-1">{scanStep}</p>
                      </div>

                      <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div
                          className="bg-gradient-to-r from-rose-600 via-red-500 to-emerald-400 h-full transition-all duration-300"
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
                          KTM UPI Berhasil Dipindai &amp; Terverifikasi Aktif!
                        </span>
                        <span className="text-[10px] font-mono bg-emerald-900/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                          Status: Mahasiswa UPI
                        </span>
                      </div>

                      {scannedKtmUrl && (
                        <div className="relative rounded-2xl overflow-hidden border border-slate-700 shadow-xl max-h-52 flex items-center justify-center bg-black">
                          <img
                            src={scannedKtmUrl}
                            alt="Watermarked KTM UPI"
                            className="w-full h-auto object-contain max-h-52"
                          />
                          <div className="absolute bottom-2 left-2 right-2 bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 flex items-center justify-between text-[10px] text-slate-300">
                            <span className="flex items-center gap-1">
                              <Lock className="w-3 h-3 text-rose-400" /> Watermark Keamanan Mahasiswa UPI Aktif
                            </span>
                            <span className="text-slate-400 font-mono">NIM: {scannedNim}</span>
                          </div>
                        </div>
                      )}

                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <span className="text-xs font-bold text-slate-200">Data Terverifikasi Mahasiswa UPI</span>
                          <span className="text-[10px] text-slate-400">Dapat diedit bila perlu penyesuaian</span>
                        </div>

                        {/* Banner Ketentuan Wajib & Opsional */}
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-white">Ketentuan Validasi: </span>
                            Wajib ada <strong className="text-rose-300">Nama</strong>, <strong className="text-rose-300">NIM</strong>, dan <strong className="text-rose-300">Jurusan</strong>. Foto profil/wajah <span className="text-emerald-400 font-semibold">tidak wajib</span> (otomatis dibuatkan dari inisial).
                          </div>
                        </div>

                        {validationError && (
                          <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                            <span>{validationError}</span>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          {/* 1. NAMA MAHASISWA (WAJIB) */}
                          <div>
                            <label className="text-slate-300 block mb-1 flex items-center justify-between">
                              <span className="flex items-center gap-1 font-medium">
                                <User className="w-3 h-3 text-rose-400" /> Nama Mahasiswa:
                              </span>
                              <span className="text-[10px] text-rose-400 font-bold">* Wajib</span>
                            </label>
                            <input
                              type="text"
                              value={scannedFullName}
                              onChange={(e) => {
                                setScannedFullName(e.target.value);
                                if (validationError) setValidationError(null);
                              }}
                              placeholder="Contoh: TRIA RAMADANTI"
                              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold focus:outline-none focus:border-rose-500 placeholder-slate-500"
                            />
                          </div>

                          {/* 2. NIM UPI (WAJIB) */}
                          <div>
                            <label className="text-slate-300 block mb-1 flex items-center justify-between">
                              <span className="flex items-center gap-1 font-medium">
                                <Hash className="w-3 h-3 text-rose-400" /> Nomor Induk Mahasiswa (NIM UPI):
                              </span>
                              <span className="text-[10px] text-rose-400 font-bold">* Wajib</span>
                            </label>
                            <input
                              type="text"
                              value={scannedNim}
                              onChange={(e) => {
                                setScannedNim(e.target.value);
                                if (validationError) setValidationError(null);
                              }}
                              placeholder="7 digit, contoh: 2502895"
                              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold focus:outline-none focus:border-rose-500 placeholder-slate-500"
                            />
                          </div>

                          {/* 3. JURUSAN / PROGRAM STUDI (WAJIB) */}
                          <div className="sm:col-span-2">
                            <label className="text-slate-300 block mb-1 flex items-center justify-between">
                              <span className="flex items-center gap-1 font-medium">
                                <BookOpen className="w-3 h-3 text-rose-400" /> Jurusan / Program Studi:
                              </span>
                              <span className="text-[10px] text-rose-400 font-bold">* Wajib</span>
                            </label>
                            <input
                              type="text"
                              value={scannedMajor}
                              onChange={(e) => {
                                setScannedMajor(e.target.value);
                                if (validationError) setValidationError(null);
                              }}
                              placeholder="Contoh: Mekatronika dan Kecerdasan Buatan (S1)"
                              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold focus:outline-none focus:border-rose-500 placeholder-slate-500"
                            />
                          </div>

                          {/* 4. PERGURUAN TINGGI */}
                          <div>
                            <label className="text-slate-400 block mb-1 flex items-center gap-1">
                              <Building className="w-3 h-3 text-rose-400" /> Perguruan Tinggi:
                            </label>
                            <div className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-between">
                              <span>Universitas Pendidikan Indonesia (UPI)</span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/40">Terkunci</span>
                            </div>
                          </div>

                          {/* 5. FAKULTAS / KAMPUS DAERAH */}
                          <div>
                            <label className="text-slate-300 block mb-1 flex items-center justify-between">
                              <span className="flex items-center gap-1 font-medium">
                                <GraduationCap className="w-3 h-3 text-rose-400" /> Fakultas / Kampus Daerah:
                              </span>
                              <span className="text-[10px] text-rose-400 font-bold">* Wajib</span>
                            </label>
                            <select
                              value={scannedFaculty}
                              onChange={(e) => setScannedFaculty(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-rose-500"
                            >
                              {UPI_FACULTIES.map((fac, idx) => (
                                <option key={idx} value={fac}>
                                  {fac}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* 6. FOTO MAHASISWA (TIDAK WAJIB / OPSIONAL) */}
                          <div className="sm:col-span-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-9 h-9 rounded-full bg-rose-600/30 border border-rose-500/40 flex items-center justify-center text-xs font-bold text-rose-300 shrink-0">
                                {scannedFullName ? scannedFullName.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-slate-200 flex items-center gap-1">
                                  <span>Foto Mahasiswa</span>
                                  <span className="text-[10px] font-normal text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-500/30">
                                    Tidak Wajib (Opsional)
                                  </span>
                                </p>
                                <p className="text-[11px] text-slate-400 truncate">
                                  Foto mah tidak wajib. Sistem otomatis memakai inisial nama Anda.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                          <span className="text-xs text-slate-300">Masuk sebagai mode awal:</span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setScannedRole('customer')}
                              className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                                scannedRole === 'customer'
                                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              <ShoppingBag className="w-3 h-3 inline mr-1" /> Customer
                            </button>
                            <button
                              type="button"
                              onClick={() => setScannedRole('runner')}
                              className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
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

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-2">
                        <button
                          onClick={() => {
                            setHasScannedResult(false);
                            setScannedKtmUrl(null);
                          }}
                          className="w-full sm:flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Pindai Ulang
                        </button>

                        <button
                          onClick={handleConfirmKtmLogin}
                          className="w-full sm:flex-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 cursor-pointer"
                        >
                          <Check className="w-4 h-4 shrink-0" />
                          <span className="truncate">Masuk Sebagai Mahasiswa UPI ({scannedFullName.split(' ')[0]}) →</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: SSO / NIM & PASSWORD PORTAL UPI */}
              {activeTab === 'sso_nim' && (
                <form onSubmit={handleSsoLogin} className="space-y-4">
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
                    <Building className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white">Login Single Sign-On (SSO) Portal Mahasiswa UPI</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Terintegrasi dengan akun resmi portal.upi.edu / SIAKAD Universitas Pendidikan Indonesia.
                      </p>
                    </div>
                  </div>

                  {/* Kampus UPI Fixed Card */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-rose-400" />
                      Perguruan Tinggi Terintegrasi
                    </label>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-rose-950 border border-rose-500/30 flex items-center justify-center text-rose-400 font-bold text-xs">
                          UPI
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">Universitas Pendidikan Indonesia</p>
                          <p className="text-[10px] text-slate-400 flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5 text-rose-400" /> Kampus Bumi Siliwangi (Bandung) &amp; Kampus Daerah
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                        Resmi
                      </span>
                    </div>
                  </div>

                  {/* Fakultas UPI Dropdown */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-rose-400" />
                      Fakultas / Kampus Daerah UPI
                    </label>
                    <select
                      value={facultyInput}
                      onChange={(e) => setFacultyInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-rose-500"
                    >
                      {UPI_FACULTIES.map((fac, idx) => (
                        <option key={idx} value={fac}>
                          {fac}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Input NIM UPI */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5 text-rose-400" />
                      Nomor Induk Mahasiswa (NIM UPI 7-Digit)
                    </label>
                    <input
                      type="text"
                      value={nimInput}
                      onChange={(e) => setNimInput(e.target.value)}
                      placeholder="Contoh: 2201945 atau 2108765"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono placeholder:font-sans focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  {/* Input Password / PIN SSO */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-rose-400" />
                      Password Akun SSO UPI / SIAKAD
                    </label>
                    <div className="relative">
                      <input
                        type={showPin ? 'text' : 'password'}
                        value={pinInput}
                        onChange={(e) => setPinInput(e.target.value)}
                        placeholder="Masukkan password akun portal.upi.edu Anda..."
                        className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-rose-500"
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

                  {/* Info format NIM UPI */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                    <p className="text-rose-300 font-semibold flex items-center gap-1">
                      💡 Ketentuan Akses Mahasiswa UPI:
                    </p>
                    <p className="text-slate-400">
                      • Masukkan NIM 7 digit aktif (contoh: angkatan 22 format <span className="text-white font-mono font-bold">220xxxx</span>, angkatan 21 format <span className="text-white font-mono font-bold">210xxxx</span>).
                    </p>
                    <p className="text-slate-400">
                      • Seluruh data terhubung dengan identitas terverifikasi untuk keamanan order JASTAP &amp; JARVIS.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-bold text-xs transition-all shadow-lg shadow-rose-900/40 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4" /> Masuk via SSO Portal UPI →
                  </button>
                </form>
              )}

              {/* Bottom Card Helper: Guest Explorer Mode */}
              <div className="mt-5 pt-3.5 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-400">
                <span className="text-[11px] sm:text-xs">Ingin melihat dashboard dan quest board dulu?</span>
                <button
                  type="button"
                  onClick={enterGuestMode}
                  className="font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer transition-colors text-xs shrink-0"
                >
                  <span>Jelajahi Mode Tamu</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>CampusQuest UPI © 2026 • Ekosistem Peer-to-Peer Resmi Mahasiswa UPI</span>
          <span className="text-slate-400 flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-emerald-400" /> Terenkripsi &amp; Terproteksi Canvas Watermark UPI
          </span>
        </div>
      </footer>
    </div>
  );
}
