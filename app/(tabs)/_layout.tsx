import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../contexts/ThemeContext';

export default function TabLayout() {
    const insets = useSafeAreaInsets();
    const { colors, isDarkMode, gradients } = useTheme();

    // Sleek minimal tab bar
    const TAB_BAR_HEIGHT = 56;
    const TAB_BAR_MARGIN = 16;

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    position: 'absolute',
                    bottom: Math.max(insets.bottom, 8) + TAB_BAR_MARGIN,
                    left: TAB_BAR_MARGIN,
                    right: TAB_BAR_MARGIN,
                    height: TAB_BAR_HEIGHT,
                    borderRadius: TAB_BAR_HEIGHT / 2,
                    backgroundColor: isDarkMode
                        ? 'rgba(28, 28, 30, 0.92)'
                        : 'rgba(255, 255, 255, 0.92)',
                    borderTopWidth: 0,
                    borderWidth: 1,
                    borderColor: isDarkMode
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'rgba(0, 0, 0, 0.06)',
                    shadowColor: isDarkMode ? '#000' : colors.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: isDarkMode ? 0.4 : 0.15,
                    shadowRadius: 16,
                    elevation: 8,
                    paddingHorizontal: 8,
                },
                tabBarShowLabel: false,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)',
                tabBarItemStyle: {
                    paddingVertical: 8,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ focused, color }) => (
                        <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
                            <Ionicons
                                name={focused ? 'home' : 'home-outline'}
                                size={focused ? 22 : 20}
                                color={color}
                            />
                            {focused && <View style={[styles.activeIndicator, { backgroundColor: colors.primary }]} />}
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="ai"
                options={{
                    title: 'AI',
                    tabBarIcon: ({ focused, color }) => (
                        <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
                            <Ionicons
                                name={focused ? 'sparkles' : 'sparkles-outline'}
                                size={focused ? 22 : 20}
                                color={color}
                            />
                            {focused && <View style={[styles.activeIndicator, { backgroundColor: colors.primary }]} />}
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="upload"
                options={{
                    title: 'Add',
                    tabBarIcon: ({ focused }) => (
                        <View style={[
                            styles.addButton,
                            {
                                backgroundColor: colors.primary,
                                shadowColor: colors.primary,
                            }
                        ]}>
                            <Ionicons name="add" size={24} color="#fff" />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="study"
                options={{
                    title: 'Study',
                    tabBarIcon: ({ focused, color }) => (
                        <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
                            <Ionicons
                                name={focused ? 'book' : 'book-outline'}
                                size={focused ? 22 : 20}
                                color={color}
                            />
                            {focused && <View style={[styles.activeIndicator, { backgroundColor: colors.primary }]} />}
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ focused, color }) => (
                        <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
                            <Ionicons
                                name={focused ? 'person' : 'person-outline'}
                                size={focused ? 22 : 20}
                                color={color}
                            />
                            {focused && <View style={[styles.activeIndicator, { backgroundColor: colors.primary }]} />}
                        </View>
                    ),
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 4,
    },
    iconContainerActive: {
        transform: [{ scale: 1.05 }],
    },
    activeIndicator: {
        width: 4,
        height: 4,
        borderRadius: 2,
        marginTop: 4,
    },
    addButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: -6,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 6,
    },
});
