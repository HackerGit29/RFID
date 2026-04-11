-- Unified Schema for Tool Tracking System (Prototype 1)

-- Tools Table: Central inventory and state management
CREATE TABLE tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT,
    serial_number TEXT UNIQUE NOT NULL,
    rfid_enabled BOOLEAN DEFAULT true,
    ble_enabled BOOLEAN DEFAULT true,
    status TEXT CHECK (status IN ('available', 'in_use', 'maintenance', 'lost')) DEFAULT 'available',
    state TEXT CHECK (state IN ('authorized', 'locked')) DEFAULT 'authorized',
    assigned_to TEXT,
    location TEXT,
    price DECIMAL(10, 2),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Checkpoints Table: RFID Portal definitions
CREATE TABLE checkpoints (
    id TEXT PRIMARY KEY, -- e.g., 'CHECKPOINT_01'
    name TEXT NOT NULL,
    location TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tool Logs Table: Real-time movement and access history
CREATE TABLE tool_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
    tool_uid TEXT NOT NULL, -- The raw RFID tag UID
    tool_name TEXT,
    type TEXT CHECK (type IN ('RFID_OUT', 'RFID_IN', 'BLE_DETECTED', 'BLE_LOST')),
    checkpoint_id TEXT REFERENCES checkpoints(id),
    authorized BOOLEAN NOT NULL,
    user TEXT,
    location TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
    status TEXT CHECK (status IN ('active', 'stable', 'lost')) DEFAULT 'active'
);

-- Enable Realtime for the tool_logs table
ALTER PUBLICATION supabase_realtime ADD TABLE tool_logs;

-- Seed data for testing
INSERT INTO checkpoints (id, name, location) VALUES ('CHECKPOINT_01', 'Main Exit Portal', 'Warehouse Door A');

INSERT INTO tools (name, category, serial_number, state, rfid_enabled) VALUES
('Perceuse Bosch', 'Power Tools', 'BOSCH-001', 'authorized', true),
('Oscilloscope', 'Measuring', 'OSC-992', 'locked', true);
