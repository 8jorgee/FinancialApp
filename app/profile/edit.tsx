import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { User, Mail, MapPin, FileText } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import layout from '@/constants/layout';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { useAuthStore } from '@/store/auth-store';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateProfile, isLoading } = useAuthStore();
  
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [locationName, setLocationName] = useState(user?.location?.name || '');
  
  if (!user) {
    router.back();
    return null;
  }
  
  const handleSave = async () => {
    try {
      await updateProfile({
        username,
        email,
        bio,
        location: locationName ? {
          ...user.location,
          name: locationName,
        } : user.location,
      });
      
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };
  
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Edit Profile',
          headerRight: () => (
            <Button
              title="Save"
              onPress={handleSave}
              loading={isLoading}
              size="small"
              variant="text"
            />
          ),
        }}
      />
      
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Edit Your Profile</Text>
          
          <Input
            label="Username"
            placeholder="Enter your username"
            value={username}
            onChangeText={setUsername}
            leftIcon={<User size={20} color={colors.textSecondary} />}
          />
          
          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Mail size={20} color={colors.textSecondary} />}
          />
          
          <Input
            label="Bio"
            placeholder="Tell us about yourself"
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={3}
            style={styles.textArea}
            leftIcon={<FileText size={20} color={colors.textSecondary} />}
          />
          
          <Input
            label="Location"
            placeholder="Enter your location"
            value={locationName}
            onChangeText={setLocationName}
            leftIcon={<MapPin size={20} color={colors.textSecondary} />}
          />
          
          <View style={styles.buttonsContainer}>
            <Button
              title="Cancel"
              onPress={() => router.back()}
              variant="outline"
              style={styles.button}
            />
            
            <Button
              title="Save Changes"
              onPress={handleSave}
              loading={isLoading}
              style={styles.button}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
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
    height: 80,
    textAlignVertical: 'top',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: layout.spacing.xl,
  },
  button: {
    flex: 1,
    marginHorizontal: layout.spacing.xs,
  },
});