# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Web Development (Vite + React)
- **Start dev server:** `npm run start` (starts Vite in host mode on port 5173)
- **Production build:** `npm run build`
- **Preview build:** `npm run preview`

### Mobile Development (Capacitor)
- **Run on iOS:** `npm run dev:ios` (builds, syncs and runs on iOS)
- **Run on Android:** `npm run dev:android` (builds, syncs and runs on Android)
- **Open Android Studio:** `npm run android:studio`
- **Open Xcode:** `npm run ios:studio`

*Note: For production builds with Capacitor, ensure `NODE_ENV=production` is exported to eliminate the `server.url` config.*

## Architecture Overview

### High-Level Project Goal
The project is a Tool Tracking System for laboratories, employing a hybrid approach:
- **RFID (HF 13.56 MHz):** Used for exact check-in/check-out at fixed checkpoints (portiques) using ESP32 + RC522.
- **BLE (Bluetooth Low Energy):** Used for real-time location (RTLS) and "Hot/Cold" search of high-value tools via a mobile app.

### Technical Stack
- **Frontend:** React, Vite, TailwindCSS.
- **Mobile Wrapper:** Capacitor (cross-platform iOS/Android).
- **Mapping:** Leaflet / Mapbox integration for tool visualization.
- **Backend (Planned/Referenced):** Supabase (PostgreSQL + Edge Functions) for tool inventory, logs, and real-time position syncing.

### Code Structure
- `src/screens/`: Main application views (HomeDashboard, BLERadar, InventoryList, etc.).
- `src/components/`: Reusable UI elements (LeafletMap, ToolCard, BottomNav).
- `src/contexts/`: Global state management (ThemeContext, MapContext).
- `src/types/`: TypeScript definitions for tools and system events.
- `android/` & `ios/`: Native platform projects managed by Capacitor.
- `src/frontend/`: HTML templates (likely used for design prototypes or reference).

### Hybrid Logic
- **Low-value tools:** Tracked only via RFID (binary presence).
- **High-value tools:** Tracked via both RFID (entry/exit) and BLE (real-time search).
- **Toolboxes:** Tracked primarily via BLE for global localization.
