import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AlertCircle } from 'lucide-react-native';
import type { AgencyFeedStatus } from '@/api/schemas/realtime';
import { useAppTheme } from '@/theme';

export interface FeedStatusBannerProps {
  degradedAgencies: AgencyFeedStatus[];
}

export const FeedStatusBanner: React.FC<FeedStatusBannerProps> = ({ degradedAgencies }) => {
  const { t } = useTranslation();
  const { theme } = useAppTheme();

  if (!degradedAgencies.length) {
    return null;
  }

  const agencyNames = degradedAgencies.map((a) => a.agencyCode.toUpperCase()).join(', ');

  return (
    <View
      testID="feed-status-banner"
      accessible={true}
      style={[
        styles.banner,
        {
          backgroundColor: theme.colors.warningLight,
          borderColor: theme.colors.warning,
        },
      ]}
      accessibilityRole="alert"
      role="alert"
    >
      <AlertCircle size={16} color={theme.colors.warning} />
      <Text style={[styles.text, { color: theme.colors.textPrimary }]}>
        {t('nearby.agencyDegraded', { agency: agencyNames })}
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
    marginVertical: 6,
    gap: 8,
  },
  text: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
});
