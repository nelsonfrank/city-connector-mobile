import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { JourneyDetailScreen } from '@/features/journey/JourneyDetailScreen';

export default function JourneyDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <JourneyDetailScreen journeyId={id ?? 'itin_fastest_1'} />;
}
