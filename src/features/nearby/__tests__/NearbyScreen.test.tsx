import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NearbyScreen } from '../NearbyScreen';
import { server } from '@/test/server';
import '@/i18n';

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

async function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return await render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('NearbyScreen Integration', () => {
  it('renders nearby stops from MSW mock fixtures', async () => {
    await renderWithProviders(<NearbyScreen />);

    // Wait for stops to load from MSW
    await waitFor(() => {
      expect(screen.getByText('Ambassadeur Terminal')).toBeTruthy();
      expect(screen.getByText('Kencom House Stage')).toBeTruthy();
    });
  });

  it('renders degraded agency feed banner without failing the screen', async () => {
    await renderWithProviders(<NearbyScreen />);

    // MATATU agency is configured as stale/degraded in mockRealtimeSnapshot
    await waitFor(() => {
      const banner = screen.getByTestId('feed-status-banner');
      expect(banner).toBeTruthy();
      expect(within(banner).getByText(/MATATU/i)).toBeTruthy();
    });
  });
});
