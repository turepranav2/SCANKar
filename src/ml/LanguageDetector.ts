// SCANKar — Language Detector (Phase 9 Track B)
// Detects language/script of a text region

import { TextRegion } from './types';
import { isModelAvailable } from './ModelManager';

export type DetectedLanguage = 'english' | 'hindi' | 'mixed';

/**
 * Detect the language of a text region.
 *
 * If real language_detector model is available → use TFLite (stub).
 * FALLBACK: return 'english'.
 */
export async function detect(
    region: TextRegion,
): Promise<DetectedLanguage> {
    try {
        if (isModelAvailable('language_detector')) {
            // TODO: call TFLite native module for real language detection
            console.log('[LanguageDetector] Real model available — would run TFLite inference');
        }

        // Fallback: default to 'english'
        // A real implementation would analyze glyph patterns in the region
        console.log(`[LanguageDetector] Detected 'english' for region at (${region.x},${region.y}) (mock fallback)`);
        return 'english';
    } catch (error) {
        console.warn('[LanguageDetector] Detection failed, defaulting to english:', error);
        return 'english';
    }
}
