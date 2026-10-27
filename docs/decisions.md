# Architecture Decision Records (ADR)
## Project: AegisRelief AI — Disaster Emergency Resource Coordination

---

### ADR-001: Multi-Agent StateGraph Architecture over Single LLM Agent or Rule-Based Dispatcher

**Status:** Accepted  
**Date:** 2026-10-27  
**Deciders:** Team HackOween Architecture Review Board  

#### Context & Problem
Emergency disaster coordination requires:
1. High-frequency perception (SOS ingestion, water-level sensors, bridge structural alerts).
2. Complex spatial-temporal optimization (matching boat capacities against flood depths and shelter saturation).
3. Resilient self-healing (re-planning when a bridge collapses or boat engine fails).
4. Strict safety compliance (human incident commanders must authorize high-risk actions).

#### Decision
We chose **Multi-Agent StateGraph Architecture** divided into 4 specialized autonomous nodes:
1. `IngestionTriageAgent`: Ingests multi-lingual SOS distress calls, deduplicates, and calculates urgency.
2. `SituationalAllocatorAgent`: Matches rescue units (NDRF, SDRF, Army) against shelters and incidents.
3. `DynamicReplanningAgent`: Reacts to disruptions (bridge collapse, boat engine failure) with topological rerouting.
4. `CommanderHITLAgent`: Human-in-the-Loop gate with PlanDiff visualization and 1-click authorization.

#### Rationale
- **Deterministic Routing + Reasoning:** Unlike black-box monolithic LLM prompts that hallucinate impossible paths, StateGraph preserves spatial invariants.
- **Dynamic Self-Healing:** The cyclic graph transitions smoothly between failure detection and replanning without crashes.
- **Safety Governance:** HITL gate guarantees military-grade accountability before high-risk mass re-routing occurs.
