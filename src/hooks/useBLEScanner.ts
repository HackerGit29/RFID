import { useEffect, useState, useCallback, useRef } from 'react';
import { BLEDevice } from '../types';
import { smoothRSSI, rssiToDistance, getSignalStatus, KalmanFilter, BLE_CONFIG } from '../utils/bleFilters';

/**
 * useBLEScanner Hook
 * Handles BLE scanning, signal smoothing, and distance estimation.
 * Note: In a real Capacitor environment, this would use @capacitor-community/bluetooth-le
 */
export function useBLEScanner(targetDeviceId?: string) {
  const [devices, setDevices] = useState<Map<string, BLEDevice>>(new Map());
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Store Kalman filters for each device to maintain state independently
  const filters = useRef<Map<string, KalmanFilter>>(new Map());

  // Simulate a BLE Scan result (since we are in a web environment)
  const handleDeviceDetected = useCallback((id: string, name: string, rssi: number, icon: string) => {
    setDevices(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(id);

      // Use Kalman Filter for stability
      if (!filters.current.has(id)) {
        filters.current.set(id, new KalmanFilter(rssi));
      }
      const filter = filters.current.get(id)!;
      const smoothed = filter.update(rssi);

      const distance = rssiToDistance(smoothed);

      newMap.set(id, {
        id,
        name,
        rssi,
        smoothedRssi: smoothed,
        distance,
        status: getSignalStatus(smoothed),
        icon,
        lastPing: Date.now(),
      });

      return newMap;
    });
  }, []);

  // Heartbeat check to mark devices as 'lost'
  useEffect(() => {
    const heartbeatInterval = setInterval(() => {
      setDevices(prev => {
        const now = Date.now();
        let changed = false;
        const newMap = new Map(prev);

        for (const [id, device] of prev.entries()) {
          if (now - device.lastPing > BLE_CONFIG.TTL_THRESHOLD && device.status !== 'lost') {
            const updatedDevice = { ...device, status: 'lost' as const };
            newMap.set(id, updatedDevice);
            changed = true;
          }
        }
        return changed ? newMap : prev;
      });
    }, 10000); // Check every 10 seconds

    return () => clearInterval(heartbeatInterval);
  }, []);

  useEffect(() => {
    if (!isScanning) return;

    // MOCK SCANNER: Simulates incoming BLE packets
    const interval = setInterval(() => {
      // Simulate tracking a specific device or discovering others
      const mockDevices = [
        { id: 'BEACON_01', name: 'Perceuse Bosch', icon: 'handyman', rssi: -70 + (Math.random() * 10 - 5) },
        { id: 'BEACON_02', name: 'Oscilloscope', icon: 'precision_manufacturing', rssi: -85 + (Math.random() * 20 - 10) },
      ];

      mockDevices.forEach(d => {
        // If targetDeviceId is set, we only "process" the target for the radar UI
        if (!targetDeviceId || d.id === targetDeviceId) {
          handleDeviceDetected(d.id, d.name, d.rssi, d.icon);
        }
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isScanning, targetDeviceId, handleDeviceDetected]);

  const startScan = () => {
    setIsScanning(true);
    setError(null);
  };

  const stopScan = () => {
    setIsScanning(false);
  };

  return {
    devices: Array.from(devices.values()),
    isScanning,
    startScan,
    stopScan,
    error,
  };
}
