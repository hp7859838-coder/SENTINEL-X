import React from 'react';

interface MetricCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  variant?: 'default' | 'danger' | 'warning' | 'success' | 'cyan';
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  variant = 'default',
  onClick,
}) => {
  const variantStyles = {
    default: 'border-slate-800 bg-slate-900/70 hover:border-slate-700',
    danger: 'border-red-900/60 bg-red-950/20 hover:border-red-800/80',
    warning: 'border-amber-900/60 bg-amber-950/20 hover:border-amber-800/80',
    success: 'border-emerald-900/60 bg-emerald-950/20 hover:border-emerald-800/80',
    cyan: 'border-cyan-900/60 bg-cyan-950/20 hover:border-cyan-800/80',
  }[variant];

  const valueColors = {
    default: 'text-slate-100',
    danger: 'text-red-400',
    warning: 'text-amber-300',
    success: 'text-emerald-400',
    cyan: 'text-cyan-300',
  }[variant];

  return (
    <div
      onClick={onClick}
      className={`rounded-xl border p-5 transition-all shadow-lg backdrop-blur-sm ${variantStyles} ${
        onClick ? 'cursor-pointer hover:scale-[1.01]' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</span>
        <div className="p-2 rounded-lg bg-slate-800/60 text-slate-300">{icon}</div>
      </div>
      <div className="mt-4 flex items-baseline justify-between">
        <span className={`text-3xl font-bold font-mono tracking-tight ${valueColors}`}>
          {value}
        </span>
      </div>
      {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
    </div>
  );
};
