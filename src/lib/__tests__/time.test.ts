import {
  formatDelay,
  formatDurationMinutes,
  formatTransitTime,
  isRealtimeStale,
} from '../time';

describe('Time and Realtime Staleness Utilities', () => {
  describe('formatDelay', () => {
    it('formats on time when delta is between -59 and 59 seconds', () => {
      expect(formatDelay(0).text).toBe('On time');
      expect(formatDelay(30).text).toBe('On time');
      expect(formatDelay(-30).text).toBe('On time');
      expect(formatDelay(0).isOnTime).toBe(true);
    });

    it('formats positive delays as "+X min"', () => {
      const result = formatDelay(180); // 3 minutes
      expect(result.text).toBe('+3 min');
      expect(result.isDelayed).toBe(true);
      expect(result.isOnTime).toBe(false);
    });

    it('formats early vehicle deltas as "-X min"', () => {
      const result = formatDelay(-120); // 2 minutes early
      expect(result.text).toBe('-2 min');
      expect(result.isEarly).toBe(true);
      expect(result.isOnTime).toBe(false);
    });

    it('falls back to Scheduled when delaySeconds is null or undefined', () => {
      expect(formatDelay(null).text).toBe('Scheduled');
      expect(formatDelay(undefined).text).toBe('Scheduled');
    });
  });

  describe('isRealtimeStale', () => {
    const fixedNow = 1700000000000;

    it('returns false when datum is fresher than threshold (30s)', () => {
      const freshTimestamp = fixedNow - 15000; // 15s ago
      expect(isRealtimeStale(freshTimestamp, 30000, fixedNow)).toBe(false);
    });

    it('returns true when datum is older than 30s threshold', () => {
      const staleTimestamp = fixedNow - 35000; // 35s ago
      expect(isRealtimeStale(staleTimestamp, 30000, fixedNow)).toBe(true);
    });

    it('returns true for invalid or unparseable timestamps', () => {
      expect(isRealtimeStale('invalid-date', 30000, fixedNow)).toBe(true);
    });
  });

  describe('formatDurationMinutes', () => {
    it('formats minutes under 60 correctly', () => {
      expect(formatDurationMinutes(1200)).toBe('20 min');
      expect(formatDurationMinutes(45)).toBe('1 min');
    });

    it('formats hours and minutes when over 60', () => {
      expect(formatDurationMinutes(3600)).toBe('1 hr');
      expect(formatDurationMinutes(4500)).toBe('1 hr 15 min');
    });
  });

  describe('formatTransitTime', () => {
    it('formats ISO time string into 24-hour HH:mm in configured timezone', () => {
      // 2026-11-10T12:30:00Z in UTC is 15:30 in Africa/Nairobi (UTC+3)
      const iso = '2026-11-10T12:30:00Z';
      expect(formatTransitTime(iso, 'Africa/Nairobi')).toBe('15:30');
    });

    it('returns fallback string on invalid date', () => {
      expect(formatTransitTime('invalid-iso')).toBe('--:--');
    });
  });
});
