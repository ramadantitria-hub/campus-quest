'use client';

import React, { useState, useEffect } from 'react';
import { CAMPUS_LANDMARKS } from '@/lib/mock-data';
import { CampusLandmark, Quest } from '@/types/campus-quest';
import {
  MapPin,
  Navigation,
  Compass,
  Footprints,
  Info,
  CheckCircle,
  LocateFixed,
  Layers,
  Sparkles
} from 'lucide-react';

interface CampusMapProps {
  activeQuest?: Quest | null;
  onSelectLandmark?: (landmark: CampusLandmark) => void;
}

export default function CampusMap({ activeQuest, onSelectLandmark }: CampusMapProps) {
  const [selectedLandmark, setSelectedLandmark] = useState<CampusLandmark | null>(null);
  const [userGps, setUserGps] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [runnerAnimOffset, setRunnerAnimOffset] = useState(0);

  // Animate runner along path if quest is on the way or delivering
  useEffect(() => {
    if (!activeQuest || (activeQuest.status !== 'ON_THE_WAY' && activeQuest.status !== 'DELIVERING')) {
      return;
    }
    const interval = setInterval(() => {
      setRunnerAnimOffset((prev) => (prev >= 100 ? 0 : prev + 2));
    }, 200);
    return () => clearInterval(interval);
  }, [activeQuest]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Browser Anda tidak mendukung Geolocation API');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserGps({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
        setGpsLoading(false);
      },
      (err) => {
        setGpsLoading(false);
        alert(`Gagal mengambil koordinat GPS: ${err.message}`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Find landmarks corresponding to active quest
  const originLandmark = CAMPUS_LANDMARKS.find(
    (lm) => lm.name.toLowerCase() === activeQuest?.origin_address.toLowerCase()
  ) || CAMPUS_LANDMARKS[0];

  const destinationLandmark = CAMPUS_LANDMARKS.find(
    (lm) => lm.name.toLowerCase() === activeQuest?.destination_address.toLowerCase()
  ) || CAMPUS_LANDMARKS[4];

  // Interpolated runner position
  const runnerX =
    originLandmark.x + ((destinationLandmark.x - originLandmark.x) * runnerAnimOffset) / 100;
  const runnerY =
    originLandmark.y + ((destinationLandmark.y - originLandmark.y) * runnerAnimOffset) / 100;

  return (
    <div className="bg-white border border-[#E8DFD1] rounded-2xl sm:rounded-3xl overflow-hidden shadow-md relative">
      {/* Map Header Toolbar */}
      <div className="p-3.5 bg-white border-b border-[#E8DFD1] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#FBF0F2] text-[#7A1E34] flex items-center justify-center border border-[#F1CCD3]">
            <Compass className="w-4 h-4 animate-spin" style={{ animationDuration: '20s' }} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#2C2224] flex items-center gap-1.5">
              Radar Wilayah Kampus &amp; Titik Temu
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E8F6F3] text-[#2D8D84] border border-[#A5DDD3] font-mono font-semibold">
                Live Geolocation
              </span>
            </h4>
            <p className="text-[10px] text-[#6E6265]">
              Universitas Pendidikan Indonesia (UPI) • Kampus Bumi Siliwangi
            </p>
          </div>
        </div>

        <button
          onClick={handleGetLocation}
          disabled={gpsLoading}
          className="px-3 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F2EBE0] text-[#7A1E34] text-xs font-semibold flex items-center gap-1.5 border border-[#E8DFD1] transition-colors cursor-pointer"
        >
          <LocateFixed className="w-3.5 h-3.5 text-[#7A1E34]" />
          <span>{gpsLoading ? 'Mendeteksi...' : 'Cek GPS Saya'}</span>
        </button>
      </div>

      {/* Interactive Map Canvas Container */}
      <div className="relative w-full h-80 sm:h-96 bg-[#F5EFE6] overflow-hidden select-none">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#2D8D84 1.5px, transparent 1.5px), radial-gradient(#7A1E34 1.5px, #F5EFE6 1.5px)`,
            backgroundSize: '36px 36px',
            backgroundPosition: '0 0, 18px 18px'
          }}
        />

        {/* Campus Road Network Vector Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" strokeWidth="2">
          <line x1="22%" y1="35%" x2="48%" y2="28%" strokeDasharray="4 4" stroke="#D3C7B6" />
          <line x1="48%" y1="28%" x2="50%" y2="12%" strokeDasharray="4 4" stroke="#D3C7B6" />
          <line x1="48%" y1="28%" x2="78%" y2="38%" strokeDasharray="4 4" stroke="#D3C7B6" />
          <line x1="78%" y1="38%" x2="82%" y2="65%" strokeDasharray="4 4" stroke="#D3C7B6" />
          <line x1="22%" y1="35%" x2="20%" y2="72%" strokeDasharray="4 4" stroke="#D3C7B6" />
          <line x1="20%" y1="72%" x2="38%" y2="78%" strokeDasharray="4 4" stroke="#D3C7B6" />
          <line x1="38%" y1="78%" x2="50%" y2="90%" strokeDasharray="4 4" stroke="#D3C7B6" />
          <line x1="82%" y1="65%" x2="50%" y2="90%" strokeDasharray="4 4" stroke="#D3C7B6" />

          {/* Active Quest Route Line */}
          {activeQuest && (
            <line
              x1={`${originLandmark.x}%`}
              y1={`${originLandmark.y}%`}
              x2={`${destinationLandmark.x}%`}
              y2={`${destinationLandmark.y}%`}
              stroke="#7A1E34"
              strokeWidth="3.5"
              strokeDasharray="6 4"
              className="animate-pulse"
            />
          )}
        </svg>

        {/* Landmarks Markers */}
        {CAMPUS_LANDMARKS.map((landmark) => {
          const isSelected = selectedLandmark?.id === landmark.id;
          const isOrigin = activeQuest?.origin_address === landmark.name;
          const isDestination = activeQuest?.destination_address === landmark.name;

          return (
            <div
              key={landmark.id}
              onClick={() => {
                setSelectedLandmark(landmark);
                if (onSelectLandmark) onSelectLandmark(landmark);
              }}
              style={{ left: `${landmark.x}%`, top: `${landmark.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10"
            >
              <div
                className={`relative flex items-center justify-center rounded-full transition-all duration-300 shadow-md ${
                  isDestination
                    ? 'w-9 h-9 bg-[#7A1E34] text-white shadow-[#7A1E34]/40 scale-110 ring-4 ring-[#7A1E34]/25'
                    : isOrigin
                    ? 'w-9 h-9 bg-[#2D8D84] text-white shadow-[#2D8D84]/40 scale-110 ring-4 ring-[#2D8D84]/25'
                    : isSelected
                    ? 'w-8 h-8 bg-[#7A1E34] text-white shadow-[#7A1E34]/40 ring-2 ring-[#7A1E34]'
                    : 'w-7 h-7 bg-white text-[#6E6265] border border-[#E8DFD1] hover:border-[#2D8D84] hover:text-[#2D8D84]'
                }`}
              >
                <MapPin className="w-4 h-4" />
                {isDestination && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full animate-ping" />
                )}
              </div>

              {/* Landmark Name Label */}
              <div className="absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-lg bg-white/95 border border-[#E8DFD1] text-[10px] font-semibold text-[#2C2224] group-hover:text-[#7A1E34] group-hover:border-[#F1CCD3] transition-colors pointer-events-none shadow-sm">
                {landmark.name}
              </div>
            </div>
          );
        })}

        {/* Animated Runner on Map */}
        {activeQuest && (activeQuest.status === 'ON_THE_WAY' || activeQuest.status === 'DELIVERING') && (
          <div
            style={{ left: `${runnerX}%`, top: `${runnerY}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none transition-all duration-300"
          >
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-[#2D8D84] text-white font-black shadow-lg shadow-[#2D8D84]/40 ring-4 ring-[#2D8D84]/30">
              <Footprints className="w-4 h-4 animate-bounce" />
            </div>
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-0.5 bg-[#2D8D84] text-white text-[9px] font-extrabold rounded-full uppercase tracking-wider shadow">
              Runner Bergerak
            </div>
          </div>
        )}

        {/* Real User GPS Pin if detected */}
        {userGps && (
          <div
            style={{ left: '50%', top: '60%' }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
          >
            <div className="w-5 h-5 rounded-full bg-[#7A1E34] ring-4 ring-[#7A1E34]/30 animate-pulse flex items-center justify-center text-white" />
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 bg-[#7A1E34] text-white text-[9px] font-bold rounded-full shadow">
              GPS Anda ({userGps.lat.toFixed(4)}, {userGps.lng.toFixed(4)})
            </div>
          </div>
        )}
      </div>

      {/* Selected Landmark Detail Card */}
      {selectedLandmark && (
        <div className="p-3 bg-white border-t border-[#E8DFD1] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FBF0F2] text-[#7A1E34] flex items-center justify-center border border-[#F1CCD3]">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-[#2C2224]">{selectedLandmark.name}</p>
              <p className="text-[11px] text-[#6E6265]">{selectedLandmark.description}</p>
            </div>
          </div>
          <button
            onClick={() => setSelectedLandmark(null)}
            className="text-[#6E6265] hover:text-[#2C2224] px-2 py-1 text-xs cursor-pointer font-semibold"
          >
            Tutup
          </button>
        </div>
      )}
    </div>
  );
}
