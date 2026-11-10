import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { JourneyPlannerScreen } from '../JourneyPlannerScreen';
import { server } from '@/test/server';
import { setSimulateRateLimit } from '@/test/handlers';
import '@/i18n';

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => {
  server.resetHandlers();
  setSimulateRateLimit(false);
});
afterAll(() => server.close());

async function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return await render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('JourneyPlannerScreen Integration', () => {
  it('renders Pareto-optimal journey options on search', async () => {
    await renderWithProviders(<JourneyPlannerScreen />);

    const searchBtn = screen.getByTestId('journey-search-button');
    fireEvent.press(searchBtn);

    // Verify Pareto criteria chips render
    await waitFor(() => {
      expect(screen.getByTestId('pareto-chip-fastest')).toBeTruthy();
      expect(screen.getByTestId('pareto-chip-transfers')).toBeTruthy();
      expect(screen.getByTestId('pareto-chip-walking')).toBeTruthy();
    });

    // Verify fastest option renders
    expect(screen.getByTestId('journey-option-itin_fastest_1')).toBeTruthy();
  });

  it('displays countdown and disables retry when a 429 occurs', async () => {
    setSimulateRateLimit(true);

    await renderWithProviders(<JourneyPlannerScreen />);

    const searchBtn = screen.getByTestId('journey-search-button');
    fireEvent.press(searchBtn);

    await waitFor(() => {
      expect(screen.getByTestId('rate-limit-view')).toBeTruthy();
    });

    const retryBtn = screen.getByTestId('rate-limit-retry-button');
    expect(retryBtn.props.accessibilityState?.disabled).toBe(true);
  });
});
