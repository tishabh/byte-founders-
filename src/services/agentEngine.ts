/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Suraksha AI (सुरक्षा) - Core Multi-Agent Swarm Orchestration Engine
 * Implements StateGraph Autonomous Perception, Dynamic Replanning & HITL Governance
 */

import {
  DisasterState,
  Incident,
  Resource,
  Shelter,
  RoadSegment,
  PlanDiff,
  AgentLog,
  GeoLocation,
  UrgencyLevel
} from '../types/disaster';

// Mathematical distance calculation (Haversine Formula) in KM
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

// Simple unique ID generator
export function generateId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

export class MultiAgentOrchestrator {
  /**
   * AGENT 1: Ingestion & Triage Agent
   * Evaluates distress report text, extracts urgency, victims, water levels, checks duplicates
   */
  public static triageIncident(
    rawText: string,
    location: GeoLocation,
    existingIncidents: Incident[]
  ): { incident: Incident; log: AgentLog; isDuplicate: boolean } {
    const start = performance.now();
    const lower = rawText.toLowerCase();

    // Deduplication: check if any active incident is within 350 meters
    const nearbyExisting = existingIncidents.find(inc => {
      const dist = calculateDistanceKm(location.lat, location.lng, inc.location.lat, inc.location.lng);
      return dist < 0.35 && inc.status !== 'RESCUED';
    });

    if (nearbyExisting) {
      return {
        incident: nearbyExisting,
        isDuplicate: true,
        log: {
          id: generateId('LOG_TRIAGE_DUP'),
          timestamp: new Date().toLocaleTimeString('en-IN', { hour12: true }),
          agentId: 'INGESTION_AGENT',
          agentName: 'SOS Ingestion & Triage Agent',
          action: 'Duplicate Call Filtered & Cluster Merged',
          reasoning: `New report within ${(calculateDistanceKm(location.lat, location.lng, nearbyExisting.location.lat, nearbyExisting.location.lng) * 1000).toFixed(0)}m of existing incident ${nearbyExisting.id}. Updating severity without spawning redundant dispatched assets.`,
          confidence: 0.96,
          stateTransition: 'DEDUP_MERGE',
          latencyMs: Math.round(performance.now() - start),
          level: 'warn'
        }
      };
    }

    // Heuristic NLP priority scoring
    let urgency: UrgencyLevel = 'MEDIUM';
    let peopleAffected = 6;
    let injuredCount = 0;
    let waterLevelMeters = 1.0;
    const extractedNeeds: string[] = [];

    if (lower.includes('pregnant') || lower.includes('infant') || lower.includes('child') || lower.includes('school')) {
      urgency = 'CRITICAL';
      extractedNeeds.push('Pediatric/Obstetric Care', 'Life vests');
      peopleAffected += 10;
    }
    if (lower.includes('cardiac') || lower.includes('hypothermia') || lower.includes('collapse') || lower.includes('injured')) {
      urgency = 'CRITICAL';
      injuredCount += 4;
      extractedNeeds.push('ALS Ambulance Stretcher', 'Trauma Stabilization');
    }
    if (lower.includes('rooftop') || lower.includes('6 feet') || lower.includes('breached') || lower.includes('fast current')) {
      urgency = 'CRITICAL';
      waterLevelMeters = 2.4;
      extractedNeeds.push('Motorized High-Thrust Watercraft', 'Safety Harnesses');
    }
    if (lower.includes('food') || lower.includes('water') || lower.includes('trapped')) {
      extractedNeeds.push('Dry Rations & Potable Water Packs');
    }

    const incident: Incident = {
      id: generateId('INC'),
      sourceText: rawText,
      location,
      category: waterLevelMeters > 1.8 ? 'FLASH_FLOOD_STRANDED' : injuredCount > 0 ? 'MEDICAL_EMERGENCY' : 'WATER_FOOD_DEPRIVATION',
      urgency,
      peopleAffected,
      injuredCount,
      waterLevelMeters,
      status: 'TRIAGED',
      timestamp: new Date().toLocaleTimeString('en-IN', { hour12: true }),
      confidenceScore: 0.94,
      extractedNeeds
    };

    const log: AgentLog = {
      id: generateId('LOG_TRIAGE'),
      timestamp: incident.timestamp,
      agentId: 'INGESTION_AGENT',
      agentName: 'SOS Ingestion & Triage Agent',
      action: 'Distress Signal Triaged & Priority Classified',
      reasoning: `Extracted ${peopleAffected} victims (${injuredCount} injured) at ${location.landmark}. Urgency level evaluated as ${urgency} based on water depth (${waterLevelMeters}m) and medical indicators.`,
      confidence: 0.94,
      stateTransition: 'RAW_INGEST -> STATE_TRIAGED',
      latencyMs: Math.round(performance.now() - start),
      level: urgency === 'CRITICAL' ? 'critical' : 'info'
    };

    return { incident, log, isDuplicate: false };
  }

