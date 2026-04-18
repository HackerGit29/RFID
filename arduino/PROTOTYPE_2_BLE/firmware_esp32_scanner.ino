/**
 * Prototype 2 : Radar BLE - ESP32 Scanner
 * Rôle : Scanner les balises BLE et envoyer positions
 * 
 * FONCTIONNEMENT :
 * - Scan BLE continu
 * - Filtrage RSSI (moyenne mobile)
 * - Conversion RSSI → Distance
 * - Envoi API vers Supabase
 * 
 * Connexions :
 * - GPIO Aucune (BLE purement logiciel)
 */

#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEScan.h>
#include <BLEAdvertisedDevice.h>
#include <WiFi.h>
#include <HTTPClient.h>

// ─────────────────────────────────────────────────────────────
// CONFIGURATION - MODIFIER ICI
// ─────────────────────────────────────────────────────────────
#define WIFI_SSID        "VOTRE_SSID_WIFI"
#define WIFI_PASSWORD   "VOTRE_MOT_DE_PASSE"
#define API_URL         "https://votre-projet.supabase.co/functions/v1/ble-scan"
#define API_KEY         "votre-anon-key-supabase"

// Configuration scan
#define SCAN_DURATION    5       // Secondes par scan
#define SCAN_INTERVAL   100      // ms entre scans
#define SCAN_WINDOW     100      // ms fenetre active
#define FILTER_RSSI     -90      // RSSI minimum (dBm)

// Filtre RSSI
#define RSSI_HISTORY_SIZE 10

// UUID des balises à tracker (optionnel - sinon toutes)
const char* TARGET_UUIDS[] = {
    "4C000215B19A35785678456789ABCDEF12345678",
    // Ajouter vos UUIDs ici
};
const int NUM_TARGETS = sizeof(TARGET_UUIDS) / sizeof(TARGET_UUIDS[0]);

// ─────────────────────────────────────────────────────────────
// VARIABLES GLOBALES
// ─────────────────────────────────────────────────────────────
BLEScan* pBLEScan;
bool wifiConnected = false;
HTTPClient http;
WiFiClient wifiClient;

// ─────────────────────────────────────────────────────────────
// SETUP
// ─────────────────────────────────────────────────────────────
void setup() {
    Serial.begin(115200);
    Serial.println("\n📡 Radar BLE v1.0");
    Serial.println("====================");

    // Initialisation BLE
    BLEDevice::init("ESP32-BLE-Scanner");
    pBLEScan = BLEDevice::getScan();
    pBLEScan->setActiveScan(true);
    pBLEScan->setInterval(SCAN_INTERVAL);
    pBLEScan->setWindow(SCAN_WINDOW);
    
    Serial.println("✅ Scanner BLE initialisé");

    // Connexion WiFi
    connectWiFi();

    Serial.println("\n🟢 Radar PRÊT");
}

// ─────────────────────────────────────────────────────────────
// LOOP
// ─────────────────────────────────────────────────────────────
void loop() {
    Serial.println("\n📡 Scan en cours...");
    
    BLEScanResults foundDevices = pBLEScan->start(SCAN_DURATION);
    int count = foundDevices.getCount();
    
    Serial.print("🔍 Appareils trouvés: ");
    Serial.println(count);
    
    // Traiter chaque appareil
    for (int i = 0; i < count; i++) {
        BLEAdvertisedDevice device = foundDevices.getDevice(i);
        processDevice(device);
    }
    
    Serial.println("⏳ Prochain scan dans 5s...");
    delay(5000);
}

// ─────────────────────────────────────────────────────────────
// FONCTIONS
// ─────────────────────────────────────────────────────────────

void connectWiFi() {
    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    
    Serial.println("📡 Connexion WiFi...");
    
    unsigned long start = millis();
    while (WiFi.status() != WL_CONNECTED && millis() - start < 10000) {
        delay(500);
        Serial.print(".");
    }
    
    if (WiFi.status() == WL_CONNECTED) {
        wifiConnected = true;
        Serial.println("\n✅ WiFi connecté");
    } else {
        Serial.println("\n❌ WiFi échoué");
    }
}

void processDevice(BLEAdvertisedDevice device) {
    int rssi = device.getRSSI();
    
    // Filtrage RSSI trop faible
    if (rssi < FILTER_RSSI) {
        return;
    }
    
    // Extraction UUID iBeacon
    std::string manufacturerData = device.getManufacturerData();
    
    if (manufacturerData.length() >= 25) {
        // Vérifier Apple company ID (0x004C)
        if (manufacturerData[0] == 0x4C && manufacturerData[1] == 0x00) {
            // C'est un iBeacon
            String beaconUUID = extractBeaconUUID(manufacturerData);
            String beaconMajor = extractBeaconMajor(manufacturerData);
            String beaconMinor = extractBeaconMinor(manufacturerData);
            
            // Conversion RSSI → Distance
            double distance = rssiToDistance(rssi);
            
            Serial.println("📍 Balise iBeacon:");
            Serial.println("  UUID: " + beaconUUID);
            Serial.println("  Major: " + beaconMajor);
            Serial.println("  RSSI: " + String(rssi) + " dBm");
            Serial.println("  Distance: ~" + String(distance, 2) + "m");
            
            // Envoyer vers API
            sendBeaconData(beaconUUID, beaconMajor, beaconMinor, rssi, distance);
        }
    } else {
        // Appareil BLE standard (nom présent)
        if (device.haveName()) {
            Serial.println("📍 Appareil: " + String(device.getName().c_str()) +
                         " RSSI: " + String(rssi) + " dBm");
        }
    }
}

String extractBeaconUUID(std::string data) {
    // Bytes 2-17 = UUID (16 bytes)
    String uuid = "";
    for (int i = 2; i < 18; i++) {
        char hex[3];
        sprintf(hex, "%02X", (uint8_t)data[i]);
        uuid += hex;
        if (i == 3 || i == 5 || i == 7 || i == 9) uuid += "-";
    }
    return uuid;
}

String extractBeaconMajor(std::string data) {
    // Bytes 18-19 = Major
    uint16_t major = (data[18] << 8) | data[19];
    return String(major);
}

String extractBeaconMinor(std::string data) {
    // Bytes 20-21 = Minor
    uint16_t minor = (data[20] << 8) | data[21];
    return String(minor);
}

double rssiToDistance(int rssi, int rssiAt1m, double pathLossExponent) {
    if (rssi == 0) return -1;
    
    double ratio = (rssiAt1m - rssi) / (10 * pathLossExponent);
    return pow(10, ratio);
}

void sendBeaconData(String uuid, String major, String minor, int rssi, double distance) {
    if (!wifiConnected || WiFi.status() != WL_CONNECTED) {
        Serial.println("⚠️ WiFi déconnecté - ignoré");
        return;
    }
    
    http.begin(wifiClient, API_URL);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("apikey", API_KEY);

    String payload = "{\"beacon_uuid\":\"" + uuid + "\",";
    payload += "\"major\":" + major + ",";
    payload += "\"minor\":" + minor + ",";
    payload += "\"rssi\":" + String(rssi) + ",";
    payload += "\"estimated_distance\":" + String(distance, 2) + ",";
    payload += "\"scanner_name\":\"ESP32-BLE-Scanner\"}";
    
    int httpCode = http.POST(payload);
    
    if (httpCode == 200 || httpCode == 201) {
        Serial.println("✅ Données envoyées");
    } else {
        Serial.print("❌ Erreur HTTP: ");
        Serial.println(httpCode);
    }
    
    http.end();
}