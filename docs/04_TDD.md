# SCANकर — Technical Design Document (TDD)

**Version:** 1.0  
**Date:** 2026-03-02  
**Status:** Draft  
**Product:** SCANकर v1 — Industrial Version  
**Framework:** React Native CLI

---

## 1. System Architecture Overview

### 1.1 Component Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                       SCANकर APPLICATION                         │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    PRESENTATION LAYER                       │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │ │
│  │  │  Access   │ │   Home   │ │  Camera  │ │  Preview │      │ │
│  │  │  Code     │ │Dashboard │ │ Capture  │ │  & Crop  │      │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │ │
│  │  │Processing│ │  Table   │ │Paragraph │ │  Table   │      │ │
│  │  │  Screen  │ │  Review  │ │  Review  │ │  Editor  │      │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │ │
│  │  │  Export  │ │ History  │ │ Settings │ │  Model   │      │ │
│  │  │  Screen  │ │  Screen  │ │          │ │  Status  │      │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                     BUSINESS LOGIC LAYER                    │ │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │ │
│  │  │ Access Code  │ │   Scan       │ │   Export     │        │ │
│  │  │ Manager      │ │   Manager    │ │   Engine     │        │ │
│  │  └──────────────┘ └──────────────┘ └──────────────┘        │ │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │ │
│  │  │  History     │ │  Settings    │ │  Edit        │        │ │
│  │  │  Manager     │ │  Manager     │ │  Manager     │        │ │
│  │  └──────────────┘ └──────────────┘ └──────────────┘        │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                     ML PIPELINE LAYER                       │ │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐              │ │
│  │  │  Image     │ │  Layout    │ │  Table     │              │ │
│  │  │Enhancement │ │  Analysis  │ │ Detection  │              │ │
│  │  │  (~10MB)   │ │  (~20MB)   │ │  (~15MB)   │              │ │
│  │  └────────────┘ └────────────┘ └────────────┘              │ │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐              │ │
│  │  │   Text     │ │  Printed   │ │ Handwriting│              │ │
│  │  │ Detection  │ │   OCR      │ │   OCR      │              │ │
│  │  │  (~25MB)   │ │  (~20MB)   │ │  (~35MB)   │              │ │
│  │  └────────────┘ └────────────┘ └────────────┘              │ │
│  │  ┌────────────┐ ┌──────────────────────────────┐           │ │
│  │  │ Language   │ │    OpenCV Preprocessing      │           │ │
│  │  │ Detection  │ │    (Native Bridge Module)     │           │ │
│  │  │  (~5MB)    │ │                               │           │ │
│  │  └────────────┘ └──────────────────────────────┘           │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                     DATA / STORAGE LAYER                    │ │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │ │
│  │  │ AsyncStorage │ │    MMKV      │ │  File System │        │ │
│  │  │ (settings,   │ │ (scan data,  │ │ (images,     │        │ │
│  │  │  unlock)     │ │  history)    │ │  exports)    │        │ │
│  │  └──────────────┘ └──────────────┘ └──────────────┘        │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

### 1.2 React Native CLI Project Structure

