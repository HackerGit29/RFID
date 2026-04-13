# ToolTracker Pro - QWEN.md

**Project Type:** Mobile App (Capacitor + React + TypeScript)  
**Domain:** Industrial Tool Tracking System (RFID + BLE)  
**Status:** ✅ Production Ready - UI/UX Optimized  
**Last Updated:** 27 Mars 2026

---

## 📋 Project Overview

**ToolTracker Pro** is a hybrid mobile application for tracking laboratory tools using two complementary technologies:

1. **RFID (13.56 MHz)** - Fixed checkpoints for automated check-in/check-out (<0.5s latency)
2. **BLE (Bluetooth Low Energy)** - Real-time indoor localization with OpenStreetMap integration

The app combines both technologies to provide comprehensive tool tracking with:
- Automated inventory management at entry/exit points
- Real-time location tracking on interactive maps
- User geolocation for precise positioning
- "Hot/Cold" guidance radar for finding lost equipment
- Movement history and analytics
- Light/Dark theme support with system preference detection

### Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | React + TypeScript | 18.3.1 |
| **Routing** | React Router | 7.13.2 |
| **Styling** | Tailwind CSS v4 | 4.2.2 |
| **Maps** | Leaflet + React Leaflet | 5.0.0 |
| **Mobile Runtime** | Capacitor | 6.x |
| **Build Tool** | Vite | latest |
| **Backend** | Supabase | 2.103.0 |
| **Hardware** | ESP32 + RC522 (RFID), BLE Beacons | - |

---

## 🏗️ Project Structure

```
RFID/
├── src/
│   ├── screens/              # Full screen components (5 implemented)
│   │   ├── SplashScreen.tsx
│   │   ├── HomeDashboard.tsx
│   │   ├── InventoryList.tsx
│   │   ├── ToolDetail.tsx
│   │   └── BLERadar.tsx
│   ├── components/           # Reusable components
│   ├── contexts/             # React Context providers (5 contexts)
│   │   ├── ThemeContext.tsx  # Light/Dark/System themes
│   │   ├── MapContext.tsx    # Map state management
│   │   ├── BLEScannerContext.tsx
│   │   ├── MovementsContext.tsx
│   │   └── UIFiltersContext.tsx
│   ├── types/
│   │   └── index.ts          # TypeScript types
│   ├── app.tsx               # Main routing
│   ├── main.tsx              # Entry point
│   ├── index.html            # HTML template
│   └── global.css            # Global styles + CSS vars
├── android/                   # Android native project
├── ios/                       # iOS native project
├── docs/                      # Documentation
│   ├── 00-README-SUMMARY.md
│   ├── 01-PROTOTYPE-1-RFID.md
│   ├── 02-PROTOTYPE-2-BLE.md
│   ├── 03-ARCHITECTURE-HYBRIDE.md
│   ├── 04-MATERIEL-VALIDATION.md
│   └── 05-BIBLIOGRAPHIE.md
├── package.json
├── vite.config.ts
├── capacitor.config.ts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
└── .env.local                 # Supabase credentials
```

---

## 🚀 Building and Running

### Prerequisites

- Node.js 18+
- npm/yarn/pnpm
- Android Studio (for Android builds)
- Xcode (for iOS builds, macOS only)
- Physical Android device or emulator (for testing)

### Installation

```bash
# Install dependencies
npm install --legacy-peer-deps
```

### Development Commands

```bash
# Start Vite dev server (hot reload, exposes port 5173)
npm run start

# Build for production
npm run build

# Preview production build
npm run preview

# Run on Android (build + sync + run)
npm run dev:android

# Run on iOS (build + sync + run)
npm run dev:ios

# Open in Android Studio
npm run android:studio

# Open in Xcode
npm run ios:studio
```

### Production Build

```bash
# Set production environment
export NODE_ENV=production

# Build and sync
npm run build && npx cap sync android
```

---

## 📱 App Screens & Routes

### Implemented Screens (5/5)

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `SplashScreen` | Auto-navigate to home after 2.5s (first launch only) |
| `/home` | `HomeDashboard` | Main dashboard with stats + recent movements |
| `/inventory` | `InventoryList` | Tool catalog with RFID/BLE filters |
| `/inventory/:id` | `ToolDetail` | Tool details with draggable bottom sheet |
| `/tool/:id` | `ToolDetail` | Tool details (alternative route) |
| `/radar` | `BLERadar` | BLE scanner with OpenStreetMap + geolocation |

### Placeholder Screens (TODO)

| Route | Status |
|-------|--------|
| `/alerts` | ⏳ Placeholder |
| `/profile` | ⏳ Placeholder |

### Navigation Flow

