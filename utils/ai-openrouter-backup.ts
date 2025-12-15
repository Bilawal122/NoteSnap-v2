// ========================================
// OPENROUTER API BACKUP - SAVED FOR LATER
// ========================================
// 
// OpenRouter API Key: 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
// Base URL: https://openrouter.ai/api/v1
//
// FREE TEXT MODELS:
// - google/gemini-2.0-flash-exp:free
// - meta-llama/llama-3.2-3b-instruct:free
// - mistralai/mistral-7b-instruct:free
// - huggingfaceh4/zephyr-7b-beta:free
//
// FREE VISION MODELS (may have availability issues):
// - qwen/qwen2.5-vl-3b-instruct:free
// - qwen/qwen2.5-vl-32b-instruct:free
// - mistralai/mistral-small-3.1-24b-instruct:free
// - google/gemma-3-4b-it:free
// - google/gemma-3-12b-it:free
//
// USAGE NOTES:
// - Free tier has rate limits (1000 requests/day)
// - Vision models frequently unavailable
// - Works well for text generation when not rate limited
//
// To use OpenRouter again, copy this code to utils/ai.ts:

/*
const OPENROUTER_API_KEY = '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';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

const FREE_MODELS = [
  'google/gemini-2.0-flash-exp:free',
  'meta-llama/llama-3.2-3b-instruct:free',
  'mistralai/mistral-7b-instruct:free',
];

async function callOpenRouter(messages, model = FREE_MODELS[0]) {
  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://notesnap.ai',
      'X-Title': 'NoteSnap AI',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 4000,
    }),
  });
  return response.json();
}
*/

export { };
