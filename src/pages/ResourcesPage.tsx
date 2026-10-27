/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Page 5: Relief Camps & Resource Fleet Management
 */

import React from 'react';
import { DisasterState, Shelter, Resource } from '../types/disaster';
import { Home, LifeBuoy, Users, Fuel, Activity, Stethoscope, Package, ShieldCheck, MapPin } from 'lucide-react';

interface ResourcesPageProps {
  state: DisasterState;
  onNavigateToMap: () => void;
}

export const ResourcesPage: React.FC<ResourcesPageProps> = ({ state, onNavigateToMap }) => {
  const totalCapacity = state.shelters.reduce((acc, s) => acc + s.maxCapacity, 0);
  const totalOccupancy = state.shelters.reduce((acc, s) => acc + s.currentOccupancy, 0);
  const totalFoodPacks = state.shelters.reduce((acc, s) => acc + s.foodWaterPacks, 0);
  const totalDoctors = state.shelters.reduce((acc, s) => acc + s.medicalDoctors, 0);

  return (
    <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto max-w-7xl mx-auto w-full">
      {/* Header Overview */}
      <div className="liquid-glass-card rounded-3xl p-5 shadow-xl space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              <Home className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  RELIEF CAMPS & EMERGENCY FLEET INVENTORY
                </h2>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 font-semibold">
                  Guwahati Metropolitan Zone
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Live monitoring of shelter capacity thresholds, rations stock, and deployed emergency response vehicles.
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateToMap}
            className="liquid-glass-interactive px-4 py-2 rounded-xl text-xs font-semibold text-cyan-300 hover:text-white cursor-pointer"
          >
            Inspect Camps on GIS Map →
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="liquid-glass-card rounded-2xl p-4">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Camp Occupancy</div>
          <div className="text-xl font-bold text-white mt-1">
            <span className={totalOccupancy / totalCapacity > 0.8 ? 'text-amber-400' : 'text-emerald-400'}>
              {totalOccupancy}
            </span>{' '}
            / {totalCapacity}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">{Math.round((totalOccupancy / totalCapacity) * 100)}% Capacity Utilized</div>
        </div>

        <div className="liquid-glass-card rounded-2xl p-4">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Food & Water Packs</div>
          <div className="text-xl font-bold text-sky-300 mt-1">{totalFoodPacks}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">High-calorie ration kits</div>
        </div>

        <div className="liquid-glass-card rounded-2xl p-4">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Medical Doctors on Duty</div>
          <div className="text-xl font-bold text-indigo-300 mt-1">{totalDoctors}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">GMCH & AIIMS field physicians</div>
        </div>

        <div className="liquid-glass-card rounded-2xl p-4">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Active Fleet Assets</div>
          <div className="text-xl font-bold text-cyan-300 mt-1">{state.resources.length} Units</div>
          <div className="text-[10px] text-slate-400 mt-0.5">NDRF, SDRF & Army Amphibious</div>
        </div>
      </div>

      {/* Section 1: Relief Camps */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Home className="w-4 h-4 text-emerald-400" />
          <span>Shelter & Evacuation Camp Hubs</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {state.shelters.map(shelter => {
            const isFull = shelter.status === 'FULL';
            const pct = Math.round((shelter.currentOccupancy / shelter.maxCapacity) * 100);

            return (
              <div
                key={shelter.id}
                className={`liquid-glass-card rounded-3xl p-5 space-y-3 border transition-all ${
                  isFull ? 'border-red-500/50 bg-red-500/10' : 'border-white/10'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="text-sm text-white">{shelter.name}</span>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                    isFull ? 'bg-red-500/25 text-red-200 border border-red-400/40' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {shelter.status}
                  </span>
                </div>

                <div className="text-slate-300 flex items-center gap-1.5 text-xs">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{shelter.location.landmark} ({shelter.location.subDistrict})</span>
                </div>

                {/* Capacity Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Current Occupancy:</span>
                    <span className="font-bold text-white">{shelter.currentOccupancy} / {shelter.maxCapacity} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-black/40 h-2.5 rounded-full overflow-hidden border border-white/10">
                    <div
                      className={`h-full rounded-full transition-all ${
                        pct >= 100 ? 'bg-red-500' : pct > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-[11px] bg-black/25 p-2 rounded-xl">
                  <div>
                    <div className="text-slate-400">Doctors</div>
                    <div className="font-bold text-white mt-0.5">{shelter.medicalDoctors} MDs</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Rations</div>
                    <div className="font-bold text-white mt-0.5">{shelter.foodWaterPacks} packs</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Elevation</div>
                    <div className="font-bold text-cyan-300 mt-0.5">{shelter.floodSafeElevationMeters}m MSL</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Fleet Units */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <LifeBuoy className="w-4 h-4 text-cyan-400" />
          <span>Deployed Response Craft & Rescue Fleet</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {state.resources.map(res => {
            const isFailed = res.status === 'MAINTENANCE_FAILURE';
            const iconEmoji = res.type.includes('BOAT') ? '🚤' : res.type.includes('AMPHIBIOUS') ? '🚜' : res.type.includes('AMBULANCE') ? '🚑' : '🚁';

            return (
              <div
                key={res.id}
                className={`liquid-glass-card rounded-3xl p-4 space-y-2.5 border transition-all ${
                  isFailed ? 'border-red-500/50 bg-red-500/10' : 'border-white/10'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{iconEmoji}</span>
                    <span className="text-white text-xs">{res.name}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isFailed ? 'bg-red-500/30 text-red-200' : 'bg-cyan-500/20 text-cyan-300'
                  }`}>
                    {res.status}
                  </span>
                </div>

                <div className="text-slate-400 text-[11px]">{res.unit}</div>

                <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] bg-black/25 p-2 rounded-xl">
                  <div>Capacity: <b className="text-white">{res.capacityPeople} pax</b></div>
                  <div>Fuel: <b className={res.fuelPercent < 20 ? 'text-red-400' : 'text-emerald-400'}>{res.fuelPercent}%</b></div>
                  <div>Speed: <b className="text-white">{res.speedKmh} km/h</b></div>
                </div>

                {res.currentIncidentId && (
                  <div className="text-[11px] text-amber-300 font-medium">
                    ⚡ Mission Target: <b>{res.currentIncidentId}</b>
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
