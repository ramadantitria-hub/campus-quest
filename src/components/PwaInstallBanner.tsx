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
      <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-40 bg-slate-900/95 backdrop-blur-md border border-rose-500/30 text-white rounded-2xl p-4 shadow-2xl shadow-rose-950/40 transition-all animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-start gap-3.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icon-192.png"
            alt="CampusQuest UPI App Icon"
            className="w-12 h-12 rounded-2xl shadow-lg border border-rose-500/40 shrink-0 object-cover"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              Install CampusQuest UPI
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 font-mono font-bold">App</span>
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              Pasang ikon di layar utama HP untuk akses instan &amp; pengalaman aplikasi native!
            </p>
            <div className="flex items-center gap-2 mt-2.5">
              <button
                onClick={handleInstallClick}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-rose-900/30"
              >
                <Download className="w-3.5 h-3.5" />
                Pasang ke Layar Utama
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
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS Safari Installation Guide Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 max-w-sm w-full rounded-2xl p-6 text-white shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowIosGuide(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icon-192.png"
                alt="CampusQuest UPI Icon"
                className="w-12 h-12 rounded-2xl border border-rose-500/40 shadow-md object-cover"
              />
              <div>
                <h3 className="text-base font-bold text-white">
                  Pasang ke Layar Utama (iOS)
                </h3>
                <p className="text-[11px] text-slate-400">CampusQuest UPI App</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 mb-4">
              Apple Safari memerlukan 2 langkah mudah agar ikon muncul di Homescreen HP Anda:
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
