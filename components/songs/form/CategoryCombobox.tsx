'use client';

import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { getExistingCategories, type CategoryWithCount } from '@/app/actions/songs';
import { Label } from '@/components/ui/label';

interface CategoryComboboxProps {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string;
}

/**
 * Normalize category name to title case
 */
function normalizeCategory(category: string): string {
  return category
    .trim()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export default function CategoryCombobox({ value, onChange, onBlur, error }: CategoryComboboxProps) {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    let mounted = true;

    const fetchCategories = async () => {
      if (mounted) {
        setLoading(true);
      }
      try {
        const data = await getExistingCategories();
        if (mounted) {
          setCategories(data);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void fetchCategories();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleSelect = (selectedValue: string) => {
    const normalized = normalizeCategory(selectedValue);
    onChange(normalized);
    setOpen(false);
    setSearchValue('');
  };

  const handleInputChange = (newValue: string) => {
    setSearchValue(newValue);
    // Also update the form value as user types (for creating new categories)
    if (newValue) {
      onChange(newValue);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="category">
        Category
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="category"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              'w-full justify-between font-normal',
              !value && 'text-muted-foreground',
              error && 'border-destructive'
            )}
            onBlur={onBlur}
          >
            {value || 'Select or type a category...'}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search or type new category..."
              value={searchValue}
              onValueChange={handleInputChange}
            />
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <CommandEmpty>
                  <div className="py-6 text-center text-sm">
                    {searchValue ? (
                      <div>
                        <p className="text-muted-foreground">
                          Press Enter to create:
                        </p>
                        <p className="mt-1 font-medium text-foreground">
                          &quot;{normalizeCategory(searchValue)}&quot;
                        </p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        Start typing to create a new category
                      </p>
                    )}
                  </div>
                </CommandEmpty>
                {filteredCategories.length > 0 && (
                  <CommandGroup>
                    {filteredCategories.map((category) => (
                      <CommandItem
                        key={category.name}
                        value={category.name}
                        onSelect={handleSelect}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            value === category.name ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        <span className="flex-1">{category.name}</span>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {category.count}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </>
            )}
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
