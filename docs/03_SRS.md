# SCANकर — Software Requirements Specification (SRS)

**Version:** 1.0  
**Date:** 2026-03-02  
**Status:** Draft  
**Standard:** Based on IEEE 830-1998 SRS format  
**Product:** SCANकर v1 — Industrial Version

---

## 1. Introduction and Purpose

### 1.1 Purpose
This Software Requirements Specification (SRS) defines the complete functional and non-functional requirements for SCANकर Version 1 (Industrial). It serves as the authoritative reference for the development team, testers, and stakeholders.

### 1.2 Scope
SCANकर v1 is a cross-platform mobile application (Android + iOS) that uses on-device machine learning to scan physical documents, detect document types, extract structured data (tables, paragraphs, forms), perform OCR on printed and handwritten text, provide interactive editing, and export results in multiple formats — all without internet connectivity.

### 1.3 Definitions and Acronyms

| Term | Definition |
|---|---|
| OCR | Optical Character Recognition |
| TFLite | TensorFlow Lite — mobile ML inference runtime |
| CRAFT | Character Region Awareness for Text Detection |
| PaddleOCR | Baidu's open-source OCR framework |
| TrOCR | Transformer-based OCR model by Microsoft |
| DocLayNet | Document Layout Analysis model |
| TATR | Table Transformer (detection and structure recognition) |
| AsyncStorage | React Native key-value storage system |
| MMKV | High-performance key-value storage by WeChat |
| FAB | Floating Action Button |

### 1.4 References
- 01_BRD.md — Business Requirements Document
- 02_PRD.md — Product Requirements Document
- 04_TDD.md — Technical Design Document
- 05_TestPlan.md — Test Plan

---

## 2. Overall Description

### 2.1 Product Perspective
SCANकर is a standalone mobile application. It does not depend on any external server, API, or cloud service. All processing occurs on the user's device using embedded ML models totaling approximately 130MB.

### 2.2 Product Functions (High-Level)
1. Access code validation and device locking
2. Camera-based document capture with smart overlay
3. Image enhancement and preprocessing
4. Automatic document type detection
5. Table structure detection and cell extraction
6. Paragraph and text block detection
7. Printed text OCR (English, Hindi)
8. Handwritten text OCR (English)
9. Interactive review with confidence visualization
10. Full table editing with manual data entry
11. Multi-format export (Excel, PDF, Word, CSV, JSON)
12. Scan history management
13. App settings and ML model status

### 2.3 User Characteristics
Users are Endurance employees with moderate technical proficiency. They are familiar with smartphones and basic apps (WhatsApp, camera, gallery) but are not developers or power users. The app must be intuitive enough to use without training beyond the onboarding screens.

### 2.4 Constraints
- All ML models must run on-device using TFLite
- Total model size ≤ 130MB
- No internet connectivity required or assumed
- React Native CLI codebase (not Expo)
- Android 6.0+ and iOS 12.0+ compatibility

### 2.5 Operating Environment
- **Mobile OS:** Android 6.0 (API 23) and above, iOS 12.0 and above
- **Hardware:** Minimum 3GB RAM, ARM-based processor, camera with autofocus
- **Storage:** ~250MB total (app + models + initial data)
- **Connectivity:** None required (fully offline)

---

## 3. Functional Requirements

### Access Code System

| ID | Requirement | Priority |
|---|---|---|
| FR-001 | On fresh install, the app SHALL display only the Access Code Lock Screen. No other screens, features, or navigation elements shall be accessible until activation. | P0 |
| FR-002 | The Access Code Lock Screen SHALL contain: Endurance logo, "SCANकर" app name, "Employee Access" title, code input field (placeholder "XXXX-XXXX"), "Activate App" button, and support contact info. | P0 |
| FR-003 | The system SHALL validate the entered code against a hardcoded list of 20–30 unique alphanumeric codes embedded in the application bundle. | P0 |
| FR-004 | Validation SHALL occur entirely offline with no network requests. | P0 |
| FR-005 | On valid code entry, the system SHALL: (a) store the unlocked state and device identifier in AsyncStorage, (b) mark the code as consumed locally, (c) display a success animation, and (d) navigate to the Onboarding screen. | P0 |
| FR-006 | On invalid code entry, the system SHALL: (a) display an error message "Invalid code. Please try again or contact your supervisor.", (b) highlight the input field with a red border, and (c) keep the app locked. | P0 |
| FR-007 | On subsequent app launches, the system SHALL check AsyncStorage for the unlocked state. If unlocked, skip the lock screen and navigate directly to the Home Dashboard. | P0 |
| FR-008 | Each activation code SHALL be valid for exactly one device. Once activated on a device, the code cannot be used on another device. | P0 |

