import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '../../stores/appStore';
import { useTheme } from '../../contexts/ThemeContext';

interface SettingRowProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    value?: string;
    toggle?: boolean;
    toggleValue?: boolean;
    onToggle?: () => void;
    onPress?: () => void;
    colors: any;
}

function SettingRow({ icon, title, value, toggle, toggleValue, onToggle, onPress, colors }: SettingRowProps) {
    const content = (
        <>
            <View style={[styles.settingIcon, { backgroundColor: colors.accentSoft }]}>
                <Ionicons name={icon} size={18} color={colors.primary} />
            </View>
            <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>{title}</Text>
            {toggle ? (
                <Switch
                    value={toggleValue}
                    onValueChange={onToggle}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor="#fff"
                />
            ) : (
                <>
                    {value && <Text style={[styles.settingValue, { color: colors.textMuted }]}>{value}</Text>}
                    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </>
            )}
        </>
    );

    if (toggle) {
        return <View style={[styles.settingRow, { borderBottomColor: colors.divider }]}>{content}</View>;
    }

    return (
        <TouchableOpacity onPress={onPress} style={[styles.settingRow, { borderBottomColor: colors.divider }]}>
            {content}
        </TouchableOpacity>
    );
}

export default function ProfileScreen() {
    const insets = useSafeAreaInsets();
    const { colors, gradients, shadows, isDarkMode, toggleDarkMode, borderRadius, typography } = useTheme();
    const { notes, decks, studyStreak, totalCardsStudied, userName, setUserName } = useAppStore();
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
                        Alert.alert('Coming Soon', 'This feature will be available in the next update.');
                    }
                },
            ]
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <LinearGradient colors={gradients.background as unknown as [string, string]} style={StyleSheet.absoluteFill} />

            <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 24, paddingBottom: 120 }]} showsVerticalScrollIndicator={false}>
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <LinearGradient colors={gradients.primary as unknown as [string, string]} style={[styles.avatar, shadows.md]}>
                        <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
                    </LinearGradient>
                    {isEditingName ? (
                        <TextInput
                            style={[styles.nameInput, { color: colors.textPrimary, borderBottomColor: colors.primary }]}
                            value={editName}
                            onChangeText={setEditName}
                            onBlur={handleSaveName}
                            autoFocus
                            returnKeyType="done"
                            onSubmitEditing={handleSaveName}
                        />
                    ) : (
                        <TouchableOpacity onPress={() => { setEditName(userName); setIsEditingName(true); }}>
                            <Text style={[styles.name, { color: colors.textPrimary }]}>{userName}</Text>
                            <Text style={[styles.tapToEdit, { color: colors.textMuted }]}>Tap to edit name</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Stats */}
                <View style={[styles.statsCard, { backgroundColor: colors.card }, shadows.sm]}>
                    <View style={styles.statItem}>
                        <Ionicons name="document-text" size={20} color={colors.primary} />
                        <Text style={[styles.statNumber, { color: colors.textPrimary }]}>{notes.length}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Notes</Text>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.statItem}>
                        <Ionicons name="layers" size={20} color={colors.teal} />
                        <Text style={[styles.statNumber, { color: colors.textPrimary }]}>{totalCards}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Cards</Text>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.statItem}>
                        <Ionicons name="flame" size={20} color={colors.coral} />
                        <Text style={[styles.statNumber, { color: colors.textPrimary }]}>{studyStreak}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Streak</Text>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.statItem}>
                        <Ionicons name="school" size={20} color={colors.warning} />
                        <Text style={[styles.statNumber, { color: colors.textPrimary }]}>{totalCardsStudied}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Studied</Text>
                    </View>
                </View>

                {/* Appearance */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Appearance</Text>
                    <View style={[styles.settingsCard, { backgroundColor: colors.card }, shadows.sm]}>
                        <SettingRow
                            icon="moon-outline"
                            title="Dark Mode"
                            toggle
                            toggleValue={isDarkMode}
                            onToggle={toggleDarkMode}
                            colors={colors}
                        />
                    </View>
                </View>

                {/* Settings */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Settings</Text>
                    <View style={[styles.settingsCard, { backgroundColor: colors.card }, shadows.sm]}>
                        <SettingRow icon="key-outline" title="API Key" value="OpenRouter" onPress={() => Alert.alert('API Key', 'Using free OpenRouter models')} colors={colors} />
                        <SettingRow icon="cloud-outline" title="Sync" value="Local only" onPress={() => Alert.alert('Sync', 'Cloud sync coming soon!')} colors={colors} />
                        <SettingRow icon="notifications-outline" title="Reminders" value="Off" onPress={() => Alert.alert('Reminders', 'Study reminders coming soon!')} colors={colors} />
                    </View>
                </View>

                {/* Data */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Data</Text>
                    <View style={[styles.settingsCard, { backgroundColor: colors.card }, shadows.sm]}>
                        <SettingRow icon="download-outline" title="Export Data" onPress={() => Alert.alert('Export', 'Coming soon!')} colors={colors} />
                        <SettingRow icon="trash-outline" title="Reset All Data" onPress={handleResetData} colors={colors} />
                    </View>
                </View>

                {/* Support */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Support</Text>
                    <View style={[styles.settingsCard, { backgroundColor: colors.card }, shadows.sm]}>
                        <SettingRow icon="help-circle-outline" title="Help & FAQ" onPress={() => { }} colors={colors} />
                        <SettingRow icon="chatbubble-outline" title="Send Feedback" onPress={() => { }} colors={colors} />
                        <SettingRow icon="document-text-outline" title="Privacy Policy" onPress={() => { }} colors={colors} />
                    </View>
                </View>

                <Text style={[styles.version, { color: colors.textMuted }]}>NoteSnap AI v0.9.0</Text>
                <Text style={[styles.credits, { color: colors.textMuted }]}>Made with ❤️ using AI</Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { paddingHorizontal: 20 },
    profileHeader: { alignItems: 'center', marginBottom: 28 },
    avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    avatarText: { fontSize: 30, fontWeight: '700', color: '#fff' },
    name: { fontSize: 20, fontWeight: '700', textAlign: 'center' },
    tapToEdit: { fontSize: 11, textAlign: 'center', marginTop: 4 },
    nameInput: { fontSize: 20, fontWeight: '700', textAlign: 'center', borderBottomWidth: 2, paddingBottom: 4 },
    statsCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 16, marginBottom: 28 },
    statItem: { flex: 1, alignItems: 'center', gap: 4 },
    statNumber: { fontSize: 20, fontWeight: '700' },
    statLabel: { fontSize: 11 },
    statDivider: { width: 1, height: 40 },
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 11, fontWeight: '600', marginBottom: 10, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 1 },
    settingsCard: { borderRadius: 16, overflow: 'hidden' },
    settingRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, gap: 12 },
    settingIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    settingTitle: { flex: 1, fontSize: 15 },
    settingValue: { fontSize: 13 },
    version: { textAlign: 'center', fontSize: 13, marginTop: 24 },
    credits: { textAlign: 'center', fontSize: 11, marginTop: 4 },
});