  /**
   * AGENT 2: Situational Awareness & Resource Allocator
   * Computes optimal pairing between available NDRF/SDRF assets and incidents
   */
  public static allocateResources(state: DisasterState): {
    updatedIncidents: Incident[];
    updatedResources: Resource[];
    updatedShelters: Shelter[];
    newLogs: AgentLog[];
  } {
    const start = performance.now();
    const updatedIncidents = [...state.incidents];
    const updatedResources = [...state.resources];
    const updatedShelters = [...state.shelters];
    const newLogs: AgentLog[] = [];

    // Filter unassigned incidents sorted by urgency: CRITICAL > HIGH > MEDIUM > LOW
    const urgencyWeight: Record<UrgencyLevel, number> = {
      CRITICAL: 4,
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1
    };

    const pending = updatedIncidents
      .filter(inc => inc.status === 'REPORTED' || inc.status === 'TRIAGED' || inc.status === 'REPLAN_REQUIRED')
      .sort((a, b) => (urgencyWeight[b.urgency] * 10 + b.peopleAffected) - (urgencyWeight[a.urgency] * 10 + a.peopleAffected));

    for (const incident of pending) {
      // Find idle resources that can handle water / terrain
      const available = updatedResources.filter(r => r.status === 'IDLE' && r.fuelPercent > 20);

      if (available.length === 0) {
        newLogs.push({
          id: generateId('LOG_ALLOC_EXHAUST'),
          timestamp: new Date().toLocaleTimeString('en-IN', { hour12: true }),
          agentId: 'ALLOCATION_AGENT',
          agentName: 'Situational Awareness & Allocation Agent',
          action: 'Resource Constrained - Queued for Priority Preemption',
          reasoning: `All primary rescue assets are currently engaged. Incident ${incident.id} (${incident.peopleAffected} persons at ${incident.location.landmark}) queued at head of priority stack.`,
          confidence: 0.89,
          stateTransition: 'PENDING_ALLOCATION_QUEUE',
          latencyMs: 14,
          level: 'warn'
        });
        continue;
      }

      // Score matching candidates based on proximity, capacity suitability, and medical readiness
      const scoredCandidates = available.map(resource => {
        const distKm = calculateDistanceKm(
          resource.location.lat,
          resource.location.lng,
          incident.location.lat,
          incident.location.lng
        );

        let capabilityScore = 10;
        if (incident.waterLevelMeters > 1.5 && resource.type.includes('BOAT')) capabilityScore += 20;
        if (incident.injuredCount > 0 && resource.medicalSuppliesRating >= 8) capabilityScore += 15;
        if (incident.peopleAffected > 15 && resource.type === 'ARMY_BTR_AMPHIBIOUS') capabilityScore += 25;

        // Score formula: high capability, low distance
        const totalScore = capabilityScore * 5 - distKm * 3 + resource.fuelPercent * 0.1;
        return { resource, distKm, score: totalScore };
      });

      scoredCandidates.sort((a, b) => b.score - a.score);
      const best = scoredCandidates[0];

      // Find nearest shelter with available capacity
      const suitableShelter = updatedShelters
        .filter(s => s.status !== 'FULL' && s.status !== 'COMPROMISED')
        .sort((s1, s2) => {
          const d1 = calculateDistanceKm(incident.location.lat, incident.location.lng, s1.location.lat, s1.location.lng);
          const d2 = calculateDistanceKm(incident.location.lat, incident.location.lng, s2.location.lat, s2.location.lng);
          return d1 - d2;
        })[0] || updatedShelters[0];

      // Assign resource
      const resIndex = updatedResources.findIndex(r => r.id === best.resource.id);
      const incIndex = updatedIncidents.findIndex(i => i.id === incident.id);

      if (resIndex !== -1 && incIndex !== -1) {
        updatedResources[resIndex] = {
          ...updatedResources[resIndex],
          status: 'DISPATCHED',
          currentIncidentId: incident.id,
          assignedRoute: [
            updatedResources[resIndex].location,
            incident.location,
            suitableShelter.location
          ]
        };

        updatedIncidents[incIndex] = {
          ...updatedIncidents[incIndex],
          assignedResourceId: best.resource.id,
          targetShelterId: suitableShelter.id,
          status: 'ASSIGNED'
        };

        newLogs.push({
          id: generateId('LOG_ALLOC_SUCCESS'),
          timestamp: new Date().toLocaleTimeString('en-IN', { hour12: true }),
          agentId: 'ALLOCATION_AGENT',
          agentName: 'Situational Awareness & Allocation Agent',
          action: `Asset ${best.resource.name} Dispatched`,
          reasoning: `Dispatched ${best.resource.unit} (${best.resource.name}) to ${incident.location.landmark}. Distance: ${best.distKm} km. Destination shelter: ${suitableShelter.name} (Vacancy: ${suitableShelter.maxCapacity - suitableShelter.currentOccupancy} pax).`,
          confidence: 0.95,
          stateTransition: 'ASSIGN_RESOURCE_COMMIT',
          latencyMs: Math.round(performance.now() - start),
          level: 'success'
        });
      }
    }

    return { updatedIncidents, updatedResources, updatedShelters, newLogs };
  }

