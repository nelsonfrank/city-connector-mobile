import { env } from '@/config/env';
import { logger } from '@/lib/logger';

export async function initInAppMocks(): Promise<void> {
  if (!env.EXPO_PUBLIC_USE_MOCKS) {
    return;
  }

  try {
    const { setupServer } = await import('msw/native');
    const { handlers } = await import('./handlers');
    const server = setupServer(...handlers);
    server.listen({ onUnhandledRequest: 'bypass' });
    logger.info('🛰️ [MSW Native] In-app mock mode activated with realistic fixtures');
  } catch (error) {
    logger.warn('Failed to initialize in-app MSW mocks:', error);
  }
}
