import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '../../stores/appStore';
import { useTheme, Colors, Gradients, BorderRadius, Typography, Shadows } from '../../contexts/ThemeContext';

export default function QuizViewer() {
    const { quizId } = useLocalSearchParams<{ quizId: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { quizzes, addQuizAttempt } = useAppStore();

    const quiz = quizzes.find(q => q.id === quizId);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);
    const [showFinal, setShowFinal] = useState(false);

    const currentQuestion = quiz?.questions[currentIndex];

    const handleSelectAnswer = (index: number) => {
        if (showResult) return;
        setSelectedAnswer(index);
    };

    const handleSubmit = () => {
        if (selectedAnswer === null) return;
        const isCorrect = selectedAnswer === currentQuestion?.correctAnswer;
        if (isCorrect) setScore(prev => prev + 1);
        setShowResult(true);
    };

    const handleNext = () => {
        if (!quiz) return;
        if (currentIndex < quiz.questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setShowResult(false);
        } else {
            addQuizAttempt({
                id: Date.now().toString(),
                quizId: quiz.id,
                score: score + (selectedAnswer === currentQuestion?.correctAnswer ? 1 : 0),
                totalQuestions: quiz.questions.length,
                completedAt: new Date().toISOString(),
            });
            setShowFinal(true);
        }
    };

    if (!quiz) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <Text style={styles.errorText}>Quiz not found</Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.linkText}>Go back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (showFinal) {
        const finalScore = score + (selectedAnswer === currentQuestion?.correctAnswer ? 1 : 0);
        const percentage = Math.round((finalScore / quiz.questions.length) * 100);
        const isPassing = percentage >= 70;

        return (
            <View style={styles.container}>
                <LinearGradient colors={['#faf3dd', '#f0ead2']} style={StyleSheet.absoluteFill} />
                <View style={[styles.finalContainer, { paddingTop: insets.top + 60 }]}>
                    <View style={[styles.finalIcon, { backgroundColor: isPassing ? 'rgba(107, 183, 123, 0.15)' : 'rgba(229, 115, 115, 0.15)' }]}>
                        <Ionicons name={isPassing ? "trophy" : "refresh"} size={48} color={isPassing ? Colors.success : '#e57373'} />
                    </View>
                    <Text style={styles.finalTitle}>{isPassing ? 'Great Job!' : 'Keep Practicing!'}</Text>
                    <Text style={styles.finalSubtitle}>{quiz.title}</Text>

                    <View style={styles.scoreCard}>
                        <Text style={[styles.scoreValue, { color: isPassing ? Colors.success : '#e57373' }]}>{percentage}%</Text>
                        <Text style={styles.scoreLabel}>{finalScore} / {quiz.questions.length} correct</Text>
                    </View>

                    <TouchableOpacity style={styles.doneButton} onPress={() => router.back()}>
                        <Text style={styles.doneButtonText}>Done</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.retryButton} onPress={() => {
                        setCurrentIndex(0);
                        setSelectedAnswer(null);
                        setShowResult(false);
                        setScore(0);
                        setShowFinal(false);
                    }}>
                        <Text style={styles.retryButtonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#faf3dd', '#f0ead2']} style={StyleSheet.absoluteFill} />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="close" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>{quiz.title}</Text>
                    <Text style={styles.headerProgress}>Question {currentIndex + 1} of {quiz.questions.length}</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${((currentIndex + 1) / quiz.questions.length) * 100}%` }]} />
                </View>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false}>
                {/* Question Card */}
                <View style={styles.questionCard}>
                    <Text style={styles.questionNumber}>Question {currentIndex + 1}</Text>
                    <Text style={styles.questionText}>{currentQuestion?.question}</Text>
                </View>

                {/* Options - Clean without borders */}
                <View style={styles.optionsContainer}>
                    {currentQuestion?.options.map((option, index) => {
                        const isSelected = selectedAnswer === index;
                        const isCorrect = index === currentQuestion.correctAnswer;
                        const showCorrect = showResult && isCorrect;
                        const showIncorrect = showResult && isSelected && !isCorrect;

                        // Determine background colors
                        let bgColors: [string, string] = ['#ffffff', '#f8f8f8'];
                        if (showCorrect) bgColors = ['#e8f5e9', '#c8e6c9'];
                        else if (showIncorrect) bgColors = ['#ffebee', '#ffcdd2'];
                        else if (isSelected) bgColors = ['#e0f2f1', '#b2dfdb'];

                        return (
                            <TouchableOpacity
                                key={index}
                                activeOpacity={0.7}
                                onPress={() => handleSelectAnswer(index)}
                                disabled={showResult}
                            >
                                <LinearGradient colors={bgColors} style={styles.optionCard}>
                                    <View style={[
                                        styles.optionLetter,
                                        isSelected && !showResult && styles.optionLetterSelected,
                                        showCorrect && styles.optionLetterCorrect,
                                        showIncorrect && styles.optionLetterIncorrect,
                                    ]}>
                                        <Text style={[
                                            styles.optionLetterText,
                                            (isSelected || showCorrect || showIncorrect) && { color: '#fff' }
                                        ]}>
                                            {String.fromCharCode(65 + index)}
                                        </Text>
                                    </View>
                                    <Text style={styles.optionText}>{option}</Text>
                                    {showCorrect && <Ionicons name="checkmark-circle" size={24} color="#2e7d32" />}
                                    {showIncorrect && <Ionicons name="close-circle" size={24} color="#c62828" />}
                                </LinearGradient>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Explanation */}
                {showResult && currentQuestion?.explanation && (
                    <View style={styles.explanationCard}>
                        <Ionicons name="bulb" size={20} color={Colors.accent} />
                        <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
                    </View>
                )}
            </ScrollView>

            {/* Bottom Button */}
            <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + 24 }]}>
                {!showResult ? (
                    <TouchableOpacity
                        style={[styles.submitButton, selectedAnswer === null && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={selectedAnswer === null}
                    >
                        <Text style={styles.submitButtonText}>Check Answer</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.submitButton} onPress={handleNext}>
                        <Text style={styles.submitButtonText}>
                            {currentIndex < quiz.questions.length - 1 ? 'Next Question' : 'See Results'}
                        </Text>
                        <Ionicons name="arrow-forward" size={20} color={Colors.white} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 12 },
    backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center', ...Shadows.sm },
    headerCenter: { flex: 1, alignItems: 'center' },
    headerTitle: { fontSize: Typography.sizes.lg, fontWeight: Typography.semibold, color: Colors.textPrimary },
    headerProgress: { fontSize: Typography.sizes.sm, color: Colors.textSecondary, marginTop: 2 },
    progressContainer: { paddingHorizontal: 24, marginBottom: 16 },
    progressBar: { height: 4, backgroundColor: Colors.border, borderRadius: 2, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: Colors.accent, borderRadius: 2 },
    content: { flex: 1 },
    contentInner: { paddingHorizontal: 24, paddingBottom: 120 },
    questionCard: { backgroundColor: Colors.card, borderRadius: BorderRadius.lg, padding: 24, marginBottom: 24, ...Shadows.sm },
    questionNumber: { fontSize: Typography.sizes.sm, fontWeight: Typography.medium, color: Colors.accent, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
    questionText: { fontSize: Typography.sizes.xl, fontWeight: Typography.semibold, color: Colors.textPrimary, lineHeight: 30 },
    optionsContainer: { gap: 12 },
    optionCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: BorderRadius.lg, gap: 14, ...Shadows.sm },
    optionLetter: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.divider, alignItems: 'center', justifyContent: 'center' },
    optionLetterSelected: { backgroundColor: Colors.accent },
    optionLetterCorrect: { backgroundColor: '#2e7d32' },
    optionLetterIncorrect: { backgroundColor: '#c62828' },
    optionLetterText: { fontSize: Typography.sizes.base, fontWeight: Typography.bold, color: Colors.textSecondary },
    optionText: { flex: 1, fontSize: Typography.sizes.base, color: Colors.textPrimary, lineHeight: 22 },
    explanationCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: Colors.accentSoft, borderRadius: BorderRadius.lg, padding: 16, marginTop: 20, gap: 12 },
    explanationText: { flex: 1, fontSize: Typography.sizes.sm, color: Colors.textSecondary, lineHeight: 20 },
    bottomContainer: { paddingHorizontal: 24, paddingTop: 16, backgroundColor: Colors.background, borderTopWidth: 1, borderTopColor: Colors.border },
    submitButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accent, paddingVertical: 16, borderRadius: BorderRadius.lg, gap: 8, ...Shadows.md },
    submitButtonDisabled: { backgroundColor: Colors.divider },
    submitButtonText: { fontSize: Typography.sizes.lg, fontWeight: Typography.semibold, color: Colors.white },
    finalContainer: { flex: 1, alignItems: 'center', paddingHorizontal: 24 },
    finalIcon: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
    finalTitle: { fontSize: Typography.sizes['3xl'], fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: 8 },
    finalSubtitle: { fontSize: Typography.sizes.base, color: Colors.textSecondary, marginBottom: 32 },
    scoreCard: { backgroundColor: Colors.card, borderRadius: BorderRadius.xl, paddingVertical: 32, paddingHorizontal: 48, alignItems: 'center', marginBottom: 32, ...Shadows.md },
    scoreValue: { fontSize: 56, fontWeight: Typography.bold },
    scoreLabel: { fontSize: Typography.sizes.base, color: Colors.textSecondary, marginTop: 8 },
    doneButton: { backgroundColor: Colors.accent, paddingVertical: 16, paddingHorizontal: 48, borderRadius: BorderRadius.lg, marginBottom: 12, ...Shadows.md },
    doneButtonText: { fontSize: Typography.sizes.lg, fontWeight: Typography.semibold, color: Colors.white },
    retryButton: { paddingVertical: 12, paddingHorizontal: 24 },
    retryButtonText: { fontSize: Typography.sizes.base, color: Colors.textSecondary },
    errorText: { fontSize: Typography.sizes.lg, color: Colors.textSecondary, textAlign: 'center', marginTop: 100 },
    linkText: { fontSize: Typography.sizes.base, color: Colors.accent, textAlign: 'center', marginTop: 16 },
});
