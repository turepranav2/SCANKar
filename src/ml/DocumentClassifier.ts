// SCANKar — Document Classifier (Phase 9 Track B)
// Classifies document type: table, paragraph, form, or mixed

import { Image } from 'react-native';
import { isModelAvailable } from './ModelManager';

export type DocClass = 'table' | 'paragraph' | 'form' | 'mixed';

/**
 * Classify a document image into one of four types.
 *
 * Strategy:
 *   1. If real document_classifier TFLite model is available → use it (stub)
 *   2. If a hint was provided by the user (e.g. from DocTypeChips) → use hint
 *   3. FALLBACK: use Image.getSize() aspect ratio heuristic
 *      - width > height → 'paragraph' (landscape = letters/reports)
 *      - height > width → 'table' (portrait = spreadsheets/invoices)
 *      - equal → 'table'
 */
export async function classify(
    imageUri: string,
    hint?: string,
): Promise<DocClass> {
    try {
        // If real TFLite model is available, use it
        if (isModelAvailable('document_classifier')) {
            // TODO: call TFLite native module for real classification
            console.log('[DocumentClassifier] Real model available — would run TFLite inference');
            // For now, fall through to heuristic
        }

        // If user provided a valid hint, use it
        if (hint && hint !== 'auto' && ['table', 'paragraph', 'form', 'mixed'].includes(hint)) {
            console.log(`[DocumentClassifier] Using user hint: ${hint}`);
            return hint as DocClass;
        }

        // Fallback: aspect-ratio heuristic
        const { width, height } = await new Promise<{ width: number; height: number }>(
            (resolve, reject) => {
                Image.getSize(
                    imageUri,
                    (w, h) => resolve({ width: w, height: h }),
                    (err) => reject(err),
                );
            },
        );

        const docType: DocClass = width > height ? 'paragraph' : 'table';
        console.log(`[DocumentClassifier] Heuristic: ${width}×${height} → ${docType}`);
        return docType;
    } catch (error) {
        console.warn('[DocumentClassifier] Classification failed, defaulting to table:', error);
        return 'table';
    }
}
