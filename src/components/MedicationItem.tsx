import React, { useRef, useEffect } from 'react';
import { Package, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, isBefore, startOfDay, addMonths } from 'date-fns';
import { cn, toDate } from '../lib/utils';
import { Medication, Batch } from '../types';

interface MedicationItemProps {
  med: Medication;
  batches: Batch[];
  isSelected: boolean;
  onSelect: () => void;
  onEditMedication: (med: Medication) => void;
  onDeleteMedication: (id: string) => void;
  onAddBatch: () => void;
  onEditBatch: (batch: Batch) => void;
  onDeleteBatch: (id: string) => void;
}

export const MedicationItem = ({
  med,
  batches,
  onSelect
}: Omit<MedicationItemProps, 'isSelected' | 'onEditMedication' | 'onDeleteMedication' | 'onAddBatch' | 'onEditBatch' | 'onDeleteBatch'>) => {
  const medBatches = batches.filter(b => b.medicationId === med.id);
  const expiredCount = medBatches.filter(b => isBefore(toDate(b.expiryDate), startOfDay(new Date()))).length;
  const expiringSoonCount = medBatches.filter(b => {
    const date = toDate(b.expiryDate);
    return isBefore(date, addMonths(new Date(), 3)) && !isBefore(date, startOfDay(new Date()));
  }).length;

  return (
    <div
      onClick={onSelect}
      className={cn(
        "group bg-white rounded-card border border-premium-card-border shadow-premium-soft hover:shadow-indigo-100/50 transition-all duration-300 relative overflow-hidden cursor-pointer active:scale-[0.99] p-4 sm:p-5 lg:p-6"
      )}
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-blue-start opacity-0 group-hover:opacity-100 transition-all duration-300" />
      
      <div className="absolute top-0 right-0 flex items-start z-10 pointer-events-none">
        {expiringSoonCount > 0 && (
          <div className="px-2 sm:px-3 py-1 bg-expiry-bg text-expiry-text text-[9px] sm:text-[11px] font-semibold uppercase tracking-wider border-b border-l border-expiry-bg/50 rounded-bl-badge shadow-sm">
            Near Expiry
          </div>
        )}
        {expiredCount > 0 && (
          <div className="px-2 sm:px-3 py-1 bg-rose-50 text-rose-600 text-[9px] sm:text-[11px] font-semibold uppercase tracking-wider border-b border-l border-rose-100 rounded-bl-badge shadow-sm">
            Expired
          </div>
        )}
      </div>
      
      <div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 lg:gap-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-1 sm:gap-2 lg:gap-8 flex-1 min-w-0">
            <h3 className="text-sm sm:text-lg lg:text-xl font-bold text-premium-title group-hover:text-brand-blue-start transition-colors truncate mb-0 lg:max-w-md xl:max-w-xl">
              {med.name}
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 lg:gap-6 text-xs sm:text-sm text-premium-secondary">
              {medBatches.length > 0 ? (
                medBatches.slice(0, 2).map((batch, idx) => {
                  const isExpired = isBefore(toDate(batch.expiryDate), startOfDay(new Date()));
                  const isExpiringSoon = isBefore(toDate(batch.expiryDate), addMonths(new Date(), 3)) && !isExpired;
                  return (
                    <div key={`summary-${batch.id}-${idx}`} className="flex items-center gap-2 font-medium lg:bg-tab-inactive-bg/50 lg:pl-3 lg:pr-4 lg:py-2 lg:rounded-card lg:border lg:border-premium-border lg:shadow-premium-soft transition-all group-hover:lg:bg-tab-inactive-bg group-hover:lg:shadow-md">
                      <div className="flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-blue-start" />
                        <span className="text-brand-blue-start font-semibold whitespace-nowrap">
                          {batch.quantity} {batch.quantity === 1 ? 'unit' : 'units'}
                        </span>
                      </div>
                      <span className="hidden sm:inline text-premium-subtitle font-bold">•</span>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-premium-subtitle" />
                        <span className={cn(
                          "whitespace-nowrap font-semibold truncate",
                          isExpired ? "text-rose-600" : isExpiringSoon ? "text-expiry-text" : "text-premium-title"
                        )}>
                          {format(toDate(batch.expiryDate), 'MMM-yyyy').toUpperCase()}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-premium-subtitle italic">No batches registered</p>
              )}
              {medBatches.length > 2 && (
                <p className="text-[10px] sm:text-xs text-brand-blue-start font-semibold uppercase tracking-widest sm:ml-0 lg:bg-tab-inactive-bg lg:px-2 lg:py-0.5 lg:rounded-md">
                  + {medBatches.length - 2} more
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
