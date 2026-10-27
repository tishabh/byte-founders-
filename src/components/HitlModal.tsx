/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Liquid Glass Incident Commander Authorization Modal (HITL Gate)
 * Crystal clear Plan Diff, human-friendly reasoning, and 1-click execution.
 */

import React from 'react';
import { PlanDiff } from '../types/disaster';
import { ShieldAlert, CheckCircle2, XCircle, ArrowRight, Clock, ShieldCheck, AlertTriangle } from 'lucide-react';

interface HitlModalProps {
  plans: PlanDiff[];
  onApprove: (planId: string) => void;
  onReject: (planId: string) => void;
  onClose: () => void;
}

export const HitlModal: React.FC<HitlModalProps> = ({ plans, onApprove, onReject, onClose }) => {
  if (plans.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="liquid-glass-card rounded-3xl max-w-2xl w-full p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto space-y-5 border border-white/20 relative overflow-hidden">
        {/* Glow Refraction */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide">
                  COMMANDER AUTHORIZATION REQUIRED
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/25 text-rose-200 border border-rose-400/40">
                  {plans.length} Action Pending
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                The AI swarm safely rerouted a team around floodwaters. Please review and confirm the new route.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="liquid-glass-interactive text-slate-300 hover:text-white text-xs px-3 py-1.5 rounded-xl cursor-pointer"
          >
            Dismiss
          </button>
        </div>

        {/* List of Pending Plans */}
        {plans.map(plan => {
          const etaDiff = plan.newEtaMinutes - plan.oldEtaMinutes;
          return (
            <div
              key={plan.id}
              className="liquid-glass p-4 rounded-2xl space-y-4 shadow-lg border border-white/15"
            >
              {/* Trigger alert */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>EMERGENCY CAUSE: {plan.triggerEvent}</span>
                </div>
                <span className="text-[10px] text-slate-400">Plan ID: #{plan.id.slice(-6)}</span>
              </div>

              {/* Easy-To-Understand Before vs After Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Original Plan */}
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5 opacity-80">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Original Route (Blocked)</div>
                  <div className="text-slate-200 font-semibold truncate">Asset: {plan.oldResourceId || 'Primary Assigned Team'}</div>
                  <div className="flex items-center gap-1.5 text-slate-300 text-xs">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>ETA: <b>{plan.oldEtaMinutes} mins</b></span>
                  </div>
                  <div className="text-[11px] text-slate-400">Direct Saraighat Corridor (Flooded)</div>
                </div>

                {/* AI Proposed Safe Route */}
                <div className="p-3.5 rounded-xl bg-cyan-500/15 border border-cyan-400/40 space-y-1.5 shadow-sm">
                  <div className="text-[10px] uppercase font-bold text-cyan-300 flex items-center justify-between">
                    <span>AI Safe Bypass Route</span>
                    <span className="text-[9px] px-2 py-0.2 rounded-full bg-cyan-500/30 text-white font-bold">RECOMMENDED</span>
                  </div>
                  <div className="text-white font-semibold truncate">Asset: {plan.newResourceId}</div>
                  <div className="flex items-center gap-1.5 text-cyan-200 text-xs">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>
                      ETA: <b className="text-white">{plan.newEtaMinutes} mins</b>{' '}
                      <span className={etaDiff > 0 ? 'text-amber-300' : 'text-emerald-300'}>
                        ({etaDiff > 0 ? `+${etaDiff}` : etaDiff} min detour)
                      </span>
                    </span>
                  </div>
                  <div className="text-[11px] text-cyan-100">Safe Highway Flyover Bypass (Above Flood)</div>
                </div>
              </div>

              {/* Safety & Survival Indicators */}
              <div className="grid grid-cols-2 gap-2.5 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-[10px] text-slate-300 uppercase font-semibold">Route Risk Score</div>
                  <div className="text-base font-bold text-amber-300 mt-0.5">{plan.riskScore} / 100</div>
                  <div className="text-[10px] text-slate-400">Safe clearance from raging water</div>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-[10px] text-slate-300 uppercase font-semibold">Survival Probability</div>
                  <div className="text-base font-bold text-emerald-400 mt-0.5">{plan.casualtyMitigationProb}%</div>
                  <div className="text-[10px] text-slate-400">High confidence rescue vector</div>
                </div>
              </div>

              {/* AI Explanation in plain English */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200 leading-relaxed">
                <span className="text-rose-300 font-bold uppercase text-[10px] block mb-1">
                  Why the AI needs your confirmation:
                </span>
                "{plan.commanderReasoning}"
              </div>

              {/* 1-Click Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
                <button
                  onClick={() => onReject(plan.id)}
                  className="liquid-glass-interactive px-4 py-2 rounded-xl text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <XCircle className="w-4 h-4 text-slate-400" />
                  <span>Reject & Hold</span>
                </button>

                <button
                  onClick={() => onApprove(plan.id)}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/60 transition-all flex items-center gap-2 cursor-pointer hover:scale-105"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Authorize & Dispatch Safe Route</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
