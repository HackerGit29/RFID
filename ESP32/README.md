# ⚙️ Setup du Prototype RFID (ESP32)

Ce dossier contient tout le nécessaire pour déployer le checkpoint de sécurité RFID.

## 📦 Matériel Requis
- ESP32 Dev Module
- Lecteur RC522 (RFID HF 13.56 MHz)
- Tags Mifare Classic 1K
- LEDs (Verte, Rouge) + Résistances 220Ω
- Buzzer Actif 5V
- Breadboard et câbles Dupont

## 🔌 Câblage (Pinout)
| Composant | Pin RC522 | Pin ESP32 | GPIO |
|-----------|-----------|-----------|------|
| SPI | SDA (SS) | GPIO 5 | D5 |
| SPI | SCK | GPIO 18 | D18 |
| SPI | MOSI | GPIO 23 | D23 |
| SPI | MISO | GPIO 19 | D19 |
| Reset | RST | GPIO 21 | D21 |
| Power | 3.3V | 3.3V | ⚠️ NE PAS METTRE 5V |
| GND | GND | GND | Masse |

**Indicateurs:**
- Buzzer: GPIO 4
- LED Verte: GPIO 12
- LED Rouge: GPIO 13

## 🚀 Installation Logicielle

### 1. Configuration Arduino IDE
- Installez l'Arduino IDE.
- Ajoutez l'URL du gestionnaire de cartes ESP32 : `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`
- Installez la carte **"esp32 by Espressif Systems"**.

### 2. Bibliothèques à installer
Via le Gestionnaire de Bibliothèques (Ctrl+Shift+I) :
- `MFRC522v2` by GithubCommunity
- `ArduinoJson` by Benoit Blanchon

### 3. Configuration du Code
Ouvrez `src/main.ino` et modifiez :
- `WIFI_SSID` : Votre nom de réseau Wi-Fi.
- `WIFI_PASSWORD` : Votre mot de passe Wi-Fi.
- `API_URL` : L'URL de votre Supabase Edge Function.

### 4. Téléversement
- Sélectionnez la carte : **ESP32 Dev Module**.
- Sélectionnez le bon Port COM.
- Cliquez sur **Téléverser**.

## 🛠️ Tests de Validation
1. **Boot:** Vérifiez dans le moniteur série (115200 bauds) que "✅ RC522 prêt" s'affiche.
2. **Connexion:** Vérifiez que "✅ Wi-Fi connecté" s'affiche.
3. **Accès:**
   - Tag Autorisé $\rightarrow$ LED Verte $\checkmark$
   - Tag Verrouillé $\rightarrow$ LED Rouge + Buzzer $\checkmark$
