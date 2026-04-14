/**
 * BLE RSSI Calibration Utilities
 * 
 * Provides tools to calibrate RSSI-to-distance conversion for specific environments.
 * Calibration data is persisted in localStorage for reuse across sessions.
 */

export interface CalibrationMeasurement {
  distance: number; // meters
  rssiValues: number[];
  averageRSSI: number;
  stdDeviation: number;
  sampleCount: number;
}

export interface CalibrationProfile {
  id: string;
  name: string;
  createdAt: number;
  rssiAt1m: number;
  pathLossExponent: number;
  measurements: CalibrationMeasurement[];
  environment: string;
}

const CALIBRATION_STORAGE_KEY = 'ble_rssi_calibration';

/**
 * Load saved calibration profile from localStorage
 */
export function loadCalibration(): CalibrationProfile | null {
  try {
    const data = localStorage.getItem(CALIBRATION_STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data) as CalibrationProfile;
  } catch {
    return null;
  }
}

/**
 * Save calibration profile to localStorage
 */
export function saveCalibration(profile: CalibrationProfile): void {
  try {
    localStorage.setItem(CALIBRATION_STORAGE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error('Failed to save calibration:', error);
  }
}

/**
 * Clear saved calibration profile
 */
export function clearCalibration(): void {
  try {
    localStorage.removeItem(CALIBRATION_STORAGE_KEY);
  } catch {
    // Ignore
  }
}

/**
 * Calculate average RSSI from a set of measurements
 */
export function calculateAverageRSSI(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Calculate standard deviation of RSSI measurements
 */
export function calculateStdDeviation(values: number[]): number {
  const avg = calculateAverageRSSI(values);
  const squaredDiffs = values.map(v => Math.pow(v - avg, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  return Math.sqrt(variance);
}

/**
 * Calculate path loss exponent from calibration measurements
 * Uses the log-distance path loss model:
 * RSSI(d) = RSSI(d0) - 10 * n * log10(d/d0)
 * 
 * Where:
 * - RSSI(d) = RSSI at distance d
 * - RSSI(d0) = RSSI at reference distance (1m)
 * - n = path loss exponent
 * - d0 = reference distance (1m)
 */
export function calculatePathLossExponent(measurements: CalibrationMeasurement[]): number {
  if (measurements.length < 2) return 2.0; // Default for free space
  
  const referenceMeasurement = measurements.find(m => m.distance === 1);
  if (!referenceMeasurement) return 2.0;
  
  const rssiAt1m = referenceMeasurement.averageRSSI;
  
  // Calculate n for each measurement and average
  const nValues = measurements
    .filter(m => m.distance > 1)
    .map(m => {
      const rssi = m.averageRSSI;
      const distance = m.distance;
      
      // n = (RSSI(d0) - RSSI(d)) / (10 * log10(d/d0))
      const n = (rssiAt1m - rssi) / (10 * Math.log10(distance));
      
      return n;
    });
  
  if (nValues.length === 0) return 2.0;
  
  const avgN = nValues.reduce((sum, val) => sum + val, 0) / nValues.length;
  
  // Clamp to reasonable range (2.0-4.0 for indoor environments)
  return Math.max(2.0, Math.min(4.0, avgN));
}

/**
 * Create a new calibration profile from measurements
 */
export function createCalibrationProfile(
  measurements: CalibrationMeasurement[],
  environment: string = 'Indoor Office'
): CalibrationProfile {
  const pathLossExponent = calculatePathLossExponent(measurements);
  const rssiAt1m = measurements.find(m => m.distance === 1)?.averageRSSI ?? -59;
  
  return {
    id: `cal_${Date.now()}`,
    name: `${environment} - ${new Date().toLocaleDateString()}`,
    createdAt: Date.now(),
    rssiAt1m,
    pathLossExponent,
    measurements,
    environment,
  };
}

/**
 * Standard calibration distances (in meters)
 */
export const CALIBRATION_DISTANCES = [1, 2, 3, 5];

/**
 * Recommended sample count per distance
 */
export const RECOMMENDED_SAMPLES = 20;

/**
 * Environment presets with typical path loss exponents
 */
export const ENVIRONMENT_PRESETS = {
  'Open Space': { n: 2.0, description: 'Large open areas, minimal obstacles' },
  'Indoor Office': { n: 2.5, description: 'Typical office with desks and walls' },
  'Industrial': { n: 3.0, description: 'Factory/warehouse with metal structures' },
  'Heavy Obstacles': { n: 4.0, description: 'Dense environment with many walls/metal' },
} as const;
