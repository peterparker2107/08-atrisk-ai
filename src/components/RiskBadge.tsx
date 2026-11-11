import React from 'react';
import type { RiskLevel } from '../types/student';
import { AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';

interface RiskBadgeProps {
  score: number;
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  pulsing?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  score,
  level,
  size = 'md',
  showLabel = true,
  pulsing = false,
}) => {
  const getStyles = () => {
    switch (level) {
      case 'CRITICAL':
        return {
          bg: 'bg-rose-500/10 border-rose-500/40 text-rose-300',
          dot: 'bg-rose-500',
          icon: <AlertTriangle className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />,
          label: 'Critical Risk',
          textOklch: 'text-[oklch(0.55_0.22_25)]',
        };
      case 'MODERATE':
        return {
          bg: 'bg-amber-500/10 border-amber-500/40 text-amber-300',
          dot: 'bg-amber-500',
          icon: <AlertCircle className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />,
          label: 'Moderate Risk',
          textOklch: 'text-[oklch(0.75_0.18_60)]',
        };
      case 'LOW':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300',
          dot: 'bg-emerald-500',
          icon: <CheckCircle2 className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />,
          label: 'Stable Trajectory',
          textOklch: 'text-[oklch(0.65_0.18_155)]',
        };
    }
  };

  const style = getStyles();

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-sm px-2.5 py-1 gap-2',
    lg: 'text-base px-3.5 py-1.5 gap-2.5 font-semibold',
  }[size];

  return (
    <div
      className={`inline-flex items-center rounded-full border ${style.bg} ${sizeClasses} ${
        pulsing && level === 'CRITICAL' ? 'animate-urgent-pulse shadow-glow-red' : ''
      }`}
    >
      <span className="flex items-center gap-1">
        {style.icon}
        <span className="font-mono font-bold tracking-tight">{score}%</span>
      </span>
      {showLabel && (
        <>
          <span className="w-1 h-1 rounded-full opacity-60 bg-current" />
          <span className="font-medium">{style.label}</span>
        </>
      )}
    </div>
  );
};
