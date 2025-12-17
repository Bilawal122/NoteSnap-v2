// OpenRouter AI Integration - FREE MODELS ONLY
// No costs at all!

const OPENROUTER_API_KEY = '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';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// ============================================
// FREE MODELS ONLY
// ============================================

// Vision models (can see images) - FREE
const VISION_MODELS = [
    'nvidia/nemotron-nano-12b-v2-vl:free',  // NVIDIA - FREE with vision!
];

// Text models (no vision) - FREE
const TEXT_MODELS = [
    'tng/deepseek-r1t2-chimera:free',       // TNG Chimera - FREE
    'deepseek/deepseek-r1:free',            // DeepSeek R1 - FREE
    'kwaipilot/kat-coder-pro-v1:free',      // KAT Coder - FREE
];

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string | MessageContent[];
}

export interface MessageContent {
    type: 'text' | 'image_url';
    text?: string;
    image_url?: { url: string };
}

export interface AIResponse {
    success: boolean;
    message: string;
    error?: string;
}

async function callModel(
    model: string,
    messages: ChatMessage[]
): Promise<{ success: boolean; content?: string; error?: string }> {
    try {
        console.log(`[AI] Calling ${model}...`);

        const res = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': 'https://notesnap.app',
                'X-Title': 'NoteSnap',
            },
            body: JSON.stringify({
                model,
                messages,
                temperature: 0.7,
                max_tokens: 4000,
            }),
        });

        const text = await res.text();
        console.log(`[AI] ${model} status: ${res.status}`);

        if (!res.ok) {
            console.log(`[AI] ${model} error:`, text.slice(0, 300));
            return { success: false, error: `${res.status}: ${text.slice(0, 100)}` };
        }

        try {
            const data = JSON.parse(text);
            const content = data.choices?.[0]?.message?.content;

            if (content && content.length > 5) {
                console.log(`[AI] ${model} SUCCESS! Got ${content.length} chars`);
                return { success: true, content };
            }
            return { success: false, error: 'Empty response from model' };
        } catch (e) {
            console.log(`[AI] Parse error:`, e);
            return { success: false, error: 'Failed to parse response' };
        }
    } catch (error) {
        console.log(`[AI] ${model} network error:`, error);
        return { success: false, error: `Network error: ${error}` };
    }
}

// Main text AI - uses free text models
export async function callAI(
    messages: ChatMessage[],
    systemPrompt?: string
): Promise<AIResponse> {
    const allMessages: ChatMessage[] = systemPrompt
        ? [{ role: 'system', content: systemPrompt }, ...messages]
        : messages;

    // Try each free text model
    for (const model of TEXT_MODELS) {
        const result = await callModel(model, allMessages);
        if (result.success && result.content) {
            return { success: true, message: cleanText(result.content) };
        }
        // Small delay between models
        await new Promise(r => setTimeout(r, 500));
    }

    return { success: false, message: '', error: 'All free models failed. Try again in a moment.' };
}

// Vision AI - uses NVIDIA Nemotron (free with vision!)
export async function analyzeImage(
    base64Image: string,
    prompt: string
): Promise<AIResponse> {
    // Ensure proper data URL format
    let imageUrl = base64Image;
    if (!base64Image.startsWith('data:')) {
        const isPng = base64Image.startsWith('iVBOR');
        const mimeType = isPng ? 'image/png' : 'image/jpeg';
        imageUrl = `data:${mimeType};base64,${base64Image}`;
    }

    console.log('[Vision] Starting with NVIDIA Nemotron...');
    console.log('[Vision] Image length:', imageUrl.length);

    const messages: ChatMessage[] = [
        {
            role: 'user',
            content: [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: imageUrl } },
            ],
        },
    ];

    // Try the free vision model
    for (const model of VISION_MODELS) {
        console.log(`[Vision] Trying ${model}...`);
        const result = await callModel(model, messages);

        if (result.success && result.content && result.content.length > 10) {
            console.log(`[Vision] SUCCESS with ${model}!`);
            return { success: true, message: result.content };
        }
        await new Promise(r => setTimeout(r, 500));
    }

    // Fallback: try text models with description request
    return { success: false, message: '', error: 'Vision failed. The free vision model may be rate limited. Try again in a minute.' };
}

