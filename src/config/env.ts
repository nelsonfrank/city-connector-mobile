import { z } from 'zod';

const envSchema = z.object({
  EXPO_PUBLIC_API_BASE_URL: z.string().url().default('https://api.cityconnector.transit'),
  EXPO_PUBLIC_USE_MOCKS: z
    .enum(['true', 'false'])
    .default('true')
    .transform((val) => val === 'true'),
  EXPO_PUBLIC_MAP_TILE_STYLE_URL: z
    .string()
    .url()
    .default('https://demotiles.maplibre.org/style.json'),
  EXPO_PUBLIC_DEFAULT_CITY_TIMEZONE: z.string().default('Africa/Nairobi'),
  EXPO_PUBLIC_REALTIME_POLL_INTERVAL_MS: z
    .string()
    .default('20000')
    .transform((val) => parseInt(val, 10)),
  EXPO_PUBLIC_REALTIME_STALE_THRESHOLD_MS: z
    .string()
    .default('30000')
    .transform((val) => parseInt(val, 10)),
});

export type Env = z.infer<typeof envSchema>;

let parsedEnv: Env;

try {
  parsedEnv = envSchema.parse({
    EXPO_PUBLIC_API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
    EXPO_PUBLIC_USE_MOCKS: process.env.EXPO_PUBLIC_USE_MOCKS,
    EXPO_PUBLIC_MAP_TILE_STYLE_URL: process.env.EXPO_PUBLIC_MAP_TILE_STYLE_URL,
    EXPO_PUBLIC_DEFAULT_CITY_TIMEZONE: process.env.EXPO_PUBLIC_DEFAULT_CITY_TIMEZONE,
    EXPO_PUBLIC_REALTIME_POLL_INTERVAL_MS: process.env.EXPO_PUBLIC_REALTIME_POLL_INTERVAL_MS,
    EXPO_PUBLIC_REALTIME_STALE_THRESHOLD_MS: process.env.EXPO_PUBLIC_REALTIME_STALE_THRESHOLD_MS,
  });
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Environment configuration validation failed:', error.format());
  }
  // Provide safe defaults so dev mode can boot even if .env is missing
  parsedEnv = envSchema.parse({});
}

export const env = parsedEnv;
