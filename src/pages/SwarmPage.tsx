/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Page 3: AI Swarm Intelligence & Thought Stream
 */

import React, { useState } from 'react';
import { DisasterState, AgentLog } from '../types/disaster';
import { AgentSwarmStream } from '../components/AgentSwarmStream';
import { Cpu, Sparkles, Activity, Layers, ShieldCheck, Zap, Search } from 'lucide-react';

interface SwarmPageProps {
  state: DisasterState;
  activeAgentId?: string;
}

export const SwarmPage: React.FC<SwarmPageProps> = ({ state, activeAgentId }) => {
  return (
    <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden max-w-7xl mx-auto w-full min-h-0">
      {/* Header Info */}
      <div className="liquid-glass-card rounded-3xl p-5 shadow-xl space-y-2 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  AI SWARM INTELLIGENCE & THOUGHT LOGS
                </h2>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-200 border border-cyan-400/30 font-semibold">
                  LangGraph Cyclic Orchestration
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Inspect the autonomous decision-making loop: perception, allocation, failure recovery, and compliance.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="liquid-glass-pill px-3 py-1.5 rounded-xl">
              Average Latency: <b className="text-emerald-400">16 ms</b>
            </div>
            <div className="liquid-glass-pill px-3 py-1.5 rounded-xl">
              Total Telemetry Events: <b className="text-cyan-300">{state.agentLogs.length}</b>
            </div>
          </div>
        </div>
      </div>

      {/* Main Agent Swarm Stream Component */}
      <div className="flex-1 rounded-3xl overflow-hidden shadow-2xl min-h-0">
        <AgentSwarmStream logs={state.agentLogs} activeAgentId={activeAgentId} />
      </div>
    </div>
  );
};
