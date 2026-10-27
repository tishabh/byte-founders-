# AegisRelief AI — Architecture & StateGraph Specification

## 1. System Overview
AegisRelief AI is an autonomous, self-healing multi-agent disaster resource coordination system engineered for high-consequence flood disasters (SDG 11 & SDG 13).

## 2. Multi-Agent StateGraph Specification
```mermaid
stateDiagram-v2
    [*] --> IngestionTriageAgent: Multi-lingual SOS (SMS/Voice/Radio)
    IngestionTriageAgent --> SituationalAllocatorAgent: Triaged Incidents & Severity Matrix
    
    state SituationalAllocatorAgent {
        [*] --> CapacityMatching
        CapacityMatching --> RouteOptimization
        RouteOptimization --> DispatchPlanGenerated
    }
    
    DispatchPlanGenerated --> ExecutionTelemetryMonitor: Assets Deployed (NDRF/SDRF/Army)
    ExecutionTelemetryMonitor --> DisasterDisruptionTrigger: Real-time Telemetry
    DisasterDisruptionTrigger --> DynamicReplanningAgent: [Bridge Cut / Boat Down / Shelter Full]
    
    state DynamicReplanningAgent {
        [*] --> InvalidateFailedRoutes
        InvalidateFailedRoutes --> TopologicalGraphShortestPath
        TopologicalGraphShortestPath --> AssetHotSwapAuction
        AssetHotSwapAuction --> PlanDiffComputation
    }
    
    PlanDiffComputation --> CommanderHITLAgent: High-Risk Detour (>15m)
    
    state CommanderHITLAgent {
        [*] --> RiskScoring
        RiskScoring --> AwaitingCommander1ClickSignOff
        AwaitingCommander1ClickSignOff --> HITL_Approved: Incident Commander Sign-off
        AwaitingCommander1ClickSignOff --> HITL_Rejected: Commander Override
    }
    
    HITL_Approved --> ExecutionTelemetryMonitor: Re-route Vector Dispatched
    HITL_Rejected --> SituationalAllocatorAgent: Fallback Strategy Re-evaluated
```

## 3. Data Flow & Latency Budget
- **Ingestion & Triage:** < 12ms (Heuristic Fast Path) / < 850ms (Gemini 2.5 Flash Multilingual API)
- **Situational Allocation:** < 18ms (Multi-Objective Constraint Solver)
- **Disruption Detection & Edge Invalidation:** < 5ms
- **Topological Shortest Path Replanning:** < 15ms
- **Commander Gate Presentation:** Immediate async render with full PlanDiff audit trail.
