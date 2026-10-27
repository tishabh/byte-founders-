/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Cloud SQL Backend Client for Frontend React Components
 * Provides seamless sync with /api/* routes and graceful offline fallback
 */

import { Incident, Resource, Shelter, AgentLog } from '../types/disaster';

export async function fetchDbIncidents(): Promise<Incident[] | null> {
  try {
    const res = await fetch('/api/incidents');
    if (!res.ok) return null;
    const data = await res.json();
    return data.map((d: any) => ({
      id: d.id,
      sourceText: d.sourceText,
      location: {
        lat: parseFloat(d.lat),
        lng: parseFloat(d.lng),
        landmark: d.landmark,
      },
      category: d.category,
      urgency: d.urgency,
      peopleAffected: d.peopleAffected,
      injuredCount: d.injuredCount,
      waterLevelMeters: parseFloat(d.waterLevelMeters || '1.0'),
      assignedResourceId: d.assignedResourceId || undefined,
      targetShelterId: d.targetShelterId || undefined,
      status: d.status,
      timestamp: new Date(d.createdAt).toLocaleTimeString('en-IN', { hour12: true }),
      confidenceScore: parseFloat(d.confidenceScore || '0.9'),
      extractedNeeds: typeof d.extractedNeeds === 'string' ? JSON.parse(d.extractedNeeds || '[]') : d.extractedNeeds || [],
    }));
  } catch {
    return null;
  }
}

export async function syncIncidentToDb(incident: Incident): Promise<boolean> {
  try {
    const res = await fetch('/api/incidents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: incident.id,
        sourceText: incident.sourceText,
        landmark: incident.location.landmark,
        lat: incident.location.lat,
        lng: incident.location.lng,
        category: incident.category,
        urgency: incident.urgency,
        peopleAffected: incident.peopleAffected,
        injuredCount: incident.injuredCount,
        waterLevelMeters: incident.waterLevelMeters,
        status: incident.status,
        confidenceScore: incident.confidenceScore,
        extractedNeeds: incident.extractedNeeds,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function syncAgentLogToDb(log: AgentLog): Promise<void> {
  try {
    await fetch('/api/agent-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log),
    });
  } catch {
    // Non-fatal logging
  }
}
