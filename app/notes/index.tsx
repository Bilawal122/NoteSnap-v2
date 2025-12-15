import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore, sortItems, Note, SortOption } from '../../stores/appStore';
import { Colors, BorderRadius, Typography, Shadows } from '../../constants/theme';

function NoteCard({ note, onPress, onToggleFavorite }: { note: Note; onPress: () => void; onToggleFavorite: () => void }) {
    const previewText = note.content.slice(0, 100) + (note.content.length > 100 ? '...' : '');
    const date = new Date(note.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
            <LinearGradient colors={['#ffffff', '#f8f8f8']} style={styles.noteCard}>
                <View style={styles.noteHeader}>
                    <Text style={styles.noteTitle} numberOfLines={1}>{note.title || 'Untitled'}</Text>
                    <TouchableOpacity onPress={(e) => { e.stopPropagation(); onToggleFavorite(); }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Ionicons name={note.isFavorite ? "star" : "star-outline"} size={20} color={note.isFavorite ? Colors.warning : Colors.textMuted} />
                    </TouchableOpacity>
                </View>
                <Text style={styles.notePreview} numberOfLines={2}>{previewText}</Text>
                <View style={styles.noteMeta}>
                    <Text style={styles.noteDate}>{date}</Text>
                    <Text style={styles.noteWords}>{note.wordCount} words</Text>
                    {note.summary && <View style={styles.summarizedBadge}><Text style={styles.summarizedText}>Summarized</Text></View>}
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
}

function SortPicker({ value, onChange }: { value: SortOption; onChange: (v: SortOption) => void }) {
    const options: { value: SortOption; label: string }[] = [
        { value: 'newest', label: 'Newest' },
        { value: 'oldest', label: 'Oldest' },
        { value: 'alphabetical', label: 'A-Z' },
        { value: 'favorites', label: 'Favorites' },
    ];

    return (
        <View style={styles.sortContainer}>
            {options.map(opt => (
                <TouchableOpacity
                    key={opt.value}
                    style={[styles.sortOption, value === opt.value && styles.sortOptionActive]}
                    onPress={() => onChange(opt.value)}
                >
                    <Text style={[styles.sortOptionText, value === opt.value && styles.sortOptionTextActive]}>{opt.label}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

export default function NotesScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { notes, notesSortBy, setNotesSortBy, toggleNoteFavorite } = useAppStore();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredNotes = notes.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const sortedNotes = sortItems(filteredNotes, notesSortBy);

    const handleCreateNote = () => router.push('/notes/create');
    const handleViewNote = (noteId: string) => router.push(`/notes/${noteId}`);

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#faf3dd', '#f0ead2']} style={StyleSheet.absoluteFill} />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notes</Text>
                <TouchableOpacity onPress={handleCreateNote} style={styles.addButton}>
                    <Ionicons name="add" size={24} color={Colors.white} />
                </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                    <Ionicons name="search" size={18} color={Colors.textMuted} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search notes..."
                        placeholderTextColor={Colors.textMuted}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Sort */}
            <SortPicker value={notesSortBy} onChange={setNotesSortBy} />

            {/* Notes List */}
            {sortedNotes.length === 0 ? (
                <View style={styles.emptyState}>
                    <View style={styles.emptyIcon}>
                        <Ionicons name="document-text-outline" size={48} color={Colors.textMuted} />
                    </View>
                    <Text style={styles.emptyTitle}>{searchQuery ? 'No notes found' : 'No notes yet'}</Text>
                    <Text style={styles.emptySubtitle}>{searchQuery ? 'Try a different search' : 'Create your first note'}</Text>
                    {!searchQuery && (
                        <TouchableOpacity style={styles.createButton} onPress={handleCreateNote}>
                            <Ionicons name="add" size={18} color={Colors.white} />
                            <Text style={styles.createButtonText}>Create Note</Text>
                        </TouchableOpacity>
                    )}
                </View>
            ) : (
                <FlatList
                    data={sortedNotes}
                    renderItem={({ item }) => (
                        <NoteCard
                            note={item}
                            onPress={() => handleViewNote(item.id)}
                            onToggleFavorite={() => toggleNoteFavorite(item.id)}
                        />
                    )}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.notesList}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16 },
    backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center', ...Shadows.sm },
    headerTitle: { fontSize: Typography.sizes['2xl'], fontWeight: Typography.semibold, color: Colors.textPrimary },
    addButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center', ...Shadows.sm },
    searchContainer: { paddingHorizontal: 20, marginBottom: 12 },
    searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: BorderRadius.lg, paddingHorizontal: 14, paddingVertical: 12, gap: 10, ...Shadows.sm },
    searchInput: { flex: 1, fontSize: Typography.sizes.base, color: Colors.textPrimary },
    sortContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 16, gap: 8 },
    sortOption: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: BorderRadius.full, backgroundColor: Colors.card, ...Shadows.sm },
    sortOptionActive: { backgroundColor: Colors.accent },
    sortOptionText: { fontSize: Typography.sizes.sm, color: Colors.textSecondary, fontWeight: Typography.medium },
    sortOptionTextActive: { color: Colors.white },
    notesList: { paddingHorizontal: 20, paddingBottom: 100 },
    noteCard: { borderRadius: BorderRadius.lg, padding: 16, marginBottom: 12, ...Shadows.sm },
    noteHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
    noteTitle: { fontSize: Typography.sizes.lg, fontWeight: Typography.semibold, color: Colors.textPrimary, flex: 1, marginRight: 12 },
    notePreview: { fontSize: Typography.sizes.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: 12 },
    noteMeta: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    noteDate: { fontSize: Typography.sizes.xs, color: Colors.textMuted },
    noteWords: { fontSize: Typography.sizes.xs, color: Colors.textMuted },
    summarizedBadge: { backgroundColor: Colors.accentSoft, paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.sm },
    summarizedText: { fontSize: 10, fontWeight: Typography.medium, color: Colors.accent },
    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
    emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.divider, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    emptyTitle: { fontSize: Typography.sizes.xl, fontWeight: Typography.semibold, color: Colors.textPrimary, marginBottom: 8 },
    emptySubtitle: { fontSize: Typography.sizes.base, color: Colors.textSecondary, textAlign: 'center', marginBottom: 24 },
    createButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.accent, paddingVertical: 14, paddingHorizontal: 24, borderRadius: BorderRadius.lg, gap: 8, ...Shadows.md },
    createButtonText: { fontSize: Typography.sizes.base, fontWeight: Typography.semibold, color: Colors.white },
});