// Analyze image with specific action
export async function analyzeImageWithAction(
    base64Image: string,
    action: 'extract' | 'summarize' | 'flashcards' | 'quiz' | 'ask' | 'ocr' | 'document',
    customPrompt?: string
): Promise<AIResponse> {
    const prompts: Record<string, string> = {
        extract: `Look at this image carefully. Extract ALL the text you can see in the image.
Write out the text exactly as it appears, keeping the structure.
Just output the text, nothing else.`,

        ocr: `This is a handwritten note or document. Your task is to transcribe ALL the handwritten text.
IMPORTANT INSTRUCTIONS:
- Read very carefully and transcribe EXACTLY what is written
- Preserve paragraph breaks and line structure
- If a word is unclear, write your best guess with [?] after it
- Do NOT add any commentary, just output the transcribed text
- Be thorough - don't skip any text you can see

Transcribe all the handwritten text now:`,

        document: `This is a document (could be a PowerPoint slide, PDF page, or scanned document).
Extract ALL the text content from this document.
Preserve the structure including:
- Headings and titles
- Bullet points and lists
- Any important information

Just output the extracted text, organized clearly:`,

        summarize: `Look at this image. Create a brief summary of what you see.
Include the main topic and key points.
Write in plain text, no markdown.`,

        flashcards: `Look at this image and create study flashcards from the content.
You MUST respond with ONLY a JSON array in this exact format:
[{"front": "Question here", "back": "Answer here"}]
Create 5-8 flashcards.
ONLY output the JSON array, no other text.`,

        quiz: `Look at this image and create a multiple choice quiz.
You MUST respond with ONLY a JSON array in this exact format:
[{"question": "Question?", "options": ["A", "B", "C", "D"], "correctAnswer": 0, "explanation": "Why"}]
Create 5 questions.
ONLY output the JSON array, no other text.`,

        ask: customPrompt || 'Describe what you see in this image.',
    };

    const result = await analyzeImage(base64Image, prompts[action]);

    if (result.success) {
        // Don't clean flashcards/quiz responses (need JSON)
        if (action === 'flashcards' || action === 'quiz') {
            return result;
        }
        return { success: true, message: cleanText(result.message) };
    }

    return result;
}

// Clean text - remove markdown
function cleanText(text: string): string {
    return text
        .replace(/^#{1,6}\s*/gm, '')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/__([^_]+)__/g, '$1')
        .replace(/_([^_]+)_/g, '$1')
        .replace(/^[\*\-]\s+/gm, '• ')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/<think>[\s\S]*?<\/think>/g, '') // Remove thinking tags
        .trim();
}

// Simple prompts
export const AI_PROMPTS = {
    summarize: `Summarize this content briefly. No markdown. Plain text only.`,

    flashcards: `Create flashcards. Output ONLY valid JSON:
[{"front": "Q", "back": "A"}]
Make 5-10 cards. ONLY output JSON.`,

    quiz: `Create a quiz. Output ONLY valid JSON:
[{"question": "Q?", "options": ["A","B","C","D"], "correctAnswer": 0, "explanation": "Why"}]
Make 5 questions. ONLY output JSON.`,

    assistant: `You are a helpful study assistant. Be concise. No markdown formatting.`,
};

// Helper functions
export async function summarizeContent(content: string): Promise<AIResponse> {
    return callAI([{ role: 'user', content }], AI_PROMPTS.summarize);
}

export async function generateFlashcards(content: string): Promise<AIResponse> {
    return callAI([{ role: 'user', content: `Create flashcards from:\n${content}` }], AI_PROMPTS.flashcards);
}

export async function generateQuiz(content: string): Promise<AIResponse> {
    return callAI([{ role: 'user', content: `Create quiz from:\n${content}` }], AI_PROMPTS.quiz);
}

export async function askAboutNote(question: string, noteContent: string, imageBase64?: string): Promise<AIResponse> {
    if (imageBase64) {
        return analyzeImage(imageBase64, `Question: ${question}\n\nLook at the image and answer the question.`);
    }
    return callAI([{ role: 'user', content: `Note: ${noteContent}\n\nQuestion: ${question}` }], AI_PROMPTS.assistant);
}

export async function askWithContext(question: string, context: string): Promise<AIResponse> {
    return callAI([{ role: 'user', content: `${context}\n\n${question}` }], AI_PROMPTS.assistant);
}

// Extract text from PDF (using vision since we can't parse PDF directly)
export async function extractPDFText(base64PDF: string, filename: string): Promise<AIResponse> {
    // Since we can't parse PDFs directly in React Native, we'll use the vision model
    // to "read" PDF pages that have been converted to images
    // For now, return a helpful message - actual PDF parsing would need a backend
    return {
        success: false,
        message: '',
        error: 'PDF extraction requires taking photos of pages. Use the camera to capture each page.',
    };
}

