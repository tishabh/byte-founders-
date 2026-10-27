/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Suraksha AI (सुरक्षा) - Dynamic Emergency Resource Coordination Platform
 * Topic 9: Disaster Management (SDG 11 & SDG 13)
 * Full Multi-Page Application with Liquid Glass & Glassmorphism Design
 */

import React, { useState, useEffect, useCallback } from 'react';
import { DisasterState, Incident, Resource, Shelter, RoadSegment, GeoLocation, AgentLog } from './types/disaster';
import {
  INITIAL_INCIDENTS,
  INITIAL_RESOURCES,
  INITIAL_SHELTERS,
  INITIAL_ROAD_NETWORK
} from './data/indiaDisasterData';
import { MultiAgentOrchestrator, generateId } from './services/agentEngine';
import { Navigation, PageId } from './components/Navigation';
import { MetricsHeader } from './components/MetricsHeader';
import { HitlModal } from './components/HitlModal';
import { DocsViewerModal } from './components/DocsViewerModal';

// Dedicated Pages
import { MapPage } from './pages/MapPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { SwarmPage } from './pages/SwarmPage';
import { SosPage } from './pages/SosPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { DossierPage } from './pages/DossierPage';
import { ThreeDPage } from './pages/ThreeDPage';
import { CitizenChatPage } from './pages/CitizenChatPage';
import { RealLifeDataBar } from './components/RealLifeDataBar';
import { RealLifeSectorProfile } from './services/liveIndiaDataService';
import { syncIncidentToDb, syncAgentLogToDb } from './services/dbClient';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('MAP');

  // Master Disaster State Machine (Shared across all pages)
  const [disasterState, setDisasterState] = useState<DisasterState>(() => ({
    scenarioName: 'Assam Monsoon Flash Flood - Brahmaputra Basin Surge',
    region: 'Kamrup Metropolitan, Guwahati, Assam, India',
    simulationTick: 1,
    activeDisruptionCount: 0,
    incidents: INITIAL_INCIDENTS,
    resources: INITIAL_RESOURCES,
    shelters: INITIAL_SHELTERS,
    roadNetwork: INITIAL_ROAD_NETWORK,
    pendingHitlPlans: [],
    executedPlanHistory: [],
    agentLogs: [
      {
        id: 'INIT_01',
        timestamp: '10:40 AM IST',
        agentId: 'INGESTION_AGENT',
        agentName: 'SOS Ingestion & Triage Agent',
        action: 'Swarm Telemetry Online',
        reasoning: 'Connected to Indian Meteorological Department (IMD) doppler radar and Assam State Disaster Management Authority (ASDMA) feeds. Monitoring Brahmaputra water mark at Saraighat.',
        confidence: 0.99,
        stateTransition: 'SYSTEM_BOOT -> TELEMETRY_ACTIVE',
        latencyMs: 12,
        level: 'info'
      },
      {
        id: 'INIT_02',
        timestamp: '10:41 AM IST',
        agentId: 'ALLOCATION_AGENT',
        agentName: 'Situational Awareness & Allocation Agent',
        action: 'Resource Staging Completed',
        reasoning: 'Synchronized with 1st Battalion NDRF Patgaon base, SDRF Assam squads, and Indian Army 51 Sub Area Narangi Cantonment. 5 assets staged with medical kits.',
        confidence: 0.98,
        stateTransition: 'ASSET_INVENTORY_SYNC',
        latencyMs: 16,
        level: 'success'
      }
    ],
    waterLevelTrend: 'RISING',
    overallCasualtiesPrevented: 64
  }));

  const [activeAgentId, setActiveAgentId] = useState<string>('ALLOCATION_AGENT');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showHitlModal, setShowHitlModal] = useState<boolean>(false);
  const [showDocsModal, setShowDocsModal] = useState<boolean>(false);
  const [quotaExceeded, setQuotaExceeded] = useState<boolean>(false);

  // Google Maps Platform Tier 2 Quota Exceeded listener
  useEffect(() => {
    const handleQuota = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  // Initial allocation pass
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisasterState(prev => {
        const allocation = MultiAgentOrchestrator.allocateResources(prev);
        return {
          ...prev,
          incidents: allocation.updatedIncidents,
          resources: allocation.updatedResources,
          shelters: allocation.updatedShelters,
          agentLogs: [...prev.agentLogs, ...allocation.newLogs]
        };
      });
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // SOS Ingestion
  const handleIngestSOS = useCallback((rawText: string, location: GeoLocation) => {
    setIsProcessing(true);
    setActiveAgentId('INGESTION_AGENT');

    const triage = MultiAgentOrchestrator.triageIncident(rawText, location, disasterState.incidents);

    // Asynchronously persist to Cloud SQL PostgreSQL
    if (!triage.isDuplicate) {
      syncIncidentToDb(triage.incident).catch(console.error);
    }
    syncAgentLogToDb(triage.log).catch(console.error);

    setDisasterState(prev => {
      const updatedIncidents = triage.isDuplicate
        ? prev.incidents
        : [triage.incident, ...prev.incidents];

      const stateWithIncident: DisasterState = {
        ...prev,
        incidents: updatedIncidents,
        agentLogs: [triage.log, ...prev.agentLogs]
      };

      setActiveAgentId('ALLOCATION_AGENT');
      const allocation = MultiAgentOrchestrator.allocateResources(stateWithIncident);

      return {
        ...stateWithIncident,
        incidents: allocation.updatedIncidents,
        resources: allocation.updatedResources,
        shelters: allocation.updatedShelters,
        agentLogs: [...allocation.newLogs, triage.log, ...prev.agentLogs]
      };
    });

    setIsProcessing(false);
  }, [disasterState.incidents]);

  // Disruption Injection
  const handleInjectDisruption = useCallback((
    type: 'BRIDGE_COLLAPSE' | 'BOAT_FAILURE' | 'SHELTER_OVERFLOW' | 'SURGE_RISING',
    targetId?: string
  ) => {
    setIsProcessing(true);
    setActiveAgentId('REPLANNING_AGENT');

    const result = MultiAgentOrchestrator.triggerDisruption(disasterState, type, targetId);

    setDisasterState(prev => ({
      ...prev,
      activeDisruptionCount: prev.activeDisruptionCount + 1,
      roadNetwork: result.updatedRoads,
      resources: result.updatedResources,
      shelters: result.updatedShelters,
      incidents: result.updatedIncidents,
      pendingHitlPlans: [...prev.pendingHitlPlans, ...result.pendingHitlPlans],
      agentLogs: [...result.newLogs, ...prev.agentLogs]
    }));

    if (result.pendingHitlPlans.length > 0) {
      setActiveAgentId('COMMANDER_AGENT');
      setShowHitlModal(true);
    }

    setIsProcessing(false);
  }, [disasterState]);

  // HITL Commander Approvals
  const handleApproveHitl = useCallback((planId: string) => {
    setDisasterState(prev => {
      const outcome = MultiAgentOrchestrator.approveHitlPlan(prev, planId);
      return {
        ...prev,
        incidents: outcome.updatedIncidents,
        resources: outcome.updatedResources,
        pendingHitlPlans: outcome.pendingHitlPlans,
        executedPlanHistory: outcome.executedPlanHistory,
        agentLogs: [...outcome.newLogs, ...prev.agentLogs],
        overallCasualtiesPrevented: prev.overallCasualtiesPrevented + 18
      };
    });
    setShowHitlModal(false);
  }, []);

  const handleRejectHitl = useCallback((planId: string) => {
    setDisasterState(prev => ({
      ...prev,
      pendingHitlPlans: prev.pendingHitlPlans.filter(p => p.id !== planId),
      agentLogs: [
        {
          id: generateId('LOG_HITL_REJECTED'),
          timestamp: new Date().toLocaleTimeString('en-IN', { hour12: true }),
          agentId: 'COMMANDER_AGENT',
          agentName: 'Commander HITL & Governance Agent',
          action: `Plan #${planId.slice(-4)} Rejected by Commander`,
          reasoning: 'Incident commander issued tactical override. Assets ordered to maintain holding pattern.',
          confidence: 1.0,
          stateTransition: 'COMMANDER_OVERRIDE_ABORT',
          latencyMs: 10,
          level: 'warn'
        },
        ...prev.agentLogs
      ]
    }));
    setShowHitlModal(false);
  }, []);

  // Mark Incident Rescued
  const handleMarkRescued = useCallback((incidentId: string) => {
    setDisasterState(prev => {
      const incIdx = prev.incidents.findIndex(i => i.id === incidentId);
      if (incIdx === -1) return prev;

      const inc = prev.incidents[incIdx];
      const updatedIncidents = [...prev.incidents];
      updatedIncidents[incIdx] = { ...inc, status: 'RESCUED' };

      // Free up assigned resource
      const updatedResources = prev.resources.map(r => {
        if (r.id === inc.assignedResourceId) {
          return { ...r, status: 'IDLE' as const, currentIncidentId: undefined };
        }
        return r;
      });

      return {
        ...prev,
        incidents: updatedIncidents,
        resources: updatedResources,
        overallCasualtiesPrevented: prev.overallCasualtiesPrevented + inc.peopleAffected,
        agentLogs: [
          {
            id: generateId('LOG_RESCUE'),
            timestamp: new Date().toLocaleTimeString('en-IN', { hour12: true }),
            agentId: 'ALLOCATION_AGENT',
            agentName: 'Situational Awareness & Allocation Agent',
            action: `Rescue Confirmed at ${inc.location.landmark}`,
            reasoning: `All ${inc.peopleAffected} trapped citizens secured and transported to dry shelter. Resource ${inc.assignedResourceId || 'team'} returned to staging status.`,
            confidence: 1.0,
            stateTransition: 'MISSION_COMPLETE',
            latencyMs: 8,
            level: 'success'
          },
          ...prev.agentLogs
        ]
      };
    });
  }, []);

  // Reset Simulation
  const handleReset = useCallback(() => {
    setDisasterState({
      scenarioName: 'Assam Monsoon Flash Flood - Brahmaputra Basin Surge',
      region: 'Kamrup Metropolitan, Guwahati, Assam, India',
      simulationTick: 1,
      activeDisruptionCount: 0,
      incidents: INITIAL_INCIDENTS,
      resources: INITIAL_RESOURCES,
      shelters: INITIAL_SHELTERS,
      roadNetwork: INITIAL_ROAD_NETWORK,
      pendingHitlPlans: [],
      executedPlanHistory: [],
      agentLogs: [
        {
          id: generateId('RESET_LOG'),
          timestamp: new Date().toLocaleTimeString('en-IN', { hour12: true }),
          agentId: 'INGESTION_AGENT',
          agentName: 'SOS Ingestion & Triage Agent',
          action: 'Simulation State Reset',
          reasoning: 'Re-initialized Guwahati flood coordinate grid and NDRF unit staging.',
          confidence: 1.0,
          stateTransition: 'STATE_RESET',
          latencyMs: 5,
          level: 'info'
        }
      ],
      waterLevelTrend: 'RISING',
      overallCasualtiesPrevented: 64
    });
  }, []);

  return (
    <div className="relative flex flex-col h-screen w-screen bg-[#030712] text-slate-100 overflow-hidden font-sans select-none">
      {/* Liquid Glass Ambient Background Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[550px] h-[550px] bg-cyan-500/15 rounded-full blur-[120px] pointer-events-none animate-float-slow" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none animate-float-slow" style={{ animationDelay: '-6s' }} />
      <div className="fixed top-[40%] right-[25%] w-[450px] h-[450px] bg-indigo-500/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Tier 2 Quota Defense Notice */}
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Top Header Telemetry Bar */}
      <MetricsHeader
        state={disasterState}
        onOpenHitl={() => setShowHitlModal(true)}
        onOpenDocs={() => setShowDocsModal(true)}
        onReset={handleReset}
      />

      {/* Multi-Page Liquid Glass Navigation Bar */}
      <Navigation
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        pendingHitlCount={disasterState.pendingHitlPlans.length}
        onOpenHitl={() => setShowHitlModal(true)}
        onReset={handleReset}
      />

      {/* Real-Life Indian Disaster & Meteorological Telemetry Bar */}
      <RealLifeDataBar
        onSectorChange={(sector) => {
          setDisasterState(prev => ({
            ...prev,
            scenarioName: `${sector.name} Crisis Telemetry`,
            region: `${sector.name}, ${sector.state}`,
            agentLogs: [
              {
                id: generateId('SECTOR_SWAP'),
                timestamp: new Date().toLocaleTimeString('en-IN', { hour12: true }),
                agentId: 'INGESTION_AGENT',
                agentName: 'SOS Ingestion & Triage Agent',
                action: `Sector Synced: ${sector.name}`,
                reasoning: `Connected to ${sector.cwcStation} & ${sector.nodalAgency}. CWC Danger Mark: ${sector.cwcGauge.dangerLevelMeters}m (Current: ${sector.cwcGauge.currentWaterLevelMeters}m). Live Open-Meteo Doppler precipitation active.`,
                confidence: 0.99,
                stateTransition: 'SECTOR_GEO_CALIBRATION',
                latencyMs: 14,
                level: 'info'
              },
              ...prev.agentLogs
            ]
          }));
        }}
      />

      {/* Main Multi-Page Body Content */}
      <main className="flex-1 overflow-hidden min-h-0 flex flex-col relative z-20">
        {currentPage === 'MAP' && (
          <MapPage
            state={disasterState}
            onNavigateToSimulator={() => setCurrentPage('SIMULATOR')}
            onNavigateToSos={() => setCurrentPage('SOS')}
            onNavigateTo3D={() => setCurrentPage('THREED')}
            onNavigateToChat={() => setCurrentPage('CHAT')}
          />
        )}

        {currentPage === 'THREED' && (
          <ThreeDPage
            state={disasterState}
            onNavigateToSos={() => setCurrentPage('SOS')}
            onNavigateToSimulator={() => setCurrentPage('SIMULATOR')}
          />
        )}

        {currentPage === 'CHAT' && (
          <CitizenChatPage
            state={disasterState}
            onIngestSOS={handleIngestSOS}
            onNavigateToMap={() => setCurrentPage('MAP')}
          />
        )}

        {currentPage === 'SIMULATOR' && (
          <SimulatorPage
            state={disasterState}
            onInject={handleInjectDisruption}
            onApprovePlan={handleApproveHitl}
            onRejectPlan={handleRejectHitl}
            isProcessing={isProcessing}
            onNavigateToMap={() => setCurrentPage('MAP')}
          />
        )}

        {currentPage === 'SWARM' && (
          <SwarmPage
            state={disasterState}
            activeAgentId={activeAgentId}
          />
        )}

        {currentPage === 'SOS' && (
          <SosPage
            state={disasterState}
            onIngest={handleIngestSOS}
            onMarkRescued={handleMarkRescued}
            isProcessing={isProcessing}
          />
        )}

        {currentPage === 'RESOURCES' && (
          <ResourcesPage
            state={disasterState}
            onNavigateToMap={() => setCurrentPage('MAP')}
          />
        )}

        {currentPage === 'DOSSIER' && (
          <DossierPage />
        )}
      </main>

      {/* Modals */}
      {showHitlModal && (
        <HitlModal
          plans={disasterState.pendingHitlPlans}
          onApprove={handleApproveHitl}
          onReject={handleRejectHitl}
          onClose={() => setShowHitlModal(false)}
        />
      )}

      {showDocsModal && (
        <DocsViewerModal
          onClose={() => setShowDocsModal(false)}
        />
      )}
    </div>
  );
}
