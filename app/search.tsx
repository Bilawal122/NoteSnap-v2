import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '../stores/appStore';
import { useTheme, Colors, Gradients, BorderRadius, Typography, Shadows } from '../contexts/ThemeContext';

type SearchResultType = 'note' | 'deck' | 'quiz';

interface SearchResult {
    id: string;
    type: SearchResultType;
    title: string;
    subtitle: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
}

export default function SearchScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { notes, decks, quizzes } = useAppStore();
    const [query, setQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | SearchResultType>('all');

    // Search logic
    const searchResults = useMemo(() => {
        if (!query.trim()) return [];

        const q = query.toLowerCase();
        const results: SearchResult[] = [];

        // Search notes
        if (activeFilter === 'all' || activeFilter === 'note') {
            notes.forEach(note => {
                if (note.title.toLowerCase().includes(q) || note.content.toLowerCase().includes(q)) {
                    results.push({
                        id: note.id,
                        type: 'note',
                        title: note.title,
                        subtitle: `${note.wordCount} words • ${note.content.slice(0, 50)}...`,
                        icon: 'document-text',
                        color: Colors.primary,
                    });
                }
            });
        }

        // Search decks
        if (activeFilter === 'all' || activeFilter === 'deck') {
            decks.forEach(deck => {
                const matchDeck = deck.title.toLowerCase().includes(q);
                const matchCards = deck.cards.some(c =>
                    c.front.toLowerCase().includes(q) || c.back.toLowerCase().includes(q)
                );
                if (matchDeck || matchCards) {
                    results.push({
                        id: deck.id,
                        type: 'deck',
                        title: deck.title,
                        subtitle: `${deck.cards.length} flashcards`,
                        icon: 'layers',
                        color: Colors.teal,
                    });
                }
            });
        }

        // Search quizzes
        if (activeFilter === 'all' || activeFilter === 'quiz') {
            quizzes.forEach(quiz => {
                const matchQuiz = quiz.title.toLowerCase().includes(q);
                const matchQuestions = quiz.questions.some(q =>
                    q.question.toLowerCase().includes(query.toLowerCase())
                );
                if (matchQuiz || matchQuestions) {
                    results.push({
                        id: quiz.id,
                        type: 'quiz',
                        title: quiz.title,
                        subtitle: `${quiz.questions.length} questions`,
                        icon: 'help-circle',
                        color: Colors.warning,
                    });
                }
            });
        }

        return results;
    }, [query, notes, decks, quizzes, activeFilter]);

    const handleResultPress = (result: SearchResult) => {
        switch (result.type) {
            case 'note':
                router.push(`/notes/${result.id}`);
                break;
            case 'deck':
                router.push(`/flashcard/${result.id}`);
                break;
            case 'quiz':
                router.push(`/quiz/${result.id}`);
                break;
        }
    };

    const filters: { key: 'all' | SearchResultType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
        { key: 'all', label: 'All', icon: 'apps' },
        { key: 'note', label: 'Notes', icon: 'document-text' },
        { key: 'deck', label: 'Decks', icon: 'layers' },
        { key: 'quiz', label: 'Quizzes', icon: 'help-circle' },
    ];

    const renderResult = ({ item }: { item: SearchResult }) => (
        <TouchableOpacity style={styles.resultCard} onPress={() => handleResultPress(item)}>
            <View style={[styles.resultIcon, { backgroundColor: `${item.color}15` }]}>
                <Ionicons name={item.icon} size={20} color={item.color} />
            </View>
            <View style={styles.resultContent}>
                <Text style={styles.resultTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.resultSubtitle} numberOfLines={1}>{item.subtitle}</Text>
            </View>
            <View style={styles.resultBadge}>
                <Text style={[styles.resultBadgeText, { color: item.color }]}>
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <LinearGradient colors={Gradients.background} style={StyleSheet.absoluteFill} />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <View style={styles.searchBox}>
                    <Ionicons name="search" size={20} color={Colors.textMuted} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search notes, decks, quizzes..."
                        placeholderTextColor={Colors.textMuted}
                        value={query}
                        onChangeText={setQuery}
                        autoFocus
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => setQuery('')}>
                            <Ionicons name="close-circle" size={20} color={Colors.textMuted} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Filters */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer} contentContainerStyle={styles.filters}>
                {filters.map(filter => (
                    <TouchableOpacity
                        key={filter.key}
                        style={[styles.filterChip, activeFilter === filter.key && styles.filterChipActive]}
                        onPress={() => setActiveFilter(filter.key)}
                    >
                        <Ionicons
                            name={filter.icon}
                            size={16}
                            color={activeFilter === filter.key ? '#fff' : Colors.textSecondary}
                        />
                        <Text style={[styles.filterText, activeFilter === filter.key && styles.filterTextActive]}>
                            {filter.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Results */}
            {query.trim() === '' ? (
                <View style={styles.emptyState}>
                    <Ionicons name="search" size={64} color={Colors.textMuted} />
                    <Text style={styles.emptyTitle}>Search your study materials</Text>
                    <Text style={styles.emptySubtitle}>Find notes, flashcard decks, and quizzes</Text>
                </View>
            ) : searchResults.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="folder-open-outline" size={64} color={Colors.textMuted} />
                    <Text style={styles.emptyTitle}>No results found</Text>
                    <Text style={styles.emptySubtitle}>Try a different search term</Text>
                </View>
            ) : (
                <FlatList
                    data={searchResults}
                    keyExtractor={item => `${item.type}-${item.id}`}
                    renderItem={renderResult}
                    contentContainerStyle={styles.resultsList}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, gap: 12 },
    backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center', ...Shadows.sm },
    searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: BorderRadius.lg, paddingHorizontal: 14, height: 48, gap: 10, ...Shadows.sm },
    searchInput: { flex: 1, fontSize: Typography.sizes.base, color: Colors.textPrimary },
    filtersContainer: { maxHeight: 50 },
    filters: { paddingHorizontal: 16, gap: 8, flexDirection: 'row' },
    filterChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: BorderRadius.full, backgroundColor: Colors.card, gap: 6, ...Shadows.sm },
    filterChipActive: { backgroundColor: Colors.primary },
    filterText: { fontSize: Typography.sizes.sm, color: Colors.textSecondary, fontWeight: Typography.medium },
    filterTextActive: { color: '#fff' },
    resultsList: { padding: 16, paddingBottom: 100 },
    resultCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: BorderRadius.lg, padding: 14, marginBottom: 10, ...Shadows.sm },
    resultIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    resultContent: { flex: 1 },
    resultTitle: { fontSize: Typography.sizes.base, fontWeight: Typography.semibold, color: Colors.textPrimary, marginBottom: 2 },
    resultSubtitle: { fontSize: Typography.sizes.sm, color: Colors.textSecondary },
    resultBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.sm, backgroundColor: Colors.background },
    resultBadgeText: { fontSize: Typography.sizes.xs, fontWeight: Typography.semibold },
    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 100 },
    emptyTitle: { fontSize: Typography.sizes.lg, fontWeight: Typography.semibold, color: Colors.textPrimary, marginTop: 16 },
    emptySubtitle: { fontSize: Typography.sizes.base, color: Colors.textSecondary, marginTop: 4 },
});
