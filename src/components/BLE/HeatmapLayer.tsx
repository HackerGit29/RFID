import { useEffect, useRef } from 'react';
import { Circle, Map as LeafletMapType } from 'leaflet';
import { BLEDevice } from '../../types';
import { getSignalIntensity } from '../../utils/bleFilters';

interface HeatmapLayerProps {
  devices: BLEDevice[];
  visible: boolean;
  labCenter: [number, number];
  mapInstance: LeafletMapType | null;
}

/**
 * Get heatmap color based on RSSI signal strength
 * Green (hot) → Yellow (warm) → Blue (cold)
 */
function getHeatColor(rssi: number): { fill: string; stroke: string; opacity: number } {
  const intensity = getSignalIntensity(rssi);
  
  if (rssi >= -60) {
    // Hot - Green
    return {
      fill: '#06C167',
      stroke: '#06C167',
      opacity: 0.15 + (intensity / 100) * 0.25,
    };
  } else if (rssi >= -80) {
    // Warm - Yellow to Orange
    const warmFactor = (rssi + 80) / 20; // 0 to 1
    return {
      fill: warmFactor > 0.5 ? '#FFC107' : '#FF9800',
      stroke: warmFactor > 0.5 ? '#FFC107' : '#FF9800',
      opacity: 0.1 + (intensity / 100) * 0.2,
    };
  } else {
    // Cold - Blue
    return {
      fill: '#0071EB',
      stroke: '#0071EB',
      opacity: 0.08 + (intensity / 100) * 0.15,
    };
  }
}

/**
 * Calculate probability radius based on RSSI
 * Stronger signal = smaller radius (more confident)
 * Weaker signal = larger radius (less confident)
 */
function getProbabilityRadius(rssi: number): number {
  const intensity = getSignalIntensity(rssi);
  
  // Base radius in meters
  if (rssi >= -60) {
    // Hot: 1-3m radius (high confidence)
    return 1 + (1 - intensity / 100) * 2;
  } else if (rssi >= -80) {
    // Warm: 3-8m radius (medium confidence)
    return 3 + (1 - intensity / 100) * 5;
  } else {
    // Cold: 8-20m radius (low confidence)
    return 8 + (1 - intensity / 100) * 12;
  }
}

export default function HeatmapLayer({ devices, visible, labCenter, mapInstance }: HeatmapLayerProps) {
  const circlesRef = useRef<Circle[]>([]);

  useEffect(() => {
    if (!mapInstance || !visible) {
      // Clear all circles when hidden
      circlesRef.current.forEach(circle => mapInstance?.removeLayer(circle));
      circlesRef.current = [];
      return;
    }

    // Clear old circles
    circlesRef.current.forEach(circle => mapInstance.removeLayer(circle));
    circlesRef.current = [];

    const newCircles: Circle[] = [];

    devices.forEach((device, index) => {
      // Calculate position offset from lab center
      const offset = (index - Math.floor(devices.length / 2)) * 0.0001;
      const position: [number, number] = [
        labCenter[0] + offset,
        labCenter[1] + offset,
      ];

      const radius = getProbabilityRadius(device.smoothedRssi);
      const colors = getHeatColor(device.smoothedRssi);

      // Create main probability circle
      const circle = new Circle(position, {
        radius: radius,
        fillColor: colors.fill,
        fillOpacity: colors.opacity,
        color: colors.stroke,
        weight: 2,
        opacity: colors.opacity * 1.5,
        className: 'heatmap-circle',
      }).addTo(mapInstance);

      newCircles.push(circle);

      // Add outer pulse ring for hot devices
      if (device.status === 'hot') {
        const pulseCircle = new Circle(position, {
          radius: radius * 1.5,
          fillColor: colors.fill,
          fillOpacity: colors.opacity * 0.3,
          color: colors.stroke,
          weight: 1,
          opacity: colors.opacity * 0.5,
          className: 'heatmap-circle-pulse',
          dashArray: '5, 10',
        }).addTo(mapInstance);

        newCircles.push(pulseCircle);
      }
    });

    circlesRef.current = newCircles;

    // Cleanup
    return () => {
      newCircles.forEach(circle => {
        mapInstance.removeLayer(circle);
      });
    };
  }, [devices, visible, mapInstance, labCenter]);

  return null;
}
