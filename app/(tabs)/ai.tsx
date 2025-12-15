import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Platform, Modal, Keyboard, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, BorderRadius, Typography, Shadows } from '../../constants/theme';
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

function MessageBubble({ message, onView }: { message: Message; onView?: (type: 'flashcard' | 'quiz', id: string) => void }) {
    const isUser = message.role === 'user';
    return (
        <View style={[styles.bubbleContainer, isUser && styles.userBubbleContainer]}>
            <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
                <Text style={[styles.bubbleText, isUser && styles.userBubbleText]}>{message.content}</Text>
                {message.flashcardDeckId && onView && (
                    <TouchableOpacity style={styles.actionButton} onPress={() => onView('flashcard', message.flashcardDeckId!)}>
                        <Ionicons name="layers" size={16} color={Colors.accent} />
                        <Text style={styles.actionButtonText}>View Flashcards</Text>
                    </TouchableOpacity>
                )}
                {message.quizId && onView && (
                    <TouchableOpacity style={styles.actionButton} onPress={() => onView('quiz', message.quizId!)}>
                        <Ionicons name="help-circle" size={16} color={Colors.warning} />
                        <Text style={[styles.actionButtonText, { color: Colors.warning }]}>Take Quiz</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
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

function CreatedPopup({ popup, onClose, onStudyNow }: { popup: PopupState; onClose: () => void; onStudyNow: () => void }) {
    if (!popup.visible) return null;
    const isQuiz = popup.type === 'quiz';
    return (
        <Modal visible={popup.visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.popupOverlay}>
                <View style={styles.popupContainer}>
                    <LinearGradient colors={['#ffffff', '#f8f8f8']} style={styles.popupGradient}>
                        <Ionicons name={isQuiz ? "help-circle" : "checkmark-circle"} size={48} color={isQuiz ? Colors.warning : Colors.success} />
                        <Text style={styles.popupTitle}>{isQuiz ? 'Quiz Created!' : 'Flashcards Created!'}</Text>
                        <Text style={styles.popupSubtitle}>{popup.count} {isQuiz ? 'questions' : 'cards'}</Text>
                        <TouchableOpacity style={styles.popupPrimaryBtn} onPress={onStudyNow}>
                            <Text style={styles.popupPrimaryBtnText}>{isQuiz ? 'Start Quiz' : 'Study Now'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onClose}><Text style={styles.popupSecondaryBtnText}>Later</Text></TouchableOpacity>
                    </LinearGradient>
                </View>
            </View>
        </Modal>
    );
}

export default function AIScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
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
                        cards: flashcards.map((fc, i) => ({ id: `${deckId}-${i}`, front: fc.front, back: fc.back, confidence: 'new', correctCount: 0, incorrectCount: 0 })),
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

    return (
        <View style={styles.container}>
            <CreatedPopup popup={popup} onClose={() => setPopup(p => ({ ...p, visible: false }))} onStudyNow={() => { setPopup(p => ({ ...p, visible: false })); router.push(popup.type === 'flashcard' ? `/flashcard/${popup.id}` : `/quiz/${popup.id}`); }} />

            <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
                <Text style={styles.headerTitle}>AI Study Buddy</Text>
                <View style={styles.statusDot} />
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={({ item }) => <MessageBubble message={item} onView={handleView} />}
                keyExtractor={item => item.id}
                contentContainerStyle={[styles.messagesList, { paddingBottom: keyboardHeight > 0 ? 20 : bottomPadding + 80 }]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                ListFooterComponent={isTyping ? <Text style={styles.typingText}>Thinking...</Text> : null}
            />

            {messages.length === 1 && keyboardHeight === 0 && (
                <View style={styles.suggestions}>
                    {suggestions.map((s, i) => (
                        <TouchableOpacity key={i} style={styles.suggestionChip} onPress={() => setInputText(s)}>
                            <Text style={styles.suggestionText}>{s}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            <View style={[styles.inputContainer, {
                paddingBottom: keyboardHeight > 0 ? 12 : bottomPadding,
                bottom: keyboardHeight > 0 ? keyboardHeight - (Platform.OS === 'ios' ? 0 : 0) : 0,
            }]}>
                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.input}
                        placeholder="Ask me anything..."
                        placeholderTextColor={Colors.textMuted}
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                        maxLength={2000}
                        returnKeyType="send"
                        onSubmitEditing={sendMessage}
                    />
                    <TouchableOpacity onPress={sendMessage} disabled={!inputText.trim() || isTyping} style={[styles.sendButton, (!inputText.trim() || isTyping) && styles.sendButtonDisabled]}>
                        <Ionicons name="arrow-up" size={18} color={inputText.trim() && !isTyping ? Colors.white : Colors.textMuted} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
    headerTitle: { fontSize: Typography.sizes.xl, fontWeight: Typography.semibold, color: Colors.textPrimary },
    statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success },
    messagesList: { padding: 16 },
    bubbleContainer: { marginBottom: 12 },
    userBubbleContainer: { alignItems: 'flex-end' },
    bubble: { maxWidth: '85%', padding: 14, borderRadius: BorderRadius.lg },
    aiBubble: { backgroundColor: Colors.card, ...Shadows.sm },
    userBubble: { backgroundColor: Colors.accent },
    bubbleText: { fontSize: Typography.sizes.base, color: Colors.textPrimary, lineHeight: 22 },
    userBubbleText: { color: Colors.white },
    actionButton: { flexDirection: 'row', alignItems: 'center', marginTop: 10, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: Colors.accentSoft, borderRadius: BorderRadius.md, gap: 6 },
    actionButtonText: { fontSize: Typography.sizes.sm, fontWeight: Typography.medium, color: Colors.accent },
    typingText: { fontSize: Typography.sizes.sm, color: Colors.textMuted, fontStyle: 'italic', paddingVertical: 8, paddingHorizontal: 4 },
    suggestions: { position: 'absolute', bottom: 180, left: 16, right: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    suggestionChip: { backgroundColor: Colors.card, paddingHorizontal: 14, paddingVertical: 8, borderRadius: BorderRadius.full, ...Shadows.sm },
    suggestionText: { fontSize: Typography.sizes.sm, color: Colors.textSecondary },
    inputContainer: { position: 'absolute', left: 0, right: 0, paddingHorizontal: 16, paddingTop: 8, backgroundColor: Colors.background, borderTopWidth: 1, borderTopColor: Colors.border },
    inputWrapper: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: Colors.card, borderRadius: BorderRadius.lg, paddingLeft: 16, paddingRight: 8, paddingVertical: 8, ...Shadows.sm },
    input: { flex: 1, fontSize: Typography.sizes.base, color: Colors.textPrimary, maxHeight: 100, paddingVertical: 8 },
    sendButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },
    sendButtonDisabled: { backgroundColor: Colors.divider },
    popupOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
    popupContainer: { width: '100%', maxWidth: 320, borderRadius: BorderRadius.xl, overflow: 'hidden' },
    popupGradient: { padding: 32, alignItems: 'center', gap: 12 },
    popupTitle: { fontSize: Typography.sizes['2xl'], fontWeight: Typography.bold, color: Colors.textPrimary },
    popupSubtitle: { fontSize: Typography.sizes.base, color: Colors.textSecondary },
    popupPrimaryBtn: { backgroundColor: Colors.accent, paddingVertical: 14, paddingHorizontal: 32, borderRadius: BorderRadius.lg, marginTop: 8 },
    popupPrimaryBtnText: { fontSize: Typography.sizes.base, fontWeight: Typography.semibold, color: Colors.white },
    popupSecondaryBtnText: { fontSize: Typography.sizes.base, color: Colors.textSecondary, marginTop: 8 },
});
