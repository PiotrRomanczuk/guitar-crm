'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { generateAIResponseStream, getAvailableModels } from '@/app/actions/ai';
import { DEFAULT_AI_MODEL } from '@/lib/ai-models';
import { Send, Minimize2, Maximize2, Sparkles, Trash2 } from 'lucide-react';
import type { AIModelInfo } from '@/lib/ai';
import { useAIConversation } from '@/hooks/useAIConversation';
import { AIAssistantCardMessages } from './AIAssistantCard.Messages';
import { AIConversationHistory } from './AIConversationHistory';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

const SUGGESTED_PROMPTS = [
  'How can I improve student retention?',
  'What are best practices for scheduling lessons?',
  'How do I motivate struggling students?',
  'Tips for teaching guitar to beginners',
];

function createWelcomeMessage(firstName?: string): Message {
  return {
    role: 'system',
    content: `Hi${
      firstName ? ` ${firstName}` : ''
    }! I'm your Strummy AI assistant. I can help you with:\n\n- Practice tips and techniques\n- Song recommendations\n- Lesson planning advice\n- Student management strategies\n- Music theory questions\n\nTry asking me something or click one of the suggested prompts below!`,
    timestamp: new Date(),
  };
}

interface AIAssistantCardProps {
  firstName?: string;
}

export function AIAssistantCard({ firstName }: AIAssistantCardProps) {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>(() => [createWelcomeMessage(firstName)]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedModel, setSelectedModel] = useState(DEFAULT_AI_MODEL);
  const [isMinimized, setIsMinimized] = useState(false);
  const [availableModels, setAvailableModels] = useState<AIModelInfo[]>([]);
  const [providerName, setProviderName] = useState<string>('');

  const {
    conversationId,
    conversations,
    isLoadingList,
    isLoadingConversation,
    startNewConversation,
    loadConversation,
    refreshConversationList,
    clearCurrentConversation,
    removeConversation,
  } = useAIConversation();

  useEffect(() => {
    const fetchModels = async () => {
      const result = await getAvailableModels();
      if (result.models) {
        setAvailableModels(result.models);
        setProviderName(result.providerName || '');
        if (result.models.length > 0 && !result.models.find((m) => m.id === selectedModel)) {
          setSelectedModel(result.models[0].id);
        }
      }
    };
    fetchModels();
  }, [selectedModel]);

  const handleSubmit = async (customPrompt?: string) => {
    const textToSend = customPrompt || prompt;
    if (!textToSend.trim()) return;

    // Ensure we have a conversation
    let activeConvId = conversationId;
    if (!activeConvId) {
      activeConvId = await startNewConversation(selectedModel);
      if (!activeConvId) {
        setError('Failed to create conversation.');
        return;
      }
    }

    const userMessage: Message = { role: 'user', content: textToSend, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setPrompt('');
    setIsLoading(true);
    setError('');

    const assistantMessage: Message = { role: 'assistant', content: '', timestamp: new Date() };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const stream = generateAIResponseStream(textToSend, selectedModel, activeConvId);
      for await (const chunk of stream) {
        setMessages((prev) =>
          prev.map((msg, i) =>
            i === prev.length - 1 && msg.role === 'assistant'
              ? { ...msg, content: String(chunk) }
              : msg
          )
        );
      }
      refreshConversationList();
    } catch {
      setError('An unexpected error occurred.');
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const clearConversation = () => {
    clearCurrentConversation();
    setMessages([createWelcomeMessage(firstName)]);
    setError('');
    setPrompt('');
  };

  const handleLoadConversation = async (id: string) => {
    const loaded = await loadConversation(id);
    if (loaded.length > 0) {
      setMessages(loaded);
    }
    setError('');
    setPrompt('');
  };

  const handleNewConversation = () => {
    clearConversation();
  };

  return (
    <Card className={`w-full flex flex-col transition-all ${isMinimized ? 'h-auto' : 'h-full'}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>AI Assistant</CardTitle>
            {messages.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {messages.length}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-45 h-8 text-xs">
                <SelectValue placeholder="Select Model" />
              </SelectTrigger>
              <SelectContent>
                {availableModels.map((model) => (
                  <SelectItem key={model.id} value={model.id} className="text-xs">
                    <div className="flex items-center gap-2">
                      {model.name}
                      {model.isLocal && (
                        <Badge variant="secondary" className="text-xs">
                          Local
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {providerName && (
              <Badge variant="outline" className="text-xs">
                {providerName}
              </Badge>
            )}
            <AIConversationHistory
              conversations={conversations}
              currentConversationId={conversationId}
              onSelect={handleLoadConversation}
              onNew={handleNewConversation}
              onDelete={removeConversation}
              onRefresh={refreshConversationList}
              isLoading={isLoadingList || isLoadingConversation}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-8 w-8"
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            {messages.length > 0 && (
              <Button variant="ghost" size="icon" onClick={clearConversation} className="h-8 w-8">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        {!isMinimized && (
          <CardDescription>
            Ask for help with managing students, scheduling, or general questions.
          </CardDescription>
        )}
      </CardHeader>
      {!isMinimized && (
        <>
          <CardContent className="flex-1 flex flex-col gap-4 min-h-75 max-h-125">
            <AIAssistantCardMessages
              messages={messages}
              isLoading={isLoading}
              suggestedPrompts={SUGGESTED_PROMPTS}
              onSuggestedPromptClick={handleSubmit}
            />
            {error && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                {error}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex gap-2 border-t pt-4">
            <Textarea
              placeholder="Ask me anything..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-15 resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <Button
              onClick={() => handleSubmit()}
              disabled={isLoading || !prompt.trim()}
              className="h-auto self-stretch"
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </CardFooter>
        </>
      )}
    </Card>
  );
}
