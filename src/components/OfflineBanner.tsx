import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { WifiOff } from 'lucide-react-native';
import { useOnline } from '@/hooks/useOnline';
import { useAppTheme } from '@/theme';

export const OfflineBanner: React.FC = () => {
  const { isOnline } = useOnline();
  const { t } = useTranslation();
  const { theme } = useAppTheme();

  if (isOnline) {
    return null;
  }

  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: theme.colors.surfaceSecondary,
          borderColor: theme.colors.surfaceBorder,
        },
      ]}
      accessibilityRole="alert"
    >
      <WifiOff size={16} color={theme.colors.textSecondary} />
      <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
        {t('common.offlineNotice')}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 16,
    marginVertical: 4,
    gap: 8,
  },
  text: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
  },
});