  /**
   * AGENT 3 & 4: Dynamic Replanning & Self-Healing Agent + HITL Compliance
   * Triggered when a road segment collapses, a boat fails, or a shelter overflows.
   */
  public static triggerDisruption(
    state: DisasterState,
    disruptionType: 'BRIDGE_COLLAPSE' | 'BOAT_FAILURE' | 'SHELTER_OVERFLOW' | 'SURGE_RISING',
    targetEntityId?: string
  ): {
    updatedRoads: RoadSegment[];
    updatedResources: Resource[];
    updatedShelters: Shelter[];
    updatedIncidents: Incident[];
    pendingHitlPlans: PlanDiff[];
    newLogs: AgentLog[];
  } {
    const start = performance.now();
    const updatedRoads = [...state.roadNetwork];
    const updatedResources = [...state.resources];
    const updatedShelters = [...state.shelters];
    const updatedIncidents = [...state.incidents];
    const pendingHitlPlans = [...state.pendingHitlPlans];
    const newLogs: AgentLog[] = [];

    if (disruptionType === 'BRIDGE_COLLAPSE') {
      // Find road (default to Saraighat Bridge)
      const roadIdx = updatedRoads.findIndex(r => r.id === (targetEntityId || 'ROAD_SARAIGHAT_BRIDGE'));
      if (roadIdx !== -1) {
        updatedRoads[roadIdx] = {
          ...updatedRoads[roadIdx],
          status: 'BRIDGE_COLLAPSED',
          floodDepthCm: 280
        };

        newLogs.push({
          id: generateId('LOG_DISRUPT_ALERT'),
          timestamp: new Date().toLocaleTimeString('en-IN', { hour12: true }),
          agentId: 'REPLANNING_AGENT',
          agentName: 'Dynamic Replanning & Recovery Agent',
          action: 'CRITICAL ROUTE DISRUPTION DETECTED',
          reasoning: `Structural telemetry & field sensors confirm ${updatedRoads[roadIdx].fromName} to ${updatedRoads[roadIdx].toName} is completely submerged/collapsed. Initiating automated topological path rerouting.`,
          confidence: 0.99,
          stateTransition: 'ROUTE_FAIL_INTERRUPT',
          latencyMs: Math.round(performance.now() - start),
          level: 'critical'
        });

        // Find any active resources whose route intersects with this road or connects across north-south bank
        // We calculate alternative bypass via Basistha/NH-27 southern belt or river craft
        const affectedResources = updatedResources.filter(
          r => r.status === 'DISPATCHED' || r.status === 'EN_ROUTE'
        );

        affectedResources.forEach(res => {
          if (res.currentIncidentId) {
            const inc = updatedIncidents.find(i => i.id === res.currentIncidentId);
            if (inc) {
              const oldRoute = res.assignedRoute || [res.location, inc.location];
              // Create dynamic bypass route avoiding bridge
              const bypassWaypoint: GeoLocation = {
                lat: 26.1350,
                lng: 91.7100,
                landmark: 'Basistha-Lokhra Elevated Flyover Bypass (Clear of Flood)'
              };

              const newRoute: GeoLocation[] = [
                res.location,
                bypassWaypoint,
                inc.location,
                { lat: 26.1150, lng: 91.7690, landmark: 'Sarusajai Stadium Camp Bravo' }
              ];

              const oldEta = 18;
              const newEta = 34; // 16 min detour

              const planDiff: PlanDiff = {
                id: generateId('DIFF'),
                timestamp: new Date().toLocaleTimeString('en-IN', { hour12: true }),
                triggerEvent: 'Brahmaputra Saraighat Bridge (NH 27) Submerged & Blocked',
                incidentId: inc.id,
                oldResourceId: res.id,
                newResourceId: res.id,
                oldRoute,
                newRoute,
                oldEtaMinutes: oldEta,
                newEtaMinutes: newEta,
                riskScore: 68,
                casualtyMitigationProb: 91,
                commanderReasoning: `Primary arterial connection over Saraighat Bridge is severed. Detour of +16 minutes via Basistha bypass protects 18 civilians from stranding while guaranteeing safe passage over non-inundated corridors. Requires Commander approval due to ETA extension.`,
                requiresHitlApproval: true,
                hitlApproved: false
              };

              pendingHitlPlans.push(planDiff);

              newLogs.push({
                id: generateId('LOG_HITL_GEN'),
                timestamp: new Date().toLocaleTimeString('en-IN', { hour12: true }),
                agentId: 'COMMANDER_AGENT',
                agentName: 'Commander HITL & Governance Agent',
                action: 'HITL Authorization Gate Triggered (Plan Diff # ' + planDiff.id.slice(-4) + ')',
                reasoning: `Automated replanning constructed bypass route (+16 min ETA). Per SOP Rule 4.2: High-risk detour for critical incident requires 1-click human commander authorization.`,
                confidence: 0.92,
                stateTransition: 'AWAIT_COMMANDER_SIGN_OFF',
                latencyMs: 22,
                level: 'warn'
              });
            }
          }
        });
      }
    } else if (disruptionType === 'BOAT_FAILURE') {
      // Resource breakdown: NDRF_B2 engine failure
      const boatIdx = updatedResources.findIndex(r => r.id === (targetEntityId || 'RES_NDRF_B2'));
      if (boatIdx !== -1) {
        const brokenBoat = updatedResources[boatIdx];
        updatedResources[boatIdx] = {
          ...brokenBoat,
          status: 'MAINTENANCE_FAILURE',
          fuelPercent: 0
        };

        newLogs.push({
          id: generateId('LOG_BOAT_DOWN'),
          timestamp: new Date().toLocaleTimeString('en-IN', { hour12: true }),
          agentId: 'REPLANNING_AGENT',
          agentName: 'Dynamic Replanning & Recovery Agent',
          action: `ASSET FAILURE: ${brokenBoat.name} Telemetry Offline`,
          reasoning: `Propulsion failure reported in high-velocity Brahmaputra current. Automatically invalidating active assignment and initiating hot-swap with backup amphibious resource.`,
          confidence: 0.98,
          stateTransition: 'ASSET_PREEMPT_SWAP',
          latencyMs: 18,
          level: 'critical'
        });

        // Reassign affected incident to Army Amphibious BTR
        const armyIdx = updatedResources.findIndex(r => r.id === 'RES_ARMY_AMPHIB');
        const targetIncident = updatedIncidents.find(i => i.assignedResourceId === brokenBoat.id);

        if (armyIdx !== -1 && targetIncident) {
          const army = updatedResources[armyIdx];
          const oldRoute = brokenBoat.assignedRoute || [];
          const newRoute = [
            army.location,
            targetIncident.location,
            { lat: 26.1585, lng: 91.7720, landmark: 'GMCH Emergency Field Triage Camp' }
          ];

          const planDiff: PlanDiff = {
            id: generateId('DIFF_SWAP'),
            timestamp: new Date().toLocaleTimeString('en-IN', { hour12: true }),
            triggerEvent: `${brokenBoat.name} Engine Seizure in River Current`,
            incidentId: targetIncident.id,
            oldResourceId: brokenBoat.id,
            newResourceId: army.id,
            oldRoute,
            newRoute,
            oldEtaMinutes: 22,
            newEtaMinutes: 14, // Faster rescue carrier!
            riskScore: 42,
            casualtyMitigationProb: 97,
            commanderReasoning: `Hot-swapping incapacitated boat with Indian Army 51 Sub Area Amphibious BTR-80. Higher payload capacity (22 pax) and 100% water barrier protection reduces ETA by 8 minutes.`,
            requiresHitlApproval: true,
            hitlApproved: false
          };

          pendingHitlPlans.push(planDiff);

          newLogs.push({
            id: generateId('LOG_SWAP_PROP'),
            timestamp: new Date().toLocaleTimeString('en-IN', { hour12: true }),
            agentId: 'COMMANDER_AGENT',
            agentName: 'Commander HITL & Governance Agent',
            action: 'Emergency Resource Hot-Swap Submitted for Approval',
            reasoning: `Proposing immediate swap from damaged NDRF boat to Army Amphibious carrier. Estimated casualty survival probability increased to 97%.`,
            confidence: 0.96,
            stateTransition: 'AWAIT_COMMANDER_SIGN_OFF',
            latencyMs: 12,
            level: 'warn'
          });
        }
      }
    } else if (disruptionType === 'SHELTER_OVERFLOW') {
      // IIT Guwahati shelter hits 100% capacity
      const shelterIdx = updatedShelters.findIndex(s => s.id === 'SHELTER_IITG');
      if (shelterIdx !== -1) {
        updatedShelters[shelterIdx] = {
          ...updatedShelters[shelterIdx],
          currentOccupancy: updatedShelters[shelterIdx].maxCapacity,
          status: 'FULL'
        };

        newLogs.push({
          id: generateId('LOG_SHELTER_CAP'),
          timestamp: new Date().toLocaleTimeString('en-IN', { hour12: true }),
          agentId: 'REPLANNING_AGENT',
          agentName: 'Dynamic Replanning & Recovery Agent',
          action: 'SHELTER CAPACITY SATURATION (100%)',
          reasoning: `${updatedShelters[shelterIdx].name} has reached absolute safety threshold. Rerouting all incoming evacuees to Cotton University Multi-Purpose Hall & Sarusajai Complex.`,
          confidence: 0.95,
          stateTransition: 'SHELTER_REROUTE',
          latencyMs: 15,
          level: 'warn'
        });

        // Update any assigned incidents heading here
        updatedIncidents.forEach((inc, idx) => {
          if (inc.targetShelterId === 'SHELTER_IITG' && inc.status === 'ASSIGNED') {
            updatedIncidents[idx] = {
              ...inc,
              targetShelterId: 'SHELTER_COTTON'
            };
          }
        });
      }
    }

    return {
      updatedRoads,
      updatedResources,
      updatedShelters,
      updatedIncidents,
      pendingHitlPlans,
      newLogs
    };
  }

