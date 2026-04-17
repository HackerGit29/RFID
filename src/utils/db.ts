/**
 * IndexedDB Database Wrapper
 * Native, zero-dependency storage pour Capacitor/WebView
 */

const DB_NAME = 'ToolTracker';
const DB_VERSION = 1;

export interface Tool {
  id: string;
  name: string;
  category: string;
  serial_number: string;
  rfid_enabled: number;
  ble_enabled: number;
  status: string;
  price: number;
  created_at: string;
  updated_at: string;
}

export interface Detection {
  id?: number;
  tool_id: string;
  lat: number;
  lng: number;
  rssi: number;
  detected_at: string;
}

export interface Movement {
  id?: number;
  tool_id: string;
  type: 'check_in' | 'check_out';
  user_id: string;
  location: string;
  timestamp: string;
}

let db: IDBDatabase | null = null;

/**
 * Open IndexedDB connection
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // Tools store
      if (!database.objectStoreNames.contains('tools')) {
        const toolStore = database.createObjectStore('tools', { keyPath: 'id' });
        toolStore.createIndex('name', 'name', { unique: false });
        toolStore.createIndex('category', 'category', { unique: false });
        toolStore.createIndex('serial_number', 'serial_number', { unique: false });
      }

      // Detections store
      if (!database.objectStoreNames.contains('detections')) {
        const detectionStore = database.createObjectStore('detections', { keyPath: 'id', autoIncrement: true });
        detectionStore.createIndex('tool_id', 'tool_id', { unique: false });
      }

      // Movements store
      if (!database.objectStoreNames.contains('movements')) {
        const movementStore = database.createObjectStore('movements', { keyPath: 'id', autoIncrement: true });
        movementStore.createIndex('tool_id', 'tool_id', { unique: false });
        movementStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

/**
 * Get all tools
 */
export async function getAllTools(): Promise<Tool[]> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('tools', 'readonly');
    const store = transaction.objectStore('tools');
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get tool by ID
 */
export async function getToolById(id: string): Promise<Tool | null> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('tools', 'readonly');
    const store = transaction.objectStore('tools');
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Add new tool
 */
export async function addTool(tool: Omit<Tool, 'created_at' | 'updated_at'>): Promise<void> {
  const database = await openDB();
  const now = new Date().toISOString();
  const newTool: Tool = {
    ...tool,
    created_at: now,
    updated_at: now,
  };

  return new Promise((resolve, reject) => {
    const transaction = database.transaction('tools', 'readwrite');
    const store = transaction.objectStore('tools');
    const request = store.add(newTool);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Update tool
 */
export async function updateTool(id: string, data: Partial<Tool>): Promise<void> {
  const database = await openDB();
  const tool = await getToolById(id);

  if (!tool) {
    throw new Error(`Tool ${id} not found`);
  }

  const updatedTool: Tool = {
    ...tool,
    ...data,
    updated_at: new Date().toISOString(),
  };

  return new Promise((resolve, reject) => {
    const transaction = database.transaction('tools', 'readwrite');
    const store = transaction.objectStore('tools');
    const request = store.put(updatedTool);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Delete tool
 */
export async function deleteTool(id: string): Promise<void> {
  const database = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['tools', 'detections', 'movements'], 'readwrite');
    
    transaction.objectStore('tools').delete(id);
    transaction.objectStore('detections').delete(id);
    transaction.objectStore('movements').delete(id);

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

/**
 * Add detection
 */
export async function addDetection(toolId: string, lat: number, lng: number, rssi: number): Promise<void> {
  const database = await openDB();
  const detection: Detection = {
    tool_id: toolId,
    lat,
    lng,
    rssi,
    detected_at: new Date().toISOString(),
  };

  return new Promise((resolve, reject) => {
    const transaction = database.transaction('detections', 'readwrite');
    const store = transaction.objectStore('detections');
    const request = store.add(detection);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get detections for tool
 */
export async function getDetections(toolId: string, limit = 100): Promise<Detection[]> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('detections', 'readonly');
    const store = transaction.objectStore('detections');
    const index = store.index('tool_id');
    const request = index.getAll(toolId);

    request.onsuccess = () => {
      const results = request.result || [];
      resolve(results.slice(-limit));
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Add movement
 */
export async function addMovement(
  toolId: string,
  type: 'check_in' | 'check_out',
  userId: string,
  location: string
): Promise<void> {
  const database = await openDB();
  const movement: Movement = {
    tool_id: toolId,
    type,
    user_id: userId,
    location,
    timestamp: new Date().toISOString(),
  };

  return new Promise((resolve, reject) => {
    const transaction = database.transaction('movements', 'readwrite');
    const store = transaction.objectStore('movements');
    const request = store.add(movement);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get movements for tool
 */
export async function getMovements(toolId: string, limit = 50): Promise<Movement[]> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('movements', 'readonly');
    const store = transaction.objectStore('movements');
    const index = store.index('tool_id');
    const request = index.getAll(toolId);

    request.onsuccess = () => {
      const results = request.result || [];
      // Sort by timestamp desc
      results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      resolve(results.slice(0, limit));
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Init database (no-op for IndexedDB)
 */
export async function initDatabase(): Promise<void> {
  await openDB();
}