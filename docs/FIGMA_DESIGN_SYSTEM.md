# Figma Design System Guide

This document provides comprehensive guidance for using Figma with the Guitar CRM design system. It ensures design-to-code consistency and streamlines the development workflow.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Design Tokens](#design-tokens)
3. [Color System](#color-system)
4. [Typography](#typography)
5. [Spacing & Layout](#spacing--layout)
6. [Component Library](#component-library)
7. [Responsive Frames](#responsive-frames)
8. [Prototyping Guidelines](#prototyping-guidelines)
9. [Developer Handoff](#developer-handoff)
10. [Resources](#resources)

---

## Getting Started

### Prerequisites

1. **Figma Account** - Free or paid account at [figma.com](https://figma.com)
2. **shadcn/ui Figma Kit** - Import the community file for pre-built components
3. **Geist Font** - Install from [vercel.com/font](https://vercel.com/font)

### Project Setup

1. Create a new Figma project named `Guitar CRM Design System`
2. Set up the following pages:
   - **Cover** - Project overview and links
   - **Design Tokens** - Colors, typography, spacing
   - **Components** - All UI components
   - **Pages** - Full page designs
   - **Prototypes** - Interactive flows
   - **Archive** - Deprecated designs

### Figma Plugins (Recommended)

| Plugin | Purpose |
|--------|---------|
| **Tokens Studio** | Sync design tokens with code |
| **Figma to Code** | Export to Tailwind CSS |
| **Iconify** | Access Lucide icons |
| **Contrast** | Check accessibility |
| **Autoflow** | Create user flow diagrams |

---

## Design Tokens

Design tokens are the visual design atoms of the design system. They are named entities that store visual design attributes.

### Importing Tokens

Use the `scripts/figma-tokens.json` file to import tokens into Figma via Tokens Studio plugin.

### Token Categories

```
├── colors/
│   ├── light/
│   │   ├── background
│   │   ├── foreground
│   │   ├── primary
│   │   ├── secondary
│   │   ├── muted
│   │   ├── accent
│   │   ├── destructive
│   │   ├── success
│   │   ├── warning
│   │   └── chart-1 through chart-5
│   └── dark/
│       └── (same structure)
├── typography/
│   ├── font-family
│   ├── font-size
│   ├── font-weight
│   └── line-height
├── spacing/
│   ├── base (4px)
│   └── scale (0.5, 1, 1.5, 2, 3, 4, 6, 8, 12, 16)
├── radius/
│   ├── sm
│   ├── md
│   ├── lg
│   └── xl
└── shadows/
    ├── sm
    ├── md
    ├── glow
    └── card
```

---

## Color System

### Light Mode Palette

| Token | OKLCH Value | Hex Equivalent | Usage |
|-------|-------------|----------------|-------|
| `background` | `oklch(1 0 0)` | `#FFFFFF` | Page background |
| `foreground` | `oklch(0.145 0 0)` | `#1A1A1A` | Primary text |
| `card` | `oklch(1 0 0)` | `#FFFFFF` | Card backgrounds |
| `primary` | `oklch(0.205 0 0)` | `#2D2D2D` | Primary buttons |
| `primary-foreground` | `oklch(0.985 0 0)` | `#FAFAFA` | Text on primary |
| `secondary` | `oklch(0.97 0 0)` | `#F5F5F5` | Secondary elements |
| `muted` | `oklch(0.97 0 0)` | `#F5F5F5` | Muted backgrounds |
| `muted-foreground` | `oklch(0.556 0 0)` | `#737373` | Muted text |
| `accent` | `oklch(0.97 0 0)` | `#F5F5F5` | Accent backgrounds |
| `destructive` | `oklch(0.577 0.245 27.325)` | `#DC2626` | Error states |
| `border` | `oklch(0.922 0 0)` | `#E5E5E5` | Borders |
| `input` | `oklch(0.922 0 0)` | `#E5E5E5` | Input borders |
| `ring` | `oklch(0.708 0 0)` | `#A3A3A3` | Focus rings |

### Dark Mode Palette

| Token | HSL Value | Hex Equivalent | Usage |
|-------|-----------|----------------|-------|
| `background` | `hsl(20 14% 4%)` | `#0D0B0A` | Page background |
| `foreground` | `hsl(40 20% 95%)` | `#F7F5F2` | Primary text |
| `card` | `hsl(20 10% 8%)` | `#161412` | Card backgrounds |
| `primary` | `hsl(38 92% 50%)` | `#F5A623` | Primary/accent (gold) |
| `primary-foreground` | `hsl(20 14% 4%)` | `#0D0B0A` | Text on primary |
| `secondary` | `hsl(20 10% 14%)` | `#262220` | Secondary elements |
| `muted` | `hsl(20 10% 18%)` | `#302C28` | Muted backgrounds |
| `muted-foreground` | `hsl(40 10% 55%)` | `#9A9080` | Muted text |
| `accent` | `hsl(38 92% 50%)` | `#F5A623` | Accent (gold) |
| `destructive` | `hsl(0 84% 60%)` | `#EF4444` | Error states |
| `border` | `hsl(20 10% 16%)` | `#2A2624` | Borders |
| `ring` | `hsl(38 92% 50%)` | `#F5A623` | Focus rings (gold) |

### Chart Colors

| Token | Light Mode | Dark Mode |
|-------|------------|-----------|
| `chart-1` | `#E67E22` | `#6366F1` |
| `chart-2` | `#0891B2` | `#22C55E` |
| `chart-3` | `#4B5563` | `#F5A623` |
| `chart-4` | `#EAB308` | `#A855F7` |
| `chart-5` | `#F59E0B` | `#EF4444` |

### Status Colors

| Status | Light Mode | Dark Mode | Usage |
|--------|------------|-----------|-------|
| Success | `hsl(142 76% 36%)` | Same | Completed, active |
| Warning | `hsl(38 92% 50%)` | Same | Pending, due soon |
| Destructive | `hsl(0 84% 60%)` | Same | Error, overdue |

### Creating Color Styles in Figma

1. Open the **Design** panel
2. Click **+** next to Local styles
3. Create a new color style
4. Name using the token path: `colors/light/primary`
5. Set the hex value from the table above
6. Add description: "Primary button and action color"

---

## Typography

### Font Family

| Token | Value | Figma Setting |
|-------|-------|---------------|
| `font-sans` | Geist | Geist Variable |
| `font-mono` | Geist Mono | Geist Mono Variable |

### Type Scale

| Style | Size | Weight | Line Height | Tracking | Tailwind Class |
|-------|------|--------|-------------|----------|----------------|
| **H1 (Page)** | 36px | Bold (700) | 40px | -0.025em | `text-4xl font-bold tracking-tight` |
| **H1 Mobile** | 24px | Bold (700) | 32px | -0.025em | `text-2xl font-bold tracking-tight` |
| **H2 (Section)** | 24px | Semibold (600) | 32px | -0.025em | `text-2xl font-semibold tracking-tight` |
| **H2 Mobile** | 20px | Semibold (600) | 28px | -0.025em | `text-xl font-semibold tracking-tight` |
| **H3 (Card)** | 18px | Semibold (600) | 28px | 0 | `text-lg font-semibold` |
| **H4 (Subsection)** | 16px | Medium (500) | 24px | 0 | `text-base font-medium` |
| **Body** | 14px | Regular (400) | 20px | 0 | `text-sm` |
| **Body Large** | 16px | Regular (400) | 24px | 0 | `text-base` |
| **Small** | 12px | Regular (400) | 16px | 0 | `text-xs` |
| **Label** | 12px | Medium (500) | 16px | 0.05em | `text-xs font-medium uppercase tracking-wider` |

### Creating Text Styles in Figma

1. Select a text layer with desired properties
2. Click **+** in the Text styles section
3. Name using pattern: `typography/h1-desktop`
4. Include responsive variants: `typography/h1-mobile`

---

## Spacing & Layout

### Base Unit

The spacing system uses **4px** as the base unit.

### Spacing Scale

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| `spacing-0.5` | 2px | `p-0.5` | Micro spacing |
| `spacing-1` | 4px | `p-1` | Tight spacing |
| `spacing-1.5` | 6px | `p-1.5` | Small spacing |
| `spacing-2` | 8px | `p-2` | Compact spacing |
| `spacing-3` | 12px | `p-3` | Default spacing |
| `spacing-4` | 16px | `p-4` | Standard spacing |
| `spacing-5` | 20px | `p-5` | Comfortable spacing |
| `spacing-6` | 24px | `p-6` | Generous spacing |
| `spacing-8` | 32px | `p-8` | Section spacing |
| `spacing-10` | 40px | `p-10` | Large spacing |
| `spacing-12` | 48px | `p-12` | Extra large spacing |
| `spacing-16` | 64px | `p-16` | Page sections |

### Border Radius

| Token | Value | Tailwind |
|-------|-------|----------|
| `radius-sm` | 6px | `rounded-sm` |
| `radius-md` | 8px | `rounded-md` |
| `radius-lg` | 10px | `rounded-lg` |
| `radius-xl` | 14px | `rounded-xl` |

### Layout Grid

Configure Figma layout grids for each frame size:

**Mobile (430px)**
- Columns: 4
- Gutter: 16px
- Margin: 12px

**Tablet (768px)**
- Columns: 8
- Gutter: 24px
- Margin: 24px

**Desktop (1280px)**
- Columns: 12
- Gutter: 24px
- Margin: 32px

**Ultrawide (3440px)**
- Columns: 16
- Gutter: 32px
- Margin: 48px

---

## Component Library

### Core Components to Create

Map each shadcn/ui component to a Figma component:

#### Buttons

| Variant | Properties |
|---------|------------|
| Default | `bg: primary`, `text: primary-foreground`, `radius: lg` |
| Secondary | `bg: secondary`, `text: secondary-foreground`, `radius: lg` |
| Outline | `border: input`, `bg: transparent`, `radius: lg` |
| Ghost | `bg: transparent`, `text: foreground`, `radius: lg` |
| Destructive | `bg: destructive`, `text: white`, `radius: lg` |

**Button Sizes:**
- Small: 32px height, 12px padding, 14px text
- Default: 40px height, 16px padding, 14px text
- Large: 48px height, 24px padding, 16px text

#### Inputs

| State | Border | Background |
|-------|--------|------------|
| Default | `border` | `background` |
| Focus | `ring` | `background` |
| Error | `destructive` | `background` |
| Disabled | `border/50` | `muted` |

**Input Size:** 40px height, 12px padding, 14px text

#### Cards

```
┌─────────────────────────────────────┐
│  Card Header (optional)             │  <- border-b, p-4
├─────────────────────────────────────┤
│                                     │
│  Card Content                       │  <- p-4 to p-6
│                                     │
├─────────────────────────────────────┤
│  Card Footer (optional)             │  <- bg-muted/50, p-4
└─────────────────────────────────────┘

bg: card
border: border
radius: xl (14px)
```

#### Badges

| Variant | Background | Text |
|---------|------------|------|
| Default | `primary` | `primary-foreground` |
| Secondary | `secondary` | `secondary-foreground` |
| Outline | `transparent` | `foreground` |
| Success | `green-500/10` | `green-600` |
| Warning | `yellow-500/10` | `yellow-600` |
| Destructive | `destructive/10` | `destructive` |

### Component Properties

Set up Figma component properties for flexibility:

```
Button
├── Variant (Default, Secondary, Outline, Ghost, Destructive)
├── Size (sm, default, lg)
├── Icon (leading, trailing, none)
├── State (default, hover, focus, disabled)
└── Full Width (true, false)
```

### Component Naming Convention

Use a consistent naming pattern:
```
ComponentName / Variant / Size / State
Button / Primary / Default / Hover
Input / Default / Default / Focus
Card / With Header / Default / Default
```

---

## Responsive Frames

### Frame Templates

Create these preset frames for consistent design:

| Frame Name | Dimensions | Description |
|------------|------------|-------------|
| **Mobile Portrait** | 430 x 932 | iPhone 17 Pro Max |
| **Mobile Landscape** | 932 x 430 | iPhone 17 Pro Max rotated |
| **Tablet Portrait** | 768 x 1024 | iPad Mini |
| **Tablet Landscape** | 1024 x 768 | iPad Mini rotated |
| **Desktop** | 1280 x 800 | Standard laptop |
| **Desktop Large** | 1440 x 900 | Large laptop |
| **Portrait Display** | 1080 x 1920 | Vertical monitor |
| **Ultrawide** | 3440 x 1440 | Ultrawide monitor |

### Breakpoint Reference

| Breakpoint | Min Width | Tailwind Prefix |
|------------|-----------|-----------------|
| Mobile | 0px | (default) |
| xs | 475px | `xs:` |
| sm | 640px | `sm:` |
| md | 768px | `md:` |
| lg | 1024px | `lg:` |
| xl | 1280px | `xl:` |
| 2xl | 1536px | `2xl:` |
| Ultrawide | 2560px | `ultrawide:` |

### Responsive Design Checklist

For each page design, create frames for:

- [ ] Mobile (430px) - Touch-first, single column
- [ ] Tablet (768px) - Two column where appropriate
- [ ] Desktop (1280px) - Full layout with sidebar
- [ ] Ultrawide (3440px) - Extended grid layout

---

## Prototyping Guidelines

### Interaction Patterns

#### Navigation
- **Sidebar Toggle**: Slide in/out with 300ms ease
- **Page Transitions**: Fade with 200ms ease
- **Modal Open**: Scale from 95% + fade, 200ms ease-out
- **Drawer Open**: Slide from bottom, 300ms ease-out

#### Micro-interactions
- **Button Hover**: Background darken 10%, 150ms
- **Button Press**: Scale to 98%, 100ms
- **Card Hover**: Border color to primary/30, 300ms
- **Input Focus**: Ring appear, 150ms

### Prototype Flows to Create

1. **Authentication Flow**
   - Sign In → Dashboard
   - Sign Up → Email Verification → Onboarding → Dashboard
   - Forgot Password → Reset Email → New Password

2. **Lesson Management Flow**
   - Dashboard → Lessons List → Create Lesson → Lesson Detail
   - Lesson Detail → Edit Lesson → Save

3. **Song Library Flow**
   - Dashboard → Songs → Search/Filter → Song Detail
   - Song Detail → Add to Assignment

4. **Assignment Flow**
   - Dashboard → Assignments → Create Assignment → Select Songs
   - Assignment Detail → Mark Complete

5. **User Management Flow** (Admin)
   - Dashboard → Users → User Detail → Edit Role
   - Users → Create User → Send Invite

### Animation Specs

| Animation | Duration | Easing | Trigger |
|-----------|----------|--------|---------|
| Fade In | 500ms | ease-out | On load |
| Slide Up | 300ms | ease-out | On load |
| Accordion Open | 200ms | ease-out | On click |
| Accordion Close | 200ms | ease-out | On click |
| Hover Scale | 150ms | ease-in-out | On hover |

---

## Developer Handoff

### Inspection Guidelines

When inspecting designs in Figma Dev Mode:

1. **Spacing**: Always use the spacing scale (multiples of 4px)
2. **Colors**: Reference token names, not hex values
3. **Typography**: Use the defined text styles
4. **Components**: Check component properties for variants

### Export Settings

**Icons**
- Format: SVG
- Size: 24x24 (default), 16x16 (small), 32x32 (large)
- Color: currentColor

**Images**
- Format: PNG for photos, SVG for illustrations
- Resolution: 2x for retina displays
- Compression: Optimized

### Code Generation

Use the following mappings when translating Figma to code:

| Figma Property | Tailwind Class |
|----------------|----------------|
| Auto Layout Gap: 8 | `gap-2` |
| Auto Layout Gap: 12 | `gap-3` |
| Auto Layout Gap: 16 | `gap-4` |
| Padding: 12 | `p-3` |
| Padding: 16 | `p-4` |
| Padding: 24 | `p-6` |
| Corner Radius: 10 | `rounded-lg` |
| Corner Radius: 14 | `rounded-xl` |

### Handoff Checklist

Before handing off designs:

- [ ] All components use design tokens
- [ ] Responsive variants created
- [ ] Interactive states defined (hover, focus, active, disabled)
- [ ] Spacing uses 4px grid
- [ ] Colors reference system tokens
- [ ] Typography uses text styles
- [ ] Auto Layout configured correctly
- [ ] Component properties documented
- [ ] Prototype flows complete
- [ ] Accessibility notes added

---

## Resources

### Official Links
- [Figma Community - shadcn/ui](https://www.figma.com/community/file/1203061493325953101)
- [Geist Font](https://vercel.com/font)
- [Lucide Icons](https://lucide.dev)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

### Project Files
- `scripts/figma-tokens.json` - Export tokens for Tokens Studio
- `docs/UI_STANDARDS.md` - Code implementation standards
- `docs/RESPONSIVE_DESIGN.md` - Responsive guidelines
- `app/globals.css` - CSS custom properties source

### Figma Templates
Create and maintain these template files:
- `Guitar CRM - Design System` - Tokens and components
- `Guitar CRM - Pages` - All page designs
- `Guitar CRM - Prototypes` - Interactive flows

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-31 | 1.0.0 | Initial Figma design system documentation |
