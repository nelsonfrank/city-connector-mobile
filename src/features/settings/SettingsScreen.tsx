import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { queryClient } from '@/lib/queryClient';
import { queryCacheStorage } from '@/lib/storage';
import { useSettingsStore, type AppLanguage, type AppThemeMode } from '@/stores/settingsStore';
import { useAppTheme } from '@/theme';

export const SettingsScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { theme } = useAppTheme();

  const {
    theme: currentTheme,
    language: currentLang,
    realtimeRefreshIntervalMs,
    setTheme,
    setLanguage,
    setRealtimeRefreshIntervalMs,
  } = useSettingsStore();

  const [cacheClearedMessage, setCacheClearedMessage] = useState<string | null>(null);

  const handleLanguageChange = (lang: AppLanguage) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  const handleClearCache = async () => {
    queryClient.clear();
    queryCacheStorage.clearAll();
    setCacheClearedMessage(t('settings.cacheCleared'));
    setTimeout(() => setCacheClearedMessage(null), 3000);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Theme Selection */}
      <View
        style={[
          styles.section,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.surfaceBorder },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
          {t('settings.theme')}
        </Text>
        <View style={styles.optionRow}>
          {(['system', 'light', 'dark'] as AppThemeMode[]).map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[
                styles.optionBtn,
                {
                  backgroundColor:
                    currentTheme === mode ? theme.colors.primary : theme.colors.surfaceSecondary,
                  borderColor:
                    currentTheme === mode ? theme.colors.primary : theme.colors.surfaceBorder,
                },
              ]}
              onPress={() => setTheme(mode)}
              accessibilityRole="button"
              accessibilityLabel={`Theme mode ${mode}`}
            >
              <Text
                style={[
                  styles.optionText,
                  {
                    color:
                      currentTheme === mode
                        ? theme.colors.primaryContent
                        : theme.colors.textSecondary,
                  },
                ]}
              >
                {mode === 'system'
                  ? t('settings.themeSystem')
                  : mode === 'light'
                    ? t('settings.themeLight')
                    : t('settings.themeDark')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Language Selection */}
      <View
        style={[
          styles.section,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.surfaceBorder },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
          {t('settings.language')}
        </Text>
        <View style={styles.optionRow}>
          <TouchableOpacity
            style={[
              styles.optionBtn,
              {
                backgroundColor:
                  currentLang === 'en' ? theme.colors.primary : theme.colors.surfaceSecondary,
                borderColor:
                  currentLang === 'en' ? theme.colors.primary : theme.colors.surfaceBorder,
              },
            ]}
            onPress={() => handleLanguageChange('en')}
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.optionText,
                {
                  color:
                    currentLang === 'en' ? theme.colors.primaryContent : theme.colors.textSecondary,
                },
              ]}
            >
              {t('settings.languageEn')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionBtn,
              {
                backgroundColor:
                  currentLang === 'sw' ? theme.colors.primary : theme.colors.surfaceSecondary,
                borderColor:
                  currentLang === 'sw' ? theme.colors.primary : theme.colors.surfaceBorder,
              },
            ]}
            onPress={() => handleLanguageChange('sw')}
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.optionText,
                {
                  color:
                    currentLang === 'sw' ? theme.colors.primaryContent : theme.colors.textSecondary,
                },
              ]}
            >
              {t('settings.languageSw')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Realtime Polling Rate */}
      <View
        style={[
          styles.section,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.surfaceBorder },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
          {t('settings.refreshInterval')}
        </Text>
        <View style={styles.optionRow}>
          {[15000, 20000, 30000].map((interval) => (
            <TouchableOpacity
              key={interval}
              style={[
                styles.optionBtn,
                {
                  backgroundColor:
                    realtimeRefreshIntervalMs === interval
                      ? theme.colors.primary
                      : theme.colors.surfaceSecondary,
                  borderColor:
                    realtimeRefreshIntervalMs === interval
                      ? theme.colors.primary
                      : theme.colors.surfaceBorder,
                },
              ]}
              onPress={() => setRealtimeRefreshIntervalMs(interval)}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.optionText,
                  {
                    color:
                      realtimeRefreshIntervalMs === interval
                        ? theme.colors.primaryContent
                        : theme.colors.textSecondary,
                  },
                ]}
              >
                {t('settings.secondsUnit', { seconds: interval / 1000 })}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Offline Cache Maintenance */}
      <View
        style={[
          styles.section,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.surfaceBorder },
        ]}
      >
        <TouchableOpacity
          style={[styles.actionBtn, { borderColor: theme.colors.error }]}
          onPress={handleClearCache}
          accessibilityRole="button"
        >
          <Text style={[styles.actionBtnText, { color: theme.colors.error }]}>
            {t('settings.clearCache')}
          </Text>
        </TouchableOpacity>
        {cacheClearedMessage && (
          <Text style={[styles.feedbackText, { color: theme.colors.success }]}>
            {cacheClearedMessage}
          </Text>
        )}
      </View>

      {/* App Version Info */}
      <View style={styles.versionContainer}>
        <Text style={[styles.versionText, { color: theme.colors.textMuted }]}>
          {t('settings.version', { version: '1.0.0 (Expo SDK 58)' })}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  optionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionBtn: {
    minHeight: 44, // Accessible touch target
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  actionBtn: {
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1.5,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  feedbackText: {
    fontSize: 13,
    textAlign: 'center',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  versionText: {
    fontSize: 12,
  },
});
