# SCANकर — Stitch UI/UX Build Prompt (Industrial Version 1)

**Target:** 13 screens, full design system, light + dark mode, all animations  
**Design Reference:** stripe.com (layout/typography patterns only — NOT colors)  
**Date:** 2026-03-02

---

## DESIGN SYSTEM TOKENS

### Color Tokens — Light Mode

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#F8FAFF` | Page background |
| `--surface` | `#FFFFFF` | Cards, modals, sheets |
| `--primary` | `#2563EB` | Buttons, links, active states |
| `--primary-hover` | `#1D4ED8` | Pressed/hover state |
| `--primary-subtle` | `#EFF6FF` | Input backgrounds, soft highlights |
| `--text-1` | `#0F172A` | Headings, primary text |
| `--text-2` | `#475569` | Secondary text, captions |
| `--border` | `#BFDBFE` | Card borders, dividers |
| `--input-bg` | `#EFF6FF` | Input field backgrounds |
| `--success` | `#22C55E` | Confidence >90%, success states |
| `--success-bg` | `#DCFCE7` | Success cell/badge background |
| `--warning` | `#F59E0B` | Confidence 70–90% |
| `--warning-bg` | `#FEF9C3` | Warning cell/badge background |
| `--error` | `#EF4444` | Confidence <70%, errors |
| `--error-bg` | `#FEE2E2` | Error cell/badge background |

### Color Tokens — Dark Mode

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#0F172A` | Page background |
| `--surface` | `#1E293B` | Cards, modals, sheets |
| `--primary` | `#3B82F6` | Buttons, links, active states |
| `--primary-hover` | `#60A5FA` | Pressed/hover state |
| `--primary-subtle` | `#1E3A5F` | Input backgrounds, soft highlights |
| `--text-1` | `#F1F5F9` | Headings, primary text |
| `--text-2` | `#94A3B8` | Secondary text, captions |
| `--border` | `#1E40AF` | Card borders, dividers |
| `--input-bg` | `#1E3A5F` | Input field backgrounds |
| `--success` | `#4ADE80` | Confidence >90% |
| `--success-bg` | `#14532D` | Success background |
| `--warning` | `#FCD34D` | Confidence 70–90% |
| `--warning-bg` | `#451A03` | Warning background |
| `--error` | `#F87171` | Confidence <70% |
| `--error-bg` | `#450A0A` | Error background |

### Typography (Inter Font Family)

| Token | Size | Weight | Usage |
|---|---|---|---|
| `H1` | 28sp | Bold (700) | Screen titles |
| `H2` | 22sp | SemiBold (600) | Section headings |
| `H3` | 18sp | SemiBold (600) | Card titles, sub-sections |
| `H4` | 16sp | SemiBold (600) | List headers |
| `Body` | 15sp | Regular (400) | Body text, descriptions |
| `Caption` | 12sp | Regular (400) | Metadata, timestamps |
| `Button` | 15sp | SemiBold (600) | Button labels |
| `Code` | 14sp | Mono (400) | Code input, wide letter-spacing 6px |

### Spacing Scale
`4 / 8 / 12 / 16 / 24 / 32 / 48 px`

### Border Radius
| Element | Radius |
|---|---|
| Buttons | 10px |
| Cards | 16px |
| Inputs | 10px |
| Pills / Chips | 9999px |
| Lock screen card | 20px |

