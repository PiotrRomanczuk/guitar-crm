# AI Provider Abstraction Layer

This document explains how to use and configure the AI provider abstraction layer in Guitar CRM.

## Overview

The AI system now supports multiple providers through a clean abstraction layer:

- **OpenRouter** - Cloud-based LLM API (original implementation)
- **Ollama** - Local LLM inference (new)
- **Auto Mode** - Automatically selects the best available provider

## Architecture

```
lib/ai/
├── index.ts                    # Main exports
├── types.ts                    # TypeScript interfaces
├── provider-factory.ts         # Provider selection logic
└── providers/
    ├── index.ts                # Provider exports
    ├── openrouter.ts           # OpenRouter implementation
    └── ollama.ts               # Ollama implementation
```

### Key Components

1. **AIProvider Interface** (`lib/ai/types.ts`)
   - Defines the contract all providers must implement
   - Methods: `listModels()`, `complete()`, `isAvailable()`, `getConfig()`

2. **Provider Implementations** (`lib/ai/providers/`)
   - `OpenRouterProvider` - Uses OpenRouter.ai API
   - `OllamaProvider` - Connects to local Ollama instance

3. **Provider Factory** (`lib/ai/provider-factory.ts`)
   - Singleton that manages provider selection
   - Handles auto-detection and fallback logic
   - Caches provider instances

4. **Server Actions** (`app/actions/ai.ts`)
   - `generateAIResponse()` - Generate completions
   - `getAvailableModels()` - List available models

## Configuration

### Environment Variables

Add these to your `.env.local` file:

```bash
# AI Provider Configuration
# Options: 'openrouter' | 'ollama' | 'auto'
# Default: 'auto'
AI_PROVIDER=auto

# Prefer local models when available (used in auto mode)
# Default: true
AI_PREFER_LOCAL=true

# OpenRouter Configuration (if using OpenRouter)
OPENROUTER_API_KEY=your-api-key-here

# Ollama Configuration (if using custom endpoint)
# Default: http://localhost:11434
OLLAMA_BASE_URL=http://localhost:11434
```

### Provider Modes

#### 1. Auto Mode (Recommended)
```bash
AI_PROVIDER=auto
AI_PREFER_LOCAL=true
```

Behavior:
- Tries Ollama first (if `AI_PREFER_LOCAL=true`)
- Falls back to OpenRouter if Ollama unavailable
- Automatically adapts to available providers

#### 2. OpenRouter Only
```bash
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=your-key
```

Behavior:
- Always uses OpenRouter
- Requires valid API key
- Connects to cloud API

#### 3. Ollama Only
```bash
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
```

Behavior:
- Only uses local Ollama
- Requires Ollama to be running
- Completely offline

## Setting Up Ollama

### Installation

**macOS:**
```bash
brew install ollama
```

**Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Windows:**
Download from https://ollama.com/download

### Running Ollama

Start the Ollama service:
```bash
ollama serve
```

### Installing Models

Pull some recommended models:

```bash
# Lightweight, fast models
ollama pull llama3.2          # 3B - Great for quick responses
ollama pull mistral           # 7B - Balanced performance

# More capable models
ollama pull deepseek-r1       # Reasoning focused
ollama pull qwen2.5           # Multilingual support
```

List installed models:
```bash
ollama list
```

### Verifying Installation

Check if Ollama is running:
```bash
curl http://localhost:11434/api/tags
```

You should see a JSON response with your installed models.

## Usage Examples

### Basic Usage (Auto-selects provider)

```typescript
import { generateAIResponse } from '@/app/actions/ai';

const result = await generateAIResponse(
  'How can I improve student retention?',
  'llama3.2' // or 'meta-llama/llama-3.3-70b-instruct:free' for OpenRouter
);

if (result.error) {
  console.error(result.error);
} else {
  console.log(result.content);
}
```

### Advanced Usage (Direct provider access)

```typescript
import { getAIProvider, type AIMessage } from '@/lib/ai';

// Get the configured provider
const provider = await getAIProvider();

console.log(`Using: ${provider.name}`);

// Check availability
const available = await provider.isAvailable();
if (!available) {
  console.error('Provider not available');
  return;
}

// List models
const models = await provider.listModels();
console.log('Available models:', models);

// Generate completion
const result = await provider.complete({
  model: 'llama3.2',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Hello!' },
  ],
  temperature: 0.7,
});

if ('error' in result) {
  console.error(result.error);
} else {
  console.log(result.content);
}
```

### Using the Provider Factory

