import { useState, useEffect, useCallback, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useBLEScannerContext } from '../contexts/BLEScannerContext';
import {
  CalibrationMeasurement,
  calculateAverageRSSI,
  calculateStdDeviation,
  createCalibrationProfile,
  saveCalibration,
  CALIBRATION_DISTANCES,
  RECOMMENDED_SAMPLES,
  ENVIRONMENT_PRESETS,
} from '../utils/bleCalibration';
import { BLEDevice } from '../types';
import SignalStrengthBar from '../components/BLE/SignalStrengthBar';
import ProximityIndicator from '../components/BLE/ProximityIndicator';

type CalibrationStep = 'select-device' | 'choose-environment' | 'measuring' | 'complete';

export default function RSSICalibration() {
  const { devices, isScanning, startScan, stopScan } = useBLEScannerContext();
  
  const [step, setStep] = useState<CalibrationStep>('select-device');
  const [selectedDevice, setSelectedDevice] = useState<BLEDevice | null>(null);
  const [environment, setEnvironment] = useState<keyof typeof ENVIRONMENT_PRESETS>('Indoor Office');
  const [currentDistanceIndex, setCurrentDistanceIndex] = useState(0);
  const [measurements, setMeasurements] = useState<CalibrationMeasurement[]>([]);
  const [currentSamples, setCurrentSamples] = useState<number[]>([]);
  const [isCollecting, setIsCollecting] = useState(false);
  
  const collectionInterval = useRef<number | null>(null);

  const currentDistance = CALIBRATION_DISTANCES[currentDistanceIndex];
  const progress = ((measurements.length) / CALIBRATION_DISTANCES.length) * 100;

  // Auto-start scanning
  useEffect(() => {
    startScan();
    return () => {
      stopScan();
      if (collectionInterval.current) {
        clearInterval(collectionInterval.current);
      }
    };
  }, [startScan, stopScan]);

  // Collection logic
  const startCollection = useCallback(() => {
    if (!selectedDevice) return;
    
    setIsCollecting(true);
    setCurrentSamples([]);

    collectionInterval.current = window.setInterval(() => {
      if (!selectedDevice) return;

      setCurrentSamples(prev => {
        const newSamples = [...prev, selectedDevice.rssi];
        
        if (newSamples.length >= RECOMMENDED_SAMPLES) {
          // Auto-complete this distance
          if (collectionInterval.current) {
            clearInterval(collectionInterval.current);
          }
          setIsCollecting(false);
          completeDistance(newSamples);
          return newSamples;
        }
        
        return newSamples;
      });
    }, 500);
  }, [selectedDevice]);

  const stopCollection = useCallback(() => {
    if (collectionInterval.current) {
      clearInterval(collectionInterval.current);
      collectionInterval.current = null;
    }
    setIsCollecting(false);
  }, []);

  const completeDistance = useCallback((samples: number[]) => {
    if (!selectedDevice) return;

    const measurement: CalibrationMeasurement = {
      distance: currentDistance,
      rssiValues: samples,
      averageRSSI: calculateAverageRSSI(samples),
      stdDeviation: calculateStdDeviation(samples),
      sampleCount: samples.length,
    };

    setMeasurements(prev => [...prev, measurement]);
    setCurrentSamples([]);

    // Haptic feedback
    if (Capacitor.isNativePlatform()) {
      Haptics.impact({ style: ImpactStyle.Medium });
    }

    // Move to next distance or complete
    if (currentDistanceIndex < CALIBRATION_DISTANCES.length - 1) {
      setCurrentDistanceIndex(prev => prev + 1);
    } else {
      // Calibration complete
      const profile = createCalibrationProfile(
        [...measurements, measurement],
        environment
      );
      saveCalibration(profile);
      setStep('complete');
    }
  }, [selectedDevice, currentDistance, currentDistanceIndex, measurements, environment]);

  const handleDeviceSelect = async (device: BLEDevice) => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
    setSelectedDevice(device);
  };

  const handleEnvironmentSelect = async (env: keyof typeof ENVIRONMENT_PRESETS) => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
    setEnvironment(env);
    setStep('measuring');
  };

  const resetCalibration = () => {
    setStep('select-device');
    setSelectedDevice(null);
    setMeasurements([]);
    setCurrentSamples([]);
    setCurrentDistanceIndex(0);
    setIsCollecting(false);
  };

  // Step 1: Select Device
  if (step === 'select-device') {
    return (
      <div className="flex flex-col h-screen bg-black text-white">
        {/* Header */}
        <div className="glass-header p-4">
          <h1 className="text-lg font-bold">Select Beacon</h1>
          <p className="text-xs text-white/60 mt-1">Choose the BLE device to calibrate</p>
        </div>

        {/* Device List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {devices.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-4xl text-white/30 mb-2">
                bluetooth_disabled
              </span>
              <p className="text-sm text-white/50">No devices found. Turn on a beacon.</p>
            </div>
          ) : (
            devices.map(device => (
              <button
                key={device.id}
                onClick={() => handleDeviceSelect(device)}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 transition-all text-left"
              >
                <div className="size-12 rounded-lg bg-[#06C167]/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#06C167]">bluetooth</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold">{device.name}</h3>
                  <p className="text-xs text-white/50 mt-0.5">{device.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-[#06C167]">{device.rssi}</p>
                  <p className="text-[10px] text-white/50">dBm</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    );
  }

  // Step 2: Choose Environment
  if (step === 'choose-environment') {
    return (
      <div className="flex flex-col h-screen bg-black text-white">
        <div className="glass-header p-4">
          <h1 className="text-lg font-bold">Environment Type</h1>
          <p className="text-xs text-white/60 mt-1">Select the calibration environment</p>
        </div>

        <div className="flex-1 p-4 space-y-3">
          {Object.entries(ENVIRONMENT_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => handleEnvironmentSelect(key as keyof typeof ENVIRONMENT_PRESETS)}
              className="w-full p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 transition-all text-left"
            >
              <h3 className="text-sm font-bold">{key}</h3>
              <p className="text-xs text-white/60 mt-1">{preset.description}</p>
              <p className="text-xs text-[#06C167] mt-2 font-mono">
                Typical n = {preset.n}
              </p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Step 3: Measuring (Main Calibration Screen)
  if (step === 'measuring') {
    const avgRSSI = currentSamples.length > 0 ? calculateAverageRSSI(currentSamples) : 0;
    const stdDev = currentSamples.length > 0 ? calculateStdDeviation(currentSamples) : 0;

    return (
      <div className="flex flex-col h-screen bg-black text-white">
        {/* Progress Header */}
        <div className="glass-header p-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg font-bold">Calibration</h1>
            <span className="text-xs text-[#06C167] font-bold">
              {measurements.length}/{CALIBRATION_DISTANCES.length}
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#06C167] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6">
          {/* Distance Indicator */}
          <div className="text-center space-y-2">
            <p className="text-sm text-white/60">Place beacon at</p>
            <p className="text-6xl font-bold text-[#06C167]">{currentDistance}m</p>
            <p className="text-xs text-white/40">
              {currentDistance === 1 ? 'Exactly 1 meter' : 
               currentDistance === 2 ? '2 meters away' :
               currentDistance === 3 ? '3 meters away' : '5 meters away'}
            </p>
          </div>

          {/* Live Signal Indicator */}
          {selectedDevice && (
            <>
              <ProximityIndicator rssi={selectedDevice.rssi} size="lg" animated={isCollecting} />
              
              <div className="w-full bg-white/5 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/60">Device</span>
                  <span className="text-sm font-bold">{selectedDevice.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/60">Current RSSI</span>
                  <span className="text-sm font-mono font-bold">{selectedDevice.rssi} dBm</span>
                </div>
                <SignalStrengthBar rssi={selectedDevice.rssi} />
              </div>
            </>
          )}

          {/* Collection Stats */}
          {currentSamples.length > 0 && (
            <div className="w-full bg-white/5 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/60">Samples</span>
                <span className="text-sm font-bold">{currentSamples.length}/{RECOMMENDED_SAMPLES}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/60">Average</span>
                <span className="text-sm font-mono font-bold">{avgRSSI.toFixed(1)} dBm</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/60">Std Dev</span>
                <span className="text-sm font-mono">{stdDev.toFixed(2)} dB</span>
              </div>
              
              {/* Sample Progress */}
              <div className="flex gap-0.5 mt-2">
                {Array.from({ length: RECOMMENDED_SAMPLES }).map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-1 rounded-full transition-all ${
                      i < currentSamples.length ? 'bg-[#06C167]' : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-4 space-y-2">
          {!isCollecting ? (
            <button
              onClick={() => {
                startCollection();
                if (Capacitor.isNativePlatform()) {
                  Haptics.impact({ style: ImpactStyle.Medium });
                }
              }}
              className="w-full py-4 bg-[#06C167] text-black font-bold rounded-xl active:scale-95 transition-all"
            >
              Start Collection
            </button>
          ) : (
            <button
              onClick={() => {
                stopCollection();
                completeDistance(currentSamples);
              }}
              className="w-full py-4 bg-white/10 text-white font-bold rounded-xl active:scale-95 transition-all border border-white/20"
            >
              Complete Early ({currentSamples.length} samples)
            </button>
          )}
          
          <button
            onClick={resetCalibration}
            className="w-full py-3 text-white/60 text-sm active:scale-95 transition-all"
          >
            Cancel Calibration
          </button>
        </div>
      </div>
    );
  }

  // Step 4: Complete
  if (step === 'complete') {
    const profile = createCalibrationProfile(measurements, environment);

    return (
      <div className="flex flex-col h-screen bg-black text-white">
        {/* Success Header */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6 text-center">
          <div className="size-20 rounded-full bg-[#06C167]/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-[#06C167]">
              check_circle
            </span>
          </div>
          
          <div>
            <h1 className="text-2xl font-bold mb-2">Calibration Complete!</h1>
            <p className="text-sm text-white/60">Your beacon is now calibrated</p>
          </div>

          {/* Results */}
          <div className="w-full bg-white/5 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">RSSI at 1m</span>
              <span className="text-lg font-bold font-mono text-[#06C167]">
                {profile.rssiAt1m.toFixed(1)} dBm
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Path Loss Exponent</span>
              <span className="text-lg font-bold font-mono text-[#06C167]">
                {profile.pathLossExponent.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Environment</span>
              <span className="text-sm font-bold">{environment}</span>
            </div>
            
            <div className="pt-4 border-t border-white/10">
              <p className="text-xs text-white/40 mb-2">Measurements</p>
              {measurements.map((m, i) => (
                <div key={i} className="flex items-center justify-between py-1">
                  <span className="text-xs text-white/60">{m.distance}m</span>
                  <span className="text-xs font-mono">{m.averageRSSI.toFixed(1)} dBm</span>
                  <span className="text-xs text-white/30">±{m.stdDeviation.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 space-y-2">
          <button
            onClick={() => {
              // Navigate back to radar (handled by parent router)
              window.history.back();
            }}
            className="w-full py-4 bg-[#06C167] text-black font-bold rounded-xl active:scale-95 transition-all"
          >
            Back to Radar
          </button>
          
          <button
            onClick={resetCalibration}
            className="w-full py-3 bg-white/10 text-white font-bold rounded-xl active:scale-95 transition-all border border-white/20"
          >
            Calibrate Another
          </button>
        </div>
      </div>
    );
  }

  return null;
}
