import React, { useState, useRef, useEffect } from 'react';
import { Box, ChevronDown, Check } from 'lucide-react';
import { GlassPill } from '@/components/glass/GlassPill';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { CameraPreset } from '@/types/game';

export const CameraDropdown: React.FC = () => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { camera, setCameraPreset } = useSettingsStore();

  const presets: Array<{ id: CameraPreset; label: string; desc: string }> = [
    { id: 'isometric', label: 'Góc nghiêng (Mặc định)', desc: 'Góc nhìn 3/4 tự nhiên nhất' },
    { id: 'top', label: 'Từ trên xuống', desc: 'Dễ quan sát toàn diện bàn cờ' },
    { id: 'low', label: 'Góc thấp sát cỏ', desc: 'Trải nghiệm không gian 3D sâu' },
    { id: 'piece', label: 'Cận cảnh quân cờ', desc: 'Góc nhìn tập trung vào bàn' },
  ];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <GlassPill onClick={() => setOpen(!open)} active={open}>
        <Box className="w-4 h-4 text-emerald-800" />
        <span>Góc nhìn</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </GlassPill>

      {open && (
        <div className="absolute bottom-full mb-3 left-0 w-64 liquid-glass-card rounded-2xl p-2 shadow-2xl z-50 border border-white/80 animate-fade-in">
          <div className="text-xs font-bold text-slate-500 uppercase px-3 py-1.5 tracking-wider">
            Chọn góc camera
          </div>
          <div className="flex flex-col gap-1">
            {presets.map((p) => {
              const isSelected = camera.preferredPreset === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setCameraPreset(p.id);
                    setOpen(false);
                  }}
                  type="button"
                  className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-colors ${
                    isSelected ? 'bg-white/80 font-bold text-emerald-950' : 'hover:bg-white/50 text-slate-700'
                  }`}
                >
                  <div>
                    <div className="text-sm">{p.label}</div>
                    <div className="text-[11px] text-slate-500 font-normal">{p.desc}</div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
