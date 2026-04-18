# Documentation détaillée des prototypes

Ce document explique, de manière structurée et orientée développeur/ingénieur, le fonctionnement de chaque prototype (RFID et BLE), comment utiliser et déployer le code Arduino/ESP32, la logique métier derrière chaque prototype, et le comportement attendu de l'application mobile (Android). Références techniques et emplacements de code sont indiqués pour faciliter la prise en main.

Table des matières

1. Introduction rapide
2. Prototype 1 — Checkpoint RFID
   - But et scénario d'usage
   - Matériel et câblage
   - Firmware (Arduino / ESP32) : structure et explication du code
   - Logique métier et décisions (autorisation, cache, logs)
   - API et format d'échange
   - Mise en service, tests et dépannage
3. Prototype 2 — Radar BLE (RTLS)
   - But et scénario d'usage
   - Balises et options matérielles
   - Beacon (ESP32) : code d'exemple et explication
   - Application mobile : scan, filtrage RSSI, conversion distance
   - Logique métier (hot/warm/cold, clustering, historique)
   - Calibration et tests sur site
4. Application Android / mobile — expérience, flux et intégration
   - Écrans et parcours utilisateur
   - Permissions et contraintes (background, Android 8+ politiques)
   - Stockage local (sql.js) et synchronisation avec Supabase
   - Interactions avec firmware et backend
5. Schéma d'intégration global (séquences)
6. Consignes pratiques (sécurité, production, variables)
7. Emplacements de code importants
8. Annexes : commandes rapides et checklist de déploiement

---

1. Introduction rapide

Ce projet combine deux prototypes complémentaires :

- Prototype 1 (RFID) : portique/lecteur RC522 + ESP32 pour check-in / check-out déterministe des outils (détection binaire, latence < 1s). Utilise HTTP vers une Edge Function / API (Supabase) et stocke/insère des logs.
- Prototype 2 (BLE) : balises BLE (iBeacon/Eddystone ou ESP32 en beacon) et application mobile qui scanne, filtre le RSSI, estime la distance et guide l'utilisateur (Chaud / Froid) pour retrouver un outil. Permet localisation continue et historiques.

L'approche hybride combine ces deux flux : RFID pour points fixes et sécurité, BLE pour localisation mobile et recherche d'objets.

---

2. Prototype 1 — Checkpoint RFID

But et scénario d'usage

- Objectif : Empêcher la sortie non autorisée d'outils et enregistrer automatiquement les passages via un portique RFID.
- Scénario typique : Un opérateur passe un outil devant le lecteur RC522 du portique, l'ESP32 lit l'UID du tag, vérifie localement (cache) puis interroge une API backend pour confirmer l'autorisation. Le portique indique OK/REFUS via LED + buzzer et envoie un log horodaté au backend.

Matériel et câblage

- Composants principaux : ESP32-WROOM-32, module MFRC522/RC522, tags Mifare Classic 1K, buzzer, LED verte/rouge, résistances 220Ω, alimentation 3.3V.
- Schéma : connexions SPI (SDA/SS, SCK, MOSI, MISO) entre RC522 et ESP32; GPIOs dédiés pour LED et buzzer. (Voir `01-PROTOTYPE-1-RFID.md`, section "Schéma de câblage").

Firmware (Arduino / ESP32) : structure et explication du code

Le firmware distribué (dans `01-PROTOTYPE-1-RFID.md`) suit ces responsabilités :

- Initialisation matérielle : SPI, driver MFRC522, SPIFFS (cache), GPIOs pour LED/buzzer, Watchdog Timer.
- Gestion Wi‑Fi : connexion résiliente avec timeout et mode "cache local" si hors ligne.
- Boucle principale : détection de nouvelle carte, lecture UID, gestion cooldown pour éviter lectures multiples.
- Vérification autorisation :
  - 1) Consultation du cache local (fichier `/whitelist.txt` sur SPIFFS) pour réponse instantanée.
  - 2) Si absent, appel HTTP POST à `API_URL` (Edge Function Supabase) avec payload JSON { tool_uid, checkpoint_id }.
  - 3) Si API renvoie authorized=true, on ajoute l'UID au cache local pour accélérer prochaines lectures.
- Actions physiques : mise à jour des LEDs et du buzzer selon authorized.
- Log série & robustesse : écriture d'un log série, gestion Watchdog, redémarrages contrôlés.

Points d'attention dans le code (traduction des blocs importants)

- getUIDString(mfrc522) : formate l'UID en hex majuscule sans séparateurs.
- isUIDInLocalCache(uid) / saveAuthorizedUID(uid) : lecture/écriture SPIFFS.
- checkToolAccess(uid) : effectue POST JSON et lit la propriété `authorized` dans la réponse.
- READ_COOLDOWN : empirique pour filtrer rebonds (e.g., 1000 ms). À ajuster selon portique et trafic.
- Watchdog : protège contre freezes lors de lectures ou connexions réseau instables.

