import React, { useState, useEffect } from 'react';
import { Sun, CloudSun, Sunset, Moon } from 'lucide-react';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { TimePreset } from '@/types/game';

const TIME_CYCLE: TimePreset[] = ['morning', 'noon', 'sunset', 'night'];

const TIME_DATA: Record<TimePreset, { label: string; temp: string; icon: React.ReactNode }> = {
  morning: {
    label: 'Sáng sớm',
    temp: '22°C',
    icon: <CloudSun className="w-4 h-4 sm:w-6 sm:h-6 text-amber-500 drop-shadow" />,
  },
  noon: {
    label: 'Trời quang',
    temp: '26°C',
    icon: <Sun className="w-4 h-4 sm:w-6 sm:h-6 text-amber-500 drop-shadow animate-spin-slow" />,
  },
  sunset: {
    label: 'Hoàng hôn',
    temp: '24°C',
    icon: <Sunset className="w-4 h-4 sm:w-6 sm:h-6 text-orange-500 drop-shadow" />,
  },
  night: {
    label: 'Đêm trăng',
    temp: '19°C',
    icon: <Moon className="w-4 h-4 sm:w-6 sm:h-6 text-indigo-400 drop-shadow" />,
  },
};

const DAY_NAMES = ['CN', 'Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7'];

export const BottomWeatherWidget: React.FC = () => {
  const { environment, setTimePreset } = useSettingsStore();
  const [timeStr, setTimeStr] = useState('10:24');
  const [dateStr, setDateStr] = useState('Th 2, 17/11');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      setTimeStr(`${hh}:${mm}`);

      const dayName = DAY_NAMES[now.getDay()];
      const d = now.getDate();
      const m = now.getMonth() + 1;
      setDateStr(`${dayName}, ${d}/${m}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const currentData = TIME_DATA[environment.timePreset] || TIME_DATA.noon;

  const handleCycleWeather = () => {
    const idx = TIME_CYCLE.indexOf(environment.timePreset);
    const next = TIME_CYCLE[(idx + 1) % TIME_CYCLE.length];
    setTimePreset(next);
  };

  return (
    <button
      onClick={handleCycleWeather}
      type="button"
      className="liquid-glass-pill rounded-full px-2.5 sm:px-4 py-1.5 sm:py-2 flex items-center gap-1.5 sm:gap-3 shadow-glass border border-white/80 pointer-events-auto select-none hover:bg-white/60 active:scale-95 transition-all cursor-pointer text-left shrink-0"
      title="Bấm để đổi thời tiết & thời gian trong ngày"
    >
      {/* Weather Icon */}
      <div className="shrink-0">{currentData.icon}</div>

      {/* Temperature & Weather Label */}
      <div className="flex flex-col leading-tight">
        <span className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight">
          {currentData.temp}
        </span>
        <span className="hidden sm:inline text-[11px] font-medium text-slate-600">
          {currentData.label}
        </span>
      </div>

      {/* Divider */}
      <div className="w-[1px] h-4 sm:h-6 bg-slate-400/30 mx-0.5" />

      {/* Time & Date */}
      <div className="flex flex-col leading-tight text-right">
        <span className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight">
          {timeStr}
        </span>
        <span className="hidden sm:inline text-[11px] font-medium text-slate-600">
          {dateStr}
        </span>
      </div>
    </button>
  );
};
