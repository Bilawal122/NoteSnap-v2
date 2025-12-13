import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../constants/theme';

type Tab = 'flashcards' | 'quizzes';

const DECKS = [
    { id: '1', title: 'Machine Learning', cards: 25, progress: 60 },
    { id: '2', title: 'Data Structures', cards: 40, progress: 35 },
    { id: '3', title: 'Psychology', cards: 30, progress: 80 },
];

const QUIZZES = [
    { id: '1', title: 'ML Concepts', questions: 15, score: 85 },
    { id: '2', title: 'Data Structures', questions: 20, score: null },
    { id: '3', title: 'Psychology Ch. 5', questions: 10, score: 92 },
];

export default function StudyScreen() {
    const insets = useSafeAreaInsets();
    const [tab, setTab] = useState<Tab>('flashcards');

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 24, paddingBottom: 120 }]} showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>Study</Text>

                {/* Tabs */}
                <View style={styles.tabs}>
                    <TouchableOpacity onPress={() => setTab('flashcards')} style={[styles.tab, tab === 'flashcards' && styles.tabActive]}>
                        <Text style={[styles.tabText, tab === 'flashcards' && styles.tabTextActive]}>Flashcards</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setTab('quizzes')} style={[styles.tab, tab === 'quizzes' && styles.tabActive]}>
                        <Text style={[styles.tabText, tab === 'quizzes' && styles.tabTextActive]}>Quizzes</Text>
                    </TouchableOpacity>
                </View>

                {/* Content */}
                {tab === 'flashcards' ? (
                    <View style={styles.list}>
                        {DECKS.map(deck => (
                            <TouchableOpacity key={deck.id} style={styles.card}>
                                <View style={styles.cardContent}>
                                    <Text style={styles.cardTitle}>{deck.title}</Text>
                                    <Text style={styles.cardMeta}>{deck.cards} cards</Text>
                                </View>
                                <View style={styles.progressContainer}>
                                    <View style={styles.progressBar}>
                                        <View style={[styles.progressFill, { width: `${deck.progress}%` }]} />
                                    </View>
                                    <Text style={styles.progressText}>{deck.progress}%</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : (
                    <View style={styles.list}>
                        {QUIZZES.map(quiz => (
                            <TouchableOpacity key={quiz.id} style={styles.card}>
                                <View style={styles.cardContent}>
                                    <Text style={styles.cardTitle}>{quiz.title}</Text>
                                    <Text style={styles.cardMeta}>{quiz.questions} questions</Text>
                                </View>
                                {quiz.score !== null ? (
                                    <View style={styles.scoreBadge}>
                                        <Text style={styles.scoreText}>{quiz.score}%</Text>
                                    </View>
                                ) : (
                                    <View style={styles.newBadge}>
                                        <Text style={styles.newText}>NEW</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Generate button */}
                <TouchableOpacity style={styles.generateButton}>
                    <Ionicons name="sparkles-outline" size={18} color={Colors.white} />
                    <Text style={styles.generateText}>Generate with AI</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    content: { paddingHorizontal: 24 },
    title: { fontSize: Typography.sizes['3xl'], fontWeight: Typography.semibold, color: Colors.textPrimary, marginBottom: 24 },
    tabs: { flexDirection: 'row', backgroundColor: Colors.card, borderRadius: BorderRadius.md, padding: 4, marginBottom: 24, ...Shadows.sm },
    tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: BorderRadius.sm },
    tabActive: { backgroundColor: Colors.accent },
    tabText: { fontSize: Typography.sizes.sm, fontWeight: Typography.medium, color: Colors.textSecondary },
    tabTextActive: { color: Colors.white },
    list: { gap: 8 },
    card: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: BorderRadius.md, padding: 16, ...Shadows.sm },
    cardContent: { flex: 1 },
    cardTitle: { fontSize: Typography.sizes.base, fontWeight: Typography.medium, color: Colors.textPrimary },
    cardMeta: { fontSize: Typography.sizes.sm, color: Colors.textSecondary, marginTop: 2 },
    progressContainer: { alignItems: 'flex-end' },
    progressBar: { width: 50, height: 4, backgroundColor: Colors.divider, borderRadius: 2, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: Colors.accent, borderRadius: 2 },
    progressText: { fontSize: Typography.sizes.xs, color: Colors.textMuted, marginTop: 4 },
    scoreBadge: { backgroundColor: 'rgba(107, 183, 123, 0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.sm },
    scoreText: { fontSize: Typography.sizes.sm, fontWeight: Typography.semibold, color: Colors.success },
    newBadge: { backgroundColor: Colors.accentSoft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.sm },
    newText: { fontSize: Typography.sizes.xs, fontWeight: Typography.bold, color: Colors.accent },
    generateButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accent, borderRadius: BorderRadius.md, padding: 16, marginTop: 32, gap: 8 },
    generateText: { fontSize: Typography.sizes.base, fontWeight: Typography.medium, color: Colors.white },
});
