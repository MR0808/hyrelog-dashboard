'use client';

import { useState, useMemo } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { getTimezoneGroups, type TimezoneGroup } from '@/lib/constants/timezones';

interface SearchableTimezonePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

function filterGroups(groups: TimezoneGroup[], query: string): TimezoneGroup[] {
  const q = query.trim().toLowerCase();
  if (!q) return groups;
  return groups
    .map((g) => ({
      ...g,
      zones: g.zones.filter(
        (z) =>
          z.displayLabel.toLowerCase().includes(q) ||
          z.label.toLowerCase().includes(q) ||
          z.value.toLowerCase().includes(q) ||
          z.code.toLowerCase().includes(q) ||
          z.offset.toLowerCase().includes(q)
      )
    }))
    .filter((g) => g.zones.length > 0);
}

export function SearchableTimezonePicker({
  value,
  onChange,
  placeholder = 'Select timezone',
  disabled,
  className
}: SearchableTimezonePickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const groups = useMemo(() => getTimezoneGroups(), []);
  const filtered = useMemo(() => filterGroups(groups, search), [groups, search]);

  const selectedZone = useMemo(() => {
    for (const g of groups) {
      const z = g.zones.find((z) => z.value === value);
      if (z) return z;
    }
    return null;
  }, [groups, value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'w-full max-w-sm justify-between font-normal h-9 border-input',
            !selectedZone && 'text-muted-foreground',
            className
          )}
        >
          <span className="truncate">
            {selectedZone ? selectedZone.displayLabel : placeholder}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="min-w-[20rem] p-0"
        align="start"
      >
        <div className="border-b p-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search timezones..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
        </div>
        <div className="max-h-[min(70vh,24rem)] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No timezone found.
            </div>
          ) : (
            filtered.map((group) => (
              <div
                key={group.regionLabel}
                className="border-b border-border last:border-b-0"
              >
                <div className="bg-muted/70 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground sticky top-0 z-10 border-b border-border/50">
                  {group.regionLabel}
                </div>
                <ul className="py-1">
                  {group.zones.map((zone) => (
                    <li key={zone.value}>
                      <button
                        type="button"
                        className={cn(
                          'w-full flex items-center gap-2 px-3 py-2 text-left text-sm cursor-pointer transition-colors',
                          'hover:bg-accent hover:text-accent-foreground',
                          value === zone.value &&
                            'bg-accent text-accent-foreground'
                        )}
                        onClick={() => {
                          onChange(zone.value);
                          setOpen(false);
                          setSearch('');
                        }}
                      >
                        {value === zone.value ? (
                          <Check className="h-4 w-4 shrink-0" />
                        ) : (
                          <span className="w-4 shrink-0" aria-hidden />
                        )}
                        <span className="truncate">{zone.displayLabel}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
