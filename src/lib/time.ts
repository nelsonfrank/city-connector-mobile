import { TZDate } from '@date-fns/tz';
import { format, differenceInMinutes, parseISO } from 'date-fns';
import { env } from '@/config/env';

/**
 * Parses an ISO date string, Date object, or timestamp into a TZDate locked to the configured transit timezone.
 */
export function toAgencyDate(
  dateOrIso: string | Date | number,
  timeZone: string = env.EXPO_PUBLIC_DEFAULT_CITY_TIMEZONE,
): TZDate {
  if (typeof dateOrIso === 'string') {
    return new TZDate(dateOrIso, timeZone);
  }
  if (typeof dateOrIso === 'number') {
    return new TZDate(dateOrIso, timeZone);
  }
  return new TZDate(dateOrIso, timeZone);
}

/**
 * Formats a transit departure/arrival time into a localized 24h clock string (e.g. "14:35").
 */
export function formatTransitTime(
  dateOrIso: string | Date | number,
  timeZone: string = env.EXPO_PUBLIC_DEFAULT_CITY_TIMEZONE,
): string {
  try {
    const tzDate = toAgencyDate(dateOrIso, timeZone);
    return format(tzDate, 'HH:mm');
  } catch {
    return '--:--';
  }
}

/**
 * Formats duration in seconds into human-readable text (e.g. "35 min", "1 hr 12 min").
 */
export function formatDurationMinutes(durationSeconds: number): string {
  const totalMinutes = Math.round(durationSeconds / 60);
  if (totalMinutes < 60) {
    return `${Math.max(1, totalMinutes)} min`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const remainingMins = totalMinutes % 60;
  if (remainingMins === 0) {
    return `${hours} hr`;
  }
  return `${hours} hr ${remainingMins} min`;
}

/**
 * Formats a realtime delay delta in seconds.
 * Contract:
 * - delaySeconds >= 60 -> "+X min"
 * - delaySeconds <= -60 -> "-X min" (early)
 * - between -59 and 59 -> "On time"
 */
export function formatDelay(delaySeconds: number | null | undefined): {
  text: string;
  isEarly: boolean;
  isDelayed: boolean;
  isOnTime: boolean;
} {
  if (delaySeconds == null) {
    return { text: 'Scheduled', isEarly: false, isDelayed: false, isOnTime: false };
  }

  const minutes = Math.round(delaySeconds / 60);

  if (minutes > 0) {
    return { text: `+${minutes} min`, isEarly: false, isDelayed: true, isOnTime: false };
  }
  if (minutes < 0) {
    return { text: `${minutes} min`, isEarly: true, isDelayed: false, isOnTime: false };
  }
  return { text: 'On time', isEarly: false, isDelayed: false, isOnTime: true };
}

/**
 * Determines whether a realtime datum timestamp is stale.
 * Default threshold is 30,000ms (30s) per backend contract.
 */
export function isRealtimeStale(
  timestampEpochMsOrIso: number | string,
  thresholdMs: number = env.EXPO_PUBLIC_REALTIME_STALE_THRESHOLD_MS,
  nowMs: number = Date.now(),
): boolean {
  const timestampMs =
    typeof timestampEpochMsOrIso === 'string'
      ? new Date(timestampEpochMsOrIso).getTime()
      : timestampEpochMsOrIso;

  if (isNaN(timestampMs)) {
    return true;
  }

  const ageMs = nowMs - timestampMs;
  return ageMs > thresholdMs;
}

/**
 * Calculates countdown seconds until an ETA in the future.
 */
export function minutesUntil(targetIsoOrDate: string | Date, now: Date = new Date()): number {
  try {
    const target = typeof targetIsoOrDate === 'string' ? parseISO(targetIsoOrDate) : targetIsoOrDate;
    return Math.max(0, differenceInMinutes(target, now));
  } catch {
    return 0;
  }
}
