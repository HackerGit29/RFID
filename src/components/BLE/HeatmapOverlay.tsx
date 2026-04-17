import { useMemo } from 'react';
import { BLEDevice } from '../../types';
import { getSignalIntensity } from '../../utils/bleFilters';

interface HeatmapOverlayProps {
  devices: BLEDevice[];
  visible: boolean;
}

/**
 * Get heatmap color based on RSSI signal strength
 * Green (hot) → Yellow (warm) → Blue (cold)
 */
function getHeatColor(rssi: number): { bg: string; border: string; opacity: number } {
  const intensity = getSignalIntensity(rssi);
  
  if (rssi >= -60) {
    // Hot - Green
    return {
      bg: 'rgba(6, 193, 103, 0.15)',
      border: '#06C167',
      opacity: 0.15 + (intensity / 100) * 0.25,
    };
  } else if (rssi >= -80) {
    // Warm - Yellow to Orange
    const warmFactor = (rssi + 80) / 20; // 0 to 1
    return {
      bg: warmFactor > 0.5 ? 'rgba(255, 193, 7, 0.12)' : 'rgba(255, 152, 0, 0.1)',
      border: warmFactor > 0.5 ? '#FFC107' : '#FF9800',
      opacity: 0.1 + (intensity / 100) * 0.2,
    };
  } else {
    // Cold - Blue
    return {
      bg: 'rgba(0, 113, 235, 0.1)',
      border: '#0071EB',
      opacity: 0.08 + (intensity / 100) * 0.15,
    };
  }
}

/**
 * Calculate probability radius in pixels based on RSSI
 * Stronger signal = smaller radius (more confident)
 * Weaker signal = larger radius (less confident)
 */
function getPixelRadius(rssi: number): number {
  const intensity = getSignalIntensity(rssi);
  
  // Pixel radius for visualization
  if (rssi >= -60) {
    // Hot: 30-60px (high confidence)
    return 30 + (intensity / 100) * 30;
  } else if (rssi >= -80) {
    // Warm: 60-120px (medium confidence)
    return 60 + (intensity / 100) * 60;
  } else {
    // Cold: 120-200px (low confidence)
    return 120 + (intensity / 100) * 80;
  }
}

export default function HeatmapOverlay({ devices, visible }: HeatmapOverlayProps) {
  const heatmapCircles = useMemo(() => {
    if (!visible || devices.length === 0) return null;

    return devices.map((device, index) => {
      const colors = getHeatColor(device.smoothedRssi);
      const radius = getPixelRadius(device.smoothedRssi);
      
      // Position in viewport (centered with offset for visualization)
      const centerX = 50 + (index - Math.floor(devices.length / 2)) * 15; // percentage
      const centerY = 50 + (index - Math.floor(devices.length / 2)) * 15;

      return (
        <div
          key={`heatmap-${device.id}`}
          className="absolute pointer-events-none"
          style={{
            left: `${centerX}%`,
            top: `${centerY}%`,
            transform: 'translate(-50%, -50%)',
            zIndex: 5,
          }}
        >
          {/* Main probability circle */}
          <div
            className="rounded-full transition-all duration-500"
            style={{
              width: `${radius * 2}px`,
              height: `${radius * 2}px`,
              backgroundColor: colors.bg,
              border: `2px solid ${colors.border}`,
              opacity: colors.opacity,
            }}
          />
          
          {/* Pulse ring for hot devices */}
          {device.status === 'hot' && (
            <div
              className="absolute inset-0 rounded-full animate-ping"
              style={{
                width: `${radius * 3}px`,
                height: `${radius * 3}px`,
                left: `-${radius}px`,
                top: `-${radius}px`,
                border: `1px dashed ${colors.border}`,
                opacity: 0.3,
                animationDuration: '2s',
              }}
            />
          )}
        </div>
      );
    });
  }, [devices, visible]);

  if (!visible) return null;

  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      {heatmapCircles}
    </div>
  );
}
