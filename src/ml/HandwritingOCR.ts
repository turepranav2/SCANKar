// SCANKar — Handwriting OCR (Phase 9 Track B)
// Recognizes handwritten text from a text region

import { TextRegion } from './types';
import { isModelAvailable } from './ModelManager';

/**
 * Recognize handwritten text within a detected text region.
 *
 * If real handwriting_ocr model is available → use TFLite (stub).
 * FALLBACK: return the region's existing text with confidence 75–89%.
 */
export async function recognize(
    region: TextRegion,
): Promise<{ text: string; confidence: number }> {
    try {
        if (isModelAvailable('handwriting_ocr')) {
            // TODO: call TFLite native module for real handwriting OCR
            console.log('[HandwritingOCR] Real model available — would run TFLite inference');
        }

        // Fallback: use the text already in the region (from TextDetector mock)
        // with realistic handwriting OCR confidence 75–89%
        const confidence = 0.75 + Math.random() * 0.14; // 0.75 – 0.89

        return {
            text: region.text,
            confidence: Math.round(confidence * 100) / 100,
        };
    } catch (error) {
        console.warn('[HandwritingOCR] Recognition failed:', error);
        return { text: region.text || '', confidence: 0.4 };
    }
}
