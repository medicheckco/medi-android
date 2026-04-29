import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { XCircle, AlertTriangle } from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { cn } from '../lib/utils';

export const BarcodeScanner = ({ onScan, onClose }: { onScan: (barcode: string) => void, onClose: () => void }) => {
  const [error, setError] = useState<string | null>(null);
  const hasScannedRef = useRef(false);
  const [retryCount, setRetryCount] = useState(0);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const start = async () => {
      setError(null);
      hasScannedRef.current = false;
      try {
        const html5QrCode = new Html5Qrcode("reader", {
          verbose: false,
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.CODE_93,
            Html5QrcodeSupportedFormats.CODABAR,
            Html5QrcodeSupportedFormats.ITF,
          ]
        });
        scannerRef.current = html5QrCode;
        
        const config = {
          fps: 25,
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            const width = Math.min(viewfinderWidth * 0.85, 400);
            const height = Math.min(viewfinderHeight * 0.6, 350);
            return { width, height };
          },
          aspectRatio: 1.0,
        };

        const onScanSuccess = (decodedText: string) => {
          if (hasScannedRef.current) return;
          
          hasScannedRef.current = true;
          onScan(decodedText);
          onClose();
        };

        try {
          await html5QrCode.start(
            { facingMode: "environment" },
            config,
            (text) => onScanSuccess(text),
            () => {}
          );
        } catch (err) {
          console.warn("Environment camera failed, trying user camera:", err);
          await html5QrCode.start(
            { facingMode: "user" },
            config,
            (text) => onScanSuccess(text),
            () => {}
          );
        }

      } catch (err) {
        console.error("Scanner error:", err);
        setError("Could not access camera. Please ensure you have granted permission.");
      }
    };

    start();

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(err => console.error("Failed to stop scanner", err));
      }
    };
  }, [retryCount]);

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/90 backdrop-blur-xl flex flex-col items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-sm bg-white rounded-3xl sm:rounded-[2.5rem] overflow-hidden shadow-2xl my-auto flex flex-col max-h-[95vh] sm:max-h-[90vh]"
      >
          <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Barcode Scanner</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Point at 1D Barcode</p>
            </div>
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:bg-slate-100 rounded-full transition-all">
              <XCircle className="w-6 h-6" />
            </button>
          </div>
          <div className="relative aspect-square bg-slate-950 overflow-hidden shrink min-h-0">
            <div id="reader" className="w-full h-full overflow-hidden opacity-90"></div>
            
            {/* Scanner Overlay Guide */}
            {!error && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                <div className="w-[85%] h-[60%] border-2 border-white/10 rounded-3xl relative flex items-center justify-center">
                  <div className="absolute inset-0 border-2 rounded-3xl border-blue-500 animate-pulse delay-75" />
                  
                  {/* Corner Accents */}
                  <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-xl" />
                  <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-xl" />
                  <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-xl" />
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-xl" />
                  
                  {/* Scanning Line Animation */}
                  <motion.div 
                    initial={{ top: '10%' }}
                    animate={{ top: '90%' }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-x-4 h-0.5 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] z-10"
                  />
                </div>
              </div>
            )}

            {/* Error Overlay */}
            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-white bg-slate-900/95 backdrop-blur-md z-30">
                <div className="w-16 h-16 bg-rose-500/20 rounded-2xl flex items-center justify-center mb-6">
                  <AlertTriangle className="w-8 h-8 text-rose-500" />
                </div>
                <p className="text-sm font-bold mb-8 leading-relaxed">{error}</p>
                <div className="w-full space-y-3">
                  <button 
                    type="button"
                    onClick={() => setRetryCount(prev => prev + 1)}
                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
                  >
                    Try Again
                  </button>
                  <button 
                    type="button"
                    onClick={onClose}
                    className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black shadow-xl border border-slate-200"
                  >
                    Close Scanner
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 sm:p-5 flex flex-col items-center gap-2 shrink-0 bg-slate-50/50">
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100">
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse" />
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                Camera Live
              </p>
            </div>
          </div>
      </motion.div>
    </div>
  );
};
