import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore, Note } from '../../stores/appStore';
import { analyzeImageWithAction, extractPDFText, callAI } from '../../utils/ai';
import { useTheme, Colors, BorderRadius, Typography, Shadows } from '../../contexts/ThemeContext';

function UploadOption({ icon, title, subtitle, onPress, color = Colors.accent }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle: string;
    onPress: () => void;
    color?: string;
}) {
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
            <LinearGradient colors={['#ffffff', '#f8f8f8']} style={styles.optionCard}>
                <View style={[styles.optionIcon, { backgroundColor: `${color}15` }]}>
                    <Ionicons name={icon} size={24} color={color} />
                </View>
                <View style={styles.optionText}>
                    <Text style={styles.optionTitle}>{title}</Text>
                    <Text style={styles.optionSubtitle}>{subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
            </LinearGradient>
        </TouchableOpacity>
    );
}

function ImageActionsModal({ visible, imageUri, onClose, onAction, isLoading, loadingMessage }: {
    visible: boolean;
    imageUri: string;
    onClose: () => void;
    onAction: (action: 'save' | 'extract' | 'summarize' | 'flashcards' | 'quiz') => void;
    isLoading: boolean;
    loadingMessage: string;
}) {
    const actions = [
        { id: 'save', icon: 'save', label: 'Save Image', desc: 'Store for later', color: '#4caf50', bg: '#e8f5e9' },
        { id: 'extract', icon: 'document-text', label: 'Extract Text', desc: 'OCR to notes', color: '#2196f3', bg: '#e3f2fd' },
        { id: 'summarize', icon: 'bulb', label: 'Summarize', desc: 'Key points', color: '#ff9800', bg: '#fff3e0' },
        { id: 'flashcards', icon: 'layers', label: 'Flashcards', desc: 'Create cards', color: '#9c27b0', bg: '#f3e5f5' },
        { id: 'quiz', icon: 'help-circle', label: 'Quiz', desc: 'Test yourself', color: '#e91e63', bg: '#fce4ec' },
    ] as const;

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
                        <Ionicons name="close" size={24} color={Colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>What to do with this image?</Text>
                </View>

                {imageUri && (
                    <View style={styles.imagePreviewContainer}>
                        <Image source={{ uri: imageUri }} style={styles.imagePreview} resizeMode="contain" />
                    </View>
                )}

                <View style={styles.actionsGrid}>
                    {actions.map(action => (
                        <TouchableOpacity
                            key={action.id}
                            style={styles.actionCard}
                            onPress={() => onAction(action.id)}
                            disabled={isLoading}
                        >
                            <View style={[styles.actionIconBg, { backgroundColor: action.bg }]}>
                                <Ionicons name={action.icon as any} size={28} color={action.color} />
                            </View>
                            <Text style={styles.actionLabel}>{action.label}</Text>
                            <Text style={styles.actionDesc}>{action.desc}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {isLoading && (
                    <View style={styles.loadingOverlayInner}>
                        <View style={styles.loadingBox}>
                            <ActivityIndicator size="large" color={Colors.accent} />
                            <Text style={styles.loadingText}>{loadingMessage}</Text>
                            <Text style={styles.loadingHint}>This may take 10-30 seconds</Text>
                        </View>
                    </View>
                )}
            </View>
        </Modal>
    );
}

export default function UploadScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { addNote, addDeck, addQuiz } = useAppStore();

    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState<{ uri: string; base64: string } | null>(null);

    // Audio recording state
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [showRecordingModal, setShowRecordingModal] = useState(false);
    const recordingRef = useRef<Audio.Recording | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const handleImageAction = async (action: 'save' | 'extract' | 'summarize' | 'flashcards' | 'quiz') => {
        if (!selectedImage) return;

        const timestamp = new Date().toLocaleDateString();

        if (action === 'save') {
            // Save image with base64 so AI can analyze it later
            const note: Note = {
                id: Date.now().toString(),
                title: `Image - ${timestamp}`,
                content: '[Image saved - Ask AI to analyze it]',
                imageUri: selectedImage.uri,
                imageBase64: selectedImage.base64,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isFavorite: false,
                wordCount: 0,
                tags: ['image'],
            };
            addNote(note);
            setShowImageModal(false);
            setSelectedImage(null);
            Alert.alert('Image Saved!', 'You can now ask AI about this image from the note.', [
                { text: 'View Note', onPress: () => router.push(`/notes/${note.id}`) },
                { text: 'OK' },
            ]);
            return;
        }

        setIsLoading(true);
        setLoadingMessage(
            action === 'extract' ? 'Extracting text with AI...' :
                action === 'summarize' ? 'AI is summarizing...' :
                    action === 'flashcards' ? 'Creating flashcards...' :
                        'Creating quiz questions...'
        );

        try {
            const result = await analyzeImageWithAction(selectedImage.base64, action);
            setIsLoading(false);

            if (!result.success) {
                Alert.alert('AI Failed', result.error || 'Could not process image. Try again.');
                return;
            }

            if (action === 'extract' || action === 'summarize') {
                const note: Note = {
                    id: Date.now().toString(),
                    title: action === 'extract' ? `Extracted Text - ${timestamp}` : `Summary - ${timestamp}`,
                    content: result.message,
                    imageUri: selectedImage.uri,
                    imageBase64: selectedImage.base64,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    isFavorite: false,
                    wordCount: result.message.split(/\s+/).filter(w => w.length > 0).length,
                    tags: [action === 'extract' ? 'ocr' : 'summary', 'image'],
                };
                addNote(note);
                setShowImageModal(false);
                setSelectedImage(null);
                Alert.alert('Done!', `${note.wordCount} words extracted.`, [
                    { text: 'View', onPress: () => router.push(`/notes/${note.id}`) },
                    { text: 'OK' },
                ]);
            } else if (action === 'flashcards') {
                try {
                    const jsonMatch = result.message.match(/\[\s*\{[\s\S]*?\}\s*\]/);
                    if (jsonMatch) {
                        const cards = JSON.parse(jsonMatch[0]);
                        if (Array.isArray(cards) && cards.length > 0) {
                            const deckId = Date.now().toString();
                            addDeck({
                                id: deckId,
                                title: `Image Flashcards - ${timestamp}`,
                                cards: cards.map((fc: any, i: number) => ({
                                    id: `${deckId}-${i}`,
                                    front: fc.front || fc.question || '',
                                    back: fc.back || fc.answer || '',
                                    confidence: 'new',
                                    correctCount: 0,
                                    incorrectCount: 0,
                                })).filter((c: any) => c.front && c.back),
                                createdAt: new Date().toISOString(),
                                isFavorite: false,
                            });
                            setShowImageModal(false);
                            setSelectedImage(null);
                            Alert.alert('Flashcards Created!', `${cards.length} cards ready.`, [
                                { text: 'Study Now', onPress: () => router.push(`/flashcard/${deckId}`) },
                                { text: 'Later' },
                            ]);
                            return;
                        }
                    }
                    Alert.alert('Error', 'Could not parse flashcards from AI response.');
                } catch { Alert.alert('Error', 'Failed to create flashcards.'); }
            } else if (action === 'quiz') {
                try {
                    const jsonMatch = result.message.match(/\[\s*\{[\s\S]*?\}\s*\]/);
                    if (jsonMatch) {
                        const questions = JSON.parse(jsonMatch[0]);
                        if (Array.isArray(questions) && questions.length > 0) {
                            const quizId = Date.now().toString();
                            addQuiz({
                                id: quizId,
                                title: `Image Quiz - ${timestamp}`,
                                questions: questions.map((q: any, i: number) => ({
                                    id: `${quizId}-${i}`,
                                    question: q.question,
                                    options: q.options,
                                    correctAnswer: q.correctAnswer,
                                    explanation: q.explanation,
                                })),
                                createdAt: new Date().toISOString(),
                                isFavorite: false,
                            });
                            setShowImageModal(false);
                            setSelectedImage(null);
                            Alert.alert('Quiz Created!', `${questions.length} questions ready.`, [
                                { text: 'Take Quiz', onPress: () => router.push(`/quiz/${quizId}`) },
                                { text: 'Later' },
                            ]);
                            return;
                        }
                    }
                    Alert.alert('Error', 'Could not parse quiz from AI response.');
                } catch { Alert.alert('Error', 'Failed to create quiz.'); }
            }
        } catch {
            setIsLoading(false);
            Alert.alert('Error', 'Something went wrong. Please try again.');
        }
    };

    const handleCamera = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Needed', 'Camera access is required.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: 'images',
            quality: 0.8,
            base64: true,
        });

        if (!result.canceled && result.assets[0]?.base64) {
            setSelectedImage({ uri: result.assets[0].uri, base64: result.assets[0].base64 });
            setShowImageModal(true);
        }
    };

    const handleGallery = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            quality: 0.8,
            base64: true,
        });

        if (!result.canceled && result.assets[0]?.base64) {
            setSelectedImage({ uri: result.assets[0].uri, base64: result.assets[0].base64 });
            setShowImageModal(true);
        }
    };

    const handlePDF = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf'],
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                const fileName = asset.name.replace(/\.[^/.]+$/, '') || 'PDF Document';

                setIsLoading(true);
                setLoadingMessage('AI is reading PDF...');

                try {
                    const base64 = await FileSystem.readAsStringAsync(asset.uri, { encoding: 'base64' });
                    const extraction = await extractPDFText(base64, asset.name);

                    setIsLoading(false);

                    if (extraction.success && extraction.message.length > 20) {
                        const note: Note = {
                            id: Date.now().toString(),
                            title: fileName,
                            content: extraction.message,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            isFavorite: false,
                            wordCount: extraction.message.split(/\s+/).filter(w => w.length > 0).length,
                            tags: ['pdf'],
                        };
                        addNote(note);
                        Alert.alert('PDF Extracted!', `${note.wordCount} words.`, [
                            { text: 'View', onPress: () => router.push(`/notes/${note.id}`) },
                            { text: 'OK' },
                        ]);
                    } else {
                        Alert.alert(
                            'Could Not Read PDF',
                            'Try taking photos of the pages instead.',
                            [{ text: 'OK' }]
                        );
                    }
                } catch {
                    setIsLoading(false);
                    Alert.alert('Error', 'Could not read PDF file.');
                }
            }
        } catch {
            setIsLoading(false);
        }
    };

    const handleTextFile = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['text/plain', 'text/*'],
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets[0]) {
                setIsLoading(true);
                setLoadingMessage('Reading file...');

                try {
                    const content = await FileSystem.readAsStringAsync(result.assets[0].uri);
                    const fileName = result.assets[0].name.replace(/\.[^/.]+$/, '') || 'Document';
                    const note: Note = {
                        id: Date.now().toString(),
                        title: fileName,
                        content,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        isFavorite: false,
                        wordCount: content.split(/\s+/).filter(w => w.length > 0).length,
                        tags: ['text-file'],
                    };
                    addNote(note);
                    setIsLoading(false);
                    Alert.alert('Imported!', `${note.wordCount} words.`, [
                        { text: 'View', onPress: () => router.push(`/notes/${note.id}`) },
                        { text: 'OK' },
                    ]);
                } catch {
                    setIsLoading(false);
                    Alert.alert('Error', 'Could not read file.');
                }
            }
        } catch { setIsLoading(false); }
    };

    const handleHandwrittenOCR = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            quality: 0.9,
            base64: true,
        });

        if (!result.canceled && result.assets[0]?.base64) {
            setIsLoading(true);
            setLoadingMessage('Reading handwritten text...');

            try {
                const ocrResult = await analyzeImageWithAction(result.assets[0].base64, 'ocr');
                setIsLoading(false);

                if (ocrResult.success && ocrResult.message.length > 10) {
                    const timestamp = new Date().toLocaleDateString();
                    const note: Note = {
                        id: Date.now().toString(),
                        title: `Handwritten Notes - ${timestamp}`,
                        content: ocrResult.message,
                        imageUri: result.assets[0].uri,
                        imageBase64: result.assets[0].base64,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        isFavorite: false,
                        wordCount: ocrResult.message.split(/\s+/).filter((w: string) => w.length > 0).length,
                        tags: ['handwritten', 'ocr'],
                    };
                    addNote(note);
                    Alert.alert('Text Extracted!', `${note.wordCount} words from handwriting.`, [
                        { text: 'View', onPress: () => router.push(`/notes/${note.id}`) },
                        { text: 'OK' },
                    ]);
                } else {
                    Alert.alert('OCR Failed', 'Could not read handwriting. Try with a clearer image.');
                }
            } catch {
                setIsLoading(false);
                Alert.alert('Error', 'Failed to process image.');
            }
        }
    };

    // Video picker handler
    const handleVideoPicker = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'videos',
            quality: 0.5,
            videoMaxDuration: 60, // Max 1 minute for processing
        });

        if (!result.canceled && result.assets[0]) {
            const videoUri = result.assets[0].uri;
            const duration = result.assets[0].duration || 0;

            Alert.alert(
                'Video Selected',
                `Duration: ${Math.round(duration / 1000)}s\n\nVideo transcription works best with lecture recordings or presentations. AI will analyze key frames to extract content.`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Extract Content',
                        onPress: async () => {
                            setIsLoading(true);
                            setLoadingMessage('Processing video frames...');

                            // For now, save as a note with the video reference
                            // Full video transcription would require extracting frames
                            const timestamp = new Date().toLocaleDateString();
                            const note: Note = {
                                id: Date.now().toString(),
                                title: `Video Notes - ${timestamp}`,
                                content: `[Video saved - ${Math.round(duration / 1000)} seconds]\n\nTo transcribe this video:\n1. Take screenshots of key slides/frames\n2. Upload them using "Take Photo" or "Choose Image"\n3. AI will extract text from each frame\n\nThis ensures accurate text extraction from your video content.`,
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString(),
                                isFavorite: false,
                                wordCount: 0,
                                tags: ['video'],
                            };
                            addNote(note);
                            setIsLoading(false);

                            Alert.alert('Video Saved!', 'Take screenshots of key frames for AI transcription.', [
                                { text: 'View Note', onPress: () => router.push(`/notes/${note.id}`) },
                                { text: 'OK' },
                            ]);
                        }
                    }
                ]
            );
        }
    };

    // Audio recording handlers
    const startRecording = async () => {
        try {
            const permission = await Audio.requestPermissionsAsync();
            if (!permission.granted) {
                Alert.alert('Permission Required', 'Microphone access is needed to record audio.');
                return;
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );

            recordingRef.current = recording;
            setIsRecording(true);
            setRecordingDuration(0);

            // Start timer
            timerRef.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);

        } catch (error) {
            console.log('Failed to start recording:', error);
            Alert.alert('Error', 'Could not start recording. Check microphone permissions.');
        }
    };

    const stopRecording = async () => {
        if (!recordingRef.current) return;

        try {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }

            setIsRecording(false);
            await recordingRef.current.stopAndUnloadAsync();

            const uri = recordingRef.current.getURI();
            recordingRef.current = null;

            if (uri) {
                // Save as note with audio reference
                const timestamp = new Date().toLocaleDateString();
                const durationText = formatDuration(recordingDuration);

                const note: Note = {
                    id: Date.now().toString(),
                    title: `Voice Note - ${timestamp}`,
                    content: `[Audio Recording - ${durationText}]\n\nNote: Audio transcription is coming soon!\nFor now, you can:\n1. Play back your recording\n2. Manually add notes here\n3. Use AI to help organize your thoughts`,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    isFavorite: false,
                    wordCount: 0,
                    tags: ['audio', 'voice-note'],
                };
                addNote(note);

                setShowRecordingModal(false);
                setRecordingDuration(0);

                Alert.alert('Recording Saved!', `${durationText} voice note created.`, [
                    { text: 'View Note', onPress: () => router.push(`/notes/${note.id}`) },
                    { text: 'OK' },
                ]);
            }
        } catch (error) {
            console.log('Failed to stop recording:', error);
            Alert.alert('Error', 'Could not save recording.');
        }
    };

    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAudioRecording = () => {
        setShowRecordingModal(true);
    };

    const handleWriteNote = () => router.push('/notes/create');

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#faf3dd', '#f0ead2']} style={StyleSheet.absoluteFill} />

            <ScrollView
                contentContainerStyle={[styles.content, { paddingTop: insets.top + 24, paddingBottom: 120 }]}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.title}>Add Notes</Text>
                <Text style={styles.subtitle}>Capture, upload, or create study materials</Text>

                <View style={styles.optionsContainer}>
                    <UploadOption icon="camera-outline" title="Take Photo" subtitle="Capture with camera" onPress={handleCamera} color={Colors.accent} />
                    <UploadOption icon="image-outline" title="Choose Image" subtitle="Select from gallery" onPress={handleGallery} color="#9b59b6" />
                    <UploadOption icon="pencil-outline" title="Handwritten Notes" subtitle="OCR for handwriting" onPress={handleHandwrittenOCR} color="#f39c12" />
                    <UploadOption icon="videocam-outline" title="Video" subtitle="Upload lecture recording" onPress={handleVideoPicker} color="#e91e63" />
                    <UploadOption icon="mic-outline" title="Voice Recording" subtitle="Record and transcribe" onPress={handleAudioRecording} color="#00bcd4" />
                    <UploadOption icon="document-outline" title="Upload PDF" subtitle="Extract text from PDF" onPress={handlePDF} color="#e74c3c" />
                    <UploadOption icon="document-text-outline" title="Text File" subtitle=".txt, .md files" onPress={handleTextFile} color="#3498db" />
                    <UploadOption icon="create-outline" title="Write Note" subtitle="Type manually" onPress={handleWriteNote} color={Colors.success} />
                </View>

                <View style={styles.infoCard}>
                    <Ionicons name="sparkles" size={18} color={Colors.accent} />
                    <Text style={styles.infoText}>
                        Images are saved with your notes. You can ask AI to summarize, create flashcards, or quiz you anytime!
                    </Text>
                </View>
            </ScrollView>

            <ImageActionsModal
                visible={showImageModal}
                imageUri={selectedImage?.uri || ''}
                onClose={() => { setShowImageModal(false); setSelectedImage(null); }}
                onAction={handleImageAction}
                isLoading={isLoading}
                loadingMessage={loadingMessage}
            />

            {isLoading && !showImageModal && (
                <View style={styles.loadingOverlay}>
                    <View style={styles.loadingCard}>
                        <ActivityIndicator size="large" color={Colors.accent} />
                        <Text style={styles.loadingCardText}>{loadingMessage}</Text>
                    </View>
                </View>
            )}

            {/* Audio Recording Modal */}
            <Modal visible={showRecordingModal} transparent animationType="fade">
                <View style={styles.recordingModalOverlay}>
                    <View style={styles.recordingModalContent}>
                        <Text style={styles.recordingTitle}>Voice Recording</Text>

                        <View style={styles.recordingTimer}>
                            <View style={[styles.recordingDot, isRecording && styles.recordingDotActive]} />
                            <Text style={styles.recordingDuration}>{formatDuration(recordingDuration)}</Text>
                        </View>

                        <View style={styles.recordingActions}>
                            {!isRecording ? (
                                <TouchableOpacity style={styles.recordButton} onPress={startRecording}>
                                    <Ionicons name="mic" size={32} color="#fff" />
                                    <Text style={styles.recordButtonText}>Start Recording</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity style={[styles.recordButton, styles.stopButton]} onPress={stopRecording}>
                                    <Ionicons name="stop" size={32} color="#fff" />
                                    <Text style={styles.recordButtonText}>Stop & Save</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        <TouchableOpacity
                            style={styles.cancelRecording}
                            onPress={() => {
                                if (isRecording) {
                                    recordingRef.current?.stopAndUnloadAsync();
                                    if (timerRef.current) clearInterval(timerRef.current);
                                }
                                setIsRecording(false);
                                setRecordingDuration(0);
                                setShowRecordingModal(false);
                            }}
                        >
                            <Text style={styles.cancelRecordingText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    content: { paddingHorizontal: 24 },
    title: { fontSize: Typography.sizes['3xl'], fontWeight: Typography.semibold, color: Colors.textPrimary },
    subtitle: { fontSize: Typography.sizes.base, color: Colors.textSecondary, marginTop: 4, marginBottom: 32 },
    optionsContainer: { gap: 12 },
    optionCard: { flexDirection: 'row', alignItems: 'center', borderRadius: BorderRadius.lg, padding: 18, ...Shadows.sm },
    optionIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    optionText: { flex: 1 },
    optionTitle: { fontSize: Typography.sizes.base, fontWeight: Typography.semibold, color: Colors.textPrimary },
    optionSubtitle: { fontSize: Typography.sizes.sm, color: Colors.textSecondary, marginTop: 2 },
    infoCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: Colors.accentSoft, borderRadius: BorderRadius.lg, padding: 16, marginTop: 32, gap: 12 },
    infoText: { flex: 1, fontSize: Typography.sizes.sm, color: Colors.textSecondary, lineHeight: 20 },

    modalContainer: { flex: 1, backgroundColor: Colors.background },
    modalHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: Colors.border },
    modalCloseBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center' },
    modalTitle: { fontSize: Typography.sizes.lg, fontWeight: Typography.semibold, color: Colors.textPrimary, marginLeft: 16 },
    imagePreviewContainer: { height: 220, margin: 20, borderRadius: BorderRadius.lg, overflow: 'hidden', backgroundColor: '#f0f0f0' },
    imagePreview: { width: '100%', height: '100%' },
    actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 12, justifyContent: 'center' },
    actionCard: { width: '45%', backgroundColor: Colors.card, borderRadius: BorderRadius.lg, padding: 16, alignItems: 'center', ...Shadows.sm },
    actionIconBg: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    actionLabel: { fontSize: Typography.sizes.base, fontWeight: Typography.semibold, color: Colors.textPrimary },
    actionDesc: { fontSize: Typography.sizes.sm, color: Colors.textMuted, marginTop: 4 },
    loadingOverlayInner: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center' },
    loadingBox: { backgroundColor: Colors.card, padding: 32, borderRadius: BorderRadius.xl, alignItems: 'center', ...Shadows.lg },
    loadingText: { fontSize: Typography.sizes.base, color: Colors.textPrimary, marginTop: 16, fontWeight: Typography.medium },
    loadingHint: { fontSize: Typography.sizes.sm, color: Colors.textMuted, marginTop: 8 },

    loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
    loadingCard: { backgroundColor: Colors.card, borderRadius: BorderRadius.xl, padding: 32, alignItems: 'center', width: 280, ...Shadows.lg },
    loadingCardText: { fontSize: Typography.sizes.base, fontWeight: Typography.medium, color: Colors.textPrimary, marginTop: 16 },

    // Recording modal styles
    recordingModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center' },
    recordingModalContent: { backgroundColor: Colors.card, borderRadius: BorderRadius.xl, padding: 32, alignItems: 'center', width: 300, ...Shadows.lg },
    recordingTitle: { fontSize: Typography.sizes.xl, fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: 24 },
    recordingTimer: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
    recordingDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.textMuted, marginRight: 12 },
    recordingDotActive: { backgroundColor: '#e74c3c' },
    recordingDuration: { fontSize: 48, fontWeight: Typography.bold, color: Colors.textPrimary, fontVariant: ['tabular-nums'] },
    recordingActions: { marginBottom: 24 },
    recordButton: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#00bcd4', alignItems: 'center', justifyContent: 'center', ...Shadows.lg },
    stopButton: { backgroundColor: '#e74c3c' },
    recordButtonText: { fontSize: Typography.sizes.sm, fontWeight: Typography.semibold, color: '#fff', marginTop: 8 },
    cancelRecording: { paddingVertical: 12, paddingHorizontal: 24 },
    cancelRecordingText: { fontSize: Typography.sizes.base, color: Colors.textSecondary },
});
