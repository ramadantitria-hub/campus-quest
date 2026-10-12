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

type LoginSection = 'customer' | 'runner' | 'admin';
type LoginTab = 'login' | 'register';
type ScanSource = 'upload' | 'camera';

export default function KtmLoginModal({ isOpen, onClose }: KtmLoginModalProps) {
  const { loginWithCredentials, registerAccount, loginWithKtm, isLoggedIn, openAdminAuthModal } = useCampusQuest();

  // 3 Bagian Utama Login: Customer, Runner, Admin
  const [loginSection, setLoginSection] = useState<LoginSection>('customer');
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

    // Auto-fill registration form
    if (resolvedName) setRegFullName(resolvedName);
    if (resolvedNim) setRegNim(resolvedNim);
    if (resolvedMajor) setRegMajor(resolvedMajor);
    if (resolvedFaculty) setRegFaculty(resolvedFaculty);

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
    const cleanPassword = loginPassword.trim();
    if (!cleanNim) {
      setLoginError('Masukkan Nomor Induk Mahasiswa (NIM) UPI Anda.');
      return;
    }
    if (!cleanPassword) {
      setLoginError('Masukkan kata sandi / password akun Anda.');
      return;
    }
    const targetRole: UserRole = loginSection === 'runner' ? 'runner' : 'customer';
    const res = loginWithCredentials(cleanNim, cleanPassword, targetRole);
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

    // KTM scan is strictly mandatory during registration
    if (!hasScannedResult || !scannedKtmUrl) {
      setRegError('Pindai atau unggah foto KTM UPI wajib dilakukan saat mendaftar akun baru.');
      return;
    }

    const cleanName = (regFullName || scannedFullName).trim();
    const cleanNim = (regNim || scannedNim).trim();
    const cleanMajor = (regMajor || scannedMajor).trim();
    const cleanFaculty = regFaculty || scannedFaculty || 'Kampus UPI di Purwakarta';
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
    if (!cleanMajor) {
      setRegError('Program studi / jurusan mahasiswa UPI wajib diisi.');
      return;
    }
    if (!cleanPhone) {
      setRegError('Nomor WhatsApp / HP aktif wajib diisi agar pesanan dapat dikonfirmasi.');
      return;
    }
    if (!cleanPassword || cleanPassword.length < 5) {
      setRegError('Password akun minimal 5 karakter.');
      return;
    }
    if (cleanPassword !== regConfirmPassword.trim()) {
      setRegError('Konfirmasi password tidak cocok.');
      return;
    }

    const targetRole: UserRole = loginSection === 'runner' ? 'runner' : 'customer';

    const res = registerAccount({
      fullName: cleanName,
      nim: cleanNim,
      password: cleanPassword,
      major: cleanMajor,
      faculty: cleanFaculty,
      university: 'Universitas Pendidikan Indonesia (UPI)',
      phone: cleanPhone,
      role: targetRole,
      ktmUrl: scannedKtmUrl
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

        {/* 2 PILIHAN PERAN MASUK MAHASISWA: CUSTOMER & RUNNER */}
        <div className="mb-4">
          <label className="text-[11px] font-bold text-[#6E6265] mb-1.5 block">
            Pilih Peran Masuk Mahasiswa:
          </label>
          <div className="grid grid-cols-2 p-1.5 bg-[#F2EBE0] border border-[#E8DFD1] rounded-2xl gap-1.5 shadow-inner">
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
                <div className="text-xs font-black">Customer</div>
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
                <div className="text-xs font-black">Runner</div>
                <div className="text-[10px] opacity-85 hidden sm:block">Mitra Eksekutor</div>
              </div>
            </button>
          </div>
        </div>

        {/* METHOD SWITCHER TABS */}
        <div className="grid grid-cols-2 p-1 bg-[#F2EBE0] border border-[#E8DFD1] rounded-2xl mb-4 text-xs font-semibold gap-1">
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
            <span className="truncate">Masuk (NIM & Sandi)</span>
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
            <Camera className="w-3.5 h-3.5" />
            <span className="truncate">Daftar (Pindai KTM Wajib)</span>
          </button>
        </div>

        {/* TAB 1: FORM MASUK (LOGIN) */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 animate-in fade-in">
            {/* Input NIM UPI */}
            <div>
              <label className="block text-xs font-bold text-[#2C2224] mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-[#7A1E34]" />
                  Nomor Induk Mahasiswa (NIM UPI)
                </span>
                <span className="text-[10px] text-[#6E6265] font-mono">Format 7-Digit</span>
              </label>
              <input
                type="text"
                value={loginNim}
                onChange={(e) => {
                  setLoginNim(e.target.value);
                  setLoginError(null);
                }}
                placeholder="Contoh: 2201945 atau 2108765"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E8DFD1] text-xs text-[#2C2224] font-mono placeholder:font-sans focus:outline-none focus:border-[#7A1E34]"
              />
            </div>

            {/* Input Password */}
            <div>
              <label className="block text-xs font-bold text-[#2C2224] mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#7A1E34]" />
                Kata Sandi / Password Akun
              </label>
              <div className="relative">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    setLoginError(null);
                  }}
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
                Belum punya akun? Daftar Akun Mahasiswa Baru (Wajib Pindai KTM) →
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: FORM DAFTAR AKUN BARU (PINDAI KTM WAJIB) */}
        {activeTab === 'register' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD1] text-xs text-[#2C2224] flex items-start gap-2.5 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-[#7A1E34] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-[#2C2224]">Pendaftaran Akun Mahasiswa UPI</p>
                <p className="text-[11px] text-[#6E6265] mt-0.5">
                  Pemindaian KTM UPI <strong>wajib dilakukan</strong> saat pendaftaran untuk memastikan validitas civitas akademika dan melindungi komunitas.
                </p>
              </div>
            </div>

            {/* LANGKAH 1: PINDAI / UNGGAH FOTO KTM (WAJIB) */}
            {!hasScannedResult && !isScanning && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#2C2224] flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-[#7A1E34]" />
                    Langkah 1: Pindai / Unggah Foto KTM UPI (Wajib)
                  </span>
                  <span className="text-[10px] font-bold text-[#7A1E34] bg-[#FBF0F2] px-2 py-0.5 rounded-full border border-[#F1CCD3]">
                    * Wajib Dilakukan
                  </span>
                </div>

                {/* Sub-tabs: Upload / Camera */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
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
                    <span>Unggah Berkas Foto KTM</span>
                  </button>
                  <button
                    type="button"
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
                    <span>Kamera Pemindai Live</span>
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
                    <div className="w-12 h-12 rounded-2xl bg-[#FBF0F2] border border-[#F1CCD3] text-[#7A1E34] flex items-center justify-center mx-auto mb-2.5 group-hover:scale-110 transition-transform shadow-sm">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-[#2C2224]">Klik atau Tarik Foto KTM UPI ke Sini</p>
                    <p className="text-[11px] text-[#6E6265] mt-1">
                      Format JPG, PNG, WEBP • Sistem OCR otomatis mengekstrak Nama & NIM 7-digit Anda
                    </p>
                    <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-[#E8DFD1] text-[10px] text-[#6E6265]">
                      <Lock className="w-3 h-3 text-[#2D8D84]" />
                      Otomatis disematkan cap watermark proteksi resmi UPI
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
                          type="button"
                          onClick={() => startCamera()}
                          className="mt-3 px-3 py-1.5 rounded-lg bg-white/20 text-xs font-semibold text-white hover:bg-white/30 cursor-pointer"
                        >
                          Coba Lagi
                        </button>
                      </div>
                    ) : (
                      <>
                        <video ref={videoRef} playsInline autoPlay className="w-full h-full object-cover" />

                        <div className="absolute inset-3 sm:inset-5 border-2 border-[#7A1E34]/80 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
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
                            title="Putar Kamera"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={handleCapturePhoto}
                            className="px-4 py-2 rounded-full bg-[#7A1E34] hover:bg-[#6E1C2F] text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#7A1E34]/40 cursor-pointer"
                          >
                            <Camera className="w-4 h-4" /> Ambil Foto &amp; Pindai KTM
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
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

            {/* LANGKAH 2: FORM LENGKAP PENDAFTARAN SETELAH KTM TERPINDAI */}
            {hasScannedResult && !isScanning && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* Success & Watermarked Preview Banner */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#E8F6F3] border border-[#A5DDD3] text-[#1F6F67] text-xs">
                  <span className="flex items-center gap-1.5 font-bold">
                    <CheckCircle className="w-4 h-4 text-[#2D8D84]" />
                    KTM UPI Berhasil Dipindai &amp; Terverifikasi!
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setHasScannedResult(false);
                      setScannedKtmUrl(null);
                    }}
                    className="text-[11px] font-bold text-[#7A1E34] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Pindai Ulang
                  </button>
                </div>

                {scannedKtmUrl && (
                  <div className="relative rounded-2xl overflow-hidden border border-[#E8DFD1] shadow-md max-h-44 flex items-center justify-center bg-black">
                    <img
                      src={scannedKtmUrl}
                      alt="Watermarked KTM UPI"
                      className="w-full h-auto object-contain max-h-44"
                    />
                    <div className="absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur-md px-3 py-1 rounded-lg border border-[#E8DFD1] flex items-center justify-between text-[10px] text-[#2C2224]">
                      <span className="flex items-center gap-1 font-semibold text-[#7A1E34]">
                        <Lock className="w-3 h-3 text-[#7A1E34]" /> Watermark Mahasiswa UPI Aktif
                      </span>
                      <span className="text-[#6E6265] font-mono font-bold">NIM: {regNim || scannedNim}</span>
                    </div>
                  </div>
                )}

                <div className="bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#E8DFD1] space-y-3">
                  <div className="flex items-center justify-between border-b border-[#E8DFD1] pb-2">
                    <span className="text-xs font-bold text-[#2C2224]">Langkah 2: Lengkapi Data Akun</span>
                    <span className="text-[10px] text-[#6E6265]">Dapat diedit bila perlu penyesuaian</span>
                  </div>

                  {/* Input Nama Lengkap */}
                  <div>
                    <label className="text-[#2C2224] block mb-1 text-xs font-medium flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-[#7A1E34]" /> Nama Lengkap Mahasiswa UPI:
                      </span>
                      <span className="text-[10px] text-[#7A1E34] font-bold">* Wajib</span>
                    </label>
                    <input
                      type="text"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      placeholder="Contoh: TRIA RAMADANTI"
                      required
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8DFD1] text-xs text-[#2C2224] font-semibold focus:outline-none focus:border-[#7A1E34]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Input NIM UPI */}
                    <div>
                      <label className="text-[#2C2224] block mb-1 font-medium flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Hash className="w-3 h-3 text-[#7A1E34]" /> NIM UPI (7-Digit):
                        </span>
                        <span className="text-[10px] text-[#7A1E34] font-bold">* Wajib</span>
                      </label>
                      <input
                        type="text"
                        value={regNim}
                        onChange={(e) => setRegNim(e.target.value)}
                        placeholder="Contoh: 2502895"
                        required
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8DFD1] text-xs text-[#2C2224] font-mono font-bold focus:outline-none focus:border-[#7A1E34]"
                      />
                    </div>

                    {/* Input Nomor HP */}
                    <div>
                      <label className="text-[#2C2224] block mb-1 font-medium flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-[#7A1E34]" /> WhatsApp / HP Aktif:
                        </span>
                        <span className="text-[10px] text-[#7A1E34] font-bold">* Wajib</span>
                      </label>
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="Contoh: 081234567890"
                        required
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8DFD1] text-xs text-[#2C2224] font-mono focus:outline-none focus:border-[#7A1E34]"
                      />
                    </div>
                  </div>

                  {/* Jurusan / Program Studi */}
                  <div>
                    <label className="text-[#2C2224] block mb-1 text-xs font-medium flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-[#7A1E34]" /> Program Studi / Jurusan:
                      </span>
                      <span className="text-[10px] text-[#7A1E34] font-bold">* Wajib</span>
                    </label>
                    <input
                      type="text"
                      value={regMajor}
                      onChange={(e) => setRegMajor(e.target.value)}
                      placeholder="Contoh: Mekatronika dan Kecerdasan Buatan (S1)"
                      required
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8DFD1] text-xs text-[#2C2224] font-semibold focus:outline-none focus:border-[#7A1E34]"
                    />
                  </div>

                  {/* Fakultas / Kampus Daerah */}
                  <div>
                    <label className="text-[#2C2224] block mb-1 text-xs font-medium flex items-center gap-1">
                      <GraduationCap className="w-3 h-3 text-[#7A1E34]" /> Fakultas / Kampus Daerah UPI:
                    </label>
                    <select
                      value={regFaculty}
                      onChange={(e) => setRegFaculty(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8DFD1] text-xs text-[#2C2224] focus:outline-none focus:border-[#7A1E34]"
                    >
                      {UPI_FACULTIES.map((fac, idx) => (
                        <option key={idx} value={fac}>
                          {fac}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status Peran Pendaftaran */}
                  <div className="p-2.5 rounded-xl bg-white border border-[#E8DFD1] flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-[#6E6265] block">Mendaftar Sebagai:</span>
                      <span className="text-xs font-black text-[#2C2224] flex items-center gap-1.5 mt-0.5">
                        {loginSection === 'runner' ? (
                          <>
                            <Zap className="w-3.5 h-3.5 text-[#7A1E34]" /> Runner Mahasiswa UPI
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5 text-[#2D8D84]" /> Customer Mahasiswa UPI
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-medium text-[#2C2224] mb-1 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-[#7A1E34]" />
                        Kata Sandi Akun
                      </label>
                      <div className="relative">
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Minimal 5 karakter..."
                          required
                          className="w-full px-3 py-2 pr-9 rounded-xl bg-white border border-[#E8DFD1] text-xs text-[#2C2224] focus:outline-none focus:border-[#7A1E34]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-2.5 top-2 text-[#6E6265] hover:text-[#2C2224]"
                        >
                          {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block font-medium text-[#2C2224] mb-1 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-[#7A1E34]" />
                        Konfirmasi Kata Sandi
                      </label>
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Ulangi kata sandi..."
                        required
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8DFD1] text-xs text-[#2C2224] focus:outline-none focus:border-[#7A1E34]"
                      />
                    </div>
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
                  <Check className="w-4 h-4" /> Daftar &amp; Masuk Sebagai {loginSection === 'runner' ? 'Runner' : 'Customer'} UPI →
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
          </div>
        )}

        {/* Modal Footer Security Guarantee & Admin Access */}
        <div className="mt-5 pt-4 border-t border-[#E8DFD1] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-[11px] text-[#6E6265]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2D8D84]" />
            <span>Verifikasi KTM resmi civitas akademika UPI</span>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button
              onClick={() => {
                onClose();
                openAdminAuthModal();
              }}
              className="text-[10px] text-[#A89F91] hover:text-[#7A1E34] transition-colors cursor-pointer"
              title="Akses Terbatas Administrator"
            >
              Portal Admin
            </button>
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
