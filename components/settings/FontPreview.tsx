/**
 * Font Preview Component
 *
 * Displays a preview of all available font schemes.
 * Can be used in a settings page to allow users to preview fonts.
 *
 * To enable dynamic font switching, wrap the app in a FontProvider context
 * and update this component to modify the context state.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FONT_SCHEMES, ACTIVE_FONT_SCHEME } from '@/lib/fonts/fonts.config';

export function FontPreview() {
  const schemes = Object.entries(FONT_SCHEMES);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Font Schemes</h2>
        <p className="text-sm text-muted-foreground">
          Currently active: <span className="font-semibold">{FONT_SCHEMES[ACTIVE_FONT_SCHEME].name}</span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          To change fonts, edit <code className="bg-muted px-1 py-0.5 rounded">ACTIVE_FONT_SCHEME</code> in{' '}
          <code className="bg-muted px-1 py-0.5 rounded">lib/fonts/fonts.config.ts</code>
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {schemes.map(([key, scheme]) => (
          <Card
            key={key}
            className={key === ACTIVE_FONT_SCHEME ? 'ring-2 ring-primary' : ''}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {scheme.name}
                {key === ACTIVE_FONT_SCHEME && (
                  <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                    Active
                  </span>
                )}
              </CardTitle>
              <CardDescription>{scheme.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Sans Font</p>
                <p className="text-sm font-medium">{scheme.fonts.sans.family}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Mono Font</p>
                <p className="text-sm font-mono">{scheme.fonts.mono.family}</p>
              </div>
              {scheme.fonts.display && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Display Font</p>
                  <p className="text-sm font-semibold">{scheme.fonts.display.family}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">Font Preview</CardTitle>
          <CardDescription>See how the current font looks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-3xl font-bold mb-2">The quick brown fox</h3>
            <p className="text-lg">jumps over the lazy dog</p>
          </div>
          <div>
            <p className="text-base">
              Regular text with proper line height and spacing for comfortable reading.
              The font system ensures consistency across the entire application.
            </p>
          </div>
          <div className="bg-card p-4 rounded-md">
            <code className="font-mono text-sm">
              const greeting = &quot;Hello, World!&quot;;
              <br />
              console.log(greeting);
            </code>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Numbers and symbols</p>
            <p className="text-lg">0123456789 !@#$%^&amp;*()_+-=[]{}|;:&apos;&quot;,./&lt;&gt;?</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
