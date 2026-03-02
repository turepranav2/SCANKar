// SCANKar Design System — Color Tokens
// Source: 06_Stitch_UI_Prompt.md

export interface ColorTokens {
  bg: string;
  surface: string;
  primary: string;
  primaryHover: string;
  primarySubtle: string;
  text1: string;
  text2: string;
  border: string;
  inputBg: string;
  success: string;
  successBg: string;
  warning: string;
  warningBg: string;
  error: string;
  errorBg: string;
}

export const lightColors: ColorTokens = {
  bg: '#F8FAFF',
  surface: '#FFFFFF',
  primary: '#2563EB',
  primaryHover: '#1D4ED8',
  primarySubtle: '#EFF6FF',
  text1: '#0F172A',
  text2: '#475569',
  border: '#BFDBFE',
  inputBg: '#EFF6FF',
  success: '#22C55E',
  successBg: '#DCFCE7',
  warning: '#F59E0B',
  warningBg: '#FEF9C3',
  error: '#EF4444',
  errorBg: '#FEE2E2',
};

export const darkColors: ColorTokens = {
  bg: '#0F172A',
  surface: '#1E293B',
  primary: '#3B82F6',
  primaryHover: '#60A5FA',
  primarySubtle: '#1E3A5F',
  text1: '#F1F5F9',
  text2: '#94A3B8',
  border: '#1E40AF',
  inputBg: '#1E3A5F',
  success: '#4ADE80',
  successBg: '#14532D',
  warning: '#FCD34D',
  warningBg: '#451A03',
  error: '#F87171',
  errorBg: '#450A0A',
};

// Gradient colors (used regardless of theme)
export const gradients = {
  heroLight: ['#1D4ED8', '#2563EB'],
  heroDark: ['#1E3A5F', '#2563EB'],
  lockScreen: ['#1D4ED8', '#2563EB'],
};
