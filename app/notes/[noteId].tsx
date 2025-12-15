import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Modal, ActivityIndicator, Image, KeyboardAvoidingView, Platform, Dimensions, Animated, PanResponder } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore, Note, AINoteEntry } from '../../stores/appStore';
import { callAI, AI_PROMPTS, askAboutNote, analyzeImageWithAction } from '../../utils/ai';
import { Colors, Gradients, BorderRadius, Typography, Shadows } from '../../constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Zoomable Image Viewer Modal
function ImageViewer({ visible, imageUri, onClose }: { visible: boolean; imageUri: string; onClose: () => void }) {
    const scale = useRef(new Animated.Value(1)).current;
    const translateX = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(0)).current;
    const lastScale = useRef(1);
    const lastTranslateX = useRef(0);
    const lastTranslateY = useRef(0);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gestureState) => {
                translateX.setValue(lastTranslateX.current + gestureState.dx);
                translateY.setValue(lastTranslateY.current + gestureState.dy);
            },
            onPanResponderRelease: () => {
                lastTranslateX.current = (translateX as any)._value;
                lastTranslateY.current = (translateY as any)._value;
            },
        })
    ).current;

    const handleDoubleTap = () => {
        if (lastScale.current > 1) {
            Animated.parallel([
                Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
                Animated.spring(translateX, { toValue: 0, useNativeDriver: true }),
                Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
            ]).start();
            lastScale.current = 1;
            lastTranslateX.current = 0;
            lastTranslateY.current = 0;
        } else {
            Animated.spring(scale, { toValue: 2.5, useNativeDriver: true }).start();
            lastScale.current = 2.5;
        }
    };

    const resetZoom = () => {
        scale.setValue(1);
        translateX.setValue(0);
        translateY.setValue(0);
        lastScale.current = 1;
        lastTranslateX.current = 0;
        lastTranslateY.current = 0;
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={imgStyles.container}>
                <TouchableOpacity style={imgStyles.closeBtn} onPress={() => { resetZoom(); onClose(); }}>
                    <Ionicons name="close" size={28} color="#fff" />
                </TouchableOpacity>
                <View style={imgStyles.hint}>
                    <Text style={imgStyles.hintText}>Double tap to zoom • Drag to pan</Text>
                </View>
                <TouchableOpacity activeOpacity={1} onPress={handleDoubleTap} {...panResponder.panHandlers} style={imgStyles.imageWrapper}>
                    <Animated.Image
                        source={{ uri: imageUri }}
                        style={[imgStyles.image, { transform: [{ scale }, { translateX }, { translateY }] }]}
                        resizeMode="contain"
                    />
                </TouchableOpacity>
            </View>
        </Modal>
    );
}

const imgStyles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
    closeBtn: { position: 'absolute', top: 50, right: 20, zIndex: 10, padding: 10 },
    hint: { position: 'absolute', bottom: 50, zIndex: 10 },
    hintText: { color: 'rgba(255,255,255,0.6)', fontSize: 14 },
    imageWrapper: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT, justifyContent: 'center', alignItems: 'center' },
    image: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.7 },
});

// FormattedText Component
function FormattedText({ text, style }: { text: string; style?: any }) {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
        const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
        const italicMatch = remaining.match(/_([^_]+)_/);

        if (boldMatch && (!italicMatch || remaining.indexOf(boldMatch[0]) < remaining.indexOf(italicMatch[0]))) {
            const idx = remaining.indexOf(boldMatch[0]);
            if (idx > 0) parts.push(<Text key={key++} style={style}>{remaining.substring(0, idx)}</Text>);
            parts.push(<Text key={key++} style={[style, styles.boldText]}>{boldMatch[1]}</Text>);
            remaining = remaining.substring(idx + boldMatch[0].length);
        } else if (italicMatch) {
            const idx = remaining.indexOf(italicMatch[0]);
            if (idx > 0) parts.push(<Text key={key++} style={style}>{remaining.substring(0, idx)}</Text>);
            parts.push(<Text key={key++} style={[style, styles.italicText]}>{italicMatch[1]}</Text>);
            remaining = remaining.substring(idx + italicMatch[0].length);
        } else {
            parts.push(<Text key={key++} style={style}>{remaining}</Text>);
            remaining = '';
        }
    }
    return <Text>{parts}</Text>;
}

