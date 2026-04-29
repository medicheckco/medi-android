import { AnimatePresence, motion } from 'motion/react';
import { useRef, useLayoutEffect } from 'react';
import { Search } from 'lucide-react';
import { SearchBar } from './SearchBar';
import { SearchActions } from './SearchActions';
import { StatsFilter, MedicationToggle } from './StatsFilter';
import { MedicationItem } from './MedicationItem';
import { MedicationDetails } from './MedicationDetails';
import { Pagination } from './Pagination';
import { cn, toDate } from '../lib/utils';

interface MainDashboardProps {
  isDataLoading: boolean;
  loadingProgress: number;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  setActiveSearchTerm: (v: string) => void;
  setIsScanning: (v: boolean) => void;
  setIsGS1Scanning: (v: boolean) => void;
  setScannedBarcode: (v: string) => void;
  setIsAddingMedication: (v: boolean) => void;
  showAll: boolean;
  setShowAll: (v: boolean) => void;
  activeMedicationsCount: number;
  allMedicationsCount: number;
  sortBy: string;
  setSortBy: (v: any) => void;
  filteredMedications: any[];
  medications: any[];
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (v: string) => void;
  brands: string[];
  selectedBrand: string;
  setSelectedBrand: (v: string) => void;
  resetFilters: () => void;
  activeSearchTerm: string;
  paginatedMedications: any[];
  batches: any[];
  error?: Error | null;
  selectedMedication: any;
  setSelectedMedication: (v: any) => void;
  setMedicationName: (v: string) => void;
  setIsEditingMedication: (v: boolean) => void;
  handleDeleteMedication: (id: string) => void;
  setIsAddingBatch: (v: boolean) => void;
  setBatchNumber: (v: string) => void;
  setExpiryMonth: (v: string) => void;
  setExpiryYear: (v: string) => void;
  setQuantity: (v: string) => void;
  setEditingBatch: (v: any) => void;
  setIsEditingBatch: (v: boolean) => void;
  handleDeleteBatch: (id: string) => void;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (v: number) => void;
}

