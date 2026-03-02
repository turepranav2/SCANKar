# SCANकर — Test Plan

**Version:** 1.0  
**Date:** 2026-03-02  
**Status:** Draft  
**Product:** SCANकर v1 — Industrial Version  
**Aligned To:** SRS v1.0, TDD v1.0

---

## 1. Test Strategy and Approach

### 1.1 Strategy Overview
Testing for SCANकर v1 follows a layered approach aligned with the modular development sequence. Each development module (M1–M10) is tested individually (unit + integration) before system-level testing begins.

### 1.2 Testing Approach
- **Shift-Left:** Testing begins during Module 1 development, not after feature-complete
- **Module Gating:** Each module must pass its unit and integration tests before the next module begins
- **Real Device Priority:** All ML pipeline tests must pass on real devices, not just emulators
- **Regression:** As each module is added, all previous module tests are re-run
- **Offline First:** Every test must pass with airplane mode enabled (no internet)

### 1.3 Testing Tools
| Tool | Purpose |
|---|---|
| Jest | Unit tests (JavaScript/TypeScript logic) |
| React Native Testing Library | Component rendering tests |
| Detox | End-to-end UI tests (Android + iOS) |
| Custom ML benchmarks | Model accuracy and inference speed |
| Android Studio Profiler | Performance profiling (memory, CPU) |
| Xcode Instruments | Performance profiling (iOS) |

---

## 2. Scope of Testing

### 2.1 In-Scope
- All 13 screens (Screen 00 through Screen 12)
- Access code validation (valid, invalid, empty, reuse)
- Camera capture, flash, gallery import
- Image preview, crop, rotate, enhance
- ML pipeline (all 7 models individually and end-to-end)
- Document type detection accuracy
- Table detection and structure reconstruction
- Paragraph detection and ordering
- OCR accuracy (printed English, printed Hindi, handwritten English)
- Table editor (all CRUD operations, undo/redo)
- All 5 export formats (structure preservation validation)
- Scan history (save, search, filter, sort, delete)
- Settings (all toggles and controls)
- Dark mode and light mode (all screens)
- Navigation flows (all routes)
- Offline operation (all features in airplane mode)
- Error handling (all ERR-001 through ERR-013)
- Performance (processing time, memory, app start)

### 2.2 Out-of-Scope
- Server-side testing (no server in v1)
- Cloud integration testing
- Batch scanning (not in v1)
- Load testing / stress testing (20–30 users max, single-user app)
- Accessibility testing (deferred to v2)
- Internationalization beyond Hindi + English
- Version 2 features

---

## 3. Test Environments

### 3.1 Android Devices

| Device | Android Version | RAM | Purpose |
|---|---|---|---|
| Samsung Galaxy A13 | Android 12 | 4GB | Low-end baseline |
| Samsung Galaxy A52 | Android 13 | 6GB | Mid-range primary |
| Google Pixel 6a | Android 14 | 6GB | Stock Android reference |
| Samsung Galaxy S23 | Android 14 | 8GB | High-end performance |
| Older device (Redmi Note 8) | Android 9 | 4GB | Min-spec compatibility |

### 3.2 iOS Devices

| Device | iOS Version | RAM | Purpose |
|---|---|---|---|
| iPhone SE (2nd gen) | iOS 15 | 3GB | Low-end baseline |
| iPhone 12 | iOS 16 | 4GB | Mid-range primary |
| iPhone 14 Pro | iOS 17 | 6GB | High-end performance |
| iPad (9th gen) | iOS 16 | 3GB | Tablet layout test |

### 3.3 Emulators / Simulators  
Used for rapid iteration during development only. All tests must pass on real devices before module sign-off.

| Emulator | Purpose |
|---|---|
| Android Emulator (API 23) | Minimum API level compatibility |
| Android Emulator (API 34) | Latest API compatibility |
| iOS Simulator (iPhone 14) | Development iteration |
| iOS Simulator (iPad) | Tablet layout verification |

