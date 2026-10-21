import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const norm = (status || 'UNKNOWN').toUpperCase();

  let styles = 'bg-slate-800 text-slate-300 border-slate-700';

  if (norm === 'ALLOW' || norm === 'APPROVED' || norm === 'PASSED') {
    styles = 'bg-emerald-950/70 text-emerald-400 border-emerald-600/50';
  } else if (norm === 'BLOCK' || norm === 'REJECTED' || norm === 'FAILED') {
    styles = 'bg-red-950/70 text-red-400 border-red-700/60 font-semibold';
  } else if (norm === 'REQUIRE_APPROVAL' || norm === 'PENDING') {
    styles = 'bg-amber-950/70 text-amber-300 border-amber-600/50 animate-pulse';
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm font-semibold',
  }[size];

  return (
    <span
      className={`inline-flex items-center font-mono rounded border uppercase font-medium tracking-wide ${styles} ${sizeClasses}`}
    >
      {norm}
    </span>
  );
};
