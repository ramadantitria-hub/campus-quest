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

type LoginTab = 'login' | 'register' | 'ocr_scan';
type ScanSource = 'upload' | 'camera';

export default function KtmLoginScreen() {
  const { loginWithCredentials, registerAccount, loginWithKtm, enterGuestMode, loginAsAdmin, openAdminAuthModal } = useCampusQuest();

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

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const cleanNim = loginNim.trim();
    if (!cleanNim) {
      setLoginError('Masukkan Nomor Induk Mahasiswa (NIM) UPI Anda.');
      return;
    }
    const res = loginWithCredentials(cleanNim, loginPassword, loginRole);
    if (!res.success) {
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
      setRegError('Nomor WhatsApp / HP aktif wajib diisi agar pesanan dapat dikonfirmasi.');
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

    if (!res.success) {
      setRegError(res.message);
    } else {
      setRegSuccess(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F3EC] text-[#2C2224] flex flex-col justify-between relative overflow-hidden select-none">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#7A1E34]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[600px] h-[600px] bg-[#2D8D84]/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-[#E8DFD1]/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header Navigation */}
      <header className="relative z-10 border-b border-[#E8DFD1] bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#6E1C2F] to-[#7A1E34] shadow-md shadow-[#7A1E34]/25">
              <span className="text-white font-black text-xl tracking-tighter">UPI</span>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#2D8D84] rounded-full border-2 border-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg text-[#2C2224] tracking-tight">
                  Campus<span className="text-[#7A1E34]">Quest</span>
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FBF0F2] border border-[#F1CCD3] text-[#7A1E34] hidden sm:inline-flex">
                  Edisi Mahasiswa UPI
                </span>
              </div>
              <p className="text-[11px] text-[#6E6265] hidden sm:block">
                JASTAP &amp; JARVIS On-Demand Universitas Pendidikan Indonesia
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={enterGuestMode}
              className="text-xs font-semibold text-[#6E6265] hover:text-[#2C2224] bg-white hover:bg-[#F2EBE0] border border-[#E8DFD1] px-2.5 sm:px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shrink-0"
            >
              <span>Mode Tamu</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#7A1E34]" />
            </button>
            <span className="text-[11px] font-semibold text-[#2D8D84] bg-[#E8F6F3] border border-[#A5DDD3] px-3 py-1.5 rounded-xl hidden md:flex items-center gap-1.5 shadow-sm">
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
            <div className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-[#FBF0F2] border border-[#F1CCD3] text-[#7A1E34] text-[11px] sm:text-xs font-semibold max-w-full">
              <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#7A1E34] shrink-0" />
              <span className="truncate">Khusus Mahasiswa Universitas Pendidikan Indonesia</span>
            </div>

            <div>
              <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-[#2C2224] tracking-tight leading-tight break-words">
                Satu Akses KTM UPI untuk Seluruh Kebutuhan Kampus.
              </h1>
            </div>

            {/* Mobile Compact Feature Pills */}
            <div className="flex lg:hidden items-center gap-1.5 flex-wrap pt-0.5">
              <span className="px-2.5 py-1 rounded-xl bg-white border border-[#A5DDD3] text-[11px] text-[#2D8D84] flex items-center gap-1 font-medium shadow-sm">
                <ShoppingBag className="w-3 h-3 text-[#2D8D84] shrink-0" /> JASTAP Titip Beli
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-white border border-[#F1CCD3] text-[11px] text-[#7A1E34] flex items-center gap-1 font-medium shadow-sm">
                <Wrench className="w-3 h-3 text-[#7A1E34] shrink-0" /> JARVIS Servis
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-white border border-[#A5DDD3] text-[11px] text-[#2D8D84] flex items-center gap-1 font-medium shadow-sm">
                <Lock className="w-3 h-3 text-[#2D8D84] shrink-0" /> Canvas Watermark
              </span>
            </div>

            {/* Desktop Feature Cards Showcase */}
            <div className="hidden lg:flex flex-col space-y-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-white border border-[#E8DFD1] flex items-start gap-3.5 hover:border-[#A5DDD3] transition-colors shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-[#E8F6F3] border border-[#A5DDD3] text-[#2D8D84] flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#2C2224] flex items-center gap-1.5">
                    JASTAP UPI (The Agent) <span className="text-[10px] text-[#2D8D84] font-normal">• Titip Beli Kampus</span>
                  </h4>
                  <p className="text-[11px] text-[#6E6265] mt-0.5">
                    Titip makan Kantin Geugeut FPTK, print skripsi di Gegerkalong, antar pesanan ke Asrama Gedung A &amp; B UPI.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-[#E8DFD1] flex items-start gap-3.5 hover:border-[#F1CCD3] transition-colors shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-[#FBF0F2] border border-[#F1CCD3] text-[#7A1E34] flex items-center justify-center shrink-0">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#2C2224] flex items-center gap-1.5">
                    JARVIS UPI (The Machinist) <span className="text-[10px] text-[#7A1E34] font-normal">• Servis Hardware Mahasiswa</span>
                  </h4>
                  <p className="text-[11px] text-[#6E6265] mt-0.5">
                    Servis laptop lemot/panas, ganti thermal paste, instalasi software praktikum lab FPMIPA &amp; bengkel FPTK UPI.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-[#E8DFD1] flex items-start gap-3.5 hover:border-[#A5DDD3] transition-colors shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-[#E8F6F3] border border-[#A5DDD3] text-[#2D8D84] flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#2C2224] flex items-center gap-1.5">
                    Proteksi Watermark Canvas UPI <span className="text-[10px] text-[#2D8D84] font-normal">• Privasi Terjamin</span>
                  </h4>
                  <p className="text-[11px] text-[#6E6265] mt-0.5">
                    Setiap KTM UPI otomatis dicap cap watermark resmi anti-fraud demi keamanan data mahasiswa.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: The Interactive Login Card */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-[#E8DFD1] rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-xl relative">
              {/* Card Header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E8DFD1]">
                <div className="min-w-0 pr-2">
                  <h2 className="text-base sm:text-xl font-bold text-[#2C2224] flex items-center gap-2 truncate">
                    <GraduationCap className="w-5 h-5 text-[#7A1E34] shrink-0" />
                    <span className="truncate">Portal Masuk Mahasiswa UPI</span>
                  </h2>
                  <p className="text-[11px] sm:text-xs text-[#6E6265] mt-0.5 truncate">
                    Otentikasi khusus civitas akademika UPI
                  </p>
                </div>
                <span className="text-[10px] font-mono bg-[#FBF0F2] text-[#7A1E34] border border-[#F1CCD3] px-2 py-1 rounded-lg shrink-0 font-semibold">
                  UPI Verified
                </span>
              </div>

              {/* Method Switcher Tabs (3 Tabs: Login, Register, OCR Scan) */}
              <div className="grid grid-cols-3 p-1 bg-[#F2EBE0] border border-[#E8DFD1] rounded-2xl mb-4 text-xs font-semibold gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    stopCamera();
                    soundFX.pop();
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2 sm:py-2.5 rounded-xl transition-all cursor-pointer text-xs ${
                    activeTab === 'login'
                      ? 'bg-[#7A1E34] text-white shadow-md shadow-[#7A1E34]/25'
                      : 'text-[#6E6265] hover:text-[#2C2224]'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Masuk</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    stopCamera();
                    soundFX.pop();
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2 sm:py-2.5 rounded-xl transition-all cursor-pointer text-xs ${
                    activeTab === 'register'
                      ? 'bg-[#7A1E34] text-white shadow-md shadow-[#7A1E34]/25'
                      : 'text-[#6E6265] hover:text-[#2C2224]'
                  }`}
                >
                  <User className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Daftar</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('ocr_scan');
                    soundFX.pop();
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2 sm:py-2.5 rounded-xl transition-all cursor-pointer text-xs ${
                    activeTab === 'ocr_scan'
                      ? 'bg-[#7A1E34] text-white shadow-md shadow-[#7A1E34]/25'
                      : 'text-[#6E6265] hover:text-[#2C2224]'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Pindai KTM</span>
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
                              ? 'bg-[#FBF0F2] border-[#F1CCD3] text-[#7A1E34]'
                              : 'bg-white border-[#E8DFD1] text-[#6E6265] hover:text-[#2C2224]'
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
                              ? 'bg-[#FBF0F2] border-[#F1CCD3] text-[#7A1E34]'
                              : 'bg-white border-[#E8DFD1] text-[#6E6265] hover:text-[#2C2224]'
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
                          className="border-2 border-dashed border-[#E8DFD1] hover:border-[#7A1E34]/50 rounded-2xl p-8 text-center cursor-pointer transition-all bg-[#FAF7F2] hover:bg-white group"
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                          <div className="w-14 h-14 rounded-2xl bg-[#FBF0F2] border border-[#F1CCD3] text-[#7A1E34] flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-sm">
                            <Upload className="w-7 h-7" />
                          </div>
                          <p className="text-sm font-bold text-[#2C2224]">Klik atau Tarik Foto KTM UPI Anda ke Sini</p>
                          <p className="text-xs text-[#6E6265] mt-1">
                            Format JPG, PNG, WEBP • Sistem OCR otomatis mengekstrak Nama, NIM 7-digit, dan Fakultas UPI Anda
                          </p>
                          <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-[#E8DFD1] text-[10px] text-[#6E6265]">
                            <Lock className="w-3 h-3 text-[#2D8D84]" />
                            Otomatis disematkan watermark proteksi resmi UPI
                          </div>
                        </div>
                      )}

                      {/* MODE 2: LIVE CAMERA VIEW */}
                      {scanSource === 'camera' && (
                        <div className="relative rounded-2xl overflow-hidden bg-black border border-[#E8DFD1] aspect-video flex items-center justify-center">
                          {cameraError ? (
                            <div className="p-4 text-center">
                              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                              <p className="text-xs text-white">{cameraError}</p>
                              <button
                                onClick={() => startCamera()}
                                className="mt-3 px-3 py-1.5 rounded-lg bg-white/20 text-xs font-semibold text-white hover:bg-white/30"
                              >
                                Coba Lagi
                              </button>
                            </div>
                          ) : (
                            <>
                              <video ref={videoRef} playsInline autoPlay className="w-full h-full object-cover" />

                              <div className="absolute inset-4 sm:inset-6 border-2 border-[#7A1E34]/80 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
                                <div className="flex justify-between items-center text-[10px] text-white font-mono bg-black/60 px-2 py-0.5 rounded-md w-fit backdrop-blur-sm">
                                  <ScanLine className="w-3 h-3 mr-1 animate-pulse" />
                                  KOTAK PEMINDAI KTM UPI
                                </div>

                                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#7A1E34] to-transparent shadow-[0_0_12px_#7A1E34] animate-pulse" />

                                <div className="text-[10px] text-center text-white bg-black/60 py-1 rounded-md backdrop-blur-sm">
                                  Posisikan Kartu Tanda Mahasiswa UPI Anda di dalam kotak pemindai
                                </div>
                              </div>

                              <div className="absolute bottom-3 flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={toggleFacingMode}
                                  className="p-2 rounded-full bg-white/80 hover:bg-white text-[#2C2224] border border-[#E8DFD1] backdrop-blur-sm cursor-pointer transition-colors shadow"
                                  title="Putar Kamera Depan / Belakang"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={handleCapturePhoto}
                                  className="px-5 py-2 rounded-full bg-[#7A1E34] hover:bg-[#6E1C2F] text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#7A1E34]/40 cursor-pointer"
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
                    <div className="p-7 rounded-2xl bg-[#FAF7F2] border border-[#F1CCD3] text-center space-y-4 animate-in fade-in">
                      <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-4 border-[#E8DFD1]" />
                        <div
                          className="absolute inset-0 rounded-full border-4 border-[#7A1E34] border-t-transparent animate-spin"
                        />
                        <ScanLine className="w-6 h-6 text-[#7A1E34] animate-pulse" />
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-[#2C2224]">Memproses Validasi OCR KTM UPI...</h4>
                        <p className="text-xs text-[#7A1E34] font-mono mt-1 font-semibold">{scanStep}</p>
                      </div>

                      <div className="w-full bg-[#E8DFD1] rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-[#7A1E34] to-[#2D8D84] h-full transition-all duration-300"
                          style={{ width: `${scanProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* SCANNED RESULT & CONFIRMATION */}
                  {hasScannedResult && !isScanning && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-[#E8F6F3] border border-[#A5DDD3] text-[#1F6F67] text-xs font-semibold">
                        <span className="flex items-center gap-1.5 font-bold">
                          <CheckCircle className="w-4 h-4 text-[#2D8D84]" />
                          KTM UPI Berhasil Dipindai &amp; Terverifikasi Aktif!
                        </span>
                        <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded-full border border-[#A5DDD3] text-[#2D8D84]">
                          Status: Mahasiswa UPI
                        </span>
                      </div>

                      {scannedKtmUrl && (
                        <div className="relative rounded-2xl overflow-hidden border border-[#E8DFD1] shadow-md max-h-52 flex items-center justify-center bg-black">
                          <img
                            src={scannedKtmUrl}
                            alt="Watermarked KTM UPI"
                            className="w-full h-auto object-contain max-h-52"
                          />
                          <div className="absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#E8DFD1] flex items-center justify-between text-[10px] text-[#2C2224]">
                            <span className="flex items-center gap-1 font-semibold text-[#7A1E34]">
                              <Lock className="w-3 h-3 text-[#7A1E34]" /> Watermark Keamanan Mahasiswa UPI Aktif
                            </span>
                            <span className="text-[#6E6265] font-mono font-bold">NIM: {scannedNim}</span>
                          </div>
                        </div>
                      )}

                      <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E8DFD1] space-y-3">
                        <div className="flex items-center justify-between border-b border-[#E8DFD1] pb-2">
                          <span className="text-xs font-bold text-[#2C2224]">Data Terverifikasi Mahasiswa UPI</span>
                          <span className="text-[10px] text-[#6E6265]">Dapat diedit bila perlu penyesuaian</span>
                        </div>

                        {/* Banner Ketentuan Wajib & Opsional */}
                        <div className="p-2.5 rounded-xl bg-white border border-[#E8DFD1] text-[11px] text-[#2C2224] flex items-start gap-2 shadow-sm">
                          <CheckCircle className="w-4 h-4 text-[#2D8D84] shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-[#2C2224]">Ketentuan Validasi: </span>
                            Wajib ada <strong className="text-[#7A1E34]">Nama</strong>, <strong className="text-[#7A1E34]">NIM</strong>, dan <strong className="text-[#7A1E34]">Jurusan</strong>. Foto profil/wajah <span className="text-[#2D8D84] font-semibold">tidak wajib</span> (otomatis dibuatkan dari inisial).
                          </div>
                        </div>

                        {validationError && (
                          <div className="p-2.5 rounded-xl bg-[#FBF0F2] border border-[#F1CCD3] text-[#7A1E34] text-xs flex items-center gap-2 font-medium">
                            <AlertCircle className="w-4 h-4 text-[#7A1E34] shrink-0" />
                            <span>{validationError}</span>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          {/* 1. NAMA MAHASISWA (WAJIB) */}
                          <div>
                            <label className="text-[#2C2224] block mb-1 flex items-center justify-between font-medium">
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3 text-[#7A1E34]" /> Nama Mahasiswa:
                              </span>
                              <span className="text-[10px] text-[#7A1E34] font-bold">* Wajib</span>
                            </label>
                            <input
                              type="text"
                              value={scannedFullName}
                              onChange={(e) => {
                                setScannedFullName(e.target.value);
                                if (validationError) setValidationError(null);
                              }}
                              placeholder="Contoh: TRIA RAMADANTI"
                              className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8DFD1] text-[#2C2224] font-semibold focus:outline-none focus:border-[#7A1E34]"
                            />
                          </div>

                          {/* 2. NIM UPI (WAJIB) */}
                          <div>
                            <label className="text-[#2C2224] block mb-1 flex items-center justify-between font-medium">
                              <span className="flex items-center gap-1">
                                <Hash className="w-3 h-3 text-[#7A1E34]" /> Nomor Induk Mahasiswa (NIM UPI):
                              </span>
                              <span className="text-[10px] text-[#7A1E34] font-bold">* Wajib</span>
                            </label>
                            <input
                              type="text"
                              value={scannedNim}
                              onChange={(e) => {
                                setScannedNim(e.target.value);
                                if (validationError) setValidationError(null);
                              }}
                              placeholder="7 digit, contoh: 2502895"
                              className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8DFD1] text-[#2C2224] font-mono font-bold focus:outline-none focus:border-[#7A1E34]"
                            />
                          </div>

                          {/* 3. JURUSAN / PROGRAM STUDI (WAJIB) */}
                          <div className="sm:col-span-2">
                            <label className="text-[#2C2224] block mb-1 flex items-center justify-between font-medium">
                              <span className="flex items-center gap-1">
                                <BookOpen className="w-3 h-3 text-[#7A1E34]" /> Jurusan / Program Studi:
                              </span>
                              <span className="text-[10px] text-[#7A1E34] font-bold">* Wajib</span>
                            </label>
                            <input
                              type="text"
                              value={scannedMajor}
                              onChange={(e) => {
                                setScannedMajor(e.target.value);
                                if (validationError) setValidationError(null);
                              }}
                              placeholder="Contoh: Mekatronika dan Kecerdasan Buatan (S1)"
                              className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8DFD1] text-[#2C2224] font-semibold focus:outline-none focus:border-[#7A1E34]"
                            />
                          </div>

                          {/* 4. PERGURUAN TINGGI */}
                          <div>
                            <label className="text-[#6E6265] block mb-1 flex items-center gap-1 font-medium">
                              <Building className="w-3 h-3 text-[#7A1E34]" /> Perguruan Tinggi:
                            </label>
                            <div className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8DFD1] text-[#2C2224] text-xs font-semibold flex items-center justify-between">
                              <span>Universitas Pendidikan Indonesia (UPI)</span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#FBF0F2] text-[#7A1E34] border border-[#F1CCD3] font-bold">Terkunci</span>
                            </div>
                          </div>

                          {/* 5. FAKULTAS / KAMPUS DAERAH */}
                          <div>
                            <label className="text-[#2C2224] block mb-1 flex items-center justify-between font-medium">
                              <span className="flex items-center gap-1">
                                <GraduationCap className="w-3 h-3 text-[#7A1E34]" /> Fakultas / Kampus Daerah:
                              </span>
                              <span className="text-[10px] text-[#7A1E34] font-bold">* Wajib</span>
                            </label>
                            <select
                              value={scannedFaculty}
                              onChange={(e) => setScannedFaculty(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8DFD1] text-[#2C2224] text-xs focus:outline-none focus:border-[#7A1E34]"
                            >
                              {UPI_FACULTIES.map((fac, idx) => (
                                <option key={idx} value={fac}>
                                  {fac}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* 6. FOTO MAHASISWA (TIDAK WAJIB / OPSIONAL) */}
                          <div className="sm:col-span-2 p-2.5 rounded-xl bg-white border border-[#E8DFD1] flex items-center justify-between gap-3 shadow-sm">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-9 h-9 rounded-full bg-[#FBF0F2] border border-[#F1CCD3] flex items-center justify-center text-xs font-bold text-[#7A1E34] shrink-0">
                                {scannedFullName ? scannedFullName.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-[#2C2224] flex items-center gap-1">
                                  <span>Foto Mahasiswa</span>
                                  <span className="text-[10px] font-normal text-[#2D8D84] bg-[#E8F6F3] px-1.5 py-0.2 rounded border border-[#A5DDD3] font-semibold">
                                    Tidak Wajib (Opsional)
                                  </span>
                                </p>
                                <p className="text-[11px] text-[#6E6265] truncate">
                                  Foto mah tidak wajib. Sistem otomatis memakai inisial nama Anda.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-[#E8DFD1] flex items-center justify-between">
                          <span className="text-xs text-[#2C2224] font-medium">Masuk sebagai mode awal:</span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setScannedRole('customer')}
                              className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                                scannedRole === 'customer'
                                  ? 'bg-[#FBF0F2] border-[#7A1E34] text-[#7A1E34] font-bold'
                                  : 'bg-white border-[#E8DFD1] text-[#6E6265] hover:text-[#2C2224]'
                              }`}
                            >
                              <ShoppingBag className="w-3 h-3 inline mr-1" /> Customer
                            </button>
                            <button
                              type="button"
                              onClick={() => setScannedRole('runner')}
                              className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                                scannedRole === 'runner'
                                  ? 'bg-[#E8F6F3] border-[#2D8D84] text-[#2D8D84] font-bold'
                                  : 'bg-white border-[#E8DFD1] text-[#6E6265] hover:text-[#2C2224]'
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
                          className="w-full sm:flex-1 py-2.5 rounded-xl bg-white hover:bg-[#F2EBE0] text-[#6E6265] hover:text-[#2C2224] border border-[#E8DFD1] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Pindai Ulang
                        </button>

                        <button
                          onClick={handleConfirmKtmLogin}
                          className="w-full sm:flex-2 py-2.5 rounded-xl bg-[#2D8D84] hover:bg-[#247D75] text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-[#2D8D84]/25 cursor-pointer"
                        >
                          <Check className="w-4 h-4 shrink-0" />
                          <span className="truncate">Masuk Sebagai Mahasiswa UPI ({scannedFullName.split(' ')[0]}) →</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: FORM MASUK (LOGIN) */}
              {activeTab === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD1] text-xs text-[#2C2224] flex items-start gap-2.5 shadow-sm">
                    <KeyRound className="w-4 h-4 text-[#7A1E34] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[#2C2224]">Masuk Akun Mahasiswa UPI</p>
                      <p className="text-[11px] text-[#6E6265] mt-0.5">
                        Masukkan NIM UPI dan password akun Anda. Akun Runner dan Customer terpisah otomatis berdasarkan kredensial pendaftaran.
                      </p>
                    </div>
                  </div>

                  {/* Input NIM UPI */}
                  <div>
                    <label className="block text-xs font-medium text-[#2C2224] mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5 text-[#7A1E34]" />
                        Nomor Induk Mahasiswa (NIM UPI)
                      </span>
                      <span className="text-[10px] text-[#6E6265] font-mono">Format 7-Digit</span>
                    </label>
                    <input
                      type="text"
                      value={loginNim}
                      onChange={(e) => setLoginNim(e.target.value)}
                      placeholder="Contoh: 2201945 atau 2108765"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E8DFD1] text-xs text-[#2C2224] font-mono placeholder:font-sans focus:outline-none focus:border-[#7A1E34]"
                    />
                  </div>

                  {/* Input Password */}
                  <div>
                    <label className="block text-xs font-medium text-[#2C2224] mb-1 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-[#7A1E34]" />
                      Kata Sandi / Password Akun
                    </label>
                    <div className="relative">
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Masukkan password akun Anda..."
                        className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-white border border-[#E8DFD1] text-xs text-[#2C2224] focus:outline-none focus:border-[#7A1E34]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-2.5 text-[#6E6265] hover:text-[#2C2224]"
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Role Switcher Option during Login */}
                  <div>
                    <label className="block text-xs font-medium text-[#2C2224] mb-1.5">
                      Pilihan Halaman / Peran Masuk:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setLoginRole('customer')}
                        className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          loginRole === 'customer'
                            ? 'bg-[#FBF0F2] border-[#7A1E34] text-[#7A1E34] shadow-sm font-bold'
                            : 'bg-white border-[#E8DFD1] text-[#6E6265] hover:text-[#2C2224]'
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
                            ? 'bg-[#E8F6F3] border-[#2D8D84] text-[#2D8D84] shadow-sm font-bold'
                            : 'bg-white border-[#E8DFD1] text-[#6E6265] hover:text-[#2C2224]'
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Runner Hub</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-[#6E6265] mt-1">
                      {loginRole === 'runner'
                        ? '🚀 Anda akan langsung diarahkan ke Runner Hub untuk mencari & mengambil quest.'
                        : '🛒 Anda akan langsung diarahkan ke Customer Portal untuk titip beli & panggil Jarvis.'}
                    </p>
                  </div>

                  {loginError && (
                    <div className="p-3 rounded-xl bg-[#FBF0F2] border border-[#F1CCD3] text-[#7A1E34] text-xs flex items-center gap-2 font-medium">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#7A1E34] hover:bg-[#6E1C2F] text-white font-bold text-xs transition-all shadow-md shadow-[#7A1E34]/25 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4" /> Masuk ke CampusQuest UPI →
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setActiveTab('register')}
                      className="text-xs text-[#7A1E34] hover:underline font-semibold cursor-pointer"
                    >
                      Belum punya akun? Daftar Akun Mahasiswa Baru di sini →
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 3: FORM DAFTAR AKUN BARU (REGISTER) */}
              {activeTab === 'register' && (
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD1] text-xs text-[#2C2224] flex items-start gap-2.5 shadow-sm">
                    <User className="w-4 h-4 text-[#2D8D84] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[#2C2224]">Pendaftaran Akun Baru Mahasiswa UPI</p>
                      <p className="text-[11px] text-[#6E6265] mt-0.5">
                        Setiap akun memiliki data tersendiri. Anda dapat mendaftar dengan NIM yang sama namun password berbeda untuk menguji akun Runner vs Customer secara terpisah.
                      </p>
                    </div>
                  </div>

                  {/* Input Nama Lengkap */}
                  <div>
                    <label className="block text-xs font-medium text-[#2C2224] mb-1 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#7A1E34]" />
                      Nama Lengkap Mahasiswa UPI
                    </label>
                    <input
                      type="text"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      placeholder="Contoh: Farhan Ramadhan atau Sarah Putri"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E8DFD1] text-xs text-[#2C2224] placeholder:text-[#8C7E81] focus:outline-none focus:border-[#7A1E34]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Input NIM UPI */}
                    <div>
                      <label className="block text-xs font-medium text-[#2C2224] mb-1 flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5 text-[#7A1E34]" />
                        NIM UPI (7-Digit)
                      </label>
                      <input
                        type="text"
                        value={regNim}
                        onChange={(e) => setRegNim(e.target.value)}
                        placeholder="Contoh: 2201945"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E8DFD1] text-xs text-[#2C2224] font-mono placeholder:font-sans focus:outline-none focus:border-[#7A1E34]"
                      />
                    </div>

                    {/* Input No HP / WhatsApp */}
                    <div>
                      <label className="block text-xs font-medium text-[#2C2224] mb-1 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#7A1E34]" />
                        Nomor WhatsApp / HP Aktif
                      </label>
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="Contoh: 081234567890"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E8DFD1] text-xs text-[#2C2224] font-mono placeholder:font-sans focus:outline-none focus:border-[#7A1E34]"
                      />
                    </div>
                  </div>

                  {/* Fakultas UPI Dropdown */}
                  <div>
                    <label className="block text-xs font-medium text-[#2C2224] mb-1 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-[#7A1E34]" />
                      Fakultas / Kampus Daerah UPI
                    </label>
                    <select
                      value={regFaculty}
                      onChange={(e) => setRegFaculty(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E8DFD1] text-xs text-[#2C2224] focus:outline-none focus:border-[#7A1E34]"
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
                    <label className="block text-xs font-medium text-[#2C2224] mb-1 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-[#7A1E34]" />
                      Program Studi / Jurusan
                    </label>
                    <input
                      type="text"
                      value={regMajor}
                      onChange={(e) => setRegMajor(e.target.value)}
                      placeholder="Contoh: Pendidikan Ilmu Komputer (S1)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E8DFD1] text-xs text-[#2C2224] focus:outline-none focus:border-[#7A1E34]"
                    />
                  </div>

                  {/* PILIHAN PERAN / ROLE PENDAFTARAN */}
                  <div>
                    <label className="block text-xs font-semibold text-[#2C2224] mb-1.5">
                      Daftar Sebagai Peran Utama:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRegRole('customer')}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          regRole === 'customer'
                            ? 'bg-[#FBF0F2] border-[#7A1E34] text-[#2C2224] shadow-sm'
                            : 'bg-white border-[#E8DFD1] text-[#6E6265] hover:text-[#2C2224]'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs text-[#7A1E34]">
                          <ShoppingBag className="w-4 h-4" /> Customer UPI
                        </div>
                        <p className="text-[10px] text-[#6E6265] mt-1 leading-tight">
                          Titip beli makanan, print kilat, &amp; panggil servis teknisi.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRegRole('runner')}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          regRole === 'runner'
                            ? 'bg-[#E8F6F3] border-[#2D8D84] text-[#2C2224] shadow-sm'
                            : 'bg-white border-[#E8DFD1] text-[#6E6265] hover:text-[#2C2224]'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs text-[#2D8D84]">
                          <Zap className="w-4 h-4" /> Runner UPI
                        </div>
                        <p className="text-[10px] text-[#6E6265] mt-1 leading-tight">
                          Ambil quest pesanan mahasiswa lain &amp; dapatkan penghasilan instan.
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Password & Konfirmasi Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#2C2224] mb-1 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-[#7A1E34]" />
                        Password Akun
                      </label>
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Minimal 6 karakter..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E8DFD1] text-xs text-[#2C2224] focus:outline-none focus:border-[#7A1E34]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#2C2224] mb-1 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-[#7A1E34]" />
                        Konfirmasi Password
                      </label>
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Ulangi password..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E8DFD1] text-xs text-[#2C2224] focus:outline-none focus:border-[#7A1E34]"
                      />
                    </div>
                  </div>

                  {regError && (
                    <div className="p-3 rounded-xl bg-[#FBF0F2] border border-[#F1CCD3] text-[#7A1E34] text-xs flex items-center gap-2 font-medium">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{regError}</span>
                    </div>
                  )}

                  {regSuccess && (
                    <div className="p-3 rounded-xl bg-[#E8F6F3] border border-[#A5DDD3] text-[#2D8D84] text-xs flex items-center gap-2 font-medium">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      <span>{regSuccess}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#2D8D84] hover:bg-[#247D75] text-white font-bold text-xs transition-all shadow-md shadow-[#2D8D84]/25 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4" /> Daftar Akun {regRole === 'runner' ? 'Runner' : 'Customer'} UPI →
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setActiveTab('login')}
                      className="text-xs text-[#7A1E34] hover:underline font-semibold cursor-pointer"
                    >
                      Sudah punya akun? Masuk langsung di sini →
                    </button>
                  </div>
                </form>
              )}

              {/* Bottom Card Helper: Guest Explorer Mode & Admin Access */}
              <div className="mt-5 pt-3.5 border-t border-[#E8DFD1] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs text-[#6E6265]">
                <button
                  type="button"
                  onClick={enterGuestMode}
                  className="font-bold text-[#7A1E34] hover:text-[#6E1C2F] flex items-center gap-1 cursor-pointer transition-colors text-xs"
                >
                  <span>Jelajahi Mode Tamu</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={openAdminAuthModal}
                  className="font-bold text-[#2C2224] hover:text-[#7A1E34] flex items-center gap-1.5 cursor-pointer transition-colors text-xs px-3 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#E8DFD1] hover:bg-[#F2EBE0] shadow-xs"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Portal Administrator BEM UPI</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#E8DFD1] bg-white/80 py-4 text-center text-xs text-[#6E6265]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>CampusQuest UPI © 2026 • Ekosistem Peer-to-Peer Resmi Mahasiswa UPI</span>
          <span className="text-[#6E6265] flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-[#2D8D84]" /> Terenkripsi &amp; Terproteksi Canvas Watermark UPI
          </span>
        </div>
      </footer>
    </div>
  );
}
