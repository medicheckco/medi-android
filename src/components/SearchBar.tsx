import React, { useRef } from 'react';
import { Search, XCircle } from 'lucide-react';

interface SearchBarProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  onExecuteSearch: (term: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchTermChange,
  onExecuteSearch,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = () => {
    onExecuteSearch(searchTerm);
    inputRef.current?.blur();
  };

  return (
    <div className="relative group w-full max-w-2xl mx-auto">
      <input
        ref={inputRef}
        type="text"
        placeholder="Search by name, brand, or barcode..."
        value={searchTerm}
        onChange={(e) => onSearchTermChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSearch();
          }
        }}
        className="w-full pl-5 pr-20 sm:pr-28 py-2.5 bg-white border border-premium-border rounded-search-bar focus:outline-none focus:ring-4 focus:ring-brand-blue-start/5 focus:border-brand-blue-start transition-all text-sm sm:text-base shadow-premium-soft placeholder:text-premium-secondary group-hover:border-premium-border group-hover:bg-white text-premium-text"
      />
      <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {searchTerm && (
          <button
            onClick={() => {
              onSearchTermChange('');
              onExecuteSearch('');
              inputRef.current?.blur();
            }}
            className="p-1.5 text-premium-secondary hover:text-rose-500 transition-colors"
            title="Clear search"
          >
            <XCircle className="w-5 h-5" />
          </button>
        )}
        <button
          onClick={handleSearch}
          className="h-8 px-3 sm:px-4 bg-brand-blue-start text-white rounded-full font-semibold text-[9px] uppercase tracking-widest hover:brightness-110 transition-all shadow-premium-soft active:scale-[0.98] flex items-center justify-center gap-2 group/btn"
        >
          <Search className="w-3 h-3 group-hover/btn:scale-110 transition-transform" />
          <span className="hidden sm:inline">Search</span>
        </button>
      </div>
    </div>
  );
};
