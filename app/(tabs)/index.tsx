import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import layout from '@/constants/layout';
import { useAuthStore } from '@/store/auth-store';
import { useEventsStore } from '@/store/events-store';
import { Event } from '@/types';
import { getLocation } from '@/utils/location';
import { isToday, isUpcoming } from '@/utils/date';
import EventCard from '@/components/EventCard';
import SearchBar from '@/components/SearchBar';
import CategoryFilter from '@/components/CategoryFilter';
import FloatingButton from '@/components/FloatingButton';
import { categories } from '@/mocks/events';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { events, isLoading, fetchEvents } = useEventsStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [userLocation, setUserLocation] = useState<string | null>(null);
  
  useEffect(() => {
    const loadLocation = async () => {
      const location = await getLocation();
      if (!location.error && location.name) {
        setUserLocation(location.name);
      }
    };
    
    loadLocation();
  }, []);
  
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  };
  
  const handleCreateEvent = () => {
    router.push('/event/create');
  };
  
  const filterEvents = (events: Event[]) => {
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
  
  const todayEvents = filterEvents(events).filter((event) => isToday(event.date));
  const upcomingEvents = filterEvents(events).filter((event) => isUpcoming(event.date) && !isToday(event.date));
  
  return (
    <View style={styles.container}>
      <FlatList
        data={[]}
        renderItem={null}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>Hello, {user?.username || 'there'}!</Text>
                {userLocation && (
                  <View style={styles.locationContainer}>
                    <MapPin size={14} color={colors.primary} />
                    <Text style={styles.location}>{userLocation}</Text>
                  </View>
                )}
              </View>
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
            
            {isLoading && !refreshing ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : (
              <>
                {todayEvents.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Today</Text>
                    {todayEvents.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </View>
                )}
                
                {upcomingEvents.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Upcoming</Text>
                    {upcomingEvents.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </View>
                )}
                
                {todayEvents.length === 0 && upcomingEvents.length === 0 && (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyTitle}>No events found</Text>
                    <Text style={styles.emptyText}>
                      {searchQuery || selectedCategory !== 'All'
                        ? 'Try changing your search or category filter'
                        : 'Create your first event or check back later'}
                    </Text>
                  </View>
                )}
              </>
            )}
          </>
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
      
      <FloatingButton onPress={handleCreateEvent} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: layout.spacing.xl,
    paddingTop: layout.spacing.xl,
    paddingBottom: layout.spacing.m,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: layout.spacing.xs,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  section: {
    marginTop: layout.spacing.l,
    paddingHorizontal: layout.spacing.m,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: layout.spacing.m,
    paddingHorizontal: layout.spacing.s,
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