```
/ (Splash, 2.5s on first launch only)
  ↓
/home (Dashboard)
  ├─→ /inventory (Tool list)
  │     └─→ /tool/:id or /inventory/:id (Detail)
  ├─→ /radar (BLE scanner with map)
  ├─→ /alerts (TODO)
  └─→ /profile (TODO)
```

---

## 🎨 Design System

### Colors (Material Design 3)

All colors are defined as CSS variables in `global.css` and mapped in `tailwind.config.js`:

#### Dark Theme (Default)

```css
--surface: #0b1326 (Dark navy)
--primary: #adc6ff (Light blue)
--secondary: #bec6e0 (Gray-blue)
--tertiary: #4edea3 (Mint green)
--error: #ffb4ab (Soft red)
--on-surface: #dae2fd (Light text)
```

#### Light Theme

```css
--surface: #f8f9ff (Light background)
--primary: #357df1 (Blue)
--secondary: #575e71 (Gray)
--tertiary: #006e54 (Dark green)
--error: #ba1a1a (Red)
--on-surface: #191c20 (Dark text)
```

### Typography

- **Headlines**: Manrope (Google Fonts)
- **Body**: Inter (Google Fonts)
- **Labels**: Inter (Google Fonts)

### Icons

- **Material Symbols Outlined** (Google Fonts)
- Supports variations: `FILL`, `wght`, `GRAD`, `opsz`

---

## 📐 TypeScript Types

```typescript
interface Tool {
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

interface Movement {
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

interface BLEDevice {
  id: string;
  name: string;
  distance: number;
  rssi: number;
  smoothedRssi: number; // Filtered signal for radar stability
  status: 'hot' | 'warm' | 'cold' | 'lost';
  icon: string;
  lastPing: number; // Timestamp of last detection
}
```

---

## 🗺️ OpenStreetMap Integration

### Features

- ✅ Interactive map with Leaflet
- ✅ User geolocation (GPS)
- ✅ Tool markers on map
- ✅ Custom markers by status
- ✅ Route polylines (patrol routes)
- ✅ Layer toggles (Items, Routes, Heatmap, Zones)
- ✅ Zoom controls
- ✅ Light/Dark theme support for tiles

### Configuration

```typescript
// Position du labo (À MODIFIER selon vos coordonnées réelles)
const LAB_CENTER: [number, number] = [48.8566, 2.3522]; // Paris (exemple)

// À remplacer par les coordonnées GPS de votre laboratoire
```

---

## 🌓 Theme System

### Three Modes

1. **Dark** (🌙) - Default theme
2. **Light** (☀️) - Light theme
3. **System** (🔄) - Follows OS preference

### Persistence

- Saved to `localStorage` as `app_theme`
- Persists across app restarts
- Can be reset: `localStorage.removeItem('app_theme')`

### Toggle Cycle

```
🌙 Dark → ☀️ Light → 🔄 System → 🌙 Dark (loop)
```

---

## 🔧 Capacitor Integration

### Installed Plugins

- `@capacitor/app` - App lifecycle events
- `@capacitor/haptics` - Haptic feedback
- `@capacitor/camera` - Camera access
- `@capacitor/network` - Network status
- `@capacitor/splash-screen` - Native splash screen

### Native Features

1. **Haptic Feedback**: Light/Medium impact on interactions
2. **Safe Area Insets**: Support for notched devices
3. **Status Bar**: Custom styling
4. **Hot Reload**: Development mode with Vite server

### Configuration

```typescript
// capacitor.config.ts
appId: "com.capacitor.livereload",
appName: "CapacitorLiveReload",
webDir: "dist",
server: {
  androidScheme: 'https',
  cleartext: true,
  url: 'http://<local-ip>:5173/' // Dev mode only
},
plugins: {
  SplashScreen: {
    launchShowDuration: 0
  }
}
```

---

## 📊 Backend Integration (Supabase)

### Environment Variables

```env
VITE_SUPABASE_URL=https://lidutbiyifnhzuksocjm.supabase.co
VITE_SUPABASE_ANON_KEY=<anon_key>
```

### Planned Features

- Database schema for tools, movements, users
- Realtime subscriptions for live updates
- Edge Functions for RFID validation
- Row Level Security (RLS) policies
- Authentication with JWT

---

## 🎯 Development Conventions

### Code Style

- **TypeScript**: Strict mode with path aliases (`@/*` → `./src/*`)
- **React**: Functional components with hooks
- **Naming**: PascalCase for components, camelCase for functions
- **Files**: `.tsx` for React components, `.ts` for types/utils

### Component Structure

```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { Haptics } from '@capacitor/haptics';

interface ComponentProps {
  // Props definition
}

export default function Component({ prop }: ComponentProps) {
  // State
  const [state, setState] = useState<Type>(initialValue);
  
  // Handlers
  const handleAction = async () => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: Haptics.ImpactStyle.Light });
    }
    // Action logic
  };
  
  // Render
  return (
    <div className="...">
      {/* JSX */}
    </div>
  );
}
```

