import React from 'react';

interface GlassIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  tooltip?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const GlassIconButton: React.FC<GlassIconButtonProps> = ({
  children,
  active = false,
  tooltip,
  size = 'md',
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'w-9 h-9 text-sm',
    md: 'w-11 h-11 text-base',
    lg: 'w-13 h-13 text-lg',
  }[size];

  return (
    <div className="relative group inline-block">
      <button
        type="button"
        className={`liquid-glass-pill rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 text-slate-800 hover:text-emerald-950 hover:bg-white/70 ${sizeClasses} ${
          active ? 'bg-white/80 ring-2 ring-emerald-500/50 shadow-emerald-900/20' : ''
        } ${className}`}
        {...props}
      >
        {children}
      </button>

      {tooltip && (
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 whitespace-nowrap">
          <div className="liquid-glass-pill text-xs px-2.5 py-1 rounded-full font-medium text-slate-800 shadow-md">
            {tooltip}
          </div>
        </div>
      )}
    </div>
  );
};
