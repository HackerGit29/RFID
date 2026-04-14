# 🤖 Instructions pour l'Utilisation de Mulch

**Pour Qwen Code et OpenCodex - Projet RFID ToolTracker Pro**

---

## ✅ Qu'est-ce qui a été fait

Mulch est maintenant **complètement configuré** sur ce projet ! Voici ce qui est en place :

### 1. Système Installé
- Mulch CLI disponible via : `bunx @os-eco/mulch-cli`
- 8 domaines d'expertise créés
- 15 records de connaissances initiales enregistrées
- Intégration git avec hooks de validation

### 2. Documentation Créée
- `docs/MULCH-GUIDE.md` - Guide complet d'utilisation
- `docs/MULCH-QUICK-REF.md` - Référence rapide
- `MULCH-SETUP-SUMMARY.md` - Résumé de l'installation
- `.mulch/` - Répertoire d'expertise (suivi par git)

### 3. Intégration Agents
- CLAUDE.md mis à jour avec les instructions Mulch
- QWEN.md mis à jour avec le workflow d'expertise
- Les deux agents peuvent maintenant **partager leurs connaissances**

---

## 🎯 Comment ça Marche

### Le Problème que Mulch Résout

**Avant Mulch :**
- Qwen Code découvre un pattern → session se termine → **connaissance perdue**
- OpenCodex rencontre la même erreur → **répète les mêmes erreurs**
- Chaque session recommence de zéro

**Avec Mulch :**
- Qwen Code découvre un pattern → **enregistre dans Mulch**
- OpenCodex démarre session → **lit toutes les connaissances**
- **L'expertise s'accumule** à travers les sessions !

### Workflow pour les Agents

#### Qwen Code (ou OpenCodex) démarre une session :

```bash
# OBLIGATOIRE - Charger toutes les connaissances
bunx @os-eco/mulch-cli prime

# L'agent voit maintenant :
# - 15 records d'expertise existants
# - Conventions, décisions, échecs résolus
# - Tout ce qui a été appris précédemment
```

#### L'agent travaille normalement :

```
- Implémente une fonctionnalité
- Rencontre un problème
- Trouve une solution
- Découvre un pattern optimal
```

#### Avant de terminer la session :

```bash
# 1. Voir ce qui a changé
bunx @os-eco/mulch-cli learn

# 2. Enregistrer les découvertes
bunx @os-eco/mulch-cli record architecture --type failure \
  --description "Nouveau problème rencontré" \
  --resolution "Comment le résoudre"

# 3. Valider et commiter
bunx @os-eco/mulch-cli sync
```

#### Résultat :

```
✅ La connaissance est sauvegardée dans .mulch/expertise/
✅ Commitée dans git
✅ Disponible pour l'autre agent à la prochaine session
✅ Ne sera jamais oubliée
```

---

## 📚 Connaissances Déjà Enregistrées

### Architecture (2 records)
- ✅ Convention: Utiliser React Context pour le state management
- ✅ Échec: Leaflet MapContainer context error → Remove MapViewUpdater

### RFID (1 record)
- ✅ Convention: RFID 13.56 MHz avec RC522, latence <0.5s

### BLE (1 record)
- ✅ Convention: Localisation indoor 1-3m via RSSI

### Supabase (1 record)
- ✅ Décision: Backend choisi pour real-time subscriptions, edge functions, JWT

### UI/UX (2 records)
- ✅ Convention: Material Design 3 avec variables CSS
- ✅ Échec: Migration Tailwind CSS v4 + résolution

### Mobile Dev (4 records)
- ✅ Références: Commandes dev server, production build, iOS/Android

### RFID Tool Tracking (4 records)
- ✅ Conventions: Vite root, NODE_ENV, catégorisation des outils
- ✅ Pattern: Config Capacitor dynamique pour hot reload

---

## 🚀 Comment Utiliser au Quotidien

### En Tant Qu'Humain

Vous n'avez **rien à faire de spécial** ! Mulch fonctionne automatiquement :