### Tailwind Usage

- Use predefined color variables from CSS custom properties
- Follow mobile-first responsive design
- Use `active:scale-90` for touch feedback
- Include `transition-colors duration-200` for smooth animations

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Hot reload works on device
- [ ] All screens render correctly
- [ ] Touch targets are accessible (min 44x44px)
- [ ] Navigation flows work
- [ ] Offline states display
- [ ] Error handling works
- [ ] Animations are smooth (60fps)
- [ ] Haptic feedback triggers
- [ ] Theme toggle works (light/dark/system)
- [ ] Map displays correctly
- [ ] Geolocation permission requested
- [ ] Tool markers visible on map

### Performance Targets

| Metric | Target |
|--------|--------|
| Initial Load | <2s |
| Screen Transition | <300ms |
| API Response | <500ms |
| Bundle Size | <700KB |

---

## 📦 Dependencies

### Production

```json
{
  "@capacitor/android": "^6.1.2",
  "@capacitor/app": "^8.1.0",
  "@capacitor/camera": "latest",
  "@capacitor/core": "^6.2.1",
  "@capacitor/haptics": "^8.0.2",
  "@capacitor/ios": "^6.1.2",
  "@capacitor/network": "^6.0.2",
  "@capacitor/splash-screen": "latest",
  "@supabase/supabase-js": "^2.103.0",
  "@types/leaflet": "^1.9.21",
  "@types/react-leaflet": "^2.8.3",
  "@use-gesture/react": "^10.3.1",
  "framer-motion": "^12.38.0",
  "leaflet": "^1.9.4",
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-leaflet": "^5.0.0",
  "react-router-dom": "^7.13.2"
}
```

### Development

```json
{
  "@capacitor/cli": "^6.1.2",
  "@tailwindcss/postcss": "^4.2.2",
  "@types/node": "^25.5.0",
  "@types/react": "^18.3.5",
  "@types/react-dom": "^18.3.0",
  "@types/react-router-dom": "^5.3.3",
  "@vitejs/plugin-react": "latest",
  "autoprefixer": "latest",
  "postcss": "latest",
  "typescript": "latest",
  "vite": "latest"
}
```

---

## 🔐 Security Considerations

### Best Practices

- **API Keys**: Stored in `.env.local`, never commit to git
- **Authentication**: Implement JWT with refresh tokens (TODO)
- **HTTPS**: Enforce SSL for all API calls
- **Data Validation**: Validate all user inputs
- **Permissions**: Request minimal permissions, explain why

### Secure Storage Example (Planned)

```typescript
import { SecureStorage } from '@capacitor/secure-storage';

await SecureStorage.set({
  key: 'auth_token',
  value: encryptedToken
});
```

---

## 🐛 Known Issues & Workarounds

### Tailwind CSS v4 Migration

**Issue**: PostCSS plugin moved to separate package  
**Fix**: Use `@tailwindcss/postcss` instead of `tailwindcss` in `postcss.config.js`

```js
// postcss.config.js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  }
}
```

```css
/* global.css */
@import "tailwindcss"; /* v4 syntax */
```

### Android Run Error

**Issue**: `native-run failed with error: undefined`  
**Causes**: No device connected, USB debugging disabled, or driver issues  
**Solutions**:
1. Check `adb devices` - device should be listed
2. Enable USB debugging on Android device
3. Install USB drivers (Windows)
4. Use `npm run android:studio` to open in Android Studio

### Leaflet MapContainer Context Error (FIXED ✅)

**Issue**: `Uncaught TypeError: render is not a function` at `updateContextConsumer`  
**Cause**: `MapViewUpdater` component rendered as child of `MapContainer` while using `useMap()` hook  
**Fix**: Removed `MapViewUpdater` - `MapContainer` handles center/zoom via props directly

---

## 📚 Documentation Files

| File | Content |
|------|---------|
| `README.md` | Original Capacitor boilerplate docs |
| `00-README-SUMMARY.md` | Executive summary of prototype validation |
| `01-PROTOTYPE-1-RFID.md` | Documentation complète du Prototype 1 |
| `02-PROTOTYPE-2-BLE.md` | Documentation complète du Prototype 2 |
| `03-ARCHITECTURE-HYBRIDE.md` | Architecture combinée et recommandations |
| `04-MATERIEL-VALIDATION.md` | Validation détaillée de la liste de matériel |
| `05-BIBLIOGRAPHIE.md` | Références académiques et techniques |
| `MIGRATION-README.md` | Complete HTML → React migration guide |
| `THEME-SYSTEM.md` | Light/Dark theme implementation docs |
| `OPENSTREETMAP-INTEGRATION.md` | Map integration documentation |
| `GESTURE-HANDLER.md` | Swipe gesture implementation |
| `SPLASH-SCREEN.md` | First-launch splash screen logic |