### Shadows
| Level | Value |
|---|---|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` |
| `shadow-md` | `0 4px 12px rgba(0,0,0,0.08)` |
| `shadow-lg` | `0 8px 24px rgba(0,0,0,0.12)` |

---

## REUSABLE COMPONENTS

Build these before any screens:

### PrimaryButton
- Full-width, height 52px, radius 10px, `--primary` bg, white text `Button`
- States: default → hover (`--primary-hover`) → pressed (scale 0.97, 100ms) → disabled (opacity 0.5)

### SecondaryButton
- Full-width, height 48px, radius 10px, transparent bg, `--primary` border 1.5px, `--primary` text
- States: hover (bg `--primary-subtle`) → pressed (scale 0.97)

### GhostButton
- No bg, no border, `--primary` text, underline on hover

### Card
- `--surface` bg, radius 16px, border 1px `--border`, `shadow-sm`, padding 16px
- Entrance animation: fade + translateY 8px→0, 250ms ease-out

### TopBar
- Height 56px, `--surface` bg, border-bottom 1px `--border`
- Left: title or logo | Right: action icons (24×24)

### BottomNav
- Height 64px + safe area, `--surface` bg, border-top 1px `--border`
- 3 tabs: icon (24×24) + label (Caption). Active = `--primary`, inactive = `--text-2`

### FAB (Floating Action Button)
- 60×60px circle, `--primary` bg, white camera icon 28px, `shadow-lg`
- Position: bottom 24px, right 24px (above BottomNav)
- Press: scale 0.92, 100ms

### ConfidenceBadge
- Pill shape (9999px radius), height 24px, padding 0 12px
- Green: `--success` text on `--success-bg` | Yellow: `--warning` on `--warning-bg` | Red: `--error` on `--error-bg`

### DocTypeBadge
- Pill, 20px height, `--primary-subtle` bg, `--primary` text, Caption weight SemiBold

### CodeInputField
- Height 56px, `Code` typography (14sp mono, letter-spacing 6px), center-aligned
- Border 2px `--border`, focus: 2px `--primary`, error: 2px `--error` + shake
- Background `--input-bg`, radius 10px

### ScanThumbnailCard
- 140×100px thumbnail (radius 12px), doc type badge overlay bottom-left
- Below: scan name (Body), date (Caption `--text-2`), confidence badge

### FilterChip
- Pill, height 32px, padding 0 16px, Caption SemiBold
- Inactive: `--surface` bg, `--border` border, `--text-2` text
- Active: `--primary-subtle` bg, `--primary` border, `--primary` text

### PhaseProgressItem
- Left: status icon (pending dot / spinning / checkmark), Right: phase label Body
- Pending: `--text-2` opacity 0.5 | Active: `--primary` + spin animation | Done: `--success` + checkmark

---

## SCREEN 00 — ACCESS CODE LOCK SCREEN

**Purpose:** First screen on fresh install. Blocks all access until valid code entered.

### Layout
- **Background:** Full-screen linear gradient top→bottom `#1D4ED8` → `#2563EB`
- **Top area (30% of screen):**
  - Endurance logo: white, 80×80px, centered
  - Below logo: "SCANकर" — 24sp Bold, white, centered, margin-top 12px
- **Center card (white, radius 20px, padding 32px, shadow-lg, max-width 340px):**
  - Title: "Employee Activation" — H3 18sp SemiBold, `--text-1`, center
  - Subtitle: "Enter your access code to unlock" — Body 15sp, `--text-2`, center, margin-top 8px
  - CodeInputField: margin-top 24px, placeholder "XXXX-XXXX" in `--text-2` 50% opacity
  - PrimaryButton "Activate App": margin-top 24px, height 52px
  - Error message area: margin-top 12px, `--error` text, Caption 12sp, center, hidden by default
- **Bottom (fixed, 32px from bottom):**
  - "Need help? Contact: support@endurance.com" — Caption 12sp, white 65% opacity, center

### Interactive States
- **Default:** Clean card, no error visible
- **Input focused:** Border becomes 2px `--primary` (on the white card context, use `#2563EB`)
- **Error state:** Input border 2px `--error`, shake animation (±8px, 200ms, 3 cycles), error message fades in: "Invalid code. Please try again or contact your supervisor."
- **Success state:** Input border 2px `--success`, green checkmark icon spring-animates into center of input (scale 0→1, 400ms spring), button text changes to "Unlocked ✓", 800ms delay then smooth fade-transition to next screen
- **Button disabled state:** While validating, show spinner, opacity 0.7

