import React from 'react';
import { GlassModal } from '@/components/glass/GlassModal';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useGameStore } from '@/stores/useGameStore';
import { GameMode, AILevel, QualityTier } from '@/types/game';
import { Monitor, Cpu, Sparkles, Maximize, RotateCcw, History } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenHistory: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenHistory,
}) => {
  const {
    quality,
    setQuality,
    ui,
    set2DFallback,
    resetToDefaults,
  } = useSettingsStore();

  const { mode, aiLevel, initGame, game } = useGameStore();

  const handleModeChange = (newMode: GameMode) => {
    initGame(game, newMode, aiLevel);
  };

  const handleLevelChange = (newLevel: AILevel) => {
    initGame(game, mode, newLevel);
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <GlassModal isOpen={isOpen} onClose={onClose} title="Cài đặt & Tùy chọn">
      <div className="flex flex-col gap-5 py-1">
        {/* Chế độ chơi */}
        <div>
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">
            Chế độ chơi
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleModeChange('local')}
              className={`p-3 rounded-2xl flex flex-col items-center gap-1 border transition active:scale-95 ${
                mode === 'local'
                  ? 'bg-white/80 border-emerald-500 ring-2 ring-emerald-500/40 text-emerald-950 font-bold'
                  : 'bg-white/40 border-white/60 hover:bg-white/60 text-slate-700'
              }`}
            >
              <span className="text-xl">👥</span>
              <span className="text-xs">Hai người chơi</span>
            </button>
            <button
              onClick={() => handleModeChange('ai')}
              className={`p-3 rounded-2xl flex flex-col items-center gap-1 border transition active:scale-95 ${
                mode === 'ai'
                  ? 'bg-white/80 border-emerald-500 ring-2 ring-emerald-500/40 text-emerald-950 font-bold'
                  : 'bg-white/40 border-white/60 hover:bg-white/60 text-slate-700'
              }`}
            >
              <span className="text-xl">🤖</span>
              <span className="text-xs">Đấu với Máy (AI)</span>
            </button>
          </div>
        </div>

        {/* Độ khó AI (chỉ hiện khi mode === 'ai') */}
        {mode === 'ai' && (
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">
              Độ khó AI
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'medium', 'hard'] as AILevel[]).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => handleLevelChange(lvl)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold capitalize transition border ${
                    aiLevel === lvl
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-md'
                      : 'bg-white/50 text-slate-700 border-white/60 hover:bg-white/70'
                  }`}
                >
                  {lvl === 'easy' ? 'Dễ' : lvl === 'medium' ? 'Vừa' : 'Khó'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chất lượng đồ họa 3D */}
        <div>
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>Chất lượng đồ họa</span>
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {(['auto', 'low', 'medium', 'high'] as QualityTier[]).map((q) => (
              <button
                key={q}
                onClick={() => setQuality(q)}
                className={`py-2 text-xs font-bold capitalize rounded-xl transition border ${
                  quality === q
                    ? 'bg-emerald-600 text-white border-emerald-700'
                    : 'bg-white/50 text-slate-700 border-white/60 hover:bg-white/70'
                }`}
              >
                {q === 'auto' ? 'Tự động' : q === 'low' ? 'Thấp' : q === 'medium' ? 'Vừa' : 'Cao'}
              </button>
            ))}
          </div>
        </div>

        {/* Chế độ 2D Fallback */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-white/40 border border-white/60">
          <div>
            <div className="text-xs font-bold text-slate-800">Chế độ bàn cờ 2D</div>
            <div className="text-[11px] text-slate-500">Tiết kiệm pin & tối ưu cho máy yếu</div>
          </div>
          <input
            type="checkbox"
            checked={ui.board2DFallback}
            onChange={(e) => set2DFallback(e.target.checked)}
            className="w-5 h-5 accent-emerald-600 cursor-pointer"
          />
        </div>

        {/* Toàn màn hình & Lịch sử ván đấu */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleToggleFullscreen}
            className="p-2.5 rounded-xl bg-white/50 border border-white/60 hover:bg-white/70 text-slate-800 flex items-center justify-center gap-1.5 text-xs font-bold transition"
          >
            <Maximize className="w-4 h-4 text-emerald-700" />
            <span>Toàn màn hình</span>
          </button>
          <button
            onClick={() => {
              onClose();
              onOpenHistory();
            }}
            className="p-2.5 rounded-xl bg-white/50 border border-white/60 hover:bg-white/70 text-slate-800 flex items-center justify-center gap-1.5 text-xs font-bold transition"
          >
            <History className="w-4 h-4 text-emerald-700" />
            <span>Xem lịch sử ván</span>
          </button>
        </div>

        {/* Khôi phục mặc định */}
        <div className="border-t border-white/40 pt-3">
          <button
            onClick={resetToDefaults}
            className="w-full py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50/50 flex items-center justify-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Khôi phục cài đặt gốc</span>
          </button>
        </div>
      </div>
    </GlassModal>
  );
};
