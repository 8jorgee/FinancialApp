import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Calendar, Clock, MapPin, Image as ImageIcon } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import layout from '@/constants/layout';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { useEventsStore } from '@/store/events-store';
import { useAuthStore } from '@/store/auth-store';
import { categories } from '@/mocks/events';
import { getLocation } from '@/utils/location';

export default function CreateEventScreen() {
  const router = useRouter();
  const { createEvent } = useEventsStore();
  const { user } = useAuthStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [locationName, setLocationName] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  if (!user) return null;
  
  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'You need to grant permission to access your photos');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
        const newErrors = { ...formErrors };
        delete newErrors.image;
        setFormErrors(newErrors);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };
  
  const handleUseCurrentLocation = async () => {
    try {
      const location = await getLocation();
      
      if (location.error) {
        Alert.alert('Location Error', location.error);
        return;
      }
      
      if (location.name) {
        setLocationName(location.name);
        const newErrors = { ...formErrors };
        delete newErrors.locationName;
        setFormErrors(newErrors);
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!title) newErrors.title = 'Title is required';
    if (!description) newErrors.description = 'Description is required';
    if (!date) newErrors.date = 'Date is required';
    if (!time) newErrors.time = 'Time is required';
    if (!locationName) newErrors.locationName = 'Location name is required';
    if (!address) newErrors.address = 'Address is required';
    if (!category) newErrors.category = 'Category is required';
    if (!image) newErrors.image = 'Image is required';
    
    // Validate date format (YYYY-MM-DD)
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      newErrors.date = 'Date must be in YYYY-MM-DD format';
    }
    
    // Validate time format (HH:MM)
    if (time && !/^\d{2}:\d{2}$/.test(time)) {
      newErrors.time = 'Time must be in HH:MM format';
    }
    
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleCreateEvent = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // For demo purposes, we'll use fixed coordinates
      const eventData = {
        title,
        description,
        date,
        time,
        location: {
          name: locationName,
          address,
          latitude: 37.7749,
          longitude: -122.4194,
        },
        category,
        image: image || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4',
        createdBy: user.id,
        attendees: [user.id],
        weather: {
          temp: 72,
          condition: 'Sunny',
          icon: 'clear-day',
        },
      };
      
      await createEvent(eventData);
      router.back();
    } catch (error) {
      console.error('Error creating event:', error);
      Alert.alert('Error', 'Failed to create event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateErrors = (field: string, value: string) => {
    if (value) {
      const newErrors = { ...formErrors };
      delete newErrors[field];
      setFormErrors(newErrors);
    }
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Create New Event</Text>
        
        <Input
          label="Event Title"
          placeholder="Enter event title"
          value={title}
          onChangeText={(text) => {
            setTitle(text);
            updateErrors('title', text);
          }}
          error={formErrors.title}
        />
        
        <Input
          label="Description"
          placeholder="Describe your event"
          value={description}
          onChangeText={(text) => {
            setDescription(text);
            updateErrors('description', text);
          }}
          multiline
          numberOfLines={4}
          style={styles.textArea}
          error={formErrors.description}
        />
        
        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Input
              label="Date"
              placeholder="YYYY-MM-DD"
              value={date}
              onChangeText={(text) => {
                setDate(text);
                updateErrors('date', text);
              }}
              leftIcon={<Calendar size={20} color={colors.textSecondary} />}
              error={formErrors.date}
            />
          </View>
          
          <View style={styles.halfInput}>
            <Input
              label="Time"
              placeholder="HH:MM"
              value={time}
              onChangeText={(text) => {
                setTime(text);
                updateErrors('time', text);
              }}
              leftIcon={<Clock size={20} color={colors.textSecondary} />}
              error={formErrors.time}
            />
          </View>
        </View>
        
        <Input
          label="Location Name"
          placeholder="Enter venue name"
          value={locationName}
          onChangeText={(text) => {
            setLocationName(text);
            updateErrors('locationName', text);
          }}
          leftIcon={<MapPin size={20} color={colors.textSecondary} />}
          error={formErrors.locationName}
        />
        
        <View style={styles.locationRow}>
          <Button
            title="Use Current Location"
            onPress={handleUseCurrentLocation}
            variant="outline"
            size="small"
          />
        </View>
        
        <Input
          label="Address"
          placeholder="Enter full address"
          value={address}
          onChangeText={(text) => {
            setAddress(text);
            updateErrors('address', text);
          }}
          error={formErrors.address}
        />
        
        <Text style={styles.label}>Category</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.filter(c => c !== 'All').map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryButton,
                category === cat && styles.selectedCategory,
              ]}
              onPress={() => {
                setCategory(cat);
                updateErrors('category', cat);
              }}
            >
              <Text
                style={[
                  styles.categoryText,
                  category === cat && styles.selectedCategoryText,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {formErrors.category ? (
          <Text style={styles.errorText}>{formErrors.category}</Text>
        ) : null}
        
        <Text style={styles.label}>Event Image</Text>
        <TouchableOpacity 
          style={styles.imagePickerButton}
          onPress={handlePickImage}
        >
          {image ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: image }} style={styles.imagePreview} />
            </View>
          ) : (
            <View style={styles.imagePickerContent}>
              <ImageIcon size={24} color={colors.textSecondary} />
              <Text style={styles.imagePickerText}>Tap to select an image</Text>
            </View>
          )}
        </TouchableOpacity>
        {formErrors.image ? (
          <Text style={styles.errorText}>{formErrors.image}</Text>
        ) : null}
        
        <View style={styles.buttonsContainer}>
          <Button
            title="Cancel"
            onPress={() => router.back()}
            variant="outline"
            style={styles.button}
          />
          
          <Button
            title="Create Event"
            onPress={handleCreateEvent}
            loading={isLoading}
            style={styles.button}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: layout.spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: layout.spacing.xl,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  locationRow: {
    marginTop: -layout.spacing.s,
    marginBottom: layout.spacing.m,
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: layout.spacing.xs,
  },
  categoriesContainer: {
    flexDirection: 'row',
    marginBottom: layout.spacing.m,
  },
  categoryButton: {
    paddingHorizontal: layout.spacing.m,
    paddingVertical: layout.spacing.s,
    borderRadius: layout.borderRadius.medium,
    backgroundColor: colors.card,
    marginRight: layout.spacing.s,
  },
  selectedCategory: {
    backgroundColor: colors.primary,
  },
  categoryText: {
    color: colors.textSecondary,
  },
  selectedCategoryText: {
    color: colors.white,
    fontWeight: '500',
  },
  imagePickerButton: {
    height: 200,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.borderRadius.medium,
    marginBottom: layout.spacing.m,
    overflow: 'hidden',
  },
  imagePickerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePickerText: {
    marginTop: layout.spacing.s,
    color: colors.textSecondary,
  },
  imagePreviewContainer: {
    flex: 1,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
    marginBottom: layout.spacing.m,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: layout.spacing.m,
  },
  button: {
    flex: 1,
    marginHorizontal: layout.spacing.xs,
  },
});