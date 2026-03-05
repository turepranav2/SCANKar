// SCANKar — ML Pipeline Types (Phase 9 Track B)

/** Union of all 7 TFLite model names */
export type ModelName =
    | 'image_enhancement'
    | 'document_classifier'
    | 'table_detector'
    | 'text_detector_craft'
    | 'printed_ocr'
    | 'handwriting_ocr'
    | 'language_detector';

/** Runtime status of a single model */
export interface ModelStatus {
    name: ModelName;
    filename: string;
    sizeMB: number;
    purpose: string;
    status: 'loaded' | 'missing' | 'error' | 'loading';
    lastUsed?: Date;
}

/** A detected text region within an image */
export interface TextRegion {
    x: number;
    y: number;
    width: number;
    height: number;
    text: string;
    confidence: number;
    language: string;
    isHandwritten: boolean;
}

/** A single table cell with position and recognized text */
export interface TableCell {
    row: number;
    col: number;
    x: number;
    y: number;
    width: number;
    height: number;
    text: string;
    confidence: number;
}

/** Full table structure extracted from document image */
export interface TableStructure {
    rows: number;
    cols: number;
    cells: TableCell[];
    headers: string[];
}

/** A paragraph block with recognized text */
export interface ParagraphBlock {
    text: string;
    confidence: number;
    language: string;
    boundingBox: { x: number; y: number; width: number; height: number };
}

/** Complete result returned by the ML pipeline */
export interface MLScanResult {
    docType: 'table' | 'paragraph' | 'form' | 'mixed';
    tableData?: TableStructure;
    paragraphData?: ParagraphBlock[];
    fidelityLayer?: import('./ImageFidelityEngine').FidelityLayer;
    overallConfidence: number;
    processingTimeMs: number;
}
