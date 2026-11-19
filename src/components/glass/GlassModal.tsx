import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { GlassIconButton } from './GlassIconButton';

interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const GlassModal: React.FC<GlassModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/25 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full ${maxWidth} liquid-glass-card rounded-3xl p-6 shadow-2xl relative border border-white/80 overflow-hidden max-h-[90vh] flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/40 mb-4">
          <h2 className="text-xl font-bold text-slate-800 tracking-wide">{title}</h2>
          <GlassIconButton size="sm" onClick={onClose} tooltip="Đóng">
            <X className="w-4 h-4" />
          </GlassIconButton>
        </div>

        {/* Content */}
        <div className="overflow-y-auto pr-1 flex-1">{children}</div>
      </div>
    </div>
  );
};
