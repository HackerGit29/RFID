# 🧠 Mulch Quick Reference Card

**For Qwen Code & OpenCodex - RFID ToolTracker Pro Project**

---

## 🚀 Agent Session Workflow

### START SESSION (MANDATORY)
```bash
bunx @os-eco/mulch-cli prime
```

### END SESSION (MANDATORY)
```bash
bunx @os-eco/mulch-cli learn
bunx @os-eco/mulch-cli record <domain> --type <type> --description "..."
bunx @os-eco/mulch-cli sync
```

---

## 📚 Most Used Commands

### Get Context
```bash
ml prime                                    # All expertise
ml prime architecture ui-ux                 # Specific domains
ml prime --files src/screens/BLERadar.tsx  # File-specific
ml query architecture                       # Query domain
ml search "BLE calibration"                 # Search all
```

### Record Insights
```bash
ml record architecture --type convention "Use React Context for state"
ml record ui-ux --type failure --description "..." --resolution "..."
ml record supabase --type decision --title "..." --rationale "..."
ml record ble --type pattern --name "..." --description "..."
ml record rfid --type reference --name "..." --description "..."
```

### Maintenance
```bash
ml status                                   # Domain health
ml doctor                                   # Check issues
ml doctor --fix                            # Auto-fix
ml validate                                # Schema validation
ml ready --since 1h                        # Recent records
```

---

## 🎯 When to Record

### ✅ DO Record
- Conventions discovered
- Patterns applied
- Failures encountered (with resolutions!)
- Architectural decisions made
- Key references found
- Procedures created

### ❌ DON'T Record
- Trivial changes (typos, formatting)
- Info already in code comments
- Temporary workarounds (use `observational` if needed)
- Duplicates (search first!)

---

## 📂 Available Domains

| Domain | Use For |
|--------|---------|
| `architecture` | App structure, state management, routing |
| `rfid` | RFID 13.56 MHz, RC522 readers, checkpoints |
| `ble` | BLE beacons, RSSI, indoor localization |
| `supabase` | Backend, real-time, auth, edge functions |
| `ui-ux` | Material Design 3, theming, Tailwind CSS |
| `mobile-dev` | Capacitor commands, dev workflows |
| `rfid-tool-tracking` | Tool categorization, hybrid logic |

---

## 🔖 Record Types Quick Ref

| Type | Required Fields | Example |
|------|----------------|---------|
| `convention` | content (positional arg) | "Use WAL mode for SQLite" |
| `pattern` | --name, --description | "Observer pattern for BLE" |
| `failure` | --description, --resolution | "MapContainer error → Remove child" |
| `decision` | --title, --rationale | "Supabase: real-time subscriptions" |
| `reference` | --name, --description | "Dev server: port 5173" |
| `guide` | --name, --description | "BLE calibration procedure" |

---

## 🏷️ Classification Levels

| Level | Shelf Life | Use For |
|-------|-----------|---------|
| `foundational` | Never pruned | Core knowledge |
| `tactical` | 14 days | Important, may evolve |
| `observational` | 30 days | Session-specific |

---

## 🔗 Advanced Options

```bash
# Link to related records
--relates-to mx-092add

# Supersede outdated record
--supersedes mx-092add

# Add evidence
--evidence-commit abc123
--evidence-issue #142
--evidence-file src/utils/foo.ts

# Batch recording
ml record api --batch records.json

# Dry run preview
ml record ui-ux --type convention "Test" --dry-run

# Filter query
ml query architecture --classification foundational
ml search "BLE" --domain ble --type failure
```

---

## ⚠️ Troubleshooting

| Issue | Solution |
|-------|----------|
| `ml command not found` | Use `bunx @os-eco/mulch-cli` |
| Lock timeout | Retry command |
| Duplicate records | Search first, use `--force` if intentional |
| Schema validation error | Check `ml record --help` for required fields |

---

## 📖 Full Documentation

- **Complete Guide:** `docs/MULCH-GUIDE.md`
- **Project Context:** `QWEN.md` (see Expertise Sharing section)
- **Agent Integration:** `CLAUDE.md` (see Project Expertise section)
- **GitHub:** https://github.com/jayminwest/mulch

---

**🎯 Remember:** Every session should leave the project smarter than it found it!
