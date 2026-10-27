/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Tactical Disaster GIS Map for India (Guwahati / Brahmaputra Basin)
 * Built with official @vis.gl/react-google-maps SDK
 * Features:
 * - Real Google Maps photorealistic Satellite Hybrid, Terrain, and Roadmap views of India
 * - Density-Based Spatial Clustering (DBSCAN) to prevent visual clutter
 * - Dynamic Vector Overlays: Brahmaputra Flood Surge Corridor, Severed Bridges, and Bypass Routes
 * - Interactive Advanced Markers for NDRF, SDRF, Army, Shelters, and Clustered SOS Emergencies
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
  useMapsLibrary
} from '@vis.gl/react-google-maps';
import { Incident, Resource, Shelter, RoadSegment, UrgencyLevel } from '../types/disaster';
import { BRAHMAPUTRA_FLOOD_ZONE_POLYGON } from '../data/indiaDisasterData';
import { Sparkles, Layers, AlertTriangle, ZoomIn, Eye } from 'lucide-react';

const GOOGLE_MAPS_API_KEY =
  (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY ||
  'AIzaSyAu-dpuKUi3R0o6xFhl5ZbYU7SpPUDPn9o';

interface TacticalMapProps {
  incidents: Incident[];
  resources: Resource[];
  shelters: Shelter[];
  roadNetwork: RoadSegment[];
  onSelectIncident?: (incident: Incident) => void;
  onSelectResource?: (resource: Resource) => void;
  onSelectShelter?: (shelter: Shelter) => void;
  focusCoords?: [number, number];
}

interface DensityCluster {
  id: string;
  isCluster: boolean;
  centroid: { lat: number; lng: number };
  incidents: Incident[];
  totalPeopleAffected: number;
  totalInjured: number;
  maxUrgency: UrgencyLevel;
  averageWaterLevel: number;
  radiusMeters: number;
}

const URGENCY_WEIGHTS: Record<UrgencyLevel, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1
};

// Vector Overlays Component (Polygons & Polylines via Google Maps JS API)
function MapOverlays({
  roadNetwork,
  resources,
  clusters
}: {
  roadNetwork: RoadSegment[];
  resources: Resource[];
  clusters: DensityCluster[];
}) {
  const map = useMap();
  const mapsLib = useMapsLibrary('maps');
  const overlaysRef = useRef<google.maps.MVCObject[]>([]);

  useEffect(() => {
    if (!map || !mapsLib) return;

    // Clear previous vector shapes
    overlaysRef.current.forEach(shape => (shape as any).setMap(null));
    overlaysRef.current = [];

    // 1. Draw Brahmaputra River Surge Polygon
    const floodCoords = BRAHMAPUTRA_FLOOD_ZONE_POLYGON.map(([lat, lng]) => ({ lat, lng }));
    const floodPolygon = new mapsLib.Polygon({
      paths: floodCoords,
      strokeColor: '#0284c7',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#0369a1',
      fillOpacity: 0.28,
      map
    });
    overlaysRef.current.push(floodPolygon);

    // 2. Draw Road Network & Collapsed Bridges
    roadNetwork.forEach(road => {
      const isCollapsed = road.status === 'BRIDGE_COLLAPSED';
      const isWaterlogged = road.status === 'WATERLOGGED';

      const polyline = new mapsLib.Polyline({
        path: [
          { lat: road.fromCoords[0], lng: road.fromCoords[1] },
          { lat: road.toCoords[0], lng: road.toCoords[1] }
        ],
        strokeColor: isCollapsed ? '#ef4444' : isWaterlogged ? '#eab308' : '#10b981',
        strokeOpacity: isCollapsed ? 0.95 : 0.75,
        strokeWeight: isCollapsed ? 6 : 4,
        map
      });
      overlaysRef.current.push(polyline);
    });

    // 3. Draw Active Rescue Vectors (Bypass paths)
    resources.forEach(res => {
      if (res.assignedRoute && res.assignedRoute.length > 1) {
        const routePath = res.assignedRoute.map(loc => ({ lat: loc.lat, lng: loc.lng }));
        const routeLine = new mapsLib.Polyline({
          path: routePath,
          strokeColor: '#38bdf8',
          strokeOpacity: 0.9,
          strokeWeight: 4,
          map
        });
        overlaysRef.current.push(routeLine);
      }
    });

    // 4. Draw cluster radius buffer circles
    clusters.forEach(cluster => {
      if (cluster.isCluster) {
        const isCritical = cluster.maxUrgency === 'CRITICAL';
        const color = isCritical ? '#ef4444' : '#f59e0b';
        const circle = new mapsLib.Circle({
          center: cluster.centroid,
          radius: cluster.radiusMeters + 60,
          strokeColor: color,
          strokeOpacity: 0.6,
          strokeWeight: 1.5,
          fillColor: color,
          fillOpacity: 0.12,
          map
        });
        overlaysRef.current.push(circle);
      }
    });

    return () => {
      overlaysRef.current.forEach(shape => (shape as any).setMap(null));
      overlaysRef.current = [];
    };
  }, [map, mapsLib, roadNetwork, resources, clusters]);

  return null;
}

