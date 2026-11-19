import React from 'react';
import { RotateCw, ZoomIn, Crosshair, Home } from 'lucide-react';
import { useSettingsStore } from '@/stores/useSettingsStore';

export const BottomCameraToolbar: React.FC = () => {
  const { camera, setCameraPreset } = useSettingsStore();

  const handleToggleRotate = () => {
    useSettingsStore.setState((s) => ({
      camera: { ...s.camera, autoRotate: !s.camera.autoRotate },
    }));
  };

  const handleZoomIn = () => {
    setCameraPreset('piece');
  };

  const handleFocus = () => {
    setCameraPreset('top');
  };

  const handleDefault = () => {
    setCameraPreset('isometric');
  };

  return (
    <div className="liquid-glass-pill rounded-full px-3 py-1.5 flex items-center shadow-glass border border-white/80 pointer-events-auto select-none">
      {/* 1. Xoay */}
      <button
        onClick={handleToggleRotate}
        type="button"
        className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all hover:bg-white/40 cursor-pointer ${
          camera.autoRotate ? 'text-blue-600 font-extrabold' : 'text-slate-700'
        }`}
        title="Bật/Tắt tự động xoay camera"
      >
        <RotateCw className={`w-4 h-4 ${camera.autoRotate ? 'animate-spin' : ''}`} />
        <span className="text-[11px] font-semibold">Xoay</span>
      </button>

      {/* Divider */}
      <div className="w-[1px] h-6 bg-slate-400/30 mx-1" />

      {/* 2. Phóng to */}
      <button
        onClick={handleZoomIn}
        type="button"
        className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all hover:bg-white/40 cursor-pointer text-slate-700"
        title="Phóng to bàn cờ"
      >
        <ZoomIn className="w-4 h-4" />
        <span className="text-[11px] font-semibold">Phóng to</span>
      </button>

      {/* Divider */}
      <div className="w-[1px] h-6 bg-slate-400/30 mx-1" />

      {/* 3. Tập trung */}
      <button
        onClick={handleFocus}
        type="button"
        className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all hover:bg-white/40 cursor-pointer text-slate-700"
        title="Góc nhìn thẳng từ trên xuống"
      >
        <Crosshair className="w-4 h-4" />
        <span className="text-[11px] font-semibold">Tập trung</span>
      </button>

      {/* Divider */}
      <div className="w-[1px] h-6 bg-slate-400/30 mx-1" />

      {/* 4. Mặc định */}
      <button
        onClick={handleDefault}
        type="button"
        className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all hover:bg-white/40 cursor-pointer text-slate-700"
        title="Khôi phục góc nhìn mặc định"
      >
        <Home className="w-4 h-4" />
        <span className="text-[11px] font-semibold">Mặc định</span>
      </button>
    </div>
  );
};
