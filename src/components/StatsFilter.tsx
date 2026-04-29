import React, { useRef, useEffect, useState } from 'react';
import { ArrowUpDown, ChevronDown, Calendar, Package, Zap, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface StatsFilterProps {
  showAll: boolean;
  onShowAllChange: (show: boolean) => void;
  activeCount: number;
  allCount: number;
  sortBy: 'near-expiry' | 'far-expiry' | 'less-qty' | 'more-qty' | 'newest' | 'zero-stock';
  onSortChange: (sort: 'near-expiry' | 'far-expiry' | 'less-qty' | 'more-qty' | 'newest' | 'zero-stock') => void;
  filteredCount: number;
  totalCount: number;
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  brands: string[];
  selectedBrand: string;
  onBrandChange: (brand: string) => void;
  onAddNewClick: () => void;
  resetFilters: () => void;
  activeSearchTerm: string;
  hideToggleOnDesktop?: boolean;
}

export const MedicationToggle: React.FC<{
  showAll: boolean;
  onShowAllChange: (show: boolean) => void;
  activeCount: number;
  allCount: number;
  className?: string;
}> = ({ showAll, onShowAllChange, activeCount, allCount, className }) => (
  <div className={cn("flex bg-tab-inactive-bg p-1 rounded-full border border-premium-border shadow-premium-soft w-full sm:w-auto lg:min-w-[320px]", className)}>
    <button
      onClick={() => onShowAllChange(false)}
      className={cn(
        "flex-1 px-6 py-2.5 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] transition-all",
        !showAll ? "bg-gradient-to-br from-brand-blue-start to-brand-blue-end text-white shadow-premium-soft" : "text-tab-inactive-text hover:brightness-90"
      )}
    >
      Active ({activeCount})
    </button>
    <button
      onClick={() => onShowAllChange(true)}
      className={cn(
        "flex-1 px-6 py-2.5 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] transition-all",
        showAll ? "bg-gradient-to-br from-brand-blue-start to-brand-blue-end text-white shadow-premium-soft" : "text-tab-inactive-text hover:brightness-90"
      )}
    >
      All ({allCount})
    </button>
  </div>
);

export const StatsFilter: React.FC<StatsFilterProps> = ({
  showAll,
  onShowAllChange,
  activeCount,
  allCount,
  sortBy,
  onSortChange,
  filteredCount,
  totalCount,
  categories,
  selectedCategory,
  onCategoryChange,
  brands,
  selectedBrand,
  onBrandChange,
  onAddNewClick,
  resetFilters,
  activeSearchTerm,
  hideToggleOnDesktop = false,
}) => {
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const brandDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortDropdownOpen(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
      if (brandDropdownRef.current && !brandDropdownRef.current.contains(event.target as Node)) {
        setIsBrandDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-4">
      <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4", hideToggleOnDesktop && "lg:hidden")}>
        <MedicationToggle 
          showAll={showAll}
          onShowAllChange={onShowAllChange}
          activeCount={activeCount}
          allCount={allCount}
        />

        <button
          onClick={onAddNewClick}
          className="lg:flex items-center gap-3 px-8 py-3 bg-gradient-to-br from-brand-blue-start to-brand-blue-end text-white rounded-button-primary shadow-premium-soft hover:brightness-110 active:scale-[0.98] transition-all font-semibold text-[11px] uppercase tracking-[0.2em] hidden"
        >
          <Plus className="w-4 h-4" strokeWidth={3} />
          <span>Add New Medicine</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4 lg:px-1">
        <div className="grid grid-cols-2 lg:flex lg:items-center w-full gap-3 lg:gap-4 flex-1">
          {/* Location Filter */}
        <div className="relative" ref={categoryDropdownRef}>
          <button
            onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
            className="w-full h-[42px] flex items-center gap-2 bg-white border border-premium-border px-4 rounded-button-filter text-xs sm:text-sm text-premium-text shadow-premium-soft hover:border-brand-blue-start transition-all group"
          >
            <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-premium-subtitle group-hover:text-brand-blue-start transition-colors shrink-0" />
            <span className="flex-1 text-left font-semibold text-premium-text truncate">
              {selectedCategory === 'All' ? 'Locations' : selectedCategory}
            </span>
            <ChevronDown className={cn(
              "w-3.5 h-3.5 sm:w-4 sm:h-4 text-premium-subtitle transition-transform duration-200 shrink-0",
              isCategoryDropdownOpen && "rotate-180"
            )} />
          </button>

          <AnimatePresence>
            {isCategoryDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute left-0 right-0 top-full mt-2 w-full bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-200/50 py-2 z-50 overflow-y-auto max-h-60"
              >
                {categories.map((cat, idx) => (
                  <button
                    key={`cat-${cat}-${idx}`}
                    onClick={() => {
                      onCategoryChange(cat);
                      setIsCategoryDropdownOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2 text-xs font-bold transition-colors",
                      selectedCategory === cat ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    {cat}
                    {selectedCategory === cat && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Brand Filter */}
        <div className="relative" ref={brandDropdownRef}>
          <button
            onClick={() => setIsBrandDropdownOpen(!isBrandDropdownOpen)}
            className="w-full h-[42px] flex items-center gap-2 bg-white border border-premium-border px-4 rounded-button-filter text-xs sm:text-sm text-premium-text shadow-premium-soft hover:border-brand-blue-start transition-all group"
          >
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-premium-subtitle group-hover:text-brand-blue-start transition-colors shrink-0" />
            <span className="flex-1 text-left font-semibold text-premium-text truncate">
              {selectedBrand === 'All' ? 'Brands' : selectedBrand}
            </span>
            <ChevronDown className={cn(
              "w-3.5 h-3.5 sm:w-4 sm:h-4 text-premium-subtitle transition-transform duration-200 shrink-0",
              isBrandDropdownOpen && "rotate-180"
            )} />
          </button>

          <AnimatePresence>
            {isBrandDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute left-0 right-0 top-full mt-2 w-full bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-200/50 py-2 z-50 overflow-y-auto max-h-60"
              >
                {brands.map((brand, idx) => (
                  <button
                    key={`brand-${brand}-${idx}`}
                    onClick={() => {
                      onBrandChange(brand);
                      setIsBrandDropdownOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2 text-xs font-bold transition-colors",
                      selectedBrand === brand ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    {brand}
                    {selectedBrand === brand && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sort Dropdown */}
        <div className="relative" ref={sortDropdownRef}>
          <button
            onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
            className="w-full h-[42px] flex items-center gap-1 sm:gap-2 bg-white border border-premium-border px-3 sm:px-4 rounded-button-filter text-xs sm:text-sm text-premium-text shadow-premium-soft hover:border-brand-blue-start transition-all group"
          >
            <ArrowUpDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-premium-subtitle group-hover:text-brand-blue-start transition-colors shrink-0" />
            <span className="flex-1 text-left font-semibold text-premium-text truncate">
              {sortBy === 'near-expiry' && 'Near Expiry'}
              {sortBy === 'far-expiry' && 'Far Expiry'}
              {sortBy === 'less-qty' && 'Low Stock'}
              {sortBy === 'more-qty' && 'High Stock'}
              {sortBy === 'zero-stock' && 'Zero Stock'}
              {sortBy === 'newest' && 'Recently Added'}
            </span>
            <ChevronDown className={cn(
              "w-3.5 h-3.5 sm:w-4 sm:h-4 text-premium-subtitle transition-transform duration-200 shrink-0",
              isSortDropdownOpen && "rotate-180"
            )} />
          </button>

          <AnimatePresence>
            {isSortDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute left-0 right-0 top-full mt-2 w-full bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-200/50 py-2 z-50 overflow-hidden"
              >
                {[
                  { value: 'near-expiry', label: 'Near Expiry', icon: Calendar },
                  { value: 'far-expiry', label: 'Far Expiry', icon: Calendar },
                  { value: 'less-qty', label: 'Low Stock', icon: Package },
                  { value: 'more-qty', label: 'High Stock', icon: Package },
                  { value: 'zero-stock', label: 'Zero Stock', icon: Package },
                  { value: 'newest', label: 'Recently Added', icon: Zap },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onSortChange(option.value as any);
                      setIsSortDropdownOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold transition-colors",
                      sortBy === option.value 
                        ? "bg-blue-50 text-blue-600" 
                        : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                    )}
                  >
                    <option.icon className={cn(
                      "w-3.5 h-3.5",
                      sortBy === option.value ? "text-blue-500" : "text-slate-400"
                    )} />
                    {option.label}
                    {sortBy === option.value && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Clear Filters Button */}
        {(selectedCategory !== 'All' || selectedBrand !== 'All' || activeSearchTerm) && (
          <button
            onClick={resetFilters}
            className="h-[42px] flex items-center justify-center gap-2 bg-rose-50 text-rose-600 px-4 rounded-full text-xs sm:text-sm font-black hover:bg-rose-100 active:scale-[0.98] transition-all border border-rose-100 lg:min-w-[140px]"
          >
            <span>Clear Filters</span>
          </button>
        )}

        {/* Add New Button (Desktop Inline) */}
        <button
          onClick={onAddNewClick}
          className="hidden lg:flex items-center gap-3 px-6 h-[42px] bg-gradient-to-br from-brand-blue-start to-brand-blue-end text-white rounded-button-filter shadow-premium-soft hover:brightness-110 active:scale-[0.98] transition-all font-semibold text-[10px] uppercase tracking-[0.2em] flex-none ml-auto"
        >
          <Plus className="w-4 h-4" strokeWidth={3} />
          <span>Add New Medicine</span>
        </button>

        {/* Add New Button (Mobile/Tablet Only) */}
        <button
          onClick={onAddNewClick}
          className="lg:hidden w-full h-[42px] flex items-center justify-center gap-2 bg-gradient-to-br from-brand-blue-start to-brand-blue-end text-white px-4 rounded-button-filter text-xs sm:text-sm font-semibold shadow-premium-soft active:scale-[0.98] transition-all"
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" strokeWidth={3} />
          <span className="truncate">Add New</span>
        </button>
      </div>
    </div>
  </div>
  );
};
