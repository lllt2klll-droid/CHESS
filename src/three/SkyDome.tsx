import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { TimePreset } from '@/types/game';

interface EnvironmentPalette {
  skyTop: string;
  skyMid: string;
  skyHorizon: string;
  sunColor: string;
  sunGlowColor: string;
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

const ANIME_PALETTES: Record<TimePreset, EnvironmentPalette> = {
  morning: {
    // Fresh crisp anime morning with warm peach-gold horizon
    skyTop: '#1e6fd9',
    skyMid: '#58b2ff',
    skyHorizon: '#ffeedd',
    sunColor: '#fff5d8',
    sunGlowColor: '#ffd89a',
    sunIntensity: 1.5,
    sunPosition: [-12, 10, -14],
    ambientColor: '#ffffff',
    ambientIntensity: 0.65,
    hemiSkyColor: '#8ed1ff',
    hemiGroundColor: '#3d7e3e',
    hemiIntensity: 0.65,
    fogColor: '#bde3fa',
    fogDensity: 0.009,
    fillLightColor: '#ffe4c2',
    fillLightIntensity: 0.45,
  },
  noon: {
    // Crystal clear Makoto Shinkai summer midday
    skyTop: '#126fe3',
    skyMid: '#4ea8ff',
    skyHorizon: '#eaf6ff',
    sunColor: '#ffffff',
    sunGlowColor: '#b5e1ff',
    sunIntensity: 1.9,
    sunPosition: [4, 18, -6],
    ambientColor: '#ffffff',
    ambientIntensity: 0.85,
    hemiSkyColor: '#9ad5ff',
    hemiGroundColor: '#3a853e',
    hemiIntensity: 0.72,
    fogColor: '#cae7fc',
    fogDensity: 0.006,
    fillLightColor: '#fffff0',
    fillLightIntensity: 0.4,
  },
  sunset: {
    // Radiant anime golden-crimson twilight
    skyTop: '#241a4e',
    skyMid: '#bf405e',
    skyHorizon: '#ff8a43',
    sunColor: '#ffaa66',
    sunGlowColor: '#ff6230',
    sunIntensity: 1.4,
    sunPosition: [16, 3.2, -16],
    ambientColor: '#ffffff',
    ambientIntensity: 0.52,
    hemiSkyColor: '#ff9060',
    hemiGroundColor: '#452b18',
    hemiIntensity: 0.5,
    fogColor: '#e0764c',
    fogDensity: 0.013,
    fillLightColor: '#ffbb77',
    fillLightIntensity: 0.55,
  },
  night: {
    // Magical luminous starry night
    skyTop: '#04091a',
    skyMid: '#0e1d42',
    skyHorizon: '#1a2e5e',
    sunColor: '#b4d7ff',
    sunGlowColor: '#5380c9',
    sunIntensity: 0.6,
    sunPosition: [8, 14, -10],
    ambientColor: '#ffffff',
    ambientIntensity: 0.35,
    hemiSkyColor: '#1a2b58',
    hemiGroundColor: '#0a1420',
    hemiIntensity: 0.35,
    fogColor: '#0c1733',
    fogDensity: 0.018,
    fillLightColor: '#9bb8ec',
    fillLightIntensity: 0.35,
  },
};

// 3-stop anime sky shader with soft luminous horizon
const animeSkyVertexShader = `
  varying vec3 vWorldPosition;
  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const animeSkyFragmentShader = `
  uniform vec3 uSkyTop;
  uniform vec3 uSkyMid;
  uniform vec3 uSkyHorizon;
  varying vec3 vWorldPosition;

  void main() {
    // Normalized height
    float h = normalize(vWorldPosition).y;
    vec3 color;
    if (h < 0.25) {
      // Horizon to Mid sky
      float t = max(0.0, h) / 0.25;
      color = mix(uSkyHorizon, uSkyMid, smoothstep(0.0, 1.0, t));
    } else {
      // Mid sky to Zenith
      float t = (h - 0.25) / 0.75;
      color = mix(uSkyMid, uSkyTop, smoothstep(0.0, 1.0, t));
    }
    gl_FragColor = vec4(color, 1.0);
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

  const palette = ANIME_PALETTES[resolvedTimePreset];

  const skyUniforms = useMemo(() => ({
    uSkyTop:     { value: new THREE.Color(palette.skyTop) },
    uSkyMid:     { value: new THREE.Color(palette.skyMid) },
    uSkyHorizon: { value: new THREE.Color(palette.skyHorizon) },
  }), [palette]);

  const fogDensity = weatherPreset === 'mist'
    ? 0.035
    : weatherPreset === 'light-rain'
    ? 0.024
    : palette.fogDensity;

  return (
    <>
      {/* ── 3-Stop Anime Sky Dome ── */}
      {worldMode === 'grass-sky' && (
        <mesh>
          <sphereGeometry args={[85, 32, 20]} />
          <shaderMaterial
            vertexShader={animeSkyVertexShader}
            fragmentShader={animeSkyFragmentShader}
            uniforms={skyUniforms}
            side={THREE.BackSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* ── Anime Glowing Sun Disc & Lens Halo ── */}
      {worldMode === 'grass-sky' && (
        <group position={palette.sunPosition}>
          {/* Core sun sphere */}
          <mesh>
            <sphereGeometry args={[1.4, 16, 16]} />
            <meshBasicMaterial color={palette.sunColor} />
          </mesh>
          {/* Radiant corona halo */}
          <mesh>
            <sphereGeometry args={[3.2, 16, 16]} />
            <meshBasicMaterial
              color={palette.sunGlowColor}
              transparent
              opacity={0.35}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
          {/* Outer lens flare ring */}
          <mesh>
            <sphereGeometry args={[5.6, 16, 16]} />
            <meshBasicMaterial
              color={palette.sunGlowColor}
              transparent
              opacity={0.16}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </group>
      )}

      {/* ── Atmospheric Fog ── */}
      <fogExp2 attach="fog" color={palette.fogColor} density={fogDensity} />

      {/* ── Hemisphere Fill Light (Sky blue + vibrant lawn green) ── */}
      <hemisphereLight
        color={palette.hemiSkyColor}
        groundColor={palette.hemiGroundColor}
        intensity={palette.hemiIntensity}
      />

      {/* ── Pure White Ambient Base ── */}
      <ambientLight color="#ffffff" intensity={palette.ambientIntensity} />

      {/* ── Main Sun / Moon Key Directional Light ── */}
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

      {/* ── Warm Anime Fill Light ── */}
      <directionalLight
        position={[-palette.sunPosition[0] * 0.6, palette.sunPosition[1] * 0.5, -palette.sunPosition[2] * 0.6]}
        color={palette.fillLightColor}
        intensity={palette.fillLightIntensity}
        castShadow={false}
      />

      {/* ── Board Specular Highlight Point Light ── */}
      <pointLight
        position={[0, 4.5, 0]}
        color="#ffffff"
        intensity={0.45}
        distance={14}
        decay={2}
        castShadow={false}
      />
    </>
  );
};
