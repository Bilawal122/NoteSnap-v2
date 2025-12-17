import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Platform, Modal, Keyboard, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, BorderRadius, Typography } from '../../contexts/ThemeContext';
import { callAI, AI_PROMPTS } from '../../utils/ai';
import { useAppStore } from '../../stores/appStore';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    flashcardDeckId?: string;
    quizId?: string;
}

interface PopupState {
    visible: boolean;
    type: 'flashcard' | 'quiz';
    id: string;
    title: string;
    count: number;
}

function parseFlashcards(response: string): { front: string; back: string }[] | null {
    try {
        const match = response.match(/\[\s*\{[\s\S]*?\}\s*\]/);
        if (match) {
            const parsed = JSON.parse(match[0]);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed.map(item => ({
                    front: item.front || item.question || '',
                    back: item.back || item.answer || '',
                })).filter(c => c.front && c.back);
            }
        }
    } catch { }
    return null;
}

function parseQuiz(response: string): any[] | null {
    try {
        const match = response.match(/\[\s*\{[\s\S]*?\}\s*\]/);
        if (match) {
            const parsed = JSON.parse(match[0]);
            if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].question) return parsed;
        }
    } catch { }
    return null;
}

function isFlashcardRequest(text: string): boolean {
    return /flashcard|flash card|create cards|make cards/i.test(text);
}

function isQuizRequest(text: string): boolean {
    return /quiz|test me|quiz me/i.test(text);
}

function extractTopic(text: string): string {
    const match = text.match(/(?:about|on|for)\s+(.+)/i);
    return match ? match[1].replace(/flashcard|quiz|card/gi, '').trim() : 'this topic';
}

