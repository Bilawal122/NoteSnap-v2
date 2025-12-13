import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../constants/theme';

export default function HomeScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.content, { paddingTop: insets.top + 24, paddingBottom: 120 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Hello there</Text>
                        <Text style={styles.title}>Ready to learn?</Text>
                    </View>
                    <TouchableOpacity style={styles.avatarButton}>
                        <Text style={styles.avatarText}>S</Text>
                    </TouchableOpacity>
                </View>

                {/* Quick Stats */}
                <View style={styles.statsRow}>
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
                        <Text style={styles.statLabel}>Day streak</Text>
                    </View>
                </View>

                {/* Quick Actions */}
                <Text style={styles.sectionTitle}>Quick actions</Text>
                <View style={styles.actionsRow}>
                    <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/ai')}>
                        <View style={[styles.actionIcon, { backgroundColor: Colors.accentSoft }]}>
                            <Ionicons name="chatbubble-outline" size={20} color={Colors.accent} />
                        </View>
                        <Text style={styles.actionText}>Ask AI</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/study')}>
                        <View style={[styles.actionIcon, { backgroundColor: 'rgba(200, 213, 185, 0.3)' }]}>
                            <Ionicons name="layers-outline" size={20} color={Colors.sage} />
                        </View>
                        <Text style={styles.actionText}>Flashcards</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/study')}>
                        <View style={[styles.actionIcon, { backgroundColor: 'rgba(229, 168, 75, 0.15)' }]}>
                            <Ionicons name="help-circle-outline" size={20} color={Colors.warning} />
                        </View>
                        <Text style={styles.actionText}>Quiz</Text>
                    </TouchableOpacity>
                </View>

                {/* Recent Notes */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent notes</Text>
                    <TouchableOpacity>
                        <Text style={styles.seeAll}>See all</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.noteCard}>
                    <View style={styles.noteContent}>
                        <Text style={styles.noteTitle}>Machine Learning Basics</Text>
                        <Text style={styles.notePreview}>Neural networks, supervised learning, and key algorithms...</Text>
                    </View>
                    <Text style={styles.noteTime}>2h ago</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.noteCard}>
                    <View style={styles.noteContent}>
                        <Text style={styles.noteTitle}>Data Structures</Text>
                        <Text style={styles.notePreview}>Trees, graphs, and algorithmic complexity...</Text>
                    </View>
                    <Text style={styles.noteTime}>1d ago</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.noteCard}>
                    <View style={styles.noteContent}>
                        <Text style={styles.noteTitle}>Psychology Chapter 5</Text>
                        <Text style={styles.notePreview}>Cognitive development and behavioral patterns...</Text>
                    </View>
                    <Text style={styles.noteTime}>2d ago</Text>
                </TouchableOpacity>

                {/* Tip */}
                <View style={styles.tipCard}>
                    <Ionicons name="bulb-outline" size={18} color={Colors.accent} />
                    <Text style={styles.tipText}>
                        Tip: Ask AI to create flashcards from your notes
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    scrollView: { flex: 1 },
    content: { paddingHorizontal: 24 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
    greeting: { fontSize: Typography.sizes.base, color: Colors.textSecondary },
    title: { fontSize: Typography.sizes['3xl'], fontWeight: Typography.semibold, color: Colors.textPrimary, marginTop: 4 },
    avatarButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontSize: Typography.sizes.lg, fontWeight: Typography.semibold, color: Colors.white },
    statsRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: BorderRadius.lg, padding: 20, marginBottom: 32, ...Shadows.sm },
    statItem: { flex: 1, alignItems: 'center' },
    statNumber: { fontSize: Typography.sizes['2xl'], fontWeight: Typography.bold, color: Colors.textPrimary },
    statLabel: { fontSize: Typography.sizes.sm, color: Colors.textSecondary, marginTop: 2 },
    statDivider: { width: 1, height: 32, backgroundColor: Colors.border },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: Typography.sizes.lg, fontWeight: Typography.semibold, color: Colors.textPrimary, marginBottom: 12 },
    seeAll: { fontSize: Typography.sizes.sm, color: Colors.accent, fontWeight: Typography.medium },
    actionsRow: { flexDirection: 'row', gap: 12, marginBottom: 32 },
    actionCard: { flex: 1, backgroundColor: Colors.card, borderRadius: BorderRadius.md, padding: 16, alignItems: 'center', ...Shadows.sm },
    actionIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    actionText: { fontSize: Typography.sizes.sm, fontWeight: Typography.medium, color: Colors.textPrimary },
    noteCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: BorderRadius.md, padding: 16, marginBottom: 8, ...Shadows.sm },
    noteContent: { flex: 1 },
    noteTitle: { fontSize: Typography.sizes.base, fontWeight: Typography.medium, color: Colors.textPrimary, marginBottom: 4 },
    notePreview: { fontSize: Typography.sizes.sm, color: Colors.textSecondary },
    noteTime: { fontSize: Typography.sizes.xs, color: Colors.textMuted, marginLeft: 12 },
    tipCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.accentSoft, borderRadius: BorderRadius.md, padding: 16, marginTop: 24, gap: 12 },
    tipText: { flex: 1, fontSize: Typography.sizes.sm, color: Colors.textSecondary },
});
