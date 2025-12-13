import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../constants/theme';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

const INITIAL_MESSAGES: Message[] = [
    {
        id: '1',
        role: 'assistant',
        content: "Hi! I'm your study assistant. I can help you understand your notes, create flashcards, or answer questions. What would you like to work on?",
    },
];

function MessageBubble({ message }: { message: Message }) {
    const isUser = message.role === 'user';
    return (
        <View style={[styles.bubbleContainer, isUser && styles.userBubbleContainer]}>
            <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
                <Text style={[styles.bubbleText, isUser && styles.userBubbleText]}>{message.content}</Text>
            </View>
        </View>
    );
}

export default function AIScreen() {
    const insets = useSafeAreaInsets();
    const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    const sendMessage = useCallback(() => {
        if (!inputText.trim()) return;
        const userMessage: Message = { id: Date.now().toString(), role: 'user', content: inputText.trim() };
        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsTyping(true);
        setTimeout(() => {
            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "I'd be happy to help with that! Once your API key is connected, I'll be able to give you more detailed responses based on your notes.",
            };
            setMessages(prev => [...prev, aiResponse]);
            setIsTyping(false);
        }, 1200);
    }, [inputText]);

    const suggestions = ['Summarize my notes', 'Create flashcards', 'Explain this concept', 'Quiz me'];

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
                <Text style={styles.headerTitle}>AI Assistant</Text>
            </View>

            {/* Messages */}
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={({ item }) => <MessageBubble message={item} />}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.messagesList}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                ListFooterComponent={isTyping ? (
                    <View style={styles.typingContainer}>
                        <Text style={styles.typingText}>Thinking...</Text>
                    </View>
                ) : null}
            />

            {/* Suggestions */}
            {messages.length === 1 && (
                <View style={styles.suggestions}>
                    {suggestions.map((s, i) => (
                        <TouchableOpacity key={i} style={styles.suggestionChip} onPress={() => setInputText(s)}>
                            <Text style={styles.suggestionText}>{s}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Input */}
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 100 }]}>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            placeholder="Ask anything..."
                            placeholderTextColor={Colors.textMuted}
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                            maxLength={2000}
                        />
                        <TouchableOpacity onPress={sendMessage} disabled={!inputText.trim()} style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}>
                            <Ionicons name="arrow-up" size={18} color={inputText.trim() ? Colors.white : Colors.textMuted} />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: { paddingHorizontal: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
    headerTitle: { fontSize: Typography.sizes.xl, fontWeight: Typography.semibold, color: Colors.textPrimary },
    messagesList: { padding: 24, paddingBottom: 16 },
    bubbleContainer: { marginBottom: 12 },
    userBubbleContainer: { alignItems: 'flex-end' },
    bubble: { maxWidth: '85%', padding: 14, borderRadius: BorderRadius.lg },
    aiBubble: { backgroundColor: Colors.card, ...Shadows.sm },
    userBubble: { backgroundColor: Colors.accent },
    bubbleText: { fontSize: Typography.sizes.base, color: Colors.textPrimary, lineHeight: 22 },
    userBubbleText: { color: Colors.white },
    typingContainer: { paddingVertical: 8 },
    typingText: { fontSize: Typography.sizes.sm, color: Colors.textMuted, fontStyle: 'italic' },
    suggestions: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 24, gap: 8, marginBottom: 16 },
    suggestionChip: { backgroundColor: Colors.card, paddingHorizontal: 14, paddingVertical: 8, borderRadius: BorderRadius.full, ...Shadows.sm },
    suggestionText: { fontSize: Typography.sizes.sm, color: Colors.textSecondary },
    inputContainer: { paddingHorizontal: 24, paddingTop: 12, backgroundColor: Colors.background, borderTopWidth: 1, borderTopColor: Colors.border },
    inputWrapper: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: Colors.card, borderRadius: BorderRadius.lg, paddingLeft: 16, paddingRight: 8, paddingVertical: 8, ...Shadows.sm },
    input: { flex: 1, fontSize: Typography.sizes.base, color: Colors.textPrimary, maxHeight: 100, paddingVertical: 8 },
    sendButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },
    sendButtonDisabled: { backgroundColor: Colors.divider },
});
