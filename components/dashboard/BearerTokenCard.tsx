'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Copy, Check } from 'lucide-react';
import { CLIPBOARD_FEEDBACK_DURATION } from '@/lib/constants';

interface BearerTokenCardProps {
  token: string;
}

export function BearerTokenCard({ token }: BearerTokenCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(token);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), CLIPBOARD_FEEDBACK_DURATION);
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Access Token</CardTitle>
        <CardDescription>
          Your current session Bearer token. Use this to authenticate API requests.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Input
              type={isVisible ? 'text' : 'password'}
              value={token}
              readOnly
              className="pr-10 font-mono text-sm"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setIsVisible(!isVisible)}
            >
              {isVisible ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="sr-only">{isVisible ? 'Hide token' : 'Show token'}</span>
            </Button>
          </div>
          <Button variant="outline" size="icon" onClick={handleCopy}>
            {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span className="sr-only">Copy token</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
