# 🧠 Mulch Expertise Sharing Guide

**Purpose:** Enable Qwen Code and OpenCodex to share knowledge and expertise across work sessions on the RFID ToolTracker Pro project.

---

## 📋 What is Mulch?

Mulch is a **passive expertise management system** that allows AI agents to:
- **Record** learnings (conventions, patterns, failures, decisions) in structured JSONL files
- **Query** accumulated knowledge across sessions
- **Share** expertise between agents via git-tracked files

**Key principle:** Mulch does NOT contain an LLM. Agents use Mulch — Mulch does not use agents.

---

## 🚀 Quick Start for Agents

### At Session Start

**ALWAYS run this at the beginning of every work session:**

```bash
bunx @os-eco/mulch-cli prime
```

This injects all project expertise into your context before you start working.

**For focused context** (only relevant domains):
```bash
bunx @os-eco/mulch-cli prime architecture ui-ux rfid ble supabase
```

**For file-specific context:**
```bash
bunx @os-eco/mulch-cli prime --files src/screens/BLERadar.tsx
```

### Before Session End

**BEFORE completing your task**, review your work and record insights:

```bash
# 1. Discover what changed and what to record
bunx @os-eco/mulch-cli learn

# 2. Record insights
bunx @os-eco/mulch-cli record <domain> --type <type> --description "..."

# 3. Validate and commit
bunx @os-eco/mulch-cli sync
```

---

## 📚 Available Commands

### Core Workflow

| Command | Description | When to Use |
|---------|-------------|-------------|
| `ml prime` | Get all expertise for context injection | **Start of every session** |
| `ml prime <domains...>` | Get expertise for specific domains | When working on specific area |
| `ml query [domain]` | Query expertise with filters | When you need specific knowledge |
| `ml search <query>` | Search across all domains (BM25) | When looking for specific topic |
| `ml learn` | Show changed files, suggest domains | **Before ending session** |
| `ml record <domain>` | Record an expertise record | **Before ending session** |
| `ml sync` | Validate, stage, commit changes | **Before ending session** |

### Record Types

| Type | Required Fields | Use Case | Example |
|------|----------------|----------|---------|
| `convention` | `content` | Rules, standards, best practices | "Use WAL mode for SQLite" |
| `pattern` | `name`, `description` | Named patterns with file references | "Observer pattern for BLE scanner" |
| `failure` | `description`, `resolution` | What went wrong + how to avoid | "MapContainer context error → Remove MapViewUpdater" |
| `decision` | `title`, `rationale` | Architectural decisions + reasoning | "Supabase over PostgreSQL: real-time subscriptions" |
| `reference` | `name`, `description` | Key files, endpoints, resources | "Dev server: npm run start on port 5173" |
| `guide` | `name`, `description` | Step-by-step procedures | "BLE beacon calibration procedure" |

### Classification Levels

| Level | Description | Pruning |
|-------|-------------|---------|
| `foundational` | Core knowledge, rarely changes | Never pruned |
| `tactical` | Important but may evolve | Pruned if stale |
| `observational` | Session-specific, temporary | Pruned aggressively |

---

## 🗂️ Project Domains

### Current Domains

| Domain | Purpose | Records |
|--------|---------|---------|
| `architecture` | App structure, state management, routing | 2 |
| `rfid` | RFID 13.56 MHz checkpoint logic, RC522 integration | 1 |
| `ble` | BLE beacon localization, RSSI filtering | 1 |
| `supabase` | Backend decisions, real-time, auth, edge functions | 1 |
| `ui-ux` | Material Design 3, theming, Tailwind CSS v4 | 2 |
| `mobile-dev` | Capacitor commands, dev workflows | 4 |
| `rfid-tool-tracking` | Tool categorization, hybrid logic | 4 |
| `ble-rtls` | Real-time location system (empty, ready for use) | 0 |

### When to Add New Domains

Add a new domain when:
- Working on a significantly different area (e.g., `testing`, `ci-cd`, `hardware-firmware`)
- A topic has 5+ records that deserve isolation

```bash
bunx @os-eco/mulch-cli add <domain-name>
```

---

## 📝 Recording Best Practices

### What to Record

