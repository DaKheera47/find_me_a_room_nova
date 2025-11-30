"use client";

import * as React from "react";
import { Check, ChevronsUpDown, RefreshCw, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export type ComboboxItem = {
  value: string;
  label: string;
  sublabel?: string;
  extra?: string;
};

type SearchableComboboxProps = {
  title: string;
  description: string;
  icon?: React.ReactNode;
  placeholder: string;
  searchPlaceholder: string;
  emptyMessage: string;
  loadingMessage: string;
  items: ComboboxItem[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onClear: () => void;
  onRefresh?: () => void;
  isLoading: boolean;
  error: string | null;
  lastUpdated?: string | null;
  itemCount?: number;
  popoverWidth?: string;
  className?: string;
};

export function SearchableCombobox({
  title,
  description,
  icon,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  loadingMessage,
  items,
  selectedValue,
  onSelect,
  onClear,
  onRefresh,
  isLoading,
  error,
  lastUpdated,
  itemCount,
  popoverWidth = "w-[400px]",
  className,
}: SearchableComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const selectedItem = items.find((item) => item.value === selectedValue);

  const handleSelect = (value: string) => {
    onSelect(value);
    setOpen(false);
  };

  return (
    <Card className={cn("max-w-[50%]", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>

        {onRefresh && (
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Refresh ${title.toLowerCase()}`}
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={cn("size-4", isLoading && "animate-spin")} />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
                disabled={isLoading || error !== null}
              >
                {selectedItem
                  ? selectedItem.sublabel
                    ? `${selectedItem.label} - ${selectedItem.sublabel}`
                    : selectedItem.label
                  : selectedValue
                    ? selectedValue
                    : isLoading
                      ? loadingMessage
                      : placeholder}
                <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className={cn(popoverWidth, "p-0")}>
              <Command
                className="max-h-72 overflow-hidden"
                filter={(value, search) => {
                  const normalizedSearch = search.trim().toLowerCase();
                  if (!normalizedSearch.length) return 1;

                  const normalizedValue = value.toLowerCase();
                  return normalizedValue.includes(normalizedSearch) ? 1 : 0;
                }}
              >
                <CommandInput placeholder={searchPlaceholder} />
                <CommandList>
                  <CommandEmpty>{emptyMessage}</CommandEmpty>
                  <CommandGroup className="max-h-60 overflow-y-auto">
                    {items.map((item) => (
                      <CommandItem
                        key={item.value}
                        value={
                          item.sublabel
                            ? `${item.label} - ${item.sublabel}`
                            : item.label
                        }
                        onSelect={() => handleSelect(item.value)}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Check
                            className={cn(
                              "size-4 shrink-0",
                              selectedValue === item.value
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {item.sublabel ? (
                            <div className="flex flex-col">
                              <span className="font-medium">{item.label}</span>
                              <span className="line-clamp-1 text-sm text-muted-foreground">
                                {item.sublabel}
                              </span>
                            </div>
                          ) : (
                            <span>{item.label}</span>
                          )}
                        </div>
                        {item.extra && (
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {item.extra}
                          </span>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {selectedValue && (
            <Button variant="ghost" size="icon" onClick={onClear}>
              <X className="size-4" />
            </Button>
          )}
        </div>

        {error && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {lastUpdated && (
          <p className="text-xs text-muted-foreground">
            Last updated: {new Date(lastUpdated).toLocaleString()}
          </p>
        )}

        {!isLoading && !error && itemCount !== undefined && itemCount > 0 && (
          <p className="text-sm text-muted-foreground">
            {itemCount} items available
          </p>
        )}
      </CardContent>
    </Card>
  );
}
