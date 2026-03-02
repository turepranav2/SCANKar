// SCANKar — App Context Provider (Settings, Stats, Model Statuses)

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/config';
import { ModelStatus } from '../models/MLModel';
import { ML_MODELS } from '../constants/mlModels';
import { ExportFormat } from '../models/ExportPayload';

export interface AppSettings {
    themeMode: 'light' | 'dark' | 'system';
    autoEnhance: boolean;
    autoCapture: boolean;
    defaultScanMode: 'auto' | 'table' | 'text' | 'form';
    ocrLanguage: 'en' | 'hi' | 'auto';
    defaultExportFormat: ExportFormat;
    includeConfidenceByDefault: boolean;
    confidenceThreshold: number;
}

const DEFAULT_SETTINGS: AppSettings = {
    themeMode: 'system',
    autoEnhance: true,
    autoCapture: false,
    defaultScanMode: 'auto',
    ocrLanguage: 'auto',
    defaultExportFormat: 'xlsx',
    includeConfidenceByDefault: true,
    confidenceThreshold: 0.8,
};

interface AppStats {
    totalScans: number;
    weeklyScans: number;
    totalExports: number;
}

interface AppContextValue {
    settings: AppSettings;
    stats: AppStats;
    modelStatuses: ModelStatus[];
    updateSettings: (partial: Partial<AppSettings>) => Promise<void>;
    updateStats: (partial: Partial<AppStats>) => void;
    setModelStatuses: (statuses: ModelStatus[]) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
    const [stats, setStats] = useState<AppStats>({ totalScans: 0, weeklyScans: 0, totalExports: 0 });
    const [modelStatuses, setModelStatuses] = useState<ModelStatus[]>(
        ML_MODELS.map(m => ({ modelId: m.id, status: 'unloaded' as const }))
    );

    useEffect(() => {
        AsyncStorage.getItem(STORAGE_KEYS.SETTINGS).then((raw) => {
            if (raw) {
                try {
                    const stored = JSON.parse(raw);
                    setSettings(prev => ({ ...prev, ...stored }));
                } catch { }
            }
        });
    }, []);

    const updateSettings = useCallback(async (partial: Partial<AppSettings>) => {
        setSettings(prev => {
            const updated = { ...prev, ...partial };
            AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
            return updated;
        });
    }, []);

    const updateStats = useCallback((partial: Partial<AppStats>) => {
        setStats(prev => ({ ...prev, ...partial }));
    }, []);

    const value = useMemo<AppContextValue>(() => ({
        settings,
        stats,
        modelStatuses,
        updateSettings,
        updateStats,
        setModelStatuses,
    }), [settings, stats, modelStatuses, updateSettings, updateStats]);

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = (): AppContextValue => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};

export default AppContext;
