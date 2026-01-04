# Guitar CRM - AI Agent Specification

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

The agent is built using a lightweight, privacy-focused architecture leveraging open-source models via OpenRouter.

### 3.1 Components
*   **Frontend:** `AIAssistantCard.tsx`
    *   Embedded in the Admin Dashboard.
    *   Supports model selection (Llama 3.3, DeepSeek R1, etc.).
    *   Real-time loading states and error handling.
*   **Backend:** `app/actions/ai.ts`
    *   Server Action for secure API key handling.
    *   Stateless request processing.
*   **Model Provider:** OpenRouter API
    *   Access to free tier models (Llama 3.3 70B, Mistral 7B, etc.).
    *   Configurable via `lib/ai-models.ts`.

### 3.2 Data Flow
1.  User inputs prompt in Dashboard UI.
2.  Request sent to Next.js Server Action.
3.  Server Action appends System Prompt ("You are a helpful assistant for the Guitar CRM...").
4.  Request forwarded to OpenRouter API.
5.  Response streamed/returned to UI.

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
