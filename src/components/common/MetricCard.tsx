import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: LucideIcon;
  variant?: 'default' | 'profit' | 'loss' | 'indigo' | 'amber';
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
        return 'border-emerald-500/30 bg-emerald-500/5 text-emerald-500';
      case 'loss':
        return 'border-red-500/30 bg-red-500/5 text-red-500';
      case 'indigo':
        return 'border-indigo-500/30 bg-indigo-500/5 text-indigo-500';
      case 'amber':
        return 'border-amber-500/30 bg-amber-500/5 text-amber-500';
      default:
        return 'border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-card text-slate-400';
    }
  };

  const getValueColor = () => {
    switch (variant) {
      case 'profit':
        return 'text-emerald-500 dark:text-emerald-400';
      case 'loss':
        return 'text-red-500 dark:text-red-400';
      case 'indigo':
        return 'text-indigo-600 dark:text-indigo-400';
      case 'amber':
        return 'text-amber-600 dark:text-amber-400';
      default:
        return 'text-slate-900 dark:text-white';
    }
  };

  return (
    <div
      title={tooltip}
      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-dark-card shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
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
