import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useEventsStore } from '@/store/events-store';
import { colors } from '@/constants/colors';
import layout from '@/constants/layout';
import SearchBar from '@/components/SearchBar';
import CategoryFilter from '@/components/CategoryFilter';
import EventCard from '@/components/EventCard';
import { categories } from '@/mocks/events';
import { getLocation } from '@/utils/location';
import { Event } from '@/types';

export default function ExploreScreen() {
  const { events, isLoading, fetchEvents } = useEventsStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  
  useEffect(() => {
    const loadLocation = async () => {
      const location = await getLocation();
      if (!location.error && location.latitude && location.longitude) {
        setUserLocation({
          latitude: location.latitude,
          longitude: location.longitude,
        });
      }
    };
    
    loadLocation();
  }, []);
  
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  };
  
  const filterEvents = () => {
    return events.filter((event) => {
      // Filter by search query
      const matchesSearch = 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by category
      const matchesCategory = 
        selectedCategory === 'All' || event.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  };
  
  // Sort events by category
  const groupEventsByCategory = (events: Event[]) => {
    const groupedEvents: Record<string, Event[]> = {};
    
    events.forEach((event) => {
      if (!groupedEvents[event.category]) {
        groupedEvents[event.category] = [];
      }
      groupedEvents[event.category].push(event);
    });
    
    return Object.entries(groupedEvents).map(([category, events]) => ({
      category,
      events,
    }));
  };
  
  const filteredEvents = filterEvents();
  const groupedEvents = groupEventsByCategory(filteredEvents);
  
  return (
    <View style={styles.container}>
      <FlatList
        data={groupedEvents}
        keyExtractor={(item) => item.category}
        renderItem={({ item }) => (
          <View style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{item.category}</Text>
            <FlatList
              horizontal
              data={item.events}
              keyExtractor={(event) => event.id}
              renderItem={({ item: event }) => (
                <View style={styles.eventCardContainer}>
                  <EventCard event={event} />
                </View>
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>
        )}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.title}>Explore Events</Text>
              <Text style={styles.subtitle}>Discover events by category</Text>
            </View>
            
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search events..."
            />
            
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </>
        }
        ListEmptyComponent={
          isLoading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No events found</Text>
              <Text style={styles.emptyText}>
                {searchQuery || selectedCategory !== 'All'
                  ? 'Try changing your search or category filter'
                  : 'Check back later for new events'}
              </Text>
            </View>
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: layout.spacing.xl,
    paddingTop: layout.spacing.xl,
    paddingBottom: layout.spacing.m,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: layout.spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  categorySection: {
    marginTop: layout.spacing.l,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: layout.spacing.m,
    paddingHorizontal: layout.spacing.xl,
  },
  horizontalList: {
    paddingHorizontal: layout.spacing.m,
  },
  eventCardContainer: {
    width: 300,
    marginRight: layout.spacing.m,
  },
  loadingContainer: {
    padding: layout.spacing.xl,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: layout.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: layout.spacing.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: layout.spacing.s,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});