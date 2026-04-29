import React, { useRef } from 'react';
import { Search, XCircle, ScanBarcode, Download, Upload, Plus, QrCode } from 'lucide-react';

interface QuickActionsProps {
  onScanClick: () => void;
  onGS1ScanClick: () => void;
}

export const SearchActions: React.FC<QuickActionsProps> = ({
  onScanClick,
  onGS1ScanClick,
}) => {
  return (
    <div className="grid grid-cols-2 lg:flex lg:items-center gap-2 sm:gap-4 w-full">
      <div className="contents lg:flex lg:items-center lg:gap-3">
        <button
          onClick={onScanClick}
          className="h-11 px-4 lg:w-36 bg-gradient-to-br from-brand-blue-start to-brand-blue-end text-white rounded-button-primary hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-premium-soft font-semibold text-[10px] uppercase tracking-wider w-full lg:flex-none group"
        >
          <ScanBarcode className="w-4 h-4 transition-transform group-hover:scale-110" />
          <span className="truncate">Barcode</span>
        </button>

        <button
          onClick={onGS1ScanClick}
          className="h-11 px-4 lg:w-36 bg-gradient-to-br from-brand-green-start to-brand-green-end text-white rounded-button-primary hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-premium-soft font-semibold text-[10px] uppercase tracking-wider w-full lg:flex-none group"
        >
          <QrCode className="w-4 h-4 transition-transform group-hover:scale-110" />
          <span className="truncate">QR Scan</span>
        </button>
      </div>
    </div>
  );
};

