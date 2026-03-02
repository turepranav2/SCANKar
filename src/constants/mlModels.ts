// SCANKar — ML Model Metadata

import { MLModelInfo } from '../models/MLModel';

export const ML_MODELS: MLModelInfo[] = [
    {
        id: 'image_enhancement',
        name: 'Image Enhancement',
        purpose: 'Improves image quality',
        sizeBytes: 10 * 1024 * 1024, // ~10 MB
        inputShape: [1, 640, 640, 3],
        outputShape: [1, 640, 640, 3],
        quantized: true,
        assetPath: 'models/image_enhancement.tflite',
    },
    {
        id: 'layout_analysis',
        name: 'Layout Analysis',
        purpose: 'Detects document regions',
        sizeBytes: 20 * 1024 * 1024, // ~20 MB
        inputShape: [1, 640, 640, 3],
        outputShape: [1, 100, 6],
        quantized: true,
        assetPath: 'models/layout_analysis.tflite',
    },
    {
        id: 'table_structure',
        name: 'Table Structure',
        purpose: 'Finds rows and columns',
        sizeBytes: 15 * 1024 * 1024, // ~15 MB
        inputShape: [1, 640, 640, 3],
        outputShape: [1, 200, 5],
        quantized: true,
        assetPath: 'models/table_structure.tflite',
    },
    {
        id: 'text_detection',
        name: 'Text Detection (CRAFT)',
        purpose: 'Locates text regions',
        sizeBytes: 25 * 1024 * 1024, // ~25 MB
        inputShape: [1, 640, 640, 3],
        outputShape: [1, 640, 640, 2],
        quantized: true,
        assetPath: 'models/text_detection.tflite',
    },
    {
        id: 'printed_ocr',
        name: 'Printed OCR',
        purpose: 'Reads printed text',
        sizeBytes: 20 * 1024 * 1024, // ~20 MB
        inputShape: [1, 48, 320, 3],
        outputShape: [1, 80, 97],
        quantized: false,
        assetPath: 'models/printed_ocr.tflite',
    },
    {
        id: 'handwriting_ocr',
        name: 'Handwriting OCR',
        purpose: 'Reads handwritten text',
        sizeBytes: 35 * 1024 * 1024, // ~35 MB
        inputShape: [1, 384, 384, 3],
        outputShape: [1, 128, 97],
        quantized: false,
        assetPath: 'models/handwriting_ocr.tflite',
    },
    {
        id: 'language_detection',
        name: 'Language Detection',
        purpose: 'Identifies script type',
        sizeBytes: 5 * 1024 * 1024, // ~5 MB
        inputShape: [1, 64, 64, 3],
        outputShape: [1, 3],
        quantized: true,
        assetPath: 'models/language_detection.tflite',
    },
];
