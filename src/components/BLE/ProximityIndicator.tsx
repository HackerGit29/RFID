import { useMemo } from 'react';
import { getSignalIntensity } from '../../utils/bleFilters';

interface ProximityIndicatorProps {
  rssi: number;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

export default function ProximityIndicator({ 
  rssi, 
  size = 'md',
  animated = true,
  className = ''
}: ProximityIndicatorProps) {
  const intensity = getSignalIntensity(rssi);
  
  const config = useMemo(() => {
    if (rssi >= -60) {
      return {
        label: 'CHAUD',
        color: '#06C167',
        glowColor: 'rgba(6, 193, 103, 0.4)',
        emoji: '🔥',
      };
    } else if (rssi >= -80) {
      return {
        label: 'TIÈDE',
        color: '#FFC107',
        glowColor: 'rgba(255, 193, 7, 0.3)',
        emoji: '🌤️',
      };
    } else {
      return {
        label: 'FROID',
        color: '#0071EB',
        glowColor: 'rgba(0, 113, 235, 0.3)',
        emoji: '❄️',
      };
    }
  }, [rssi]);

  const sizeConfig = {
    sm: { container: 'w-10 h-10', ring: 'w-8 h-8', dot: 'w-2 h-2', text: 'text-[8px]' },
    md: { container: 'w-14 h-14', ring: 'w-12 h-12', dot: 'w-3 h-3', text: 'text-[10px]' },
    lg: { container: 'w-20 h-20', ring: 'w-16 h-16', dot: 'w-4 h-4', text: 'text-xs' },
  };

  const { container, ring, dot, text } = sizeConfig[size];

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <div className={`relative ${container} flex items-center justify-center`}>
        {/* Outer glow ring */}
        {animated && (
          <div
            className={`absolute ${ring} rounded-full opacity-50`}
            style={{
              background: config.glowColor,
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          />
        )}
        
        {/* Main ring */}
        <div
          className={`${ring} rounded-full flex items-center justify-center border-2 transition-all duration-300`}
          style={{
            borderColor: config.color,
            background: `${config.color}15`,
          }}
        >
          {/* Intensity dot */}
          <div
            className={`${dot} rounded-full transition-all duration-500`}
            style={{
              backgroundColor: config.color,
              boxShadow: `0 0 8px ${config.glowColor}`,
              opacity: intensity / 100,
            }}
          />
        </div>
      </div>
      
      {/* Label */}
      <span
        className={`${text} font-bold uppercase tracking-wider`}
        style={{ color: config.color }}
      >
        {config.emoji} {config.label}
      </span>
    </div>
  );
}
