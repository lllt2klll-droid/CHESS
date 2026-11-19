import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useGameStore } from '@/stores/useGameStore';
import { CameraPreset } from '@/types/game';

const PRESET_POSITIONS: Record<CameraPreset, [number, number, number]> = {
  top: [0, 8.2, 0.01],
  isometric: [0, 5.8, 5.4],
  low: [0, 2.2, 5.6],
  piece: [0, 3.2, 3.8],
};

export const CameraRig: React.FC = () => {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();
  const { camera: cameraSettings } = useSettingsStore();
  const { selectedCoord } = useGameStore();

  const targetPos = useRef(new THREE.Vector3(...PRESET_POSITIONS[cameraSettings.preferredPreset]));
  const lookAtTarget = useRef(new THREE.Vector3(0, 0.2, 0));

  // Update target when preset changes
  useEffect(() => {
    const pos = PRESET_POSITIONS[cameraSettings.preferredPreset] || PRESET_POSITIONS.isometric;
    targetPos.current.set(...pos);
  }, [cameraSettings.preferredPreset]);

  // Smooth lerp transition towards preset target
  useFrame(() => {
    if (!controlsRef.current) return;
    camera.position.lerp(targetPos.current, 0.05);
    controlsRef.current.target.lerp(lookAtTarget.current, 0.05);
    controlsRef.current.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.06}
      minDistance={3.2}
      maxDistance={12}
      minPolarAngle={0.1}
      maxPolarAngle={Math.PI / 2 - 0.04} // Stop right above ground plane
      autoRotate={cameraSettings.autoRotate}
      autoRotateSpeed={0.8}
    />
  );
};
