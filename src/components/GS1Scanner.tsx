import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { XCircle, AlertTriangle, QrCode } from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { parseGS1QRCode, GS1Data } from '../lib/gs1Parser';
import { cn } from '../lib/utils';

interface GS1ScannerProps {
  onScan: (data: GS1Data) => void;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

export const GS1Scanner = ({ 
  onScan, 
  onClose,
  title = "GS1 Smart Scan",
  subtitle = "Batch & Expiry Extraction"
}: GS1ScannerProps) => {
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [isInvalid, setIsInvalid] = useState(false);

  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;

    const start = async () => {
      setError(null);
      try {
        html5QrCode = new Html5Qrcode("gs1-reader");
        const config = {
          fps: 25,
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            const size = Math.min(viewfinderWidth * 0.7, viewfinderHeight * 0.7, 300);
            return { width: size, height: size };
          },
          aspectRatio: 1.0,
          formatsToSupport: [ 
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.DATA_MATRIX
          ]
        };

        const handleScan = (decodedText: string) => {
          setLastScanned(decodedText);
          const parsed = parseGS1QRCode(decodedText);
          if (parsed) {
            setIsInvalid(false);
            onScan(parsed);
            if (html5QrCode) {
              html5QrCode.stop().catch(err => console.error("Failed to stop scanner", err));
            }
          } else {
            setIsInvalid(true);
            setTimeout(() => setIsInvalid(false), 2000);
            console.warn("Scanned text is not a valid GS1 QR code:", decodedText);
          }
        };

        try {
          await html5QrCode.start(
            { facingMode: "environment" },
            config,
            handleScan,
            () => {}
          );
        } catch (err) {
          console.warn("Environment camera failed, trying user camera:", err);
          try {
            await html5QrCode.start(
              { facingMode: "user" },
              config,
              handleScan,
              () => {}
            );
          } catch (err2) {
            console.warn("User camera failed, trying any available camera:", err2);
            await html5QrCode.start(
              undefined as any,
              config,
              handleScan,
              () => {}
            );
          }
        }
      } catch (err) {
        console.error("Scanner error:", err);
        setError("Could not access camera. Please ensure you have granted permission and are using a secure connection (HTTPS).");
      }
    };

    start();

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(err => console.error("Failed to stop scanner", err));
      }
    };
  }, [onScan, retryCount]);

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/95 backdrop-blur-2xl flex flex-col items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-sm bg-white rounded-3xl sm:rounded-[2.5rem] overflow-hidden shadow-2xl my-auto flex flex-col max-h-[95vh] sm:max-h-[90vh]"
      >
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <QrCode className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">{title}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{subtitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:bg-slate-100 rounded-full transition-all">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="relative aspect-square bg-slate-950 overflow-hidden shrink min-h-0">
          <div id="gs1-reader" className="w-full h-full overflow-hidden opacity-80"></div>
          
          {!error && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
              <div className={cn(
                "w-[70%] h-[70%] border-2 rounded-3xl relative flex items-center justify-center transition-all duration-300",
                isInvalid ? "border-rose-500 scale-105" : "border-white/10"
              )}>
                <div className={cn(
                  "absolute inset-0 border-2 rounded-3xl animate-pulse opacity-40",
                  isInvalid ? "border-rose-500" : "border-blue-500"
                )} />
                
                {/* Corner Accents */}
                <div className={cn("absolute -top-1 -left-1 w-10 h-10 border-t-4 border-l-4 rounded-tl-xl transition-colors", isInvalid ? "border-rose-500" : "border-blue-500")} />
                <div className={cn("absolute -top-1 -right-1 w-10 h-10 border-t-4 border-r-4 rounded-tr-xl transition-colors", isInvalid ? "border-rose-500" : "border-blue-500")} />
                <div className={cn("absolute -bottom-1 -left-1 w-10 h-10 border-b-4 border-l-4 rounded-bl-xl transition-colors", isInvalid ? "border-rose-500" : "border-blue-500")} />
                <div className={cn("absolute -bottom-1 -right-1 w-10 h-10 border-b-4 border-r-4 rounded-br-xl transition-colors", isInvalid ? "border-rose-500" : "border-blue-500")} />

                {isInvalid && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -bottom-12 bg-rose-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg"
                  >
                    Invalid GS1 Format
                  </motion.div>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-white bg-slate-900/95 backdrop-blur-md">
              <div className="w-16 h-16 bg-rose-500/20 rounded-2xl flex items-center justify-center mb-6">
                <AlertTriangle className="w-8 h-8 text-rose-500" />
              </div>
              <p className="text-sm font-bold mb-8 leading-relaxed">{error}</p>
              <div className="w-full space-y-3">
                <button 
                  onClick={() => setRetryCount(prev => prev + 1)}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
                >
                  Try Again
                </button>
                <button 
                  onClick={onClose}
                  className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black shadow-xl border border-slate-200"
                >
                  Close Scanner
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-8 text-center shrink-0">
          <p className="text-sm font-bold text-slate-500">Center the 2D code in the frame</p>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            We'll automatically extract the <span className="text-blue-600 font-black">Information</span> from the GS1 code.
          </p>
          {lastScanned && isInvalid && (
            <div className="mt-4 p-2 bg-slate-50 rounded-lg border border-slate-100">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mb-1">Raw Scanned Data:</p>
              <p className="text-[10px] font-mono text-slate-600 break-all line-clamp-2">{lastScanned}</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
