import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, Calendar, Clock, Users } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import layout from '@/constants/layout';
import { Event } from '@/types';
import { formatDate, formatTime } from '@/utils/date';

interface EventCardProps {
  event: Event;
  compact?: boolean;
}

export default function EventCard({ event, compact = false }: EventCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/event/${event.id}`);
  };

  if (compact) {
    return (
      <TouchableOpacity 
        style={styles.compactContainer} 
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Image 
          source={{ uri: event.image }} 
          style={styles.compactImage} 
        />
        <View style={styles.compactContent}>
          <Text style={styles.compactTitle} numberOfLines={1}>{event.title}</Text>
          <View style={styles.compactInfo}>
            <MapPin size={12} color={colors.textSecondary} />
            <Text style={styles.compactInfoText} numberOfLines={1}>{event.location.name}</Text>
          </View>
          <View style={styles.compactInfo}>
            <Calendar size={12} color={colors.textSecondary} />
            <Text style={styles.compactInfoText}>{formatDate(event.date)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <Image 
        source={{ uri: event.image }} 
        style={styles.image} 
      />
      <View style={styles.categoryBadge}>
        <Text style={styles.categoryText}>{event.category}</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>{event.title}</Text>
        
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <MapPin size={16} color={colors.primary} />
            <Text style={styles.infoText} numberOfLines={1}>{event.location.name}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Calendar size={16} color={colors.primary} />
            <Text style={styles.infoText}>{formatDate(event.date)}</Text>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Clock size={16} color={colors.primary} />
            <Text style={styles.infoText}>{formatTime(event.time)}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Users size={16} color={colors.primary} />
            <Text style={styles.infoText}>{event.attendees.length} attending</Text>
          </View>
        </View>
        
        {event.weather && (
          <View style={styles.weatherContainer}>
            <Text style={styles.weatherText}>
              {event.weather.temp}°F • {event.weather.condition}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: layout.borderRadius.medium,
    overflow: 'hidden',
    marginBottom: layout.spacing.m,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 180,
  },
  categoryBadge: {
    position: 'absolute',
    top: layout.spacing.m,
    right: layout.spacing.m,
    backgroundColor: colors.primary,
    paddingHorizontal: layout.spacing.s,
    paddingVertical: layout.spacing.xs,
    borderRadius: layout.borderRadius.small,
  },
  categoryText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: layout.spacing.m,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: layout.spacing.s,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: layout.spacing.s,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoText: {
    marginLeft: layout.spacing.xs,
    color: colors.textSecondary,
    fontSize: 14,
  },
  weatherContainer: {
    marginTop: layout.spacing.xs,
    backgroundColor: colors.card,
    paddingHorizontal: layout.spacing.s,
    paddingVertical: layout.spacing.xs,
    borderRadius: layout.borderRadius.small,
    alignSelf: 'flex-start',
  },
  weatherText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: layout.borderRadius.medium,
    overflow: 'hidden',
    marginBottom: layout.spacing.s,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  compactImage: {
    width: 80,
    height: 80,
  },
  compactContent: {
    flex: 1,
    padding: layout.spacing.s,
    justifyContent: 'center',
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: layout.spacing.xs,
  },
  compactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  compactInfoText: {
    marginLeft: 4,
    color: colors.textSecondary,
    fontSize: 12,
  },
});