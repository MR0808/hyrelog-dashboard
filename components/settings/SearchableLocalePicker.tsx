'use client';

import { useState, useMemo } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { LOCALES, type LocaleOption } from '@/lib/constants/locales';

interface SearchableLocalePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

function filterLocales(locales: LocaleOption[], query: string): LocaleOption[] {
  const q = query.trim().toLowerCase();
  if (!q) return locales;
  return locales.filter(
    (loc) => loc.label.toLowerCase().includes(q) || loc.value.toLowerCase().includes(q)
  );
}

export function SearchableLocalePicker({
  value,
  onChange,
  placeholder = 'Select language',
  disabled,
  className
}: SearchableLocalePickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => filterLocales(LOCALES, search), [search]);
  const selectedLocale = useMemo(() => LOCALES.find((l) => l.value === value) ?? null, [value]);

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'w-full max-w-sm justify-between font-normal h-9 border-input',
            !selectedLocale && 'text-muted-foreground',
            className
          )}
        >
          <span className="truncate">{selectedLocale ? selectedLocale.label : placeholder}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-(--radix-popover-trigger-width) min-w-[20rem] p-0"
        align="start"
      >
        <div className="border-b p-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search languages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
        </div>
        <div className="max-h-[min(70vh,24rem)] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">No language found.</div>
          ) : (
            <div className="border-b border-border last:border-b-0">
              <div className="bg-muted/70 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground sticky top-0 z-10 border-b border-border/50">
                Language
              </div>
              <ul className="py-1">
                {filtered.map((loc) => (
                  <li key={loc.value}>
                    <button
                      type="button"
                      className={cn(
                        'w-full flex items-center gap-2 px-3 py-2 text-left text-sm cursor-pointer transition-colors',
                        'hover:bg-accent hover:text-accent-foreground',
                        value === loc.value && 'bg-accent text-accent-foreground'
                      )}
                      onClick={() => {
                        onChange(loc.value);
                        setOpen(false);
                        setSearch('');
                      }}
                    >
                      {value === loc.value ? (
                        <Check className="h-4 w-4 shrink-0" />
                      ) : (
                        <span
                          className="w-4 shrink-0"
                          aria-hidden
                        />
                      )}
                      <span className="truncate">{loc.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
