// SCANKar — Confidence Level Utilities

import { ColorTokens } from '../theme';
import { CONFIDENCE_THRESHOLDS } from '../constants/config';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export function getConfidenceLevel(confidence: number): ConfidenceLevel {
    if (confidence >= CONFIDENCE_THRESHOLDS.HIGH) return 'high';
    if (confidence >= CONFIDENCE_THRESHOLDS.MEDIUM) return 'medium';
    return 'low';
}

export function getConfidenceColor(confidence: number, colors: ColorTokens): string {
    const level = getConfidenceLevel(confidence);
    switch (level) {
        case 'high': return colors.success;
        case 'medium': return colors.warning;
        case 'low': return colors.error;
    }
}

export function getConfidenceBgColor(confidence: number, colors: ColorTokens): string {
    const level = getConfidenceLevel(confidence);
    switch (level) {
        case 'high': return colors.successBg;
        case 'medium': return colors.warningBg;
        case 'low': return colors.errorBg;
    }
}

export function getConfidenceLabel(confidence: number): string {
    const level = getConfidenceLevel(confidence);
    switch (level) {
        case 'high': return 'High';
        case 'medium': return 'Medium';
        case 'low': return 'Low';
    }
}

export function formatConfidence(confidence: number): string {
    return `${Math.round(confidence * 100)}%`;
}
