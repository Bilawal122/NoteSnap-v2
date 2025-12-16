import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore, Flashcard } from '../../stores/appStore';
import { useTheme, Colors, Gradients, BorderRadius, Typography, Shadows } from '../../contexts/ThemeContext';

export default function DeckManageScreen() {
    const { deckId } = useLocalSearchParams<{ deckId: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { decks, updateDeck, deleteDeck, addCardToDeck, updateCard, deleteCard } = useAppStore();

    const deck = decks.find(d => d.id === deckId);
    const [showAddCard, setShowAddCard] = useState(false);
    const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
    const [newFront, setNewFront] = useState('');
    const [newBack, setNewBack] = useState('');
    const [editTitle, setEditTitle] = useState(deck?.title || '');
    const [isEditingTitle, setIsEditingTitle] = useState(false);

    if (!deck) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <LinearGradient colors={Gradients.background} style={StyleSheet.absoluteFill} />
                <Text style={styles.errorText}>Deck not found</Text>
                <TouchableOpacity onPress={() => router.back()}><Text style={styles.linkText}>Go back</Text></TouchableOpacity>
            </View>
        );
    }

    const handleAddCard = () => {
        if (!newFront.trim() || !newBack.trim()) {
            Alert.alert('Error', 'Please fill in both sides of the card');
            return;
        }
        const newCard: Flashcard = {
            id: Date.now().toString(),
            front: newFront.trim(),
            back: newBack.trim(),
            confidence: 'new',
            correctCount: 0,
            incorrectCount: 0,
        };
        addCardToDeck(deck.id, newCard);
        setNewFront('');
        setNewBack('');
        setShowAddCard(false);
        Alert.alert('Success', 'Card added!');
    };

    const handleUpdateCard = () => {
        if (!editingCard || !newFront.trim() || !newBack.trim()) return;
        updateCard(deck.id, editingCard.id, { front: newFront.trim(), back: newBack.trim() });
        setEditingCard(null);
        setNewFront('');
        setNewBack('');
    };

    const handleDeleteCard = (cardId: string) => {
        Alert.alert('Delete Card', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => deleteCard(deck.id, cardId) },
        ]);
    };

    const handleDeleteDeck = () => {
        Alert.alert('Delete Deck', 'Delete this entire deck?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => { deleteDeck(deck.id); router.back(); } },
        ]);
    };

    const handleSaveTitle = () => {
        if (editTitle.trim()) {
            updateDeck(deck.id, { title: editTitle.trim() });
        }
        setIsEditingTitle(false);
    };

    const openEditCard = (card: Flashcard) => {
        setEditingCard(card);
        setNewFront(card.front);
        setNewBack(card.back);
    };

    const getConfidenceColor = (confidence: Flashcard['confidence']) => {
        switch (confidence) {
            case 'mastered': return Colors.success;
            case 'reviewing': return Colors.teal;
            case 'learning': return Colors.warning;
            default: return Colors.textMuted;
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={Gradients.background} style={StyleSheet.absoluteFill} />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    {isEditingTitle ? (
                        <TextInput
                            style={styles.titleInput}
                            value={editTitle}
                            onChangeText={setEditTitle}
                            onBlur={handleSaveTitle}
                            autoFocus
                        />
                    ) : (
                        <TouchableOpacity onPress={() => setIsEditingTitle(true)}>
                            <Text style={styles.headerTitle}>{deck.title}</Text>
                            <Text style={styles.headerSub}>Tap to rename</Text>
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity onPress={handleDeleteDeck} style={styles.deleteBtn}>
                    <Ionicons name="trash-outline" size={22} color={Colors.error} />
                </TouchableOpacity>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
                <View style={styles.statBox}>
                    <Text style={styles.statValue}>{deck.cards.length}</Text>
                    <Text style={styles.statLabel}>Cards</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={[styles.statValue, { color: Colors.success }]}>{deck.cards.filter(c => c.confidence === 'mastered').length}</Text>
                    <Text style={styles.statLabel}>Mastered</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={[styles.statValue, { color: Colors.warning }]}>{deck.cards.filter(c => c.confidence === 'learning').length}</Text>
                    <Text style={styles.statLabel}>Learning</Text>
                </View>
            </View>

            {/* Cards List */}
            <ScrollView style={styles.cardsList} contentContainerStyle={styles.cardsListContent}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>All Cards</Text>
                    <TouchableOpacity style={styles.addBtn} onPress={() => { setShowAddCard(true); setNewFront(''); setNewBack(''); }}>
                        <Ionicons name="add" size={20} color="#fff" />
                        <Text style={styles.addBtnText}>Add Card</Text>
                    </TouchableOpacity>
                </View>

                {deck.cards.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="layers-outline" size={48} color={Colors.textMuted} />
                        <Text style={styles.emptyText}>No cards yet</Text>
                    </View>
                ) : (
                    deck.cards.map((card, idx) => (
                        <View key={card.id} style={styles.cardItem}>
                            <View style={[styles.cardConfidence, { backgroundColor: getConfidenceColor(card.confidence) }]} />
                            <View style={styles.cardContent}>
                                <Text style={styles.cardNumber}>#{idx + 1}</Text>
                                <Text style={styles.cardFront} numberOfLines={2}>{card.front}</Text>
                                <Text style={styles.cardBack} numberOfLines={2}>{card.back}</Text>
                            </View>
                            <View style={styles.cardActions}>
                                <TouchableOpacity style={styles.cardAction} onPress={() => openEditCard(card)}>
                                    <Ionicons name="create-outline" size={18} color={Colors.primary} />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.cardAction} onPress={() => handleDeleteCard(card.id)}>
                                    <Ionicons name="trash-outline" size={18} color={Colors.error} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>

            {/* Study Button */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
                <TouchableOpacity style={styles.studyBtn} onPress={() => router.push(`/flashcard/${deck.id}`)}>
                    <LinearGradient colors={Gradients.primary} style={styles.studyBtnGradient}>
                        <Ionicons name="school" size={20} color="#fff" />
                        <Text style={styles.studyBtnText}>Study Now</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* Add/Edit Card Modal */}
            <Modal visible={showAddCard || !!editingCard} transparent animationType="slide" onRequestClose={() => { setShowAddCard(false); setEditingCard(null); }}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalSheet, { paddingBottom: insets.bottom + 16 }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{editingCard ? 'Edit Card' : 'Add New Card'}</Text>
                            <TouchableOpacity onPress={() => { setShowAddCard(false); setEditingCard(null); }}>
                                <Ionicons name="close" size={24} color={Colors.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.inputLabel}>Front (Question)</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="What the user sees first..."
                            placeholderTextColor={Colors.textMuted}
                            value={newFront}
                            onChangeText={setNewFront}
                            multiline
                        />

                        <Text style={styles.inputLabel}>Back (Answer)</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="The answer revealed on flip..."
                            placeholderTextColor={Colors.textMuted}
                            value={newBack}
                            onChangeText={setNewBack}
                            multiline
                        />

                        <TouchableOpacity style={styles.saveCardBtn} onPress={editingCard ? handleUpdateCard : handleAddCard}>
                            <LinearGradient colors={Gradients.primary} style={styles.saveCardBtnGradient}>
                                <Text style={styles.saveCardBtnText}>{editingCard ? 'Save Changes' : 'Add Card'}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 16 },
    backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center', ...Shadows.sm },
    headerCenter: { flex: 1, alignItems: 'center' },
    headerTitle: { fontSize: Typography.sizes.lg, fontWeight: Typography.bold, color: Colors.textPrimary },
    headerSub: { fontSize: Typography.sizes.xs, color: Colors.textMuted, marginTop: 2 },
    titleInput: { fontSize: Typography.sizes.lg, fontWeight: Typography.bold, color: Colors.textPrimary, textAlign: 'center', borderBottomWidth: 2, borderBottomColor: Colors.primary, paddingBottom: 4 },
    deleteBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.errorSoft, alignItems: 'center', justifyContent: 'center' },
    statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 20 },
    statBox: { flex: 1, backgroundColor: Colors.card, borderRadius: BorderRadius.lg, padding: 16, alignItems: 'center', ...Shadows.sm },
    statValue: { fontSize: Typography.sizes['2xl'], fontWeight: Typography.bold, color: Colors.textPrimary },
    statLabel: { fontSize: Typography.sizes.xs, color: Colors.textMuted, marginTop: 4 },
    cardsList: { flex: 1 },
    cardsListContent: { padding: 16, paddingBottom: 100 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: Typography.sizes.lg, fontWeight: Typography.bold, color: Colors.textPrimary },
    addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: BorderRadius.full, gap: 6 },
    addBtnText: { fontSize: Typography.sizes.sm, fontWeight: Typography.semibold, color: '#fff' },
    emptyState: { alignItems: 'center', paddingVertical: 48 },
    emptyText: { fontSize: Typography.sizes.base, color: Colors.textMuted, marginTop: 12 },
    cardItem: { flexDirection: 'row', alignItems: 'stretch', backgroundColor: Colors.card, borderRadius: BorderRadius.lg, marginBottom: 10, overflow: 'hidden', ...Shadows.sm },
    cardConfidence: { width: 4 },
    cardContent: { flex: 1, padding: 14 },
    cardNumber: { fontSize: Typography.sizes.xs, color: Colors.textMuted, marginBottom: 4 },
    cardFront: { fontSize: Typography.sizes.base, fontWeight: Typography.semibold, color: Colors.textPrimary, marginBottom: 4 },
    cardBack: { fontSize: Typography.sizes.sm, color: Colors.textSecondary },
    cardActions: { justifyContent: 'center', paddingHorizontal: 8, gap: 8 },
    cardAction: { padding: 8 },
    footer: { paddingHorizontal: 16, paddingTop: 16, backgroundColor: Colors.card, borderTopWidth: 1, borderTopColor: Colors.border },
    studyBtn: { borderRadius: BorderRadius.lg, overflow: 'hidden' },
    studyBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8 },
    studyBtnText: { fontSize: Typography.sizes.lg, fontWeight: Typography.bold, color: '#fff' },
    modalOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
    modalSheet: { backgroundColor: Colors.card, borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl, padding: 24 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalTitle: { fontSize: Typography.sizes.lg, fontWeight: Typography.bold, color: Colors.textPrimary },
    inputLabel: { fontSize: Typography.sizes.sm, fontWeight: Typography.semibold, color: Colors.textSecondary, marginBottom: 8 },
    modalInput: { backgroundColor: Colors.background, borderRadius: BorderRadius.lg, padding: 14, fontSize: Typography.sizes.base, color: Colors.textPrimary, minHeight: 80, marginBottom: 16, borderWidth: 1, borderColor: Colors.border },
    saveCardBtn: { borderRadius: BorderRadius.lg, overflow: 'hidden', marginTop: 8 },
    saveCardBtnGradient: { paddingVertical: 16, alignItems: 'center' },
    saveCardBtnText: { fontSize: Typography.sizes.base, fontWeight: Typography.bold, color: '#fff' },
    errorText: { fontSize: Typography.sizes.lg, color: Colors.textSecondary, textAlign: 'center', marginTop: 100 },
    linkText: { fontSize: Typography.sizes.base, color: Colors.primary, textAlign: 'center', marginTop: 16 },
});
