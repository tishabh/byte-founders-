/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Cloud SQL (PostgreSQL) Drizzle Database Schema
 * Disaster Coordination Platform (SDG 11 & SDG 13)
 */

import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';

// Users / Commanders
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  role: text('role').default('COMMANDER'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Incidents / Distress Reports
export const incidents = pgTable('incidents', {
  id: text('id').primaryKey(),
  sourceText: text('source_text').notNull(),
  landmark: text('landmark').notNull(),
  lat: text('lat').notNull(),
  lng: text('lng').notNull(),
  category: text('category').notNull(),
  urgency: text('urgency').notNull(),
  peopleAffected: integer('people_affected').notNull().default(1),
  injuredCount: integer('injured_count').notNull().default(0),
  waterLevelMeters: text('water_level_meters').notNull().default('1.0'),
  assignedResourceId: text('assigned_resource_id'),
  targetShelterId: text('target_shelter_id'),
  status: text('status').notNull().default('REPORTED'),
  confidenceScore: text('confidence_score').notNull().default('0.9'),
  extractedNeeds: text('extracted_needs'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Rescue Resources & Fleet
export const resources = pgTable('resources', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  unit: text('unit').notNull(),
  type: text('type').notNull(),
  landmark: text('landmark').notNull(),
  lat: text('lat').notNull(),
  lng: text('lng').notNull(),
  capacityPeople: integer('capacity_people').notNull().default(8),
  medicalSuppliesRating: integer('medical_supplies_rating').notNull().default(8),
  status: text('status').notNull().default('IDLE'),
  fuelPercent: integer('fuel_percent').notNull().default(100),
  speedKmh: integer('speed_kmh').notNull().default(25),
  currentIncidentId: text('current_incident_id'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Dry Relief Shelters & Camps
export const shelters = pgTable('shelters', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  landmark: text('landmark').notNull(),
  lat: text('lat').notNull(),
  lng: text('lng').notNull(),
  maxCapacity: integer('max_capacity').notNull().default(200),
  currentOccupancy: integer('current_occupancy').notNull().default(0),
  foodWaterPacks: integer('food_water_packs').notNull().default(500),
  medicalDoctors: integer('medical_doctors').notNull().default(2),
  floodSafeElevationMeters: text('flood_safe_elevation_meters').notNull().default('12.0'),
  status: text('status').notNull().default('OPERATIONAL'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Autonomous Multi-Agent Swarm Logs
export const agentLogs = pgTable('agent_logs', {
  id: text('id').primaryKey(),
  timestamp: text('timestamp').notNull(),
  agentId: text('agent_id').notNull(),
  agentName: text('agent_name').notNull(),
  action: text('action').notNull(),
  reasoning: text('reasoning').notNull(),
  confidence: text('confidence').notNull().default('0.95'),
  stateTransition: text('state_transition'),
  latencyMs: integer('latency_ms').default(10),
  level: text('level').default('info'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Chaos Disruptions & Failure Injections
export const disruptions = pgTable('disruptions', {
  id: text('id').primaryKey(),
  type: text('type').notNull(),
  targetId: text('target_id'),
  description: text('description').notNull(),
  resolved: integer('resolved').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});
