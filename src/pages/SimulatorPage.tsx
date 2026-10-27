/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Page 2: Disruption & Chaos Simulator Laboratory (Judge Evaluation Suite)
 */

import React, { useState } from 'react';
import { DisasterState, PlanDiff } from '../types/disaster';
import { DisruptionInjector } from '../components/DisruptionInjector';
import { AlertTriangle, ShieldAlert, CheckCircle2, XCircle, ArrowRight, Clock, Zap, Layers, Activity } from 'lucide-react';

interface SimulatorPageProps {
  state: DisasterState;
  onInject: (type: 'BRIDGE_COLLAPSE' | 'BOAT_FAILURE' | 'SHELTER_OVERFLOW' | 'SURGE_RISING', targetId?: string) => void;
  onApprovePlan: (planId: string) => void;
  onRejectPlan: (planId: string) => void;
  isProcessing: boolean;
  onNavigateToMap: () => void;
}

export const SimulatorPage: React.FC<SimulatorPageProps> = ({
  state,
  onInject,
  onApprovePlan,
  onRejectPlan,
  isProcessing,
  onNavigateToMap
}) => {
  return (
    <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto max-w-7xl mx-auto w-full">
      {/* Page Title & Mission Context */}
      <div className="liquid-glass-card rounded-3xl p-5 shadow-xl space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-400/30">
              <Zap className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  CHAOS & DISRUPTION SIMULATION LAB
                </h2>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/30 font-semibold">
                  Judges Evaluation Tool
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Test the autonomous self-healing capabilities of the multi-agent swarm by injecting real-world infrastructure failures.
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateToMap}
            className="liquid-glass-interactive px-4 py-2 rounded-xl text-xs font-semibold text-cyan-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
          >
            <span>View Affected Roads on Map →</span>
          </button>
        </div>
      </div>

      {/* Disruption Injection Controls */}
      <DisruptionInjector
        onInject={onInject}
        isProcessing={isProcessing}
        activeDisruptionCount={state.activeDisruptionCount}
      />

      {/* Pending Commander Authorization Queue (If Any) */}
      {state.pendingHitlPlans.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-rose-300">
            <ShieldAlert className="w-5 h-5 text-rose-400 animate-pulse" />
            <span>PENDING COMMANDER AUTHORIZATION QUEUE ({state.pendingHitlPlans.length})</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {state.pendingHitlPlans.map(plan => {
              const etaDiff = plan.newEtaMinutes - plan.oldEtaMinutes;
              return (
                <div
                  key={plan.id}
                  className="liquid-glass-card rounded-3xl p-5 space-y-4 border border-rose-500/40 shadow-xl"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span>{plan.triggerEvent}</span>
                    </span>
                    <span className="text-[10px] text-slate-400">Plan #{plan.id.slice(-5)}</span>
                  </div>

                  {/* Plan Diff Comparison */}
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Original (Severed)</div>
                      <div className="text-slate-200 font-semibold truncate">{plan.oldResourceId || 'Direct Corridor'}</div>
                      <div className="text-slate-400 text-xs">ETA: {plan.oldEtaMinutes}m</div>
                    </div>

                    <div className="p-3 rounded-2xl bg-cyan-500/15 border border-cyan-400/40 space-y-1">
                      <div className="text-[10px] uppercase font-bold text-cyan-300">AI Re-Route Bypass</div>
                      <div className="text-white font-semibold truncate">{plan.newResourceId}</div>
                      <div className="text-cyan-200 text-xs">
                        ETA: {plan.newEtaMinutes}m <span className="text-amber-300">(+{etaDiff}m detour)</span>
                      </div>
                    </div>
                  </div>

                  {/* Risk & Casualty Scores */}
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-[10px] text-slate-300">Risk Score</div>
                      <div className="text-sm font-bold text-amber-300">{plan.riskScore} / 100</div>
                    </div>
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-[10px] text-slate-300">Survival Probability</div>
                      <div className="text-sm font-bold text-emerald-400">{plan.casualtyMitigationProb}%</div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-200 bg-white/5 p-2.5 rounded-xl border border-white/5 leading-relaxed">
                    "{plan.commanderReasoning}"
                  </p>

                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-white/10">
                    <button
                      onClick={() => onRejectPlan(plan.id)}
                      className="liquid-glass-interactive px-3 py-1.5 rounded-xl text-xs text-slate-300 hover:text-white"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => onApprovePlan(plan.id)}
                      className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-md"
                    >
                      Approve & Dispatch
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Disruption History / Resolution Audit Trail */}
      <div className="liquid-glass-card rounded-3xl p-5 space-y-3 shadow-xl">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span>Active Road Hazards & Edge Integrity</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {state.roadNetwork.map(road => {
            const isCollapsed = road.status === 'BRIDGE_COLLAPSED';
            return (
              <div
                key={road.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isCollapsed
                    ? 'bg-red-500/15 border-red-500/40 text-red-100 shadow-md'
                    : 'bg-white/5 border-white/10 text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="truncate">{road.fromName}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${isCollapsed ? 'bg-red-500/30 text-red-200 border border-red-400/40' : 'bg-emerald-500/20 text-emerald-300'}`}>
                    {road.status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">To: {road.toName} ({road.distanceKm} km)</div>
                <div className="text-[11px] mt-1">Inundation: <b>{road.floodDepthCm} cm</b></div>
                {isCollapsed && (
                  <div className="text-[10px] text-red-300 font-semibold mt-1">
                    ⚠️ Swarm actively bypassing via Basistha corridor
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
