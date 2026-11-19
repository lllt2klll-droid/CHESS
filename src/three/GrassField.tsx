import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useSettingsStore } from '@/stores/useSettingsStore';

// Vertex shader for anime wind sway
const grassVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  uniform float uTime;
  uniform float uWindIntensity;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);

    vec3 pos = position;

    // Grass swaying with dual-frequency wave for lush organic feel
    float ix = instanceMatrix[3][0];
    float iz = instanceMatrix[3][2];
    float sway  = sin(uTime * 2.2 + ix * 0.5 + iz * 0.3) * 0.16 * uWindIntensity;
    float swayZ = cos(uTime * 1.6 + iz * 0.6 + ix * 0.2) * 0.10 * uWindIntensity;

    float influence = uv.y * uv.y;
    pos.x += sway  * influence;
    pos.z += swayZ * influence;

    vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

// Fragment shader for sun-kissed anime grass gradient
const grassFragmentShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  uniform vec3 uColorBottom;
  uniform vec3 uColorTop;

  void main() {
    // 3-stop anime gradient: deep shadow grass -> vibrant clover -> sunlit bright lime tip
    vec3 midColor = mix(uColorBottom, uColorTop, 0.45);
    vec3 color = vUv.y < 0.5 
      ? mix(uColorBottom, midColor, vUv.y * 2.0)
      : mix(midColor, uColorTop, (vUv.y - 0.5) * 2.0);

    // Warm sun-highlight from upper angle
    float light = clamp(dot(vNormal, normalize(vec3(0.35, 0.92, 0.3))), 0.65, 1.08);
    gl_FragColor = vec4(color * light, 1.0);
  }
`;

export const GrassField: React.FC = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const daisyMeshRef = useRef<THREE.InstancedMesh>(null);
  const { quality, environment } = useSettingsStore();

  const count = quality === 'low' ? 3000 : quality === 'medium' ? 8000 : 16000;
  const daisyCount = quality === 'low' ? 40 : quality === 'medium' ? 90 : 160;
  const radius = 22;

  const uniforms = useMemo(() => ({
    uTime:          { value: 0 },
    uWindIntensity: { value: environment.windEnabled ? environment.windIntensity : 0 },
    // Anime vibrant meadow colors
    uColorBottom:   { value: new THREE.Color('#1f6b2f') },
    uColorTop:      { value: new THREE.Color('#7ae846') }, // radiant sunlit lime-emerald
  }), []);

  // Grass blade: tapered quad
  const bladeGeometry = useMemo(() => {
    const geom = new THREE.PlaneGeometry(0.08, 0.46, 1, 4);
    geom.translate(0, 0.23, 0);
    return geom;
  }, []);

  // Daisy flower geometry (white disk + slight thickness)
  const daisyGeometry = useMemo(() => {
    const geom = new THREE.CylinderGeometry(0.085, 0.085, 0.015, 8);
    geom.rotateX(Math.PI / 2);
    return geom;
  }, []);

  // Position grass blades
  useEffect(() => {
    if (!meshRef.current) return;
    const dummy = new THREE.Object3D();
    const boardClearRadius = 3.1;
    let index = 0;

    while (index < count) {
      const r     = Math.sqrt(Math.random()) * radius;
      const theta = Math.random() * Math.PI * 2;
      const x     = Math.cos(theta) * r;
      const z     = Math.sin(theta) * r;

      if (r < boardClearRadius && Math.random() > 0.1) continue;

      dummy.position.set(x, 0, z);
      dummy.rotation.y = Math.random() * Math.PI * 2;
      dummy.rotation.x = (Math.random() - 0.5) * 0.16;
      const s = 0.7 + Math.random() * 0.65;
      dummy.scale.set(s, s + Math.random() * 0.25, s);
      dummy.updateMatrix();

      meshRef.current.setMatrixAt(index, dummy.matrix);
      index++;
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [count, radius]);

  // Position white daisies across the meadow
  useEffect(() => {
    if (!daisyMeshRef.current) return;
    const dummy = new THREE.Object3D();
    const boardClearRadius = 3.2;
    let index = 0;

    while (index < daisyCount) {
      const r     = 3.3 + Math.sqrt(Math.random()) * (radius - 4);
      const theta = Math.random() * Math.PI * 2;
      const x     = Math.cos(theta) * r;
      const z     = Math.sin(theta) * r;

      // Daisy rests at grass tip height
      dummy.position.set(x, 0.12 + Math.random() * 0.16, z);
      dummy.rotation.x = -Math.PI / 2 + (Math.random() - 0.5) * 0.4;
      dummy.rotation.y = (Math.random() - 0.5) * 0.4;
      dummy.rotation.z = Math.random() * Math.PI * 2;
      const s = 0.8 + Math.random() * 0.5;
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();

      daisyMeshRef.current.setMatrixAt(index, dummy.matrix);
      index++;
    }
    daisyMeshRef.current.instanceMatrix.needsUpdate = true;
  }, [daisyCount, radius]);

  useFrame((state) => {
    uniforms.uTime.value          = state.clock.getElapsedTime();
    uniforms.uWindIntensity.value = environment.windEnabled ? environment.windIntensity : 0;
  });

  return (
    <group>
      {/* Vibrant spring ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.015, 0]} receiveShadow>
        <planeGeometry args={[90, 90]} />
        <meshStandardMaterial color="#256b35" roughness={0.92} />
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

      {/* Instanced White Daisies (scattered on lawn) */}
      <instancedMesh ref={daisyMeshRef} args={[daisyGeometry, undefined, daisyCount]}>
        <meshStandardMaterial
          color="#ffffff"
          roughness={0.3}
          emissive="#fffae8"
          emissiveIntensity={0.2}
        />
      </instancedMesh>
    </group>
  );
};