```
SCANKar/
├── android/                          # Android native project
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── assets/models/        # TFLite model files
│   │   │   ├── java/.../             # Native modules (TFLite, OpenCV)
│   │   │   └── res/                  # Android resources
│   │   └── build.gradle
│   └── build.gradle
├── ios/                              # iOS native project
│   ├── SCANKar/
│   │   ├── Models/                   # TFLite model files
│   │   └── NativeModules/            # Native modules (TFLite, OpenCV)
│   └── SCANKar.xcodeproj
├── src/
│   ├── App.tsx                       # Root component
│   ├── navigation/
│   │   ├── AppNavigator.tsx          # Main navigation container
│   │   ├── AuthNavigator.tsx         # Lock screen + onboarding
│   │   ├── MainNavigator.tsx         # Tab + stack navigation
│   │   └── routes.ts                 # Route name constants
│   ├── screens/
│   │   ├── AccessCodeScreen.tsx      # Screen 00
│   │   ├── OnboardingScreen.tsx      # Screen 01
│   │   ├── HomeScreen.tsx            # Screen 02
│   │   ├── CameraScreen.tsx          # Screen 03
│   │   ├── PreviewCropScreen.tsx     # Screen 04
│   │   ├── ProcessingScreen.tsx      # Screen 05
│   │   ├── TableReviewScreen.tsx     # Screen 06
│   │   ├── ParagraphReviewScreen.tsx # Screen 07
│   │   ├── TableEditorScreen.tsx     # Screen 08
│   │   ├── ExportScreen.tsx          # Screen 09
│   │   ├── HistoryScreen.tsx         # Screen 10
│   │   ├── SettingsScreen.tsx        # Screen 11
│   │   └── ModelStatusScreen.tsx     # Screen 12
│   ├── components/
│   │   ├── common/
│   │   │   ├── PrimaryButton.tsx
│   │   │   ├── SecondaryButton.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── TopBar.tsx
│   │   │   ├── BottomNav.tsx
│   │   │   ├── FAB.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── camera/
│   │   │   ├── DocumentOverlay.tsx
│   │   │   ├── CaptureButton.tsx
│   │   │   └── DocTypeChips.tsx
│   │   ├── editor/
│   │   │   ├── EditableTable.tsx
│   │   │   ├── EditableCell.tsx
│   │   │   ├── CellContextMenu.tsx
│   │   │   └── ParagraphEditor.tsx
│   │   ├── review/
│   │   │   ├── ConfidenceBadge.tsx
│   │   │   ├── DocTypeBadge.tsx
│   │   │   └── SplitView.tsx
│   │   ├── export/
│   │   │   ├── FormatTile.tsx
│   │   │   └── ExportOptions.tsx
│   │   └── history/
│   │       ├── ScanCard.tsx
│   │       ├── FilterChips.tsx
│   │       └── SearchBar.tsx
│   ├── context/
│   │   ├── AppContext.tsx            # Global app state
│   │   ├── ScanContext.tsx           # Current scan state
│   │   ├── ThemeContext.tsx          # Theme state (light/dark)
│   │   └── AuthContext.tsx           # Access code / unlock state
│   ├── services/
│   │   ├── ml/
│   │   │   ├── MLPipeline.ts         # Pipeline orchestrator
│   │   │   ├── ImageEnhancer.ts      # Model 1 wrapper
│   │   │   ├── LayoutAnalyzer.ts     # Model 2 wrapper
│   │   │   ├── TableDetector.ts      # Model 3 wrapper
│   │   │   ├── TextDetector.ts       # Model 4 wrapper
│   │   │   ├── PrintedOCR.ts         # Model 5 wrapper
│   │   │   ├── HandwritingOCR.ts     # Model 6 wrapper
│   │   │   ├── LanguageDetector.ts   # Model 7 wrapper
│   │   │   └── ModelManager.ts       # Model lifecycle management
│   │   ├── cv/
│   │   │   ├── ImageProcessor.ts     # OpenCV preprocessing
│   │   │   └── CropEngine.ts        # Perspective transform
│   │   ├── export/
│   │   │   ├── ExcelExporter.ts
│   │   │   ├── PDFExporter.ts
│   │   │   ├── WordExporter.ts
│   │   │   ├── CSVExporter.ts
│   │   │   └── JSONExporter.ts
│   │   ├── storage/
│   │   │   ├── ScanStorage.ts        # Scan CRUD operations
│   │   │   ├── SettingsStorage.ts    # App settings persistence
│   │   │   └── AuthStorage.ts        # Unlock state persistence
│   │   └── AccessCodeService.ts      # Code validation logic
│   ├── models/
│   │   ├── Scan.ts                   # Scan data model
│   │   ├── TableData.ts              # Table structure model
│   │   ├── ParagraphData.ts          # Paragraph model
│   │   ├── ExportPayload.ts          # Export data model
│   │   └── MLModel.ts               # Model info type
│   ├── theme/
│   │   ├── colors.ts                 # Color tokens (light + dark)
│   │   ├── typography.ts             # Font sizes, weights
│   │   ├── spacing.ts                # Spacing scale
│   │   └── index.ts                  # Theme provider
│   ├── constants/
│   │   ├── accessCodes.ts            # Hardcoded activation codes
│   │   ├── mlModels.ts               # Model metadata
│   │   └── config.ts                 # App configuration
│   └── utils/
│       ├── confidence.ts             # Confidence calculations
│       ├── formatters.ts             # Data formatting utilities
│       └── validators.ts             # Input validation
├── __tests__/                        # Test files
├── package.json
├── tsconfig.json
├── babel.config.js
├── metro.config.js
└── docs/                             # This documentation
```

---

## 2. Access Code Module Design

### 2.1 Code Validation Logic

The access code system is entirely offline. Codes are validated against a hardcoded list embedded in the app bundle.

