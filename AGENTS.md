# AGENTS.md

## Dev Commands
- `npm run start` - Vite dev server on port 5173 (host mode)
- `npm run build` - Production build to `dist/`
- `npm run dev:ios` - Build, sync, run on iOS simulator
- `npm run dev:android` - Build, sync, run on Android emulator

## Important Quirks
- **Vite root is `./src`** - config files reference paths relative to `src/`, not project root
- **Production builds:** Must export `NODE_ENV=production` before capacitor builds to strip the dev server URL from config
- **Capacitor config is dynamic** - reads local IP at build time for hot reload (non-production only)

## Project Structure
```
src/
├── screens/       # Page components (HomeDashboard, BLERadar, InventoryList, etc.)
├── components/    # Reusable UI (LeafletMap, ToolCard, BottomNav, etc.)
├── contexts/      # State (ThemeContext, MapContext, BLEScannerContext, etc.)
├── types/         # TypeScript definitions
└── utils/         # Utilities (supabase.ts, bleFilters.ts)

android/          # Android native project (Capacitor)
ios/              # iOS native project (Capacitor)
dist/             # Build output
```

## Technology
- React 18 + Vite + TailwindCSS
- Capacitor for mobile (iOS/Android)
- Supabase (planned backend)
- Leaflet for mapping

## Tool Tracking Logic
- **Low-value tools:** RFID only (binary check-in/check-out)
- **High-value tools:** RFID + BLE (real-time location)
- **Toolboxes:** BLE primarily (global localization)
