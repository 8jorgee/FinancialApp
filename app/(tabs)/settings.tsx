import React from 'react';
import { StyleSheet, Text, View, ScrollView, Switch, TouchableOpacity, Alert, Platform } from 'react-native';
import { Bell, BellOff, Volume2, VolumeX, Vibrate, MapPin, LogOut } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import layout from '@/constants/layout';
import { useNotificationStore } from '@/store/notifications-store';
import { useAuthStore } from '@/store/auth-store';
import { notificationService } from '@/services/notifications';

export default function SettingsScreen() {
  const { settings, updateSettings } = useNotificationStore();
  const { logout } = useAuthStore();

  const handleToggleSetting = (key: keyof typeof settings, value: boolean | number) => {
    updateSettings({ [key]: value });
  };

  const handleTestNotification = async () => {
    try {
      await notificationService.scheduleLocalNotification({
        type: 'event',
        title: 'Test Notification',
        body: 'This is a test notification to verify everything is working!',
      });
      
      Alert.alert('Success', 'Test notification sent!');
    } catch (error) {
      console.error('Test notification error:', error);
      Alert.alert('Info', 'Test notification triggered (check console for details)');
    }
  };

  const handleClearNotifications = async () => {
    try {
      await notificationService.cancelAllNotifications();
      await notificationService.setBadgeCount(0);
      Alert.alert('Success', 'All notifications cleared!');
    } catch (error) {
      console.error('Clear notifications error:', error);
      Alert.alert('Info', 'Notification clear triggered (check console for details)');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: logout 
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        {Platform.OS === 'web' && (
          <Text style={styles.webNotice}>
            Note: Some features are limited on web platform
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Bell size={20} color={colors.primary} />
            <Text style={styles.settingLabel}>Event Notifications</Text>
          </View>
          <Switch
            value={settings.eventsEnabled}
            onValueChange={(value) => handleToggleSetting('eventsEnabled', value)}
            trackColor={{ false: colors.inactive, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <BellOff size={20} color={colors.primary} />
            <Text style={styles.settingLabel}>Message Notifications</Text>
          </View>
          <Switch
            value={settings.messagesEnabled}
            onValueChange={(value) => handleToggleSetting('messagesEnabled', value)}
            trackColor={{ false: colors.inactive, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Volume2 size={20} color={colors.primary} />
            <Text style={styles.settingLabel}>Sound</Text>
          </View>
          <Switch
            value={settings.soundEnabled}
            onValueChange={(value) => handleToggleSetting('soundEnabled', value)}
            trackColor={{ false: colors.inactive, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>

        {Platform.OS !== 'web' && (
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Vibrate size={20} color={colors.primary} />
              <Text style={styles.settingLabel}>Vibration</Text>
            </View>
            <Switch
              value={settings.vibrationEnabled}
              onValueChange={(value) => handleToggleSetting('vibrationEnabled', value)}
              trackColor={{ false: colors.inactive, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
        )}

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <MapPin size={20} color={colors.primary} />
            <View>
              <Text style={styles.settingLabel}>Nearby Events Radius</Text>
              <Text style={styles.settingDescription}>{settings.nearbyEventsRadius} km</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notification Actions</Text>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleTestNotification}>
          <Text style={styles.actionButtonText}>Send Test Notification</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleClearNotifications}>
          <Text style={styles.actionButtonText}>Clear All Notifications</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.logoutButton]} 
          onPress={handleLogout}
        >
          <LogOut size={20} color={colors.white} />
          <Text style={[styles.actionButtonText, styles.logoutButtonText]}>Logout</Text>
        </TouchableOpacity>
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
    paddingHorizontal: layout.spacing.xl,
    paddingTop: layout.spacing.xl,
    paddingBottom: layout.spacing.m,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  webNotice: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: layout.spacing.xs,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: layout.spacing.xl,
    paddingHorizontal: layout.spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: layout.spacing.m,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: layout.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: colors.text,
    marginLeft: layout.spacing.m,
  },
  settingDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: layout.spacing.m,
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingVertical: layout.spacing.m,
    paddingHorizontal: layout.spacing.l,
    borderRadius: layout.borderRadius.medium,
    marginBottom: layout.spacing.s,
    alignItems: 'center',
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: colors.error,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  logoutButtonText: {
    marginLeft: layout.spacing.s,
  },
});