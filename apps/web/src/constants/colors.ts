export const GRAY = {
  0: '#FFFFFF',
  50: '#F8FAFC',
  100: '#F1F5F9',
  200: '#E2E8F0',
  300: '#CBD5E1',
  400: '#94A3B8',
  500: '#64748B',
  600: '#475569',
  700: '#334155',
  800: '#1F2937',
  900: '#0F172A',
  950: '#0B1220',
} as const;

export const BRAND = {
  primary: GRAY[900],
  primaryHover: GRAY[800],
  secondary: `#2A1D74`,
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
} as const;

export const COLOR_TOKENS_LIGHT = {
  bg: GRAY[50],
  surface: GRAY[0],
  surfaceAlt: GRAY[100],
  text: GRAY[900],
  subtext: GRAY[400],
  border: GRAY[200],

  primary: BRAND.primary,
  primaryHover: BRAND.primaryHover,
  secondary: BRAND.secondary,
  success: BRAND.success,
  warning: BRAND.warning,
  danger: BRAND.danger,
} as const;
