import React, { useLayoutEffect } from 'react';
import { 
  Package, Calendar, Edit2, Trash2, Hash, Barcode, 
  LayoutGrid, Truck, Building2, Plus, Tag, ArrowLeft 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, isBefore, startOfDay, addMonths } from 'date-fns';
import { cn, toDate } from '../lib/utils';
import { Medication, Batch } from '../types';

interface MedicationDetailsProps {
  med: Medication;
  batches: Batch[];
  onBack: () => void;
  onEditMedication: (med: Medication) => void;
  onDeleteMedication: (id: string) => void;
  onAddBatch: () => void;
  onEditBatch: (batch: Batch) => void;
  onDeleteBatch: (id: string) => void;
}

export const MedicationDetails = ({
  med,
  batches,
  onBack,
  onEditMedication,
  onDeleteMedication,
  onAddBatch,
  onEditBatch,
  onDeleteBatch
}: MedicationDetailsProps) => {
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const medBatches = batches.filter(b => b.medicationId === med.id);
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-2.5 sm:space-y-4 lg:space-y-6"
    >
      {/* Header / Back Button */}
      <div className="flex items-center gap-3 sm:gap-5">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm hover:shadow-md group shrink-0"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        </button>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm sm:text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-tight uppercase truncate">
            {med.name}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">
        {/* Left Column: Info Cards */}
        <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-6">
          <div className="bg-premium-bg rounded-[20px] border border-premium-card-border p-5 shadow-spec-soft space-y-4">
            <div className="flex items-center justify-between border-b border-spec-divider pb-3">
              <h3 className="text-[13px] font-bold text-brand-blue-start uppercase tracking-[0.05em] flex items-center gap-2">
                <LayoutGrid className="w-3.5 h-3.5" />
                Specifications
              </h3>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onEditMedication(med)}
                  className="p-1.5 bg-spec-action-bg text-premium-secondary hover:text-brand-blue-start transition-all rounded-spec-action"
                  title="Edit Medication"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDeleteMedication(med.id)}
                  className="p-1.5 bg-spec-action-bg text-premium-secondary hover:text-rose-600 transition-all rounded-spec-action"
                  title="Delete Medication"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2 bg-white rounded-spec-card border border-premium-card-border shadow-spec-soft transition-all hover:border-brand-blue-start group">
                <div className="w-8 h-8 bg-premium-bg rounded-spec-icon flex items-center justify-center text-icon-blue shrink-0 border border-spec-icon-border transition-colors group-hover:bg-white">
                  <Hash className="w-4 h-4" />
                </div>
                <div className="flex items-center justify-between flex-1 min-w-0 pr-1">
                  <p className="text-[12px] font-semibold text-premium-secondary uppercase tracking-[0.02em] mr-2 whitespace-nowrap">ITEM CODE</p>
                  <p className="text-[15px] font-bold text-spec-value truncate">{med.itemCode || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2 bg-white rounded-spec-card border border-premium-card-border shadow-spec-soft transition-all hover:border-brand-blue-start group">
                <div className="w-8 h-8 bg-premium-bg rounded-spec-icon flex items-center justify-center text-icon-blue shrink-0 border border-spec-icon-border transition-colors group-hover:bg-white">
                  <Barcode className="w-4 h-4" />
                </div>
                <div className="flex items-center justify-between flex-1 min-w-0 pr-1">
                  <p className="text-[12px] font-semibold text-premium-secondary uppercase tracking-[0.02em] mr-2 whitespace-nowrap">BARCODE</p>
                  <p className="text-[15px] font-bold text-spec-value truncate">{med.barcode || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2 bg-white rounded-spec-card border border-premium-card-border shadow-spec-soft transition-all hover:border-brand-blue-start group">
                <div className="w-8 h-8 bg-premium-bg rounded-spec-icon flex items-center justify-center text-icon-green shrink-0 border border-spec-icon-border transition-colors group-hover:bg-white">
                  <Tag className="w-4 h-4" />
                </div>
                <div className="flex items-center justify-between flex-1 min-w-0 pr-1">
                  <p className="text-[12px] font-semibold text-premium-secondary uppercase tracking-[0.02em] mr-2 whitespace-nowrap">GTIN</p>
                  <p className="text-[15px] font-bold text-spec-value truncate">{med.gtin || 'UNDEFINED'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2 bg-white rounded-spec-card border border-premium-card-border shadow-spec-soft transition-all hover:border-brand-blue-start group">
                <div className="w-8 h-8 bg-premium-bg rounded-spec-icon flex items-center justify-center text-icon-orange shrink-0 border border-spec-icon-border transition-colors group-hover:bg-white">
                  <Truck className="w-4 h-4" />
                </div>
                <div className="flex items-center justify-between flex-1 min-w-0 pr-1">
                  <p className="text-[12px] font-semibold text-premium-secondary uppercase tracking-[0.02em] mr-2 whitespace-nowrap">SUPPLIER</p>
                  <p className="text-[15px] font-bold text-spec-value truncate">{med.supplierName || 'System Default'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2 bg-white rounded-spec-card border border-premium-card-border shadow-spec-soft transition-all hover:border-brand-blue-start group">
                <div className="w-8 h-8 bg-premium-bg rounded-spec-icon flex items-center justify-center text-icon-purple shrink-0 border border-spec-icon-border transition-colors group-hover:bg-white">
                  <LayoutGrid className="w-4 h-4" />
                </div>
                <div className="flex items-center justify-between flex-1 min-w-0 pr-1">
                  <p className="text-[12px] font-semibold text-premium-secondary uppercase tracking-[0.02em] mr-2 whitespace-nowrap">LOCATION</p>
                  <p className="text-[15px] font-bold text-spec-value truncate">{med.category || 'Stock'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2 bg-white rounded-spec-card border border-premium-card-border shadow-spec-soft transition-all hover:border-brand-blue-start group">
                <div className="w-8 h-8 bg-premium-bg rounded-spec-icon flex items-center justify-center text-icon-red shrink-0 border border-spec-icon-border transition-colors group-hover:bg-white">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="flex items-center justify-between flex-1 min-w-0 pr-1">
                  <p className="text-[12px] font-semibold text-premium-secondary uppercase tracking-[0.02em] mr-2 whitespace-nowrap">BRAND</p>
                  <p className="text-[15px] font-bold text-spec-value truncate">{med.brandName || 'Generics'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2 bg-white rounded-spec-card border border-premium-card-border shadow-spec-soft transition-all hover:border-brand-blue-start group">
                <div className="w-8 h-8 bg-premium-bg rounded-spec-icon flex items-center justify-center text-premium-secondary shrink-0 border border-spec-icon-border transition-colors group-hover:bg-white">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="flex items-center justify-between flex-1 min-w-0 pr-1">
                  <p className="text-[12px] font-semibold text-premium-secondary uppercase tracking-[0.02em] mr-2 whitespace-nowrap">MODIFIED</p>
                  <p className="text-[15px] font-bold text-spec-value truncate">
                    {format(toDate(med.updatedAt), 'dd MMM yyyy')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Batches List */}
        <div className="lg:col-span-8">
          <div className="bg-premium-bg rounded-[20px] border border-premium-card-border p-5 shadow-spec-soft space-y-5 lg:min-h-full">
            <div className="flex items-center justify-between border-b border-spec-divider pb-3">
              <div>
                <h3 className="text-lg font-bold text-premium-title tracking-tight flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-brand-blue-start rounded-full" />
                  Batches
                </h3>
              </div>
              <button
                onClick={onAddBatch}
                className="px-5 py-2.5 bg-gradient-to-br from-brand-blue-start to-brand-blue-end text-white rounded-button-primary font-bold text-[10px] uppercase tracking-[0.15em] hover:brightness-110 transition-all shadow-premium-soft flex items-center gap-2 active:scale-95 group"
              >
                <Plus className="w-3.5 h-3.5 transition-transform group-hover:rotate-90" strokeWidth={3} />
                <span>ADD BATCH</span>
              </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              {medBatches.length === 0 ? (
                <div className="col-span-full bg-white rounded-spec-card border border-premium-card-border p-8 text-center shadow-spec-soft">
                  <div className="w-10 h-10 bg-premium-bg rounded-full flex items-center justify-center mx-auto mb-3 border border-spec-icon-border">
                    <Package className="w-5 h-5 text-premium-subtitle" />
                  </div>
                  <h4 className="text-premium-title text-xs font-bold mb-0.5">No batches</h4>
                  <p className="text-premium-secondary text-[11px]">Start tracking by registering your first batch.</p>
                </div>
              ) : (
                medBatches.map((batch, idx) => {
                const isExpired = isBefore(toDate(batch.expiryDate), startOfDay(new Date()));
                const isExpiringSoon = isBefore(toDate(batch.expiryDate), addMonths(new Date(), 3)) && !isExpired;
                
                return (
                  <div 
                    key={`${batch.id}-${idx}`}
                    className={cn(
                        "bg-white rounded-spec-card border p-4 shadow-spec-soft hover:shadow-indigo-100/50 transition-all relative overflow-hidden group border-premium-card-border",
                        isExpired && "border-rose-200 ring-1 ring-rose-500/10",
                        isExpiringSoon && "border-orange-200 ring-1 ring-orange-500/10",
                        !isExpired && !isExpiringSoon && "hover:border-brand-blue-start"
                      )}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            isExpired ? "bg-rose-500 animate-pulse" : isExpiringSoon ? "bg-orange-500 animate-pulse" : "bg-emerald-500"
                          )} />
                          <span className={cn(
                            "text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border",
                            isExpired ? "text-rose-600 bg-rose-50 border-rose-100" : isExpiringSoon ? "text-orange-600 bg-orange-50 border-orange-100" : "text-emerald-600 bg-emerald-50 border-emerald-100"
                          )}>
                            {isExpired ? 'Expired' : isExpiringSoon ? 'Expiring Soon' : 'Valid Stock'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onEditBatch(batch)}
                            className="p-1.5 bg-spec-action-bg text-premium-secondary hover:text-brand-blue-start transition-all rounded-spec-action"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteBatch(batch.id)}
                            className="p-1.5 bg-spec-action-bg text-premium-secondary hover:text-rose-600 transition-all rounded-spec-action"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        {/* Row 1: Batch */}
                        <div className="flex items-center gap-3 p-2 bg-white rounded-spec-card border border-premium-card-border shadow-spec-soft transition-all hover:border-brand-blue-start group/row">
                          <div className="w-8 h-8 bg-premium-bg rounded-spec-icon flex items-center justify-center text-icon-blue shrink-0 border border-spec-icon-border transition-colors group-hover/row:bg-white">
                            <Hash className="w-4 h-4" />
                          </div>
                          <div className="flex items-center justify-between flex-1 min-w-0 pr-1">
                            <p className="text-[12px] font-semibold text-premium-secondary uppercase tracking-[0.02em] mr-2 whitespace-nowrap">BATCH NO</p>
                            <p className="text-[15px] font-bold text-spec-value truncate">{batch.batchNumber}</p>
                          </div>
                        </div>

                        {/* Row 2: Quantity */}
                        <div className="flex items-center gap-3 p-2 bg-white rounded-spec-card border border-premium-card-border shadow-spec-soft transition-all hover:border-brand-blue-start group/row">
                          <div className="w-8 h-8 bg-premium-bg rounded-spec-icon flex items-center justify-center text-icon-blue shrink-0 border border-spec-icon-border transition-colors group-hover/row:bg-white">
                            <Package className="w-4 h-4" />
                          </div>
                          <div className="flex items-center justify-between flex-1 min-w-0 pr-1">
                            <p className="text-[12px] font-semibold text-premium-secondary uppercase tracking-[0.02em] mr-2 whitespace-nowrap">QUANTITY</p>
                            <p className="text-[15px] font-bold text-spec-value truncate">{batch.quantity} {batch.quantity === 1 ? 'UNIT' : 'UNITS'}</p>
                          </div>
                        </div>

                        {/* Row 3: Expiry */}
                        <div className={cn(
                          "flex items-center gap-3 p-2 bg-white rounded-spec-card border shadow-spec-soft transition-all hover:border-brand-blue-start group/row",
                          isExpired ? "border-rose-100 bg-rose-50/30" : isExpiringSoon ? "border-orange-100 bg-orange-50/30" : "border-premium-card-border"
                        )}>
                          <div className={cn(
                            "w-8 h-8 rounded-spec-icon flex items-center justify-center shrink-0 border transition-all",
                            isExpired ? "bg-white text-rose-500 border-rose-100" : isExpiringSoon ? "bg-white text-orange-500 border-orange-100" : "bg-premium-bg text-premium-secondary border-spec-icon-border group-hover/row:bg-white"
                          )}>
                            <Calendar className="w-4 h-4" />
                          </div>
                          <div className="flex items-center justify-between flex-1 min-w-0 pr-1">
                            <p className="text-[12px] font-semibold text-premium-secondary uppercase tracking-[0.02em] mr-2 whitespace-nowrap">EXPIRY DATE</p>
                            <p className={cn(
                              "text-[15px] font-bold truncate",
                              isExpired ? "text-rose-600" : isExpiringSoon ? "text-orange-600" : "text-spec-value"
                            )}>
                              {format(toDate(batch.expiryDate), 'MMM-yyyy').toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
