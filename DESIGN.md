# ToolTracker Pro — Design System

> **North Star:** "Industrial Command Center"
> L'application doit ressentir comme un tableau de bord professionnel d'une salle de contrôle industrielle. L'utilisateur est un opérateur qui surveille et gère les mouvements d'outils via RFID et BLE.

---

## 1. Core Philosophy

### Le "Widget Personne" Concept
Tous les écrans de l'app tourne autour de la gestion des **outils** (personnes = outils dans ce contexte). Un "widget outil" doit être:
- **Lisible en un clin d'œil** — 信息 au premier coup d'œil
- **Color-coded par statut** — code couleur intuitif
- **Interactif** — swipe, tap, drag流畅

### No-Line Aesthetic
- **PAS de bordures solides** entre les sections
- **Utiliser les variations de surface** pour définir les limites
- **Glassmorphism** pour les éléments flottants (bottom sheet, top bar)

---

## 2. Color Palette

### Primary Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#06C167` | Actions principales, succès, statut disponible |
| `primary-container` | `#06C16720` | Fond des chips RFID/BLE |
| `on-primary` | `#000000` | Texte sur fond primary |

### Surface Hierarchy (Deep Dark)
| Token | Hex | Usage |
|-------|-----|-------|
| `surface` | `#000000` | Background principal |
| `surface-container-low` | `#121212` | Cartes, sections |
| `surface-container-high` | `#1E1E1E` | Inputs, zones actives |
| `surface-container-highest` | `#2D2D2D` | Éléments flottants |

### Status Colors
| Status | Color | Usage |
|--------|-------|-------|
| `available` | `#06C167` | Outil disponible |
| `in_use` | `#3B82F6` | En cours d'utilisation |
| `maintenance` | `#F59E0B` | Maintenance |
| `lost` | `#EF4444` | Perdu/alerte |

### Tertiary / Accents
| Token | Hex | Usage |
|-------|-----|-------|
| `tertiary` | `#357DF1` | BLE, radar, interactions secondaire |
| `error` | `#EF4444` | Alertes, erreurs |
| `on-surface` | `#FFFFFF` | Texte principal |
| `on-surface-variant` | `#FFFFFF80` | Texte secondaire |
| `outline` | `#FFFFFF20` | Bordures subtiles (20% opacity max) |

---

## 3. Typography

### Font Stack
- **Headlines:** `UberMove, Manrope, sans-serif` — Bold, tight tracking
- **Body:** `Inter, system-ui, sans-serif` — Regular
- **Mono:** `JetBrains Mono, monospace` — Numéros de série, données techniques

### Scale
| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| `Display-LG` | 2.5rem | 800 | 1.1 |
| `Headline-SM` | 1.5rem | 700 | 1.2 |
| `Title-MD` | 1.125rem | 600 | 1.3 |
| `Body-MD` | 0.875rem | 400 | 1.5 |
| `Label-SM` | 0.6875rem | 700 | 1.4 |
| `Mono` | 0.75rem | 500 | 1.4 |

---

## 4. Components

### ToolCard (Le widget central)
```tsx
// Structure obligatoire
<div className="bg-surface-container-low rounded-2xl p-4 flex gap-4 items-center border border-outline">
  {/* Image */}
  <div className="w-16 h-16 rounded-xl bg-surface-container-high">
    <img />
  </div>
  
  {/* Content */}
  <div className="flex-1">
    <h4 className="font-headline text-sm text-white">{tool.name}</h4>
    <p className="font-mono text-xs text-on-surface-variant">{tool.serialNumber}</p>
    
    {/* Status Chip */}
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${statusColor}`}>
      {statusLabel}
    </span>
    
    {/* Tech Tags */}
    <div className="flex gap-2">
      {tool.rfidEnabled && <span className="chip-rfid">RFID</span>}
      {tool.bleEnabled && <span className="chip-ble">BLE</span>}
    </div>
  </div>
