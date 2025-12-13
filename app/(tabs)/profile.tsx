import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../constants/theme';

interface SettingRowProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    value?: string;
    onPress: () => void;
}

function SettingRow({ icon, title, value, onPress }: SettingRowProps) {
    return (
        <TouchableOpacity onPress={onPress} style={styles.settingRow}>
            <Ionicons name={icon} size={20} color={Colors.textSecondary} />
            <Text style={styles.settingTitle}>{title}</Text>
            {value && <Text style={styles.settingValue}>{value}</Text>}
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </TouchableOpacity>
    );
}

export default function ProfileScreen() {
    const insets = useSafeAreaInsets();

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 24, paddingBottom: 120 }]} showsVerticalScrollIndicator={false}>
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>S</Text>
                    </View>
                    <Text style={styles.name}>Student</Text>
                    <Text style={styles.email}>Connect your account</Text>
                </View>

                {/* Stats */}
                <View style={styles.statsCard}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>12</Text>
                        <Text style={styles.statLabel}>Notes</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>48</Text>
                        <Text style={styles.statLabel}>Cards</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>3</Text>
                        <Text style={styles.statLabel}>Streak</Text>
                    </View>
                </View>

                {/* Settings */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Settings</Text>
                    <View style={styles.settingsCard}>
                        <SettingRow icon="key-outline" title="API Key" value="Not set" onPress={() => { }} />
                        <SettingRow icon="cloud-outline" title="Sync" value="Local only" onPress={() => { }} />
                        <SettingRow icon="notifications-outline" title="Notifications" onPress={() => { }} />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Support</Text>
                    <View style={styles.settingsCard}>
                        <SettingRow icon="help-circle-outline" title="Help" onPress={() => { }} />
                        <SettingRow icon="chatbubble-outline" title="Feedback" onPress={() => { }} />
                        <SettingRow icon="document-text-outline" title="Privacy" onPress={() => { }} />
                    </View>
                </View>

                <Text style={styles.version}>NoteSnap AI v1.0.0</Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    content: { paddingHorizontal: 24 },
    profileHeader: { alignItems: 'center', marginBottom: 32 },
    avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    avatarText: { fontSize: Typography.sizes['2xl'], fontWeight: Typography.bold, color: Colors.white },
    name: { fontSize: Typography.sizes.xl, fontWeight: Typography.semibold, color: Colors.textPrimary },
    email: { fontSize: Typography.sizes.sm, color: Colors.textSecondary, marginTop: 4 },
    statsCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: BorderRadius.lg, padding: 20, marginBottom: 32, ...Shadows.sm },
    statItem: { flex: 1, alignItems: 'center' },
    statNumber: { fontSize: Typography.sizes['2xl'], fontWeight: Typography.bold, color: Colors.textPrimary },
    statLabel: { fontSize: Typography.sizes.sm, color: Colors.textSecondary, marginTop: 2 },
    statDivider: { width: 1, height: 32, backgroundColor: Colors.border },
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: Typography.sizes.sm, fontWeight: Typography.medium, color: Colors.textMuted, marginBottom: 8, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
    settingsCard: { backgroundColor: Colors.card, borderRadius: BorderRadius.md, overflow: 'hidden', ...Shadows.sm },
    settingRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.divider, gap: 12 },
    settingTitle: { flex: 1, fontSize: Typography.sizes.base, color: Colors.textPrimary },
    settingValue: { fontSize: Typography.sizes.sm, color: Colors.textMuted },
    version: { textAlign: 'center', fontSize: Typography.sizes.sm, color: Colors.textMuted, marginTop: 16 },
});
