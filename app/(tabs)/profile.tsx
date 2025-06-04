import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { LogOut, Settings, Edit, MapPin, Mail, Calendar, Camera } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import layout from '@/constants/layout';
import Button from '@/components/Button';
import { useAuthStore } from '@/store/auth-store';
import { useEventsStore } from '@/store/events-store';
import { formatDate } from '@/utils/date';
import { currentUser } from '@/mocks/users';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, updateProfile } = useAuthStore();
  const { events } = useEventsStore();
  
  const [isLoading, setIsLoading] = useState(false);
  
  const userEvents = events.filter((event) => event.createdBy === currentUser.id);
  
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: () => logout(),
          style: 'destructive',
        },
      ]
    );
  };

  const handleEditProfile = () => {
    try {
      router.push('/profile/edit');
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Error', 'Could not navigate to edit profile');
    }
  };

  const handleSettings = () => {
    try {
      router.push('/(tabs)/settings');
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Error', 'Could not navigate to settings');
    }
  };
  
  const handlePickImage = async () => {
    try {
      if (Platform.OS === 'web') {
        Alert.alert('Not Available', 'Image picker is not available on web');
        return;
      }

      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'You need to grant permission to access your photos');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIsLoading(true);
        
        // In a real app, you would upload the image to a server
        // For this demo, we'll just update the profile with the local URI
        await updateProfile({ profileImage: result.assets[0].uri });
        
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
      setIsLoading(false);
    }
  };
  
  if (!user) return null;
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          {user.profileImage ? (
            <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Text style={styles.profileImagePlaceholderText}>
                {user.username.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          
          <TouchableOpacity 
            style={styles.editImageButton}
            onPress={handlePickImage}
          >
            <Camera size={16} color={colors.white} />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.username}>{user.username}</Text>
        
        {user.bio && <Text style={styles.bio}>{user.bio}</Text>}
        
        <View style={styles.infoContainer}>
          {user.location && (
            <View style={styles.infoItem}>
              <MapPin size={16} color={colors.primary} />
              <Text style={styles.infoText}>{user.location.name}</Text>
            </View>
          )}
          
          <View style={styles.infoItem}>
            <Mail size={16} color={colors.primary} />
            <Text style={styles.infoText}>{user.email}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Calendar size={16} color={colors.primary} />
            <Text style={styles.infoText}>Joined {formatDate(user.createdAt)}</Text>
          </View>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userEvents.length}</Text>
            <Text style={styles.statLabel}>Events</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {userEvents.reduce((total, event) => total + event.attendees.length, 0)}
            </Text>
            <Text style={styles.statLabel}>Attendees</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity style={styles.menuItem} onPress={handleEditProfile}>
          <Edit size={20} color={colors.primary} />
          <Text style={styles.menuItemText}>Edit Profile</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem} onPress={handleSettings}>
          <Settings size={20} color={colors.primary} />
          <Text style={styles.menuItemText}>Settings</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.menuItem, styles.logoutMenuItem]}
          onPress={handleLogout}
        >
          <LogOut size={20} color={colors.error} />
          <Text style={[styles.menuItemText, styles.logoutText]}>Logout</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Events</Text>
        
        {userEvents.length === 0 ? (
          <View style={styles.emptyEventsContainer}>
            <Text style={styles.emptyEventsText}>You haven't created any events yet</Text>
            <Button
              title="Create Event"
              onPress={() => router.push('/event/create')}
              variant="outline"
              style={styles.createEventButton}
            />
          </View>
        ) : (
          <Text style={styles.eventCount}>
            You have created {userEvents.length} {userEvents.length === 1 ? 'event' : 'events'}
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    paddingVertical: layout.spacing.xl,
    paddingHorizontal: layout.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: layout.spacing.m,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImagePlaceholderText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.white,
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: layout.spacing.xs,
  },
  bio: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: layout.spacing.m,
  },
  infoContainer: {
    width: '100%',
    marginBottom: layout.spacing.l,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: layout.spacing.s,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: layout.spacing.s,
  },
  statsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    paddingVertical: layout.spacing.m,
    backgroundColor: colors.card,
    borderRadius: layout.borderRadius.medium,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: colors.border,
  },
  section: {
    padding: layout.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: layout.spacing.m,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: layout.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: layout.spacing.m,
  },
  logoutMenuItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: colors.error,
  },
  emptyEventsContainer: {
    alignItems: 'center',
    paddingVertical: layout.spacing.l,
  },
  emptyEventsText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: layout.spacing.m,
  },
  createEventButton: {
    marginTop: layout.spacing.s,
  },
  eventCount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});