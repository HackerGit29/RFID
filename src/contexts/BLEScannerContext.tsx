import { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from 'react';
import { BLEDevice } from '../types';
import { smoothRSSI, rssiToDistance, getSignalStatus, KalmanFilter, BLE_CONFIG } from '../utils/bleFilters';
import { getBLETools, getToolByBLEUUID } from '../utils/db';

export interface BLEDiscoveredDevice {
  uuid: string;
  rssi: number;
  name?: string;
  firstSeen: number;
}

interface BLEScannerContextType {
  devices: BLEDevice[];
  isScanning: boolean;
  startScan: () => void;
  stopScan: () => void;
  error: string | null;
  unknownDevices: BLEDiscoveredDevice[];
  clearUnknownDevice: (uuid: string) => void;
}

const BLEScannerContext = createContext<BLEScannerContextType | undefined>(undefined);

export function BLEScannerProvider({ children }: { children: ReactNode }) {
  const [devices, setDevices] = useState<Map<string, BLEDevice>>(new Map());
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unknownDevices, setUnknownDevices] = useState<BLEDiscoveredDevice[]>([]);

  const filters = useRef<Map<string, KalmanFilter>>(new Map());

  // Clear unknown device after user adds it to inventory
  const clearUnknownDevice = useCallback((uuid: string) => {
    setUnknownDevices(prev => prev.filter(d => d.uuid !== uuid));
  }, []);

  // handleDeviceDetected: id (or UUID), name, rssi, icon, optional UUID for matching
  const handleDeviceDetected = useCallback(async (id: string, name: string, rssi: number, icon: string, uuid?: string) => {
    // Use UUID for matching if provided, otherwise use id
    const matchId = uuid || id;
    
    // Check if device is known in database
    const knownTool = uuid ? await getToolByBLEUUID(uuid) : null;
    
    // Auto-discovery: track unknown devices
    if (uuid && !knownTool) {
      setUnknownDevices(prev => {
        const exists = prev.find(d => d.uuid.toUpperCase() === uuid.toUpperCase());
        if (exists) {
          // Update RSSI
          return prev.map(d => 
            d.uuid.toUpperCase() === uuid.toUpperCase() 
              ? { ...d, rssi } 
              : d
          );
        }
        // Add new unknown device
        return [...prev, { uuid, rssi, name, firstSeen: Date.now() }];
      });
    }
    
    setDevices(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(matchId);

      // Use matchId for filter key to ensure consistency
      if (!filters.current.has(matchId)) {
        filters.current.set(matchId, new KalmanFilter(rssi));
      }
      const filter = filters.current.get(matchId)!;
      const smoothed = filter.update(rssi);

      const distance = rssiToDistance(smoothed);

      // Use known tool name if found, otherwise use provided name
      const displayName = knownTool?.name || name || `Beacon ${matchId.slice(0, 8)}`;

      newMap.set(matchId, {
        id: matchId,  // Store matchId as device id (UUID in real mode)
        name: displayName,
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

  // Heartbeat to mark devices as 'lost' and clean up unknown devices
  useEffect(() => {
    const heartbeatInterval = setInterval(() => {
      const now = Date.now();
      
      // Update known devices
      setDevices(prev => {
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

      // Remove unknown devices not seen in 5 minutes
      setUnknownDevices(prev => prev.filter(d => now - d.firstSeen < 300000));
    }, 10000);

    return () => clearInterval(heartbeatInterval);
  }, []);

  // Real scanner from IndexedDB tools (BLE enabled)
  // Uses ble_uuid for matching, falls back to tool.id for mock
  useEffect(() => {
    if (!isScanning) return;

    async function loadBLETools() {
      try {
        const bleTools = await getBLETools();
        
        const interval = setInterval(() => {
          bleTools.forEach(tool => {
            // Use UUID if available, otherwise fallback to id (mock mode)
            const deviceId = tool.ble_uuid || `MOCK_${tool.id}`;
            
            // Random RSSI simulation (-60 to -90 dBm)
            const rssi = -60 - Math.random() * 30;
            const icon = 'handyman';
            
            // Pass UUID for real matching, name for display
            handleDeviceDetected(deviceId, tool.name, rssi, icon, tool.ble_uuid);
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
    unknownDevices,
    clearUnknownDevice,
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