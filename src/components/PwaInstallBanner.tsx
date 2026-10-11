'use client';

import React, { useEffect, useState } from 'react';
import { Download, X, Smartphone, Share2, PlusSquare } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    queueMicrotask(() => {
      setIsIos(isIosDevice);
    });

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If on iOS and not standalone, show prompt after a short delay
    if (isIosDevice) {
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    if (!deferredPrompt) {
      alert('Untuk menginstall, buka menu browser Anda (titik 3) lalu pilih "Tambahkan ke Layar Utama" (Add to Home screen).');
      return;
    }

    await deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  if (!showBanner) return null;

  return (
    <>
      <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-40 bg-[#FAF7F2]/95 backdrop-blur-md border border-[#E8DFD1] text-[#2C2224] rounded-3xl p-4 shadow-xl shadow-[#2C2224]/10 transition-all animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-start gap-3.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icon-192.png"
            alt="CampusQuest UPI App Icon"
            className="w-12 h-12 rounded-2xl shadow-md border border-[#E8DFD1] shrink-0 object-cover"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-extrabold text-[#2C2224] flex items-center gap-1.5">
              Install CampusQuest UPI
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FBF0F2] text-[#7A1E34] border border-[#F1CCD3] font-bold">App</span>
            </h4>
            <p className="text-xs text-[#6E6265] mt-0.5">
              Pasang ikon di layar utama HP untuk akses instan &amp; pengalaman aplikasi native!
            </p>
            <div className="flex items-center gap-2 mt-2.5">
              <button
                onClick={handleInstallClick}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#7A1E34] to-[#8E223D] hover:from-[#6E1C2F] hover:to-[#7A1E34] text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-[#7A1E34]/20"
              >
                <Download className="w-3.5 h-3.5" />
                Pasang ke Layar Utama
              </button>
              <button
                onClick={() => setShowBanner(false)}
                className="px-2.5 py-1.5 rounded-xl hover:bg-[#F2EBE0] text-[#6E6265] text-xs font-semibold transition-colors cursor-pointer"
              >
                Nanti Saja
              </button>
            </div>
          </div>
          <button
            onClick={() => setShowBanner(false)}
            className="text-[#8C7E83] hover:text-[#2C2224] p-1 rounded-lg hover:bg-[#F2EBE0] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS Safari Installation Guide Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 bg-[#2C2224]/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF7F2] border border-[#E8DFD1] max-w-sm w-full rounded-3xl p-6 text-[#2C2224] shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowIosGuide(false)}
              className="absolute top-4 right-4 text-[#8C7E83] hover:text-[#2C2224] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icon-192.png"
                alt="CampusQuest UPI Icon"
                className="w-12 h-12 rounded-2xl border border-[#E8DFD1] shadow-md object-cover"
              />
              <div>
                <h3 className="text-base font-extrabold text-[#2C2224]">
                  Pasang ke Layar Utama (iOS)
                </h3>
                <p className="text-[11px] text-[#8C7E83]">CampusQuest UPI App</p>
              </div>
            </div>
            <p className="text-xs text-[#6E6265] mb-4">
              Apple Safari memerlukan 2 langkah mudah agar ikon muncul di Homescreen HP Anda:
            </p>
            <ol className="space-y-3 text-xs text-[#2C2224]">
              <li className="flex items-start gap-2.5 bg-white p-2.5 rounded-2xl border border-[#E8DFD1]">
                <div className="w-6 h-6 rounded-full bg-[#E8F6F3] text-[#2D8D84] flex items-center justify-center shrink-0 font-bold">1</div>
                <div>
                  Ketuk tombol <strong>Share / Bagikan</strong> <Share2 className="w-3.5 h-3.5 inline text-[#2D8D84] mx-1" /> di toolbar bawah Safari.
                </div>
              </li>
              <li className="flex items-start gap-2.5 bg-white p-2.5 rounded-2xl border border-[#E8DFD1]">
                <div className="w-6 h-6 rounded-full bg-[#FBF0F2] text-[#7A1E34] flex items-center justify-center shrink-0 font-bold">2</div>
                <div>
                  Scroll ke bawah lalu pilih <strong>&quot;Tambahkan ke Layar Utama&quot;</strong> (Add to Home Screen) <PlusSquare className="w-3.5 h-3.5 inline text-[#7A1E34] mx-1" />.
                </div>
              </li>
            </ol>
            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full mt-5 py-2.5 bg-gradient-to-r from-[#2D8D84] to-[#247D75] hover:from-[#195C56] hover:to-[#2D8D84] text-white font-bold text-xs rounded-2xl transition-all shadow-md shadow-[#2D8D84]/20"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
}
