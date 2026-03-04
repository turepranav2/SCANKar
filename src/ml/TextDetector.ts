// SCANKar — Text Detector (Phase 9 Track B)
// Detects text regions in document images (CRAFT-based)

import { Image } from 'react-native';
import { TextRegion } from './types';
import { isModelAvailable } from './ModelManager';

/**
 * Detect text regions in an image.
 *
 * If real text_detector_craft model is available → use TFLite (stub).
 * FALLBACK: return 3–5 mock TextRegion objects with realistic coordinates.
 */
export async function detectRegions(imageUri: string): Promise<TextRegion[]> {
    try {
        // If real model is available, use it
        if (isModelAvailable('text_detector_craft')) {
            // TODO: call TFLite native module for real detection
            console.log('[TextDetector] Real model available — would run CRAFT inference');
        }

        // Get image dimensions for realistic coordinates
        let imgW = 1080, imgH = 1920;
        try {
            const dims = await new Promise<{ width: number; height: number }>(
                (resolve, reject) => {
                    Image.getSize(
                        imageUri,
                        (w, h) => resolve({ width: w, height: h }),
                        (err) => reject(err),
                    );
                },
            );
            imgW = dims.width;
            imgH = dims.height;
        } catch { /* use defaults */ }

        // Mock text regions based on image dimensions
        const regions: TextRegion[] = [
            {
                x: Math.round(imgW * 0.05),
                y: Math.round(imgH * 0.03),
                width: Math.round(imgW * 0.9),
                height: Math.round(imgH * 0.08),
                text: 'INSPECTION REPORT',
                confidence: 0.96,
                language: 'english',
                isHandwritten: false,
            },
            {
                x: Math.round(imgW * 0.05),
                y: Math.round(imgH * 0.12),
                width: Math.round(imgW * 0.6),
                height: Math.round(imgH * 0.05),
                text: `Date: ${new Date().toLocaleDateString()}\nLocation: Site Alpha`,
                confidence: 0.93,
                language: 'english',
                isHandwritten: false,
            },
            {
                x: Math.round(imgW * 0.05),
                y: Math.round(imgH * 0.20),
                width: Math.round(imgW * 0.9),
                height: Math.round(imgH * 0.15),
                text: 'All units verify standard pressure tolerances are met. Warning sequence bypassed on manual override. Review pending before system restart.',
                confidence: 0.91,
                language: 'english',
                isHandwritten: false,
            },
            {
                x: Math.round(imgW * 0.05),
                y: Math.round(imgH * 0.40),
                width: Math.round(imgW * 0.45),
                height: Math.round(imgH * 0.04),
                text: 'Inspector: R. Sharma',
                confidence: 0.82,
                language: 'english',
                isHandwritten: true,
            },
            {
                x: Math.round(imgW * 0.55),
                y: Math.round(imgH * 0.40),
                width: Math.round(imgW * 0.4),
                height: Math.round(imgH * 0.04),
                text: 'Approved ✓',
                confidence: 0.78,
                language: 'english',
                isHandwritten: true,
            },
        ];

        console.log(`[TextDetector] Detected ${regions.length} text regions (mock fallback)`);
        return regions;
    } catch (error) {
        console.warn('[TextDetector] Detection failed, returning empty regions:', error);
        return [];
    }
}
