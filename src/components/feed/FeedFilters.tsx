"use client";

import { Image, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FeedFilter } from "@/lib/api/feed";

interface FeedFiltersProps {
  activeFilter: FeedFilter;
  onFilterChange: (filter: FeedFilter) => void;
}

export function FeedFilters({ activeFilter, onFilterChange }: FeedFiltersProps) {
  return (
    <div
      className="sticky top-0 z-10 flex gap-2 border-b bg-background/80 backdrop-blur-sm px-4 py-3"
      role="tablist"
    >
      <Button
        variant={activeFilter === "all" ? "default" : "ghost"}
        size="sm"
        onClick={() => onFilterChange("all")}
        role="tab"
        aria-selected={activeFilter === "all"}
      >
        All
      </Button>
      <Button
        variant={activeFilter === "media" ? "default" : "ghost"}
        size="sm"
        onClick={() => onFilterChange("media")}
        role="tab"
        aria-selected={activeFilter === "media"}
      >
        <Image className="mr-1 size-4" aria-hidden />
        Media
      </Button>
      <Button
        variant={activeFilter === "text" ? "default" : "ghost"}
        size="sm"
        onClick={() => onFilterChange("text")}
        role="tab"
        aria-selected={activeFilter === "text"}
      >
        <Type className="mr-1 size-4" aria-hidden />
        Text
      </Button>
    </div>
  );
}