### Camera and Image Capture

| ID | Requirement | Priority |
|---|---|---|
| FR-009 | The Camera Capture screen SHALL display a full-screen camera preview using the device's rear camera. | P0 |
| FR-010 | The system SHALL overlay blue corner bracket guides that animate and visually snap to detected document edges. | P0 |
| FR-011 | The system SHALL display a real-time alignment tip text at the top of the camera screen (e.g., "Align document edges with the guide"). | P0 |
| FR-012 | The Camera screen SHALL provide document type selector chips: Auto, Table, Text, Form. Default: Auto. | P0 |
| FR-013 | The system SHALL provide a capture button (center), flash toggle (left), and gallery import (right) in the bottom control bar. | P0 |
| FR-014 | Tapping the capture button SHALL capture a high-resolution image (minimum 2048×1536 px or device native resolution). | P0 |
| FR-015 | The gallery import option SHALL open the device photo library and allow selection of an existing image. | P0 |
| FR-016 | The system SHALL provide an auto-capture toggle that, when enabled, automatically captures the image when document edges are detected and aligned. | P1 |
| FR-017 | The flash toggle SHALL cycle through: Off → On → Auto. | P0 |

### Image Preview and Crop

| ID | Requirement | Priority |
|---|---|---|
| FR-018 | The Image Preview screen SHALL display the captured image with draggable crop handles at the four corners (blue). | P0 |
| FR-019 | The system SHALL provide rotate left and rotate right buttons. Each rotation step SHALL be 90 degrees. | P0 |
| FR-020 | The system SHALL provide brightness and contrast adjustment sliders in a bottom drawer. | P0 |
| FR-021 | The system SHALL provide a one-tap "Enhance" button (magic wand icon) that applies the Image Enhancement ML model to optimize brightness, contrast, sharpness, and noise reduction. | P0 |
| FR-022 | The system SHALL provide a "Process →" CTA button to proceed to processing and a "Retake" button to return to the camera. | P0 |

### ML Pipeline

| ID | Requirement | Priority |
|---|---|---|
| FR-023 | The ML pipeline SHALL consist of 7 models loaded and executed via TensorFlow Lite: (1) Image Enhancement ~10MB, (2) Document Layout Analysis ~20MB, (3) Table Detection + Structure ~15MB, (4) Text Detection ~25MB, (5) Printed Text OCR ~20MB, (6) Handwriting Recognition ~35MB, (7) Language/Script Detection ~5MB. | P0 |
| FR-024 | The pipeline SHALL execute in this order: Image Enhancement → Document Layout Analysis → Branch (Table / Paragraph / Form / Mixed) → Text Detection → OCR (Printed and/or Handwritten) → Language Detection → Validation. | P0 |
| FR-025 | The pipeline SHALL route to the appropriate sub-pipeline based on the detected document type: Table pipeline (models 3+4+5+6), Paragraph pipeline (models 4+5+6), Form pipeline (models 4+5+6), Mixed pipeline (all relevant models). | P0 |
| FR-026 | All models SHALL be embedded in the application bundle and loaded from local storage. No model downloads shall be required at runtime. | P0 |
| FR-027 | The pipeline SHALL return structured output with per-element confidence scores (0.0 to 1.0). | P0 |

### Table Detection and Reconstruction

| ID | Requirement | Priority |
|---|---|---|
| FR-028 | The table detection model SHALL identify table boundaries, row separators, and column separators in the input image. | P0 |
| FR-029 | The system SHALL reconstruct a structured grid (rows × columns) from the detected table elements. | P0 |
| FR-030 | Each cell in the reconstructed table SHALL be individually OCR-processed and assigned a confidence score. | P0 |
| FR-031 | The system SHALL attempt to detect merged cells and represent them in the output structure. | P1 |
| FR-032 | The table reconstruction accuracy SHALL be ≥90% for clear printed tables (correct row/column mapping). | P0 |

### Paragraph Detection

