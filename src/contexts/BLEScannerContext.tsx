import { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from 'react';
import { BLEDevice } from '../types';
import { smoothRSSI, rssiToDistance, getSignalStatus, KalmanFilter, BLE_CONFIG } from '../utils/bleFilters';
import { getBLETools } from '../utils/db';

interface BLEScannerContextType {
  devices: BLEDevice[];
  isScanning: boolean;
  startScan: () => void;
  stopScan: () => void;
  error: string | null;
}

const BLEScannerContext = createContext<BLEScannerContextType | undefined>(undefined);

export function BLEScannerProvider({ children }: { children: ReactNode }) {
  const [devices, setDevices] = useState<Map<string, BLEDevice>>(new Map());
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filters = useRef<Map<string, KalmanFilter>>(new Map());

  const handleDeviceDetected = useCallback((id: string, name: string, rssi: number, icon: string) => {
    setDevices(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(id);

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

  // Heartbeat to mark devices as 'lost'
  useEffect(() => {
    const heartbeatInterval = setInterval(() => {
      setDevices(prev => {
        const now = Date.now();
        let changed = false;
        const newMap = new Map(prev);

        for (const [id, device] of prev.entries()) {
          if (now - device.lastPing > BLE_CONFIG.TTL_THRESHOLD && device.status !== 'lost') {
            newMap.set(id, { ...device, status: 'lost' as const });
            changed = true;
          }
        }
        return changed ? newMap : prev;
      });
    }, 10000);

    return () => clearInterval(heartbeatInterval);
  }, []);

  // Real scanner from IndexedDB tools (BLE enabled)
  useEffect(() => {
    if (!isScanning) return;

    async function loadBLETools() {
      try {
        const bleTools = await getBLETools();
        
        const interval = setInterval(() => {
          // Simulate RSSI for each BLE-enabled tool
          bleTools.forEach(tool => {
            // Random RSSI simulation (-60 to -90 dBm)
            const rssi = -60 - Math.random() * 30;
            const icon = 'handyman';
            handleDeviceDetected(tool.id, tool.name, rssi, icon);
          });
        }, 1000);

        return () => clearInterval(interval);
      } catch (err) {
        console.warn('[BLE] No tools found:', err);
      }
    }

    loadBLETools();
  }, [isScanning, handleDeviceDetected]);

  const startScan = useCallback(() => {
    setIsScanning(true);
    setError(null);
  }, []);

  const stopScan = useCallback(() => {
    setIsScanning(false);
  }, []);

  const value: BLEScannerContextType = {
    devices: Array.from(devices.values()),
    isScanning,
    startScan,
    stopScan,
    error,
  };

  return (
    <BLEScannerContext.Provider value={value}>
      {children}
    </BLEScannerContext.Provider>
  );
}

export function useBLEScannerContext() {
  const context = useContext(BLEScannerContext);
  if (context === undefined) {
    throw new Error('useBLEScannerContext must be used within a BLEScannerProvider');
  }
  return context;
}
