import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore, sortItems, getDeckProgress } from '../../stores/appStore';
import { useTheme } from '../../contexts/ThemeContext';

export default function HomeScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { colors, gradients, shadows, typography, borderRadius } = useTheme();
    const { notes, decks, quizzes, userName, studyStreak, notesSortBy, decksSortBy } = useAppStore();

    const recentNotes = sortItems(notes, notesSortBy).slice(0, 3);
    const recentDecks = sortItems(decks, decksSortBy).slice(0, 2);

    const stats = [
        { label: 'Notes', value: notes.length, icon: 'document-text' as const, gradient: gradients.primary },
        { label: 'Decks', value: decks.length, icon: 'layers' as const, gradient: gradients.cool },
        { label: 'Quizzes', value: quizzes.length, icon: 'help-circle' as const, gradient: gradients.warm },
        { label: 'Streak', value: `${studyStreak}d`, icon: 'flame' as const, gradient: gradients.sunset },
    ];

    // Dynamic styles based on theme
    const dynamicStyles = {
        container: { flex: 1, backgroundColor: colors.background },
        greeting: { fontSize: typography.sizes['2xl'], fontWeight: typography.bold, color: colors.textPrimary },
        subtitle: { fontSize: typography.sizes.base, color: colors.textSecondary, marginTop: 4 },
        searchBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.card, alignItems: 'center' as const, justifyContent: 'center' as const, ...shadows.sm },
        sectionTitle: { fontSize: typography.sizes.lg, fontWeight: typography.bold, color: colors.textPrimary },
        seeAll: { fontSize: typography.sizes.sm, color: colors.primary, fontWeight: typography.semibold },
        actionCard: { flex: 1, backgroundColor: colors.card, borderRadius: borderRadius.lg, paddingVertical: 18, alignItems: 'center' as const, ...shadows.sm },
        actionText: { fontSize: typography.sizes.sm, fontWeight: typography.semibold, color: colors.textPrimary },
        emptyCard: { flexDirection: 'row' as const, alignItems: 'center' as const, backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: 18, gap: 14, marginBottom: 12, ...shadows.sm },
        emptyIconBg: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.accentSoft, alignItems: 'center' as const, justifyContent: 'center' as const },
        emptyTitle: { fontSize: typography.sizes.base, fontWeight: typography.semibold, color: colors.textPrimary },
        emptySubtitle: { fontSize: typography.sizes.sm, color: colors.textMuted, marginTop: 2 },
        noteCard: { flexDirection: 'row' as const, alignItems: 'center' as const, backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: 14, marginBottom: 10, overflow: 'hidden' as const, ...shadows.sm },
        noteTitle: { flex: 1, fontSize: typography.sizes.base, fontWeight: typography.semibold, color: colors.textPrimary },
        notePreview: { fontSize: typography.sizes.sm, color: colors.textSecondary },
        deckCard: { flexDirection: 'row' as const, alignItems: 'center' as const, backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: 14, marginBottom: 10, ...shadows.sm },
        deckTitle: { fontSize: typography.sizes.base, fontWeight: typography.semibold, color: colors.textPrimary },
        deckMeta: { fontSize: typography.sizes.sm, color: colors.textSecondary, marginTop: 2 },
        progressPercent: { fontSize: typography.sizes.sm, fontWeight: typography.bold, color: colors.primary },
    };

    return (
        <View style={dynamicStyles.container}>
            <LinearGradient colors={gradients.background as unknown as [string, string]} style={StyleSheet.absoluteFill} />

            <ScrollView
                contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: 120 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={dynamicStyles.greeting}>Hello, {userName}! 👋</Text>
                        <Text style={dynamicStyles.subtitle}>Ready to learn something new?</Text>
                    </View>
                    <TouchableOpacity style={dynamicStyles.searchBtn} onPress={() => router.push('/search')}>
                        <Ionicons name="search" size={22} color={colors.textPrimary} />
                    </TouchableOpacity>
                </View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    {stats.map((stat, i) => (
                        <View key={i} style={[styles.statCardWrapper, shadows.md]}>
                            <LinearGradient colors={stat.gradient as unknown as [string, string]} style={styles.statCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                                <Ionicons name={stat.icon} size={20} color="#fff" />
                                <Text style={styles.statValue}>{stat.value}</Text>
                                <Text style={styles.statLabel}>{stat.label}</Text>
                            </LinearGradient>
                        </View>
                    ))}
                </View>

                {/* Quick Actions */}
                <Text style={dynamicStyles.sectionTitle}>Quick Actions</Text>
                <View style={styles.actionsRow}>
                    <TouchableOpacity style={dynamicStyles.actionCard} onPress={() => router.push('/notes/create')}>
                        <LinearGradient colors={gradients.primary as unknown as [string, string]} style={styles.actionGradient}>
                            <Ionicons name="add" size={24} color="#fff" />
                        </LinearGradient>
                        <Text style={dynamicStyles.actionText}>New Note</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={dynamicStyles.actionCard} onPress={() => router.push('/ai')}>
                        <LinearGradient colors={gradients.success as unknown as [string, string]} style={styles.actionGradient}>
                            <Ionicons name="sparkles" size={24} color="#fff" />
                        </LinearGradient>
                        <Text style={dynamicStyles.actionText}>AI Chat</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={dynamicStyles.actionCard} onPress={() => router.push('/study')}>
                        <LinearGradient colors={gradients.warm as unknown as [string, string]} style={styles.actionGradient}>
                            <Ionicons name="school" size={24} color="#fff" />
                        </LinearGradient>
                        <Text style={dynamicStyles.actionText}>Study</Text>
                    </TouchableOpacity>
                </View>

                {/* Recent Notes */}
                <View style={styles.sectionHeader}>
                    <Text style={dynamicStyles.sectionTitle}>Recent Notes</Text>
                    <TouchableOpacity onPress={() => router.push('/notes')}>
                        <Text style={dynamicStyles.seeAll}>See All →</Text>
                    </TouchableOpacity>
                </View>
                {recentNotes.length === 0 ? (
                    <TouchableOpacity style={dynamicStyles.emptyCard} onPress={() => router.push('/notes/create')}>
                        <View style={dynamicStyles.emptyIconBg}>
                            <Ionicons name="document-text-outline" size={24} color={colors.primary} />
                        </View>
                        <View>
                            <Text style={dynamicStyles.emptyTitle}>Create your first note</Text>
                            <Text style={dynamicStyles.emptySubtitle}>Tap to get started</Text>
                        </View>
                    </TouchableOpacity>
                ) : (
                    recentNotes.map((note, idx) => (
                        <TouchableOpacity key={note.id} style={dynamicStyles.noteCard} onPress={() => router.push(`/notes/${note.id}`)}>
                            <View style={[styles.noteAccent, { backgroundColor: idx % 2 === 0 ? colors.primary : colors.secondary }]} />
                            <View style={styles.noteContent}>
                                <View style={styles.noteHeader}>
                                    <Text style={dynamicStyles.noteTitle} numberOfLines={1}>{note.title}</Text>
                                    {note.isFavorite && <Ionicons name="star" size={14} color={colors.warning} />}
                                </View>
                                <Text style={dynamicStyles.notePreview} numberOfLines={1}>{note.content.slice(0, 60)}...</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                        </TouchableOpacity>
                    ))
                )}

                {/* Recent Decks */}
                <View style={styles.sectionHeader}>
                    <Text style={dynamicStyles.sectionTitle}>Continue Studying</Text>
                    <TouchableOpacity onPress={() => router.push('/study')}>
                        <Text style={dynamicStyles.seeAll}>See All →</Text>
                    </TouchableOpacity>
                </View>
                {recentDecks.length === 0 ? (
                    <TouchableOpacity style={dynamicStyles.emptyCard} onPress={() => router.push('/ai')}>
                        <View style={[dynamicStyles.emptyIconBg, { backgroundColor: colors.successSoft }]}>
                            <Ionicons name="layers-outline" size={24} color={colors.success} />
                        </View>
                        <View>
                            <Text style={dynamicStyles.emptyTitle}>Create flashcards with AI</Text>
                            <Text style={dynamicStyles.emptySubtitle}>Use AI to generate study materials</Text>
                        </View>
                    </TouchableOpacity>
                ) : (
                    recentDecks.map(deck => (
                        <TouchableOpacity key={deck.id} style={dynamicStyles.deckCard} onPress={() => router.push(`/flashcard/${deck.id}`)}>
                            <LinearGradient colors={gradients.cool as unknown as [string, string]} style={styles.deckIcon}>
                                <Ionicons name="layers" size={20} color="#fff" />
                            </LinearGradient>
                            <View style={styles.deckInfo}>
                                <Text style={dynamicStyles.deckTitle} numberOfLines={1}>{deck.title}</Text>
                                <Text style={dynamicStyles.deckMeta}>{deck.cards.length} cards</Text>
                            </View>
                            <View style={[styles.deckProgress, { backgroundColor: colors.accentSoft }]}>
                                <Text style={dynamicStyles.progressPercent}>{getDeckProgress(deck)}%</Text>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    content: { paddingHorizontal: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
    statsRow: { flexDirection: 'row', gap: 10, marginBottom: 28 },
    statCardWrapper: { flex: 1, borderRadius: 16, overflow: 'hidden' },
    statCard: { paddingVertical: 16, alignItems: 'center' },
    statValue: { fontSize: 20, fontWeight: '700', color: '#fff', marginTop: 6 },
    statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, marginTop: 8 },
    actionsRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
    actionGradient: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    noteAccent: { width: 4, height: '100%', borderRadius: 2, marginRight: 14, position: 'absolute', left: 0, top: 0, bottom: 0 },
    noteContent: { flex: 1, paddingLeft: 8 },
    noteHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    deckIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
    deckInfo: { flex: 1 },
    deckProgress: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 9999 },
});
