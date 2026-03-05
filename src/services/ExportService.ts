// SCANKar — Export Service
// Real file generation for Excel, PDF, Word, CSV, JSON
// Uses xlsx, jspdf, docx, react-native-html-to-pdf, react-native-fs, react-native-share

import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import XLSX from 'xlsx';
import { generatePDF as generatePDFFile } from 'react-native-html-to-pdf';
import {
    Document,
    Packer,
    Paragraph,
    Table,
    TableRow,
    TableCell as DocxCell,
    TextRun,
    WidthType,
    AlignmentType,
    HeadingLevel,
    BorderStyle,
} from 'docx';
import { Scan } from '../models/Scan';
import { ExportFormat } from '../models/ExportPayload';

const EXPORT_DIR = `${RNFS.DownloadDirectoryPath}/SCANKar`;

async function ensureDir(): Promise<void> {
    const exists = await RNFS.exists(EXPORT_DIR);
    if (!exists) {
        await RNFS.mkdir(EXPORT_DIR);
    }
}

function sanitizeFilename(name: string): string {
    return name.replace(/[^a-zA-Z0-9_\- ]/g, '_').substring(0, 80);
}

// ── Excel Export ─────────────────────────────────────────────────

async function exportExcel(
    scan: Scan,
    includeConfidence: boolean,
): Promise<string> {
    await ensureDir();
    const wb = XLSX.utils.book_new();

    if (scan.tableData) {
        const rows: string[][] = [];

        // Headers
        if (scan.tableData.headers && scan.tableData.headers.length > 0) {
            rows.push(scan.tableData.headers.map(h => h.value));
        }

        // Data rows
        if (scan.tableData.rows) {
            for (const row of scan.tableData.rows) {
                rows.push(row.map(cell => cell.value));
            }
        } else if (scan.tableData.cells) {
            for (const row of scan.tableData.cells) {
                rows.push(row.map(cell => cell.text));
            }
        }

        if (includeConfidence && scan.tableData.headers) {
            rows.push([]);
            rows.push(['--- Confidence Scores ---']);
            if (scan.tableData.rows) {
                for (const row of scan.tableData.rows) {
                    rows.push(row.map(cell => `${Math.round(cell.confidence * 100)}%`));
                }
            }
        }

        const ws = XLSX.utils.aoa_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, 'Scan Data');
    } else if (scan.paragraphData) {
        const rows = scan.paragraphData.blocks.map(b => {
            const row: string[] = [b.text];
            if (includeConfidence) {
                row.push(`${Math.round(b.confidence * 100)}%`);
            }
            return row;
        });
        if (includeConfidence) {
            rows.unshift(['Text', 'Confidence']);
        }
        const ws = XLSX.utils.aoa_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, 'Text Data');
    }

    const wbOut = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
    const filePath = `${EXPORT_DIR}/${sanitizeFilename(scan.name)}.xlsx`;
    await RNFS.writeFile(filePath, wbOut, 'base64');
    return filePath;
}

// ── PDF Export ───────────────────────────────────────────────────

