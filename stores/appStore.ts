import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Note {
    id: string;
    title: string;
    content: string;
    summary?: string;
    keyConceptsIds?: string[];
    createdAt: Date;
    updatedAt: Date;
    tags?: string[];
    folderId?: string;
}

export interface Flashcard {
    id: string;
    front: string;
    back: string;
    noteId?: string;
    lastReviewed?: Date;
    nextReview?: Date;
    easeFactor: number;
    interval: number;
}

export interface FlashcardDeck {
    id: string;
    title: string;
    cards: Flashcard[];
    createdAt: Date;
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
    noteId?: string;
    createdAt: Date;
}

export interface QuizAttempt {
    id: string;
    quizId: string;
    score: number;
    totalQuestions: number;
    completedAt: Date;
}

interface AppState {
    // Notes
    notes: Note[];
    addNote: (note: Note) => void;
    updateNote: (id: string, updates: Partial<Note>) => void;
    deleteNote: (id: string) => void;

    // Flashcards
    decks: FlashcardDeck[];
    addDeck: (deck: FlashcardDeck) => void;
    addCardToDeck: (deckId: string, card: Flashcard) => void;
    deleteDeck: (id: string) => void;

    // Quizzes
    quizzes: Quiz[];
    quizAttempts: QuizAttempt[];
    addQuiz: (quiz: Quiz) => void;
    addQuizAttempt: (attempt: QuizAttempt) => void;

    // User
    userName: string;
    studyStreak: number;
    setUserName: (name: string) => void;
    incrementStreak: () => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            // Notes
            notes: [],
            addNote: (note) => set((state) => ({ notes: [...state.notes, note] })),
            updateNote: (id, updates) =>
                set((state) => ({
                    notes: state.notes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
                })),
            deleteNote: (id) =>
                set((state) => ({ notes: state.notes.filter((n) => n.id !== id) })),

            // Flashcards
            decks: [],
            addDeck: (deck) => set((state) => ({ decks: [...state.decks, deck] })),
            addCardToDeck: (deckId, card) =>
                set((state) => ({
                    decks: state.decks.map((d) =>
                        d.id === deckId ? { ...d, cards: [...d.cards, card] } : d
                    ),
                })),
            deleteDeck: (id) =>
                set((state) => ({ decks: state.decks.filter((d) => d.id !== id) })),

            // Quizzes
            quizzes: [],
            quizAttempts: [],
            addQuiz: (quiz) => set((state) => ({ quizzes: [...state.quizzes, quiz] })),
            addQuizAttempt: (attempt) =>
                set((state) => ({ quizAttempts: [...state.quizAttempts, attempt] })),

            // User
            userName: 'Student',
            studyStreak: 0,
            setUserName: (name) => set({ userName: name }),
            incrementStreak: () => set((state) => ({ studyStreak: state.studyStreak + 1 })),
        }),
        {
            name: 'notesnap-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
