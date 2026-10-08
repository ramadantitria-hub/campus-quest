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
      <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-40 bg-slate-900/95 backdrop-blur-md border border-sky-500/30 text-white rounded-2xl p-4 shadow-2xl shadow-sky-500/10 transition-all animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-md shadow-sky-500/25">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
              Install CampusQuest
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono">PWA</span>
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              Pasang di layar utama HP untuk akses kilat &amp; notifikasi quest real-time!
            </p>
            <div className="flex items-center gap-2 mt-2.5">
              <button
                onClick={handleInstallClick}
                className="px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-sky-400/20"
              >
                <Download className="w-3.5 h-3.5" />
                Pasang Sekarang
              </button>
              <button
                onClick={() => setShowBanner(false)}
                className="px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-400 text-xs transition-colors cursor-pointer"
              >
                Nanti Saja
              </button>
            </div>
          </div>
          <button
            onClick={() => setShowBanner(false)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS Safari Installation Guide Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 max-w-sm w-full rounded-2xl p-6 text-white shadow-2xl relative">
            <button
              onClick={() => setShowIosGuide(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-sky-400" />
              Cara Install di iOS (Safari)
            </h3>
            <p className="text-xs text-slate-300 mb-4">
              Apple Safari memerlukan 2 langkah mudah untuk memasang aplikasi ke Home Screen:
            </p>
            <ol className="space-y-3 text-xs text-slate-200">
              <li className="flex items-start gap-2.5 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
                <div className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 font-bold">1</div>
                <div>
                  Ketuk tombol <strong>Share / Bagikan</strong> <Share2 className="w-3.5 h-3.5 inline text-sky-400 mx-1" /> di toolbar bawah Safari.
                </div>
              </li>
              <li className="flex items-start gap-2.5 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
                <div className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 font-bold">2</div>
                <div>
                  Scroll ke bawah lalu pilih <strong>&quot;Tambahkan ke Layar Utama&quot;</strong> (Add to Home Screen) <PlusSquare className="w-3.5 h-3.5 inline text-sky-400 mx-1" />.
                </div>
              </li>
            </ol>
            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full mt-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs rounded-xl transition-colors"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
}
