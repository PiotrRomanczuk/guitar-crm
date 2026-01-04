'use client';

import { useState } from 'react';
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
import { generateAIResponse } from '@/app/actions/ai';
import { FREE_OPENROUTER_MODELS, DEFAULT_AI_MODEL } from '@/lib/ai-models';
import { Loader2, Send } from 'lucide-react';

export function AIAssistantCard() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedModel, setSelectedModel] = useState(DEFAULT_AI_MODEL);

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError('');
    setResponse('');

    try {
      const result = await generateAIResponse(prompt, selectedModel);
      if (result.error) {
        setError(result.error);
      } else {
        setResponse(result.content || 'No response received.');
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span>🤖</span> AI Assistant
          </CardTitle>
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-[180px] h-8 text-xs">
              <SelectValue placeholder="Select Model" />
            </SelectTrigger>
            <SelectContent>
              {FREE_OPENROUTER_MODELS.map((model) => (
                <SelectItem key={model.id} value={model.id} className="text-xs">
                  {model.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <CardDescription>
          Ask for help with managing students, scheduling, or general questions.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 min-h-50">
        {response && (
          <div className="bg-muted p-4 rounded-md whitespace-pre-wrap text-sm">{response}</div>
        )}
        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md text-sm">{error}</div>
        )}
        {!response && !error && !isLoading && (
          <div className="text-muted-foreground text-sm italic flex-1 flex items-center justify-center">
            Enter a prompt below to get started...
          </div>
        )}
        {isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        <Textarea
          placeholder="How do I improve student retention?"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-20 resize-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        <Button
          onClick={handleSubmit}
          disabled={isLoading || !prompt.trim()}
          className="h-auto self-stretch"
        >
          <Send className="h-4 w-4" />
          <span className="sr-only">Send</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