async function exportPDF(
    scan: Scan,
    includeConfidence: boolean,
): Promise<string> {
    await ensureDir();

    let html = `<html><head><style>
        body { font-family: Arial, sans-serif; margin: 24px; color: #1E293B; }
        h1 { font-size: 20px; color: #0F172A; margin-bottom: 4px; }
        .meta { font-size: 11px; color: #64748B; margin-bottom: 16px; }
        table { border-collapse: collapse; width: 100%; margin-top: 12px; }
        th, td { border: 1px solid #CBD5E1; padding: 8px 10px; font-size: 13px; text-align: left; }
        th { background: #EFF6FF; font-weight: 700; }
        .block { margin-bottom: 12px; line-height: 1.6; font-size: 14px; }
        .conf { font-size: 10px; color: #94A3B8; }
    </style></head><body>`;

    html += `<h1>${scan.name}</h1>`;
    html += `<div class="meta">Type: ${scan.documentType} | Confidence: ${scan.overallConfidence}% | ${scan.createdAt}</div>`;

    if (scan.tableData) {
        html += '<table>';
        if (scan.tableData.headers && scan.tableData.headers.length > 0) {
            html += '<tr>';
            for (const h of scan.tableData.headers) {
                html += `<th>${escapeHtml(h.value)}</th>`;
            }
            html += '</tr>';
        }
        if (scan.tableData.rows) {
            for (const row of scan.tableData.rows) {
                html += '<tr>';
                for (const cell of row) {
                    html += `<td>${escapeHtml(cell.value)}`;
                    if (includeConfidence) {
                        html += ` <span class="conf">(${Math.round(cell.confidence * 100)}%)</span>`;
                    }
                    html += '</td>';
                }
                html += '</tr>';
            }
        } else if (scan.tableData.cells) {
            for (const row of scan.tableData.cells) {
                html += '<tr>';
                for (const cell of row) {
                    html += `<td>${escapeHtml(cell.text)}</td>`;
                }
                html += '</tr>';
            }
        }
        html += '</table>';
    } else if (scan.paragraphData) {
        for (const block of scan.paragraphData.blocks) {
            html += `<div class="block">${escapeHtml(block.text)}`;
            if (includeConfidence) {
                html += ` <span class="conf">(${Math.round(block.confidence * 100)}%)</span>`;
            }
            html += '</div>';
        }
    }

    html += '</body></html>';

    // Use react-native-html-to-pdf
    const pdfResult = await generatePDFFile({
        html,
        fileName: sanitizeFilename(scan.name),
        directory: 'Documents',
    });

    const filePath = `${EXPORT_DIR}/${sanitizeFilename(scan.name)}.pdf`;
    if (pdfResult.filePath) {
        await RNFS.moveFile(pdfResult.filePath, filePath);
    }
    return filePath;
}

// ── Word Export ──────────────────────────────────────────────────

async function exportWord(
    scan: Scan,
    includeConfidence: boolean,
): Promise<string> {
    await ensureDir();

    const children: (Paragraph | Table)[] = [];

    // Title
    children.push(
        new Paragraph({
            children: [new TextRun({ text: scan.name, bold: true, size: 32 })],
            heading: HeadingLevel.HEADING_1,
        }),
    );

    // Metadata
    children.push(
        new Paragraph({
            children: [
                new TextRun({
                    text: `Type: ${scan.documentType} | Confidence: ${scan.overallConfidence}% | ${scan.createdAt}`,
                    size: 18,
                    color: '64748B',
                }),
            ],
            spacing: { after: 200 },
        }),
    );

    if (scan.tableData) {
        const tableRows: TableRow[] = [];

        // Header row
        if (scan.tableData.headers && scan.tableData.headers.length > 0) {
            tableRows.push(
                new TableRow({
                    children: scan.tableData.headers.map(
                        h =>
                            new DocxCell({
                                children: [new Paragraph({ children: [new TextRun({ text: h.value, bold: true })] })],
                                width: { size: 2000, type: WidthType.DXA },
                            }),
                    ),
                }),
            );
        }

        // Data rows
        const dataRows = scan.tableData.rows || [];
        for (const row of dataRows) {
            tableRows.push(
                new TableRow({
                    children: row.map(
                        cell =>
                            new DocxCell({
                                children: [new Paragraph({ children: [new TextRun({ text: cell.value })] })],
                                width: { size: 2000, type: WidthType.DXA },
                            }),
                    ),
                }),
            );
        }

        if (tableRows.length > 0) {
            children.push(
                new Table({
                    rows: tableRows,
                    width: { size: 100, type: WidthType.PERCENTAGE },
                }),
            );
        }
    } else if (scan.paragraphData) {
        for (const block of scan.paragraphData.blocks) {
            const runs: TextRun[] = [new TextRun({ text: block.text })];
            if (includeConfidence) {
                runs.push(new TextRun({ text: ` (${Math.round(block.confidence * 100)}%)`, color: '94A3B8', size: 18 }));
            }
            children.push(new Paragraph({ children: runs, spacing: { after: 120 } }));
        }
    }

    const doc = new Document({
        sections: [{ children }],
    });

    const buffer = await Packer.toBase64String(doc);
    const filePath = `${EXPORT_DIR}/${sanitizeFilename(scan.name)}.docx`;
    await RNFS.writeFile(filePath, buffer, 'base64');
    return filePath;
}

