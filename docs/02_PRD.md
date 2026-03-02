# SCANकर — Product Requirements Document (PRD)

**Version:** 1.0  
**Date:** 2026-03-02  
**Status:** Draft  
**Product:** SCANकर v1 — Industrial Version  
**Target Release:** Internal (Endurance Employees Only)

---

## 1. Product Vision and Purpose

SCANकर is a mobile-first, fully offline document scanning application that uses on-device machine learning to transform physical hard-copy documents into structured, editable digital data.

**Vision Statement:**  
*"Empower every Endurance employee to instantly convert any physical document — tables, printed text, handwritten notes, or forms — into structured digital data, anytime, anywhere, without internet."*

**Core Value Proposition:**
- No cloud dependency, no recurring costs, no data leaving the device
- 7 specialized ML models running entirely on-device
- Table structure preservation (rows, columns, cells mapped accurately)
- Multi-format export (Excel, PDF, Word, CSV, JSON)
- Under 5 seconds from scan to structured output

---

## 2. Target Users

### 2.1 Version 1 — Endurance Employees Only

Version 1 is restricted to 20–30 employees at Endurance, accessed via one-time activation codes.

### 2.2 User Personas

#### Persona 1: Field Operative — Rajesh

| Attribute | Detail |
|---|---|
| Role | Field inspector / site engineer |
| Age | 28–45 |
| Tech Comfort | Moderate (uses WhatsApp, basic apps) |
| Context | Works at construction sites, warehouses, industrial plants |
| Pain Point | Collects data on printed forms and tables in the field; must re-enter everything into Excel back at the office |
| Goal | Snap a photo of a data table and get an Excel file instantly |
| Device | Android mid-range (4GB RAM, Android 9+) |
| Connectivity | Often no internet or unreliable mobile data |

**Use Case:** Rajesh is at a warehouse checking inventory printouts. He opens SCANकर, photographs a printed table of 50 items. The app detects the table, extracts all cells, and shows him the structured data in under 5 seconds. He taps "Export as Excel" and shares the file via WhatsApp. He just saved 45 minutes of manual typing.

#### Persona 2: Office Administrator — Priya

| Attribute | Detail |
|---|---|
| Role | Administrative assistant / data entry clerk |
| Age | 22–35 |
| Tech Comfort | High (uses multiple apps, familiar with spreadsheets) |
| Context | Works in the Endurance office, processes piles of printed reports and handwritten notes |
| Pain Point | Spends hours re-typing printed reports and handwritten memos into Word and Excel |
| Goal | Scan multiple documents, edit any errors, and export in the correct format quickly |
| Device | iPhone 12 / Samsung Galaxy A series |
| Connectivity | Has Wi-Fi but app shouldn't need it |

**Use Case:** Priya receives a stack of 15 printed monthly reports with handwritten annotations in the margins. She scans each page, the app separates printed text from handwriting, extracts both, and presents them in a review screen. She corrects two OCR errors by tapping on highlighted low-confidence words, then exports each as Word documents. What used to take a full day now takes 30 minutes.

#### Persona 3: Manager — Vikram

| Attribute | Detail |
|---|---|
| Role | Department manager |
| Age | 35–50 |
| Tech Comfort | Moderate |
| Context | Reviews data reports, needs structured data for analysis |
| Pain Point | Receives critical data in printed table format; needs it in Excel for analysis |
| Goal | Get accurate, structured data exports from any scanned document |
| Device | iPhone 14 Pro / Samsung S23 |
| Connectivity | Stable internet but prefers offline tools for data security |

**Use Case:** Vikram photographs a quarterly performance table during a meeting. SCANकर extracts the full table with confidence scores. He sees that two cells show yellow (70–90% confidence), taps them to verify and correct, then exports the table as CSV for import into his analytics dashboard.

---

## 3. Feature List — Complete, Prioritized

