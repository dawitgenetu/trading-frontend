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
        return 'border-[#10B981]/30 bg-[#10B981]/10 text-[#10B981]';
      case 'loss':
        return 'border-[#EF4444]/30 bg-[#EF4444]/10 text-[#EF4444]';
      case 'indigo':
      case 'amber':
      case 'gold':
        return 'border-brand/35 bg-brand/15 text-brand';
      default:
        return 'border-slate-700/60 bg-[#1E293B] text-brand';
    }
  };

  const getValueColor = () => {
    switch (variant) {
      case 'profit':
        return 'text-[#10B981]';
      case 'loss':
        return 'text-[#EF4444]';
      case 'indigo':
      case 'amber':
      case 'gold':
        return 'text-brand';
      default:
        return 'text-[#F8FAFC]';
    }
  };

  return (
    <div
      title={tooltip}
      className="p-4 rounded-2xl border border-slate-700/60 bg-[#1E293B] shadow-md hover:border-brand/40 transition-all hover:shadow-brand/5 font-mono"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
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
          <span className="text-xs font-medium text-[#94A3B8]">
            {subValue}
          </span>
        )}
      </div>
    </div>
  );
};
