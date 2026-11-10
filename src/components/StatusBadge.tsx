import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Clock, Radio, AlertTriangle } from 'lucide-react-native';
import { useAppTheme } from '@/theme';

export type StatusBadgeVariant = 'live' | 'scheduled' | 'stale' | 'delayed' | 'early' | 'onTime';

export interface StatusBadgeProps {
  variant: StatusBadgeVariant;
  text?: string;
  delayMinutes?: number;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ variant, text, delayMinutes }) => {
  const { t } = useTranslation();
  const { theme, isDark } = useAppTheme();

  let displayText = text;
  let icon = <Clock size={12} color={theme.colors.textSecondary} />;
  let backgroundColor = theme.colors.badgeScheduledBg;
  let textColor = theme.colors.badgeScheduledText;
  let accessibilityLabel = 'Status: Scheduled';

  switch (variant) {
    case 'live':
      displayText = displayText ?? t('common.live');
      icon = <Radio size={12} color={theme.colors.badgeLiveText} />;
      backgroundColor = theme.colors.badgeLiveBg;
      textColor = theme.colors.badgeLiveText;
      accessibilityLabel = 'Status: Live vehicle tracking';
      break;
    case 'stale':
      displayText = displayText ?? t('common.scheduled');
      icon = <AlertTriangle size={12} color={theme.colors.badgeStaleText} />;
      backgroundColor = theme.colors.badgeStaleBg;
      textColor = theme.colors.badgeStaleText;
      accessibilityLabel = 'Status: Realtime data stale, showing scheduled time';
      break;
    case 'delayed':
      displayText = displayText ?? t('common.delayed', { minutes: delayMinutes ?? 0 });
      backgroundColor = isDark ? '#7F1D1D' : '#FEE2E2';
      textColor = isDark ? '#FCA5A5' : '#B91C1C';
      accessibilityLabel = `Status: Delayed by ${delayMinutes ?? 0} minutes`;
      break;
    case 'early':
      displayText = displayText ?? t('common.early', { minutes: delayMinutes ?? 0 });
      backgroundColor = isDark ? '#14532D' : '#DCFCE7';
      textColor = isDark ? '#86EFAC' : '#15803D';
      accessibilityLabel = `Status: Early by ${delayMinutes ?? 0} minutes`;
      break;
    case 'onTime':
      displayText = displayText ?? t('common.onTime');
      backgroundColor = isDark ? '#14532D' : '#DCFCE7';
      textColor = isDark ? '#86EFAC' : '#15803D';
      accessibilityLabel = 'Status: On time';
      break;
    case 'scheduled':
    default:
      displayText = displayText ?? t('common.scheduled');
      accessibilityLabel = 'Status: Scheduled departure, live tracking unavailable';
      break;
  }

  return (
    <View
      style={[styles.badge, { backgroundColor }]}
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel}
    >
      {icon}
      <Text style={[styles.text, { color: textColor }]}>{displayText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
