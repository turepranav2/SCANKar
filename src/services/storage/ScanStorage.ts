import AsyncStorage from '@react-native-async-storage/async-storage';
import { Scan } from '../../models/Scan';

const SCAN_KEY_PREFIX = 'scankar_scan_';
const INDEX_KEY = 'scankar_scan_index';

export const saveScan = async (scan: Scan): Promise<void> => {
    try {
        await AsyncStorage.setItem(`${SCAN_KEY_PREFIX}${scan.id}`, JSON.stringify(scan));

        let index: string[] = [];
        const indexStr = await AsyncStorage.getItem(INDEX_KEY);
        if (indexStr) {
            index = JSON.parse(indexStr);
        }

        if (!index.includes(scan.id)) {
            index.push(scan.id);
            await AsyncStorage.setItem(INDEX_KEY, JSON.stringify(index));
        }
    } catch (e) {
        console.error('Failed to save scan', e);
    }
};

export const getScan = async (scanId: string): Promise<Scan | null> => {
    try {
        const str = await AsyncStorage.getItem(`${SCAN_KEY_PREFIX}${scanId}`);
        return str ? JSON.parse(str) : null;
    } catch (e) {
        console.error('Failed to get scan', e);
        return null;
    }
};

export const getAllScans = async (): Promise<Scan[]> => {
    try {
        const indexStr = await AsyncStorage.getItem(INDEX_KEY);
        if (!indexStr) return [];
        const index: string[] = JSON.parse(indexStr);

        const scans: Scan[] = [];
        for (const id of index) {
            const scan = await getScan(id);
            if (scan) {
                scans.push(scan);
            }
        }

        // Return newest first
        return scans.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (e) {
        console.error('Failed to get all scans', e);
        return [];
    }
};

export const deleteScan = async (scanId: string): Promise<void> => {
    try {
        await AsyncStorage.removeItem(`${SCAN_KEY_PREFIX}${scanId}`);

        const indexStr = await AsyncStorage.getItem(INDEX_KEY);
        if (indexStr) {
            let index: string[] = JSON.parse(indexStr);
            index = index.filter(id => id !== scanId);
            await AsyncStorage.setItem(INDEX_KEY, JSON.stringify(index));
        }
    } catch (e) {
        console.error('Failed to delete scan', e);
    }
};

export const getRecentScans = async (limit: number): Promise<Scan[]> => {
    const all = await getAllScans();
    return all.slice(0, limit);
};

export const getScanStats = async (): Promise<{ total: number; thisWeek: number; exports: number }> => {
    try {
        const all = await getAllScans();

        const now = new Date();
        const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());

        const thisWeek = all.filter(s => new Date(s.createdAt) >= startOfWeek).length;

        let exports = 0;
        const eStr = await AsyncStorage.getItem('scankar_exports_count');
        if (eStr) exports = parseInt(eStr, 10);

        return { total: all.length, thisWeek, exports };
    } catch (e) {
        console.error('Failed to get stats', e);
        return { total: 0, thisWeek: 0, exports: 0 };
    }
};
