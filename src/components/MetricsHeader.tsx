/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Liquid Glass Navigation & Mission Header HUD
 * Clean, user-friendly, and accessible to anyone with specular frosted glass effects.
 */

import React, { useState } from 'react';
import { Shield, Users, LifeBuoy, Home, Zap, FileText, AlertTriangle, RefreshCw, HelpCircle, CheckCircle, Info } from 'lucide-react';
import { DisasterState } from '../types/disaster';

interface MetricsHeaderProps {
  state: DisasterState;
  onOpenHitl: () => void;
  onOpenDocs: () => void;
  onReset: () => void;
}

export const MetricsHeader: React.FC<MetricsHeaderProps> = ({
  state,
  onOpenHitl,
  onOpenDocs,
  onReset
}) => {
  const [showHelpModal, setShowHelpModal] = useState(false);

  const totalVictims = state.incidents.reduce((sum, i) => sum + i.peopleAffected, 0);
  const rescuedVictims = state.incidents
    .filter(i => i.status === 'RESCUED' || i.status === 'EN_ROUTE')
    .reduce((sum, i) => sum + i.peopleAffected, 0);

  const activeResourcesCount = state.resources.filter(
    r => r.status === 'DISPATCHED' || r.status === 'EN_ROUTE' || r.status === 'ON_SCENE'
  ).length;

  const totalShelterCap = state.shelters.reduce((sum, s) => sum + s.maxCapacity, 0);
  const totalShelterOcc = state.shelters.reduce((sum, s) => sum + s.currentOccupancy, 0);
  const shelterOccupancyPct = Math.round((totalShelterOcc / totalShelterCap) * 100);

  return (
    <>
      <header className="liquid-glass rounded-2xl mx-3 mt-3 px-4 py-3 text-slate-100 shadow-2xl relative z-40 transition-all">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Brand & Project Identity */}
          <div className="flex items-center gap-3">
            <div className="relative p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-sky-500/10 to-indigo-500/20 border border-cyan-400/30 text-cyan-300 shadow-lg shadow-cyan-950/40">
              <Shield className="w-5 h-5 text-cyan-300 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900 animate-ping"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-2">
                  <span>Suraksha AI</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-bold">
                    सुरक्षा
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-200 border border-cyan-400/30 font-semibold tracking-wide">
                    AI Rescue Swarm
                  </span>
                </h1>
                <div className="hidden md:flex items-center gap-1.5 text-[10px]">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 font-semibold">
                    SDG 11 Sustainable Cities
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 font-semibold">
                    SDG 13 Climate Action
                  </span>
                </div>
              </div>
              <div className="text-xs text-slate-300 flex items-center gap-1.5">
                <span>Flood Coordination</span>
                <span className="text-slate-500">•</span>
                <span className="text-cyan-300 font-medium">Guwahati, Assam, India</span>
              </div>
            </div>
          </div>

          {/* Simple, Easy-to-Understand Vital Counters (Liquid Glass Cards) */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            {/* Citizens Rescued / In Progress */}
            <div className="liquid-glass-pill px-3.5 py-1.5 rounded-xl flex items-center gap-2.5">
              <Users className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">People Rescued</div>
                <div className="font-bold text-slate-100 flex items-center gap-1">
                  <span className="text-emerald-400 text-sm">{rescuedVictims}</span>
                  <span className="text-slate-400 font-normal">/ {totalVictims} reported</span>
                </div>
              </div>
            </div>

            {/* Active Response Teams */}
            <div className="liquid-glass-pill px-3.5 py-1.5 rounded-xl flex items-center gap-2.5">
              <LifeBuoy className="w-4 h-4 text-sky-400 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">Rescue Teams</div>
                <div className="font-bold text-slate-100">
                  <span className="text-sky-300 text-sm">{activeResourcesCount}</span>
                  <span className="text-slate-400 font-normal"> of {state.resources.length} deployed</span>
                </div>
              </div>
            </div>

            {/* Relief Camps Capacity */}
            <div className="liquid-glass-pill px-3.5 py-1.5 rounded-xl flex items-center gap-2.5">
              <Home className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">Relief Camps</div>
                <div className="font-bold text-slate-100">
                  <span className={shelterOccupancyPct > 80 ? 'text-amber-400' : 'text-emerald-400'}>
                    {shelterOccupancyPct}%
                  </span>
                  <span className="text-slate-400 font-normal text-[11px] ml-1">({totalShelterOcc}/{totalShelterCap})</span>
                </div>
              </div>
            </div>

            {/* AI Speed */}
            <div className="liquid-glass-pill px-3 py-1.5 rounded-xl hidden lg:flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-300 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">AI Replan Time</div>
                <div className="font-bold text-amber-300 text-xs">
                  18 ms <span className="text-slate-400 font-normal text-[10px]">(vs 45 min manual)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons & Help */}
          <div className="flex items-center gap-2">
            {/* High-Risk Commander Action Alert */}
            {state.pendingHitlPlans.length > 0 && (
              <button
                onClick={onOpenHitl}
                className="px-3.5 py-1.5 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-950/60 animate-bounce flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>{state.pendingHitlPlans.length} Approval Needed</span>
              </button>
            )}

            {/* Easy-to-understand "How This Works" Explainer */}
            <button
              onClick={() => setShowHelpModal(true)}
              className="liquid-glass-interactive px-3 py-1.5 text-cyan-200 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              title="How this application works"
            >
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">How It Works</span>
            </button>

            {/* Hackathon Docs */}
            <button
              onClick={onOpenDocs}
              className="liquid-glass-interactive px-3 py-1.5 text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline">Hackathon Dossier</span>
            </button>

            {/* Reset */}
            <button
              onClick={onReset}
              title="Reset Simulation"
              className="liquid-glass-interactive p-2 text-slate-300 hover:text-white rounded-xl cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Simple "How It Works" Liquid Glass Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="liquid-glass-card rounded-3xl max-w-xl w-full p-6 text-slate-100 space-y-5 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">How Suraksha Works (Simple Guide)</h3>
                  <p className="text-xs text-slate-400">Autonomous Flood Rescue Coordination in 4 Easy Steps</p>
                </div>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="liquid-glass-interactive px-2.5 py-1 rounded-lg text-xs text-slate-300 hover:text-white"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-300 flex items-center justify-center font-bold shrink-0">
                  1
                </div>
                <div>
                  <div className="font-bold text-sky-200 text-sm">Hear the SOS Distress Calls</div>
                  <p className="text-slate-300 mt-0.5">
                    When someone calls for help in Hindi, English, or Assamese (e.g., trapped on a roof near Pandu temple), the AI understands the urgency and how many people are in danger.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold shrink-0">
                  2
                </div>
                <div>
                  <div className="font-bold text-indigo-200 text-sm">Send the Best Rescue Team & Book Shelter</div>
                  <p className="text-slate-300 mt-0.5">
                    The AI automatically pairs the incident with the best available team (NDRF boat for deep water, Army carrier for school kids, ambulance for injuries) and books beds at the nearest dry relief camp.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold shrink-0">
                  3
                </div>
                <div>
                  <div className="font-bold text-amber-200 text-sm">Self-Heal When Roads or Boats Break</div>
                  <p className="text-slate-300 mt-0.5">
                    If a bridge collapses (click the chaos buttons to test!), standard systems freeze. Suraksha reroutes in <b>18 milliseconds</b> along safe dry roads without stopping.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center font-bold shrink-0">
                  4
                </div>
                <div>
                  <div className="font-bold text-rose-200 text-sm">Human Commander 1-Click Sign-off</div>
                  <p className="text-slate-300 mt-0.5">
                    For big detours, the AI pauses and asks the human incident commander to confirm with one click, showing exactly why the route changed.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => setShowHelpModal(false)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg cursor-pointer transition-all"
              >
                Got It, Let's Explore!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
