import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import '@/i18n';
import { queryClient, queryPersister } from '@/lib/queryClient';
import { initInAppMocks } from '@/test/mockInit';
import { useAppTheme } from '@/theme';

export default function RootLayout() {
  const { theme, isDark } = useAppTheme();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      // Initialize in-app MSW mocks if EXPO_PUBLIC_USE_MOCKS=true
      await initInAppMocks();
      setIsReady(true);
    }
    prepare();
  }, []);

  if (!isReady) {
    return <View style={[styles.root, { backgroundColor: theme.colors.background }]} />;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{ persister: queryPersister }}
          >
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <Stack
              screenOptions={{
                headerStyle: {
                  backgroundColor: theme.colors.surface,
                },
                headerTintColor: theme.colors.textPrimary,
                contentStyle: {
                  backgroundColor: theme.colors.background,
                },
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="journey/[id]"
                options={{
                  title: 'Journey Details',
                  headerBackTitle: 'Back',
                }}
              />
              <Stack.Screen
                name="stop/[stopId]"
                options={{
                  title: 'Stop Departures',
                  headerBackTitle: 'Back',
                }}
              />
            </Stack>
          </PersistQueryClientProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
