import React from 'react';
import { Home } from 'lucide-react';
import { useSettingsStore } from '@/stores/useSettingsStore';

interface Props {
  onHomeClick?: () => void;
}

export const TopLeftBrand: React.FC<Props> = ({ onHomeClick }) => {
  const { setCameraPreset } = useSettingsStore();

  const handleClick = () => {
    setCameraPreset('isometric');
    if (onHomeClick) onHomeClick();
  };

  return (
    <div className="flex items-center gap-3 liquid-glass-pill rounded-full pl-1.5 pr-5 py-1.5 shadow-glass border border-white/80 select-none">
      {/* Circular Blue Home Icon */}
      <button
        onClick={handleClick}
        className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#3b82f6] to-[#60a5fa] flex items-center justify-center text-white shadow-md hover:scale-105 active:scale-95 transition-transform cursor-pointer"
        title="Trang chủ / Đặt lại góc nhìn"
      >
        <Home className="w-5 h-5 drop-shadow" />
      </button>

      {/* Brand Text */}
      <div className="flex flex-col text-left leading-tight">
        <span className="text-sm font-extrabold text-slate-900 tracking-wide drop-shadow-sm">
          Board Game Lounge
        </span>
        <span className="text-[11px] font-medium text-slate-600/90 tracking-normal">
          Thư giãn • Chơi cờ • Tận hưởng
        </span>
      </div>
    </div>
  );
};
