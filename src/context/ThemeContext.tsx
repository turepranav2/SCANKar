// SCANKar — Theme Context Provider

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ColorTokens, lightColors, darkColors } from '../theme';
import { STORAGE_KEYS } from '../constants/config';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
    mode: ThemeMode;
    resolvedMode: 'light' | 'dark';
    colors: ColorTokens;
    setMode: (mode: ThemeMode) => void;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const systemScheme = useColorScheme();
    const [mode, setModeState] = useState<ThemeMode>('system');

    useEffect(() => {
        AsyncStorage.getItem(STORAGE_KEYS.SETTINGS).then((raw) => {
            if (raw) {
                try {
                    const settings = JSON.parse(raw);
                    if (settings.themeMode) {
                        setModeState(settings.themeMode);
                    }
                } catch { }
            }
        });
    }, []);

    const setMode = useCallback((newMode: ThemeMode) => {
        setModeState(newMode);
        AsyncStorage.getItem(STORAGE_KEYS.SETTINGS).then((raw) => {
            const settings = raw ? JSON.parse(raw) : {};
            settings.themeMode = newMode;
            AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
        });
    }, []);

    const resolvedMode: 'light' | 'dark' = useMemo(() => {
        if (mode === 'system') {
            return systemScheme === 'dark' ? 'dark' : 'light';
        }
        return mode;
    }, [mode, systemScheme]);

    const colors = useMemo(() => {
        return resolvedMode === 'dark' ? darkColors : lightColors;
    }, [resolvedMode]);

    const value = useMemo<ThemeContextValue>(() => ({
        mode,
        resolvedMode,
        colors,
        setMode,
        isDark: resolvedMode === 'dark',
    }), [mode, resolvedMode, colors, setMode]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextValue => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export default ThemeContext;
