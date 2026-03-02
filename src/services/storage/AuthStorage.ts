// SCANKar — Auth Storage Service

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../constants/config';

export interface StoredUnlockState {
    isUnlocked: boolean;
    activatedAt: string;
}

export async function getUnlockState(): Promise<StoredUnlockState | null> {
    try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.UNLOCK_STATE);
        if (raw) {
            return JSON.parse(raw);
        }
    } catch { }
    return null;
}

export async function setUnlockState(state: StoredUnlockState): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.UNLOCK_STATE, JSON.stringify(state));
}

export async function isOnboardingComplete(): Promise<boolean> {
    try {
        const val = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
        return val === 'true';
    } catch {
        return false;
    }
}

export async function markOnboardingComplete(): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true');
}

export async function clearAuthData(): Promise<void> {
    await AsyncStorage.multiRemove([
        STORAGE_KEYS.UNLOCK_STATE,
        STORAGE_KEYS.ONBOARDING_COMPLETE,
    ]);
}
