# UI Standards & Design System

This document outlines the UI standards for the application. All new components and pages should adhere to these standards to ensure consistency, accessibility, and a cohesive user experience across all devices.

## 1. Design Philosophy

- **Mobile-First**: Design for the smallest screen first, then enhance for larger screens.
- **Consistency**: Reuse existing components and patterns.
- **Simplicity**: Keep interfaces clean and focused on the user's task.
- **Feedback**: Provide immediate visual feedback for user actions.
- **Accessibility**: Ensure all components are accessible (keyboard navigable, proper contrast, touch targets).

## 2. Layout & Structure

### Page Container
Standardize page layouts to ensure content is centered and readable.

- **Max Width**: `max-w-7xl` for dashboard/app views, `max-w-5xl` for focused content.
- **Padding**: `px-4 sm:px-6 lg:px-8` for responsive horizontal padding.
- **Vertical Spacing**: `space-y-6` or `space-y-8` between major sections.

```tsx
<main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl space-y-6 sm:space-y-8">
  {/* Page Header */}
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Page Title</h1>
    {/* Actions - Full width on mobile, auto on desktop */}
    <div className="w-full sm:w-auto flex gap-2">
      {/* Action Buttons */}
    </div>
  </div>
  
  {/* Content */}
</main>
```

### Cards
Cards are the primary container for grouping related content.

- **Background**: `bg-card`
- **Border**: `border border-border`
- **Radius**: `rounded-xl`
- **Shadow**: `shadow-sm` (optional, use sparingly)
- **Hover**: `hover:border-primary/30 transition-all duration-300` for interactive cards.

```tsx
<div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
  <div className="p-4 sm:p-6 border-b border-border">
    <h3 className="font-semibold text-lg">Card Title</h3>
    <p className="text-sm text-muted-foreground mt-1">Card description or subtitle.</p>
  </div>
  <div className="p-4 sm:p-6">
    {/* Card Content */}
  </div>
  <div className="p-4 sm:p-6 bg-muted/50 border-t border-border">
    {/* Card Footer (Optional) */}
  </div>
</div>
```

## 3. Typography

Use the configured font stack (Inter/Sans). Font sizes should adapt to screen size.

- **H1 (Page Title)**: `text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight`
- **H2 (Section Title)**: `text-xl sm:text-2xl font-semibold tracking-tight`
- **H3 (Card Title)**: `text-lg font-semibold`
- **H4 (Subsection)**: `text-base font-medium`
- **Body**: `text-sm` or `text-base text-foreground`
- **Muted/Subtitle**: `text-sm text-muted-foreground`
- **Small/Label**: `text-xs font-medium text-muted-foreground uppercase tracking-wider`

## 4. Colors & Status

Use semantic colors to convey meaning. Avoid hardcoding hex values; use Tailwind utility classes that map to CSS variables.

### Status Indicators

| Status | Meaning | Classes |
| :--- | :--- | :--- |
| **Success** | Completed, Active, Paid | `text-green-600 bg-green-50 border-green-200` (Light) / `text-green-400 bg-green-500/10 border-green-500/20` (Dark/Adaptive) |
| **Primary** | In Progress, Submitted | `text-primary bg-primary/10 border-primary/20` |
| **Warning** | Due Soon, Pending Action | `text-yellow-600 bg-yellow-50 border-yellow-200` / `text-yellow-400 bg-yellow-500/10 border-yellow-500/20` |
| **Destructive** | Overdue, Error, Deleted | `text-destructive bg-destructive/10 border-destructive/20` |
| **Neutral** | Inactive, Draft | `text-muted-foreground bg-muted border-border` |

### Usage Example (Badge)

```tsx
<Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20">
  Active
</Badge>
```

## 5. Components

