import React, { useEffect, useState } from 'react';
import { GlassModal } from '@/components/glass/GlassModal';
import { getAllGameSessions, clearAllGameSessions, GameSessionRecord } from '@/persistence/gameHistoryStorage';
import { Trash2 } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose }) => {
  const [sessions, setSessions] = useState<GameSessionRecord[]>([]);

  const loadSessions = async () => {
    const list = await getAllGameSessions();
    setSessions(list);
  };

  useEffect(() => {
    if (isOpen) {
      loadSessions();
    }
  }, [isOpen]);

  const handleClear = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử đấu?')) {
      await clearAllGameSessions();
      setSessions([]);
    }
  };

  const gameNames: Record<string, string> = {
    chess: 'Cờ Vua',
    xiangqi: 'Cờ Tướng',
    gomoku: 'Caro',
    checkers: 'Cờ Đam',
  };

  return (
    <GlassModal isOpen={isOpen} onClose={onClose} title="Lịch sử ván đấu">
      <div className="flex flex-col gap-3 py-1">
        {sessions.length === 0 ? (
          <div className="text-center py-8 text-sm text-slate-500 font-medium">
            Chưa có ván đấu nào hoàn tất.
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center px-1 mb-1">
              <span className="text-xs text-slate-500 font-medium">
                Tổng số ván: {sessions.length}
              </span>
              <button
                onClick={handleClear}
                className="text-xs text-red-600 hover:underline flex items-center gap-1 font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa tất cả</span>
              </button>
            </div>

            <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className="p-3 rounded-2xl bg-white/50 border border-white/70 shadow-sm flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      {gameNames[s.game] || s.game} ({s.mode === 'ai' ? 'Vs Máy' : '2 Người'})
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {new Date(s.createdAt).toLocaleString('vi-VN')} • {s.moveCount} nước đi
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        s.winner === 'p1'
                          ? 'bg-emerald-100 text-emerald-800'
                          : s.winner === 'p2'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {s.winner ? (s.winner === 'p1' ? 'Người chơi 1 Thắng' : 'Người chơi 2 Thắng') : 'Hòa'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </GlassModal>
  );
};
