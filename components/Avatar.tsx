import React from 'react';
import { StyleSheet, View, Image, Text } from 'react-native';
import { colors } from '@/constants/colors';
import layout from '@/constants/layout';

interface AvatarProps {
  uri?: string;
  name?: string;
  size?: 'small' | 'medium' | 'large';
  online?: boolean;
}

export default function Avatar({
  uri,
  name,
  size = 'medium',
  online,
}: AvatarProps) {
  const getInitials = (name: string) => {
    if (!name) return '';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const sizeStyles = {
    small: {
      container: { width: 32, height: 32 },
      text: { fontSize: 12 },
      indicator: { width: 8, height: 8 },
    },
    medium: {
      container: { width: 48, height: 48 },
      text: { fontSize: 16 },
      indicator: { width: 10, height: 10 },
    },
    large: {
      container: { width: 80, height: 80 },
      text: { fontSize: 24 },
      indicator: { width: 14, height: 14 },
    },
  };

  return (
    <View style={[styles.container, sizeStyles[size].container]}>
      {uri ? (
        <Image source={{ uri }} style={styles.image} />
      ) : (
        <View style={[styles.placeholder, { backgroundColor: colors.primary }]}>
          <Text style={[styles.placeholderText, sizeStyles[size].text]}>
            {name ? getInitials(name) : '?'}
          </Text>
        </View>
      )}
      
      {online !== undefined && (
        <View
          style={[
            styles.statusIndicator,
            sizeStyles[size].indicator,
            { backgroundColor: online ? colors.success : colors.inactive },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 999,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.white,
  },
});