import React, { createContext, useContext, useMemo } from 'react';
import { useAppStore } from '../stores/appStore';
import {
    LightColors,
    DarkColors,
    Gradients,
    DarkGradients,
    Shadows,
    DarkShadows,
    Spacing,
    BorderRadius,
    Typography
} from '../constants/theme';

// Theme context type
interface ThemeContextType {
    isDarkMode: boolean;
    colors: typeof LightColors;
    gradients: typeof Gradients;
    shadows: typeof Shadows;
    spacing: typeof Spacing;
    borderRadius: typeof BorderRadius;
    typography: typeof Typography;
    toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { isDarkMode, toggleDarkMode } = useAppStore();

    const theme = useMemo(() => ({
        isDarkMode,
        colors: isDarkMode ? DarkColors : LightColors,
        gradients: isDarkMode ? DarkGradients : Gradients,
        shadows: isDarkMode ? DarkShadows : Shadows,
        spacing: Spacing,
        borderRadius: BorderRadius,
        typography: Typography,
        toggleDarkMode,
    }), [isDarkMode, toggleDarkMode]);

    return (
        <ThemeContext.Provider value={theme}>
            {children}
        </ThemeContext.Provider>
    );
}

// Hook to use theme
export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        // Fallback for when context is not available
        return {
            isDarkMode: false,
            colors: LightColors,
            gradients: Gradients,
            shadows: Shadows,
            spacing: Spacing,
            borderRadius: BorderRadius,
            typography: Typography,
            toggleDarkMode: () => { },
        };
    }
    return context;
}

// Convenience exports
export { LightColors, DarkColors, Gradients, DarkGradients, Spacing, BorderRadius, Typography, Shadows, DarkShadows };

// Static exports for StyleSheet compatibility (use LightColors as default)
// For dynamic theming in components, use useTheme() hook
export const Colors = LightColors;