// ── CSV Export ───────────────────────────────────────────────────

async function exportCSV(
    scan: Scan,
    includeConfidence: boolean,
): Promise<string> {
    await ensureDir();
    const lines: string[] = [];

    if (scan.tableData) {
        if (scan.tableData.headers) {
            lines.push(scan.tableData.headers.map(h => csvEscape(h.value)).join(','));
        }
        if (scan.tableData.rows) {
            for (const row of scan.tableData.rows) {
                lines.push(row.map(cell => csvEscape(cell.value)).join(','));
            }
        } else if (scan.tableData.cells) {
            for (const row of scan.tableData.cells) {
                lines.push(row.map(cell => csvEscape(cell.text)).join(','));
            }
        }
    } else if (scan.paragraphData) {
        if (includeConfidence) {
            lines.push('"Text","Confidence"');
        }
        for (const block of scan.paragraphData.blocks) {
            if (includeConfidence) {
                lines.push(`${csvEscape(block.text)},${Math.round(block.confidence * 100)}%`);
            } else {
                lines.push(csvEscape(block.text));
            }
        }
    }

    const filePath = `${EXPORT_DIR}/${sanitizeFilename(scan.name)}.csv`;
    await RNFS.writeFile(filePath, lines.join('\n'), 'utf8');
    return filePath;
}

// ── JSON Export ──────────────────────────────────────────────────

async function exportJSON(
    scan: Scan,
    includeConfidence: boolean,
): Promise<string> {
    await ensureDir();

    const payload: Record<string, unknown> = {
        version: '1.0',
        scanId: scan.id,
        scanDate: scan.createdAt,
        documentType: scan.documentType,
        overallConfidence: scan.overallConfidence,
        language: scan.languageDetected,
    };

    if (scan.tableData) {
        const tableExport: Record<string, unknown> = {};
        if (scan.tableData.headers) {
            tableExport.headers = scan.tableData.headers.map(h => h.value);
        }
        if (scan.tableData.rows) {
            tableExport.rows = scan.tableData.rows.map(row =>
                row.map(cell => {
                    const cellOut: Record<string, unknown> = { value: cell.value };
                    if (includeConfidence) {
                        cellOut.confidence = cell.confidence;
                    }
                    return cellOut;
                }),
            );
        }
        payload.data = tableExport;
    } else if (scan.paragraphData) {
        payload.data = {
            blocks: scan.paragraphData.blocks.map(b => {
                const out: Record<string, unknown> = { text: b.text };
                if (includeConfidence) {
                    out.confidence = b.confidence;
                }
                if (b.language) {
                    out.language = b.language;
                }
                return out;
            }),
        };
    }

    const filePath = `${EXPORT_DIR}/${sanitizeFilename(scan.name)}.json`;
    await RNFS.writeFile(filePath, JSON.stringify(payload, null, 2), 'utf8');
    return filePath;
}

// ── Helpers ──────────────────────────────────────────────────────

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function csvEscape(str: string): string {
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

// ── Main Export Function ─────────────────────────────────────────

export async function exportScan(
    scan: Scan,
    format: ExportFormat,
    options: { includeConfidence: boolean; includeOriginalImage: boolean },
): Promise<string> {
    let filePath: string;

    switch (format) {
        case 'xlsx':
            filePath = await exportExcel(scan, options.includeConfidence);
            break;
        case 'pdf':
            filePath = await exportPDF(scan, options.includeConfidence);
            break;
        case 'docx':
            filePath = await exportWord(scan, options.includeConfidence);
            break;
        case 'csv':
            filePath = await exportCSV(scan, options.includeConfidence);
            break;
        case 'json':
            filePath = await exportJSON(scan, options.includeConfidence);
            break;
        default:
            throw new Error(`Unsupported export format: ${format}`);
    }

    return filePath;
}

export async function shareFile(filePath: string, mimeType: string): Promise<void> {
    await Share.open({
        url: `file://${filePath}`,
        type: mimeType,
    });
}

export function getMimeType(format: ExportFormat): string {
    switch (format) {
        case 'xlsx':
            return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        case 'pdf':
            return 'application/pdf';
        case 'docx':
            return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        case 'csv':
            return 'text/csv';
        case 'json':
            return 'application/json';
    }
}
