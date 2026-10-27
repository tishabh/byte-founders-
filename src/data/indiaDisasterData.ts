/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Real-world Indian Disaster Scenario Seed Data
 * Region: Kamrup Metropolitan (Guwahati, Assam) - Brahmaputra River Basin
 * Authorities: National Disaster Response Force (NDRF 1st Bn), SDRF Assam, Indian Army 51 Sub Area
 */

import { Incident, Resource, Shelter, RoadSegment } from '../types/disaster';

export const INITIAL_SHELTERS: Shelter[] = [
  {
    id: 'SHELTER_IITG',
    name: 'IIT Guwahati Indoor Sports Complex (Camp Alpha)',
    location: {
      lat: 26.1895,
      lng: 91.6925,
      landmark: 'IIT Guwahati North Bank',
      subDistrict: 'Amingaon'
    },
    maxCapacity: 350,
    currentOccupancy: 210,
    foodWaterPacks: 1200,
    medicalDoctors: 4,
    floodSafeElevationMeters: 55.4,
    status: 'OPERATIONAL'
  },
  {
    id: 'SHELTER_SARUSAJAI',
    name: 'Sarusajai National Stadium Complex (Camp Bravo)',
    location: {
      lat: 26.1150,
      lng: 91.7690,
      landmark: 'Sarusajai Stadium, NH 27',
      subDistrict: 'Lokhra'
    },
    maxCapacity: 500,
    currentOccupancy: 440,
    foodWaterPacks: 650,
    medicalDoctors: 6,
    floodSafeElevationMeters: 52.1,
    status: 'NEAR_CAPACITY'
  },
  {
    id: 'SHELTER_COTTON',
    name: 'Cotton University Multi-Purpose Hall (Camp Charlie)',
    location: {
      lat: 26.1870,
      lng: 91.7510,
      landmark: 'Panbazar, near Dighalipukhuri',
      subDistrict: 'Guwahati Central'
    },
    maxCapacity: 250,
    currentOccupancy: 120,
    foodWaterPacks: 900,
    medicalDoctors: 3,
    floodSafeElevationMeters: 49.8,
    status: 'OPERATIONAL'
  },
  {
    id: 'SHELTER_GMCH_CAMP',
    name: 'GMCH Emergency Field Triage Camp (Trauma Center)',
    location: {
      lat: 26.1585,
      lng: 91.7720,
      landmark: 'Bhangagarh Hill Base',
      subDistrict: 'Dispur'
    },
    maxCapacity: 150,
    currentOccupancy: 85,
    foodWaterPacks: 400,
    medicalDoctors: 12,
    floodSafeElevationMeters: 62.0,
    status: 'OPERATIONAL'
  }
];

