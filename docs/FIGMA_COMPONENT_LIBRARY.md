# Figma Component Library Mapping

This document maps all shadcn/ui components used in Guitar CRM to their Figma equivalents. Use this as a reference when creating or updating designs.

## Table of Contents

1. [Component Overview](#component-overview)
2. [Core Components](#core-components)
3. [Form Components](#form-components)
4. [Navigation Components](#navigation-components)
5. [Data Display Components](#data-display-components)
6. [Feedback Components](#feedback-components)
7. [Domain-Specific Components](#domain-specific-components)
8. [Component Properties](#component-properties)

---

## Component Overview

### shadcn/ui Components in Use

| Category | Components | Figma Status |
|----------|------------|--------------|
| **Layout** | Card, Separator, Scroll Area | Create |
| **Forms** | Button, Input, Textarea, Checkbox, Select, Label, Form | Create |
| **Navigation** | Tabs, Breadcrumbs, Pagination, Sidebar, Sheet | Create |
| **Overlay** | Dialog, Alert Dialog, Popover, Dropdown Menu, Tooltip | Create |
| **Data Display** | Table, Badge, Avatar, Skeleton, Progress, Calendar | Create |
| **Feedback** | Alert, Spinner, Toast (Sonner) | Create |

### Figma Component Structure

```
Guitar CRM Components
├── 01 - Primitives
│   ├── Colors
│   ├── Typography
│   ├── Icons
│   └── Spacing
├── 02 - Core
│   ├── Button
│   ├── Input
│   ├── Card
│   └── Badge
├── 03 - Forms
│   ├── Form Field
│   ├── Checkbox
│   ├── Select
│   └── Textarea
├── 04 - Navigation
│   ├── Sidebar
│   ├── Tabs
│   ├── Breadcrumbs
│   └── Pagination
├── 05 - Overlay
│   ├── Dialog
│   ├── Dropdown
│   ├── Popover
│   └── Tooltip
├── 06 - Data
│   ├── Table
│   ├── Avatar
│   ├── Calendar
│   └── Progress
├── 07 - Feedback
│   ├── Alert
│   ├── Toast
│   ├── Skeleton
│   └── Spinner
└── 08 - Domain
    ├── Entity Card
    ├── Status Badge
    ├── Stats Card
    └── Timeline
```

---

## Core Components

### Button

**File:** `components/ui/button.tsx`

#### Variants

| Variant | Background | Text | Border | Figma Style |
|---------|------------|------|--------|-------------|
| `default` | `primary` | `primary-foreground` | none | Solid dark |
| `secondary` | `secondary` | `secondary-foreground` | none | Light gray |
| `outline` | `transparent` | `foreground` | `input` | Bordered |
| `ghost` | `transparent` | `foreground` | none | Invisible |
| `destructive` | `destructive` | `white` | none | Red solid |
| `link` | `transparent` | `primary` | none | Underline |

#### Sizes

| Size | Height | Padding X | Font Size | Icon Size |
|------|--------|-----------|-----------|-----------|
| `sm` | 32px | 12px | 14px | 14px |
| `default` | 40px | 16px | 14px | 16px |
| `lg` | 48px | 24px | 16px | 20px |
| `icon` | 40px | 10px | - | 16px |

#### States

- **Default**: Normal appearance
- **Hover**: Background lightens/darkens 10%
- **Focus**: Ring outline (2px, ring color)
- **Active**: Scale 98%
- **Disabled**: Opacity 50%, cursor not-allowed

#### Figma Component Properties

```
Button
├── Variant: default | secondary | outline | ghost | destructive | link
├── Size: sm | default | lg | icon
├── State: default | hover | focus | active | disabled
├── Leading Icon: boolean
├── Trailing Icon: boolean
├── Full Width: boolean
└── Loading: boolean
```

### Card

**File:** `components/ui/card.tsx`

#### Structure

```
┌─────────────────────────────────────────┐
│ CardHeader                              │ <- optional
│   CardTitle                             │
│   CardDescription                       │
├─────────────────────────────────────────┤
│                                         │
│ CardContent                             │
│                                         │
├─────────────────────────────────────────┤
│ CardFooter                              │ <- optional
└─────────────────────────────────────────┘
```

#### Specs

| Property | Value |
|----------|-------|
| Background | `card` |
| Border | 1px `border` |
| Border Radius | 14px (`rounded-xl`) |
| Shadow | `shadow-sm` (optional) |
| Header Padding | 16-24px |
| Content Padding | 16-24px |
| Footer Padding | 16-24px |
| Footer Background | `muted/50` |

#### Figma Component Properties

```
Card
├── Has Header: boolean
├── Has Footer: boolean
├── Has Shadow: boolean
├── Interactive: boolean (adds hover state)
└── Size: compact | default | spacious
```

### Badge

**File:** `components/ui/badge.tsx`

#### Variants

| Variant | Background | Text | Border |
|---------|------------|------|--------|
| `default` | `primary` | `primary-foreground` | none |
| `secondary` | `secondary` | `secondary-foreground` | none |
| `outline` | `transparent` | `foreground` | `border` |
| `destructive` | `destructive` | `white` | none |

#### Custom Status Badges

| Status | Background | Text | Use Case |
|--------|------------|------|----------|
| Success | `green-500/10` | `green-600` | Completed, Active |
| Warning | `yellow-500/10` | `yellow-600` | Pending, Due Soon |
| Error | `destructive/10` | `destructive` | Overdue, Failed |
| Info | `blue-500/10` | `blue-600` | In Progress |

#### Specs

| Property | Value |
|----------|-------|
| Height | 22px |
| Padding X | 10px |
| Padding Y | 2px |
| Font Size | 12px |
| Font Weight | 500 (medium) |
| Border Radius | 9999px (full) |

---

## Form Components

### Input

**File:** `components/ui/input.tsx`

#### States

| State | Border | Background | Ring |
|-------|--------|------------|------|
| Default | `input` | `background` | none |
| Focus | `ring` | `background` | 2px `ring` |
| Error | `destructive` | `background` | 2px `destructive` |
| Disabled | `input/50` | `muted` | none |

#### Specs

| Property | Value |
|----------|-------|
| Height | 40px |
| Padding X | 12px |
| Font Size | 14px (16px on mobile) |
| Border | 1px |
| Border Radius | 8px (`rounded-md`) |
| Placeholder Color | `muted-foreground` |

### Select

**File:** `components/ui/select.tsx`

#### Structure

```
┌─────────────────────────────────┬───┐
│ Placeholder / Selected Value    │ ▼ │  <- Trigger
└─────────────────────────────────┴───┘
     │
     ▼
┌─────────────────────────────────────┐
│ Option 1                        ✓   │  <- Content
├─────────────────────────────────────┤
│ Option 2                            │
├─────────────────────────────────────┤
│ Option 3                            │
└─────────────────────────────────────┘
```

#### Specs

| Property | Value |
|----------|-------|
| Trigger Height | 40px |
| Trigger Padding | 12px |
| Option Height | 36px |
| Option Padding | 8px 12px |
| Dropdown Max Height | 300px |
| Border Radius | 8px |

### Checkbox

**File:** `components/ui/checkbox.tsx`

#### States

| State | Border | Background | Check |
|-------|--------|------------|-------|
| Unchecked | `primary` | `background` | hidden |
| Checked | `primary` | `primary` | `primary-foreground` |
| Indeterminate | `primary` | `primary` | dash |
| Disabled | `muted` | `muted` | varies |

#### Specs

| Property | Value |
|----------|-------|
| Size | 16px x 16px |
| Border | 1px |
| Border Radius | 4px |
| Check Icon | 12px |

### Textarea

**File:** `components/ui/textarea.tsx`

#### Specs

| Property | Value |
|----------|-------|
| Min Height | 80px |
| Padding | 12px |
| Font Size | 14px |
| Border | 1px `input` |
| Border Radius | 8px |
| Resize | vertical |

---

## Navigation Components

### Sidebar

**File:** `components/ui/sidebar.tsx`

#### Structure

```
┌────────────────────┐
│ SidebarHeader      │ <- Logo, app name
├────────────────────┤
│                    │
│ SidebarContent     │ <- Nav items
│   SidebarGroup     │
│     SidebarItem    │
│     SidebarItem    │
│   SidebarGroup     │
│                    │
├────────────────────┤
│ SidebarFooter      │ <- User menu
└────────────────────┘
```

#### Specs

| Property | Expanded | Collapsed |
|----------|----------|-----------|
| Width | 256px | 64px |
| Background | `sidebar` |
| Border Right | 1px `sidebar-border` |
| Item Height | 40px |
| Item Padding | 12px 16px |
| Icon Size | 20px |

### Tabs

**File:** `components/ui/tabs.tsx`

#### Structure

```
┌─────────┬─────────┬─────────┐
│  Tab 1  │  Tab 2  │  Tab 3  │  <- TabsList
└─────────┴─────────┴─────────┘
┌─────────────────────────────┐
│                             │
│  Tab Content                │  <- TabsContent
│                             │
└─────────────────────────────┘
```

#### Specs

| Property | Value |
|----------|-------|
| Tab Height | 40px |
| Tab Padding | 12px 16px |
| Active Indicator | 2px bottom border |
| Background (list) | `muted` |
| Border Radius (list) | 8px |

### Breadcrumbs

**File:** `components/ui/breadcrumb.tsx`

#### Structure

```
Home > Section > Current Page
  │       │          │
  └── Link └── Link  └── Current (not clickable)
```

#### Specs

| Property | Value |
|----------|-------|
| Font Size | 14px |
| Link Color | `muted-foreground` |
| Current Color | `foreground` |
| Separator | "/" or ChevronRight |
| Gap | 8px |

### Pagination

**File:** `components/ui/pagination.tsx`

#### Structure

```
┌───┐ ┌───┬───┬───┬───┬───┐ ┌───┐
│ < │ │ 1 │ 2 │ 3 │...│10 │ │ > │
└───┘ └───┴───┴───┴───┴───┘ └───┘
```

#### Specs

| Property | Value |
|----------|-------|
| Button Size | 40px |
| Gap | 4px |
| Active Background | `primary` |
| Active Text | `primary-foreground` |

---

## Data Display Components

### Table

**File:** `components/ui/table.tsx`

#### Structure

```
┌──────────────────────────────────────────┐
│ Header 1      │ Header 2     │ Header 3  │ <- TableHeader
├───────────────┼──────────────┼───────────┤
│ Cell          │ Cell         │ Cell      │ <- TableBody
├───────────────┼──────────────┼───────────┤    TableRow
│ Cell          │ Cell         │ Cell      │    TableCell
└──────────────────────────────────────────┘
```

#### Specs

| Property | Value |
|----------|-------|
| Header Background | `muted/50` |
| Header Text | `muted-foreground` |
| Cell Padding | 16px |
| Row Border | 1px `border` |
| Hover Background | `muted/50` |

### Avatar

**File:** `components/ui/avatar.tsx`

#### Sizes

| Size | Dimensions | Font Size |
|------|------------|-----------|
| `sm` | 32px | 12px |
| `default` | 40px | 14px |
| `lg` | 48px | 16px |
| `xl` | 64px | 20px |

#### Specs

| Property | Value |
|----------|-------|
| Border Radius | 9999px (full) |
| Fallback Background | `muted` |
| Fallback Text | `muted-foreground` |
| Border | none (optional 2px) |

### Calendar

**File:** `components/ui/calendar.tsx`

#### Structure

```
┌─────────────────────────────────┐
│  <  │   January 2026    │  >   │ <- Navigation
├─────────────────────────────────┤
│ Su │ Mo │ Tu │ We │ Th │ Fr │ Sa│ <- Weekdays
├────┼────┼────┼────┼────┼────┼───┤
│    │    │    │  1 │  2 │  3 │ 4 │ <- Days
│  5 │  6 │  7 │  8 │  9 │ 10 │11 │
│ 12 │ 13 │ 14 │ 15 │ 16 │ 17 │18 │
│ 19 │ 20 │ 21 │ 22 │ 23 │ 24 │25 │
│ 26 │ 27 │ 28 │ 29 │ 30 │ 31 │   │
└─────────────────────────────────┘
```

#### Specs

| Property | Value |
|----------|-------|
| Day Cell Size | 36px |
| Selected Background | `primary` |
| Today Background | `accent` |
| Gap | 2px |

### Progress

**File:** `components/ui/progress.tsx`

#### Specs

| Property | Value |
|----------|-------|
| Height | 8px |
| Background | `muted` |
| Fill | `primary` |
| Border Radius | 9999px |
| Animation | 300ms ease-out |

---

## Feedback Components

### Alert

**File:** `components/ui/alert.tsx`

#### Variants

| Variant | Background | Border | Icon |
|---------|------------|--------|------|
| `default` | `background` | `border` | Info |
| `destructive` | `destructive/10` | `destructive/50` | AlertTriangle |

#### Specs

| Property | Value |
|----------|-------|
| Padding | 16px |
| Border | 1px |
| Border Radius | 8px |
| Icon Size | 16px |
| Title Font | 14px semibold |
| Description Font | 14px |

### Dialog

**File:** `components/ui/dialog.tsx`

#### Structure

```
┌─────────────────────────────────────────┐
│ Dialog Title                        [X] │ <- DialogHeader
├─────────────────────────────────────────┤
│                                         │
│ Dialog Content                          │ <- DialogContent
│                                         │
├─────────────────────────────────────────┤
│                    [Cancel] [Confirm]   │ <- DialogFooter
└─────────────────────────────────────────┘
```

#### Specs

| Property | Value |
|----------|-------|
| Max Width | 500px (sm), 600px (default), 800px (lg) |
| Padding | 24px |
| Border Radius | 12px |
| Overlay | black/80 |
| Animation | scale 95% -> 100%, fade |

### Toast (Sonner)

**File:** Uses `sonner` library

#### Specs

| Property | Value |
|----------|-------|
| Width | 356px |
| Padding | 16px |
| Border Radius | 8px |
| Position | Bottom right |
| Duration | 4000ms |
| Gap (stacked) | 8px |

### Skeleton

**File:** `components/ui/skeleton.tsx`

#### Specs

| Property | Value |
|----------|-------|
| Background | `muted` |
| Border Radius | 8px |
| Animation | Pulse (2s infinite) |

---

## Domain-Specific Components

### Entity Card

**File:** `components/shared/EntityCard.tsx`

Used for displaying lessons, songs, assignments, and users.

#### Structure

```
┌─────────────────────────────────────────┐
│ [Icon]  Entity Name           [Status]  │
│         Subtitle / Metadata             │
├─────────────────────────────────────────┤
│ Key-Value pairs or description          │
├─────────────────────────────────────────┤
│ [Action 1] [Action 2]                   │
└─────────────────────────────────────────┘
```

### Stats Card

**File:** `components/dashboard/StatsCard.tsx`

#### Structure

```
┌─────────────────────────────────────────┐
│ [Icon]  Stat Label                      │
│                                         │
│         42                              │ <- Large number
│         +12% from last month            │ <- Trend
└─────────────────────────────────────────┘
```

### Status Badge (Custom)

**File:** `components/shared/StatusBadge.tsx`

| Status | Color | Icon |
|--------|-------|------|
| Active | Green | CheckCircle |
| Pending | Yellow | Clock |
| Completed | Green | CheckCircle2 |
| Overdue | Red | AlertCircle |
| Draft | Gray | FileEdit |
| Cancelled | Gray | XCircle |

### Timeline

**File:** `components/shared/HistoryTimeline.tsx`

#### Structure

```
● Event 1 - Jan 15, 2026 at 10:30 AM
│   Description of what happened
│
● Event 2 - Jan 14, 2026 at 3:45 PM
│   Description of what happened
│
● Event 3 - Jan 13, 2026 at 9:00 AM
    Description of what happened
```

---

## Component Properties

### Naming Convention

Use consistent naming for Figma components:

```
[Category] / [Component] / [Variant] / [State]

Examples:
Core / Button / Primary / Default
Core / Button / Primary / Hover
Forms / Input / Default / Focus
Navigation / Sidebar / Expanded / Active Item
```

### Boolean Properties

| Property | Description |
|----------|-------------|
| `isDisabled` | Disabled state |
| `isLoading` | Loading state |
| `hasIcon` | Show icon |
| `isFullWidth` | Full width |
| `isActive` | Active/selected state |

### Variant Properties

Define as dropdown selections:

```
variant: default | secondary | outline | ghost | destructive
size: sm | default | lg
state: default | hover | focus | active | disabled
```

### Instance Swaps

Enable instance swapping for:

- Icons (from Lucide icon library)
- Avatars (placeholder vs image)
- Status badges (different statuses)

---

## Quick Reference

### Common Measurements

| Element | Desktop | Mobile |
|---------|---------|--------|
| Button Height | 40px | 44px |
| Input Height | 40px | 44px |
| Touch Target | 40px | 44px min |
| Card Padding | 24px | 16px |
| Section Gap | 24px | 16px |
| Grid Gap | 24px | 12px |

### Common Border Radius

| Use Case | Value | Tailwind |
|----------|-------|----------|
| Buttons | 8px | `rounded-md` |
| Cards | 14px | `rounded-xl` |
| Inputs | 8px | `rounded-md` |
| Badges | 9999px | `rounded-full` |
| Modals | 12px | `rounded-lg` |

### Z-Index Scale

| Layer | Z-Index |
|-------|---------|
| Base | 0 |
| Dropdown | 50 |
| Sticky | 40 |
| Modal | 50 |
| Popover | 50 |
| Toast | 100 |
| Tooltip | 50 |
