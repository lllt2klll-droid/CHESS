import React, { Suspense, Component, ErrorInfo, ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { GrassField }         from './GrassField';
import { SkyAndLighting }     from './SkyDome';
import { Board3D }            from './Board3D';
import { Pieces3D }           from './Pieces3D';
import { CameraRig }          from './CameraRig';
import { FloatingParticles }  from './FloatingParticles';
import { useSettingsStore }   from '@/stores/useSettingsStore';
import { Board2DFallback }    from '@/components/board2d/Board2DFallback';

interface Props  { children?: ReactNode; }
interface State  { hasError: boolean;    }

class WebGLErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('WebGL Canvas Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4">
          <div className="mb-4 text-emerald-950 font-medium bg-white/70 px-4 py-2 rounded-full backdrop-blur-md">
            Đang hiển thị chế độ 2D Fallback
          </div>
          <Board2DFallback />
        </div>
      );
    }
    return this.props.children;
  }
}

export const SceneContainer: React.FC = () => {
  const { ui, quality } = useSettingsStore();

  if (ui.board2DFallback) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <Board2DFallback />
      </div>
    );
  }

  const dpr = quality === 'low' ? 1 : quality === 'medium' ? 1.25 : Math.min(1.5, window.devicePixelRatio);

  return (
    <div className="w-full h-full absolute inset-0 select-none">
      <WebGLErrorBoundary>
        <Canvas
          shadows
          dpr={dpr}
          camera={{ position: [0, 9.5, 9.0], fov: 42, near: 0.1, far: 350 }}
          gl={{
            antialias: quality !== 'low',
            alpha: false,
            powerPreference: 'high-performance',
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.15, // Radiant luminous anime exposure
          }}
        >
          <Suspense fallback={null}>
            <SkyAndLighting />
            <GrassField />
            <Board3D />
            <Pieces3D />
            <FloatingParticles />
            <CameraRig />
          </Suspense>
        </Canvas>
      </WebGLErrorBoundary>
    </div>
  );
};
