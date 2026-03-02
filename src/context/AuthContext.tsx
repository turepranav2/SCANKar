// SCANKar — Auth Context Provider

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/config';
import { validateAccessCode } from '../services/AccessCodeService';

interface AuthContextValue {
    isUnlocked: boolean;
    isLoading: boolean;
    onboardingComplete: boolean;
    unlock: (code: string) => { valid: boolean; error?: string };
    completeOnboarding: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [onboardingComplete, setOnboardingComplete] = useState(false);

    // Check stored auth state on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const unlockRaw = await AsyncStorage.getItem(STORAGE_KEYS.UNLOCK_STATE);
                if (unlockRaw) {
                    const state = JSON.parse(unlockRaw);
                    setIsUnlocked(state.isUnlocked === true);
                }

                const onboardingRaw = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
                if (onboardingRaw === 'true') {
                    setOnboardingComplete(true);
                }
            } catch {
                // If reading fails, stay locked
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    const unlock = useCallback((code: string): { valid: boolean; error?: string } => {
        const result = validateAccessCode(code);
        if (result.valid) {
            setIsUnlocked(true);
            AsyncStorage.setItem(
                STORAGE_KEYS.UNLOCK_STATE,
                JSON.stringify({ isUnlocked: true, activatedAt: new Date().toISOString() })
            );
        }
        return result;
    }, []);

    const completeOnboarding = useCallback(async () => {
        setOnboardingComplete(true);
        await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true');
    }, []);

    const value = useMemo<AuthContextValue>(() => ({
        isUnlocked,
        isLoading,
        onboardingComplete,
        unlock,
        completeOnboarding,
    }), [isUnlocked, isLoading, onboardingComplete, unlock, completeOnboarding]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextValue => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