### Priority Definitions
- **P0 (Must Have):** Required for v1 launch. App cannot ship without these.
- **P1 (Should Have):** Important for usability. Should be in v1 if timeline allows.
- **P2 (Nice to Have):** Enhances experience. Can be deferred to post-launch update.

### 3.1 Feature Matrix

| ID | Feature | Priority | Module |
|---|---|---|---|
| F01 | Access Code Lock System | P0 | M9 |
| F02 | Camera Capture with smart overlay | P0 | M1 |
| F03 | Auto document type detection | P0 | M2 |
| F04 | Table extraction + structure preservation | P0 | M3 |
| F05 | Paragraph / text extraction | P0 | M4 |
| F06 | OCR for printed text | P0 | M3/M4 |
| F07 | OCR for handwritten text | P0 | M3/M4 |
| F08 | Interactive editable review screen | P0 | M5 |
| F09 | Manual data entry / editing after extraction | P0 | M5 |
| F10 | Export: Excel, PDF, Word, CSV, JSON | P0 | M6 |
| F11 | Form / field extraction | P1 | M4 |
| F12 | Hindi + English script support | P1 | M3/M4 |
| F13 | Scan history and storage | P1 | M7 |
| F14 | Dark + Light mode | P1 | M8 |
| F15 | ML model status screen | P2 | M8 |

### 3.2 Feature Descriptions

#### F01 — Access Code Lock System (P0)
- On fresh install, only an access code entry screen is visible
- Employee enters a valid Endurance-issued activation code
- Code is validated offline against a hardcoded list
- On success: app unlocks permanently, code is bound to device ID
- On failure: error message, app remains locked
- On subsequent launches: check if already unlocked, skip code screen
- 20–30 unique alphanumeric codes distributed by Endurance

#### F02 — Camera Capture with Smart Overlay (P0)
- Full-screen camera preview
- Blue corner bracket overlay that animates and snaps to document edges
- Real-time alignment guide text
- Document type selector chips: Auto / Table / Text / Form
- Capture button, flash toggle, gallery import
- Optional auto-capture when document is aligned

#### F03 — Auto Document Type Detection (P0)
- After capture, ML model analyzes image to classify document type
- Types: Table, Paragraph, Form, Mixed
- Routes to appropriate extraction pipeline
- Displays detected type badge on review screen

#### F04 — Table Extraction + Structure Preservation (P0)
- Detects table boundaries, rows, columns, cells
- Maps cell positions into a structured grid
- Fills each cell with OCR-extracted text
- Preserves merged cells where detectable
- Outputs structured table data with confidence scores per cell

#### F05 — Paragraph / Text Extraction (P0)
- Detects text blocks and paragraphs
- Identifies heading hierarchy (H1, H2, body)
- Extracts text in reading order
- Preserves paragraph boundaries

#### F06 — OCR for Printed Text (P0)
- PaddleOCR lite model (~20MB) for printed character recognition
- Supports English (P0) and Hindi (P1)
- Returns text with per-word confidence scores
- Target accuracy: ≥95% for clear printed English

#### F07 — OCR for Handwritten Text (P0)
- TrOCR-small model (~35MB) for handwriting recognition
- Supports English handwriting
- Returns text with per-word confidence scores
- Target accuracy: ≥85% for clear handwriting

#### F08 — Interactive Editable Review Screen (P0)
- Split view: original image (top) + extracted data (bottom)
- Table view: cells color-coded by confidence (green/yellow/red)
- Paragraph view: text with confidence-highlighted words
- Tap any element to edit inline
- Pinch-to-zoom on original image for reference

#### F09 — Manual Data Entry / Editing After Extraction (P0)
- Full table editor with cell-level editing
- Add/delete rows and columns
- Merge/split cells
- Copy/clear cell contents
- Undo/redo support
- Manual typing into any cell (including empty cells)
- Paragraph inline editing with keyboard

