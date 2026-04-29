import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { XCircle, AlertTriangle, CheckCircle2, ScanBarcode, Upload, RefreshCw, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { scanBatchImage } from '../services/geminiService';

export const BatchOCRScanner = ({ onScan, onClose, onGeminiScan }: { onScan: (details: { batchNumber?: string, expiryMonth?: number, expiryYear?: number }) => void, onClose: () => void, onGeminiScan: (input?: number, output?: number) => void }) => {
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [isContinuous, setIsContinuous] = useState(false);
  const [scanResult, setScanResult] = useState<'success' | 'failed' | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let isMounted = true;

    const startCamera = async () => {
      // Small delay to ensure DOM is ready
      await new Promise(resolve => setTimeout(resolve, 100));
      if (!isMounted) return;

      setError(null);
      try {
        const constraints = [
          // 1. Ideal environment camera
          { video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } } },
          // 2. Any environment camera
          { video: { facingMode: "environment" } },
          // 3. User camera (fallback)
          { video: { facingMode: "user" } },
          // 4. Any camera
          { video: true }
        ];

        let lastError;
        for (const constraint of constraints) {
          try {
            stream = await navigator.mediaDevices.getUserMedia(constraint);
            if (stream) break;
          } catch (err) {
            lastError = err;
            console.warn(`Constraint ${JSON.stringify(constraint)} failed:`, err);
          }
        }

        if (!stream) throw lastError || new Error("Failed to get camera stream");
        
        if (videoRef.current && isMounted) {
          videoRef.current.srcObject = stream;
          // Ensure video plays
          try {
            await videoRef.current.play();
          } catch (playErr) {
            console.error("Video play error:", playErr);
          }
        }
      } catch (err) {
        console.error("Camera error:", err);
        if (isMounted) {
          setError("Could not access camera. Please ensure you have granted permission and are using a secure connection (HTTPS).");
        }
      }
    };

    startCamera();

    return () => {
      isMounted = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [retryCount]);

  const resizeImage = (base64Str: string, maxWidth = 800, maxHeight = 800): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = base64Str;
      img.onerror = () => reject(new Error("Failed to load image for resizing"));
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error("Failed to get canvas context"));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        } catch (err) {
          reject(err);
        }
      };
    });
  };

  const processImage = async (base64Image: string) => {
    setIsScanning(true);
    setScanResult(null);
    setError(null);

    try {
      // Reduced size for faster upload/processing
      const resizedImage = await resizeImage(base64Image, 600, 600);
      const imageData = resizedImage.split(',')[1];

      const { data, usage } = await scanBatchImage(imageData);
      
      onGeminiScan(usage?.promptTokens, usage?.candidatesTokens);

      // Tighten success criteria: require all fields for a valid batch
      if (data && data.batchNumber && data.expiryMonth && data.expiryYear) {
        setScanResult('success');
        
        if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
        
        successTimeoutRef.current = setTimeout(() => {
          onScan({
            batchNumber: data.batchNumber,
            expiryMonth: data.expiryMonth,
            expiryYear: data.expiryYear
          });
          onClose();
        }, 1000);
      } else {
        setScanResult('failed');
      }
    } catch (error) {
      console.error('Scan error:', error);
      setScanResult('failed');
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          setError("AI features are not configured correctly. Please contact support.");
        } else {
          setError(error.message || "Failed to process image. Please try again.");
        }
      }
    } finally {
      setIsScanning(false);
    }
  };

  const captureAndScan = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isScanning || scanResult === 'success') return;

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Ensure video has dimensions
      if (video.videoWidth === 0 || video.videoHeight === 0) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64Image = canvas.toDataURL('image/jpeg', 0.6);
      await processImage(base64Image);
    } catch (err) {
      console.error("Capture error:", err);
    }
  }, [isScanning, scanResult, onScan, onClose, onGeminiScan]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      await processImage(base64);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isContinuous && !isScanning && !scanResult) {
      interval = setInterval(() => {
        captureAndScan();
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isContinuous, isScanning, scanResult, captureAndScan]);

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/90 backdrop-blur-xl flex flex-col items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl sm:rounded-[2.5rem] overflow-hidden shadow-2xl my-auto flex flex-col max-h-[95vh] sm:max-h-[90vh]"
      >
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Smart Batch Scanner</h3>
            <p className="text-xs text-slate-500 font-medium">AI-powered detail extraction</p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            aria-label="Close scanner"
            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:bg-slate-100 rounded-full transition-all"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        
        <div className="relative aspect-[4/3] bg-slate-950 overflow-hidden shrink min-h-0">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover opacity-80"
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Scanning Overlay */}
          <div className="absolute inset-0 border-2 border-white/10 m-10 rounded-3xl pointer-events-none">
            <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-blue-500 rounded-tl-2xl" />
            <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-blue-500 rounded-tr-2xl" />
            <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-blue-500 rounded-bl-2xl" />
            <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-blue-500 rounded-br-2xl" />
          </div>
            
          {isScanning && (
            <motion.div 
              initial={{ top: '0%' }}
              animate={{ top: '100%' }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_20px_rgba(59,130,246,1)]"
            />
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-white bg-slate-900/95 backdrop-blur-md">
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

          <AnimatePresence>
            {scanResult && (
              <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                className={cn(
                  "absolute bottom-6 left-6 right-6 p-4 rounded-2xl flex items-center justify-center gap-3 font-black text-sm shadow-2xl backdrop-blur-xl border",
                  scanResult === 'success' ? "bg-emerald-500/90 text-white border-emerald-400" : "bg-rose-500/90 text-white border-rose-400"
                )}
              >
                {scanResult === 'success' ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Details Extracted!
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5" />
                    Extraction Failed
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-8 flex flex-col items-center gap-8 shrink-0">
          <div className="flex items-center gap-10">
            <label className="flex flex-col items-center gap-2 transition-colors cursor-pointer group">
              <input type="file" accept="image/*" onChange={handleFileUpload} className="sr-only" />
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center border-2 bg-slate-50 border-slate-100 transition-all group-hover:bg-blue-50 group-hover:border-blue-200 group-hover:scale-110">
                <Upload className="w-6 h-6 text-slate-600 group-hover:text-blue-600" />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upload</span>
            </label>

            <button
              type="button"
              onClick={captureAndScan}
              disabled={isScanning}
              className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center text-white shadow-2xl shadow-slate-200 active:scale-90 transition-all disabled:opacity-50 disabled:scale-100 group relative"
            >
              <div className="absolute inset-0 rounded-full border-4 border-white/20 scale-90 group-hover:scale-100 transition-transform" />
              {isScanning ? (
                <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <ScanBarcode className="w-12 h-12" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsContinuous(!isContinuous)}
              className={cn(
                "flex flex-col items-center gap-2 transition-all active:scale-90 group",
                isContinuous ? "text-blue-600" : "text-slate-400"
              )}
            >
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all group-hover:scale-110",
                isContinuous ? "bg-blue-50 border-blue-200 shadow-inner" : "bg-slate-50 border-slate-100"
              )}>
                <RefreshCw className={cn("w-6 h-6", isContinuous && "animate-spin-slow")} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">{isContinuous ? 'Auto On' : 'Auto Off'}</span>
            </button>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            {isContinuous && (
              <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full animate-pulse border border-blue-100">
                <Zap className="w-3 h-3 fill-current" />
                <span className="text-[10px] font-black uppercase tracking-widest">Turbo Mode Active</span>
              </div>
            )}
            <p className="text-sm font-bold text-slate-500">
              {isScanning ? 'AI is analyzing...' : isContinuous ? 'Scanning automatically...' : 'Capture or upload a photo'}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
