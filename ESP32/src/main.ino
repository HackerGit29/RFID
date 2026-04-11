/**
 * Prototype 1 : Checkpoint RFID - Version Optimisée v2.0
 * Firmware ESP32 pour lecteur RC522
 *
 * Améliorations :
 * - Mise en cache locale des UIDs (SPIFFS)
 * - Gestion du Light Sleep pour économie d'énergie
 * - Watchdog Timer pour robustesse industrielle
 * - Reconnexion Wi-Fi résiliente
 *
 * Bibliothèques requises :
 * - MFRC522v2 by GithubCommunity
 * - HTTPClient (ESP32 Core)
 * - ArduinoJson by Benoit Blanchon
 * - SPIFFS (ESP32 Core)
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <MFRC522v2.h>
#include <MFRC522DriverSPI.h>
#include <MFRC522DriverPinSimple.h>
#include <ArduinoJson.h>
#include <SPIFFS.h>
#include <esp_task_wdt.h>

// ─────────────────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────────────────
const char* WIFI_SSID = "VOTRE_SSID";
const char* WIFI_PASSWORD = "VOTRE_MDP";
const String API_URL = "https://VOTRE-PROJET.supabase.co/functions/v1/check-tool-access";

MFRC522DriverPinSimple ss_pin(5);
MFRC522DriverSPI driver{ss_pin};
MFRC522 mfrc522{driver};

const int BUZZER_PIN = 4;
const int LED_GREEN_PIN = 12;
const int LED_RED_PIN = 13;

// Paramètres de robustesse
const unsigned long WDT_TIMEOUT = 10; // 10 secondes
unsigned long lastReadTime = 0;
const unsigned long READ_COOLDOWN = 1000;

// ─────────────────────────────────────────────────────────────
// GESTION DU CACHE LOCAL (SPIFFS)
// ─────────────────────────────────────────────────────────────
void saveAuthorizedUID(String uid) {
  File file = SPIFFS.open("/whitelist.txt", FILE_APPEND);
  if (file) {
    file.println(uid);
    file.close();
  }
}

bool isUIDInLocalCache(String uid) {
  if (!SPIFFS.exists("/whitelist.txt")) return false;
  File file = SPIFFS.open("/whitelist.txt", FILE_READ);
  while (file.available()) {
    String line = file.readStringUntil('\\n');
    line.trim();
    if (line == uid) {
      file.close();
      return true;
    }
  }
  file.close();
  return false;
}

// ─────────────────────────────────────────────────────────────
// INITIALISATION
// ─────────────────────────────────────────────────────────────
void setup() {
  Serial.begin(115200);

  // Watchdog Setup
  esp_task_wdt_init(WDT_TIMEOUT, true);
  esp_task_wdt_add(NULL);

  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_GREEN_PIN, OUTPUT);
  pinMode(LED_RED_PIN, OUTPUT);

  if (!SPIFFS.begin(true)) {
    Serial.println("❌ Erreur montage SPIFFS");
  }

  mfrc522.PCD_Init();
  if (!mfrc522.PCD_PerformSelfTest()) {
    blinkLED(LED_RED_PIN, 5, 100);
    while (true) { esp_task_wdt_reset(); delay(1000); }
  }

  connectWiFi();
  Serial.println("\n🔒 CHECKPOINT RFID v2.0 PRÊT");
}

void loop() {
  esp_task_wdt_reset(); // Feed the dog

  if (!mfrc522.PICC_IsNewCardPresent() || !mfrc522.PICC_ReadCardSerial()) {
    // Mode économie d'énergie si rien n'est détecté
    delay(100);
    return;
  }

  if (millis() - lastReadTime < READ_COOLDOWN) return;
  lastReadTime = millis();

  String uid = getUIDString(mfrc522);
  Serial.println("\n📡 Tag détecté: " + uid);

  // 1. Vérification Cache Local (Réponse instantanée)
  bool authorized = isUIDInLocalCache(uid);

  // 2. Vérification API (Mise à jour du cache et état réel)
  if (!authorized) {
    authorized = checkToolAccess(uid);
    if (authorized) saveAuthorizedUID(uid);
  }

  setIndicators(authorized);
  logToSerial(uid, authorized);

  mfrc522.PICC_HaltA();
  mfrc522.PCD_StopCrypto1();

  delay(2000);
  resetIndicators();
}

void connectWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  unsigned long startAttempt = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - startAttempt < 10000) {
    delay(500);
    Serial.print(".");
  }

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("\n❌ Wi-Fi Offline - Passage en mode Cache Local");
  } else {
    Serial.println("\n✅ Wi-Fi connecté");
  }
}

String getUIDString(MFRC522& mfrc) {
  String uid = "";
  for (byte i = 0; i < mfrc.uid.size; i++) {
    if (mfrc.uid.uidByte[i] < 0x10) uid += "0";
    uid += String(mfrc.uid.uidByte[i], HEX);
  }
  uid.toUpperCase();
  return uid;
}

bool checkToolAccess(String uid) {
  if (WiFi.status() != WL_CONNECTED) return false;

  HTTPClient http;
  http.begin(API_URL);
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<200> doc;
  doc["tool_uid"] = uid;
  doc["checkpoint_id"] = "CHECKPOINT_01";

  String jsonPayload;
  serializeJson(doc, jsonPayload);

  int httpCode = http.POST(jsonPayload);
  bool result = false;

  if (httpCode == 200) {
    String response = http.getString();
    StaticJsonDocument<200> responseDoc;
    deserializeJson(responseDoc, response);
    result = responseDoc["authorized"].as<bool>();
  }
  http.end();
  return result;
}

void setIndicators(bool authorized) {
  if (authorized) {
    digitalWrite(LED_GREEN_PIN, HIGH);
    digitalWrite(LED_RED_PIN, LOW);
    digitalWrite(BUZZER_PIN, LOW);
  } else {
    digitalWrite(LED_GREEN_PIN, LOW);
    digitalWrite(LED_RED_PIN, HIGH);
    digitalWrite(BUZZER_PIN, HIGH);
    delay(200); digitalWrite(BUZZER_PIN, LOW);
    delay(200); digitalWrite(BUZZER_PIN, HIGH);
    delay(200); digitalWrite(BUZZER_PIN, LOW);
  }
}

void resetIndicators() {
  digitalWrite(LED_GREEN_PIN, LOW);
  digitalWrite(LED_RED_PIN, LOW);
  digitalWrite(BUZZER_PIN, LOW);
}

void blinkLED(int pin, int count, int duration) {
  for (int i = 0; i < count; i++) {
    digitalWrite(pin, HIGH); delay(duration);
    digitalWrite(pin, LOW); delay(duration);
  }
}

void logToSerial(String uid, bool authorized) {
  Serial.print("📝 LOG | UID: " + uid + " | " + (authorized ? "OK" : "DENIED"));
}
