import React, { Suspense, Component, ErrorInfo, ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { GrassField } from './GrassField';
import { SkyAndLighting } from './SkyDome';
import { Board3D } from './Board3D';
import { Pieces3D } from './Pieces3D';
import { CameraRig } from './CameraRig';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { Board2DFallback } from '@/components/board2d/Board2DFallback';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

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

  const dpr = quality === 'low' ? 1 : quality === 'medium' ? 1.25 : 1.5;

  return (
    <div className="w-full h-full absolute inset-0 select-none">
      <WebGLErrorBoundary>
        <Canvas
          shadows
          dpr={dpr}
          camera={{ position: [0, 5.8, 5.4], fov: 45 }}
          gl={{ antialias: quality !== 'low', alpha: true, powerPreference: 'high-performance' }}
        >
          <Suspense fallback={null}>
            <SkyAndLighting />
            <GrassField />
            <Board3D />
            <Pieces3D />
            <CameraRig />
          </Suspense>
        </Canvas>
      </WebGLErrorBoundary>
    </div>
  );
};
