/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Page 1: Live GIS Tactical Map (Google Maps Real Map with Density Clustering)
 */

import React, { useState } from 'react';
import { TacticalMap } from '../components/TacticalMap';
import { DisasterState, Incident, Resource, Shelter } from '../types/disaster';
import { Shield, Users, LifeBuoy, AlertTriangle, Layers, Navigation, ArrowRight } from 'lucide-react';

interface MapPageProps {
  state: DisasterState;
  onNavigateToSimulator: () => void;
  onNavigateToSos: () => void;
  onNavigateTo3D?: () => void;
  onNavigateToChat?: () => void;
}

export const MapPage: React.FC<MapPageProps> = ({
  state,
  onNavigateToSimulator,
  onNavigateToSos,
  onNavigateTo3D,
  onNavigateToChat
}) => {
  const [focusCoords, setFocusCoords] = useState<[number, number] | undefined>(undefined);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const totalVictims = state.incidents.reduce((sum, i) => sum + i.peopleAffected, 0);
  const rescuedVictims = state.incidents
    .filter(i => i.status === 'RESCUED' || i.status === 'EN_ROUTE')
    .reduce((sum, i) => sum + i.peopleAffected, 0);

  return (
    <div className="flex-1 flex flex-col p-3 gap-3 overflow-hidden min-h-0">
      {/* Quick Summary Pill Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <div className="liquid-glass-pill px-3 py-1.5 rounded-xl text-xs flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-white">Brahmaputra River Sector: Guwahati</span>
          </div>
          <div className="liquid-glass-pill px-3 py-1.5 rounded-xl text-xs text-slate-300">
            Rescued: <b className="text-emerald-400">{rescuedVictims}</b> / {totalVictims} civilians
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateTo3D && (
            <button
              onClick={onNavigateTo3D}
              className="liquid-glass-interactive px-3 py-1.5 rounded-xl text-xs font-semibold text-cyan-300 hover:text-white flex items-center gap-1.5 cursor-pointer border-cyan-400/30"
            >
              <span>3D Rescue Deck ↗</span>
            </button>
          )}

          {onNavigateToChat && (
            <button
              onClick={onNavigateToChat}
              className="liquid-glass-interactive px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-300 hover:text-white flex items-center gap-1.5 cursor-pointer border-emerald-400/30"
            >
              <span>💬 Citizen AI Chat ↗</span>
            </button>
          )}

          <button
            onClick={onNavigateToSimulator}
            className="liquid-glass-interactive px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Chaos Simulator →</span>
          </button>

          <button
            onClick={onNavigateToSos}
            className="liquid-glass-interactive px-3 py-1.5 rounded-xl text-xs font-semibold text-sky-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
          >
            <span>+ Report SOS →</span>
          </button>
        </div>
      </div>

      {/* Main Full-Size Map View */}
      <div className="flex-1 rounded-3xl overflow-hidden relative shadow-2xl min-h-[480px]">
        <TacticalMap
          incidents={state.incidents}
          resources={state.resources}
          shelters={state.shelters}
          roadNetwork={state.roadNetwork}
          focusCoords={focusCoords}
          onSelectIncident={(inc) => {
            setSelectedIncident(inc);
            setFocusCoords([inc.location.lat, inc.location.lng]);
          }}
          onSelectResource={(res) => setFocusCoords([res.location.lat, res.location.lng])}
          onSelectShelter={(shl) => setFocusCoords([shl.location.lat, shl.location.lng])}
        />
      </div>
    </div>
  );
};
