// SCANKar — Scan Storage Service (Placeholder for MMKV)

import { Scan, ScanIndexEntry } from '../../models/Scan';

// In production, this uses MMKV for high-performance storage
// Placeholder implementation using in-memory store

let scanIndex: ScanIndexEntry[] = [];
let scans: Map<string, Scan> = new Map();

export async function getScanIndex(): Promise<ScanIndexEntry[]> {
    return [...scanIndex];
}

export async function getScan(id: string): Promise<Scan | null> {
    return scans.get(id) || null;
}

export async function saveScan(scan: Scan): Promise<void> {
    scans.set(scan.id, scan);

    // Update index
    const existing = scanIndex.findIndex(e => e.id === scan.id);
    const entry: ScanIndexEntry = {
        id: scan.id,
        name: scan.name,
        documentType: scan.documentType,
        overallConfidence: scan.overallConfidence,
        createdAt: scan.createdAt,
        thumbnailUri: scan.thumbnailUri,
    };

    if (existing >= 0) {
        scanIndex[existing] = entry;
    } else {
        scanIndex.unshift(entry);
    }
}

export async function deleteScan(id: string): Promise<void> {
    scans.delete(id);
    scanIndex = scanIndex.filter(e => e.id !== id);
}

export async function clearAllScans(): Promise<void> {
    scans.clear();
    scanIndex = [];
}

export async function getRecentScans(limit: number = 5): Promise<ScanIndexEntry[]> {
    return scanIndex.slice(0, limit);
}

export async function searchScans(query: string): Promise<ScanIndexEntry[]> {
    const lower = query.toLowerCase();
    return scanIndex.filter(e => e.name.toLowerCase().includes(lower));
}
