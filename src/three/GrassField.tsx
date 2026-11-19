import React, { useMemo, useRef } from 'react';
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

    // Grass swaying effect based on height (uv.y)
    float sway = sin(uTime * 2.0 + instanceMatrix[3][0] * 0.5 + instanceMatrix[3][2] * 0.5) * 0.12 * uWindIntensity;
    float swayZ = cos(uTime * 1.5 + instanceMatrix[3][2] * 0.4) * 0.08 * uWindIntensity;

    pos.x += sway * uv.y * uv.y;
    pos.z += swayZ * uv.y * uv.y;

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
    // Gradient from darker ground green to brighter tip
    vec3 color = mix(uColorBottom, uColorTop, vUv.y);
    // Subtle lighting term
    float light = clamp(dot(vNormal, vec3(0.3, 0.9, 0.4)), 0.6, 1.0);
    gl_FragColor = vec4(color * light, 1.0);
  }
`;

export const GrassField: React.FC = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { quality, environment } = useSettingsStore();

  const count = quality === 'low' ? 3000 : quality === 'medium' ? 8000 : 15000;
  const radius = 18;

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uWindIntensity: { value: environment.windEnabled ? environment.windIntensity : 0 },
    uColorBottom: { value: new THREE.Color('#1c4a2f') },
    uColorTop: { value: new THREE.Color('#58a867') },
  }), []);

  // Geometry: a simple blade of grass (tapered quad)
  const bladeGeometry = useMemo(() => {
    const geom = new THREE.PlaneGeometry(0.08, 0.45, 1, 4);
    geom.translate(0, 0.225, 0); // Ground at y=0
    return geom;
  }, []);

  // Position instances in a disk around the central board, leaving board center slightly clear
  useMemo(() => {
    if (!meshRef.current) return;
    const dummy = new THREE.Object3D();
    const boardClearRadius = 2.8;

    let index = 0;
    while (index < count) {
      const r = Math.sqrt(Math.random()) * radius;
      if (r < boardClearRadius && Math.random() > 0.15) continue; // Keep space under board less dense

      const theta = Math.random() * Math.PI * 2;
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;
      const y = 0;

      dummy.position.set(x, y, z);
      dummy.rotation.y = Math.random() * Math.PI * 2;
      dummy.rotation.x = (Math.random() - 0.5) * 0.2;
      const scale = 0.7 + Math.random() * 0.6;
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();

      meshRef.current.setMatrixAt(index, dummy.matrix);
      index++;
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [count, radius]);

  useFrame((state) => {
    if (uniforms.uTime) {
      uniforms.uTime.value = state.clock.getElapsedTime();
      uniforms.uWindIntensity.value = environment.windEnabled ? environment.windIntensity : 0;
    }
  });

  return (
    <group>
      {/* Underlying ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#1a412b" roughness={0.9} />
      </mesh>

      {/* Instanced grass blades */}
      <instancedMesh ref={meshRef} args={[bladeGeometry, undefined, count]} castShadow receiveShadow>
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
