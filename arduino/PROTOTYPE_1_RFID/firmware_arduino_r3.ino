/**
 * Prototype 1 : Checkpoint RFID - Firmware Arduino UNO R3
 * Tag : Arduino UNO R3 + RC522 (MFRC522)
 * 
 * NOTE: Arduino UNO работает 5V - ОБЯЗАТЕЛЪН need logic level converter
 * pour RC522 (3.3V!) sinon destruction du module
 * 
 * Fonctionne IDENTIQUE au version ESP32
 * avec les memes librairie et logique
 * 
 * OPTION 1: Level shifter 5V→3.3V sur lignes SPI
 * OPTION 2: Module RC522 avec regulateur 3.3V integre
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

// Broches RC522 (Arduino UNO standard)
#define RST_PIN         9
#define SS_PIN          10

// Broches indicateurs
#define BUZZER_PIN      4
#define LED_GREEN_PIN   5
#define LED_RED_PIN     6

// Paramètres
const unsigned long COOLDOWN_READ = 1000;

// ─────────────────────────────────────────────────────────────
// OBJETS
// ─────────────────────────────────────────────────────────────
MFRC522 rfid(SS_PIN, RST_PIN);
HTTPClient http;
WiFiClient wifiClient;

unsigned long lastReadTime = 0;

// ─────────────────────────────────────────────────────────────
// SETUP
// ─────────────────────────────────────────────────────────────
void setup() {
    Serial.begin(115200);
    Serial.println("\n🔒 Checkpoint RFID - Arduino R3");

    pinMode(BUZZER_PIN, OUTPUT);
    pinMode(LED_GREEN_PIN, OUTPUT);
    pinMode(LED_RED_PIN, OUTPUT);
    
    digitalWrite(BUZZER_PIN, LOW);
    digitalWrite(LED_GREEN_PIN, LOW);
    digitalWrite(LED_RED_PIN, LOW);

    SPI.begin();
    rfid.PCD_Init();
    
    Serial.println("✅ RC522 initialisé");

    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    Serial.println("📡 Connexion WiFi...");
    
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 20) {
        delay(500);
        Serial.print(".");
        attempts++;
    }
    
    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("\n✅ WiFi connecté");
    } else {
        Serial.println("\n⚠️ WiFi échoué");
    }

    Serial.println("\n🟢 Prêt - Présenter un tag...");
}

// ─────────────────────────────────────────────────────────────
// LOOP
// ─────────────────────────────────────────────────────────────
void loop() {
    if (!rfid.PICC_IsNewCardPresent()) {
        delay(50);
        return;
    }

    if (millis() - lastReadTime < COOLDOWN_READ) {
        delay(50);
        return;
    }
    lastReadTime = millis();

    if (!rfid.PICC_ReadCardSerial()) {
        return;
    }

    String uid = getUIDString();
    Serial.println("\n📡 Tag: " + uid);

    bool authorized = checkToolAccess(uid);
    setIndicators(authorized);
    Serial.println(authorized ? "✅ AUTORISÉ" : "❌ REFUSÉ");

    rfid.PICC_HaltA();
    rfid.PCD_StopCrypto1();

    delay(3000);
    resetIndicators();
}

// ─────────────────────────────────────────────────────────────
// FONCTIONS
// ─────────────────────────────────────────────────────────────
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
    if (WiFi.status() != WL_CONNECTED) {
        return false;
    }

    http.begin(wifiClient, API_URL);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("apikey", API_KEY);

    String payload = "{\"tool_uid\":\"" + uid + "\",\"checkpoint_id\":\"CHECKPOINT_01\"}";
    int httpCode = http.POST(payload);

    bool authorized = false;
    if (httpCode == 200) {
        String response = http.getString();
        authorized = response.indexOf("\"authorized\":true") > 0;
    }
    
    http.end();
    return authorized;
}

void setIndicators(bool authorized) {
    if (authorized) {
        digitalWrite(LED_GREEN_PIN, HIGH);
        digitalWrite(LED_RED_PIN, LOW);
        digitalWrite(BUZZER_PIN, LOW);
    } else {
        digitalWrite(LED_GREEN_PIN, LOW);
        digitalWrite(LED_RED_PIN, HIGH);
        
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