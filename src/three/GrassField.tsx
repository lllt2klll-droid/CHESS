import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useSettingsStore } from '@/stores/useSettingsStore';

// ─────────────────────────────────────────────────────────────
// Organic 3D Curved Tapered Grass Blade Geometry
// ─────────────────────────────────────────────────────────────
function createCurvedBladeGeometry(): THREE.BufferGeometry {
  const geom = new THREE.BufferGeometry();
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  // 5 height levels with natural forward curve and taper
  const levels = [
    { y: 0.000, w: 0.046, z: 0.000 },
    { y: 0.115, w: 0.040, z: 0.012 },
    { y: 0.230, w: 0.032, z: 0.038 },
    { y: 0.345, w: 0.020, z: 0.078 },
    { y: 0.460, w: 0.003, z: 0.135 }, // sharp organic curved tip
  ];

  levels.forEach((lvl, i) => {
    const v = i / (levels.length - 1);
    // Left vertex
    positions.push(-lvl.w, lvl.y, lvl.z);
    uvs.push(0, v);
    // Right vertex
    positions.push(lvl.w, lvl.y, lvl.z);
    uvs.push(1, v);
  });

  for (let i = 0; i < levels.length - 1; i++) {
    const a = i * 2;
    const b = i * 2 + 1;
    const c = (i + 1) * 2;
    const d = (i + 1) * 2 + 1;
    indices.push(a, b, c);
    indices.push(b, d, c);
  }

  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

// ─────────────────────────────────────────────────────────────
// Vertex Shader: Dual-Frequency Wind Waves with Board Clearance
// ─────────────────────────────────────────────────────────────
const realisticGrassVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  uniform float uTime;
  uniform float uWindIntensity;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);

    vec3 pos = position;

    float ix = instanceMatrix[3][0];
    float iz = instanceMatrix[3][2];

    // Distance from the square board edge (board is centered at 0,0, halfW = 3.08)
    float distFromBoard = max(abs(ix), abs(iz)) - 3.05;
    // Smoothly dampen sway when right next to board edge to NEVER clip
    float edgeClearance = clamp(distFromBoard / 0.6, 0.15, 1.0);

    // Natural multi-octave wind wave
    float wave1 = sin(uTime * 2.0 + ix * 0.45 + iz * 0.25);
    float wave2 = cos(uTime * 1.4 + iz * 0.55 + ix * 0.20);
    float swayX = wave1 * 0.14 * uWindIntensity * edgeClearance;
    float swayZ = wave2 * 0.09 * uWindIntensity * edgeClearance;

    // Deflection quadratic with height (tip sways most)
    float h = uv.y * uv.y;
    pos.x += swayX * h;
    pos.z += swayZ * h;

    vec4 worldPosition = instanceMatrix * vec4(pos, 1.0);
    vWorldPos = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * worldPosition;
  }
