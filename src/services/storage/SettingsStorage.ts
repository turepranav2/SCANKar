// SCANKar — Settings Storage Service

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../constants/config';
import { AppSettings } from '../../context/AppContext';

export async function getSettings(): Promise<Partial<AppSettings> | null> {
    try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
        if (raw) {
            return JSON.parse(raw);
        }
    } catch { }
    return null;
}

export async function saveSettings(settings: AppSettings): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

export async function clearCache(): Promise<void> {
    // Clear temporary files and cached data
    // Does NOT clear saved scans or settings
    // Implementation: clear temp export files, image cache, etc.
    // Placeholder — real implementation in Module 8
}

export async function clearAllHistory(): Promise<void> {
    // Clear all scan history data
    // Placeholder — real implementation in Module 8
    await AsyncStorage.removeItem(STORAGE_KEYS.SCAN_INDEX);
}