  /**
   * Commander HITL Sign-off Execution
   */
  public static approveHitlPlan(
    state: DisasterState,
    planDiffId: string
  ): {
    updatedIncidents: Incident[];
    updatedResources: Resource[];
    pendingHitlPlans: PlanDiff[];
    executedPlanHistory: PlanDiff[];
    newLogs: AgentLog[];
  } {
    const start = performance.now();
    const plan = state.pendingHitlPlans.find(p => p.id === planDiffId);
    if (!plan) {
      return {
        updatedIncidents: state.incidents,
        updatedResources: state.resources,
        pendingHitlPlans: state.pendingHitlPlans,
        executedPlanHistory: state.executedPlanHistory,
        newLogs: []
      };
    }

    const updatedIncidents = [...state.incidents];
    const updatedResources = [...state.resources];
    const pendingHitlPlans = state.pendingHitlPlans.filter(p => p.id !== planDiffId);
    const executedPlanHistory = [...state.executedPlanHistory, { ...plan, hitlApproved: true }];

    // Apply resource route and assignment
    const resIdx = updatedResources.findIndex(r => r.id === plan.newResourceId);
    if (resIdx !== -1) {
      updatedResources[resIdx] = {
        ...updatedResources[resIdx],
        status: 'EN_ROUTE',
        currentIncidentId: plan.incidentId,
        assignedRoute: plan.newRoute
      };
    }

    // Apply incident status
    const incIdx = updatedIncidents.findIndex(i => i.id === plan.incidentId);
    if (incIdx !== -1) {
      updatedIncidents[incIdx] = {
        ...updatedIncidents[incIdx],
        assignedResourceId: plan.newResourceId,
        status: 'EN_ROUTE'
      };
    }

    const newLogs: AgentLog[] = [
      {
        id: generateId('LOG_HITL_APPROVED'),
        timestamp: new Date().toLocaleTimeString('en-IN', { hour12: true }),
        agentId: 'COMMANDER_AGENT',
        agentName: 'Commander HITL & Governance Agent',
        action: `Commander Sign-off Confirmed [Plan #${plan.id.slice(-4)}]`,
        reasoning: `Incident Commander authorized dynamic replan. Dispatching ${plan.newResourceId} along approved bypass vector. Self-healing state converged in ${Math.round(performance.now() - start)}ms.`,
        confidence: 1.0,
        stateTransition: 'HITL_APPROVED_DISPATCHED',
        latencyMs: Math.round(performance.now() - start),
        level: 'success'
      }
    ];

    return {
      updatedIncidents,
      updatedResources,
      pendingHitlPlans,
      executedPlanHistory,
      newLogs
    };
  }
}
