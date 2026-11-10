# City Connector Mobile 🚌🚆📍

**City Connector** is a production-grade, multi-agency public transit mobile application built with React Native and Expo. It provides metropolitan transit riders with unified journey planning (RAPTOR Pareto-optimal itineraries), geospatial stop discovery (PostGIS), and live vehicle telemetry without ghost vehicles.

---

## ⚡ Tech Stack & Architecture Highlights

- **Platform & Runtime**: [Expo SDK 58](https://expo.dev) + [React Native 0.88.1](https://reactnative.dev) + [React 19.3.0](https://react.dev)
- **Engine & Architecture**: New Architecture enabled by default with the Hermes engine
- **Builds**: Continuous Native Generation (CNG / `expo prebuild`) — `ios/` and `android/` folders are generated dynamically
- **Package Manager**: **pnpm** (pinned at `10.33.4`) with Node 22 LTS in `.nvmrc` and `node-linker=hoisted` in `.npmrc`
- **Navigation**: [Expo Router v58](https://docs.expo.dev/router/introduction/) (file-based routing with `typedRoutes: true`)
- **Server State & Caching**: [TanStack Query v5](https://tanstack.com/query/latest) + `@tanstack/query-async-storage-persister` backed by `react-native-mmkv`
- **Client State**: [Zustand v5](https://github.com/pmndrs/zustand) with MMKV persistence
- **HTTP Client**: [Ky](https://github.com/sindresorhus/ky) with automatic retry hooks, timeout handling, and gateway 429 interception
- **Validation**: [Zod v4](https://zod.dev) (`zod@^4.6.7`) validating 100% of API payloads with inferred TypeScript types
- **Vector Maps**: `@maplibre/maplibre-react-native` v11 wrapped in an abstract `<TransitMap />` component
- **Iconography**: `lucide-react-native`
- **Localization**: `i18next` + `react-i18next` with complete translations for **English** (`en`) and **Swahili** (`sw`)
- **Quality & Testing**: Jest + `jest-expo` + MSW v2 (Mock Service Worker), ESLint flat config, Prettier, Knip, Lefthook, and Maestro E2E flows

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v22.x` (LTS) - verify with `node -v`
- **Package Manager**: **pnpm** `v10.x` only (`npm` and `yarn` are strictly blocked via `scripts/check-pnpm.js`)
  ```bash
  corepack enable
  corepack prepare pnpm@10.33.4 --activate
  ```

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/city-connector-mobile.git
cd city-connector-mobile

# Install dependencies using pnpm
pnpm install
```

### Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Environment Variable                      | Description                                 | Default                                     |
| ----------------------------------------- | ------------------------------------------- | ------------------------------------------- |
| `EXPO_PUBLIC_API_BASE_URL`                | Kong API Gateway base URL                   | `https://api.cityconnector.transit`         |
| `EXPO_PUBLIC_DEFAULT_CITY_TIMEZONE`       | Transit authority metropolitan timezone     | `Africa/Nairobi`                            |
| `EXPO_PUBLIC_MAP_TILE_STYLE_URL`          | MapLibre vector tile style JSON URL         | `https://demotiles.maplibre.org/style.json` |
| `EXPO_PUBLIC_REALTIME_POLL_INTERVAL_MS`   | Realtime snapshot polling interval (ms)     | `20000` (20s)                               |
| `EXPO_PUBLIC_REALTIME_STALE_THRESHOLD_MS` | Max age before vehicle is marked stale (ms) | `30000` (30s)                               |
| `EXPO_PUBLIC_USE_MOCKS`                   | Enable Mock Service Worker (MSW) in-app     | `false`                                     |

---

## 📱 Running the Application

### 1. Running with Mock Mode (Stand-alone Demo)

To run the app locally without needing a live Go microservice backend:

```bash
# In your .env:
EXPO_PUBLIC_USE_MOCKS=true

# Start the Expo development server
pnpm start
```

### 2. Development Builds (Continuous Native Generation)

Because the app uses native vector maps (`@maplibre/maplibre-react-native`) and synchronous MMKV storage, run native development builds:

```bash
# Android
pnpm android

# iOS (macOS required)
pnpm ios
```

---

## 🧪 Testing & Code Quality

All quality checks enforce strict standards across the codebase:

```bash
# Run unit and MSW integration test suite (7 suites, 27 tests)
pnpm test

# Run tests with coverage
pnpm test:coverage

# TypeScript strict type checking
pnpm typecheck

# ESLint flat config check
pnpm lint

# Prettier format check
pnpm format

# Automatically fix Prettier code styles
pnpm format:fix

# Knip dead-code and unused dependency hygiene check
pnpm check:knip

# Expo doctor verification (20/20 checks)
pnpm expo-doctor

# Lockfile consistency check
pnpm dedupe --check

# Maestro End-to-End flows
pnpm e2e
```

---

## 🏛️ Domain Rules & Invariants

1. **Opaque Agency-Prefixed IDs**: All entity IDs are formatted as `{agency_code}:{entity_id}` (e.g., `supermetro:sm_101`). Co-located stops from different agencies are intentionally modeled as distinct entities and never merged.
2. **Client-Side Token Bucket Rate Limiters**: Proactively guards Kong Gateway limits:
   - Journey Planning: 4 req/min (vs gateway 5)
   - Nearby Stops: 15 req/min (vs gateway 20)
   - Search: 30 req/min (vs gateway 40)
3. **Ghost Vehicle Prevention**: Vehicles older than 30s or omitted from the snapshot are discarded immediately.
4. **Per-Agency Degradation Isolation**: If an individual agency's feed fails, the app renders a targeted feed status banner and falls back to scheduled timetable arrivals without crashing the screen.
5. **RAPTOR Pareto-Optimal Itineraries**: The Journey Planner presents multiple Pareto-optimal options (Fastest, Fewest Transfers, Least Walking) with detailed multi-leg timelines.

---

## 📚 Documentation

Detailed architectural specifications and decisions are located in the `docs/` directory:

- [Architecture & Data Flow Diagram](docs/ARCHITECTURE.md)
- [Architecture Decision Records (ADR)](docs/DECISIONS.md)
- [Backend Contract Assumptions](docs/ASSUMPTIONS.md)
- [API Contract & Schema Specification](docs/API_CONTRACT.md)

---

## 📄 License

Private & Proprietary. All rights reserved.
