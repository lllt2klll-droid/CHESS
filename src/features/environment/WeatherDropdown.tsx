import React, { useState, useRef, useEffect } from 'react';
import { Wind, ChevronDown, Check, Sun, Moon, CloudSun, Sunset } from 'lucide-react';
import { GlassPill } from '@/components/glass/GlassPill';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { TimePreset, WeatherPreset } from '@/types/game';

export const WeatherDropdown: React.FC = () => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { environment, setTimePreset, setWeatherPreset, setWindEnabled, setWindIntensity } =
    useSettingsStore();

  const timeOptions: Array<{ id: TimePreset; label: string; icon: React.ReactNode }> = [
    { id: 'morning', label: 'Sáng sớm', icon: <CloudSun className="w-4 h-4 text-amber-500" /> },
    { id: 'noon', label: 'Nắng đẹp', icon: <Sun className="w-4 h-4 text-amber-500" /> },
    { id: 'sunset', label: 'Hoàng hôn', icon: <Sunset className="w-4 h-4 text-orange-500" /> },
    { id: 'night', label: 'Đêm trăng', icon: <Moon className="w-4 h-4 text-indigo-400" /> },
  ];

  const currentLabel =
    timeOptions.find((t) => t.id === environment.timePreset)?.label || 'Nắng đẹp';

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
        <Wind className="w-4 h-4 text-emerald-800" />
        <span>Thời tiết: {currentLabel}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </GlassPill>

      {open && (
        <div className="absolute bottom-full mb-3 right-0 w-72 liquid-glass-card rounded-2xl p-3 shadow-2xl z-50 border border-white/80 animate-fade-in">
          <div className="text-xs font-bold text-slate-500 uppercase px-2 mb-1.5 tracking-wider">
            Thời gian trong ngày
          </div>
          <div className="grid grid-cols-2 gap-1 mb-3">
            {timeOptions.map((t) => {
              const isSelected = environment.timePreset === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTimePreset(t.id)}
                  type="button"
                  className={`px-2.5 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold transition ${
                    isSelected
                      ? 'bg-white/80 text-emerald-950 font-bold shadow-sm'
                      : 'hover:bg-white/50 text-slate-700'
                  }`}
                >
                  {t.icon}
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          <div className="text-xs font-bold text-slate-500 uppercase px-2 mb-1.5 tracking-wider border-t border-white/40 pt-2">
            Gió lay thảm cỏ
          </div>
          <div className="px-2 flex items-center justify-between gap-3 mb-2">
            <span className="text-xs text-slate-700 font-medium">Bật gió:</span>
            <input
              type="checkbox"
              checked={environment.windEnabled}
              onChange={(e) => setWindEnabled(e.target.checked)}
              className="accent-emerald-600 rounded cursor-pointer"
            />
          </div>
          {environment.windEnabled && (
            <div className="px-2 mb-2">
              <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                <span>Cường độ:</span>
                <span>{Math.round(environment.windIntensity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={environment.windIntensity}
                onChange={(e) => setWindIntensity(parseFloat(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
