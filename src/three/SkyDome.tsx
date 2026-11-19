import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { TimePreset } from '@/types/game';

interface EnvironmentPalette {
  skyTop: string;
  skyBottom: string;
  sunColor: string;
  sunIntensity: number;
  sunPosition: [number, number, number];
  ambientColor: string;
  ambientIntensity: number;
  hemiSkyColor: string;
  hemiGroundColor: string;
  hemiIntensity: number;
  fogColor: string;
  fogDensity: number;
  fillLightColor: string;
  fillLightIntensity: number;
}

const PALETTES: Record<TimePreset, EnvironmentPalette> = {
  morning: {
    skyTop: '#5ba3d9',
    skyBottom: '#c8e8f8',
    sunColor: '#fff4d6',
    sunIntensity: 1.4,
    sunPosition: [-10, 8, -12],
    ambientColor: '#ffffff',
    ambientIntensity: 0.55,
    hemiSkyColor: '#c8e8f8',
    hemiGroundColor: '#3a6b3a',
    hemiIntensity: 0.6,
    fogColor: '#c5e3f5',
    fogDensity: 0.012,
    fillLightColor: '#ffe4b5',
    fillLightIntensity: 0.4,
  },
  noon: {
    skyTop: '#2a7fd4',
    skyBottom: '#a8d8f8',
    sunColor: '#ffffff',
    sunIntensity: 1.8,
    sunPosition: [2, 18, -4],
    ambientColor: '#ffffff',
    ambientIntensity: 0.8,
    hemiSkyColor: '#a8d8f8',
    hemiGroundColor: '#3d7a3d',
    hemiIntensity: 0.65,
    fogColor: '#b8dff8',
    fogDensity: 0.008,
    fillLightColor: '#ffffee',
    fillLightIntensity: 0.3,
  },
  sunset: {
    skyTop: '#1a1040',
    skyBottom: '#e8703a',
    sunColor: '#ff9966',
    sunIntensity: 1.1,
    sunPosition: [14, 2.5, -14],
    ambientColor: '#ffffff',
    ambientIntensity: 0.45,
    hemiSkyColor: '#e8703a',
    hemiGroundColor: '#2a1a08',
    hemiIntensity: 0.4,
    fogColor: '#d4603a',
    fogDensity: 0.016,
    fillLightColor: '#ffcc88',
    fillLightIntensity: 0.5,
  },
  night: {
    skyTop: '#040a18',
    skyBottom: '#0d1b3e',
    sunColor: '#b8d4ff',
    sunIntensity: 0.5,
    sunPosition: [6, 14, -8],
    ambientColor: '#ffffff',
    ambientIntensity: 0.25,
    hemiSkyColor: '#0d1b3e',
    hemiGroundColor: '#050c1a',
    hemiIntensity: 0.25,
    fogColor: '#080f28',
    fogDensity: 0.022,
    fillLightColor: '#8899cc',
    fillLightIntensity: 0.3,
  },
};

// Sky gradient shader — smooth top-to-bottom gradient
const skyVertexShader = `
  varying vec3 vWorldPosition;
  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const skyFragmentShader = `
  uniform vec3 uTopColor;
  uniform vec3 uBottomColor;
  uniform float uOffset;
  uniform float uExponent;
  varying vec3 vWorldPosition;
  void main() {
    float h = normalize(vWorldPosition + uOffset).y;
    float t = max(pow(max(h, 0.0), uExponent), 0.0);
    gl_FragColor = vec4(mix(uBottomColor, uTopColor, t), 1.0);
  }
`;

export const SkyAndLighting: React.FC = () => {
  const { environment } = useSettingsStore();
  const { timeMode, timePreset, weatherPreset, worldMode } = environment;

  const resolvedTimePreset = useMemo<TimePreset>(() => {
    if (timeMode === 'manual') return timePreset;
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 10) return 'morning';
    if (hour >= 10 && hour < 16) return 'noon';
    if (hour >= 16 && hour < 19) return 'sunset';
    return 'night';
  }, [timeMode, timePreset]);

  const palette = PALETTES[resolvedTimePreset];

  const skyUniforms = useMemo(() => ({
    uTopColor: { value: new THREE.Color(palette.skyTop) },
    uBottomColor: { value: new THREE.Color(palette.skyBottom) },
    uOffset: { value: 400 },
    uExponent: { value: 0.6 },
  }), [palette]);

  const fogDensity = weatherPreset === 'mist'
    ? 0.038
    : weatherPreset === 'light-rain'
    ? 0.026
    : palette.fogDensity;

  return (
    <>
      {/* Sky Gradient Dome */}
      {worldMode === 'grass-sky' && (
        <mesh>
          <sphereGeometry args={[80, 32, 16]} />
          <shaderMaterial
            vertexShader={skyVertexShader}
            fragmentShader={skyFragmentShader}
            uniforms={skyUniforms}
            side={THREE.BackSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Atmospheric Fog */}
      <fogExp2 attach="fog" color={palette.fogColor} density={fogDensity} />

      {/* Hemisphere Light — sky/ground fill, neutral white tint */}
      <hemisphereLight
        color={palette.hemiSkyColor}
        groundColor={palette.hemiGroundColor}
        intensity={palette.hemiIntensity}
      />

      {/* Ambient — always pure white so pieces don't get tinted */}
      <ambientLight color="#ffffff" intensity={palette.ambientIntensity} />

      {/* Sun / Moon Directional */}
      <directionalLight
        position={palette.sunPosition}
        color={palette.sunColor}
        intensity={palette.sunIntensity}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-camera-near={0.5}
        shadow-camera-far={60}
        shadow-bias={-0.0003}
      />

      {/* Fill light from opposite side — prevents pure-black shadows */}
      <directionalLight
        position={[-palette.sunPosition[0] * 0.5, palette.sunPosition[1] * 0.4, palette.sunPosition[2] * -0.5]}
        color={palette.fillLightColor}
        intensity={palette.fillLightIntensity}
        castShadow={false}
      />

      {/* Point light near board center — ensures pieces always lit */}
      <pointLight
        position={[0, 5, 0]}
        color="#ffffff"
        intensity={0.4}
        distance={12}
        decay={2}
        castShadow={false}
      />
    </>
  );
};
