import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore, sortItems, getDeckProgress, FlashcardDeck, Quiz, SortOption } from '../../stores/appStore';
import { useTheme, BorderRadius, Typography } from '../../contexts/ThemeContext';

type Tab = 'flashcards' | 'quizzes';

export default function StudyScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { colors, gradients, shadows, isDarkMode } = useTheme();
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

    // Dynamic styles
    const dynamicStyles = {
        container: { flex: 1, backgroundColor: colors.background },
        title: { fontSize: Typography.sizes['3xl'], fontWeight: Typography.semibold as any, color: colors.textPrimary, marginBottom: 24 },
        tabs: { flexDirection: 'row' as const, backgroundColor: colors.card, borderRadius: BorderRadius.lg, padding: 4, marginBottom: 16, ...shadows.sm },
        tab: { flex: 1, flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'center' as const, paddingVertical: 12, borderRadius: BorderRadius.md, gap: 6 },
        tabActive: { backgroundColor: colors.primary },
        tabText: { fontSize: Typography.sizes.sm, fontWeight: Typography.medium as any, color: colors.textSecondary },
        tabTextActive: { color: '#ffffff' },
        sortOption: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: BorderRadius.full, backgroundColor: colors.card, ...shadows.sm },
        sortOptionActive: { backgroundColor: colors.primary },
        sortOptionText: { fontSize: Typography.sizes.sm, color: colors.textSecondary, fontWeight: Typography.medium as any },
        sortOptionTextActive: { color: '#ffffff' },
        card: { flexDirection: 'row' as const, alignItems: 'center' as const, padding: 16, borderRadius: BorderRadius.lg, backgroundColor: colors.card, ...shadows.sm },
        cardIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: isDarkMode ? 'rgba(99,102,241,0.2)' : colors.accentSoft, alignItems: 'center' as const, justifyContent: 'center' as const, marginRight: 14 },
        cardTitle: { flex: 1, fontSize: Typography.sizes.base, fontWeight: Typography.medium as any, color: colors.textPrimary },
        cardMeta: { fontSize: Typography.sizes.sm, color: colors.textSecondary, marginTop: 2 },
        progressBar: { width: 50, height: 4, backgroundColor: colors.divider, borderRadius: 2, overflow: 'hidden' as const },
        progressText: { fontSize: Typography.sizes.xs, color: colors.textMuted, marginTop: 4 },
        generateButton: { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'center' as const, backgroundColor: colors.primary, borderRadius: BorderRadius.lg, padding: 16, marginTop: 8, gap: 8, ...shadows.md },
        generateText: { fontSize: Typography.sizes.base, fontWeight: Typography.semibold as any, color: '#ffffff' },
        emptyIcon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center' as const, justifyContent: 'center' as const, marginBottom: 16, backgroundColor: colors.divider },
        emptyTitle: { fontSize: Typography.sizes.xl, fontWeight: Typography.semibold as any, color: colors.textPrimary, marginBottom: 8 },
        emptySubtitle: { fontSize: Typography.sizes.base, color: colors.textSecondary, marginBottom: 24 },
        createButton: { flexDirection: 'row' as const, alignItems: 'center' as const, backgroundColor: colors.primary, paddingVertical: 14, paddingHorizontal: 24, borderRadius: BorderRadius.lg, gap: 8, ...shadows.md },
        createButtonText: { fontSize: Typography.sizes.base, fontWeight: Typography.semibold as any, color: '#ffffff' },
        newBadge: { backgroundColor: isDarkMode ? 'rgba(99,102,241,0.2)' : colors.accentSoft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.sm },
        newText: { fontSize: Typography.sizes.xs, fontWeight: Typography.bold as any, color: colors.primary },
    };

    const renderSortPicker = (value: SortOption, onChange: (v: SortOption) => void) => {
        const options: { value: SortOption; label: string }[] = [
            { value: 'newest', label: 'Newest' },
            { value: 'oldest', label: 'Oldest' },
            { value: 'alphabetical', label: 'A-Z' },
            { value: 'favorites', label: '★' },
        ];
        return (
            <View style={{ flexDirection: 'row', marginBottom: 16, gap: 8 }}>
                {options.map(opt => (
                    <TouchableOpacity
                        key={opt.value}
                        style={[dynamicStyles.sortOption, value === opt.value && dynamicStyles.sortOptionActive]}
                        onPress={() => onChange(opt.value)}
                    >
                        <Text style={[dynamicStyles.sortOptionText, value === opt.value && dynamicStyles.sortOptionTextActive]}>{opt.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    const renderDeckCard = (deck: FlashcardDeck) => {
        const progress = getDeckProgress(deck);
        const masteredCount = deck.cards.filter(c => c.confidence === 'mastered').length;
        return (
            <TouchableOpacity key={deck.id} onPress={() => handleDeckPress(deck.id)} activeOpacity={0.8}>
                <View style={dynamicStyles.card}>
                    <View style={dynamicStyles.cardIcon}>
                        <Ionicons name="layers" size={22} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Text style={dynamicStyles.cardTitle} numberOfLines={1}>{deck.title}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                <TouchableOpacity onPress={(e) => { e.stopPropagation(); router.push(`/deck/${deck.id}`); }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                    <Ionicons name="settings-outline" size={18} color={colors.textMuted} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={(e) => { e.stopPropagation(); toggleDeckFavorite(deck.id); }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                    <Ionicons name={deck.isFavorite ? "star" : "star-outline"} size={18} color={deck.isFavorite ? colors.warning : colors.textMuted} />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <Text style={dynamicStyles.cardMeta}>{deck.cards.length} cards • {masteredCount} mastered</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <View style={dynamicStyles.progressBar}>
                            <LinearGradient colors={gradients.primary} style={{ height: '100%', width: `${progress}%`, borderRadius: 2 }} />
                        </View>
                        <Text style={dynamicStyles.progressText}>{progress}%</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderQuizCard = (quiz: Quiz) => {
        const bestScore = getBestScore(quiz.id);
        return (
            <TouchableOpacity key={quiz.id} onPress={() => handleQuizPress(quiz.id)} activeOpacity={0.8}>
                <View style={dynamicStyles.card}>
                    <View style={[dynamicStyles.cardIcon, { backgroundColor: isDarkMode ? 'rgba(229,168,75,0.2)' : 'rgba(229, 168, 75, 0.15)' }]}>
                        <Ionicons name="help-circle" size={22} color={colors.warning} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Text style={dynamicStyles.cardTitle} numberOfLines={1}>{quiz.title}</Text>
                            <TouchableOpacity onPress={(e) => { e.stopPropagation(); toggleQuizFavorite(quiz.id); }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                <Ionicons name={quiz.isFavorite ? "star" : "star-outline"} size={18} color={quiz.isFavorite ? colors.warning : colors.textMuted} />
                            </TouchableOpacity>
                        </View>
                        <Text style={dynamicStyles.cardMeta}>{quiz.questions.length} questions</Text>
                    </View>
                    {bestScore !== null ? (
                        <View style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.md, backgroundColor: bestScore >= 70 ? 'rgba(107, 183, 123, 0.15)' : 'rgba(229, 115, 115, 0.15)' }}>
                            <Text style={{ fontSize: Typography.sizes.sm, fontWeight: Typography.bold as any, color: bestScore >= 70 ? colors.success : '#e57373' }}>{bestScore}%</Text>
                        </View>
                    ) : (
                        <View style={dynamicStyles.newBadge}>
                            <Text style={dynamicStyles.newText}>NEW</Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    const renderEmptyState = (type: 'flashcards' | 'quizzes') => {
        const isQuiz = type === 'quizzes';
        return (
            <View style={{ alignItems: 'center', paddingVertical: 60 }}>
                <View style={[dynamicStyles.emptyIcon, { backgroundColor: isQuiz ? (isDarkMode ? 'rgba(229,168,75,0.2)' : 'rgba(229, 168, 75, 0.1)') : colors.divider }]}>
                    <Ionicons name={isQuiz ? "help-circle-outline" : "layers-outline"} size={48} color={isQuiz ? colors.warning : colors.textMuted} />
                </View>
                <Text style={dynamicStyles.emptyTitle}>No {type} yet</Text>
                <Text style={dynamicStyles.emptySubtitle}>Create with AI or from your notes</Text>
                <TouchableOpacity style={dynamicStyles.createButton} onPress={handleCreateWithAI}>
                    <Ionicons name="sparkles" size={18} color="#ffffff" />
                    <Text style={dynamicStyles.createButtonText}>Create with AI</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={dynamicStyles.container}>
            <LinearGradient colors={isDarkMode ? ['#111827', '#1f2937'] : ['#faf3dd', '#f0ead2']} style={StyleSheet.absoluteFill} />

            <ScrollView
                contentContainerStyle={{ paddingHorizontal: 24, paddingTop: insets.top + 24, paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
            >
                <Text style={dynamicStyles.title}>Study</Text>

                {/* Tabs */}
                <View style={dynamicStyles.tabs}>
                    <TouchableOpacity onPress={() => setTab('flashcards')} style={[dynamicStyles.tab, tab === 'flashcards' && dynamicStyles.tabActive]}>
                        <Ionicons name="layers" size={18} color={tab === 'flashcards' ? '#ffffff' : colors.textSecondary} />
                        <Text style={[dynamicStyles.tabText, tab === 'flashcards' && dynamicStyles.tabTextActive]}>Flashcards</Text>
                        {decks.length > 0 && <View style={{ backgroundColor: 'rgba(0,0,0,0.15)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, marginLeft: 4 }}><Text style={{ fontSize: 10, fontWeight: Typography.bold as any, color: tab === 'flashcards' ? '#ffffff' : colors.textSecondary }}>{decks.length}</Text></View>}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setTab('quizzes')} style={[dynamicStyles.tab, tab === 'quizzes' && dynamicStyles.tabActive]}>
                        <Ionicons name="help-circle" size={18} color={tab === 'quizzes' ? '#ffffff' : colors.textSecondary} />
                        <Text style={[dynamicStyles.tabText, tab === 'quizzes' && dynamicStyles.tabTextActive]}>Quizzes</Text>
                        {quizzes.length > 0 && <View style={{ backgroundColor: 'rgba(0,0,0,0.15)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, marginLeft: 4 }}><Text style={{ fontSize: 10, fontWeight: Typography.bold as any, color: tab === 'quizzes' ? '#ffffff' : colors.textSecondary }}>{quizzes.length}</Text></View>}
                    </TouchableOpacity>
                </View>

                {/* Sort */}
                {renderSortPicker(tab === 'flashcards' ? decksSortBy : quizzesSortBy, tab === 'flashcards' ? setDecksSortBy : setQuizzesSortBy)}

                {/* Content */}
                <View style={{ gap: 12 }}>
                    {tab === 'flashcards' ? (
                        sortedDecks.length === 0 ? renderEmptyState('flashcards') : (
                            <>
                                {sortedDecks.map(renderDeckCard)}
                                <TouchableOpacity style={dynamicStyles.generateButton} onPress={handleCreateWithAI}>
                                    <Ionicons name="sparkles-outline" size={18} color="#ffffff" />
                                    <Text style={dynamicStyles.generateText}>Generate More</Text>
                                </TouchableOpacity>
                            </>
                        )
                    ) : (
                        sortedQuizzes.length === 0 ? renderEmptyState('quizzes') : (
                            <>
                                {sortedQuizzes.map(renderQuizCard)}
                                <TouchableOpacity style={dynamicStyles.generateButton} onPress={handleCreateWithAI}>
                                    <Ionicons name="sparkles-outline" size={18} color="#ffffff" />
                                    <Text style={dynamicStyles.generateText}>Generate Quiz</Text>
                                </TouchableOpacity>
                            </>
                        )
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({});
