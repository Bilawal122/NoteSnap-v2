import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface AINoteEntry {
    id: string;
    label: string;  // e.g., "AI Summary", "AI Answer", "Extracted Text"
    content: string;
    createdAt: string;
}

export interface Note {
    id: string;
    title: string;
    content: string;
    summary?: string;
    imageUri?: string;      // Local image URI
    imageBase64?: string;   // Base64 for AI analysis
    aiNotes?: AINoteEntry[]; // Saved AI responses
    createdAt: string;
    updatedAt: string;
    isFavorite: boolean;
    wordCount: number;
    tags: string[];
}

export interface Flashcard {
    id: string;
    front: string;
    back: string;
    noteId?: string;
    confidence: 'new' | 'learning' | 'reviewing' | 'mastered';
    correctCount: number;
    incorrectCount: number;
    lastReviewed?: string;
}

export interface FlashcardDeck {
    id: string;
    title: string;
    cards: Flashcard[];
    createdAt: string;
    lastStudied?: string;
    isFavorite: boolean;
    noteId?: string;
}

export interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
}

export interface Quiz {
    id: string;
    title: string;
    questions: QuizQuestion[];
    createdAt: string;
    isFavorite: boolean;
    noteId?: string;
}

export interface QuizAttempt {
    id: string;
    quizId: string;
    score: number;
    totalQuestions: number;
    completedAt: string;
}

export type SortOption = 'newest' | 'oldest' | 'alphabetical' | 'favorites';

interface AppState {
    // Notes
    notes: Note[];
    addNote: (note: Note) => void;
    updateNote: (id: string, updates: Partial<Note>) => void;
    deleteNote: (id: string) => void;
    toggleNoteFavorite: (id: string) => void;

    // Flashcards
    decks: FlashcardDeck[];
    addDeck: (deck: FlashcardDeck) => void;
    updateDeck: (id: string, updates: Partial<FlashcardDeck>) => void;
    deleteDeck: (id: string) => void;
    toggleDeckFavorite: (id: string) => void;
    updateCardProgress: (deckId: string, cardId: string, correct: boolean, confidence: Flashcard['confidence']) => void;

    // Quizzes
    quizzes: Quiz[];
    quizAttempts: QuizAttempt[];
    addQuiz: (quiz: Quiz) => void;
    deleteQuiz: (id: string) => void;
    toggleQuizFavorite: (id: string) => void;
    addQuizAttempt: (attempt: QuizAttempt) => void;

    // User
    userName: string;
    studyStreak: number;
    totalCardsStudied: number;
    setUserName: (name: string) => void;
    incrementStreak: () => void;
    incrementCardsStudied: (count: number) => void;

    // Theme
    isDarkMode: boolean;
    toggleDarkMode: () => void;

    // Card Management
    addCardToDeck: (deckId: string, card: Flashcard) => void;
    updateCard: (deckId: string, cardId: string, updates: Partial<Flashcard>) => void;
    deleteCard: (deckId: string, cardId: string) => void;

