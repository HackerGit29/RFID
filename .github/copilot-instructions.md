# Copilot instructions for RFID (ToolTracker)

Purpose
- Short, focused guidance for Copilot-style assistants (Copilot CLI, Claude Code, OpenCode) when working in this repo.

Build / Test / Lint (what exists)
- Dev server: npm run start  # Vite dev server (host mode)
- Build: npm run build       # Vite production build (outputs dist/)
- Preview: npm run preview  # Vite preview of build
- Capacitor mobile flows:
  - npm run dev:android     # Build, sync, run on Android emulator
  - npm run dev:ios         # Build, sync, run on iOS simulator
  - npm run android:studio  # cap open android
  - npm run ios:studio      # cap open ios
- Tests: No `test` script found in package.json. There is no test suite configured in the repo.
- Lint: No `lint` script found. No repo-level ESLint/Prettier scripts detected.

Note: package.json includes TypeScript as a devDependency. For a quick type-check (single-run): `npx tsc --noEmit` or `npx tsc --noEmit src/path/to/file.tsx`.

High-level architecture (big picture)
- Purpose: Mobile-first tool-tracking app using a hybrid RFID + BLE approach: RFID for deterministic checkpoint check-in/out (ESP32 + RC522), BLE for continuous/RTLS location and hot/cold search (mobile app).
- Frontend: React + Vite (Vite root = ./src). App runs inside Capacitor for iOS/Android.
- Mapping: Leaflet (OpenStreetMap) used for maps & visualization.
- Local persistence: sqlite (sql.js) used on-device (WASM) for inventory and offline CRUD.
- Backend (planned): Supabase (Postgres + Edge Functions + realtime) referenced for inventory, logs, and syncing.
- Firmware: ESP32 firmware and Arduino examples live under ESP32/ (RFID portique code).

Key repository conventions & quirks
- Vite root is ./src — many paths and configs reference files relative to src/ (not the repo root). See AGENTS.md.
- Capacitor production builds: must export NODE_ENV=production before running production capacitor builds so server.url is stripped from the runtime configuration.
- Capacitor config is dynamic for hot-reload: it reads the local IP at build time (dev-only behavior).
- BLE vs RFID semantic convention:
  - "Low-value" tools: tracked by RFID only (binary present/absent via portiques).
  - "High-value" tools: tracked by both RFID (checkpoint logs) and BLE (real-time search & location).
  - "Toolboxes" / large equipment: tracked primarily via BLE for global localization.
- State management uses React Contexts (ThemeContext, MapContext, BLEScannerContext, MovementsContext). Look in src/contexts/.
- Maps & UI components live in src/components/ (LeafletMap, ToolCard, ToolDetailMap, BottomNav).
- Tests & linters are not present—avoid assuming unit tests exist when suggesting changes unless adding tests is part of the requested task.

Docs and AI assistant artifacts to consult
- CLAUDE.md: detailed run commands, architecture notes, and Mulch guidance. Always consult it for Mulch onboarding and session conventions.
- AGENTS.md: quick dev commands and important quirks (Vite root, NODE_ENV, Capacitor notes). Copilot sessions should read this first for environment-specific commands.
- 00-README-SUMMARY.md and docs/: architecture summaries and prototype validation — useful for domain knowledge.

Session setup recommendations (for Copilot/agents)
- Run `mulch prime` at the start of a session if Mulch is available; the repo has Mulch instructions in CLAUDE.md.
- Load AGENTS.md and CLAUDE.md into assistant context early — they contain essential operational quirks (Vite root, production env, dev scripts).
- When modifying build or Capcitor flows, validate by running the exact npm scripts (start/build/dev:android/dev:ios) rather than guessing paths.

Where to find key codepaths
- src/screens/ — app pages (HomeDashboard, BLERadar, InventoryList, ToolDetail, SplashScreen)
- src/components/ — reusable UI and map components
- src/contexts/ — app-wide state and BLE scanner logic
- ESP32/ — firmware and hardware examples (RFID portique)
- docs/, 00-README-SUMMARY.md, and 01-/02-/03-*.md — architecture and prototype docs

If you edit package.json scripts
- Prefer adding explicit `test` and `lint` scripts if introducing tests or linters (helps future Copilot sessions discover how to run them).

MCP servers
- (Skip: none configured automatically here)

Summary
- Created concise guidance covering build scripts that exist, the hybrid architecture, and repository-specific conventions (Vite root, NODE_ENV, Mulch, BLE/RFID semantics). Copilot sessions should read AGENTS.md and CLAUDE.md first.

If you'd like, add coverage for running/debugging on an Android emulator, detailed TypeScript/ESLint setup, or CI workflows; indicate which and those will be added.