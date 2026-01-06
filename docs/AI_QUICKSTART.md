# AI Provider Abstraction - Quick Start Guide

This guide will help you quickly set up and use the new AI abstraction layer that supports both OpenRouter (cloud) and Ollama (local).

## What Changed?

✅ **New Features:**
- Support for local LLM (Ollama) alongside OpenRouter
- Automatic provider selection and fallback
- Clean abstraction layer for easy provider switching
- Dynamic model loading in UI

✅ **Backward Compatible:**
- All existing code still works
- No breaking changes to API
- `OPENROUTER_API_KEY` still supported

## Quick Setup Options

### Option 1: Keep Using OpenRouter (No Changes Needed)

Your existing setup still works! Just keep using:

```bash
# .env.local
OPENROUTER_API_KEY=your-key
```

The system will automatically use OpenRouter.

### Option 2: Use Local Ollama (Free, Private, Offline)

**Step 1: Install Ollama**

```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows: Download from https://ollama.com/download
```

**Step 2: Start Ollama & Pull a Model**

```bash
# Start Ollama service
ollama serve

# In another terminal, pull a model
ollama pull llama3.2

# Verify it's working
ollama list
```

**Step 3: Configure Environment**

```bash
# .env.local
AI_PROVIDER=ollama
# Or use 'auto' to fallback to OpenRouter if Ollama unavailable
```

**Step 4: Done!**

Your AI assistant now uses local Ollama! No API costs, completely offline.

### Option 3: Hybrid (Auto Mode - Recommended)

Use Ollama when available, fallback to OpenRouter:

```bash
# .env.local
AI_PROVIDER=auto
AI_PREFER_LOCAL=true
OPENROUTER_API_KEY=your-key  # As fallback
```

This gives you:
- **Local inference** when Ollama is running (free, fast)
- **Cloud fallback** when Ollama is unavailable (reliable)

## Recommended Models

### For Ollama (Local)

```bash
# Fast & efficient (recommended for development)
ollama pull llama3.2        # 3B - Super fast
ollama pull mistral         # 7B - Balanced

# More capable
ollama pull deepseek-r1     # Great for reasoning/coding
ollama pull qwen2.5         # Multilingual support
```

### For OpenRouter (Cloud)

The system automatically loads available free models:
- `meta-llama/llama-3.3-70b-instruct:free` - Most capable
- `google/gemini-2.0-flash-exp:free` - Fast
- `deepseek/deepseek-r1:free` - Reasoning focused

## Testing Your Setup

### Test Ollama

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# You should see JSON with your models
```

### Test in Application

1. Start your dev server: `npm run dev`
2. Go to admin dashboard
3. Open AI Assistant card
4. Look for provider badge (shows "Ollama" or "OpenRouter")
5. Model dropdown shows available models
6. Ask a question!

## Environment Variables Reference

```bash
# Minimal setup (OpenRouter only)
OPENROUTER_API_KEY=sk-...

# Minimal setup (Ollama only)
AI_PROVIDER=ollama
# Ollama must be running at http://localhost:11434

# Full setup (Hybrid)
AI_PROVIDER=auto
AI_PREFER_LOCAL=true
OPENROUTER_API_KEY=sk-...
OLLAMA_BASE_URL=http://localhost:11434
```

## Troubleshooting

### "Ollama is not available"

```bash
# Make sure Ollama is running
ollama serve

# In another terminal
ollama list  # Check models
```

### "No models found"

```bash
# Pull at least one model
ollama pull llama3.2
```

### UI not showing local models

1. Restart your dev server
2. Check browser console for errors
3. Verify Ollama is running: `curl http://localhost:11434/api/tags`

## Code Examples

### Using in Server Actions

```typescript
import { generateAIResponse } from '@/app/actions/ai';

// Auto-selects provider based on config
const result = await generateAIResponse(
  'How do I improve student retention?',
  'llama3.2'  // Works with both Ollama and OpenRouter
);

if (result.error) {
  console.error(result.error);
} else {
  console.log(result.content);
}
```

### Getting Available Models

```typescript
import { getAvailableModels } from '@/app/actions/ai';

const { models, providerName } = await getAvailableModels();
console.log(`Using: ${providerName}`);
console.log('Available models:', models);
```

### Direct Provider Access

```typescript
import { getAIProvider } from '@/lib/ai';

const provider = await getAIProvider();
console.log(`Provider: ${provider.name}`);

const models = await provider.listModels();
const result = await provider.complete({
  model: 'llama3.2',
  messages: [
    { role: 'user', content: 'Hello!' }
  ],
});
```

## Performance Tips

### Local (Ollama)
- Use smaller models for faster responses (llama3.2, mistral)
- Ensure adequate RAM (8GB+ recommended)
- First request may be slow (model loading)

### Cloud (OpenRouter)
- Use free tier models to avoid costs
- Watch rate limits
- Monitor API usage

## What's Next?

- Read full documentation: `docs/AI_PROVIDER_ABSTRACTION.md`
- Explore provider implementations: `lib/ai/providers/`
- Check architecture: `lib/ai/types.ts`

## Support

- Check logs in browser console
- Check server logs for provider selection
- See `docs/AI_PROVIDER_ABSTRACTION.md` for detailed troubleshooting

---

**That's it!** The AI system now supports both cloud and local LLMs with automatic fallback. Enjoy! 🎸🎵
