import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '../../stores/appStore';
import { Colors, Gradients, BorderRadius, Typography, Shadows } from '../../constants/theme';

interface SettingRowProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    value?: string;
    toggle?: boolean;
    toggleValue?: boolean;
    onToggle?: () => void;
    onPress?: () => void;
}

function SettingRow({ icon, title, value, toggle, toggleValue, onToggle, onPress }: SettingRowProps) {
    const content = (
        <>
            <View style={[styles.settingIcon, { backgroundColor: Colors.accentSoft }]}>
                <Ionicons name={icon} size={18} color={Colors.primary} />
            </View>
            <Text style={styles.settingTitle}>{title}</Text>
            {toggle ? (
                <Switch
                    value={toggleValue}
                    onValueChange={onToggle}
                    trackColor={{ false: Colors.border, true: Colors.primary }}
                    thumbColor="#fff"
                />
            ) : (
                <>
                    {value && <Text style={styles.settingValue}>{value}</Text>}
                    <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
                </>
            )}
        </>
    );

    if (toggle) {
        return <View style={styles.settingRow}>{content}</View>;
    }

    return (
        <TouchableOpacity onPress={onPress} style={styles.settingRow}>
            {content}
        </TouchableOpacity>
    );
}

export default function ProfileScreen() {
    const insets = useSafeAreaInsets();
    const { notes, decks, studyStreak, totalCardsStudied, userName, setUserName, isDarkMode, toggleDarkMode } = useAppStore();
    const [isEditingName, setIsEditingName] = useState(false);
    const [editName, setEditName] = useState(userName);

    const totalCards = decks.reduce((sum, d) => sum + d.cards.length, 0);

    const handleSaveName = () => {
        if (editName.trim()) {
            setUserName(editName.trim());
        }
        setIsEditingName(false);
    };

    const handleResetData = () => {
        Alert.alert(
            'Reset All Data',
            'This will delete all your notes, flashcards, and quizzes. This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reset', style: 'destructive', onPress: () => {
                        // Note: Would need to add resetAll to store
                        Alert.alert('Coming Soon', 'This feature will be available in the next update.');
                    }
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={Gradients.background} style={StyleSheet.absoluteFill} />

            <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 24, paddingBottom: 120 }]} showsVerticalScrollIndicator={false}>
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <LinearGradient colors={Gradients.primary} style={styles.avatar}>
                        <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
                    </LinearGradient>
                    {isEditingName ? (
                        <TextInput
                            style={styles.nameInput}
                            value={editName}
                            onChangeText={setEditName}
                            onBlur={handleSaveName}
                            autoFocus
                            returnKeyType="done"
                            onSubmitEditing={handleSaveName}
                        />
                    ) : (
                        <TouchableOpacity onPress={() => { setEditName(userName); setIsEditingName(true); }}>
                            <Text style={styles.name}>{userName}</Text>
                            <Text style={styles.tapToEdit}>Tap to edit name</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Stats */}
                <View style={styles.statsCard}>
                    <View style={styles.statItem}>
                        <Ionicons name="document-text" size={20} color={Colors.primary} />
                        <Text style={styles.statNumber}>{notes.length}</Text>
                        <Text style={styles.statLabel}>Notes</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Ionicons name="layers" size={20} color={Colors.teal} />
                        <Text style={styles.statNumber}>{totalCards}</Text>
                        <Text style={styles.statLabel}>Cards</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Ionicons name="flame" size={20} color={Colors.coral} />
                        <Text style={styles.statNumber}>{studyStreak}</Text>
                        <Text style={styles.statLabel}>Streak</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Ionicons name="school" size={20} color={Colors.warning} />
                        <Text style={styles.statNumber}>{totalCardsStudied}</Text>
                        <Text style={styles.statLabel}>Studied</Text>
                    </View>
                </View>

                {/* Appearance */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Appearance</Text>
                    <View style={styles.settingsCard}>
                        <SettingRow
                            icon="moon-outline"
                            title="Dark Mode"
                            toggle
                            toggleValue={isDarkMode}
                            onToggle={toggleDarkMode}
                        />
                    </View>
                </View>

                {/* Settings */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Settings</Text>
                    <View style={styles.settingsCard}>
                        <SettingRow icon="key-outline" title="API Key" value="OpenRouter" onPress={() => Alert.alert('API Key', 'Using free OpenRouter models')} />
                        <SettingRow icon="cloud-outline" title="Sync" value="Local only" onPress={() => Alert.alert('Sync', 'Cloud sync coming soon!')} />
                        <SettingRow icon="notifications-outline" title="Reminders" value="Off" onPress={() => Alert.alert('Reminders', 'Study reminders coming soon!')} />
                    </View>
                </View>

                {/* Data */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Data</Text>
                    <View style={styles.settingsCard}>
                        <SettingRow icon="download-outline" title="Export Data" onPress={() => Alert.alert('Export', 'Coming soon!')} />
                        <SettingRow icon="trash-outline" title="Reset All Data" onPress={handleResetData} />
                    </View>
                </View>

                {/* Support */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Support</Text>
                    <View style={styles.settingsCard}>
                        <SettingRow icon="help-circle-outline" title="Help & FAQ" onPress={() => { }} />
                        <SettingRow icon="chatbubble-outline" title="Send Feedback" onPress={() => { }} />
                        <SettingRow icon="document-text-outline" title="Privacy Policy" onPress={() => { }} />
                    </View>
                </View>

                <Text style={styles.version}>NoteSnap AI v0.8.0</Text>
                <Text style={styles.credits}>Made with ❤️ using AI</Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    content: { paddingHorizontal: 20 },
    profileHeader: { alignItems: 'center', marginBottom: 28 },
    avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 12, ...Shadows.md },
    avatarText: { fontSize: Typography.sizes['3xl'], fontWeight: Typography.bold, color: '#fff' },
    name: { fontSize: Typography.sizes.xl, fontWeight: Typography.bold, color: Colors.textPrimary, textAlign: 'center' },
    tapToEdit: { fontSize: Typography.sizes.xs, color: Colors.textMuted, textAlign: 'center', marginTop: 4 },
    nameInput: { fontSize: Typography.sizes.xl, fontWeight: Typography.bold, color: Colors.textPrimary, textAlign: 'center', borderBottomWidth: 2, borderBottomColor: Colors.primary, paddingBottom: 4 },
    statsCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: BorderRadius.lg, padding: 16, marginBottom: 28, ...Shadows.sm },
    statItem: { flex: 1, alignItems: 'center', gap: 4 },
    statNumber: { fontSize: Typography.sizes.xl, fontWeight: Typography.bold, color: Colors.textPrimary },
    statLabel: { fontSize: Typography.sizes.xs, color: Colors.textSecondary },
    statDivider: { width: 1, height: 40, backgroundColor: Colors.border },
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: Typography.sizes.xs, fontWeight: Typography.semibold, color: Colors.textMuted, marginBottom: 10, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 1 },
    settingsCard: { backgroundColor: Colors.card, borderRadius: BorderRadius.lg, overflow: 'hidden', ...Shadows.sm },
    settingRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: Colors.divider, gap: 12 },
    settingIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    settingTitle: { flex: 1, fontSize: Typography.sizes.base, color: Colors.textPrimary },
    settingValue: { fontSize: Typography.sizes.sm, color: Colors.textMuted },
    version: { textAlign: 'center', fontSize: Typography.sizes.sm, color: Colors.textMuted, marginTop: 24 },
    credits: { textAlign: 'center', fontSize: Typography.sizes.xs, color: Colors.textMuted, marginTop: 4 },
});
