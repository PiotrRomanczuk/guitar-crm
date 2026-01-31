# Figma Responsive Frames Guide

This document provides detailed specifications for creating responsive designs in Figma that align with the Guitar CRM breakpoint system.

## Table of Contents

1. [Frame Presets](#frame-presets)
2. [Layout Grid Configuration](#layout-grid-configuration)
3. [Responsive Patterns](#responsive-patterns)
4. [Device-Specific Guidelines](#device-specific-guidelines)
5. [Auto Layout Best Practices](#auto-layout-best-practices)
6. [Constraints & Resizing](#constraints--resizing)

---

## Frame Presets

### Primary Device Frames

Create these frames for every major page design:

| Frame Name | Width | Height | Device | Priority |
|------------|-------|--------|--------|----------|
| `Mobile - iPhone 17 Pro Max` | 430px | 932px | iPhone 17 Pro Max | High |
| `Mobile - iPhone SE` | 375px | 667px | iPhone SE | Medium |
| `Tablet - Portrait` | 768px | 1024px | iPad Mini | Medium |
| `Tablet - Landscape` | 1024px | 768px | iPad Mini | Low |
| `Desktop - Standard` | 1280px | 800px | Laptop | High |
| `Desktop - Large` | 1440px | 900px | Large Laptop | Medium |
| `Portrait Display` | 1080px | 1920px | Vertical Monitor | Medium |
| `Ultrawide` | 3440px | 1440px | Ultrawide Monitor | High |

### Breakpoint Reference

| Breakpoint | Min Width | Tailwind | Frame Width |
|------------|-----------|----------|-------------|
| Base | 0px | (default) | 375px |
| xs | 475px | `xs:` | 475px |
| sm | 640px | `sm:` | 640px |
| md | 768px | `md:` | 768px |
| lg | 1024px | `lg:` | 1024px |
| xl | 1280px | `xl:` | 1280px |
| 2xl | 1536px | `2xl:` | 1536px |
| ultrawide | 2560px | `ultrawide:` | 3440px |

---

## Layout Grid Configuration

### Mobile (430px)

```
Frame: 430 x 932
Grid:
  - Columns: 4
  - Gutter: 16px
  - Margin: 12px
  - Column Width: 91.5px
```

**Figma Settings:**
- Type: Columns
- Count: 4
- Gutter: 16
- Margin: 12
- Color: #FF0000 @ 10%

### Tablet Portrait (768px)

```
Frame: 768 x 1024
Grid:
  - Columns: 8
  - Gutter: 24px
  - Margin: 24px
  - Column Width: 69px
```

**Figma Settings:**
- Type: Columns
- Count: 8
- Gutter: 24
- Margin: 24
- Color: #00FF00 @ 10%

### Desktop (1280px)

```
Frame: 1280 x 800
Grid:
  - Columns: 12
  - Gutter: 24px
  - Margin: 32px
  - Column Width: 79.33px
```

**Figma Settings:**
- Type: Columns
- Count: 12
- Gutter: 24
- Margin: 32
- Color: #0000FF @ 10%

### Portrait Display (1080px)

```
Frame: 1080 x 1920
Grid:
  - Columns: 6
  - Gutter: 24px
  - Margin: 40px
  - Column Width: 146.67px
```

**Figma Settings:**
- Type: Columns
- Count: 6
- Gutter: 24
- Margin: 40
- Color: #FF00FF @ 10%

### Ultrawide (3440px)

```
Frame: 3440 x 1440
Grid:
  - Columns: 16
  - Gutter: 32px
  - Margin: 48px
  - Column Width: 177.5px
```

**Figma Settings:**
- Type: Columns
- Count: 16
- Gutter: 32
- Margin: 48
- Color: #00FFFF @ 10%

---

## Responsive Patterns

### Navigation

| Breakpoint | Navigation Type | Implementation |
|------------|-----------------|----------------|
| Mobile (< 768px) | Top bar + Hamburger menu | Sheet/Drawer |
| Tablet (768px - 1023px) | Top horizontal nav | Full nav bar |
| Desktop (>= 1024px) | Left sidebar | Collapsible sidebar |
| Ultrawide (>= 2560px) | Left sidebar (expanded) | Wide sidebar |

#### Mobile Navigation Frame

```
┌─────────────────────────────────────────┐
│ [=]  Guitar CRM              [Avatar]   │ <- 56px height
├─────────────────────────────────────────┤
│                                         │
│           Page Content                  │
│                                         │
└─────────────────────────────────────────┘
```

#### Desktop Navigation Frame

```
┌──────────┬──────────────────────────────┐
│          │                              │
│ Sidebar  │       Page Content           │
│  256px   │                              │
│          │                              │
│          │                              │
│          │                              │
└──────────┴──────────────────────────────┘
```

### Card Grids

| Breakpoint | Columns | Gap | Tailwind |
|------------|---------|-----|----------|
| Mobile (< 475px) | 1 | 12px | `grid-cols-1 gap-3` |
| xs (475px+) | 2 | 12px | `xs:grid-cols-2 gap-3` |
| sm (640px+) | 2 | 16px | `sm:grid-cols-2 sm:gap-4` |
| md (768px+) | 3 | 16px | `md:grid-cols-3 gap-4` |
| lg (1024px+) | 3-4 | 24px | `lg:grid-cols-4 lg:gap-6` |
| ultrawide (2560px+) | 5-6 | 32px | `ultrawide:grid-cols-6 ultrawide:gap-8` |

### Stats Grid

| Breakpoint | Columns | Layout |
|------------|---------|--------|
| Mobile | 2 | 2x2 grid |
| Tablet | 3-4 | Single row |
| Desktop | 5 | Single row |
| Ultrawide | 10 | Extended row |

**Tailwind:** `grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 ultrawide:grid-cols-10`

### Forms

| Breakpoint | Layout | Field Width |
|------------|--------|-------------|
| Mobile | Single column | 100% |
| Tablet | Single column | 100% (max 500px) |
| Desktop | Two column where logical | 50% each |
| Ultrawide | Two column, centered | max-width container |

---

## Device-Specific Guidelines

### iPhone 17 Pro Max (430 x 932)

**Design Considerations:**

1. **Safe Areas**
   - Top: 59px (Dynamic Island)
   - Bottom: 34px (Home indicator)

2. **Touch Targets**
   - Minimum: 44 x 44px
   - Recommended: 48 x 48px

3. **Typography**
   - Body text: 14px minimum
   - Inputs: 16px (prevents zoom)

4. **Spacing**
   - Container padding: 12px
   - Card padding: 12-16px
   - Section gap: 16px

5. **Components**
   - Buttons: Full width
   - Cards: Full width with 12px margin
   - Modals: Bottom sheet (Drawer)

**Frame Template:**

```
┌─────────────────────────────────────────┐
│           Status Bar (59px)             │
├─────────────────────────────────────────┤
│         Navigation (56px)               │
├─────────────────────────────────────────┤
│                                         │
│                                         │
│         Scrollable Content              │
│         (padding: 12px)                 │
│                                         │
│                                         │
├─────────────────────────────────────────┤
│         Home Indicator (34px)           │
└─────────────────────────────────────────┘
```

### Portrait Display (1080 x 1920)

**Design Considerations:**

1. **Vertical Optimization**
   - Maximize vertical content
   - Use single/dual column layouts
   - Larger content areas

2. **Typography**
   - Can use larger headings
   - More content visible at once

3. **Navigation**
   - Left sidebar works well
   - Consider vertical nav

4. **Components**
   - Cards can be taller
   - Tables with more visible rows
   - Scrolling is natural

**Frame Template:**

```
┌──────────┬──────────────────────────────┐
│          │                              │
│ Sidebar  │    Page Title                │
│  200px   │                              │
│          │    ┌────────┐ ┌────────┐    │
│          │    │ Card 1 │ │ Card 2 │    │
│          │    └────────┘ └────────┘    │
│          │                              │
│          │    ┌─────────────────────┐  │
│          │    │                     │  │
│          │    │    Main Content     │  │
│          │    │    (tall card)      │  │
│          │    │                     │  │
│          │    └─────────────────────┘  │
│          │                              │
│          │    ┌────────┐ ┌────────┐    │
│          │    │ Card 3 │ │ Card 4 │    │
│          │    └────────┘ └────────┘    │
│          │                              │
└──────────┴──────────────────────────────┘
```

### Ultrawide (3440 x 1440)

**Design Considerations:**

1. **Horizontal Space**
   - Use multi-column layouts (4-10 columns)
   - Side-by-side comparisons
   - Multiple panels visible

2. **Content Width**
   - Don't stretch content too wide
   - Use max-width containers
   - Fill space with more columns

3. **Navigation**
   - Expanded sidebar with labels
   - Can show sub-navigation

4. **Components**
   - Tables with more columns visible
   - Dashboards with more widgets
   - Side panels for detail views

**Frame Template:**

```
┌──────────┬───────────────────────────────────────────────────────────────────┐
│          │                                                                   │
│ Sidebar  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐    │
│  280px   │  │ Stat 1  │ │ Stat 2  │ │ Stat 3  │ │ Stat 4  │ │ Stat 5  │    │
│          │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘    │
│          │                                                                   │
│          │  ┌─────────────────────────────┐ ┌─────────────────────────────┐│
│          │  │                             │ │                             ││
│          │  │        Main Chart           │ │       Secondary View        ││
│          │  │                             │ │                             ││
│          │  └─────────────────────────────┘ └─────────────────────────────┘│
│          │                                                                   │
│          │  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐   │
│          │  │Card 1 │ │Card 2 │ │Card 3 │ │Card 4 │ │Card 5 │ │Card 6 │   │
│          │  └───────┘ └───────┘ └───────┘ └───────┘ └───────┘ └───────┘   │
│          │                                                                   │
└──────────┴───────────────────────────────────────────────────────────────────┘
```

---

## Auto Layout Best Practices

### Setting Up Auto Layout

1. **Direction**
   - Vertical for stacked content
   - Horizontal for inline elements

2. **Spacing**
   - Use consistent spacing tokens
   - Enable "Space between" for justified layouts

3. **Padding**
   - Match code padding values
   - Use responsive padding (smaller on mobile)

4. **Alignment**
   - Left-align most content
   - Center for modals and empty states

### Responsive Auto Layout

**Mobile-First Approach:**

1. Start with mobile frame
2. Set auto layout to vertical, fill width
3. Duplicate to larger frame
4. Adjust direction to horizontal where needed
5. Update spacing for larger screens

**Example: Card Grid**

```
Mobile (vertical stack):
┌─────────────┐
│   Card 1    │
├─────────────┤
│   Card 2    │
├─────────────┤
│   Card 3    │
└─────────────┘

Desktop (horizontal grid):
┌─────────┬─────────┬─────────┐
│ Card 1  │ Card 2  │ Card 3  │
└─────────┴─────────┴─────────┘
```

### Auto Layout Settings by Component

| Component | Direction | Gap | Padding | Align |
|-----------|-----------|-----|---------|-------|
| Page | Vertical | 24px | 16-32px | Stretch |
| Card | Vertical | 0 | 16-24px | Stretch |
| Card Header | Horizontal | 12px | 16px | Center |
| Button Group | Horizontal | 8px | 0 | Center |
| Form | Vertical | 16px | 0 | Stretch |
| Nav Item | Horizontal | 12px | 12px 16px | Center |

---

## Constraints & Resizing

### Constraint Types

| Constraint | Use Case |
|------------|----------|
| Left | Fixed left position |
| Right | Fixed right position |
| Left & Right | Stretch horizontally |
| Top | Fixed top position |
| Bottom | Fixed bottom position |
| Top & Bottom | Stretch vertically |
| Center | Centered in frame |
| Scale | Proportional scaling |

### Common Patterns

**Fixed Sidebar + Fluid Content:**
```
Sidebar: Left, Top & Bottom (fixed width)
Content: Left & Right, Top & Bottom (fluid)
```

**Centered Modal:**
```
Modal: Center horizontally, Center vertically
Content: Fixed width (max-width)
```

**Sticky Header:**
```
Header: Left & Right, Top (fixed height)
Content: Left & Right, Top & Bottom
```

### Resizing Behavior

| Element | Horizontal | Vertical |
|---------|------------|----------|
| Container | Fill | Hug |
| Card | Fill | Hug |
| Button | Hug (or Fill on mobile) | Fixed |
| Input | Fill | Fixed |
| Table | Fill | Hug |
| Modal | Fixed (max-width) | Hug |

---

## Quick Reference

### Spacing Values

| Mobile | Tablet | Desktop | Ultrawide | Token |
|--------|--------|---------|-----------|-------|
| 8px | 12px | 16px | 24px | Gap (sm) |
| 12px | 16px | 24px | 32px | Gap (md) |
| 16px | 24px | 32px | 48px | Gap (lg) |
| 12px | 16px | 24px | 32px | Padding (card) |
| 12px | 24px | 32px | 48px | Padding (page) |

### Font Sizes

| Mobile | Desktop | Use |
|--------|---------|-----|
| 24px | 36px | H1 |
| 20px | 24px | H2 |
| 18px | 18px | H3 |
| 14px | 14px | Body |
| 12px | 12px | Small |

### Common Widths

| Element | Value |
|---------|-------|
| Sidebar (collapsed) | 64px |
| Sidebar (expanded) | 256px |
| Modal (sm) | 400px |
| Modal (default) | 500px |
| Modal (lg) | 700px |
| Form input | 100% (max 400px) |
| Content max-width | 1280px |
| Content max-width (admin) | 1536px |