---

## 4. Test Types

### 4.1 Unit Tests
**Scope:** Individual functions, utilities, business logic  
**Tool:** Jest  
**Coverage Target:** ≥80% code coverage for business logic layer

| Module | Unit Test Focus |
|---|---|
| Access Code | Hash function, code validation, device ID matching |
| ML Pipeline | Model input preprocessing, output parsing, confidence calculations |
| Export Engine | Excel cell generation, CSV escaping, JSON schema validation |
| History | Search algorithm, filter logic, sort comparators |
| Editor | Undo/redo stack, merge/split logic, row/column operations |
| Settings | Theme resolution, default values, storage persistence |

### 4.2 Integration Tests
**Scope:** Module interactions, data flow between layers  
**Tool:** Jest + custom integration harness

| Integration | Test Focus |
|---|---|
| Camera → Preview | Image data transfer, resolution preservation |
| Preview → ML Pipeline | Preprocessed image format, model input compatibility |
| ML Pipeline → Review | Structured output parsing, confidence mapping |
| Review → Editor | Data model transfer, edit state initialization |
| Editor → Export | Edited data serialization, format correctness |
| History → Review | Saved scan retrieval, data integrity |

### 4.3 UI Tests
**Scope:** Screen rendering, navigation, user interactions  
**Tool:** Detox (E2E)

Each screen is tested for:
- Correct rendering (all elements visible)
- Navigation (forward and back)
- Interactive states (tap, long-press, swipe)
- Theme rendering (light + dark)
- Error state rendering

### 4.4 Performance Tests
**Scope:** Processing time, memory usage, startup time  
**Tool:** Android Profiler, Xcode Instruments, custom timing

| Metric | Target | Method |
|---|---|---|
| Cold start | <3s | Measure from launch to Home screen visible |
| Scan pipeline (total) | <5s | Measure from "Process" tap to review screen display |
| Image enhancement | <1s | Model inference time |
| Document type detection | <0.5s | Model inference time |
| Export generation | <2s | Measure from "Export" tap to file saved |
| Memory (peak during scan) | <500MB | Profile during full pipeline execution |
| Memory (idle) | <150MB | Profile on Home screen |

### 4.5 Offline Tests
**Scope:** All features in airplane mode  
**Method:** Enable airplane mode on device, run full test suite

- Verify no network error messages appear
- Verify no features are degraded or disabled
- Verify no hidden network requests (monitor via proxy during initial test)

### 4.6 Access Code Tests
**Scope:** Lock screen behavior, code validation, device binding  
**Method:** Manual + automated (Detox)

- Fresh install shows only lock screen
- Valid codes unlock
- Invalid codes show error
- Post-unlock persistence
- Code reuse prevention

---

## 5. Test Cases

### Access Code System

| TC ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| TC-001 | Fresh install shows lock screen | 1. Install app fresh. 2. Open app. | Only Access Code Lock Screen is visible. No other navigation or screens. | P0 |
| TC-002 | Valid code activates app | 1. Enter valid code "ENDR-7XK9". 2. Tap "Activate App". | Success animation plays. App navigates to Onboarding. | P0 |
| TC-003 | Invalid code shows error | 1. Enter "WRONG-123". 2. Tap "Activate App". | Error message: "Invalid code. Please try again or contact your supervisor." Input field shows red border. | P0 |
| TC-004 | Empty code shows error | 1. Leave field empty. 2. Tap "Activate App". | Error message: "Please enter an activation code." | P0 |
| TC-005 | Activated app skips lock on relaunch | 1. Activate with valid code. 2. Close app. 3. Reopen app. | App navigates directly to Home Dashboard, skipping lock and onboarding. | P0 |
| TC-006 | Code case insensitivity | 1. Enter valid code in lowercase "endr-7xk9". 2. Tap "Activate App". | Code is normalized to uppercase and validates successfully. | P0 |
| TC-007 | Code with extra whitespace | 1. Enter " ENDR-7XK9 " (with spaces). 2. Tap "Activate App". | Code is trimmed and validates successfully. | P1 |
| TC-008 | All 30 codes validate | 1. Test each of 30 codes on fresh installs. | Each code validates when entered correctly. | P0 |
| TC-009 | Support contact link visible | 1. View lock screen. | "Need help? Contact: support@endurance.com" is visible. | P1 |

