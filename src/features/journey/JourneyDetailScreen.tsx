import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { TransitMap } from '@/components/TransitMap';
import { mockJourneyResponse } from '@/test/fixtures/journeyData';
import { useAppTheme } from '@/theme';
import { LegTimeline } from './components/LegTimeline';

export interface JourneyDetailScreenProps {
  journeyId: string;
}

export const JourneyDetailScreen: React.FC<JourneyDetailScreenProps> = ({ journeyId }) => {
  const { t } = useTranslation();
  const { theme } = useAppTheme();

  // Find selected itinerary from fixtures/store
  const itinerary =
    mockJourneyResponse.itineraries.find((it) => it.id === journeyId) ??
    mockJourneyResponse.itineraries[0]!;

  // Collect polyline coordinates across all legs
  const routeCoordinates = itinerary.legs.flatMap((l) => l.coordinates ?? []);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.mapContainer}>
        <TransitMap
          centerCoordinate={routeCoordinates[0] ?? { latitude: -1.286, longitude: 36.82 }}
          routeCoordinates={routeCoordinates}
        />
      </View>

      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderColor: theme.colors.surfaceBorder }]}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          {t('journey.legTimeline')}
        </Text>
      </View>

      <LegTimeline legs={itinerary.legs} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    height: 240,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
});
