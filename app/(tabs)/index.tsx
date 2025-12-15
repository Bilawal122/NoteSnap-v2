import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore, sortItems, getDeckProgress } from '../../stores/appStore';
import { Colors, Gradients, BorderRadius, Typography, Shadows } from '../../constants/theme';

export default function HomeScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { notes, decks, quizzes, userName, studyStreak, totalCardsStudied, notesSortBy, decksSortBy } = useAppStore();

    const recentNotes = sortItems(notes, notesSortBy).slice(0, 3);
    const recentDecks = sortItems(decks, decksSortBy).slice(0, 2);

    const stats = [
        { label: 'Notes', value: notes.length, icon: 'document-text' as const, gradient: Gradients.primary },
        { label: 'Decks', value: decks.length, icon: 'layers' as const, gradient: Gradients.cool },
        { label: 'Quizzes', value: quizzes.length, icon: 'help-circle' as const, gradient: Gradients.warm },
        { label: 'Streak', value: `${studyStreak}d`, icon: 'flame' as const, gradient: Gradients.sunset },
    ];

    return (
        <View style={styles.container}>
            <LinearGradient colors={Gradients.background} style={StyleSheet.absoluteFill} />

            <ScrollView
                contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: 120 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Header with gradient text effect */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Hello, {userName}! 👋</Text>
                        <Text style={styles.subtitle}>Ready to learn something new?</Text>
                    </View>
                    <TouchableOpacity style={styles.notificationBtn}>
                        <Ionicons name="notifications-outline" size={22} color={Colors.textPrimary} />
                    </TouchableOpacity>
                </View>

                {/* Stats Row - with gradient backgrounds */}
                <View style={styles.statsRow}>
                    {stats.map((stat, i) => (
                        <View key={i} style={styles.statCardWrapper}>
                            <LinearGradient colors={stat.gradient as unknown as [string, string]} style={styles.statCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                                <Ionicons name={stat.icon} size={20} color="#fff" />
                                <Text style={styles.statValue}>{stat.value}</Text>
                                <Text style={styles.statLabel}>{stat.label}</Text>
                            </LinearGradient>
                        </View>
                    ))}
                </View>

                {/* Quick Actions - colorful cards */}
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.actionsRow}>
                    <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/notes/create')}>
                        <LinearGradient colors={Gradients.primary} style={styles.actionGradient}>
                            <Ionicons name="add" size={24} color="#fff" />
                        </LinearGradient>
                        <Text style={styles.actionText}>New Note</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/ai')}>
                        <LinearGradient colors={Gradients.success} style={styles.actionGradient}>
                            <Ionicons name="sparkles" size={24} color="#fff" />
                        </LinearGradient>
                        <Text style={styles.actionText}>AI Chat</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/study')}>
                        <LinearGradient colors={Gradients.warm} style={styles.actionGradient}>
                            <Ionicons name="school" size={24} color="#fff" />
                        </LinearGradient>
                        <Text style={styles.actionText}>Study</Text>
                    </TouchableOpacity>
                </View>

                {/* Recent Notes */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Notes</Text>
                    <TouchableOpacity onPress={() => router.push('/notes')}>
                        <Text style={styles.seeAll}>See All →</Text>
                    </TouchableOpacity>
                </View>
                {recentNotes.length === 0 ? (
                    <TouchableOpacity style={styles.emptyCard} onPress={() => router.push('/notes/create')}>
                        <View style={styles.emptyIconBg}>
                            <Ionicons name="document-text-outline" size={24} color={Colors.primary} />
                        </View>
                        <View>
                            <Text style={styles.emptyTitle}>Create your first note</Text>
                            <Text style={styles.emptySubtitle}>Tap to get started</Text>
                        </View>
                    </TouchableOpacity>
                ) : (
                    recentNotes.map((note, idx) => (
                        <TouchableOpacity key={note.id} style={styles.noteCard} onPress={() => router.push(`/notes/${note.id}`)}>
                            <View style={[styles.noteAccent, { backgroundColor: idx % 2 === 0 ? Colors.primary : Colors.secondary }]} />
                            <View style={styles.noteContent}>
                                <View style={styles.noteHeader}>
                                    <Text style={styles.noteTitle} numberOfLines={1}>{note.title}</Text>
                                    {note.isFavorite && <Ionicons name="star" size={14} color={Colors.warning} />}
                                </View>
                                <Text style={styles.notePreview} numberOfLines={1}>{note.content.slice(0, 60)}...</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
                        </TouchableOpacity>
                    ))
                )}

                {/* Recent Decks */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Continue Studying</Text>
                    <TouchableOpacity onPress={() => router.push('/study')}>
                        <Text style={styles.seeAll}>See All →</Text>
                    </TouchableOpacity>
                </View>
                {recentDecks.length === 0 ? (
                    <TouchableOpacity style={styles.emptyCard} onPress={() => router.push('/ai')}>
                        <View style={[styles.emptyIconBg, { backgroundColor: Colors.successSoft }]}>
                            <Ionicons name="layers-outline" size={24} color={Colors.success} />
                        </View>
                        <View>
                            <Text style={styles.emptyTitle}>Create flashcards with AI</Text>
                            <Text style={styles.emptySubtitle}>Use AI to generate study materials</Text>
                        </View>
                    </TouchableOpacity>
                ) : (
                    recentDecks.map(deck => (
                        <TouchableOpacity key={deck.id} style={styles.deckCard} onPress={() => router.push(`/flashcard/${deck.id}`)}>
                            <LinearGradient colors={Gradients.cool} style={styles.deckIcon}>
                                <Ionicons name="layers" size={20} color="#fff" />
                            </LinearGradient>
                            <View style={styles.deckInfo}>
                                <Text style={styles.deckTitle} numberOfLines={1}>{deck.title}</Text>
                                <Text style={styles.deckMeta}>{deck.cards.length} cards</Text>
                            </View>
                            <View style={styles.deckProgress}>
                                <Text style={styles.progressPercent}>{getDeckProgress(deck)}%</Text>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    content: { paddingHorizontal: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
    greeting: { fontSize: Typography.sizes['2xl'], fontWeight: Typography.bold, color: Colors.textPrimary },
    subtitle: { fontSize: Typography.sizes.base, color: Colors.textSecondary, marginTop: 4 },
    notificationBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center', ...Shadows.sm },
    statsRow: { flexDirection: 'row', gap: 10, marginBottom: 28 },
    statCardWrapper: { flex: 1, borderRadius: BorderRadius.lg, overflow: 'hidden', ...Shadows.md },
    statCard: { paddingVertical: 16, alignItems: 'center' },
    statValue: { fontSize: Typography.sizes.xl, fontWeight: Typography.bold, color: '#fff', marginTop: 6 },
    statLabel: { fontSize: Typography.sizes.xs, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, marginTop: 8 },
    sectionTitle: { fontSize: Typography.sizes.lg, fontWeight: Typography.bold, color: Colors.textPrimary },
    seeAll: { fontSize: Typography.sizes.sm, color: Colors.primary, fontWeight: Typography.semibold },
    actionsRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
    actionCard: { flex: 1, backgroundColor: Colors.card, borderRadius: BorderRadius.lg, paddingVertical: 18, alignItems: 'center', ...Shadows.sm },
    actionGradient: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    actionText: { fontSize: Typography.sizes.sm, fontWeight: Typography.semibold, color: Colors.textPrimary },
    emptyCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: BorderRadius.lg, padding: 18, gap: 14, marginBottom: 12, ...Shadows.sm },
    emptyIconBg: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
    emptyTitle: { fontSize: Typography.sizes.base, fontWeight: Typography.semibold, color: Colors.textPrimary },
    emptySubtitle: { fontSize: Typography.sizes.sm, color: Colors.textMuted, marginTop: 2 },
    noteCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: BorderRadius.lg, padding: 14, marginBottom: 10, overflow: 'hidden', ...Shadows.sm },
    noteAccent: { width: 4, height: '100%', borderRadius: 2, marginRight: 14, position: 'absolute', left: 0, top: 0, bottom: 0 },
    noteContent: { flex: 1, paddingLeft: 8 },
    noteHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    noteTitle: { flex: 1, fontSize: Typography.sizes.base, fontWeight: Typography.semibold, color: Colors.textPrimary },
    notePreview: { fontSize: Typography.sizes.sm, color: Colors.textSecondary },
    deckCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: BorderRadius.lg, padding: 14, marginBottom: 10, ...Shadows.sm },
    deckIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
    deckInfo: { flex: 1 },
    deckTitle: { fontSize: Typography.sizes.base, fontWeight: Typography.semibold, color: Colors.textPrimary },
    deckMeta: { fontSize: Typography.sizes.sm, color: Colors.textSecondary, marginTop: 2 },
    deckProgress: { backgroundColor: Colors.accentSoft, paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.full },
    progressPercent: { fontSize: Typography.sizes.sm, fontWeight: Typography.bold, color: Colors.primary },
});
