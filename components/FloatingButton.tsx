import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Plus } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import layout from '@/constants/layout';

interface FloatingButtonProps {
  onPress: () => void;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export default function FloatingButton({
  onPress,
  icon,
  style,
}: FloatingButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {icon || <Plus size={24} color={colors.white} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: layout.spacing.xl,
    right: layout.spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
});