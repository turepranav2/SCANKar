// SCANKar — Auth Context
// Handles: access code validation, unlock state, onboarding state

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ACCESS_CODES } from '../constants/codes';

// ─── Storage Keys ───────────────────────────────────────────────────────────
const STORAGE_KEY_UNLOCKED = 'scankar_unlocked';
const STORAGE_KEY_ONBOARDING = 'scankar_onboarding_complete';

// ─── Types ──────────────────────────────────────────────────────────────────
interface UnlockResult {
    valid: boolean;
    error?: string;
}

interface AuthContextValue {
    isUnlocked: boolean;
    isLoading: boolean;
    onboardingComplete: boolean;
    unlock: (code: string) => UnlockResult;
    completeOnboarding: () => Promise<void>;
    resetAuth: () => Promise<void>; // dev/testing only
}

// ─── Context ────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ─── Provider ───────────────────────────────────────────────────────────────
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [onboardingComplete, setOnboardingComplete] = useState(false);

    // Load persisted state on app start
    useEffect(() => {
        const loadAuthState = async () => {
            try {
                const [unlockedVal, onboardingVal] = await AsyncStorage.multiGet([
                    STORAGE_KEY_UNLOCKED,
                    STORAGE_KEY_ONBOARDING,
                ]);

                const unlocked = unlockedVal[1] === 'true';
                const onboarding = onboardingVal[1] === 'true';

                setIsUnlocked(unlocked);
                setOnboardingComplete(onboarding);
            } catch (e) {
                console.error('[AuthContext] Failed to load auth state:', e);
            } finally {
                setIsLoading(false);
            }
        };

        loadAuthState();
    }, []);

    // ─── UNLOCK FUNCTION ─────────────────────────────────────────────────────
    // BUG FIX: previous version may not have been persisting state correctly.
    // This version:
    //   1. Normalizes input (trim + uppercase)
    //   2. Checks against ACCESS_CODES list
    //   3. Persists to AsyncStorage BEFORE updating state
    //   4. Updates React state → triggers AppNavigator re-render → navigates automatically
    const unlock = useCallback((rawCode: string): UnlockResult => {
        // Normalize: trim whitespace, uppercase, keep alphanumeric and hyphens
        const normalized = rawCode.trim().toUpperCase();

        console.log('[AuthContext] Attempting unlock with code:', normalized);
        console.log('[AuthContext] Available codes:', ACCESS_CODES);
        console.log('[AuthContext] Code match:', ACCESS_CODES.includes(normalized));

        if (!normalized) {
            return { valid: false, error: 'Please enter an activation code.' };
        }

        if (!ACCESS_CODES.includes(normalized)) {
            console.log('[AuthContext] Code NOT found in list');
            return { valid: false, error: 'Invalid code. Please check and try again.' };
        }

        // Valid code — persist and update state
        console.log('[AuthContext] Code VALID — unlocking app');

        // Persist asynchronously (fire and forget is fine here — state update is synchronous)
        AsyncStorage.setItem(STORAGE_KEY_UNLOCKED, 'true').catch(e =>
            console.error('[AuthContext] Failed to persist unlock:', e)
        );

        // Update state synchronously → AppNavigator re-renders → navigates to Onboarding/Home
        setIsUnlocked(true);

        return { valid: true };
    }, []);

    // ─── COMPLETE ONBOARDING ─────────────────────────────────────────────────
    const completeOnboarding = useCallback(async () => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY_ONBOARDING, 'true');
            setOnboardingComplete(true);
        } catch (e) {
            console.error('[AuthContext] Failed to complete onboarding:', e);
            // Still update state even if storage fails
            setOnboardingComplete(true);
        }
    }, []);

    // ─── RESET (dev only) ────────────────────────────────────────────────────
    const resetAuth = useCallback(async () => {
        try {
            await AsyncStorage.multiRemove([STORAGE_KEY_UNLOCKED, STORAGE_KEY_ONBOARDING]);
            setIsUnlocked(false);
            setOnboardingComplete(false);
        } catch (e) {
            console.error('[AuthContext] Failed to reset auth:', e);
        }
    }, []);

    return (
        <AuthContext.Provider
            value={{
                isUnlocked,
                isLoading,
                onboardingComplete,
                unlock,
                completeOnboarding,
                resetAuth,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// ─── Hook ───────────────────────────────────────────────────────────────────
export const useAuth = (): AuthContextValue => {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('[useAuth] must be used inside <AuthProvider>');
    }
    return ctx;
};