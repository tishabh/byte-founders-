/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Cloud SQL Repository Layer with Robust Two-Layer Error Handling
 */

import { db } from './index.ts';
import { users, incidents, resources, shelters, agentLogs, disruptions } from './schema.ts';
import { eq, desc } from 'drizzle-orm';
import {
  INITIAL_INCIDENTS,
  INITIAL_RESOURCES,
  INITIAL_SHELTERS
} from '../data/indiaDisasterData.ts';

// User Registration & Fetch
export async function getOrCreateUser(uid: string, email: string, displayName?: string) {
  try {
    const result = await db
      .insert(users)
      .values({
        uid,
        email,
        displayName: displayName || email.split('@')[0],
        role: 'INCIDENT_COMMANDER',
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          displayName: displayName || email.split('@')[0],
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database user query failed:', error);
    throw new Error('Database user sync failed. Please try again later.', { cause: error });
  }
}

// Seed initial disaster state if database tables are empty
export async function seedInitialDataIfEmpty() {
  try {
    const existingIncidents = await db.select().from(incidents).limit(1);
    if (existingIncidents.length === 0) {
      console.log('Seeding initial Assam Flood data into Cloud SQL...');

      // Seed Incidents
      for (const inc of INITIAL_INCIDENTS) {
        await db.insert(incidents).values({
          id: inc.id,
          sourceText: inc.sourceText,
          landmark: inc.location.landmark,
          lat: inc.location.lat.toString(),
          lng: inc.location.lng.toString(),
          category: inc.category,
          urgency: inc.urgency,
          peopleAffected: inc.peopleAffected,
          injuredCount: inc.injuredCount,
          waterLevelMeters: inc.waterLevelMeters.toString(),
          assignedResourceId: inc.assignedResourceId || null,
          targetShelterId: inc.targetShelterId || null,
          status: inc.status,
          confidenceScore: inc.confidenceScore.toString(),
          extractedNeeds: JSON.stringify(inc.extractedNeeds),
        }).onConflictDoNothing();
      }

      // Seed Resources
      for (const res of INITIAL_RESOURCES) {
        await db.insert(resources).values({
          id: res.id,
          name: res.name,
          unit: res.unit,
          type: res.type,
          landmark: res.location.landmark,
          lat: res.location.lat.toString(),
          lng: res.location.lng.toString(),
          capacityPeople: res.capacityPeople,
          medicalSuppliesRating: res.medicalSuppliesRating,
          status: res.status,
          fuelPercent: res.fuelPercent,
          speedKmh: res.speedKmh,
          currentIncidentId: res.currentIncidentId || null,
        }).onConflictDoNothing();
      }

      // Seed Shelters
      for (const shl of INITIAL_SHELTERS) {
        await db.insert(shelters).values({
          id: shl.id,
          name: shl.name,
          landmark: shl.location.landmark,
          lat: shl.location.lat.toString(),
          lng: shl.location.lng.toString(),
          maxCapacity: shl.maxCapacity,
          currentOccupancy: shl.currentOccupancy,
          foodWaterPacks: shl.foodWaterPacks,
          medicalDoctors: shl.medicalDoctors,
          floodSafeElevationMeters: shl.floodSafeElevationMeters.toString(),
          status: shl.status,
        }).onConflictDoNothing();
      }

      // Initial Swarm Log
      await db.insert(agentLogs).values({
        id: 'INIT_CLOUDSQL',
        timestamp: new Date().toLocaleTimeString('en-IN', { hour12: true }),
        agentId: 'INGESTION_AGENT',
        agentName: 'SOS Ingestion & Triage Agent',
        action: 'Cloud SQL Database Synchronized',
        reasoning: 'Connected to Google Cloud SQL (PostgreSQL) instance in asia-south1. Persistent state machine initialized.',
        confidence: '0.99',
        stateTransition: 'DATABASE_ONLINE',
        latencyMs: 8,
        level: 'success',
      }).onConflictDoNothing();

      console.log('Cloud SQL seeding completed.');
    }
  } catch (error) {
    console.error('Error during database seed check:', error);
  }
}

// Fetch all incidents
export async function getIncidents() {
  try {
    return await db.select().from(incidents).orderBy(desc(incidents.createdAt));
  } catch (error) {
    console.error('Failed to get incidents from database:', error);
    throw new Error('Database query failed for incidents.', { cause: error });
  }
}

// Insert new incident
export async function insertIncident(data: {
  id: string;
  sourceText: string;
  landmark: string;
  lat: number;
  lng: number;
  category: string;
  urgency: string;
  peopleAffected: number;
  injuredCount: number;
  waterLevelMeters: number;
  status: string;
  confidenceScore: number;
  extractedNeeds: string[];
}) {
  try {
    const result = await db.insert(incidents).values({
      id: data.id,
      sourceText: data.sourceText,
      landmark: data.landmark,
      lat: data.lat.toString(),
      lng: data.lng.toString(),
      category: data.category,
      urgency: data.urgency,
      peopleAffected: data.peopleAffected,
      injuredCount: data.injuredCount,
      waterLevelMeters: data.waterLevelMeters.toString(),
      status: data.status,
      confidenceScore: data.confidenceScore.toString(),
      extractedNeeds: JSON.stringify(data.extractedNeeds),
    }).returning();
    return result[0];
  } catch (error) {
    console.error('Failed to insert incident in database:', error);
    throw new Error('Database insert failed for incident.', { cause: error });
  }
}

// Fetch all resources
export async function getResources() {
  try {
    return await db.select().from(resources);
  } catch (error) {
    console.error('Failed to get resources from database:', error);
    throw new Error('Database query failed for resources.', { cause: error });
  }
}

// Update resource status
export async function updateResourceStatus(id: string, status: string, incidentId?: string | null) {
  try {
    return await db.update(resources)
      .set({ status, currentIncidentId: incidentId, updatedAt: new Date() })
      .where(eq(resources.id, id))
      .returning();
  } catch (error) {
    console.error('Failed to update resource in database:', error);
    throw new Error('Database update failed for resource.', { cause: error });
  }
}

// Fetch all shelters
export async function getShelters() {
  try {
    return await db.select().from(shelters);
  } catch (error) {
    console.error('Failed to get shelters from database:', error);
    throw new Error('Database query failed for shelters.', { cause: error });
  }
}

// Fetch agent logs
export async function getAgentLogs(limit = 50) {
  try {
    return await db.select().from(agentLogs).orderBy(desc(agentLogs.createdAt)).limit(limit);
  } catch (error) {
    console.error('Failed to get agent logs from database:', error);
    throw new Error('Database query failed for agent logs.', { cause: error });
  }
}

// Log an agent action
export async function recordAgentLog(data: {
  id: string;
  timestamp: string;
  agentId: string;
  agentName: string;
  action: string;
  reasoning: string;
  confidence: number;
  stateTransition?: string;
  latencyMs?: number;
  level?: string;
}) {
  try {
    return await db.insert(agentLogs).values({
      id: data.id,
      timestamp: data.timestamp,
      agentId: data.agentId,
      agentName: data.agentName,
      action: data.action,
      reasoning: data.reasoning,
      confidence: data.confidence.toString(),
      stateTransition: data.stateTransition || null,
      latencyMs: data.latencyMs || 10,
      level: data.level || 'info',
    }).returning();
  } catch (error) {
    console.error('Failed to record agent log in database:', error);
    // Non-fatal, do not throw
  }
}
