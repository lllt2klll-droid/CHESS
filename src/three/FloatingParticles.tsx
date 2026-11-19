import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useSettingsStore } from '@/stores/useSettingsStore';

// Floating sparkling light motes + gentle drifting petals/leaves
export const FloatingParticles: React.FC = () => {
  const { environment, quality } = useSettingsStore();
  const count = quality === 'low' ? 35 : quality === 'medium' ? 70 : 110;

  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Generate particle parameters: positions, speeds, initial phase, scale, color type
  const particles = useMemo(() => {
    return Array.from({ length: count }, () => {
      const radius = 2.5 + Math.random() * 12.0;
      const angle = Math.random() * Math.PI * 2;
      return {
        x: Math.cos(angle) * radius,
        y: 0.4 + Math.random() * 3.5,
        z: Math.sin(angle) * radius,
        speedX: (0.15 + Math.random() * 0.25) * (environment.windEnabled ? environment.windIntensity : 0.5),
        speedY: (Math.random() - 0.4) * 0.08,
        speedZ: (0.1 + Math.random() * 0.2) * (environment.windEnabled ? environment.windIntensity : 0.5),
        phase: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 1.5,
        scale: 0.04 + Math.random() * 0.07,
        isLeaf: Math.random() > 0.6, // 40% are little floating green leaves, 60% are light motes
      };
    });
  }, [count, environment.windEnabled, environment.windIntensity]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    const windMult = environment.windEnabled ? (0.4 + environment.windIntensity * 0.8) : 0.4;

    particles.forEach((p, i) => {
      // Wind drift along X & Z with vertical bobbing
      const px = p.x + Math.sin(time * 0.4 + p.phase) * 0.6 + (time * p.speedX * windMult) % 24 - 12;
      const py = p.y + Math.sin(time * 1.2 + p.phase) * 0.35;
      const pz = p.z + Math.cos(time * 0.3 + p.phase) * 0.5 + (time * p.speedZ * windMult) % 24 - 12;

      dummy.position.set(px, Math.max(0.2, py), pz);

      // Rotating leaf/particle
      dummy.rotation.x = time * p.rotSpeed + p.phase;
      dummy.rotation.y = time * (p.rotSpeed * 0.8);
      dummy.rotation.z = Math.sin(time * 0.8 + p.phase) * 0.5;

      // Sparkling pulse scale
      const pulse = p.isLeaf ? 1.0 : (0.75 + Math.sin(time * 3.0 + p.phase) * 0.35);
      const s = p.scale * pulse;
      dummy.scale.set(s * (p.isLeaf ? 1.6 : 1), s * (p.isLeaf ? 0.6 : 1), s);
      dummy.updateMatrix();

      meshRef.current?.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial
        color="#fff4b8"
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  );
};
