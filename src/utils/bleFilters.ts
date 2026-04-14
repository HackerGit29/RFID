/**
 * BLE Signal Processing Utilities
 * Implementation of RSSI filtering and distance estimation for Industrial environments.
 */

export const BLE_CONFIG = {
  // Path loss exponent for industrial environments (metal, walls)
  // Typical values: 2.0 (Open Space) to 4.0 (Heavy Obstructions)
  PATH_LOSS_EXPONENT: 3.0,
  // RSSI value at 1 meter distance (measured for typical beacons)
  RSSI_AT_1M: -59,
  // Time-to-Live threshold for considering a device "lost" (5 minutes)
  TTL_THRESHOLD: 300000,
  // Kalman Filter Constants
  KALMAN_PROCESS_NOISE: 0.1,    // Q: How much we expect the state to drift
  KALMAN_MEASUREMENT_NOISE: 2.0, // R: Expected noise in the RSSI reading
};

/**
 * 1D Kalman Filter for RSSI Smoothing
 * Provides a statistically optimal estimate of the true signal strength.
 */
export class KalmanFilter {
  private x: number; // Estimated state
  private p: number; // Estimation error covariance
  private q: number; // Process noise covariance
  private r: number; // Measurement noise covariance

  constructor(initialRssi: number = -70) {
    this.x = initialRssi;
    this.p = 1.0;
    this.q = BLE_CONFIG.KALMAN_PROCESS_NOISE;
    this.r = BLE_CONFIG.KALMAN_MEASUREMENT_NOISE;
  }

  /**
   * Update the filter with a new measurement and return the smoothed value.
   */
  update(measurement: number): number {
    // Prediction phase
    this.p = this.p + this.q;

    // Update phase
    const k = this.p / (this.p + this.r); // Kalman Gain
    this.x = this.x + k * (measurement - this.x);
    this.p = (1 - k) * this.p;

    return this.x;
  }

  getState() {
    return this.x;
  }
}

/**
 * Weighted Moving Average (WMA) for RSSI smoothing
 * Kept for fallback or comparison.
 */
export function smoothRSSI(currentRssi: number, previousRssi: number): number {
  const SMOOTHING_FACTOR = 0.3;
  if (previousRssi === 0) return currentRssi;
  return (SMOOTHING_FACTOR * currentRssi) + ((1 - SMOOTHING_FACTOR) * previousRssi);
}

/**
 * Convert RSSI to distance in meters using the Log-Distance Path Loss Model
 */
export function rssiToDistance(rssi: number): number {
  const { RSSI_AT_1M, PATH_LOSS_EXPONENT } = BLE_CONFIG;
  return Math.pow(10, ((RSSI_AT_1M - rssi) / (10 * PATH_LOSS_EXPONENT)));
}

/**
 * Map signal strength to Hot/Warm/Cold categories
 */
export function getSignalStatus(rssi: number): 'hot' | 'warm' | 'cold' | 'lost' {
  if (rssi >= -60) return 'hot';     // <<  3m
  if (rssi >= -80) return 'warm';    // 3m - 10m
  return 'cold';                     // > 10m
}

/**
 * Calculate signal intensity percentage for UI animations (0% to 100%)
 */
export function getSignalIntensity(rssi: number): number {
  const min = -100;
  const max = -40;
  const intensity = ((rssi - min) / (max - min)) * 100;
  return Math.max(0, Math.min(100, intensity));
}

/**
 * Hot/Cold Guidance Algorithm
 * Compares current distance with previous distance to provide directional feedback
 */
export interface HotColdGuidance {
  status: 'HOT' | 'WARM' | 'COLD';
  direction: string;
  confidence: number;
  emoji: string;
  color: string;
}

export class HotColdFinder {
  private previousDistance: number | null = null;
  private distanceHistory: number[] = [];
  private readonly HISTORY_SIZE = 5;

  /**
   * Update with new distance and get hot/cold guidance
   */
  update(currentDistance: number): HotColdGuidance {
    // Add to history
    this.distanceHistory.push(currentDistance);
    if (this.distanceHistory.length > this.HISTORY_SIZE) {
      this.distanceHistory.shift();
    }

    // Calculate trend (are we getting closer or farther?)
    let trend = 0;
    if (this.distanceHistory.length >= 2) {
      const recent = this.distanceHistory[this.distanceHistory.length - 1];
      const previous = this.distanceHistory[this.distanceHistory.length - 2];
      trend = previous - recent; // Positive = getting closer, Negative = getting farther
    }

    // Determine status based on distance AND trend
    let status: 'HOT' | 'WARM' | 'COLD';
    let direction: string;
    let emoji: string;
    let color: string;

    if (currentDistance < 2) {
      status = 'HOT';
      emoji = '🔥';
      color = '#06C167';
      direction = 'You\'re very close!';
    } else if (currentDistance < 5) {
      status = 'WARM';
      emoji = '🌤️';
      color = '#FFC107';
      direction = trend > 0.3 ? 'Keep going, getting closer!' : 
                  trend < -0.3 ? 'You\'re moving away' :
                  'Search around you';
    } else {
      status = 'COLD';
      emoji = '❄️';
      color = '#0071EB';
      direction = trend > 0.5 ? 'Good direction, keep going!' : 
                  trend < -0.5 ? 'Wrong direction, turn around' :
                  'Start searching';
    }

    // Confidence based on history size and consistency
    const confidence = Math.min(1, this.distanceHistory.length / this.HISTORY_SIZE);

    this.previousDistance = currentDistance;

    return {
      status,
      direction,
      confidence,
      emoji,
      color,
    };
  }

  /**
   * Reset the finder
   */
  reset() {
    this.previousDistance = null;
    this.distanceHistory = [];
  }
}

/**
 * Calculate bearing (direction) between two points in degrees
 */
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const y = Math.sin(dLon) * Math.cos(lat2 * Math.PI / 180);
  const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
            Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLon);
  const bearing = Math.atan2(y, x) * 180 / Math.PI;
  return (bearing + 360) % 360;
}

/**
 * Convert bearing to cardinal direction
 */
export function bearingToCardinal(bearing: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(bearing / 45) % 8;
  return directions[index];
}
