// SCANKar — Image Fidelity Engine
// Uses the ORIGINAL scanned image as the visual base and overlays
// OCR text at exact pixel positions. Solves column alignment permanently.

import { Image } from 'react-native';
import { RealOCRResult, OCRBlock } from './RealOCR';
import { TableStructure, TableCell, ParagraphBlock } from './types';

// ─── Public Types ────────────────────────────────────────────────

export interface FidelityTextBlock {
    text: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fontSize: number;
    isBold: boolean;
    color: string;
    backgroundColor: string;
    alignment: 'left' | 'center' | 'right';
    isHeader: boolean;
    isNumeric: boolean;
    columnIndex: number;
    rowIndex: number;
}

export interface FidelityLayer {
    originalImageUri: string;
    width: number;
    height: number;
    backgroundColor: string;
    textBlocks: FidelityTextBlock[];
}

// ─── Engine ──────────────────────────────────────────────────────

export class ImageFidelityEngine {

    async analyze(imageUri: string, ocrResult: RealOCRResult): Promise<FidelityLayer> {
        // Step 1: Get image dimensions
        const { width, height } = await this.getImageDimensions(imageUri);

        // Step 2: Sample background color (simplified — assume white for scanned docs)
        const backgroundColor = '#FFFFFF';

        // Step 3: Convert OCR blocks to FidelityTextBlocks using EXACT bounding boxes
        const avgBlockHeight = this.getAverageLineHeight(ocrResult.blocks);

        const textBlocks: FidelityTextBlock[] = ocrResult.blocks.flatMap(block =>
            block.lines.map(line => ({
                text: line.text,
                x: line.boundingBox.x,
                y: line.boundingBox.y,
                width: line.boundingBox.width,
                height: line.boundingBox.height,
                fontSize: Math.round(line.boundingBox.height * 0.75),
                isBold: line.boundingBox.height > avgBlockHeight * 1.3,
                color: '#000000',
                backgroundColor,
                alignment: this.detectAlignment(line.boundingBox, width),
                isHeader: line.boundingBox.y < height * 0.15 &&
                    line.boundingBox.height > avgBlockHeight * 1.2,
                isNumeric: /^[\d\s.,\-/]+$/.test(line.text.trim()),
                columnIndex: -1,
                rowIndex: -1,
            })),
        );

        // Step 4: Detect columns by clustering X positions
        const withColumns = this.assignColumnsAndRows(textBlocks, width);

        console.log(
            `[FidelityEngine] ✅ ${withColumns.length} text blocks, ` +
            `${new Set(withColumns.map(b => b.columnIndex)).size} cols, ` +
            `${new Set(withColumns.map(b => b.rowIndex)).size} rows, ` +
            `image ${width}×${height}`,
        );

        return { originalImageUri: imageUri, width, height, backgroundColor, textBlocks: withColumns };
    }

    // ── Column / Row Assignment ──────────────────────────────

    private assignColumnsAndRows(blocks: FidelityTextBlock[], imageWidth: number): FidelityTextBlock[] {
        if (blocks.length === 0) return blocks;

        // Sort by Y position (top to bottom)
        const sorted = [...blocks].sort((a, b) => a.y - b.y);

        // Group into rows by Y proximity (within 60% of block height = same row)
        const rows: FidelityTextBlock[][] = [];
        let currentRow: FidelityTextBlock[] = [];
        let lastY = -999;

        for (const block of sorted) {
            if (Math.abs(block.y - lastY) > block.height * 0.6) {
                if (currentRow.length > 0) rows.push(currentRow);
                currentRow = [block];
                lastY = block.y;
            } else {
                currentRow.push(block);
                lastY = (lastY + block.y) / 2;
            }
        }
        if (currentRow.length > 0) rows.push(currentRow);

        // Within each row, sort by X position (left to right)
        for (const row of rows) {
            row.sort((a, b) => a.x - b.x);
        }

        // Find column centers using k-means on X positions
        const allXPositions = blocks.map(b => b.x);
        const columnCenters = this.kMeansXClustering(allXPositions, imageWidth);

        return blocks.map(block => {
            const nearestCol = columnCenters.reduce((best, center, idx) =>
                Math.abs(block.x - center) < Math.abs(block.x - columnCenters[best]) ? idx : best, 0);

            const rowIdx = rows.findIndex(row =>
                row.some(b => b.x === block.x && b.y === block.y && b.text === block.text));

            return { ...block, columnIndex: nearestCol, rowIndex: rowIdx };
        });
    }

