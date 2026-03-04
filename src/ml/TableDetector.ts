// SCANKar — Table Detector (Phase 9 Track B)
// Detects table structure (rows, cols, cells) in document images

import { TableStructure, TableCell } from './types';
import { isModelAvailable } from './ModelManager';

/**
 * Detect table structure in an image.
 *
 * If real table_detector model is available → use TFLite (stub).
 * FALLBACK: return realistic mock table with 5 rows × 5 cols,
 * industrial/construction domain data, confidence 85–97% per cell.
 */
export async function detect(imageUri: string): Promise<TableStructure> {
    try {
        if (isModelAvailable('table_detector')) {
            // TODO: call TFLite native module for real table detection
            console.log('[TableDetector] Real model available — would run TFLite inference');
        }

        // Fallback: realistic construction/industrial mock table
        const headers = ['Sr', 'Item', 'Qty', 'Unit', 'Rate'];
        const rowData = [
            ['1', 'Cement OPC 53 Grade', '100', 'Bags', '380'],
            ['2', 'TMT Steel Bars 12mm', '50', 'Kg', '65,000'],
            ['3', 'River Sand (Fine)', '200', 'CFT', '1,200'],
            ['4', 'AAC Blocks 600×200', '500', 'Nos', '45'],
            ['5', 'RMC M25 Grade', '15', 'Cum', '5,800'],
        ];

        const rows = rowData.length;
        const cols = headers.length;
        const cellW = 200;
        const cellH = 40;
        const startX = 20;
        const startY = 80;

        const cells: TableCell[] = [];

        // Header cells
        headers.forEach((h, ci) => {
            cells.push({
                row: 0,
                col: ci,
                x: startX + ci * cellW,
                y: startY,
                width: cellW,
                height: cellH,
                text: h,
                confidence: 0.95 + Math.random() * 0.04, // 95–99%
            });
        });

        // Data cells
        rowData.forEach((row, ri) => {
            row.forEach((cellText, ci) => {
                cells.push({
                    row: ri + 1,
                    col: ci,
                    x: startX + ci * cellW,
                    y: startY + (ri + 1) * cellH,
                    width: cellW,
                    height: cellH,
                    text: cellText,
                    confidence: 0.85 + Math.random() * 0.12, // 85–97%
                });
            });
        });

        // Round confidence to 2 decimals
        cells.forEach((c) => {
            c.confidence = Math.round(c.confidence * 100) / 100;
        });

        console.log(`[TableDetector] Detected ${rows} rows × ${cols} cols (mock fallback)`);
        return { rows: rows + 1, cols, cells, headers };
    } catch (error) {
        console.warn('[TableDetector] Detection failed, returning minimal table:', error);
        return { rows: 1, cols: 1, cells: [{ row: 0, col: 0, x: 0, y: 0, width: 100, height: 40, text: 'N/A', confidence: 0.5 }], headers: ['Data'] };
    }
}
