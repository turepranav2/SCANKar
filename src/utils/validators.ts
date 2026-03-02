// SCANKar — Input Validation Utilities

/**
 * Normalize an access code input: trim whitespace, convert to uppercase.
 */
export function normalizeCode(input: string): string {
    return input.trim().toUpperCase();
}

/**
 * Validate that a string is non-empty after trimming.
 */
export function isNonEmpty(value: string): boolean {
    return value.trim().length > 0;
}

/**
 * Clamp a number to a range.
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

/**
 * Validate confidence value is between 0 and 1.
 */
export function isValidConfidence(value: number): boolean {
    return typeof value === 'number' && value >= 0 && value <= 1;
}
