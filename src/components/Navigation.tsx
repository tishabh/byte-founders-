/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Liquid Glass Multi-Page Navigation Bar
 * Enhanced with 3D Tactical Rescue Command and Citizen AI Lifeline Chat
 */

import React from 'react';
import {
  Map,
  Zap,
  Cpu,
  Radio,
  Shield,
  FileText,
  AlertTriangle,
  Home,
  RefreshCw,
  Box,
  MessageSquareText,
  Sparkles
} from 'lucide-react';

export type PageId = 'MAP' | 'THREED' | 'CHAT' | 'SIMULATOR' | 'SWARM' | 'SOS' | 'RESOURCES' | 'DOSSIER';

interface NavigationProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  pendingHitlCount: number;
  onOpenHitl: () => void;
  onReset: () => void;
}

const NAV_ITEMS: {
  id: PageId;
  label: string;
  hindiSub?: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
}[] = [
  { id: 'MAP', label: 'Live GIS Map', hindiSub: 'नक्शा', icon: Map },
  { id: 'THREED', label: '3D Rescue Deck', hindiSub: '3D दृश्य', icon: Box, highlight: true },
  { id: 'CHAT', label: 'Citizen AI Lifeline', hindiSub: 'नागरिक सहायता', icon: MessageSquareText, highlight: true },
  { id: 'SIMULATOR', label: 'Chaos Simulator', hindiSub: 'सिम्युलेटर', icon: Zap },
  { id: 'SWARM', label: 'AI Swarm Stream', hindiSub: 'एजेंट स्ट्रीम', icon: Cpu },
  { id: 'SOS', label: 'SOS Center', hindiSub: 'आपातकालीन', icon: Radio },
  { id: 'RESOURCES', label: 'Camps & Fleet', hindiSub: 'राहत शिविर', icon: Home },
  { id: 'DOSSIER', label: 'Hackathon Dossier', hindiSub: 'दस्तावेज़', icon: FileText }
];

export const Navigation: React.FC<NavigationProps> = ({
  currentPage,
  onNavigate,
  pendingHitlCount,
  onOpenHitl,
  onReset
}) => {
  return (
    <nav className="glass-gradient-border rounded-2xl mx-3 mt-2 px-3 py-2 flex flex-wrap items-center justify-between gap-2 shadow-2xl relative z-40">
      {/* Brand logo & tagline */}
      <div
        className="flex items-center gap-2.5 pl-1 cursor-pointer transition-transform hover:scale-[1.02]"
        onClick={() => onNavigate('MAP')}
      >
        <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500/30 via-sky-500/25 to-indigo-500/25 border border-cyan-400/40 text-cyan-300 shadow-lg shadow-cyan-950/40">
          <Shield className="w-4 h-4 text-cyan-300" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-white text-sm tracking-tight">Suraksha AI</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-bold">
              सुरक्षा
            </span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-200 border border-cyan-400/30 font-semibold flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-cyan-300" />
              SDG 11 & 13
            </span>
          </div>
          <div className="text-[10px] text-slate-400">Guwahati, Assam • India Flood Swarm</div>
        </div>
      </div>

      {/* Main Multi-Page Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white shadow-lg shadow-cyan-950/60 border border-white/30 scale-[1.02]'
                  : item.highlight
                  ? 'liquid-glass-interactive text-cyan-300 hover:text-white border-cyan-500/30'
                  : 'liquid-glass-interactive text-slate-300 hover:text-white'
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 ${
                  isActive ? 'text-white' : item.highlight ? 'text-cyan-400' : 'text-slate-400'
                }`}
              />
              <div className="flex flex-col text-left leading-tight">
                <span>{item.label}</span>
                {item.hindiSub && (
                  <span
                    className={`text-[9px] font-normal ${
                      isActive ? 'text-cyan-100' : 'text-slate-500'
                    }`}
                  >
                    {item.hindiSub}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Global Action Badges */}
      <div className="flex items-center gap-2">
        {pendingHitlCount > 0 && (
          <button
            onClick={onOpenHitl}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white text-xs font-bold shadow-lg shadow-rose-950/60 animate-bounce flex items-center gap-1.5 cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{pendingHitlCount} Action Pending</span>
          </button>
        )}

        <button
          onClick={onReset}
          title="Reset All Simulation States"
          className="liquid-glass-interactive p-2 text-slate-300 hover:text-white rounded-xl cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </nav>
  );
};