```typescript
// src/constants/accessCodes.ts
// Codes are stored as SHA-256 hashes for obfuscation
// The raw codes are NEVER stored in plain text in the bundle

export const ACCESS_CODE_HASHES: string[] = [
  'a3f2b8c...', // ENDR-7XK9
  'b4e9d1a...', // ENDR-M3P2
  'c5f0e2b...', // ENDR-Q8R5
  // ... 27 more hashed codes
];

// Validation function:
// 1. Takes user input code
// 2. Normalizes (uppercase, trim whitespace)
// 3. Computes SHA-256 hash
// 4. Checks if hash exists in ACCESS_CODE_HASHES
// 5. If match: check code hasn't been used (against used-codes list in storage)
// 6. Returns: { valid: boolean, error?: string }
```

### 2.2 Device Binding Approach

```typescript
// src/services/AccessCodeService.ts

interface UnlockState {
  isUnlocked: boolean;
  deviceId: string;         // Device unique identifier
  activationCode: string;   // Hashed version of the used code
  activatedAt: string;      // ISO timestamp
}

// Storage: AsyncStorage key = '@scankar_unlock_state'
// On activation:
//   1. Get device ID (react-native-device-info)
//   2. Store UnlockState in AsyncStorage
//   3. Store used code hash in local used-codes list
// On app open:
//   1. Read UnlockState from AsyncStorage
//   2. If isUnlocked === true && deviceId matches current device → skip lock screen
//   3. If not unlocked → show lock screen
```

### 2.3 Code List Management

