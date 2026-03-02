# SCANकर — Business Requirements Document (BRD)

**Version:** 1.0  
**Date:** 2026-03-02  
**Status:** Draft  
**Author:** SCANकर Development Team  
**Audience:** Endurance Management, Product Team, Engineering Team

---

## 1. Executive Summary

SCANकर (SCANKar) is a mobile application designed to transform physical documents — including tables, printed text, handwritten notes, and forms — into structured, editable digital data using on-device machine learning. The application operates entirely offline, requires no internet connectivity, and runs on both Android and iOS platforms.

**Version 1 (Industrial)** is built exclusively for Endurance employees. Access is gated behind a one-time activation code distributed by Endurance management. Once activated, the app provides a full suite of document scanning, OCR, table extraction, manual editing, and multi-format export capabilities — all processed locally on the user's device.

The app addresses a critical operational inefficiency: Endurance field and office employees currently re-type data from hard-copy documents into spreadsheets manually. SCANकर eliminates this bottleneck by enabling instant scan-to-data conversion with high accuracy, directly on the employee's mobile device.

---

## 2. Business Objectives and Goals

### 2.1 Why SCANकर Is Being Built

Endurance employees routinely handle printed tables, handwritten worksheets, invoices, forms, and reports in hard-copy format. Currently, translating these physical documents into digital formats (Excel, PDF, etc.) requires:

- Manual data entry — slow, tedious, and error-prone
- Desktop scanners and OCR software — unavailable in the field
- Internet-dependent cloud OCR services — impractical in low-connectivity environments

SCANकर solves all three problems by providing a portable, offline, AI-powered scanning solution directly on the employee's smartphone.

### 2.2 What Business Problem It Solves

| Problem | SCANकर Solution |
|---|---|
| Manual re-entry of table data from printed documents | Automated table detection, structure preservation, and cell-level OCR |
| Inability to digitize documents in the field (no scanner, no internet) | Fully offline mobile app with on-device ML models |
| Handwritten notes lost or illegible when re-typed later | Handwriting recognition model extracts text at point of capture |
| No standardized export format across teams | Multi-format export: Excel, PDF, Word, CSV, JSON |
| Time wasted on repetitive data entry tasks | Processing time <5 seconds per scan |

### 2.3 Expected Business Outcomes

1. **80% reduction** in manual data entry time for document-to-spreadsheet conversion
2. **Elimination of desktop scanner dependency** for field operations
3. **Zero recurring cost** — no cloud API subscriptions, no per-scan charges
4. **Data stays on device** — no privacy or compliance concerns with cloud uploads
5. **Consistent data quality** — ML-assisted extraction with confidence scoring reduces human error
6. **Immediate employee productivity gains** within the first week of deployment

---

## 3. Stakeholders

| Stakeholder | Role | Interest |
|---|---|---|
| **Endurance (Company)** | Sponsor / Owner | Reduce operational costs, improve employee efficiency, maintain data security |
| **Endurance Employees** | Primary End Users (20–30 for v1) | Fast, reliable document scanning and data extraction in the field and office |
| **IT / Operations Team** | Internal Support | Access code distribution, employee onboarding, device compatibility |
| **SCANकर Development Team** | Builder | Architecture, ML pipeline, UI/UX, testing, deployment |
| **Product Manager** | Decision Maker | Feature prioritization, version planning, acceptance criteria |

---

## 4. Business Scope

### 4.1 In-Scope: Version 1 — Industrial App

- One-time access code activation system (20–30 hardcoded codes)
- Device-locked activation (code bound to device, cannot be reused)
- Camera-based document capture with smart alignment overlay
- Image enhancement (brightness, contrast, auto-improve)
- Automatic document type detection (table / paragraph / form / mixed)
- Table detection with row/column structure preservation
- Paragraph and text block extraction with heading hierarchy
- OCR for printed text (English, Hindi)
- OCR for handwritten text (English)
- Interactive review screens for tables and paragraphs
- Full table editor (add/delete rows and columns, merge/split cells, undo/redo)
- Manual data entry and inline editing post-extraction
- Multi-format export: Excel (.xlsx), PDF, Word (.docx), CSV, JSON
- Scan history with search, filter, and sort
- Dark mode and light mode
- ML model status dashboard
- 100% offline operation — no internet required at any point
- Android and iOS deployment (App Store, Play Store, direct APK)

### 4.2 Out-of-Scope: Version 2 — Public App (Future)

- Open public access (no access code required)
- Cloud sync and backup
- Multi-user collaboration
- Batch scanning
- API integrations
- Web dashboard
- Advanced language support beyond Hindi and English
- Account creation and login system

---

## 5. Business Constraints

| Constraint | Description |
|---|---|
| **Offline-only operation** | The app must function with zero internet connectivity. All ML models run on-device. No cloud APIs. |
| **Zero recurring cost** | No subscription services, no per-scan charges, no cloud hosting fees for v1. |
| **Access-code gated** | Version 1 is restricted to Endurance employees via hardcoded activation codes. |
| **Cross-platform** | Must run on both Android (6.0+) and iOS (12.0+). |
| **On-device ML** | All 7 ML models must fit within ~130MB total and run inference within acceptable time (<5 seconds per scan). |
| **Data privacy** | No user data, scanned documents, or extracted text may leave the device. |
| **Limited initial user base** | 20–30 employees for v1. Scale to broader deployment in v2. |
| **Single-device activation** | Each access code is valid for one device only. Once activated, the code cannot be used on another device. |

---

## 6. Success Metrics

### 6.1 OCR Accuracy Targets