✅ **DO Record:**
- **Conventions discovered:** "Always use React.memo for ToolCard to prevent re-renders"
- **Patterns applied:** "Used Compound Component pattern for ThemeProvider"
- **Failures encountered:** "Capacitor hot reload fails when NODE_ENV=production"
- **Decisions made:** "Chose Leaflet over Mapbox GL: open-source, lighter weight"
- **References found:** "BLE signal smoothing algorithm in src/utils/signalFilter.ts"
- **Guides created:** "Step-by-step for adding new screen with routing"

❌ **DO NOT Record:**
- Trivial changes (typos, formatting)
- Information already in code comments
- Temporary workarounds (use `--classification observational` if needed)
- Duplicates (check with `ml search` first)

### Record Quality Examples

**❌ Bad (too vague):**
```bash
ml record architecture --type convention "Use good practices"
```

**✅ Good (specific, actionable):**
```bash
ml record architecture --type convention --classification foundational \
  "Use React Context for state management (ThemeContext, MapContext, BLEScannerContext, MovementsContext, UIFiltersContext) - no Zustand needed yet"
```

**❌ Bad (missing resolution):**
```bash
ml record ble --type failure --description "BLE scanner not detecting beacons"
```

**✅ Good (includes resolution):**
```bash
ml record ble --type failure --classification tactical \
  --description "BLE scanner not detecting beacons on Android 14" \
  --resolution "Request BLUETOOTH_CONNECT permission at runtime, not just in manifest"
```

### Advanced Recording Options

```bash
# Link to related records
ml record ui-ux --type pattern --name "Glassmorphism card" --description "..." \
  --relates-to mx-23c72f

# Supersede outdated record
ml record architecture --type decision --title "New state management" --rationale "..." \
  --supersedes mx-092add

# Add evidence
ml record ble --type failure --description "..." --resolution "..." \
  --evidence-commit abc123def \
  --evidence-issue #142

# Batch recording (multiple records at once)
ml record api --batch records.json

# Dry run to preview
ml record ui-ux --type convention "Test convention" --dry-run
```

---

## 🔄 Agent Workflow

### Qwen Code Workflow

```
1. START SESSION
   ↓
   bunx @os-eco/mulch-cli prime
   ↓
   [Read expertise into context]

2. DO WORK
   ↓
   [Normal task execution]
   ↓
   [Discover patterns, encounter issues]

3. BEFORE ENDING
   ↓
   bunx @os-eco/mulch-cli learn
   ↓
   [Review changes, identify insights]
   ↓
   bunx @os-eco/mulch-cli record <domain> --type <type> --description "..."
   ↓
   bunx @os-eco/mulch-cli sync
   ↓
   [Validate, stage, commit to git]

4. PUSH TO GIT
   ↓
   [OpenCodex can now access new expertise]
```

### OpenCodex Workflow

Same as Qwen Code! Both agents:
1. Call `ml prime` at session start
2. Work on tasks
3. Call `ml learn` + `ml record` before ending
4. Push to git

**Result:** Expertise compounds across sessions and agents!

---

## 🛡️ Concurrency & Safety

### How Mulch Handles Multiple Agents

| Scenario | Safety | Notes |
|----------|--------|-------|
| Both agents reading (`prime`, `query`, `search`) | ✅ **Fully safe** | No locks needed |
| Both agents writing to same domain (`record`) | ✅ **Safe** | File locking serializes access |
| Both agents syncing (`sync`) | ⚠️ **Coordinate** | Git ref lock contention possible |

### Lock Behavior

- **Advisory file locks:** `.lock` file created before writes
- **Retry logic:** 50ms intervals for up to 5 seconds
- **Stale lock cleanup:** Locks older than 30s auto-removed
- **Atomic writes:** Temp file → rename (crash-safe)

### Best Practices for Multi-Agent

```bash
# ✅ Safe - both can do this simultaneously:
ml prime
ml query architecture
ml search "BLE calibration"

# ✅ Safe - locks handle serialization:
ml record architecture --type convention "..."

# ⚠️ Coordinate timing:
ml sync  # Run at different times, not simultaneously
```

---

## 🔍 Querying Expertise

### Basic Queries

```bash
# All expertise
ml query --all

# Specific domain
ml query architecture

# Filter by type
ml query architecture --classification foundational

# Format as XML (for some agent preferences)
ml query architecture --format xml
```

### Search with BM25 Ranking

