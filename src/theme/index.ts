import { useColorScheme } from 'react-native';
import { useSettingsStore } from '@/stores/settingsStore';
import { darkTheme, lightTheme, type AppTheme } from './themes';

/**
 * Hook providing active theme colors and layout tokens, respecting user selection
 * ('system' | 'light' | 'dark').
 */
export function useAppTheme(): {
  theme: AppTheme;
  isDark: boolean;
} {
  const themeMode = useSettingsStore((s) => s.theme);
  const systemColorScheme = useColorScheme();

  const isDark =
    themeMode === 'dark' || (themeMode === 'system' && systemColorScheme === 'dark');

  return {
    theme: isDark ? darkTheme : lightTheme,
    isDark,
  };
}

export { darkTheme, lightTheme, type AppTheme };
