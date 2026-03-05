// SCANKar — Scan Data Model

export type DocumentType = 'table' | 'paragraph' | 'form' | 'mixed';

export type ProcessingPhase =
    | 'idle'
    | 'enhancing'
    | 'detecting_type'
    | 'extracting_structure'
    | 'reading_text'
    | 'validating';

export interface EditAction {
    id: string;
    type: 'cell_edit' | 'row_add' | 'row_delete' | 'col_add' | 'col_delete' | 'merge' | 'split' | 'clear';
    timestamp: number;
    previousState: unknown;
    newState: unknown;
}

export interface Scan {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;

    // Image data
    originalImageUri: string;
    enhancedImageUri: string;
    thumbnailUri: string;

    // Detection results
    documentType: DocumentType;
    overallConfidence: number;

    // Extracted data
    tableData?: import('./TableData').TableData;
    paragraphData?: import('./ParagraphData').ParagraphData;
    fidelityLayer?: import('../ml/ImageFidelityEngine').FidelityLayer;

    // Processing metadata
    processingTimeMs: number;
    modelsUsed: string[];
    languageDetected: string;

    // Edit tracking
    isEdited: boolean;
    editHistory: EditAction[];
}

export interface ScanIndexEntry {
    id: string;
    name: string;
    documentType: DocumentType;
    overallConfidence: number;
    createdAt: string;
    thumbnailUri: string;
}
