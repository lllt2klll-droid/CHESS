import React, { useEffect, useRef, useState } from 'react';
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
  const controlsRef  = useRef<any>(null);
  const { camera }   = useThree();
  const { camera: cameraSettings } = useSettingsStore();

  // Track desired preset position
  const targetPos    = useRef(new THREE.Vector3(...PRESET_POSITIONS[cameraSettings.preferredPreset]));
  const lookAtTarget = useRef(new THREE.Vector3(0, 0.5, 0));

  // "Free mode" flag — once camera has arrived at preset, OrbitControls takes over freely
  const [freeMode, setFreeMode]   = useState(false);
  const lerpingRef                = useRef(false);
  const prevPresetRef             = useRef(cameraSettings.preferredPreset);
  const arrivalTimerRef           = useRef<ReturnType<typeof setTimeout> | null>(null);

  // When preset changes: start lerping again, disable free mode
  useEffect(() => {
    const newPos = PRESET_POSITIONS[cameraSettings.preferredPreset] ?? PRESET_POSITIONS.isometric;
    targetPos.current.set(...newPos);

    if (prevPresetRef.current !== cameraSettings.preferredPreset) {
      prevPresetRef.current = cameraSettings.preferredPreset;
      setFreeMode(false);
      lerpingRef.current = true;

      // After 1.6s the camera is effectively at the preset → unlock free orbit
      if (arrivalTimerRef.current) clearTimeout(arrivalTimerRef.current);
      arrivalTimerRef.current = setTimeout(() => {
        lerpingRef.current = false;
        setFreeMode(true);
      }, 1600);
    }
  }, [cameraSettings.preferredPreset]);

  // On mount: short lerp then free
  useEffect(() => {
    lerpingRef.current = true;
    arrivalTimerRef.current = setTimeout(() => {
      lerpingRef.current = false;
      setFreeMode(true);
    }, 1600);
    return () => {
      if (arrivalTimerRef.current) clearTimeout(arrivalTimerRef.current);
    };
  }, []);

  useFrame(() => {
    if (!controlsRef.current) return;

    if (lerpingRef.current) {
      // Animated preset snap
      camera.position.lerp(targetPos.current, 0.07);
      controlsRef.current.target.lerp(lookAtTarget.current, 0.07);
      controlsRef.current.update();
    }
    // When freeMode=true, OrbitControls handles everything on its own (enabled=true)
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enabled={true}           // always enabled so user can drag
      enableDamping
      dampingFactor={0.07}
      enablePan={false}        // keep focus on board, no panning
      minDistance={4.5}
      maxDistance={22}
      minPolarAngle={0.08}
      maxPolarAngle={Math.PI / 2 - 0.03}
      autoRotate={!freeMode && cameraSettings.autoRotate}
      autoRotateSpeed={0.6}
    />
  );
};
