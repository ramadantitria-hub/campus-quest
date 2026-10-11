'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useCampusQuest } from '@/context/CampusQuestContext';
import { UPI_FACULTIES, AUTHORIZED_ADMINS, ADMIN_PASSWORD } from '@/lib/mock-data';
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

type LoginSection = 'customer' | 'runner' | 'admin';
type LoginTab = 'login' | 'register' | 'ocr_scan';
type ScanSource = 'upload' | 'camera';

export default function KtmLoginModal({ isOpen, onClose }: KtmLoginModalProps) {
  const { loginWithCredentials, registerAccount, loginWithKtm, isLoggedIn, loginAsAdmin } = useCampusQuest();

  // 3 Bagian Utama Login: Customer, Runner, Admin
  const [loginSection, setLoginSection] = useState<LoginSection>('customer');
  const [activeTab, setActiveTab] = useState<LoginTab>('login');

  // Login State
  const [loginNim, setLoginNim] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginRole, setLoginRole] = useState<UserRole>('customer');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Admin Login State
  const [adminNim, setAdminNim] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminSuccess, setAdminSuccess] = useState<string | null>(null);

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

    const targetRole: UserRole = loginSection === 'runner' ? 'runner' : 'customer';
    loginWithKtm({
      fullName: cleanName,
      nim: cleanNim,
      major: cleanMajor,
      faculty: scannedFaculty,
      university: 'Universitas Pendidikan Indonesia (UPI)',
      ktmUrl: scannedKtmUrl || '',
      avatarUrl: scannedAvatarUrl || undefined,
      role: targetRole
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
    const targetRole: UserRole = loginSection === 'runner' ? 'runner' : 'customer';
    const res = loginWithCredentials(cleanNim, loginPassword, targetRole);
    if (res.success) {
      onClose();
    } else {
      setLoginError(res.message);
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    setAdminSuccess(null);
    const cleanNim = adminNim.trim();
    const cleanPass = adminPassword.trim();
    if (!cleanNim) {
      setAdminError('Silakan pilih salah satu Administrator atau masukkan NIM Administrator.');
      return;
    }
    if (!cleanPass) {
      setAdminError('Masukkan password Administrator (default: 123).');
      return;
    }
    const res = loginAsAdmin(cleanNim, cleanPass);
    if (!res.success) {
      setAdminError(res.message);
    } else {
      setAdminSuccess(res.message);
      setTimeout(() => {
        onClose();
      }, 700);
    }
  };

  const handleSelectAdmin = (nim: string) => {
    setAdminNim(nim);
    setAdminPassword(ADMIN_PASSWORD);
    setAdminError(null);
    soundFX.pop();
  };

  const handleQuickLogin = (nim: string, role: 'customer' | 'runner') => {
    setLoginNim(nim);
    setLoginPassword('upi123');
    setLoginError(null);
    soundFX.pop();
    const res = loginWithCredentials(nim, 'upi123', role);
    if (res.success) {
      onClose();
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
      role: loginSection === 'runner' ? 'runner' : 'customer'
    });

    if (res.success) {
      onClose();
    } else {
      setRegError(res.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
      <div className="bg-[#FAF7F2] border-t sm:border border-[#E8DFD1] max-w-2xl w-full rounded-t-3xl sm:rounded-3xl p-4 sm:p-7 text-[#2C2224] shadow-2xl relative max-h-[88vh] sm:max-h-[92vh] flex flex-col overflow-y-auto animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-200">
        {/* Mobile Drag Indicator Pill */}
        <div className="w-12 h-1 bg-[#E8DFD1] rounded-full mx-auto mb-2.5 sm:hidden shrink-0" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#6E6265] hover:text-[#2C2224] p-2 rounded-xl hover:bg-[#F2EBE0] transition-colors cursor-pointer"
          title="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3 sm:gap-4 mb-6">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#6E1C2F] to-[#7A1E34] shadow-md shadow-[#7A1E34]/25 shrink-0">
            <span className="text-white font-black text-xl tracking-tighter">UPI</span>
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#2D8D84] rounded-full border-2 border-white animate-pulse" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FBF0F2] border border-[#F1CCD3] text-[#7A1E34] text-[11px] font-semibold mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#7A1E34]" />
              <span>Khusus Mahasiswa Universitas Pendidikan Indonesia</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#2C2224] tracking-tight">
              Login Mahasiswa UPI
            </h2>
            <p className="text-xs text-[#6E6265] mt-0.5">
              Pindai KTM UPI atau gunakan akun SSO kampus untuk akses penuh pesanan JASTAP &amp; JARVIS
            </p>
          </div>
        </div>

        {/* 3 BAGIAN UTAMA LOGIN: CUSTOMER, RUNNER, ADMIN */}
        <div className="mb-4">
          <label className="text-[11px] font-bold text-[#6E6265] mb-1.5 block">
            Pilih Peran Masuk (3 Bagian):
          </label>
          <div className="grid grid-cols-3 p-1.5 bg-[#F2EBE0] border border-[#E8DFD1] rounded-2xl gap-1.5 shadow-inner">
            {/* Bagian 1: Customer */}
            <button
              type="button"
              onClick={() => {
                setLoginSection('customer');
                setLoginRole('customer');
                setLoginError(null);
                soundFX.pop();
              }}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 sm:py-2.5 px-2 rounded-xl transition-all cursor-pointer ${
                loginSection === 'customer'
                  ? 'bg-[#2D8D84] text-white shadow-md shadow-[#2D8D84]/30 font-bold'
                  : 'text-[#6E6265] hover:text-[#2C2224] hover:bg-white/50 font-semibold'
              }`}
            >
              <ShoppingBag className="w-4 h-4 shrink-0" />
              <div className="text-center sm:text-left leading-tight">
                <div className="text-xs font-black">1. Customer</div>
                <div className="text-[10px] opacity-85 hidden sm:block">Titip Beli & Jasa</div>
              </div>
            </button>

            {/* Bagian 2: Runner */}
            <button
              type="button"
              onClick={() => {
                setLoginSection('runner');
                setLoginRole('runner');
                setLoginError(null);
                soundFX.pop();
              }}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 sm:py-2.5 px-2 rounded-xl transition-all cursor-pointer ${
                loginSection === 'runner'
                  ? 'bg-[#7A1E34] text-white shadow-md shadow-[#7A1E34]/30 font-bold'
                  : 'text-[#6E6265] hover:text-[#2C2224] hover:bg-white/50 font-semibold'
              }`}
            >
              <Zap className="w-4 h-4 shrink-0" />
              <div className="text-center sm:text-left leading-tight">
                <div className="text-xs font-black">2. Runner</div>
                <div className="text-[10px] opacity-85 hidden sm:block">Mitra Eksekutor</div>
              </div>
            </button>

            {/* Bagian 3: Admin */}
            <button
              type="button"
              onClick={() => {
                setLoginSection('admin');
                setLoginRole('admin');
                setAdminError(null);
                soundFX.pop();
              }}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 sm:py-2.5 px-2 rounded-xl transition-all cursor-pointer ${
                loginSection === 'admin'
                  ? 'bg-[#2C2224] text-white shadow-md shadow-black/30 font-bold'
                  : 'text-[#6E6265] hover:text-[#2C2224] hover:bg-white/50 font-semibold'
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" />
              <div className="text-center sm:text-left leading-tight">
                <div className="text-xs font-black">3. Admin</div>
                <div className="text-[10px] opacity-85 hidden sm:block">Portal Admin</div>
              </div>
            </button>
          </div>
        </div>



        {/* METHOD SWITCHER TABS (HANYA UNTUK CUSTOMER & RUNNER) */}
        {loginSection !== 'admin' && (
          <div className="grid grid-cols-3 p-1 bg-[#F2EBE0] border border-[#E8DFD1] rounded-2xl mb-4 text-xs font-semibold gap-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                stopCamera();
                soundFX.pop();
              }}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-[#7A1E34] text-white shadow-md shadow-[#7A1E34]/25'
                  : 'text-[#6E6265] hover:text-[#2C2224]'
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
                  ? 'bg-[#7A1E34] text-white shadow-md shadow-[#7A1E34]/25'
                  : 'text-[#6E6265] hover:text-[#2C2224]'
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
                  ? 'bg-[#7A1E34] text-white shadow-md shadow-[#7A1E34]/25'
                  : 'text-[#6E6265] hover:text-[#2C2224]'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span className="truncate">Pindai KTM</span>
            </button>
          </div>
        )}

        {/* BAGIAN 3: LOGIN KHUSUS ADMIN */}
        {loginSection === 'admin' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="p-3.5 rounded-2xl bg-[#2C2224] text-white border border-[#4A3D41] flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#7A1E34] to-[#9B2444] text-white flex items-center justify-center font-bold shadow-sm">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-extrabold text-white">Portal Admin</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      Khusus 4 Administrator
                    </span>
                  </div>
                  <p className="text-[11px] text-[#A5DDD3] mt-0.5">
                    Audit transaksi, moderasi pesanan, & verifikasi akun mahasiswa
                  </p>
                </div>
              </div>
            </div>

            {/* Pilih salah satu 4 Admin Resmi */}
            <div>
              <label className="text-xs font-bold text-[#2C2224] mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#7A1E34]" />
                  Pilih Akun Admin Resmi:
                </span>
                <span className="text-[10px] text-[#2D8D84] font-semibold bg-[#E8F6F3] px-2 py-0.5 rounded-md border border-[#A5DDD3]">
                  Klik untuk Isi Otomatis
                </span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {AUTHORIZED_ADMINS.map((admin) => {
                  const isSelected = adminNim === admin.nim;
                  return (
                    <button
                      key={admin.nim}
                      type="button"
                      onClick={() => handleSelectAdmin(admin.nim)}
                      className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#E8F6F3] border-[#2D8D84] text-[#1F6F67] shadow-xs ring-2 ring-[#2D8D84]/20'
                          : 'bg-white border-[#E8DFD1] hover:border-[#2D8D84] text-[#2C2224]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-black truncate">{admin.name}</span>
                        <span className="text-[10px] font-mono font-bold text-[#7A1E34]">
                          {admin.nim}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#8E7F83] truncate mt-0.5">
                        {admin.major}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form Login Admin */}
            <form onSubmit={handleAdminSubmit} className="space-y-3.5 pt-1">
              <div>
                <label className="block text-xs font-bold text-[#2C2224] mb-1 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-[#7A1E34]" />
                  Nomor Induk Mahasiswa (NIM) Administrator
                </label>
                <input
                  type="text"
                  value={adminNim}
                  onChange={(e) => {
                    setAdminNim(e.target.value);
                    setAdminError(null);
                  }}
                  placeholder="Pilih di atas atau ketik NIM Admin..."
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E8DFD1] text-xs font-mono font-bold text-[#2C2224] placeholder:font-sans placeholder:font-normal focus:outline-none focus:border-[#7A1E34]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C2224] mb-1 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-[#7A1E34]" />
                  Password Administrator (Default: 123)
                </label>
                <div className="relative">
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => {
                      setAdminPassword(e.target.value);
                      setAdminError(null);
                    }}
                    placeholder="Masukkan password admin resmi..."
                    required
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-white border border-[#E8DFD1] text-xs font-mono text-[#2C2224] focus:outline-none focus:border-[#7A1E34]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-3 top-2.5 text-[#6E6265] hover:text-[#2C2224]"
                  >
                    {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E8DFD1] text-[11px] text-[#6E6265] flex items-start gap-2">
                <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[#2C2224]">Privasi & Keamanan Ketat:</strong> Halaman dashboard dan audit Administrator tidak dapat diakses atau dilihat oleh akun Customer maupun Runner.
                </span>
              </div>

              {adminError && (
                <div className="p-3 rounded-xl bg-[#FBF0F2] border border-[#F1CCD3] text-[#7A1E34] text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{adminError}</span>
                </div>
              )}

              {adminSuccess && (
                <div className="p-3 rounded-xl bg-[#E8F6F3] border border-[#A5DDD3] text-[#1F6F67] text-xs flex items-center gap-2 font-medium">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{adminSuccess}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#2C2224] hover:bg-[#1A1415] text-white font-bold text-xs transition-all shadow-md shadow-black/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" /> Masuk Sebagai Admin →
              </button>
            </form>
          </div>
        )}

        {/* TAB 1: OCR SCAN / UPLOAD KTM */}
        {loginSection !== 'admin' && activeTab === 'ocr_scan' && (
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
                        ? 'bg-[#FBF0F2] border-[#F1CCD3] text-[#7A1E34]'
                        : 'bg-white border-[#E8DFD1] text-[#6E6265] hover:text-[#2C2224]'
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
                        ? 'bg-[#FBF0F2] border-[#F1CCD3] text-[#7A1E34]'
                        : 'bg-white border-[#E8DFD1] text-[#6E6265] hover:text-[#2C2224]'
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
                    className="border-2 border-dashed border-[#E8DFD1] hover:border-[#7A1E34]/50 rounded-2xl p-7 text-center cursor-pointer transition-all bg-[#FAF7F2] hover:bg-white group"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="w-12 h-12 rounded-2xl bg-[#FBF0F2] border border-[#F1CCD3] text-[#7A1E34] flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-sm">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-[#2C2224]">Klik atau Tarik Foto KTM UPI ke Sini</p>
                    <p className="text-xs text-[#6E6265] mt-1">
                      Format JPG, PNG, WEBP • Otomatis deteksi OCR Nama, NIM 7-digit, dan Fakultas UPI Anda
                    </p>
                  </div>
                )}

                {/* MODE 2: LIVE CAMERA */}
                {scanSource === 'camera' && (
                  <div className="relative rounded-2xl overflow-hidden bg-black border border-[#E8DFD1] aspect-video flex items-center justify-center">
                    {cameraError ? (
                      <div className="p-4 text-center">
                        <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                        <p className="text-xs text-white">{cameraError}</p>
                        <button
                          onClick={startCamera}
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
                            Arahkan KTM UPI Anda ke dalam kotak pemindai
                          </div>
                        </div>

                        <div className="absolute bottom-3">
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
                  <div className="absolute inset-0 rounded-full border-4 border-[#7A1E34] border-t-transparent animate-spin" />
                  <ScanLine className="w-6 h-6 text-[#7A1E34] animate-pulse" />
                </div>

                <div>
                  <h4 className="text-sm font-bold text-[#2C2224]">Memproses Verifikasi OCR KTM UPI...</h4>
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
                    KTM UPI Terverifikasi Aktif!
                  </span>
                  <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded-full border border-[#A5DDD3] text-[#2D8D84]">
                    UPI Active Student
                  </span>
                </div>

                {scannedKtmUrl && (
                  <div className="relative rounded-2xl overflow-hidden border border-[#E8DFD1] shadow-md max-h-48 flex items-center justify-center bg-black">
                    <img
                      src={scannedKtmUrl}
                      alt="Watermarked KTM UPI"
                      className="w-full h-auto object-contain max-h-48"
                    />
                    <div className="absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#E8DFD1] flex items-center justify-between text-[10px] text-[#2C2224]">
                      <span className="flex items-center gap-1 font-semibold text-[#7A1E34]">
                        <Lock className="w-3 h-3 text-[#7A1E34]" /> Cap Canvas Watermark Mahasiswa UPI Terpasang
                      </span>
                      <span className="text-[#6E6265] font-mono font-bold">{scannedNim}</span>
                    </div>
                  </div>
                )}

                <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E8DFD1] space-y-3">
                  <div className="flex items-center justify-between border-b border-[#E8DFD1] pb-2">
                    <span className="text-xs font-bold text-[#2C2224]">Data Terverifikasi Mahasiswa UPI</span>
                    <span className="text-[10px] text-[#6E6265]">Dapat disesuaikan jika perlu</span>
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
                    <span className="text-xs text-[#2C2224] font-medium">Masuk Sebagai Mode:</span>
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 ${
                      loginSection === 'runner'
                        ? 'bg-[#E8F6F3] border-[#2D8D84] text-[#2D8D84]'
                        : 'bg-[#FBF0F2] border-[#7A1E34] text-[#7A1E34]'
                    }`}>
                      {loginSection === 'runner' ? <Zap className="w-3.5 h-3.5 text-amber-500" /> : <ShoppingBag className="w-3.5 h-3.5" />}
                      <span>{loginSection === 'runner' ? 'Runner Mahasiswa UPI' : 'Customer Mahasiswa UPI'}</span>
                    </span>
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
                    <RefreshCw className="w-3.5 h-3.5" /> Scan Ulang
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
        {loginSection !== 'admin' && activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
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



            {loginError && (
              <div className="p-3 rounded-xl bg-[#FBF0F2] border border-[#F1CCD3] text-[#7A1E34] text-xs flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className={`w-full py-2.5 rounded-xl text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                loginSection === 'runner'
                  ? 'bg-[#7A1E34] hover:bg-[#6E1C2F] shadow-[#7A1E34]/25'
                  : 'bg-[#2D8D84] hover:bg-[#247D75] shadow-[#2D8D84]/25'
              }`}
            >
              {loginSection === 'runner' ? <Zap className="w-4 h-4 text-amber-300" /> : <ShoppingBag className="w-4 h-4" />}
              <span>Masuk Sebagai {loginSection === 'runner' ? 'Runner' : 'Customer'} UPI →</span>
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

            {/* Status Peran Pendaftaran */}
            <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD1] flex items-center justify-between">
              <div>
                <span className="text-xs text-[#6E6265] block">Mendaftar Sebagai Akun:</span>
                <span className="text-xs font-black text-[#2C2224] flex items-center gap-1.5 mt-0.5">
                  {loginSection === 'runner' ? (
                    <>
                      <Zap className="w-4 h-4 text-[#7A1E34]" /> Runner Mahasiswa UPI
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 text-[#2D8D84]" /> Customer Mahasiswa UPI
                    </>
                  )}
                </span>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-xl border ${
                loginSection === 'runner'
                  ? 'bg-[#FBF0F2] text-[#7A1E34] border-[#F1CCD3]'
                  : 'bg-[#E8F6F3] text-[#1F6F67] border-[#A5DDD3]'
              }`}>
                {loginSection === 'runner' ? 'Mitra Eksekutor' : 'Pemesan Jasa'}
              </span>
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
              className={`w-full py-2.5 rounded-xl text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                loginSection === 'runner'
                  ? 'bg-[#7A1E34] hover:bg-[#6E1C2F] shadow-[#7A1E34]/25'
                  : 'bg-[#2D8D84] hover:bg-[#247D75] shadow-[#2D8D84]/25'
              }`}
            >
              <Check className="w-4 h-4" /> Daftar Akun {loginSection === 'runner' ? 'Runner' : 'Customer'} UPI →
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

        {/* Modal Footer Security Guarantee & Admin Access */}
        <div className="mt-5 pt-4 border-t border-[#E8DFD1] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-[11px] text-[#6E6265]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2D8D84]" />
            <span>Verifikasi KTM resmi civitas akademika UPI</span>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="text-[11px] text-[#8E7F83] flex items-center gap-1.5 font-medium">
              <Lock className="w-3.5 h-3.5 text-[#2D8D84]" />
              <span>Tampilan admin terproteksi & privat</span>
            </div>
            {!isLoggedIn && (
              <button
                onClick={onClose}
                className="text-[#7A1E34] hover:underline transition-colors cursor-pointer font-semibold"
              >
                Mode Tamu →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