#### F10 — Export: Excel, PDF, Word, CSV, JSON (P0)
- **Excel (.xlsx):** Structured table with styling, merged cells, headers
- **PDF:** Formatted document with table rendering and paragraph layout
- **Word (.docx):** Structured document with headings, paragraphs, tables
- **CSV:** Flat comma-separated values for simple data tables
- **JSON:** Machine-readable structured output with metadata
- Options: include confidence scores, include original image
- Share sheet integration after export

#### F11 — Form / Field Extraction (P1)
- Detects form layouts (label:value pairs)
- Extracts field names and their values
- Presents in a clean key-value review format

#### F12 — Hindi + English Script Support (P1)
- Language/script detection model routes to appropriate OCR
- PaddleOCR supports bilingual text
- Mixed Hindi + English on same page supported

#### F13 — Scan History and Storage (P1)
- All scans saved locally with thumbnail, metadata, and extracted data
- Search by name or content
- Filter by document type, date range
- Sort by date, name, confidence
- Swipe actions: delete, export
- Persistent storage using AsyncStorage + MMKV

#### F14 — Dark + Light Mode (P1)
- System theme detection
- Manual toggle in settings
- Complete theme implementation across all screens

#### F15 — ML Model Status Screen (P2)
- Shows all 7 ML models with name, purpose, size, and status
- Green/yellow/red status dots
- Total storage used
- Average processing time per document type
- Reload button

---

## 4. User Stories (Gherkin Format)

### US-001: Access Code Activation
```gherkin
Feature: Access Code Lock System
  As an Endurance employee
  I want to enter my activation code to unlock the app
  So that I can access SCANकर's features on my device

  Scenario: Valid access code entry
    Given I have a fresh install of SCANकर
    And I am on the Access Code Lock Screen
    When I enter a valid Endurance activation code "ENDR-7XK9"
    And I tap "Activate App"
    Then the app should display a success animation
    And the app should unlock permanently
    And I should be navigated to the Onboarding screen
    And the code "ENDR-7XK9" should be marked as used

  Scenario: Invalid access code entry
    Given I am on the Access Code Lock Screen
    When I enter an invalid code "WRONG-CODE"
    And I tap "Activate App"
    Then I should see an error message "Invalid code. Please try again or contact your supervisor."
    And the input field should display a red border
    And the app should remain locked

  Scenario: Empty code submission
    Given I am on the Access Code Lock Screen
    When I leave the code field empty
    And I tap "Activate App"
    Then I should see an error message "Please enter an activation code."
    And the app should remain locked

  Scenario: Already activated device
    Given I have previously activated the app with a valid code
    When I open the app
    Then I should skip the Access Code Lock Screen
    And I should be navigated directly to the Home Dashboard
```

### US-002: Document Capture
```gherkin
Feature: Camera Capture
  As an Endurance employee
  I want to capture a photo of a physical document
  So that I can extract its data digitally

  Scenario: Capture a document photo
    Given I am on the Camera Capture screen
    And the camera preview is active
    When I align a printed table within the blue corner brackets
    And I tap the capture button
    Then a high-resolution image should be captured
    And I should be navigated to the Image Preview & Crop screen

  Scenario: Import from gallery
    Given I am on the Camera Capture screen
    When I tap the gallery icon
    And I select an existing image from my photo library
    Then the selected image should open in the Image Preview & Crop screen

  Scenario: Toggle flash
    Given I am on the Camera Capture screen
    When I tap the flash toggle icon
    Then the camera flash should toggle between on, off, and auto modes

  Scenario: Select document type
    Given I am on the Camera Capture screen
    When I tap the "Table" chip in the document type selector
    Then the document type should be set to "Table"
    And the app should use the table-specific extraction pipeline after capture
```

