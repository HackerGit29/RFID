# 🔧 RFID ToolTracker Pro

> Système de suivi d'outils de laboratoire utilisant une architecture hybride RFID + BLE.

**Version:** 1.0.0  
**Date:** 17 Avril 2026  


---

## 📋 Vue d'Ensemble du Projet

| Prototype | Technologie | Statut | Implementation |
|-----------|------------|--------|-----------------|
| **Prototype 1** | RFID HF (13.56 MHz) | ✅ VALIDÉ | En attente hardware |
| **Prototype 2** | BLE (Bluetooth Low Energy) | ✅ VALIDÉ | ✅ Mobile + Map |
| **Hybride** | RFID + BLE | ✅ RECOMMANDÉ | Architecture ready |

---

## 🏗️ Architecture du Système

```
┌─────────────────────────────────────────────────────────────┐
│                    SYSTÈME HYBRIDE                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐    ┌─────────────────┐              │
│  │ RFID CHECKPOINT │    │  BLE RADAR      │              │
│  │ (Portique)      │    │  (Mobile App)   │              │
│  └────────┬────────┘    └────────┬────────┘              │
│           │                       │                          │
│           ▼                       ▼                          │
│  ┌─────────────────────────────────────────────────┐          │
│  │           SUPABASE (Backend)                  │          │
│  │  PostgreSQL + Edge Functions + Realtime      │          │
│  └─────────────────────────────────────────────────┘          │
│           │                                               │
│           ▼                                               │
│  ┌─────────────────────────────────────────────────┐          │
│  │            SQLITE LOCAL (WASM)                   │          │
│  │         CRUD + Persistance mobile                  │          │
│  └─────────────────────────────────────────────────┘          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📱 Application Mobile

### Écrans Implémentés

| Écran | Fichier | Statut | Description |
|-------|--------|--------|--------------|
| Splash | `SplashScreen.tsx` | ✅ | Premier lancement |
| Home | `HomeDashboard.tsx` | ✅ | Tableau de bord |
| Inventaire | `InventoryList.tsx` | ✅ | Liste outils (SQLite) |
| Radar BLE | `BLERadar.tsx` | ✅ | Scanner + Map |
| Détail Outil | `ToolDetail.tsx` | ✅ | Carte outil |
| Calibration | `RSSICalibration.tsx` | ✅ | Calibration RSSI |

### Composants Clés

| Composant | Fichier | Usage |
|-----------|--------|-------|
| **LeafletMap** | `LeafletMap.tsx` | Carte OpenStreetMap |
| **ToolCard** | `ToolCard.tsx` | Carte outil |
| **ToolDetailMap** | `ToolDetailMap.tsx` | Map MUI + Leaflet |
| **BottomNav** | `BottomNav.tsx` | Navigation |
| **SearchBar** | `SearchBar.tsx` | Recherche |

### Contextes (State Management)

| Contexte | Usage |
|---------|-------|
| **ThemeContext** | Thème clair/sombre |
| **MapContext** | Carte et localisation |
| **BLEScannerContext** | Scanner BLE |
| **UIFiltersContext** | Filtres UI |
| **MovementsContext** | Mouvements outils |

---

## 🔧 Prototype 1 : RFID Checkpoint

### Résumé

- **Technologie:** RFID HF (13.56 MHz) avec RC522
- **Usage:** Check-in/Check-out aux portiques
- **Latence:** < 500ms
- **Précision:** 100% (binaire présent/absent)
- **Coût par outil:** $1-3 (tag passif)

### Matériel Requis

| Composant | Status | Notes |
|----------|--------|-------|
| ESP32-WROOM-32 | ✅ | Microcontroller |
| RC522 (MFRC522) | ❌ | À commander |
| Tags Mifare 1K | ❌ | À commander |
| Buzzer 5V | ✅ | Optionnel |
| LEDs + Résistances | ✅ | Status |

### Logiciel (Firmware)

```cpp
// Pseudo-code ESP32
void loop() {
  uid = rfid.readUID();        // ~100ms
  response = http.post("/api/check", uid);
  if (response.authorized) {
    ledGreen.on();
    buzzer.beep(1000);
  } else {
    ledRed.on();
    buzzer.alarm(2000);
  }
  log.timestamp(uid, response.status);
}
```

### Endpoint API

```http
POST /api/checkpoint
Content-Type: application/json