    private kMeansXClustering(xPositions: number[], imageWidth: number): number[] {
        if (xPositions.length === 0) return [0];

        const k = Math.min(8, Math.max(1, Math.round(imageWidth / 120)));
        let centers = Array.from({ length: k }, (_, i) => (i + 0.5) * imageWidth / k);

        for (let iter = 0; iter < 10; iter++) {
            const clusters: number[][] = Array.from({ length: k }, () => []);
            for (const x of xPositions) {
                const nearest = centers.reduce((best, c, i) =>
                    Math.abs(x - c) < Math.abs(x - centers[best]) ? i : best, 0);
                clusters[nearest].push(x);
            }
            const newCenters = clusters.map((cluster, i) =>
                cluster.length > 0 ? cluster.reduce((a, b) => a + b, 0) / cluster.length : centers[i]);
            if (newCenters.every((c, i) => Math.abs(c - centers[i]) < 1)) break;
            centers = newCenters;
        }

        // Filter out empty clusters and sort
        return centers
            .filter((_, i) => {
                const cluster = xPositions.filter(x => {
                    const nearest = centers.reduce((best, c, idx) =>
                        Math.abs(x - c) < Math.abs(x - centers[best]) ? idx : best, 0);
                    return nearest === i;
                });
                return cluster.length > 0;
            })
            .sort((a, b) => a - b);
    }

    // ── Helpers ──────────────────────────────────────────────

    private detectAlignment(
        bbox: { x: number; width: number },
        imageWidth: number,
    ): 'left' | 'center' | 'right' {
        const center = bbox.x + bbox.width / 2;
        if (center < imageWidth * 0.35) return 'left';
        if (center > imageWidth * 0.65) return 'right';
        return 'center';
    }

    private async getImageDimensions(uri: string): Promise<{ width: number; height: number }> {
        return new Promise(resolve => {
            Image.getSize(
                uri,
                (w, h) => resolve({ width: w, height: h }),
                () => resolve({ width: 800, height: 1200 }),
            );
        });
    }

    private getAverageLineHeight(blocks: OCRBlock[]): number {
        const heights: number[] = [];
        for (const block of blocks) {
            for (const line of block.lines) {
                if (line.boundingBox.height > 0) {
                    heights.push(line.boundingBox.height);
                }
            }
        }
        if (heights.length === 0) return 20;
        return heights.reduce((a, b) => a + b, 0) / heights.length;
    }

    // ── Converters for existing screen formats ───────────────

    toTableStructure(layer: FidelityLayer): TableStructure {
        if (layer.textBlocks.length === 0) {
            return { rows: 2, cols: 2, headers: ['Col 1', 'Col 2'], cells: [] };
        }

        const maxRow = Math.max(...layer.textBlocks.map(b => b.rowIndex));
        const maxCol = Math.max(...layer.textBlocks.map(b => b.columnIndex));
        const numRows = maxRow + 1;
        const numCols = maxCol + 1;

        // Build headers from first row
        const headers: string[] = Array(numCols).fill('');
        const cells: TableCell[] = [];

        for (const block of layer.textBlocks) {
            if (block.rowIndex === 0) {
                if (!headers[block.columnIndex] || headers[block.columnIndex] === '') {
                    headers[block.columnIndex] = block.text;
                } else {
                    headers[block.columnIndex] += ' ' + block.text;
                }
            }

            cells.push({
                row: block.rowIndex,
                col: block.columnIndex,
                text: block.text,
                confidence: 0.90,
                x: block.x,
                y: block.y,
                width: block.width,
                height: block.height,
            });
        }

        // Fill empty headers
        headers.forEach((h, i) => {
            if (!h) headers[i] = `Col ${i + 1}`;
        });

        return { rows: numRows, cols: numCols, headers, cells };
    }

    toParagraphBlocks(layer: FidelityLayer): ParagraphBlock[] {
        const rowMap = new Map<number, FidelityTextBlock[]>();
        for (const block of layer.textBlocks) {
            if (!rowMap.has(block.rowIndex)) rowMap.set(block.rowIndex, []);
            rowMap.get(block.rowIndex)!.push(block);
        }

        const rows = Array.from(rowMap.entries())
            .sort(([a], [b]) => a - b)
            .map(([, blocks]) => blocks.sort((a, b) => a.columnIndex - b.columnIndex));

        return rows.map(row => ({
            text: row.map(b => b.text).join(' '),
            confidence: 0.88,
            language: 'english' as const,
            boundingBox: {
                x: Math.min(...row.map(b => b.x)),
                y: Math.min(...row.map(b => b.y)),
                width: Math.max(...row.map(b => b.x + b.width)) - Math.min(...row.map(b => b.x)),
                height: Math.max(...row.map(b => b.y + b.height)) - Math.min(...row.map(b => b.y)),
            },
        }));
    }
}

export const imageFidelityEngine = new ImageFidelityEngine();