| Document Type | Target Accuracy |
|---|---|
| Printed text (English, good lighting) | ≥ 95% |
| Printed text (Hindi, good lighting) | ≥ 90% |
| Clear handwriting (English) | ≥ 85% |
| Mixed printed + handwritten | ≥ 85% (printed), ≥ 80% (handwritten) |
| Table structure preservation | ≥ 90% (correct row/column mapping) |

### 6.2 Processing Speed Targets

| Metric | Target |
|---|---|
| Single-page scan (capture to review) | < 5 seconds |
| Image enhancement | < 1 second |
| Document type detection | < 0.5 seconds |
| Table extraction (full pipeline) | < 4 seconds |
| Paragraph extraction (full pipeline) | < 3 seconds |
| Export generation (any format) | < 2 seconds |

### 6.3 Employee Adoption Targets

| Metric | Target (within 4 weeks of deployment) |
|---|---|
| Activation rate (codes used / codes distributed) | ≥ 80% |
| Weekly active users | ≥ 60% of activated users |
| Average scans per user per week | ≥ 10 |
| User satisfaction (internal survey) | ≥ 4.0 / 5.0 |

---

## 7. Risks and Mitigations

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | ML model accuracy falls below targets on real-world documents | Medium | High | Train models with Endurance-specific document samples; iterative fine-tuning via Google Colab |
| R2 | Device hardware limitations (older phones) degrade processing speed | Medium | Medium | Optimize TFLite models with quantization; test on minimum-spec devices early |
| R3 | Handwriting recognition fails on poor-quality input | High | Medium | Set realistic accuracy expectations; provide manual editing as fallback |
| R4 | Total ML model size exceeds device storage budget | Low | High | Use lightweight model variants (TrOCR-small, PaddleOCR lite); target ~130MB total |
| R5 | Access code management becomes unwieldy | Low | Low | Hardcode 30 codes; simple list management; v2 can introduce dynamic code generation |
| R6 | Cross-platform inconsistencies between Android and iOS | Medium | Medium | Use React Native CLI for shared codebase; platform-specific testing at each module |
| R7 | Employee resistance to new tool adoption | Low | Medium | Simple onboarding flow; intuitive UI; minimal learning curve |
| R8 | Hindi script OCR accuracy lower than English | Medium | Medium | Use bilingual PaddleOCR model; supplement with language detection model for routing |
| R9 | Table structure misaligned on complex or merged-cell tables | Medium | High | Allow manual table editing post-extraction; provide cell merge/split tools |
| R10 | Export format doesn't preserve table structure correctly | Medium | High | Format-specific export engines with structure-aware templates; thorough testing per format |

---

## 8. Timeline and Milestones

### 8.1 Modular Development Schedule

| Phase | Module | Description | Duration | Dependencies |
|---|---|---|---|---|
| **M0** | Project Setup | React Native CLI setup, project structure, design system tokens | 1 week | None |
| **M1** | Camera + Crop + Enhancement | Camera capture, image preview, crop, rotate, brightness/contrast, enhance | 2 weeks | M0 |
| *T1* | *ML Training Sprint 1* | *Train Image Enhancement + Document Layout models on Colab* | *1 week (parallel)* | *M1 complete* |
| **M2** | Document Type Detection | Auto-detect table / paragraph / form / mixed | 1.5 weeks | M1, T1 |
| *T2* | *ML Training Sprint 2* | *Train Table Detection + OCR models on Colab* | *1 week (parallel)* | *M2 started* |
| **M3** | Table Pipeline | Table detection, cell extraction, structure reconstruction, OCR fill | 2.5 weeks | M2, T2 |
| **M4** | Paragraph Pipeline | Text block detection, heading hierarchy, paragraph OCR | 2 weeks | M2, T2 |
| **M5** | Editor + Manual Entry | Table editor (full CRUD), paragraph inline edit, manual data entry | 2 weeks | M3, M4 |
| **M6** | Export Engine | Export to Excel, PDF, Word, CSV, JSON with structure preservation | 2 weeks | M5 |
| **M7** | History + Storage | Scan history, search, filter, sort, persistent storage | 1.5 weeks | M6 |
| **M8** | Settings + Model Manager | Settings screen, model status dashboard, theme toggle | 1 week | M7 |
| **M9** | Access Code System | Lock screen, code validation, device binding, unlock flow | 1 week | M0 (can run parallel with M1–M2) |
| **M10** | Integration + Polish | End-to-end integration, animations, dark mode, bug fixes | 2 weeks | M8, M9 |
| **M11** | Testing + QA | Full test plan execution, performance profiling, device testing | 2 weeks | M10 |
| **M12** | Deployment | App Store + Play Store submission, APK distribution | 1 week | M11 |

### 8.2 Total Estimated Timeline

- **Development:** ~16 weeks (4 months)
- **Testing & QA:** ~2 weeks
- **Deployment:** ~1 week
- **Total:** ~19 weeks (approximately 5 months)

### 8.3 Key Milestones

| Milestone | Target | Deliverable |
|---|---|---|
| M1: Camera Module Complete | Week 3 | Working camera capture + enhance pipeline |
| M3: Table Pipeline Complete | Week 8 | End-to-end table scan → structured data |
| M6: Export Engine Complete | Week 14 | All 5 export formats working |
| M9: Access Code System Complete | Week 10 | Lock screen + device binding functional |
| M10: Feature Complete | Week 16 | All features integrated, both themes working |
| M11: QA Complete | Week 18 | All test cases passed, performance validated |
| M12: v1 Deployed | Week 19 | App live on stores, codes distributed to employees |

---

*End of Business Requirements Document*