export const INITIAL_RESOURCES: Resource[] = [
  {
    id: 'RES_NDRF_B1',
    name: 'NDRF Rescue Craft 1-A (Gemini Boat)',
    unit: '1st Battalion NDRF, Patgaon',
    type: 'NDRF_INFLATABLE_BOAT',
    location: {
      lat: 26.1450,
      lng: 91.6850,
      landmark: 'Pandu Port Staging Area'
    },
    capacityPeople: 12,
    medicalSuppliesRating: 8,
    status: 'IDLE',
    fuelPercent: 92,
    speedKmh: 35
  },
  {
    id: 'RES_NDRF_B2',
    name: 'NDRF Motorized Zodiac 1-B',
    unit: '1st Battalion NDRF, Patgaon',
    type: 'NDRF_INFLATABLE_BOAT',
    location: {
      lat: 26.1760,
      lng: 91.7300,
      landmark: 'Bharalumukh Ghat'
    },
    capacityPeople: 15,
    medicalSuppliesRating: 7,
    status: 'IDLE',
    fuelPercent: 88,
    speedKmh: 40
  },
  {
    id: 'RES_SDRF_S1',
    name: 'SDRF Quick Response Squad 4',
    unit: 'State Disaster Response Force Assam',
    type: 'SDRF_RESCUE_BOAT',
    location: {
      lat: 26.1920,
      lng: 91.7580,
      landmark: 'Uzan Bazar Ferry Terminal'
    },
    capacityPeople: 10,
    medicalSuppliesRating: 9,
    status: 'IDLE',
    fuelPercent: 78,
    speedKmh: 30
  },
  {
    id: 'RES_ARMY_AMPHIB',
    name: 'Indian Army Amphibious BTR-80',
    unit: 'Narangi Cantonment 51 Sub Area',
    type: 'ARMY_BTR_AMPHIBIOUS',
    location: {
      lat: 26.1320,
      lng: 91.7200,
      landmark: 'Basistha Staging Camp'
    },
    capacityPeople: 22,
    medicalSuppliesRating: 9,
    status: 'IDLE',
    fuelPercent: 95,
    speedKmh: 28
  },
  {
    id: 'RES_AMBULANCE_ADV',
    name: 'Assam 108 Advanced Life Support #14',
    unit: 'Emergency Medical Services, GMCH',
    type: 'AMBULANCE_ADVANCED',
    location: {
      lat: 26.1580,
      lng: 91.7700,
      landmark: 'GMCH Bhangagarh Hospital'
    },
    capacityPeople: 4,
    medicalSuppliesRating: 10,
    status: 'IDLE',
    fuelPercent: 90,
    speedKmh: 60
  }
];

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'INC_SOS_01',
    sourceText: 'URGENT: Flash flood breached river wall near Pandu Temple. 18 people stranded on rooftops, 3 elderly women with hypothermia, water 6 feet and rising fast!',
    callerContact: '+91 94350 XXXXX',
    location: {
      lat: 26.1580,
      lng: 91.6890,
      landmark: 'Pandu Temple Riverside colony',
      subDistrict: 'Jalukbari'
    },
    category: 'FLASH_FLOOD_STRANDED',
    urgency: 'CRITICAL',
    peopleAffected: 18,
    injuredCount: 3,
    waterLevelMeters: 2.1,
    status: 'REPORTED',
    timestamp: '10:42 AM IST',
    confidenceScore: 0.96,
    extractedNeeds: ['High-capacity flood boat', 'Trauma hypothermia kits', 'Evac to Camp Alpha']
  },
  {
    id: 'INC_SOS_02',
    sourceText: 'Deepor Beel overflow flooded village school building. 24 children and 2 teachers trapped on second floor. Electricity lines collapsed nearby.',
    callerContact: '+91 98640 XXXXX',
    location: {
      lat: 26.1240,
      lng: 91.6520,
      landmark: 'Deepor Beel High School',
      subDistrict: 'Azara'
    },
    category: 'ELDERLY_INFANT_RESCUE',
    urgency: 'CRITICAL',
    peopleAffected: 26,
    injuredCount: 1,
    waterLevelMeters: 1.8,
    status: 'REPORTED',
    timestamp: '10:44 AM IST',
    confidenceScore: 0.94,
    extractedNeeds: ['Amphibious carrier', 'Life jackets', 'Pediatric rations']
  },
  {
    id: 'INC_SOS_03',
    sourceText: 'Landslide blocked hillside approach road in Kharghuli. Wall collapsed on 2 houses. 7 injured needing stretcher transfer to GMCH.',
    callerContact: '+91 97060 XXXXX',
    location: {
      lat: 26.1950,
      lng: 91.7760,
      landmark: 'Kharghuli Hillside Sector 3',
      subDistrict: 'Noonmati'
    },
    category: 'STRUCTURAL_COLLAPSE',
    urgency: 'HIGH',
    peopleAffected: 9,
    injuredCount: 7,
    waterLevelMeters: 0.4,
    status: 'REPORTED',
    timestamp: '10:45 AM IST',
    confidenceScore: 0.91,
    extractedNeeds: ['Advanced ALS Ambulance', 'Spine boards', 'Trauma surgery priority']
  },
  {
    id: 'INC_SOS_04',
    sourceText: 'Waterlogging at Bharalumukh market. 12 shopkeepers trapped on upper level, clean drinking water exhausted for 18 hours.',
    callerContact: '+91 98540 XXXXX',
    location: {
      lat: 26.1730,
      lng: 91.7330,
      landmark: 'Bharalumukh Supermarket',
      subDistrict: 'Bharalu'
    },
    category: 'WATER_FOOD_DEPRIVATION',
    urgency: 'MEDIUM',
    peopleAffected: 12,
    injuredCount: 0,
    waterLevelMeters: 1.2,
    status: 'REPORTED',
    timestamp: '10:47 AM IST',
    confidenceScore: 0.88,
    extractedNeeds: ['Drinking water supply', 'Zodiac escort', 'Camp Charlie evacuation']
  },
  {
    id: 'INC_SOS_05',
    sourceText: 'Pandu Port Jetty: 9 dockworkers and security guards stranded on loading dock gantry as water submerged lower stairs.',
    callerContact: '+91 94351 XXXXX',
    location: {
      lat: 26.1595,
      lng: 91.6915,
      landmark: 'Pandu Port Jetty Gantry (North Sector)',
      subDistrict: 'Jalukbari'
    },
    category: 'FLASH_FLOOD_STRANDED',
    urgency: 'HIGH',
    peopleAffected: 9,
    injuredCount: 1,
    waterLevelMeters: 2.3,
    status: 'REPORTED',
    timestamp: '10:48 AM IST',
    confidenceScore: 0.93,
    extractedNeeds: ['Rescue boat tether', 'Lifebuoys']
  },
  {
    id: 'INC_SOS_06',
    sourceText: 'Pandu Sadar Bazar: Medical dispensary flooded up to chest level. Pharmacist and 3 patients need emergency stretcher evacuation.',
    callerContact: '+91 94352 XXXXX',
    location: {
      lat: 26.1565,
      lng: 91.6875,
      landmark: 'Pandu Sadar Bazar Dispensary',
      subDistrict: 'Jalukbari'
    },
    category: 'MEDICAL_EMERGENCY',
    urgency: 'CRITICAL',
    peopleAffected: 4,
    injuredCount: 3,
    waterLevelMeters: 1.6,
    status: 'REPORTED',
    timestamp: '10:49 AM IST',
    confidenceScore: 0.95,
    extractedNeeds: ['Trauma ALS transport', 'Cold storage medication salvage']
  }
];