### Camera Capture

| TC ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| TC-010 | Camera preview launches | 1. From Home, tap FAB. | Full-screen camera preview is active, rear camera. | P0 |
| TC-011 | Capture button takes photo | 1. On camera screen. 2. Tap capture button. | Image is captured. Navigates to Preview & Crop. | P0 |
| TC-012 | Flash toggle cycles modes | 1. Tap flash icon once. 2. Tap again. 3. Tap again. | Cycles: Off → On → Auto → Off. | P0 |
| TC-013 | Gallery import works | 1. Tap gallery icon. 2. Select an image. | Selected image opens in Preview & Crop. | P0 |
| TC-014 | Document overlay visible | 1. Open camera screen. | Blue corner brackets are displayed on camera preview. | P0 |
| TC-015 | Doc type chips are selectable | 1. Tap "Table" chip. 2. Tap "Text" chip. 3. Tap "Auto" chip. | Selected chip highlights. Type selection persists. | P0 |
| TC-016 | Auto-capture (when enabled) | 1. Enable auto-capture in settings. 2. Open camera. 3. Align a document. | Camera auto-captures when edges are detected and aligned. | P1 |
| TC-017 | Camera permission denied handled | 1. Deny camera permission. 2. Open camera screen. | Error message with option to open Settings. Gallery import offered. | P0 |

### Document Type Detection

| TC ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| TC-018 | Table detection | 1. Scan a printed table. | Document type detected as "Table". Routes to table pipeline. | P0 |
| TC-019 | Paragraph detection | 1. Scan a text-only page. | Document type detected as "Paragraph". Routes to paragraph pipeline. | P0 |
| TC-020 | Form detection | 1. Scan a form with label:value pairs. | Document type detected as "Form". Routes to form pipeline. | P1 |
| TC-021 | Mixed detection | 1. Scan a page with table and text. | Document type detected as "Mixed". Appropriate pipelines invoked. | P0 |
| TC-022 | Detection speed | 1. Measure detection time on 10 different documents. | Average detection time <0.5 seconds. | P0 |
| TC-023 | Detection accuracy | 1. Test with 50 labeled documents. | ≥92% correct classification. | P0 |

### OCR — Printed Text

| TC ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| TC-024 | English printed text (good quality) | 1. Scan a clean printed English page. | OCR accuracy ≥95%. Text matches source. | P0 |
| TC-025 | English printed text (poor quality) | 1. Scan a faded/noisy printed page. | OCR accuracy ≥80%. Low-confidence words highlighted. | P0 |
| TC-026 | Hindi printed text | 1. Scan a clear Hindi Devanagari page. | OCR accuracy ≥90%. Hindi characters correctly recognized. | P1 |
| TC-027 | Mixed English + Hindi | 1. Scan a page with both scripts. | Both scripts recognized. Language tags correct. | P1 |
| TC-028 | Small font (<10pt) | 1. Scan text with very small font. | Reasonable extraction with lower confidence. | P1 |
| TC-029 | Rotated text (slight skew) | 1. Scan a slightly rotated document. | Deskew correction applied. OCR accuracy maintained. | P0 |

### OCR — Handwritten Text

| TC ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| TC-030 | Clear English handwriting | 1. Scan clear handwritten English text. | OCR accuracy ≥85%. Text mostly correct. | P0 |
| TC-031 | Messy handwriting | 1. Scan poorly written text. | System attempts extraction. Low confidence scores. No crash. | P0 |
| TC-032 | Mixed printed + handwritten | 1. Scan page with both. | Printed sections at ≥95%, handwritten at ≥80%. Both tagged. | P0 |
| TC-033 | Numbers and symbols (handwritten) | 1. Scan handwritten numbers and symbols. | Numbers correctly recognized. Common symbols recognized. | P0 |

