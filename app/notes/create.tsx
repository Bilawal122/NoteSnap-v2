import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore, Note } from '../../stores/appStore';
import { useTheme, Colors, Gradients, BorderRadius, Typography, Shadows } from '../../contexts/ThemeContext';

export default function CreateNoteScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { addNote } = useAppStore();
    const inputRef = useRef<TextInput>(null);

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selection, setSelection] = useState({ start: 0, end: 0 });

    const wordCount = content.trim().split(/\s+/).filter(w => w.length > 0).length;

    const handleSave = () => {
        if (!content.trim()) {
            Alert.alert('Empty Note', 'Please add some content to your note.');
            return;
        }

        const newNote: Note = {
            id: Date.now().toString(),
            title: title.trim() || 'Untitled',
            content: content.trim(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isFavorite: false,
            wordCount,
            tags: [],
        };

        addNote(newNote);
        router.back();
    };

    const handleDiscard = () => {
        if (title.trim() || content.trim()) {
            Alert.alert(
                'Discard Note?',
                'You have unsaved changes. Are you sure you want to discard them?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Discard', style: 'destructive', onPress: () => router.back() },
                ]
            );
        } else {
            router.back();
        }
    };

    // Insert formatting at cursor
    const insertFormat = (prefix: string, suffix: string = '') => {
        const { start, end } = selection;
        const selectedText = content.substring(start, end);
        const before = content.substring(0, start);
        const after = content.substring(end);

        if (selectedText) {
            // Wrap selected text
            const newContent = before + prefix + selectedText + suffix + after;
            setContent(newContent);
        } else {
            // Insert at cursor
            const newContent = before + prefix + suffix + after;
            setContent(newContent);
        }
        inputRef.current?.focus();
    };

    const handleBold = () => insertFormat('**', '**');
    const handleItalic = () => insertFormat('_', '_');
    const handleBullet = () => insertFormat('\n• ');
    const handleHeading = () => insertFormat('\n## ');
    const handleNumberedList = () => {
        const lines = content.substring(0, selection.start).split('\n');
        const lastLine = lines[lines.length - 1];
        const match = lastLine.match(/^(\d+)\./);
        const nextNum = match ? parseInt(match[1]) + 1 : 1;
        insertFormat(`\n${nextNum}. `);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <LinearGradient colors={['#faf3dd', '#f0ead2']} style={StyleSheet.absoluteFill} />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                <TouchableOpacity onPress={handleDiscard} style={styles.headerBtn}>
                    <Ionicons name="close" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>New Note</Text>
                <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
                    <Text style={styles.saveBtnText}>Save</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} keyboardDismissMode="interactive">
                {/* Title Input */}
                <TextInput
                    style={styles.titleInput}
                    placeholder="Title"
                    placeholderTextColor={Colors.textMuted}
                    value={title}
                    onChangeText={setTitle}
                    maxLength={100}
                />

                {/* Content Input */}
                <TextInput
                    ref={inputRef}
                    style={styles.contentInput}
                    placeholder="Start typing your notes..."
                    placeholderTextColor={Colors.textMuted}
                    value={content}
                    onChangeText={setContent}
                    onSelectionChange={(e) => setSelection(e.nativeEvent.selection)}
                    multiline
                    textAlignVertical="top"
                />
            </ScrollView>

            {/* Formatting Toolbar */}
            <View style={[styles.toolbar, { paddingBottom: Math.max(insets.bottom, 8) + 8 }]}>
                <View style={styles.toolbarInner}>
                    <TouchableOpacity style={styles.toolBtn} onPress={handleBold}>
                        <Text style={styles.toolBtnTextBold}>B</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.toolBtn} onPress={handleItalic}>
                        <Text style={styles.toolBtnTextItalic}>I</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.toolBtn} onPress={handleHeading}>
                        <Ionicons name="text" size={18} color={Colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.toolBtn} onPress={handleBullet}>
                        <Ionicons name="list" size={18} color={Colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.toolBtn} onPress={handleNumberedList}>
                        <Text style={styles.toolBtnText}>1.</Text>
                    </TouchableOpacity>

                    <View style={styles.toolbarSpacer} />

                    <Text style={styles.wordCount}>{wordCount} words</Text>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
    headerBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center', ...Shadows.sm },
    headerTitle: { fontSize: Typography.sizes.lg, fontWeight: Typography.semibold, color: Colors.textPrimary },
    saveBtn: { backgroundColor: Colors.accent, paddingHorizontal: 20, paddingVertical: 10, borderRadius: BorderRadius.lg, ...Shadows.sm },
    saveBtnText: { fontSize: Typography.sizes.base, fontWeight: Typography.semibold, color: Colors.white },
    content: { flex: 1 },
    contentInner: { padding: 24, paddingBottom: 100 },
    titleInput: { fontSize: Typography.sizes['2xl'], fontWeight: Typography.semibold, color: Colors.textPrimary, marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
    contentInput: { fontSize: Typography.sizes.base, color: Colors.textPrimary, lineHeight: 26, minHeight: 300 },
    toolbar: { backgroundColor: Colors.card, borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 8, paddingHorizontal: 16 },
    toolbarInner: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    toolBtn: { width: 40, height: 40, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
    toolBtnTextBold: { fontSize: 18, fontWeight: '900', color: Colors.textSecondary },
    toolBtnTextItalic: { fontSize: 18, fontStyle: 'italic', fontWeight: '600', color: Colors.textSecondary },
    toolBtnText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
    toolbarSpacer: { flex: 1 },
    wordCount: { fontSize: Typography.sizes.sm, color: Colors.textMuted },
});
