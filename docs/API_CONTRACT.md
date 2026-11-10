# Backend API Contract: City Connector Mobile

This document outlines the REST API contracts between the Kong API Gateway and the City Connector React Native mobile client. All client data models are validated at runtime using Zod schemas located in `src/api/schemas/`.

---

## 1. Authentication & Common Headers

- **Base URL**: Configured via `EXPO_PUBLIC_API_BASE_URL`.
- **Request Headers**:
  - `Accept: application/json`
  - `User-Agent: CityConnectorMobile/1.0.0 (React-Native; Expo SDK 58)`
  - `X-Client-Timezone: Africa/Nairobi` (ISO-8601 Metropolitan time zone)
- **Rate Limit Response Headers**:
  - `X-RateLimit-Limit`: Maximum requests per window
  - `X-RateLimit-Remaining`: Remaining requests in current window
  - `Retry-After`: Seconds to wait before retrying (on HTTP 429)

---

## 2. Endpoints

### 2.1 Journey Planning (RAPTOR Pareto Set)

Computes multi-modal transit itineraries between origin and destination coordinates.

- **Method**: `GET /journey`
- **Rate Limit**: ~5 req/min (Kong Gateway); Client Bucket: 4 req/min
- **Query Parameters**:
  - `fromLat` (number, required): Origin latitude (-90 to 90)
  - `fromLng` (number, required): Origin longitude (-180 to 180)
  - `toLat` (number, required): Destination latitude (-90 to 90)
  - `toLng` (number, required): Destination longitude (-180 to 180)
  - `time` (string, optional): Departure time in ISO-8601 or `now`
- **Response**: `200 OK`
  ```json
  {
    "itineraries": [
      {
        "id": "itin_01",
        "durationSeconds": 2100,
        "transfersCount": 1,
        "totalWalkDistanceMeters": 350,
        "departureTime": "2026-11-10T19:45:00Z",
        "arrivalTime": "2026-11-10T20:20:00Z",
        "legs": [
          {
            "id": "leg_01_walk",
            "mode": "WALK",
            "fromStopName": "Current Location",
            "toStopName": "CBD Rail Terminus",
            "fromLat": -1.286389,
            "fromLng": 36.817223,
            "toLat": -1.2855,
            "toLng": 36.818,
            "startTime": "2026-11-10T19:45:00Z",
            "endTime": "2026-11-10T19:50:00Z",
            "distanceMeters": 250,
            "agencyCode": null,
            "routeShortName": null,
            "delaySeconds": null
          },
          {
            "id": "leg_02_transit",
            "mode": "BUS",
            "fromStopName": "CBD Rail Terminus",
            "toStopName": "Westlands Bus Terminal",
            "fromLat": -1.2855,
            "fromLng": 36.818,
            "toLat": -1.2644,
            "toLng": 36.8044,
            "startTime": "2026-11-10T19:55:00Z",
            "endTime": "2026-11-10T20:20:00Z",
            "distanceMeters": 4200,
            "agencyCode": "supermetro",
            "routeShortName": "105",
            "delaySeconds": 180
          }
        ]
      }
    ]
  }
  ```

---

### 2.2 Nearby Stops Discovery (PostGIS)

Discovers transit stops and stations within a geographic radius.

- **Method**: `GET /stops/nearby`
- **Rate Limit**: ~20 req/min (Kong Gateway); Client Bucket: 15 req/min
- **Query Parameters**:
  - `lat` (number, required): Center latitude
  - `lng` (number, required): Center longitude
  - `radiusMeters` (number, optional, default: 800): Search radius
- **Response**: `200 OK`
  ```json
  [
    {
      "id": "supermetro:sm_101",
      "name": "CBD Rail Station Bus Stop",
      "latitude": -1.2855,
      "longitude": 36.818,
      "distanceMeters": 140,
      "agencyCode": "supermetro",
      "routes": ["105", "106", "111"],
      "wheelchairAccessible": true
    },
    {
      "id": "krc:station_04",
      "name": "Nairobi Central Railway Station",
      "latitude": -1.2855,
      "longitude": 36.818,
      "distanceMeters": 140,
      "agencyCode": "krc",
      "routes": ["Commuter Line 1"],
      "wheelchairAccessible": true
    }
  ]
  ```
  _(Note: Co-located stops from different agencies share coordinates but maintain unique opaque IDs)._

