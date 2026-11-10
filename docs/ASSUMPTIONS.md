# Backend Contract Assumptions: City Connector Mobile

This document isolates all assumptions made where the backend Go microservice or Kong Gateway contract was unspecified. All assumptions are isolated behind typed Zod schemas in `src/api/schemas/` and adapter utilities in `src/lib/`.

---

## 1. Agency Timezones & Date Parsing

- **Assumption**: Transit trip times, scheduled departures, and real-time deltas are sensitive to metropolitan transit timezones. Device local time cannot be trusted because tourists and commuters may have devices configured to different timezones.
- **Default Timezone**: Configured via `EXPO_PUBLIC_DEFAULT_CITY_TIMEZONE` (defaults to `Africa/Nairobi`, UTC+3).
- **Isolation**: All date parsing and delay calculations use `date-fns` with `@date-fns/tz` in `src/lib/time.ts`. When an agency provides its own timezone string in metadata, that timezone takes precedence over the city default.

---

## 2. Multi-Agency Entity Identification

- **Assumption**: Transit agencies operate autonomously with their own GTFS feed generators. Stop and route IDs are globally unique **only** when qualified by the agency prefix.
- **Format**: Entity IDs are strictly opaque strings matching the pattern `{agency_code}:{entity_id}` (e.g., `supermetro:sm_101`, `krc:station_04`).
- **Co-located Stops**: When a commuter train station and bus terminal occupy the exact same physical latitude and longitude, they are represented as distinct stop records in the backend PostGIS database. The client intentionally displays them as separate stops and never deduplicates or merges them.
- **Isolation**: Handled by `src/lib/id.ts` (`parseAgencyCode` and `getDisplayId`), leaving original IDs unmodified in state and network requests.

---

## 3. Realtime Feeds, Delays, and Ghost Vehicles

- **Assumption**: Realtime vehicle positions are published via GTFS-RT protocol buffers, ingested by a Go daemon, and cached in Redis with a TTL of 60–120 seconds.
- **Staleness Rule**: Vehicle telemetry refreshes every 15–30 seconds. Any vehicle whose last update timestamp is older than 30 seconds (`EXPO_PUBLIC_REALTIME_STALE_THRESHOLD_MS`), or which is omitted from the latest snapshot response, is immediately evicted from client state. **Ghost vehicles are never displayed.**
- **Delay Semantics**:
  - `delaySeconds > 0`: Trip is running late (rendered with warning/amber status badge, e.g., `+4 min`).
  - `delaySeconds < 0`: Trip is running early (rendered with blue/info badge, e.g., `-2 min`).
  - `Math.abs(delaySeconds) < 60`: Trip is considered "On time" (rendered with green success badge).
  - `delaySeconds === null | undefined`: Realtime delay unavailable; rendered as "Scheduled" (neutral badge).
- **Isolation**: Encapsulated in `src/lib/time.ts` (`formatDelay`) and `src/components/StatusBadge.tsx`.

---

## 4. Agency Outages & Degraded Feeds

- **Assumption**: Realtime GPS vehicle trackers and automated vehicle location (AVL) hardware on buses and matatus may fail intermittently per operator.
- **Degradation Contract**: The `/realtime/snapshot` endpoint returns an array of `AgencyFeedStatus` objects:
  ```json
  [
    {
      "agencyCode": "supermetro",
      "isDegraded": false,
      "lastUpdated": "2026-11-10T19:50:00Z"
    },
    {
      "agencyCode": "matatu-east",
      "isDegraded": true,
      "lastUpdated": "2026-11-10T19:40:00Z",
      "degradedReason": "Upstream AVL telemetry outage"
    }
  ]
  ```
- **Client Behavior**: When `isDegraded === true`, the client renders a non-blocking `<FeedStatusBanner />` alerting the user that the specific agency's live data is temporarily unavailable, falling back to scheduled timetable arrivals without crashing the screen.
- **Isolation**: Encapsulated in `src/components/FeedStatusBanner.tsx` and `src/features/realtime/useRealtimeSnapshot.ts`.

---

## 5. Gateway Rate Limiting & Token Buckets

- **Assumption**: Kong API Gateway enforces strict rate limits to protect backend RAPTOR pathfinders and PostGIS geospatial calculation clusters:
  - `GET /journey`: ~5 req/min
  - `GET /stops/nearby`: ~20 req/min
  - `GET /search`: ~40 req/min
- **Client Token Buckets**: To prevent HTTP 429 lockouts, the client runs local token buckets calibrated slightly below the gateway maximums:
  - Journey: 4 tokens capacity, refills at 1 token / 15s.
  - Stops: 15 tokens capacity, refills at 1 token / 4s.
  - Search: 30 tokens capacity, refills at 1 token / 2s.
- **Retry-After Header**: When the gateway returns HTTP 429, it includes a `Retry-After: <seconds>` header. If the header is missing, non-numeric, or malformed, the client safely falls back to a 30-second cooldown period.
- **Isolation**: Encapsulated in `src/lib/throttle.ts` (`TokenBucketRateLimiter`), `src/api/client.ts`, and `src/components/RateLimitCountdown.tsx`.

---

## 6. Location Permissions & Default Hub

- **Assumption**: City Connector only requires foreground GPS location permissions (`expo-location`). Background location tracking is strictly out of scope.
- **Fallback Coordinates**: If the user denies location permission, the app falls back to the central transit hub of Nairobi CBD:
  - Latitude: `-1.286389`
  - Longitude: `36.817223`
- **Isolation**: Encapsulated in `src/hooks/useLocation.ts` (`DEFAULT_FALLBACK_COORDINATES`).
