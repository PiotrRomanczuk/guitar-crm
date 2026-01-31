/**
 * Figma Design Tokens Generator
 *
 * This script extracts design tokens from the application's CSS variables
 * and generates a JSON file compatible with Figma's Tokens Studio plugin.
 *
 * Usage:
 *   npx tsx scripts/figma/generate-tokens.ts
 *
 * Output:
 *   scripts/figma/figma-tokens.json
 */

import * as fs from 'fs';
import * as path from 'path';

// Design tokens structure for Figma Tokens Studio
interface TokenSet {
  [key: string]: TokenValue | TokenSet;
}

interface TokenValue {
  value: string;
  type: string;
  description?: string;
}

// Light mode colors (OKLCH values converted to hex approximations)
const lightColors: TokenSet = {
  background: { value: '#FFFFFF', type: 'color', description: 'Page background' },
  foreground: { value: '#1A1A1A', type: 'color', description: 'Primary text color' },
  card: { value: '#FFFFFF', type: 'color', description: 'Card background' },
  'card-foreground': { value: '#1A1A1A', type: 'color', description: 'Card text color' },
  popover: { value: '#FFFFFF', type: 'color', description: 'Popover background' },
  'popover-foreground': { value: '#1A1A1A', type: 'color', description: 'Popover text color' },
  primary: { value: '#2D2D2D', type: 'color', description: 'Primary action color' },
  'primary-foreground': { value: '#FAFAFA', type: 'color', description: 'Text on primary' },
  secondary: { value: '#F5F5F5', type: 'color', description: 'Secondary background' },
  'secondary-foreground': { value: '#2D2D2D', type: 'color', description: 'Secondary text' },
  muted: { value: '#F5F5F5', type: 'color', description: 'Muted background' },
  'muted-foreground': { value: '#737373', type: 'color', description: 'Muted text color' },
  accent: { value: '#F5F5F5', type: 'color', description: 'Accent background' },
  'accent-foreground': { value: '#2D2D2D', type: 'color', description: 'Accent text' },
  destructive: { value: '#DC2626', type: 'color', description: 'Error/destructive color' },
  'destructive-foreground': { value: '#FFFFFF', type: 'color', description: 'Text on destructive' },
  border: { value: '#E5E5E5', type: 'color', description: 'Border color' },
  input: { value: '#E5E5E5', type: 'color', description: 'Input border color' },
  ring: { value: '#A3A3A3', type: 'color', description: 'Focus ring color' },
  success: { value: '#16A34A', type: 'color', description: 'Success state' },
  'success-foreground': { value: '#FFFFFF', type: 'color', description: 'Text on success' },
  warning: { value: '#F5A623', type: 'color', description: 'Warning state' },
  'warning-foreground': { value: '#0D0B0A', type: 'color', description: 'Text on warning' },
  'chart-1': { value: '#E67E22', type: 'color', description: 'Chart color 1' },
  'chart-2': { value: '#0891B2', type: 'color', description: 'Chart color 2' },
  'chart-3': { value: '#4B5563', type: 'color', description: 'Chart color 3' },
  'chart-4': { value: '#EAB308', type: 'color', description: 'Chart color 4' },
  'chart-5': { value: '#F59E0B', type: 'color', description: 'Chart color 5' },
  sidebar: { value: '#FAFAFA', type: 'color', description: 'Sidebar background' },
  'sidebar-foreground': { value: '#1A1A1A', type: 'color', description: 'Sidebar text' },
  'sidebar-primary': { value: '#2D2D2D', type: 'color', description: 'Sidebar primary' },
  'sidebar-primary-foreground': { value: '#FAFAFA', type: 'color', description: 'Sidebar primary text' },
  'sidebar-accent': { value: '#F5F5F5', type: 'color', description: 'Sidebar accent' },
  'sidebar-accent-foreground': { value: '#2D2D2D', type: 'color', description: 'Sidebar accent text' },
  'sidebar-border': { value: '#E5E5E5', type: 'color', description: 'Sidebar border' },
  'sidebar-ring': { value: '#A3A3A3', type: 'color', description: 'Sidebar focus ring' },
};

