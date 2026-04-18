/**
 * Prototype 2 : ESP32 comme Balise iBeacon
 * Rôle : Émettre comme balise BLE (alternative aux beacons commerciaux)
 * 
 * NOTE: Consomme plus qu'un beacon dédiés (6-12 mois vs 2-5 ans)
 * Utiliser uniquement pour tests/développement
 * 
 * Paramètres iBeacon :
 * - UUID: 4C000215B19A35785678456789ABCDEF12345678
 * - Major: 1 (categorie)
 * - Minor: 1-9999 (ID unique outil)
 * - TX Power: -59 dBm (calibré à 1m)
 */

#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>
#include <BLEAdvertising.h>

// ─────────────────────────────────────────────────────────────
// CONFIGURATION iBEACON
// ─────────────────────────────────────────────────────────────
#define BEACON_UUID        "4C000215-B19A-3578-5678-4567-89ABCDEF1234"
#define BEACON_MAJOR       1      // Catégorie инструмента
#define BEACON_MINOR       1      // ID outil (1-9999)
#define BEACON_TX_POWER    -59     // dBm à 1 metre

// Nom de l'appareil
#define DEVICE_NAME        "ToolBeacon_01"

// ─────────────────────────────────────────────────────────────
// VARIABLES
// ─────────────────────────────────────────────────────────────
BLEAdvertising *pAdvertising;
bool beaconRunning = false;

// ─────────────────────────────────────────────────────────────
// SETUP
// ─────────────────────────────────────────────────────────────
void setup() {
    Serial.begin(115200);
    Serial.println("\n📡 iBeacon ESP32 v1.0");
    Serial.println("====================");

    // Initialisation BLE
    BLEDevice::init(DEVICE_NAME);
    
    pAdvertising = BLEDevice::getAdvertising();
    
    // Configuration payload iBeacon
    setBeaconPayload();
    
    Serial.println("✅ Beacon configuré");
    Serial.println("UUID: " String(BEACON_UUID));
    Serial.println("Major: " + String(BEACON_MAJOR));
    Serial.println("Minor: " + String(BEACON_MINOR));
    
    startBeacon();
}

// ─────────────────────────────────────────────────────────────
// LOOP
// ─────────────────────────────────────────────────────────────
void loop() {
    // Le broadcasting est géré automatiquement par le stack BLE
    // Pas de code requis dans la loop
    
    // Pause longue pour eviter surchargeSerie
    delay(10000);
    
    // Affichage periodique
    static unsigned long lastStatus = 0;
    if (millis() - lastStatus > 30000) {
        lastStatus = millis();
        Serial.println("📡 Beacon broadcasting...");
    }
}

// ─────────────────────────────────────────────────────────────
// FONCTIONS
// ─────────────────────────────────────────────────────────────

void setBeaconPayload() {
    // Construct payload iBeacon
    // Format: Flags + Manufacturer Data (Apple) + iBeacon
    
    std::string payload;
    
    // 1. Flags (02 01 06) - LE General Discoverable + BR/EDR
    payload += (char)0x02;
    payload += (char)0x01;
    payload += (char)0x06;
    
    // 2. Manufacturer Specific Data (1A FF) - Apple
    payload += (char)0x1A;
    payload += (char)0xFF;
    
    // 3. Apple iBeacon (02 15)
    payload += (char)0x02;
    payload += (char)0x15;
    
    // 4. UUID (16 bytes) - Parse from string
    String uuid = BEACON_UUID;
    uuid.replace("-", "");
    
    for (int i = 0; i < 16; i += 2) {
        String byteStr = uuid.substring(i, i + 2);
        char byteVal = (char)strtol(byteStr.c_str(), NULL, 16);
        payload += byteVal;
    }
    
    // 5. Major (2 bytes, big-endian)
    payload += (char)((BEACON_MAJOR >> 8) & 0xFF);
    payload += (char)(BEACON_MAJOR & 0xFF);
    
    // 6. Minor (2 bytes, big-endian)
    payload += (char)((BEACON_MINOR >> 8) & 0xFF);
    payload += (char)(BEACON_MINOR & 0xFF);
    
    // 7. TX Power (1 byte, signed int8)
    payload += (char)BEACON_TX_POWER;
    
    // Appliquer le payload
    pAdvertising->setManufacturerData(payload);
    
    // Parametres supplementaires
    pAdvertising->setMinPreferred(0x06);
    pAdvertising->setMinPreferred(0x06);
}

void startBeacon() {
    // Demarrer le broadcasting
    pAdvertising->start();
    beaconRunning = true;
    
    Serial.println("\n🟢 Beacon ACTIVÉ");
    Serial.println("Prêt pour détection par smartphone/app");
}

void stopBeacon() {
    pAdvertising->stop();
    beaconRunning = false;
    Serial.println("\n🔴 Beacon ARRÊTÉ");
}