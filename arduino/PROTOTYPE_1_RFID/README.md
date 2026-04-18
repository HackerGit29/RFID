# 🛠️ Prototype 1 : Checkpoint RFID

**Technologie :** RFID HF (13.56 MHz) avec ESP32 + RC522  
**Microcontrôleur :** ESP32-WROOM-32  
**Lecteur :** MFRC522 / RC522

---

## Broches de Connexion

| RC522 | ESP32 | GPIO | Fonction |
|------|------|------|----------|
| SDA (SS) | GPIO 5 | D5 | Chip Select |
| SCK | GPIO 18 | D18 | SPI Clock |
| MOSI | GPIO 23 | D23 | Master Out Slave In |
| MISO | GPIO 19 | D19 | Master In Slave Out |
| RST | GPIO 21 | D21 | Reset (active low) |
| GND | GND | - | Masse |
| 3.3V | 3.3V | - | Alimentation ⚠️ |

## Composants requis

- ESP32-WROOM-32
- Module RC522 (MFRC522)
- Tags Mifare Classic 1K
- Buzzer actif 5V
- LED rouge + LED verte
- Résistances 220Ω

## Installation Bibliothèques

```bash
# Via Arduino IDE Library Manager
# Installer :
# - MFRC522 by Dr.Octobre (communauté)
# - ArduinoJson by Benoit Blanchon
```

## Tests

- ✅ Testé sur ESP32-WROOM-32
- ✅ Compatible Arduino R3 (ajuster tensions)
- ⚠️ RC522 nécessite 3.3V parfaitement régulé