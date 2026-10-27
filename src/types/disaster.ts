/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Suraksha AI (सुरक्षा) - Pydantic-equivalent Type Definitions for Disaster Management
 * SDG 11 (Sustainable Cities) & SDG 13 (Climate Action)
 */

export type UrgencyLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type IncidentCategory = 
  | 'FLASH_FLOOD_STRANDED'
  | 'MEDICAL_EMERGENCY'
  | 'STRUCTURAL_COLLAPSE'
  | 'WATER_FOOD_DEPRIVATION'
  | 'ELDERLY_INFANT_RESCUE';

export type ResourceType = 
  | 'NDRF_INFLATABLE_BOAT'
  | 'SDRF_RESCUE_BOAT'
  | 'ARMY_BTR_AMPHIBIOUS'
  | 'AMBULANCE_ADVANCED'
  | 'HEV_RELIEF_TRUCK'
  | 'DRONE_SURVEILLANCE';

export type ResourceStatus = 'IDLE' | 'DISPATCHED' | 'EN_ROUTE' | 'ON_SCENE' | 'RETURNING' | 'MAINTENANCE_FAILURE';

export type RoadStatus = 'CLEAR' | 'WATERLOGGED' | 'SUBMERGED_IMPASSABLE' | 'BRIDGE_COLLAPSED';

export interface GeoLocation {
  lat: number;
  lng: number;
  landmark: string;
  subDistrict?: string;
}

export interface Incident {
  id: string;
  sourceText: string;
  callerContact?: string;
  location: GeoLocation;
  category: IncidentCategory;
  urgency: UrgencyLevel;
  peopleAffected: number;
  injuredCount: number;
  waterLevelMeters: number;
  assignedResourceId?: string;
  targetShelterId?: string;
  status: 'REPORTED' | 'TRIAGED' | 'ASSIGNED' | 'EN_ROUTE' | 'RESCUED' | 'REPLAN_REQUIRED';
  timestamp: string;
  confidenceScore: number;
  extractedNeeds: string[];
}

export interface Resource {
  id: string;
  name: string;
  unit: string; // e.g. "NDRF 1st Bn", "SDRF Assam", "Indian Army 51 Sub Area"
  type: ResourceType;
  location: GeoLocation;
  capacityPeople: number;
  medicalSuppliesRating: number; // 1-10
  status: ResourceStatus;
  currentIncidentId?: string;
  assignedRoute?: GeoLocation[];
  fuelPercent: number;
  speedKmh: number;
}

export interface Shelter {
  id: string;
  name: string;
  location: GeoLocation;
  maxCapacity: number;
  currentOccupancy: number;
  foodWaterPacks: number;
  medicalDoctors: number;
  floodSafeElevationMeters: number;
  status: 'OPERATIONAL' | 'NEAR_CAPACITY' | 'FULL' | 'COMPROMISED';
}

export interface RoadSegment {
  id: string;
  fromName: string;
  toName: string;
  fromCoords: [number, number];
  toCoords: [number, number];
  status: RoadStatus;
  floodDepthCm: number;
  distanceKm: number;
}

export interface PlanDiff {
  id: string;
  timestamp: string;
  triggerEvent: string;
  incidentId: string;
  oldResourceId?: string;
  newResourceId: string;
  oldRoute: GeoLocation[];
  newRoute: GeoLocation[];
  oldEtaMinutes: number;
  newEtaMinutes: number;
  riskScore: number; // 0 - 100
  casualtyMitigationProb: number; // 0 - 100%
  commanderReasoning: string;
  requiresHitlApproval: boolean;
  hitlApproved?: boolean;
}

export interface AgentLog {
  id: string;
  timestamp: string;
  agentId: 'INGESTION_AGENT' | 'ALLOCATION_AGENT' | 'REPLANNING_AGENT' | 'COMMANDER_AGENT';
  agentName: string;
  action: string;
  reasoning: string;
  confidence: number;
  stateTransition: string;
  latencyMs: number;
  level: 'info' | 'warn' | 'critical' | 'success';
}

export interface DisasterState {
  scenarioName: string;
  region: string;
  simulationTick: number;
  activeDisruptionCount: number;
  incidents: Incident[];
  resources: Resource[];
  shelters: Shelter[];
  roadNetwork: RoadSegment[];
  pendingHitlPlans: PlanDiff[];
  executedPlanHistory: PlanDiff[];
  agentLogs: AgentLog[];
  waterLevelTrend: 'RISING' | 'STABLE' | 'RECEDING';
  overallCasualtiesPrevented: number;
}
