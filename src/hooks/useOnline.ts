import { useNetInfo } from '@react-native-community/netinfo';

export function useOnline(): { isOnline: boolean; isConnecting: boolean } {
  const netInfo = useNetInfo();

  // If isConnected is null, connection status is still resolving
  const isOnline = netInfo.isConnected !== false;
  const isConnecting = netInfo.isConnected === null;

  return { isOnline, isConnecting };
}
