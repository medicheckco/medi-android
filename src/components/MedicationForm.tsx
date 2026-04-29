import { XCircle, Pill, Hash, Barcode as BarcodeIcon, LayoutGrid, Truck, Building2, ScanBarcode, CheckCircle2, Tag, QrCode } from 'lucide-react';
import { motion } from 'motion/react';
import { Medication } from '../types';

interface MedicationFormProps {
  isEditing: boolean;
  medication: Medication | null;
  medicationName: string;
  scannedBarcode: string;
  gtinValue: string;
  isSubmitting: boolean;
  onMedicationNameChange: (name: string) => void;
  onBarcodeChange: (barcode: string) => void;
  onGtinChange: (gtin: string) => void;
  onScanBarcode: () => void;
  onScanGTIN: () => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const MedicationForm = ({
  isEditing,
  medication,
  medicationName,
  scannedBarcode,
  gtinValue,
  isSubmitting,
  onMedicationNameChange,
  onBarcodeChange,
  onGtinChange,
  onScanBarcode,
  onScanGTIN,
  onClose,
  onSubmit
}: MedicationFormProps) => {
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
              <h3 className="text-[17px] font-bold text-[#101828] tracking-tight">{isEditing ? 'Edit Medication' : 'Add Medication'}</h3>
              <p className="text-[12px] text-[#98A2B3] font-medium leading-tight mt-0.5">Enter the medication details below</p>
            </div>
            <button 
              type="button" 
              onClick={onClose} 
              className="w-7 h-7 flex items-center justify-center text-[#98A2B3] bg-[#F2F4F7] hover:bg-[#E4E7EC] rounded-full transition-all"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 sm:p-5 space-y-2.5 sm:space-y-3 bg-white">
            <div className="space-y-0.5">
              <label className="text-[11px] font-bold text-[#98A2B3] uppercase tracking-wider px-1">Medication Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                  <Pill className="w-4 h-4 text-[#98A2B3] group-focus-within:text-[#2F5BFF] transition-colors" />
                </div>
                <input
                  type="text"
                  name="name"
                  placeholder="Panadol Advance 24s tablets"
                  value={medicationName}
                  onChange={(e) => onMedicationNameChange(e.target.value)}
                  required
                  className="w-full h-10 sm:h-11 pl-10 pr-4 bg-[#F9FAFB] border border-[#E4E7EC] rounded-[14px] text-sm font-bold text-[#101828] placeholder:text-[#D0D5DD] focus:bg-white focus:border-[#2F5BFF] transition-all outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <div className="space-y-0.5">
                <label className="text-[11px] font-bold text-[#98A2B3] uppercase tracking-wider px-1">Item Code</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                    <Hash className="w-4 h-4 text-[#98A2B3] group-focus-within:text-[#2F5BFF] transition-colors" />
                  </div>
                  <input
                    type="text"
                    name="itemCode"
                    placeholder="123456789"
                    defaultValue={medication?.itemCode || ''}
                    className="w-full h-10 sm:h-11 pl-10 pr-4 bg-[#F9FAFB] border border-[#E4E7EC] rounded-[14px] text-sm font-bold text-[#101828] placeholder:text-[#D0D5DD] focus:bg-white focus:border-[#2F5BFF] transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-0.5">
                <label className="text-[11px] font-bold text-[#98A2B3] uppercase tracking-wider px-1">GTIN</label>
                <div className="flex gap-2">
                  <div className="relative flex-1 group">
                    <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                      <Tag className="w-4 h-4 text-[#98A2B3] group-focus-within:text-[#2F5BFF] transition-colors" />
                    </div>
                    <input
                      type="text"
                      name="gtin"
                      placeholder="01234567890123"
                      value={gtinValue}
                      onChange={(e) => onGtinChange(e.target.value)}
                      className="w-full h-10 sm:h-11 pl-10 pr-4 bg-[#F9FAFB] border border-[#E4E7EC] rounded-[14px] text-sm font-bold text-[#101828] placeholder:text-[#D0D5DD] focus:bg-white focus:border-[#2F5BFF] transition-all outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={onScanGTIN}
                    className="w-10 h-10 sm:w-11 sm:h-11 bg-[#F2F4F7] text-[#2F5BFF] rounded-[14px] flex items-center justify-center hover:bg-[#E4E7EC] transition-all shrink-0 border border-[#EAECF0] active:scale-95 shadow-sm"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-0.5">
                <label className="text-[11px] font-bold text-[#98A2B3] uppercase tracking-wider px-1">Barcode</label>
                <div className="flex gap-2">
                  <div className="relative flex-1 group">
                    <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                      <BarcodeIcon className="w-4 h-4 text-[#98A2B3] group-focus-within:text-[#2F5BFF] transition-colors" />
                    </div>
                    <input
                      type="text"
                      name="barcode"
                      placeholder="987654321"
                      value={scannedBarcode}
                      onChange={(e) => onBarcodeChange(e.target.value)}
                      className="w-full h-10 sm:h-11 pl-10 pr-4 bg-[#F9FAFB] border border-[#E4E7EC] rounded-[14px] text-sm font-bold text-[#101828] placeholder:text-[#D0D5DD] focus:bg-white focus:border-[#2F5BFF] transition-all outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={onScanBarcode}
                    className="w-10 h-10 sm:w-11 sm:h-11 bg-[#F2F4F7] text-[#2F5BFF] rounded-[14px] flex items-center justify-center hover:bg-[#E4E7EC] transition-all shrink-0 border border-[#EAECF0] active:scale-95 shadow-sm"
                  >
                    <ScanBarcode className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-0.5">
              <label className="text-[11px] font-bold text-[#98A2B3] uppercase tracking-wider px-1">Location</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                  <LayoutGrid className="w-4 h-4 text-[#98A2B3] group-focus-within:text-[#2F5BFF] transition-colors" />
                </div>
                <input
                  type="text"
                  name="category"
                  placeholder="Shelf A1 or Backwall"
                  defaultValue={medication?.category || ''}
                  className="w-full h-10 sm:h-11 pl-10 pr-4 bg-[#F9FAFB] border border-[#E4E7EC] rounded-[14px] text-sm font-bold text-[#101828] placeholder:text-[#D0D5DD] focus:bg-white focus:border-[#2F5BFF] transition-all outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <div className="space-y-0.5">
                <label className="text-[11px] font-bold text-[#98A2B3] uppercase tracking-wider px-1">Supplier</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                    <Truck className="w-4 h-4 text-[#98A2B3] group-focus-within:text-[#2F5BFF] transition-colors" />
                  </div>
                  <input
                    type="text"
                    name="supplierName"
                    placeholder="ABC DRUGSTORE"
                    defaultValue={medication?.supplierName || ''}
                    className="w-full h-10 sm:h-11 pl-10 pr-4 bg-[#F9FAFB] border border-[#E4E7EC] rounded-[14px] text-sm font-bold text-[#101828] placeholder:text-[#D0D5DD] focus:bg-white focus:border-[#2F5BFF] transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-0.5">
                <label className="text-[11px] font-bold text-[#98A2B3] uppercase tracking-wider px-1">Brand Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                    <Building2 className="w-4 h-4 text-[#98A2B3] group-focus-within:text-[#2F5BFF] transition-colors" />
                  </div>
                  <input
                    type="text"
                    name="brandName"
                    placeholder="PANADOL"
                    defaultValue={medication?.brandName || ''}
                    className="w-full h-10 sm:h-11 pl-10 pr-4 bg-[#F9FAFB] border border-[#E4E7EC] rounded-[14px] text-sm font-bold text-[#101828] placeholder:text-[#D0D5DD] focus:bg-white focus:border-[#2F5BFF] transition-all outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 sm:p-4 bg-[#FCFCFD] border-t border-[#F2F4F7] shrink-0">
            <button
              type="submit"
              disabled={!medicationName || isSubmitting}
              className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-[#2F5BFF] to-[#4A6CFF] text-white rounded-[14px] font-bold shadow-[0_6px_14px_rgba(47,91,255,0.18)] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2.5 text-sm"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
              {isEditing ? 'Update Medication' : 'Save Medication'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
