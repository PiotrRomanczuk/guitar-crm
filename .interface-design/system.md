# Guitar CRM Design System

Extracted: 2026-02-01

## Design Direction

**Theme**: Modern music education platform with dark mode emphasis
**Aesthetic**: Clean, professional, mobile-first
**Base System**: shadcn/ui + Tailwind CSS 4
**Color Philosophy**: OKLCH-based semantic colors with dark mode gold accents

## Spacing Grid

**Base unit**: 4px (0.25rem)

### Standard Scale
- `0.5` = 2px (0.125rem) - Micro spacing
- `1` = 4px (0.25rem) - Minimal gap
- `1.5` = 6px (0.375rem) - Tight spacing
- `2` = 8px (0.5rem) - Compact spacing
- `3` = 12px (0.75rem) - Default gap
- `4` = 16px (1rem) - Standard padding
- `5` = 20px (1.25rem) - Relaxed spacing
- `6` = 24px (1.5rem) - Component padding
- `8` = 32px (2rem) - Section spacing
- `10` = 40px (2.5rem) - Large sections
- `12` = 48px (3rem) - Major sections
- `16` = 64px (4rem) - Hero spacing

### Component-Specific
- Card padding: `px-6 py-6` (24px)
- Card gap: `gap-6` (24px)
- Button padding: `px-4 py-2` (h-9 = 36px)
- Input height: `h-9` (36px)
- Icon sizes: `h-4 w-4` (16px), `h-3.5 w-3.5` (14px)

### Mobile Adjustments
- Mobile gap: `gap-3` (12px)
- Mobile padding: `px-3` (12px)
- Compact spacing: `pb-1.5` → `pb-2` (6px → 8px)

**Rule**: All spacing must be on 4px grid. Exceptions only for borders (1px).

## Border Radius

**Base radius**: `--radius: 0.625rem` (10px)

### Scale
- `sm` = calc(var(--radius) - 4px) = 6px
- `md` = calc(var(--radius) - 2px) = 8px
- `lg` = var(--radius) = 10px ✓ Primary
- `xl` = calc(var(--radius) + 4px) = 14px

### Usage
- Cards: `rounded-xl` (14px)
- Buttons: `rounded-md` (8px)
- Inputs: `rounded-md` (8px)
- Badges: `rounded-full`
- Icon backgrounds: `rounded-lg` (10px) or `rounded-xl` (14px)

## Depth System

**Style**: Mixed (borders + subtle shadows)

### Shadows
- `shadow-xs` = Minimal, used on inputs/buttons
- `shadow-sm` = Default card shadow
- `shadow-md` = Hover state elevation
- `shadow-lg` = Modal/dialog elevation
- `shadow-glow` = `0 0 40px hsl(38 92% 50% / 0.15)` - Special gold glow effect
- `shadow-card` = `0 4px 24px hsl(0 0% 0% / 0.3)` - Dark mode card shadow

### Ring Shadows (Focus States)
- Default: `ring-[3px] ring-ring/50`
- Error: `ring-destructive/20 dark:ring-destructive/40`

**Rule**: Prefer borders for structure. Use subtle shadows for elevation only. Allow ring shadows for focus/interaction states.

## Color Palette

### Light Mode (OKLCH)
```css
--background: oklch(1 0 0)          /* Pure white */
--foreground: oklch(0.145 0 0)      /* Near black */
--card: oklch(1 0 0)                /* White */
--primary: oklch(0.205 0 0)         /* Dark gray/black */
--secondary: oklch(0.97 0 0)        /* Very light gray */
--muted: oklch(0.97 0 0)            /* Very light gray */
--border: oklch(0.922 0 0)          /* Light gray */
--input: oklch(0.922 0 0)           /* Light gray */
--destructive: oklch(0.577 0.245 27.325)
```

### Dark Mode (HSL)
```css
--background: hsl(20 14% 4%)        /* Very dark brown */
--foreground: hsl(40 20% 95%)       /* Off-white */
--card: hsl(20 10% 8%)              /* Dark brown card */
--primary: hsl(38 92% 50%)          /* Gold */
--secondary: hsl(20 10% 14%)        /* Dark gray-brown */
--muted: hsl(20 10% 18%)            /* Muted dark */
--border: hsl(20 10% 16%)           /* Dark border */
--input: hsl(20 10% 16%)            /* Dark input */
--accent: hsl(38 92% 50%)           /* Gold accent */
--destructive: hsl(0 84% 60%)       /* Red */
--success: hsl(142 76% 36%)         /* Green */
--warning: hsl(38 92% 50%)          /* Gold (same as primary) */
```

### Gradients
```css
--gradient-gold: linear-gradient(135deg, hsl(38 92% 50%), hsl(28 90% 45%))
--gradient-card: linear-gradient(180deg, hsl(20 10% 10%), hsl(20 10% 8%))
```

**Rule**: Use semantic color variables only. Custom colors must match existing palette. Dark mode is primary focus with warm gold accents.

## Typography

### Font Families
- Sans: `var(--font-geist-sans)` - Primary UI font
- Mono: `var(--font-geist-mono)` - Code/technical

### Scale
- `text-xs` (12px) - Labels, badges, meta
- `text-sm` (14px) - Body small, descriptions
- `text-base` (16px) - Default body
- `text-lg` (18px) - Emphasis
- `text-xl` (20px) - Stats values (mobile)
- `text-2xl` (24px) - Stats values (tablet)
- `text-3xl` (30px) - Page titles, stats (desktop)

