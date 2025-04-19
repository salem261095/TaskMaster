import React from 'react';

interface ProgressBarProps {
  percentage: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  size = 'md',
  className = '',
}) => {
  const getHeight = () => {
    switch (size) {
      case 'sm': return 'h-1';
      case 'lg': return 'h-3';
      default: return 'h-2';
    }
  };

  const getColor = () => {
    if (percentage < 30) return 'bg-red-500';
    if (percentage < 70) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className={`w-full bg-slate-700 rounded-full overflow-hidden ${getHeight()} ${className}`}>
      <div
        className={`${getColor()} ${getHeight()} transition-all duration-500 ease-out`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

export default ProgressBar;