// Dark mode colors (HSL values converted to hex)
const darkColors: TokenSet = {
  background: { value: '#0D0B0A', type: 'color', description: 'Page background (dark)' },
  foreground: { value: '#F7F5F2', type: 'color', description: 'Primary text color (dark)' },
  card: { value: '#161412', type: 'color', description: 'Card background (dark)' },
  'card-foreground': { value: '#F7F5F2', type: 'color', description: 'Card text color (dark)' },
  popover: { value: '#161412', type: 'color', description: 'Popover background (dark)' },
  'popover-foreground': { value: '#F7F5F2', type: 'color', description: 'Popover text color (dark)' },
  primary: { value: '#F5A623', type: 'color', description: 'Primary action color - Gold (dark)' },
  'primary-foreground': { value: '#0D0B0A', type: 'color', description: 'Text on primary (dark)' },
  secondary: { value: '#262220', type: 'color', description: 'Secondary background (dark)' },
  'secondary-foreground': { value: '#E8E4DF', type: 'color', description: 'Secondary text (dark)' },
  muted: { value: '#302C28', type: 'color', description: 'Muted background (dark)' },
  'muted-foreground': { value: '#9A9080', type: 'color', description: 'Muted text color (dark)' },
  accent: { value: '#F5A623', type: 'color', description: 'Accent color - Gold (dark)' },
  'accent-foreground': { value: '#0D0B0A', type: 'color', description: 'Accent text (dark)' },
  destructive: { value: '#EF4444', type: 'color', description: 'Error/destructive color (dark)' },
  'destructive-foreground': { value: '#FFFFFF', type: 'color', description: 'Text on destructive (dark)' },
  border: { value: '#2A2624', type: 'color', description: 'Border color (dark)' },
  input: { value: '#2A2624', type: 'color', description: 'Input border color (dark)' },
  ring: { value: '#F5A623', type: 'color', description: 'Focus ring color - Gold (dark)' },
  success: { value: '#16A34A', type: 'color', description: 'Success state (dark)' },
  'success-foreground': { value: '#FFFFFF', type: 'color', description: 'Text on success (dark)' },
  warning: { value: '#F5A623', type: 'color', description: 'Warning state (dark)' },
  'warning-foreground': { value: '#0D0B0A', type: 'color', description: 'Text on warning (dark)' },
  'chart-1': { value: '#6366F1', type: 'color', description: 'Chart color 1 (dark)' },
  'chart-2': { value: '#22C55E', type: 'color', description: 'Chart color 2 (dark)' },
  'chart-3': { value: '#F5A623', type: 'color', description: 'Chart color 3 (dark)' },
  'chart-4': { value: '#A855F7', type: 'color', description: 'Chart color 4 (dark)' },
  'chart-5': { value: '#EF4444', type: 'color', description: 'Chart color 5 (dark)' },
  sidebar: { value: '#100E0D', type: 'color', description: 'Sidebar background (dark)' },
  'sidebar-foreground': { value: '#E8E4DF', type: 'color', description: 'Sidebar text (dark)' },
  'sidebar-primary': { value: '#F5A623', type: 'color', description: 'Sidebar primary - Gold (dark)' },
  'sidebar-primary-foreground': { value: '#0D0B0A', type: 'color', description: 'Sidebar primary text (dark)' },
  'sidebar-accent': { value: '#1E1A18', type: 'color', description: 'Sidebar accent (dark)' },
  'sidebar-accent-foreground': { value: '#F7F5F2', type: 'color', description: 'Sidebar accent text (dark)' },
  'sidebar-border': { value: '#262220', type: 'color', description: 'Sidebar border (dark)' },
  'sidebar-ring': { value: '#F5A623', type: 'color', description: 'Sidebar focus ring - Gold (dark)' },
};

// Typography tokens
const typography: TokenSet = {
  fontFamilies: {
    sans: { value: 'Geist', type: 'fontFamilies', description: 'Primary font family' },
    mono: { value: 'Geist Mono', type: 'fontFamilies', description: 'Monospace font family' },
  },
  fontWeights: {
    regular: { value: '400', type: 'fontWeights', description: 'Regular weight' },
    medium: { value: '500', type: 'fontWeights', description: 'Medium weight' },
    semibold: { value: '600', type: 'fontWeights', description: 'Semibold weight' },
    bold: { value: '700', type: 'fontWeights', description: 'Bold weight' },
  },
  fontSize: {
    xs: { value: '12', type: 'fontSizes', description: '12px - Extra small' },
    sm: { value: '14', type: 'fontSizes', description: '14px - Small/body' },
    base: { value: '16', type: 'fontSizes', description: '16px - Base' },
    lg: { value: '18', type: 'fontSizes', description: '18px - Large' },
    xl: { value: '20', type: 'fontSizes', description: '20px - Extra large' },
    '2xl': { value: '24', type: 'fontSizes', description: '24px - 2XL' },
    '3xl': { value: '30', type: 'fontSizes', description: '30px - 3XL' },
    '4xl': { value: '36', type: 'fontSizes', description: '36px - 4XL' },
  },
  lineHeight: {
    tight: { value: '1.25', type: 'lineHeights', description: 'Tight line height' },
    snug: { value: '1.375', type: 'lineHeights', description: 'Snug line height' },
    normal: { value: '1.5', type: 'lineHeights', description: 'Normal line height' },
    relaxed: { value: '1.625', type: 'lineHeights', description: 'Relaxed line height' },
  },
  letterSpacing: {
    tight: { value: '-0.025em', type: 'letterSpacing', description: 'Tight tracking' },
    normal: { value: '0', type: 'letterSpacing', description: 'Normal tracking' },
    wide: { value: '0.025em', type: 'letterSpacing', description: 'Wide tracking' },
    wider: { value: '0.05em', type: 'letterSpacing', description: 'Wider tracking' },
  },
};