### Weights
- `font-medium` (500) - Labels, buttons
- `font-semibold` (600) - Card titles
- `font-bold` (700) - Page titles, stats

### Mobile Adjustments
- Page titles: `text-3xl` (no change)
- Stats: `text-xl sm:text-2xl lg:text-3xl` (20px → 24px → 30px)
- Card titles: `text-xs sm:text-sm` (12px → 14px)
- Button text: `text-sm` (14px, constant)

## Component Patterns

### Button
**Heights**:
- Small: `h-8` (32px)
- Default: `h-9` (36px) ✓ Primary
- Large: `h-10` (40px)
- Icon: `size-9` (36px)

**Padding**:
- Default: `px-4` (16px)
- With icon: `px-3` (12px)
- Small: `px-3` (12px)

**Focus**: `focus-visible:ring-[3px] ring-ring/50`

**Variants**: default, destructive, outline, secondary, ghost, link

### Card
**Structure**:
```
rounded-xl border shadow-sm
gap-6 (internal)
py-6 px-6 (via CardHeader/CardContent)
```

**Header**: `pb-2` when followed by content
**Content**: `px-6`
**Footer**: `px-6 pt-6` (if border-t)

### StatsCard (Gradient Variant)
**Special Pattern**:
```tsx
- Container: p-5 sm:p-6 rounded-xl border
- Hover: border-primary/40 + shadow-lg shadow-primary/5
- Gradient overlay: from-primary/5 to-transparent
- Icon background: w-10 h-10 sm:w-12 sm:h-12 rounded-xl
- Animation: fade-in with delay
```

### Input
**Height**: `h-9` (36px)
**Padding**: `px-3 py-1`
**Border**: `border-input`
**Focus**: `focus-visible:ring-[3px] ring-ring/50`
**Error**: `aria-invalid:ring-destructive/20 aria-invalid:border-destructive`

### Badge
**Padding**: `px-2 py-0.5`
**Font**: `text-xs font-medium`
**Shape**: `rounded-full`
**Icon**: `[&>svg]:size-3` (12px)

## Responsive Breakpoints

### Standard (Tailwind)
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### Custom
- `xs`: 475px (small phones landscape)
- `tablet`: 768px
- `portrait`: 1080px (vertical displays)
- `desktop`: 1024px
- `fhd`: 1920px (Full HD landscape)
- `ultrawide`: 2560px (QHD)
- `superwide`: 3200px

### Mobile-First Pattern
```
base (mobile) → sm → md → lg → xl → ultrawide
```

**Grid columns**: 1 → 2 → 3 → 4 → 5 → 6
**Padding**: 3 → 4 → 6 → 8 → 10 → 12
**Gap**: 3 → 4 → 5 → 6 → 8 → 10

## Animation

### Keyframes
```css
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### Usage
- `animate-fade-in` with `opacity-0` and `animationFillMode: 'forwards'`
- Delays: Stagger with `style={{ animationDelay: '${delay}ms' }}`
- Duration: 0.5s ease-out (fade-in), 0.2s ease-out (accordion)

### Transitions
- Default: `transition-all duration-200` (hover states)
- Colors: `transition-[color,box-shadow]` (inputs)
- Complex: `transition-all duration-300` (gradient overlays)

## Utility Classes

### Glass Effect
```css
.glass {
  @apply bg-card/80 backdrop-blur-xl border border-border/50;
}
```

### Glow Effect
```css
.glow {
  box-shadow: var(--shadow-glow);
}
```

### Gradient Text
```css
.gradient-text {
  @apply bg-clip-text text-transparent;
  background-image: var(--gradient-gold);
}
```

## Accessibility

### Focus States
All interactive elements MUST have:
```
focus-visible:border-ring
focus-visible:ring-ring/50
focus-visible:ring-[3px]
```

### Error States
Invalid inputs MUST have:
```
aria-invalid:ring-destructive/20
dark:aria-invalid:ring-destructive/40
aria-invalid:border-destructive
```

### Disabled States
```
disabled:pointer-events-none
disabled:opacity-50
```

## Violations to Flag

### Spacing
- ❌ 14px, 17px, 22px (not on 4px grid)
- ✓ 12px, 16px, 20px, 24px

### Heights
- ❌ Button: 38px, 42px
- ✓ Button: h-8 (32px), h-9 (36px), h-10 (40px)

### Colors
- ❌ Hardcoded: `#fff`, `rgb(255,0,0)`, `hsl(200 50% 50%)`
- ✓ Semantic: `bg-primary`, `text-foreground`, `border-border`

### Shadows
- ❌ Layered shadows: `shadow-md shadow-lg`
- ❌ Custom shadow values outside system
- ✓ Single shadow: `shadow-sm`, `shadow-md`, or ring shadows

### Border Radius
- ❌ `rounded-sm`, `rounded-2xl`, `rounded-3xl` (not in scale)
- ✓ `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-full`

## Pattern Compliance

Check these components against their patterns:

1. **Button**: Height h-9, padding px-4 (or px-3 with icon)
2. **Card**: px-6 py-6, gap-6, rounded-xl
3. **Input**: Height h-9, padding px-3
4. **StatsCard**: Gradient variant uses p-5 sm:p-6
5. **Focus states**: All interactive elements have ring-[3px]