### US-003: Table Extraction
```gherkin
Feature: Table Extraction and Review
  As an Endurance employee
  I want the app to automatically detect and extract table data from my scanned document
  So that I get structured spreadsheet-ready data without manual typing

  Scenario: Successful table extraction
    Given I have captured an image of a printed data table
    And the image has been enhanced and processed
    When the ML pipeline completes table detection and OCR
    Then I should see the Table Review Screen
    And the extracted table should preserve the original row and column structure
    And each cell should display extracted text with a confidence score
    And cells with >90% confidence should be highlighted green
    And cells with 70–90% confidence should be highlighted yellow
    And cells with <70% confidence should be highlighted red

  Scenario: Edit a low-confidence cell
    Given I am on the Table Review Screen
    And a cell shows yellow highlighting (78% confidence)
    When I tap the cell
    Then I should see the original confidence percentage
    And I should be able to edit the cell text inline
    And I should see the corresponding region highlighted on the original image above
```

### US-004: Paragraph Extraction
```gherkin
Feature: Paragraph Extraction and Review
  As an Endurance employee
  I want the app to extract text paragraphs from scanned documents
  So that I can get editable text with proper formatting

  Scenario: Successful paragraph extraction
    Given I have captured an image of a text document
    When the ML pipeline completes text detection and OCR
    Then I should see the Paragraph Review Screen
    And extracted text should preserve heading hierarchy
    And low-confidence words should be highlighted for review

  Scenario: Add a new paragraph
    Given I am on the Paragraph Review Screen
    When I tap "Add Paragraph"
    Then a new editable text block should appear at the bottom
    And my keyboard should be active for typing
```

### US-005: Table Editing
```gherkin
Feature: Table Editor
  As an Endurance employee
  I want to edit the extracted table data before exporting
  So that I can correct errors and add missing information

  Scenario: Edit a cell
    Given I am on the Table Editor Screen
    When I tap on a cell
    Then the cell should become editable
    And the keyboard should appear for input

  Scenario: Add a row
    Given I am on the Table Editor Screen
    When I tap "Add Row"
    Then a new empty row should be added at the bottom of the table

  Scenario: Delete a column via context menu
    Given I am on the Table Editor Screen
    When I long-press on a cell
    And I select "Delete Column" from the context menu
    Then the entire column containing that cell should be removed
    And the table should reflow to fill the gap

  Scenario: Undo an action
    Given I am on the Table Editor Screen
    And I have deleted a row
    When I tap the "Undo" button
    Then the deleted row should be restored to its original position

  Scenario: Manual data entry
    Given I am on the Table Editor Screen
    When I tap on an empty cell
    And I type "125.50"
    Then the cell should display "125.50"
    And the cell should be marked as manually entered
```

### US-006: Export
```gherkin
Feature: Multi-Format Export
  As an Endurance employee
  I want to export extracted data in various formats
  So that I can use the data in my existing workflows

  Scenario: Export as Excel
    Given I am on the Export Screen
    And I have a completed table extraction
    When I select the "Excel (.xlsx)" format tile
    And I tap "Export & Share"
    Then an Excel file should be generated with the table data
    And the file should preserve the table structure (rows, columns, merged cells)
    And the system share sheet should open

  Scenario: Export with confidence scores
    Given I am on the Export Screen
    When I toggle "Include confidence scores" to ON
    And I export as Excel
    Then each cell in the Excel file should include a confidence score annotation

  Scenario: Export as JSON
    Given I am on the Export Screen
    When I select the "JSON" format tile
    And I tap "Export & Share"
    Then a JSON file should be generated with structured data and metadata
    And the share sheet should open
```

### US-007: Scan History
```gherkin
Feature: Scan History
  As an Endurance employee
  I want to access my previously scanned documents
  So that I can review, re-export, or reference past scans

  Scenario: View scan history
    Given I have completed multiple scans
    When I navigate to the History screen
    Then I should see a list of all past scans
    And each scan card should show thumbnail, name, type, date, and confidence

  Scenario: Search scans
    Given I am on the History screen
    When I type "invoice" in the search bar
    Then only scans matching "invoice" should be displayed

  Scenario: Delete a scan
    Given I am on the History screen
    When I swipe left on a scan card
    Then a delete option should appear
    And tapping delete should remove the scan permanently

  Scenario: Filter by type
    Given I am on the History screen
    When I tap the "Tables" filter chip
    Then only table-type scans should be displayed
```