    // Sorting
    notesSortBy: SortOption;
    decksSortBy: SortOption;
    quizzesSortBy: SortOption;
    setNotesSortBy: (option: SortOption) => void;
    setDecksSortBy: (option: SortOption) => void;
    setQuizzesSortBy: (option: SortOption) => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            // Notes
            notes: [],
            addNote: (note) => set((state) => ({ notes: [note, ...state.notes] })),
            updateNote: (id, updates) =>
                set((state) => ({
                    notes: state.notes.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n)),
                })),
            deleteNote: (id) => set((state) => ({ notes: state.notes.filter((n) => n.id !== id) })),
            toggleNoteFavorite: (id) =>
                set((state) => ({
                    notes: state.notes.map((n) => (n.id === id ? { ...n, isFavorite: !n.isFavorite } : n)),
                })),

            // Flashcards
            decks: [],
            addDeck: (deck) => set((state) => ({ decks: [{ ...deck, isFavorite: deck.isFavorite ?? false }, ...state.decks] })),
            updateDeck: (id, updates) =>
                set((state) => ({
                    decks: state.decks.map((d) => (d.id === id ? { ...d, ...updates } : d)),
                })),
            deleteDeck: (id) => set((state) => ({ decks: state.decks.filter((d) => d.id !== id) })),
            toggleDeckFavorite: (id) =>
                set((state) => ({
                    decks: state.decks.map((d) => (d.id === id ? { ...d, isFavorite: !d.isFavorite } : d)),
                })),
            updateCardProgress: (deckId, cardId, correct, confidence) =>
                set((state) => ({
                    decks: state.decks.map((deck) => {
                        if (deck.id !== deckId) return deck;
                        return {
                            ...deck,
                            lastStudied: new Date().toISOString(),
                            cards: deck.cards.map((card) => {
                                if (card.id !== cardId) return card;
                                return {
                                    ...card,
                                    confidence,
                                    correctCount: correct ? card.correctCount + 1 : card.correctCount,
                                    incorrectCount: correct ? card.incorrectCount : card.incorrectCount + 1,
                                    lastReviewed: new Date().toISOString(),
                                };
                            }),
                        };
                    }),
                })),

            // Quizzes
            quizzes: [],
            quizAttempts: [],
            addQuiz: (quiz) => set((state) => ({ quizzes: [{ ...quiz, isFavorite: quiz.isFavorite ?? false }, ...state.quizzes] })),
            deleteQuiz: (id) => set((state) => ({ quizzes: state.quizzes.filter((q) => q.id !== id) })),
            toggleQuizFavorite: (id) =>
                set((state) => ({
                    quizzes: state.quizzes.map((q) => (q.id === id ? { ...q, isFavorite: !q.isFavorite } : q)),
                })),
            addQuizAttempt: (attempt) =>
                set((state) => ({ quizAttempts: [...state.quizAttempts, attempt] })),

            // User
            userName: 'Student',
            studyStreak: 0,
            totalCardsStudied: 0,
            setUserName: (name) => set({ userName: name }),
            incrementStreak: () => set((state) => ({ studyStreak: state.studyStreak + 1 })),
            incrementCardsStudied: (count) => set((state) => ({ totalCardsStudied: state.totalCardsStudied + count })),

            // Theme
            isDarkMode: false,
            toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

            // Card Management
            addCardToDeck: (deckId, card) => set((state) => ({
                decks: state.decks.map(d => d.id === deckId ? { ...d, cards: [...d.cards, card] } : d)
            })),
            updateCard: (deckId, cardId, updates) => set((state) => ({
                decks: state.decks.map(d => d.id === deckId ? {
                    ...d,
                    cards: d.cards.map(c => c.id === cardId ? { ...c, ...updates } : c)
                } : d)
            })),
            deleteCard: (deckId, cardId) => set((state) => ({
                decks: state.decks.map(d => d.id === deckId ? {
                    ...d,
                    cards: d.cards.filter(c => c.id !== cardId)
                } : d)
            })),

            // Sorting
            notesSortBy: 'newest',
            decksSortBy: 'newest',
            quizzesSortBy: 'newest',
            setNotesSortBy: (option) => set({ notesSortBy: option }),
            setDecksSortBy: (option) => set({ decksSortBy: option }),
            setQuizzesSortBy: (option) => set({ quizzesSortBy: option }),
        }),
        {
            name: 'notesnap-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);

// Helpers
export function getDeckProgress(deck: FlashcardDeck): number {
    if (deck.cards.length === 0) return 0;
    const mastered = deck.cards.filter(c => c.confidence === 'mastered' || c.confidence === 'reviewing').length;
    return Math.round((mastered / deck.cards.length) * 100);
}

export function sortItems<T extends { createdAt: string; isFavorite: boolean; title?: string; }>(
    items: T[],
    sortBy: SortOption
): T[] {
    const sorted = [...items];
    switch (sortBy) {
        case 'newest':
            return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        case 'oldest':
            return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        case 'alphabetical':
            return sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        case 'favorites':
            return sorted.sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0));
        default:
            return sorted;
    }
}
