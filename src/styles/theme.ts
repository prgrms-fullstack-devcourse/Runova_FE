import { COLOR_TOKENS } from '@/constants/colors';

export const theme = {
  colors: COLOR_TOKENS,
  spacing: { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24 },
  radius: { sm: 8, md: 12, lg: 16, pill: 999 },
  typography: {
    body: { fontSize: 16, fontWeight: '400' as const },
    title: { fontSize: 18, fontWeight: '600' as const },
    heading: { fontSize: 22, fontWeight: '700' as const },
  },
};

export type AppTheme = typeof theme;