### US-008: Offline Operation
```gherkin
Feature: Offline Operation
  As an Endurance employee in the field
  I want the app to work without internet
  So that I can scan documents anywhere regardless of connectivity

  Scenario: All features work offline
    Given the device has no internet connection (airplane mode)
    When I open SCANकर
    And I capture a document
    And the ML pipeline processes the image
    And I review and edit the extracted data
    And I export the data as Excel
    Then all operations should complete successfully
    And no error messages about connectivity should appear
```

---

## 5. User Flows

### Flow 1: First-Time User (Fresh Install)
```
[Install App]
    ↓
[Screen 00: Access Code Lock]
    ↓ (enter valid code)
[Success Animation]
    ↓
[Screen 01: Onboarding (3 swipe cards)]
    ↓ ("Get Started" or "Skip")
[Screen 02: Home Dashboard]
```

### Flow 2: Returning User (Already Activated)
```
[Open App]
    ↓ (AsyncStorage: unlocked = true)
[Screen 02: Home Dashboard]
```

### Flow 3: Document Scan (Full Pipeline)
```
[Screen 02: Home Dashboard]
    ↓ (tap FAB or hero card)
[Screen 03: Camera Capture]
    ↓ (capture or import)
[Screen 04: Image Preview & Crop]
    ↓ (crop, rotate, enhance → tap "Process")
[Screen 05: Processing Screen]
    ↓ (ML pipeline runs: enhance → detect type → extract → OCR → validate)
    ├── If Table detected:
    │   ↓
    │   [Screen 06: Table Review]
    │       ↓ (tap "Edit")
    │       [Screen 08: Table Editor]
    │           ↓ (edit, add rows, fix cells → "Done")
    │       [Screen 06: Table Review]
    │
    ├── If Paragraph detected:
    │   ↓
    │   [Screen 07: Paragraph Review]
    │       ↓ (inline edits)
    │
    └── If Mixed detected:
        ↓
        [Screen 06 or 07 based on dominant type]
            ↓
[Screen 09: Export Screen]
    ↓ (select format → "Export & Share")
[System Share Sheet]
```

### Flow 4: History Review
```
[Screen 02: Home Dashboard]
    ↓ (tap "History" in bottom nav)
[Screen 10: History / Saved Scans]
    ↓ (search, filter, tap a scan)
[Screen 06 or 07: Review Screen]
    ↓ (optional edit → export)
[Screen 09: Export]
```

### Flow 5: Settings
```
[Screen 02: Home Dashboard]
    ↓ (tap settings icon or "Settings" in bottom nav)
[Screen 11: Settings]
    ↓ (tap "ML Models")
[Screen 12: Model Status Screen]
```

---

## 6. Out of Scope for Version 1

The following features are explicitly excluded from Version 1 and are earmarked for Version 2 (Public) or future updates:

| Feature | Reason for Deferral |
|---|---|
| Public access (no access code) | v1 is employee-only |
| User account creation / login | Not needed for v1 (code-based access) |
| Cloud sync and backup | v1 is fully offline, no server infrastructure |
| Batch scanning (multi-page continuous) | Complexity; v1 focuses on single-page pipeline |
| Multi-user collaboration | No server; v1 is single-user |
| API integrations (Google Sheets, Dropbox, etc.) | Requires internet; v1 is offline |
| Web dashboard | v1 is mobile-only |
| Advanced language support (beyond Hindi + English) | Limited training data; can expand in v2 |
| Voice input for manual entry | Not core to document scanning |
| Barcode / QR code scanning | Different use case; can add in v2 |
| Document classification / tagging | Enhancement for v2 |

