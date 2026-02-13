'use client';

import { useState } from 'react';
import { ChevronsUpDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

interface AuthorComboboxProps {
  value: string;
  authors: string[];
  onChange: (value: string) => void;
}

export function AuthorCombobox({ value, authors, onChange }: AuthorComboboxProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-7 w-32 shrink-0 justify-between text-sm font-normal px-2"
        >
          <span className="truncate">{value || 'Author'}</span>
          <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search authors..." className="h-8 text-sm" />
          <CommandList className="max-h-48">
            <CommandEmpty className="py-3 text-xs">No match found.</CommandEmpty>
            <CommandGroup>
              {authors.map((author) => (
                <CommandItem
                  key={author}
                  value={author}
                  onSelect={(selected) => {
                    onChange(selected);
                    setOpen(false);
                  }}
                  className="text-sm"
                >
                  <Check
                    className={cn(
                      'mr-1.5 h-3 w-3',
                      value === author ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <span className="truncate">{author}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
