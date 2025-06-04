import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, Alert, Share, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MapPin, Calendar, Clock, Users, Bookmark, Share as ShareIcon, MessageSquare, Edit, Trash2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '@/constants/colors';
import layout from '@/constants/layout';
import Button from '@/components/Button';
import { useEventsStore } from '@/store/events-store';
import { useMessagesStore } from '@/store/messages-store';
import { useAuthStore } from '@/store/auth-store';
import { formatDate, formatTime } from '@/utils/date';
import { users } from '@/mocks/users';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getEventById, isBookmarked, toggleBookmark, deleteEvent } = useEventsStore();
  const { createConversation } = useMessagesStore();
  const { user } = useAuthStore();
  
  const [event, setEvent] = useState(getEventById(id));
  const [isDeleting, setIsDeleting] = useState(false);
  
  const eventCreator = users.find((u) => u.id === event?.createdBy);
  const isCreator = user?.id === event?.createdBy;
  const bookmarked = isBookmarked(id);
  
  useEffect(() => {
    if (!event) {
      router.back();
    }
  }, [event, router]);
  
  if (!event || !user) return null;
  
  const handleToggleBookmark = () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    toggleBookmark(id);
  };
  
  const handleShare = async () => {
    try {
      await Share.share({
        title: event.title,
        message: `Check out this event: ${event.title} on ${formatDate(event.date)} at ${event.location.name}`,
      });
    } catch (error) {
      console.error('Error sharing event:', error);
    }
  };
  
  const handleMessage = async () => {
    if (!eventCreator) return;
    
    try {
      const conversation = await createConversation(
        eventCreator.id,
        `Hi, I'm interested in your event: ${event.title}`
      );
      
      router.push(`/messages/${conversation.id}`);
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };
  
  const handleEdit = () => {
    router.push(`/event/edit/${id}`);
  };
  
  const handleDelete = () => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true);
              await deleteEvent(id);
              router.back();
            } catch (error) {
              console.error('Error deleting event:', error);
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };
  
  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: event.image }} style={styles.image} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{event.title}</Text>
          
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{event.category}</Text>
          </View>
        </View>
        
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <MapPin size={20} color={colors.primary} />
            <Text style={styles.infoText}>{event.location.name}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Calendar size={20} color={colors.primary} />
            <Text style={styles.infoText}>{formatDate(event.date)}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Clock size={20} color={colors.primary} />
            <Text style={styles.infoText}>{formatTime(event.time)}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Users size={20} color={colors.primary} />
            <Text style={styles.infoText}>{event.attendees.length} attending</Text>
          </View>
        </View>
        
        {event.weather && (
          <View style={styles.weatherContainer}>
            <Text style={styles.weatherTitle}>Weather Forecast</Text>
            <Text style={styles.weatherText}>
              {event.weather.temp}°F • {event.weather.condition}
            </Text>
          </View>
        )}
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{event.description}</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <Text style={styles.locationText}>{event.location.address}</Text>
          
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapPlaceholderText}>Map View</Text>
          </View>
        </View>
        
        {eventCreator && !isCreator && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Organizer</Text>
            <View style={styles.organizerContainer}>
              {eventCreator.profileImage ? (
                <Image 
                  source={{ uri: eventCreator.profileImage }} 
                  style={styles.organizerImage} 
                />
              ) : (
                <View style={styles.organizerImagePlaceholder}>
                  <Text style={styles.organizerImagePlaceholderText}>
                    {eventCreator.username.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              
              <View style={styles.organizerInfo}>
                <Text style={styles.organizerName}>{eventCreator.username}</Text>
                {eventCreator.bio && (
                  <Text style={styles.organizerBio} numberOfLines={2}>
                    {eventCreator.bio}
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}
        
        <View style={styles.actionsContainer}>
          {isCreator ? (
            <>
              <Button
                title="Edit Event"
                onPress={handleEdit}
                icon={<Edit size={18} color={colors.primary} />}
                variant="outline"
                style={styles.actionButton}
              />
              
              <Button
                title="Delete Event"
                onPress={handleDelete}
                icon={<Trash2 size={18} color={colors.white} />}
                variant="secondary"
                style={[styles.actionButton, { backgroundColor: colors.error }]}
                loading={isDeleting}
              />
            </>
          ) : (
            <>
              <Button
                title="Attend Event"
                onPress={() => {}}
                style={styles.attendButton}
              />
              
              <View style={styles.secondaryActions}>
                <TouchableOpacity 
                  style={styles.iconButton}
                  onPress={handleToggleBookmark}
                >
                  <Bookmark 
                    size={24} 
                    color={bookmarked ? colors.primary : colors.textSecondary} 
                    fill={bookmarked ? colors.primary : 'transparent'} 
                  />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.iconButton}
                  onPress={handleShare}
                >
                  <ShareIcon size={24} color={colors.textSecondary} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.iconButton}
                  onPress={handleMessage}
                >
                  <MessageSquare size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  image: {
    width: '100%',
    height: 250,
  },
  content: {
    padding: layout.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: layout.spacing.m,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
    marginRight: layout.spacing.m,
  },
  categoryBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: layout.spacing.m,
    paddingVertical: layout.spacing.xs,
    borderRadius: layout.borderRadius.small,
  },
  categoryText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 12,
  },
  infoContainer: {
    backgroundColor: colors.card,
    borderRadius: layout.borderRadius.medium,
    padding: layout.spacing.m,
    marginBottom: layout.spacing.l,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: layout.spacing.s,
  },
  infoText: {
    marginLeft: layout.spacing.m,
    fontSize: 16,
    color: colors.text,
  },
  weatherContainer: {
    backgroundColor: colors.card,
    borderRadius: layout.borderRadius.medium,
    padding: layout.spacing.m,
    marginBottom: layout.spacing.l,
  },
  weatherTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: layout.spacing.xs,
  },
  weatherText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: layout.spacing.l,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: layout.spacing.s,
  },
  description: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  locationText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: layout.spacing.m,
  },
  mapPlaceholder: {
    height: 150,
    backgroundColor: colors.card,
    borderRadius: layout.borderRadius.medium,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  organizerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  organizerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  organizerImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  organizerImagePlaceholderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
  },
  organizerInfo: {
    marginLeft: layout.spacing.m,
    flex: 1,
  },
  organizerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  organizerBio: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  actionsContainer: {
    marginTop: layout.spacing.m,
  },
  attendButton: {
    marginBottom: layout.spacing.m,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  iconButton: {
    padding: layout.spacing.m,
  },
  actionButton: {
    marginBottom: layout.spacing.m,
  },
});