```bash
# Search all domains
ml search "BLE signal filtering"

# Search specific domain
ml search "state management" --domain architecture

# Filter by type
ml search "error" --type failure

# Sort by score (most relevant first)
ml search "Capacitor" --sort-by-score
```

### Advanced Filters

```bash
# Only successful outcomes
ml query --outcome-status success

# Records related to specific files
ml query --file src/screens/BLERadar.tsx

# Records with specific tags
ml query --tags "performance,android"
```

---

## 📊 Maintenance

### Regular Maintenance Tasks

```bash
# Check domain health
ml status

# Find stale records
ml doctor

# Auto-fix issues
ml doctor --fix

# Remove stale tactical/observational records
ml prune --dry-run  # Preview first
ml prune            # Then apply

# Analyze compaction candidates
ml compact --analyze

# Apply compaction
ml compact --apply --dry-run  # Preview
ml compact --apply            # Then apply
```

### When to Run Maintenance

- **Weekly:** `ml status`, `ml doctor`
- **Monthly:** `ml prune`, `ml compact --analyze`
- **Before major release:** `ml validate`, `ml sync`

---

## 📂 File Structure

```
.mulch/
├── expertise/
│   ├── architecture.jsonl      # Architecture decisions & patterns
│   ├── rfid.jsonl              # RFID checkpoint logic
│   ├── ble.jsonl               # BLE localization
│   ├── supabase.jsonl          # Backend decisions
│   ├── ui-ux.jsonl             # Design system, theming
│   ├── mobile-dev.jsonl        # Capacitor workflows
│   └── rfid-tool-tracking.jsonl # Tool categorization
└── mulch.config.yaml           # Domain configuration
```

### JSONL Format

Each line is a complete JSON record:

```json
{"id":"mx-092add","type":"convention","classification":"foundational","content":"Use React Context for state management...","created":"2026-04-13T17:49:00.000Z","updated":"2026-04-13T17:49:00.000Z"}
```

**Properties:**
- `id`: Unique identifier (mx-XXXXXX format)
- `type`: Record type (convention, pattern, failure, decision, reference, guide)
- `classification`: Foundational / tactical / observational
- `content`/`description`/etc.: Record-specific content
- `created`, `updated`: ISO 8601 timestamps
- Optional: `tags`, `relates-to`, `supersedes`, `evidence-*`, `outcome-*`

---

## 🎓 Examples from This Project

### Already Recorded Expertise

```bash
# Architecture decision
ml query supabase
→ Decision: Supabase for backend (real-time subscriptions, edge functions, JWT auth)

# Failure + Resolution
ml query architecture
→ Failure: Leaflet MapContainer context error
  Resolution: Remove MapViewUpdater, MapContainer handles center/zoom via props

# UI/UX convention
ml query ui-ux
→ Convention: Material Design 3 color system with CSS variables
→ Failure: Tailwind CSS v4 PostCSS plugin migration
```

### What You Should Record Next

Based on project roadmap, consider recording:

1. **Backend Integration:**
   ```bash
   ml record supabase --type guide --name "Supabase setup procedure" --description "..."
   ```

2. **Hardware Testing:**
   ```bash
   ml record rfid --type pattern --name "RC522 calibration" --description "..."
   ```

3. **Map Enhancements:**
   ```bash
   ml record ble --type decision --title "Leaflet over Mapbox GL" --rationale "..."
   ```

---

## 🚨 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| `ml command not found` | Use `bunx @os-eco/mulch-cli` instead |
| Lock timeout error | Retry command, check for stuck processes |
| Duplicate records | Use `ml search` before recording, use `--force` if intentional |
| Schema validation error | Check required fields for record type with `ml record --help` |
| Git conflicts | Run `ml sync` to properly stage and commit |

### Reset Commands

```bash
# Validate all records
ml validate

# Check domain health
ml status

# Find and fix issues
ml doctor --fix

# View recent records
ml ready --since 1h
```

---

## 📚 Resources

- **Mulch GitHub:** https://github.com/jayminwest/mulch
- **Full CLI Reference:** `ml --help`
- **Record Command Help:** `ml record --help`
- **This File:** `docs/MULCH-GUIDE.md`
- **CLAUDE.md Integration:** See `## Project Expertise (Mulch)` section at end of file

---

**🎯 Goal:** Every work session leaves the project smarter than it found it. Record insights, share knowledge, compound expertise!
