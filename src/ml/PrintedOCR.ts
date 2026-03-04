// SCANKar — Printed OCR (Phase 9 Track B)
// Recognizes printed/typed text from a text region

import { TextRegion } from './types';
import { isModelAvailable } from './ModelManager';

/**
 * Recognize printed text within a detected text region.
 *
 * If real printed_ocr model is available → use TFLite (stub).
 * FALLBACK: return the region's existing text with confidence 88–97%.
 */
export async function recognize(
    region: TextRegion,
): Promise<{ text: string; confidence: number }> {
    try {
        if (isModelAvailable('printed_ocr')) {
            // TODO: call TFLite native module for real OCR
            console.log('[PrintedOCR] Real model available — would run TFLite inference');
        }

        // Fallback: use the text already in the region (from TextDetector mock)
        // with realistic printed OCR confidence 88–97%
        const confidence = 0.88 + Math.random() * 0.09; // 0.88 – 0.97

        return {
            text: region.text,
            confidence: Math.round(confidence * 100) / 100,
        };
    } catch (error) {
        console.warn('[PrintedOCR] Recognition failed:', error);
        return { text: region.text || '', confidence: 0.5 };
    }
}
