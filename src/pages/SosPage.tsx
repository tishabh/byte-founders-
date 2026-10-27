/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Page 4: SOS Dispatch & Citizen Ingestion Center
 */

import React, { useState } from 'react';
import { DisasterState, Incident, GeoLocation } from '../types/disaster';
import { SOSIngestionPanel } from '../components/SOSIngestionPanel';
import { Radio, Users, MapPin, AlertCircle, CheckCircle2, ShieldAlert, Sparkles, Filter } from 'lucide-react';

interface SosPageProps {
  state: DisasterState;
  onIngest: (rawText: string, location: GeoLocation) => void;
  onMarkRescued: (incidentId: string) => void;
  isProcessing: boolean;
}

export const SosPage: React.FC<SosPageProps> = ({
  state,
  onIngest,
  onMarkRescued,
  isProcessing
}) => {
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'ACTIVE' | 'RESCUED'>('ALL');

  const filteredIncidents = state.incidents.filter(inc => {
    if (filter === 'CRITICAL') return inc.urgency === 'CRITICAL';
    if (filter === 'ACTIVE') return inc.status !== 'RESCUED';
    if (filter === 'RESCUED') return inc.status === 'RESCUED';
    return true;
  });

  return (
    <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="liquid-glass-card rounded-3xl p-5 shadow-xl space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-sky-500/20 text-sky-300 border border-sky-400/30">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  SOS DISPATCH & CITIZEN INGESTION CENTER
                </h2>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-200 border border-sky-400/30 font-semibold">
                  Multi-Lingual AI Triage
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Incoming distress calls are transcribed, parsed with Gemini AI, and routed to the nearest available rescue unit.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <div className="liquid-glass-pill px-3 py-1.5 rounded-xl">
              Total Incidents: <b className="text-white">{state.incidents.length}</b>
            </div>
            <div className="liquid-glass-pill px-3 py-1.5 rounded-xl">
              Critical: <b className="text-red-400">{state.incidents.filter(i => i.urgency === 'CRITICAL').length}</b>
            </div>
          </div>
        </div>
      </div>

      {/* SOS Ingestion Input Component */}
      <SOSIngestionPanel onIngest={onIngest} isProcessing={isProcessing} />

      {/* Reported Incidents Master Table */}
      <div className="liquid-glass-card rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Live Emergency Incidents & Field Triage</h3>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${filter === 'ALL' ? 'bg-white/20 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              All ({state.incidents.length})
            </button>
            <button
              onClick={() => setFilter('CRITICAL')}
              className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${filter === 'CRITICAL' ? 'bg-red-500/20 text-red-300 font-bold border border-red-500/30' : 'text-slate-400 hover:text-white'}`}
            >
              Critical
            </button>
            <button
              onClick={() => setFilter('ACTIVE')}
              className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${filter === 'ACTIVE' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30' : 'text-slate-400 hover:text-white'}`}
            >
              In Progress
            </button>
            <button
              onClick={() => setFilter('RESCUED')}
              className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${filter === 'RESCUED' ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30' : 'text-slate-400 hover:text-white'}`}
            >
              Rescued
            </button>
          </div>
        </div>

        {/* List of Incidents */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {filteredIncidents.map(inc => {
            const isCritical = inc.urgency === 'CRITICAL';
            const isRescued = inc.status === 'RESCUED';

            return (
              <div
                key={inc.id}
                className={`p-4 rounded-2xl border space-y-2.5 transition-all ${
                  isRescued
                    ? 'bg-emerald-500/10 border-emerald-500/30 opacity-75'
                    : isCritical
                    ? 'bg-red-500/10 border-red-500/40 shadow-sm'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">{inc.id}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isCritical ? 'bg-red-500/25 text-red-200 border border-red-400/40' : 'bg-amber-500/25 text-amber-200'
                    }`}>
                      {inc.urgency}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">{inc.timestamp}</span>
                </div>

                <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{inc.location.landmark}</span>
                </div>

                <p className="text-slate-300 text-[11px] leading-relaxed bg-white/5 p-2 rounded-xl">
                  "{inc.sourceText}"
                </p>

                <div className="grid grid-cols-3 gap-1.5 text-center text-[11px] bg-black/20 p-2 rounded-xl">
                  <div>Trapped: <b className="text-white">{inc.peopleAffected}</b></div>
                  <div>Injured: <b className="text-red-400">{inc.injuredCount}</b></div>
                  <div>Water: <b className="text-cyan-400">{inc.waterLevelMeters}m</b></div>
                </div>

                {/* Assigned Resource */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-slate-400">
                    Assigned: <b className="text-cyan-300">{inc.assignedResourceId || 'Matching asset...'}</b>
                  </span>

                  {!isRescued && (
                    <button
                      onClick={() => onMarkRescued(inc.id)}
                      className="px-3 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 text-[11px] font-bold cursor-pointer transition-all"
                    >
                      ✓ Mark Rescued
                    </button>
                  )}
                  {isRescued && (
                    <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Evacuated & Secured</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