### Behavior Logic
- Hardcoded list of 20–30 alphanumeric codes in app bundle
- **Codes are REUSABLE — infinite uses, any device, no device binding**
- Validation: normalize input (trim whitespace, uppercase) → check if exists in code list → if yes: save `unlocked=true` to AsyncStorage → navigate
- First-time unlock → Screen 01 (Onboarding)
- Returning user (already unlocked) → skip Screen 00 entirely → Screen 02 (Home)
- No back button. No way to dismiss. No navigation until valid code.

### Dark Mode
- N/A — this screen always uses the blue gradient background regardless of theme

---

## SCREEN 01 — SPLASH / ONBOARDING

**Purpose:** Introduce app features on first launch after activation.

### Layout
- **Background:** `--primary` (#2563EB light / #3B82F6 dark)
- **Status bar:** Light content
- **Top-right:** "Skip" GhostButton, white text, Caption, padding 16px
- **Center (60% of screen):** Horizontally swipeable card carousel (3 cards)
  - Each card: white semi-transparent (rgba 255,255,255, 0.15) rounded rect (radius 20px, padding 32px)
  - Card 1: Camera icon (white, 64px) → "Capture Any Document" H3 white → "Tables, handwriting, printed sheets — all supported" Body white 80%
  - Card 2: AI/chip icon (white, 64px) → "AI Extracts Instantly" H3 white → "7 offline ML models process everything on your device" Body white 80%
  - Card 3: Export/share icon (white, 64px) → "Export in Any Format" H3 white → "Excel, PDF, Word, CSV — structure always preserved" Body white 80%
- **Below carousel:** 3 progress dots, 8px diameter, active = white, inactive = white 40%, spacing 8px
- **Bottom (32px from bottom):** Only on card 3: "Get Started →" button — white bg, `--primary` text, full-width, height 52px, radius 10px

### Animations
- Card swipe: horizontal scroll with snap, 300ms deceleration
- Dots: scale active dot to 1.2×, color transition 200ms
- "Get Started" button: fade in on card 3 arrival, 250ms

### Navigation
- "Skip" or "Get Started" → Screen 02 (Home Dashboard)
- Save `onboarding=true` to AsyncStorage so this screen never shows again

---

## SCREEN 02 — HOME DASHBOARD

**Purpose:** Main hub. Entry point for scanning, access to history and settings.

### Layout
- **TopBar (56px):**
  - Left: "SCANकर" logo text, H3 `--primary`
  - Right: Theme toggle icon (sun/moon, 24px, `--text-2`) + Settings gear icon (24px, `--text-2`), spacing 16px between
- **Content (scrollable, padding 16px):**
  - **Hero Card:** Full-width, height 160px, radius 16px, gradient bg `#1D4ED8`→`#2563EB` (light) / `#1E3A5F`→`#2563EB` (dark)
    - Left side: "Scan a Document" H2 white, "Point camera at any hard copy" Body white 80%, margin-top 8px
    - Right side: Scan/document illustration (white, 80px), right-aligned
    - Entire card is tappable → Screen 03
  - **Stats Row (margin-top 16px):** 3 equal-width Cards in a row, gap 12px
    - Card 1: "Total Scans" Caption `--text-2`, count H2 `--text-1`
    - Card 2: "This Week" Caption `--text-2`, count H2 `--text-1`
    - Card 3: "Exports" Caption `--text-2`, count H2 `--text-1`
  - **Recent Scans Section (margin-top 24px):**
    - Header: "Recent Scans" H4 `--text-1` left + "See All →" Caption `--primary` right
    - Horizontal scroll row of ScanThumbnailCards, gap 12px, padding-right 16px
    - If no scans: "No scans yet. Tap the button below to start!" Body `--text-2`, centered
- **FAB:** Bottom-right, above BottomNav, camera icon
- **BottomNav:** Home (active) | History | Settings

### Navigation
- Hero card or FAB → Screen 03 (Camera)
- "See All" or History tab → Screen 10 (History)
- Recent scan card tap → Screen 06 or 07 (based on type)
- Settings icon or Settings tab → Screen 11 (Settings)
- Theme toggle → cycles Light/Dark

---

## SCREEN 03 — CAMERA CAPTURE

**Purpose:** Capture document image via camera or gallery.

### Layout
- **Full-screen camera preview** (edge-to-edge, behind status bar)
- **Top overlay bar (translucent black 40%, padding 16px):**
  - Left: Close (X) icon button, 40×40px, white
  - Center/Right: DocType FilterChips row: [Auto] [Table] [Text] [Form]
    - Chips on dark translucent bg, active chip: white bg `--primary` text, inactive: transparent, white border, white text
- **Center overlay:** Blue corner bracket guides (4 L-shaped corners, 3px stroke `--primary`, 40px arms)
  - When document detected: corners animate to snap to document edges (200ms), color transitions from blue to `--success` green
  - Real-time tip text at top of bracket area: "Align document edges" Caption white, translucent bg pill
- **Bottom overlay bar (translucent black 40%, height 120px, padding 16px):**
  - Left: Flash toggle icon (24px white), cycles Off/On/Auto with label below
  - Center: Capture button — 72px outer ring (white 3px), 60px inner circle (white filled), press: scale 0.92 + shutter animation
  - Right: Gallery icon (24px white) + "Gallery" Caption below
- **Top-right (below status bar):** Auto-capture toggle pill: "Auto" + toggle switch, translucent bg

### Behavior
- Auto mode: pipeline decides doc type; Table/Text/Form force that type
- Capture → navigate to Screen 04 with image URI
- Gallery → open device picker → Screen 04 with selected image
- Auto-capture: when all 4 edges detected and stable for 1.5s → auto-trigger capture

### Dark Mode
- N/A — camera screen always uses dark overlays on camera preview

---

## SCREEN 04 — IMAGE PREVIEW & CROP

**Purpose:** Adjust captured image before processing.

### Layout
- **TopBar:** "Preview" title center, Back arrow left, aspect ratio info right (Caption)
- **Image area (70% of screen):** Captured image displayed, pinch-to-zoom enabled
  - 4 draggable crop handles at corners: 20×20px circles, `--primary` fill, white border 2px, shadow-md
  - Crop boundary: 2px dashed `--primary` connecting handles
- **Bottom panel (Card, slides up, radius 16px top corners, padding 16px):**
  - **Tool row:** Rotate Left ↶ | Rotate Right ↷ | each 44×44px icon button, `--text-2`
  - **Brightness slider:** icon + horizontal slider, `--primary` track
  - **Contrast slider:** icon + horizontal slider, `--primary` track
  - **Enhance button:** Full-width, SecondaryButton, magic wand icon + "Auto Enhance", margin-top 12px
- **Bottom bar (fixed, padding 16px):**
  - Left: "Retake" SecondaryButton (40% width)
  - Right: "Process →" PrimaryButton (55% width)

### Navigation
- "Retake" → back to Screen 03
- "Process →" → Screen 05 (Processing)

---

## SCREEN 05 — PROCESSING SCREEN

**Purpose:** Show ML pipeline progress while processing the document.

### Layout
- **Background:** `--bg`
- **Center content (vertically centered):**
  - Pulsing document icon: 80×80px, `--primary`, pulse animation (scale 1→1.1→1, 1.5s loop, ease-in-out)
  - Margin-top 32px: "Processing Document..." H3 `--text-1`, center
  - Margin-top 24px: Phase progress list (5 items, vertical, left-aligned within centered container):
    1. PhaseProgressItem "Enhancing Image"
    2. PhaseProgressItem "Detecting Document Type"
    3. PhaseProgressItem "Extracting Structure"
    4. PhaseProgressItem "Reading Text"
    5. PhaseProgressItem "Validating Data"
    - Items stagger-activate 200ms apart as pipeline progresses
  - Margin-top 32px: Progress bar — full-width (max 280px), 6px height, radius 3px, `--border` track, `--primary` fill, smooth animation 400ms ease-in-out
  - Margin-top 12px: "Estimated time: ~3 seconds" Caption `--text-2`, center

### Behavior
- Back gesture/button disabled — if attempted, show toast: "Processing in progress..." 2s
- On completion → auto-navigate to Screen 06 (Table) or Screen 07 (Paragraph) based on detected type, 500ms delay after last phase completes

---

## SCREEN 06 — TABLE REVIEW SCREEN

**Purpose:** Review extracted table data against original image.

### Layout
- **TopBar:**
  - Left: Back arrow + DocTypeBadge "TABLE" + "24r × 6c" Caption `--text-2`
  - Right: ConfidenceBadge (overall %) + "Edit" icon button + "Export" icon button
- **Split panel (resizable via drag handle):**
  - **Top panel (40% default):** Original image, pinch-to-zoom, pan, `--surface` bg
  - **Drag handle:** 40×4px pill, `--text-2` 30%, centered, 16px vertical hit area
  - **Bottom panel (60% default):** Extracted table in scrollable grid
    - Sticky header row: `--primary-subtle` bg, H4 `--text-1`, border-bottom 2px `--border`
    - Frozen first column: `--primary-subtle` bg (optional)
    - Data cells: Body text, padding 8px 12px, border 1px `--border`
    - Cell confidence coloring (bg): green `--success-bg` (>90%) | yellow `--warning-bg` (70–90%) | red `--error-bg` (<70%)
    - Tap cell → tooltip above: "87% confidence", small triangle pointer, `--surface` bg, shadow-md, dismiss on tap outside
    - Horizontal + vertical scroll, momentum scrolling
- **Bottom bar (fixed, above safe area):**
  - Confidence legend: 3 color dots with labels (green "High" / yellow "Medium" / red "Low"), Caption, centered

### Navigation
- "Edit" → Screen 08 (Table Editor)
- "Export" → Screen 09 (Export)
- Back → Screen 02 (Home)

---

## SCREEN 07 — PARAGRAPH REVIEW SCREEN

**Purpose:** Review extracted text and paragraphs.

### Layout
- **TopBar:**
  - Left: Back arrow + DocTypeBadge "TEXT"
  - Right: ConfidenceBadge + "Export" icon button
- **Image thumbnail strip (height 64px, horizontal scroll):**
  - Small thumbnail(s) of original image, 56×56px, radius 8px, border 1px `--border`
  - Tap thumbnail → full-screen image overlay with pinch-to-zoom and close (X) button
- **Content (scrollable, padding 16px):**
  - Extracted text rendered with heading hierarchy:
    - H1 blocks: H1 style, margin-top 24px
    - H2 blocks: H2 style, margin-top 16px
    - Body blocks: Body style, margin-top 8px, line-height 1.6
  - Confidence word highlighting: mid-confidence words underlined `--warning` dashed, low-confidence underlined `--error` solid
  - Tap any paragraph → enter inline edit mode: bg changes to `--primary-subtle`, cursor appears, keyboard opens
  - Edit mode: text becomes editable, "Done" mini-button appears above keyboard
- **Bottom (padding 16px):**
  - "Add Paragraph" button: dashed border 2px `--border`, height 48px, `--text-2` text, "+" icon, full-width, radius 10px
  - Tap → new empty text block appended, keyboard opens

### Navigation
- "Export" → Screen 09
- Back → Screen 02

---

## SCREEN 08 — TABLE EDITOR SCREEN

**Purpose:** Full editing of extracted table data.

### Layout
- **TopBar:**
  - Left: "Table Editor" H3
  - Center: Undo (↶) and Redo (↷) icon buttons, 44×44px. Disabled state: opacity 0.3
  - Right: row×col count Caption `--text-2`
- **Table grid (full screen, scrollable both axes):**
  - All cells editable — tap to focus, bg changes to `--primary-subtle`, cursor blinks
  - Cell dimensions: min-width 80px, height 44px, padding 8px
  - Manually entered cells (no OCR source): small blue dot (6px, `--primary`) in top-right corner of cell
  - Long-press cell (300ms) → Context menu (Card, shadow-lg, radius 12px):
    - Insert Row Above | Insert Row Below
    - Insert Column Left | Insert Column Right
    - ─── divider ───
    - Merge Cells | Split Cell
    - ─── divider ───
    - Delete Row | Delete Column
    - ─── divider ───
    - Clear Cell | Copy Cell
    - Each item: 44px height, Body text, icon left 20px, tap highlight `--primary-subtle`
  - **Last row:** "Add Row" dashed row, height 44px, `--text-2` "+"  text, dashed border-top 2px `--border`
  - **Last column:** "Add Column" dashed column, width 60px, `--text-2` "+", dashed border-left 2px `--border`
  - Column headers (if detected): sticky, `--primary-subtle` bg
  - Row numbers: frozen left column, Caption `--text-2`, width 40px
- **Bottom bar (fixed, padding 16px, `--surface` bg, border-top):**
  - Left: "Discard" SecondaryButton (35% width) — confirm dialog before discarding
  - Right: "Save & Continue →" PrimaryButton (60% width)
- **Undo/Redo:** Max 50 operations. Stack tracks: cell edits, row/col add/delete, merge/split, clear

### Navigation
- "Save & Continue →" → saves edits, returns to Screen 06 (Table Review) with updated data
- "Discard" → confirm dialog → returns to Screen 06 without changes
- Back gesture → same as "Discard" with confirm

---

## SCREEN 09 — EXPORT SCREEN

**Purpose:** Choose export format and share the extracted data.

### Layout
- **TopBar:** Back arrow + "Export" H3
- **Content (scrollable, padding 16px):**
  - **Document preview Card (margin-bottom 24px):**
    - Left: thumbnail 80×60px, radius 8px
    - Right: document name Body `--text-1`, type badge, date Caption `--text-2`, confidence badge
  - **Format selector (margin-bottom 24px):**
    - "Choose Format" H4, margin-bottom 12px
    - 5 format tiles in 2×3 grid (last row centered), gap 12px:
      - Each tile: Card, 100×100px (flexible), radius 12px, center-aligned
      - Icon (32px) + format name (Button text) + extension (Caption `--text-2`)
      - 📊 Excel (.xlsx) | 📄 PDF | 📝 Word (.docx) | 📋 CSV | {} JSON
      - Selected: `--primary` border 2px + `--primary-subtle` bg + checkmark overlay top-right
      - Unselected: `--border` border 1px + `--surface` bg
      - Tap: select with color transition 200ms, deselect previous
  - **Options section (margin-bottom 24px):**
    - "Options" H4, margin-bottom 12px
    - Toggle row 1: "Include confidence scores" Body + toggle switch (track: `--primary` when on, `--border` when off)
    - Toggle row 2: "Include original image" Body + toggle switch, margin-top 12px
    - Each toggle row: Card bg, padding 16px, radius 12px
- **Bottom bar (fixed, padding 16px):**
  - "Export & Share" PrimaryButton, full-width, disabled until format selected (opacity 0.5)
  - On tap: generate file → open native share sheet

---

## SCREEN 10 — HISTORY / SAVED SCANS

**Purpose:** Browse, search, filter, and manage past scans.

### Layout
- **TopBar:** "History" H2 left
- **Search bar (margin 16px):** Input, height 44px, radius 10px, `--input-bg`, search icon left, placeholder "Search scans..."
- **Filter chips row (horizontal scroll, padding-left 16px, margin-bottom 12px):**
  - FilterChips: [All] [Tables] [Paragraphs] [Forms] [Today] [This Week]
  - Default: "All" active
- **Sort button (right-aligned, margin-right 16px):** icon + "Sort" Caption, taps opens bottom sheet
  - Sort options: Date (Newest) | Date (Oldest) | Name (A→Z) | Name (Z→A) | Confidence (High) | Confidence (Low)
- **Scan list (vertical scroll, padding 16px, gap 12px):**
  - Each item: Card, horizontal layout
    - Left: thumbnail 64×48px, radius 8px
    - Center: name Body `--text-1`, type DocTypeBadge + date Caption `--text-2` (row below name)
    - Right: ConfidenceBadge
  - Swipe left → red "Delete" action (bg `--error`, white trash icon)
  - Swipe right → blue "Export" action (bg `--primary`, white export icon)
  - Tap → navigate to Screen 06 (table) or Screen 07 (paragraph) based on type
- **Empty state (centered when no scans):**
  - Illustration: document with magnifying glass, 120px, `--text-2` 30% opacity
  - "No scans yet" H3 `--text-2`, margin-top 16px
  - "Tap the scan button to capture your first document" Body `--text-2`, margin-top 8px
- **BottomNav:** History tab active

---

## SCREEN 11 — SETTINGS

**Purpose:** App configuration and preferences.

### Layout
- **TopBar:** "Settings" H2 left
- **Content (scrollable, padding 16px):** Grouped sections with section headers (H4 `--text-2`, uppercase, letter-spacing 1px, margin-bottom 8px, margin-top 24px)
- **Appearance section:**
  - "Theme" row: Body left + 3-segment toggle right [Light|Dark|System], active segment: `--primary` bg white text
- **Scanning section:**
  - "Auto-enhance on capture" + toggle
  - "Auto-capture when aligned" + toggle
  - "Default scan mode" + value picker (Auto/Table/Text/Form)
  - "OCR Language" + value picker (English/Hindi/Auto)
- **Export section:**
  - "Default export format" + value picker (Excel/PDF/Word/CSV/JSON)
  - "Include confidence scores by default" + toggle
- **Data section:**
  - "Storage Used" + value right (e.g., "124 MB") Caption `--text-2`
  - "Clear Cache" → destructive action, confirm dialog
  - "Clear All Scan History" → destructive action (red text), confirm dialog
- **AI Models section:**
  - "ML Models" + chevron right → navigates to Screen 12
  - Shows mini status: "7/7 loaded" Caption `--success`
- **About section:**
  - "Version" + "1.0.0" Caption right
  - Endurance logo (small, 32px, `--text-2` 50%), centered
  - "Support: support@endurance.com" Caption `--text-2`, centered
- **Each setting row:** Card-style, padding 16px, border-bottom 1px `--border`, min-height 52px
- **BottomNav:** Settings tab active

---

## SCREEN 12 — MODEL STATUS SCREEN

**Purpose:** View ML model health, sizes, and performance.

### Layout
- **TopBar:** Back arrow + "AI Models" H3
- **Status banner (margin 16px):** Full-width Card, padding 16px
  - If all loaded: `--success-bg` bg, `--success` left border 4px, "All Models Loaded" H4 `--success` + checkmark
  - If any error: `--error-bg` bg, `--error` border, "Model Error Detected" H4 `--error` + warning icon
- **Performance cards row (margin 16px, 3 cards, gap 12px):**
  - Card 1: "Avg Table" Caption → "3.2s" H3 `--text-1`
  - Card 2: "Avg Text" Caption → "2.1s" H3 `--text-1`
  - Card 3: "Storage" Caption → "128 MB" H3 `--text-1`
- **Model list (padding 16px, gap 8px):**
  - "Models" H4 `--text-2`, margin-bottom 8px
  - 7 model rows, each a Card, padding 16px:
    - Left: Status dot (10px circle): green `--success` / yellow `--warning` / red `--error`
    - Content: Model name (Body SemiBold `--text-1`) + purpose (Caption `--text-2`)
    - Right column: size (Caption `--text-2`, e.g., "~10 MB") + last used (Caption `--text-2`, e.g., "2m ago")
  - Models:
    1. Image Enhancement — "Improves image quality" — ~10 MB
    2. Layout Analysis — "Detects document regions" — ~20 MB
    3. Table Structure — "Finds rows and columns" — ~15 MB
    4. Text Detection (CRAFT) — "Locates text regions" — ~25 MB
    5. Printed OCR — "Reads printed text" — ~20 MB
    6. Handwriting OCR — "Reads handwritten text" — ~35 MB
    7. Language Detection — "Identifies script type" — ~5 MB
- **Buttons (padding 16px, margin-top 8px):**
  - "Reload All Models" PrimaryButton, full-width
  - "Run Diagnostics" SecondaryButton, full-width, margin-top 12px

---

## NAVIGATION MAP

```
App Launch:
  → unlocked=false           → Screen 00 (Access Code)
  → unlocked=true, first run → Screen 01 (Onboarding)
  → unlocked=true, returning → Screen 02 (Home)

Screen 00 → valid code → Screen 01 (first time) or Screen 02 (returning)
Screen 01 → Skip / Get Started → Screen 02

Screen 02 → FAB / Hero Card → Screen 03
Screen 03 → Capture / Gallery → Screen 04
Screen 04 → Process → Screen 05
Screen 05 → Complete → Screen 06 (table) or Screen 07 (paragraph)
Screen 06 → Edit → Screen 08
Screen 08 → Save → Screen 06
Screen 06/07 → Export → Screen 09
Screen 09 → Export & Share → Native Share Sheet

Screen 02 → History tab → Screen 10
Screen 10 → Tap scan → Screen 06 or 07

Screen 02 → Settings → Screen 11
Screen 11 → AI Models → Screen 12
```

---

## ANIMATION SPECIFICATIONS

| Element | Animation | Duration | Easing |
|---|---|---|---|
| Button press | scale(0.97) | 100ms | ease-out |
| FAB press | scale(0.92) | 100ms | ease-out |
| Card entrance | opacity 0→1 + translateY 8→0 | 250ms | ease-out |
| Screen push | slideFromRight | 300ms | ease-in-out |
| Screen pop | slideToRight | 300ms | ease-in-out |
| Code input error | shake ±8px, 3 cycles | 200ms | linear |
| Unlock success | green checkmark spring-in (scale 0→1.2→1) + haptic | 400ms | spring |
| Progress bar fill | width % increase | 400ms | ease-in-out |
| Phase items activate | stagger 200ms, opacity 0→1 + color change | 300ms per item | ease-out |
| Confidence cells | background-color transition | 300ms | ease |
| Tooltip appear | opacity 0→1 + scale 0.9→1 | 150ms | ease-out |
| Swipe actions reveal | translateX with momentum | 200ms | ease-out |
| Theme switch | cross-fade all colors | 300ms | ease |

---

## STITCH BUILD ORDER

Execute in this exact sequence:

1. **Design tokens:** Register all color, typography, spacing, radius, shadow tokens
2. **Components:** Build all reusable components (PrimaryButton, SecondaryButton, GhostButton, Card, TopBar, BottomNav, FAB, ConfidenceBadge, DocTypeBadge, CodeInputField, ScanThumbnailCard, FilterChip, PhaseProgressItem)
3. **Screens (in order):** 00 → 02 → 03 → 06 → 08 → 09 → 10 → 05 → 04 → 07 → 11 → 12 → 01
4. **Navigation:** Wire complete navigation map
5. **Dark mode:** Apply dark tokens to every screen and component
6. **Animations:** Add all specified animations
7. **Final review:** Check all 13 screens in both light and dark mode

> **DEVELOPER NOTE:** Build UI/UX in Stitch only. Do not write React Native code. Once Stitch completes all 13 screens, components will be fetched and integrated into the React Native codebase. This is intentional design-to-dev workflow separation.

---

*End of Stitch UI/UX Build Prompt*
