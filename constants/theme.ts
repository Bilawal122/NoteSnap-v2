// Theme configuration for NoteSnap AI
// Minimalist, warm earthy palette - natural and organic feel

export const Colors = {
  // Primary palette (warm & natural)
  cream: '#faf3dd',        // Light background
  sage: '#c8d5b9',         // Soft green accent
  seafoam: '#8fc0a9',      // Primary accent
  teal: '#68b0ab',         // Secondary accent
  slate: '#696d7d',        // Text/neutral

  // Backgrounds
  background: '#faf3dd',
  backgroundDark: '#f4ecd2',
  card: '#ffffff',

  // Text
  textPrimary: '#2d2d2d',
  textSecondary: '#696d7d',
  textMuted: '#9ca3af',

  // Borders & dividers
  border: 'rgba(105, 109, 125, 0.15)',
  divider: 'rgba(105, 109, 125, 0.1)',

  // Accents
  accent: '#68b0ab',
  accentLight: '#8fc0a9',
  accentSoft: 'rgba(104, 176, 171, 0.1)',

  // Status
  success: '#6bb77b',
  warning: '#e5a84b',
  error: '#d96459',
  info: '#68b0ab',

  // UI elements
  white: '#ffffff',
  black: '#1a1a1a',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Typography = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,

  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    lg: 17,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 34,
  },

  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.6,
  },
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
};

export default { Colors, Spacing, BorderRadius, Typography, Shadows };