---

### 2.3 Stop Details & Upcoming Departures

Fetches stop metadata and upcoming scheduled/live departures.

- **Method**: `GET /stops/{id}`
- **Path Parameters**:
  - `id` (string, required): Opaque agency-namespaced stop ID (e.g., `supermetro:sm_101`)
- **Response**: `200 OK`
  ```json
  {
    "id": "supermetro:sm_101",
    "name": "CBD Rail Station Bus Stop",
    "latitude": -1.2855,
    "longitude": 36.818,
    "agencyCode": "supermetro",
    "departures": [
      {
        "tripId": "supermetro:trip_9021",
        "routeShortName": "105",
        "headsign": "Westlands - Kikuyu",
        "scheduledDeparture": "2026-11-10T20:00:00Z",
        "delaySeconds": 120,
        "isRealtime": true,
        "vehicleId": "supermetro:veh_771"
      },
      {
        "tripId": "supermetro:trip_9022",
        "routeShortName": "106",
        "headsign": "Kangemi",
        "scheduledDeparture": "2026-11-10T20:15:00Z",
        "delaySeconds": 0,
        "isRealtime": false,
        "vehicleId": null
      }
    ]
  }
  ```

---

### 2.4 Unified Transit Search

Full-text search for stops, stations, routes, and transit lines.

- **Method**: `GET /search`
- **Rate Limit**: ~40 req/min (Kong Gateway); Client Bucket: 30 req/min
- **Query Parameters**:
  - `q` (string, required): Query string (min length 2 characters)
- **Response**: `200 OK`
  ```json
  {
    "stops": [
      {
        "id": "supermetro:sm_101",
        "name": "CBD Rail Station Bus Stop",
        "agencyCode": "supermetro",
        "latitude": -1.2855,
        "longitude": 36.818
      }
    ],
    "routes": [
      {
        "id": "supermetro:route_105",
        "shortName": "105",
        "longName": "Nairobi CBD - Westlands - Kikuyu",
        "agencyCode": "supermetro",
        "type": "BUS"
      }
    ]
  }
  ```

---

### 2.5 Realtime Snapshot & Agency Feeds

Polls active vehicle GPS coordinates and per-agency feed statuses.

- **Method**: `GET /realtime/snapshot`
- **Response**: `200 OK`
  ```json
  {
    "timestamp": "2026-11-10T19:50:00Z",
    "vehicles": [
      {
        "vehicleId": "supermetro:veh_771",
        "agencyCode": "supermetro",
        "routeShortName": "105",
        "latitude": -1.275,
        "longitude": 36.811,
        "bearing": 135,
        "delaySeconds": 120,
        "lastUpdated": "2026-11-10T19:49:45Z"
      }
    ],
    "agencyStatuses": [
      {
        "agencyCode": "supermetro",
        "isDegraded": false,
        "lastUpdated": "2026-11-10T19:50:00Z"
      },
      {
        "agencyCode": "matatu-east",
        "isDegraded": true,
        "lastUpdated": "2026-11-10T19:35:00Z",
        "degradedReason": "Telemetry provider feed timeout"
      }
    ]
  }
  ```

---

## 3. Error Responses

All error payloads follow RFC 7807 Problem Details or the standard Kong error format:

```json
{
  "code": "RATE_LIMIT_EXCEEDED",
  "message": "API rate limit exceeded. Please wait before retrying.",
  "retryAfterSeconds": 30
}
```

### HTTP Status Code Matrix

| Status Code             | Client Handling                                                                            |
| ----------------------- | ------------------------------------------------------------------------------------------ |
| `200 OK`                | Validates payload against Zod schema. If schema invalid, logs error and throws `ApiError`. |
| `400 Bad Request`       | Logs query error and alerts user to invalid inputs.                                        |
| `404 Not Found`         | Renders empty state view (e.g., `<EmptyState />`).                                         |
| `429 Too Many Requests` | Parses `Retry-After` header. Throws `RateLimitError` and renders `<RateLimitCountdown />`. |
| `500 / 502 / 503`       | Renders `<OfflineBanner />` or `<FeedStatusBanner />` with scheduled GTFS fallback.        |
