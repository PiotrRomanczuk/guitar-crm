---
name: frontend-design
description: Frontend UI/UX design guidance for creating distinctive, production-grade interfaces. Use when designing new components, improving existing UI, or ensuring consistent design patterns across the Guitar CRM application. Focuses on Tailwind CSS, shadcn/ui, and React best practices.
---

# Frontend Design Guide

## Overview

Create distinctive, production-grade frontend interfaces for Guitar CRM using Tailwind CSS 4 and shadcn/ui components.

## Design Principles

### 1. Consistency Over Creativity

For a CRM application, prioritize:
- **Predictable layouts** - Users should know where to find things
- **Clear hierarchy** - Important actions stand out
- **Accessible colors** - WCAG 2.1 AA compliance
- **Responsive design** - Mobile-first approach

### 2. Guitar CRM Color System

```css
/* Primary palette from existing design */
--primary: 222.2 47.4% 11.2%;        /* Dark blue - main actions */
--secondary: 210 40% 96%;             /* Light gray - backgrounds */
--accent: 210 40% 96%;                /* Subtle highlights */
--destructive: 0 84.2% 60.2%;         /* Red - delete/cancel */
--success: 142 76% 36%;               /* Green - completed/mastered */
--warning: 38 92% 50%;                /* Yellow - pending/scheduled */
```

### 3. Status Color Mapping

```typescript
// From /lib/utils/statusColors.ts
const statusColors = {
  // Song progress
  to_learn: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  started: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  remembered: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  mastered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',

  // Lesson status
  scheduled: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  rescheduled: 'bg-purple-100 text-purple-800',
};
```

## Component Patterns

### Card Layout

```tsx
<Card className="bg-card rounded-xl border border-border shadow-sm">
  <CardHeader className="pb-3">
    <CardTitle className="text-lg font-semibold">Title</CardTitle>
    <CardDescription>Description text</CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* Content */}
  </CardContent>
  <CardFooter className="border-t pt-4">
    <Button variant="outline" className="mr-2">Cancel</Button>
    <Button>Save</Button>
  </CardFooter>
</Card>
```

### Form Layout

```tsx
<Card>
  <CardContent className="p-6">
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError && <Alert variant="destructive">{formError}</Alert>}

      <div className="space-y-2">
        <Label htmlFor="name">
          Name <span className="text-destructive ml-1">*</span>
        </Label>
        <Input
          id="name"
          {...register('name')}
          aria-invalid={!!errors.name}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-border">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save
        </Button>
      </div>
    </form>
  </CardContent>
</Card>
```

### Table with Mobile Cards

```tsx
<div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
  {/* Mobile Cards */}
  <div className="md:hidden space-y-3 p-4">
    {items.map(item => (
      <div key={item.id} className="rounded-lg border p-4 space-y-3">
        <div className="flex justify-between items-start">
          <span className="font-medium">{item.name}</span>
          <Badge variant={getStatusVariant(item.status)}>
            {item.status}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{item.description}</p>
      </div>
    ))}
  </div>

  {/* Desktop Table */}
  <div className="hidden md:block overflow-x-auto">
    <Table className="min-w-[600px]">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map(item => (
          <TableRow key={item.id} className="hover:bg-muted/50 transition-colors">
            <TableCell>{item.name}</TableCell>
            <TableCell>
              <Badge>{item.status}</Badge>
            </TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="sm">Edit</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
</div>
```

### Empty State

```tsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <Music className="h-12 w-12 text-muted-foreground mb-4" />
  <h3 className="text-lg font-semibold mb-2">No songs yet</h3>
  <p className="text-muted-foreground mb-4 max-w-sm">
    Start building your repertoire by adding your first song.
  </p>
  <Button>
    <Plus className="mr-2 h-4 w-4" />
    Add Song
  </Button>
</div>
```

## Dark Mode

Always include dark mode variants:

```tsx
// Background
className="bg-white dark:bg-gray-900"

// Text
className="text-gray-900 dark:text-gray-100"

// Borders
className="border-gray-200 dark:border-gray-700"

// Status badges
className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
```

## Responsive Breakpoints

```tsx
// Mobile first approach
className="w-full sm:w-auto"           // Full width on mobile
className="grid-cols-1 md:grid-cols-2" // Stack on mobile
className="hidden md:flex"              // Hide on mobile
className="text-sm md:text-base"        // Smaller text on mobile
```

## Animation

```tsx
// Hover transitions
className="transition-colors hover:bg-muted/50"

// Loading spinner
<Loader2 className="h-4 w-4 animate-spin" />

// Fade in
className="animate-in fade-in duration-200"
```

## Accessibility Checklist

- [ ] All interactive elements have focus states
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Form inputs have associated labels
- [ ] Error messages use `aria-describedby`
- [ ] Loading states announced to screen readers
- [ ] Keyboard navigation works throughout
