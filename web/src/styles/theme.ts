import { COLOR_TOKENS_LIGHT } from '@/constants/colors';

export const theme = {
  colors: COLOR_TOKENS_LIGHT,
  spacing: { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24 },
  radius: { sm: 8, md: 12, lg: 16, pill: 999 },
  typography: {
    body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 1.6 },
    title: { fontSize: 18, fontWeight: '600' as const, lineHeight: 1.5 },
    heading: { fontSize: 22, fontWeight: '700' as const, lineHeight: 1.4 },
  },
  mode: 'light' as const,
  breakpoints: { sm: '390px', md: '768px', lg: '1024px' },
  zIndex: { header: 50, modal: 60, fab: 50 },
  transition: { fast: '120ms ease', normal: '200ms ease', slow: '320ms ease' },
};

export type AppTheme = typeof theme;
