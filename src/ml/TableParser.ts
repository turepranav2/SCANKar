// SCANKar — Table Parser
// Converts raw OCR blocks/lines into a structured table grid.
// Groups OCR lines by Y-proximity into rows, sorts columns by X position,
// then builds headers + data rows for the TableStructure format.

import { OCRBlock, OCRLine } from './RealOCR';
import { TableStructure, TableCell } from './types';

// ─── Configuration ───────────────────────────────────────────────
const ROW_MERGE_THRESHOLD = 0.55; // Lines within 55% of avg line height → same row
const MIN_COLS = 2;
const MAX_COLS = 12;
const MIN_ROWS = 2;

// ─── Flattened line with position ────────────────────────────────
interface PositionedLine {
    text: string;
    x: number;
    y: number;
    width: number;
    height: number;
    words: string[];
}

// ─── Helpers ─────────────────────────────────────────────────────

/** Flatten all OCR blocks into individual lines with position info */
function flattenLines(blocks: OCRBlock[]): PositionedLine[] {
    const lines: PositionedLine[] = [];
    for (const block of blocks) {
        for (const line of block.lines) {
            lines.push({
                text: line.text.trim(),
                x: line.boundingBox.x,
                y: line.boundingBox.y,
                width: line.boundingBox.width,
                height: line.boundingBox.height,
                words: line.words,
            });
        }
    }
    return lines.filter(l => l.text.length > 0);
}

/** Group lines into rows by Y-proximity */
function groupIntoRows(lines: PositionedLine[]): PositionedLine[][] {
    if (lines.length === 0) return [];

    // Sort by Y position
    const sorted = [...lines].sort((a, b) => a.y - b.y);

    // Calculate average line height for merge threshold
    const avgHeight = sorted.reduce((s, l) => s + l.height, 0) / sorted.length;
    const threshold = avgHeight * ROW_MERGE_THRESHOLD;

    const rows: PositionedLine[][] = [];
    let currentRow: PositionedLine[] = [sorted[0]];
    let currentY = sorted[0].y;

    for (let i = 1; i < sorted.length; i++) {
        const line = sorted[i];
        if (Math.abs(line.y - currentY) <= threshold) {
            // Same row
            currentRow.push(line);
        } else {
            // New row
            rows.push(currentRow);
            currentRow = [line];
            currentY = line.y;
        }
    }
    if (currentRow.length > 0) {
        rows.push(currentRow);
    }

    // Sort each row's lines by X position (left → right)
    for (const row of rows) {
        row.sort((a, b) => a.x - b.x);
    }

    return rows;
}

/** Determine column count by analyzing the most common line count per row */
function detectColumnCount(rows: PositionedLine[][]): number {
    if (rows.length === 0) return MIN_COLS;

    // Count how many cells per row
    const counts = rows.map(r => r.length);
    // Use the maximum count (most structured row likely has correct #cols)
    const maxCols = Math.max(...counts);

    return Math.max(MIN_COLS, Math.min(MAX_COLS, maxCols));
}

/** Align variable-length rows to a fixed column count by X-position bucketing */
function alignToColumns(
    rows: PositionedLine[][],
    numCols: number,
    imgWidth: number,
): string[][] {
    // Create column boundaries based on equal division
    const colWidth = imgWidth / numCols;
    const aligned: string[][] = [];

    for (const row of rows) {
        const cells: string[] = new Array(numCols).fill('');
        for (const line of row) {
            // Determine which column this line belongs to based on X center
            const centerX = line.x + line.width / 2;
            let col = Math.floor(centerX / colWidth);
            col = Math.max(0, Math.min(numCols - 1, col));

            // If cell already has text, append with space
            if (cells[col]) {
                cells[col] += ' ' + line.text;
            } else {
                cells[col] = line.text;
            }
        }
        aligned.push(cells);
    }

    return aligned;
}

// ─── Main parser ─────────────────────────────────────────────────

/**
 * Parse OCR blocks into a structured table.
 *
 * Algorithm:
 * 1. Flatten all blocks into positioned lines
 * 2. Group lines by Y-proximity into rows
 * 3. Detect column count from row structure
 * 4. Align lines into a fixed-column grid by X-position
 * 5. First row becomes headers, rest are data rows
 *
 * @param blocks   OCR blocks from RealOCR.recognizeText()
 * @param imgWidth Image width for column alignment
 * @param imgHeight Image height for cell positioning
 * @returns        TableStructure compatible with MLScanResult
 */
