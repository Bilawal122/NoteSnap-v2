// OpenRouter AI Integration
// Replace OPENROUTER_API_KEY with your actual key when ready

const OPENROUTER_API_KEY = 'YOUR_OPENROUTER_API_KEY_HERE';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// Free tier model
const FREE_MODEL = 'google/gemini-2.0-flash-exp:free';
// Premium model (uncomment when ready)
// const PREMIUM_MODEL = 'anthropic/claude-3.5-sonnet';

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface AIResponse {
    success: boolean;
    message: string;
    error?: string;
}

export async function callAI(
    messages: ChatMessage[],
    systemPrompt?: string
): Promise<AIResponse> {
    // Check if API key is configured
    if (OPENROUTER_API_KEY === 'YOUR_OPENROUTER_API_KEY_HERE') {
        return {
            success: false,
            message: '',
            error: 'API key not configured. Please add your OpenRouter API key in utils/ai.ts',
        };
    }

    const allMessages: ChatMessage[] = systemPrompt
        ? [{ role: 'system', content: systemPrompt }, ...messages]
        : messages;

    try {
        const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': 'https://notesnap.ai',
                'X-Title': 'NoteSnap AI',
            },
            body: JSON.stringify({
                model: FREE_MODEL,
                messages: allMessages,
                temperature: 0.7,
                max_tokens: 2000,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            return { success: false, message: '', error: `API Error: ${error}` };
        }

        const data = await response.json();
        return {
            success: true,
            message: data.choices[0]?.message?.content || 'No response',
        };
    } catch (error) {
        return {
            success: false,
            message: '',
            error: `Network error: ${error instanceof Error ? error.message : 'Unknown'}`,
        };
    }
}

// Study-specific AI functions
export const AI_PROMPTS = {
    summarize: `You are a study assistant. Summarize the following content in a clear, concise way that makes it easy to study. Use bullet points and highlight key concepts.`,

    flashcards: `You are a study assistant. Create flashcards from the following content. Return as JSON array with format: [{"front": "question", "back": "answer"}]. Create 5-10 flashcards covering the key concepts.`,

    quiz: `You are a study assistant. Create a multiple choice quiz from the following content. Return as JSON array with format: [{"question": "text", "options": ["a", "b", "c", "d"], "correctAnswer": 0, "explanation": "why"}]. Create 5 questions.`,

    explain: `You are a patient tutor. Explain the following concept in simple terms that a student would understand. Use analogies and examples where helpful.`,

    assistant: `You are NoteSnap AI, a helpful study assistant. You have access to the user's notes and study materials. Help them study effectively, answer questions about their materials, and create flashcards or quizzes on request. Be encouraging and supportive.`,
};

export async function summarizeContent(content: string): Promise<AIResponse> {
    return callAI([{ role: 'user', content }], AI_PROMPTS.summarize);
}

export async function generateFlashcards(content: string): Promise<AIResponse> {
    return callAI([{ role: 'user', content }], AI_PROMPTS.flashcards);
}

export async function generateQuiz(content: string): Promise<AIResponse> {
    return callAI([{ role: 'user', content }], AI_PROMPTS.quiz);
}

export async function askQuestion(
    question: string,
    context: string
): Promise<AIResponse> {
    const prompt = `Context from user's notes:\n${context}\n\nQuestion: ${question}`;
    return callAI([{ role: 'user', content: prompt }], AI_PROMPTS.assistant);
}
