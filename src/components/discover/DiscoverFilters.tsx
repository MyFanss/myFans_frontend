import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { CreatorCategory } from "@/types/api";

const CATEGORIES: CreatorCategory[] = [
  "All",
  "Music",
  "Art",
  "Gaming",
  "Fashion",
  "Fitness",
  "Tech",
  "Food",
  "Travel",
];

interface DiscoverFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  activeCategory: CreatorCategory;
  onCategoryChange: (category: CreatorCategory) => void;
}

export default function DiscoverFilters({
  search,
  onSearchChange,
  activeCategory,
  onCategoryChange,
}: DiscoverFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          placeholder="Search creators..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
          aria-label="Search creators by name or handle"
        />
      </div>

      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Filter by category"
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => onCategoryChange(cat)}
            aria-pressed={activeCategory === cat}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              activeCategory === cat
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground hover:border-primary/50 hover:bg-accent"
            )}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
