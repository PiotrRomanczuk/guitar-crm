# Figma Design Tools

This directory contains scripts and assets for integrating Figma with the Guitar CRM design system.

## Contents

| File | Description |
|------|-------------|
| `generate-tokens.ts` | Script to generate Figma-compatible design tokens |
| `figma-tokens.json` | Pre-generated tokens file for Figma Tokens Studio |

## Using Design Tokens in Figma

### Prerequisites

1. Install the [Tokens Studio for Figma](https://www.figma.com/community/plugin/843461159747178978) plugin
2. Open your Figma design file

### Importing Tokens

1. Open Figma and go to **Plugins > Tokens Studio for Figma**
2. In the plugin, click the **Settings** icon (gear)
3. Select **Import** from the menu
4. Choose the `figma-tokens.json` file from this directory
5. Click **Import** to load all design tokens

### Token Structure

The tokens file includes:

```
guitar-crm/
├── colors/
│   ├── light/          # Light mode color palette
│   └── dark/           # Dark mode color palette (gold accent)
├── typography/
│   ├── fontFamilies/   # Geist, Geist Mono
│   ├── fontWeights/    # regular, medium, semibold, bold
│   ├── fontSize/       # xs through 4xl
│   ├── lineHeight/     # tight, snug, normal, relaxed
│   └── letterSpacing/  # tight, normal, wide, wider
├── spacing/            # 0 through 24 (4px base unit)
├── borderRadius/       # none, sm, md, lg, xl, 2xl, full
├── boxShadow/          # sm, md, lg, glow, card
├── breakpoints/        # xs, sm, md, lg, xl, 2xl, ultrawide
├── animation/
│   ├── duration/       # fast, normal, slow, slower
│   └── easing/         # ease-in, ease-out, ease-in-out
└── sizing/
    ├── icon/           # xs, sm, md, lg, xl, 2xl
    ├── button/         # sm, md, lg
    ├── input/          # sm, md, lg
    └── touchTarget/    # min (44px)
```

### Theme Switching

The tokens include two pre-configured themes:

- **Light**: Clean neutral palette (OKLCH colors)
- **Dark**: Warm dark palette with gold accents (HSL colors)

To switch themes in Figma:
1. Open Tokens Studio plugin
2. Click the theme dropdown at the top
3. Select "Light" or "Dark"

## Regenerating Tokens

If the design system CSS (`app/globals.css`) is updated:

```bash
# Run the token generator
npx tsx scripts/figma/generate-tokens.ts
```

This will update `figma-tokens.json` with the latest values.

## Related Documentation

- [Figma Design System Guide](../../docs/FIGMA_DESIGN_SYSTEM.md) - Complete design system documentation
- [Figma Component Library](../../docs/FIGMA_COMPONENT_LIBRARY.md) - Component mapping guide
- [Figma Responsive Frames](../../docs/FIGMA_RESPONSIVE_FRAMES.md) - Responsive design specifications
- [Figma User Flows](../../docs/FIGMA_USER_FLOWS.md) - Prototyping guidelines
- [Figma Developer Handoff](../../docs/FIGMA_DEVELOPER_HANDOFF.md) - Design-to-code workflow

## Token Sync Workflow

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   CSS Variables  │ --> │  Token Generator │ --> │   Figma Tokens   │
│  (globals.css)   │     │  (generate-*.ts) │     │ (figma-tokens.json)
└──────────────────┘     └──────────────────┘     └──────────────────┘
                                                           │
                                                           ▼
                                                  ┌──────────────────┐
                                                  │  Tokens Studio   │
                                                  │  (Figma Plugin)  │
                                                  └──────────────────┘
```

## Contributing

When updating design tokens:

1. Update the source CSS in `app/globals.css`
2. Run the token generator script
3. Import updated tokens in Figma
4. Update relevant documentation if needed