| ID | Requirement | Priority |
|---|---|---|
| FR-033 | The text detection model SHALL identify text blocks and paragraph boundaries in the input image. | P0 |
| FR-034 | The system SHALL detect heading hierarchy (H1, H2, body text) based on font size and weight analysis. | P0 |
| FR-035 | Text blocks SHALL be ordered in natural reading order (left-to-right, top-to-bottom for English; appropriate for Hindi). | P0 |
| FR-036 | Each paragraph SHALL be a separately editable element in the review screen. | P0 |

### Form Detection

| ID | Requirement | Priority |
|---|---|---|
| FR-037 | The system SHALL detect form-style layouts containing label:value pairs. | P1 |
| FR-038 | Detected form fields SHALL be presented as structured key-value pairs in the review screen. | P1 |

### OCR

| ID | Requirement | Priority |
|---|---|---|
| FR-039 | The printed text OCR model (PaddleOCR lite) SHALL recognize English characters with ≥95% accuracy on clear, well-lit, non-rotated printed text. | P0 |
| FR-040 | The printed text OCR model SHALL recognize Hindi Devanagari characters with ≥90% accuracy on clear printed text. | P1 |
| FR-041 | The handwriting recognition model (TrOCR-small) SHALL recognize English handwriting with ≥85% accuracy on clear, readable handwriting. | P0 |
| FR-042 | The language/script detection model SHALL automatically determine whether text is English, Hindi, or mixed, and route to the appropriate OCR model. | P1 |
| FR-043 | All OCR results SHALL include per-word confidence scores (0.0–1.0). | P0 |
| FR-044 | The system SHALL flag words with confidence <70% for user review. | P0 |

### Edit and Manual Entry