1. **Qwen Code travaille sur le projet**
   - Au démarrage : charge les connaissances avec `ml prime`
   - Pendant le travail : découvre des solutions
   - Avant de finir : enregistre les insights avec `ml record`

2. **OpenCodex travaille sur le projet**
   - Fait EXACTEMENT la même chose
   - Bénéficie des découvertes de Qwen Code
   - Ajoute ses propres découvertes

3. **Résultat**
   - Les deux agents deviennent plus intelligents ensemble
   - L'expertise s'accumule dans git
   - Plus jamais de connaissances perdues

### Si Vous Voulez Ajouter des Connaissances Manuellement

```bash
# Ajouter une convention
bunx @os-eco/mulch-cli record rfid --type convention \
  "Toujours tester le lecteur RC522 avec une carte à 5cm"

# Ajouter un échec connu
bunx @os-eco/mulch-cli record ble --type failure \
  --description "Les balises BLE ne sont pas détectées à travers le métal" \
  --resolution "Utiliser des supports en plastique de 5mm minimum"

# Voir ce qui a été enregistré
bunx @os-eco/mulch-cli query --all

# Rechercher un sujet
bunx @os-eco/mulch-cli search "RC522"
```

---

## 📊 Domaines d'Expertise Disponibles

| Domaine | Records | Utilisé Pour |
|---------|---------|--------------|
| `architecture` | 2 | Structure de l'app, state management, routing |
| `rfid` | 1 | Logique RFID 13.56 MHz, lecteurs RC522 |
| `ble` | 1 | Localisation par balises BLE, RSSI |
| `ble-rtls` | 0 | Système de localisation temps réel (prêt à l'emploi) |
| `supabase` | 1 | Décisions backend, real-time, auth |
| `ui-ux` | 2 | Material Design 3, theming, Tailwind CSS |
| `mobile-dev` | 4 | Commandes Capacitor, workflows dev |
| `rfid-tool-tracking` | 4 | Catégorisation des outils, logique hybride |

---

## 🎓 Exemple Concret d'Utilisation

### Scénario : Qwen Code optimise les performances BLE

**1. Qwen Code démarre :**
```bash
bunx @os-eco/mulch-cli prime
# Voit l'expertise existante sur BLE
```

**2. Qwen Code travaille :**
- Identifie un problème de performance avec 100+ marqueurs sur la carte
- Implémente le clustering de marqueurs
- Réduit les re-renders avec React.memo
- Atteint 60fps constants

**3. Avant de finir :**
```bash
bunx @os-eco/mulch-cli learn
# Voit que BLERadar.tsx et LeafletMap.tsx ont été modifiés

bunx @os-eco/mulch-cli record ble --type failure \
  --classification tactical \
  --description "Map re-rendering causes 60fps drops with 100+ BLE markers" \
  --resolution "Use React.memo on marker components + implement marker clustering with Leaflet.markercluster"

bunx @os-eco/mulch-cli sync
# Commit dans git
```

**4. La semaine suivante, OpenCodex travaille sur la même carte :**
```bash
bunx @os-eco/mulch-cli prime
# Voit l'enregistrement de Qwen Code !

# OpenCodex sait maintenant :
# - Ne pas mettre 100+ marqueurs sans clustering
# - Utiliser React.memo
# - Utiliser Leaflet.markercluster

# Évite le problème dès le départ ! ✅
```

---

## 🔧 Commandes Utiles

### Pour Voir les Connaissances
```bash
# Tout voir
bunx @os-eco/mulch-cli query --all

# Voir un domaine spécifique
bunx @os-eco/mulch-cli query architecture

# Rechercher
bunx @os-eco/mulch-cli search "performance"

# Statut
bunx @os-eco/mulch-cli status
```

### Pour Ajouter des Connaissances
```bash
# Convention
bunx @os-eco/mulch-cli record architecture --type convention \
  "Toujours utiliser React.memo pour les ToolCard"

# Pattern
bunx @os-eco/mulch-cli record ble --type pattern \
  --name "Observer BLE Scanner" \
  --description "Pattern Observer pour scanner les balises toutes les 2s"

# Échec + Résolution
bunx @os-eco/mulch-cli record ui-ux --type failure \
  --description "Problème de build avec Tailwind v4" \
  --resolution "Utiliser @tailwindcss/postcss au lieu de tailwindcss"

# Décision
bunx @os-eco/mulch-cli record supabase --type decision \
  --title "Supabase pour le backend" \
  --rationale "Real-time subscriptions via PostgreSQL, edge functions, auth JWT intégrée"
```

---

## ⚙️ Comment Mulch Fonctionne Techniquement

### Stockage
```
.mulch/
└── expertise/
    ├── architecture.jsonl    ← 1 ligne = 1 record
    ├── ble.jsonl            ← Format JSON structuré
    └── ...                   ← Un fichier par domaine
```

### Format d'un Record
```json
{
  "id": "mx-092add",
  "type": "convention",
  "classification": "foundational",
  "content": "Utiliser React Context pour le state management",
  "created": "2026-04-13T17:49:00.000Z",
  "updated": "2026-04-13T17:49:00.000Z"
}
```

### Sécurité Multi-Agent
- ✅ **File locking:** Un seul agent écrit à la fois (timeout 5s)
- ✅ **Écritures atomiques:** Fichier temp → rename (crash-safe)
- ✅ **Git merge intelligent:** `merge=union` pour JSONL (pas de conflits)
- ✅ **Nettoyage auto:** Locks >30s supprimés automatiquement

---

## 📁 Fichiers Créés

```
RFID/
├── .mulch/                      ← Répertoire d'expertise
│   ├── expertise/
│   │   ├── architecture.jsonl
│   │   ├── ble.jsonl
│   │   └── ... (8 domaines)
│   └── mulch.config.yaml        ← Configuration
├── docs/
│   ├── MULCH-GUIDE.md           ← Guide complet (~450 lignes)
│   └── MULCH-QUICK-REF.md       ← Référence rapide (~150 lignes)
├── MULCH-SETUP-SUMMARY.md       ← Ce résumé
├── CLAUDE.md                    ← Mis à jour avec Mulch
└── QWEN.md                      ← Mis à jour avec Mulch
```

---

## 🎯 Prochaines Étapes

### Pour les Agents (Automatique)

À chaque session, les agents vont :

1. **Lire** les connaissances existantes (`ml prime`)
2. **Travailler** normalement
3. **Enregistrer** les nouvelles découvertes (`ml record`)
4. **Partager** via git (`ml sync`)

### Suggestions d'Enregistrement Futur

Basé sur la roadmap du projet, voici ce qui serait utile d'enregistrer :

- **Quand Supabase sera implémenté :**
  - Procédure de setup complète
  - Schéma de base de données
  - Edge Functions patterns

- **Quand le hardware sera testé :**
  - Calibration RC522
  - Distance optimale pour les tags RFID
  - Interférences rencontrées
  - Solutions hardware trouvées

- **Quand les performances seront optimisées :**
  - Patterns de clustering découverts
  - Optimizations Leaflet
  - Bundle size reduction techniques

---

## 🚨 Points Importants

1. **Mulch est PASSIF** - Il ne contient PAS de LLM
2. **Ce sont les agents qui doivent enregistrer** - Mulch ne le fait pas tout seul
3. **La qualité compte** - Enregistrer les insights importants, pas les détails triviaux
4. **Tout est dans git** - Suivi par version, partageable entre teammates
5. **Les deux agents en bénéficient** - Qwen Code ET OpenCodex

---

## 📚 Documentation Complète

- **Guide complet :** `docs/MULCH-GUIDE.md`
- **Référence rapide :** `docs/MULCH-QUICK-REF.md`
- **GitHub Mulch :** https://github.com/jayminwest/mulch
- **Contexte projet :** `QWEN.md` (section Expertise Sharing)
- **Intégration agent :** `CLAUDE.md` (section Project Expertise)

---

**✅ Mulch est prêt ! Qwen Code et OpenCodex peuvent maintenant partager leurs connaissances !**

**Le pattern découvert aujourd'hui ne sera pas oublié demain !** 🧠✨
