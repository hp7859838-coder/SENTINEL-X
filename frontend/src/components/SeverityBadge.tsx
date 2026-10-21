import React from 'react';

interface SeverityBadgeProps {
  severity: string;
  size?: 'sm' | 'md' | 'lg';
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, size = 'md' }) => {
  const norm = (severity || 'INFO').toUpperCase();

  let styles = 'bg-slate-800 text-slate-300 border-slate-700';

  if (norm === 'CRITICAL') {
    styles = 'bg-red-950/80 text-red-400 border-red-700/60 animate-pulse';
  } else if (norm === 'HIGH') {
    styles = 'bg-rose-950/60 text-rose-400 border-rose-700/50';
  } else if (norm === 'MODERATE') {
    styles = 'bg-amber-950/60 text-amber-300 border-amber-700/50';
  } else if (norm === 'LOW') {
    styles = 'bg-teal-950/50 text-teal-300 border-teal-800/40';
  } else if (norm === 'INFO') {
    styles = 'bg-slate-800/80 text-cyan-300 border-cyan-800/40';
  }

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm font-semibold',
  }[size];

  return (
    <span
      className={`inline-flex items-center font-mono rounded border tracking-wider uppercase font-medium ${styles} ${sizeClasses}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80" />
      {norm}
    </span>
  );
};