| ID | Requirement | Priority |
|---|---|---|
| FR-045 | The Table Review Screen SHALL display the original image (top panel, pinch-to-zoom) and the extracted table (bottom panel, scrollable). | P0 |
| FR-046 | Table cells SHALL be color-coded: green (#22C55E) for >90% confidence, yellow (#F59E0B) for 70–90%, red (#EF4444) for <70%. | P0 |
| FR-047 | Tapping a cell SHALL show its confidence score and enable inline editing. | P0 |
| FR-048 | The Table Editor screen SHALL support: cell editing via tap, add row (bottom), add column (right). | P0 |
| FR-049 | Long-pressing a cell SHALL show a context menu with: Insert Row Above, Insert Row Below, Insert Column Left, Insert Column Right, Delete Row, Delete Column, Merge Cells, Split Cell, Clear Cell, Copy Cell. | P0 |
| FR-050 | The editor SHALL support undo and redo with a minimum history of 20 actions. | P0 |
| FR-051 | The editor SHALL allow free-form manual typing into any cell, including empty cells. | P0 |
| FR-052 | The Paragraph Review Screen SHALL display a thumbnail of the original image and extracted text with heading hierarchy. | P0 |
| FR-053 | Tapping a paragraph SHALL enable inline editing of that paragraph's text. | P0 |
| FR-054 | An "Add Paragraph" button SHALL allow adding a new text block at the bottom. | P0 |
| FR-055 | Editing SHALL support standard keyboard input with no special constraints. | P0 |

### Export

| ID | Requirement | Priority |
|---|---|---|
| FR-056 | The Export screen SHALL display a document preview card (thumbnail + metadata) and 5 format selector tiles: Excel (.xlsx), PDF, Word (.docx), CSV, JSON. | P0 |
| FR-057 | Excel export SHALL generate a valid .xlsx file with the table data preserving structure, merged cells, and header row styling. | P0 |
| FR-058 | PDF export SHALL generate a formatted document with rendered tables, paragraphs, and optional original image. | P0 |
| FR-059 | Word export SHALL generate a valid .docx file with structured headings, paragraphs, and tables. | P0 |
| FR-060 | CSV export SHALL generate a flat comma-separated file. For multi-table documents, each table shall be a separate section. | P0 |
| FR-061 | JSON export SHALL generate a structured JSON file with metadata (scan date, document type, confidence) and extracted data. | P0 |
| FR-062 | The system SHALL provide toggles for: "Include confidence scores" and "Include original image". | P0 |
| FR-063 | After export, the system SHALL open the OS-native share sheet for the generated file. | P0 |
| FR-064 | Export generation time SHALL be <2 seconds for any format. | P0 |

### History and Storage

| ID | Requirement | Priority |
|---|---|---|
| FR-065 | The system SHALL automatically save each completed scan with: thumbnail, document name (auto-generated), document type, scan date/time, confidence score, full extracted data. | P1 |
| FR-066 | The History screen SHALL display saved scans as cards with: thumbnail, name, type badge, date, overall confidence. | P1 |
| FR-067 | The History screen SHALL provide a search bar that filters scans by name. | P1 |
| FR-068 | The History screen SHALL provide filter chips: All, Tables, Paragraphs, Forms, Today, This Week. | P1 |
| FR-069 | The History screen SHALL provide sort options: Date (newest/oldest), Name (A–Z/Z–A), Confidence (highest/lowest). | P1 |
| FR-070 | Swiping left on a scan card SHALL reveal a Delete action. Swiping right SHALL reveal an Export action. | P1 |
| FR-071 | Tapping a scan card SHALL navigate to its Review screen (Table or Paragraph). | P1 |
| FR-072 | The system SHALL display an empty state illustration with text "No scans yet" when history is empty. | P1 |

### Settings

| ID | Requirement | Priority |
|---|---|---|
| FR-073 | The Settings screen SHALL provide a theme toggle: Light / Dark / System. | P1 |
| FR-074 | The Settings screen SHALL provide a default export format selector. | P1 |
| FR-075 | The Settings screen SHALL provide toggles for: Auto-enhance on capture, Auto-capture when aligned. | P1 |
| FR-076 | The Settings screen SHALL provide OCR language selection: English / Hindi / Auto. | P1 |
| FR-077 | The Settings screen SHALL provide a confidence threshold slider (default 70%, range 50%–95%). | P1 |
| FR-078 | The Settings screen SHALL display storage used and provide a "Clear Cache" button. | P1 |
| FR-079 | The Settings screen SHALL provide a link to the ML Model Status screen. | P1 |
| FR-080 | The Settings screen SHALL display: App Version, Endurance logo, support contact information. | P1 |

### Offline Operation

| ID | Requirement | Priority |
|---|---|---|
| FR-081 | All features defined in this SRS SHALL function with no internet connectivity. | P0 |
| FR-082 | The system SHALL NOT make any network requests during normal operation. | P0 |
| FR-083 | The system SHALL NOT display any errors, warnings, or degraded functionality due to lack of internet. | P0 |

---

## 4. Non-Functional Requirements

### Performance

| ID | Requirement | Category |
|---|---|---|
| NFR-001 | Total processing time from image capture to review screen display SHALL be <5 seconds on devices with ≥4GB RAM. | Performance |
| NFR-002 | Image enhancement model inference SHALL complete in <1 second. | Performance |
| NFR-003 | Document type detection SHALL complete in <0.5 seconds. | Performance |
| NFR-004 | Table extraction pipeline (detection + structure + OCR) SHALL complete in <4 seconds. | Performance |
| NFR-005 | Paragraph extraction pipeline (detection + OCR) SHALL complete in <3 seconds. | Performance |
| NFR-006 | Export file generation SHALL complete in <2 seconds for any format. | Performance |
| NFR-007 | App cold start time SHALL be <3 seconds on mid-range devices. | Performance |
| NFR-008 | Camera preview frame rate SHALL be ≥24 fps. | Performance |
| NFR-009 | UI interactions (taps, scrolls, transitions) SHALL respond within 100ms. | Performance |

### Accuracy

| ID | Requirement | Category |
|---|---|---|
| NFR-010 | Printed English text OCR accuracy SHALL be ≥95% under good conditions (clear text, good lighting, no rotation). | Accuracy |
| NFR-011 | Printed Hindi text OCR accuracy SHALL be ≥90% under good conditions. | Accuracy |
| NFR-012 | Handwritten English text OCR accuracy SHALL be ≥85% for clear, readable handwriting. | Accuracy |
| NFR-013 | Table structure reconstruction accuracy SHALL be ≥90% (correct row/column mapping). | Accuracy |
| NFR-014 | Document type classification accuracy SHALL be ≥92%. | Accuracy |

### Storage

| ID | Requirement | Category |
|---|---|---|
| NFR-015 | Total ML model storage SHALL NOT exceed 130MB. | Storage |
| NFR-016 | Application binary (excluding models) SHALL NOT exceed 50MB. | Storage |
| NFR-017 | Each saved scan (history) SHALL NOT exceed 5MB of storage. | Storage |
| NFR-018 | The app SHALL show storage usage in Settings and allow cache clearing. | Storage |

### Compatibility

| ID | Requirement | Category |
|---|---|---|
| NFR-019 | The app SHALL support Android 6.0 (API 23) and above. | Compatibility |
| NFR-020 | The app SHALL support iOS 12.0 and above. | Compatibility |
| NFR-021 | The app SHALL function correctly on screen sizes from 5" to 12.9" (phones and tablets). | Compatibility |
| NFR-022 | The app SHALL support both portrait and landscape orientations for the camera screen. Other screens may be portrait-only. | Compatibility |

### Offline

| ID | Requirement | Category |
|---|---|---|
| NFR-023 | 100% of app functionality SHALL be available without internet connectivity. | Offline |
| NFR-024 | No feature SHALL require or attempt network access. | Offline |
| NFR-025 | The app SHALL NOT include any analytics, telemetry, or crash reporting that requires internet. | Offline |

### Security

| ID | Requirement | Category |
|---|---|---|
| NFR-026 | User-scanned documents and extracted data SHALL NOT leave the device at any time except through explicit user-initiated export/share actions. | Security |
| NFR-027 | Access codes SHALL be stored in an obfuscated format within the application bundle. | Security |
| NFR-028 | The device unlock state SHALL be stored securely using AsyncStorage with the device identifier as a binding key. | Security |
| NFR-029 | No personally identifiable information (PII) SHALL be collected or stored beyond device identifier for code binding. | Security |

### Usability

| ID | Requirement | Category |
|---|---|---|
| NFR-030 | The app SHALL be usable by employees with moderate technical proficiency without external training (beyond in-app onboarding). | Usability |
| NFR-031 | All primary workflows (scan → review → export) SHALL be completable in ≤5 taps from the Home Dashboard. | Usability |
| NFR-032 | The app SHALL support both light and dark color themes. | Usability |
| NFR-033 | All interactive elements SHALL have minimum touch targets of 44×44dp. | Usability |

### Reliability

| ID | Requirement | Category |
|---|---|---|
| NFR-034 | The app SHALL NOT crash during normal operation. Crash-free rate target: ≥99.5%. | Reliability |
| NFR-035 | If an ML model fails to load, the app SHALL display a clear error message and allow the user to retry. Other features not dependent on the failed model SHALL remain functional. | Reliability |
| NFR-036 | If the camera fails to initialize, the app SHALL display an error message and offer the gallery import as an alternative. | Reliability |

---

## 5. System Constraints

| # | Constraint | Description |
|---|---|---|
| SC-001 | React Native CLI | The app SHALL be built using React Native CLI (not Expo) to support native module integration for TFLite and OpenCV. |
| SC-002 | TensorFlow Lite | All ML models SHALL be deployed as TFLite (.tflite) files for mobile inference. |
| SC-003 | No Server Infrastructure | v1 SHALL have zero backend/server dependencies. |
| SC-004 | Embedded ML Models | All models SHALL be included in the app bundle at build time. No over-the-air model downloads. |
| SC-005 | Single Language Codebase | JavaScript/TypeScript with React Native. Native modules (Java/Kotlin for Android, Objective-C/Swift for iOS) only where strictly necessary (camera, TFLite bridge). |
| SC-006 | No Third-Party Cloud Services | No Firebase, AWS, Google Cloud, or any cloud service dependency. |

---

## 6. Assumptions and Dependencies

### Assumptions

| # | Assumption |
|---|---|
| A-001 | Endurance will distribute activation codes to employees through internal channels (email, in-person). |
| A-002 | Target devices have functional rear cameras with autofocus capability. |
| A-003 | Documents to be scanned are individual pages (not multi-page booklets in v1). |
| A-004 | Users will scan documents in reasonable lighting conditions (not pitch darkness). |
| A-005 | The app is the sole consumer of the activation codes — no server-side code management needed for v1. |
| A-006 | 20–30 codes are sufficient for v1 deployment. |

### Dependencies

| # | Dependency | Type |
|---|---|---|
| D-001 | React Native CLI (latest stable) | Framework |
| D-002 | TensorFlow Lite for React Native | ML Runtime |
| D-003 | OpenCV for React Native (react-native-opencv) | Computer Vision |
| D-004 | React Navigation v6 | Navigation |
| D-005 | AsyncStorage (@react-native-async-storage/async-storage) | Storage |
| D-006 | MMKV (react-native-mmkv) | High-Performance Storage |
| D-007 | react-native-camera or react-native-vision-camera | Camera |
| D-008 | react-native-share | Export/Share |
| D-009 | xlsx (SheetJS) for Excel generation | Export |
| D-010 | react-native-pdf-lib or similar for PDF generation | Export |
| D-011 | docx (npm package) for Word generation | Export |
| D-012 | Google Colab (training only, not runtime) | ML Training |

---

## 7. Data Flow Diagrams

### 7.1 High-Level System Data Flow

```
┌──────────────────────────────────────────────────────────────┐
│                     USER'S DEVICE                            │
│                                                              │
│  ┌─────────┐    ┌──────────┐    ┌────────────────────────┐  │
│  │ Camera / │───▶│  Image   │───▶│    ML PIPELINE         │  │
│  │ Gallery  │    │  Preview │    │                        │  │
│  └─────────┘    │  & Crop  │    │  1. Enhancement        │  │
│                 └──────────┘    │  2. Layout Analysis     │  │
│                                 │  3. Type Detection      │  │
│                                 │     ┌─────┬──────┬────┐ │  │
│                                 │     │Table│Para  │Form│ │  │
│                                 │     ├─────┼──────┼────┤ │  │
│                                 │  4. │Table│Text  │Text│ │  │
│                                 │     │Det. │Det.  │Det.│ │  │
│                                 │  5. │OCR  │OCR   │OCR │ │  │
│                                 │  6. │HWR  │HWR   │HWR │ │  │
│                                 │  7. │Lang │Lang  │Lang│ │  │
│                                 │     └──┬──┴──┬───┴──┬─┘ │  │
│                                 └────────┼─────┼──────┼───┘  │
│                                          ▼     ▼      ▼      │
│  ┌──────────────────────────────────────────────────────┐    │
│  │              REVIEW SCREENS                           │    │
│  │  Table Review / Paragraph Review / Form Review        │    │
│  │  (confidence color-coding, tap-to-edit)               │    │
│  └───────────────────────┬──────────────────────────────┘    │
│                          ▼                                    │
│  ┌──────────────────────────────────────────────────────┐    │
│  │              TABLE EDITOR                             │    │
│  │  (add/delete rows/cols, merge, manual entry)          │    │
│  └───────────────────────┬──────────────────────────────┘    │
│                          ▼                                    │
│  ┌──────────────────────────────────────────────────────┐    │
│  │              EXPORT ENGINE                            │    │
│  │  ┌─────┐ ┌─────┐ ┌──────┐ ┌─────┐ ┌──────┐          │    │
│  │  │XLSX │ │ PDF │ │ DOCX │ │ CSV │ │ JSON │          │    │
│  │  └──┬──┘ └──┬──┘ └──┬───┘ └──┬──┘ └──┬───┘          │    │
│  └─────┼───────┼───────┼────────┼───────┼───────────────┘    │
│        ▼       ▼       ▼        ▼       ▼                    │
│  ┌──────────────────────────────────────────────────────┐    │
│  │              SHARE SHEET (OS Native)                   │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │              LOCAL STORAGE                             │    │
│  │  AsyncStorage: unlock state, settings, preferences    │    │
│  │  MMKV: scan history, extracted data, thumbnails       │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 7.2 Access Code Validation Flow

```
┌──────────┐    ┌───────────────┐    ┌──────────────────┐
│   User   │───▶│  Enter Code   │───▶│  Validate Against │
│  Input   │    │  on Lock      │    │  Hardcoded List   │
└──────────┘    │  Screen       │    └────────┬─────────┘
                └───────────────┘             │
                                    ┌────────┴────────┐
                                    │                 │
                              ┌─────▼─────┐    ┌─────▼─────┐
                              │   VALID   │    │  INVALID  │
                              └─────┬─────┘    └─────┬─────┘
                                    │                 │
                              ┌─────▼──────┐   ┌─────▼──────┐
                              │ Store:     │   │ Show Error │
                              │ - unlocked │   │ Message    │
                              │ - deviceID │   │ + Red      │
                              │ - usedCode │   │   Border   │
                              └─────┬──────┘   └────────────┘
                                    │
                              ┌─────▼──────┐
                              │ Navigate   │
                              │ to App     │
                              └────────────┘
```

### 7.3 ML Pipeline Data Flow

```
Input Image (JPEG/PNG)
       │
       ▼
┌──────────────────┐
│ 1. ENHANCEMENT   │ ← Image Enhancement Model (~10MB)
│    - Denoise      │    Input: Raw image tensor
│    - Auto-level   │    Output: Enhanced image tensor
│    - Sharpen      │
└────────┬─────────┘
         ▼
┌──────────────────┐
│ 2. LAYOUT        │ ← Document Layout Analysis (~20MB)
│    ANALYSIS       │    Input: Enhanced image
│    - Detect zones │    Output: Bounding boxes + class labels
│    - Classify     │    Classes: table, text, figure, list, form
└────────┬─────────┘
         │
    ┌────┴─────────────────────────────┐
    │         ROUTING LOGIC            │
    │  Table? → Table Pipeline         │
    │  Text?  → Paragraph Pipeline     │
    │  Form?  → Form Pipeline          │
    │  Mixed? → All Pipelines          │
    └────┬──────────┬──────────────────┘
         │          │
    TABLE │     PARAGRAPH
         │          │
    ┌────▼────┐ ┌───▼───────────┐
    │ 3. TATR │ │ 4. CRAFT      │ ← Text Detection (~25MB)
    │  Table  │ │  Text Region  │    Input: Image region
    │  Det.   │ │  Detection    │    Output: Text bounding boxes
    └────┬────┘ └───┬───────────┘
         │          │
         ▼          ▼
    ┌────────────────────┐
    │ 5. PaddleOCR Lite  │ ← Printed OCR (~20MB)
    │    Printed Text    │    Input: Text region image
    │    Recognition     │    Output: Text + confidence
    └────────┬───────────┘
             │
    ┌────────▼───────────┐
    │ 6. TrOCR-Small     │ ← Handwriting OCR (~35MB)
    │    Handwriting      │    Input: Handwritten region
    │    Recognition      │    Output: Text + confidence
    └────────┬───────────┘
             │
    ┌────────▼───────────┐
    │ 7. LANGUAGE DET.   │ ← Script Detection (~5MB)
    │    Script/Language  │    Input: Text string
    │    Identification   │    Output: Language label
    └────────┬───────────┘
             │
             ▼
    ┌────────────────────┐
    │ STRUCTURED OUTPUT  │
    │  - Table grid      │
    │  - Paragraphs      │
    │  - Confidence map  │
    │  - Language tags    │
    └────────────────────┘
```

---

## 8. Error Handling Requirements

| ID | Error Condition | Required Behavior |
|---|---|---|
| ERR-001 | Camera permission denied | Display a permission request dialog explaining why camera access is needed. Provide a button to open device settings. Offer gallery import as an alternative. |
| ERR-002 | Camera fails to initialize | Display: "Camera unavailable. You can import an image from your gallery instead." Show gallery import button. |
| ERR-003 | Storage permission denied (Android) | Display a permission request dialog. Explain that storage is needed for saving scans and exports. |
| ERR-004 | ML model fails to load | Display: "Model [name] could not be loaded. Please restart the app." Log the error locally. Features not dependent on the failed model should remain functional. |
| ERR-005 | ML inference produces empty output | Display: "Could not extract data from this image. Try recapturing with better lighting or angle." Allow the user to retake or manually enter data. |
| ERR-006 | Image too blurry for OCR | Display: "Image quality is too low for accurate text extraction. Please recapture." Show a retake button. |
| ERR-007 | Export fails (file generation error) | Display: "Export failed. Please try again." Log the error. Allow retry. |
| ERR-008 | Storage full | Display: "Device storage is full. Please free up space or clear scan history." Link to cache clearing in Settings. |
| ERR-009 | Invalid access code (format) | Display: "Please enter a valid activation code in the format XXXX-XXXX." Do not attempt validation against the code list. |
| ERR-010 | Access code already used on another device | Display: "This code has already been activated on another device. Please contact your supervisor for a new code." |
| ERR-011 | Scan data corruption in history | Display: "This scan could not be loaded. It may be corrupted." Offer to delete the corrupted entry. |
| ERR-012 | Insufficient device RAM for ML | Display: "Your device may not have enough memory for processing. Close other apps and try again." Attempt processing; if it fails, show the error. |
| ERR-013 | No documents detected in image | Display: "No document detected in this image. Make sure the document is clearly visible." Offer retake. |

---

*End of Software Requirements Specification*
