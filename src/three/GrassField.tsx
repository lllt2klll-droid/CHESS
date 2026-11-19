import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useSettingsStore } from '@/stores/useSettingsStore';

// Vertex shader for wind sway
const grassVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  uniform float uTime;
  uniform float uWindIntensity;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);

    vec3 pos = position;

    // Grass swaying — use instance position from instanceMatrix
    float ix = instanceMatrix[3][0];
    float iz = instanceMatrix[3][2];
    float sway  = sin(uTime * 1.8 + ix * 0.6 + iz * 0.4) * 0.14 * uWindIntensity;
    float swayZ = cos(uTime * 1.3 + iz * 0.5 + ix * 0.3) * 0.09 * uWindIntensity;

    // Only apply sway at the tip (uv.y closer to 1)
    float influence = uv.y * uv.y;
    pos.x += sway  * influence;
    pos.z += swayZ * influence;

    vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const grassFragmentShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  uniform vec3 uColorBottom;
  uniform vec3 uColorTop;

  void main() {
    vec3 color = mix(uColorBottom, uColorTop, vUv.y);
    float light = clamp(dot(vNormal, normalize(vec3(0.4, 0.9, 0.3))), 0.55, 1.0);
    gl_FragColor = vec4(color * light, 1.0);
  }
`;

export const GrassField: React.FC = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { quality, environment } = useSettingsStore();

  const count  = quality === 'low' ? 2500 : quality === 'medium' ? 7000 : 14000;
  const radius = 20;

  const uniforms = useMemo(() => ({
    uTime:          { value: 0 },
    uWindIntensity: { value: environment.windEnabled ? environment.windIntensity : 0 },
    uColorBottom:   { value: new THREE.Color('#1a4a28') },
    uColorTop:      { value: new THREE.Color('#52b05a') },
  }), []);    // created once — updated via useFrame

  // Grass blade: slim plane tapered at top
  const bladeGeometry = useMemo(() => {
    const geom = new THREE.PlaneGeometry(0.07, 0.42, 1, 4);
    geom.translate(0, 0.21, 0); // pivot at ground
    return geom;
  }, []);

  // ⚠️ CRITICAL: must run AFTER mount so meshRef.current is attached
  useEffect(() => {
    if (!meshRef.current) return;
    const dummy = new THREE.Object3D();
    const boardClearRadius = 3.0;
    let index = 0;

    while (index < count) {
      const r     = Math.sqrt(Math.random()) * radius;
      const theta = Math.random() * Math.PI * 2;
      const x     = Math.cos(theta) * r;
      const z     = Math.sin(theta) * r;

      // Keep centre under board less dense (not fully empty)
      if (r < boardClearRadius && Math.random() > 0.12) continue;

      dummy.position.set(x, 0, z);
      dummy.rotation.y = Math.random() * Math.PI * 2;
      dummy.rotation.x = (Math.random() - 0.5) * 0.18;
      const s = 0.65 + Math.random() * 0.65;
      dummy.scale.set(s, s + Math.random() * 0.2, s);
      dummy.updateMatrix();

      meshRef.current.setMatrixAt(index, dummy.matrix);
      index++;
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [count, radius]);   // re-run only if quality changes

  useFrame((state) => {
    uniforms.uTime.value          = state.clock.getElapsedTime();
    uniforms.uWindIntensity.value = environment.windEnabled ? environment.windIntensity : 0;
  });

  return (
    <group>
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.015, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#1b4a2a" roughness={0.95} />
      </mesh>

      {/* Instanced grass blades */}
      <instancedMesh ref={meshRef} args={[bladeGeometry, undefined, count]} castShadow>
        <shaderMaterial
          vertexShader={grassVertexShader}
          fragmentShader={grassFragmentShader}
          uniforms={uniforms}
          side={THREE.DoubleSide}
        />
      </instancedMesh>
    </group>
  );
};
