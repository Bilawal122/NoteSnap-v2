// Theme configuration for NoteSnap AI
// Modern, vibrant, lively palette with gradients and depth
// Supports Light and Dark modes

// Light Mode Colors
export const LightColors = {
  // Primary palette - vibrant and modern
  primary: '#6366f1',        // Indigo - main brand
  primaryLight: '#818cf8',   // Light indigo
  primaryDark: '#4f46e5',    // Dark indigo

  secondary: '#8b5cf6',      // Violet
  secondaryLight: '#a78bfa', // Light violet

  // Accent colors - pop colors
  coral: '#f472b6',          // Pink coral
  orange: '#fb923c',         // Warm orange
  teal: '#14b8a6',           // Bright teal
  emerald: '#10b981',        // Emerald green

  // Backgrounds - clean with subtle warmth
  background: '#fafafa',     // Off-white
  backgroundDark: '#f4f4f5', // Subtle gray
  card: '#ffffff',
  cardElevated: '#ffffff',

  // Text
  textPrimary: '#18181b',    // Almost black
  textSecondary: '#52525b',  // Dark gray
  textMuted: '#a1a1aa',      // Muted gray
  textOnPrimary: '#ffffff',  // White on colored

  // Borders & dividers
  border: 'rgba(0, 0, 0, 0.08)',
  divider: 'rgba(0, 0, 0, 0.05)',

  // Accents - matching primary
  accent: '#6366f1',
  accentLight: '#818cf8',
  accentSoft: 'rgba(99, 102, 241, 0.1)',
  accentGlow: 'rgba(99, 102, 241, 0.2)',

  // Status - vibrant
  success: '#10b981',
  successSoft: 'rgba(16, 185, 129, 0.1)',
  warning: '#f59e0b',
  warningSoft: 'rgba(245, 158, 11, 0.1)',
  error: '#ef4444',
  errorSoft: 'rgba(239, 68, 68, 0.1)',
  info: '#3b82f6',
  infoSoft: 'rgba(59, 130, 246, 0.1)',

  // UI elements
  white: '#ffffff',
  black: '#18181b',
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
};

// Dark Mode Colors
export const DarkColors = {
  // Primary palette - same vibrant colors
  primary: '#818cf8',        // Lighter indigo for dark mode
  primaryLight: '#a5b4fc',   // Even lighter
  primaryDark: '#6366f1',    // Standard indigo

  secondary: '#a78bfa',      // Light violet
  secondaryLight: '#c4b5fd', // Even lighter violet

  // Accent colors - slightly brighter for dark backgrounds
  coral: '#f9a8d4',          // Light pink coral
  orange: '#fdba74',         // Light orange
  teal: '#5eead4',           // Bright teal
  emerald: '#34d399',        // Bright emerald

  // Backgrounds - true dark with depth
  background: '#0f0f0f',     // Near black
  backgroundDark: '#000000', // Pure black
  card: '#1c1c1e',           // iOS dark card
  cardElevated: '#2c2c2e',   // Elevated dark card

  // Text - light on dark
  textPrimary: '#f4f4f5',    // Almost white
  textSecondary: '#a1a1aa',  // Gray
  textMuted: '#71717a',      // Darker gray
  textOnPrimary: '#ffffff',  // White text on colored

  // Borders & dividers - subtle
  border: 'rgba(255, 255, 255, 0.1)',
  divider: 'rgba(255, 255, 255, 0.06)',

  // Accents - matching primary
  accent: '#818cf8',
  accentLight: '#a5b4fc',
  accentSoft: 'rgba(129, 140, 248, 0.15)',
  accentGlow: 'rgba(129, 140, 248, 0.25)',

  // Status - slightly softer for dark mode
  success: '#34d399',
  successSoft: 'rgba(52, 211, 153, 0.15)',
  warning: '#fbbf24',
  warningSoft: 'rgba(251, 191, 36, 0.15)',
  error: '#f87171',
  errorSoft: 'rgba(248, 113, 113, 0.15)',
  info: '#60a5fa',
  infoSoft: 'rgba(96, 165, 250, 0.15)',

  // UI elements
  white: '#ffffff',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
};

// Default export uses Light colors - will be overridden by context
export const Colors = LightColors;

// Gradient presets for LinearGradient
export const Gradients = {
  primary: ['#6366f1', '#8b5cf6'] as const,
  secondary: ['#818cf8', '#c084fc'] as const,
  warm: ['#f472b6', '#fb923c'] as const,
  cool: ['#14b8a6', '#6366f1'] as const,
  background: ['#fafafa', '#f5f3ff'] as const,
  card: ['#ffffff', '#fafafe'] as const,
  header: ['#6366f1', '#7c3aed'] as const,
  success: ['#10b981', '#14b8a6'] as const,
  sunset: ['#f97316', '#ec4899'] as const,
};

// Dark mode gradients
export const DarkGradients = {
  primary: ['#6366f1', '#8b5cf6'] as const,
  secondary: ['#818cf8', '#c084fc'] as const,
  warm: ['#f472b6', '#fb923c'] as const,
  cool: ['#14b8a6', '#6366f1'] as const,
  background: ['#0f0f0f', '#1a1a2e'] as const,
  card: ['#1c1c1e', '#2c2c2e'] as const,
  header: ['#4f46e5', '#6366f1'] as const,
  success: ['#059669', '#10b981'] as const,
  sunset: ['#ea580c', '#db2777'] as const,
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
  xxl: 32,
  full: 9999,
};

export const Typography = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,

  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    lg: 17,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
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
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: {
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
};

// Dark mode shadows (less visible on dark)
export const DarkShadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: {
    shadowColor: '#818cf8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
};

export default { Colors, LightColors, DarkColors, Gradients, DarkGradients, Spacing, BorderRadius, Typography, Shadows, DarkShadows };
