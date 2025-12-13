import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Shadows } from '../../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type IconName = 'home' | 'home-outline' | 'chatbubble' | 'chatbubble-outline' |
    'add' | 'book' | 'book-outline' | 'person' | 'person-outline';

export default function TabLayout() {
    const insets = useSafeAreaInsets();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    position: 'absolute',
                    bottom: insets.bottom + 20,
                    left: 24,
                    right: 24,
                    height: 64,
                    borderRadius: BorderRadius.xl,
                    backgroundColor: Colors.white,
                    borderTopWidth: 0,
                    borderWidth: 1,
                    borderColor: Colors.border,
                    ...Shadows.md,
                },
                tabBarShowLabel: false,
                tabBarActiveTintColor: Colors.accent,
                tabBarInactiveTintColor: Colors.textMuted,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ focused, color }) => (
                        <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="ai"
                options={{
                    title: 'AI',
                    tabBarIcon: ({ focused, color }) => (
                        <Ionicons name={focused ? 'chatbubble' : 'chatbubble-outline'} size={22} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="upload"
                options={{
                    title: 'Add',
                    tabBarIcon: ({ focused }) => (
                        <View style={styles.addButton}>
                            <Ionicons name="add" size={24} color={Colors.white} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="study"
                options={{
                    title: 'Study',
                    tabBarIcon: ({ focused, color }) => (
                        <Ionicons name={focused ? 'book' : 'book-outline'} size={22} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ focused, color }) => (
                        <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    addButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: -8,
        ...Shadows.md,
    },
});
