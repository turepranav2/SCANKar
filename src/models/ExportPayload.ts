// SCANKar — Export Payload Types (TDD §5.4)

import { DocumentType } from './Scan';
import { TableData } from './TableData';
import { ParagraphData } from './ParagraphData';

export interface ExportMetadata {
    appVersion: string;
    exportDate: string;
    exportFormat: string;
    includeConfidence: boolean;
    includeOriginalImage: boolean;
}

export interface ExcelCell {
    value: string;
    confidence?: number;
    isMerged: boolean;
    mergeSpan?: { rows: number; cols: number };
}

export interface ExcelRow {
    cells: ExcelCell[];
}

export interface ExcelSheet {
    name: string;
    rows: ExcelRow[];
    columnWidths: number[];
    headerRow?: number;
}

export interface ExcelPayload {
    sheets: ExcelSheet[];
    metadata: ExportMetadata;
}

export interface PDFPage {
    content: string;
    imageUri?: string;
}

export interface PDFPayload {
    pages: PDFPage[];
    includeOriginalImage: boolean;
    metadata: ExportMetadata;
}

export interface JSONPayload {
    version: string;
    scanId: string;
    scanDate: string;
    documentType: DocumentType;
    overallConfidence: number;
    language: string;
    data: TableData | ParagraphData;
    metadata: ExportMetadata;
}

export type ExportFormat = 'xlsx' | 'pdf' | 'docx' | 'csv' | 'json';
