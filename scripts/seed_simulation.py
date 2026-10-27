#!/usr/bin/env python3
"""
scripts/seed_simulation.py
Seeds realistic Indian flood scenario data for Kamrup Metropolitan (Guwahati, Assam).
Authorities: NDRF 1st Bn, SDRF Assam, Indian Army 51 Sub Area
"""

import json

def generate_seed_data():
    scenario = {
        "scenario_name": "Brahmaputra Flood Surge 2026 - Kamrup Metropolitan",
        "region": "Guwahati, Assam, India",
        "danger_mark_meters": 49.68,
        "current_water_level": 51.48, # 1.8m above danger mark
        "incidents": [
            {
                "id": "INC_01",
                "source": "Pandu Ghat Temple: 18 villagers stranded on roof, 3 hypothermia cases.",
                "lat": 26.1580,
                "lng": 91.6890,
                "urgency": "CRITICAL",
                "people_affected": 18,
                "injured_count": 3,
                "water_depth_m": 2.1
            },
            {
                "id": "INC_02",
                "source": "Deepor Beel School: 24 students marooned on 2nd floor, water rising.",
                "lat": 26.1240,
                "lng": 91.6520,
                "urgency": "CRITICAL",
                "people_affected": 24,
                "injured_count": 1,
                "water_depth_m": 1.8
            },
            {
                "id": "INC_03",
                "source": "Kharghuli Landslide: Wall collapse onto 2 houses, 7 traumatic injuries.",
                "lat": 26.1950,
                "lng": 91.7760,
                "urgency": "HIGH",
                "people_affected": 9,
                "injured_count": 7,
                "water_depth_m": 0.4
            }
        ],
        "resources": [
            {
                "id": "RES_NDRF_B1",
                "name": "NDRF Rescue Craft 1-A (Gemini Boat)",
                "unit": "1st Battalion NDRF, Patgaon",
                "capacity": 12,
                "lat": 26.1450,
                "lng": 91.6850,
                "speed_kmh": 35
            },
            {
                "id": "RES_ARMY_AMPHIB",
                "name": "Indian Army Amphibious BTR-80",
                "unit": "Narangi Cantonment 51 Sub Area",
                "capacity": 22,
                "lat": 26.1320,
                "lng": 91.7200,
                "speed_kmh": 28
            }
        ],
        "shelters": [
            {
                "id": "SHELTER_IITG",
                "name": "IIT Guwahati Indoor Sports Complex",
                "max_capacity": 350,
                "current_occupancy": 210,
                "elevation_m": 55.4
            },
            {
                "id": "SHELTER_SARUSAJAI",
                "name": "Sarusajai National Stadium Complex",
                "max_capacity": 500,
                "current_occupancy": 440,
                "elevation_m": 52.1
            }
        ]
    }
    return scenario

if __name__ == "__main__":
    data = generate_seed_data()
    print(f"Loaded simulation scenario: {data['scenario_name']}")
    print(f"Seeded {len(data['incidents'])} incidents, {len(data['resources'])} assets, {len(data['shelters'])} shelters.")
