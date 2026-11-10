import { spacing, radii, typography } from './tokens';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceSecondary: string;
  surfaceBorder: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryPressed: string;
  primaryContent: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  error: string;
  errorLight: string;
  tint: string;
  tabIconDefault: string;
  tabIconSelected: string;
  badgeScheduledBg: string;
  badgeScheduledText: string;
  badgeLiveBg: string;
  badgeLiveText: string;
  badgeStaleBg: string;
  badgeStaleText: string;
}

export interface AppTheme {
  colors: ThemeColors;
  spacing: typeof spacing;
  radii: typeof radii;
  typography: typeof typography;
}

export const lightTheme: AppTheme = {
  colors: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceSecondary: '#F1F5F9',
    surfaceBorder: '#E2E8F0',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    primary: '#0284C7',
    primaryPressed: '#0369A1',
    primaryContent: '#FFFFFF',
    success: '#16A34A',
    successLight: '#DCFCE7',
    warning: '#D97706',
    warningLight: '#FEF3C7',
    error: '#DC2626',
    errorLight: '#FEE2E2',
    tint: '#0284C7',
    tabIconDefault: '#94A3B8',
    tabIconSelected: '#0284C7',
    badgeScheduledBg: '#E2E8F0',
    badgeScheduledText: '#475569',
    badgeLiveBg: '#DCFCE7',
    badgeLiveText: '#15803D',
    badgeStaleBg: '#FEF3C7',
    badgeStaleText: '#B45309',
  },
  spacing,
  radii,
  typography,
};

export const darkTheme: AppTheme = {
  colors: {
    background: '#0B0F17',
    surface: '#151D2A',
    surfaceSecondary: '#1E293B',
    surfaceBorder: '#334155',
    textPrimary: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textMuted: '#64748B',
    primary: '#38BDF8',
    primaryPressed: '#0284C7',
    primaryContent: '#0F172A',
    success: '#22C55E',
    successLight: '#14532D',
    warning: '#FBBF24',
    warningLight: '#78350F',
    error: '#EF4444',
    errorLight: '#7F1D1D',
    tint: '#38BDF8',
    tabIconDefault: '#64748B',
    tabIconSelected: '#38BDF8',
    badgeScheduledBg: '#1E293B',
    badgeScheduledText: '#94A3B8',
    badgeLiveBg: '#14532D',
    badgeLiveText: '#4ADE80',
    badgeStaleBg: '#78350F',
    badgeStaleText: '#FCD34D',
  },
  spacing,
  radii,
  typography,
};