### Buttons
- **Primary**: `default` variant. For main actions.
- **Secondary**: `outline` or `secondary` variant. For cancel/back actions.
- **Destructive**: `destructive` variant. For delete/remove actions.
- **Ghost**: `ghost` variant. For icon buttons or less prominent actions.
- **Mobile**: Buttons should often be full-width (`w-full`) on mobile devices for easier interaction.

### Inputs
- Always include a `<Label>` associated with the input.
- Use `placeholder` for guidance.
- Display validation errors with `text-destructive text-sm`.
- **Mobile**: Ensure inputs have `text-base` (16px) to prevent auto-zoom on iOS devices.

### Icons
- Library: `lucide-react`
- Standard Size: `w-4 h-4` (small/inline), `w-5 h-5` (standard), `w-6 h-6` (large).
- Color: Usually matches text color (`currentColor`), or specific status color.

## 6. Animations

Use subtle animations to enhance the user experience, not distract.

- **Fade In**: `animate-fade-in`
- **Slide Up**: `animate-slide-up` (custom class often used for entering elements)
- **Transitions**: `transition-all duration-200` or `duration-300` ease-in-out.

```tsx
// Staggered list animation
<div className="opacity-0 animate-fade-in" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
  {/* Content */}
</div>
```

## 7. Tables & Lists

### Tables
- Wrap in a rounded border container.
- Header: `bg-muted/50` text `text-muted-foreground`.
- Rows: `hover:bg-muted/50 transition-colors`.
- Cells: `p-4 align-middle`.
- **Mobile**: Tables often break on mobile. Use a horizontal scroll wrapper OR convert rows to card-like views for small screens.

### Lists
- Use `divide-y divide-border` for separation.
- Interactive rows should have hover states.

```tsx
<div className="rounded-md border border-border overflow-x-auto">
  <Table className="min-w-[600px]">
    {/* Table Content */}
  </Table>
</div>
```

## 8. Empty States

Always provide a clear empty state when no data is available.

- **Icon**: Large, muted icon (`w-12 h-12 text-muted-foreground/50`).
- **Title**: Clear statement ("No students found").
- **Description**: Helpful context or next step ("Get started by adding a new student.").
- **Action**: Primary button to create/add.

```tsx
<div className="flex flex-col items-center justify-center py-12 text-center space-y-4 border-2 border-dashed border-border rounded-xl bg-muted/10">
  <Users className="w-12 h-12 text-muted-foreground/50" />
  <div className="space-y-1">
    <h3 className="font-semibold text-lg">No students yet</h3>
    <p className="text-muted-foreground text-sm max-w-sm">
      Add your first student to start tracking their progress.
    </p>
  </div>
  <Button>Add Student</Button>
</div>
```

## 9. Mobile Design & Responsiveness

### Touch Targets
Ensure all interactive elements are large enough to be easily tapped.
- **Minimum Size**: 44x44px for touch targets.
- **Spacing**: Ensure adequate spacing between interactive elements to prevent accidental clicks.

### Navigation
- **Desktop**: Sidebar or Top Navigation.
- **Mobile**: Bottom Navigation Bar or Hamburger Menu (Sheet/Drawer).
- **Actions**: Primary actions should be within easy reach of the thumb (bottom of screen).

### Modals & Dialogs
- **Desktop**: Centered Dialog.
- **Mobile**: Bottom Sheet (Drawer) or Full-screen Dialog.

```tsx
// Example: Responsive Dialog/Drawer
import { useMediaQuery } from "@/hooks/use-media-query"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Drawer, DrawerContent } from "@/components/ui/drawer"

export function ResponsiveDialog({ children, open, onOpenChange }) {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>{children}</DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>{children}</DrawerContent>
    </Drawer>
  )
}
```

### Forms on Mobile
- **Stacking**: Stack form fields vertically.
- **Input Types**: Use correct `type` attributes (`tel`, `email`, `number`) to trigger the appropriate keyboard.
- **Auto-zoom**: Ensure input font size is at least 16px to prevent iOS auto-zoom.
