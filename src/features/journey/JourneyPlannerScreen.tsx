import React, { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { fetchJourney, journeyQueryKeys } from '@/api/endpoints/journey';
import { RateLimitError } from '@/api/errors';
import type { Itinerary } from '@/api/schemas/journey';
import { Button } from '@/components/Button';
import { OfflineBanner } from '@/components/OfflineBanner';
import { RateLimitCountdown } from '@/components/RateLimitCountdown';
import { useLocation } from '@/hooks/useLocation';
import { useOnline } from '@/hooks/useOnline';
import { useJourneySelectionStore, type ParetoCriteria } from '@/stores/journeySelectionStore';
import { useAppTheme } from '@/theme';
import { JourneyOptionCard } from './components/JourneyOptionCard';
import { ParetoChips } from './components/ParetoChips';

export const JourneyPlannerScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const router = useRouter();
  const { isOnline } = useOnline();
  const { location } = useLocation();

  const [fromQuery, setFromQuery] = useState<string>('Nairobi CBD');
  const [toQuery, setToQuery] = useState<string>('Westlands');
  const { selectedCriteria, setSelectedCriteria, setSelectedItineraryId } =
    useJourneySelectionStore();
  const [activeSearchParams, setActiveSearchParams] = useState<{
    fromLat: number;
    fromLng: number;
    toLat: number;
    toLng: number;
    time: string;
  } | null>(null);

  const hasSearched = activeSearchParams !== null;

  const { data, isLoading, error } = useQuery({
    queryKey: activeSearchParams
      ? journeyQueryKeys.plan(activeSearchParams)
      : (['journey', 'idle'] as const),
    queryFn: ({ signal }) => {
      if (!activeSearchParams) {
        throw new Error('No search params');
      }
      return fetchJourney(activeSearchParams, signal);
    },
    enabled: activeSearchParams !== null,
  });

  const handleSearch = () => {
    setActiveSearchParams({
      fromLat: location?.latitude ?? -1.286389,
      fromLng: location?.longitude ?? 36.817223,
      toLat: -1.2644,
      toLng: 36.8044,
      time: 'now',
    });
  };

  const itineraries = data?.itineraries ?? [];

  // Sort/filter Pareto set by selected criteria
  const sortedItineraries = [...itineraries].sort((a, b) => {
    if (selectedCriteria === 'fastest') {
      return a.durationSeconds - b.durationSeconds;
    }
    if (selectedCriteria === 'transfers') {
      return a.transfersCount - b.transfersCount;
    }
    return a.totalWalkDistanceMeters - b.totalWalkDistanceMeters;
  });

  const handleSelectItinerary = (itinerary: Itinerary) => {
    setSelectedItineraryId(itinerary.id);
    router.push(`/journey/${itinerary.id}`);
  };

  const isRateLimited = error instanceof RateLimitError;
  const retryAfterSeconds = isRateLimited ? (error as RateLimitError).retryAfterSeconds : 30;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <OfflineBanner />

      <View
        style={[
          styles.inputContainer,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.surfaceBorder },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.surfaceSecondary,
              color: theme.colors.textPrimary,
              borderColor: theme.colors.surfaceBorder,
            },
          ]}
          placeholder={t('journey.fromPlaceholder')}
          placeholderTextColor={theme.colors.textMuted}
          value={fromQuery}
          onChangeText={setFromQuery}
          accessibilityLabel="Origin input"
        />

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.surfaceSecondary,
              color: theme.colors.textPrimary,
              borderColor: theme.colors.surfaceBorder,
            },
          ]}
          placeholder={t('journey.toPlaceholder')}
          placeholderTextColor={theme.colors.textMuted}
          value={toQuery}
          onChangeText={setToQuery}
          accessibilityLabel="Destination input"
        />

        <Button
          title={t('journey.searchButton')}
          onPress={handleSearch}
          loading={isLoading}
          disabled={!isOnline && !data}
          testID="journey-search-button"
        />
      </View>

      <View style={styles.resultsContainer}>
        {isRateLimited && (
          <RateLimitCountdown initialSeconds={retryAfterSeconds} onRetry={handleSearch} />
        )}

        {error && !isRateLimited && (
          <View style={styles.errorContainer} testID="journey-error-banner">
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {t('common.errorNetwork')}
            </Text>
            <Button title={t('common.retry')} onPress={handleSearch} variant="secondary" />
          </View>
        )}

        {isLoading && (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
              {t('common.loading')}
            </Text>
          </View>
        )}

        {hasSearched && !isLoading && !error && (
          <>
            <ParetoChips
              selected={selectedCriteria}
              onSelect={(crit: ParetoCriteria) => setSelectedCriteria(crit)}
            />

            <FlatList
              data={sortedItineraries}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <JourneyOptionCard
                  itinerary={item}
                  isSelected={item.criteriaTag === selectedCriteria}
                  onSelect={handleSelectItinerary}
                />
              )}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
                    {t('journey.noJourneys')}
                  </Text>
                </View>
              }
            />
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputContainer: {
    padding: 16,
    borderBottomWidth: 1,
    gap: 10,
  },
  input: {
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  centerContainer: {
    padding: 32,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
  },
  errorContainer: {
    padding: 16,
    marginVertical: 12,
    alignItems: 'center',
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
