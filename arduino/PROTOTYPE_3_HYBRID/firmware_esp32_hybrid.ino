/**
 * Prototype 3 : Architecture Hybride RFID + BLE
 * Microcontrôleur : ESP32-WROOM-32
 * 
 * FONCTIONNEMENT :
 * - RFID : Check-in/out via portique (checkToolAccess)
 * - BLE : Scan continu pour localisation (scanBeacons)
 * - Les deux en parallèle sur ESP32 same
 * 
 * NOTE: Utiliser CORE 0 pour RFID, CORE 1 pour BLE
 * pour éviter les blocages
 */

#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <SPI.h>
#include <MFRC522.h>
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEAdvertisedDevice.h>
#include <BLEScan.h>
#include <BLEServer.h>
#include <BLEAdvertising.h>

// ─────────────────────────────────────────────────────────────
// CONFIGURATION - MODIFIER ICI
// ─────────────────────────────────────────────────────────────
#define WIFI_SSID        "VOTRE_SSID_WIFI"
#define WIFI_PASSWORD   "VOTRE_MOT_DE_PASSE"
#define API_URL        "https://votre-projet.supabase.co/functions/v1/hybrid-check"
#define API_KEY        "votre-anon-key-supabase"

// Broches RC522
#define RST_PIN         21
#define SS_PIN          5

// Configuration BLE scan
#define SCAN_DURATION   5    // secondes
#define FILTER_RSSI     -85    // dBm minimum

// Tâches
TaskHandle_t rfidTaskHandle = NULL;
TaskHandle_t bleTaskHandle = NULL;

// Objets globaux
MFRC522 rfid(SS_PIN, RST_PIN);
BLEScan* pBLEScan;
HTTPClient http;
WiFiClient wifiClient;

bool wifiConnected = false;
unsigned long lastReadTime = 0;
bool rfidDetected = false;
bool bleRunning = false;

// ─────────────────────────────────────────────────────────────
// SETUP - Tâche principale
// ─────────────────────────────────────────────────────────────
void setup() {
    Serial.begin(115200);
    Serial.println("\n⚖️ Hybride RFID + BLE v1.0");
    Serial.println("===========================");

    // WiFi
    connectWiFi();

    // RFID
    initRFID();

    // BLE Scanner
    initBLE();

    Serial.println("\n🟢 SYSTÈME HYBRIDE PRÊT");
    Serial.println("RFID: En attente de tag...");
    Serial.println("BLE: Scan actif");

    // Démarrer les tâches sur les deux cores
    xTaskCreatePinnedToCore(
        rfidTask,          // Fonction
        "RFID_Task",       // Nom
        4096,            // Stack size
        NULL,             // Paramètres
        1,               // Priorité
        &rfidTaskHandle,   // Handle
        0                // Core 0
    );

    xTaskCreatePinnedToCore(
        bleTask,
        "BLE_Task",
        4096,
        NULL,
        1,
        &bleTaskHandle,
        1                // Core 1
    );
}

// ─────────────────────────────────────────────────────────────
// LOOP - Non utilisée (tâches sur cores)
// ─────────────────────────────────────────────────────────────
void loop() {
    delay(10000);
    
    static unsigned long lastStatus = 0;
    if (millis() - lastStatus > 15000) {
        lastStatus = millis();
        Serial.println("📊 Status - RFID: " + String(rfidDetected ? "DETECTÉ" : "idle") +
                     " | BLE: " + String(bleRunning ? "ACTIF" : "inactif"));
    }
}

// ─────────────────────────────────────────────────────────────
// TÂCHE RFID (Core 0)
// ─────────────────────────────────────────────────────────────
void rfidTask(void* parameter) {
    Serial.println("✅ Tâche RFID démarrée sur Core 0");
    
    while (true) {
        if (rfidTaskHandle) {
            processRFID();
        }
        delay(100);
    }
}