```typescript
import { AIProviderFactory } from '@/lib/ai/provider-factory';

const factory = AIProviderFactory.getInstance();

// Get available providers
const providers = await factory.getAvailableProviders();
console.log(providers);
// [
//   { name: 'Ollama (Local)', available: true },
//   { name: 'OpenRouter (Cloud)', available: true }
// ]

// Change configuration dynamically
factory.updateConfig({
  provider: 'ollama',
  preferLocal: true,
});

// Clear cache to force re-selection
factory.clearCache();
```

## UI Integration

The `AIAssistantCard` component automatically:

1. Fetches available models on mount
2. Displays provider name (OpenRouter or Ollama)
3. Shows "Local" badge for Ollama models
4. Allows model selection from available options

No UI changes needed - it works with both providers!

## Model Selection

### OpenRouter Models

Free models available through OpenRouter:
- `meta-llama/llama-3.3-70b-instruct:free` - Most capable
- `google/gemini-2.0-flash-exp:free` - Fast, experimental
- `deepseek/deepseek-r1:free` - Great for reasoning
- And more...

### Ollama Models

Use the model name as shown in `ollama list`:
- `llama3.2` - Fast, lightweight
- `mistral` - Balanced
- `deepseek-r1` - Reasoning
- `qwen2.5` - Multilingual

## Troubleshooting

### "Ollama is not available"

1. Check if Ollama is running:
   ```bash
   curl http://localhost:11434/api/tags
   ```

2. Start Ollama:
   ```bash
   ollama serve
   ```

3. Verify models are installed:
   ```bash
   ollama list
   ```

### "OpenRouter API key is not configured"

1. Get an API key from https://openrouter.ai/
2. Add to `.env.local`:
   ```bash
   OPENROUTER_API_KEY=your-key-here
   ```
3. Restart your dev server

### Provider not switching automatically

1. Check `AI_PROVIDER` in `.env.local`
2. Clear provider cache:
   ```typescript
   import { AIProviderFactory } from '@/lib/ai/provider-factory';
   AIProviderFactory.getInstance().clearCache();
   ```
3. Restart your application

### "Request timeout - the model took too long to respond"

For Ollama:
- Try a smaller model (e.g., `llama3.2` instead of larger models)
- Increase timeout in `OllamaProvider` constructor
- Check system resources (CPU/RAM usage)

## Best Practices

### Development

- Use **Ollama** for development (free, fast, offline)
- Set `AI_PROVIDER=auto` and `AI_PREFER_LOCAL=true`
- Install lightweight models like `llama3.2` or `mistral`

### Production

- Use **OpenRouter** for production (reliable, no infrastructure)
- Set `AI_PROVIDER=openrouter`
- Configure rate limiting and monitoring

### Hybrid Approach

- Set `AI_PROVIDER=auto`
- Use Ollama when available (cost savings)
- Fallback to OpenRouter (reliability)

## Performance Considerations

### Ollama
- **Pros**: Free, private, no API limits, offline
- **Cons**: Requires local resources, slower on limited hardware
- **Best for**: Development, privacy-sensitive data, high volume

### OpenRouter
- **Pros**: Fast, reliable, no local resources needed
- **Cons**: API costs, rate limits, requires internet
- **Best for**: Production, variable load, guaranteed uptime

## Migration Guide

### From Old Implementation

The new system is **100% backward compatible**:

1. Old code still works:
   ```typescript
   import { generateAIResponse } from '@/app/actions/ai';
   const result = await generateAIResponse(prompt);
   ```

2. Environment variables still work:
   ```bash
   OPENROUTER_API_KEY=your-key  # Still supported
   ```

3. UI components work unchanged

4. No breaking changes!

### To add local LLM support:

1. Install Ollama
2. Pull a model: `ollama pull llama3.2`
3. Set in `.env.local`:
   ```bash
   AI_PROVIDER=auto
   AI_PREFER_LOCAL=true
   ```
4. Done! System now uses Ollama automatically

## API Reference

See `lib/ai/types.ts` for full TypeScript interfaces:

- `AIProvider` - Provider interface
- `AIModelInfo` - Model metadata
- `AICompletionRequest` - Request format
- `AICompletionResponse` - Success response
- `AIError` - Error response
- `AIMessage` - Chat message format

## Future Enhancements

Potential additions:
- [ ] Streaming support
- [ ] LM Studio provider
- [ ] Azure OpenAI provider
- [ ] Model performance metrics
- [ ] Cost tracking
- [ ] Response caching
- [ ] Custom provider plugins

## Support

For issues or questions:
1. Check this documentation
2. Review logs in browser console / server logs
3. Test provider availability manually
4. Check environment variables
