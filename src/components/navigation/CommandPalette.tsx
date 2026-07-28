"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, History, X, ArrowRight } from "lucide-react";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";
import type { UseGlobalSearchReturn } from "@/hooks/useGlobalSearch";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export interface CommandPaletteHandle {
  open: () => void;
  close: () => void;
  toggle: () => void;
}

interface PaletteItem {
  id: string;
  label: string;
  description?: string;
  href: string;
  type: "creator" | "post" | "setting";
}
interface GroupedResult {
  label: string;
  items: PaletteItem[];
}

const QUICK_LINKS: PaletteItem[] = [
  { id: "ql-dash", label: "Dashboard", href: "/dashboard", type: "setting" },
  { id: "ql-disc", label: "Discover", href: "/discover", type: "setting" },
  { id: "ql-prof", label: "Profile Settings", href: "/settings/profile", type: "setting" },
  { id: "ql-sec", label: "Security Settings", href: "/settings/security", type: "setting" },
  { id: "ql-pay", label: "Payout Settings", href: "/settings/payouts", type: "setting" },
];

function buildGroups(
  results: UseGlobalSearchReturn["results"],
  query: string,
  hasSearched: boolean
): GroupedResult[] {
  if (!query) return [{ label: "Quick links", items: QUICK_LINKS }];
  const groups: GroupedResult[] = [];
  if (!hasSearched || !results) return groups;
  if (results.creators.length > 0) {
    groups.push({
      label: "Creators",
      items: results.creators.map((c) => ({
        id: `c-${c.id}`, label: c.name,
        description: `@${c.handle} \u00B7 ${c.subscriberCount.toLocaleString()} subs`,
        href: `/creators/${c.handle}`, type: "creator" as const,
      })),
    });
  }
  if (results.posts.length > 0) {
    groups.push({
      label: "Posts",
      items: results.posts.map((p) => ({
        id: `p-${p.id}`, label: p.title,
        description: `by ${p.authorName} \u00B7 ${p.excerpt.substring(0, 60)}`,
        href: `/creators/${p.authorHandle}`, type: "post" as const,
      })),
    });
  }
  if (results.settings.length > 0) {
    groups.push({
      label: "Settings",
      items: results.settings.map((s) => ({
        id: `s-${s.href}`, label: s.label, href: s.href, type: "setting" as const,
      })),
    });
  }
  return groups;
}
const CommandPalette = forwardRef<CommandPaletteHandle>((_props, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const {
    query, setQuery, results, isSearching,
    recentSearches, addRecent, clearRecents, hasSearched,
  } = useGlobalSearch();

  useImperativeHandle(ref, () => ({
    open: () => { setIsOpen(true); setActiveIndex(-1); },
    close: () => { setIsOpen(false); setQuery(""); setActiveIndex(-1); },
    toggle: () => { setIsOpen((p) => { if (!p) setActiveIndex(-1); return !p; }); },
  }));

  useEffect(() => {
    function handle(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((p) => { if (!p) { setActiveIndex(-1); setQuery(""); } return !p; });
      }
    }
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [setQuery]);

  useEffect(() => { if (isOpen && inputRef.current) inputRef.current.focus(); }, [isOpen]);
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);
  useEffect(() => { setActiveIndex(-1); }, [query]);

  const groupedResults = buildGroups(results, query, hasSearched);
  const flatItems = groupedResults.flatMap((g) => g.items);
  const totalItems = flatItems.length;

  const handleSelectItem = useCallback(
    (item: PaletteItem) => {
      addRecent(query.trim() || item.label);
      setIsOpen(false);
      setQuery("");
      router.push(item.href);
    },
    [addRecent, query, router, setQuery]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((p) => (p < totalItems - 1 ? p + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((p) => (p > 0 ? p - 1 : totalItems - 1));
      } else if (e.key === "Enter" && activeIndex >= 0 && activeIndex < totalItems) {
        e.preventDefault();
        const item = flatItems[activeIndex];
        if (item) handleSelectItem(item);
      } else if (e.key === "Escape") {
        e.preventDefault();
        setIsOpen(false);
        setQuery("");
      }
    },
    [activeIndex, totalItems, flatItems, handleSelectItem, setQuery]
  );

  function handleRecentClick(term: string) { setQuery(term); }
  function handleOverlayClick() { setIsOpen(false); setQuery(""); }

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onKeyDown={handleKeyDown}>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={handleOverlayClick} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-label="Global search"
        className="relative z-10 w-full max-w-xl rounded-xl border border-border bg-background shadow-2xl"
      >
        <div className="flex items-center gap-2 border-b border-border px-4">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Input ref={inputRef} type="text" placeholder="Search creators, posts, settings..."
            value={query} onChange={(e) => setQuery(e.target.value)}
            className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
            aria-label="Search" aria-autocomplete="list" autoComplete="off"
          />
          {isSearching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          {query && !isSearching && (
            <button type="button" onClick={() => setQuery("")}
              className="rounded p-1 text-muted-foreground hover:bg-accent" aria-label="Clear"
            ><X className="h-4 w-4" /></button>
          )}
          <kbd className="hidden h-6 items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground sm:inline-flex">ESC</kbd>
        </div>
        <div role="listbox" aria-label="Results" className="max-h-80 overflow-y-auto p-2">
          {groupedResults.length === 0 && query && !isSearching && (
            <div className="px-2 py-8 text-center text-sm text-muted-foreground">
              No results found for &quot;{query}&quot;
            </div>
          )}

          {!query && recentSearches.length > 0 && (
            <div className="px-2 py-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Recent searches</span>
                <button type="button" onClick={clearRecents}
                  className="text-xs text-muted-foreground hover:text-foreground">Clear</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <button key={term} type="button" onClick={() => handleRecentClick(term)}
                    className="inline-flex items-center gap-1 rounded-full border border-border bg-accent/50 px-2.5 py-1 text-xs font-medium text-foreground hover:bg-accent"
                  ><History className="h-3 w-3" />{term}</button>
                ))}
              </div>
            </div>
          )}
          {groupedResults.map((group) => (
            <div key={group.label} role="group" aria-label={group.label}>
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">{group.label}</div>
              {group.items.map((item) => {
                const globalIdx = flatItems.indexOf(item);
                return (
                  <button key={item.id} type="button" role="option"
                    aria-selected={activeIndex === globalIdx}
                    onMouseEnter={() => setActiveIndex(globalIdx)}
                    onClick={() => handleSelectItem(item)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                      activeIndex === globalIdx ? "bg-accent text-accent-foreground" : "text-foreground"
                    )}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-medium text-muted-foreground">
                      {item.type === "creator" ? "C" : item.type === "post" ? "P" : "S"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{item.label}</div>
                      {item.description && <div className="truncate text-xs text-muted-foreground">{item.description}</div>}
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </button>
                );
              })}
            </div>
          ))}
          {flatItems.length > 0 && (
            <div className="border-t border-border px-2 py-2 text-xs text-muted-foreground">
              <span>\u2191\u2193 navigate</span><span className="mx-2">\u00B7</span>
              <span>\u23CE select</span><span className="mx-2">\u00B7</span>
              <span>esc close</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

CommandPalette.displayName = "CommandPalette";
export default CommandPalette;