export function MainDashboard(props: MainDashboardProps) {
  const scrollPosRef = useRef(0);
  const {
    isDataLoading,
    loadingProgress,
    searchTerm,
    setSearchTerm,
    setActiveSearchTerm,
    setIsScanning,
    setIsGS1Scanning,
    setScannedBarcode,
    setIsAddingMedication,
    showAll,
    setShowAll,
    activeMedicationsCount,
    allMedicationsCount,
    sortBy,
    setSortBy,
    filteredMedications,
    medications,
    categories,
    selectedCategory,
    setSelectedCategory,
    brands,
    selectedBrand,
    setSelectedBrand,
    resetFilters,
    activeSearchTerm,
    paginatedMedications,
    batches,
    error,
    selectedMedication,
    setSelectedMedication,
    setMedicationName,
    setIsEditingMedication,
    handleDeleteMedication,
    setIsAddingBatch,
    setBatchNumber,
    setExpiryMonth,
    setExpiryYear,
    setQuantity,
    setEditingBatch,
    setIsEditingBatch,
    handleDeleteBatch,
    currentPage,
    totalPages,
    setCurrentPage
  } = props;

  return (
    <main className={cn(
      "max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 pb-2 sm:pb-4 border border-t-0 border-premium-border bg-premium-bg shadow-premium-soft mt-0 transition-all duration-500 rounded-none mb-0",
      selectedMedication ? "pt-2 sm:pt-3 space-y-4" : "pt-4 sm:pt-6 space-y-6 sm:space-y-10"
    )}>
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            key="error-banner"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            <div className={cn(
              "px-4 py-3 rounded-2xl flex flex-col sm:flex-row items-center gap-3 border shadow-sm",
              (error as any).quotaExceeded 
                ? "bg-amber-50 border-amber-100 text-amber-800" 
                : "bg-red-50 border-red-100 text-red-800"
            )}>
              <div className="flex items-center gap-3 flex-1">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                  (error as any).quotaExceeded ? "bg-amber-100/50" : "bg-red-100/50"
                )}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-xs font-black uppercase tracking-wider mb-0.5">
                    {(error as any).quotaExceeded ? 'Daily Quota Limit Reached' : 'System Error'}
                  </p>
                  <p className="text-sm font-medium opacity-90">{error.message}</p>
                </div>
              </div>
              <button 
                onClick={() => window.location.reload()}
                className={cn(
                  "mt-2 sm:mt-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all hover:scale-105 active:scale-95",
                  (error as any).quotaExceeded 
                    ? "bg-amber-100 border-amber-200 hover:bg-amber-200" 
                    : "bg-red-100 border-red-200 hover:bg-red-200"
                )}
              >
                Refresh App
              </button>
            </div>
          </motion.div>
        )}
        {selectedMedication ? (
          <MedicationDetails
            key="medication-details-view"
            med={selectedMedication}
            batches={batches}
            onBack={() => {
              setSelectedMedication(null);
              // Small delay to ensure the content has rendered before restoring scroll
              setTimeout(() => {
                window.scrollTo(0, scrollPosRef.current);
              }, 0);
            }}
            onEditMedication={(med) => {
              setMedicationName(med.name);
              setScannedBarcode(med.barcode || '');
              setIsEditingMedication(true);
              setIsAddingMedication(true);
            }}
            onDeleteMedication={handleDeleteMedication}
            onAddBatch={() => {
              setIsAddingBatch(true);
              setBatchNumber('');
              setExpiryMonth((new Date().getMonth() + 1).toString());
              setExpiryYear(new Date().getFullYear().toString());
              setQuantity('');
            }}
            onEditBatch={(batch) => {
              setEditingBatch(batch);
              setBatchNumber(batch.batchNumber);
              setExpiryMonth((toDate(batch.expiryDate).getMonth() + 1).toString());
              setExpiryYear(toDate(batch.expiryDate).getFullYear().toString());
              setQuantity(batch.quantity.toString());
              setIsEditingBatch(true);
              setIsAddingBatch(true);
            }}
            onDeleteBatch={handleDeleteBatch}
          />
        ) : (
          <motion.div
            key="dashboard-main-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 sm:space-y-8"
          >
            <SearchActions
              onScanClick={() => setIsScanning(true)}
              onGS1ScanClick={() => setIsGS1Scanning(true)}
            />

            <StatsFilter
              showAll={showAll}
              onShowAllChange={setShowAll}
              activeCount={activeMedicationsCount}
              allCount={allMedicationsCount}
              sortBy={sortBy as any}
              onSortChange={setSortBy}
              filteredCount={filteredMedications.length}
              totalCount={medications.length}
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              brands={brands}
              selectedBrand={selectedBrand}
              onBrandChange={setSelectedBrand}
              onAddNewClick={() => {
                setScannedBarcode('');
                setIsAddingMedication(true);
              }}
              resetFilters={resetFilters}
              activeSearchTerm={activeSearchTerm}
              hideToggleOnDesktop={true}
            />

            <div className="relative min-h-[400px]">
              <div className="mb-6 flex flex-col lg:flex-row lg:items-center gap-4">
                <MedicationToggle
                  showAll={showAll}
                  onShowAllChange={setShowAll}
                  activeCount={activeMedicationsCount}
                  allCount={allMedicationsCount}
                  className="hidden lg:flex"
                />
                <div className="flex-1">
                  <SearchBar 
                    searchTerm={searchTerm}
                    onSearchTermChange={setSearchTerm}
                    onExecuteSearch={setActiveSearchTerm}
                  />
                  {activeSearchTerm && !isDataLoading && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 px-1"
                    >
                      <p className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                        <span>Showing <span className="text-blue-600">{filteredMedications.length}</span> {filteredMedications.length === 1 ? 'result' : 'results'} for "<span className="text-slate-900">{activeSearchTerm}</span>"</span>
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>
              <AnimatePresence mode="wait">
                {isDataLoading ? (
                  <motion.div
                    key="loader"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col items-center justify-start pt-12 pb-20 z-10"
                  >
                    <div className="relative w-20 h-20 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90">
                        <circle
                          cx="40"
                          cy="40"
                          r="36"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="5"
                          className="text-slate-100"
                        />
                        <motion.circle
                          cx="40"
                          cy="40"
                          r="36"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="5"
                          strokeDasharray="226.2"
                          initial={{ strokeDashoffset: 226.2 }}
                          animate={{ strokeDashoffset: 226.2 - (226.2 * loadingProgress) / 100 }}
                          className="text-blue-600"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-sm font-black text-slate-900">{loadingProgress}%</span>
                      </div>
                    </div>
                    <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">
                      Synchronizing Data
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    {filteredMedications.length === 0 ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-[2rem] p-16 text-center border border-dashed border-slate-200 shadow-sm"
                      >
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Search className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No medications found</h3>
                        <p className="text-slate-500 max-w-xs mx-auto leading-relaxed">
                          We couldn't find any medications matching your search or filters. 
                          Try adjusting your criteria or switching to <span className="text-blue-600 font-bold">All Medications</span>.
                        </p>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={resetFilters}
                          className="mt-8 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center gap-2 mx-auto"
                        >
                          <span>Clear all filters</span>
                        </motion.button>
                      </motion.div>
                    ) : (
                      <>
                        <div className="space-y-4">
                          {paginatedMedications.map((med, idx) => (
                            <MedicationItem
                              key={`${med.id}-${idx}`}
                              med={med}
                              batches={batches}
                              onSelect={() => {
                                scrollPosRef.current = window.scrollY;
                                setSelectedMedication(med);
                              }}
                            />
                          ))}
                        </div>

                        <Pagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          onPageChange={setCurrentPage}
                        />
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
