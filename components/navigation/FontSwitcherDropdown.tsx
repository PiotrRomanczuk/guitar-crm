'use client';

/**
 * Font Switcher Dropdown
 *
 * Compact dropdown for switching fonts in the header.
 * Only renders when DYNAMIC_FONT_SWITCHING is enabled.
 */

import { useFonts } from '@/lib/fonts/FontProvider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Type, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FontSwitcherDropdown() {
  const { currentScheme, setScheme, availableSchemes, isDynamicSwitchingEnabled } = useFonts();

  // Don't render if dynamic switching is disabled
  if (!isDynamicSwitchingEnabled) {
    return null;
  }

  const schemeEntries = Object.entries(availableSchemes);

  return (
    <TooltipProvider>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground"
                aria-label="Switch font"
              >
                <Type className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Change Font Style</p>
          </TooltipContent>
        </Tooltip>
      <DropdownMenuContent align="end" className="w-56 max-h-[400px] overflow-y-auto">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Type className="h-4 w-4" />
          Font Style
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {schemeEntries.map(([key, scheme]) => {
          const isActive = key === currentScheme;

          return (
            <DropdownMenuItem
              key={key}
              onClick={() => setScheme(key)}
              className="cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col">
                  <span className="font-medium">{scheme.name}</span>
                  <span className="text-xs text-muted-foreground line-clamp-1">
                    {scheme.description}
                  </span>
                </div>
                {isActive && <Check className="h-4 w-4 ml-2 text-primary" />}
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
}

/**
 * Mobile version with text label
 */
export function FontSwitcherMobile() {
  const { currentScheme, setScheme, availableSchemes, isDynamicSwitchingEnabled } = useFonts();

  // Don't render if dynamic switching is disabled
  if (!isDynamicSwitchingEnabled) {
    return null;
  }

  const schemeEntries = Object.entries(availableSchemes);

  return (
    <div className="px-2 mb-2">
      <label htmlFor="font-select" className="text-primary-foreground/90 text-sm block mb-1">
        Font Style
      </label>
      <select
        id="font-select"
        value={currentScheme}
        onChange={(e) => setScheme(e.target.value)}
        className="w-full bg-primary/20 border border-primary/30 text-primary-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-foreground/50"
      >
        {schemeEntries.map(([key, scheme]) => (
          <option key={key} value={key}>
            {scheme.name}
          </option>
        ))}
      </select>
    </div>
  );
}
