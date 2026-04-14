import { useMemo } from 'react';
import { getSignalIntensity } from '../../utils/bleFilters';

interface SignalStrengthBarProps {
  rssi: number;
  showLabel?: boolean;
  animated?: boolean;
  className?: string;
}

export default function SignalStrengthBar({ 
  rssi, 
  showLabel = true,
  animated = true,
  className = ''
}: SignalStrengthBarProps) {
  const intensity = useMemo(() => getSignalIntensity(rssi), [rssi]);
  
  const color = useMemo(() => {
    if (rssi >= -60) return '#06C167';
    if (rssi >= -80) return '#FFC107';
    return '#0071EB';
  }, [rssi]);

  const segments = 5;
  const activeSegments = Math.ceil((intensity / 100) * segments);

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex items-end gap-0.5 h-6">
        {Array.from({ length: segments }).map((_, i) => {
          const isActive = i < activeSegments;
          const height = 20 + (i * 20); // 20%, 40%, 60%, 80%, 100%
          
          return (
            <div
              key={i}
              className="w-1 rounded-full transition-all duration-300"
              style={{
                height: `${height}%`,
                backgroundColor: isActive ? color : 'rgba(255, 255, 255, 0.1)',
                transitionDelay: animated ? `${i * 50}ms` : '0ms',
              }}
            />
          );
        })}
      </div>
      
      {showLabel && (
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold" style={{ color }}>
            {Math.round(intensity)}%
          </span>
          <span className="text-[9px] text-white/50 font-mono">
            {rssi} dBm
          </span>
        </div>
      )}
    </div>
  );
}
