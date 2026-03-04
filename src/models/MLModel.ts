// SCANKar — ML Model Types

export interface MLModelInfo {
    id: string;
    name: string;
    purpose: string;
    sizeBytes: number;
    inputShape: number[];
    outputShape: number[];
    quantized: boolean;
    assetPath: string;
}

export type ModelStatusValue = 'loaded' | 'loading' | 'error' | 'unloaded' | 'idle';

export interface ModelStatus {
    modelId: string;
    status: ModelStatusValue;
    loadTimeMs?: number;
    lastUsed?: string;
    errorMessage?: string;
}