// Spacing tokens (based on 4px grid)
const spacing: TokenSet = {
  '0': { value: '0', type: 'spacing', description: '0px' },
  '0.5': { value: '2', type: 'spacing', description: '2px' },
  '1': { value: '4', type: 'spacing', description: '4px' },
  '1.5': { value: '6', type: 'spacing', description: '6px' },
  '2': { value: '8', type: 'spacing', description: '8px' },
  '2.5': { value: '10', type: 'spacing', description: '10px' },
  '3': { value: '12', type: 'spacing', description: '12px' },
  '3.5': { value: '14', type: 'spacing', description: '14px' },
  '4': { value: '16', type: 'spacing', description: '16px' },
  '5': { value: '20', type: 'spacing', description: '20px' },
  '6': { value: '24', type: 'spacing', description: '24px' },
  '7': { value: '28', type: 'spacing', description: '28px' },
  '8': { value: '32', type: 'spacing', description: '32px' },
  '9': { value: '36', type: 'spacing', description: '36px' },
  '10': { value: '40', type: 'spacing', description: '40px' },
  '11': { value: '44', type: 'spacing', description: '44px' },
  '12': { value: '48', type: 'spacing', description: '48px' },
  '14': { value: '56', type: 'spacing', description: '56px' },
  '16': { value: '64', type: 'spacing', description: '64px' },
  '20': { value: '80', type: 'spacing', description: '80px' },
  '24': { value: '96', type: 'spacing', description: '96px' },
};

// Border radius tokens
const borderRadius: TokenSet = {
  none: { value: '0', type: 'borderRadius', description: 'No radius' },
  sm: { value: '6', type: 'borderRadius', description: 'Small radius - 6px' },
  md: { value: '8', type: 'borderRadius', description: 'Medium radius - 8px' },
  lg: { value: '10', type: 'borderRadius', description: 'Large radius - 10px (base)' },
  xl: { value: '14', type: 'borderRadius', description: 'Extra large radius - 14px' },
  '2xl': { value: '18', type: 'borderRadius', description: '2XL radius - 18px' },
  full: { value: '9999', type: 'borderRadius', description: 'Full/pill radius' },
};

// Shadow tokens
const boxShadow: TokenSet = {
  sm: {
    value: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    type: 'boxShadow',
    description: 'Small shadow',
  },
  md: {
    value: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    type: 'boxShadow',
    description: 'Medium shadow',
  },
  lg: {
    value: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    type: 'boxShadow',
    description: 'Large shadow',
  },
  glow: {
    value: '0 0 40px hsl(38 92% 50% / 0.15)',
    type: 'boxShadow',
    description: 'Gold glow effect',
  },
  card: {
    value: '0 4px 24px hsl(0 0% 0% / 0.3)',
    type: 'boxShadow',
    description: 'Card shadow',
  },
};

// Breakpoints
const breakpoints: TokenSet = {
  xs: { value: '475', type: 'dimension', description: 'Extra small - 475px' },
  sm: { value: '640', type: 'dimension', description: 'Small - 640px' },
  md: { value: '768', type: 'dimension', description: 'Medium - 768px' },
  lg: { value: '1024', type: 'dimension', description: 'Large - 1024px' },
  xl: { value: '1280', type: 'dimension', description: 'Extra large - 1280px' },
  '2xl': { value: '1536', type: 'dimension', description: '2XL - 1536px' },
  ultrawide: { value: '2560', type: 'dimension', description: 'Ultrawide - 2560px' },
};

