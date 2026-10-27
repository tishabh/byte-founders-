/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Liquid Glass Live AI Thought Stream & Friendly Agent Workflow
 * Clean, crystal-clear, and accessible for judges, commanders, and general users.
 */

import React, { useState } from 'react';
import { AgentLog } from '../types/disaster';
import { Sparkles, ArrowRight, Activity, Radio, Cpu, Shield, Clock } from 'lucide-react';

interface AgentSwarmStreamProps {
  logs: AgentLog[];
  activeAgentId?: string;
}

export const AgentSwarmStream: React.FC<AgentSwarmStreamProps> = ({ logs, activeAgentId }) => {
  const [filter, setFilter] = useState<'ALL' | 'INGESTION' | 'ALLOCATION' | 'REPLANNING' | 'COMMANDER'>('ALL');

  const filteredLogs = logs.filter(log => {
    if (filter === 'ALL') return true;
    if (filter === 'INGESTION') return log.agentId === 'INGESTION_AGENT';
    if (filter === 'ALLOCATION') return log.agentId === 'ALLOCATION_AGENT';
    if (filter === 'REPLANNING') return log.agentId === 'REPLANNING_AGENT';
    if (filter === 'COMMANDER') return log.agentId === 'COMMANDER_AGENT';
    return true;
  });

  const getAgentBadge = (agentId: string) => {
    switch (agentId) {
      case 'INGESTION_AGENT':
        return <span className="px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-400/30 text-[10px] font-bold">👂 Agent 1 • SOS Triage</span>;
      case 'ALLOCATION_AGENT':
        return <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-400/30 text-[10px] font-bold">🚤 Agent 2 • Dispatcher</span>;
      case 'REPLANNING_AGENT':
        return <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-400/30 text-[10px] font-bold">🔄 Agent 3 • Self-Healing</span>;
      case 'COMMANDER_AGENT':
        return <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-400/30 text-[10px] font-bold">🛡️ Agent 4 • Commander Sign-off</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full bg-white/10 text-slate-300 text-[10px]">AI Swarm</span>;
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'critical':
        return <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-[9px] font-bold">CRITICAL</span>;
      case 'warn':
        return <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-bold">ATTENTION</span>;
      case 'success':
        return <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold">RESOLVED</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full bg-white/10 text-slate-300 text-[9px]">INFO</span>;
    }
  };

  return (
    <div className="liquid-glass-card rounded-2xl flex flex-col h-full shadow-xl overflow-hidden relative">
      {/* 4 Agent Stepper (Easy to understand for anyone) */}
      <div className="p-3 border-b border-white/10 bg-white/[0.02]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>HOW THE 4 RESCUE AGENTS COLLABORATE</span>
          </div>
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Swarm Active
          </span>
        </div>

        {/* Friendly 4-Step Pipeline */}
        <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
          <div className={`p-2 rounded-xl transition-all border ${activeAgentId === 'INGESTION_AGENT' ? 'bg-sky-500/20 border-sky-400/60 shadow-lg shadow-sky-500/20 text-white' : 'bg-white/5 border-white/10 text-slate-300'}`}>
            <div className="text-[10px] uppercase font-bold text-sky-300">1. Hear SOS</div>
            <div className="text-[11px] font-semibold truncate mt-0.5">Triage Calls</div>
          </div>

          <div className={`p-2 rounded-xl transition-all border ${activeAgentId === 'ALLOCATION_AGENT' ? 'bg-indigo-500/20 border-indigo-400/60 shadow-lg shadow-indigo-500/20 text-white' : 'bg-white/5 border-white/10 text-slate-300'}`}>
            <div className="text-[10px] uppercase font-bold text-indigo-300">2. Dispatch</div>
            <div className="text-[11px] font-semibold truncate mt-0.5">Boats & Camps</div>
          </div>

          <div className={`p-2 rounded-xl transition-all border ${activeAgentId === 'REPLANNING_AGENT' ? 'bg-amber-500/20 border-amber-400/60 shadow-lg shadow-amber-500/20 text-white' : 'bg-white/5 border-white/10 text-slate-300'}`}>
            <div className="text-[10px] uppercase font-bold text-amber-300">3. Re-Route</div>
            <div className="text-[11px] font-semibold truncate mt-0.5">Self-Healing</div>
          </div>

          <div className={`p-2 rounded-xl transition-all border ${activeAgentId === 'COMMANDER_AGENT' ? 'bg-rose-500/20 border-rose-400/60 shadow-lg shadow-rose-500/20 text-white' : 'bg-white/5 border-white/10 text-slate-300'}`}>
            <div className="text-[10px] uppercase font-bold text-rose-300">4. Approve</div>
            <div className="text-[11px] font-semibold truncate mt-0.5">Human Gate</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/10 bg-white/[0.02] overflow-x-auto text-xs">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1 rounded-xl transition-all text-xs cursor-pointer ${filter === 'ALL' ? 'bg-white/20 text-white font-bold border border-white/20' : 'text-slate-400 hover:text-white'}`}
        >
          All Activity ({logs.length})
        </button>
        <button
          onClick={() => setFilter('INGESTION')}
          className={`px-2.5 py-1 rounded-xl transition-all text-xs cursor-pointer ${filter === 'INGESTION' ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-400/30' : 'text-slate-400 hover:text-white'}`}
        >
          SOS Triage
        </button>
        <button
          onClick={() => setFilter('ALLOCATION')}
          className={`px-2.5 py-1 rounded-xl transition-all text-xs cursor-pointer ${filter === 'ALLOCATION' ? 'bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-400/30' : 'text-slate-400 hover:text-white'}`}
        >
          Dispatches
        </button>
        <button
          onClick={() => setFilter('REPLANNING')}
          className={`px-2.5 py-1 rounded-xl transition-all text-xs cursor-pointer ${filter === 'REPLANNING' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-400/30' : 'text-slate-400 hover:text-white'}`}
        >
          Re-Routes
        </button>
        <button
          onClick={() => setFilter('COMMANDER')}
          className={`px-2.5 py-1 rounded-xl transition-all text-xs cursor-pointer ${filter === 'COMMANDER' ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-400/30' : 'text-slate-400 hover:text-white'}`}
        >
          Commander
        </button>
      </div>

      {/* Thought Stream List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-400 font-sans">
            No agent actions recorded for this filter.
          </div>
        ) : (
          filteredLogs.map(log => (
            <div
              key={log.id}
              className="liquid-glass-interactive p-3 rounded-2xl space-y-1.5 shadow-sm text-xs"
            >
              {/* Header row */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  {getAgentBadge(log.agentId)}
                  <span className="text-slate-400 text-[10px]">{log.timestamp}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400">⚡ {log.latencyMs}ms</span>
                  {getLevelBadge(log.level)}
                </div>
              </div>

              {/* Action Title */}
              <div className="font-bold text-white flex items-center gap-1.5 text-xs">
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>{log.action}</span>
              </div>

              {/* Friendly Reasoning Explanation in plain language */}
              <p className="text-slate-200 text-xs leading-relaxed bg-white/5 p-2 rounded-xl border border-white/5">
                "{log.reasoning}"
              </p>

              {/* State Transition & Confidence Footer */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/5">
                <span className="text-cyan-300 font-medium">
                  Status: <span className="text-slate-200">{log.stateTransition}</span>
                </span>
                <span className="text-emerald-400 font-semibold">
                  Confidence: {(log.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