### Export

| TC ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| TC-034 | Export as Excel | 1. Complete scan. 2. Go to Export. 3. Select Excel. 4. Tap "Export & Share". | Valid .xlsx file generated. Table structure preserved. Share sheet opens. | P0 |
| TC-035 | Export as PDF | 1. Complete scan. 2. Export as PDF. | Valid PDF generated with formatted content. | P0 |
| TC-036 | Export as Word | 1. Complete scan. 2. Export as Word. | Valid .docx file with table/paragraphs. | P0 |
| TC-037 | Export as CSV | 1. Complete scan. 2. Export as CSV. | Valid CSV with proper escaping. | P0 |
| TC-038 | Export as JSON | 1. Complete scan. 2. Export as JSON. | Valid JSON with metadata and structured data. | P0 |
| TC-039 | Include confidence scores | 1. Toggle "Include confidence scores" ON. 2. Export as Excel. | Confidence values appear in exported file. | P0 |
| TC-040 | Include original image (PDF) | 1. Toggle "Include original image" ON. 2. Export as PDF. | Original image embedded in PDF. | P1 |
| TC-041 | Export speed | 1. Measure export time for each format. | All formats <2 seconds. | P0 |
| TC-042 | Merged cells in Excel | 1. Scan a table with merged cells. 2. Export as Excel. | Merged cells preserved in .xlsx. | P1 |
| TC-043 | Share sheet integration | 1. Export any format. | OS share sheet opens with exported file. | P0 |

### Table Editor

| TC ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| TC-044 | Tap cell to edit | 1. On Table Editor, tap a cell. | Cell becomes editable. Keyboard appears. | P0 |
| TC-045 | Add row | 1. Tap "Add Row". | New empty row added at bottom. Table updates. | P0 |
| TC-046 | Add column | 1. Tap "Add Column". | New empty column added at right. Table updates. | P0 |
| TC-047 | Delete row (context menu) | 1. Long-press cell. 2. Select "Delete Row". | Entire row removed. Table reflows. | P0 |
| TC-048 | Delete column (context menu) | 1. Long-press cell. 2. Select "Delete Column". | Entire column removed. Table reflows. | P0 |
| TC-049 | Insert row above | 1. Long-press cell. 2. Select "Insert Row Above". | Empty row inserted above the selected row. | P0 |
| TC-050 | Insert column left | 1. Long-press cell. 2. Select "Insert Column Left". | Empty column inserted to the left. | P0 |
| TC-051 | Merge cells | 1. Long-press cell. 2. Select "Merge". 3. Select adjacent cell(s). | Selected cells merge into one. | P1 |
| TC-052 | Split cell | 1. Long-press merged cell. 2. Select "Split". | Merged cell splits back into individual cells. | P1 |
| TC-053 | Undo action | 1. Delete a row. 2. Tap "Undo". | Deleted row is restored. | P0 |
| TC-054 | Redo action | 1. Undo. 2. Tap "Redo". | Undo is reversed. | P0 |
| TC-055 | Undo 20 actions | 1. Perform 20 edits. 2. Tap "Undo" 20 times. | All 20 actions are undone in reverse order. | P0 |
| TC-056 | Manual entry in empty cell | 1. Tap empty cell. 2. Type "Test Data". | Cell displays "Test Data". Marked as manual entry. | P0 |
| TC-057 | Copy cell | 1. Long-press cell. 2. Select "Copy". | Cell content copied to clipboard. | P1 |
| TC-058 | Clear cell | 1. Long-press cell. 2. Select "Clear". | Cell content cleared. Cell becomes empty. | P0 |
| TC-059 | Done button saves edits | 1. Make edits. 2. Tap "Done". | Edits saved. Navigate back to Review screen with updated data. | P0 |

