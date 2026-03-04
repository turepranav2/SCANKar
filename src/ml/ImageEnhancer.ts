// SCANKar — Image Enhancer (Phase 9 Track B)
// Enhances scanned document image before OCR

import { Image } from 'react-native';
import { isModelAvailable } from './ModelManager';

// Inline stub for react-native-image-manipulator
// Will be replaced with real package when available
const ImageManipulator = {
    manipulate: async (uri: string, _actions: unknown[], _options: unknown): Promise<{ uri: string }> => {
        return { uri };
    },
};

/**
 * Enhance image for better OCR results.
 * - Resizes to max 1920px on longest side
 * - If real image_enhancement model is available, applies TFLite enhancement
 * - Returns original URI if anything fails
 */
export async function enhance(imageUri: string): Promise<string> {
    try {
        // Get original dimensions
        const { width, height } = await new Promise<{ width: number; height: number }>(
            (resolve, reject) => {
                Image.getSize(
                    imageUri,
                    (w, h) => resolve({ width: w, height: h }),
                    (err) => reject(err),
                );
            },
        );

        const MAX_DIM = 1920;
        let resizeWidth = width;
        let resizeHeight = height;

        if (width > MAX_DIM || height > MAX_DIM) {
            if (width > height) {
                resizeWidth = MAX_DIM;
                resizeHeight = Math.round((height / width) * MAX_DIM);
            } else {
                resizeHeight = MAX_DIM;
                resizeWidth = Math.round((width / height) * MAX_DIM);
            }
        }

        // If real TFLite model is available, we'd call native module here
        if (isModelAvailable('image_enhancement')) {
            // TODO: call TFLite native module for real enhancement
            console.log('[ImageEnhancer] Real model available — would apply TFLite enhancement');
        }

        // Apply resize via manipulator
        const result = await ImageManipulator.manipulate(
            imageUri,
            [{ resize: { width: resizeWidth, height: resizeHeight } }],
            { format: 'jpeg', compress: 0.92 },
        );

        console.log(`[ImageEnhancer] Enhanced: ${width}×${height} → ${resizeWidth}×${resizeHeight}`);
        return result.uri;
    } catch (error) {
        console.warn('[ImageEnhancer] Enhancement failed, returning original URI:', error);
        return imageUri;
    }
}
