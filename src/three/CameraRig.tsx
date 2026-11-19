import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { CameraPreset } from '@/types/game';

const PRESET_POSITIONS: Record<CameraPreset, [number, number, number]> = {
  top:       [0, 13.0,  0.01],
  isometric: [0,  9.5,  9.0 ],
  low:       [0,  3.5,  9.5 ],
  piece:     [0,  5.0,  7.0 ],
};

export const CameraRig: React.FC = () => {
  const controlsRef = useRef<any>(null);
  const { camera }  = useThree();
  const { camera: cameraSettings } = useSettingsStore();

  const targetPos    = useRef(new THREE.Vector3(...PRESET_POSITIONS[cameraSettings.preferredPreset]));
  const lookAtTarget = useRef(new THREE.Vector3(0, 0.5, 0));

  useEffect(() => {
    const pos = PRESET_POSITIONS[cameraSettings.preferredPreset] ?? PRESET_POSITIONS.isometric;
    targetPos.current.set(...pos);
  }, [cameraSettings.preferredPreset]);

  useFrame(() => {
    if (!controlsRef.current) return;
    camera.position.lerp(targetPos.current, 0.055);
    controlsRef.current.target.lerp(lookAtTarget.current, 0.055);
    controlsRef.current.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.06}
      minDistance={5.5}
      maxDistance={20}
      minPolarAngle={0.08}
      maxPolarAngle={Math.PI / 2 - 0.03}
      autoRotate={cameraSettings.autoRotate}
      autoRotateSpeed={0.6}
    />
  );
};
