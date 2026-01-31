# Figma Developer Handoff Guide

This document provides guidelines for translating Figma designs into code for the Guitar CRM application. It ensures consistency between design and implementation.

## Table of Contents

1. [Setup & Access](#setup--access)
2. [Inspecting Designs](#inspecting-designs)
3. [Design to Code Mapping](#design-to-code-mapping)
4. [Component Implementation](#component-implementation)
5. [Responsive Implementation](#responsive-implementation)
6. [Common Patterns](#common-patterns)
7. [Quality Checklist](#quality-checklist)

---

## Setup & Access

### Required Tools

1. **Figma Account** - Request access to the Guitar CRM design files
2. **Figma Desktop App** - Recommended for Dev Mode features
3. **VS Code Extensions**:
   - Figma for VS Code (optional)
   - Tailwind CSS IntelliSense (required)

### Project Files

| File | Purpose | Access |
|------|---------|--------|
| `Guitar CRM - Design System` | Tokens, components | View |
| `Guitar CRM - Pages` | Page designs | View |
| `Guitar CRM - Prototypes` | Interactive flows | View |

### Dev Mode

1. Open the Figma file
2. Click "Dev Mode" toggle (top right) or press `Shift + D`
3. Select a layer to inspect properties
4. Use the right panel to view CSS/Tailwind values

---

## Inspecting Designs

### Layer Selection

**Tips:**
- Hold `Cmd/Ctrl` to select nested layers
- Use `Tab` to cycle through overlapping layers
- Check the layers panel for component structure

### Reading Properties

| Property | Where to Find | Code Equivalent |
|----------|---------------|-----------------|
| Width/Height | Right panel → Layout | `w-[value]`, `h-[value]` |
| Padding | Right panel → Layout | `p-[value]`, `px-[value]`, `py-[value]` |
| Gap | Right panel → Layout | `gap-[value]` |
| Border Radius | Right panel → Fill | `rounded-[size]` |
| Color | Right panel → Fill | Use token name |
| Font | Right panel → Text | `text-[size] font-[weight]` |
| Shadow | Right panel → Effects | `shadow-[size]` |

### Color Values

**Always use tokens, not raw values:**

```tsx
// WRONG - Raw hex value
<div className="bg-[#F5A623]">

// CORRECT - Design token
<div className="bg-primary">
```

**Token Reference:**

| Figma Color | Tailwind Class |
|-------------|----------------|
| `background` | `bg-background` |
| `foreground` | `text-foreground` |
| `primary` | `bg-primary`, `text-primary` |
| `secondary` | `bg-secondary` |
| `muted` | `bg-muted`, `text-muted-foreground` |
| `card` | `bg-card` |
| `border` | `border-border` |
| `destructive` | `bg-destructive`, `text-destructive` |

### Spacing Values

**Figma to Tailwind mapping:**

| Figma (px) | Tailwind | CSS Variable |
|------------|----------|--------------|
| 2 | `0.5` | 0.125rem |
| 4 | `1` | 0.25rem |
| 6 | `1.5` | 0.375rem |
| 8 | `2` | 0.5rem |
| 10 | `2.5` | 0.625rem |
| 12 | `3` | 0.75rem |
| 14 | `3.5` | 0.875rem |
| 16 | `4` | 1rem |
| 20 | `5` | 1.25rem |
| 24 | `6` | 1.5rem |
| 32 | `8` | 2rem |
| 40 | `10` | 2.5rem |
| 48 | `12` | 3rem |

---

## Design to Code Mapping

### Auto Layout → Flexbox/Grid

| Figma Auto Layout | Tailwind |
|-------------------|----------|
| Direction: Vertical | `flex flex-col` |
| Direction: Horizontal | `flex flex-row` |
| Gap: 16 | `gap-4` |
| Padding: 16 | `p-4` |
| Align: Center | `items-center` |
| Justify: Space Between | `justify-between` |
| Fill Container | `w-full` |
| Hug Contents | `w-fit` |

**Example:**

```
Figma:
- Direction: Horizontal
- Gap: 12
- Padding: 16
- Align: Center

Tailwind:
<div className="flex flex-row gap-3 p-4 items-center">
```

### Constraints → Responsive Classes

| Figma Constraint | Tailwind Approach |
|------------------|-------------------|
| Left | Default (no class needed) |
| Right | `ml-auto` |
| Left & Right | `w-full` |
| Center | `mx-auto` |
| Scale | Percentage width |

### Typography

| Figma Text Style | Tailwind Classes |
|------------------|------------------|
| H1 Desktop | `text-4xl font-bold tracking-tight` |
| H1 Mobile | `text-2xl font-bold tracking-tight` |
| H2 Desktop | `text-2xl font-semibold tracking-tight` |
| H2 Mobile | `text-xl font-semibold tracking-tight` |
| H3 | `text-lg font-semibold` |
| Body | `text-sm` or `text-base` |
| Small | `text-xs` |
| Label | `text-xs font-medium uppercase tracking-wider` |

**Responsive Typography:**

```tsx
// Figma shows different sizes for mobile vs desktop
<h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
  Page Title
</h1>
```

### Border Radius

| Figma Radius | Tailwind |
|--------------|----------|
| 0 | `rounded-none` |
| 6 | `rounded-sm` |
| 8 | `rounded-md` |
| 10 | `rounded-lg` |
| 14 | `rounded-xl` |
| 9999 | `rounded-full` |

### Shadows

| Figma Effect | Tailwind |
|--------------|----------|
| Shadow small | `shadow-sm` |
| Shadow medium | `shadow-md` |
| Shadow large | `shadow-lg` |
| Glow (gold) | `glow` (custom) |

---

## Component Implementation

### Using shadcn/ui Components

**Always check if a component exists before creating custom:**

```tsx
// Check components/ui/ for existing components
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
```

### Mapping Figma Variants to Props

**Example: Button Component**

| Figma Variant | Code |
|---------------|------|
| `Button / Primary / Default` | `<Button>` |
| `Button / Secondary / Default` | `<Button variant="secondary">` |
| `Button / Outline / Default` | `<Button variant="outline">` |
| `Button / Ghost / Default` | `<Button variant="ghost">` |
| `Button / Destructive / Default` | `<Button variant="destructive">` |
| `Button / Primary / Small` | `<Button size="sm">` |
| `Button / Primary / Large` | `<Button size="lg">` |

### Creating New Components

When Figma shows a component not in shadcn/ui:

1. **Check shared components**: `components/shared/`
2. **Check domain components**: `components/[domain]/`
3. **Create if needed**: Follow existing patterns

**Component Template:**

```tsx
// components/shared/NewComponent.tsx
import { cn } from "@/lib/utils";

interface NewComponentProps {
  className?: string;
  // ... other props from Figma variants
}

export function NewComponent({ className, ...props }: NewComponentProps) {
  return (
    <div className={cn("base-classes-from-figma", className)}>
      {/* Content */}
    </div>
  );
}
```

---

## Responsive Implementation

### Mobile-First Approach

**Always start with mobile styles, then add breakpoint modifiers:**

```tsx
// Figma shows: Mobile 12px padding, Desktop 24px padding
<div className="p-3 md:p-6">

// Figma shows: Mobile 1 column, Desktop 3 columns
<div className="grid grid-cols-1 md:grid-cols-3">
```

### Breakpoint Usage

| Figma Frame | Tailwind Prefix | Min Width |
|-------------|-----------------|-----------|
| Mobile (430px) | (default) | 0px |
| xs (475px) | `xs:` | 475px |
| Tablet (768px) | `md:` | 768px |
| Desktop (1024px) | `lg:` | 1024px |
| Large Desktop (1280px) | `xl:` | 1280px |
| Ultrawide (2560px) | `ultrawide:` | 2560px |

### Responsive Patterns

**Card Grid:**

```tsx
// Figma: 1 col mobile, 2 col tablet, 3 col desktop, 6 col ultrawide
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ultrawide:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
  {cards}
</div>
```

**Navigation:**

```tsx
// Figma: Top nav on mobile, Sidebar on desktop
{isMobile ? (
  <TopNavigation />
) : (
  <Sidebar />
)}

// Or use CSS to hide/show
<TopNavigation className="md:hidden" />
<Sidebar className="hidden md:flex" />
```

**Dialog/Drawer:**

```tsx
// Figma: Bottom drawer on mobile, Center dialog on desktop
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";

<ResponsiveDialog>
  <DialogContent>{content}</DialogContent>
</ResponsiveDialog>
```

---

## Common Patterns

### Page Layout

```tsx
// Standard page layout from Figma
export default function Page() {
  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Page Title
          </h1>
          <p className="text-muted-foreground mt-1">
            Page description
          </p>
        </div>
        <div className="w-full sm:w-auto flex gap-2">
          <Button>Action</Button>
        </div>
      </div>

      {/* Page Content */}
      <div className="space-y-6 sm:space-y-8">
        {/* Sections */}
      </div>
    </main>
  );
}
```

### Card Component

```tsx
// Card pattern from Figma
<Card>
  <CardHeader className="pb-2 sm:pb-3">
    <CardTitle className="text-base sm:text-lg">Card Title</CardTitle>
    <CardDescription className="text-xs sm:text-sm">
      Card description
    </CardDescription>
  </CardHeader>
  <CardContent className="pt-0">
    {/* Content */}
  </CardContent>
</Card>
```

### Form Layout

```tsx
// Form pattern from Figma
<form className="space-y-4 sm:space-y-6">
  <div className="space-y-2">
    <Label htmlFor="field">Field Label</Label>
    <Input id="field" placeholder="Placeholder text" />
  </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div className="space-y-2">
      <Label htmlFor="field1">Field 1</Label>
      <Input id="field1" />
    </div>
    <div className="space-y-2">
      <Label htmlFor="field2">Field 2</Label>
      <Input id="field2" />
    </div>
  </div>

  <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
    <Button variant="outline" type="button">Cancel</Button>
    <Button type="submit">Submit</Button>
  </div>
</form>
```

### Empty State

```tsx
// Empty state pattern from Figma
<div className="flex flex-col items-center justify-center py-12 text-center space-y-4 border-2 border-dashed border-border rounded-xl bg-muted/10">
  <Icon className="w-12 h-12 text-muted-foreground/50" />
  <div className="space-y-1">
    <h3 className="font-semibold text-lg">No items yet</h3>
    <p className="text-muted-foreground text-sm max-w-sm">
      Description of what to do next.
    </p>
  </div>
  <Button>Add First Item</Button>
</div>
```

### Loading Skeleton

```tsx
// Skeleton pattern matching Figma loading states
<div className="space-y-4">
  <Skeleton className="h-8 w-48" /> {/* Title */}
  <Skeleton className="h-4 w-96" /> {/* Description */}
  <div className="grid grid-cols-3 gap-4">
    <Skeleton className="h-32" />
    <Skeleton className="h-32" />
    <Skeleton className="h-32" />
  </div>
</div>
```

---

## Quality Checklist

### Before Implementation

- [ ] Review all variants in Figma (states, sizes, responsive)
- [ ] Identify existing components that can be reused
- [ ] Check if design tokens are used (not raw values)
- [ ] Note responsive breakpoints needed

### During Implementation

- [ ] Use design tokens for colors, not hex values
- [ ] Use spacing scale values (multiples of 4px)
- [ ] Implement mobile-first responsive styles
- [ ] Match component structure to Figma layers
- [ ] Include all interactive states (hover, focus, active, disabled)

### After Implementation

- [ ] Visual comparison at all breakpoints
  - [ ] Mobile (430px)
  - [ ] Tablet (768px)
  - [ ] Desktop (1280px)
  - [ ] Ultrawide (3440px) if applicable
- [ ] Test dark mode appearance
- [ ] Verify animations match Figma prototype
- [ ] Check loading states
- [ ] Check error states
- [ ] Check empty states
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility

### Pixel-Perfect Checklist

| Element | Check |
|---------|-------|
| Spacing | Matches Figma exactly (use tokens) |
| Typography | Size, weight, line-height correct |
| Colors | Using tokens, matches Figma |
| Border radius | Matches Figma |
| Shadows | Matches Figma |
| Icons | Correct size and color |
| Alignment | Matches Figma layout |
| Responsive | All breakpoints implemented |

---

## Troubleshooting

### Common Issues

**Issue: Colors don't match**
- Ensure you're using color tokens, not raw values
- Check if design is using light or dark mode
- Verify opacity values

**Issue: Spacing looks off**
- Double-check Figma padding/margin values
- Map to correct Tailwind spacing class
- Account for border width in calculations

**Issue: Responsive layout breaks**
- Start with mobile layout first
- Add breakpoint classes progressively
- Test at exact breakpoint boundaries

**Issue: Component looks different**
- Check all Figma component variants
- Verify correct props are passed
- Check for custom overrides needed

### Getting Help

1. Check this documentation first
2. Review existing similar implementations in codebase
3. Consult the `UI_STANDARDS.md` file
4. Ask in team Slack channel with Figma link
