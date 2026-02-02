'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

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
import { Loader2, Send, Minimize2, Maximize2, Sparkles, Trash2 } from 'lucide-react';
import type { AIModelInfo } from '@/lib/ai';

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

interface AIAssistantCardProps {
  firstName?: string;
}

export function AIAssistantCard({ firstName }: AIAssistantCardProps) {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>(() => {
    // Initialize with welcome message
    const welcomeMessage: Message = {
      role: 'system',
      content: `Hi${
        firstName ? ` ${firstName}` : ''
      }! 👋 I'm your Strummy AI assistant. I can help you with:\n\n• Practice tips and techniques\n• Song recommendations\n• Lesson planning advice\n• Student management strategies\n• Music theory questions\n\nTry asking me something or click one of the suggested prompts below!`,
      timestamp: new Date(),
    };
    return [welcomeMessage];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedModel, setSelectedModel] = useState(DEFAULT_AI_MODEL);
  const [isMinimized, setIsMinimized] = useState(false);
  const [availableModels, setAvailableModels] = useState<AIModelInfo[]>([]);
  const [providerName, setProviderName] = useState<string>('');

  // Fetch available models on component mount
  useEffect(() => {
    const fetchModels = async () => {
      const result = await getAvailableModels();
      if (result.models) {
        setAvailableModels(result.models);
        setProviderName(result.providerName || '');

        // If current selected model is not in the list, use the first available
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

    const userMessage: Message = {
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setPrompt('');
    setIsLoading(true);
    setError('');

    // Create placeholder message for streaming
    const assistantMessageId = Date.now();
    const assistantMessage: Message = {
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const streamGenerator = generateAIResponseStream(textToSend, selectedModel);

      for await (const chunk of streamGenerator) {
        setMessages((prev) =>
          prev.map((msg, index) =>
            index === prev.length - 1 && msg.role === 'assistant'
              ? { ...msg, content: String(chunk) }
              : msg
          )
        );
      }
    } catch (error) {
      setError('An unexpected error occurred.');
      // Remove the placeholder message on error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const clearConversation = () => {
    // Reset to just the welcome message
    const welcomeMessage: Message = {
      role: 'system',
      content: `Hi${
        firstName ? ` ${firstName}` : ''
      }! 👋 I'm your Strummy AI assistant. I can help you with:\n\n• Practice tips and techniques\n• Song recommendations\n• Lesson planning advice\n• Student management strategies\n• Music theory questions\n\nTry asking me something or click one of the suggested prompts below!`,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
    setError('');
    setPrompt('');
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
            {/* Conversation History */}
            {messages.length > 0 ? (
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-primary/10 ml-8'
                        : message.role === 'system'
                        ? 'bg-primary/5 border border-primary/20'
                        : 'bg-muted mr-8'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold">
                        {message.role === 'user'
                          ? 'You'
                          : message.role === 'system'
                          ? '🤖 Welcome'
                          : 'AI Assistant'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <Sparkles className="h-12 w-12 text-muted-foreground" />
                <p className="text-sm text-muted-foreground text-center">
                  Start a conversation or try a suggested prompt
                </p>
                <div className="grid grid-cols-1 gap-2 w-full max-w-md">
                  {SUGGESTED_PROMPTS.map((suggestedPrompt, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSubmit(suggestedPrompt)}
                      className="justify-start text-left h-auto py-2 px-3"
                    >
                      <Sparkles className="h-3 w-3 mr-2 shrink-0" />
                      <span className="text-xs">{suggestedPrompt}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
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