// Animation/duration tokens
const animation: TokenSet = {
  duration: {
    fast: { value: '150ms', type: 'duration', description: 'Fast transition' },
    normal: { value: '200ms', type: 'duration', description: 'Normal transition' },
    slow: { value: '300ms', type: 'duration', description: 'Slow transition' },
    slower: { value: '500ms', type: 'duration', description: 'Slower transition' },
  },
  easing: {
    'ease-in': { value: 'cubic-bezier(0.4, 0, 1, 1)', type: 'other', description: 'Ease in' },
    'ease-out': { value: 'cubic-bezier(0, 0, 0.2, 1)', type: 'other', description: 'Ease out' },
    'ease-in-out': { value: 'cubic-bezier(0.4, 0, 0.2, 1)', type: 'other', description: 'Ease in-out' },
  },
};

// Sizing tokens for components
const sizing: TokenSet = {
  icon: {
    xs: { value: '12', type: 'sizing', description: 'Extra small icon - 12px' },
    sm: { value: '14', type: 'sizing', description: 'Small icon - 14px' },
    md: { value: '16', type: 'sizing', description: 'Medium icon - 16px' },
    lg: { value: '20', type: 'sizing', description: 'Large icon - 20px' },
    xl: { value: '24', type: 'sizing', description: 'Extra large icon - 24px' },
    '2xl': { value: '32', type: 'sizing', description: '2XL icon - 32px' },
  },
  button: {
    sm: { value: '32', type: 'sizing', description: 'Small button height - 32px' },
    md: { value: '40', type: 'sizing', description: 'Medium button height - 40px' },
    lg: { value: '48', type: 'sizing', description: 'Large button height - 48px' },
  },
  input: {
    sm: { value: '32', type: 'sizing', description: 'Small input height - 32px' },
    md: { value: '40', type: 'sizing', description: 'Medium input height - 40px' },
    lg: { value: '48', type: 'sizing', description: 'Large input height - 48px' },
  },
  touchTarget: {
    min: { value: '44', type: 'sizing', description: 'Minimum touch target - 44px' },
  },
};

// Complete token structure for Figma Tokens Studio
const figmaTokens = {
  'guitar-crm': {
    colors: {
      light: lightColors,
      dark: darkColors,
    },
    typography,
    spacing,
    borderRadius,
    boxShadow,
    breakpoints,
    animation,
    sizing,
  },
};

// Token sets metadata for Tokens Studio
const tokenSetsMetadata = {
  $themes: [
    {
      id: 'light',
      name: 'Light',
      selectedTokenSets: {
        'guitar-crm/colors/light': 'enabled',
        'guitar-crm/typography': 'enabled',
        'guitar-crm/spacing': 'enabled',
        'guitar-crm/borderRadius': 'enabled',
        'guitar-crm/boxShadow': 'enabled',
        'guitar-crm/sizing': 'enabled',
      },
    },
    {
      id: 'dark',
      name: 'Dark',
      selectedTokenSets: {
        'guitar-crm/colors/dark': 'enabled',
        'guitar-crm/typography': 'enabled',
        'guitar-crm/spacing': 'enabled',
        'guitar-crm/borderRadius': 'enabled',
        'guitar-crm/boxShadow': 'enabled',
        'guitar-crm/sizing': 'enabled',
      },
    },
  ],
  $metadata: {
    tokenSetOrder: [
      'guitar-crm/colors/light',
      'guitar-crm/colors/dark',
      'guitar-crm/typography',
      'guitar-crm/spacing',
      'guitar-crm/borderRadius',
      'guitar-crm/boxShadow',
      'guitar-crm/breakpoints',
      'guitar-crm/animation',
      'guitar-crm/sizing',
    ],
  },
};

// Main function
function generateTokens(): void {
  const outputDir = path.join(__dirname);
  const outputPath = path.join(outputDir, 'figma-tokens.json');

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Combine tokens with metadata
  const output = {
    ...figmaTokens,
    ...tokenSetsMetadata,
  };

  // Write tokens file
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

  console.log('Design tokens generated successfully!');
  console.log(`Output: ${outputPath}`);
  console.log('\nTo use in Figma:');
  console.log('1. Install the "Tokens Studio for Figma" plugin');
  console.log('2. Open the plugin and go to Settings');
  console.log('3. Choose "Import" and select the figma-tokens.json file');
  console.log('4. Apply tokens to your designs');
}

// Run the generator
generateTokens();
