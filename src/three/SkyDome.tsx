import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { TimePreset, WeatherPreset } from '@/types/game';

interface EnvironmentPalette {
  skyTop: string;
  skyBottom: string;
  sunColor: string;
  sunIntensity: number;
  sunPosition: [number, number, number];
  ambientColor: string;
  ambientIntensity: number;
  fogColor: string;
  fogDensity: number;
}

const PALETTES: Record<TimePreset, EnvironmentPalette> = {
  morning: {
    skyTop: '#68b4e8',
    skyBottom: '#d6edfa',
    sunColor: '#fff1c7',
    sunIntensity: 1.3,
    sunPosition: [10, 8, -12],
    ambientColor: '#aed6f1',
    ambientIntensity: 0.7,
    fogColor: '#cce6f8',
    fogDensity: 0.015,
  },
  noon: {
    skyTop: '#3b92d8',
    skyBottom: '#bce1fc',
    sunColor: '#ffffff',
    sunIntensity: 1.6,
    sunPosition: [5, 16, -6],
    ambientColor: '#dbeafe',
    ambientIntensity: 0.85,
    fogColor: '#bce1fc',
    fogDensity: 0.01,
  },
  sunset: {
    skyTop: '#382b68',
    skyBottom: '#f59e6c',
    sunColor: '#ff7e47',
    sunIntensity: 1.2,
    sunPosition: [15, 3, -15],
    ambientColor: '#c084fc',
    ambientIntensity: 0.5,
    fogColor: '#e07a5f',
    fogDensity: 0.02,
  },
  night: {
    skyTop: '#060d1a',
    skyBottom: '#172554',
    sunColor: '#93c5fd', // Moonlight
    sunIntensity: 0.45,
    sunPosition: [8, 12, -8],
    ambientColor: '#1e293b',
    ambientIntensity: 0.35,
    fogColor: '#0f172a',
    fogDensity: 0.025,
  },
};

export const SkyAndLighting: React.FC = () => {
  const { environment } = useSettingsStore();
  const { timeMode, timePreset, weatherPreset, worldMode } = environment;

  // Auto time determination if in auto mode
  const resolvedTimePreset = useMemo<TimePreset>(() => {
    if (timeMode === 'manual') return timePreset;
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 10) return 'morning';
    if (hour >= 10 && hour < 16) return 'noon';
    if (hour >= 16 && hour < 19) return 'sunset';
    return 'night';
  }, [timeMode, timePreset]);

  const palette = PALETTES[resolvedTimePreset];

  return (
    <>
      {/* Sky hemisphere / dome if in grass-sky mode */}
      {worldMode === 'grass-sky' && (
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[50, 32, 16]} />
          <meshBasicMaterial
            side={THREE.BackSide}
            color={new THREE.Color(palette.skyBottom)}
          />
        </mesh>
      )}

      {/* Atmospheric Fog */}
      <fogExp2
        attach="fog"
        color={palette.fogColor}
        density={weatherPreset === 'mist' ? 0.04 : weatherPreset === 'light-rain' ? 0.03 : palette.fogDensity}
      />

      {/* Ambient Fill */}
      <ambientLight color={palette.ambientColor} intensity={palette.ambientIntensity} />

      {/* Sun / Moon Directional Light */}
      <directionalLight
        position={palette.sunPosition}
        color={palette.sunColor}
        intensity={palette.sunIntensity}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-camera-near={0.5}
        shadow-camera-far={40}
        shadow-bias={-0.0005}
      />
    </>
  );
};
