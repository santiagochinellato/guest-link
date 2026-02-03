"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

export function Omnibox({
  onSearch,
  isSearching,
}: {
  onSearch: (q: string) => void;
  isSearching: boolean;
}) {
  const [query, setQuery] = useState("");

  return (
    <div className="flex items-center bg-white dark:bg-neutral-900 rounded-lg shadow-xl border border-gray-200 dark:border-neutral-800 w-full md:w-[320px] overflow-hidden transition-all focus-within:ring-2 ring-brand-copper/50">
      <div className="pl-3 text-gray-400">
        {isSearching ? (
          <div className="w-4 h-4 rounded-full border-2 border-brand-copper border-t-transparent animate-spin" />
        ) : (
          <Search className="w-4 h-4" />
        )}
      </div>
      <Input
        className="border-0 focus-visible:ring-0 shadow-none h-10 text-sm bg-transparent"
        placeholder="Buscar lugares (ej. Pizza, Museo...)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSearch(query);
        }}
      />
      {query && (
        <button
          onClick={() => setQuery("")}
          className="pr-3 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