</div>
```

### Status Chips
```css
.chip-available {
  @apply bg-primary/20 text-primary border border-primary/30;
}
.chip-in_use {
  @apply bg-blue-500/20 text-blue-400 border border-blue-500/30;
}
.chip-maintenance {
  @apply bg-amber-500/20 text-amber-400 border border-amber-500/30;
}
.chip-lost {
  @apply bg-red-500/20 text-red-400 border border-red-500/30;
}

.chip-rfid, .chip-ble {
  @apply text-[9px] font-bold px-2 py-1 bg-primary/10 text-primary rounded-full border border-primary/20;
}
```

### Bottom Sheet (Glassmorphism)
```tsx
<div className="bg-surface-container-high/90 backdrop-blur-3xl rounded-t-[2rem] border-t border-outline pb-8">
  {/* Drag handle */}
  <div className="w-10 h-1 bg-on-surface-variant/20 rounded-full mx-auto mt-3" />
</div>
```

### Top Bar (HUD)
```tsx
<div className="bg-surface-container-high/60 backdrop-blur-md rounded-xl border border-outline p-4">
  {/* Glass effect header */}
</div>
```

### Alert Banner
```tsx
<div className="p-4 rounded-2xl flex items-center gap-3" 
  style={{ background: '#EF444420', border: '1px solid #EF4444' }}>
  <span className="material-symbols-outlined text-error">warning</span>
  <div className="flex-1">
    <p className="text-xs font-bold uppercase text-error">Alerte de Sécurité</p>
    <p className="text-sm text-white">{message}</p>
  </div>
