import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Clock, Bus, MapPin, Search as SearchIcon, X } from 'lucide-react-native';
import { searchTransit, searchQueryKeys } from '@/api/endpoints/search';
import type { RouteSearchResult } from '@/api/schemas/search';
import type { Stop } from '@/api/schemas/stops';
import { useDebounce } from '@/hooks/useDebounce';
import { useSearchStore } from '@/stores/searchStore';
import { useAppTheme } from '@/theme';

export const SearchScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const router = useRouter();

  const [inputQuery, setInputQuery] = useState<string>('');
  const debouncedQuery = useDebounce(inputQuery, 400);

  const { recentSearches, addRecentSearch, clearRecentSearches } = useSearchStore();

  const shouldFetch = debouncedQuery.trim().length >= 2;

  const { data, isLoading } = useQuery({
    queryKey: searchQueryKeys.query(debouncedQuery),
    queryFn: ({ signal }) => searchTransit(debouncedQuery, signal),
    enabled: shouldFetch,
  });

  const handleSelectRecent = (term: string) => {
    setInputQuery(term);
  };

  const handleSelectStop = (stop: Stop) => {
    addRecentSearch(stop.name);
    router.push(`/stop/${encodeURIComponent(stop.id)}`);
  };

  const handleSelectRoute = (route: RouteSearchResult) => {
    addRecentSearch(`${route.shortName} - ${route.longName}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View
        style={[
          styles.searchHeader,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.surfaceBorder },
        ]}
      >
        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: theme.colors.surfaceSecondary,
              borderColor: theme.colors.surfaceBorder,
            },
          ]}
        >
          <SearchIcon size={18} color={theme.colors.textMuted} />
          <TextInput
            style={[styles.input, { color: theme.colors.textPrimary }]}
            placeholder={t('search.placeholder')}
            placeholderTextColor={theme.colors.textMuted}
            value={inputQuery}
            onChangeText={setInputQuery}
            autoFocus={false}
            accessibilityLabel="Search transit query"
            testID="search-text-input"
          />
          {inputQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setInputQuery('')}
              accessibilityRole="button"
              accessibilityLabel="Clear search input"
            >
              <X size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isLoading && (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      )}

      {!shouldFetch && (
        <View style={styles.recentsSection}>
          <View style={styles.recentsHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
              {t('search.recentSearches')}
            </Text>
            {recentSearches.length > 0 && (
              <TouchableOpacity onPress={clearRecentSearches} accessibilityRole="button">
                <Text style={[styles.clearBtn, { color: theme.colors.primary }]}>
                  {t('search.clearRecents')}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            data={recentSearches}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.recentItem, { borderBottomColor: theme.colors.surfaceBorder }]}
                onPress={() => handleSelectRecent(item)}
                accessibilityRole="button"
                accessibilityLabel={`Recent search: ${item}`}
              >
                <Clock size={16} color={theme.colors.textMuted} />
                <Text style={[styles.recentText, { color: theme.colors.textPrimary }]}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {shouldFetch && data && (
        <FlatList
          data={[]}
          renderItem={() => null}
          ListHeaderComponent={
            <View style={styles.resultsContainer}>
              {data.stops.length > 0 && (
                <View style={styles.group}>
                  <Text style={[styles.groupTitle, { color: theme.colors.textSecondary }]}>
                    {t('search.stopsGroup')}
                  </Text>
                  {data.stops.map((stop) => (
                    <TouchableOpacity
                      key={stop.id}
                      style={[
                        styles.resultRow,
                        {
                          backgroundColor: theme.colors.surface,
                          borderColor: theme.colors.surfaceBorder,
                        },
                      ]}
                      onPress={() => handleSelectStop(stop)}
                      accessibilityRole="button"
                      accessibilityLabel={`Stop result: ${stop.name}`}
                    >
                      <MapPin size={18} color={theme.colors.primary} />
                      <Text style={[styles.resultName, { color: theme.colors.textPrimary }]}>
                        {stop.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {data.routes.length > 0 && (
                <View style={styles.group}>
                  <Text style={[styles.groupTitle, { color: theme.colors.textSecondary }]}>
                    {t('search.routesGroup')}
                  </Text>
                  {data.routes.map((route) => (
                    <TouchableOpacity
                      key={route.id}
                      style={[
                        styles.resultRow,
                        {
                          backgroundColor: theme.colors.surface,
                          borderColor: theme.colors.surfaceBorder,
                        },
                      ]}
                      onPress={() => handleSelectRoute(route)}
                      accessibilityRole="button"
                      accessibilityLabel={`Route result: ${route.shortName} ${route.longName}`}
                    >
                      <Bus size={18} color="#0284C7" />
                      <View style={styles.routeDetails}>
                        <Text style={[styles.routeShort, { color: theme.colors.textPrimary }]}>
                          {route.shortName}
                        </Text>
                        <Text style={[styles.routeLong, { color: theme.colors.textSecondary }]}>
                          {route.longName}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {data.stops.length === 0 && data.routes.length === 0 && (
                <View style={styles.centerLoading}>
                  <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
                    {t('search.noResults')}
                  </Text>
                </View>
              )}
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchHeader: {
    padding: 16,
    borderBottomWidth: 1,
  },
  inputWrapper: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
  },
  centerLoading: {
    padding: 24,
    alignItems: 'center',
  },
  recentsSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  recentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  clearBtn: {
    fontSize: 12,
    fontWeight: '600',
  },
  recentItem: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  recentText: {
    fontSize: 14,
  },
  resultsContainer: {
    padding: 16,
    gap: 20,
  },
  group: {
    gap: 8,
  },
  groupTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  resultRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
  },
  resultName: {
    fontSize: 14,
    fontWeight: '600',
  },
  routeDetails: {
    flex: 1,
  },
  routeShort: {
    fontSize: 14,
    fontWeight: '700',
  },
  routeLong: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
