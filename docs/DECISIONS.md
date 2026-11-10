# Architecture Decision Records (ADRs): City Connector Mobile

This document records the architectural and technology decisions made for the City Connector mobile client, including context, evaluation criteria, and consequences.

---

## ADR 01: Expo SDK 58 & React Native 0.88.1 with Continuous Native Generation (CNG)

- **Date**: 2026-11-10
- **Status**: Accepted
- **Context**: The app requires deep native integration for vector maps (`@maplibre/maplibre-react-native`), high-performance synchronous storage (`react-native-mmkv`), gestures (`react-native-gesture-handler`), and animations (`react-native-reanimated`). Pure Expo Go cannot load custom native modules.
- **Decision**: Adopt **Expo SDK 58.0.23** on **React Native 0.88.1** and **React 19.3.0** with Continuous Native Generation (`expo prebuild`).
- **Consequences**:
  - `ios/` and `android/` are gitignored and generated dynamically via native config plugins.
  - New Architecture is enabled by default with the Hermes JavaScript engine.
  - Development builds (`expo run:ios` and `expo run:android`) provide rapid testing of custom native libraries without vendor lock-in.

---

## ADR 02: Pnpm 10.33.4 with Hoisted Node-Linker and Build Guard

- **Date**: 2026-11-10
- **Status**: Accepted
- **Context**: Fast, deterministic package installs are required across CI and developer environments. Metro bundler resolves packages through standard Node lookup trees and requires hoisted module topologies for React Native native dependencies.
- **Decision**: Standardize on **pnpm 10.33.4** pinned in `package.json` (`packageManager: pnpm@10.33.4`) and Node 22 LTS in `.nvmrc`. Configure `.npmrc` with `node-linker=hoisted` and install a `preinstall` check script (`scripts/check-pnpm.js`) that immediately halts any attempts to run `npm` or `yarn`.
- **Consequences**:
  - Zero lockfile drift or competing package managers.
  - Metro bundler resolves all React Native packages seamlessly without symlink traversal errors.
  - CI enforces `pnpm dedupe --check` on every commit.

---

## ADR 03: Vector Mapping with MapLibre React Native v11

- **Date**: 2026-11-10
- **Status**: Accepted
- **Context**: Transit apps require smooth, high-fps map panning, marker rendering for vehicles and stops, and customizable transit layer styles without costly third-party map licensing fees.
- **Decision**: Adopt `@maplibre/maplibre-react-native` v11.5.1 with an abstraction wrapper `<TransitMap />` (`src/components/TransitMap.tsx`).
- **Consequences**:
  - The map style is fully configurable via `EXPO_PUBLIC_MAP_TILE_STYLE_URL` (supports OpenMapTiles, Protomaps, MapTiler, or self-hosted PMTiles).
  - Isolating the map inside `<TransitMap />` allows replacing the map engine in the future without modifying feature screens.

---

## ADR 04: Server State with TanStack Query v5 & Synchronous MMKV Persister

- **Date**: 2026-11-10
- **Status**: Accepted
- **Context**: Transit schedules, nearby stops, and itineraries are read-heavy server state subject to network dropouts and gateway rate limits. An offline cache is required so riders can view their journeys underground or in poor network conditions.
- **Decision**: Use `@tanstack/react-query` v5 with `@tanstack/query-async-storage-persister` backed by `react-native-mmkv`.
- **Consequences**:
  - Fast synchronous cache hydration on app launch.
  - Automatic query deduplication prevents duplicate in-flight requests.
  - Offline banner alerts riders when cached data is being displayed.

---

## ADR 05: Client State with Zustand v5

- **Date**: 2026-11-10
- **Status**: Accepted
- **Context**: App settings (theme, language, polling rate), search history, and cross-screen selection IDs require simple, predictable client state.
- **Decision**: Use Zustand v5 with MMKV persistence for small, domain-focused stores (`settingsStore`, `searchStore`, `journeySelectionStore`).
- **Consequences**:
  - Zero boilerplate compared to Redux Toolkit.
  - React 19 concurrent-mode compatible.
  - Clear boundary: server state is never duplicated into Zustand.

---

## ADR 06: HTTP Client with Ky

- **Date**: 2026-11-10
- **Status**: Accepted
- **Context**: An HTTP client is needed with configurable timeouts, retry backoff, and response interception for Kong Gateway rate limits (HTTP 429).
- **Decision**: Adopt `ky` v2.2.0 over `axios`.
- **Consequences**:
  - Native `fetch`-based architecture with tiny bundle footprint.
  - Interceptors handle Gateway 429 `Retry-After` headers and sanitize data before returning to application code.

---

## ADR 07: Schema Validation with Zod v4

- **Date**: 2026-11-10
- **Status**: Accepted
- **Context**: Multi-agency backend contracts can change or return partial data during agency outages. Uncaught null values or malformed IDs crash React Native apps.
- **Decision**: Enforce runtime validation on every API response using **Zod v4** (`zod@^4.6.7`). Infer all TypeScript models directly from schemas (`z.infer<typeof Schema>`).
- **Consequences**:
  - Schema mismatches are caught and logged at the network layer before reaching UI components.
  - Single source of truth for TypeScript types and API contracts.

---

## ADR 08: Iconography with Lucide React Native

- **Date**: 2026-11-10
- **Status**: Accepted
- **Context**: Transit UI requires clean, highly recognizable icons (bus, train, walk, clock, alert, map pin, search, compass).
- **Decision**: Use `lucide-react-native` over `@expo/vector-icons`.
- **Consequences**:
  - Consistent 24pt/20pt stroke geometry and aesthetics across all screens.
  - Tree-shakeable SVG components with precise color prop control.

---

## ADR 09: Test Architecture with Jest and MSW v2

- **Date**: 2026-11-10
- **Status**: Accepted
- **Context**: Integration tests must verify real network lifecycles, HTTP 429 retry counters, token bucket limits, and degraded agency banners without depending on a live backend.
- **Decision**: Implement **Mock Service Worker (MSW) v2** (`msw/node` in Jest tests; `msw/native` in dev mock mode via `EXPO_PUBLIC_USE_MOCKS=true`).
- **Consequences**:
  - Same mock handlers (`src/test/handlers.ts`) power unit tests, integration tests, and manual developer testing.
  - Tests simulate real network conditions, HTTP 429 countdowns, and schema mismatches.

---

## ADR 10: E2E Automation with Maestro

- **Date**: 2026-11-10
- **Status**: Accepted
- **Context**: End-to-end user flows must be tested automatically without flaky Appium/Detox setup complexities.
- **Decision**: Adopt **Maestro** with declarative YAML flows stored in `e2e/`:
  - `e2e/nearby-flow.yaml`: Nearby stops discovery and degraded agency alert assertion.
  - `e2e/plan-journey-flow.yaml`: Pareto criteria chip selection, itinerary search, and leg timeline navigation.
  - `e2e/search-flow.yaml`: Debounced search query, results inspection, and recent searches persistence.
  - `e2e/all-flows.yaml`: Master suite executor.
