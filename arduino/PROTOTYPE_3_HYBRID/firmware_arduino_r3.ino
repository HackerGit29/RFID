/**
 * Prototype 3 : Hybride RFID - Arduino R3
 * 
 * NOTE: Arduino R3 n'a pas de WiFi/BLE intégré!
 * 
 * SOLUTIONS :
 * 1. Arduino R3 + Module ESP-01 (WiFi) + RC522 (RFID) - Complexe
 * 2. Arduino R3 + HM-10 (BLE) + RC522 - Possible
 * 3. Utiliser ESP32 directement - RECOMMANDÉ
 * 
 * Ce placeholder montre la config avec ESP32 uniquement
 */

#include <Arduino.h>

void setup() {
    Serial.begin(115200);
    Serial.println("⚠️ Arduino R3 a besoin d'un module WiFi/BLE externe");
    Serial.println("⚠️ Utiliser ESP32 pour ce prototype");
}

void loop() {
    delay(1000);
}