// AI Note Section Component
function AINoteSection({ entry, onEdit, onDelete }: { entry: AINoteEntry; onEdit: (id: string, content: string) => void; onDelete: (id: string) => void }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(entry.content);

    const handleSave = () => { onEdit(entry.id, editText); setIsEditing(false); };

    const formatContent = (text: string) => text.split('\n').map((line, i) => {
        if (line.startsWith('## ')) return <Text key={i} style={styles.contentHeading}>{line.substring(3)}</Text>;
        if (line.trim().startsWith('•')) return <FormattedText key={i} text={line} style={styles.contentBullet} />;
        return <FormattedText key={i} text={line} style={styles.contentText} />;
    });

    return (
        <View style={styles.aiNoteSection}>
            <View style={styles.aiNoteSectionHeader}>
                <View style={styles.aiNoteLabelRow}>
                    <Ionicons name="sparkles" size={14} color={Colors.primary} />
                    <Text style={styles.aiNoteLabel}>{entry.label}</Text>
                </View>
                <View style={styles.aiNoteActions}>
                    <TouchableOpacity onPress={() => setIsEditing(!isEditing)} style={styles.aiNoteActionBtn}>
                        <Ionicons name={isEditing ? "close" : "create-outline"} size={16} color={Colors.textMuted} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onDelete(entry.id)} style={styles.aiNoteActionBtn}>
                        <Ionicons name="trash-outline" size={16} color={Colors.error} />
                    </TouchableOpacity>
                </View>
            </View>
            {isEditing ? (
                <View>
                    <TextInput style={styles.aiNoteEditInput} value={editText} onChangeText={setEditText} multiline textAlignVertical="top" />
                    <TouchableOpacity style={styles.aiNoteSaveBtn} onPress={handleSave}>
                        <Text style={styles.aiNoteSaveBtnText}>Save Changes</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.aiNoteContent}>{formatContent(entry.content)}</View>
            )}
        </View>
    );
}

