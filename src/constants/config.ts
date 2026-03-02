// SCANKar — App Configuration

export const APP_CONFIG = {
    name: 'SCANKar',
    displayName: 'SCANकर',
    version: '1.0.0',
    supportEmail: 'support@endurance.com',
} as const;

export const STORAGE_KEYS = {
    UNLOCK_STATE: '@scankar_unlock_state',
    SETTINGS: '@scankar_settings',
    ONBOARDING_COMPLETE: '@scankar_onboarding_complete',
    SCAN_INDEX: 'scan_index',
} as const;

export const CONFIDENCE_THRESHOLDS = {
    HIGH: 0.9,
    MEDIUM: 0.7,
} as const;

export const PROCESSING_PHASES = [
    'Enhancing Image',
    'Detecting Document Type',
    'Extracting Structure',
    'Reading Text',
    'Validating Data',
] as const;

export const EXPORT_FORMATS = [
    { id: 'xlsx', name: 'Excel', extension: '.xlsx', icon: '📊' },
    { id: 'pdf', name: 'PDF', extension: '.pdf', icon: '📄' },
    { id: 'docx', name: 'Word', extension: '.docx', icon: '📝' },
    { id: 'csv', name: 'CSV', extension: '.csv', icon: '📋' },
    { id: 'json', name: 'JSON', extension: '.json', icon: '{}' },
] as const;
