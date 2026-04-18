# ⚖️ Prototype 3 : Architecture Hybride RFID + BLE

**Objectif :** Combiner RFID (check-in/out) + BLE (localisation)  

---

## Concept

| Technologie | Rôle | Sur quels outils |
|-------------|------|----------------|
| **RFID** | Check-in/out précis | Petits outils (<€50) |
| **BLE** | Localisation continue | Équipements majeurs |
| **Les deux** | Maximum visibilité | Outils moyens (€50-500) |

## Fichiers

- `firmware_esp32_hybrid.ino` - Les deux systèmes sur ESP32 unique
- `api_edge_function/` - Backend unifié

## Architecture

```
[OUTIL] → [PORTIQUE RFID] → [ESP32] → [API] → [DB]
              ↓
[SMARTPHONE] → [SCAN BLE] → [APP Mobile] → [MAP]
```

## Tests

- ✅ ESP32 + RC522 + BLE scan simultanés validés