// Types pour ToolTracker Pro

export interface Tool {
  id: string;
  name: string;
  category: string;
  serialNumber: string;
  rfidEnabled: boolean;
  bleEnabled: boolean;
  status: 'available' | 'in_use' | 'maintenance' | 'lost';
  state: 'authorized' | 'locked'; // RFID security state
  assignedTo?: string;
  location?: string;
  price: number;
  lastSeen?: string;
}

export interface Movement {
  id: string;
  toolId: string;
  toolName: string;
  toolIcon: string;
  type: 'RFID_OUT' | 'RFID_IN' | 'BLE_DETECTED' | 'BLE_LOST';
  checkpointId?: string; // ID of the RFID portal
  authorized: boolean;   // Whether the movement was authorized by the system
  user?: string;
  location?: string;
  timestamp: string;
  status: 'active' | 'stable' | 'lost';
}

export interface StatCard {
  label: string;
  value: number | string;
  trend?: number;
  trendLabel?: string;
  icon: string;
  color: string;
}

export interface BLEDevice {
  id: string;
  name: string;
  distance: number;
  rssi: number;
  smoothedRssi: number; // Filtered signal for radar stability
  status: 'hot' | 'warm' | 'cold' | 'lost';
  icon: string;
  lastPing: number; // Timestamp of last detection
}

export type ScreenName = 
  | 'splash'
  | 'home'
  | 'inventory'
  | 'tool-detail'
  | 'ble-radar'
  | 'alerts'
  | 'profile';
