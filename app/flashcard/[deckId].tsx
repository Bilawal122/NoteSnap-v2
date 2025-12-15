import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore, Flashcard } from '../../stores/appStore';
import { Colors, Gradients, BorderRadius, Typography, Shadows } from '../../constants/theme';

const { width } = Dimensions.get('window');

// Dynamic text sizing
function getTextSize(text: string): number {
    const len = text?.length || 0;
    if (len > 300) return 14;
    if (len > 200) return 16;
    if (len > 100) return 18;
    if (len > 50) return 22;
    return 26;
}

export default function FlashcardViewer() {
    const { deckId } = useLocalSearchParams<{ deckId: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { decks, updateCardProgress, incrementCardsStudied } = useAppStore();

    const deck = decks.find(d => d.id === deckId);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [flipAnim] = useState(new Animated.Value(0));
    const [sessionStats, setSessionStats] = useState({ reviewed: 0, correct: 0 });
    const [showResults, setShowResults] = useState(false);

    const currentCard = deck?.cards[currentIndex];

    const flipCard = useCallback(() => {
        Animated.spring(flipAnim, { toValue: isFlipped ? 0 : 1, friction: 8, tension: 10, useNativeDriver: true }).start();
        setIsFlipped(!isFlipped);
    }, [isFlipped, flipAnim]);

    const handleAnswer = useCallback((confidence: Flashcard['confidence'], correct: boolean) => {
        if (!deck || !currentCard) return;
        updateCardProgress(deck.id, currentCard.id, correct, confidence);
        setSessionStats(prev => ({ reviewed: prev.reviewed + 1, correct: correct ? prev.correct + 1 : prev.correct }));

        if (currentIndex < deck.cards.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setIsFlipped(false);
            flipAnim.setValue(0);
        } else {
            incrementCardsStudied(sessionStats.reviewed + 1);
            setShowResults(true);
        }
    }, [deck, currentCard, currentIndex, flipAnim, updateCardProgress, incrementCardsStudied, sessionStats]);

    const frontInterpolate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
    const backInterpolate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });

    if (!deck) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <LinearGradient colors={Gradients.background} style={StyleSheet.absoluteFill} />
                <Text style={styles.errorText}>Deck not found</Text>
                <TouchableOpacity onPress={() => router.back()}><Text style={styles.linkText}>Go back</Text></TouchableOpacity>
            </View>
        );
    }

    if (showResults) {
        const accuracy = sessionStats.reviewed > 0 ? Math.round((sessionStats.correct / sessionStats.reviewed) * 100) : 0;
        return (
            <View style={styles.container}>
                <LinearGradient colors={Gradients.background} style={StyleSheet.absoluteFill} />
                <View style={[styles.resultsContainer, { paddingTop: insets.top + 60 }]}>
                    <LinearGradient colors={Gradients.primary} style={styles.resultsIcon}>
                        <Ionicons name="trophy" size={48} color="#fff" />
                    </LinearGradient>
                    <Text style={styles.resultsTitle}>Session Complete! 🎉</Text>
                    <Text style={styles.resultsSubtitle}>Great work studying {deck.title}</Text>
                    <View style={styles.statsGrid}>
                        <View style={styles.statBox}>
                            <Text style={styles.statValue}>{sessionStats.reviewed}</Text>
                            <Text style={styles.statLabel}>Cards Reviewed</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={[styles.statValue, { color: Colors.success }]}>{accuracy}%</Text>
                            <Text style={styles.statLabel}>Accuracy</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.doneButton} onPress={() => router.back()}>
                        <LinearGradient colors={Gradients.primary} style={styles.doneButtonGradient}>
                            <Text style={styles.doneButtonText}>Done</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const frontTextSize = getTextSize(currentCard?.front || '');
    const backTextSize = getTextSize(currentCard?.back || '');
    const needsScroll = (currentCard?.back?.length || 0) > 150;

    return (
        <View style={styles.container}>
            <LinearGradient colors={Gradients.background} style={StyleSheet.absoluteFill} />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="close" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>{deck.title}</Text>
                    <Text style={styles.headerProgress}>{currentIndex + 1} / {deck.cards.length}</Text>
                </View>
                <View style={{ width: 44 }} />
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                    <LinearGradient colors={Gradients.primary} style={[styles.progressFill, { width: `${((currentIndex + 1) / deck.cards.length) * 100}%` }]} />
                </View>
            </View>

            {/* Card */}
            <View style={styles.cardContainer}>
                <TouchableOpacity activeOpacity={0.95} onPress={flipCard} style={styles.cardWrapper}>
                    {/* Front */}
                    <Animated.View style={[styles.card, { transform: [{ rotateY: frontInterpolate }] }]}>
                        <View style={styles.cardGradient}>
                            <View style={styles.cardLabelBadge}><Text style={styles.cardLabel}>QUESTION</Text></View>
                            <ScrollView style={styles.cardScrollView} contentContainerStyle={styles.cardScrollContent} showsVerticalScrollIndicator={false}>
                                <Text style={[styles.cardText, { fontSize: frontTextSize }]}>{currentCard?.front}</Text>
                            </ScrollView>
                            <Text style={styles.tapHint}>Tap to reveal answer</Text>
                        </View>
                    </Animated.View>

                    {/* Back */}
                    <Animated.View style={[styles.card, styles.cardBack, { transform: [{ rotateY: backInterpolate }] }]}>
                        <LinearGradient colors={Gradients.primary} style={styles.cardGradient}>
                            <View style={[styles.cardLabelBadge, styles.cardLabelBadgeBack]}><Text style={[styles.cardLabel, { color: Colors.primary }]}>ANSWER</Text></View>
                            <ScrollView style={styles.cardScrollView} contentContainerStyle={styles.cardScrollContent} showsVerticalScrollIndicator={needsScroll} indicatorStyle="white">
                                <Text style={[styles.cardText, styles.cardTextBack, { fontSize: backTextSize }]}>{currentCard?.back}</Text>
                            </ScrollView>
                            {needsScroll && <Text style={styles.scrollHint}>↕ Scroll for more</Text>}
                        </LinearGradient>
                    </Animated.View>
                </TouchableOpacity>
            </View>

            {/* Answer Buttons */}
            {isFlipped && (
                <View style={styles.answerButtons}>
                    <TouchableOpacity style={styles.answerBtn} onPress={() => handleAnswer('learning', false)} activeOpacity={0.8}>
                        <LinearGradient colors={['#ef4444', '#f87171']} style={styles.answerBtnGradient}>
                            <Ionicons name="close" size={22} color="#fff" />
                            <Text style={styles.answerBtnText}>Hard</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.answerBtn} onPress={() => handleAnswer('reviewing', true)} activeOpacity={0.8}>
                        <LinearGradient colors={['#f59e0b', '#fbbf24']} style={styles.answerBtnGradient}>
                            <Ionicons name="remove" size={22} color="#fff" />
                            <Text style={styles.answerBtnText}>Medium</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.answerBtn} onPress={() => handleAnswer('mastered', true)} activeOpacity={0.8}>
                        <LinearGradient colors={['#10b981', '#34d399']} style={styles.answerBtnGradient}>
                            <Ionicons name="checkmark" size={22} color="#fff" />
                            <Text style={styles.answerBtnText}>Easy</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            )}

            {!isFlipped && (
                <View style={styles.swipeHint}>
                    <Text style={styles.swipeHintText}>Tap card to flip</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 12 },
    backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center', ...Shadows.sm },
    headerCenter: { flex: 1, alignItems: 'center' },
    headerTitle: { fontSize: Typography.sizes.lg, fontWeight: Typography.bold, color: Colors.textPrimary },
    headerProgress: { fontSize: Typography.sizes.sm, color: Colors.textSecondary, marginTop: 2 },
    progressContainer: { paddingHorizontal: 24, marginBottom: 24 },
    progressBar: { height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 3 },
    cardContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
    cardWrapper: { width: width - 48, height: 400 },
    card: { position: 'absolute', width: '100%', height: '100%', borderRadius: BorderRadius.xl, backfaceVisibility: 'hidden', ...Shadows.lg },
    cardBack: { position: 'absolute' },
    cardGradient: { flex: 1, borderRadius: BorderRadius.xl, padding: 24, paddingTop: 20, alignItems: 'center', backgroundColor: Colors.card },
    cardLabelBadge: { backgroundColor: Colors.accentSoft, paddingHorizontal: 14, paddingVertical: 6, borderRadius: BorderRadius.full, marginBottom: 16 },
    cardLabelBadgeBack: { backgroundColor: 'rgba(255,255,255,0.2)' },
    cardLabel: { fontSize: Typography.sizes.xs, fontWeight: Typography.bold, color: Colors.primary, letterSpacing: 1 },
    cardScrollView: { flex: 1, width: '100%' },
    cardScrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 8 },
    cardText: { fontWeight: Typography.semibold, color: Colors.textPrimary, textAlign: 'center', lineHeight: 34 },
    cardTextBack: { color: '#fff' },
    tapHint: { fontSize: Typography.sizes.sm, color: Colors.textMuted, marginTop: 12 },
    scrollHint: { fontSize: Typography.sizes.xs, color: 'rgba(255,255,255,0.7)', marginTop: 8 },
    answerButtons: { flexDirection: 'row', justifyContent: 'center', gap: 10, paddingHorizontal: 24, paddingBottom: 40 },
    answerBtn: { flex: 1, borderRadius: BorderRadius.lg, overflow: 'hidden', ...Shadows.sm },
    answerBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 6 },
    answerBtnText: { fontSize: Typography.sizes.sm, fontWeight: Typography.bold, color: '#fff' },
    swipeHint: { alignItems: 'center', paddingBottom: 40 },
    swipeHintText: { fontSize: Typography.sizes.sm, color: Colors.textMuted },
    resultsContainer: { flex: 1, alignItems: 'center', paddingHorizontal: 24 },
    resultsIcon: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 24, ...Shadows.glow },
    resultsTitle: { fontSize: Typography.sizes['3xl'], fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: 8 },
    resultsSubtitle: { fontSize: Typography.sizes.base, color: Colors.textSecondary, marginBottom: 40 },
    statsGrid: { flexDirection: 'row', gap: 16, marginBottom: 40 },
    statBox: { flex: 1, backgroundColor: Colors.card, borderRadius: BorderRadius.lg, padding: 24, alignItems: 'center', ...Shadows.sm },
    statValue: { fontSize: Typography.sizes['3xl'], fontWeight: Typography.bold, color: Colors.textPrimary },
    statLabel: { fontSize: Typography.sizes.sm, color: Colors.textSecondary, marginTop: 4 },
    doneButton: { borderRadius: BorderRadius.lg, overflow: 'hidden', ...Shadows.md },
    doneButtonGradient: { paddingVertical: 16, paddingHorizontal: 56 },
    doneButtonText: { fontSize: Typography.sizes.lg, fontWeight: Typography.bold, color: '#fff' },
    errorText: { fontSize: Typography.sizes.lg, color: Colors.textSecondary, textAlign: 'center', marginTop: 100 },
    linkText: { fontSize: Typography.sizes.base, color: Colors.primary, textAlign: 'center', marginTop: 16 },
});
