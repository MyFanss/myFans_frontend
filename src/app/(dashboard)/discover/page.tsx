"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import DiscoverFilters from "@/components/discover/DiscoverFilters";
import CreatorGrid from "@/components/discover/CreatorGrid";
import { mockCreators } from "@/lib/mocks/creators";
import type { CreatorCategory } from "@/types/api";

export default function DiscoverPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<CreatorCategory>("All");
  const [isLoading, setIsLoading] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  function handleSearchChange(value: string) {
    setSearch(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebouncedSearch(value), 350);
  }

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return mockCreators.filter((c) => {
      const matchesCategory =
        activeCategory === "All" || c.category === activeCategory;
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.handle.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [debouncedSearch, activeCategory]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Discover Creators</h1>

      <div className="mb-6">
        <DiscoverFilters
          search={search}
          onSearchChange={handleSearchChange}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
      </div>

      <CreatorGrid creators={filtered} isLoading={isLoading} />
    </main>
  );
}
