/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Liquid Glass Live SOS Distress Call Ingestion Panel
 * Intuitive, accessible emergency report intake with AI triage.
 */

import React, { useState } from 'react';
import { Radio, Send, Sparkles, MapPin, Mic, Volume2 } from 'lucide-react';
import { GeoLocation } from '../types/disaster';

interface SOSIngestionPanelProps {
  onIngest: (rawText: string, location: GeoLocation) => void;
  isProcessing: boolean;
}

const PRESET_CALLS = [
  {
    title: 'Pandu Temple Rooftop (Hindi/Eng)',
    badge: '14 trapped • Urgent',
    landmark: 'Pandu Temple Riverside colony',
    lat: 26.1580,
    lng: 91.6890,
    text: 'URGENT MADAD: Brahmaputra flood wall toot gaya hai! Pandu mandir ke paas 14 log chhat par hain, 2 buzurg mahilayein behosh hain hypothermia se, paani 7 feet pahunch gaya hai!'
  },
  {
    title: 'Deepor Beel School (English)',
    badge: '22 children • Trapped',
    landmark: 'Deepor Beel High School',
    lat: 26.1240,
    lng: 91.6520,
    text: 'Emergency SOS: Deepor Beel embankment breached. 22 primary school students and 3 teachers marooned on roof terrace. Need immediate amphibious extraction and dry food rations.'
  },
  {
    title: 'Kharghuli Landslide (Medical)',
    badge: '5 injured • Trauma',
    landmark: 'Kharghuli Hillside Sector 3',
    lat: 26.1950,
    lng: 91.7760,
    text: 'Heavy landslide collapsed retaining wall onto 2 houses. 5 victims buried with spine and head injuries, requiring immediate ALS stretcher transport to GMCH trauma wing.'
  },
  {
    title: 'Pandu Sector Dense Cluster',
    badge: 'Cluster demo • 11 pax',
    landmark: 'Pandu Ghat Ferry Approach',
    lat: 26.1588,
    lng: 91.6902,
    text: 'Flash surge at Pandu Ferry approach: 3 families (11 pax) stranded on tin roofs, current 3.1 m/s, requiring rapid inflatable boat evacuation.'
  }
];

export const SOSIngestionPanel: React.FC<SOSIngestionPanelProps> = ({ onIngest, isProcessing }) => {
  const [inputText, setInputText] = useState(PRESET_CALLS[0].text);
  const [selectedLandmark, setSelectedLandmark] = useState(PRESET_CALLS[0].landmark);
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number }>({
    lat: PRESET_CALLS[0].lat,
    lng: PRESET_CALLS[0].lng
  });
  const [isAiTriaging, setIsAiTriaging] = useState(false);

  const handleSelectPreset = (preset: typeof PRESET_CALLS[0]) => {
    setInputText(preset.text);
    setSelectedLandmark(preset.landmark);
    setSelectedCoords({ lat: preset.lat, lng: preset.lng });
  };

  const handleIngest = async () => {
    if (!inputText.trim()) return;
    setIsAiTriaging(true);
    try {
      onIngest(inputText, {
        lat: selectedCoords.lat,
        lng: selectedCoords.lng,
        landmark: selectedLandmark
      });
    } finally {
      setIsAiTriaging(false);
    }
  };

  return (
    <div className="liquid-glass-card rounded-2xl p-4 shadow-xl text-slate-100 space-y-3 relative overflow-hidden">
      {/* Background Refraction */}
      <div className="absolute -top-10 -left-10 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-400/30">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>REPORT AN EMERGENCY / SOS DISPATCH</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Type or select an SOS distress call in English, Hindi, or local language.
            </p>
          </div>
        </div>

        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/10 text-cyan-200 border border-white/15 font-medium hidden sm:inline">
          AI Multilingual Voice/Text
        </span>
      </div>

      {/* Preset Emergency Scenarios (Clickable Glass Cards) */}
      <div className="space-y-1.5">
        <label className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block">
          Click A Real Emergency Scenario To Test:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PRESET_CALLS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectPreset(p)}
              className="liquid-glass-interactive p-2.5 rounded-xl text-left transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white group-hover:text-cyan-300 truncate">
                  {p.title}
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-500/15 text-cyan-200 border border-cyan-400/20 font-semibold">
                  {p.badge}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 truncate mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                <span>{p.landmark}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Input Message Area */}
      <div className="space-y-1">
        <textarea
          rows={3}
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder="Describe emergency or paste incoming SOS distress call..."
          className="w-full bg-black/25 backdrop-blur-md border border-white/15 rounded-xl p-3 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-400 leading-relaxed font-sans shadow-inner"
        />
      </div>

      {/* Bottom Bar: Landmark Coordinates & Action */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-2 text-xs text-slate-300 bg-white/5 px-2.5 py-1 rounded-xl border border-white/10">
          <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="font-semibold text-white truncate max-w-[180px] sm:max-w-xs">{selectedLandmark}</span>
          <span className="text-[10px] text-slate-400">
            ({selectedCoords.lat.toFixed(4)}°, {selectedCoords.lng.toFixed(4)}°)
          </span>
        </div>

        <button
          disabled={isProcessing || isAiTriaging || !inputText.trim()}
          onClick={handleIngest}
          className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 via-cyan-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/50 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 hover:scale-105"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
          <span>{isAiTriaging ? 'AI Triaging...' : 'Submit SOS & Dispatch Help'}</span>
        </button>
      </div>
    </div>
  );
};
