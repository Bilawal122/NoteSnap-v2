import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore, sortItems, getDeckProgress, FlashcardDeck, Quiz, SortOption } from '../../stores/appStore';
import { Colors, Gradients, BorderRadius, Typography, Shadows } from '../../constants/theme';

type Tab = 'flashcards' | 'quizzes';

function SortPicker({ value, onChange }: { value: SortOption; onChange: (v: SortOption) => void }) {
    const options: { value: SortOption; label: string }[] = [
        { value: 'newest', label: 'Newest' },
        { value: 'oldest', label: 'Oldest' },
        { value: 'alphabetical', label: 'A-Z' },
        { value: 'favorites', label: '★' },
    ];

    return (
        <View style={styles.sortContainer}>
            {options.map(opt => (
                <TouchableOpacity
                    key={opt.value}
                    style={[styles.sortOption, value === opt.value && styles.sortOptionActive]}
                    onPress={() => onChange(opt.value)}
                >
                    <Text style={[styles.sortOptionText, value === opt.value && styles.sortOptionTextActive]}>{opt.label}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

function DeckCard({ deck, onPress, onManage, onToggleFavorite }: { deck: FlashcardDeck; onPress: () => void; onManage: () => void; onToggleFavorite: () => void }) {
    const progress = getDeckProgress(deck);
    const masteredCount = deck.cards.filter(c => c.confidence === 'mastered').length;

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
            <LinearGradient colors={['#ffffff', '#f8f8f8']} style={styles.card}>
                <View style={styles.cardIcon}>
                    <Ionicons name="layers" size={22} color={Colors.primary} />
                </View>
                <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle} numberOfLines={1}>{deck.title}</Text>
                        <View style={styles.cardActions}>
                            <TouchableOpacity onPress={(e) => { e.stopPropagation(); onManage(); }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                <Ionicons name="settings-outline" size={18} color={Colors.textMuted} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={(e) => { e.stopPropagation(); onToggleFavorite(); }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                <Ionicons name={deck.isFavorite ? "star" : "star-outline"} size={18} color={deck.isFavorite ? Colors.warning : Colors.textMuted} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <Text style={styles.cardMeta}>{deck.cards.length} cards • {masteredCount} mastered</Text>
                </View>
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <LinearGradient colors={Gradients.primary} style={[styles.progressFill, { width: `${progress}%` }]} />
                    </View>
                    <Text style={styles.progressText}>{progress}%</Text>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
}

function QuizCard({ quiz, onPress, onToggleFavorite, bestScore }: { quiz: Quiz; onPress: () => void; onToggleFavorite: () => void; bestScore: number | null }) {
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
            <LinearGradient colors={['#ffffff', '#f8f8f8']} style={styles.card}>
                <View style={[styles.cardIcon, { backgroundColor: 'rgba(229, 168, 75, 0.15)' }]}>
                    <Ionicons name="help-circle" size={22} color={Colors.warning} />
                </View>
                <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle} numberOfLines={1}>{quiz.title}</Text>
                        <TouchableOpacity onPress={(e) => { e.stopPropagation(); onToggleFavorite(); }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <Ionicons name={quiz.isFavorite ? "star" : "star-outline"} size={18} color={quiz.isFavorite ? Colors.warning : Colors.textMuted} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.cardMeta}>{quiz.questions.length} questions</Text>
                </View>
                {bestScore !== null ? (
                    <View style={[styles.scoreBadge, { backgroundColor: bestScore >= 70 ? 'rgba(107, 183, 123, 0.15)' : 'rgba(229, 115, 115, 0.15)' }]}>
                        <Text style={[styles.scoreText, { color: bestScore >= 70 ? Colors.success : '#e57373' }]}>{bestScore}%</Text>
                    </View>
                ) : (
                    <View style={styles.newBadge}>
                        <Text style={styles.newText}>NEW</Text>
                    </View>
                )}
            </LinearGradient>
        </TouchableOpacity>
    );
}

function EmptyState({ type, onCreateWithAI }: { type: 'flashcards' | 'quizzes'; onCreateWithAI: () => void }) {
    const isQuiz = type === 'quizzes';
    return (
        <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: isQuiz ? 'rgba(229, 168, 75, 0.1)' : Colors.divider }]}>
                <Ionicons name={isQuiz ? "help-circle-outline" : "layers-outline"} size={48} color={isQuiz ? Colors.warning : Colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>No {type} yet</Text>
            <Text style={styles.emptySubtitle}>Create with AI or from your notes</Text>
            <TouchableOpacity style={styles.createButton} onPress={onCreateWithAI}>
                <Ionicons name="sparkles" size={18} color={Colors.white} />
                <Text style={styles.createButtonText}>Create with AI</Text>
            </TouchableOpacity>
        </View>
    );
}

export default function StudyScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [tab, setTab] = useState<Tab>('flashcards');
    const {
        decks, quizzes, quizAttempts,
        decksSortBy, quizzesSortBy,
        setDecksSortBy, setQuizzesSortBy,
        toggleDeckFavorite, toggleQuizFavorite
    } = useAppStore();

    const sortedDecks = sortItems(decks, decksSortBy);
    const sortedQuizzes = sortItems(quizzes, quizzesSortBy);

    const handleDeckPress = (deckId: string) => router.push(`/flashcard/${deckId}`);
    const handleQuizPress = (quizId: string) => router.push(`/quiz/${quizId}`);
    const handleCreateWithAI = () => router.push('/ai');

    const getBestScore = (quizId: string): number | null => {
        const attempts = quizAttempts.filter(a => a.quizId === quizId);
        if (attempts.length === 0) return null;
        return Math.max(...attempts.map(a => Math.round((a.score / a.totalQuestions) * 100)));
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#faf3dd', '#f0ead2']} style={StyleSheet.absoluteFill} />

            <ScrollView
                contentContainerStyle={[styles.content, { paddingTop: insets.top + 24, paddingBottom: 120 }]}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.title}>Study</Text>

                {/* Tabs */}
                <View style={styles.tabs}>
                    <TouchableOpacity onPress={() => setTab('flashcards')} style={[styles.tab, tab === 'flashcards' && styles.tabActive]}>
                        <Ionicons name="layers" size={18} color={tab === 'flashcards' ? Colors.white : Colors.textSecondary} />
                        <Text style={[styles.tabText, tab === 'flashcards' && styles.tabTextActive]}>Flashcards</Text>
                        {decks.length > 0 && <View style={styles.tabBadge}><Text style={styles.tabBadgeText}>{decks.length}</Text></View>}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setTab('quizzes')} style={[styles.tab, tab === 'quizzes' && styles.tabActive]}>
                        <Ionicons name="help-circle" size={18} color={tab === 'quizzes' ? Colors.white : Colors.textSecondary} />
                        <Text style={[styles.tabText, tab === 'quizzes' && styles.tabTextActive]}>Quizzes</Text>
                        {quizzes.length > 0 && <View style={styles.tabBadge}><Text style={styles.tabBadgeText}>{quizzes.length}</Text></View>}
                    </TouchableOpacity>
                </View>

                {/* Sort */}
                <SortPicker
                    value={tab === 'flashcards' ? decksSortBy : quizzesSortBy}
                    onChange={tab === 'flashcards' ? setDecksSortBy : setQuizzesSortBy}
                />

                {/* Content */}
                {tab === 'flashcards' ? (
                    <View style={styles.list}>
                        {sortedDecks.length === 0 ? (
                            <EmptyState type="flashcards" onCreateWithAI={handleCreateWithAI} />
                        ) : (
                            <>
                                {sortedDecks.map(deck => (
                                    <DeckCard
                                        key={deck.id}
                                        deck={deck}
                                        onPress={() => handleDeckPress(deck.id)}
                                        onManage={() => router.push(`/deck/${deck.id}`)}
                                        onToggleFavorite={() => toggleDeckFavorite(deck.id)}
                                    />
                                ))}
                                <TouchableOpacity style={styles.generateButton} onPress={handleCreateWithAI}>
                                    <Ionicons name="sparkles-outline" size={18} color={Colors.white} />
                                    <Text style={styles.generateText}>Generate More</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                ) : (
                    <View style={styles.list}>
                        {sortedQuizzes.length === 0 ? (
                            <EmptyState type="quizzes" onCreateWithAI={handleCreateWithAI} />
                        ) : (
                            <>
                                {sortedQuizzes.map(quiz => (
                                    <QuizCard
                                        key={quiz.id}
                                        quiz={quiz}
                                        onPress={() => handleQuizPress(quiz.id)}
                                        onToggleFavorite={() => toggleQuizFavorite(quiz.id)}
                                        bestScore={getBestScore(quiz.id)}
                                    />
                                ))}
                                <TouchableOpacity style={styles.generateButton} onPress={handleCreateWithAI}>
                                    <Ionicons name="sparkles-outline" size={18} color={Colors.white} />
                                    <Text style={styles.generateText}>Generate Quiz</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    content: { paddingHorizontal: 24 },
    title: { fontSize: Typography.sizes['3xl'], fontWeight: Typography.semibold, color: Colors.textPrimary, marginBottom: 24 },
    tabs: { flexDirection: 'row', backgroundColor: Colors.card, borderRadius: BorderRadius.lg, padding: 4, marginBottom: 16, ...Shadows.sm },
    tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: BorderRadius.md, gap: 6 },
    tabActive: { backgroundColor: Colors.accent },
    tabText: { fontSize: Typography.sizes.sm, fontWeight: Typography.medium, color: Colors.textSecondary },
    tabTextActive: { color: Colors.white },
    tabBadge: { backgroundColor: 'rgba(0,0,0,0.15)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, marginLeft: 4 },
    tabBadgeText: { fontSize: 10, fontWeight: Typography.bold, color: Colors.textSecondary },
    sortContainer: { flexDirection: 'row', marginBottom: 16, gap: 8 },
    sortOption: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: BorderRadius.full, backgroundColor: Colors.card, ...Shadows.sm },
    sortOptionActive: { backgroundColor: Colors.accent },
    sortOptionText: { fontSize: Typography.sizes.sm, color: Colors.textSecondary, fontWeight: Typography.medium },
    sortOptionTextActive: { color: Colors.white },
    list: { gap: 12 },
    card: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: BorderRadius.lg, ...Shadows.sm },
    cardIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.accentSoft, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
    cardContent: { flex: 1 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    cardActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    cardTitle: { flex: 1, fontSize: Typography.sizes.base, fontWeight: Typography.medium, color: Colors.textPrimary },
    cardMeta: { fontSize: Typography.sizes.sm, color: Colors.textSecondary, marginTop: 2 },
    progressContainer: { alignItems: 'flex-end' },
    progressBar: { width: 50, height: 4, backgroundColor: Colors.divider, borderRadius: 2, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: Colors.accent, borderRadius: 2 },
    progressText: { fontSize: Typography.sizes.xs, color: Colors.textMuted, marginTop: 4 },
    scoreBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.md },
    scoreText: { fontSize: Typography.sizes.sm, fontWeight: Typography.bold },
    newBadge: { backgroundColor: Colors.accentSoft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.sm },
    newText: { fontSize: Typography.sizes.xs, fontWeight: Typography.bold, color: Colors.accent },
    generateButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accent, borderRadius: BorderRadius.lg, padding: 16, marginTop: 8, gap: 8, ...Shadows.md },
    generateText: { fontSize: Typography.sizes.base, fontWeight: Typography.semibold, color: Colors.white },
    emptyState: { alignItems: 'center', paddingVertical: 60 },
    emptyIcon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    emptyTitle: { fontSize: Typography.sizes.xl, fontWeight: Typography.semibold, color: Colors.textPrimary, marginBottom: 8 },
    emptySubtitle: { fontSize: Typography.sizes.base, color: Colors.textSecondary, marginBottom: 24 },
    createButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.accent, paddingVertical: 14, paddingHorizontal: 24, borderRadius: BorderRadius.lg, gap: 8, ...Shadows.md },
    createButtonText: { fontSize: Typography.sizes.base, fontWeight: Typography.semibold, color: Colors.white },
});
