/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Real-Life Indian Disaster Telemetry Bar
 * Live connection to Open-Meteo Weather API & Central Water Commission (CWC) River Gauges
 */

import React, { useState, useEffect } from 'react';
import {
  fetchLiveIndianWeather,
  LiveWeatherData,
  REAL_LIFE_INDIAN_SECTORS,
  RealLifeSectorProfile
} from '../services/liveIndiaDataService';
import { Radio, CloudRain, Thermometer, Wind, Droplets, AlertTriangle, RefreshCw, Globe, PhoneCall, Building2 } from 'lucide-react';

interface RealLifeDataBarProps {
  onSectorChange?: (sector: RealLifeSectorProfile) => void;
}

export const RealLifeDataBar: React.FC<RealLifeDataBarProps> = ({ onSectorChange }) => {
  const [selectedSector, setSelectedSector] = useState<RealLifeSectorProfile>(REAL_LIFE_INDIAN_SECTORS[0]);
  const [weatherData, setWeatherData] = useState<LiveWeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  const loadWeather = async (sector: RealLifeSectorProfile) => {
    setIsLoading(true);
    try {
      const data = await fetchLiveIndianWeather(sector.coordinates.lat, sector.coordinates.lng);
      setWeatherData(data);
      setLastRefreshed(new Date().toLocaleTimeString('en-IN', { hour12: true }));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWeather(selectedSector);
    // Poll real-time weather every 3 minutes
    const interval = setInterval(() => loadWeather(selectedSector), 180000);
    return () => clearInterval(interval);
  }, [selectedSector]);

  const handleSelectSector = (sector: RealLifeSectorProfile) => {
    setSelectedSector(sector);
    onSectorChange?.(sector);
  };

  const dangerDiff = parseFloat(
    (selectedSector.cwcGauge.currentWaterLevelMeters - selectedSector.cwcGauge.dangerLevelMeters).toFixed(2)
  );

  return (
    <div className="liquid-glass rounded-2xl mx-3 mt-2 p-3 text-slate-100 shadow-xl border border-white/15 relative overflow-hidden text-xs">
      {/* Background Refraction */}
      <div className="absolute top-0 right-1/4 w-48 h-20 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Sector Selector with Real Indian Authorities */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-extrabold text-white text-xs flex items-center gap-1.5">
              <span>REAL-LIFE INDIA TELEMETRY:</span>
            </span>
          </div>

          {/* Sector Switcher Buttons */}
          <div className="flex items-center gap-1">
            {REAL_LIFE_INDIAN_SECTORS.map(sec => (
              <button
                key={sec.id}
                onClick={() => handleSelectSector(sec)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                  selectedSector.id === sec.id
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md font-bold'
                    : 'liquid-glass-interactive text-slate-300 hover:text-white'
                }`}
              >
                {sec.name}
              </button>
            ))}
          </div>
        </div>

        {/* Center: Live CWC River Gauge */}
        <div className="flex flex-wrap items-center gap-3 bg-black/25 px-3 py-1.5 rounded-xl border border-white/10">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="text-[11px]">
              <span className="text-slate-400">CWC River Gauge: </span>
              <b className="text-white">{selectedSector.cwcGauge.riverName} ({selectedSector.cwcGauge.stationName})</b>
            </div>
          </div>

          <div className="text-[11px] flex items-center gap-2">
            <span>
              Stage: <b className="text-red-400">{selectedSector.cwcGauge.currentWaterLevelMeters} m</b>
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-500/25 text-red-200 border border-red-400/40 font-bold">
              +{dangerDiff}m Above Danger Mark ({selectedSector.cwcGauge.dangerLevelMeters}m)
            </span>
          </div>
        </div>

        {/* Right: Live Real-Time Weather Feed (Open-Meteo) */}
        {weatherData && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 liquid-glass-pill px-3 py-1 rounded-xl text-[11px]">
              <CloudRain className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
              <span>
                Rain: <b className="text-white">{weatherData.rainMm} mm</b>
              </span>
              <span className="text-slate-400">•</span>
              <Thermometer className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>
                Temp: <b className="text-white">{weatherData.temperatureC}°C</b>
              </span>
              <span className="text-slate-400">•</span>
              <Droplets className="w-3.5 h-3.5 text-blue-300 shrink-0" />
              <span>
                Humidity: <b className="text-white">{weatherData.humidityPercent}%</b>
              </span>
            </div>

            <button
              onClick={() => loadWeather(selectedSector)}
              title="Refresh Live Meteorological Feed"
              className="liquid-glass-interactive p-1.5 rounded-lg text-slate-300 hover:text-white cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>
        )}
      </div>

      {/* Authority Footnote */}
      <div className="mt-2 pt-2 border-t border-white/5 flex flex-wrap items-center justify-between text-[10px] text-slate-400">
        <div className="flex items-center gap-2">
          <Building2 className="w-3 h-3 text-cyan-400" />
          <span><b>Nodal Agency:</b> {selectedSector.nodalAgency}</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline"><b>Deployed:</b> {selectedSector.activeBattalion}</span>
        </div>
        <div className="flex items-center gap-1.5 text-cyan-300 font-semibold">
          <PhoneCall className="w-3 h-3" />
          <span>Toll-Free Control: {selectedSector.emergencyHelpline}</span>
        </div>
      </div>
    </div>
  );
};
