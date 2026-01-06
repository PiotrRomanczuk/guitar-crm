# Guitar CRM - AI Agent Specification

> **⚠️ UPDATED:** This spec now reflects the new AI Provider Abstraction Layer.  
> See `AI_PROVIDER_ABSTRACTION.md` for full documentation.

## 1. Agent Identity

*   **Name:** Guitar CRM Admin Assistant
*   **Role:** Intelligent Virtual Assistant for Music School Administration
*   **Primary User:** School Administrators and Teachers
*   **System Persona:** Helpful, concise, and knowledgeable about music education management.

## 2. Purpose & Goals

The primary goal of the AI Agent is to reduce the administrative burden on music school owners and teachers by providing instant access to information, generating content, and assisting with decision-making.

**Key Objectives:**
1.  **Operational Efficiency:** Quickly answer questions about CRM usage and best practices.
2.  **Content Generation:** Assist in drafting emails, lesson notes, and marketing copy.
3.  **Data Insights (Future):** Provide natural language querying of school data (e.g., "Which students have missed payments?").

## 3. Architecture

**UPDATED:** The agent now uses a provider abstraction layer supporting multiple LLM backends.

### 3.1 Components
*   **Frontend:** `AIAssistantCard.tsx`
    *   Embedded in the Admin Dashboard.
    *   Dynamic model selection based on active provider.
    *   Shows provider badge (OpenRouter/Ollama).
    *   Real-time loading states and error handling.
    
*   **Backend:** `app/actions/ai.ts`
    *   Server Actions: `generateAIResponse()`, `getAvailableModels()`.
    *   Uses provider abstraction layer.
    *   Secure API key and configuration handling.
    
*   **Provider Layer:** `lib/ai/`
    *   **Provider Factory** (`provider-factory.ts`) - Auto-selects provider
    *   **OpenRouter Provider** (`providers/openrouter.ts`) - Cloud API
    *   **Ollama Provider** (`providers/ollama.ts`) - Local LLM
    *   **Types** (`types.ts`) - Shared interfaces
    
*   **Configuration:**
    *   Environment variables control provider selection
    *   Three modes: `auto`, `openrouter`, `ollama`
    *   See `.env.example` for details

### 3.2 Supported Providers

#### OpenRouter (Cloud)
*   Access to 7+ free tier models
*   Models: Llama 3.3 70B, DeepSeek R1, Gemini 2.0 Flash, etc.
*   Requires `OPENROUTER_API_KEY`
*   Best for: Production, reliability, no local setup

#### Ollama (Local)
*   Run models on your own hardware
*   Popular models: llama3.2, mistral, deepseek-r1, qwen2.5
*   Requires Ollama running locally
*   Best for: Development, privacy, no API costs, offline

### 3.3 Data Flow
1.  User inputs prompt in Dashboard UI.
2.  Request sent to Next.js Server Action (`generateAIResponse`).
3.  Provider Factory selects best available provider (auto mode).
4.  Server Action appends System Prompt via provider.
5.  Provider forwards to appropriate backend (OpenRouter API or Ollama).
6.  Response returned through provider abstraction to UI.

```
UI → Server Action → Provider Factory → [OpenRouter | Ollama] → Response
```

## 4. Capabilities

### 4.1 Current Capabilities (v1.0)
*   **General Q&A:** Answer questions about general music school management.
*   **Content Drafting:** Generate text for emails, announcements, or lesson plans based on user prompts.
*   **Model Selection:** Users can switch between different LLMs (e.g., use DeepSeek R1 for logic/math, Llama 3 for creative writing).

### 4.2 Planned Capabilities (Roadmap)
*   **Context Awareness (RAG):**
    *   Ability to read `docs/` to answer questions about the CRM features.
    *   Ability to query Supabase for aggregate stats (e.g., "How many active students?").
*   **Action Execution:**
    *   "Draft a new lesson for [Student Name]" -> Pre-fills the Lesson Form.
    *   "Schedule a recital" -> Suggests dates based on calendar availability.
*   **Student Assistant:**
    *   A separate, restricted agent for the Student Dashboard to help with practice routines.

## 5. Configuration

### 5.1 Supported Models
Defined in `lib/ai-models.ts`. Current defaults:
*   **Default:** `meta-llama/llama-3.3-70b-instruct:free`
*   **Reasoning:** `deepseek/deepseek-r1:free`
*   **Fast/Light:** `mistralai/mistral-7b-instruct:free`

### 5.2 System Prompt
> "You are a helpful assistant for the Guitar CRM admin dashboard. Keep your answers concise and relevant to managing a music school."

## 6. Security & Privacy
*   **API Keys:** Stored in server-side environment variables (`OPENROUTER_API_KEY`). Never exposed to client.
*   **Data Privacy:** Currently, no PII (Personally Identifiable Information) is sent to the LLM. Future RAG implementations must sanitize data before sending.