---

## 🎯 Next Steps

### Immediate Tasks

1. **Update Lab Coordinates**
   - Modify `LAB_CENTER` in `BLERadar.tsx` with real GPS coordinates
   - Test map positioning on device

2. **Implement Placeholder Screens**
   - `/alerts` - Notification center
   - `/profile` - User settings with theme preference

3. **Backend Integration**
   - Set up Supabase project
   - Deploy database schema
   - Create Edge Functions for RFID validation
   - Implement Realtime subscriptions
   - Configure Row Level Security (RLS)

4. **State Management**
   - Install Zustand or use React Context (already implemented)
   - Implement global state for tools, user, settings

### Hardware Development

1. Order RC522 modules and RFID tags
2. Order BLE beacons (5-20 units)
3. Assemble ESP32 + RC522 prototype
4. Flash ESP32 firmware
5. Test RFID checkpoint latency

### Map Enhancements

1. Add heatmap layer for RSSI visualization
2. Implement geofencing zones
3. Add dynamic route calculation
4. Indoor positioning support

---

## 📞 Support & Resources

### Documentation

- [Capacitor Docs](https://capacitorjs.com/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [Vite Docs](https://vitejs.dev)
- [React Router](https://reactrouter.com/)
- [Leaflet Docs](https://leafletjs.com/reference.html)
- [React Leaflet](https://react-leaflet.js.org/)
- [OpenStreetMap](https://www.openstreetmap.org/)

### Hardware References

- [ESP32 Datasheet](https://www.espressif.com/en/products/socs/esp32)
- [RC522 Datasheet](https://www.nxp.com/docs/en/data-sheet/MFRC522.pdf)
- [BLE Specification](https://www.bluetooth.com/specifications/specs/)

---

## 🧠 Expertise Sharing (Mulch)

This project uses **Mulch** for structured expertise management between Qwen Code and OpenCodex agents.

### What is Mulch?

Mulch is a passive expertise management system that allows agents to:
- **Record** learnings in structured JSONL files (`.mulch/expertise/<domain>.jsonl`)
- **Query** accumulated knowledge across sessions
- **Share** expertise between agents via git-tracked files

**Key principle:** Mulch does NOT contain an LLM. Agents use Mulch — Mulch does not use agents.

### Agent Workflow

#### At Session Start (MANDATORY)

```bash
bunx @os-eco/mulch-cli prime
```

This injects all project expertise into your context before you start working.

#### Before Session End (MANDATORY)

```bash
# 1. Discover what changed
bunx @os-eco/mulch-cli learn

# 2. Record insights from this session
bunx @os-eco/mulch-cli record <domain> --type <type> --description "..."

# 3. Validate and commit
bunx @os-eco/mulch-cli sync
```

### Available Domains

| Domain | Purpose | Records |
|--------|---------|---------|
| `architecture` | App structure, state management, routing | 2 |
| `rfid` | RFID 13.56 MHz checkpoint logic | 1 |
| `ble` | BLE beacon localization | 1 |
| `supabase` | Backend decisions, real-time, auth | 1 |
| `ui-ux` | Material Design 3, theming, Tailwind | 2 |
| `mobile-dev` | Capacitor commands, workflows | 4 |
| `rfid-tool-tracking` | Tool categorization, hybrid logic | 4 |

### Record Types

| Type | Use Case | Example |
|------|----------|---------|
| `convention` | Rules, standards | "Use React Context for state management" |
| `pattern` | Named patterns | "Observer pattern for BLE scanner" |
| `failure` | What went wrong + resolution | "MapContainer error → Remove MapViewUpdater" |
| `decision` | Architectural choices | "Supabase over PostgreSQL: real-time subscriptions" |
| `reference` | Key resources | "Dev server: npm run start on port 5173" |
| `guide` | Procedures | "BLE beacon calibration procedure" |

### Full Documentation

See `docs/MULCH-GUIDE.md` for complete usage guide, examples, and troubleshooting.

---

**Project Goal:** Deliver a production-ready hybrid mobile app that combines RFID checkpoint security with BLE real-time localization on OpenStreetMap for comprehensive tool tracking in laboratory environments.

**Current Status:** ✅ Frontend complete with:
- 5 screens implemented
- Multiple reusable components
- Light/Dark theme system
- OpenStreetMap integration
- User geolocation
- Gesture navigation
- Android build ready
- MapContainer context error fixed
- **🧠 Mulch expertise sharing enabled**

**Next Phase:** Backend integration and hardware testing.
