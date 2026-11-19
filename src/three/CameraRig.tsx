import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { CameraPreset } from '@/types/game';

// Positioned so the board sits comfortably in the center-right of view
const PRESET_POSITIONS: Record<CameraPreset, [number, number, number]> = {
  top:       [0.5, 12.8,  0.01],
  isometric: [1.2,  9.0,  8.8 ], // Exact angle and distance matching reference
  low:       [0.6,  3.2,  9.2 ],
  piece:     [0.6,  4.8,  6.8 ],
};

const LOOK_AT_TARGETS: Record<CameraPreset, [number, number, number]> = {
  top:       [0.5, 0.2, 0],
  isometric: [0.5, 0.3, 0], // Slight right offset to balance left UI menu
  low:       [0.5, 0.3, 0],
  piece:     [0.5, 0.25, 0],
};

export const CameraRig: React.FC = () => {
  const controlsRef  = useRef<any>(null);
  const { camera }   = useThree();
  const { camera: cameraSettings } = useSettingsStore();

  const targetPos    = useRef(new THREE.Vector3(...PRESET_POSITIONS[cameraSettings.preferredPreset]));
  const lookAtTarget = useRef(new THREE.Vector3(...LOOK_AT_TARGETS[cameraSettings.preferredPreset]));

  const [freeMode, setFreeMode]   = useState(false);
  const lerpingRef                = useRef(false);
  const prevPresetRef             = useRef(cameraSettings.preferredPreset);
  const arrivalTimerRef           = useRef<ReturnType<typeof setTimeout> | null>(null);

  // When preset changes: start lerping, then unlock free OrbitControls
  useEffect(() => {
    const newPos = PRESET_POSITIONS[cameraSettings.preferredPreset] ?? PRESET_POSITIONS.isometric;
    const newLook = LOOK_AT_TARGETS[cameraSettings.preferredPreset] ?? LOOK_AT_TARGETS.isometric;
    targetPos.current.set(...newPos);
    lookAtTarget.current.set(...newLook);

    if (prevPresetRef.current !== cameraSettings.preferredPreset) {
      prevPresetRef.current = cameraSettings.preferredPreset;
      setFreeMode(false);
      lerpingRef.current = true;

      if (arrivalTimerRef.current) clearTimeout(arrivalTimerRef.current);
      arrivalTimerRef.current = setTimeout(() => {
        lerpingRef.current = false;
        setFreeMode(true);
      }, 1500);
    }
  }, [cameraSettings.preferredPreset]);

  // Initial mount
  useEffect(() => {
    lerpingRef.current = true;
    arrivalTimerRef.current = setTimeout(() => {
      lerpingRef.current = false;
      setFreeMode(true);
    }, 1500);
    return () => {
      if (arrivalTimerRef.current) clearTimeout(arrivalTimerRef.current);
    };
  }, []);

  useFrame(() => {
    if (!controlsRef.current) return;

    if (lerpingRef.current) {
      camera.position.lerp(targetPos.current, 0.08);
      controlsRef.current.target.lerp(lookAtTarget.current, 0.08);
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enabled={true}
      enableDamping
      dampingFactor={0.07}
      enablePan={false}
      minDistance={4.5}
      maxDistance={22}
      minPolarAngle={0.08}
      maxPolarAngle={Math.PI / 2 - 0.03}
      autoRotate={cameraSettings.autoRotate}
      autoRotateSpeed={0.8}
    />
  );
};
