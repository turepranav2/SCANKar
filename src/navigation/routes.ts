// SCANKar — Route Name Constants (TDD §6.1)

export const ROUTES = {
    // Auth Stack
    ACCESS_CODE: 'AccessCode',
    ONBOARDING: 'Onboarding',

    // Main Tab Navigator
    HOME_TAB: 'HomeTab',
    HISTORY_TAB: 'HistoryTab',
    SETTINGS_TAB: 'SettingsTab',

    // Home Stack screens
    HOME: 'Home',
    CAMERA: 'Camera',
    PREVIEW_CROP: 'PreviewCrop',
    PROCESSING: 'Processing',
    TABLE_REVIEW: 'TableReview',
    PARAGRAPH_REVIEW: 'ParagraphReview',
    TABLE_EDITOR: 'TableEditor',
    TEXT_EDITOR: 'TextEditor',
    EXPORT: 'Export',

    // History Stack screens
    HISTORY: 'History',

    // Settings Stack screens
    SETTINGS: 'Settings',
    MODEL_STATUS: 'ModelStatus',
} as const;

export type RouteName = (typeof ROUTES)[keyof typeof ROUTES];
