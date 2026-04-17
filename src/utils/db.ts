/**
 * SQLite Database Wrapper (sql.js WASM)
 * Lightweight, zero-dependency SQLite pour Android WebView
 */

import initSqlJs, { Database, SqlJsStatic } from 'sql.js';

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
  id: number;
  tool_id: string;
  lat: number;
  lng: number;
  rssi: number;
  detected_at: string;
}

export interface Movement {
  id: number;
  tool_id: string;
  type: 'check_in' | 'check_out';
  user_id: string;
  location: string;
  timestamp: string;
}

// Lazy-load SQLite WASM
let SQL: SqlJsStatic | null = null;
let db: Database | null = null;

/**
 * Initialize database - charge WASM et crée les tables
 */
export async function initDatabase(): Promise<void> {
  if (db) return;

  try {
    // Charge sql.js WASM
    SQL = await initSqlJs({
      locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
    });

    // Ouvre ou crée la base
    const saved = localStorage.getItem('tooltracker_db');
    if (saved) {
      const data = Uint8Array.from(atob(saved), c => c.charCodeAt(0));
      db = new SQL.Database(data);
    } else {
      db = new SQL.Database();
    }

    // Crée les tables si她们 n'existent pas
    db.run(`
      CREATE TABLE IF NOT EXISTS tools (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT DEFAULT '',
        serial_number TEXT UNIQUE,
        rfid_enabled INTEGER DEFAULT 0,
        ble_enabled INTEGER DEFAULT 0,
        status TEXT DEFAULT 'available',
        price REAL DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS detections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tool_id TEXT REFERENCES tools(id),
        lat REAL,
        lng REAL,
        rssi INTEGER,
        detected_at TEXT DEFAULT (datetime('now'))
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS movements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tool_id TEXT REFERENCES tools(id),
        type TEXT CHECK(type IN ('check_in','check_out')),
        user_id TEXT,
        location TEXT,
        timestamp TEXT DEFAULT (datetime('now'))
      )
    `);

    saveDatabase();
  } catch (err) {
    console.error('[DB] Init failed:', err);
    throw err;
  }
}

/**
 * Sauvegarde la base dans localStorage
 */
function saveDatabase(): void {
  if (!db) return;
  const data = db.export();
  const base64 = btoa(String.fromCharCode(...data));
  localStorage.setItem('tooltracker_db', base64);
}

/**
 * Récupère tous les outils
 */
export async function getAllTools(): Promise<Tool[]> {
  await initDatabase();
  const result = db!.exec('SELECT * FROM tools ORDER BY name');
  if (!result.length) return [];

  const cols = result[0].columns;
  return result[0].values.map(row => {
    const tool: Record<string, unknown> = {};
    cols.forEach((col, i) => tool[col] = row[i]);
    return tool as unknown as Tool;
  });
}

/**
 * Récupère un outil par ID
 */
export async function getToolById(id: string): Promise<Tool | null> {
  await initDatabase();
  const stmt = db!.prepare('SELECT * FROM tools WHERE id = ?');
  stmt.bind([id]);
  if (!stmt.step()) return null;

  const row = stmt.getAsObject();
  stmt.free();
  return row as unknown as Tool;
}

/**
 * Ajoute un nouvel outil
 */
export async function addTool(tool: Omit<Tool, 'created_at' | 'updated_at'>): Promise<void> {
  await initDatabase();
  db!.run(
    `INSERT INTO tools (id, name, category, serial_number, rfid_enabled, ble_enabled, status, price)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [tool.id, tool.name, tool.category, tool.serial_number, tool.rfid_enabled, tool.ble_enabled, tool.status, tool.price]
  );
  saveDatabase();
}

/**
 * Met à jour un outil
 */
export async function updateTool(id: string, data: Partial<Tool>): Promise<void> {
  await initDatabase();
  const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
  const values = Object.values(data);
  db!.run(`UPDATE tools SET ${fields}, updated_at = datetime('now') WHERE id = ?`, [...values, id]);
  saveDatabase();
}

/**
 * Supprime un outil
 */
export async function deleteTool(id: string): Promise<void> {
  await initDatabase();
  db!.run('DELETE FROM tools WHERE id = ?', [id]);
  db!.run('DELETE FROM detections WHERE tool_id = ?', [id]);
  db!.run('DELETE FROM movements WHERE tool_id = ?', [id]);
  saveDatabase();
}

/**
 * Ajoute une détection de position
 */
export async function addDetection(toolId: string, lat: number, lng: number, rssi: number): Promise<void> {
  await initDatabase();
  db!.run(
    'INSERT INTO detections (tool_id, lat, lng, rssi) VALUES (?, ?, ?, ?)',
    [toolId, lat, lng, rssi]
  );
  saveDatabase();
}

/**
 * Récupère l'historique de détection
 */
export async function getDetections(toolId: string, limit = 100): Promise<Detection[]> {
  await initDatabase();
  const sql = `SELECT * FROM detections WHERE tool_id = ? ORDER BY detected_at DESC LIMIT ?`;
  const stmt = db!.prepare(sql);
  stmt.bind([toolId, limit]);

  const detections: Detection[] = [];
  while (stmt.step()) {
    detections.push(stmt.getAsObject() as unknown as Detection);
  }
  stmt.free();
  return detections;
}

/**
 * Ajoute un mouvement (check-in/check-out)
 */
export async function addMovement(
  toolId: string,
  type: 'check_in' | 'check_out',
  userId: string,
  location: string
): Promise<void> {
  await initDatabase();
  db!.run(
    'INSERT INTO movements (tool_id, type, user_id, location) VALUES (?, ?, ?, ?)',
    [toolId, type, userId, location]
  );
  saveDatabase();
}

/**
 * Récupère les mouvements d'un outil
 */
export async function getMovements(toolId: string, limit = 50): Promise<Movement[]> {
  await initDatabase();
  const sql = `SELECT * FROM movements WHERE tool_id = ? ORDER BY timestamp DESC LIMIT ?`;
  const stmt = db!.prepare(sql);
  stmt.bind([toolId, limit]);

  const movements: Movement[] = [];
  while (stmt.step()) {
    movements.push(stmt.getAsObject() as unknown as Movement);
  }
  stmt.free();
  return movements;
}

/**
 * Génère un ID unique
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}