{
  "uid": "A1B2C3D4",
  "reader_id": "PORTIQUE_ENTREE",
  "timestamp": "2026-04-17T10:30:00Z"
}
```

---

## 📡 Prototype 2 : BLE Radar

### Résumé

- **Technologie:** Bluetooth Low Energy (iBeacon/Eddystone)
- **Usage:** Localisation en temps réel (RTLS)
- **Latence:** 1-2 secondes
- **Précision:** 1-3 mètres (RSSI)
- **Coût par outil:** $5-15 (balise active)

### Fonctionnalités Implémentées

| Fonctionnalité | Status |
|----------------|--------|
| Scanner BLE | ✅ |
| Hot/Cold Finder | ✅ |
| Filtre RSSI (Kalman) | ✅ |
| Carte Leaflet/OSM | ✅ |
| Clustering | ✅ |
| Polyline historique | ✅ |
| Feedback haptique | ✅ |

### Algorithme Hot/Cold

```
RSSI >= -60 dBm  → 🔥 HOT (très proche)
RSSI >= -80 dBm → 🟡 WARM (proche)
RSSI < -80 dBm  → 🔵 COLD (éloigné)
```

### Code

```typescript
class HotColdFinder {
  update(distance: number): HotColdStatus {
    if (distance < 2) return 'hot';
    if (distance < 8) return 'warm';
    return 'cold';
  }
}
```

---

## ⚖️ Architecture Hybride

### Répartition des Technologies

| Catégorie | Technologie | Justification |
|-----------|-----------|-------------|
| **Outils individuels** | RFID | Faible coût, check-in/check-out |
| **Équipements majeurs** | BLE | Localisation continue |
| **Caisses à outils** | BLE | Suivi global |
| **Portiques** | RFID | Contrôle accès |

### Setup Sans Électronique

Elements realizables des maintenant (software uniquement):

| Element | Status | Description |
|---------|--------|--------------|
| **Application mobile** | ✅ | React  |
| **Base de données SQLite** | ✅ | CRUD outils |
| **Backend Supabase** | ⚠️ | Schema prep, en attente config |
| **Carte Leaflet/OSM** | ✅ | Visualisation |
| **Filtres RSSI** | ✅ | Algorithmes prêts |
| **API REST** | ⚠️ | Routes prep |

### Roadmap de Déploiement

```
Phase 1: RFID Checkpoint (Hardware)
├── Commander RC522 + Tags
├── Déployer firmware ESP32
├── Configurer Supabase
└── Tester portique

Phase 2: BLE Radar (Mobile)
├── Scanner BLE mobile
├── Calibration RSSI
├── Intégration Map
└── Beta test

Phase 3: Hybride
├── Connexion RFID ↔ BLE
├── Dashboard analytics
└── Déploiement complet
```

---

## 📦 Installation & Commands

```bash
# Installer les dépendance
npm install

# Development server
npm run start

# Build production
npm run build

# Run on Android
npm run dev:android

# Run on iOS
npm run dev:ios

# Open Android Studio
npm run android:studio
```

---

## 🗂️ Structure du Projet

```
RFID/
├── src/
│   ├── screens/           # Écrans React
│   ├── components/       # Composants UI
│   ├── contexts/         # State management
│   ├── types/            # TypeScript types
│   ├── utils/            # Utilitaires (db, bleFilters)
│   └── components/BLE/   # Composants BLE
├── android/              # Projet Android (Capacitor)
├── ios/                  # Projet iOS (Capacitor)
├── docs/                 # Documentation Mulch
├── ESP32/                # Firmware Arduino
├── 01-PROTOTYPE-1-RFID.md # Docs Prototype 1
├── 02-PROTOTYPE-2-BLE.md # Docs Prototype 2
└── 03-ARCHITECTURE-HYBRIDE.md # Docs Hybride
```

---

## 🔑 Technologies

| Categorie | Technologie |
|-----------|-------------|
| **Frontend** | React |
| **Styling** | TailwindCSS v4 |
| **Maps** | Leaflet + OpenStreetMap |
| **Database** | SQLite + Supabase |
| **State** | React Context API |

---

## 📄 Documentation

| Fichier | Contenu |
|---------|---------|
| `00-README-SUMMARY.md` | Résumé exécutif |
| `01-PROTOTYPE-1-RFID.md` | Prototype RFID complet |
| `02-PROTOTYPE-2-BLE.md` | Prototype BLE complet |
| `03-ARCHITECTURE-HYBRIDE.md` | Architecture combinée |
| `04-MATERIEL-VALIDATION.md` | Liste matos validée |
| `05-BIBLIOGRAPHIE.md` | Réferences |

---

## 🚀 Prochaines Étapes

1. [ ] Commander le hardware (RC522, tags RFID, balises BLE)
2. [ ] Configurer Supabase (si pas déjà fait)
3. [ ] Développer firmware ESP32
4. [ ] Intégrer RFID ↔ BLE dans l'app
5. [ ] Beta test sur le terrain

---

## 📞 Support

- **Issues:** Ouvrir un ticket GitHub
- **Documentation:** Voir fichiers `docs/`


---

*Dernière mise à jour: 18 Avril 2026*
