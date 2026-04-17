import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import BottomNav from '../components/BottomNav';
import SearchBar from '../components/SearchBar';
import LeafletMap from '../components/LeafletMap';
import { useMapContext } from '../contexts/MapContext';
import { useBLEScannerContext } from '../contexts/BLEScannerContext';
import { BLEDeviceCard, ProximityIndicator, SignalStrengthBar, HeatmapLayer } from '../components/BLE';
import { HotColdFinder, HotColdGuidance } from '../utils/bleFilters';

function BLERadarContent() {
  const navigate = useNavigate();
  const { addItem, clearItems, items } = useMapContext();
  const { devices, isScanning, startScan, stopScan, error } = useBLEScannerContext();
  
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [hotColdGuidance, setHotColdGuidance] = useState<HotColdGuidance | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(true);
  
  const hotColdFinder = useMemo(() => new HotColdFinder(), []);
  
  const selectedDevice = useMemo(
    () => devices.find(d => d.id === selectedDeviceId) || null,
    [devices, selectedDeviceId]
  );

  // Auto-start scanning on mount
  useEffect(() => {
    startScan();
    return () => stopScan();
  }, [startScan, stopScan]);

  // Update map items when devices change
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
        icon: device.icon,
        metadata: {
          status: device.status,
          distance: `${device.distance.toFixed(1)}m`,
        },
      });
    });
  }, [devices, clearItems, addItem]);

  // Update hot/cold guidance when selected device changes
  useEffect(() => {
    if (selectedDevice) {
      const guidance = hotColdFinder.update(selectedDevice.distance);
      setHotColdGuidance(guidance);
      
      // Haptic feedback based on proximity
      if (Capacitor.isNativePlatform()) {
        if (selectedDevice.status === 'hot') {
          Haptics.impact({ style: ImpactStyle.Heavy });
        } else if (selectedDevice.status === 'warm') {
          Haptics.impact({ style: ImpactStyle.Medium });
        } else {
          Haptics.impact({ style: ImpactStyle.Light });
        }
      }
    } else {
      hotColdFinder.reset();
      setHotColdGuidance(null);
    }
  }, [selectedDevice, hotColdFinder]);

  const handleDeviceSelect = useCallback(async (deviceId: string) => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
    setSelectedDeviceId(prev => prev === deviceId ? null : deviceId);
  }, []);

  const handleCalibration = useCallback(async () => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
    navigate('/radar/calibration');
  }, [navigate]);

  const handleHeatmapToggle = useCallback(async () => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
    setShowHeatmap(prev => !prev);
  }, []);

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-black text-white">
      {/* MAP LAYER - Full Screen */}
      <div className="absolute inset-0">
        <LeafletMap className="h-full w-full" showControls={true} />
        <HeatmapLayer
          devices={devices}
          visible={showHeatmap}
          labCenter={[48.8566, 2.3522]}
        />
      </div>

      {/* TOP HUD - Overlay */}
      <div className="fixed top-0 left-0 right-0 z-20 p-4 flex flex-col gap-3 pointer-events-none">
        {/* Status Header */}
        <div className="flex items-center justify-between glass-header p-3 px-4 rounded-xl pointer-events-auto">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-lg bg-[#06C167] text-black">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>
                bluetooth
              </span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight">Radar BLE</h1>
              <span className="text-[10px] font-bold text-[#06C167] uppercase tracking-wider">
                {isScanning ? `${devices.length} devices` : 'Paused'}
              </span>
            </div>
          </div>
          
          <button
            onClick={() => isScanning ? stopScan() : startScan()}
            className={`w-12 h-6 rounded-full relative transition-colors ${
              isScanning ? 'bg-[#06C167]' : 'bg-white/20'
            }`}
          >
            <div
              className={`absolute top-1 size-4 bg-white rounded-full transition-transform ${
                isScanning ? 'right-1' : 'left-1'
              }`}
            />
          </button>
        </div>

        {/* Hot/Cold Guidance HUD */}
        {hotColdGuidance && selectedDevice && (
          <div
            className="glass-header p-4 rounded-xl pointer-events-auto border-l-4"
            style={{ borderColor: hotColdGuidance.color }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ProximityIndicator rssi={selectedDevice.smoothedRssi} size="md" animated />
                <div className="text-left">
                  <h2 className="text-sm font-bold text-white">{selectedDevice.name}</h2>
                  <p className="text-xs text-white/70 mt-0.5">{hotColdGuidance.direction}</p>
                  <SignalStrengthBar rssi={selectedDevice.smoothedRssi} className="mt-2" />
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-2xl font-bold" style={{ color: hotColdGuidance.color }}>
                  {hotColdGuidance.emoji} {hotColdGuidance.status}
                </p>
                <p className="text-lg font-bold text-white mt-0.5">
                  {selectedDevice.distance.toFixed(1)}m
                </p>
                <p className="text-[10px] text-white/50">
                  {(hotColdGuidance.confidence * 100).toFixed(0)}% confidence
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search Bar & Heatmap Toggle */}
        <div className="flex gap-2 pointer-events-auto">
          <SearchBar placeholder="Search tool..." />
          <button
            onClick={handleHeatmapToggle}
            className={`flex items-center gap-1.5 px-3 rounded-xl border transition-all active:scale-95 ${
              showHeatmap
                ? 'bg-[#06C167]/20 border-[#06C167]/40 text-[#06C167]'
                : 'bg-white/5 border-white/10 text-white/40'
            }`}
          >
            <span className="material-symbols-outlined text-sm">
              {showHeatmap ? 'heatmap' : 'heatmap_off'}
            </span>
          </button>
        </div>
      </div>

      {/* BOTTOM SHEET - Device List */}
      <div className="absolute bottom-0 left-0 right-0 z-30 bg-black/90 backdrop-blur-3xl rounded-t-3xl border-t border-white/10 pb-8 shadow-uber-xl">
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-3">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        <div className="px-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Detected Devices</h2>
              <p className="text-xs text-white/60">
                {devices.length} device{devices.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Calibration Button */}
              <button
                onClick={handleCalibration}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-lg hover:bg-white/20 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-sm text-[#06C167]">tune</span>
                <span className="text-xs font-bold text-[#06C167]">Calibrate</span>
              </button>
              
              {selectedDevice && (
                <div className="bg-[#06C167] px-3 py-1 rounded-lg">
                  <span className="text-xs font-bold text-black">
                    Tracking: {selectedDevice.name}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Device List */}
          <div className="space-y-2 max-h-64 overflow-y-auto no-scrollbar">
            {devices.length === 0 ? (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-4xl text-white/30 mb-2">
                  bluetooth_disabled
                </span>
                <p className="text-sm text-white/50">
                  {isScanning ? 'Scanning for devices...' : 'Scan paused'}
                </p>
              </div>
            ) : (
              devices.map(device => (
                <div
                  key={device.id}
                  onClick={() => handleDeviceSelect(device.id)}
                  className={`transition-all ${
                    selectedDeviceId === device.id
                      ? 'ring-2 ring-[#06C167] scale-[1.02]'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <BLEDeviceCard
                    device={device}
                    compact={true}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab="radar" />
    </div>
  );
}

export default function BLERadar() {
  return <BLERadarContent />;
}
