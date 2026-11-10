import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  type GestureResponderEvent,
} from 'react-native';
import { useAppTheme } from '@/theme';

export interface ButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  testID?: string;
  accessibilityLabel?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
  testID,
  accessibilityLabel,
}) => {
  const { theme } = useAppTheme();

  let bg = theme.colors.primary;
  let fg = theme.colors.primaryContent;
  let border = 'transparent';

  if (variant === 'secondary') {
    bg = theme.colors.surfaceSecondary;
    fg = theme.colors.textPrimary;
  } else if (variant === 'outline') {
    bg = 'transparent';
    fg = theme.colors.primary;
    border = theme.colors.primary;
  }

  if (disabled) {
    bg = theme.colors.surfaceBorder;
    fg = theme.colors.textMuted;
    border = 'transparent';
  }

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: bg,
          borderColor: border,
          borderWidth: variant === 'outline' ? 1.5 : 0,
        },
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      testID={testID}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={fg} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, { color: fg }]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 48, // Meets > 44pt accessible touch target guideline
    paddingHorizontal: 20,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
  },
});
