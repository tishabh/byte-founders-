/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Liquid Glass Chaos & Disruption Test Panel
 * Clean, crystal-clear buttons designed so ANYONE (judges or general public) can test autonomous replanning.
 */

import React, { useState } from 'react';
import { AlertTriangle, Zap, Flame, Anchor, Home, Waves, Play, Sparkles } from 'lucide-react';

interface DisruptionInjectorProps {
  onInject: (type: 'BRIDGE_COLLAPSE' | 'BOAT_FAILURE' | 'SHELTER_OVERFLOW' | 'SURGE_RISING', targetId?: string) => void;
  isProcessing: boolean;
  activeDisruptionCount: number;
}

export const DisruptionInjector: React.FC<DisruptionInjectorProps> = ({
  onInject,
  isProcessing,
  activeDisruptionCount
}) => {
  const [selectedDisruption, setSelectedDisruption] = useState<'BRIDGE_COLLAPSE' | 'BOAT_FAILURE' | 'SHELTER_OVERFLOW' | 'SURGE_RISING'>('BRIDGE_COLLAPSE');

  return (
    <div className="liquid-glass-card rounded-2xl p-4 shadow-xl text-slate-100 relative overflow-hidden transition-all">
      {/* Background Refraction Orbs */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-rose-500/20 border border-amber-400/30 text-amber-300">
            <Flame className="w-4 h-4 animate-bounce" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>TEST THE AI: INJECT REAL-LIFE DISRUPTIONS</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-cyan-200 border border-white/15">
                1-Click Interactive
              </span>
            </div>
            <div className="text-[11px] text-slate-300">
              Click any button below to break a bridge or vehicle, and watch the AI instantly self-heal the route!
            </div>
          </div>
        </div>

        <div className="text-right hidden sm:block">
          <div className="text-[10px] text-slate-400 font-semibold uppercase">Hazards In Play</div>
          <div className="text-xs font-bold text-amber-300">{activeDisruptionCount} Active</div>
        </div>
      </div>

      {/* 4 Easy-To-Understand Test Buttons (Liquid Glass Interactive) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3">
        {/* Test 1: Saraighat Bridge */}
        <button
          disabled={isProcessing}
          onClick={() => onInject('BRIDGE_COLLAPSE', 'ROAD_SARAIGHAT_BRIDGE')}
          className="liquid-glass-interactive p-3 rounded-2xl text-left group cursor-pointer disabled:opacity-50 flex items-start gap-3 border border-red-500/30 hover:border-red-400/60 hover:bg-red-500/10"
        >
          <div className="p-2 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30 shrink-0 group-hover:scale-110 transition-transform">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-red-200 group-hover:text-white flex items-center gap-1.5">
              <span>💥 Saraighat Bridge Flooded</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-red-500/20 text-red-200 rounded-full border border-red-500/30">NH 27</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Cuts off main highway bridge. The AI detects the blockage and automatically routes boats via the safe Southern bypass.
            </p>
          </div>
        </button>

        {/* Test 2: Boat Engine Failure */}
        <button
          disabled={isProcessing}
          onClick={() => onInject('BOAT_FAILURE', 'RES_NDRF_B2')}
          className="liquid-glass-interactive p-3 rounded-2xl text-left group cursor-pointer disabled:opacity-50 flex items-start gap-3 border border-amber-500/30 hover:border-amber-400/60 hover:bg-amber-500/10"
        >
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0 group-hover:scale-110 transition-transform">
            <Anchor className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-amber-200 group-hover:text-white flex items-center gap-1.5">
              <span>⚙️ Rescue Boat Engine Stalls</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-amber-500/20 text-amber-200 rounded-full border border-amber-500/30">NDRF-B2</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Boat engine stalls in deep current. The AI instantly hot-swaps to an Indian Army amphibious carrier to rescue trapped victims.
            </p>
          </div>
        </button>

        {/* Test 3: Shelter Full */}
        <button
          disabled={isProcessing}
          onClick={() => onInject('SHELTER_OVERFLOW', 'SHELTER_IITG')}
          className="liquid-glass-interactive p-3 rounded-2xl text-left group cursor-pointer disabled:opacity-50 flex items-start gap-3 border border-blue-500/30 hover:border-blue-400/60 hover:bg-blue-500/10"
        >
          <div className="p-2 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30 shrink-0 group-hover:scale-110 transition-transform">
            <Home className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-blue-200 group-hover:text-white flex items-center gap-1.5">
              <span>🛑 Relief Camp Reaches 100%</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-blue-500/20 text-blue-200 rounded-full border border-blue-500/30">IIT Guwahati</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Camp reaches 350 max capacity. The AI immediately redirects upcoming evacuees to Cotton University camp.
            </p>
          </div>
        </button>

        {/* Test 4: River Surge */}
        <button
          disabled={isProcessing}
          onClick={() => onInject('SURGE_RISING')}
          className="liquid-glass-interactive p-3 rounded-2xl text-left group cursor-pointer disabled:opacity-50 flex items-start gap-3 border border-cyan-500/30 hover:border-cyan-400/60 hover:bg-cyan-500/10"
        >
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shrink-0 group-hover:scale-110 transition-transform">
            <Waves className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-cyan-200 group-hover:text-white flex items-center gap-1.5">
              <span>🌊 Flash Flood Water Surge (+1.2m)</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-cyan-500/20 text-cyan-200 rounded-full border border-cyan-500/30">River Mark</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              River surpasses danger mark. The AI re-prioritizes all low-lying riverside alerts directly to CRITICAL status.
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};