export default function AIScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { colors, gradients, shadows, isDarkMode } = useTheme();
    const { notes, decks, quizzes, userName, studyStreak, totalCardsStudied, addDeck, addQuiz } = useAppStore();
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    useEffect(() => {
        const showSub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', e => {
            setKeyboardHeight(e.endCoordinates.height);
        });
        const hideSub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => {
            setKeyboardHeight(0);
        });
        return () => { showSub.remove(); hideSub.remove(); };
    }, []);

    const userContext = useMemo(() => {
        const notesSummary = notes.length > 0
            ? `\nNotes (${notes.length}): ${notes.slice(0, 3).map(n => n.title).join(', ')}`
            : '\nNo notes yet';
        return `Student: ${userName}, Streak: ${studyStreak} days, Cards: ${totalCardsStudied}${notesSummary}`;
    }, [notes, userName, studyStreak, totalCardsStudied]);

    const [messages, setMessages] = useState<Message[]>([{
        id: '1',
        role: 'assistant',
        content: `Hi ${userName}! 👋 I can help you study.\n\n• ${notes.length} notes • ${decks.length} decks • ${quizzes.length} quizzes\n\nTry: "Create flashcards about biology"`
    }]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [popup, setPopup] = useState<PopupState>({ visible: false, type: 'flashcard', id: '', title: '', count: 0 });
    const flatListRef = useRef<FlatList>(null);

    const handleView = useCallback((type: 'flashcard' | 'quiz', id: string) => {
        router.push(type === 'flashcard' ? `/flashcard/${id}` : `/quiz/${id}`);
    }, [router]);

    const sendMessage = useCallback(async () => {
        if (!inputText.trim() || isTyping) return;
        Keyboard.dismiss();

        const userText = inputText.trim();
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userText }]);
        setInputText('');
        setIsTyping(true);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

        try {
            const isFlashcardReq = isFlashcardRequest(userText);
            const isQuizReq = isQuizRequest(userText);
            const topic = extractTopic(userText);

            let contentContext = userContext;
            if (userText.toLowerCase().includes('my notes') && notes.length > 0) {
                contentContext += `\n\nNote contents:\n${notes.slice(0, 2).map(n => `${n.title}: ${n.content.slice(0, 300)}`).join('\n')}`;
            }

            const systemPrompt = isFlashcardReq ? AI_PROMPTS.flashcards : isQuizReq ? AI_PROMPTS.quiz : AI_PROMPTS.assistant;
            const response = await callAI([{ role: 'user', content: `${contentContext}\n\n${userText}` }], systemPrompt);

            let aiResponse: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: '' };

            if (response.success && isFlashcardReq) {
                const flashcards = parseFlashcards(response.message);
                if (flashcards && flashcards.length > 0) {
                    const deckId = Date.now().toString();
                    addDeck({
                        id: deckId, title: topic, createdAt: new Date().toISOString(), isFavorite: false,
                        cards: flashcards.map((fc, i) => ({ id: `${deckId}-${i}`, front: fc.front, back: fc.back, confidence: 'new' as const, correctCount: 0, incorrectCount: 0 })),
                    });
                    setPopup({ visible: true, type: 'flashcard', id: deckId, title: topic, count: flashcards.length });
                    aiResponse = { ...aiResponse, content: `Created ${flashcards.length} flashcards!`, flashcardDeckId: deckId };
                } else {
                    aiResponse.content = response.message || "Couldn't create flashcards.";
                }
            } else if (response.success && isQuizReq) {
                const quiz = parseQuiz(response.message);
                if (quiz && quiz.length > 0) {
                    const quizId = Date.now().toString();
                    addQuiz({
                        id: quizId, title: topic, createdAt: new Date().toISOString(), isFavorite: false,
                        questions: quiz.map((q, i) => ({ id: `${quizId}-${i}`, ...q })),
                    });
                    setPopup({ visible: true, type: 'quiz', id: quizId, title: topic, count: quiz.length });
                    aiResponse = { ...aiResponse, content: `Created a ${quiz.length}-question quiz!`, quizId };
                } else {
                    aiResponse.content = response.message || "Couldn't create quiz.";
                }
            } else {
                aiResponse.content = response.success ? response.message : `Error: ${response.error || 'Try again'}`;
            }

            setMessages(prev => [...prev, aiResponse]);
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        } catch {
            setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: 'Error. Please try again.' }]);
        } finally {
            setIsTyping(false);
        }
    }, [inputText, isTyping, notes, userContext, addDeck, addQuiz]);

    const suggestions = ['Create flashcards about history', 'Quiz me on science', 'How am I doing?'];
    const bottomPadding = Platform.OS === 'web' ? 80 : Math.max(insets.bottom, 20) + 70;

    // Dynamic styles based on theme
    const dynamicStyles = {
        container: { flex: 1, backgroundColor: colors.background },
        header: {
            flexDirection: 'row' as const,
            alignItems: 'center' as const,
            justifyContent: 'space-between' as const,
            paddingHorizontal: 20,
            paddingBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            paddingTop: insets.top + 8,
        },
        headerTitle: { fontSize: Typography.sizes.xl, fontWeight: Typography.semibold as any, color: colors.textPrimary },
        statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },
        aiBubble: { backgroundColor: colors.card, ...shadows.sm, maxWidth: '85%', padding: 14, borderRadius: BorderRadius.lg },
        userBubble: { backgroundColor: colors.primary, maxWidth: '85%', padding: 14, borderRadius: BorderRadius.lg },
        bubbleText: { fontSize: Typography.sizes.base, color: colors.textPrimary, lineHeight: 22 },
        userBubbleText: { color: '#ffffff' },
        actionButton: {
            flexDirection: 'row' as const,
            alignItems: 'center' as const,
            marginTop: 10,
            paddingVertical: 8,
            paddingHorizontal: 12,
            backgroundColor: isDarkMode ? 'rgba(99,102,241,0.2)' : colors.accentSoft,
            borderRadius: BorderRadius.md,
            gap: 6
        },
        suggestionChip: {
            backgroundColor: colors.card,
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: BorderRadius.full,
            ...shadows.sm
        },
        inputContainer: {
            position: 'absolute' as const,
            left: 0,
            right: 0,
            paddingHorizontal: 16,
            paddingTop: 8,
            backgroundColor: colors.background,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            paddingBottom: keyboardHeight > 0 ? 12 : bottomPadding,
            bottom: keyboardHeight > 0 ? keyboardHeight - (Platform.OS === 'ios' ? 0 : 0) : 0,
        },
        inputWrapper: {
            flexDirection: 'row' as const,
            alignItems: 'flex-end' as const,
            backgroundColor: colors.card,
            borderRadius: BorderRadius.lg,
            paddingLeft: 16,
            paddingRight: 8,
            paddingVertical: 8,
            ...shadows.sm
        },
        input: { flex: 1, fontSize: Typography.sizes.base, color: colors.textPrimary, maxHeight: 100, paddingVertical: 8 },
        sendButton: {
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.primary,
            alignItems: 'center' as const,
            justifyContent: 'center' as const
        },
        sendButtonDisabled: { backgroundColor: colors.divider },
    };

    const renderMessage = ({ item }: { item: Message }) => {
        const isUser = item.role === 'user';
        return (
            <View style={[styles.bubbleContainer, isUser && styles.userBubbleContainer]}>
                <View style={isUser ? dynamicStyles.userBubble : dynamicStyles.aiBubble}>
                    <Text style={[dynamicStyles.bubbleText, isUser && dynamicStyles.userBubbleText]}>{item.content}</Text>
                    {item.flashcardDeckId && (
                        <TouchableOpacity style={dynamicStyles.actionButton} onPress={() => handleView('flashcard', item.flashcardDeckId!)}>
                            <Ionicons name="layers" size={16} color={colors.primary} />
                            <Text style={{ fontSize: Typography.sizes.sm, fontWeight: Typography.medium as any, color: colors.primary }}>View Flashcards</Text>
                        </TouchableOpacity>
                    )}
                    {item.quizId && (
                        <TouchableOpacity style={dynamicStyles.actionButton} onPress={() => handleView('quiz', item.quizId!)}>
                            <Ionicons name="help-circle" size={16} color={colors.warning} />
                            <Text style={{ fontSize: Typography.sizes.sm, fontWeight: Typography.medium as any, color: colors.warning }}>Take Quiz</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={dynamicStyles.container}>
            {/* Popup */}
            <Modal visible={popup.visible} transparent animationType="fade" onRequestClose={() => setPopup(p => ({ ...p, visible: false }))}>
                <View style={styles.popupOverlay}>
                    <View style={[styles.popupContainer, { backgroundColor: colors.card }]}>
                        <Ionicons name={popup.type === 'quiz' ? "help-circle" : "checkmark-circle"} size={48} color={popup.type === 'quiz' ? colors.warning : colors.success} />
                        <Text style={[styles.popupTitle, { color: colors.textPrimary }]}>{popup.type === 'quiz' ? 'Quiz Created!' : 'Flashcards Created!'}</Text>
                        <Text style={[styles.popupSubtitle, { color: colors.textSecondary }]}>{popup.count} {popup.type === 'quiz' ? 'questions' : 'cards'}</Text>
                        <TouchableOpacity style={[styles.popupPrimaryBtn, { backgroundColor: colors.primary }]} onPress={() => { setPopup(p => ({ ...p, visible: false })); router.push(popup.type === 'flashcard' ? `/flashcard/${popup.id}` : `/quiz/${popup.id}`); }}>
                            <Text style={styles.popupPrimaryBtnText}>{popup.type === 'quiz' ? 'Start Quiz' : 'Study Now'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setPopup(p => ({ ...p, visible: false }))}><Text style={[styles.popupSecondaryBtnText, { color: colors.textSecondary }]}>Later</Text></TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <View style={dynamicStyles.header}>
                <Text style={dynamicStyles.headerTitle}>AI Study Buddy</Text>
                <View style={dynamicStyles.statusDot} />
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={item => item.id}
                contentContainerStyle={[styles.messagesList, { paddingBottom: keyboardHeight > 0 ? 20 : bottomPadding + 80 }]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                ListFooterComponent={isTyping ? <Text style={[styles.typingText, { color: colors.textMuted }]}>Thinking...</Text> : null}
            />

            {messages.length === 1 && keyboardHeight === 0 && (
                <View style={styles.suggestions}>
                    {suggestions.map((s, i) => (
                        <TouchableOpacity key={i} style={dynamicStyles.suggestionChip} onPress={() => setInputText(s)}>
                            <Text style={{ fontSize: Typography.sizes.sm, color: colors.textSecondary }}>{s}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            <View style={dynamicStyles.inputContainer}>
                <View style={dynamicStyles.inputWrapper}>
                    <TextInput
                        style={dynamicStyles.input}
                        placeholder="Ask me anything..."
                        placeholderTextColor={colors.textMuted}
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                        maxLength={2000}
                        returnKeyType="send"
                        onSubmitEditing={sendMessage}
                    />
                    <TouchableOpacity
                        onPress={sendMessage}
                        disabled={!inputText.trim() || isTyping}
                        style={[dynamicStyles.sendButton, (!inputText.trim() || isTyping) && dynamicStyles.sendButtonDisabled]}
                    >
                        <Ionicons name="arrow-up" size={18} color={inputText.trim() && !isTyping ? '#ffffff' : colors.textMuted} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    messagesList: { padding: 16 },
    bubbleContainer: { marginBottom: 12 },
    userBubbleContainer: { alignItems: 'flex-end' },
    typingText: { fontSize: Typography.sizes.sm, fontStyle: 'italic', paddingVertical: 8, paddingHorizontal: 4 },
    suggestions: { position: 'absolute', bottom: 180, left: 16, right: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    popupOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
    popupContainer: { width: '100%', maxWidth: 320, borderRadius: BorderRadius.xl, padding: 32, alignItems: 'center', gap: 12 },
    popupTitle: { fontSize: Typography.sizes['2xl'], fontWeight: Typography.bold },
    popupSubtitle: { fontSize: Typography.sizes.base },
    popupPrimaryBtn: { paddingVertical: 14, paddingHorizontal: 32, borderRadius: BorderRadius.lg, marginTop: 8 },
    popupPrimaryBtnText: { fontSize: Typography.sizes.base, fontWeight: Typography.semibold, color: '#ffffff' },
    popupSecondaryBtnText: { fontSize: Typography.sizes.base, marginTop: 8 },
});
