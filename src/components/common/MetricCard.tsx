import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: LucideIcon;
  variant?: 'default' | 'profit' | 'loss' | 'indigo' | 'amber' | 'gold';
  tooltip?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subValue,
  icon: Icon,
  variant = 'default',
  tooltip,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'profit':
        return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400';
      case 'loss':
        return 'border-red-500/30 bg-red-500/10 text-red-400';
      case 'indigo':
        return 'border-brand-gold/30 bg-brand-gold/10 text-brand-gold';
      case 'amber':
      case 'gold':
        return 'border-brand-gold/35 bg-brand-gold/15 text-brand-gold';
      default:
        return 'border-brand-tealBorder bg-brand-tealSurface text-brand-goldLight';
    }
  };

  const getValueColor = () => {
    switch (variant) {
      case 'profit':
        return 'text-emerald-500 dark:text-emerald-400';
      case 'loss':
        return 'text-red-500 dark:text-red-400';
      case 'indigo':
        return 'text-brand-gold dark:text-brand-goldLight';
      case 'amber':
      case 'gold':
        return 'text-brand-goldDark dark:text-brand-gold';
      default:
        return 'text-slate-900 dark:text-white';
    }
  };

  return (
    <div
      title={tooltip}
      className="p-4 rounded-2xl border border-slate-200 dark:border-brand-tealBorder bg-white dark:bg-brand-tealSurface shadow-md hover:border-brand-gold/40 transition-all hover:shadow-brand-gold/5"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {label}
        </span>
        {Icon && (
          <div className={`p-2 rounded-xl border ${getVariantStyles()}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className={`text-xl sm:text-2xl font-bold tracking-tight font-mono ${getValueColor()}`}>
          {value}
        </span>
        {subValue && (
          <span className="text-xs font-medium text-slate-400">
            {subValue}
          </span>
        )}
      </div>
    </div>
  );
};