</div>
```

---

## 5. Screen Specifications

### HomeDashboard
```
┌─────────────────────────────────────┐
│ [Glass Top Bar]                    │
│  Logo    Notif(3)    ThemeToggle    │
├─────────────────────────────────────┤
│ [Alert Banner - si non autorisé]     │
├─────────────────────────────────────┤
│ [SearchBar]                        │
├─────────────────────────────────────┤
│ [StatCards - Horizontal Scroll]      │
│  ┌────┐ ┌────┐ ┌────┐             │
│  │127 │ │ 23 │ │ 5  │             │
│  └────┘ └────┘ └────┘             │
├─────────────────────────────────────┤
│ [Activity Feed]                     │
│  • Mouvement 1                     │
│  • Mouvement 2                     │
│  • Mouvement 3                     │
├─────────────────────────────────────┤
│ [Map Preview]                      │
│  [Radar Actif: X Signaux]          │
├─────────────────────────────────────┤
│ [BottomNav]                         │
└─────────────────────────────────────┘
```

### InventoryList
```
┌─────────────────────────────────────┐
│ [TopBar: "Inventaire"]            │
├─────────────────────────────────────┤
│ Inventaire                          │
│ 127 OUTILS · 3 CATÉGORIES          │
├─────────────────────────────────────┤
│ [SearchBar] [FilterChips]         │
│  Tous | RFID | BLE | RFID+BLE      │
├─────────────────────────────────────┤
│ Électroportatif (42)               │
│ ┌─────────────────────────────────┐│
│ │ [ToolCard]                      ││
│ └─────────────────────────────────┘│
│ ┌─────────────────────────────────┐│
│ │ [ToolCard]                      ││
│ └─────────────────────────────────┘│
├─────────────────────────────────────┤
│ Mesure & Traçage (15)               │
│ ┌─────────────────────────────────┐│
│ │ [ToolCard]                      ││
│ └─────────────────────────────────┘│
├─────────────────────────────────────┤
│ [+FAB] [BottomNav]                │
└─────────────────────────────────────┘
```

### BLERadar
```
┌─────────────────────────────────────┐
│ [Full Screen Map]                  │
│                                     │
│        📍 Tool 1                    │
│           📍 Tool 2                │
│              📍 Tool 3              │
├─────────────────────────────────────┤
│ [Glass Top Overlay]                │
│  Bluetooth icon | Radar: ON        │
│  [Search] [Filter]               │
├─────────────────────────────────────┤
│ [Glass Bottom Sheet]               │
│  ═══ (drag handle)               │
│  3 outils détectés                │
│  ┌──────┐ ┌──────┐ ┌──────┐    │
│  │ Card │ │ Card │ │ Card │     │
│  └──────┘ └──────┘ └──────┘    │
├─────────────────────────────────────┤
│ [BottomNav]                        │
└─────────────────────────────────────┘
```

### ToolDetail
```
┌─────────────────────────────────────┐
│ [TopBar: Back]                    │
├─────────────────────────────────────┤
│ [Hero Image - Tool Photo]          │
├─────────────────────────────────────┤
│ Tool Name                          │
│ Serial: XXXX-XXXX                  │
│ Price: €249.00                    │
├─────────────────────────────────────┤
│ [Status Chip: Available]           │
├─────────────────────────────────────┤
│ [RFID Tag] [BLE Tag]              │
│  RFID: ✓ Actif                   │
│  BLE:  ✓ Actif                   │
├─────────────────────────────────────┤
│ [Action Buttons]                   │
│  [Verrouiller] [Historique]      │
├─────────────────────────────────────┤
│ [Recent Movements]                │
│  • Out: 10:30                    │
│  • In: 14:15                     │
└─────────────────────────────────────┘
```

---

## 6. Animation & Motion

### Transitions
- **Page transitions:** 300ms ease-out
- **Card hover:** scale(1.02) + shadow increase
- **Button press:** scale(0.98)
- **Bottom sheet:** spring animation (stiffness: 300, damping: 30)

### Micro-interactions
- **Status change:** Color pulse 2 cycles
- **RFID detection:** Ripple effect from icon
- **BLE radar:** Pulsing dot animation

---

## 7. Do's & Don'ts

### ✅ Do
- Utiliser `surface-container-low` pour les cartes
- Ajouter `border border-outline` (20% opacity) pour les contours subtils
- Utiliser le glassmorphism (`backdrop-blur`) pour les overlays
- Griser les éléments désactivés avec `opacity-50`
- Toujours afficher le numéro de série en mono

### ❌ Don't
- PAS de `#FFFFFF` solide pour les bordures
- PAS de fond blanc anywhere
- PAS de divider lines (utiliser l'espacement)
- PAS de coins carrés (min `rounded-xl`)
- PAS d'ombre noire traditionnelle (utiliser des couleurs de surface)

---

## 8. Collaboration (Qwen Coder)

### Pour collaborer efficacement:

1. **Toujours pull avant de push** 
   ```bash
   git pull origin main --rebase
   ```

2. **Créer une branche par feature**
   ```bash
   git checkout -b feature/nom-de-la-feature
   ```

3. **Commit avec conventional commits**
   ```bash
   git commit -m "feat(tools): ajout du nouveau design ToolCard"
   ```

4. **Patterns à suivre:**
   - ToolCard.tsx — le widget central
   - StatCard.tsx — pour les KPIs
   - ActivityFeed.tsx — pour le flux

5. **Couleurs à utiliser:**
   - Succès/Dispo: `#06C167`
   - Warning/Maintenance: `#F59E0B`
   - Error/Lost: `#EF4444`
   - Info/BLE: `#357DF1`

---

## 9. Figma / Handoff

Si besoin de partager avec les designers:
- **Couleurs:** voir section 2
- **Typography:** Manrope (headlines) + Inter (body)
- **Corner radius:** 8px (sm), 12px (md), 16px (xl), 24px (2xl)
- **Shadow:** `0 4px 20px rgba(0,0,0,0.3)` pour les cards flottantes
- **Glass:** `background: rgba(30,30,30,0.8); backdrop-filter: blur(16px)`

---

*Document généré pour la collaboration humain + AI agent (Qwen Coder)*
*Dernière mise à jour: 2026-04-14*
