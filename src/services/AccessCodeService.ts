// SCANKar — Access Code Validation Service
// Simple offline string match — codes are reusable infinite times

import { ACCESS_CODES } from '../constants/codes';

/**
 * Validates an access code against the hardcoded list.
 * Normalizes input: trims whitespace, converts to uppercase.
 * No hashing, no device binding — simple string match.
 */
export function validateAccessCode(input: string): { valid: boolean; error?: string } {
    if (!input || input.trim().length === 0) {
        return { valid: false, error: 'Please enter an activation code.' };
    }

    const normalized = input.trim().toUpperCase();
    const isValid = ACCESS_CODES.includes(normalized);

    if (isValid) {
        return { valid: true };
    }

    return {
        valid: false,
        error: 'Invalid code. Please try again or contact your supervisor.',
    };
}
