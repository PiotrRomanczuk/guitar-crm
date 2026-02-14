# Dynamic Font Switching Guide

This guide explains how to use the dynamic font switching feature in your Guitar CRM app.

## Quick Start

### 1. Enable Dynamic Switching

Edit `lib/fonts/fonts.config.ts`:

```typescript
export const DYNAMIC_FONT_SWITCHING = true; // Set to true
```

### 2. Start the Dev Server

```bash
npm run dev
```

### 3. Visit the Font Test Page

Navigate to: **http://localhost:3000/fonts-test**

Click any font to preview it instantly! Your choice is saved to localStorage.

## Features

### Real-Time Switching
- ✅ **No server restart required** - Switch fonts instantly
- ✅ **20 font schemes** - Test and compare different combinations
- ✅ **Live preview** - See changes immediately across the entire app
- ✅ **Persistent** - Your choice is saved to localStorage

### Available Fonts (20 schemes)

1. **Geist** - Modern, clean, highly readable
2. **Inter** - Professional and versatile
3. **Plus Jakarta Sans** - Friendly modern geometric
4. **Space Grotesk** - Bold and distinctive
5. **Poppins** - Geometric with excellent readability
6. **DM Sans** - Low-contrast, easy on the eyes
7. **Work Sans** - Optimized for screen reading
8. **Manrope** - Modern geometric with open forms
9. **Rubik** - Rounded sans with personality
10. **Nunito** - Well-balanced rounded sans
11. **Outfit** - Clean geometric with good metrics
12. **Sora** - Geometric with unique character
13. **Urbanist** - Elegant geometric sans
14. **Lexend** - Designed for reading accessibility
15. **Archivo** - Grotesque with excellent legibility
16. **Cabin** - Humanist sans inspired by signage
17. **Epilogue** - Versatile geometric sans
18. **Figtree** - Contemporary geometric
19. **Albert Sans** - Modern geometric with warmth
20. **Anybody** - Variable width display font

## How It Works

### Architecture

```
┌─────────────────────────────────────────────┐
│  lib/fonts/fonts.config.ts                  │
│  - DYNAMIC_FONT_SWITCHING = true            │
│  - 20 font schemes defined                  │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│  lib/fonts/index.ts                         │
│  - Loads all 20+ fonts via next/font        │
│  - getAllFontClasses() returns all vars     │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│  app/layout.tsx                             │
│  - Loads ALL fonts in <body>               │
│  - Wraps app in <FontProvider>             │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│  lib/fonts/FontProvider.tsx                 │
│  - React Context for font state             │
│  - Manages current scheme                   │
│  - Persists to localStorage                 │
│  - Updates body classes dynamically         │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│  components/settings/FontSwitcher.tsx       │
│  - UI for testing fonts                     │
│  - useFonts() hook to change scheme         │
│  - Live preview section                     │
└─────────────────────────────────────────────┘
```

### State Management

1. **FontProvider** wraps the app and manages font state
2. **useFonts()** hook provides access to:
   - `currentScheme` - Active font scheme key
   - `setScheme(key)` - Change font scheme
   - `availableSchemes` - All defined schemes
   - `isDynamicSwitchingEnabled` - Feature flag status

3. **localStorage** persists the user's choice:
   - Key: `strummy-font-scheme`
   - Value: scheme key (e.g., `"inter"`)

## Using the Font Switcher

### In a Settings Page

```tsx
import { FontSwitcher } from '@/components/settings/FontSwitcher';

export default function SettingsPage() {
  return (
    <div className="container">
      <h1>Settings</h1>
      <FontSwitcher />
    </div>
  );
}
```

### Custom Font Selector

```tsx
'use client';

import { useFonts } from '@/lib/fonts/FontProvider';

export function CustomFontSelector() {
  const { currentScheme, setScheme, availableSchemes } = useFonts();

  return (
    <select
      value={currentScheme}
      onChange={(e) => setScheme(e.target.value)}
    >
      {Object.entries(availableSchemes).map(([key, scheme]) => (
        <option key={key} value={key}>
          {scheme.name}
        </option>
      ))}
    </select>
  );
}
```

### Programmatic Font Change

```tsx
'use client';

import { useFonts } from '@/lib/fonts/FontProvider';

export function MyComponent() {
  const { setScheme } = useFonts();

  const handleClick = () => {
    setScheme('inter'); // Switch to Inter font
  };

  return <button onClick={handleClick}>Use Inter Font</button>;
}
```

## Disabling Dynamic Switching

When you've chosen your final font, disable dynamic switching for better performance:

### 1. Set Your Chosen Font

Edit `lib/fonts/fonts.config.ts`:

```typescript
export const ACTIVE_FONT_SCHEME = 'inter'; // Your chosen font
```

### 2. Disable Dynamic Switching

```typescript
export const DYNAMIC_FONT_SWITCHING = false; // Disable
```

### 3. Restart Dev Server

```bash
npm run dev
```

**Result:**
- ✅ Only loads 2 fonts (sans + mono) instead of 20+
- ✅ Smaller bundle size (~200KB smaller)
- ✅ Faster initial load
- ✅ No React Context overhead
- ✅ Font is locked to ACTIVE_FONT_SCHEME

