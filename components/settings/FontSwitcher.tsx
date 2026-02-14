'use client';

/**
 * Font Switcher Component
 *
 * Interactive UI for testing and switching between font schemes.
 * Shows live preview and saves preference to localStorage.
 */

import { useFonts } from '@/lib/fonts/FontProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

export function FontSwitcher() {
  const { currentScheme, setScheme, availableSchemes, isDynamicSwitchingEnabled } = useFonts();

  if (!isDynamicSwitchingEnabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Font Switcher</CardTitle>
          <CardDescription>Dynamic font switching is currently disabled</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            To enable dynamic font switching, set <code className="bg-muted px-1 py-0.5 rounded">DYNAMIC_FONT_SWITCHING = true</code>{' '}
            in <code className="bg-muted px-1 py-0.5 rounded">lib/fonts/fonts.config.ts</code>
          </p>
        </CardContent>
      </Card>
    );
  }

  const schemeEntries = Object.entries(availableSchemes);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Font Switcher</h2>
        <p className="text-sm text-muted-foreground">
          Click any font to preview it instantly. Your choice is saved automatically.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {schemeEntries.map(([key, scheme]) => {
          const isActive = key === currentScheme;

          return (
            <button
              key={key}
              onClick={() => setScheme(key)}
              className={`
                relative text-left p-4 rounded-lg border-2 transition-all duration-200
                hover:border-primary/50 hover:shadow-md
                ${isActive
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-border bg-card'
                }
              `}
            >
              {isActive && (
                <div className="absolute top-3 right-3">
                  <Badge variant="default" className="gap-1">
                    <Check className="h-3 w-3" />
                    Active
                  </Badge>
                </div>
              )}

              <div className="space-y-2">
                <h3 className="font-semibold text-base">{scheme.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {scheme.description}
                </p>

                <div className="pt-2 space-y-1 border-t border-border/50">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    Sans: {scheme.fonts.sans.family}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    Mono: {scheme.fonts.mono.family}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">Live Preview</CardTitle>
          <CardDescription>See how {availableSchemes[currentScheme].name} looks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">The quick brown fox</h1>
            <h2 className="text-3xl font-semibold">jumps over the lazy dog</h2>
            <h3 className="text-2xl font-medium">0123456789</h3>
          </div>

          <div className="space-y-2">
            <p className="text-base leading-relaxed">
              This is regular body text using the selected font. Notice the spacing, line height, and overall readability.
              A good font should be comfortable to read at various sizes and weights, ensuring excellent user experience
              across your entire application.
            </p>
            <p className="text-sm text-muted-foreground">
              Smaller text with muted colors should remain legible and pleasant to read.
            </p>
          </div>

          <div className="bg-card p-4 rounded-md border border-border">
            <code className="font-mono text-sm block">
              <span className="text-muted-foreground">{'// Monospace font preview'}</span><br />
              const greeting = &quot;Hello, World!&quot;;<br />
              console.log(greeting);<br />
              <span className="text-muted-foreground">{'// Perfect for code snippets'}</span>
            </code>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold mb-1">Regular</p>
              <p>The quick brown fox</p>
            </div>
            <div>
              <p className="font-semibold mb-1">Medium</p>
              <p className="font-medium">The quick brown fox</p>
            </div>
            <div>
              <p className="font-semibold mb-1">Semibold</p>
              <p className="font-semibold">The quick brown fox</p>
            </div>
            <div>
              <p className="font-semibold mb-1">Bold</p>
              <p className="font-bold">The quick brown fox</p>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <Button onClick={() => setScheme('geist')} variant="outline" size="sm">
              Reset to Geist (Default)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
