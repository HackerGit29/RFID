# 📡 Prototype 2 : Radar BLE

**Technologie :** Bluetooth Low Energy (BLE)  
**Objectif :** Localisation temps réel via balises iBeacon  

---

## Matériel

| Composant | Rôle |
|-----------|------|
| ESP32-WROOM-32 | Scanner BLE + WiFi |
| Balises iBeacon | Émetteurs sur outils |
| Smartphone (optionnel) | Alternative scan |

## Code

- `firmware_esp32_scanner.ino` - ESP32 comme scanner BLE → API
- `firmware_esp32_beacon.ino` - ESP32 comme balise beacon (émetteur)

## Tests

- ✅ ESP32 scanner fonctionnel
- ✅ Compatible beacon standard iBeacon