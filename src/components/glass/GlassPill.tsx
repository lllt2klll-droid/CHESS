import React from 'react';

interface GlassPillProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export const GlassPill: React.FC<GlassPillProps> = ({
  children,
  active = false,
  className = '',
  ...props
}) => {
  return (
    <button
      type="button"
      className={`liquid-glass-pill px-4 py-2.5 rounded-full flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-800 hover:text-emerald-950 hover:bg-white/70 active:scale-95 transition-all shadow-glass cursor-pointer ${
        active ? 'bg-white/80 ring-2 ring-emerald-500/50' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
