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

<!-- mulch:start -->
## Project Expertise (Mulch)
<!-- mulch-onboard-v:1 -->

This project uses [Mulch](https://github.com/jayminwest/mulch) for structured expertise management.

**At the start of every session**, run:
```bash
mulch prime
```

This injects project-specific conventions, patterns, decisions, and other learnings into your context.
Use `mulch prime --files src/foo.ts` to load only records relevant to specific files.

**Before completing your task**, review your work for insights worth preserving — conventions discovered,
patterns applied, failures encountered, or decisions made — and record them:
```bash
mulch record <domain> --type <convention|pattern|failure|decision|reference|guide> --description "..."
```

Link evidence when available: `--evidence-commit <sha>`, `--evidence-bead <id>`

Run `mulch status` to check domain health and entry counts.
Run `mulch --help` for full usage.
Mulch write commands use file locking and atomic writes — multiple agents can safely record to the same domain concurrently.

### Before You Finish

1. Discover what to record:
   ```bash
   mulch learn
   ```
2. Store insights from this work session:
   ```bash
   mulch record <domain> --type <convention|pattern|failure|decision|reference|guide> --description "..."
   ```
3. Validate and commit:
   ```bash
   mulch sync
   ```
<!-- mulch:end -->
