import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Hourglass } from 'lucide-react-native';
import { useAppTheme } from '@/theme';

export interface RateLimitCountdownProps {
  initialSeconds: number;
  onRetry: () => void;
  testID?: string;
}

export const RateLimitCountdown: React.FC<RateLimitCountdownProps> = ({
  initialSeconds,
  onRetry,
  testID = 'rate-limit-view',
}) => {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const [remaining, setRemaining] = useState<number>(initialSeconds);

  useEffect(() => {
    setRemaining(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (remaining <= 0) return;
    const interval = setInterval(() => {
      setRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [remaining]);

  const canRetry = remaining === 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surfaceSecondary }]} testID={testID}>
      <Hourglass size={24} color={theme.colors.warning} />
      <Text style={[styles.message, { color: theme.colors.textPrimary }]}>
        {t('common.errorRateLimit', { seconds: remaining })}
      </Text>
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: canRetry ? theme.colors.primary : theme.colors.surfaceBorder,
          },
        ]}
        disabled={!canRetry}
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel={t('common.retry')}
        accessibilityState={{ disabled: !canRetry }}
        testID="rate-limit-retry-button"
      >
        <Text
          style={[
            styles.buttonText,
            {
              color: canRetry ? theme.colors.primaryContent : theme.colors.textMuted,
            },
          ]}
        >
          {t('common.retry')} {remaining > 0 ? `(${remaining}s)` : ''}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    margin: 16,
    gap: 12,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    minHeight: 44,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