### History / Saved Scans

| TC ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| TC-060 | Auto-save after scan | 1. Complete a scan pipeline. | Scan appears in History with thumbnail, name, type, date, confidence. | P1 |
| TC-061 | Search scans | 1. Type "invoice" in search bar. | Only matching scans displayed. | P1 |
| TC-062 | Filter by type | 1. Tap "Tables" chip. | Only table-type scans shown. | P1 |
| TC-063 | Filter by date | 1. Tap "Today" chip. | Only today's scans shown. | P1 |
| TC-064 | Sort by confidence | 1. Select sort: Confidence (highest). | Scans sorted by confidence descending. | P1 |
| TC-065 | Swipe left to delete | 1. Swipe left on a scan card. 2. Confirm delete. | Scan permanently removed from history. | P1 |
| TC-066 | Swipe right to export | 1. Swipe right on a scan card. | Export options appear. | P1 |
| TC-067 | Tap to review | 1. Tap a scan card. | Navigate to appropriate Review screen (Table or Paragraph). | P1 |
| TC-068 | Empty state | 1. Clear all history. 2. Open History. | "No scans yet" illustration displayed. | P1 |
| TC-069 | Data persistence | 1. Save a scan. 2. Force close app. 3. Reopen. 4. Check History. | Saved scan still present. | P0 |

### Offline

| TC ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| TC-070 | Full pipeline offline | 1. Enable airplane mode. 2. Capture → Process → Review → Edit → Export. | All steps complete successfully. No errors. | P0 |
| TC-071 | Access code offline | 1. Enable airplane mode. 2. Fresh install. 3. Enter valid code. | Code validates. App unlocks. | P0 |
| TC-072 | No network errors shown | 1. In airplane mode, navigate every screen. | No network-related error messages appear anywhere. | P0 |
| TC-073 | History works offline | 1. In airplane mode. 2. Save scan. 3. View history. 4. Search. 5. Filter. | All history operations work. | P0 |
| TC-074 | Export works offline | 1. In airplane mode. 2. Export in all 5 formats. | All exports generate valid files. | P0 |

### Settings

| TC ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| TC-075 | Theme toggle (Dark) | 1. Select Dark mode. | All screens render in dark theme with correct colors. | P1 |
| TC-076 | Theme toggle (Light) | 1. Select Light mode. | All screens render in light theme. | P1 |
| TC-077 | Theme toggle (System) | 1. Select System. 2. Change device theme. | App follows device theme setting. | P1 |
| TC-078 | Default export format | 1. Set default to PDF. 2. Go to Export screen. | PDF is pre-selected. | P1 |
| TC-079 | Confidence threshold slider | 1. Adjust slider to 80%. | Review screens use 80% as the green/yellow boundary. | P1 |
| TC-080 | Clear cache | 1. Tap "Clear Cache". | Cache is cleared. Storage used decreases. Saved scans are NOT deleted. | P1 |
| TC-081 | Settings persist | 1. Change settings. 2. Force close. 3. Reopen. | Settings are preserved. | P0 |
| TC-082 | Model status navigation | 1. Tap "ML Models". | Navigate to Model Status Screen (Screen 12). | P1 |
| TC-083 | Model status display | 1. View Model Status Screen. | All 7 models listed with name, purpose, size, status dot. | P2 |

---

## 6. Acceptance Criteria

Testing is considered complete and the release is approved when:

1. **All P0 test cases pass** on at least 2 Android devices and 1 iOS device
2. **≥90% of P1 test cases pass** on the primary test device per platform
3. **Zero critical or blocker bugs** remain open
4. **OCR accuracy meets targets:**
   - Printed English ≥95% (measured on 50-sample test set)
   - Printed Hindi ≥90% (measured on 30-sample test set)
   - Handwritten English ≥85% (measured on 30-sample test set)
5. **Processing speed meets targets:**
   - Full pipeline <5s (on mid-range devices)
   - Export <2s (all formats)
   - App cold start <3s
