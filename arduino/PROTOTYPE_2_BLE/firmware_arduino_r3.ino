/**
 * Prototype 2 : ESP32 comme Balise iBeacon
 * Version alternative Arduino R3 (non supporté nativement)
 * 
 * NOTE: Arduino UNO/R3 n'a pas de BLE intégré!
 * Utiliser module BLE externe (HM-10, CC2541) OU
 * Utiliser ESP32 au lieu de Arduino R3
 * 
 * Ce fichier est un placeholder - voir version ESP32
 */

#include <Arduino.h>

void setup() {
    Serial.begin(115200);
    Serial.println("⚠️ Arduino R3 n'a pas de BLE intégré!");
    Serial.println("Utiliser ESP32 ou module BLE externe (HM-10)");
}

void loop() {
    delay(1000);
}