Logique métier et décisions

- Autorisation : déterminée par la table `tools` côté backend (champ `state` ou règle métier). Le checkpoint envoie `checkpoint_id` pour que le backend applique des règles (p.ex. interdiction de sortie si outil non assigné).
- Cache local : optimisation pour délivrer une UX instantanée même si réseau lent. Attention : la logique de sécurité ne doit pas se reposer uniquement sur le cache (synchroniser periodically ou valider côté backend). Le firmware prend le cache comme optimisation, pas comme source de vérité à long terme.
- Direction IN/OUT : le firmware ne détecte pas la direction automatiquement — la logique de "IN/OUT" est résolue soit par l'UI (scénarios), soit par comparaison d'état antérieur dans le backend (si le tool était 'in_use' alors une détection peut être un OUT, etc.).

API et format d'échange

- Endpoint attendu : POST JSON vers `API_URL` (Edge Function) — exemple `https://.../functions/v1/check-tool-access`.
- Payload :

```json
{
  "tool_uid": "A1B2C3D4",
  "checkpoint_id": "CHECKPOINT_01"
}
```

- Réponse attendue (HTTP 200) :

```json
{
  "authorized": true,
  "reason": "assigned_to:user@example.com",
  "updated_state": "in_use"
}
```

- L'Edge Function doit aussi insérer une ligne dans `rfid_logs` ou `tool_logs` (voir SQL dans `01-PROTOTYPE-1-RFID.md`).

Mise en service, tests et dépannage

- Préparer Arduino IDE / PlatformIO, configurer la carte ESP32 et installer bibliothèques (MFRC522v2, ArduinoJson).
- Mettre à jour `WIFI_SSID`, `WIFI_PASSWORD`, `API_URL` puis téléverser.
- Tests : ajouter UID connu en base, approcher tag, vérifier LED verte + log sur Supabase.
- Dépannage courant : vérifier alimentation 3.3V (RC522 ne supporte pas 5V), vérifier connexions SPI, surveiller logs série, vérifier que SPIFFS est monté.

---

3. Prototype 2 — Radar BLE (RTLS)

But et scénario d'usage

- Objectif : Localiser en temps réel des outils équipés d'une balise BLE (ou d'une balise DIY basée sur ESP32) et aider un opérateur à retrouver des objets via feedback visuel et haptique.

Balises et options matérielles

- Options : balises commerciales iBeacon/Eddystone (préconisées) ou ESP32 programmés en beacon pour prototypage.
- Tradeoffs : balise commerciale = autonomie longue et simplicité; ESP32 = flexibilité mais consommation accrue.

Beacon (ESP32) : code d'exemple et explication

- Le repo contient un exemple d'ESP32 en beacon iBeacon (dans `02-PROTOTYPE-2-BLE.md`) ; le payload manufacture inclut UUID, Major, Minor, TX power.
- Pour une balise commerciale, il suffit de configurer UUID/Major/Minor et la fréquence (1-10 Hz).
- TX Power calibré à 1m (p.ex. -59 dBm) est crucial pour convertir RSSI -> distance.

Application mobile : scan, filtrage RSSI, conversion distance

- Le mobile scanne en continu (ou en sessions) et reçoit : MAC/advertisement, RSSI, timestamp.
- Filtrage du RSSI : les fluctuations sont fortes — utiliser Kalman ou moving average (exemples fournis). Le repo propose un `MovingAverageFilter` et un `RSSIFilter` (Kalman-like) avec paramètres ajustables.
- Conversion RSSI→distance : modèle log-distance path loss (formule : distance = 10^((RSSI_1m - RSSI_mesuré) / (10*n))). Calibrer RSSI_1m sur site.

Logique métier (hot/warm/cold, clustering, historique)

- États utilisateur :
  - HOT : proche (p.ex. distance < 2 m) → retour haptique + visuel fort
  - WARM : proche relatif (2–8 m)
  - COLD : loin (> 8 m)
- Clustering : regrouper signaux proches (même beacon UUID) et afficher des clusters sur carte pour réduire bruit visuel.
- Historique : stocker positions vu par les scanners dans `ble_positions` ; utile pour analyser déplacements et créer heatmaps.

Calibration et tests sur site

- Calibration RSSI : placer la balise à 1m, collecter 100 samples, calculer moyenne → RSSI_1m.
- Mesures sur 2m/3m/5m pour ajuster pathLossExponent (n) (valeurs typiques 2.5–4.0 en intérieur).
- Tests pratiques : comparer positions estimées à position réelle sur carte, vérifier répétabilité.

---

4. Application Android / mobile — expérience, flux et intégration

Écrans et parcours utilisateur

- Écrans principaux (références en `src/screens/`): SplashScreen, HomeDashboard, InventoryList, BLERadar, ToolDetail, RSSICalibration.
- Parcours principal : démarrer app → écran Radar → scanner automatique → lister balises détectées → sélection d'un outil → afficher carte + statut chaud/froid + historique.