export default function NoteDetailScreen() {
    const { noteId } = useLocalSearchParams<{ noteId: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { notes, updateNote, deleteNote, toggleNoteFavorite, addDeck, addQuiz } = useAppStore();
    const inputRef = useRef<TextInput>(null);

    const note = notes.find(n => n.id === noteId);
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(note?.title || '');
    const [editContent, setEditContent] = useState(note?.content || '');
    const [selection, setSelection] = useState({ start: 0, end: 0 });
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [showActions, setShowActions] = useState(false);
    const [showAskAI, setShowAskAI] = useState(false);
    const [aiQuestion, setAiQuestion] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [showImageViewer, setShowImageViewer] = useState(false);

    if (!note) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <Text style={styles.errorText}>Note not found</Text>
                <TouchableOpacity onPress={() => router.back()}><Text style={styles.linkText}>Go back</Text></TouchableOpacity>
            </View>
        );
    }

    const hasImage = !!note.imageBase64 || !!note.imageUri;
    const imageUri = note.imageUri || (note.imageBase64 ? `data:image/jpeg;base64,${note.imageBase64}` : '');

    // Save AI response
    const saveAIResponse = (label: string, content: string) => {
        const newEntry: AINoteEntry = { id: Date.now().toString(), label, content, createdAt: new Date().toISOString() };
        updateNote(note.id, { aiNotes: [...(note.aiNotes || []), newEntry] });
        Alert.alert('Saved!', `${label} added to your note.`);
    };

    const handleEditAINote = (id: string, content: string) => {
        updateNote(note.id, { aiNotes: (note.aiNotes || []).map(e => e.id === id ? { ...e, content } : e) });
    };

    const handleDeleteAINote = (id: string) => {
        Alert.alert('Delete?', 'Remove this AI note?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => updateNote(note.id, { aiNotes: (note.aiNotes || []).filter(e => e.id !== id) }) },
        ]);
    };

    const insertFormat = (prefix: string, suffix: string = '') => {
        const { start, end } = selection;
        const before = editContent.substring(0, start);
        const selected = editContent.substring(start, end);
        const after = editContent.substring(end);
        setEditContent(selected ? before + prefix + selected + suffix + after : before + prefix + suffix + after);
        inputRef.current?.focus();
    };

    const handleSave = () => {
        const wordCount = editContent.trim().split(/\s+/).filter(w => w.length > 0).length;
        updateNote(note.id, { title: editTitle.trim() || 'Untitled', content: editContent.trim(), wordCount });
        setIsEditing(false);
    };

    const handleDelete = () => {
        Alert.alert('Delete Note', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => { deleteNote(note.id); router.back(); } },
        ]);
    };

    const handleSummarize = async () => {
        setIsLoading(true); setLoadingMessage('Summarizing...'); setShowActions(false);
        try {
            const response = note.imageBase64 ? await analyzeImageWithAction(note.imageBase64, 'summarize') : await callAI([{ role: 'user', content: note.content }], AI_PROMPTS.summarize);
            setIsLoading(false);
            if (response.success) {
                Alert.alert('Summary Ready', 'Save this summary?', [
                    { text: 'Discard', style: 'cancel' },
                    { text: 'Save', onPress: () => saveAIResponse('AI Summary', response.message) },
                ]);
            } else Alert.alert('Error', response.error || 'Failed');
        } catch { setIsLoading(false); Alert.alert('Error', 'Failed'); }
    };

    const handleCreateFlashcards = async () => {
        setIsLoading(true); setLoadingMessage('Creating flashcards...'); setShowActions(false);
        try {
            const response = note.imageBase64 ? await analyzeImageWithAction(note.imageBase64, 'flashcards') : await callAI([{ role: 'user', content: `Create flashcards:\n${note.content}` }], AI_PROMPTS.flashcards);
            if (response.success) {
                const match = response.message.match(/\[\s*\{[\s\S]*?\}\s*\]/);
                if (match) {
                    const parsed = JSON.parse(match[0]);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        const deckId = Date.now().toString();
                        addDeck({ id: deckId, title: note.title, createdAt: new Date().toISOString(), isFavorite: false, noteId: note.id, cards: parsed.map((fc: any, i: number) => ({ id: `${deckId}-${i}`, front: fc.front || fc.question || '', back: fc.back || fc.answer || '', confidence: 'new', correctCount: 0, incorrectCount: 0 })).filter((c: any) => c.front && c.back) });
                        setIsLoading(false);
                        Alert.alert('Flashcards Created!', `${parsed.length} cards`, [{ text: 'Study Now', onPress: () => router.push(`/flashcard/${deckId}`) }, { text: 'OK' }]);
                        return;
                    }
                }
                Alert.alert('Error', 'Could not parse flashcards');
            } else Alert.alert('Error', response.error || 'Failed');
        } catch { Alert.alert('Error', 'Failed'); } finally { setIsLoading(false); }
    };

    const handleCreateQuiz = async () => {
        setIsLoading(true); setLoadingMessage('Creating quiz...'); setShowActions(false);
        try {
            const response = note.imageBase64 ? await analyzeImageWithAction(note.imageBase64, 'quiz') : await callAI([{ role: 'user', content: `Create quiz:\n${note.content}` }], AI_PROMPTS.quiz);
            if (response.success) {
                const match = response.message.match(/\[\s*\{[\s\S]*?\}\s*\]/);
                if (match) {
                    const parsed = JSON.parse(match[0]);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        const quizId = Date.now().toString();
                        addQuiz({ id: quizId, title: note.title, createdAt: new Date().toISOString(), isFavorite: false, noteId: note.id, questions: parsed.map((q: any, i: number) => ({ id: `${quizId}-${i}`, question: q.question, options: q.options, correctAnswer: q.correctAnswer, explanation: q.explanation })) });
                        setIsLoading(false);
                        Alert.alert('Quiz Created!', `${parsed.length} questions`, [{ text: 'Take Quiz', onPress: () => router.push(`/quiz/${quizId}`) }, { text: 'OK' }]);
                        return;
                    }
                }
                Alert.alert('Error', 'Could not parse quiz');
            } else Alert.alert('Error', response.error || 'Failed');
        } catch { Alert.alert('Error', 'Failed'); } finally { setIsLoading(false); }
    };

    const handleExtractText = async () => {
        if (!note.imageBase64) return;
        setIsLoading(true); setLoadingMessage('Extracting...'); setShowActions(false);
        try {
            const response = await analyzeImageWithAction(note.imageBase64, 'extract');
            setIsLoading(false);
            if (response.success) {
                Alert.alert('Text Extracted', 'Save as:', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'AI Note', onPress: () => saveAIResponse('Extracted Text', response.message) },
                    { text: 'Replace Content', style: 'destructive', onPress: () => updateNote(note.id, { content: response.message, wordCount: response.message.split(/\s+/).length }) },
                ]);
            } else Alert.alert('Error', response.error || 'Failed');
        } catch { setIsLoading(false); Alert.alert('Error', 'Failed'); }
    };

    const handleAskAI = async () => {
        if (!aiQuestion.trim()) return;
        setIsLoading(true); setLoadingMessage('Thinking...');
        try {
            const response = await askAboutNote(aiQuestion, note.content, note.imageBase64);
            setIsLoading(false);
            setAiResponse(response.success ? response.message : 'Sorry, try again.');
        } catch { setIsLoading(false); setAiResponse('Error.'); }
    };

    const handleSaveAskAI = () => {
        if (aiResponse) {
            saveAIResponse(`AI Answer: ${aiQuestion.slice(0, 25)}...`, aiResponse);
            setShowAskAI(false); setAiQuestion(''); setAiResponse('');
        }
    };

    const date = new Date(note.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    const formatContent = (text: string) => text.split('\n').map((line, i) => {
        if (line.startsWith('## ')) return <Text key={i} style={styles.contentHeading}>{line.substring(3)}</Text>;
        if (line.trim().startsWith('•') || line.trim().startsWith('-')) return <FormattedText key={i} text={line} style={styles.contentBullet} />;
        if (line.trim().match(/^\d+\./)) return <FormattedText key={i} text={line} style={styles.contentNumber} />;
        return <FormattedText key={i} text={line} style={styles.contentText} />;
    });

    // Edit mode
    if (isEditing) {
        return (
            <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <LinearGradient colors={Gradients.background} style={StyleSheet.absoluteFill} />
                <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                    <TouchableOpacity onPress={() => setIsEditing(false)} style={styles.backButton}><Ionicons name="close" size={24} color={Colors.textPrimary} /></TouchableOpacity>
                    <Text style={styles.headerEditTitle}>Edit Note</Text>
                    <TouchableOpacity onPress={handleSave} style={styles.saveBtn}><Text style={styles.saveBtnText}>Save</Text></TouchableOpacity>
                </View>
                <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
                    <TextInput style={styles.titleInput} value={editTitle} onChangeText={setEditTitle} placeholder="Title" placeholderTextColor={Colors.textMuted} />
                    <TextInput ref={inputRef} style={styles.contentInput} value={editContent} onChangeText={setEditContent} onSelectionChange={e => setSelection(e.nativeEvent.selection)} placeholder="Content..." placeholderTextColor={Colors.textMuted} multiline textAlignVertical="top" />
                </ScrollView>
                <View style={[styles.toolbar, { paddingBottom: Math.max(insets.bottom, 8) + 8 }]}>
                    <TouchableOpacity style={styles.toolBtn} onPress={() => insertFormat('**', '**')}><Text style={styles.toolBtnBold}>B</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.toolBtn} onPress={() => insertFormat('_', '_')}><Text style={styles.toolBtnItalic}>I</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.toolBtn} onPress={() => insertFormat('\n• ')}><Ionicons name="list" size={18} color={Colors.textSecondary} /></TouchableOpacity>
                    <TouchableOpacity style={styles.toolBtn} onPress={() => insertFormat('\n## ')}><Ionicons name="text" size={18} color={Colors.textSecondary} /></TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        );
    }

    // View mode
    return (
        <View style={styles.container}>
            <LinearGradient colors={Gradients.background} style={StyleSheet.absoluteFill} />

            {/* Image Viewer */}
            <ImageViewer visible={showImageViewer} imageUri={imageUri} onClose={() => setShowImageViewer(false)} />

            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}><Ionicons name="arrow-back" size={24} color={Colors.textPrimary} /></TouchableOpacity>
                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={() => setShowAskAI(true)} style={styles.askAIBtn}>
                        <LinearGradient colors={Gradients.primary} style={styles.askAIBtnGradient}>
                            <Ionicons name="sparkles" size={16} color="#fff" />
                            <Text style={styles.askAIBtnText}>Ask AI</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => toggleNoteFavorite(note.id)} style={styles.iconBtn}><Ionicons name={note.isFavorite ? "star" : "star-outline"} size={22} color={note.isFavorite ? Colors.warning : Colors.textMuted} /></TouchableOpacity>
                    <TouchableOpacity onPress={() => setShowActions(true)} style={styles.iconBtn}><Ionicons name="ellipsis-horizontal" size={22} color={Colors.textPrimary} /></TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
                <Text style={styles.title}>{note.title}</Text>
                <Text style={styles.meta}>{date} • {note.wordCount} words {hasImage && '• 📷'}</Text>

                {/* Tappable Image */}
                {hasImage && (
                    <TouchableOpacity style={styles.imageContainer} onPress={() => setShowImageViewer(true)} activeOpacity={0.9}>
                        <Image source={{ uri: imageUri }} style={styles.noteImage} resizeMode="cover" />
                        <View style={styles.imageOverlay}><Ionicons name="expand" size={20} color="#fff" /><Text style={styles.imageOverlayText}>Tap to zoom</Text></View>
                    </TouchableOpacity>
                )}

                {/* Main content */}
                <TouchableOpacity style={styles.noteContentCard} onPress={() => { setIsEditing(true); setEditTitle(note.title); setEditContent(note.content); }}>
                    <View style={styles.editHintRow}><Ionicons name="create-outline" size={12} color={Colors.primary} /><Text style={styles.editHint}>Tap to edit</Text></View>
                    {formatContent(note.content)}
                </TouchableOpacity>

                {/* AI Notes */}
                {note.aiNotes && note.aiNotes.length > 0 && (
                    <View style={styles.aiNotesContainer}>
                        <Text style={styles.aiNotesTitle}>✨ Saved AI Notes</Text>
                        {note.aiNotes.map(entry => <AINoteSection key={entry.id} entry={entry} onEdit={handleEditAINote} onDelete={handleDeleteAINote} />)}
                    </View>
                )}
            </ScrollView>

            {isLoading && <View style={styles.loadingOverlay}><View style={styles.loadingCard}><ActivityIndicator size="large" color={Colors.primary} /><Text style={styles.loadingText}>{loadingMessage}</Text></View></View>}

            {/* Actions Modal */}
            <Modal visible={showActions} transparent animationType="fade" onRequestClose={() => setShowActions(false)}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowActions(false)}>
                    <View style={styles.actionsSheet}>
                        <TouchableOpacity style={styles.actionItem} onPress={() => { setShowActions(false); setIsEditing(true); setEditTitle(note.title); setEditContent(note.content); }}><Ionicons name="pencil" size={20} color={Colors.primary} /><Text style={styles.actionText}>Edit Note</Text></TouchableOpacity>
                        {hasImage && <TouchableOpacity style={styles.actionItem} onPress={handleExtractText}><Ionicons name="document-text" size={20} color={Colors.teal} /><Text style={styles.actionText}>Extract Text from Image</Text></TouchableOpacity>}
                        <TouchableOpacity style={styles.actionItem} onPress={handleSummarize}><Ionicons name="sparkles" size={20} color={Colors.secondary} /><Text style={styles.actionText}>Summarize</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.actionItem} onPress={handleCreateFlashcards}><Ionicons name="layers" size={20} color={Colors.primary} /><Text style={styles.actionText}>Create Flashcards</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.actionItem} onPress={handleCreateQuiz}><Ionicons name="help-circle" size={20} color={Colors.warning} /><Text style={styles.actionText}>Create Quiz</Text></TouchableOpacity>
                        <View style={styles.actionDivider} />
                        <TouchableOpacity style={styles.actionItem} onPress={handleDelete}><Ionicons name="trash" size={20} color={Colors.error} /><Text style={[styles.actionText, { color: Colors.error }]}>Delete Note</Text></TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Ask AI Modal */}
            <Modal visible={showAskAI} transparent animationType="slide" onRequestClose={() => { setShowAskAI(false); setAiResponse(''); setAiQuestion(''); }}>
                <View style={styles.askAIOverlay}>
                    <View style={[styles.askAISheet, { paddingBottom: insets.bottom + 16 }]}>
                        <View style={styles.askAIHeader}><Text style={styles.askAITitle}>✨ Ask AI</Text><TouchableOpacity onPress={() => { setShowAskAI(false); setAiResponse(''); setAiQuestion(''); }}><Ionicons name="close" size={24} color={Colors.textPrimary} /></TouchableOpacity></View>
                        <View style={styles.askAIQuickActions}>
                            <TouchableOpacity style={styles.quickAction} onPress={() => setAiQuestion('Explain simply')}><Text style={styles.quickActionText}>Explain</Text></TouchableOpacity>
                            <TouchableOpacity style={styles.quickAction} onPress={() => setAiQuestion('Key points?')}><Text style={styles.quickActionText}>Key points</Text></TouchableOpacity>
                            {hasImage && <TouchableOpacity style={styles.quickAction} onPress={() => setAiQuestion('Describe the image')}><Text style={styles.quickActionText}>Describe</Text></TouchableOpacity>}
                        </View>
                        <View style={styles.askAIInputRow}>
                            <TextInput style={styles.askAIInput} placeholder="Ask anything..." placeholderTextColor={Colors.textMuted} value={aiQuestion} onChangeText={setAiQuestion} multiline />
                            <TouchableOpacity style={styles.askAISendBtn} onPress={handleAskAI} disabled={!aiQuestion.trim() || isLoading}>
                                <LinearGradient colors={Gradients.primary} style={styles.askAISendGradient}><Ionicons name="send" size={18} color="#fff" /></LinearGradient>
                            </TouchableOpacity>
                        </View>
                        {aiResponse ? (
                            <View>
                                <ScrollView style={styles.askAIResponseScroll}><View style={styles.askAIResponse}>{formatContent(aiResponse)}</View></ScrollView>
                                <TouchableOpacity style={styles.saveResponseBtn} onPress={handleSaveAskAI}>
                                    <LinearGradient colors={Gradients.success} style={styles.saveResponseGradient}><Ionicons name="save-outline" size={18} color="#fff" /><Text style={styles.saveResponseBtnText}>Save to Note</Text></LinearGradient>
                                </TouchableOpacity>
                            </View>
                        ) : null}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16 },
    backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center', ...Shadows.sm },
    headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    headerEditTitle: { fontSize: Typography.sizes.lg, fontWeight: Typography.semibold, color: Colors.textPrimary },
    iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center', ...Shadows.sm },
    askAIBtn: { borderRadius: BorderRadius.lg, overflow: 'hidden', ...Shadows.sm },
    askAIBtnGradient: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, gap: 6 },
    askAIBtnText: { fontSize: Typography.sizes.sm, fontWeight: Typography.semibold, color: '#fff' },
    saveBtn: { backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: BorderRadius.lg, ...Shadows.sm },
    saveBtnText: { fontSize: Typography.sizes.base, fontWeight: Typography.semibold, color: '#fff' },
    content: { flex: 1 },
    contentInner: { padding: 20, paddingBottom: 100 },
    title: { fontSize: Typography.sizes['2xl'], fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: 8 },
    meta: { fontSize: Typography.sizes.sm, color: Colors.textMuted, marginBottom: 20 },
    imageContainer: { borderRadius: BorderRadius.lg, overflow: 'hidden', marginBottom: 20, ...Shadows.md },
    noteImage: { width: '100%', height: 220, backgroundColor: Colors.background },
    imageOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.5)', paddingVertical: 10 },
    imageOverlayText: { color: '#fff', fontSize: Typography.sizes.sm },
    noteContentCard: { backgroundColor: Colors.card, borderRadius: BorderRadius.lg, padding: 20, ...Shadows.sm },
    editHintRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12 },
    editHint: { fontSize: Typography.sizes.xs, color: Colors.primary, fontWeight: Typography.medium },
    contentHeading: { fontSize: Typography.sizes.xl, fontWeight: Typography.bold, color: Colors.textPrimary, marginTop: 16, marginBottom: 8 },
    contentBullet: { fontSize: Typography.sizes.base, color: Colors.textPrimary, lineHeight: 24, paddingLeft: 8 },
    contentNumber: { fontSize: Typography.sizes.base, color: Colors.textPrimary, lineHeight: 24, paddingLeft: 8 },
    contentText: { fontSize: Typography.sizes.base, color: Colors.textPrimary, lineHeight: 24 },
    boldText: { fontWeight: '700' },
    italicText: { fontStyle: 'italic' },
    aiNotesContainer: { marginTop: 28 },
    aiNotesTitle: { fontSize: Typography.sizes.lg, fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: 16 },
    aiNoteSection: { backgroundColor: Colors.accentSoft, borderRadius: BorderRadius.lg, padding: 16, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: Colors.primary },
    aiNoteSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    aiNoteLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    aiNoteLabel: { fontSize: Typography.sizes.sm, fontWeight: Typography.semibold, color: Colors.primary },
    aiNoteActions: { flexDirection: 'row', gap: 8 },
    aiNoteActionBtn: { padding: 4 },
    aiNoteContent: { gap: 4 },
    aiNoteEditInput: { backgroundColor: Colors.card, borderRadius: BorderRadius.md, padding: 12, fontSize: Typography.sizes.base, color: Colors.textPrimary, minHeight: 100 },
    aiNoteSaveBtn: { backgroundColor: Colors.primary, paddingVertical: 12, borderRadius: BorderRadius.md, marginTop: 12, alignItems: 'center' },
    aiNoteSaveBtnText: { color: '#fff', fontWeight: Typography.semibold },
    titleInput: { fontSize: Typography.sizes['2xl'], fontWeight: Typography.semibold, color: Colors.textPrimary, marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
    contentInput: { fontSize: Typography.sizes.base, color: Colors.textPrimary, lineHeight: 26, minHeight: 300 },
    toolbar: { backgroundColor: Colors.card, borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 8, paddingHorizontal: 16, flexDirection: 'row', gap: 8 },
    toolBtn: { width: 44, height: 44, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
    toolBtnBold: { fontSize: 18, fontWeight: '900', color: Colors.textSecondary },
    toolBtnItalic: { fontSize: 18, fontStyle: 'italic', fontWeight: '600', color: Colors.textSecondary },
    loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: Colors.overlay, alignItems: 'center', justifyContent: 'center' },
    loadingCard: { backgroundColor: Colors.card, borderRadius: BorderRadius.lg, padding: 32, alignItems: 'center', gap: 16, ...Shadows.lg },
    loadingText: { fontSize: Typography.sizes.base, color: Colors.textSecondary },
    modalOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
    actionsSheet: { backgroundColor: Colors.card, borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl, paddingTop: 8, paddingBottom: 32 },
    actionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 24, gap: 14 },
    actionText: { fontSize: Typography.sizes.base, color: Colors.textPrimary },
    actionDivider: { height: 1, backgroundColor: Colors.border, marginVertical: 8 },
    askAIOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
    askAISheet: { backgroundColor: Colors.card, borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl, padding: 24, maxHeight: '85%' },
    askAIHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    askAITitle: { fontSize: Typography.sizes.lg, fontWeight: Typography.bold, color: Colors.textPrimary },
    askAIQuickActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
    quickAction: { backgroundColor: Colors.accentSoft, paddingHorizontal: 14, paddingVertical: 8, borderRadius: BorderRadius.full },
    quickActionText: { fontSize: Typography.sizes.sm, color: Colors.primary, fontWeight: Typography.semibold },
    askAIInputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 12, marginBottom: 16 },
    askAIInput: { flex: 1, backgroundColor: Colors.background, borderRadius: BorderRadius.lg, padding: 14, fontSize: Typography.sizes.base, color: Colors.textPrimary, maxHeight: 100, borderWidth: 1, borderColor: Colors.border },
    askAISendBtn: { borderRadius: 22, overflow: 'hidden' },
    askAISendGradient: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    askAIResponseScroll: { maxHeight: 180 },
    askAIResponse: { backgroundColor: Colors.accentSoft, borderRadius: BorderRadius.lg, padding: 16 },
    saveResponseBtn: { borderRadius: BorderRadius.lg, overflow: 'hidden', marginTop: 12 },
    saveResponseGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
    saveResponseBtnText: { color: '#fff', fontWeight: Typography.semibold },
    errorText: { fontSize: Typography.sizes.lg, color: Colors.textSecondary, textAlign: 'center', marginTop: 100 },
    linkText: { fontSize: Typography.sizes.base, color: Colors.primary, textAlign: 'center', marginTop: 16 },
});