`;

// ─────────────────────────────────────────────────────────────
// Fragment Shader: Subsurface Translucency + Sunlight Gradient
// ─────────────────────────────────────────────────────────────
const realisticGrassFragmentShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  uniform vec3 uColorBase;
  uniform vec3 uColorMid;
  uniform vec3 uColorTip;

  void main() {
    // 3-color organic blend: rich roots -> vibrant blade body -> sunlit golden tip
    vec3 col = vUv.y < 0.45
      ? mix(uColorBase, uColorMid, vUv.y / 0.45)
      : mix(uColorMid, uColorTip, (vUv.y - 0.45) / 0.55);

    // Key sunlight direction
    vec3 sunDir = normalize(vec3(0.35, 0.90, 0.35));

    // Direct diffuse lighting
    float diffuse = clamp(dot(vNormal, sunDir), 0.55, 1.05);

    // Subsurface translucency (sunlight shining through thin grass blades)
    float sss = pow(clamp(dot(sunDir, -vNormal), 0.0, 1.0), 2.0) * 0.32 * vUv.y;
    vec3 sssColor = vec3(0.85, 1.0, 0.45) * sss;

    // Ambient ground shadow darkening near root
    float rootOcclusion = smoothstep(0.0, 0.25, vUv.y) * 0.35 + 0.65;

    vec3 finalColor = (col * diffuse + sssColor) * rootOcclusion;
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export const GrassField: React.FC = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const daisyMeshRef = useRef<THREE.InstancedMesh>(null);
  const { quality, environment } = useSettingsStore();

  const count = quality === 'low' ? 3500 : quality === 'medium' ? 9000 : 18000;
  const daisyCount = quality === 'low' ? 45 : quality === 'medium' ? 100 : 180;
  const radius = 23;

  // Board square bounding box:
  // BOARD_WIDTH = 5.2, outer base frame = 5.85, half = 2.925.
  // We set strict clearance box to 3.08 to guarantee ZERO clipping!
  const BOARD_HALF_BOX = 3.08;

  const bladeGeometry = useMemo(() => createCurvedBladeGeometry(), []);

  const daisyGeometry = useMemo(() => {
    const geom = new THREE.CylinderGeometry(0.08, 0.08, 0.012, 8);
    geom.rotateX(Math.PI / 2);
    return geom;
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uWindIntensity: { value: environment.windEnabled ? environment.windIntensity : 0 },
      uColorBase: { value: new THREE.Color('#164823') }, // Deep rich root
      uColorMid:  { value: new THREE.Color('#389e3f') }, // Vibrant summer meadow
      uColorTip:  { value: new THREE.Color('#7de845') }, // Sun-kissed golden lime tip
    }),
    []
  );

  // Position grass blades with 100% strict square board exclusion
  useEffect(() => {
    if (!meshRef.current) return;
    const dummy = new THREE.Object3D();
    let index = 0;
    let attempts = 0;
    const maxAttempts = count * 3;

    while (index < count && attempts < maxAttempts) {
      attempts++;
      const r = Math.sqrt(Math.random()) * radius;
      const theta = Math.random() * Math.PI * 2;
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;

      // ⚠️ ABSOLUTE STRICT SQUARE EXCLUSION:
      // If point is anywhere inside the square board boundaries, REJECT!
      if (Math.abs(x) < BOARD_HALF_BOX && Math.abs(z) < BOARD_HALF_BOX) {
        continue;
      }

      dummy.position.set(x, 0, z);
      // Random rotation around Y for natural clumping
      dummy.rotation.y = Math.random() * Math.PI * 2;
      // Slight natural tilt
      dummy.rotation.x = (Math.random() - 0.5) * 0.16;
      dummy.rotation.z = (Math.random() - 0.5) * 0.16;

      // Natural height variation (0.65 - 1.25)
      const scale = 0.7 + Math.random() * 0.55;
      const heightMult = 0.8 + Math.random() * 0.45;
      dummy.scale.set(scale, scale * heightMult, scale);
      dummy.updateMatrix();

      meshRef.current.setMatrixAt(index, dummy.matrix);
      index++;
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [count, radius, BOARD_HALF_BOX]);

  // Position white daisies with strict square board exclusion
  useEffect(() => {
    if (!daisyMeshRef.current) return;
    const dummy = new THREE.Object3D();
    let index = 0;
    let attempts = 0;
    const maxAttempts = daisyCount * 4;

    while (index < daisyCount && attempts < maxAttempts) {
      attempts++;
      const r = 3.3 + Math.sqrt(Math.random()) * (radius - 4);
      const theta = Math.random() * Math.PI * 2;
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;

      // Strict exclusion from board
      if (Math.abs(x) < BOARD_HALF_BOX + 0.18 && Math.abs(z) < BOARD_HALF_BOX + 0.18) {
        continue;
      }

      dummy.position.set(x, 0.14 + Math.random() * 0.16, z);
      dummy.rotation.x = -Math.PI / 2 + (Math.random() - 0.5) * 0.35;
      dummy.rotation.y = (Math.random() - 0.5) * 0.35;
      dummy.rotation.z = Math.random() * Math.PI * 2;
      const s = 0.8 + Math.random() * 0.45;
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();

      daisyMeshRef.current.setMatrixAt(index, dummy.matrix);
      index++;
    }
    daisyMeshRef.current.instanceMatrix.needsUpdate = true;
  }, [daisyCount, radius, BOARD_HALF_BOX]);

  useFrame((state) => {
    uniforms.uTime.value = state.clock.getElapsedTime();
    uniforms.uWindIntensity.value = environment.windEnabled ? environment.windIntensity : 0;
  });

  return (
    <group>
      {/* Rich turf earth ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.015, 0]} receiveShadow>
        <planeGeometry args={[90, 90]} />
        <meshStandardMaterial color="#1a4d25" roughness={0.92} />
      </mesh>

      {/* Subtle darker earth collar around board footprint */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[BOARD_HALF_BOX * 2 + 0.4, BOARD_HALF_BOX * 2 + 0.4]} />
        <meshStandardMaterial color="#16381d" roughness={0.96} />
      </mesh>

      {/* Instanced curved 3D grass blades */}
      <instancedMesh ref={meshRef} args={[bladeGeometry, undefined, count]} castShadow>
        <shaderMaterial
          vertexShader={realisticGrassVertexShader}
          fragmentShader={realisticGrassFragmentShader}
          uniforms={uniforms}
          side={THREE.DoubleSide}
        />
      </instancedMesh>

      {/* Instanced White Daisies */}
      <instancedMesh ref={daisyMeshRef} args={[daisyGeometry, undefined, daisyCount]}>
        <meshStandardMaterial
          color="#ffffff"
          roughness={0.28}
          emissive="#fffae4"
          emissiveIntensity={0.2}
        />
      </instancedMesh>
    </group>
  );
};
