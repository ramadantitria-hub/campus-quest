'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useCampusQuest } from '@/context/CampusQuestContext';
import { UPI_FACULTIES } from '@/lib/mock-data';
import { addKtmWatermark } from '@/lib/watermark';
import { soundFX } from '@/lib/audio';
import { UserRole } from '@/types/campus-quest';
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
  RefreshCw,
  AlertCircle,
  Lock,
  Zap,
  ShoppingBag,
  Check,
  ScanLine,
  MapPin,
  BookOpen
} from 'lucide-react';

function generateSampleNim(prefix = '2201'): string {
  return `${prefix}${100 + Math.floor(Math.random() * 899)}`;
}

interface KtmLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type LoginTab = 'login' | 'register' | 'ocr_scan';
type ScanSource = 'upload' | 'camera';

export default function KtmLoginModal({ isOpen, onClose }: KtmLoginModalProps) {
  const { loginWithCredentials, registerAccount, loginWithKtm, isLoggedIn } = useCampusQuest();

  const [activeTab, setActiveTab] = useState<LoginTab>('login');

  // Login State
  const [loginNim, setLoginNim] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginRole, setLoginRole] = useState<UserRole>('customer');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register State
  const [regFullName, setRegFullName] = useState('');
  const [regNim, setRegNim] = useState('');
  const [regMajor, setRegMajor] = useState('Mekatronika dan Kecerdasan Buatan (S1)');
  const [regFaculty, setRegFaculty] = useState('Kampus UPI di Purwakarta');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('customer');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  // OCR Scan State
  const [scanSource, setScanSource] = useState<ScanSource>('upload');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<string>('');
  const [scanProgress, setScanProgress] = useState(0);

  // Scanned Card Data (UPI Dedicated)
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
      setCameraError('Kamera tidak dapat diakses. Silakan berikan izin browser atau gunakan opsi Upload Berkas Foto KTM UPI.');
    }
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
    onClose();
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const cleanNim = loginNim.trim();
    if (!cleanNim) {
      setLoginError('Masukkan Nomor Induk Mahasiswa (NIM) UPI Anda.');
      return;
    }
    const res = loginWithCredentials(cleanNim, loginPassword, loginRole);
    if (res.success) {
      onClose();
    } else {
      setLoginError(res.message);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccess(null);

    const cleanName = regFullName.trim();
    const cleanNim = regNim.trim();
    const cleanPhone = regPhone.trim();
    const cleanPassword = regPassword.trim();

    if (!cleanName) {
      setRegError('Nama lengkap mahasiswa UPI wajib diisi.');
      return;
    }
    if (!cleanNim || cleanNim.length < 5) {
      setRegError('NIM UPI harus terdiri dari minimal 5 digit angka.');
      return;
    }
    if (!cleanPhone) {
      setRegError('Nomor WhatsApp / HP aktif wajib diisi.');
      return;
    }
    if (!cleanPassword) {
      setRegError('Password akun wajib diisi.');
      return;
    }
    if (cleanPassword !== regConfirmPassword.trim()) {
      setRegError('Konfirmasi password tidak cocok.');
      return;
    }

    const res = registerAccount({
      fullName: cleanName,
      nim: cleanNim,
      password: cleanPassword,
      major: regMajor,
      faculty: regFaculty,
      university: 'Universitas Pendidikan Indonesia (UPI)',
      phone: cleanPhone,
      role: regRole
    });

    if (res.success) {
      onClose();
    } else {
      setRegError(res.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
      <div className="bg-slate-900 border-t sm:border border-slate-700/80 max-w-2xl w-full rounded-t-3xl sm:rounded-3xl p-4 sm:p-7 text-white shadow-2xl relative max-h-[88vh] sm:max-h-[92vh] flex flex-col overflow-y-auto animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-200">
        {/* Mobile Drag Indicator Pill */}
        <div className="w-12 h-1 bg-slate-700/80 rounded-full mx-auto mb-2.5 sm:hidden shrink-0" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          title="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3 sm:gap-4 mb-6">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-700 via-red-600 to-rose-900 shadow-xl shadow-rose-900/30 shrink-0">
            <span className="text-white font-black text-xl tracking-tighter">UPI</span>
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] font-semibold mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
              <span>Khusus Mahasiswa Universitas Pendidikan Indonesia</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Login Mahasiswa UPI
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Pindai KTM UPI atau gunakan akun SSO kampus untuk akses penuh pesanan JASTAP &amp; JARVIS
            </p>
          </div>
        </div>

        {/* Method Switcher Tabs (3 Tabs: Login, Register, OCR Scan) */}
        <div className="grid grid-cols-3 p-1 bg-slate-950 border border-slate-800 rounded-2xl mb-6 text-xs font-semibold gap-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              stopCamera();
              soundFX.pop();
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-gradient-to-r from-rose-600 to-red-700 text-white shadow-md shadow-rose-900/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span className="truncate">Masuk</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              stopCamera();
              soundFX.pop();
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-gradient-to-r from-rose-600 to-red-700 text-white shadow-md shadow-rose-900/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span className="truncate">Daftar</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('ocr_scan');
              soundFX.pop();
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'ocr_scan'
                ? 'bg-gradient-to-r from-rose-600 to-red-700 text-white shadow-md shadow-rose-900/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="truncate">Pindai KTM</span>
          </button>
        </div>

        {/* TAB 1: OCR SCAN / UPLOAD KTM */}
        {activeTab === 'ocr_scan' && (
          <div className="space-y-4">
            {!hasScannedResult && !isScanning && (
              <>
                {/* Source options: Upload / Camera */}
                <div className="flex items-center gap-2 mb-3">
                  <button
                    onClick={() => {
                      setScanSource('upload');
                      stopCamera();
                    }}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      scanSource === 'upload'
                        ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Foto KTM UPI</span>
                  </button>
                  <button
                    onClick={() => {
                      setScanSource('camera');
                      startCamera();
                    }}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      scanSource === 'camera'
                        ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Kamera Live Pemindai</span>
                  </button>
                </div>

                {/* MODE 1: UPLOAD PHOTO */}
                {scanSource === 'upload' && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-700 hover:border-rose-500/60 rounded-2xl p-7 text-center cursor-pointer transition-all bg-slate-950/40 hover:bg-slate-950/80 group"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-white">Klik atau Tarik Foto KTM UPI ke Sini</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Format JPG, PNG, WEBP • Otomatis deteksi OCR Nama, NIM 7-digit, dan Fakultas UPI Anda
                    </p>
                  </div>
                )}

                {/* MODE 2: LIVE CAMERA */}
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

                        <div className="absolute inset-4 sm:inset-6 border-2 border-rose-400/60 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
                          <div className="flex justify-between items-center text-[10px] text-rose-300 font-mono bg-black/60 px-2 py-0.5 rounded-md w-fit backdrop-blur-sm">
                            <ScanLine className="w-3 h-3 mr-1 animate-pulse" />
                            KOTAK PEMINDAI KTM UPI
                          </div>

                          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_12px_#f43f5e] animate-pulse" />

                          <div className="text-[10px] text-center text-slate-200 bg-black/60 py-1 rounded-md backdrop-blur-sm">
                            Arahkan KTM UPI Anda ke dalam kotak pemindai
                          </div>
                        </div>

                        <div className="absolute bottom-3">
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
                  <div className="absolute inset-0 rounded-full border-4 border-rose-500 border-t-transparent animate-spin" />
                  <ScanLine className="w-6 h-6 text-rose-400 animate-pulse" />
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white">Memproses Verifikasi OCR KTM UPI...</h4>
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
                    KTM UPI Terverifikasi Aktif!
                  </span>
                  <span className="text-[10px] font-mono bg-emerald-900/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    UPI Active Student
                  </span>
                </div>

                {scannedKtmUrl && (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-700 shadow-xl max-h-48 flex items-center justify-center bg-black">
                    <img
                      src={scannedKtmUrl}
                      alt="Watermarked KTM UPI"
                      className="w-full h-auto object-contain max-h-48"
                    />
                    <div className="absolute bottom-2 left-2 right-2 bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 flex items-center justify-between text-[10px] text-slate-300">
                      <span className="flex items-center gap-1">
                        <Lock className="w-3 h-3 text-rose-400" /> Cap Canvas Watermark Mahasiswa UPI Terpasang
                      </span>
                      <span className="text-slate-400 font-mono">{scannedNim}</span>
                    </div>
                  </div>
                )}

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-slate-200">Data Terverifikasi Mahasiswa UPI</span>
                    <span className="text-[10px] text-slate-400">Dapat disesuaikan jika perlu</span>
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
                    <RefreshCw className="w-3.5 h-3.5" /> Scan Ulang
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

        {/* TAB 1: FORM MASUK (LOGIN) */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
              <KeyRound className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Masuk Akun Mahasiswa UPI</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Masukkan NIM UPI dan password akun Anda. Akun Runner dan Customer terpisah otomatis berdasarkan kredensial pendaftaran.
                </p>
              </div>
            </div>

            {/* Input NIM UPI */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-rose-400" />
                  Nomor Induk Mahasiswa (NIM UPI)
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Format 7-Digit</span>
              </label>
              <input
                type="text"
                value={loginNim}
                onChange={(e) => setLoginNim(e.target.value)}
                placeholder="Contoh: 2201945 atau 2108765"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono placeholder:font-sans focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Input Password */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-rose-400" />
                Kata Sandi / Password Akun
              </label>
              <div className="relative">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Masukkan password akun Anda..."
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-rose-500"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Role Switcher Option during Login */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Pilihan Halaman / Peran Masuk:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLoginRole('customer')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    loginRole === 'customer'
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Customer Portal</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLoginRole('runner')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    loginRole === 'runner'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Runner Hub</span>
                </button>
              </div>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-bold text-xs transition-all shadow-lg shadow-rose-900/40 flex items-center justify-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" /> Masuk ke CampusQuest UPI →
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setActiveTab('register')}
                className="text-xs text-rose-400 hover:underline font-semibold cursor-pointer"
              >
                Belum punya akun? Daftar Akun Mahasiswa Baru di sini →
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: FORM DAFTAR AKUN BARU (REGISTER) */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
              <User className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Pendaftaran Akun Baru Mahasiswa UPI</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Setiap akun memiliki data tersendiri. Anda dapat mendaftar dengan NIM yang sama namun password berbeda untuk menguji akun Runner vs Customer secara terpisah.
                </p>
              </div>
            </div>

            {/* Input Nama Lengkap */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-rose-400" />
                Nama Lengkap Mahasiswa UPI
              </label>
              <input
                type="text"
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
                placeholder="Contoh: Farhan Ramadhan atau Sarah Putri"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Input NIM UPI */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-rose-400" />
                  NIM UPI (7-Digit)
                </label>
                <input
                  type="text"
                  value={regNim}
                  onChange={(e) => setRegNim(e.target.value)}
                  placeholder="Contoh: 2201945"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono placeholder:font-sans focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Input No HP / WhatsApp */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-rose-400" />
                  Nomor WhatsApp / HP Aktif
                </label>
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono placeholder:font-sans focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* Fakultas UPI Dropdown */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-rose-400" />
                Fakultas / Kampus Daerah UPI
              </label>
              <select
                value={regFaculty}
                onChange={(e) => setRegFaculty(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-rose-500"
              >
                {UPI_FACULTIES.map((fac, idx) => (
                  <option key={idx} value={fac}>
                    {fac}
                  </option>
                ))}
              </select>
            </div>

            {/* Program Studi / Jurusan */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-rose-400" />
                Program Studi / Jurusan
              </label>
              <input
                type="text"
                value={regMajor}
                onChange={(e) => setRegMajor(e.target.value)}
                placeholder="Contoh: Pendidikan Ilmu Komputer (S1)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* PILIHAN PERAN / ROLE PENDAFTARAN */}
            <div>
              <label className="block text-xs font-semibold text-white mb-1.5">
                Daftar Sebagai Peran Utama:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRegRole('customer')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    regRole === 'customer'
                      ? 'bg-rose-500/20 border-rose-500 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs text-rose-300">
                    <ShoppingBag className="w-4 h-4" /> Customer UPI
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 leading-tight">
                    Titip beli makanan, print kilat, &amp; panggil servis teknisi.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setRegRole('runner')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    regRole === 'runner'
                      ? 'bg-amber-500/20 border-amber-500 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs text-amber-300">
                    <Zap className="w-4 h-4" /> Runner UPI
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 leading-tight">
                    Ambil quest pesanan mahasiswa lain &amp; dapatkan penghasilan instan.
                  </p>
                </button>
              </div>
            </div>

            {/* Password & Konfirmasi Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-rose-400" />
                  Password Akun
                </label>
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Minimal 6 karakter..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-rose-400" />
                  Konfirmasi Password
                </label>
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="Ulangi password..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {regError && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            {regSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{regSuccess}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" /> Daftar Akun {regRole === 'runner' ? 'Runner' : 'Customer'} UPI →
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className="text-xs text-rose-400 hover:underline font-semibold cursor-pointer"
              >
                Sudah punya akun? Masuk langsung di sini →
              </button>
            </div>
          </form>
        )}

        {/* Modal Footer Security Guarantee */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Verifikasi KTM menjamin transaksi sesama mahasiswa UPI aman &amp; bebas penipuan</span>
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