---

## 7. Acceptance Criteria Per Feature

### F01 — Access Code Lock System
- [ ] Fresh install shows only the lock screen — no other screens accessible
- [ ] Valid code (from the 20–30 hardcoded list) unlocks the app permanently
- [ ] Invalid code shows an error message and keeps the app locked
- [ ] Empty code submission shows appropriate error
- [ ] After activation, subsequent app launches skip the lock screen
- [ ] Activated code cannot unlock a second device
- [ ] All validation works offline

### F02 — Camera Capture
- [ ] Camera preview fills the screen
- [ ] Blue corner bracket overlay visible and aligned
- [ ] Capture button captures a high-resolution image
- [ ] Flash toggle works (on, off, auto)
- [ ] Gallery import opens device photo library
- [ ] Document type chips (Auto/Table/Text/Form) are selectable
- [ ] Auto-capture triggers when document is aligned (if enabled)

### F03 — Document Type Detection
- [ ] Correctly classifies tables, paragraphs, forms, and mixed documents
- [ ] Classification completes in <0.5 seconds
- [ ] Routes to the correct extraction pipeline based on detected type
- [ ] Displays detected type badge on review screen

### F04 — Table Extraction
- [ ] Row and column structure preserved with ≥90% accuracy
- [ ] Cell text extracted via OCR with per-cell confidence
- [ ] Merged cells detected where applicable
- [ ] Total pipeline time <4 seconds

### F05 — Paragraph Extraction
- [ ] Text blocks detected in reading order
- [ ] Heading hierarchy preserved
- [ ] Paragraph boundaries maintained
- [ ] Total pipeline time <3 seconds

### F06 — Printed Text OCR
- [ ] English printed text accuracy ≥95%
- [ ] Hindi printed text accuracy ≥90% (P1)
- [ ] Per-word confidence scores available

### F07 — Handwritten Text OCR
- [ ] Clear English handwriting accuracy ≥85%
- [ ] Per-word confidence scores available
- [ ] Graceful degradation on poor-quality handwriting

### F08 — Review Screens
- [ ] Split view with original image and extracted data
- [ ] Confidence color coding: green (>90%), yellow (70–90%), red (<70%)
- [ ] Tap-to-edit on any element
- [ ] Pinch-to-zoom on original image

### F09 — Table Editor
- [ ] Cell-level editing via tap
- [ ] Add/delete rows and columns
- [ ] Merge/split cells via long-press context menu
- [ ] Undo/redo with at least 20 steps
- [ ] Manual entry into empty cells
- [ ] Copy and clear cell actions

### F10 — Export
- [ ] All 5 formats generate valid files (Excel, PDF, Word, CSV, JSON)
- [ ] Table structure is preserved in Excel and Word exports
- [ ] Confidence scores optionally included
- [ ] Original image optionally included (PDF, Word)
- [ ] Share sheet opens after export
- [ ] Export completes in <2 seconds

### F11 — Form Extraction (P1)
- [ ] Key-value pairs detected from form layouts
- [ ] Presented in clean review format

### F12 — Hindi + English Support (P1)
- [ ] Language/script detected automatically
- [ ] Mixed language pages handled correctly

### F13 — Scan History (P1)
- [ ] Scans saved with thumbnail, metadata, and full extracted data
- [ ] Search, filter, and sort working
- [ ] Swipe-to-delete and swipe-to-export working

### F14 — Dark + Light Mode (P1)
- [ ] Theme toggle in settings (Light / Dark / System)
- [ ] All screens render correctly in both themes
- [ ] System theme auto-detection works

### F15 — Model Status Screen (P2)
- [ ] All 7 models listed with name, purpose, size, status
- [ ] Status indicators (green/yellow/red) reflect actual model state
- [ ] Total storage and processing time displayed

---

*End of Product Requirements Document*
