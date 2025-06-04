import * as Location from 'expo-location';
import { Platform } from 'react-native';

export const getLocation = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      return {
        error: 'Permission to access location was denied',
      };
    }

    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;

    // Get address from coordinates
    const address = await reverseGeocode(latitude, longitude);

    return {
      latitude,
      longitude,
      name: address,
    };
  } catch (error) {
    return {
      error: 'Could not fetch location',
    };
  }
};

export const reverseGeocode = async (latitude: number, longitude: number) => {
  try {
    if (Platform.OS === 'web') {
      return 'Current Location';
    }
    
    const result = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (result.length > 0) {
      const { city, region } = result[0];
      return `${city}, ${region}`;
    }
    
    return 'Unknown Location';
  } catch (error) {
    return 'Unknown Location';
  }
};

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};