void processRFID() {
    if (!rfid.PICC_IsNewCardPresent()) {
        rfidDetected = false;
        return;
    }

    if (millis() - lastReadTime < 1000) {
        return;
    }
    lastReadTime = millis();

    if (!rfid.PICC_ReadCardSerial()) {
        return;
    }

    String uid = getUIDString();
    rfidDetected = true;
    
    Serial.println("\n📡[RFID] Tag détecté: " + uid);

    bool authorized = checkToolAccess(uid);

    if (authorized) {
        Serial.println("✅[RFID] AUTORISÉ");
    } else {
        Serial.println("❌[RFID] REFUSÉ");
    }

    rfid.PICC_HaltA();
    rfid.PCD_StopCrypto1();

    delay(2000);
}

// ─────────────────────────────────────────────────────────────
// TÂCHE BLE (Core 1)
// ─────────────────────────────────────────────────────────────
void bleTask(void* parameter) {
    Serial.println("✅ Tâche BLE démarrée sur Core 1");
    
    while (true) {
        if (bleTaskHandle) {
            processBLEScan();
        }
        delay(100);
    }
}

void processBLEScan() {
    bleRunning = true;
    
    BLEScanResults scanResults = pBLEScan->start(SCAN_DURATION);
    int count = scanResults.getCount();
    
    for (int i = 0; i < count; i++) {
        BLEAdvertisedDevice device = scanResults.getDevice(i);
        int rssi = device.getRSSI();
        
        if (rssi < FILTER_RSSI) continue;
        
        // Vérifier iBeacon
        std::string mfgData = device.getManufacturerData();
        if (mfgData.length() >= 25 && mfgData[0] == 0x4C && mfgData[1] == 0x00) {
            double dist = rssiToDistance(rssi);
            
            Serial.println("📍[BLE] iBeacon RSSI=" + String(rssi) + 
                         "dBm Distance=~" + String(dist, 1) + "m");
            
            sendBeaconPosition(device, rssi, dist);
        }
    }
    
    bleRunning = false;
    delay(5000);  // Pause entre scans
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

void initRFID() {
    SPI.begin(18, 19, 23);
    rfid.PCD_Init();
    Serial.println("✅ RC522 RFID initialisé");
}

void initBLE() {
    BLEDevice::init("ESP32-Hybrid-Scanner");
    pBLEScan = BLEDevice::getScan();
    pBLEScan->setActiveScan(true);
    pBLEScan->setInterval(100);
    pBLEScan->setWindow(100);
    Serial.println("✅ Scanner BLE initialisé");
}

String getUIDString() {
    String uid = "";
    for (byte i = 0; i < rfid.uid.size; i++) {
        if (rfid.uid.uidByte[i] < 0x10) uid += "0";
        uid += String(rfid.uid.uidByte[i], HEX);
    }
    uid.toUpperCase();
    return uid;
}

bool checkToolAccess(String uid) {
    if (!wifiConnected) return false;

    http.begin(wifiClient, API_URL);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("apikey", API_KEY);

    String payload = "{\"tool_uid\":\"" + uid + "\",\"source\":\"rfid\"}";
    int code = http.POST(payload);
    
    bool authorized = false;
    if (code == 200) {
        String resp = http.getString();
        authorized = resp.indexOf("\"authorized\":true") > 0;
    }
    
    http.end();
    return authorized;
}

double rssiToDistance(int rssi) {
    const int RSSI_1M = -59;
    const double N = 2.5;
    if (rssi == 0) return -1;
    return pow(10, (RSSI_1M - rssi) / (10 * N));
}

void sendBeaconPosition(BLEAdvertisedDevice& device, int rssi, double distance) {
    if (!wifiConnected) return;
    
    // Extraire UUID iBeacon
    std::string mfg = device.getManufacturerData();
    String uuid = "";
    for (int i = 2; i < 18; i++) {
        char hex[3];
        sprintf(hex, "%02X", (uint8_t)mfg[i]);
        uuid += hex;
    }
    
    http.begin(wifiClient, API_URL);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("apikey", API_KEY);
    
    String payload = "{\"beacon_uuid\":\"" + uuid + "\",";
    payload += "\"rssi\":" + String(rssi) + ",";
    payload += "\"estimated_distance\":" + String(distance, 2) + ",";
    payload += "\"source\":\"ble\"}";
    
    http.POST(payload);
    http.end();
}