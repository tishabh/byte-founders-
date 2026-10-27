/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Density-Based Spatial Clustering of Applications with Noise (DBSCAN / Adaptive Density Clustering)
 * Prevents visual clutter on tactical GIS maps by grouping geographically proximate emergency incidents.
 */

import { Incident, UrgencyLevel } from '../types/disaster';
import L from 'leaflet';

export interface IncidentCluster {
  id: string;
  isCluster: boolean;
  centroid: [number, number];
  incidents: Incident[];
  totalPeopleAffected: number;
  totalInjuredCount: number;
  maxUrgency: UrgencyLevel;
  averageWaterLevel: number;
  clusterRadiusMeters: number;
}

const URGENCY_RANKS: Record<UrgencyLevel, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1
};

/**
 * Computes Haversine great-circle distance between two coordinates in meters.
 */
export function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Density-Based Clustering Algorithm:
 * Groups incidents within epsilon distance (calculated in pixel screen space or meters based on zoom level).
 * 
 * @param incidents List of active incidents to cluster
 * @param map Leaflet map instance for projecting lat/lng to screen pixels
 * @param pixelThreshold Screen pixel radius for clustering (default: 55px)
 */
export function clusterIncidentsByDensity(
  incidents: Incident[],
  map: L.Map,
  pixelThreshold: number = 60
): IncidentCluster[] {
  // Filter out resolved / rescued incidents
  const activeIncidents = incidents.filter(i => i.status !== 'RESCUED');
  if (activeIncidents.length === 0) return [];

  const visited = new Set<string>();
  const clusters: IncidentCluster[] = [];

  // Project lat/lng to container pixel coordinates for scale-invariant visual density clustering
  const projectedPoints = activeIncidents.map(inc => {
    const latLng = L.latLng(inc.location.lat, inc.location.lng);
    const point = map.latLngToContainerPoint(latLng);
    return { incident: inc, point, latLng };
  });

  for (let i = 0; i < projectedPoints.length; i++) {
    const item = projectedPoints[i];
    if (visited.has(item.incident.id)) continue;

    visited.add(item.incident.id);

    // Find all density neighbors within pixelThreshold
    const neighbors: typeof projectedPoints = [item];

    for (let j = 0; j < projectedPoints.length; j++) {
      if (i === j) continue;
      const other = projectedPoints[j];
      const pixelDist = item.point.distanceTo(other.point);

      if (pixelDist <= pixelThreshold) {
        neighbors.push(other);
      }
    }

    if (neighbors.length > 1) {
      // Density cluster formed (minPts = 2)
      const clusterIncidents = neighbors.map(n => {
        visited.add(n.incident.id);
        return n.incident;
      });

      // Calculate geographic centroid
      let sumLat = 0;
      let sumLng = 0;
      let totalPeople = 0;
      let totalInjured = 0;
      let sumWater = 0;
      let highestUrgency: UrgencyLevel = 'LOW';

      clusterIncidents.forEach(inc => {
        sumLat += inc.location.lat;
        sumLng += inc.location.lng;
        totalPeople += inc.peopleAffected;
        totalInjured += inc.injuredCount;
        sumWater += inc.waterLevelMeters;
        if (URGENCY_RANKS[inc.urgency] > URGENCY_RANKS[highestUrgency]) {
          highestUrgency = inc.urgency;
        }
      });

      const centroidLat = sumLat / clusterIncidents.length;
      const centroidLng = sumLng / clusterIncidents.length;

      // Calculate max radius of cluster in meters
      let maxRadiusMeters = 0;
      clusterIncidents.forEach(inc => {
        const d = getDistanceMeters(centroidLat, centroidLng, inc.location.lat, inc.location.lng);
        if (d > maxRadiusMeters) maxRadiusMeters = d;
      });

      clusters.push({
        id: `CLUSTER_${clusterIncidents.map(i => i.id).join('_')}`,
        isCluster: true,
        centroid: [centroidLat, centroidLng],
        incidents: clusterIncidents,
        totalPeopleAffected: totalPeople,
        totalInjuredCount: totalInjured,
        maxUrgency: highestUrgency,
        averageWaterLevel: parseFloat((sumWater / clusterIncidents.length).toFixed(1)),
        clusterRadiusMeters: Math.max(50, Math.round(maxRadiusMeters))
      });
    } else {
      // Single isolated point (noise / individual incident)
      const inc = item.incident;
      clusters.push({
        id: `SINGLE_${inc.id}`,
        isCluster: false,
        centroid: [inc.location.lat, inc.location.lng],
        incidents: [inc],
        totalPeopleAffected: inc.peopleAffected,
        totalInjuredCount: inc.injuredCount,
        maxUrgency: inc.urgency,
        averageWaterLevel: inc.waterLevelMeters,
        clusterRadiusMeters: 0
      });
    }
  }

  return clusters;
}