export const INITIAL_ROAD_NETWORK: RoadSegment[] = [
  {
    id: 'ROAD_SARAIGHAT_BRIDGE',
    fromName: 'Jalukbari Intersection (NH 27)',
    toName: 'Amingaon / IIT Guwahati North Bank',
    fromCoords: [26.1480, 91.6620],
    toCoords: [26.1820, 91.6850],
    status: 'CLEAR',
    floodDepthCm: 15,
    distanceKm: 4.8
  },
  {
    id: 'ROAD_AT_ROAD_CENTRAL',
    fromName: 'Jalukbari Hub',
    toName: 'Bharalumukh Central',
    fromCoords: [26.1480, 91.6620],
    toCoords: [26.1730, 91.7330],
    status: 'CLEAR',
    floodDepthCm: 30,
    distanceKm: 7.2
  },
  {
    id: 'ROAD_GS_ROAD',
    fromName: 'Panbazar Cotton Zone',
    toName: 'GMCH Bhangagarh / Dispur',
    fromCoords: [26.1870, 91.7510],
    toCoords: [26.1585, 91.7720],
    status: 'CLEAR',
    floodDepthCm: 10,
    distanceKm: 5.1
  },
  {
    id: 'ROAD_NH27_BYPASS',
    fromName: 'Jalukbari Southern Flyover',
    toName: 'Sarusajai Stadium Complex',
    fromCoords: [26.1450, 91.6680],
    toCoords: [26.1150, 91.7690],
    status: 'CLEAR',
    floodDepthCm: 20,
    distanceKm: 11.4
  },
  {
    id: 'ROAD_PANDU_RIVERSIDE',
    fromName: 'Pandu Port Ghat',
    toName: 'Jalukbari Roundabout',
    fromCoords: [26.1550, 91.6930],
    toCoords: [26.1480, 91.6620],
    status: 'CLEAR',
    floodDepthCm: 25,
    distanceKm: 3.6
  }
];

export const BRAHMAPUTRA_FLOOD_ZONE_POLYGON: [number, number][] = [
  [26.2050, 91.6500],
  [26.2100, 91.7000],
  [26.2000, 91.7500],
  [26.1950, 91.7800],
  [26.1880, 91.8000],
  [26.1750, 91.7800],
  [26.1680, 91.7450],
  [26.1580, 91.7100],
  [26.1420, 91.6700],
  [26.1500, 91.6400]
];
