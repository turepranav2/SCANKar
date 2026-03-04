// SCANKar — Model Manager (Phase 9 Track B)
// Registry of all 7 TFLite models + status helpers

import { Platform } from 'react-native';
import { ModelName, ModelStatus } from './types';

interface ModelRegistryEntry {
    name: ModelName;
    filename: string;
    sizeMB: number;
    purpose: string;
}

/**
 * Registry of all 7 TFLite models the app uses.
 * When real .tflite files are dropped into android/app/src/main/assets/models/,
 * the app detects and loads them automatically.
 */
export const MODEL_REGISTRY: ModelRegistryEntry[] = [
    { name: 'image_enhancement', filename: 'image_enhancement.tflite', sizeMB: 10, purpose: 'Improves image quality (contrast, sharpness)' },
    { name: 'document_classifier', filename: 'document_classifier.tflite', sizeMB: 8, purpose: 'Classifies document as table/paragraph/form/mixed' },
    { name: 'table_detector', filename: 'table_detector.tflite', sizeMB: 15, purpose: 'Detects table structure (rows, columns, cells)' },
    { name: 'text_detector_craft', filename: 'text_detector_craft.tflite', sizeMB: 25, purpose: 'Locates text regions using CRAFT architecture' },
    { name: 'printed_ocr', filename: 'printed_ocr.tflite', sizeMB: 20, purpose: 'Recognizes printed/typed text' },
    { name: 'handwriting_ocr', filename: 'handwriting_ocr.tflite', sizeMB: 35, purpose: 'Recognizes handwritten text' },
    { name: 'language_detector', filename: 'language_detector.tflite', sizeMB: 5, purpose: 'Identifies script language (English/Hindi/mixed)' },
];

/**
 * Check availability of each model and return status array.
 * Since TFLite files aren't bundled yet, all models report 'missing'.
 * When real models are placed in the assets folder, this function
 * will detect them via NativeModules or file existence checks.
 */
export function getModelStatus(): ModelStatus[] {
    return MODEL_REGISTRY.map((entry) => {
        // In a real implementation, we'd check via NativeModules whether
        // the .tflite file exists in android/app/src/main/assets/models/
        // For now, all models report as 'missing' since no .tflite files are bundled.
        const status: ModelStatus['status'] = 'missing';

        return {
            name: entry.name,
            filename: entry.filename,
            sizeMB: entry.sizeMB,
            purpose: entry.purpose,
            status,
        };
    });
}

/**
 * Check if a specific model is available (loaded).
 */
export function isModelAvailable(name: ModelName): boolean {
    const statuses = getModelStatus();
    const model = statuses.find((m) => m.name === name);
    return model?.status === 'loaded';
}

/**
 * Log all 7 model statuses to console for debugging.
 */
export function logModelStatus(): void {
    const statuses = getModelStatus();
    console.log('═══════════════════════════════════════');
    console.log('  SCANKar ML Model Status');
    console.log('═══════════════════════════════════════');
    statuses.forEach((m) => {
        const icon = m.status === 'loaded' ? '✅' : m.status === 'missing' ? '⚠️' : m.status === 'error' ? '❌' : '⏳';
        console.log(`  ${icon} ${m.name.padEnd(22)} ${m.status.padEnd(8)} (${m.sizeMB} MB) — ${m.purpose}`);
    });
    const loaded = statuses.filter((m) => m.status === 'loaded').length;
    console.log(`\n  ${loaded}/${statuses.length} models loaded`);
    if (loaded < statuses.length) {
        console.log('  ⚡ Using smart mock fallback for missing models');
    }
    console.log('═══════════════════════════════════════');
}