- 30 unique codes generated in format `ENDR-XXXX` (4 alphanumeric characters after prefix)
- Codes are hashed (SHA-256) before embedding in the app
- Plain-text codes are kept only in an internal Endurance distribution document (not in the app)
- On activation, the used code's hash is added to a local "used codes" list in AsyncStorage
- This prevents re-entry of the same code on the same device but does NOT prevent use on another device (since there's no server)
- **Limitation acknowledged:** Without a server, two devices could theoretically activate the same code. For v1 with 20–30 employees, this is an acceptable trade-off. Endurance distributes one code per employee.

---

## 3. ML Pipeline Architecture

### 3.1 Model Specifications

| # | Model | Purpose | Base Architecture | Size | Input | Output |
|---|---|---|---|---|---|---|
| 1 | Image Enhancement | Improve image quality (denoise, auto-level, sharpen) | Lightweight U-Net | ~10MB | Raw image tensor (H×W×3, uint8) | Enhanced image tensor (H×W×3, uint8) |
| 2 | Document Layout Analysis | Detect document regions (table, text, figure, list, form) | DocLayNet / LayoutLMv3 (quantized) | ~20MB | Enhanced image (resized to 640×640) | Bounding boxes + class labels + scores |
| 3 | Table Detection + Structure | Detect table boundaries, rows, columns, cells | TableNet / TATR (Table Transformer) | ~15MB | Table region crop (variable size) | Table grid: row bounds, col bounds, cell coordinates |
| 4 | Text Detection | Detect text regions at word / line level | CRAFT (Character Region Awareness) | ~25MB | Image region (variable size) | Text bounding boxes (word-level polygons) |
| 5 | Printed Text OCR | Recognize printed characters | PaddleOCR lite (en+hi) | ~20MB | Text line image (H×W×1 or H×W×3) | Character sequence + per-char confidence |
| 6 | Handwriting Recognition | Recognize handwritten text | TrOCR-small (ViT + decoder) | ~35MB | Text line image (384×384 or variable) | Character sequence + per-char confidence |
| 7 | Language / Script Detection | Identify script (Latin, Devanagari) and language | Lightweight CNN classifier | ~5MB | Text string or image patch | Language label (en, hi, mixed) + score |

**Total model size: ~130MB**

### 3.2 Pipeline Routing Logic

```
                        ┌──────────────┐
                        │ Input Image  │
                        └──────┬───────┘
                               ▼
                    ┌──────────────────────┐
                    │  Model 1: Enhance    │
                    └──────────┬───────────┘
                               ▼
                    ┌──────────────────────┐
                    │  Model 2: Layout     │
                    │  Analysis            │
                    └──────────┬───────────┘
                               │
                    ┌──────────┴───────────┐
                    │    DETECTED ZONES     │
                    │                       │
              ┌─────┼───────┐              │
              ▼     ▼       ▼              │
           TABLE   TEXT    FORM            │
              │     │       │              │
              ▼     │       │              │
     ┌────────────┐ │       │              │
     │ Model 3:   │ │       │              │
     │ Table Det. │ │       │              │
     │ + Structure│ │       │              │
     └─────┬──────┘ │       │              │
           │        │       │              │
           ▼        ▼       ▼              │
     ┌──────────────────────────┐          │
     │ Model 4: Text Detection  │          │
     │ (CRAFT — for all types)  │          │
     └──────────┬───────────────┘          │
                │                          │
        ┌───────┴────────┐                 │
        │ For each text  │                 │
        │ region:        │                 │
        │                │                 │
        ▼                ▼                 │
  ┌───────────┐   ┌──────────────┐         │
  │ Printed?  │   │ Handwritten? │         │
  │           │   │              │         │
  │ Model 5:  │   │ Model 6:     │         │
  │ PaddleOCR │   │ TrOCR-small  │         │
  └─────┬─────┘   └──────┬───────┘         │
        │                 │                 │
        └────────┬────────┘                 │
                 ▼                          │
        ┌────────────────┐                  │
        │ Model 7: Lang  │                  │
        │ Detection      │                  │
        └────────┬───────┘                  │
                 │                          │
                 ▼                          │
        ┌────────────────┐                  │
        │ STRUCTURED     │                  │
        │ OUTPUT         │◄─────────────────┘
        └────────────────┘
```

**Routing Rules:**
1. **Table detected** → Model 3 (structure) → Model 4 (text within cells) → Model 5/6 (OCR) → Model 7 (lang)
2. **Paragraph detected** → Model 4 (text regions) → Model 5/6 (OCR) → Model 7 (lang)
3. **Form detected** → Model 4 (text regions + spatial analysis for labels/values) → Model 5/6 (OCR) → Model 7 (lang)
4. **Mixed** → Run all relevant sub-pipelines for each detected zone type

**Printed vs. Handwritten Decision:**
- Model 2 (Layout Analysis) classifies each text region as printed or handwritten based on stroke characteristics
- If ambiguous, run both Model 5 and Model 6, take the result with higher confidence

### 3.3 TFLite Integration Architecture

```typescript
// src/services/ml/ModelManager.ts

interface TFLiteModel {
  name: string;
  path: string;           // Local asset path
  inputShape: number[];   // e.g., [1, 640, 640, 3]
  outputShape: number[];  // e.g., [1, 100, 6]
  quantized: boolean;     // int8 vs float32
  loaded: boolean;
  loadTimeMs: number;
}

class ModelManager {
  private models: Map<string, TFLiteModel>;

  // Load a specific model into memory
  async loadModel(modelName: string): Promise<void>;

  // Run inference on a loaded model
  async runInference(modelName: string, input: Float32Array): Promise<Float32Array>;

  // Unload a model to free memory
  async unloadModel(modelName: string): Promise<void>;

  // Get status of all models
  getModelStatuses(): ModelStatus[];

  // Preload all models at app startup
  async preloadAll(): Promise<void>;
}

// Native bridge:
// Android: Java/Kotlin TFLite Interpreter via React Native NativeModule
// iOS: Objective-C/Swift TFLite Interpreter via React Native NativeModule
```

**Loading Strategy:**
- Models 1 and 2 are loaded at app startup (always needed)
- Models 3–7 are loaded on-demand based on detected document type
- Models can be unloaded when not in active use to manage memory pressure
- On low-RAM devices, models are loaded sequentially; on high-RAM devices, pipeline models can be pre-loaded

---

## 4. Computer Vision Module Design (OpenCV)

### 4.1 Preprocessing Pipeline

All OpenCV operations run through a native bridge module.

```
Input Image
     │
     ▼
┌─────────────────────┐
│ 1. RESIZE            │  Max dimension: 2048px (maintain aspect ratio)
│    cv2.resize()      │  Interpolation: INTER_AREA (downscale), INTER_LINEAR (upscale)
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 2. COLOR CONVERT     │  BGR → RGB (if needed)
│    cv2.cvtColor()    │  Also: BGR → GRAY for certain models
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 3. DENOISE           │  cv2.fastNlMeansDenoisingColored()
│                      │  h=10, hForColor=10, templateWindowSize=7
│                      │  searchWindowSize=21
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 4. PERSPECTIVE       │  cv2.getPerspectiveTransform()
│    CORRECTION        │  cv2.warpPerspective()
│                      │  Uses 4-point crop handles from user
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 5. ADAPTIVE          │  For OCR preprocessing:
│    THRESHOLD         │  cv2.adaptiveThreshold()
│    (optional)        │  blockSize=11, C=2
│                      │  Method: ADAPTIVE_THRESH_GAUSSIAN_C
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 6. DESKEW            │  Detect skew angle via Hough transform
│    (auto)            │  cv2.HoughLinesP()
│                      │  Threshold: ±15° correction
│                      │  Apply cv2.getRotationMatrix2D() + warpAffine()
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 7. CONTRAST /        │  CLAHE (Contrast Limited Adaptive Histogram Equalization)
│    BRIGHTNESS        │  cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
│    ENHANCE           │  User adjustable: alpha (contrast), beta (brightness)
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 8. SHARPEN           │  Unsharp mask:
│                      │  gaussian = cv2.GaussianBlur(img, (0,0), 3)
│                      │  sharp = cv2.addWeighted(img, 1.5, gaussian, -0.5, 0)
└──────────┬──────────┘
           ▼
Output: Preprocessed Image (ready for ML pipeline)
```

### 4.2 Parameters Summary

| Step | Function | Key Parameters |
|---|---|---|
| Resize | `cv2.resize` | max_dim=2048, INTER_AREA |
| Denoise | `fastNlMeansDenoisingColored` | h=10, templateWindow=7, searchWindow=21 |
| Perspective | `warpPerspective` | 4 corner points from user crop handles |
| Threshold | `adaptiveThreshold` | blockSize=11, C=2, GAUSSIAN_C |
| Deskew | `HoughLinesP` + `warpAffine` | threshold=±15°, minLineLength=100 |
| CLAHE | `createCLAHE` | clipLimit=2.0, tileGrid=(8,8) |
| Sharpen | `addWeighted` | alpha=1.5, beta=-0.5, gamma=0 |

---

## 5. Data Models and Schemas

### 5.1 Scan Object Schema

```typescript
interface Scan {
  id: string;                    // UUID
  name: string;                  // Auto-generated or user-defined
  createdAt: string;             // ISO 8601 timestamp
  updatedAt: string;             // ISO 8601 timestamp

  // Image data
  originalImageUri: string;      // Local file path to original image
  enhancedImageUri: string;      // Local file path to enhanced image
  thumbnailUri: string;          // Local file path to thumbnail

  // Detection results
  documentType: DocumentType;    // 'table' | 'paragraph' | 'form' | 'mixed'
  overallConfidence: number;     // 0.0 – 1.0 (average of all elements)

  // Extracted data (one of the following, based on documentType)
  tableData?: TableData;
  paragraphData?: ParagraphData;
  formData?: FormData;

  // Processing metadata
  processingTimeMs: number;      // Total pipeline time
  modelsUsed: string[];          // Names of models used
  languageDetected: string;      // 'en' | 'hi' | 'mixed'

  // Edit tracking
  isEdited: boolean;             // Whether user made manual edits
  editHistory: EditAction[];     // Undo/redo stack
}

type DocumentType = 'table' | 'paragraph' | 'form' | 'mixed';
```

### 5.2 Table Data Schema

```typescript
interface TableData {
  rows: number;                  // Total row count
  columns: number;               // Total column count
  cells: TableCell[][];          // 2D array [row][col]
  mergedCells: MergedCell[];     // List of merged cell ranges
  hasHeaderRow: boolean;         // First row detected as header
}

interface TableCell {
  row: number;                   // 0-indexed row position
  col: number;                   // 0-indexed column position
  text: string;                  // Extracted or manually entered text
  confidence: number;            // 0.0 – 1.0
  isManualEntry: boolean;        // True if user typed this
  isMerged: boolean;             // Part of a merged cell
  mergeId?: string;              // ID linking merged cells
  boundingBox: BoundingBox;      // Position in original image
}

interface MergedCell {
  id: string;
  startRow: number;
  endRow: number;
  startCol: number;
  endCol: number;
}

interface BoundingBox {
  x: number;                     // Top-left X (pixels, relative to image)
  y: number;                     // Top-left Y
  width: number;
  height: number;
}
```

### 5.3 Paragraph Data Schema

```typescript
interface ParagraphData {
  blocks: TextBlock[];           // Ordered list of text blocks
}

interface TextBlock {
  id: string;
  type: TextBlockType;           // 'heading1' | 'heading2' | 'heading3' | 'body' | 'caption'
  text: string;                  // Full text content
  words: WordResult[];           // Per-word OCR results
  confidence: number;            // Average confidence for this block
  boundingBox: BoundingBox;
  isManualEntry: boolean;
}

type TextBlockType = 'heading1' | 'heading2' | 'heading3' | 'body' | 'caption';

interface WordResult {
  text: string;
  confidence: number;            // 0.0 – 1.0
  boundingBox: BoundingBox;
  language: string;              // 'en' | 'hi'
  isHandwritten: boolean;
}
```

### 5.4 Export Payload Schemas

```typescript
// Excel Export
interface ExcelPayload {
  sheets: ExcelSheet[];
  metadata: ExportMetadata;
}

interface ExcelSheet {
  name: string;
  rows: ExcelRow[];
  columnWidths: number[];
  headerRow?: number;            // Index of header row for styling
}

interface ExcelRow {
  cells: ExcelCell[];
}

interface ExcelCell {
  value: string;
  confidence?: number;           // Optional, if "include confidence" is on
  isMerged: boolean;
  mergeSpan?: { rows: number; cols: number };
}

// PDF Export
interface PDFPayload {
  pages: PDFPage[];
  includeOriginalImage: boolean;
  metadata: ExportMetadata;
}

// JSON Export
interface JSONPayload {
  version: string;               // Schema version
  scanId: string;
  scanDate: string;
  documentType: DocumentType;
  overallConfidence: number;
  language: string;
  data: TableData | ParagraphData | FormData;
  metadata: ExportMetadata;
}

interface ExportMetadata {
  appVersion: string;
  exportDate: string;
  exportFormat: string;
  includeConfidence: boolean;
  includeOriginalImage: boolean;
}
```

---

## 6. Navigation Architecture (React Navigation v6)

### 6.1 Screen Map and Route Names

```typescript
// src/navigation/routes.ts

export const ROUTES = {
  // Auth Stack
  ACCESS_CODE: 'AccessCode',         // Screen 00
  ONBOARDING: 'Onboarding',          // Screen 01

  // Main Tab Navigator
  HOME: 'Home',                      // Screen 02
  HISTORY: 'History',                // Screen 10
  SETTINGS: 'Settings',             // Screen 11

  // Scan Stack (nested in Home tab)
  CAMERA: 'Camera',                  // Screen 03
  PREVIEW_CROP: 'PreviewCrop',      // Screen 04
  PROCESSING: 'Processing',         // Screen 05
  TABLE_REVIEW: 'TableReview',      // Screen 06
  PARAGRAPH_REVIEW: 'ParagraphReview', // Screen 07
  TABLE_EDITOR: 'TableEditor',      // Screen 08
  EXPORT: 'Export',                  // Screen 09

  // Settings Stack (nested in Settings tab)
  MODEL_STATUS: 'ModelStatus',      // Screen 12
} as const;
```

### 6.2 Navigation Structure

```
AppNavigator (Stack)
│
├── AuthNavigator (Stack) — shown when !isUnlocked
│   ├── AccessCode (Screen 00)
│   └── Onboarding (Screen 01)
│
└── MainNavigator (Bottom Tab) — shown when isUnlocked
    │
    ├── HomeTab (Stack)
    │   ├── Home (Screen 02)               ← Tab: Home
    │   ├── Camera (Screen 03)
    │   ├── PreviewCrop (Screen 04)
    │   ├── Processing (Screen 05)
    │   ├── TableReview (Screen 06)
    │   ├── ParagraphReview (Screen 07)
    │   ├── TableEditor (Screen 08)
    │   └── Export (Screen 09)
    │
    ├── HistoryTab (Stack)
    │   ├── History (Screen 10)            ← Tab: History
    │   ├── TableReview (Screen 06)        (reused)
    │   ├── ParagraphReview (Screen 07)    (reused)
    │   └── Export (Screen 09)             (reused)
    │
    └── SettingsTab (Stack)
        ├── Settings (Screen 11)           ← Tab: Settings
        └── ModelStatus (Screen 12)
```

### 6.3 Navigation Flows

| Flow | Route Sequence |
|---|---|
| Fresh install | AccessCode → Onboarding → Home |
| Returning user | → Home (direct) |
| New scan | Home → Camera → PreviewCrop → Processing → TableReview / ParagraphReview |
| Edit table | TableReview → TableEditor → TableReview |
| Export | TableReview / ParagraphReview → Export → Share Sheet |
| History review | History → TableReview / ParagraphReview → Export |
| Model status | Settings → ModelStatus |

---

## 7. State Management Design (Context API)

### 7.1 Context Structure

```typescript
// AuthContext — Access code and unlock state
interface AuthState {
  isUnlocked: boolean;
  isLoading: boolean;            // Checking AsyncStorage on app start
  deviceId: string;
  activatedAt: string | null;
}

// ScanContext — Current scan being processed
interface ScanState {
  currentScan: Scan | null;      // The scan currently being viewed/edited
  capturedImage: string | null;  // URI of captured image
  processingPhase: ProcessingPhase;
  isProcessing: boolean;
  editHistory: EditAction[];     // Undo/redo stack
  editHistoryIndex: number;      // Current position in history
}

type ProcessingPhase =
  | 'idle'
  | 'enhancing'
  | 'detecting_type'
  | 'extracting_structure'
  | 'reading_text'
  | 'validating';

// ThemeContext — Theme and appearance
interface ThemeState {
  mode: 'light' | 'dark' | 'system';
  resolvedMode: 'light' | 'dark'; // Actual mode after system resolution
  colors: ColorTokens;
}

// AppContext — Global settings and stats
interface AppState {
  settings: AppSettings;
  stats: {
    totalScans: number;
    weeklyScans: number;
    totalExports: number;
  };
  modelStatuses: ModelStatus[];
}
```

### 7.2 Why Context API (Not Redux)

- App state is relatively simple (4 contexts)
- No server-side data fetching (no need for Redux middleware)
- Context API is built into React — no additional dependencies
- Performance is adequate for this use case (updates are infrequent)
- Simpler mental model for the development team

---

## 8. Storage Design

### 8.1 AsyncStorage (Low-frequency, small data)

| Key | Data | Purpose |
|---|---|---|
| `@scankar_unlock_state` | `UnlockState` JSON | Device activation state |
| `@scankar_settings` | `AppSettings` JSON | User preferences |
| `@scankar_first_launch` | boolean | Track if onboarding was shown |
| `@scankar_used_codes` | string[] (hashed) | Codes activated on this device |

### 8.2 MMKV (High-frequency, larger data)

| Key Pattern | Data | Purpose |
|---|---|---|
| `scan:{id}` | `Scan` JSON | Individual scan record |
| `scan_index` | `ScanIndexEntry[]` JSON | Lightweight index for history list |
| `scan_thumbnail:{id}` | Base64 string | Thumbnail for history cards |

### 8.3 File System (Binary/large files)

| Path | Content | Purpose |
|---|---|---|
| `{documents}/scans/{id}/original.jpg` | Original captured image | Reference for review |
| `{documents}/scans/{id}/enhanced.jpg` | Enhanced image | Post-processing result |
| `{documents}/scans/{id}/thumbnail.jpg` | 200×200 thumbnail | History cards |
| `{documents}/exports/{filename}` | Export files | Temporary export output |

---

## 9. Export Engine Design

### 9.1 Architecture

```typescript
// src/services/export/ExportEngine.ts

class ExportEngine {
  async export(scan: Scan, format: ExportFormat, options: ExportOptions): Promise<string> {
    switch (format) {
      case 'xlsx': return new ExcelExporter().export(scan, options);
      case 'pdf':  return new PDFExporter().export(scan, options);
      case 'docx': return new WordExporter().export(scan, options);
      case 'csv':  return new CSVExporter().export(scan, options);
      case 'json': return new JSONExporter().export(scan, options);
    }
  }
}

type ExportFormat = 'xlsx' | 'pdf' | 'docx' | 'csv' | 'json';

interface ExportOptions {
  includeConfidence: boolean;
  includeOriginalImage: boolean;
}
```

### 9.2 Per-Format Implementation

| Format | Library | Key Implementation Details |
|---|---|---|
| **Excel** | SheetJS (xlsx) | Create workbook → add sheet → populate cells from TableData → apply merged cells → apply header styling → generate buffer → save to file |
| **PDF** | react-native-pdf-lib | Create PDF document → add page → render table grid with cell text → or render paragraphs → optionally embed original image → save |
| **Word** | docx (npm) | Create Document → add heading paragraphs → add table with rows/cells → apply styling → generate buffer → save |
| **CSV** | Manual string building | Iterate rows → join cells with commas → escape special characters → join rows with newlines → save as .csv |
| **JSON** | `JSON.stringify` | Build JSONPayload from Scan data → pretty-print with 2-space indent → save as .json |

### 9.3 Share Integration

```typescript
// After export file is generated:
import Share from 'react-native-share';

const shareFile = async (filePath: string, format: string) => {
  await Share.open({
    url: `file://${filePath}`,
    type: getMimeType(format),
    title: 'Share Scan Export',
  });
};
```

---

## 10. Module Development Sequence

### Module 1: Camera + Crop + Enhancement
**Scope:** Camera capture, image preview, crop, rotate, brightness/contrast sliders, one-tap enhance  
**Screens:** Screen 03 (Camera), Screen 04 (Preview & Crop)  
**Dependencies:** react-native-vision-camera, OpenCV bridge  
**Deliverables:**
- Full-screen camera with flash toggle and gallery import
- Document edge overlay (static first, animated later)
- Crop with draggable corner handles
- Rotate left/right
- Brightness + contrast sliders
- "Enhance" button (Model 1 integration)

### Module 2: Document Type Detection
**Scope:** Layout analysis model integration, type classification  
**Screens:** Screen 05 (Processing — partial)  
**Dependencies:** Module 1, TFLite bridge, Model 2  
**Deliverables:**
- Model 2 (Layout Analysis) loaded and running
- Classify input as table / paragraph / form / mixed
- Route to correct pipeline
- Processing screen with phase progress UI

### Module 3: Table Pipeline
**Scope:** Table detection, structure reconstruction, cell OCR  
**Screens:** Screen 06 (Table Review)  
**Dependencies:** Module 2, Models 3/4/5/6/7  
**Deliverables:**
- Model 3: Table boundary and cell detection
- Grid reconstruction algorithm
- Model 4: Text detection within cells
- Model 5/6: OCR for cell content
- Table Review screen with confidence coloring
- Split view with original image

### Module 4: Paragraph Pipeline
**Scope:** Text block detection, heading hierarchy, paragraph OCR  
**Screens:** Screen 07 (Paragraph Review)  
**Dependencies:** Module 2, Models 4/5/6/7  
**Deliverables:**
- Text block detection and ordering
- Heading hierarchy detection
- Paragraph OCR
- Paragraph Review screen

### Module 5: Editor + Manual Entry
**Scope:** Full table editor, paragraph inline editing  
**Screens:** Screen 08 (Table Editor)  
**Dependencies:** Modules 3, 4  
**Deliverables:**
- Editable table grid
- Cell context menu (insert, delete, merge, split, copy, clear)
- Add row / add column
- Undo / redo (20-step history)
- Manual data entry
- Paragraph inline editing

### Module 6: Export Engine
**Scope:** All 5 export formats + share integration  
**Screens:** Screen 09 (Export)  
**Dependencies:** Module 5  
**Deliverables:**
- Excel, PDF, Word, CSV, JSON exporters
- Export options (confidence scores, original image)
- Share sheet integration
- Export screen UI

### Module 7: History + Storage
**Scope:** Scan persistence, history UI, search, filter, sort  
**Screens:** Screen 10 (History)  
**Dependencies:** Module 6  
**Deliverables:**
- Auto-save scans to MMKV
- History list with thumbnails
- Search, filter chips, sort
- Swipe actions (delete, export)
- Empty state

### Module 8: Settings + Model Manager
**Scope:** Settings screen, model status dashboard, theme toggle  
**Screens:** Screen 11 (Settings), Screen 12 (Model Status)  
**Dependencies:** Module 7  
**Deliverables:**
- All settings controls
- Theme toggle (light/dark/system)
- Model status list
- Storage info and cache clearing

---

## 11. ML Model Training Plan

### 11.1 Training Requirements

| Model | Custom Training Needed? | Training Data | Platform |
|---|---|---|---|
| 1. Image Enhancement | Yes — fine-tune | 500+ document images (clean + degraded pairs) | Google Colab |
| 2. Document Layout Analysis | Yes — fine-tune DocLayNet | 1000+ annotated document images | Google Colab |
| 3. Table Detection + Structure | Yes — fine-tune TATR | 500+ annotated table images | Google Colab |
| 4. Text Detection (CRAFT) | No — use pre-trained | N/A | N/A |
| 5. Printed OCR (PaddleOCR) | Minimal — add Hindi fine-tuning | 200+ Hindi text line images | Google Colab |
| 6. Handwriting (TrOCR) | Yes — fine-tune on Indian English handwriting | 1000+ handwritten line images | Google Colab |
| 7. Language Detection | Train from scratch (lightweight) | 2000+ text samples (en, hi, mixed) | Google Colab |

### 11.2 Training Data Requirements

| Dataset | Size | Source |
|---|---|---|
| Document images (various types) | 1000+ | Endurance internal documents (sanitized) + public datasets (RVL-CDIP, DocBank) |
| Annotated table images | 500+ | PubTabNet, ICDAR-2019, Endurance internal tables |
| Hindi printed text lines | 500+ | IIIT-HW-Hindi, Endurance documents |
| English handwriting lines | 1000+ | IAM Handwriting, Endurance handwritten notes |
| Language samples | 2000+ | Wikipedia corpus (en+hi), mixed samples |

### 11.3 Google Colab Training Schedule

| Sprint | Timing | Models Trained | Duration |
|---|---|---|---|
| T1 | After Module 1, parallel with Module 2 | Model 1 (Enhancement), Model 2 (Layout) | 1 week |
| T2 | After Module 2 starts, parallel with Module 3 | Model 3 (Table), Model 5 (Hindi fine-tune), Model 6 (Handwriting), Model 7 (Lang) | 1 week |

### 11.4 Training → Deployment Pipeline

```
1. Train model in Google Colab (PyTorch / TensorFlow)
2. Export to SavedModel or ONNX
3. Convert to TFLite using TFLite Converter
4. Apply post-training quantization (int8) for size reduction
5. Benchmark on target device (inference time, accuracy)
6. If acceptable: embed in app bundle
7. If not: iterate (adjust architecture, re-train, re-convert)
```

---

*End of Technical Design Document*
