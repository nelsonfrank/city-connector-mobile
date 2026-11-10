import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { StopDetailView } from '@/features/nearby/components/StopDetailView';

export default function StopDetailRoute() {
  const { stopId } = useLocalSearchParams<{ stopId: string }>();

  return <StopDetailView stopId={decodeURIComponent(stopId ?? 'supermetro:sm_101')} />;
}
