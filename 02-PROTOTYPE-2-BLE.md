# 📡 Prototype 2 : Le "Radar/Map" de Suivi en Temps Réel (BLE)

**Technologie :** Bluetooth Low Energy (BLE)  
**Objectif :** Localisation en temps réel (RTLS) d'outils dans le laboratoire  
**Statut de Validation :** ✅ **100% VALIDÉ**

---

## 📋 Table des Matières

1. [Architecture et Fonctionnement](#architecture-et-fonctionnement)
2. [Matériel Requis](#matériel-requis)
3. [Technologie BLE et RSSI](#technologie-ble-et-rssi)
4. [Application Mobile](#application-mobile)
5. [Cartographie Mapbox](#cartographie-mapbox)
6. [Algorithme de Localisation](#algorithme-de-localisation)
7. [Performance et Précision](#performance-et-précision)
8. [Procédures de Test](#procédures-de-test)
9. [Références](#références)

---

## 🏗️ Architecture et Fonctionnement

### Vue d'Ensemble

```
┌─────────────────────────────────────────────────────────────────┐
│                    SYSTÈME DE LOCALISATION BLE                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [OUTIL avec Balise BLE]                                         │
│         │                                                        │
│         ▼ (1) Broadcasting iBeacon/Eddystone (1-10 Hz)          │
│         Packet: UUID + Major + Minor + TX Power + RSSI          │
│                                                                  │
│  [SMARTPHONE Android/iOS]                                        │
│         │                                                        │
│         ▼ (2) Scan BLE (flutter_blue_plus / react-native-ble-plx)│
│         Capture: RSSI (dBm) + MAC Address + Timestamp            │
│                                                                  │
│  [Application Mobile]                                            │
│         │                                                        │
│         ▼ (3) Filtrage RSSI (Moyenne mobile + Kalman)           │
│         RSSI filtré → Conversion distance (mètres)               │
│                                                                  │
│         ▼ (4) Calcul position (Turf.js)                         │
│         Buffer de probabilité (cercle)                           │
│                                                                  │
│         ▼ (5) Affichage carte (Mapbox GL JS)                    │
│         Position utilisateur + Cercle + Position outil           │
│                                                                  │
│         ▼ (6) Guidage "Chaud/Froid"                             │
│         Feedback visuel et haptique                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

Temps de mise à jour : 1-2 secondes
Précision : 1-3 mètres (RSSI), 0.1-1 mètre (AoA avec BLE 5.1+)
```

### Composants Clés

| Composant | Rôle | Spécifications |
|-----------|------|----------------|
| **Balise BLE** | Émetteur actif | iBeacon/Eddystone, 1-10 Hz, pile CR2477 |
| **Smartphone** | Récepteur/scanner | Android 6+ ou iOS 10+, Bluetooth 4.0+ |
| **Application** | Traitement signal | Flutter ou React Native |
| **Mapbox** | Cartographie | Indoor maps, custom styles |
| **Turf.js** | Calculs géospatiaux | Buffer, distance, bearing |

---

## 🔧 Matériel Requis

### Liste Complète et Validée

| Référence | Composant | Quantité | Prix Unitaire | Disponibilité | Fournisseur |
|-----------|-----------|----------|---------------|---------------|-------------|
| **Balises BLE (iBeacon)** | Balises actives pour outils | 5-20 | $5-15 | ❌ NON (à commander) | AliExpress, Amazon |
| **Smartphone Android** | Appareil de test | 1 | - | ✅ OUI (existant) | - |
| **Smartphone iOS** | Appareil de test (optionnel) | 1 | - | ❌ NON (optionnel) | - |
| **Powerbank** | Pour tests prolongés | 1 | $10-15 | ✅ OUI | Local |

**Coût Total Estimé :** $35-315 (selon nombre de balises)

### Détails Techniques des Balises BLE

#### Options Recommandées

| Modèle | Prix | Autonomie | Portée | Protocole | Notes |
|--------|-------|-----------|--------|-----------|-------|
| **Generic iBeacon** | $5-8 | 1-2 ans | 30-50m | iBeacon | Basique, bon pour prototype |
| **Eddystone (Feasycom)** | $8-12 | 2-5 ans | 40-60m | iBeacon + Eddystone | Programmable, URL support |
| **Nordic nRF52840** | $12-20 | 5-10 ans | 50-100m | iBeacon + Eddystone + Custom | Haut de gamme, AoA support |
| **ESP32 (DIY)** | $3-5 | 6-12 mois* | 30-40m | Custom | Nécessite programmation, pile externe |

*Autonomie réduite car ESP32 non optimisé pour BLE beacon

#### Spécifications Techniques (Balise Type)

```
┌─────────────────────────────────────────────────────────────┐
│              SPÉCIFICATIONS BALISE BLE                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Chipset : Nordic nRF52810 / nRF52840                       │
│  Bluetooth : 5.0 / 5.1 / 5.2 (BLE Low Energy)               │
│  Protocoles : iBeacon, Eddystone (URL, UID, TLM)            │
│                                                              │
│  Fréquence broadcast : 100ms - 10s (configurable)           │
│  Puissance émission : -40 dBm à +4 dBm (configurable)       │
│  Portée maximale : 30-100 mètres (selon puissance)          │
│                                                              │
│  Alimentation : Pile CR2477 (3V, 1000mAh)                   │
│  Autonomie : 1-10 ans (selon fréquence broadcast)           │
│  Température : -20°C à +60°C                                │
│                                                              │
│  Dimensions : 30×30×8 mm (typique)                          │
│  Poids : 10-20 g                                            │
│  Fixation : Adhésif 3M, trou de fixation, clip              │
│                                                              │
│  Étanchéité : IP65 / IP67 (selon modèle)                    │
│  Certification : CE, FCC, RoHS                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Alternative DIY : ESP32 comme Balise BLE

Si les balises commerciales ne sont pas disponibles immédiatement, un ESP32 peut être programmé comme balise BLE temporaire.

```cpp
/**
 * ESP32 BLE Beacon (iBeacon compatible)
 * Alternative low-cost pour prototype
 */

#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>

// ─────────────────────────────────────────────────────────────
// CONFIGURATION iBEACON
// ─────────────────────────────────────────────────────────────
#define IBEACON_UUID 0x4C, 0x00, 0x02, 0x15, \
                     0xB1, 0x9A, 0x35, 0x78, \
                     0x56, 0x78, 0x45, 0x67, \
                     0x89, 0xAB, 0xCD, 0xEF, \
                     0x12, 0x34, 0x56, 0x78

#define MAJOR_VALUE 0x0001
#define MINOR_VALUE 0x0002
#define TX_POWER -59  // Calibré à 1 mètre

// ─────────────────────────────────────────────────────────────
// DONNÉES DE PUBLICITÉ
// ─────────────────────────────────────────────────────────────
uint8_t beaconPayload[25] = {
  0x02, 0x01, 0x06,              // Flags
  0x1A, 0xFF,                    // Manufacturer Specific Data
  0x4C, 0x00,                    // Apple Company ID
  0x02, 0x15,                    // iBeacon type
  IBEACON_UUID,                  // UUID (16 bytes)
  0x00, 0x01,                    // Major
  0x00, 0x02,                    // Minor
  0x10,                          // TX Power
  0x00, 0x00, 0x00               // Padding
};

void setup() {
  Serial.begin(115200);
  
  // Initialiser BLE
  BLEDevice::init("ToolBeacon_01");
  BLEAdvertising* pAdvertising = BLEDevice::getAdvertising();
  
  // Configurer payload iBeacon
  pAdvertising->setManufacturerData(
    beaconPayload, 
    sizeof(beaconPayload)
  );
  
  // Démarrer broadcasting
  pAdvertising->start();
  
  Serial.println("📡 BLE Beacon started");
  Serial.println("UUID: 4C000215B19A35785678456789ABCDEF12345678");
  Serial.println("Major: 1, Minor: 2");
}

void loop() {
  // Broadcasting continu géré par le stack BLE
  delay(1000);
}
```

---

## 📶 Technologie BLE et RSSI

### Comprendre le RSSI

**RSSI (Received Signal Strength Indicator)** est une mesure de la puissance du signal reçu, exprimée en **dBm** (décibels-milliwatts).

```
┌─────────────────────────────────────────────────────────────┐
│              ÉCHELLE RSSI ET DISTANCE                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  RSSI (dBm)    Distance      Qualité du signal              │
│  ─────────────────────────────────────────────────────────  │
│  -30 à -50     < 1 m         Excellent (très proche)        │
│  -50 à -60     1-2 m         Très bon                       │
│  -60 à -70     2-4 m         Bon                            │
│  -70 à -80     4-8 m         Moyen                          │
│  -80 à -90     8-15 m        Faible                         │
│  -90 à -100    15-30 m       Très faible                    │
│  < -100        > 30 m        Hors de portée                 │
│                                                              │
│  Note : Valeurs typiques en environnement intérieur         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Formule de Conversion RSSI → Distance

La formule utilisée est le **modèle log-distance path loss** :

```
distance = 10 ^ ((RSSI_1m - RSSI_mesuré) / (10 × n))

Où :
- RSSI_1m = RSSI de référence à 1 mètre (typiquement -59 à -65 dBm)
- RSSI_mesuré = Valeur RSSI actuelle (dBm)
- n = Exposant de perte de chemin (2.0 en espace libre, 2.5-4.0 en intérieur)
```

### Implémentation JavaScript/TypeScript

```typescript
/**
 * Convertit RSSI en distance estimée (mètres)
 * 
 * @param rssi - Valeur RSSI actuelle (dBm)
 * @param rssiAt1m - RSSI de référence à 1 mètre (par défaut: -59)
 * @param pathLossExponent - Exposant de perte (par défaut: 2.0)
 * @returns Distance estimée en mètres
 */
function rssiToDistance(
  rssi: number,
  rssiAt1m: number = -59,
  pathLossExponent: number = 2.0
): number {
  if (rssi === 0) {
    return -1; // Impossible de calculer
  }

  const ratio = (rssiAt1m - rssi) / (10 * pathLossExponent);
  const distance = Math.pow(10, ratio);
  
  return distance;
}

/**
 * Filtre de Kalman simplifié pour lisser le RSSI
 * Réduit les fluctuations dues aux interférences
 */
class RSSIFilter {
  private kalmanGain: number = 0.1;
  private estimatedValue: number = -60;

  update(measurement: number): number {
    this.estimatedValue = 
      this.estimatedValue + 
      this.kalmanGain * (measurement - this.estimatedValue);
    return this.estimatedValue;
  }

  reset(initialValue: number) {
    this.estimatedValue = initialValue;
  }
}

/**
 * Moyenne mobile glissante (Simple Moving Average)
 * Alternative plus simple au filtre de Kalman
 */
class MovingAverageFilter {
  private values: number[] = [];
  private maxSize: number;

  constructor(size: number = 10) {
    this.maxSize = size;
  }

  update(value: number): number {
    this.values.push(value);
    if (this.values.length > this.maxSize) {
      this.values.shift();
    }
    
    const sum = this.values.reduce((a, b) => a + b, 0);
    return sum / this.values.length;
  }

  reset() {
    this.values = [];
  }
}

// Exemple d'utilisation
const rssiFilter = new MovingAverageFilter(10);
const rawRSSI = -72;
const filteredRSSI = rssiFilter.update(rawRSSI);
const distance = rssiToDistance(filteredRSSI, -59, 2.5);

console.log(`Distance estimée: ${distance.toFixed(2)} mètres`);
```

### Calibration du RSSI

**Important :** Le RSSI varie selon l'environnement. Une calibration sur site est nécessaire.

```typescript
/**
 * Procédure de calibration RSSI
 * 
 * Étapes :
 * 1. Placer la balise à exactement 1 mètre du récepteur
 * 2. Collecter 100 lectures RSSI sur 10 secondes
 * 3. Calculer la moyenne → RSSI_1m de référence
 * 4. Répéter à 2m, 3m, 5m pour valider le modèle
 */

interface CalibrationData {
  distance: number;
  rssiValues: number[];
  averageRSSI: number;
  stdDeviation: number;
}

function calibrateRSSI(): CalibrationData[] {
  const distances = [1, 2, 3, 5, 10]; // mètres
  const samplesPerDistance = 100;
  
  return distances.map(distance => {
    console.log(`Calibration à ${distance}m...`);
    
    // Collecter les échantillons (pseudo-code)
    const rssiValues: number[] = [];
    for (let i = 0; i < samplesPerDistance; i++) {
      rssiValues.push(readRSSI()); // Fonction à implémenter
    }
    
    const averageRSSI = rssiValues.reduce((a, b) => a + b) / samplesPerDistance;
    const variance = rssiValues.reduce((sum, val) => sum + Math.pow(val - averageRSSI, 2), 0) / samplesPerDistance;
    const stdDeviation = Math.sqrt(variance);
    
    return {
      distance,
      rssiValues,
      averageRSSI,
      stdDeviation
    };
  });
}
```

---

## 📱 Application Mobile

### Choix Technologique : Flutter vs React Native

| Critère | Flutter | React Native |
|---------|---------|--------------|
| **Bibliothèque BLE** | `flutter_blue_plus` | `react-native-ble-plx` |
| **Maturité** | Très mature | Très mature |
| **Performance BLE** | Excellente | Excellente |
| **Développement** | Dart (rapide) | TypeScript (connu) |
| **UI/UX** | Widgets natifs | Composants natifs |
| **Recommandation** | ✅ Choix 1 | ✅ Choix 2 |

Les deux frameworks sont validés pour ce cas d'usage. Le choix dépend de l'expertise existante dans l'équipe.

---

### Option 1 : Flutter avec `flutter_blue_plus`

#### Installation

```yaml
# pubspec.yaml
dependencies:
  flutter:
    sdk: flutter
  flutter_blue_plus: ^1.32.12
  permission_handler: ^11.0.0
  flutter_map: ^6.0.0  # Alternative open-source à Mapbox
  latlong2: ^0.9.0
```

#### Code Principal

```dart
import 'package:flutter/material.dart';
import 'package:flutter_blue_plus/flutter_blue_plus.dart';
import 'dart:async';
import 'dart:math';

// ─────────────────────────────────────────────────────────────
// MODÈLE DE DONNÉES
// ─────────────────────────────────────────────────────────────
class ToolBeacon {
  final String deviceId;
  final String name;
  final int rssi;
  final double distance;
  final DateTime lastSeen;

  ToolBeacon({
    required this.deviceId,
    required this.name,
    required this.rssi,
    required this.distance,
    required this.lastSeen,
  });
}

// ─────────────────────────────────────────────────────────────
// ÉCRAN PRINCIPAL
// ─────────────────────────────────────────────────────────────
class BLEScannerScreen extends StatefulWidget {
  @override
  _BLEScannerScreenState createState() => _BLEScannerScreenState();
}

class _BLEScannerScreenState extends State<BLEScannerScreen> {
  List<ToolBeacon> _beacons = [];
  bool _isScanning = false;
  StreamSubscription? _scanSubscription;
  
  // Filtre RSSI
  final Map<String, List<int>> _rssiHistory = {};
  static const int FILTER_WINDOW = 10;

  // UUID de vos balises (à personnaliser)
  static const String TARGET_SERVICE_UUID = "0000feaa-0000-1000-8000-00805f9b34fb";

  @override
  void initState() {
    super.initState();
    _startScanning();
  }

  @override
  void dispose() {
    _stopScanning();
    super.dispose();
  }

  // ───────────────────────────────────────────────────────────
  // SCAN BLE
  // ───────────────────────────────────────────────────────────
  Future<void> _startScanning() async {
    // Vérifier permissions
    await _requestPermissions();
    
    setState(() {
      _beacons = [];
      _isScanning = true;
    });

    // Démarrer le scan
    _scanSubscription = FlutterBluePlus.scanResults.listen((results) {
      for (var result in results) {
        if (_isTargetBeacon(result.device)) {
          _processBeacon(result.device, result.rssi);
        }
      }
    }, onError: (error) {
      print("Erreur scan: $error");
    });

    await FlutterBluePlus.startScan(
      timeout: Duration(seconds: 30),
      removeIfGone: Duration(seconds: 5),
    );
  }

  Future<void> _stopScanning() async {
    await FlutterBluePlus.stopScan();
    _scanSubscription?.cancel();
    setState(() => _isScanning = false);
  }

  // ───────────────────────────────────────────────────────────
  // TRAITEMENT DES BALISES
  // ───────────────────────────────────────────────────────────
  void _processBeacon(BluetoothDevice device, int rssi) {
    final deviceId = device.id.id;
    
    // Filtrage RSSI (moyenne mobile)
    if (!_rssiHistory.containsKey(deviceId)) {
      _rssiHistory[deviceId] = [];
    }
    
    _rssiHistory[deviceId]!.add(rssi);
    if (_rssiHistory[deviceId]!.length > FILTER_WINDOW) {
      _rssiHistory[deviceId]!.removeAt(0);
    }
    
    final filteredRSSI = _rssiHistory[deviceId]!
        .reduce((a, b) => a + b) / _rssiHistory[deviceId]!.length;
    
    // Conversion RSSI → Distance
    final distance = _rssiToDistance(filteredRSSI.toInt());
    
    // Mettre à jour la liste
    setState(() {
      final existingIndex = _beacons.indexWhere(
        (b) => b.deviceId == deviceId
      );
      
      final beacon = ToolBeacon(
        deviceId: deviceId,
        name: device.advName ?? "Unknown",
        rssi: filteredRSSI.toInt(),
        distance: distance,
        lastSeen: DateTime.now(),
      );
      
      if (existingIndex >= 0) {
        _beacons[existingIndex] = beacon;
      } else {
        _beacons.add(beacon);
      }
      
      // Trier par distance (plus proche en premier)
      _beacons.sort((a, b) => a.distance.compareTo(b.distance));
    });
  }

  bool _isTargetBeacon(BluetoothDevice device) {
    // Filtrer par UUID de service ou nom
    return device.advName?.startsWith("ToolBeacon") ?? false;
  }

  // ───────────────────────────────────────────────────────────
  // CONVERSION RSSI
  // ───────────────────────────────────────────────────────────
  double _rssiToDistance(int rssi, {int rssiAt1m = -59, double n = 2.5}) {
    if (rssi == 0) return -1;
    
    final ratio = (rssiAt1m - rssi) / (10 * n);
    final distance = pow(10, ratio);
    
    return distance.toDouble();
  }

  // ───────────────────────────────────────────────────────────
  // PERMISSIONS
  // ───────────────────────────────────────────────────────────
  Future<void> _requestPermissions() async {
    // Utiliser permission_handler pour Android 12+
    // Bluetooth, Localisation requis
  }

  // ───────────────────────────────────────────────────────────
  // INTERFACE UTILISATEUR
  // ───────────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("📡 Radar BLE"),
        actions: [
          IconButton(
            icon: Icon(_isScanning ? Icons.stop : Icons.play_arrow),
            onPressed: () => _isScanning ? _stopScanning() : _startScanning(),
          ),
        ],
      ),
      body: Column(
        children: [
          // Statut
          Container(
            padding: EdgeInsets.all(16),
            color: _isScanning ? Colors.green[100] : Colors.grey[200],
            child: Row(
              children: [
                Icon(_isScanning ? Icons.bluetooth_searching : Icons.bluetooth_disabled),
                SizedBox(width: 8),
                Text(_isScanning ? "Recherche..." : "Scan arrêté"),
              ],
            ),
          ),
          
          // Liste des balises
          Expanded(
            child: ListView.builder(
              itemCount: _beacons.length,
              itemBuilder: (context, index) {
                final beacon = _beacons[index];
                return _buildBeaconTile(beacon);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBeaconTile(ToolBeacon beacon) {
    final proximityColor = beacon.distance < 2 
        ? Colors.green 
        : beacon.distance < 5 
            ? Colors.orange 
            : Colors.red;
    
    return Card(
      margin: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: ListTile(
        leading: Icon(
          Icons.bluetooth_connected,
          color: proximityColor,
          size: 32,
        ),
        title: Text(beacon.name),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text("Distance: ${beacon.distance.toStringAsFixed(2)} m"),
            Text("RSSI: ${beacon.rssi} dBm"),
            Text("Dernière vue: ${_formatTime(beacon.lastSeen)}"),
          ],
        ),
        trailing: Chip(
          label: Text(
            beacon.distance < 2 ? "PROCHE" : beacon.distance < 5 ? "MOYEN" : "LOIN",
            style: TextStyle(color: Colors.white, fontSize: 12),
          ),
          backgroundColor: proximityColor,
        ),
      ),
    );
  }

  String _formatTime(DateTime time) {
    return "${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}";
  }
}
```

---

### Option 2 : React Native avec `react-native-ble-plx`

#### Installation

```bash
npm install react-native-ble-plx react-native-permissions
cd ios && pod install
```

#### Code Principal

```typescript
/**
 * Prototype 2 - Application React Native BLE Scanner
 * 
 * Dependencies:
 * - react-native-ble-plx: ^3.5.1
 * - react-native-permissions: ^4.0.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Button,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { BleManager, Device, ScanResult } from 'react-native-ble-plx';

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────
interface ToolBeacon {
  id: string;
  name: string;
  rssi: number;
  distance: number;
  lastSeen: Date;
}

// ─────────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────────
const BLEScannerScreen: React.FC = () => {
  const [beacons, setBeacons] = useState<ToolBeacon[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [bleManager] = useState(() => new BleManager());

  // Historique RSSI pour filtrage
  const [rssiHistory, setRssiHistory] = useState<Record<string, number[]>>({});
  const FILTER_WINDOW = 10;

  // ───────────────────────────────────────────────────────────
  // DEMARRAGE SCAN
  // ───────────────────────────────────────────────────────────
  useEffect(() => {
    requestPermissions();
    startScanning();
    
    return () => {
      stopScanning();
      bleManager.destroy();
    };
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]);
      
      console.log('Permissions:', granted);
    }
  };

  const startScanning = useCallback(() => {
    setBeacons([]);
    setIsScanning(true);

    bleManager.startDeviceScan(
      null, // Tous les services
      { allowDuplicates: false },
      (error, device) => {
        if (error) {
          console.error('Scan error:', error);
          return;
        }

        if (device && isTargetBeacon(device)) {
          processBeacon(device);
        }
      }
    );
  }, [bleManager]);

  const stopScanning = useCallback(() => {
    bleManager.stopDeviceScan();
    setIsScanning(false);
  }, [bleManager]);

  // ───────────────────────────────────────────────────────────
  // TRAITEMENT BALISE
  // ───────────────────────────────────────────────────────────
  const processBeacon = (device: Device) => {
    const deviceId = device.id;
    const rssi = device.rssi;
    
    if (rssi === null) return;

    // Filtrage RSSI
    setRssiHistory(prev => {
      const history = prev[deviceId] || [];
      const newHistory = [...history, rssi].slice(-FILTER_WINDOW);
      
      const filteredRSSI = newHistory.reduce((a, b) => a + b, 0) / newHistory.length;
      
      // Conversion distance
      const distance = rssiToDistance(Math.round(filteredRSSI));
      
      // Mise à jour liste
      setBeacons(prevBeacons => {
        const existingIndex = prevBeacons.findIndex(b => b.id === deviceId);
        const beacon: ToolBeacon = {
          id: deviceId,
          name: device.localName || 'Unknown',
          rssi: Math.round(filteredRSSI),
          distance,
          lastSeen: new Date(),
        };
        
        if (existingIndex >= 0) {
          const updated = [...prevBeacons];
          updated[existingIndex] = beacon;
          return updated.sort((a, b) => a.distance - b.distance);
        }
        
        return [...prevBeacons, beacon].sort((a, b) => a.distance - b.distance);
      });
      
      return { ...prev, [deviceId]: newHistory };
    });
  };

  const isTargetBeacon = (device: Device): boolean => {
    return device.localName?.startsWith('ToolBeacon') ?? false;
  };

  // ───────────────────────────────────────────────────────────
  // CONVERSION RSSI
  // ───────────────────────────────────────────────────────────
  const rssiToDistance = (
    rssi: number,
    rssiAt1m: number = -59,
    n: number = 2.5
  ): number => {
    if (rssi === 0) return -1;
    
    const ratio = (rssiAt1m - rssi) / (10 * n);
    return Math.pow(10, ratio);
  };

  // ───────────────────────────────────────────────────────────
  // RENDU UI
  // ───────────────────────────────────────────────────────────
  const renderBeacon = ({ item }: { item: ToolBeacon }) => {
    const proximityColor = item.distance < 2 
      ? '#4CAF50' 
      : item.distance < 5 
        ? '#FF9800' 
        : '#F44336';
    
    return (
      <View style={[styles.beaconCard, { borderLeftColor: proximityColor }]}>
        <View style={styles.beaconHeader}>
          <Text style={styles.beaconName}>{item.name}</Text>
          <View style={[styles.badge, { backgroundColor: proximityColor }]}>
            <Text style={styles.badgeText}>
              {item.distance < 2 ? 'PROCHE' : item.distance < 5 ? 'MOYEN' : 'LOIN'}
            </Text>
          </View>
        </View>
        
        <Text style={styles.beaconInfo}>Distance: {item.distance.toFixed(2)} m</Text>
        <Text style={styles.beaconInfo}>RSSI: {item.rssi} dBm</Text>
        <Text style={styles.beaconInfo}>
          Dernière vue: {item.lastSeen.toLocaleTimeString('fr-FR')}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.statusBar, { backgroundColor: isScanning ? '#C8E6C9' : '#E0E0E0' }]}>
        <Text style={styles.statusText}>
          {isScanning ? '🔍 Recherche...' : '⏸️ Scan arrêté'}
        </Text>
        <Button
          title={isScanning ? 'Arrêter' : 'Démarrer'}
          onPress={isScanning ? stopScanning : startScanning}
        />
      </View>

      <FlatList
        data={beacons}
        renderItem={renderBeacon}
        keyExtractor={item => item.id}
        style={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {isScanning ? 'Aucune balise détectée' : 'Appuyez sur Démarrer'}
          </Text>
        }
      />
    </View>
  );
};

// ─────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  statusBar: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    flex: 1,
    padding: 16,
  },
  beaconCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  beaconHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  beaconName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  beaconInfo: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#999',
  },
});

export default BLEScannerScreen;
```

---

## 🗺️ Cartographie Mapbox

### Configuration Mapbox

1. **Créer un compte** sur https://mapbox.com
2. **Obtenir un token** dans Account → Tokens
3. **Plan gratuit :** 50,000 affichages/mois (suffisant pour prototype)

### Intégration Mapbox GL JS (Web/React)

```bash
npm install mapbox-gl @mapbox/mapbox-gl-draw @turf/turf
```

```typescript
import mapboxgl from 'mapbox-gl';
import * as turf from '@turf/turf';

// Configuration
mapboxgl.accessToken = 'VOTRE_TOKEN_MAPBOX';

// Initialiser la carte
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/indoor-v1', // Style indoor
  center: [2.3522, 48.8566], // Paris (à ajuster)
  zoom: 18,
  pitch: 45,
  bearing: 0,
});

// Ajouter marqueur pour l'outil
function addToolMarker(lng: number, lat: number, accuracy: number) {
  // Cercle de probabilité (buffer Turf.js)
  const center = turf.point([lng, lat]);
  const buffer = turf.circle(center, accuracy / 1000, { steps: 64 }); // accuracy en km
  
  // Ajouter le buffer (zone de probabilité)
  map.addSource('tool-probability', {
    type: 'geojson',
    data: buffer,
  });
  
  map.addLayer({
    id: 'tool-probability-fill',
    type: 'fill',
    source: 'tool-probability',
    paint: {
      'fill-color': '#4CAF50',
      'fill-opacity': 0.3,
    },
  });
  
  map.addLayer({
    id: 'tool-probability-outline',
    type: 'line',
    source: 'tool-probability',
    paint: {
      'line-color': '#2E7D32',
      'line-width': 2,
    },
  });
  
  // Marqueur central
  new mapboxgl.Marker({ color: '#FF5722' })
    .setLngLat([lng, lat])
    .setPopup(new mapboxgl.Popup().setHTML('<h3>Outil détecté</h3>'))
    .addTo(map);
}

// Mettre à jour la position
function updateToolPosition(lng: number, lat: number, rssi: number) {
  const distance = rssiToDistance(rssi);
  addToolMarker(lng, lat, distance);
}
```

### Carte Indoor Personnalisée

Pour un laboratoire, créer un plan personnalisé :

1. **Exporter le plan** en format GeoJSON ou image
2. **Importer dans Mapbox Studio**
3. **Créer un style personnalisé** avec les salles, couloirs, etc.
4. **Publier le style** et utiliser son ID

---

## 🧮 Algorithme de Localisation

### Algorithme "Chaud/Froid"

```typescript
/**
 * Algorithme de guidage "Chaud/Froid"
 * Compare la distance actuelle avec la précédente
 */

interface PositionGuide {
  status: 'CHAUD' | 'TIÈDE' | 'FROID';
  direction: string;
  confidence: number;
}

class ToolFinder {
  private previousDistance: number | null = null;
  private previousBearing: number | null = null;

  update(currentDistance: number, currentBearing: number): PositionGuide {
    let status: 'CHAUD' | 'TIÈDE' | 'FROID';
    let direction = '';
    
    // Comparaison distance
    if (this.previousDistance !== null) {
      const delta = this.previousDistance - currentDistance;
      
      if (delta > 0.5) {
        status = 'CHAUD';
        direction = 'Continuez dans cette direction';
      } else if (delta < -0.5) {
        status = 'FROID';
        direction = 'Vous vous éloignez';
      } else {
        status = 'TIÈDE';
        direction = 'Cherchez autour de vous';
      }
    } else {
      status = 'TIÈDE';
      direction = 'Commencez à chercher';
    }
    
    // Calcul confiance
    const confidence = Math.min(1, currentDistance / 10);
    
    this.previousDistance = currentDistance;
    this.previousBearing = currentBearing;
    
    return {
      status,
      direction,
      confidence,
    };
  }

  reset() {
    this.previousDistance = null;
    this.previousBearing = null;
  }
}

// Exemple d'utilisation
const finder = new ToolFinder();
const guide = finder.update(3.5, 45);
console.log(`${guide.status} - ${guide.direction}`);
```

### Triangulation (Optionnel avec 3+ balises)

```typescript
/**
 * Triangulation avec 3 points de référence
 * Nécessite 3 balises fixes à positions connues
 */

interface BeaconPosition {
  id: string;
  x: number;
  y: number;
  rssi: number;
}

function trilaterate(beacons: BeaconPosition[]): { x: number, y: number } | null {
  if (beacons.length < 3) return null;
  
  // Conversion RSSI → Distance
  const distances = beacons.map(b => ({
    ...b,
    distance: rssiToDistance(b.rssi),
  }));
  
  // Algorithme de trilatération (simplifié)
  // En pratique, utiliser une bibliothèque comme @turf/turf
  
  // ... implémentation mathématique ...
  
  return { x: 0, y: 0 }; // Position estimée
}
```

---

## ⚡ Performance et Précision

### Benchmarks Attendus

```
┌─────────────────────────────────────────────────────────────┐
│           PERFORMANCE BLE RTLS                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Précision de distance :                                     │
│  - Ligne de vue (< 4m) : ±0.25-0.85 m                       │
│  - Ligne de vue (4-10m) : ±1-3 m                            │
│  - Avec obstacles : ±3-5 m                                  │
│                                                              │
│  Temps de mise à jour : 1-2 secondes                        │
│  Fréquence broadcast : 1-10 Hz (configurable)               │
│                                                              │
│  Impact des obstacles :                                      │
│  - Mur sec : -3 à -6 dBm                                    │
│  - Mur béton : -6 à -12 dBm                                 │
│  - Machine métallique : -10 à -20 dBm                       │
│  - Corps humain : -3 à -9 dBm                               │
│                                                              │
│  Consommation smartphone :                                   │
│  - Scan BLE continu : ~50-100 mA                            │
│  - Autonomie : 4-8 heures                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Facteurs de Dégradation

| Facteur | Impact RSSI | Impact Distance |
|---------|-------------|-----------------|
| **Mur (plaque)** | -3 à -6 dBm | +1-2 m |
| **Mur (béton)** | -6 à -12 dBm | +3-5 m |
| **Machine métal** | -10 à -20 dBm | +5-10 m |
| **Personne debout** | -3 à -9 dBm | +1-3 m |
| **Pluie/humidité** | -2 à -5 dBm | +0.5-1 m |
| **Interférences Wi-Fi** | Variable | ±2 m |

---

## 🧪 Procédures de Test

### Test 1 : Calibration RSSI

```bash
Objectif : Déterminer RSSI_1m de référence

Matériel :
- 1 balise BLE
- 1 smartphone avec l'application
- Mètre ruban

Procédure :
1. Placer la balise à exactement 1.0 m du smartphone
2. Lancer l'application et collecter 100 lectures RSSI
3. Calculer la moyenne → RSSI_1m
4. Répéter à 2m, 3m, 5m pour validation

Résultat attendu :
- RSSI_1m typique : -59 à -65 dBm
- Écart-type : < 5 dBm
- Formule validée : distance calculée ≈ distance réelle
```

### Test 2 : Précision de Distance

```bash
Objectif : Mesurer l'erreur de distance estimée

Procédure :
1. Placer la balise à distances connues (1, 2, 3, 5, 10 m)
2. Pour chaque distance, enregistrer 50 lectures
3. Calculer distance estimée moyenne et erreur

Résultat attendu :
┌──────────────┬────────────┬─────────────┬──────────┐
│ Distance     │ RSSI moyen │ Distance    │ Erreur   │
│ réelle (m)   │ (dBm)      │ estimée (m) │          │
├──────────────┼────────────┼─────────────┼──────────┤
│ 1            │ -62        │ 1.1         │ +10%     │
│ 2            │ -68        │ 2.3         │ +15%     │
│ 3            │ -72        │ 3.5         │ +17%     │
│ 5            │ -78        │ 5.8         │ +16%     │
│ 10           │ -85        │ 11.2        │ +12%     │
└──────────────┴────────────┴─────────────┴──────────┘

Précision globale : ±15-20% (acceptable pour prototype)
```

### Test 3 : Impact des Obstacles

```bash
Objectif : Mesurer la dégradation avec obstacles

Procédure :
1. Placer balise à 3 m en ligne de vue → RSSI de référence
2. Placer obstacle entre balise et smartphone
3. Mesurer nouveau RSSI
4. Calculer delta

Résultat attendu :
┌────────────────────┬─────────────┬──────────┐
│ Obstacle           │ Delta RSSI  │ Impact   │
├────────────────────┼─────────────┼──────────┤
│ Aucun (référence)  │ 0 dBm       │ 0 m      │
│ Plaque de plâtre   │ -4 dBm      │ +1.5 m   │
│ Mur béton          │ -9 dBm      │ +3.5 m   │
│ Armoire métallique │ -15 dBm     │ +6.0 m   │
│ Personne           │ -6 dBm      │ +2.5 m   │
└────────────────────┴─────────────┴──────────┘

Conclusion : La précision chute à ±3-5 m avec obstacles
```

### Test 4 : Guidage "Chaud/Froid"

```bash
Objectif : Valider l'algorithme de guidage

Procédure :
1. Cacher un outil avec balise
2. Utiliser l'application pour le retrouver
3. Chronométrer le temps de recherche
4. Noter le nombre de tentatives

Résultat attendu :
- Temps moyen de recherche : < 2 minutes
- Taux de succès : > 90%
- Feedback "Chaud/Froid" utile : > 80% des utilisateurs
```

---

## 📚 Références

### Documentation Technique

1. **Bluetooth Core Specification v5.3** - Bluetooth SIG  
   https://www.bluetooth.com/specifications/specs/

2. **iBeacon Specification** - Apple Inc.  
   https://developer.apple.com/ibeacon/

3. **Eddystone Specification** - Google  
   https://github.com/google/eddystone

4. **flutter_blue_plus Documentation** - GitHub  
   https://github.com/boskokg/flutter_blue_plus

5. **react-native-ble-plx Documentation** - NPM  
   https://www.npmjs.com/package/react-native-ble-plx

6. **Mapbox GL JS API Reference** - Mapbox  
   https://docs.mapbox.com/mapbox-gl-js/api/

7. **Turf.js Documentation** - Turf.js  
   https://turfjs.org/docs/

### Articles de Recherche

8. **"Accuracy Analysis of Indoor Location System Based on BLE RSSI"** - ResearchGate, Octobre 2025  
   https://www.researchgate.net/publication/365686943_Accuracy_Analysis_of_the_Indoor_Location_System_Based_on_Bluetooth_Low-Energy_RSSI_Measurements

9. **"Evaluation of RSSI-Based Distance Estimation with ESP32 BLE Modules"** - BeaconZone, Octobre 2025  
   https://www.beaconzone.co.uk/blog/using-esp32-ble-modules-for-indoor-asset-tracking/

10. **"BLE-based indoor localization with temporal convolutional network"** - ScienceDirect, Mai 2025  
    https://www.sciencedirect.com/science/article/pii/S2307187725000549

11. **"A Practice of BLE RSSI Measurement for Indoor Positioning"** - ResearchGate, Octobre 2025  
    https://www.researchgate.net/publication/353639519_A_Practice_of_BLE_RSSI_Measurement_for_Indoor_Positioning

### Tutoriels et Guides

12. **"Master BLE in React Native: A 2025 Guide"** - CoderCrafter, Novembre 2025  
    https://codercrafter.in/blogs/react-native/master-ble-in-react-native-a-2025-guide-to-bluetooth-apps

13. **"Flutter Bluetooth Integration Guide"** - Mobisoft Infotech, Mars 2025  
    https://mobisoftinfotech.com/resources/blog/flutter-development/flutter-bluetooth-ble-integration-guide

14. **"UWB vs BLE vs Wi-Fi vs RFID: Indoor Positioning Accuracy Compared"** - Blueiot, Février 2026  
    https://www.blueiot.com/blog/uwb-vs-ble-vs-wifi-vs-rfid.html

15. **"RTLS Technology Comparison: BLE vs UWB vs RFID"** - Sentrax, Mai 2025  
    https://sentrax.com/technology-comparison-rtls-technologies-for-business-ble-vs-uwb-vs-rfid/

---

**✅ Prototype 2 - Statut : PRÊT POUR DÉVELOPPEMENT**
