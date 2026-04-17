import { useEffect, useState, useMemo, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import LeafletMap from '../components/LeafletMap';
import { useMapContext } from '../contexts/MapContext';
import { useBLEScannerContext } from '../contexts/BLEScannerContext';
import { BLEDeviceCard, ProximityIndicator, SignalStrengthBar, HeatmapLayer } from '../components/BLE';
import { HotColdFinder, HotColdGuidance } from '../utils/bleFilters';

export default function BLERadar() {
  const { addItem, clearItems, layers } = useMapContext();
  const { devices, isScanning, startScan, stopScan, unknownDevices, clearUnknownDevice } = useBLEScannerContext();

  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [hotColdGuidance, setHotColdGuidance] = useState<HotColdGuidance | null>(null);

  const hotColdFinder = useMemo(() => new HotColdFinder(), []);

  const selectedDevice = useMemo(
    () => devices.find(d => d.id === selectedDeviceId) || null,
    [devices, selectedDeviceId]
  );

  // Auto-start scanning
  useEffect(() => {
    startScan();
    return () => stopScan();
  }, [startScan, stopScan]);

  // Update map with devices
  useEffect(() => {
    clearItems();
    const labCenter: [number, number] = [48.8566, 2.3522];

    devices.forEach((device, index) => {
      const offset = (index - Math.floor(devices.length / 2)) * 0.0001;
      addItem({
        id: device.id,
        name: device.name,
        type: 'tool',
        position: [labCenter[0] + offset, labCenter[1] + offset],
        status: device.status === 'hot' ? 'available' : device.status === 'warm' ? 'in_use' : 'lost',
        rssi: device.rssi,
        distance: device.distance,
      });
    });
  }, [devices, clearItems, addItem]);

  // Update hot/cold guidance
  useEffect(() => {
    if (selectedDevice) {
      const guidance = hotColdFinder.update(selectedDevice.distance);
      setHotColdGuidance(guidance);

      if (Capacitor.isNativePlatform()) {
        if (selectedDevice.status === 'hot') Haptics.impact({ style: ImpactStyle.Heavy });
        else if (selectedDevice.status === 'warm') Haptics.impact({ style: ImpactStyle.Medium });
        else Haptics.impact({ style: ImpactStyle.Light });
      }
    } else {
      hotColdFinder.reset();
      setHotColdGuidance(null);
    }
  }, [selectedDevice, hotColdFinder]);

  const handleDeviceSelect = useCallback((id: string) => {
    setSelectedDeviceId(prev => prev === id ? null : id);
  }, []);

  const heatmapVisible = layers.find(l => l.id === 'heatmap')?.visible ?? true;

  return (
    <div className="flex flex-col w-full h-screen bg-black text-white">
      {/* MAP - Takes most space */}
      <div className="flex-1 w-full min-h-[180px]">
        <LeafletMap className="h-full w-full" showControls={true} />
        {heatmapVisible && (
          <HeatmapLayer
            devices={devices}
            visible={true}
            labCenter={[48.8566, 2.3522]}
          />
        )}
      </div>

      {/* HOT/COLD SELECTION */}
      {hotColdGuidance && selectedDevice && (
        <div className="flex-none mx-4 mt-2 p-3 rounded-xl" style={{ background: 'rgba(6, 193, 103, 0.15)', border: `1px solid ${hotColdGuidance.color}` }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ProximityIndicator rssi={selectedDevice.smoothedRssi} size="md" animated />
              <div>
                <h2 className="text-sm font-bold text-white">{selectedDevice.name}</h2>
                <p className="text-xs text-white/70">{hotColdGuidance.direction}</p>
                <SignalStrengthBar rssi={selectedDevice.smoothedRssi} className="mt-1" />
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold" style={{ color: hotColdGuidance.color }}>{hotColdGuidance.emoji}</span>
              <p className="text-xs text-white/50">{selectedDevice.distance.toFixed(1)}m</p>
            </div>
          </div>
        </div>
      )}

      {/* SCROLLABLE DEVICE LIST */}
      <div className="w-full overflow-y-auto" style={{ height: '40%', maxHeight: '250px' }}>
        <div className="px-4 py-3 space-y-2">
          
          {/* UNKNOWN DEVICES - Auto-discovery */}
          {unknownDevices.length > 0 && (
            <div className="mb-4">
              <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2">
                🔴 Nouveaux appareils détectés
              </h3>
              <div className="space-y-2">
                {unknownDevices.map(device => (
                  <div
                    key={device.uuid}
                    className="p-3 rounded-xl"
                    style={{ background: 'rgba(255, 100, 100, 0.1)', border: '1px solid rgba(255,100,100,0.3)' }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white font-medium">Nouveau beacon</p>
                        <p className="text-xs text-white/50 font-mono">{device.uuid}</p>
                        <p className="text-xs text-white/40">RSSI: {device.rssi} dBm</p>
                      </div>
                      <button
                        onClick={() => {
                          // Navigate to inventory with pre-filled UUID
                          window.location.href = `/inventory?add=true&uuid=${encodeURIComponent(device.uuid)}`;
                        }}
                        className="px-3 py-2 rounded-lg bg-[#06C167] text-white text-sm font-bold"
                      >
                        + Ajouter
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {devices.length === 0 ? (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-4xl text-white/20">bluetooth_disabled</span>
              <p className="text-sm text-white/50 mt-2">Aucun appareil détecté</p>
            </div>
          ) : (
            devices.map(device => (
              <div
                key={device.id}
                onClick={() => handleDeviceSelect(device.id)}
                className={`p-3 rounded-xl transition-all cursor-pointer ${
                  selectedDeviceId === device.id ? 'ring-2 ring-[#06C167]' : ''
                }`}
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <BLEDeviceCard device={device} compact />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}