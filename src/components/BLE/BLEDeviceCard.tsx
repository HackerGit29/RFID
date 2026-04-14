import { useMemo } from 'react';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { BLEDevice } from '../../types';
import ProximityIndicator from './ProximityIndicator';
import SignalStrengthBar from './SignalStrengthBar';

interface BLEDeviceCardProps {
  device: BLEDevice;
  onClick?: () => void;
  compact?: boolean;
  className?: string;
}

export default function BLEDeviceCard({ 
  device, 
  onClick,
  compact = false,
  className = ''
}: BLEDeviceCardProps) {
  const handleInteraction = async () => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
    onClick?.();
  };

  const timeAgo = useMemo(() => {
    const seconds = Math.floor((Date.now() - device.lastPing) / 1000);
    if (seconds < 5) return 'now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  }, [device.lastPing]);

  if (compact) {
    return (
      <button
        onClick={handleInteraction}
        className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 transition-all w-full text-left"
      >
        <ProximityIndicator rssi={device.smoothedRssi} size="sm" />
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-white truncate">{device.name}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs font-bold" style={{ color: device.smoothedRssi >= -60 ? '#06C167' : device.smoothedRssi >= -80 ? '#FFC107' : '#0071EB' }}>
              {device.distance.toFixed(1)}m
            </span>
            <span className="text-[10px] text-white/50">•</span>
            <span className="text-[10px] text-white/50">{timeAgo}</span>
          </div>
        </div>

        <SignalStrengthBar rssi={device.smoothedRssi} showLabel={false} />
      </button>
    );
  }

  return (
    <button
      onClick={handleInteraction}
      className="flex flex-col gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 transition-all w-full text-left"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: device.smoothedRssi >= -60 ? 'rgba(6, 193, 103, 0.1)' : device.smoothedRssi >= -80 ? 'rgba(255, 193, 7, 0.1)' : 'rgba(0, 113, 235, 0.1)' }}
          >
            <span 
              className="material-symbols-outlined text-2xl"
              style={{ color: device.smoothedRssi >= -60 ? '#06C167' : device.smoothedRssi >= -80 ? '#FFC107' : '#0071EB' }}
            >
              {device.icon}
            </span>
          </div>
          
          <div className="text-left">
            <h3 className="text-sm font-bold text-white leading-tight">{device.name}</h3>
            <p className="text-[10px] text-white/50 mt-0.5">ID: {device.id}</p>
          </div>
        </div>

        <ProximityIndicator rssi={device.smoothedRssi} size="md" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/5 rounded-lg p-2 text-center">
          <p className="text-[9px] text-white/50 uppercase font-bold">Distance</p>
          <p className="text-lg font-bold mt-0.5" style={{ color: device.smoothedRssi >= -60 ? '#06C167' : '#FFFFFF' }}>
            {device.distance.toFixed(1)}m
          </p>
        </div>
        
        <div className="bg-white/5 rounded-lg p-2 text-center">
          <p className="text-[9px] text-white/50 uppercase font-bold">RSSI</p>
          <p className="text-lg font-bold font-mono mt-0.5 text-white">
            {device.rssi}
          </p>
          <p className="text-[8px] text-white/30">dBm</p>
        </div>
        
        <div className="bg-white/5 rounded-lg p-2 text-center">
          <p className="text-[9px] text-white/50 uppercase font-bold">Status</p>
          <p className="text-lg font-bold mt-0.5 capitalize" style={{ color: device.smoothedRssi >= -60 ? '#06C167' : device.smoothedRssi >= -80 ? '#FFC107' : '#0071EB' }}>
            {device.status}
          </p>
        </div>
      </div>

      {/* Signal Strength Bar */}
      <SignalStrengthBar rssi={device.smoothedRssi} />
    </button>
  );
}