Permissions et contraintes

- Android (SDK 26+): runtime permissions BLUETOOTH_SCAN, BLUETOOTH_CONNECT, ACCESS_FINE_LOCATION (selon version Android). Sur Android 10+ et 12+, restrictions supplémentaires pour scan en arrière-plan et for foreground service si scan continu.
- Recommandation : demander permissions au runtime, expliquer pourquoi (UX), demander au user d'activer localisation si nécessaire.

Stockage local (sql.js) et synchronisation

- Le projet utilise sql.js (SQLite en WASM) pour stocker l'inventaire localement, assurer offline-first et rapidité.
- Stratégie sync : écrire localement puis pousser les modifications vers Supabase (Edge Function). En cas de conflit, le backend applique règles (dernier write wins ou règles métiers plus strictes selon besoin).

Interactions avec firmware et backend

- ESP32 (RFID) → HTTP POST → Edge Function Supabase → DB.
- Mobile BLE → stocke positions en local; sync périodique vers Supabase (realtime) pour afficher positions centralisées et permettre dashboard.
- Dashboard/administration lisent `tools`, `rfid_logs`, `ble_positions`.

Expérience utilisateur et retours haptique

- Hot/Cold guide : transitions de couleur + intensité haptique proportionnelle à RSSI filtré.
- Feedback instantané : écran liste mis à jour en <1s; carte mise à jour en ~1s.

---

5. Schéma d'intégration global (séquences)

Séquence simplifiée pour un OUT non autorisé :

1. Opérateur passe outil devant portique.
2. ESP32 lit UID, vérifie cache local.
3. ESP32 POST → Edge Function.
4. Edge Function vérifie `tools` : état, assignation.
5. Si non autorisé → Edge Function insère log (rfid_logs) et renvoie authorized=false.
6. ESP32 active LED rouge + buzzer; enregistre localement le log si nécessaire.
7. Dashboard admin lit `rfid_logs`, déclenche alerte ou workflow.

Séquence BLE pour localisation :

1. Balise diffuse iBeacon.
2. Mobile scanne → collecte RSSI et timestamp.
3. App filtre RSSI, calcule distance, met à jour carte.
4. Si utilisateur demande guidage, app affiche hot/cold + vibre.
5. Positions sont stockées en local et poussées à Supabase pour agrégation.

---

6. Consignes pratiques

- Ne jamais committer clés ou secrets (WIFI_SSID, WIFI_PASSWORD, API_URL, supabase keys). Utiliser variables d'environnement ou secrets manager.
- Pour production Capacitor : exporter `NODE_ENV=production` avant la build pour que `server.url` dev soit retiré.
- Testez la calibration RSSI sur site et documentez `ble_rssi_calibration` par beacon.
- Éviter de faire du contrôle de sécurité uniquement côté appareil (ESP32). Le backend est la source de vérité.

---

7. Emplacements de code importants

- Firmware RFID : `ESP32/` et `01-PROTOTYPE-1-RFID.md` (code complet, instructions Arduino IDE).
- Prototype BLE (beacon example) : `02-PROTOTYPE-2-BLE.md` (exemples ESP32 beacon + snippets mobile).
- App mobile : `src/screens/`, `src/components/`, `src/contexts/` (BLEScannerContext, MapContext, MovementsContext).
- Docs et architecture : `00-README-SUMMARY.md`, `03-ARCHITECTURE-HYBRIDE.md`.

---

8. Annexes : commandes rapides et checklist de déploiement

Commandes utiles

- Installer dépendances : `npm install`
- Dev server (web/mobile dev): `npm run start`
- Build production : `npm run build`
- Android (Capacitor) : `npm run dev:android`
- iOS (Capacitor) : `npm run dev:ios`
- Type-check rapide : `npx tsc --noEmit`

Checklist de mise en service (portique RFID)

- [ ] Commander RC522 et tags
- [ ] Préparer ESP32 et installer bibliothèques dans Arduino IDE
- [ ] Configurer `WIFI_SSID`, `WIFI_PASSWORD`, `API_URL`
- [ ] Téléverser firmware sur ESP32
- [ ] Ajouter quelques `tools` test dans Supabase
- [ ] Tester lecture tag et vérifier logs Supabase

Checklist mobile BLE

- [ ] Commander balises BLE ou préparer ESP32 beacon
- [ ] Calibrer RSSI (1 m) pour chaque beacon
- [ ] Tester scan sur smartphone, vérifier filtrage et affichage
- [ ] Implémenter sync vers Supabase si besoin

---

Si nécessaire, un document séparé peut être ajouté pour :
- procédures de maintenance matérielle (remplacement piles balises),
- guide d'administration Supabase (scripts SQL),
- plan de tests automatiques (si ajout de tests unitaires/CI).

Fin du document. Pour modifications (ajouts d'images, diagrammes SVG/PNG, ou export PDF), indiquer les éléments souhaités et ils seront ajoutés proprement dans `docs/`.