// Internal Map Controller for Programmatic Pan/Zoom
function MapController({ focusCoords }: { focusCoords?: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (map && focusCoords) {
      map.panTo({ lat: focusCoords[0], lng: focusCoords[1] });
      map.setZoom(14);
    }
  }, [map, focusCoords]);
  return null;
}

export const TacticalMap: React.FC<TacticalMapProps> = ({
  incidents,
  resources,
  shelters,
  roadNetwork,
  onSelectIncident,
  onSelectResource,
  onSelectShelter,
  focusCoords
}) => {
  const [mapType, setMapType] = useState<'hybrid' | 'roadmap' | 'satellite' | 'terrain'>('hybrid');
  const [clusteringEnabled, setClusteringEnabled] = useState<boolean>(true);
  const [currentZoom, setCurrentZoom] = useState<number>(13);
  const [selectedCluster, setSelectedCluster] = useState<DensityCluster | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);

  // Density-Based Clustering Algorithm
  // Adapts epsilon threshold dynamically based on the current map zoom
  const clusters = useMemo<DensityCluster[]>(() => {
    const active = incidents.filter(i => i.status !== 'RESCUED');
    if (!clusteringEnabled || active.length === 0) {
      return active.map(inc => ({
        id: `SINGLE_${inc.id}`,
        isCluster: false,
        centroid: { lat: inc.location.lat, lng: inc.location.lng },
        incidents: [inc],
        totalPeopleAffected: inc.peopleAffected,
        totalInjured: inc.injuredCount,
        maxUrgency: inc.urgency,
        averageWaterLevel: inc.waterLevelMeters,
        radiusMeters: 0
      }));
    }

    // Adaptive threshold in degrees based on zoom level:
    // At zoom 13: ~0.0075 deg (~800m); At zoom 16: ~0.0015 deg (~160m)
    const epsilonDeg = 0.05 / Math.pow(2, Math.max(10, currentZoom) - 10);
    const visited = new Set<string>();
    const result: DensityCluster[] = [];

    for (let i = 0; i < active.length; i++) {
      const inc = active[i];
      if (visited.has(inc.id)) continue;
      visited.add(inc.id);

      const neighbors = [inc];
      for (let j = 0; j < active.length; j++) {
        if (i === j) continue;
        const other = active[j];
        const dist = Math.hypot(
          inc.location.lat - other.location.lat,
          inc.location.lng - other.location.lng
        );
        if (dist <= epsilonDeg) {
          neighbors.push(other);
        }
      }

      if (neighbors.length > 1) {
        neighbors.forEach(n => visited.add(n.id));

        let sumLat = 0;
        let sumLng = 0;
        let totalPeople = 0;
        let totalInjured = 0;
        let sumWater = 0;
        let maxU: UrgencyLevel = 'LOW';

        neighbors.forEach(n => {
          sumLat += n.location.lat;
          sumLng += n.location.lng;
          totalPeople += n.peopleAffected;
          totalInjured += n.injuredCount;
          sumWater += n.waterLevelMeters;
          if (URGENCY_WEIGHTS[n.urgency] > URGENCY_WEIGHTS[maxU]) {
            maxU = n.urgency;
          }
        });

        const centroid = {
          lat: sumLat / neighbors.length,
          lng: sumLng / neighbors.length
        };

        let maxDist = 0;
        neighbors.forEach(n => {
          const d = Math.hypot(centroid.lat - n.location.lat, centroid.lng - n.location.lng) * 111000;
          if (d > maxDist) maxDist = d;
        });

        result.push({
          id: `CLUSTER_${neighbors.map(n => n.id).join('_')}`,
          isCluster: true,
          centroid,
          incidents: neighbors,
          totalPeopleAffected: totalPeople,
          totalInjured,
          maxUrgency: maxU,
          averageWaterLevel: parseFloat((sumWater / neighbors.length).toFixed(1)),
          radiusMeters: Math.max(80, Math.round(maxDist))
        });
      } else {
        result.push({
          id: `SINGLE_${inc.id}`,
          isCluster: false,
          centroid: { lat: inc.location.lat, lng: inc.location.lng },
          incidents: [inc],
          totalPeopleAffected: inc.peopleAffected,
          totalInjured: inc.injuredCount,
          maxUrgency: inc.urgency,
          averageWaterLevel: inc.waterLevelMeters,
          radiusMeters: 0
        });
      }
    }

    return result;
  }, [incidents, clusteringEnabled, currentZoom]);

  const activeClusterCount = clusters.filter(c => c.isCluster).length;

  return (
    <div className="relative w-full h-full min-h-[460px] rounded-3xl overflow-hidden border border-white/15 bg-slate-950 shadow-2xl flex flex-col">
      {/* Top Overlay: Real Map Controls & Clustering Toggle (Liquid Glass) */}
      <div className="absolute top-3 left-3 right-3 z-[10] pointer-events-none flex flex-wrap items-center justify-between gap-2">
        {/* Left Badge */}
        <div className="pointer-events-auto liquid-glass px-3.5 py-2 rounded-2xl shadow-xl text-xs flex items-center gap-2.5 border border-white/20">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-bold text-white tracking-wide">Live Map: Guwahati, Assam</span>
          <span className="text-[10px] text-slate-300 hidden sm:inline">| {currentZoom}x Zoom</span>
          {clusteringEnabled && activeClusterCount > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/25 border border-amber-400/40 text-amber-200 font-bold">
              {activeClusterCount} Dense Clusters Grouped
            </span>
          )}
        </div>

        {/* Right Controls: Clustering Toggle + Map Layer Mode */}
        <div className="pointer-events-auto flex items-center gap-2 liquid-glass p-1.5 rounded-2xl shadow-xl border border-white/20 text-xs">
          <button
            onClick={() => setClusteringEnabled(!clusteringEnabled)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              clusteringEnabled
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                : 'bg-white/10 text-slate-300 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Clustering: {clusteringEnabled ? 'ON' : 'OFF'}</span>
          </button>

          <div className="flex items-center gap-1 border-l border-white/15 pl-2">
            <button
              onClick={() => setMapType('hybrid')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                mapType === 'hybrid'
                  ? 'bg-emerald-500/25 text-emerald-200 font-bold border border-emerald-400/50 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              🛰️ Satellite
            </button>
            <button
              onClick={() => setMapType('roadmap')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                mapType === 'roadmap'
                  ? 'bg-cyan-500/25 text-cyan-200 font-bold border border-cyan-400/50 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              🗺️ Roads
            </button>
            <button
              onClick={() => setMapType('terrain')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                mapType === 'terrain'
                  ? 'bg-amber-500/25 text-amber-200 font-bold border border-amber-400/50 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              ⛰️ Terrain
            </button>
          </div>
        </div>
      </div>

      {/* Google Maps Real Map Component */}
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY} solutionChannel="GMP_aistudio_build">
        <Map
          defaultCenter={{ lat: 26.1620, lng: 91.7250 }}
          defaultZoom={13}
          mapId="DEMO_MAP_ID"
          mapTypeId={mapType}
          onZoomChanged={e => setCurrentZoom(e.detail.zoom)}
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          className="w-full h-full flex-1"
          disableDefaultUI={false}
          gestureHandling="greedy"
        >
          <MapController focusCoords={focusCoords} />
          <MapOverlays roadNetwork={roadNetwork} resources={resources} clusters={clusters} />

          {/* Render Density Clusters or Individual Incidents */}
          {clusters.map(cluster => {
            if (cluster.isCluster) {
              const isCritical = cluster.maxUrgency === 'CRITICAL';
              const color = isCritical ? '#ef4444' : '#f59e0b';

              return (
                <AdvancedMarker
                  key={cluster.id}
                  position={cluster.centroid}
                  onClick={() => setSelectedCluster(cluster)}
                >
                  <div className="relative flex items-center justify-center cursor-pointer group" style={{ width: '48px', height: '48px' }}>
                    <span
                      className="absolute inline-flex h-full w-full rounded-full animate-ping opacity-40"
                      style={{ backgroundColor: color }}
                    />
                    <div
                      className="relative flex flex-col items-center justify-center w-11 h-11 rounded-full border-2 border-white shadow-2xl text-white font-mono font-bold transition-transform group-hover:scale-110"
                      style={{ backgroundColor: color }}
                    >
                      <span className="text-[12px] leading-tight">{cluster.totalPeopleAffected}</span>
                      <span className="text-[8px] opacity-90 -mt-0.5">pax</span>
                    </div>
                    <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-mono font-extrabold bg-slate-900 border border-white text-white shadow">
                      {cluster.incidents.length} SOS
                    </span>
                  </div>
                </AdvancedMarker>
              );
            } else {
              const inc = cluster.incidents[0];
              const isCritical = inc.urgency === 'CRITICAL';
              const color = isCritical ? '#ef4444' : '#f59e0b';

              return (
                <AdvancedMarker
                  key={inc.id}
                  position={{ lat: inc.location.lat, lng: inc.location.lng }}
                  onClick={() => {
                    setSelectedIncident(inc);
                    onSelectIncident?.(inc);
                  }}
                >
                  <div className="relative flex items-center justify-center w-8 h-8 cursor-pointer">
                    <span
                      className="absolute inline-flex h-full w-full rounded-full animate-ping opacity-30"
                      style={{ backgroundColor: color }}
                    />
                    <div
                      className="relative flex items-center justify-center w-7 h-7 rounded-full border-2 border-white shadow-xl text-white text-[11px] font-bold font-mono"
                      style={{ backgroundColor: color }}
                    >
                      {inc.peopleAffected}
                    </div>
                  </div>
                </AdvancedMarker>
              );
            }
          })}

          {/* Render Shelters */}
          {shelters.map(shelter => {
            const isFull = shelter.status === 'FULL';
            const color = isFull ? '#ef4444' : '#10b981';

            return (
              <AdvancedMarker
                key={shelter.id}
                position={{ lat: shelter.location.lat, lng: shelter.location.lng }}
                onClick={() => {
                  setSelectedShelter(shelter);
                  onSelectShelter?.(shelter);
                }}
              >
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-lg border-2 border-white shadow-lg cursor-pointer text-white text-sm font-bold"
                  style={{ backgroundColor: color }}
                >
                  🏛️
                </div>
              </AdvancedMarker>
            );
          })}

          {/* Render Resources */}
          {resources.map(res => {
            const isFailed = res.status === 'MAINTENANCE_FAILURE';
            const isEnRoute = res.status === 'DISPATCHED' || res.status === 'EN_ROUTE';
            const iconEmoji = res.type.includes('BOAT') ? '🚤' : res.type.includes('AMPHIBIOUS') ? '🚜' : res.type.includes('AMBULANCE') ? '🚑' : '🚁';

            return (
              <AdvancedMarker
                key={res.id}
                position={{ lat: res.location.lat, lng: res.location.lng }}
                onClick={() => {
                  setSelectedResource(res);
                  onSelectResource?.(res);
                }}
              >
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 shadow-lg cursor-pointer ${
                    isFailed
                      ? 'border-red-500 bg-red-950 text-white'
                      : isEnRoute
                      ? 'border-cyan-400 bg-cyan-950 text-white shadow-cyan-500/50'
                      : 'border-slate-300 bg-slate-900 text-white'
                  }`}
                >
                  <span className="text-sm">{iconEmoji}</span>
                </div>
              </AdvancedMarker>
            );
          })}

          {/* Cluster Detail InfoWindow */}
          {selectedCluster && (
            <InfoWindow
              position={selectedCluster.centroid}
              onCloseClick={() => setSelectedCluster(null)}
            >
              <div className="p-2 font-mono text-xs max-w-sm text-slate-900 space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                  <span className="font-bold text-red-600">🚨 DENSE INCIDENT CLUSTER</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">
                    {selectedCluster.maxUrgency}
                  </span>
                </div>
                <div className="text-[11px] text-slate-700">
                  <b>{selectedCluster.incidents.length} Emergency Calls</b> clustered within <b>{selectedCluster.radiusMeters}m</b>.
                </div>
                <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1.5 rounded text-[10px]">
                  <div>Total Trapped: <b>{selectedCluster.totalPeopleAffected} pax</b></div>
                  <div>Injured: <b className="text-red-600">{selectedCluster.totalInjured}</b></div>
                  <div>Avg Water: <b>{selectedCluster.averageWaterLevel}m</b></div>
                  <div>Radius: <b>{selectedCluster.radiusMeters}m</b></div>
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {selectedCluster.incidents.map(inc => (
                    <div key={inc.id} className="p-1 rounded bg-slate-50 border border-slate-200 text-[10px]">
                      <div className="flex justify-between font-bold">
                        <span>{inc.id}</span>
                        <span className="text-red-600">{inc.urgency}</span>
                      </div>
                      <div className="text-slate-600 truncate">{inc.sourceText}</div>
                    </div>
                  ))}
                </div>
              </div>
            </InfoWindow>
          )}

          {/* Single Incident InfoWindow */}
          {selectedIncident && (
            <InfoWindow
              position={{ lat: selectedIncident.location.lat, lng: selectedIncident.location.lng }}
              onCloseClick={() => setSelectedIncident(null)}
            >
              <div className="p-2 font-mono text-xs max-w-xs text-slate-900 space-y-1">
                <div className="flex justify-between font-bold">
                  <span className="text-red-600">{selectedIncident.id}</span>
                  <span className="text-slate-600">{selectedIncident.urgency}</span>
                </div>
                <div className="font-semibold text-slate-800">{selectedIncident.location.landmark}</div>
                <div className="text-[11px] text-slate-600">{selectedIncident.sourceText}</div>
                <div className="grid grid-cols-2 gap-1 text-[10px] mt-1 bg-slate-100 p-1 rounded">
                  <div>Trapped: <b>{selectedIncident.peopleAffected}</b></div>
                  <div>Water: <b>{selectedIncident.waterLevelMeters}m</b></div>
                </div>
              </div>
            </InfoWindow>
          )}

          {/* Shelter InfoWindow */}
          {selectedShelter && (
            <InfoWindow
              position={{ lat: selectedShelter.location.lat, lng: selectedShelter.location.lng }}
              onCloseClick={() => setSelectedShelter(null)}
            >
              <div className="p-2 font-mono text-xs max-w-xs text-slate-900 space-y-1">
                <div className="font-bold text-emerald-700">{selectedShelter.name}</div>
                <div className="text-[11px] text-slate-600">{selectedShelter.location.landmark}</div>
                <div className="text-[11px]">
                  Occupancy: <b>{selectedShelter.currentOccupancy} / {selectedShelter.maxCapacity}</b>
                </div>
                <div className="text-[10px] text-slate-500">
                  Doctors: {selectedShelter.medicalDoctors} • Elevation: {selectedShelter.floodSafeElevationMeters}m MSL
                </div>
              </div>
            </InfoWindow>
          )}

          {/* Resource InfoWindow */}
          {selectedResource && (
            <InfoWindow
              position={{ lat: selectedResource.location.lat, lng: selectedResource.location.lng }}
              onCloseClick={() => setSelectedResource(null)}
            >
              <div className="p-2 font-mono text-xs max-w-xs text-slate-900 space-y-1">
                <div className="font-bold text-cyan-700">{selectedResource.name}</div>
                <div className="text-[11px] text-slate-600">{selectedResource.unit}</div>
                <div className="grid grid-cols-2 gap-1 text-[10px] bg-slate-100 p-1 rounded">
                  <div>Capacity: <b>{selectedResource.capacityPeople}</b></div>
                  <div>Fuel: <b>{selectedResource.fuelPercent}%</b></div>
                  <div>Speed: <b>{selectedResource.speedKmh} km/h</b></div>
                  <div>Status: <b>{selectedResource.status}</b></div>
                </div>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>

      {/* Map Legend Overlay (Liquid Glass) */}
      <div className="absolute bottom-3 left-3 z-[10] pointer-events-auto liquid-glass px-3.5 py-2.5 rounded-2xl shadow-xl text-xs text-slate-200 space-y-1 border border-white/20">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
          <span>Single SOS Pin</span>
          <span className="w-3.5 h-3.5 rounded-full bg-red-600 border border-white ml-2 flex items-center justify-center text-[8px] font-bold text-white">#</span>
          <span><b>Dense Cluster (Grouped)</b></span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-300">
          <span className="w-3 h-1 bg-emerald-500 rounded"></span>
          <span>Passable Route</span>
          <span className="w-3 h-1 bg-red-500 rounded border-dashed ml-2"></span>
          <span>Severed Bridge</span>
          <span className="text-cyan-300 ml-2 font-medium">--- Active Rescue Vector</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-300">
          <span>🚤 NDRF Boat</span>
          <span className="ml-2">🚜 Army BTR</span>
          <span className="ml-2">🏛️ Relief Camp</span>
        </div>
      </div>
    </div>
  );
};
