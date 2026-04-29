import React, { useRef, useEffect, useMemo } from 'react';
import { XCircle, Hash, Package, Calendar, ScanBarcode, CheckCircle2, QrCode } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { Batch } from '../types';

interface BatchFormProps {
  isEditing: boolean;
  medicationName: string;
  batchNumber: string;
  expiryMonth: string;
  expiryYear: string;
  quantity: string;
  isSubmitting: boolean;
  onBatchNumberChange: (num: string) => void;
  onExpiryMonthChange: (month: string) => void;
  onExpiryYearChange: (year: string) => void;
  onQuantityChange: (qty: string) => void;
  onStartOCR: () => void;
  onStartGS1: () => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const BatchForm = ({
  isEditing,
  medicationName,
  batchNumber,
  expiryMonth,
  expiryYear,
  quantity,
  isSubmitting,
  onBatchNumberChange,
  onExpiryMonthChange,
  onExpiryYearChange,
  onQuantityChange,
  onStartOCR,
  onStartGS1,
  onClose,
  onSubmit
}: BatchFormProps) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 25 }, (_, i) => (currentYear - 1 + i).toString());
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString());

  const monthScrollRef = useRef<HTMLDivElement>(null);
  const yearScrollRef = useRef<HTMLDivElement>(null);
  const isAutoScrolling = useRef(false);
  const isInitializing = useRef(true);
  const [showSelectors, setShowSelectors] = React.useState(false);
  const [isFetchedDate, setIsFetchedDate] = React.useState(false);
  const scrollSettlingTimeout = useRef<{ month: ReturnType<typeof setTimeout> | null, year: ReturnType<typeof setTimeout> | null }>({ month: null, year: null });

  // Detect if date was fetched via scan
  useEffect(() => {
    // If we're not editing and the month/year are set to something other than current date, mark as fetched
    // Or if edit mode but we just want to hide by default until tapped
    if (!isEditing && (expiryMonth !== (new Date().getMonth() + 1).toString() || expiryYear !== new Date().getFullYear().toString())) {
      setIsFetchedDate(true);
      setShowSelectors(false);
    } else if (isEditing) {
      setIsFetchedDate(true);
      setShowSelectors(false);
    }
  }, [batchNumber]); // Use batchNumber as a proxy for scan completion

  useEffect(() => {
    let autoScrollTimeout: ReturnType<typeof setTimeout>;
    
    // Set initializing to false after a delay to allow the form to "settle"
    // This prevents the browsers smooth scroll or snap from triggering a reset
    const settleTimeout = setTimeout(() => {
      isInitializing.current = false;
    }, 800);

    const scrollToSelected = (ref: React.RefObject<HTMLDivElement>, value: string, dataAttr: string, behavior: ScrollBehavior = 'smooth') => {
      if (ref.current) {
        const container = ref.current;
        const selectedElement = container.querySelector(`[${dataAttr}="${value}"]`) as HTMLElement;
        if (selectedElement) {
          const centerOffset = (container.offsetHeight - selectedElement.offsetHeight) / 2;
          const targetScrollTop = selectedElement.offsetTop - centerOffset;
          
          if (Math.abs(container.scrollTop - targetScrollTop) > 2) {
            isAutoScrolling.current = true;
            container.scrollTo({ top: targetScrollTop, behavior });
            
            clearTimeout(autoScrollTimeout);
            autoScrollTimeout = setTimeout(() => { 
              isAutoScrolling.current = false; 
            }, behavior === 'smooth' ? 500 : 50);
          }
        }
      }
    };

    // Use instant scroll on mount or when props change significantly (e.g. from a scan)
    const initTimeout = setTimeout(() => {
      scrollToSelected(monthScrollRef, expiryMonth, 'data-month', 'auto');
      scrollToSelected(yearScrollRef, expiryYear, 'data-year', 'auto');
    }, 50);

    return () => {
      clearTimeout(initTimeout);
      clearTimeout(autoScrollTimeout);
      clearTimeout(settleTimeout);
    };
  }, [expiryMonth, expiryYear]);

  const onScrollHandler = (e: React.UIEvent<HTMLDivElement>, type: 'month' | 'year') => {
    if (isAutoScrolling.current || isInitializing.current) return;
    
    const container = e.currentTarget;
    const scrollTop = container.scrollTop;
    const data = type === 'month' ? months : years;
    const currentVal = type === 'month' ? expiryMonth : expiryYear;
    const changeHandler = type === 'month' ? onExpiryMonthChange : onExpiryYearChange;

    if (scrollSettlingTimeout.current[type]) {
      clearTimeout(scrollSettlingTimeout.current[type]!);
    }

    scrollSettlingTimeout.current[type] = setTimeout(() => {
      if (isAutoScrolling.current || isInitializing.current) return;
      const index = Math.round(scrollTop / 30);
      const val = data[index];
      if (val && val !== currentVal) {
        changeHandler(val);
      }
    }, 150);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/90 backdrop-blur-xl flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-[#FCFCFD] rounded-[24px] overflow-hidden shadow-[0_12px_32px_rgba(16,24,40,0.18)] flex flex-col my-auto border border-[#EAECF0]"
      >
        <form onSubmit={onSubmit} className="flex flex-col min-h-0">
          <div className="p-3 sm:p-4 border-b border-[#F2F4F7] flex items-center justify-between shrink-0">
            <div>
              <h3 className="text-[17px] font-bold text-[#101828] tracking-tight">{isEditing ? 'Edit Batch' : 'Add New Batch'}</h3>
              <p className="text-[12px] text-[#98A2B3] font-medium leading-tight mt-0.5">For: {medicationName}</p>
            </div>
            <button 
              type="button" 
              onClick={onClose} 
              aria-label="Close modal"
              className="w-7 h-7 flex items-center justify-center text-[#98A2B3] bg-[#F2F4F7] hover:bg-[#E4E7EC] rounded-full transition-all"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 sm:p-5 space-y-3 sm:space-y-4 bg-white">
            {/* Smart Scan Buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={onStartOCR}
                className="h-10 sm:h-11 bg-[#2F5BFF] text-white rounded-[14px] flex items-center justify-center gap-2 hover:bg-[#1E4DFF] transition-all shadow-[0_4px_12px_rgba(47,91,255,0.18)] active:scale-95 relative overflow-hidden group"
              >
                <ScanBarcode className="w-4 h-4" />
                <span className="font-bold text-[11px] sm:text-xs">Smart AI</span>
              </button>
              <button
                type="button"
                onClick={onStartGS1}
                className="h-10 sm:h-11 bg-[#00A86B] text-white rounded-[14px] flex items-center justify-center gap-2 hover:bg-[#00945E] transition-all shadow-[0_4px_12px_rgba(0,168,107,0.18)] active:scale-95 relative overflow-hidden group"
              >
                <QrCode className="w-4 h-4" />
                <span className="font-bold text-[11px] sm:text-xs">GS1 Scan</span>
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {/* Batch Number */}
              <div className="space-y-0.5">
              <label className="text-[11px] font-bold text-[#98A2B3] uppercase tracking-wider px-1">Batch Number</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                  <Hash className="w-4 h-4 text-[#98A2B3] group-focus-within:text-[#2F5BFF] transition-colors" />
                </div>
                <input
                  type="text"
                  name="batchNumber"
                  placeholder="e.g. B12345"
                  value={batchNumber}
                  onChange={(e) => onBatchNumberChange(e.target.value)}
                  required
                  className="w-full h-10 sm:h-11 pl-10 pr-4 bg-[#F9FAFB] border border-[#E4E7EC] rounded-[14px] text-sm font-bold text-[#101828] placeholder:text-[#D0D5DD] focus:bg-white focus:border-[#2F5BFF] transition-all outline-none"
                />
              </div>
            </div>

            {/* Expiry Date */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 px-1">
                <Calendar className="w-3.5 h-3.5 text-[#98A2B3]" />
                <label className="text-[11px] font-bold text-[#98A2B3] uppercase tracking-wider">Expiry Date</label>
              </div>
              
              <div className="min-h-[40px]">
                {/* Hidden inputs for form submission */}
                <input type="hidden" name="expiryMonth" value={expiryMonth} />
                <input type="hidden" name="expiryYear" value={expiryYear} />

                {(!showSelectors && isFetchedDate) ? (
                  <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-[#98A2B3] uppercase tracking-tight px-1">Month</span>
                      <button
                        type="button"
                        onClick={() => setShowSelectors(true)}
                        className="w-full h-11 px-4 bg-[#F9FAFB] border border-[#E4E7EC] rounded-[14px] flex items-center justify-center group hover:border-[#2F5BFF] transition-all"
                      >
                        <span className="text-sm font-bold text-[#101828]">
                          {new Date(2000, parseInt(expiryMonth) - 1).toLocaleString('default', { month: 'short' }).toUpperCase()}
                        </span>
                      </button>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-[#98A2B3] uppercase tracking-tight px-1">Year</span>
                      <button
                        type="button"
                        onClick={() => setShowSelectors(true)}
                        className="w-full h-11 px-4 bg-[#F9FAFB] border border-[#E4E7EC] rounded-[14px] flex items-center justify-center group hover:border-[#2F5BFF] transition-all"
                      >
                        <span className="text-sm font-bold text-[#101828]">
                          {expiryYear}
                        </span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <motion.div 
                    initial={isFetchedDate ? { opacity: 0, y: -10 } : false}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-2 gap-2.5 sm:gap-3"
                  >
                    {/* Month Picker Card */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-[#98A2B3] uppercase tracking-tight px-1">Month</span>
                      <div className="relative h-[100px] bg-white border border-[#EAECF0] rounded-[14px] overflow-hidden shadow-[0_2px_8px_rgba(16,24,40,0.05)]">
                        {/* Selection Highlight */}
                        <div className="absolute inset-x-1.5 top-1/2 -translate-y-1/2 h-7.5 bg-[#EEF4FF] rounded-[8px] pointer-events-none z-10" />
                        
                        <div 
                          ref={monthScrollRef}
                          onScroll={(e) => onScrollHandler(e, 'month')}
                          className="h-full overflow-y-auto snap-y snap-mandatory scrollbar-hide relative z-20"
                        >
                          <div className="flex flex-col w-full py-[35px]">
                            {months.map(m => (
                              <button
                                key={m}
                                type="button"
                                data-month={m}
                                onClick={() => onExpiryMonthChange(m)}
                                className={cn(
                                  "snap-center shrink-0 w-full h-[30px] flex items-center justify-center rounded-lg text-[11px] sm:text-[12px] transition-all duration-200",
                                  expiryMonth === m 
                                    ? "text-[#2F5BFF] font-bold scale-105" 
                                    : "text-[#98A2B3] font-medium opacity-60 hover:opacity-100"
                                )}
                              >
                                {new Date(2000, parseInt(m) - 1).toLocaleString('default', { month: 'short' }).toUpperCase()}
                              </button>
                            ))}
                          </div>
                        </div>
                        {/* Fading Masks */}
                        <div className="absolute inset-x-0 top-0 h-7 bg-gradient-to-b from-white to-transparent pointer-events-none z-30" />
                        <div className="absolute inset-x-0 bottom-0 h-7 bg-gradient-to-t from-white to-transparent pointer-events-none z-30" />
                      </div>
                    </div>

                    {/* Year Picker Card */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-[#98A2B3] uppercase tracking-tight px-1">Year</span>
                      <div className="relative h-[100px] bg-white border border-[#EAECF0] rounded-[14px] overflow-hidden shadow-[0_2px_8px_rgba(16,24,40,0.05)]">
                        {/* Selection Highlight */}
                        <div className="absolute inset-x-1.5 top-1/2 -translate-y-1/2 h-7.5 bg-[#EEF4FF] rounded-[8px] pointer-events-none z-10" />
                        
                        <div 
                          ref={yearScrollRef}
                          onScroll={(e) => onScrollHandler(e, 'year')}
                          className="h-full overflow-y-auto snap-y snap-mandatory scrollbar-hide relative z-20"
                        >
                          <div className="flex flex-col w-full py-[35px]">
                            {years.map(y => (
                              <button
                                key={y}
                                type="button"
                                data-year={y}
                                onClick={() => onExpiryYearChange(y)}
                                className={cn(
                                  "snap-center shrink-0 w-full h-[30px] flex items-center justify-center rounded-lg text-[11px] sm:text-[12px] transition-all duration-200",
                                  expiryYear === y 
                                    ? "text-[#2F5BFF] font-bold scale-105" 
                                    : "text-[#98A2B3] font-medium opacity-60 hover:opacity-100"
                                )}
                              >
                                {y}
                              </button>
                            ))}
                          </div>
                        </div>
                        {/* Fading Masks */}
                        <div className="absolute inset-x-0 top-0 h-7 bg-gradient-to-b from-white to-transparent pointer-events-none z-30" />
                        <div className="absolute inset-x-0 bottom-0 h-7 bg-gradient-to-t from-white to-transparent pointer-events-none z-30" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-0.5">
              <label className="text-[11px] font-bold text-[#98A2B3] uppercase tracking-wider px-1">Quantity</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                  <Package className="w-4 h-4 text-[#98A2B3] group-focus-within:text-[#2F5BFF] transition-colors" />
                </div>
                <input
                  type="number"
                  name="quantity"
                  placeholder="Enter quantity"
                  value={quantity}
                  onChange={(e) => onQuantityChange(e.target.value)}
                  required
                  className="w-full h-10 sm:h-11 pl-10 pr-4 bg-[#F9FAFB] border border-[#E4E7EC] rounded-[14px] text-sm font-bold text-[#101828] placeholder:text-[#D0D5DD] focus:bg-white focus:border-[#2F5BFF] transition-all outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-4 bg-[#FCFCFD] border-t border-[#F2F4F7] shrink-0">
            <button
              type="submit"
              disabled={!batchNumber || !expiryMonth || !expiryYear || !quantity || isSubmitting}
              className="w-full py-2.5 sm:py-3.5 bg-gradient-to-r from-[#2F5BFF] to-[#4A6CFF] text-white rounded-[14px] font-bold shadow-[0_6px_14px_rgba(47,91,255,0.18)] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2.5 text-sm"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
              {isEditing ? 'Update Batch' : 'Save Batch'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
