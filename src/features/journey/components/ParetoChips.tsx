import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Zap, GitCommit, Footprints } from 'lucide-react-native';
import type { ParetoCriteria } from '@/stores/journeySelectionStore';
import { useAppTheme } from '@/theme';

export interface ParetoChipsProps {
  selected: ParetoCriteria;
  onSelect: (criteria: ParetoCriteria) => void;
}

export const ParetoChips: React.FC<ParetoChipsProps> = ({ selected, onSelect }) => {
  const { t } = useTranslation();
  const { theme } = useAppTheme();

  const options: { id: ParetoCriteria; label: string; icon: React.ReactNode }[] = [
    {
      id: 'fastest',
      label: t('journey.paretoFastest'),
      icon: (
        <Zap
          size={14}
          color={selected === 'fastest' ? theme.colors.primaryContent : theme.colors.textSecondary}
        />
      ),
    },
    {
      id: 'transfers',
      label: t('journey.paretoTransfers'),
      icon: (
        <GitCommit
          size={14}
          color={
            selected === 'transfers' ? theme.colors.primaryContent : theme.colors.textSecondary
          }
        />
      ),
    },
    {
      id: 'walking',
      label: t('journey.paretoWalking'),
      icon: (
        <Footprints
          size={14}
          color={selected === 'walking' ? theme.colors.primaryContent : theme.colors.textSecondary}
        />
      ),
    },
  ];

  return (
    <View style={styles.container} accessibilityRole="radiogroup">
      {options.map((opt) => {
        const isSelected = selected === opt.id;
        return (
          <TouchableOpacity
            key={opt.id}
            style={[
              styles.chip,
              {
                backgroundColor: isSelected ? theme.colors.primary : theme.colors.surfaceSecondary,
                borderColor: isSelected ? theme.colors.primary : theme.colors.surfaceBorder,
              },
            ]}
            onPress={() => onSelect(opt.id)}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={opt.label}
            activeOpacity={0.7}
            testID={`pareto-chip-${opt.id}`}
          >
            {opt.icon}
            <Text
              style={[
                styles.chipText,
                {
                  color: isSelected ? theme.colors.primaryContent : theme.colors.textSecondary,
                  fontWeight: isSelected ? '700' : '500',
                },
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 8,
  },
  chip: {
    minHeight: 44, // Accessible touch target
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  chipText: {
    fontSize: 12,
  },
});