6. **100% offline functionality** — complete pipeline works in airplane mode
7. **All 30 access codes validate correctly** on fresh install
8. **All 5 export formats generate valid files** verified by opening in respective apps
9. **Dark and light modes render correctly** on all screens
10. **No data loss** — edited data is preserved through review → editor → export flow

---

## 7. Bug Reporting Process

### 7.1 Bug Severity Levels

| Level | Definition | Response Time |
|---|---|---|
| **Blocker** | App crashes, feature completely non-functional, data loss | Fix immediately (same day) |
| **Critical** | Major feature broken, no workaround available | Fix within 1 business day |
| **Major** | Feature broken but workaround exists, or minor data integrity issue | Fix within 3 business days |
| **Minor** | UI cosmetic issue, non-critical behavior inconsistency | Fix before release (if time allows) |
| **Enhancement** | Suggestion for improvement, not a defect | Defer to backlog |

### 7.2 Bug Report Template

```
Bug ID: BUG-XXX
Title: [Brief descriptive title]
Severity: [Blocker / Critical / Major / Minor]
Reporter: [Name]
Date: [Date]
Module: [M1–M10 or cross-module]
Screen: [Screen number]
Device: [Device model + OS version]
Steps to Reproduce:
  1. ...
  2. ...
  3. ...
Expected Result: [What should happen]
Actual Result: [What actually happened]
Attachment: [Screenshot / screen recording]
Regression: [Is this a regression from a previous working build? Y/N]
```

### 7.3 Bug Lifecycle

```
NEW → TRIAGED → ASSIGNED → IN PROGRESS → FIXED → VERIFIED → CLOSED
                                              ↓
                                          REOPENED (if fix fails verification)
```

---

## 8. Testing Schedule Aligned to Development Modules

| Phase | Module | Dev Duration | Test Start | Test Duration | Key Tests |
|---|---|---|---|---|---|
| M0 | Project Setup | 1 week | Week 1 | 0.5 week | Build verification, project structure |
| M1 | Camera + Crop + Enhancement | 2 weeks | Week 2 | 1 week (overlap) | TC-010 to TC-017 |
| M2 | Document Type Detection | 1.5 weeks | Week 4 | 1 week (overlap) | TC-018 to TC-023 |
| M3 | Table Pipeline | 2.5 weeks | Week 6 | 1.5 weeks | TC-024 to TC-029, TC-032 |
| M4 | Paragraph Pipeline | 2 weeks | Week 8 | 1 week | TC-024 to TC-033 (paragraph variant) |
| M5 | Editor + Manual Entry | 2 weeks | Week 10 | 1.5 weeks | TC-044 to TC-059 |
| M6 | Export Engine | 2 weeks | Week 12 | 1.5 weeks | TC-034 to TC-043 |
| M7 | History + Storage | 1.5 weeks | Week 14 | 1 week | TC-060 to TC-069 |
| M8 | Settings + Model Manager | 1 week | Week 15 | 0.5 week | TC-075 to TC-083 |
| M9 | Access Code System | 1 week | Week 10 (parallel) | 0.5 week | TC-001 to TC-009 |
| M10 | Integration + Polish | 2 weeks | Week 16 | 2 weeks | Full regression, TC-070 to TC-074 |
| M11 | **Full QA Pass** | — | Week 18 | 2 weeks | All test cases, performance, device matrix |

### Test Milestones

| Milestone | Week | Criteria |
|---|---|---|
| M1 Test Complete | Week 3 | Camera + crop + enhance: all P0 tests pass |
| M3 Test Complete | Week 8 | Table pipeline: OCR accuracy verified |
| M6 Test Complete | Week 14 | All export formats validated |
| M9 Test Complete | Week 11 | Access code system fully tested |
| Integration Test Complete | Week 18 | Full regression pass |
| **Release Go/No-Go** | **Week 19** | All acceptance criteria met |

---

*End of Test Plan*