## Performance Considerations

### Dynamic Switching ON
- **Bundle Size**: ~350KB (all fonts loaded)
- **Pros**: Instant switching, great for testing
- **Cons**: Larger initial bundle

### Dynamic Switching OFF
- **Bundle Size**: ~150KB (only active fonts)
- **Pros**: Optimal performance, smaller bundle
- **Cons**: Requires server restart to change

### Recommendation

1. **Development**: Keep dynamic switching **ON** to test fonts
2. **Production**: Turn dynamic switching **OFF** after choosing final font

## Testing Workflow

Here's the recommended workflow for finding your perfect font:

### Step 1: Enable Dynamic Switching
```typescript
export const DYNAMIC_FONT_SWITCHING = true;
```

### Step 2: Start Dev Server
```bash
npm run dev
```

### Step 3: Test Fonts
1. Visit http://localhost:3000/fonts-test
2. Click through all 20 font schemes
3. Test on different pages of your app
4. Pay attention to:
   - Readability at different sizes
   - Visual hierarchy (headings vs body)
   - Code blocks (monospace font)
   - Overall aesthetic fit

### Step 4: Narrow Down
- Bookmark 3-5 favorites
- Test them in various contexts
- Ask team members for feedback

### Step 5: Make Final Choice
- Pick the winner!
- Note the scheme key (e.g., `'inter'`)

### Step 6: Lock It In
```typescript
export const ACTIVE_FONT_SCHEME = 'inter'; // Your choice
export const DYNAMIC_FONT_SWITCHING = false; // Disable
```

### Step 7: Deploy
```bash
npm run build
```

Your app now uses the optimal font with maximum performance!

## Troubleshooting

### Font Not Changing

**Issue**: Clicking fonts doesn't change anything

**Solutions**:
1. Check that `DYNAMIC_FONT_SWITCHING = true`
2. Verify `FontProvider` is wrapping your app
3. Open DevTools → Application → Local Storage → Check `strummy-font-scheme`
4. Clear localStorage and refresh

### Fonts Not Loading

**Issue**: Fonts appear broken or fallback to system font

**Solutions**:
1. Check console for Next.js font loading errors
2. Verify internet connection (fonts loaded at build time)
3. Run `npm run build` to rebuild with fonts
4. Check that font family names match exactly in config

### Performance Issues

**Issue**: App feels slow with dynamic switching enabled

**Solutions**:
1. This is expected - all 20+ fonts are loaded
2. Disable dynamic switching after choosing your font
3. Consider reducing number of font schemes if needed
4. Use Lighthouse to measure actual impact

## Adding More Fonts

Want to add a new font scheme? Follow these steps:

### 1. Add to Config

Edit `lib/fonts/fonts.config.ts`:

```typescript
export const FONT_SCHEMES: Record<string, FontScheme> = {
  // ... existing schemes
  myCustom: {
    name: 'My Custom Font',
    description: 'Description here',
    fonts: {
      sans: {
        family: 'Montserrat',
        weights: [400, 500, 600, 700],
        subsets: ['latin'],
        variable: '--font-montserrat',
      },
      mono: {
        family: 'Roboto Mono',
        subsets: ['latin'],
        variable: '--font-roboto-mono',
      },
    },
  },
};
```

### 2. Load the Font

Edit `lib/fonts/index.ts`:

```typescript
import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({
  variable: '--font-montserrat',
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
});

// Add to fontMap
const fontMap = {
  // ... existing fonts
  Montserrat: montserrat,
};
```

### 3. Test It

Visit `/fonts-test` and your new font should appear in the list!

## Production Deployment

### Recommended Setup for Production

```typescript
// lib/fonts/fonts.config.ts
export const DYNAMIC_FONT_SWITCHING = false; // Disable in production
export const ACTIVE_FONT_SCHEME = 'inter'; // Your final choice
```

This ensures optimal performance for end users while keeping the infrastructure for future font changes.

### Re-enabling for Testing

If you need to test fonts again:

1. Set `DYNAMIC_FONT_SWITCHING = true`
2. Restart dev server
3. Test at `/fonts-test`
4. Disable and redeploy when done

## FAQ

**Q: Can users switch fonts themselves?**
A: Yes! When dynamic switching is enabled, any user can change fonts via the FontSwitcher component. Their choice persists in localStorage.

**Q: Will it affect performance?**
A: Yes, enabling dynamic switching loads all fonts (~200KB extra). Disable it in production after choosing your font.

**Q: Can I use this with custom fonts?**
A: Yes, but you'll need to modify the font loading mechanism. next/font/google only supports Google Fonts. For custom fonts, use next/font/local.

**Q: What happens if I change ACTIVE_FONT_SCHEME?**
A: If dynamic switching is OFF, you'll need to restart the server. If ON, it only affects the default fallback.

**Q: Can I delete fonts I don't want?**
A: Yes! Remove them from FONT_SCHEMES and delete the corresponding imports from index.ts to reduce bundle size.
