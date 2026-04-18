/**
 * Prototype 1 : Checkpoint RFID - Firmware ESP32
 * Tag : ESP32-WROOM-32 + RC522 (MFRC522)
 * 
 * FONCTIONNEMENT :
 * - Lecture UID RFID via SPI
 * - Vérification via API HTTP
 * - Indicateurs LED + Buzzer
 * 
 * Connexions RC522 → ESP32 :
 * - SDA  → GPIO 5
 * - SCK  → GPIO 18
 * - MOSI → GPIO 23
 * - MISO → GPIO 19
 * - RST  → GPIO 21
 * - 3.3V → 3.3V (PAS 5V !)
 * - GND  → GND
 * 
 * Indicateurs :
 * - GPIO 4  → Buzzer (+)
 * - GPIO 12 → LED Verte (+, R=220Ω)
 * - GPIO 13 → LED Rouge (+, R=220Ω)
 */

#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <SPI.h>
#include <MFRC522.h>

// ─────────────────────────────────────────────────────────────
// CONFIGURATION - MODIFIER ICI
// ─────────────────────────────────────────────────────────────
#define WIFI_SSID        "VOTRE_SSID_WIFI"
#define WIFI_PASSWORD   "VOTRE_MOT_DE_PASSE"
#define API_URL         "https://votre-projet.supabase.co/functions/v1/check-tool-access"
#define API_KEY         "votre-anon-key-supabase"

// Broches RC522
#define RST_PIN         21
#define SS_PIN          5

// Broches indicateurs
#define BUZZER_PIN      4
#define LED_GREEN_PIN   12
#define LED_RED_PIN    13

// Paramètres
const unsigned long COOLDOWN_READ = 1000;   // ms entre lectures
const unsigned long WIFI_TIMEOUT = 10000;  // ms timeout WiFi

// ─────────────────────────────────────────────────────────────
// OBJETS globaux
// ─────────────────────────────────────────────────────────────
MFRC522 rfid(SS_PIN, RST_PIN);  // Instance RC522
HTTPClient http;
WiFiClient wifiClient;

unsigned long lastReadTime = 0;
bool wifiConnected = false;

// ─────────────────────────────────────────────────────────────
// SETUP
// ─────────────────────────────────────────────────────────────
void setup() {
    Serial.begin(115200);
    Serial.println("\n🔒 Checkpoint RFID v1.0");
    Serial.println("======================");

    // Configuration broches
    pinMode(BUZZER_PIN, OUTPUT);
    pinMode(LED_GREEN_PIN, OUTPUT);
    pinMode(LED_RED_PIN, OUTPUT);
    
    digitalWrite(BUZZER_PIN, LOW);
    digitalWrite(LED_GREEN_PIN, LOW);
    digitalWrite(LED_RED_PIN, LOW);

    // Initialisation SPI
    SPI.begin(18, 19, 23);  // SCK, MISO, MOSI
    rfid.PCD_Init();
    
    Serial.println("✅ RC522 initialisé");

    // Test RC522
    byte v = rfid.PCD_ReadRegister(MFRC522::VersionReg);
    Serial.print("🔍 Version芯片: 0x");
    Serial.println(v, HEX);
    if (v == 0x00 || v == 0xFF) {
        Serial.println("⚠️ Vérifier connexions RC522");
    }

    // Connexion WiFi
    connectWiFi();

    Serial.println("\n🟢 Checkpoint PRÊT");
    Serial.println("Présenter un tag RFID...");
}

// ─────────────────────────────────────────────────────────────
// LOOP
// ────���────────────────────────────────────────────────────────
void loop() {
    // Vérification présence tag
    if (!rfid.PICC_IsNewCardPresent()) {
        delay(50);
        return;
    }

    // Anti-rebond
    if (millis() - lastReadTime < COOLDOWN_READ) {
        delay(50);
        return;
    }
    lastReadTime = millis();

    // Lecture UID
    if (!rfid.PICC_ReadCardSerial()) {
        return;
    }

    // Extraction UID
    String uid = getUIDString();
    Serial.println("\n📡 Tag détecté: " + uid);

    // Vérification état outil
    bool authorized = checkToolAccess(uid);

    // Action selon réponse
    setIndicators(authorized);

    // Log
    Serial.println(authorized ? "✅ AUTORISÉ" : "❌ REFUSÉ");

    // Arrêt communication
    rfid.PICC_HaltA();
    rfid.PCD_StopCrypto1();

    // Reset indicateurs après délai
    delay(3000);
    resetIndicators();
}

// ─────────────────────────────────────────────────────────────
// FONCTIONS
// ─────────────────────────────────────────────────────────────

void connectWiFi() {
    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    
    Serial.println("📡 Connexion WiFi...");
    
    unsigned long start = millis();
    while (WiFi.status() != WL_CONNECTED && millis() - start < WIFI_TIMEOUT) {
        delay(500);
        Serial.print(".");
    }
    
    if (WiFi.status() == WL_CONNECTED) {
        wifiConnected = true;
        Serial.println("\n✅ WiFi connecté");
        Serial.print("📍 IP: ");
        Serial.println(WiFi.localIP());
    } else {
        wifiConnected = false;
        Serial.println("\n❌ WiFi échoué - Mode dégradé");
    }
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
    // Hors ligne : tentative
    if (!wifiConnected || WiFi.status() != WL_CONNECTED) {
        Serial.println("⚠️ WiFi déconnecté - REFUSÉ par sécurité");
        return false;
    }

    // Requête HTTP
    http.begin(wifiClient, API_URL);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("apikey", API_KEY);
    http.addHeader("Authorization", "Bearer " + String(API_KEY));

    // Payload JSON
    String payload = "{\"tool_uid\":\"" + uid + "\",\"checkpoint_id\":\"CHECKPOINT_01\"}";
    
    Serial.println("📤 Requête API...");
    int httpCode = http.POST(payload);

    bool authorized = false;
    
    if (httpCode == 200) {
        String response = http.getString();
        Serial.println("📥 Réponse: " + response);
        
        // Parsing JSON simple
        authorized = response.indexOf("\"authorized\":true") > 0;
    } else {
        Serial.print("❌ Erreur HTTP: ");
        Serial.println(httpCode);
    }
    
    http.end();
    return authorized;
}

void setIndicators(bool authorized) {
    if (authorized) {
        // VERT - Autorisé
        digitalWrite(LED_GREEN_PIN, HIGH);
        digitalWrite(LED_RED_PIN, LOW);
        digitalWrite(BUZZER_PIN, LOW);
    } else {
        // ROUGE + BIPs - Refusé
        digitalWrite(LED_GREEN_PIN, LOW);
        digitalWrite(LED_RED_PIN, HIGH);
        
        // 3 bips
        for (int i = 0; i < 3; i++) {
            digitalWrite(BUZZER_PIN, HIGH);
            delay(150);
            digitalWrite(BUZZER_PIN, LOW);
            delay(150);
        }
    }
}

void resetIndicators() {
    digitalWrite(LED_GREEN_PIN, LOW);
    digitalWrite(LED_RED_PIN, LOW);
    digitalWrite(BUZZER_PIN, LOW);
}