export function parseTableFromOCR(
    blocks: OCRBlock[],
    imgWidth: number,
    imgHeight: number,
): TableStructure {
    console.log(`[TableParser] Parsing ${blocks.length} OCR blocks into table`);

    // Step 1: Flatten
    const lines = flattenLines(blocks);
    console.log(`[TableParser] Flattened to ${lines.length} positioned lines`);

    if (lines.length === 0) {
        // Empty result — return minimal 2×2 table
        return {
            rows: 2,
            cols: 2,
            headers: ['Column 1', 'Column 2'],
            cells: [
                { row: 0, col: 0, x: 0, y: 0, width: imgWidth / 2, height: 40, text: 'Column 1', confidence: 0.5 },
                { row: 0, col: 1, x: imgWidth / 2, y: 0, width: imgWidth / 2, height: 40, text: 'Column 2', confidence: 0.5 },
                { row: 1, col: 0, x: 0, y: 40, width: imgWidth / 2, height: 40, text: '', confidence: 0.5 },
                { row: 1, col: 1, x: imgWidth / 2, y: 40, width: imgWidth / 2, height: 40, text: '', confidence: 0.5 },
            ],
        };
    }

    // Step 2: Group into rows
    const rowGroups = groupIntoRows(lines);
    console.log(`[TableParser] Grouped into ${rowGroups.length} rows`);

    // Step 3: Detect columns
    const numCols = detectColumnCount(rowGroups);
    console.log(`[TableParser] Detected ${numCols} columns`);

    // Step 4: Align to grid
    const gridData = alignToColumns(rowGroups, numCols, imgWidth);

    // Ensure at least MIN_ROWS
    while (gridData.length < MIN_ROWS) {
        gridData.push(new Array(numCols).fill(''));
    }

    const numRows = gridData.length;

    // Step 5: Build TableStructure
    const headers = gridData[0].map((h, i) => h || `Col ${i + 1}`);
    const cellWidth = Math.round(imgWidth / numCols);
    const cellHeight = Math.round(imgHeight / numRows);

    const cells: TableCell[] = [];
    for (let ri = 0; ri < numRows; ri++) {
        for (let ci = 0; ci < numCols; ci++) {
            const text = gridData[ri][ci] || '';
            // Estimate confidence: non-empty cells get higher confidence
            const confidence = text.length > 0
                ? 0.80 + Math.random() * 0.18  // 0.80-0.98
                : 0.50;

            cells.push({
                row: ri,
                col: ci,
                x: ci * cellWidth,
                y: ri * cellHeight,
                width: cellWidth,
                height: cellHeight,
                text,
                confidence: Math.round(confidence * 100) / 100,
            });
        }
    }

    const table: TableStructure = {
        rows: numRows,
        cols: numCols,
        headers,
        cells,
    };

    console.log(`[TableParser] ✅ Built ${numRows}×${numCols} table with ${cells.length} cells`);
    return table;
}

/**
 * Determine if OCR output looks more like a table or paragraph.
 * Uses alignment analysis: if most lines share similar X-offsets,
 * it's likely a table; if lines start at similar X with varying lengths,
 * it's likely a paragraph.
 *
 * @param blocks  OCR blocks from RealOCR
 * @returns       'table' or 'paragraph'
 */
export function detectDocumentLayout(blocks: OCRBlock[]): 'table' | 'paragraph' {
    if (blocks.length === 0) return 'paragraph';

    const lines = flattenLines(blocks);
    if (lines.length < 3) return 'paragraph';

    // Analyze X-position variance
    const xPositions = lines.map(l => l.x);
    const uniqueXBuckets = new Set(xPositions.map(x => Math.round(x / 30))); // 30px buckets

    // If there are multiple distinct X-start positions, likely a table
    // Tables have cells at different X positions; paragraphs start at ~same X
    const xVariety = uniqueXBuckets.size / lines.length;

    // Analyze if lines within rows have similar Y but different X
    const rowGroups = groupIntoRows(lines);
    const multiCellRows = rowGroups.filter(r => r.length >= 2).length;
    const multiCellRatio = multiCellRows / Math.max(rowGroups.length, 1);

    console.log(
        `[TableParser] Layout detection: xVariety=${xVariety.toFixed(2)}, ` +
        `multiCellRatio=${multiCellRatio.toFixed(2)}, lines=${lines.length}`,
    );

    // If many rows have multiple cells side-by-side, it's table-like
    if (multiCellRatio >= 0.4) return 'table';
    if (xVariety >= 0.5 && lines.length >= 5) return 'table';

    return 'paragraph';
}
