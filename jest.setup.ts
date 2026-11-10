// Include Reanimated mock
require('react-native-reanimated/mock');

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    DrawerLayoutAndroid: View,
    WebView: View,
    NativeViewGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    RawButton: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
    FlatList: View,
    gestureHandlerRootHOC: jest.fn((component: any) => component),
    Directions: {},
    GestureHandlerRootView: View,
    Gesture: {
      Pan: () => ({
        onChange: jest.fn().mockReturnThis(),
        onEnd: jest.fn().mockReturnThis(),
      }),
    },
  };
});

// Mock react-native-mmkv
jest.mock('react-native-mmkv', () => {
  const store = new Map<string, string>();
  const mockInstance = {
    set: jest.fn((key: string, value: string) => store.set(key, value)),
    getString: jest.fn((key: string) => store.get(key)),
    getNumber: jest.fn((key: string) => {
      const val = store.get(key);
      return val ? Number(val) : undefined;
    }),
    getBoolean: jest.fn((key: string) => {
      const val = store.get(key);
      return val ? val === 'true' : undefined;
    }),
    delete: jest.fn((key: string) => store.delete(key)),
    remove: jest.fn((key: string) => store.delete(key)),
    clearAll: jest.fn(() => store.clear()),
    getAllKeys: jest.fn(() => Array.from(store.keys())),
  };
  return {
    createMMKV: jest.fn(() => mockInstance),
    MMKV: jest.fn(() => mockInstance),
  };
});

// Mock @react-native-community/netinfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn().mockResolvedValue({
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
  }),
  useNetInfo: jest.fn(() => ({
    isConnected: true,
    isInternetReachable: true,
  })),
}));

// Mock expo-location
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({
    status: 'granted',
    granted: true,
  }),
  getForegroundPermissionsAsync: jest.fn().mockResolvedValue({
    status: 'granted',
    granted: true,
  }),
  getCurrentPositionAsync: jest.fn().mockResolvedValue({
    coords: {
      latitude: -1.286389,
      longitude: 36.817223,
      altitude: 1795,
      accuracy: 5,
      altitudeAccuracy: 5,
      heading: 0,
      speed: 0,
    },
    timestamp: Date.now(),
  }),
  watchPositionAsync: jest.fn().mockReturnValue({
    remove: jest.fn(),
  }),
  Accuracy: {
    Balanced: 3,
    High: 4,
    Highest: 5,
  },
}));

// Mock expo-localization
jest.mock('expo-localization', () => ({
  getLocales: () => [{ languageCode: 'en', regionCode: 'KE' }],
  locale: 'en-KE',
}));

// Mock @maplibre/maplibre-react-native
jest.mock('@maplibre/maplibre-react-native', () => {
  const React = require('react');
  const View = require('react-native').View;
  return {
    __esModule: true,
    Map: (props: any) => React.createElement(View, { ...props, testID: 'mock-mapview' }),
    Camera: (props: any) => React.createElement(View, { ...props, testID: 'mock-camera' }),
    Marker: (props: any) => React.createElement(View, { ...props, testID: 'mock-point-annotation' }),
    GeoJSONSource: (props: any) => React.createElement(View, { ...props, testID: 'mock-shape-source' }),
    Layer: (props: any) => React.createElement(View, { ...props, testID: 'mock-line-layer' }),
  };
});
