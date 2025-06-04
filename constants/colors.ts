// Color palette for the app
export const colors = {
  primary: '#5E60CE', // Main purple
  secondary: '#64DFDF', // Teal accent
  background: '#FFFFFF',
  card: '#F8F9FA',
  text: '#212529',
  textSecondary: '#6C757D',
  border: '#E9ECEF',
  notification: '#FF5A5F',
  success: '#4BB543',
  error: '#FF3B30',
  warning: '#FFCC00',
  inactive: '#ADB5BD',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export default {
  light: {
    text: colors.text,
    background: colors.background,
    tint: colors.primary,
    tabIconDefault: colors.inactive,
    tabIconSelected: colors.primary,
    card: colors.card,
    border: colors.border,
  },
};